import { useContext, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Overlay,
  Row,
  Spinner,
} from "react-bootstrap";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../App.css";
import AdminLevelContext from "../contexts/AdminLevelContext";

const FIRSTNAME_EMPTY_ERROR = "First Name cannot be empty";
const LASTNAME_EMPTY_ERROR = "Last Name cannot be empty";
const USERNAME_EMPTY_ERROR = "Username cannot be empty";
const USERNAME_TAKEN_ERROR = "Choose a different username";
const PASSWORD_LENGTH_ERROR = "Password must be between 8 and 20 characters";
const PASSWORD_RETYPE_MATCH_ERROR = "Password fields must match";

const Login = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordRetype, setPasswordRetype] = useState<string>("");
  const [error, setError] = useState<string>();
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [showPasswordHelp, setShowPasswordHelp] = useState<boolean>(false);

  const [showFirstNameError, setShowFirstNameError] = useState<boolean>(false);
  const [showLastNameError, setShowLastNameError] = useState<boolean>(false);
  const [showUsernameError, setShowUsernameError] = useState<boolean>(false);
  const [showPasswordError, setShowPasswordError] = useState<boolean>(false);
  const [showPasswordRetypeError, setShowPasswordRetypeError] =
    useState<boolean>(false);
  const [passwordRetypeValid, setPasswordRetypeValid] =
    useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [usernameTakenError, setUsernameTakenError] = useState<boolean>(false);

  const { isMobile, setExpandNavbar } = useContext(AdminLevelContext);

  const questionRef = useRef<any>();

  const validateFirstName = () => setShowFirstNameError(!firstNameValidation());
  const firstNameValidation = () => firstName.length !== 0;

  const validateLastName = () => setShowLastNameError(!lastNameValidation());
  const lastNameValidation = () => lastName.length !== 0;

  const validateUsername = () => {
    setShowUsernameError(!usernameValidation());
    setUsernameTakenError(false);
  };
  const usernameValidation = () => username.length !== 0;

  const validatePassword = () => {
    setShowPasswordError(!passwordValidation());
    if (passwordRetype.length !== 0) validatePasswordRetype();
  };
  const passwordValidation = () =>
    password.length >= 8 && password.length <= 20;

  const validatePasswordRetype = () => {
    const passwordRetypeError = !passwordRetypeValidation();
    setShowPasswordRetypeError(passwordRetypeError);
    setPasswordRetypeValid(
      submitted && !passwordRetypeError && !showPasswordError
    );
  };
  const passwordRetypeValidation = () => password === passwordRetype;

  const validateFields = (event: any) => {
    event.preventDefault();
    setSubmitted(true);
    setUsernameTakenError(false);
    const firstNameError = !firstNameValidation();
    const lastNameError = !lastNameValidation();
    const usernameError = !usernameValidation();
    const passwordError = !passwordValidation();
    const reTypePasswordError = !passwordRetypeValidation();

    setShowFirstNameError(firstNameError);
    setShowLastNameError(lastNameError);
    setShowUsernameError(usernameError);
    setShowPasswordError(passwordError);
    setShowPasswordRetypeError(reTypePasswordError);

    if (
      !(
        firstNameError ||
        lastNameError ||
        usernameError ||
        passwordError ||
        reTypePasswordError
      )
    )
      submitNewAccount();
  };

  const submitNewAccount = () => {
    setError(undefined);
    setShowSpinner(true);
    fetch("/createAccount", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstName, lastName, username, password }),
    })
      .then((response) => {
        if (response.redirected) window.location.href = response.url;
        else {
          setShowSpinner(false);
          response.json().then(({ field, message }) => {
            switch (field) {
              case "username":
                setShowUsernameError(true);
                setUsernameTakenError(true);
                break;
              default:
            }
            setError(message);
          });
        }
      })
      .catch((error) => {
        setShowSpinner(false);
        setError(error);
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
          <Card.Text>Create Account</Card.Text>
          <hr style={{ marginLeft: -16, marginRight: -16 }} />
          {error && <Alert variant="danger">Error: {error}</Alert>}
          <div style={{ textAlign: "left" }}>
            <Form onSubmit={validateFields}>
              <Row>
                <Col>
                  <Form.Group className="mb-3" controlId="firstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      required
                      onChange={({ target: { value: firstName } }) => {
                        setShowFirstNameError(false);
                        setFirstName(firstName);
                      }}
                      onBlur={validateFirstName}
                      isValid={submitted && !showFirstNameError}
                      isInvalid={showFirstNameError}
                    />
                    <Form.Control.Feedback type="invalid">
                      {FIRSTNAME_EMPTY_ERROR}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="lastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      required
                      onChange={({ target: { value: lastName } }) => {
                        setShowLastNameError(false);
                        setLastName(lastName);
                      }}
                      onBlur={validateLastName}
                      isValid={submitted && !showLastNameError}
                      isInvalid={showLastNameError}
                    />
                    <Form.Control.Feedback type="invalid">
                      {LASTNAME_EMPTY_ERROR}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  required
                  onChange={({ target: { value: username } }) => {
                    setShowUsernameError(false);
                    setUsername(username);
                  }}
                  onBlur={validateUsername}
                  isValid={submitted && !showUsernameError}
                  isInvalid={showUsernameError}
                />
                <Form.Control.Feedback type="invalid">
                  {usernameTakenError
                    ? USERNAME_TAKEN_ERROR
                    : USERNAME_EMPTY_ERROR}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <div
                  style={{ marginLeft: 4, display: "inline" }}
                  ref={questionRef}
                >
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    color="gray"
                    onClick={() => setShowPasswordHelp(!showPasswordHelp)}
                    style={{ marginRight: 4 }}
                  />
                </div>
                <Overlay
                  target={questionRef.current}
                  show={showPasswordHelp}
                  placement="right"
                >
                  {({
                    placement,
                    arrowProps,
                    show: _show,
                    popper,
                    ...props
                  }) => (
                    <div
                      {...props}
                      style={{
                        backgroundColor: "rgba(100, 100, 100, 0.85)",
                        padding: "0px 8px",
                        color: "white",
                        maxWidth: isMobile ? 200 : 400,
                        borderRadius: 3,
                        ...props.style,
                      }}
                    >
                      {PASSWORD_LENGTH_ERROR}
                    </div>
                  )}
                </Overlay>
                <Form.Control
                  required
                  type="password"
                  onChange={({ target: { value: password } }) => {
                    setShowPasswordError(false);
                    setPassword(password);
                  }}
                  onBlur={validatePassword}
                  isValid={submitted && !showPasswordError}
                  isInvalid={showPasswordError}
                />
                <Form.Control.Feedback type="invalid">
                  {PASSWORD_LENGTH_ERROR}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="password-repeat">
                <Form.Label>Re-type Password</Form.Label>
                <Form.Control
                  required
                  type="password"
                  onChange={({ target: { value: passwordRetype } }) => {
                    setShowPasswordRetypeError(false);
                    setPasswordRetype(passwordRetype);
                  }}
                  onBlur={validatePasswordRetype}
                  isValid={passwordRetypeValid}
                  isInvalid={showPasswordRetypeError}
                />
                <Form.Control.Feedback type="invalid">
                  {PASSWORD_RETYPE_MATCH_ERROR}
                </Form.Control.Feedback>
              </Form.Group>
              <div style={{ textAlign: "center", height: 38 }}>
                {showSpinner ? (
                  <Spinner animation="border" />
                ) : (
                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                )}
              </div>
            </Form>
          </div>
        </Card.Body>
      </Card>
    </header>
  );
};

export default Login;
