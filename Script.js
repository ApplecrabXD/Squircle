(() => {

const splash=document.getElementById("splash");
const loadingBar=document.querySelector(".loading-bar");
const splashBlocks=document.querySelector(".building-blocks");
const navLogo=document.querySelector(".nav-logo");
const navBlocks=document.querySelector(".nav-building-blocks");


// splash screem

if(splash && loadingBar){
  const minimumTime=2500;
  const startTime=performance.now();

  let pageLoaded=false;
  let loadingFinished=false;


  // Loading
  function updateLoading(){
    if(pageLoaded){loadingBar.style.width="100%"; return;}

    const resources=performance.getEntriesByType("resource");
    const total=resources.length+1;
    const loaded=resources.filter(resource=>{return resource.responseEnd>0;}).length;
    const progress=Math.min(95,(loaded/total)*100);

    loadingBar.style.width=progress+"%";

    requestAnimationFrame(updateLoading);
  }
  updateLoading();


  // move aniamtion to nav
  function moveAnimationToNavbar(){
    if(!splashBlocks || !navLogo){ splash.classList.add("loaded"); return;}


    // center of splash animation & center of navbar
    const splashRect=splashBlocks.getBoundingClientRect();
    const navRect=navLogo.getBoundingClientRect();
    const splashX=splashRect.left+splashRect.width/2;
    const splashY=splashRect.top+splashRect.height/2;
    const navX=navRect.left+navRect.height/2;
    const navY=navRect.top+navRect.height/2;
    const deltaX=navX-splashX;
    const deltaY=navY-splashY;
    const scale=navRect.height/splashRect.height;


    // stop animation then travel
    const orange=splashBlocks.querySelector(".block-orange");
    const purple=splashBlocks.querySelector(".block-purple");
    
    if(orange)orange.style.animation="none";
    if(purple) purple.style.animation="none";


    // animate loding into nav bar
    splashBlocks.style.transform=`translate(${deltaX}px, ${deltaY}px) scale(${scale})`;


    // fade
    setTimeout(()=>{splash.style.background="transparent";},350);
  

    // new nav bar vrs
    setTimeout(()=>{splash.classList.add("loaded");
      if(navBlocks){navBlocks.style.opacity="1"; navBlocks.style.transform="scale(1)"; }

      splashBlocks.style.opacity="0";

    },1050);
  }


  // end splash screen
  function finishSplash(){
    if(!pageLoaded || loadingFinished)return; loadingFinished=true;
    
    const elapsed=performance.now()-startTime;
    const remaining=Math.max(0,minimumTime-elapsed);

    loadingBar.style.width="100%";

    setTimeout(()=>{moveAnimationToNavbar();},remaining);
  }

  window.addEventListener("load",()=>{pageLoaded=true; finishSplash();});
}

// canvas
const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");

if(!ctx)return;

let width,height,dpr;


// resize
function resize(){
  width=innerWidth;
  height=innerHeight;

  dpr=Math.min(devicePixelRatio||1,innerWidth<600?1.5:innerWidth<1000?1.75:2);

  canvas.width= width*dpr;
  canvas.height=height*dpr;
  canvas.style.width=width+"px";
  canvas.style.height= height+"px";

  ctx.setTransform(dpr,0,0,dpr,0,0);
}

addEventListener("resize",()=>{
  resize();
  if(lines.length)createlines();
});

resize();

// setting 
const settings={
  lineCount:innerWidth<600?18:innerWidth<1000?24:30,
  pointSpacing:innerWidth<600?12:innerWidth<1000?10:8,
  mouseRadius:innerWidth<600?90:innerWidth<1000?105:120,
  mouseForce:1.30,
  movementSpeed:.00045,
  lineWidth:1.20,
  cycleLength:10000
};

// mouse track
const mouse={
  x:width/2,
  y:height/2,
  targetX:width/2,
  targetY:height/2,

  active:false
};

addEventListener("mousemove",e=>{
  mouse.targetX=e.clientX;
  mouse.targetY=e.clientY;
  mouse.active=true;
});

addEventListener("mouseleave",()=>{mouse.active=false;});


// Lines boi things lmao
let lines=[];
function createlines(){
  lines=[];
  for(let i=0;i<settings.lineCount;i++){const y=(i/(settings.lineCount-1))*(height+120)-60;
    lines.push({
      baseY:y,
      amplitude:15+Math.random()*30,
      frequency:.0015+Math.random()*.002,
      speed:.5+Math.random()*1.1,
      phase:Math.random()*Math.PI*2,
      seed:Math.random()*10000,
      delay:Math.random()*settings.cycleLength,
      direction:Math.random()>.5
    });
  }
}

createlines();


// Waves
function getPoint(line,x,time){
  const wave1=Math.sin(x*line.frequency+line.phase+time*settings.movementSpeed*line.speed);
  const wave2=Math.sin(x*.003-time*settings.movementSpeed*.7+line.seed);
  const wave3=Math.sin(x*.0015+time*settings.movementSpeed*.25);
  let y=line.baseY+wave1*line.amplitude+wave2*15+wave3*10;


  /* Mouse reaction */
  if(mouse.active &&!("ontouchstart" in window)){
    const dx=x-mouse.x;
    const dy=y-mouse.y;
    const distance=Math.hypot(dx,dy);

    if(distance<settings.mouseRadius){
      const force=1-distance/settings.mouseRadius;
      const angle=Math.atan2(dy,dx);
      const push=force*settings.mouseRadius*settings.mouseForce; y+=Math.sin(angle)*push;
    }
  }

  return{x,y};
}


// Draw and erase
function getProgress(line,time){
  const local=(time+line.delay)%settings.cycleLength;
  const draw=settings.cycleLength*.35;
  const hold=settings.cycleLength*.12;
  const erase=settings.cycleLength*.35;
  
  if(local<draw)return local/draw;
  if(local<draw+hold) return 1;
  if(local<draw+hold+erase){return 1-(local-draw-hold)/erase;}

  return 0;
}


//draw fr this time
// i have no cule what im doing or why this works :(
function drawLine(line,time){
  const progress=getProgress(line,time);
  
  if(progress<=0)return;

  const total=Math.ceil(width/settings.pointSpacing);
  const visible=Math.floor(total*progress);

  if(visible<2)return;

  ctx.beginPath();

  for(let i=0;i<visible;i++){
    const x=line.direction ?i*settings.pointSpacing:width-i*settings.pointSpacing;
    const point=getPoint(line,x,time);

    if(i===0)
      ctx.moveTo(point.x,point.y);

    else
      ctx.lineTo(point.x,point.y);
  }

  ctx.stroke();
}


// animation
function animate(time){
  mouse.x+=(mouse.targetX-mouse.x)*.09;
  mouse.y+=(mouse.targetY-mouse.y)*.09;

  ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--background");
  ctx.fillRect(0,0,width,height);
  ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue("--line");
  ctx.lineWidth=settings.lineWidth;
  ctx.lineCap="round";
  ctx.lineJoin="round";

  for(const line of lines)
    drawLine(line,time);

  
  // mouse boundary
  if(mouse.active){
    ctx.beginPath();
    ctx.arc(mouse.x,mouse.y,settings.mouseRadius,0,Math.PI*2);
    ctx.strokeStyle="rgba(0,0,0,.035)";
    ctx.lineWidth=1;
    ctx.stroke();
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
})();