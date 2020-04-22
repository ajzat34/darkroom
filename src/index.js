// main electron process
// mostly just spwans windows as needed, and moves data between windows

const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');

// windows packager things
if (require('electron-squirrel-startup')) return;

// for window ids
var idCounter = 0

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
const spawnEditorWindow = () => {
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

  // when the window is closed, prompt to confirm
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
    global.nextWindowId = idCounter
    global.activeFile = {
      loadmode: arg.type,
      filepath: arg.path,
    }
    spawnEditorWindow()
    openWindow.close()
  }
  // if the window closes, we dont want to handle the next message here
  openWindow.on('close', function(e){
    ipcMain.removeListener('image-select', onopen)
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
      { label:'Redo', click(menuItem, focusedWin) { focusedWin.webContents.send('redo') }, accelerator: 'CommandOrControl+y'}
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', spawnFileSelectionWindow)
