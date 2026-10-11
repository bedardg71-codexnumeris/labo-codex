import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #990 (lot 8, consigne de Cowork du 11 oct. 2026) — LA SAISIE DES PRÉSENCES ATTEND QUE LE TRIMESTRE
// SOIT CONNU.
//
// Vécu sur l'iPad de Grégoire (30 sept. 2026, localStorage à 85 %) : « trimestres » ne tient plus dans
// le localStorage ; au démarrage, `initialiserModuleSaisiePresences` tournait AVANT `db-ready`, quand
// `db.getSync('trimestres')` rend `[]` et `cle()` des clés SANS préfixe. Il écrivait `{}` dans la clé
// nue `calendrierComplet`, trois clés nues `presences_*`, et rendait l'écran avec 2 lignes au lieu de 11,
// sans que rien ne le refasse. Correctif : l'initialisation passe par le portillon `auDbPret`.
//
// La sonde de la fiche, rejouée : pack démo, « trimestres » retirée du localStorage (elle reste dans
// IndexedDB), rechargement. Famille de #142 (« lu trop tôt, relu à db-ready »).
// STOCK : les clés nues déjà écrites chez Grégoire ne se nettoient pas (assumé, écrit à la fiche).

const CLES_NUES = ['calendrierComplet', 'presences_date', 'presences_groupe', 'presences_tri'];
const AVERTISSEMENTS = /Dates du trimestre manquantes|Calendrier complet non disponible/;

test('« trimestres » hors du localStorage : aucune clé nue, aucun avertissement, l\'écran a ses lignes', async ({ page }) => {
    test.setTimeout(90000);
    page.setDefaultTimeout(30000);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);

    // Témoin : un démarrage ordinaire de la démo, « trimestres » dans le localStorage.
    const temoin = await page.evaluate(async (cles) => {
        await window.activerModeDemo();
        await new Promise((r) => setTimeout(r, 1500));
        for (const c of cles) await db.remove(c);
        await db.flush();
        return {
            trimestreActif: db.getSync('trimestreActif', null),
            trimestresEnLocal: localStorage.getItem('trimestres') !== null,
            lignes: document.querySelectorAll('#tbody-saisie-presences input[id^="periodes_"]').length
        };
    }, CLES_NUES);
    expect(temoin.trimestreActif).toBe('demo');
    expect(temoin.trimestresEnLocal, 'témoin : « trimestres » est d\'abord dans le localStorage').toBe(true);

    // La sonde : « trimestres » quitte le localStorage, elle reste dans IndexedDB ; puis le localStorage
    // est rempli jusqu'au refus, pour qu'elle ne puisse pas y revenir (le cas de l'iPad, à 85 %).
    const remplissage = await page.evaluate(() => {
        localStorage.removeItem('trimestres');
        let morceau = 'x'.repeat(256 * 1024), n = 0;
        while (morceau.length >= 64) {
            try { localStorage.setItem('_banc_990_' + n, morceau); n++; } catch (e) { morceau = morceau.slice(0, morceau.length / 2); }
        }
        return { cles: n, trimestresEnLocal: localStorage.getItem('trimestres') !== null };
    });
    expect(remplissage.trimestresEnLocal).toBe(false);
    const avertissements = [];
    page.on('console', (m) => { if (AVERTISSEMENTS.test(m.text())) avertissements.push(m.text()); });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(4000);

    const apres = await page.evaluate(async (cles) => {
        const nues = {};
        for (const c of cles) nues[c] = (await db.get(c, null)) !== null || localStorage.getItem(c) !== null;
        return {
            dbPrete: window.dbReady === true,
            trimestres: (db.getSync('trimestres', []) || []).map((t) => t.id),
            nues,
            lignes: document.querySelectorAll('#tbody-saisie-presences input[id^="periodes_"]').length
        };
    }, CLES_NUES);

    expect(apres.dbPrete).toBe(true);
    expect(apres.trimestres, 'après db-ready, « trimestres » est lue (depuis IndexedDB)').toContain('demo');
    expect.soft(avertissements, 'aucun avertissement de calendrier au démarrage').toEqual([]);
    expect.soft(apres.nues, 'aucune clé nue écrite').toEqual(Object.fromEntries(CLES_NUES.map((c) => [c, false])));
    expect.soft(apres.lignes, 'l\'écran de saisie a les élèves de la démo').toBeGreaterThan(2);
    expect.soft(apres.lignes, 'autant de lignes que le démarrage ordinaire').toBe(temoin.lignes);
});
