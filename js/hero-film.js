/* ===== HERO: filme 3D =====
   Roteiro (docs/design/02-sistema-de-design.md, "A abertura"):
   1. Chegada   0,2–2,6 s  o notebook fechado sobe de fora do quadro girando, uma luz percorre a tampa.
   2. Abertura  2,2–4,6 s  a tampa abre, a tela acende com as cortinas de luz e ilumina o teclado.
   3. O clipe   4,0–6,8 s  o arame entra voando de fora do quadro, se dobra no formato e para diante da tela.
   4. Mergulho  6,8–9,6 s  a câmera avança com o clipe; a tela clareia até virar a própria página e o clipe atravessa. */
'use strict';
const film=(()=>{
  const hero=$('#inicio'),host=$('#stage3d'),skip=$('#fSkip'),replay=$('#fReplay'),hint=$('#dragHint');
  const DUR=10.4,A4=6.8,A4_END=9.6,HIDE_LATEST=9.4;
  let gl=false;try{gl=typeof THREE!=='undefined'&&!!document.createElement('canvas').getContext('webgl')}catch(e){}
  if(!gl){
    host.innerHTML='<svg class="fallback-clip" aria-hidden="true"><use href="#clip"/></svg>';skip.hidden=true;
    return{boot(){hero.classList.remove('night');hero.classList.add('lit')},resize(){},leave(){},frame(){},replay(){}};
  }
  const P=[];{
    const step=.03;
    const line=(x1,y1,x2,y2)=>{const n=Math.max(1,Math.round(Math.hypot(x2-x1,y2-y1)/step));for(let i=0;i<n;i++)P.push([x1+(x2-x1)*i/n,y1+(y2-y1)*i/n])};
    const arc=(cx,cy,r,a1,a2)=>{const n=Math.max(2,Math.round(Math.abs(a2-a1)*r/step));for(let i=0;i<n;i++){const a=a1+(a2-a1)*i/n;P.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}};
    line(2.25,-.5,.5,-.5);arc(.5,0,.5,-Math.PI/2,-Math.PI*1.5);line(.5,.5,2.9,.5);arc(2.9,.1,.4,Math.PI/2,-Math.PI/2);line(2.9,-.3,.92,-.3);arc(.92,-.05,.25,-Math.PI/2,-Math.PI*1.5);line(.92,.2,2.15,.2);P.push([2.15,.2]);
  }
  const ds=[],hd=[];let L=0;
  for(let i=0;i<P.length-1;i++){
    const dx=P[i+1][0]-P[i][0],dy=-(P[i+1][1]-P[i][1]),d=Math.hypot(dx,dy);if(d<1e-6)continue;
    let a=Math.atan2(dy,dx);if(hd.length){const pv=hd[hd.length-1];while(a-pv>Math.PI)a-=2*Math.PI;while(a-pv<-Math.PI)a+=2*Math.PI}
    ds.push(d);hd.push(a);L+=d;
  }
  const N=ds.length,h0=hd[0],mid=[];{let c=0;for(let i=0;i<N;i++){mid.push((c+ds[i]/2)/L);c+=ds[i]}}
  // Dobra que preserva o comprimento do arame: o começo dobra primeiro e o resto acompanha.
  function shape(p){
    const out=[new THREE.Vector3(0,0,0)];let x=0,y=0;
    for(let i=0;i<N;i++){const b=io3(cl(p*1.6-mid[i]*.6)),th=h0+(hd[i]-h0)*b;x+=Math.cos(th)*ds[i];y+=Math.sin(th)*ds[i];out.push(new THREE.Vector3(x,y,0))}
    let mx=0,my=0;out.forEach(v=>{mx+=v.x;my+=v.y});mx/=out.length;my/=out.length;out.forEach(v=>{v.x-=mx;v.y-=my});
    return out;
  }
  const R=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  R.setPixelRatio(Math.min(2,devicePixelRatio||1));R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=0;R.physicallyCorrectLights=true;R.setClearColor(0x000000,0);
  host.appendChild(R.domElement);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(30,1,.1,200);
  const pm=new THREE.PMREMGenerator(R),es=new THREE.Scene();es.background=new THREE.Color(0x070707);
  const panel=(w,h,pos,rot,k,col)=>{const c=col||[1,1,1];const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c[0]*k,c[1]*k,c[2]*k),side:THREE.DoubleSide}));m.position.set(pos[0],pos[1],pos[2]);m.rotation.set(rot[0],rot[1],rot[2]);es.add(m)};
  panel(12,2.4,[0,6,0],[Math.PI/2,0,0],4.2);
  panel(1.2,9,[-6,1,1],[0,Math.PI/2,0],2.8,[.85,.92,1]);
  panel(.8,9,[6,1,-1],[0,-Math.PI/2,0],1.9,[.85,.92,1]);
  for(let i=0;i<9;i++)panel(.18,7,[-4+i,1,-8],[0,0,0],1.1+(i%3)*.5,[.8,.88,1]); // fios de luz ao fundo, refletidos no metal
  panel(8,1.2,[0,-3,7],[0,Math.PI,0],1.3);
  scene.environment=pm.fromScene(es,.02).texture;

  /* --- O clipe --- */
  const mat=new THREE.MeshPhysicalMaterial({color:0xdcdee1,metalness:1,roughness:.19,envMapIntensity:.1,clearcoat:.35,clearcoatRoughness:.12});
  const group=new THREE.Group();scene.add(group);
  const RAD=.036,mesh=new THREE.Mesh(new THREE.BufferGeometry(),mat);mesh.renderOrder=2;group.add(mesh);
  const capG=new THREE.SphereGeometry(RAD,20,12),capA=new THREE.Mesh(capG,mat),capB=new THREE.Mesh(capG,mat);capA.renderOrder=capB.renderOrder=2;group.add(capA,capB);
  let pts=null,lastP=-1;
  function build(p){
    pts=shape(p);const sub=pts.filter((v,i)=>i%2===0||i===pts.length-1);
    const curve=new THREE.CatmullRomCurve3(sub,false,'centripetal');
    mesh.geometry.dispose();mesh.geometry=new THREE.TubeGeometry(curve,560,RAD,18,false);
    capA.position.copy(pts[0]);capB.position.copy(pts[pts.length-1]);lastP=p;
  }

  /* --- O notebook: base, teclado, trackpad e tampa com dobradiça --- */
  const LW=9.2,BD=6.3,BT=.26,LH=6.1,LT=.11,OPEN=-.2,SW=LW-.42,SH=LH-.5;
  function rr(w,h,r,cy){const s=new THREE.Shape(),x=-w/2,y=cy-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
  const slab=(s,t)=>new THREE.ExtrudeGeometry(s,{depth:t,bevelEnabled:true,bevelThickness:t*.2,bevelSize:t*.2,bevelSegments:3,curveSegments:12});
  const alu=new THREE.MeshPhysicalMaterial({color:0x2d2f32,metalness:.92,roughness:.34,clearcoat:.25,clearcoatRoughness:.3});
  const keyM=new THREE.MeshStandardMaterial({color:0x0a0a0b,roughness:.8,metalness:0});
  const padM=new THREE.MeshPhysicalMaterial({color:0x37393c,metalness:.6,roughness:.45});
  const glass=new THREE.MeshPhysicalMaterial({color:0x040404,metalness:0,roughness:.08,clearcoat:1,clearcoatRoughness:.05});
  const laptop=new THREE.Group(),spin=new THREE.Group();laptop.add(spin);scene.add(laptop);
  const base=new THREE.Mesh(slab(rr(LW,BD,.42,0),BT).rotateX(-Math.PI/2),alu);base.position.y=-BT*1.2;spin.add(base);
  {const kw=.5,kg=.1,cols=14,rows=6,km=new THREE.InstancedMesh(new THREE.BoxGeometry(kw,.05,kw*.92),keyM,cols*rows),o=new THREE.Object3D();let n=0;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){o.position.set((c-(cols-1)/2)*(kw+kg),.01,-BD/2+.75+r*(kw*.92+kg));o.updateMatrix();km.setMatrixAt(n++,o.matrix)}
    spin.add(km)}
  const pad=new THREE.Mesh(new THREE.PlaneGeometry(4.3,2.3).rotateX(-Math.PI/2),padM);pad.position.set(0,.004,BD/2-1.45);spin.add(pad);
  const hinge=new THREE.Group();hinge.position.set(0,.02,-BD/2+.12);spin.add(hinge);
  const lid=new THREE.Mesh(slab(rr(LW,LH,.42,LH/2),LT),alu);lid.position.z=-LT;hinge.add(lid);
  const bezel=new THREE.Mesh(new THREE.ShapeGeometry(rr(LW-.12,LH-.12,.36,LH/2),12),glass);bezel.position.z=LT*.2+.006;hinge.add(bezel);
  const sc=document.createElement('canvas');sc.width=1024;sc.height=Math.round(1024*SH/SW);const sx=sc.getContext('2d');
  const tex=new THREE.CanvasTexture(sc);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=4;
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(SW,SH),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));
  screen.position.set(0,LH/2+.06,LT*.2+.03);hinge.add(screen);
  const sl=document.createElement('canvas'),scr=Streaks(sl,{w:sc.width,h:sc.height});scr.set(SCFG.hero);
  function paintScreen(t,on,iv){ // a tela: preta, depois as cortinas de luz, depois a página (marfim)
    sx.fillStyle='#030303';sx.fillRect(0,0,sc.width,sc.height);
    if(on>.002){scr.st.alpha=on;scr.st.pour=on;scr.frame(t);sx.drawImage(sl,0,0)}
    if(iv>.002){sx.globalAlpha=iv;sx.fillStyle='#F4F1EA';sx.fillRect(0,0,sc.width,sc.height);sx.globalAlpha=1}
    tex.needsUpdate=true;
  }

  /* --- Luzes --- */
  const sweep=new THREE.PointLight(0xe6eeff,0,0,2);scene.add(sweep);
  const glow=new THREE.PointLight(0xc8d4ff,0,0,2);scene.add(glow); // a luz da tela caindo no teclado
  const key=new THREE.DirectionalLight(0xffffff,0);key.position.set(2,4,5);scene.add(key);
  const shc=document.createElement('canvas');shc.width=shc.height=128;{const g=shc.getContext('2d'),gr=g.createRadialGradient(64,64,1,64,64,64);gr.addColorStop(0,'rgba(28,29,28,.6)');gr.addColorStop(.45,'rgba(28,29,28,.2)');gr.addColorStop(1,'rgba(28,29,28,0)');g.fillStyle=gr;g.fillRect(0,0,128,128)}
  const shMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shc),transparent:true,opacity:0,depthWrite:false});
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.15),shMat);sh.rotation.x=-Math.PI/2;sh.position.y=-.68;scene.add(sh);

  /* --- Enquadramentos. O final é o mesmo de sempre: clipe na origem, câmera em CF.
     A tela fica logo à frente de CF, então o mergulho termina exatamente no quadro final. --- */
  const V=(x,y,z)=>new THREE.Vector3(x,y,z),FIN={rx:.08,ry:-.32};
  let W=1,H=1,dist=8.4,lift=0,dCover=10;
  const CF=V(0,0,0),QF=new THREE.Quaternion(),S=V(0,0,0),relP=V(0,0,0),relQ=new THREE.Quaternion(),qClipF=new THREE.Quaternion().setFromEuler(new THREE.Euler(FIN.rx,FIN.ry,0));
  const K=[],tmpO=new THREE.PerspectiveCamera(); // câmera auxiliar: o lookAt de câmera aponta o -z para o alvo
  const lookQ=(pos,at)=>{tmpO.position.copy(pos);tmpO.lookAt(at);return tmpO.quaternion.clone()};
  const corners=[V(-SW/2,-SH/2,0),V(SW/2,-SH/2,0),V(SW/2,SH/2,0),V(-SW/2,SH/2,0)];
  function resize(){
    const r=host.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);
    R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();
    const tan=Math.tan(THREE.MathUtils.degToRad(cam.fov/2));
    dist=Math.max(8.4,3.6/(2*tan*cam.aspect)*1.12);lift=-(2*dist*tan)*(W<700?.19:.2);
    CF.set(0,.5+lift,dist);QF.copy(lookQ(CF,V(0,lift,0)));
    const qi=QF.clone().invert();relP.copy(CF).negate().applyQuaternion(qi);relQ.copy(qi).multiply(qClipF);
    S.copy(V(0,0,-1).applyQuaternion(QF).multiplyScalar(.9).add(CF)); // centro da tela, 0,9 à frente do quadro final
    laptop.position.set(0,0,0);laptop.rotation.set(0,0,0);spin.rotation.set(0,0,0);spin.position.set(0,0,0);hinge.rotation.x=OPEN;
    laptop.updateMatrixWorld(true);const sc0=screen.getWorldPosition(V(0,0,0));laptop.position.copy(S).sub(sc0);
    dCover=Math.min(SH/(2*tan),SW/(2*tan*cam.aspect)); // distância em que a tela cobre o quadro inteiro
    const far=Math.max(1,1.25/Math.min(1.6,cam.aspect)); // telas em pé afastam a câmera para caber o notebook
    K.length=0;
    K.push({p:V(5.5,6.5,33*far).add(S),l:V(0,-2.4,0).add(S)},{p:V(2.2,5,28*far).add(S),l:V(0,-2,0).add(S)},
           {p:V(0,3,23*far).add(S),l:V(0,-1.2,0).add(S)},{p:V(0,1,Math.max(18.5,dCover*2.2)).add(S),l:V(0,-.3,0).add(S)});
    K.forEach(k=>k.q=lookQ(k.p,k.l));
    if(!playing)apply(T);
  }
  function covered(){
    let minX=-9,maxX=9,minY=-9,maxY=9;const p=V(0,0,0),nd=corners.map(c=>screen.localToWorld(p.copy(c)).project(cam).clone());
    if(nd.some(v=>v.z>1||v.z<-1))return false;
    minX=Math.max(nd[0].x,nd[3].x);maxX=Math.min(nd[1].x,nd[2].x);minY=Math.max(nd[0].y,nd[1].y);maxY=Math.min(nd[2].y,nd[3].y);
    return minX<-1&&maxX>1&&minY<-1&&maxY>1;
  }
  let T=0,playing=false,fast=false,tHide=null;
  const cp=V(0,0,0),cq=new THREE.Quaternion(),hp=V(0,0,0),hq=new THREE.Quaternion(),fp=V(0,0,0),fq=new THREE.Quaternion(),spinQ=new THREE.Quaternion();
  function camAt(t){
    const seg=(a,b,t0,t1)=>{const e=io3(cl((t-t0)/(t1-t0)));cam.position.lerpVectors(K[a].p,K[b].p,e);cam.quaternion.copy(K[a].q).slerp(K[b].q,e)};
    if(t<2.6)seg(0,1,0,2.6);else if(t<4.6)seg(1,2,2.6,4.6);else if(t<A4)seg(2,3,4.6,A4);
    else{const e=io3(cl((t-A4)/(A4_END-A4)));cam.position.lerpVectors(K[3].p,CF,e);cam.quaternion.copy(K[3].q).slerp(QF,e)}
    cam.updateMatrixWorld(true);
  }
  function apply(t){
    camAt(t);
    // 1. Chegada: sobe de fora do quadro girando
    const rise=eo(cl((t-.2)/2.4)),turn=io3(cl((t-.2)/3.2));
    spin.position.y=lerp(-15,0,rise);spin.rotation.set(lerp(.5,0,rise),lerp(-2.7,0,turn),0);
    // 2. Abertura: a tampa abre e a tela acende
    hinge.rotation.x=lerp(Math.PI/2,OPEN,io3(cl((t-2.2)/2.2)));
    const on=eo(cl((t-3.5)/1.2));
    // 4. Mergulho: a tela clareia conforme a câmera chega perto
    const cs=cam.position.distanceTo(S),iv=t<A4?0:io3(cl((dCover*2.2-cs)/(dCover*1.15)));
    laptop.updateMatrixWorld(true);
    if(tHide===null&&t>=A4&&(t>=HIDE_LATEST||(iv>.98&&covered())))tHide=t;
    const hidden=tHide!==null&&t>=tHide;
    laptop.visible=!hidden;if(!hidden)paintScreen(t,on,iv);
    // 3. O clipe: entra voando de fora do quadro e se dobra no caminho
    group.visible=t>=4;
    const p=io3(cl((t-4.2)/2.4));if(p!==lastP&&!(lastP===1&&p===1))build(p);
    const f=io3(cl((t-4)/2.8)),a=V(11,5.5,13).add(S),c=V(4,4.5,6).add(S),b=V(0,.1,3.2).add(S);
    hp.set(0,0,0).addScaledVector(a,(1-f)*(1-f)).addScaledVector(c,2*f*(1-f)).addScaledVector(b,f*f);
    spinQ.setFromEuler(new THREE.Euler(-.55,1.05+2.4*(1-f),.18*(1-f)));
    const hoverQ=K[3].q.clone().multiply(relQ);hq.copy(spinQ).slerp(hoverQ,f);
    // ...e no mergulho passa a acompanhar a câmera, terminando no quadro final. Enquanto o notebook existe,
    // o clipe é desenhado por cima dele: ao cruzar o plano da tela, parece entrar nela (um portal).
    fp.copy(relP).applyQuaternion(cam.quaternion).add(cam.position);fq.copy(cam.quaternion).multiply(relQ);
    mat.depthTest=hidden;
    const m=t<A4?0:io3(cl((t-A4)/1.6));group.position.lerpVectors(hp,fp,m);group.quaternion.copy(hq).slerp(fq,m);
    // Luz e material
    R.toneMappingExposure=lerp(0,1.15,eo(cl((t-.2)/1.3)));
    sweep.position.set(lerp(-8,8,cl((t-.4)/2.8)),2.5,7).add(S);sweep.intensity=260*cl((t-.3)/.6)*(1-io3(cl((t-3)/1.4)));
    glow.position.copy(S).add(V(0,-1.6,1.4));glow.intensity=hidden?0:20*on*(1-iv*.6);
    key.intensity=lerp(.5,1.6,io3(cl((t-A4)/2)))*cl((t-.2)/1);
    mat.envMapIntensity=lerp(.25,1.15,io3(cl((t-5.2)/2.6)));
    shMat.opacity=hidden?.5*eo(cl((t-tHide-.2)/1.2)):0;
    hero.classList.toggle('night',!hidden);
    const shown=hidden&&t>=tHide+.35;hero.classList.toggle('lit',shown);document.body.classList.toggle('film',!shown&&vis.hero);
  }
  let rotV=0,rotOff=0,drag=null,tilt=0;
  function idle(t){
    if(!drag){rotV*=.93;rotOff+=rotV;rotOff+=(0-rotOff)*.018}
    group.position.set(0,Math.sin(t*.9)*.025,0);group.rotation.set(FIN.rx+tilt*.08,FIN.ry+rotOff+Math.sin(t*.5)*.05,0);
  }
  host.addEventListener('pointerdown',e=>{if(playing)return;drag={last:e.clientX};hint.classList.remove('show')});
  host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();tilt=(e.clientY-r.top)/r.height-.5;if(drag){const dx=e.clientX-drag.last;drag.last=e.clientX;rotV=dx*.009;rotOff+=dx*.009}});
  const up=()=>{drag=null};['pointerup','pointercancel','pointerleave'].forEach(n=>host.addEventListener(n,up));
  function settle(){T=DUR;if(tHide===null)tHide=0;apply(DUR)} // quadro final, sem passar pelo filme
  function play(){frozen=false;T=0;tHide=null;playing=true;fast=false;skip.hidden=false;replay.hidden=true;hint.classList.remove('show');rotOff=rotV=0;lastP=-1;
    hero.style.transition='none';apply(0);void hero.offsetWidth;hero.style.transition=''}
  function finish(){playing=false;fast=false;settle();skip.hidden=true;replay.hidden=false;document.body.classList.remove('film');
    setTimeout(()=>{if(!playing&&vis.hero)hint.classList.add('show')},700);setTimeout(()=>hint.classList.remove('show'),6000)}
  skip.onclick=()=>{fast=true};replay.onclick=play;
  let frozen=false;
  function frame(dt,now){
    if(frozen)return;
    if(playing){T+=dt*(fast?4:1);if(T>=DUR)finish();else apply(T)}else idle(now);
    R.render(scene,cam);
  }
  return{
    boot(){resize();if(scrollY<innerHeight*.3&&!reduce)play();else{settle();skip.hidden=true;replay.hidden=false}},
    resize,frame,
    leave(){if(playing)finish()},
    replay(){scrollTo({top:0,behavior:reduce?'auto':'smooth'});setTimeout(play,reduce?0:600)},
    seek(t){playing=false;frozen=true;if(t<(tHide??Infinity))tHide=null;T=t;apply(t);R.render(scene,cam)} // para depurar: film.seek(5.2) congela o filme nesse instante
  };
})();
$('#toFilm').onclick=()=>film.replay();
