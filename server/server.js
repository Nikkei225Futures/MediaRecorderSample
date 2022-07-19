const fs = require('fs');
const pathUploadedFiles = './uploads/';  //uploadsフォルダを作っておいてください
const portListen = 8888;

const express = require('express');
const app = express();
app.use(express.static('public'));

const multer = require('multer');
const multerMiddleware = multer({dest: pathUploadedFiles});

//POSTされたデータを処理
app.post('/upload', multerMiddleware.single('video'), (req, res) => {
  const tempPath = pathUploadedFiles + req.file.filename;  //multerが一時的に保存したファイル名
  const originalName = req.file.originalname; //formData.append()で指定したファイル名を取得
  
  try{
    fs.copyFileSync(tempPath, pathUploadedFiles + originalName);  //tempファイルをオリジナルのファイル名でコピー
    fs.unlink(tempPath, err => {
      if(err){
        console.error(`error occurred while removing uploaded temp file: ${err}`);
      }
    });
  }catch(err){
    console.error(`error occurred while copying uploaded temp file: ${err}`);
  }
  console.log(`video uploaded successfully on ${pathUploadedFiles + originalName}`);
  
  res.sendStatus(200); 
});

app.listen(portListen, err => {
  if(err){
    console.error(`error occurred while building express server: ${err}`);
  }else{
    console.log(`express server built successfully on port ${portListen}`);
  }
});