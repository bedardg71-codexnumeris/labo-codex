import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { attendreApplication } from './harness/attendre-application.js';
import { indexHtml, ouvrirEspaceVide, ouvrirPanneau, bulle, bulleNeCouvrePas } from './harness/classe-de-banc.js';
import { nombreDeFleches } from './harness/fleches-de-banc.js';

// =======================================================================
// LA BULLE ENTIÈRE DANS LA FENÊTRE, LE BANDEAU DE VERSION SOUS L'EN-TÊTE — 23 NOVEMBRE 2026
// =======================================================================
// plans de travail/RAPPORT-2026-11-23-bulle-et-bandeau.md (familles B et C du verdict WebKit de la 1.258.0).
// Ce banc juge, aux deux tailles de l'iPad (1180 × 820 couché, 820 × 1180 debout) :
//   · la bulle 1 de « Mettre ta classe en place » et la bulle 3 de « Mettre tes données à l'abri » : entières dans
//     l'écran utile, sans rien couvrir de ce qu'elles désignent, tous leurs mots là (ce qui dépasse défile DANS la bulle) ;
//   · le défilement intérieur tient d'un passage de la sonde au suivant (« la forme gardée ») ;
//   · la poignée déplace encore une bulle plafonnée, qui reste dans la fenêtre ;
//   · le bandeau de version : sous l'en-tête et la bande du groupe, aucun de leurs contrôles couvert, clair et sombre.
// L'étape 2 de « Recevoir les productions » est jugée par son banc, aux deux largeurs (parcours-4-recevoir-et-rendre).
// Break-tests (23 nov. 2026, WebKit) : voir le rapport, § « Vérification adverse ».
// Les captures : CAPTURES_BULLE_BANDEAU=<dossier>.

const CAPTURES = process.env.CAPTURES_BULLE_BANDEAU || '';
const TAILLES = [[1180, 820], [820, 1180]];

async function capture(page, nom) {
    if (!CAPTURES) return;
    fs.mkdirSync(CAPTURES, { recursive: true });
    await page.evaluate(() => document.querySelectorAll('.notifications-pile > *').forEach((n) => n.remove()));
    await page.screenshot({ path: path.join(CAPTURES, nom + '.png') });
}

/** La bulle, l'écran utile du moteur, et ce qui défile en elle. */
const geometrie = (page) => page.evaluate(() => {
    const b = document.getElementById('parcours-bulle'), r = b.getBoundingClientRect();
    // Avant le premier passage de la sonde, rien n'est encore placé : le dire, l'attente reprendra.
    const pl = window.ParcoursMoteur.placement();
    if (!pl) return { dansLEcranUtile: false, dansLaFenetre: false, defile: 0 };
    const c = pl.cadre;
    const l = b.querySelector('.parcours-bulle-lignes');
    return {
        dansLEcranUtile: r.left >= c.gauche - 1 && r.top >= c.haut - 1 && r.right <= c.droite + 1 && r.bottom <= c.bas + 1,
        dansLaFenetre: r.left >= 0 && r.top >= 0 && r.right <= document.documentElement.clientWidth && r.bottom <= window.innerHeight,
        defile: l ? l.scrollHeight - l.clientHeight : 0
    };
});

async function bulleEntiere(page, contexte) {
    await expect.poll(async () => (await geometrie(page)).dansLEcranUtile, { message: contexte + ' : la bulle dans l’écran utile', timeout: 4000 }).toBe(true);
    expect((await geometrie(page)).dansLaFenetre, contexte + ' : la bulle dans la fenêtre').toBe(true);
}

/** `n` passages de plus de la sonde du moteur (120 ms chacun) : une condition, pas un délai. */
async function passagesDeLaSonde(page, n) {
    const depart = await page.evaluate(() => window.ParcoursMoteur.placement().passages);
    await expect.poll(() => page.evaluate(() => window.ParcoursMoteur.placement().passages), { timeout: 10000 }).toBeGreaterThanOrEqual(depart + n);
}

/** La page immobile : la bulle et ce qu'elle désigne à la même place trois relevés de suite. */
async function pageImmobile(page) {
    let avant = '', memes = 0;
    await expect.poll(async () => {
        await passagesDeLaSonde(page, 2);
        const g = await page.evaluate(() => {
            const R = (el) => { const r = el.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom].map(Math.round).join(','); };
            const pl = window.ParcoursMoteur.placement();
            return [window.scrollY, R(document.getElementById('parcours-bulle'))].concat(pl.zones.map(R)).join('|');
        });
        memes = g === avant ? memes + 1 : 0;
        avant = g;
        return memes;
    }, { timeout: 15000 }).toBeGreaterThanOrEqual(2);
}

/** Ce qui défile dans la bulle garde sa place d'un passage de la sonde (120 ms) au suivant. */
async function leDefilementInterieurTient(page, contexte) {
    // La page d'abord immobile : à l'ouverture d'une étape, elle défile encore, ce que la bulle évite bouge, et sa
    // forme se refait (c'est voulu). Ce qu'on juge : une fois posée, rien ne la défait.
    await pageImmobile(page);
    const defile = (await geometrie(page)).defile;
    if (defile < 20) return false;
    // Tant qu'il reste des lignes plus bas, leur bord se fond ; au bout, plus de fondu.
    const lignes = page.locator('#parcours-bulle .parcours-bulle-lignes');
    await expect(lignes, contexte + ' : le fondu dit qu’il reste à lire').toHaveClass(/parcours-bulle-lignes--a-suivre/);
    expect(await lignes.evaluate((l) => getComputedStyle(l).webkitMaskImage || getComputedStyle(l).maskImage)).toContain('linear-gradient');
    await lignes.evaluate((l) => { l.scrollTop = l.scrollHeight; });
    await expect(lignes, contexte + ' : au bout du texte, plus de fondu').not.toHaveClass(/parcours-bulle-lignes--a-suivre/);
    const pose = Math.min(40, defile);
    await page.evaluate((y) => { document.querySelector('#parcours-bulle .parcours-bulle-lignes').scrollTop = y; }, pose);
    await passagesDeLaSonde(page, 10);
    expect(await page.evaluate(() => document.querySelector('#parcours-bulle .parcours-bulle-lignes').scrollTop),
        contexte + ' : le texte défilé dans la bulle n’est pas ramené en haut').toBe(pose);
    return true;
}

for (const [largeur, hauteur] of TAILLES) {
    test(`« Ton trimestre » à ${largeur} × ${hauteur} : la bulle entière, hors des champs qu'elle demande de remplir, tous ses mots là`, async ({ page }) => {
        const contexte = `« Ton trimestre », ${largeur} × ${hauteur}`;
        await ouvrirEspaceVide(page, largeur, { hauteur });
        await ouvrirPanneau(page);
        await page.click('#panneau-assistance [data-parcours="classe"] .assistance-parcours-bouton');
        await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText('Ton trimestre', { timeout: 10000 });
        await bulleEntiere(page, contexte);
        const CHAMPS = ['#v2-sessionTrimestre', '#v2-anneeTrimestre', '#v2-debutTrimestre', '#v2-finCours', '#v2-finTrimestre'];
        for (const sel of CHAMPS.concat(['#v2-nomTrimestre', '#v2-btnCreerTrimestre'])) await bulleNeCouvrePas(page, sel, contexte);
        // Une flèche par champ à remplir, et celle du bouton : la bulle n'est pas collée à un champ.
        await nombreDeFleches(page, 6, contexte);
        // Aucun mot ne change ni ne disparaît : l'entrée (le parcours, la phrase de la poignée) et chaque ligne de l'étape.
        await expect(bulle(page).locator('.parcours-bulle-identite')).toBeVisible();
        await expect(bulle(page).locator('.parcours-bulle-aide')).toHaveText('Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir.');
        const lignes = await page.evaluate(() => window.ParcoursClasse.etapes[0].lignes().filter((l) => l && l.texte).map((l) => l.texte));
        expect(lignes.length).toBeGreaterThan(3);
        const dit = (await bulle(page).locator('.parcours-bulle-lignes').textContent()).replace(/ /g, ' ').replace(/\s+/g, ' ');
        expect(lignes.filter((l) => !dit.includes(l.replace(/\s+/g, ' '))), contexte + ' : les lignes absentes de la bulle').toEqual([]);
        await capture(page, `parcours-2-etape-1-${largeur}x${hauteur}`);

        // Couché, la bulle prend sa forme large dans la bande libre : elle y montre une plus grande part de son texte.
        if (hauteur === 820) await expect(bulle(page)).toHaveClass(/parcours-bulle--elargie/);
        // Couché (820 px de haut), la bulle est plafonnée et son texte défile ; debout, elle tient entière.
        expect(await leDefilementInterieurTient(page, contexte), contexte + ' : la bulle est plafonnée, son texte défile').toBe(hauteur === 820);

        // La poignée : la bulle plafonnée se déplace encore, et reste dans la fenêtre.
        const p = await bulle(page).locator('.parcours-bulle-poignee').boundingBox();
        const avant = await bulle(page).boundingBox();
        await page.mouse.move(p.x + p.width / 2, p.y + p.height / 2);
        await page.mouse.down();
        // Vers le milieu de l'écran : au bord, la bulle n'irait pas plus loin.
        const dx = avant.x + avant.width / 2 < largeur / 2 ? 120 : -120, dy = avant.y + avant.height / 2 < hauteur / 2 ? 60 : -60;
        await page.mouse.move(p.x + p.width / 2 + dx, p.y + p.height / 2 + dy, { steps: 6 });
        await page.mouse.up();
        await expect.poll(() => page.evaluate(() => window.ParcoursMoteur.placement().deplacee)).toBe(true);
        const apres = await bulle(page).boundingBox();
        expect(Math.abs(apres.x - avant.x) + Math.abs(apres.y - avant.y), contexte + ' : la bulle a bougé').toBeGreaterThan(40);
        await passagesDeLaSonde(page, 3);
        expect((await geometrie(page)).dansLaFenetre, contexte + ' : déplacée, la bulle reste dans la fenêtre').toBe(true);
    });

    test(`« Range ton fichier » à ${largeur} × ${hauteur} : la bulle entière dans la fenêtre, « Quitter le parcours » visible, les boutons de l'aperçu libres`, async ({ page }) => {
        const contexte = `« Range ton fichier », ${largeur} × ${hauteur}`;
        await ouvrirEspaceVide(page, largeur, { hauteur });
        await page.evaluate(() => {
            const loin = new Date(); loin.setDate(loin.getDate() + 30);
            db.setSync('backupProchainRappel', loin.toISOString());
            db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026' }]);
            // L'écriture est fausse : aucun fichier sur le disque.
            window.showSaveFilePicker = async () => ({ createWritable: async () => ({ write: async () => {}, close: async () => {}, abort: async () => {} }) });
        });
        await ouvrirPanneau(page);
        await page.click('[data-parcours="donnees"] .assistance-parcours-bouton');
        await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('1 sur 4', { timeout: 10000 });
        await page.click('#btn-codex');
        await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('2 sur 4', { timeout: 10000 });
        await page.click('#codex-menu .codex-menu-item:not(.codex-menu-item--simple)[data-action="Codex.actionEnregistrer"]');
        await expect(page.locator('.export-preview-modal')).toBeVisible();
        await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText('Range ton fichier', { timeout: 10000 });
        await bulleEntiere(page, contexte);
        for (const sel of ['.export-preview-modal .btn-confirmer', '.export-preview-modal .btn-annuler']) await bulleNeCouvrePas(page, sel, contexte);
        // « Quitter le parcours » n'est plus coupé par le bas de la fenêtre.
        await expect(bulle(page).locator('.parcours-bulle-sortie')).toBeInViewport({ ratio: 1 });
        const lignes = await page.evaluate(() => window.ParcoursDonnees.lignesEtape3('fenetre', false).map((l) => l.texte));
        const dit = (await bulle(page).locator('.parcours-bulle-lignes').textContent()).replace(/ /g, ' ').replace(/\s+/g, ' ');
        expect(lignes.filter((l) => !dit.includes(l.replace(/\s+/g, ' '))), contexte + ' : les lignes absentes de la bulle').toEqual([]);
        await capture(page, `parcours-6-etape-3-${largeur}x${hauteur}`);
        await leDefilementInterieurTient(page, contexte);
    });
}

// Le filet vaut maintenant l'écran utile : une bulle plus haute que lui s'élargit toujours (16 nov. 2026), sa hauteur
// ENTIÈRE comptée (ce qui défile en elle compris), et son texte défile s'il le faut encore. Le banc lance sa propre
// bulle, en lignes, trop longue pour un écran bas.
test('une bulle en lignes plus haute que l’écran utile s’élargit, reste entière dans la fenêtre, et ses lignes défilent', async ({ page }) => {
    await ouvrirEspaceVide(page, 1180, { hauteur: 500 });
    await page.evaluate(() => {
        const phrase = "La bulle d'un parcours dit ce que montre l'écran et ce que la personne y fait elle-même, une ligne après l'autre.";
        window.ParcoursMoteur.lancer({ id: 'banc-bulle-haute', lienSortie: 'Plus tard',
            etapes: [{ titre: 'Haute', lignes: () => Array.from({ length: 9 }, (x, k) => ({ texte: (k + 1) + '. ' + phrase, note: true }))
                .concat([{ texte: 'Touche « Codex »', geste: true }]),
                contour: () => document.getElementById('btn-codex'), atteint: () => false }] }, {});
    });
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('1 sur 1');
    await bulleEntiere(page, 'bulle haute, 1180 × 500');
    await expect(bulle(page)).toHaveClass(/parcours-bulle--elargie/);
    await bulleNeCouvrePas(page, '#btn-codex', 'bulle haute, 1180 × 500');
    expect((await geometrie(page)).defile, 'ses lignes défilent dans la bulle').toBeGreaterThan(20);
    await expect(bulle(page).locator('.parcours-bulle-sortie')).toBeInViewport({ ratio: 1 });
});

// ---------- Le bandeau de version ----------

const CONTROLES = ['#btn-codex', '#entete-menu-bouton', '#selectGroupeCoursHeader', '.navigation-principale a, .navigation-principale button'];

for (const [largeur, hauteur] of TAILLES) {
    for (const clair of [false, true]) {
        test(`le bandeau de version à ${largeur} × ${hauteur} (${clair ? 'clair' : 'sombre'}) : sous l'en-tête, aucun de ses contrôles couvert, le menu s'ouvre`, async ({ page }) => {
            await page.setViewportSize({ width: largeur, height: hauteur });
            await page.addInitScript(() => { try { localStorage.setItem('monitorage-build-vu', '0101-0000'); } catch (e) { /* rien */ } });
            await page.goto(indexHtml);
            await attendreApplication(page);
            await page.evaluate((c) => { definirPreference('modeClair', c); document.body.classList.toggle('mode-clair', c); }, clair);
            const bandeau = page.locator('#bandeau-mise-a-jour');
            await expect(bandeau).toHaveClass(/\bvisible\b/);
            await expect(page.locator('#bandeau-mise-a-jour-texte')).toHaveText('Nouvelle version chargée. Tes données persistent.');
            // Sa transition finie (0,4 s) : sa place ne bouge plus.
            await expect.poll(() => bandeau.evaluate((b) => getComputedStyle(b).opacity)).toBe('1');
            await expect.poll(() => bandeau.evaluate((b) => Math.round(document.documentElement.clientWidth - b.getBoundingClientRect().right))).toBe(20);
            const g = await page.evaluate((sels) => {
                const R = (el) => el.getBoundingClientRect();
                const b = R(document.getElementById('bandeau-mise-a-jour'));
                const touche = (r) => !(r.right <= b.left || b.right <= r.left || r.bottom <= b.top || b.bottom <= r.top);
                const controles = [...new Set(sels.flatMap((s) => [...document.querySelectorAll(s)]))].filter((el) => R(el).width > 0);
                const selecteurDeTheme = [...document.querySelectorAll('header.entete button')].filter((el) => R(el).width > 0);
                return {
                    nControles: controles.length,
                    couverts: controles.concat(selecteurDeTheme).filter((el) => touche(R(el))).map((el) => el.id || el.textContent.trim().slice(0, 20)),
                    sousLEntete: b.top >= R(document.querySelector('header.entete')).bottom,
                    sousLaBande: b.top >= R(document.getElementById('bandeau-groupe-cours')).bottom,
                    dansLaFenetre: b.left >= 0 && b.right <= document.documentElement.clientWidth && b.bottom <= window.innerHeight
                };
            }, CONTROLES);
            expect(g.nControles, 'les contrôles de l’en-tête sont là').toBeGreaterThan(5);
            expect(g.couverts, 'aucun contrôle de l’en-tête sous le bandeau').toEqual([]);
            expect({ sousLEntete: g.sousLEntete, sousLaBande: g.sousLaBande, dansLaFenetre: g.dansLaFenetre })
                .toEqual({ sousLEntete: true, sousLaBande: true, dansLaFenetre: true });
            await capture(page, `bandeau-${largeur}x${hauteur}-${clair ? 'clair' : 'sombre'}`);
            // Le geste que le bandeau empêchait : le menu s'ouvre, le bandeau toujours là.
            await page.click('#entete-menu-bouton', { timeout: 5000 });
            await expect(page.locator('#entete-menu-bouton')).toHaveAttribute('aria-expanded', 'true');
            await expect(bandeau).toHaveClass(/\bvisible\b/);
            // Et il se ferme toujours par son ×.
            await page.keyboard.press('Escape');
            await bandeau.locator('.bandeau-mise-a-jour-close').click();
            await expect(bandeau).not.toHaveClass(/\bvisible\b/);
        });
    }
}
