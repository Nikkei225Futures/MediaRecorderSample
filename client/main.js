
const constraints = {
  audio: true,
  video: {
    width: 1920,
    height: 1080
  }
};

navigator.mediaDevices.getUserMedia(constraints)
  .then(stream => {
    //streamはhtmlのvideoタグのsrcObjectに代入することでブラウザ上で見ることができます．
    //<video src="" id="camera" autoplay></video>
    const cameraView = document.getElementById("camera");
    cameraView.srcObject = stream;

    //ボタンから録画開始，録画終了できるようにしておきます．
    const buttonStartRecording = document.getElementById('button-start');
    const buttonStopRecording = document.getElementById('button-stop');
    let isRecording = false;

    //録画形式などを指定します．
    const recordingOptions = {
      audioBitsPerSecond: 256 * 1000,
      videoBitsPerSecond: 6000 * 1000,
      mimeType: 'video/webm'   //mimeTypeはmp4とか, codecの指定もできます．
    };
    const fileExtension = '.webm';

    //MediaRecorderを作成します．
    const recorder = new MediaRecorder(stream, recordingOptions);
    const recordedChunks = [];
    const intervalPushData = 1000;

    //記録開始
    buttonStartRecording.addEventListener('click', () => {
      if (!isRecording) {
        recorder.start(intervalPushData);
        isRecording = true;
        console.log('recording started');
      }
    });

    //記録終了
    buttonStopRecording.addEventListener('click', () => {
      if (isRecording) {
        recorder.stop();
        isRecording = false;
        console.log('recording stopped');
      }
    });


    //イベントハンドラの登録
    //データを配列にプッシュする．
    //これは，MediaRecorder.start(timeslice)で引数に指定したtimesliceミリ秒ごとに実行されます
    //今回は1000ms = 1秒ごと
    recorder.ondataavailable = ev => {
      if (ev.data) {
        recordedChunks.push(ev.data);
      }
    };

    //記録を停止したときに実行される
    recorder.onstop = ev => {
      const blob = new Blob(recordedChunks, { type: recorder.mimeType });  //記録したデータ全体をblobに
      const filename = "yourFileName" + fileExtension;
      uploadVideoToSever(blob, filename);
      recordedChunks.splice(0);  //記録したデータを削除
    };

  })
  .catch(err => {
    console.error(`error occurred: ${err}`);
  });

//録画データをサーバに送信する(POST)
const destinationUpload = 'http://localhost:8888/upload';
function uploadVideoToSever(data, filename) {
  const formData = new FormData();
  formData.append('video', data, filename);
  const request = new XMLHttpRequest();
  request.open('POST', destinationUpload);
  request.send(formData);
}