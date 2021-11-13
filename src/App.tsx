import Home from "./pages/Home";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import UserSettings from "./pages/UserSettings";
import NotFound from "./pages/NotFound";
import Paths from "./model/Paths";
import GarageNavbar from "./components/GarageNavbar";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AdminLevelProvider from "./contexts/AdminLevelProvider";
import ChangesService from "./services/ChangesService";

const App = () => {
  return (
    <div className="App">
      <AdminLevelProvider>
        <ChangesService>
          <Router>
            <Routes>
              <Route
                path={Paths.LOGIN}
                element={
                  <>
                    <GarageNavbar path={Paths.LOGIN} />
                    <Login />
                  </>
                }
              />
              <Route
                path={Paths.CREATE_ACCOUNT}
                element={
                  <>
                    <GarageNavbar path={Paths.CREATE_ACCOUNT} />
                    <CreateAccount />
                  </>
                }
              />
              <Route
                path={Paths.ACCOUNT}
                element={
                  <>
                    <GarageNavbar path={Paths.ACCOUNT} />
                    <Account />
                  </>
                }
              />
              <Route
                path={Paths.SETTINGS}
                element={
                  <>
                    <GarageNavbar path={Paths.SETTINGS} />
                    <Settings />
                  </>
                }
              />
              <Route
                path={Paths.USER_SETTINGS}
                element={
                  <>
                    <GarageNavbar path={Paths.USER_SETTINGS} />
                    <UserSettings />
                  </>
                }
              />
              <Route
                path={Paths.HOME}
                element={
                  <>
                    <GarageNavbar path={Paths.HOME} />
                    <Home />
                  </>
                }
              />
              <Route
                element={
                  <>
                    <GarageNavbar path={""} />
                    <NotFound />
                  </>
                }
              />
            </Routes>
          </Router>
        </ChangesService>
      </AdminLevelProvider>
    </div>
  );
};

export default App;
