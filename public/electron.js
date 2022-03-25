const { app, BrowserView, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const isDev = require('electron-is-dev');

// const { ybdl } = require('../lib/ybdl');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

function createWindow(){
  const mainWindow = new BrowserWindow({
   width: 1000,
   height: 800,
   webPreferences: {
    nodeIntegration: false,
    preload: `${__dirname}/preload.js`,
   }
  });
  // window.ipcRenderer = 'ipcRenderer';

  ipcMain.on('dlMovie', (event, args) => {
    const codeId = args
    const url = `http://www.youtube.com/watch?v=${codeId}`;
    const video = ytdl(url);
    video.pipe(fs.createWriteStream(path.resolve(__dirname,`./tmp/${codeId}.mp4`)));
    video.on('end', () => {
     console.log('file downloaded.')
    });
  })

  ipcMain.handle('reedFile', (event, args) => {
    const files = loadFolder(__dirname+'/tmp/');
    console.log(__dirname+'/tmp')
    console.log(files)
    return files;
  }) 

  mainWindow.loadURL(
    isDev
     ? "http://localhost:3000"
     : `file://${path.join(__dirname, "../build/index.html")}`
  )
  const kl = mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('active', function() {
    if(BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function(){
  if (process.platform !== 'darwin') app.quit();
})

function loadFolder(pathname) {
  const items = [];

  if(fs.existsSync(pathname)){
    const extenstions = ['.mp4','.mp3'];
    const _files = fs.readdirSync(__dirname+'/tmp')
    const files = fs.readdirSync(__dirname+'/tmp')
      .map( (name) => {
        const stat = fs.statSync(pathname+'/'+name);
        const extenstion = path.extname(pathname);
        return {
          name: name,
          extenstion: extenstion,
          path: '/tmp/' + name,
          type: stat.isFile() ? 'file' : 'folder',
          time: stat.mtime.getTime()
        }
      })
      // .filter((file) => {
      //   if(file.type == 'file') {
      //      return (extenstions.includes(file.name))
      //   }
      // })
    for (const file of files) {
      if(file.type == 'file'){
        items.push(file);
      }
    }
  }
  return items;
}
