// buy page configurator, picks live in the url

(() => {

const buyForm=document.getElementById("buyForm");
const buyReview=document.getElementById("buyReview");
if(!buyForm || !buyReview)return;

const hasGsap=!!window.gsap;
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;


// catalogue

// shared art
const IMG={
  laptop:"../Assets/Lappy/Logo%20in%20laptop.png",
  diy:"../Assets/DIY/diy.png" // pixel art screwdriver, every diy card uses it
};

// real lappy photos, "CPU/Intel L" -> the .webp
function lappyImg(name){return"../Assets/Lappy/"+encodeURI(name)+".webp";}
// same for flippy, "SOC/SOC Elite L" -> the .webp
function flippyImg(name){return"../Assets/Flippy%206/"+encodeURI(name)+".webp";}
// and watchy, "Size/41mm L" -> the .webp
function watchyImg(name){return"../Assets/Watchy%203/"+encodeURI(name)+".webp";}
// and nuker, "Power/900W L" -> the .webp
function nukerImg(name){return"../Assets/Nuker/"+encodeURI(name)+".webp";}
// and gammy, "CPU/8-Core L" -> the .webp
function gammyImg(name){return"../Assets/Gammy%20Pro%20Max/"+encodeURI(name)+".webp";}
// and ally, "Display/OLED L" -> the .webp
function allyImg(name){return"../Assets/Ally%20Maxx/"+encodeURI(name)+".webp";}

// prices in dollars, byo knocks the part off
const buyProducts={
  lappy:{
    name:"Lappy 13 Pro",
    tagline:"The laptop you can fix yourself.",
    page:"../Lappy/",
    image:IMG.laptop,
    thumb:IMG.laptop,
    base:1499,
    buildFee:150,
    diy:"Order the barebones chassis, then fit your own RAM, storage, battery and ports at your own pace.",
    prebuilt:"Every part picked, fitted and tested, so it all just works and none of the stress lands on you.",
    alt:"Lappy 13 Pro with the Squircle logo on screen",
    banner:lappyImg("Views/Screen L"),
    diyImage:lappyImg("Views/Keyboard L"),
    prebuiltImage:lappyImg("Views/Top L"),
    specs:[
      {key:"cpu",title:"CPU",question:"Intel or AMD?",help:"Both stay fast, cool and quiet. Pick the one that suits how you work.",options:[
        {value:"intel",name:"Intel Core Ultra 7",detail:"All-day battery and quick everyday speed.",price:0,image:lappyImg("CPU/Intel L")},
        {value:"amd",name:"AMD Ryzen AI 9",detail:"Extra graphics muscle for games and creative apps.",price:200,image:lappyImg("CPU/AMD L")}
      ]},
      {key:"ram",title:"RAM",question:"How much do you multitask?",help:"You can upgrade it yourself later, so there's no wrong answer.",byo:40,byoImage:lappyImg("RAM/RAM L"),options:[
        {value:"8gb",name:"8GB",detail:"Browsing, docs and streaming.",price:0,image:lappyImg("RAM/8GB L")},
        {value:"16gb",name:"16GB",detail:"Comfortable for most people.",price:150,image:lappyImg("RAM/16GB L")},
        {value:"32gb",name:"32GB",detail:"Big projects and a silly number of tabs.",price:350,image:lappyImg("RAM/32GB L")},
        {value:"64gb",name:"64GB",detail:"Virtual machines and heavy editing.",price:700,image:lappyImg("RAM/64GB L")}
      ]},
      {key:"storage",title:"Storage",question:"How much room do you need?",help:"Swap the drive out yourself whenever you need more.",byo:50,byoImage:lappyImg("Views/Keyboard L"),options:[
        {value:"512gb",name:"512GB",detail:"Apps, docs and a decent photo library.",price:0,image:lappyImg("Storage/512GB L")},
        {value:"1tb",name:"1TB",detail:"Room for games and big files.",price:150,image:lappyImg("Storage/1TB L")},
        {value:"2tb",name:"2TB",detail:"Never think about storage again.",price:400,image:lappyImg("Storage/2TB L")},
        {value:"4tb",name:"4TB",detail:"Every game, photo and project, all at once.",price:800,image:lappyImg("Storage/4TB L")}
      ]},
      {key:"battery",title:"Battery",question:"How long between charges?",help:"Both swap out in minutes with a single screwdriver.",byo:40,byoImage:lappyImg("Views/Keyboard L"),options:[
        {value:"standard",name:"Standard",detail:"A full day of school or work.",price:0,image:lappyImg("Battery/Battery L")},
        {value:"plus",name:"Battery Plus",detail:"Hours more between charges, a touch heavier.",price:100,image:lappyImg("Battery/Battery Plus L")}
      ]},
      {key:"cards",title:"Expansion Cards",question:"Which ports do you want?",help:"Four swappable bays. Change your mind any time.",byo:40,options:[
        {value:"essentials",name:"Essentials",detail:"2× USB-C, USB-A and HDMI.",price:0,image:IMG.laptop},
        {value:"creator",name:"Creator",detail:"2× USB-C, SD card reader and DisplayPort.",price:40,image:lappyImg("Views/Bottom L")},
        {value:"everything",name:"Everything",detail:"Four cards, plus two spares in the box.",price:90,image:lappyImg("Views/Top L")}
      ]}
    ]
  },

  gammy:{
    name:"Gammy Pro Max",
    tagline:"The liquid-cooled gaming PC.",
    page:"../Gammy%20Pro%20Max/",
    image:gammyImg("Hero"),
    thumb:gammyImg("Views/Front P"),
    base:2999,
    buildFee:200,
    diy:"Order the case, board and power supply, then fit your own GPU, CPU, RAM and storage.",
    prebuilt:"Fitted, cable-managed and stress-tested before it ships. Just plug it in and play.",
    alt:"Gammy Pro Max gaming PC, seen at an angle",
    banner:gammyImg("Views/Inside L"),
    diyImage:gammyImg("Views/Angle L"),
    prebuiltImage:gammyImg("Views/Front L"),
    specs:[
      {key:"cpu",title:"CPU",question:"How hard will you push it?",help:"Solid mid-range all the way up to top-tier gaming and streaming power.",byo:250,byoImage:gammyImg("Views/Angle L"),options:[
        {value:"8-core",name:"8-Core",detail:"Smooth gaming at high settings.",price:0,image:gammyImg("CPU/8-Core L")},
        {value:"12-core",name:"12-Core",detail:"Game and stream at the same time.",price:250,image:gammyImg("CPU/12-Core L")},
        {value:"16-core",name:"16-Core",detail:"Top-tier power for everything at once.",price:550,image:gammyImg("CPU/16-Core L")}
      ]},
      {key:"gpu",title:"GPU",question:"What resolution do you play at?",help:"From smooth 1440p all the way up to high-refresh 4K.",byo:500,byoImage:gammyImg("Views/Angle L"),options:[
        {value:"1440p",name:"1440p Ready",detail:"High frame rates at 1440p.",price:0,image:gammyImg("GPU/1440p L")},
        {value:"4k",name:"4K Ready",detail:"Smooth 4K at high settings.",price:600,image:gammyImg("GPU/4K L")},
        {value:"4k-high-refresh",name:"4K High-Refresh",detail:"4K at 144Hz and beyond.",price:1200,image:gammyImg("GPU/4K High-Refresh L")}
      ]},
      {key:"ram",title:"RAM",question:"How much memory do you need?",help:"There are free slots to add more yourself later on.",byo:60,byoImage:gammyImg("Views/Angle L"),options:[
        {value:"16gb",name:"16GB",detail:"Plenty for gaming.",price:0,image:gammyImg("RAM/16GB L")},
        {value:"32gb",name:"32GB",detail:"Gaming with Discord, a browser and a stream open.",price:120,image:gammyImg("RAM/32GB L")},
        {value:"64gb",name:"64GB",detail:"Video editing and 3D work.",price:300,image:gammyImg("RAM/64GB L")},
        {value:"128gb",name:"128GB",detail:"Because you can.",price:650,image:gammyImg("RAM/128GB L")}
      ]},
      {key:"storage",title:"Storage",question:"How big is your game library?",help:"Fast NVMe drives plus spare bays, so you never run out of room.",byo:80,byoImage:gammyImg("Views/Angle L"),options:[
        {value:"1tb",name:"1TB NVMe",detail:"A healthy handful of big games.",price:0,image:gammyImg("Storage/1TB L")},
        {value:"2tb",name:"2TB NVMe",detail:"Most of your library, installed.",price:150,image:gammyImg("Storage/2TB L")},
        {value:"4tb",name:"4TB NVMe",detail:"Never uninstall anything again.",price:400,image:gammyImg("Storage/4TB L")}
      ]}
    ]
  },

  ally:{
    name:"Ally Maxx",
    tagline:"The handheld that plays anywhere.",
    page:"../Ally%20Maxx/",
    image:allyImg("Hero"),
    thumb:allyImg("Views/Front P"),
    base:999,
    buildFee:100,
    diy:"Order the barebones handheld, then fit your own storage, battery and sticks.",
    prebuilt:"Every part picked, fitted and tested, ready to play straight out of the box.",
    alt:"Ally Maxx handheld gaming PC, seen at an angle",
    banner:allyImg("Views/Top L"),
    diyImage:allyImg("Views/Back L"),
    prebuiltImage:allyImg("Views/Angle L"),
    specs:[
      {key:"processor",title:"Processor",question:"Battery life or frame rate?",help:"Handheld-tuned chips that balance battery life against raw speed.",options:[
        {value:"balanced",name:"Balanced",detail:"Tuned for longer play sessions.",price:0,image:allyImg("Processor/Balanced L")},
        {value:"performance",name:"Performance",detail:"Higher clocks for higher frame rates.",price:200,image:allyImg("Processor/Performance L")}
      ]},
      {key:"ram",title:"RAM",question:"How much memory?",help:"Fast shared memory for smooth play.",options:[
        {value:"16gb",name:"16GB",detail:"Smooth in most games.",price:0,image:allyImg("RAM/16GB L")},
        {value:"24gb",name:"24GB",detail:"Extra headroom for the big ones.",price:100,image:allyImg("RAM/24GB L")}
      ]},
      {key:"storage",title:"Storage",question:"How many games come with you?",help:"There's a microSD slot for extra room on the go, too.",byo:50,byoImage:allyImg("Views/Back L"),options:[
        {value:"512gb",name:"512GB",detail:"A few big games and plenty of indies.",price:0,image:allyImg("Storage/512GB L")},
        {value:"1tb",name:"1TB",detail:"Your whole backlog, finally.",price:100,image:allyImg("Storage/1TB L")},
        {value:"2tb",name:"2TB",detail:"Leave nothing at home.",price:250,image:allyImg("Storage/2TB L")}
      ]},
      {key:"display",title:"Display",question:"Which screen?",help:"Both are 1080p at a buttery 120Hz.",options:[
        {value:"lcd",name:"120Hz LCD",detail:"Bright, sharp and smooth.",price:0,image:allyImg("Display/LCD L")},
        {value:"oled",name:"120Hz OLED",detail:"Deeper blacks and richer colour.",price:150,image:allyImg("Display/OLED L")}
      ]},
      {key:"battery",title:"Battery",question:"How long do you play?",help:"Both packs swap out in under a minute.",byo:40,byoImage:allyImg("Views/Back L"),options:[
        {value:"standard",name:"Standard",detail:"A few hours of big-budget games.",price:0,image:allyImg("Battery/Battery L")},
        {value:"extended",name:"Extended",detail:"Longer sessions, a touch heavier.",price:80,image:allyImg("Battery/Extended L")}
      ]}
    ]
  },

  flippy:{
    name:"Flippy 6 Pro",
    tagline:"The phone that folds in half.",
    page:"../Flippy%206%20Pro/",
    image:flippyImg("Hero"),
    thumb:flippyImg("Views/Cover Screen P"),
    base:1699,
    buildFee:120,
    diy:"Order the core phone, then fit your own battery, back panels and cover screen.",
    prebuilt:"Every part picked, fitted and fold-tested, ready to flip straight out of the box.",
    alt:"Flippy 6 Pro folding phone, half open",
    banner:flippyImg("Views/Main Screen L"),
    diyImage:flippyImg("Views/Side L"),
    prebuiltImage:flippyImg("Views/Stand Mode L"),
    specs:[
      {key:"processor",title:"Processor",question:"How quick do you need it?",help:"A flagship mobile chip tuned to stay cool and quick, even folded shut.",options:[
        {value:"8-gen-3",name:"Snapdragon 8 Gen 3",detail:"Fast, cool and efficient.",price:0,image:flippyImg("SOC/SOC L")},
        {value:"8-elite",name:"Snapdragon 8 Elite",detail:"Higher clocks for gaming and video.",price:150,image:flippyImg("SOC/SOC Elite L")}
      ]},
      {key:"ram",title:"RAM",question:"How much do you multitask?",help:"8GB as standard, or step up for heavy multitasking.",options:[
        {value:"8gb",name:"8GB",detail:"Plenty for everyday apps.",price:0,image:flippyImg("RAM/8GB L")},
        {value:"16gb",name:"16GB",detail:"Split-screen everything, all day.",price:100,image:flippyImg("RAM/16GB L")}
      ]},
      {key:"storage",title:"Storage",question:"How much do you keep on your phone?",help:"Room for all your photos, apps and videos.",options:[
        {value:"256gb",name:"256GB",detail:"Plenty for most people.",price:0,image:flippyImg("Storage/256GB L")},
        {value:"512gb",name:"512GB",detail:"For the camera-roll hoarders.",price:150,image:flippyImg("Storage/512GB L")},
        {value:"1tb",name:"1TB",detail:"Shoot 4K video without a second thought.",price:350,image:flippyImg("Storage/1TB L")}
      ]},
      {key:"battery",title:"Battery",question:"How long between charges?",help:"Both are replaceable yourself later on.",byo:30,byoImage:flippyImg("Views/Side L"),options:[
        {value:"standard",name:"Standard",detail:"Comfortably all day.",price:0,image:flippyImg("Battery/Battery L")},
        {value:"plus",name:"Battery Plus",detail:"A day and a half, easy.",price:60,image:flippyImg("Battery/Battery Plus L")}
      ]}
    ]
  },

  watchy:{
    name:"Watchy 3",
    tagline:"The watch that tracks it all.",
    page:"../Watchy%203/",
    image:watchyImg("Hero"),
    thumb:watchyImg("Views/Flat P"),
    base:549,
    buildFee:60,
    diy:"Order the core watch, then fit your own battery, bezel and strap.",
    prebuilt:"Every part picked, fitted and tested, ready to wear straight out of the box.",
    alt:"Watchy 3 smartwatch, seen at an angle",
    banner:watchyImg("Views/Flat L"),
    diyImage:watchyImg("Views/Side L"),
    prebuiltImage:watchyImg("Views/Angle L"),
    specs:[
      {key:"size",title:"Size",question:"Which fits your wrist?",help:"Same features in both, the bigger one just lasts longer.",options:[
        {value:"41mm",name:"41mm",detail:"Slim and light.",price:0,image:watchyImg("Size/41mm L")},
        {value:"46mm",name:"46mm",detail:"Bigger screen, bigger battery.",price:50,image:watchyImg("Size/46mm L")}
      ]},
      {key:"display",title:"Display",question:"Which glass?",help:"An always-on OLED either way, bright enough to read in full sun.",options:[
        {value:"ion",name:"Ion Glass",detail:"Light and tough.",price:0,image:watchyImg("Display/Glass L")},
        {value:"sapphire",name:"Sapphire Glass",detail:"Basically scratch-proof.",price:100,image:watchyImg("Display/Sapphire Glass L")}
      ]},
      {key:"sensors",title:"Sensors",question:"How much do you want to track?",help:"All-day health tracking, as deep as you like.",options:[
        {value:"essentials",name:"Essentials",detail:"Heart rate and blood oxygen.",price:0,image:watchyImg("Sensors/Sensors L")},
        {value:"full-health",name:"Full Health",detail:"Adds skin temperature and ECG.",price:80,image:watchyImg("Sensors/Sensors Plus L")}
      ]},
      {key:"battery",title:"Battery",question:"How often do you want to charge?",help:"Both are replaceable yourself later on.",byo:20,byoImage:watchyImg("Views/Angle L"),options:[
        {value:"standard",name:"Standard",detail:"Two days per charge.",price:0,image:watchyImg("Battery/Battery L")},
        {value:"plus",name:"Battery Plus",detail:"Up to four days per charge.",price:40,image:watchyImg("Battery/Battery Plus L")}
      ]},
      {key:"connectivity",title:"Connectivity",question:"Leave your phone at home?",help:"Bluetooth and Wi-Fi come standard.",options:[
        {value:"wifi",name:"Bluetooth + Wi-Fi",detail:"Pairs with your phone.",price:0,image:watchyImg("Connectivity/Wifi L")},
        {value:"lte",name:"Bluetooth + Wi-Fi + LTE",detail:"Calls and texts without your phone.",price:100,image:watchyImg("Connectivity/Wifi Cell L")}
      ]}
    ]
  },

  nuker:{
    name:"Nuker",
    tagline:"The microwave you'll never throw out.",
    page:"../Nuker/",
    image:nukerImg("Hero"),
    thumb:nukerImg("Views/Front P"),
    base:349,
    buildFee:40,
    diy:"The high-voltage core ships sealed. You fit the door, turntable and control panel.",
    prebuilt:"Every part picked, fitted and safety-tested, ready to heat straight out of the box.",
    alt:"Nuker microwave, seen from the front",
    banner:nukerImg("Views/Door Mesh L"),
    diyImage:nukerImg("Views/Door Off L"),
    prebuiltImage:nukerImg("Views/Front L"),
    specs:[
      {key:"power",title:"Power",question:"How fast do you need it hot?",help:"More watts, less waiting.",options:[
        {value:"900w",name:"900W",detail:"Great for everyday reheating.",price:0,image:nukerImg("Power/900W L")},
        {value:"1000w",name:"1000W",detail:"A little quicker at everything.",price:40,image:nukerImg("Power/1000W L")},
        {value:"1200w",name:"1200W Inverter",detail:"Even heat, no more cold middles.",price:90,image:nukerImg("Power/1200W Inverter L")}
      ]},
      {key:"capacity",title:"Capacity",question:"How much do you cook at once?",help:"Compact for small kitchens, family-size for everything else.",options:[
        {value:"23l",name:"23L Compact",detail:"Fits small kitchens.",price:0,image:nukerImg("Capacity/23L L")},
        {value:"32l",name:"32L Family",detail:"Fits casserole dishes.",price:60,image:nukerImg("Capacity/32L L")}
      ]},
      {key:"turntable",title:"Turntable",question:"Round or flat?",help:"A classic spinning plate, or a flat floor for big square dishes.",byo:15,byoImage:nukerImg("Views/Turntable L"),options:[
        {value:"glass",name:"Glass Turntable",detail:"The classic spinning plate.",price:0,image:nukerImg("Turntable/Glass Turntable L")},
        {value:"flat-bed",name:"Flat-Bed",detail:"Fits big square dishes.",price:40,image:nukerImg("Turntable/Flat-Bed L")}
      ]},
      {key:"presets",title:"Presets",question:"How much should it do for you?",help:"Popcorn, defrost, reheat and more, one tap each.",options:[
        {value:"standard",name:"12 Presets",detail:"All the classics.",price:0,image:nukerImg("Presets/Presets L")},
        {value:"custom",name:"12 Presets + 6 Custom",detail:"Save your own one-tap programs.",price:20,image:nukerImg("Presets/Presets Plus L")}
      ]},
      {key:"controls",title:"Controls",question:"Dial, buttons or touch?",help:"Swap to a different panel later if you change your mind.",byo:20,byoImage:nukerImg("Views/Controls L"),options:[
        {value:"dial",name:"Dial",detail:"Twist and go.",price:0,image:nukerImg("Controls/Dial L")},
        {value:"buttons",name:"Buttons",detail:"Clicky and precise.",price:0,image:nukerImg("Controls/Buttons L")},
        {value:"touch",name:"Touch Panel",detail:"Smooth glass, easy to wipe clean.",price:30,image:nukerImg("Controls/Touch Panel L")}
      ]}
    ]
  }
};

// step one is the product
const productStep={
  key:"product",
  title:"Product",
  question:"Which one's for you?",
  help:"Switching keeps your build pick.",
  options:Object.keys(buyProducts).map(key=>({
    value:key,
    name:buyProducts[key].name,
    detail:buyProducts[key].tagline,
    label:"From "+money(buyProducts[key].base),
    thumb:buyProducts[key].thumb,
    image:buyProducts[key].image
  }))
};

// bring your own option
function byoOption(product,spec){
  return{value:"byo",name:"Bring Your Own",detail:"Ships without one, so you can fit your own.",price:-spec.byo,image:spec.byoImage||product.image};
}

function stepsFor(product,build){
  const diyImage=product.diyImage||IMG.laptop;
  const prebuiltImage=product.prebuiltImage||IMG.laptop;
  return[
    productStep,
    {key:"build",title:"Build",question:"Who's putting it together?",help:"Same parts either way. It's your build, your parts, your call.",layout:"cards",options:[
      {value:"diy",name:"DIY",detail:product.diy,price:0,thumb:IMG.diy,icon:true,image:diyImage},
      {value:"prebuilt",name:"Pre-Built",detail:product.prebuilt,price:product.buildFee,thumb:prebuiltImage,image:product.prebuiltImage||product.image}
    ]},
    ...product.specs.map(spec=>build==="diy" && spec.byo?{...spec,options:spec.options.concat(byoOption(product,spec))}:spec)
  ];
}


// state + elements

const picks={};      // step key -> picked value, product included
let product=null;    // the current buyProducts entry
let steps=[];        // steps for this product
const sections=[];   // .buy-step per step
let currentIndex=0;  // step in the middle of the screen

const reviewList=document.getElementById("buyReviewList");
const reviewNote=document.getElementById("buyReviewNote");
const reviewIndex=document.getElementById("buyReviewIndex");
const dotsWrap=document.getElementById("buyDots");
const stageStep=document.getElementById("buyStageStep");
const stageFrame=document.getElementById("buyStageFrame");
const stageTilt=document.getElementById("buyStageTilt");
const stageMedia=document.getElementById("buyStageMedia");
const stageImg=document.getElementById("buyStageImg");
const stagePrice=document.getElementById("buyStagePrice");
const heroImg=document.getElementById("buyHeroImg");
const bannerImg=document.getElementById("buyBannerImg");
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

// first unpicked step, -1 if done
function firstOpen(){return steps.findIndex(step=>!optionFor(step));}

// past the last step = review
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
  return`
    <label class="buy-option" style="--i:${i}">
      <input type="radio" name="${step.key}" value="${option.value}"${checked}>
      ${option.thumb?`<span class="buy-option-thumb${option.icon?" buy-option-thumb--icon":""}"><img src="${option.thumb}" alt=""></span>`:""}
      <span class="buy-option-text">
        <span class="buy-option-name">${option.name}</span>
        ${option.detail?`<span class="buy-option-detail">${option.detail}</span>`:""}
      </span>
      <span class="buy-option-price">${option.label||priceLabel(option.price)}</span>
    </label>`;
}

function renderStep(step,index){
  const layout=step.layout||"rows";

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
    </fieldset>
    <button type="button" class="buy-step-lock"></button>`;
  return section;
}

// rebuild steps from `from` onwards
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

// slide a step's pill onto its pick
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

// update everything after a pick
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

// switch product
function switchProduct(){
  product=buyProducts[picks.product];
  Object.keys(picks).forEach(key=>{
    if(key!=="product" && key!=="build")delete picks[key];
  });
  steps=stepsFor(product,picks.build);
  renderSteps(1);
  nameProduct();
}

// diy adds byo options, pre-built drops them
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
  heroImg.alt=stageImg.alt=product.alt||product.name+", placeholder image";
  // closing banner, placeholder until a product has its own shot
  bannerImg.src=product.banner||IMG.laptop;
  bannerImg.alt=product.banner?product.name:"Placeholder image";
  learnLink.setAttribute("href",product.page);
}

// sync picks to the url
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

// roll price readouts to the new total
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

// "+ $300" pop beside the total
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

// swap the stage image once it's decoded
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

// same image: squash and spring instead
function bumpStage(){
  if(!hasGsap || reducedMotion)return;
  gsap.fromTo(stageMedia,{scale:.94},{scale:1,duration:.6,ease:"back.out(3)",overwrite:"auto"});
}

function setStageImage(src){
  stageImg.src=src;
}

// apply a pick to the stage
function showPick(step){
  const option=optionFor(step);
  if(!option)return;
  swapStage(option.image,step.key==="product");
}

// stage leans toward the cursor
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

// gsap eased scroll, cancels if the user scrolls
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

// user scroll cancels a pending advance
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

// glide to a step, optionally moving focus
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

// auto-advance to the next step after a pick
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

// reveal steps on first view
const revealObserver="IntersectionObserver" in window?new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    }
  });
},{rootMargin:"0px 0px -15% 0px"}):null;

// track the current step
const currentObserver="IntersectionObserver" in window?new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting)setCurrent(entry.target===buyReview?steps.length:sections.indexOf(entry.target));
  });
},{rootMargin:"-45% 0px -54% 0px"}):null;

// remeasure pills on resize
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
  if(e.target.closest(".buy-option"))lastPointer=performance.now();
});

buyForm.addEventListener("keydown",e=>{
  if(e.target.type!=="radio")return;
  if(e.key===" ")lastSpace=performance.now();

  // enter = next
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
  // arrowing doesn't auto-advance
  const chosen=performance.now()-lastPointer<1200 || performance.now()-lastSpace<600;

  picks[step.key]=input.value;
  if(step.key==="product")switchProduct();
  if(step.key==="build")switchBuild(wasDiy);

  placeIndicator(sections[index]);
  showPick(step);
  refresh();

  if(chosen && (fresh || step.key==="product"))queueAdvance(index,false);
});

// review rows jump back to their step
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

  // something's missing, go shake it
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

// backdrop click
dialog.addEventListener("click",e=>{
  if(e.target===dialog || e.target.closest("[data-buy-close]"))closeDialog();
});

// confetti
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

// share sheet, or copy the link
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
      // AbortError is fine, else copy
      if(err.name!=="AbortError")copyLink();
    });
    return;
  }
  copyLink();
});

// copy to clipboard
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


// start-up

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

if(revealObserver)revealObserver.observe(buyReview);
else buyReview.classList.add("in-view");
if(currentObserver)currentObserver.observe(buyReview);

setCurrent(0);
refresh();

if(document.fonts && document.fonts.ready)document.fonts.ready.then(()=>sections.forEach(section=>placeIndicator(section,true)));

})();
