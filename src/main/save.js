var FORMAT = {
  version: '0.1',
  compatable: ['0.1'],
}

var projectPath = null

function createBundle (activeWidgets, widgets, imageFormat, imageB64) {
  var result = {}
  result.version = FORMAT.version
  result.settings = {}

  // copy over current knobs
  activeWidgets.forEach((widgetname, i) => {
    var widget = widgets[widgetname]
    var w = {}
    Object.keys(widget.knobs).forEach((knobname, i) => {
      var knob = widget.knobs[knobname]
      w[knobname] = {
        name: knobname,
        // type: knob.type,
        value: knob.value,
      }
    })
    result.settings[widgetname] = w
  })
  result.image = {
    format: imageFormat,
    data: imageB64,
  }

  return result
}

function loadPackage (pkg, order, widgets, srcpath) {
  // TODO: add version checking
  var pkgWidgets = Object.keys(pkg.settings)
  order = []
  pkgWidgets.forEach((widgetname, i) => {
    var widget = widgets[widgetname]
    var pkgWidget = pkg.settings[widgetname]
    if (!widget) {
      // TODO: better error handling
      alert('unable to load package')
      throw new Error('loading error')
    } else {
      order.push(widgetname)
      Object.keys(pkgWidget).forEach((knob) => {
        widget.knobs[knob].value = pkgWidget[knob].value
      });
    }
  })
  projectPath = srcpath
  saveButtonSuccess()
}

function saveBundle (file, bundle, callback) {
  fs.writeFile(file, JSON.stringify(bundle), callback)
}

async function saveProject() {
  if (projectPath === null) {
    var file = await dialog.showSaveDialog({
      title: 'Save Project',
      properties: ['createDirectory', 'showOverwriteConfirmation'],
      filters: [
        { name: 'Open Darkroom Package', extensions: ['dkg'] },
      ]
    })
    if (file.canceled) {
      return
    } else {
      projectPath = file.filePath
    }
  }
  console.log('saving to', projectPath)
  saveBundle(projectPath, createBundle(widgetOrder, widgets, imageFormat, imageB64), function(err){
    if (err) {
      saveButtonDanger()
      dialog.showMessageBoxSync(this, {
        type: 'error',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Saving Failed!',
        detail: err.toString(),
      });
    } else {
      saveButtonSuccess()
    }
  })
}

async function saveProjectAs() {
  var file = await dialog.showSaveDialog({
    title: 'Save Project',
    properties: ['createDirectory', 'showOverwriteConfirmation'],
    filters: [
      { name: 'Open Darkroom Package', extensions: ['dkg'] },
    ]
  })
  if (file.canceled) {
    return
  } else {
    projectPath = file.filePath
  }
  console.log('saving to', projectPath)
  saveBundle(projectPath, createBundle(widgetOrder, widgets, imageFormat, imageB64), function(err){
    if (err) {
      saveButtonDanger()
      dialog.showMessageBoxSync(this, {
        type: 'error',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Saving Failed!',
        detail: err.toString(),
      });
    } else {
      saveButtonSuccess()
    }
  })
}

// exporting
async function exportProject(){
  exportImage('JPEG', {quality: 1.0})
}

async function exportImage (format, opt) {
  // create an anchor to download from
  var a = document.createElement('a')
  if (format === "PNG"){
    a.download = 'image.png'
  } else if (format === "JPEG"){
    a.download = 'image.jpeg'
  } else {
    throw new Error('unknown format ' + format)
  }
  // get the framebuffer as a blob
  var blob = await framebufferToBlob(pgl, format, framebuffers.final, opt)
  // attach it to the anchor
  a.href = URL.createObjectURL(blob)
  setTimeout(function () { URL.revokeObjectURL(a.href) }, 4E4)
  setTimeout(function () { a.click() }, 0)
}

// convert data url to a blob
function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], {type: mimeString});
  return blob;

}

// changing the save buttons colors
function clearSaveButtonColor() {
  savebutton.classList.remove('background-success')
  savebutton.classList.remove('background-warning')
  savebutton.classList.remove('background-danger')
}

function saveButtonSuccess() {
  clearSaveButtonColor()
  savebutton.classList.add('background-success')
}

function saveButtonWarning() {
  clearSaveButtonColor()
  savebutton.classList.add('background-warning')
}

function saveButtonDanger() {
  clearSaveButtonColor()
  savebutton.classList.add('background-danger')
}
