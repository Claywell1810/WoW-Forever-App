/* WoW Forever PWA usability upgrade. Uses existing app data, no network requests. */
'use strict';
(function(){
  const HOME_TABS=[
    {view:"home",title:"Heute",icon:"⌂"},
    {view:"leveling",title:"Leveln",icon:"↗"},
    {view:"tasks",title:"Quests",icon:"◇"},
    {view:"dungeons",title:"Dungeons",icon:"⚔"},
    {view:"more",title:"Mehr",icon:"☰"}
  ];
  const MORE_TABS=[
    {view:"professions",title:"Berufe leveln",icon:"▥",sub:"Materialien und Rezepte bis Stufe 35"},
    {view:"gear",title:"Gear craften",icon:"♜",sub:"Upgrades für Wrathcat und Heiler"},
    {view:"talents",title:"Talentpunkte",icon:"✧",sub:"Wrathcat-Punkte einzeln abhaken"},
    {view:"spells",title:"Zauberbuch",icon:"✺",sub:"Zauber und Ränge nach Stufe filtern"},
    {view:"tools",title:"Makros & Controller",icon:"⌘",sub:"Fertige Makros und Einstellungen"},
    {view:"books",title:"Büchersammlung",icon:"▤",sub:"Gesammelte Bibliotheksbücher"}
  ];
  const CONFIRMED_LEVEL=27; // Last confirmed in private character_tracker.md (14.11.2026), never overwrite from app.
  const UX_BACKUP_KIND="wow-forever-progress-backup";
  const main=document.querySelector(".main");
  const more=document.createElement("div");
  more.id="more";
  more.className="section";
  main.insertBefore(more,main.querySelector(".footer"));
  viewTitle.more="Mehr";

  function uxLevel(){
    const n=Number(LOCAL_PROGRESS.settings.planLevel);
    return Number.isInteger(n)&&n>=1&&n<=60?n:CONFIRMED_LEVEL;
  }
  function uxSaveLabel(){
    const n=document.getElementById("ux-save-indicator");
    if(!n)return;
    n.textContent=progressSaveAvailable?"✓ Lokal gespeichert":"Speichern fehlgeschlagen";
  }
  const oldSave=saveProgress;
  saveProgress=function(){
    LOCAL_PROGRESS.settings.lastLocalSave=new Date().toISOString();
    oldSave();
    uxSaveLabel();
  };
  const originalNavigate=navigate;
  navigate=function(view){
    originalNavigate(view);
    document.body.classList.toggle("ux-subview",view!=="home");
    if(view==="home")uxRenderHome();
    if(view==="more")uxRenderMore();
    const hiddenTab=!HOME_TABS.some(x=>x.view===view);
    const mobile=document.querySelector(".mobile-nav");
    if(mobile){
      mobile.querySelectorAll("button").forEach(b=>{
        const yes=b.dataset.view===view || (hiddenTab&&b.dataset.view==="more");
        if(yes)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");
      });
    }
    uxNetworkStatus();
  };
  function uxSetupNavigation(){
    const html=HOME_TABS.map(t=>'<button data-view="'+t.view+'" aria-label="'+esc(t.title)+'" type="button"><span aria-hidden="true">'+t.icon+'</span>'+t.title+'</button>').join("");
    const mobile=document.querySelector(".mobile-nav");
    if(mobile){mobile.innerHTML=html;mobile.setAttribute("aria-label","Hauptnavigation");}
    const sidebar=document.querySelector(".sidebar .nav");
    if(sidebar){
      sidebar.classList.add("ux-main-nav");
      sidebar.innerHTML='<div class="ux-nav-heading">SPIELBEGLEITER</div>'+
      HOME_TABS.map(t=>'<button type="button" data-view="'+t.view+'"><span class="ux-icon" aria-hidden="true">'+t.icon+'</span>'+t.title+'</button>').join("");
    }
    // The former horizontal category strip duplicates the bottom navigation.
    const duplicate=document.querySelector(".guide-nav");
    if(duplicate)duplicate.hidden=true;
  }
  function uxNetworkStatus(){
    const n=document.getElementById("ux-online");
    if(n)n.textContent=navigator.onLine===false?"Offline – letzter gespeicherter Stand":"Online";
  }
  function uxTodayTalent(){
    const plan=uxLevel();
    const p=TALENT_POINTS.find(t=>t.level+talentOffset()===plan);
    const waiting=TALENT_POINTS.filter(t=>t.level+talentOffset()<=plan&&!LOCAL_PROGRESS.talents[t.id]);
    if(!p&&!waiting.length)return '<strong>Keine offenen Punkte laut Plan</strong><small>Bitte tatsächliche Skillung prüfen</small>';
    if(p)return '<strong>'+esc(p.name)+' '+p.rank+'/'+p.max+'</strong><small>Für Stufe '+plan+' vorgesehen · '+waiting.length+' bis hier nicht abgehakt</small>';
    const next=waiting[waiting.length-1];
    return '<strong>'+esc(next.name)+' '+next.rank+'/'+next.max+'</strong><small>Offener Punkt aus Stufe '+(next.level+talentOffset())+'</small>';
  }
  function uxTodaySpells(){
    const lv=uxLevel(),available=SPELLBOOK.ranks.filter(s=>s.lv<=lv&&s.flag==="trainer"&&!LOCAL_PROGRESS.spells[s.id]);
    const latestLevel=Math.max(0,...SPELLBOOK.ranks.filter(s=>s.lv<=lv&&s.flag==="trainer").map(s=>s.lv));
    const latest=SPELLBOOK.ranks.filter(s=>s.lv===latestLevel&&s.flag==="trainer"&&!LOCAL_PROGRESS.spells[s.id]);
    return {open:available.length,new:latest.length,latestLevel};
  }
  function uxFirstMilestone(group){
    const m=MILESTONES.find(g=>g.key===group);
    return m&&m.items.find(i=>LOCAL_PROGRESS.milestones[i[0]]!==true);
  }
  function uxRenderHome(){
    const el=document.getElementById("home");if(!el)return;
    const lv=uxLevel(),spell=uxTodaySpells();
    const nextGoals=[
      {group:"leveling",name:"Leveln"},
      {group:"tasks",name:"Quests"},
      {group:"dungeons",name:"Dungeon"},
      {group:"professions",name:"Beruf"},
      {group:"gear",name:"Gear"}
    ].map(g=>({...g,entry:uxFirstMilestone(g.group)})).filter(x=>x.entry);
    const doneTotal=MILESTONES.reduce((n,g)=>n+g.items.filter(x=>LOCAL_PROGRESS.milestones[x[0]]===true).length,0);
    const goalsTotal=MILESTONES.reduce((n,g)=>n+g.items.length,0);
    el.innerHTML=
    '<div class="ux-today-top"><div><span class="ux-eyebrow">Dein nächster Schritt</span><h2>Heute weiterspielen</h2><p>Für deinen Horde-Druiden · Solo Wrathcat, in Instanzen Heiler</p></div>'+
    '<label class="ux-level-input">Planungsstufe <input id="ux-plan-level" type="number" inputmode="numeric" min="1" max="60" value="'+lv+'" aria-describedby="ux-plan-note"></label></div>'+
    '<div class="ux-confirmed"><b>GitHub-Spielstand: Stufe '+CONFIRMED_LEVEL+'</b><span id="ux-plan-note">Planungsstufe '+lv+' ist nur für Empfehlungen; keine automatische Übernahme.</span></div>'+
    '<div class="ux-action-grid">'+
      '<button class="ux-action-card" data-view="talents"><span class="ux-card-top">✧ Talente</span><span>'+uxTodayTalent()+'</span><span class="ux-chip">Talentplan ansehen</span></button>'+
      '<button class="ux-action-card" data-view="spells"><span class="ux-card-top">✺ Zauber beim Lehrer</span><span><strong>'+spell.new+' letzte Ränge (Stufe '+spell.latestLevel+')</strong><small>'+spell.open+' bis zu deiner Planungsstufe noch nicht abgehakt</small></span><span class="ux-chip">Zauberbuch öffnen</span></button>'+
      '<button class="ux-action-card" data-view="professions"><span class="ux-card-top">▥ Berufe</span><span><strong>Leder 91 · Kürschnerei 141</strong><small>Erste Hilfe 81 · Kochen 225</small></span><span class="ux-chip">Skillwege ansehen</span></button>'+
    '</div>'+
    '<div class="ux-today-panel"><div class="ux-next-header"><h3>Offene Zwischenziele</h3><span class="ux-chip">'+doneTotal+'/'+goalsTotal+' erledigt</span></div>'+
    (nextGoals.length?nextGoals.map(x=>{const it=x.entry;return '<label class="ux-next-row"><input type="checkbox" data-milestone="'+esc(it[0])+'" data-category="'+esc(x.group)+'" aria-label="'+esc(it[2])+'"><span><span class="ux-milestone-level">'+esc(x.name)+' · '+esc(it[1])+'</span><b>'+esc(it[2])+'</b><span>'+esc(it[3])+'</span></span></label>'}).join(""):'<div class="ux-no-results">Alle Ziele bis Stufe 35 sind abgehakt.</div>')+
    '</div>'+
    '<div class="ux-quick-links"><button data-view="dungeons">⚔ Nächster Dungeon</button><button data-view="gear">♜ Ausrüstung</button><button data-view="spells">✺ Zauber prüfen</button><button data-view="more">☰ Alle Bereiche</button></div>'+
    '<div class="ux-today-panel"><div class="ux-next-header"><h3>Dein Fortschritt</h3><button data-ux-session="1">Feierabend →</button></div>'+
      '<p class="ux-small-label">Die Häkchen werden auf diesem iPhone gespeichert. Der bestätigte GitHub-Spielstand wird erst nach unserer gemeinsamen Sitzung aktualisiert.</p>'+
      '<div id="progress-summary">'+progressOverview()+'</div>'+
      '<div class="ux-local-status" id="ux-save-indicator" role="status">Lokal gespeichert</div>'+
    '</div>';
    uxSaveLabel();
  }
  function uxMilestoneHTML(key){
    const g=MILESTONES.find(x=>x.key===key);if(!g)return "";
    const completed=g.items.filter(x=>LOCAL_PROGRESS.milestones[x[0]]===true);
    const open=g.items.filter(x=>LOCAL_PROGRESS.milestones[x[0]]!==true);
    const row=(it,checked)=>'<label class="ux-milestone-row'+(checked?' done':'')+'">'+
      '<input type="checkbox" data-milestone="'+esc(it[0])+'" data-category="'+esc(key)+'" '+(checked?'checked':'')+' aria-label="'+esc(it[2])+'">'+
      '<span><span class="ux-milestone-level">'+esc(it[1])+'</span><strong>'+esc(it[2])+'</strong><small>'+esc(it[3])+'</small></span></label>';
    return '<section class="milestone-wrap ux-milestone-group" data-milestone-panel="'+esc(key)+'" aria-label="Entwicklungsziele '+esc(g.title)+'">'+
    '<div class="milestone-head"><strong>Deine Etappen bis Stufe 35</strong><span class="milestone-count">'+completed.length+'/'+g.items.length+' erreicht</span></div>'+
    '<div class="milestone-progress" role="progressbar" aria-label="Fortschritt '+esc(g.title)+'" aria-valuenow="'+completed.length+'" aria-valuemin="0" aria-valuemax="'+g.items.length+'"><span style="width:'+(100*completed.length/g.items.length)+'%"></span></div>'+
    (open.length?open.map(it=>row(it,false)).join(""):'<p class="ux-small-label">Alle Zwischenziele abgehakt.</p>')+
    (completed.length?'<details class="ux-completed"><summary>Erledigte Ziele anzeigen ('+completed.length+')</summary>'+completed.map(it=>row(it,true)).join("")+'</details>':'')+
    '<p class="ux-small-label">Lokal abgehakt – noch keine Bestätigung im privaten GitHub-Tracker.</p></section>';
  }
  milestoneHtml=uxMilestoneHTML;
  function uxRepositionPanels(){
    for(const id of ["leveling","tasks","dungeons","professions","gear"]){
      const root=document.getElementById(id),panel=root&&root.querySelector("[data-milestone-panel]"),head=root&&root.querySelector(".section-heading");
      if(panel&&head)head.after(panel);
    }
  }
  function uxSessionPrompt(){
    const summary=checkedProgressAsText();
    const copyTarget=document.getElementById("ux-session-text");
    if(copyTarget)copyTarget.value=summary;
    const count=MILESTONES.reduce((n,g)=>n+g.items.filter(x=>LOCAL_PROGRESS.milestones[x[0]]).length,0);
    const talent=TALENT_POINTS.filter(x=>LOCAL_PROGRESS.talents[x.id]).length;
    const spells=SPELLBOOK.ranks.filter(x=>LOCAL_PROGRESS.spells[x.id]).length;
    return {summary,count,talent,spells};
  }
  function uxRenderMore(){
    if(!more)return;
    more.innerHTML=heading("Mehr","Deine Werkzeuge und die lokale Spielstandsicherung")+
      '<div class="ux-more-grid">'+MORE_TABS.map(t=>
        '<button type="button" class="ux-more-link" data-view="'+t.view+'"><span class="ux-more-icon" aria-hidden="true">'+t.icon+'</span><strong>'+t.title+'</strong><small>'+t.sub+'</small></button>'
      ).join("")+'</div>'+
      heading("Sitzungsabschluss & Datensicherung","Häkchen auf diesem Gerät – nicht automatisch in GitHub")+
      '<div class="ux-today-panel"><h3>Feierabend</h3><p class="ux-small-label">Kopiert die abgehakten Ziele, Talente und Zauberränge für unseren Chat. Erst nachdem du den Text geschickt hast, kann ich den privaten Charaktertracker aktualisieren.</p>'+
      '<div class="ux-backup-actions"><button type="button" data-ux-session="1">Feierabend: Stand kopieren</button></div></div>'+
      '<div class="ux-today-panel"><h3>Backup deiner Häkchen</h3>'+
      '<p class="ux-backup-help">Hier kannst du deine Häkchen als JSON-Datei sichern oder zum Übertragen auf ein anderes Gerät kopieren. Ein Import <strong>ersetzt</strong> die vorhandenen lokalen Häkchen erst nach deiner Bestätigung.</p>'+
      '<div class="ux-backup-actions">'+
      '<button type="button" data-ux-backup-copy="1">Backup-Text kopieren</button>'+
      '<button type="button" class="secondary" data-ux-backup-download="1">JSON-Datei sichern</button></div>'+
      '<label for="ux-backup-input" class="ux-backup-help">Backup-Text zum Wiederherstellen einfügen:</label>'+
      '<textarea id="ux-backup-input" class="ux-backup-text" placeholder="Hier gesichertes JSON einfügen" spellcheck="false"></textarea>'+
      '<div class="ux-backup-actions"><button type="button" data-ux-backup-import="1">Eingefügtes Backup einlesen</button>'+
      '<label class="secondary">Backup-Datei auswählen<input type="file" id="ux-backup-file" accept=".json,application/json"></label></div>'+
      '<p class="ux-backup-help">Diese App verbindet sich nicht automatisch mit deinem privaten GitHub. Ein gelöschter iPhone-Web-App-Speicher lässt sich nur mit einem zuvor angelegten Backup wiederherstellen.</p>'+
      '</div>'+
      '<div class="ux-confirmed"><b id="ux-online">Online-Status wird geprüft</b><button type="button" class="button secondary" data-ux-reload="1">App neu laden</button></div>';
    uxNetworkStatus();
  }
  function uxBackupText(){
    return JSON.stringify({
      type:UX_BACKUP_KIND,version:1,exportedAt:new Date().toISOString(),
      data:{
        milestones:LOCAL_PROGRESS.milestones,
        talents:LOCAL_PROGRESS.talents,
        spells:LOCAL_PROGRESS.spells,
        settings:{
          talentMode:talentState.mode,
          talentPreview:talentState.level,
          planLevel:uxLevel()
        }
      }
    },null,2);
  }
  function uxCleanStatus(unknown,ids){
    if(!unknown||typeof unknown!=="object"||Array.isArray(unknown))return {};
    return Object.fromEntries(Object.entries(unknown).filter(([k,v])=>ids.has(k)&&typeof v==="boolean"));
  }
  function uxImport(json){
    if(json.length>250000)throw Error("Diese Datei ist für ein Checklisten-Backup zu groß.");
    const x=JSON.parse(json);
    if(!x||x.type!==UX_BACKUP_KIND||x.version!==1||!x.data||typeof x.data!=="object")throw Error("Das ist kein gültiges WoW-Forever-Backup.");
    const keys={
      milestones:new Set(MILESTONES.flatMap(g=>g.items.map(it=>it[0]))),
      talents:new Set(TALENT_POINTS.map(x=>x.id)),
      spells:new Set(SPELLBOOK.ranks.map(x=>x.id))
    };
    const next={
      milestones:uxCleanStatus(x.data.milestones,keys.milestones),
      talents:uxCleanStatus(x.data.talents,keys.talents),
      spells:uxCleanStatus(x.data.spells,keys.spells)
    };
    const totals=Object.fromEntries(Object.entries(next).map(([k,v])=>[k,Object.values(v).filter(Boolean).length]));
    if(!window.confirm("Lokale Häkchen ersetzen?\\n"+totals.milestones+" Etappen, "+totals.talents+" Talentpunkte und "+totals.spells+" Zauberränge im Backup.\\nDieser Vorgang ist nur mit einem eigenen Backup rückgängig zu machen."))return false;
    LOCAL_PROGRESS.milestones=next.milestones;
    LOCAL_PROGRESS.talents=next.talents;
    LOCAL_PROGRESS.spells=next.spells;
    const settings=x.data.settings||{};
    if(settings.talentMode==="normal"||settings.talentMode==="legacy")talentState.mode=settings.talentMode;
    const preview=Number(settings.talentPreview);
    if(Number.isInteger(preview)&&preview>=8&&preview<=60)talentState.level=preview;
    const level=Number(settings.planLevel);
    if(Number.isInteger(level)&&level>=1&&level<=60)LOCAL_PROGRESS.settings.planLevel=level;
    LOCAL_PROGRESS.settings.talentMode=talentState.mode;
    LOCAL_PROGRESS.settings.talentPreview=talentState.level;
    saveProgress();
    uxRedrawAll();
    showToast("Backup wiederhergestellt und lokal gespeichert.");
    return true;
  }
  function uxRedrawAll(){
    renderLeveling();renderTasks();renderDungeons();renderProfessionsV2();renderGearV2();renderTalents();renderSpells();
    for(const view of ["leveling","tasks","dungeons","professions","gear"])addMilestonesToView(view);
    uxRepositionPanels();
    uxRenderHome();
    uxRenderMore();
  }
  async function uxCopy(value,success){
    try{
      if(!navigator.clipboard||!navigator.clipboard.writeText)throw Error("No clipboard API");
      await navigator.clipboard.writeText(value);showToast(success);
    }catch(_){
      const box=document.getElementById("ux-backup-input");
      if(box){box.value=value;box.focus();box.select();showToast("Text markiert: bitte manuell kopieren.");}
      else if(window.prompt)window.prompt("Für den Chat kopieren:",value);
      else showToast("Kopieren nicht verfügbar.");
    }
  }
  function uxDownload(){
    const blob=new Blob([uxBackupText()],{type:"application/json;charset=utf-8"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="wow-forever-haken-"+new Date().toISOString().slice(0,10)+".json";
    document.body.appendChild(a);a.click();a.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  const spellOriginal=spellListFiltered;
  let uxSpellSource="all",uxOnlyOpen=true;
  spellView.range="ux-current";
  spellListFiltered=function(){
    const plan=uxLevel(),query=spellView.query.toLowerCase();
    const latestSpellLevel=Math.max(0,...SPELLBOOK.ranks.filter(s=>s.lv<=plan).map(s=>s.lv));
    return SPELLBOOK.ranks.filter(s=>{
      let range=false;
      if(spellView.range==="ux-current")range=s.lv===latestSpellLevel;
      else if(spellView.range==="ux-open")range=s.lv<=plan;
      else if(spellView.range==="next")range=s.lv>plan&&s.lv<=35;
      else if(spellView.range==="to35")range=s.lv<=35;
      else if(spellView.range==="early")range=s.lv<=22;
      else if(spellView.range==="later")range=s.lv>=36;
      else range=s.lv<=60;
      return range&&(spellView.role==="Alle"||s.category===spellView.role)&&
        (uxSpellSource==="all"||s.flag===uxSpellSource)&&
        (!uxOnlyOpen||LOCAL_PROGRESS.spells[s.id]!==true)&&
        (!query||[s.lv,s.name,SPELLBOOK.german[s.name]||"",s.rank?"Rang "+s.rank:"",s.category].join(" ").toLowerCase().includes(query));
    });
  };
  const previousRenderSpellRows=renderSpellRows;
  renderSpellRows=function(){
    previousRenderSpellRows();
    const n=document.getElementById("ux-spell-results");
    if(n)n.textContent=spellListFiltered().length+" Einträge angezeigt (noch nicht abgehakt ≠ nicht gelernt).";
  };
  const previousRenderSpells=renderSpells;
  renderSpells=function(){
    previousRenderSpells();
    const root=document.getElementById("spells");
    if(!root)return;
    const strips=root.querySelectorAll(".spell-chips");
    if(strips.length){
      const ranges=[["ux-current","Letztes Lernlevel"],["ux-open","Bis Planungsstufe"],["next","Danach bis 35"],["to35","Alle bis 35"],["all","Alle 1–60"]];
      strips[0].innerHTML=ranges.map(x=>'<button class="spell-chip'+(spellView.range===x[0]?" selected":"")+'" data-spell-range="'+x[0]+'">'+x[1]+'</button>').join("");
      const extras=document.createElement("div");
      extras.className="ux-spell-tools";
      extras.innerHTML=
        '<button type="button" data-ux-open="1" class="'+(uxOnlyOpen?"selected":"")+'">'+(uxOnlyOpen?"✓ Nur nicht abgehakte":"Alle anzeigen")+'</button>'+
        [["all","Alle Quellen"],["trainer","Beim Lehrer"],["quest","Klassenquest"],["talent","Talente"],["passive","Passiv"]].map(x=>'<button type="button" class="'+(uxSpellSource===x[0]?"selected":"")+'" data-ux-source="'+x[0]+'">'+x[1]+'</button>').join("");
      strips[strips.length-1].after(extras);
      const counter=document.createElement("p");counter.id="ux-spell-results";counter.className="ux-spell-info";
      const rows=root.querySelector("#spell-rows");
      if(rows)rows.before(counter);
    }
    renderSpellRows();
  };
  function uxSaveProgressFromEvent(target){
    if(target.matches('[data-milestone]')){
      uxRenderHome();uxSaveLabel();return;
    }
    if(target.matches('[data-spell-check]')||target.matches('[data-talent-point]')){
      uxRenderHome();uxSaveLabel();
      const n=document.getElementById("ux-spell-results");
      if(n)n.textContent=spellListFiltered().length+" Einträge angezeigt (noch nicht abgehakt ≠ nicht gelernt).";
    }
  }
  document.addEventListener("change",async e=>{
    const t=e.target;
    if(t.id==="ux-plan-level"){
      const n=Number(t.value);
      if(!Number.isInteger(n)||n<1||n>60){showToast("Bitte eine Stufe zwischen 1 und 60 eingeben.");uxRenderHome();return}
      LOCAL_PROGRESS.settings.planLevel=n;saveProgress();uxRenderHome();renderSpells();return;
    }
    if(t.id==="ux-backup-file"){
      const file=t.files&&t.files[0];if(!file)return;
      try{const content=await file.text();uxImport(content)}catch(err){showToast("Backup konnte nicht importiert werden: "+err.message)}
      return;
    }
    if(t.matches('[data-milestone],[data-talent-point],[data-spell-check]'))uxSaveProgressFromEvent(t);
  });
  document.addEventListener("click",e=>{
    const t=e.target;
    const source=t.closest("[data-ux-source]");
    if(source){
      uxSpellSource=source.dataset.uxSource;
      document.querySelectorAll("[data-ux-source]").forEach(b=>b.classList.toggle("selected",b===source));
      renderSpellRows();return;
    }
    const open=t.closest("[data-ux-open]");
    if(open){
      uxOnlyOpen=!uxOnlyOpen;
      open.classList.toggle("selected",uxOnlyOpen);
      open.textContent=uxOnlyOpen?"✓ Nur nicht abgehakte":"Alle anzeigen";
      renderSpellRows();return;
    }
    if(t.closest("[data-ux-session]")){uxCopy(uxSessionPrompt().summary,"Feierabend-Stand kopiert – bitte im Chat einfügen.");return}
    if(t.closest("[data-ux-backup-copy]")){uxCopy(uxBackupText(),"Backup als Text kopiert.");return}
    if(t.closest("[data-ux-backup-download]")){try{uxDownload();showToast("JSON-Backup erstellt.");}catch(err){showToast("Dateisicherung nicht verfügbar.")}return}
    if(t.closest("[data-ux-backup-import]")){
      const box=document.getElementById("ux-backup-input");
      try{uxImport(box&&box.value?box.value.trim():"")}catch(err){showToast("Ungültiges Backup: "+err.message)}
      return;
    }
    if(t.closest("[data-ux-reload]")){window.location.reload();return}
  });
  uxSetupNavigation();
  // Replace older long checklists with grouped, collapsed completed entries on first load.
  for(const key of ["leveling","tasks","dungeons","professions","gear"]){
    const panel=document.querySelector('[data-milestone-panel="'+key+'"]');
    if(panel)panel.outerHTML=uxMilestoneHTML(key);
  }
  uxRepositionPanels();
  renderSpells();
  uxRenderHome();
  uxRenderMore();
  navigate((location.hash||"#home").slice(1));
  window.addEventListener("online",uxNetworkStatus);
  window.addEventListener("offline",uxNetworkStatus);
  if(navigator.serviceWorker&&navigator.serviceWorker.addEventListener){
    navigator.serviceWorker.addEventListener("controllerchange",()=>{
      showToast("Eine neue App-Version ist verfügbar. Bei Bedarf neu laden.");
    });
  }
})();