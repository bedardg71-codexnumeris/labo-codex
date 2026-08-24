import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE-CLIQUET — #476 volet 2, Lot A · LES DEUX CHEMINS MORTS NE
// REVIENNENT PAS.
//
// Le volet 2 fusionne les fonctions `dupliquer*` des cinq familles de
// bibliothèque. Le relevé d'ouverture (24 août 2026) en a trouvé DEUX que
// personne ne pouvait atteindre — les fusionner aurait été porter du code
// mort dans le code neuf :
//
//   · `dupliquerGrilleActuelle` (js/grilles.js) — AUCUN appelant. Ni
//     data-action, ni bouton, ni appel direct. Sa seule trace était une
//     mention dans l'en-tête de module et une entrée dans noms_stables.json.
//
//   · `dupliquerEchelleActuelle` (js/echelles.js) — câblée au seul bouton
//     index.html:5242, en `style="display: none;"`. Ce bouton portait
//     `id="btnDupliquerEchelle"`, DÉJÀ pris par index.html:5094. Comme
//     `getElementById` rend le PREMIER élément, les trois sites qui
//     démasquent ce bouton (echelles.js:574, :2778, :3078) touchaient
//     toujours celui de 5094 — câblé, lui, sur `dupliquerEchelleActive`.
//     Le bouton de 5242 ne pouvait donc jamais paraître.
//
// ⚠ CE QUE CE RETRAIT NE RETIRE PAS. Le chemin « dupliquer l'item en cours
// d'édition » reste servi, dans les deux familles, par `dupliquerGrilleActive`
// et `dupliquerEchelleActive` — câblés, visibles, et inchangés. Le retrait ne
// coûte aucune fonctionnalité à Grégoire ; il retire deux impasses.
//
// ▣ L'IRONIE À NE PAS REJOUER. Le Lot 5 de #476 (23 août) a corrigé un « bug
// latent » dans CHACUNE de ces deux fonctions — collection hors de portée dans
// l'une, zone morte temporelle du `let` dans l'autre. Deux corrections sur du
// code qu'aucun utilisateur ne pouvait exécuter. Mesurer l'atteignabilité AVANT
// de corriger, pas après.
//
// Zéro-dette : un chantier RETIRE ce qu'il remplace. Autorisation de Grégoire
// obtenue le 24 août 2026 pour l'entrée correspondante de noms_stables.json
// (zone protégée par CLAUDE.md).
//
// BREAK-TESTS (faits le 24 août 2026, les quatre rouges obtenus puis restaurés) :
//  (a) réintroduire `async function dupliquerGrilleActuelle() {}` dans
//      js/grilles.js → « aucun des deux chemins morts n'est revenu » ROUGIT
//      en nommant grilles.js ;
//  (b) réintroduire `data-action="dupliquerEchelleActuelle"` dans index.html
//      → « aucun bouton ne rappelle un chemin mort » ROUGIT ;
//  (c) remettre un second `id="btnDupliquerEchelle"` dans index.html →
//      « btnDupliquerEchelle est unique » ROUGIT en annonçant 2 ;
//  (d) remettre la ligne `dupliquerGrilleActuelle` dans noms_stables.json →
//      « le registre ne liste plus le chemin retiré » ROUGIT.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const dossierJs = path.join(racineProjet, 'js');

/** Les deux noms retirés. Aucun ne doit reparaître, où que ce soit. */
const CHEMINS_MORTS = ['dupliquerGrilleActuelle', 'dupliquerEchelleActuelle'];

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

const lireIndex = () => readFileSync(path.join(racineProjet, 'index.html'), 'utf8');

describe('#476 volet 2 Lot A · les deux chemins morts ne reviennent pas', () => {
    it('aucun des deux chemins morts n\'est revenu dans js/', () => {
        const coupables = [];
        for (const fichier of fichiersJs()) {
            const src = readFileSync(fichier, 'utf8');
            for (const mort of CHEMINS_MORTS) {
                if (new RegExp('\\b' + mort + '\\b').test(src)) {
                    coupables.push(`${path.relative(racineProjet, fichier)} → ${mort}`);
                }
            }
        }
        expect(coupables, 'chemin mort réintroduit').toEqual([]);
    });

    it('aucun bouton ne rappelle un chemin mort', () => {
        const html = lireIndex();
        for (const mort of CHEMINS_MORTS) {
            expect(html, `index.html rappelle ${mort}`).not.toMatch(new RegExp('\\b' + mort + '\\b'));
        }
    });

    it('btnDupliquerEchelle est unique — l\'ID dupliqué ne revient pas', () => {
        // La cause racine de l'inatteignabilité : deux éléments, un seul ID.
        const occurrences = (lireIndex().match(/id="btnDupliquerEchelle"/g) || []).length;
        expect(occurrences, 'btnDupliquerEchelle doit apparaître exactement une fois').toBe(1);
    });

    it('le registre des noms protégés ne liste plus le chemin retiré', () => {
        const registre = readFileSync(path.join(racineProjet, 'noms_stables.json'), 'utf8');
        expect(registre, 'noms_stables.json liste encore dupliquerGrilleActuelle')
            .not.toMatch(/dupliquerGrilleActuelle/);
        // Le registre reste du JSON valide après retrait de l'entrée.
        expect(() => JSON.parse(registre)).not.toThrow();
    });

    it('le chemin de remplacement, lui, est bien là', () => {
        // Un retrait qui emporterait AUSSI le chemin vivant serait une
        // régression, pas un nettoyage. On le verrouille explicitement.
        const html = lireIndex();
        expect(html, 'le bouton Dupliquer de l\'éditeur de grille a disparu')
            .toMatch(/data-action="dupliquerGrilleActive"/);
        expect(html, 'le bouton Dupliquer de l\'éditeur d\'échelle a disparu')
            .toMatch(/data-action="dupliquerEchelleActive"/);
        expect(readFileSync(path.join(dossierJs, 'grilles.js'), 'utf8'))
            .toMatch(/function dupliquerGrilleActive\s*\(/);
        expect(readFileSync(path.join(dossierJs, 'echelles.js'), 'utf8'))
            .toMatch(/function dupliquerEchelleActive\s*\(/);
    });
});
