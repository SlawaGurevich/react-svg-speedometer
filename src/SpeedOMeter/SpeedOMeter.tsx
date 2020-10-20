import React, { Component } from "react";

import { SpeedOMeterProps } from "./SpeedOMeter.types";

import "./SpeedOMeter.scss";

class SpeedOMeter extends Component<SpeedOMeterProps> {
  theme: string;

  constructor(props) {
    super(props)
    this.theme = props.theme
  }

  render() {
    return (
      <div
      data-testid="speedometer-component"
      className={`speedometer-component speedometer-component-${this.theme}`}
    >
      <svg className="speedometer__canvas"
        width="100%"
        height="100%">
        <circle className="speedometer__inner-ring"
                cx="50%"
                cy="50%"
                r="100"
                fill="transparent"
                stroke-width="2"
                stroke="white" />
      </svg>
    </div>
    )
  }
};

export default SpeedOMeter;