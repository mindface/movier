import { useEffect, useRef, useState} from 'react'
import * as posenet from '@tensorflow-models/posenet';
import * as poseDetection from '@tensorflow-models/pose-detection';

function Movies() {
  const searchText = useRef('');
  const setId = useRef('');
  const net = useRef('');
  const imageer = useRef(null);
  const [movies,moviesSet] = useState([]);
  const [detector,detectorSet] = useState({});
  const [mps,mpsSet] = useState([]);
  const key = 'AIzaSyB1DCZLy2ceSD8JJFgPdtkf1JlGOsSnZ6Q';
  const params = `&type=video&maxResults=30&part=snippet&q=`;
  const url = `https://www.googleapis.com/youtube/v3/search?key=${key}${params}`;


  const fetachparams = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin', 
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    // body: JSON.stringify(data) 
  };

  useEffect( async () => {
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER});
    detectorSet(detector);
  },[])

  async function view(){
    const res = await window.electronAPI.reedFile();
    mpsSet(res);
  }

  function search(){
    fetch(url+searchText.current,fetachparams)
      .then((res) => res.json().then((res) => {
        console.log(res)
        let list = []
        res.items.forEach((item) => {
          list.push({
            videoId:item.id.videoId,
            title: item.snippet.channelTitle,
            disc: item.snippet.description,
            path: item.snippet.thumbnails.medium.url
          })
        })
        moviesSet(list);
      }))
  }

  function dlAction(id){
    window.electronAPI.dlMovie(id)
  }

  function canvastag(e){
    const w = 330;
    const h = 168;
    let vh = 200;
    const video = e.target;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    video.addEventListener('timeupdate', async () => {
      
      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.drawImage(video,0,0,w,h);
      vh = (w*video.videoHeight)/video.videoWidth
      const _img = new Image(w, vh);
      // _img.src = canvas.toDataURL()
      const poses = await detector.estimatePoses(video);
      if(poses.length > 0){
        addArc(poses,ctx);
      }
    })
    e.target.parentNode.appendChild(canvas);
  }

  function addArc(poses,ctx){
    poses.forEach( (item) => {
      
      item.keypoints.forEach( (d) => {
        ctx.beginPath();
        if(d.name === 'left_hip'){
          ctx.lineTo(Math.floor(d.x),Math.floor(d.y));
        }else if(d.name === 'left_knee'){
          ctx.lineTo(Math.floor(d.x),Math.floor(d.y));
        }else if(d.name === 'left_ankle'){
          ctx.lineTo(Math.floor(d.x),Math.floor(d.y));
        }

        if(d.name === 'right_hip'){
          ctx.lineTo(Math.floor(d.x),Math.floor(d.y));
        }else if(d.name === 'right_knee'){
          ctx.lineTo(Math.floor(d.x),Math.floor(d.y));
        }else if(d.name === 'right_ankle'){
          ctx.lineTo(Math.floor(d.x),Math.floor(d.y));
        }
        ctx.arc(Math.floor(d.x), Math.floor(d.y), 10, 0, 2 * Math.PI,false);
        ctx.fill();
      })
      ctx.closePath();
    })
  }

  return (
    <div className="movies">
      <section className='section'>
        <h3 className="title">
          movies
        </h3>
        <input type="text" onChange={e => { searchText.current = e.target.value }} />
        <button onClick={search}>探す</button>
        <button onClick={view}>動画の表示</button>
        <div className="movies-lists">
          <div className="movie-box">
            {movies.length > 0 && movies.map((item) => {
              return (<div className="item" key={item.videoId}>
                <h3 className="title">{item.title}</h3>
                <div className="img-box">
                  <img src={item.path} alt="" className="img" />
                </div>
                <div className="text">{item.disc}</div>
                <button onClick={() => dlAction(item.videoId)}>dlActionv</button>
                <iframe width="560" height="315" src={`https://www.youtube.com/embed/${item.videoId}`} title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
              </div>)
            })}
          </div>
          <div className="view-movie">
            {mps.map(item => {
              return (
                <div key={item.time} className="view">
                  <video id={item.videoId} onCanPlay={ e => canvastag(e)} controls width={300}>
                    <source src={item.path} type="video/mp4" />
                  </video>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Movies;
