/* ===== HERO: filme 3D ===== */
'use strict';
const film=(()=>{
  const hero=$('#inicio'),host=$('#stage3d'),skip=$('#fSkip'),replay=$('#fReplay'),hint=$('#dragHint');
  const curtain=Streaks($('#curtain'));curtain.set(SCFG.hero);
  const DUR=7.6,REVEAL=6.1,NIGHT_END=5.0;
  let gl=false;try{gl=typeof THREE!=='undefined'&&!!document.createElement('canvas').getContext('webgl')}catch(e){}
  if(!gl){
    host.innerHTML='<svg class="fallback-clip" aria-hidden="true"><use href="#clip"/></svg>';skip.hidden=true;curtain.st.alpha=0;
    return{boot(){hero.classList.add('lit')},resize(){},leave(){},frame(){},replay(){}};
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
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(30,1,.01,200);
  const pm=new THREE.PMREMGenerator(R),es=new THREE.Scene();es.background=new THREE.Color(0x070707);
  const panel=(w,h,pos,rot,k,col)=>{const c=col||[1,1,1];const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c[0]*k,c[1]*k,c[2]*k),side:THREE.DoubleSide}));m.position.set(pos[0],pos[1],pos[2]);m.rotation.set(rot[0],rot[1],rot[2]);es.add(m)};
  panel(12,2.4,[0,6,0],[Math.PI/2,0,0],4.2);
  panel(1.2,9,[-6,1,1],[0,Math.PI/2,0],2.8,[.85,.92,1]);
  panel(.8,9,[6,1,-1],[0,-Math.PI/2,0],1.9,[.85,.92,1]);
  for(let i=0;i<9;i++)panel(.18,7,[-4+i,1,-8],[0,0,0],1.1+(i%3)*.5,[.8,.88,1]); // fios de luz ao fundo, refletidos no metal
  panel(8,1.2,[0,-3,7],[0,Math.PI,0],1.3);
  scene.environment=pm.fromScene(es,.02).texture;
  const mat=new THREE.MeshPhysicalMaterial({color:0xdcdee1,metalness:1,roughness:.19,envMapIntensity:.1,clearcoat:.35,clearcoatRoughness:.12});
  const group=new THREE.Group();scene.add(group);
  const RAD=.036,mesh=new THREE.Mesh(new THREE.BufferGeometry(),mat);group.add(mesh);
  const capG=new THREE.SphereGeometry(RAD,20,12),capA=new THREE.Mesh(capG,mat),capB=new THREE.Mesh(capG,mat);group.add(capA,capB);
  let pts=null,lastP=-1;
  function build(p){
    pts=shape(p);const sub=pts.filter((v,i)=>i%2===0||i===pts.length-1);
    const curve=new THREE.CatmullRomCurve3(sub,false,'centripetal');
    mesh.geometry.dispose();mesh.geometry=new THREE.TubeGeometry(curve,560,RAD,18,false);
    capA.position.copy(pts[0]);capB.position.copy(pts[pts.length-1]);lastP=p;
  }
  const sweep=new THREE.PointLight(0xe6eeff,0,0,2);scene.add(sweep);
  const key=new THREE.DirectionalLight(0xffffff,0);key.position.set(2,4,5);scene.add(key);
  const sc=document.createElement('canvas');sc.width=sc.height=128;{const g=sc.getContext('2d'),gr=g.createRadialGradient(64,64,1,64,64,64);gr.addColorStop(0,'rgba(28,29,28,.6)');gr.addColorStop(.45,'rgba(28,29,28,.2)');gr.addColorStop(1,'rgba(28,29,28,0)');g.fillStyle=gr;g.fillRect(0,0,128,128)}
  const shMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc),transparent:true,opacity:0,depthWrite:false});
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.15),shMat);sh.rotation.x=-Math.PI/2;sh.position.y=-.68;scene.add(sh);
  let W=1,H=1,dist=8.4,lift=0;const FIN={rx:.08,ry:-.32};
  function resize(){
    const r=host.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);
    R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();curtain.resize();
    const tan=Math.tan(THREE.MathUtils.degToRad(cam.fov/2));
    dist=Math.max(8.4,3.6/(2*tan*cam.aspect)*1.12);lift=-(2*dist*tan)*(W<700?.19:.2);
    if(!playing)apply(T);
  }
  let T=0,playing=false,fast=false;
  function apply(t){
    const p=io3(cl((t-1.3)/3.9)),pull=io3(cl((t-1.5)/4.3));
    if(p!==lastP&&!(lastP===1&&p===1))build(p);
    group.rotation.set(lerp(-.55,FIN.rx,pull),lerp(1.05,FIN.ry,pull),lerp(.18,0,pull));group.position.y=0;group.updateMatrixWorld(true);
    const mt=group.localToWorld(pts[Math.floor(pts.length*.3)].clone());
    const tg=mt.clone().lerp(new THREE.Vector3(0,0,0),pull);
    const off=new THREE.Vector3(lerp(.38,0,pull),lerp(.16,.5,pull),lerp(1.15,dist,pull));
    cam.position.copy(tg).add(off);cam.position.y+=lift*pull;
    const look=tg.clone();look.y+=lift*pull;cam.lookAt(look);
    R.toneMappingExposure=lerp(0,1.15,eo(cl((t-.5)/1.3)));
    mat.envMapIntensity=lerp(.14,1.15,io3(cl((t-4.4)/1.8)));
    sweep.position.set(mt.x+lerp(-1.1,1.1,cl((t-.6)/3.6)),mt.y+.32,mt.z+.55);
    sweep.intensity=24*cl((t-.4)/.8)*(1-io3(cl((t-4.2)/1.6)));
    key.intensity=lerp(0,1.6,io3(cl((t-4.6)/1.6)));
    shMat.opacity=.5*eo(cl((t-5.3)/1.4));
    curtain.st.pour=eo(cl((t-.05)/1.7));
    curtain.st.alpha=cl((t-.05)/.5)*(1-io3(cl((t-4.3)/1.6)));
    hero.classList.toggle('night',t<NIGHT_END);
    const shown=t>=REVEAL;hero.classList.toggle('lit',shown);document.body.classList.toggle('film',!shown&&vis.hero);
  }
  let rotV=0,rotOff=0,drag=null,tilt=0;
  function idle(t){
    if(!drag){rotV*=.93;rotOff+=rotV;rotOff+=(0-rotOff)*.018}
    group.rotation.y=FIN.ry+rotOff+Math.sin(t*.5)*.05;group.rotation.x=FIN.rx+tilt*.08;group.position.y=Math.sin(t*.9)*.025;
  }
  host.addEventListener('pointerdown',e=>{if(playing)return;drag={last:e.clientX};hint.classList.remove('show')});
  host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();tilt=(e.clientY-r.top)/r.height-.5;if(drag){const dx=e.clientX-drag.last;drag.last=e.clientX;rotV=dx*.009;rotOff+=dx*.009}});
  const up=()=>{drag=null};['pointerup','pointercancel','pointerleave'].forEach(n=>host.addEventListener(n,up));
  function play(){T=0;playing=true;fast=false;skip.hidden=false;replay.hidden=true;hint.classList.remove('show');rotOff=rotV=0;lastP=-1;
    hero.style.transition='none';apply(0);void hero.offsetWidth;hero.style.transition=''}
  function finish(){playing=false;fast=false;T=DUR;apply(DUR);skip.hidden=true;replay.hidden=false;document.body.classList.remove('film');
    setTimeout(()=>{if(!playing&&vis.hero)hint.classList.add('show')},700);setTimeout(()=>hint.classList.remove('show'),6000)}
  skip.onclick=()=>{fast=true};replay.onclick=play;
  function frame(dt,now){
    if(playing){T+=dt*(fast?4:1);if(T>=DUR)finish();else apply(T)}else idle(now);
    if(curtain.st.alpha>.002)curtain.frame(now);else if(!playing)curtain.frame(now);
    R.render(scene,cam);
  }
  return{
    boot(){resize();if(scrollY<innerHeight*.3&&!reduce)play();else{T=DUR;apply(DUR);skip.hidden=true;replay.hidden=false}},
    resize,frame,
    leave(){if(playing)finish()},
    replay(){scrollTo({top:0,behavior:reduce?'auto':'smooth'});setTimeout(play,reduce?0:600)}
  };
})();
$('#toFilm').onclick=()=>film.replay();
