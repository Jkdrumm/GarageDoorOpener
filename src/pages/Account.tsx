import { useContext, useEffect, useState, useRef } from "react";
import "../App.css";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import AdminLevel, {
  getAdminLevelText,
  checkAdminPermission,
  checkNotOwner,
} from "../model/AdminLevel";
import getServerErrorText from "../model/ServerErrors";
import AdminLevelContext from "../contexts/AdminLevelContext";
import useChangesService from "../services/useChangesService";
import queryString from "query-string";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type accountFields =
  | "firstName"
  | "lastName"
  | "username"
  | "level"
  | "isCurrentUser";

const Account = () => {
  let initialState = useRef({
    firstName: "",
    lastName: "",
    username: "",
    level: 0,
    isCurrentUser: false,
  });
  const { hasUnsavedChanges, handleUnsavedChange, submitChanges } =
    useChangesService();
  const [accountData, setAccountData] = useState(initialState.current);
  const [sendingData, setSendingData] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const { adminLevel, isMobile, setExpandNavbar } =
    useContext(AdminLevelContext);
  const handleChange = (field: accountFields, value: string) => {
    setAccountData((prevState: any) => ({ ...prevState, [field]: value }));
    handleUnsavedChange(field, value, initialState.current[field].toString());
  };

  useEffect(() => {
    fetch(`/accountDetails${window.location.search}`, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok)
          if (response.redirected) window.location.href = response.url;
          else {
            response.json().then((accountData) => {
              if (accountData.message) setError(accountData.message);
              else {
                initialState.current = accountData;
                setAccountData(accountData);
              }
            });
          }
        else {
          setError(getServerErrorText(response.status));
        }
      })
      .catch((error) => setError(error));
  }, []);

  const submitAccountChanges = (event: any) => {
    event.preventDefault();
    setSendingData(true);
    submitChanges("accountDetails", accountData, {
      id: queryString.parse(window.location.search).id,
    })
      .then((response: any) => {
        if (response.redirected) window.location.href = response.url;
        else {
          setSendingData(false);
          if (response.ok) {
            initialState.current = accountData;
            setShowToast(true);
          } else {
            response
              .json()
              .then(
                ({ field, message }: { field: string; message: string }) => {
                  switch (field) {
                    case "username":
                      // setShowUsernameError(true);
                      // setUsernameTakenError(true);
                      break;
                    default:
                  }
                  setError(message);
                }
              );
          }
        }
      })
      .catch((error: any) => {
        console.error(error);
        setError(error);
        setSendingData(false);
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
          <Card.Text>Account Information</Card.Text>
          <hr style={{ marginLeft: -16, marginRight: -16 }} />
          {accountData ? (
            <>
              {error ? (
                <Alert variant="danger">Error: {error}</Alert>
              ) : (
                <Form
                  onSubmit={submitAccountChanges}
                  style={isMobile ? { textAlign: "left" } : undefined}
                >
                  <Form.Group as={Row} className="mb-3" controlId="firstName">
                    <Form.Label column sm="3">
                      First Name
                    </Form.Label>
                    <Col sm="9">
                      <Form.Control value={accountData.firstName} readOnly />
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row} className="mb-3" controlId="lastName">
                    <Form.Label column sm="3">
                      Last Name
                    </Form.Label>
                    <Col sm="9">
                      <Form.Control value={accountData.lastName} readOnly />
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row} className="mb-3" controlId="username">
                    <Form.Label column sm="3">
                      Username
                    </Form.Label>
                    <Col sm="9">
                      <Form.Control value={accountData.username} readOnly />
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row} className="mb-3" controlId="adminLevel">
                    <Form.Label column sm="3">
                      Admin Level
                    </Form.Label>
                    <Col sm="9">
                      {adminLevel &&
                      checkAdminPermission(adminLevel) &&
                      (checkNotOwner(adminLevel) ||
                        !accountData.isCurrentUser) ? (
                        <Form.Select
                          aria-label="Default select example"
                          onChange={({ target: { value } }) =>
                            handleChange("level", value)
                          }
                          disabled={sendingData}
                          value={accountData.level}
                        >
                          {Object.values(AdminLevel)
                            .filter((level) => level !== AdminLevel.OWNER)
                            .map((level) => (
                              <option key={level} value={level}>
                                {getAdminLevelText(level)}
                              </option>
                            ))}
                        </Form.Select>
                      ) : (
                        <Form.Control
                          value={getAdminLevelText(accountData.level)}
                          readOnly
                        />
                      )}
                    </Col>
                    {hasUnsavedChanges && (
                      <div style={{ marginTop: 16, height: 38 }}>
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={sendingData}
                        >
                          Submit Changes
                        </Button>
                      </div>
                    )}
                  </Form.Group>
                </Form>
              )}
            </>
          ) : (
            <Spinner animation="border" />
          )}
        </Card.Body>
      </Card>
      <ToastContainer className="p-3" position="bottom-center">
        <Toast
          delay={5000}
          onClose={() => setShowToast(false)}
          show={showToast}
          autohide
        >
          <Toast.Header>
            <FontAwesomeIcon
              icon={faCheckCircle}
              color="green"
              style={{ marginRight: 4 }}
            />
            <strong className="me-auto">Admin</strong>
            <small>Just now</small>
          </Toast.Header>
          <Toast.Body>Changes saved successfully</Toast.Body>
        </Toast>
      </ToastContainer>
    </header>
  );
};

export default Account;
