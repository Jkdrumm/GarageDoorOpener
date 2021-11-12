import { useContext } from "react";
import "../App.css";
import { useEffect, useState } from "react";
import { Alert, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { AdminLevel, getAdminLevelText } from "../model/AdminLevel";
import getServerErrorText from "../model/ServerErrors";
import AdminLevelContext from "../contexts/AdminLevelContext";

const Account = () => {
  const [accountData, setAccountData] = useState();
  const [error, setError] = useState();

  const { adminLevel, isMobile, setExpandNavbar } =
    useContext(AdminLevelContext);

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
              else setAccountData(accountData);
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
                    {adminLevel >= AdminLevel.ADMIN &&
                    (adminLevel !== AdminLevel.OWNER ||
                      !accountData.isCurrentUser) ? (
                      <Form.Select aria-label="Default select example">
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
