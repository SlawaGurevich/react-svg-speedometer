import React, { Component, createRef } from "react";
import Color from 'color'

import * as CONSTANTS from '../util/constants'

import { SpeedOMeterProps, SpeedOMeterState } from "./SpeedOMeter.types";
import ParticleGenerator from '../ParticleGenerator/ParticleGenerator'
import "./SpeedOMeter.scss";

// GearLabel component for rendering the gear switcher
const GearLabel = ({options}) => {
  let optionParams = {
    pos: options.pos || {x: 0, y: 0},
    gear: options.gear || "X",
    activeColor: options.activeColor || "white",
    activeTextColor: options.activeTextColor || "white",
    active: options.active || false
  }

  return(
    <g className="speedometer__gear-container hidden">
      <g className={`speedometer__gear hidden ${optionParams.active ? "speedometer__gear--selected" : "" }`}>
        <text className="speedometer__gear-label"
              fill={ optionParams.active ? optionParams.activeTextColor : CONSTANTS.colorGray }
              dominantBaseline="middle"
              textAnchor="middle" {...optionParams.pos}>
                {optionParams.gear}
        </text>
        <circle className="speedometer__gear-circle"
                transform="translate(0, -3)"
                r={50}
                cx={optionParams.pos.x}
                cy={optionParams.pos.y}
                fill="none"
                stroke={optionParams.activeColor}></circle>
      </g>
    </g>
  )
}

// Component to render the particles attached to the tip of the gauge
const AttachedParticle = ({options}) => {
  let optionParams = {
    pos: options.pos || 300,
    r1: options.r1 || 2,
    r2: options.r2 || 4,
    startColor: options.startColor || "back",
    endColor: options.endColor || "white",
    animationDuration: options.animationDuration || 500
  }

  return(
    <circle className="attached-particle"
      r={optionParams.r1}
      cx={optionParams.pos.x}
      cy={optionParams.pos.y}
      fill={optionParams.startColor}>
      <animate attributeName="r" values={`${optionParams.r1};${optionParams.r2};${optionParams.r1}`} dur={`${optionParams.animationDuration}ms`} repeatCount="indefinite"></animate>
      <animate attributeName="fill" from={optionParams.startColor} to={optionParams.endColor} dur={`${optionParams.animationDuration}ms`} repeatCount="indefinite"></animate>
    </circle>
  )
}

class SpeedOMeter extends Component<SpeedOMeterProps, SpeedOMeterState> {
  state: SpeedOMeterState

  colorWarnDynamic = () => {
    return Color(CONSTANTS.colorWarn).mix(Color("red"), (this.state.speed > this.props.speedLimit ? .8 * (this.state.speed - this.props.speedLimit) / (this.props.maxSpeed - this.props.speedLimit) : 0 ) )
  }

  colorWarnBrightDynamic = () => {
    return Color(CONSTANTS.colorWarnBright).mix(Color("red"), (this.state.speed > this.props.speedLimit ? .8 * (this.state.speed - this.props.speedLimit) / (this.props.maxSpeed - this.props.speedLimit) : 0 ) )
  }

  colorHighlightDynamic = () => {
    return Color(CONSTANTS.colorHighlight).darken(`${.3 * this.state.speed / this.props.maxSpeed}`)
  }

  colorHighlightBrightDynamic = () => {
    return Color(CONSTANTS.colorHighlightBright).darken(`${.1 * this.state.speed / this.props.maxSpeed}`)
  }

  // Instance variables
  _isMounted: boolean = false
  parentRef: React.RefObject<SVGSVGElement>
  backgroundRingPathRef: React.RefObject<SVGPathElement>
  speedIndicatorRingPathRef: React.RefObject<SVGPathElement>
  speedIndicatorShinePathRef: React.RefObject<SVGPathElement>

  // default props
  static defaultProps = {
    maxSpeed: 100,
    speedLimit: 65,
    startFromSpeed: 0,
    radius: 300,
    particleOptions: {}
  }

  // gears
  gears:Array<string> = [
    "R", "N", "D", "P", "B"
  ]


  constructor(props: SpeedOMeterProps) {
    super(props)
    this.parentRef = React.createRef<SVGSVGElement>()
    this.backgroundRingPathRef = React.createRef<SVGPathElement>()
    this.speedIndicatorRingPathRef = React.createRef<SVGPathElement>()
    this.speedIndicatorShinePathRef = React.createRef<SVGPathElement>()

    this.handleKeypress = this.handleKeypress.bind(this)

    this.state = {
      width: 0,
      height: 0,
      speed: this.props.startFromSpeed,
      spacePressed: false,
      selectedGear: "N",
      interval: null
    }
  }

  componentDidMount() {
    this._isMounted = true
    if (this.parentRef.current && this._isMounted) {
      this.setState({
        width: this.parentRef.current.clientWidth / 2,
        height: this.parentRef.current.clientHeight / 2
      })
    }

    window.addEventListener("keydown", this.handleKeypress)
    window.addEventListener("keyup", this.handleKeypress)

    this.fadeInGears()
  }

  // Key handler
  handleKeypress(evt) {
    if (evt.key == " " && this._isMounted) {
      evt.preventDefault()

      if (evt.type == "keydown" && !this.state.spacePressed && this.state.selectedGear !== "P") {
        clearInterval(this.state.interval)
        this.setState({
          interval: window.setInterval(() => {
            this.setState({
              speed: this.state.speed < this.props.maxSpeed ? this.state.speed + 1 : this.state.speed,
              spacePressed: true
            })
          }, 100)
        })
      } else if (evt.type == "keyup" && this.state.spacePressed && this.state.interval) {
        clearInterval(this.state.interval)
        this.setState(
          {
            spacePressed: false,
            interval: window.setInterval(() => {
                this.setState({
                  speed: this.state.speed - 1
                })

                if (this.state.speed == 0) {
                  clearInterval(this.state.interval)
                  this.setState({
                    speed: 0,
                    interval: null
                  })
                }
              }, 50)
          }
        )
      }
    } else if (evt.key == "ArrowUp" && evt.type == "keydown") {
      evt.preventDefault()
      if( this.gears.indexOf(this.state.selectedGear) > 0) {
        this.setState({
          selectedGear: this.gears[this.gears.indexOf(this.state.selectedGear) - 1]
        })
      }
    }  else if (evt.key == "ArrowDown" && evt.type == "keydown") {
      evt.preventDefault()
      if( this.gears.indexOf(this.state.selectedGear) != (this.gears.length - 1) ) {
        this.setState({
          selectedGear:  this.gears[this.gears.indexOf(this.state.selectedGear) + 1]
        })
      }
    }
  }

  // Animation related functions
  fadeInGears() {
    let gears = document.querySelectorAll(".speedometer__gear")

    for( let i = 0; i < gears.length; i++){
      setTimeout(() => { gears[i].parentElement.classList.remove("hidden") }, 150 * i)
    }
  }

  // Check whether the current speed is over the speed limit
  overSpeedLimit() {
    return (this.state.speed > this.props.speedLimit)
  }

  dangerZone() {
    return (this.state.speed > (this.props.speedLimit + (this.props.maxSpeed - this.props.speedLimit) / 1.5 ) )
  }

  // Get total length of a path
  getTotalRingLength(ref) {
    if(ref.current){
      return ref.current.getTotalLength()
    }
  }

  // Return the current offset for rendering the active speed ring
  getStrokeDashOffset(ref) {
    return this.getTotalRingLength(ref) - (this.getTotalRingLength(ref) * this.state.speed / this.props.maxSpeed)
  }

  // Get the offset for the shine path
  getStrokeDashOffsetShine(ref) {
    return this.mapRange([0, this.getTotalRingLength(ref)], [300, -this.getTotalRingLength(ref) + 300], this.getTotalRingLength(ref) * this.state.speed / this.props.maxSpeed)
  }

  // Get position array for rendering things on the circle
  getPositionOnCircleFromTo(width = 20, fixedValue = this.state.speed / this.props.maxSpeed) {
    let from = {
      x: (this.props.radius - width / 2) * -Math.sin( this.mapRange([0, 1], [.14, .86], fixedValue) * 2 * Math.PI ),
      y: (this.props.radius - width / 2) * Math.cos( this.mapRange([0, 1], [.14, .86], fixedValue) * 2 * Math.PI )
    }

    let to = {
      x: (this.props.radius + width / 2) * -Math.sin( this.mapRange([0, 1], [.14, .86], fixedValue) * 2 * Math.PI ),
      y: (this.props.radius + width / 2) * Math.cos( this.mapRange([0, 1], [.14, .86], fixedValue) * 2 * Math.PI )
    }


    return {
      from: from, to: to
    }
  }

  // Gets a single point from the circle path
  getPositionOnCircleSinglePoint(radius = this.props.radius, fixedValue = null, offset = 0) {
    return {
      x: radius * -Math.sin( this.mapRange([0, 1], [.14, .86], (fixedValue != null ? fixedValue : this.state.speed / this.props.maxSpeed) + offset) * 2 * Math.PI ),
      y: radius * Math.cos( this.mapRange([0, 1], [.14, .86], (fixedValue != null ? fixedValue : this.state.speed / this.props.maxSpeed) + offset) * 2 * Math.PI )
    }
  }

  /**
 * Calculates the position of the speed limit indicator. The 12pt widht is to insure it lays over the 10pt width of the background ring.
 */
  getSpeedLimitPos() {
    let from = {
      x: (this.props.radius - 11) * -Math.sin(this.mapRange([0, 1], [.14, .86], this.props.speedLimit / this.props.maxSpeed) * 2 * Math.PI),
      y: (this.props.radius - 11) * Math.cos(this.mapRange([0, 1], [.14, .86], this.props.speedLimit / this.props.maxSpeed) * 2 * Math.PI)
    }

    let to = {
      x: (this.props.radius + 10) * -Math.sin(this.mapRange([0, 1], [.14, .86], this.props.speedLimit / this.props.maxSpeed) * 2 * Math.PI),
      y: (this.props.radius + 10) * Math.cos(this.mapRange([0, 1], [.14, .86], this.props.speedLimit / this.props.maxSpeed) * 2 * Math.PI)
    }

    return {
      from: from,
      to: to
    }
  }

  // helper functions

  /**
  * Map a value to from one range to another.
  */
  mapRange (from, to, s) {
    return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
  }

  /**
  * Get position of the gear labels.
  */
  getGearLabelPosition(radius, mod) {
    let x = -radius * this.mapRange([-1, 1], [-0.8, 0.8], Math.cos(mod * 2 * Math.PI) )
    let y = radius * this.mapRange([-1, 1], [-0.8, 0.8], Math.sin(mod * 2 * Math.PI) )

    return {
      x: x,
      y: y
    }
  }

  render() {
    return (
      <div
      data-testid="speedometer-component"
      className="speedometer-component speedometer" >
      <svg className="speedometer__canvas"
        width="100%"
        height="100%"
        viewBox="0 0 1000 850"
        ref={this.parentRef} >

        <defs>
          {/* Gradient definitions */}
          <linearGradient id="background-ring-gradient" width={100} height={100} x1="0" y1="0" x2="0" y2="1">
            <stop offset=".7" stopColor={CONSTANTS.colorGrayDark}>
              <animate attributeName="offset" dur="500ms" from="0" to=".7" repeatCount="1" />
            </stop>
            <stop offset="1" stopColor={CONSTANTS.colorBackground}>
            <animate attributeName="offset" dur="500ms" from="0" to="1" repeatCount="1" />
            </stop>
          </linearGradient>

          <linearGradient id="current-speed-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset=".4" stopColor={this.overSpeedLimit() ? CONSTANTS.colorWarn : CONSTANTS.colorHighlight}></stop>
            <stop offset="1" stopColor={this.overSpeedLimit() ? this.colorWarnBrightDynamic() : CONSTANTS.colorHighlight }></stop>
          </linearGradient>

          <radialGradient id="fade-gradient"
                          cx={ this.getStrokeDashOffsetShine(this.speedIndicatorShinePathRef) > 0 ? this.getPositionOnCircleSinglePoint(300, -.08).x : this.getPositionOnCircleSinglePoint(300, null, -.32).x }
                          cy={ this.getStrokeDashOffsetShine(this.speedIndicatorShinePathRef) > 0 ? this.getPositionOnCircleSinglePoint(300, -.08).y : this.getPositionOnCircleSinglePoint(300, null, -.32).y }
                          r="350"
                          gradientUnits="userSpaceOnUse"
                          spreadMethod="pad">
            <stop offset={.3} stopColor={CONSTANTS.colorBackground} />
            <stop offset={1} stopColor={this.overSpeedLimit() ? this.colorWarnDynamic() : this.colorHighlightDynamic()} />
          </radialGradient>

          {/* Filter */}
          <filter id="particles">
              <feGaussianBlur in="SourceGraphic"stdDeviation="1" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -4" result="goo" />
              <feGaussianBlur in="goo" stdDeviation="1" result="shadow" />
              <feColorMatrix in="shadow" mode="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 -0.2" result="shadow" />
              {/* <feOffset in="shadow" dx="1" dy="1" result="shadow" /> */}
              {/* <feBlend in2="shadow" in="goo" result="goo" /> */}
              <feBlend in2="goo" in="SourceGraphic" result="mix" />
          </filter>

          <filter id="end-blur" height="300%" width="300%" x="-100%" y="-100%" filterUnits="userSpaceOnUse">"
            <feGaussianBlur in="SourceGraphic" stdDeviation={this.overSpeedLimit() ? 5 : 0} result="coloredBlur" />
          </filter>

          <filter id="particle-glow">
          <feDropShadow dx="0"
                          dy="0"
                          in="SourceGraphic"
                          stdDeviation="20"
                          floodColor={ "black" }
                          floodOpacity="1"></feDropShadow>
          </filter>

          <filter id="ring-glow">
            <feDropShadow dx="0"
                          dy="0"
                          in="SourceGraphic"
                          stdDeviation="3"
                          floodColor={ this.overSpeedLimit() ? this.colorWarnBrightDynamic() : this.colorHighlightBrightDynamic() }
                          floodOpacity="1">
                          <animate attributeName="stdDeviation" values="3;7;3" dur="2s" repeatCount="indefinite" />
            </feDropShadow>
          </filter>

          <filter id="shine-blur">
            <feGaussianBlur stdDeviation={1} in="SourceGraphic"></feGaussianBlur>
          </filter>

          <filter id="end-glow" height="300%" width="300%" x="-100%" y="-100%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0"
                          dy="0"
                          stdDeviation="4"
                          result="shadowed"
                          floodColor={ this.overSpeedLimit() ? this.colorWarnDynamic() : this.colorHighlightDynamic() }
                          floodOpacity="1"/>
            <feGaussianBlur in="shadowed" stdDeviation="1" />
          </filter>

          {/* Custom marker for the current speed ring */}
          <marker id="HalfRound"
            viewBox="0 0 10 10" refX="-9" refY="5"
            markerUnits="strokeWidth"
            markerWidth="5"
            markerHeight="1"
            fill={ this.overSpeedLimit() ? CONSTANTS.colorWarn : CONSTANTS.colorHighlight }
            orient="auto">
            <path d="M 0 0 L 0 10 A 8 8 1 1 1 0 0 z" />
          </marker>
        </defs>
        <g width="100%" transform={`translate(${this.state.width}, ${this.state.height})`}>

          {/* Path for the inner shine of the circle */}
          <path id="ring__current-speed-inner-shine"
                className={ this.state.speed > 1 && "active" }
                d="M -199 166
                    A 257 257 0 1 1 199 166"
                fill="transparent"
                stroke="url(#fade-gradient)"
                shapeRendering="crispEdges"
                opacity=".15"
                strokeWidth="78"
                transform="translate(0, 7)"
                filter="url(#shine-blur)"
                ref={this.speedIndicatorShinePathRef}
                strokeDasharray={`300, ${this.getTotalRingLength(this.speedIndicatorShinePathRef)}`}
                strokeDashoffset={this.getStrokeDashOffsetShine(this.speedIndicatorShinePathRef)} >
          </path>

          {/* Path for the gray ring in the background */}
          <path d="M -230 200
                   A 300 300 0 1 1 230 200"
                id="ring__background"
                ref={this.backgroundRingPathRef}
                strokeLinecap="round"
                strokeWidth={20}
                fill="transparent"
                stroke="url(#background-ring-gradient)"></path>

          {/* Current speed limit indicator */}
          <path className="speedometer__speed-limit-indicator"
                d={`M ${this.getPositionOnCircleFromTo(22, this.props.speedLimit / this.props.maxSpeed).from.x}
                    ${this.getPositionOnCircleFromTo(22, this.props.speedLimit / this.props.maxSpeed).from .y}
                    L ${this.getPositionOnCircleFromTo(22, this.props.speedLimit / this.props.maxSpeed).to.x}
                    ${this.getPositionOnCircleFromTo(22, this.props.speedLimit / this.props.maxSpeed).to.y}`}
                transform="translate(0, 7)"
                strokeWidth="10">
          </path>

          {/* Path for the speed limit indicator. The main ring, so to say. */}
          <path id="ring__current-speed"
                className={this.state.speed > 0 ? "is-active" : undefined}
                d="M -230 200
                   A 300 300 0 1 1 230 200"
                markerStart="url(#HalfRound)"
                filter="url(#ring-glow)"
                strokeDasharray={this.getTotalRingLength(this.speedIndicatorRingPathRef) || 0}
                strokeDashoffset={this.getStrokeDashOffset(this.speedIndicatorRingPathRef) || 0}
                fill="transparent"
                stroke="url(#current-speed-gradient)"
                strokeWidth={20}
                ref={this.speedIndicatorRingPathRef}>
          </path>

          {/* Path for the highlight of the underlying glow. */}
          <path id="ring__current-speed-highlight"
                className={this.state.speed > 5 ? "is-active" : undefined}
                width="100" height="100" d={`M${this.getPositionOnCircleFromTo().from.x} ${this.getPositionOnCircleFromTo().from.y} L${this.getPositionOnCircleFromTo().to.x} ${this.getPositionOnCircleFromTo().to.y}`}
                strokeWidth={5}
                transform="translate(0, 7)"
                filter="url(#end-blur)"
                stroke={ this.overSpeedLimit() ? this.colorWarnBrightDynamic() : this.colorHighlightBrightDynamic() } >
          </path>

          {/* Path for the highlight at the tip of the ring. */}
          <path id="ring__current-speed-highlight--blurred"
                d={`M${this.getPositionOnCircleFromTo().from.x}
                    ${this.getPositionOnCircleFromTo().from.y}
                    L${this.getPositionOnCircleFromTo().to.x}
                    ${this.getPositionOnCircleFromTo().to.y}`}
                width="100"
                height="100"
                strokeWidth={5}
                transform="translate(0, 7)"
                filter="url(#end-glow)"
                stroke={ this.overSpeedLimit() ? this.colorWarnBrightDynamic() : this.colorHighlightBrightDynamic() }
                className={this.state.speed > 3 ? "is-active" : undefined} >
          </path>

          {/* Path for the speed limit indicator. Another transparent instance to lay over the speed indicator ring for better usability. */}
          <path className="speedometer__speed-limit-indicator transparent"
                d={`M ${this.getSpeedLimitPos().from.x} ${this.getSpeedLimitPos().from .y} L ${this.getSpeedLimitPos().to.x} ${this.getSpeedLimitPos().to.y}`}
                transform="translate(0, 7)"
                strokeWidth="10">
          </path>

          <GearLabel options={{
            active: this.state.selectedGear == "R",
            activeColor: CONSTANTS.colorReverseOrange,
            activeTextColor: CONSTANTS.colorReverseOrange,
            pos: this.getGearLabelPosition(490, 1.905),
            gear: "R"
          }} />

          <GearLabel options={{
            active: this.state.selectedGear == "N",
            activeColor: CONSTANTS.colorNeutralGreen,
            activeTextColor: CONSTANTS.colorNeutralGreen,
            pos: this.getGearLabelPosition(490, 1.95),
            gear: "N"
          }} />

          <GearLabel options={{
            active: this.state.selectedGear == "D",
            activeColor: CONSTANTS.colorHighlight,
            pos: this.getGearLabelPosition(490, 2),
            gear: "D"
          }} />

          <GearLabel options={{
            active: this.state.selectedGear == "P",
            activeColor: CONSTANTS.colorHighlight,
            pos: this.getGearLabelPosition(490, 2.05),
            gear: "P"
          }} />

          <GearLabel options={{
            active: this.state.selectedGear == "B",
            activeColor: CONSTANTS.colorHighlight,
            pos: this.getGearLabelPosition(490, 2.095),
            gear: "B"
          }} />
        </g>

        <g id="ring__current-speed--effect"
           transform={`translate(${this.state.width}, ${this.state.height + 7})`}
           filter="url(#particles)">
             <g className={ this.overSpeedLimit() && this.state.speed !== this.props.maxSpeed ? "visible" : undefined }>
              <AttachedParticle options={{
                pos: this.getPositionOnCircleSinglePoint(293, null, .002),
                r1: 2,
                r2: 4,
                startColor: this.colorWarnDynamic(),
                endColor: this.colorWarnBrightDynamic(),
                animationDuration: 500
              }} />

              <AttachedParticle options={{
                pos: this.getPositionOnCircleSinglePoint(298, null, .003),
                r1: 4,
                r2: 2,
                startColor: this.colorWarnBrightDynamic(),
                endColor: this.colorWarnDynamic(),
                animationDuration: 500
              }} />

              <AttachedParticle options={{
                pos: this.getPositionOnCircleSinglePoint(300, null, .002),
                r1: 3,
                r2: 1,
                startColor: this.colorWarnDynamic(),
                endColor: this.colorWarnBrightDynamic(),
                animationDuration: 500
              }} />

              <AttachedParticle options={{
                pos: this.getPositionOnCircleSinglePoint(302, null, .003),
                r1: 1,
                r2: 4,
                startColor: this.colorWarnBrightDynamic(),
                endColor: this.colorWarnDynamic(),
                animationDuration: 500
              }} />

              <AttachedParticle options={{
                pos: this.getPositionOnCircleSinglePoint(307, null, .002),
                r1: 4,
                r2: 1,
                startColor: this.colorWarnDynamic(),
                endColor: this.colorWarnBrightDynamic(),
                animationDuration: 500
              }} />
            </g>
            <ParticleGenerator active={ this.overSpeedLimit() && this.state.speed !== this.props.maxSpeed }
                               x={this.getPositionOnCircleSinglePoint(300).x}
                               y={this.getPositionOnCircleSinglePoint(300).y}
                               fill={this.colorWarnBrightDynamic()}
                               { ...this.props.particleOptions } />
        </g>
        <g className={`selected__gear--${this.state.selectedGear}`}>
          <text id="speedometer__current-speed"
                className="speedometer__current-speed"
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle" >
            {this.state.speed}
          </text>
          <text className="speedometer__unit"
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle" >
            MPH
          </text>
        </g>
      </svg>
    </div>
    )
  }
};

export default SpeedOMeter
export { GearLabel }