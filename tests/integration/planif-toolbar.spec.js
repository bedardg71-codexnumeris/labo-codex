import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Plein écran de la carte mentale (Alignement pédagogique) — 4 août 2026.
//
// Constat terrain (exercice 601-101) : en plein écran, le titre de section
// « Alignement pédagogique » et son sous-titre restaient affichés en haut à
// gauche, et la navigation principale demeurait visible par transparence.
// Cause : le conteneur passé en plein écran est la sous-section ENTIÈRE
// (#conception-carte, qui contient le h2 + p), et #conception-carte a
// background:none — contrairement à Annoter, dont le conteneur plein écran
// (#travaux-conteneur-document) est opaque et sans titre.
// Référence visuelle : plein écran de la page Annoter (rien d'autre que le
// module n'est visible).

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function attacherCaptureErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
}

async function ouvrirAppEnDemo(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForTimeout(1500);
}

async function montrerCarteMentale(page) {
    await page.evaluate(() => {
        document.querySelectorAll('.section.active, .sous-section.active')
            .forEach(el => el.classList.remove('active'));
        document.getElementById('section-conception')?.classList.add('active');
        document.getElementById('conception-carte')?.classList.add('active');
        if (window.planificationCarte && typeof window.planificationCarte.init === 'function') {
            window.planificationCarte.init();
        }
    });
    await page.waitForTimeout(800);
}

test('plein écran carte mentale — titre de section masqué, module seul visible, retour propre', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await ouvrirAppEnDemo(page);
    await montrerCarteMentale(page);

    const h2 = page.locator('#conception-carte > h2');
    const sousTitre = page.locator('#conception-carte > p.text-muted');

    // État normal : le titre de section est là.
    await expect(h2).toBeVisible();
    await expect(sousTitre).toBeVisible();

    // Entrer en plein écran par le vrai bouton (dispatcher data-action).
    await page.click('#planif-btn-plein-ecran');
    await page.waitForTimeout(300);

    // 1. Le titre et le sous-titre de section disparaissent.
    await expect(h2).toBeHidden();
    await expect(sousTitre).toBeHidden();

    // 2. Le module occupe le viewport depuis le bord haut : le wrapper opaque
    //    commence à y=0 (c'est lui qui couvre la navigation principale,
    //    comme le conteneur d'Annoter).
    const wrapperTop = await page.evaluate(() => {
        return document.querySelector('#conception-carte .planif-wrapper')
            .getBoundingClientRect().top;
    });
    expect(wrapperTop).toBe(0);

    // 3. La navigation principale est masquée (demande terrain du 4 août :
    //    rien d'autre que le module en plein écran, comme Annoter).
    await expect(page.locator('.navigation-principale')).toBeHidden();

    // Sortir du plein écran (Échap) : le titre et la navigation reviennent.
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(h2).toBeVisible();
    await expect(sousTitre).toBeVisible();
    await expect(page.locator('.navigation-principale')).toBeVisible();

    expect(erreurs).toEqual([]);
});

test('bouton Vue globale — dans la zone droite de la barre, hors du carrousel, état synchronisé', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await ouvrirAppEnDemo(page);
    await montrerCarteMentale(page);
    await page.evaluate(() => window.planificationCarte.initialiser());
    await page.waitForTimeout(400);

    // Donner des séquences à la carte (le bouton n'a de sens qu'avec des séquences).
    await page.evaluate(() => {
        window.planificationCarte.injecterNoeuds([
            { id: 'seqT1', type: 'sequence', titre: 'Séquence test 1', x: 400, y: 100, enfants: [] },
            { id: 'seqT2', type: 'sequence', titre: 'Séquence test 2', x: 900, y: 300, enfants: [] }
        ]);
    });
    await page.waitForTimeout(500);

    const btn = page.locator('.planif-toolbar-droite #planif-btn-vue-globale');

    // Déplacé le 4 août 2026 (exercice 601-101) : le bouton vit dans la zone
    // droite, plus DANS le carrousel des séquences.
    await expect(btn).toBeVisible();
    await expect(page.locator('#planif-toolbar-sequences .planif-seq-badge-global')).toHaveCount(0);

    // Vue globale par défaut → bouton actif.
    await expect(btn).toHaveClass(/actif/);

    // Ouvrir une séquence → le bouton se désactive.
    await page.click('#planif-toolbar-sequences .planif-seq-badge');
    await page.waitForTimeout(400);
    await expect(btn).not.toHaveClass(/actif/);

    // Cliquer le bouton → retour vue globale, aucun badge de séquence actif.
    await btn.click();
    await page.waitForTimeout(400);
    await expect(btn).toHaveClass(/actif/);
    await expect(page.locator('#planif-toolbar-sequences .planif-seq-badge.actif')).toHaveCount(0);

    expect(erreurs).toEqual([]);
});
