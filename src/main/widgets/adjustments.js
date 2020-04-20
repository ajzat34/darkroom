var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

function cleanLut256() {
  var lut = []
  for (var i = 0; i<256; i++){
    lut[i] = i/255
  }
  return lut
}

function map(lut, callback) {
  var result = []
  for (var i = 0; i<256; i++){
    result[i] = callback(lut[i])
  }
  return result
}

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

function lutLookup(lut, filter) {
  return map(lut, function(n){
    return filter.get(n)
  })
}

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

function getIndex(x, y, width) {
  return y * (width * 4) + x * 4
}

module.exports = {
  name: 'Adjustments',
  knobs: {
    'Gamma': {
      type: 'slider',
      minValue: 0,
      maxValue: 3,
      value: 1,
      style: `background: linear-gradient(90deg, ${sliderLight} 0%, ${sliderDark} 100%);`,
      step: 0.05,
    },
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
    },
    'Show clipping': {
      type: 'checkbox',
      value: false,
    },
    'Show out of gamut colors': {
      type: 'checkbox',
      value: false,
    },
  },
  framebuffers: [],
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
        'Curves': function(v, set, k) {
          var gamma =  k['Gamma'].value
          var brightness = k['Brightness'].value/100
          var contrast = k['Contrast'].value
          if (contrast >= 0){
            contrast = 1+(contrast/100)
          } else {
            contrast = (100+contrast)/100
          }
          var blacks = k['Blacks'].value
          if (blacks >= 0){
            blacks = 1-(blacks/100)
          } else {
            blacks = (100-blacks)/100
          }
          var whites = k['Whites'].value
          if (whites >= 0){
            whites = 1+(whites/100)
          } else {
            whites = (100+whites)/100
          }
          set('lut', 'texture', {
            width: 256,
            height: 1,
            data: makeLutImage(gamma, brightness, contrast, blacks, whites, v),
          })
        }
      },
      inputs: ['in'],
      inputBindings: ['texSampler', 'lut'],
      out: 'out',
    }
  ],
}
