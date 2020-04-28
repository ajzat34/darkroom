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
      maxValue: 100,
      value: 40,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Smart Masking': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 10,
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
    'Value Edges': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 40,
      step: 0.1,
    },
    'Saturation Edges': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 80,
      step: 0.1,
    },
    'Color Edges': {
      type: 'slider',
      minValue: 0,
      maxValue: 50,
      value: 4,
      step: 0.1,
    },
    'Gain': {
      type: 'slider',
      minValue: 0,
      maxValue: 300,
      value: 160,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Visualize Image Processing': {
      type: 'checkbox',
      value: false,
    },
    'Large Noise': {
      type: 'checkbox',
      value: false,
    },
  },
  framebuffers: ['maps'],
  takesMask: true,
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
        'Large Noise': function(v, set, k) {
          var kernel
          if (v) kernel = 5
          else kernel = 3
          var stdev = ((k['Radius'].value/100) * nFromKsize(kernel))
          set('kernel-size', 'int', kernel)
          set('sharpen-weights', 'floatarray', gaussianNDist2D(kernel, stdev))
        },
        "Gain": function(v, set) {
          set('noisegamma', 'float', 1/(v/100))
        },
        "Sharpen": function(v, set) {
          set('sharpen', 'float', v/2)
        },
        "Denoise": function(v, set) {
          set('denoise', 'float', v/4)
        },
        'Color Edges': function(v, set, k){
          var h = k['Color Edges'].value/100
          var s = k['Value Edges'].value/100
          var v = k['Saturation Edges'].value/100
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
        'Smart Masking': function(v, set) {
          set('balance', 'float', (v-25)/1000)
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
      inputs: ['in', 'maps', 'mask'],
      inputBindings: ['imageSampler', 'blurSampler', 'maskSampler'],
      out: 'out',
    },
  ],
}
