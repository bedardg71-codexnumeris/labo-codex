import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';
import { attendreRepos, suivreLesReactions } from './harness/attendre-repos.js';

// =======================================================================
// LOT 3 « LES PAGES SANS DOUBLONS » — 7 NOVEMBRE 2026 (esquisse 67)
// =======================================================================
// Consigne : plans de travail/CONSIGNE-2026-11-07-chaine-des-quatre-lots.md, § Lot 3. La géométrie et les gestes ;
// l'apparence se juge sur capture (CAPTURES_LOT3=<dossier>). La structure est verrouillée par
// tests/unit/sentinelle-pages-sans-doublons-2026-11-07.test.js.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

async function ouvrir(page, largeur, hauteur, { demo = true, vider = true } = {}) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.setViewportSize({ width: largeur, height: hauteur });
    await suivreLesReactions(page);
    await page.goto(indexHtml);
    await attendreApplication(page);
    if (vider) {
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
    }
    if (demo) {
        await page.evaluate(() => activerModeDemo());
        await page.waitForFunction(() => window.estEnModeDemo() && window.dbReady === true, null, { timeout: 30000 });
    }
}

const aller = (page, section, sous) => page.evaluate(([s, ss]) => { afficherSection(s); if (ss) afficherSousSection(ss); window.scrollTo(0, 0); }, [section, sous]);

test('un titre qui répète son onglet n\'occupe plus l\'écran, mais reste le titre de la page pour les lecteurs d\'écran', async ({ page }) => {
    await ouvrir(page, 1180, 820);
    await aller(page, 'suivi', 'suivi-saisie');
    const t = await page.evaluate(() => {
        const h2 = document.querySelector('#suivi-saisie h2');
        const texte = h2.querySelector('.titre-page-texte-masque').getBoundingClientRect();
        const i = h2.querySelector('.btn-aide-contextuelle').getBoundingClientRect();
        return { nom: h2.textContent.replace(/\s+/g, ' ').trim(), largeurTexte: texte.width, iVisible: i.width >= 24 && i.height >= 24 };
    });
    expect(t.nom).toContain('Saisie des présences');
    expect(t.largeurTexte).toBeLessThanOrEqual(1);
    expect(t.iVisible, 'le « i » de l\'aide reste à l\'écran').toBe(true);
    await expect(page.getByRole('heading', { name: /Saisie des présences/ })).toHaveCount(1);
    await aller(page, 'suivi', 'suivi-rencontres');
    await expect(page.locator('#suivi-rencontres h2')).toBeVisible();
});

test('la pastille des Nouveautés s\'allume à côté d\'« Accueil » ET du lien « Nouveautés » du pied de l\'accueil ; les ouvrir éteint les deux, sans recharger', async ({ page }) => {
    // 7 nov. : la pastille vivait seule dans la navigation. 11 nov. (Grégoire, 7 h 25) : « Sinon on ne sait
    // pas pourquoi il y a une pastille. La 2e nous le fait comprendre. » — la même, au pied de l'accueil.
    await ouvrir(page, 1180, 820, { demo: false });
    // Un build non vu : la version majeure est vue, le build ne l'est pas.
    await page.evaluate(() => {
        db.setSync('monitorage-version-vue', window.VERSION_MAJEURE);
        db.setSync('monitorage-build-vu', '0000-0000');
        afficherSection('accueil');
    });
    const etat = () => page.evaluate(() => ({
        menu: document.querySelector('.navigation-principale [data-onglet="accueil"] .pastille-nouveautes')?.classList.contains('pastille-active') ?? null,
        pied: document.querySelector('#accueil-contenu .accueil-pied .pastille-nouveautes')?.classList.contains('pastille-active') ?? null,
    }));
    expect(await etat()).toEqual({ menu: true, pied: true });
    const lien = page.locator('#accueil-contenu .accueil-pied').getByRole('button', { name: 'Nouveautés (disponibles)', exact: true });
    await expect(lien, 'l\'annonce, une fois : « Nouveautés (disponibles) »').toBeVisible();
    const pastillePied = await page.locator('#accueil-contenu .accueil-pied .pastille-nouveautes').boundingBox();
    expect(pastillePied && pastillePied.width >= 6 && pastillePied.height >= 6, 'le point est à l\'écran').toBe(true);
    // Ouvrir les Nouveautés par le lien du pied : les deux s'éteignent, la page n'est pas rechargée.
    await page.evaluate(() => { window.__memePage = true; });
    await lien.click();
    await expect(page.locator('#modalNouveautes')).toHaveClass(/actif/);
    expect(await etat()).toEqual({ menu: false, pied: false });
    await expect(page.locator('#accueil-contenu .accueil-pied').getByRole('button', { name: 'Nouveautés', exact: true })).toBeVisible();
    expect(await page.evaluate(() => window.__memePage === true), 'aucun rechargement').toBe(true);
});

/** Vrai si la phrase de la fenêtre d'aide « Données démo » est À L'ÉCRAN (la fenêtre fermée peut rester au DOM). */
const aideDemoAffichee = (page) => page.evaluate(() => {
    const dit = (e) => /Touche « Explorer » : elle s.ouvre dans Suivi › Groupe/.test(e.textContent.replace(/\s+/g, ' '));
    // L'élément le plus intérieur qui porte la phrase, et qui est à l'écran.
    return [...document.querySelectorAll('body *')].some((e) => dit(e) && ![...e.children].some(dit) && e.getClientRects().length > 0);
});

test('« Explorer » ouvre l\'aide « Données démo » la première fois, pas la seconde', async ({ page }) => {
    await ouvrir(page, 1180, 820, { demo: false });
    await page.evaluate(() => { afficherSection('accueil'); afficherAccueil(); });
    await page.getByRole('button', { name: 'Explorer', exact: true }).click();
    await page.waitForFunction(() => window.estEnModeDemo() && window.dbReady === true, null, { timeout: 30000 });
    await expect.poll(() => aideDemoAffichee(page), { message: 'la première fois, la fenêtre est à l\'écran' }).toBe(true);
    await page.evaluate(() => { window.accompagnement.fermerAide(); return window.desactiverModeDemo(); });
    await page.waitForFunction(() => !window.estEnModeDemo(), null, { timeout: 30000 });
    expect(await aideDemoAffichee(page), 'fermée').toBe(false);
    await page.evaluate(() => { afficherSection('accueil'); afficherAccueil(); });
    await page.getByRole('button', { name: 'Explorer', exact: true }).click();
    await page.waitForFunction(() => window.estEnModeDemo() && window.dbReady === true, null, { timeout: 30000 });
    await attendreRepos(page);   // l'application au repos : si la fenêtre devait s'ouvrir, elle l'aurait fait
    expect(await aideDemoAffichee(page), 'la seconde fois, rien ne s\'ouvre').toBe(false);
    expect(await page.evaluate(() => obtenirPreference('aideDemoVue'))).toBe(true);
});

test('carte d\'alignement : la loupe ouvre la recherche sous elle, Échap sur un champ vide la referme', async ({ page }) => {
    await ouvrir(page, 1180, 820);
    await aller(page, 'conception', 'conception-carte');
    const zone = page.locator('#planif-recherche-zone');
    await expect(zone).toBeHidden();
    await page.click('#planif-btn-rechercher');
    await expect(zone).toBeVisible();
    await expect(page.locator('#planif-recherche-champ')).toBeFocused();
    await expect(page.locator('#planif-btn-rechercher')).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(zone).toBeHidden();
    await expect(page.locator('#planif-btn-rechercher')).toBeFocused();
    expect(await page.evaluate(() => document.querySelector('.planif-header-toolbar').offsetHeight), 'une rangée').toBeLessThanOrEqual(60);
});

// ─── Captures pour Grégoire (CAPTURES_LOT3=<dossier>) ─────────────────────────────────────
const CAPTURES = process.env.CAPTURES_LOT3;
const PAGES = [
    ['conception', 'conception-carte', 'carte-alignement'],
    ['conception', 'conception-materiel', 'mon-materiel'],
    ['calendrier', 'calendrier-trimestre', 'cadre-trimestre'],
    ['conception', 'conception-productions', 'conception-productions'],
    ['evaluations', 'evaluations-liste', 'evaluation-liste'],
    ['suivi', 'suivi-saisie', 'suivi-presences'],
    ['labo', 'labo-rythme', 'labo-rythme'],
    ['aide', 'aide-commencer', 'aide-commencer'],
    ['reglages', 'reglages-preferences', 'reglages-preferences']
];
for (const largeur of [1180, 820]) {
    for (const clair of [false, true]) {
        test(`captures · ${largeur} px, ${clair ? 'clair' : 'sombre'}`, async ({ page }) => {
            test.skip(!CAPTURES, 'CAPTURES_LOT3 non défini');
            test.setTimeout(120000);
            await ouvrir(page, largeur, 900);
            for (const [s, ss, nom] of PAGES) {
                await page.evaluate(([s, ss, clair]) => { document.body.classList.toggle('mode-clair', clair); afficherSection(s); afficherSousSection(ss); window.scrollTo(0, 0); }, [s, ss, clair]);
                await attendreRepos(page);
                await page.screenshot({ path: path.join(CAPTURES, `${nom}-${largeur}-${clair ? 'clair' : 'sombre'}.png`), clip: { x: 0, y: 0, width: largeur, height: 900 } });
            }
        });
    }
}
test('captures · le témoin à sa place dans la page (390 px, sous le seuil de 780 px)', async ({ page }) => {
    test.skip(!CAPTURES, 'CAPTURES_LOT3 non défini');
    await ouvrir(page, 390, 844);
    for (const clair of [false, true]) {
        await page.evaluate((clair) => {
            document.body.classList.toggle('mode-clair', clair);
            afficherSection('suivi'); afficherSousSection('suivi-groupe'); window.scrollTo(0, 0);
            window.temoinEnregistrement.nonEnregistre('la mémoire du navigateur est pleine. Pour libérer de la place : Cadre › Trimestre › Bibliothèque, « Supprimer… » sur un ancien trimestre.', 'Enregistrement de l\'évaluation');
        }, clair);
        await page.screenshot({ path: path.join(CAPTURES, `temoin-groupe-390-${clair ? 'clair' : 'sombre'}.png`) });
    }
});
