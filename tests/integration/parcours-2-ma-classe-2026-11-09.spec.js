import { test, expect } from '@playwright/test';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';
import { flecheVers, nombreDeFleches } from './harness/fleches-de-banc.js';

// =======================================================================
// LOT « LES DEUX PARCOURS » — PARTIE 2 (9 NOVEMBRE 2026) : « METTRE TA CLASSE EN PLACE »
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md, partie 2. Ce banc juge, en faisant
// les gestes eux-mêmes (remplir, toucher « Créer… ») :
//   · le bout en bout : « Découvrir » sur la démo, « Commencer avec ma classe », puis le deuxième
//     parcours depuis un espace vide jusqu'à la bande d'assiduité de son propre groupe ;
//   · chaque étape du Cadre ouvre son bloc (et son formulaire « + Nouveau… »), pose le contour sur
//     le bouton de création, et n'avance que quand la donnée est ENREGISTRÉE (un refus n'avance pas) ;
//   · « Plus tard » ferme la bulle, le panneau dit « Étape n sur 8 » et « Reprendre », rien ne
//     rouvre de lui-même ; « Reprendre » repart à la même étape ;
//   · la première étape non faite : un trimestre déjà là, le parcours commence au cours ;
//   · la porte de l'accueil (« Commencer », carte enseignant) lance le même parcours ;
//   · la variante d'avant le premier cours (« D'accord », puis « Reprendre » la rouvre) ;
//   · le défaut de la consigne : juste après la création du groupe-cours, sans rechargement,
//     Suivi › Présences propose la date du cours le plus récent, avec « Verrouiller la saisie ».
// L'apparence se juge sur capture : CAPTURES_PARCOURS=<dossier> npx playwright test parcours-2-ma-classe
// ⚠ Cloud du 9 nov. : ce banc a tourné sous Chromium (playwright.chromium.config.js) ; le verdict
// WebKit se prend sur le Mac.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
// Un mardi, 9 h à Montréal : l'horaire du banc donne cours le mardi, ce cours-ci est « déjà donné ».
const HORLOGE = new Date('2026-11-10T14:00:00.000Z');
const CAPTURES = process.env.CAPTURES_PARCOURS || '';

// Des noms manifestement fictifs (CLAUDE.md, règle 6).
const ELEVES = [
    '2390001\t00001\tAlpaga\tAlix',
    '2390002\t00001\tBaobab\tBasile',
    '2390003\t00001\tCormoran\tCléo'
].join('\n');

async function capture(page, nom) {
    if (!CAPTURES) return;
    fs.mkdirSync(CAPTURES, { recursive: true });
    await page.mouse.move(2, (page.viewportSize().height / 2) | 0);
    await page.evaluate(() => window.accompagnement && window.accompagnement.masquerHover && window.accompagnement.masquerHover());
    // Les messages « … créé. » s'empilent : le banc va plus vite qu'eux. Ils ne sont pas ce qu'on juge.
    await page.evaluate(() => document.querySelectorAll('.notifications-pile > *').forEach((n) => n.remove()));
    await page.waitForFunction(() => document.getAnimations()
        .filter((a) => a.effect && a.effect.target && a.effect.target.closest
            && a.effect.target.closest('#panneau-assistance, #parcours-bulle, #entete-menu-panneau, .accordeon'))
        .every((a) => a.playState !== 'running'));
    await page.screenshot({ path: path.join(CAPTURES, nom + '.png') });
}

async function ouvrirEspaceVide(page, largeur, { hauteur = 900, horloge = HORLOGE } = {}) {
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
    // Le banc juge le parcours, pas les infobulles de l'aide dans les pages.
    await page.evaluate(() => { definirPreference('modeClair', false); document.body.classList.remove('mode-clair'); });
}

async function ouvrirPanneau(page) {
    await page.click('#entete-menu-bouton');
    await page.click('#btn-assistance-menu');
    await expect(page.locator('#panneau-assistance')).toBeVisible();
}

const bulle = (page) => page.locator('#parcours-bulle');

async function attendreEtape(page, n, titre, { focus = true } = {}) {
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(n + ' sur 8', { timeout: 10000 });
    if (titre) await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(titre);
    // La bulle prend le focus à son arrivée (un geste du banc dans la page le lui reprend ensuite).
    if (focus) await expect(bulle(page)).toBeFocused();
}

async function contourSur(page, selecteur, idContour = 'parcours-contour') {
    await expect.poll(() => page.evaluate(([sel, id]) => {
        const c = document.getElementById(id);
        const el = document.querySelector(sel);
        if (!c || c.hidden || !el) return 'absent';
        const a = c.getBoundingClientRect(), b = el.getBoundingClientRect();
        const dx = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
        const dy = Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2);
        return dx < 3 && dy < 3 ? 'posé' : 'décalé de ' + Math.round(dx) + ', ' + Math.round(dy);
    }, [selecteur, idContour]), { message: 'contour posé sur ' + selecteur, timeout: 3000 }).toBe('posé');
}

async function bulleNeCouvrePas(page, selecteur, contexte = '') {
    const chevauche = await page.evaluate((sel) => {
        const c = document.querySelector(sel);
        if (!c) return 'absent';
        const a = c.getBoundingClientRect(), b = document.getElementById('parcours-bulle').getBoundingClientRect();
        return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
    }, selecteur);
    expect(chevauche, (contexte ? contexte + ' : ' : '') + 'la bulle ne couvre pas ' + selecteur).toBe(false);
}

const rang = (page) => page.locator('#assistance-menu-rang');
// Groupe 2 (9 nov.) : le nombre de parcours se lit sur le registre, comme au banc des parcours 1 et 2 (d'autres s'y ajoutent).
const nParcours = (page) => page.evaluate(() => window.Assistance.parcours().length);

// 9 nov. 2026 (capture WebKit de l'étape 7) : la flèche didactique des présences, demandée par l'API publique ;
// rend vrai si elle est visible 400 ms plus tard (après son délai de stabilisation de 150 ms).
async function flecheDesPresencesVisible(page) {
    return page.evaluate(() => new Promise((ok) => {
        window.accompagnement.afficherFleche('suivi-presences-premiere-saisie');
        setTimeout(() => {
            const h = document.getElementById('fleche-didactique-host');
            ok(!!h && h.classList.contains('visible') && getComputedStyle(h).display !== 'none');
        }, 400);
    }));
}

/** Note chaque titre de bulle rendu, pour dire quelles étapes ont paru, même un instant. */
async function noterLesBulles(page) {
    await page.evaluate(() => {
        window.__bullesVues = [];
        const noter = () => {
            const t = document.getElementById('parcours-bulle-titre');
            const titre = t ? t.textContent : null;
            if (titre && window.__bullesVues[window.__bullesVues.length - 1] !== titre) window.__bullesVues.push(titre);
        };
        new MutationObserver(noter).observe(document.body, { childList: true, subtree: true, characterData: true });
    });
}
const bullesVues = (page) => page.evaluate(() => window.__bullesVues);

// ---------- Les gestes de chaque étape, tels qu'une personne les fait ----------

async function remplirTrimestre(page, { debut = '2026-08-24' } = {}) {
    await page.fill('#v2-nomTrimestre', 'Automne 2026');
    await page.selectOption('#v2-sessionTrimestre', 'automne');
    await page.fill('#v2-anneeTrimestre', '2026');
    await page.fill('#v2-debutTrimestre', debut);
    await page.fill('#v2-finCours', '2026-12-11');
    await page.fill('#v2-finTrimestre', '2026-12-21');
    await page.click('#v2-btnCreerTrimestre');
}

async function remplirCours(page) {
    await page.fill('#v2-codeCours', '601-101-MQ');
    await page.fill('#v2-nomCours', 'Écriture et littérature');
    const discipline = await page.evaluate(() => [...document.querySelectorAll('#v2-disciplineCours option')].map((o) => o.value).find(Boolean));
    await page.selectOption('#v2-disciplineCours', discipline);
    await page.fill('#v2-ponderation', '2-2-3');
    await page.click('#v2-btnCreerCours');
}

async function remplirProfil(page) {
    await page.fill('#v2-ens-prenom', 'Camille');
    await page.fill('#v2-ens-nom', 'Fictive');
    await page.fill('#v2-ens-courriel', 'camille@exemple.org');
    await page.fill('#v2-ens-institution', 'Cégep imaginaire');
    await page.click('#v2-btnCreerEnseignant');
}

async function remplirHoraire(page) {
    await page.selectOption('#v2-hor-groupeAssocie', '00001');
    await page.fill('#v2-hor-nom', 'Mardi matin');
    await page.selectOption('#v2-hor-nbSeances', '1');
    await page.selectOption('#v2-hor-seance-0-jour', 'Mardi');
    await page.fill('#v2-hor-seance-0-debut', '08:00');
    await page.fill('#v2-hor-seance-0-fin', '10:00');
    await page.fill('#v2-hor-seance-0-periodes', '2');
    await page.click('#v2-btnCreerHoraire');
}

async function remplirGroupeCours(page) {
    for (const id of ['v2-gc-trimestre', 'v2-gc-cours', 'v2-gc-groupe', 'v2-gc-horaire', 'v2-gc-enseignant']) {
        const valeur = await page.evaluate((i) => [...document.querySelectorAll('#' + i + ' option')]
            .filter((o) => o.value && !o.disabled).map((o) => o.value)[0], id);
        if (!(await page.inputValue('#' + id))) await page.selectOption('#' + id, valeur);
    }
    await page.click('#v2-btnCreerGroupeCours');
}

// Ce que chaque étape demande de remplir (les champs requis) : à l'écran, hors de la bulle.
const CHAMPS = {
    1: ['#v2-nomTrimestre', '#v2-sessionTrimestre', '#v2-anneeTrimestre', '#v2-debutTrimestre', '#v2-finCours', '#v2-finTrimestre'],
    2: ['#v2-codeCours', '#v2-nomCours', '#v2-ponderation', '#v2-disciplineCours'],
    3: ['#v2-ens-prenom', '#v2-ens-nom', '#v2-ens-courriel', '#v2-ens-institution'],
    4: ['#v2-donneesCollees'],
    5: ['#v2-hor-groupeAssocie', '#v2-hor-nom', '#v2-hor-nbSeances'],
    6: ['#v2-gc-trimestre', '#v2-gc-cours', '#v2-gc-groupe', '#v2-gc-horaire', '#v2-gc-enseignant']
};

/** Les étapes 1 à 6 du Cadre, chacune jugée ; `apresEtape(n)` laisse le banc s'interposer. */
async function faireLeCadre(page, { capturer = '', depuis = 1, premiereDejaTouchee = false, champsALEcran = true, avantGeste = async () => {}, apresEtape = async () => {} } = {}) {
    const ETAPES = [
        [1, 'Ton trimestre', '#v2-btnCreerTrimestre', remplirTrimestre],
        [2, 'Ton cours', '#v2-btnCreerCours', remplirCours],
        [3, 'Ton profil', '#v2-btnCreerEnseignant', remplirProfil],
        [4, 'Ta classe', '#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]', null],
        [5, 'Ton horaire', '#v2-btnCreerHoraire', remplirHoraire],
        [6, 'Ton groupe-cours', '#v2-btnCreerGroupeCours', remplirGroupeCours]
    ];
    for (const [n, titre, bouton, remplir] of ETAPES.filter(([n]) => n >= depuis)) {
        await attendreEtape(page, n, titre, { focus: !(premiereDejaTouchee && n === depuis) });
        await contourSur(page, bouton);
        if (capturer && !(premiereDejaTouchee && n === depuis)) await capture(page, `classe-${n}-${capturer}`);
        // Sur l'iPhone, un formulaire plus haut que l'écran ne laisse pas de place à la bulle : le moteur
        // la range au bord, et elle peut mordre sur l'anneau du contour. Le bouton, lui, reste libre.
        await bulleNeCouvrePas(page, champsALEcran ? '#parcours-contour' : bouton, `étape ${n}`);
        // Les champs du formulaire éclairé sont à l'écran, et la bulle ne les couvre pas.
        for (const sel of champsALEcran ? (CHAMPS[n] || []) : []) {
            await expect(page.locator(sel), `étape ${n} : ${sel} à l'écran`).toBeInViewport();
            await bulleNeCouvrePas(page, sel);
        }
        await avantGeste(n);
        if (n === 4) {
            // Seule la zone « Importer des étudiant·es » est éclairée ; « Prévisualiser », puis « Confirmer ».
            await page.fill('#v2-donneesCollees', ELEVES);
            await page.click(bouton);
            await contourSur(page, '#v2-btnConfirmerImport');
            await page.click('#v2-btnConfirmerImport');
        } else {
            await remplir(page);
        }
        await apresEtape(n);
    }
}

// ---------- Les bancs ----------
// Deux essais qui tournent toujours (le bout en bout ; la porte de l'accueil et la variante d'avant le
// premier cours), et un troisième qui ne tourne que pour les captures de l'iPhone (BOUCLE-SANS-RELAIS,
// § 4, point 3 : pas d'essai Playwright de plus que ce que l'écran exige).

test('de « Découvrir » à sa propre classe : « Commencer avec ma classe », le Cadre bloc par bloc, « Plus tard » puis « Reprendre », la première saisie, la bande (1180 px)', async ({ page }) => {
    test.setTimeout(180000);
    await ouvrirEspaceVide(page, 1180);
    // Le stock d'avant le 11 sept. : une date verrouillée sous la clé nue. La saisie la sème chez le
    // groupe-cours neuf ; l'étape 7 ne doit pas la prendre pour sa première saisie (relecture du 9 nov.).
    await page.evaluate(() => db.setSync('datesVerrouillees', ['2026-03-10']));

    // « Découvrir » sur la démo, jusqu'à sa dernière bulle (son banc à lui juge chaque étape).
    await ouvrirPanneau(page);
    await page.click('#panneau-assistance [data-parcours="decouvrir"] .assistance-parcours-bouton');
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('1 sur 8', { timeout: 10000 });
    expect(await page.evaluate(() => estEnModeDemo())).toBe(true);
    await page.evaluate(() => ParcoursMoteur.allerA(7));
    await expect(bulle(page).getByRole('button', { name: 'Commencer avec ma classe' })).toBeVisible({ timeout: 10000 });
    await bulle(page).getByRole('button', { name: 'Commencer avec ma classe' }).click();

    // La démo est refermée ; le deuxième parcours part de sa première étape, sur un espace vide.
    await attendreEtape(page, 1, 'Ton trimestre');
    expect(await page.evaluate(() => estEnModeDemo())).toBe(false);
    expect(await page.evaluate(() => Assistance.etatDe('decouvrir').etat)).toBe('fait');
    expect(await page.evaluate(() => Assistance.etatDe('classe'))).toEqual({ etat: 'en-cours', etape: 0 });
    await expect(page.locator('#calendrier-trimestre')).toBeVisible();
    await expect(rang(page)).toHaveText('2 sur ' + await nParcours(page));
    // Le haut du formulaire (nom, session, année) et « Créer le trimestre » sont à l'écran, la bulle à côté.
    for (const sel of ['#v2-nomTrimestre', '#v2-sessionTrimestre', '#v2-anneeTrimestre', '#v2-finTrimestre', '#v2-btnCreerTrimestre']) {
        await expect(page.locator(sel)).toBeInViewport();
        await bulleNeCouvrePas(page, sel);
    }
    await contourSur(page, '#v2-btnCreerTrimestre');
    await capture(page, 'classe-1-1180-sombre');

    // Un refus n'avance pas : « Créer le trimestre » sans session ni année.
    await page.click('#v2-btnCreerTrimestre');
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('1 sur 8');
    expect(await page.evaluate(() => db.getSync('trimestreActif', null))).toBeNull();

    await faireLeCadre(page, {
        capturer: '1180-sombre',
        premiereDejaTouchee: true,
        avantGeste: async (n) => {
            if (n !== 3) return;
            // « Plus tard » ferme la bulle ; le parcours attend à l'étape 3, rien ne le rouvre.
            await bulle(page).getByRole('button', { name: 'Plus tard' }).click();
            await expect(bulle(page)).toHaveCount(0);
            expect(await page.evaluate(() => document.body.classList.contains('parcours-actif'))).toBe(false);
            expect(await page.evaluate(() => Assistance.etatDe('classe'))).toEqual({ etat: 'en-cours', etape: 2 });
            await page.evaluate(() => naviguerVers('suivi', 'groupe'));
            await page.reload();
            await attendreApplication(page);
            await expect(bulle(page)).toHaveCount(0);
            await expect(rang(page)).toHaveText('2 sur ' + await nParcours(page));
            // Le panneau dit où il attend ; « Reprendre » repart au profil.
            await ouvrirPanneau(page);
            const item = page.locator('#panneau-assistance [data-parcours="classe"]');
            await expect(item.locator('.assistance-parcours-etat')).toHaveText('Étape 3 sur 8');
            await expect(item.locator('.assistance-parcours-bouton')).toHaveText('Reprendre');
            await item.locator('.assistance-parcours-bouton').click();
            await attendreEtape(page, 3, 'Ton profil');
            await contourSur(page, '#v2-btnCreerEnseignant');
        },
        apresEtape: async (n) => {
            if (n === 6) {
                // Le groupe paraît dans l'en-tête dès sa création.
                await expect(page.locator('#selectGroupeCoursHeader')).toContainText('601-101-MQ');
            }
        }
    });

    // Étape 7 : Suivi › Présences, la date du cours le plus récent proposée DÈS L'ARRIVÉE (le défaut
    // de la consigne), les deux contours : la date et « Verrouiller la saisie ».
    // Break-test (9 nov.) : la correction retirée de js/saisie-presences.js → ROUGE ici (date vide).
    await attendreEtape(page, 7, 'Ton premier cours');
    await expect(page.locator('#suivi-saisie')).toBeVisible();
    await expect(page.locator('#date-cours')).toHaveValue('2026-11-10');
    await expect(page.locator('#btnVerrouillerSaisiePresences')).toBeVisible();
    await contourSur(page, '#btnVerrouillerSaisiePresences');
    await contourSur(page, '#date-cours', 'parcours-contour-date');
    await bulleNeCouvrePas(page, '#parcours-contour');
    await bulleNeCouvrePas(page, '#parcours-contour-date');
    await expect(page.locator('#tbody-saisie-presences tr')).toHaveCount(3);
    // 11 nov. 2026 (second essai) : les flèches vont au choix du cours et à la colonne Présence ; la bulle ne couvre ni
    // l'un, ni l'autre, ni les noms qu'il faut voir pour noter une absence.
    await flecheVers(page, '#suivi-saisie .d-flex-gap8-center', 'étape 7, le choix du cours');
    await flecheVers(page, ['#suivi-saisie th:has([data-tooltip="presences-presence-col"])', '#tbody-saisie-presences td:has(.input-periodes)'], 'étape 7, la colonne Présence');
    await bulleNeCouvrePas(page, '#suivi-saisie .d-flex-gap8-center', 'étape 7');
    for (const k of [1, 2, 3]) await bulleNeCouvrePas(page, `#tbody-saisie-presences tr:nth-child(${k}) td:nth-child(3)`, 'étape 7');
    // Pendant le parcours, la bulle parle seule : aucune flèche didactique ne s'y ajoute (décision de Grégoire, 9 nov.).
    expect(await flecheDesPresencesVisible(page), 'étape 7 : pas de flèche orange par-dessus la bulle').toBe(false);
    await expect(page.locator('.fleche-didactique-cible'), 'étape 7 : aucune cible de flèche contournée').toHaveCount(0);
    await capture(page, 'classe-7-1180-sombre');
    await page.click('#btnVerrouillerSaisiePresences');

    // Étape 8 : la bande d'assiduité de SON groupe, éclairée ; « Terminer ».
    await attendreEtape(page, 8, "Ta classe d'un coup d'œil");
    await expect(page.locator('#parcours-contour-date')).toHaveCount(0);
    await expect(page.locator('#suivi-groupe')).toBeVisible();
    await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
    await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Terminer']);
    await capture(page, 'classe-8-1180-sombre');
    await bulle(page).getByRole('button', { name: 'Terminer' }).click();

    await expect(bulle(page)).toHaveCount(0);
    // Témoins, hors parcours : la flèche des présences n'a pas été marquée vue pendant le parcours, et une flèche
    // s'ouvre de nouveau (sur une cible stable : la cellule des présences peut être redessinée pendant l'attente).
    expect(await page.evaluate(() => localStorage.getItem('accompagnement-vu__suivi-presences-premiere-saisie'))).toBeNull();
    const revient = await page.evaluate(() => new Promise((ok) => {
        window.accompagnement.afficherFleche('essai-fleche-hors-parcours', { sectionActive: 'essai', cibleSelector: '#btn-assistance-menu', message: 'Essai', direction: 'bas' });
        setTimeout(() => ok(document.getElementById('fleche-didactique-host').classList.contains('visible')), 400);
    }));
    expect(revient, 'hors parcours, une flèche s’ouvre de nouveau').toBe(true);
    expect(await page.evaluate(() => Assistance.etatDe('classe').etat)).toBe('fait');
    // Les deux premiers faits : le rang passe au troisième parcours, s'il y en a un ; sinon, rien.
    const n = await nParcours(page);
    await expect(rang(page)).toHaveText(n > 2 ? '3 sur ' + n : '');
    await ouvrirPanneau(page);
    const item = page.locator('#panneau-assistance [data-parcours="classe"]');
    await expect(item.locator('.assistance-parcours-etat')).toHaveText('Fait');
    await expect(item.locator('.assistance-parcours-bouton')).toHaveText('Refaire');

    // « Refaire », tout étant en place : la première étape non faite est la dernière ; aucune autre
    // bulle ne paraît, même un instant.
    await noterLesBulles(page);
    await item.locator('.assistance-parcours-bouton').click();
    await attendreEtape(page, 8, "Ta classe d'un coup d'œil");
    expect(await bullesVues(page)).toEqual(["Ta classe d'un coup d'œil"]);
    await bulle(page).getByRole('button', { name: 'Terminer' }).click();
});

test('la porte de l’accueil commence à la première étape non faite ; avant le premier cours, l’étape 7 le dit, « D’accord » la ferme, « Reprendre » la rouvre', async ({ page }) => {
    test.setTimeout(150000);
    await ouvrirEspaceVide(page, 1180);
    // Le trimestre créé à la main, hors parcours. Il commence le lundi 16 novembre : au 10, aucun
    // cours du groupe n'a eu lieu.
    await page.evaluate(() => naviguerVers('calendrier', 'trimestre'));
    await page.click('#accordeon-gestion-trimestres .accordeon-header');
    await remplirTrimestre(page, { debut: '2026-11-16' });
    await expect.poll(() => page.evaluate(() => db.getSync('trimestreActif', null))).toBe('a2026');

    // « Commencer », carte « Tu enseignes ? » de l'accueil : le parcours, au cours.
    await page.evaluate(() => { afficherSection('accueil'); afficherAccueil(); });
    await noterLesBulles(page);
    await page.click('#accueil-portes .accueil-porte:first-child .accueil-porte-bouton');
    await attendreEtape(page, 2, 'Ton cours');
    // Il PART du cours : la bulle du trimestre n'a jamais paru, même un instant.
    expect(await bullesVues(page)).toEqual(['Ton cours']);
    expect(await page.evaluate(() => Assistance.etatDe('classe'))).toEqual({ etat: 'en-cours', etape: 1 });
    await faireLeCadre(page, { depuis: 2 });

    await attendreEtape(page, 7, 'Ton premier cours');
    const texte = "Ton premier cours n'a pas encore eu lieu. Reviens après l'avoir donné : le parcours reprendra ici, avec ta première saisie de présences. En attendant, tu peux préparer tes outils dans Conception.";
    await expect(bulle(page).locator('.parcours-bulle-texte')).toHaveText(texte);
    await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
    await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(["D'accord"]);
    await expect(page.locator('#parcours-contour')).toBeHidden();
    await expect(page.locator('#parcours-contour-date')).toHaveCount(0);
    await capture(page, 'classe-7-avant-premier-cours-1180-sombre');
    await bulle(page).getByRole('button', { name: "D'accord" }).click();
    await expect(bulle(page)).toHaveCount(0);
    expect(await page.evaluate(() => Assistance.etatDe('classe'))).toEqual({ etat: 'en-cours', etape: 6 });

    await ouvrirPanneau(page);
    const item = page.locator('#panneau-assistance [data-parcours="classe"]');
    await expect(item.locator('.assistance-parcours-etat')).toHaveText('Étape 7 sur 8');
    await item.locator('.assistance-parcours-bouton').click();
    await attendreEtape(page, 7, 'Ton premier cours');
    await expect(bulle(page).locator('.parcours-bulle-texte')).toHaveText(texte);
    // Échap équivaut à « D'accord ».
    await page.keyboard.press('Escape');
    await expect(bulle(page)).toHaveCount(0);
    expect(await page.evaluate(() => Assistance.etatDe('classe'))).toEqual({ etat: 'en-cours', etape: 6 });
});

// 11 nov. 2026 (Grégoire, 8 h 26) : dans une étape qui montre un formulaire, une flèche par champ obligatoire ENCORE VIDE ;
// chacune disparaît quand son champ est rempli ; quand il n'en reste aucune, seul le halo du bouton demeure.
test('les formulaires du Cadre : une flèche par champ obligatoire vide, qui part quand il est rempli ; à la fin, le halo seul', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirEspaceVide(page, 1180, { hauteur: 820 });
    await ouvrirPanneau(page);
    await page.click('#panneau-assistance [data-parcours="classe"] .assistance-parcours-bouton');
    await attendreEtape(page, 1, 'Ton trimestre');
    const TRIMESTRE = ['#v2-nomTrimestre', '#v2-sessionTrimestre', '#v2-anneeTrimestre', '#v2-debutTrimestre', '#v2-finCours', '#v2-finTrimestre'];
    await nombreDeFleches(page, 6, 'étape 1');
    for (const sel of TRIMESTRE) await flecheVers(page, sel, 'étape 1');
    await page.fill('#v2-nomTrimestre', 'Automne 2026');
    await nombreDeFleches(page, 5, 'étape 1, le nom rempli');
    await page.selectOption('#v2-sessionTrimestre', 'automne');
    await page.fill('#v2-anneeTrimestre', '2026');
    await nombreDeFleches(page, 3, 'étape 1, il reste les trois dates');
    await page.fill('#v2-debutTrimestre', '2026-08-24');
    await page.fill('#v2-finCours', '2026-12-11');
    await page.fill('#v2-finTrimestre', '2026-12-21');
    await nombreDeFleches(page, 0, 'étape 1, tout est rempli');
    await contourSur(page, '#v2-btnCreerTrimestre');
    await page.click('#v2-btnCreerTrimestre');

    // Le cours : le code, la pondération, la discipline (le nom n'est pas obligatoire).
    await attendreEtape(page, 2, 'Ton cours');
    await nombreDeFleches(page, 3, 'étape 2');
    for (const sel of ['#v2-codeCours', '#v2-ponderation', '#v2-disciplineCours']) await flecheVers(page, sel, 'étape 2');
    await remplirCours(page);

    // Le profil : les quatre champs que nomme la bulle (au second essai, une seule flèche, vers « Institution »).
    await attendreEtape(page, 3, 'Ton profil');
    await nombreDeFleches(page, 4, 'étape 3');
    for (const sel of ['#v2-ens-prenom', '#v2-ens-nom', '#v2-ens-courriel', '#v2-ens-institution']) await flecheVers(page, sel, 'étape 3');
    await page.fill('#v2-ens-prenom', 'Camille');
    await nombreDeFleches(page, 3, 'étape 3, le prénom rempli');
    await remplirProfil(page);

    // La classe : les deux façons, chacune sa flèche.
    await attendreEtape(page, 4, 'Ta classe');
    await nombreDeFleches(page, 2, 'étape 4');
    await flecheVers(page, '#v2-donneesCollees', 'étape 4');
    await flecheVers(page, '#v2-fichierCsvEntree', 'étape 4');
    await bulleNeCouvrePas(page, '#v2-fichierCsvEntree', 'étape 4');
    await page.fill('#v2-donneesCollees', ELEVES);
    await page.click('#accordeon-groupe-etudiants [data-action="previsualiserDonneesV2"]');
    await page.click('#v2-btnConfirmerImport');

    // L'horaire : le nom (au second essai, désigné par rien) et les périodes de chaque séance.
    await attendreEtape(page, 5, 'Ton horaire');
    for (const sel of ['#v2-hor-nom', '#v2-hor-seance-0-periodes', '#v2-hor-seance-1-periodes']) await flecheVers(page, sel, 'étape 5');
    await remplirHoraire(page);
    await attendreEtape(page, 6, 'Ton groupe-cours');
    await remplirGroupeCours(page);
    await attendreEtape(page, 7, 'Ton premier cours');
});

test('une flèche didactique ouverte avant le parcours se retire au lancement, sans être marquée vue, même si l’on clique sa cible', async ({ page }) => {
    await ouvrirEspaceVide(page, 1180);
    // Déjà sur la page de l'étape 1 : le lancement ne navigue pas, aucun `sectionAffichee` ne retire la flèche
    // (le cas trouvé par la relecture neuve du 9 nov.).
    await page.evaluate(() => naviguerVers('calendrier', 'trimestre'));
    await expect(page.locator('#calendrier-trimestre')).toBeVisible();
    // Une flèche ouverte hors parcours, sur une cible qui existe toujours (l'entrée « Assistance » du menu).
    const ouverte = await page.evaluate(() => new Promise((ok) => {
        window.accompagnement.afficherFleche('essai-fleche-9-nov', { sectionActive: 'essai', cibleSelector: '#btn-assistance-menu', message: 'Essai', direction: 'bas' });
        setTimeout(() => ok(document.getElementById('fleche-didactique-host').classList.contains('visible')), 400);
    }));
    expect(ouverte, 'témoin : hors parcours, la flèche s’ouvre').toBe(true);
    await expect(page.locator('#btn-assistance-menu.fleche-didactique-cible')).toHaveCount(1);

    await page.evaluate(() => Assistance.parcours().find((p) => p.id === 'classe').lancer());
    await attendreEtape(page, 1, 'Ton trimestre');
    await expect(page.locator('#fleche-didactique-host')).not.toHaveClass(/visible/);
    await expect(page.locator('.fleche-didactique-cible')).toHaveCount(0);
    // Un clic sur l'ancienne cible, pendant le parcours, ne marque rien.
    await page.evaluate(() => document.getElementById('btn-assistance-menu').dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(await page.evaluate(() => localStorage.getItem('accompagnement-vu__essai-fleche-9-nov'))).toBeNull();
});

test('captures de l’iPhone (390 px) : les étapes 1, 7 et 8', async ({ page }) => {
    test.skip(!CAPTURES, 'captures seulement (CAPTURES_PARCOURS)');
    test.setTimeout(180000);
    await ouvrirEspaceVide(page, 390, { hauteur: 844 });
    await page.evaluate(() => Assistance.parcours().find((p) => p.id === 'classe').lancer());
    await attendreEtape(page, 1, 'Ton trimestre');
    await capture(page, 'classe-1-390-sombre');
    // Sur l'iPhone, un formulaire du Cadre est plus haut que l'écran : on le fait défiler (rapport).
    await faireLeCadre(page, { champsALEcran: false });
    await attendreEtape(page, 7, 'Ton premier cours');
    await expect(page.locator('#date-cours')).toHaveValue('2026-11-10');
    await capture(page, 'classe-7-390-sombre');
    await page.click('#btnVerrouillerSaisiePresences');
    await attendreEtape(page, 8, "Ta classe d'un coup d'œil");
    await capture(page, 'classe-8-390-sombre');
    for (const r of [await bulle(page).boundingBox()]) {
        expect(r.x).toBeGreaterThanOrEqual(0);
        expect(r.x + r.width).toBeLessThanOrEqual(390);
    }
});
