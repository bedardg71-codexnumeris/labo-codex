/**
 * Banc partagé — le moteur « Par standards » (lots 3 et 4, 21 nov. 2026).
 *
 * `js/pratiques/note-cibles.js` lit deux fonctions qui vivent dans de gros fichiers : `ordonnerNiveauxParPlage`
 * (profil-etudiant-calculs.js, la seule source de l'ordre des niveaux) et `valeurNumeriqueDuNiveau` (echelles.js, la
 * valeur ponctuelle). Elles sont tirées ici du code RÉEL, par leur texte, sans monter les fichiers entiers : un banc qui
 * recopierait le tri pourrait diverger de l'application (le patron que #529 a défait).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function extraire(fichier, debut, fin, nom) {
    const source = readFileSync(path.join(RACINE, fichier), 'utf8');
    const i = source.indexOf(debut);
    const j = source.indexOf(fin, i + 1);
    if (i === -1 || j === -1) throw new Error(`moteur-cibles : ${nom} a bougé dans ${fichier}`);
    return new Function(source.substring(i, j) + `\nreturn ${nom};`)();
}

let cache = null;

/** `{ ordonnerNiveauxParPlage, valeurNumeriqueDuNiveau }`, les fonctions réelles. */
export function fonctionsDeLEchelle() {
    if (!cache) {
        cache = {
            ordonnerNiveauxParPlage: extraire('js/profil-etudiant-calculs.js', 'function ordonnerNiveauxParPlage(brut) {',
                '\n/**', 'ordonnerNiveauxParPlage'),
            valeurNumeriqueDuNiveau: extraire('js/echelles.js', 'function valeurNumeriqueDuNiveau(niveau) {',
                'const REFUS_VALEUR_NIVEAU', 'valeurNumeriqueDuNiveau')
        };
    }
    return cache;
}
