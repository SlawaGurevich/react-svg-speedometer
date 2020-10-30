import React from "react";
import renderer from 'react-test-renderer';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import SpeedOMeter from "./SpeedOMeter";
import { SpeedOMeterProps } from "./SpeedOMeter.types";

let props: SpeedOMeterProps;
let container = null;

beforeEach(() => {
  // build up
  props = {
    startFromSpeed: 20,
    speedLimit: 65,
    maxSpeed: 100
  };
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exit
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe("SpeedOMeter Component", () => {

  test('snapshot test', () => {
    const component = renderer.create(<SpeedOMeter />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});