// this file links the widgets/shaders with their ui elements

// creates the ui elements and links them to the global state
function createWidgetUIs() {
  if (widgetUiElements) {
    Object.keys(widgetUiElements).forEach((elname) => {
      widgetUiElements[elname].remove()
      delete widgetUiElements[elname]
    })
  }
  widgetUiElements = {}
  widgetState = {}
  widgetOrder.forEach((widgetname) => {
    var widget = widgets[widgetname]
    var wui = createWidgetUi(options, widget)
    widgetState[widgetname] = {}
    console.log('made widget', widgetname)
    // callback to update widget data
    wui.ondata = function(data) {
      widgetState[widgetname] = data
    }
    // callback only for when the user changes the data
    wui.onchange = function() {
      setTimeout(projectChange, 0)
    }
    wui.getData()
    widgetUiElements[widgetname] = wui
  })
}

// creates a single object that holds exclusivly the values of each widgets knobs
function genSaveState(activeWidgets, widgetData) {
    var result = {}
    result.activeWidgets = activeWidgets
    result.data = {}
    // loop over all active widgets
    activeWidgets.forEach((widgetname) => {
      result.data[widgetname] = {}
      // loop over all values associated with the widget
      var widget = widgetData[widgetname]
      Object.keys(widget).forEach((valuename) => {
        result.data[widgetname][valuename] = {}
        result.data[widgetname][valuename].valueType = widget[valuename].valueType
        result.data[widgetname][valuename].value = getStoreValue(widget[valuename])
      });
    })

    return result
}

// wrapper for genSaveState
function newSaveState() {
  return genSaveState(widgetOrder, widgetState)
}

// gets the storage version of a knob (no extra data, no methods)
function getStoreValue(data) {
  if (data.valueType == "value") return data.value
  else if (data.valueType == "curves") return getCurvesData(data.value)
}

function loadSaveState(data, fromUndo) {
  if (!arraysEqual(widgetOrder, data.activeWidgets)) {
    console.log('new widget order != to new one, remaking widgetUi elements, and framebuffer resources')
    widgetOrder = data.activeWidgets
    createWidgetUIs()
    triggerRecreateFrameBuffers(pgl)
  }
  Object.keys(data.data).forEach((widgetname) => {
    console.log('morphing widget', widgetname)
    widgetUiElements[widgetname].morphTo(data.data[widgetname], fromUndo)
  })
  projectChange(fromUndo)
}

// helper function
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
