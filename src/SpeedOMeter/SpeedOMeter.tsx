import React, { Component, createRef } from "react";

import { SpeedOMeterProps, SpeedOMeterState } from "./SpeedOMeter.types";

import GradientPath from 'gradient-path'
import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';

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

  colorHighlight: string = "#cdddf6"

  parentRef: React.RefObject<SVGSVGElement>
  backgroundRingPathRef: React.RefObject<SVGPathElement>
  speedIndicatorRingPathRef: React.RefObject<SVGPathElement>
  speedIndicatorShinePathRef: React.RefObject<SVGPathElement>

  static defaultProps = {
    maxSpeed: 120,
    speedLimit: 40
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
      speed: 0,
      spacePressed: false,
      selectedGear: "N"
    }
  }

  componentDidMount() {
    if (this.parentRef.current) {
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
    console.log(gears)

    for( let i = 0; i < gears.length; i++){
      setTimeout(() => { gears[i].parentElement.classList.remove("hidden") }, 150 * i)
    }
  }

  handleKeypress(evt) {
    console.log(evt)
    if (evt.key == " ") {
      evt.preventDefault()
      console.log("speed")

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
      } else if (evt.type == "keyup" && this.state.spacePressed) {
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
                    speed: 0
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
    if (this.parentRef) {
      this.setState({
        width: this.parentRef.current.clientWidth,
        height: this.parentRef.current.clientHeight
      })
    }
  }

  getTotalRingLength(ref) {
    if(ref.current){
      return ref.current.getTotalLength()
    }
  }

  getStrokeDashOffset(ref) {
    return this.getTotalRingLength(ref) - (this.getTotalRingLength(ref) * this.state.speed / this.props.maxSpeed)
  }

  getSpeedLimitPos() {
    let x = -400 * Math.sin(this.mapRange([0, 1], [.13, .87], this.props.speedLimit / this.props.maxSpeed) * 2 * Math.PI)
    let y = 400 * Math.cos(this.mapRange([0, 1], [.13, .87], this.props.speedLimit / this.props.maxSpeed) * 2 * Math.PI)

    return {
      x: x,
      y: y
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

  getMaxSpeedPos() {
    let x = -360 * Math.sin(this.state.speed / this.props.maxSpeed * 2 * Math.PI)
    let y = 360 * Math.cos(this.state.speed / this.props.maxSpeed * 2 * Math.PI)

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
          <marker id="InverseSemicircleEnd"
            viewBox="0 0 5 10" refX="0" refY="5"
            markerUnits="strokeWidth"
            markerWidth="0.5" markerHeight="1"
            orient="auto">
            <path d="M 0 0 L 5 0 A 5 5 0 0 0 5 10 L 0 10 z" />
          </marker>
        </defs>
        <g width="100%" transform={`translate(${this.state.width},${this.state.height})`} strokeWidth="20">
          <path d="M -200 230
                   A 300 300 0 1 1 200 230"
                strokeLinecap="round" fill="transparent" stroke="url(#linearColors1)" id="background-ring" ref={this.backgroundRingPathRef} ></path>
          <path d={`M 0 0 L 0 0 ${this.getSpeedLimitPos().x} ${this.getSpeedLimitPos().y}`} strokeWidth="10" stroke="#303136">
          </path>
          <path d="M -200 230
                   A 300 300 0 1 1 200 230"
                // marker-start="url(#InverseSemicircleEnd)"
                strokeDasharray={this.getTotalRingLength(this.speedIndicatorRingPathRef) || 0}
                strokeDashoffset={this.getStrokeDashOffset(this.speedIndicatorRingPathRef) || 0}
                fill="transparent"
                stroke={this.state.speed <= this.props.speedLimit ? "#cfe0f4" : "#ffe208" }
                id="ring__speed-indicator"
                className={this.state.speed > 0 ? "is-active" : undefined}
                ref={this.speedIndicatorRingPathRef}></path>

                <path d="M -168 195
                        A 255 255 0 1 1 168 195"
                      fill="transparent"
                      stroke="url(#linearColors1)"
                      strokeWidth="70"
                      id="ring__speed-indicator-shine"
                      ref={this.speedIndicatorShinePathRef}
                      strokeDasharray={this.getTotalRingLength(this.speedIndicatorShinePathRef) || 0}
                      strokeDashoffset={this.getStrokeDashOffset(this.speedIndicatorShinePathRef) || 0}
                ></path>
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