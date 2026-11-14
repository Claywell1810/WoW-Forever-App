/* WoW Forever Gear-Builder: öffentliche Forever-Item-API + lokale IndexedDB.
   Fremde API-Daten sind nicht mit einem bestätigten Ingame-Fund gleichzusetzen.
   Item-Credits: https://thewowdb.com/developers/ */
(function () {
  "use strict";
  const root = document.getElementById("gear-builder");
  if (!root) return;
  const DB_NAME = "wow-forever-gear-v1";
  const API = "https://thewowdb.com/api/v1/forever/item/";
  const SLOTS = [
    ["head","Kopf"],["neck","Hals"],["shoulder","Schulter"],["back","Rücken"],
    ["chest","Brust"],["wrists","Handgelenke"],["hands","Hände"],["waist","Taille"],
    ["legs","Beine"],["feet","Füße"],["finger1","Ring 1"],["finger2","Ring 2"],
    ["trinket1","Schmuck 1"],["trinket2","Schmuck 2"],["mainhand","Waffe"],
    ["offhand","Nebenhand"],["ranged","Distanz"]
  ];
  const SLOT_LABEL = Object.fromEntries(SLOTS);
  const STAT_LABEL = {armor:"Rüstung",str:"Stärke",agi:"Beweglichkeit",sta:"Ausdauer",int:"Intelligenz",spi:"Willenskraft",ap:"Angriffskraft",heal:"Heilung",spell:"Zauberschaden",mp5:"Mana/5 s",crit:"Krit.",hit:"Treffer",dps:"Waffen-DPS"};
  const WEIGHTS = {
    solo:{armor:0.015,str:1.25,agi:1.15,sta:0.65,int:0.40,spi:0.22,ap:0.48,heal:0.10,spell:0.34,mp5:0.8,crit:1.6,hit:1.9,dps:1.4},
    heal:{armor:0.01,str:0.05,agi:0.05,sta:0.40,int:1.20,spi:0.8,ap:0,heal:1.4,spell:0.60,mp5:3.0,crit:1.1,hit:0,dps:0}
  };
  const MANUAL = [
    {key:"manual:traeumer",name:"Brustschutz des Träumers",slot:"chest",stats:{armor:106,str:10,sta:5,spi:11},note:"Zuletzt am 13.11. als angelegt gezeigt."},
    {key:"manual:weisheit",name:"Lederrüstung der Weisheit",slot:"chest",stats:{armor:85,sta:3,int:5,spi:3,heal:15,spell:5},note:"Selbst hergestellt; als Heil-Brustteil im Inventar bestätigt, nicht als getragen."},
    {key:"manual:verteidiger",name:"Lederrüstung des Verteidigers",slot:"chest",stats:{armor:85,str:7,agi:3,sta:5},note:"Selbst hergestellt und früher getragen. Zusätzlicher Rüstungseffekt +33 nicht in der Vergleichszahl enthalten."},
    {key:"manual:ersatzteil",name:"Ersatzteilbindungen",slot:"wrists",stats:{armor:37,agi:3,sta:3},note:"Zuletzt als angelegt gezeigt."},
    {key:"manual:kultisten",name:"Armschützer des Kultisten",slot:"wrists",stats:{armor:44,sta:7,ap:10},note:"Besitz bestätigt; Anlegen nicht bestätigt."},
    {key:"manual:naga",name:"Nagakampfhandschuhe",slot:"hands",stats:{armor:61,str:4,sta:4,heal:15,spell:5},note:"Besitz bestätigt; Anlegen nicht bestätigt."},
    {key:"manual:giftzahn-hands",name:"Giftzahn-Handschuhe",slot:"hands",stats:{},note:"Zuletzt angelegt gezeigt; 2/5-Set mit Gamaschen, +10 Intelligenz als Setbonus."},
    {key:"manual:giftzahn-legs",name:"Giftzahn-Gamaschen",slot:"legs",stats:{},note:"Zuletzt angelegt gezeigt; Setbonus +10 Intelligenz bei zwei Teilen."},
    {key:"manual:abgrundlaeufer",name:"Abgrundläufer",slot:"feet",stats:{},note:"Als getragene Stiefel gemeldet; genaue Itemwerte unbekannt."},
    {key:"manual:deviat",name:"Deviatschuppengürtel",slot:"waist",stats:{},note:"Selbst hergestellt; Anlegen nicht bestätigt."}
  ].map(x => Object.assign({origin:"player",requiredLevel:null,quality:null,url:"",updatedAt:0},x));
  const DEFAULT_PROFILES = [
    {role:"solo",slots:{
      chest:{key:"manual:traeumer",state:"equipped"},
      wrists:{key:"manual:ersatzteil",state:"equipped"},
      hands:{key:"manual:giftzahn-hands",state:"equipped"},
      legs:{key:"manual:giftzahn-legs",state:"equipped"},
      feet:{key:"manual:abgrundlaeufer",state:"lastKnown"}
    }},
    {role:"heal",slots:{chest:{key:"manual:weisheit",state:"planned"}}}
  ];
  let db = null, role = "solo", slot = "chest", selectedKey = "",
      profile = null, items = new Map(), wishlist = [], matches = [],
      searchStatus = "Suche nach Namen oder Item-ID. Bereits geladene Gegenstände sind offline verfügbar.";
  function h(s){return String(s == null ? "" : s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function fold(s){return String(s||"").toLocaleLowerCase("de").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/ß/g,"ss");}
  function emptyStats(x){return !x || !Object.keys(x).length;}
  function labelState(s){return s==="equipped"?"Angelegt":s==="lastKnown"?"Zuletzt getragen":"Geplant";}
  function errMessage(e){return e && e.message ? e.message : "Unbekannter Fehler";}
  function notify(message){const out=root.querySelector("#gear-status"); if(out)out.textContent=message;}
  function request(store,mode,action) {
    return new Promise((resolve,reject)=>{
      const t=db.transaction(store,mode),s=t.objectStore(store);
      let result;
      try {
        const req=action(s);
        if(req && "onsuccess" in req){req.onsuccess=()=>{result=req.result;};}
      } catch(e){t.abort();reject(e);return;}
      t.oncomplete=()=>resolve(result);
      t.onerror=()=>reject(t.error||new Error("Datenbank-Transaktion fehlgeschlagen"));
      t.onabort=()=>reject(t.error||new Error("Datenbank-Transaktion abgebrochen"));
    });
  }
  const get=(store,key)=>request(store,"readonly",s=>s.get(key));
  const all=store=>request(store,"readonly",s=>s.getAll());
  const put=(store,value)=>request(store,"readwrite",s=>s.put(value));
  function putMany(store,values){return request(store,"readwrite",s=>{values.forEach(v=>s.put(v));});}
  function openDB(){
    return new Promise((resolve,reject)=>{
      if(!window.indexedDB){reject(new Error("IndexedDB wird von diesem Browser nicht unterstützt."));return;}
      const r=indexedDB.open(DB_NAME,1);
      r.onupgradeneeded=()=>{
        const d=r.result;
        const item=d.createObjectStore("items",{keyPath:"key"});
        item.createIndex("nameFold","nameFold");
        d.createObjectStore("profiles",{keyPath:"role"});
        d.createObjectStore("wishlist",{keyPath:"key"});
        d.createObjectStore("meta",{keyPath:"key"});
      };
      r.onsuccess=()=>resolve(r.result);
      r.onerror=()=>reject(r.error||new Error("Lokale Datenbank kann nicht geöffnet werden."));
      r.onblocked=()=>reject(new Error("Datenbank-Update blockiert: andere App-Tabs schließen."));
    });
  }
  async function seed(){
    if(await get("meta","initial-gear-v1"))return;
    for(const item of MANUAL){
      if(!await get("items",item.key))await put("items",Object.assign({nameFold:fold(item.name)},item));
    }
    for(const p of DEFAULT_PROFILES){
      if(!await get("profiles",p.role))await put("profiles",p);
    }
    await put("meta",{key:"initial-gear-v1",date:"2026-11-14",version:1});
  }
  async function reload(){
    items=new Map((await all("items")).map(x=>[x.key,x]));
    profile=await get("profiles",role);
    if(!profile){profile={role,slots:{}};await put("profiles",profile);}
    wishlist=await all("wishlist");
    render();
  }
  function niceStats(stats){
    if(emptyStats(stats))return "Werte noch nicht erfasst";
    return Object.keys(STAT_LABEL).filter(k=>Number.isFinite(Number(stats[k])) && Number(stats[k])!==0)
      .map(k=>STAT_LABEL[k]+" "+(Number(stats[k])>0?"+":"")+Number(stats[k])).join(" · ") || "Keine auswertbaren Werte";
  }
  function score(item,which){
    if(!item || emptyStats(item.stats))return null;
    return Object.keys(item.stats).reduce((n,k)=>n+Number(item.stats[k]||0)*(WEIGHTS[which][k]||0),0);
  }
  function validURL(url){
    try {const u=new URL(url);return u.protocol==="https:"&&u.hostname==="thewowdb.com"?u.href:"";}
    catch(_){return "";}
  }
  function linkFor(item){
    const url=validURL(item&&item.url);
    return url?'<a target="_blank" rel="noopener noreferrer" href="'+h(url)+'">Itemdetails ↗</a>':"";
  }
  function slotOptions(current){return SLOTS.map(([v,n])=>'<option value="'+v+'"'+(current===v?" selected":"")+'>'+h(n)+'</option>').join("");}
  function renderSlots(){
    root.querySelector("#gear-slots").innerHTML=SLOTS.map(([id,n])=>{
      const choice=profile.slots[id],it=choice&&items.get(choice.key);
      const info=it?'<strong>'+h(it.name)+'</strong><small>'+h(labelState(choice.state))+' · '+h(niceStats(it.stats))+'</small>':'<span class="gear-unknown">Noch nicht belegt</span>';
      return '<div class="gear-slot'+(id===slot?" selected":"")+'"><div><span class="gear-slot-label">'+h(n)+'</span>'+info+'</div><div class="gear-slot-actions">'+
        '<button type="button" data-gear-action="slot" data-slot="'+id+'">Auswählen</button>'+
        (choice?'<button type="button" data-gear-action="clear" data-slot="'+id+'" aria-label="'+h(n)+' leeren">×</button>':"")+'</div></div>';
    }).join("");
    root.querySelector("#gear-slot").value=slot;
    const entries=Object.entries(profile.slots).map(([k,p])=>items.get(p.key)).filter(Boolean);
    const sums={}; let incomplete=0;
    entries.forEach(it=>{
      if(emptyStats(it.stats))incomplete++;
      Object.entries(it.stats||{}).forEach(([k,v])=>{if(Number.isFinite(Number(v)))sums[k]=(sums[k]||0)+Number(v);});
    });
    const totals=niceStats(sums);
    root.querySelector("#gear-totals").innerHTML='<strong>'+entries.length+' belegte Slots</strong><p>'+h(totals)+'</p>'+
      '<small>Nur bekannte Grundwerte addiert; '+incomplete+' Teile ohne vollständige Zahlen. Setboni, Verzauberungen und Effekte nicht eingerechnet.</small>';
  }
  function renderResultList(){
    root.querySelector("#gear-results").innerHTML=matches.length
      ? matches.map(it=>'<div class="gear-item"><div><strong>'+h(it.name)+'</strong>'+
        '<small>'+h(it.origin==="player"?"Aus deinen Spielmeldungen":it.origin==="custom"?"Eigener Eintrag":"WoW-Forever-Datenbank")+
        (it.requiredLevel?" · Ab Stufe "+it.requiredLevel:"")+
        (it.slot?" · "+h(SLOT_LABEL[it.slot]||it.slot):"")+'</small><p>'+h(niceStats(it.stats))+'</p><div class="gear-item-ref">'+linkFor(it)+'</div></div>'+
        '<button type="button" data-gear-action="preview" data-item="'+h(it.key)+'">Vergleichen</button></div>').join("")
      : '<p class="gear-empty">Keine Treffer. Suche in der Forever-Datenbank oder erfasse einen eigenen Gegenstand.</p>';
    root.querySelector("#gear-search-status").textContent=searchStatus;
  }
  function renderCompare(){
    const out=root.querySelector("#gear-compare"),it=items.get(selectedKey);
    if(!it){out.innerHTML='<p class="gear-empty">Wähle oben einen Gegenstand aus. Danach erscheint hier der direkte Vergleich mit deinem aktuell ausgewählten Slot.</p>';return;}
    const currentChoice=profile.slots[slot],old=currentChoice&&items.get(currentChoice.key);
    const keys=Object.keys(STAT_LABEL).filter(k=>(it.stats&&Number(it.stats[k]))||(old&&old.stats&&Number(old.stats[k])));
    const rows=keys.map(k=>'<tr><th>'+h(STAT_LABEL[k])+'</th><td>'+h(old&&!emptyStats(old.stats)?Number(old.stats[k]||0):"–")+'</td><td>'+h(!emptyStats(it.stats)?Number(it.stats[k]||0):"–")+'</td></tr>').join("");
    const a=score(old,role),b=score(it,role);
    const delta=a===null||b===null?"Keine belastbare Punktedifferenz (Werte fehlen).":"Heuristische Differenz: "+(b-a>=0?"+":"")+(b-a).toFixed(1)+" Punkte";
    out.innerHTML='<div class="gear-compare-head"><h3>'+h(it.name)+'</h3><span>'+h(SLOT_LABEL[slot])+'</span></div>'+
      '<p class="gear-muted">Aktuell: '+h(old?old.name:"kein gespeichertes Teil")+' · Kandidat: '+h(it.name)+'</p>'+
      '<table class="gear-comparison"><thead><tr><th>Attribut</th><th>Aktuell</th><th>Kandidat</th></tr></thead><tbody>'+
      (rows||'<tr><td colspan="3">Keine vergleichbaren Zahlen vorhanden.</td></tr>')+'</tbody></table>'+
      '<p class="gear-muted">'+h(delta)+' · Nur Orientierung, keine Simulation von DPS/HPS; Setboni und Effekte fehlen.</p>'+
      (it.note?'<p class="gear-muted">'+h(it.note)+'</p>':"")+
      (it.requiredLevel&&it.requiredLevel>27?'<p class="gear-warning">Benötigte Stufe '+it.requiredLevel+' – derzeit bist du Stufe 27.</p>':"")+
      '<div class="gear-buttons"><button type="button" data-gear-action="assign" data-kind="planned">Für Profil planen</button>'+
      '<button type="button" data-gear-action="assign" data-kind="equipped" class="gear-secondary">Als angelegt markieren</button>'+
      '<button type="button" data-gear-action="wish" class="gear-secondary">Auf Wunschliste</button></div>'+
      (linkFor(it)?'<p class="gear-credit">'+linkFor(it)+'</p>':"");
  }
  function renderWishlist(){
    const rows=wishlist.filter(x=>x.role===role).sort((a,b)=>(a.done===b.done?0:a.done?1:-1));
    root.querySelector("#gear-wishlist").innerHTML=rows.length?rows.map(w=>{
      const it=items.get(w.itemKey);
      if(!it)return "";
      return '<div class="gear-wish"><div><strong>'+h(it.name)+'</strong><small>'+
        h(SLOT_LABEL[w.slot]||w.slot)+' · '+(w.done?"Erhalten (lokale Markierung)":"Noch offen")+
        '</small><p>'+h(w.note||"")+ (w.note?" · ":"") +h(niceStats(it.stats))+'</p>'+linkFor(it)+'</div>'+
        '<div class="gear-wish-actions"><button data-gear-action="wish-done" data-key="'+h(w.key)+'">'+(w.done?"Wieder öffnen":"Erhalten")+'</button>'+
        '<button data-gear-action="wish-note" data-key="'+h(w.key)+'">Notiz</button>'+
        '<button data-gear-action="wish-remove" data-key="'+h(w.key)+'">Entfernen</button></div></div>';
    }).join(""):'<p class="gear-empty">Noch keine Gegenstände vorgemerkt.</p>';
  }
  function render(){
    root.querySelectorAll("[data-gear-role]").forEach(b=>b.classList.toggle("active",b.dataset.gearRole===role));
    root.querySelector("#gear-role-label").textContent=role==="solo"?"Wrathcat · Solo":"Heiler · Instanzen";
    renderSlots();
    renderResultList();
    renderCompare();
    renderWishlist();
  }
  function numeric(x){
    if(x===null||x===undefined||x==="")return null;
    if(typeof x==="object")return numeric(x.value||x.amount||x.count);
    const v=Number(x);return Number.isFinite(v)?v:null;
  }
  function normalizedStatName(key){
    const k=fold(key).replace(/[^a-z0-9]/g,"");
    const dictionary={
      strength:"str",str:"str",4:"str",agility:"agi",agi:"agi",3:"agi",
      stamina:"sta",sta:"sta",7:"sta",intellect:"int",int:"int",5:"int",
      spirit:"spi",spi:"spi",6:"spi",attackpower:"ap",ap:"ap",38:"ap",
      healing:"heal",healingpower:"heal",bonushealing:"heal",spellhealing:"heal",
      spellpower:"spell",spelldamage:"spell",spell:"spell",
      mp5:"mp5",manaper5:"mp5",manaper5sec:"mp5",
      armor:"armor",armour:"armor",crit:"crit",criticalstrike:"crit",
      hit:"hit",hitchance:"hit",dps:"dps"
    };
    return dictionary[k]||null;
  }
  function getStats(raw){
    const stats={};
    function add(key,value){
      const k=normalizedStatName(key),n=numeric(value);
      if(k&&n!==null)stats[k]=(stats[k]||0)+n;
    }
    // Die API kann denselben Stat in mehreren alternativen Feldern führen:
    // nur die erste vorhandene strukturierte Liste verwenden, nie addieren.
    const blocks=[raw.stats,raw.bonus_stats,raw.attributes].filter(x=>x&&typeof x==="object"&&(Array.isArray(x)?x.length>0:Object.keys(x).length>0));
    if(blocks.length>1)blocks.splice(1);
    for(const block of blocks){
      if(Array.isArray(block)){
        block.forEach(x=>{if(!x||typeof x!=="object")return;
          add(x.stat||x.stat_type||x.statId||x.type||x.name||x.id,x.value??x.amount??x.stat_value??x.count);
        });
      }else if(block&&typeof block==="object"){
        Object.entries(block).forEach(([key,value])=>add(key,value));
      }
    }
    if(stats.armor===undefined)add("armor",raw.armor);
    if(stats.dps===undefined)add("dps",raw.dps);
    return stats;
  }
  function findSlot(raw){
    const v=raw.inventory_type??raw.inventoryType??raw.inv_type??raw.slot?.id??raw.slot??raw.equip_slot;
    const n=Number(v);
    const codes={1:"head",2:"neck",3:"shoulder",5:"chest",6:"waist",7:"legs",8:"feet",9:"wrists",10:"hands",11:"finger1",12:"trinket1",13:"mainhand",14:"offhand",15:"ranged",16:"back",17:"mainhand",21:"mainhand",22:"offhand",23:"offhand",25:"ranged",26:"ranged"};
    if(Number.isFinite(n)&&codes[n])return codes[n];
    if(typeof v==="string"){
      const value=fold(v).replace(/[^a-z]/g,"");
      for(const [test,id] of [["head","head"],["neck","neck"],["shoulder","shoulder"],["back","back"],["cloak","back"],["chest","chest"],["waist","waist"],["wrist","wrists"],["hand","hands"],["glove","hands"],["leg","legs"],["feet","feet"],["boot","feet"],["finger","finger1"],["ring","finger1"],["trinket","trinket1"],["shield","offhand"],["offhand","offhand"],["weapon","mainhand"]]){
        if(value.includes(test))return id;
      }
    }
    return null;
  }
  function listRecords(doc){
    if(Array.isArray(doc))return doc;
    for(const x of [doc.items,doc.results,doc.records,doc.data?.items,doc.data?.results,doc.data,doc.payload?.items]){
      if(Array.isArray(x))return x;
    }
    return [];
  }
  function fromAPI(x){
    if(!x||typeof x!=="object")return null;
    const id=numeric(x.id??x.item_id??x.itemId),name=x.name||x.title||x.item?.name;
    if(!Number.isSafeInteger(id)||id<1||!name||typeof name!=="string")return null;
    const req=numeric(x.required_level??x.requiredLevel??x.level_required??x.requirements?.level);
    return {
      key:"api:"+id,id,name:name.slice(0,180),nameFold:fold(name),slot:findSlot(x),
      requiredLevel:req,quality:x.quality?.name??x.quality??null,stats:getStats(x),
      origin:"api",url:validURL(x.links?.html||x.attribution?.url||""),
      build:String(x.build||"").slice(0,100),
      note:"Daten aus TheWoWDB; Dropchance, Klasse, Erhältlichkeit und Ingame-Werte bei Bedarf prüfen.",
      updatedAt:Date.now()
    };
  }
  async function detail(item){
    if(item.origin!=="api"||!item.id)return item;
    try{
      const response=await fetch(API+item.id,{mode:"cors",credentials:"omit"});
      if(!response.ok)return item;
      const raw=await response.json(),d=raw.data&&raw.data.id?raw.data:raw;
      const updated=fromAPI(d);
      if(!updated)return item;
      const merged={...item,...updated,stats:emptyStats(updated.stats)?item.stats:updated.stats};
      await put("items",merged);items.set(merged.key,merged);
      return merged;
    }catch(_){return item;}
  }
  function matchesSlot(item,chosen){
    if(!item.slot)return true;
    if(item.slot==="finger1"&&chosen==="finger2")return true;
    if(item.slot==="trinket1"&&chosen==="trinket2")return true;
    return item.slot===chosen;
  }
  async function assign(kind){
    let it=items.get(selectedKey);if(!it)return;
    it=await detail(it);
    if(!matchesSlot(it,slot)){notify("Der Gegenstand gehört laut Datenquelle in "+(SLOT_LABEL[it.slot]||it.slot)+". Bitte richtigen Slot auswählen.");return;}
    if(kind==="equipped"&&it.requiredLevel&&it.requiredLevel>27){notify("Dieser Gegenstand verlangt Stufe "+it.requiredLevel+". Als geplant vormerken statt als angelegt.");return;}
    profile.slots[slot]={key:it.key,state:kind};
    await put("profiles",profile);await reload();
    notify(it.name+" für "+(role==="solo"?"Wrathcat":"Heiler")+" als "+labelState(kind).toLowerCase()+" gespeichert.");
  }
  async function wish(){
    let it=items.get(selectedKey);if(!it)return;
    it=await detail(it);
    const key=role+"|"+slot+"|"+it.key;
    const old=await get("wishlist",key);
    await put("wishlist",{key,role,slot,itemKey:it.key,done:old?.done||false,note:old?.note||"",createdAt:old?.createdAt||new Date().toISOString()});
    await reload();notify("Zur Wunschliste hinzugefügt.");
  }
  async function search(q){
    const folded=fold(q);
    const cached=[...items.values()].filter(it=>fold(it.name).includes(folded)||String(it.id||"")===q).slice(0,40);
    matches=cached;
    searchStatus="Lokale Treffer: "+cached.length+".";
    renderResultList();
    if(!navigator.onLine){searchStatus+=" Offline – nutze gespeicherte Items.";renderResultList();return;}
    notify("Suche in WoW-Forever-Datenbank …");
    try{
      const byId=/^[0-9]{1,8}$/.test(q);
      const url=byId?API+encodeURIComponent(q):API+"?q="+encodeURIComponent(q.slice(0,64))+"&page=1&per_page=50";
      const response=await fetch(url,{mode:"cors",credentials:"omit"});
      if(response.status===429)throw new Error("API-Limit erreicht. Bitte später erneut suchen.");
      if(!response.ok)throw new Error("Die externe Suche antwortet mit HTTP "+response.status+".");
      const payload=await response.json();
      const records=byId?[payload.data&&payload.data.id?payload.data:payload]:listRecords(payload);
      const remote=records.map(fromAPI).filter(Boolean);
      await putMany("items",remote);
      remote.forEach(it=>items.set(it.key,it));
      const union=new Map([...cached,...remote].map(x=>[x.key,x]));
      matches=[...union.values()].sort((a,b)=>(a.name||"").localeCompare(b.name||"","de")).slice(0,60);
      searchStatus="Lokaler Cache + Forever-API: "+matches.length+" Treffer. Gefundene Items sind offline gespeichert.";
      renderResultList();notify("Suche abgeschlossen.");
    }catch(e){
      searchStatus="API momentan nicht nutzbar ("+errMessage(e)+"). "+cached.length+" lokale Treffer bleiben verfügbar.";
      renderResultList();notify("Lokale Suche bleibt verfügbar.");
    }
  }
  function schemaSafe(x){
    return !!x&&typeof x==="object"&&!Array.isArray(x);
  }
  async function backup(){
    const pack={kind:"wow-forever-gear-backup",version:1,date:new Date().toISOString(),data:{items:await all("items"),profiles:await all("profiles"),wishlist:await all("wishlist")}};
    const blob=new Blob([JSON.stringify(pack,null,2)],{type:"application/json"});
    const u=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=u;a.download="wow-forever-gear-backup.json";document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(u),1200);
    notify("Gear-Backup als JSON-Datei erstellt. Andere App-Häkchen bleiben in ihrer bisherigen Sicherung.");
  }
  async function restore(file){
    if(!file||file.size>2500000)throw new Error("Backup fehlt oder ist zu groß.");
    const data=JSON.parse(await file.text());
    if(data.kind!=="wow-forever-gear-backup"||data.version!==1||!schemaSafe(data.data)||!Array.isArray(data.data.items)||!Array.isArray(data.data.profiles)||!Array.isArray(data.data.wishlist))throw new Error("Keine gültige Gear-Backup-Datei.");
    if(data.data.items.length>10000||data.data.profiles.length>2||data.data.wishlist.length>4000)throw new Error("Backup enthält ungewöhnlich viele Einträge.");
    const restoredItems=data.data.items.filter(x=>schemaSafe(x)&&typeof x.key==="string"&&x.key.length<180&&typeof x.name==="string"&&x.name.length<200).map(x=>({...x,nameFold:fold(x.name)}));
    const restoredProfiles=data.data.profiles.filter(x=>schemaSafe(x)&&(x.role==="solo"||x.role==="heal")&&schemaSafe(x.slots));
    const restoredWish=data.data.wishlist.filter(x=>schemaSafe(x)&&typeof x.key==="string"&&typeof x.itemKey==="string"&&(x.role==="solo"||x.role==="heal"));
    if(!window.confirm("Ausrüstungsprofile und Wunschliste durch das Backup ersetzen? Deine übrigen App-Häkchen bleiben unangetastet."))return;
    await new Promise((resolve,reject)=>{
      const t=db.transaction(["items","profiles","wishlist"],"readwrite");
      const itm=t.objectStore("items"),pro=t.objectStore("profiles"),wishStore=t.objectStore("wishlist");
      pro.clear();wishStore.clear();
      restoredItems.forEach(it=>itm.put(it));
      restoredProfiles.forEach(p=>pro.put(p));
      restoredWish.forEach(w=>wishStore.put(w));
      t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);
    });
    selectedKey="";matches=[];await reload();
    notify("Backup übernommen. Bestehende Talent-/Quest-Häkchen wurden nicht verändert.");
  }
  root.innerHTML='<div class="section-heading"><h2>Ausrüstungsplaner</h2><p>Wrathcat und Heiler getrennt planen · WoW-Forever-Items aus echter Datenquelle</p></div>'+
    '<div class="gear-notice">Gegenstandsdaten: <a href="https://thewowdb.com/developers/" target="_blank" rel="noopener noreferrer">TheWoWDB</a> (öffentliche Forever-API). Deine Profile, Wunschliste und geladene Itemdaten werden in der lokalen IndexedDB dieses Browsers gespeichert, nicht in GitHub oder einem Konto. Werte und Verfügbarkeit im Spiel kontrollieren.</div>'+
    '<div class="gear-role-tabs"><button type="button" data-gear-role="solo" class="active">Wrathcat · Solo</button><button type="button" data-gear-role="heal">Heiler · Instanzen</button></div>'+
    '<div class="gear-panel"><h3 id="gear-role-label">Wrathcat · Solo</h3><div id="gear-totals"></div><div id="gear-slots" class="gear-slot-grid"></div></div>'+
    '<div class="gear-panel"><h3>Item suchen & vergleichen</h3>'+
    '<div class="gear-search-row"><label>Für welchen Slot?<select id="gear-slot">'+slotOptions(slot)+'</select></label>'+
    '<form id="gear-search-form"><label>Gegenstand oder Item-ID<input id="gear-q" type="search" placeholder="Name oder Item-ID" maxlength="64" required autocomplete="off"></label><button type="submit">In Datenbank suchen</button></form></div>'+
    '<p class="gear-muted" id="gear-search-status"></p><div id="gear-results"></div>'+
    '<details class="gear-custom"><summary>Gegenstand ohne Datenbanktreffer manuell erfassen</summary><form id="gear-custom-form"><input id="gear-custom-name" placeholder="Exakter Name aus dem Spiel" maxlength="160" required><button type="submit">Lokal erfassen</button></form><p class="gear-muted">Ohne geprüfte Item-ID werden zunächst keine Werte angenommen.</p></details></div>'+
    '<div class="gear-panel"><h3>Attributvergleich</h3><div id="gear-compare"></div></div>'+
    '<div class="gear-panel"><h3>Meine Upgrade-Wunschliste</h3><div id="gear-wishlist"></div></div>'+
    '<div class="gear-panel"><h3>Datensicherung</h3><p class="gear-muted">Das Backup sichert den Gear-Builder separat. Es ändert nicht die übrigen Häkchen der App.</p>'+
    '<div class="gear-buttons"><button data-gear-action="backup">Gear-Backup herunterladen</button><label class="gear-import">Gear-Backup importieren<input type="file" id="gear-import" accept=".json,application/json"></label></div></div>'+
    '<p class="gear-status" id="gear-status" role="status" aria-live="polite">Lokale Gegenstandsdatenbank wird eingerichtet.</p>';
  root.addEventListener("click",async event=>{
    const b=event.target.closest("[data-gear-action],[data-gear-role]");
    if(!b||!root.contains(b)||!db)return;
    try{
      if(b.dataset.gearRole){role=b.dataset.gearRole;selectedKey="";await reload();return;}
      const a=b.dataset.gearAction;
      if(a==="slot"){slot=b.dataset.slot;selectedKey="";render();root.querySelector("#gear-q").focus();return;}
      if(a==="clear"){delete profile.slots[b.dataset.slot];await put("profiles",profile);await reload();notify("Slot geleert.");return;}
      if(a==="preview"){
        selectedKey=b.dataset.item;
        const it=items.get(selectedKey);
        if(it?.slot&&!matchesSlot(it,slot)){slot=it.slot;}
        render();root.querySelector("#gear-compare").scrollIntoView({block:"nearest",behavior:"smooth"});return;
      }
      if(a==="assign"){await assign(b.dataset.kind);return;}
      if(a==="wish"){await wish();return;}
      if(a==="wish-done"||a==="wish-note"||a==="wish-remove"){
        const current=await get("wishlist",b.dataset.key);if(!current)return;
        if(a==="wish-remove"){await request("wishlist","readwrite",s=>s.delete(current.key));}
        else if(a==="wish-done"){current.done=!current.done;await put("wishlist",current);}
        else{
          const note=window.prompt("Fundort, Quelle oder nächster Schritt:",current.note||"");
          if(note===null)return;current.note=note.slice(0,500);await put("wishlist",current);
        }
        await reload();return;
      }
      if(a==="backup"){await backup();return;}
    }catch(e){notify("Speichern fehlgeschlagen: "+errMessage(e));}
  });
  root.addEventListener("change",async event=>{
    if(event.target.id==="gear-slot"){slot=event.target.value;selectedKey="";render();return;}
    if(event.target.id==="gear-import"&&event.target.files?.length&&db){
      try{await restore(event.target.files[0]);}catch(e){notify("Import nicht möglich: "+errMessage(e));}
      event.target.value="";
    }
  });
  root.addEventListener("submit",async event=>{
    if(!db)return;
    if(event.target.id==="gear-search-form"){
      event.preventDefault();
      const q=root.querySelector("#gear-q").value.trim();
      if(q.length<2){notify("Bitte mindestens zwei Zeichen eingeben.");return;}
      await search(q);return;
    }
    if(event.target.id==="gear-custom-form"){
      event.preventDefault();
      const name=root.querySelector("#gear-custom-name").value.trim();
      if(!name)return;
      const key="custom:"+Date.now()+":"+Math.random().toString(36).slice(2,8);
      const it={key,name,nameFold:fold(name),slot,origin:"custom",stats:{},requiredLevel:null,url:"",note:"Nur lokal erfasst; Item-ID und Werte nicht verifiziert.",updatedAt:Date.now()};
      try{await put("items",it);items.set(key,it);selectedKey=key;matches=[it,...matches];render();notify("Gegenstand lokal erfasst – Werte bitte prüfen.");}
      catch(e){notify("Speichern fehlgeschlagen: "+errMessage(e));}
      return;
    }
  });
  (async()=>{
    try{
      db=await openDB();await seed();await reload();
      matches=MANUAL.map(it=>items.get(it.key)).filter(Boolean);renderResultList();
      notify("Gear-Datenbank bereit. Die eingetragenen Gegenstände stammen aus deinen bestätigten Spielmeldungen.");
    }catch(e){root.querySelector("#gear-status").textContent="Gear-Datenbank nicht verfügbar: "+errMessage(e)+". Bitte Browser-Speicher und Privatmodus prüfen.";}
  })();
})();
