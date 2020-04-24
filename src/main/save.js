// NEEDS TESTING
// NEEDS LOTS OF WORK

var FORMAT = {
  version: '0.3',
  compatable: ['0.3'],
}

var projectPath = null

// creates an object with all of the save-data
function createBundle (activeWidgets, widgetData, imageFormat, imageB64) {
  var result = {}
  result.version = FORMAT.version
  result.saveState = genSaveState(activeWidgets, widgetState)
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
  stateSaved()
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
      historyEventSaved()
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
  saveProject()
}

async function requestAutosave(callback) {
  clearTimeout(autosaveTimer)
  autosaveTimer = setTimeout(function(){autosave(callback)}, 1000)
}

async function autosave(callback) {

  // if there is no path already chosen, give up
  if (projectPath === null) {
    return
  }

  // wait for idle before autosaving
  requestIdleCallback(function(){
    console.log('autosaving to', projectPath)
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
        historyEventSaved()
        callback()
      }
    })
  }, { timeout: 5000 })

}

// exporting
// TODO: add format selection dialog
async function exportProject(){
  // exportImage('JPEG', {quality: 1.0})
  var settings = ipcRenderer.sendSync('create-child', {path: 'dialog/export.html'})
  if (settings.window.closed) {
    return
  }
  exportImage(settings.window.format, settings.window.quality)
}

// export with write file
async function exportImage(format, quality) {
  var path
  var format
  var filters = []
  if (format === "JPEG") filters.push({ name: 'JPEG', extensions: ['jpg', 'jpeg'] })
  if (format === "PNG") filters.push({ name: 'PNG', extensions: ['png'] })
  if (format === "TIFF") filters.push({ name: 'TIFF', extensions: ['tiff'] })
  var file = await dialog.showSaveDialog({
    title: 'Export Image',
    properties: ['createDirectory', 'showOverwriteConfirmation'],
    filters: filters,
  })
  if (file.canceled) {
    return
  } else {
    path = file.filePath
  }
  var blob = await framebufferToBlob(pgl, format, framebuffers.final, {quality: quality})
  var reader = new FileReader()
  reader.onload = function(){
      var buffer = new Buffer(reader.result)
      fs.writeFile(path, buffer, {}, (err, res) => {
          if(err){
              alert('exporting failed! \n\n' + err.toString())
              console.error(err)
              return
          }
          console.log('exported')
      })
  }
  reader.readAsArrayBuffer(blob)
}

async function exportFrameBuffer(fb) {
  var path
  var file = await dialog.showSaveDialog({
    title: 'Export Framebuffer',
    properties: ['createDirectory', 'showOverwriteConfirmation'],
  })
  if (file.canceled) {
    return
  } else {
    path = file.filePath
  }
  var blob = await framebufferToBlob(pgl, 'PNG', fb)
  var reader = new FileReader()
  reader.onload = function(){
      var buffer = new Buffer(reader.result)
      fs.writeFile(path, buffer, {}, (err, res) => {
          if(err){
              alert('exporting failed! \n\n' + err.toString())
              console.error(err)
              return
          }
          console.log('exported')
      })
  }
  reader.readAsArrayBuffer(blob)
}
