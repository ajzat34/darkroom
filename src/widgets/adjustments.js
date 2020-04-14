module.exports = {
  name: 'Adjustments',
  knobs: {
    'Brightness': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
    },
    'Contrast': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
    },
    'Blacks': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 5,
    },
    'Whites': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: -1,
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
            // if the contrast is negitive it should really be a positive fraction
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
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'out',
    }
  ],
}
