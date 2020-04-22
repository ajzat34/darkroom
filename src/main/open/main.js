const { ipcRenderer, remote } = require('electron')
const { dialog } = require('electron').remote

// callback for the page loading
document.addEventListener("DOMContentLoaded", function(){

  document.getElementById("open-btn").addEventListener("click", async function(e) {
    var file = await dialog.showOpenDialog({
      title: 'Select an Image',
      properties: ['openFile'],
      filters: [
        // TODO: fix tiff! for some reason mac cannot select tiff with filter
        // { name: 'Joint Photographic Experts Group', extensions: ['jpg', 'jpeg'] },
        // { name: 'Portable Network Graphics', extensions: ['png'] },
        // { name: 'Graphic Interchange Format', extensions: ['gif'] },
      ]
    })
    if (file.canceled) {
      return
    }
    ipcRenderer.send('image-select', {type: 'image', path:file.filePaths[0]})
  })

  document.getElementById("project-btn").addEventListener("click", async function(e) {
    var file = await dialog.showOpenDialog({
      title: 'Select an Image',
      properties: ['openFile'],
      filters: [
        { name: 'Open Darkroom Package', extensions: ['dkg', 'dkr'] },
      ]
    })
    if (file.canceled) {
      return
    }
    ipcRenderer.send('image-select', {type: 'project', path: file.filePaths[0]})
  })

})
