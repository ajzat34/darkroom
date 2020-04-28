// for reading tiffs & extentions of tiff like dng
const {Reader} = require('./reader.js')

function readFromReader (r, tags) {
  var result = {
    endianness: null,
    isTiff: false,
    reader: r,
    image: {},
  }

  var stripOffsets
  if (typeof tags.StripOffsets === "number") stripOffsets = [tags.StripOffsets]
  else stripOffsets = tags.StripOffsets.split(' ')

  var stripByteCounts
  if (typeof tags.StripOffsets === "number") stripByteCounts = [tags.StripByteCounts]
  else stripByteCounts = tags.StripByteCounts.split(' ')

  var samplesPerPixel = tags.SamplesPerPixel
  var photometricInterpretation = tags.PhotometricInterpretation

  var width = tags.ImageWidth || tags.ExifImageWidth
  var height = tags.ImageHeight || tags.ExifImageHeight

  var bitsPerSample
  if (typeof tags.BitsPerSample === "number") bitsPerSample = [tags.BitsPerSample]
  else bitsPerSample = tags.BitsPerSample.split(' ')
  bitsPerSample.forEach((item, i) => {
    bitsPerSample[i] = parseInt(item)
  })



  var compression = tags.Compression

  // read the image data
  var imageDataBuffers = []
  stripOffsets.forEach((stripOffset, i) => {
    var offset = parseInt(stripOffset)
    imageDataBuffers.push(r.data.slice(offset, offset+parseInt(stripByteCounts[i])))
  })
  console.log(stripOffsets, stripByteCounts)
  var imageReader = new Reader(Buffer.concat(imageDataBuffers))
  imageReader.makeReaders(r.little)

  result.image = {
    reader: imageReader,
    width: width,
    height: height,
    samplesPerPixel: samplesPerPixel,
    photometricInterpretation: photometricInterpretation,
    bitsPerSample: Math.max(...bitsPerSample),
    compression: compression,
  }

  return result
}

// wrapper for readFromReader that creats a reader from a buffer
function readTiffFromData (data, tags) {
  return readFromReader(new Reader(data), tags)
}


module.exports.readFromReader = readFromReader
module.exports.read = readTiffFromData
