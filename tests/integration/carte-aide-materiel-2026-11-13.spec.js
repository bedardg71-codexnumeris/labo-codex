// =======================================================================
// LA CARTE D'AIDE DANS « APPORTER MON MATÉRIEL » (13 nov. 2026) — dans un vrai WebKit, à 1180 × 820 et à 820 × 1180
// =======================================================================
// Relais de la conversation du Projet, 12 nov., 19 h 15 (décision de Grégoire, 12 nov., 10 h 31 à 10 h 55) : les consignes
// de la page entrent dans la carte ; hors du parcours, la même carte est offerte par un interrupteur.
//   I1 · l'interrupteur : ouvert à la première arrivée ; fermé, ni carte ni consigne dans la page ; rouvert à l'arrivée
//        suivante tant qu'aucune grille n'est créée ; le lien de sortie de la carte le ferme ; la carte n'est pas un
//        parcours (absente de la liste, rien d'écrit dans la progression) ;
//   I2 · la carte de la page dans l'étiquetage : les trois étapes, la flèche et le halo sur l'étiquette à prendre, puis sur
//        le morceau ; un outil en main, sa phrase ; une grille créée par l'étiquetage : l'interrupteur garde son état ;
//   I3 · pendant un parcours : ni interrupteur ni carte de page ; « Ta grille » inchangée sauf le complément ; aucune
//        phrase deux fois ; la carte tient dans l'écran ; Conception › Grilles a son texte ; la carte de la page revient ;
//   I4 · les deux boutons de l'exemple : un brouillon posé avant survit à « Voir le travail complet », à « Faire
//        l'exercice soi-même » et à la sortie de l'exemple ; l'exemple complet : la carte évite la lecture.
// Sous un banc, l'interrupteur arrive fermé (`navigator.webdriver`, js/materiel-aide.js) : ce banc éteint le drapeau
// pour éprouver la vraie règle, et pose le choix de la vue étendue (sans lui, une application vide s'ouvre en vue simple).
// Break-tests : `plans de travail/RAPPORT-2026-11-13-carte-aide-materiel.md`. Grilles FICTIVES ; noms fictifs.
import { test, expect } from '@playwright/test';
import { ouvrirEspaceVide, mettreLaClasseEnPlace, attendreEtape, contourSur, deuxSondes, bulle, bulleNeCouvrePas, capture } from './harness/classe-de-banc.js';
import { flecheVers } from './harness/fleches-de-banc.js';
import { attendreApplication } from './harness/attendre-application.js';

const DOSSIER = process.env.CAPTURES_PARCOURS || '';
const TAILLES = [[1180, 820], [820, 1180]];
const TITRE = 'Ta grille, pas à pas';
const SORTIE = 'Fermer l’accompagnement';
const GESTE_ACCUEIL = "Colle ta grille, montre ce qu'est chaque morceau, puis touche « Créer ma grille » ; ou touche « Composer ma grille ».";
const norm = (t) => String(t).replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
const etiquette = (type) => `#dissection-palette .dissection-etiquette[data-type="${type}"]`;
const bascule = (page) => page.locator('#materiel-aide-bascule');
const interrupteur = (page) => page.locator('#materiel-aide-interrupteur');
const pageLue = (page) => bulle(page).locator('.parcours-bulle-page:not(.u-lecteur-ecran)');

// La grille de la capture du 11 nov., refaite FICTIVE (banc de la dissection sur l'iPad).
const CAPTURE = '<table><tr><td colspan="3">Grille fictive d’analyse</td></tr>'
    + '<tr><td>Introduction</td><td>Sujet amené, posé, divisé</td><td>/ 5</td></tr>'
    + '<tr><td>Développement</td><td>Arguments et exemples</td><td>/ 30</td></tr>'
    + '<tr><td>Conclusion</td><td>Synthèse et ouverture</td><td>/ 10</td></tr></table>';

async function ouvrir(page, L, H) {
    await page.addInitScript(() => {
        Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false });
        try { if (!localStorage.getItem('laboCodex.vue')) localStorage.setItem('laboCodex.vue', 'etendue'); } catch (e) { /* rien */ }
    });
    await ouvrirEspaceVide(page, L, { hauteur: H });
}

const allerAuMateriel = (page) => page.evaluate(() => naviguerVers('conception', 'materiel'));
const allerAilleurs = async (page) => {
    await page.evaluate(() => naviguerVers('conception', 'productions'));
    await expect(page.locator('#conception-materiel')).toBeHidden();
};

/** La carte de la page est ouverte : son titre, aucun « n sur N ». */
async function carteDeLaPage(page) {
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(TITRE, { timeout: 10000 });
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveCount(0);
}

async function aucuneCarte(page) {
    await expect(bulle(page)).toHaveCount(0);
    expect(await page.evaluate(() => ParcoursMoteur.actif())).toBe(false);
}

const texteDeLaCarte = async (page) => norm(await bulle(page).locator('.parcours-bulle-texte').textContent());
const gesteEst = (page, texte) => expect.poll(async () => norm(await bulle(page).locator('.parcours-bulle-geste').textContent()),
    { message: 'la ligne du geste', timeout: 5000 }).toBe(texte);

/** La carte tient dans l'écran, sous l'en-tête, sans que son texte ait à défiler (le filet n'est pas le recours). */
async function carteTient(page, contexte) {
    await deuxSondes(page);
    const r = await page.evaluate(() => {
        const b = document.getElementById('parcours-bulle').getBoundingClientRect();
        const t = document.querySelector('#parcours-bulle .parcours-bulle-texte');
        const e = document.querySelector('header.entete');
        return { haut: Math.round(b.top), bas: Math.round(b.bottom), defile: t.scrollHeight - t.clientHeight, ih: innerHeight,
            entete: e ? Math.round(e.getBoundingClientRect().bottom) : 0, gauche: b.left, droite: b.right, iw: document.documentElement.clientWidth };
    });
    expect(r.bas, contexte + ' : le bas de la carte dans l’écran (' + JSON.stringify(r) + ')').toBeLessThanOrEqual(r.ih);
    expect(r.haut, contexte + ' : le haut de la carte sous l’en-tête').toBeGreaterThanOrEqual(Math.max(0, r.entete));
    expect(r.gauche >= 0 && r.droite <= r.iw, contexte + ' : la carte dans la largeur').toBe(true);
    expect(r.defile, contexte + ' : le texte de la carte ne défile pas').toBeLessThanOrEqual(1);
}

/** Aucune phrase ne se lit deux fois dans la carte (son texte, toutes pages, et sa ligne du geste). */
async function aucunePhraseDeuxFois(page, contexte) {
    const texte = (await texteDeLaCarte(page)) + ' ' + norm(await bulle(page).locator('.parcours-bulle-geste').textContent());
    const phrases = texte.split(/(?<=[.!?…])\s+/).map((p) => p.trim()).filter((p) => p.length > 12);
    const doubles = phrases.filter((p, k) => phrases.indexOf(p) !== k);
    expect(doubles, contexte + ' : aucune phrase deux fois').toEqual([]);
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

async function morceau(page, texte) {
    const id = await page.evaluate((t) => {
        const b = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].find((x) => x.textContent === t);
        return b ? b.getAttribute('data-id') : null;
    }, texte);
    expect(id, 'morceau « ' + texte + ' »').toBeTruthy();
    return `#dissection-contenu .dissection-morceau[data-id="${id}"]`;
}

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

/** Une étiquette prise (par son bouton, sans dépendre de ce que la carte couvre), puis un toucher par morceau. */
async function poser(page, type, textes) {
    if ((await page.locator(etiquette(type)).getAttribute('aria-pressed')) !== 'true') await page.locator(etiquette(type)).evaluate((b) => b.click());
    for (const t of textes) await toucher(page, t);
}

/** « Coller une autre grille », confirmé s'il le faut : retour à l'accueil (le brouillon s'efface). */
async function collerUneAutre(page) {
    const b = page.locator('#materiel-dissection [data-action="materielDissection.collerAutre"]');
    await b.evaluate((x) => x.click());
    if (await page.locator('#materiel-dissection').isVisible()) await b.evaluate((x) => x.click());
    await expect(page.locator('#materiel-accueil')).toBeVisible();
}

const lireDonnees = (page) => page.evaluate(() => ({
    brouillon: JSON.stringify(db.getSync(cle('brouillonDissection'), null)),
    grilles: (db.getSync(cle('grillesTemplates'), []) || []).map((g) => g.id)
}));

/** Ce que les parcours retiennent : la progression, la reprise. */
const progression = (page) => page.evaluate(() => JSON.stringify([obtenirPreference('parcoursAssistance'), obtenirPreference('parcoursEvaluer')]));
const preference = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('laboCodex.aideMateriel') || 'null'));

/** Ce qu'on lit dans la page (hors de la carte), pour dire qu'elle n'a plus de consignes à elle. */
const lisibleDansLaPage = (page) => page.evaluate(() => document.getElementById('conception-materiel').innerText.replace(/\s+/g, ' '));
const CONSIGNES = ['Copie ton tableau', 'Colle-le ici', 'Étiquette, puis crée', 'Touche une étiquette dans la légende', 'Touche les morceaux de ta grille',
    'En bas, lis la grille', 'Pour en étiqueter plusieurs', 'touche l’endroit d’un morceau', 'touche deux morceaux'];
async function pageSansConsignes(page, contexte) {
    const t = await lisibleDansLaPage(page);
    expect(CONSIGNES.filter((c) => t.includes(c)), contexte + ' : la page n’a pas de consignes à elle').toEqual([]);
}

// ---------------------------------------------------------------------------------------------------------------
// I1 — l'interrupteur
// ---------------------------------------------------------------------------------------------------------------
for (const [L, H] of TAILLES) {
    test(`I1 · ${L} × ${H} : l’interrupteur, ouvert à l’arrivée ; fermé, ni carte ni consigne ; rouvert à l’arrivée suivante ; la sortie de la carte le ferme`, async ({ page }) => {
        const cap = `${L}x${H}`;
        await ouvrir(page, L, H);
        const avant = await progression(page);
        await allerAuMateriel(page);

        // Ouvert à la première arrivée ; la carte de la page, qui n'est pas un parcours.
        await expect(interrupteur(page)).toBeVisible();
        await expect(page.locator('.interrupteur-libelle')).toHaveText('M’accompagner pour étiqueter ma grille');
        await expect(bascule(page)).toBeChecked();
        await carteDeLaPage(page);
        const cible = await page.locator('label.interrupteur').boundingBox();
        expect(cible.height, 'la cible tactile de l’interrupteur').toBeGreaterThanOrEqual(44);
        // En haut de la page, au-dessus de l'accueil.
        expect(cible.y).toBeLessThan((await page.locator('#materiel-accueil').boundingBox()).y);

        // L'accueil : ses trois cartes sont dans la carte, mot pour mot, plus dans la page.
        await expect(page.locator('#conception-materiel .materiel-etapes')).toHaveCount(0);
        const texte = await texteDeLaCarte(page);
        for (const mots of ['Copie ton tableau Ouvre ta grille dans son fichier d’origine (Word, Pages ou un autre traitement de texte)',
            'Colle-le ici Ta grille s’affiche telle quelle, chaque ligne de chaque case devenue un morceau.',
            'Étiquette, puis crée Avec les étiquettes de la légende, tu identifies tes sections, tes critères, tes points']) expect(texte).toContain(mots);
        await pageSansConsignes(page, 'ouvert, à l’accueil');
        await gesteEst(page, GESTE_ACCUEIL);
        await contourSur(page, '#materiel-zone-collage');
        // Debout, la carte a la place de ne pas couvrir la zone de collage ; couchée (820 de haut), aucune place libre à
        // côté d'une zone pleine largeur : elle en couvre un bord, comme « Ta grille » avant ce lot, et la poignée sert.
        if (H > L) {
            await flecheVers(page, '#materiel-zone-collage', 'l’accueil');
            await bulleNeCouvrePas(page, '#materiel-zone-collage', 'l’accueil');
        }
        await carteTient(page, 'l’accueil');
        await aucunePhraseDeuxFois(page, 'l’accueil');
        await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveText(SORTIE);
        await capture(page, DOSSIER, `i1-accueil-ouvert-${cap}`);

        // Fermé : ni carte ni consigne dans la page, à l'accueil comme dans l'étiquetage.
        await page.locator('.interrupteur-piste').click();
        await expect(bascule(page)).not.toBeChecked();
        await aucuneCarte(page);
        await pageSansConsignes(page, 'fermé, à l’accueil');
        await capture(page, DOSSIER, `i1-accueil-ferme-${cap}`);
        await coller(page, CAPTURE);
        await aucuneCarte(page);
        await expect(page.locator('#dissection-statut')).toHaveText('Tableau collé : 4 rangées, 10 morceaux.');
        await expect(page.locator('#dissection-bandeau')).toBeHidden();   // ni texte ni bouton : il ne s'affiche pas
        await pageSansConsignes(page, 'fermé, dans l’étiquetage');
        await page.locator(etiquette('ponderation')).click();
        await expect(page.locator('#dissection-statut')).toHaveText('Étiquette « Pondération » choisie.');
        await expect(page.locator('#dissection-bandeau')).toBeVisible();   // la précision de l'étiquette en main, « Terminer »
        await expect(page.locator('#dissection-bandeau-precision')).toBeVisible();
        await expect(page.locator('#dissection-terminer')).toBeVisible();
        await pageSansConsignes(page, 'fermé, une étiquette en main');
        await capture(page, DOSSIER, `i1-etiquetage-ferme-${cap}`);
        await page.locator('#dissection-terminer').click();

        // Rouvert à l'arrivée suivante (aucune grille créée), même fermé à la visite d'avant.
        await allerAilleurs(page);
        await aucuneCarte(page);
        await allerAuMateriel(page);
        await expect(bascule(page)).toBeChecked();
        await carteDeLaPage(page);

        // Le lien de sortie de la carte ferme l'interrupteur : les deux ne se contredisent jamais.
        await bulle(page).locator('.parcours-bulle-sortie').click();
        await aucuneCarte(page);
        await expect(bascule(page)).not.toBeChecked();
        await expect(interrupteur(page)).toBeVisible();
        // Rouvert par l'interrupteur : la carte revient.
        await page.locator('.interrupteur-piste').click();
        await carteDeLaPage(page);

        // Pas un parcours : absente de la liste, rien d'écrit dans la progression ni la reprise.
        expect(await page.evaluate(() => Assistance.parcours().map((p) => p.id))).not.toContain('aide-materiel');
        expect(await progression(page)).toEqual(avant);
        expect((await preference(page)).grilleCreee).toBeUndefined();
    });
}

// ---------------------------------------------------------------------------------------------------------------
// I2 — la carte de la page dans l'étiquetage ; une grille créée par l'étiquetage
// ---------------------------------------------------------------------------------------------------------------
for (const [L, H] of TAILLES) {
    test(`I2 · ${L} × ${H} : la carte dans l’étiquetage (étapes, flèche, halo, outil) ; après une grille créée, l’interrupteur garde son état`, async ({ page }) => {
        test.setTimeout(180000);
        const cap = `${L}x${H}`;
        await ouvrir(page, L, H);
        // Un trimestre, pour que « Créer ma grille » ait où ranger la grille.
        await page.evaluate(() => { db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]); db.setSync('trimestreActif', 'a2032'); });
        await page.reload();
        await attendreApplication(page);
        const avant = await progression(page);
        await allerAuMateriel(page);
        await carteDeLaPage(page);
        await coller(page, CAPTURE);

        // Les trois étapes de l'étiquetage, mot pour mot (à la souris : « glisse dessus »), sur la page que montre la carte.
        await carteDeLaPage(page);
        await expect.poll(async () => norm(await pageLue(page).textContent()), { message: 'la carte passe aux étapes de l’étiquetage' })
            .toBe('1. Touche une étiquette dans la légende. 2. Touche les morceaux de ta grille qu’elle désigne : ils prennent sa couleur. '
                + 'Pour en étiqueter plusieurs d’un coup, glisse dessus. Touche un morceau déjà étiqueté pour retirer son étiquette. '
                + '3. En bas, lis la grille que l’application en tirerait, puis crée-la.');
        await pageSansConsignes(page, 'ouvert, dans l’étiquetage');
        await gesteEst(page, 'Ta grille n’a pas encore de nom : prends « Titre », puis touche son nom dans ta grille.');
        await contourSur(page, etiquette('titre'));
        await flecheVers(page, etiquette('titre'), 'le nom');
        await bulleNeCouvrePas(page, etiquette('titre'), 'le nom');
        await carteTient(page, 'l’étiquetage');
        await aucunePhraseDeuxFois(page, 'l’étiquetage');
        await capture(page, DOSSIER, `i2-etiquetage-${cap}`);

        // La flèche et le halo sur l'étiquette à prendre, puis sur le morceau, comme « Ta grille ».
        await poser(page, 'titre', ['Grille fictive d’analyse']);
        await poser(page, 'ponderation', ['/ 5', '/ 30', '/ 10']);
        await gesteEst(page, '« / 5 » n’a aucun critère dans sa rangée : prends « Critère », puis touche « Introduction ».');
        await contourSur(page, etiquette('critere'));
        await flecheVers(page, etiquette('critere'), 'l’étiquette à prendre');
        await flecheVers(page, await morceau(page, 'Introduction'), 'le morceau');
        await capture(page, DOSSIER, `i2-etiquette-a-prendre-${cap}`);
        await page.locator(etiquette('critere')).evaluate((b) => b.click());
        await contourSur(page, await morceau(page, 'Introduction'));
        await toucher(page, 'Introduction');
        await gesteEst(page, '« / 30 » n’a aucun critère dans sa rangée : prends « Critère », puis touche « Développement ».');

        // Un outil en main : sa phrase, dans la carte ; dans la page, le fait seulement.
        await page.locator(etiquette('couper')).evaluate((b) => b.click());
        await expect.poll(async () => norm(await pageLue(page).textContent()))
            .toBe('Outil « Couper » : touche l’endroit d’un morceau où le séparer en deux. La coupe tombe entre deux mots.');
        await expect(page.locator('#dissection-statut')).toHaveText('Outil « Couper » en main.');
        await pageSansConsignes(page, '« Couper » en main');
        await capture(page, DOSSIER, `i2-couper-${cap}`);
        await page.locator(etiquette('rattacher')).evaluate((b) => b.click());
        await expect.poll(async () => norm(await pageLue(page).textContent())).toContain('Outil « Rattacher » : touche deux morceaux d’un même texte');
        await page.keyboard.press('Escape');   // Échap pose l'outil : la carte reste (elle ne se ferme que par son lien)
        await expect(page.locator('#dissection-terminer')).toBeHidden();
        await carteDeLaPage(page);
        await expect.poll(async () => norm(await pageLue(page).textContent())).toContain('1. Touche une étiquette dans la légende.');

        // La grille prête ; l'interrupteur fermé, puis « Créer ma grille » : désormais il garde son état.
        await poser(page, 'critere', ['Développement', 'Conclusion']);
        await gesteEst(page, 'Ta grille est prête : touche « Créer ma grille ».');
        await contourSur(page, '[data-action="materielDissection.creer"]');
        await bascule(page).evaluate((b) => b.click());
        await aucuneCarte(page);
        expect((await preference(page)).grilleCreee, 'aucune grille créée encore').toBeUndefined();
        await page.locator('[data-action="materielDissection.creer"]').click();
        await expect(page.locator('#materiel-titre-cree')).toBeVisible();
        expect(await preference(page)).toEqual({ ouvert: false, grilleCreee: true });
        // Sur la confirmation : ni interrupteur ni carte.
        await expect(interrupteur(page)).toBeHidden();
        await aucuneCarte(page);

        // À l'arrivée suivante : fermé, comme laissé.
        await page.locator('#materiel-lecture [data-action="materiel.recommencer"]').click();
        await expect(page.locator('#materiel-accueil')).toBeVisible();
        await allerAilleurs(page);
        await allerAuMateriel(page);
        await expect(interrupteur(page)).toBeVisible();
        await expect(bascule(page)).not.toBeChecked();
        await aucuneCarte(page);
        await pageSansConsignes(page, 'après une grille créée, fermé');
        // Rouvert par la personne : il le reste à l'arrivée suivante.
        await page.locator('.interrupteur-piste').click();
        await carteDeLaPage(page);
        await allerAilleurs(page);
        await aucuneCarte(page);
        await allerAuMateriel(page);
        await expect(bascule(page)).toBeChecked();
        await carteDeLaPage(page);
        expect(await preference(page)).toEqual({ ouvert: true, grilleCreee: true });
        expect(await progression(page)).toEqual(avant);
    });
}

// ---------------------------------------------------------------------------------------------------------------
// I3 — pendant un parcours ; « Ta grille », inchangée sauf le complément
// ---------------------------------------------------------------------------------------------------------------
for (const [L, H] of TAILLES) {
    test(`I3 · ${L} × ${H} : pendant un parcours, ni interrupteur ni carte de page ; « Ta grille » et son complément ; Conception › Grilles a son texte`, async ({ page }) => {
        test.setTimeout(240000);
        const cap = `${L}x${H}`;
        // Le drapeau de banc reste allumé ici (la mise en place de la classe est jugée ailleurs, sous lui) : la personne a
        // déjà créé une grille par l'étiquetage et laissé l'interrupteur ouvert. La règle de l'arrivée est jugée en I1 et I2.
        await ouvrirEspaceVide(page, L, { hauteur: H });
        await page.evaluate(() => localStorage.setItem('laboCodex.aideMateriel', JSON.stringify({ grilleCreee: true, ouvert: true })));
        await mettreLaClasseEnPlace(page);
        await allerAuMateriel(page);
        await expect(bascule(page)).toBeChecked();
        await carteDeLaPage(page);

        // Un parcours se lance : la carte de la page se ferme, l'interrupteur ne se montre pas.
        await page.evaluate(() => Assistance.parcours().find((p) => p.id === 'evaluer').lancer(0));
        await attendreEtape(page, 1, 9, 'Ta grille', { focus: false });
        await expect(interrupteur(page)).toBeHidden();
        expect(await page.evaluate(() => ParcoursMoteur.joue(MaterielAide.definition()))).toBe(false);

        // « Ta grille », devant l'accueil : le texte validé, puis le complément (les trois cartes de l'accueil), dessous.
        await bulle(page).getByRole('button', { name: 'Passer à ma grille' }).click();
        await contourSur(page, '#materiel-zone-collage');
        await expect(interrupteur(page)).toBeHidden();
        const texte = await texteDeLaCarte(page);
        expect(texte.startsWith("Pour évaluer une première production, il te faut ta grille. Apporte celle que tu utilises déjà : colle-la ici, puis montre à l'application")).toBe(true);
        const fin = 'Pas de grille sous la main ? Touche « Composer ma grille ».';
        const [avantLaFin, apresLaFin] = texte.split(fin);
        expect(avantLaFin.length > 0 && apresLaFin !== undefined, 'le texte validé est entier').toBe(true);
        expect(apresLaFin.trim().startsWith('1. Copie ton tableau'), 'le complément vient dessous').toBe(true);
        expect(texte).toContain('3. Étiquette, puis crée');
        await gesteEst(page, GESTE_ACCUEIL);
        await expect(pageLue(page)).toContainText('Pour évaluer une première production');   // la carte s'ouvre sur son texte
        await aucunePhraseDeuxFois(page, '« Ta grille », l’accueil');
        await carteTient(page, '« Ta grille », l’accueil');
        const pages = await page.evaluate(() => ParcoursMoteur.pageCourante().pages);
        for (let k = 1; k < pages; k++) {
            await bulle(page).locator('.parcours-bulle-page-suiv').click();
            await carteTient(page, '« Ta grille », l’accueil, page ' + (k + 1));
        }
        await expect(pageLue(page)).toContainText('Étiquette, puis crée');
        await capture(page, DOSSIER, `i3-ta-grille-accueil-complement-${cap}`);

        // Conception › Grilles (« Composer ma grille ») : son texte, pas « colle-la ici » ; de retour, le texte validé.
        await page.locator('#materiel-accueil [data-action="materiel.taperMain"]').evaluate((b) => b.click());
        await expect(page.locator('#conception-grille-criteres')).toBeVisible();
        await expect.poll(() => texteDeLaCarte(page)).toContain('Ici, tu la composes à la main');
        const composer = await texteDeLaCarte(page);
        expect(composer).not.toContain('colle-la ici');
        expect(composer).not.toContain('Copie ton tableau');
        await carteTient(page, '« Ta grille », Conception › Grilles');
        await capture(page, DOSSIER, `i3-ta-grille-composer-${cap}`);
        await allerAuMateriel(page);
        await expect.poll(() => texteDeLaCarte(page)).toContain('colle-la ici');

        // Dans l'étiquetage : la carte passe aux trois étapes ; la ligne du geste suit le premier manque, comme avant.
        await coller(page, CAPTURE);
        await expect.poll(async () => norm(await pageLue(page).textContent())).toContain('1. Touche une étiquette dans la légende.');
        await gesteEst(page, 'Ta grille n’a pas encore de nom : prends « Titre », puis touche son nom dans ta grille.');
        await contourSur(page, etiquette('titre'));
        await flecheVers(page, etiquette('titre'), '« Ta grille », le nom');
        await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('1 sur 9');
        await pageSansConsignes(page, 'pendant le parcours');
        await aucunePhraseDeuxFois(page, '« Ta grille », l’étiquetage');
        await carteTient(page, '« Ta grille », l’étiquetage');
        await capture(page, DOSSIER, `i3-ta-grille-etiquetage-${cap}`);

        // « Plus tard » : le parcours attend ; l'interrupteur revient, et la carte de la page avec lui.
        await bulle(page).locator('.parcours-bulle-sortie').click();
        await expect(interrupteur(page)).toBeVisible();
        await expect(bascule(page)).toBeChecked();
        await carteDeLaPage(page);
        // La carte de la page n'a rien écrit dans la progression : « Évaluer » est en cours à l'étape 1, rien d'autre.
        expect(await page.evaluate(() => Object.keys(obtenirPreference('parcoursAssistance') || {}))).not.toContain('aide-materiel');
    });
}

// ---------------------------------------------------------------------------------------------------------------
// I4 — les deux boutons de l'exemple ; le brouillon survit ; l'exemple complet : la carte évite la lecture
// ---------------------------------------------------------------------------------------------------------------
for (const [L, H] of TAILLES) {
    test(`I4 · ${L} × ${H} : « Voir le travail complet », « Faire l’exercice soi-même », la sortie de l’exemple : le brouillon posé avant survit`, async ({ page }) => {
        test.setTimeout(180000);
        const cap = `${L}x${H}`;
        await ouvrir(page, L, H);
        await allerAuMateriel(page);
        await carteDeLaPage(page);

        // Les boutons de l'accueil ne nomment que le matériel.
        expect(await page.locator('#materiel-accueil .materiel-actions .btn').allTextContents())
            .toEqual(['Étiqueter le texte ci-dessus', 'Voir le travail complet', 'Faire l’exercice soi-même', 'Composer ma grille']);

        // Un brouillon de la personne, posé avant l'exemple : sa grille collée, une étiquette posée.
        await coller(page, CAPTURE);
        await poser(page, 'titre', ['Grille fictive d’analyse']);
        const B = (await lireDonnees(page)).brouillon;
        expect(B).toContain('Grille fictive d’analyse');
        const grilles = (await lireDonnees(page)).grilles;
        /** L'accueil, avec le brouillon de la personne en place (comme au retour d'une confirmation, ou dans le parcours). */
        const accueilAvecBrouillon = async () => {
            await page.evaluate(() => { window.materielDissection.fermer(); document.getElementById('materiel-accueil').classList.remove('u-hide'); });
            await expect(page.locator('#materiel-accueil')).toBeVisible();
            expect((await lireDonnees(page)).brouillon).toBe(B);
        };

        // « Voir le travail complet » : l'exemple étiqueté ; rien d'écrit.
        await accueilAvecBrouillon();
        await page.locator('#materiel-accueil [data-action="materiel.ouvrirExemple"][data-param="complet"]').evaluate((b) => b.click());
        await expect.poll(() => page.evaluate(() => {
            const e = window.materielDissection.etatCourant();
            return e.exemple === 'complet' && Object.keys(e.liens).length === e.morceaux.ordre.length;
        })).toBe(true);
        expect(await lireDonnees(page), '« Voir le travail complet » n’écrit rien').toEqual({ brouillon: B, grilles });
        await carteDeLaPage(page);
        await gesteEst(page, "Regarde chaque étiquette, puis la grille lue en dessous ; touche ensuite « Quitter l'exemple ».");
        // La lecture à l'écran : la carte ne la couvre pas (essai du 12 nov., capture de 11 h 00).
        await page.evaluate(() => {
            const r = document.querySelector('#materiel-dissection .dissection-resultat').getBoundingClientRect();
            window.scrollBy(0, r.top - (window.innerHeight - 320));
        });
        await deuxSondes(page);
        const lecture = await page.evaluate(() => {
            const r = document.querySelector('#materiel-dissection .dissection-resultat').getBoundingClientRect();
            return { haut: r.top, ih: innerHeight };
        });
        expect(lecture.haut, 'la lecture est à l’écran').toBeLessThan(lecture.ih);
        await bulleNeCouvrePas(page, '#materiel-dissection .dissection-resultat', 'l’exemple complet');
        await capture(page, DOSSIER, `i4-exemple-complet-lecture-${cap}`);

        // La sortie de l'exemple, dans la page : « Quitter l'exemple », sans confirmation ; la dissection de la personne revient.
        const sortie = page.locator('#materiel-dissection [data-action="materielDissection.collerAutre"]');
        await expect(sortie).toHaveText('Quitter l’exemple');
        await sortie.evaluate((b) => b.click());
        await expect.poll(() => page.evaluate(() => {
            const e = window.materielDissection.etatCourant();
            return !!e.doc && !e.exemple && Object.keys(e.liens).length;
        })).toBe(1);
        await expect(page.locator('#dissection-statut')).toHaveText('Dissection reprise telle que tu l’as laissée.');
        await expect(sortie).toHaveText('Coller une autre grille');
        expect(await lireDonnees(page), 'la sortie de l’exemple n’écrit rien').toEqual({ brouillon: B, grilles });

        // « Faire l'exercice soi-même » : l'exemple sans étiquettes ; une étiquette posée sur lui n'écrit rien non plus.
        await accueilAvecBrouillon();
        await page.locator('#materiel-accueil [data-action="materiel.ouvrirExemple"][data-param="exercice"]').evaluate((b) => b.click());
        await expect.poll(() => page.evaluate(() => {
            const e = window.materielDissection.etatCourant();
            return e.exemple === 'exercice' && Object.keys(e.liens).length === 0;
        })).toBe(true);
        await gesteEst(page, 'Ta grille n’a pas encore de nom : prends « Titre », puis touche son nom dans ta grille.');
        await contourSur(page, etiquette('titre'));
        await poser(page, 'titre', ['Journal de lecture']);
        expect(await lireDonnees(page), '« Faire l’exercice soi-même » n’écrit rien').toEqual({ brouillon: B, grilles });
        await expect(page.locator('[data-action="materielDissection.creer"]')).toHaveCount(0);
        await capture(page, DOSSIER, `i4-exercice-${cap}`);
        await sortie.evaluate((b) => b.click());
        await expect(page.locator('#dissection-statut')).toHaveText('Dissection reprise telle que tu l’as laissée.');
        expect(await lireDonnees(page)).toEqual({ brouillon: B, grilles });
        // L'exemple ne crée rien : l'interrupteur s'ouvrira encore ouvert.
        expect((await preference(page)) || {}).not.toHaveProperty('grilleCreee');
    });
}
