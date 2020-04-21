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
    wui.onchange = function(data) {
      widgetState[widgetname] = data
      projectChange()
    }
    wui.triggerUpdate()
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

// gets the storage version of a knob (no extra data, no methods)
function getStoreValue(data) {
  if (data.valueType == "value") return data.value
  else if (data.valueType == "curves") return getCurvesData(data.value)
}

function loadSaveState(data) {
  widgetOrder = data.activeWidgets
  createWidgetUIs()
  triggerRecreateFrameBuffers(pgl)
  console.log('data', data.data)
  Object.keys(data.data).forEach((widgetname) => {
    widgetUiElements[widgetname].morphTo(data.data[widgetname])
  })
}
