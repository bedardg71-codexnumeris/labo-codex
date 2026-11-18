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
// LOT « LES PARCOURS EN DEUX TEMPS », PREMIÈRE PARTIE (12 NOVEMBRE 2026) — REMIS À JOUR LE 15 NOVEMBRE 2026
// =======================================================================
// Mandat du 12 nov. 2026, 8 h 20, puis consigne du 15 nov. (`plans de travail/CONSIGNE-2026-11-15-deux-temps-remise-a-jour.md`,
// décisions de Grégoire des 14 et 15 nov.) : un parcours se fait d'abord dans la démo, avec le matériel de la démo (la
// Modélisation : « Remplir avec l'exemple », puis le bouton de la page), puis sur ses vraies données (la Pratique
// guidée). Ce banc juge, en faisant les gestes eux-mêmes :
//   · le panneau : le texte en quatre temps numérotés ; deux états par parcours, un par temps, chacun son bouton ;
//     « Remettre la démo à neuf » ;
//   · la modélisation de « Mettre ta classe en place », de bout en bout dans la démo, en trois temps ; l'horaire du
//     mardi et du vendredi ; les présences de l'exemple ; les trois points à l'écart ; la fin à trois boutons ;
//   · LE CONFINEMENT : un trimestre réel peuplé au départ ; après « Remplir », puis « Créer », et après la sortie,
//     toutes les clés hors de la démo sont identiques ; ce qui a été créé reste dans la démo ;
//   · « REFAIRE » : celui d'une Modélisation remet la démo à neuf (après confirmation), montre ses contours et écrit
//     dans la démo ; celui d'une Pratique guidée reste en visite et n'écrit rien ;
//   · « Remplir avec l'exemple » ne fait rien hors de la démo ;
//   · la remise à neuf rend la démo du pack et laisse les autres clés identiques.
// L'apparence se juge sur capture : CAPTURES_PARCOURS=<dossier> npx playwright test deux-temps-modelisation
//
// BREAK-TESTS DU 15 NOV. 2026 (chacun : le code cassé, le banc rouge, le code rétabli, le banc vert) :
//   · `if (!enDemo()) return false;` retiré de `remplir` (js/parcours-classe.js) → ROUGE, « Remplir, hors de la démo ».
//   · la remise à neuf retirée de `refaireModele` (js/assistance.js : `if (!(await remettreEtDire())) return;`) →
//     ROUGE, « Refaire » d'une Modélisation (« 6 sur 8 » au lieu de « 1 sur 8 » : le modèle reprenait sur ce qui
//     était déjà fait, sans rien rejouer).
//   · `visite: refaire` remplacé par `visite: false` dans `lancer` (js/parcours-classe.js) → ROUGE, « Refaire » d'une
//     Pratique guidée (« étape 1 : en visite », attendu vrai, reçu faux).

import {
    indexHtml, HORLOGE, CAPTURES, QUATRE_TEMPS, sansInsecable, TOTEMS_DU_PACK, capture, ouvrirEspaceVide, ouvrirPanneau, boutonModele, boutonPratique, bulle, carte, enDemo, attendreEtape, contourSur, gesteDesigne, releve, DE_LA_DEMO, DE_L_APPAREIL, ecarts,
    horsDeLaDemo, ouvrirBloc, peuplerUnTrimestreReel, materiel, optionDont, TOTAL, faireLaModelisation, lireBulle, attendreRemplir, remplirPuisVoir, REMPLIR
} from './harness/deux-temps-de-banc.js';

const PHRASE_VISITE = 'Tu revois ce parcours : rien n\'est à refaire. Lis, puis touche « Continuer ».';

// ---------- Les bancs ----------

test('le panneau : le texte en quatre temps numérotés, deux états par parcours, la carte sans modélisation, « Remettre la démo à neuf »', async ({ page }) => {
    await ouvrirEspaceVide(page);
    expect(await page.evaluate(() => localStorage.getItem('laboCodex.assistance'))).toBeNull();
    await ouvrirPanneau(page);
    const p = page.locator('#panneau-assistance');

    // (a) Le texte validé, mot pour mot : un titre, puis quatre lignes numérotées, le début de chacune en gras.
    const lignes = await p.locator('.assistance-intro-titre, .assistance-intro-temps li').allTextContents();
    expect(lignes.map(sansInsecable)).toEqual(QUATRE_TEMPS);
    expect((await p.locator('.assistance-intro strong').allTextContents()).map(sansInsecable)).toEqual([
        "Apprendre l'application, en quatre temps.", "1. J'explore", '2. Je regarde', '3. Nous faisons', '4. Je fais,']);

    // (b) Plus de choix unique : rien entre « Tes parcours » et la liste que « Remettre la démo à neuf », toujours là.
    await expect(p.locator('[role="radio"], #assistance-materiel')).toHaveCount(0);
    await expect(p.locator('#assistance-demo-neuf')).toBeVisible();
    await expect(p.locator('#assistance-demo-neuf')).toHaveText('Remettre la démo à neuf');
    expect(await page.evaluate(() => {
        const ordre = ['assistance-intitule', 'assistance-demo-neuf', 'assistance-parcours-liste'].map((id) => document.getElementById(id));
        return ordre.every((e, i) => i === 0 || (ordre[i - 1].compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING));
    })).toBe(true);

    // (c) Un parcours qui a son modèle porte DEUX états, un par temps, chacun son bouton ; les autres, un seul.
    const avec = await page.evaluate(() => Assistance.parcours().filter((d) => typeof d.lancerModele === 'function').map((d) => d.id));
    // 17 nov. 2026 : « Recevoir » a son modèle (js/parcours-recevoir-modele.js).
    expect(avec).toEqual(['classe', 'evaluer', 'recevoir']);
    for (const id of avec) {
        const temps = carte(page, id).locator('.assistance-temps');
        await expect(temps).toHaveCount(2);
        // 16 nov. 2026 (Grégoire) : « Je regarde » et « Nous faisons » ; sous chacun, en petit, le nom du temps ; puis l'état.
        await expect(temps.locator('.assistance-temps-mots')).toHaveText(['Modélisation', 'Pratique guidée']);
        await expect(carte(page, id).locator('.assistance-temps-sous')).toHaveCount(0);
        await expect(temps.nth(0).locator('.assistance-modele-etat')).toHaveText('À faire');
        await expect(temps.nth(1).locator('.assistance-parcours-etat')).toHaveText('À faire');
        await expect(boutonModele(page, id)).toHaveText('Je regarde');
        await expect(boutonPratique(page, id)).toHaveText('Nous faisons');
        for (const b of [boutonModele(page, id), boutonPratique(page, id)]) expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(44);
        // Les deux boutons côte à côte ; sous chacun, le nom du temps, plus petit que le bouton ; sous le nom, l'état.
        expect(await carte(page, id).evaluate((c) => {
            const px = (e) => parseFloat(getComputedStyle(e).fontSize);
            const r = (e) => e.getBoundingClientRect();
            const [a, b] = [...c.querySelectorAll('.assistance-temps')];
            const coteACote = Math.abs(r(a.querySelector('button')).top - r(b.querySelector('button')).top) < 1
                && r(a.querySelector('button')).right <= r(b.querySelector('button')).left;
            const empiles = [a, b].every((t) => {
                const bouton = t.querySelector('button'), nom = t.querySelector('.assistance-temps-mots');
                const etat = t.querySelector('.assistance-modele-etat, .assistance-parcours-etat');
                return r(nom).top >= r(bouton).bottom - 1 && r(etat).top >= r(nom).bottom - 1 && px(nom) < px(bouton);
            });
            return { coteACote, empiles };
        })).toEqual({ coteACote: true, empiles: true });
    }
    const sans = await page.evaluate(() => Assistance.parcours().filter((d) => typeof d.lancerModele !== 'function').map((d) => d.id));
    expect(sans.length).toBeGreaterThan(0);
    for (const id of sans) {
        await expect(carte(page, id).locator('.assistance-temps, .assistance-modele-bouton')).toHaveCount(0);
        await expect(carte(page, id).locator('.assistance-parcours-bouton')).toHaveCount(1);
        await expect(carte(page, id).locator('.assistance-parcours-bouton')).not.toHaveAttribute('aria-disabled', 'true');
        await expect(carte(page, id).locator('.assistance-parcours-etat')).toHaveCount(1);
    }
    await capture(page, 'panneau-deux-etats');

    // (d) Les deux états sont indépendants : celui de la Modélisation vit sur l'appareil, hors des données.
    await page.evaluate(() => { Assistance.definirEtatModele('classe', 'fait', 0); Assistance.definirEtat('evaluer', 'en-cours', 2); });
    await page.evaluate(() => Assistance.fermerPanneau());
    await ouvrirPanneau(page);
    await expect(carte(page, 'classe').locator('.assistance-modele-etat')).toHaveText('Fait');
    // Le bouton garde son nom quel que soit l'état : c'est l'état, dessous, qui change.
    await expect(boutonModele(page, 'classe')).toHaveText('Je regarde');
    await expect(carte(page, 'classe').locator('.assistance-parcours-etat')).toHaveText('À faire');
    await expect(boutonPratique(page, 'classe')).toHaveText('Nous faisons');
    await expect(carte(page, 'evaluer').locator('.assistance-modele-etat')).toHaveText('À faire');
    await expect(carte(page, 'evaluer').locator('.assistance-parcours-etat')).toHaveText('Étape 3 sur 9');
    await expect(boutonPratique(page, 'evaluer')).toHaveText('Nous faisons');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('laboCodex.assistance')).modeles.classe.etat)).toBe('fait');
    expect(await page.evaluate(async () => (await db.keys()).filter((k) => /assistance/i.test(k) && k !== 'laboCodex.assistance'))).toEqual([]);
    await capture(page, 'panneau-deux-etats-fait');
});

test('« Remplir avec l\'exemple », hors de la démo : rien n\'est écrit dans un champ', async ({ page }) => {
    await ouvrirEspaceVide(page);
    await ouvrirBloc(page, 'accordeon-cours', 'nouveauCoursV2');
    expect(await enDemo(page)).toBe(false);
    // Le geste que ferait le bouton de la bulle, appelé là où il ne doit rien faire.
    const fait = await page.evaluate(() => ParcoursClasse.remplir(() => ParcoursClasse.poser(document.getElementById('v2-codeCours'), '601-999-DM')));
    expect(fait, '« Remplir » se refuse hors de la démo').toBe(false);
    await expect(page.locator('#v2-codeCours')).toHaveValue('');
    // Dans la démo, le même geste écrit.
    await page.evaluate(() => activerModeDemo());
    await ouvrirBloc(page, 'accordeon-cours', 'nouveauCoursV2');
    expect(await page.evaluate(() => ParcoursClasse.remplir(() => ParcoursClasse.poser(document.getElementById('v2-codeCours'), '601-999-DM')))).toBe(true);
    await expect(page.locator('#v2-codeCours')).toHaveValue('601-999-DM');
    await page.evaluate(() => desactiverModeDemo());
});

test('la modélisation de « Mettre ta classe en place », de bout en bout dans la démo, en trois temps ; le confinement, un trimestre réel peuplé au départ ; la fin à trois boutons ; « Refaire » remet la démo à neuf et rejoue les gestes', async ({ page }) => {
    test.setTimeout(300000);
    page.setDefaultTimeout(20000);
    await ouvrirEspaceVide(page);
    await peuplerUnTrimestreReel(page);
    const avant = await releve(page);
    expect(Object.keys(avant).filter((k) => /^db:a2026_/.test(k)).length, 'un trimestre réel peuplé').toBeGreaterThan(4);
    const duTrimestreReel = (k) => /^db:a2026_/.test(k);

    // « Commencer », à la ligne « Modélisation » : la démo s'ouvre, la modélisation part.
    await ouvrirPanneau(page);
    await boutonModele(page, 'classe').click();
    // « Remplir avec l'exemple » n'écrit que dans la démo : aucune clé du trimestre réel ne bouge après « Remplir »,
    // ni après le bouton de la page (relevé aux étapes 1 et 7, puis à la sortie).
    const aucuneCleReelle = async (ou) => expect(ecarts(avant, await releve(page), duTrimestreReel), ou + ' : aucune clé du trimestre réel touchée').toEqual([]);
    await faireLaModelisation(page, { capturer: '1180', surRemplir: aucuneCleReelle });
    await aucuneCleReelle('après « Verrouiller la saisie »');

    // La liste de l'exemple : dix totems (13 nov. 2026), aucun du pack, la parité (cinq noms accordés au féminin).
    const m = await materiel(page);
    expect(m.etudiants).toHaveLength(10);
    expect(m.etudiants.flatMap((e) => [e[1], e[2]]).filter((mot) => TOTEMS_DU_PACK.includes(mot))).toEqual([]);
    expect(m.etudiants.filter((e) => /e$/.test(e[1])).length).toBe(5);

    // Pendant la démo : ce qui est créé vit sous `demo_*`, sauf le cours (clé globale), marqué.
    const cree = await page.evaluate(() => ({
        cours: (db.getSync('cours', []) || []).filter((c) => c.creeEnDemonstration).map((c) => [c.codeCours, c.isDemo]),
        etudiants: (db.getSync('demo_groupeEtudiants', []) || []).length,
        horaires: (db.getSync('demo_horaires', []) || []).length,
        groupes: (db.getSync('demo_groupesCours', []) || []).length,
        seances: ((db.getSync('demo_horaires', []) || []).find((h) => h.id !== 'HOR_DEMO').seances || []).map((se) => se.jour),
        etat: Assistance.etatModeleDe('classe'),
        reel: Assistance.etatDe('classe')
    }));
    expect(cree).toEqual({ cours: [[m.cours.code, true]], etudiants: 20, horaires: 2, groupes: 2, seances: ['Mardi', 'Vendredi'],
        etat: { etat: 'en-cours', etape: 7 }, reel: { etat: 'a-faire', etape: 0 } });
    // L'échéance du modèle d'« Évaluer » (le mardi 9 septembre 2025, semaine 4 de la démo) est une séance de ce groupe.
    expect(await page.evaluate(() => {
        const s = obtenirSeancesCompletesDuGroupe(db.getSync('groupeCoursActif', null).id);
        return Array.isArray(s[ParcoursEvaluer.materiel.production.echeance]) && s[ParcoursEvaluer.materiel.production.echeance].length > 0;
    }), 'le 2025-09-09 est une séance du deuxième groupe').toBe(true);

    // LA FIN : trois boutons de même poids, aucun mis en avant ; la consigne les nomme ; au-dessus, « Pour revoir… ».
    const boutons = bulle(page).locator('.parcours-bulle-boutons button');
    await expect(boutons).toHaveText(['Le refaire avec ma classe', 'Voir le parcours suivant', 'Terminer']);
    for (const k of [0, 1, 2]) await expect(boutons.nth(k)).toHaveClass(/btn-secondaire/);
    const fin = await lireBulle(page);
    expect(fin.principal).toEqual([]);
    // 16 nov. 2026 : la dernière bulle rappelle l'objectif ; elle n'a plus de ligne de consigne, ses boutons parlent.
    expect(fin.consignes).toEqual([]);
    await expect(bulle(page)).toContainText('Objectif atteint : tu es en mesure');
    await expect(bulle(page).locator('.parcours-bulle-note').last()).toHaveText(/Pour revoir une étape, touche «\s8 sur 8\s»\./);
    const hauteurs = await boutons.evaluateAll((bs) => bs.map((b) => Math.round(b.getBoundingClientRect().height)));
    hauteurs.forEach((h) => expect(h).toBeGreaterThanOrEqual(44));
    await capture(page, 'modele-fin-trois-boutons');

    // « Voir le parcours suivant » : le modèle d'« Évaluer », dans la démo.
    await boutons.nth(1).click();
    // Dix étapes depuis le 18 nov. 2026 (le « Je regarde » d'« Évaluer », refait dans l'ordre du 15 nov.).
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('1 sur 10', { timeout: 10000 });
    expect(await enDemo(page)).toBe(true);
    expect(await page.evaluate(() => Assistance.etatModeleDe('classe').etat)).toBe('fait');
    expect(await page.evaluate(() => Assistance.etatModeleDe('evaluer'))).toEqual({ etat: 'en-cours', etape: 0 });
    // « Plus tard » : le modèle attend à sa première étape.
    await bulle(page).getByRole('button', { name: 'Plus tard' }).click();
    await expect(bulle(page)).toHaveCount(0);

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
    const pleine = Object.fromEntries(Object.entries(apres).filter(([k]) => DE_LA_DEMO.test(k)));

    // « REFAIRE » UNE MODÉLISATION (Grégoire, 14 nov. 2026, 10 h 56 : elle se refait une seconde fois, gestes compris).
    await ouvrirPanneau(page);
    await expect(carte(page, 'classe').locator('.assistance-modele-etat')).toHaveText('Fait');
    await expect(boutonModele(page, 'classe')).toHaveText('Je regarde');
    // La confirmation dit ce qui arrive ; « Annuler » ne change rien : ni la démo, ni l'état, ni un parcours lancé.
    await boutonModele(page, 'classe').click();
    const dialogue = page.getByRole('dialog').filter({ hasText: 'Refaire ce modèle' }).last();
    await expect(dialogue).toContainText('la démo est remise à neuf');
    await expect(dialogue).toContainText('Tes données, elles, ne bougent pas.');
    await capture(page, 'refaire-modele-confirmation');
    await dialogue.getByRole('button', { name: 'Annuler' }).click();
    await expect(bulle(page)).toHaveCount(0);
    expect(ecarts(apres, await releve(page), () => true), '« Annuler » : rien ne change').toEqual([]);
    // Confirmée : la démo du pack, puis la première bulle, « Remplir avec l'exemple » compris.
    await boutonModele(page, 'classe').click();
    await page.getByRole('dialog').filter({ hasText: 'Refaire ce modèle' }).last().getByRole('button', { name: 'Remettre à neuf et refaire' }).click();
    await attendreEtape(page, 1, TOTAL, 'Un cours');
    expect(await enDemo(page)).toBe(true);
    expect(await page.evaluate(() => window.ParcoursMoteur.enVisite()), 'un modèle refait ne se joue pas en visite').toBe(false);
    expect(await page.evaluate(() => ({
        etudiants: (db.getSync('demo_groupeEtudiants', []) || []).length, groupes: (db.getSync('demo_groupesCours', []) || []).length,
        cours: (db.getSync('cours', []) || []).filter((c) => c.creeEnDemonstration).length, modeles: Assistance.etatModeleDe('evaluer').etat
    })), 'la démo est revenue à son départ, et les modèles qui en dépendent sont à refaire').toEqual({ etudiants: 10, groupes: 1, cours: 0, modeles: 'a-faire' });
    // Il montre ses contours et écrit dans la démo : « Remplir », la pulsation sur « Créer le cours », puis le cours créé.
    await attendreRemplir(page, 'Refaire, étape 1');
    await remplirPuisVoir(page, { consigne: 'Touche « Créer le cours »', bouton: '#v2-btnCreerCours', contexte: 'Refaire, étape 1' });
    await page.click('#v2-btnCreerCours');
    await attendreEtape(page, 2, TOTAL, "Une liste d'étudiant·es");
    expect(await page.evaluate(() => (db.getSync('cours', []) || []).filter((c) => c.creeEnDemonstration).map((c) => c.codeCours))).toEqual([m.cours.code]);
    await aucuneCleReelle('Refaire d’une Modélisation');
    await bulle(page).getByRole('button', { name: 'Plus tard' }).click();
    await page.evaluate(() => desactiverModeDemo());
    await expect.poll(() => enDemo(page)).toBe(false);
    const refait = await releve(page);
    expect(ecarts(avant, refait, horsDeLaDemo), 'après « Refaire » et la sortie : aucune clé hors de la démo ne change').toEqual([]);
    expect(ecarts(pleine, refait, (k) => DE_LA_DEMO.test(k)).length, 'la démo n’est plus celle d’avant « Refaire »').toBeGreaterThan(0);
});

test('« Refaire » une Pratique guidée : le parcours fait se rejoue en visite, sans pulsation sur un contrôle qui écrit, et n\'écrit rien', async ({ page }) => {
    test.setTimeout(240000);
    page.setDefaultTimeout(20000);
    await ouvrirEspaceVide(page);
    await peuplerUnTrimestreReel(page);
    await page.evaluate(() => Assistance.definirEtat('classe', 'fait', 0));
    // Les données d'enseignement du trimestre réel, et ce qui est verrouillé : ce que la visite ne doit pas toucher.
    const donnees = (k) => /^db:(cours|enseignants|a2026_(groupeEtudiants|horaires|groupesCours|presences|datesVerrouillees.*|verrou.*))$/.test(k);
    const avant = await releve(page);
    expect(Object.keys(avant).filter(donnees).length).toBeGreaterThanOrEqual(5);

    await ouvrirPanneau(page);
    await expect(carte(page, 'classe').locator('.assistance-parcours-etat')).toHaveText('Fait');
    await expect(boutonPratique(page, 'classe')).toHaveText('Nous faisons');
    // La Modélisation, elle, reste à faire : les deux états ne se confondent pas.
    await expect(carte(page, 'classe').locator('.assistance-modele-etat')).toHaveText('À faire');
    await boutonPratique(page, 'classe').click();

    for (let n = 1; n <= 7; n++) {
        await attendreEtape(page, n, 8);
        const ou = 'étape ' + n;
        expect(await enDemo(page), ou + ' : sur les vraies données').toBe(false);
        expect(await page.evaluate(() => window.ParcoursMoteur.enVisite()), ou + ' : en visite').toBe(true);
        const vu = await lireBulle(page);
        expect(vu.contour, ou + ' : aucune pulsation').toBe(false);
        expect(vu.consignes, ou + ' : la phrase de la visite').toEqual([PHRASE_VISITE]);
        expect(vu.boutons, ou).toEqual(['Continuer']);
        expect(vu.boutons, ou + ' : la bulle ne remplit rien en Pratique guidée').not.toContain(REMPLIR);
        await bulle(page).getByRole('button', { name: 'Continuer' }).click();
    }
    await attendreEtape(page, 8, 8, "Ta classe d'un coup d'œil");
    expect(await page.evaluate(() => Assistance.etatDe('classe')), 'le parcours reste « fait »').toEqual({ etat: 'fait', etape: 0 });
    await page.evaluate(() => ParcoursMoteur.fermer());
    expect(ecarts(avant, await releve(page), donnees), 'la visite n’écrit rien dans les données d’enseignement').toEqual([]);
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
    await ouvrirPanneau(page);
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
    await ouvrirPanneau(page);
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
