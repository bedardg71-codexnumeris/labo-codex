import { test, expect } from '@playwright/test';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';
import { flecheVers } from './harness/fleches-de-banc.js';

// =======================================================================
// LOT « LES PARCOURS EN DEUX TEMPS », PREMIÈRE PARTIE (12 NOVEMBRE 2026)
// =======================================================================
// Mandat du 12 nov. 2026, 8 h 20 (décisions de Grégoire des 11 et 12 nov.) : un parcours se fait d'abord dans la
// démo, avec le matériel fourni (la modélisation : la personne fait elle-même chaque geste), puis sur ses vraies
// données. Ce banc juge, en faisant les gestes eux-mêmes :
//   · le panneau : le texte en quatre temps, le choix du matériel (qui se souvient, sur l'appareil), la carte d'un
//     parcours sans modélisation, « Remettre la démo à neuf » ;
//   · la modélisation de « Mettre ta classe en place », de bout en bout dans la démo, un geste à la fois, la
//     pulsation et une flèche sur chaque geste ;
//   · LE CONFINEMENT : un trimestre réel peuplé au départ, toutes les clés hors de la démo sont identiques avant
//     l'entrée et après la sortie ; ce qui a été créé reste dans la démo ;
//   · « Refaire avec mon matériel » referme la démo et relance le parcours sur les vraies données ;
//   · la remise à neuf rend la démo du pack et laisse les autres clés identiques.
// L'apparence se juge sur capture : CAPTURES_PARCOURS=<dossier> npx playwright test deux-temps-modelisation
// ⚠ Cloud du 12 nov. : ce banc a tourné sous Chromium (playwright.chromium.config.js) ; le verdict WebKit se prend
// sur le Mac.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
const HORLOGE = new Date('2026-11-10T14:00:00.000Z');
const CAPTURES = process.env.CAPTURES_PARCOURS || '';

// Le texte du panneau, VALIDÉ par Grégoire mot pour mot (mandat du 12 nov. 2026).
const QUATRE_TEMPS = [
    "Apprendre l'application, en quatre temps. Passe de l'un à l'autre à ton rythme.",
    "Découvrir par toi-même. Explore la démo : un groupe de dix étudiant·es fictif·ves t'y attend, avec ses productions, ses évaluations et ses présences.",
    "Regarder un modèle. Dans la démo, un parcours te montre, geste par geste, comment se crée le matériel et ce qu'il donne. C'est toi qui fais les gestes, avec le matériel fourni.",
    'Mettre en pratique. Refais le parcours avec ta vraie liste, ton vrai cours, tes vraies activités.',
    "Continuer en autonomie. Bâtis ton propre parcours, partage ton matériel, pose tes hypothèses. L'aide dans les pages reste là au besoin."
];
const sansInsecable = (t) => t.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

// Les dix totems du pack (js/pack-demo-10.js) : la liste fournie n'en reprend aucun.
const TOTEMS_DU_PACK = ['Castor', 'Mésange', 'Hérisson', 'Bernache', 'Vigogne', 'Suricate', 'Condor', 'Grue', 'Gazelle', 'Panda',
    'Jovial', 'Joyeuse', 'Chaleureux', 'Fidèle', 'Fière', 'Loyal', 'Courageux', 'Gracieuse', 'Intrépide', 'Serein'];

async function capture(page, nom) {
    if (!CAPTURES) return;
    fs.mkdirSync(CAPTURES, { recursive: true });
    await page.evaluate(() => document.querySelectorAll('.notifications-pile > *').forEach((n) => n.remove()));
    await page.waitForFunction(() => document.getAnimations()
        .filter((a) => a.effect && a.effect.target && a.effect.target.closest
            && a.effect.target.closest('#panneau-assistance, #parcours-bulle, #entete-menu-panneau, .accordeon'))
        .every((a) => a.playState !== 'running'));
    await page.screenshot({ path: path.join(CAPTURES, nom + '.png') });
}

async function ouvrirEspaceVide(page, largeur = 1180, hauteur = 900) {
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

async function ouvrirPanneau(page) {
    await page.click('#entete-menu-bouton');
    await page.click('#btn-assistance-menu');
    await expect(page.locator('#panneau-assistance')).toBeVisible();
}

/** Le panneau ouvert, « Matériel de la démo » choisi (sous un banc piloté, le défaut est « Mon matériel »). */
async function ouvrirPanneauSurLaDemo(page) {
    await ouvrirPanneau(page);
    await page.locator('#assistance-materiel [data-materiel="demo"]').click();
    await expect(page.locator('#assistance-demo-neuf')).toBeVisible();
}

const bulle = (page) => page.locator('#parcours-bulle');
const carte = (page, id) => page.locator(`#panneau-assistance [data-parcours="${id}"]`);
const enDemo = (page) => page.evaluate(() => estEnModeDemo());

async function attendreEtape(page, n, total, titre) {
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(n + ' sur ' + total, { timeout: 10000 });
    if (titre) await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(titre);
}

/** La pulsation (« ce que tu toucheras ») est posée sur l'élément. */
async function contourSur(page, selecteur, idContour = 'parcours-contour') {
    await expect.poll(() => page.evaluate(([sel, id]) => {
        const c = document.getElementById(id);
        const el = document.querySelector(sel);
        if (!c || c.hidden || !el) return 'absent';
        const a = c.getBoundingClientRect(), b = el.getBoundingClientRect();
        const dx = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
        const dy = Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2);
        return dx < 3 && dy < 3 ? 'posé' : 'décalé de ' + Math.round(dx) + ', ' + Math.round(dy);
    }, [selecteur, idContour]), { message: 'pulsation posée sur ' + selecteur, timeout: 5000 }).toBe('posé');
}

/** Un geste : la pulsation ET une flèche sur ce qu'il faut toucher. */
async function gesteDesigne(page, selecteur, contexte) {
    await contourSur(page, selecteur);
    await flecheVers(page, selecteur, contexte);
}

/** Toutes les clés, telles qu'elles sont en base (db) et dans le stockage du navigateur. */
async function releve(page) {
    return page.evaluate(async () => {
        await db.flush();
        const o = {};
        for (const k of await db.keys()) o['db:' + k] = JSON.stringify(await db.get(k, null));
        for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o['ls:' + k] = localStorage.getItem(k); }
        return o;
    });
}
const DE_LA_DEMO = /^(db|ls):demo_/;
// Hors des données : le choix du matériel et l'état des modélisations, sur l'appareil (comme `laboCodex.vue`).
const DE_L_APPAREIL = /^ls:laboCodex\.assistance$/;
function ecarts(a, b, garder) {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(garder).filter((k) => a[k] !== b[k]).sort()
        .map((k) => `${k} : ${(a[k] ?? '∅').slice(0, 90)} → ${(b[k] ?? '∅').slice(0, 90)}`);
}
const horsDeLaDemo = (k) => !DE_LA_DEMO.test(k) && !DE_L_APPAREIL.test(k);

// ---------- Un trimestre réel peuplé (le cas de Grégoire), par les formulaires du Cadre ----------

async function ouvrirBloc(page, accordeon, nouveau) {
    await page.evaluate(() => naviguerVers('calendrier', 'trimestre'));
    await page.evaluate(async ([a, n]) => {
        const el = document.getElementById(a);
        if (el.classList.contains('ferme')) toggleAccordeonV2(el.querySelector('.accordeon-header'));
        if (n) await window[n]();
    }, [accordeon, nouveau]);
}

async function peuplerUnTrimestreReel(page) {
    await ouvrirBloc(page, 'accordeon-gestion-trimestres', null);
    await page.fill('#v2-nomTrimestre', 'Automne 2026');
    await page.selectOption('#v2-sessionTrimestre', 'automne');
    await page.fill('#v2-anneeTrimestre', '2026');
    await page.fill('#v2-debutTrimestre', '2026-08-24');
    await page.fill('#v2-finCours', '2026-12-11');
    await page.fill('#v2-finTrimestre', '2026-12-21');
    await page.click('#v2-btnCreerTrimestre');
    await expect.poll(() => page.evaluate(() => db.getSync('trimestreActif', null))).toBe('a2026');
    await ouvrirBloc(page, 'accordeon-cours', 'nouveauCoursV2');
    await page.fill('#v2-codeCours', '601-101-MQ');
    await page.fill('#v2-nomCours', 'Écriture et littérature');
    await page.selectOption('#v2-disciplineCours', '601 Français (langue et littérature)');
    await page.fill('#v2-ponderation', '2-2-3');
    await page.click('#v2-btnCreerCours');
    await expect.poll(() => page.evaluate(() => (db.getSync('cours', []) || []).length)).toBe(1);
    await ouvrirBloc(page, 'accordeon-enseignant', 'nouveauProfilEnseignantV2');
    await page.fill('#v2-ens-prenom', 'Camille');
    await page.fill('#v2-ens-nom', 'Fictive');
    await page.fill('#v2-ens-courriel', 'camille@exemple.org');
    await page.fill('#v2-ens-institution', 'Cégep imaginaire');
    await page.click('#v2-btnCreerEnseignant');
    await expect.poll(() => page.evaluate(() => (db.getSync('enseignants', []) || []).length)).toBe(1);
    await ouvrirBloc(page, 'accordeon-groupe-etudiants', null);
    await page.fill('#v2-donneesCollees', ['2390001\t00001\tAlpaga\tAlix', '2390002\t00001\tBaobab\tBasile', '2390003\t00001\tCormoran\tCléo'].join('\n'));
    await page.click('#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]');
    await page.click('#v2-btnConfirmerImport');
    await expect.poll(() => page.evaluate(() => (db.getSync(cle('groupeEtudiants'), []) || []).length)).toBe(3);
    await ouvrirBloc(page, 'accordeon-horaire', 'nouveauHoraireV2');
    await page.selectOption('#v2-hor-groupeAssocie', '00001');
    await page.fill('#v2-hor-nom', 'Jeudi matin');
    await page.selectOption('#v2-hor-nbSeances', '1');
    await page.selectOption('#v2-hor-seance-0-jour', 'Jeudi');
    await page.fill('#v2-hor-seance-0-debut', '08:00');
    await page.fill('#v2-hor-seance-0-fin', '12:00');
    await page.fill('#v2-hor-seance-0-periodes', '4');
    await page.click('#v2-btnCreerHoraire');
    await expect.poll(() => page.evaluate(() => (db.getSync(cle('horaires'), []) || []).length)).toBe(1);
    await ouvrirBloc(page, 'accordeon-groupe-cours', 'nouveauGroupeCoursV2');
    for (const id of ['v2-gc-trimestre', 'v2-gc-cours', 'v2-gc-groupe', 'v2-gc-horaire', 'v2-gc-enseignant']) {
        const valeur = await page.evaluate((i) => [...document.querySelectorAll('#' + i + ' option')]
            .filter((o) => o.value && !o.disabled).map((o) => o.value)[0], id);
        if (!(await page.inputValue('#' + id))) await page.selectOption('#' + id, valeur);
    }
    await page.click('#v2-btnCreerGroupeCours');
    await expect.poll(() => page.evaluate(() => (db.getSync('groupeCoursActif', null) || {}).trimestreId)).toBe('a2026');
    // Une séance saisie et verrouillée : des présences réelles, que la démo ne doit pas toucher.
    await page.evaluate(() => naviguerVers('suivi', 'saisie'));
    await expect(page.locator('#btnVerrouillerSaisiePresences')).toBeVisible();
    await page.click('#btnVerrouillerSaisiePresences');
    await page.reload();
    await attendreApplication(page);
}

// ---------- Les gestes de la modélisation, avec le matériel fourni ----------

const materiel = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.ParcoursClasse.materiel)));
const optionDont = (page, select, texte) => page.evaluate(([s, t]) => {
    const o = [...document.querySelectorAll(s + ' option')].find((x) => x.textContent.includes(t) && !x.disabled);
    return o ? o.value : null;
}, [select, texte]);

/** La modélisation, de sa première étape à la bande d'assiduité ; chaque geste est jugé avant d'être fait. */
const TOTAL = 8;
async function faireLaModelisation(page, { capturer = '' } = {}) {
    const m = await materiel(page);

    // 1. Un cours.
    await attendreEtape(page, 1, TOTAL, 'Un cours');
    expect(await enDemo(page)).toBe(true);
    await gesteDesigne(page, '#v2-btnCreerCours', 'étape 1');
    await flecheVers(page, '#v2-codeCours', 'étape 1, un champ obligatoire encore vide');
    await capture(page, 'modele-1-' + capturer);
    for (const morceau of [m.cours.code, m.cours.nom, m.cours.ponderation]) await expect(bulle(page)).toContainText(morceau);
    await page.fill('#v2-codeCours', m.cours.code);
    await page.fill('#v2-nomCours', m.cours.nom);
    await page.selectOption('#v2-disciplineCours', m.cours.discipline);
    await page.fill('#v2-ponderation', m.cours.ponderation);
    await page.click('#v2-btnCreerCours');

    // 2. La liste : « Copier la liste », coller (le vrai geste, au clavier), rattacher, prévisualiser, confirmer.
    await attendreEtape(page, 2, TOTAL, "Une liste d'étudiant·es");
    await gesteDesigne(page, '#v2-donneesCollees', 'étape 2, le champ où coller');
    await capture(page, 'modele-2-' + capturer);
    await bulle(page).getByRole('button', { name: 'Copier la liste' }).click();
    await page.focus('#v2-donneesCollees');
    await page.keyboard.press('ControlOrMeta+V');
    await expect.poll(() => page.inputValue('#v2-donneesCollees')).toContain('9900001\t' + m.groupe + '\tCâlin\tKoala');
    const liste = await page.inputValue('#v2-donneesCollees');
    expect(liste.split('\n')).toHaveLength(8);
    await gesteDesigne(page, '#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]', 'étape 2, « Prévisualiser »');
    await page.click('#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]');

    // 3. Le cours de la liste : l'aperçu propose le cours actif (celui de la démo) ; le menu, puis le bouton qui importe.
    await attendreEtape(page, 3, TOTAL, 'Le cours de la liste');
    await gesteDesigne(page, '#v2-importCoursCible', 'étape 3, le menu du cours');
    await capture(page, 'modele-3-' + capturer);
    // « Annuler » referme l'aperçu : la bulle le dit et montre « Prévisualiser » ; rien n'est importé.
    await page.click('#accordeon-groupe-etudiants [data-action="annulerImportV2"]');
    await expect(bulle(page).locator('.parcours-bulle-avis')).toContainText('touche « Prévisualiser »'.replace(/« /, '«\u00a0').replace(/ »/, '\u00a0»'));
    await contourSur(page, '#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]');
    await page.fill('#v2-donneesCollees', liste);
    await page.click('#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]');
    await contourSur(page, '#v2-importCoursCible');
    await page.selectOption('#v2-importCoursCible', await optionDont(page, '#v2-importCoursCible', m.cours.code));
    await gesteDesigne(page, '#v2-btnConfirmerImport', 'étape 3, le bouton qui importe');
    await expect(page.locator('#v2-btnConfirmerImport')).toHaveText('Importer 8 étudiant·es');
    await page.click('#v2-btnConfirmerImport');

    // 4. Un horaire.
    await attendreEtape(page, 4, TOTAL, 'Un horaire');
    await gesteDesigne(page, '#v2-btnCreerHoraire', 'étape 4');
    await capture(page, 'modele-4-' + capturer);
    await page.selectOption('#v2-hor-groupeAssocie', await optionDont(page, '#v2-hor-groupeAssocie', m.groupe));
    await page.fill('#v2-hor-nom', m.horaire.nom);
    await page.selectOption('#v2-hor-nbSeances', '1');
    await page.selectOption('#v2-hor-seance-0-jour', m.horaire.jour);
    await page.fill('#v2-hor-seance-0-debut', m.horaire.debut);
    await page.fill('#v2-hor-seance-0-fin', m.horaire.fin);
    await page.fill('#v2-hor-seance-0-periodes', String(m.horaire.periodes));
    await page.click('#v2-btnCreerHoraire');

    // 5. Un groupe-cours : les cinq morceaux, nommés par la bulle.
    await attendreEtape(page, 5, TOTAL, 'Un groupe-cours');
    await gesteDesigne(page, '#v2-btnCreerGroupeCours', 'étape 5');
    await capture(page, 'modele-5-' + capturer);
    for (const [id, texte] of [['v2-gc-trimestre', 'Démonstration'], ['v2-gc-cours', m.cours.code], ['v2-gc-groupe', m.groupe],
        ['v2-gc-horaire', m.horaire.nom], ['v2-gc-enseignant', 'Primo Primavera']]) {
        const valeur = await optionDont(page, '#' + id, texte);
        expect(valeur, `${id} offre « ${texte} »`).toBeTruthy();
        await page.selectOption('#' + id, valeur);
    }
    await page.click('#v2-btnCreerGroupeCours');

    // 6. D'un groupe à l'autre : le menu de l'en-tête.
    await attendreEtape(page, 6, TOTAL, "D'un groupe à l'autre");
    await gesteDesigne(page, '#selectGroupeCoursHeader', 'étape 6');
    await capture(page, 'modele-6-' + capturer);
    await page.selectOption('#selectGroupeCoursHeader', await optionDont(page, '#selectGroupeCoursHeader', m.cours.code));

    // 7. Un premier cours : les huit de la liste, une absence, « Verrouiller la saisie ».
    await attendreEtape(page, 7, TOTAL, 'Un premier cours');
    await expect(page.locator('#tbody-saisie-presences tr')).toHaveCount(8);
    await expect(page.locator('#tbody-saisie-presences')).toContainText('Koala');
    // La saisie garde la date du groupe d'avant (un mercredi) : la bulle le dit et montre « Précédent ».
    expect(await page.inputValue('#date-cours')).toBe('2025-12-10');
    await expect(bulle(page).locator('.parcours-bulle-avis')).toContainText("ce groupe n'a pas cours");
    await gesteDesigne(page, '#suivi-saisie .d-flex-gap8-center button:first-of-type', 'étape 7, « Précédent »');
    await capture(page, 'modele-7-precedent-' + capturer);
    await page.click('#suivi-saisie .d-flex-gap8-center button:first-of-type');
    await expect(page.locator('#date-cours')).toHaveValue('2025-12-09');
    await expect(bulle(page).locator('.parcours-bulle-avis')).toHaveCount(0);
    await gesteDesigne(page, '#btnVerrouillerSaisiePresences', 'étape 7, « Verrouiller la saisie »');
    await contourSur(page, '#date-cours', 'parcours-contour-date');
    await capture(page, 'modele-7-' + capturer);
    await page.locator('#tbody-saisie-presences .input-periodes').first().fill('0');
    await page.locator('#tbody-saisie-presences .input-periodes').first().dispatchEvent('change');
    await page.click('#btnVerrouillerSaisiePresences');

    // 8. La bande d'assiduité du groupe créé, et les deux boutons.
    await attendreEtape(page, 8, TOTAL, "Le groupe d'un coup d'œil");
    await expect(page.locator('#suivi-groupe')).toBeVisible();
    await page.evaluate(() => {
        const bloc = document.querySelector('#section-suivi h4[data-tooltip="tdb-assiduite"]').parentElement;
        (bloc.querySelector('.barre-indicateur') || bloc).setAttribute('data-banc', 'bande-assiduite');
    });
    await flecheVers(page, '[data-banc="bande-assiduite"]', 'étape 8, la bande');
    await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
    await capture(page, 'modele-8-' + capturer);
}

// ---------- Les bancs ----------

test('le panneau : le texte en quatre temps, le choix du matériel qui se souvient, la carte sans modélisation, « Remettre la démo à neuf »', async ({ page }) => {
    // Sous un banc (`navigator.webdriver`), le matériel par défaut est « Mon matériel » et la vue est étendue, pour ne
    // pas déplacer les autres bancs. Ce banc éteint le drapeau pour éprouver le vrai défaut, et garde la vue étendue.
    await page.addInitScript(() => {
        Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false });
        try { if (!localStorage.getItem('laboCodex.vue')) localStorage.setItem('laboCodex.vue', 'etendue'); } catch (e) { /* rien */ }
    });
    await ouvrirEspaceVide(page);
    expect(await page.evaluate(() => localStorage.getItem('laboCodex.assistance'))).toBeNull();
    await ouvrirPanneau(page);
    const p = page.locator('#panneau-assistance');

    // (a) Le texte validé, mot pour mot : un titre en gras et sa suite, puis quatre lignes au début en gras.
    const lignes = await p.locator('.assistance-intro-titre, .assistance-intro-temps li').allTextContents();
    expect(lignes.map(sansInsecable)).toEqual(QUATRE_TEMPS);
    expect((await p.locator('.assistance-intro strong').allTextContents()).map(sansInsecable)).toEqual([
        "Apprendre l'application, en quatre temps.", 'Découvrir par toi-même.', 'Regarder un modèle.', 'Mettre en pratique.', 'Continuer en autonomie.']);

    // (b) Un seul choix, entre « Tes parcours » et la liste ; par défaut, « Matériel de la démo ».
    const options = p.locator('#assistance-materiel [role="radio"]');
    await expect(options).toHaveText(['Matériel de la démo', 'Mon matériel']);
    await expect(options.nth(0)).toHaveAttribute('aria-checked', 'true');
    expect(await page.evaluate(() => {
        const ordre = ['assistance-intitule', 'assistance-materiel', 'assistance-demo-neuf', 'assistance-parcours-liste'].map((id) => document.getElementById(id));
        return ordre.every((e, i) => i === 0 || (ordre[i - 1].compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING));
    })).toBe(true);
    for (const o of await options.all()) expect((await o.boundingBox()).height).toBeGreaterThanOrEqual(44);

    // (c) Sous « Matériel de la démo » : « Découvrir » tel quel, « Mettre ta classe en place » avec sa modélisation,
    // les autres le disent sur leur carte et leur « Commencer » ne part pas.
    await expect(carte(page, 'decouvrir').locator('.assistance-parcours-sans-modele')).toHaveCount(0);
    await expect(carte(page, 'decouvrir').locator('.assistance-parcours-bouton')).not.toHaveAttribute('aria-disabled', 'true');
    await expect(carte(page, 'classe').locator('.assistance-parcours-sans-modele')).toHaveCount(0);
    await expect(carte(page, 'classe').locator('.assistance-parcours-bouton')).toHaveText('Commencer');
    const sans = await page.evaluate(() => Assistance.parcours().filter((d) => !d.dansLaDemo && typeof d.lancerModele !== 'function').map((d) => d.id));
    expect(sans.length).toBeGreaterThan(0);
    for (const id of sans) {
        await expect(carte(page, id).locator('.assistance-parcours-sans-modele')).toHaveText(/n.a pas encore son modèle dans la démo/);
        await expect(carte(page, id).locator('.assistance-parcours-bouton')).toHaveAttribute('aria-disabled', 'true');
    }
    await carte(page, sans[0]).locator('.assistance-parcours-bouton').click({ force: true });
    await expect(p).toBeVisible();
    await expect(bulle(page)).toHaveCount(0);
    expect(await enDemo(page)).toBe(false);
    await capture(page, 'panneau-materiel-de-la-demo');

    // (d) « Remettre la démo à neuf » : visible avec « Matériel de la démo », caché avec « Mon matériel ».
    await expect(p.locator('#assistance-demo-neuf')).toBeVisible();
    await expect(p.locator('#assistance-demo-neuf')).toHaveText('Remettre la démo à neuf');
    await options.nth(1).click();
    await expect(options.nth(1)).toHaveAttribute('aria-checked', 'true');
    await expect(p.locator('#assistance-demo-neuf')).toBeHidden();
    await expect(p.locator('.assistance-parcours-sans-modele')).toHaveCount(0);
    await expect(p.locator('.assistance-parcours-bouton[aria-disabled="true"]')).toHaveCount(0);
    await capture(page, 'panneau-mon-materiel');

    // Le choix se souvient, sur l'appareil et hors des données : rien dans db, une clé du navigateur.
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('laboCodex.assistance')).materiel)).toBe('mien');
    expect(await page.evaluate(async () => (await db.keys()).filter((k) => /assistance/i.test(k) && k !== 'laboCodex.assistance'))).toEqual([]);
    await page.reload();
    await attendreApplication(page);
    await ouvrirPanneau(page);
    await expect(page.locator('#assistance-materiel [role="radio"]').nth(1)).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('#assistance-demo-neuf')).toBeHidden();
    // Au clavier : les flèches passent d'une option à l'autre.
    await page.locator('#assistance-materiel [role="radio"]').nth(1).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#assistance-materiel [role="radio"]').nth(0)).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('#assistance-materiel [role="radio"]').nth(0)).toBeFocused();
    await expect(page.locator('#assistance-demo-neuf')).toBeVisible();
});

test('la modélisation de « Mettre ta classe en place », de bout en bout dans la démo ; le confinement, un trimestre réel peuplé au départ ; « Refaire avec mon matériel »', async ({ page, context }) => {
    test.setTimeout(240000);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await ouvrirEspaceVide(page);
    await peuplerUnTrimestreReel(page);
    const avant = await releve(page);
    expect(Object.keys(avant).filter((k) => /^db:a2026_/.test(k)).length, 'un trimestre réel peuplé').toBeGreaterThan(4);

    // « Commencer », sous « Matériel de la démo » : la démo s'ouvre, la modélisation part.
    await ouvrirPanneauSurLaDemo(page);
    expect(ecarts(avant, await releve(page), horsDeLaDemo), 'le choix du matériel n\'écrit rien dans les données').toEqual([]);
    await carte(page, 'classe').locator('.assistance-parcours-bouton').click();
    await faireLaModelisation(page, { capturer: '1180' });

    // La liste fournie : huit totems, aucun du pack, la parité (quatre noms accordés au féminin).
    const m = await materiel(page);
    expect(m.etudiants).toHaveLength(8);
    expect(m.etudiants.flatMap((e) => [e[1], e[2]]).filter((mot) => TOTEMS_DU_PACK.includes(mot))).toEqual([]);
    expect(m.etudiants.filter((e) => /e$/.test(e[1])).length).toBe(4);

    // Pendant la démo : ce qui est créé vit sous `demo_*`, sauf le cours (clé globale), marqué.
    const cree = await page.evaluate(() => ({
        cours: (db.getSync('cours', []) || []).filter((c) => c.creeEnDemonstration).map((c) => [c.codeCours, c.isDemo]),
        etudiants: (db.getSync('demo_groupeEtudiants', []) || []).length,
        horaires: (db.getSync('demo_horaires', []) || []).length,
        groupes: (db.getSync('demo_groupesCours', []) || []).length,
        etat: Assistance.etatModeleDe('classe'),
        reel: Assistance.etatDe('classe')
    }));
    expect(cree).toEqual({ cours: [[m.cours.code, true]], etudiants: 18, horaires: 2, groupes: 2,
        etat: { etat: 'en-cours', etape: 7 }, reel: { etat: 'a-faire', etape: 0 } });

    // La dernière bulle : en principal, la suite dans la démo ; en second, « Refaire avec mon matériel ».
    const boutons = bulle(page).locator('.parcours-bulle-boutons button');
    await expect(boutons).toHaveText(['Explorer la démo', 'Refaire avec mon matériel']);
    await expect(boutons.nth(0)).toHaveClass(/btn-principal/);
    await expect(boutons.nth(1)).toHaveClass(/btn-secondaire/);
    await boutons.nth(0).click();
    await expect(bulle(page)).toHaveCount(0);
    expect(await enDemo(page)).toBe(true);
    expect(await page.evaluate(() => Assistance.etatModeleDe('classe').etat)).toBe('fait');

    // LE CONFINEMENT. Sortie par le bandeau ; toutes les clés hors de la démo sont identiques à celles d'avant l'entrée.
    // Break-tests (12 nov. 2026), quatre gardes de la sortie cassées dans un même passage, chacune nommée par le rouge :
    // `|| c.creeEnDemonstration === true` retiré du filtre de `cours` → `cours` ; `retirerSeancesDesGroupesDeLaDemo()`
    // retiré → `seancesCompletes_gc_GC_DEMO` et celle du groupe créé ; `retirerClesAbsentesAvant(etat)` retiré →
    // `listeCours` et `modeApplication` ; la remise du tirage retirée → `etatTirage`. Code rétabli → vert.
    await page.evaluate(() => desactiverModeDemo());
    await expect.poll(() => enDemo(page)).toBe(false);
    const apres = await releve(page);
    expect(ecarts(avant, apres, horsDeLaDemo), 'aucune clé hors de la démo ne change').toEqual([]);
    // Le seul écart permis hors des données : l'appareil se souvient de la modélisation.
    expect(JSON.parse(apres['ls:laboCodex.assistance']).modeles.classe.etat).toBe('fait');

    // Ce qui a été créé reste dans la démo : « Refaire » (la modélisation est faite) y revient. La démo rouvre sur son
    // propre groupe : la modélisation reprend au passage d'un groupe à l'autre, puis va droit à sa dernière bulle
    // (le cours, la liste, l'horaire, le groupe-cours et la saisie verrouillée sont toujours là).
    await ouvrirPanneau(page);
    await expect(carte(page, 'classe').locator('.assistance-parcours-etat')).toHaveText('Fait');
    await expect(carte(page, 'classe').locator('.assistance-parcours-bouton')).toHaveText('Refaire');
    await carte(page, 'classe').locator('.assistance-parcours-bouton').click();
    await attendreEtape(page, 6, TOTAL, "D'un groupe à l'autre");
    expect(await enDemo(page)).toBe(true);
    expect(await page.evaluate(() => (db.getSync('cours', []) || []).filter((c) => c.creeEnDemonstration).map((c) => c.codeCours))).toEqual([m.cours.code]);
    await page.selectOption('#selectGroupeCoursHeader', await optionDont(page, '#selectGroupeCoursHeader', m.cours.code));
    await attendreEtape(page, 8, TOTAL, "Le groupe d'un coup d'œil");
    await expect(page.locator('#suivi-groupe')).toBeVisible();

    // « Refaire avec mon matériel » : la démo se referme, le même parcours repart sur les vraies données.
    await bulle(page).getByRole('button', { name: 'Refaire avec mon matériel' }).click();
    await expect.poll(() => enDemo(page)).toBe(false);
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(/ sur 8$/, { timeout: 10000 });
    expect(await page.evaluate(() => Assistance.etatDe('classe').etat)).toBe('en-cours');
    expect(await page.evaluate(() => Assistance.materiel())).toBe('mien');
    expect(await page.evaluate(() => db.getSync('trimestreActif', null))).toBe('a2026');
    // Sur les vraies données : la liste réelle, pas celle de la démo ; le cours de la démo n'y est pas.
    expect(await page.evaluate(() => (db.getSync('cours', []) || []).map((c) => c.codeCours))).toEqual(['601-101-MQ']);
    await page.evaluate(() => ParcoursMoteur.fermer());
});

test('« Remettre la démo à neuf » : une confirmation, la démo du pack, les autres clés identiques', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirEspaceVide(page);
    await peuplerUnTrimestreReel(page);
    const duPack = await releve(page);   // la démo telle que le pack la donne : jamais ouverte

    // On fait quelque chose dans la démo : un cours, deux étudiant·es, une saisie verrouillée.
    await page.evaluate(() => activerModeDemo());
    await ouvrirBloc(page, 'accordeon-cours', 'nouveauCoursV2');
    await page.fill('#v2-codeCours', '601-999-DM');
    await page.fill('#v2-nomCours', 'Littérature et imaginaire');
    await page.selectOption('#v2-disciplineCours', '601 Français (langue et littérature)');
    await page.fill('#v2-ponderation', '3-1-3');
    await page.click('#v2-btnCreerCours');
    await ouvrirBloc(page, 'accordeon-groupe-etudiants', null);
    await page.fill('#v2-donneesCollees', '9900001\t00002\tCâlin\tKoala\n9900002\t00002\tEnjouée\tLoutre');
    await page.click('#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]');
    await page.click('#v2-btnConfirmerImport');
    await expect.poll(() => page.evaluate(() => (db.getSync('demo_groupeEtudiants', []) || []).length)).toBe(12);
    await page.evaluate(() => desactiverModeDemo());
    await expect.poll(() => enDemo(page)).toBe(false);
    const avant = await releve(page);
    expect(ecarts(duPack, avant, (k) => DE_LA_DEMO.test(k)).length, 'la démo porte ce qu\'on y a fait').toBeGreaterThan(0);

    // Le bouton, sa confirmation : ce qui s'efface, ce qui ne bouge pas. « Annuler » ne fait rien.
    await ouvrirPanneauSurLaDemo(page);
    await page.click('#assistance-demo-neuf');
    const dialogue = page.getByRole('dialog').filter({ hasText: 'Remettre la démo à neuf' }).last();
    await expect(dialogue).toContainText('Tout ce que tu as fait dans la démo s\'efface');
    await expect(dialogue).toContainText('Tes données, elles, ne bougent pas.');
    await capture(page, 'remise-a-neuf-confirmation');
    await dialogue.getByRole('button', { name: 'Annuler' }).click();
    expect(ecarts(avant, await releve(page), (k) => !DE_L_APPAREIL.test(k)), '« Annuler » : rien ne change, ni dans la démo ni ailleurs').toEqual([]);

    // Confirmée : la démo revient telle que le pack la donne ; aucune autre clé ne change.
    // Break-test (12 nov. 2026) : l'effacement des `demo_*` retiré de `reinstallerDemoDuPack` → ROUGE (« la démo du
    // pack » : `demo_calendrierComplet`, `demo_indicesCP`, `demo_presences_date` et les autres clés dérivées restent).
    await page.click('#assistance-demo-neuf');
    await page.getByRole('dialog').filter({ hasText: 'Remettre la démo à neuf' }).last().getByRole('button', { name: 'Remettre à neuf' }).click();
    await expect(page.locator('.notifications-pile')).toContainText('La démo est remise à neuf.');
    const apres = await releve(page);
    expect(ecarts(duPack, apres, (k) => DE_LA_DEMO.test(k)), 'la démo du pack').toEqual([]);
    expect(ecarts(avant, apres, horsDeLaDemo), 'les autres clés identiques').toEqual([]);

    // La démo ouverte : elle se remet à neuf et reste ouverte, avec ses dix étudiant·es et son seul cours.
    await page.evaluate(() => activerModeDemo());
    await page.evaluate(() => db.setSync('demo_groupeEtudiants', (db.getSync('demo_groupeEtudiants', []) || []).slice(0, 4)));
    await ouvrirPanneauSurLaDemo(page);
    await page.click('#assistance-demo-neuf');
    await page.evaluate(() => document.querySelectorAll('.notifications-pile > *').forEach((n) => n.remove()));
    await page.getByRole('dialog').filter({ hasText: 'Remettre la démo à neuf' }).last().getByRole('button', { name: 'Remettre à neuf' }).click();
    await expect(page.locator('.notifications-pile')).toContainText('La démo est remise à neuf.', { timeout: 15000 });
    expect(await page.evaluate(() => (db.getSync('demo_groupeEtudiants', []) || []).length)).toBe(10);
    expect(await enDemo(page)).toBe(true);
    await page.evaluate(() => desactiverModeDemo());
    await expect.poll(() => enDemo(page)).toBe(false);
    expect(ecarts(avant, await releve(page), horsDeLaDemo), 'après la remise à neuf démo ouverte, puis la sortie').toEqual([]);
});

test('une sortie demandée pendant l\'entrée dans la démo attend que l\'entrée ait fini : rien de la démo ne s\'écrit dans le trimestre réel', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirEspaceVide(page);
    await peuplerUnTrimestreReel(page);
    const avant = await releve(page);
    // Mesuré le 12 nov. 2026 : sans la file des bascules, la fin de la reconstruction des captures (démarrée par
    // l'entrée) écrivait des séances de la démo sous `a2026_snapshots_…`.
    // Break-test : `window.activerModeDemo` et `window.desactiverModeDemo` branchés sur les bascules directes, sans
    // la file (`_enFile`) → ROUGE ici (`a2026_snapshots_…`).
    await page.evaluate(async () => {
        const entree = activerModeDemo();
        const sortie = desactiverModeDemo();
        await Promise.all([entree, sortie]);
    });
    expect(await enDemo(page)).toBe(false);
    expect(ecarts(avant, await releve(page), horsDeLaDemo)).toEqual([]);
});
