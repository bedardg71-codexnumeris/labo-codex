// =======================================================================
// LA CARTE D'AIDE DANS « APPORTER MON MATÉRIEL » (13 nov. 2026) — dans un vrai WebKit, à 1180 × 820 et à 820 × 1180
// =======================================================================
// Relais de la conversation du Projet, 12 nov., 19 h 15 (décision de Grégoire, 12 nov., 10 h 31 à 10 h 55) : les consignes
// de la page entrent dans la carte ; hors du parcours, la même carte est offerte par un interrupteur.
//   I1 · l'interrupteur : ÉTEINT à la première arrivée, sans que rien soit écrit ; allumé par la personne, la carte ;
//        éteint, ni carte ni consigne dans la page ; à l'arrivée suivante, l'état où elle l'a laissé ; le lien de sortie
//        de la carte l'éteint ; la carte n'est pas un parcours (absente de la liste, rien d'écrit dans la progression) ;
//   I2 · la carte de la page dans l'étiquetage : les trois étapes, la flèche et le halo sur l'étiquette à prendre, puis sur
//        le morceau ; un outil en main, sa phrase ; une grille créée par l'étiquetage n'écrit rien : seul un geste de
//        la personne compte ;
//   I5 · le stock : ce que retrouve une personne dont l'appareil porte déjà la clé, selon ce qu'elle contient ;
//   I3 · pendant un parcours : ni interrupteur ni carte de page ; « Ta grille » inchangée sauf le complément ; aucune
//        phrase deux fois ; la carte tient dans l'écran ; Conception › Grilles a son texte ; la carte de la page revient ;
//   I4 · les deux boutons de l'exemple : un brouillon posé avant survit à « Voir un exemple de grille étiquetée », à « Faire
//        l'exercice soi-même » et à la sortie de l'exemple ; l'exemple complet : la carte évite la lecture.
// LA RÈGLE DU 16 NOV. 2026 (demande de Grégoire, 15 h 48 ; plans de travail/CONSIGNE-2026-11-16-decouvrir-en-ligne.md)
// remplace celle du 12 nov. (ouvert à chaque arrivée tant qu'aucune grille n'était créée ; le cas des bancs,
// `navigator.webdriver`, est parti avec elle). Ce banc pose le choix de la vue étendue (sans lui, une application vide
// s'ouvre en vue simple) ; `allume: true` : la personne a laissé l'interrupteur allumé (I4, qui juge la carte).
// Break-tests : `plans de travail/RAPPORT-2026-11-13-carte-aide-materiel.md` ; celui de la règle du 16 nov. :
// `return lirePref().ouvert === true;` → `!== false` dans `aLArrivee` (js/materiel-aide.js) → I1, I2 et I5 ROUGES.
// Grilles FICTIVES ; noms fictifs.
import { test, expect } from '@playwright/test';
import { ouvrirEspaceVide, mettreLaClasseEnPlace, attendreEtape, contourSur, deuxSondes, bulle, bulleNeCouvrePas, capture } from './harness/classe-de-banc.js';
import { flecheVers, flecheVersMorceau } from './harness/fleches-de-banc.js';
import { attendreApplication } from './harness/attendre-application.js';
import { passerLOuverture, boutonExemple } from './harness/ouverture-evaluer.js';

const DOSSIER = process.env.CAPTURES_PARCOURS || '';
const TAILLES = [[1180, 820], [820, 1180]];
const TITRE = 'Ta grille, pas à pas';
const SORTIE = 'Fermer l’accompagnement';
const GESTE_ACCUEIL = "Colle ta grille, montre ce qu'est chaque partie, puis touche « Créer ma grille » ; ou touche « Composer ma grille ».";
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

async function ouvrir(page, L, H, { allume = false } = {}) {
    await page.addInitScript((oui) => {
        try { if (!localStorage.getItem('laboCodex.vue')) localStorage.setItem('laboCodex.vue', 'etendue'); } catch (e) { /* rien */ }
        try { if (oui && !localStorage.getItem('laboCodex.aideMateriel')) localStorage.setItem('laboCodex.aideMateriel', JSON.stringify({ ouvert: true })); } catch (e) { /* rien */ }
    }, allume);
    await ouvrirEspaceVide(page, L, { hauteur: H });
}

/** La personne allume l'interrupteur : la carte de la page s'ouvre. */
async function allumer(page) {
    await page.locator('.interrupteur-piste').click();
    await expect(page.locator('#materiel-aide-bascule')).toBeChecked();
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

/**
 * La place de l'interrupteur (Grégoire, 13 nov. 2026, 10 h 00 : « après le paragraphe, à droite ») : sous `dessus`, son
 * bord droit sur le sien, dans l'écran, et jamais sous la carte quand elle est ouverte.
 */
async function placeDeLInterrupteur(page, dessus, contexte) {
    const r = await page.evaluate(([d]) => {
        const b = (e) => { const x = e.getBoundingClientRect(); return { haut: x.top, bas: x.bottom, gauche: x.left, droite: x.right }; };
        const zone = document.getElementById('materiel-aide-interrupteur');
        const bulle = document.getElementById('parcours-bulle');
        const i = b(zone.querySelector('label.interrupteur')), u = bulle ? b(bulle) : null;
        return { i, dessus: b(document.querySelector(d)), bordDroit: b(document.querySelector(d)).droite,
            suit: zone.previousElementSibling === document.querySelector(d), carte: u, iw: document.documentElement.clientWidth, ih: innerHeight,
            sousLaCarte: !!u && !(i.droite <= u.gauche || u.droite <= i.gauche || i.bas <= u.haut || u.bas <= i.haut) };
    }, [dessus]);
    const dit = contexte + ' (' + JSON.stringify(r) + ')';
    expect(r.suit, dit + ' : l’interrupteur suit ' + dessus).toBe(true);
    expect(r.i.haut, dit + ' : sous ' + dessus).toBeGreaterThanOrEqual(r.dessus.bas - 1);
    // À droite : son bord droit sur celui du texte qu'il suit ; à l'accueil sur écran large, il s'arrête avant la place de la
    // carte (380 px à 8 px du bord).
    if (r.i.droite < r.bordDroit - 2) expect(r.i.droite, dit + ' : avant la place de la carte').toBeLessThanOrEqual(r.iw - 388);
    expect(r.i.droite, dit + ' : à droite').toBeLessThanOrEqual(r.bordDroit + 2);
    expect(r.i.droite, dit + ' : à droite, au-delà du milieu').toBeGreaterThan((r.dessus.gauche + r.dessus.droite) / 2);
    expect(r.i.gauche >= 0 && r.i.droite <= r.iw && r.i.haut >= 0 && r.i.bas <= r.ih, dit + ' : dans l’écran').toBe(true);
    expect(r.sousLaCarte, dit + ' : jamais sous la carte').toBe(false);
}

/** L'interrupteur sous le paragraphe ne pousse pas la zone de collage hors de l'écran. */
async function zoneDeCollageALEcran(page, contexte) {
    const r = await page.evaluate(() => { const z = document.getElementById('materiel-zone-collage').getBoundingClientRect(); return { haut: z.top, bas: z.bottom, ih: innerHeight }; });
    expect(r.haut >= 0 && r.bas <= r.ih, contexte + ' : la zone de collage entière à l’écran (' + JSON.stringify(r) + ')').toBe(true);
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
const CONSIGNES = ['Copie ton tableau', 'Colle-le ici', 'Étiquette, puis crée', 'Touche une étiquette dans la légende', 'Touche les parties de ta grille',
    'En bas, lis la grille', 'Pour en étiqueter plusieurs', 'touche l’endroit d’une partie', 'touche deux parties'];
async function pageSansConsignes(page, contexte) {
    const t = await lisibleDansLaPage(page);
    expect(CONSIGNES.filter((c) => t.includes(c)), contexte + ' : la page n’a pas de consignes à elle').toEqual([]);
}

// ---------------------------------------------------------------------------------------------------------------
// I1 — l'interrupteur
// ---------------------------------------------------------------------------------------------------------------
for (const [L, H] of TAILLES) {
    test(`I1 · ${L} × ${H} : l’interrupteur, éteint à la première arrivée ; allumé, la carte ; éteint, ni carte ni consigne ; l’état laissé à l’arrivée suivante ; la sortie de la carte l’éteint`, async ({ page }) => {
        const cap = `${L}x${H}`;
        await ouvrir(page, L, H);
        const avant = await progression(page);
        await allerAuMateriel(page);

        // ÉTEINT à la première arrivée : ni carte ni consigne, et arriver n'écrit rien.
        await expect(interrupteur(page)).toBeVisible();
        await expect(page.locator('.interrupteur-libelle')).toHaveText('M’accompagner pour étiqueter ma grille');
        await expect(bascule(page)).not.toBeChecked();
        await aucuneCarte(page);
        await pageSansConsignes(page, 'à la première arrivée');
        expect(await preference(page), 'arriver dans la page n’écrit rien').toBeNull();
        // Allumé par la personne : la carte de la page, qui n'est pas un parcours ; son geste est retenu.
        await allumer(page);
        await carteDeLaPage(page);
        expect(await preference(page)).toEqual({ ouvert: true });
        const cible = await page.locator('label.interrupteur').boundingBox();
        expect(cible.height, 'la cible tactile de l’interrupteur').toBeGreaterThanOrEqual(44);
        // Sa place (Grégoire, 13 nov., 10 h 00) : après le paragraphe, à droite ; la zone de collage reste à l'écran.
        await placeDeLInterrupteur(page, '#materiel-accueil .materiel-intro', 'l’accueil, ouvert');
        await zoneDeCollageALEcran(page, 'l’accueil, ouvert');

        // L'accueil : ses trois cartes sont dans la carte, mot pour mot, plus dans la page.
        await expect(page.locator('#conception-materiel .materiel-etapes')).toHaveCount(0);
        const texte = await texteDeLaCarte(page);
        for (const mots of ['Copie ton tableau Ouvre ta grille dans son fichier d’origine (Word, Pages ou un autre traitement de texte)',
            'Colle-le ici Ta grille s’affiche telle quelle, chaque ligne de chaque case devenue une partie.',
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
        await placeDeLInterrupteur(page, '#materiel-accueil .materiel-intro', 'l’accueil, fermé');
        await zoneDeCollageALEcran(page, 'l’accueil, fermé');
        await capture(page, DOSSIER, `i1-accueil-ferme-${cap}`);
        await coller(page, CAPTURE);
        await aucuneCarte(page);
        await expect(page.locator('#dissection-statut')).toHaveText('Tableau collé : 4 rangées, 10 parties.');
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

        // À l'arrivée suivante : éteint, comme la personne l'a laissé (la règle du 12 nov. le rouvrait).
        await allerAilleurs(page);
        await aucuneCarte(page);
        await allerAuMateriel(page);
        await expect(bascule(page)).not.toBeChecked();
        await aucuneCarte(page);
        expect(await preference(page)).toEqual({ ouvert: false });
        // Rallumé, puis une autre page et le retour : allumé, comme laissé ; la carte revient.
        await allumer(page);
        await carteDeLaPage(page);
        await allerAilleurs(page);
        await aucuneCarte(page);
        await allerAuMateriel(page);
        await expect(bascule(page)).toBeChecked();
        await carteDeLaPage(page);

        // Le lien de sortie de la carte éteint l'interrupteur : les deux ne se contredisent jamais, et ce geste est retenu.
        await bulle(page).locator('.parcours-bulle-sortie').click();
        await aucuneCarte(page);
        await expect(bascule(page)).not.toBeChecked();
        await expect(interrupteur(page)).toBeVisible();
        expect(await preference(page)).toEqual({ ouvert: false });
        await allerAilleurs(page);
        await allerAuMateriel(page);
        await expect(bascule(page)).not.toBeChecked();
        // Rallumé par l'interrupteur : la carte revient.
        await allumer(page);
        await carteDeLaPage(page);

        // Pas un parcours : absente de la liste, rien d'écrit dans la progression ni la reprise.
        expect(await page.evaluate(() => Assistance.parcours().map((p) => p.id))).not.toContain('aide-materiel');
        expect(await progression(page)).toEqual(avant);
        expect(await preference(page)).toEqual({ ouvert: true });
    });
}

// ---------------------------------------------------------------------------------------------------------------
// I2 — la carte de la page dans l'étiquetage ; une grille créée par l'étiquetage
// ---------------------------------------------------------------------------------------------------------------
for (const [L, H] of TAILLES) {
    test(`I2 · ${L} × ${H} : la carte dans l’étiquetage (étapes, flèche, halo, outil) ; une grille créée n’écrit rien, l’interrupteur garde l’état laissé`, async ({ page }) => {
        test.setTimeout(180000);
        const cap = `${L}x${H}`;
        await ouvrir(page, L, H);
        // Un trimestre, pour que « Créer ma grille » ait où ranger la grille.
        await page.evaluate(() => { db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]); db.setSync('trimestreActif', 'a2032'); });
        await page.reload();
        await attendreApplication(page);
        const avant = await progression(page);
        await allerAuMateriel(page);
        await aucuneCarte(page);   // éteint à la première arrivée
        await allumer(page);
        await carteDeLaPage(page);
        await coller(page, CAPTURE);

        // Les trois étapes de l'étiquetage, mot pour mot (à la souris : « glisse dessus »), sur la page que montre la carte.
        await carteDeLaPage(page);
        await expect.poll(async () => norm(await pageLue(page).textContent()), { message: 'la carte passe aux étapes de l’étiquetage' })
            .toBe('1. Touche une étiquette dans la légende. 2. Touche les parties de ta grille qu’elle désigne : elles prennent sa couleur. '
                + 'Pour en étiqueter plusieurs d’un coup, glisse dessus. Touche une partie déjà étiquetée pour retirer son étiquette. '
                + '3. En bas, lis la grille que l’application en tirerait, puis crée-la.');
        await pageSansConsignes(page, 'ouvert, dans l’étiquetage');
        // Dans l'étiquetage : sous l'en-tête, à droite, jamais sous la carte.
        await placeDeLInterrupteur(page, '#materiel-dissection .dissection-tete', 'l’étiquetage, ouvert');
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
        // 13 nov. 2026 : après un étiquetage dans la colonne de droite, « Introduction » n'est plus ramené dans le canevas.
        await flecheVersMorceau(page, await morceau(page, 'Introduction'), 'le morceau');
        await capture(page, DOSSIER, `i2-etiquette-a-prendre-${cap}`);
        await page.locator(etiquette('critere')).evaluate((b) => b.click());
        await contourSur(page, await morceau(page, 'Introduction'));
        await toucher(page, 'Introduction');
        await gesteEst(page, '« / 30 » n’a aucun critère dans sa rangée : prends « Critère », puis touche « Développement ».');

        // Un outil en main : sa phrase, dans la carte ; dans la page, le fait seulement.
        await page.locator(etiquette('couper')).evaluate((b) => b.click());
        await expect.poll(async () => norm(await pageLue(page).textContent()))
            .toBe('Outil « Couper » : touche l’endroit d’une partie où la séparer en deux. La coupe tombe entre deux mots.');
        await expect(page.locator('#dissection-statut')).toHaveText('Outil « Couper » en main.');
        await pageSansConsignes(page, '« Couper » en main');
        await capture(page, DOSSIER, `i2-couper-${cap}`);
        await page.locator(etiquette('rattacher')).evaluate((b) => b.click());
        await expect.poll(async () => norm(await pageLue(page).textContent())).toContain('Outil « Rattacher » : touche deux parties d’un même texte');
        await page.keyboard.press('Escape');   // Échap pose l'outil : la carte reste (elle ne se ferme que par son lien)
        await expect(page.locator('#dissection-terminer')).toBeHidden();
        await carteDeLaPage(page);
        await expect.poll(async () => norm(await pageLue(page).textContent())).toContain('1. Touche une étiquette dans la légende.');

        // La grille prête ; l'interrupteur éteint par la personne, puis « Créer ma grille » : créer n'écrit rien.
        await poser(page, 'critere', ['Développement', 'Conclusion']);
        await gesteEst(page, 'Ta grille est prête : touche « Créer ma grille ».');
        await contourSur(page, '[data-action="materielDissection.creer"]');
        await bascule(page).evaluate((b) => b.click());
        await aucuneCarte(page);
        expect(await preference(page)).toEqual({ ouvert: false });
        await page.locator('[data-action="materielDissection.creer"]').click();
        await expect(page.locator('#materiel-titre-cree')).toBeVisible();
        expect(await preference(page), 'une grille créée n’écrit rien dans la préférence').toEqual({ ouvert: false });
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
        expect(await preference(page)).toEqual({ ouvert: true });
        expect(await progression(page)).toEqual(avant);
    });
}

// ---------------------------------------------------------------------------------------------------------------
// I5 — le stock : la clé écrite sous la règle du 12 nov. ({ grilleCreee, ouvert }), telle qu'elle est chez quelqu'un
// ---------------------------------------------------------------------------------------------------------------
test('I5 · le stock : `ouvert: false` → éteint ; `ouvert: true` → allumé ; `grilleCreee` seul → éteint ; rien n’est écrit à l’arrivée, `grilleCreee` part au premier geste', async ({ page }) => {
    await ouvrir(page, 1180, 820);
    const arriverAvec = async (cle) => {
        await allerAilleurs(page);
        await page.evaluate((v) => { if (v === null) localStorage.removeItem('laboCodex.aideMateriel'); else localStorage.setItem('laboCodex.aideMateriel', JSON.stringify(v)); }, cle);
        await allerAuMateriel(page);
        await expect(interrupteur(page)).toBeVisible();
        expect(await preference(page), 'arriver ne récrit pas la clé').toEqual(cle);
    };
    await allerAuMateriel(page);
    for (const [cle, allume] of [[{ grilleCreee: true, ouvert: false }, false], [{ ouvert: false }, false], [{ grilleCreee: true }, false], [{}, false], [null, false],
        [{ ouvert: true }, true], [{ grilleCreee: true, ouvert: true }, true]]) {
        await arriverAvec(cle);
        if (allume) { await expect(bascule(page), JSON.stringify(cle)).toBeChecked(); await carteDeLaPage(page); }
        else { await expect(bascule(page), JSON.stringify(cle)).not.toBeChecked(); await aucuneCarte(page); }
    }
    // Le premier geste de la personne écrit son choix, et lui seul : `grilleCreee`, qui n'est plus lu, part alors.
    await page.locator('.interrupteur-piste').click();
    await expect(bascule(page)).not.toBeChecked();
    expect(await preference(page)).toEqual({ ouvert: false });
});

// ---------------------------------------------------------------------------------------------------------------
// I3 — pendant un parcours ; « Ta grille », inchangée sauf le complément
// ---------------------------------------------------------------------------------------------------------------
for (const [L, H] of TAILLES) {
    test(`I3 · ${L} × ${H} : pendant un parcours, ni interrupteur ni carte de page ; « Ta grille » et son complément ; Conception › Grilles a son texte`, async ({ page }) => {
        test.setTimeout(240000);
        const cap = `${L}x${H}`;
        // La personne a laissé l'interrupteur allumé (ici, la clé telle que la règle du 12 nov. l'écrivait : le stock).
        // La règle de l'arrivée est jugée en I1, I2 et I5.
        await ouvrirEspaceVide(page, L, { hauteur: H });
        await page.evaluate(() => localStorage.setItem('laboCodex.aideMateriel', JSON.stringify({ grilleCreee: true, ouvert: true })));
        await mettreLaClasseEnPlace(page);
        await allerAuMateriel(page);
        await expect(bascule(page)).toBeChecked();
        await carteDeLaPage(page);

        // Un parcours se lance : la carte de la page se ferme, l'interrupteur ne se montre pas.
        await page.evaluate(() => Assistance.parcours().find((p) => p.id === 'evaluer').lancer(0));
        await passerLOuverture(page);   // 14 nov. 2026 : deux bulles d'ouverture avant « Ta grille »
        await expect(interrupteur(page)).toBeHidden();
        expect(await page.evaluate(() => ParcoursMoteur.joue(MaterielAide.definition()))).toBe(false);

        // « Ta grille », devant l'accueil. 14 nov. 2026 (essai novice, lot 4c) : la bulle est une liste de lignes, en une
        // page ; elle ne réexplique plus ce que la page dit (ni le texte long, ni les trois cartes de l'accueil), ne porte
        // plus de bouton, et montre la zone où coller.
        await contourSur(page, '#materiel-zone-collage');
        await expect(interrupteur(page)).toBeHidden();
        await expect(bulle(page).locator('.parcours-bulle-texte')).toBeHidden();
        await expect(bulle(page).locator('.parcours-bulle-nav')).toBeHidden();
        await expect(bulle(page).locator('.parcours-bulle-boutons')).toHaveCount(0);
        await expect(bulle(page).locator('.parcours-bulle-ligne')).toHaveText([
            'Colle ici la grille que tu utilises déjà (copie le tableau entier, depuis Word ou Pages)',
            'Pas de grille sous la main ? Ces deux boutons ouvrent un exemple',
            'Colle ta grille, ou touche un des deux boutons']);
        await carteTient(page, '« Ta grille », l’accueil');
        await capture(page, DOSSIER, `i3-ta-grille-accueil-${cap}`);

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
        await expect(bulle(page).locator('.parcours-bulle-ligne').first()).toContainText('Colle ici la grille');

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
    test(`I4 · ${L} × ${H} : « Voir un exemple de grille étiquetée », « Étiqueter l’exemple moi-même », la sortie de l’exemple : le brouillon posé avant survit`, async ({ page }) => {
        test.setTimeout(180000);
        const cap = `${L}x${H}`;
        await ouvrir(page, L, H, { allume: true });
        await allerAuMateriel(page);
        await carteDeLaPage(page);

        // Les boutons de l'accueil ne nomment que le matériel.
        expect(await page.locator('#materiel-accueil .materiel-actions .btn').allTextContents())
            .toEqual(['Étiqueter le texte ci-dessus', 'Voir un exemple de grille étiquetée', 'Étiqueter l’exemple moi-même', 'Composer ma grille']);   // renommés le 14 nov. 2026

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

        // « Voir un exemple de grille étiquetée » : l'exemple étiqueté ; rien d'écrit.
        await accueilAvecBrouillon();
        await page.locator('#materiel-accueil [data-action="materiel.ouvrirExemple"][data-param="complet"]').evaluate((b) => b.click());
        await expect.poll(() => page.evaluate(() => {
            const e = window.materielDissection.etatCourant();
            return e.exemple === 'complet' && Object.keys(e.liens).length === e.morceaux.ordre.length;
        })).toBe(true);
        expect(await lireDonnees(page), '« Voir un exemple de grille étiquetée » n’écrit rien').toEqual({ brouillon: B, grilles });
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

        // « Étiqueter l'exemple moi-même » : l'exemple sans étiquettes ; une étiquette posée sur lui n'écrit rien non plus.
        await accueilAvecBrouillon();
        await page.locator('#materiel-accueil [data-action="materiel.ouvrirExemple"][data-param="exercice"]').evaluate((b) => b.click());
        await expect.poll(() => page.evaluate(() => {
            const e = window.materielDissection.etatCourant();
            return e.exemple === 'exercice' && Object.keys(e.liens).length === 0;
        })).toBe(true);
        await gesteEst(page, 'Ta grille n’a pas encore de nom : prends « Titre », puis touche son nom dans ta grille.');
        await contourSur(page, etiquette('titre'));
        await poser(page, 'titre', ['Journal de lecture']);
        expect(await lireDonnees(page), '« Étiqueter l’exemple moi-même » n’écrit rien').toEqual({ brouillon: B, grilles });
        await expect(page.locator('[data-action="materielDissection.creer"]')).toHaveCount(0);
        await capture(page, DOSSIER, `i4-exercice-${cap}`);
        await sortie.evaluate((b) => b.click());
        await expect(page.locator('#dissection-statut')).toHaveText('Dissection reprise telle que tu l’as laissée.');
        expect(await lireDonnees(page)).toEqual({ brouillon: B, grilles });
        // L'exemple n'écrit rien non plus dans la préférence de l'interrupteur : elle est telle que la personne l'a laissée.
        expect(await preference(page)).toEqual({ ouvert: true });
    });
}
