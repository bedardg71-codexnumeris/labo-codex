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
// LE NEUVIÈME PARCOURS, « METTRE EN PLACE TA NOTATION ALTERNATIVE » — 8 NOV. 2026, NUIT
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-9-notation-alternative.md. Ce banc juge :
//   · le panneau : le neuvième parcours garde son rang (9) ; son bouton refuse sans production avec sa grille,
//     et le panneau dit par où commencer ;
//   · la bulle 1 sautée quand une pratique alternative est appliquée ; une pratique de chaque famille ouverte
//     à l'étape 2 mène à son étape 3 (3a puis 3b en spécifications), et « n sur N » suit le chemin ;
//   · le parcours entier, en faisant les gestes, de « + Nouvelle pratique » à « Terminer », en spécifications
//     et en standards : l'assistant, la fiche, « Appliquer au cours actif », « Actions › Évaluer », le cadenas,
//     « Actions › Dossier PDF » (le fichier téléchargé fait paraître « Continuer »).
// ⚠ Lancé sous Chromium cette nuit (sessions cloud, WebKit absent) : le verdict WebKit se prend sur le Mac.
// L'apparence se juge sur capture : CAPTURES_PARCOURS=<dossier> npx playwright test parcours-9
// Noms d'étudiant·es manifestement fictifs (CLAUDE.md, règle 6).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
const HORLOGE = new Date('2026-11-10T14:00:00.000Z');
const CAPTURES = process.env.CAPTURES_PARCOURS || '';
const T = 'p9banc';
const GC = 'GC_P9';
const COURS = 'cours-p9';

async function capture(page, nom) {
    if (!CAPTURES) return;
    fs.mkdirSync(CAPTURES, { recursive: true });
    await page.mouse.move(2, (page.viewportSize().height / 2) | 0);
    await page.evaluate(() => window.accompagnement && window.accompagnement.masquerHover && window.accompagnement.masquerHover());
    await page.waitForFunction(() => document.getAnimations()
        .filter((a) => a.effect && a.effect.target && a.effect.target.closest
            && a.effect.target.closest('#panneau-assistance, #parcours-bulle, #entete-menu-panneau'))
        .every((a) => a.playState !== 'running'));
    // La sonde du moteur replace la bulle toutes les 120 ms : la capture attend qu'elle ne bouge plus.
    await page.waitForFunction(() => {
        const b = document.getElementById('parcours-bulle');
        const k = b ? b.style.left + ',' + b.style.top : '';
        const stable = window.__bulleP9 === k;
        window.__bulleP9 = k;
        return stable;
    }, null, { polling: 150 });
    await page.screenshot({ path: path.join(CAPTURES, nom + '.png') });
}

/**
 * Un trimestre réel : un cours, son groupe-cours actif, trois étudiant·es fictif·ves, une échelle, une grille,
 * deux productions avec leur grille (un projet, un examen), et les pratiques données. Puis la page rechargée.
 */
/**
 * Corrections du 9 nov. (Cowork, comme au huitième parcours) : aucun avis de la pile ne couvre la bulle. Un relevé tourne
 * dans la page pendant tout l'essai (posé avant chaque chargement) : toutes les 100 ms, il regarde si un avis couvre la
 * bulle (au-dessus d'elle : sous elle, il ne couvre rien) ; un recouvrement de plus de trois relevés (la pile se replace
 * en 200 ms au plus, utils-notifications.js) est consigné avec le titre de l'étape. Chaque essai finit en exigeant un relevé vide (afterEach).
 */
function releveDesAvisSurLaBulle() {
    window.__avisSurLaBulle = [];
    let suite = 0;
    setInterval(() => {
        const b = document.getElementById('parcours-bulle');
        let couvrent = [];
        if (b) {
            const r = b.getBoundingClientRect();
            // Un avis ne compte que s'il est AU-DESSUS de la bulle (le milieu de leur intersection répond par l'avis).
            couvrent = [...document.querySelectorAll('#notifications-pile > *')]
                .filter((n) => !n.classList.contains('notification-sortie'))
                .filter((n) => {
                    const x = n.getBoundingClientRect();
                    const g = Math.max(x.left, r.left), d = Math.min(x.right, r.right), h = Math.max(x.top, r.top), bas = Math.min(x.bottom, r.bottom);
                    if (d <= g || bas <= h) return false;
                    const dessus = document.elementFromPoint((g + d) / 2, (h + bas) / 2);
                    return !!(dessus && n.contains(dessus));
                });
        }
        suite = couvrent.length ? suite + 1 : 0;
        if (suite === 4) {
            const t = b.querySelector('.parcours-bulle-titre');
            window.__avisSurLaBulle.push((t ? t.textContent : '?') + ' : ' + couvrent.map((n) => n.textContent.trim().slice(0, 40)).join(' | '));
        }
    }, 100);
}

test.afterEach(async ({ page }) => {
    const releve = await page.evaluate(() => window.__avisSurLaBulle || []).catch(() => []);
    expect(releve, 'aucun avis n’a couvert la bulle').toEqual([]);
});

/** La bulle ne couvre aucun des éléments (sélecteurs CSS) ; la sonde du moteur la replace toutes les 120 ms. */
async function bulleNeCouvrePas(page, selecteurs, message) {
    await expect.poll(() => page.evaluate((sels) => {
        const b = document.getElementById('parcours-bulle').getBoundingClientRect();
        return sels.flatMap((s) => [...document.querySelectorAll(s)]).filter((el) => {
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height) return false;
            return !(r.right <= b.left || b.right <= r.left || r.bottom <= b.top || b.bottom <= r.top);
        }).map((el) => el.id || el.className);
    }, selecteurs), { message, timeout: 3000 }).toEqual([]);
}

async function monter(page, { largeur = 1180, hauteur = 900, clair = false, pratiques = [], active = null, grille = true } = {}) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.addInitScript(releveDesAvisSurLaBulle);
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
    await page.evaluate(({ T, GC, COURS, pratiques, active, grille }) => {
        // security-ok: fixtures littérales du banc, noms fictifs, aucune source externe.
        db.setSync('trimestres', [{ id: T, nom: 'Automne banc', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', T);
        window.trimestreActif = T;
        db.setSync('cours', [{ id: COURS, codeCours: 'BAN101', titre: 'Cours de banc', dansBibliotheque: true }]);
        db.setSync(T + '_groupesCours', [{ id: GC, trimestreId: T, coursId: COURS, groupeNum: '01', pratiqueId: active, actif: true }]);
        db.setSync('infoCours', { id: COURS, codeCours: 'BAN101', groupe: '01', _groupeCoursId: GC });
        db.setSync('groupeCoursActif', { id: GC, trimestreId: T, pratiqueId: active });
        db.setSync(T + '_groupeEtudiants', [
            { da: '9000001', nom: 'Lapin-Bleu', prenom: 'Ludovic', groupe: '01', coursId: COURS, groupeCoursId: GC },
            { da: '9000002', nom: 'Hibou-Vert', prenom: 'Odile', groupe: '01', coursId: COURS, groupeCoursId: GC },
            { da: '9000003', nom: 'Loutre-Rose', prenom: 'Bastien', groupe: '01', coursId: COURS, groupeCoursId: GC }
        ]);
        db.setSync(T + '_echellesTemplates', [{ id: 'E1', nom: 'Échelle de banc', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 59, valeurCalcul: 50 },
            { code: 'D', nom: 'En développement', min: 60, max: 74, valeurCalcul: 67 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }] }]);
        db.setSync(T + '_grillesTemplates', [{ id: 'G1', nom: 'Grille de banc', criteres: [
            { id: 'c1', nom: 'Démarche', ponderation: 100, type: 'holistique' }] }]);
        db.setSync(T + '_productions', [
            { id: 'P1', titre: 'Projet 1', type: 'projet', ponderation: 50, grilleId: grille ? 'G1' : '', echelleId: 'E1', coursId: COURS, dateEcheance: '2026-10-01' },
            { id: 'P2', titre: 'Examen 1', type: 'examen', ponderation: 50, grilleId: grille ? 'G1' : '', echelleId: 'E1', coursId: COURS, dateEcheance: '2026-10-15' }
        ]);
        db.setSync(T + '_evaluationsSauvegardees', []);
        db.setSync(T + '_pratiquesConfigurables', pratiques);
    }, { T, GC, COURS, pratiques, active, grille });
    await page.reload();
    await attendreApplication(page);
    await page.evaluate((c) => {
        definirPreference('modeClair', c);
        document.body.classList.toggle('mode-clair', c);
    }, clair);
}

/** Les pratiques de banc, clones des modèles de l'application (une par famille), l'échelle posée. */
async function pratiquesDesModeles(page) {
    return page.evaluate(() => ['STD-n-meilleurs', 'SPE-simple', 'DEN-base'].map((cleModele, i) => {
        const p = JSON.parse(JSON.stringify(MODELES_PRATIQUES_PREDEFINIS[cleModele]));
        p.id = 'pratique_banc_' + i;
        p.nom = p.nom + ' (banc)';
        // Trois modèles portent l'auteur « Demo Labo Codex », marqueur de la démo : leur copie serait masquée du menu.
        p.auteur = 'Enseignant·e de banc';
        delete p.estGabarit;
        p.dansBibliotheque = true;
        p.configuration = Object.assign({}, p.configuration, { echelleId: 'E1' });
        return p;
    }));
}

async function ouvrirPanneau(page) {
    await page.click('#entete-menu-bouton');
    await page.click('#btn-assistance-menu');
    await expect(page.locator('#panneau-assistance')).toBeVisible();
}

const bulle = (page) => page.locator('#parcours-bulle');
const item = (page) => page.locator('#panneau-assistance [data-parcours="notation-alternative"]');

async function attendreEtape(page, titre, rang) {
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(titre, { timeout: 10000 });
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(rang);
    await expect(bulle(page)).toBeFocused();
}

async function commencer(page) {
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
}

/**
 * Toucher un élément de la page. Au-dessus de 700 px, un vrai clic : s'il est couvert (la bulle, le voile), le banc
 * rougit. Sur un téléphone, la bulle 1, longue, couvre l'écran (dit au rapport) : les captures y passent par le
 * clic de l'élément lui-même.
 */
async function toucher(page, selecteur) {
    if (page.viewportSize().width >= 700) return page.click(selecteur);
    return page.locator(selecteur).first().evaluate((el) => el.click());
}

/** Le bouton de la bulle par son nom, visible ou caché (`montrerBouton`). */
const boutonBulle = (page, nom) => bulle(page).locator('.parcours-bulle-boutons button', { hasText: nom });

/** « Continuer » attend (11 nov. 2026, 12 h 05, capture 34) : visible, inactif, la raison écrite dessous. */
async function continuerAttend(page, raison) {
    await expect(boutonBulle(page, 'Continuer')).toBeVisible();
    await expect(boutonBulle(page, 'Continuer')).toBeDisabled();
    await expect(bulle(page).locator('.parcours-bulle-attente')).toHaveText(raison);
}

/** La pulsation est posée sur l'élément (même centre, à 3 px près). */
async function contourSur(page, selecteur) {
    await expect.poll(() => page.evaluate((sel) => {
        const c = document.getElementById('parcours-contour');
        const el = document.querySelector(sel);
        if (!c || c.hidden || !el) return 'absent';
        const a = c.getBoundingClientRect(), b = el.getBoundingClientRect();
        return Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2) < 3 && Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2) < 3 ? 'posé' : 'décalé';
    }, selecteur), { message: 'contour posé sur ' + selecteur, timeout: 5000 }).toBe('posé');
}

test('panneau : le neuvième parcours garde son rang ; sans production avec sa grille, son bouton refuse et le panneau dit par où commencer', async ({ page }) => {
    await monter(page, { grille: false });
    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-titre')).toHaveText('Mettre en place ta notation alternative');
    await expect(item(page).locator('.assistance-pastille')).toHaveText('9');
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('À faire');
    await item(page).locator('.assistance-parcours-bouton').click();
    const refus = item(page).locator('.assistance-parcours-refus');
    await expect(refus).toBeVisible();
    await expect(refus).toHaveText('Commence par « Évaluer une première production » : il te faut une production et sa grille pour mettre en place ta notation alternative.');
    await expect(bulle(page)).toHaveCount(0);
    await expect(page.locator('#panneau-assistance')).toBeVisible();
    await capture(page, 'p9-panneau-refus-1180-sombre');
});

test('panneau : sur la démo, le bouton refuse aussi (le parcours se joue sur les vraies données)', async ({ page }) => {
    await monter(page);
    await page.evaluate(async () => { await activerModeDemo(); });
    await expect.poll(() => page.evaluate(() => estEnModeDemo())).toBe(true);
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
    await expect(item(page).locator('.assistance-parcours-refus')).toBeVisible();
    await expect(bulle(page)).toHaveCount(0);
});

for (const cas of [
    { famille: 'standards', id: 'pratique_banc_0', titre: 'Ta sélection', total: 7 },
    { famille: 'specifications', id: 'pratique_banc_1', titre: 'Tes types de productions', total: 8 },
    { famille: 'denotation', id: 'pratique_banc_2', titre: 'Tes cibles', total: 7 }
]) {
    test(`étape 1 sautée (une pratique alternative appliquée) ; une pratique ${cas.famille} ouverte à l'étape 2 mène à « ${cas.titre} »`, async ({ page }) => {
        const pratiques = await (async () => { await page.goto(indexHtml); await attendreApplication(page); return pratiquesDesModeles(page); })();
        // La pratique appliquée est la standards : l'étape 1 est sautée, quelle que soit la famille ouverte ensuite.
        await monter(page, { pratiques, active: 'pratique_banc_0' });
        await commencer(page);
        // La famille prévue est celle de la pratique appliquée (standards) : « 1 sur 7 ».
        await attendreEtape(page, "L'ouvrir", '1 sur 7');
        await expect(page.locator('#parcours-contour')).toBeVisible();
        await page.selectOption('#menuPratiques', cas.id);
        await attendreEtape(page, cas.titre, '2 sur ' + cas.total);
        // Groupe 3 (9 nov.) : les guillemets portent une espace insécable à l'écran (typographier) ; on lit sans elle.
        const texte = (await bulle(page).locator('.parcours-bulle-texte').textContent()).replace(/\u00a0/g, ' ');
        if (cas.famille === 'standards') {
            // Sans « Artefact » et hors hybride, la liste est à l'écran : sa phrase paraît.
            await expect(page.locator('#mat-productions-comptees')).toBeVisible();
            expect(texte).toContain('Dans « Productions qui comptent dans la note », décoche celles qui ne doivent pas compter');
        }
        if (cas.famille === 'specifications') {
            // Le « Modèle simple » porte deux types : « Continuer » est là ; il mène aux forfaits.
            await expect(boutonBulle(page, 'Continuer')).toBeVisible();
            await capture(page, 'p9-etape-3a-1180-sombre');
            await boutonBulle(page, 'Continuer').click();
            await attendreEtape(page, 'Tes forfaits', '3 sur 8');
            await capture(page, 'p9-etape-3b-1180-sombre');
        } else {
            await capture(page, 'p9-etape-3-' + cas.famille + '-1180-sombre');
        }
        // « Plus tard » ferme la bulle ; le panneau dit l'étape, et « Reprendre » y revient.
        await bulle(page).locator('.parcours-bulle-sortie').click();
        await expect(bulle(page)).toHaveCount(0);
        await ouvrirPanneau(page);
        const n = cas.famille === 'specifications' ? 3 : 2;
        await expect(item(page).locator('.assistance-parcours-etat')).toHaveText(`Étape ${n} sur ${cas.total}`);
        await item(page).locator('.assistance-parcours-bouton').click();
        await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(`${n} sur ${cas.total}`, { timeout: 10000 });
    });
}

test('dénotation : « Continuer » attend qu’une cible soit nommée, et le dit', async ({ page }) => {
    await page.goto(indexHtml);
    await attendreApplication(page);
    const pratiques = await pratiquesDesModeles(page);
    pratiques[2].configuration.objectifs = [{ id: 'cible-1', nom: 'Une cible' }];
    await monter(page, { pratiques, active: 'pratique_banc_0' });
    await commencer(page);
    await attendreEtape(page, "L'ouvrir", '1 sur 7');
    await page.selectOption('#menuPratiques', 'pratique_banc_2');
    await attendreEtape(page, 'Tes cibles', '2 sur 7');
    await expect(boutonBulle(page, 'Continuer')).toBeEnabled();
    // La cible effacée à l'écran : « Continuer » reste, inactif, et dit ce qui manque (11 nov. 2026, 12 h 05).
    await page.locator('#mat-den-cibles input[type="text"]').first().fill('');
    await continuerAttend(page, 'Pour continuer, écris au moins une cible.');
});

test('étape 1 : une sommative créée ne fait pas avancer ; une alternative, oui ; « Reprendre » retrouve celle créée entre-temps', async ({ page }) => {
    await monter(page);
    await commencer(page);
    await attendreEtape(page, 'Ta pratique', '1 sur 8');
    const ajouter = (p) => page.evaluate((p) => {
        // security-ok: fixture de test, une pratique écrite comme l'assistant l'écrirait.
        db.setSync(cle('pratiquesConfigurables'), (db.getSync(cle('pratiquesConfigurables'), []) || []).concat([p]));
    }, p);
    await ajouter({ id: 'pratique_som_banc', nom: 'Sommative de banc', type: 'sommative', dansBibliotheque: true, configuration: {} });
    // La sonde a vu la sommative : l'étape ne l'accepte pas (lu dans l'état atteint, sans attendre un délai).
    expect(await page.evaluate(() => ParcoursNotationAlternative.etapes()[0].atteint())).toBe(false);
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText('Ta pratique');
    // « Plus tard », puis une pratique alternative créée hors du parcours, puis « Reprendre » : l'étape la retrouve.
    await bulle(page).locator('.parcours-bulle-sortie').click();
    await ajouter({ id: 'pratique_spe_banc', nom: 'Spécifications de banc', type: 'specifications', pratiques: ['SPE'], dansBibliotheque: true, configuration: { typesTravaux: [], forfaits: [] } });
    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-bouton')).toHaveText('Reprendre');
    await item(page).locator('.assistance-parcours-bouton').click();
    await attendreEtape(page, "L'ouvrir", '2 sur 9');
});

test('étape 5 : la pratique déjà appliquée ne fait pas passer l’étape seule ; « Appliquer au cours actif » la fait avancer', async ({ page }) => {
    await page.goto(indexHtml);
    await attendreApplication(page);
    const pratiques = await pratiquesDesModeles(page);
    await monter(page, { pratiques, active: 'pratique_banc_0' });
    await commencer(page);
    await attendreEtape(page, "L'ouvrir", '1 sur 7');
    await page.selectOption('#menuPratiques', 'pratique_banc_0');
    await attendreEtape(page, 'Ta sélection', '2 sur 7');
    await boutonBulle(page, 'Continuer').click();
    await attendreEtape(page, "Ce que lit l'étudiant·e", '3 sur 7');
    await boutonBulle(page, 'Continuer').click();
    await attendreEtape(page, "L'appliquer à ton cours", '4 sur 7');
    expect(await page.evaluate(() => ParcoursNotationAlternative.etapes()[ParcoursMoteur.etapeCourante()].atteint())).toBe(false);
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText("L'appliquer à ton cours");
    await page.click('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]');
    await attendreEtape(page, 'Évaluer une production', '5 sur 7');
});

// Question 11 (décidée par Cowork le 9 nov.) : la lecture, pas les données. Hors de la démo, une pratique n'est jamais une
// pratique de démo, même si son auteur dit « Demo Labo Codex » (le stock : une copie de modèle adoptée sans auteur).
// Break-tests (9 nov., Chromium) : `estPratiqueDeDemo` remise à `estItemDemo` seul (bibliotheque-ui.js) → ROUGE (la fiche
// en lecture seule, `demo-readonly`) ; la garde des références seule remise à `estItemDemo` → ROUGE (le formulaire
// Cadre › Groupes-cours refuserait la pratique). Rétablies → verts.
test('question 11 : hors de la démo, une pratique dont l’auteur dit « Demo Labo Codex » est au menu, modifiable, et s’applique ; rien n’est réécrit', async ({ page }) => {
    await page.goto(indexHtml);
    await attendreApplication(page);
    const pratiques = await pratiquesDesModeles(page);
    pratiques[0].auteur = 'Demo Labo Codex';
    await monter(page, { pratiques });
    await page.evaluate(() => naviguerVers('conception', 'pratiques-notation'));
    await expect(page.locator('#menuPratiques option[value="pratique_banc_0"]')).toHaveCount(1);
    await page.selectOption('#menuPratiques', 'pratique_banc_0');
    await expect(page.locator('#mat-portfolio-nombre')).toBeVisible();
    await expect(page.locator('#conteneurEditionPratique')).not.toHaveClass(/demo-readonly/);
    await expect(page.locator('#mat-portfolio-nombre')).toBeEnabled();
    await page.click('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]');
    await expect.poll(() => page.evaluate(() => obtenirIdPratiqueActive())).toBe('pratique_banc_0');
    expect(await page.evaluate(() => db.getSync(cle('pratiquesConfigurables'), []).find((p) => p.id === 'pratique_banc_0').auteur)).toBe('Demo Labo Codex');
    // La garde des références (le formulaire Cadre › Groupes-cours, trimestre-v2-groupes-cours.js) ne la refuse pas.
    expect(await page.evaluate(() => BibliothequeUI.verifierReferencesPasDemo(
        [{ id: 'pratique_banc_0', collection: 'pratiquesConfigurables', labelType: 'pratique' }], { cible: cle('groupesCours') }))).toBeNull();
});

// Étape 3, standards (Cowork, 9 nov.) : le champ du nombre reste libre, à 1180 px de large, à la hauteur du banc (900) et
// à celle de la fenêtre de Safari sur l'iPad à l'horizontale (770 environ, relecture du 9 nov.) ; le mode et le minimum
// aussi. Break-test (9 nov., Chromium) : la place sous le nombre retirée et le poids du nombre ramené à 1 → ROUGE à 770.
for (const hauteur of [900, 820, 770]) {
    test(`étape 3, standards, 1180 × ${hauteur} : la bulle laisse le nombre à retenir, le mode et le minimum libres`, async ({ page }) => {
        await page.goto(indexHtml);
        await attendreApplication(page);
        const pratiques = await pratiquesDesModeles(page);
        await monter(page, { pratiques, active: 'pratique_banc_0', hauteur });
        await commencer(page);
        await attendreEtape(page, "L'ouvrir", '1 sur 7');
        await page.selectOption('#menuPratiques', 'pratique_banc_0');
        await attendreEtape(page, 'Ta sélection', '2 sur 7');
        await bulleNeCouvrePas(page, ['#mat-portfolio-nombre', '#mat-portfolio-selection', '#mat-portfolio-minimum'], 'la bulle 3 laisse les réglages de la sélection libres');
        // La bulle tient dans la fenêtre ; ce qui dépasse défile dans la bulle, « Continuer » compris.
        const g = await page.evaluate(() => { const r = document.getElementById('parcours-bulle').getBoundingClientRect(); return { haut: r.top >= 0, bas: r.bottom <= window.innerHeight }; });
        expect(g).toEqual({ haut: true, bas: true });
        await boutonBulle(page, 'Continuer').scrollIntoViewIfNeeded();
        await boutonBulle(page, 'Continuer').click();
        await attendreEtape(page, "Ce que lit l'étudiant·e", '3 sur 7');
    });
}

// Étape 5 (Cowork, 9 nov.) : sous le verrou, les deux boutons d'affichage sont désactivés ; « Déverrouiller » les rend.
// Break-test (9 nov., Chromium) : les boutons jamais réactivés (`radio.disabled = true` seulement) → ROUGE.
test('étape 5 : sur une évaluation verrouillée, « Note chiffrée » et « Niveau de performance » sont désactivés ; « Déverrouiller » les rend', async ({ page }) => {
    await page.goto(indexHtml);
    await attendreApplication(page);
    const pratiques = await pratiquesDesModeles(page);
    await monter(page, { pratiques, active: 'pratique_banc_0' });
    // Le rappel « Mets ton codex à jour » (un espace avec des données, sans codex) ne vient pas couvrir le verrou.
    await page.evaluate(() => { const loin = new Date(); loin.setDate(loin.getDate() + 30); db.setSync('backupProchainRappel', loin.toISOString()); });
    await page.evaluate(() => naviguerVers('evaluations', 'liste'));
    const ligne = page.locator('#conteneur-tableau-evaluations tr[data-da="9000001"][data-production-id="P1"]');
    await ligne.locator('select.eval-actions-select').selectOption('evaluer|9000001|P1');
    await expect(page.locator('#btnVerrouillerEvaluation')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#eval_c1')).toBeAttached({ timeout: 10000 });
    await page.evaluate(() => { const s = document.getElementById('eval_c1'); s.value = 'M'; s.dispatchEvent(new Event('change', { bubbles: true })); });
    await expect(page.locator('#affichageNoteLettre1')).toBeEnabled();
    await page.click('#btnVerrouillerEvaluation');
    await expect(page.locator('#affichageNoteComplet1')).toBeDisabled();
    await expect(page.locator('#affichageNoteLettre1')).toBeDisabled();
    // Le chemin que dit la bulle 5 : « Actions › Consulter », puis « Déverrouiller ». On attend que l'évaluation soit
    // chargée (son id dans le formulaire) : plus tôt, « Déverrouiller » reverrouille (relecture du 9 nov., inscrit).
    const evalId = await page.evaluate(() => (db.getSync(cle('evaluationsSauvegardees'), []) || []).find((e) => e.verrouillee === true).id);
    await page.evaluate(() => naviguerVers('evaluations', 'liste'));
    await page.locator('#conteneur-tableau-evaluations tr[data-da="9000001"][data-production-id="P1"] select.eval-actions-select')
        .selectOption('consulter|' + evalId);
    await expect.poll(() => page.evaluate(() => window.evaluationEnCours && window.evaluationEnCours.idModification), { timeout: 10000 }).toBe(evalId);
    await expect(page.locator('#affichageNoteLettre1')).toBeDisabled();
    await page.click('#btnVerrouillerEvaluation');
    await expect(page.locator('#affichageNoteComplet1')).toBeEnabled();
    await expect(page.locator('#affichageNoteLettre1')).toBeEnabled();
});

// Comme au huitième parcours (Cowork, 9 nov.) : pendant tout parcours, l'aide dans les pages se tait. Même mécanisme,
// le même code (accompagnement.js), à unifier à la fusion.
test('pendant le parcours, l’aide dans les pages se tait ; après « Plus tard », elle parle', async ({ page }) => {
    await monter(page);
    await page.evaluate(() => { definirPreference('accompagnementActif', true); document.body.classList.add('aide-contextuelle-active'); });
    await commencer(page);
    await attendreEtape(page, 'Ta pratique', '1 sur 8');
    await page.evaluate(() => window.accompagnement.afficherBulleDecouverte({ cible: '#btn-codex', message: 'Bulle du banc' }));
    await expect(page.locator('.bulle-decouverte')).toHaveCount(0);
    await bulle(page).locator('.parcours-bulle-sortie').click();
    await expect(bulle(page)).toHaveCount(0);
    await page.evaluate(() => window.accompagnement.afficherBulleDecouverte({ cible: '#btn-codex', message: 'Bulle du banc' }));
    await expect(page.locator('.bulle-decouverte')).toBeVisible();
});

/**
 * Le parcours entier, en faisant les gestes. `modele` : la carte de « Partir d'un modèle ».
 * Spécifications : 9 étapes ; standards : 8 (l'assistant demande l'échelle, la fenêtre le dit).
 */
async function parcoursEntier(page, { famille, modele, largeur = 1180, clair = false, suffixe = '' }) {
    const total = famille === 'specifications' ? 9 : 8;
    const n = (k) => `${k} sur ${total}`;
    const cap = (nom) => capture(page, `p9-${nom}-${largeur}-${clair ? 'clair' : 'sombre'}${suffixe}`);
    await monter(page, { largeur, clair });
    await commencer(page);

    // 1. « Ta pratique » : contour sur « + Nouvelle pratique », puis sur « Partir d'un modèle ».
    await attendreEtape(page, 'Ta pratique', '1 sur 8');
    // Question 12 (validée par Grégoire le 9 nov.) : avant l'assistant, la bulle entière, près de « + Nouvelle pratique ».
    await expect(bulle(page).locator('.parcours-bulle-texte')).toBeVisible();
    // Sous 700 px, la bulle longue couvre l'écran : le lot « La bulle sur téléphone » s'en charge (décision du 9 nov.).
    if (largeur >= 700) await bulleNeCouvrePas(page, ['#conception-pratiques-notation [data-action="creerNouvellePratique"]'], 'la bulle 1 laisse « + Nouvelle pratique » libre');
    await cap('etape-1');
    await toucher(page, '#conception-pratiques-notation [data-action="creerNouvellePratique"]');
    await expect(page.locator('#modalWizardPratiqueV2')).toHaveClass(/actif/);
    if (largeur >= 700) {
        await expect(page.locator('body')).toHaveClass(/parcours-sur-modale/);
        await expect(page.locator('#parcours-contour')).toBeVisible();
        // L'assistant ouvert : la bulle réduite à sa ligne orange, au bord, sans couvrir ses deux cartes ni « Suivant ».
        // Break-test (9 nov., Chromium) : `bulleDeLEtape1` sans effet → ROUGE (la bulle entière couvre les cartes).
        await expect(bulle(page)).toHaveClass(/parcours-bulle--reduite/);
        await expect(bulle(page).locator('.parcours-bulle-texte')).toBeHidden();
        await expect(bulle(page).locator('.parcours-bulle-geste')).toBeVisible();
        await expect(bulle(page).locator('.parcours-bulle-geste')).toHaveText('Touche « + Nouvelle pratique », choisis ton modèle, puis « Créer la pratique ».');
        await bulleNeCouvrePas(page, ['#modalWizardPratiqueV2 .wizard-v2-radio-card', '#wizard-v2-btn-suivant'], 'la bulle réduite laisse les deux cartes et « Suivant » libres');
    } else {
        // Sur un téléphone, l'assistant prend l'écran : la bulle attend derrière lui.
        await expect(page.locator('body')).not.toHaveClass(/parcours-sur-modale/);
    }
    await cap('etape-1-assistant');
    await page.locator('#modalWizardPratiqueV2 input[name="porteEntree"][value="modele"]').check({ force: true });
    await toucher(page, '#wizard-v2-btn-suivant');
    await page.locator(`#modalWizardPratiqueV2 input[name="modeleChoisi"][value="${modele}"]`).check({ force: true });
    await toucher(page, '#wizard-v2-btn-suivant');
    await toucher(page, '#wizard-v2-btn-creer');
    if (famille === 'standards') {
        // « Ce modèle a besoin d'une échelle de performance pour calculer la note. Choisis-la : »
        await page.locator('input[name="ui-dialogue-choix"][value="E1"]').check({ force: true });
        await page.locator('.modal-overlay button.btn-principal').last().click();
    }

    // 2. « L'ouvrir » : après « Créer la pratique », aucune pratique n'est ouverte.
    await attendreEtape(page, "L'ouvrir", n(2));
    await expect(page.locator('body')).not.toHaveClass(/parcours-sur-modale/);
    await cap('etape-2');
    const id = await page.evaluate(() => (db.getSync(cle('pratiquesConfigurables'), []) || []).slice(-1)[0].id);
    await page.selectOption('#menuPratiques', id);

    // 3. selon la famille.
    if (famille === 'specifications') {
        await attendreEtape(page, 'Tes types de productions', n(3));
        await boutonBulle(page, 'Continuer').click();
        await attendreEtape(page, 'Tes forfaits', n(4));
        await boutonBulle(page, 'Continuer').click();
    } else {
        await attendreEtape(page, 'Ta sélection', n(3));
        // Cowork (9 nov.) : le champ du nombre à retenir, à droite de « Mode de sélection », reste libre ; le mode et le
        // minimum aussi. Break-test (9 nov., Chromium) : la sonde de l'étape 3 sans `bulleHorsDesReglagesStd` → ROUGE.
        if (largeur >= 1180) await bulleNeCouvrePas(page, ['#mat-portfolio-nombre', '#mat-portfolio-selection', '#mat-portfolio-minimum'], 'la bulle 3 laisse les réglages de la sélection libres');
        await cap('etape-3-standards');
        await boutonBulle(page, 'Continuer').click();
    }
    const k = famille === 'specifications' ? 5 : 4;

    // 4. « Ce que lit l'étudiant·e » : « Niveau de performance ».
    await attendreEtape(page, "Ce que lit l'étudiant·e", n(k));
    await page.locator('#mat-affichage-note-lettre').check();
    await expect.poll(() => page.evaluate((id) => (db.getSync(cle('pratiquesConfigurables'), []).find((p) => p.id === id) || {}).affichageNote, id)).toBe('lettre');
    await cap('etape-4');
    await boutonBulle(page, 'Continuer').click();

    // 5. « L'appliquer à ton cours ».
    await attendreEtape(page, "L'appliquer à ton cours", n(k + 1));
    await cap('etape-5');
    await toucher(page, '#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]');

    // 6. « Évaluer une production » : Actions › Évaluer, un niveau, le cadenas.
    await attendreEtape(page, 'Évaluer une production', n(k + 2));
    const texte6 = await bulle(page).locator('.parcours-bulle-texte').textContent();
    expect(texte6.includes('En spécifications, choisis une production')).toBe(famille === 'specifications');
    await cap('etape-6');
    const ligne = page.locator('#conteneur-tableau-evaluations tr[data-da="9000001"][data-production-id="P1"]');
    await ligne.locator('select.eval-actions-select').selectOption('evaluer|9000001|P1');
    await expect(page.locator('#btnVerrouillerEvaluation')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#eval_c1')).toBeAttached({ timeout: 10000 });
    await page.evaluate(() => {
        const s = document.getElementById('eval_c1');
        s.value = 'M';
        s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect(page.locator('#parcours-contour')).toBeVisible();
    await cap('etape-6-evaluation');
    await toucher(page, '#btnVerrouillerEvaluation');
    // Cowork (9 nov., étape 5) : sous le verrou, les deux boutons d'affichage suivent le reste de la fiche.
    // Break-test (9 nov., Chromium) : les deux lignes retirées de `desactiverFormulaireEvaluation` → ROUGE.
    await expect(page.locator('#affichageNoteComplet1')).toBeDisabled();
    await expect(page.locator('#affichageNoteLettre1')).toBeDisabled();
    // L'évaluation neuve a pris l'affichage de la pratique (« Niveau de performance », étape 4) : sans copie, elle
    // gardait « Note chiffrée » (mesuré la nuit du 8 nov., corrigé dans `_evaluerSansCopie`).
    await expect.poll(() => page.evaluate(() => (db.getSync(cle('evaluationsSauvegardees'), []) || [])
        .filter((e) => e.verrouillee === true).map((e) => e.optionsAffichage && e.optionsAffichage.affichageNote))).toEqual(['lettre']);

    // 7. « Ta synthèse » : la Liste à l'écran (son `avant` y va) ; « Continuer » attend le PDF, et le dit.
    await attendreEtape(page, 'Ta synthèse', n(k + 3));
    await expect(page.locator('#evaluations-liste')).toBeVisible();
    await continuerAttend(page, 'Pour continuer, télécharge son dossier : «\u00a0Actions › Dossier PDF\u00a0», sur la ligne de la production que tu viens d\'évaluer.');
    await cap('etape-7');
    // Capture 34 (Grégoire, 11 nov. 2026) : revenu à l'écran d'évaluation, ni halo ni flèche. Hors de la Liste, la flèche
    // et le halo vont à « Liste » ; la Liste rouverte, à « Actions » de la ligne évaluée.
    const ligneP1 = '#conteneur-tableau-evaluations tr[data-da="9000001"][data-production-id="P1"] select.eval-actions-select';
    await page.evaluate(() => naviguerVers('evaluations', 'annoter'));
    await expect(page.locator('#evaluations-liste')).toBeHidden();
    await contourSur(page, '#sous-navigation [data-sous-onglet="evaluations-liste"]');
    await flecheVers(page, '#sous-navigation [data-sous-onglet="evaluations-liste"]', 'Ta synthèse, hors de la Liste');
    await page.click('#sous-navigation [data-sous-onglet="evaluations-liste"]');
    await contourSur(page, ligneP1);
    await flecheVers(page, ligneP1, 'Ta synthèse, sur la Liste');
    const telechargement = page.waitForEvent('download');
    await page.locator('#conteneur-tableau-evaluations tr[data-da="9000001"][data-production-id="P1"] select.eval-actions-select')
        .selectOption('dossier|9000001|P1');
    const fichier = await telechargement;
    expect(fichier.suggestedFilename()).toMatch(/\.pdf$/);
    await expect(boutonBulle(page, 'Continuer')).toBeVisible();
    await boutonBulle(page, 'Continuer').click();

    // 8. « Pour aller plus loin » : sans voile, sans « Plus tard », « Terminer ».
    await attendreEtape(page, 'Pour aller plus loin', n(k + 4));
    await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
    expect(await bulle(page).locator('.parcours-bulle-texte').textContent()).not.toContain('En dénotation');
    await cap('etape-8');
    await boutonBulle(page, 'Terminer').click();
    await expect(bulle(page)).toHaveCount(0);
    expect(await page.evaluate(() => Assistance.etatDe('notation-alternative').etat)).toBe('fait');
    return fichier;
}

test('le parcours entier en spécifications, de « + Nouvelle pratique » à « Terminer » (1180 px)', async ({ page }) => {
    test.setTimeout(180000);
    await parcoursEntier(page, { famille: 'specifications', modele: 'SPE-simple' });
});

test('le parcours entier en standards, l’échelle demandée par l’assistant (1180 px)', async ({ page }) => {
    test.setTimeout(180000);
    await parcoursEntier(page, { famille: 'standards', modele: 'STD-n-meilleurs' });
});

// Les captures demandées par la consigne (sombre et clair à 1180 ; les étapes 3 et 7 des standards à 820 et 390).
// Elles ne jugent rien de plus que les essais ci-dessus : elles ne tournent qu'avec CAPTURES_PARCOURS.
for (const v of [
    { largeur: 1180, clair: true, famille: 'specifications', modele: 'SPE-simple' },
    { largeur: 1180, clair: true, famille: 'standards', modele: 'STD-n-meilleurs' },
    { largeur: 820, clair: false, famille: 'standards', modele: 'STD-n-meilleurs' },
    { largeur: 820, clair: true, famille: 'standards', modele: 'STD-n-meilleurs' }, // manquait au lot des flèches (10 nov.)
    { largeur: 390, clair: false, famille: 'standards', modele: 'STD-n-meilleurs' }
]) {
    test(`captures : ${v.famille}, ${v.largeur} px, ${v.clair ? 'clair' : 'sombre'}`, async ({ page }) => {
        test.skip(!CAPTURES, 'captures seulement (CAPTURES_PARCOURS)');
        test.setTimeout(180000);
        await parcoursEntier(page, Object.assign({ suffixe: '-' + v.famille }, v));
    });
}
