// Les présences déjà écrites pour des élèves exclus (#1196, 8 nov. 2026) : le STOCK que le correctif ne touche pas.
// Grégoire ne prend plus la présence d'un élève signalé inactif ; « Tous présents » et le premier geste d'une séance
// lui en écrivaient quand même jusqu'à b72e4c503. La date du signalement n'est pas dans le codex : on compte, pour
// chaque élève exclu (inactif, décrochage, abandon) et chaque groupe-cours, les fiches « présent » qui suivent sa
// dernière fiche « absent » (la traîne). C'est une BORNE HAUTE du stock suspect, pas un compte d'erreurs.
// Automne 2026 seulement : les trimestres précédents ne sont pas rouverts (décision de Grégoire, 1er sept. 2026).
// Sort des effectifs et des longueurs triées, sans identifiant ; aucun navigateur. Ne demande que `MESURE_CODEX`.
import { lireCodex } from './commun.mjs';

const T = 'a2026';
const codex = await lireCodex();
const etudiants = codex[`${T}_groupeEtudiants`] || [];
const presences = codex[`${T}_presences`] || [];
const exclu = (e) => ['inactif', 'décrochage', 'abandon'].includes(e && e.statut);
const present = (p) => (p.periodesPresentes ?? p.heures ?? 0) > 0;

const exclus = etudiants.filter(exclu);
const traines = [];
let fichesExclus = 0;
for (const e of exclus) {
    const siennes = presences.filter((p) => p.da === e.da && (!p.coursId || !e.coursId || p.coursId === e.coursId))
        .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    fichesExclus += siennes.length;
    let traine = 0;
    for (let i = siennes.length - 1; i >= 0 && present(siennes[i]) && siennes[i].facultatif !== true; i--) traine++;
    traines.push(traine);
}
traines.sort((a, b) => a - b);
console.log(JSON.stringify({
    trimestre: T,
    elevesExclus: exclus.length,
    parStatut: exclus.reduce((o, e) => (o[e.statut] = (o[e.statut] || 0) + 1, o), {}),
    fichesDesExclus: fichesExclus,
    fichesPresentEnTraine: traines.reduce((s, n) => s + n, 0),
    elevesAvecTraine: traines.filter((n) => n > 0).length,
    longueursDeTraine: traines
}, null, 1));
