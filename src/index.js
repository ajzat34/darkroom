// main electron process
// mostly just spwans windows as needed, and moves data between windows

const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');

// windows packager things
// when installing on windows, squirrel creates multiple processes
// we can use this to ignore them
if (require('electron-squirrel-startup')) return;

// macOS acts differently, this is will make it easier to tell if
// we are running on macOS later
var isDarwin = false
if (process.platform === 'darwin') {
  isDarwin = true
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// creates a loading window
function spawnLoadWindow () {
  // Create the loading window
  const loadWindow = new BrowserWindow({
    width: 300,
    height: 360,
    show: false,
    backgroundColor: '#24252b',
    frame: false,
    resizable: false,
  })

  // show on ready
  loadWindow.once('ready-to-show', () => {
    loadWindow.show()
  })

  // and load the index.html of the app.
  loadWindow.loadFile(path.join(__dirname, 'loading/index.html'))
  return loadWindow
}

// creates the main editor window
const spawnEditorWindow = (loadmode, filepath) => {
  // create the loading window
  const loadWindow = spawnLoadWindow ()

  // Create the editor window.
  const mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 960,
    minHeight: 540,
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
    console.log('swapping to main window')
    try {
      mainWindow.show()
      loadWindow.close()
      clearTimeout(closetimeout)
    } catch (err) {
      console.error('did the editor reload? ', err)
    }
  }

  // when the render process is ready, show the window
  ipcMain.on('mainwindow-loaded', swapwindows)
  // set a timeout in case something goes wrong while creating the editor
  // and we never recive the signal to show it
  var closetimeout = setTimeout(swapwindows, 8000)

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
       e.preventDefault();
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

  // wait until the content is loaded to show
  openWindow.on('ready-to-show', function(){
    openWindow.show()
  })

  // when open is selected, create a main window and send it the path
  ipcMain.once('image-select', onopen)
  function onopen (event, arg) {
    spawnEditorWindow(arg.type, arg.path)
    openWindow.close()
  }
  // if the window closes, we dont want to handle the next message here
  openWindow.on('close', function(e){
    ipcMain.removeListener('image-select', onopen)
  })
}

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

    console.log('created child window')
  })
}

// set the application menu
Menu.setApplicationMenu(Menu.buildFromTemplate([
  {
    label: 'Menu',
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },

  {
    label: 'File',
    submenu: [
      { label:'Open', click(menuItem, focusedWin) { spawnFileSelectionWindow() }, accelerator: 'CommandOrControl+o'},
      { type: 'separator' },
      { label:'Save', click(menuItem, focusedWin) { focusedWin.webContents.send('save') }, accelerator: 'CommandOrControl+s'},
      { label:'Save As', click(menuItem, focusedWin) { focusedWin.webContents.send('save-as') }, accelerator: 'CommandOrControl+Shift+s'}
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

global.envdata = {
  darwin: isDarwin,
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
    spawnFileSelectionWindow();
  }
})

// might help some machines support webgl2
app.commandLine.appendSwitch('enable-unsafe-es3-apis')

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', spawnFileSelectionWindow)
