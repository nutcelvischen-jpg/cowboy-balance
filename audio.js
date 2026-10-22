export const VOICE_LINES={intro:'拑牢牢！出發啦！',again:'閣來！閣來！',trick:'莫予伊騙去！',wild:'這隻牛發狂矣！',final:'最後矣！拚落去！',lose_air:'你是咧飛喔？',lose_rest:'牛猶未累，你先歇睏！',win:'有夠勇！你過關矣！'};
export const musicTempo=level=>124+10*(Math.max(1,Math.min(5,level))-1);
export class AudioFX {
 constructor({createContext=()=>new(window.AudioContext||window.webkitAudioContext)(),fetcher=(...a)=>fetch(...a),onVoice=()=>{}}={}){
  this.createContext=createContext;this.fetcher=fetcher;this.onVoice=onVoice;this.muted=false;this.musicEnabled=true;this.ctx=null;this.scene='ready';this.level=1;this.recovery=false;this.sources=new Set();this.buffers=new Map();this.pending=new Map();this.epoch=0;this.request=0;this.spoken=new Set();this.duckUntil=0;this.voice=null;this.timer=null;this.beat=0;this.nextBeat=0;this.losses=0;
 }
 init(){
  try{
   if(!this.ctx){
    this.ctx=this.createContext();this.master=this.ctx.createGain();this.master.gain.value=.75;
    const limiter=this.ctx.createDynamicsCompressor();limiter.threshold.value=-8;limiter.knee.value=6;limiter.ratio.value=12;limiter.attack.value=.003;limiter.release.value=.12;
    this.master.connect(limiter);limiter.connect(this.ctx.destination);
    for(const name of ['musicBus','voiceBus','fxBus']){this[name]=this.ctx.createGain();this[name].connect(this.master);}
    this.musicBus.gain.value=.2;this.voiceBus.gain.value=.9;this.fxBus.gain.value=.8;
    this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate,this.ctx.sampleRate);const d=this.noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    this.preload();
   }
   if(!this.muted)this.ctx.resume().catch(()=>{});
  }catch{/* Gameplay remains available without audio support. */}
 }
 preload(){for(const id of Object.keys(VOICE_LINES)){
  const p=this.fetcher(new URL(`./voice/${id}.mp3`,import.meta.url)).then(r=>{if(!r.ok)throw new Error('Voice unavailable');return r.arrayBuffer();}).then(b=>this.ctx.decodeAudioData(b)).then(b=>{this.buffers.set(id,b);return b;}).catch(()=>null);
  this.pending.set(id,p);
 }}
 track(source,kind,nodes=[]){const entry={source,kind};this.sources.add(entry);source.onended=()=>{this.sources.delete(entry);source.disconnect();nodes.forEach(n=>n.disconnect());};return entry;}
 stopGroup(kind){for(const e of [...this.sources])if(!kind||e.kind===kind){try{e.source.stop();}catch{}this.sources.delete(e);}}
 osc(freq,duration,type,gain,fall,when,bus,kind='fx',filterHz=0){
  if(!this.ctx||this.muted)return;
  const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,when);o.frequency.exponentialRampToValueAtTime(Math.max(20,freq*fall),when+duration);
  g.gain.setValueAtTime(.0001,when);g.gain.linearRampToValueAtTime(gain,when+.006);g.gain.exponentialRampToValueAtTime(.0001,when+duration);
  const nodes=[g];if(filterHz){const f=this.ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=filterHz;f.Q.value=2;o.connect(f);f.connect(g);nodes.push(f);}else o.connect(g);
  g.connect(bus);this.track(o,kind,nodes);o.start(when);o.stop(when+duration+.02);
 }
 noiseHit(when,duration,gain,hz,type='highpass'){
  const s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();s.buffer=this.noise;f.type=type;f.frequency.value=hz;f.Q.value=.7;
  g.gain.setValueAtTime(gain,when);g.gain.exponentialRampToValueAtTime(.0001,when+duration);s.connect(f);f.connect(g);g.connect(this.musicBus);this.track(s,'music',[f,g]);s.start(when);s.stop(when+duration);
 }
 tone(freq,duration=.1,type='triangle',gain=.06,fall=1){if(this.ctx)this.osc(freq,duration,type,gain,fall,this.ctx.currentTime,this.fxBus);}
 setScene(scene){
  this.scene=scene;
  if(scene==='countdown'){this.cancelVoice();this.spoken.clear();this.beat=0;this.level=1;this.recovery=false;}
  if(['ready','calibrate','connecting'].includes(scene))this.cancelVoice();
  if(['playing','countdown'].includes(scene))this.startMusic();else this.stopMusic();
 }
 update(game){this.level=game.level;this.recovery=game.recovery;this.mix();}
 mix(){if(!this.ctx)return;const low=this.voice||this.ctx.currentTime<this.duckUntil;const volume=!this.musicEnabled||this.muted?0:(low ? .045 : this.recovery ? .10 : this.scene==='countdown' ? .10 : .20);this.musicBus.gain.setTargetAtTime(volume,this.ctx.currentTime,.045);}
 startMusic(){if(!this.ctx||this.muted||!this.musicEnabled||this.timer||!['playing','countdown'].includes(this.scene))return;this.nextBeat=this.ctx.currentTime+.035;this.timer=setInterval(()=>this.schedule(),25);this.schedule();}
 stopMusic(){if(this.timer){clearInterval(this.timer);this.timer=null;}this.stopGroup('music');}
 schedule(){
  if(!this.ctx||this.muted||!this.musicEnabled)return;
  const now=this.ctx.currentTime;if(this.nextBeat<now-.1)this.nextBeat=now+.02;
  while(this.nextBeat<now+.12){this.stepMusic(this.beat++,this.nextBeat);this.nextBeat+=60/musicTempo(this.level)/4;}
 }
 stepMusic(step,t){
  const b=step%16,root=73.416*Math.pow(2,[0,-2,3,-5][Math.floor(step/32)%4]/12);
  if(b%4===0)this.osc(160,.17,'sine',.75,.27,t,this.musicBus,'music');
  if(b===4||b===12)this.noiseHit(t,.12,.22,1700,'bandpass');
  if(b%2===0)this.noiseHit(t,b%4===2?.10:.035,.075,6500);
  if(b%2===1&&!this.recovery){const note=[0,0,7,0,10,0,5,7][Math.floor(b/2)];this.osc(root*Math.pow(2,note/12),.13,'sawtooth',.18,1,t,this.musicBus,'music',450+this.level*180);}
  if(this.level>=3&&this.scene==='playing'&&!this.recovery&&b%2===0){const note=[12,19,22,19,17,12,10,7][b/2];this.osc(root*Math.pow(2,note/12),.10,'triangle',.065,1,t,this.musicBus,'music',2400);}
 }
 async speak(id,priority=1){
  if(!this.ctx||this.muted||!VOICE_LINES[id])return false;
  if(this.voice&&priority<this.voice.priority)return false;
  const epoch=this.epoch,request=++this.request;
  const buffer=this.buffers.get(id)||await this.pending.get(id);
  if(!buffer||this.muted||epoch!==this.epoch||request!==this.request)return false;
  this.cancelVoice(false);const s=this.ctx.createBufferSource();s.buffer=buffer;s.connect(this.voiceBus);this.voice={source:s,priority,id};this.onVoice(VOICE_LINES[id]);this.mix();
  s.onended=()=>{s.disconnect();if(this.voice?.source===s){this.voice=null;this.onVoice('');this.mix();}};s.start();return true;
 }
 cancelVoice(invalidate=true){if(invalidate){this.epoch++;this.request++;}if(this.voice){const s=this.voice.source;this.voice=null;try{s.stop();}catch{}this.onVoice('');}this.mix();}
 stage(level){const id={2:'again',3:'trick',4:'wild',5:'final'}[level];if(id&&!this.spoken.has(id)){this.spoken.add(id);this.speak(id,2);}}
 countdown(){this.speak('intro',2);}
 kick(){this.tone(110,.15,'triangle',.16,.4);}
 cue(){this.tone(620,.1,'square',.024,.75);if(this.ctx){this.duckUntil=this.ctx.currentTime+.25;this.mix();}}
 count(){this.tone(440,.09);}
 start(){this.tone(880,.25,'triangle',.09,1.5);}
 fall(){this.stopMusic();this.tone(250,.6,'sawtooth',.04,.15);this.speak(this.losses++%2?'lose_rest':'lose_air',3);}
 win(){this.stopMusic();this.tone(660,.25,'triangle',.08,1.5);this.tone(990,.55,'sine',.055,1.34);this.speak('win',3);}
 pause(){this.stopMusic();this.stopGroup('fx');this.cancelVoice();this.suspendedScene=this.scene;this.scene='paused';}
 resume(){this.scene=this.suspendedScene||'playing';this.startMusic();}
 toggleMusic(){this.musicEnabled=!this.musicEnabled;if(this.musicEnabled)this.startMusic();else this.stopMusic();this.mix();}
 mute(){this.muted=!this.muted;if(this.ctx){this.master.gain.setValueAtTime(this.muted?0:.75,this.ctx.currentTime);if(this.muted){this.stopMusic();this.stopGroup('fx');this.cancelVoice();}else{this.ctx.resume().catch(()=>{});this.startMusic();}}}
 destroy(){this.stopMusic();this.stopGroup();this.cancelVoice();this.ctx?.close();}
}
