import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// CHANTIER DE L'ENREGISTREMENT, LOT 1 — LE TÉMOIN DIT VRAI ET SE VOIT (#962, #986, 5 oct. 2026)
// =======================================================================
//
// #962 : `db.setSync` rend la main avant le commit IndexedDB. Mesuré avant le lot (sonde
// WebKit, connexion fermée comme après une mise en arrière-plan sur l'iPad) : le témoin
// disait « Enregistré », l'échec n'était qu'un `console.warn`, la valeur se perdait au
// rechargement. Maintenant : « Non enregistré », qui reste ; pour une grosse clé,
// « Enregistré » seulement après le commit.
//
// #986 : sur l'iPad, le clavier à l'écran cachait le témoin (constat de Grégoire, 29 sept.).
// Le clavier ne se simule pas en WebKit de bureau : le banc remplace `visualViewport` par
// une zone visible réduite de 400 px, à la largeur de l'iPad debout (820 × 1180).
//
// ⚠ Chaque essai part d'un stockage VIDÉ (les specs partagent l'origine file://).

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i,
    // Les pannes que le banc provoque, journalisées par `db.js`.
    /Transaction IndexedDB avortée|Erreur transaction IndexedDB|Erreur écriture IndexedDB/
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.accept().catch(() => {}));
    return erreurs;
}

async function ouvrirVide(page) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.db && db.ready, null, { timeout: 30000 });
    await page.evaluate(async () => {
        localStorage.clear();
        db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.db && db.ready && window.temoinEnregistrement, null, { timeout: 30000 });
    await page.waitForTimeout(800);
}

// État du témoin, lu dans la page.
const LIRE = () => {
    const t = document.getElementById('temoin-enregistrement');
    const s = t && t.querySelector('.temoin-enregistrement-succes.visible');
    const e = t && t.querySelector('.temoin-enregistrement-echec.visible');
    return { enregistre: !!s, echec: e ? e.querySelector('.temoin-enregistrement-echec-texte').textContent : null };
};

// Une valeur au-delà de SEUIL_IDB_FIRST (25 Ki caractères), de la forme des évaluations.
const GROSSE = `Array.from({ length: 60 }, (_, i) => ({ id: 'EVAL' + i, commentaire: 'x'.repeat(1000) }))`;

test.describe('#962 · un échec IndexedDB ne se tait jamais', () => {
    test.setTimeout(90000);

    test('#1029 · connexion fermée, grosse clé : rouverte une fois, « Enregistré » après le commit, la valeur relue après rechargement', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await ouvrirVide(page);
        const avant = await page.evaluate(`(() => {
            window.__connexionFermee = db.db;
            db.db.close();   // comme une connexion perdue après la mise en arrière-plan sur l'iPad
            sauvegarderDonneesSelonMode('evaluationsSauvegardees', ${GROSSE}.concat([{ id: 'APRES-ARRIERE-PLAN' }]));
            const t = document.getElementById('temoin-enregistrement');
            return !!(t && t.querySelector('.temoin-enregistrement-succes.visible'));
        })()`);
        expect(avant, '« Enregistré » ne s\'affiche pas avant le commit d\'une grosse clé').toBe(false);
        await expect.poll(() => page.evaluate(LIRE)).toEqual({ enregistre: true, echec: null });
        expect(await page.evaluate(() => db.db !== window.__connexionFermee), 'une connexion neuve').toBe(true);
        await page.evaluate(() => db.flush());
        await page.reload();
        await page.waitForFunction(() => window.db && db.ready, null, { timeout: 30000 });
        const relue = await page.evaluate(() => {
            const v = db.getSync(window.cle('evaluationsSauvegardees'), []);
            return v.length ? v[v.length - 1].id : null;
        });
        expect(relue).toBe('APRES-ARRIERE-PLAN');
        expect(erreurs).toEqual([]);
    });

    test('connexion fermée ET réouverture impossible : « Non enregistré » avec le geste, et il RESTE au-delà de 2 s', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await ouvrirVide(page);
        const apresAppel = await page.evaluate(`(() => {
            db._initIndexedDB = () => Promise.reject(new Error('Erreur ouverture IndexedDB'));   // doublure : la réouverture échoue
            db.db.close();
            sauvegarderDonneesSelonMode('evaluationsSauvegardees', ${GROSSE}, { geste: 'Verrouillage de l\\'évaluation' });
            const t = document.getElementById('temoin-enregistrement');
            return !!(t && t.querySelector('.temoin-enregistrement-succes.visible'));
        })()`);
        expect(apresAppel, '« Enregistré » ne s\'affiche pas avant le commit d\'une grosse clé').toBe(false);
        await expect.poll(() => page.evaluate(LIRE).then((e) => e.echec)).toBe('Non enregistré – Verrouillage de l\'évaluation : le navigateur a refusé l\'écriture. Note ce que tu viens de saisir, puis recharge la page : ta saisie sera à refaire.');
        await page.waitForTimeout(2600);
        const ensuite = await page.evaluate(LIRE);
        expect(ensuite.enregistre).toBe(false);
        expect(ensuite.echec).toMatch(/^Non enregistré/);
        expect(erreurs).toEqual([]);
    });

    test('quota sur une grosse clé, puis une écriture qui réussit : « Enregistré » seulement à SON commit, et l\'échec part alors', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await ouvrirVide(page);
        // Doublure de `_setIndexedDB` : la 1ʳᵉ écriture échoue par quota ; la 2ᵉ attend que
        // le banc la libère, puis passe par la VRAIE écriture (vrai commit).
        await page.evaluate(() => {
            const vraie = db._setIndexedDB.bind(db);
            let n = 0;
            window.__liberer = null;
            db._setIndexedDB = (k, v) => {
                if (k !== window.cle('evaluationsSauvegardees')) return vraie(k, v);
                n++;
                if (n === 1) return Promise.reject(new DOMException('The quota has been exceeded.', 'QuotaExceededError'));
                return new Promise((res) => { window.__liberer = res; }).then(() => vraie(k, v));
            };
        });
        await page.evaluate(`sauvegarderDonneesSelonMode('evaluationsSauvegardees', ${GROSSE})`);
        await expect.poll(() => page.evaluate(LIRE).then((e) => e.echec)).toMatch(/^Non enregistré : la mémoire du navigateur est pleine/);

        await page.evaluate(`sauvegarderDonneesSelonMode('evaluationsSauvegardees', ${GROSSE})`);
        await page.waitForTimeout(300);
        let etat = await page.evaluate(LIRE);
        expect(etat.enregistre, 'pas de « Enregistré » avant le commit').toBe(false);
        expect(etat.echec, 'l\'échec reste tant que le commit n\'a pas réussi').toMatch(/^Non enregistré/);

        await page.evaluate(() => window.__liberer());
        await expect.poll(() => page.evaluate(LIRE)).toEqual({ enregistre: true, echec: null });
        expect(erreurs).toEqual([]);
    });

    test('petite clé : « Enregistré » tout de suite, comme avant', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await ouvrirVide(page);
        const etat = await page.evaluate(() => {
            sauvegarderDonneesSelonMode('presences', [{ da: '1', date: '2026-10-05', heures: 2 }]);
            const t = document.getElementById('temoin-enregistrement');
            return !!(t && t.querySelector('.temoin-enregistrement-succes.visible'));
        });
        expect(etat).toBe(true);
        expect(erreurs).toEqual([]);
    });
});

test.describe('#986 · le témoin se voit au-dessus du clavier de l\'iPad', () => {
    test.setTimeout(90000);

    for (const [nom, clavier] of [['clavier ouvert (zone visible réduite de 400 px)', 400], ['sans clavier', 0]]) {
        test(`820 × 1180, ${nom} : le témoin entier dans la zone visible, à 16 px de son bas`, async ({ page }) => {
            await page.setViewportSize({ width: 820, height: 1180 });
            await page.addInitScript((hauteur) => {
                // Zone visible simulée : `visualViewport` est remplacé AVANT les scripts de l'app.
                // ⚠ Accesseurs posés par defineProperty : `Object.assign` les LIRAIT une fois.
                const vv = new EventTarget();
                Object.defineProperty(vv, 'height', { get: () => window.innerHeight - window.__clavier });
                Object.assign(vv, { offsetTop: 0, offsetLeft: 0, scale: 1 });
                window.__clavier = hauteur;
                Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => vv });
            }, clavier);
            const erreurs = brancherEcouteurs(page);
            await ouvrirVide(page);
            const mesure = await page.evaluate(() => {
                sauvegarderDonneesSelonMode('presences', [{ da: '1', date: '2026-10-05', heures: 2 }]);
                const r = document.querySelector('.temoin-enregistrement-succes.visible').getBoundingClientRect();
                return { bas: Math.round(r.bottom), haut: Math.round(r.top), zone: window.visualViewport.height };
            });
            expect(mesure.bas).toBe(mesure.zone - 16);
            expect(mesure.haut).toBeGreaterThan(0);
            expect(erreurs).toEqual([]);
        });
    }

    test('820 × 1180 : le clavier s\'ouvre PENDANT que « Non enregistré » est affiché → il remonte ; il se ferme → il redescend', async ({ page }) => {
        await page.setViewportSize({ width: 820, height: 1180 });
        await page.addInitScript(() => {
            const vv = new EventTarget();
            Object.defineProperty(vv, 'height', { get: () => window.innerHeight - window.__clavier });
            Object.assign(vv, { offsetTop: 0, offsetLeft: 0, scale: 1 });
            window.__clavier = 0;
            Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => vv });
        });
        const erreurs = brancherEcouteurs(page);
        await ouvrirVide(page);
        const basDe = () => page.evaluate(() => Math.round(document.querySelector('.temoin-enregistrement-echec.visible').getBoundingClientRect().bottom));
        await page.evaluate(() => window.temoinEnregistrement.nonEnregistre('le navigateur a refusé l\'écriture.', undefined, 'k'));
        expect(await basDe()).toBe(1180 - 16);
        await page.evaluate(() => { window.__clavier = 400; window.visualViewport.dispatchEvent(new Event('resize')); });
        expect(await basDe()).toBe(1180 - 400 - 16);
        await page.evaluate(() => { window.__clavier = 0; window.visualViewport.dispatchEvent(new Event('resize')); });
        expect(await basDe()).toBe(1180 - 16);
        expect(erreurs).toEqual([]);
    });

    test('Mac, zoom au pincement (échelle 2) : le témoin ne bouge pas', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.addInitScript(() => {
            const vv = new EventTarget();
            Object.defineProperty(vv, 'height', { get: () => window.innerHeight / 2 });
            Object.assign(vv, { offsetTop: 100, offsetLeft: 100, scale: 2 });
            Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => vv });
        });
        await ouvrirVide(page);
        const bas = await page.evaluate(() => {
            sauvegarderDonneesSelonMode('presences', [{ da: '1', date: '2026-10-05', heures: 2 }]);
            return Math.round(document.querySelector('.temoin-enregistrement-succes.visible').getBoundingClientRect().bottom);
        });
        expect(bas).toBe(900 - 16);
    });
});
