module.exports = {
  name: 'Adjustments',
  knobs: {
    'Brightness': {
      type: 'slider',
      minValue: -1,
      maxValue: 1,
      value: 0,
    },
    'Contrast': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: -10,
    },
  },
  baseShader: 'adjustments',
  framebuffers: [],
  stages: [
    {
      shadername: 'main',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      textureSampler: 'texSampler',
      uniforms: {
        // bind name : in-shader name
        'brightness': 'brightness',
        'contrast': 'contrast',
      },
      knob_bindings: {
        // knob name : bind name
        'Brightness': {bindname: 'brightness', type: 'float', process: function(v){return v}},
        'Contrast': {bindname: 'contrast', type: 'float', process:
          function(v) {
            // if the contrast is negitive it should really be a positive fraction
            if (v >= 0){ return 1+(v/100) } else { return (100+v)/100
          }
        }},
      },
      inputs: ['in'],
      out: 'out',
    }
  ],
}
