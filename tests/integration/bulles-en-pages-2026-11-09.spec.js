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
//   · « → », « ← », et les flèches du clavier quand la bulle a le focus ; le compteur entre les flèches,
//     « ← 1/2 → », jamais dans la tête (décision de Grégoire, 9 nov., 17 h 55) ; au changement de page, le
//     lecteur d'écran entend « page 2 de 2 », sans le texte de l'étape ;
//   · la ligne du geste et « Plus tard » sont visibles sur chaque page ; le geste fait avancer depuis la page 2 ;
//   · sur téléphone (390 px), repliée, la tête seule (sans « 1/2 ») ; dépliée, elle se pagine.
// Puis, après la relecture d'un agent neuf (9 nov.) : « ← » et « → » ne bougent pas d'une page à l'autre ; le
// clavier ne change pas la page d'une bulle repliée, ni avec un modificateur ; le focus d'une flèche devenue
// inactive passe à l'autre ; une largeur posée par la sonde d'étape (`atteint`) refait la découpe dans le même
// passage ; la page reste au passage du seuil du téléphone ; une découpe qui n'aide pas n'est pas faite.
// Break-tests (9 nov., Chromium) : LIGNES_PAR_PAGE porté à 99 → ROUGE (la bulle longue n'est pas coupée) ; la
// profondeur des guillemets ignorée dans `coupuresPossibles` → ROUGE (une page coupe la citation) ; PAGES_MAX
// à 2 → ROUGE (trois pages attendues). Rétablis → verts. Les break-tests des essais ajoutés après la relecture
// sont au rapport.
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
        // Groupe 3 (9 nov.) : le moteur pose une espace insécable à l'intérieur des guillemets (typographier, 17 h 58) ;
        // le texte de l'étape garde ses espaces ordinaires : on compare sans elles.
        const sansInsecable = (t) => t.replace(/\u00a0/g, ' ');
        return {
            textes: spans.map((s) => sansInsecable(s.textContent)),
            visibles: spans.map((s) => !s.classList.contains('u-lecteur-ecran')),
            lignes,
            tout: sansInsecable(p.textContent),
            etat: (({ page: k, pages: n }) => ({ page: k, pages: n }))(ParcoursMoteur.pageCourante())
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

        // La bulle longue : deux pages (le texte de banc est taillé pour cela) ; « ← 1/2 → » sous le texte.
        await expect(rang(page)).toHaveText('2 sur 3');
        const l = await lirePages(page);
        expect(l.etat.pages, 'deux pages à cette largeur : sinon la garde des guillemets n’est pas éprouvée').toBe(2);
        await expect(indice(page)).toHaveText('1/2');
        // La tête ne garde que le titre et le rang : le compteur des pages n'y reparaît pas.
        await expect(bulle(page).locator('.parcours-bulle-tete .parcours-bulle-pages'), 'le compteur des pages hors de la tête').toHaveCount(0);
        // ↻ 10 nov. 2026 (« Les flèches des parcours ») : la tête porte aussi la poignée ⠿ (hors téléphone). L'essai
        // lisait le texte entier de la tête ; il lit maintenant ses enfants, un par un : titre, rang, poignée, rien d'autre.
        expect(await bulle(page).locator('.parcours-bulle-tete').evaluate((t) => [...t.children].map((c) => [c.className, c.textContent])))
            .toEqual([['parcours-bulle-titre', 'Longue'], ['parcours-bulle-rang', '2 sur 3'], ['parcours-bulle-poignee', '\u283f']]);
        // Le compteur entre les deux flèches, dans le DOM et à l'écran.
        const nav = await bulle(page).locator('.parcours-bulle-nav').evaluate((n) => ({
            ordre: [...n.children].map((c) => c.className),
            x: [...n.children].map((c) => { const r = c.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; })
        }));
        expect(nav.ordre).toEqual(['parcours-bulle-fleche parcours-bulle-page-prec', 'parcours-bulle-pages', 'parcours-bulle-fleche parcours-bulle-page-suiv']);
        expect(nav.x[0][1]).toBeLessThanOrEqual(nav.x[1][0]);
        expect(nav.x[1][1]).toBeLessThanOrEqual(nav.x[2][0]);
        // Mises bout à bout, les pages redonnent le texte mot pour mot.
        expect(l.textes.join(' ')).toBe(LONG);
        expect(l.tout).toBe(LONG);
        // Le lecteur d'écran a le texte entier, dans l'ordre, page 1 affichée : l'arbre d'accessibilité du
        // paragraphe (textContent ne suffit pas à le dire : il lit aussi un texte en display:none).
        const arbre = (await bulle(page).locator('.parcours-bulle-texte').ariaSnapshot()).replace(/\s+/g, ' ');
        expect(arbre).toContain('Cette bulle de banc est longue à dessein');
        expect(arbre, 'la page 2, cachée à l’œil, reste lue').toContain('La dernière phrase de la bulle se termine ici');
        // Chaque coupe tombe à une fin de phrase ; aucune page ne coupe une citation ; chacune tient en dix lignes.
        l.textes.forEach((t, k) => {
            if (k < l.textes.length - 1) expect(t, 'page ' + (k + 1) + ' : fin de phrase').toMatch(/[.!?…]$/);
            if (k > 0) expect(t, 'page ' + (k + 1) + ' : début de phrase').toMatch(/^[A-ZÀ-ÖØ-ÞŒ«0-9]/);
            expect((t.match(/«/g) || []).length, 'page ' + (k + 1) + ' : citation entière').toBe((t.match(/»/g) || []).length);
        });
        expect(Math.max(...l.lignes), 'chaque page tient en dix lignes').toBeLessThanOrEqual(10);
        // Au plus près du milieu, hors de la citation : la fin de phrase qui précède la citation (291 sur 697).
        expect(l.textes[0].length).toBe(291);
        expect(l.visibles).toEqual(l.textes.map((_, k) => k === 0));
        await gesteEtSortieVisibles(page);
        await expect(precedente(page)).toBeDisabled();

        // « → » : la page 2 ; le geste et « Plus tard » y sont aussi ; « ← » et « → » n'ont pas bougé.
        const ou = () => suivante(page).evaluate((el) => { const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top)]; });
        const avant = await ou();
        await suivante(page).click();
        expect((await lirePages(page)).etat.page).toBe(1);
        expect(await ou(), '« → » au même endroit sur les deux pages').toEqual(avant);
        // Le lecteur d'écran entend la page, pas le texte de l'étape une seconde fois.
        await expect(page.locator('#parcours-annonce')).toHaveText('page 2 de 2');
        await expect(indice(page)).toHaveText('2/' + l.etat.pages);
        await gesteEtSortieVisibles(page);
        await expect(precedente(page)).toBeEnabled();
        // « ← » revient ; au clavier, la flèche droite avance de nouveau, la gauche recule.
        await precedente(page).click();
        expect((await lirePages(page)).etat.page).toBe(0);
        await expect(page.locator('#parcours-annonce')).toHaveText('page 1 de 2');
        await bulle(page).focus();
        await page.keyboard.press('ArrowRight');
        expect((await lirePages(page)).etat.page).toBe(1);
        await page.keyboard.press('ArrowLeft');
        expect((await lirePages(page)).etat.page).toBe(0);
        await page.keyboard.press('ArrowRight');
        expect((await lirePages(page)).etat.page).toBe(1);
        // Avec un modificateur (Alt ou Cmd + ← : la page précédente du navigateur), rien ne change, et la bulle laisse la
        // touche au navigateur (elle ne l'empêche pas). Groupe 3 (9 nov.) : la touche est envoyée à la bulle comme le
        // clavier l'enverrait, mais sans que le navigateur fasse son geste ; pressée pour de vrai, Cmd+← et Ctrl+← ramenaient
        // le WebKit du banc à la page précédente, et l'essai mesurait le navigateur, pas la bulle.
        for (const [touche, mods] of [['Alt+ArrowLeft', { altKey: true }], ['Meta+ArrowLeft', { metaKey: true }],
            ['Control+ArrowLeft', { ctrlKey: true }], ['Shift+ArrowLeft', { shiftKey: true }]]) {
            const empechee = await page.evaluate((m) => {
                const ev = new KeyboardEvent('keydown', Object.assign({ key: 'ArrowLeft', bubbles: true, cancelable: true }, m));
                (document.activeElement || document.body).dispatchEvent(ev);
                return ev.defaultPrevented;
            }, mods);
            expect(empechee, touche + ' : laissée au navigateur').toBe(false);
            expect((await lirePages(page)).etat.page, touche).toBe(1);
        }
        // Sans modificateur, la même touche envoyée de la même façon fait bien reculer : l'envoi atteint la bulle.
        const reculee = await page.evaluate(() => {
            const ev = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
            (document.activeElement || document.body).dispatchEvent(ev);
            return ev.defaultPrevented;
        });
        expect(reculee, '← sans modificateur : prise par la bulle').toBe(true);
        expect((await lirePages(page)).etat.page).toBe(0);
        await page.keyboard.press('ArrowRight');
        expect((await lirePages(page)).etat.page).toBe(1);
        // Le focus sur « → » quand il devient inactif (dernière page) passe à « ← ».
        await page.keyboard.press('ArrowLeft');
        await suivante(page).focus();
        await page.keyboard.press('Enter');
        expect((await lirePages(page)).etat.page).toBe(1);
        await expect(suivante(page)).toBeDisabled();
        await expect(precedente(page)).toBeFocused();

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
    // Repliée, les flèches du clavier ne changent pas la page (rien ne se verrait changer).
    await bulle(page).locator('.parcours-bulle-bascule').focus();
    await page.keyboard.press('ArrowRight');
    expect(await page.evaluate(() => ParcoursMoteur.pageCourante().page)).toBe(0);
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

test('1180 px : la page reste au passage du seuil du téléphone, aller et retour', async ({ page }) => {
    await ouvrirEspaceVide(page, 1180, 900);
    await lancerLeBanc(page);
    await bulle(page).getByRole('button', { name: 'Continuer' }).click();
    await expect(indice(page)).toHaveText('1/2');
    await suivante(page).click();
    await expect(indice(page)).toHaveText('2/2');
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(bulle(page)).toHaveClass(/est-repliee/);
    await page.setViewportSize({ width: 1180, height: 900 });
    await expect(bulle(page)).not.toHaveClass(/est-repliee/);
    await expect(indice(page)).toHaveText('2/2');
    expect((await lirePages(page)).visibles).toEqual([false, true]);
});

test('1180 px : une largeur posée par la sonde d’étape (`atteint`) refait la découpe dans le même passage, sans image périmée', async ({ page }) => {
    await ouvrirEspaceVide(page, 1180, 900);
    await page.evaluate(({ LONG, GESTE }) => {
        window.__large = false;
        ParcoursMoteur.lancer({
            id: 'banc-largeur',
            lienSortie: 'Plus tard',
            etapes: [{ titre: 'Large', texte: LONG, geste: GESTE, contour: () => document.getElementById('btn-codex'),
                // Comme le neuvième parcours (formeDeBulle dans atteint) : la forme posée par la sonde d'étape.
                atteint: () => { document.getElementById('parcours-bulle').style.width = window.__large ? '640px' : ''; return false; } }]
        }, {});
    }, { LONG, GESTE });
    await expect(indice(page)).toHaveText('1/2');
    // Chaque image : la découpe en place a-t-elle été faite à la largeur affichée ?
    await page.evaluate(() => {
        window.__perimees = 0;
        window.__images = 0;
        const p = document.querySelector('#parcours-bulle .parcours-bulle-texte');
        const voir = () => { const e = ParcoursMoteur.pageCourante(); if (!e) return; window.__images++; if (p.offsetWidth && e.largeur !== p.offsetWidth) window.__perimees++; requestAnimationFrame(voir); };
        requestAnimationFrame(voir);
        window.__large = true;
    });
    await expect(indice(page)).toBeHidden();
    // Une trentaine d'images regardées après le changement (plusieurs passages de la sonde, toutes les 120 ms).
    const depuis = await page.evaluate(() => window.__images);
    await expect.poll(() => page.evaluate(() => window.__images)).toBeGreaterThan(depuis + 30);
    expect(await page.evaluate(() => window.__perimees), 'aucune image avec une découpe faite à une autre largeur').toBe(0);
    expect((await lirePages(page)).etat.pages).toBe(1);
    await page.evaluate(() => { window.__large = false; });
    await expect(indice(page)).toHaveText('1/2');
    expect(await page.evaluate(() => window.__perimees)).toBe(0);
});

test('1180 px : une découpe qui laisse une page presque aussi longue que le tout n’est pas faite', async ({ page }) => {
    await ouvrirEspaceVide(page, 1180, 900);
    // Une seule fin de phrase, tout près de la fin : deux pages auraient l'une de quinze lignes, l'autre d'un mot.
    const UNE_FIN = 'Cette phrase de banc ne finit pas avant longtemps, ' + 'elle continue, '.repeat(36) + 'puis elle s’arrête enfin. Fin.';
    await page.evaluate(({ UNE_FIN, GESTE }) => {
        ParcoursMoteur.lancer({ id: 'banc-une-fin', lienSortie: 'Plus tard',
            etapes: [{ titre: 'Une fin', texte: UNE_FIN, geste: GESTE, contour: () => document.getElementById('btn-codex'), atteint: () => false }] }, {});
    }, { UNE_FIN, GESTE });
    await expect(rang(page)).toHaveText('1 sur 1');
    const l = await lirePages(page);
    expect(l.lignes[0], 'le texte dépasse bien dix lignes').toBeGreaterThan(10);
    expect(l.etat.pages).toBe(1);
    await expect(indice(page)).toBeHidden();
    await expect(bulle(page).locator('.parcours-bulle-nav')).toBeHidden();
    await gesteEtSortieVisibles(page);
});
