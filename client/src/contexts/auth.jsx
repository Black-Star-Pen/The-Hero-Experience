import { createContext, useContext, useState, useMemo } from "react";
import PropTypes from "prop-types";

const StatusContext = createContext();

export function StatusProvider({ children }) {
  const [login, setLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const state = useMemo(
    () => ({ login, setLogin, currentUser, setCurrentUser }),
    [login, setLogin, currentUser, setCurrentUser]
  );
  return (
    <StatusContext.Provider value={state}>{children}</StatusContext.Provider>
  );
}

StatusProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useStatus = () => useContext(StatusContext);
