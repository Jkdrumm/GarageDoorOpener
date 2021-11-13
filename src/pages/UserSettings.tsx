import { useContext } from "react";
import "../App.css";
import { useEffect, useState } from "react";
import { Alert, Button, Card, Spinner, Table } from "react-bootstrap";
import AdminLevelContext from "../contexts/AdminLevelContext";

const UserSettings = () => {
  const [accountLoaded, setAccountLoaded] = useState<boolean>(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState<string>();

  const { isMobile, setExpandNavbar } = useContext(AdminLevelContext);

  useEffect(() => {
    fetch("/users", {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.redirected) window.location.href = response.url;
        else {
          setAccountLoaded(true);
          response
            .json()
            .then((users) => setUsers(users))
            .catch((error) => {
              setError("Unable to load accounts");
              console.error(response);
            });
        }
      })
      .catch((error) => {
        setAccountLoaded(true);
        setError(error);
      });
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
          <Card.Text>Admin Panel</Card.Text>
          <hr style={{ marginLeft: -16, marginRight: -16 }} />
          {accountLoaded ? (
            <>
              {error && <Alert variant="danger">Error: {error}</Alert>}
              <Table striped bordered hover size={isMobile ? "sm" : undefined}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Username</th>
                    <th>Action</th>
                  </tr>
                </thead>
                {users.map((user: any, index: number) => {
                  return (
                    <tbody key={user.id}>
                      <tr>
                        <td>{index + 1}</td>
                        <td>{user.firstName}</td>
                        <td>{user.lastName}</td>
                        <td>{user.username}</td>
                        <td>
                          <Button
                            variant="secondary"
                            href={`/account?id=${user.id}`}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  );
                })}
              </Table>
            </>
          ) : (
            <Spinner animation="border" />
          )}
        </Card.Body>
      </Card>
    </header>
  );
};

export default UserSettings;
