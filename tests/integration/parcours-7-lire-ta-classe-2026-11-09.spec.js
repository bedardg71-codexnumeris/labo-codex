import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';
import { attendreRepos, suivreLesReactions } from './harness/attendre-repos.js';

// =======================================================================
// LE SEPTIÈME PARCOURS, « LIRE TA CLASSE ET INTERVENIR » — 9 NOVEMBRE 2026
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-7-lire-ta-classe.md. Sur un groupe-cours RÉEL
// monté par les formulaires du Cadre, présences prises par l'écran de saisie. Ce banc juge :
//   · la condition d'entrée : le bouton du panneau refuse sans présences (le panneau dit pourquoi),
//     refuse quand personne ne s'écarte, et lance le parcours dès qu'UNE personne est sous le seuil
//     d'assiduité, sans aucune évaluation (le test de la consigne, qui échoue avant ce lot) ;
//   · les neuf étapes, en faisant les gestes : chaque étape avance sur l'état atteint ; l'étape 5
//     seulement quand aucune grille de dépistage n'est désignée ;
//   · les pastilles d'absence (étape 3) et le statut (étape 8) restent sous le voile ;
//   · « Plus tard » ferme la bulle, « Reprendre » repart à la même étape ;
//   · la fin : une intervention créée, son nom coché, son « avant » figé ; le parcours « Fait ».
// L'apparence se juge sur capture : CAPTURES_PARCOURS=<dossier> npx playwright test parcours-7
// ⚠ Horloge NON figée, comme graphique-suit-les-presences : sous setFixedTime, une attente de l'application
// relance ses minuteries de 100 ms sans fin et attendreRepos ne voit jamais le repos (mesuré le 9 nov.).
// ⚠ Chromium dans le cloud du 9 nov. (WebKit n'y existe pas) : le verdict WebKit se prend sur le Mac.
// Noms manifestement fictifs.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
const CAPTURES = process.env.CAPTURES_PARCOURS || '';

const DEBUT = '2026-08-17';
const FIN_COURS = '2026-12-11';
const FIN_TRIMESTRE = '2026-12-21';
const MARDI = '2026-08-25';
const JEUDI = '2026-08-27';

const ELEVES = [
    { da: '2109001', nom: 'Loutre', prenom: 'Agile' },
    { da: '2109002', nom: 'Hérisson', prenom: 'Brave' },
    { da: '2109003', nom: 'Héron', prenom: 'Calme' },
    { da: '2109004', nom: 'Lynx', prenom: 'Discret' },
    { da: '2109005', nom: 'Mésange', prenom: 'Espiègle' },
    { da: '2109006', nom: 'Marmotte', prenom: 'Fidèle' }
];
const ECARTE = ELEVES[0];
const GRILLE = { id: 'G_DEPISTAGE_BANC', nom: 'Grille de lecture (banc)', type: 'analytique', criteres: [
    { id: 'c_structure', nom: 'Structure', ponderation: 40, type: 'analytique', description: 'Organiser le propos' },
    { id: 'c_nuance', nom: 'Nuance', ponderation: 30, type: 'analytique', description: 'Nuancer le propos' },
    { id: 'c_langue', nom: 'Langue', ponderation: 30, type: 'analytique', description: 'Écrire une langue correcte' }
] };

const REFUS_SANS_PRESENCES = 'Commence par « Mettre ta classe en place » : tes présences donnent le premier signal.';
const REFUS_PERSONNE = "Personne ne s'écarte dans ton groupe pour l'instant. Reviens quand le Suivi signale quelqu'un.";

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.accept().catch(() => {}));
    return erreurs;
}

async function capture(page, nom) {
    if (!CAPTURES) return;
    fs.mkdirSync(CAPTURES, { recursive: true });
    await page.mouse.move(2, (page.viewportSize().height / 2) | 0);
    await page.evaluate(() => window.accompagnement && window.accompagnement.masquerHover && window.accompagnement.masquerHover());
    await page.waitForFunction(() => document.getAnimations()
        .filter((a) => a.effect && a.effect.target && a.effect.target.closest
            && a.effect.target.closest('#panneau-assistance, #parcours-voile, #parcours-bulle, #entete-menu-panneau'))
        .every((a) => a.playState !== 'running'));
    // Pas de pause : chaque capture suit la bulle focalisée (le moteur la focalise APRÈS un passage de sa sonde,
    // qui pose trous, masques et contour) ou un contour constaté posé (contourSur).
    await page.screenshot({ path: path.join(CAPTURES, nom + '.png') });
}

async function poserTheme(page, clair) {
    await page.evaluate((c) => {
        definirPreference('modeClair', c);
        document.body.classList.toggle('mode-clair', c);
    }, clair);
}

async function viderStockage(page) {
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
}

/**
 * Un groupe-cours RÉEL, monté par les formulaires du Cadre (le patron de graphique-suit-les-presences) :
 * trimestre, cours, six élèves, horaire mardi-jeudi de deux périodes, groupe-cours actif.
 * `grille` : une grille de critères au trimestre ; `designee` : elle est la grille de dépistage.
 */
async function monterGroupe(page, { largeur = 1180, hauteur = 820, clair = false, grille = true, designee = false } = {}) {
    await page.setViewportSize({ width: largeur, height: hauteur });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await attendreApplication(page);
    await viderStockage(page);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await attendreApplication(page);
    await page.evaluate(({ DEBUT, FIN_COURS, FIN_TRIMESTRE, ELEVES, GRILLE, grille, designee }) => {
        db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');
        db.setSync(cle('cadreCalendrier'), { dateDebut: DEBUT, finCours: FIN_COURS, finTrimestre: FIN_TRIMESTRE }); // security-ok: fixture de test locale
        db.setSync('cours', [{ id: 'COURS_P7', codeCours: '601-101-MQ', nomCours: 'Littérature' }]);
        db.setSync('enseignants', [{ id: 'ENS_P7', prenom: 'Prof', nom: 'Fictif' }]); // security-ok: fixture de test locale
        db.setSync(cle('groupeEtudiants'), ELEVES.map((e) => Object.assign({ groupe: '00001' }, e))); // security-ok: fixture de test locale
        db.setSync(cle('horaires'), []); // security-ok: fixture de test locale
        db.setSync(cle('groupesCours'), []); // security-ok: fixture de test locale
        if (grille) db.setSync(cle('grillesTemplates'), [GRILLE]); // security-ok: fixture de test locale
        if (designee) definirPreference('grilleReferenceDepistage', GRILLE.id);
        naviguerVers('calendrier', 'trimestre');
    }, { DEBUT, FIN_COURS, FIN_TRIMESTRE, ELEVES, GRILLE, grille, designee });
    await attendreRepos(page);

    await page.evaluate(() => window.nouveauHoraireV2());
    await attendreRepos(page);
    await page.evaluate(() => {
        document.getElementById('v2-hor-groupeAssocie').value = '00001';
        document.getElementById('v2-hor-nom').value = 'Mardi et jeudi';
        document.getElementById('v2-hor-nbSeances').value = '2';
        window.mettreAJourSeancesHoraireV2();
    });
    await attendreRepos(page);
    await page.evaluate(() => {
        [['Mardi', 0], ['Jeudi', 1]].forEach(([jour, i]) => {
            document.getElementById(`v2-hor-seance-${i}-jour`).value = jour;
            document.getElementById(`v2-hor-seance-${i}-debut`).value = '08:00';
            document.getElementById(`v2-hor-seance-${i}-fin`).value = '10:00';
            document.getElementById(`v2-hor-seance-${i}-periodes`).value = '2';
        });
        window.sauvegarderHoraireV2();
    });
    await attendreRepos(page);

    await page.evaluate(() => window.nouveauGroupeCoursV2());
    await attendreRepos(page);
    const champsRefuses = await page.evaluate(() => {
        const horaireId = db.getSync(cle('horaires'), [])[0]?.id;
        const poser = (id, valeur) => {
            const el = document.getElementById(id);
            if (!el) return `champ absent : ${id}`;
            el.value = valeur;
            return el.value === valeur ? null : `valeur refusée par ${id} : ${valeur}`;
        };
        const refus = [poser('v2-gc-trimestre', 'a2026'), poser('v2-gc-cours', 'COURS_P7'), poser('v2-gc-groupe', '00001'),
            poser('v2-gc-horaire', horaireId), poser('v2-gc-enseignant', 'ENS_P7')].filter(Boolean);
        window.sauvegarderGroupeCoursV2();
        return refus;
    });
    await attendreRepos(page);
    expect(champsRefuses, 'le formulaire du groupe-cours a refusé une valeur').toEqual([]);
    await page.evaluate(() => window.changerGroupeCoursActifV2(db.getSync(cle('groupesCours'), [])[0].id));
    await attendreRepos(page);
    await poserTheme(page, clair);
}

/** Une séance prise à l'écran de saisie : tout le monde présent (« Confirmer la séance »), ou une personne absente. */
async function prendrePresences(page, date, { absent = null } = {}) {
    await page.evaluate(() => naviguerVers('suivi', 'saisie'));
    await attendreRepos(page);
    await page.evaluate((d) => {
        const champ = document.getElementById('date-cours');
        champ.value = d;
        champ.dispatchEvent(new Event('change', { bubbles: true }));
    }, date);
    await attendreRepos(page);
    if (absent) {
        const champ = page.locator(`#tbody-saisie-presences input[id="periodes_${absent}"]`);
        await champ.fill('0');
        await champ.blur();   // le `change` d'un champ numérique part au blur ; l'enregistrement suit 1,5 s après
        await attendreRepos(page, { horizon: 2000 });
    } else {
        await page.click('[data-action="confirmerSeancePresences"]');
        await attendreRepos(page, { horizon: 2000 });
    }
}

async function ouvrirPanneau(page) {
    await page.click('#entete-menu-bouton');
    await page.click('#btn-assistance-menu');
    await expect(page.locator('#panneau-assistance')).toBeVisible();
}

const item = (page) => page.locator('#panneau-assistance .assistance-parcours-item[data-parcours="lire-ta-classe"]');
const bulle = (page) => page.locator('#parcours-bulle');

async function attendreEtape(page, n) {
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(n + ' sur 9', { timeout: 10000 });
    await expect(bulle(page)).toBeFocused();
}

async function contourSur(page, selecteur) {
    await expect.poll(() => page.evaluate((sel) => {
        const c = document.getElementById('parcours-contour');
        const el = document.querySelector(sel);
        if (!c || c.hidden || !el) return 'absent';
        const a = c.getBoundingClientRect(), b = el.getBoundingClientRect();
        const dx = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
        const dy = Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2);
        return dx < 3 && dy < 3 ? 'posé' : 'décalé de ' + Math.round(dx) + ', ' + Math.round(dy);
    }, selecteur), { message: 'contour posé sur ' + selecteur, timeout: 4000 }).toBe('posé');
}

/** Ce qui reçoit un toucher au centre de l'élément : lui-même, ou le voile (#parcours-masques, le chemin du voile). */
async function quiRecoitLeToucher(page, selecteur) {
    return page.evaluate(async (sel) => {
        // Le premier qui se voit : une copie cachée (taille nulle) ne dit rien du toucher.
        const visibleDe = () => [...document.querySelectorAll(sel)].find((x) => { const q = x.getBoundingClientRect(); return q.width > 0 && q.height > 0; });
        const avant = visibleDe();
        if (!avant) return 'absent';
        avant.scrollIntoView({ block: 'center' });
        // Le moteur écoute `scroll` et y replace trous et masques : deux images après le défilement, c'est fait.
        await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
        // Relu après l'attente : le profil a pu se redessiner (un nœud neuf au même endroit).
        const el = visibleDe();
        if (!el) return 'absent';
        const r = el.getBoundingClientRect();
        const cible = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (!cible) return 'rien';
        if (cible.id === 'parcours-masques') return 'masque';
        if (cible.closest('#parcours-voile')) return 'voile';
        return el.contains(cible) || cible === el ? 'élément' : 'autre : ' + cible.tagName + '.' + cible.className;
    }, selecteur);
}

async function commencer(page) {
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
}

// ---------------------------------------------------------------------------------------------
// LE TEST DE LA CONSIGNE : refuse sans présences, refuse sans personne à l'écart, lance dès qu'UNE
// personne est sous le seuil d'assiduité, sans aucune évaluation. Il échoue avant ce lot (le
// parcours n'existe pas), et sous chacun des deux break-tests du rapport.
// ---------------------------------------------------------------------------------------------
test('le bouton refuse sans présences, refuse quand personne ne s’écarte, lance avec une seule personne sous le seuil d’assiduité et aucune évaluation', async ({ page }) => {
    test.setTimeout(180000);
    const erreurs = brancherEcouteurs(page);
    await suivreLesReactions(page);
    await monterGroupe(page);

    // Sans présences : le panneau dit pourquoi, le parcours ne part pas, le panneau reste ouvert.
    await commencer(page);
    await expect(item(page).locator('.assistance-parcours-refus')).toHaveText(REFUS_SANS_PRESENCES);
    await expect(item(page).locator('.assistance-parcours-refus')).toHaveAttribute('role', 'status');
    await expect(page.locator('#panneau-assistance')).toBeVisible();
    await expect(bulle(page)).toHaveCount(0);
    await capture(page, 'p7-panneau-1180-sombre-refus-sans-presences');
    await page.keyboard.press('Escape');

    // Une séance, tout le monde présent : personne ne s'écarte.
    await prendrePresences(page, MARDI);
    await commencer(page);
    await expect(item(page).locator('.assistance-parcours-refus')).toHaveText(REFUS_PERSONNE);
    await expect(bulle(page)).toHaveCount(0);
    await capture(page, 'p7-panneau-1180-sombre-refus-personne');
    await page.keyboard.press('Escape');

    // Une deuxième séance, une seule personne absente : 2 périodes sur 4, sous le seuil le plus bas (85 %).
    await prendrePresences(page, JEUDI, { absent: ECARTE.da });
    const lecture = await page.evaluate((da) => ({
        evaluations: (obtenirDonneesSelonMode('evaluationsSauvegardees') || []).length,
        A: calculerTousLesIndices(da).A,
        borne: borneBasseAssiduiteCompletion(),
        groupe: window.ParcoursLireTaClasse.lireLeGroupe()
    }), ECARTE.da);
    expect(lecture.evaluations, 'aucune évaluation').toBe(0);
    expect(lecture.A).toBe(50);
    expect(lecture.A).toBeLessThan(lecture.borne);
    expect(lecture.groupe).toEqual({ avecPresences: true, signales: [ECARTE.da] });

    await commencer(page);
    await attendreEtape(page, 1);
    await expect(page.locator('#panneau-assistance')).toHaveCount(0);
    expect(await page.evaluate(() => Assistance.etatDe('lire-ta-classe'))).toEqual({ etat: 'en-cours', etape: 0 });
    expect(erreurs, 'erreurs console').toEqual([]);
});

// ---------------------------------------------------------------------------------------------
// LES NEUF ÉTAPES, EN FAISANT LES GESTES
// ---------------------------------------------------------------------------------------------
async function parcourir(page, { largeur, theme, designee }) {
    const suffixe = `${largeur}-${theme}`;
    await commencer(page);

    // Étape 1 : les trois bandes, le contour sur « Détails ».
    await attendreEtape(page, 1);
    await contourSur(page, '#btn-toggle-panneau-prioritaire');
    await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveText('Plus tard');
    await capture(page, `p7-etape-1-${suffixe}`);
    await page.click('#btn-toggle-panneau-prioritaire');

    // Étape 2 : le panneau des noms, le contour sur les filtres ; un filtre, puis le A de la personne.
    await attendreEtape(page, 2);
    await contourSur(page, '#suivi-tri-boutons');
    await capture(page, `p7-etape-2-${suffixe}`);
    await page.click('#suivi-tri-boutons .prioritaire-tri-btn[data-tri="M"]');
    const premiere = page.locator('#liste-etudiants-suivi .etudiant-suivi-item').first();
    await expect(premiere, 'la personne retenue remonte en tête').toHaveAttribute('data-da', ECARTE.da);
    await premiere.locator('.etudiant-prioritaire-indices').click();

    // Étape 3 : son engagement ; les pastilles d'absence restent sous le voile.
    await attendreEtape(page, 3);
    expect(await page.evaluate(() => window.ParcoursLireTaClasse.memoire.da)).toBe(ECARTE.da);
    await contourSur(page, '#contenuProfilEtudiant [data-action="changerSectionProfil"][data-param="accompagnement"]');
    expect(await quiRecoitLeToucher(page, '#profil-contenu-dynamique .badge-absence'), 'la pastille d’absence est sous le voile').toBe('masque');
    await capture(page, `p7-etape-3-${suffixe}`);
    await page.click('#contenuProfilEtudiant [data-action="changerSectionProfil"][data-param="accompagnement"]');

    // Étape 4 : les deux cartes, rien à toucher ; « Continuer » mène à l'étape 5 sans grille désignée, sinon à la 6.
    await attendreEtape(page, 4);
    await capture(page, `p7-etape-4-${suffixe}${designee ? '-grille-designee' : ''}`);
    await bulle(page).getByRole('button', { name: 'Continuer' }).click();

    if (!designee) {
        // Étape 5 : le lien de la carte RàI, puis le menu des grilles dans Labo › Observation.
        await attendreEtape(page, 5);
        const lien = '#profil-contenu-dynamique [data-action="ouvrirOutilsObservation"]';
        await contourSur(page, lien);
        await capture(page, `p7-etape-5a-${suffixe}`);
        await page.click(lien);
        await contourSur(page, '#v2-pref-grille-reference');
        // Le menu est amené dans la vue une fois le défilement d'ouvrirOutilsObservation fini. Mesuré le 9 nov. :
        // pendant ce défilement lisse, le menu PASSE à l'écran ; la mesure attend donc une page immobile.
        const menuALEcran = () => page.evaluate(() => new Promise((ok) => {
            let dernier = null, immobiles = 0;
            (function image() {
                immobiles = scrollY === dernier ? immobiles + 1 : 0;
                dernier = scrollY;
                if (immobiles < 20) { requestAnimationFrame(image); return; }
                const r = document.getElementById('v2-pref-grille-reference').getBoundingClientRect();
                ok(r.top >= 0 && r.bottom <= innerHeight);
            })();
        }));
        await expect.poll(menuALEcran, { message: 'le menu des grilles est à l’écran, page immobile', timeout: 6000 }).toBe(true);
        await contourSur(page, '#v2-pref-grille-reference');
        await capture(page, `p7-etape-5b-${suffixe}`);
        await page.selectOption('#v2-pref-grille-reference', GRILLE.id);
    }

    // Étape 6 : de retour à son profil, le contour sur « + Nouvelle intervention ».
    await attendreEtape(page, 6);
    expect(await page.evaluate(() => obtenirPreference('grilleReferenceDepistage'))).toBe(GRILLE.id);
    await expect(page.locator('#contenuProfilEtudiant [data-action="changerSectionProfil"][data-param="accompagnement"]')).toHaveAttribute('aria-current', 'true');
    const nouvelle = page.locator('#profil-contenu-dynamique [data-action="naviguerVersNouvelleIntervention"]', { hasText: '+ Nouvelle intervention' });
    await expect(nouvelle).toBeVisible();
    await capture(page, `p7-etape-6-${suffixe}`);
    await nouvelle.click();

    // Étape 7 : la fiche, son nom coché d'avance ; le contour sur « Créer l'intervention ».
    await attendreEtape(page, 7);
    await expect(page.locator(`#etud-${ECARTE.da}`)).toBeChecked();
    await contourSur(page, '[data-fiche-intervention] [data-action="sauvegarderPresencesIntervention"]');
    await capture(page, `p7-etape-7-${suffixe}`);
    await page.fill('#interventionTitre', 'Rattrapage de la séance du 27 août');
    await page.click('[data-fiche-intervention] [data-action="sauvegarderPresencesIntervention"]');

    // Étape 8 : l'intervention est créée ; le statut éclairé, mais sous le voile.
    await attendreEtape(page, 8);
    const creee = await page.evaluate(() => {
        const id = window.ParcoursLireTaClasse.memoire.ficheId;
        const i = (obtenirInterventions() || []).find((x) => x.id === id);
        return i ? { etudiants: i.etudiants, statut: i.statut, titre: i.titre, avant: Object.keys(i.snapshotAvant || {}) } : null;
    });
    expect(creee).toEqual({ etudiants: [ECARTE.da], statut: 'en-cours', titre: 'Rattrapage de la séance du 27 août', avant: [ECARTE.da] });
    await contourSur(page, '[data-fiche-intervention] label:has(input[name="interventionStatut"][value="completee"])');
    expect(await quiRecoitLeToucher(page, '[data-fiche-intervention] input[name="interventionStatut"][value="completee"]'), 'le statut reste sous le voile').toBe('masque');
    await capture(page, `p7-etape-8-${suffixe}`);
    await bulle(page).getByRole('button', { name: 'Continuer' }).click();

    // Étape 9 : au centre, sans voile ; « Terminer » : le parcours passe à « Fait ».
    await attendreEtape(page, 9);
    await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
    // Sans voile : l'opacité du chemin passe à 0 (sa transition dure 0,2 s).
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.querySelector('#parcours-voile path')).fillOpacity)).toBe('0');
    await capture(page, `p7-etape-9-${suffixe}`);
    await bulle(page).getByRole('button', { name: 'Terminer' }).click();
    await expect(bulle(page)).toHaveCount(0);
    expect(await page.evaluate(() => Assistance.etatDe('lire-ta-classe'))).toEqual({ etat: 'fait', etape: 0 });
    expect(await page.evaluate(() => document.getElementById('parcours-masques'))).toBeNull();
}

async function groupeAvecUnePersonneAlEcart(page, opts) {
    await monterGroupe(page, opts);
    await prendrePresences(page, MARDI);
    await prendrePresences(page, JEUDI, { absent: ECARTE.da });
}

test('les neuf étapes en faisant les gestes, sans grille de dépistage désignée (1180 px, sombre)', async ({ page }) => {
    test.setTimeout(240000);
    const erreurs = brancherEcouteurs(page);
    await suivreLesReactions(page);
    await groupeAvecUnePersonneAlEcart(page, {});
    await parcourir(page, { largeur: 1180, theme: 'sombre', designee: false });
    expect(erreurs, 'erreurs console').toEqual([]);
});

test('avec une grille de dépistage désignée, l’étape 4 mène à l’étape 6 (1180 px, sombre)', async ({ page }) => {
    test.setTimeout(240000);
    const erreurs = brancherEcouteurs(page);
    await suivreLesReactions(page);
    await groupeAvecUnePersonneAlEcart(page, { designee: true });
    await parcourir(page, { largeur: 1180, theme: 'sombre', designee: true });
    expect(erreurs, 'erreurs console').toEqual([]);
});

test('« Plus tard » ferme la bulle, le parcours attend à la même étape ; « Reprendre » y revient', async ({ page }) => {
    test.setTimeout(180000);
    const erreurs = brancherEcouteurs(page);
    await suivreLesReactions(page);
    await groupeAvecUnePersonneAlEcart(page, {});
    await commencer(page);
    await attendreEtape(page, 1);
    await page.click('#btn-toggle-panneau-prioritaire');
    await attendreEtape(page, 2);
    await page.click('#suivi-tri-boutons .prioritaire-tri-btn[data-tri="M"]');
    await page.locator(`#liste-etudiants-suivi .etudiant-suivi-item[data-da="${ECARTE.da}"] .etudiant-prioritaire-indices`).click();
    await attendreEtape(page, 3);
    await bulle(page).locator('.parcours-bulle-sortie').click();
    await expect(bulle(page)).toHaveCount(0);
    await expect(page.locator('#parcours-voile')).toHaveCount(0);
    expect(await page.evaluate(() => Assistance.etatDe('lire-ta-classe'))).toEqual({ etat: 'en-cours', etape: 2 });
    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('Étape 3 sur 9');
    await item(page).getByRole('button', { name: 'Reprendre' }).click();
    await attendreEtape(page, 3);
    // Échap vaut « Plus tard ».
    await page.keyboard.press('Escape');
    await expect(bulle(page)).toHaveCount(0);
    expect(await page.evaluate(() => Assistance.etatDe('lire-ta-classe'))).toEqual({ etat: 'en-cours', etape: 2 });
    expect(erreurs, 'erreurs console').toEqual([]);
});

test('les refus proposés : la démo, l’option RàI décochée, le mode anonymisation', async ({ page }) => {
    test.setTimeout(180000);
    const erreurs = brancherEcouteurs(page);
    await suivreLesReactions(page);
    await groupeAvecUnePersonneAlEcart(page, {});
    const proposes = await page.evaluate(() => window.ParcoursLireTaClasse.proposes);

    await page.evaluate(() => definirPreference('activerRai', false));
    await commencer(page);
    await expect(item(page).locator('.assistance-parcours-refus')).toHaveText(proposes.rai);
    await capture(page, 'p7-panneau-1180-sombre-refus-propose-rai');
    await page.keyboard.press('Escape');
    await page.evaluate(() => definirPreference('activerRai', true));

    await page.evaluate(() => changerMode(MODES.ANONYMISATION));
    await attendreRepos(page);
    expect(await page.evaluate(() => estModeAnonymisation())).toBe(true);
    await commencer(page);
    await expect(item(page).locator('.assistance-parcours-refus')).toHaveText(proposes.anonymisation);
    await capture(page, 'p7-panneau-1180-sombre-refus-propose-anonymisation');
    await page.keyboard.press('Escape');
    await page.evaluate(() => changerMode(MODES.NORMAL));
    await attendreRepos(page);

    await page.evaluate(() => activerModeDemo());
    await attendreRepos(page);
    await commencer(page);
    await expect(item(page).locator('.assistance-parcours-refus')).toHaveText(proposes.demo);
    await expect(bulle(page)).toHaveCount(0);
    expect(erreurs, 'erreurs console').toEqual([]);
});

// Un test par largeur et par thème : chacun a son contexte, donc un stockage neuf (un second montage
// sur la même page retrouvait la séance du premier, déjà saisie).
test('captures : les neuf étapes à 1180 px en clair', async ({ page }) => {
    test.skip(!CAPTURES, 'captures seulement (CAPTURES_PARCOURS)');
    test.setTimeout(240000);
    await suivreLesReactions(page);
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await groupeAvecUnePersonneAlEcart(page, { clair: true });
    await parcourir(page, { largeur: 1180, theme: 'clair', designee: false });
});

for (const clair of [false, true]) {
    const theme = clair ? 'clair' : 'sombre';
    test(`captures : les étapes 1, 2 et 7 à 390 px (${theme})`, async ({ page }) => {
        test.skip(!CAPTURES, 'captures seulement (CAPTURES_PARCOURS)');
        test.setTimeout(240000);
        await suivreLesReactions(page);
        page.on('dialog', (d) => d.accept().catch(() => {}));
        await groupeAvecUnePersonneAlEcart(page, { largeur: 390, hauteur: 844, clair });
        await commencer(page);
        await attendreEtape(page, 1);
        await capture(page, `p7-etape-1-390-${theme}`);
        await page.click('#btn-toggle-panneau-prioritaire');
        await attendreEtape(page, 2);
        await capture(page, `p7-etape-2-390-${theme}`);
        await page.click('#suivi-tri-boutons .prioritaire-tri-btn[data-tri="M"]');
        await page.locator(`#liste-etudiants-suivi .etudiant-suivi-item[data-da="${ECARTE.da}"] .etudiant-prioritaire-indices`).click();
        await attendreEtape(page, 3);
        await page.click('#contenuProfilEtudiant [data-action="changerSectionProfil"][data-param="accompagnement"]');
        await attendreEtape(page, 4);
        await bulle(page).getByRole('button', { name: 'Continuer' }).click();
        await attendreEtape(page, 5);
        await page.click('#profil-contenu-dynamique [data-action="ouvrirOutilsObservation"]');
        await contourSur(page, '#v2-pref-grille-reference');
        await page.selectOption('#v2-pref-grille-reference', GRILLE.id);
        await attendreEtape(page, 6);
        await page.locator('#profil-contenu-dynamique [data-action="naviguerVersNouvelleIntervention"]', { hasText: '+ Nouvelle intervention' }).click();
        await attendreEtape(page, 7);
        await contourSur(page, '[data-fiche-intervention] [data-action="sauvegarderPresencesIntervention"]');
        await capture(page, `p7-etape-7-390-${theme}`);
    });
}
