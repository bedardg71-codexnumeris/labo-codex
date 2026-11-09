import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// =======================================================================
// LOT « LES DEUX PARCOURS » — 8 NOVEMBRE 2026, PARTIE 1
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md. Ce banc juge :
//   · le menu : « Assistance » remplace « Visite guidée » et l'interrupteur, porte le rang ;
//   · le panneau : contenu, états, fermeture (bouton, Échap, voile), pleine largeur sous 780 px,
//     l'interrupteur « Aide dans les pages » (même préférence) ;
//   · « Découvrir » de bout en bout sur la démo, en faisant les gestes : chaque étape avance
//     sur l'ÉTAT atteint ; l'iPhone passe par le bouton de section ;
//   · « Quitter le parcours » referme la démo qu'il a ouverte et ramène où l'on était ;
//     « Reprendre » repart à la même étape ;
//   · la sentinelle des chiffres de la démo (étapes 2 à 4) : si le pack ne les donne plus,
//     ce banc dit quels textes revoir.
// L'apparence se juge sur capture : CAPTURES_PARCOURS=<dossier> npx playwright test parcours-1-et-2

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
const HORLOGE = new Date('2026-11-10T14:00:00.000Z');
const CAPTURES = process.env.CAPTURES_PARCOURS || '';

async function capture(page, nom) {
    if (!CAPTURES) return;
    fs.mkdirSync(CAPTURES, { recursive: true });
    // Le pointeur du banc reste sur le dernier bouton touché : son infobulle n'est pas ce qu'on juge.
    await page.mouse.move(2, (page.viewportSize().height / 2) | 0);
    await page.evaluate(() => window.accompagnement && window.accompagnement.masquerHover && window.accompagnement.masquerHover());
    // Le panneau glisse, le voile s'assombrit : la capture attend que leurs transitions soient finies.
    await page.waitForFunction(() => document.getAnimations()
        .filter((a) => a.effect && a.effect.target && a.effect.target.closest
            && a.effect.target.closest('#panneau-assistance, #parcours-voile, #parcours-bulle, #entete-menu-panneau'))
        .every((a) => a.playState !== 'running'));
    await page.screenshot({ path: path.join(CAPTURES, nom + '.png') });
}

async function ouvrirEspaceVide(page, largeur, { clair = false, hauteur = 900 } = {}) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.clock.setFixedTime(HORLOGE);
    await page.setViewportSize({ width: largeur, height: hauteur });
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
    await poserTheme(page, clair);
}

async function poserTheme(page, clair) {
    await page.evaluate((c) => {
        definirPreference('modeClair', c);
        document.body.classList.toggle('mode-clair', c);
    }, clair);
}

async function ouvrirPanneau(page) {
    await page.click('#entete-menu-bouton');
    await page.click('#btn-assistance-menu');
    await expect(page.locator('#panneau-assistance')).toBeVisible();
}

const bulle = (page) => page.locator('#parcours-bulle');

async function attendreEtape(page, n) {
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(n + ' sur 8', { timeout: 10000 });
    // La bulle est rendue après la préparation de l'étape, et prend alors le focus.
    await expect(bulle(page)).toBeFocused();
}

/** Le contour doit être posé SUR l'élément attendu (la sonde du moteur passe toutes les 120 ms). */
async function contourSur(page, selecteur) {
    await expect.poll(() => page.evaluate((sel) => {
        const c = document.getElementById('parcours-contour');
        const el = document.querySelector(sel);
        if (!c || c.hidden || !el) return 'absent';
        const a = c.getBoundingClientRect(), b = el.getBoundingClientRect();
        const dx = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
        const dy = Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2);
        return dx < 3 && dy < 3 ? 'posé' : 'décalé de ' + Math.round(dx) + ', ' + Math.round(dy);
    }, selecteur), { message: 'contour posé sur ' + selecteur, timeout: 3000 }).toBe('posé');
}

/** La bulle ne couvre pas la zone éclairée (les trous du voile). */
async function bulleNeCouvrePasLeContour(page) {
    const chevauche = await page.evaluate(() => {
        const c = document.getElementById('parcours-contour');
        if (!c || c.hidden) return false;
        const a = c.getBoundingClientRect(), b = document.getElementById('parcours-bulle').getBoundingClientRect();
        return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
    });
    expect(chevauche).toBe(false);
}

const MENU_ATTENDU = ['Assistance', 'Aide', 'Signaler', 'Soutenir', 'Réglages'];

test('menu : une seule entrée « Assistance », avant Aide, Signaler, Soutenir, Réglages ; le rang du parcours à venir', async ({ page }) => {
    await ouvrirEspaceVide(page, 1180);
    await page.click('#entete-menu-bouton');
    const mots = await page.locator('#entete-menu-panneau .entete-menu-mot').allTextContents();
    expect(mots.map((m) => m.trim())).toEqual(MENU_ATTENDU);
    await expect(page.locator('#entete-menu-panneau')).not.toContainText('Visite guidée');
    await expect(page.locator('#btn-assistance-nav')).toHaveCount(0);
    await expect(page.locator('#assistance-menu-rang')).toHaveText('1 sur 2');
    await capture(page, 'menu-1180-sombre-rien-de-fait');
});

test('panneau : titre, phrase, « Tes parcours », deux parcours à faire, l’aide dans les pages ; Échap, voile et bouton le ferment', async ({ page }) => {
    await ouvrirEspaceVide(page, 1180);
    await ouvrirPanneau(page);
    const p = page.locator('#panneau-assistance');
    await expect(p).toHaveAttribute('role', 'dialog');
    await expect(p.locator('.assistance-titre')).toHaveText('Assistance');
    await expect(p.locator('.assistance-intro')).toHaveText('Des parcours où tu fais les gestes toi-même, accompagné·e pas à pas : quoi faire, comment le faire, et pourquoi.');
    await expect(p.locator('.assistance-intitule')).toHaveText('Tes parcours');
    await expect(p.locator('.assistance-parcours-titre')).toHaveText(['Découvrir', 'Mettre ta classe en place']);
    await expect(p.locator('.assistance-parcours-ligne')).toHaveText([
        "Ce que Labo Codex te montre avant d'entrer en classe, sur une classe de démonstration.",
        "De ton trimestre à ta première saisie de présences : ta classe d'un coup d'œil."
    ]);
    await expect(p.locator('.assistance-parcours-etat')).toHaveText(['À faire', 'À faire']);
    await expect(p.locator('.assistance-parcours-bouton')).toHaveText(['Commencer', 'Commencer']);
    await expect(p.locator('.assistance-aide-titre')).toHaveText('Aide dans les pages');
    await expect(p.locator('.assistance-aide-ligne')).toHaveText('Infobulles et flèches qui expliquent ce que tu touches.');

    // Sous l'en-tête, ~430 px, collé à droite.
    const g = await page.evaluate(() => {
        const r = document.getElementById('panneau-assistance').getBoundingClientRect();
        return { w: r.width, droite: window.innerWidth - r.right, haut: r.top, entete: document.querySelector('header.entete').getBoundingClientRect().bottom };
    });
    expect(g.w).toBe(430);
    expect(g.droite).toBe(0);
    expect(Math.abs(g.haut - g.entete)).toBeLessThan(2);
    await capture(page, 'panneau-1180-sombre-rien-de-fait');

    // L'interrupteur : même préférence, même comportement.
    const inter = p.locator('#assistance-interrupteur');
    await expect(inter).toHaveAttribute('role', 'switch');
    const avant = await page.evaluate(() => obtenirPreference('accompagnementActif'));
    await expect(inter).toHaveAttribute('aria-checked', String(avant));
    await inter.click();
    await expect(inter).toHaveAttribute('aria-checked', String(!avant));
    expect(await page.evaluate(() => obtenirPreference('accompagnementActif'))).toBe(!avant);
    await inter.click();

    await page.keyboard.press('Escape');
    await expect(page.locator('#panneau-assistance')).toHaveCount(0);
    await ouvrirPanneau(page);
    await page.mouse.click(100, 500); // le voile, hors du panneau
    await expect(page.locator('#panneau-assistance')).toHaveCount(0);
    await ouvrirPanneau(page);
    await page.click('#panneau-assistance .assistance-fermer');
    await expect(page.locator('#panneau-assistance')).toHaveCount(0);
});

test('« À propos » : le lien « Assistance » ouvre le panneau', async ({ page }) => {
    await ouvrirEspaceVide(page, 1180);
    await page.evaluate(() => { afficherSection('accueil'); afficherAccueil(); });
    const lien = page.locator('#banniere-bienvenue .apropos-lien', { hasText: 'Assistance' });
    await expect(lien).toHaveCount(1);
    await expect(page.locator('#banniere-bienvenue .apropos-lien', { hasText: 'Visite guidée' })).toHaveCount(0);
    await lien.click();
    await expect(page.locator('#panneau-assistance')).toBeVisible();
});

test('« Découvrir » de bout en bout sur la démo, en faisant les gestes (1180 px)', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirEspaceVide(page, 1180);
    expect(await page.evaluate(() => estEnModeDemo())).toBe(false);
    await ouvrirPanneau(page);
    await page.click('#panneau-assistance [data-parcours="decouvrir"] .assistance-parcours-bouton');

    // Étape 1 : la démo s'est ouverte ; la bande d'assiduité éclairée, le contour sur « Détails ».
    await attendreEtape(page, 1);
    expect(await page.evaluate(() => estEnModeDemo())).toBe(true);
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText("Ta classe d'un coup d'œil");
    await expect(bulle(page)).toBeFocused();
    await expect(page.locator('#parcours-annonce')).toHaveAttribute('aria-live', 'polite');
    await contourSur(page, '#btn-toggle-panneau-prioritaire');
    await bulleNeCouvrePasLeContour(page);
    // Le jalon de transitions.js ne couvre pas l'étape.
    await expect(page.locator('#transition-bandeau')).toBeHidden();
    await capture(page, 'decouvrir-1-1180-sombre');
    // Le menu dit qu'un parcours est en cours : le premier.
    expect(await page.locator('#assistance-menu-rang').textContent()).toBe('1 sur 2');
    await page.click('#btn-toggle-panneau-prioritaire');

    // Étape 2 : la pastille de Loyal Suricate, le contour sur son A.
    await attendreEtape(page, 2);
    const da = await page.evaluate(() => (db.getSync(cle('groupeEtudiants'), []) || []).find((e) => e.nom === 'Loyal' && e.prenom === 'Suricate').da);
    const badgeA = `#panneau-suivi-etudiants .etudiant-suivi-item[data-da="${da}"] .prioritaire-indice`;
    await contourSur(page, badgeA);
    await bulleNeCouvrePasLeContour(page);
    await capture(page, 'decouvrir-2-1180-sombre');
    await page.locator(badgeA).first().click();

    // Étape 3 : son profil, Engagement ACP ; le contour sur « Accompagnement ».
    await attendreEtape(page, 3);
    const ongletAcc = '#contenuProfilEtudiant [data-action="changerSectionProfil"][data-param="accompagnement"]';
    await contourSur(page, ongletAcc);
    await bulleNeCouvrePasLeContour(page);
    await capture(page, 'decouvrir-3-1180-sombre');
    await page.click(ongletAcc);

    // Étape 4 : la carte RàI, rien à toucher ; « Continuer ».
    await attendreEtape(page, 4);
    await expect(page.locator('#parcours-contour')).toBeHidden();
    await capture(page, 'decouvrir-4-1180-sombre');
    await bulle(page).getByRole('button', { name: 'Continuer' }).click();

    // Étape 5 : la bulle au centre, seul « Évaluation » éclairé.
    await attendreEtape(page, 5);
    await contourSur(page, '.navigation-boutons button[data-onglet="evaluations"]');
    await expect(page.locator('#parcours-voile')).toHaveClass(/parcours-voile--dense/);
    await capture(page, 'decouvrir-5-1180-sombre');
    await page.click('.navigation-boutons button[data-onglet="evaluations"]');

    // Étape 6 : Évaluation › Préparer sous un voile léger, « Conception » éclairé.
    await attendreEtape(page, 6);
    await expect(page.locator('#evaluations-importer')).toBeVisible();
    await expect(page.locator('#parcours-voile')).toHaveClass(/parcours-voile--leger/);
    await contourSur(page, '.navigation-boutons button[data-onglet="conception"]');
    await capture(page, 'decouvrir-6-1180-sombre');
    await page.click('.navigation-boutons button[data-onglet="conception"]');

    // Étape 7 : Conception › Mon matériel, « Cadre » éclairé.
    await attendreEtape(page, 7);
    await expect(page.locator('#conception-materiel')).toBeVisible();
    await contourSur(page, '.navigation-boutons button[data-onglet="calendrier"]');
    await capture(page, 'decouvrir-7-1180-sombre');
    await page.click('.navigation-boutons button[data-onglet="calendrier"]');

    // Étape 8 : Cadre › Trimestre, la bulle au centre, deux boutons, pas de lien de sortie.
    await attendreEtape(page, 8);
    await expect(page.locator('#calendrier-trimestre')).toBeVisible();
    await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
    await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Commencer avec ma classe', "Continuer d'explorer la démo"]);
    await capture(page, 'decouvrir-8-1180-sombre');
    await bulle(page).getByRole('button', { name: "Continuer d'explorer la démo" }).click();

    // Fin : le parcours fermé, la démo reste ouverte, « Découvrir » est fait, le menu passe au 2.
    await expect(bulle(page)).toHaveCount(0);
    expect(await page.evaluate(() => document.body.classList.contains('parcours-actif'))).toBe(false);
    expect(await page.evaluate(() => estEnModeDemo())).toBe(true);
    expect(await page.evaluate(() => Assistance.etatDe('decouvrir').etat)).toBe('fait');
    await expect(page.locator('#assistance-menu-rang')).toHaveText('2 sur 2');
    await ouvrirPanneau(page);
    const item = page.locator('#panneau-assistance [data-parcours="decouvrir"]');
    await expect(item).toHaveAttribute('data-etat', 'fait');
    await expect(item.locator('.assistance-parcours-etat')).toHaveText('Fait');
    await expect(item.locator('.assistance-parcours-bouton')).toHaveText('Refaire');
});

test('« Quitter le parcours » referme la démo qu’il a ouverte, ramène où l’on était, puis « Reprendre » repart à la même étape', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirEspaceVide(page, 1180);
    await page.evaluate(() => naviguerVers('conception', 'materiel'));
    await ouvrirPanneau(page);
    await page.click('#panneau-assistance [data-parcours="decouvrir"] .assistance-parcours-bouton');
    await attendreEtape(page, 1);
    await page.click('#btn-toggle-panneau-prioritaire');
    await attendreEtape(page, 2);
    await bulle(page).getByRole('button', { name: 'Quitter le parcours' }).click();

    await expect(bulle(page)).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => estEnModeDemo())).toBe(false);
    await expect(page.locator('#conception-materiel')).toBeVisible();
    await expect(page.locator('.notifications-pile')).toContainText('Tu pourras reprendre ce parcours depuis « Assistance », dans le menu.');
    expect(await page.evaluate(() => Assistance.etatDe('decouvrir'))).toEqual({ etat: 'en-cours', etape: 1 });

    await ouvrirPanneau(page);
    const item = page.locator('#panneau-assistance [data-parcours="decouvrir"]');
    await expect(item.locator('.assistance-parcours-etat')).toHaveText('Étape 2 sur 8');
    await expect(item.locator('.assistance-parcours-bouton')).toHaveText('Reprendre');
    await expect(item.locator('.assistance-parcours-bouton')).toHaveClass(/assistance-parcours-bouton--plein/);
    await capture(page, 'panneau-1180-sombre-un-en-cours');
    await page.click('#entete-menu-bouton').catch(() => {});
    await item.locator('.assistance-parcours-bouton').click();

    await attendreEtape(page, 2);
    expect(await page.evaluate(() => estEnModeDemo())).toBe(true);
    // Échap équivaut au lien de sortie.
    await page.keyboard.press('Escape');
    await expect(bulle(page)).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => estEnModeDemo())).toBe(false);
});

test('sentinelle : les chiffres des étapes 2 à 4 sont ceux du pack démo (sinon, revoir leurs textes)', async ({ page }) => {
    await ouvrirEspaceVide(page, 1180);
    await page.evaluate(async () => { await activerModeDemo(); });
    await page.evaluate(() => naviguerVers('suivi', 'groupe'));
    await page.click('#btn-toggle-panneau-prioritaire');
    const assiduites = await page.evaluate(() => [...document.querySelectorAll('#panneau-suivi-etudiants .etudiant-suivi-item')].map((it) => ({
        nom: it.textContent.split('A ')[0].trim(),
        A: parseFloat((it.querySelector('.prioritaire-indice')?.textContent || '').replace(/[^\d,]/g, '').replace(',', '.'))
    })));
    expect(assiduites.length, 'dix étudiant·es (étape 1)').toBe(10);
    const loyal = assiduites.find((e) => e.nom.startsWith('Loyal'));
    const autres = assiduites.filter((e) => e !== loyal);
    expect(loyal.A, 'étape 2 : « 84 % »').toBe(84);
    expect(Math.min(...autres.map((e) => e.A)), 'étape 2 : « tous les autres sont à 93 % ou plus »').toBeGreaterThanOrEqual(93);

    const da = await page.evaluate(() => (db.getSync(cle('groupeEtudiants'), []) || []).find((e) => e.nom === 'Loyal').da);
    await page.evaluate((d) => { afficherProfilComplet(d); }, da);
    await page.evaluate(() => changerSectionProfil('mobilisation'));
    const engagement = await page.locator('#profil-contenu-dynamique').textContent();
    expect(engagement, 'étape 3 : « Cinq absences ou retards »').toMatch(/\b5 absences ou retards\b/);
    expect(engagement, 'étape 3 : « deux productions non remises »').toMatch(/Productions remises\s*:\s*8\s*\/\s*10/);

    await page.evaluate(() => changerSectionProfil('accompagnement'));
    const rai = await page.locator('#profil-contenu-dynamique').textContent();
    expect(rai, 'étape 4 : « au niveau 2 (préventif) »').toMatch(/Niveau 2 - Préventif/);
    expect(rai, 'étape 4 : « son défi principal : la nuance »').toMatch(/Défi principal\s*:\s*Nuance/i);
});

test('iPhone (390 px) : les étapes 1, 5 et 8 ; la navigation passe par le bouton de section', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirEspaceVide(page, 390, { hauteur: 844 });
    await page.evaluate(() => Assistance.parcours()[0].lancer(0));
    await attendreEtape(page, 1);
    await bulleNeCouvrePasLeContour(page);
    await capture(page, 'decouvrir-1-390-sombre');
    // Les étapes 2 à 4 par leurs gestes.
    await page.click('#btn-toggle-panneau-prioritaire');
    await attendreEtape(page, 2);
    const da = await page.evaluate(() => (db.getSync(cle('groupeEtudiants'), []) || []).find((e) => e.nom === 'Loyal').da);
    await page.locator(`#panneau-suivi-etudiants .etudiant-suivi-item[data-da="${da}"] .prioritaire-indice`).first().click();
    await attendreEtape(page, 3);
    await page.click('#contenuProfilEtudiant [data-action="changerSectionProfil"][data-param="accompagnement"]');
    await attendreEtape(page, 4);
    await bulle(page).getByRole('button', { name: 'Continuer' }).click();

    // Étape 5 : le contour sur le bouton de section, puis sur la ligne « Évaluation » de la liste.
    await attendreEtape(page, 5);
    await contourSur(page, '#entete-section-bouton');
    await capture(page, 'decouvrir-5-390-sombre');
    await page.click('#entete-section-bouton');
    await contourSur(page, '#entete-sections-liste [data-param="evaluations"]');
    await page.click('#entete-sections-liste [data-param="evaluations"]');
    await attendreEtape(page, 6);
    await page.click('#entete-section-bouton');
    await page.click('#entete-sections-liste [data-param="conception"]');
    await attendreEtape(page, 7);
    await page.click('#entete-section-bouton');
    await page.click('#entete-sections-liste [data-param="calendrier"]');
    await attendreEtape(page, 8);
    await capture(page, 'decouvrir-8-390-sombre');
    // La bulle tient dans l'écran.
    const r = await bulle(page).boundingBox();
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.x + r.width).toBeLessThanOrEqual(390);
});

test('captures du menu et du panneau : 1180 et 390 px, sombre et clair, trois états', async ({ page }) => {
    test.skip(!CAPTURES, 'captures seulement (CAPTURES_PARCOURS)');
    test.setTimeout(120000);
    const ETATS = {
        'rien-de-fait': {},
        'un-en-cours': { decouvrir: { etat: 'fait', etape: 0 }, classe: { etat: 'en-cours', etape: 4 } },
        'tout-fait': { decouvrir: { etat: 'fait', etape: 0 }, classe: { etat: 'fait', etape: 0 } }
    };
    for (const largeur of [1180, 390]) {
        await ouvrirEspaceVide(page, largeur, { hauteur: largeur === 390 ? 844 : 900 });
        for (const clair of [false, true]) {
            await poserTheme(page, clair);
            for (const [nom, etat] of Object.entries(ETATS)) {
                await page.evaluate((e) => { definirPreference('parcoursAssistance', e); Assistance.majMenu(); }, etat);
                const theme = clair ? 'clair' : 'sombre';
                await page.click('#entete-menu-bouton');
                await capture(page, `menu-${largeur}-${theme}-${nom}`);
                await page.click('#btn-assistance-menu');
                await capture(page, `panneau-${largeur}-${theme}-${nom}`);
                await page.keyboard.press('Escape');
            }
        }
    }
    // Sous 780 px, le panneau occupe toute la largeur.
    await page.click('#entete-menu-bouton');
    await page.click('#btn-assistance-menu');
    const w = await page.evaluate(() => document.getElementById('panneau-assistance').getBoundingClientRect().width);
    expect(w).toBe(390);
});
