import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// Sentinelle — la section « Importer depuis un autre trimestre » survit à l'import
// (24 août 2026).
//
// Retour de Grégoire : « la section se referme aussitôt que je clique pour importer
// une cartouche. Je dois l'ouvrir à chaque cartouche. » Le défaut était le même dans
// les CINQ bibliothèques : importer rafraîchit la liste en reconstruisant le modal,
// et le trimestre choisi, l'aperçu déplié et le défilement partaient avec l'ancien DOM.
//
// Aucun test de logique pure ne peut voir ça : c'est du DOM détruit puis recréé.

async function ouvrir(page) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
}

const SEMER_CARTOUCHES = `async () => {
    db.setSync('trimestres', [
        { id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true },
        { id: 'h2026', nom: 'Hiver 2026', annee: 2026, session: 'H', actif: false }
    ]);
    db.setSync('trimestreActif', 'a2026');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set('a2026_grillesTemplates', []);
    await db.set('h2026_grillesTemplates', [{ id: 'GR_H26', nom: 'Grille-5 FR-HOLIS H26', criteres: [], dansBibliotheque: true }]);
    // Assez de cartouches pour que le modal défile réellement.
    await db.set(cleSource('cartouches_GR_H26', 'h2026'), Array.from({ length: 15 }, (_, i) => ({
        id: 'C' + i, nom: 'Cartouche ' + i, grilleId: 'GR_H26', commentaires: {}
    })));
}`;

// ↻ #1155 (25 oct. 2026) — RÉANCRÉ : la bibliothèque des cartouches passe en deux colonnes. La section
// d'import y est un repli (`<details data-repli="import-trimestre">`, fermé par défaut) au pied de
// « Dans ce trimestre » : l'enseignant l'ouvre d'abord, et le repli ouvert fait partie de ce qui doit
// survivre (`_capturerDeuxColonnes`). La fenêtre étant plus large et plus haute, la page est réduite à
// 560 px de haut pour qu'elle défile réellement. La garantie éprouvée ne change pas.
test('PREUVE · cartouches · après un import, le trimestre, l\'aperçu et le défilement sont conservés', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 560 });
    await ouvrir(page);
    const r = await page.evaluate(async (semer) => {
        await eval(semer)();
        await afficherBibliothequeCartouches();
        await new Promise(res => setTimeout(res, 400));

        // L'enseignant ouvre la section, choisit son trimestre, déplie l'aperçu, puis fait défiler.
        document.querySelector('#modalBibliothequeCartouches details[data-repli="import-trimestre"]').open = true;
        document.getElementById('selectTrimestreImportCartouches').value = 'h2026';
        await afficherCartouchesTrimestreModal();
        await new Promise(res => setTimeout(res, 300));

        const contenu = document.querySelector('#modalBibliothequeCartouches .modal-js-contenu');
        contenu.scrollTop = 220;
        const defilementAvant = contenu.scrollTop;

        // ... et il clique « Importer » sur une cartouche.
        await importerUneCartoucheTrimestre('h2026', 'GR_H26', 'C3');
        await new Promise(res => setTimeout(res, 600));

        const select = document.getElementById('selectTrimestreImportCartouches');
        const apercu = document.getElementById('previewCartouchesTrimestre');
        const contenuApres = document.querySelector('#modalBibliothequeCartouches .modal-js-contenu');
        const repli = document.querySelector('#modalBibliothequeCartouches details[data-repli="import-trimestre"]');
        return {
            repliOuvert: !!(repli && repli.open),
            defilementAvant,
            trimestreConserve: select ? select.value : null,
            apercuOuvert: !!(apercu && !apercu.classList.contains('u-hide')),
            apercuGarni: apercu ? apercu.querySelectorAll('[data-action="importerUneCartoucheTrimestre"]').length : 0,
            defilementApres: contenuApres ? contenuApres.scrollTop : -1
        };
    }, SEMER_CARTOUCHES);

    console.log('CARTOUCHES →', JSON.stringify(r, null, 1));
    expect(r.defilementAvant, 'le modal défile bien dans ce montage').toBeGreaterThan(0);
    expect(r.repliOuvert, 'la section d\'import reste ouverte').toBe(true);
    expect(r.trimestreConserve, 'le trimestre choisi est conservé').toBe('h2026');
    expect(r.apercuOuvert, 'l\'aperçu est toujours déplié — c\'est la plainte').toBe(true);
    expect(r.apercuGarni, 'et il est réellement garni, pas juste visible').toBeGreaterThan(0);
    expect(r.defilementApres, 'la position de défilement est reposée').toBe(r.defilementAvant);
});

test('PREUVE · cartouches · un aperçu REPLIÉ ne se rouvre pas tout seul', async ({ page }) => {
    await ouvrir(page);
    const r = await page.evaluate(async (semer) => {
        await eval(semer)();
        await afficherBibliothequeCartouches();
        await new Promise(res => setTimeout(res, 400));
        // Trimestre choisi, mais l'aperçu n'a JAMAIS été ouvert.
        document.getElementById('selectTrimestreImportCartouches').value = 'h2026';

        await importerUneCartoucheTrimestre('h2026', 'GR_H26', 'C3');
        await new Promise(res => setTimeout(res, 600));

        const apercu = document.getElementById('previewCartouchesTrimestre');
        return {
            trimestreConserve: document.getElementById('selectTrimestreImportCartouches').value,
            apercuOuvert: !!(apercu && !apercu.classList.contains('u-hide'))
        };
    }, SEMER_CARTOUCHES);

    console.log('APERÇU REPLIÉ →', JSON.stringify(r));
    expect(r.trimestreConserve, 'le trimestre reste choisi').toBe('h2026');
    expect(r.apercuOuvert, 'on repose ce qui était à l\'écran, jamais davantage').toBe(false);
});

test('PREUVE · grilles · même garantie, même helper', async ({ page }) => {
    await ouvrir(page);
    const r = await page.evaluate(async () => {
        db.setSync('trimestres', [
            { id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true },
            { id: 'h2026', nom: 'Hiver 2026', annee: 2026, session: 'H', actif: false }
        ]);
        db.setSync('trimestreActif', 'a2026');
        // security-ok: fixtures littérales écrites par le spec, aucune source externe.
        await db.set('a2026_grillesTemplates', []);
        await db.set('h2026_grillesTemplates', Array.from({ length: 6 }, (_, i) => ({
            id: 'GR_' + i, nom: 'Grille ' + i, criteres: [], dansBibliotheque: true
        })));

        await afficherBibliothequeGrilles();
        await new Promise(res => setTimeout(res, 400));
        document.getElementById('selectTrimestreImportGrilles').value = 'h2026';
        afficherGrillesTrimestreModal();
        await new Promise(res => setTimeout(res, 300));

        await importerUneGrilleTrimestre('h2026', 'GR_1');
        await new Promise(res => setTimeout(res, 600));

        const select = document.getElementById('selectTrimestreImportGrilles');
        const apercu = document.getElementById('previewGrillesTrimestre');
        return {
            trimestreConserve: select ? select.value : null,
            apercuOuvert: !!(apercu && !apercu.classList.contains('u-hide'))
        };
    });

    console.log('GRILLES →', JSON.stringify(r));
    expect(r.trimestreConserve).toBe('h2026');
    expect(r.apercuOuvert).toBe(true);
});
