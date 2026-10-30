/* ===== HERO: filme 3D, "A forja" =====
   Roteiro (docs/design/02-sistema-de-design.md, "A abertura"):
   1. Nascimento    0,5–3,0 s  um fio incandescente nasce de um ponto de luz no escuro, soltando fagulhas.
   2. Têmpera       1,5–4,8 s  o fio esfria do branco-amarelo ao laranja, ao vermelho, e vira aço prateado.
   3. Dobra         4,3–7,2 s  as três curvas do clipe se dobram uma de cada vez, com o fio girando no espaço.
   4. Assentamento  6,4–9,6 s  a câmera chega ao quadro final, a luz do estúdio sobe e a página clareia.
   A câmera e o clipe seguem curvas contínuas (Hermite) que passam pelos pontos-chave sem parar:
   nenhum movimento começa ou termina seco, só o primeiro e o último quadro têm velocidade zero. */
'use strict';
const film=(()=>{
  const hero=$('#inicio'),host=$('#stage3d'),skip=$('#fSkip'),replay=$('#fReplay'),hint=$('#dragHint');
  const DUR=9.6,EX0=.5,EX1=3,EXK=2.2,DAY=7.2,LIT=8.7,BENDS=[4.3,5.25,6.2];
  let gl=false;try{gl=typeof THREE!=='undefined'&&!!document.createElement('canvas').getContext('webgl')}catch(e){}
  if(!gl){
    host.innerHTML='<svg class="fallback-clip" aria-hidden="true"><use href="#clip"/></svg>';skip.hidden=true;
    return{boot(){hero.classList.remove('night');hero.classList.add('lit')},resize(){},leave(){},frame(){},replay(){},seek(){}};
  }

  /* --- O desenho do clipe: retas e três curvas, com o comprimento do arame preservado --- */
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
  // Cada trecho curvo vira uma "dobra" independente: o giro de cada segmento pertence a uma das três curvas.
  const N=ds.length,h0=hd[0],turn=[0],arcOf=[-1];
  for(let i=1,k=-1,inArc=false;i<N;i++){const t=hd[i]-hd[i-1],on=Math.abs(t)>1e-6;if(on&&!inArc)k++;inArc=on;turn.push(t);arcOf.push(on?k:-1)}
  // O trecho reto do meio (entre a 1ª e a 2ª curva) fica parado, como preso num dobrador: cada dobra move só a parte de fora.
  const arc0=turn.reduce((a,t,i)=>a+(arcOf[i]===0?t:0),0);
  // Quanto de cada curva já ficou para trás em cada ponto do fio (0 antes da curva, 1 depois dela).
  const passed=[0,1,2].map(k=>{const idx=arcOf.map((a,i)=>a===k?i:-1).filter(i=>i>=0),a=idx[0],b=idx[idx.length-1]+1;
    return Array.from({length:N+1},(_,i)=>cl((i-a)/(b-a)))});
  // O trecho que gira sobe um pouco enquanto dobra (passa por cima do arame, como num dobrador) e assenta no plano no fim.
  const LIFT=.16,liftOf=(k,i)=>k===0?1-passed[0][i]:passed[k][i];
  function shape(b){ // b: progresso de cada dobra (0 = fio reto, 1 = clipe)
    const zk=b.map(v=>LIFT*Math.sin(Math.PI*cl(v))),zAt=i=>zk[0]*liftOf(0,i)+zk[1]*liftOf(1,i)+zk[2]*liftOf(2,i);
    const out=[new THREE.Vector3(0,0,zAt(0))];let x=0,y=0,th=h0+arc0*(1-b[0]);
    for(let i=0;i<N;i++){if(arcOf[i]>=0)th+=turn[i]*b[arcOf[i]];x+=Math.cos(th)*ds[i];y+=Math.sin(th)*ds[i];out.push(new THREE.Vector3(x,y,zAt(i+1)))}
    let mx=0,my=0;out.forEach(v=>{mx+=v.x;my+=v.y});mx/=out.length;my/=out.length;out.forEach(v=>{v.x-=mx;v.y-=my});
    return out;
  }
  // Mola que parte do repouso: assenta em ~0,8 s com um leve excesso (~4%), como metal dobrado à mão.
  const ZE=.72,OM=8,OD=OM*Math.sqrt(1-ZE*ZE);
  const spring=s=>s<=0?0:1-Math.exp(-ZE*OM*s)*(Math.cos(OD*s)+ZE*OM/OD*Math.sin(OD*s));

  const R=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  R.setPixelRatio(Math.min(2,devicePixelRatio||1));R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.15;R.physicallyCorrectLights=true;R.setClearColor(0x000000,0);
  host.appendChild(R.domElement);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(30,1,.05,200);

  /* --- Estúdio: caixas de luz com bordas suaves, refletidas no aço --- */
  const pm=new THREE.PMREMGenerator(R),es=new THREE.Scene();es.background=new THREE.Color(0x060606);
  const soft=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),gr=g.createRadialGradient(128,128,8,128,128,128);
    gr.addColorStop(0,'#fff');gr.addColorStop(.55,'rgba(255,255,255,.85)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);return new THREE.CanvasTexture(c)})();
  const panel=(w,h,pos,rot,k,col)=>{const c=col||[1,1,1];const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c[0]*k,c[1]*k,c[2]*k),map:soft,transparent:true,side:THREE.DoubleSide}));m.position.set(pos[0],pos[1],pos[2]);m.rotation.set(rot[0],rot[1],rot[2]);es.add(m)};
  panel(14,4,[0,6,0],[Math.PI/2,0,0],5);
  panel(2.2,10,[-6,1,1],[0,Math.PI/2,0],3.2,[.86,.92,1]);
  panel(1.4,10,[6,1,-1],[0,-Math.PI/2,0],2.2,[.86,.92,1]);
  for(let i=0;i<9;i++)panel(.4,8,[-4+i,1,-8],[0,0,0],1.2+(i%3)*.5,[.8,.88,1]);
  panel(10,2,[0,-3,7],[0,Math.PI,0],1.4,[1,.97,.92]);
  scene.environment=pm.fromScene(es,.02).texture;

  /* --- Aço quente: cor de corpo negro pela temperatura de cada ponto do fio --- */
  const BB=`vec3 pcBB(float k){k=clamp(k,800.,6000.)/100.;
    float r=k<=66.?1.:clamp(1.292936*pow(k-60.,-.1332047),0.,1.);
    float g=k<=66.?clamp(.3900816*log(k)-.6318414,0.,1.):clamp(1.1298909*pow(k-60.,-.0755148),0.,1.);
    float b=k>=66.?1.:(k<=19.?0.:clamp(.5432068*log(k-10.)-1.1962541,0.,1.));
    return pow(vec3(r,g,b),vec3(2.2));}`;
  const heat={uT:{value:0},uE:{value:0},uEx:{value:new THREE.Vector3(EX0,EX1,EXK)}};
  const mats=[];
  function hotMetal(capU){ // capU: posição fixa no fio para as pontas (esferas); -1 usa a coordenada do tubo
    const m=new THREE.MeshPhysicalMaterial({color:0xdcdee1,metalness:1,roughness:.19,clearcoat:.35,clearcoatRoughness:.12,envMapIntensity:.3});
    m.onBeforeCompile=sh=>{
      Object.assign(sh.uniforms,heat);sh.uniforms.uCapU={value:capU};
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vPcU;').replace('#include <begin_vertex>','#include <begin_vertex>\nvPcU=uv.x;');
      sh.fragmentShader=sh.fragmentShader
        .replace('#include <common>',`#include <common>
uniform float uT,uE,uCapU;uniform vec3 uEx;varying float vPcU;${BB}
float pcTemp(float u){float x=1.-pow(1.-clamp(u,0.,1.),1./uEx.z);float age=max(uT-(uEx.x+x*(uEx.y-uEx.x)),0.);
  return 300.+1550.*exp(-age/1.6);}`)
        .replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
float pcU=1.-(uCapU<0.?vPcU:uCapU);if(pcU>uE+.0015)discard;
float pcT=pcTemp(pcU),pcHot=smoothstep(620.,1100.,pcT),pcWarm=smoothstep(360.,640.,pcT);`)
        .replace('#include <color_fragment>',`#include <color_fragment>
diffuseColor.rgb*=mix(vec3(1.),vec3(.96,.76,.52),pcWarm*(1.-pcHot)*.75);diffuseColor.rgb*=mix(1.,.16,pcHot);`)
        .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.62,pcHot);')
        .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=pcBB(pcT)*pow(clamp((pcT-700.)/900.,0.,1.),2.2)*16.;');
    };
    m.customProgramCacheKey=()=>'pc-hot-metal';mats.push(m);return m;
  }
  const group=new THREE.Group();scene.add(group);
  const RAD=.036,mesh=new THREE.Mesh(new THREE.BufferGeometry(),hotMetal(-1));group.add(mesh);
  const capG=new THREE.SphereGeometry(RAD,20,12),capA=new THREE.Mesh(capG,hotMetal(0)),capB=new THREE.Mesh(capG,hotMetal(1));group.add(capA,capB);
  let pts=null,lastKey='';
  function build(b){
    const key=b.map(v=>v.toFixed(4)).join();if(key===lastKey)return;lastKey=key;
    pts=shape(b);const sub=pts.filter((v,i)=>i%2===0||i===pts.length-1);
    const curve=new THREE.CatmullRomCurve3(sub,false,'centripetal');
    mesh.geometry.dispose();mesh.geometry=new THREE.TubeGeometry(curve,640,RAD,20,false);
    capA.position.copy(pts[0]);capB.position.copy(pts[pts.length-1]);
  }
  // O ponto de luz de onde o fio nasce
  const D=V3(-L/2,0,0);
  const bead=new THREE.Mesh(new THREE.SphereGeometry(RAD*1.35,24,16),new THREE.MeshBasicMaterial({color:new THREE.Color(9,5.2,2.2)}));bead.position.copy(D);scene.add(bead);

  /* --- Fagulhas: cada uma tem nascimento, velocidade e vida próprios; a posição é calculada na GPU --- */
  const NE=280,eg=new THREE.BufferGeometry(),aS=new Float32Array(NE),aL=new Float32Array(NE),aZ=new Float32Array(NE),aV=new Float32Array(NE*3);
  {let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
    for(let i=0;i<NE;i++){aS[i]=EX0+.05+(EX1-EX0-.15)*Math.pow(rnd(),1.7);aL[i]=.45+rnd()*1.1;aZ[i]=.035+rnd()*.06;
      const sp=1.6+rnd()*4.2,el=.15+rnd()*1.05,az=(rnd()-.5)*1.4;aV[i*3]=Math.cos(el)*Math.cos(az)*sp;aV[i*3+1]=Math.sin(el)*sp;aV[i*3+2]=Math.cos(el)*Math.sin(az)*sp}}
  eg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(NE*3),3));
  eg.setAttribute('aS',new THREE.BufferAttribute(aS,1));eg.setAttribute('aL',new THREE.BufferAttribute(aL,1));eg.setAttribute('aZ',new THREE.BufferAttribute(aZ,1));eg.setAttribute('aV',new THREE.BufferAttribute(aV,3));
  const emberU={uT:heat.uT,uD:{value:D},uPx:{value:500}};
  const embers=new THREE.Points(eg,new THREE.ShaderMaterial({uniforms:emberU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,
    vertexShader:`uniform float uT,uPx;uniform vec3 uD;attribute float aS,aL,aZ;attribute vec3 aV;varying float vA,vK;
      void main(){float a=uT-aS;vA=a/aL;vK=1750.*exp(-max(a,0.)*1.7);
        vec3 p=uD+aV*(1.-exp(-1.8*a))/1.8+vec3(0.,-3.2,0.)*a*a*.5;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
        gl_PointSize=(a<0.||a>aL)?0.:aZ*uPx/-mv.z;}`,
    fragmentShader:`varying float vA,vK;${BB}
      void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float f=smoothstep(.5,0.,d);float fade=(1.-vA)*smoothstep(0.,.06,vA);
        vec3 c=pcBB(vK)*pow(clamp((vK-650.)/900.,0.,1.),1.4)*10.;gl_FragColor=vec4(c*f*fade,f*fade);}`}));
  embers.frustumCulled=false;scene.add(embers);

  /* --- Luzes --- */
  const sweep=new THREE.PointLight(0xe6eeff,0,0,2);scene.add(sweep); // brilho que corre pelo aço durante a dobra
  const key=new THREE.DirectionalLight(0xffffff,0);key.position.set(2,4,5);scene.add(key);
  const shc=document.createElement('canvas');shc.width=shc.height=128;{const g=shc.getContext('2d'),gr=g.createRadialGradient(64,64,1,64,64,64);gr.addColorStop(0,'rgba(28,29,28,.6)');gr.addColorStop(.45,'rgba(28,29,28,.2)');gr.addColorStop(1,'rgba(28,29,28,0)');g.fillStyle=gr;g.fillRect(0,0,128,128)}
  const shMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shc),transparent:true,opacity:0,depthWrite:false});
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.15),shMat);sh.rotation.x=-Math.PI/2;sh.position.y=-.68;scene.add(sh);

  /* --- Brilho (bloom): a cena é desenhada em alta faixa dinâmica e só o que passa do branco se espalha --- */
  const post=R.capabilities.isWebGL2;
  const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  const fsCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1),fsScene=new THREE.Scene(),quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));quad.frustumCulled=false;fsScene.add(quad);
  const passM=(fs,u)=>new THREE.ShaderMaterial({uniforms:u,vertexShader:VS,fragmentShader:fs,depthTest:false,depthWrite:false,toneMapped:false});
  const brightM=passM(`uniform sampler2D t;uniform float th;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(th*.8,th*1.6,l),1.);}`,{t:{value:null},th:{value:1}});
  const blurM=passM(`uniform sampler2D t;uniform vec2 d;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb*.227027;
    c+=(texture2D(t,vUv+d*1.384615).rgb+texture2D(t,vUv-d*1.384615).rgb)*.316216;c+=(texture2D(t,vUv+d*3.230769).rgb+texture2D(t,vUv-d*3.230769).rgb)*.07027;gl_FragColor=vec4(c,1.);}`,{t:{value:null},d:{value:new THREE.Vector2()}});
  const NM=5,compU={s:{value:null},k:{value:1}};for(let i=0;i<NM;i++)compU['b'+i]={value:null};
  const compM=new THREE.ShaderMaterial({uniforms:compU,vertexShader:VS,depthTest:false,depthWrite:false,
    fragmentShader:`uniform sampler2D s,b0,b1,b2,b3,b4;uniform float k;varying vec2 vUv;
      void main(){vec4 c=texture2D(s,vUv);vec3 b=(texture2D(b0,vUv).rgb*.8+texture2D(b1,vUv).rgb*.9+texture2D(b2,vUv).rgb+texture2D(b3,vUv).rgb*.9+texture2D(b4,vUv).rgb*.8)*k;
        gl_FragColor=vec4(c.rgb+b,clamp(c.a+max(b.r,max(b.g,b.b)),0.,1.));
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`});
  let rtS=null,rtB=null;const mips=[];
  if(post){const o={type:THREE.HalfFloatType,depthBuffer:false};rtS=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:4});rtB=new THREE.WebGLRenderTarget(1,1,o);
    for(let i=0;i<NM;i++)mips.push([new THREE.WebGLRenderTarget(1,1,o),new THREE.WebGLRenderTarget(1,1,o)]);
    mips.forEach((m,i)=>{compU['b'+i].value=m[1].texture});compU.s.value=rtS.texture}
  function pass(m,target){quad.material=m;R.setRenderTarget(target);R.render(fsScene,fsCam)}
  function render(){
    if(!post){R.setRenderTarget(null);R.render(scene,cam);return}
    R.setRenderTarget(rtS);R.render(scene,cam);
    brightM.uniforms.t.value=rtS.texture;pass(brightM,rtB);
    let src=rtB;mips.forEach(m=>{const w=m[0].width,h=m[0].height;
      blurM.uniforms.t.value=src.texture;blurM.uniforms.d.value.set(1/w,0);pass(blurM,m[0]);
      blurM.uniforms.t.value=m[0].texture;blurM.uniforms.d.value.set(0,1/h);pass(blurM,m[1]);src=m[1]});
    pass(compM,null);
  }

  /* --- Trajetórias: curvas de Hermite com tempos não uniformes (C1), velocidade zero só nas pontas --- */
  function track(keys){
    const n=keys.length,dim=keys[0][1].length;
    const m=keys.map((k,i)=>i===0||i===n-1?Array(dim).fill(0):keys[i+1][1].map((v,j)=>(v-keys[i-1][1][j])/(keys[i+1][0]-keys[i-1][0])));
    return t=>{
      if(t<=keys[0][0])return keys[0][1].slice();if(t>=keys[n-1][0])return keys[n-1][1].slice();
      let i=0;while(t>keys[i+1][0])i++;
      const [t0,a]=keys[i],[t1,b]=keys[i+1],h=t1-t0,s=(t-t0)/h,s2=s*s,s3=s2*s;
      const h00=2*s3-3*s2+1,h10=s3-2*s2+s,h01=-2*s3+3*s2,h11=s3-s2;
      return a.map((v,j)=>h00*v+h10*h*m[i][j]+h01*b[j]+h11*h*m[i+1][j]);
    };
  }
  function V3(x,y,z){return new THREE.Vector3(x,y,z)}
  const FIN={rx:.08,ry:-.32};
  const posT=track([[EX1,[0,0,0]],[4.6,[0,.28,.2]],[6.3,[.08,.14,0]],[8.6,[0,0,0]]]);
  const rotT=track([[EX1,[0,0,0]],[4.5,[-.34,.56,.1]],[5.7,[.24,-.52,-.08]],[7.1,[-.12,.4,.04]],[8.6,[FIN.rx,FIN.ry,0]]]);
  const keyT=track([[2.4,[0]],[4.6,[.5]],[6.4,[.9]],[8.4,[1.6]]]),envT=track([[1.6,[.45]],[4.2,[.95]],[6.4,[1]],[8.2,[1.15]]]);
  const bloomT=track([[0,[1]],[3.6,[1]],[5.2,[.45]],[8,[.16]]]);
  let W=1,H=1,dist=8.4,lift=0,camP=null,camL=null;
  function resize(){
    const r=host.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);
    R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();
    const tan=Math.tan(THREE.MathUtils.degToRad(cam.fov/2)),pr=R.getPixelRatio(),pw=Math.round(W*pr),ph=Math.round(H*pr);
    if(post){rtS.setSize(pw,ph);rtB.setSize(pw>>1,ph>>1);mips.forEach((m,i)=>{const w=Math.max(1,pw>>(i+1)),h=Math.max(1,ph>>(i+1));m[0].setSize(w,h);m[1].setSize(w,h)})}
    emberU.uPx.value=ph/(2*tan);
    dist=Math.max(8.4,3.6/(2*tan*cam.aspect)*1.12);lift=-(2*dist*tan)*(W<700?.19:.2);
    const f=Math.min(2.2,Math.max(1,1.55/cam.aspect)); // telas em pé afastam a câmera
    const k=(t,l,o)=>[t,[l[0]+o[0]*f,l[1]+o[1]*f,l[2]+o[2]*f]];
    const looks=[[0,[-L/2+.3,0,0]],[1.7,[-2.4,.1,0]],[3.2,[0,0,0]],[4.8,[0,.15,0]],[6.4,[0,.05,0]],[8.6,[0,lift,0]]];
    camL=track(looks);
    camP=track([k(0,looks[0][1],[-2.4,.5,6.5]),k(1.7,looks[1][1],[-1.2,1.3,9.5]),k(3.2,looks[2][1],[1.2,1.9,12.5]),
      k(4.8,looks[3][1],[3.8,1.6,13.5]),k(6.4,looks[4][1],[-3,2.1,12]),[8.6,[0,.5+lift,dist]]]);
    if(!playing)apply(T);
  }
  let T=0,playing=false,fast=false;
  const bv=[0,0,0];
  function apply(t){
    const p=camP(t),l=camL(t);cam.position.set(p[0],p[1],p[2]);cam.lookAt(l[0],l[1],l[2]);
    // 1. Nascimento: o fio sai do ponto de luz, rápido no começo e freando até parar
    const x=cl((t-EX0)/(EX1-EX0)),e=t>=DUR?1:1-Math.pow(1-x,EXK);
    heat.uT.value=t;heat.uE.value=e;group.visible=e>0;
    // 3. Dobra: uma curva de cada vez
    for(let i=0;i<3;i++)bv[i]=t>=DUR?1:spring(t-BENDS[i]);
    build(bv);
    if(t<EX1){group.position.set(D.x+L/2-(1-e)*L,0,0);group.rotation.set(0,0,0)}
    else{const q=posT(t),r=rotT(t);group.position.set(q[0],q[1],q[2]);group.rotation.set(r[0],r[1],r[2])}
    bead.visible=e>0&&e<1;bead.scale.setScalar(1-smoothstep(.82,1,e)*.9);
    // 2 e 4. Luz: o fio é a única luz no começo; o estúdio acende enquanto ele esfria
    const kv=keyT(t)[0],ev=envT(t)[0];key.intensity=kv;mats.forEach(m=>m.envMapIntensity=ev);
    sweep.position.set(lerp(-5,5,cl((t-2.6)/5)),.9,1.4);sweep.intensity=22*smoothstep(2.6,3.6,t)*(1-smoothstep(6.8,7.8,t));
    compU.k.value=bloomT(t)[0];
    shMat.opacity=.5*smoothstep(DAY+.2,DAY+1.6,t);
    hero.classList.toggle('night',t<DAY);
    const shown=t>=LIT;hero.classList.toggle('lit',shown);document.body.classList.toggle('film',!shown&&vis.hero);
  }
  function smoothstep(a,b,v){const s=cl((v-a)/(b-a));return s*s*(3-2*s)}
  let rotV=0,rotOff=0,drag=null,tilt=0;
  function idle(t){
    if(!drag){rotV*=.93;rotOff+=rotV;rotOff+=(0-rotOff)*.018}
    group.position.set(0,Math.sin(t*.9)*.025,0);group.rotation.set(FIN.rx+tilt*.08,FIN.ry+rotOff+Math.sin(t*.5)*.05,0);
  }
  host.addEventListener('pointerdown',e=>{if(playing)return;drag={last:e.clientX};hint.classList.remove('show')});
  host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();tilt=(e.clientY-r.top)/r.height-.5;if(drag){const dx=e.clientX-drag.last;drag.last=e.clientX;rotV=dx*.009;rotOff+=dx*.009}});
  const up=()=>{drag=null};['pointerup','pointercancel','pointerleave'].forEach(n=>host.addEventListener(n,up));
  function play(){frozen=false;T=0;playing=true;fast=false;skip.hidden=false;replay.hidden=true;hint.classList.remove('show');rotOff=rotV=0;
    hero.style.transition='none';apply(0);void hero.offsetWidth;hero.style.transition=''}
  function finish(){playing=false;fast=false;T=DUR;apply(DUR);skip.hidden=true;replay.hidden=false;document.body.classList.remove('film');
    setTimeout(()=>{if(!playing&&vis.hero)hint.classList.add('show')},700);setTimeout(()=>hint.classList.remove('show'),6000)}
  skip.onclick=()=>{fast=true};replay.onclick=play;
  let frozen=false,slow=0;
  function frame(dt,now){
    if(frozen)return;
    // Aparelho sem fôlego (quadros acima de ~33 ms seguidos): reduz a resolução interna em vez de perder fluidez.
    if(dt>0){slow=dt>.033?slow+1:Math.max(0,slow-2);if(slow>45&&R.getPixelRatio()>1){R.setPixelRatio(1);slow=0;resize()}}
    if(playing){T+=dt*(fast?4:1);if(T>=DUR)finish();else apply(T)}else idle(now);
    render();
  }
  return{
    boot(){resize();if(scrollY<innerHeight*.3&&!reduce)play();else{T=DUR;hero.style.transition='none';apply(DUR);void hero.offsetWidth;hero.style.transition='';skip.hidden=true;replay.hidden=false}},
    resize,frame,
    leave(){if(playing)finish()},
    replay(){scrollTo({top:0,behavior:reduce?'auto':'smooth'});setTimeout(play,reduce?0:600)},
    seek(t){playing=false;frozen=true;T=t;apply(t);render()} // para depurar: film.seek(5.2) congela o filme nesse instante
  };
})();
$('#toFilm').onclick=()=>film.replay();
