import React from "react";
import SpeedOMeter from './SpeedOMeter';

export default {
  title: "SpeedOMeter"
};

export const Dark = () => <SpeedOMeter startFromSpeed={100} theme="dark" />;

export const Light = () => <SpeedOMeter theme="light" />;
