// contact page (contact.html): a contact form that looks and behaves like the real thing. it checks what's been filled
// in, pretends to send for a beat, then swaps itself for the sent screen. nothing actually goes anywhere, it's a demo.
// Script.js still does everything shared (splash, nav, menu, canvas, the atom title), this is just the page's own bits

(() => {

const form=document.getElementById("contactForm");
const card=document.getElementById("contactCard");
if(!form || !card)return;

const hasGsap=!!window.gsap;
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;

const nameInput=document.getElementById("contactName");
const emailInput=document.getElementById("contactEmail");
const messageInput=document.getElementById("contactMessage");
const topics=document.getElementById("contactTopics");
const topicIndicator=topics.querySelector(".contact-chips-indicator");
const productField=document.getElementById("contactProductField");
const count=document.getElementById("contactCount");
const sendBtn=form.querySelector(".contact-send");
const sentTitle=document.getElementById("contactSentTitle");
const sentName=document.getElementById("contactSentName");
const sentEmail=document.getElementById("contactSentEmail");
const againBtn=document.getElementById("contactAgain");
const confetti=document.getElementById("contactConfetti");

const sendLabel=sendBtn.textContent;
const messageMin=10;
const productTopics=["product","repair","order"]; // the topics where "which squircle?" is worth asking


// topics: slides the pill onto the picked chip. `instant` jumps straight there (first paint, resizes) rather than gliding

function placeTopicIndicator(instant){
  const checked=topics.querySelector("input:checked");
  topics.querySelectorAll(".contact-chip").forEach(chip=>chip.classList.toggle("is-picked",!!checked && chip.contains(checked)));
  if(!checked){topicIndicator.classList.remove("is-on"); return;}

  const chip=checked.closest(".contact-chip");
  const jump=instant || !topicIndicator.classList.contains("is-on");
  if(jump)topicIndicator.style.transition="none";

  topicIndicator.style.left=chip.offsetLeft+"px";
  topicIndicator.style.top=chip.offsetTop+"px";
  topicIndicator.style.width=chip.offsetWidth+"px";
  topicIndicator.style.height=chip.offsetHeight+"px";

  if(jump){
    topicIndicator.offsetWidth; // flush the jump before the transition comes back
    topicIndicator.style.transition="";
  }
  topicIndicator.classList.add("is-on");
}

// "which squircle?" only folds open for the topics about a particular product
function syncProductField(){
  const checked=topics.querySelector("input:checked");
  productField.classList.toggle("is-open",!!checked && productTopics.includes(checked.value));
}

topics.addEventListener("change",()=>{
  placeTopicIndicator();
  syncProductField();
});


// the message's character count, which goes yellow when it's nearly out of room

function updateCount(){
  const max=messageInput.maxLength>0 ? messageInput.maxLength : 500;
  const n=messageInput.value.length;
  count.textContent=`${n} / ${max}`;
  count.classList.toggle("is-near",n>=max*.9);
}

messageInput.addEventListener("input",updateCount);


// checking: each field says what's wrong in plain words. nothing shows till the first go at sending, after that the
// messages update live as each field gets fixed

const checks=[
  [nameInput,value=>value.trim() ? "" : "We'll need a name to reply to."],
  [emailInput,value=>{
    if(!value.trim())return "Pop in an email so we can write back.";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "That email doesn't look quite right.";
  }],
  [messageInput,value=>value.trim().length>=messageMin ? "" : `Tell us a little more (${messageMin} characters at least).`]
];

let tried=false;

function check(input,test){
  const problem=test(input.value);
  document.getElementById(input.id+"Error").textContent=problem;
  input.setAttribute("aria-invalid",String(!!problem));
  return !problem;
}

checks.forEach(([input,test])=>input.addEventListener("input",()=>{if(tried)check(input,test);}));

function clearChecks(){
  tried=false;
  checks.forEach(([input])=>{
    input.removeAttribute("aria-invalid");
    document.getElementById(input.id+"Error").textContent="";
  });
}

// a field that's still wrong gives a little shake, same as the buy page's unfinished steps
function nudge(field){
  field.classList.remove("is-nudged");
  field.offsetWidth; // restart the shake if it's already played
  field.classList.add("is-nudged");
}


// sending

form.addEventListener("submit",e=>{
  e.preventDefault();
  if(card.classList.contains("is-sent") || sendBtn.classList.contains("is-sending"))return;

  tried=true;
  const problems=checks.filter(([input,test])=>!check(input,test));
  if(problems.length){
    problems.forEach(([input])=>nudge(input.closest(".contact-field")));
    problems[0][0].focus();
    return;
  }

  // "sending" for a beat, so it feels like it's actually going somewhere
  sendBtn.classList.add("is-sending");
  sendBtn.setAttribute("aria-disabled","true");
  sendBtn.textContent="Sending";
  setTimeout(showSent,reducedMotion ? 300 : 1100);
});

function showSent(){
  sendBtn.classList.remove("is-sending");
  sendBtn.removeAttribute("aria-disabled");
  sendBtn.textContent=sendLabel;

  sentName.textContent=nameInput.value.trim().split(/\s+/)[0];
  sentEmail.textContent=emailInput.value.trim();

  card.classList.add("is-sent");
  sentTitle.focus({preventScroll:true});
  burstConfetti();
}

// back to a fresh form
againBtn.addEventListener("click",()=>{
  form.reset();
  clearChecks();
  updateCount();
  syncProductField();
  placeTopicIndicator(true);

  card.classList.remove("is-sent");
  nameInput.focus({preventScroll:true});
});

// brand-coloured confetti bursting out of the blocks then falling away, the buy page's "nice build!" burst. squares
// and circles, like the logo
function burstConfetti(){
  if(!hasGsap || reducedMotion || !confetti)return;
  const colours=["var(--accent)","var(--accent-2)","var(--accent-3)","var(--whiteline)"];

  for(let i=0;i<36;i++){
    const piece=document.createElement("span");
    piece.style.background=colours[i%colours.length];
    piece.style.borderRadius=i%2 ? "50%" : "3px";
    confetti.appendChild(piece);

    const angle=Math.random()*Math.PI*2;
    const distance=110+Math.random()*220;
    gsap.timeline({onComplete:()=>piece.remove()})
      .fromTo(piece,{x:0,y:0,scale:0,rotation:0},{
        x:Math.cos(angle)*distance,
        y:Math.sin(angle)*distance-110,
        scale:.6+Math.random()*.9,
        rotation:Math.random()*540-270,
        duration:.9,
        ease:"power3.out"
      })
      .to(piece,{y:"+=260",opacity:0,duration:1.1,ease:"power1.in"},">-.2");
  }
}


// scroll reveal: the info and the card swing in the first time they scroll into view. Contact.css only hides them while
// the body has .has-reveal, so without this (or with reduced motion) they're simply there

if(!reducedMotion && "IntersectionObserver" in window){
  document.body.classList.add("has-reveal");

  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    });
  },{rootMargin:"0px 0px -15% 0px"});

  document.querySelectorAll(".contact-info, .contact-card").forEach(el=>revealObserver.observe(el));
}


// start-up

updateCount();
syncProductField();
placeTopicIndicator(true);

// the chips change size as fonts land and the window resizes (and rewrap on smaller screens), so the pill re-measures
// along with them
if("ResizeObserver" in window)new ResizeObserver(()=>placeTopicIndicator(true)).observe(topics);
if(document.fonts && document.fonts.ready)document.fonts.ready.then(()=>placeTopicIndicator(true));

})();
