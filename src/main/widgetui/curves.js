// create the curves "knob"
function createWidgetUiKnobCurves (name, base) {
  var knob = document.createElement("div")
  knob.widgetUiOnUpdate = function(){}
  knob.tabs = []
  knob.classList.add("widgetUI-content")
  knob.classList.add("knob")

    // ceate title elements
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
      // make the first tab active by default
      switchCurvesTab(knob, knob.tabs[0])
      // when the canvas is clicked, create a control point there
      canvas.addEventListener("mousedown", function(e){
        // calculate the inital position of the new point
        var x = (e.clientX - container.getBoundingClientRect().left) / container.scrollWidth;
        var y = 1-((e.clientY - container.getBoundingClientRect().top) / container.scrollHeight);
        var pt = widgetUICurvesCreateControlPoint(container, x, y)
        pt.onmove = function() {
          updateCurveCanvas(knob)
          knob.widgetUiOnUpdate()
        }
        pt.dragging = true
        pt.unhide()
        knob.activeTab.controlpoints.push( pt )
        updateCurveCanvas(knob)
      })
    }
    knob.canvas = canvas
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
        el.color = base.tabs[tab].color
        // when this tab is clicked, make it active and update the canvas & control points
        el.addEventListener("click", function() {
          switchCurvesTab(knob, el)
        })

        // function that creates the default control points
        // used below and when reseting the curve
        el.create = function () {
          el.createFrom(base.tabs[tab].default)
        }

        // switch to a set of control points
        el.createFrom = function(newpts) {
          // remove old control points
          if (el.controlpoints) { el.controlpoints.forEach((controlpoint) => { controlpoint.remove() })   }
          // unordered list of control point elements
          el.controlpoints = []
          newpts.forEach((newpt, i) => {
            var pt = widgetUICurvesCreateControlPoint(container, newpt.x, newpt.y)
            // setup a callback for the point moving
            pt.onmove = function() {
              updateCurveCanvas(knob)
              knob.widgetUiOnUpdate()
            }
            el.controlpoints.push(pt)
          })
          createCurve(el)
        }

        // create the default control points
        el.create()

        // create a function for getting an x value
        el.get = function(x) {
          return curveEval(el, x)
        }
        // add it to the row, and knob
        tabrow.appendChild(el)
        knob.tabs.push(el)
      })

    // create the chinbar
    var chinrow = document.createElement("div")
      chinrow.classList.add("widgetUI-curves-chin")
      var btn_reset = document.createElement("button")
      btn_reset.appendChild(document.createTextNode("reset"))
      btn_reset.addEventListener("click", function(){
        knob.activeTab.create()
        updateCurveCanvas(knob)
        knob.widgetUiOnUpdate()
      })
      chinrow.appendChild(btn_reset)

  // add everything above to the knob in the correct order
  knob.appendChild(titlerow)
  knob.appendChild(tabrow)
  knob.appendChild(inputrow)
  knob.appendChild(chinrow)

  // link the value reporter
  knob.widgetUiValue = {}
  knob.tabs.forEach((tab) => {
    knob.widgetUiValue[tab.title] = tab
  })

  knob.morphTo = function(data) {
    knob.tabs.forEach((tab, i) => {
      tab.createFrom(data.value[tab.title])
    })
    updateCurveCanvas(knob)
  }

  return knob
}

// create a curves control point
function widgetUICurvesCreateControlPoint(container, x, y) {
  var pt = document.createElement("div")
  pt.classList.add("widgetUI-curves-control-point")
  // inital style
  pt.x = clamp(x, 0, 1); pt.y = clamp(y, 0, 1)
  pt.style.left = `${pt.x * 100}%`
  pt.style.top = `${(1-pt.y) * 100}%`
  // dragging events
  var dragging
  pt.addEventListener("mousedown", function(e) {
    pt.dragging = true
  })
  const mouseup = function(e) {
    pt.dragging = false
  }
  const mousemove = function(e) {
    if (pt.dragging) {
      // calculate the new x and y by taking the difference between
      // the mouse position and the corner of the canvas contrainer
      var x = e.clientX - container.getBoundingClientRect().left;
      var y = e.clientY - container.getBoundingClientRect().top;
      // clamp the position to 0-1 and divide by the size of the canvas to make it relative
      pt.x = clamp(x / container.scrollWidth, 0, 1)
      pt.y = clamp(1-(y / container.scrollHeight), 0, 1)
      // position the control point via css
      pt.style.left = `${pt.x * 100}%`
      pt.style.top = `${(1-pt.y) * 100}%`  // we set the style from top: 1-y, rather than bottom: y, or the control points can become offset
      // if a callback for moving has been set, run it now
      pt.onmove()
    }
  }
  window.addEventListener("mouseup", mouseup)
  window.addEventListener("mousemove", mousemove)
  // self destruct on right/ctrl click
  pt.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      window.removeEventListener("mouseup", mouseup)
      window.removeEventListener("mousemove", mousemove)
      pt.remove()
      pt.destroy = true
      pt.onmove()
  }, false);
  pt.hide = function() { pt.style.display = "none" }
  pt.unhide = function() { pt.style.display = null }
  pt.hide()
  container.appendChild(pt)
  return pt
}

// disable the old tab, and draw a new one
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

// update the canvas with the active tab
// TODO: draw all tabs
function updateCurveCanvas (knob) {
  // start by unhiding all of the control points
  knob.activeTab.controlpoints.forEach((pt) => { pt.unhide() })

  // purge any removed control points
  knob.activeTab.controlpoints.forEach((pt, i) => {
    if (pt.destroy){
      pt.remove()
      delete knob.activeTab.controlpoints[i]
    }
  })

  // get all the values needed for interpolation
  createCurve(knob.activeTab)

  // get the 2d context
  var ctx = knob.canvas.getContext("2d")
  // clear the canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // draw the grid
  canvasGrid(ctx)
  // draw the curve onto the canvas
  canvasCubicSpline(ctx, knob.activeTab.ox, knob.activeTab.oy, knob.activeTab.ok, knob.activeTab.color)
}

function createCurve(tab) {

  // create ordered lists (x low to high)
  controlPointSort(tab)

  // create the cubic spline k values
  // getNaturalKs insures that the diriviteves of the peicewise functions are the same at each junction
  // we also pass empty k values, to be created by cspl
  tab.ok = new Array()
  CSPL.getNaturalKs(tab.ox, tab.oy, tab.ok)

}

// create ordered lists of control points for cubic spline calculations
function controlPointSort (tab) {
  // temporary sorting lists
  var order = []
  var orderx = []
  // sort by x
  tab.controlpoints.forEach((pt, ptindex) => {
    for (var i = 0; pt.x < orderx[i]; i++) {}
    order.splice(i, 0, ptindex )
    orderx.splice(i, 0, pt.x )
  });

  // create the split x and y lists
  tab.ox = []
  tab.oy = []
  for (var i = order.length-1; i >=0; i--) {
    tab.ox.push(tab.controlpoints[order[i]].x)
    tab.oy.push(tab.controlpoints[order[i]].y)
  }

  if (tab.ox[0] !== 0) {
    tab.oy.splice(0,0,0)
    tab.ox.splice(0,0,0)
  }
  if (tab.ox[tab.ox.length-1] !== 1) {
    tab.oy.splice(tab.ox.length,0,1)
    tab.ox.splice(tab.ox.length,0,1)
  }
}

// draws a grid
function canvasGrid(ctx) {
  var width = ctx.canvas.width
  ctx.strokeStyle = "rgb(49, 54, 62)"
  function lines(p) {
    ctx.moveTo(width * p, 0)
    ctx.lineTo(width * p, width)
    ctx.moveTo(0, width * p)
    ctx.lineTo(width, width * p)
  }

  ctx.lineWidth = 2 * widow.devicePixelRatio
  ctx.beginPath()

  lines(1/2)
  lines(1/3)
  lines(2/3)
  lines(1/6)
  lines(5/6)

  ctx.stroke()
}

// plug an x value into a curve
function curveEval(tab, x) {
  return clamp(CSPL.evalSpline(x, tab.ox, tab.oy, tab.ok), 0, 1)
}

// draws the spline curve
function canvasCubicSpline(ctx, xs, ys, ks, color) {
  // draw to the canvas
  var width = ctx.canvas.width
  var step = 4/width
  ctx.moveTo(0, 0)
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = 4 * widow.devicePixelRatio
  for (x = 0; x <= 1; x+=step) {
    var y = CSPL.evalSpline(x, xs, ys, ks)
    ctx.lineTo(x*width, (1-y)*width)
  }
  ctx.stroke()
}

//  helper functions
function clamp (value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// hide all of the control points associated with a tab
function disableTab (tab) {
  tab.controlpoints.forEach((cp) => {
    cp.hide()
  })
}

// creates an object with the savestate data for a curves knob
function getCurvesData (data) {
  var result = {}
  Object.keys(data).forEach((tabname, i) => {
    result[tabname] = []
    data[tabname].controlpoints.forEach((pt) => {
      result[tabname].push({x: pt.x, y:pt.y})
    });
  })
  return result
}

// writes data from getCurvesData() back into an element
function loadCurvesData(el, data) {
  Object.keys(data).forEach((tabname) => {
    // get the index of the tab with a matching title
    var tabid = false
    el.tabs.forEach((tab, i) => {
      if (tab.title === tabname) tabid = i
    })
    if (!tabid) throw new Error(`could not find tab ${tabname} while loading curves data`)
    var elementTab = el.tabs[tabid]
    var dataTab = data[tabname]
    // recreate the tab from the new data
    console.log('receating tab control points from', dataTab.controlpoints)
    elementTab.createFrom(dataTab.controlpoints)
  })
}
