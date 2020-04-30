var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

var redstyle = `background: linear-gradient(90deg, rgba(113,113,113,1) 0%, rgba(255,27,60,1) 100%);`
var greenstyle = `background: linear-gradient(90deg, rgba(113,113,113,1) 0%, rgba(27,255,139,1) 100%);`
var bluestyle = `background: linear-gradient(90deg, rgba(113,113,113,1) 0%, rgba(51,132,255,1) 100%);`


module.exports = {
  name: 'Black And White',
  tooltip: 'Convert color images to grayscale',
  knobs: {
    'Red': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 20,
      step: 0.5,
      style: redstyle,
    },
    'Green': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 20,
      step: 0.5,
      style: greenstyle,
    },
    'Blue': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 60,
      step: 0.5,
      style: bluestyle,
    },
    'Normalize': {
      type: 'checkbox',
      value: true,
    },
  },
  takesMask: true,
  framebuffers: [],
  stages: [
    {
      shadername: 'colormat',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'r': 'r',
        'g': 'g',
        'b': 'b',
      },
      knob_bindings: {
        'Red': function(v, set, k) {
          var sum
          var mix = [k['Red'].value, k['Green'].value, k['Blue'].value]
          if (k.Normalize.value) sum = mix[0] + mix[1] + mix[2]
          else sum = 100
          mix = [mix[0]/sum,mix[1]/sum,mix[2]/sum]
          set('r', 'vec3', mix)
          set('g', 'vec3', mix)
          set('b', 'vec3', mix)
        }
      },
      inputs: ['in', 'mask'],
      inputBindings: ['texSampler', 'maskSampler'],
      out: 'out',
    },
  ],
}
