// LES QUATRE PHRASES DU PARCOURS 3 APRÈS « PAR STANDARDS » (22 NOV. 2026 ; plans de travail/CONSIGNE-2026-11-22-
// parcours-apres-par-standards.md, section A). Depuis la 1.252.0, « Standards » s'appelle « Par sélection de productions »
// (SEL) ; « STD » et « Par standards » vont à la pratique des cibles. Quatre phrases écrites avant sont devenues fausses ;
// Grégoire a validé leurs remplaçantes mot pour mot. Les sentinelles des deux temps du parcours 3 lisent ICI, dans la
// consigne elle-même, ce que chaque repère (A1 à A4) remplace et par quoi : aucun texte recopié dans le test.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
// Même forme que les helpers du 18 et du 20 nov. (`lire`) : `plans de travail/` est dans le `paths-ignore` de la CI ; une
// consigne figée, validée mot pour mot, n'est plus modifiée seule (sentinelle-ci-paths-ignore : voir le rapport du lot).
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
export const CONSIGNE_22_NOV = lire('plans de travail/CONSIGNE-2026-11-22-parcours-apres-par-standards.md');

/** La section d'un repère de la consigne (« A1. », « B2. »…), jusqu'au repère suivant. */
export function sectionDu22(repere) {
    const i = CONSIGNE_22_NOV.indexOf('\n' + repere + ' ');
    if (i === -1) throw new Error('consigne du 22 nov. : « ' + repere + ' » introuvable');
    const reste = CONSIGNE_22_NOV.slice(i + 1);
    const fin = reste.slice(1).search(/\n[A-E]\d?\. /);
    return fin === -1 ? reste : reste.slice(0, fin + 1);
}

/** La citation qui s'ouvre à `i` (sur « ), guillemets emboîtés compris. */
function citationApres(texte, i) {
    let n = 0;
    for (let k = i; k < texte.length; k++) {
        if (texte[k] === '«') n++;
        if (texte[k] === '»') { n--; if (n === 0) return texte.slice(i + 1, k).trim(); }
    }
    throw new Error('citation non refermée : ' + texte.slice(i, i + 60));
}

/** La citation qui se ferme à `j` (sur »), guillemets emboîtés compris. */
function citationAvant(texte, j) {
    let n = 0;
    for (let k = j; k >= 0; k--) {
        if (texte[k] === '»') n++;
        if (texte[k] === '«') { n--; if (n === 0) return texte.slice(k + 1, j).trim(); }
    }
    throw new Error('citation non ouverte : ' + texte.slice(Math.max(0, j - 60), j + 1));
}

/** Ce que remplace un repère, lu dans la consigne : { avant, apres } autour du premier « devient : ». */
export function retoucheDu22(repere) {
    const s = sectionDu22(repere);
    const pivot = s.indexOf(' devient : «');
    if (pivot === -1) throw new Error(repere + ' : pas de « devient : »');
    return { repere, avant: citationAvant(s, pivot - 1), apres: citationApres(s, pivot + ' devient : '.length) };
}

/** Les quatre retouches de la section A. */
export const RETOUCHES_22_NOV = ['A1.', 'A2.', 'A3.', 'A4.'].map(retoucheDu22);

/**
 * Applique des retouches du 22 nov. à des lignes d'une consigne plus ancienne. Une ligne de liste n'a pas de point final :
 * la retouche s'y applique sans lui. Chaque retouche demandée doit trouver sa ligne (sinon, l'ancienne consigne a bougé).
 */
export function retoucherLignes22(lignes, reperes, aPlat) {
    const servies = new Set();
    const sortie = lignes.map((l) => {
        let neuve = l;
        RETOUCHES_22_NOV.filter((r) => reperes.includes(r.repere)).forEach((r) => {
            const avant = aPlat(r.avant), apres = aPlat(r.apres);
            const sansPoint = (x) => x.replace(/\.$/, '');
            if (neuve.includes(avant)) { neuve = neuve.replace(avant, apres); servies.add(r.repere); }
            else if (neuve === sansPoint(avant)) { neuve = sansPoint(apres); servies.add(r.repere); }
        });
        return neuve;
    });
    return { lignes: sortie, servies: [...servies].sort() };
}
