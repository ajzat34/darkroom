// event to be called whenever the project changes
function historyEventProjectChanged (fromUndo) {
  // if this project change was an undo, dont create a history step
  if (fromUndo) {
    console.log('skipped update event: from undo')
  } else {
    clearTimeout(historyTimer)
    historyTimer = setTimeout(createHistorySnapshot, 250)
  }
  stateUnsaved()
}

// create a snapshot of the project in the history
function createHistorySnapshot () {
  console.log('created undo history snapshot')
  // add a new history snapshot
  undoHistory.push(stagingState)
  stagingState = newSaveState()
  // limit the size
  undoHistory.splice(0, undoHistory.length - historySize)
}

function undo () {
  console.log('reverting to the last undo histroy state')
  var undostate = undoHistory.pop()
  if (undostate) {
    // fromUndo = ture, so we dont create an undo snapshot for reverting
    loadSaveState(undostate, true)
  }
}

function historyEventSaved () {
  stateSaved()
}

function stateSaved() {
  saveButtonSuccess()
}

function stateUnsaved() {
  saveButtonWarning()
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
