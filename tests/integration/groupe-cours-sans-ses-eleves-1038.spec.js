import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1038 (26 oct. 2026) — LE GROUPE-COURS QUI NAÎT SANS SES ÉLÈVES (la source).
//
// La séquence de Mathieu (14 sept. 2026), rejouée par les fonctions de l'écran (d'après le script
// de Cowork, `Retours des testeurs/mathieu/REPRO-1038-sequence-14-sept.mjs`) : deux cours, le
// premier s'active seul ; la liste importée et la production vont au cours actif (203-GM6-DM) ;
// le groupe-cours « 203-SN4-DM + 00001 » est créé, puis activé. Avant ce lot : « Groupe-cours …
// créé. », puis un sélecteur « Production » vide, sans un mot.
//
// Ce banc lit les MOTS (validés par Grégoire le 26 oct. 2026, 15 h 01) :
//  A. la question posée à l'enregistrement, et « Annuler » qui n'écrit rien ;
//  B. la ligne sous le sélecteur « Production » de l'import, une fois le groupe-cours activé.
// Et les cas sans question ni ligne : groupe vide partout, fiches sans coursId, deux cours bien
// rangés. Noms fictifs.

const GM6 = 'COURS_GM6', SN4 = 'COURS_SN4', XXX = 'COURS_XXX';
const LIB = { [GM6]: '203-GM6-DM Cours fictif A', [SN4]: '203-SN4-DM Cours fictif B', [XXX]: '203-XXX-DM Cours fictif C' };
const espaces = (s) => String(s || '').replace(/\s+/g, ' ').trim();

async function ouvrir(page) {
    const etat = { dialogues: [], accepter: false, erreurs: [] };
    page.on('pageerror', (e) => etat.erreurs.push('pageerror: ' + e.message));
    page.on('dialog', (d) => { etat.dialogues.push(d.message()); (etat.accepter ? d.accept() : d.dismiss()).catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.db && typeof window.naviguerVers === 'function' && typeof window.sauvegarderGroupeCoursV2 === 'function');
    await page.evaluate(async () => {
        localStorage.clear(); if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => { const q = indexedDB.deleteDatabase('LaboCodexDB'); q.onsuccess = q.onerror = q.onblocked = () => res(); setTimeout(res, 1500); });
    });
    await page.reload();
    await page.waitForFunction(() => window.db && typeof window.naviguerVers === 'function' && typeof window.sauvegarderGroupeCoursV2 === 'function');
    await page.evaluate(({ GM6, SN4, XXX }) => {
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        db.setSync(cle('cadreCalendrier'), { dateDebut: '2026-08-17', finCours: '2026-12-11', finTrimestre: '2026-12-21' });
        // trimestre-v2-cours.js, _activerSiPremierCours : seul le premier cours créé s'active.
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        db.setSync('cours', [
            { id: GM6, codeCours: '203-GM6-DM', nomCours: 'Cours fictif A', actif: true },
            { id: SN4, codeCours: '203-SN4-DM', nomCours: 'Cours fictif B' },
            { id: XXX, codeCours: '203-XXX-DM', nomCours: 'Cours fictif C' }
        ]);
        db.setSync('infoCours', { id: GM6, codeCours: '203-GM6-DM', nomCours: 'Cours fictif A', actif: true });
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        db.setSync('enseignants', [{ id: 'ENS1', prenom: 'Enseignant', nom: 'Fictif' }, { id: 'ENS2', prenom: 'Autre', nom: 'Fictive' }]);
        // L'horaire se résout par son groupe associé (mettreAJourNomGroupeCoursV2), comme à l'écran.
        db.setSync(cle('horaires'), ['00001', '00009'].map((g) => ({ id: 'HOR_' + g, nom: 'Mardi matin', groupeAssocie: g, seances: [{ jour: 'Mardi', heureDebut: '08:00', heureFin: '10:00' }] }))); // security-ok: littéral de test
        db.setSync(cle('groupesCours'), []); // security-ok: tableau vide littéral d'un test
        db.setSync(cle('groupeEtudiants'), []); // security-ok: tableau vide littéral d'un test
        db.setSync(cle('productions'), []); // security-ok: tableau vide littéral d'un test
        naviguerVers('calendrier', 'trimestre');
    }, { GM6, SN4, XXX });
    await page.waitForFunction(() => !!document.getElementById('v2-donneesCollees') && !!document.getElementById('v2-gc-cours'));
    return etat;
}

/** Pose des élèves et des productions tels que l'import et Conception les auraient écrits. */
const poserDonnees = (page, eleves, productions) => page.evaluate(({ eleves, productions }) => {
    // security-ok: jeu d'essai littéral d'un test, aucune source externe.
    db.setSync(cle('groupeEtudiants'), eleves.map(([da, groupe, coursId]) => ({ da, groupe, coursId, nom: 'Fictif', prenom: 'Élève' + da })));
    // security-ok: jeu d'essai littéral d'un test, aucune source externe.
    db.setSync(cle('productions'), productions.map(([id, coursId]) => ({ id, titre: 'Production fictive ' + id, type: 'artefact', coursId })));
}, { eleves, productions });

/** ÉCRAN : « + Nouveau groupe-cours », les cinq champs, « Créer ». Rend les groupes-cours écrits. */
const creerGroupeCours = (page, coursId, groupe) => page.evaluate(async ({ coursId, groupe }) => {
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    await window.nouveauGroupeCoursV2(); await pause(250);
    // Le `change` du groupe résout l'horaire par son groupe associé ; l'enseignant·e se pose.
    const poser = (id, v, declencher) => {
        const el = document.getElementById(id);
        if (!Array.from(el.options).some((o) => o.value === v)) { const o = document.createElement('option'); o.value = v; o.textContent = v; el.appendChild(o); }
        el.value = v;
        if (declencher) el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    poser('v2-gc-trimestre', 'a2026', true); poser('v2-gc-cours', coursId, true); await pause(200);
    poser('v2-gc-groupe', groupe, true); poser('v2-gc-enseignant', 'ENS1');
    window.sauvegarderGroupeCoursV2(); await pause(400);
    return db.getSync(cle('groupesCours'), []).map((g) => ({ id: g.id, coursId: g.coursId, groupeNum: g.groupeNum }));
}, { coursId, groupe });

/** ÉCRAN : activer le groupe-cours (sélecteur d'en-tête), déposer un fichier, lire l'étape 2 de l'import. */
const lireImport = (page, gcId) => page.evaluate(async (gcId) => {
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    await window.changerGroupeCoursActifV2(gcId); await pause(800);
    const f = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34])], 'copie.pdf', { type: 'application/pdf' });
    window.travauxImport.viderFileDAttente();
    await window.travauxImport.ajouterFichiersEnAttente([f]);
    window.travauxUI.afficherImport(); await pause(300);
    const sel = document.getElementById('pipeline-select-production');
    const ligne = document.getElementById('pipeline-productions-ailleurs');
    return {
        coursActif: (db.getSync('infoCours', null) || {}).id,
        options: sel ? Array.from(sel.options).map((o) => o.textContent) : null,
        ligne: ligne ? ligne.textContent : null
    };
}, gcId);

test.describe('#1038 — le groupe-cours qui naît sans ses élèves', () => {
    test('la séquence de Mathieu : la question (A), « Annuler » n\'écrit rien, puis la ligne sous « Production » (B)', async ({ page }) => {
        const etat = await ouvrir(page);

        // ÉCRAN : la liste collée (avec sa ligne d'en-tête) va au cours actif, 203-GM6-DM.
        const importes = await page.evaluate(async () => {
            if (window.rafraichirRattachementEtudiantsV2) window.rafraichirRattachementEtudiantsV2();
            document.getElementById('v2-donneesCollees').value = 'DA\tGroupe\tNom\tPrénom\tProgramme\t\tSA\n2000001\t00001\tFictif\tUne\t200.B1\t\t\n2000002\t00001\tFictif\tDeux\t200.B1\t\t\n2000003\t00001\tFictif\tTrois\t200.B1\t\t';
            window.previsualiserDonneesV2();
            await new Promise((r) => setTimeout(r, 300));
            await confirmerImportV2();
            await new Promise((r) => setTimeout(r, 500));
            // productions.js, construireProductionData : une production créée reçoit le cours actif.
            // security-ok: jeu d'essai littéral d'un test, aucune source externe.
            db.setSync(cle('productions'), [{ id: 'PROD_1', titre: 'Production fictive', type: 'artefact', coursId: obtenirCoursActifId() }]);
            return db.getSync(cle('groupeEtudiants'), []).map((e) => e.coursId);
        });
        expect(importes, 'les trois élèves vont au cours actif').toEqual([GM6, GM6, GM6]);

        // A — « Annuler » : rien n'est écrit.
        etat.accepter = false;
        expect(await creerGroupeCours(page, SN4, '00001'), 'Annuler : aucun groupe-cours écrit').toEqual([]);
        expect(etat.dialogues).toHaveLength(1);
        expect(etat.dialogues[0]).toBe(
            `Le groupe 00001 n'a aucun·e étudiant·e dans ${LIB[SN4]}. Ses 3 étudiant·es sont rattaché·es à ${LIB[GM6]}.\n\n`
            + `Ce groupe-cours restera vide tant qu'aucun·e étudiant·e n'est rattaché·e à ${LIB[SN4]}.\n\n`
            + 'Créer quand même le groupe-cours ?'
        );

        // La fiche reste ouverte, ses champs gardés : « Créer » à nouveau, « OK » cette fois.
        etat.accepter = true;
        const gcs = await page.evaluate(async ({ SN4 }) => {
            const champs = ['v2-gc-cours', 'v2-gc-groupe'].map((id) => document.getElementById(id).value);
            if (champs.join() !== SN4 + ',00001') return 'fiche non gardée : ' + champs.join();
            window.sauvegarderGroupeCoursV2();
            await new Promise((r) => setTimeout(r, 400));
            return db.getSync(cle('groupesCours'), []).map((g) => ({ id: g.id, coursId: g.coursId, groupeNum: g.groupeNum }));
        }, { SN4 });
        expect(etat.dialogues, 'la question est posée de nouveau').toHaveLength(2);
        expect(gcs.map((g) => [g.coursId, g.groupeNum]), 'OK : le groupe-cours est écrit').toEqual([[SN4, '00001']]);

        // B — activé : le sélecteur n'offre aucune production, la ligne dit où elle est.
        const imp = await lireImport(page, gcs[0].id);
        expect(imp.coursActif).toBe(SN4);
        expect(imp.options.some((t) => /Production fictive/.test(t)), 'la production de GM6 n\'est pas offerte').toBe(false);
        expect(espaces(imp.ligne)).toBe(
            `Aucune production dans ${LIB[SN4]}. 1 production de ce trimestre est rangée sous ${LIB[GM6]} : elle n'apparaît ici que lorsque ce cours est actif.`
        );
        expect(etat.erreurs).toEqual([]);
    });

    test('A — en modification, quand le cours change : « Modifier quand même », et « Annuler » remet la fiche', async ({ page }) => {
        const etat = await ouvrir(page);
        await poserDonnees(page, [['2000001', '00001', GM6]], []);
        etat.accepter = true;
        const [gc] = await creerGroupeCours(page, GM6, '00001');
        expect(etat.dialogues, 'GM6 + 00001 : ses élèves y sont, aucune question').toEqual([]);

        etat.accepter = false;
        const apres = await page.evaluate(async ({ id, SN4 }) => {
            window.changerGroupeCoursSelectionneV2(id);   // ÉCRAN : le menu de la bibliothèque des groupes-cours
            await new Promise((r) => setTimeout(r, 250));
            const el = document.getElementById('v2-gc-cours');
            el.value = SN4; el.dispatchEvent(new Event('change', { bubbles: true }));
            await new Promise((r) => setTimeout(r, 400));
            return { stock: db.getSync(cle('groupesCours'), [])[0].coursId, champ: el.value };
        }, { id: gc.id, SN4 });
        expect(etat.dialogues).toEqual([
            `Le groupe 00001 n'a aucun·e étudiant·e dans ${LIB[SN4]}. Son étudiant·e est rattaché·e à ${LIB[GM6]}.\n\n`
            + `Ce groupe-cours restera vide tant qu'aucun·e étudiant·e n'est rattaché·e à ${LIB[SN4]}.\n\n`
            + 'Modifier quand même le groupe-cours ?'
        ]);
        expect(apres, 'Annuler : le stock garde GM6, la fiche aussi').toEqual({ stock: GM6, champ: GM6 });

        // Un groupe-cours déjà vide (créé quand même) : changer un autre champ ne repose pas la question.
        etat.accepter = true;
        await page.evaluate(() => db.setSync(cle('groupesCours'), [])); // security-ok: tableau vide littéral d'un test
        const [vide] = await creerGroupeCours(page, SN4, '00001');
        etat.dialogues.length = 0;
        const enseignant = await page.evaluate(async (id) => {
            window.changerGroupeCoursSelectionneV2(id);
            await new Promise((r) => setTimeout(r, 250));
            const el = document.getElementById('v2-gc-enseignant');
            el.value = 'ENS2'; el.dispatchEvent(new Event('change', { bubbles: true }));
            await new Promise((r) => setTimeout(r, 400));
            return db.getSync(cle('groupesCours'), [])[0].enseignantId;
        }, vide.id);
        expect(enseignant, 'l\'enseignant·e est enregistré·e').toBe('ENS2');
        expect(etat.dialogues, 'ni le cours ni le groupe n\'a changé : aucune question').toEqual([]);
        expect(etat.erreurs).toEqual([]);
    });

    test('A et B — plusieurs autres cours : les mots les nomment tous', async ({ page }) => {
        const etat = await ouvrir(page);
        await poserDonnees(page, [['2000001', '00001', GM6], ['2000002', '00001', XXX]], [['P1', GM6], ['P2', XXX]]);
        etat.accepter = true;
        const gcs = await creerGroupeCours(page, SN4, '00001');
        expect(etat.dialogues[0]).toContain(`Ses 2 étudiant·es sont rattaché·es à d'autres cours (${LIB[GM6]}, ${LIB[XXX]}).`);
        const imp = await lireImport(page, gcs[0].id);
        expect(espaces(imp.ligne)).toBe(
            `Aucune production dans ${LIB[SN4]}. 2 productions de ce trimestre sont rangées sous d'autres cours (${LIB[GM6]}, ${LIB[XXX]}) : elles n'apparaissent ici que lorsque leur cours est actif.`
        );
        expect(etat.erreurs).toEqual([]);
    });

    test('ni question ni ligne : groupe vide partout ; fiches sans coursId ; deux cours bien rangés', async ({ page }) => {
        const etat = await ouvrir(page);
        etat.accepter = true;

        // Groupe neuf (« + Nouveau groupe ») : personne nulle part.
        await poserDonnees(page, [['2000001', '00001', GM6]], []);
        const [neuf] = await creerGroupeCours(page, SN4, '00009');
        expect(neuf, 'le groupe-cours est écrit').toBeTruthy();
        expect(etat.dialogues, 'groupe vide partout : aucune question').toEqual([]);
        expect((await lireImport(page, neuf.id)).ligne, 'aucune production nulle part : aucune ligne').toBeNull();

        // Stock d'avant #887 : des fiches sans coursId comptent partout.
        await page.evaluate(() => db.setSync(cle('groupesCours'), [])); // security-ok: tableau vide littéral d'un test
        await poserDonnees(page, [['2000001', '00001', undefined], ['2000002', '00001', GM6]], []);
        expect(await creerGroupeCours(page, SN4, '00001')).toHaveLength(1);
        expect(etat.dialogues, 'fiches sans coursId : aucune question').toEqual([]);

        // Deux cours bien rangés : chacun son 00001, chacun sa production.
        await page.evaluate(() => db.setSync(cle('groupesCours'), [])); // security-ok: tableau vide littéral d'un test
        await poserDonnees(page, [['2000001', '00001', GM6], ['2000002', '00001', SN4]], [['P1', GM6], ['P2', SN4]]);
        const gcs = await creerGroupeCours(page, SN4, '00001');
        expect(etat.dialogues, 'deux cours bien rangés : aucune question').toEqual([]);
        const imp = await lireImport(page, gcs[0].id);
        expect(imp.coursActif).toBe(SN4);
        expect(imp.options.some((t) => /Production fictive P2/.test(t)), 'la production de SN4 est offerte').toBe(true);
        expect(imp.ligne, 'deux cours bien rangés : aucune ligne').toBeNull();
        expect(etat.erreurs).toEqual([]);
    });
});
