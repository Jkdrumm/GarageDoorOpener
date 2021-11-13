import { useEffect, useContext } from "react";
import ChangesContext from "../contexts/ChangesContext";

const useChangesService = () => {
  const context = useContext(ChangesContext);
  useEffect(() => {}, [context]);
  return context;
};

export default useChangesService;
