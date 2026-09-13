// YouTube IFrame API: https://developers.google.com/youtube/iframe_api_reference
let apiPromise;
const clock = value => Math.floor(Math.max(0,value)/60)+':'+String(Math.floor(Math.max(0,value)%60)).padStart(2,'0');
function youtubeAPI() {
  if(window.YT?.Player)return Promise.resolve(window.YT);
  if(apiPromise)return apiPromise;
  apiPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    const fail=()=>{clearTimeout(timer);script.remove();reject(new Error('Não foi possível ligar ao YouTube. Tente novamente.'));};
    const timer=setTimeout(fail,25000);
    window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);resolve(window.YT);};
    script.src='https://www.youtube.com/iframe_api';script.addEventListener('error',fail,{once:true});document.head.append(script);
  }).catch(error=>{apiPromise=null;throw error;});
  return apiPromise;
}
export function youtubeMarkup(video,esc) {
  return `<div id="source-${video.id}" class="youtube-player" role="group" data-youtube="${video.id}" aria-label="Vídeo do YouTube: ${esc(video.title)}"><div class="youtube-screen"><img src="${video.poster}" alt="${esc(video.title)}" loading="lazy"><div class="youtube-mount"></div><button class="youtube-start" data-yt-toggle aria-label="Reproduzir ${esc(video.title)} com áudio"><span>▶</span> Reproduzir com áudio</button></div><div class="youtube-controls"><button data-yt-toggle aria-label="Reproduzir ${esc(video.title)}">Reproduzir</button><label class="sr-only" for="seek-${video.id}">Momento na fonte ${esc(video.title)}</label><input id="seek-${video.id}" type="range" min="0" max="${video.sourceStartSeconds+video.duration_seconds}" step="1" value="${video.sourceStartSeconds}" disabled><output aria-live="off">${clock(video.sourceStartSeconds)} / ${clock(video.sourceStartSeconds+video.duration_seconds)}</output><button data-yt-fullscreen aria-label="Ver ${esc(video.title)} em ecrã inteiro">⛶</button></div><p class="youtube-status" role="status" aria-live="polite">YouTube · áudio disponível nos controlos do vídeo</p></div>`;
}
export function createYouTubeLibrary(videos,{isActive,onPlay,onError}) {
  let serial=0;
  const entries=new Map(videos.map(video=>{
    const root=document.getElementById('source-'+video.id);
    return [video.id,{video,root,player:null,ready:null,scrubbing:false,loading:false}];
  }));
  const status=(entry,text)=>{entry.root.querySelector('.youtube-status').textContent=text;};
  const pauseOthers=id=>{for(const [key,entry] of entries)if(key!==id)entry.player?.pauseVideo?.();};
  function pauseAll(){serial++;pauseOthers(null);}
  function update(entry) {
    if(!entry.player?.getPlayerState)return;
    const p=entry.player,state=p.getPlayerState(),playing=state===1||state===3;
    if(!isActive()&&playing){p.pauseVideo();return;}
    const time=Math.max(0,p.getCurrentTime()),duration=p.getDuration?.()||entry.video.sourceStartSeconds+entry.video.duration_seconds;
    const slider=entry.root.querySelector('input');
    slider.max=duration;
    if(!entry.scrubbing)slider.value=Math.min(time,duration);
    slider.disabled=false;
    entry.root.querySelector('output').textContent=clock(entry.scrubbing?Number(slider.value):time)+' / '+clock(duration);
    if(state===2)status(entry,'Em pausa · áudio disponível nos controlos do vídeo');
    const toggle=entry.root.querySelector('.youtube-controls [data-yt-toggle]');
    toggle.textContent=playing?'Pausar':'Reproduzir';toggle.setAttribute('aria-label',(playing?'Pausar ':'Reproduzir ')+entry.video.title);
  }
  async function ready(entry) {
    if(entry.ready)return entry.ready;
    entry.ready=(async()=>{
      const YT=await youtubeAPI();
      return new Promise((resolve,reject)=>{
        let settled=false;
        const timer=setTimeout(()=>failed('O vídeo demorou a responder. Tente novamente.'),25000);
        function failed(message){clearTimeout(timer);entry.player?.destroy();entry.player=null;entry.ready=null;entry.root.classList.remove('youtube-started');status(entry,message);if(!settled){settled=true;reject(new Error(message));}}
        const mount=document.createElement('div');entry.root.querySelector('.youtube-mount').replaceChildren(mount);
        entry.player=new YT.Player(mount,{videoId:entry.video.youtubeId,width:'100%',height:'100%',playerVars:{start:entry.video.sourceStartSeconds,autoplay:0,mute:0,controls:1,disablekb:0,playsinline:1,fs:1,rel:0,origin:location.origin},events:{
          onReady:({target})=>{clearTimeout(timer);target.setVolume(70);target.unMute();const iframe=target.getIframe();iframe.tabIndex=0;iframe.title=entry.video.title;iframe.removeAttribute('aria-hidden');iframe.referrerPolicy='strict-origin-when-cross-origin';if(!settled){settled=true;resolve(target);}},
          onStateChange:({target,data})=>{if(data===1){if(!isActive()){target.pauseVideo();return;}pauseOthers(entry.video.id);onPlay();entry.root.classList.add('youtube-started');status(entry,'YouTube · áudio disponível nos controlos do vídeo');}update(entry);},
          onAutoplayBlocked:()=>{entry.root.classList.add('youtube-started');status(entry,'Prima Reproduzir no vídeo para iniciar com som.');},
          onError:()=>failed('Este vídeo está indisponível no leitor. Pode consultar a fonte no YouTube.')
        }});
      });
    })().catch(error=>{entry.ready=null;throw error;});
    return entry.ready;
  }
  async function play(id,time=0,{absolute=false}={}) {
    const entry=entries.get(id);if(!entry||!isActive())return;
    const request=++serial;pauseOthers(id);onPlay();entry.loading=true;status(entry,'A carregar o vídeo com áudio…');
    try{
      const p=await ready(entry);if(request!==serial||!isActive())return;
      const duration=p.getDuration?.()||entry.video.sourceStartSeconds+entry.video.duration_seconds;
      p.seekTo(absolute?Math.max(0,Math.min(time,duration-1)):entry.video.sourceStartSeconds+Math.max(0,Math.min(time,entry.video.duration_seconds-1)),true);p.playVideo();
    }catch(error){if(request===serial){status(entry,error.message);onError(error.message);}}
    finally{entry.loading=false;}
  }
  for(const [id,entry] of entries){
    entry.root.querySelectorAll('[data-yt-toggle]').forEach(button=>button.addEventListener('click',()=>{
      const p=entry.player,state=p?.getPlayerState?.();
      if(state===1||state===3){serial++;p.pauseVideo();update(entry);}
      else if(!entry.loading)void play(id,state===0?entry.video.sourceStartSeconds:(p?.getCurrentTime?.()??entry.video.sourceStartSeconds),{absolute:true});
    }));
    const slider=entry.root.querySelector('input');
    slider.addEventListener('input',()=>{entry.scrubbing=true;update(entry);});
    slider.addEventListener('change',()=>{entry.scrubbing=false;void play(id,Number(slider.value),{absolute:true});});
    entry.root.querySelector('[data-yt-fullscreen]').addEventListener('click',async()=>{
      try{if(document.fullscreenElement===entry.root)await document.exitFullscreen();else await entry.root.requestFullscreen();}catch{onError('O ecrã inteiro não está disponível neste navegador.');}
    });
  }
  setInterval(()=>{if(isActive())for(const entry of entries.values())update(entry);},250);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAll();});
  return {play,pauseAll,has:id=>entries.has(id)};
}
