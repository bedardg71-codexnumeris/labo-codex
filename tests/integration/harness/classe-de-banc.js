// =======================================================================
// UNE CLASSE DE BANC, MISE EN PLACE PAR LE DEUXIÈME PARCOURS (9 nov. 2026)
// =======================================================================
// Les bancs des parcours 3, 4 et 5 partent « d'un espace où le deuxième parcours est fait » (leurs
// consignes) : un espace vide, puis « Mettre ta classe en place » joué par ses propres gestes (le
// Cadre bloc par bloc, la première saisie de présences verrouillée, « Terminer »). Les gestes sont
// ceux du banc du deuxième parcours (parcours-2-ma-classe-2026-11-09.spec.js), qui les juge, lui.
// Des noms manifestement fictifs (CLAUDE.md, règle 6).
import { expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './attendre-application.js';
import { collerLExemple } from './exemple-colle.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..', '..'), 'index.html');
// Un mardi, 9 h à Montréal : l'horaire du banc donne cours le mardi, ce cours-ci est « déjà donné ».
export const HORLOGE = new Date('2026-11-10T14:00:00.000Z');

export const ELEVES = [
    '2390001\t00001\tAlpaga\tAlix',
    '2390002\t00001\tBaobab\tBasile',
    '2390003\t00001\tCormoran\tCléo'
].join('\n');

export const bulle = (page) => page.locator('#parcours-bulle');

export async function ouvrirEspaceVide(page, largeur, { hauteur = 900, horloge = HORLOGE } = {}) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.clock.setFixedTime(horloge);
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
    // Les bancs jugent les parcours, pas les infobulles de l'aide dans les pages.
    await page.evaluate(() => { definirPreference('modeClair', false); document.body.classList.remove('mode-clair'); });
}

export async function ouvrirPanneau(page) {
    // Une notification qui reste (« Cette cartouche n'est pas encore créée… ») couvre le bouton du menu : les bancs
    // jugent le panneau, pas elles ; elles sont retirées avant le geste (mesuré sans captures, le 9 nov.).
    await page.evaluate(() => document.querySelectorAll('.notifications-pile > *').forEach((n) => n.remove()));
    await page.click('#entete-menu-bouton');
    await page.click('#btn-assistance-menu');
    await expect(page.locator('#panneau-assistance')).toBeVisible();
}

export async function attendreEtape(page, n, total, titre, { focus = true } = {}) {
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(n + ' sur ' + total, { timeout: 15000 });
    if (titre) await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(titre);
    if (focus) await expect(bulle(page)).toBeFocused();
}

export async function contourSur(page, selecteur, idContour = 'parcours-contour') {
    await expect.poll(() => page.evaluate(([sel, id]) => {
        const c = document.getElementById(id);
        const el = document.querySelector(sel);
        if (!c || c.hidden || !el) return 'absent';
        const a = c.getBoundingClientRect(), b = el.getBoundingClientRect();
        const dx = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
        const dy = Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2);
        return dx < 3 && dy < 3 ? 'posé' : 'décalé de ' + Math.round(dx) + ', ' + Math.round(dy);
    }, [selecteur, idContour]), { message: 'contour posé sur ' + selecteur, timeout: 5000 }).toBe('posé');
}

/**
 * Deux passages de la sonde du moteur : la couche des flèches reçoit une marque (sa largeur), et chaque passage la
 * remplace (`sonder` la dimensionne, puis lit l'état atteint, d'un seul tenant ; 10 nov. 2026 : le voile est retiré). Une condition observable, pas un délai : après elle, une étape qui
 * devait avancer l'a fait.
 */
export async function deuxSondes(page) {
    for (let k = 0; k < 2; k++) {
        await page.evaluate(() => document.getElementById('parcours-fleches').setAttribute('width', '1'));
        await page.waitForFunction(() => document.getElementById('parcours-fleches').getAttribute('width') !== '1');
    }
}

/** L'élément est entier dans la fenêtre (le parcours l'y amène au passage de la sonde : on attend qu'il y soit). */
export async function entierDansLaFenetre(page, selecteur, contexte = '') {
    await expect.poll(() => page.evaluate((sel) => {
        const e = document.querySelector(sel);
        if (!e) return 'absent';
        const r = e.getBoundingClientRect();
        return r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth ? 'entier'
            : `de ${Math.round(r.top)} à ${Math.round(r.bottom)} pour ${innerHeight}`;
    }, selecteur), { message: (contexte ? contexte + ' : ' : '') + selecteur + ' entier dans la fenêtre' }).toBe('entier');
}

export async function bulleNeCouvrePas(page, selecteur, contexte = '') {
    const chevauche = await page.evaluate((sel) => {
        const c = document.querySelector(sel);
        if (!c) return 'absent';
        const a = c.getBoundingClientRect(), b = document.getElementById('parcours-bulle').getBoundingClientRect();
        return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
    }, selecteur);
    expect(chevauche, (contexte ? contexte + ' : ' : '') + 'la bulle ne couvre pas ' + selecteur).toBe(false);
}

/** Une capture pour Grégoire, si le banc en demande (CAPTURES_PARCOURS=<dossier>). */
export async function capture(page, dossier, nom) {
    if (!dossier) return;
    fs.mkdirSync(dossier, { recursive: true });
    await page.mouse.move(2, (page.viewportSize().height / 2) | 0);
    await page.evaluate(() => window.accompagnement && window.accompagnement.masquerHover && window.accompagnement.masquerHover());
    // Les messages « … créé. » s'empilent : le banc va plus vite qu'eux. Ils ne sont pas ce qu'on juge.
    await page.evaluate(() => document.querySelectorAll('.notifications-pile > *').forEach((n) => n.remove()));
    await page.waitForFunction(() => document.getAnimations()
        .filter((a) => a.effect && a.effect.target && a.effect.target.closest
            && a.effect.target.closest('#panneau-assistance, #parcours-bulle, #entete-menu-panneau, .accordeon'))
        .every((a) => a.playState !== 'running'));
    await page.screenshot({ path: path.join(dossier, nom + '.png') });
}

async function choisirPremiere(page, id) {
    const valeur = await page.evaluate((i) => [...document.querySelectorAll('#' + i + ' option')]
        .filter((o) => o.value && !o.disabled).map((o) => o.value)[0], id);
    if (!(await page.inputValue('#' + id))) await page.selectOption('#' + id, valeur);
}

/**
 * « Mettre ta classe en place », joué par ses gestes, de « Commencer » à « Terminer » : un trimestre d'automne
 * 2026, le cours 601-101-MQ, un profil, trois étudiant·es fictifs, un horaire le mardi, le groupe-cours, puis
 * la première saisie de présences verrouillée.
 */
export async function mettreLaClasseEnPlace(page) {
    await page.evaluate(() => Assistance.parcours().find((p) => p.id === 'classe').lancer(0));
    await attendreEtape(page, 1, 8, 'Ton trimestre', { focus: false });
    await page.fill('#v2-nomTrimestre', 'Automne 2026');
    await page.selectOption('#v2-sessionTrimestre', 'automne');
    await page.fill('#v2-anneeTrimestre', '2026');
    await page.fill('#v2-debutTrimestre', '2026-08-24');
    await page.fill('#v2-finCours', '2026-12-11');
    await page.fill('#v2-finTrimestre', '2026-12-21');
    await page.click('#v2-btnCreerTrimestre');

    await attendreEtape(page, 2, 8, 'Ton cours', { focus: false });
    await page.fill('#v2-codeCours', '601-101-MQ');
    await page.fill('#v2-nomCours', 'Écriture et littérature');
    const discipline = await page.evaluate(() => [...document.querySelectorAll('#v2-disciplineCours option')].map((o) => o.value).find(Boolean));
    await page.selectOption('#v2-disciplineCours', discipline);
    await page.fill('#v2-ponderation', '2-2-3');
    await page.click('#v2-btnCreerCours');

    await attendreEtape(page, 3, 8, 'Ton profil', { focus: false });
    await page.fill('#v2-ens-prenom', 'Camille');
    await page.fill('#v2-ens-nom', 'Fictive');
    await page.fill('#v2-ens-courriel', 'camille@exemple.org');
    await page.fill('#v2-ens-institution', 'Cégep imaginaire');
    await page.click('#v2-btnCreerEnseignant');

    await attendreEtape(page, 4, 8, 'Ta classe', { focus: false });
    await page.fill('#v2-donneesCollees', ELEVES);
    await page.click('#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]');
    await page.click('#v2-btnConfirmerImport');

    await attendreEtape(page, 5, 8, 'Ton horaire', { focus: false });
    await page.selectOption('#v2-hor-groupeAssocie', '00001');
    await page.fill('#v2-hor-nom', 'Mardi matin');
    await page.selectOption('#v2-hor-nbSeances', '1');
    await page.selectOption('#v2-hor-seance-0-jour', 'Mardi');
    await page.fill('#v2-hor-seance-0-debut', '08:00');
    await page.fill('#v2-hor-seance-0-fin', '10:00');
    await page.fill('#v2-hor-seance-0-periodes', '2');
    await page.click('#v2-btnCreerHoraire');

    await attendreEtape(page, 6, 8, 'Ton groupe-cours', { focus: false });
    for (const id of ['v2-gc-trimestre', 'v2-gc-cours', 'v2-gc-groupe', 'v2-gc-horaire', 'v2-gc-enseignant']) await choisirPremiere(page, id);
    await page.click('#v2-btnCreerGroupeCours');

    await attendreEtape(page, 7, 8, 'Ton premier cours', { focus: false });
    await expect(page.locator('#btnVerrouillerSaisiePresences')).toBeVisible();
    await page.click('#btnVerrouillerSaisiePresences');
    await attendreEtape(page, 8, 8, "Ta classe d'un coup d'œil", { focus: false });
    await bulle(page).getByRole('button', { name: 'Terminer' }).click();
    await expect(bulle(page)).toHaveCount(0);
    expect(await page.evaluate(() => Assistance.etatDe('classe').etat)).toBe('fait');
}

// ---------- Mon matériel : l'exemple « Journal de lecture », étiqueté (les gestes du banc de la dissection, 2b) ----------

export const NIVEAUX_EXEMPLE = ['Insuffisant', 'Partiel', 'Satisfaisant', 'Remarquable'];
const CRITERES_EXEMPLE = ['L’étudiant·e résume l’œuvre avec justesse', 'L’étudiant·e relève des procédés d’écriture',
    'L’étudiant·e relie l’œuvre aux notions du cours', 'L’étudiant·e exprime une appréciation argumentée'];
const DESCRIPTEURS_EXEMPLE = ['Résumé absent ou erroné', 'Résume quelques événements', 'Résume l’essentiel', 'Résume avec précision et concision',
    'Aucun procédé relevé', 'Relève un procédé', 'Relève quelques procédés', 'Relève et illustre plusieurs procédés',
    'Liens absents', 'Établit un lien', 'Établit quelques liens', 'Établit des liens nombreux et pertinents',
    'Appréciation absente', 'Donne une opinion', 'Justifie son opinion', 'Argumente avec nuance'];

/**
 * Une étiquette en main, puis un toucher de souris sur CHAQUE morceau nommé (12 nov. 2026 : plus un glisser, qui relit le
 * point touché et tombait sur la bulle, placée selon l'aide pas à pas). Sans Échap : il fermerait un parcours.
 */
export async function etiqueter(page, type, textes) {
    await page.locator('#dissection-palette [data-param="' + type + '"]').click();
    await page.evaluate((ts) => {
        const blocs = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].filter((b) => ts.includes(b.textContent));
        const centre = (b) => { b.scrollIntoView({ block: 'center', inline: 'center' }); const r = b.getBoundingClientRect(); return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }; };
        const ev = (t, p) => new PointerEvent(t, Object.assign({ bubbles: true, cancelable: true, pointerId: 7, pointerType: 'mouse', isPrimary: true }, p));
        blocs.forEach((b) => { const p = centre(b); b.dispatchEvent(ev('pointerdown', p)); b.dispatchEvent(ev('pointerup', p)); });
    }, textes);
}

/** L'exemple étiqueté jusqu'au choix « des points / des niveaux » (la grille porte les deux). */
export async function etiqueterExemple(page) {
    await collerLExemple(page);
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    await etiqueter(page, 'titre', ['Journal de lecture']);
    await etiqueter(page, 'section', ['PARTIE A : COMPRÉHENSION', 'PARTIE B : RÉFLEXION']);
    await etiqueter(page, 'niveau', NIVEAUX_EXEMPLE);
    await etiqueter(page, 'critere', CRITERES_EXEMPLE);
    await etiqueter(page, 'descripteur', DESCRIPTEURS_EXEMPLE);
    await etiqueter(page, 'points', ['2', '3-4', '5', '3', '4', '4-5', '6-7', '8-10', '6-8', '9-10']);
    await expect(page.locator('#dissection-creer-choix')).toBeVisible();
}

/** « des niveaux », et ce que vaut chaque niveau. */
export async function choisirDesNiveaux(page) {
    await page.locator('label:has(#dissection-compte-niveaux)').click();
    const saisies = [['0', '59', '40'], ['60', '69', '65'], ['70', '84', '77,5'], ['85', '100', '92']];
    for (let i = 0; i < saisies.length; i++) {
        for (const [k, quoi] of ['min', 'max', 'note'].entries()) {
            await page.locator('#dissection-niv-' + i + '-' + quoi).pressSequentially(saisies[i][k]);
        }
    }
}
