// about page bits, shared stuff lives in Script.js

(() => {

const hasGsap=!!(window.gsap && window.ScrollTrigger);
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover=matchMedia("(hover:hover) and (pointer:fine)").matches;
const hasObserver="IntersectionObserver" in window;

// add className on first scroll into view
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


// hero logo: hover/tap to take it apart

const logo=document.getElementById("aboutusLogo");
const logoTilt=document.getElementById("aboutusLogoTilt");

if(logo && logoTilt){
  let touched=false; // they tried it, skip the peek

  function setOpen(open){
    logo.classList.toggle("is-open",open);
    logo.setAttribute("aria-pressed",String(open));
  }

  logo.addEventListener("click",()=>{
    touched=true;
    setOpen(!logo.classList.contains("is-open"));
  });

  // mouse only, touch fires both events
  if(canHover){
    logo.addEventListener("pointerenter",e=>{
      if(e.pointerType==="touch")return;
      touched=true;
      setOpen(true);
    });
    logo.addEventListener("pointerleave",e=>{if(e.pointerType!=="touch")setOpen(false);});
  }

  // lean toward the cursor
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

  // one peek once the hero lands
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


// squircle morph: |x|^n + |y|^n = 1, n=2 circle, n=4 squircle

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

  const SQUARE=60; // square enough
  const CIRCLE=2;
  const SQUIRCLE=4;

  // fixed point count so the morph never pops
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

  // step through log(n) so the morph feels even
  function between(a,b,t){return Math.exp(Math.log(a)+(Math.log(b)-Math.log(a))*t);}

  // scroll progress -> n
  function nAt(p){
    if(p<.56)return between(SQUARE,CIRCLE,easeInOut(stretch(p,.1,.46)));
    return between(CIRCLE,SQUIRCLE,easeInOut(stretch(p,.6,.9)));
  }

  let lastN=0;
  let lastBeat=-1;

  function render(p){
    const n=nAt(p);

    // skip rebuilds during holds
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

  // slide the pill under the lit chip
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

  // default to the squircle with every beat listed
  render(1);

  if(hasGsap && !reducedMotion){
    const morph={p:0};

    ScrollTrigger.matchMedia({

      // desktop: pinned morph with crossfading beats
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

      // phones: no pin, just morph on scroll
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

  // remeasure the pill on resize
  if("ResizeObserver" in window)new ResizeObserver(placeChip).observe(nameChips);
  if(document.fonts && document.fonts.ready)document.fonts.ready.then(placeChip);
}


// our story: line draws in, dots fill

const timeline=document.getElementById("aboutusTimeline");
const timelineFill=document.getElementById("aboutusTimelineFill");
const chapterDots=document.querySelectorAll(".aboutus-chapter-dot");

if(hasGsap && !reducedMotion && hasObserver && timeline && timelineFill){
  gsap.fromTo(timelineFill,{scaleY:0},{
    scaleY:1,
    ease:"none",
    scrollTrigger:{trigger:timeline,start:"top 60%",end:"bottom 60%",scrub:true}
  });

  // a dot is reached once above 60% of the screen
  const dotObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const line=entry.rootBounds ? entry.rootBounds.bottom : innerHeight*.6;
      entry.target.closest(".aboutus-chapter").classList.toggle("is-reached",entry.boundingClientRect.top<line);
    });
  },{rootMargin:"0px 0px -40% 0px"});

  chapterDots.forEach(dot=>dotObserver.observe(dot));
}
// no scroll drawing, show it all
else chapterDots.forEach(dot=>dot.closest(".aboutus-chapter").classList.add("is-reached"));


// count the numbers up on first view

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


// light the block for the rule in the middle

const blocksLogo=document.getElementById("aboutusBlocksLogo");
const rules=Array.from(document.querySelectorAll(".aboutus-rule"));

if(blocksLogo && rules.length && hasObserver){
  const crossing=new Set();

  const ruleObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting)crossing.add(entry.target);
      else crossing.delete(entry.target);
    });

    // keep the last rule lit between rules
    const active=rules.filter(rule=>crossing.has(rule)).pop();
    if(!active && rules[0].getBoundingClientRect().top<innerHeight/2)return;

    rules.forEach(rule=>rule.classList.toggle("is-active",rule===active));
    blocksLogo.dataset.active=active ? active.dataset.block : "";
  },{rootMargin:"-45% 0px -45% 0px"});

  rules.forEach(rule=>ruleObserver.observe(rule));
}


// scroll reveals

if(!reducedMotion && hasObserver){
  document.body.classList.add("has-reveal");

  onceInView(document.querySelectorAll(".aboutus-head, .aboutus-name-stage, .aboutus-name-copy, .aboutus-chapter, .aboutus-rule, .aboutus-maker-card"),"0px 0px -15% 0px","in-view");

  if(stats){
    statNums.forEach(el=>{el.textContent=(el.dataset.from||0)+(el.dataset.suffix||"");});
    onceInView([stats],"0px 0px -15% 0px","in-view",()=>statNums.forEach(countStat));
  }
}

})();
