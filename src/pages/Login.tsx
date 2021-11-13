import { useContext, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import "../App.css";
import AdminLevelContext from "../contexts/AdminLevelContext";

const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>();
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  const { isMobile, setExpandNavbar } = useContext(AdminLevelContext);

  const login = (event: any) => {
    event.preventDefault();
    if (username.length !== 0 && password.length !== 0) {
      setError(undefined);
      setShowSpinner(true);
      fetch("/login", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
        .then((response) => {
          if (response.redirected) window.location.href = response.url;
          else {
            setShowSpinner(false);
            response.json().then(({ message }) => setError(message));
          }
        })
        .catch((error) => {
          setShowSpinner(false);
          setError(error);
        });
    } else setError("Missing credentials");
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
          <Card.Text>Login</Card.Text>
          <hr style={{ marginLeft: -16, marginRight: -16 }} />
          {error && <Alert variant="danger">Error: {error}</Alert>}
          <Form onSubmit={login}>
            <InputGroup style={{ width: 250, margin: "auto" }}>
              <InputGroup.Text>Username</InputGroup.Text>
              <Form.Control
                onChange={({ target: { value: username } }) => {
                  setUsername(username);
                }}
              />
            </InputGroup>
            <InputGroup style={{ width: 250, margin: "auto", marginTop: 16 }}>
              <InputGroup.Text>Password&nbsp;</InputGroup.Text>
              <Form.Control
                type="password"
                onChange={({ target: { value: password } }) => {
                  setPassword(password);
                }}
              />
            </InputGroup>
            <div style={{ marginTop: 16, height: 38 }}>
              {showSpinner ? (
                <Spinner animation="border" />
              ) : (
                <Button variant="primary" type="submit">
                  Login
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>
    </header>
  );
};

export default Login;
