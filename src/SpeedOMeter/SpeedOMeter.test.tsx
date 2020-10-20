import React from "react";
import { render } from "@testing-library/react";

import SpeedOMeter from "./SpeedOMeter";
import { SpeedOMeterProps } from "./SpeedOMeter.types";

describe("Test Component", () => {
  let props: SpeedOMeterProps;

  beforeEach(() => {
    props = {
      theme: "dark"
    };
  });

  const renderComponent = () => render(<SpeedOMeter {...props} />);

  it("should have dark className with default props", () => {
    const { getByTestId } = renderComponent();

    const speedOMeterComponent = getByTestId("speedometer-component");

    expect(speedOMeterComponent).toHaveClass("speedometer-component-dark");
  });

  it("should have secondary className with theme set as secondary", () => {
    props.theme = "light";
    const { getByTestId } = renderComponent();

    const speedOMeterComponent = getByTestId("speedometer-component");

    expect(speedOMeterComponent).toHaveClass("speedometer-component-light");
  });
});