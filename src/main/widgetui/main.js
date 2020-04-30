const tippy = require('tippy.js').default

function createWidgetUi (parent, from) {
  var r = {}
  r.partent = parent
  r.knobs = []
  r.onchange = function(){console.log('onchange callback unset', r)}
  r.ondata = function(){console.log('ondata callback unset', r)}
  r.hidden = false
  r.enabled = false

  function sendData() {
    var data = {}
    Object.keys(r.knobs).forEach((knobname, i) => {
      var knob = r.knobs[knobname]
      data[knob.name] = {}
      data[knob.name].valueType = knob.widgetUiValueType
      data[knob.name].value = knob.widgetUiValue
    });
    data._enabled = r.enabled
    r.ondata(data)
  }

  function update(fromUndo) {
    sendData()
    if (!fromUndo) r.onchange()
  }

  r.getData = function(){
    sendData()
  }

  var node = document.createElement("div")
  node.classList.add("widgetUI-base")
  r.widgetUIenable = function(){
    r.enabled = true
    node.classList.remove('disabled')
    if (toggle) toggle.classList.add('checked')
  }
  r.widgetUIdisable = function(){
    r.enabled = false
    node.classList.add('disabled')
    if (toggle) toggle.classList.remove('checked')
  }
  {
    // create the title and buttons
    var titlerow = document.createElement("div")
    titlerow.classList.add("widgetUI-row")
    titlerow.classList.add("top")
    node.appendChild(titlerow)

    var title = document.createElement("div")
      title.classList.add("title")
      title.classList.add("large")
      title.classList.add("disabledoverride")
      title.appendChild(document.createTextNode(from.name))
      if (from.tooltip && useToolTips) tippy(title, {
        content: from.tooltip,
        arrow: true, delay: [toolTipDelay, 100],
        hideOnClick: true,
        theme: 'widgetUItooltip',
        animation: 'fade',
        placement: 'left',
        allowHTML: true,
      })
      titlerow.appendChild(title)
  }
  {
    // create the knobs
    var content = document.createElement("div")
      content.classList.add("widgetUI-content")
      node.appendChild(content)

      if (from.takesMask) {
        var mask = document.createElement("button")
          mask.classList.add("listbutton")
          mask.appendChild(document.createTextNode('Mask'))
          mask.addEventListener('click', function(){
            toggleEditingMask(from.mask)
          })
          if (useToolTips) tippy(mask, {
            content: `Edit masking for this adjustment layer`,
            arrow: true, delay: [toolTipDelay, 100],
            hideOnClick: true,
            theme: 'widgetUItooltip',
            animation: 'fade',
            placement: 'left',
            allowHTML: true,
          })
          content.appendChild(mask)
      }

    Object.keys(from.knobs).forEach((name) => {
      var knob = createWidgetUiKnob(name, from.knobs[name])
      if (from.knobs[name].tooltip  && useToolTips) tippy(knob, {
        content: from.knobs[name].tooltip,
        arrow: true, delay: [toolTipDelay, 100],
        hideOnClick: true,
        theme: 'widgetUItooltip',
        animation: 'fade',
        placement: 'left',
        allowHTML: true,
      })
      knob.name = name
      knob.widgetUiOnUpdate = update
      r.knobs[name] = knob
      content.appendChild(knob)
    })
  }

  var collapse = document.createElement("button")
    collapse.appendChild(document.createTextNode('Hide'))
    collapse.classList.add("disabledoverride")
    r.widgetUIhide = function(){
      content.style.maxHeight = `0px`
      content.style.opacity = '0'
      collapse.innerText = 'Show'
      r.hidden = true
    }
    r.widgetUIunhide = function(){
      collapse.innerText = 'Hide'
      content.style.maxHeight = `${maxHeight}px`
      content.style.opacity = '1'
      r.hidden = false
    }
    collapse.addEventListener('click', function(){
      if (r.hidden) {
        r.widgetUIunhide()
      } else {
        r.widgetUIhide()
      }
    })
    titlerow.appendChild(collapse)

    var toggle = document.createElement("span")
      toggle.classList.add("disabledoverride")
      toggle.classList.add("onoffswitch")
      toggle.addEventListener("click", function(){
        if (!r.enabled) {r.widgetUIenable(); update()}
        else {r.widgetUIdisable(); update()}
      })
      if (!from.startEnabled) r.widgetUIdisable()
      else r.widgetUIenable()
      titlerow.appendChild(toggle)

  parent.appendChild(node)
  Object.keys(r.knobs).forEach((knobname, i) => {
    if (r.knobs[knobname].oncreate){
      r.knobs[knobname].oncreate()
    }
  })
  var maxHeight = content.scrollHeight
  content.style.maxHeight = `${maxHeight}px`
  if (from.hidden) r.widgetUIhide()

  r.remove = function() {
    Object.keys(r.knobs).forEach((knobname, i) => {
      var knob = r.knobs[knobname]
      knob.remove()
      delete knob
    })
    node.remove()
  }

  r.morphTo = function(data) {
    console.log(data._enabled)
    if (data._enabled) r.widgetUIenable()
    else r.widgetUIdisable()
    morphWidget(r, data)
    sendData()
  }

  return r
}

function morphWidget(widget, data) {
  Object.keys(widget.knobs).forEach((knobname, i) => {
    widget.knobs[knobname].morphTo(data[knobname])
  })
}

function createWidgetUiKnob (name, base) {
  var widget
  switch (base.type) {
    case 'slider':
      widget = createWidgetUiKnobSlider(name, base)
      widget.widgetUiValueType = 'value'
      break
    case 'checkbox':
      widget = createWidgetUiKnobCheckbox(name, base)
      widget.widgetUiValueType = 'value'
      break
    case 'curves':
      widget = createWidgetUiKnobCurves(name, base)
      widget.widgetUiValueType = 'curves'
      break
    case 'trislider':
      widget = createWidgetUiKnobTriSlider(name, base)
      widget.widgetUiValueType = 'value'
      break
    default:
      throw new Error(`unknown knob type ${base.type}`)
      return
  }
  return widget
}

function createWidgetUiKnobSlider (name, base) {
  var knob = document.createElement("div")
  knob.widgetUiOnUpdate = function(){}
  knob.widgetUiValue = base.value
  knob.classList.add("widgetUI-content")
  knob.classList.add("knob")
  knob.classList.add("slider-container")

    var titlerow = document.createElement("div")
      titlerow.classList.add("widgetUI-row")
      knob.appendChild(titlerow)

      var title = document.createElement("div")
        title.classList.add("title")
        title.appendChild(document.createTextNode(name))
        titlerow.appendChild(title)

      var number = document.createElement("input")
        number.classList.add("inputnumber")
        number.type = "number"
        number.min = base.minValue
        number.max = base.maxValue
        number.oninput = function() {
          var value = parseFloat(this.value)
          slider.value = value
          knob.widgetUiValue = value
          knob.widgetUiOnUpdate()
        }
        number.value = base.value
        number.appendChild(document.createTextNode(name))
        titlerow.appendChild(number)

    var inputrow = document.createElement("div")
      inputrow.classList.add("widgetUI-row")
      knob.appendChild(inputrow)

      var slider = document.createElement("input")
        slider.classList.add("slider")
        slider.type = "range"
        slider.min = base.minValue
        slider.max = base.maxValue
        slider.value = base.value
        if (base.step){
          slider.step = base.step
        }
        if (base.style) {
          slider.style = base.style
        }
        slider.oninput = function valset() {
          number.value = parseFloat(this.value)
          knob.widgetUiValue = parseFloat(this.value)
          knob.widgetUiOnUpdate()
        }
        inputrow.appendChild(slider)

  knob.morphTo = function(data) {
    slider.value = data.value
    number.value = data.value
    knob.widgetUiValue = data.value
  }

  return knob
}

function createWidgetUiKnobCheckbox (name, base) {
  var knob = document.createElement("div")
  knob.widgetUiOnUpdate = function(){}
  knob.widgetUiValue = base.value
  knob.classList.add("widgetUI-content")
  knob.classList.add("knob")
  knob.classList.add("slider-container")

    var titlerow = document.createElement("div")
      titlerow.classList.add("widgetUI-row")
      knob.appendChild(titlerow)

      var title = document.createElement("div")
        title.classList.add("title")
        title.appendChild(document.createTextNode(name))
        titlerow.appendChild(title)

      var checkbox = document.createElement("input")
        checkbox.classList.add("checkbox")
        checkbox.type = "checkbox"
        checkbox.checked = base.value
        if (base.style) {
          checkbox.style = base.style
        }
        checkbox.oninput = function valset() {
          knob.widgetUiValue = this.checked
          knob.widgetUiOnUpdate()
        }
        titlerow.appendChild(checkbox)

  knob.morphTo = function(data) {
    checkbox.checked = data.value
    knob.widgetUiValue = data.value
  }

  return knob
}
