const { ipcRenderer, remote } = require('electron')
const { dialog } = require('electron').remote

document.addEventListener("DOMContentLoaded", function(){

  // macos buttons
  document.getElementById("min-btn").addEventListener("click", function (e) {
       var window = remote.getCurrentWindow();
       window.minimize()
  })
  document.getElementById("close-btn").addEventListener("click", function (e) {
       var window = remote.getCurrentWindow();
       window.close();
  })

  document.getElementById("open-btn").addEventListener("click", async function(e) {
    var file = await dialog.showOpenDialog({
      title: 'Select an Image',
      properties: ['openFile']
    })
    if (file.canceled) {
      return
    }
    ipcRenderer.send('image-select', file.filePaths[0])
  })

})
