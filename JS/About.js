// about page (about.html): the hero logo that comes apart, the name morphing from a square into a circle and back,
// the story line drawing itself in with the numbers counting up, and the logo lighting up one block per rule.
// Script.js still does everything shared (splash, nav, canvas, scroll zones, the atom title), this is just the page's own bits

(() => {

const hasGsap=!!(window.gsap && window.ScrollTrigger);
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover=matchMedia("(hover:hover) and (pointer:fine)").matches;
const hasObserver="IntersectionObserver" in window;

// adds `className` to each element the first time it scrolls into view, then stops watching it
function onceInView(elements,rootMargin,className,onSeen){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add(className);
      observer.unobserve(entry.target);
      if(onSeen)onSeen(entry.target);
    });
  },{threshold:0,rootMargin});
  elements.forEach(el=>observer.observe(el));
}


// hero logo: hover (or tap, or enter/space) to take it apart

const logo=document.getElementById("aboutusLogo");
const logoTilt=document.getElementById("aboutusLogoTilt");

if(logo && logoTilt){
  let touched=false; // once they've had a go themselves, the intro peek keeps out of the way

  function setOpen(open){
    logo.classList.toggle("is-open",open);
    logo.setAttribute("aria-pressed",String(open));
  }

  logo.addEventListener("click",()=>{
    touched=true;
    setOpen(!logo.classList.contains("is-open"));
  });

  // mouse only: a tap on a touchscreen laptop fires pointerenter as well as the click, which would open it then
  // straight away toggle it shut again
  if(canHover){
    logo.addEventListener("pointerenter",e=>{
      if(e.pointerType==="touch")return;
      touched=true;
      setOpen(true);
    });
    logo.addEventListener("pointerleave",e=>{if(e.pointerType!=="touch")setOpen(false);});
  }

  // leans toward the cursor a touch, same as the buy page's stage
  if(hasGsap && !reducedMotion && canHover){
    const tiltY=gsap.quickTo(logoTilt,"rotationY",{duration:.7,ease:"power3.out"});
    const tiltX=gsap.quickTo(logoTilt,"rotationX",{duration:.7,ease:"power3.out"});

    logo.addEventListener("pointermove",e=>{
      if(e.pointerType==="touch")return;
      const rect=logo.getBoundingClientRect();
      tiltY(((e.clientX-rect.left)/rect.width-.5)*18);
      tiltX(-((e.clientY-rect.top)/rect.height-.5)*14);
    });
    logo.addEventListener("pointerleave",()=>{tiltY(0); tiltX(0);});
  }

  // one peek once the hero has landed, so it's obvious the logo does something. on a first visit that means waiting
  // for the splash to hand off (Script.js adds .loaded), on repeat visits it's already gone
  if(!reducedMotion){
    const splash=document.getElementById("splash");

    function peek(){
      setTimeout(()=>{
        if(touched)return;
        setOpen(true);
        setTimeout(()=>{if(!touched)setOpen(false);},1500);
      },1600);
    }

    if(!splash || splash.classList.contains("loaded"))peek();
    else new MutationObserver((records,observer)=>{
      if(!splash.classList.contains("loaded"))return;
      observer.disconnect();
      peek();
    }).observe(splash,{attributes:true,attributeFilter:["class"]});
  }
}


// what's a squircle: the shape is a superellipse, |x|^n + |y|^n = 1. n=2 is a circle, the bigger n gets the squarer it
// goes, and n=4 is the squircle. scrolling walks n from a square to a circle and back out to the squircle

const nameWrap=document.getElementById("aboutusName");
const nameSticky=document.getElementById("aboutusNameSticky");
const nameStage=document.getElementById("aboutusNameStage");
const nameShape=document.getElementById("aboutusNameShape");
const nameN=document.getElementById("aboutusNameN");
const nameChips=document.getElementById("aboutusNameChips");

if(nameWrap && nameSticky && nameStage && nameShape && nameN && nameChips){
  const beats=Array.from(nameWrap.querySelectorAll(".aboutus-name-beat"));
  const chips=Array.from(nameChips.querySelectorAll(".aboutus-name-chip"));
  const chipIndicator=nameChips.querySelector(".aboutus-name-chip-indicator");

  const SQUARE=60; // not quite infinity, but square enough that you can't tell
  const CIRCLE=2;
  const SQUIRCLE=4;

  // the same 120 points round the outline whatever n is, so the morph never pops
  function shapePath(n){
    let d="";
    for(let i=0;i<120;i++){
      const t=i/120*Math.PI*2;
      const c=Math.cos(t);
      const s=Math.sin(t);
      const x=100*Math.sign(c)*Math.pow(Math.abs(c),2/n);
      const y=100*Math.sign(s)*Math.pow(Math.abs(s),2/n);
      d+=(i?"L":"M")+x.toFixed(2)+" "+y.toFixed(2);
    }
    return d+"Z";
  }

  function easeInOut(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
  function stretch(p,from,to){return Math.min(1,Math.max(0,(p-from)/(to-from)));}

  // walks through log(n) rather than n, so each bit of scroll changes the shape by about the same amount
  // (60 -> 30 barely moves the corners, 4 -> 2 changes everything)
  function between(a,b,t){return Math.exp(Math.log(a)+(Math.log(b)-Math.log(a))*t);}

  // scroll progress (0-1) -> n: hold the square, ease into a circle, hold, then ease back out to sit on the squircle
  function nAt(p){
    if(p<.56)return between(SQUARE,CIRCLE,easeInOut(stretch(p,.1,.46)));
    return between(CIRCLE,SQUIRCLE,easeInOut(stretch(p,.6,.9)));
  }

  let lastN=0;
  let lastBeat=-1;

  function render(p){
    const n=nAt(p);

    // the holds don't change anything, so they don't rebuild the path either
    if(Math.abs(n-lastN)>.001){
      lastN=n;
      nameShape.setAttribute("d",shapePath(n));
      nameN.textContent="n = "+(n<9.95?n.toFixed(1):Math.round(n));
    }

    setBeat(p<.3?0:p<.62?1:2);
  }

  function setBeat(beat){
    if(beat===lastBeat)return;
    lastBeat=beat;

    beats.forEach((el,i)=>el.classList.toggle("is-on",i===beat));
    chips.forEach((chip,i)=>chip.classList.toggle("is-on",i===beat));
    placeChip();
  }

  // slides the pill under the lit chip. the very first placement jumps straight there rather than gliding in from
  // the left edge
  function placeChip(){
    const chip=chips[lastBeat];
    if(!chip)return;

    const jump=!nameChips.classList.contains("is-ready");
    if(jump)chipIndicator.style.transition="none";

    chipIndicator.style.left=chip.offsetLeft+"px";
    chipIndicator.style.width=chip.offsetWidth+"px";

    if(jump){
      chipIndicator.offsetWidth; // flush the jump before the transition comes back
      chipIndicator.style.transition="";
      nameChips.classList.add("is-ready");
    }
  }

  // starts (and with reduced motion or no gsap, stays) on the squircle with every beat showing as a list
  render(1);

  if(hasGsap && !reducedMotion){
    const morph={p:0};

    ScrollTrigger.matchMedia({

      // desktop: pinned for the length of the wrap while the scroll does the morphing, the beats stacked to crossfade
      "(min-width:651px)":()=>{
        nameWrap.classList.add("is-scrubbed");
        morph.p=0;
        render(0);

        const tween=gsap.to(morph,{
          p:1,
          ease:"none",
          onUpdate:()=>render(morph.p),
          scrollTrigger:{
            trigger:nameWrap,
            start:"top top",
            end:"bottom bottom",
            scrub:1,
            pin:nameSticky,
            invalidateOnRefresh:true,
          }
        });

        return ()=>{
          tween.scrollTrigger && tween.scrollTrigger.kill();
          tween.kill();
          nameWrap.classList.remove("is-scrubbed");
          render(1);
        };
      },

      // phones: no pin (same as every other scroll-jacked bit of the site), the shape just morphs as it passes
      // through the screen and the beats stay a list
      "(max-width:650px)":()=>{
        morph.p=0;
        render(0);

        const tween=gsap.to(morph,{
          p:1,
          ease:"none",
          onUpdate:()=>render(morph.p),
          scrollTrigger:{trigger:nameStage,start:"top 85%",end:"bottom 30%",scrub:1}
        });

        return ()=>{
          tween.scrollTrigger && tween.scrollTrigger.kill();
          tween.kill();
          render(1);
        };
      }

    });
  }

  // the chips change size as fonts land and the window resizes, so the pill re-measures along with them
  if("ResizeObserver" in window)new ResizeObserver(placeChip).observe(nameChips);
  if(document.fonts && document.fonts.ready)document.fonts.ready.then(placeChip);
}


// our story: the line draws itself down the middle as you scroll, and each chapter's dot fills in as it gets there

const timeline=document.getElementById("aboutusTimeline");
const timelineFill=document.getElementById("aboutusTimelineFill");
const chapterDots=document.querySelectorAll(".aboutus-chapter-dot");

if(hasGsap && !reducedMotion && hasObserver && timeline && timelineFill){
  gsap.fromTo(timelineFill,{scaleY:0},{
    scaleY:1,
    ease:"none",
    scrollTrigger:{trigger:timeline,start:"top 60%",end:"bottom 60%",scrub:true}
  });

  // the line's leading edge always sits 60% of the way down the screen (that's what the start/end above work out
  // to), so a dot counts as reached once it's above that. toggled both ways so scrolling back up empties them again
  const dotObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const line=entry.rootBounds ? entry.rootBounds.bottom : innerHeight*.6;
      entry.target.closest(".aboutus-chapter").classList.toggle("is-reached",entry.boundingClientRect.top<line);
    });
  },{rootMargin:"0px 0px -40% 0px"});

  chapterDots.forEach(dot=>dotObserver.observe(dot));
}
// no scroll drawing, so the line's already full and every dot with it
else chapterDots.forEach(dot=>dot.closest(".aboutus-chapter").classList.add("is-reached"));


// the numbers count up (the glue counts down) the first time they scroll in. the html holds the real values, so
// without the reveal they're simply right

const stats=document.getElementById("aboutusStats");
const statNums=stats ? Array.from(stats.querySelectorAll(".aboutus-stat-num")) : [];

function countStat(el){
  const from=Number(el.dataset.from||0);
  const to=Number(el.dataset.to);
  const suffix=el.dataset.suffix||"";
  const start=performance.now();

  (function step(now){
    const t=Math.min(1,(now-start)/1600);
    const eased=1-Math.pow(1-t,3);
    el.textContent=Math.round(from+(to-from)*eased)+suffix;
    if(t<1)requestAnimationFrame(step);
  })(start);
}


// four blocks: whichever rule is crossing the middle of the screen lights its block up on the big logo

const blocksLogo=document.getElementById("aboutusBlocksLogo");
const rules=Array.from(document.querySelectorAll(".aboutus-rule"));

if(blocksLogo && rules.length && hasObserver){
  const crossing=new Set();

  const ruleObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting)crossing.add(entry.target);
      else crossing.delete(entry.target);
    });

    // the band's a thin strip across the middle, so normally it's just the one rule. in the gap between two the last
    // one stays lit, unless you've scrolled back up above the first, which puts the logo back to normal
    const active=rules.filter(rule=>crossing.has(rule)).pop();
    if(!active && rules[0].getBoundingClientRect().top<innerHeight/2)return;

    rules.forEach(rule=>rule.classList.toggle("is-active",rule===active));
    blocksLogo.dataset.active=active ? active.dataset.block : "";
  },{rootMargin:"-45% 0px -45% 0px"});

  rules.forEach(rule=>ruleObserver.observe(rule));
}


// scroll reveals: About.css only hides these while the body has .has-reveal, so without this (or with reduced
// motion) they're all simply there

if(!reducedMotion && hasObserver){
  document.body.classList.add("has-reveal");

  onceInView(document.querySelectorAll(".aboutus-head, .aboutus-name-stage, .aboutus-name-copy, .aboutus-chapter, .aboutus-rule, .aboutus-maker-card"),"0px 0px -15% 0px","in-view");

  if(stats){
    statNums.forEach(el=>{el.textContent=(el.dataset.from||0)+(el.dataset.suffix||"");});
    onceInView([stats],"0px 0px -15% 0px","in-view",()=>statNums.forEach(countStat));
  }
}

})();
