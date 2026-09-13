// Complete, bounded media objects also support seeking on hosts without byte ranges.
export function createVideoLibrary(videos,{isActive,onError}) {
  const entries=new Map(videos.map(video=>[video,{source:video.getAttribute('src'),url:null}]));
  const cache=new Map(),internalStarts=new Map();
  let serial=0,controller=null;
  // The entire portfolio is silent, including native controls and future clips.
  function silence(video) {
    if(!video.defaultMuted)video.defaultMuted=true;
    if(!video.muted)video.muted=true;
    if(video.volume!==0)video.volume=0;
  }
  function status(video,message) {
    let node=video.parentElement.querySelector('.video-load-status');
    if(!node){node=document.createElement('p');node.className='video-load-status';node.setAttribute('role','status');node.setAttribute('aria-live','polite');video.after(node);}
    node.textContent=message;node.hidden=!message;
  }
  function cancel() {
    serial++;controller?.abort();controller=null;
    for(const video of videos)status(video,'');
  }
  function waitForMedia(video,signal) {
    if(video.readyState>=1)return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const clear=()=>{video.removeEventListener('loadedmetadata',ready);video.removeEventListener('error',failed);signal.removeEventListener('abort',aborted);};
      const ready=()=>{clear();resolve();};
      const failed=()=>{clear();reject(new Error('Não foi possível abrir este vídeo.'));};
      const aborted=()=>{clear();reject(new DOMException('Cancelled','AbortError'));};
      video.addEventListener('loadedmetadata',ready,{once:true});video.addEventListener('error',failed,{once:true});signal.addEventListener('abort',aborted,{once:true});
      if(signal.aborted)aborted();
    });
  }
  function remember(video,entry,url) {
    entry.url=url;cache.delete(video);cache.set(video,entry);
    while(cache.size>2){
      const [oldVideo,oldEntry]=cache.entries().next().value;cache.delete(oldVideo);
      oldVideo.pause();oldVideo.src=oldEntry.source;oldVideo.load();URL.revokeObjectURL(oldEntry.url);oldEntry.url=null;
    }
  }
  function seek(video,time,signal) {
    return new Promise((resolve,reject)=>{
      const clear=()=>{video.removeEventListener('seeked',ready);video.removeEventListener('error',failed);signal.removeEventListener('abort',aborted);};
      const ready=()=>{if(video.seeking)return;clear();Math.abs(video.currentTime-time)<.35?resolve():reject(new Error('Não foi possível abrir o detalhe escolhido. Tente novamente.'));};
      const failed=()=>{clear();reject(new Error('Não foi possível abrir este vídeo.'));};
      const aborted=()=>{clear();reject(new DOMException('Cancelled','AbortError'));};
      video.addEventListener('seeked',ready);video.addEventListener('error',failed,{once:true});signal.addEventListener('abort',aborted,{once:true});
      try{video.currentTime=time;if(signal.aborted)aborted();else if(!video.seeking)ready();}catch(error){clear();reject(error);}
    });
  }
  async function play(video,time=0) {
    const entry=entries.get(video);if(!entry||!isActive())return;
    silence(video);
    cancel();const request=serial,abort=new AbortController();controller=abort;
    const current=()=>request===serial&&isActive()&&!abort.signal.aborted;
    for(const other of videos)other.pause();
    let timedOut=false;
    const timer=setTimeout(()=>{timedOut=true;abort.abort();if(request===serial)video.pause();},45000);
    try {
      if(!entry.url){
        status(video,'A preparar o vídeo para navegar entre detalhes…');
        const response=await fetch(entry.source,{signal:abort.signal});
        if(!response.ok)throw new Error('Não foi possível carregar este vídeo. Tente novamente.');
        const blob=await response.blob();
        if(!current())return;
        if(!blob.size)throw new Error('O ficheiro de vídeo está vazio.');
        const url=URL.createObjectURL(blob);remember(video,entry,url);video.src=url;video.load();
      }else{cache.delete(video);cache.set(video,entry);}
      await waitForMedia(video,abort.signal);
      if(!current())return;
      await seek(video,Math.max(0,Math.min(time,Math.max(0,video.duration-.05))),abort.signal);
      if(!current())return;
      internalStarts.set(video,request);
      await video.play();
      if(!current())video.pause();
    }catch(error){
      if(request===serial&&video.error&&entry.url){
        const failedURL=entry.url;entry.url=null;cache.delete(video);video.src=entry.source;video.load();URL.revokeObjectURL(failedURL);
      }
      if(request===serial&&(timedOut||error.name!=='AbortError'))onError(timedOut?'O vídeo demorou a carregar. Tente novamente.':error.message);
    }finally{
      clearTimeout(timer);if(internalStarts.get(video)===request)internalStarts.delete(video);
      if(request===serial){controller=null;status(video,'');}
    }
  }
  for(const video of videos){
    silence(video);
    video.addEventListener('volumechange',()=>silence(video));
    video.addEventListener('loadedmetadata',()=>silence(video));
    status(video,'');
    video.addEventListener('play',()=>{
      silence(video);
      for(const other of videos)if(other!==video)other.pause();
      if(internalStarts.has(video))return;
      if(!isActive()){video.pause();return;}
      if(entries.get(video).url){cache.delete(video);cache.set(video,entries.get(video));cancel();return;}
      const time=video.currentTime;video.pause();void play(video,time);
    });
  }
  return {play,cancel};
}
