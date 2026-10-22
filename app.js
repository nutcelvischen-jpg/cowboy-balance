import {Rodeo,clamp,ROUND_SECONDS} from './model.js';
import {TiltController} from './sensor.js';
import {AudioFX} from './audio.js';
import {Arena} from './scene.js';
const $=id=>document.getElementById(id),game=new Rodeo(),tilt=new TiltController(),audio=new AudioFX();
let assetsReady=false;
let arena,state='ready',mode='touch',busy=false,count=0,lastCount=0,last=performance.now(),lastBuck=0,lastCue=0,lastDisplayed='',pauseReason='',best=0;
let request=0;const holds=new Set();
try{best=Number(localStorage.getItem('tilt-rodeo-terminator-best-v1')||0);if(!Number.isFinite(best)||best<0)best=0;}catch{}
try{arena=new Arena($('scene'));new ResizeObserver(()=>arena.resize()).observe($('arena'));arena.ready.then(()=>{assetsReady=true;$('asset-status').hidden=true;render();}).catch(error=>{assetsReady=true;$('asset-status').textContent='角色載入失敗，暫用簡易角色；重新整理可重試。';console.warn('Character loading failed',error);render();});}catch(error){$('scene-error').hidden=false;$('primary').disabled=true;$('secondary').disabled=true;console.error('3D 場景初始化失敗',error);}
const showError=message=>{$('error').textContent=message;$('error').hidden=!message;};
function setState(next){state=next;$('game').dataset.state=next;render();}
function clearInput(){holds.clear();for(const id of ['left','right'])$(id).classList.remove('held');}
function ready(){request++;busy=false;game.reset();clearInput();$('pause-cover').hidden=true;showError('');setState('ready');}
async function enableTilt(){
 if(busy)return;audio.init();busy=true;const token=++request;showError('');setState('connecting');
 try{await tilt.enable();if(token!==request)return;mode='tilt';game.reset();setState('calibrate');}
 catch(e){if(token!==request)return;setState('ready');showError(e.message||'無法啟用感測器，請改用觸控。');}
 finally{if(token===request){busy=false;render();}}
}
function countdown(){audio.init();showError('');clearInput();game.reset();count=3;lastCount=3;audio.count();setState('countdown');}
function primary(){
 if(state==='ready')enableTilt();
 else if(state==='calibrate'){try{tilt.calibrate();countdown();}catch(e){showError(e.message);}}
 else if(['finished','won'].includes(state)){
  if(mode==='tilt'){game.reset();setState('calibrate');}else countdown();
 }
}
$('primary').addEventListener('click',primary);
$('secondary').addEventListener('click',()=>{if(['finished','won'].includes(state)&&mode==='touch'){enableTilt();return;}request++;busy=false;mode='touch';showError('');countdown();});
function hold(id,dir){const button=$(id);button.addEventListener('pointerdown',e=>{if(e.button!==0||state!=='playing')return;e.preventDefault();button.setPointerCapture(e.pointerId);holds.add(dir);button.classList.add('held');});const release=()=>{holds.delete(dir);button.classList.remove('held');};for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,release);button.addEventListener('contextmenu',e=>e.preventDefault());}
hold('left','left');hold('right','right');
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','a','d','A','D'].includes(e.key)&&mode==='touch'&&state==='playing'){e.preventDefault();holds.add(['ArrowLeft','a','A'].includes(e.key)?'left':'right');}if(e.code==='Escape'&&['playing','countdown'].includes(state))pause('manual');});
window.addEventListener('keyup',e=>{if(['ArrowLeft','a','A'].includes(e.key))holds.delete('left');if(['ArrowRight','d','D'].includes(e.key))holds.delete('right');});
function pause(reason='manual'){
 if(!['playing','countdown'].includes(state)||game.paused)return;game.paused=true;pauseReason=reason;clearInput();$('pause-cover').hidden=false;
 $('pause-hint').textContent=reason==='sensor'?'傾斜資料中斷，已暫停。拿穩手機，繼續時會重新校正。':reason==='rotation'?'手機方向改變了。拿穩手機，繼續時會重新校正。':'遊戲已暫停，時間不會繼續跑。';
 $('resume').focus();render();
}
$('pause').addEventListener('click',()=>pause());
$('resume').addEventListener('click',async()=>{
 audio.init();if(mode==='tilt'){
  try{await tilt.enable();tilt.calibrate();}catch(e){$('pause-hint').textContent=e.message;return;}
 }
 game.paused=false;clearInput();$('pause-cover').hidden=true;last=performance.now();$('pause').focus();render();
});
$('restart').addEventListener('click',ready);
$('sound').addEventListener('click',()=>{audio.init();audio.mute();$('sound').setAttribute('aria-pressed',String(audio.muted));$('sound').setAttribute('aria-label',audio.muted?'開啟音效':'靜音音效');});
window.addEventListener('blur',()=>{clearInput();pause('background');});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause('background');last=performance.now();});
const rotate=()=>pause('rotation');window.addEventListener('orientationchange',rotate);screen.orientation?.addEventListener('change',rotate);
// Keep focus inside the paused task; this overlay is the only modal surface.
$('pause-cover').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const a=$('resume'),b=$('restart');if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus();}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus();}});
function render(){
 $('best').textContent=best.toFixed(1);$('time-label').textContent=state==='won'?'30 秒挑戰完成':`存活時間 / ${ROUND_SECONDS} 秒`; $('time').textContent=game.time.toFixed(1);$('grip-label').textContent=`抓穩 ${Math.ceil(game.grip)}%`;
 const lean=clamp(game.angle);$('balance-pin').style.left=`${50+lean*48}%`;$('balance').setAttribute('aria-valuenow',String(Math.round(lean*100)));$('balance').dataset.danger=String(Math.abs(game.angle)>.65);
 $('level').textContent=['熱身甩動','左右連甩','假動作來了','狂牛暴走','最後暴走'][game.level-1];
 $('pause').disabled=!['playing','countdown'].includes(state)||game.paused;$('primary').hidden=!['ready','connecting','calibrate','finished','won'].includes(state);$('primary').disabled=busy||!arena||!assetsReady;
 $('secondary').hidden=!['ready','connecting','calibrate','finished','won'].includes(state);$('secondary').disabled=!arena||!assetsReady;
 $('touch-controls').hidden=mode!=='touch'||state!=='playing';$('countdown').hidden=state!=='countdown';$('countdown').textContent=String(Math.max(1,Math.ceil(count)));
 $('mode-note').textContent=state==='ready'?'不用下載 · 感測資料只留在手機':mode==='tilt'?'傾斜操控 · 暫停後可重新校正':'觸控／方向鍵操控';
 let heading,hint;
 if(state==='ready'){heading='手機終結者，撐過 30 秒。';hint='雙手握穩，輕斜就能救回牛仔。\n看預告反打，連甩之間有喘息。';$('primary').textContent='啟用手機傾斜';$('secondary').textContent='先用觸控／方向鍵試玩';}
 if(state==='connecting'){heading='正在連接傾斜感測…';hint='如果跳出動作與方向權限，請選允許。';$('primary').textContent='等待感測資料…';$('secondary').textContent='改用觸控／方向鍵';}
 if(state==='calibrate'){heading='拿穩手機，記住這個角度。';hint='雙手握穩；左右約 12° 就有完整力道。';$('primary').textContent='校正好了，上牛！';$('secondary').textContent='改用觸控／方向鍵';}
 if(state==='countdown'){heading='抓穩，要開甩了。';hint=mode==='tilt'?'傾斜手機調整重心，別一口氣歪太多。':'按住左／右，或用鍵盤方向鍵扶正。';}
 if(state==='playing'){heading=game.recovery?'喘口氣，回中央補抓握力。':Math.abs(game.angle)>.55?(game.angle>0?'快往左，拉回來！':'快往右，拉回來！'):'穩住，別跟牛一起倒。';hint=`還差 ${Math.ceil(game.remaining)} 秒！`+(mode==='tilt'?'輕斜扶正，不用甩手機。':'短按左右扶正，別一直按到底。');}
 if(state==='falling'){heading='帽子保住，人先下班。';hint='這頭牛，有一點自己的想法。';}
 if(state==='finished'){heading=`撐了 ${game.time.toFixed(1)} 秒！`;hint=game.time>=20?'老牛都得叫你一聲大哥。':'牛還沒累，你先下來了。再試一次？';$('primary').textContent=mode==='tilt'?'重新校正，再騎一次':'再騎一次';$('secondary').textContent=mode==='tilt'?'改用觸控試玩':'改用手機傾斜';}
 if(state==='won'){heading='通關！手機還活著。';hint='30 秒，狂牛服了。你是手機守護者。';$('primary').textContent='再挑戰一次';$('secondary').textContent=mode==='tilt'?'改用觸控試玩':'改用手機傾斜';}
 if(heading+'|'+hint!==lastDisplayed){$('heading').textContent=heading;$('hint').textContent=hint;lastDisplayed=heading+'|'+hint;}
 $('cue').hidden=(!game.cue&&!game.feint)||state!=='playing'||game.paused;$('cue').textContent=game.feint?'假動作！先守住中央':game.cue>0?'要往右甩！準備往左救':'要往左甩！準備往右救';
}
function frame(now){
 const dt=Math.max(0,(now-last)/1000);last=now;
 if(!document.hidden && !game.paused){
  if(dt>.5 && ['playing','countdown'].includes(state)){pause('background');}
  else if(state==='countdown'){
   if(mode==='tilt'&&tilt.stale)pause('sensor');else{count-=dt;if(Math.ceil(count)!==lastCount&&count>0){lastCount=Math.ceil(count);audio.count();}if(count<=0){game.start();lastBuck=0;lastCue=0;audio.start();setState('playing');}}
  }else if(state==='playing'||state==='falling'){
   if(state==='playing'&&mode==='tilt'&&tilt.stale)pause('sensor');else{
    const input=mode==='tilt'?tilt.update(Math.min(dt,.1)):(holds.has('right')?1:0)-(holds.has('left')?1:0);
    game.tick(dt,input);
    if(game.bucks!==lastBuck){audio.kick();lastBuck=game.bucks;}
    if(game.cue && !lastCue)audio.cue();lastCue=game.cue;
    if(game.phase==='falling'&&state!=='falling'){audio.fall();clearInput();setState('falling');}
    if(['finished','won'].includes(game.phase)&&state!==game.phase){best=Math.max(best,game.time);try{localStorage.setItem('tilt-rodeo-terminator-best-v1',String(best));}catch{}if(game.phase==='won')audio.win();clearInput();setState(game.phase);}
   }
  }
 }
 render();arena?.draw(game,now);requestAnimationFrame(frame);
}
render();requestAnimationFrame(frame);
