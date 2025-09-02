// Local storage
let state = JSON.parse(localStorage.getItem("focusfit")||"{}");
if(!state.xp) state={xp:0, streak:0, lastDay:null, trials:[], logs:[]};

function save(){ localStorage.setItem("focusfit",JSON.stringify(state)); update(); }

// Tabs
function showTab(id){
  document.querySelectorAll(".tab").forEach(t=>t.style.display="none");
  document.getElementById(id).style.display="block";
}

// XP + Streak
function addXP(points){
  state.xp+=points;
  let today=new Date().toDateString();
  if(state.lastDay!==today){
    if(state.lastDay && (new Date(today)-new Date(state.lastDay))/(1000*60*60*24)===1){
      state.streak++;
    } else state.streak=1;
    state.lastDay=today;
  }
  save();
}

// Reaction Test
let reactReady=false,startTime=0;
function startReaction(){
  let pad=document.getElementById("reactPad");
  pad.textContent="Wait...";
  setTimeout(()=>{
    pad.textContent="TAP!";
    reactReady=true; startTime=performance.now();
  },1000+Math.random()*2000);
}
document.getElementById("reactPad").onclick=()=>{
  if(!reactReady) return;
  let ms=performance.now()-startTime;
  document.getElementById("reactResult").textContent=ms.toFixed(0)+" ms";
  state.trials.push(ms);
  addXP(5); reactReady=false; drawChart();
};

// Memory Match
const symbols=["🍎","🍌","🍇","🍊","🍒","🥝","🍍","🥑"];
let cards=[],first=null,matches=0;
function setupMemory(){
  cards=[...symbols,...symbols].sort(()=>Math.random()-0.5);
  let grid=document.getElementById("memoryGrid"); grid.innerHTML=""; matches=0;
  cards.forEach((s,i)=>{
    let div=document.createElement("div"); div.className="card"; div.dataset.sym=s; div.onclick=()=>flip(div);
    grid.appendChild(div);
  });
}
function flip(card){
  if(card.classList.contains("flipped")) return;
  card.textContent=card.dataset.sym; card.classList.add("flipped");
  if(!first){first=card;return;}
  if(first.dataset.sym===card.dataset.sym){ matches++; addXP(5); first=null;
    if(matches===symbols.length){document.getElementById("memoryMsg").textContent="All matched!";}}
  else{ setTimeout(()=>{card.textContent="";card.classList.remove("flipped");first.textContent="";first.classList.remove("flipped");first=null;},800);}
}
setupMemory();

// Logs
function addLog(e){
  e.preventDefault();
  let title=document.getElementById("logTitle").value;
  let mins=document.getElementById("logMins").value;
  state.logs.push({title,mins});
  addXP(10); save();
  e.target.reset();
}
function refreshLogs(){
  let ul=document.getElementById("logList"); ul.innerHTML="";
  state.logs.slice(-5).reverse().forEach(l=>{
    let li=document.createElement("li"); li.textContent=l.title+" ("+l.mins+"m)";
    ul.appendChild(li);
  });
}

// Stats
function drawChart(){
  let c=document.getElementById("chart"); if(!c) return;
  let ctx=c.getContext("2d"); ctx.clearRect(0,0,c.width,c.height);
  let arr=state.trials.slice(-20); if(arr.length==0){ctx.fillText("No data",10,20);return;}
  let max=Math.max(...arr),min=Math.min(...arr);
  ctx.beginPath(); ctx.strokeStyle="#22d3ee";
  arr.forEach((v,i)=>{let x=i*(c.width/arr.length);let y=c.height-(v-min)/(max-min+1)*(c.height-20);if(i==0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});
  ctx.stroke();
}

// Update UI
function update(){
  document.getElementById("xp").textContent=state.xp;
  document.getElementById("streak").textContent=state.streak;
  refreshLogs(); drawChart();
}
update();
