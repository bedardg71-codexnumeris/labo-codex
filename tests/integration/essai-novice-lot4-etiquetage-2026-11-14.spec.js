// =======================================================================
// ESSAI NOVICE DU 14 NOV. 2026, LOT 4 — L'ÉTIQUETAGE DE LA GRILLE, dans un vrai WebKit
// =======================================================================
// plans de travail/CONSIGNE-2026-11-14-essai-novice.md, lot 4. « Évaluer une première production », étape 1.
//   (b) deux bulles d'ouverture avant « Ta grille » : « Pourquoi étiqueter » (elle dit où l'on est, le menu a son halo,
//       la page est en haut), puis « Tu apprends aussi » ; chacune avance par « Continuer » ;
//   (c) la bulle « Ta grille » ne porte plus aucun bouton : elle montre la zone où coller et les deux boutons de la
//       page, renommés « Voir un exemple de grille étiquetée » et « Étiqueter l'exemple moi-même » ;
//   (d) devant l'exemple étiqueté, la bulle change ; (e) devant la grille comprise par l'application, elle change
//       encore, une flèche par ligne ; la page ne dit qu'une fois que l'exemple ne s'enregistre pas ;
//   (a) « partie » remplace « morceau » dans ce que l'écran donne à lire ; « Sous-total » : un groupe de critères ;
//   (f, premier point) « L'exemple est étiqueté » ne s'affiche jamais tant que des parties restent sans étiquette.
// Grille de l'exemple : celle de l'application, fictive. Noms d'étudiant·es fictifs (classe-de-banc.js).
import { test, expect } from '@playwright/test';
import { ouvrirEspaceVide, mettreLaClasseEnPlace, contourSur, bulle, bulleNeCouvrePas } from './harness/classe-de-banc.js';
import { flecheVers, nombreDeFleches } from './harness/fleches-de-banc.js';
import { boutonExemple } from './harness/ouverture-evaluer.js';

const norm = (t) => String(t).replace(/[  ]/g, ' ');
const titre = (page) => bulle(page).locator('.parcours-bulle-titre');
const lignes = async (page) => (await bulle(page).locator('.parcours-bulle-ligne').allTextContents()).map(norm);
const notes = async (page) => (await bulle(page).locator('.parcours-bulle-note').allTextContents()).map(norm);
const lancerEvaluer = (page) => page.evaluate(() => { Assistance.parcours().find((p) => p.id === 'evaluer').lancer(0); });

async function ouvrir(page) {
    test.setTimeout(240000);
    await ouvrirEspaceVide(page, 1180, { hauteur: 820 });
    await mettreLaClasseEnPlace(page);
    await page.evaluate(() => window.scrollTo(0, 300));
    await lancerEvaluer(page);
}

test('(b) et (c) deux bulles d’ouverture, puis « Ta grille » : la bulle guide, la page agit', async ({ page }) => {
    await ouvrir(page);

    // « Pourquoi étiqueter » : où l'on est, le halo au menu, la page en haut, le texte validé, « Continuer ».
    await expect(titre(page)).toHaveText('Pourquoi étiqueter', { timeout: 10000 });
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('1 sur 9');
    expect(norm(await bulle(page).locator('.parcours-bulle-lieu').textContent())).toBe("Tu es dans « Conception », à l'onglet « Mon matériel ».");
    expect(await page.evaluate(() => [...document.querySelectorAll('.parcours-section-actuelle')].map((e) => e.textContent.trim()).sort())).toEqual(['Conception', 'Mon matériel']);
    expect(await page.evaluate(() => Math.round(window.scrollY)), 'la page s’ouvre en haut').toBe(0);
    await expect(page.locator('.navigation-principale button.actif').first()).toBeInViewport();
    expect(await notes(page)).toEqual(["Ici, tu numérises ta grille. Une photo n'en garderait que l'apparence : l'application, elle, doit savoir ce que chaque partie veut dire. C'est toi qui le lui expliques, en posant une étiquette sur chaque partie : critère, niveau, pondération."]);
    expect(await lignes(page)).toEqual(['Touche « Continuer »']);
    await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Continuer']);
    // (d du lot 2) Elle ne s'ouvre plus au centre, sur le texte de la page et le formulaire : elle est au bord droit, et
    // ne couvre pas le texte de la page.
    // ⚠ MESURÉ ET LAISSÉ (14 nov. 2026) : à 1180 × 820, aucune place n'est libre pour une bulle de 373 px de haut (166 px
    // au-dessus du texte, 144 px sous le formulaire). Le moteur prend le moindre recouvrement : elle mord de quelques
    // dizaines de pixels sur le coin droit de la zone de collage, où rien n'est encore à faire. Dit au rapport.
    const part = (sel) => page.evaluate((q) => {
        const b = document.getElementById('parcours-bulle').getBoundingClientRect(), z = document.querySelector(q).getBoundingClientRect();
        const l = Math.max(0, Math.min(b.right, z.right) - Math.max(b.left, z.left)), h = Math.max(0, Math.min(b.bottom, z.bottom) - Math.max(b.top, z.top));
        return (l * h) / (z.width * z.height);
    }, sel);
    expect(await part('#materiel-accueil .materiel-intro p'), 'la bulle ne couvre qu’une marge du texte de la page').toBeLessThan(0.1);
    expect(await part('#materiel-zone-collage'), 'la bulle couvre moins du quart de la zone de collage').toBeLessThan(0.25);
    const bord = await page.evaluate(() => document.documentElement.clientWidth - Math.round(document.getElementById('parcours-bulle').getBoundingClientRect().right));
    expect(bord, 'la bulle est au bord droit, pas au centre').toBeLessThanOrEqual(8);
    await bulle(page).getByRole('button', { name: 'Continuer' }).click();

    // « Tu apprends aussi ».
    await expect(titre(page)).toHaveText('Tu apprends aussi');
    await expect(bulle(page).locator('.parcours-bulle-lieu')).toHaveCount(0);
    expect(await notes(page)).toEqual(["Ces mots sont les mêmes pour toutes les disciplines, alors que chaque grille est faite à sa façon. En expliquant la tienne, tu découvriras peut-être un critère flou ou un total qui ne tombe pas juste. C'est normal : ici, l'enseignant·e apprend aussi, et l'erreur fait partie du travail."]);
    expect(await part('#materiel-accueil .materiel-intro p'), '« Tu apprends aussi »').toBeLessThan(0.1);
    await bulle(page).getByRole('button', { name: 'Continuer' }).click();

    // « Ta grille » : aucun bouton dans la bulle ; une seule page ; elle montre la zone où coller et les deux boutons.
    await expect(titre(page)).toHaveText('Ta grille');
    await expect(bulle(page).locator('.parcours-bulle-boutons')).toHaveCount(0);
    await expect(bulle(page).locator('.parcours-bulle-nav')).toBeHidden();
    await expect(bulle(page).locator('.parcours-bulle-texte')).toBeHidden();
    expect(await lignes(page)).toEqual(['Colle ici la grille que tu utilises déjà (copie le tableau entier, depuis Word ou Pages)',
        'Pas de grille sous la main ? Ces deux boutons ouvrent un exemple', 'Colle ta grille, ou touche un des deux boutons']);
    await expect(boutonExemple(page, 'complet')).toHaveText('Voir un exemple de grille étiquetée');
    await expect(boutonExemple(page, 'exercice')).toHaveText('Étiqueter l’exemple moi-même');
    await contourSur(page, '#materiel-zone-collage');
    await flecheVers(page, '#materiel-zone-collage', '« Ta grille », la zone où coller');
    await flecheVers(page, ['#materiel-accueil [data-param="complet"]', '#materiel-accueil [data-param="exercice"]'], '« Ta grille », les deux boutons de l’exemple');
    for (const sel of ['#materiel-zone-collage', '#materiel-accueil [data-param="complet"]', '#materiel-accueil [data-param="exercice"]']) {
        await bulleNeCouvrePas(page, sel, '« Ta grille »');
    }
    // Le parcours n'a pas reculé, et les deux bulles d'ouverture ne reviennent pas à la reprise.
    expect(await page.evaluate(() => Assistance.etatDe('evaluer'))).toEqual({ etat: 'en-cours', etape: 0 });
    await bulle(page).locator('.parcours-bulle-sortie').click();
    await page.evaluate(() => { Assistance.parcours().find((p) => p.id === 'evaluer').lancer(0); });
    await expect(titre(page)).toHaveText('Ta grille');
});

test('(d) et (e) devant l’exemple étiqueté, puis devant la grille comprise par l’application', async ({ page }) => {
    await ouvrir(page);
    for (const t of ['Pourquoi étiqueter', 'Tu apprends aussi']) {
        await expect(titre(page)).toHaveText(t, { timeout: 10000 });
        await bulle(page).getByRole('button', { name: 'Continuer' }).click();
    }
    await expect(titre(page)).toHaveText('Ta grille');
    const avant = await page.evaluate(() => JSON.stringify([db.getSync(cle('brouillonDissection'), null), db.getSync(cle('grillesTemplates'), [])]));
    await boutonExemple(page, 'complet').click();
    await expect(page.locator('#materiel-dissection')).toBeVisible();

    // (d) L'exemple étiqueté : la légende et la grille, chacune sa flèche ; rien à toucher.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(titre(page)).toHaveText("L'exemple étiqueté");
    expect(await lignes(page)).toEqual(['Chaque couleur est une étiquette : la légende, à gauche, les nomme',
        'Regarde une rangée : le critère en jaune, ses descriptions en bleu, ses points en rose',
        "Descends voir la grille telle que l'application la comprend"]);
    await expect(bulle(page).locator('.parcours-bulle-boutons')).toHaveCount(0);
    await expect(page.locator('#parcours-contour')).toBeHidden();
    // Les sections de l'exemple s'appellent « SECTION », comme l'étiquette (elles s'appelaient « PARTIE A », « PARTIE B »).
    await expect(page.locator('#dissection-contenu')).toContainText('SECTION A : COMPRÉHENSION');
    await expect(page.locator('#dissection-contenu')).not.toContainText('PARTIE A');
    expect(await page.evaluate(() => { const e = window.materielDissection.etatCourant(); return Object.keys(e.liens).length === e.morceaux.ordre.length; }), 'tout est étiqueté, sections comprises').toBe(true);
    // Les deux rangées « SECTION » sont lues comme des sections, pas comme des critères (break-test du 14 nov. : la
    // reconnaissance restée sur « PARTIE » donnait six critères).
    expect(await page.evaluate(() => window.materielDissection.comprise().criteres.length)).toBe(4);
    // (a) Ce que l'écran donne à lire ne dit plus « morceau » ; « Sous-total » parle d'un groupe de critères.
    const ecran = await page.evaluate(() => document.getElementById('conception-materiel').innerText + ' ' + [...document.querySelectorAll('#dissection-palette [aria-label]')].map((b) => b.getAttribute('aria-label')).join(' '));
    expect(ecran).not.toMatch(/morceau/i);
    expect(ecran).toContain('Le total d’un groupe de critères');
    // (e) La page ne dit qu'UNE fois que l'exemple ne s'enregistre pas : en bas, près du nom.
    expect((ecran.match(/ne s’enregistre pas/g) || []).length).toBe(0);
    expect((ecran.match(/il ne devient pas une de tes grilles/g) || []).length).toBe(1);

    // (e) La grille comprise, amenée devant soi : la bulle change, une flèche par ligne.
    await page.evaluate(() => document.querySelector('#materiel-dissection .dissection-resultat').scrollIntoView({ block: 'start' }));
    await expect(titre(page)).toHaveText("La grille, comprise par l'application");
    expect(await lignes(page)).toEqual(["C'est la grille de l'exemple, refaite d'après ses étiquettes",
        "Ce résumé dit ce que l'application y a trouvé : 4 critères, 4 niveaux de performance, un total de 30 qui tombe juste",
        "Le résultat d'une copie peut se compter en points, ou se dire par un niveau de performance, d'« Insuffisant » à « Remarquable »"]);
    // Une flèche par cible À L'ÉCRAN (le moteur n'en trace pas vers ce qui est tout entier hors de l'écran).
    const cibles = await page.evaluate(() => ['dissection-comprise', 'dissection-constats', 'dissection-creer-choix'].filter((id) => {
        const e = document.getElementById(id), r = e ? e.getBoundingClientRect() : null;
        return !!r && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
    }));
    expect(cibles, 'la grille comprise et son résumé sont à l’écran').toEqual(expect.arrayContaining(['dissection-comprise', 'dissection-constats']));
    await nombreDeFleches(page, cibles.length, 'devant la grille comprise : une flèche par cible à l’écran');
    if (cibles.includes('dissection-creer-choix')) await expect(page.locator('#dissection-creer-choix')).toContainText('des niveaux de performance');
    // La page défilée par la personne ne revient pas en arrière quand la bulle change.
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThan(100);

    // Rien n'a été écrit ; « Quitter l'exemple » (sur la page) ramène à l'accueil.
    expect(await page.evaluate(() => JSON.stringify([db.getSync(cle('brouillonDissection'), null), db.getSync(cle('grillesTemplates'), [])]))).toBe(avant);
    await page.locator('#materiel-dissection [data-action="materielDissection.collerAutre"]').click();
    await expect(titre(page)).toHaveText('Ta grille');
});

test('(f) « L’exemple est étiqueté » ne s’affiche jamais tant que des parties restent sans étiquette', async ({ page }) => {
    await ouvrir(page);
    for (const t of ['Pourquoi étiqueter', 'Tu apprends aussi']) {
        await expect(titre(page)).toHaveText(t, { timeout: 10000 });
        await bulle(page).getByRole('button', { name: 'Continuer' }).click();
    }
    await boutonExemple(page, 'exercice').click();
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    const geste = async () => norm(await bulle(page).locator('.parcours-bulle-geste').textContent());
    const FAIT = "L'exemple est étiqueté : touche « Quitter l'exemple ».";

    // Ce que Grégoire a fait le 14 nov. : le nom, UN critère, UN descripteur et UNE valeur de points. L'application
    // sait alors lire une grille (l'aide rend « prêt »), et la carte disait déjà « L'exemple est étiqueté ».
    const poser = (type, texte) => page.evaluate(([t, tx]) => {
        const b = document.querySelector('#dissection-palette .dissection-etiquette[data-type="' + t + '"]');
        if (b.getAttribute('aria-pressed') !== 'true') b.click();
        const m = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].find((x) => x.textContent === tx);
        m.scrollIntoView({ block: 'center', inline: 'center' });
        const r = m.getBoundingClientRect();
        const o = { bubbles: true, cancelable: true, pointerId: 3, pointerType: 'mouse', isPrimary: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
        m.dispatchEvent(new PointerEvent('pointerdown', o));
        m.dispatchEvent(new PointerEvent('pointerup', o));
    }, [type, texte]);
    const etatDeLAide = () => page.evaluate(() => ({ sorte: window.materielDissection.aide().sorte, reste: window.materielDissection.comprise().sansEtiquette }));
    expect(await geste()).not.toBe(FAIT);
    await poser('titre', 'Journal de lecture');
    expect(await geste()).not.toBe(FAIT);
    await poser('critere', 'L’étudiant·e résume l’œuvre avec justesse');
    expect(await geste()).not.toBe(FAIT);
    await poser('descripteur', 'Résume quelques événements');
    expect(await geste()).not.toBe(FAIT);
    await poser('points', '2');
    const a = await etatDeLAide();
    expect(a.sorte, 'le cas vécu : après ces quatre étiquettes, l’aide de la lecture rend « prêt »').toMatch(/^pret/);
    expect(a.reste, 'et presque toutes les parties restent sans étiquette').toBeGreaterThan(30);
    await expect.poll(geste).toBe('Il reste ' + a.reste + ' parties sans étiquette : pose une étiquette sur chacune.');
    expect(await geste()).not.toBe(FAIT);
});
