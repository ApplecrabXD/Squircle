// You are not expected to understand this 
 
 (() => {

const splash=document.getElementById("splash");
const loadingBar=document.querySelector(".loading-bar");
const splashBlocks=document.querySelector(".building-blocks");
const navLogo=document.querySelector(".nav-logo");
const navBlocks=document.querySelector(".nav-building-blocks");

// splash screen

// skip the intro if it already played this tab
const introKey="squircleIntroSeen";
let introSeen=document.documentElement.classList.contains("intro-seen");
try{introSeen=introSeen || sessionStorage.getItem(introKey)==="1";}catch(e){}

if(splash && loadingBar && introSeen){
  splash.style.display="none";
  splash.classList.add("loaded");

}else if(splash && loadingBar){
  try{sessionStorage.setItem(introKey,"1");}catch(e){}

  const minimumTime=1000; // ms, the intro plays straight after this now so the loader only needs to be up long enough to see
  const maximumTime=10000; // ms, safety net, nobody stays on the loading screen longer than this
  const introTime=6000; // ms, the intro hands off at about 4s, if it's still going after this it's frozen
  let startTime=performance.now();

  let pageLoaded=false;
  let loadingFinished=false;
  let splashDone=false; // heading to the nav (or skipped), nothing else touches the splash after this
  let introTimeline=null;
  let safetyNet=null; // skip timer, see skipSplash

  // webkit heads up (the head script turns it on), the loader waits till it's closed
  // an old cached Style.css leaves it hidden (html attribute), so don't wait on a button nobody can read
  const notice=document.getElementById("engineNotice");
  const noticeBtn=notice && notice.querySelector("button");
  let noticeOpen=!!noticeBtn && document.documentElement.classList.contains("engine-notice-on") && getComputedStyle(notice).display!=="none";

  // preload the intro fonts now
  const introFonts=document.fonts ? Promise.all([document.fonts.load('300 1em "azo-sans-web"'),document.fonts.load('1em "SuperMalibu"')]).catch(()=>{}) : Promise.resolve();


  // Loading
  function updateLoading(){
    if(pageLoaded || splashDone){loadingBar.style.width="100%"; return;}

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
  if(splashDone)return; splashDone=true;
  if(!splashBlocks || !navBlocks){ splash.classList.add("loaded"); splash.style.display="none"; return; }

  // hand the logo back to css for the flight
  if(window.gsap) gsap.set(splashBlocks,{clearProps:"transform"});
  splash.classList.remove("intro");

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

  // blocks stop dancing for the flight
  splashBlocks.querySelectorAll("img").forEach(block=>{block.style.animation="none";});

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

  // osu!lazer style intro, any click or key skips it
  function playIntro(){
    if(splashDone)return; // the safety net already skipped it
    const center=document.querySelector(".splash-center");
    const loadContainer=document.querySelector(".loading-container");
    const blocks=splashBlocks ? [".block-orange",".block-gray",".block-purple",".block-white"].map(c=>splashBlocks.querySelector(c)) : [];

    // no gsap or reduced motion, straight to the nav
    if(!window.gsap || matchMedia("(prefers-reduced-motion: reduce)").matches || !navBlocks || !center || !loadContainer || blocks.length!==4 || blocks.includes(null)){
      moveAnimationToNavbar();
      return;
    }

    splash.classList.add("intro");

    // beat timings in seconds, borrowed from osu!lazer
    const at={wel:.85,welcome:1.05,welcomeTo:1.35,squircle:1.55,glitch:1.71,row1:2.1,row2:2.3,row3:2.5,impact:2.73,reveal:3.45};

    // size unit so everything scales with the screen
    const u=Math.min(innerWidth/950,innerHeight/380,1.5);
    const rootStyle=getComputedStyle(document.documentElement);
    const palette=["--accent","--accent-2","--accent-3","--whiteline"].map(v=>rootStyle.getPropertyValue(v).trim());

    const welcome=document.createElement("p");
    welcome.className="splash-welcome";
    welcome.setAttribute("aria-hidden","true");
    welcome.innerHTML='<span class="splash-welcome-text"></span>';
    const welcomeText=welcome.firstChild;

    // shapes for the glitch
    const glitch=document.createElement("div");
    glitch.className="splash-glitch";
    glitch.setAttribute("aria-hidden","true");

    for(let i=0;i<24;i++){
      const shape=document.createElement("span");
      const size=(16+Math.random()*110)*Math.min(1,.4+u*.5);
      const color=palette[i%palette.length];

      shape.style.width=shape.style.height=size+"px";
      shape.style.borderRadius=i%2 ? "50%" : "22%";
      if(i%3) shape.style.border=`2px solid ${color}`;
      else shape.style.background=color;

      glitch.append(shape);
    }

    const flash=document.createElement("div");
    flash.className="splash-flash";
    flash.setAttribute("aria-hidden","true");

    splash.prepend(glitch);
    splash.append(welcome,flash);

    // diamond outline, one draws in, one ripples
    const ringSvg='<svg class="splash-ring" viewBox="0 0 1280 1024" aria-hidden="true"><path pathLength="100" transform="rotate(45 640 512)" d="M360 112H920A120 120 0 0 1 1040 232V792A120 120 0 0 1 920 912H360A120 120 0 0 1 240 792V232A120 120 0 0 1 360 112Z"/></svg>';
    splashBlocks.insertAdjacentHTML("beforeend",ringSvg+ringSvg);
    const [ring,ripple]=splashBlocks.querySelectorAll(".splash-ring");
    const ringPath=ring.querySelector("path");

    const tl=gsap.timeline();
    introTimeline=tl;
    armSafetyNet(introTime); // the intro gets its own clock so a slow load still sees all of it

    function skipIntro(){if(tl.time()<at.reveal) tl.seek("reveal");}
    splash.addEventListener("pointerdown",skipIntro);
    addEventListener("keydown",skipIntro);

    // loader gets sucked into a point
    tl.to(loadContainer,{width:0,duration:.3,ease:"power3.in"},.3)
      .to(splashBlocks,{scale:0,duration:.42,ease:"back.in(2.2)"},.25)
      .set(blocks,{animation:"none"},.7);

    // welcome to squircle, a chunk a beat
    const welcomeSize=parseFloat(getComputedStyle(welcomeText).fontSize);

    tl.set(welcome,{autoAlpha:1},at.wel)
      .fromTo(welcomeText,{letterSpacing:welcomeSize*.16},{letterSpacing:welcomeSize*.4,duration:at.row1-at.wel,ease:"none",autoRound:false,immediateRender:false},at.wel);

    [[at.wel,"wel"],[at.welcome,"welcome"],[at.welcomeTo,"welcome to"],[at.squircle,"welcome to <span>squircle</span>"]].forEach(([t,text])=>{
      tl.call(()=>{welcomeText.innerHTML=text;},null,t)
        .fromTo(welcomeText,{scale:1.08},{scale:1,duration:.18,ease:"power2.out",immediateRender:false},t);
    });

    // glitch shapes + split colour text
    const shapes=[...glitch.children];
    let nextShape=0;

    for(let t=at.glitch;t<at.row1-.03;t+=.035){
      for(let i=0;i<3;i++){
        const shape=shapes[nextShape++%shapes.length];
        tl.set(shape,{x:Math.random()*innerWidth-60,y:Math.random()*innerHeight-60,rotation:Math.random()<.5?0:45,autoAlpha:.35+Math.random()*.65},t)
          .set(shape,{autoAlpha:0},Math.min(t+.05+Math.random()*.06,at.row1));
      }

      const split=(1+Math.random()*3)*Math.max(u,.6);
      tl.set(welcomeText,{x:(Math.random()-.5)*8,textShadow:`${split}px 0 ${palette[0]}, ${-split}px 0 ${palette[1]}`},t);
    }

    tl.set(welcome,{autoAlpha:0},at.row1)
      .set(welcomeText,{x:0,textShadow:"none"},at.row1);

    // blocks line up like osu! ruleset icons
    const box=splashBlocks.offsetWidth;
    const shapeSize=[.5224,.4315,.2521,.1398]; // orange square, gray circle, purple square, white circle
    const glowColor=["rgba(204,51,15,.8)","rgba(237,237,237,.35)","rgba(142,13,171,.85)","rgba(237,237,237,.6)"];

    tl.set(splashBlocks,{scale:1},at.row1);

    // [beat, icon size, gap, punch] in u
    [[at.row1,52,130,1.1],[at.row2,104,40,1.1],[at.row3,190,16,1]].forEach(([t,size,gap,punch])=>{
      const s=size*u;
      const scaleOf=i=>s/(shapeSize[i]*box);

      tl.set(blocks,{
        x:i=>(i-1.5)*(s+gap*u),
        scale:i=>scaleOf(i)*punch,
        rotation:i=>i===0?-45:0,
        // undo the drop-shadow scaling
        filter:i=>`drop-shadow(0 0 ${(s*.22/scaleOf(i)).toFixed(1)}px ${glowColor[i]})`
      },t);

      if(punch!==1) tl.to(blocks,{scale:scaleOf,duration:.16,ease:"power2.out"},t);
    });

    // slam into the logo
    tl.to(blocks,{x:0,scale:1,rotation:i=>i===2?90:0,duration:at.impact-at.row3-.04,ease:"power3.in"},at.row3+.04)
      .set(blocks,{filter:"none"},at.impact)
      .set(splashBlocks,{scale:1.12},at.impact)
      .to(splashBlocks,{scale:1,duration:.3,ease:"power3.out"},at.impact)
      .set(center,{x:7*u,y:-5*u},at.impact)
      .set(center,{x:-5*u,y:4*u},at.impact+.04)
      .set(center,{x:3*u,y:-2*u},at.impact+.08)
      .set(center,{x:0,y:0},at.impact+.12);

    // outline draws round the logo
    tl.set(ring,{autoAlpha:1},at.impact)
      .fromTo(ringPath,{strokeDashoffset:100},{strokeDashoffset:0,duration:at.reveal-at.impact-.05,ease:"power2.inOut",immediateRender:false},at.impact)
      .to(splashBlocks,{scale:.9,duration:at.reveal-at.impact-.3,ease:"power2.in"},at.impact+.3);

    // flash, then show the page
    tl.addLabel("reveal",at.reveal)
      .set(flash,{autoAlpha:1},"reveal")
      .to(flash,{autoAlpha:0,duration:1,ease:"power2.out"},"reveal")
      .set(splash,{backgroundColor:"transparent"},"reveal")
      .set(splashBlocks,{scale:1.18},"reveal")
      .to(splashBlocks,{scale:1,duration:.6,ease:"back.out(2.5)"},"reveal")
      .to(ring,{scale:1.6,autoAlpha:0,duration:.8,ease:"power2.out"},"reveal")
      .set(ripple,{autoAlpha:.6},"reveal")
      .to(ripple,{scale:2.4,autoAlpha:0,duration:1.1,ease:"power2.out"},"reveal")
      .call(()=>{
        splash.removeEventListener("pointerdown",skipIntro);
        removeEventListener("keydown",skipIntro);
        moveAnimationToNavbar();
      },null,at.reveal+.65);
  }

  // end splash screen
  function finishSplash(){
    if(!pageLoaded || noticeOpen || loadingFinished)return; loadingFinished=true;

    loadingBar.style.width="100%";

    // don't let a slow font hold up the site
    Promise.race([introFonts,new Promise(done=>setTimeout(done,2000))]).then(()=>{
      setTimeout(playIntro,Math.max(0,minimumTime-(performance.now()-startTime)));
    });
  }

  // safety net: still on the splash when the clock runs out, skip to the site
  function armSafetyNet(ms){
    clearTimeout(safetyNet);
    safetyNet=setTimeout(skipSplash,ms);
  }
  function skipSplash(){
    if(splashDone)return;
    // background tab, gsap holds the intro till they look so the clock waits too
    if(introTimeline && document.hidden){
      document.addEventListener("visibilitychange",()=>armSafetyNet(introTime),{once:true});
      return;
    }
    loadingFinished=true; // a late load event won't start the intro now
    try{
      if(introTimeline)introTimeline.progress(1); // jumping to the end hands off to the nav like normal
      if(!splashDone)moveAnimationToNavbar();
    }catch(e){
      // whatever broke, just get the splash out of the way
      splashDone=true;
      splash.classList.add("loaded");
      splash.style.display="none";
    }
  }

  // closing the heads up hands over to the loader, and it stays closed after that
  if(noticeOpen){
    noticeBtn.focus({preventScroll:true}); // enter/space closes it, safari won't tab to buttons
    noticeBtn.addEventListener("click",()=>{
      try{localStorage.setItem("squircleEngineNotice","1");}catch(e){}
      document.documentElement.classList.remove("engine-notice-on");
      noticeBtn.blur();
      noticeOpen=false;
      startTime=performance.now(); // the loader still gets its moment
      armSafetyNet(maximumTime); // and the safety net clock starts now
      finishSplash();
    },{once:true});
  }
  // no heads up, the safety net clock started with the page
  else armSafetyNet(Math.max(0,maximumTime-performance.now()));

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

// buy pill drops in once the hero scrolls away
const navbar=document.querySelector(".navbar");
const navBuy=document.getElementById("navBuy");
const navBuyHero=document.querySelector(".lappy-hero");
if(navbar && navBuy && navBuyHero && "IntersectionObserver" in window){
  new IntersectionObserver(([entry])=>{
    navbar.classList.toggle("nav-buy-shown",!entry.isIntersecting);
  },{rootMargin:"-30% 0px 0px 0px"}).observe(navBuyHero);
}

// hamburger menu
const navMenuBtn=document.querySelector(".nav-menu");
const navMenuPanel=document.getElementById("navMenuPanel");

if(navbar && navMenuBtn && navMenuPanel){
  const menuIndicator=navMenuPanel.querySelector(".nav-menu-indicator");
  const menuLinks=Array.from(navMenuPanel.querySelectorAll(".nav-menu-link"));
  let menuIndicatorLink=null;

  // page marker
  const pagePath=path=>decodeURI(path).replace(/(index)?\.html$/,"");
  const currentMenuLink=menuLinks.find(link=>pagePath(link.pathname)===pagePath(location.pathname)) || null;
  if(currentMenuLink)currentMenuLink.setAttribute("aria-current","page");

  // number rows so css can stagger them
  navMenuPanel.querySelectorAll(".nav-menu-heading, .nav-menu-link").forEach((row,i)=>row.style.setProperty("--i",i));

  // slide the pill to a link
  function placeMenuIndicator(link,instant){
    menuIndicatorLink=link;
    if(!menuIndicator)return;
    if(!link){menuIndicator.classList.remove("is-on"); return;}

    const jump=instant || !menuIndicator.classList.contains("is-on");
    if(jump)menuIndicator.style.transition="none";

    menuIndicator.style.left=link.offsetLeft+"px";
    menuIndicator.style.top=link.offsetTop+"px";
    menuIndicator.style.width=link.offsetWidth+"px";
    menuIndicator.style.height=link.offsetHeight+"px";

    if(jump){
      menuIndicator.offsetWidth; // flush the jump before the transition comes back
      menuIndicator.style.transition="";
    }
    menuIndicator.classList.add("is-on");
  }

  function isMenuOpen(){return navbar.classList.contains("nav-menu-open");}

  function setMenuOpen(open){
    navbar.classList.toggle("nav-menu-open",open);
    navMenuBtn.setAttribute("aria-expanded",String(open));
    if(open)placeMenuIndicator(currentMenuLink,true);
  }

  navMenuBtn.addEventListener("click",()=>setMenuOpen(!isMenuOpen()));

  menuLinks.forEach(link=>{
    link.addEventListener("mouseenter",()=>placeMenuIndicator(link));
    link.addEventListener("focus",()=>placeMenuIndicator(link));
  });
  navMenuPanel.addEventListener("mouseleave",()=>placeMenuIndicator(currentMenuLink));

  // a click outside the panel closes it
  document.addEventListener("click",e=>{
    if(isMenuOpen() && !navMenuPanel.contains(e.target) && !navMenuBtn.contains(e.target))setMenuOpen(false);
  });

  navbar.addEventListener("focusout",e=>{
    const to=e.relatedTarget;
    if(isMenuOpen() && to && !navMenuPanel.contains(to) && to!==navMenuBtn)setMenuOpen(false);
  });

  addEventListener("keydown",e=>{
    if(e.key!=="Escape" || !isMenuOpen())return;
    setMenuOpen(false);
    navMenuBtn.focus();
  });

  addEventListener("resize",()=>{if(isMenuOpen())placeMenuIndicator(menuIndicatorLink,true);});

  // close the menu if back restored it open
  addEventListener("pageshow",e=>{if(e.persisted)setMenuOpen(false);});
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

    // laptop flies in, holds, then unpins
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

      // phase 1 - laptop slides in
      tl.fromTo(heroLaptop,{x:"29vw"},{x:"-3vw",ease:"none",duration:1},0);
      tl.fromTo(heroCopy,{opacity:1},{opacity:0,ease:"none",duration:1},0);
      tl.set(heroCopy,{pointerEvents:"none"},0.6);

      // phase 2 - laptop holds and fades out
tl.set(heroBehind,{y:"12.6vh",opacity:1},1);
tl.to(heroBehind,{y:"-12.6vh",ease:"none",duration:0.85},1);
tl.to(heroBehind,{y:"-18vh",opacity:0,ease:"none",duration:0.15},">");

      // fade out with the marquee
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

  // weighted bounce + idle float
  let lastScrollY=scrollY;
  let lastFrameTime=performance.now();
  let springY=0;
  let springVelocity=0;
  let idlePhase=0;

  const stiffness=20;   // lower = slower - heavier swing
  const damping=6;    // lower = more/longer bounces before settling
  const scrollKick=1; // how hard a scroll nudges the spring

  function tickHeroBounce(now){
    const dt=Math.min((now-lastFrameTime)/1000,.05); // capped so tabbing back in doesnt jolt
    lastFrameTime=now;

    const currentY=scrollY;
    const delta=Math.min(120,Math.max(-120,currentY-lastScrollY));
    lastScrollY=currentY;

    if(innerWidth>650){
      springVelocity+=delta*scrollKick;

      const accel=-stiffness*springY-damping*springVelocity;
      springVelocity+=accel*dt;
      springY=Math.min(40,Math.max(-40,springY+springVelocity*dt));

      // same float as the other heroes
      idlePhase+=dt*1.4;
      const idleY=Math.sin(idlePhase)*7;

      heroLaptopImg.style.transform=`translateY(${(springY+idleY).toFixed(2)}px)`;
    } else {
      heroLaptopImg.style.transform="";
    }

    requestAnimationFrame(tickHeroBounce);
  }
  requestAnimationFrame(tickHeroBounce);
}

// Squircle atom effect, particles flee the cursor
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

    // sample at high res so the glyph edges stay clean
    const sampleScale=atomDpr*4;

    const sample=document.createElement("canvas");
    sample.width=w*sampleScale;
    sample.height=h*sampleScale;
    const sctx=sample.getContext("2d");
    const style=getComputedStyle(atomText);

    sctx.scale(sampleScale,sampleScale);
    sctx.font=`${style.fontWeight} ${style.fontSize} "SuperMalibu"`;
    sctx.textBaseline="middle";
    sctx.fillStyle=style.color;
    sctx.fillText(atomText.textContent,0,h/2);

    // use the canvas's real size, fractional dpr breaks it
    const sampleW=sample.width;
    const sampleH=sample.height;
    const data=sctx.getImageData(0,0,sampleW,sampleH).data;
    const spacing=Math.max(3,Math.round(3.5*sampleScale));
    const particles=[];

    for(let y=0;y<sampleH;y+=spacing){
      for(let x=0;x<sampleW;x+=spacing){
        const i=(y*sampleW+x)*4;
        if(data[i+3]>120){
          particles.push({
            homeX:x/sampleScale,homeY:y/sampleScale,
            x:x/sampleScale,y:y/sampleScale,
            vx:0,vy:0,
            r:.8+Math.random()*.6,
            color:`rgb(${data[i]},${data[i+1]},${data[i+2]})`
          });
        }
      }
    }

    // keep the real text if sampling fails
    if(!particles.length)return;

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

  // load SuperMalibu before sampling
  const atomStyle=getComputedStyle(atomText);
  const atomFontSpec=`${atomStyle.fontWeight} ${atomStyle.fontSize} "SuperMalibu"`;

  if(document.fonts && document.fonts.load)
    Promise.all([document.fonts.load(atomFontSpec,atomText.textContent),document.fonts.ready])
      .catch(()=>{}).then(buildAtomParticles);
  else
    buildAtomParticles();

  addEventListener("resize",buildAtomParticles);
  requestAnimationFrame(tickAtoms);
}

// product carousel
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

      // row is visible as soon as it pins
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

// lappy feature showcase
const lappyShowcaseWrap=document.getElementById("lappyShowcase");
const lappyShowcaseSticky=document.getElementById("lappyShowcaseSticky");
const lappyShowcaseTrack=document.getElementById("lappyShowcaseTrack");
const lappyPanels=lappyShowcaseTrack ? Array.from(lappyShowcaseTrack.children) : [];

if(hasGsap && lappyShowcaseWrap && lappyShowcaseSticky && lappyShowcaseTrack && lappyPanels.length){

  // per data fx value
  const fxFrom={
    up:{y:70,rotate:-3},
    down:{y:-70,rotate:3},
    left:{x:-140,rotate:-4},
    right:{x:140,rotate:4},
    scale:{scale:.6,rotate:6}
  };

  ScrollTrigger.matchMedia({

    "(min-width:651px)":()=>{
      // horizontal pan, pinned
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

      // text reveals synced to the pan
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

// one span per scribble letter
document.querySelectorAll(".about-scribble-text").forEach(word=>{
  const letters=[...word.textContent.trim()];
  word.textContent="";
  word.style.setProperty("--n",letters.length);
  letters.forEach((letter,i)=>{
    const span=document.createElement("span");
    span.className="about-scribble-letter";
    span.style.setProperty("--i",i);
    span.textContent=letter;
    word.appendChild(span);
  });
});

// scribble draws in on first view
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

// about cards fade in
const aboutReveals=document.querySelectorAll(".about-media, .about-copy, .about-banner");
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

// lappy cards fade in
const lappyReveals=document.querySelectorAll(".lappy-option, .lappy-configurator");
if(lappyReveals.length && "IntersectionObserver" in window){
  const lappyRevealObserver=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("in-view");
        lappyRevealObserver.unobserve(entry.target);
      }
    });
  },{threshold:0,rootMargin:"0px 0px -15% 0px"});
  lappyReveals.forEach(el=>lappyRevealObserver.observe(el));
}

// diy screwdriver keeps spinning while the mouse is over it, then settles back upright
// (product pages + the buy page, buy.js draws its cards later so this listens on the whole document)
const diySpinReduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const diySpinTime=3; // seconds for one full turn, bigger is slower

// the screwdriver this pointer just came onto or left, null if it only moved inside the card
function diySpinImg(e){
  if(e.pointerType==="touch")return null; // mouse over only
  const host=e.target.closest(".lappy-option-media--diy, .buy-option");
  if(!host || host.contains(e.relatedTarget) || host.closest(".is-locked"))return null;
  return host.querySelector(".lappy-option-media--diy img, .buy-option-thumb--icon img");
}

// gsap only counts --diy-turn up (the css turns it into rotate), so the card's css hover zoom still works
if(window.gsap && !diySpinReduced){
  document.addEventListener("pointerover",e=>{
    const img=diySpinImg(e);
    if(img)gsap.to(img,{"--diy-turn":"+=360",duration:diySpinTime,ease:"none",repeat:-1,overwrite:true});
  });
  document.addEventListener("pointerout",e=>{
    const img=diySpinImg(e);
    // nearest upright, so it never turns more than half a spin to get there
    if(img)gsap.to(img,{"--diy-turn":Math.round(parseFloat(gsap.getProperty(img,"--diy-turn"))/360)*360,duration:.8,ease:"power3.out",overwrite:true});
  });
}

// spec configurator
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

  // remeasure the pill every frame
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

// smooth scroll for same-page links
const smoothScrollReduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
document.addEventListener("click",e=>{
  const link=e.target.closest('a[href^="#"]');
  if(!link)return;

  const target=document.getElementById(link.getAttribute("href").slice(1));
  if(!target)return;

  // respects scroll-margin-top
  const margin=parseFloat(getComputedStyle(target).scrollMarginTop)||0;

  e.preventDefault();
  scrollTo({top:target.getBoundingClientRect().top+scrollY-margin,behavior:smoothScrollReduced?"auto":"smooth"});
});

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


  // Mouse reaction
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


// scroll driven background zones (black > orange > purple > black)
const zoneSections={
  productWrap:document.getElementById("productWrap"),
  aboutWrap:document.querySelector(".about-wrap"),
  aboutBanner:document.querySelector(".about-banner"),
  footer:document.querySelector(".site-footer"),
  lappyShowcase:document.getElementById("lappyShowcase"),
  lappyOptions:document.getElementById("lappyOptions"),
  lappyBuyBanner:document.querySelector(".lappy-buy-banner"),
  buyConfig:document.getElementById("buyConfig"),
  buyReview:document.getElementById("buyReview")
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

// zone midpoints, remeasured when layout shifts
let zoneT0=0,zoneT1=0,zoneT2=0,docMaxScroll=0;
function measureZones(){
  const{productWrap,aboutWrap,aboutBanner,footer,lappyShowcase,lappyOptions,lappyBuyBanner,buyConfig,buyReview}=zoneSections;

  if(heroWrap&&productWrap&&aboutWrap&&aboutBanner&&footer){
    const productBottom=productWrap.offsetTop+productWrap.offsetHeight;
    const bannerCenter=aboutBanner.offsetTop+aboutBanner.offsetHeight/2;

    zoneT0=heroWrap.offsetTop+innerHeight;
    zoneT1=(productBottom+aboutWrap.offsetTop)/2;
    zoneT2=bannerCenter;
  }
  // lappy zones
  else if(lappyShowcase&&lappyOptions&&lappyBuyBanner){
    zoneT0=lappyShowcase.offsetTop;
    zoneT1=lappyOptions.offsetTop;
    zoneT2=lappyBuyBanner.offsetTop+lappyBuyBanner.offsetHeight/2;
  }
  // buy zones
  else if(buyConfig&&buyReview&&lappyBuyBanner){
    zoneT0=buyConfig.offsetTop;
    zoneT1=buyReview.getBoundingClientRect().top+scrollY;
    zoneT2=lappyBuyBanner.offsetTop+lappyBuyBanner.offsetHeight/2;
  }
  else return;

  docMaxScroll=Math.max(0,document.documentElement.scrollHeight-innerHeight);
}
measureZones();
addEventListener("resize",measureZones);
addEventListener("load",measureZones);

// remeasure when the page height changes
if("ResizeObserver" in window)new ResizeObserver(measureZones).observe(document.body);

// look below the footer so the last zone is reached
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

// easter egg: type deltarune or undertale
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
  // paths start with / so they still load from pages inside folders (about/, contact/)
  const dbMonsters={
    deltarune:{
      trigger:"deltarune",
      enemyImg:"/Assets/Easter%20Eggs/Deltarune%20Undertale/Lancer.webp",
      enemyAlt:"Lancer",
      heroName:"KRIS",
      theme:"/Assets/Easter%20Eggs/Deltarune%20Undertale/Lancer%20vs%20theme.mp3",
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
      enemyImg:"/Assets/Easter%20Eggs/Deltarune%20Undertale/Sans.webp",
      enemyAlt:"Sans",
      heroName:"FRISK",
      theme:"/Assets/Easter%20Eggs/Deltarune%20Undertale/MEGALOVANIA.mp3",
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
        "* SANS: \"kid, that's not really how this works. but im tired. you win.\""
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

// easter egg: flappy squircle
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
  flBirdImg.src="/Assets/Logos/Logo.png";
  const flBgImg=new Image();
  flBgImg.src="/Assets/Easter%20Eggs/Flappy%20Bird/BG.png";
  const flPipeImg=new Image();
  flPipeImg.src="/Assets/Easter%20Eggs/Flappy%20Bird/Pipe.png";

  let flState="idle"; // idle playing over
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