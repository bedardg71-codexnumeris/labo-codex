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
// LOT « LES PARCOURS EN DEUX TEMPS », PREMIÈRE PARTIE (12 NOVEMBRE 2026)
// =======================================================================
// Mandat du 12 nov. 2026, 8 h 20 (décisions de Grégoire des 11 et 12 nov.) : un parcours se fait d'abord dans la
// démo, avec le matériel fourni (la modélisation : la personne fait elle-même chaque geste), puis sur ses vraies
// données. Ce banc juge, en faisant les gestes eux-mêmes :
//   · le panneau : le texte en quatre temps, le choix du matériel (qui se souvient, sur l'appareil), la carte d'un
//     parcours sans modélisation, « Remettre la démo à neuf » ;
//   · la modélisation de « Mettre ta classe en place », de bout en bout dans la démo, un geste à la fois, la
//     pulsation et une flèche sur chaque geste ;
//   · LE CONFINEMENT : un trimestre réel peuplé au départ, toutes les clés hors de la démo sont identiques avant
//     l'entrée et après la sortie ; ce qui a été créé reste dans la démo ;
//   · « Refaire avec mon matériel » referme la démo et relance le parcours sur les vraies données ;
//   · la remise à neuf rend la démo du pack et laisse les autres clés identiques.
// L'apparence se juge sur capture : CAPTURES_PARCOURS=<dossier> npx playwright test deux-temps-modelisation
// ⚠ Cloud du 12 nov. : ce banc a tourné sous Chromium (playwright.chromium.config.js) ; le verdict WebKit se prend
// sur le Mac.

import {
    indexHtml, HORLOGE, CAPTURES, QUATRE_TEMPS, sansInsecable, TOTEMS_DU_PACK, capture, ouvrirEspaceVide, ouvrirPanneau, ouvrirPanneauSurLaDemo, bulle, carte, enDemo, attendreEtape, contourSur, gesteDesigne, releve, DE_LA_DEMO, DE_L_APPAREIL, ecarts, horsDeLaDemo, ouvrirBloc, peuplerUnTrimestreReel, materiel, optionDont, TOTAL, faireLaModelisation
} from './harness/deux-temps-de-banc.js';

// ---------- Les bancs ----------

test('le panneau : le texte en quatre temps, le choix du matériel qui se souvient, la carte sans modélisation, « Remettre la démo à neuf »', async ({ page }) => {
    // Sous un banc (`navigator.webdriver`), le matériel par défaut est « Pratique guidée » et la vue est étendue, pour ne
    // pas déplacer les autres bancs. Ce banc éteint le drapeau pour éprouver le vrai défaut, et garde la vue étendue.
    await page.addInitScript(() => {
        Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false });
        try { if (!localStorage.getItem('laboCodex.vue')) localStorage.setItem('laboCodex.vue', 'etendue'); } catch (e) { /* rien */ }
    });
    await ouvrirEspaceVide(page);
    expect(await page.evaluate(() => localStorage.getItem('laboCodex.assistance'))).toBeNull();
    await ouvrirPanneau(page);
    const p = page.locator('#panneau-assistance');

    // (a) Le texte validé, mot pour mot : un titre en gras et sa suite, puis quatre lignes au début en gras.
    const lignes = await p.locator('.assistance-intro-titre, .assistance-intro-temps li').allTextContents();
    expect(lignes.map(sansInsecable)).toEqual(QUATRE_TEMPS);
    expect((await p.locator('.assistance-intro strong').allTextContents()).map(sansInsecable)).toEqual([
        "Apprendre l'application, en quatre temps.", 'Découvrir par toi-même.', 'Regarder un modèle.', 'Mettre en pratique.', 'Continuer en autonomie.']);

    // (b) Un seul choix, entre « Tes parcours » et la liste ; par défaut, « Modélisation ».
    const options = p.locator('#assistance-materiel [role="radio"]');
    // 13 nov. 2026 (Grégoire, mot pour mot) : le nom du temps, et dessous, en plus petit, le matériel.
    await expect(options.locator('.assistance-materiel-nom')).toHaveText(['Modélisation', 'Pratique guidée']);
    await expect(options.locator('.assistance-materiel-sous')).toHaveText(['avec le matériel de la démo', 'avec mon matériel']);
    expect(await options.nth(0).evaluate((b) => {
        const t = (c) => b.querySelector(c), px = (e) => parseFloat(getComputedStyle(e).fontSize);
        return t('.assistance-materiel-sous').getBoundingClientRect().top >= t('.assistance-materiel-nom').getBoundingClientRect().bottom - 1
            && px(t('.assistance-materiel-sous')) < px(t('.assistance-materiel-nom'));
    }), 'le matériel est écrit sous le nom, en plus petit').toBe(true);
    await expect(options.nth(0)).toHaveAttribute('aria-checked', 'true');
    expect(await page.evaluate(() => {
        const ordre = ['assistance-intitule', 'assistance-materiel', 'assistance-demo-neuf', 'assistance-parcours-liste'].map((id) => document.getElementById(id));
        return ordre.every((e, i) => i === 0 || (ordre[i - 1].compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING));
    })).toBe(true);
    for (const o of await options.all()) expect((await o.boundingBox()).height).toBeGreaterThanOrEqual(44);

    // (c) Sous « Modélisation » : « Découvrir » tel quel, « Mettre ta classe en place » avec sa modélisation,
    // les autres ont leur bouton inactif, sans phrase (13 nov. 2026), et leur « Commencer » ne part pas.
    await expect(carte(page, 'decouvrir').locator('.assistance-parcours-sans-modele')).toHaveCount(0);
    await expect(carte(page, 'decouvrir').locator('.assistance-parcours-bouton')).not.toHaveAttribute('aria-disabled', 'true');
    await expect(carte(page, 'classe').locator('.assistance-parcours-sans-modele')).toHaveCount(0);
    await expect(carte(page, 'classe').locator('.assistance-parcours-bouton')).toHaveText('Commencer');
    const sans = await page.evaluate(() => Assistance.parcours().filter((d) => !d.dansLaDemo && typeof d.lancerModele !== 'function').map((d) => d.id));
    expect(sans.length).toBeGreaterThan(0);
    for (const id of sans) {
        await expect(carte(page, id).locator('.assistance-parcours-sans-modele')).toHaveCount(0);
        await expect(carte(page, id)).not.toContainText('modèle');
        await expect(carte(page, id).locator('.assistance-parcours-bouton')).toHaveAttribute('aria-disabled', 'true');
    }
    await carte(page, sans[0]).locator('.assistance-parcours-bouton').click({ force: true });
    await expect(p).toBeVisible();
    await expect(bulle(page)).toHaveCount(0);
    expect(await enDemo(page)).toBe(false);
    await capture(page, 'panneau-materiel-de-la-demo');

    // (d) « Remettre la démo à neuf » : visible avec « Modélisation », caché avec « Pratique guidée ».
    await expect(p.locator('#assistance-demo-neuf')).toBeVisible();
    await expect(p.locator('#assistance-demo-neuf')).toHaveText('Remettre la démo à neuf');
    await options.nth(1).click();
    await expect(options.nth(1)).toHaveAttribute('aria-checked', 'true');
    await expect(p.locator('#assistance-demo-neuf')).toBeHidden();
    await expect(p.locator('.assistance-parcours-sans-modele')).toHaveCount(0);
    await expect(p.locator('.assistance-parcours-bouton[aria-disabled="true"]')).toHaveCount(0);
    await capture(page, 'panneau-mon-materiel');

    // Le choix se souvient, sur l'appareil et hors des données : rien dans db, une clé du navigateur.
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('laboCodex.assistance')).materiel)).toBe('mien');
    expect(await page.evaluate(async () => (await db.keys()).filter((k) => /assistance/i.test(k) && k !== 'laboCodex.assistance'))).toEqual([]);
    await page.reload();
    await attendreApplication(page);
    await ouvrirPanneau(page);
    await expect(page.locator('#assistance-materiel [role="radio"]').nth(1)).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('#assistance-demo-neuf')).toBeHidden();
    // Au clavier : les flèches passent d'une option à l'autre.
    await page.locator('#assistance-materiel [role="radio"]').nth(1).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#assistance-materiel [role="radio"]').nth(0)).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('#assistance-materiel [role="radio"]').nth(0)).toBeFocused();
    await expect(page.locator('#assistance-demo-neuf')).toBeVisible();
});

test('la modélisation de « Mettre ta classe en place », de bout en bout dans la démo ; le confinement, un trimestre réel peuplé au départ ; « Refaire avec mon matériel »', async ({ page, context }) => {
    test.setTimeout(240000);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await ouvrirEspaceVide(page);
    await peuplerUnTrimestreReel(page);
    const avant = await releve(page);
    expect(Object.keys(avant).filter((k) => /^db:a2026_/.test(k)).length, 'un trimestre réel peuplé').toBeGreaterThan(4);

    // « Commencer », sous « Modélisation » : la démo s'ouvre, la modélisation part.
    await ouvrirPanneauSurLaDemo(page);
    expect(ecarts(avant, await releve(page), horsDeLaDemo), 'le choix du matériel n\'écrit rien dans les données').toEqual([]);
    await carte(page, 'classe').locator('.assistance-parcours-bouton').click();
    await faireLaModelisation(page, { capturer: '1180' });

    // La liste fournie : dix totems (13 nov. 2026), aucun du pack, la parité (cinq noms accordés au féminin).
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
        etat: Assistance.etatModeleDe('classe'),
        reel: Assistance.etatDe('classe')
    }));
    expect(cree).toEqual({ cours: [[m.cours.code, true]], etudiants: 20, horaires: 2, groupes: 2,
        etat: { etat: 'en-cours', etape: 7 }, reel: { etat: 'a-faire', etape: 0 } });

    // La dernière bulle : en principal, la suite dans la démo ; en second, « Refaire avec mon matériel ».
    const boutons = bulle(page).locator('.parcours-bulle-boutons button');
    // 13 nov. 2026 : le parcours suivant a son modèle ; le bouton principal porte son titre et le lance, dans la démo.
    await expect(boutons).toHaveText(['Évaluer une première production', 'Refaire avec mon matériel']);
    await expect(boutons.nth(0)).toHaveClass(/btn-principal/);
    await expect(boutons.nth(1)).toHaveClass(/btn-secondaire/);
    await boutons.nth(0).click();
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('1 sur 9', { timeout: 10000 });
    await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText('Ta grille');
    expect(await enDemo(page)).toBe(true);
    expect(await page.evaluate(() => Assistance.etatModeleDe('classe').etat)).toBe('fait');
    expect(await page.evaluate(() => Assistance.etatModeleDe('evaluer'))).toEqual({ etat: 'en-cours', etape: 0 });
    // « Plus tard » : le modèle attend à sa première étape ; rien n'a été écrit.
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

    // Ce qui a été créé reste dans la démo : « Refaire » (la modélisation est faite) y revient. La démo rouvre sur son
    // propre groupe : la modélisation reprend au passage d'un groupe à l'autre, puis va droit à sa dernière bulle
    // (le cours, la liste, l'horaire, le groupe-cours et la saisie verrouillée sont toujours là).
    await ouvrirPanneau(page);
    await expect(carte(page, 'classe').locator('.assistance-parcours-etat')).toHaveText('Fait');
    await expect(carte(page, 'classe').locator('.assistance-parcours-bouton')).toHaveText('Refaire');
    await carte(page, 'classe').locator('.assistance-parcours-bouton').click();
    await attendreEtape(page, 6, TOTAL, "D'un groupe à l'autre");
    expect(await enDemo(page)).toBe(true);
    expect(await page.evaluate(() => (db.getSync('cours', []) || []).filter((c) => c.creeEnDemonstration).map((c) => c.codeCours))).toEqual([m.cours.code]);
    await page.selectOption('#selectGroupeCoursHeader', await optionDont(page, '#selectGroupeCoursHeader', m.cours.code));
    await attendreEtape(page, 8, TOTAL, "Le groupe d'un coup d'œil");
    await expect(page.locator('#suivi-groupe')).toBeVisible();

    // « Refaire avec mon matériel » : la démo se referme, le même parcours repart sur les vraies données.
    await bulle(page).getByRole('button', { name: 'Refaire avec mon matériel' }).click();
    await expect.poll(() => enDemo(page)).toBe(false);
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(/ sur 8$/, { timeout: 10000 });
    expect(await page.evaluate(() => Assistance.etatDe('classe').etat)).toBe('en-cours');
    expect(await page.evaluate(() => Assistance.materiel())).toBe('mien');
    expect(await page.evaluate(() => db.getSync('trimestreActif', null))).toBe('a2026');
    // Sur les vraies données : la liste réelle, pas celle de la démo ; le cours de la démo n'y est pas.
    expect(await page.evaluate(() => (db.getSync('cours', []) || []).map((c) => c.codeCours))).toEqual(['601-101-MQ']);
    await page.evaluate(() => ParcoursMoteur.fermer());
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
    await ouvrirPanneauSurLaDemo(page);
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
    await ouvrirPanneauSurLaDemo(page);
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
