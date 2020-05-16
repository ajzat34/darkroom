var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

module.exports = {
  name: 'Clarity',
  knobs: {
    'Radius': {
      type: 'slider',
      minValue: 0,
      maxValue: 128,
      value: 0,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Amount': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 0,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Lighten': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 100,
      step: 0.5,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
    'Darken': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 100,
      step: 0.5,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`
    },
  },
  takesMask: false,
  framebuffers: ['b1', 'b2', 'weights'],
  stages: [
    {
      shadername: 'gaussian_h32',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
      },
      knob_bindings: {
        'Radius': function(v, set,k,abort) {
          set('weights', 'texture', {
            width: 32/4,
            height: 1,
            format: 'RGBA32F',
            data: Float32Array.from(gaussianNDist(32, v/2)),
          })
        },
      },
      inputs: ['in', 'weights'],
      inputBindings: ['texSampler', 'weights'],
      out: 'b1',
    },

    {
      shadername: 'gaussian_v32',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
      },
      knob_bindings: {
        'Radius': function(v, set,k,abort) {
          set('weights', 'texture', {
            width: 32/4,
            height: 1,
            format: 'RGBA32F',
            data: Float32Array.from(gaussianNDist(32, v/2)),
          })
        },
      },
      inputs: ['b1', 'weights'],
      inputBindings: ['texSampler', 'weights'],
      out: 'b2',
    },

    {
      shadername: 'gaussian_h32',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
      },
      knob_bindings: {
        'Radius': function(v, set,k,abort) {
          set('weights', 'texture', {
            width: 32/4,
            height: 1,
            format: 'RGBA32F',
            data: Float32Array.from(gaussianNDist(32, v/2)),
          })
        },
      },
      inputs: ['b2', 'weights'],
      inputBindings: ['texSampler', 'weights'],
      out: 'b1',
    },

    {
      shadername: 'gaussian_v32',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
      },
      knob_bindings: {
        'Radius': function(v, set,k,abort) {
          set('weights', 'texture', {
            width: 32/4,
            height: 1,
            format: 'RGBA32F',
            data: Float32Array.from(gaussianNDist(32, v/2)),
          })
        },
      },
      inputs: ['b1', 'weights'],
      inputBindings: ['texSampler', 'weights'],
      out: 'b2',
    },

    {
      shadername: 'gaussian_h32',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
      },
      knob_bindings: {
        'Radius': function(v, set,k,abort) {
          set('weights', 'texture', {
            width: 32/4,
            height: 1,
            format: 'RGBA32F',
            data: Float32Array.from(gaussianNDist(32, v/2)),
          })
        },
      },
      inputs: ['b2', 'weights'],
      inputBindings: ['texSampler', 'weights'],
      out: 'b1',
    },

    {
      shadername: 'gaussian_v32',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
      },
      knob_bindings: {
        'Radius': function(v, set,k,abort) {
          set('weights', 'texture', {
            width: 32/4,
            height: 1,
            format: 'RGBA32F',
            data: Float32Array.from(gaussianNDist(32, v/2)),
          })
        },
      },
      inputs: ['b1', 'weights'],
      inputBindings: ['texSampler', 'weights'],
      out: 'b2',
    },

    {
      shadername: 'gaussian_h32',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
      },
      knob_bindings: {
        'Radius': function(v, set,k,abort) {
          set('weights', 'texture', {
            width: 32/4,
            height: 1,
            format: 'RGBA32F',
            data: Float32Array.from(gaussianNDist(32, v/2)),
          })
        },
      },
      inputs: ['b2', 'weights'],
      inputBindings: ['texSampler', 'weights'],
      out: 'b1',
    },

    {
      shadername: 'gaussian_v32',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
      },
      knob_bindings: {
        'Radius': function(v, set,k,abort) {
          set('weights', 'texture', {
            width: 32/4,
            height: 1,
            format: 'RGBA32F',
            data: Float32Array.from(gaussianNDist(32, v/2)),
          })
        },
      },
      inputs: ['b1', 'weights'],
      inputBindings: ['texSampler', 'weights'],
      out: 'b2',
    },

    {
      shadername: 'gaussian_h32',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
      },
      knob_bindings: {
        'Radius': function(v, set,k,abort) {
          // if (v<256 || v>=512) abort()
          set('weights', 'texture', {
            width: 32/4,
            height: 1,
            format: 'RGBA32F',
            data: Float32Array.from(gaussianNDist(32, v/2)),
          })
        },
      },
      inputs: ['b2', 'weights'],
      inputBindings: ['texSampler', 'weights'],
      out: 'b1',
    },

    {
      shadername: 'gaussian_v32',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
      },
      knob_bindings: {
        'Radius': function(v, set,k,abort) {
          set('weights', 'texture', {
            width: 32/4,
            height: 1,
            format: 'RGBA32F',
            data: Float32Array.from(gaussianNDist(32, v/2)),
          })
        },
      },
      inputs: ['b1', 'weights'],
      inputBindings: ['texSampler', 'weights'],
      out: 'b2',
    },

    {
      shadername: 'clarity',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'amount': 'amount',
        'lighten': 'lighten',
        'darken': 'darken',
      },
      knob_bindings: {
        'Amount': function(v, set) {
          set('amount', 'float', v/100)
        },
        'Lighten': function(v, set) {
          set('lighten', 'float', v/100)
        },
        'Darken': function(v, set) {
          set('darken', 'float', v/100)
        },
      },
      inputs: ['in', 'b2'],
      inputBindings: ['texSampler', 'blurSampler'],
      out: 'out',
    },
  ],
}
