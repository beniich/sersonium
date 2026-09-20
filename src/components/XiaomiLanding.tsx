import React from "react";
import { EnterpriseArchitectureLanding } from "./EnterpriseArchitectureLanding";
import { GlobalState } from "../types";

interface XiaomiLandingProps {
  onSignIn?: () => void;
  onEnterDashboard?: () => void;
  state?: GlobalState;
}

export const XiaomiLanding: React.FC<XiaomiLandingProps> = ({
  onSignIn = () => {},
  onEnterDashboard = () => {},
  state,
}) => {
  return (
    <EnterpriseArchitectureLanding
      onSignIn={onSignIn}
      onEnterDashboard={onEnterDashboard}
      state={state}
    />
  );
};

