'use strict';

// ─── Firebase ───
const firebaseConfig={apiKey:"AIzaSyBm0mIvHVznIeF2PoFk6dtdaiT5r877wyA",authDomain:"meow-874ce.firebaseapp.com",databaseURL:"https://meow-874ce-default-rtdb.europe-west1.firebasedatabase.app",projectId:"meow-874ce",storageBucket:"meow-874ce.firebasestorage.app",messagingSenderId:"471541334599",appId:"1:471541334599:web:567af3e7dbe70a37572762"};
firebase.initializeApp(firebaseConfig);
const auth=firebase.auth(),db=firebase.database();

const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
const lerp=(a,b,t)=>a+(b-a)*t;
function mulberry32(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function goFullscreen(){
  const d=document.documentElement;
  const r=d.requestFullscreen||d.webkitRequestFullscreen||d.mozRequestFullScreen||d.msRequestFullscreen;
  if(r)r.call(d).catch(()=>{});
  if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{});
}
$('fullscreenBtn').addEventListener('click',()=>{goFullscreen();});

const AUTH_ERR={'auth/invalid-email':'Некорректная почта','auth/user-not-found':'Игрок не найден','auth/wrong-password':'Неверный пароль','auth/invalid-credential':'Неверные данные','auth/email-already-in-use':'Почта занята','auth/weak-password':'Пароль слишком короткий','auth/too-many-requests':'Слишком много попыток','auth/network-request-failed':'Нет соединения'};
function authError(e){$('authErr').textContent=AUTH_ERR[e.code]||('Ошибка: '+(e.code||e.message));}
function validNick(n){return/^[A-Za-zА-Яа-яЁё0-9_\-]{2,14}$/.test(n);}
let busyAuth=false;
async function doReg(){if(busyAuth)return;const nick=$('nick').value.trim(),email=$('email').value.trim(),pass=$('pass').value;$('authErr').textContent='';if(!validNick(nick)){$('authErr').textContent='Ник: 2–14 символов';return;}if(!email||!pass){$('authErr').textContent='Заполни почту и пароль';return;}busyAuth=true;$('regBtn').innerHTML='<span class="spin"></span> СОЗДАЮ…';try{goFullscreen();const cr=await auth.createUserWithEmailAndPassword(email,pass);await db.ref('users/'+cr.user.uid).set({name:nick,created:firebase.database.ServerValue.TIMESTAMP});MY_NAME=nick;}catch(e){authError(e);}busyAuth=false;$('regBtn').textContent='СОЗДАТЬ АККАУНТ';}
async function doLogin(){if(busyAuth)return;const email=$('email').value.trim(),pass=$('pass').value;$('authErr').textContent='';if(!email||!pass){$('authErr').textContent='Введи почту и пароль';return;}busyAuth=true;$('loginBtn').innerHTML='<span class="spin"></span> ВХОЖУ…';try{goFullscreen();await auth.signInWithEmailAndPassword(email,pass);}catch(e){authError(e);}busyAuth=false;$('loginBtn').textContent='ВОЙТИ В МИР';}
$('regBtn').onclick=doReg;$('loginBtn').onclick=doLogin;

// ─── Константы мира ───
const TILE=28,WW=3000,WH=300,WORLD_PX_W=WW*TILE,WORLD_PX_H=WH*TILE,SEED=20260718;
const T={AIR:0,DIRT:1,STONE:2,WOOD:3,LEAVES:4,SAND:5,COAL:6,IRON:7,GOLD:8,DIAMOND:9,BEDROCK:10,PLANK:11,TORCH:12,GLASS:13,BRICK:14,GRASS:15,SNOW:16,CACTUS:17,FLOWER_R:18,FLOWER_Y:19,MUSHROOM:20,CLAY:21,GRAVEL:22,MOSSY:23,OBSIDIAN:24,EMERALD:25};
const BLOCK_PROPS={
  [T.DIRT]:{name:'Земля',icon:'🟫',color:'#8B5A2B',solid:true},
  [T.STONE]:{name:'Камень',icon:'⬜',color:'#808080',solid:true},
  [T.WOOD]:{name:'Дерево',icon:'🪵',color:'#6B4226',solid:true},
  [T.LEAVES]:{name:'Листва',icon:'🍃',color:'#4A8C3F',solid:false},
  [T.SAND]:{name:'Песок',icon:'🟨',color:'#D4C4A0',solid:true},
  [T.COAL]:{name:'Уголь',icon:'⬛',color:'#2A2A2A',solid:true},
  [T.IRON]:{name:'Железо',icon:'◻️',color:'#B87333',solid:true},
  [T.GOLD]:{name:'Золото',icon:'🟨',color:'#FFD700',solid:true},
  [T.DIAMOND]:{name:'Алмаз',icon:'💎',color:'00CED1',solid:true},
  [T.BEDROCK]:{name:'Бедрок',icon:'⬛',color:'#1A1A1A',solid:true},
  [T.PLANK]:{name:'Доски',icon:'📦',color:'#A07850',solid:true},
  [T.TORCH]:{name:'Факел',icon:'🔥',color:'#FFAA00',solid:false},
  [T.GLASS]:{name:'Стекло',icon:'🪟',color:'#AADDFF',solid:true},
  [T.BRICK]:{name:'Кирпич',icon:'🧱',color:'#A05040',solid:true},
  [T.GRASS]:{name:'Трава',icon:'🌿',color:'#55AA44',solid:true},
  [T.SNOW]:{name:'Снег',icon:'❄️',color:'#E8E8E8',solid:true},
  [T.CACTUS]:{name:'Кактус',icon:'🌵',color:'#2E8B57',solid:true},
  [T.FLOWER_R]:{name:'Мак',icon:'🌺',color:'#FF4444',solid:false},
  [T.FLOWER_Y]:{name:'Одуванчик',icon:'🌼',color:'#FFDD00',solid:false},
  [T.MUSHROOM]:{name:'Гриб',icon:'🍄',color:'#CC4444',solid:false},
  [T.CLAY]:{name:'Глина',icon:'🟫',color:'#B0A090',solid:true},
  [T.GRAVEL]:{name:'Гравий',icon:'◽',color:'#8A8A8A',solid:true},
  [T.MOSSY]:{name:'Мшистый камень',icon:'🪨',color:'#5A7A5A',solid:true},
  [T.OBSIDIAN]:{name:'Обсидиан',icon:'⬛',color:'#2D0A31',solid:true},
  [T.EMERALD]:{name:'Изумруд',icon:'💚',color:'#50C878',solid:true}
};

const world=new Uint8Array(WW*WH);
const surf=new Int16Array(WW);

function tileAt(tx,ty){if(tx<0||tx>=WW||ty<0||ty>=WH)return T.BEDROCK;return world[ty*WW+tx];}
function setTile(tx,ty,id){if(tx<0||tx>=WW||ty<0||ty>=WH)return;world[ty*WW+tx]=id;}
function solidAt(tx,ty){const v=tileAt(tx,ty);return BLOCK_PROPS[v]?.solid||false;}

// ─── Генерация мира (улучшенная) ───
function genWorld(){
  const R=mulberry32(SEED),ri=(a,b)=>a+(R()*(b-a+1)|0);
  function noise(x){return Math.sin(x*0.01)*30+Math.sin(x*0.03)*15+Math.sin(x*0.005)*50+Math.sin(x*0.001)*80;}
  function noise2(x,y){return Math.sin(x*0.05+y*0.07)*0.5+Math.sin(x*0.02-y*0.03)*0.3+Math.sin(x*0.1)*0.2;}

  for(let x=0;x<WW;x++){
    const n=noise(x);
    const base=WH-40;
    let h=Math.floor(base+n*0.3);
    h=clamp(h,WH-140,WH-25);
    surf[x]=h;
    const biome=Math.floor(x/600)%4;
    for(let y=h;y<WH;y++){
      if(y===h){
        if(biome===2)world[y*WW+x]=T.SNOW;
        else if(biome===1)world[y*WW+x]=T.SAND;
        else world[y*WW+x]=T.GRASS;
      }else if(y<h+3){
        if(biome===3&&R()<0.3)world[y*WW+x]=T.CLAY;
        else world[y*WW+x]=T.DIRT;
      }else if(y<WH-8){
        if(y>h+15&&R()<0.08)world[y*WW+x]=T.GRAVEL;
        else if(y>h+20&&y<h+40&&R()<0.05)world[y*WW+x]=T.MOSSY;
        else world[y*WW+x]=T.STONE;
      }else world[y*WW+x]=T.BEDROCK;
    }
    // Цветы
    if(biome===0&&R()<0.12&&h>0&&h<WH-1){const flower=R()<0.5?T.FLOWER_R:T.FLOWER_Y;if(world[(h-1)*WW+x]===T.AIR)world[(h-1)*WW+x]=flower;}
    // Грибы под землёй
    if(R()<0.025&&h>20&&h<WH-10){const my=h+ri(5,15);if(my<WH&&world[my*WW+x]===T.AIR&&world[(my+1)*WW+x]===T.STONE)world[my*WW+x]=T.MUSHROOM;}
    // Трава на земле
    if(biome===0&&R()<0.15&&h>0&&h<WH-1&&world[(h-1)*WW+x]===T.AIR){
      // Маленькая трава
    }
  }

  // Деревья и кактусы
  for(let x=5;x<WW-10;x+=ri(5,14)){
    const biome=Math.floor(x/600)%4;
    const ground=surf[x];
    if(ground<5||ground>=WH-10)continue;
    if(biome===1){if(R()<0.6){const h=ri(2,4);for(let y=0;y<h;y++)if(ground-1-y>0)world[(ground-1-y)*WW+x]=T.CACTUS;}continue;}
    if(biome===2)continue;
    const th=biome===3?ri(6,10):ri(5,9);
    const wide=R()<0.3;
    for(let y=0;y<th;y++){if(ground-1-y>0)world[(ground-1-y)*WW+x]=T.WOOD;if(wide&&x+1<WW&&ground-1-y>0)world[(ground-1-y)*WW+(x+1)]=T.WOOD;}
    if(th>6){const branchY=ground-Math.floor(th*0.5);const dir=R()<0.5?-1:1;if(x+dir>0&&x+dir<WW&&branchY>0)world[branchY*WW+(x+dir)]=T.WOOD;if(wide&&x+1+dir>0&&x+1+dir<WW&&branchY>0)world[branchY*WW+(x+1+dir)]=T.WOOD;}
    const canopyW=wide?4:3;const canopyH=ri(2,4);const top=ground-th;
    for(let lx=x-canopyW;lx<=x+(wide?canopyW+1:canopyW);lx++)for(let ly=top-canopyH;ly<=top+1;ly++)if(lx>=0&&lx<WW&&ly>0&&ly<WH&&world[ly*WW+lx]===T.AIR&&world[ly*WW+lx]!==T.WOOD)world[ly*WW+lx]=T.LEAVES;
  }

  // Руды
  for(let i=0;i<4000;i++){
    const x=ri(0,WW-1),y=ri(30,WH-10);
    if(world[y*WW+x]!==T.STONE&&world[y*WW+x]!==T.MOSSY)continue;
    const r=R();const ore=r<0.005?T.OBSIDIAN:r<0.015?T.EMERALD:r<0.025?T.DIAMOND:r<0.06?T.GOLD:r<0.12?T.IRON:T.COAL;
    const sz=ri(2,5);for(let ox=0;ox<sz;ox++)for(let oy=0;oy<sz;oy++)if(x+ox<WW&&y+oy<WH&&(world[(y+oy)*WW+(x+ox)]===T.STONE||world[(y+oy)*WW+(x+ox)]===T.MOSSY))world[(y+oy)*WW+(x+ox)]=ore;
  }

  // Пещеры
  for(let i=0;i<80;i++){
    let cx=ri(20,WW-20),cy=ri(surf[cx]+15,WH-20);const len=ri(30,120);
    for(let j=0;j<len;j++){cx+=ri(-1,1);cy+=ri(-1,1);if(cx<5||cx>=WW-5||cy<10||cy>=WH-5)continue;const rad=ri(1,3);for(let dx=-rad;dx<=rad;dx++)for(let dy=-rad;dy<=rad;dy++)if(cx+dx>=0&&cx+dx<WW&&cy+dy>=0&&cy+dy<WH){const v=world[(cy+dy)*WW+(cx+dx)];if(v!==T.BEDROCK&&v!==T.AIR)world[(cy+dy)*WW+(cx+dx)]=T.AIR;}}
  }

  // Равнины
  for(let i=0;i<50;i++){
    let cx=ri(50,WW-50),cy=surf[cx]-ri(2,6);const len=ri(8,20);
    for(let j=0;j<len;j++){cx+=ri(-1,1);cy+=ri(0,1);if(cx<0||cx>=WW||cy<0||cy>=WH)continue;const rad=ri(1,2);for(let dx=-rad;dx<=rad;dx++)for(let dy=-rad;dy<=rad;dy++)if(cx+dx>=0&&cx+dx<WW&&cy+dy>=0&&cy+dy<WH){const v=world[(cy+dy)*WW+(cx+dx)];if(v!==T.BEDROCK&&v!==T.AIR&&v!==T.WOOD&&v!==T.LEAVES)world[(cy+dy)*WW+(cx+dx)]=T.AIR;}}
  }

  // Озёра
  for(let i=0;i<8;i++){
    let cx=ri(100,WW-100),cy=surf[cx]+ri(2,8);const rad=ri(8,20);
    for(let dx=-rad;dx<=rad;dx++)for(let dy=-rad;dy<=rad;dy++){
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<rad&&cx+dx>=0&&cx+dx<WW&&cy+dy>=0&&cy+dy<WH){
        if(world[(cy+dy)*WW+(cx+dx)]===T.AIR||world[(cy+dy)*WW+(cx+dx)]===T.DIRT||world[(cy+dy)*WW+(cx+dx)]===T.STONE)
          world[(cy+dy)*WW+(cx+dx)]=T.AIR;
      }
    }
  }

  // Обсидиановые столбы
  for(let i=0;i<15;i++){
    const x=ri(50,WW-50);
    const bottom=WH-8;
    const height=ri(3,8);
    for(let y=bottom-height;y<bottom;y++)if(x>=0&&x<WW&&y>=0&&y<WH)world[y*WW+x]=T.OBSIDIAN;
  }
}

// ─── Игрок (теперь слайм!) ───
const P={x:150*TILE,y:(WH-50)*TILE,w:22,h:22,vx:0,vy:0,dir:1,ground:false,hp:100,maxHp:100,dead:false,respawnX:150*TILE,respawnY:(WH-50)*TILE,invulnerable:0,jumpCount:0,jumpMax:1,sprint:false,sprintSpeed:1};
const cam={x:0,y:0};
let inventory={};
let selectedSlot=0;
let buildMode=false;
let breakProgress=0,breakTarget=null,breakTimer=null;
let attackCooldown=0;

// ─── Система уровней и опыта ───
let playerLevel=1;
let playerXP=0;
let xpToNext=100;
const ABILITIES={
  10:{name:'Тройной прыжок',desc:'Прыгай 3 раза подряд!',icon:'🦘'},
  20:{name:'Супер-спринт',desc:'Двойная скорость бега!',icon:'⚡'},
  30:{name:'Регенерация',desc:'Восстанавливает HP со временем!',icon:'💚'},
  40:{name:'Двойной урон',desc:'В два раза сильнее бьёшь!',icon:'💥'},
  50:{name:'Невидимость',desc:'Враги тебя не видят!',icon:'👻'},
  60:{name:'Полёт',desc:'Летай как бэтмен!',icon:'🦇'},
  70:{name:'Телепорт',desc:'Телепортируйся на 10 блоков!',icon:'✨'},
  80:{name:'Бессмертие',desc:'Неуязвимость на 3 секунды!',icon:'🛡️'},
  90:{name:'Мега-прыжок',desc:'Прыгай на 5 блоков вверх!',icon:'🚀'},
  100:{name:'Бог слаймов',desc:'Все способности максимальны!',icon:'👑'}
};
let currentAbility=null;

function getXPToNext(lvl){return Math.floor(100*Math.pow(1.15,lvl-1));}
function addXP(amount){
  playerXP+=amount;
  while(playerXP>=xpToNext){
    playerXP-=xpToNext;
    playerLevel++;
    xpToNext=getXPToNext(playerLevel);
    onLevelUp(playerLevel);
  }
  updateXPBar();
}
function onLevelUp(lvl){
  spawnParticles(P.x+P.w/2,P.y+P.h/2,'#FFD700',25);
  if(ABILITIES[lvl]){
    currentAbility=ABILITIES[lvl];
    const badge=$('abilityBadge');
    badge.textContent=currentAbility.icon+' '+currentAbility.name+' — '+currentAbility.desc;
    badge.classList.add('show');
    // Применяем способность
    if(lvl===10)P.jumpMax=3;
    if(lvl===20){P.sprint=true;P.sprintSpeed=2;}
    if(lvl===30)P.regen=true;
    if(lvl===40)P.doubleDmg=true;
    if(lvl===50)P.invisible=true;
    if(lvl===60)P.canFly=true;
    if(lvl===70)P.canTeleport=true;
    if(lvl===80)P.godMode=true;
    if(lvl===90)P.megaJump=true;
    if(lvl===100){P.jumpMax=5;P.sprintSpeed=3;P.godMode=true;P.canFly=true;}
  }
  $('lvlBadge').textContent='LVL '+lvl;
}
function updateXPBar(){
  const pct=(playerXP/xpToNext)*100;
  $('xpFill').style.width=pct+'%';
  $('xpText').textContent='XP: '+playerXP+'/'+xpToNext;
}

inventory[T.DIRT]=20;inventory[T.STONE]=10;inventory[T.WOOD]=15;inventory[T.PLANK]=20;
inventory[T.TORCH]=10;inventory[T.GLASS]=10;inventory[T.SAND]=10;inventory[T.BRICK]=10;

const HOTBAR_ORDER=[T.DIRT,T.STONE,T.WOOD,T.PLANK,T.TORCH,T.GLASS,T.SAND,T.BRICK];

function invCount(id){return inventory[id]||0;}
function addItem(id,cnt){if(!inventory[id])inventory[id]=0;inventory[id]+=cnt;}
function removeItem(id,cnt){if(!inventory[id])return false;inventory[id]=Math.max(0,inventory[id]-cnt);if(inventory[id]===0)delete inventory[id];return true;}

// ─── Мобы ───
const MOB_TYPES={
  chicken:{name:'Курица',hp:5,dmg:0,w:18,h:16,speed:1.2,jump:-5,color:'#E8DCC8',hostile:false,fly:false,day:true,night:true,xp:5},
  slime:{name:'Слайм',hp:25,dmg:8,w:22,h:22,speed:1.5,jump:-6,color:'#66CC66',hostile:true,fly:false,day:true,night:true,xp:15},
  zombie:{name:'Зомби',hp:40,dmg:12,w:20,h:30,speed:0.9,jump:-7,color:'#558855',hostile:true,fly:false,day:false,night:true,xp:25},
  bat:{name:'Летучая мышь',hp:12,dmg:7,w:20,h:14,speed:2.5,jump:0,color:'#8866AA',hostile:true,fly:true,day:false,night:true,xp:10},
  skeleton:{name:'Скелет',hp:30,dmg:10,w:20,h:30,speed:1.0,jump:-6,color:'#DDDDDD',hostile:true,fly:false,day:false,night:true,xp:20},
  creeper:{name:'Крипер',hp:35,dmg:25,w:20,h:28,speed:1.3,jump:-5,color:'#55AA55',hostile:true,fly:false,day:false,night:true,xp:30}
};

let mobs=[];
function spawnMobs(){
  mobs=[];
  const R=mulberry32(SEED+1);
  for(let i=0;i<80;i++){const x=Math.floor(R()*WW);const y=surf[x]-1;if(y>0&&y<WH&&world[y*WW+x]===T.AIR)mobs.push({type:'chicken',x:x*TILE,y:y*TILE,vx:0,vy:0,dir:R()<0.5?1:-1,hp:5,maxHp:5,ground:true,dead:false,anim:0,flash:0});}
  for(let i=0;i<40;i++){const x=Math.floor(R()*WW);const y=surf[x]+5+Math.floor(R()*30);if(y<WH&&world[y*WW+x]===T.AIR)mobs.push({type:'slime',x:x*TILE,y:y*TILE,vx:0,vy:0,dir:1,hp:25,maxHp:25,ground:true,dead:false,anim:0,flash:0});}
  for(let i=0;i<20;i++){const x=Math.floor(R()*WW);const y=surf[x]+5+Math.floor(R()*40);if(y<WH&&world[y*WW+x]===T.AIR)mobs.push({type:'skeleton',x:x*TILE,y:y*TILE,vx:0,vy:0,dir:1,hp:30,maxHp:30,ground:true,dead:false,anim:0,flash:0});}
  for(let i=0;i<15;i++){const x=Math.floor(R()*WW);const y=surf[x]+5+Math.floor(R()*35);if(y<WH&&world[y*WW+x]===T.AIR)mobs.push({type:'creeper',x:x*TILE,y:y*TILE,vx:0,vy:0,dir:1,hp:35,maxHp:35,ground:true,dead:false,anim:0,flash:0,charge:0});}
}

function updateMobs(){
  const isNight=!(timeOfDay>0.25&&timeOfDay<0.75);
  for(const m of mobs){
    if(m.dead)continue;
    const type=MOB_TYPES[m.type];if(!type)continue;
    if(!type.day&&type.night&&!isNight){m.x=-9999;continue;}
    if(type.day&&!type.night&&isNight){m.x=-9999;continue;}
    m.anim++;if(m.flash>0)m.flash--;
    const dx=P.x-m.x,dy=P.y-m.y;const dist=Math.hypot(dx,dy);

    // Крипер взрывается
    if(m.type==='creeper'&&dist<60&&type.hostile){
      m.charge=(m.charge||0)+1;
      if(m.charge>120){// взрыв через 2 сек
        spawnParticles(m.x+type.w/2,m.y+type.h/2,'#55AA55',30);
        if(dist<100)damagePlayer(type.dmg);
        m.dead=true;continue;
      }
    }else if(m.type==='creeper'){m.charge=0;}

    if(type.hostile&&dist<350){
      if(dist>30){m.dir=dx>0?1:-1;
        if(type.fly){m.vx+=m.dir*0.15;m.vy+=(dy>0?1:-1)*0.1;m.vx=clamp(m.vx,-type.speed,type.speed);m.vy=clamp(m.vy,-type.speed,type.speed);}
        else{m.vx+=m.dir*0.2;m.vx=clamp(m.vx,-type.speed,type.speed);if(m.ground&&Math.abs(dx)>20&&Math.random()<0.03)m.vy=type.jump;}
      }
      if(dist<30&&P.invulnerable<=0&&P.hp>0){damagePlayer(type.dmg);P.vx=m.dir*6;m.vx=-m.dir*3;}
    }else if(m.type==='chicken'){
      if(dist<100){m.dir=dx>0?-1:1;m.vx+=m.dir*0.3;}
      else if(Math.random()<0.02){m.dir=Math.random()<0.5?1:-1;m.vx+=m.dir*0.15;}
      m.vx=clamp(m.vx,-type.speed,type.speed);
      if(m.ground&&Math.random()<0.015)m.vy=type.jump;
    }else{if(Math.random()<0.01)m.dir=Math.random()<0.5?1:-1;m.vx+=m.dir*0.05;m.vx=clamp(m.vx,-type.speed*0.5,type.speed*0.5);}
    if(!type.fly)m.vy+=0.45;if(!type.fly&&m.vy>12)m.vy=12;
    m.x+=m.vx;mobCollideX(m,type);m.y+=m.vy;mobCollideY(m,type);
    if(type.fly){m.vx*=0.95;m.vy*=0.95;}else if(m.ground)m.vx*=0.85;else m.vx*=0.98;
    if(Math.abs(m.vx)<0.05)m.vx=0;
  }
}

function mobCollideX(m,type){
  const tx0=Math.floor(m.x/TILE),tx1=Math.floor((m.x+type.w-1)/TILE);
  const ty0=Math.floor(m.y/TILE),ty1=Math.floor((m.y+type.h-1)/TILE);
  for(let ty=ty0;ty<=ty1;ty++){if(m.vx>0){if(solidAt(tx1,ty)){m.x=tx1*TILE-type.w-0.01;m.vx=0;m.dir=-1;}}else if(m.vx<0){if(solidAt(tx0,ty)){m.x=(tx0+1)*TILE+0.01;m.vx=0;m.dir=1;}}}
}
function mobCollideY(m,type){
  m.ground=false;
  const tx0=Math.floor(m.x/TILE),tx1=Math.floor((m.x+type.w-1)/TILE);
  const ty0=Math.floor(m.y/TILE),ty1=Math.floor((m.y+type.h-1)/TILE);
  for(let tx=tx0;tx<=tx1;tx++){if(m.vy>0){if(solidAt(tx,ty1)){m.y=ty1*TILE-type.h-0.01;m.vy=0;m.ground=true;}}else if(m.vy<0){if(solidAt(tx,ty0)){m.y=(ty0+1)*TILE+0.01;m.vy=0;}}}
}

function damagePlayer(dmg){
  if(P.invulnerable>0||P.dead)return;
  if(P.godMode&&Math.random()<0.3){spawnParticles(P.x+P.w/2,P.y+P.h/2,'#FFD700',8);return;}// 30% шанс блока
  P.hp-=dmg;P.invulnerable=40;
  spawnParticles(P.x+P.w/2,P.y+P.h/2,'#FF0000',12);
  $('hpFill').style.width=(P.hp/P.maxHp*100)+'%';
  if(P.hp<=0)playerDie();
}

function playerDie(){
  P.dead=true;
  $('deathMsg').textContent=['Тебя съели зомби...','Ты упал в пропасть','Слайм тебя растворил','Тьма поглотила тебя','Крипер взорвал тебя','Скелет попал в яблочко'][Math.floor(Math.random()*6)];
  $('deathScreen').classList.add('show');
}

function respawnPlayer(){
  P.x=P.respawnX;P.y=P.respawnY;P.vx=0;P.vy=0;P.jumpCount=0;
  P.hp=P.maxHp;P.dead=false;P.invulnerable=60;
  $('hpFill').style.width='100%';
  $('deathScreen').classList.remove('show');
}
$('respawnBtn').addEventListener('click',respawnPlayer);

// ─── Ввод ───
const input={dx:0,dy:0,jump:false,attack:false};
let joyActive=false,joyId=null,joyCX=65,joyCY=65;
const joyKnob=$('joystickKnob');

function setupTouch(){
  const jZone=$('joystickZone');
  jZone.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];joyActive=true;joyId=t.identifier;updateJoy(t.clientX,t.clientY);},{passive:false});
  jZone.addEventListener('touchmove',e=>{e.preventDefault();if(!joyActive)return;for(let t of e.changedTouches)if(t.identifier===joyId){updateJoy(t.clientX,t.clientY);break;}},{passive:false});
  const endJoy=e=>{if(!joyActive)return;for(let t of e.changedTouches)if(t.identifier===joyId){joyActive=false;joyId=null;input.dx=0;input.dy=0;joyKnob.style.left='40px';joyKnob.style.top='40px';break;}};
  jZone.addEventListener('touchend',endJoy,{passive:false});
  jZone.addEventListener('touchcancel',endJoy,{passive:false});

  const bindBtn=(id,on,off)=>{const el=$(id);const s=e=>{e.preventDefault();el.classList.add('act');on();};const e_=e=>{e.preventDefault();el.classList.remove('act');off();};el.addEventListener('touchstart',s,{passive:false});el.addEventListener('touchend',e_,{passive:false});el.addEventListener('touchcancel',e_,{passive:false});};
  bindBtn('jumpBtn',()=>input.jump=true,()=>input.jump=false);
  bindBtn('attackBtn',()=>input.attack=true,()=>input.attack=false);

  $('modeBtn').addEventListener('touchstart',e=>{e.preventDefault();buildMode=!buildMode;updateModeBadge();},{passive:false});
  $('fsBtn').addEventListener('touchstart',e=>{e.preventDefault();goFullscreen();},{passive:false});
  $('mapBtn').addEventListener('touchstart',e=>{e.preventDefault();$('minimap').classList.toggle('hidden');},{passive:false});

  const cv=$('game');
  let mineTx=-1,mineTy=-1,mineTimer=null;

  cv.addEventListener('touchstart',e=>{
    e.preventDefault();
    if(e.targetTouches.length!==1)return;
    const t=e.targetTouches[0];
    const rect=cv.getBoundingClientRect();
    const cx=(t.clientX-rect.left)*(canvas.width/rect.width)/dpr;
    const cy=(t.clientY-rect.top)*(canvas.height/rect.height)/dpr;
    const tx=Math.floor((cx+cam.x)/TILE);
    const ty=Math.floor((cy+cam.y)/TILE);
    if(tx<0||tx>=WW||ty<0||ty>=WH)return;

    if(buildMode){
      const blockId=HOTBAR_ORDER[selectedSlot];
      if(!blockId||!invCount(blockId))return;
      if(tileAt(tx,ty)!==T.AIR)return;
      const px=Math.floor((P.x+P.w/2)/TILE),py=Math.floor((P.y+P.h/2)/TILE);
      if(Math.abs(tx-px)<=1&&Math.abs(ty-py)<=1)return;
      const distToPlayer=Math.hypot((tx*TILE+14)-(P.x+P.w/2),(ty*TILE+14)-(P.y+P.h/2));
      if(distToPlayer>120)return;
      setTile(tx,ty,blockId);
      removeItem(blockId,1);
      renderHotbar();
      pushDelta(tx,ty,blockId);
      spawnParticles(tx*TILE+14,ty*TILE+14,BLOCK_PROPS[blockId].color,6);
    }else{
      const distToPlayer=Math.hypot((tx*TILE+14)-(P.x+P.w/2),(ty*TILE+14)-(P.y+P.h/2));
      if(distToPlayer>140)return;
      const block=tileAt(tx,ty);
      if(block!==T.AIR&&block!==T.BEDROCK){
        mineTx=tx;mineTy=ty;
        showBreakBar(t.clientX,t.clientY);
        mineTimer=setTimeout(()=>{finishMine(tx,ty);},350);
      }
    }
  },{passive:false});

  cv.addEventListener('touchmove',e=>{
    if(mineTimer){
      const t=e.targetTouches[0];
      const rect=cv.getBoundingClientRect();
      const cx=(t.clientX-rect.left)*(canvas.width/rect.width)/dpr;
      const cy=(t.clientY-rect.top)*(canvas.height/rect.height)/dpr;
      const tx=Math.floor((cx+cam.x)/TILE);
      const ty=Math.floor((cy+cam.y)/TILE);
      if(tx!==mineTx||ty!==mineTy){clearTimeout(mineTimer);mineTimer=null;$('breakBar').style.display='none';}
    }
  },{passive:false});

  cv.addEventListener('touchend',e=>{if(mineTimer){clearTimeout(mineTimer);mineTimer=null;$('breakBar').style.display='none';}},{passive:false});

  $('attackBtn').addEventListener('touchstart',e=>{
    e.preventDefault();
    if(P.dead)return;
    if(attackCooldown>0)return;
    attackCooldown=20;
    const ax=P.x+(P.dir*35),ay=P.y+P.h/2;
    spawnParticles(ax,ay,'#FFFFFF',5);
    for(const m of mobs){
      if(m.dead)continue;
      const type=MOB_TYPES[m.type];if(!type)continue;
      const mx=m.x+type.w/2,my=m.y+type.h/2;
      if(Math.hypot(ax-mx,ay-my)<50){
        const dmg=P.doubleDmg?16:8;
        m.hp-=dmg;m.flash=10;
        m.vx=P.dir*5;m.vy=-3;
        spawnParticles(mx,my,'#FF4444',10);
        if(m.hp<=0){m.dead=true;addXP(type.xp);spawnParticles(mx,my,type.color,18);}
      }
    }
  },{passive:false});

  renderHotbar();
  $('chatBtn').addEventListener('touchstart',e=>{e.preventDefault();$('chat').classList.toggle('hidden');},{passive:false});
  $('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'){sendChat();$('chatInput').blur();}});
  $('invBtn').addEventListener('touchstart',e=>{e.preventDefault();openInv();},{passive:false});
  $('invClose').addEventListener('touchstart',e=>{e.preventDefault();$('invOverlay').classList.remove('open');},{passive:false});
}

function updateJoy(clientX,clientY){
  const rect=$('joystickZone').getBoundingClientRect();
  const x=clientX-rect.left-joyCX,y=clientY-rect.top-joyCY;
  const dist=Math.hypot(x,y),max=40;
  const nx=dist>max?x/dist*max:x;
  const ny=dist>max?y/dist*max:y;
  joyKnob.style.left=(40+nx)+'px';joyKnob.style.top=(40+ny)+'px';
  input.dx=nx/max;input.dy=ny/max;
}

function finishMine(tx,ty){
  const current=tileAt(tx,ty);
  if(current===T.AIR||current===T.BEDROCK)return;
  setTile(tx,ty,T.AIR);
  const dropMap={[T.GRASS]:T.DIRT,[T.LEAVES]:T.AIR,[T.FLOWER_R]:T.AIR,[T.FLOWER_Y]:T.AIR,[T.MUSHROOM]:T.AIR,[T.SNOW]:T.AIR};
  const drop=dropMap[current]!==undefined?dropMap[current]:current;
  if(drop!==T.AIR){addItem(drop,1);addXP(2);}
  renderHotbar();
  pushDelta(tx,ty,T.AIR);
  spawnParticles(tx*TILE+14,ty*TILE+14,BLOCK_PROPS[current]?.color||'#888',10);
  $('breakBar').style.display='none';
}

function updateModeBadge(){
  const el=$('modeBadge');
  el.textContent=buildMode?'🧱 Строительство':'⛏️ Копание';
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),1200);
  $('modeBtn').textContent=buildMode?'🧱':'⛏️';
}

function showBreakBar(x,y){
  const bar=$('breakBar');
  bar.style.left=(x-20)+'px';bar.style.top=(y-24)+'px';bar.style.display='block';
  bar.querySelector('.fill').style.width='0%';
  setTimeout(()=>{bar.querySelector('.fill').style.width='100%';},50);
  setTimeout(()=>{bar.style.display='none';bar.querySelector('.fill').style.width='0%';},400);
}

// ─── Время дня/ночи (7 минут день, 6 минут ночь = 13 минут цикл) ───
const DAY_MS = 7 * 60 * 1000;
const NIGHT_MS = 6 * 60 * 1000;
const CYCLE_MS = DAY_MS + NIGHT_MS;
let timeOfDay = 0.2, dayCount = 1;
let cycleStart = Date.now();

function updateTime(){
  const elapsed = (Date.now() - cycleStart) % CYCLE_MS;
  timeOfDay = elapsed / CYCLE_MS;
  const isDay = timeOfDay < (DAY_MS / CYCLE_MS);
  $('timeIcon').textContent = isDay ? '☀️' : '🌙';
  $('timeText').textContent = (isDay ? 'День ' : 'Ночь ') + dayCount;
  if (elapsed < 100) dayCount++;
}

// ─── Дождь (локальный, 4-6 минут рандом) ───
let isRaining = false;
let rainStart = 0;
let rainDuration = 0;
let nextRainTime = Date.now() + (2 * 60 * 1000 + Math.random() * 3 * 60 * 1000); // первый дождь через 2-5 мин
let rainDrops = [];
let rainSplashes = [];

function updateRain(){
  const now = Date.now();
  if (!isRaining && now >= nextRainTime) {
    isRaining = true;
    rainStart = now;
    rainDuration = (4 * 60 * 1000) + Math.random() * (2 * 60 * 1000); // 4-6 мин
    startRainVisuals();
    playRainSound();
  }
  if (isRaining && now - rainStart >= rainDuration) {
    isRaining = false;
    stopRainVisuals();
    stopRainSound();
    nextRainTime = now + (3 * 60 * 1000 + Math.random() * 5 * 60 * 1000); // 3-8 мин до следующего
  }

  if (isRaining) {
    // Генерация капель
    for (let i = 0; i < 8; i++) {
      rainDrops.push({
        x: Math.random() * vw,
        y: -20,
        speed: 8 + Math.random() * 6,
        len: 8 + Math.random() * 6
      });
    }
    // Молния редко
    if (Math.random() < 0.002) triggerLightning();
  }

  // Обновление капель
  for (let i = rainDrops.length - 1; i >= 0; i--) {
    const d = rainDrops[i];
    d.y += d.speed;
    d.x -= 1; // ветер
    if (d.y > vh) {
      // Брызги
      if (Math.random() < 0.3) {
        rainSplashes.push({x: d.x, y: vh - 5 + Math.random() * 10, life: 10});
      }
      rainDrops.splice(i, 1);
    }
  }
  // Обновление брызг
  for (let i = rainSplashes.length - 1; i >= 0; i--) {
    rainSplashes[i].life--;
    if (rainSplashes[i].life <= 0) rainSplashes.splice(i, 1);
  }
}

function startRainVisuals(){
  const overlay = document.createElement('div');
  overlay.id = 'rainOverlay';
  overlay.className = 'rain-overlay active';
  document.body.appendChild(overlay);
}
function stopRainVisuals(){
  const el = $('rainOverlay');
  if (el) { el.classList.remove('active'); setTimeout(() => el.remove(), 2000); }
  rainDrops = [];
  rainSplashes = [];
}
function triggerLightning(){
  const flash = document.createElement('div');
  flash.className = 'lightning flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 150);
  // Звук грома (простой через AudioContext)
  playThunder();
}

function playRainSound(){
  const rainAudio = $('rainSound');
  // Используем white noise через Web Audio API
  if (!rainAudioCtx) {
    rainAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = 2 * rainAudioCtx.sampleRate;
    const noiseBuffer = rainAudioCtx.createBuffer(1, bufferSize, rainAudioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    rainNoiseSource = rainAudioCtx.createBufferSource();
    rainNoiseSource.buffer = noiseBuffer;
    rainNoiseSource.loop = true;
    const gainNode = rainAudioCtx.createGain();
    gainNode.gain.value = 0.08;
    // Lowpass filter для "мягкого" шума дождя
    const filter = rainAudioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    rainNoiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(rainAudioCtx.destination);
    rainNoiseSource.start();
    rainGainNode = gainNode;
  } else {
    rainGainNode.gain.setValueAtTime(0.08, rainAudioCtx.currentTime);
  }
}
function stopRainSound(){
  if (rainGainNode) {
    rainGainNode.gain.setValueAtTime(0, rainAudioCtx.currentTime);
  }
}
function playThunder(){
  if (!rainAudioCtx) return;
  const osc = rainAudioCtx.createOscillator();
  const gain = rainAudioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, rainAudioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(20, rainAudioCtx.currentTime + 2);
  gain.gain.setValueAtTime(0.3, rainAudioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, rainAudioCtx.currentTime + 2);
  osc.connect(gain);
  gain.connect(rainAudioCtx.destination);
  osc.start();
  osc.stop(rainAudioCtx.currentTime + 2.5);
}
let rainAudioCtx = null, rainNoiseSource = null, rainGainNode = null;

// ─── Музыка ───
const MUSIC_TRACKS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
];
let currentTrack = 0;
let musicAudio = null;
let musicStarted = false;

function startMusic(){
  if (musicStarted) return;
  musicStarted = true;
  musicAudio = $('bgMusic');
  musicAudio.volume = 0.25;
  playNextTrack();
}
function playNextTrack(){
  if (!musicAudio) return;
  musicAudio.src = MUSIC_TRACKS[currentTrack];
  musicAudio.play().catch(()=>{});
  currentTrack = (currentTrack + 1) % MUSIC_TRACKS.length;
  musicAudio.onended = playNextTrack;
}

// ─── Игрок (слайм) ───
function stepPlayer(){
  if(P.dead)return;
  if(P.invulnerable>0)P.invulnerable--;
  if(attackCooldown>0)attackCooldown--;
  if(P.regen&&P.hp<P.maxHp&&P.hp>0&&Math.random()<0.02){P.hp=Math.min(P.maxHp,P.hp+1);$('hpFill').style.width=(P.hp/P.maxHp*100)+'%';}
  const spd=4.8*(P.sprint?P.sprintSpeed:1),acc=0.6;
  if(input.dx>0){P.vx+=acc;P.dir=1;}else if(input.dx<0){P.vx-=acc;P.dir=-1;}else P.vx*=0.82;
  P.vx=clamp(P.vx,-spd,spd);if(Math.abs(P.vx)<0.1)P.vx=0;

  // Прыжок слайма (множественный)
  if(input.jump){
    if(P.ground){P.vy=-10.5;P.ground=false;P.jumpCount=1;}
    else if(P.jumpCount<P.jumpMax){P.vy=-10.5;P.jumpCount++;}
  }
  if(!input.jump&&P.vy<-3)P.vy=-3;

  P.vy+=0.48;if(P.vy>13)P.vy=13;
  P.x+=P.vx;collideX();
  P.y+=P.vy;collideY();
  if(P.vy>10&&P.ground){P.jumpCount=0;damagePlayer(Math.floor((P.vy-10)*2));}
  if(P.y>WORLD_PX_H)playerDie();

  // Телепорт на 70 уровне (двойное нажатие прыжка)
  if(P.canTeleport&&input.jump&&P.ground===false&&P.jumpCount>=P.jumpMax){
    P.x+=P.dir*280;P.vy=-5;P.jumpCount=0;
    spawnParticles(P.x+P.w/2,P.y+P.h/2,'#9B59B6',15);
  }

  const targetX=P.x+P.w/2-vw/2;
  const targetY=P.y+P.h/2-vh/2;
  cam.x=lerp(cam.x,targetX,0.12);
  cam.y=lerp(cam.y,targetY,0.12);
  cam.x=clamp(cam.x,0,WORLD_PX_W-vw);
  cam.y=clamp(cam.y,0,WORLD_PX_H-vh);
}

function collideX(){
  const tx0=Math.floor(P.x/TILE),tx1=Math.floor((P.x+P.w-1)/TILE);
  const ty0=Math.floor(P.y/TILE),ty1=Math.floor((P.y+P.h-1)/TILE);
  for(let ty=ty0;ty<=ty1;ty++){if(P.vx>0){if(solidAt(tx1,ty)){P.x=tx1*TILE-P.w-0.01;P.vx=0;}}else if(P.vx<0){if(solidAt(tx0,ty)){P.x=(tx0+1)*TILE+0.01;P.vx=0;}}}
}
function collideY(){
  P.ground=false;
  const tx0=Math.floor(P.x/TILE),tx1=Math.floor((P.x+P.w-1)/TILE);
  const ty0=Math.floor(P.y/TILE),ty1=Math.floor((P.y+P.h-1)/TILE);
  for(let tx=tx0;tx<=tx1;tx++){if(P.vy>0){if(solidAt(tx,ty1)){P.y=ty1*TILE-P.h-0.01;P.vy=0;P.ground=true;P.jumpCount=0;}}else if(P.vy<0){if(solidAt(tx,ty0)){P.y=(ty0+1)*TILE+0.01;P.vy=0;}}}
}

// ─── Частицы ───
const particles=[];
function spawnParticles(x,y,color,n){
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2,s=1+Math.random()*4;
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:25+Math.random()*20,color,size:2+Math.random()*4,grav:0.18});
  }
}
function updateParticles(){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=p.grav;p.life--;
    if(p.life<=0)particles.splice(i,1);
  }
}

// ─── Canvas ───
const canvas=$('game'),ctx=canvas.getContext('2d');
let vw=0,vh=0,dpr=1;
function resize(){
  dpr=Math.min(2,window.devicePixelRatio||1);
  vw=innerWidth;vh=innerHeight;
  canvas.width=vw*dpr;canvas.height=vh*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize',resize);resize();

function lerpColor(a,b,t){
  const ah=parseInt(a.slice(1,3),16),ag=parseInt(a.slice(3,5),16),ab=parseInt(a.slice(5,7),16);
  const bh=parseInt(b.slice(1,3),16),bg=parseInt(b.slice(3,5),16),bb=parseInt(b.slice(5,7),16);
  return `rgb(${Math.round(ah+(bh-ah)*t)},${Math.round(ag+(bg-ag)*t)},${Math.round(ab+(bb-ab)*t)})`;
}

// ─── Отрисовка мира ───
function drawWorld(){
  const tx0=Math.max(0,Math.floor(cam.x/TILE)-1),tx1=Math.min(WW-1,Math.floor((cam.x+vw)/TILE)+1);
  const ty0=Math.max(0,Math.floor(cam.y/TILE)-1),ty1=Math.min(WH-1,Math.floor((cam.y+vh)/TILE)+1);
  const isDay=timeOfDay<(DAY_MS/CYCLE_MS);
  const dayTop='#5B9BD5',dayBot='#B4D7F0',nightTop='#0A0A1A',nightBot='#1A1A3A',dawnTop='#4A3B5C',dawnBot='#8B6F4E';
  let t=0,topC=dayTop,botC=dayBot;
  const dayRatio = DAY_MS/CYCLE_MS;
  if(timeOfDay<0.05){t=timeOfDay/0.05;topC=lerpColor(nightTop,dawnTop,1-t);botC=lerpColor(nightBot,dawnBot,1-t);}
  else if(timeOfDay>dayRatio-0.05&&timeOfDay<dayRatio+0.05){
    const tt = timeOfDay < dayRatio ? (timeOfDay-(dayRatio-0.05))/0.05 : (timeOfDay-dayRatio)/0.05;
    topC=lerpColor(dayTop,timeOfDay<dayRatio?dawnTop:nightTop,tt);
    botC=lerpColor(dayBot,timeOfDay<dayRatio?dawnBot:nightBot,tt);
  }
  else if(timeOfDay>dayRatio+0.05){t=(timeOfDay-(dayRatio+0.05))/(1-dayRatio-0.05);topC=lerpColor(dawnTop,nightTop,t);botC=lerpColor(dawnBot,nightBot,t);}

  const g=ctx.createLinearGradient(0,0,0,vh);
  g.addColorStop(0,topC);g.addColorStop(1,botC);
  ctx.fillStyle=g;ctx.fillRect(0,0,vw,vh);

  if(!isDay){
    ctx.fillStyle='rgba(255,255,255,'+(0.5+0.3*Math.sin(Date.now()*0.001))+')';
    const R=mulberry32(123);
    for(let i=0;i<80;i++){const sx=(R()*vw),sy=(R()*vh*0.6);ctx.fillRect(sx,sy,1.5+Math.random(),1.5+Math.random());}
    const mx=vw*0.8,my=vh*0.15;
    ctx.fillStyle='#E8E8E8';ctx.beginPath();ctx.arc(mx,my,30,0,7);ctx.fill();
    ctx.fillStyle='rgba(200,200,220,0.3)';ctx.beginPath();ctx.arc(mx-8,my+5,6,0,7);ctx.fill();
  }else{
    const sx=vw*(0.1+timeOfDay*0.6),sy=vh*0.2+Math.sin((timeOfDay)*Math.PI)*vh*0.15;
    const sg=ctx.createRadialGradient(sx,sy,8,sx,sy,70);
    sg.addColorStop(0,'rgba(255,240,200,1)');sg.addColorStop(0.3,'rgba(255,220,100,0.4)');sg.addColorStop(1,'rgba(255,220,100,0)');
    ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sx,sy,70,0,7);ctx.fill();
  }

  ctx.fillStyle='rgba(255,255,255,'+(isDay?0.35:0.08)+')';
  const now=Date.now();
  for(let i=0;i<6;i++){
    const cx=((i*400+now*0.015*(1+i%3))%(vw+300))-150;
    const cy=30+(i*50)%120;
    const s=0.8+(i%3)*0.2;
    ctx.beginPath();ctx.ellipse(cx,cy,50*s,14*s,0,0,7);ctx.ellipse(cx+30*s,cy+4*s,35*s,11*s,0,0,7);ctx.ellipse(cx-25*s,cy+5*s,30*s,9*s,0,0,7);ctx.fill();
  }

  // Дождь затемняет мир
  if(isRaining){
    ctx.fillStyle='rgba(40,50,80,0.25)';
    ctx.fillRect(0,0,vw,vh);
  }

  for(let ty=ty0;ty<=ty1;ty++){
    for(let tx=tx0;tx<=tx1;tx++){
      const id=tileAt(tx,ty);
      if(id===T.AIR)continue;
      const prop=BLOCK_PROPS[id];if(!prop)continue;
      const x=tx*TILE-cam.x,y=ty*TILE-cam.y;

      // Основной цвет с учётом дождя
      let color=prop.color;
      if(isRaining&&id===T.GRASS){color='#3A8A2A';} // мокрая трава
      if(isRaining&&id===T.DIRT){color='#6B4A1B';} // мокрая земля

      ctx.fillStyle=color;
      ctx.fillRect(x,y,TILE,TILE);
      ctx.fillStyle='rgba(0,0,0,0.18)';
      ctx.fillRect(x,y,TILE,2);ctx.fillRect(x,y,2,TILE);
      ctx.fillStyle='rgba(255,255,255,0.06)';
      ctx.fillRect(x+2,y+2,TILE-4,2);

      if(id===T.GRASS){ctx.fillStyle='#44AA33';ctx.fillRect(x+2,y,4,3);ctx.fillRect(x+12,y,5,2);ctx.fillRect(x+20,y,4,3);}
      if(id===T.STONE){ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(x+4,y+6,6,4);ctx.fillRect(x+16,y+14,5,3);}
      if(id===T.WOOD){ctx.fillStyle='rgba(60,30,10,0.3)';ctx.fillRect(x+8,y,2,TILE);ctx.fillRect(x+18,y,2,TILE);}
      if(id===T.LEAVES){ctx.fillStyle='rgba(0,0,0,0.1)';ctx.fillRect(x+4,y+4,8,6);ctx.fillRect(x+16,y+10,6,5);}
      if(id===T.CACTUS){ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(x+4,y+4,4,4);ctx.fillRect(x+18,y+12,4,4);}
      if(id===T.CLAY){ctx.fillStyle='rgba(100,80,60,0.2)';ctx.fillRect(x+6,y+6,8,8);}
      if(id===T.GRAVEL){ctx.fillStyle='rgba(0,0,0,0.15)';for(let i=0;i<3;i++)ctx.fillRect(x+4+i*8,y+4+Math.random()*16,3,3);}
      if(id===T.MOSSY){ctx.fillStyle='rgba(80,160,80,0.3)';ctx.fillRect(x+2,y+2,TILE-4,3);ctx.fillRect(x+2,y+TILE-5,TILE-4,3);}
      if(id===T.OBSIDIAN){ctx.fillStyle='rgba(100,0,150,0.3)';ctx.fillRect(x+4,y+4,6,6);ctx.fillRect(x+16,y+16,4,4);}
      if(id===T.EMERALD){ctx.fillStyle='rgba(0,255,100,0.4)';ctx.fillRect(x+8,y+8,12,12);}
      if((id===T.GOLD||id===T.DIAMOND||id===T.EMERALD)&&Math.random()<0.02){ctx.fillStyle='#FFFFFF';ctx.fillRect(x+Math.random()*22,y+Math.random()*22,2,2);}
      if(id===T.TORCH){
        const glow=ctx.createRadialGradient(x+14,y+10,2,x+14,y+10,70);
        glow.addColorStop(0,'rgba(255,200,80,0.4)');glow.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x+14,y+10,70,0,7);ctx.fill();
        ctx.fillStyle='#FFDD88';ctx.beginPath();ctx.arc(x+14,y+4,4+Math.sin(now*0.01)*1,0,7);ctx.fill();
      }
      if(id===T.FLOWER_R||id===T.FLOWER_Y){ctx.fillStyle=id===T.FLOWER_R?'#FF4444':'#FFDD00';ctx.beginPath();ctx.arc(x+14,y+10,5,0,7);ctx.fill();ctx.fillStyle='#228B22';ctx.fillRect(x+13,y+14,2,10);}
      if(id===T.MUSHROOM){ctx.fillStyle='#CC4444';ctx.beginPath();ctx.arc(x+14,y+12,7,Math.PI,0);ctx.fill();ctx.fillStyle='#DDDDAA';ctx.fillRect(x+12,y+12,4,8);}
    }
  }
  if(!isDay){const dark=timeOfDay<dayRatio?(1-timeOfDay/dayRatio)*0.55:((timeOfDay-dayRatio)/(1-dayRatio))*0.55;ctx.fillStyle=`rgba(0,0,25,${dark})`;ctx.fillRect(0,0,vw,vh);}
}

// ─── Отрисовка мобов ───
function drawMobs(){
  for(const m of mobs){
    if(m.dead)continue;
    const type=MOB_TYPES[m.type];if(!type)continue;
    const x=m.x-cam.x,y=m.y-cam.y;
    if(x<-60||x>vw+60||y<-60||y>vh+60)continue;
    if(m.flash>0)ctx.globalAlpha=0.5+0.5*Math.sin(m.flash*0.8);

    if(m.type==='chicken'){
      ctx.fillStyle=type.color;ctx.beginPath();ctx.ellipse(x+type.w/2,y+type.h/2,type.w/2,type.h/2,0,0,7);ctx.fill();
      ctx.fillStyle='#FFFFFF';ctx.beginPath();ctx.arc(x+type.w/2+3*m.dir,y+6,5,0,7);ctx.fill();
      ctx.fillStyle='#FFAA00';ctx.fillRect(x+type.w/2+6*m.dir,y+5,4,3);
      const legOff=Math.sin(m.anim*0.2)*3;
      ctx.fillStyle='#FF8800';ctx.fillRect(x+6,y+type.h-2+legOff,2,6);ctx.fillRect(x+type.w-8,y+type.h-2-legOff,2,6);
      ctx.fillStyle='#FF0000';ctx.fillRect(x+type.w/2+2*m.dir,y,3,3);
    }else if(m.type==='slime'){
      const squish=1+Math.sin(m.anim*0.15)*0.15;
      ctx.fillStyle=type.color;ctx.save();ctx.translate(x+type.w/2,y+type.h);ctx.scale(1/squish,squish);ctx.beginPath();ctx.ellipse(0,-type.h/2,type.w/2,type.h/2,0,0,7);ctx.fill();ctx.restore();
      ctx.fillStyle='#FFFFFF';ctx.beginPath();ctx.arc(x+6,y+8,4,0,7);ctx.arc(x+type.w-6,y+8,4,0,7);ctx.fill();
      ctx.fillStyle='#000000';ctx.beginPath();ctx.arc(x+7,y+8,2,0,7);ctx.arc(x+type.w-5,y+8,2,0,7);ctx.fill();
    }else if(m.type==='zombie'){
      ctx.fillStyle=type.color;ctx.fillRect(x+2,y+8,type.w-4,type.h-8);
      ctx.fillStyle='#779977';ctx.fillRect(x+4,y,12,10);
      ctx.fillStyle='#FF0000';ctx.fillRect(x+6,y+3,3,3);ctx.fillRect(x+11,y+3,3,3);
      const armSwing=Math.sin(m.anim*0.1)*6;
      ctx.fillStyle='#668866';ctx.fillRect(x-2,y+10+armSwing,4,10);ctx.fillRect(x+type.w-2,y+10-armSwing,4,10);
      const legSwing=Math.sin(m.anim*0.1)*4;
      ctx.fillRect(x+4,y+type.h-4+legSwing,4,6);ctx.fillRect(x+type.w-8,y+type.h-4-legSwing,4,6);
    }else if(m.type==='bat'){
      ctx.fillStyle=type.color;ctx.beginPath();ctx.ellipse(x+type.w/2,y+type.h/2,12,6,0,0,7);ctx.fill();
      const wingFlap=Math.sin(m.anim*0.3)*12;
      ctx.fillStyle='#664488';ctx.beginPath();ctx.moveTo(x+type.w/2,y+type.h/2);ctx.lineTo(x-8,y+type.h/2-wingFlap);ctx.lineTo(x+type.w/2-4,y+type.h/2+2);ctx.fill();
      ctx.beginPath();ctx.moveTo(x+type.w/2,y+type.h/2);ctx.lineTo(x+type.w+8,y+type.h/2-wingFlap);ctx.lineTo(x+type.w/2+4,y+type.h/2+2);ctx.fill();
      ctx.fillStyle='#FF4444';ctx.beginPath();ctx.arc(x+type.w/2-3,y+type.h/2-2,2,0,7);ctx.arc(x+type.w/2+3,y+type.h/2-2,2,0,7);ctx.fill();
    }else if(m.type==='skeleton'){
      ctx.fillStyle=type.color;ctx.fillRect(x+2,y+8,type.w-4,type.h-8);
      ctx.fillStyle='#FFFFFF';ctx.fillRect(x+4,y,12,10);
      ctx.fillStyle='#000000';ctx.fillRect(x+6,y+3,3,3);ctx.fillRect(x+11,y+3,3,3);
      const armSwing=Math.sin(m.anim*0.1)*6;
      ctx.fillStyle='#CCCCCC';ctx.fillRect(x-2,y+10+armSwing,4,10);ctx.fillRect(x+type.w-2,y+10-armSwing,4,10);
      ctx.fillStyle='#AAAAAA';ctx.fillRect(x+4,y+type.h-4,4,6);ctx.fillRect(x+type.w-8,y+type.h-4,4,6);
    }else if(m.type==='creeper'){
      const pulse=m.charge?1+Math.sin(m.charge*0.3)*0.1:1;
      ctx.fillStyle=type.color;ctx.save();ctx.translate(x+type.w/2,y+type.h/2);ctx.scale(pulse,pulse);ctx.fillRect(-type.w/2+2,-type.h/2+4,type.w-4,type.h-4);ctx.restore();
      ctx.fillStyle='#000000';ctx.fillRect(x+6,y+6,3,3);ctx.fillRect(x+11,y+6,3,3);
      ctx.fillStyle='#FFFFFF';ctx.fillRect(x+7,y+7,1,1);ctx.fillRect(x+12,y+7,1,1);
      // Рот
      ctx.fillStyle='#333333';ctx.fillRect(x+7,y+12,6,2);
      if(m.charge&&m.charge>60){
        ctx.fillStyle='rgba(255,255,0,'+(m.charge/120)+')';
        ctx.fillRect(x-2,y-2,type.w+4,type.h+4);
      }
    }
    if(m.hp<type.maxHp){
      const barW=type.w+4;
      ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(x-2,y-8,barW,4);
      ctx.fillStyle='#e74c3c';ctx.fillRect(x-1,y-7,(m.hp/type.maxHp)*(barW-2),2);
    }
    ctx.globalAlpha=1;
  }
}

// ─── Отрисовка игрока (СЛАЙМ!) ───
function drawPlayerEntity(){
  if(P.dead)return;
  const x=P.x-cam.x,y=P.y-cam.y;
  if(P.invulnerable>0&&Math.floor(P.invulnerable/4)%2===0)return;
  if(P.invisible&&Math.random()<0.3)return; // мерцание при невидимости

  // Тень
  ctx.fillStyle='rgba(0,0,0,0.2)';ctx.beginPath();ctx.ellipse(x+P.w/2,y+P.h+4,P.w/2+2,4,0,0,7);ctx.fill();

  // Тело слайма (сжатие при движении)
  const squish=Math.abs(P.vx)>0.5?1+Math.sin(P.x*0.15)*0.12:1;
  const bounce=Math.abs(P.vx)>0.5?Math.sin(P.x*0.15)*2:0;

  ctx.fillStyle='#66CC66'; // зелёный слайм
  ctx.save();
  ctx.translate(x+P.w/2,y+P.h/2+bounce);
  ctx.scale(squish,1/squish);
  ctx.beginPath();
  ctx.ellipse(0,0,P.w/2,P.h/2,0,0,7);
  ctx.fill();
  ctx.restore();

  // Глаза
  const eyeOff=P.dir*3;
  ctx.fillStyle='#FFFFFF';
  ctx.beginPath();ctx.arc(x+P.w/2-5+eyeOff,y+P.h/2-4+bounce,4,0,7);ctx.fill();
  ctx.beginPath();ctx.arc(x+P.w/2+5+eyeOff,y+P.h/2-4+bounce,4,0,7);ctx.fill();
  ctx.fillStyle='#000000';
  ctx.beginPath();ctx.arc(x+P.w/2-4+eyeOff*1.2,y+P.h/2-4+bounce,2,0,7);ctx.fill();
  ctx.beginPath();ctx.arc(x+P.w/2+6+eyeOff*1.2,y+P.h/2-4+bounce,2,0,7);ctx.fill();

  // Рот (улыбка)
  ctx.strokeStyle='#228B22';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(x+P.w/2,y+P.h/2+2+bounce,5,0.2,Math.PI-0.2);ctx.stroke();

  // Блик (глянцевый слайм)
  ctx.fillStyle='rgba(255,255,255,0.3)';
  ctx.beginPath();ctx.ellipse(x+P.w/2-4,y+P.h/2-6+bounce,4,2,-0.3,0,7);ctx.fill();

  // Имя
  ctx.font='700 11px sans-serif';ctx.textAlign='center';ctx.fillStyle='#FFFFFF';
  ctx.shadowColor='rgba(0,0,0,0.8)';ctx.shadowBlur=4;
  ctx.fillText(MY_NAME||'???',x+P.w/2,y-10);
  ctx.shadowBlur=0;

  // Уровень над головой
  ctx.font='800 9px sans-serif';ctx.fillStyle='#FFD700';
  ctx.fillText('LVL '+playerLevel,x+P.w/2,y-22);
}

// ─── Отрисовка других игроков (тоже слаймы) ───
function drawRemotePlayers(){
  for(const k in remotes){
    const r=remotes[k];
    const x=r.rx-cam.x,y=r.ry-cam.y;
    if(x<-50||x>vw+50||y<-50||y>vh+50)continue;

    // Тень
    ctx.fillStyle='rgba(0,0,0,0.2)';ctx.beginPath();ctx.ellipse(x+11,y+26,11,3,0,0,7);ctx.fill();

    // Тело слайма
    ctx.fillStyle='#9B59B6'; // фиолетовый слайм
    ctx.beginPath();ctx.ellipse(x+11,y+11,11,11,0,0,7);ctx.fill();

    // Глаза
    ctx.fillStyle='#FFFFFF';ctx.beginPath();ctx.arc(x+7,y+8,3,0,7);ctx.arc(x+15,y+8,3,0,7);ctx.fill();
    ctx.fillStyle='#000000';ctx.beginPath();ctx.arc(x+8,y+8,1.5,0,7);ctx.arc(x+16,y+8,1.5,0,7);ctx.fill();

    // Имя
    ctx.font='700 10px sans-serif';ctx.textAlign='center';ctx.fillStyle='#FFE98A';
    ctx.fillText(r.n||'???',x+11,y-6);
  }
}

// ─── Частицы ───
function drawParticles(){
  for(const p of particles){
    ctx.globalAlpha=p.life/35;
    ctx.fillStyle=p.color;
    ctx.fillRect(p.x-cam.x,p.y-cam.y,p.size,p.size);
  }
  ctx.globalAlpha=1;
}

// ─── Дождь на canvas ───
function drawRain(){
  if(!isRaining)return;
  ctx.strokeStyle='rgba(180,200,255,0.6)';
  ctx.lineWidth=1.5;
  for(const d of rainDrops){
    ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-1,d.y+d.len);ctx.stroke();
  }
  ctx.fillStyle='rgba(180,200,255,0.4)';
  for(const s of rainSplashes){
    ctx.beginPath();ctx.ellipse(s.x,s.y,4*s.life/10,1.5*s.life/10,0,0,7);ctx.fill();
  }
}

// ─── Мини-карта ───
const minimapCanvas=$('minimapCanvas');
const minimapCtx=minimapCanvas.getContext('2d');
let minimapDirty=true;
let minimapData=null;

function drawMinimap(){
  if($('minimap').classList.contains('hidden'))return;

  const mw=180,mh=120;
  const scaleX=mw/WW;
  const scaleY=mh/WH;

  // Генерируем карту один раз, потом обновляем только игроков
  if(minimapDirty||!minimapData){
    minimapCtx.fillStyle='#0a0a14';minimapCtx.fillRect(0,0,mw,mh);
    // Рисуем поверхность
    for(let x=0;x<WW;x+=3){
      const h=surf[x];
      const my=Math.floor(h*scaleY);
      const biome=Math.floor(x/600)%4;
      minimapCtx.fillStyle=biome===0?'#55AA44':biome===1?'#D4C4A0':biome===2?'#E8E8E8':'#8B5A2B';
      minimapCtx.fillRect(Math.floor(x*scaleX),my,1,1);
    }
    minimapDirty=false;
  }else{
    // Очищаем только область игроков
    minimapCtx.fillStyle='#0a0a14';minimapCtx.fillRect(0,0,mw,mh);
    // Перерисовываем поверхность
    for(let x=0;x<WW;x+=3){
      const h=surf[x];
      const my=Math.floor(h*scaleY);
      const biome=Math.floor(x/600)%4;
      minimapCtx.fillStyle=biome===0?'#55AA44':biome===1?'#D4C4A0':biome===2?'#E8E8E8':'#8B5A2B';
      minimapCtx.fillRect(Math.floor(x*scaleX),my,1,1);
    }
  }

  // Игрок (зелёная точка)
  const px=Math.floor((P.x/WORLD_PX_W)*mw);
  const py=Math.floor((P.y/WORLD_PX_H)*mh);
  minimapCtx.fillStyle='#00FF00';minimapCtx.beginPath();minimapCtx.arc(px,py,3,0,7);minimapCtx.fill();
  minimapCtx.strokeStyle='#FFFFFF';minimapCtx.lineWidth=1;minimapCtx.stroke();

  // Другие игроки (фиолетовые точки)
  for(const k in remotes){
    const r=remotes[k];
    const rx=Math.floor((r.rx/WORLD_PX_W)*mw);
    const ry=Math.floor((r.ry/WORLD_PX_H)*mh);
    minimapCtx.fillStyle='#9B59B6';minimapCtx.beginPath();minimapCtx.arc(rx,ry,2,0,7);minimapCtx.fill();
  }

  // Мобы (красные точки)
  for(const m of mobs){
    if(m.dead)continue;
    const mx=Math.floor((m.x/WORLD_PX_W)*mw);
    const my=Math.floor((m.y/WORLD_PX_H)*mh);
    minimapCtx.fillStyle='#FF4444';minimapCtx.fillRect(mx,my,2,2);
  }

  // Обновляем счётчик онлайна
  const onlineCount=Object.keys(remotes).length+1;
  $('minimapOnline').textContent=onlineCount;
  $('onlineCount').textContent='👥 Онлайн: '+onlineCount;
}

function renderHotbar(){
  const bar=$('hotbar');bar.innerHTML='';
  for(let i=0;i<HOTBAR_ORDER.length;i++){
    const id=HOTBAR_ORDER[i];
    const div=document.createElement('div');
    div.className='slot'+(i===selectedSlot?' active':'');
    div.innerHTML=`<span>${BLOCK_PROPS[id]?.icon||'?'}</span><span class="count">${invCount(id)}</span>`;
    div.addEventListener('touchstart',e=>{e.preventDefault();selectedSlot=i;renderHotbar();},{passive:false});
    bar.appendChild(div);
  }
}

function openInv(){
  const grid=$('invGrid');grid.innerHTML='';
  const items=Object.entries(inventory).filter(([k,v])=>v>0);
  for(const[id,cnt]of items){
    const div=document.createElement('div');
    div.className='inv-item';
    div.innerHTML=`<span>${BLOCK_PROPS[id]?.icon||'?'}</span><span class="cnt">${cnt}</span>`;
    grid.appendChild(div);
  }
  $('invOverlay').classList.add('open');
}

// ─── Сеть ───
let MY_UID=null,MY_NAME='',joined=false;
const remotes={};
let meRef=null,lastSend=0;

function pushDelta(tx,ty,id){
  if(!joined)return;
  db.ref('world/deltas/'+tx+'_'+ty).set({id,t:firebase.database.ServerValue.TIMESTAMP});
}

function joinNet(){
  meRef=db.ref('players/'+MY_UID);
  db.ref('.info/connected').on('value',s=>{if(s.val()===true){meRef.onDisconnect().remove();sendNow();}});
  db.ref('players').on('value',snap=>{
    const now=Date.now(),seen=new Set();
    snap.forEach(ch=>{
      const v=ch.val();if(!v||ch.key===MY_UID)return;if(v.t&&now-v.t>15000)return;
      seen.add(ch.key);
      let r=remotes[ch.key];if(!r)r=remotes[ch.key]={rx:v.x,ry:v.y,tx:v.x,ty:v.y};
      r.n=v.n;r.tx=v.x;r.ty=v.y;r.t=v.t;
    });
    for(const k in remotes)if(!seen.has(k))delete remotes[k];
    $('onlineCount').textContent='👥 Онлайн: '+(seen.size+1);
  });
  db.ref('world/deltas').on('child_added',snap=>{
    const key=snap.key;const v=snap.val();if(!v)return;const[tx,ty]=key.split('_').map(Number);
    if(tx>=0&&tx<WW&&ty>=0&&ty<WH)world[ty*WW+tx]=v.id;
  });
  db.ref('world/deltas').on('child_changed',snap=>{
    const key=snap.key;const v=snap.val();if(!v)return;const[tx,ty]=key.split('_').map(Number);
    if(tx>=0&&tx<WW&&ty>=0&&ty<WH)world[ty*WW+tx]=v.id;
  });
  db.ref('chat').limitToLast(20).on('child_added',snap=>{
    const d=snap.val();if(!d)return;
    const el=document.createElement('div');
    el.innerHTML='<span style="color:#ffe98a;font-weight:800">'+esc(d.name)+':</span> <span style="color:#fff">'+esc(d.text)+'</span>';
    const box=$('chatMsgs');box.appendChild(el);box.scrollTop=box.scrollHeight;
  });
  setInterval(()=>{if(Date.now()-lastSend>80)sendNow();},80);
}

function sendNow(){
  if(!meRef)return;
  lastSend=Date.now();
  meRef.update({n:MY_NAME,x:Math.round(P.x),y:Math.round(P.y),d:P.dir,l:playerLevel,t:firebase.database.ServerValue.TIMESTAMP});
}

function sendChat(){
  const txt=$('chatInput').value.trim();if(!txt)return;
  db.ref('chat').push({name:MY_NAME,text:txt,t:firebase.database.ServerValue.TIMESTAMP});
  $('chatInput').value='';
}

function smoothRemotes(){
  for(const k in remotes){
    const r=remotes[k];
    r.rx=lerp(r.rx,r.tx,0.25);r.ry=lerp(r.ry,r.ty,0.25);
  }
}

// ─── Главный цикл ───
let lastTs=0;
function loop(ts){
  requestAnimationFrame(loop);
  if(!lastTs)lastTs=ts;
  const dt=Math.min(50,ts-lastTs);lastTs=ts;

  if(!P.dead){
    stepPlayer();
    updateMobs();
  }
  updateParticles();
  updateRain();
  smoothRemotes();
  updateTime();

  $('coords').textContent='X:'+Math.floor(P.x/TILE)+' Y:'+(WH-Math.floor(P.y/TILE));

  ctx.clearRect(0,0,vw,vh);
  drawWorld();
  drawParticles();
  drawMobs();
  drawRemotePlayers();
  drawPlayerEntity();
  drawRain();
  drawMinimap();

  if(joined)sendNow();
}

// ─── Запуск ───
auth.onAuthStateChanged(async user=>{
  if(user&&!joined){
    joined=true;MY_UID=user.uid;
    try{const s=await db.ref('users/'+user.uid+'/name').once('value');MY_NAME=s.val()||user.email.split('@')[0].slice(0,14);}catch(e){MY_NAME=user.email.split('@')[0].slice(0,14);}
    $('auth').classList.add('hidden');$('loading').classList.add('hidden');$('hud').classList.add('on');
    genWorld();spawnMobs();setupTouch();joinNet();
    goFullscreen();
    startMusic();
    requestAnimationFrame(loop);
  }else if(!user){$('loading').classList.add('hidden');$('auth').classList.remove('hidden');}
});
