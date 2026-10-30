// Pourquoi aucun signalement ne se lève en A2026 (lot 3 des seuils, 30 oct. 2026) : les copies de la production diagnostique,
// la grille qui porte un palier coché, et les paliers que rendent ses copies. Sort des effectifs seulement. Mode d'emploi : LISEZMOI.md.
import { ouvrir, basculer, lireCodex } from './commun.mjs';
const codex = await lireCodex();
const { b, page } = await ouvrir(codex);
await page.clock.setFixedTime(new Date('2026-10-30T12:00:00'));
await basculer(page, 'a2026');
const r = await page.evaluate(async () => {
  const gcs=db.getSync(cle('groupesCours'),[]).map(g=>g.id); await changerGroupeCoursActifV2(gcs[0]);
  const ev=db.getSync(cle('evaluationsSauvegardees'),[]), gr=db.getSync(cle('grillesTemplates'),[]);
  const cochees=new Set(gr.filter(g=>JSON.stringify(g).includes('"leveSignalement":true')).map(g=>g.id));
  const prods=db.getSync(cle('productions'),[]); const diag=prods.filter(p=>!window.ProductionDiagnostique.filtrerProductions([p]).length).map(p=>p.id);
  const c={evalsDiag:ev.filter(e=>diag.includes(e.productionId)).length,evalsDiagGrilleCochee:ev.filter(e=>diag.includes(e.productionId)&&cochees.has(e.grilleId)).length,evalsDiagAlgo:ev.filter(e=>diag.includes(e.productionId)&&e.donneesAlgorithmiques).length,entre:0,applicable:0,leve:0,libelle:0,paliers:{},reel:0};
  ev.filter(e=>cochees.has(e.grilleId)&&e.donneesAlgorithmiques).forEach(e=>{ if(window.evaluationEntreDansLaNote(e))c.entre++; const g=gr.find(x=>x.id===e.grilleId);
    Object.keys(e.donneesAlgorithmiques).forEach(id=>{const k=(g.criteres||[]).find(x=>x.id===id); if(!k)return; const s=e.donneesAlgorithmiques[id]||{}; const x=window.projectionAlgo.calculer(k,{erreurs:s.totalErreurs,mots:s.mots}); if(!x||!x.applicable)return; c.applicable++; const cl=(x.palier&&x.palier.cle)||'?'; c.paliers[cl]=(c.paliers[cl]||0)+1; if(x.palier&&x.palier.leveSignalement===true){c.leve++; if(x.params&&String(x.params.libelleSignalement||'').trim())c.libelle++;}}); });
  const et=obtenirEtudiantsCoursActif();
  c.reel=window.SignalementDepistage.pourGroupe(et,{evaluations:obtenirDonneesSelonMode('evaluationsSauvegardees')||[],grilles:gr}).total;
  c.eleves=et.length; return c; });
console.log(JSON.stringify(r)); await b.close();
