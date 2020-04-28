// for reading tiffs & extentions of tiff like dng

const {TIFF, BASELINE} = require('./base.js')
const EXIF = require('./exif.js')
const DNG = require('./dng.js')
const {Reader} = require('./reader.js')

function readFromReader (r) {
  var result = {
    endianness: null,
    isTiff: false,
    reader: r,
    ifds: [],
    images: [],
  }

  // read the header
  // endianness
  var endiannessEnum = r.readField(TIFF.header.endianness, 0)
  if (endiannessEnum === 0x4949) {r.setLittleEndian(); result.endianness = 'little'}
  else if (endiannessEnum === 0x4d4d) {r.setBigEndian(); result.endianness = 'big'}
  else return result

  // bytes 2/3 = 42 if the file is a tiff
  if (r.readField(TIFF.header.magicNumber, 0) === 42) result.isTiff = true
  else return result

  // get the offset of the first ifd
  var firstIFD = r.readField(TIFF.header.firstIFD, 0)

  // create an array to write IFDs into
  readIFDs(result.ifds, r, firstIFD)

  result.ifds.forEach((ifd) => {
    result.images.push(makeIFDImage(r, ifd, [BASELINE, EXIF, DNG]))
  })

  return result
}

// recursivly reads ifds
function readIFDs (list, r, start) {
  var ifd = readIFD(r, start)
  list.push(ifd)
  if (ifd.next && ifd.next !== 0) readIFDs(list, r, ifd.next)
  else return
}

// read a single IFD
function readIFD (r, start) {
  var result = {
    next: null,
    entries: [],
  }
  var offset = start + 0
  var count = r.readField(TIFF.ifd.count, offset)
  offset += 2
  for (var i = 0; i<count; i++) {
    result.entries.push(readIFDEntry(r, offset))
    offset += 12
  }
  result.next = r.readUint(offset, 4)

  return result
}

function readIFDEntry (r, start) {
  var tag = r.readField(TIFF.ifdEntry.tag, start)
  var typeEnum = r.readField(TIFF.ifdEntry.type, start)
  var count = r.readField(TIFF.ifdEntry.count, start)
  var valueOffset = r.readField(TIFF.ifdEntry.valueOffset, start)

  var type = TIFF.dataTypes[typeEnum]
  if (!type) return {readable: false} // return if the data type is unknown

  // get the size and start of the data
  var dataSize = type.size * count
  var dataPointer
  if (dataSize <= 4) dataPointer = start + 8 // if the size is <4 than the data is inlined into the ifd entry
  else dataPointer = r.readUint(start+8, 4) // otherwise the next 4 bytes are an offset to the data
  var dataEnd = dataPointer + dataSize

  // read the data
  var data = []
  for (;dataPointer < dataEnd;) {
    data.push(type.read(r, dataPointer))
    dataPointer += type.size
  }

  return {
    readable: true,
    tag: tag,
    typeEnum: typeEnum,
    type: type,
    data: data,
    count: count,
  }
}

// loads an image from a tiff file reader and a parsed ifd
function makeIFDImage (r, ifd, tagReaders) {
  var tags = {}
  var unknownTags = []

  ifd.entries.forEach((entry) => {
    if (!entry.readable) return
    var tagged = false
    tagReaders.forEach((extention) => {
      if (extention[entry.tag]){
        var data = extention[entry.tag](entry)
        tags[data.tag] = data.value
        tagged = true
      }
    })
    if (!tagged) unknownTags.push(entry)
  })

  // load manditory tags
  var width = tags.ImageWidth
  var height = tags.ImageHeight
  var stripOffsets = tags.StripOffsets
  var stripSizes = tags.StripByteCounts
  var bitsPerSample = tags.BitsPerSample
  var samplesPerPixel = tags.SamplesPerPixel
  var photometricInterpretation = tags.PhotometricInterpretation
  var compression = false
  if (tags.Compression) compression = tags.Compression
  if (!width || !height || !stripOffsets || !stripSizes || !bitsPerSample || !samplesPerPixel || !photometricInterpretation) return {tags: tags, readable: false, reason: 'missing tags'}

  // read the image data
  var imageDataBuffers = []
  stripOffsets.forEach((stripOffset, i) => {
    imageDataBuffers.push(r.data.slice(stripOffset, stripOffset+stripSizes[i]))
  })
  var imageReader = new Reader(Buffer.concat(imageDataBuffers))
  imageReader.makeReaders(r.little)

  return {
    tags: tags,
    readable: true,
    width: width,
    height: height,
    bitsPerSample: Math.max(...bitsPerSample),
    samplesPerPixel: samplesPerPixel,
    compression: compression,
    reader: imageReader,
    photometricInterpretation: photometricInterpretation,
    unknownTags: unknownTags,
  }
}

// wrapper for readFromReader that creats a reader from a buffer
function readTiffFromData (data) {
  return readFromReader(new Reader(data))
}


module.exports.readFromReader = readFromReader
module.exports.read = readTiffFromData
