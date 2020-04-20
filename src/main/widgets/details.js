var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

module.exports = {
  name: 'Details',
  knobs: {
    'Sharpen': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 0,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Radius': {
      type: 'slider',
      minValue: 0,
      maxValue: 120,
      value: 50,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Masking': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Denoise': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 0,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Color Noise': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 80,
      step: 0.1,
    },
    'Value Noise': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 25,
      step: 0.1,
    },
    'Saturation Noise': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 10,
      step: 0.1,
    },
    'Kernel': {
      type: 'slider',
      minValue: 3,
      maxValue: 7,
      value: 3,
      step: 2,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Noise Gamma': {
      type: 'slider',
      minValue: 0,
      maxValue: 300,
      value: 100,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Visualize Image Processing': {
      type: 'checkbox',
      value: false,
    },
  },
  framebuffers: ['maps'],
  stages: [
    {
      shadername: 'details',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'kernel-size': 'ksize',
        'edge-detect-kernel-size': 'eksize',
        'sharpen-weights': 'blurweights',
        'edge-detect-weights': 'edgeweights',
        'masking': 'masking',
        'noisegamma': 'noisegamma',
        'sharpen': 'sharpen',
        'denoise': 'denoise',
        'hsvweights': 'hsvweights',
      },
      knob_bindings: {
        'Kernel': function(v, set, k) {
          var kernel = v
          var stdev = ((k['Radius'].value/100) * nFromKsize(kernel))
          set('kernel-size', 'int', kernel)
          set('sharpen-weights', 'floatarray', gaussianNDist2D(kernel, stdev))
        },
        "Masking": function(v, set) {
          set('masking', 'float', v/1000)
        },
        "Noise Gamma": function(v, set) {
          set('noisegamma', 'float', 1/(v/100))
        },
        "Sharpen": function(v, set) {
          set('sharpen', 'float', v/2)
        },
        "Denoise": function(v, set) {
          set('denoise', 'float', v/4)
        },
        'Color Noise': function(v, set, k){
          var h = k['Color Noise'].value/100
          var s = k['Value Noise'].value/100
          var v = k['Saturation Noise'].value/100
          var sum = h+s+v
          set('hsvweights', 'vec3', [h/sum, s/sum, v/sum])
        }
      },
      inputs: ['in'],
      inputBindings: ['texSampler'],
      out: 'maps',
    },

    {
      shadername: 'detailsmixer',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name

        '__imagesize__': 'size',
        'balance': 'balance',
        'slimit': 'slimit',
        'dlimit': 'dlimit',
        'showmask': 'showmask',
        'sharpen': 'sharpen',
        'denoise': 'denoise',
      },
      knob_bindings: {
        'Masking': function(v, set) {
          set('balance', 'float', v/1000)
        },
        'Sharpen': function(v, set) {
          set('sharpen', 'float', (v/5))
        },
        'Denoise': function(v, set) {
          set('denoise', 'float', (v/2))
        },
        'Visualize Image Processing': function(v, set) {
          set('showmask', 'bool', v)
        },
      },
      inputs: ['in', 'maps'],
      inputBindings: ['imageSampler', 'blurSampler'],
      out: 'out',
    },
  ],
}
