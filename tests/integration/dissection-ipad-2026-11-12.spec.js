// =======================================================================
// LA DISSECTION SUR L'IPAD (12 nov. 2026) — dans un vrai WebKit, à 1180 × 820 et à 820 × 1180
// =======================================================================
// Relais de la conversation du Projet, 12 nov., 6 h 35 (vécu par Grégoire sur l'iPad le 11 nov., « Évaluer une première
// production », étape « Ta grille ») :
//   P1 · la liste des étiquettes montre qu'elle défile (« ▲ N étiquettes plus haut », « ▼ N étiquettes plus bas ») et
//        s'ouvre en montrant le haut ;
//   P2 · au doigt (contexte tactile), un défilement ne pose aucune étiquette ; un toucher en pose une ; le doigt maintenu
//        puis glissé surligne plusieurs morceaux ; `touch-action` n'est jamais `none` ;
//   P4 · l'aide pas à pas suit les manques dans l'ordre de « Avant de créer, il reste », sur trois grilles (un tableau,
//        un texte brut, un cas mêlé grille et code), une flèche visible à chaque manque, le halo sur le premier geste ;
//   P5 · l'exemple s'ouvre étiqueté, se vide sur « Faire l'exercice soi-même », et n'écrit rien dans les données ;
//   P6 · « Composer ma grille » est visible dans l'étiquetage, mène à Grilles, le brouillon survit, et une grille composée
//        là fait passer le parcours à « Ta production » ;
//   P7 · une grille déjà là fait aussi passer l'étape 1 (« Prendre une grille déjà créée », puis « Prendre cette grille »).
// Break-tests : voir le rapport du lot (`plans de travail/RAPPORT-2026-11-12-dissection-ipad.md`).
// Grilles FICTIVES ; noms d'étudiant·es fictifs (classe-de-banc.js).
import { test, expect } from '@playwright/test';
import { ouvrirEspaceVide, mettreLaClasseEnPlace, attendreEtape, contourSur, bulle, bulleNeCouvrePas, capture } from './harness/classe-de-banc.js';
import { flecheVers, flecheVersMorceau } from './harness/fleches-de-banc.js';
import { collerLExemple } from './harness/exemple-colle.js';

const DOSSIER = process.env.CAPTURES_PARCOURS || '';
const TAILLES = [[1180, 820], [820, 1180]];
const etape = (page, n, titre, opts) => attendreEtape(page, n, 9, titre, opts);
const norm = (t) => String(t).replace(/[  ]/g, ' ');
const geste = (page) => page.locator('#parcours-bulle .parcours-bulle-geste');
const etiquette = (type) => `#dissection-palette .dissection-etiquette[data-type="${type}"]`;

async function gesteEst(page, texte) {
    await expect.poll(async () => norm(await geste(page).textContent()), { message: 'la ligne du geste', timeout: 5000 }).toBe(texte);
}

/** Le sélecteur du premier morceau qui porte ce texte. */
async function morceau(page, texte) {
    const id = await page.evaluate((t) => {
        const b = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].find((x) => x.textContent === t);
        return b ? b.getAttribute('data-id') : null;
    }, texte);
    expect(id, 'morceau « ' + texte + ' »').toBeTruthy();
    return `#dissection-contenu .dissection-morceau[data-id="${id}"]`;
}

/** Un toucher de souris sur un morceau (appuyer, relâcher), comme un clic. */
async function toucher(page, texte) {
    const sel = await morceau(page, texte);
    await page.evaluate((s) => {
        const b = document.querySelector(s);
        b.scrollIntoView({ block: 'center', inline: 'center' });
        const r = b.getBoundingClientRect();
        const o = { bubbles: true, cancelable: true, pointerId: 3, pointerType: 'mouse', isPrimary: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
        b.dispatchEvent(new PointerEvent('pointerdown', o));
        b.dispatchEvent(new PointerEvent('pointerup', o));
    }, sel);
}

/** Une étiquette en main (si elle ne l'est pas), puis un toucher sur chaque morceau nommé. */
async function poser(page, type, textes) {
    if ((await page.locator(etiquette(type)).getAttribute('aria-pressed')) !== 'true') await page.click(etiquette(type));
    for (const t of textes) await toucher(page, t);
}

async function coller(page, html) {
    await page.evaluate((h) => {
        const zone = document.getElementById('materiel-zone-collage');
        const ev = new Event('paste', { bubbles: true, cancelable: true });
        Object.defineProperty(ev, 'clipboardData', { value: { getData: (k) => (k === 'text/html' ? h : '') } });
        zone.dispatchEvent(ev);
    }, html);
    await expect(page.locator('#materiel-dissection')).toBeVisible();
}

/** « Coller une autre grille », confirmé s'il le faut : retour à l'accueil. */
async function collerUneAutre(page) {
    const b = page.locator('#materiel-dissection [data-action="materielDissection.collerAutre"]');
    await b.click();
    if (await page.locator('#materiel-dissection').isVisible()) await b.click();
    await expect(page.locator('#materiel-accueil')).toBeVisible();
}

// La grille de la capture du 11 nov., refaite FICTIVE (et le dernier « / 5 » devenu « / 10 », pour qu'il soit unique).
const CAPTURE = '<table><tr><td colspan="3">Grille fictive d’analyse</td></tr>'
    + '<tr><td>Introduction</td><td>Sujet amené, posé, divisé</td><td>/ 5</td></tr>'
    + '<tr><td>Développement</td><td>Arguments et exemples</td><td>/ 30</td></tr>'
    + '<tr><td>Conclusion</td><td>Synthèse et ouverture</td><td>/ 10</td></tr></table>';

/** Le parcours lancé, à l'étape 1 (l'exemple offert). */
async function lancerEvaluer(page) {
    await page.evaluate(() => Assistance.parcours().find((p) => p.id === 'evaluer').lancer(0));
    await etape(page, 1, 'Ta grille', { focus: false });
}

const lireDonnees = (page) => page.evaluate(() => ({
    brouillon: db.getSync(cle('brouillonDissection'), null),
    grilles: (db.getSync(cle('grillesTemplates'), []) || []).map((g) => g.id)
}));

// ---------------------------------------------------------------------------------------------------------------
// P1 — la liste montre qu'elle défile, et s'ouvre en haut
// ---------------------------------------------------------------------------------------------------------------
for (const [L, H] of TAILLES) {
    test(`P1 · ${L} × ${H} : la liste des étiquettes dit ce qu'elle cache, et s'ouvre en haut`, async ({ page }) => {
        await ouvrirEspaceVide(page, L, { hauteur: H });
        await page.evaluate(() => naviguerVers('conception', 'materiel'));
        await collerLExemple(page);
        await expect(page.locator('#materiel-dissection')).toBeVisible();
        const pal = page.locator('#dissection-palette');
        const etat = () => pal.evaluate((p) => ({
            defile: p.scrollHeight > p.clientHeight + 1, haut: p.scrollTop,
            h: document.getElementById('dissection-palette-haut').classList.contains('est-visible'),
            b: document.getElementById('dissection-palette-bas').classList.contains('est-visible'),
            texteB: document.getElementById('dissection-palette-bas').textContent
        }));
        let e = await etat();
        expect(e.haut, 'la liste s’ouvre en haut').toBe(0);
        if (L === 1180) expect(e.defile, 'à 1180 × 820, la liste dépasse son cadre').toBe(true);
        if (!e.defile) { expect([e.h, e.b]).toEqual([false, false]); return; }
        expect([e.h, e.b], 'en haut : seul « plus bas »').toEqual([false, true]);
        expect(e.texteB).toMatch(/^▼ \d+ étiquettes? plus bas$/);
        await capture(page, DOSSIER, `p1-palette-haut-${L}x${H}`);
        await pal.evaluate((p) => { p.scrollTop = p.scrollHeight; });
        await expect.poll(async () => { const x = await etat(); return [x.h, x.b]; }).toEqual([true, false]);
        await capture(page, DOSSIER, `p1-palette-bas-${L}x${H}`);
        // « ▲ … plus haut », touché, fait remonter la liste.
        const avant = (await etat()).haut;
        await page.click('#dissection-palette-haut');
        await expect.poll(async () => (await etat()).haut).toBeLessThan(avant);
        // Rouverte (une autre grille), elle montre de nouveau le haut.
        await pal.evaluate((p) => { p.scrollTop = p.scrollHeight; });
        await collerUneAutre(page);
        await collerLExemple(page);
        expect((await etat()).haut).toBe(0);
    });
}

// ---------------------------------------------------------------------------------------------------------------
// P2 — au doigt, défiler ne pose rien
// ---------------------------------------------------------------------------------------------------------------
test.describe('P2 · au doigt (contexte tactile, 1180 × 820)', () => {
    test.use({ hasTouch: true });
    test('un défilement ne pose aucune étiquette ; un toucher en pose une ; maintenu puis glissé, plusieurs', async ({ page }) => {
        await ouvrirEspaceVide(page, 1180, { hauteur: 820 });
        await page.evaluate(() => naviguerVers('conception', 'materiel'));
        await collerLExemple(page);
        await page.tap(etiquette('critere'));
        await expect(page.locator(etiquette('critere'))).toHaveAttribute('aria-pressed', 'true');
        const premier = await morceau(page, 'L’étudiant·e résume l’œuvre avec justesse');
        const second = await morceau(page, 'L’étudiant·e relève des procédés d’écriture');
        expect(await page.locator(premier).evaluate((b) => getComputedStyle(b).touchAction)).not.toBe('none');
        const liens = () => page.evaluate(() => Object.keys(window.materielDissection.etatCourant().liens).length);

        // Un doigt qui glisse aussitôt (le navigateur reprend le geste : `pointercancel`), puis un qui glisse et se lève.
        const glisser = (sel, fin) => page.evaluate(([s, f]) => {
            const b = document.querySelector(s);
            b.scrollIntoView({ block: 'center' });
            const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
            const ev = (t, dy) => b.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, pointerId: 21, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y + dy }));
            ev('pointerdown', 0); ev('pointermove', 15); ev('pointermove', 60); ev(f, 60);
        }, [sel, fin]);
        await glisser(premier, 'pointercancel');
        await glisser(premier, 'pointerup');
        await glisser(second, 'pointerup');
        expect(await liens(), 'un défilement au doigt ne pose rien').toBe(0);

        // Un toucher (WebKit, contexte tactile) : l'étiquette se pose.
        await page.locator(premier).scrollIntoViewIfNeeded();
        await page.tap(premier);
        await expect.poll(liens).toBe(1);
        expect(await page.locator(premier).getAttribute('data-type')).toBe('critere');

        // Le doigt maintenu, puis glissé sur un second morceau : les deux surlignés (le second et un troisième ici).
        const troisieme = await morceau(page, 'L’étudiant·e relie l’œuvre aux notions du cours');
        await page.evaluate(async ([a, b]) => {
            const A = document.querySelector(a), B = document.querySelector(b);
            const c = (e) => { const r = e.getBoundingClientRect(); return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }; };
            const ev = (el, t, p) => el.dispatchEvent(new PointerEvent(t, Object.assign({ bubbles: true, cancelable: true, pointerId: 22, pointerType: 'touch', isPrimary: true }, p)));
            A.scrollIntoView({ block: 'center' });
            ev(A, 'pointerdown', c(A));
            await new Promise((ok) => setTimeout(ok, 500));
            ev(A, 'pointermove', c(B));
            ev(A, 'pointerup', c(B));
        }, [second, troisieme]);
        await expect.poll(liens).toBe(3);
    });
});

// ---------------------------------------------------------------------------------------------------------------
// P4, P5, P6 — le parcours : l'exemple, l'aide pas à pas sur trois grilles, « Composer ma grille »
// ---------------------------------------------------------------------------------------------------------------
for (const [L, H] of TAILLES) {
    test(`P4 · P5 · P6 · ${L} × ${H} : l'exemple, l'aide qui suit les manques, « Composer ma grille »`, async ({ page }) => {
        test.setTimeout(300000);
        const cap = `${L}x${H}`;
        await ouvrirEspaceVide(page, L, { hauteur: H });
        await mettreLaClasseEnPlace(page);
        const avant = await lireDonnees(page);
        await lancerEvaluer(page);

        // P5 · l'exemple offert, trois choix dans la bulle.
        for (const nom of ['Voir le travail complet', "Faire l'exercice soi-même", 'Passer à ma grille']) {
            await expect(bulle(page).getByRole('button', { name: nom })).toBeVisible();
        }
        await gesteEst(page, "Touche « Voir le travail complet » ou « Faire l'exercice soi-même » ; ou « Passer à ma grille ».");
        await capture(page, DOSSIER, `p5-exemple-offert-${cap}`);

        // « Voir le travail complet » : chaque morceau étiqueté, aucun « Créer ma grille », la note de l'exemple.
        await bulle(page).getByRole('button', { name: 'Voir le travail complet' }).click();
        await expect.poll(() => page.evaluate(() => {
            const e = window.materielDissection.etatCourant();
            return e.exemple === 'complet' && Object.keys(e.liens).length === e.morceaux.ordre.length;
        })).toBe(true);
        await expect(page.locator('#dissection-exemple-note')).toBeVisible();
        await expect(page.locator('[data-action="materielDissection.creer"]')).toHaveCount(0);
        await gesteEst(page, "Regarde chaque étiquette, puis la grille lue en dessous ; touche ensuite « Faire l'exercice soi-même » ou « Passer à ma grille ».");
        await capture(page, DOSSIER, `p5-exemple-complet-${cap}`);

        // « Faire l'exercice soi-même » : l'exemple se vide ; l'aide commence (le nom : prends « Titre »).
        await bulle(page).getByRole('button', { name: "Faire l'exercice soi-même" }).click();
        await expect.poll(() => page.evaluate(() => Object.keys(window.materielDissection.etatCourant().liens).length)).toBe(0);
        await gesteEst(page, 'Ta grille n’a pas encore de nom : prends « Titre », puis touche son nom dans ta grille.');
        await contourSur(page, etiquette('titre'));
        await flecheVers(page, etiquette('titre'), 'exercice, le nom');
        await bulleNeCouvrePas(page, etiquette('titre'), 'exercice, le nom');
        await capture(page, DOSSIER, `p4-exercice-nom-${cap}`);
        await poser(page, 'titre', ['Journal de lecture']);
        await gesteEst(page, 'Il manque ce que vaut chaque réponse : prends « Points », puis touche les points d’une réponse (ou « Niveau », pour le nom d’un niveau).');
        await flecheVers(page, etiquette('points'), 'exercice, les points');
        await contourSur(page, etiquette('points'));

        // L'exemple n'a rien écrit : ni brouillon, ni grille.
        expect(await lireDonnees(page)).toEqual(avant);

        // « Passer à ma grille » : l'accueil ; la bulle nomme les boutons tels qu'ils sont écrits.
        await bulle(page).getByRole('button', { name: 'Passer à ma grille' }).click();
        await expect(page.locator('#materiel-accueil')).toBeVisible();
        await gesteEst(page, "Colle ta grille, montre ce qu'est chaque morceau, puis touche « Créer ma grille » ; ou touche « Composer ma grille ».");
        await contourSur(page, '#materiel-zone-collage');
        expect(await lireDonnees(page)).toEqual(avant);

        // P4 · grille 1, un tableau : la capture de Grégoire (des « / N » en « Pondération », aucun critère).
        await coller(page, CAPTURE);
        await poser(page, 'titre', ['Grille fictive d’analyse']);
        await poser(page, 'ponderation', ['/ 5', '/ 30', '/ 10']);
        await gesteEst(page, '« / 5 » n’a aucun critère dans sa rangée : prends « Critère », puis touche « Introduction ».');
        await contourSur(page, etiquette('critere'));
        await flecheVers(page, etiquette('critere'), 'tableau, l’étiquette');
        // 13 nov. 2026 : après un étiquetage dans la colonne de droite, « Introduction » n'est plus ramené dans le canevas.
        await flecheVersMorceau(page, await morceau(page, 'Introduction'), 'tableau, le morceau');
        await capture(page, DOSSIER, `p4-tableau-critere-${cap}`);
        await page.click(etiquette('critere'));
        await contourSur(page, await morceau(page, 'Introduction'));   // le premier geste fait : le halo passe au morceau
        await toucher(page, 'Introduction');
        await gesteEst(page, '« / 30 » n’a aucun critère dans sa rangée : prends « Critère », puis touche « Développement ».');
        await flecheVers(page, await morceau(page, 'Développement'), 'tableau, le manque suivant');
        await toucher(page, 'Développement');
        await toucher(page, 'Conclusion');
        await gesteEst(page, 'Ta grille est prête : touche « Créer ma grille ».');
        await contourSur(page, '[data-action="materielDissection.creer"]');
        await flecheVers(page, '[data-action="materielDissection.creer"]', 'tableau, prête');
        await capture(page, DOSSIER, `p4-tableau-prete-${cap}`);

        // P4 · grille 3, mêlée : « Poids » sur « / 5 ».
        await collerUneAutre(page);
        await coller(page, CAPTURE);
        await poser(page, 'titre', ['Grille fictive d’analyse']);
        await poser(page, 'critere', ['Introduction', 'Développement', 'Conclusion']);
        await poser(page, 'ponderation', ['/ 30', '/ 10']);
        await poser(page, 'poids', ['/ 5']);
        await gesteEst(page, '« Poids » sert aux listes de codes (ce que pèse un code posé) : pour le poids d’un critère, prends « Pondération », puis touche « / 5 ».');
        await flecheVers(page, etiquette('ponderation'), 'mêlée, l’étiquette');
        await flecheVers(page, await morceau(page, '/ 5'), 'mêlée, le morceau');
        await contourSur(page, etiquette('ponderation'));
        await capture(page, DOSSIER, `p4-melee-poids-${cap}`);
        await poser(page, 'ponderation', ['/ 5']);
        await gesteEst(page, 'Ta grille est prête : touche « Créer ma grille ».');

        // P4 · grille 2, un texte brut.
        await collerUneAutre(page);
        await page.fill('#materiel-zone-collage', 'Grille fictive de lecture\nRésumé fidèle\nRepérage des événements\n3 points');
        await page.click('#materiel-accueil [data-action="materiel.reconnaitreTexte"]');
        await expect(page.locator('#materiel-dissection')).toBeVisible();
        await gesteEst(page, 'Ta grille n’a pas encore de nom : prends « Titre », puis touche son nom dans ta grille.');
        await flecheVers(page, etiquette('titre'), 'texte, le nom');
        await poser(page, 'titre', ['Grille fictive de lecture']);
        await gesteEst(page, 'Il manque ce que vaut chaque réponse : prends « Points », puis touche les points d’une réponse (ou « Niveau », pour le nom d’un niveau).');
        await poser(page, 'points', ['3 points']);
        await gesteEst(page, '« 3 points » n’a aucun critère avant lui : prends « Critère », puis touche le critère qu’il complète.');
        await flecheVers(page, etiquette('critere'), 'texte, le critère');
        await capture(page, DOSSIER, `p4-texte-critere-${cap}`);
        await poser(page, 'critere', ['Résumé fidèle']);
        await gesteEst(page, '« 3 points » n’a aucune réponse à qui donner ces points : prends « Descripteur », puis touche la réponse qu’ils valent.');
        await poser(page, 'descripteur', ['Repérage des événements']);
        await gesteEst(page, 'Ta grille est prête : touche « Créer ma grille ».');

        // P6 · « Composer ma grille », dans l'étiquetage : Grilles, le brouillon survit ; une grille composée → « Ta production ».
        const brouillon = (await lireDonnees(page)).brouillon;
        expect(brouillon).toBeTruthy();
        const composer = page.locator('#materiel-dissection .dissection-actions [data-action="materiel.taperMain"]');
        await expect(composer).toBeVisible();
        await expect(composer).toHaveText('Composer ma grille');
        await capture(page, DOSSIER, `p6-composer-${cap}`);
        await composer.click();
        await expect(page.locator('#conception-grille-criteres')).toBeVisible();
        expect((await lireDonnees(page)).brouillon).toEqual(brouillon);
        await gesteEst(page, 'Touche « + Nouvelle grille », compose-la, puis touche « Créer la grille » ; ou ouvre une de tes grilles.');
        await page.locator('[data-action="creerNouvelleGrille"]').click();
        await page.fill('#nomGrilleTemplate', 'Grille fictive composée');
        const nom = page.locator('#listeCriteres .item-liste').first().locator('input[data-on-change="modifierCritereTempHandler"][data-champ="nom"]');
        await nom.fill('Structure');
        await nom.press('Tab');
        await page.click('#btnCreerGrille');
        await etape(page, 2, 'Ta production', { focus: false });
        expect((await lireDonnees(page)).brouillon).toEqual(brouillon);
    });
}

// ---------------------------------------------------------------------------------------------------------------
// P7 — une grille déjà là fait passer l'étape 1
// ---------------------------------------------------------------------------------------------------------------
test('P7 · 1180 × 820 : une grille déjà dans l’application, prise à l’étape 1, fait passer à « Ta production » avec elle', async ({ page }) => {
    test.setTimeout(240000);
    await ouvrirEspaceVide(page, 1180, { hauteur: 820 });
    await mettreLaClasseEnPlace(page);
    // « Test fictif », composée AVANT « Commencer » (la capture 35 : elle ne faisait pas avancer l'étape).
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await page.locator('[data-action="creerNouvelleGrille"]').click();
    await page.fill('#nomGrilleTemplate', 'Test fictif');
    const nom = page.locator('#listeCriteres .item-liste').first().locator('input[data-on-change="modifierCritereTempHandler"][data-champ="nom"]');
    await nom.fill('Structure');
    await nom.press('Tab');
    await page.click('#btnCreerGrille');
    await expect.poll(() => page.evaluate(() => (db.getSync(cle('grillesTemplates'), []) || []).some((g) => g.nom === 'Test fictif'))).toBe(true);
    const id = await page.evaluate(() => (db.getSync(cle('grillesTemplates'), []) || []).find((g) => g.nom === 'Test fictif').id);
    await page.evaluate(() => naviguerVers('conception', 'materiel'));

    await lancerEvaluer(page);
    await bulle(page).getByRole('button', { name: 'Passer à ma grille' }).click();
    await bulle(page).getByRole('button', { name: 'Prendre une grille déjà créée' }).click();
    await expect(page.locator('#conception-grille-criteres')).toBeVisible();
    await page.evaluate((g) => window.ouvrirGrilleDepuisListe(g), id);
    await expect(bulle(page).getByRole('button', { name: 'Prendre cette grille' })).toBeVisible();
    await gesteEst(page, 'Touche « Prendre cette grille » pour évaluer avec la grille ouverte ; ou ouvre-en une autre.');
    await capture(page, DOSSIER, 'p7-grille-deja-la-1180x820');
    await bulle(page).getByRole('button', { name: 'Prendre cette grille' }).click();
    await etape(page, 2, 'Ta production', { focus: false });
    expect(await page.evaluate(() => ParcoursEvaluer.contexte().grilleId)).toBe(id);
});
