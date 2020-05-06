var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

module.exports = {
  name: 'Raw Developer',
  tooltip: 'Process 16 bit raw photos before converting to 8 bit color depth',
  knobs: {
    'Exposure': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      tooltip: `<div class="tooltip-content"><p>Control the white point of the image</p></div>`,
    },
    'Black Level': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      tooltip: `<div class="tooltip-content"><p>Control the black point of the image</p></div>`,
    },
    'Gamma': {
      type: 'slider',
      minValue: 0,
      maxValue: 4,
      value: 1,
      step: 0.05,
    },
    'Saturation': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      style: 'background: linear-gradient(90deg, rgba(200,200,200,1) 0%, rgba(255,217,217,1) 14%, rgba(255,186,222,1) 28%, rgba(225,159,255,1) 42%, rgba(119,168,255,1) 57%, rgba(76,255,119,1) 71%, rgba(252,255,47,1) 85%, rgba(255,0,0,1) 100%);',
      tooltip: `<div class="tooltip-content"><p>Control the strength of colors</p></div>`,
    },
    'Temperature': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      style: 'background: linear-gradient(90deg, rgba(101,154,255,1) 0%, rgba(250,250,250,1) 49%, rgba(255,201,96,1) 100%);',
      tooltip: `<div class="tooltip-content"><p>Change the balance of colors by controlling color temperature</p></div>`,
    },
    'Hue': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      style: 'background: linear-gradient(90deg, rgba(187,101,255,1) 0%, rgba(250,250,250,1) 49%, rgba(145,255,136,1) 100%);',
      tooltip: `<div class="tooltip-content"><p>Change the balance of colors by controlling color hue</p></div>`,
    },
  },
  framebuffers: [],
  takesMask: false,
  startEnabled: true,
  stages: [
    {
      shadername: 'rawdev',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'exposure': 'exposure',
        'black': 'black',
        'saturation': 'saturation',
        'temperature': 'temperature',
        'hue': 'hue',
        'gamma': 'gamma',
      },
      knob_bindings: {
        'Black Level': function(v, set) {
          if (v >= 0) set('black', 'float', 1-(v/100))
          else        set('black', 'float', (100-v)/100)
        },
        'Exposure': function(v, set) {
          if (v >= 0) set('exposure', 'float', 1+(v/50))
          else        set('exposure', 'float', (100+v)/100)
        },
        'Gamma': function(v, set) {
          set('gamma', 'float', 1/v)
        },
        'Saturation':  function(v, set) {
          if (v >= 0) set('saturation', 'float', 1+(v/100))
          else set('saturation', 'float', (100+v)/100)
        },
        'Temperature':  function(v, set) {
          set('temperature', 'float', v/800)
        },
        'Hue':  function(v, set) {
          set('hue', 'float', v/800)
        },
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'out',
    },
  ],
}
