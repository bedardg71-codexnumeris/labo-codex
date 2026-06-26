import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Bug latent (26 juin 2026), jumeau de celui visé par la Brique C côté grilles :
// dans les modales « Bibliothèque de productions » et « Bibliothèque d'échelles »,
// le bouton « Voir les productions / Voir les échelles » de la section « Importer
// depuis un autre trimestre » ne produisait AUCUN effet.
//
// Cause : le div d'aperçu était rendu avec `style="...display:none;"` INLINE, mais le
// handler ne fait que `preview.classList.remove('u-hide')`. La classe `u-hide`
// (`display:none !important`) étant absente de l'élément, la retirer ne touchait pas
// le style inline → l'aperçu restait invisible.
//
// Fix : `class="u-hide" style="margin-top:10px;"` à la place du `display:none` inline,
// de sorte que classList.remove('u-hide') redonne réellement la visibilité.
//
// Ce test ouvre la VRAIE modale avec un trimestre source posé, appelle le handler
// « Voir », et vérifie que l'aperçu devient visible (getComputedStyle.display !== 'none')
// ET qu'il contient bien les boutons « Importer ». Break-test : remettre le
// `display:none` inline doit le faire rougir.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function brancherErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });
}

test('productions · « Voir les productions » d\'un autre trimestre rend l\'aperçu visible', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.afficherBibliothequeProductions !== 'function'
            || typeof window.afficherProductionsTrimestreModal !== 'function') {
            return { erreur: 'pré-requis absents' };
        }

        // Trimestre actif distinct du trimestre source → le source compte comme « un autre ».
        window.trimestreActif = 'h2026';
        await window.db.set('bibliothequeProductions', []);
        window.db.setSync('repertoiresBibliotheques', []);

        // Trimestre source posé directement dans localStorage : le scan
        // (listerTrimestresAvecProductions) ET la lecture (db.getSync) le voient.
        localStorage.setItem('a2025_productions', JSON.stringify([
            { id: 'PROD_SRC_1', titre: 'Devoir source A25', coursId: 'C1', sigleCours: 'ABC-101',
              type: 'devoir', ponderation: 20 }
        ]));

        await window.afficherBibliothequeProductions();

        const select = document.getElementById('selectTrimestreImport');
        const preview = document.getElementById('previewProductionsTrimestre');
        if (!select || !preview) return { erreur: 'modale/section import absente' };

        const optionPresente = !!select.querySelector('option[value="a2025_productions"]');
        select.value = 'a2025_productions';

        // Le geste utilisateur : cliquer « Voir les productions ».
        window.afficherProductionsTrimestreModal();

        return {
            optionPresente,
            display: getComputedStyle(preview).display,
            aClasseUHide: preview.classList.contains('u-hide'),
            aBoutonImporter: preview.innerHTML.includes('importerUneProductionTrimestre'),
            texteImporter: preview.textContent.includes('Importer')
        };
    });

    expect(resultat.erreur).toBeUndefined();
    expect(resultat.optionPresente).toBe(true);
    // Cœur du correctif : l'aperçu n'est plus masqué.
    expect(resultat.display).not.toBe('none');
    expect(resultat.aClasseUHide).toBe(false);
    expect(resultat.aBoutonImporter).toBe(true);
    expect(resultat.texteImporter).toBe(true);
    expect(erreurs).toEqual([]);
});

test('échelles · « Voir les échelles » d\'un autre trimestre rend l\'aperçu visible', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.afficherBibliothequeEchelles !== 'function'
            || typeof window.afficherEchellesTrimestreModal !== 'function') {
            return { erreur: 'pré-requis absents' };
        }

        window.trimestreActif = 'h2026';
        await window.db.set('bibliothequeEchelles', []);
        window.db.setSync('repertoiresBibliotheques', []);

        localStorage.setItem('a2025_echelles', JSON.stringify([
            { id: 'ECH_SRC_1', nom: 'Échelle source A25', discipline: 'Français',
              niveaux: [{ label: 'N1' }, { label: 'N2' }] }
        ]));

        await window.afficherBibliothequeEchelles();

        const select = document.getElementById('selectTrimestreImportEchelles');
        const preview = document.getElementById('previewEchellesTrimestre');
        if (!select || !preview) return { erreur: 'modale/section import absente' };

        const optionPresente = !!select.querySelector('option[value="a2025_echelles"]');
        select.value = 'a2025_echelles';

        window.afficherEchellesTrimestreModal();

        return {
            optionPresente,
            display: getComputedStyle(preview).display,
            aClasseUHide: preview.classList.contains('u-hide'),
            aBoutonImporter: preview.innerHTML.includes('importerUneEchelleTrimestre'),
            texteImporter: preview.textContent.includes('Importer')
        };
    });

    expect(resultat.erreur).toBeUndefined();
    expect(resultat.optionPresente).toBe(true);
    expect(resultat.display).not.toBe('none');
    expect(resultat.aClasseUHide).toBe(false);
    expect(resultat.aBoutonImporter).toBe(true);
    expect(resultat.texteImporter).toBe(true);
    expect(erreurs).toEqual([]);
});
