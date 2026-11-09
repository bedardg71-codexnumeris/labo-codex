import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// =======================================================================
// LOT « LA BULLE SUR TÉLÉPHONE » — 9 NOVEMBRE 2026
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-09-bulle-sur-telephone.md. Ce banc juge :
//   · à 390 px : la bulle rangée au bord de l'écran, repliée (titre et « n sur N ») sur une étape
//     qui désigne quoi toucher, dépliée quand le geste est dans la bulle ; un toucher sur la tête la
//     déplie, un autre la replie ; repliée ou dépliée, elle ne couvre pas ce qu'il faut toucher ;
//   · le témoin « Enregistré » passe au-dessus d'une bulle rangée en bas : le lien de sortie reste
//     visible et atteignable ;
//   · le filet de toutes les bulles : dans une fenêtre courte, la bulle s'y limite, seul son texte
//     défile, et le défilement ne passe pas à la page ;
//   · un parcours `grandEcranSeulement` : sur téléphone, le texte validé sous son titre, son
//     bouton ne lance rien ; au-delà, rien ne change ;
//   · à 1180 px, rien ne change : ni forme de téléphone, ni réserve sous le témoin.
// Les captures : CAPTURES_BULLE=<dossier> npx playwright test bulle-sur-telephone

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
const HORLOGE = new Date('2026-11-10T14:00:00.000Z');
const CAPTURES = process.env.CAPTURES_BULLE || '';
const TEXTE_GRAND_ECRAN = 'Ce parcours se fait sur un écran plus grand : une tablette ou un ordinateur.';

async function capture(page, nom) {
    if (!CAPTURES) return;
    fs.mkdirSync(CAPTURES, { recursive: true });
    await page.mouse.move(2, (page.viewportSize().height / 2) | 0);
    await page.waitForFunction(() => document.getAnimations()
        .filter((a) => a.effect && a.effect.target && a.effect.target.closest
            && a.effect.target.closest('#panneau-assistance, #parcours-voile, #parcours-bulle'))
        .every((a) => a.playState !== 'running'));
    await page.waitForTimeout(250); // deux passages de la sonde : la bulle est à sa place
    await page.screenshot({ path: path.join(CAPTURES, nom + '.png') });
}

async function ouvrirEspaceVide(page, largeur, hauteur) {
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
    await page.evaluate(() => { definirPreference('modeClair', false); document.body.classList.remove('mode-clair'); });
}

const bulle = (page) => page.locator('#parcours-bulle');
const bascule = (page) => page.locator('#parcours-bulle .parcours-bulle-bascule');

async function attendreEtape(page, n) {
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(n + ' sur 8', { timeout: 10000 });
    await expect(bulle(page)).toBeFocused();
    await page.waitForTimeout(250);
}

/**
 * La bulle ne chevauche pas la zone éclairée (le contour), et le centre de ce qu'il faut
 * toucher reçoit bien le toucher (ni la bulle, ni le voile, ni le témoin dessus).
 */
async function zoneLibreEtTouchable(page, selecteur) {
    await expect.poll(() => page.evaluate((sel) => {
        const c = document.getElementById('parcours-contour');
        const b = document.getElementById('parcours-bulle').getBoundingClientRect();
        if (!c || c.hidden) return 'pas de contour';
        const a = c.getBoundingClientRect();
        if (!(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top)) return 'la bulle couvre le contour';
        const el = document.querySelector(sel);
        const r = el.getBoundingClientRect();
        const dessus = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2);
        return dessus && (dessus === el || el.contains(dessus)) ? 'touchable' : 'couvert par ' + (dessus ? dessus.id || dessus.className : 'rien');
    }, selecteur), { message: 'zone libre et touchable : ' + selecteur, timeout: 3000 }).toBe('touchable');
}

async function etatBulle(page) {
    return page.evaluate(() => {
        const b = document.getElementById('parcours-bulle');
        const r = b.getBoundingClientRect();
        const texte = b.querySelector('.parcours-bulle-texte');
        return {
            telephone: b.classList.contains('parcours-bulle--telephone'),
            repliee: b.classList.contains('est-repliee'),
            texteVisible: !!texte && getComputedStyle(texte).display !== 'none',
            haut: Math.round(r.top), bas: Math.round(r.bottom), gauche: Math.round(r.left), droite: Math.round(r.right),
            hauteurFenetre: window.innerHeight
        };
    });
}

test('390 px : « Découvrir », étapes 1, 5 et 8 — repliée, dépliée, la zone éclairée touchable dans les deux états', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirEspaceVide(page, 390, 844);
    await page.evaluate(() => Assistance.parcours()[0].lancer(0));

    // Étape 1 : une zone éclairée, la bulle repliée en bas, pleine largeur.
    await attendreEtape(page, 1);
    let e = await etatBulle(page);
    expect(e).toMatchObject({ telephone: true, repliee: true, texteVisible: false, gauche: 8, droite: 382 });
    expect(e.bas).toBeGreaterThan(e.hauteurFenetre - 80);
    expect(e.bas - e.haut).toBeLessThan(80);
    await expect(bascule(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(bascule(page)).toHaveAccessibleName("Ta classe d'un coup d'œil");
    await zoneLibreEtTouchable(page, '#btn-toggle-panneau-prioritaire');
    await capture(page, 'decouvrir-1-390-repliee');

    // Un toucher la déplie : le texte paraît, la zone reste libre et touchable.
    await bascule(page).click();
    await expect(bascule(page)).toHaveAttribute('aria-expanded', 'true');
    e = await etatBulle(page);
    expect(e).toMatchObject({ repliee: false, texteVisible: true });
    await zoneLibreEtTouchable(page, '#btn-toggle-panneau-prioritaire');
    await capture(page, 'decouvrir-1-390-depliee');
    // Un autre la replie.
    await bascule(page).click();
    await expect(bascule(page)).toHaveAttribute('aria-expanded', 'false');
    expect((await etatBulle(page)).repliee).toBe(true);

    // Les étapes 2 à 4 par leurs gestes, la bulle repliée : rien ne l'empêche.
    await page.click('#btn-toggle-panneau-prioritaire');
    await attendreEtape(page, 2);
    const da = await page.evaluate(() => (db.getSync(cle('groupeEtudiants'), []) || []).find((x) => x.nom === 'Loyal').da);
    const badgeA = `#panneau-suivi-etudiants .etudiant-suivi-item[data-da="${da}"] .prioritaire-indice`;
    await zoneLibreEtTouchable(page, badgeA);
    await page.locator(badgeA).first().click();
    await attendreEtape(page, 3);
    const ongletAcc = '#contenuProfilEtudiant [data-action="changerSectionProfil"][data-param="accompagnement"]';
    await zoneLibreEtTouchable(page, ongletAcc);
    await page.click(ongletAcc);
    await attendreEtape(page, 4);
    // L'étape 4 : rien à toucher sur la page, le geste est « Continuer » : la bulle s'ouvre dépliée.
    e = await etatBulle(page);
    expect(e).toMatchObject({ telephone: true, repliee: false, texteVisible: true });
    await expect(bulle(page).getByRole('button', { name: 'Continuer' })).toBeInViewport({ ratio: 1 });
    await bulle(page).getByRole('button', { name: 'Continuer' }).click();

    // Étape 5 : le bouton de section éclairé, dans les deux états.
    await attendreEtape(page, 5);
    expect((await etatBulle(page)).repliee).toBe(true);
    await zoneLibreEtTouchable(page, '#entete-section-bouton');
    await capture(page, 'decouvrir-5-390-repliee');
    await bascule(page).click();
    await zoneLibreEtTouchable(page, '#entete-section-bouton');
    await capture(page, 'decouvrir-5-390-depliee');
    await page.click('#entete-section-bouton');
    await page.click('#entete-sections-liste [data-param="evaluations"]');
    await attendreEtape(page, 6);
    await page.click('#entete-section-bouton');
    await page.click('#entete-sections-liste [data-param="conception"]');
    await attendreEtape(page, 7);
    await page.click('#entete-section-bouton');
    await page.click('#entete-sections-liste [data-param="calendrier"]');

    // Étape 8 : rien à toucher sur la page : la bulle s'ouvre dépliée, ses deux boutons à portée.
    await attendreEtape(page, 8);
    e = await etatBulle(page);
    expect(e).toMatchObject({ telephone: true, repliee: false, texteVisible: true });
    expect(e.bas).toBeLessThanOrEqual(e.hauteurFenetre);
    await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Commencer avec ma classe', "Continuer d'explorer la démo"]);
    for (const b of await bulle(page).locator('.parcours-bulle-boutons button').all()) await expect(b).toBeInViewport({ ratio: 1 });
    await capture(page, 'decouvrir-8-390-depliee');
    await bascule(page).click();
    expect((await etatBulle(page)).repliee).toBe(true);
    await capture(page, 'decouvrir-8-390-repliee');
});

test('390 px : le témoin « Enregistré » passe au-dessus de la bulle, le lien de sortie reste atteignable', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirEspaceVide(page, 390, 844);
    await page.evaluate(() => Assistance.parcours()[0].lancer(0));
    await attendreEtape(page, 1);
    await bascule(page).click();
    const sortie = bulle(page).locator('.parcours-bulle-sortie');
    await expect(sortie).toBeVisible();
    // Le témoin parle (il reste 2 s) : il se pose au-dessus de la bulle, sans couvrir la sortie.
    await page.evaluate(() => window.temoinEnregistrement.enregistre());
    await expect(page.locator('#temoin-enregistrement .temoin-enregistrement-succes')).toBeVisible();
    await page.waitForTimeout(250);
    const g = await page.evaluate(() => {
        const t = document.querySelector('#temoin-enregistrement .temoin-enregistrement-succes').getBoundingClientRect();
        const b = document.getElementById('parcours-bulle').getBoundingClientRect();
        const s = document.querySelector('#parcours-bulle .parcours-bulle-sortie').getBoundingClientRect();
        const dessus = document.elementFromPoint((s.left + s.right) / 2, (s.top + s.bottom) / 2);
        return { temoinBas: t.bottom, bulleHaut: b.top, chevaucheSortie: !(t.right <= s.left || s.right <= t.left || t.bottom <= s.top || s.bottom <= t.top),
                 sortieTouchable: !!dessus && dessus.classList.contains('parcours-bulle-sortie') };
    });
    expect(g.temoinBas).toBeLessThanOrEqual(g.bulleHaut);
    expect(g.chevaucheSortie).toBe(false);
    expect(g.sortieTouchable).toBe(true);
    await sortie.click();
    await expect(bulle(page)).toHaveCount(0);
    // Le parcours fermé, la réserve est retirée : le témoin retrouve sa place.
    expect(await page.evaluate(() => document.documentElement.style.getPropertyValue('--parcours-reserve-bas'))).toBe('');
});

test('le filet : dans une fenêtre courte, la bulle s’y limite, seul le texte défile, la page derrière ne bouge pas', async ({ page }) => {
    test.setTimeout(90000);
    // 1180 × 400 : un iPad couché, le clavier ouvert. L'étape 4 (la carte RàI) a la bulle la plus haute.
    await ouvrirEspaceVide(page, 1180, 400);
    await page.evaluate(() => Assistance.parcours()[0].lancer(3));
    await attendreEtape(page, 4);
    const m = await page.evaluate(() => {
        const b = document.getElementById('parcours-bulle');
        const r = b.getBoundingClientRect();
        const t = b.querySelector('.parcours-bulle-texte');
        const dedans = (sel) => [...b.querySelectorAll(sel)].every((el) => {
            const q = el.getBoundingClientRect();
            return q.top >= r.top - 1 && q.bottom <= r.bottom + 1 && q.top >= 0 && q.bottom <= window.innerHeight;
        });
        return { haut: r.top, bas: r.bottom, h: window.innerHeight, texteDefile: t.scrollHeight > t.clientHeight + 1,
                 bulleDefile: b.scrollHeight > b.clientHeight + 1,
                 teteVisible: dedans('.parcours-bulle-tete'), boutonsVisibles: dedans('.parcours-bulle-boutons button'),
                 sortieVisible: dedans('.parcours-bulle-sortie') };
    });
    expect(m.haut).toBeGreaterThanOrEqual(0);
    expect(m.bas).toBeLessThanOrEqual(m.h);
    expect(m.texteDefile).toBe(true);
    expect(m.bulleDefile).toBe(false);
    expect(m).toMatchObject({ teteVisible: true, boutonsVisibles: true, sortieVisible: true });

    // L'essai du défilement : au bout du texte, la molette (le doigt) ne fait pas défiler la page.
    const texte = bulle(page).locator('.parcours-bulle-texte');
    const t = await texte.boundingBox();
    await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2);
    const avant = await page.evaluate(() => window.scrollY);
    for (let k = 0; k < 6; k++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(80); }
    await expect.poll(() => texte.evaluate((el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 1)).toBe(true);
    expect(await page.evaluate(() => window.scrollY)).toBe(avant);
});

test('1180 px : rien ne change — ni forme de téléphone, ni bouton sur la tête, ni réserve sous le témoin', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirEspaceVide(page, 1180, 900);
    await page.evaluate(() => Assistance.parcours()[0].lancer(0));
    for (const n of [1, 4]) {
        if (n === 4) await page.evaluate(() => ParcoursMoteur.allerA(3));
        await attendreEtape(page, n);
        const e = await etatBulle(page);
        expect(e).toMatchObject({ telephone: false, repliee: false, texteVisible: true });
        await expect(bascule(page)).toHaveCount(0);
        expect(await bulle(page).locator('.parcours-bulle-texte').evaluate((el) => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
        expect(await bulle(page).evaluate((el) => el.offsetWidth)).toBe(380);
    }
    await page.evaluate(() => window.temoinEnregistrement.enregistre());
    expect(await page.evaluate(() => getComputedStyle(document.getElementById('temoin-enregistrement')).bottom)).toBe('16px');
    expect(await page.evaluate(() => document.documentElement.style.getPropertyValue('--parcours-reserve-bas'))).toBe('0px');
});

async function enregistrerParcoursGrandEcran(page) {
    // Le titre et la ligne du parcours « Automatiser tes commentaires » (branche du 8), pour la capture.
    await page.evaluate(() => {
        window.__lance = 0;
        Assistance.enregistrer({
            id: 'essai-grand-ecran', titre: 'Automatiser tes commentaires',
            ligne: "De ta grille à une rétroaction qui s'écrit seule, à partir de ce que tu relèves et comptes dans chaque production.",
            total: 6, grandEcranSeulement: true, lancer: () => { window.__lance += 1; }
        });
    });
}

test('390 px : un parcours pour grand écran le dit sous son titre, et « Commencer » ne lance rien', async ({ page }) => {
    await ouvrirEspaceVide(page, 390, 844);
    await enregistrerParcoursGrandEcran(page);
    await page.click('#entete-menu-bouton');
    await page.click('#btn-assistance-menu');
    const item = page.locator('#panneau-assistance [data-parcours="essai-grand-ecran"]');
    await expect(item).toHaveAttribute('data-ecran', 'trop-petit');
    const texte = item.locator('.assistance-parcours-grand-ecran');
    await expect(texte).toHaveText(TEXTE_GRAND_ECRAN);
    // Sous le titre : juste après la ligne du titre, avant la description.
    expect(await item.evaluate((li) => li.querySelector('.assistance-parcours-ligne1').nextElementSibling.className)).toBe('assistance-parcours-grand-ecran');
    const btn = item.locator('.assistance-parcours-bouton');
    await expect(btn).toHaveText('Commencer');
    await expect(btn).toHaveAttribute('aria-disabled', 'true');
    await expect(btn).toHaveAccessibleDescription(new RegExp(TEXTE_GRAND_ECRAN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    // aria-disabled : Playwright attendrait qu'il s'active ; le toucher est forcé, il ne doit rien lancer.
    await btn.click({ force: true });
    expect(await page.evaluate(() => window.__lance)).toBe(0);
    await expect(page.locator('#panneau-assistance')).toBeVisible();
    // Les autres parcours restent proposés.
    await expect(page.locator('#panneau-assistance [data-parcours="decouvrir"] .assistance-parcours-bouton')).not.toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('#panneau-assistance [data-parcours="decouvrir"] .assistance-parcours-grand-ecran')).toHaveCount(0);
    await capture(page, 'panneau-390-grand-ecran');
});

test('1180 px : le même parcours est proposé, sans le texte, et se lance', async ({ page }) => {
    await ouvrirEspaceVide(page, 1180, 900);
    await enregistrerParcoursGrandEcran(page);
    await page.click('#entete-menu-bouton');
    await page.click('#btn-assistance-menu');
    const item = page.locator('#panneau-assistance [data-parcours="essai-grand-ecran"]');
    await expect(item.locator('.assistance-parcours-grand-ecran')).toHaveCount(0);
    await expect(item.locator('.assistance-parcours-bouton')).not.toHaveAttribute('aria-disabled', 'true');
    await item.locator('.assistance-parcours-bouton').click();
    expect(await page.evaluate(() => window.__lance)).toBe(1);
});
