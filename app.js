'use strict';
const SITE_ROOT = new URL('.', document.currentScript.src);
const DATA = window.PORTFOLIO;
const resolve = p => new URL(p,SITE_ROOT).href;
const escapeHTML = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// A compact mobile menu; Escape and navigation restore the closed state.
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu(){menu?.setAttribute('aria-expanded','false');nav?.classList.remove('open');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});

// Recruiters can combine discipline, keyword and experience-type filters.
const catalog = document.querySelector('#project-grid');
if(catalog){
 const search=document.querySelector('#project-search'),type=document.querySelector('#project-type');
 let skill='All work';
 const setState=()=>{
  const params=new URLSearchParams(location.search);skill=params.get('skill')||'All work';
  if(!Array.from(document.querySelectorAll('[data-filter]')).some(b=>b.dataset.filter===skill))skill='All work';
  search.value=params.get('q')||'';type.value=params.get('type')||'all';if(!type.value)type.value='all';
 };
 function update(syncURL=true){
  const q=search.value.trim().toLocaleLowerCase();let matches=0;
  for(const card of catalog.querySelectorAll('[data-project]')){
   const p=DATA.projects.find(p=>p.id===card.dataset.project);
   const text=[p.short,p.title,p.org,p.tools,p.summary,...p.tags].join(' ').toLocaleLowerCase();
   const kind=p.kind.toLocaleLowerCase();
   const typeMatch=type.value==='all'||(type.value==='academic'&&kind.includes('academic'))||(type.value==='industrial'&&kind.includes('internship'))||(type.value==='freelance'&&(kind.includes('freelance')||kind.includes('part-time')));
   const show=(skill==='All work'||p.tags.includes(skill))&&(!q||text.includes(q))&&typeMatch;
   card.hidden=!show;if(show)matches++;
  }
  document.querySelector('#project-count').textContent=`${matches} of ${DATA.projects.length} projects`;
  document.querySelector('#no-projects').hidden=matches>0;
  for(const b of document.querySelectorAll('[data-filter]')){const active=b.dataset.filter===skill;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));}
  if(syncURL){const params=new URLSearchParams();if(skill!=='All work')params.set('skill',skill);if(search.value.trim())params.set('q',search.value.trim());if(type.value!=='all')params.set('type',type.value);history.replaceState(null,'',location.pathname+(params.size?'?'+params.toString():''));}
 }
 setState();update(false);
 for(const b of document.querySelectorAll('[data-filter]'))b.addEventListener('click',()=>{skill=b.dataset.filter;update();});
 search.addEventListener('input',()=>update());type.addEventListener('change',()=>update());
 document.querySelector('#reset-filters').addEventListener('click',()=>{skill='All work';search.value='';type.value='all';update();search.focus();});
 window.addEventListener('popstate',()=>{setState();update(false);});
}

// Accessible skill tabs connect each method to actual project examples.
const skillPanel=document.querySelector('#skill-panel');
if(skillPanel){
 const skillDetails={
  'Mechanical design':{title:'Geometry with a purpose.',description:'Parametric parts, assemblies and interfaces, with attention to manufacture and assembly.',tools:'CATIA V5 · SolidWorks · Creo · GD&T · BOMs',ids:['implant','connector','valve']},
  'CAD / CAM':{title:'From a model to a process.',description:'CAD geometry and CAM preparation informed by tooling, access and workshop constraints.',tools:'Fusion 360 · Parametric CAD · Toolpaths · G-code',ids:['powder','implant','metallic']},
  'Simulation':{title:'Use analysis to question the design.',description:'Structural FEA, mechanical calculations and numerical studies to explore engineering behavior.',tools:'ANSYS Mechanical · MATLAB · Thermal & mechanical calculations',ids:['aerospace','connector','airfoil']},
  'Manufacturing':{title:'Hands-on with the part.',description:'Machining, additive prototypes, finishing and assembly connect design decisions to physical work.',tools:'CNC · FDM · SLS post-processing · Laser cutting',ids:['powder','robotics']},
  'Automation':{title:'Make repetitive work more consistent.',description:'Spreadsheet and scripting tools support CAD configuration, engineering calculations and process tracking.',tools:'Excel / VBA · MATLAB · Python · Odoo',ids:['valve','exchanger','flyson']},
  'Maintenance':{title:'Understand the equipment, too.',description:'Workshop equipment maintenance and field preparation add a practical view of machine readiness.',tools:'Preventive maintenance · Disassembly · Checklists',ids:['powder','flyson']}
 };
 const tabs=Array.from(document.querySelectorAll('[data-skill]'));
 function select(tab){
  for(const b of tabs){const active=b===tab;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;}
  skillPanel.setAttribute('aria-labelledby',tab.id);const d=skillDetails[tab.dataset.skill];
  skillPanel.innerHTML=`<h3>${d.title}</h3><p>${d.description}</p><p class="tool-line">${d.tools}</p>`+d.ids.map(id=>{const p=DATA.projects.find(p=>p.id===id);return `<a class="skill-project" href="${resolve('projects/'+id+'/index.html')}"><span>${escapeHTML(p.short)}<small>${escapeHTML(p.status)}</small></span><span aria-hidden="true">↗</span></a>`;}).join('')+`<a class="text-link" href="${resolve('projects/index.html?skill='+encodeURIComponent(tab.dataset.skill))}">All related projects ↗</a>`;
 }
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let index=i;if(['ArrowDown','ArrowRight'].includes(e.key))index=(i+1)%tabs.length;else if(['ArrowUp','ArrowLeft'].includes(e.key))index=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=tabs.length-1;else return;e.preventDefault();tabs[index].focus();select(tabs[index]);});});
 select(tabs[0]);
}

// Filter the lab evidence without mixing separate devices or processes.
for(const b of document.querySelectorAll('[data-evidence-filter]'))b.addEventListener('click',()=>{
 const category=b.dataset.evidenceFilter;let count=0;
 for(const card of document.querySelectorAll('[data-evidence-card]')){card.hidden=category!=='All'&&card.dataset.category!==category;if(!card.hidden)count++;}
 for(const button of document.querySelectorAll('[data-evidence-filter]')){const active=button===b;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));}
 document.querySelector('#evidence-count').textContent=`${count} ${count===1?'image':'images'}`;
});

// Native modal dialog provides focus containment and Escape handling.
const dialog=document.querySelector('#lightbox');
let gallery=[],current=0;
function showImage(){
 const item=DATA.evidence.find(x=>x.id===gallery[current]);if(!item)return;
 const img=document.querySelector('#lightbox-image');img.src=resolve(item.file);img.alt=item.title;
 document.querySelector('#lightbox-title').textContent=item.title;
 document.querySelector('#lightbox-caption').textContent=item.caption;
 document.querySelector('#lightbox-kind').textContent=item.category+' / '+item.sourceType;
 document.querySelector('#lightbox-source').textContent='Source: '+item.source;
 document.querySelector('#lightbox-credit').innerHTML=item.credit||'';
 document.querySelector('#lightbox-position').textContent=`${current+1} / ${gallery.length}`;
 document.querySelector('#lightbox-original').href=resolve(item.file);
 dialog.querySelector('[data-prev]').disabled=gallery.length<2;
 dialog.querySelector('[data-next]').disabled=gallery.length<2;
}
for(const button of document.querySelectorAll('[data-image]'))button.addEventListener('click',()=>{
 gallery=Array.from(document.querySelectorAll('[data-image]')).filter(b=>b.dataset.gallery===button.dataset.gallery&&!b.closest('[hidden]')).map(b=>b.dataset.image);
 current=gallery.indexOf(button.dataset.image);showImage();dialog.showModal();
});
dialog?.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
dialog?.querySelector('[data-prev]').addEventListener('click',()=>{current=(current-1+gallery.length)%gallery.length;showImage();});
dialog?.querySelector('[data-next]').addEventListener('click',()=>{current=(current+1)%gallery.length;showImage();});
dialog?.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();current=(current+1)%gallery.length;showImage();}else if(e.key==='ArrowLeft'){e.preventDefault();current=(current-1+gallery.length)%gallery.length;showImage();}});
dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});

const courseSearch=document.querySelector('#course-search');
courseSearch?.addEventListener('input',()=>{
 const q=courseSearch.value.toLocaleLowerCase().trim();let count=0;
 for(const year of document.querySelectorAll('.course-year')){let matched=0;for(const li of year.querySelectorAll('li')){const show=(li.textContent+' '+year.querySelector('summary').textContent).toLocaleLowerCase().includes(q);li.hidden=!show;if(show)matched++;}year.hidden=matched===0;year.open=!!q&&matched>0;count+=matched;}
 document.querySelector('#course-empty').hidden=count>0;
});

document.querySelector('#copy-email')?.addEventListener('click',async()=>{const status=document.querySelector('#copy-status');try{await navigator.clipboard.writeText('slimanimohmed160@gmail.com');status.textContent='Email address copied.';}catch{status.textContent='Select and copy: slimanimohmed160@gmail.com';}});
document.querySelector('#contact-form')?.addEventListener('submit',e=>{
 e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;
 const name=form.elements.name.value.trim(),email=form.elements.email.value.trim(),message=form.elements.message.value.trim();if(!name||!message)return;
 const link='mailto:slimanimohmed160@gmail.com?subject='+encodeURIComponent('Engineering opportunity — '+name)+'&body='+encodeURIComponent(message+'\n\nFrom: '+name+'\nReply to: '+email);
 const status=document.querySelector('#contact-status');status.textContent='Draft prepared. ';const a=document.createElement('a');a.href=link;a.textContent='Open in your email app ↗';a.className='text-link';status.append(a);
});

// Retain useful links shared by the previous GitHub version.
if(location.hash.startsWith('#project-')){const id=location.hash.slice(9);if(DATA.projects.some(p=>p.id===id))location.replace(resolve('projects/'+id+'/index.html'));}
