var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

module.exports = {
  name: 'Details',
  tooltip: 'Control image detail with shapening and denoising',
  knobs: {
    'Sharpen': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 0,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`,
      tooltip: `
<div class="tooltip-content">
<p>Reduce out of focus edges</p>
</div>`,
    },
    'Radius': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 40,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`,
      tooltip: `
<div class="tooltip-content">
<p>The sharpness/denoise radius</p>
</div>`,
    },
    'Smart Masking': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 10,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`,
      tooltip: `
  <div class="tooltip-content">
  <p>Uses image processing to only apply sharpening and denoising to areas that need it</p>
  </div>`,
    },
    'Denoise': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 0,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`,
      tooltip: `
  <div class="tooltip-content">
  <p>Applies High frequency noise reduction ONLY to pixels that have been selected with the "Smart Masking" adjustment. See Visualize image processing.</p>
  </div>`,
    },
    'Value Detection': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 40,
      step: 0.1,
      tooltip: `
<div class="tooltip-content">
<p>Control how much chagnes in brightness affect the smart mask</p>
</div>`,
    },
    'Saturation Detection': {
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      value: 80,
      step: 0.1,
      tooltip: `
<div class="tooltip-content">
<p>Control how much chagnes in saturation affect the smart mask</p>
</div>`,
    },
    'Color Detection': {
      type: 'slider',
      minValue: 0,
      maxValue: 50,
      value: 4,
      step: 0.1,
      tooltip: `
<div class="tooltip-content">
<p>Control how much chagnes in color affect the smart mask. Using too much color detection can cause unprectiable results.</p>
</div>`,
    },
    'Gain': {
      type: 'slider',
      minValue: 0,
      maxValue: 300,
      value: 160,
      step: 0.1,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`,
      tooltip: `
<div class="tooltip-content">
<p>Controls Noise Detection Gain. A higher gain will (disproportionately) increase the sensitivity to more subtle noise, while a lower gain will cause masking to ignore subtle noise more.</p>
</div>`,
    },
    'Visualize Image Processing': {
      type: 'checkbox',
      value: false,
      tooltip: `
<div class="tooltip-content">
<p>Pixels to be sharpened will appear green (brigheter green = more sharpening), while pixels to be denoised will appear blue. Unaffected pixes will appear black. Due to the nature of sharpening and denoisng pixels cannot be sharpened and denoised at the same time, this is why only pixels excluded from sharpening by smart mask will be denoised.</p>
</div>`,
    },
    'Large Noise': {
      type: 'checkbox',
      value: false,
      tooltip: `
<div class="tooltip-content">
<p>Enable only when a radius of at least 90 is not effective. Controls the number of pixels used in sharpening and blur calculations. Off = 3x3, On = 5x5.</p>
</div>`,
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
        'Color Detection': function(v, set, k){
          var h = k['Color Detection'].value/100
          var s = k['Value Detection'].value/100
          var v = k['Saturation Detection'].value/100
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
