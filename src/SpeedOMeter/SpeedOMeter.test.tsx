import React from "react";
import { render } from "@testing-library/react";

import SpeedOMeter from "./SpeedOMeter";
import { SpeedOMeterProps } from "./SpeedOMeter.types";

describe("SpeedOMeter Component", () => {
  let props: SpeedOMeterProps;

  beforeEach(() => {
    props = {
      startFromSpeed: 65
    };
  });

  const renderComponent = () => render(<SpeedOMeter {...props} />);

  it("Start speed should be reflected in component.", () => {
    const { getByTestId } = renderComponent();

    const speedLabel = getByTestId("speedometer__current-speed");

    expect(speedLabel.innerText).toBe(props.startFromSpeed)
  });

  it("should have secondary className with theme set as secondary", () => {
    const { getByTestId } = renderComponent();

    const speedOMeterComponent = getByTestId("speedometer-component");

    expect(speedOMeterComponent).toHaveClass("speedometer-component-light");
  });
});