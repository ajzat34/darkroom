function createWidgetUi (parent, from) {
  var r = {}
  r.partent = parent
  r.knobs = []
  r.onchange = function(){}

  var node = document.createElement("div")
  node.classList.add("widgetUI-base")
  {
    // create the title and buttons
    var titlerow = document.createElement("div")
    titlerow.classList.add("widgetUI-row")
    titlerow.classList.add("top")
    node.appendChild(titlerow)

    var title = document.createElement("div")
      title.classList.add("title")
      title.classList.add("large")
      title.appendChild(document.createTextNode(from.name))
      titlerow.appendChild(title)

    var close = document.createElement("button")
      close.appendChild(document.createTextNode('✕'))
      titlerow.appendChild(close)
  }
  {
    // create the knobs
    var content = document.createElement("div")
      content.classList.add("widgetUI-content")
      node.appendChild(content)

    Object.keys(from.knobs).forEach((name) => {
      var knob = createWidgetUiKnob(name, from.knobs[name])
      knob.name = name
      knob.widgetUiOnUpdate = update
      r.knobs.push(knob)
      content.appendChild(knob)
    })
  }

  function update() {
    var data = {}
    r.knobs.forEach((knob, i) => {
      data[knob.name] = knob.widgetUiValue
    });
    r.onchange(data)
  }

  parent.appendChild(node)
  return r
}

function createWidgetUiKnob (name, base) {
  switch (base.type) {
    case 'slider':
      return createWidgetUiKnobSlider(name, base)
      break;
    default:
      throw new Error(`unknown knob type ${base.type}`)
  }
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
          console.log(base.style)
          slider.style = base.style
        }
        slider.oninput = function valset() {
          number.value = parseFloat(this.value)
          knob.widgetUiValue = parseFloat(this.value)
          knob.widgetUiOnUpdate()
        }
        inputrow.appendChild(slider)
  return knob
}
