import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ouvrirEspaceVide, enDemo } from './harness/deux-temps-de-banc.js';

// =======================================================================
// LOT « PERSPECTIVE-COINS » (17 NOVEMBRE 2026)
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-17-recevoir-dix-bulles.md, partie A. Lancé sous le Chromium du nuage.
//   A1 · « Perspective » pose les poignées sur les coins que la détection trouve (photo de Tapir Doux sur un bureau :
//        à moins de 2 % des vrais coins) ; sinon à 5 % des bords (photo de Loutre Enjouée, la feuille remplit l'image).
//   A2 · un réglage de couleur ou de lumière REMPLACE la balance automatique ; la géométrie seule la laisse
//        s'appliquer : à l'import (l'appel de `autoBalanceBlancs`) comme dans l'aperçu du centre (son cache « bal » ou
//        « raw ») ; le badge « Spécifique » parle en mots d'enseignant.
// Les deux photos sont celles du matériel du modèle de « Recevoir » (copies fictives), posées en fixtures.

const ICI = path.dirname(fileURLToPath(import.meta.url));
const photo = (nom) => fs.readFileSync(path.join(ICI, '..', 'fixtures', 'perspective-coins', nom)).toString('base64');
// Les vrais coins de la feuille, mesurés sur la fabrique (tapir_bureau.py) : haut-gauche, haut-droit, bas-droit, bas-gauche.
const VRAIS_COINS_TAPIR = [[0.050, 0.106], [0.850, 0.073], [0.950, 0.880], [0.070, 0.917]];
const REPLI = [[0.05, 0.05], [0.95, 0.05], [0.95, 0.95], [0.05, 0.95]];

/** Dépose des photos dans la file d'Évaluation › Préparer, par le chemin d'un dépôt fait à la main. */
async function deposer(page, fichiers) {
    await page.evaluate(() => naviguerVers('evaluations', 'importer'));
    await expect(page.locator('#travaux-drop-zone')).toBeVisible();
    await page.evaluate((liste) => {
        const fichiersNeufs = liste.map(([nom, b64]) => {
            const bin = atob(b64), octets = new Uint8Array(bin.length);
            for (let k = 0; k < bin.length; k++) octets[k] = bin.charCodeAt(k);
            return new File([octets], nom, { type: 'image/jpeg' });
        });
        travauxImport.ajouterFichiersEnAttente(fichiersNeufs);
        travauxUI.identifierAutoPipeline();
        travauxUI.rafraichirPipelineUI();
    }, fichiers);
    await expect.poll(() => page.evaluate(() => travauxImport.obtenirFileDAttente().length)).toBe(fichiers.length);
}

/** Ouvre le poste de préparation sur le k-ième fichier de la file, image chargée. */
async function ouvrirLePoste(page, k) {
    await page.evaluate((i) => travauxUI.ouvrirPreparationFichier(i), k);
    await expect(page.locator('#travaux-preparation-modal')).toBeVisible();
    await expect.poll(() => page.evaluate(() => { const c = document.getElementById('prep-canvas-apercu'); return !!c && c.width > 0; }), { timeout: 15000 }).toBe(true);
}

const coins = (page) => page.evaluate(() => travauxPreparation.coinsDePerspective());

test('A1 · « Perspective » : sur la photo de Tapir, les poignées sur les coins trouvés ; sur celle de Loutre, à 5 % des bords', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirEspaceVide(page, 1180, 820);
    await page.evaluate(() => activerModeDemo());
    await expect.poll(() => enDemo(page)).toBe(true);
    await deposer(page, [['tapir.jpg', photo('tapir-sur-le-bureau.jpg')], ['loutre.jpg', photo('loutre-pleine-image.jpg')]]);

    // Break-test (17 nov. 2026) : `activerPerspective` posant toujours `coinsParDefaut()` (la détection débranchée) →
    // ROUGE ici (les poignées à 5 % des bords, à plus de 2 % des vrais coins). Rétabli → vert.
    await ouvrirLePoste(page, 0);
    await page.locator('#travaux-preparation-modal [data-action="travauxPreparation.activerPerspective"]').click();
    await expect(page.locator('#prep-btn-appliquer-persp')).toBeVisible();
    const trouves = await coins(page);
    test.info().annotations.push({ type: 'coins trouvés (Tapir)', description: JSON.stringify(trouves.map((c) => [+c.x.toFixed(3), +c.y.toFixed(3)])) });
    trouves.forEach((c, i) => {
        expect(Math.abs(c.x - VRAIS_COINS_TAPIR[i][0]), 'coin ' + i + ', x').toBeLessThan(0.02);
        expect(Math.abs(c.y - VRAIS_COINS_TAPIR[i][1]), 'coin ' + i + ', y').toBeLessThan(0.02);
    });
    // Les poignées restent ajustables : glisser l'une la déplace (le geste de toujours).
    await page.evaluate(() => travauxPreparation.fermer());
    await expect(page.locator('#travaux-preparation-modal')).toBeHidden();

    // La feuille de Loutre remplit l'image : la détection rend le cadre de l'image (un coin hors d'elle) ; refusé, les
    // poignées reviennent à 5 % des bords. Break-test (17 nov. 2026) : `coinsUtilisables` rendant toujours vrai → ROUGE
    // ici (un coin à x = -0,006). Rétabli → vert.
    await ouvrirLePoste(page, 1);
    await page.locator('#travaux-preparation-modal [data-action="travauxPreparation.activerPerspective"]').click();
    expect((await coins(page)).map((c) => [c.x, c.y])).toEqual(REPLI);
    await page.evaluate(() => travauxPreparation.fermer());
});

test('A2 · « Perspective » seule laisse la balance automatique ; « Luminosité » la remplace, à l’import comme à l’aperçu ; le badge en mots d’enseignant', async ({ page }) => {
    test.setTimeout(180000);
    page.setDefaultTimeout(20000);
    await ouvrirEspaceVide(page, 1180, 820);
    await page.evaluate(() => activerModeDemo());
    await expect.poll(() => enDemo(page)).toBe(true);
    // Deux copies du pack, nommées par leur DA (le pack de la démo : DEMO004, DEMO006).
    const loutre = photo('loutre-pleine-image.jpg');
    await deposer(page, [
        ['Geometrie_DEMO004_Copie_Remis_le_2025-09-08_23h41m12s.jpg', loutre],
        ['Lumiere_DEMO006_Copie_Remis_le_2025-09-08_23h41m13s.jpg', loutre]
    ]);

    // La première : « Perspective » seule.
    await ouvrirLePoste(page, 0);
    // 18 nov. 2026 (vécu par Grégoire sur l'iPad) : la couche des poignées laisse le doigt faire défiler le poste, sauf
    // pendant la perspective (ses poignées à glisser). Break-test : la couche à `touch-action: none` en tout temps (le CSS
    // d'avant, sans la bascule) → ROUGE ici. Rétabli → vert.
    const toucherDeLaCouche = () => page.evaluate(() => getComputedStyle(document.getElementById('prep-canvas-overlay')).touchAction);
    expect(await toucherDeLaCouche(), 'sans outil, le doigt défile').toBe('pan-x pan-y');
    await page.locator('#travaux-preparation-modal [data-action="travauxPreparation.activerPerspective"]').click();
    expect(await toucherDeLaCouche(), 'pendant la perspective, le doigt glisse les poignées').toBe('none');
    // Les poignées, peintes sur la couche ; après « Confirmer perspective », plus aucune (elles restaient, à leur place
    // de détection). Break-test : `appliquerPerspective` qui quitte l'outil APRÈS l'opération (l'ordre d'avant) → ROUGE
    // ici. Rétabli → vert.
    const peintAuxCoins = (coinsVus) => page.evaluate((cs) => {
        const o = document.getElementById('prep-canvas-overlay'), a = document.getElementById('prep-canvas-apercu');
        const W = a.width, H = a.height, ctx = o.getContext('2d');
        return cs.map((c) => { const d = ctx.getImageData(Math.round(W + c.x * W) - 6, Math.round(H + c.y * H) - 6, 12, 12).data;
            let alpha = 0; for (let k = 3; k < d.length; k += 4) alpha += d[k]; return alpha > 0; });
    }, coinsVus);
    const coinsVus = await page.evaluate(() => travauxPreparation.coinsDePerspective());
    expect(await peintAuxCoins(coinsVus), 'les poignées sont peintes').toEqual([true, true, true, true]);
    await page.click('#prep-btn-appliquer-persp');
    await expect.poll(() => peintAuxCoins(coinsVus), { message: 'après « Confirmer perspective », plus aucune poignée' }).toEqual([false, false, false, false]);
    expect(await toucherDeLaCouche(), 'l’opération faite, le doigt défile de nouveau').toBe('pan-x pan-y');
    await expect.poll(() => page.evaluate(() => travauxPreparation.operationsEnCours().map((o) => o.type))).toEqual(['perspective']);
    await page.click('#prep-btn-confirmer');
    await expect(page.locator('#travaux-preparation-modal')).toBeHidden({ timeout: 45000 });
    // La seconde : « Luminosité » +20.
    await ouvrirLePoste(page, 1);
    await page.evaluate(() => travauxPreparation.changerLuminosite(20));
    await page.click('#prep-btn-confirmer');
    await expect(page.locator('#travaux-preparation-modal')).toBeHidden({ timeout: 45000 });
    expect(await page.evaluate(() => travauxImport.obtenirFileDAttente().map((f) => (f.operations || []).map((o) => o.type))))
        .toEqual([['perspective'], ['brightness']]);

    // Le badge « Spécifique » de l'Aperçu, en mots d'enseignant (il disait « brightness »).
    await expect(page.locator('.pipeline-col-confirmes .pipeline-meta-ops')).toHaveText(['Perspective', 'Luminosité +20']);

    // L'aperçu du centre : la balance (cache « bal ») pour la géométrie seule, pas pour la lumière (« raw »).
    // Break-test (17 nov. 2026) : `balanceActiveePour` sans `aUnReglageDeCouleurOuDeLumiere` → ROUGE ici (« bal » pour
    // la seconde) et à l'import (deux appels). Rétabli → vert.
    // (Les rendus d'avant les réglages sont oubliés : la clé se décide à chaque rendu, c'est elle qu'on juge.)
    await page.evaluate(() => travauxImport.obtenirFileDAttente().forEach((f) => { f._previewCache = {}; }));
    for (const [k, attendu] of [[0, 'bal'], [1, 'raw']]) {
        await page.locator('.pipeline-col-originaux .pipeline-fichier-ligne').nth(k).click();
        await expect.poll(() => page.evaluate((i) => Object.keys(travauxImport.obtenirFileDAttente()[i]._previewCache || {}), k), { timeout: 15000 })
            .toEqual([attendu]);
    }

    // L'import : la balance automatique n'est appliquée qu'à la première.
    await page.evaluate(() => {
        window.__balances = 0;
        const vraie = travauxPreparation.autoBalanceBlancs;
        travauxPreparation.autoBalanceBlancs = function () { window.__balances++; return vraie.apply(this, arguments); };
    });
    const pid = await page.evaluate(() => {
        const s = document.querySelector('.pipeline-production-selecteur select');
        return [...s.options].map((o) => o.value).find((v) => v && v !== '__jeton_reprise__');
    });
    await page.selectOption('.pipeline-production-selecteur select', pid);
    await page.click('[data-action="travauxUI.appliquerEtImporter"]');
    await page.locator('.modal-overlay.actif button', { hasText: 'Oui, importer' }).click();
    await expect.poll(() => page.evaluate(() => !travauxImport.importEnCours && travauxImport.obtenirFileDAttente().length === 0), { timeout: 60000 }).toBe(true);
    expect(await page.evaluate(() => window.__balances), 'la balance automatique : la photo redressée seulement').toBe(1);
});
