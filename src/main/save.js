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
