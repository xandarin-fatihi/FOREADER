const STORAGE_V11='okuyol.v11';
const STORAGE_V10='okuyol.v10';
const STORAGE_V9='okuyol.v9';
const STORAGE_V8='okuyol.v8';
const STORAGE_V7='okuyol.v7';
const STORAGE_V6='okuyol.v6';
const STORAGE_V5='okuyol.v5';
const STORAGE_V4='okuyol.v4';
const STORAGE_V3='okuyol.v3';
const STORAGE_V2='okuyol.v2';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

const FONT_MAP={
  'Poppins':"'Poppins',system-ui,sans-serif",'Inter':"'Inter',system-ui,sans-serif",'Montserrat':"'Montserrat',system-ui,sans-serif",'Roboto':"'Roboto',system-ui,sans-serif",'Open Sans':"'Open Sans',system-ui,sans-serif",'Lato':"'Lato',system-ui,sans-serif",'Nunito':"'Nunito',system-ui,sans-serif",'Playfair Display':"'Playfair Display',Georgia,serif",'Merriweather':"'Merriweather',Georgia,serif",'Georgia':"Georgia,'Times New Roman',serif"
};

const FONT_CSS_URLS={
  'Poppins':'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  'Inter':'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'Montserrat':'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap',
  'Roboto':'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  'Open Sans':'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap',
  'Lato':'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
  'Nunito':'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap',
  'Playfair Display':'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap',
  'Merriweather':'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap'
};
function ensureFontLoaded(name){
  const link=$('#appFontStylesheet');
  if(!link||name==='Georgia')return;
  const url=FONT_CSS_URLS[name]||FONT_CSS_URLS.Poppins;
  if(link.href!==url)link.href=url;
}

const DEFAULT_MILESTONES={
  firstBook:{enabled:true,target:1,title:'İlk Kitap',icon:'◎',metric:'books',suffix:'kitap'},
  page500:{enabled:true,target:500,title:'500 Sayfa',icon:'▤',metric:'pages',suffix:'sayfa'},
  page1000:{enabled:true,target:1000,title:'1000 Sayfa',icon:'▥',metric:'pages',suffix:'sayfa'},
  streak7:{enabled:true,target:7,title:'7 Gün Seri',icon:'♨',metric:'streak',suffix:'gün'},
  streak30:{enabled:false,target:30,title:'30 Gün Seri',icon:'☀',metric:'streak',suffix:'gün'},
  categories3:{enabled:true,target:3,title:'3 Kategori',icon:'▦',metric:'categories',suffix:'kategori'},
  reflections1:{enabled:true,target:1,title:'İzlenim Yaz',icon:'✎',metric:'reflections',suffix:'yazı'}
};

const seed={
  theme:'dark',sidebarCollapsed:false,
  goals:{books:12,pages:4000,milestones:structuredClone(DEFAULT_MILESTONES)},
  appearance:{font:'Poppins',bgType:'color',bgImage:'',bgOverlay:0,surfaceOpacity:55,visualStyle:'bar'},
  themePrefs:{
    light:{background:'#f5efe7',accent:'#b96d2f'},
    dark:{background:'#07121b',accent:'#e7a153'}
  },
  profile:{firstName:'OkuYol',lastName:'Okuru',avatar:'',bio:'Küçük sayfalar, büyük değişimler.',quote:'Her tamamlanan kitap, senden geriye güzel bir iz bırakır.'},
  categories:[
    {id:'cat-philosophy',name:'Felsefe',icon:'◫'},
    {id:'cat-psychology',name:'Psikoloji',icon:'Ψ'},
    {id:'cat-history',name:'Tarih',icon:'⌛'},
    {id:'cat-novel',name:'Roman',icon:'✦'},
    {id:'cat-general',name:'Genel',icon:'◉'}
  ],
  books:[{id:crypto.randomUUID(),title:'Dune',author:'Frank Herbert',totalPages:688,currentPage:164,cover:'',categoryId:'cat-general',status:'reading',startedAt:new Date().toISOString(),completedAt:null,rating:0,reflection:''}],
  logs:[]
};

let deferredInstallPrompt=null,pendingAvatarData='',pendingBackgroundData='',state=loadState();

function normalize(raw={}){
  const categories=Array.isArray(raw.categories)&&raw.categories.length?raw.categories:structuredClone(seed.categories);
  const valid=new Set(categories.map(c=>c.id));
  const books=(Array.isArray(raw.books)?raw.books:structuredClone(seed.books)).map(b=>({
    publisher:'',isbn:'',plannedNote:'',plannedAt:null,...b,
    categoryId:valid.has(b.categoryId)?b.categoryId:'cat-general',
    status:['planned','reading','completed'].includes(b.status)?b.status:'reading'
  }));
  const legacyBg=raw.appearance?.bgColor;
  return {
    ...structuredClone(seed),...raw,
    goals:(()=>{const g={...seed.goals,...(raw.goals||{})}; g.milestones=Object.fromEntries(Object.entries(DEFAULT_MILESTONES).map(([k,v])=>[k,{...v,...(raw.goals?.milestones?.[k]||{})}])); return g;})(),
    appearance:{...seed.appearance,...(raw.appearance||{}),visualStyle:['bar','donut','path'].includes(raw.appearance?.visualStyle)?raw.appearance.visualStyle:'bar'},
    themePrefs:{
      light:{...seed.themePrefs.light,...(raw.themePrefs?.light||{}),...(legacyBg&&raw.theme==='light'?{background:legacyBg}:{})},
      dark:{...seed.themePrefs.dark,...(raw.themePrefs?.dark||{}),...(legacyBg&&raw.theme==='dark'?{background:legacyBg}:{})}
    },
    profile:{...seed.profile,...(raw.profile||{})},categories,books,logs:Array.isArray(raw.logs)?raw.logs:[]
  };
}
function loadState(){
  try{
    for(const key of [STORAGE_V11,STORAGE_V10,STORAGE_V9,STORAGE_V8,STORAGE_V7,STORAGE_V6,STORAGE_V5,STORAGE_V4,STORAGE_V3,STORAGE_V2]){
      const raw=localStorage.getItem(key); if(!raw)continue;
      const migrated=normalize(JSON.parse(raw));
      if(key!==STORAGE_V11)localStorage.setItem(STORAGE_V11,JSON.stringify(migrated));
      return migrated;
    }
  }catch(e){console.warn(e)}
  return structuredClone(seed);
}
function persistState(){localStorage.setItem(STORAGE_V11,JSON.stringify(state));}
function saveState(){persistState();renderAll();}
function escapeHtml(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function todayKey(date=new Date()){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`;}
function pct(n,d){return Math.min(100,Math.round(Number(n)/Math.max(1,Number(d))*100));}
const getCompleted=()=>state.books.filter(b=>b.status==='completed');
const getActive=()=>state.books.filter(b=>b.status==='reading');
const getPlanned=()=>state.books.filter(b=>b.status==='planned');
const totalPagesRead=()=>state.logs.reduce((s,l)=>s+(Number(l.pages)||0),0);
const completedPages=()=>getCompleted().reduce((s,b)=>s+Number(b.totalPages||0),0);
const goalBookProgress=()=>pct(getCompleted().length,state.goals.books);
const goalPageProgress=()=>pct(Math.max(totalPagesRead(),completedPages()),state.goals.pages);
const journeyTotalPages=()=>Math.max(totalPagesRead(),completedPages());
function milestoneCurrentValue(metric){
  const reflections=getCompleted().filter(b=>b.reflection?.trim()).length;
  const categories=new Set(getCompleted().map(b=>b.categoryId)).size;
  const values={books:getCompleted().length,pages:journeyTotalPages(),streak:calcStreak(),reflections,categories};
  return values[metric]??0;
}
function formatMilestoneValue(v,suffix=''){return `${Number(v).toLocaleString('tr-TR')} ${suffix}`.trim();}
function fullName(){return `${state.profile.firstName||'OkuYol'} ${state.profile.lastName||'Okuru'}`.trim();}
function initials(){return fullName().split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]?.toUpperCase()).join('')||'OY';}

function categoryName(id){return state.categories.find(c=>c.id===id)?.name||'Genel';}
function formatDate(value){
  if(!value)return '—';
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return String(value);
  return new Intl.DateTimeFormat('tr-TR',{day:'2-digit',month:'short',year:'numeric'}).format(d);
}
function daysBetween(start,end){
  if(!start||!end)return '—';
  const a=new Date(start),b=new Date(end);
  if(Number.isNaN(a.getTime())||Number.isNaN(b.getTime()))return '—';
  return Math.max(1,Math.ceil((b-a)/86400000))+' gün';
}
function logsForBook(id){
  return state.logs
    .filter(l=>l.bookId===id)
    .slice()
    .sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
}


function renderAvatar(selector){const el=$(selector);if(!el)return;if(state.profile.avatar)el.innerHTML=`<img src="${escapeHtml(state.profile.avatar)}" alt="Profil fotoğrafı" onerror="this.parentElement.textContent='${initials()}'">`;else el.textContent=initials();}
function applyAppearance(){
  document.documentElement.dataset.theme=state.theme;
  ensureFontLoaded(state.appearance.font);
  document.documentElement.style.setProperty('--app-font',FONT_MAP[state.appearance.font]||FONT_MAP.Poppins);
  const opacity=Math.max(20,Math.min(90,Number(state.appearance.surfaceOpacity??55)));
  document.documentElement.style.setProperty('--surface-opacity',`${opacity}%`);
  document.documentElement.style.setProperty('--profile-panel-opacity',`${Math.max(20,Math.min(65,opacity-10))}%`);
  const prefs=state.themePrefs[state.theme]||seed.themePrefs[state.theme];
  const bg=prefs.background,accent=prefs.accent;
  document.documentElement.style.setProperty('--accent',accent);
  document.documentElement.style.setProperty('--accent-2',accent);
  document.documentElement.style.setProperty('--app-bg-color',bg);
  const image=(state.appearance.bgType==='image'&&state.appearance.bgImage)?`url("${String(state.appearance.bgImage).replace(/"/g,'\\"')}")`:'none';
  document.documentElement.style.setProperty('--app-bg-image',image);
  document.documentElement.style.setProperty('--app-overlay',String(Math.max(0,Math.min(85,Number(state.appearance.bgOverlay||0)))/100));
  document.querySelector('meta[name="theme-color"]').setAttribute('content',bg);
  $('#fontSelect').value=state.appearance.font;
  $('#themeSettingsLabel').textContent=state.theme==='dark'?'Koyu':'Aydınlık';
  const visualMap={bar:'Çubuk',donut:'Pasta',path:'Patika'};
  const vLabel=$('#visualStyleLabel'); if(vLabel) vLabel.textContent=visualMap[state.appearance.visualStyle]||'Çubuk';
  $('#appLayout').classList.toggle('sidebar-collapsed',!!state.sidebarCollapsed);
  $$('[data-visual-style]').forEach(b=>b.classList.toggle('active',b.dataset.visualStyle===state.appearance.visualStyle));
}
function setTheme(theme){state.theme=theme;persistState();applyAppearance();renderProfile();}
function openDialog(id){$('#'+id)?.showModal();}
function closeDialog(id){$('#'+id)?.close();}

function navigate(view){
  $$('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===view));
  $$('.side-link,.mini-profile[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===view));
  $('#pageTopLabel').textContent={overview:'Genel Bakış',reading:'Okuyorum',planned:'Okunacaklar',library:'Kitaplığım',stats:'İstatistikler',profile:'Profil'}[view]||'OkuYol';
}
function bookCover(book,cls='book-cover'){return book.cover?`<img class="${cls}" src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.title)} kapağı" onerror="this.outerHTML='<div class=&quot;${cls} cover-fallback&quot;>${escapeHtml(book.title)}</div>'">`:`<div class="${cls} cover-fallback">${escapeHtml(book.title)}</div>`;}
function bookCard(book){const p=pct(book.currentPage,book.totalPages);return `<article class="book-card">${bookCover(book)}<div class="book-meta"><div class="book-title-line"><h3>${escapeHtml(book.title)}</h3><span class="category-badge">${escapeHtml(categoryName(book.categoryId))}</span></div><p>${escapeHtml(book.author||'Yazar belirtilmedi')}</p><div class="book-row"><span>${book.currentPage} / ${book.totalPages} sayfa</span><b>%${p}</b></div><div class="progress"><i style="width:${p}%"></i></div><div class="book-actions"><button class="primary" type="button" onclick="openProgress('${book.id}')">İlerleme Ekle</button><button class="secondary" type="button" onclick="finishNow('${book.id}')">Bitirdim</button></div></div></article>`;}
function getWeekData(){const labels=['Paz','Pzt','Sal','Çar','Per','Cum','Cts'],out=[];for(let i=6;i>=0;i--){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-i);const key=todayKey(d);out.push({label:labels[d.getDay()],pages:state.logs.filter(l=>l.date===key).reduce((s,l)=>s+(Number(l.pages)||0),0)});}return out;}
function renderChart(selector,data,maxHeight){const max=Math.max(1,...data.map(d=>d.pages));$(selector).innerHTML=data.map(d=>`<div class="bar-item"><span class="bar-value">${d.pages||''}</span><div class="bar" style="height:${Math.max(3,Math.round(d.pages/max*maxHeight))}px"></div><span class="bar-label">${d.label}</span></div>`).join('');}
function calcStreak(){const set=new Set(state.logs.filter(l=>l.pages>0).map(l=>l.date));let streak=0,d=new Date();d.setHours(0,0,0,0);while(set.has(todayKey(d))){streak++;d.setDate(d.getDate()-1);}return streak;}


function journeyBarView(){
  const bookP=goalBookProgress(),pageP=goalPageProgress(),done=getCompleted().length,pages=journeyTotalPages(),overall=Math.round((bookP+pageP)/2);
  const activeTargets=roadmapMilestones().filter(m=>m.kind==='milestone').slice(0,4);
  return `<div class="journey-bar-layout v10-bar-layout">
    <div class="journey-overall v10-overall-card">
      <div class="journey-overall-ring" style="--p:${overall}">
        <strong>%${overall}</strong><small>genel</small>
      </div>
      <p>Yıllık hedef ilerlemen</p>
    </div>
    <div class="journey-bars v10-bars-stack">
      <div class="journey-bar-row v10-bar-row">
        <div class="journey-bar-top"><span class="journey-bar-name"><i>▣</i>Kitap hedefi</span><b>%${bookP}</b></div>
        <div class="journey-bar-value">${done} / ${state.goals.books} kitap</div>
        <div class="journey-track"><i style="width:${bookP}%"></i></div>
      </div>
      <div class="journey-bar-row v10-bar-row">
        <div class="journey-bar-top"><span class="journey-bar-name"><i>▤</i>Sayfa hedefi</span><b>%${pageP}</b></div>
        <div class="journey-bar-value">${pages.toLocaleString('tr-TR')} / ${state.goals.pages.toLocaleString('tr-TR')} sayfa</div>
        <div class="journey-track"><i style="width:${pageP}%"></i></div>
      </div>
      <div class="journey-chip-row v10-chip-row">${activeTargets.map(m=>`<span class="journey-mini-chip ${m.ok?'done':''}">${m.icon} ${escapeHtml(m.title)}</span>`).join('')}</div>
    </div>
  </div>`;
}
function journeyDonutView(){
  const bookP=goalBookProgress(),pageP=goalPageProgress(),done=getCompleted().length,pages=journeyTotalPages(),overall=Math.round((bookP+pageP)/2);
  const card=(label,value,total,p,featured=false)=>`<div class="journey-donut-card v10-donut-card ${featured?'featured':''}">
    <div class="journey-donut" style="--p:${p}"><div><strong>%${p}</strong><small>${label}</small></div></div>
    <div class="journey-donut-copy"><strong>${value} / ${total}</strong><small>${label==='Sayfa'?'sayfa':'kitap'}</small></div>
  </div>`;
  return `<div class="journey-donut-layout v10-donut-layout">
    ${card('Genel',overall,100,overall,true)}
    ${card('Kitap',done,state.goals.books,bookP)}
    ${card('Sayfa',pages.toLocaleString('tr-TR'),state.goals.pages.toLocaleString('tr-TR'),pageP)}
  </div>`;
}
function journeyPathView(){
  const items=roadmapMilestones().slice(0,6);
  const milestoneItems=items.filter(x=>x.kind==='milestone');
  let current=items.findIndex(x=>x.kind==='milestone'&&!x.ok);
  if(current<0) current=Math.max(1,items.length-1);
  const positions=[{x:10,y:74},{x:25,y:48},{x:42,y:70},{x:59,y:42},{x:76,y:68},{x:90,y:34}];
  const doneCount=milestoneItems.filter(x=>x.ok).length;
  const next=milestoneItems.find(x=>!x.ok) || milestoneItems[milestoneItems.length-1];
  return `<div class="journey-path-pro v10-path-pro">
    <div class="journey-path-topline">
      <div class="journey-path-label"><strong>Okuma Patikan</strong><small>Hedefler arasında gerçek bir rota oluştur.</small></div>
      <div class="journey-path-badges">
        <span class="journey-path-badge">${doneCount} / ${milestoneItems.length} hedef tamamlandı</span>
        ${next ? `<span class="journey-path-badge soft">Sıradaki: ${escapeHtml(next.title)}</span>` : ''}
      </div>
    </div>
    <div class="journey-path-stage">
      ${items.map((m,i)=>`<article class="path-step ${m.ok?'done':''} ${i===current?'current':''} ${i%2===0?'below':'above'}" style="--x:${positions[i].x}%;--y:${positions[i].y}%">
        <div class="path-step-marker"><span>${m.icon}</span></div>
        <div class="path-step-card">
          <strong>${escapeHtml(m.title)}</strong>
          <small>${escapeHtml(m.hint||m.sub||'')}</small>
        </div>
      </article>`).join('')}
    </div>
  </div>`;
}
function renderGoalVisualization(){
  const el=$('#goalVisualization');
  if(!el)return;
  el.dataset.style=state.appearance.visualStyle;
  if(state.appearance.visualStyle==='donut')el.innerHTML=journeyDonutView();
  else if(state.appearance.visualStyle==='path')el.innerHTML=journeyPathView();
  else el.innerHTML=journeyBarView();
}
function renderOverview(){
  const gb=goalBookProgress(),gp=goalPageProgress(),avg=Math.round((gb+gp)/2),weekly=getWeekData(),streak=calcStreak();
  $('#yearGoalPercent').textContent='%'+avg;document.querySelector('.hero-ring').style.setProperty('--ring',avg+'%');$('#heroMessage').textContent=state.profile.quote||seed.profile.quote;
  renderGoalVisualization();
  const active=getActive()[0];
  $('#overviewActiveBook').innerHTML=active?bookCard(active):`<div class="empty-reading-card"><div><strong>Şu anda aktif kitabın yok.</strong><small>Yeni kitabını Okuyorum sekmesinden başlatabilirsin.</small></div><span class="category-badge">Okuyorum →</span></div>`;
  $('#weekTotal').textContent=weekly.reduce((a,b)=>a+b.pages,0)+' sayfa';renderChart('#miniChart',weekly,125);$('#summaryActive').textContent=getActive().length;$('#summaryDone').textContent=getCompleted().length;$('#summaryStreak').textContent=streak+' gün';
}
function renderReading(){$('#readingList').innerHTML=getActive().map(bookCard).join('');}
function plannedBookCard(book){
  return `<button class="shelf-book-v5 planned-book-card" type="button" onclick="openBookDetail('${book.id}')" aria-label="${escapeHtml(book.title)} detaylarını aç">
    ${bookCover(book,'shelf-cover')}
    <div class="shelf-book-info">
      <strong>${escapeHtml(book.title)}</strong>
      <small>${escapeHtml(book.author||'Yazar belirtilmedi')}</small>
      <div class="shelf-rating-mini">${Number(book.totalPages||0)} sayfa · ${escapeHtml(categoryName(book.categoryId))}</div>
    </div>
  </button>`;
}
function renderPlanned(){
  const planned=getPlanned().sort((a,b)=>new Date(b.plannedAt||0)-new Date(a.plannedAt||0));
  $('#plannedCount').textContent=planned.length+' kitap';
  $('#plannedShelves').innerHTML=state.categories.map(c=>{
    const books=planned.filter(b=>b.categoryId===c.id);
    if(!books.length)return '';
    return `<section class="category-shelf">
      <div class="shelf-row-head"><div class="shelf-cat-icon">${escapeHtml(c.icon||'◫')}</div><div><h2>${escapeHtml(c.name)}</h2><small>${books.length} okunacak</small></div></div>
      <div class="horizontal-shelf">${books.map(plannedBookCard).join('')}</div>
    </section>`;
  }).join('') || `<div class="empty-shelf"><span>Okuma listen henüz boş.</span><small>“Okunacak Kitap Ekle” ile ilk kitabını kaydedebilirsin.</small></div>`;
}
function shelfBookCard(book){
  const rating=Number(book.rating||0);
  return `<button class="shelf-book-v5" type="button" onclick="openBookDetail('${book.id}')" aria-label="${escapeHtml(book.title)} detaylarını aç">
    ${bookCover(book,'shelf-cover')}
    <div class="shelf-book-info">
      <strong>${escapeHtml(book.title)}</strong>
      <small>${escapeHtml(book.author||'')}</small>
      <div class="shelf-rating-mini">${rating?'★'.repeat(rating)+'☆'.repeat(5-rating):'Detayları gör'}</div>
    </div>
  </button>`;
}
function renderLibrary(){
  const completed=getCompleted().sort((a,b)=>new Date(b.completedAt)-new Date(a.completedAt));
  $('#libraryCount').textContent=completed.length+' kitap';
  $('#categoryShelves').innerHTML=state.categories.map(c=>{
    const books=completed.filter(b=>b.categoryId===c.id);
    return `<section class="category-shelf">
      <div class="shelf-row-head">
        <div class="shelf-cat-icon">${escapeHtml(c.icon||'◫')}</div>
        <div><h2>${escapeHtml(c.name)}</h2><small>${books.length} kitap</small></div>
      </div>
      <div class="horizontal-shelf">
        ${books.length?books.map(shelfBookCard).join(''):`<div class="empty-shelf"><span>Bu rafta henüz kitap yok.</span><small>Bitirdiğin kitapları bu rafa taşıyabilirsin.</small></div>`}
      </div>
    </section>`;
  }).join('');
}

function renderBookDetail(book){
  const logs=logsForBook(book.id),noteCount=logs.filter(l=>(l.note||'').trim()&&l.note!=='Kitap tamamlandı').length;
  $('#detailTitle').textContent=book.title;
  $('#detailAuthor').textContent=book.author||'Yazar belirtilmedi';
  $('#detailCover').innerHTML=bookCover(book,'book-cover');
  $('#detailStarted').textContent=book.status==='planned'?'Henüz başlamadı':formatDate(book.startedAt);
  $('#detailCompleted').textContent=book.status==='completed'?formatDate(book.completedAt):'—';
  $('#detailPages').textContent=(book.totalPages||0)+' sayfa';
  $('#detailDays').textContent=book.status==='completed'?daysBetween(book.startedAt,book.completedAt):book.status==='reading'?'Devam ediyor':'—';
  const rating=Number(book.rating||0);
  $('#detailRating').textContent=rating?'★'.repeat(rating)+'☆'.repeat(Math.max(0,5-rating)):'☆☆☆☆☆';
  $('#detailPublisher').textContent=book.publisher||'—';
  $('#detailIsbn').textContent=book.isbn||'—';
  $('#detailPlannedAt').textContent=formatDate(book.plannedAt);
  $('#detailCategoryName').textContent=categoryName(book.categoryId);
  $('#detailStatus').textContent=book.status==='planned'?'Okunacak':book.status==='reading'?'Okunuyor':'Tamamlandı';

  const select=$('#detailCategorySelect');
  select.innerHTML=state.categories.map(c=>`<option value="${c.id}" ${c.id===book.categoryId?'selected':''}>${escapeHtml(c.name)}</option>`).join('');
  select.dataset.bookId=book.id;

  const action=$('#detailPrimaryAction');
  if(book.status==='planned'){
    action.innerHTML=`<button class="primary" type="button" onclick="startReading('${book.id}')">▶ Okumaya Başla</button>`;
  }else if(book.status==='reading'){
    action.innerHTML=`<button class="primary" type="button" onclick="openProgressFromDetail('${book.id}')">＋ İlerleme Ekle</button>`;
  }else action.innerHTML='';

  const plannedNote=(book.plannedNote||'').trim();
  $('#detailPlannedNote').textContent=plannedNote;
  $('#detailPlannedNote').classList.toggle('show',!!plannedNote);

  const completed=book.status==='completed';
  $('#detailReflectionSection').classList.toggle('is-hidden',!completed);
  $('#detailJournalSection').classList.toggle('is-hidden',book.status==='planned');
  $('#detailReflection').textContent=(book.reflection||'').trim()||'Bu kitap için henüz nihai bir izlenim yazılmadı.';
  $('#detailJournalCount').textContent=noteCount+' not';

  $('#bookJournalList').innerHTML=logs.length?logs.map(l=>{
    const hasNote=(l.note||'').trim(),pageText=(Number.isFinite(Number(l.fromPage))&&Number.isFinite(Number(l.toPage)))?`${Number(l.fromPage)} → ${Number(l.toPage)}. sayfa`:`+${Number(l.pages)||0} sayfa`;
    const systemNote=hasNote==='Kitap tamamlandı';
    const noteText=systemNote?'Kitap tamamlandı ve kitaplığa kaldırıldı.':(hasNote||'Bu ilerleme için not eklenmedi.');
    return `<article class="journal-entry ${hasNote?'':'no-note'}"><div class="journal-entry-meta"><strong>${formatDate(l.date)}</strong><small>${Number(l.pages)||0} sayfa okundu</small></div><div class="journal-entry-body"><div class="journal-pages"><span>${pageText}</span>${systemNote?'<span>✦ Tamamlama</span>':''}</div><p>${escapeHtml(noteText)}</p></div></article>`;
  }).join(''):`<div class="journal-empty">Bu kitap için henüz okuma günlüğü kaydı yok.</div>`;
}
function openBookDetail(id){
  const book=state.books.find(b=>b.id===id);
  if(!book)return;
  renderBookDetail(book);
  openDialog('bookDetailDialog');
}
window.openBookDetail=openBookDetail;
function startReading(id){
  const book=state.books.find(b=>b.id===id);if(!book)return;
  book.status='reading';book.startedAt=new Date().toISOString();book.currentPage=Number(book.currentPage||0);book.completedAt=null;
  closeDialog('bookDetailDialog');saveState();navigate('reading');toast(`${book.title} Okuyorum bölümüne taşındı.`);
}
window.startReading=startReading;
function openProgressFromDetail(id){closeDialog('bookDetailDialog');openProgress(id);}
window.openProgressFromDetail=openProgressFromDetail;


function renderStats(){
  $('#totalPagesRead').textContent=Math.max(totalPagesRead(),completedPages()).toLocaleString('tr-TR');$('#totalBooksRead').textContent=getCompleted().length;$('#activeBooksCount').textContent=getActive().length;$('#streakPill').textContent=calcStreak()+' gün seri';const wk=getWeekData(),total=wk.reduce((a,b)=>a+b.pages,0);$('#weekTotalStats').textContent=total+' sayfa';renderChart('#statsChart',wk,205);const cells=[];for(let i=27;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const pages=state.logs.filter(l=>l.date===todayKey(d)).reduce((s,l)=>s+l.pages,0);const level=pages===0?'':pages<15?'l1':pages<40?'l2':'l3';cells.push(`<div class="heat-cell ${level}" title="${todayKey(d)} · ${pages} sayfa"></div>`);}$('#heatmap').innerHTML=cells.join('');
}
function roadmapMilestones(){
  const defs=state.goals.milestones||DEFAULT_MILESTONES;
  const order=['firstBook','page500','page1000','streak7','streak30','categories3','reflections1'];
  const items=[{kind:'start',icon:'✦',title:'Başlangıç',sub:'Yola çıktın.',hint:'Okuma düzenini kur.',ok:true}];
  for(const key of order){
    const def=defs[key];
    if(!def||!def.enabled)continue;
    const current=milestoneCurrentValue(def.metric);
    const ok=current>=Number(def.target||1);
    const suffix=def.suffix||'';
    items.push({
      kind:'milestone',key,
      icon:def.icon||'◉',
      title:def.title,
      sub:`Hedef: ${formatMilestoneValue(def.target,suffix)}`,
      hint:`${formatMilestoneValue(current,suffix)} / ${formatMilestoneValue(def.target,suffix)}`,
      ok
    });
  }
  if(items.length<2){
    items.push({kind:'milestone',icon:'◎',title:'İlk Kitap',sub:'Hedef: 1 kitap',hint:`${getCompleted().length} / 1 kitap`,ok:getCompleted().length>=1});
  }
  return items;
}
function renderProfile(){
  const done=getCompleted().length,pages=Math.max(totalPagesRead(),completedPages()),streak=calcStreak(),avg=Math.round((goalBookProgress()+goalPageProgress())/2);
  $('#profileName').textContent=fullName();$('#profileBio').textContent=state.profile.bio;$('#profileQuote').textContent=`“${state.profile.quote||seed.profile.quote}”`;$('#miniName').textContent=fullName();$('#miniGoalInfo').textContent=`${state.goals.books} kitap hedefi`;$('#profileBooksStat').textContent=done;$('#profilePagesStat').textContent=pages.toLocaleString('tr-TR');$('#profileStreakStat').textContent=streak;$('#profileGoalStat').textContent=avg+'%';$('#previewFontName').textContent=state.appearance.font;$('#previewBackgroundLabel').textContent=`Arkaplan · ${state.appearance.bgType==='image'?'Görsel':state.theme==='dark'?'Koyu Renk':'Açık Renk'}`;renderAvatar('#profileAvatar');renderAvatar('#miniAvatar');
}
function populateCategorySelect(){const s=$('#bookCategory');if(s)s.innerHTML=state.categories.map(c=>`<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');}
function renderAll(){applyAppearance();populateCategorySelect();renderOverview();renderReading();renderPlanned();renderLibrary();renderStats();renderProfile();}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2000);}
function fileToDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});}
async function imageFileToDataUrl(file,maxSide=1600,quality=.82){
  if(!file?.type?.startsWith('image/'))return fileToDataUrl(file);
  try{
    const bitmap=await createImageBitmap(file);
    const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
    const width=Math.max(1,Math.round(bitmap.width*scale)),height=Math.max(1,Math.round(bitmap.height*scale));
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d',{alpha:false});ctx.drawImage(bitmap,0,0,width,height);bitmap.close?.();
    return canvas.toDataURL('image/jpeg',quality);
  }catch(_){return fileToDataUrl(file);}
}

function openProgress(id){const b=state.books.find(x=>x.id===id);if(!b)return;$('#progressBookId').value=id;$('#progressBookName').textContent=b.title;$('#currentPageInput').max=b.totalPages;$('#currentPageInput').value=b.currentPage;$('#progressNote').value='';openDialog('progressDialog');} window.openProgress=openProgress;
function finishNow(id){const b=state.books.find(x=>x.id===id);if(!b)return;const fromPage=Number(b.currentPage||0),delta=Math.max(0,b.totalPages-fromPage);if(delta>0)state.logs.push({id:crypto.randomUUID(),bookId:id,date:todayKey(),pages:delta,fromPage,toPage:b.totalPages,note:'Kitap tamamlandı',type:'finish'});b.currentPage=b.totalPages;$('#finishBookId').value=id;$('#finishReflection').value=b.reflection||'';$('#finishRating').value=String(b.rating||5);openDialog('finishDialog');} window.finishNow=finishNow;
function moveBookCategory(id,categoryId){const b=state.books.find(x=>x.id===id);if(!b)return;b.categoryId=categoryId;saveState();toast(`Kitap ${categoryName(categoryId)} rafına taşındı.`);} window.moveBookCategory=moveBookCategory;

$('#bookForm').addEventListener('submit',e=>{
  e.preventDefault();
  const title=$('#bookTitle').value.trim(),pages=Number($('#bookPages').value),mode=$('#bookEntryMode').value==='planned'?'planned':'reading';
  if(!title||!pages){toast('Kitap adı ve toplam sayfa gerekli.');return;}
  const now=new Date().toISOString();
  state.books.push({
    id:crypto.randomUUID(),
    title,
    author:$('#bookAuthor').value.trim(),
    publisher:$('#bookPublisher').value.trim(),
    isbn:$('#bookIsbn').value.trim(),
    totalPages:pages,
    currentPage:0,
    cover:$('#bookCover').value.trim(),
    categoryId:$('#bookCategory').value||'cat-general',
    plannedNote:$('#bookPlannedNote').value.trim(),
    plannedAt:mode==='planned'?now:null,
    status:mode,
    startedAt:mode==='reading'?now:null,
    completedAt:null,rating:0,reflection:''
  });
  e.target.reset();$('#bookEntryMode').value='reading';closeDialog('bookDialog');saveState();
  navigate(mode==='planned'?'planned':'reading');
  toast(mode==='planned'?'Kitap Okunacaklar listene eklendi.':'Kitap Okuyorum bölümüne eklendi.');
});
$('#progressForm').addEventListener('submit',e=>{e.preventDefault();const id=$('#progressBookId').value,b=state.books.find(x=>x.id===id);if(!b)return;const fromPage=Number(b.currentPage||0),newPage=Math.min(b.totalPages,Math.max(0,Number($('#currentPageInput').value))),delta=Math.max(0,newPage-fromPage);if(delta>0)state.logs.push({id:crypto.randomUUID(),bookId:id,date:todayKey(),pages:delta,fromPage,toPage:newPage,note:$('#progressNote').value.trim(),type:'progress'});b.currentPage=newPage;closeDialog('progressDialog');saveState();if(newPage>=b.totalPages){$('#finishBookId').value=id;$('#finishReflection').value=b.reflection||'';$('#finishRating').value=String(b.rating||5);openDialog('finishDialog');}else toast(delta?`${delta} sayfa kaydedildi.`:'İlerleme güncellendi.');});
$('#finishForm').addEventListener('submit',e=>{e.preventDefault();const b=state.books.find(x=>x.id===$('#finishBookId').value);if(!b)return;b.status='completed';b.completedAt=new Date().toISOString();b.currentPage=b.totalPages;b.rating=Number($('#finishRating').value);b.reflection=$('#finishReflection').value.trim();closeDialog('finishDialog');saveState();navigate('library');toast('Kitap rafına yerleşti ✦');});
function openGoals(){
  $('#goalBooksInput').value=state.goals.books;$('#goalPagesInput').value=state.goals.pages;
  const m=state.goals.milestones||DEFAULT_MILESTONES;
  $('#goalFirstBookEnabled').checked=!!m.firstBook?.enabled; $('#goalFirstBookInput').value=m.firstBook?.target||1;
  $('#goalPage500Enabled').checked=!!m.page500?.enabled; $('#goalPage500Input').value=m.page500?.target||500;
  $('#goalPage1000Enabled').checked=!!m.page1000?.enabled; $('#goalPage1000Input').value=m.page1000?.target||1000;
  $('#goalStreak7Enabled').checked=!!m.streak7?.enabled; $('#goalStreak7Input').value=m.streak7?.target||7;
  $('#goalStreak30Enabled').checked=!!m.streak30?.enabled; $('#goalStreak30Input').value=m.streak30?.target||30;
  $('#goalCategoriesEnabled').checked=!!m.categories3?.enabled; $('#goalCategoriesInput').value=m.categories3?.target||3;
  $('#goalReflectionsEnabled').checked=!!m.reflections1?.enabled; $('#goalReflectionsInput').value=m.reflections1?.target||1;
  openDialog('goalsDialog');
}
$('#goalsForm').addEventListener('submit',e=>{
  e.preventDefault();
  state.goals.books=Number($('#goalBooksInput').value)||state.goals.books;
  state.goals.pages=Number($('#goalPagesInput').value)||state.goals.pages;
  const milestones=state.goals.milestones||structuredClone(DEFAULT_MILESTONES);
  milestones.firstBook={...milestones.firstBook,enabled:$('#goalFirstBookEnabled').checked,target:Number($('#goalFirstBookInput').value)||1};
  milestones.page500={...milestones.page500,enabled:$('#goalPage500Enabled').checked,target:Number($('#goalPage500Input').value)||500};
  milestones.page1000={...milestones.page1000,enabled:$('#goalPage1000Enabled').checked,target:Number($('#goalPage1000Input').value)||1000};
  milestones.streak7={...milestones.streak7,enabled:$('#goalStreak7Enabled').checked,target:Number($('#goalStreak7Input').value)||7};
  milestones.streak30={...milestones.streak30,enabled:$('#goalStreak30Enabled').checked,target:Number($('#goalStreak30Input').value)||30};
  milestones.categories3={...milestones.categories3,enabled:$('#goalCategoriesEnabled').checked,target:Number($('#goalCategoriesInput').value)||3};
  milestones.reflections1={...milestones.reflections1,enabled:$('#goalReflectionsEnabled').checked,target:Number($('#goalReflectionsInput').value)||1};
  state.goals.milestones=milestones;
  closeDialog('goalsDialog');saveState();toast('Hedefler güncellendi.');
});
function openProfileEditor(){pendingAvatarData='';$('#profileFirstNameInput').value=state.profile.firstName||'';$('#profileLastNameInput').value=state.profile.lastName||'';$('#profileAvatarInput').value=state.profile.avatar?.startsWith('data:')?'':(state.profile.avatar||'');$('#profileAvatarFile').value='';$('#profileBioInput').value=state.profile.bio||'';$('#profileQuoteInput').value=state.profile.quote||'';openDialog('profileDialog');}
$('#profileAvatarFile').addEventListener('change',async e=>{const f=e.target.files?.[0];if(f)pendingAvatarData=await imageFileToDataUrl(f,640,.84);});
$('#profileForm').addEventListener('submit',e=>{e.preventDefault();state.profile.firstName=$('#profileFirstNameInput').value.trim()||'OkuYol';state.profile.lastName=$('#profileLastNameInput').value.trim()||'Okuru';const url=$('#profileAvatarInput').value.trim();if(pendingAvatarData)state.profile.avatar=pendingAvatarData;else if(url)state.profile.avatar=url;state.profile.bio=$('#profileBioInput').value.trim()||seed.profile.bio;state.profile.quote=$('#profileQuoteInput').value.trim()||seed.profile.quote;closeDialog('profileDialog');saveState();toast('Profil güncellendi.');});
function openAppearanceEditor(){pendingBackgroundData='';const prefs=state.themePrefs[state.theme];$('#bgTypeInput').value=state.appearance.bgType;$('#bgColorInput').value=prefs.background;$('#bgImageInput').value=state.appearance.bgImage?.startsWith('data:')?'':(state.appearance.bgImage||'');$('#bgImageFile').value='';$('#bgOverlayInput').value=state.appearance.bgOverlay??0;$('#surfaceOpacityInput').value=state.appearance.surfaceOpacity??55;$('#bgOverlayValue').textContent=`${state.appearance.bgOverlay??0}%`;$('#surfaceOpacityValue').textContent=`${state.appearance.surfaceOpacity??55}%`;openDialog('appearanceDialog');}
$('#bgImageFile').addEventListener('change',async e=>{const f=e.target.files?.[0];if(f)pendingBackgroundData=await imageFileToDataUrl(f,1600,.80);});
$('#bgOverlayInput').addEventListener('input',e=>$('#bgOverlayValue').textContent=e.target.value+'%');$('#surfaceOpacityInput').addEventListener('input',e=>$('#surfaceOpacityValue').textContent=e.target.value+'%');
$('#appearanceForm').addEventListener('submit',e=>{e.preventDefault();state.appearance.bgType=$('#bgTypeInput').value;state.themePrefs[state.theme].background=$('#bgColorInput').value;const url=$('#bgImageInput').value.trim();if(pendingBackgroundData)state.appearance.bgImage=pendingBackgroundData;else if(url)state.appearance.bgImage=url;state.appearance.bgOverlay=Number($('#bgOverlayInput').value);state.appearance.surfaceOpacity=Number($('#surfaceOpacityInput').value);closeDialog('appearanceDialog');persistState();applyAppearance();renderProfile();toast('Uygulama görünümü güncellendi.');});
function openVisualStyleSettings(){openDialog('visualStyleDialog');}
function openThemeSettings(){const l=state.themePrefs.light,d=state.themePrefs.dark;$('#lightBgInput').value=l.background;$('#lightAccentInput').value=l.accent;$('#darkBgInput').value=d.background;$('#darkAccentInput').value=d.accent;openDialog('themeDialog');}
$('#themeForm').addEventListener('submit',e=>{e.preventDefault();state.themePrefs.light.background=$('#lightBgInput').value;state.themePrefs.light.accent=$('#lightAccentInput').value;state.themePrefs.dark.background=$('#darkBgInput').value;state.themePrefs.dark.accent=$('#darkAccentInput').value;closeDialog('themeDialog');persistState();applyAppearance();renderProfile();toast('İki tema da kaydedildi; geçişte sıfırlanmayacak.');});
$('#categoryForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#categoryNameInput').value.trim();if(!name)return;state.categories.push({id:'cat-'+Date.now(),name,icon:$('#categoryIconInput').value||'◫'});e.target.reset();$('#categoryIconInput').value='◫';closeDialog('categoryDialog');saveState();toast(`${name} rafı oluşturuldu.`);});

$$('.js-close').forEach(btn=>btn.addEventListener('click',()=>closeDialog(btn.dataset.close)));
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$$('[data-nav]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.nav)));
$$('[data-open="addBook"]').forEach(b=>b.addEventListener('click',()=>{
  const mode=b.dataset.addMode==='planned'?'planned':'reading';
  $('#bookEntryMode').value=mode;
  $('#bookDialogEyebrow').textContent=mode==='planned'?'OKUNACAK KİTAP':'YENİ KİTAP';
  $('#bookDialogTitle').textContent=mode==='planned'?'Okuma listene kaydet':'Okumaya başla';
  $('#bookSubmitLabel').textContent=mode==='planned'?'Okunacaklara Ekle':'Kitabı Ekle';
  $('#plannedNoteLabel').style.display='block';
  openDialog('bookDialog');
}));
$$('[data-visual-style]').forEach(b=>b.addEventListener('click',()=>{state.appearance.visualStyle=b.dataset.visualStyle;persistState();applyAppearance();renderGoalVisualization();if($('#visualStyleDialog')?.open)closeDialog('visualStyleDialog');toast(`İlerleme görünümü: ${b.textContent.trim()}`);}));
$$('[data-cat-icon]').forEach(b=>b.addEventListener('click',()=>{$$('[data-cat-icon]').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#categoryIconInput').value=b.dataset.catIcon;}));
$('#detailCategorySelect').addEventListener('change',e=>{const id=e.target.dataset.bookId,b=state.books.find(x=>x.id===id);if(!b)return;b.categoryId=e.target.value;saveState();renderBookDetail(b);toast(`Kitap ${categoryName(b.categoryId)} rafına taşındı.`);});
$('#sidebarToggle').addEventListener('click',()=>{state.sidebarCollapsed=!state.sidebarCollapsed;persistState();$('#appLayout').classList.toggle('sidebar-collapsed',state.sidebarCollapsed);});
$('#themeToggle').addEventListener('click',()=>setTheme(state.theme==='dark'?'light':'dark'));
$('#editGoalsBtn').addEventListener('click',openGoals);$('#profileGoalsBtn').addEventListener('click',openGoals);$('#editProfileBtn').addEventListener('click',openProfileEditor);$('#quickQuoteEdit').addEventListener('click',openProfileEditor);$('#editAppearanceBtn').addEventListener('click',openAppearanceEditor);$('#themeSettingsBtn').addEventListener('click',openThemeSettings);$('#visualStyleBtn').addEventListener('click',openVisualStyleSettings);$('#addCategoryBtn').addEventListener('click',()=>openDialog('categoryDialog'));
$('#fontSelect').addEventListener('change',e=>{state.appearance.font=e.target.value;persistState();applyAppearance();renderProfile();toast(`${e.target.value} tüm uygulamaya uygulandı.`);});
$('#exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='okuyol-verilerim-v11.json';a.click();URL.revokeObjectURL(url);});
function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;}
function isIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent);}
function isSafari(){return /safari/i.test(navigator.userAgent)&&!/chrome|crios|android/i.test(navigator.userAgent);}
function showInstallHelp(){
  const box=$('#installHelpContent');
  if(!box)return;
  if(isStandalone()){
    box.innerHTML='<div class="install-status ok"><strong>OkuYol zaten uygulama modunda açık.</strong><small>Ana ekranından normal bir uygulama gibi kullanabilirsin.</small></div>';
  }else if(location.protocol==='file:'){
    box.innerHTML='<div class="install-status"><strong>Kurulum için yayınlanan siteyi aç.</strong><small>ZIP içindeki index.html dosyasını doğrudan açmak yerine GitHub Pages adresini Safari veya Chrome ile aç; ardından bu düğmeye tekrar dokun.</small></div>';
  }else if(isIOS()&&isSafari()){
    box.innerHTML='<div class="install-steps"><strong>iPhone / iPad</strong><span>1. Safari alt menüsündeki <b>Paylaş</b> düğmesine dokun.</span><span>2. <b>Ana Ekrana Ekle</b> seçeneğini seç.</span><span>3. Sağ üstten <b>Ekle</b> de.</span></div>';
  }else{
    box.innerHTML='<div class="install-steps"><strong>Uygulama kurulumu</strong><span>Tarayıcı menüsünden <b>Uygulamayı yükle</b> veya <b>Ana ekrana ekle</b> seçeneğini kullan.</span><span>GitHub Pages üzerinden açıldığında OkuYol güvenli bağlantıda PWA olarak çalışır.</span></div>';
  }
  openDialog('installHelpDialog');
}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;toast('OkuYol uygulama olarak yüklendi.');});
$('#installBtn').addEventListener('click',async()=>{
  if(isStandalone()){showInstallHelp();return;}
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt=null;
    return;
  }
  showInstallHelp();
});
if('serviceWorker' in navigator){
  window.addEventListener('load',async()=>{
    try{
      const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
      registration.update().catch(()=>{});
    }catch(e){console.warn('Service worker kaydı başarısız:',e);}
  });
}
renderAll();
