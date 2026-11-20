// =======================================================================
// « ÉVALUER UNE PREMIÈRE PRODUCTION », « NOUS FAISONS », JOUÉ PAR SES GESTES (20 nov. 2026)
// =======================================================================
// Les dix bulles du 20 nov. 2026 (plans de travail/CONSIGNE-2026-11-20-essai-parcours.md, section D), jouées comme une
// personne les joue, dans les deux voies des bulles 2 (« Partir d'un modèle », « Décrire ma pratique ») et 5 (« Mon
// matériel », « Je la compose ici »). Le banc tests/integration/nous-faisons-evaluer-2026-11-20.spec.js les juge ; les
// bancs qui partent « d'un espace où le troisième parcours est fait » les rejouent (`leNousFaisonsEntier`).
// Il remplace tests/integration/harness/parcours-3-de-banc.js (l'ancienne Pratique guidée, neuf étapes, retirée).
import { test, expect } from '@playwright/test';
import {
    ouvrirEspaceVide, ouvrirPanneau, attendreEtape, contourSur, bulleNeCouvrePas, capture, bulle, mettreLaClasseEnPlace, deuxSondes,
    etiqueter
} from './classe-de-banc.js';

let DOSSIER = process.env.CAPTURES_PARCOURS || '';
/** Le dossier des captures (vide : aucune). */
export function dossierDesCaptures(d) { DOSSIER = d || ''; }

export const TOTAL = 10;
export const aPlat = (t) => String(t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const etape = (page, n, titre) => attendreEtape(page, n, TOTAL, titre, { focus: false });
export const ctx = (page) => page.evaluate(() => ParcoursEvaluer.contexte());
export const item = (page) => page.locator('#panneau-assistance [data-parcours="evaluer"]');

/** Une option du menu « Actions… » de la Liste, choisie comme une personne la choisit. */
export async function actionDeLaListe(page, valeur) {
    await page.locator('#evaluations-liste select.eval-actions-select', { has: page.locator(`option[value="${valeur}"]`) }).first().selectOption(valeur);
}

export async function valeursActions(page, fragment) {
    return page.evaluate((f) => [...document.querySelectorAll('#evaluations-liste select.eval-actions-select option')]
        .map((o) => o.value).filter((v) => v.includes(f)), fragment);
}

/** Ce que dit la bulle, à plat : ce qui est au-dessus du titre, ses phrases, ses lignes par genre, ses boutons. */
export const lire = (page) => page.evaluate(() => {
    const b = document.getElementById('parcours-bulle');
    if (!b) return null;
    const plat = (e) => (e ? e.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim() : '');
    const vis = (e) => !!e && !e.hidden && e.getClientRects().length > 0;
    const un = (sel) => { const e = b.querySelector(sel); return vis(e) ? plat(e) : ''; };
    const tous = (sel) => [...b.querySelectorAll(sel)].filter(vis).map(plat);
    const contour = document.getElementById('parcours-contour');
    // L'ordre des éléments de la bulle, de haut en bas (leur classe) : ce qui est au-dessus du titre, puis le reste.
    const ordre = [...b.children].filter(vis).map((e) => e.className.split(' ')[0]);
    return {
        ordre,
        identite: un('.parcours-bulle-identite'),
        aide: un('.parcours-bulle-aide'),
        confirme: un('.parcours-bulle-confirme'),
        titre: un('.parcours-bulle-titre'),
        rang: un('.parcours-bulle-rang'),
        objectif: un('.parcours-bulle-objectif:not(.parcours-bulle-atteint)'),
        atteint: un('.parcours-bulle-atteint'),
        lieu: un('.parcours-bulle-lieu'),
        notes: tous('.parcours-bulle-note:not(.parcours-bulle-revue)'),
        suite: tous('.parcours-bulle-suite'),
        revue: un('.parcours-bulle-revue'),
        gestes: tous('.parcours-bulle-ligne--a-faire > .parcours-bulle-ligne-texte'),
        consignes: tous('.parcours-bulle-ligne--geste > .parcours-bulle-ligne-texte'),
        faites: tous('.parcours-bulle-ligne.est-faite > .parcours-bulle-ligne-texte'),
        boutons: tous('.parcours-bulle-boutons button'),
        principaux: tous('.parcours-bulle-boutons button.btn-principal'),
        contour: !!contour && !contour.hidden
    };
});

/** La bulle dit ceci (une partie de ce que rend `lire`), une fois la sonde passée. */
export async function bulleDit(page, attendu, contexte) {
    await expect.poll(async () => {
        const vu = await lire(page);
        if (!vu) return 'pas de bulle';
        const ecarts = Object.keys(attendu).filter((k) => JSON.stringify(vu[k]) !== JSON.stringify(attendu[k]))
            .map((k) => k + ' : ' + JSON.stringify(vu[k]));
        return ecarts.join(' | ');
    }, { message: contexte, timeout: 10000 }).toBe('');
}

const sansContour = (page, contexte) => expect.poll(async () => (await lire(page)).contour, { message: contexte + ' : rien n’est désigné' }).toBe(false);

/** Les messages « … créé. » s'empilent sur les boutons de la page : le banc juge le parcours, pas eux. */
const retirerLesAvis = (page) => page.evaluate(() => document.querySelectorAll('.notifications-pile > *').forEach((n) => n.remove()));

// ---------- Les mots des bulles (ceux de la consigne ; la sentinelle Vitest les confronte mot pour mot) ----------

export const MOTS = {
    identite: 'Parcours 3 · Évaluer une première production · Nous faisons',
    poignee: 'Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir.',
    objectif: "À la fin de ce parcours, tu seras en mesure d'évaluer une première production de ton groupe, de la pratique de notation à la rétroaction.",
    atteint: "Objectif atteint : tu es en mesure d'évaluer une première production de ton groupe, de la pratique de notation à la rétroaction.",
    suite: ['Chaque parcours a son objectif. C\'est toi qui choisis la suite.', 'Suite suggérée : le parcours 4, « Recevoir les productions, rendre tes rétroactions ».'],
    revue: 'Pour revoir une étape, touche « 10 sur 10 ».',
    lieu: {
        1: "Tu es dans « Conception », à l'onglet « Pratiques » : c'est là que tu dis comment se construit la note de ton cours.",
        4: "Tu es dans « Conception », à l'onglet « Échelles » : c'est là que tu nommes les niveaux avec lesquels tu évalues une production.",
        '5m': "Tu es dans « Conception », à l'onglet « Mon matériel » : c'est là que tu apportes la grille que tu utilises déjà.",
        '5g': "Tu es dans « Conception », à l'onglet « Grilles » : c'est là que tu composes et modifies tes grilles.",
        6: "Tu es dans « Conception », à l'onglet « Cartouches » : c'est là que tu prépares tes rétroactions.",
        7: "Tu es dans « Conception », à l'onglet « Productions » : c'est là que tu décris ce que tu demandes à tes étudiant·es.",
        9: "Tu es dans « Évaluation », à l'onglet « Liste » : c'est là que tu vois où en est chaque production de ton groupe, une ligne par étudiant·e.",
        10: "Tu es dans « Suivi », à l'onglet « Groupe » : c'est là que tu vois ta classe d'un coup d'œil."
    }
};

// ---------- Bulles 1 et 2 : la pratique ----------

/** Bulle 1 : la page, puis l'assistant ; la voie choisie, « Suivant → ». */
export async function bulle1(page, { voie, cap }) {
    await etape(page, 1, 'Ta pratique de notation');
    await expect(page.locator('#conception-pratiques-notation')).toBeVisible();
    // A1 et A2 : au-dessus du titre, en petit, le parcours puis la phrase de la poignée ; l'objectif et le lieu dessous.
    await bulleDit(page, {
        identite: MOTS.identite, aide: MOTS.poignee, confirme: '', objectif: MOTS.objectif, lieu: MOTS.lieu[1],
        consignes: ['Touche « + Nouvelle pratique »'], gestes: [], boutons: []
    }, 'bulle 1, la page');
    const vu = await lire(page);
    expect(vu.ordre.slice(0, 3), 'bulle 1 : le parcours, la poignée, puis le titre').toEqual(['parcours-bulle-identite', 'parcours-bulle-aide', 'parcours-bulle-tete']);
    expect(vu.notes.length, 'bulle 1 : cinq explications').toBe(5);
    await contourSur(page, '#conception-pratiques-notation [data-action="creerNouvellePratique"]');
    await capture(page, DOSSIER, `nf3-01-${cap}`);
    await page.click('#conception-pratiques-notation [data-action="creerNouvellePratique"]');
    // La seconde forme : l'assistant ouvert ; ni l'entrée, ni l'objectif, ni le lieu.
    await bulleDit(page, {
        identite: '', aide: '', objectif: '', lieu: '', confirme: '',
        consignes: ['Choisis la voie qui te convient, puis touche « Suivant → »']
    }, 'bulle 1, l’assistant ouvert');
    expect((await lire(page)).notes.length, 'bulle 1, seconde forme : trois explications').toBe(3);
    // Rien n'est désigné tant qu'aucune voie n'est choisie (la bulle ne choisit pas pour la personne).
    await sansContour(page, 'bulle 1, aucune voie choisie');
    await page.locator(`#modalWizardPratiqueV2 .wizard-v2-radio-card:has(input[name="porteEntree"][value="${voie}"])`).click();
    await contourSur(page, '#wizard-v2-btn-suivant');
    await bulleNeCouvrePas(page, '#wizard-v2-btn-suivant', 'bulle 1');
    await capture(page, DOSSIER, `nf3-01-assistant-${cap}`);
    await page.click('#wizard-v2-btn-suivant');
}

/** La question de l'échelle, si l'assistant la pose : l'échelle de départ, puis « Adopter ». */
async function repondreALaQuestionDeLEchelle(page) {
    const question = page.locator('#ui-dialogue-question');
    const posee = await question.waitFor({ state: 'visible', timeout: 3000 }).then(() => true, () => false);
    if (!posee) return false;
    await contourSur(page, '#overlay-ui-dialogue .ui-dialogue-choix-ligne:has(#ui-dialogue-choix-0)');
    await page.check('#ui-dialogue-choix-0');
    await expect.poll(() => page.evaluate(() => {
        const c = document.getElementById('parcours-contour');
        const b = [...document.querySelectorAll('#overlay-ui-dialogue .modal-actions button')].find((x) => x.textContent.trim() === 'Adopter');
        if (!c || c.hidden || !b) return 'absent';
        const a = c.getBoundingClientRect(), r = b.getBoundingClientRect();
        return Math.abs((a.left + a.right) / 2 - (r.left + r.right) / 2) < 3 && Math.abs((a.top + a.bottom) / 2 - (r.top + r.bottom) / 2) < 3;
    }), { message: 'la question de l’échelle : le halo passe à « Adopter »' }).toBe(true);
    await page.locator('#overlay-ui-dialogue .modal-actions button', { hasText: 'Adopter' }).click();
    return true;
}

/** Bulle 2, voie « Partir d'un modèle » : le choix, puis le récapitulatif. `modele` : l'identifiant de la carte. */
export async function bulle2Modele(page, { modele = 'STD-n-meilleurs', cap }) {
    await etape(page, 2, 'Un modèle');
    await bulleDit(page, {
        confirme: "C'est fait : tu es à l'écran « Choisis un modèle ».", identite: '', aide: '', objectif: '', lieu: '',
        consignes: ['Touche le modèle le plus proche de ta façon de noter, puis « Suivant → »']
    }, 'bulle 2, « Choisis un modèle »');
    expect((await lire(page)).notes.length, 'bulle 2, le choix : trois explications').toBe(3);
    await sansContour(page, 'bulle 2, aucun modèle choisi');
    await capture(page, DOSSIER, `nf3-02-${cap}`);
    await page.locator(`#modalWizardPratiqueV2 .wizard-v2-radio-card:has(input[name="modeleChoisi"][value="${modele}"])`).click();
    await contourSur(page, '#wizard-v2-btn-suivant');
    await page.click('#wizard-v2-btn-suivant');
    // Le récapitulatif : la seconde forme, sans confirmation.
    await bulleDit(page, { confirme: '', consignes: ['Touche « Créer la pratique »'] }, 'bulle 2, le récapitulatif');
    const vu = await lire(page);
    expect(vu.notes[2], 'bulle 2 : la ligne de l’échelle').toBe("Si l'assistant te demande une échelle, choisis « Échelle de départ (IDME) » : tu la découvriras à l'étape 4.");
    await contourSur(page, '#wizard-v2-btn-creer');
    await bulleNeCouvrePas(page, '#wizard-v2-btn-creer', 'bulle 2');
    await capture(page, DOSSIER, `nf3-02-recap-${cap}`);
    await page.click('#wizard-v2-btn-creer');
    return repondreALaQuestionDeLEchelle(page);
}

/**
 * Bulle 2, voie « Décrire ma pratique » : la bulle ne suit pas chaque écran ; le premier geste se grise au
 * récapitulatif. Le banc répond à chaque écran par son premier choix.
 */
export async function bulle2Decrire(page, { cap }) {
    await etape(page, 2, 'Tes réponses');
    await bulleDit(page, {
        confirme: "C'est fait : l'assistant commence ses questions.",
        gestes: ['Réponds à chaque écran, puis touche « Suivant → »'], faites: [],
        consignes: ['Au récapitulatif, touche « Créer la pratique »']
    }, 'bulle 2, « Tes réponses »');
    expect((await lire(page)).notes.length, 'bulle 2, décrire : deux explications').toBe(2);
    await capture(page, DOSSIER, `nf3-02-decrire-${cap}`);
    for (let k = 0; k < 12 && !(await page.locator('#wizard-v2-btn-creer').isVisible()); k++) {
        // La bulle reste la même d'un écran à l'autre : elle ne revient pas à la bulle 1, elle n'avance pas.
        expect(await page.evaluate(() => ParcoursMoteur.etapeCourante()), 'bulle 2, décrire : la bulle ne bouge pas').toBe(1);
        await contourSur(page, '#wizard-v2-btn-suivant');
        await page.evaluate(() => {
            const m = document.getElementById('modalWizardPratiqueV2');
            // Un choix par question : le premier ; pour des cases à cocher, « aucune » si elle est offerte.
            const vus = {};
            [...m.querySelectorAll('input[type="radio"][name], input[type="checkbox"][name]')].filter((r) => r.name).forEach((r) => { (vus[r.name] = vus[r.name] || []).push(r); });
            Object.keys(vus).forEach((nom) => {
                if (vus[nom].some((r) => r.checked)) return;
                (vus[nom].find((r) => r.value === 'aucune') || vus[nom][0]).click();
            });
            // « Informations de base » : les champs de texte encore vides (un nom de pratique, une identité fictive).
            [...m.querySelectorAll('input[type="text"], input:not([type])')].filter((c) => c.offsetParent !== null && !c.value).forEach((c, k) => {
                c.value = 'Banc ' + (k + 1);
                c.dispatchEvent(new Event('input', { bubbles: true }));
                c.dispatchEvent(new Event('change', { bubbles: true }));
            });
            [...m.querySelectorAll('select')].filter((s) => s.offsetParent !== null && !s.value).forEach((s) => {
                const o = [...s.options].find((x) => x.value && !x.disabled);
                if (o) { s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })); }
            });
        });
        await page.click('#wizard-v2-btn-suivant');
    }
    await expect(page.locator('#wizard-v2-btn-creer')).toBeVisible();
    // Au récapitulatif : le premier geste est fait, la consigne reste, le halo passe à « Créer la pratique ».
    await bulleDit(page, {
        faites: ['Réponds à chaque écran, puis touche « Suivant → »'], consignes: ['Au récapitulatif, touche « Créer la pratique »']
    }, 'bulle 2, décrire, au récapitulatif');
    await contourSur(page, '#wizard-v2-btn-creer');
    await page.click('#wizard-v2-btn-creer');
    return repondreALaQuestionDeLEchelle(page);
}

// ---------- Bulle 3 : l'appliquer au cours ----------

export async function bulle3(page, { cap }) {
    await etape(page, 3, "L'appliquer à ton cours");
    const id = (await ctx(page)).pratiqueId;
    expect(id, 'la pratique née dans le parcours est retenue').toBeTruthy();
    await bulleDit(page, {
        confirme: "C'est fait : ta pratique est créée.", lieu: '',
        gestes: ["Vérifie que le cours de l'en-tête est bien celui que tu veux évaluer", "Choisis ta pratique dans le menu en haut de la page, puis fais défiler jusqu'au bas de sa fiche"],
        faites: [], consignes: ['Touche « Appliquer au cours actif »']
    }, 'bulle 3');
    const vu = await lire(page);
    expect(vu.notes[0], 'bulle 3 : la phrase du lieu, telle que Grégoire l’a écrite').toBe("Tu es en haut de l'onglet « Pratiques ». Le cours actif est celui de l'en-tête de l'application.");
    expect(vu.notes.length).toBe(3);
    await contourSur(page, '#menuPratiques');
    await capture(page, DOSSIER, `nf3-03-${cap}`);
    await page.selectOption('#menuPratiques', id);
    // Le geste du menu se grise ; « Vérifie… » ne se grise pas ; le halo passe à « Appliquer au cours actif ».
    await bulleDit(page, {
        faites: ["Choisis ta pratique dans le menu en haut de la page, puis fais défiler jusqu'au bas de sa fiche"],
        gestes: ["Vérifie que le cours de l'en-tête est bien celui que tu veux évaluer", "Choisis ta pratique dans le menu en haut de la page, puis fais défiler jusqu'au bas de sa fiche"]
    }, 'bulle 3, la pratique choisie');
    await contourSur(page, '#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]');
    await capture(page, DOSSIER, `nf3-03-fiche-${cap}`);
    await retirerLesAvis(page);
    await page.click('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]');
}

// ---------- Bulle 4 : l'échelle ----------

export async function bulle4(page, { neuve = false, cap }) {
    await etape(page, 4, 'Ton échelle de performance');
    await expect(page.locator('#conception-echelle-performance')).toBeVisible();
    await bulleDit(page, {
        confirme: "C'est fait : ta pratique s'applique à ton cours.", lieu: MOTS.lieu[4],
        gestes: ['Choisis « Échelle de départ (IDME) » dans le menu et lis ses niveaux'], faites: [],
        consignes: ['Touche « Je garde celle-ci », ou « + Nouvelle échelle » pour créer la tienne'],
        boutons: ['Je garde celle-ci']
    }, 'bulle 4');
    expect((await lire(page)).notes.length, 'bulle 4 : trois explications').toBe(3);
    await contourSur(page, '#menuEchelles');
    await capture(page, DOSSIER, `nf3-04-${cap}`);
    await page.selectOption('#menuEchelles', 'ECHELLE_IDME_DEPART');
    await bulleDit(page, { faites: ['Choisis « Échelle de départ (IDME) » dans le menu et lis ses niveaux'] }, 'bulle 4, l’échelle de départ ouverte');
    await sansContour(page, 'bulle 4, l’échelle ouverte');
    expect(await page.evaluate(() => ParcoursMoteur.etapeCourante()), 'bulle 4 : lire l’échelle ne fait pas avancer').toBe(3);
    if (!neuve) {
        await bulle(page).getByRole('button', { name: 'Je garde celle-ci' }).click();
        return;
    }
    // « + Nouvelle échelle » : la seconde forme, sur la fiche d'une échelle neuve.
    await page.click('#conception-echelle-performance [data-action="creerNouvelleEchelle"]');
    await bulleDit(page, {
        confirme: '', lieu: '', gestes: [], boutons: [], consignes: ['Touche « Créer l\'échelle »'],
        notes: ["Donne un nom à ton échelle, puis nomme chacun de ses niveaux et ce qu'il vaut."]
    }, 'bulle 4, une échelle neuve');
    await contourSur(page, '#btnCreerEchelle');
    await capture(page, DOSSIER, `nf3-04-neuve-${cap}`);
    await page.fill('#nomEchelleTemplate', 'Échelle du banc');
    // Le code et le nom de chaque niveau, un champ à la fois : la fiche se redessine à chaque saisie.
    const vides = page.locator('#conception-echelle-performance input[type="text"]:not(#nomEchelleTemplate):not(#descriptionEchelle):not([id*="couleur"])');
    for (let k = 0; k < 16; k++) {
        const rang = await vides.evaluateAll((cs) => cs.findIndex((c) => c.offsetParent !== null && !c.value));
        if (rang === -1) break;
        await vides.nth(rang).fill('N' + k);
        await vides.nth(rang).dispatchEvent('change');
    }
    await retirerLesAvis(page);
    await page.click('#btnCreerEchelle');
}

// ---------- Bulle 5 : la grille ----------

// Une grille comme on en colle une d'un traitement de texte : son titre, puis un critère par rangée (nom, définition, poids).
export const GRILLE_DU_BANC = {
    nom: 'Grille du banc',
    criteres: [['Clarté', 'Le propos se suit sans effort.', '40 %'], ['Justesse', 'Ce qui est avancé est exact.', '60 %']]
};

/** Bulle 5, voie « Mon matériel » : l'accueil, la grille collée, l'étiquetage, « Créer ma grille ». */
export async function bulle5Materiel(page, { cap }) {
    await etape(page, 5, 'Ta grille');
    await expect(page.locator('#conception-materiel')).toBeVisible();
    await bulleDit(page, {
        confirme: "C'est fait : ton échelle est choisie.", lieu: MOTS.lieu['5m'],
        gestes: ['Ouvre ta grille dans ton traitement de texte, sélectionne-la et copie-la'], faites: [],
        consignes: ['Colle-la dans la zone'], boutons: ['Je la compose ici']
    }, 'bulle 5, Mon matériel');
    expect((await lire(page)).notes.length, 'bulle 5, l’accueil : quatre explications').toBe(4);
    await contourSur(page, '#materiel-zone-collage');
    await capture(page, DOSSIER, `nf3-05-${cap}`);
    // La grille collée (le chemin d'un collage lu : `materielDissection.ouvrir`).
    await page.evaluate((g) => {
        const texte = [g.nom].concat(g.criteres.map((c) => c.join('\t'))).join('\n');
        window.materielDissection.ouvrir(window.materielDissectionLecture.docDepuisPressePapiers({ texte }));
    }, GRILLE_DU_BANC);
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    const G1 = 'Prends « Titre », puis touche le nom de ta grille';
    const G2 = 'Pour chaque critère, prends « Critère » et touche son nom, « Description » et touche sa définition, « Pondération » et touche ce qu\'il pèse';
    await bulleDit(page, {
        confirme: '', lieu: '', boutons: [], gestes: [G1, G2], faites: [],
        notes: ["Ta grille est là, telle qu'elle était écrite. À toi de dire ce qu'est chaque partie."],
        consignes: ['Quand tout est étiqueté, touche « Créer ma grille »']
    }, 'bulle 5, la grille collée');
    await capture(page, DOSSIER, `nf3-05-collee-${cap}`);
    await etiqueter(page, 'titre', [GRILLE_DU_BANC.nom]);
    await bulleDit(page, { faites: [G1] }, 'bulle 5, le titre étiqueté');
    await etiqueter(page, 'critere', GRILLE_DU_BANC.criteres.map((c) => c[0]));
    await etiqueter(page, 'description', GRILLE_DU_BANC.criteres.map((c) => c[1]));
    await etiqueter(page, 'ponderation', GRILLE_DU_BANC.criteres.map((c) => c[2]));
    await bulleDit(page, { faites: [G1, G2] }, 'bulle 5, les critères étiquetés');
    expect(await page.evaluate(() => ParcoursMoteur.etapeCourante()), 'bulle 5 : étiqueter ne crée rien').toBe(4);
    await capture(page, DOSSIER, `nf3-05-etiquetee-${cap}`);
    await retirerLesAvis(page);
    await page.locator('#materiel-dissection [data-action="materielDissection.creer"]').click();
}

/** Bulle 5, voie « Je la compose ici » : l'onglet « Grilles », « + Nouvelle grille », la fiche. */
export async function bulle5Composer(page, { cap }) {
    await etape(page, 5, 'Ta grille');
    await bulleDit(page, { lieu: MOTS.lieu['5m'], boutons: ['Je la compose ici'] }, 'bulle 5, avant « Je la compose ici »');
    await bulle(page).getByRole('button', { name: 'Je la compose ici' }).click();
    await expect(page.locator('#conception-grille-criteres')).toBeVisible();
    await bulleDit(page, {
        confirme: "C'est fait : ton échelle est choisie.", lieu: MOTS.lieu['5g'], boutons: [], gestes: [],
        notes: ['Une grille réunit tes critères (ce que tu regardes dans une production) et ce que pèse chacun.'],
        consignes: ['Touche « + Nouvelle grille »']
    }, 'bulle 5, l’onglet « Grilles »');
    await contourSur(page, '#conception-grille-criteres [data-action="creerNouvelleGrille"]');
    await capture(page, DOSSIER, `nf3-05-grilles-${cap}`);
    await page.click('#conception-grille-criteres [data-action="creerNouvelleGrille"]');
    const G = ['Donne un nom à ta grille', 'Nomme ton premier critère, décris-le en une phrase et donne sa pondération',
        'Touche « + Ajouter un critère » pour chacun des suivants (la pondération totale doit atteindre 100 %)'];
    await bulleDit(page, { confirme: '', lieu: '', gestes: G, faites: [], consignes: ['Touche « Créer la grille »'] }, 'bulle 5, la fiche d’une grille');
    expect((await lire(page)).notes.length, 'bulle 5, la fiche : quatre explications').toBe(4);
    await contourSur(page, '#btnCreerGrille');
    await capture(page, DOSSIER, `nf3-05-fiche-${cap}`);
    const critere = (k, champ) => champ === 'ponderation'
        ? `#listeCriteres input[data-on-change="modifierPonderationCritereTempHandler"][data-critere-index="${k}"]`
        : `#listeCriteres [data-critere-index="${k}"][data-champ="${champ}"]`;
    const ecrire = async (sel, v) => { await page.fill(sel, v); await page.locator(sel).dispatchEvent('change'); };
    await ecrire('#nomGrilleTemplate', GRILLE_DU_BANC.nom);
    await bulleDit(page, { faites: [G[0]] }, 'bulle 5, le nom donné');
    for (const [k, c] of GRILLE_DU_BANC.criteres.entries()) {
        if (k > 0) await page.click('#conception-grille-criteres [data-action="ajouterCritereTemp"]');
        await ecrire(critere(k, 'nom'), c[0]);
        await ecrire(critere(k, 'description'), c[1]);
        await ecrire(critere(k, 'ponderation'), c[2].replace(/\D/g, ''));
        if (k === 0) await bulleDit(page, { faites: [G[0], G[1]] }, 'bulle 5, le premier critère décrit');
    }
    await bulleDit(page, { faites: G }, 'bulle 5, la pondération fait 100 %');
    expect(await page.evaluate(() => ParcoursMoteur.etapeCourante()), 'bulle 5 : rien de créé encore').toBe(4);
    await retirerLesAvis(page);
    await page.click('#btnCreerGrille');
}

// ---------- Bulle 6 : la cartouche ----------

export async function bulle6(page, { cap }) {
    await etape(page, 6, 'Ta cartouche');
    await expect(page.locator('#conception-retroactions')).toBeVisible();
    await bulleDit(page, {
        confirme: "C'est fait : ta grille est créée.", lieu: MOTS.lieu[6], gestes: [], consignes: ['Touche « + Nouvelle cartouche »']
    }, 'bulle 6');
    expect((await lire(page)).notes.length, 'bulle 6 : quatre explications').toBe(4);
    await contourSur(page, '#conception-retroactions [data-action="creerNouvelleCartouche"]');
    await capture(page, DOSSIER, `nf3-06-${cap}`);
    await page.click('#conception-retroactions [data-action="creerNouvelleCartouche"]');
    const G = ["Donne-lui le nom de la production qu'elle servira à évaluer", 'Choisis ta grille et ton échelle (les cases apparaissent)',
        "Écris les commentaires d'un premier critère, un par niveau"];
    await bulleDit(page, { confirme: '', lieu: '', gestes: G, faites: [], consignes: ['Touche « Créer la cartouche »'] }, 'bulle 6, la fiche');
    const vu = await lire(page);
    expect(vu.notes[vu.notes.length - 1], 'bulle 6 : la dernière explication suit la consigne').toBe('Les autres cases peuvent attendre : tu les rempliras à mesure.');
    await contourSur(page, '#btnCreerCartouche');
    // A6 : pendant un parcours, l'avis jaune d'une fiche neuve ne paraît pas.
    await page.fill('#nomCartouche', 'Journal de lecture 1');
    await page.locator('#nomCartouche').dispatchEvent('change');
    await bulleDit(page, { faites: [G[0]] }, 'bulle 6, le nom donné');
    const grille = (await ctx(page)).grilleId;
    await page.selectOption('#selectGrilleCartouche', grille);
    await page.selectOption('#selectEchelleCartouche', { index: 1 });
    await bulleDit(page, { faites: [G[0], G[1]] }, 'bulle 6, la grille et l’échelle choisies');
    await expect(page.locator('#cartoucheZonePrincipale textarea[id^="comm_"]').first()).toBeVisible();
    // Les commentaires d'un premier critère, un par niveau.
    const cases = await page.evaluate(() => {
        const toutes = [...document.querySelectorAll('#cartoucheZonePrincipale textarea[id^="comm_"]')].map((t) => t.id);
        const critere = toutes[0].slice(0, toutes[0].lastIndexOf('_'));
        return toutes.filter((id) => id.slice(0, id.lastIndexOf('_')) === critere);
    });
    for (const [k, id] of cases.entries()) {
        await page.fill('#' + id, 'Commentaire du niveau ' + (k + 1) + '.');
        await page.locator('#' + id).dispatchEvent('change');
    }
    await bulleDit(page, { faites: G }, 'bulle 6, un premier critère commenté');
    expect(await page.locator('.notifications-pile').getByText('Cette cartouche n\'est pas encore créée').count(), 'A6 : pas d’avis jaune pendant le parcours').toBe(0);
    expect(await page.evaluate(() => ParcoursMoteur.etapeCourante()), 'bulle 6 : la bulle reste sur la fiche jusqu’à « Créer la cartouche »').toBe(5);
    await expect(page.locator('#conception-retroactions')).toBeVisible();
    await capture(page, DOSSIER, `nf3-06-fiche-${cap}`);
    await retirerLesAvis(page);
    await page.click('#btnCreerCartouche');
}

// ---------- Bulle 7 : la production ----------

export async function bulle7(page, { cap, titre = 'Journal de lecture 1' }) {
    await etape(page, 7, 'Ta production');
    await expect(page.locator('#conception-productions')).toBeVisible();
    await bulleDit(page, {
        confirme: "C'est fait : ta cartouche est créée.", lieu: MOTS.lieu[7], gestes: [], consignes: ['Touche « + Nouvelle production »']
    }, 'bulle 7');
    expect((await lire(page)).notes.length, 'bulle 7 : deux explications').toBe(2);
    await contourSur(page, '#conception-productions [data-action="creerNouvelleProduction"]');
    await capture(page, DOSSIER, `nf3-07-${cap}`);
    await page.click('#conception-productions [data-action="creerNouvelleProduction"]');
    const G = ["Donne-lui un nom qui dit ce qu'elle fait faire", 'Choisis son type',
        'Plus bas, rattache ce que tu viens de préparer : ta grille, ton échelle et ta cartouche (déplace la bulle si elle les cache)'];
    await bulleDit(page, { confirme: '', lieu: '', gestes: G, faites: [], consignes: ['Touche « Créer la production »'] }, 'bulle 7, la fiche');
    await contourSur(page, '#btnCreerProduction');
    await page.fill('#productionTitre', titre);
    await page.locator('#productionTitre').dispatchEvent('change');
    await page.selectOption('#productionType', 'travail');
    await bulleDit(page, { faites: [G[0], G[1]] }, 'bulle 7, le nom et le type donnés');
    // Les trois menus restent visibles à côté de la bulle : le premier qui reste à choisir vient à l'écran, et la
    // bulle n'en couvre aucun (vécu le 20 nov. : ils étaient dessous).
    const menus = ['#productionGrille', '#productionEchelle', '#productionCartouche'];
    await expect.poll(() => page.evaluate((sels) => sels.map((s) => {
        const r = document.querySelector(s).getBoundingClientRect();
        return r.top >= 0 && r.bottom <= innerHeight ? 'vu' : s + ' de ' + Math.round(r.top) + ' à ' + Math.round(r.bottom) + ' pour ' + innerHeight;
    }).filter((x) => x !== 'vu').join(' ; '), menus), { message: 'bulle 7 : les trois menus sont à l’écran' }).toBe('');
    await deuxSondes(page);
    for (const m of menus) await bulleNeCouvrePas(page, m, 'bulle 7');
    await capture(page, DOSSIER, `nf3-07-menus-${cap}`);
    await page.fill('#productionActivite', 'Lire un roman et en rendre compte');
    await page.fill('#productionPonderation', '20');
    const c = await ctx(page);
    await page.selectOption('#productionGrille', c.grilleId);
    if (await page.locator('#productionEchelle option:not([value=""])').count()) await page.selectOption('#productionEchelle', { index: 1 });
    await expect(page.locator(`#productionCartouche option[value="${c.cartoucheId}"]`)).toHaveCount(1);
    await page.selectOption('#productionCartouche', c.cartoucheId);
    await bulleDit(page, { faites: G }, 'bulle 7, la grille, l’échelle et la cartouche rattachées');
    await capture(page, DOSSIER, `nf3-07-fiche-${cap}`);
    await retirerLesAvis(page);
    await page.click('#btnCreerProduction');
}

// ---------- Bulle 8 : les consignes ----------

export async function bulle8(page, { cap }) {
    await etape(page, 8, 'Tes consignes');
    const G = ["Écris l'objectif et la tâche", "Donne la date d'échéance"];
    await bulleDit(page, {
        confirme: "C'est fait : ta production est créée.", lieu: '', gestes: G, faites: [],
        consignes: ['Coche « Consignes transmises »(la production entre alors au calendrier du groupe)']
    }, 'bulle 8').catch(async () => {
        // La parenthèse sort du gras dans son propre élément : le texte à plat peut garder l'espace.
        await bulleDit(page, { confirme: "C'est fait : ta production est créée.", gestes: G,
            consignes: ['Coche « Consignes transmises » (la production entre alors au calendrier du groupe)'] }, 'bulle 8');
    });
    const vu = await lire(page);
    expect(vu.notes[0]).toBe("Tu es plus bas dans la fiche de la production, dans la section réservée à la description des consignes. C'est ici que tu décris les tâches à travers lesquelles tes étudiant·es vont faire leur apprentissage.");
    expect(vu.notes.length, 'bulle 8 : la phrase du lieu et quatre explications').toBe(5);
    await expect(page.locator('#productionObjectif')).toBeVisible();
    // C4 : le halo de la case prend la largeur de la case, pas celle de la page.
    await expect.poll(() => page.evaluate(() => {
        const c = document.getElementById('parcours-contour');
        return c && !c.hidden ? Math.round(c.getBoundingClientRect().width) : 0;
    }), { message: 'bulle 8 : le halo est posé' }).toBeGreaterThan(0);
    const largeurs = await page.evaluate(() => ({ halo: document.getElementById('parcours-contour').getBoundingClientRect().width, page: document.documentElement.clientWidth }));
    expect(largeurs.halo, 'bulle 8 : le halo de « Consignes transmises » n’a pas la largeur de la page').toBeLessThan(largeurs.page / 2);
    await capture(page, DOSSIER, `nf3-08-${cap}`);
    await page.fill('#productionObjectif', 'Rendre compte d’une lecture.');
    await page.locator('#productionObjectif').dispatchEvent('change');
    await page.fill('#productionTache', 'Lire le roman et en écrire le journal.');
    await page.locator('#productionTache').dispatchEvent('change');
    await bulleDit(page, { faites: [G[0]] }, 'bulle 8, l’objectif et la tâche écrits');
    await page.fill('#productionDateEcheance', '2026-11-17');
    await page.locator('#productionDateEcheance').dispatchEvent('change');
    await bulleDit(page, { faites: G }, 'bulle 8, la date donnée');
    expect(await page.evaluate(() => ParcoursMoteur.etapeCourante()), 'bulle 8 : la date ne suffit pas').toBe(7);
    await retirerLesAvis(page);
    await page.check('#productionEcheanceAssignee');
}

// ---------- Bulle 9 : évaluer ----------

export async function bulle9(page, { cap }) {
    await etape(page, 9, 'Évaluer');
    await expect(page.locator('#evaluations-liste')).toBeVisible();
    await bulleDit(page, {
        confirme: "C'est fait : les consignes sont transmises.", lieu: MOTS.lieu[9], gestes: [],
        consignes: ["Sur la ligne d'un·e étudiant·e, touche « Actions › Évaluer »"]
    }, 'bulle 9, la Liste');
    expect((await lire(page)).notes.length, 'bulle 9, la Liste : une explication').toBe(1);
    // LA MESURE DEMANDÉE (consigne, D, bulle 9) : la Liste affiche d'elle-même la production qui vient d'être créée.
    const pid = (await ctx(page)).productionId;
    const evaluer = (await valeursActions(page, 'evaluer|')).filter((v) => v.endsWith('|' + pid));
    expect(evaluer.length, 'bulle 9 : la Liste montre d’elle-même la production créée, une ligne par étudiant·e').toBeGreaterThan(0);
    await capture(page, DOSSIER, `nf3-09-${cap}`);
    await actionDeLaListe(page, evaluer[0]);
    await expect(page.locator('#evaluations-contenu-evaluation')).toBeVisible();
    await bulleDit(page, {
        confirme: '', lieu: '', gestes: ['Vérifie que ce sont les bonnes, au moins à ta première évaluation'], faites: [],
        consignes: ['Dans le panneau « Critères », choisis le niveau ou les points de chaque critère']
    }, 'bulle 9, l’évaluation ouverte');
    expect((await lire(page)).notes.length, 'bulle 9, les critères : trois explications').toBe(3);
    await capture(page, DOSSIER, `nf3-09-criteres-${cap}`);
    // L'écran finit de se charger : la grille, l'échelle et la cartouche de la production sont dans « Paramètres »
    // (« elles viennent de la production »), et les critères sont dessinés.
    const c = await ctx(page);
    await expect(page.locator('#selectGrille1')).toHaveValue(c.grilleId, { timeout: 10000 });
    await expect(page.locator('#selectCartoucheEval')).toHaveValue(new RegExp(c.cartoucheId + '$'));
    await expect(page.locator('#listeCriteresGrille1 select[id^="eval_"], #listeCriteresGrille1 input[id^="eval_pts_"]').first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    const champs = await page.evaluate(() => [...document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"], #listeCriteresGrille1 input[id^="eval_pts_"]')].map((c) => [c.id, c.tagName]));
    expect(champs.length, 'bulle 9 : les critères de la grille sont là').toBeGreaterThan(0);
    // Le halo va au premier critère qui reste à évaluer, puis au suivant.
    await contourSur(page, '#' + champs[0][0]);
    const attribuer = async (id, balise) => {
        if (balise === 'SELECT') await page.selectOption('#' + id, { index: 2 });
        else { await page.fill('#' + id, '3'); await page.locator('#' + id).dispatchEvent('change'); }
    };
    await attribuer(champs[0][0], champs[0][1]);
    if (champs.length > 1) await contourSur(page, '#' + champs[1][0]);
    // L'écran se redessine encore un instant après son ouverture (il relit la production) : le banc repasse sur un
    // critère que ce dessin aurait vidé, comme une personne le referait.
    for (let tour = 0; tour < 4; tour++) {
        for (const [id, balise] of champs) {
            if (!(await page.inputValue('#' + id))) await attribuer(id, balise);
        }
        await page.waitForTimeout(400);
        if ((await page.evaluate((ids) => ids.every((id) => document.getElementById(id).value), champs.map((c) => c[0])))) break;
    }
    await bulleDit(page, {
        gestes: ['Relis la rétroaction comme ton étudiant·e la lira'], faites: [],
        consignes: ['Touche le cadenas « Verrouiller », en haut de « Paramètres »']
    }, 'bulle 9, chaque critère évalué');
    expect((await lire(page)).notes.length, 'bulle 9, le verrou : trois explications').toBe(3);
    await contourSur(page, '#btnVerrouillerEvaluation');
    await capture(page, DOSSIER, `nf3-09-verrou-${cap}`);
    await retirerLesAvis(page);
    await page.click('#btnVerrouillerEvaluation');
}

// ---------- Bulle 10 : le point qui s'allume, et la fin ----------

export async function bulle10(page, { cap }) {
    await etape(page, 10, "Le point qui s'allume");
    await expect(page.locator('#section-suivi')).toBeVisible();
    await bulleDit(page, {
        confirme: "C'est fait : l'évaluation est verrouillée.", lieu: MOTS.lieu[10], atteint: MOTS.atteint, suite: MOTS.suite, revue: MOTS.revue,
        gestes: [], consignes: [], boutons: ['Voir le parcours 4', 'Terminer'], principaux: []
    }, 'bulle 10');
    expect((await lire(page)).notes.length, 'bulle 10 : deux explications').toBe(2);
    await capture(page, DOSSIER, `nf3-10-${cap}`);
}

/**
 * Le parcours entier, de « Nous faisons » à sa dixième bulle, dans les voies données. Part d'un espace vide : le
 * deuxième parcours est joué d'abord. `voiePratique` : 'modele' ou 'decrire' ; `voieGrille` : 'materiel' ou 'composer'.
 */
export async function leNousFaisonsEntier(page, { largeur = 1180, hauteur = 820, voiePratique = 'modele', voieGrille = 'materiel', echelleNeuve = false, cap = 'nf3' } = {}) {
    test.setTimeout(300000);
    await ouvrirEspaceVide(page, largeur, { hauteur });
    await mettreLaClasseEnPlace(page);
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
    await expect(page.locator('#panneau-assistance')).toHaveCount(0);
    await bulle1(page, { voie: voiePratique, cap });
    if (voiePratique === 'modele') await bulle2Modele(page, { cap });
    else await bulle2Decrire(page, { cap });
    await bulle3(page, { cap });
    await bulle4(page, { neuve: echelleNeuve, cap });
    if (voieGrille === 'materiel') await bulle5Materiel(page, { cap });
    else await bulle5Composer(page, { cap });
    await bulle6(page, { cap });
    await bulle7(page, { cap });
    await bulle8(page, { cap });
    await bulle9(page, { cap });
    await bulle10(page, { cap });
}
