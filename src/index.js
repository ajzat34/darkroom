const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

// macOS acts differently, this is will make it easier to tell if
// we are running on macOS later
var isDarwin = false
if (process.platform === 'darwin') {
  isDarwin = true
}

// hold the active file path and if it is an image or project
var loadmode
var filepath

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// creates a loading window
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

  // show on ready
  loadWindow.once('ready-to-show', () => {
    loadWindow.show()
  })

  // and load the index.html of the app.
  loadWindow.loadFile(path.join(__dirname, 'loading/index.html'))
  return loadWindow
}

// creates the main editor window
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
      console.error('did the main page reload? ', err)
    }
  }

  ipcMain.once('request-id', function(event){
    event.returnValue = id
  })

  // when the render process is ready, show the window
  ipcMain.on('mainwindow-loaded', swapwindows)
  // set a timeout in case something goes wrong
  var closetimeout = setTimeout(swapwindows, 8000)

  // when the window is closed, prompt to confirm
  // TODO: move this to the render process, and add option to save before closing
  mainWindow.on('close', function(e){
    console.log('main window is closing... interupting to confirm this action...')
    var choice = dialog.showMessageBoxSync(this, {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: 'Are you sure you want to exit?'
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
    titleBarStyle: 'hidden',
    show: false,
    frame: !isDarwin,
    resizable: false,
    backgroundColor: '#24252b',
  })

  // and load the index.html of the app.
  openWindow.loadFile(path.join(__dirname, 'main/open.html'))

  // wait until content is loaded to show
  openWindow.on('ready-to-show', function(){
    openWindow.show()
  })

  // when open is selected, create a main window and send it the path
  function onopen (event, arg) {
    console.log('image', arg, 'selected')
    loadmode = arg.type
    filepath = arg.path
    createMainWindow()
    openWindow.close()
  }
  ipcMain.once('image-select', onopen)
  openWindow.on('close', function(e){
    ipcMain.removeListener('image-select', onopen)
  })
}

// when the window request a file, give it the last selected file
ipcMain.on('request-file-info', (event, arg) => {
  event.returnValue = {
    type: loadmode,
    path: filepath,
  }
})

ipcMain.on('request-environment-data', (event, arg) => {
  event.returnValue = {
    darwin: isDarwin,
  }
})

// Quit when all windows are closed.
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
    createOpenWindow();
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createOpenWindow)
