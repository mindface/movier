const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');

function ybdl(codeId){
  console.log(';;;;;;;;;;;;')
  console.log('codeId')
  console.log(codeId)
  const url = `http://www.youtube.com/watch?v=${codeId}`;
  const video = ytdl(url);
  video.pipe(fs.createWriteStream(path.resolve(__dirname,`./tmp/${codeId}`)));
  video.on('end', () => {
   console.log('file downloaded.')
  });
}

module.exports = ybdl;
