(() => {

const splash=document.getElementById("splash");
const loadingBar=document.querySelector(".loading-bar");
const splashBlocks=document.querySelector(".building-blocks");
const navLogo=document.querySelector(".nav-logo");
const navBlocks=document.querySelector(".nav-building-blocks");

// splash screen

// once the intro has played once anywhere on the site this tab session, skip it afterwords
const introKey="squircleIntroSeen";

if(splash && loadingBar && sessionStorage.getItem(introKey)==="1"){
  splash.style.display="none";
  splash.classList.add("loaded");
  
}else if(splash && loadingBar){
  sessionStorage.setItem(introKey,"1");

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

  // move to the nav icon position
  splashBlocks.style.transform=`translate(${deltaX}px, ${deltaY}px) scale(${scale})`;

  setTimeout(()=>{ splash.style.background="transparent"; },350);

  setTimeout(()=>{
    splash.classList.add("loaded");
    splashBlocks.style.opacity="0";
  },1050);

  // hard cleanup
  setTimeout(()=>{splash.style.display="none";},1600);
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

  navLinksContainer.addEventListener("mouseleave", () => {navIndicator.style.opacity = "0";});
}

// gsap setup (holy cow gasp is so cool why havent i used it before)
if(window.gsap && window.ScrollTrigger){gsap.registerPlugin(ScrollTrigger);}
const hasGsap=!!(window.gsap && window.ScrollTrigger);

// hero scroll animation GSAP ScrollTrigger pinned
const heroWrap=document.getElementById("heroWrap");
const heroCopy=document.getElementById("heroCopy");
const heroLaptop=document.getElementById("heroLaptop");
const heroLaptopImg=heroLaptop ? heroLaptop.querySelector("img") : null;
const heroBehind=document.getElementById("heroBehind");

if(hasGsap && heroWrap && heroCopy && heroLaptop && heroLaptopImg && heroBehind){

  ScrollTrigger.matchMedia({

    // desktop laptop flies in, holds centered through the marquee, then the section unpints and noraml scrolling reterns
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

      // phase 1 - laptop slides in diagonally from the upper right
      tl.fromTo(heroLaptop,{x:"29vw"},{x:"-3vw",ease:"none",duration:1},0);
      tl.fromTo(heroCopy,{opacity:1},{opacity:0,ease:"none",duration:1},0);
      tl.set(heroCopy,{pointerEvents:"none"},0.6);

      // phase 2 - laptop holds still and scrolls up behind it fading out last 15% as passes through center
tl.set(heroBehind,{y:"12.6vh",opacity:1},1);
tl.to(heroBehind,{y:"-12.6vh",ease:"none",duration:0.85},1);
tl.to(heroBehind,{y:"-18vh",opacity:0,ease:"none",duration:0.15},">");

      // laptop fades out alongside the marquee's in final 15% so the handoff into the next section is a fade
      tl.to(heroLaptop,{opacity:0,ease:"none",duration:0.15},1.85);

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

  // weighted bounce so it settles like something with weight + idle animation only on laptop ontop of gsap 
  let lastScrollY=scrollY;
  let lastFrameTime=performance.now();
  let springY=0;
  let springVelocity=0;
  let idlePhase=0;

  const stiffness=20;   // lower = slower - heavier swing
  const damping=6;    // lower = more/longer bounces before settling
  const scrollKick=1; // how hard a scroll nudges the spring

  function tickHeroBounce(now){
    const dt=Math.min((now-lastFrameTime)/1000,.05); // seconds, capped to avoid jolts after tab out (idk why but it works)
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

// Squircle atom effect the word is sampled into a field of small particles that scatter away from the cursor
const atomWrap=document.querySelector(".hero-title-atom");
const atomText=document.querySelector(".hero-title-atom-text");
const atomCanvas=document.querySelector(".hero-title-atom-canvas");
const atomCtx=atomCanvas && atomCanvas.getContext ? atomCanvas.getContext("2d") : null;
const atomReducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;

if(atomWrap && atomText && atomCtx && !("ontouchstart" in window) && !atomReducedMotion){

  let atomParticles=[];
  let atomDpr=1;
  let atomMouseX=-9999,atomMouseY=-9999;

  function buildAtomParticles(){
    const w=atomText.offsetWidth;
    const h=atomText.offsetHeight;
    if(w<1||h<1)return;

    atomDpr=Math.min(devicePixelRatio||1,2);

    atomCanvas.width=w*atomDpr;
    atomCanvas.height=h*atomDpr;
    atomCanvas.style.width=w+"px";
    atomCanvas.style.height=h+"px";

    // sample the real heading text onto an offscreen canvas so the particle matches the leters 
    const sample=document.createElement("canvas");
    sample.width=w*atomDpr;
    sample.height=h*atomDpr;
    const sctx=sample.getContext("2d");
    const style=getComputedStyle(atomText);

    sctx.scale(atomDpr,atomDpr);
    sctx.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    sctx.textBaseline="middle";
    sctx.fillStyle=style.color;
    sctx.fillText(atomText.textContent,0,h/2);

    const data=sctx.getImageData(0,0,w*atomDpr,h*atomDpr).data;
    const spacing=Math.max(3,Math.round(3.5*atomDpr));
    const particles=[];

    for(let y=0;y<h*atomDpr;y+=spacing){
      for(let x=0;x<w*atomDpr;x+=spacing){
        const i=(y*w*atomDpr+x)*4;
        if(data[i+3]>120){
          particles.push({
            homeX:x/atomDpr,homeY:y/atomDpr,
            x:x/atomDpr,y:y/atomDpr,
            vx:0,vy:0,
            r:.8+Math.random()*.6,
            color:`rgb(${data[i]},${data[i+1]},${data[i+2]})`
          });
        }
      }
    }

    atomParticles=particles;
    atomWrap.classList.add("atom-ready");
  }

  addEventListener("mousemove",e=>{
    const rect=atomCanvas.getBoundingClientRect();
    atomMouseX=e.clientX-rect.left;
    atomMouseY=e.clientY-rect.top;
  });

  addEventListener("mouseleave",()=>{atomMouseX=-9999; atomMouseY=-9999;});

  const atomRadius=50;
  const atomForce=1.6;
  const atomSwirl=.5;
  const atomStiffness=.12;
  const atomDamping=.82;

  function tickAtoms(){
    if(atomParticles.length){
      atomCtx.clearRect(0,0,atomCanvas.width,atomCanvas.height);
      atomCtx.save();
      atomCtx.scale(atomDpr,atomDpr);

      for(const p of atomParticles){
        const dx=p.x-atomMouseX;
        const dy=p.y-atomMouseY;
        const distance=Math.hypot(dx,dy);

        if(distance<atomRadius){
          const force=(1-distance/atomRadius)*atomForce;
          const angle=Math.atan2(dy,dx);
          p.vx+=Math.cos(angle)*force-Math.sin(angle)*force*atomSwirl;
          p.vy+=Math.sin(angle)*force+Math.cos(angle)*force*atomSwirl;
        }

        p.vx+=(p.homeX-p.x)*atomStiffness;
        p.vy+=(p.homeY-p.y)*atomStiffness;
        p.vx*=atomDamping;
        p.vy*=atomDamping;
        p.x+=p.vx;
        p.y+=p.vy;
      }

      for(const p of atomParticles){
        atomCtx.beginPath();
        atomCtx.fillStyle=p.color;
        atomCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
        atomCtx.fill();
      }

      atomCtx.restore();
    }

    requestAnimationFrame(tickAtoms);
  }

  if(document.fonts && document.fonts.ready)
    document.fonts.ready.then(buildAtomParticles);
  else
    buildAtomParticles();

  addEventListener("resize",buildAtomParticles);
  requestAnimationFrame(tickAtoms);
}

// product scroll-jacked carousel gasp scrolltrigger
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

      // row is already in place and fully visible the moment the pin engages
      tl.to(productTrack,{
        x:()=>-(Math.max(0,productTrack.scrollWidth-productViewport.clientWidth)),
        ease:"none",
        duration:1,
      },0);

      return ()=>{
        tl.scrollTrigger && tl.scrollTrigger.kill();
        tl.kill();
        gsap.set(productTrack,{clearProps:"all"});
      };
    },

    "(max-width:650px)":()=>{gsap.set(productTrack,{clearProps:"all"});}

  });
}

// lappy feature showcase: horizontal scroll-jacked panels, text flies in from all directions as each panel pans into view
const lappyShowcaseWrap=document.getElementById("lappyShowcase");
const lappyShowcaseSticky=document.getElementById("lappyShowcaseSticky");
const lappyShowcaseTrack=document.getElementById("lappyShowcaseTrack");
const lappyPanels=lappyShowcaseTrack ? Array.from(lappyShowcaseTrack.children) : [];

if(hasGsap && lappyShowcaseWrap && lappyShowcaseSticky && lappyShowcaseTrack && lappyPanels.length){

  // per data-fx value, where each bit of text starts before it settles into place
  const fxFrom={
    up:{y:70,rotate:-3},
    down:{y:-70,rotate:3},
    left:{x:-140,rotate:-4},
    right:{x:140,rotate:4},
    scale:{scale:.6,rotate:6}
  };

  ScrollTrigger.matchMedia({

    "(min-width:651px)":()=>{
      // the horizontal pan itself, pinned for the length of the wrap
      const panTween=gsap.to(lappyShowcaseTrack,{
        x:()=>-(lappyShowcaseTrack.scrollWidth-lappyShowcaseSticky.clientWidth),
        ease:"none",
        scrollTrigger:{
          trigger:lappyShowcaseWrap,
          start:"top top",
          end:"bottom bottom",
          scrub:1,
          pin:lappyShowcaseSticky,
          invalidateOnRefresh:true,
        }
      });

      // each panel's text pieces get their own scrubbed reveal, mapped onto the
      // horizontal pan via containerAnimation instead of the page's vertical scroll
      const fxTweens=[];

      lappyPanels.forEach(panel=>{
        panel.querySelectorAll("[data-fx]").forEach(el=>{
          fxTweens.push(gsap.from(el,{
            ...fxFrom[el.dataset.fx],
            opacity:0,
            duration:1,
            scrollTrigger:{
              trigger:panel,
              containerAnimation:panTween,
              start:"left 78%",
              end:"left 30%",
              scrub:true,
            }
          }));
        });
      });

      return ()=>{
        panTween.scrollTrigger && panTween.scrollTrigger.kill();
        panTween.kill();
        fxTweens.forEach(t=>{t.scrollTrigger && t.scrollTrigger.kill(); t.kill();});
        gsap.set(lappyShowcaseTrack,{clearProps:"all"});
        gsap.set(lappyShowcaseTrack.querySelectorAll("[data-fx]"),{clearProps:"all"});
      };
    },

    "(max-width:650px)":()=>{
      gsap.set(lappyShowcaseTrack,{clearProps:"all"});
      gsap.set(lappyShowcaseTrack.querySelectorAll("[data-fx]"),{clearProps:"all"});
    }

  });
}

// about/more info section reveal (scribble accent draws in once, first time it scrolls into view)
const aboutHeadings=document.querySelectorAll(".about-heading");
if(aboutHeadings.length && "IntersectionObserver" in window){
  const aboutObserver=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("in-view");
        aboutObserver.unobserve(entry.target);
      }
    });
  },{threshold:0,rootMargin:"0px 0px -30% 0px"});
  aboutHeadings.forEach(heading=>aboutObserver.observe(heading));
}

// about images fade/slide in the first time each scrolls into view
const aboutReveals=document.querySelectorAll(".about-media, .about-banner");
if(aboutReveals.length && "IntersectionObserver" in window){
  const aboutMediaObserver=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("in-view");
        aboutMediaObserver.unobserve(entry.target);
      }
    });
  },{threshold:0,rootMargin:"0px 0px -15% 0px"});
  aboutReveals.forEach(el=>aboutMediaObserver.observe(el));
}

// lappy DIY/pre-built cards fade/slide in the first time they scroll into view
const lappyOptions=document.querySelectorAll(".lappy-option");
if(lappyOptions.length && "IntersectionObserver" in window){
  const lappyOptionsObserver=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("in-view");
        lappyOptionsObserver.unobserve(entry.target);
      }
    });
  },{threshold:0,rootMargin:"0px 0px -15% 0px"});
  lappyOptions.forEach(el=>lappyOptionsObserver.observe(el));
}

// lappy spec configurator: click a spec to swap the laptop image, expand its
// placeholder description, and slide a nav-indicator-style pill behind it
const lappyConfiguratorImg=document.getElementById("lappyConfiguratorImg");
const lappySpecList=document.querySelector(".lappy-spec-list");
const lappySpecIndicator=document.querySelector(".lappy-spec-indicator");
const lappySpecBtns=document.querySelectorAll(".lappy-spec-btn");

if(lappyConfiguratorImg && lappySpecList && lappySpecIndicator && lappySpecBtns.length){

  function moveSpecIndicator(btn){
    const btnRect=btn.getBoundingClientRect();
    const listRect=lappySpecList.getBoundingClientRect();

    lappySpecIndicator.style.top=`${btnRect.top-listRect.top}px`;
    lappySpecIndicator.style.height=`${btnRect.height}px`;
  }

  // the row's own height animates (grid-template-rows) as its description opens/closes,
  // so the pill is re-measured every frame for a bit rather than positioned just once
  function trackSpecIndicator(btn,duration=500){
    const start=performance.now();

    (function step(now){
      moveSpecIndicator(btn);
      if(now-start<duration)requestAnimationFrame(step);
    })(start);
  }

  function setActiveSpec(btn){
    if(btn.classList.contains("is-active"))return;

    lappySpecBtns.forEach(b=>b.classList.toggle("is-active",b===btn));
    trackSpecIndicator(btn);

    const nextImage=btn.dataset.image;
    if(nextImage && lappyConfiguratorImg.getAttribute("src")!==nextImage){
      lappyConfiguratorImg.style.opacity="0";
      setTimeout(()=>{
        lappyConfiguratorImg.src=nextImage;
        lappyConfiguratorImg.style.opacity="1";
      },250);
    }
  }

  lappySpecBtns.forEach(btn=>btn.addEventListener("click",()=>setActiveSpec(btn)));

  const initialSpecBtn=document.querySelector(".lappy-spec-btn.is-active")||lappySpecBtns[0];
  requestAnimationFrame(()=>moveSpecIndicator(initialSpecBtn));
  addEventListener("resize",()=>{
    const current=document.querySelector(".lappy-spec-btn.is-active")||lappySpecBtns[0];
    moveSpecIndicator(current);
  });
}

// footer back-to-top
const footerTop=document.getElementById("footerTop");
if(footerTop){
  footerTop.addEventListener("click",()=>{
    scrollTo({top:0,behavior:"smooth"});
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


// scroll-driven background zones: hero+product = orange, about = purple, footer = black.
// html[data-zone] (read by Style.css) drives --line/buttons/nav/footer; the canvas fill
// itself is interpolated here so the color wash is smooth instead of a hard cut.
const zoneSections={
  productWrap:document.getElementById("productWrap"),
  aboutWrap:document.querySelector(".about-wrap"),
  aboutBanner:document.querySelector(".about-banner"),
  footer:document.querySelector(".site-footer")
};

function hexToRgb(hex){
  const n=parseInt(hex.trim().replace("#",""),16);
  return[(n>>16)&255,(n>>8)&255,n&255];
}

const zoneRootStyle=getComputedStyle(document.documentElement);
const zoneColors={
  orange:hexToRgb(zoneRootStyle.getPropertyValue("--accent")),
  purple:hexToRgb(zoneRootStyle.getPropertyValue("--accent-2")),
  black:hexToRgb(zoneRootStyle.getPropertyValue("--zone-dark"))
};

// transition midpoints, in document Y coordinates; remeasured whenever layout can shift.
// zoneT0 holds black through the page's resting/loaded state, igniting to orange shortly
// after the hero's scroll-hijack actually starts engaging, rather than being orange instantly
let zoneT0=0,zoneT1=0,zoneT2=0,docMaxScroll=0;
function measureZones(){
  const{productWrap,aboutWrap,aboutBanner,footer}=zoneSections;
  if(!heroWrap||!productWrap||!aboutWrap||!aboutBanner||!footer)return;

  const productBottom=productWrap.offsetTop+productWrap.offsetHeight;
  const bannerCenter=aboutBanner.offsetTop+aboutBanner.offsetHeight/2;

  zoneT0=heroWrap.offsetTop+innerHeight;
  zoneT1=(productBottom+aboutWrap.offsetTop)/2;
  zoneT2=bannerCenter;
  docMaxScroll=Math.max(0,document.documentElement.scrollHeight-innerHeight);
}
measureZones();
addEventListener("resize",measureZones);
addEventListener("load",measureZones);

// footer's own content is often too short for the "look ahead" sample below to ever
// reach zoneT2 before scrolling bottoms out, so the page-bottom case is guaranteed here
function isAtBottom(scrollTop){
  return scrollTop>=docMaxScroll-1;
}

function zoneNameAt(y,scrollTop){
  if(isAtBottom(scrollTop))return"black";
  if(y<zoneT0)return"black";
  if(y<zoneT1)return"orange";
  if(y<zoneT2)return"purple";
  return"black";
}

function lerpColor(c1,c2,t){
  t=Math.max(0,Math.min(1,t));
  return[c1[0]+(c2[0]-c1[0])*t,c1[1]+(c2[1]-c1[1])*t,c1[2]+(c2[2]-c1[2])*t];
}

function targetZoneColor(y,scrollTop){
  if(isAtBottom(scrollTop))return zoneColors.black;

  const band=Math.max(innerHeight*.3,150);

  if(y<zoneT0-band)return zoneColors.black;
  if(y<zoneT0+band)return lerpColor(zoneColors.black,zoneColors.orange,(y-(zoneT0-band))/(2*band));
  if(y<zoneT1-band)return zoneColors.orange;
  if(y<zoneT1+band)return lerpColor(zoneColors.orange,zoneColors.purple,(y-(zoneT1-band))/(2*band));
  if(y<zoneT2-band)return zoneColors.purple;
  if(y<zoneT2+band)return lerpColor(zoneColors.purple,zoneColors.black,(y-(zoneT2-band))/(2*band));
  return zoneColors.black;
}

let bgNow=zoneColors.black.slice();


// animation loop
function animate(time){
  mouse.x+=(mouse.targetX-mouse.x)*.09;
  mouse.y+=(mouse.targetY-mouse.y)*.09;

  const zoneSampleY=scrollY+innerHeight*.4;

  const zoneNow=zoneNameAt(zoneSampleY,scrollY);
  if(document.documentElement.dataset.zone!==zoneNow)
    document.documentElement.dataset.zone=zoneNow;

  const bgTarget=targetZoneColor(zoneSampleY,scrollY);
  bgNow[0]+=(bgTarget[0]-bgNow[0])*.08;
  bgNow[1]+=(bgTarget[1]-bgNow[1])*.08;
  bgNow[2]+=(bgTarget[2]-bgNow[2])*.08;

  ctx.fillStyle=`rgb(${bgNow[0]|0}, ${bgNow[1]|0}, ${bgNow[2]|0})`;
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

// easter egg typing "deltarune" or "undertale" 
const dbOverlay=document.getElementById("deltaruneBattle");
const dbText=document.getElementById("deltaruneText");
const dbAudio=document.getElementById("deltaruneAudio");
const dbClose=document.getElementById("deltaruneClose");
const dbMenu=document.getElementById("dbMenu");
const dbHp=document.getElementById("dbHp");
const dbHpName=document.getElementById("dbHpName");
const dbHpFill=document.getElementById("dbHpFill");
const dbHpNum=document.getElementById("dbHpNum");
const dbBoard=document.getElementById("dbBoard");
const dbHeart=document.getElementById("dbHeart");
const dbEnemyImg=document.getElementById("dbEnemyImg");

if(dbOverlay && dbText && dbAudio && dbClose && dbMenu && dbHp && dbHpName && dbHpFill && dbHpNum && dbBoard && dbHeart && dbEnemyImg){
  const dbMonsters={
    deltarune:{
      trigger:"deltarune",
      enemyImg:"Assets/Easter%20Eggs/Deltarune%20Undertale/Lancer.webp",
      enemyAlt:"Lancer",
      heroName:"KRIS",
      theme:"Assets/Easter%20Eggs/Deltarune%20Undertale/Lancer%20vs%20theme.mp3",
      introLines:[
        "* LANCER blocks the way!",
        "* \"IT'S ME, LANCER! PREPARE FOR A BATTLE ROYALE!\"",
        "* (He does not seem all that threatening.)"
      ],
      actLines:[
        "* You check LANCER.",
        "* ATK 1 DEF 1.",
        "* He's a great kid, and he's trying his best."
      ],
      itemLines:[
        "* You check your inventory.",
        "* You have no items.",
        "* (You left them at home. Rookie mistake.)"
      ],
      outroLines:[
        "* LANCER's Lance-tastic assault comes to an end!",
        "* LANCER: \"Wow!! You're really good at this!\"",
        "* LANCER: \"...Can we be friends now?\""
      ],
      mercyLines:[
        "* You spared LANCER.",
        "* LANCER: \"Yay!! Best friends forever!!\""
      ]
    },
    undertale:{
      trigger:"undertale",
      enemyImg:"Assets/Easter%20Eggs/Deltarune%20Undertale/Sans.webp",
      enemyAlt:"Sans",
      heroName:"FRISK",
      theme:"Assets/Easter%20Eggs/Deltarune%20Undertale/MEGALOVANIA.mp3",
      introLines:[
        "* SANS is watching you very closely.",
        "* SANS: \"heh. so you're the one everybody's talking about.\"",
        "* SANS: \"you're gonna have a bad time.\""
      ],
      actLines:[
        "* You check SANS.",
        "* ATK ??? DEF ???",
        "* (The underlined zero is oddly menacing.)"
      ],
      itemLines:[
        "* You check your inventory.",
        "* You have no items.",
        "* (Shoulda brought a Cinnamon Bunny.)"
      ],
      outroLines:[
        "* Somehow, you're still standing.",
        "* SANS: \"heh. not bad, kid.\"",
        "* SANS: \"...guess this is a good a time as any for a little break.\""
      ],
      mercyLines:[
        "* You spared SANS.",
        "* SANS: \"kid, that's not really how this works. but nice try.\""
      ]
    }
  };

  let dbCurrentMonster=dbMonsters.deltarune;

  const BOARD_W=300;
  const BOARD_H=200;
  const HEART_HALF=8;
  const HP_MAX=20;
  const ATTACK_DURATION=8000;

  let dbKeyBuffer="";
  let dbTypingTimer=null;
  let dbKeysHeld={};
  let dbBullets=[];
  let dbSpawnTimer=null;
  let dbAttackRunning=false;
  let dbAttackStart=0;
  let dbLastFrame=0;
  let dbInvuln=false;
  let dbHeartX=BOARD_W/2;
  let dbHeartY=BOARD_H/2;
  let dbHpCurrent=HP_MAX;

  function dbType(lines,onDone){
    clearTimeout(dbTypingTimer);
    let lineIndex=0;
    let charIndex=0;
    dbText.textContent="";

    function step(){
      const current=lines[lineIndex];
      dbText.textContent=lines.slice(0,lineIndex).join("\n")+(lineIndex?"\n":"")+current.slice(0,charIndex+1);
      charIndex++;

      if(charIndex<current.length){
        dbTypingTimer=setTimeout(step,28);
      }else if(lineIndex<lines.length-1){
        lineIndex++;
        charIndex=0;
        dbTypingTimer=setTimeout(step,600);
      }else if(onDone){
        dbTypingTimer=setTimeout(onDone,700);
      }
    }
    step();
  }

  function dbUpdateHp(){
    dbHpFill.style.width=(dbHpCurrent/HP_MAX*100)+"%";
    dbHpNum.textContent=dbHpCurrent+" / "+HP_MAX;
  }

  function dbHit(){
    dbInvuln=true;
    dbHpCurrent=Math.max(0,dbHpCurrent-2);
    dbUpdateHp();
    dbHeart.classList.add("db-hit");
    dbOverlay.classList.add("db-screen-shake");
    setTimeout(()=>{dbHeart.classList.remove("db-hit");dbInvuln=false;},700);
    setTimeout(()=>{dbOverlay.classList.remove("db-screen-shake");},400);
  }

  function dbSpawnBullet(){
    const pattern=Math.floor(Math.random()*3);
    const speed=.09+Math.random()*.05;
    let x,y,vx,vy;

    if(pattern===0){
      x=-10;y=20+Math.random()*(BOARD_H-40);vx=speed;vy=0;
    }else if(pattern===1){
      x=BOARD_W+10;y=20+Math.random()*(BOARD_H-40);vx=-speed;vy=0;
    }else{
      x=20+Math.random()*(BOARD_W-40);y=-10;vx=0;vy=speed;
    }

    const el=document.createElement("div");
    el.className="db-bullet";
    el.style.left=x+"px";
    el.style.top=y+"px";
    dbBoard.appendChild(el);
    dbBullets.push({el,x,y,vx,vy,r:6});
  }

  function dbAttackLoop(now){
    if(!dbAttackRunning)return;

    const dt=Math.min(32,now-(dbLastFrame||now));
    dbLastFrame=now;

    const speed=.28;
    let dx=0,dy=0;
    if(dbKeysHeld.arrowup||dbKeysHeld.w)dy-=1;
    if(dbKeysHeld.arrowdown||dbKeysHeld.s)dy+=1;
    if(dbKeysHeld.arrowleft||dbKeysHeld.a)dx-=1;
    if(dbKeysHeld.arrowright||dbKeysHeld.d)dx+=1;

    if(dx||dy){
      const len=Math.hypot(dx,dy)||1;
      dbHeartX+=(dx/len)*speed*dt;
      dbHeartY+=(dy/len)*speed*dt;
    }
    dbHeartX=Math.max(HEART_HALF,Math.min(BOARD_W-HEART_HALF,dbHeartX));
    dbHeartY=Math.max(HEART_HALF,Math.min(BOARD_H-HEART_HALF,dbHeartY));
    dbHeart.style.left=dbHeartX+"px";
    dbHeart.style.top=dbHeartY+"px";

    for(let i=dbBullets.length-1;i>=0;i--){
      const b=dbBullets[i];
      b.x+=b.vx*dt;
      b.y+=b.vy*dt;
      b.el.style.left=b.x+"px";
      b.el.style.top=b.y+"px";

      if(b.x<-20||b.x>BOARD_W+20||b.y<-20||b.y>BOARD_H+20){
        b.el.remove();
        dbBullets.splice(i,1);
        continue;
      }

      if(!dbInvuln && Math.hypot(b.x-dbHeartX,b.y-dbHeartY)<b.r+HEART_HALF)dbHit();
    }

    if(now-dbAttackStart>=ATTACK_DURATION){
      dbEndAttack();
      return;
    }

    requestAnimationFrame(dbAttackLoop);
  }

  function dbStartAttack(){
    dbBoard.hidden=false;
    dbHp.hidden=false;
    dbHeartX=BOARD_W/2;
    dbHeartY=BOARD_H/2;
    dbHeart.style.left=dbHeartX+"px";
    dbHeart.style.top=dbHeartY+"px";
    dbHpCurrent=HP_MAX;
    dbUpdateHp();
    dbKeysHeld={};
    dbInvuln=false;
    dbBullets.forEach(b=>b.el.remove());
    dbBullets=[];
    dbAttackStart=performance.now();
    dbLastFrame=0;
    dbAttackRunning=true;
    clearInterval(dbSpawnTimer);
    dbSpawnTimer=setInterval(dbSpawnBullet,450);
    requestAnimationFrame(dbAttackLoop);
  }

  function dbEndAttack(){
    dbAttackRunning=false;
    clearInterval(dbSpawnTimer);
    dbBullets.forEach(b=>b.el.remove());
    dbBullets=[];
    dbBoard.hidden=true;
    dbHp.hidden=true;
    dbType(dbCurrentMonster.outroLines);
  }

  function dbOpen(monster){
    dbCurrentMonster=monster;
    dbEnemyImg.src=monster.enemyImg;
    dbEnemyImg.alt=monster.enemyAlt;
    dbHpName.textContent=monster.heroName;

    dbOverlay.hidden=false;
    dbOverlay.setAttribute("aria-hidden","false");
    dbBoard.hidden=true;
    dbHp.hidden=true;
    dbMenu.hidden=true;
    dbAudio.src=monster.theme;
    dbAudio.currentTime=0;
    dbAudio.play().catch(()=>{});
    dbType(monster.introLines,()=>{dbMenu.hidden=false;});
  }

  function dbCloseBattle(){
    dbOverlay.hidden=true;
    dbOverlay.setAttribute("aria-hidden","true");
    dbAudio.pause();
    dbAudio.currentTime=0;
    clearTimeout(dbTypingTimer);
    dbAttackRunning=false;
    clearInterval(dbSpawnTimer);
    dbBullets.forEach(b=>b.el.remove());
    dbBullets=[];
    dbBoard.hidden=true;
    dbHp.hidden=true;
    dbMenu.hidden=true;
    dbKeysHeld={};
  }

  dbMenu.addEventListener("click",e=>{
    const btn=e.target.closest("button[data-act]");
    if(!btn)return;
    dbMenu.hidden=true;

    if(btn.dataset.act==="fight")dbStartAttack();
    else if(btn.dataset.act==="act")dbType(dbCurrentMonster.actLines,()=>{dbMenu.hidden=false;});
    else if(btn.dataset.act==="item")dbType(dbCurrentMonster.itemLines,()=>{dbMenu.hidden=false;});
    else if(btn.dataset.act==="mercy")dbType(dbCurrentMonster.mercyLines);
  });

  const dbMoveKeys=["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"];

  addEventListener("keydown",e=>{
    if(!dbOverlay.hidden){
      if(e.key==="Escape"){dbCloseBattle();return;}

      const key=e.key.toLowerCase();
      if(dbAttackRunning && dbMoveKeys.includes(key)){
        dbKeysHeld[key]=true;
        e.preventDefault();
      }
      return;
    }

    const target=e.target;
    if(target && (target.tagName==="INPUT"||target.tagName==="TEXTAREA"||target.isContentEditable))return;

    if(e.key.length!==1)return;
    dbKeyBuffer=(dbKeyBuffer+e.key).toLowerCase().slice(-12);

    for(const key in dbMonsters){
      if(dbKeyBuffer.endsWith(dbMonsters[key].trigger)){
        dbOpen(dbMonsters[key]);
        dbKeyBuffer="";
        break;
      }
    }
  });

  addEventListener("keyup",e=>{
    dbKeysHeld[e.key.toLowerCase()]=false;
  });

  dbClose.addEventListener("click",dbCloseBattle);
  dbOverlay.addEventListener("click",e=>{if(e.target===dbOverlay)dbCloseBattle();});
}

// easter egg: click the hero laptop to play Flappy Squircle
const flappyTrigger=document.getElementById("heroLaptop");
const flappyGame=document.getElementById("flappyGame");
const flappyCanvas=document.getElementById("flappyCanvas");
const flappyScoreEl=document.getElementById("flappyScore");
const flappyBestEl=document.getElementById("flappyBest");
const flappyMsg=document.getElementById("flappyMsg");
const flappyClose=document.getElementById("flappyClose");

if(flappyTrigger && flappyGame && flappyCanvas && flappyScoreEl && flappyBestEl && flappyMsg && flappyClose){
  const flCtx=flappyCanvas.getContext("2d");
  const FL_W=flappyCanvas.width;
  const FL_H=flappyCanvas.height;
  const FL_BIRD=42;
  const FL_GRAVITY=1500;
  const FL_FLAP_VEL=-380;
  const FL_PIPE_W=64;
  const FL_PIPE_GAP=150;
  const FL_PIPE_SPEED=170;
  const FL_PIPE_INTERVAL=1300;

  const flBirdImg=new Image();
  flBirdImg.src="Assets/Logos/Logo.png";
  const flBgImg=new Image();
  flBgImg.src="Assets/Easter%20Eggs/Flappy%20Bird/BG.png";
  const flPipeImg=new Image();
  flPipeImg.src="Assets/Easter%20Eggs/Flappy%20Bird/Pipe.png";

  let flState="idle"; // idle | playing | over
  let flBirdY,flBirdVel,flBirdRot,flPipes,flScore,flBest=0,flLast,flPipeTimer,flRaf;

  function flReset(){
    flBirdY=FL_H/2;
    flBirdVel=0;
    flBirdRot=0;
    flPipes=[];
    flScore=0;
    flPipeTimer=0;
    flappyScoreEl.textContent="0";
  }

  function flSpawnPipe(){
    const margin=60;
    const gapY=margin+Math.random()*(FL_H-margin*2-FL_PIPE_GAP);
    flPipes.push({x:FL_W,gapY,passed:false});
  }

  function flDraw(){
    flCtx.clearRect(0,0,FL_W,FL_H);

    if(flBgImg.complete && flBgImg.naturalWidth){
      const scale=Math.max(FL_W/flBgImg.naturalWidth,FL_H/flBgImg.naturalHeight);
      const w=flBgImg.naturalWidth*scale,h=flBgImg.naturalHeight*scale;
      flCtx.drawImage(flBgImg,(FL_W-w)/2,(FL_H-h)/2,w,h);
    }else{
      const sky=flCtx.createLinearGradient(0,0,0,FL_H);
      sky.addColorStop(0,"#7fd4ff");
      sky.addColorStop(1,"#d8f4ff");
      flCtx.fillStyle=sky;
      flCtx.fillRect(0,0,FL_W,FL_H);
    }

    for(const p of flPipes){
      const bottomH=FL_H-(p.gapY+FL_PIPE_GAP);
      if(flPipeImg.complete && flPipeImg.naturalWidth){
        flCtx.save();
        flCtx.translate(p.x,p.gapY);
        flCtx.scale(1,-1);
        flCtx.drawImage(flPipeImg,0,0,FL_PIPE_W,p.gapY);
        flCtx.restore();
        flCtx.drawImage(flPipeImg,p.x,p.gapY+FL_PIPE_GAP,FL_PIPE_W,bottomH);
      }else{
        flCtx.fillStyle="#3cb043";
        flCtx.strokeStyle="#1f6b26";
        flCtx.lineWidth=3;
        flCtx.fillRect(p.x,0,FL_PIPE_W,p.gapY);
        flCtx.strokeRect(p.x,0,FL_PIPE_W,p.gapY);
        flCtx.fillRect(p.x,p.gapY+FL_PIPE_GAP,FL_PIPE_W,bottomH);
        flCtx.strokeRect(p.x,p.gapY+FL_PIPE_GAP,FL_PIPE_W,bottomH);
      }
    }

    flCtx.save();
    flCtx.translate(FL_W/2,flBirdY);
    flCtx.rotate(flBirdRot);
    if(flBirdImg.complete && flBirdImg.naturalWidth){
      const ratio=flBirdImg.naturalWidth/flBirdImg.naturalHeight;
      const w=ratio>=1?FL_BIRD:FL_BIRD*ratio;
      const h=ratio>=1?FL_BIRD/ratio:FL_BIRD;
      flCtx.drawImage(flBirdImg,-w/2,-h/2,w,h);
    }else{
      flCtx.fillStyle="#ffd23f";
      flCtx.fillRect(-FL_BIRD/2,-FL_BIRD/2,FL_BIRD,FL_BIRD);
    }
    flCtx.restore();
  }

  function flGameOver(){
    flState="over";
    cancelAnimationFrame(flRaf);
    flBest=Math.max(flBest,flScore);
    flappyBestEl.textContent="Best: "+flBest;
    flappyMsg.textContent="Game Over — Score "+flScore+" — click to retry";
    flappyMsg.hidden=false;
  }

  function flLoop(now){
    const dt=Math.max(0,Math.min(.032,(now-flLast)/1000));
    flLast=now;

    flBirdVel+=FL_GRAVITY*dt;
    flBirdY+=flBirdVel*dt;
    flBirdRot=Math.max(-.5,Math.min(1.2,flBirdVel/500));

    flPipeTimer+=dt*1000;
    if(flPipeTimer>FL_PIPE_INTERVAL){
      flPipeTimer=0;
      flSpawnPipe();
    }

    const birdLeft=FL_W/2-FL_BIRD/2;
    const birdRight=FL_W/2+FL_BIRD/2;

    for(const p of flPipes){
      p.x-=FL_PIPE_SPEED*dt;
      if(!p.passed && p.x+FL_PIPE_W<birdLeft){
        p.passed=true;
        flScore++;
        flappyScoreEl.textContent=String(flScore);
      }
    }
    flPipes=flPipes.filter(p=>p.x+FL_PIPE_W>-10);

    const bTop=flBirdY-FL_BIRD/2;
    const bBottom=flBirdY+FL_BIRD/2;

    let dead=bTop<0 || bBottom>FL_H;
    if(!dead){
      for(const p of flPipes){
        if(birdRight>p.x && birdLeft<p.x+FL_PIPE_W){
          if(bTop<p.gapY || bBottom>p.gapY+FL_PIPE_GAP){dead=true;break;}
        }
      }
    }

    flDraw();

    if(dead){
      flGameOver();
      return;
    }

    flRaf=requestAnimationFrame(flLoop);
  }

  function flStart(){
    flState="playing";
    flappyMsg.hidden=true;
    flLast=performance.now();
    flRaf=requestAnimationFrame(flLoop);
  }

  function flFlap(){
    if(flState==="idle"){flStart();flBirdVel=FL_FLAP_VEL;}
    else if(flState==="playing")flBirdVel=FL_FLAP_VEL;
    else if(flState==="over"){flReset();flStart();flBirdVel=FL_FLAP_VEL;}
  }

  function flOpen(){
    flReset();
    flState="idle";
    flappyMsg.textContent="Click or press Space to flap";
    flappyMsg.hidden=false;
    flappyBestEl.textContent="Best: "+flBest;
    flappyGame.hidden=false;
    flappyGame.setAttribute("aria-hidden","false");
    flDraw();
  }

  function flClose(){
    flappyGame.hidden=true;
    flappyGame.setAttribute("aria-hidden","true");
    cancelAnimationFrame(flRaf);
    flState="idle";
  }

  flappyTrigger.addEventListener("click",flOpen);
  flappyCanvas.addEventListener("click",flFlap);
  flappyClose.addEventListener("click",flClose);
  flappyGame.addEventListener("click",e=>{if(e.target===flappyGame)flClose();});

  addEventListener("keydown",e=>{
    if(flappyGame.hidden)return;
    if(e.key==="Escape"){flClose();return;}
    if(e.code==="Space"){e.preventDefault();flFlap();}
  });
}
})();