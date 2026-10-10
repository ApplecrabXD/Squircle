// buy page configurator (Buy/index.html). one page serves every product: ?product=lappy picks which, and every other
// pick rides along in the query string too, so a build survives a reload and can be shared as a link.
// picking an option swaps the stage image, then the page glides on to the next step, apple store style

(() => {

const buyForm=document.getElementById("buyForm");
const buyReview=document.getElementById("buyReview");
if(!buyForm || !buyReview)return;

const hasGsap=!!window.gsap;
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;


// catalogue

// placeholder art till the real product shots exist. picking an option that has an image swaps the stage over to it,
// so real photos later are just new paths here, or an image of their own on each option
const IMG={
  laptop:"../Assets/Lappy/Logo%20in%20laptop.png",
  wide:"../Assets/Temp/16x9.png",
  tall:"../Assets/Temp/9x16.jpg"
};

// prices in whole dollars. base is the "From" price on each product page and every pick adds on top of it.
// specs are each product page's spec list, minus customisation (that's the shared colour step at the end).
// a spec with `byo` is one of the parts the diy copy says you fit yourself: diy builds get a bring your own option on
// it, which knocks `byo` dollars off for the included part you're leaving out
const buyProducts={
  lappy:{
    name:"Lappy 13 Pro",
    tagline:"The laptop you can fix yourself.",
    page:"../Lappy/",
    image:IMG.laptop,
    thumb:IMG.laptop,
    base:1499,
    buildFee:150,
    diy:"Order the barebones chassis, then fit your own RAM, storage and ports at your own pace.",
    prebuilt:"Every part picked, fitted and tested, so it all just works and none of the stress lands on you.",
    colour:"Colours the lid and the keyboard deck.",
    specs:[
      {key:"cpu",title:"CPU",question:"How much power do you need?",help:"Everyday speed all the way up to desktop-class performance.",options:[
        {value:"ultra-5",name:"Intel Core Ultra 5",detail:"Everyday speed with all-day battery.",price:0,image:IMG.laptop},
        {value:"ultra-7",name:"Intel Core Ultra 7",detail:"Extra headroom for creative apps.",price:300,image:IMG.wide},
        {value:"ultra-9",name:"Intel Core Ultra 9",detail:"Desktop-class performance on the go.",price:600,image:IMG.tall}
      ]},
      {key:"ram",title:"RAM",question:"How much do you multitask?",help:"You can upgrade it yourself later, so there's no wrong answer.",byo:40,options:[
        {value:"8gb",name:"8GB",detail:"Browsing, docs and streaming.",price:0,image:IMG.laptop},
        {value:"16gb",name:"16GB",detail:"Comfortable for most people.",price:150,image:IMG.wide},
        {value:"32gb",name:"32GB",detail:"Big projects and a silly number of tabs.",price:350,image:IMG.tall},
        {value:"64gb",name:"64GB",detail:"Virtual machines and heavy editing.",price:700,image:IMG.wide}
      ]},
      {key:"storage",title:"Storage",question:"How much room do you need?",help:"Swap the drive out yourself whenever you need more.",byo:50,options:[
        {value:"512gb",name:"512GB",detail:"Apps, docs and a decent photo library.",price:0,image:IMG.laptop},
        {value:"1tb",name:"1TB",detail:"Room for games and big files.",price:150,image:IMG.wide},
        {value:"2tb",name:"2TB",detail:"Never think about storage again.",price:400,image:IMG.tall}
      ]},
      {key:"cooling",title:"Cooling",question:"How hard will you push it?",help:"Pick the cooling that matches how you work.",options:[
        {value:"passive",name:"Passive",detail:"Silent and fanless, for lighter work.",price:0,image:IMG.laptop},
        {value:"dual-fan",name:"Dual-Fan",detail:"Holds full speed under heavy load.",price:100,image:IMG.wide}
      ]},
      {key:"cards",title:"Expansion Cards",question:"Which ports do you want?",help:"Four swappable bays. Change your mind any time.",byo:40,options:[
        {value:"essentials",name:"Essentials",detail:"2× USB-C, USB-A and HDMI.",price:0,image:IMG.laptop},
        {value:"creator",name:"Creator",detail:"2× USB-C, SD card reader and DisplayPort.",price:40,image:IMG.wide},
        {value:"everything",name:"Everything",detail:"Four cards, plus two spares in the box.",price:90,image:IMG.tall}
      ]}
    ]
  },

  gammy:{
    name:"Gammy Pro Max",
    tagline:"The liquid-cooled gaming PC.",
    page:"../Gammy%20Pro%20Max/",
    image:IMG.laptop,
    thumb:IMG.tall,
    base:2999,
    buildFee:200,
    diy:"Order the case, board and power supply, then fit your own GPU, CPU, RAM and storage.",
    prebuilt:"Fitted, cable-managed and stress-tested before it ships. Just plug it in and play.",
    colour:"Colours the case, with a glass side panel to show it off.",
    specs:[
      {key:"cpu",title:"CPU",question:"How hard will you push it?",help:"Solid mid-range all the way up to top-tier gaming and streaming power.",byo:250,options:[
        {value:"8-core",name:"8-Core",detail:"Smooth gaming at high settings.",price:0,image:IMG.laptop},
        {value:"12-core",name:"12-Core",detail:"Game and stream at the same time.",price:250,image:IMG.wide},
        {value:"16-core",name:"16-Core",detail:"Top-tier power for everything at once.",price:550,image:IMG.tall}
      ]},
      {key:"gpu",title:"GPU",question:"What resolution do you play at?",help:"From smooth 1440p all the way up to high-refresh 4K.",byo:500,options:[
        {value:"1440p",name:"1440p Ready",detail:"High frame rates at 1440p.",price:0,image:IMG.laptop},
        {value:"4k",name:"4K Ready",detail:"Smooth 4K at high settings.",price:600,image:IMG.wide},
        {value:"4k-high-refresh",name:"4K High-Refresh",detail:"4K at 144Hz and beyond.",price:1200,image:IMG.tall}
      ]},
      {key:"ram",title:"RAM",question:"How much memory do you need?",help:"There are free slots to add more yourself later on.",byo:60,options:[
        {value:"16gb",name:"16GB",detail:"Plenty for gaming.",price:0,image:IMG.laptop},
        {value:"32gb",name:"32GB",detail:"Gaming with Discord, a browser and a stream open.",price:120,image:IMG.wide},
        {value:"64gb",name:"64GB",detail:"Video editing and 3D work.",price:300,image:IMG.tall},
        {value:"128gb",name:"128GB",detail:"Because you can.",price:650,image:IMG.wide}
      ]},
      {key:"storage",title:"Storage",question:"How big is your game library?",help:"Fast NVMe drives plus spare bays, so you never run out of room.",byo:80,options:[
        {value:"1tb",name:"1TB NVMe",detail:"A healthy handful of big games.",price:0,image:IMG.laptop},
        {value:"2tb",name:"2TB NVMe",detail:"Most of your library, installed.",price:150,image:IMG.wide},
        {value:"4tb",name:"4TB NVMe",detail:"Never uninstall anything again.",price:400,image:IMG.tall}
      ]},
      {key:"cooling",title:"Cooling",question:"Air or liquid?",help:"Match the cooling to how hard you push it.",options:[
        {value:"air",name:"High-Airflow Air",detail:"Big fans, easy to maintain.",price:0,image:IMG.laptop},
        {value:"liquid",name:"360mm Liquid Loop",detail:"Cooler and quieter under load.",price:250,image:IMG.wide}
      ]}
    ]
  },

  ally:{
    name:"Ally Maxx",
    tagline:"The handheld that plays anywhere.",
    page:"../Ally%20Maxx/",
    image:IMG.laptop,
    thumb:IMG.tall,
    base:999,
    buildFee:100,
    diy:"Order the barebones handheld, then fit your own storage, battery and sticks.",
    prebuilt:"Every part picked, fitted and tested, ready to play straight out of the box.",
    colour:"Colours the shell, button caps and stick tops.",
    specs:[
      {key:"processor",title:"Processor",question:"Battery life or frame rate?",help:"Handheld-tuned chips that balance battery life against raw speed.",options:[
        {value:"balanced",name:"Balanced",detail:"Tuned for longer play sessions.",price:0,image:IMG.laptop},
        {value:"performance",name:"Performance",detail:"Higher clocks for higher frame rates.",price:200,image:IMG.wide}
      ]},
      {key:"ram",title:"RAM",question:"How much memory?",help:"Fast shared memory for smooth play.",options:[
        {value:"16gb",name:"16GB",detail:"Smooth in most games.",price:0,image:IMG.laptop},
        {value:"24gb",name:"24GB",detail:"Extra headroom for the big ones.",price:100,image:IMG.wide}
      ]},
      {key:"storage",title:"Storage",question:"How many games come with you?",help:"There's a microSD slot for extra room on the go, too.",byo:50,options:[
        {value:"512gb",name:"512GB",detail:"A few big games and plenty of indies.",price:0,image:IMG.laptop},
        {value:"1tb",name:"1TB",detail:"Your whole backlog, finally.",price:100,image:IMG.wide},
        {value:"2tb",name:"2TB",detail:"Leave nothing at home.",price:250,image:IMG.tall}
      ]},
      {key:"display",title:"Display",question:"Which screen?",help:"Both are 1080p at a buttery 120Hz.",options:[
        {value:"lcd",name:"120Hz LCD",detail:"Bright, sharp and smooth.",price:0,image:IMG.laptop},
        {value:"oled",name:"120Hz OLED",detail:"Deeper blacks and richer colour.",price:150,image:IMG.wide}
      ]},
      {key:"battery",title:"Battery",question:"How long do you play?",help:"Both packs swap out in under a minute.",byo:40,options:[
        {value:"standard",name:"Standard",detail:"A few hours of big-budget games.",price:0,image:IMG.laptop},
        {value:"extended",name:"Extended",detail:"Longer sessions, a touch heavier.",price:80,image:IMG.wide}
      ]}
    ]
  },

  flippy:{
    name:"Flippy 6 Pro",
    tagline:"The phone that folds in half.",
    page:"../Flippy%206%20Pro/",
    image:IMG.laptop,
    thumb:IMG.tall,
    base:1699,
    buildFee:120,
    diy:"Order the core phone, then fit your own battery, back panels and cover screen.",
    prebuilt:"Every part picked, fitted and fold-tested, ready to flip straight out of the box.",
    colour:"Colours the frame and the back panel.",
    specs:[
      {key:"processor",title:"Processor",question:"How quick do you need it?",help:"A flagship mobile chip tuned to stay cool and quick, even folded shut.",options:[
        {value:"flagship",name:"Flagship",detail:"Fast, cool and efficient.",price:0,image:IMG.laptop},
        {value:"flagship-max",name:"Flagship Max",detail:"Higher clocks for gaming and video.",price:150,image:IMG.wide}
      ]},
      {key:"ram",title:"RAM",question:"How much do you multitask?",help:"12GB as standard, or step up for heavy multitasking.",options:[
        {value:"12gb",name:"12GB",detail:"Plenty for everyday apps.",price:0,image:IMG.laptop},
        {value:"16gb",name:"16GB",detail:"Split-screen everything, all day.",price:100,image:IMG.wide}
      ]},
      {key:"storage",title:"Storage",question:"How much do you keep on your phone?",help:"Room for all your photos, apps and videos.",options:[
        {value:"256gb",name:"256GB",detail:"Plenty for most people.",price:0,image:IMG.laptop},
        {value:"512gb",name:"512GB",detail:"For the camera-roll hoarders.",price:150,image:IMG.wide},
        {value:"1tb",name:"1TB",detail:"Shoot 4K video without a second thought.",price:350,image:IMG.tall}
      ]},
      {key:"camera",title:"Camera",question:"What do you shoot?",help:"Every camera works straight from the cover screen.",options:[
        {value:"dual",name:"Dual",detail:"50MP main plus an ultra-wide.",price:0,image:IMG.laptop},
        {value:"triple",name:"Triple",detail:"Adds a 3× telephoto for closer shots.",price:150,image:IMG.wide}
      ]},
      {key:"battery",title:"Battery",question:"How long between charges?",help:"Both are replaceable yourself later on.",byo:30,options:[
        {value:"standard",name:"Standard",detail:"Comfortably all day.",price:0,image:IMG.laptop},
        {value:"extended",name:"Extended",detail:"A day and a half, easy.",price:60,image:IMG.wide}
      ]}
    ]
  },

  watchy:{
    name:"Watchy 3",
    tagline:"The watch that tracks it all.",
    page:"../Watchy%203/",
    image:IMG.laptop,
    thumb:IMG.tall,
    base:549,
    buildFee:60,
    diy:"Order the core watch, then fit your own battery, bezel and strap.",
    prebuilt:"Every part picked, fitted and tested, ready to wear straight out of the box.",
    colour:"Colours the case and the strap.",
    specs:[
      {key:"size",title:"Size",question:"Which fits your wrist?",help:"Same features in both, the bigger one just lasts longer.",options:[
        {value:"41mm",name:"41mm",detail:"Slim and light.",price:0,image:IMG.laptop},
        {value:"45mm",name:"45mm",detail:"Bigger screen, bigger battery.",price:50,image:IMG.wide}
      ]},
      {key:"display",title:"Display",question:"Which glass?",help:"An always-on OLED either way, bright enough to read in full sun.",options:[
        {value:"ion",name:"Ion Glass",detail:"Light and tough.",price:0,image:IMG.laptop},
        {value:"sapphire",name:"Sapphire Crystal",detail:"Basically scratch-proof.",price:100,image:IMG.wide}
      ]},
      {key:"sensors",title:"Sensors",question:"How much do you want to track?",help:"All-day health tracking, as deep as you like.",options:[
        {value:"essentials",name:"Essentials",detail:"Heart rate and blood oxygen.",price:0,image:IMG.laptop},
        {value:"full-health",name:"Full Health",detail:"Adds skin temperature and ECG.",price:80,image:IMG.wide}
      ]},
      {key:"battery",title:"Battery",question:"How often do you want to charge?",help:"Both are replaceable yourself later on.",byo:20,options:[
        {value:"standard",name:"Standard",detail:"Two days per charge.",price:0,image:IMG.laptop},
        {value:"extended",name:"Extended",detail:"Up to four days per charge.",price:40,image:IMG.wide}
      ]},
      {key:"connectivity",title:"Connectivity",question:"Leave your phone at home?",help:"Bluetooth and Wi-Fi come standard.",options:[
        {value:"wifi",name:"Bluetooth + Wi-Fi",detail:"Pairs with your phone.",price:0,image:IMG.laptop},
        {value:"lte",name:"Bluetooth + Wi-Fi + LTE",detail:"Calls and texts without your phone.",price:100,image:IMG.wide}
      ]}
    ]
  },

  nuker:{
    name:"Nuker",
    tagline:"The microwave you'll never throw out.",
    page:"../Nuker/",
    image:IMG.laptop,
    thumb:IMG.tall,
    base:349,
    buildFee:40,
    diy:"The high-voltage core ships sealed. You fit the door, turntable and control panel.",
    prebuilt:"Every part picked, fitted and safety-tested, ready to heat straight out of the box.",
    colour:"Colours the body and the door trim.",
    specs:[
      {key:"power",title:"Power",question:"How fast do you need it hot?",help:"More watts, less waiting.",options:[
        {value:"900w",name:"900W",detail:"Great for everyday reheating.",price:0,image:IMG.laptop},
        {value:"1000w",name:"1000W",detail:"A little quicker at everything.",price:40,image:IMG.wide},
        {value:"1200w",name:"1200W Inverter",detail:"Even heat, no more cold middles.",price:90,image:IMG.tall}
      ]},
      {key:"capacity",title:"Capacity",question:"How much do you cook at once?",help:"Compact for small kitchens, family-size for everything else.",options:[
        {value:"23l",name:"23L Compact",detail:"Fits small kitchens.",price:0,image:IMG.laptop},
        {value:"32l",name:"32L Family",detail:"Fits casserole dishes.",price:60,image:IMG.wide}
      ]},
      {key:"turntable",title:"Turntable",question:"Round or flat?",help:"A classic spinning plate, or a flat floor for big square dishes.",byo:15,options:[
        {value:"glass",name:"Glass Turntable",detail:"The classic spinning plate.",price:0,image:IMG.laptop},
        {value:"flat-bed",name:"Flat-Bed",detail:"Fits big square dishes.",price:40,image:IMG.wide}
      ]},
      {key:"presets",title:"Presets",question:"How much should it do for you?",help:"Popcorn, defrost, reheat and more, one tap each.",options:[
        {value:"standard",name:"12 Presets",detail:"All the classics.",price:0,image:IMG.laptop},
        {value:"custom",name:"12 Presets + 6 Custom",detail:"Save your own one-tap programs.",price:20,image:IMG.wide}
      ]},
      {key:"controls",title:"Controls",question:"Dial, buttons or touch?",help:"Swap to a different panel later if you change your mind.",byo:20,options:[
        {value:"dial",name:"Dial",detail:"Twist and go.",price:0,image:IMG.laptop},
        {value:"buttons",name:"Buttons",detail:"Clicky and precise.",price:0,image:IMG.wide},
        {value:"touch",name:"Touch Panel",detail:"Smooth glass, easy to wipe clean.",price:30,image:IMG.tall}
      ]}
    ]
  }
};

// the brand palette. tint gets multiplied over the stage image to recolour it (see .buy-stage-tint), a touch lighter
// than the swatch since multiplying darkens. white leaves the image as it is
const buyColours=[
  {value:"orange",name:"Orange",swatch:"var(--accent)",tint:"#ff4a1c"},
  {value:"purple",name:"Purple",swatch:"var(--accent-2)",tint:"#b414d8"},
  {value:"yellow",name:"Yellow",swatch:"var(--accent-3)",tint:"#ffd84a"},
  {value:"black",name:"Black",swatch:"var(--zone-dark)",tint:"#3b4045"},
  {value:"white",name:"White",swatch:"var(--whiteline)",tint:""}
];

// step one is the product itself, everything after it gets rebuilt whenever that changes
const productStep={
  key:"product",
  title:"Product",
  question:"Which one's for you?",
  help:"Switching keeps your build and colour picks.",
  options:Object.keys(buyProducts).map(key=>({
    value:key,
    name:buyProducts[key].name,
    detail:buyProducts[key].tagline,
    label:"From "+money(buyProducts[key].base),
    thumb:buyProducts[key].thumb,
    image:buyProducts[key].image
  }))
};

// the part a diy build leaves out of the box, tacked on the end of a spec's options
function byoOption(product,spec){
  return{value:"byo",name:"Bring Your Own",detail:"Ships without one, so you can fit your own.",price:-spec.byo,image:product.image};
}

function stepsFor(product,build){
  return[
    productStep,
    {key:"build",title:"Build",question:"Who's putting it together?",help:"Same parts either way. It's your build, your parts, your call.",layout:"cards",options:[
      {value:"diy",name:"DIY",detail:product.diy,price:0,thumb:IMG.wide,image:IMG.wide},
      {value:"prebuilt",name:"Pre-Built",detail:product.prebuilt,price:product.buildFee,thumb:IMG.wide,image:product.image}
    ]},
    ...product.specs.map(spec=>build==="diy" && spec.byo?{...spec,options:spec.options.concat(byoOption(product,spec))}:spec),
    {key:"colour",title:"Colour",question:"Make it unmistakably yours.",help:product.colour,layout:"swatches",
      options:buyColours.map(colour=>({...colour,price:0,image:product.image}))}
  ];
}


// state + elements

const picks={};      // step key -> picked value, product included
let product=null;    // the current buyProducts entry
let steps=[];        // step definitions for the current product, in order
const sections=[];   // the rendered .buy-step for each of those, same order
let currentIndex=0;  // the step crossing the middle of the screen right now (steps.length = the review)

const reviewList=document.getElementById("buyReviewList");
const reviewNote=document.getElementById("buyReviewNote");
const reviewIndex=document.getElementById("buyReviewIndex");
const dotsWrap=document.getElementById("buyDots");
const stageStep=document.getElementById("buyStageStep");
const stageFrame=document.getElementById("buyStageFrame");
const stageTilt=document.getElementById("buyStageTilt");
const stageMedia=document.getElementById("buyStageMedia");
const stageImg=document.getElementById("buyStageImg");
const stageTint=document.getElementById("buyStageTint");
const stagePrice=document.getElementById("buyStagePrice");
const heroImg=document.getElementById("buyHeroImg");
const learnLink=document.getElementById("buyLearn");
const startBtn=document.getElementById("buyStart");
const shareBtn=document.getElementById("buyShare");
const live=document.getElementById("buyLive");
const dialog=document.getElementById("buyDialog");
const dialogSummary=document.getElementById("buyDialogSummary");
const confetti=document.getElementById("buyConfetti");
const totalEls=document.querySelectorAll("[data-buy-total]");

function money(n){return"$"+n.toLocaleString("en-AU");}
function priceLabel(n){return n>0?"+ "+money(n):n<0?"− "+money(-n):"Included";}
function pad(n){return String(n).padStart(2,"0");}
function optionFor(step){return step.options.find(option=>option.value===picks[step.key]);}
function stepIndexOf(key){return steps.findIndex(step=>step.key===key);}
function colourPicked(){return buyColours.find(colour=>colour.value===picks.colour)||null;}

// first step still waiting on a pick, -1 once they all have one. every step after it is locked
function firstOpen(){return steps.findIndex(step=>!optionFor(step));}

// an index one past the last step means the review
function sectionFor(index){return index<steps.length?sections[index]:buyReview;}

function totalPrice(){
  return steps.reduce((sum,step)=>{
    const option=step.key==="product"?null:optionFor(step);
    return sum+(option?option.price:0);
  },product.base);
}


// rendering

function optionHtml(step,option,i){
  const checked=picks[step.key]===option.value?" checked":"";

  if(step.layout==="swatches")return`
    <label class="buy-swatch" style="--i:${i}; --swatch:${option.swatch}">
      <input type="radio" name="${step.key}" value="${option.value}" aria-label="${option.name}"${checked}>
      <span class="buy-swatch-dot"></span>
    </label>`;

  return`
    <label class="buy-option" style="--i:${i}">
      <input type="radio" name="${step.key}" value="${option.value}"${checked}>
      ${option.thumb?`<span class="buy-option-thumb"><img src="${option.thumb}" alt=""></span>`:""}
      <span class="buy-option-text">
        <span class="buy-option-name">${option.name}</span>
        ${option.detail?`<span class="buy-option-detail">${option.detail}</span>`:""}
      </span>
      <span class="buy-option-price">${option.label||priceLabel(option.price)}</span>
    </label>`;
}

function renderStep(step,index){
  const layout=step.layout||"rows";
  const picked=optionFor(step);

  const section=document.createElement("section");
  section.className="buy-step";
  section.id="buy-"+step.key;
  section.innerHTML=`
    <span class="buy-step-index" aria-hidden="true">${pad(index+1)}</span>
    <fieldset class="buy-step-body">
      <legend class="buy-step-head"><span class="buy-step-title">${step.title}.</span> <span class="buy-step-question">${step.question}</span></legend>
      <p class="buy-step-help">${step.help}</p>
      <div class="buy-options buy-options--${layout}">
        <span class="buy-options-indicator" aria-hidden="true"></span>
        ${step.options.map((option,i)=>optionHtml(step,option,i)).join("")}
      </div>
      ${layout==="swatches"?`<p class="buy-swatch-name" aria-hidden="true">${picked?picked.name:""}</p>`:""}
    </fieldset>
    <button type="button" class="buy-step-lock"></button>`;
  return section;
}

// (re)builds every step from `from` onwards. the product step only ever gets built once, so switching product never
// pulls the focused radio out from under a keyboard user
function renderSteps(from){
  sections.splice(from).forEach(section=>{
    unwatch(section);
    section.remove();
  });

  steps.slice(from).forEach((step,i)=>{
    const section=renderStep(step,from+i);
    buyForm.insertBefore(section,buyReview);
    sections.push(section);
    watch(section);
    placeIndicator(section,true);
  });

  reviewIndex.textContent=pad(steps.length+1);
  dotsWrap.innerHTML=steps.concat({title:"Review"}).map((step,i)=>
    `<button type="button" class="buy-dot" data-index="${i}" aria-label="Go to ${step.title}"></button>`).join("");
}

// slides a step's pill onto its checked option. `instant` jumps straight there (first paint, resizes), otherwise it
// glides on the css transition. offsetLeft/Top ignore transforms, so mid-hover or mid-reveal the measure stays true
function placeIndicator(section,instant){
  const group=section.querySelector(".buy-options");
  const indicator=group.querySelector(".buy-options-indicator");
  const checked=group.querySelector("input:checked");

  group.querySelectorAll("label").forEach(label=>label.classList.toggle("is-picked",!!checked && label.contains(checked)));

  if(!checked){indicator.classList.remove("is-on"); return;}

  const label=checked.closest("label");
  const jump=instant || !indicator.classList.contains("is-on");
  if(jump)indicator.style.transition="none";

  indicator.style.left=label.offsetLeft+"px";
  indicator.style.top=label.offsetTop+"px";
  indicator.style.width=label.offsetWidth+"px";
  indicator.style.height=label.offsetHeight+"px";

  if(jump){
    indicator.offsetWidth; // flush the jump before the transition comes back
    indicator.style.transition="";
  }
  indicator.classList.add("is-on");
}

// everything that follows from the picks: which steps are open, the dots, the review, the price, the url
function refresh(){
  const open=firstOpen();
  const done=open===-1;

  sections.forEach((section,i)=>{
    const locked=!done && i>open;
    section.classList.toggle("is-locked",locked);
    section.querySelector(".buy-step-body").disabled=locked;
    if(locked)section.querySelector(".buy-step-lock").textContent=`Choose your ${steps[open].title} first ↑`;
  });

  dotsWrap.querySelectorAll(".buy-dot").forEach((dot,i)=>{
    dot.classList.toggle("is-answered",i<steps.length?!!optionFor(steps[i]):done);
    dot.classList.toggle("is-current",i===currentIndex);
    dot.disabled=!done && i<steps.length && i>open;
  });

  renderReview(open);
  setTotal(totalPrice());

  startBtn.textContent=done?"Review Build":"Start Building";
  syncUrl();
}

function renderReview(open){
  reviewList.innerHTML=steps.map((step,i)=>{
    const option=optionFor(step);
    const cost=step.key==="product"?money(product.base):option?priceLabel(option.price):"";
    return`
      <li class="buy-review-row${option?"":" is-missing"}">
        <span class="buy-review-label">${step.title}</span>
        <span class="buy-review-value">${option?option.name:"Not chosen yet"}</span>
        <span class="buy-review-cost">${cost}</span>
        <button type="button" class="buy-review-change" data-index="${i}">${option?"Change":"Choose"}</button>
      </li>`;
  }).join("");

  const left=steps.filter(step=>!optionFor(step)).length;
  reviewNote.textContent=open===-1
    ?"All picked. Tweak anything you like, then bag it."
    :`${left} ${left===1?"pick":"picks"} to go. Next up: ${steps[open].title}.`;
}

// new product: drop the old one's spec picks (build and colour carry over, every product has those), rebuild the steps
// after the product step, and retitle everything that names it
function switchProduct(){
  product=buyProducts[picks.product];
  Object.keys(picks).forEach(key=>{
    if(key!=="product" && key!=="build" && key!=="colour")delete picks[key];
  });
  steps=stepsFor(product,picks.build);
  renderSteps(1);
  nameProduct();
}

// diy builds get the bring your own options, so going to or from diy rebuilds the specs after the build step. going
// pre-built drops any bring your own picks, since those steps need a real part again
function switchBuild(wasDiy){
  if(wasDiy===(picks.build==="diy"))return;
  Object.keys(picks).forEach(key=>{
    if(picks[key]==="byo")delete picks[key];
  });
  steps=stepsFor(product,picks.build);
  renderSteps(stepIndexOf("build")+1);
}

function nameProduct(){
  document.querySelectorAll("[data-buy-name]").forEach(el=>{el.textContent=product.name;});
  document.querySelectorAll("[data-buy-from]").forEach(el=>{el.textContent=money(product.base);});
  document.title="Buy "+product.name;
  heroImg.src=product.image;
  heroImg.alt=stageImg.alt=product.name+", placeholder image";
  learnLink.setAttribute("href",product.page);
}

// the picks live in the query string, so reloading or sharing the link brings the same build back
function syncUrl(){
  const query=new URLSearchParams();
  steps.forEach(step=>{
    if(picks[step.key])query.set(step.key,picks[step.key]);
  });
  history.replaceState(null,"","?"+query);
}


// the price

const shownTotal={value:0};
let lastTotal=null;

// rolls every price readout (stage, review, dialog) up or down to the new total
function setTotal(value){
  if(value===lastTotal)return;
  const delta=lastTotal===null?0:value-lastTotal;
  lastTotal=value;

  if(hasGsap && !reducedMotion && delta)gsap.to(shownTotal,{value,duration:.7,ease:"power2.out",overwrite:true,onUpdate:paintTotal});
  else{
    shownTotal.value=value;
    paintTotal();
  }

  if(delta)popDelta(delta);
  live.textContent="Total "+money(value);
}

function paintTotal(){
  const text=money(Math.round(shownTotal.value));
  totalEls.forEach(el=>{el.textContent=text;});
}

// the little "+ $300" that pops out beside the stage total
function popDelta(delta){
  if(reducedMotion)return;
  const bubble=document.createElement("span");
  bubble.className="buy-delta";
  bubble.textContent=(delta>0?"+ ":"− ")+money(Math.abs(delta));
  bubble.addEventListener("animationend",()=>bubble.remove());
  stagePrice.appendChild(bubble);
}


// the stage

const loadedImages=new Map();
function loadImage(src){
  if(!loadedImages.has(src)){
    const image=new Image();
    image.src=src;
    loadedImages.set(src,(image.decode?image.decode():Promise.resolve()).catch(()=>{}));
  }
  return loadedImages.get(src);
}

let swapToken=0;

// out to the left, in from the right with a little spin, same direction of travel as the product page reveals. waits
// for the new image to decode first so it never pops in half drawn. `force` replays it even for the same image
function swapStage(src,force){
  if(!src)return;
  if(!force && new URL(src,location.href).href===stageImg.src){bumpStage(); return;}

  const token=++swapToken;
  loadImage(src).then(()=>{
    if(token!==swapToken)return; // a newer pick already took over

    if(!hasGsap || reducedMotion){setStageImage(src); return;}

    gsap.killTweensOf(stageMedia);
    gsap.timeline()
      .to(stageMedia,{x:-70,rotation:-6,opacity:0,duration:.22,ease:"power2.in"})
      .call(()=>setStageImage(src))
      .fromTo(stageMedia,{x:110,rotation:6,scale:.9,opacity:0},{x:0,rotation:0,scale:1,opacity:1,duration:.8,ease:"expo.out"});
  });
}

// same image as before: a little squash and spring instead, so the pick still visibly lands
function bumpStage(){
  if(!hasGsap || reducedMotion)return;
  gsap.fromTo(stageMedia,{scale:.94},{scale:1,duration:.6,ease:"back.out(3)",overwrite:"auto"});
}

function setStageImage(src){
  stageImg.src=src;
  // the tint is masked to the picture's own shape, so the mask follows it onto the new one
  const mask=`url("${stageImg.src}")`;
  stageTint.style.webkitMaskImage=mask;
  stageTint.style.maskImage=mask;
}

// colour: tints the product and the glow behind it
function showColour(colour){
  const tint=colour?colour.tint:"";
  stageTint.style.backgroundColor=tint||"transparent";
  stageTint.classList.toggle("is-on",!!tint);
  stageFrame.style.setProperty("--buy-glow",colour?colour.swatch:"");
}

// hovering (or arrowing onto) a swatch previews it on the stage and names it, leaving puts the real pick back
function previewColour(value){
  const colour=buyColours.find(c=>c.value===value)||colourPicked();
  showColour(colour);

  const section=sections[stepIndexOf("colour")];
  const name=section && section.querySelector(".buy-swatch-name");
  if(name)name.textContent=colour?colour.name:"";
}

// what a pick does to the stage: its image if it has one, plus the tint for the colour step
function showPick(step){
  const option=optionFor(step);
  if(!option)return;
  if(step.key==="colour")previewColour(option.value);
  swapStage(option.image,step.key==="product");
}

// the stage leans toward the cursor a touch. mouse/trackpad only
if(hasGsap && !reducedMotion && matchMedia("(hover:hover) and (pointer:fine)").matches){
  gsap.set(stageTilt,{transformPerspective:900});
  const tiltY=gsap.quickTo(stageTilt,"rotationY",{duration:.7,ease:"power3.out"});
  const tiltX=gsap.quickTo(stageTilt,"rotationX",{duration:.7,ease:"power3.out"});

  stageFrame.addEventListener("pointermove",e=>{
    const rect=stageFrame.getBoundingClientRect();
    tiltY(((e.clientX-rect.left)/rect.width-.5)*16);
    tiltX(-((e.clientY-rect.top)/rect.height-.5)*12);
  });
  stageFrame.addEventListener("pointerleave",()=>{tiltY(0); tiltX(0);});
}


// scrolling

let glide=null;
let advanceTimer=0;

// eased scroll for every jump on this page. tweened through gsap (not css smooth scrolling) for the apple-ish ease,
// and so it can be dropped the moment the user scrolls for themselves
function glideTo(y){
  stopGlide();
  y=Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,y));
  if(!hasGsap || reducedMotion){scrollTo(0,y); return;}

  const from={y:scrollY};
  glide=gsap.to(from,{
    y,
    duration:Math.min(1.3,.55+Math.abs(y-scrollY)/2600),
    ease:"power3.inOut",
    onUpdate:()=>scrollTo(0,from.y),
    onComplete:()=>{glide=null;}
  });
}

function stopGlide(){
  if(glide){glide.kill(); glide=null;}
}

// scrolling for themselves also cancels an advance that hasn't set off yet
function userScrolled(){
  stopGlide();
  clearTimeout(advanceTimer);
}

addEventListener("wheel",userScrolled,{passive:true});
addEventListener("touchmove",userScrolled,{passive:true});
addEventListener("pointerdown",stopGlide);
addEventListener("keydown",e=>{
  if(["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"," "].includes(e.key) && !e.target.closest("input, textarea, select, button"))userScrolled();
});

// glides a step into place, landing where its css scroll-margin-top asks (just under the stage on phones).
// `focus` takes keyboard focus along, onto the step's picked option, its first one, or the review's add to bag
function goTo(index,focus){
  const section=sectionFor(index);
  if(!section)return;
  const margin=parseFloat(getComputedStyle(section).scrollMarginTop)||0;
  glideTo(section.getBoundingClientRect().top+scrollY-margin);

  if(focus){
    const target=section.querySelector("input:checked:enabled")||section.querySelector("input:enabled")||section.querySelector("[type=submit]");
    if(target)target.focus({preventScroll:true});
  }
}

// after a fresh pick, wait a beat (long enough to watch it land and the stage swap) then glide on to the next step
// still waiting on a pick, or the review once there are none left
function queueAdvance(from,focus){
  clearTimeout(advanceTimer);
  advanceTimer=setTimeout(()=>{
    const next=steps.findIndex((step,i)=>i>from && !optionFor(step));
    goTo(next===-1?steps.length:next,focus);
  },reducedMotion?150:450);
}

function goToOpen(focus){
  const open=firstOpen();
  goTo(open===-1?steps.length:open,focus);
}


// observers

// .in-view the first time a step scrolls in (plays its reveal), same -15% look-ahead as the product page reveals
const revealObserver="IntersectionObserver" in window?new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    }
  });
},{rootMargin:"0px 0px -15% 0px"}):null;

// whichever step crosses the middle of the screen is "current" for the stage's step label and dots
const currentObserver="IntersectionObserver" in window?new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting)setCurrent(entry.target===buyReview?steps.length:sections.indexOf(entry.target));
  });
},{rootMargin:"-45% 0px -54% 0px"}):null;

// option groups change size as fonts land and the window resizes, so their pills re-measure along with them
const groupObserver="ResizeObserver" in window?new ResizeObserver(entries=>{
  entries.forEach(entry=>{
    const section=entry.target.closest(".buy-step");
    if(section)placeIndicator(section,true);
  });
}):null;

function watch(section){
  if(revealObserver)revealObserver.observe(section);
  else section.classList.add("in-view");
  if(currentObserver)currentObserver.observe(section);
  if(groupObserver)groupObserver.observe(section.querySelector(".buy-options"));
}

function unwatch(section){
  if(revealObserver)revealObserver.unobserve(section);
  if(currentObserver)currentObserver.unobserve(section);
  if(groupObserver)groupObserver.unobserve(section.querySelector(".buy-options"));
}

function setCurrent(index){
  if(index<0)return;
  currentIndex=index;
  const title=index<steps.length?steps[index].title:"Review";
  stageStep.textContent=`${pad(index+1)} / ${pad(steps.length+1)} · ${title}`;
  dotsWrap.querySelectorAll(".buy-dot").forEach((dot,i)=>dot.classList.toggle("is-current",i===index));
}


// picking

let lastPointer=0;
let lastSpace=0;

buyForm.addEventListener("pointerdown",e=>{
  if(e.target.closest(".buy-option, .buy-swatch"))lastPointer=performance.now();
});

buyForm.addEventListener("keydown",e=>{
  if(e.target.type!=="radio")return;
  if(e.key===" ")lastSpace=performance.now();

  // enter on a picked option means "next", the keyboard version of the auto-advance (it'd submit the form otherwise)
  if(e.key==="Enter"){
    e.preventDefault();
    const index=stepIndexOf(e.target.name);
    if(index!==-1 && optionFor(steps[index]))goTo(index+1,true);
  }
});

buyForm.addEventListener("change",e=>{
  const input=e.target;
  const index=stepIndexOf(input.name);
  if(input.type!=="radio" || index===-1)return;

  const step=steps[index];
  const fresh=!optionFor(step);
  const wasDiy=picks.build==="diy";
  // arrow keys change radios too, but only a click/tap or space counts as "chosen", so arrowing through the options to
  // compare them never yanks the page away
  const chosen=performance.now()-lastPointer<1200 || performance.now()-lastSpace<600;

  picks[step.key]=input.value;
  if(step.key==="product")switchProduct();
  if(step.key==="build")switchBuild(wasDiy);

  placeIndicator(sections[index]);
  showPick(step);
  refresh();

  if(chosen && (fresh || step.key==="product"))queueAdvance(index,false);
});

buyForm.addEventListener("pointerover",e=>{
  const swatch=e.target.closest(".buy-swatch");
  if(swatch && !swatch.closest(".is-locked"))previewColour(swatch.querySelector("input").value);
});

buyForm.addEventListener("pointerout",e=>{
  const swatch=e.target.closest(".buy-swatch");
  if(swatch && !swatch.contains(e.relatedTarget))previewColour(null);
});

buyForm.addEventListener("focusin",e=>{
  if(e.target.closest(".buy-swatch"))previewColour(e.target.value);
});

buyForm.addEventListener("focusout",e=>{
  if(e.target.closest(".buy-swatch"))previewColour(null);
});

// review rows jump back to their step (or to the step holding it up, if it's still locked), the lock note jumps to
// the step it's waiting on. a keyboard click (detail 0) takes focus along with it
buyForm.addEventListener("click",e=>{
  const change=e.target.closest(".buy-review-change");
  if(change){
    const index=Number(change.dataset.index);
    const open=firstOpen();
    goTo(open!==-1 && index>open?open:index,e.detail===0);
    return;
  }
  if(e.target.closest(".buy-step-lock"))goToOpen(true);
});

dotsWrap.addEventListener("click",e=>{
  const dot=e.target.closest(".buy-dot");
  if(dot)goTo(Number(dot.dataset.index),e.detail===0);
});

startBtn.addEventListener("click",e=>goToOpen(e.detail===0));


// add to bag

buyForm.addEventListener("submit",e=>{
  e.preventDefault();
  const open=firstOpen();
  if(open===-1){openDialog(); return;}

  // something's still missing: glide back to it and give its options a shake once it's there
  goTo(open,true);
  const section=sections[open];
  setTimeout(()=>{
    section.classList.remove("is-nudged");
    section.offsetWidth; // restart the shake if it's already played
    section.classList.add("is-nudged");
  },reducedMotion?0:700);
});

function openDialog(){
  dialogSummary.textContent=steps.slice(1).map(step=>optionFor(step).name).join(" · ");
  if(dialog.showModal)dialog.showModal();
  else dialog.setAttribute("open","");
  burstConfetti();
}

function closeDialog(){
  if(dialog.close)dialog.close();
  else dialog.removeAttribute("open");
}

// the dialog fills the screen, so a click that lands on it (not the card) was a click on the backdrop
dialog.addEventListener("click",e=>{
  if(e.target===dialog || e.target.closest("[data-buy-close]"))closeDialog();
});

// brand-coloured confetti bursting out from behind the card, then falling away
function burstConfetti(){
  if(!hasGsap || reducedMotion)return;
  const colours=["var(--accent)","var(--accent-2)","var(--accent-3)","var(--whiteline)"];

  for(let i=0;i<44;i++){
    const piece=document.createElement("span");
    piece.className="buy-confetti-piece";
    piece.style.background=colours[i%colours.length];
    confetti.appendChild(piece);

    const angle=Math.random()*Math.PI*2;
    const distance=160+Math.random()*280;
    gsap.timeline({onComplete:()=>piece.remove()})
      .fromTo(piece,{x:0,y:0,scale:0,rotation:0},{
        x:Math.cos(angle)*distance,
        y:Math.sin(angle)*distance-140,
        scale:.6+Math.random()*.9,
        rotation:Math.random()*540-270,
        duration:.9,
        ease:"power3.out"
      })
      .to(piece,{y:"+=300",opacity:0,duration:1.2,ease:"power1.in"},">-.2");
  }
}

// share: the url already holds the whole build. opens the system share sheet where there is one (phones, safari,
// chromium on windows / chromeos, https only), and falls back to copying the link everywhere else
const canShare=!!navigator.share && window.isSecureContext;
const shareLabel=canShare?"Share":"Copy Link";
shareBtn.textContent=shareLabel;

shareBtn.addEventListener("click",()=>{
  if(canShare){
    navigator.share({
      title:"My "+product.name,
      text:`My ${product.name} build: ${steps.slice(1).map(step=>optionFor(step)).filter(Boolean).map(option=>option.name).join(", ")}.`,
      url:location.href
    }).catch(err=>{
      // closing the sheet rejects too (AbortError), that's not a failure. anything else, copy instead
      if(err.name!=="AbortError")copyLink();
    });
    return;
  }
  copyLink();
});

// clipboard api where allowed (https / localhost), the old execCommand trick everywhere else
function copyLink(){
  const done=ok=>{
    shareBtn.textContent=ok?"Link Copied!":"Couldn't Copy";
    setTimeout(()=>{shareBtn.textContent=shareLabel;},2000);
  };

  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(location.href).then(()=>done(true),()=>done(false));
    return;
  }

  const area=document.createElement("textarea");
  area.value=location.href;
  area.setAttribute("readonly","");
  area.style.position="fixed";
  area.style.opacity="0";
  document.body.appendChild(area);
  area.select();
  let ok=false;
  try{ok=document.execCommand("copy");}catch(err){}
  area.remove();
  done(ok);
}


// start-up: product from the url (lappy if it's missing or not one of ours), then any picks that are valid for it

const query=new URLSearchParams(location.search);
const startProduct=query.get("product");
picks.product=Object.prototype.hasOwnProperty.call(buyProducts,startProduct)?startProduct:"lappy";
product=buyProducts[picks.product];
if(["diy","prebuilt"].includes(query.get("build")))picks.build=query.get("build");
steps=stepsFor(product,picks.build);

steps.forEach(step=>{
  const value=query.get(step.key);
  if(step.key!=="product" && step.options.some(option=>option.value===value))picks[step.key]=value;
});

renderSteps(0);
nameProduct();
setStageImage(product.image);
showColour(colourPicked());

if(revealObserver)revealObserver.observe(buyReview);
else buyReview.classList.add("in-view");
if(currentObserver)currentObserver.observe(buyReview);

setCurrent(0);
refresh();

if(document.fonts && document.fonts.ready)document.fonts.ready.then(()=>sections.forEach(section=>placeIndicator(section,true)));

})();
