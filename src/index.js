// main electron process
// mostly just spwans windows as needed, and moves data between windows
const version = '0.9.0'
const codeName = 'Beta'

const { app, BrowserWindow, ipcMain, dialog, Menu, crashReporter } = require('electron')
const path = require('path')

// automatic updating
// will possibly add later, needs code signing
// require('update-electron-app')()

// electron-store manages os specific storage paths for things like user preferences
const Store = require('electron-store')
const store = new Store()

// global is accessable in render processes
global.version = version
global.codeName = codeName
global.versionName = `${version} ${codeName}`

// windows packager things
// when installing on windows, squirrel creates multiple processes
// we can use this to ignore them
if (require('electron-squirrel-startup')) return

// macOS acts differently, this is will make it easier to tell if
// we are running on macOS later
var isDarwin = process.platform === 'darwin'
var isWindows = process.platform === 'win32'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

// there can only be one preferences window so we keep track if it globally
var prefsWindow = false


// -- window creation --

// creates the main editor window
const spawnEditorWindow = (filepath) => {
  // create the loading window
  const loadWindow = spawnLoadWindow ()

  var shown = false
  addRecent(filepath)

  // Create the editor window.
  const mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      nodeIntegration: true,
    },
    show: false,
    frame: !isDarwin,
    backgroundColor: '#24252b',
  })

  // load the windows content
  mainWindow.loadFile(path.join(__dirname, 'main/index.html'))

  // switch from the loading window to the main window
  function swapwindows () {
    if (!shown) {
      console.log('swapping to main window')
      try {
        mainWindow.show()
        loadWindow.close()
        clearTimeout(closetimeout)
      } catch (err) {
        console.error('did the editor reload? ', err)
      }
      shown = true
    } else {
      console.log('window is already shown, this usually happens then the editor is reloaded')
    }
  }

// creates a loading window
function spawnLoadWindow () {
  // Create the loading window
  const loadWindow = new BrowserWindow({
    width: 300,
    height: 400,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
  })

  // show on ready
  loadWindow.once('ready-to-show', () => {
    loadWindow.show()
  })
-
  loadWindow.on('focus', mainTitleMenu)

  // and load the index.html of the app.
  loadWindow.loadFile(path.join(__dirname, 'loading/index.html'))
  return loadWindow
}

  // when the render process is ready, show the window
  ipcMain.on('mainwindow-loaded', swapwindows)
  // set a timeout in case something goes wrong while creating the editor
  // and we never recive the signal to show it
  var closetimeout = setTimeout(swapwindows, 8000)

  // handle errors sent from the render process
  function renderError(event) {
    try {
      if (event.sender === mainWindow.webContents) {
        clearTimeout(closetimeout)
        if (!shown) swapwindows()
      } else {
        ipcMain.once('render-error', renderError )
      }
    } catch (err) { console.error(err)}
  }
  ipcMain.once('render-error', renderError )

  var file = readPath(filepath)
  var loadmode = 'image'
  if (file.ext === 'dkg' || file.ext === 'dkr') loadmode = 'project'

  console.log('loading file', file)

  function activeFileListener (event, arg) {
    try {
      if (event.sender === mainWindow.webContents) {
        event.returnValue = {
          loadmode: loadmode,
          filepath: filepath,
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  ipcMain.on('request-active-file', activeFileListener)

  // when the window is closed, prompt to confirm and remove listeners
  mainWindow.on('close', function(e){
    console.log('main window is closing... interupting to confirm this action...')
    var choice = dialog.showMessageBoxSync({
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to exit?'
     })
     if (choice == 1) {
       e.preventDefault()
     } else {
       ipcMain.removeListener('request-active-file', activeFileListener)
     }
  })

  ipcMain.on('create-child', async function (event, arg) {
    if (event.sender === mainWindow.webContents) {
      console.log('window requested child window')
      try {
        if (!arg || !arg.path) throw new Error('no path specified')
        resultData = await childWindow(mainWindow, arg),
        event.returnValue = {
          error: false,
          window: resultData,
        }
      } catch (err) {
        console.error(err)
        event.returnValue = {
          error: err.toString()
        }
      }
    }
  })
  return mainWindow
}

// window for selecting a file to open
const spawnFileSelectionWindow = () => {
  // Create the file selection window
  const openWindow = new BrowserWindow({
    width: 960,
    height: 540,
    minWidth: 960,
    minHeight: 540,
    webPreferences: {
      nodeIntegration: true,
    },
    titleBarStyle: 'hidden',
    show: false,
    frame: !isDarwin,
    resizable: false,
    backgroundColor: '#24252b',
  })

  // and load the index.html of the app.
  openWindow.loadFile(path.join(__dirname, 'main/open.html'))

  openWindow.on('focus', fileSelectTitleMenu)

  // wait until the content is loaded to show
  openWindow.on('ready-to-show', function(){
    openWindow.show()
  })

  // when open is selected, create a main window and send it the path
  const onopen = (event, arg) => {
    if (event.sender === openWindow.webContents) {
      spawnEditorWindow(arg.path)
      ipcMain.removeListener('image-select', onopen)
      openWindow.close()
    }
  }
  ipcMain.once('image-select', onopen)

  // if the window closes, we dont want to handle the next message here
  openWindow.on('close', function(e){
    ipcMain.removeListener('image-select', onopen)
  })
}

// creates a window for preferences
const spawnPrefsWindow = () => {
  if (prefsWindow) {
    prefsWindow.show()
    return
  }

  prefsWindow = new BrowserWindow({
    width: 800,
    height: 600,
  })
}

// license viewer window
const spawnLicenseWindow = () => {
  // Create the file selection window
  const win = new BrowserWindow({
    width: 400,
    height: 720,
  })
  // and load the index.html of the app.
  win.loadFile(path.join(__dirname, 'main/license.html'))
}

// creates a pop up window, attached to a parent
// when the window sends a 'child-exit-data' ipc the data is forwared onto its parent
function childWindow(parent, opt) {
  return new Promise(function(resolve, reject) {

    let child = new BrowserWindow({
      parent: parent,
      width: 512,
      height: 200,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
      },
    })
    console.log('created child window')

    var done = false

    function finish (arg) {
      if (!done) {
        done = true
        resolve(arg)
      }
    }

    var dataListener = function (event, arg) {
      try {
        if (event.sender === child.webContents) {
          finish(arg)
          child.close()
        }
      } catch (err) {
        console.log(err)
      }
    }
    ipcMain.on('child-exit-data', dataListener)

    child.on('close', function(e){
      ipcMain.removeListener('child-exit-data', dataListener)
      finish({closed: true})
    })

    child.loadFile(path.join(__dirname, opt.path))
  })
}

// -- helper / utility functions --


// parses path info for mac and windows
function readPath (path) {
  if (typeof path !== 'string') {
    console.error('cannot read non-string path')
    return false
  }
  var parts = path.split('/')
  if (parts.length < 2) {
    parts = path.split('\\')
  }
  var file = parts[parts.length-1]
  var ext = file.split('.')
  return {
    path: path,
    parts: parts,
    file: file,
    ext: ext[ext.length-1],
    name: ext.slice(0, ext.length-1).join('.')
  }
}

// opens a file at a path in a new editor
function openPath (pathstr) {
  var path = readPath(pathstr)
  if (['dkg', 'dkr'].includes(path.ext)) {
    spawnEditorWindow('project', pathstr)
  } else {
    spawnEditorWindow('image', pathstr)
  }
}
// Quit when all windows are closed (non-mac).
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (!isDarwin) {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    spawnFileSelectionWindow()
  }
})

// open files dragged into the icon on macOS
app.on('will-finish-launching', () => {
  // macOS only
  app.on('open-file', (event, path) => {
    if (path) {
      openPath(path)
    }
  })
})

// adds a path to the local recents store and the os recents list
function addRecent(path) {
  app.addRecentDocument(path)
  // get recent files from the
  var recents = store.get('recents')
  if (!recents) {
    recents = []
  }
  // removes existing instances
  var index = recents.indexOf(path)
  if (index > 0) recents.splice(index, 1)
  // add it
  recents.push(path)
  // trim
  while (recents.length > 4) {
    recents.shift()
  }
  // write it back
  store.set('recents', recents)
  updateGlobalRecents(recents)
}
ipcMain.on('add-recent', (event, path) => {
  addRecent(path)
})

// updates the global (shared between render processes and main process) for recent files
function updateGlobalRecents (recents) {
  var data = []
  recents.forEach((path) => {
    var file = readPath(path)
    data.push(file)
  })
  global.recents = data
}

// clears the title memu
function clearMenu() {
  Menu.setApplicationMenu()
}

// -- menus --

// set the application menu for file selection
function fileSelectTitleMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { label: 'preferences', click(menuItem) { spawnPrefsWindow() }, accelerator: 'CommandOrControl+,'},
        { role: 'quit' }
      ]
    },

    {
      label: 'File',
      submenu: [
        { label:'Open', click(menuItem, focusedWin) { spawnFileSelectionWindow() }, accelerator: 'CommandOrControl+o'},
      ]
    },

    {
      label: 'Window',
      submenu: [
        { role: 'close' },
        { type: 'separator' },
        { label:'Reload', click(menuItem, focusedWin) { focusedWin.webContents.reload() }, accelerator: 'CommandOrControl+shift+r'},
        { label:'Open Dev Tools', click(menuItem, focusedWin) { focusedWin.webContents.openDevTools() }, accelerator: 'CommandOrControl+Option+i'},
      ]
    },
  ]))
}

// set the application menu for the main editor
function mainTitleMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        { role: 'about' },
        { label: 'preferences', click(menuItem) { spawnPrefsWindow() }, accelerator: 'CommandOrControl+,'},
        { type: 'separator' },
        { role: 'quit' },
      ]
    },

    {
      label: 'File',
      submenu: [
        { label:'Open', click(menuItem, focusedWin) { spawnFileSelectionWindow() }, accelerator: 'CommandOrControl+o'},
        { type: 'separator' },
        { label:'Save', click(menuItem, focusedWin) { focusedWin.webContents.send('save') }, accelerator: 'CommandOrControl+s'},
        { label:'Save As', click(menuItem, focusedWin) { focusedWin.webContents.send('save-as') }, accelerator: 'CommandOrControl+Shift+s'},
        { label:'Export', click(menuItem, focusedWin) { focusedWin.webContents.send('export') }, accelerator: 'CommandOrControl+shift+e'},
      ]
    },

    {
      label: 'Edit',
      submenu: [
        { label:'Undo', click(menuItem, focusedWin) { focusedWin.webContents.send('undo') }, accelerator: 'CommandOrControl+z'},
        { label:'Redo', click(menuItem, focusedWin) { focusedWin.webContents.send('redo') }, accelerator: 'CommandOrControl+Shift+z'}
      ]
    },

    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' },
        { label: 'Reset View', click(menuItem, focusedWin) { focusedWin.webContents.send('view-reset') }, accelerator: 'CommandOrControl+0'},
        { label: '1:1 Scale', click(menuItem, focusedWin) { focusedWin.webContents.send('view-1') }, accelerator: 'CommandOrControl+1'},
        { label: '2:1 Scale', click(menuItem, focusedWin) { focusedWin.webContents.send('view-2') }, accelerator: 'CommandOrControl+2'},
        { label: '3:1 Scale', click(menuItem, focusedWin) { focusedWin.webContents.send('view-3') }, accelerator: 'CommandOrControl+3'},
        { label: '4:1 Scale', click(menuItem, focusedWin) { focusedWin.webContents.send('view-3') }, accelerator: 'CommandOrControl+4'},
        { label: '5:1 Scale', click(menuItem, focusedWin) { focusedWin.webContents.send('view-5') }, accelerator: 'CommandOrControl+5'},
      ]
    },

    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { label:'Reload', click(menuItem, focusedWin) { focusedWin.webContents.reload() }, accelerator: 'CommandOrControl+shift+r'},
        { label:'Open Dev Tools', click(menuItem, focusedWin) { focusedWin.webContents.openDevTools() }, accelerator: 'CommandOrControl+Option+i'},
      ]
    },
  ]))
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', main)
async function main () {
  clearMenu()
  var recents = store.get('recents')
  if (!recents) recents = []
  global.envdata = {
    darwin: isDarwin,
    windows: isWindows,
    pathsep: {true: '\\', false: '/'}[isWindows],
  }
  updateGlobalRecents(recents)
  // open a window
  spawnFileSelectionWindow()

  ipcMain.on('show-license', spawnLicenseWindow)
}
