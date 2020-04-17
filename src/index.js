const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

var loadmode
var filepath
var windowmode = 'none'

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
  var windowmode = 'loading'

  // show on ready
  loadWindow.once('ready-to-show', () => {
    loadWindow.show()
  })

  // and load the index.html of the app.
  loadWindow.loadFile(path.join(__dirname, 'loading/index.html'))
  return loadWindow
}

const createMainWindow = () => {
  // create the loading window
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
  var windowmode = 'main'
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

  mainWindow.on('close', function(e){
    console.log('main window is closing... interupting for to ask...')
    var choice = dialog.showMessageBoxSync(this, {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: 'Are you sure you want to quit?'
       });
       if(choice == 1){
         e.preventDefault();
       }
    });

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

  var windowmode = 'open'

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
  // If all of the windows are close, open a new window.
  // If the last window open was an open file screen, quit.
  if (windowmode !== 'open') {
    if (process.platform !== 'darwin') {
      // On macOS it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      app.quit()
    }
  } else {
    createOpenWindow()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
})
