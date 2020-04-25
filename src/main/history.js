// rolling undo and redo stacks
class UndoHistory {
  constructor (size) {
    this.keepsize = size
    this.currentPtr = 0
    this.savePtr = null
    this.data = []
    console.log(this)
  }
  // upates the save pointer
  save () {
    this.savePtr = this.currentPtr
  }
  // true the current step is on the saved step
  isOnSave () {
    return this.savePtr === this.currentPtr
  }

  getCurrent() {
    return this.data[this.currentPtr]
  }

  backup() {
    if (this.data[this.currentPtr-1]) {
      this.currentPtr--
      console.log('backed up to step', this.currentPtr)
      this.cleanup()
      return true
    }
    return false
  }

  forward() {
    if (this.data[this.currentPtr+1]) {
      this.currentPtr++
      console.log('jumped to step', this.currentPtr)
      this.cleanup()
      return true
    }
    return false
  }

  add(snap) {
    this.currentPtr++
    console.log('writing to', this.currentPtr)
    this.data[this.currentPtr] = snap
    this.cleanup()
    this.cleanForward()
  }

  cleanup() {
    // loop over all values
    this.data.forEach((value, index) => {
      // if it is more than keepsize behind
      if (this.currentPtr-index > this.keepsize) {
        delete this.data[index]
      }
    })
  }

  // remove all future snaps (remove the redo history)
  cleanForward () {
    this.data.forEach((value, index) => {
      // if it is more than keepsize behind
      if (index > this.currentPtr) {
        delete this.data[index]
      }
    })
  }
}

// event to be called whenever the project changes
function historyEventProjectChanged (fromUndo) {
  // immediately show that there are changes
  stateUnsaved()
  // if this project change was an undo, dont create a history step
  if (fromUndo) {
    console.log('skipped update event: source: undo')
  } else {
    clearTimeout(historyTimer)
    historyTimer = setTimeout(createHistorySnapshot, 250)
  }
}

// create a snapshot of the project in the history
function createHistorySnapshot () {
  console.log('created undo history snapshot')
  undoHistory.add(newSaveState())
  requestAutosave(updateSaveSatus) // set the callback to update save status as well (only called on success)
  updateSaveSatus()
}

function undo () {
  if (undoHistory.backup()) {
    loadSaveState(undoHistory.getCurrent(), true)
    requestAutosave(updateSaveSatus) // set the callback to update save status as well (only called on success)
  } else {
    console.log('no more undo history')
  }
  updateSaveSatus()
}

function redo () {
  if (undoHistory.forward()) {
    loadSaveState(undoHistory.getCurrent(), true)
    requestAutosave(updateSaveSatus) // set the callback to update save status as well (only called on success)
  } else {
    console.log('no more redo queue')
  }
  updateSaveSatus()
}

// updates the save button color, and save indicator
function updateSaveSatus () {
  if (undoHistory.isOnSave()) {
    stateSaved()
  } else {
    stateUnsaved()
  }
}

// when the file is saved, update the histroy slot that is considered in sync with the file
function historyEventSaved () {
  undoHistory.save()
  updateSaveSatus()
}

// update dom elements to indicate the save state
function stateSaved() {
  saveButtonSuccess()
}

function stateUnsaved() {
  clearSaveButtonColor()
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
