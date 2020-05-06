var dcraw
try {
  dcraw = require('dcrawjs')
} catch (err) {
  console.log('unable to load dcrawjs', err)
}

function getImageData(img) {
  var canvas = document.createElement('canvas')
  var context = canvas.getContext('2d')
  canvas.width = img.width
  canvas.height = img.height
  context.drawImage(img, 0, 0 )
  return context.getImageData(0, 0, img.width, img.height)
}

function loadImageBase64(format, base64, onload) {
  const image = new Image();
  image.onload = function() {
    onload(image)
  }
  image.src = `data:image/${format};base64,` + base64
}

function loadImage(path, onload) {
  var imageB64 = fs.readFileSync(path).toString('base64')
  var imageFormat = path.split('.')
  imageFormat = imageFormat[imageFormat.length-1]
  loadImageBase64(imageFormat, imageB64, onload)
}

function getImageDataFromPath(path, callback) {
  loadImage(path, function(image){
    callback(getImageData(image), image.width, image.height, image)
  })
}

async function loadSource(gl, path, callback) {
  var fileName = path.split('/')
  if (fileName.length === 1) fileName = path.split("\\")
  document.getElementById('filename-tag').textContent = fileName[fileName.length-1]
  var srcFormat = imagePath.split('.')
  srcFormat = srcFormat[srcFormat.length-1].toLowerCase()
  // this will either be used to create the image buffer in the case of a package, or tunrned into the
  // image buffer in case of a simple image
  var loadingBuff = fs.readFileSync(imagePath)
  console.log('loading image of type', srcFormat)
  await loadSourceFromTypeData(gl, srcFormat, loadingBuff, null, callback, path)
}

// loads data from a format and buffer
// if the format is a simple image, it will be converted to a base64 encoded string
// and passed along, if it is a package the image will be extracted and passed back
// to this function
async function loadSourceFromTypeData(gl, imageFormat, imageBuff, imageB64, callback, path) {
  if (imageFormat === "dkg") {
    console.log('determined source type: package, unwrapping and reloading')
    srcPackage = JSON.parse(fs.readFileSync(imagePath))
    imageFormat = srcPackage.image.format
    imageB64 = srcPackage.image.data
    loadSourceFromTypeData(gl, imageFormat, null, imageB64, callback)
    return

  }
  // create a base64 version if we dont have one
  // at this point we know it will be of the image because the data is not a package
  if (!imageB64) var imageB64 = imageBuff.toString('base64')
  if (imageFormat === 'png' || imageFormat === 'jpg' || imageFormat === 'jpeg') {
    console.log('determined simple image format, loading directly with webgl')
    // simple loading that can be passed on to js
    sourceImage = loadTexture(gl, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageFormat, imageB64, callback)
    return

  }
  // create a buffer if the file was loaded from a base64 string, everything below will need a real buffer
  if (!imageBuff) var imageBuff = Buffer.from(imageB64, 'base64')

  // check for complex formats
  if (imageFormat === 'tiff' || imageFormat === 'tif') {
    // tiff loading in helper function
    console.log('determined tiff image')
    loadSourceImageTIFF(gl, imageBuff, callback)
    return

  } else if (imageFormat === 'dng' || imageFormat === 'arw'|| imageFormat === "crw" || imageFormat === "cr2" || imageFormat === "mrw" || imageFormat === "nef") {
    // load raw formats with dcraw.js
    console.log('determined RAW image, loading with dcrwaw')
    if (!path) throw new Error('raw images must be loaded by path')
    try {
      // load dcraw
      if (!dcraw) throw new Error('dcraw missing')
      if (eventLoadRawImage) eventLoadRawImage()
      loadSourceFromTypeData(gl, 'tiff', await dcraw(path), null, callback, null)
      // loadSourceImageTIFF(gl, await dcraw(path), callback)
    } catch (err) {
      console.error('there was an error while trying to load a raw image with dcraw', err)
      return
    }
  } else {
    console.error('could not determine a suitable loader for image')
  }
}

function loadSourceImageTIFF(gl, imageBuff, callback) {
  // extract the tiff data
  var tiff = TIFF.read(imageBuff)
  // use the last readable image
  var tiffimage
  tiff.images.forEach((image, i) => { if (image.readable) tiffimage = image })
  if (!tiffimage) throw new Error('failed to find readable image from tiff file')
  // read the image
  var image = ImageToArrayBufferView(tiffimage)
  // if we loaded the image as a 16 bit image, enable 16 bits mode
  if (image.glImageInternalFormat === 'RGBA16F') bits16Mode = true
  // load the image to gl
  sourceImage = loadTextureArray(gl, gl[image.glImageInternalFormat], gl[image.glImageFormat], gl[image.glImageType], image.width, image.height, image.data, callback, false)
}
