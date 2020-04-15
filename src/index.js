const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

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

const createWindows = () => {

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
}

// window for selecting a file to open
const openDialogeWindow = () => {
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindows)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
})
