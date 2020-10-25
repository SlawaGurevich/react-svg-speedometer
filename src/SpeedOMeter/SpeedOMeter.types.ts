export interface SpeedOMeterProps {
  theme: "dark" | "light";
  maxSpeed?: number;
  speedLimit?: number;
  startFromSpeed?: number;
  radius?: number;
}

export interface SpeedOMeterState {
  width: number;
  height: number;
  speed: number;
  interval?: NodeJS.Timeout;
  spacePressed: boolean;
  selectedGear?: string;
}