import React, { Component } from 'react'

import Particle from './Particle'

import { ParticleGeneratorProps, ParticleGeneratorState } from './ParticleGenerator.types'

import * as CONSTANTS from '../util/constants'

import './ParticleGenerator.scss'

class ParticleGenerator extends Component<ParticleGeneratorProps, ParticleGeneratorState> {
  state: ParticleGeneratorState
  _isMounted: boolean = false

  static defaultProps = {
    active: false,
    x: 0,
    y: 0,
    pps: 500,
    maxParticles: 1000,
    lifetime: 500,
    xJitter: 10,
    yJitter: 10,
    radius: 1,
    radiusJitter: 0,
    gravity: -15,
    velocity: 1,
    generationScale: 1,
    fill: CONSTANTS.colorWarnBright
  }

  constructor(props: ParticleGeneratorProps) {
    super(props)

    this.state = {
      particles: []
    }
  }

  randomNumber(min, max, floor = true) {
    return floor ? Math.floor(Math.random() * (max - min + 1) + min) : (Math.random() * (max - min + 1) + min)
  }

  componentDidMount() {
    this._isMounted = true

    setInterval(() => {
      for(var i = 0; i < this.props.generationScale; i++) {
        this.generateParticle()
      }
    }, 1000 / this.props.pps)

    setInterval(() => {
      this.moveParticles()
      this.checkParticles()
    }, 50)
  }

  generateParticle() {
    if ( this.props.active && this.state.particles.length < this.props.maxParticles ) {
      let newParticle = {
        x: Math.round( this.props.x + this.randomNumber(-this.props.xJitter, this.props.xJitter) ),
        y: Math.round( this.props.y + this.randomNumber(-this.props.yJitter, this.props.yJitter) ),
        vx: this.randomNumber(-1, 1, false),
        vy: this.randomNumber(-1, 1, false),
        radius: this.props.radiusJitter === 0 ? this.props.radius : this.randomNumber(0, this.props.radius + this.props.radiusJitter, true),
        velocity: this.randomNumber(-8, 8),
        created: new Date()
      }

      let copiedParticlesInState = [...this.state.particles]
      copiedParticlesInState.push(newParticle)

      if(this._isMounted) {
        this.setState({
          particles: copiedParticlesInState
        })
      }
    }
  }

  moveParticles() {
    if( this.state.particles.length > 0) {
      let movedParticles = this.state.particles.map(particle => { particle.x += (particle.velocity * particle.vx); particle.y += (particle.velocity * particle.vy + this.props.gravity); return particle })
      if(this._isMounted) {
        this.setState({
          particles: movedParticles
        })
      }
    }
  }

  checkParticles() {
    let filteredParticles = this.state.particles.filter( particle => { return new Date().getTime() - particle.created.getTime() < this.props.lifetime } )
    if(this._isMounted) {
      this.setState({
        particles: filteredParticles
      })
    }
  }

  render() {
    return (
      this.state.particles.map( (particle, i) => (
        <Particle key={i} x={particle.x} y={particle.y} radius={particle.radius} fill={this.props.fill}/>
      ))
    )
  }
}

export default ParticleGenerator