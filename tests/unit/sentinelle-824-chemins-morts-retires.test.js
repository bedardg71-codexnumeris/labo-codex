/**
 * SENTINELLE #824 — LES CINQ CHEMINS MORTS SOUS LES RÉGLAGES DU DÉPISTAGE SONT
 * PARTIS D'UN BLOC, ET CE QUI DEVAIT RESTER EST RESTÉ.
 *
 * Carte des effets du 10 septembre 2026 (§ 4.3 du cadrage de l'écran de réglage) :
 * cinq lecteurs des seuils n'atteignaient aucun rendu. Remesurés le 11 septembre,
 * un par un, dans `js/`, `index.html` et `tests/` — y compris sous forme de chaîne
 * (appel dynamique, `data-action`) : aucun appelant. Retirés avec leurs helpers
 * sans autre appelant (`obtenirCouleurIndice`, `appliquerStyleDataset`).
 *
 * ⚠ LA LEÇON DU 10 SEPTEMBRE (un « mort » sur quatre était vivant) a été appliquée :
 * `identifierDefiSpecifique` n'est PAS retirée — seul son appel au résultat non lu
 * l'est. Trois sentinelles l'exécutent (#529, #730, audit Suivi du 5 sept.).
 * Et les cinq `identifierPattern` des pratiques, gardés « délibérément » par #551,
 * ne bougent pas.
 *
 * Ce que ce banc garde : (1) aucun des cinq noms ne revient — ni défini, ni appelé ;
 * (2) `case 'cible'` ne renaît pas dans le profil ; (3) ce qui reste reste.
 *
 * Break-test (11 sept.) : remettre `window.creerGraphiqueGroupeMoyennes = …` dans
 * graphiques-progression.js → cas 1 rougit ; retirer `identifierDefiSpecifique` de
 * calculs.js → cas 3 rougit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function sansCommentaires(code) {
    return code.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
}
function listerJs(dossier) {
    const out = [];
    for (const entree of readdirSync(dossier)) {
        const complet = path.join(dossier, entree);
        if (statSync(complet).isDirectory()) out.push(...listerJs(complet));
        else if (entree.endsWith('.js') && entree !== 'pack-demo-10.js') out.push(complet);
    }
    return out;
}
const SOURCES = [...listerJs(path.join(racine, 'js')), path.join(racine, 'index.html')]
    .map((f) => ({ fichier: path.relative(racine, f), code: sansCommentaires(readFileSync(f, 'utf8')) }));

const RETIRES = [
    'genererTableauObjectifs',
    'genererDiagnosticCriteres',
    'genererDiagnosticSRPNF',
    'genererDiagnosticGenerique',
    'creerGraphiqueGroupeMoyennes',
    'genererContenuCibleIntervention',
    'obtenirCouleurIndice',
    'appliquerStyleDataset'
];

describe('#824 · les chemins morts sous les réglages du dépistage', () => {

    it('1. aucun des noms retirés ne survit dans js/ ni dans index.html — ni défini, ni appelé, ni en chaîne', () => {
        const survivants = [];
        for (const { fichier, code } of SOURCES) {
            for (const nom of RETIRES) {
                if (code.includes(nom)) survivants.push(`${fichier} : ${nom}`);
            }
        }
        expect(survivants, 'un chemin mort est revenu').toEqual([]);
    });

    it('2. le profil ne connaît plus la section « cible » (elle appelait une fonction définie nulle part)', () => {
        const code = SOURCES.find((s) => s.fichier === 'js/profil-etudiant-sections-affichage.js').code;
        expect(code.includes("case 'cible'"), '`case \'cible\'` est revenu').toBe(false);
        expect(code.includes("section === 'cible'"), 'une branche « cible » est revenue').toBe(false);
        // Témoin : les sections voisines, elles, sont bien là — le retrait n'a pas emporté le switch.
        for (const s of ['productions', 'progression', 'performance', 'mobilisation']) {
            expect(code.includes(`case '${s}'`), `la section « ${s} » a disparu`).toBe(true);
        }
    });

    it('3. ce qui devait rester est resté : identifierDefiSpecifique, detecterDefis, et les cinq identifierPattern de #551', () => {
        const calculs = SOURCES.find((s) => s.fichier === 'js/profil-etudiant-calculs.js').code;
        expect(calculs).toMatch(/^function identifierDefiSpecifique\(da\)/m);
        expect(calculs).toMatch(/window\.identifierDefiSpecifique\s*=\s*identifierDefiSpecifique/);
        // L'appel au résultat non lu, lui, est parti : plus aucun `identifierDefiSpecifique(da)` hors de sa définition et de son export.
        const affichage = SOURCES.find((s) => s.fichier === 'js/profil-etudiant-sections-affichage.js').code;
        expect(affichage.includes('identifierDefiSpecifique('), 'l\'appel mort est revenu dans le profil').toBe(false);

        const pratiques = SOURCES.filter((s) => s.fichier.startsWith('js/pratiques/'));
        const detecterDefis = pratiques.filter((s) => /^\s*detecterDefis\(da\)\s*\{/m.test(s.code)).length;
        const identifierPattern = pratiques.filter((s) => /^\s*identifierPattern\(da\)\s*\{/m.test(s.code)).length;
        // #469 (lot 12, 11 oct. 2026) : 5 → 4, la pratique factice « test » (`pratique-test.js`) est retirée.
        expect(detecterDefis, 'des `detecterDefis` de pratiques ont disparu').toBeGreaterThanOrEqual(4);
        expect(identifierPattern, 'les `identifierPattern` gardés par #551 ont bougé').toBe(4);
        const standards = pratiques.find((s) => s.fichier.endsWith('pratique-pan-standards.js')).code;
        expect(standards).toMatch(/_diagnostiquerForcesChallenges\(moyennes\)\s*\{/);
    });

    it('4. le canevas des moyennes du groupe a toujours un dessinateur — le spaghetti, pas la fonction retirée', () => {
        const html = SOURCES.find((s) => s.fichier === 'index.html').code;
        expect(html.includes('id="graphique-groupe-moyennes"')).toBe(true);
        const graphiques = SOURCES.find((s) => s.fichier === 'js/graphiques-progression.js').code;
        expect(graphiques).toMatch(/creerGraphiqueGroupeSpaghettiACP\('graphique-groupe-moyennes'/);
    });
});
