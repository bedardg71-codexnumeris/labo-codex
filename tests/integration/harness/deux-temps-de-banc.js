// =======================================================================
// LE HARNAIS DES DEUX TEMPS (13 NOVEMBRE 2026)
// =======================================================================
// Les aides du banc de la première partie (`deux-temps-modelisation-2026-11-12.spec.js`), sorties telles quelles pour
// servir aussi au banc du modèle d'« Évaluer une première production » (`deux-temps-modeles-2026-11-13.spec.js`) :
// l'espace vide, le panneau, le relevé de toutes les clés et ses écarts (le confinement), un trimestre réel peuplé, et
// la modélisation de « Mettre ta classe en place » jouée en trois temps.
// REMIS À JOUR LE 15 NOV. 2026 (`plans de travail/CONSIGNE-2026-11-15-deux-temps-remise-a-jour.md`) : le harnais suit
// les mots de main (le nom du trimestre ne se tape plus, lot 1a de l'essai novice) ; le choix unique du matériel est
// retiré (deux états par parcours) ; la modélisation se fait par « Remplir avec l'exemple », puis le bouton de la page.
// REMIS À JOUR LE 16 NOV. 2026 (`plans de travail/CONSIGNE-2026-11-16-parcours-je-regarde.md`) : les quatre lignes du
// panneau, « Je regarde » et « Nous faisons », le bouton « Remplir » et sa consigne, les textes du 16 nov.
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

// Le texte du panneau : le titre du 14 nov. 2026, les quatre lignes du 16 (Grégoire, 8 h 47 à 9 h 46), mot pour mot.
export const QUATRE_TEMPS = [
    "Apprendre l'application, en quatre temps.",
    "1. J'explore la démo et son groupe fictif, par moi-même.",
    '2. Je regarde un modèle, avec le matériel de la démo.',
    '3. Nous faisons le parcours ensemble, avec mon propre matériel.',
    "4. Je fais, en autonomie, avec l'aide dans les pages au besoin."
];
// Les deux temps d'une carte (16 nov. 2026) : le bouton, et dessous, en petit, le nom du temps.
export const DEUX_TEMPS = { modele: ['Je regarde', 'Modélisation'], pratique: ['Nous faisons', 'Pratique guidée'] };
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

/** Les deux boutons d'une carte à deux temps : celui de la Modélisation, celui de la Pratique guidée. */
export const boutonModele = (page, id) => carte(page, id).locator('.assistance-modele-bouton');
export const boutonPratique = (page, id) => carte(page, id).locator('.assistance-parcours-bouton');

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
    // Le nom du trimestre s'écrit seul, de la session et de l'année (essai novice, lot 1a) : il ne se tape plus.
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

// ---------- Les gestes de la modélisation : « Remplir », puis le bouton de la page ----------

export const materiel = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.ParcoursClasse.materiel)));
export const optionDont = (page, select, texte) => page.evaluate(([s, t]) => {
    const o = [...document.querySelectorAll(s + ' option')].find((x) => x.textContent.includes(t) && !x.disabled);
    return o ? o.value : null;
}, [select, texte]);

export const REMPLIR = 'Remplir';
export const CONSIGNE_REMPLIR = "Regarde l'exemple se remplir : touche « Remplir »";
const aPlat = (t) => t.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
/** Ce que dit la bulle : sa consigne (la ligne orange), ses lignes faites, ses boutons. */
export const lireBulle = (page) => page.evaluate(() => {
    const b = document.getElementById('parcours-bulle');
    const textes = (sel) => [...b.querySelectorAll(sel)].map((e) => e.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim());
    const contour = document.getElementById('parcours-contour');
    return {
        consignes: textes('.parcours-bulle-ligne--geste > .parcours-bulle-ligne-texte'),
        derniere: textes('.parcours-bulle-lignes > ul:last-of-type > li:last-child > .parcours-bulle-ligne-texte')[0] || '',
        faites: textes('.parcours-bulle-ligne.est-faite > .parcours-bulle-ligne-texte'),
        boutons: textes('.parcours-bulle-boutons button'),
        principal: textes('.parcours-bulle-boutons button.btn-principal'),
        contour: !!contour && !contour.hidden
    };
});

/**
 * Le premier temps d'une bulle en trois temps : la seule consigne « Regarde l'exemple se remplir : touche « Remplir » », son bouton
 * dans la bulle (44 px au moins : la cible tactile de l'iPad), et rien de désigné sur la page.
 */
export async function attendreRemplir(page, contexte) {
    await expect.poll(async () => (await lireBulle(page)).consignes, { message: contexte + ' : la consigne est celle de « Remplir »', timeout: 10000 })
        .toEqual([CONSIGNE_REMPLIR]);
    const vu = await lireBulle(page);
    expect(vu.boutons, contexte).toEqual([REMPLIR]);
    expect(vu.contour, contexte + ' : rien n’est désigné sur la page avant « Remplir »').toBe(false);
    const boite = await bulle(page).getByRole('button', { name: REMPLIR, exact: true }).boundingBox();
    expect(boite.height, contexte + ' : la cible tactile').toBeGreaterThanOrEqual(44);
}

/** La bulle dans sa seconde forme : ce qui l'ouvre (le titre, le compteur, puis la première chose écrite). */
export const lireLaSecondeForme = (page) => page.evaluate(() => {
    const b = document.getElementById('parcours-bulle');
    const vis = (e) => !!e && !e.hidden && e.getClientRects().length > 0;
    const boite = b.querySelector('.parcours-bulle-lignes');
    const premier = boite && boite.firstElementChild;
    const texte = (e) => (e ? e.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim() : '');
    return {
        titre: vis(b.querySelector('.parcours-bulle-titre')),
        compteur: vis(b.querySelector('.parcours-bulle-rang')),
        confirme: vis(b.querySelector('.parcours-bulle-confirme')),
        // Ce qui est écrit avant la première liste : rien, dans la seconde forme.
        avantLesLignes: (() => {
            const avant = [];
            for (const e of boite.children) { if (e.tagName === 'UL') break; if (vis(e)) avant.push(e.className); }
            return avant;
        })(),
        ouvertureSur: premier ? premier.tagName + ':' + texte(premier.querySelector('.parcours-bulle-ligne-texte') || premier) : '',
        remplirDit: texte(boite).includes("Regarde l'exemple se remplir")
    };
});

/**
 * Les deuxième et troisième temps, la SECONDE FORME (18 nov. 2026, essai de Grégoire sur l'iPad) : « Remplir » touché,
 * ce qui précédait disparaît (l'objectif, la confirmation, le lieu, les notes, la ligne « Remplir ») ; la bulle garde
 * son titre et son compteur, s'ouvre sur ce qui vient d'apparaître, et la dernière ligne (orange) nomme le bouton de
 * la page, qui porte la pulsation et une flèche.
 */
export async function remplirPuisVoir(page, { consigne, bouton, contexte }) {
    await bulle(page).getByRole('button', { name: REMPLIR, exact: true }).click();
    await expect.poll(async () => (await lireBulle(page)).consignes, { message: contexte + ' : la consigne passe au bouton de la page', timeout: 10000 })
        .toEqual([consigne]);
    const vu = await lireBulle(page);
    const seconde = await lireLaSecondeForme(page);
    expect(seconde.remplirDit, contexte + ' : la ligne « Remplir » a disparu').toBe(false);
    expect(seconde.confirme, contexte + ' : la confirmation a disparu').toBe(false);
    expect(seconde.avantLesLignes, contexte + ' : ni objectif, ni lieu, ni note avant les lignes').toEqual([]);
    expect(seconde.ouvertureSur.startsWith('UL:'), contexte + ' : la bulle s’ouvre sur les lignes nouvelles (' + seconde.ouvertureSur + ')').toBe(true);
    expect(seconde.titre && seconde.compteur, contexte + ' : le titre et le compteur restent').toBe(true);
    expect(vu.boutons, contexte + ' : le bouton a quitté la bulle').toEqual([]);
    expect(vu.derniere, contexte + ' : la consigne est la dernière ligne').toBe(consigne);
    if (bouton) await gesteDesigne(page, bouton, contexte);
}

/** La modélisation, de sa première étape à la bande d'assiduité ; chaque temps est jugé avant le geste. */
export const TOTAL = 8;
export async function faireLaModelisation(page, { capturer = '', surRemplir = null } = {}) {
    const m = await materiel(page);
    const apresRemplir = async (ou) => { if (surRemplir) await surRemplir(ou); };

    // 1. Un cours.
    await attendreEtape(page, 1, TOTAL, 'Un cours');
    expect(await enDemo(page)).toBe(true);
    await expect(bulle(page).locator('.parcours-bulle-lieu')).toContainText('Tu es dans');
    await attendreRemplir(page, 'étape 1');
    await capture(page, 'modele-1-avant-' + capturer);
    await remplirPuisVoir(page, { consigne: 'Touche « Créer le cours »', bouton: '#v2-btnCreerCours', contexte: 'étape 1' });
    await expect(page.locator('#v2-codeCours')).toHaveValue(m.cours.code);
    await expect(page.locator('#v2-nomCours')).toHaveValue(m.cours.nom);
    await expect(page.locator('#v2-disciplineCours')).toHaveValue(m.cours.discipline);
    await expect(page.locator('#v2-ponderation')).toHaveValue(m.cours.ponderation);
    await flecheVers(page, '#v2-codeCours', 'étape 1, la ligne du code montre son champ');
    await capture(page, 'modele-1-' + capturer);
    await apresRemplir('étape 1');
    await page.click('#v2-btnCreerCours');

    // 2. La liste : « Remplir » remplace le copier-coller.
    await attendreEtape(page, 2, TOTAL, "Une liste d'étudiant·es");
    await attendreRemplir(page, 'étape 2');
    await remplirPuisVoir(page, { consigne: 'Touche « Prévisualiser »', bouton: '#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]', contexte: 'étape 2' });
    const liste = await page.inputValue('#v2-donneesCollees');
    expect(liste.split('\n')).toHaveLength(10);
    expect(liste).toContain('9900001\t' + m.groupe + '\tCâlin\tKoala');
    await capture(page, 'modele-2-' + capturer);
    await page.click('#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]');

    // 3. Le cours de la liste : l'aperçu propose le cours actif (celui de la démo) ; « Remplir » choisit le cours créé.
    await attendreEtape(page, 3, TOTAL, 'Le cours de la liste');
    await attendreRemplir(page, 'étape 3');
    // « Annuler » referme l'aperçu : la bulle le dit et montre « Prévisualiser » ; rien n'est importé.
    await page.click('#accordeon-groupe-etudiants [data-action="annulerImportV2"]');
    await expect(bulle(page).locator('.parcours-bulle-avis')).toContainText('touche « Prévisualiser »');
    await contourSur(page, '#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]');
    await page.fill('#v2-donneesCollees', liste);
    await page.click('#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]');
    await expect(bulle(page).locator('.parcours-bulle-avis')).toHaveCount(0);
    await remplirPuisVoir(page, { consigne: 'Touche « Importer 10 étudiant·es »', bouton: '#v2-btnConfirmerImport', contexte: 'étape 3' });
    expect(await page.inputValue('#v2-importCoursCible')).toBe(await optionDont(page, '#v2-importCoursCible', m.cours.code));
    await expect(page.locator('#v2-btnConfirmerImport')).toHaveText('Importer 10 étudiant·es');
    await capture(page, 'modele-3-' + capturer);
    await page.click('#v2-btnConfirmerImport');

    // 4. Un horaire : deux séances de 2 périodes, le mardi et le vendredi, de 8 h à 10 h (Grégoire, 15 nov. 2026).
    await attendreEtape(page, 4, TOTAL, 'Un horaire');
    await attendreRemplir(page, 'étape 4');
    await remplirPuisVoir(page, { consigne: 'Touche « Créer l\'horaire »', bouton: '#v2-btnCreerHoraire', contexte: 'étape 4' });
    expect(await page.inputValue('#v2-hor-groupeAssocie')).toBe(await optionDont(page, '#v2-hor-groupeAssocie', m.groupe));
    await expect(page.locator('#v2-hor-nom')).toHaveValue(m.horaire.nom);
    await expect(page.locator('#v2-hor-nbSeances')).toHaveValue('2');
    for (const [k, se] of m.horaire.seances.entries()) {
        await expect(page.locator(`#v2-hor-seance-${k}-jour`)).toHaveValue(se.jour);
        await expect(page.locator(`#v2-hor-seance-${k}-debut`)).toHaveValue(se.debut);
        await expect(page.locator(`#v2-hor-seance-${k}-fin`)).toHaveValue(se.fin);
        await expect(page.locator(`#v2-hor-seance-${k}-periodes`)).toHaveValue(String(se.periodes));
    }
    expect(m.horaire.seances.map((se) => [se.jour, se.debut, se.fin, se.periodes])).toEqual([['Mardi', '08:00', '10:00', 2], ['Vendredi', '08:00', '10:00', 2]]);
    await capture(page, 'modele-4-' + capturer);
    await page.click('#v2-btnCreerHoraire');

    // 5. Un groupe-cours.
    await attendreEtape(page, 5, TOTAL, 'Un groupe-cours');
    await attendreRemplir(page, 'étape 5');
    await remplirPuisVoir(page, { consigne: 'Touche « Créer le groupe-cours » (il apparaîtra dans l\'en-tête de l\'application)', bouton: '#v2-btnCreerGroupeCours', contexte: 'étape 5' });
    for (const [id, texte] of [['v2-gc-cours', m.cours.code], ['v2-gc-groupe', m.groupe], ['v2-gc-horaire', m.horaire.nom], ['v2-gc-enseignant', 'Primo Primavera']]) {
        expect(await page.inputValue('#' + id), `${id} : « ${texte} »`).toBe(await optionDont(page, '#' + id, texte));
    }
    await capture(page, 'modele-5-' + capturer);
    await page.click('#v2-btnCreerGroupeCours');

    // 6. D'un groupe à l'autre : pas de formulaire, le geste est celui de la personne.
    await attendreEtape(page, 6, TOTAL, "D'un groupe à l'autre");
    expect((await lireBulle(page)).boutons).toEqual([]);
    await gesteDesigne(page, '#selectGroupeCoursHeader', 'étape 6');
    await capture(page, 'modele-6-' + capturer);
    await page.selectOption('#selectGroupeCoursHeader', await optionDont(page, '#selectGroupeCoursHeader', m.cours.code));

    // 7. Prendre les présences : la première séance du groupe, deux absences et un retard, puis « Verrouiller la saisie ».
    await attendreEtape(page, 7, TOTAL, 'Prendre les présences');
    await expect(page.locator('#tbody-saisie-presences tr')).toHaveCount(10);
    await attendreRemplir(page, 'étape 7');
    const premiere = await page.evaluate(() => {
        const s = obtenirSeancesCompletesDuGroupe(db.getSync('groupeCoursActif', null).id);
        return Object.keys(s).filter((d) => Array.isArray(s[d]) && s[d].length > 0).sort()[0];
    });
    await remplirPuisVoir(page, {
        consigne: 'Touche « Verrouiller la saisie » (c\'est ce qui dit à l\'application que cette séance a eu lieu)',
        bouton: '#btnVerrouillerSaisiePresences', contexte: 'étape 7'
    });
    await expect(page.locator('#date-cours')).toHaveValue(premiere);
    // La première séance du deuxième groupe, au calendrier de la démo (automne 2025, début le 21 août) : un mardi ou un vendredi.
    expect(premiere >= '2025-08-21' && premiere <= '2025-08-29', 'la première séance : ' + premiere).toBe(true);
    expect([2, 5]).toContain(new Date(premiere + 'T12:00:00').getDay());
    for (const da of m.presences.absents) await expect(page.locator('#periodes_' + da)).toHaveValue('0');
    await expect(page.locator('#periodes_' + m.presences.retard)).toHaveValue(String(m.presences.periodesDuRetard));
    await expect(page.locator('#tbody-saisie-presences .saisie-absence')).toHaveCount(2);
    await expect(page.locator('#tbody-saisie-presences .saisie-retard')).toHaveCount(1);
    // Les trois cases de l'exemple se suivent, en haut du tableau : amenées à l'écran, elles reçoivent UNE flèche (des
    // cibles qui se touchent n'en font qu'une). Mesuré le 15 nov. 2026 : dispersées (rangées 1, 5 et 8), deux d'entre
    // elles restaient sous le bas de l'écran, sans flèche.
    const cases = m.presences.absents.concat([m.presences.retard]).map((da) => `#tbody-saisie-presences td:has(#periodes_${da})`);
    for (const sel of cases) await expect(page.locator(sel)).toBeInViewport({ ratio: 1 });
    await expect(page.locator('#btnVerrouillerSaisiePresences')).toBeInViewport({ ratio: 1 });
    await flecheVers(page, cases, 'étape 7, la ligne des absences montre ses trois cases');
    await capture(page, 'modele-7-' + capturer);
    await apresRemplir('étape 7');
    await page.click('#btnVerrouillerSaisiePresences');

    // 8. La bande d'assiduité : les trois points à l'écart, et la fin à trois boutons de même poids.
    await attendreEtape(page, 8, TOTAL, "Le groupe d'un coup d'œil");
    await expect(page.locator('#suivi-groupe')).toBeVisible();
    await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
    await expect(bulle(page)).toContainText('Trois points sont à l\'écart');
    // La bande se peint APRÈS la bulle : sans cette attente, la lecture qui suit trouvait un bloc encore vide (17 nov. 2026 :
    // rouge trois fois sur trois dès que le banc ne s'enregistre plus en trace et va deux fois plus vite).
    await expect(page.locator('#section-suivi .barre-etudiant[data-da]')).toHaveCount(10);
    const points = await page.evaluate((p) => {
        const bloc = document.querySelector('#section-suivi h4[data-tooltip="tdb-assiduite"]').parentElement;
        const x = (da) => { const e = bloc.querySelector('.barre-etudiant[data-da="' + da + '"]'); return e ? Math.round(e.getBoundingClientRect().left) : null; };
        const tous = [...bloc.querySelectorAll('.barre-etudiant[data-da]')];
        const ecart = p.absents.concat([p.retard]);
        ecart.forEach((da, k) => bloc.querySelector('.barre-etudiant[data-da="' + da + '"]').setAttribute('data-banc', 'point-' + k));
        return { ecart: ecart.map(x), autres: tous.filter((e) => !ecart.includes(e.dataset.da)).map((e) => Math.round(e.getBoundingClientRect().left)) };
    }, m.presences);
    expect(points.autres).toHaveLength(7);
    // À l'écart : chacun des trois est à gauche de tous les autres (à droite, on vient à ses cours).
    for (const px of points.ecart) expect(px, 'un point à l’écart est à gauche des sept autres').toBeLessThan(Math.min(...points.autres));
    // Chaque point à l'écart a sa flèche. MESURÉ LE 16 NOV. 2026, après la règle 8 du relais de 13 h 20 (la bulle ne
    // couvre aucun des dix points) :
    //   · deux points qui se recouvrent (les deux absences, au même taux : 114 à 124 et 119 à 129 px à 1180 × 820) n'ont
    //     qu'UNE flèche, vers leur union (des cibles qui se touchent n'en font qu'une) ;
    //   · à 1180 × 820, la bulle (380 × 606) n'a qu'une place qui ne couvre aucun point : le creux entre les trois points
    //     à l'écart et les sept autres (407 à 787 px). Elle s'y pose à 1 px du point du retard (396 à 406 px), et une
    //     flèche ne se trace pas à moins de 24 px (FLECHE_MIN, js/parcours-moteur.js) : ce point reste SANS flèche.
    //     La page, trop courte en paysage, ne défile pas pour amener la bande sous l'en-tête (`amener`). Deux règles
    //     validées se contredisent ici ; l'arbitrage est remonté à Cowork (rapport du 16 nov., § « à décider »).
    //     Le banc exige donc la flèche partout où elle a la place de se tracer, et que le point soit à découvert sinon.
    //   · LE SEUIL DU BANC EST CELUI DU MOTEUR (16 nov. 2026, soir) : `courbe` retranche FLECHE_RETRAIT (6 px) avant de
    //     comparer à FLECHE_MIN (24 px) ; une flèche n'est donc due qu'à partir de 30 px d'écart, pas de 24. Les points
    //     reçoivent un décalage au hasard (±3 %, js/tableau-bord-apercu.js) : celui du retard tombe de 1 à 33 px de la
    //     bulle selon le passage (mesuré sur cinq passages), et le banc rougissait quand il tombait entre 24 et 30.
    //   · LA GÉOMÉTRIE SE LIT UNE FOIS LA BULLE POSÉE (17 nov. 2026) : à l'arrivée de l'étape, la bulle est encore à sa
    //     place d'avant. Lue trop tôt (bulle à 792 px, posée ensuite à 407 px, collée au point du retard), elle faisait
    //     exiger une flèche qui n'est pas due : 5 rouges sur 8 dès que le banc ne s'enregistre plus en trace. Le banc
    //     attend deux lectures à 400 ms d'écart où la bulle n'a pas bougé de plus de 2 px. Les points, eux, flottent
    //     sans arrêt de haut en bas, et la bulle les suit à 1 px : une égalité stricte ne se produit jamais.
    const lireGeo = () => page.evaluate(() => {
        const r = (e) => { const q = e.getBoundingClientRect(); return { left: q.left, top: q.top, right: q.right, bottom: q.bottom }; };
        return { bulle: r(document.getElementById('parcours-bulle')), points: [0, 1, 2].map((k) => r(document.querySelector('[data-banc="point-' + k + '"]'))) };
    });
    let geo = null, avant = null;
    await expect.poll(async () => {
        geo = await lireGeo();
        const posee = !!avant && Math.abs(geo.bulle.left - avant.left) <= 2 && Math.abs(geo.bulle.top - avant.top) <= 2;
        avant = geo.bulle;
        return posee;
    }, { message: 'étape 8 : la bulle finit par se poser', intervals: [400], timeout: 10000 }).toBe(true);
    const ecartEntre = (a, b) => Math.hypot(Math.max(a.left - b.right, b.left - a.right, 0), Math.max(a.top - b.bottom, b.top - a.bottom, 0));
    const vus = new Set();
    for (const k of [0, 1, 2]) {
        if (vus.has(k)) continue;
        // Le moteur fond deux cibles à MOINS de 2 px l'une de l'autre (JOINT, `fondreCibles`), pas seulement celles qui
        // se recouvrent : avec le décalage au hasard, les deux absences tombent parfois à 1 px (mesuré le 17 nov. 2026 :
        // une seule flèche vers leur union, pointe à 17 px du premier point), et le banc en exigeait deux.
        const groupe = [0, 1, 2].filter((j) => j === k || ecartEntre(geo.points[k], geo.points[j]) < 2);
        groupe.forEach((j) => vus.add(j));
        const pres = Math.min(...groupe.map((j) => ecartEntre(geo.points[j], geo.bulle)));
        if (pres >= 30) {
            await flecheVers(page, groupe.map((j) => `[data-banc="point-${j}"]`), 'étape 8, un point à l’écart');
        } else {
            expect(pres, 'étape 8 : un point trop près de la bulle pour sa flèche reste à découvert').toBeGreaterThan(0);
            expect(groupe, 'étape 8 : seul le point du retard peut rester sans flèche, et seulement à 1180 × 820').toEqual([2]);
            expect(page.viewportSize(), 'étape 8 : le point du retard est à ' + Math.round(pres) + ' px de la bulle (haute de ' + Math.round(geo.bulle.bottom - geo.bulle.top) + ' px, de ' + Math.round(geo.bulle.top) + ' à ' + Math.round(geo.bulle.bottom) + ')').toEqual({ width: 1180, height: 820 });
        }
    }
    await capture(page, 'modele-8-' + capturer);
}
