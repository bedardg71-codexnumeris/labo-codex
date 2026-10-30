// L'assiduité et la complétion annoncent-elles la note provisoire ? (consigne du 30 oct. 2026, 14 h 59)
// Deux définitions de « la première note », parce que le code et l'écran ne coïncident pas : `ecran`, le minimum de la
// pratique atteint (`minimumCompletion` : sous lui, le profil écrit « — » ; les 4 artefacts dont parle Grégoire) ; `code`,
// `noteConstructible`, vrai dès la première copie.
// Pour chaque élève : A et C à la dernière date de coupe où sa note n'existe pas encore (en variante, à la coupe
// médiane de cette période), croisés avec sa première note provisoire constructible (en variante, sa note à la dernière
// coupe), sous 60 % ou non, et en complément sous la ligne décidée à 15 h 13 (repère de suffisance, 60 % sans repère).
// Un trimestre où la note se construit dès la première copie n'a pas de période « sans note » : on y prend les deux
// premières semaines de copies du groupe, et l'issue est la première note après elles.
// C est inconnue tant que le groupe n'est pas jugeable (même garde que `decrochage.mjs`).
// Sort des effectifs seulement. Mode d'emploi : LISEZMOI.md.
import { ouvrir, basculer, lireCodex, ecrireAgregat, PLANS } from './commun.mjs';

const BORNES = [95, 90, 85, 80, 75];
const NOTE_60 = 60;

const codex = await lireCodex();
const sortie = {}; let nbErr = 0;
for (const plan of PLANS) {
  const { b, page, erreurs } = await ouvrir(codex);
  await page.clock.setFixedTime(new Date('2026-10-30T12:00:00'));
  await basculer(page, plan.t);
  const info = await page.evaluate(({grilleNom}) => {
    window.__base = { ev: JSON.parse(JSON.stringify(db.getSync(cle('evaluationsSauvegardees'),[]))), pr: JSON.parse(JSON.stringify(db.getSync(cle('presences'),[]))) };
    window.__H = {};
    // Le compte de la colonne « ≥ Min. » : même règle que `compterEvaluationsPourMinimum` (etudiants.js), privée à son module.
    window.__compterPourMinimum = (prods, evals) => { const pt=window.ProductionDiagnostique.filtrerProductions(prods); const ids=new Set(obtenirTypePratiqueActive()==='standards'?window.obtenirIdsPoolStdDuCorpus(pt):pt.filter(p=>p.type==='artefact-portfolio').map(p=>p.id)); const m=new Map(); evals.forEach(ev=>{if(ids.has(ev.productionId)&&!ev.remplaceeParId&&ev.noteFinale!==null&&ev.noteFinale!==undefined)m.set(ev.etudiantDA,(m.get(ev.etudiantDA)||0)+1);}); return m; };
    if (grilleNom) { const prods=db.getSync(cle('productions'),[]); const gr=db.getSync(cle('grillesTemplates'),[]);
      const g=gr.filter(x=>String(x.nom).replace(/\s+/g,' ').trim()===grilleNom).sort((x,y)=>prods.filter(p=>p.grilleId===y.id).length-prods.filter(p=>p.grilleId===x.id).length)[0];
      db.setSync('preferencesUtilisateur', Object.assign({}, db.getSync('preferencesUtilisateur',{}), {grilleReferenceDepistage:g.id})); }
    return { gcs: db.getSync(cle('groupesCours'),[]).map(g=>g.id), grille:(obtenirGrilleReferenceDepistage()||{}).nom||null };
  }, {grilleNom: plan.grilleNom});
  const lignes = [];
  for (const cut of plan.coupes) {
    await page.clock.setFixedTime(new Date(cut + 'T23:30:00'));
    lignes.push(await page.evaluate(async ({cut, gcs}) => {
      const f=window.__base.ev.filter(e=>(e.dateEvaluation||'').slice(0,10)<=cut).map(e=>Object.assign({},e));
      const ids=new Set(f.map(e=>e.id)), tous=new Set(window.__base.ev.map(e=>e.id));
      f.forEach(e=>{if(e.remplaceeParId&&!ids.has(e.remplaceeParId)&&tous.has(e.remplaceeParId)){delete e.remplaceeParId;delete e.dateRemplacement;}});
      db.setSync(cle('evaluationsSauvegardees'),f); db.setSync(cle('presences'),window.__base.pr.filter(p=>p.date<=cut));
      const acc=new Map(), pratiques=new Set(), minimums=new Set();
      for(const gc of gcs){
        await changerGroupeCoursActifV2(gc); calculerEtSauvegarderIndicesAssiduite(); calculerEtStockerIndicesCP();
        const rep=reperesPerformance(), ligne=rep.suffisance!==null?rep.suffisance:rep.passage, juge=depistagePeutJugerLaNonParticipation().possible;
        pratiques.add(obtenirIdPratiqueActive());
        const prods=obtenirDonneesSelonMode('productions')||[]; const ev=window.ProductionDiagnostique.filtrerEvaluations(obtenirDonneesSelonMode('evaluationsSauvegardees')||[],prods);
        const evaluables=obtenirIdsProductionsEvaluables(prods);
        const portfolio=(obtenirConfigPratiqueActive()||{}).portfolio||{}, minimum=portfolio.minimumCompletion||3, evalsParDA=window.__compterPourMinimum(prods,obtenirDonneesSelonMode('evaluationsSauvegardees')||[]);
        minimums.add((portfolio.actif===false?'sans portfolio':'minimum '+minimum)+' / '+(portfolio.methodeSelection||'?')+' / '+obtenirTypePratiqueActive());
        for(const e of obtenirEtudiantsCoursActif()){
          if(acc.has(e.da))continue;
          const i=calculerTousLesIndices(e.da);
          const n=ev.filter(c=>c.etudiantDA===e.da&&evaluables.includes(c.productionId)&&window.evaluationEntreDansLaNote(c)&&!window.evaluationNonRemise(c)).length;
          acc.set(e.da,{gc,exclu:estEtudiantExclu(e),A:i.A,C:i.C,P:i.P,cons:i.noteConstructible!==false,ecran:i.noteConstructible!==false&&(portfolio.actif===false||(evalsParDA.get(e.da)||0)>=minimum),n,juge,ligne});
        }
      }
      window.__H[cut]=acc;
      const res=[...acc.values()].filter(r=>!r.exclu);
      return {cut,effectif:res.length,copies:res.reduce((a,r)=>a+r.n,0),avecNote:res.filter(r=>r.cons).length,avecNoteEcran:res.filter(r=>r.ecran).length,minimums:[...minimums],avecCopie:res.filter(r=>r.n>0).length,sansJuge:res.filter(r=>!r.juge).length,pratiques:pratiques.size};
    },{cut,gcs:info.gcs}));
  }
  const synth = await page.evaluate(({coupes,BORNES,NOTE_60}) => {
    const H=window.__H; const plusUn=(c,j)=>new Date(Date.parse(c+'T12:00:00Z')+j*864e5).toISOString().slice(0,10);
    const das=[...H[coupes[coupes.length-1]].keys()];
    const analyser=(aNote)=>{
      const eleves=das.map(da=>{ const L=coupes.map(c=>H[c].get(da)); return {da,L,gc:L[L.length-1].gc,exclu:L[L.length-1].exclu,iNote:L.findIndex(r=>r&&aNote(r)),iCopie:L.findIndex(r=>r&&r.n>0)}; });
      const restes=eleves.filter(e=>!e.exclu);
      const avecNote=restes.filter(e=>e.iNote>=0);
      const attendent=avecNote.filter(e=>e.iNote>e.iCopie).length;
      // La pratique construit-elle dès la première copie ? Lu sur les élèves, pas sur son nom.
      const sansPeriode=avecNote.length>0&&attendent*2<avecNote.length;
      const debutGroupe=new Map(); restes.forEach(e=>{if(e.iCopie>=0&&(!debutGroupe.has(e.gc)||e.iCopie<debutGroupe.get(e.gc)))debutGroupe.set(e.gc,e.iCopie);});
      const repere=(e)=>{ // {iDerniere, iMediane, iIssue} ; null : pas de période avant la note
        if(sansPeriode){ const d=debutGroupe.get(e.gc); if(d===undefined)return null; const limite=plusUn(coupes[d],14); let i=d; while(i+1<coupes.length&&coupes[i+1]<=limite)i++;
          const iIssue=e.L.findIndex((r,k)=>k>i&&r&&aNote(r)); return iIssue<0?null:{iDerniere:i,iMediane:d+Math.floor((i-d)/2),iIssue}; }
        if(e.iNote<1)return null; return {iDerniere:e.iNote-1,iMediane:Math.floor((e.iNote-1)/2),iIssue:e.iNote}; };
      const lire=(e,i)=>{const r=e.L[i];return {A:r.A,C:r.juge?r.C:null};};
      const issues={premiere:(e,p)=>e.L[p.iIssue],derniere:(e)=>{for(let i=e.L.length-1;i>=0;i--)if(e.L[i]&&aNote(e.L[i]))return e.L[i];return null;}};
      const obs=restes.map(e=>({e,p:repere(e)})).filter(o=>o.p);
      const croiser=(pred,sousSeuil)=>{ const t={ss:0,sa:0,as:0,aa:0,inconnu:0}; obs.forEach(({e,p})=>{ const s=pred(e,p); const r=sousSeuil(e,p); if(s===null||r===null){t.inconnu++;return;} t[(s?'s':'a')+(r?'s':'a')]++; }); return t; };
      const inconnue=(v)=>v===null||v===undefined;
      const predicteurs=(moment,b)=>({
        A:(e,p)=>{const v=lire(e,p[moment]).A;return inconnue(v)?null:v<b;},
        C:(e,p)=>{const v=lire(e,p[moment]).C;return inconnue(v)?null:v<b;},
        AetC:(e,p)=>{const {A,C}=lire(e,p[moment]);return inconnue(A)||inconnue(C)?null:(A<b&&C<b);},
        AouC:(e,p)=>{const {A,C}=lire(e,p[moment]);return inconnue(A)||inconnue(C)?null:(A<b||C<b);} });
      const seuils={sous60:(r)=>r?r.P<NOTE_60:null,sousLigne:(r)=>r?r.P<r.ligne:null};
      const tableaux={};
      for(const moment of ['iDerniere','iMediane'])for(const issue of ['premiere','derniere'])for(const seuil of ['sous60','sousLigne']){
        const k=moment+'|'+issue+'|'+seuil; tableaux[k]={};
        for(const borne of BORNES){ const P=predicteurs(moment,borne); tableaux[k][borne]={};
          for(const nom of Object.keys(P)) tableaux[k][borne][nom]=croiser(P[nom],(e,p)=>seuils[seuil](issues[issue](e,p))); }
      }
      const sansNote=restes.filter(e=>e.iNote<0);
      const dernier=(e)=>e.L[e.L.length-1];
      const med=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y);return s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2;};
      return {sansPeriode,effectif:restes.length,exclus:eleves.length-restes.length,exclusAvecNote:eleves.filter(e=>e.exclu&&e.iNote>=0).length,
        avecNote:avecNote.length,attendent,obs:obs.length,sansAvant:avecNote.length-obs.length,
        sansNote:sansNote.length,sansNoteAouCSous85:sansNote.filter(e=>{const r=dernier(e);return (r.A!==null&&r.A<85)||(r.juge&&r.C!==null&&r.C<85);}).length,sansNoteSansCopie:sansNote.filter(e=>e.iCopie<0).length,
        coupeDerniereMediane:med(obs.map(o=>o.p.iDerniere)),copiesAvantNote:med(obs.map(({e,p})=>e.L[p.iDerniere].n)),
        lignes:[...new Set(restes.map(e=>dernier(e).ligne))],premieresSous60:obs.filter(({e,p})=>e.L[p.iIssue].P<NOTE_60).length,premieresSousLigne:obs.filter(({e,p})=>e.L[p.iIssue].P<e.L[p.iIssue].ligne).length,
        cNonJugeableDerniere:obs.filter(({e,p})=>!e.L[p.iDerniere].juge).length,cNonJugeableMediane:obs.filter(({e,p})=>!e.L[p.iMediane].juge).length,tableaux};
    };
    return {ecran:analyser(r=>r.ecran),code:analyser(r=>r.cons)};
  },{coupes:plan.coupes,BORNES,NOTE_60});
  sortie[plan.t]={info:{grille:info.grille,groupes:info.gcs.length},lignes,synth}; nbErr+=erreurs(); await b.close();
  console.log('==',plan.t,info.grille,'groupes',info.gcs.length,JSON.stringify(lignes[lignes.length-1].minimums));
  lignes.forEach(l=>console.log(l.cut,'élèves',l.effectif,'copies',l.copies,'avec copie',l.avecCopie,'note (code)',l.avecNote,'note (écran)',l.avecNoteEcran,'non jugeables',l.sansJuge));
  for(const def of ['ecran','code']){ const {tableaux,...resume}=synth[def]; console.log('--',def,JSON.stringify(resume));
    for(const borne of BORNES)console.log(borne,JSON.stringify(tableaux['iDerniere|premiere|sous60'][borne])); }
}
ecrireAgregat('a-c-annoncent-la-note.json', sortie); console.log('erreurs',nbErr);
