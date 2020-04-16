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
  framebuffers: [],
  stages: [
    {
      shadername: 'adjustments:main',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
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
        'Brightness':  function(v, set) {
            set('brightness', 'float', v/100)
        },
        'Contrast':  function(v, set) {
            if (v >= 0){
              set('contrast', 'float', 1+(v/100))
            } else {
              set('contrast', 'float', (100+v)/100)
            }
        },
        'Blacks':  function(v, set) {
            if (v >= 0){
              set('blacks', 'float', 1-(v/100))
            } else {
              set('blacks', 'float', (100-v)/100)
            }
        },
        'Whites':  function(v, set) {
            if (v >= 0){
              set('whites', 'float', 1+(v/100))
            } else {
              set('whites', 'float', (100+v)/100)
            }
        },
        'Gamma':  function(v, set) {
          set('gamma', 'float', v)
        },
        'Saturation':  function(v, set) {
            if (v >= 0){
              set('saturation', 'float', 1+(v/100))
            } else {
              set('saturation', 'float', (100+v)/100)
            }
        },
        'Temperature':  function(v, set) {
          set('temperature', 'float', v/1000)
        },
        'Hue':  function(v, set) {
          set('hue', 'float', v/1000)
        },
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'out',
    }
  ],
}
