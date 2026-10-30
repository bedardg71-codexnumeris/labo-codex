// Le rejeu RàI sur le pack de démonstration (10 élèves fictifs), sans codex. Mode d'emploi : LISEZMOI.md.
import { ouvrirNavigateur, ecrireAgregat } from './commun.mjs';
const { b, page } = await ouvrirNavigateur();
await page.waitForFunction(() => window.PACK_DEMARRAGE, null, { timeout: 30000 });
await page.evaluate(() => db.setSync('backupNePlusRappeler', 'true'));
await page.evaluate(() => window.activerModeDemo()).catch((e) => console.log('activation :', e.message));
await page.waitForTimeout(5000);
await page.waitForFunction(() => window.dbReady === true && window.PACK_DEMARRAGE, null, { timeout: 30000 });
await page.waitForTimeout(1500);
const coupes = [];
for (let t = Date.parse('2025-08-31T23:00:00Z'); t <= Date.parse('2025-12-14T23:00:00Z'); t += 7*864e5) coupes.push(new Date(t).toISOString().slice(0,10));
coupes.push('2026-10-30');
const base = await page.evaluate(() => ({ evals: db.getSync(cle('evaluationsSauvegardees'),[]), pres: db.getSync(cle('presences'),[]), cleE: cle('evaluationsSauvegardees'), cleP: cle('presences'),
  datesEval: Object.entries((db.getSync(cle('evaluationsSauvegardees'),[])).reduce((a,e)=>{const k=e.productionNom;(a[k]=a[k]||[]).push((e.dateEvaluation||'').slice(0,10));return a;},{})).map(([k,v])=>[k,v.length,[...new Set(v)].sort().join(',')]) }));
console.log(base.cleE, base.cleP, base.evals.length, base.pres.length);
console.log(base.datesEval.map(x=>x.join(' : ')).join('\n'));
const sorties = [];
for (const coupe of coupes) {
  await page.clock.setFixedTime(new Date(coupe + 'T23:30:00'));
  const res = await page.evaluate(({coupe, evals, pres, cleE, cleP}) => {
    db.setSync(cleE, evals.filter(e => (e.dateEvaluation||'').slice(0,10) <= coupe));
    db.setSync(cleP, pres.filter(p => p.date <= coupe));
    calculerEtSauvegarderIndicesAssiduite();
    calculerEtStockerIndicesCP();
    const et = obtenirEtudiantsCoursActif().filter(e => !estEtudiantExclu(e));
    return et.map(e => {
      const i = calculerTousLesIndices(e.da), r = determinerNiveauRaiPedagogique(e.da), n = calculerIndicesNDerniersArtefacts(e.da, true);
      const moy = obtenirTypePratiqueActive()==='standards' ? calculerMoyennesCriteresRecents(e.da) : calculerMoyennesCriteres(e.da);
      const dg = diagnostiquerForcesChallenges(moy);
      return { da:e.da, A:i.A, C:i.C, P:i.P, nc:i.noteConstructible, niv:r.niveau, pat:r.pattern, nb:n.nbArtefacts, n3:n.performance, defi:dg.principalDefi?dg.principalDefi.nom:null, scoreDefi:dg.principalDefi?dg.principalDefi.score:null };
    });
  }, {coupe, ...base});
  sorties.push({coupe, res});
}
ecrireAgregat('rejeu-demo.json', sorties);
const med = a => { const s=[...a].sort((x,y)=>x-y); return s.length? (s.length%2? s[(s.length-1)/2] : (s[s.length/2-1]+s[s.length/2])/2):null; };
for (const {coupe,res} of sorties) {
  const c = v => res.filter(r=>r.niv===v).length;
  const ncs = res.filter(r=>r.nc && r.nb>0);
  const raison = {pers:0,p64:0,p75:0,emerg:0,defi:0,nondis:0};
  for (const r of res){ const P=r.P/100; if(r.niv===3){ if(r.pat==='Difficulté persistante') raison.pers++; else if (r.pat==='Non-participation') raison.nondis++; else raison.p64++; if(r.pat==='Difficulté persistante'&&r.nc&&P<.64) raison.p64both=(raison.p64both||0)+1; }
    if(r.niv===2){ if(r.nc&&P<.75) raison.p75++; if(r.pat==='Difficulté émergente') raison.emerg++; if(r.pat==='Défi spécifique') raison.defi++; } }
  console.log(coupe,'attente',c(0),'N1',c(1),'N2',c(2),'N3',c(3),'| copies',res.reduce((s,r)=>s+r.nb,0),'nbMoy',(res.reduce((s,r)=>s+r.nb,0)/res.length).toFixed(1),'| noteOK',res.filter(r=>r.nc).length,'| medP',ncs.length?med(ncs.map(r=>r.P)):'—','med3',res.some(r=>r.nb)?(med(res.filter(r=>r.nb).map(r=>r.n3))*100).toFixed(0):'—','| A',med(res.map(r=>r.A)),'C',med(res.filter(r=>r.C!=null).map(r=>r.C)),'|',JSON.stringify(raison),'|', res.map(r=>r.niv).join(''));
}
await b.close();
