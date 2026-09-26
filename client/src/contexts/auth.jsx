import { createContext, use, useState, useMemo } from "react";
import PropTypes from "prop-types";

const StatusContext = createContext();

export function StatusProvider({ children }) {
  const [login, setLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const state = useMemo(
    () => ({ login, setLogin, currentUser, setCurrentUser }),
    [login, setLogin, currentUser, setCurrentUser]
  );
  return <StatusContext value={state}>{children}</StatusContext>;
}

StatusProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Temporary client-side session, replaced by server sessions later on.
// eslint-disable-next-line react-refresh/only-export-components
export const useStatus = () => use(StatusContext);
