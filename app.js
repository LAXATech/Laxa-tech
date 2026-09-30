(() => {
  'use strict';
  document.getElementById('year').textContent = new Date().getFullYear();
  const form=document.getElementById('brief-form');
  document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{const input=Array.from(form.elements.service).find(input=>input.value===link.dataset.service);if(input)input.checked=true;}));
  form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form),name=String(data.get('name')).trim(),idea=String(data.get('idea')).trim();if(!name||!idea){document.getElementById('form-status').textContent='Please add your name and a few details about your idea.';return}const brief=['LAXA TECH — PROJECT BRIEF','',`Name: ${name}`,`Email: ${data.get('email')}`,`Project: ${data.get('service')}`,'','The idea',idea,'',`Prepared ${new Date().toLocaleDateString('en-GB')}`].join('\n');if(e.submitter?.dataset.action==='download'){const blob=new Blob([brief],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='laxa-tech-project-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.getElementById('form-status').textContent='Your project brief is ready to keep.';}else{window.location.href='mailto:praiselin2005@gmail.com?subject='+encodeURIComponent('New '+data.get('service')+' project — '+name)+'&body='+encodeURIComponent(brief);document.getElementById('form-status').textContent='Your email app will open with your brief. Review it and press send there. If it doesn’t open, download your brief and email praiselin2005@gmail.com.';}});
  const canvas = document.getElementById('sculpture');
  const gl = canvas.getContext('webgl', {alpha:true, antialias:true, powerPreference:'low-power'});
  if (!gl) return;
  try {
    const vertex = `attribute vec3 position; attribute vec3 normal; uniform mat4 projection; uniform mat4 model; varying vec3 vNormal; varying vec3 vPosition; void main(){ vec4 p=model*vec4(position,1.);vPosition=p.xyz;vNormal=mat3(model)*normal;gl_Position=projection*p;}`;
    const fragment = `precision mediump float;varying vec3 vNormal;varying vec3 vPosition;void main(){vec3 N=normalize(vNormal);vec3 V=normalize(-vPosition);vec3 L=normalize(vec3(-2.,4.,4.));float d=max(dot(N,L),0.);float rim=pow(1.-max(dot(N,V),0.),3.);float spec=pow(max(dot(reflect(-L,N),V),0.),65.);float stripe=pow(abs(sin(N.y*4.+N.x*2.)),14.);vec3 base=mix(vec3(.12,.16,.065),vec3(.79,.94,.54),smoothstep(-.45,.65,N.y));vec3 c=base*(.25+.8*d)+vec3(.88,1.,.74)*spec*1.5+vec3(.33,.43,.22)*rim+vec3(.25,.29,.2)*stripe;gl_FragColor=vec4(c,1.);}`;
    function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
    const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('3D program unavailable');gl.useProgram(program);
    const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    const unit=a=>{const n=Math.hypot(...a);return a.map(v=>v/n)};
    function curve(t){return [(2+Math.cos(3*t))*.52*Math.cos(2*t),(2+Math.cos(3*t))*.52*Math.sin(2*t),Math.sin(3*t)*.62]}
    const positions=[],normals=[],indices=[],segments=240,sides=32;
    for(let i=0;i<=segments;i++){const t=i/segments*Math.PI*2,p=curve(t),p2=curve(t+.001),T=unit(p2.map((v,j)=>v-p[j])),B=unit(cross(T,[0,0,1])),N=unit(cross(B,T));for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,n=N.map((v,k)=>v*Math.cos(a)+B[k]*Math.sin(a));positions.push(...p.map((v,k)=>v+n[k]*.29));normals.push(...n);if(i<segments&&j<sides){const k=i*(sides+1)+j;indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}}}
    function attribute(name,data){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,0,0);}
    attribute('position',positions);attribute('normal',normals);const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);gl.enable(gl.DEPTH_TEST);
    const projection=gl.getUniformLocation(program,'projection'),model=gl.getUniformLocation(program,'model');
    let paused=window.LaxaMotion.paused,rx=-.35,ry=.1,targetX=rx,targetY=ry,angle=0,last=0,visible=true;
    window.addEventListener('laxa-motion',()=>{paused=window.LaxaMotion.paused;});
    canvas.addEventListener('pointermove',e=>{if(paused)return;const r=canvas.getBoundingClientRect();targetY=(e.clientX-r.left)/r.width-.5;targetX=(e.clientY-r.top)/r.height-.8});
    canvas.addEventListener('pointerleave',()=>{targetX=-.35;targetY=.1});
    new IntersectionObserver(e=>{visible=e[0].isIntersecting}).observe(canvas);
    function draw(now){requestAnimationFrame(draw);const delta=Math.min((now-last)/1000,.05);last=now;if(!visible||document.hidden)return;if(!paused){angle+=delta*.15;rx+=(targetX-rx)*.035;ry+=(targetY-ry)*.035}const ratio=Math.min(devicePixelRatio,2),w=Math.round(canvas.clientWidth*ratio),h=Math.round(canvas.clientHeight*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);const f=1/Math.tan(.7/2),aspect=w/h;gl.uniformMatrix4fv(projection,false,new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,-1.02,-1,0,0,-.202,0]));const a=angle+ry,b=rx,c=Math.cos(a),s=Math.sin(a),u=Math.cos(b),v=Math.sin(b);gl.uniformMatrix4fv(model,false,new Float32Array([c,s*v,-s*u,0,0,u,v,0,s,-c*v,c*u,0,0,0,-6.7,1]));gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0)}
    canvas.classList.add('webgl-ready');requestAnimationFrame(draw);
  }catch(e){console.warn('3D unavailable; displaying brand mark.',e)}
})();
