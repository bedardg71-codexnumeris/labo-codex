// Le décrochage (lot 2, mesure en lecture seule, demande de Grégoire du 30 oct. 2026) : les élèves absents des mesures
// précédentes, réintégrés jusqu'à leur dernière date d'activité. Quels signaux s'allumaient avant leur départ, et combien
// de semaines avant : assiduité et complétion sous le palier le plus bas, note selon le modèle sans plancher avec les
// règles 1 et 2. Un élève sans fiche reçoit une fiche temporaire, dans le navigateur jetable seulement.
// La date de départ est une SUPPOSITION : le codex ne la porte pas. Deux lectures, dites à côté de chaque résultat.
// Exige un commit qui porte `reperesPerformance`. Sort des effectifs et des délais triés, sans identifiant. Mode d'emploi : LISEZMOI.md.
import assert from 'node:assert/strict';
import { ouvrir, basculer, lireCodex, ecrireAgregat, PLANS } from './commun.mjs';

const MIN_GROUPE = 5;
const MIN_COPIES = 2;
// Un bloc de séances absentes assez long pour dire qu'un élève est parti, quand des présences reprennent ensuite.
const BLOC_SEANCES = 3;
const BLOC_ACTIF_LONG = 6;

const codex = await lireCodex();
const sortie = {}; let nbErr = 0;
for (const plan of PLANS) {
  const { b, page, erreurs } = await ouvrir(codex);
  await page.clock.setFixedTime(new Date('2026-10-30T12:00:00'));
  await basculer(page, plan.t);
  const info = await page.evaluate(async ({grilleNom, grilleTrimestre, MIN_COPIES, BLOC_SEANCES, BLOC_ACTIF_LONG}) => {
    window.__base = { ev: JSON.parse(JSON.stringify(db.getSync(cle('evaluationsSauvegardees'),[]))), pr: JSON.parse(JSON.stringify(db.getSync(cle('presences'),[]))) };
    window.__H = {}; window.__P = new Map();
    window.__classer = (x, a, repere) => { if (!a) return 1; if (repere !== null && x >= repere) return 1; if (x < a.m - a.sd) return 3; if (x < a.m - a.sd / 2) return 2; return 1; };
    window.__classerRegles = (x, n, a, repere, passage) => { const base = n >= MIN_COPIES ? window.__classer(x, a, repere) : 1; const signal = !!a && a.m < passage; return (base === 1 && x < passage && !signal) ? 2 : base; };
    if (grilleNom) { const prods=db.getSync(cle('productions'),[]); const gr=db.getSync(cle('grillesTemplates'),[]);
      const g=gr.filter(x=>String(x.nom).replace(/\s+/g,' ').trim()===grilleNom).sort((x,y)=>prods.filter(p=>p.grilleId===y.id).length-prods.filter(p=>p.grilleId===x.id).length)[0];
      db.setSync('preferencesUtilisateur', Object.assign({}, db.getSync('preferencesUtilisateur',{}), {grilleReferenceDepistage:g.id})); }
    const gcs=db.getSync(cle('groupesCours'),[]).map(g=>g.id);
    const present=p=>(p.periodesPresentes??p.heures??0)>0;
    // Les traces sans fiche : une fiche temporaire, au groupe dont les dates couvrent le mieux ses présences. Navigateur jetable seulement.
    const fiches=db.getSync(cle('groupeEtudiants'),[]); const das=new Set(fiches.map(e=>e.da));
    const presParDa=new Map(); window.__base.pr.forEach(p=>{if(!presParDa.has(p.da))presParDa.set(p.da,[]);presParDa.get(p.da).push(p);});
    const hors=[...new Set([...window.__base.pr.map(p=>p.da),...window.__base.ev.map(e=>e.etudiantDA)])].filter(d=>d&&!das.has(d));
    const groupesDe=[...new Set(fiches.map(e=>e.groupe))];
    const datesGroupe=g=>new Set(fiches.filter(e=>e.groupe===g).flatMap(e=>(presParDa.get(e.da)||[]).map(p=>p.date)));
    const dg=Object.fromEntries(groupesDe.map(g=>[g,datesGroupe(g)]));
    let ambigus=0;
    const nouvelles=hors.map((da,i)=>{ const dates=(presParDa.get(da)||[]).map(p=>p.date); const scores=groupesDe.map(g=>[g,dates.filter(d=>dg[g].has(d)).length]).sort((x,y)=>y[1]-x[1]);
      if(scores.length>1&&scores[0][1]===scores[1][1])ambigus++; const modele=fiches.find(e=>e.groupe===scores[0][0]);
      return Object.assign({},modele,{da,id:'temporaire-'+i,nom:'x',prenom:'x',statut:'inactif',_sansFiche:true}); });
    const dansLaListe=[...fiches,...nouvelles];
    db.setSync(cle('groupeEtudiants'),dansLaListe);
    window.__categorie=new Map(dansLaListe.map(e=>[e.da,e._sansFiche?'sansFiche':e.statut?'statut':'actif']));
    const statuts={}; fiches.forEach(e=>{const s=e.statut||'(aucun)';statuts[s]=(statuts[s]||0)+1;});
    // Présences et bloc de chaque élève : à l'intérieur du navigateur, seuls des effectifs en sortent.
    const blocs=(da)=>{ const pp=(presParDa.get(da)||[]).slice().sort((x,y)=>x.date<y.date?-1:1); let r=[],deb=null; pp.forEach((p,i)=>{ if(!present(p)){ if(deb===null)deb=i; } else { if(deb!==null){r.push([deb,i-1]);deb=null;} } }); if(deb!==null)r.push([deb,pp.length-1]); return {pp,r}; };
    window.__blocs=blocs;
    const actifs=fiches.filter(e=>!e.statut);
    const longsActifs=actifs.filter(e=>blocs(e.da).r.some(([x,y])=>y-x+1>=BLOC_ACTIF_LONG)).length;
    const finActifs=actifs.filter(e=>{const {pp,r}=blocs(e.da);const d=r[r.length-1];return d&&d[1]===pp.length-1&&d[1]-d[0]+1>=BLOC_ACTIF_LONG;}).length;
    // Ce que les données disent d'un changement de groupe ou d'un retour : des effectifs, aucun identifiant.
    const autresTrimestres=['a2025','h2026','a2026'].filter(t=>t!==grilleTrimestre);
    const parti=e=>e.statut||e._sansFiche;
    const vusAilleurs=dansLaListe.filter(parti).filter(e=>autresTrimestres.some(t=>(db.getSync(t+'_groupeEtudiants',[])||[]).some(f=>f.da===e.da))).length;
    const copiesAutreGroupe=window.__base.ev.filter(x=>{const f=fiches.find(e=>e.da===x.etudiantDA);return f&&f.groupeCoursId&&x.groupeCoursId&&f.groupeCoursId!==x.groupeCoursId;}).length;
    // Après le bloc : les partis d'un même groupe ont-ils les mêmes présences, date par date ? Les dates où ils diffèrent, sur les dates communes.
    const queues=groupesDe.map(g=>{ const I=fiches.filter(e=>e.groupe===g&&e.statut); const fins=I.map(e=>{const {pp,r}=blocs(e.da);const long=r.filter(([x,y])=>y-x+1>=BLOC_SEANCES&&y<pp.length-1).pop();return long?pp[long[1]].date:null;}); if(I.length<2||fins.some(f=>!f))return null;
      const depuis=fins.sort().pop(); const lignes=I.map(e=>new Map((presParDa.get(e.da)||[]).filter(p=>p.date>depuis).map(p=>[p.date,present(p)]))); const communes=[...lignes[0].keys()].filter(d=>lignes.every(l=>l.has(d))); return {eleves:I.length,communes:communes.length,differentes:communes.filter(d=>new Set(lignes.map(l=>l.get(d))).size>1).length}; }).filter(Boolean);
    return { gcs, grille:(obtenirGrilleReferenceDepistage()||{}).nom||null, statuts, nbFiches:fiches.length, sansFiche:hors.length, ambigus, longsActifs, finActifs, vusAilleurs, copiesAutreGroupe, deuxGroupes:groupesDe.length, memeDaDeuxFiches:fiches.length-das.size, queues,
      temoin:[window.__classerRegles(69,2,{m:80,sd:10},null,60),window.__classerRegles(69,1,{m:80,sd:10},null,60),window.__classerRegles(59,1,{m:80,sd:10},null,60),window.__classerRegles(50,2,{m:55,sd:10},null,60)] };
  }, {grilleNom: plan.grilleNom, grilleTrimestre: plan.t, MIN_COPIES, BLOC_SEANCES, BLOC_ACTIF_LONG});
  assert.deepEqual(info.temoin, [3,1,2,1]);
  // Les dates de départ supposées, et les coupes qu'elles ajoutent. Aucune date ne sort du navigateur : seule la liste de coupes y reste.
  const coupes = await page.evaluate(async ({coupes, gcs, BLOC_SEANCES, fin}) => {
    const fiches=db.getSync(cle('groupeEtudiants'),[]); const present=p=>(p.periodesPresentes??p.heures??0)>0;
    const parti=fiches.filter(e=>window.__categorie.get(e.da)!=='actif');
    const prods=db.getSync(cle('productions'),[]);
    window.__depart=new Map();
    for(const gc of gcs){ await changerGroupeCoursActifV2(gc); const gid=obtenirIdContexteActif(db.getSync('infoCours',null)); const ps=obtenirDonneesSelonMode('productions')||[]; const ev=window.ProductionDiagnostique.filtrerEvaluations(obtenirDonneesSelonMode('evaluationsSauvegardees')||[],ps); const evaluables=obtenirIdsProductionsEvaluables(ps);
      for(const e of obtenirEtudiantsCoursActif().filter(x=>window.__categorie.get(x.da)!=='actif')){ if(window.__depart.has(e.da))continue;
        const {pp,r}=window.__blocs(e.da);
        const positifs=pp.filter(present); const dernierePresence=positifs.length?positifs[positifs.length-1].date:null;
        const longs=r.filter(([x,y])=>y-x+1>=BLOC_SEANCES&&y<pp.length-1); const bloc=longs[longs.length-1]||null;
        const avantBloc=bloc?(pp.slice(0,bloc[0]).filter(present).map(p=>p.date).pop()||null):dernierePresence;
        const cop=ev.filter(c=>c.etudiantDA===e.da&&evaluables.includes(c.productionId)&&window.evaluationEntreDansLaNote(c)&&!window.evaluationNonRemise(c));
        const ech=cop.map(c=>{const p=ps.find(x=>x.id===c.productionId);const u=p&&obtenirEcheanceEffective(p,gid);return (u&&u.date)||(p&&p.dateEcheance)||(c.dateEvaluation||'').slice(0,10);}).filter(Boolean).sort();
        const derniereCopie=ech.length?ech[ech.length-1]:null; const corrigees=cop.map(c=>(c.dateEvaluation||'').slice(0,10)).sort();
        const retenue=[avantBloc,derniereCopie].filter(Boolean).sort().pop()||null;
        const apres=bloc?pp.slice(bloc[1]+1):[]; const copiesApresBloc=bloc?ech.filter(d=>d>pp[bloc[1]].date).length:0;
        window.__depart.set(e.da,{gc,retenue,naive:dernierePresence,bloc:!!bloc,tailleBloc:bloc?bloc[1]-bloc[0]+1:0,seancesApres:apres.length,presentesApres:apres.filter(present).length,copiesApresBloc,nbCopies:cop.length,corrigeesApres:retenue?corrigees.filter(d=>d>retenue).length:0}); } }
    const ajout=[...window.__depart.values()].flatMap(d=>[d.retenue,d.naive]).filter(Boolean);
    return [...new Set([...coupes,...ajout])].sort();
  },{coupes:plan.coupes,gcs:info.gcs,BLOC_SEANCES});
  for (const cut of coupes) {
    await page.clock.setFixedTime(new Date(cut + 'T23:30:00'));
    await page.evaluate(async ({cut, gcs}) => {
      const f=window.__base.ev.filter(e=>(e.dateEvaluation||'').slice(0,10)<=cut).map(e=>Object.assign({},e));
      const ids=new Set(f.map(e=>e.id)), tous=new Set(window.__base.ev.map(e=>e.id));
      f.forEach(e=>{if(e.remplaceeParId&&!ids.has(e.remplaceeParId)&&tous.has(e.remplaceeParId)){delete e.remplaceeParId;delete e.dateRemplacement;}});
      db.setSync(cle('evaluationsSauvegardees'),f); db.setSync(cle('presences'),window.__base.pr.filter(p=>p.date<=cut));
      const acc=new Map(), reperes=new Map(), juge=new Map();
      for(const gc of gcs){
        await changerGroupeCoursActifV2(gc); calculerEtSauvegarderIndicesAssiduite(); calculerEtStockerIndicesCP();
        reperes.set(gc,reperesPerformance().maitrise); juge.set(gc,depistagePeutJugerLaNonParticipation().possible);
        const prods=obtenirDonneesSelonMode('productions')||[]; const ev=window.ProductionDiagnostique.filtrerEvaluations(obtenirDonneesSelonMode('evaluationsSauvegardees')||[],prods);
        const evaluables=obtenirIdsProductionsEvaluables(prods);
        for(const e of obtenirEtudiantsCoursActif()){
          if(acc.has(e.da))continue;
          const i=calculerTousLesIndices(e.da); const r=determinerNiveauRaiPedagogique(e.da);
          const cop=ev.filter(c=>c.etudiantDA===e.da&&evaluables.includes(c.productionId)&&window.evaluationEntreDansLaNote(c)&&!window.evaluationNonRemise(c)).map(c=>window.noteRetenueParLeCalcul(c)).filter(v=>typeof v==='number');
          acc.set(e.da,{gc,A:i.A,C:i.C,np:r.pattern==='Non-participation',n:cop.length,niveau:cop.length?cop.reduce((a,v)=>a+v,0)/cop.length:null});
        }
      }
      window.__H[cut]={acc,reperes,juge};
    },{cut,gcs:info.gcs});
  }
  const synth = await page.evaluate(({coupes,gcs,MIN_GROUPE,pa}) => {
    const H=window.__H, passage=window.NOTE_DE_PASSAGE*100, palier=window.SEUILS_PAR_DEFAUT.interpretation.acceptable*100;
    const st=a=>{const n=a.length,m=a.reduce((x,y)=>x+y,0)/n;return{n,m,sd:n>1?Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(n-1)):0};};
    const sem=(a,b)=>Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/(7*864e5)*10)/10;
    const cat=window.__categorie, depart=window.__depart;
    // La référence à une date : tout le groupe, moins les partis déjà partis selon la lecture choisie.
    const lire=(lecture)=>{ const parCoupe={};
      for(const cut of coupes){ const {acc,reperes,juge}=H[cut]; const lignes=new Map(); const moyennes=[];
        for(const gc of gcs){ const presents=[...acc.entries()].filter(([da,v])=>v.gc===gc&&(cat.get(da)==='actif'||(depart.get(da)&&depart.get(da)[lecture]&&depart.get(da)[lecture]>=cut)));
          const lv=presents.filter(([,v])=>v.n>0).map(([,v])=>v.niveau), a=lv.length>=MIN_GROUPE?st(lv):null; const seulsActifs=presents.filter(([da,v])=>cat.get(da)==='actif'&&v.n>0).map(([,v])=>v.niveau);
          if(a&&seulsActifs.length>=MIN_GROUPE)moyennes.push(Math.abs(a.m-st(seulsActifs).m));
          for(const [da,v] of presents){ const niv=v.n>0?window.__classerRegles(v.niveau,v.n,a,reperes.get(gc),passage):0;
            lignes.set(da,{A:v.A!==null&&v.A<palier,C:juge.get(gc)&&v.C!==null&&v.C<palier,note:v.n>0&&niv>=2,np:v.np,n:v.n,sousSignal:v.n>0&&niv===1&&v.niveau<passage&&a&&a.m<passage}); } }
        parCoupe[cut]={lignes,ecartMoy:moyennes.length?Math.max(...moyennes):0}; }
      return parCoupe; };
    const bilan=(lecture)=>{ const parCoupe=lire(lecture); const eleves=[...depart.entries()].filter(([,d])=>d[lecture]);
      const liste=eleves.map(([da,d])=>{ const dates=coupes.filter(c=>c<=d[lecture]&&parCoupe[c].lignes.has(da)); const pr=k=>{const u=dates.find(c=>parCoupe[c].lignes.get(da)[k]);return u?sem(u,d[lecture]):null;};
        const fin=dates.length?parCoupe[dates[dates.length-1]].lignes.get(da):{}; return {da,cat:cat.get(da),A:pr('A'),C:pr('C'),note:pr('note'),np:pr('np'),sousSignal:pr('sousSignal'),finA:!!fin.A,finC:!!fin.C,finNote:!!fin.note,copies:fin.n||0,jugeAvant:dates.some(c=>H[c].juge.get(d.gc))}; });
      const dl=(L,k)=>L.filter(x=>x[k]!==null).map(x=>x[k]).sort((a,b)=>a-b);
      const med=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y);return s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2;};
      const bloc=(L)=>({n:L.length,A:dl(L,'A'),C:dl(L,'C'),note:dl(L,'note'),np:dl(L,'np'),medA:med(dl(L,'A')),medC:med(dl(L,'C')),medNote:med(dl(L,'note')),finA:L.filter(x=>x.finA).length,finC:L.filter(x=>x.finC).length,finNote:L.filter(x=>x.finNote).length,
        aucun:L.filter(x=>x.A===null&&x.C===null&&x.note===null).length,noteSeule:L.filter(x=>x.note!==null&&x.A===null&&x.C===null).length,assiduiteSeule:L.filter(x=>x.A!==null&&x.C===null&&x.note===null).length,completionSeule:L.filter(x=>x.C!==null&&x.A===null&&x.note===null).length,
        AC:L.filter(x=>x.A!==null&&x.C!==null&&x.note===null).length,Anote:L.filter(x=>x.A!==null&&x.note!==null&&x.C===null).length,Cnote:L.filter(x=>x.C!==null&&x.note!==null&&x.A===null).length,trois:L.filter(x=>x.A!==null&&x.C!==null&&x.note!==null).length,sousSignal:L.filter(x=>x.sousSignal!==null).length,sansCopie:L.filter(x=>x.copies===0).length,uneCopie:L.filter(x=>x.copies===1).length,sansJuge:L.filter(x=>!x.jugeAvant).length});
      const ecartMoy=Math.round(Math.max(0,...coupes.map(c=>parCoupe[c].ecartMoy))*10)/10;
      return {tous:bloc(liste),statut:bloc(liste.filter(x=>x.cat==='statut')),sansFiche:bloc(liste.filter(x=>x.cat==='sansFiche')),ecartMoy,sansDate:depart.size-eleves.length}; };
    // Le taux de base : à quelle fréquence ces signaux s'allument aussi chez les élèves restés.
    const base=(()=>{ const parCoupe=lire('retenue'); const actifs=[...cat.entries()].filter(([,c])=>c==='actif').map(([da])=>da); const auMoins=(k)=>actifs.filter(da=>coupes.some(c=>{const l=parCoupe[c].lignes.get(da);return l&&l[k];})).length; const fin=parCoupe[coupes[coupes.length-1]].lignes; const aFin=(k)=>actifs.filter(da=>{const l=fin.get(da);return l&&l[k];}).length; const aucun=actifs.filter(da=>!coupes.some(c=>{const l=parCoupe[c].lignes.get(da);return l&&(l.A||l.C||l.note);})).length; return {n:actifs.length,A:auMoins('A'),C:auMoins('C'),note:auMoins('note'),aucun,finA:aFin('A'),finC:aFin('C'),finNote:aFin('note')}; })();
    const D=[...depart.values()];
    const lots=[...new Set(D.map(d=>d.gc))];
    const traces={avecBloc:D.filter(d=>d.bloc).length,taillesBloc:D.filter(d=>d.bloc).map(d=>d.tailleBloc).sort((a,b)=>a-b),seancesApres:D.reduce((a,d)=>a+d.seancesApres,0),presentesApres:D.reduce((a,d)=>a+d.presentesApres,0),copiesApresBloc:D.reduce((a,d)=>a+d.copiesApresBloc,0),corrigeesApres:D.reduce((a,d)=>a+d.corrigeesApres,0),elevesCorrigesApres:D.filter(d=>d.corrigeesApres>0).length,semainesEcartLectures:D.filter(d=>d.retenue&&d.naive).map(d=>sem(d.retenue,d.naive)).sort((a,b)=>a-b),semainesAvantFin:D.filter(d=>d.retenue).map(d=>sem(d.retenue,pa)).sort((a,b)=>a-b),jamaisActifs:D.filter(d=>!d.retenue).length,sansCopie:D.filter(d=>!d.nbCopies).length};
    return {retenue:bilan('retenue'),naive:bilan('naive'),base,traces,groupes:lots.length};
  },{coupes,gcs:info.gcs,MIN_GROUPE,pa:plan.fin<='2026-10-30'?plan.fin:'2026-10-30'});
  sortie[plan.t]={info,coupes:coupes.length,synth}; nbErr+=erreurs(); await b.close();
  const {temoin,...resume}=info; delete resume.gcs;
  console.log('==',plan.t,JSON.stringify(resume));
  console.log(JSON.stringify(synth));
}
ecrireAgregat('decrochage.json', sortie); console.log('erreurs',nbErr);
