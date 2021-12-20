import { useContext, useRef } from "react";
import "../App.css";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Container,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import AdminLevelContext from "../contexts/AdminLevelContext";
import useChangesService from "../services/useChangesService";
import getServerErrorText from "../model/ServerErrors";

type DownloadState = "None" | "Downloading" | "Complete";

const Settings = () => {
  const initialState = useRef({
    upToDate: false,
    currentVersion: "",
    remoteVersion: "",
  });
  const { hasUnsavedChanges, handleUnsavedChange, submitChanges } =
    useChangesService();
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);
  const [downloadState, setDownloadState] = useState<DownloadState>("None");
  const [settings, setSettings] = useState<any>(initialState.current);
  // const [houseName, setHouseName] = useState<string>("");
  const [error, setError] = useState<string>();

  const { adminLevel, loggedIn, isMobile, expandNavbar, setExpandNavbar } =
    useContext(AdminLevelContext);

  useEffect(() => {
    fetch("/currentSettings", {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.redirected) window.location.href = response.url;
        else {
          setSettingsLoaded(true);
          if (response.ok)
            if (response.redirected) window.location.href = response.url;
            else {
              response.json().then((accountData) => {
                if (accountData.message) setError(accountData.message);
                else {
                  initialState.current = accountData;
                  setSettings(accountData);
                }
              });
            }
          else {
            setError(getServerErrorText(response.status));
          }
        }
      })
      .catch((error) => {
        setSettingsLoaded(true);
        setError(error);
      });
  }, []);

  const downloadUpdate = () => {
    fetch("/downloadUpdate", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.redirected) window.location.href = response.url;
      else {
        if (response.ok) {
          setDownloadState("Downloading");
          // getDownloadStatus()
        }
      }
    });
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
          <Card.Text>Admin Panel</Card.Text>
          <hr style={{ marginLeft: -16, marginRight: -16 }} />
          {settingsLoaded ? (
            <>
              {error && <Alert variant="danger">Error: {error}</Alert>}
              <Container>
                <Row>Current Version: {settings.currentVersion}</Row>
                <Row>Newest Version: {settings.remoteVersion}</Row>
                <Row>
                  {downloadState === "None" ? (
                    <Button variant="primary" onClick={downloadUpdate}>
                      Download Update
                    </Button>
                  ) : (
                    <Spinner animation="border" />
                  )}
                </Row>
              </Container>
            </>
          ) : (
            <Spinner animation="border" />
          )}
        </Card.Body>
      </Card>
    </header>
  );
};

export default Settings;
