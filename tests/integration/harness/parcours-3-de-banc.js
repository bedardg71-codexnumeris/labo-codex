// =======================================================================
// LE TROISIÈME PARCOURS, JOUÉ PAR SES GESTES (9 nov. 2026)
// =======================================================================
// Les étapes du banc du troisième parcours (parcours-3-evaluer-2026-11-09.spec.js, qui les juge) ;
// le banc du quatrième part d'« un espace où le troisième parcours est fait » et les rejoue.
import { test, expect } from '@playwright/test';
import {
    ouvrirEspaceVide, ouvrirPanneau, attendreEtape, contourSur, bulleNeCouvrePas, capture, bulle, mettreLaClasseEnPlace,
    etiqueterExemple, choisirDesNiveaux
} from './classe-de-banc.js';
import { attendreApplication } from './attendre-application.js';

let DOSSIER = process.env.CAPTURES_PARCOURS || '';
/** Le dossier des captures (vide : aucune). */
export function dossierDesCaptures(d) { DOSSIER = d || ''; }
const TOTAL = 9;
const etape = (page, n, titre, opts) => attendreEtape(page, n, TOTAL, titre, opts);
const ctx = (page) => page.evaluate(() => ParcoursEvaluer.contexte());
const rang = (page) => page.locator('#assistance-menu-rang');
// Le compte des parcours se lit au registre : les lots suivants s'y ajoutent (parcours 4, 9 nov.).
const nParcours = (page) => page.evaluate(() => window.Assistance.parcours().length);
const item = (page) => page.locator('#panneau-assistance [data-parcours="evaluer"]');

const TEXTE_CHOIX = "Ta grille porte des points et des niveaux. Le résultat d'une évaluation viendra de l'un ou de l'autre : des points qui s'additionnent en une note, ou un niveau par critère (comme « maîtrisé »), que ton échelle traduit ensuite en note. Choisis ce qui correspond à ta façon d'évaluer.";
const REFUS = 'Commence par « Mettre ta classe en place » : il faut une classe pour évaluer une production.';

/** Une option du menu « Actions… » de la Liste, choisie comme une personne la choisit. */
async function actionDeLaListe(page, valeur) {
    await page.locator('#evaluations-liste select.eval-actions-select', { has: page.locator(`option[value="${valeur}"]`) }).selectOption(valeur);
}

async function valeursActions(page, fragment) {
    return page.evaluate((f) => [...document.querySelectorAll('#evaluations-liste select.eval-actions-select option')]
        .map((o) => o.value).filter((v) => v.includes(f)), fragment);
}

async function lePanneauSansClasse(page, cap) {
    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-titre')).toHaveText('Évaluer une première production');
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('À faire');
    // Sa ligne n'est pas validée : aucune n'est écrite (rapport du lot, proposée).
    await expect(item(page).locator('.assistance-parcours-ligne')).toHaveCount(0);
    await item(page).locator('.assistance-parcours-bouton').click();
    await expect(item(page).locator('.assistance-parcours-condition')).toHaveText(REFUS);
    await expect(page.locator('#panneau-assistance')).toBeVisible();
    await expect(bulle(page)).toHaveCount(0);
    await capture(page, DOSSIER, `panneau-${cap}-sans-classe`);
    await page.keyboard.press('Escape');
}

/** Étape 1 : la grille, de l'accueil de Mon matériel au choix, puis « Créer ma grille ». */
async function etape1(page, { niveaux, cap }) {
    await etape(page, 1, 'Ta grille');
    await expect(page.locator('#conception-materiel')).toBeVisible();
    await contourSur(page, '#materiel-zone-collage');
    await expect(page.locator('#materiel-accueil [data-action="materiel.taperMain"]')).toHaveText('Partir de zéro');
    await capture(page, DOSSIER, `p3-1-${cap}`);
    await etiqueterExemple(page);
    // La bulle du choix : le même rang, son propre texte, le contour sur le choix.
    await expect(bulle(page).locator('.parcours-bulle-texte')).toHaveText(TEXTE_CHOIX);
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('1 sur 9');
    await contourSur(page, '#dissection-creer-choix');
    await capture(page, DOSSIER, `p3-1-choix-${cap}`);
    if (niveaux) await choisirDesNiveaux(page);
    expect(await page.evaluate(() => ParcoursMoteur.etapeCourante())).toBe(0);   // rien de créé encore
    await page.click('#dissection-creer [data-action="materielDissection.creer"]');
}

/** Étape 2 : la production, champ par champ (le contour suit), puis « Créer la production ». */
async function etape2(page, { cap }) {
    await etape(page, 2, 'Ta production', { focus: false });
    await contourSur(page, '#conception-productions [data-action="creerNouvelleProduction"]');
    await capture(page, DOSSIER, `p3-2-${cap}`);
    await page.click('#conception-productions [data-action="creerNouvelleProduction"]');
    await contourSur(page, '#productionTitre');
    await page.fill('#productionTitre', 'Journal de lecture 1');
    await contourSur(page, '#productionType');
    await page.selectOption('#productionType', 'travail');
    await page.fill('#productionActivite', 'Lire un roman et en rendre compte');
    await page.fill('#productionPonderation', '20');
    await contourSur(page, '#productionGrille');
    const grilleId = (await ctx(page)).grilleId;
    expect(grilleId).toBeTruthy();
    await page.selectOption('#productionGrille', grilleId);
    await contourSur(page, '#btnCreerProduction');
    await bulleNeCouvrePas(page, '#btnCreerProduction', 'étape 2');
    await capture(page, DOSSIER, `p3-2-fiche-${cap}`);
    await page.click('#btnCreerProduction');
}

/** Étape 3 : « Plus tard », un rechargement, « Reprendre » ; puis la date et « Consignes transmises ». */
async function etape3(page, { cap, plusTard }) {
    await etape(page, 3, 'Tes consignes', { focus: false });
    await contourSur(page, '.echeance-simple-ligne');
    await bulleNeCouvrePas(page, '#productionDateEcheance', 'étape 3');
    await bulleNeCouvrePas(page, '#productionEcheanceAssignee', 'étape 3');
    await capture(page, DOSSIER, `p3-3-${cap}`);
    if (plusTard) {
        await bulle(page).getByRole('button', { name: 'Plus tard' }).click();
        await expect(bulle(page)).toHaveCount(0);
        expect(await page.evaluate(() => Assistance.etatDe('evaluer'))).toEqual({ etat: 'en-cours', etape: 2 });
        await page.reload();
        await attendreApplication(page);
        await expect(bulle(page)).toHaveCount(0);   // rien ne rouvre de lui-même
        await expect(rang(page)).toHaveText('3 sur ' + await nParcours(page));   // le parcours en cours d'abord
        await ouvrirPanneau(page);
        await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('Étape 3 sur 9');
        await expect(item(page).locator('.assistance-parcours-bouton')).toHaveText('Reprendre');
        await capture(page, DOSSIER, `panneau-${cap}-en-cours`);
        await item(page).locator('.assistance-parcours-bouton').click();
        await etape(page, 3, 'Tes consignes');
        await contourSur(page, '.echeance-simple-ligne');
    }
    await page.fill('#productionDateEcheance', '2026-11-03');
    expect(await page.evaluate(() => ParcoursMoteur.etapeCourante())).toBe(2);   // la date seule ne suffit pas
    await page.check('#productionEcheanceAssignee');
}

/** Étape 4 : la Liste, « Actions › Évaluer » sans fichier, chaque critère, la rétroaction, « Verrouiller ». */
async function etape4(page, { niveaux, cap }) {
    await etape(page, 4, 'Une première production', { focus: false });
    const pid = (await ctx(page)).productionId;
    const evaluer = (await valeursActions(page, pid)).find((v) => v.startsWith('evaluer|2390001|'));
    expect(evaluer).toBeTruthy();
    await contourSur(page, `#evaluations-liste select.eval-actions-select:has(option[value="${evaluer}"])`);
    // La colonne « Actions » est amenée dans la vue (le tableau dépasse l'écran à 1180 px).
    await expect(page.locator(`#evaluations-liste select.eval-actions-select:has(option[value="${evaluer}"])`)).toBeInViewport();
    await capture(page, DOSSIER, `p3-4-${cap}`);
    await actionDeLaListe(page, evaluer);
    await expect(page.locator('#evaluations-contenu-evaluation')).toBeVisible();
    const lireChamps = () => page.evaluate(() => [...document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"], #listeCriteresGrille1 input[id^="eval_pts_"]')].map((c) => c.id));
    if (niveaux) {
        // Une grille à niveaux, une production qui ne nomme pas d'échelle, deux échelles au trimestre (celle de
        // Mon matériel, celle de départ semée au rechargement) : l'écran demande l'échelle, le contour s'y pose.
        // La bulle 4 ne le dit pas (rapport du lot, phrase proposée).
        await expect(page.locator('#listeCriteresGrille1')).toContainText('Choisis maintenant une échelle de performance');
        await contourSur(page, '#selectEchelle1');
        const echelle = await page.evaluate(() => [...document.querySelectorAll('#selectEchelle1 option')].find((o) => /Journal de lecture/.test(o.textContent)).value);
        await page.selectOption('#selectEchelle1', echelle);
    }
    await expect.poll(async () => (await lireChamps()).length).toBe(4);
    const champs = await lireChamps();
    await contourSur(page, '#' + champs[0]);
    for (const id of champs) {
        if (niveaux) await page.selectOption('#' + id, 'S');
        else await page.fill('#' + id, '4');
    }
    await contourSur(page, '#btnVerrouillerEvaluation');
    await bulleNeCouvrePas(page, '#btnVerrouillerEvaluation', 'étape 4');
    // « une rétroaction s'écrit sous tes yeux : chaque critère de ta grille, avec ce que tu lui attribues »
    const retro = await page.inputValue('#retroactionFinale1');
    expect(retro).toContain(niveaux ? '— S' : '— 4 / ');
    expect(retro).not.toContain('MOT-DE-CARTOUCHE');
    await capture(page, DOSSIER, `p3-4-evaluation-${cap}`);
    // Pas avant le verrou. Mesuré le 9 nov. (relecture neuve) : avant « Verrouiller », une évaluation NEUVE n'est pas
    // enregistrée (rien en stock après quatre secondes) ; l'étape ne peut donc avancer que sur le verrou. La garde
    // `verrouillee === true` du parcours vaut pour une évaluation déjà enregistrée puis déverrouillée.
    expect(await page.evaluate((p) => (db.getSync(cle('evaluationsSauvegardees'), []) || []).filter((e) => e.productionId === p).length, pid)).toBe(0);
    expect(await page.evaluate(() => ParcoursMoteur.etapeCourante())).toBe(3);
    await page.click('#btnVerrouillerEvaluation');
}

/** Étapes 5 et 6 : « + Nouvelle pratique », « Partir d'un modèle », « Modèle sommatif » ; le menu, « Appliquer ». */
async function etapes5et6(page, { cap }) {
    await etape(page, 5, 'Ta pratique', { focus: false });
    await contourSur(page, '#conception-pratiques-notation [data-action="creerNouvellePratique"]');
    await capture(page, DOSSIER, `p3-5-${cap}`);
    await page.click('#conception-pratiques-notation [data-action="creerNouvellePratique"]');
    await expect(page.locator('#modalWizardPratiqueV2')).toHaveClass(/actif/);
    await expect(page.locator('body')).toHaveClass(/parcours-sur-modale/);
    await contourSur(page, '#modalWizardPratiqueV2 .wizard-v2-radio-card:has(input[value="modele"])');
    await capture(page, DOSSIER, `p3-5-assistant-${cap}`);
    await page.locator('#modalWizardPratiqueV2 input[name="porteEntree"][value="modele"]').check({ force: true });
    await page.click('#wizard-v2-btn-suivant');
    await page.locator('#modalWizardPratiqueV2 input[name="modeleChoisi"][value="SOM-litterature"]').check({ force: true });
    await page.click('#wizard-v2-btn-suivant');
    await page.click('#wizard-v2-btn-creer');

    await etape(page, 6, "L'appliquer à ton cours", { focus: false });
    await expect(page.locator('body')).not.toHaveClass(/parcours-sur-modale/);
    expect(await page.evaluate(() => designerPratiqueActive().idBrut)).toBeFalsy();
    await capture(page, DOSSIER, `p3-6-${cap}`);
    const pratiqueId = (await ctx(page)).pratiqueId;
    await page.selectOption('#menuPratiques', pratiqueId);
    await contourSur(page, '#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]');
    await expect(page.locator('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]')).toBeInViewport();
    await capture(page, DOSSIER, `p3-6-fiche-${cap}`);
    await page.click('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]');
}

/** Étape 7 : la bande de performance, le point de l'étudiant·e évalué·e ; « Continuer ». */
async function etape7(page, { cap }) {
    await etape(page, 7, "Le point qui s'allume", { focus: false });
    await expect(page.locator('#suivi-groupe')).toBeVisible();
    await expect(page.locator('#section-suivi h4[data-tooltip="tdb-performance"]')).toBeInViewport();
    await capture(page, DOSSIER, `p3-7-${cap}`);
    await bulle(page).getByRole('button', { name: 'Continuer' }).click();
}

/** Étape 8 : la cartouche, sur la grille du parcours et l'échelle offerte ; un commentaire par niveau. */
async function etape8(page, { niveaux, cap }) {
    await etape(page, 8, 'Ta cartouche', { focus: false });
    await contourSur(page, '#conception-retroactions [data-action="creerNouvelleCartouche"]');
    await capture(page, DOSSIER, `p3-8-${cap}`);
    await page.click('#conception-retroactions [data-action="creerNouvelleCartouche"]');
    await contourSur(page, '#nomCartouche');
    await page.fill('#nomCartouche', 'Mes commentaires');
    await page.selectOption('#selectGrilleCartouche', (await ctx(page)).grilleId);
    // Les échelles se chargent après la grille ; seule échelle offerte, elle est choisie d'office (en points : celle de départ).
    await expect.poll(() => page.locator('#selectEchelleCartouche option[value]:not([value=""])').count()).toBeGreaterThan(0);
    if (!(await page.inputValue('#selectEchelleCartouche'))) await contourSur(page, '#selectEchelleCartouche');
    const echelles = await page.evaluate(() => [...document.querySelectorAll('#selectEchelleCartouche option')].filter((o) => o.value).map((o) => o.value + ' ' + o.textContent));
    // À niveaux : l'échelle que Mon matériel a créée avec la grille. En points : celle de départ (rapport, étape 8).
    expect(echelles.join(' | ')).toContain(niveaux ? 'Journal de lecture' : 'ECHELLE_IDME_DEPART');
    const echelleVoulue = echelles.find((e) => (niveaux ? /Journal de lecture/ : /ECHELLE_IDME_DEPART/).test(e)).split(' ')[0];
    await page.selectOption('#selectEchelleCartouche', echelleVoulue);
    // La matrice se refait sur les niveaux de l'échelle choisie : on attend ses cases avant d'écrire.
    const niveauDeLEchelle = niveaux ? 'S' : 'M';
    await expect(page.locator(`#cartoucheZonePrincipale textarea[id^="comm_"][id$="_${niveauDeLEchelle}"]`).first()).toBeVisible();
    for (const id of await page.evaluate(() => [...document.querySelectorAll('#cartoucheZonePrincipale textarea[id^="comm_"]')].map((t) => t.id))) {
        await page.fill('#' + id, 'MOT-DE-CARTOUCHE ' + id.split('_').pop());
    }
    await contourSur(page, '#btnCreerCartouche');
    await capture(page, DOSSIER, `p3-8-fiche-${cap}`);
    await page.click('#btnCreerCartouche');
    await expect.poll(() => page.evaluate(() => {
        const c = ParcoursEvaluer.contexte();
        const cart = (db.getSync(cle('cartouches_' + c.grilleId), []) || [])[0];
        return cart ? Object.values(cart.commentaires || {}).filter((t) => /MOT-DE-CARTOUCHE/.test(t)).length : 0;
    })).toBeGreaterThan(0);
}

/** Étape 9 : « Actions › Consulter », « Déverrouiller », la cartouche, le mot, « Verrouiller », « Terminer ». */
async function etape9(page, { cap }) {
    await etape(page, 9, 'Ta rétroaction, avec tes mots', { focus: false });
    await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);   // la dernière : pas de « Plus tard »
    await expect(bulle(page).locator('.parcours-bulle-boutons button')).toHaveText(['Terminer']);
    const c = await ctx(page);
    const consulter = (await valeursActions(page, c.evaluationId)).find((v) => v.startsWith('consulter|'));
    await contourSur(page, `#evaluations-liste select.eval-actions-select:has(option[value="${consulter}"])`);
    await expect(page.locator(`#evaluations-liste select.eval-actions-select:has(option[value="${consulter}"])`)).toBeInViewport();
    await capture(page, DOSSIER, `p3-9-${cap}`);
    await actionDeLaListe(page, consulter);
    await expect(page.locator('#evaluations-contenu-evaluation')).toBeVisible();
    await contourSur(page, '#btnVerrouillerEvaluation');   // « Déverrouiller »
    await page.click('#btnVerrouillerEvaluation');
    await contourSur(page, '#selectCartoucheEval');
    await page.selectOption('#selectCartoucheEval', c.cartoucheId);
    // La rétroaction se réécrit avec les phrases de la cartouche (en points : le défaut de la consigne, corrigé).
    await expect.poll(() => page.inputValue('#retroactionFinale1'), { timeout: 5000 }).toContain('MOT-DE-CARTOUCHE');
    await page.fill('#motPourEtudiant1', 'Bravo pour ta lecture attentive.');
    await contourSur(page, '#btnVerrouillerEvaluation');
    await capture(page, DOSSIER, `p3-9-reecrite-${cap}`);
    await page.click('#btnVerrouillerEvaluation');
    await expect.poll(() => page.evaluate((id) => {
        const e = (db.getSync(cle('evaluationsSauvegardees'), []) || []).find((x) => x.id === id);
        return e ? [e.verrouillee, e.cartoucheId] : null;
    }, c.evaluationId)).toEqual([true, c.cartoucheId]);
    await bulle(page).getByRole('button', { name: 'Terminer' }).click();
    await expect(bulle(page)).toHaveCount(0);
    expect(await page.evaluate(() => Assistance.etatDe('evaluer').etat)).toBe('fait');
}

export async function leParcoursEntier(page, { niveaux, cap }) {
    test.setTimeout(240000);
    await ouvrirEspaceVide(page, 1180);
    await lePanneauSansClasse(page, cap);
    await mettreLaClasseEnPlace(page);
    // Le compte du menu passe à trois parcours ; il montre le premier qui n'est pas fait (« Découvrir », ici).
    await expect(rang(page)).toHaveText('1 sur ' + await nParcours(page));

    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('À faire');
    await expect(item(page).locator('.assistance-parcours-bouton')).toHaveText('Commencer');
    await capture(page, DOSSIER, `panneau-${cap}-a-faire`);
    await item(page).locator('.assistance-parcours-bouton').click();

    await etape1(page, { niveaux, cap });
    await etape2(page, { cap });
    // « Plus tard », un rechargement, « Reprendre » : dans l'essai à niveaux. L'essai en points se joue d'une traite :
    // sans rechargement, l'échelle de départ doit exister à l'étape 8 (relecture neuve du 9 nov.).
    await etape3(page, { cap, plusTard: niveaux });
    await etape4(page, { niveaux, cap });
    await etapes5et6(page, { cap });
    await etape7(page, { cap });
    await etape8(page, { niveaux, cap });
    await etape9(page, { cap });

    await expect(rang(page)).toHaveText('1 sur ' + await nParcours(page));   // « Découvrir » reste à faire
    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('Fait');
    await expect(item(page).locator('.assistance-parcours-bouton')).toHaveText('Refaire');
    await capture(page, DOSSIER, `panneau-${cap}-fait`);
}
