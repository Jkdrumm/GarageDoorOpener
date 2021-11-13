import { useContext, useEffect, useState, useRef } from "react";
import "../App.css";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import {
  AdminLevel,
  getAdminLevelText,
  checkAdminPermission,
  checkNotOwner,
} from "../model/AdminLevel";
import getServerErrorText from "../model/ServerErrors";
import AdminLevelContext from "../contexts/AdminLevelContext";
import useChangesService from "../services/useChangesService";

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
  const { hasUnsavedChanges, handleUnsavedChange } = useChangesService();
  const [accountData, setAccountData] = useState(initialState.current);
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
              {error && <Alert variant="danger">Error: {error}</Alert>}
              <Form style={isMobile ? { textAlign: "left" } : {}}>
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
                      <>
                        <Form.Select
                          aria-label="Default select example"
                          onChange={({ target: { value } }) => {
                            console.log(typeof value);
                            handleChange("level", value);
                          }}
                        >
                          {Object.values(AdminLevel)
                            .filter((level) => level !== AdminLevel.OWNER)
                            .map((level) => (
                              <option
                                key={level}
                                value={level}
                                selected={level === accountData.level}
                              >
                                {getAdminLevelText(level)}
                              </option>
                            ))}
                        </Form.Select>
                        {hasUnsavedChanges && (
                          <Button variant="primary" type="submit">
                            Submit Changes
                          </Button>
                        )}
                      </>
                    ) : (
                      <Form.Control
                        value={getAdminLevelText(accountData.level)}
                        readOnly
                      />
                    )}
                  </Col>
                </Form.Group>
              </Form>
            </>
          ) : (
            <Spinner animation="border" />
          )}
        </Card.Body>
      </Card>
    </header>
  );
};

export default Account;
