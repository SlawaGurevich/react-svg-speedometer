import React, { Component, createRef } from "react";

import { SpeedOMeterProps, SpeedOMeterState } from "./SpeedOMeter.types";

// remove
import GradientPath from 'gradient-path'
import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';
// remove end

import "./SpeedOMeter.scss";

const GearLabel = ({pos, gear, activeColor, active}) => {
  return(
    <g className="speedometer__gear-container hidden">
      <g className={`speedometer__gear hidden ${active ? "speedometer__gear--selected" : "" }`}>
        <text className="speedometer__gear-label" dominantBaseline="middle" textAnchor="middle" {...pos}>{gear}</text>
        <circle className="speedometer__gear-circle" transform="translate(0, -3)" cx={pos.x} cy={pos.y} fill="none" r={50} stroke={activeColor}></circle>
      </g>
    </g>
  )
}

class SpeedOMeter extends Component<SpeedOMeterProps, SpeedOMeterState> {
  theme: string
  width: number
  height: number
  state: SpeedOMeterState

  _isMounted: boolean = false
  colorHighlight: string = "#cdddf6"
  colorHighlightBright: string = "#f4f8ff"
  colorWarn: string = "#ffe208"
  colorWarnBright: string = "#fff07f"

  parentRef: React.RefObject<SVGSVGElement>
  backgroundRingPathRef: React.RefObject<SVGPathElement>
  speedIndicatorRingPathRef: React.RefObject<SVGPathElement>
  speedIndicatorShinePathRef: React.RefObject<SVGPathElement>

  static defaultProps = {
    maxSpeed: 100,
    speedLimit: 25,
    startFromSpeed: 0,
    radius: 300
  }

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

    window.addEventListener("resize", this.resize)
    window.addEventListener("keydown", this.handleKeypress)
    window.addEventListener("keyup", this.handleKeypress)

    this.fadeInGears()
  }

  fadeInGears() {
    let gears = document.querySelectorAll(".speedometer__gear")

    for( let i = 0; i < gears.length; i++){
      setTimeout(() => { gears[i].parentElement.classList.remove("hidden") }, 150 * i)
    }
  }

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

  resize() {
    console.log("resize")
    if (this.parentRef && this._isMounted) {
      this.setState({
        width: this.parentRef.current.clientWidth,
        height: this.parentRef.current.clientHeight
      })
    }
  }

  overSpeedLimit() {
    return (this.state.speed > this.props.speedLimit)
  }

  getTotalRingLength(ref) {
    if(ref.current){
      return ref.current.getTotalLength()
    }
  }

  getStrokeDashOffset(ref) {
    return this.getTotalRingLength(ref) - (this.getTotalRingLength(ref) * this.state.speed / this.props.maxSpeed)
  }

  getLineOnCircle() {
    let from = [
      290 * -Math.sin( this.mapRange([0, 1], [.115, .885], this.state.speed / this.props.maxSpeed) * 2 * Math.PI ),
      290 * Math.cos( this.mapRange([0, 1], [.115, .885], this.state.speed / this.props.maxSpeed) * 2 * Math.PI )
    ]

    let to = [
      310 * -Math.sin( this.mapRange([0, 1], [.115, .885], this.state.speed / this.props.maxSpeed) * 2 * Math.PI ),
      310 * Math.cos( this.mapRange([0, 1], [.115, .885], this.state.speed / this.props.maxSpeed) * 2 * Math.PI )
    ]

    return {from: from, to: to}
  }

  getCurrentCircleSpeedPosition() {
    return {
      x: 300 * -Math.sin( this.mapRange([0, 1], [.115, .885], this.state.speed / this.props.maxSpeed) * 2 * Math.PI ),
      y: 300 * Math.cos( this.mapRange([0, 1], [.115, .885], this.state.speed / this.props.maxSpeed) * 2 * Math.PI )
    }
  }

  /**
 * Calculates the position of the speed limit indicator. The 12pt widht is to insure it lays over the 10pt width of the background ring.
 */
  getSpeedLimitPos() {
    let from = {
      x: (this.props.radius - 11) * -Math.sin(this.mapRange([0, 1], [.115, .885], this.props.speedLimit / this.props.maxSpeed) * 2 * Math.PI),
      y: (this.props.radius - 11) * Math.cos(this.mapRange([0, 1], [.115, .885], this.props.speedLimit / this.props.maxSpeed) * 2 * Math.PI)
    }

    let to = {
      x: (this.props.radius + 10) * -Math.sin(this.mapRange([0, 1], [.115, .885], this.props.speedLimit / this.props.maxSpeed) * 2 * Math.PI),
      y: (this.props.radius + 10) * Math.cos(this.mapRange([0, 1], [.115, .885], this.props.speedLimit / this.props.maxSpeed) * 2 * Math.PI)
    }

    return {
      from: from,
      to: to
    }
  }

  mapRange (from, to, s) {
    return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
  }

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
      className={`speedometer-component speedometer speedometer-component-${this.theme}`}

    >
      <svg className="speedometer__canvas"
        width="100%"
        height="100%"
        viewBox="0 0 1000 850"
        ref={this.parentRef} >
        <defs>
          <linearGradient id="linearColors1" x1="0" y1="0" x2="0" y2="1">
            <stop offset=".7" stopColor="#424147">
              <animate attributeName="offset" dur="500ms" from="0" to=".7" repeatCount="1" />
            </stop>
            <stop offset="1" stopColor="#303136">
            <animate attributeName="offset" dur="500ms" from="0" to="1" repeatCount="1" />
            </stop>
          </linearGradient>
          <linearGradient id="overSpeedGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={this.colorWarn}>
              {/* <animate attributeName="offset" dur="3s" values="0;1;0" repeatCount="indefinite" /> */}
            </stop>
            <stop offset="1" stopColor={this.colorWarnBright}>
              <animate attributeName="stop-color" dur="2s" values={`${this.colorWarn};${this.colorWarnBright};${this.colorWarn}`} repeatCount="indefinite" />
            </stop>
          </linearGradient>
          {this.overSpeedLimit() && <filter id="endBlur" height="300%" width="300%" x="-100%" y="-100%" filterUnits="userSpaceOnUse">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="coloredBlur" />
          </filter>}
          <filter id="ringGlow">
            <feDropShadow dx="0"
                          dy="0"
                          in="SourceGraphic"
                          stdDeviation="2"
                          floodColor={ this.overSpeedLimit() ? this.colorWarnBright : this.colorHighlightBright }
                          floodOpacity="1">
                          <animate attributeName="stdDeviation" values="2;4;2" dur="2s" repeatCount="indefinite" />
            </feDropShadow>
          </filter>
          <filter id="endGlow" height="300%" width="300%" x="-100%" y="-100%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0"
                          dy="0"
                          stdDeviation="4"
                          result="shadowed"
                          floodColor={ this.overSpeedLimit() ? this.colorWarn : this.colorHighlight }
                          floodOpacity="1"/>
            <feGaussianBlur in="shadowed" stdDeviation="1" />
          </filter>
          <marker id="HalfRound"
            viewBox="0 0 10 10" refX="-5" refY="5"
            markerUnits="strokeWidth"
            markerWidth="5"
            markerHeight="1"
            fill={ this.overSpeedLimit() ? this.colorWarn : this.colorHighlight }
            orient="auto">
            <path d="M 0 0 L 0 10 A 6 6 1 1 1 0 0 z" />
          </marker>
        </defs>
        <g width="100%" transform={`translate(${this.state.width}, ${this.state.height})`} strokeWidth="20">
          {/* Path for the gray ring in the background */}
          <path d="M -200 230
                   A 300 300 0 1 1 200 230"
                id="ring__background"
                ref={this.backgroundRingPathRef}
                strokeLinecap="round"
                fill="transparent"
                stroke="url(#linearColors1)"></path>

          {/* Path for the inner shine of the circle */}
          <path id="ring__current-speed-inner-shine"
                d="M -165 195
                    A 255 255 0 1 1 165 195"
                fill="transparent"
                stroke="url(#linearColors1)"
                strokeWidth="70"
                transform="translate(0, 6)"
                ref={this.speedIndicatorShinePathRef}
                strokeDasharray={this.getTotalRingLength(this.speedIndicatorShinePathRef) || 0}
                strokeDashoffset={this.getStrokeDashOffset(this.speedIndicatorShinePathRef) || 0} >
          </path>

          {/* Path for the speed limit indicator. Changes based on the value of the current speed limit. */}
          <path className="speedometer__speed-limit-indicator"
                d={`M ${this.getSpeedLimitPos().from.x} ${this.getSpeedLimitPos().from .y} L ${this.getSpeedLimitPos().to.x} ${this.getSpeedLimitPos().to.y}`}
                transform="translate(0, 6)"
                strokeWidth="10">
          </path>

          {/* Curernt speed indicator ring. */}
          <path id="ring__current-speed"
                d="M -200 230
                   A 300 300 0 1 1 200 230"
                markerStart="url(#HalfRound)"
                filter="url(#ringGlow)"
                strokeDasharray={this.getTotalRingLength(this.speedIndicatorRingPathRef) || 0}
                strokeDashoffset={this.getStrokeDashOffset(this.speedIndicatorRingPathRef) || 0}
                fill="transparent"
                stroke={ this.overSpeedLimit() ? (this.state.speed - 10 > this.props.speedLimit ? "url(#overSpeedGradient)" : this.colorWarn) : this.colorHighlight }
                className={this.state.speed > 0 ? "is-active" : undefined}
                ref={this.speedIndicatorRingPathRef}>
          </path>

          {/* Path for the background highlight of the underlying glow. */}
          <path width="100" height="100" d={`M${this.getLineOnCircle().from[0]} ${this.getLineOnCircle().from[1]} L${this.getLineOnCircle().to[0]} ${this.getLineOnCircle().to[1]}`}
                strokeWidth={15}
                transform="translate(0, 6)"
                id="ring__current-speed-highlight"
                filter="url(#endBlur)"
                stroke={ this.overSpeedLimit() ? this.colorWarnBright : this.colorHighlightBright }
                className={this.state.speed > 5 ? "is-active" : undefined} >
          </path>

          {/* Path for the highlight at the tip of the ring. */}
          <path id="ring__current-speed-highlight--blurred"
                d={`M${this.getLineOnCircle().from[0]} ${this.getLineOnCircle().from[1]} L${this.getLineOnCircle().to[0]} ${this.getLineOnCircle().to[1]}`}
                width="100"
                height="100"
                strokeWidth={5}
                transform="translate(0, 6)"
                filter="url(#endGlow)"
                stroke={ this.overSpeedLimit() ? this.colorWarnBright : this.colorHighlightBright }
                className={this.state.speed > 3 ? "is-active" : undefined} >
          </path>

          {/* Path for the speed limit indicator. Changes based on the value of the current speed limit. */}
          <path className="speedometer__speed-limit-indicator transparent"
                d={`M ${this.getSpeedLimitPos().from.x} ${this.getSpeedLimitPos().from .y} L ${this.getSpeedLimitPos().to.x} ${this.getSpeedLimitPos().to.y}`}
                transform="translate(0, 6)"
                strokeWidth="10">
          </path>

          <GearLabel active={this.state.selectedGear == "R"} activeColor={this.colorHighlight} pos={this.getGearLabelPosition(530, 1.9)} gear="R" />
          <GearLabel active={this.state.selectedGear == "N"} activeColor={this.colorHighlight} pos={this.getGearLabelPosition(530, 1.95)} gear="N" />
          <GearLabel active={this.state.selectedGear == "D"} activeColor={this.colorHighlight} pos={this.getGearLabelPosition(530, 2)} gear="D" />
          <GearLabel active={this.state.selectedGear == "P"} activeColor={this.colorHighlight} pos={this.getGearLabelPosition(530, 2.05)} gear="P" />
          <GearLabel active={this.state.selectedGear == "B"} activeColor={this.colorHighlight} pos={this.getGearLabelPosition(530, 2.1)} gear="B" />
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