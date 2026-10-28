import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');

// ↻ #1152, lot 3 (28 oct. 2026) : le glossaire statique de l'Aide est parti ; le seul glossaire est celui de
// js/accompagnement-contenu-terme.js, exécuté ici comme dans la page. Sa définition de PAN est le choix de Grégoire du
// 17 sept. (STD et SPE ; la dénotation est une PRÉN, badgée « PAN » par commodité) : « PAN – Dénotation » ne s'exige plus
// (décision de la consigne CONSIGNE-LOT-2026-10-28-aide-lot-3-un-seul-glossaire.md, §2.2).
const TERMES = {};
vm.runInNewContext(readFileSync(path.join(racine, 'js', 'accompagnement-contenu-terme.js'), 'utf8'),
    { window: { accompagnement: { ajouterEntrees: (e) => Object.assign(TERMES, e) } } });
const definition = (cle) => TERMES['terme-' + cle].terme.definition;

// SENTINELLE — #803 — l'Aide présentait « les N meilleurs artefacts » comme LA
// règle des PAN. Or PAN est une FAMILLE de pratiques (STD, SPE, DEN), et « les N
// meilleurs » n'est qu'une modalité de sélection parmi celles qu'offre l'écran.
//
// Pourquoi une sentinelle de MOTIF plutôt que deux assertions ponctuelles : la
// fiche #803 nommait deux lignes du glossaire, corrigées en 1.126.1 — et
// l'affirmation a survécu dans deux AUTRES endroits que la fiche ne visait pas
// (l'astuce du guide de profil, et l'entrée « Artefact » du même glossaire,
// trois entrées plus haut). Corriger par ligne citée laisse l'erreur ailleurs.
// Ce banc balaie donc toute la section Aide.
//
// ⛔ HORS PÉRIMÈTRE, VOLONTAIREMENT : ce banc ne compare PAS les modalités de
// l'écran à celles du moteur. Elles divergent réellement (l'écran écrit
// « derniers » / « hybride », `portfolio.js` ne connaît que « recents » /
// « recents-meilleurs » et retombe sur « meilleurs »). Figer cet état ici
// graverait le défaut au lieu de le signaler : il a son propre item.

function sectionAide(source) {
    const debut = source.indexOf('id="section-aide"');
    const fin = source.indexOf('fin section-aide');
    if (debut === -1 || fin === -1 || fin <= debut) {
        throw new Error('bornes de la section Aide introuvables dans index.html');
    }
    return source.slice(debut, fin);
}

const AIDE = sectionAide(html);

describe('#803 — l\'Aide dit que PAN est une famille, pas une mécanique', () => {

    it('aucun texte de l\'Aide ne présente « les N meilleurs » comme LA règle PAN', () => {
        expect(AIDE).not.toMatch(/règles PAN/i);
        expect(AIDE).not.toMatch(/sélectionnés? automatiquement par les règles/i);
    });

    it('le glossaire définit PAN par des pratiques, pas par une mécanique', () => {
        expect(AIDE).not.toContain('PAN (Pratique Alternative de Notation)');
        const pan = definition('pan-pratique-alternative-de-notation');
        expect(pan).toMatch(/Standards \(STD\) et Spécifications \(SPE\)/);
        expect(pan).toMatch(/La Dénotation \(DEN\) est une PRÉN/);
        expect(pan).not.toMatch(/N meilleurs/);
    });

    it('la sélection est rattachée à la pratique réglée, jamais à une valeur figée', () => {
        expect(AIDE).toMatch(/modalité réglée dans ta pratique/);
        expect(definition('artefact')).toMatch(/modalité de sélection que tu as réglée/);
        // L'erreur #803 était restée dans ce glossaire-ci (Portfolio, Artefact) : `sentinelle-803` ne lisait que l'Aide.
        for (const [cle, entree] of Object.entries(TERMES)) {
            expect(entree.terme.definition, cle).not.toMatch(/meilleurs sont retenus|N meilleures démonstrations|retient les meilleures/);
        }
    });

    it('l\'Aide n\'attribue aucune étoile aux artefacts retenus', () => {
        // ★ (U+2605) et ⭐ (U+2B50) coexistent selon l'écran
        // (profil-etudiant-sections-affichage.js:740-741 et :3773-3774) et marquent
        // TOUS DEUX un jeton de reprise ou de délai — jamais la sélection du
        // portfolio, qui se rend par le tri, l'opacité (1 vs 0.6) et la bordure
        // (3px vs 2px). L'Aide l'affirmait à TROIS endroits du même accordéon.
        //
        // Les balises sont retirées AVANT le découpage : sur du HTML brut, une
        // « phrase » agglomère des passages sans rapport et le banc rougit à tort.
        const texte = AIDE.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
        const phrases = texte.split(/(?<=[.!?])\s+/).filter(p => /[★⭐]/.test(p));
        for (const phrase of phrases) {
            if (/retenu|sélectionn|comptent/i.test(phrase)) {
                expect(phrase).toMatch(/jeton/i);
            }
        }
        // Et la mise en garde qui dit ce que l'étoile signifie VRAIMENT doit
        // rester : sans elle, ce banc passerait par simple absence de sujet.
        expect(texte).toMatch(/L'étoile[^.]*jeton de reprise ou de délai/);
    });
});
