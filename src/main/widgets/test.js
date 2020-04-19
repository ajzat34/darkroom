var sliderDark = 'rgba(120, 120, 120, 1)'
var sliderLight = 'rgba(255,255,255,1)'

module.exports = {
  name: 'Colors',
  knobs: {
    'Curves': {
      type: 'curves',
      hidename: true,
      tabs: {
        "Luma": {
          color: '#fff',
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
  },
  framebuffers: [''],
  stages: [
  ],
}
