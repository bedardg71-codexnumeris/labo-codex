import { test, expect } from '@playwright/test';
import { releverLaBulle, bullesRelevees, foisRelevee } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';
import { etatFleches, flecheVers, nombreDeFleches, coucheDansLeRepereDeLaFenetre, styleDuContour,
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
//
// RÉALIGNÉ LE 16 NOV. 2026 sur « Découvrir » réécrit en lignes (js/parcours-decouvrir.js) et sur les règles du moteur
// validées depuis le 14 nov. Ce qui a changé, mesuré à l'écran (sonde et captures du 16 nov.) :
//   · OÙ SUIS-JE (règle 4, 14 nov.) : la section que présente la bulle n'a plus de flèche ; la phrase du lieu la dit, et
//     ses deux entrées du menu (la section, l'onglet) portent le halo. La flèche reste à ce qu'il faut TOUCHER (étape 5 :
//     « Évaluation » ; étape 6 : « Conception » ; étape 7 : « Cadre ») et à ce qu'une ligne montre (`montre`).
//   · une bulle en lignes tient en une page : les pages de bulle se jugent sur une définition du banc.
//   · étape 3 : ses deux lignes sont de nouveau amenées dans la vue (`amener`, corrigé le 16 nov. : l'écran avait régressé).

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

// 11 nov. 2026 : la flèche de l'étape 3 va à la ligne « 5 absences ou retards », pas à la carte entière.
const LIGNE_ABSENCES = '#profil-contenu-dynamique .profil-carte:has(.badge-absence) h4.profil-section-titre';
const LIGNE_NON_REMISES = '#profil-contenu-dynamique .profil-carte:has(.badge-absence) + .profil-carte h4.profil-section-titre:last-of-type';

/**
 * La bulle, lue une fois posée : tant que la personne ne l'a pas déplacée, la sonde (120 ms) peut encore la replacer d'un
 * pixel (mesuré le 11 nov. 2026 : 247 puis 246, sans geste ; c'était le rouge instable de « la poignée au clavier »).
 * Deux lectures égales à 400 ms d'écart.
 */
async function bullePosee(page) {
    let b = await rectDe(page, '#parcours-bulle');
    await expect.poll(async () => {
        const r = await rectDe(page, '#parcours-bulle');
        const pareil = r.left === b.left && r.top === b.top;
        b = r;
        return pareil;
    }, { message: 'la bulle est posée', intervals: [400] }).toBe(true);
    return b;
}

/** Le halo de la section actuelle : sur ces entrées, par leur nom, et sur elles seules. */
async function halosSur(page, noms, contexte) {
    await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('.parcours-section-actuelle')].map((e) => e.textContent.trim())),
        { message: contexte + ' : le halo de la section actuelle', timeout: 5000 }).toEqual(noms);
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

    // Étape 3 : deux lignes, deux flèches ; la pulsation sur « Accompagnement » ; le lieu et l'onglet du moment mis en évidence.
    // Break-test (16 nov. 2026) : `amener` retiré de l'étape 3 → ROUGE (la ligne des productions non remises reste sous
    // l'écran, deux flèches au lieu de trois). Rétabli → vert.
    await flecheVers(page, LIGNE_ABSENCES, 'étape 3, la ligne des absences');
    await flecheVers(page, LIGNE_NON_REMISES, 'étape 3, la ligne des productions non remises');
    await flecheVers(page, ONGLET_PROFIL('accompagnement'), 'étape 3, ce qu’il faut toucher');
    await nombreDeFleches(page, 3, 'étape 3');   // les deux lignes, et « Accompagnement » (la règle du contour, 11 nov. 2026)
    for (const sel of [LIGNE_ABSENCES, LIGNE_NON_REMISES, ONGLET_PROFIL('accompagnement')]) await expect(page.locator(sel)).toBeInViewport({ ratio: 1 });
    const contour = await styleDuContour(page);
    expect(contour.animation, 'le contour pulse').toBe('parcours-pulsation');
    expect(contour.touche, 'le contour ne capte pas le toucher').toBe('none');
    await halosSur(page, ['Suivi', 'Profils', 'Engagement ACP'], 'étape 3');
    expect(await page.locator(ONGLET_PROFIL('mobilisation')).evaluate((e) => e.classList.contains('parcours-section-actuelle'))).toBe(true);
    // L'encre de la flèche est celle du texte de la bulle, pas l'orange du geste.
    const encres = await page.evaluate(() => ({
        fleche: getComputedStyle(document.querySelector('#parcours-fleches .parcours-fleche-trait')).stroke,
        texte: getComputedStyle(document.getElementById('parcours-bulle')).color,
        geste: getComputedStyle(document.querySelector('#parcours-bulle .parcours-bulle-ligne--geste .parcours-bulle-ligne-texte')).color   // la consigne, dernière ligne d'une bulle en lignes
    }));
    expect(encres.fleche).toBe(encres.texte);
    expect(encres.fleche).not.toBe(encres.geste);
    // Rien ne retient le toucher : ni hors des cartes, ni sur le tracé d'une flèche.
    const f = (await etatFleches(page)).fleches[0];
    await rienNeRetientLeToucher(page, [[12, 400], [1160, 700], [600, 30], [f.pointe.x, f.pointe.y]], 'étape 3');

    // Étapes 6 et 7 : la section que présente la bulle porte le halo, avec son onglet (OÙ SUIS-JE, 14 nov. 2026), sans
    // flèche ; ce qu'une ligne montre reçoit la sienne (étape 6 : la zone de dépôt) ; le prochain bouton pulse, et reçoit
    // sa flèche (la règle du contour, 11 nov. 2026, 11 h 45) ; la bulle ne le couvre pas.
    for (const [n, actuelle, onglet, prochaine, montree] of [[6, 'Évaluation', 'Préparer', 'conception', '#travaux-drop-zone'],
        [7, 'Conception', 'Mon matériel', 'calendrier', null]]) {
        await allerAEtape(page, n);
        if (montree) await flecheVers(page, montree, 'étape ' + n + ', ce que montre la bulle');
        await flecheVers(page, NAV(prochaine), 'étape ' + n + ', le prochain bouton');
        await nombreDeFleches(page, montree ? 2 : 1, 'étape ' + n);
        await halosSur(page, [actuelle, onglet], 'étape ' + n);
        await expect(bulle(page).locator('.parcours-bulle-lieu')).toHaveText(`Tu es dans « ${actuelle} », à l'onglet « ${onglet} ».`);
        await expect.poll(async () => {
            const c = await rectDe(page, '#parcours-contour'), p = await rectDe(page, NAV(prochaine));
            return Math.abs((c.left + c.right) / 2 - (p.left + p.right) / 2) < 3 && Math.abs((c.top + c.bottom) / 2 - (p.top + p.bottom) / 2) < 3;
        }, { message: `étape ${n} : la pulsation est sur le prochain bouton` }).toBe(true);
        const b = await rectDe(page, '#parcours-bulle'), p = await rectDe(page, NAV(prochaine));
        expect(chevauchent(b, p), `étape ${n} : la bulle ne couvre pas le prochain bouton`).toBe(false);
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
    const assiduite = LIGNE_ABSENCES;
    const avant = await flecheVers(page, assiduite, 'avant le défilement');

    // Un défilement : la mesure est prise la page immobile (`flecheVers` attend que la flèche ait rejoint la carte).
    const defileAvant = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollBy(0, 60));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(defileAvant + 60);
    const apres = await flecheVers(page, assiduite, 'après le défilement');
    expect(apres.trace, 'la flèche a suivi').not.toBe(avant.trace);
    await coucheDansLeRepereDeLaFenetre(page, 'après le défilement');

    // La fenêtre redimensionnée : la couche reprend sa taille, en px.
    await page.setViewportSize({ width: 1180, height: 640 });
    await coucheDansLeRepereDeLaFenetre(page, 'à 1180 × 640');
    await flecheVers(page, assiduite, 'après le redimensionnement');

    // « Accompagnement » sorti par le haut. La bulle est d'abord déplacée (sa place est alors gardée : le placement
    // automatique ne la recolle pas à ce qu'elle désigne), puis la page défile : ce qu'il faut toucher quitte l'écran et
    // garde sa flèche, vers le bord de l'écran, de son côté.
    // (Réaligné le 16 nov. 2026 : l'essai sortait tout par le bas dans une fenêtre de 420 px, que la bulle en lignes,
    // plus haute, remplit ; la pointe attendue au bord bas tombait sous la bulle.)
    await poignee(page).focus();
    await page.keyboard.press('ArrowDown');
    const onglet = ONGLET_PROFIL('accompagnement');
    await page.evaluate((s) => window.scrollBy(0, document.querySelector(s).getBoundingClientRect().bottom + 40), onglet);
    await expect.poll(() => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().bottom <= 0, onglet),
        { message: '« Accompagnement » est sorti par le haut' }).toBe(true);
    await expect.poll(async () => {
        const e = await etatFleches(page);
        return e.fleches.length ? Math.min(...e.fleches.map((x) => x.pointe.y)) : 'aucune';
    }, { message: 'la pointe va au bord haut de l’écran' }).toBe(10);
});

// ---------- Les huit étapes de « Découvrir », aux deux tailles de l'iPad (Grégoire, 11 nov. 2026) ----------
// La bulle ne couvre jamais ses zones (le relevé, `releverLaBulle`, juge chaque bulle) ; chaque flèche va à une zone de
// l'étape ou à ce qu'il faut toucher (↻ la règle du contour, 11 nov. 2026, 11 h 45) ; à 1180 × 820, le compte des
// flèches de chaque étape : celles de ses zones, plus celle du contour quand il pulse.
// 16 nov. 2026, « Découvrir » en lignes : une flèche par chose qu'une ligne montre (1 : un point de la bande ; 2 : le
// point à l'écart et le nom de Suricate Loyal ; 3 : les deux lignes du profil ; 4 : le niveau et le défi ; 6 : la zone de
// dépôt) ; 5, 7 et 8 ne montrent rien d'autre que ce qu'il faut toucher.
const FLECHES_A_1180 = { 1: 1, 2: 2, 3: 2, 4: 2, 5: 0, 6: 1, 7: 0, 8: 0 };

for (const [largeur, hauteur] of [[1180, 820], [820, 1180]]) {
    test(`les huit étapes de « Découvrir » à ${largeur} × ${hauteur} : la bulle ne couvre pas ses zones, chaque flèche va à une zone ou au bouton à toucher`, async ({ page }) => {
        test.setTimeout(120000);
        await ouvrirEspaceVide(page, largeur, { hauteur });
        for (let n = 1; n <= 8; n++) {
            if (n === 1) await decouvrirA(page, 1); else await allerAEtape(page, n);
            const pulse = await page.evaluate(() => { const c = document.getElementById('parcours-contour'); return c && !c.hidden ? 1 : 0; });
            if (largeur === 1180) await nombreDeFleches(page, FLECHES_A_1180[n] + pulse, 'étape ' + n);
            // Le relevé a regardé cette bulle au moins trois fois (un écart compte sur deux relevés de suite).
            await expect.poll(() => foisRelevee(page, `(${n} sur 8, ${largeur} × ${hauteur})`),
                { message: `étape ${n} : relevée trois fois` }).toBeGreaterThanOrEqual(3);
            await expect.poll(() => page.evaluate(() => {
                const pl = window.ParcoursMoteur.placement();
                const rs = pl.zones.filter((z) => z && z !== pl.contour && !(pl.contour && pl.contour.contains(z)))
                    .map((z) => z.getBoundingClientRect()).filter((r) => r.width > 0);
                const rc = pl.contour ? [pl.contour.getBoundingClientRect()] : [];
                const pointes = [...document.querySelectorAll('#parcours-fleches g.parcours-fleche')].map((g) => {
                    const d = g.getAttribute('data-trace').split(' M')[0].split(' ');
                    const fin = d[d.length - 1].split(',').map(Number);
                    return { x: fin[0], y: fin[1] };
                });
                const loin = (p, r) => Math.hypot(Math.max(r.left - p.x, 0, p.x - r.right), Math.max(r.top - p.y, 0, p.y - r.bottom));
                // Une flèche vers une union de zones (plus de trois) s'arrête au bord de l'union : elle est dans sa boîte.
                const u = rs.reduce((a, r) => ({ left: Math.min(a.left, r.left), top: Math.min(a.top, r.top), right: Math.max(a.right, r.right), bottom: Math.max(a.bottom, r.bottom) }),
                    { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
                const perdues = pointes.filter((p) => !rs.concat(rc).some((r) => loin(p, r) <= 9) && loin(p, u) > 9);
                return perdues.length ? perdues.length + ' flèche(s) hors des zones' : 'toutes vers une zone';
            }), { message: `étape ${n} : chaque flèche va à une zone de l'étape` }).toBe('toutes vers une zone');
        }
        // Le relevé a bien regardé les huit bulles.
        expect((await bullesRelevees(page)).filter((v) => v.includes(`${largeur} × ${hauteur}`)).length).toBeGreaterThanOrEqual(8);
    });
}

// ---------- La poignée ----------

test('la poignée : 46 px, à la souris et au doigt ; la bulle reste dans l’écran utile ; les flèches suivent ; cachée, la cible n’a plus de flèche ; l’étape suivante replace la bulle', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirEspaceVide(page, 1180);
    await decouvrirA(page, 6);
    await flecheVers(page, NAV('conception'));   // ce qu'il faut toucher à l'étape 6 (la section présentée a le halo, plus de flèche)

    // La zone tactile : au moins 46 × 46 px, entière dans la bulle, nommée pour le lecteur d'écran.
    const p = await poignee(page).boundingBox();
    expect(p.width).toBeGreaterThanOrEqual(46);
    expect(p.height).toBeGreaterThanOrEqual(46);
    const b0 = await bullePosee(page);
    expect(p.x >= b0.left && p.y >= b0.top && p.x + p.width <= b0.right && p.y + p.height <= b0.bottom, 'la poignée est dans la bulle').toBe(true);
    await expect(poignee(page)).toHaveAttribute('aria-label', 'Déplacer la bulle');
    expect(await poignee(page).evaluate((el) => getComputedStyle(el).touchAction)).toBe('none');

    // À la souris : la bulle suit le pointeur du même écart, et la flèche part de sa nouvelle place.
    // Vers le milieu de l'écran : la bulle est posée à un bord (11 nov. 2026), le geste ne doit pas la faire buter.
    const prise = { x: p.x + p.width / 2, y: p.y + p.height / 2 };
    const bornes = await page.evaluate(() => ({
        haut: document.querySelector('header.entete').getBoundingClientRect().bottom + 8,
        bas: document.getElementById('bandeau-demo').getBoundingClientRect().top - 8,
        droite: window.innerWidth - 8
    }));
    const versLaPlace = (avant, apres, voulu) => (apres >= avant ? Math.min(voulu, Math.floor(apres) - 2) : -Math.min(voulu, Math.floor(avant) - 2));
    const geste = [versLaPlace(b0.left - 8, bornes.droite - b0.right, 150), versLaPlace(b0.top - bornes.haut, bornes.bas - b0.bottom, 220)];
    expect(Math.abs(geste[0]) > 40 && Math.abs(geste[1]) > 40, 'la bulle a la place de bouger dans les deux sens').toBe(true);
    await page.mouse.move(prise.x, prise.y);
    await page.mouse.down();
    await page.mouse.move(prise.x + geste[0], prise.y + geste[1], { steps: 8 });
    await page.mouse.up();
    const b1 = await rectDe(page, '#parcours-bulle');
    expect([Math.round(b1.left - b0.left), Math.round(b1.top - b0.top)]).toEqual(geste);
    await flecheVers(page, NAV('conception'), 'la bulle déplacée');
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
        const autre = (type, dx, dy) => el.dispatchEvent(new PointerEvent(type, { pointerId: 99, pointerType: 'touch', isPrimary: false,
            clientX: x + dx, clientY: y + dy, bubbles: true, cancelable: true }));
        ev('pointerdown', 0, 0);
        ev('pointermove', -90, -60);
        // Un second doigt, pendant le glissement : il ne prend pas la main, ne déplace rien, et son lever ne l'arrête pas.
        autre('pointerdown', 300, 300);
        autre('pointermove', 400, 400);
        autre('pointerup', 400, 400);
        ev('pointermove', -180, -120);
        ev('pointerup', -180, -120);
    });
    const b3 = await rectDe(page, '#parcours-bulle');
    expect([Math.round(b3.left - b2.left), Math.round(b3.top - b2.top)]).toEqual([-180, -120]);
    // Le doigt levé, un mouvement ne la déplace plus.
    await poignee(page).evaluate((el) => el.dispatchEvent(new PointerEvent('pointermove', { pointerId: 41, pointerType: 'touch', clientX: 5, clientY: 5, bubbles: true })));
    expect(await rectDe(page, '#parcours-bulle')).toEqual(b3);

    // L'étape suivante reprend le placement automatique : la bulle n'est plus où on l'avait laissée (deux flèches, vers
    // les deux lignes).
    await allerAEtape(page, 3);
    await flecheVers(page, LIGNE_ABSENCES, 'étape 3, placement automatique');
    await nombreDeFleches(page, 3, 'étape 3, avant de déplacer la bulle');   // deux lignes et le contour (11 nov. 2026)
    const ligne = await rectDe(page, LIGNE_ABSENCES);
    const r = await poignee(page).boundingBox();
    const bb = await rectDe(page, '#parcours-bulle');
    await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
    await page.mouse.down();
    // La bulle (380 px) posée sur la ligne des absences : son centre est dessous.
    await page.mouse.move(r.x + r.width / 2 + (ligne.left - 20 - bb.left), r.y + r.height / 2 + (ligne.top - 40 - bb.top), { steps: 6 });
    await page.mouse.up();
    await expect.poll(async () => {
        const b = await rectDe(page, '#parcours-bulle'), c = await rectDe(page, LIGNE_ABSENCES);
        const cx = (c.left + c.right) / 2, cy = (c.top + c.bottom) / 2;
        return cx > b.left && cx < b.right && cy > b.top && cy < b.bottom;
    }, { message: 'la bulle couvre le centre de la ligne' }).toBe(true);
    // La ligne cachée sous la bulle n'a plus de flèche : aucune pointe ne s'arrête à son bord.
    await expect.poll(async () => {
        const e = await etatFleches(page), c = await rectDe(page, LIGNE_ABSENCES);
        return e.fleches.filter((f) => Math.hypot(Math.max(c.left - f.pointe.x, 0, f.pointe.x - c.right), Math.max(c.top - f.pointe.y, 0, f.pointe.y - c.bottom)) <= 9).length;
    }, { message: 'aucune flèche vers la ligne cachée sous la bulle' }).toBe(0);
});

// 11 nov. 2026, second essai sur l'iPad (§2.5 a) : pendant le zoom au pincement, la bulle « se déplace un peu partout ».
// Sous Safari iPad, innerWidth × innerHeight suivent la partie visible de la page pendant le zoom ; Playwright ne pince
// pas : le banc simule ce que Safari rapporte (visualViewport.scale à 2, innerWidth × innerHeight divisés par deux,
// sans changer la mise en page) et juge que rien ne se replace, puis que la bulle revient à sa place à l'échelle 1.
// Ce qu'on voit sur l'iPad pendant le pincement, Grégoire le juge.
test('sous le zoom au pincement, rien ne se replace : la bulle garde sa place et sa forme, la couche garde l’écran d’avant ; à l’échelle 1, la même place', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirEspaceVide(page, 1180);
    await decouvrirA(page, 6);
    await flecheVers(page, NAV('conception'));   // ce qu'il faut toucher à l'étape 6 (la section présentée a le halo, plus de flèche)
    const b0 = await bullePosee(page);
    await page.evaluate(() => {
        Object.defineProperty(window.visualViewport, 'scale', { configurable: true, get: () => 2 });
        Object.defineProperty(window, 'innerWidth', { configurable: true, get: () => 590 });
        Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => 410 });
        window.visualViewport.dispatchEvent(new Event('resize'));
    });
    // Dix passages de la sonde (120 ms), relevés dans la page : la bulle n'a pas bougé, n'a pas pris la forme du téléphone.
    const releves = await page.evaluate(() => new Promise((fin) => {
        const vus = [];
        const tour = () => {
            const r = document.getElementById('parcours-bulle').getBoundingClientRect();
            vus.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height });
            if (vus.length < 10) setTimeout(tour, 130); else fin(vus);
        };
        setTimeout(tour, 130);
    }));
    releves.forEach((r, k) => expect(r, `sous le zoom, passage ${k + 1}`).toEqual(b0));
    expect(await page.evaluate(() => window.ParcoursMoteur.placement().telephone)).toBe(false);
    expect(await page.evaluate(() => document.getElementById('parcours-fleches').getAttribute('width'))).toBe('1180');
    await flecheVers(page, NAV('conception'), 'sous le zoom');
    await page.evaluate(() => {
        delete window.visualViewport.scale;
        delete window.innerWidth;
        delete window.innerHeight;
        window.visualViewport.dispatchEvent(new Event('resize'));
    });
    expect(await page.evaluate(() => window.visualViewport.scale)).toBe(1);
    const b1 = await bullePosee(page);
    expect(b1).toEqual(b0);
});

test('la poignée au clavier : les flèches déplacent la bulle de 16 px sans changer de page de bulle ; sur la bulle, elles changent de page', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirEspaceVide(page, 1180);
    // Une bulle en pages : « Découvrir » est en lignes depuis le 16 nov. 2026 (une bulle en lignes tient en une page) ;
    // le banc lance donc sa propre définition, un texte assez long pour être coupé.
    await page.evaluate(() => {
        const phrase = "La bulle d'un parcours dit ce que montre l'écran et ce que la personne y fait elle-même. ";
        window.ParcoursMoteur.lancer({ id: 'banc-poignee-pages', lienSortie: 'Plus tard',
            etapes: [{ titre: 'Longue', texte: phrase.repeat(8).trim(), geste: 'Touche « Codex ».',
                contour: () => document.getElementById('btn-codex'), atteint: () => false }] }, {});
    });
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('1 sur 1');
    await expect(bulle(page)).toBeFocused();
    const pages = () => page.evaluate(() => window.ParcoursMoteur.pageCourante());
    expect((await pages()).pages).toBeGreaterThan(1);
    expect((await pages()).page).toBe(0);

    await poignee(page).focus();
    await expect(poignee(page)).toBeFocused();
    const b0 = await bullePosee(page);
    await page.keyboard.press('ArrowRight');
    // Dès la première flèche : la bulle a bougé, sa page n'a pas changé (l'événement ne remonte pas à la bulle).
    expect((await pages()).page, 'la flèche droite sur la poignée ne change pas de page').toBe(0);
    await page.keyboard.press('ArrowRight');
    // Vers le haut : la bulle du banc est posée au bas de l'écran utile, elle n'a de place que de ce côté.
    await page.keyboard.press('ArrowUp');
    const b1 = await rectDe(page, '#parcours-bulle');
    expect([Math.round(b1.left - b0.left), Math.round(b1.top - b0.top)]).toEqual([32, -16]);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowDown');
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
