// creates a linear 256 value lut
function cleanLut256() {
  var lut = []
  for (var i = 0; i<256; i++){
    lut[i] = i/255
  }
  return lut
}

// runs a callback on each value of a lut
function map(lut, callback) {
  var result = []
  for (var i = 0; i<256; i++){
    result[i] = callback(lut[i])
  }
  return result
}

// does the usualy adjustments to a lut
function filter(lut, gamma, brightness, contrast, blacks, whites) {
  var c
  return map(lut, function(n){
    c = Math.pow(n, gamma)
    c = ((c - 0.5)*contrast)+0.5+brightness
    c = whites * ((blacks * (c-1.0))+1.0)
    c = Math.max(Math.min(c, 1), 0)
    return c
  })
}

// lookup one lut against another, effectivly combines two luts
function lutLookup(lut, filter) {
  return map(lut, function(n){
    return filter.get(n)
  })
}

// genorate a lut texture
function makeLutImage(gamma, brightness, contrast, whites, blacks, tabs) {
  var base = lutLookup(filter(cleanLut256(), gamma, brightness, contrast, whites, blacks), tabs.Luma)
  let image = new Uint8Array(4 * 256)
  for (var i = 0; i<256; i++) {
    var index = getIndex(i, 0, 256)
    image[index  ] = tabs['Red'].get(base[i]) * 255
    image[index+1] = tabs['Green'].get(base[i]) * 255
    image[index+2] = tabs['Blue'].get(base[i]) * 255
  }
  return image
}

// calculates the index of a red pixel
function getIndex(x, y, width) {
  return y * (width * 4) + x * 4
}

var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

module.exports = {
  name: 'Adjustments',
  tooltip: 'Basic color and tone adjustments',
  knobs: {
    'Gamma': {
      type: 'slider',
      minValue: 0,
      maxValue: 3,
      value: 1,
      style: `background: linear-gradient(90deg, ${sliderLight} 0%, ${sliderDark} 100%);`,
      step: 0.05,
      tooltip: `
<div class="tooltip-content">
  <h4>Gamma Correction</h4>
  <p>Lighten the image without affecting the white and black levels by non-linearly adjusting the brightness of pixels.</p>
</div>`,
    },
    'Brightness': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`,
      tooltip: `
<div class="tooltip-content">
  <h4>Brightness</h4>
  <p>Lighten or darken the entire image</p>
</div>`,
    },
    'Contrast': {
      type: 'slider',
      minValue: -50,
      maxValue: 50,
      value: 0,
      style: `background: linear-gradient(90deg, ${sliderLight} 0%, ${sliderDark} 100%);`,
      tooltip: `
<div class="tooltip-content">
  <h4>Contrast</h4>
  <p>Increase or decrease separation between light and and dark parts of the image</p>
</div>`,
    },
    'Black Level': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`,
      tooltip: `
<div class="tooltip-content">
  <h4>Black Level</h4>
  <p>Change the brightness of dark shades without affecting the brightest whites</p>
</div>`,
    },
    'White Level': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      style: `background: linear-gradient(90deg, ${sliderDark} 0%, ${sliderLight} 100%);`,
      tooltip: `
<div class="tooltip-content">
  <h4>White Level</h4>
  <p>Change the brightness of bright shades without affecting the deepest blacks</p>
</div>`,
    },
    'Saturation': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      style: 'background: linear-gradient(90deg, rgba(200,200,200,1) 0%, rgba(255,217,217,1) 14%, rgba(255,186,222,1) 28%, rgba(225,159,255,1) 42%, rgba(119,168,255,1) 57%, rgba(76,255,119,1) 71%, rgba(252,255,47,1) 85%, rgba(255,0,0,1) 100%);',
    tooltip: `
<div class="tooltip-content">
<h4>Saturation</h4>
<p>Change intensity of colors</p>
</div>`,
    },
    'Temperature': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      style: 'background: linear-gradient(90deg, rgba(101,154,255,1) 0%, rgba(250,250,250,1) 49%, rgba(255,201,96,1) 100%);',
      tooltip: `
<div class="tooltip-content">
<h4>Color Temperature</h4>
<p>Correct image white balance (blue-orange)</p>
</div>`,
    },
    'Hue': {
      type: 'slider',
      minValue: -100,
      maxValue: 100,
      value: 0,
      style: 'background: linear-gradient(90deg, rgba(187,101,255,1) 0%, rgba(250,250,250,1) 49%, rgba(145,255,136,1) 100%);',
      tooltip: `
<div class="tooltip-content">
<h4>Color Hue</h4>
<p>Correct image white balance (magenta-green)</p>
</div>`,
    },
    'Curves': {
      type: 'curves',
      // hidename: true,
      tabs: {
        "Luma": {
          color: '#ffffff',
          default: [
            {x: 0, y: 0},
            {x: 1, y: 1}
          ]
        },
        "Red": {
          color: 'rgb(224, 55, 71)',
          default: [
            {x: 0, y: 0},
            {x: 1, y: 1}
          ]
        },
        "Green": {
          color: 'rgb(42, 198, 127)',
          default: [
            {x: 0, y: 0},
            {x: 1, y: 1}
          ]
        },
        "Blue": {
          color: 'rgb(55, 112, 223)',
          default: [
            {x: 0, y: 0},
            {x: 1, y: 1}
          ]
        },
      },
      tooltip: `
<div class="tooltip-content">
<h4>Color Curves</h4>
<p>Custom Tone Mapping. Input value (horizontal axis) maps to output value (vertical axis).</p>
</div>`,
    },
    // 'Show clipping': {
    //   type: 'checkbox',
    //   value: false,
    // },
    // 'Show out of gamut colors': {
    //   type: 'checkbox',
    //   value: false,
    // },
  },
  framebuffers: [],
  takesMask: true,
  stages: [
    {
      shadername: 'adjustmentsv2',
      atrribVertexCoord: 'aVertex',
      atrribTextureCoord: 'aTextureCoord',
      uniforms: {
        // bind name : in-shader name
        '__imagesize__': 'size',
        'lut': 'lut',
        'saturation': 'saturation',
        'temperature': 'temperature',
        'hue': 'hue',
      },
      textures: ['lut'],
      knob_bindings: {
        'Curves': function(v, set, k) {
          // get the values from other sliders
          var gamma =  1/k['Gamma'].value
          var brightness = k['Brightness'].value/100
          var contrast = k['Contrast'].value
          var blacks = k['Black Level'].value
          var whites = k['White Level'].value
          // negetive contrast, blacks and whites values must be mapped to a fraction
          if (contrast >= 0)  contrast = 1+(contrast/100)
          else                contrast = (100+contrast)/100

          if (blacks >= 0)  blacks = 1-(blacks/100)
          else              blacks = (100-blacks)/100

          if (whites >= 0)  whites = 1+(whites/100)
          else              whites = (100+whites)/100

          // upload the lut
          set('lut', 'texture', {
            width: 256,
            height: 1,
            data: makeLutImage(gamma, brightness, contrast, blacks, whites, v),
          })
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
      inputs: ['in', 'mask'],
      inputBindings: ['texSampler', 'maskSampler', 'lut'],
      out: 'out',
    }
  ],
}
