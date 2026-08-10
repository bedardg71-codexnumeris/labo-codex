import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE #155 — les sous-sections de Conception sont des SŒURS,
// jamais des poupées russes
// =======================================================================
//
// Terrain du 10 août 2026 (Grégoire, portes 1.64) : TOUTES les pages de
// Conception sauf la Carte rendaient VIDE — pas d'erreur console, le HTML
// était là (276 Ko dans le DOM), mais invisible. Cause : le retrait de la
// page « Plan de la leçon » (#424 Lot G, 8 août) a emporté les fermetures
// de `planif-zone-wrapper`, `planif-wrapper` et `conception-carte`. Le
// parseur HTML a alors IMBRIQUÉ les cinq sous-sections suivantes dans
// `conception-carte` : activer « Pratiques de notation » la rendait
// display:block… à l'intérieur d'un ancêtre display:none.
//
// Le même retrait a supprimé le span `planif-zoom-info` dont le
// commentaire disait pourtant « conservé pour compatibilité JS » —
// six lecteurs dans planification-carte.js.
//
// Ce qui est verrouillé :
//   A. entre l'ouverture d'une sous-section de Conception et l'ouverture
//      de la suivante, le solde <div>/</div> est NUL (commentaires HTML
//      exclus du compte) — une sous-section se ferme avant que sa sœur
//      commence ;
//   B. le span `planif-zoom-info` existe dans index.html tant que du JS
//      le lit.
//
// ⚠ Pourquoi un test STATIQUE : le défaut est invisible de Vitest en DOM
// (pas de navigateur) et les specs Playwright sont WebKit-only, non
// exécutables en conteneur. Le solde de balises est le signal le plus
// précoce — il rougit au commit, pas au terrain. (Défense F : même
// philosophie que le lint innerHTML.)

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const brut = readFileSync(path.join(racine, 'index.html'), 'utf8');
// Les commentaires HTML peuvent contenir « <div » (doc, exemples) : on les
// retire AVANT de compter, sinon le solde ment dans les deux sens.
const html = brut.replace(/<!--[\s\S]*?-->/g, '');

/** Ouvertures des sous-sections de la section Conception, dans l'ordre. */
function sousSections() {
    const re = /<div\s+id="(conception-[a-z-]+)"\s+class="sous-section"/g;
    const out = [];
    let m;
    while ((m = re.exec(html)) !== null) out.push({ id: m[1], index: m.index });
    return out;
}

function solde(texte) {
    const ouv = (texte.match(/<div\b/g) || []).length;
    const fer = (texte.match(/<\/div>/g) || []).length;
    return ouv - fer;
}

describe('#155 · A — chaque sous-section de Conception se ferme avant la suivante', () => {
    const sections = sousSections();

    it('le harnais a un sujet : au moins 5 sous-sections trouvées', () => {
        // Si le motif d'ouverture change (classe renommée, ordre id/class
        // inversé), ce test-ci rougit AVANT que les suivants passent par
        // vacuité.
        expect(sections.length, sections.map(s => s.id).join(' · ')).toBeGreaterThanOrEqual(5);
        expect(sections.some(s => s.id === 'conception-carte')).toBe(true);
    });

    for (let i = 0; i < 8; i++) {
        it(`sous-section ${i + 1} : solde de <div> nul jusqu'à la sœur suivante`, () => {
            const sections2 = sousSections();
            if (i + 1 >= sections2.length) return; // dernière : pas de sœur
            const zone = html.slice(sections2[i].index, sections2[i + 1].index);
            expect(solde(zone),
                `${sections2[i].id} n'est pas refermée avant ${sections2[i + 1].id} — ` +
                `le parseur imbriquera la suivante (pages vides, cf. #155)`).toBe(0);
        });
    }
});

describe('#155 · B — le span planif-zoom-info suit ses lecteurs JS', () => {
    it('index.html porte le span tant que planification-carte.js le lit', () => {
        const js = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
        const aDesLecteurs = js.includes("getElementById('planif-zoom-info')");
        if (!aDesLecteurs) return; // plus de lecteur : le span peut partir
        expect(brut.includes('id="planif-zoom-info"'),
            'planif-zoom-info a des lecteurs JS mais n\'existe plus dans index.html').toBe(true);
    });
});
