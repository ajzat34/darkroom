// NEEDS TESTING
// NEEDS LOTS OF WORK

var FORMAT = {
  version: '0.2',
  compatable: ['0.2'],
}

var projectPath = null

// creates an object with all of the save-data
function createBundle (activeWidgets, widgetData, imageFormat, imageB64) {
  var result = {}
  result.version = FORMAT.version
  result.saveState = genSaveState(activeWidgets, widgetState)
  console.log(result.saveState)
  result.image = {
    format: imageFormat,
    data: imageB64,
  }
  return result
}

// loads a bundle into the objects passed into it and the global state
function loadPackage (pkg, srcpath) {
  // TODO: add version checking
  if (!FORMAT.compatable.includes(pkg.version)) {
    alert('The file you are trying to load is not compatable with this version of darkroom')
    throw new Error('incompatable file version ' + pkg.versoin)
  }
  try {
    loadSaveState(pkg.saveState)
  } catch(err) {
    alert('Error loading state data, the file you are attempting to load may be corrupted. \n\n' + err.toString())
  }
  projectPath = srcpath
  saveButtonSuccess()
}

// helper function for writing files
// TODO: buffer-ify this
function saveBundle (file, bundle, callback) {
  fs.writeFile(file, JSON.stringify(bundle), callback)
}

// shows a dialog for file selection, and writes a bundle to disk
async function saveProject() {
  // if there is no path already chosen, use saveAs
  if (projectPath === null) {
    saveProjectAs()
    return
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

// same as above, does not use global projectPath for path
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
  saveProject()
}

// exporting
// TODO: add format selection dialog
async function exportProject(){
  exportImage('JPEG', {quality: 1.0})
}

// exports the result texture to file
// TODO: try to use election dialog for saving
async function exportImage (format, opt) {
  // create an anchor to download from
  var a = document.createElement('a')
  // TODO: figure out why the extension dissapers on windows
  if (format === "PNG"){
    a.download = 'image.png'
  } else if (format === "JPEG"){
    a.download = 'image.jpeg'
  } else {
    throw new Error('unknown format ' + format)
  }
  // get the final render framebuffer as a blob
  var blob = await framebufferToBlob(pgl, format, framebuffers.final, opt)
  // attach it to the anchor
  a.href = URL.createObjectURL(blob)
  // set a timeout to revoke the url
  setTimeout(function () { URL.revokeObjectURL(a.href) }, 4E4)
  // "click" the button immediately
  setTimeout(function () { a.click() }, 0)
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
