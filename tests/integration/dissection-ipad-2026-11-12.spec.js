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
//   P5 · l'exemple s'ouvre étiqueté, se vide sur « Étiqueter l'exemple moi-même », et n'écrit rien dans les données ;
//   P6 · « Composer ma grille » est visible dans l'étiquetage, mène à Grilles, le brouillon survit ; dans le parcours
//        (bulle 5, « Ta grille »), une grille composée là fait passer à la bulle 6, « Ta cartouche ».
// Break-tests : voir le rapport du lot (`plans de travail/RAPPORT-2026-11-12-dissection-ipad.md`).
// Grilles FICTIVES ; noms d'étudiant·es fictifs (classe-de-banc.js).
//
// 20 nov. 2026 (plans de travail/CONSIGNE-2026-11-20-essai-parcours.md, section D) : le « Nous faisons » d'« Évaluer une
// première production » est réécrit ; son ancienne étape 1 (deux bulles d'ouverture, « Ta grille », les bulles devant
// l'exemple, « Prendre cette grille », le complément en pages) est retirée. Ce banc fait suivre :
//   · P4 et P5 jugent la page (l'aide qui suit les manques, l'exemple, ce qu'il n'écrit pas) : ils entrent par la carte
//     de la page, « Ta grille, pas à pas » (`js/materiel-aide.js`), qui porte la même ligne du geste, les mêmes flèches
//     et le même halo, sans parcours ;
//   · P6 se lit en deux essais : sur la page (le bouton, Grilles, le brouillon), puis dans le parcours neuf, à la
//     bulle 5 (la grille composée fait passer à « Ta cartouche » ; avant : à « Ta production ») ;
//   · P7 (« Prendre cette grille ») est RETIRÉ avec le bouton : une grille déjà là ne fait plus avancer la bulle 5, qui
//     attend une grille née pendant le parcours (`grilleCreee`, js/parcours-evaluer.js).
import { test, expect } from '@playwright/test';
import { ouvrirEspaceVide, ouvrirPanneau, mettreLaClasseEnPlace, attendreEtape, contourSur, bulle, bulleNeCouvrePas, capture } from './harness/classe-de-banc.js';
import { flecheVers, flecheVersMorceau } from './harness/fleches-de-banc.js';
import { collerLExemple } from './harness/exemple-colle.js';
import { boutonExemple, ouvrirLaCarteDeLaPage, TITRE_DE_LA_CARTE } from './harness/ouverture-evaluer.js';
import { bulle1, bulle2Modele, bulle3, bulle4, bulleDit, item, ctx, MOTS } from './harness/nous-faisons-evaluer-de-banc.js';

const DOSSIER = process.env.CAPTURES_PARCOURS || '';
const TAILLES = [[1180, 820], [820, 1180]];
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

const GESTE_ACCUEIL = "Colle ta grille, montre ce qu'est chaque partie, puis touche « Créer ma grille » ; ou touche « Composer ma grille ».";

/** Une grille composée dans Conception › Grilles : « + Nouvelle grille », un nom, un critère, « Créer la grille ». */
async function composerUneGrille(page, nomDeLaGrille) {
    await page.locator('[data-action="creerNouvelleGrille"]').click();
    await page.fill('#nomGrilleTemplate', nomDeLaGrille);
    const nom = page.locator('#listeCriteres .item-liste').first().locator('input[data-on-change="modifierCritereTempHandler"][data-champ="nom"]');
    await nom.fill('Structure');
    await nom.press('Tab');
    await page.click('#btnCreerGrille');
    await expect.poll(() => page.evaluate((n) => (db.getSync(cle('grillesTemplates'), []) || []).some((g) => g.nom === n), nomDeLaGrille)).toBe(true);
    return page.evaluate((n) => (db.getSync(cle('grillesTemplates'), []) || []).find((g) => g.nom === n).id, nomDeLaGrille);
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
// P4, P5, P6 — la carte de la page : l'exemple, l'aide pas à pas sur trois grilles, « Composer ma grille »
// ---------------------------------------------------------------------------------------------------------------
for (const [L, H] of TAILLES) {
    test(`P4 · P5 · P6 · ${L} × ${H} : l'exemple, l'aide qui suit les manques, « Composer ma grille »`, async ({ page }) => {
        test.setTimeout(300000);
        const cap = `${L}x${H}`;
        await ouvrirLaCarteDeLaPage(page, L, H);   // 20 nov. 2026 : par la page, plus par l'ancienne étape 1 du parcours
        const avant = await lireDonnees(page);

        // P5 · la carte de la page ne porte aucun bouton ; les deux boutons de l'exemple sont sur la page (renommés le
        // 14 nov. 2026) ; sa ligne du geste est celle de l'accueil, et elle montre la zone où coller.
        await expect(bulle(page).locator('.parcours-bulle-boutons')).toHaveCount(0);
        await expect(boutonExemple(page, 'complet')).toHaveText('Voir un exemple de grille étiquetée');
        await expect(boutonExemple(page, 'exercice')).toHaveText('Étiqueter l’exemple moi-même');
        await gesteEst(page, GESTE_ACCUEIL);
        await contourSur(page, '#materiel-zone-collage');
        // Debout, la carte a la place de ne pas couvrir la zone de collage : sa flèche la vise (couchée, elle en couvre
        // un bord et le moteur ne trace pas de flèche vers ce qu'elle touche ; banc de la carte d'aide, I1).
        if (H > L) await flecheVers(page, '#materiel-zone-collage', 'accueil, la zone de collage');
        await capture(page, DOSSIER, `p5-accueil-${cap}`);

        // « Voir un exemple de grille étiquetée » : chaque partie étiquetée, aucun « Créer ma grille », la note de l'exemple ;
        // la carte dit quoi regarder (20 nov. 2026 : les bulles du parcours devant l'exemple, « L'exemple étiqueté » et
        // « La grille, comprise par l'application », sont retirées ; la ligne de la carte de la page les remplace).
        await boutonExemple(page, 'complet').click();
        await expect.poll(() => page.evaluate(() => {
            const e = window.materielDissection.etatCourant();
            return e.exemple === 'complet' && Object.keys(e.liens).length === e.morceaux.ordre.length;
        })).toBe(true);
        await expect(page.locator('#dissection-exemple-note')).toBeVisible();
        await expect(page.locator('[data-action="materielDissection.creer"]')).toHaveCount(0);
        await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(TITRE_DE_LA_CARTE);
        await gesteEst(page, "Regarde chaque étiquette, puis la grille lue en dessous ; touche ensuite « Quitter l'exemple ».");
        await expect(bulle(page).locator('.parcours-bulle-ligne')).toHaveCount(0);
        await capture(page, DOSSIER, `p5-exemple-complet-${cap}`);

        // « Quitter l'exemple », puis « Étiqueter l'exemple moi-même » : l'exemple se vide ; l'aide commence (le nom : prends « Titre »).
        await page.locator('#materiel-dissection [data-action="materielDissection.collerAutre"]').click();
        await expect(page.locator('#materiel-accueil')).toBeVisible();
        await boutonExemple(page, 'exercice').click();
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

        // « Quitter l'exemple » (sur la page) : l'accueil ; la carte montre de nouveau la zone où coller.
        await page.locator('#materiel-dissection [data-action="materielDissection.collerAutre"]').click();
        await expect(page.locator('#materiel-accueil')).toBeVisible();
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

        // P6 · « Composer ma grille », dans l'étiquetage : Grilles, le brouillon survit ; la carte de la page se ferme
        // hors de « Mon matériel », une grille composée là laisse le brouillon, et la carte revient au retour.
        const brouillon = (await lireDonnees(page)).brouillon;
        expect(brouillon).toBeTruthy();
        const composer = page.locator('#materiel-dissection .dissection-actions [data-action="materiel.taperMain"]');
        await expect(composer).toBeVisible();
        await expect(composer).toHaveText('Composer ma grille');
        await capture(page, DOSSIER, `p6-composer-${cap}`);
        await composer.click();
        await expect(page.locator('#conception-grille-criteres')).toBeVisible();
        expect((await lireDonnees(page)).brouillon).toEqual(brouillon);
        await expect(bulle(page)).toHaveCount(0);
        const id = await composerUneGrille(page, 'Grille fictive composée');
        const apres = await lireDonnees(page);
        expect(apres.brouillon).toEqual(brouillon);
        expect(apres.grilles).toContain(id);
        await page.evaluate(() => naviguerVers('conception', 'materiel'));
        await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(TITRE_DE_LA_CARTE);
        await expect(page.locator('#materiel-dissection')).toBeVisible();
        await gesteEst(page, 'Ta grille est prête : touche « Créer ma grille ».');
    });
}

// ---------------------------------------------------------------------------------------------------------------
// P6, dans le parcours — bulle 5, « Ta grille » : « Composer ma grille » dans l'étiquetage, puis « Ta cartouche »
// ---------------------------------------------------------------------------------------------------------------
// 20 nov. 2026 (consigne, section D) : l'étiquetage est la bulle 5 du « Nous faisons » neuf. Avant : l'étape 1, et une
// grille composée faisait passer à « Ta production » (étape 2 sur 9). Maintenant : à « Ta cartouche » (6 sur 10).
for (const [L, H] of TAILLES) {
    test(`P6 · ${L} × ${H} · dans le parcours : « Composer ma grille » depuis l'étiquetage de la bulle 5, le brouillon survit, la grille composée fait passer à « Ta cartouche »`, async ({ page }) => {
        test.setTimeout(300000);
        const cap = `p6-${L}x${H}`;
        await ouvrirEspaceVide(page, L, { hauteur: H });
        await mettreLaClasseEnPlace(page);
        await ouvrirPanneau(page);
        await item(page).locator('.assistance-parcours-bouton').click();
        await expect(page.locator('#panneau-assistance')).toHaveCount(0);
        await bulle1(page, { voie: 'modele', cap });
        await bulle2Modele(page, { cap });
        await bulle3(page, { cap });
        await bulle4(page, { cap });
        await attendreEtape(page, 5, 10, 'Ta grille', { focus: false });
        await expect(page.locator('#materiel-accueil')).toBeVisible();
        await contourSur(page, '#materiel-zone-collage');

        // La grille collée, son nom étiqueté : un brouillon. La bulle 5 désigne ce que désigne la carte de la page
        // (`MaterielAide.contour()` : le premier manque), sans ligne du geste ni complément.
        await coller(page, CAPTURE);
        await bulleDit(page, {
            confirme: '', lieu: '', boutons: [], faites: [],
            gestes: ['Prends « Titre », puis touche le nom de ta grille',
                'Pour chaque critère, prends « Critère » et touche son nom, « Description » et touche sa définition, « Pondération » et touche ce qu\'il pèse'],
            consignes: ['Quand tout est étiqueté, touche « Créer ma grille »']
        }, 'bulle 5, la grille collée');
        await expect(geste(page)).toHaveCount(0);
        await contourSur(page, etiquette('titre'));
        await flecheVers(page, etiquette('titre'), 'bulle 5, le nom');
        await poser(page, 'titre', ['Grille fictive d’analyse']);
        await bulleDit(page, { faites: ['Prends « Titre », puis touche le nom de ta grille'] }, 'bulle 5, le titre étiqueté');
        const brouillon = (await lireDonnees(page)).brouillon;
        expect(brouillon).toBeTruthy();

        // « Composer ma grille », dans l'étiquetage : Grilles ; le brouillon survit ; la bulle 5 prend sa forme de l'onglet.
        const composer = page.locator('#materiel-dissection .dissection-actions [data-action="materiel.taperMain"]');
        await expect(composer).toHaveText('Composer ma grille');
        await composer.click();
        await expect(page.locator('#conception-grille-criteres')).toBeVisible();
        expect((await lireDonnees(page)).brouillon).toEqual(brouillon);
        await bulleDit(page, {
            lieu: MOTS.lieu['5g'], boutons: [], gestes: [],
            notes: ['Une grille réunit tes critères (ce que tu regardes dans une production) et ce que pèse chacun.'],
            consignes: ['Touche « + Nouvelle grille »']
        }, 'bulle 5, l’onglet « Grilles »');
        await contourSur(page, '#conception-grille-criteres [data-action="creerNouvelleGrille"]');
        await capture(page, DOSSIER, `p6-parcours-grilles-${L}x${H}`);
        expect(await page.evaluate(() => ParcoursMoteur.etapeCourante()), 'bulle 5 : rien de créé encore').toBe(4);

        // Une grille composée là : « Ta cartouche », avec elle ; le brouillon de l'étiquetage est toujours là.
        const id = await composerUneGrille(page, 'Grille fictive composée');
        await attendreEtape(page, 6, 10, 'Ta cartouche', { focus: false });
        expect((await ctx(page)).grilleId).toBe(id);
        expect((await lireDonnees(page)).brouillon).toEqual(brouillon);
    });
}
