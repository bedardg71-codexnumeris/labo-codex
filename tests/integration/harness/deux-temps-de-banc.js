// =======================================================================
// LE HARNAIS DES DEUX TEMPS (13 NOVEMBRE 2026)
// =======================================================================
// Les aides du banc de la première partie (`deux-temps-modelisation-2026-11-12.spec.js`), sorties telles quelles pour
// servir aussi au banc du modèle d'« Évaluer une première production » (`deux-temps-modeles-2026-11-13.spec.js`) :
// l'espace vide, le panneau sous « Modélisation », le relevé de toutes les clés et ses écarts (le confinement), un
// trimestre réel peuplé, et la modélisation de « Mettre ta classe en place » jouée geste par geste.
import { expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './attendre-application.js';
import { flecheVers } from './fleches-de-banc.js';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..', '..'), 'index.html');
export const HORLOGE = new Date('2026-11-10T14:00:00.000Z');
export const CAPTURES = process.env.CAPTURES_PARCOURS || '';

// Le texte du panneau, VALIDÉ par Grégoire mot pour mot (mandat du 12 nov. 2026).
export const QUATRE_TEMPS = [
    "Apprendre l'application, en quatre temps. Passe de l'un à l'autre à ton rythme.",
    "Découvrir par toi-même. Explore la démo : un groupe de dix étudiant·es fictif·ves t'y attend, avec ses productions, ses évaluations et ses présences.",
    "Regarder un modèle. Dans la démo, un parcours te montre, geste par geste, comment se crée le matériel et ce qu'il donne. C'est toi qui fais les gestes, avec le matériel fourni.",
    'Mettre en pratique. Refais le parcours avec ta vraie liste, ton vrai cours, tes vraies activités.',
    "Continuer en autonomie. Bâtis ton propre parcours, partage ton matériel, pose tes hypothèses. L'aide dans les pages reste là au besoin."
];
export const sansInsecable = (t) => t.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

// Les dix totems du pack (js/pack-demo-10.js) : la liste fournie n'en reprend aucun.
export const TOTEMS_DU_PACK = ['Castor', 'Mésange', 'Hérisson', 'Bernache', 'Vigogne', 'Suricate', 'Condor', 'Grue', 'Gazelle', 'Panda',
    'Jovial', 'Joyeuse', 'Chaleureux', 'Fidèle', 'Fière', 'Loyal', 'Courageux', 'Gracieuse', 'Intrépide', 'Serein'];

export async function capture(page, nom) {
    if (!CAPTURES) return;
    fs.mkdirSync(CAPTURES, { recursive: true });
    await page.evaluate(() => document.querySelectorAll('.notifications-pile > *').forEach((n) => n.remove()));
    await page.waitForFunction(() => document.getAnimations()
        .filter((a) => a.effect && a.effect.target && a.effect.target.closest
            && a.effect.target.closest('#panneau-assistance, #parcours-bulle, #entete-menu-panneau, .accordeon'))
        .every((a) => a.playState !== 'running'));
    await page.screenshot({ path: path.join(CAPTURES, nom + '.png') });
}

export async function ouvrirEspaceVide(page, largeur = 1180, hauteur = 900) {
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

export async function ouvrirPanneau(page) {
    await page.click('#entete-menu-bouton');
    await page.click('#btn-assistance-menu');
    await expect(page.locator('#panneau-assistance')).toBeVisible();
}

/** Le panneau ouvert, « Modélisation » choisi (sous un banc piloté, le défaut est « Pratique guidée »). */
export async function ouvrirPanneauSurLaDemo(page) {
    await ouvrirPanneau(page);
    await page.locator('#assistance-materiel [data-materiel="demo"]').click();
    await expect(page.locator('#assistance-demo-neuf')).toBeVisible();
}

export const bulle = (page) => page.locator('#parcours-bulle');
export const carte = (page, id) => page.locator(`#panneau-assistance [data-parcours="${id}"]`);
export const enDemo = (page) => page.evaluate(() => estEnModeDemo());

export async function attendreEtape(page, n, total, titre) {
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(n + ' sur ' + total, { timeout: 10000 });
    if (titre) await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(titre);
}

/** La pulsation (« ce que tu toucheras ») est posée sur l'élément. */
export async function contourSur(page, selecteur, idContour = 'parcours-contour') {
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
export async function gesteDesigne(page, selecteur, contexte) {
    await contourSur(page, selecteur);
    await flecheVers(page, selecteur, contexte);
}

/** Toutes les clés, telles qu'elles sont en base (db) et dans le stockage du navigateur. */
export async function releve(page) {
    return page.evaluate(async () => {
        await db.flush();
        const o = {};
        for (const k of await db.keys()) o['db:' + k] = JSON.stringify(await db.get(k, null));
        for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o['ls:' + k] = localStorage.getItem(k); }
        return o;
    });
}
export const DE_LA_DEMO = /^(db|ls):demo_/;
// Hors des données : le choix du matériel et l'état des modélisations, sur l'appareil (comme `laboCodex.vue`).
export const DE_L_APPAREIL = /^ls:laboCodex\.assistance$/;
export function ecarts(a, b, garder) {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(garder).filter((k) => a[k] !== b[k]).sort()
        .map((k) => `${k} : ${(a[k] ?? '∅').slice(0, 90)} → ${(b[k] ?? '∅').slice(0, 90)}`);
}
export const horsDeLaDemo = (k) => !DE_LA_DEMO.test(k) && !DE_L_APPAREIL.test(k);

// ---------- Un trimestre réel peuplé (le cas de Grégoire), par les formulaires du Cadre ----------

export async function ouvrirBloc(page, accordeon, nouveau) {
    await page.evaluate(() => naviguerVers('calendrier', 'trimestre'));
    await page.evaluate(async ([a, n]) => {
        const el = document.getElementById(a);
        if (el.classList.contains('ferme')) toggleAccordeonV2(el.querySelector('.accordeon-header'));
        if (n) await window[n]();
    }, [accordeon, nouveau]);
}

export async function peuplerUnTrimestreReel(page) {
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
    // 13 nov. 2026 : « Prévisualiser », touché avant que le bloc ait fini de s'ouvrir, n'ouvrait parfois pas l'aperçu
    // (un essai resté sept minutes sur « Confirmer ») : on le retouche jusqu'à ce que l'aperçu soit là.
    await expect(async () => {
        await page.click('#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]');
        await expect(page.locator('#v2-btnConfirmerImport')).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 15000 });
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

export const materiel = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.ParcoursClasse.materiel)));
export const optionDont = (page, select, texte) => page.evaluate(([s, t]) => {
    const o = [...document.querySelectorAll(s + ' option')].find((x) => x.textContent.includes(t) && !x.disabled);
    return o ? o.value : null;
}, [select, texte]);

/** La modélisation, de sa première étape à la bande d'assiduité ; chaque geste est jugé avant d'être fait. */
export const TOTAL = 8;
export async function faireLaModelisation(page, { capturer = '' } = {}) {
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
    expect(liste.split('\n')).toHaveLength(10);
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
    await expect(page.locator('#v2-btnConfirmerImport')).toHaveText('Importer 10 étudiant·es');
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

    // 7. Un premier cours : les dix de la liste, une absence, « Verrouiller la saisie ».
    await attendreEtape(page, 7, TOTAL, 'Un premier cours');
    await expect(page.locator('#tbody-saisie-presences tr')).toHaveCount(10);
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

