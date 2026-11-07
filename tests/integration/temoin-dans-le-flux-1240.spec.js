import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';
import { attendreRepos, suivreLesReactions } from './harness/attendre-repos.js';

// =======================================================================
// #1240 — LE « NON ENREGISTRÉ » NE COUVRE JAMAIS UN BOUTON (7 nov. 2026, décision de Cowork)
// =======================================================================
//
// Mesuré avant le correctif (WebKit, présences de la démo) : sous 768 px, le témoin flottant
// (270 × 208 px, en bas à gauche) couvrait « ← Précédent », la date ou « Rapport » dès
// l'affichage ; l'en-tête épuré, plus court de 143 px, avait remonté ces boutons sous lui.
// Décision : sous le seuil (≤ 779 px), il quitte sa position flottante et prend place dans la
// page, juste au-dessus de « ← Précédent / Suivant → ».
//
// Ce banc vérifie, à 360 et 390 px, dans les deux thèmes, que les deux boutons restent
// TOUCHABLES (un vrai toucher, `tap`, qui exige que le bouton reçoive le point touché) et
// qu'ils font leur geste. Puis : un échec arrivé pendant qu'on est plus bas dans la page est
// amené à la vue ; quitter la page le rend flottant ; à 1180 px, il flotte comme avant.
// Noms fictifs : le pack démo.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

test.use({ hasTouch: true });

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.Codex) window.Codex.proposerAvantSuppression = async () => true;
        });
    });
});

const RAISON = 'la mémoire du navigateur est pleine. Pour libérer de la place : Cadre › Trimestre › Bibliothèque, « Supprimer… » sur un ancien trimestre.';

async function ouvrirPresencesDemo(page, largeur, hauteur, clair) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.setViewportSize({ width: largeur, height: hauteur });
    await suivreLesReactions(page);
    await page.goto(indexHtml);
    await attendreApplication(page);
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
    await attendreApplication(page);
    await page.evaluate(() => activerModeDemo());
    await page.waitForFunction(() => window.estEnModeDemo && window.estEnModeDemo() && window.dbReady === true, null, { timeout: 30000 });
    await page.evaluate((clair) => {
        document.body.classList.toggle('mode-clair', clair);
        naviguerVers('suivi', 'saisie');
        window.scrollTo(0, 0);
    }, clair);
    await page.waitForFunction(() => {
        const b = document.getElementById('btn-cours-precedent');
        return b && b.getClientRects().length > 0;
    });
    await attendreRepos(page);
}

async function direNonEnregistre(page) {
    await page.evaluate((raison) => window.temoinEnregistrement.nonEnregistre(raison, 'Enregistrement des présences'), RAISON);
}

/** Le témoin et les deux boutons, en coordonnées de l'écran. */
async function releve(page) {
    return page.evaluate(() => {
        const rect = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; };
        const temoin = document.getElementById('temoin-enregistrement');
        const echec = temoin.querySelector('.temoin-enregistrement-echec');
        return {
            dansLeFlux: temoin.classList.contains('temoin-dans-le-flux'),
            position: getComputedStyle(temoin).position,
            echecVisible: echec.classList.contains('visible') && echec.getBoundingClientRect().height > 0,
            echec: rect(echec),
            precedent: rect(document.getElementById('btn-cours-precedent')),
            suivant: rect(document.getElementById('btn-cours-suivant')),
            hauteurVue: innerHeight
        };
    });
}

const croise = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

for (const [largeur, hauteur] of [[360, 740], [390, 844]]) {
    for (const clair of [false, true]) {
        test(`#1240 · ${largeur} px, ${clair ? 'clair' : 'sombre'} : « Précédent » et « Suivant » restent touchables sous un « Non enregistré »`, async ({ page }) => {
            test.setTimeout(90000);
            await ouvrirPresencesDemo(page, largeur, hauteur, clair);
            await direNonEnregistre(page);

            const r = await releve(page);
            expect(r.echecVisible, 'le « Non enregistré » est affiché').toBe(true);
            expect(r.dansLeFlux, 'sous 780 px, il est dans la page').toBe(true);
            expect(r.position, 'il ne flotte plus').toBe('static');
            expect(r.echec.b, 'il est au-dessus de « ← Précédent »').toBeLessThanOrEqual(r.precedent.t);
            expect(croise(r.echec, r.precedent)).toBe(false);
            expect(croise(r.echec, r.suivant)).toBe(false);

            // Un vrai toucher sur chacun : Playwright refuse si un autre élément reçoit le point.
            const date = page.locator('#date-cours');
            const avant = await date.inputValue();
            await page.locator('#btn-cours-precedent').tap({ timeout: 5000 });
            await page.waitForFunction((v) => document.getElementById('date-cours').value !== v, avant);
            const apresPrecedent = await date.inputValue();
            expect(apresPrecedent, '« ← Précédent » a fait son geste').not.toBe(avant);
            await page.locator('#btn-cours-suivant').tap({ timeout: 5000 });
            await page.waitForFunction((v) => document.getElementById('date-cours').value !== v, apresPrecedent);
            await attendreRepos(page);

            // Le témoin est toujours là, toujours dans la page (le geste a pu écrire : il reste
            // tant que SA clé n'a pas réussi, règle du lot B).
            expect((await releve(page)).echecVisible).toBe(true);
        });
    }
}

test('#1240 · 360 px : un échec arrivé plus bas dans la page est amené à la vue', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirPresencesDemo(page, 360, 740, false);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await direNonEnregistre(page);
    const r = await releve(page);
    expect(r.dansLeFlux).toBe(true);
    expect(r.echec.t, 'le haut du témoin est visible').toBeGreaterThanOrEqual(0);
    expect(r.echec.b, 'le bas du témoin est visible').toBeLessThanOrEqual(r.hauteurVue);
});

test('#1240 · 360 px : quitter la page le rend flottant, y revenir le replace dans la page', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirPresencesDemo(page, 360, 740, false);
    await direNonEnregistre(page);
    expect((await releve(page)).dansLeFlux).toBe(true);

    await page.evaluate(() => naviguerVers('suivi', 'groupe'));
    await expect.poll(async () => (await releve(page)).dansLeFlux).toBe(false);
    const ailleurs = await releve(page);
    expect(ailleurs.dansLeFlux, 'hors des présences, il flotte').toBe(false);
    expect(ailleurs.position).toBe('fixed');
    expect(ailleurs.echecVisible, 'et reste lisible').toBe(true);

    await page.evaluate(() => naviguerVers('suivi', 'saisie'));
    await expect.poll(async () => (await releve(page)).dansLeFlux, { message: 'de retour aux présences, il y reprend place' }).toBe(true);
});

test('#1240 · 1180 px : au-dessus du seuil, il flotte comme avant', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirPresencesDemo(page, 1180, 820, false);
    await direNonEnregistre(page);
    const r = await releve(page);
    expect(r.echecVisible).toBe(true);
    expect(r.dansLeFlux).toBe(false);
    expect(r.position).toBe('fixed');
});
