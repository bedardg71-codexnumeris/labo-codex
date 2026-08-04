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

test('palette Navigation — sommaire Vue globale › séquences › leçons, barre sans carrousels', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await ouvrirAppEnDemo(page);
    await montrerCarteMentale(page);
    await page.evaluate(() => window.planificationCarte.initialiser());
    await page.waitForTimeout(400);

    await page.evaluate(() => {
        window.planificationCarte.injecterNoeuds([
            { id: 'seqT1', type: 'sequence', titre: 'Séquence test 1', x: 400, y: 100, enfants: ['lecT1'] },
            { id: 'lecT1', type: 'lecon', titre: 'Leçon test 1', x: 430, y: 160, parent: 'seqT1' },
            { id: 'seqT2', type: 'sequence', titre: 'Séquence test 2', x: 900, y: 400, enfants: [] }
        ]);
    });
    await page.waitForTimeout(500);

    // Refonte du 4 août 2026 (exercice 601-101) : la navigation vit dans la
    // palette « Navigation » (sommaire vertical), plus dans la barre d'outils.
    await expect(page.locator('#planif-toolbar-sequences')).toHaveCount(0);
    await expect(page.locator('#planif-nav-seq')).toHaveCount(0);
    await expect(page.locator('#planif-toolbar-lecons')).toHaveCount(0);
    await expect(page.locator('#planif-btn-largeur')).toHaveCount(0);
    await expect(page.locator('#planif-btn-hauteur')).toHaveCount(0);

    // Le bouton Recentrer remplace les zooms pleine largeur/hauteur.
    await expect(page.locator('#planif-btn-recentrer')).toBeVisible();

    const globale = page.locator('#planif-sommaire .planif-som-globale');
    const sequencesSom = page.locator('#planif-sommaire .planif-som-seq');
    const leconsSom = page.locator('#planif-sommaire .planif-som-lecon');

    // Sommaire complet : Vue globale (active par défaut) + toutes les
    // séquences + toutes les leçons, visibles d'un coup.
    await expect(globale).toBeVisible();
    await expect(globale).toHaveClass(/actif/);
    const nbSeq = await sequencesSom.count();
    expect(nbSeq).toBeGreaterThanOrEqual(2);
    await expect(leconsSom.filter({ hasText: 'Leçon test 1' })).toHaveCount(1);

    // Ouvrir une séquence depuis le sommaire → elle devient active.
    await sequencesSom.filter({ hasText: 'Séquence test 2' }).click();
    await page.waitForTimeout(400);
    await expect(globale).not.toHaveClass(/actif/);
    await expect(sequencesSom.filter({ hasText: 'Séquence test 2' })).toHaveClass(/actif/);

    // Cliquer une leçon d'une AUTRE séquence : bascule de séquence parente
    // + ouverture de la vue leçon (niveau micro).
    await leconsSom.filter({ hasText: 'Leçon test 1' }).click();
    await page.waitForTimeout(400);
    await expect(sequencesSom.filter({ hasText: 'Séquence test 1' })).toHaveClass(/actif/);
    await expect(leconsSom.filter({ hasText: 'Leçon test 1' })).toHaveClass(/actif/);
    await expect(page.locator('#planif-vue-lecon')).toBeVisible();

    // Retour Vue globale : canevas restauré, plus aucune séquence active.
    await globale.click();
    await page.waitForTimeout(400);
    await expect(globale).toHaveClass(/actif/);
    await expect(page.locator('#planif-sommaire .planif-som-seq.actif')).toHaveCount(0);
    await expect(page.locator('#planif-vue-lecon')).toBeHidden();

    expect(erreurs).toEqual([]);
});

test('renommer la carte — via le menu Actions, le titre central est retiré', async ({ page }) => {
    // Accepter le prompt de renommage (enregistré AVANT le dismiss générique
    // du helper : le premier handler gagne, le dismiss tardif est toléré).
    page.on('dialog', (d) => {
        if (d.type() === 'prompt') d.accept('Carte renommée par test').catch(() => {});
    });
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await ouvrirAppEnDemo(page);
    await montrerCarteMentale(page);
    await page.evaluate(() => window.planificationCarte.initialiser());
    await page.waitForTimeout(400);

    // L'ancien titre éditable du centre de la barre n'existe plus (4 août 2026 :
    // il dupliquait le sélecteur de gauche — le renommage vit dans Actions).
    await expect(page.locator('#planif-titre-carte')).toHaveCount(0);

    // Ouvrir le menu Actions → « Renommer cette carte » présent.
    await page.click('#planif-btn-actions');
    const itemRenommer = page.locator('#planif-btn-renommer-carte');
    await expect(itemRenommer).toBeVisible();

    // Renommer (le prompt est auto-accepté avec le nouveau nom).
    await itemRenommer.click();
    await page.waitForTimeout(400);

    // Le sélecteur de gauche reflète le nouveau nom (source unique : l'index).
    const nomSelectionne = await page.evaluate(() => {
        const sel = document.getElementById('planif-liste-cartes');
        return sel.options[sel.selectedIndex]?.textContent;
    });
    expect(nomSelectionne).toBe('Carte renommée par test');

    expect(erreurs).toEqual([]);
});
