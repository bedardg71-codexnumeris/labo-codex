// Témoin du niveau RàI : la vue « tous les groupes » doit rendre, pour chaque élève, le même niveau que son groupe-cours ;
// le coût d'un passage sur le groupe ; la phrase sous la barre, dans l'écran réel.
// Sort des effectifs seulement. Mode d'emploi : LISEZMOI.md.
import { ouvrir, basculer, lireCodex, ecrireAgregat, PLANS } from './commun.mjs';
const codex = await lireCodex();
const sortie = {}; let nbErr = 0;
for (const plan of PLANS.filter((p) => p.t === 'h2026')) {
  const { b, page, erreurs } = await ouvrir(codex);
  await page.clock.setFixedTime(new Date('2026-10-30T12:00:00'));
  await basculer(page, plan.t);
  sortie[plan.t] = await page.evaluate(async () => {
    const gcs = db.getSync(cle('groupesCours'), []).map((g) => g.id);
    const parGroupe = new Map();
    for (const gc of gcs) { await changerGroupeCoursActifV2(gc); calculerEtSauvegarderIndicesAssiduite(); calculerEtStockerIndicesCP();
      obtenirEtudiantsCoursActif().filter((e) => !estEtudiantExclu(e)).forEach((e) => parGroupe.set(e.da, determinerNiveauRaiPedagogique(e.da).niveau)); }
    const info = db.getSync('infoCours', null);
    db.setSync('infoCours', Object.assign({}, info, { groupe: null, _modeCours: true }));
    const liste = obtenirEtudiantsCoursActif().filter((e) => !estEtudiantExclu(e));
    const ecarts = liste.filter((e) => determinerNiveauRaiPedagogique(e.da).niveau !== parGroupe.get(e.da)).length;
    // Le coût d'un passage sur tout le groupe, hors lot et dans un lot de calculs.
    const chrono = (f) => { const t = performance.now(); f(); return Math.round(performance.now() - t); };
    const passage = () => liste.forEach((e) => determinerNiveauRaiPedagogique(e.da));
    const horsLot = chrono(passage);
    demarrerCacheLecture(); const dansUnLot = chrono(passage); terminerCacheLecture();
    db.setSync('infoCours', info);
    return { groupes: gcs.length, parGroupe: parGroupe.size, tous: liste.length, ecarts, msHorsLot: horsLot, msDansUnLot: dansUnLot };
  });
  // La phrase sous la barre, dans l'écran réel, à une date où un groupe est sous la note de passage, puis aujourd'hui.
  const phrase = () => page.evaluate(async () => {
    const gc = db.getSync(cle('groupesCours'), [])[0].id; await changerGroupeCoursActifV2(gc);
    naviguerVers('tableau-bord', 'apercu'); await new Promise((r) => setTimeout(r, 1500));
    const b = document.querySelector('.barre-rai-container');
    return { barre: !!b, signal: !!b && b.textContent.includes('est sous la note de passage') };
  });
  sortie[plan.t].phraseAujourdhui = await phrase();
  await page.evaluate(() => { const ev = db.getSync(cle('evaluationsSauvegardees'), []); db.setSync(cle('evaluationsSauvegardees'), ev.filter((e) => (e.dateEvaluation || '').slice(0, 10) <= '2026-03-22').map((e) => { const c = Object.assign({}, e); delete c.remplaceeParId; return c; })); });
  sortie[plan.t].phraseLe22Mars = await phrase();
  nbErr += erreurs(); await b.close();
  console.log(plan.t, JSON.stringify(sortie[plan.t]));
}
ecrireAgregat('temoin-tous-les-groupes.json', sortie); console.log('erreurs', nbErr);
