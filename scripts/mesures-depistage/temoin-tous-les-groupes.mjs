// Témoin du niveau RàI : la vue « tous les groupes » doit rendre, pour chaque élève, le même niveau que son groupe-cours.
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
    return { groupes: gcs.length, parGroupe: parGroupe.size, tous: liste.length, ecarts, signaux: signauxDeGroupeDepistage().map((s) => s.groupe !== null) };
  });
  nbErr += erreurs(); await b.close();
  console.log(plan.t, JSON.stringify(sortie[plan.t]));
}
ecrireAgregat('temoin-tous-les-groupes.json', sortie); console.log('erreurs', nbErr);
