const { ipcRenderer, remote, shell } = require('electron')
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
    ipcRenderer.send('image-select', {path:file.filePaths[0]})
  })

  document.getElementById("project-btn").addEventListener("click", async function(e) {
    var file = await dialog.showOpenDialog({
      title: 'Select an Image',
      properties: ['openFile'],
      filters: [
        { name: 'Open Darkroom Package', extensions: ['dkg', 'dkr'] },
      ]
    })
    if (file.canceled) return
    ipcRenderer.send('image-select', {path: file.filePaths[0]})
  })

  var recentList = document.getElementById('recent-list')
  var recents = remote.getGlobal('recents')
  var pathsep = remote.getGlobal('envdata').pathsep
  for (var i = recents.length-1; i>=0; i--) {
    const recent = recents[i]
    console.log(recent, i)
    var tr = document.createElement('tr')
    var td = document.createElement('td')
    var a = document.createElement('a')
    a.classList.add('pad-right')
    a.href = '#'
    a.addEventListener('click', function(){
      ipcRenderer.send('image-select', {path: recent.path + ''})
    })
    a.appendChild(document.createTextNode(trunc(recent.name, 20)))
    td.appendChild(a)
    tr.appendChild(td)
    var td = document.createElement('td')
    td.appendChild(document.createTextNode(trunc(recent.path, 30)))
    tr.appendChild(td)
    recentList.appendChild(tr)
  }

})

function trunc (src, length) {
  if (src.length-3 < length) {
    return src
  }
  return '...' + src.substring(src.length-length-3, src.length)
}

function openLink(link) {
  shell.openExternal(link)
}

function openLicense() {
  ipcRenderer.send('show-license')
}
