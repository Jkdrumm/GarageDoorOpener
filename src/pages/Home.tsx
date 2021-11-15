import { useContext } from "react";
import "../App.css";
import { useCallback, useEffect, useState, useRef, Fragment } from "react";
import { Alert, Button, Card, Spinner } from "react-bootstrap";
import AdminLevel from "../model/AdminLevel";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AdminLevelContext from "../contexts/AdminLevelContext";

const VIEWER_WARNING_TEXT =
  "You do not have permission to move the garage door, you may only see it's state. If this an error, please contact your system administrator";
const ACCOUNT_WARNING_TEXT =
  "You do not have permission to view the garage door's status. If this an error, please contact your system administrator";

const Home = () => {
  const [doorState, setDoorState] = useState<string>(GarageState.FETCHING);

  const { adminLevel, isMobile, setExpandNavbar } =
    useContext(AdminLevelContext);

  const websocket = useRef<any>();

  const timeoutWebsocket = () => {
    setDoorState(GarageState.SESSION_TIMEOUT);
    if (websocket.current) {
      websocket.current.sessionTimeout = true;
      websocket.current.close();
    }
  };

  const connectWebSocket = useCallback(() => {
    websocket.current = new WebSocket(
      `${window.location.protocol === "https:" ? "wss" : "ws"}://${
        window.location.host
      }/ws`
    );
    websocket.current.onmessage = (event: any) => {
      switch (event.data) {
        case GarageState.OPEN:
        case GarageState.CLOSED:
          setDoorState(event.data);
          break;
        case "OPENING":
        case "CLOSING":
          setDoorState(GarageState.UNKNOWN);
          break;
        case GarageState.SESSION_TIMEOUT:
          timeoutWebsocket();
          break;
        default:
          const sessionTimeoutLength = Number(event.data);
          if (!isNaN(sessionTimeoutLength))
            setTimeout(timeoutWebsocket, sessionTimeoutLength);
          else console.warn(`Unknown data: ${event.data}`);
      }
    };
    websocket.current.onerror = (error: any) => console.error(error);
    websocket.current.onclose = () => {
      if (websocket.current.sessionTimeout !== true) {
        setDoorState(GarageState.FETCHING);
        setTimeout(connectWebSocket, 10000);
      }
    };
  }, [websocket]);

  useEffect(() => {
    if (adminLevel >= AdminLevel.VIEWER) connectWebSocket();
  }, [adminLevel, connectWebSocket]);

  const getDoorStatusText = () => {
    switch (doorState) {
      case GarageState.FETCHING:
        return "Fetching Garage Door Status...";
      default:
        return `The Garage Door is ${doorState}`;
    }
  };

  const pressButton = () => websocket.current?.send("PRESS");

  const getCardBody = () => {
    if (doorState === GarageState.SESSION_TIMEOUT)
      return (
        <>
          <hr style={{ marginLeft: -16, marginRight: -16 }} />
          <Alert variant="warning">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              color="orange"
              size="2x"
            />
            <br />
            Session timed out. Please <a href="/login">login</a> again to
            continue
          </Alert>
        </>
      );
    if (adminLevel >= AdminLevel.VIEWER)
      return (
        <>
          <Card.Text>{getDoorStatusText()}</Card.Text>
          <hr style={{ marginLeft: -16, marginRight: -16 }} />
          {adminLevel === AdminLevel.VIEWER ? (
            <Alert variant="warning">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                color="orange"
                size="2x"
              />
              <br />
              {VIEWER_WARNING_TEXT}
            </Alert>
          ) : doorState !== GarageState.FETCHING ? (
            <Button
              variant="warning"
              size="lg"
              onClick={pressButton}
              style={{ marginTop: 16 }}
            >
              {doorState === GarageState.OPEN ? "Close" : "Open"}
            </Button>
          ) : (
            <Spinner animation="border" />
          )}
        </>
      );
    else
      return (
        <>
          <hr style={{ marginLeft: -16, marginRight: -16 }} />
          <Alert variant="warning">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              color="orange"
              size="2x"
            />
            <br />
            {ACCOUNT_WARNING_TEXT}
          </Alert>
        </>
      );
  };

  return (
    <header
      className="App-body"
      onClick={isMobile ? () => setExpandNavbar(false) : undefined}
    >
      <Card
        style={
          isMobile
            ? { marginTop: 32 }
            : {
                margin: "auto",
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
              }
        }
      >
        <Card.Body
          style={{
            width: isMobile ? window.innerWidth - 16 : 560,
          }}
        >
          <Card.Title>Garage Door Opener v2.0</Card.Title>
          {getCardBody()}
        </Card.Body>
      </Card>
    </header>
  );
};

export const GarageState = Object.freeze({
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  UNKNOWN: "PARTIALLY OPEN/CLOSED",
  FETCHING: "FETCHING",
  SESSION_TIMEOUT: "SESSION TIMED OUT",
});

export default Home;
