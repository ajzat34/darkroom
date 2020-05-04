// for detaching copys
const lodash = require('lodash')
const clone = require('lodash').clone
const clonedeep = require('lodash').cloneDeep

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
    var renderpassindex = -1
    renderPasses.forEach((rp, i) => {
      if (rp.includes(widgetname)) renderpassindex = i
    })
    if (renderpassindex === -1) throw new Error(`could not locate ${widgetname} in render passes`)

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
      setTimeout(function(){projectChange(false, renderpassindex)}, 0)
    }
    wui.getData()
    widgetUiElements[widgetname] = wui
  })
}

// creates a single object that holds exclusivly the values of each widgets knobs
function genSaveState(activeWidgets, widgetData, renderPasses) {
    var result = {}
    result.activeWidgets = activeWidgets
    result.renderPasses = renderPasses
    result.data = {}
    // loop over all active widgets
    activeWidgets.forEach((widgetname) => {
      result.data[widgetname] = {}
      // loop over all values associated with the widget
      var widget = widgetData[widgetname]
      Object.keys(widget).forEach((valuename) => {
        if (valuename === '_enabled') {result.data[widgetname][valuename] = widget[valuename]; return}
        result.data[widgetname][valuename] = {}
        result.data[widgetname][valuename].valueType = widget[valuename].valueType
        result.data[widgetname][valuename].value = getStoreValue(widget[valuename])
      });
    })

    result.layerMasks = {}
    // loop over all active widgets
    activeWidgets.forEach((widgetname) => {
      var widget = widgets[widgetname]
      if (widget.takesMask) {
        // json is for deep clone
        result.layerMasks[widgetname] = widget.mask.strokes
      }
    })

    // finally, we use a deep clone to entirely sepereate this state from the current one
    return clonedeep(result)
}

function newSaveState() {
  return genSaveState(widgetOrder, widgetState, renderPasses)
}

// gets the storage version of a knob (no extra data, no methods)
function getStoreValue(data) {
  if (data.valueType == "value") return data.value
  else if (data.valueType == "curves") return getCurvesData(data.value)
}

function loadSaveState(loadData, fromUndo) {
  // use a deep clone to detach the original from the data that will be loaded
  // this will prevent updates from modifing the save state
  var data = clonedeep(loadData)
  if (!arraysEqual(widgetOrder, data.activeWidgets) || !lodash.isEqual(renderPasses, data.renderPasses)) {
    console.log('new widget order differes, remaking widgetUi elements, and framebuffer resources')
    widgetOrder = data.activeWidgets
    renderPasses = data.renderPasses
    createWidgetUIs()
    triggerRecreateFrameBuffers(pgl)
  }
  Object.keys(data.data).forEach((widgetname) => {
    widgetUiElements[widgetname].morphTo(data.data[widgetname])
  })

  // loop over all active widgets
  Object.keys(data.layerMasks).forEach((widgetname) => {
    var widget = widgets[widgetname]
    if (widget.takesMask) {
      widget.mask.load(data.layerMasks[widgetname])
    }
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
