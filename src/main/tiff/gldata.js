// converts tiff data to opengl comptatable data

function ImageToArrayBufferView (image) {
  var bytesPerSample = Math.floor(image.bitsPerSample/8)
  if ((bytesPerSample*8) !== image.bitsPerSample) throw new Error('non power of 2 bitdepth')
  if (bytesPerSample < 1) throw new Error('bitdepth < 8')
  if (bytesPerSample > 4) throw new Error('bitdepth > 32')
  image.bytesPerSample = bytesPerSample
  if (image.photometricInterpretation === 'RGB' && image.compression === "Uncompressed") return RGBImageToArrayBufferViewNoCompression(image)
  else throw new Error('photometricInterpretation or compression is unknown: photometricInterpretation: ' + image.photometricInterpretation + ' compression: ' + image.compression)
}

function RGBImageToArrayBufferViewNoCompression(image) {
  var array
  var sample
  var maxValue
  var glImageInternalFormat
  var glImageFormat
  var glImageType
  var imageReader = image.reader
  var arraySize = 4 * image.width * image.height
  switch (image.bytesPerSample) {
    case 1:
      glImageInternalFormat = 'RGBA'
      glImageFormat         = 'RGBA'
      glImageType           = 'UNSIGNED_BYTE'
      array = new Uint8Array(arraySize)
      sample = function(offset) {
        return imageReader.readUint(offset, 1)
      }
      var maxValue = 255
      break;
    case 2:
      glImageInternalFormat = 'RGBA16F'
      glImageFormat         = 'RGBA'
      glImageType           = 'FLOAT'
      array = new Float32Array(arraySize)
      sample = function(offset) {
        return imageReader.readUint(offset, 2)/65535
      }
      var maxValue = 1
      break;
    case 4:
      glImageInternalFormat = 'RGBA32F'
      glImageFormat         = 'RGBA'
      glImageType           = 'FLOAT'
      array = new Float32Array(arraySize)
      sample = function(offset) {
        return imageReader.readUint(offset, 4)/4294967295
      }
      var maxValue = 1
      break;
    default:
      throw new Error('Something weird is going on... bytes per sample is unknown')
  }

  var bytesPerPixel = image.bytesPerSample * image.samplesPerPixel

  for (var i = 0; i<arraySize/4; i++) {
    var imageDataOffset = i*4
    var srcImageOffset = i*bytesPerPixel
    array[imageDataOffset  ] = sample(srcImageOffset)
    array[imageDataOffset+1] = sample(srcImageOffset + (image.bytesPerSample))
    array[imageDataOffset+2] = sample(srcImageOffset + (image.bytesPerSample*2))
    array[imageDataOffset+3] = maxValue
  }

  return {
    data: array,
    tags:         image.tags,
    unknownTags:  image.unknownTags,
    glImageInternalFormat:  glImageInternalFormat,
    glImageFormat:          glImageFormat,
    glImageType:            glImageType,
    width:                  image.width,
    height:                 image.height,
  }
}
