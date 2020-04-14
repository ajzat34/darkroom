module.exports = {
  name: 'Adjustments',
  knobs: {
    'Brightness': {
      type: 'slider',
      minValue: -255,
      maxValue: 255,
      value: 0,
    },
  },
  baseShader: 'adjustments',
  allocate_framebuffers: [],
  shaders: [
    {
      shader: 'main',
      vertAtrribVertexCoord: 'aVertex',
      vertAtrribTextureCoord: 'aTextureCoord',
      fragTextureSampler: 'texSampler',
      inputs: ['chain'],
      outputs: ['chain'],
    }
  ],
}
