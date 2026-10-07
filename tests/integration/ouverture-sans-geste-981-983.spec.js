import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #981, #983 (7 oct. 2026) — UNE OUVERTURE, SANS GESTE, N'ÉCRIT NI `cours` NI `portfoliosEleves`.
//
// Mesuré à `fe386827` (sonde WebKit, pack démo et mode réel, trois ouvertures de suite) :
// - `cours` ne s'écrit qu'une fois, à la première ouverture après l'activation du démo : les deux migrations
//   de `cours.js` ajoutent `pratiqueId` et `dansBibliotheque`, absents du pack. Ensuite, plus rien, et le
//   contenu ne bouge plus. Le « contenu différent à chaque ouverture » du 28 sept. ne se reproduit pas.
// - `portfoliosEleves` ne s'écrit jamais à l'ouverture : l'écrivain `auto: true` (`portfolio.js`) vit dans
//   `chargerPortfolioEleveDetail`, que rien n'atteint (aucun conteneur dans la page — code mort, #722).
//
// Le banc ÉCOUTE `db._signalerEcriture` dès le chargement de db.js (piège posé par addInitScript), pour
// toutes les écritures qui passent la garde #340, puis il rouvre la page deux fois de suite.
// Il vérifie aussi l'autre sens : une ouverture qui a VRAIMENT quelque chose à changer écrit toujours.
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

const piege = () => {
    window.__ecritures = [];
    let _db;
    Object.defineProperty(window, 'db', {
        configurable: true,
        get() { return _db; },
        set(v) {
            _db = v;
            const orig = v._signalerEcriture.bind(v);
            v._signalerEcriture = function (key) {
                window.__ecritures.push(key);
                return orig(key);
            };
        }
    });
};

async function viderEtRecharger(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
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
    await page.waitForTimeout(1500);
}

/** Une ouverture : recharge, laisse le démarrage finir, rend les clés écrites et le contenu lu après. */
async function ouvrir(page) {
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.db && typeof window.cle === 'function', null, { timeout: 30000 });
    // Le démarrage n'émet aucun signal de fin : on attend le CALME — au moins 6 s, puis 3 s sans nouvelle
    // écriture (un délai fixe seul a lu, une fois sur six sous charge, avant les migrations de `cours.js`).
    await page.waitForTimeout(6000);
    let n = -1;
    for (let i = 0; i < 12; i++) {
        const m = await page.evaluate(() => (window.__ecritures || []).length);
        if (m === n) break;
        n = m;
        await page.waitForTimeout(3000);
    }
    return page.evaluate(() => ({
        ecrites: (window.__ecritures || []).slice(),
        cleePortfolios: cle('portfoliosEleves'),
        cours: JSON.stringify(db.getSync('cours', null)),
        portfolios: JSON.stringify(db.getSync(cle('portfoliosEleves'), null))
    }));
}

test('#981 #983 · pack démo : deux ouvertures de suite n’écrivent ni la liste des cours ni la sélection du portfolio', async ({ page }) => {
    test.setTimeout(180000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(String(e)));
    await viderEtRecharger(page);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForTimeout(3000);
    await page.addInitScript(piege);

    // Première ouverture après l'activation : les migrations de `cours.js` y complètent le pack (une vraie
    // modification, permise). Elle n'est pas jugée ici : c'est l'objet du second essai.
    const premiere = await ouvrir(page);
    expect(premiere.cleePortfolios).toBe('demo_portfoliosEleves');

    const o1 = await ouvrir(page);
    const o2 = await ouvrir(page);

    // Le piège a bien écouté (sinon « aucune écriture » ne prouverait rien) : le démarrage écrit d'autres clés.
    expect(o1.ecrites.length).toBeGreaterThan(0);
    expect(o2.ecrites.length).toBeGreaterThan(0);

    for (const o of [o1, o2]) {
        expect(o.ecrites).not.toContain('cours');
        // Toute variante de préfixe : un écrivain qui tourne au chargement du script (avant que le trimestre
        // soit connu) écrirait sous une autre clé que `demo_portfoliosEleves` (break-test M4, 7 oct.).
        expect(o.ecrites.filter((k) => /portfoliosEleves$/.test(k))).toEqual([]);
    }
    expect(o2.cours).toBe(premiere.cours);
    expect(o2.portfolios).toBe(premiere.portfolios);
    expect(erreurs).toEqual([]);
});

test('#981 · une ouverture qui a vraiment quelque chose à compléter écrit la liste des cours, une fois', async ({ page }) => {
    test.setTimeout(180000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(String(e)));
    await viderEtRecharger(page);
    // Un cours d'avant la bibliothèque : ni `pratiqueId` ni `dansBibliotheque` (forme des cours anciens).
    await page.evaluate(() => {
        const c = { id: 'COURS-BANC-981', codeCours: '601-981-ZZ', nomCours: 'Cours fictif du banc', trimestreId: 'a2026', actif: true };
        db.setSync('cours', [c]);
        db.setSync('infoCours', c);
    });
    await page.waitForTimeout(1500);

    await page.addInitScript(piege);
    const o1 = await ouvrir(page);
    const o2 = await ouvrir(page);

    expect(o1.ecrites).toContain('cours');
    const complete = JSON.parse(o1.cours).find((c) => c.id === 'COURS-BANC-981');
    expect(complete.pratiqueId).toBe('pan-standards');
    expect(complete.dansBibliotheque).toBe(true);

    expect(o2.ecrites.length).toBeGreaterThan(0);
    expect(o2.ecrites).not.toContain('cours');
    expect(o2.cours).toBe(o1.cours);
    expect(erreurs).toEqual([]);
});
