export class AudioFX {
 constructor(){this.muted=false;this.ctx=null;}
 init(){try{this.ctx??=new(window.AudioContext||window.webkitAudioContext)();this.ctx.resume().catch(()=>{});}catch{}}
 tone(freq,duration=.1,type='triangle',gain=.06,fall=1){if(!this.ctx||this.muted)return;const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,freq*fall),t+duration);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(gain,t+.008);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+duration+.01);}
 kick(){this.tone(110,.15,'triangle',.16,.4);}
 cue(){this.tone(620,.1,'square',.018,.75);}
 count(){this.tone(440,.09);}
 start(){this.tone(880,.25,'triangle',.09,1.5);}
 fall(){this.tone(250,.6,'sawtooth',.04,.15);}
 win(){this.tone(660,.25,'triangle',.08,1.5);this.tone(990,.55,'sine',.055,1.34);}
 mute(){this.muted=!this.muted;if(this.ctx){if(this.muted)this.ctx.suspend().catch(()=>{});else this.ctx.resume().catch(()=>{});}}
}
