function clamp (value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function widgetUICurvesCreateControlPoint(container, x, y) {
  var pt = document.createElement("div")
  pt.x = x
  pt.y = y
  pt.classList.add("widgetUI-curves-control-point")
  pt.style.left = `${pt.x * 100}%`
  pt.style.top = `${(1-pt.y) * 100}%`
  var dragging
  pt.addEventListener("mousedown", function(e) {
    dragging = true
  })
  window.addEventListener("mouseup", function(e) {
    dragging = false
  })
  window.addEventListener("mousemove", function(e) {
    if (dragging) {
      var x = e.clientX - container.getBoundingClientRect().left;
      var y = e.clientY - container.getBoundingClientRect().top;
      pt.x = clamp(x / container.scrollWidth, 0, 1)
      pt.y = clamp(1-(y / container.scrollHeight), 0, 1)
      pt.style.left = `${pt.x * 100}%`
      pt.style.top = `${(1-pt.y) * 100}%`
    }
  })
  pt.hide = function() {
    pt.style.display = "none"
  }
  pt.unhide = function() {
    pt.style.display = null
  }
  pt.hide()
  container.appendChild(pt)
  return pt
}

function disableTab (tab) {
  tab.controlpoints.forEach((cp) => {
    cp.hide()
  })
}

function updateCurveCanvas (knob) {
  knob.activeTab.controlpoints.forEach((cp) => {
    cp.unhide()
  })
}

function switchCurvesTab(knob, newtab) {
  // make all of the other tabs not active
  knob.tabs.forEach((tab) => {
    tab.classList.remove("active")
  })

  // add the style
  newtab.classList.add("active");

  // disable all of the old tabs control points
  if (knob.activeTab) {
    disableTab(knob.activeTab)
  }

  // make this the new active tab
  knob.activeTab = newtab

  // update the canvas
  updateCurveCanvas(knob)
}

function createWidgetUiKnobCurves (name, base) {
  var knob = document.createElement("div")
  knob.widgetUiOnUpdate = function(){}
  knob.tabs = []
  knob.classList.add("widgetUI-content")
  knob.classList.add("knob")

    var titlerow = document.createElement("div")
      titlerow.classList.add("widgetUI-row")
      if (!base.hidename) {
        var title = document.createElement("div")
          title.classList.add("title")
          title.appendChild(document.createTextNode(name))
          titlerow.appendChild(title)
      }


    // create the canvas, its container, and row
    var inputrow = document.createElement("div")
    // create a 2d canvas context
    var container = document.createElement("div")
    var canvas = document.createElement("canvas")
    container.classList.add("widgetUI-curves-canvas-container")
    canvas.classList.add("widgetUI-curves-canvas")
    knob.oncreate = function() {
      var size = container.scrollWidth
      canvas.width = size * window.devicePixelRatio
      canvas.height = size * window.devicePixelRatio
    }
    inputrow.appendChild(container)
    container.appendChild(canvas)

    // create the tabs
    var tabrow = document.createElement("div")
      tabrow.classList.add("widgetUI-curves-tabs")
      // itterate over all of the tabs
      Object.keys(base.tabs).forEach((tab) => {
        var el = document.createElement("div")
        el.appendChild(document.createTextNode(tab))
        el.title = tab
        if (base.tabs[tab].color) {
          el.style.color = base.tabs[tab].color
        }
        // when this tab is clicked, make it active and update the canvas & control points
        el.addEventListener("click", function() {
          switchCurvesTab(knob, el)
        })
        // unordered list of control point elements
        el.controlpoints = []
        base.tabs[tab].default.forEach((pt, i) => {
          el.controlpoints.push( widgetUICurvesCreateControlPoint(container, base.tabs[tab].default[i].x, base.tabs[tab].default[i].y) )
        })
        // add it to the row, and knob
        tabrow.appendChild(el)
        knob.tabs.push(el)
      })
      // make the first tab active by default
      switchCurvesTab(knob, knob.tabs[0])

  // add everything above to the knob in the correct order
  knob.appendChild(titlerow)
  knob.appendChild(tabrow)
  knob.appendChild(inputrow)

  return knob
}
