import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =====================================================================
// #640 — L'ACCUEIL EST LA PORTE D'ENTRÉE, ÉCRAN COMPRIS
// =====================================================================
//
// Le pendant OBSERVABLE de `tests/unit/sentinelle-640-accueil-porte-entree.test.js`.
// Vitest y mesure l'APPEL (`afficherSection` reçoit 'accueil') ; il ne voit pas
// le rendu — c'est du Node. Ici on ouvre vraiment la page et on regarde QUELLE
// section porte la classe `.active`, c'est-à-dire ce que l'utilisateur voit.
//
// Règle verrouillée (`js/main.js:991`, commit `8f4ff85d` du 31 août 2026) :
// l'ouverture est `afficherSection('accueil')`, inconditionnelle. Les deux
// dérivations vers `naviguerVers('suivi', 'groupe')` — `demo-actif` valant
// 'true', et le mode expert — sont retirées.
//
// ⚠ DÉCISION DE PARCOURS, PAS INVARIANT DE SÛRETÉ. Le commentaire de
// `js/main.js:986-990` nomme la ligne à remettre si le retrait du raccourci
// expert se révèle de trop. Un rouge ici veut dire « quelqu'un a touché à
// l'ouverture » — pas nécessairement « c'est cassé ». Si la décision change,
// ce fichier change avec elle.
//
// ⚠ ÉTAT PARTAGÉ. Toutes les specs ouvrent le même `index.html` en `file://` et
// partagent donc le localStorage de cette origine (cf. `playwright.config.js`,
// `workers: 1`). Ce fichier POSE `demo-actif` et `preferencesUtilisateur` : il
// doit les rendre comme il les a trouvés, sinon il fait rougir les specs
// suivantes pour une raison qui n'est pas la leur. D'où le nettoyage final.

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

/**
 * Ouvre l'application avec un état de départ imposé.
 * `db.setSync` écrit du JSON dans localStorage (`js/db.js:629`) — on écrit donc
 * du JSON, pas la chaîne brute.
 */
async function ouvrir(page, { demoActif = false, modeExpert = false } = {}) {
    await page.addInitScript(({ demo, expert }) => {
        try {
            localStorage.removeItem('demo-actif');
            if (demo) localStorage.setItem('demo-actif', JSON.stringify('true'));
            localStorage.setItem('preferencesUtilisateur', JSON.stringify({ modeExpert: expert }));
        } catch (e) { /* origine file:// sans storage : la précondition le dira */ }
    }, { demo: demoActif, expert: modeExpert });

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800); // laisse passer les listeners DOMContentLoaded
}

/**
 * Lit l'état RÉELLEMENT vu par l'application, par ses propres accesseurs.
 * Sans cette lecture, une clé effacée au boot (par exemple par la synchro
 * IndexedDB → localStorage de `db.init`) rendrait le test vert sans avoir
 * jamais mis l'application dans le cas qu'on prétend couvrir : on mesurerait
 * un zéro et on le lirait comme une conformité.
 */
async function etatVuParLApplication(page) {
    return page.evaluate(() => ({
        demoActif: window.db ? window.db.getSync('demo-actif', null) : '(db absent)',
        modeExpert: typeof window.obtenirPreference === 'function'
            ? window.obtenirPreference('modeExpert')
            : '(obtenirPreference absent)'
    }));
}

const sectionActive = (page) => page.evaluate(() => {
    const active = document.querySelector('.section.active');
    return active ? active.id : null;
});

test.afterAll(async ({ browser }) => {
    // Rendre l'origine file:// dans l'état où les autres specs l'attendent.
    const page = await browser.newPage();
    await page.goto(indexHtml);
    await page.evaluate(() => {
        try {
            localStorage.removeItem('demo-actif');
            localStorage.removeItem('preferencesUtilisateur');
        } catch (e) { /* rien à nettoyer */ }
    });
    await page.close();
});

test.describe('#640 — la section d\'ouverture', () => {

    test('garde de validité : le test SAIT distinguer l\'accueil du Suivi', async ({ page }) => {
        // Sans ce cas, un sélecteur devenu faux (`.section.active` renommé,
        // `#section-accueil` disparu) rendrait tous les cas ci-dessous verts
        // pour la mauvaise raison — ils vérifieraient « pas le Suivi » sur une
        // page où RIEN n'est actif.
        const erreurs = [];
        brancherErreurs(page, erreurs);
        await ouvrir(page, {});

        expect(await sectionActive(page)).toBe('section-accueil');

        // On navigue à la main : la mesure doit suivre.
        await page.evaluate(() => window.naviguerVers('suivi', 'groupe'));
        await page.waitForTimeout(300);
        expect(await sectionActive(page)).toBe('section-suivi');

        expect(erreurs, 'erreurs console inattendues').toEqual([]);
    });

    const combinaisons = [
        { demoActif: false, modeExpert: false, libelle: 'ni démo ni expert (primo-arrivant)' },
        { demoActif: true, modeExpert: false, libelle: 'démo active seule' },
        { demoActif: false, modeExpert: true, libelle: 'mode expert seul' },
        { demoActif: true, modeExpert: true, libelle: 'démo ET expert' }
    ];

    combinaisons.forEach(({ demoActif, modeExpert, libelle }) => {
        test(`ouvre sur l'accueil — ${libelle}`, async ({ page }) => {
            const erreurs = [];
            brancherErreurs(page, erreurs);
            await ouvrir(page, { demoActif, modeExpert });

            // 1. La précondition tient-elle ? Si l'état posé n'a pas survécu au
            //    boot, ce test ne couvre pas le cas annoncé et doit le DIRE.
            const etat = await etatVuParLApplication(page);
            expect(etat.demoActif, 'précondition `demo-actif` non tenue — le test ne couvre pas le cas annoncé')
                .toBe(demoActif ? 'true' : null);
            expect(etat.modeExpert, 'précondition `modeExpert` non tenue — le test ne couvre pas le cas annoncé')
                .toBe(modeExpert);

            // 2. Et l'écran montre l'accueil.
            expect(
                await sectionActive(page),
                'Décision de parcours de Grégoire (8f4ff85d) — voir js/main.js:986-990, '
                + 'qui nomme la ligne à remettre si le raccourci doit revenir.'
            ).toBe('section-accueil');

            expect(erreurs, 'erreurs console inattendues').toEqual([]);
        });
    });

});
