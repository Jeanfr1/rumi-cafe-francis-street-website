// Behaviour contract checks in a minimal DOM harness; not a browser rendering test.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const makeClass=()=>({values:new Set(),add(s){this.values.add(s)},remove(s){this.values.delete(s)},contains(s){return this.values.has(s)},toggle(s,on){if(on===undefined)on=!this.values.has(s);on?this.add(s):this.remove(s);return on}});
const el=()=>({classList:makeClass(),style:{values:{},setProperty(k,v){this.values[k]=v}},events:{},attrs:{},textContent:'',disabled:false,offsetWidth:100,firstChild:{textContent:'Open navigation '},addEventListener(k,f){this.events[k]=f},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},focus(){this.focused=true}});
const root=el(),hero=el(),replay=el(),pause=el(),toggle=el(),nav=el(),reveal=el(),link=el();toggle.attrs['aria-expanded']='false';nav.querySelectorAll=()=>[link];
const map={'.hero':hero,'#replay':replay,'#motion-toggle':pause,'.menu-toggle':toggle,'#primary-nav':nav},events={},media={matches:false,addEventListener(k,f){this.change=f}};
const doc={documentElement:root,hidden:false,querySelector:s=>map[s],querySelectorAll:()=>[reveal],addEventListener(k,f){events[k]=f}};
const context={document:doc,matchMedia:()=>media,window:{},innerWidth:1440,scrollY:0,requestAnimationFrame:f=>1,cancelAnimationFrame:()=>{},addEventListener:()=>{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../08-estudo/rumi.js'),'utf8'),context);
assert(hero.classList.contains('play'),'opening enabled');assert(reveal.classList.contains('visible'),'observer fallback keeps content visible');
pause.events.click();assert(root.classList.contains('paused'));assert.equal(pause.textContent,'Resume animation');assert.equal(pause.attrs['aria-pressed'],'true');
replay.events.click();assert(!root.classList.contains('paused'));assert(hero.classList.contains('play'));assert.equal(pause.attrs['aria-pressed'],'false');
toggle.events.click();assert.equal(toggle.attrs['aria-expanded'],'true');assert(nav.classList.contains('open'));
events.keydown({key:'Escape'});assert.equal(toggle.attrs['aria-expanded'],'false');assert(!nav.classList.contains('open'));assert(toggle.focused);
toggle.events.click();link.events.click();assert(!nav.classList.contains('open'));
media.matches=true;media.change();assert(root.classList.contains('reduced'));assert(!hero.classList.contains('play'));assert(replay.disabled&&pause.disabled);
media.matches=false;media.change();assert(!root.classList.contains('reduced'));assert(hero.classList.contains('play'));assert(!replay.disabled);
console.log('PASS: initial opening, content fallback, pause, replay, mobile menu, Escape focus, anchor closure and live reduced-motion preference. DOM harness only.');
