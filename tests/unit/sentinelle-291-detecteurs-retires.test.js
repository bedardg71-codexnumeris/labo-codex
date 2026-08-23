import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE-CLIQUET — #291 Lot 2 · LES CINQ COPIES NE REVIENNENT PAS.
//
// `detecterDoublonsGrilles`, `…Cartouches`, `…Echelles`, `…Productions` et
// `…Pratiques` étaient CINQ COPIES DU MÊME CODE, à un nom de champ près
// ('nom' vs 'titre'). Toutes dédupliquaient par `id` avant de regrouper par
// nom, ce qui rendait la collision d'identifiant INVISIBLE et confondait une
// copie avec un homonyme légitime.
//
// Zéro-dette : un chantier RETIRE ce qu'il remplace. Elles ne sont pas
// enveloppées, elles sont supprimées, et `analyserDoublons`
// (js/identite-item.js) est désormais le seul chemin.
//
// ⚠ HORS PÉRIMÈTRE, ET CE N'EST PAS UN OUBLI : `detecterDoublonsStockage`
// (définie dans js/travaux-import.js, appelée depuis js/travaux-ui.js) traite
// les doublons de FICHIERS de travaux — autre modèle, autre UI, autre sujet.
// Un `grep detecterDoublons` trop large la faucherait.
//
// L'exception porte sur le SYMBOLE, pas sur un fichier : exempter
// travaux-import.js en entier y laisserait rentrer une sixième copie des cinq
// détecteurs sans que rien ne le dise. Ici, seul ce nom précis est toléré, où
// qu'il se trouve.
//
// BREAK-TEST (fait le 23 août 2026) — réintroduire dans js/grilles.js :
//   function detecterDoublonsGrilles(a, b) { return []; }
// → « aucune des cinq copies n'est revenue » ROUGIT en nommant grilles.js.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const dossierJs = path.join(racineProjet, 'js');

/** Le seul nom toléré de la famille `detecterDoublons*` — voir l'en-tête. */
const SYMBOLE_TOLERE = 'detecterDoublonsStockage';

/** Tous les .js de js/, récursivement, hors _archives. */
function fichiersJs(dossier = dossierJs, acc = []) {
    for (const entree of readdirSync(dossier)) {
        if (entree === '_archives') continue;
        const complet = path.join(dossier, entree);
        if (statSync(complet).isDirectory()) fichiersJs(complet, acc);
        else if (entree.endsWith('.js')) acc.push(complet);
    }
    return acc;
}

describe('#291 Lot 2 · les cinq détecteurs copiés-collés ne reviennent pas', () => {
    it('aucune des cinq copies n\'est revenue', () => {
        const coupables = [];
        for (const fichier of fichiersJs()) {
            const src = readFileSync(fichier, 'utf8');
            const trouve = (src.match(/detecterDoublons[A-Za-z]*/g) || [])
                .filter((symbole) => symbole !== SYMBOLE_TOLERE);
            if (trouve.length) {
                coupables.push(`${path.relative(racineProjet, fichier)} → ${[...new Set(trouve)].join(', ')}`);
            }
        }
        expect(
            coupables,
            'Passer par `analyserDoublons` (js/identite-item.js), qui ne déduplique pas ' +
            'par `id` et rend une catégorie. Occurrences trouvées :\n  ' + coupables.join('\n  ')
        ).toEqual([]);
    });

    it('l\'exception nommée existe toujours et reste hors périmètre', () => {
        // Si elle disparaissait ou changeait de nom, la tolérance ci-dessus
        // deviendrait une passoire silencieuse pour toute la famille.
        const src = readFileSync(path.join(dossierJs, 'travaux-import.js'), 'utf8');
        expect(src).toMatch(new RegExp('function ' + SYMBOLE_TOLERE + '\\('));
    });

    it('l\'export mort `window.detecterDoublonsProductions` a disparu', () => {
        const src = readFileSync(path.join(dossierJs, 'productions.js'), 'utf8');
        expect(src).not.toMatch(/window\.detecterDoublons/);
    });

    it('les cinq appelants passent bien par analyserDoublons + reunirSources', () => {
        // Énumérés au §4 du plan. Un appelant oublié casserait sa bibliothèque
        // en silence : `doublonsDetectes` vaudrait `undefined`.
        const appelants = {
            'grilles.js': 'nom',
            'cartouches.js': 'nom',
            'echelles.js': 'nom',
            'productions-bibliotheque-ui.js': 'titre',
            'pratiques-gestion.js': 'nom'
        };
        for (const [fichier, champ] of Object.entries(appelants)) {
            const src = readFileSync(path.join(dossierJs, fichier), 'utf8');
            expect(src, fichier).toMatch(/const doublonsDetectes = analyserDoublons\(/);
            expect(src, `${fichier} doit réunir les deux magasins`).toMatch(/analyserDoublons\(\s*\n?\s*reunirSources\(/);
            expect(src, `${fichier} doit analyser le champ « ${champ} »`)
                .toMatch(new RegExp(`reunirSources\\([^)]*\\),\\s*'${champ}'\\)`));
        }
    });

    it('les cinq bandeaux reçoivent la sélection ET les actions de leur famille', () => {
        // Sans `itemsSelection`, chaque ligne proposerait « Supprimer de la
        // bibliothèque partagée » pour un item qui est en fait dans la barre
        // latérale — le mauvais geste, proposé avec assurance.
        const attendus = {
            'grilles.js': 'retirerGrilleDeBibliotheque',
            'cartouches.js': 'retirerCartoucheDeBibliotheque',
            'echelles.js': 'retirerEchelleDeBibliotheque',
            'productions-bibliotheque-ui.js': 'retirerProductionDeBibliotheque',
            'pratiques-gestion.js': 'retirerPratiqueDeBibliothequeMateriel'
        };
        for (const [fichier, actionRetirer] of Object.entries(attendus)) {
            const src = readFileSync(path.join(dossierJs, fichier), 'utf8');
            expect(src, fichier).toMatch(/renderAvertissementDoublons\([^)]*,\s*\{/);
            expect(src, `${fichier} : itemsSelection manquant`).toMatch(/itemsSelection:/);
            expect(src, `${fichier} : action « Retirer » manquante`).toContain(actionRetirer);
        }
    });

    it('les cartouches passent leur grilleId en 2e paramètre', () => {
        // `retirerCartoucheDeBibliotheque(id, grilleId)` : le magasin est
        // `cartouches_<grilleId>`. Sans param2, l'action viserait la clé
        // `cartouches_undefined` et ne retirerait rien, en silence.
        const src = readFileSync(path.join(dossierJs, 'cartouches.js'), 'utf8');
        expect(src).toMatch(/champParam2:\s*'grilleId'/);
    });
});
