import React, { Component } from 'react'

import Particle from './Particle'

import { ParticleGeneratorProps, ParticleGeneratorState } from './ParticleGenerator.types'

import * as CONSTANTS from '../util/constants'

import './ParticleGenerator.scss'

/**
 * Responsible for generating particles.
 * @class
 */
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


  /**
 * Random number generator helper function.
 *
 * Used for generating a random number for the different jitters.
 *
 * @param {number}    min      The minimum value to generate from.
 * @param {number}    max      The maximum value to generate from.
 * @param {boolean}   floor    Whether the number should be floored after generation.
 *
 * @return {number}   The randomly generated number.
 */
  randomNumber(min, max, floor = true) {
    return floor ? Math.floor(Math.random() * (max - min + 1) + min) : (Math.random() * (max - min + 1) + min)
  }


/**
 * Generates a particle.
 *
 * This function is called on every cycle to generate particles and add them to the global array.
 *
 */
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


/**
 * Moves all particles.
 *
 * The particles are moved according to their saved properties, based on velocity, gravity and position.
 *
 */
  moveParticles() {
    // Only do that, if there are particles to move
    if( this.state.particles.length > 0) {
      // Map all particles to their new positions and return
      let movedParticles = this.state.particles.map(particle => {
        particle.x += (particle.velocity * particle.vx);
        particle.y += (particle.velocity * particle.vy + this.props.gravity);
        return particle
      })

      // If the component is mounted
      if(this._isMounted) {
        // Set the new particles
        this.setState({
          particles: movedParticles
        })
      }
    }
  }


  /**
 * Checks the particles.
 *
 * Checks whether particles have expired and removes them if they are over their lifetime.
 *
 */
  checkParticles() {
    // Filter the particles, removing ones that are exired
    let filteredParticles = this.state.particles.filter( particle => {
      return new Date().getTime() - particle.created.getTime() < this.props.lifetime
    })

    // If the component is mounted
    if(this._isMounted) {
      // Set the new particles
      this.setState({
        particles: filteredParticles
      })
    }
  }

  render() {
    return (
      this.state.particles.map( (particle, i) => (
        <Particle key={i}
                  x={particle.x}
                  y={particle.y}
                  radius={particle.radius}
                  fill={this.props.fill}/>
      ))
    )
  }
}

export default ParticleGenerator
