# react-svg-speedometer

## Description

The project is a Speed-O-Meter react component. It uses SVG graphics to render it's elements as well as the particle system.

## Installation

As remote node package

**Not yet possible**

As local node package

Check out the repository locally.

```bash
$ git clone git@github.com:SlawaGurevich/react-svg-speedometer.git
```

Then, in your project.

```bash
npm i --save [path/to/the/cloned/folder/]svg-speedometer
```

This will create a symlink to the project.

## Usage
```javascript
import { SpeedOMeter } from 'svg-speedometer'

const YourComponent = (props) => {
	return (
		<SpeedOMeter maxSpeed={100} speedLimit={65} />
	)
}

...
```

## Options
All options are optional and can be left out in favor of the default value.

|Name|Type|Default|Description|
|---|---|---|---|
|maxSpeed|Number|100|What is the max speed|
|speedLimit|Number|65|The speed limit to show on the speedometer. Also responsible for when the bat turns yellow.|
|startFrom|Number| 0 | What speed to start from. When this is set, the speed will start from the defined value and drop down to 0 when after you stop accelerating. |
|radius|Number| 300 | The radius of the speedometer. |
|particleOptions|Object| *see bellow* | Settings for the particle system. Can be left out for default options. |

## Particle Options

The particle system works out of the box. However, you can specify more options like this.

```javascript
<SpeedOMeter particleOptions={{
                              pps: 200,
                              radius: 3,
                              radiusJitter: 1
                             }} maxSpeed={100} speedLimit={65} />
```

You can use the following options:

| Name            | Type   | Default | Description                                                  |
| --------------- | ------ | ------- | ------------------------------------------------------------ |
| pps             | Number |         | How many particles to generate per second (hence PPS)        |
| maxParticles    | Number |         | Limit the number of particles that can be simultaneously on screen. |
| lifetime        | Number |         | How long the particles live (in **ms**)                      |
| xJitter         | Number |         | How much jitter particles should have in x-direction when being created. |
| y-Jitter        | Number |         | How much jitter particles should have in y-direction when being created. |
| radius          | Number |         | The radius of a single particle.                             |
| radiusJitter    | Number |         | The amoun by which the particle can be bigger by random on generation (must be positive!) |
| gravity         | Number |         | The amount by which particles are affected by gravitation. Set to 0 for zero gravity. Negative values cause particles to have negative gravity. |
| velocity        | Number |         | The amount of initial verlocity the particles have after they are generated. (Should be positive!) |
| generationScale | Number |         | By how many times to increase the generation of particles. Essentially, how often should the function for particle generation be called on one interation. Must be Int.  **Strongly suggest to leave this at one.** |
| fill            | String |         | The color of the particles. Supports all colors React supports. |