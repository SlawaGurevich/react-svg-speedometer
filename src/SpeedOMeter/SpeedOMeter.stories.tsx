import React from "react";
import SpeedOMeter from './SpeedOMeter';

export default {
  title: "SpeedOMeter"
};

export const Default = () => <SpeedOMeter maxSpeed={100} startFromSpeed={80} speedLimit={65} />;

export const NoProps = () => <SpeedOMeter />;
