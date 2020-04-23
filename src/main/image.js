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
