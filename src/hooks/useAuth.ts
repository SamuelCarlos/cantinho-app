import React from "react";

import { AuthContext } from "../contexts/auth";

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  return context;
};
