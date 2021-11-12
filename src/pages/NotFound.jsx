import { useContext } from "react";
import { Alert, Card } from "react-bootstrap";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../App.css";
import AdminLevelContext from "../contexts/AdminLevelContext";

const NotFound = () => {
  const { isMobile, setExpandNavbar } = useContext(AdminLevelContext);
  return (
    <header
      className="App-body"
      onClick={isMobile ? () => setExpandNavbar(false) : null}
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
          <Card.Text>404 - Not Found</Card.Text>
          <hr style={{ marginLeft: -16, marginRight: -16 }} />
          <Alert variant="danger">
            <FontAwesomeIcon icon={faExclamationCircle} color="red" size="2x" />
            <br />
            Error: Page Not Found
          </Alert>
        </Card.Body>
      </Card>
    </header>
  );
};

export default NotFound;
