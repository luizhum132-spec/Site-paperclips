/* ===== HERO: filme 3D, "A forja" =====
   Roteiro (docs/design/02-sistema-de-design.md, "A abertura"):
   1. Fundição      0,4–4,4 s   o cadinho derrama metal líquido num canal reto da forma; o líquido corre e endurece incandescente.
   2. Alicate       5,1–8,5 s   um alicate grande pega a barra ainda em brasa e a leva até o tanque.
   3. Têmpera       8,5–10,5 s  a barra mergulha na água fria, que ferve com o calor; sobe vapor.
   4. A gota       10,5–13,0 s  a barra sai rápido, espirra água na câmera; uma gota embaça a lente e escorre.
   5. Dobra        12,9–17,3 s  ao fundo, o aço já prateado se dobra devagar, uma curva de cada vez.
   6. O papel      16,6–20,4 s  o clipe pousa sobre papéis; a câmera entra no papel, que vira a própria página.
   Todos os movimentos seguem curvas contínuas (Hermite): nada para ou arranca seco no meio do filme. */
'use strict';
const film=(()=>{
  const hero=$('#inicio'),host=$('#stage3d'),skip=$('#fSkip'),replay=$('#fReplay'),hint=$('#dragHint');
  const DUR=20.4,FILL0=1.2,FILL1=4,GRIP=6.75,QUENCH=8.55,PULL=10.45,DROP=10.95,SWITCH=11.45,HAND=18.9,LIT=19.7;
  const BENDS=[12.9,14.2,15.5],BEND_D=1.8;
  let gl=false;try{gl=typeof THREE!=='undefined'&&!!document.createElement('canvas').getContext('webgl')}catch(e){}
  if(!gl){
    host.innerHTML='<svg class="fallback-clip" aria-hidden="true"><use href="#clip"/></svg>';skip.hidden=true;
    return{boot(){hero.classList.remove('night');hero.classList.add('lit')},resize(){},leave(){},frame(){},replay(){},seek(){}};
  }
  const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
  const ss=(a,b,v)=>{const s=cl((v-a)/(b-a));return s*s*(3-2*s)};
  const sst=s=>{s=cl(s);return s*s*s*(s*(s*6-15)+10)}; // smootherstep: velocidade e aceleração zero nas pontas

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
  // Cada trecho curvo é uma dobra independente. O trecho reto do meio fica parado, como preso num dobrador.
  const N=ds.length,h0=hd[0],turn=[0],arcOf=[-1];
  for(let i=1,k=-1,inArc=false;i<N;i++){const t=hd[i]-hd[i-1],on=Math.abs(t)>1e-6;if(on&&!inArc)k++;inArc=on;turn.push(t);arcOf.push(on?k:-1)}
  const arc0=turn.reduce((a,t,i)=>a+(arcOf[i]===0?t:0),0);
  const passed=[0,1,2].map(k=>{const idx=arcOf.map((a,i)=>a===k?i:-1).filter(i=>i>=0),a=idx[0],b=idx[idx.length-1]+1;
    return Array.from({length:N+1},(_,i)=>cl((i-a)/(b-a)))});
  // O trecho que gira sobe um pouco enquanto dobra (passa por cima do arame) e assenta no plano no fim.
  const LIFT=.16,liftOf=(k,i)=>k===0?1-passed[0][i]:passed[k][i];
  function shape(b){
    const zk=b.map(v=>LIFT*Math.sin(Math.PI*cl(v))),zAt=i=>zk[0]*liftOf(0,i)+zk[1]*liftOf(1,i)+zk[2]*liftOf(2,i);
    const out=[V3(0,0,zAt(0))];let x=0,y=0,th=h0+arc0*(1-b[0]);
    for(let i=0;i<N;i++){if(arcOf[i]>=0)th+=turn[i]*b[arcOf[i]];x+=Math.cos(th)*ds[i];y+=Math.sin(th)*ds[i];out.push(V3(x,y,zAt(i+1)))}
    let mx=0,my=0;out.forEach(v=>{mx+=v.x;my+=v.y});mx/=out.length;my/=out.length;out.forEach(v=>{v.x-=mx;v.y-=my});
    return out;
  }

  const R=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  R.setPixelRatio(Math.min(2,devicePixelRatio||1));R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.15;R.physicallyCorrectLights=true;R.setClearColor(0x000000,0);
  R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
  host.appendChild(R.domElement);
  const cam=new THREE.PerspectiveCamera(30,1,.3,300);
  const forge=new THREE.Scene(),studio=new THREE.Scene();

  /* --- Estúdio refletido no aço: caixas de luz com bordas suaves, geradas aqui mesmo --- */
  const canvasTex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
  const soft=canvasTex(256,256,(g)=>{const gr=g.createRadialGradient(128,128,8,128,128,128);gr.addColorStop(0,'#fff');gr.addColorStop(.55,'rgba(255,255,255,.85)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,256)});
  const pm=new THREE.PMREMGenerator(R),es=new THREE.Scene();es.background=new THREE.Color(0x060606);
  const panel=(w,h,pos,rot,k,col)=>{const c=col||[1,1,1];const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c[0]*k,c[1]*k,c[2]*k),map:soft,transparent:true,side:THREE.DoubleSide}));m.position.set(...pos);m.rotation.set(...rot);es.add(m)};
  panel(14,4,[0,6,0],[Math.PI/2,0,0],5);panel(2.2,10,[-6,1,1],[0,Math.PI/2,0],3.2,[.86,.92,1]);panel(1.4,10,[6,1,-1],[0,-Math.PI/2,0],2.2,[.86,.92,1]);
  for(let i=0;i<9;i++)panel(.4,8,[-4+i,1,-8],[0,0,0],1.2+(i%3)*.5,[.8,.88,1]);
  panel(10,2,[0,-3,7],[0,Math.PI,0],1.4,[1,.97,.92]);
  const env=pm.fromScene(es,.02).texture;forge.environment=env;studio.environment=env;

  /* --- GLSL compartilhado: cor de corpo negro e ruído --- */
  const BB=`vec3 pcBB(float k){k=clamp(k,800.,6000.)/100.;
    float r=k<=66.?1.:clamp(1.292936*pow(k-60.,-.1332047),0.,1.);
    float g=k<=66.?clamp(.3900816*log(k)-.6318414,0.,1.):clamp(1.1298909*pow(k-60.,-.0755148),0.,1.);
    float b=k>=66.?1.:(k<=19.?0.:clamp(.5432068*log(k-10.)-1.1962541,0.,1.));
    return pow(vec3(r,g,b),vec3(2.2));}
    float pcGlow(float k){return pow(clamp((k-700.)/900.,0.,1.),2.2)*16.;}`;
  const NOISE=`float pcH(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
    float pcVN(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
      return mix(mix(mix(pcH(i),pcH(i+vec3(1,0,0)),f.x),mix(pcH(i+vec3(0,1,0)),pcH(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(pcH(i+vec3(0,0,1)),pcH(i+vec3(1,0,1)),f.x),mix(pcH(i+vec3(0,1,1)),pcH(i+vec3(1,1,1)),f.x),f.y),f.z);}`;

  /* --- O aço: líquido na forma, incandescente no alicate, esfriado na água, prateado no fim --- */
  const heat={uT:{value:0},uE:{value:0},uFill:{value:new THREE.Vector2(FILL0,FILL1)},uQ:{value:QUENCH}};
  const TEMP=`float pcTemp(float u){float tf=uFill.x+u*(uFill.y-uFill.x);
      float f=1250.+850.*exp(-max(uT-tf,0.)/1.1),q=1250.+850.*exp(-max(uQ-tf,0.)/1.1);
      return uT>uQ?300.+(q-300.)*exp(-(uT-uQ)/.5):f;}`;
  const tempJS=(u,t)=>{const tf=FILL0+u*(FILL1-FILL0),f=1250+850*Math.exp(-Math.max(t-tf,0)/1.1),q=1250+850*Math.exp(-Math.max(QUENCH-tf,0)/1.1);return t>QUENCH?300+(q-300)*Math.exp(-(t-QUENCH)/.5):f};
  const glowJS=k=>Math.pow(cl((k-700)/900),2.2);
  const mats=[];
  function hotMetal(capU){
    const m=new THREE.MeshPhysicalMaterial({color:0xdcdee1,metalness:1,roughness:.19,clearcoat:.35,clearcoatRoughness:.12,envMapIntensity:.3});
    m.onBeforeCompile=sh=>{
      Object.assign(sh.uniforms,heat);sh.uniforms.uCapU={value:capU};
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vPcU;').replace('#include <begin_vertex>','#include <begin_vertex>\nvPcU=uv.x;');
      sh.fragmentShader=sh.fragmentShader
        .replace('#include <common>',`#include <common>
uniform float uT,uE,uCapU,uQ;uniform vec2 uFill;varying float vPcU;${BB}${TEMP}`)
        .replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
float pcU=uCapU<0.?vPcU:uCapU;if(pcU>uE+.0015)discard;
float pcT=pcTemp(pcU),pcHot=smoothstep(620.,1100.,pcT),pcWarm=smoothstep(360.,640.,pcT);
float pcLiq=smoothstep(1650.,1950.,pcT);`)
        .replace('#include <color_fragment>',`#include <color_fragment>
diffuseColor.rgb*=mix(vec3(1.),vec3(.96,.76,.52),pcWarm*(1.-pcHot)*.75);diffuseColor.rgb*=mix(1.,.16,pcHot);`)
        .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.62,pcHot*(1.-pcLiq));')
        .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
float pcShim=1.+pcLiq*.28*sin(pcU*130.-uT*9.)*sin(pcU*41.+uT*3.7);
totalEmissiveRadiance+=pcBB(pcT)*pcGlow(pcT)*pcShim;`);
    };
    m.customProgramCacheKey=()=>'pc-hot-metal';mats.push(m);return m;
  }
  const group=new THREE.Group();
  const RAD=.036,mesh=new THREE.Mesh(new THREE.BufferGeometry(),hotMetal(-1));mesh.castShadow=true;group.add(mesh);
  const capG=new THREE.SphereGeometry(RAD,20,12),capA=new THREE.Mesh(capG,hotMetal(0)),capB=new THREE.Mesh(capG,hotMetal(1));group.add(capA,capB);
  const front=new THREE.Mesh(new THREE.SphereGeometry(RAD*1.25,20,14),new THREE.MeshBasicMaterial({color:new THREE.Color(10,6.4,3)}));group.add(front); // a frente do líquido
  let pts=null,lastKey='';
  function build(b){
    const key=b.map(v=>v.toFixed(4)).join();if(key===lastKey)return;lastKey=key;
    pts=shape(b);const sub=pts.filter((v,i)=>i%2===0||i===pts.length-1);
    const curve=new THREE.CatmullRomCurve3(sub,false,'centripetal');
    mesh.geometry.dispose();mesh.geometry=new THREE.TubeGeometry(curve,640,RAD,20,false);
    capA.position.copy(pts[0]);capB.position.copy(pts[pts.length-1]);
  }

  /* ================= A OFICINA ================= */
  const MT=.55,TRZ=-3.2,WY=.3; // topo da forma, posição do tanque, nível da água (tanque afundado no chão)
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x15120f,roughness:.92,metalness:.05,envMapIntensity:.1}));forge.add(ground);
  // A forma: bloco de grafite com um canal meia-cana no topo
  {const s=new THREE.Shape(),w=.46,r=.062;s.moveTo(-w,0);s.lineTo(w,0);s.lineTo(w,MT);s.lineTo(r,MT);s.absarc(0,MT,r,0,-Math.PI,true);s.lineTo(-w,MT);s.lineTo(-w,0);
    const g=new THREE.ExtrudeGeometry(s,{depth:L+1.2,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:2,curveSegments:24});g.translate(0,0,-(L+1.2)/2);g.rotateY(Math.PI/2);
    forge.add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x2a2826,roughness:.58,metalness:.25,envMapIntensity:.25})))}
  // O cadinho: copo de cerâmica com borda, preso a uma haste; gira em torno do bico
  const lipW=V3(-L/2-.05,1.95,0),pivot=new THREE.Group();pivot.position.copy(lipW);forge.add(pivot);
  {const pr=[[0,.06],[.4,.04],[.46,.12],[.6,1],[.69,1.02],[.66,1.07],[.53,1.03],[.4,.2],[0,.18]].map(p=>new THREE.Vector2(p[0],p[1]));
    const cup=new THREE.Mesh(new THREE.LatheGeometry(pr,64),new THREE.MeshStandardMaterial({color:0x3a302a,roughness:.78,metalness:.05,envMapIntensity:.2,side:THREE.DoubleSide}));
    const body=new THREE.Group();body.position.set(-.69,-1.05,0);body.add(cup);pivot.add(body);
    const melt=new THREE.Mesh(new THREE.CircleGeometry(.52,48).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:new THREE.Color(9,4.6,1.6)}));melt.position.y=.88;body.add(melt);
    const steel=new THREE.MeshStandardMaterial({color:0x2c2b2a,roughness:.42,metalness:.9,envMapIntensity:.3});
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.6,.045,12,64).rotateX(Math.PI/2),steel);ring.position.y=.62;body.add(ring);
    const rod=new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(V3(-.62,.62,0),V3(-3.4,5.6,0)),8,.07,12),steel);body.add(rod)}
  // O fio de metal que cai do bico até o canal
  const pourU={uT:heat.uT,uA:{value:0},uB:{value:0}};
  const stream=new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(V3(0,0,0),V3(.16,-.26,0),V3(.2,-1.4,0)),48,.034,12),
    new THREE.ShaderMaterial({uniforms:pourU,toneMapped:false,vertexShader:'varying float vV;void main(){vV=uv.x;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`uniform float uT,uA,uB;varying float vV;${BB}void main(){if(vV<uA||vV>uB)discard;float f=.85+.25*sin(vV*60.-uT*24.)*sin(vV*23.-uT*11.);gl_FragColor=vec4(pcBB(1950.)*pcGlow(1950.)*f,1.);}`}));
  stream.position.copy(lipW);forge.add(stream);
  // O alicate: dois braços que se cruzam num pino
  const tongs=new THREE.Group(),armA=new THREE.Group(),armB=new THREE.Group();forge.add(tongs);
  {const steel=new THREE.MeshStandardMaterial({color:0x2a2a2a,roughness:.38,metalness:.92,envMapIntensity:.45});
    const arm=s=>{const c=new THREE.CatmullRomCurve3([V3(0,-.03,.08*s),V3(0,.12,.09*s),V3(0,.34,.14*s),V3(0,.72,0),V3(0,2.2,-.26*s),V3(0,4.6,-.36*s),V3(0,7,-.4*s)]);
      const g=new THREE.Group(),m=new THREE.Mesh(new THREE.TubeGeometry(c,96,.066,16),steel);m.position.y=-.72;g.add(m);
      const jaw=new THREE.Mesh(new THREE.BoxGeometry(.5,.16,.05),steel);jaw.position.set(0,-.72+.04,.06*s);g.add(jaw);return g};
    armA.add(arm(1));armB.add(arm(-1));armA.position.y=armB.position.y=.72;tongs.add(armA,armB);
    const pin=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.34,28).rotateZ(Math.PI/2),steel);pin.position.y=.72;tongs.add(pin)}
  // O tanque de água
  {const steel=new THREE.MeshStandardMaterial({color:0x33312e,roughness:.5,metalness:.8,envMapIntensity:.3}),Lt=L+1.8,Wt=2,Ht=.44,th=.08;
    const box=(w,h,d,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),steel);m.position.set(x,y,TRZ+z);forge.add(m)};
    box(Lt,Ht,th,0,Ht/2,Wt/2);box(Lt,Ht,th,0,Ht/2,-Wt/2);box(th,Ht,Wt,Lt/2,Ht/2,0);box(th,Ht,Wt,-Lt/2,Ht/2,0)}
  const waterU={uT:heat.uT,uBoil:{value:0},uRing:{value:new THREE.Vector2(QUENCH,0)},uGlowW:{value:0},uHalfL:{value:L/2}};
  const water=new THREE.Mesh(new THREE.PlaneGeometry(L+1.66,1.86,280,40).rotateX(-Math.PI/2),
    new THREE.MeshPhysicalMaterial({color:0x03070a,roughness:.14,metalness:0,clearcoat:.6,clearcoatRoughness:.1,envMapIntensity:.32}));
  water.material.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,waterU);
    const fn=`uniform float uT,uBoil,uHalfL;uniform vec2 uRing;${NOISE}
      float wH(vec2 p){float m=exp(-p.y*p.y/.16)*smoothstep(uHalfL+.3,uHalfL-.5,abs(p.x));
        float b=pcVN(vec3(p*7.,uT*2.6));b=pow(max(b*1.7-.8,0.),2.)*.1;
        float c=pcVN(vec3(p*14.+7.,uT*3.6));c=pow(max(c*1.7-.85,0.),2.)*.05;
        float r=uT-uRing.x,ring=r>0.?sin(abs(p.y)*14.-r*9.)*exp(-abs(p.y)*1.4-r*1.3)*.04*uRing.y*smoothstep(uHalfL+.6,uHalfL-.2,abs(p.x)):0.;
        return (b+c)*m*uBoil+ring;}`;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vPcP;'+fn)
      .replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
        float pcE=.02,pcH0=wH(position.xz);objectNormal=normalize(vec3(-(wH(position.xz+vec2(pcE,0.))-pcH0)/pcE,1.,-(wH(position.xz+vec2(0.,pcE))-pcH0)/pcE));`)
      .replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y+=pcH0;vPcP=position.xz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uGlowW,uHalfL;varying vec2 vPcP;')
      .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(1.,.42,.12)*uGlowW*exp(-vPcP.y*vPcP.y/.12)*smoothstep(uHalfL+.4,uHalfL-.4,abs(vPcP.x));');
  };
  water.position.set(0,WY,TRZ);forge.add(water);
  // Partículas: fagulhas do derrame, vapor da têmpera e respingos da saída da água
  function particles(n,seed,fill,mat){const g=new THREE.BufferGeometry(),A={};let s=seed;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));
    for(let i=0;i<n;i++){const o=fill(rnd,i);for(const k in o){A[k]=A[k]||new Float32Array(n*o[k].length);A[k].set(o[k],i*o[k].length)}}
    for(const k in A)g.setAttribute(k,new THREE.BufferAttribute(A[k],A[k].length/n));
    const p=new THREE.Points(g,mat);p.frustumCulled=false;return p}
  const pxU={value:500};
  const sparks=particles(220,7,(r)=>{const sp=1.4+r()*3.4,el=.5+r()*1,az=(r()-.5)*2.4;
      return{aS:[FILL0+r()*(FILL1-.4-FILL0)],aL:[.4+r()*.9],aZ:[.03+r()*.05],aV:[Math.cos(el)*Math.cos(az)*sp*.6,Math.sin(el)*sp,Math.cos(el)*Math.sin(az)*sp]}},
    new THREE.ShaderMaterial({uniforms:{uT:heat.uT,uPx:pxU,uD:{value:V3(-L/2+.15,MT,0)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      vertexShader:`uniform float uT,uPx;uniform vec3 uD;attribute float aS,aL,aZ;attribute vec3 aV;varying float vA,vK;
        void main(){float a=uT-aS;vA=a/aL;vK=1850.*exp(-max(a,0.)*1.7);vec3 p=uD+aV*(1.-exp(-1.8*a))/1.8+vec3(0.,-3.4,0.)*a*a*.5;
          vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(a<0.||a>aL)?0.:aZ*uPx/-mv.z;}`,
      fragmentShader:`varying float vA,vK;${BB}void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float f=smoothstep(.5,0.,d)*(1.-vA)*smoothstep(0.,.06,vA);
        gl_FragColor=vec4(pcBB(vK)*pcGlow(vK)*.7*f,f);}`}));
  forge.add(sparks);
  const puff=canvasTex(128,128,(g)=>{let s=3;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<26;i++){const x=34+r()*60,y=34+r()*60,rr=12+r()*26,gr=g.createRadialGradient(x,y,0,x,y,rr);
    gr.addColorStop(0,'rgba(255,255,255,.22)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128)}});
  const steamU={uT:heat.uT,uPx:pxU,uMap:{value:puff},uWarm:{value:0}};
  const steam=particles(110,11,(r)=>({aS:[QUENCH+.05+r()*2.2],aL:[1.6+r()*1.8],aZ:[.5+r()*.9],aR:[(r()-.5)*1.6],
      aP:[(r()-.5)*L,WY+.02,TRZ+(r()-.5)*.5],aV:[(r()-.5)*.25,.5+r()*.7,(r()-.5)*.3+.12]}),
    new THREE.ShaderMaterial({uniforms:steamU,transparent:true,depthWrite:false,
      vertexShader:`uniform float uT,uPx;attribute float aS,aL,aZ,aR;attribute vec3 aP,aV;varying float vA,vR;
        void main(){float a=uT-aS;vA=a/aL;vR=aR*a;vec3 p=aP+aV*a+vec3(0.,.18,0.)*a*a;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
          gl_PointSize=(a<0.||a>aL)?0.:mix(.25,1.,sqrt(clamp(vA,0.,1.)))*aZ*uPx/-mv.z;}`,
      fragmentShader:`uniform sampler2D uMap;uniform float uWarm;varying float vA,vR;void main(){vec2 c=gl_PointCoord-.5;float s=sin(vR),k=cos(vR);c=mat2(k,-s,s,k)*c+.5;
        float a=texture2D(uMap,c).a*smoothstep(.5,.28,length(gl_PointCoord-.5))*smoothstep(0.,.15,vA)*(1.-vA)*.42;vec3 col=mix(vec3(.5,.51,.53),vec3(1.6,.75,.35),uWarm*(1.-vA));gl_FragColor=vec4(col*a,a);}`}));
  forge.add(steam);
  const splash=particles(170,23,(r)=>{const sp=2.2+r()*4.6,toward=r()*r();
      return{aS:[PULL+.02+r()*.32],aL:[.6+r()*.7],aZ:[.02+r()*.045+toward*.05],aO:[(r()-.5)*L*.9,0,(r()-.5)*.3],aV:[(r()-.5)*1.4,1.4+r()*sp,1+toward*sp*1.2]}},
    new THREE.ShaderMaterial({uniforms:{uT:heat.uT,uPx:pxU,uD:{value:V3(0,WY,TRZ)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      vertexShader:`uniform float uT,uPx;uniform vec3 uD;attribute float aS,aL,aZ;attribute vec3 aO,aV;varying float vA;
        void main(){float a=uT-aS;vA=a/aL;vec3 p=uD+aO+aV*a+vec3(0.,-7.,0.)*a*a*.5;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
          gl_PointSize=(a<0.||a>aL)?0.:aZ*uPx/-mv.z;}`,
      fragmentShader:`varying float vA;void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;float f=smoothstep(.5,.25,d)*.5+exp(-dot(c+.15,c+.15)*60.)*1.6;
        f*=(1.-vA)*smoothstep(0.,.05,vA);gl_FragColor=vec4(vec3(.85,.92,1.)*f,f*.6);}`}));
  forge.add(splash);
  // Luzes da oficina: o metal quente é a luz principal
  forge.add(new THREE.HemisphereLight(0x2b2420,0x050403,.35));
  const poolL=new THREE.PointLight(0xff8a3c,0,0,2),barL=new THREE.PointLight(0xff9a50,0,0,2),cruL=new THREE.PointLight(0xffa860,0,0,2),subL=new THREE.PointLight(0xff7a30,0,0,2);
  forge.add(poolL,barL,cruL,subL);
  const rimF=new THREE.DirectionalLight(0xbfd2ff,0);rimF.position.set(-3,5,-6);forge.add(rimF);

  /* ================= O ESTÚDIO (mesa com papéis) ================= */
  // A mesa é o plano XY: a câmera final olha ao longo de -z, então o papel de cima fica de frente para ela.
  const C=V3(-13,10,3.2); // onde o fio fica durante a dobra, acima da mesa escura
  const table=new THREE.Mesh(new THREE.PlaneGeometry(140,140),new THREE.MeshStandardMaterial({color:0x121110,roughness:.88,envMapIntensity:.1}));table.position.z=-.26;table.receiveShadow=true;studio.add(table);
  // Cor do papel antes do tom (ACES do three.js): ao cobrir a tela, o papel sai com a cor exata da página.
  const IVORY=(()=>{const tgt=new THREE.Color(0xF4F1EA),toLin=c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4),T=[tgt.r,tgt.g,tgt.b].map(toLin);
    const I=[[.59719,.35458,.04823],[.076,.90834,.01566],[.0284,.13383,.83777]],O=[[1.60475,-.53108,-.07367],[-.10208,1.10813,-.00605],[-.00327,-.07276,1.07602]];
    const mul=(M,v)=>M.map(r=>r[0]*v[0]+r[1]*v[1]+r[2]*v[2]),fit=v=>(v*(v+.0245786)-.000090537)/(v*(.983729*v+.432951)+.238081);
    const aces=c=>mul(O,mul(I,c.map(v=>v*1.15/.6)).map(fit)).map(v=>cl(v));
    let p=T.slice();for(let i=0;i<200;i++){const a=aces(p);p=p.map((v,j)=>Math.max(0,v+(T[j]-a[j])*.9))}return new THREE.Color(p[0],p[1],p[2])})();
  const fiber=canvasTex(512,512,(g,w,h)=>{let s=5;const r=()=>(s=(s*16807)%2147483647)/2147483647;g.fillStyle='#f6f3ec';g.fillRect(0,0,w,h);const id=g.getImageData(0,0,w,h),d=id.data;
    for(let i=0;i<d.length;i+=4){const n=(r()-.5)*9;d[i]+=n;d[i+1]+=n;d[i+2]+=n}g.putImageData(id,0,0);
    g.globalAlpha=.05;g.strokeStyle='#9a8f80';for(let i=0;i<260;i++){g.beginPath();const x=r()*w,y=r()*h,a=r()*6.28;g.moveTo(x,y);g.lineTo(x+Math.cos(a)*14,y+Math.sin(a)*14);g.stroke()}});
  fiber.encoding=THREE.sRGBEncoding;fiber.wrapS=fiber.wrapT=THREE.RepeatWrapping;fiber.repeat.set(3,4);
  const flatU={uFlat:{value:0},uFlatC:{value:IVORY}};
  const papers=[];
  [[4.9,-8.6,-.205,.07],[3.7,-8.9,-.18,-.045],[4.6,-8.2,-.155,.03],[4.2,-8.5,-.11,0]].forEach(([x,y,z,r],i)=>{
    const m=new THREE.MeshStandardMaterial({color:0xffffff,map:fiber,roughness:.88,envMapIntensity:.25});
    if(i===3)m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,flatU);
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uFlat;uniform vec3 uFlatC;')
        .replace('#include <dithering_fragment>','#include <dithering_fragment>\ngl_FragColor.rgb=mix(gl_FragColor.rgb,uFlatC,uFlat);')};
    const p=new THREE.Mesh(new THREE.PlaneGeometry(20,25.9),m);p.position.set(x,y,z);p.rotation.z=r;p.receiveShadow=true;p.castShadow=i<3;studio.add(p);papers.push(p)});
  const hemi=new THREE.HemisphereLight(0xfff6ea,0x2a2622,0);hemi.position.set(0,1,1);studio.add(hemi);
  const key=new THREE.DirectionalLight(0xffffff,0);key.position.set(2,4,5);key.castShadow=true;
  key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-15,right:15,top:15,bottom:-15,near:.5,far:40});key.shadow.bias=-.0004;key.shadow.radius=4;studio.add(key,key.target);
  const sweep=new THREE.PointLight(0xe6eeff,0,0,2);studio.add(sweep);
  const pool=new THREE.SpotLight(0xfff4e6,0,0,.42,.95,2);pool.position.set(C.x+3,C.y+2,C.z+18);pool.target.position.set(C.x,C.y,0);studio.add(pool,pool.target); // foco de luz sobre a mesa // o brilho que percorre o aço recém-esfriado
  const shc=canvasTex(128,128,(g)=>{const gr=g.createRadialGradient(64,64,1,64,64,64);gr.addColorStop(0,'rgba(28,29,28,.6)');gr.addColorStop(.45,'rgba(28,29,28,.2)');gr.addColorStop(1,'rgba(28,29,28,0)');g.fillStyle=gr;g.fillRect(0,0,128,128)});
  const shMat=new THREE.MeshBasicMaterial({map:shc,transparent:true,opacity:0,depthWrite:false});
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.15),shMat);sh.rotation.x=-Math.PI/2;sh.position.y=-.68;studio.add(sh);

  /* --- Pós: brilho (bloom), lente molhada e a gota --- */
  const post=R.capabilities.isWebGL2;
  const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  const fsCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1),fsScene=new THREE.Scene(),quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));quad.frustumCulled=false;fsScene.add(quad);
  const passM=(fs,u)=>new THREE.ShaderMaterial({uniforms:u,vertexShader:VS,fragmentShader:fs,depthTest:false,depthWrite:false,toneMapped:false});
  const brightM=passM(`uniform sampler2D t;uniform float th;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(th*.8,th*1.6,l),1.);}`,{t:{value:null},th:{value:1}});
  const blurM=passM(`uniform sampler2D t;uniform vec2 d;varying vec2 vUv;void main(){vec4 c=texture2D(t,vUv)*.227027;
    c+=(texture2D(t,vUv+d*1.384615)+texture2D(t,vUv-d*1.384615))*.316216;c+=(texture2D(t,vUv+d*3.230769)+texture2D(t,vUv-d*3.230769))*.07027;gl_FragColor=c;}`,{t:{value:null},d:{value:new THREE.Vector2()}});
  const NM=5,compU={s:{value:null},w:{value:null},k:{value:1},uWet:{value:0},uAsp:{value:1},uDrop:{value:new THREE.Vector4(.4,.6,.07,0)},uTrail:{value:.6}};
  for(let i=0;i<NM;i++)compU['b'+i]={value:null};
  const compM=new THREE.ShaderMaterial({uniforms:compU,vertexShader:VS,depthTest:false,depthWrite:false,
    fragmentShader:`uniform sampler2D s,w,b0,b1,b2,b3,b4;uniform float k,uWet,uAsp,uTrail;uniform vec4 uDrop;varying vec2 vUv;
      void main(){
        vec2 uv=vUv,p=(uv-uDrop.xy)*vec2(uAsp,1.);p.y*=p.y>0.?.74:1.;vec2 n=p/uDrop.z;float r=length(n);
        float m=(1.-smoothstep(.84,1.,r))*uDrop.w;
        float tx=abs(uv.x-uDrop.x)*uAsp/(uDrop.z*.5);
        float tr=uDrop.w*(1.-smoothstep(.5,1.,tx))*step(uDrop.y,uv.y)*(1.-smoothstep(uTrail-.02,uTrail+.02,uv.y))*.8;
        vec2 ruv=uDrop.xy-n*vec2(1./uAsp,1.)*uDrop.z*1.15;
        vec2 tuv=uv+vec2(sin(uv.y*140.+uv.x*30.)*.0025,0.)*tr;
        vec2 suv=mix(tuv,ruv,m);
        vec4 c=texture2D(s,suv);vec4 wt=texture2D(w,suv);
        float blur=clamp(uWet*(1.-m*.9)*(1.-tr*.55),0.,1.);c=mix(c,wt,blur);
        c.rgb*=1.-smoothstep(.55,1.,r)*m*.5;
        vec2 h=n-vec2(-.32,.42);c.rgb+=exp(-dot(h,h)*38.)*m*2.2+exp(-dot(n-vec2(.25,-.5),n-vec2(.25,-.5))*20.)*m*.35;
        vec3 b=(texture2D(b0,uv).rgb*.8+texture2D(b1,uv).rgb*.9+texture2D(b2,uv).rgb+texture2D(b3,uv).rgb*.9+texture2D(b4,uv).rgb*.8)*k;
        gl_FragColor=vec4(c.rgb+b,clamp(c.a+max(b.r,max(b.g,b.b))+m,0.,1.));
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`});
  let rtS=null,rtB=null,rtW=null,rtW2=null;const mips=[];
  if(post){const o={type:THREE.HalfFloatType,depthBuffer:false};rtS=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:4});rtB=new THREE.WebGLRenderTarget(1,1,o);
    rtW=new THREE.WebGLRenderTarget(1,1,o);rtW2=new THREE.WebGLRenderTarget(1,1,o);
    for(let i=0;i<NM;i++)mips.push([new THREE.WebGLRenderTarget(1,1,o),new THREE.WebGLRenderTarget(1,1,o)]);
    mips.forEach((m,i)=>{compU['b'+i].value=m[1].texture});compU.s.value=rtS.texture;compU.w.value=rtW.texture}
  function pass(m,target){quad.material=m;R.setRenderTarget(target);R.render(fsScene,fsCam)}
  let active=forge;
  function render(){
    if(!post){R.setRenderTarget(null);R.render(active,cam);return}
    R.setRenderTarget(rtS);R.render(active,cam);
    brightM.uniforms.t.value=rtS.texture;pass(brightM,rtB);
    let src=rtB;mips.forEach(m=>{blurM.uniforms.t.value=src.texture;blurM.uniforms.d.value.set(1/m[0].width,0);pass(blurM,m[0]);
      blurM.uniforms.t.value=m[0].texture;blurM.uniforms.d.value.set(0,1/m[0].height);pass(blurM,m[1]);src=m[1]});
    if(compU.uWet.value>.001||compU.uDrop.value.w>.001){ // lente molhada: a cena borrada
      const w=rtW.width,h=rtW.height;let s=rtS;
      for(let i=0;i<3;i++){blurM.uniforms.t.value=s.texture;blurM.uniforms.d.value.set(1/w,0);pass(blurM,rtW2);blurM.uniforms.t.value=rtW2.texture;blurM.uniforms.d.value.set(0,1/h);pass(blurM,rtW);s=rtW}}
    pass(compM,null);
  }

  /* --- Trajetórias: curvas de Hermite com tempos não uniformes (C1); velocidade zero só nas pontas --- */
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
  const FIN={rx:.08,ry:-.32},G0=[0,MT-.008,0];
  const tiltT=track([[0,[0]],[.5,[.08]],[1.2,[.95]],[3.2,[1.32]],[4,[1.38]],[4.9,[.55]]]);
  const tongP=track([[5.1,[4.2,7.6,2.4]],[6.15,[0,MT+.45,0]],[6.7,[...G0]],[6.95,[...G0]],[7.6,[0,2.2,-.9]],[8.15,[0,1.9,TRZ+.1]],[8.5,[0,WY-.5,TRZ]],[9.6,[0,WY-.57,TRZ]],[PULL,[0,WY-.5,TRZ]],[10.8,[.2,2.5,TRZ+.9]],[11.5,[.5,4.4,TRZ+2]]]);
  const jawT=track([[5.6,[.2]],[6.5,[.2]],[6.85,[0]]]);
  const sPos=track([[SWITCH,[C.x,C.y,C.z]],[13,[C.x,C.y+.1,C.z+.1]],[15,[C.x+.1,C.y,C.z-.1]],[16.6,[C.x*.85,C.y*.85,C.z*.8]],[18,[0,0,0]]]);
  const sRot=track([[SWITCH,[.25,-.4,.1]],[13,[.1,.25,0]],[14.6,[-.3,.45,.05]],[16.2,[.2,-.28,0]],[18,[0,0,0]]]);
  const keyT=track([[SWITCH,[0]],[13.4,[.9]],[16,[1.2]],[18.4,[1.6]]]),envS=track([[SWITCH,[.3]],[13.4,[.9]],[18,[1.15]]]),hemiT=track([[SWITCH,[0]],[13.6,[.3]],[16.6,[.4]],[18,[1.6]],[18.6,[1.6]],[19.2,[0]]]),poolT=track([[SWITCH,[0]],[12.6,[900]],[16.4,[900]],[17.6,[0]]]);
  const bloomT=track([[0,[1]],[10,[1]],[SWITCH,[.6]],[14,[.4]],[18.1,[0]],[HAND+.2,[0]],[HAND+1.2,[.16]]]);
  let W=1,H=1,dist=8.4,lift=0,camF=null,camS=null;
  function resize(){
    const r=host.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);
    R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();compU.uAsp.value=cam.aspect;
    const tan=Math.tan(THREE.MathUtils.degToRad(cam.fov/2)),pr=R.getPixelRatio(),pw=Math.round(W*pr),ph=Math.round(H*pr);
    if(post){rtS.setSize(pw,ph);rtB.setSize(pw>>1,ph>>1);rtW.setSize(Math.max(1,pw>>3),Math.max(1,ph>>3));rtW2.setSize(Math.max(1,pw>>3),Math.max(1,ph>>3));
      mips.forEach((m,i)=>{const w=Math.max(1,pw>>(i+1)),h=Math.max(1,ph>>(i+1));m[0].setSize(w,h);m[1].setSize(w,h)})}
    pxU.value=ph/(2*tan);
    dist=Math.max(8.4,3.6/(2*tan*cam.aspect)*1.12);lift=-(2*dist*tan)*(W<700?.19:.2);
    const f=Math.min(2.1,Math.max(1,1.5/cam.aspect)); // telas em pé afastam a câmera
    const two=(keys)=>{const Pk=track(keys.map(k=>[k[0],k[1].map((v,j)=>v+(k[2][j]-v)*(k[3]===false?1:f))])),Lk=track(keys.map(k=>[k[0],k[1]]));return t=>({p:Pk(t),l:Lk(t)})};
    // [tempo, alvo, posição, afastar?]; em telas em pé a posição se afasta do alvo pelo fator f (o quadro final, não)
    camF=two([[0,[-5.6,1.15,0],[-2.6,1.65,5.6]],[1.9,[-4.6,.75,0],[-1.6,1.45,5.4]],[3.7,[-.6,.5,0],[1.2,3.4,6.6]],[5.3,[0,.6,0],[2.4,4.6,7.4]],
      [6.9,[0,.9,-.4],[2,3.8,7]],[8.5,[0,.35,TRZ],[2.2,3,TRZ+7.2]],[9.9,[0,.35,TRZ],[1.2,2.1,TRZ+5.6]],[11.2,[0,1.6,TRZ+.5],[.5,1.4,TRZ+4.2]]]);
    camS=two([[SWITCH,[C.x,C.y,C.z],[C.x+2.4,C.y-.6,C.z+5.6]],[13,[C.x,C.y,C.z],[C.x+1.2,C.y+1,C.z+12.5]],[14.6,[C.x,C.y+.1,C.z],[C.x-3,C.y+1.6,C.z+10]],
      [16.2,[C.x,C.y,C.z-.1],[C.x+2,C.y+.4,C.z+8.5]],[17.4,[1.5,-3,0],[3.5,-7.5,17]],[18.3,[0,lift*.5,0],[.5,lift*.6,dist+4],false],[19,[0,lift,0],[0,.5+lift,dist],false]]);
    if(!playing)apply(T);
  }
  let T=0,playing=false,fast=false;
  const bv=[0,0,0],tmpV=V3(0,0,0);
  function apply(t){
    const studioOn=t>=SWITCH;active=studioOn?studio:forge;if(group.parent!==active)active.add(group);
    const c=(studioOn?camS:camF)(t);cam.position.set(...c.p);cam.lookAt(...c.l);
    heat.uT.value=t;
    // 1. Fundição: o cadinho inclina, o fio de metal cai e o líquido corre pelo canal
    pivot.rotation.z=-tiltT(t)[0];
    pourU.uB.value=ss(.85,1.2,t);pourU.uA.value=ss(3.75,4.15,t);stream.visible=t>.85&&t<4.2;
    const e=t>=DUR?1:cl((t-FILL0)/(FILL1-FILL0));heat.uE.value=e;group.visible=e>0;
    front.visible=e>0&&e<1&&!studioOn;front.position.set(-L/2+e*L,0,0);front.scale.setScalar(1+.12*Math.sin(t*23));
    // 5. Dobra: devagar e suave, uma curva de cada vez
    for(let i=0;i<3;i++)bv[i]=t>=DUR?1:sst((t-BENDS[i])/BEND_D);
    build(bv);
    // 2–4. Alicate, água e saída: o fio acompanha a ponta do alicate depois de preso
    const tp=tongP(t),jaw=jawT(t)[0];tongs.position.set(...tp);tongs.rotation.set(0,.62,-.24);armA.rotation.x=jaw;armB.rotation.x=-jaw;tongs.visible=!studioOn&&t>5;
    if(!studioOn){
      if(t<GRIP){group.position.set(...G0);group.rotation.set(0,0,0)}
      else{tongs.updateMatrixWorld(true);group.position.copy(tongs.localToWorld(tmpV.set(0,0,0)));group.rotation.set(0,0,0)}
    }else if(t<HAND){const q=sPos(t),r=sRot(t);group.position.set(...q);group.rotation.set(...r)}
    else{const k=sst((t-HAND)/.9);group.position.set(0,0,0);group.rotation.set(FIN.rx*k,FIN.ry*k,0)}
    // Luz da oficina: vem do metal quente
    const gMid=glowJS(tempJS(.5,t));
    poolL.position.set(-L/2+e*L,MT+.35,.3);poolL.intensity=e>0&&e<1?14:0;
    cruL.position.copy(lipW).add(V3(-.5,.4,.6));cruL.intensity=26*ss(.3,.9,t)*(1-ss(4,5,t));
    barL.position.copy(group.position).add(V3(0,.45,.5));barL.intensity=e>0&&t<QUENCH+.2?20*gMid*ss(FILL0,FILL0+.6,t):0;
    subL.position.set(0,WY-.3,TRZ+.2);const under=t>QUENCH&&t<PULL+.1;subL.intensity=under?24*gMid:0;
    waterU.uGlowW.value=under?2.4*gMid:0;waterU.uBoil.value=under?ss(QUENCH,QUENCH+.25,t)*(.25+.75*Math.min(1,gMid*3)):0;
    waterU.uRing.value.set(t<PULL?QUENCH:PULL,1);
    steamU.uWarm.value=gMid;rimF.intensity=.5*ss(4.4,6,t)*(1-ss(10.6,11.4,t));
    // 4. A gota: bate na lente logo depois dos respingos, embaça a tela e escorre
    const dt=t-DROP,dw=dt<0?0:ss(0,.08,dt)*(1-ss(2.05,2.3,dt));
    const dy=.64-Math.pow(Math.max(0,dt-.55)/1.55,1.9)*.95;
    compU.uDrop.value.set(.43+.012*Math.sin(dt*3),dy,.07,dw);compU.uTrail.value=.64;
    compU.uWet.value=dt<0?0:ss(0,.14,dt)*.95*(1-ss(1.1,2.1,dt));
    // 5. Estúdio: o aço prateado brilha conforme a luz sobe
    key.intensity=studioOn?keyT(t)[0]:0;hemi.intensity=studioOn?hemiT(t)[0]:0;pool.intensity=studioOn?poolT(t)[0]:0;
    const ev=studioOn?envS(t)[0]:.28;mats.forEach(m=>m.envMapIntensity=ev);
    sweep.position.copy(group.position).add(V3(lerp(-5,5,cl((t-SWITCH-.4)/3.4)),1,1.6));sweep.intensity=studioOn?40*ss(SWITCH+.3,SWITCH+1,t)*(1-ss(14.6,15.6,t)):0;
    // 6. O papel: ao chegar perto, o papel de cima vira a cor exata da página e assume o lugar dela
    flatU.uFlat.value=ss(17.9,18.85,t);
    const handed=t>=HAND;papers.forEach(p=>p.visible=!handed);table.visible=!handed;
    shMat.opacity=handed?.5*ss(HAND+.3,HAND+1.4,t):0;
    compU.k.value=bloomT(t)[0];
    if(hero.classList.contains('night')===handed){hero.style.transition='none';hero.classList.toggle('night',!handed);void hero.offsetWidth;hero.style.transition=''}
    const shown=t>=LIT;hero.classList.toggle('lit',shown);document.body.classList.toggle('film',!shown&&vis.hero);
  }
  let rotV=0,rotOff=0,drag=null,tilt=0;
  function idle(t){
    if(!drag){rotV*=.93;rotOff+=rotV;rotOff+=(0-rotOff)*.018}
    group.position.set(0,Math.sin(t*.9)*.025,0);group.rotation.set(FIN.rx+tilt*.08,FIN.ry+rotOff+Math.sin(t*.5)*.05,0);
  }
  host.addEventListener('pointerdown',e=>{if(playing)return;drag={last:e.clientX};hint.classList.remove('show')});
  host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();tilt=(e.clientY-r.top)/r.height-.5;if(drag){const dx=e.clientX-drag.last;drag.last=e.clientX;rotV=dx*.009;rotOff+=dx*.009}});
  const up=()=>{drag=null};['pointerup','pointercancel','pointerleave'].forEach(n=>host.addEventListener(n,up));
  function play(){frozen=false;T=0;playing=true;fast=false;skip.hidden=false;replay.hidden=true;hint.classList.remove('show');rotOff=rotV=0;apply(0)}
  function finish(){playing=false;fast=false;T=DUR;apply(DUR);skip.hidden=true;replay.hidden=false;document.body.classList.remove('film');
    setTimeout(()=>{if(!playing&&vis.hero)hint.classList.add('show')},700);setTimeout(()=>hint.classList.remove('show'),6000)}
  skip.onclick=()=>{fast=true};replay.onclick=play;
  let frozen=false,slow=0;
  function frame(dt,now){
    if(frozen)return;
    // Aparelho sem fôlego (quadros acima de ~33 ms seguidos): reduz a resolução interna em vez de perder fluidez.
    if(dt>0){slow=dt>.033?slow+1:Math.max(0,slow-2);if(slow>45&&R.getPixelRatio()>1){R.setPixelRatio(1);slow=0;resize()}}
    if(playing){T+=dt*(fast?5:1);if(T>=DUR)finish();else apply(T)}else idle(now);
    render();
  }
  return{
    boot(){resize();if(scrollY<innerHeight*.3&&!reduce)play();else{T=DUR;apply(DUR);skip.hidden=true;replay.hidden=false}},
    resize,frame,
    leave(){if(playing)finish()},
    replay(){scrollTo({top:0,behavior:reduce?'auto':'smooth'});setTimeout(play,reduce?0:600)},
    seek(t){playing=false;frozen=true;T=t;apply(t);render()} // para depurar: film.seek(5.2) congela o filme nesse instante
  };
})();
$('#toFilm').onclick=()=>film.replay();
