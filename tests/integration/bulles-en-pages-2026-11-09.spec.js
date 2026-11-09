import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// =======================================================================
// LOT « LES BULLES EN PAGES » — 9 NOVEMBRE 2026
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-09-bulles-en-pages.md. Le moteur seul (js/parcours-moteur.js), sur un
// parcours de banc : une bulle courte, une bulle longue, une fin. Ce banc juge :
//   · une bulle courte n'est pas coupée : ni « 1/2 », ni flèches ;
//   · une longue se coupe à une fin de phrase, jamais dans une citation entre guillemets, au plus près du milieu ;
//     ses pages, mises bout à bout, redonnent le texte mot pour mot, et chacune tient en dix lignes ;
//   · le texte entier reste dans la bulle, dans l'ordre (le lecteur d'écran le lit), une page à l'œil ;
//   · « → », « ← », et les flèches du clavier quand la bulle a le focus ; « 1/2 » à côté de « n sur N » ;
//   · la ligne du geste et « Plus tard » sont visibles sur chaque page ; le geste fait avancer depuis la page 2 ;
//   · sur téléphone (390 px), repliée, la tête seule (sans « 1/2 ») ; dépliée, elle se pagine.
// Break-tests (9 nov., Chromium) : LIGNES_PAR_PAGE porté à 99 → ROUGE (la bulle longue n'est pas coupée) ; la
// profondeur des guillemets ignorée dans `coupuresPossibles` → ROUGE (une page coupe la citation). Rétablis → verts.
// ⚠ Écrit et joué sous Chromium (session cloud) : le verdict WebKit se prend sur le Mac.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
const HORLOGE = new Date('2026-11-10T14:00:00.000Z');

const COURT = 'Une bulle courte tient en quelques lignes. Elle ne se coupe pas.';
// Un texte de banc, sans nom réel. Au milieu, une citation qui contient elle-même des fins de phrase : la fin de phrase
// la plus proche du milieu est DANS la citation (mesuré : le milieu à 348 caractères, la citation de 322 à 384, la fin
// de phrase la plus proche à 343) ; sans la garde des guillemets, la coupe tomberait dedans. Avec elle : 291 + 405.
const LONG = [
    'Cette bulle de banc est longue à dessein : elle doit dépasser dix lignes à la largeur ordinaire d’une bulle.',
    'Elle parle d’une production fictive, remise par une personne fictive, dans un groupe fictif.',
    'On y trouve aussi des mots entre guillemets, comme « Mettre à jour », sans fin de phrase.',
    'Voici la citation du milieu : « Elle a des phrases. Elle en a trois. La coupe reste dehors. »',
    'Une question peut aussi finir une phrase ? Oui, et la suivante commence par une majuscule.',
    'Après la citation, le texte reprend son cours ordinaire, une phrase après l’autre.',
    'Elle sert à allonger la bulle pour qu’une coupe soit nécessaire.',
    'La dernière phrase de la bulle se termine ici, sans rien de particulier.'
].join(' ');
const GESTE = 'Touche « Codex », en haut de l’écran.';

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

/** Le parcours de banc : la bulle courte (« Continuer »), la longue (le geste : ouvrir le menu Codex), la fin. */
async function lancerLeBanc(page) {
    await page.evaluate(({ COURT, LONG, GESTE }) => {
        const menuOuvert = () => { const m = document.getElementById('codex-menu'); return !!(m && !m.classList.contains('u-hide') && ParcoursMoteur.visible(m)); };
        window.__fin = false;
        ParcoursMoteur.lancer({
            id: 'banc-pages',
            lienSortie: 'Plus tard',
            etapes: [
                { titre: 'Courte', texte: COURT, centre: true, boutons: [{ libelle: 'Continuer', primaire: true, action: (m) => m.allerA(1) }] },
                { titre: 'Longue', texte: LONG, geste: GESTE, contour: () => document.getElementById('btn-codex'), atteint: menuOuvert },
                { titre: 'Fin', texte: 'La fin du banc.', centre: true, sansSortie: true, boutons: [{ libelle: 'Terminer', primaire: true, action: (m) => { window.__fin = true; m.fermer(); } }] }
            ]
        }, {});
    }, { COURT, LONG, GESTE });
}

const bulle = (page) => page.locator('#parcours-bulle');
const rang = (page) => bulle(page).locator('.parcours-bulle-rang');
const indice = (page) => bulle(page).locator('.parcours-bulle-pages');
const suivante = (page) => bulle(page).locator('.parcours-bulle-page-suiv');
const precedente = (page) => bulle(page).locator('.parcours-bulle-page-prec');

/** Les pages telles que la bulle les porte, la page visible, et le nombre de lignes de chacune à sa largeur. */
async function lirePages(page) {
    return page.evaluate(() => {
        const p = document.querySelector('#parcours-bulle .parcours-bulle-texte');
        const spans = [...p.querySelectorAll('.parcours-bulle-page')];
        const ligne = parseFloat(getComputedStyle(p).lineHeight);
        // Le nombre de lignes de chaque page, mesuré dans une copie du texte, à la même largeur.
        const sonde = p.cloneNode(false);
        sonde.style.cssText = 'position:absolute;visibility:hidden;min-height:0;max-height:none;width:' + p.clientWidth + 'px';
        p.parentElement.appendChild(sonde);
        const lignes = spans.map((s) => { sonde.textContent = s.textContent; return Math.round(sonde.scrollHeight / ligne); });
        sonde.remove();
        return {
            textes: spans.map((s) => s.textContent),
            visibles: spans.map((s) => !s.classList.contains('u-lecteur-ecran')),
            lignes,
            tout: p.textContent,
            etat: ParcoursMoteur.pageCourante()
        };
    });
}

async function gesteEtSortieVisibles(page) {
    await expect(bulle(page).locator('.parcours-bulle-geste')).toBeVisible();
    await expect(bulle(page).locator('.parcours-bulle-geste')).toHaveText(GESTE);
    await expect(bulle(page).locator('.parcours-bulle-sortie')).toBeVisible();
}

for (const largeur of [1180, 820]) {
    test(`${largeur} px : la courte n'est pas coupée ; la longue se coupe à une fin de phrase, hors de la citation ; « → », « ← », le clavier ; le geste fait avancer depuis la page 2`, async ({ page }) => {
        await ouvrirEspaceVide(page, largeur, 900);
        await lancerLeBanc(page);

        // La bulle courte : une page, ni « 1/2 » ni flèches.
        await expect(rang(page)).toHaveText('1 sur 3');
        expect((await lirePages(page)).etat).toEqual({ page: 0, pages: 1 });
        await expect(indice(page)).toBeHidden();
        await expect(bulle(page).locator('.parcours-bulle-nav')).toBeHidden();
        await expect(bulle(page).locator('.parcours-bulle-texte')).toHaveText(COURT);
        await bulle(page).getByRole('button', { name: 'Continuer' }).click();

        // La bulle longue : deux pages (le texte de banc est taillé pour cela), « 1/2 » à côté de « 2 sur 3 ».
        await expect(rang(page)).toHaveText('2 sur 3');
        const l = await lirePages(page);
        expect(l.etat.pages, 'deux pages à cette largeur : sinon la garde des guillemets n’est pas éprouvée').toBe(2);
        await expect(indice(page)).toHaveText('1/2');
        // Mises bout à bout, les pages redonnent le texte mot pour mot ; le lecteur d'écran a le texte entier.
        expect(l.textes.join(' ')).toBe(LONG);
        expect(l.tout).toBe(LONG);
        // Chaque coupe tombe à une fin de phrase ; aucune page ne coupe une citation ; chacune tient en dix lignes.
        l.textes.forEach((t, k) => {
            if (k < l.textes.length - 1) expect(t, 'page ' + (k + 1) + ' : fin de phrase').toMatch(/[.!?…]$/);
            if (k > 0) expect(t, 'page ' + (k + 1) + ' : début de phrase').toMatch(/^[A-ZÀ-ÖØ-ÞŒ«0-9]/);
            expect((t.match(/«/g) || []).length, 'page ' + (k + 1) + ' : citation entière').toBe((t.match(/»/g) || []).length);
        });
        expect(Math.max(...l.lignes), 'chaque page tient en dix lignes').toBeLessThanOrEqual(10);
        // Au plus près du milieu, hors de la citation : la fin de phrase qui précède la citation (291 sur 697).
        expect(Math.abs(l.textes[0].length - LONG.length / 2)).toBeLessThan(LONG.length / 4);
        expect(l.visibles).toEqual(l.textes.map((_, k) => k === 0));
        await gesteEtSortieVisibles(page);
        await expect(precedente(page)).toBeDisabled();

        // « → » : la page 2 ; le geste et « Plus tard » y sont aussi.
        await suivante(page).click();
        expect((await lirePages(page)).etat.page).toBe(1);
        await expect(indice(page)).toHaveText('2/' + l.etat.pages);
        await gesteEtSortieVisibles(page);
        await expect(precedente(page)).toBeEnabled();
        // « ← » revient ; au clavier, la flèche droite avance de nouveau, la gauche recule.
        await precedente(page).click();
        expect((await lirePages(page)).etat.page).toBe(0);
        await bulle(page).focus();
        await page.keyboard.press('ArrowRight');
        expect((await lirePages(page)).etat.page).toBe(1);
        await page.keyboard.press('ArrowLeft');
        expect((await lirePages(page)).etat.page).toBe(0);
        await page.keyboard.press('ArrowRight');
        expect((await lirePages(page)).etat.page).toBe(1);

        // Depuis la page 2, le geste fait avancer : le menu Codex ouvert, l'étape 3.
        await page.click('#btn-codex');
        await expect(rang(page)).toHaveText('3 sur 3');
        expect((await lirePages(page)).etat).toEqual({ page: 0, pages: 1 });
        await bulle(page).getByRole('button', { name: 'Terminer' }).click();
        expect(await page.evaluate(() => window.__fin)).toBe(true);
    });
}

test('390 px : repliée, la tête seule (sans « 1/2 ») ; dépliée, la bulle longue se pagine comme ailleurs', async ({ page }) => {
    await ouvrirEspaceVide(page, 390, 844);
    await lancerLeBanc(page);
    await bulle(page).getByRole('button', { name: 'Continuer' }).click();
    await expect(rang(page)).toHaveText('2 sur 3');
    // Une étape qui désigne quoi toucher s'ouvre repliée : ni texte, ni « 1/2 », ni flèches.
    await expect(bulle(page)).toHaveClass(/est-repliee/);
    await expect(indice(page)).toBeHidden();
    await expect(bulle(page).locator('.parcours-bulle-nav')).toBeHidden();
    // Dépliée : les pages, « 1/2 », les flèches, la ligne du geste.
    await bulle(page).locator('.parcours-bulle-bascule').click();
    await expect(bulle(page)).not.toHaveClass(/est-repliee/);
    const l = await lirePages(page);
    expect(l.etat.pages).toBeGreaterThanOrEqual(2);
    expect(l.textes.join(' ')).toBe(LONG);
    await expect(indice(page)).toHaveText('1/' + l.etat.pages);
    await expect(suivante(page)).toBeVisible();
    await gesteEtSortieVisibles(page);
    await suivante(page).click();
    await expect(indice(page)).toHaveText('2/' + l.etat.pages);
    await gesteEtSortieVisibles(page);
});

test('1180 px : un texte trop long pour deux pages se coupe en trois, chacune à une fin de phrase et en dix lignes', async ({ page }) => {
    // Le texte de banc, suivi de ses quatre premières phrases (1126 caractères) : deux pages dépasseraient dix lignes.
    const TROIS = LONG + ' ' + LONG.slice(0, LONG.indexOf('majuscule.') + 'majuscule.'.length);
    await ouvrirEspaceVide(page, 1180, 820);
    await page.evaluate(({ TROIS, GESTE }) => {
        ParcoursMoteur.lancer({
            id: 'banc-trois-pages',
            lienSortie: 'Plus tard',
            etapes: [{ titre: 'Très longue', texte: TROIS, geste: GESTE, contour: () => document.getElementById('btn-codex'), atteint: () => false }]
        }, {});
    }, { TROIS, GESTE });
    await expect(rang(page)).toHaveText('1 sur 1');
    const l = await lirePages(page);
    expect(l.etat.pages).toBe(3);
    expect(l.textes.join(' ')).toBe(TROIS);
    l.textes.forEach((t, k) => {
        if (k < 2) expect(t, 'page ' + (k + 1) + ' : fin de phrase').toMatch(/[.!?…]$/);
        expect((t.match(/«/g) || []).length, 'page ' + (k + 1) + ' : citation entière').toBe((t.match(/»/g) || []).length);
    });
    expect(Math.max(...l.lignes), 'chaque page tient en dix lignes').toBeLessThanOrEqual(10);
    await expect(indice(page)).toHaveText('1/3');
    await suivante(page).click();
    await suivante(page).click();
    await expect(indice(page)).toHaveText('3/3');
    await expect(suivante(page)).toBeDisabled();
    await gesteEtSortieVisibles(page);
});
