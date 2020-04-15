var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

module.exports = {
  name: 'Adjustments',
  knobs: {
    'Brightness': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`,
    },
    'Contrast': {
      type: 'slider',
      minValue: -50,
      maxValue: 50,
      value: 0,
      style: `background: linear-gradient(90deg, ${sliderLight} 0%, ${sliderDark} 100%);`
    },
    'Blacks': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Whites': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Saturation': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      style: 'background: linear-gradient(90deg, rgba(200,200,200,1) 0%, rgba(255,217,217,1) 14%, rgba(255,186,222,1) 28%, rgba(225,159,255,1) 42%, rgba(119,168,255,1) 57%, rgba(76,255,119,1) 71%, rgba(252,255,47,1) 85%, rgba(255,0,0,1) 100%);',
    },
    'Temperature': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      style: 'background: linear-gradient(90deg, rgba(101,154,255,1) 0%, rgba(250,250,250,1) 49%, rgba(255,201,96,1) 100%);',
    },
    'Hue': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      style: 'background: linear-gradient(90deg, rgba(187,101,255,1) 0%, rgba(250,250,250,1) 49%, rgba(145,255,136,1) 100%);',
    },
    'Gamma': {
      type: 'slider',
      minValue: 0,
      maxValue: 4,
      value: 1,
      style: `background: linear-gradient(90deg, ${sliderLight} 0%, ${sliderDark} 100%);`,
      step: 0.05
    },
  },
  baseShader: 'adjustments',
  framebuffers: [],
  stages: [
    {
      shadername: 'main',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        'brightness': 'brightness',
        'contrast': 'contrast',
        'blacks': 'blacks',
        'whites': 'whites',
        'gamma': 'gamma',
        'saturation': 'saturation',
        'temperature': 'temperature',
        'hue': 'hue',
      },
      knob_bindings: {
        // knob name : bind name
        'Brightness': {bindname: 'brightness', type: 'float', process:
          function(v) {
            return v/100
          }
        },
        'Contrast': {bindname: 'contrast', type: 'float', process:
          function(v) {
            if (v >= 0){ return 1+(v/100) } else { return (100+v)/100 }
          }
        },
        'Blacks': {bindname: 'blacks', type: 'float', process:
          function(v) {
            v *= -1
            if (v >= 0){ return 1+(v/100) } else { return (100+v)/100 }
          }
        },
        'Whites': {bindname: 'whites', type: 'float', process:
          function(v) {
            if (v >= 0){ return 1+(v/100) } else { return (100+v)/100 }
          }
        },
        'Gamma': {bindname: 'gamma', type: 'float', process:
          function(v) {
            return v
          }
        },
        'Saturation': {bindname: 'saturation', type: 'float', process:
          function(v) {
            if (v >= 0){ return 1+(v/100) } else { return (100+v)/100 }
          }
        },
        'Temperature': {bindname: 'temperature', type: 'float', process:
          function(v) {
            return v/1000
          }
        },
        'Hue': {bindname: 'hue', type: 'float', process:
          function(v) {
            return v/1000
          }
        },
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'out',
    }
  ],
}
