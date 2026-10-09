// shop page (Shop/index.html): every product in one place, filters on the left narrowing down the grid on the right.
// the cards are plain html (so they're all still there without js), each carrying its category + price in data
// attributes. the filters ride along in the query string like the buy page's picks, so a filtered view survives a
// reload and can be shared as a link

(() => {

const form=document.getElementById("shopForm");
const grid=document.getElementById("shopGrid");
if(!form || !grid)return;

const hasGsap=!!window.gsap;
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;

const items=Array.from(grid.querySelectorAll(".shop-item"));
const featured=items.slice(); // the order they're written in is the featured order
const chips=Array.from(form.querySelectorAll(".shop-chip"));

const filters=document.getElementById("shopFilters");
const toggle=document.getElementById("shopToggle");
const toggleText=document.getElementById("shopToggleText");
const activeCount=document.getElementById("shopActive");
const title=document.getElementById("shopTitle");
const count=document.getElementById("shopCount");
const empty=document.getElementById("shopEmpty");
const priceInput=document.getElementById("shopPrice");
const priceValue=document.getElementById("shopPriceValue");
const sortGroup=document.getElementById("shopSort");
const sortIndicator=sortGroup.querySelector(".shop-sort-indicator");
const resetBtns=document.querySelectorAll("[data-shop-reset]");

const priceMin=Number(priceInput.min);
const priceMax=Number(priceInput.max);

function money(n){return"$"+n.toLocaleString("en-AU");}
function categoriesOf(item){return item.dataset.category.split(" ");}

// "Computers", "Computers & Gaming", "Computers, Gaming & Mobile"
function listNames(names){return names.length>1?names.slice(0,-1).join(", ")+" & "+names[names.length-1]:names[0];}

// what the filters are set to right now
function readState(){
  const sort=form.querySelector('input[name="sort"]:checked');
  return{
    categories:Array.from(form.querySelectorAll('input[name="category"]:checked'),input=>input.value),
    max:Number(priceInput.value),
    sort:sort?sort.value:"featured"
  };
}

function fitsPrice(item,state){return Number(item.dataset.price)<=state.max;}

// a card shows if it's in any of the ticked categories (or none are ticked) and doesn't cost more than the max price
function matches(item,state){
  const inCategory=!state.categories.length || categoriesOf(item).some(category=>state.categories.includes(category));
  return inCategory && fitsPrice(item,state);
}

const sorters={
  featured:(a,b)=>featured.indexOf(a)-featured.indexOf(b),
  "price-asc":(a,b)=>a.dataset.price-b.dataset.price,
  "price-desc":(a,b)=>b.dataset.price-a.dataset.price,
  name:(a,b)=>a.dataset.name.localeCompare(b.dataset.name)
};


// filtering + sorting

let lastLayout=null;

function apply(instant){
  const state=readState();
  const ordered=items.slice().sort(sorters[state.sort]||sorters.featured);
  const shown=ordered.filter(item=>matches(item,state));
  const layout=shown.map(item=>item.dataset.product).join();

  // the price slider fires on every step and most of them change nothing, so the cards only move when the result does
  if(layout!==lastLayout){
    lastLayout=layout;
    rearrange(ordered,shown,instant);
  }

  paint(state,shown.length);
}

// FLIP: note where every showing card is, make the change, then slide each one from where it was to where it's
// landed. cards that weren't showing before pop in instead, ones that drop out just go
function rearrange(ordered,shown,instant){
  const animate=hasGsap && !reducedMotion && !instant;
  const before=new Map();

  if(animate){
    // measured mid-slide on purpose, so a quick second change carries on from wherever the cards actually are
    items.forEach(item=>{if(!item.hidden)before.set(item,item.getBoundingClientRect());});
    gsap.killTweensOf(items);
    gsap.set(items,{clearProps:"transform,opacity"});
  }

  items.forEach(item=>{item.hidden=!shown.includes(item);});

  // only shuffle the html when the order really changed, moving a node is what puts it in its new reading/tab order
  if(ordered.some((item,i)=>grid.children[i]!==item))ordered.forEach(item=>grid.appendChild(item));

  empty.hidden=shown.length>0;

  if(!animate)return;

  shown.forEach((item,i)=>{
    const was=before.get(item);

    if(!was){
      gsap.fromTo(item,{opacity:0,scale:.9},{opacity:1,scale:1,duration:.55,delay:i*.04,ease:"back.out(1.6)",clearProps:"transform,opacity"});
      return;
    }

    const now=item.getBoundingClientRect();
    const dx=was.left-now.left;
    const dy=was.top-now.top;
    if(dx || dy)gsap.fromTo(item,{x:dx,y:dy},{x:0,y:0,duration:.7,ease:"power3.out",clearProps:"transform"});
  });
}

// everything that reads the filters back: chip counts, the price readout, the heading, the result count, reset
function paint(state,shownCount){
  // category counts follow the price, so each one says how many you'd actually get by ticking it
  chips.forEach(chip=>{
    const value=chip.querySelector("input").value;
    const n=items.filter(item=>categoriesOf(item).includes(value) && fitsPrice(item,state)).length;
    chip.querySelector(".shop-chip-count").textContent=n;
    chip.classList.toggle("is-empty",!n);
  });

  const anyPrice=state.max>=priceMax;
  const priceText=anyPrice?"Any Price":"Up to "+money(state.max);
  priceValue.textContent=priceText;
  priceInput.setAttribute("aria-valuetext",priceText);
  priceInput.style.setProperty("--fill",(state.max-priceMin)/(priceMax-priceMin)*100+"%");

  const active=state.categories.length+(anyPrice?0:1);
  activeCount.textContent=active;
  activeCount.hidden=!active;
  resetBtns.forEach(btn=>{btn.disabled=!active && state.sort==="featured";});

  const names=chips.filter(chip=>chip.querySelector("input").checked).map(chip=>chip.querySelector(".shop-chip-name").textContent);
  title.textContent=names.length?listNames(names):"All Products";
  count.textContent=shownCount===items.length?`${items.length} products`:`Showing ${shownCount} of ${items.length}`;

  placeIndicator();
}

// slides the sort pill onto the picked row. `instant` jumps straight there (first paint, resizes) rather than gliding
function placeIndicator(instant){
  const checked=sortGroup.querySelector("input:checked");
  if(!checked){sortIndicator.classList.remove("is-on"); return;}

  const label=checked.closest("label");
  sortGroup.querySelectorAll("label").forEach(row=>row.classList.toggle("is-picked",row===label));

  const jump=instant || !sortIndicator.classList.contains("is-on");
  if(jump)sortIndicator.style.transition="none";

  sortIndicator.style.top=label.offsetTop+"px";
  sortIndicator.style.height=label.offsetHeight+"px";

  if(jump){
    sortIndicator.offsetWidth; // flush the jump before the transition comes back
    sortIndicator.style.transition="";
  }
  sortIndicator.classList.add("is-on");
}

// only the filters that aren't at their defaults go in the url. runs on change rather than on every slider step,
// since browsers cap how often a page can rewrite its url
function syncUrl(){
  const state=readState();
  const query=new URLSearchParams();
  state.categories.forEach(category=>query.append("category",category));
  if(state.max<priceMax)query.set("max",state.max);
  if(state.sort!=="featured")query.set("sort",state.sort);

  const search=query.toString();
  history.replaceState(null,"",location.pathname+(search?"?"+search:"")+location.hash);
}

form.addEventListener("input",()=>apply());
form.addEventListener("change",syncUrl);
form.addEventListener("submit",e=>e.preventDefault());

resetBtns.forEach(btn=>btn.addEventListener("click",()=>{
  form.reset();
  apply();
  syncUrl();
}));

// smaller screens: the filters fold away above the grid, this opens and closes them
toggle.addEventListener("click",()=>{
  const open=!filters.classList.contains("is-open");
  filters.classList.toggle("is-open",open);
  toggle.setAttribute("aria-expanded",String(open));
  toggleText.textContent=open?"Hide":"Show";
});


// card reveal: each card rises in the first time it scrolls into view, cards arriving together a beat apart.
// .has-reveal is what hides them till then (Shop.css), so without this (or with reduced motion) they're simply there
if(!reducedMotion && "IntersectionObserver" in window){
  const revealObserver=new IntersectionObserver(entries=>{
    entries.filter(entry=>entry.isIntersecting).forEach((entry,i)=>{
      entry.target.style.setProperty("--delay",i*.12+"s");
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    });
  },{rootMargin:"0px 0px -10% 0px"});

  grid.classList.add("has-reveal");
  grid.querySelectorAll(".shop-card").forEach(card=>revealObserver.observe(card));
}


// start-up: any filters already in the url (a reload or a shared link), checked against what's actually on the page

const query=new URLSearchParams(location.search);
const startCategories=query.getAll("category");
form.querySelectorAll('input[name="category"]').forEach(input=>{input.checked=startCategories.includes(input.value);});

// the slider clamps and snaps whatever it's given onto its own range and steps
const startMax=Number(query.get("max"));
if(startMax)priceInput.value=startMax;

const startSort=Array.from(form.querySelectorAll('input[name="sort"]')).find(input=>input.value===query.get("sort"));
if(startSort)startSort.checked=true;

apply(true);

// the sort rows change size as fonts land and the window resizes, so the pill re-measures along with them
if("ResizeObserver" in window)new ResizeObserver(()=>placeIndicator(true)).observe(sortGroup);
if(document.fonts && document.fonts.ready)document.fonts.ready.then(()=>placeIndicator(true));

})();
