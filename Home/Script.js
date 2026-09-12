(() => {

const splash=document.getElementById("splash");
const loadingBar=document.querySelector(".loading-bar");
const splashBlocks=document.querySelector(".building-blocks");
const navLogo=document.querySelector(".nav-logo");
const navBlocks=document.querySelector(".nav-building-blocks");


// splash screen

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


  // move animation to nav
function moveAnimationToNavbar(){
  if(!splashBlocks || !navBlocks){ splash.classList.add("loaded"); splash.style.display="none"; return; }

  const loadContainer=document.querySelector(".loading-container");
  if(loadContainer) loadContainer.style.opacity="0";

  const splashRect=splashBlocks.getBoundingClientRect();
  const navRect=navBlocks.getBoundingClientRect();

  const splashX=splashRect.left+splashRect.width/2;
  const splashY=splashRect.top+splashRect.height/2;
  const navX=navRect.left+navRect.width/2;
  const navY=navRect.top+navRect.height/2;

  const deltaX=navX-splashX;
  const deltaY=navY-splashY;
  const scale=navRect.width/splashRect.width;

  const orange=splashBlocks.querySelector(".block-orange");
  const purple=splashBlocks.querySelector(".block-purple");
  if(orange) orange.style.animation="none";
  if(purple) purple.style.animation="none";

  // fly to the nav icon's exact position
  splashBlocks.style.transform=`translate(${deltaX}px, ${deltaY}px) scale(${scale})`;

  setTimeout(()=>{ splash.style.background="transparent"; },350);

  setTimeout(()=>{
    splash.classList.add("loaded");
    splashBlocks.style.opacity="0";
  },1050);

  // hard cleanup
  setTimeout(()=>{
    splash.style.display="none";
  },1600);
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

// sliding nav indicator pill
const navLinksContainer = document.querySelector(".nav-links");
const navIndicator = document.querySelector(".nav-indicator");
const navItems = document.querySelectorAll(".nav-links a");

if (navLinksContainer && navIndicator && navItems.length > 0) {
  navItems.forEach(link => {
    link.addEventListener("mouseenter", () => {
      const linkRect = link.getBoundingClientRect();
      const containerRect = navLinksContainer.getBoundingClientRect();

      const left = linkRect.left - containerRect.left;
      const width = linkRect.width;

      navIndicator.style.left = `${left}px`;
      navIndicator.style.width = `${width}px`;
      navIndicator.style.opacity = "1";
    });
  });

  navLinksContainer.addEventListener("mouseleave", () => {
    navIndicator.style.opacity = "0";
  });
}

// gsap setup
if(window.gsap && window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);
}
const hasGsap=!!(window.gsap && window.ScrollTrigger);

// hero scroll animation (GSAP ScrollTrigger, pinned + scrubbed)
const heroWrap=document.getElementById("heroWrap");
const heroCopy=document.getElementById("heroCopy");
const heroLaptop=document.getElementById("heroLaptop");
const heroLaptopImg=heroLaptop ? heroLaptop.querySelector("img") : null;
const heroBehind=document.getElementById("heroBehind");

if(hasGsap && heroWrap && heroCopy && heroLaptop && heroLaptopImg && heroBehind){

  ScrollTrigger.matchMedia({

    // desktop: laptop flies in, holds centered through the marquee, then the
    // section simply un-pins and normal scrolling carries you into the next section
    "(min-width:651px)":()=>{
      gsap.set(heroLaptop,{xPercent:-50,yPercent:-50});
      gsap.set(heroBehind,{xPercent:-50,yPercent:-50});
      gsap.set(heroCopy,{pointerEvents:"auto"});

      const tl=gsap.timeline({
        scrollTrigger:{
          trigger:heroWrap,
          start:"top top",
          end:"bottom bottom",
          scrub:1,
          pin:".hero-sticky",
        }
      });

      // phase 1 (first half): laptop slides in diagonally from the upper right
      tl.fromTo(heroLaptop,{x:"29vw"},{x:"-3vw",ease:"none",duration:1},0);
      tl.fromTo(heroCopy,{opacity:1},{opacity:0,ease:"none",duration:1},0);
      tl.set(heroCopy,{pointerEvents:"none"},0.6);

      // phase 2 (second half): laptop holds still, placeholder text scrolls up behind it,
      // fading in over the first 15% and out over the last 15% as it passes through center.
      // travel is kept small so the marquee stays close behind the laptop the whole time
      // instead of sweeping off past its silhouette
      tl.fromTo(heroBehind,{y:"18vh",opacity:0},{y:"12.6vh",opacity:1,ease:"none",duration:0.15},1);
      tl.to(heroBehind,{y:"-12.6vh",opacity:1,ease:"none",duration:0.7},">");
      tl.to(heroBehind,{y:"-18vh",opacity:0,ease:"none",duration:0.15},">");

      // laptop fades out alongside the marquee's own exit fade, in that same final 15%,
      // so the handoff into the next section is a fade rather than an abrupt cut
      tl.fromTo(heroLaptop,{opacity:1},{opacity:0,ease:"none",duration:0.15},1.85);

      return ()=>{
        tl.scrollTrigger && tl.scrollTrigger.kill();
        tl.kill();
        gsap.set([heroLaptop,heroCopy,heroBehind],{clearProps:"all"});
      };
    },

    "(max-width:650px)":()=>{
      gsap.set([heroLaptop,heroCopy,heroBehind],{clearProps:"all"});
    }

  });

  // weighted bounce: a damped spring gets "kicked" by scroll motion, so it swings
  // and settles like something with real mass, plus a slow constant idle sway.
  // applied to the laptop image itself so it layers on top of GSAP's positioning
  // of the outer #heroLaptop wrapper without the two fighting over one transform.
  let lastScrollY=scrollY;
  let lastFrameTime=performance.now();
  let springY=0;
  let springVelocity=0;
  let idlePhase=0;

  const stiffness=20;   // lower = slower, heavier swing
  const damping=6;    // lower = more/longer bounces before settling
  const scrollKick=1; // how hard a scroll nudges the spring

  function tickHeroBounce(now){
    const dt=Math.min((now-lastFrameTime)/1000,.05); // seconds, capped to avoid jolts after tab-away
    lastFrameTime=now;

    const currentY=scrollY;
    const delta=Math.min(120,Math.max(-120,currentY-lastScrollY));
    lastScrollY=currentY;

    if(innerWidth>650){
      springVelocity+=delta*scrollKick;

      const accel=-stiffness*springY-damping*springVelocity;
      springVelocity+=accel*dt;
      springY=Math.min(40,Math.max(-40,springY+springVelocity*dt));

      idlePhase+=dt*1.4;
      const idleY=Math.sin(idlePhase)*4;

      heroLaptopImg.style.transform=`translateY(${(springY+idleY).toFixed(2)}px)`;
    } else {
      heroLaptopImg.style.transform="";
    }

    requestAnimationFrame(tickHeroBounce);
  }
  requestAnimationFrame(tickHeroBounce);
}

// product scroll-jacked carousel (GSAP ScrollTrigger, pinned + scrubbed)
const productWrap=document.getElementById("productWrap");
const productSticky=document.getElementById("productSticky");
const productViewport=document.getElementById("productViewport");
const productTrack=document.getElementById("productTrack");

if(hasGsap && productWrap && productSticky && productViewport && productTrack){

  ScrollTrigger.matchMedia({

    "(min-width:651px)":()=>{
      const tl=gsap.timeline({
        scrollTrigger:{
          trigger:productWrap,
          start:"top top",
          end:"bottom bottom",
          scrub:1,
          pin:productSticky,
          invalidateOnRefresh:true,
        }
      });

      // phase A (first 8%): the row fades up into place from below - kept short so
      // it picks up right where the hero's fade-out leaves off, without a dead gap
      tl.fromTo(productTrack,{y:"14vh",opacity:0},{y:"0vh",opacity:1,ease:"none",duration:0.08},0);

      // phase B (remaining 92%): pinned in place, the row pans sideways through all 6 cards
      tl.to(productTrack,{
        x:()=>-(Math.max(0,productTrack.scrollWidth-productViewport.clientWidth)),
        ease:"none",
        duration:0.92,
      },0.08);

      return ()=>{
        tl.scrollTrigger && tl.scrollTrigger.kill();
        tl.kill();
        gsap.set(productTrack,{clearProps:"all"});
      };
    },

    "(max-width:650px)":()=>{
      gsap.set(productTrack,{clearProps:"all"});
    }

  });
}

// canvas background
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

// settings 
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


// lines
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


// waves
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


// draw and erase progress
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


// draw lines
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


// animation loop
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