// controls the bottom-contextual menu

var contextualModes = {}

function viewMode () {
  controlmode = 'view'
  stopEditingMask()
  setContextualMode('view')
}

// gets all of the contextual modes
function loadContexts() {
  contextual = document.getElementById('contextual-toolbar')
  contextualModes.editmask = document.getElementById('context-editmask')
  contextualModes.view = document.getElementById('context-view')
}

function setContextualMode(mode) {
  if (mode === 'view') {resizeContextual(32); switchContext('view')}
  else if (mode === 'editmask') {resizeContextual(80); switchContext('editmask')}
}

function resizeContextual(size) {
  clearNow(pgl)
  contextual.style.height = `${size}px`
  resize()
}

function clearAllContexts() {
  Object.keys(contextualModes).forEach(function (mode) { contextualModes[mode].classList.add('hidden'); })
}

function switchContext(mode) {
  clearAllContexts()
  if (mode === 'view') contextualModes.view.classList.remove('hidden')
  if (mode === 'editmask') contextualModes.editmask.classList.remove('hidden')
}
