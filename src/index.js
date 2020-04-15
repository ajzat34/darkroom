const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

var loadmode
var filepath

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

function makeLoadWindow () {
  // Create the loading window
  const loadWindow = new BrowserWindow({
    width: 300,
    height: 360,
    show: false,
    backgroundColor: '#24252b',
    frame: false,
    resizable: false,
  })
  loadWindow.once('ready-to-show', () => {
    loadWindow.show()
  })

  // and load the index.html of the app.
  loadWindow.loadFile(path.join(__dirname, 'loading/index.html'))
  return loadWindow
}

const createMainWindow = () => {

  const loadWindow = makeLoadWindow ();

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 960,
    minHeight: 540,
    webPreferences: {
      nodeIntegration: true,
    },
    show: false,
    frame: false,
    backgroundColor: '#24252b',
  })
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'main/index.html'))

  function swapwindows () {
    console.log('swapping to main window')
    setTimeout(function(){
      try {
        mainWindow.show()
        loadWindow.close()
        clearTimeout(closetimeout)
      } catch (err) {
        console.error(err)
      }
    }, 100)
  }

  // when the render process is ready, show the window
  ipcMain.on('mainwindow-loaded', swapwindows)

  // set a timeout in case something goes wrong
  var closetimeout = setTimeout(swapwindows, 5000)

  return mainWindow
}

// window for selecting a file to open
const createOpenWindow = () => {
  // Create the browser window.
  const openWindow = new BrowserWindow({
    width: 960,
    height: 540,
    minWidth: 960,
    minHeight: 540,
    webPreferences: {
      nodeIntegration: true,
    },
    show: false,
    frame: false,
    resizable: false,
    backgroundColor: '#24252b',
  })
  // and load the index.html of the app.
  openWindow.loadFile(path.join(__dirname, 'main/open.html'))

  openWindow.on('ready-to-show', function(){
    openWindow.show()
  })

  ipcMain.once('image-select', (event, arg) => {
    console.log('image', arg, 'selected')
    loadmode = "image"
    filepath = arg
    createMainWindow()
    openWindow.close()
  })
}

// when the window request a file, give it the last selected file
ipcMain.on('request-file-info', (event) => {
  event.returnValue = {
    type: loadmode,
    path: filepath,
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createOpenWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  createOpenWindow()
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
})
