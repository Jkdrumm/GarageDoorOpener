import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import Paths from "../model/Paths";
import AdminLevel from "../model/AdminLevel";
import { useContext } from "react";
import AdminLevelContext from "../contexts/AdminLevelContext";

const HOME_TEXT = "Home";
const LOGIN_TEXT = "Login";
const LOGOUT_TEXT = "Logout";
const CREATE_ACCOUNT_TEXT = "Create Account";
const ACCOUNT_TEXT = "Account";
const ADMIN_TEXT = "Admin";
const SETTINGS_TEXT = "Settings";
const USER_SETTINGS_TEXT = "User Settings";

const GarageNavbar = ({ path }: { path: string }) => {
  const { adminLevel, loggedIn, isMobile, expandNavbar, setExpandNavbar } =
    useContext(AdminLevelContext);

  const comparePath = (navPath: string) =>
    `${path === navPath ? "#" : navPath}`;

  return (
    <Navbar
      collapseOnSelect
      expand="sm"
      bg="dark"
      variant="dark"
      expanded={!isMobile || expandNavbar}
    >
      <Container>
        <Navbar.Brand href={comparePath(Paths.HOME)}>Garage Door</Navbar.Brand>
        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          onClick={isMobile ? () => setExpandNavbar(!expandNavbar) : undefined}
        />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {loggedIn ? (
              <>
                <Nav.Link href={comparePath(Paths.HOME)}>{HOME_TEXT}</Nav.Link>
                <Nav.Link href={comparePath(Paths.ACCOUNT)}>
                  {ACCOUNT_TEXT}
                </Nav.Link>
                {adminLevel >= AdminLevel.ADMIN && (
                  <NavDropdown title={ADMIN_TEXT} id="collasible-nav-dropdown">
                    <NavDropdown.Item href={comparePath(Paths.SETTINGS)}>
                      {SETTINGS_TEXT}
                    </NavDropdown.Item>
                    <NavDropdown.Item href={comparePath(Paths.USER_SETTINGS)}>
                      {USER_SETTINGS_TEXT}
                    </NavDropdown.Item>
                  </NavDropdown>
                )}
              </>
            ) : (
              <>
                <Nav.Link href={comparePath(Paths.LOGIN)}>
                  {LOGIN_TEXT}
                </Nav.Link>
                <Nav.Link href={comparePath(Paths.CREATE_ACCOUNT)}>
                  {CREATE_ACCOUNT_TEXT}
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            <Nav.Link href={comparePath(Paths.LOGOUT)}>{LOGOUT_TEXT}</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default GarageNavbar;
