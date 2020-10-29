import React, { Component } from 'react'

import { ParticleProps, ParticleState } from './Particle.types'

class Particle extends Component<ParticleProps, ParticleState> {
  state: ParticleState

  static defaultProps = {
    x: 0,
    y: 0,
    radius: 3,
    fill: "red"
  }

  constructor(props: ParticleProps) {
    super(props)
    this.state = {
      x: this.props.x,
      y: this.props.y
    }
  }

  componentDidMount() {

  }

  render() {
    return (
      <circle className="particle"
              style={{transformOrigin: `${this.props.x}px ${this.props.y}px`}}
              cx={this.props.x}
              cy={this.props.y}
              r={this.props.radius}
              fill={this.props.fill} ></circle>
    )
  }
}

export default Particle