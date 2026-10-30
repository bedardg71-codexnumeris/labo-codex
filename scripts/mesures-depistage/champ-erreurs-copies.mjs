// Sous quel nom les copies de G5M et de G1A stockent leur compte d'erreurs (lecture du signalement, 30 oct. 2026) :
// les seuls NOMS de champs, comptés ; ni valeur, ni élève, et aucun navigateur. Mode d'emploi : LISEZMOI.md.
import { lireCodex } from './commun.mjs';
const codex = await lireCodex();
const grilles = codex.a2026_grillesTemplates, copies = codex.a2026_evaluationsSauvegardees;
for (const re of [/^G5M\b/, /^G1A\b/]) {
    const g = grilles.find((x) => re.test(x.nom || ''));
    const formes = {};
    copies.filter((e) => e.grilleId === g.id).forEach((e) => Object.values(e.donneesAlgorithmiques || {}).forEach((d) => {
        const k = Object.keys(d).sort().join(', '); formes[k] = (formes[k] || 0) + 1;
    }));
    console.log(g.nom.split(' ')[0], JSON.stringify(formes));
}
