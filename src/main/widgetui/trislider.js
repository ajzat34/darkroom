function createWidgetUiKnobTriSlider (name, base) {
  var knob = document.createElement("div")
  knob.widgetUiOnUpdate = function(){}
  knob.widgetUiValue = [base.sliders[0].value, base.sliders[1].value, base.sliders[2].value]
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

    var inputrow = document.createElement("div")
      inputrow.classList.add("widgetUI-row")
      knob.appendChild(inputrow)

      var sliders = []
      base.sliders.forEach((baseSlider, i) => {
        sliders[i] = document.createElement("input")
          sliders[i].classList.add("slider")
          sliders[i].classList.add("trislider")
          sliders[i].type = "range"
          sliders[i].min = base.minValue
          sliders[i].max = base.maxValue
          sliders[i].value = baseSlider.value
          if (base.step){
            sliders[i].step = base.step
          }
          if (baseSlider.style) {
            sliders[i].style = baseSlider.style
          }
          sliders[i].oninput = function valset() {
            knob.widgetUiValue[i] = parseFloat(this.value)
            knob.widgetUiOnUpdate()
          }
          inputrow.appendChild(sliders[i])
      })

  knob.morphTo = function(data) {
    sliders[0].value = data.value[0]
    sliders[1].value = data.value[1]
    sliders[2].value = data.value[2]
    knob.widgetUiValue[0] = data.value[0]
    knob.widgetUiValue[1] = data.value[1]
    knob.widgetUiValue[2] = data.value[2]
  }

  return knob
}
