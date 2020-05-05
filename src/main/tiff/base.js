// describes baseline tiff

const TIFF = {
  header: {
    endianness:   { offset: 0, bytes: 2 },
    magicNumber:  { offset: 2, bytes: 2 },
    firstIFD:     { offset: 4, bytes: 4 },
  },

  ifd: {
    count: { offset: 0, bytes: 2 },
  },

  ifdEntry: {
    tag:          { offset: 0, bytes: 2 },
    type:         { offset: 2, bytes: 2 },
    count:        { offset: 4, bytes: 4 },
    valueOffset:  { offset: 8, bytes: 4 },
  },

  dataTypes: {
    1: {
      type: 'BYTE',
      size: 1,
      read: function(r, offset){ return r.readUint(offset, 1) },
    },
    2: {
      type: 'ASCII',
      size: 1,
      read: function(r, offset){ return String.fromCharCode(r.readUint(offset, 1)) },
    },
    3: {
      type: 'SHORT',
      size: 2,
      read: function(r, offset){ return r.readUint(offset, 2) },
    },
    4: {
      type: 'LONG',
      size: 4,
      read: function(r, offset){ return r.readUint(offset, 4) },
    },
    5: {
      type: 'RATIONAL',
      size: 8,
      read: function(r, offset){ return r.readUint(offset, 4)/r.readUint(offset+4, 4) },
    },
    // tiff6
    6: {
      type: 'SBYTE',
      size: 1,
      read: function(r, offset){ return r.readInt(offset, 1) },
    },
    7: {
      type: 'UNDEFINED',
      size: 1,
      read: function(r, offset){ return r[offset] },
    },
    8: {
      type: 'SSHORT',
      size: 2,
      read: function(r, offset){ return r.readInt(offset, 2) },
    },
    9: {
      type: 'SLONG',
      size: 4,
      read: function(r, offset){ return r.readInt(offset, 4) },
    },
    10: {
      type: 'SRATIONAL',
      size: 8,
      read: function(r, offset){ return r.readInt(offset, 4)/r.readInt(offset+4, 4) },
    },
    11: {
      type: 'FLOAT',
      size: 4,
      read: function(r, offset){ return r.readFloat(offset) },
    },
    12: {
      type: 'DOUBLE',
      size: 8,
      read: function(r, offset){ return r.readDouble(offset) },
    },
  }
}

const BASELINE = {

  // Bilevel Images
  262: function (ifd) {
    var value = {0:'WhiteIsZero', 1:'BlackIsZero', 2:'RGB', 3: 'Palette', 4: 'TransparencyMask', 32803: 'DNG_CFA', 34892: 'DNG_LINEARRAW'}[ifd.data[0]]
    if (!value) value = ifd.data[0]
    return {
      tag: 'PhotometricInterpretation',
      value: value,
    }
  },

  259: function (ifd) {
    return {
      tag: 'Compression',
      value: {0:'UNKNOWN', 1:'Uncompressed', 2:'CCITT', 6: 'JPEG', 7: 'DNG_JPEG', 32773:'PackBits', 34892: 'DNG_LOSSYJPEG'}[ifd.data[0]]
    }
  },

  257: function (ifd) {
    return {
      tag: 'ImageHeight',
      value: ifd.data[0],
    }
  },
  256: function (ifd) {
    return {
      tag: 'ImageWidth',
      value: ifd.data[0],
    }
  },

  296: function (ifd) {
    return {
      tag: 'ResolutionUnit',
      value: {1:'NONE', 1:'NONE', 2:'Inch', 3:'Centimeter'}[ifd.data[0]],
    }
  },

  282: function (ifd) {
    return {
      tag: 'XResolution',
      value: ifd.data[0],
    }
  },
  283: function (ifd) {
    return {
      tag: 'YResolution',
      value: ifd.data[0],
    }
  },

  278: function (ifd) {
    return {
      tag: 'RowsPerStrip',
      value: ifd.data[0],
    }
  },
  273: function (ifd) {
    return {
      tag: 'StripOffsets',
      value: ifd.data,
    }
  },
  279: function (ifd) {
    return {
      tag: 'StripByteCounts',
      value: ifd.data,
    }
  },

  // Grayscale Images
  258: function (ifd) {
    return {
      tag: 'BitsPerSample',
      value: ifd.data,
    }
  },

  // Palette-color Images
  320: function (ifd) {
    return {
      tag: 'ColorMap',
      value: ifd.data,
    }
  },

  // RGB Full Color Images
  277: function (ifd) {
    return {
      tag: 'SamplesPerPixel',
      value: ifd.data[0],
    }
  },

  // other
  315: function (ifd) {
    return {
      tag: 'Artist',
      value: ifd.data.join(''),
    }
  },
  33432: function (ifd) {
    return {
      tag: 'Copyright',
      value: ifd.data.join(''),
    }
  },
  306: function (ifd) {
    return {
      tag: 'DateTime',
      value: ifd.data.join(''),
    }
  },
  338: function (ifd) {
    return {
      tag: 'ExtraSamples',
      value: ifd.data,
    }
  },
  266: function (ifd) {
    return {
      tag: 'FillOrder',
      value: ifd.data[0],
    }
  },
  289: function (ifd) {
    return {
      tag: 'FreeByteCounts',
      value: ifd.data[0],
    }
  },
  288: function (ifd) {
    return {
      tag: 'FreeOffsets',
      value: ifd.data[0],
    }
  },
  291: function (ifd) {
    return {
      tag: 'GrayResponseCurve',
      value: ifd.data,
    }
  },
  290: function (ifd) {
    return {
      tag: 'GrayResponseUnit',
      value: ifd.data,
    }
  },
  316: function (ifd) {
    return {
      tag: 'HostComputer',
      value: ifd.data.join(''),
    }
  },
  270: function (ifd) {
    return {
      tag: 'ImageDescription',
      value: ifd.data.join(''),
    }
  },
  271: function (ifd) {
    return {
      tag: 'Make',
      value: ifd.data.join(''),
    }
  },
  272: function (ifd) {
    return {
      tag: 'Model',
      value: ifd.data.join(''),
    }
  },
  281: function (ifd) {
    return {
      tag: 'MaxSampleValue',
      value: ifd.data[0],
    }
  },
  280: function (ifd) {
    return {
      tag: 'MinSampleValue',
      value: ifd.data[0],
    }
  },
  254: function (ifd) {
    return {
      tag: 'NewSubfileType',
      value: ifd.data[0],
    }
  },
  274: function (ifd) {
    return {
      tag: 'Orientation',
      value: ifd.data[0],
    }
  },
  284: function (ifd) {
    return {
      tag: 'PlanarConfiguration',
      value: ifd.data[0],
    }
  },
  305: function (ifd) {
    return {
      tag: 'Software',
      value: ifd.data.join(''),
    }
  },
  255: function (ifd) {
    return {
      tag: 'SubfileType',
      value: ifd.data[0],
    }
  },
  263: function (ifd) {
    return {
      tag: 'Threshholding',
      value: ifd.data[0],
    }
  },

}

module.exports.TIFF = TIFF
module.exports.BASELINE = BASELINE
