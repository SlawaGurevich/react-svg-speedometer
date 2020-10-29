import React, { Component, createRef } from "react";

import { SpeedOMeterProps, SpeedOMeterState } from "./SpeedOMeter.types";

import ParticleGenerator from '../ParticleGenerator/ParticleGenerator'
import Color from 'color'

import * as CONSTANTS from '../util/constants'

import "./SpeedOMeter.scss";

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
        <text className="speedometer__gear-label" fill={ optionParams.active ? optionParams.activeTextColor : "#6a6a72" } dominantBaseline="middle" textAnchor="middle" {...optionParams.pos}>{optionParams.gear}</text>
        <circle className="speedometer__gear-circle" transform="translate(0, -3)" cx={optionParams.pos.x} cy={optionParams.pos.y} fill="none" r={50} stroke={optionParams.activeColor}></circle>
      </g>
    </g>
  )
}

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
  theme: string
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
    radius: 300
  }

  // gears
  gears:Array<string> = [
    "R", "N", "D", "P", "B"
  ]


  constructor(props: SpeedOMeterProps) {
    super(props)
    this.theme = props.theme
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
          interval: setInterval(() => {
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
            interval: setInterval(() => {
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
  getPositionOnCircleFromTo(width = 20) {
    let from = [
      (this.props.radius - width / 2) * -Math.sin( this.mapRange([0, 1], [.14, .86], this.state.speed / this.props.maxSpeed) * 2 * Math.PI ),
      (this.props.radius - width / 2) * Math.cos( this.mapRange([0, 1], [.14, .86], this.state.speed / this.props.maxSpeed) * 2 * Math.PI )
    ]

    let to = [
      (this.props.radius + width / 2) * -Math.sin( this.mapRange([0, 1], [.14, .86], this.state.speed / this.props.maxSpeed) * 2 * Math.PI ),
      (this.props.radius + width / 2) * Math.cos( this.mapRange([0, 1], [.14, .86], this.state.speed / this.props.maxSpeed) * 2 * Math.PI )
    ]

    return {from: from, to: to}
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
      className={`speedometer-component speedometer speedometer-component-${this.theme}`} >
      <svg className="speedometer__canvas"
        width="100%"
        height="100%"
        viewBox="0 0 1000 850"
        ref={this.parentRef} >
        {/* Gradient definitions */}
        <defs>
          {/* Gradients */}

          <linearGradient id="backgroundRingGradient" width={100} height={100} x1="0" y1="0" x2="0" y2="1">
            <stop offset=".7" stopColor="#424147">
              <animate attributeName="offset" dur="500ms" from="0" to=".7" repeatCount="1" />
            </stop>
            <stop offset="1" stopColor="#303136">
            <animate attributeName="offset" dur="500ms" from="0" to="1" repeatCount="1" />
            </stop>
          </linearGradient>


          <linearGradient id="currentSpeedGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset=".4" stopColor={this.overSpeedLimit() ? CONSTANTS.colorWarn : CONSTANTS.colorHighlight}>
              {/* <animate attributeName="offset" dur="3s" values="0;1;0" repeatCount="indefinite" /> */}
            </stop>
            <stop offset="1" stopColor={this.overSpeedLimit() ? this.colorWarnBrightDynamic() : this.colorHighlightBrightDynamic() }>
              {/* <animate attributeName="stop-color" dur="2s" values={`${this.colorWarnDynamic()};${this.colorWarnBrightDynamic()};${this.colorWarnDynamic()}`} repeatCount="indefinite" /> */}
            </stop>
          </linearGradient>

          <radialGradient id="fadeGradient"
                          cx={ this.getStrokeDashOffsetShine(this.speedIndicatorShinePathRef) > 0 ? this.getPositionOnCircleSinglePoint(300, -.08).x : this.getPositionOnCircleSinglePoint(300, null, -.32).x }
                          cy={ this.getStrokeDashOffsetShine(this.speedIndicatorShinePathRef) > 0 ? this.getPositionOnCircleSinglePoint(300, -.08).y : this.getPositionOnCircleSinglePoint(300, null, -.32).y }
                          r="350"
                          gradientUnits="userSpaceOnUse"
                          spreadMethod="pad">
            <stop offset={.3} stopColor={CONSTANTS.colorBackground} />
            <stop offset={1} stopColor={this.overSpeedLimit() ? this.colorWarnDynamic() : this.colorHighlightDynamic()} />
          </radialGradient>

          {/* Filter */}

          <filter id="shadowed-goo">
              <feGaussianBlur in="SourceGraphic"stdDeviation="1" />
              {/* <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -4" result="goo" /> */}
              {/* <feGaussianBlur in="goo" stdDeviation="1" result="shadow" /> */}
              {/* <feColorMatrix in="shadow" mode="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 -0.2" result="shadow" /> */}
              {/* <feOffset in="shadow" dx="1" dy="1" result="shadow" /> */}
              {/* <feBlend in2="shadow" in="goo" result="goo" /> */}
              {/* <feBlend in2="goo" in="SourceGraphic" result="mix" /> */}
          </filter>

          {this.overSpeedLimit() && <filter id="endBlur" height="300%" width="300%" x="-100%" y="-100%" filterUnits="userSpaceOnUse">"
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="coloredBlur" />
          </filter>}

          <filter id="ringGlow">
            <feDropShadow dx="0"
                          dy="0"
                          in="SourceGraphic"
                          stdDeviation="3"
                          floodColor={ this.overSpeedLimit() ? this.colorWarnBrightDynamic() : this.colorHighlightBrightDynamic() }
                          floodOpacity="1">
                          <animate attributeName="stdDeviation" values="3;7;3" dur="2s" repeatCount="indefinite" />
            </feDropShadow>
          </filter>

          <filter id="shineBlur">
            <feGaussianBlur stdDeviation={1} in="SourceGraphic"></feGaussianBlur>
          </filter>

          <filter id="glowFadeBlur" >
            <feGaussianBlur stdDeviation="10" in="SourceGraphic"></feGaussianBlur>
          </filter>
          <filter id="endGlow" height="300%" width="300%" x="-100%" y="-100%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0"
                          dy="0"
                          stdDeviation="4"
                          result="shadowed"
                          floodColor={ this.overSpeedLimit() ? this.colorWarnDynamic() : this.colorHighlightDynamic() }
                          floodOpacity="1"/>
            <feGaussianBlur in="shadowed" stdDeviation="1" />
          </filter>
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
                stroke="url(#fadeGradient)"
                shapeRendering="crispEdges"
                opacity=".15"
                strokeWidth="78"
                transform="translate(0, 7)"
                filter="url(#shineBlur)"
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
                stroke="url(#backgroundRingGradient)"></path>

          {/* Path for the speed limit indicator. Changes based on the value of the current speed limit. */}
          <path className="speedometer__speed-limit-indicator"
                d={`M ${this.getSpeedLimitPos().from.x} ${this.getSpeedLimitPos().from .y} L ${this.getSpeedLimitPos().to.x} ${this.getSpeedLimitPos().to.y}`}
                transform="translate(0, 7)"
                strokeWidth="10">
          </path>

          {/* Curernt speed indicator ring. */}
          <path id="ring__current-speed"
                d="M -230 200
                   A 300 300 0 1 1 230 200"
                markerStart="url(#HalfRound)"
                filter="url(#ringGlow)"
                strokeDasharray={this.getTotalRingLength(this.speedIndicatorRingPathRef) || 0}
                strokeDashoffset={this.getStrokeDashOffset(this.speedIndicatorRingPathRef) || 0}
                fill="transparent"
                stroke="url(#currentSpeedGradient)"
                strokeWidth={20}
                className={this.state.speed > 0 ? "is-active" : undefined}
                ref={this.speedIndicatorRingPathRef}>
          </path>

          {/* Path for the highlight of the underlying glow. */}
          <path width="100" height="100" d={`M${this.getPositionOnCircleFromTo().from[0]} ${this.getPositionOnCircleFromTo().from[1]} L${this.getPositionOnCircleFromTo().to[0]} ${this.getPositionOnCircleFromTo().to[1]}`}
                strokeWidth={15}
                transform="translate(0, 7)"
                id="ring__current-speed-highlight"
                filter="url(#endBlur)"
                stroke={ this.overSpeedLimit() ? this.colorWarnBrightDynamic() : this.colorHighlightBrightDynamic() }
                className={this.state.speed > 5 ? "is-active" : undefined} >
          </path>

          {/* Path for the highlight at the tip of the ring. */}
          <path id="ring__current-speed-highlight--blurred"
                d={`M${this.getPositionOnCircleFromTo().from[0]} ${this.getPositionOnCircleFromTo().from[1]} L${this.getPositionOnCircleFromTo().to[0]} ${this.getPositionOnCircleFromTo().to[1]}`}
                width="100"
                height="100"
                strokeWidth={5}
                transform="translate(0, 7)"
                filter="url(#endGlow)"
                stroke={ this.overSpeedLimit() ? this.colorWarnBrightDynamic() : this.colorHighlightBrightDynamic() }
                className={this.state.speed > 3 ? "is-active" : undefined} >
          </path>

          {/* Path for the speed limit indicator. Changes based on the value of the current speed limit. */}
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

        <g id="ring__current-speed--effect" className={ this.overSpeedLimit() ? "visible" : undefined } transform={`translate(${this.state.width}, ${this.state.height + 7})`} filter="url(#shadowed-goo)">
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
              r1: 7,
              r2: 3,
              startColor: this.colorWarnBrightDynamic(),
              endColor: this.colorWarnDynamic(),
              animationDuration: 500
            }} />

            <AttachedParticle options={{
              pos: this.getPositionOnCircleSinglePoint(300, null, .002),
              r1: 6,
              r2: 2,
              startColor: this.colorWarnDynamic(),
              endColor: this.colorWarnBrightDynamic(),
              animationDuration: 500
            }} />

            <AttachedParticle options={{
              pos: this.getPositionOnCircleSinglePoint(302, null, .003),
              r1: 2,
              r2: 5,
              startColor: this.colorWarnBrightDynamic(),
              endColor: this.colorWarnDynamic(),
              animationDuration: 500
            }} />

            <AttachedParticle options={{
              pos: this.getPositionOnCircleSinglePoint(307, null, .002),
              r1: 5,
              r2: 2,
              startColor: this.colorWarnDynamic(),
              endColor: this.colorWarnBrightDynamic(),
              animationDuration: 500
            }} />

            {/* { this.overSpeedLimit() && <ParticleGenerator fill={this.colorWarnBright} radius={2} xJitter={10} yJitter={3} x={this.getPositionOnCircleSinglePoint(300).x} y={this.getPositionOnCircleSinglePoint(300).y} /> } */}
            <ParticleGenerator active={ this.overSpeedLimit() && this.state.speed !== this.props.maxSpeed }
                               pps={ 400 }
                               fill={CONSTANTS.colorWarnBright}
                               radius={1}
                               xJitter={10}
                               yJitter={10}
                               lifetime={500}
                               generationScale={2}
                               velocity={1}
                               gravity={-15}
                               x={this.getPositionOnCircleSinglePoint(300).x}
                               y={this.getPositionOnCircleSinglePoint(300).y} />
          </g>
        <g className={`selected__gear--${this.state.selectedGear}`}>
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="speedometer__current-speed" stroke="transparent" fill="white">
            {this.state.speed}
          </text>
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="speedometer__unit">
            MPH
          </text>
        </g>
      </svg>
    </div>
    )
  }
};

export default SpeedOMeter;