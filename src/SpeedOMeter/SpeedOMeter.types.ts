export interface SpeedOMeterProps {
  theme: "dark" | "light";
  maxSpeed?: number;
  speedLimit?: number;
  startFromSpeed?: number;
  radius?: number;
  particleOptions?:{
    pps?: number,
    maxParticles?: number,
    lifetime?: number,
    xJitter?: number,
    yJitter?: number,
    radius?: number,
    radiusJitter?: number,
    gravity?: number,
    velocity?: number,
    generationScale?: number,
    fill?: string
  }
}

export interface SpeedOMeterState {
  width: number;
  height: number;
  speed: number;
  interval?: NodeJS.Timeout;
  spacePressed: boolean;
  selectedGear?: string;
}