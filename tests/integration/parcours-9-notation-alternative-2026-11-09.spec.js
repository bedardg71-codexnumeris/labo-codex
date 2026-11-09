import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

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
            && a.effect.target.closest('#panneau-assistance, #parcours-voile, #parcours-bulle, #entete-menu-panneau'))
        .every((a) => a.playState !== 'running'));
    // La sonde du moteur replace la bulle toutes les 120 ms : la capture attend qu'elle soit posée.
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(CAPTURES, nom + '.png') });
}

/**
 * Un trimestre réel : un cours, son groupe-cours actif, trois étudiant·es fictif·ves, une échelle, une grille,
 * deux productions avec leur grille (un projet, un examen), et les pratiques données. Puis la page rechargée.
 */
async function monter(page, { largeur = 1180, hauteur = 900, clair = false, pratiques = [], active = null, grille = true } = {}) {
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

/** Le bouton de la bulle par son nom, visible ou caché (`montrerBouton`). */
const boutonBulle = (page, nom) => bulle(page).locator('.parcours-bulle-boutons button', { hasText: nom });

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
        const texte = await bulle(page).locator('.parcours-bulle-texte').textContent();
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

test('dénotation : « Continuer » ne paraît que si une cible est nommée', async ({ page }) => {
    await page.goto(indexHtml);
    await attendreApplication(page);
    const pratiques = await pratiquesDesModeles(page);
    pratiques[2].configuration.objectifs = [{ id: 'cible-1', nom: 'Une cible' }];
    await monter(page, { pratiques, active: 'pratique_banc_0' });
    await commencer(page);
    await attendreEtape(page, "L'ouvrir", '1 sur 7');
    await page.selectOption('#menuPratiques', 'pratique_banc_2');
    await attendreEtape(page, 'Tes cibles', '2 sur 7');
    await expect(boutonBulle(page, 'Continuer')).toBeVisible();
    // La cible effacée à l'écran : « Continuer » part.
    await page.locator('#mat-den-cibles input[type="text"]').first().fill('');
    await expect(boutonBulle(page, 'Continuer')).toBeHidden();
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
    await cap('etape-1');
    await page.click('#conception-pratiques-notation [data-action="creerNouvellePratique"]');
    await expect(page.locator('#modalWizardPratiqueV2')).toHaveClass(/actif/);
    await expect(page.locator('body')).toHaveClass(/parcours-sur-modale/);
    await expect(page.locator('#parcours-contour')).toBeVisible();
    await cap('etape-1-assistant');
    await page.locator('#modalWizardPratiqueV2 input[name="porteEntree"][value="modele"]').check({ force: true });
    await page.click('#wizard-v2-btn-suivant');
    await page.locator(`#modalWizardPratiqueV2 input[name="modeleChoisi"][value="${modele}"]`).check({ force: true });
    await page.click('#wizard-v2-btn-suivant');
    await page.click('#wizard-v2-btn-creer');
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
    await page.click('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]');

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
    await page.click('#btnVerrouillerEvaluation');
    if (process.env.MESURE_P9) console.log('MESURE affichage', famille, await page.evaluate(() => JSON.stringify((db.getSync(cle('evaluationsSauvegardees'), []) || []).map((e) => [e.id, e.verrouillee, e.optionsAffichage && e.optionsAffichage.affichageNote]))));

    // 7. « Ta synthèse » : Actions › Dossier PDF ; « Continuer » paraît quand le PDF est téléchargé.
    await attendreEtape(page, 'Ta synthèse', n(k + 3));
    await expect(boutonBulle(page, 'Continuer')).toBeHidden();
    await cap('etape-7');
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
    { largeur: 390, clair: false, famille: 'standards', modele: 'STD-n-meilleurs' }
]) {
    test(`captures : ${v.famille}, ${v.largeur} px, ${v.clair ? 'clair' : 'sombre'}`, async ({ page }) => {
        test.skip(!CAPTURES, 'captures seulement (CAPTURES_PARCOURS)');
        test.setTimeout(180000);
        await parcoursEntier(page, Object.assign({ suffixe: '-' + v.famille }, v));
    });
}
