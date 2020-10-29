export interface ParticleGeneratorProps {
  active: boolean,
  x: number,
  y: number,
  pps: number,
  maxParticles: number,
  lifetime: number,
  xJitter: number,
  yJitter: number,
  radius: number,
  radiusJitter: number,
  gravity: number,
  velocity: number,
  generationScale: number,
  fill: string
}

export interface ParticleGeneratorState {
  particles: Array<{x: number, y: number, vx: number, vy: number, velocity: number, radius: number, created: Date}>
}