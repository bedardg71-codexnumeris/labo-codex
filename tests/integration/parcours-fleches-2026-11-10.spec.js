import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';
import { etatFleches, flecheVers, nombreDeFleches, coucheDansLeRepereDeLaFenetre, styleDuContour, sectionActuelleSur,
    rienNeRetientLeToucher } from './harness/fleches-de-banc.js';

// =======================================================================
// LOT « LES FLÈCHES DES PARCOURS » — 10 NOVEMBRE 2026
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-09-parcours-fleches.md. Ce banc juge, sur « Découvrir » (la démo) :
//   · le voile retiré : la page se touche partout, à toutes les étapes ;
//   · la flèche : du bord de la bulle à ce dont elle parle, à l'encre du texte, dans le repère de la fenêtre ;
//   · la pulsation sur ce qu'il faut toucher, et son pointillé fixe sous prefers-reduced-motion ;
//   · la section actuelle mise en évidence dans le menu du contour, posée et retirée par le moteur ;
//   · la bulle près de ce dont elle parle, pas sous le prochain bouton (étapes 6 et 7, les captures de Grégoire) ;
//   · la poignée : 46 px, à la souris, au doigt, au clavier ; la bulle reste dans l'écran utile ; l'étape suivante
//     reprend le placement automatique ; pas de poignée sur téléphone.
// Session du cloud : Chromium seulement. Écrit pour WebKit aussi (leçon du groupe 3) : aucune mesure prise pendant un
// défilement ou une transition (tout est lu par `expect.poll`), aucun rechargement en cours d'essai, aucun
// « Retour arrière » hors d'un champ.
// L'apparence se juge sur capture : CAPTURES_PARCOURS=<dossier> npx playwright test parcours-fleches

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
const HORLOGE = new Date('2026-11-10T14:00:00.000Z');
const CAPTURES = process.env.CAPTURES_PARCOURS || '';

const NAV = (onglet) => `.navigation-boutons button[data-onglet="${onglet}"]`;
const ONGLET_PROFIL = (id) => `#contenuProfilEtudiant [data-action="changerSectionProfil"][data-param="${id}"]`;
const bulle = (page) => page.locator('#parcours-bulle');
const poignee = (page) => page.locator('#parcours-bulle .parcours-bulle-poignee');
const rectDe = (page, sel) => page.evaluate((s) => {
    const r = document.querySelector(s).getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
}, sel);

async function capture(page, nom) {
    if (!CAPTURES) return;
    fs.mkdirSync(CAPTURES, { recursive: true });
    // Le pointeur du banc reste sur le dernier bouton touché : son infobulle n'est pas ce qu'on juge.
    await page.mouse.move(2, (page.viewportSize().height / 2) | 0);
    await page.evaluate(() => window.accompagnement && window.accompagnement.masquerHover && window.accompagnement.masquerHover());
    await page.evaluate(() => document.querySelectorAll('.notifications-pile > *').forEach((n) => n.remove()));
    // La pulsation est figée à son milieu : la capture montre toujours le même halo.
    await page.evaluate(() => document.getAnimations()
        .filter((a) => a.effect && a.effect.target && a.effect.target.classList && a.effect.target.classList.contains('parcours-contour'))
        .forEach((a) => { a.pause(); a.currentTime = 1300; }));
    // Tout le reste a fini de bouger (les pages qui paraissent en fondu, le panneau qui glisse).
    await page.waitForFunction(() => document.getAnimations()
        .filter((a) => a.effect && a.effect.getComputedTiming().iterations !== Infinity)
        .every((a) => a.playState !== 'running'));
    await page.screenshot({ path: path.join(CAPTURES, nom + '.png') });
    await page.evaluate(() => document.getAnimations().forEach((a) => { if (a.playState === 'paused') a.play(); }));
}

async function ouvrirEspaceVide(page, largeur, { clair = false, hauteur = 820 } = {}) {
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
    await page.evaluate((c) => {
        definirPreference('modeClair', c);
        document.body.classList.toggle('mode-clair', c);
    }, clair);
}

async function attendreEtape(page, n) {
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(n + ' sur 8', { timeout: 10000 });
    await expect(bulle(page)).toBeFocused();
}

/** Lance « Découvrir » à l'étape n (1 à 8), comme « Reprendre » le ferait : la démo s'ouvre, l'étape se prépare. */
async function decouvrirA(page, n) {
    await page.evaluate((i) => {
        const p = window.Assistance.parcours().find((x) => x.id === 'decouvrir');
        return p.lancer(i - 1);
    }, n);
    await attendreEtape(page, n);
}

/** Passe à l'étape suivante par l'API du moteur (les gestes eux-mêmes sont jugés par le banc des parcours 1 et 2). */
async function allerAEtape(page, n) {
    await page.evaluate((i) => window.ParcoursMoteur.allerA(i - 1), n);
    await attendreEtape(page, n);
}

const chevauchent = (a, b) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);

// ---------- Les captures : 1180 et 820 px, en sombre et en clair ----------

for (const largeur of [1180, 820]) {
    for (const clair of [false, true]) {
        const suffixe = `${largeur}-${clair ? 'clair' : 'sombre'}`;
        test(`captures de « Découvrir », étapes 3, 5, 6 et 7, et une bulle déplacée (${suffixe})`, async ({ page }) => {
            test.skip(!CAPTURES, 'CAPTURES_PARCOURS=<dossier> pour produire les captures');
            test.setTimeout(120000);
            await ouvrirEspaceVide(page, largeur, { clair, hauteur: largeur === 1180 ? 820 : 1180 });
            await decouvrirA(page, 3);
            await expect.poll(async () => (await etatFleches(page)).fleches.length).toBeGreaterThan(0);
            await capture(page, `decouvrir-3-plusieurs-zones-${suffixe}`);
            // La bulle déplacée, avec sa flèche.
            const p = await poignee(page).boundingBox();
            await page.mouse.move(p.x + p.width / 2, p.y + p.height / 2);
            await page.mouse.down();
            await page.mouse.move(largeur - 120, 640, { steps: 6 });
            await page.mouse.up();
            await expect.poll(async () => (await etatFleches(page)).fleches.length).toBeGreaterThan(0);
            await capture(page, `decouvrir-3-bulle-deplacee-${suffixe}`);
            for (const n of [5, 6, 7]) {
                await allerAEtape(page, n);
                await expect.poll(async () => (await etatFleches(page)).fleches.length).toBeGreaterThan(0);
                await capture(page, `decouvrir-${n}-${suffixe}`);
            }
        });
    }
}

// ---------- La flèche, la pulsation, la section actuelle ----------

test('étapes 3, 6 et 7 de « Découvrir » : la flèche va à ce dont parle la bulle, la pulsation à ce qu’il faut toucher, et la page se touche partout (1180 px)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirEspaceVide(page, 1180);
    await decouvrirA(page, 3);
    await coucheDansLeRepereDeLaFenetre(page, 'étape 3');

    // Étape 3 : deux cartes, deux flèches ; la pulsation sur « Accompagnement » ; l'onglet du moment mis en évidence.
    const assiduite = '#profil-contenu-dynamique .profil-carte:has(.badge-absence)';
    await flecheVers(page, assiduite, 'étape 3, la carte Assiduité');
    await nombreDeFleches(page, 2, 'étape 3');
    const contour = await styleDuContour(page);
    expect(contour.animation, 'le contour pulse').toBe('parcours-pulsation');
    expect(contour.touche, 'le contour ne capte pas le toucher').toBe('none');
    await sectionActuelleSur(page, ONGLET_PROFIL('mobilisation'), 'étape 3');
    // L'encre de la flèche est celle du texte de la bulle, pas l'orange du geste.
    const encres = await page.evaluate(() => ({
        fleche: getComputedStyle(document.querySelector('#parcours-fleches .parcours-fleche-trait')).stroke,
        texte: getComputedStyle(document.getElementById('parcours-bulle')).color,
        geste: getComputedStyle(document.querySelector('#parcours-bulle .parcours-bulle-geste')).color
    }));
    expect(encres.fleche).toBe(encres.texte);
    expect(encres.fleche).not.toBe(encres.geste);
    // Rien ne retient le toucher : ni hors des cartes, ni sur le tracé d'une flèche.
    const f = (await etatFleches(page)).fleches[0];
    await rienNeRetientLeToucher(page, [[12, 400], [1160, 700], [600, 30], [f.pointe.x, f.pointe.y]], 'étape 3');

    // Étapes 6 et 7 : la section dont parle la bulle reçoit la flèche et la mise en évidence ; le prochain bouton pulse,
    // et la bulle n'est ni sur lui ni sous lui.
    for (const [n, actuelle, prochaine] of [[6, 'evaluations', 'conception'], [7, 'conception', 'calendrier']]) {
        await allerAEtape(page, n);
        await flecheVers(page, NAV(actuelle), 'étape ' + n);
        await nombreDeFleches(page, 1, 'étape ' + n);
        await sectionActuelleSur(page, NAV(actuelle), 'étape ' + n);
        await expect.poll(async () => {
            const c = await rectDe(page, '#parcours-contour'), p = await rectDe(page, NAV(prochaine));
            return Math.abs((c.left + c.right) / 2 - (p.left + p.right) / 2) < 3 && Math.abs((c.top + c.bottom) / 2 - (p.top + p.bottom) / 2) < 3;
        }, { message: `étape ${n} : la pulsation est sur le prochain bouton` }).toBe(true);
        const b = await rectDe(page, '#parcours-bulle'), p = await rectDe(page, NAV(prochaine));
        expect(chevauchent(b, p), `étape ${n} : la bulle ne couvre pas le prochain bouton`).toBe(false);
        expect(p.right <= b.left + 1 || b.right <= p.left + 1, `étape ${n} : la bulle n’est pas sous le prochain bouton`).toBe(true);
    }

    // À la sortie, rien ne reste : ni couche, ni contour, ni mise en évidence.
    await page.evaluate(() => window.ParcoursMoteur.fermer());
    await expect(page.locator('#parcours-fleches, #parcours-contour, #parcours-bulle, .parcours-section-actuelle')).toHaveCount(0);
});

test('prefers-reduced-motion : la pulsation devient un contour pointillé fixe', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ouvrirEspaceVide(page, 1180);
    await decouvrirA(page, 6);
    await expect.poll(() => styleDuContour(page)).toEqual({ animation: 'none', bordure: 'dashed', largeurBordure: '3px', touche: 'none' });
});

test('la flèche suit le défilement et le redimensionnement ; une cible sortie de l’écran : la flèche va au bord, de son côté', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirEspaceVide(page, 1180, { hauteur: 700 });
    await decouvrirA(page, 3);
    const assiduite = '#profil-contenu-dynamique .profil-carte:has(.badge-absence)';
    const avant = await flecheVers(page, assiduite, 'avant le défilement');

    // Un défilement : la mesure est prise la page immobile (`flecheVers` attend que la flèche ait rejoint la carte).
    const yAvant = (await rectDe(page, assiduite)).top;
    await page.evaluate(() => window.scrollBy(0, 60));
    await expect.poll(async () => Math.round(yAvant - (await rectDe(page, assiduite)).top)).toBe(60);
    const apres = await flecheVers(page, assiduite, 'après le défilement');
    expect(apres.trace, 'la flèche a suivi').not.toBe(avant.trace);
    await coucheDansLeRepereDeLaFenetre(page, 'après le défilement');

    // La fenêtre redimensionnée : la couche reprend sa taille, en px.
    await page.setViewportSize({ width: 1024, height: 760 });
    await coucheDansLeRepereDeLaFenetre(page, 'à 1024 × 760');
    await flecheVers(page, assiduite, 'après le redimensionnement');

    // Les cartes sorties par le haut (la bulle déplacée d'abord, pour que le placement automatique ne les ramène pas).
    await poignee(page).focus();
    await page.keyboard.press('ArrowDown');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const sorties = await page.evaluate((sel) => [...document.querySelectorAll(sel)].every((e) => e.getBoundingClientRect().bottom <= 0), '#profil-contenu-dynamique .profil-carte:has(.badge-absence)');
    test.skip(!sorties, 'la page ne défile pas assez pour sortir la carte de l’écran à cette taille');
    await expect.poll(async () => {
        const e = await etatFleches(page);
        return e.fleches.length ? e.fleches.map((x) => x.pointe.y).join() : 'aucune';
    }, { message: 'la pointe va au bord haut de l’écran' }).toBe('10');
});

// ---------- La poignée ----------

test('la poignée : 46 px, à la souris et au doigt ; la bulle reste dans l’écran utile ; les flèches suivent ; cachée, la cible n’a plus de flèche ; l’étape suivante replace la bulle', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirEspaceVide(page, 1180);
    await decouvrirA(page, 6);
    await flecheVers(page, NAV('evaluations'));

    // La zone tactile : au moins 46 × 46 px, entière dans la bulle, nommée pour le lecteur d'écran.
    const p = await poignee(page).boundingBox();
    expect(p.width).toBeGreaterThanOrEqual(46);
    expect(p.height).toBeGreaterThanOrEqual(46);
    const b0 = await rectDe(page, '#parcours-bulle');
    expect(p.x >= b0.left && p.y >= b0.top && p.x + p.width <= b0.right && p.y + p.height <= b0.bottom, 'la poignée est dans la bulle').toBe(true);
    await expect(poignee(page)).toHaveAttribute('aria-label', 'Déplacer la bulle');
    expect(await poignee(page).evaluate((el) => getComputedStyle(el).touchAction)).toBe('none');

    // À la souris : la bulle suit le pointeur du même écart, et la flèche part de sa nouvelle place.
    const prise = { x: p.x + p.width / 2, y: p.y + p.height / 2 };
    await page.mouse.move(prise.x, prise.y);
    await page.mouse.down();
    await page.mouse.move(prise.x - 150, prise.y + 220, { steps: 8 });
    await page.mouse.up();
    const b1 = await rectDe(page, '#parcours-bulle');
    expect([Math.round(b1.left - b0.left), Math.round(b1.top - b0.top)]).toEqual([-150, 220]);
    await flecheVers(page, NAV('evaluations'), 'la bulle déplacée');
    // La place est gardée pour l'étape : deux passages de la sonde ne la reprennent pas.
    await page.waitForFunction(() => { window.__n = (window.__n || 0) + 1; return window.__n > 3; }, null, { polling: 150 });
    expect(await rectDe(page, '#parcours-bulle')).toEqual(b1);

    // Tirée hors de l'écran : elle s'arrête sous l'en-tête, au-dessus du bandeau de la démo, et aux bords.
    const cadre = await page.evaluate(() => ({
        haut: document.querySelector('header.entete').getBoundingClientRect().bottom,
        bas: document.getElementById('bandeau-demo').getBoundingClientRect().top,
        largeur: window.innerWidth
    }));
    for (const [x, y] of [[-400, -400], [3000, 3000]]) {
        const q = await poignee(page).boundingBox();
        await page.mouse.move(q.x + q.width / 2, q.y + q.height / 2);
        await page.mouse.down();
        await page.mouse.move(x, y, { steps: 5 });
        await page.mouse.up();
        const b = await rectDe(page, '#parcours-bulle');
        expect(b.left, 'bord gauche').toBeGreaterThanOrEqual(8);
        expect(b.right, 'bord droit').toBeLessThanOrEqual(cadre.largeur - 8);
        expect(b.top, 'sous l’en-tête').toBeGreaterThanOrEqual(cadre.haut);
        expect(b.bottom, 'au-dessus du bandeau de la démo').toBeLessThanOrEqual(cadre.bas - 8 + 0.5);
    }

    // Au doigt (Pointer Events de type « touch », posés sur la poignée) : la bulle suit.
    const b2 = await rectDe(page, '#parcours-bulle');
    await poignee(page).evaluate((el) => {
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        const ev = (type, dx, dy) => el.dispatchEvent(new PointerEvent(type, { pointerId: 41, pointerType: 'touch', isPrimary: true,
            clientX: x + dx, clientY: y + dy, bubbles: true, cancelable: true }));
        ev('pointerdown', 0, 0);
        ev('pointermove', -90, -60);
        ev('pointermove', -180, -120);
        ev('pointerup', -180, -120);
    });
    const b3 = await rectDe(page, '#parcours-bulle');
    expect([Math.round(b3.left - b2.left), Math.round(b3.top - b2.top)]).toEqual([-180, -120]);
    // Un autre doigt, pendant ce temps, ne la déplace pas ; le doigt levé, un mouvement non plus.
    await poignee(page).evaluate((el) => el.dispatchEvent(new PointerEvent('pointermove', { pointerId: 41, pointerType: 'touch', clientX: 5, clientY: 5, bubbles: true })));
    expect(await rectDe(page, '#parcours-bulle')).toEqual(b3);

    // Posée sur ce dont elle parle : la cible est cachée, plus de flèche.
    const cible = await rectDe(page, NAV('evaluations'));
    const q = await poignee(page).boundingBox();
    await page.mouse.move(q.x + q.width / 2, q.y + q.height / 2);
    await page.mouse.down();
    await page.mouse.move(cible.left + 150, cadre.haut - 200, { steps: 5 });
    await page.mouse.up();
    // (Sous l'en-tête, elle ne peut pas couvrir le menu : la flèche reste ; on la pose donc sur une cible de la page.)
    await allerAEtape(page, 3);
    // L'étape suivante a repris le placement automatique : la bulle n'est plus où on l'avait laissée.
    await flecheVers(page, '#profil-contenu-dynamique .profil-carte:has(.badge-absence)', 'étape 3, placement automatique');
    const carte = await rectDe(page, '#profil-contenu-dynamique .profil-carte:has(.badge-absence)');
    const r = await poignee(page).boundingBox();
    const bb = await rectDe(page, '#parcours-bulle');
    await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
    await page.mouse.down();
    // La bulle (380 px) posée sur la carte Assiduité (342 px) : son centre est dessous.
    await page.mouse.move(r.x + r.width / 2 - (bb.left - carte.left) - 20, r.y + r.height / 2 + 60, { steps: 6 });
    await page.mouse.up();
    await expect.poll(async () => {
        const b = await rectDe(page, '#parcours-bulle'), c = await rectDe(page, '#profil-contenu-dynamique .profil-carte:has(.badge-absence)');
        const cx = (c.left + c.right) / 2, cy = (Math.max(0, c.top) + Math.min(await page.evaluate(() => innerHeight), c.bottom)) / 2;
        return cx > b.left && cx < b.right && cy > b.top && cy < b.bottom;
    }, { message: 'la bulle couvre le centre de la carte' }).toBe(true);
    await nombreDeFleches(page, 1, 'la carte cachée sous la bulle n’a plus de flèche ; l’autre garde la sienne');
});

test('la poignée au clavier : les flèches déplacent la bulle de 16 px sans changer de page de bulle ; sur la bulle, elles changent de page', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirEspaceVide(page, 1180);
    await decouvrirA(page, 4);
    // L'étape 4 a un texte en plusieurs pages.
    const pages = () => page.evaluate(() => window.ParcoursMoteur.pageCourante());
    expect((await pages()).pages).toBeGreaterThan(1);
    expect((await pages()).page).toBe(0);

    await poignee(page).focus();
    await expect(poignee(page)).toBeFocused();
    const b0 = await rectDe(page, '#parcours-bulle');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    const b1 = await rectDe(page, '#parcours-bulle');
    expect([Math.round(b1.left - b0.left), Math.round(b1.top - b0.top)]).toEqual([32, 16]);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    const b2 = await rectDe(page, '#parcours-bulle');
    expect([Math.round(b2.left - b0.left), Math.round(b2.top - b0.top)]).toEqual([16, 0]);
    // L'événement n'est pas remonté à la bulle : la page de bulle n'a pas changé, et la poignée garde le focus.
    expect((await pages()).page).toBe(0);
    await expect(poignee(page)).toBeFocused();

    // Sur la bulle elle-même, la flèche droite change toujours de page (ce qui ne change pas).
    await bulle(page).focus();
    await page.keyboard.press('ArrowRight');
    expect((await pages()).page).toBe(1);
    // … et la bulle déplacée garde sa place à sa nouvelle hauteur (bornée à l'écran utile).
    const b3 = await rectDe(page, '#parcours-bulle');
    expect(Math.round(b3.left)).toBe(Math.round(b2.left));
});

test('téléphone (390 px) : pas de poignée, la bulle garde sa forme rangée et repliable ; aucune couche ne retient le toucher', async ({ page }) => {
    await ouvrirEspaceVide(page, 390, { hauteur: 844 });
    await decouvrirA(page, 6);
    await expect(bulle(page)).toHaveClass(/parcours-bulle--telephone/);
    await expect(poignee(page)).toHaveCount(0);
    await expect(bulle(page).locator('.parcours-bulle-bascule')).toHaveCount(1);
    await coucheDansLeRepereDeLaFenetre(page, 'téléphone');
    await rienNeRetientLeToucher(page, [[12, 300], [200, 420], [380, 100]], 'téléphone');
    // Le seuil franchi (l'iPad sorti de l'écran partagé) : la poignée paraît, sans nouvelle annonce.
    await page.setViewportSize({ width: 820, height: 1180 });
    await expect(poignee(page)).toHaveCount(1);
    await expect(bulle(page)).not.toHaveClass(/parcours-bulle--telephone/);
});
