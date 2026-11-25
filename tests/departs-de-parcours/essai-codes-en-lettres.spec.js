import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { ouvrirEspaceVide, mettreLeCadreEnPlace, elevesFictifs, attendreEtape, bulle } from '../integration/harness/classe-de-banc.js';
import { RACINE, DOSSIER_DES_DEPARTS } from './departs.js';
import { FICHIER_ESSAI, NOM_ESSAI, CODES } from './essai-codes-en-lettres.js';

// =======================================================================
// ⚠ ESSAI SEULEMENT — FABRIQUER LE FICHIER D'ESSAI DES CODES EN LETTRES (24 nov. 2026, suite de 17 h 55, point 4)
// =======================================================================
// À RETIRER AVANT LA FUSION, avec departs/ESSAI-codes-en-lettres-lot-1.zip, sa section de departs.html et son banc
// tests/integration/essai-codes-en-lettres-depart.spec.js (rapport du lot, « Suite : la pastille »).
//
// Ce n'est pas un banc : il FABRIQUE un fichier, comme fabriquer-codex-de-depart.spec.js, et se lance de même :
//     PLAYWRIGHT_CHROMIUM=/opt/pw-browsers/chromium npx playwright test -c playwright.departs.config.js essai-codes-en-lettres
// Ce que le fichier porte, pour poser des codes tout de suite dans l'aperçu, sans créer de groupe ni importer de copie :
//   · une classe en place par les gestes de « Mettre ta classe en place », QUATRE personnes manifestement fictives ;
//   · une grille dont le critère algorithmique porte les dix-sept codes fictifs (consignes du 24 nov.) ;
//   · une production qui la nomme ;
//   · une copie fictive déjà importée par le vrai chemin d'import (tests/fixtures/perspective-coins/loutre-pleine-image.jpg :
//     un texte inventé, déjà au dépôt), associée à la première personne ;
//   · son évaluation commencée (300 mots), non verrouillée : le PDF se produit ensuite par les gestes (retour d'essai).
// ⛔ Aucune donnée réelle. Les codes : K-A … W-B, K-AB, QRST, W-12, « Code fictif 1 » à « 17 ».

const COPIE = path.join(RACINE, 'tests', 'fixtures', 'perspective-coins', 'loutre-pleine-image.jpg');

/** Le rappel « Mets ton codex à jour » répondu (comme la fabrique des départs) : il ne couvre pas l'essai. */
async function repondreAuRappel(page) {
    await page.evaluate(() => window.backupReminder.verifierEtAfficher());
    const rappel = page.locator('#overlay-backup-reminder.actif');
    if (await rappel.count()) {
        await page.selectOption('#select-rappel-backup', '30');
        await rappel.getByRole('button', { name: 'Plus tard', exact: true }).click();
        await expect(rappel).toHaveCount(0);
    }
}

test('fabriquer : ESSAI, codes en lettres', async ({ page }) => {
    test.setTimeout(300000);
    // 1. La classe, par ses gestes : quatre personnes fictives.
    await ouvrirEspaceVide(page, 1180);
    await mettreLeCadreEnPlace(page, elevesFictifs(4));
    await attendreEtape(page, 7, 8, 'Prendre les présences', { focus: false });
    await page.click('#btnVerrouillerSaisiePresences');
    await attendreEtape(page, 8, 8, "Ta classe d'un coup d'œil", { focus: false });
    await bulle(page).getByRole('button', { name: 'Terminer' }).click();
    await expect(bulle(page)).toHaveCount(0);

    // 2. La grille et la production, par les fonctions de l'application.
    const ids = await page.evaluate(async (codes) => {
        const grilleId = 'GRILLE_ESSAI_CODES_LETTRES';
        const grilles = (await db.get(cle('grillesTemplates'))) || [];
        grilles.push({ // security-ok: données fictives du fichier d'essai
            id: grilleId, nom: 'Grille fictive : codes en lettres', description: 'Essai seulement.',
            criteres: [{
                id: 'CR_ESSAI_CODES', nom: 'Codes fictifs', type: 'algorithmique', ponderation: 100, description: '',
                codesSousCriteresSeulement: true,
                sousCriteres: codes.map((code, i) => ({ id: 'SC_ESSAI_' + (i + 1), code, nom: 'Code fictif ' + (i + 1), ponderation: 1, retroaction: '' }))
            }],
            dateCreation: new Date().toISOString(), dateModification: new Date().toISOString()
        });
        await db.set(cle('grillesTemplates'), grilles); // security-ok: données fictives créées sur place, fichier d'essai
        const productions = (await db.get(cle('productions'))) || [];
        const p = construireProductionData({ // security-ok: données fictives du fichier d'essai
            titre: 'Production fictive : codes en lettres', activiteApprentissage: '', type: 'travail', ponderation: 10,
            objectif: '', tache: '', detailTache: '', grilleId, echelleId: '', cartoucheId: '', dateEcheance: ''
        }, productions, null);
        p.id = genererIdUnique('PROD_');
        p.dateCreation = new Date().toISOString();
        p.dateModification = p.dateCreation;
        productions.push(p);
        await db.set(cle('productions'), productions); // security-ok: données fictives créées sur place, fichier d'essai
        const eleves = db.getSync(cle('groupeEtudiants'), []);
        return { grilleId, productionId: p.id, da: eleves[0] && eleves[0].da, nbEleves: eleves.length };
    }, CODES);
    expect(ids.nbEleves, 'quatre personnes fictives').toBe(4);

    // 3. La copie fictive, par le vrai import (magic bytes, compression, miniature, stockage).
    const b64 = fs.readFileSync(COPIE).toString('base64');
    const importe = await page.evaluate(async ({ b64, ids }) => {
        const bin = atob(b64), octets = new Uint8Array(bin.length);
        for (let k = 0; k < bin.length; k++) octets[k] = bin.charCodeAt(k);
        travauxImport.viderFileDAttente();
        travauxImport.ajouterFichiersEnAttente([new File([octets], 'copie-fictive.jpg', { type: 'image/jpeg' })]);
        const f = travauxImport.obtenirFileDAttente()[0];
        f.etudiantDA = ids.da;
        f.productionId = ids.productionId;
        const r = await travauxImport.importerTous(ids.productionId);
        travauxImport.viderFileDAttente();
        await db.flush();
        const fichiers = db.getSync(cle('fichiersTravaux'), []);
        return { r, fichiers: fichiers.map((x) => ({ id: x.id, da: x.etudiantDA, productionId: x.productionId })) };
    }, { b64, ids });
    console.log('IMPORT →', JSON.stringify(importe));
    expect(importe.fichiers).toEqual([expect.objectContaining({ da: ids.da, productionId: ids.productionId })]);

    // 3 bis. Une évaluation COMMENCÉE, par les gestes d'Évaluer (retour d'essai du 24 nov., 19 h 30 : sans évaluation,
    // « Exporter pour Léa » ne produit rien). La copie ouverte depuis la liste, « Annoter ▾ », « Évaluer », 300 mots.
    // Non verrouillée : les codes que Grégoire posera la suivent (le compte d'erreurs), puis il la verrouille.
    const fermerLeRappel = () => page.evaluate(() => { const o = document.getElementById('overlay-backup-reminder'); if (o) o.remove(); });
    await page.evaluate(() => naviguerVers('evaluations', 'liste'));
    const menu = page.locator('select.eval-actions-select:has(option[value^="annoter|"])').first();
    await expect(menu).toBeVisible();
    await menu.selectOption(await menu.evaluate((s) => s.querySelector('option[value^="annoter|"]').value));
    await page.waitForFunction(() => !!document.querySelector('#evaluations-annoter.sous-section.active'), null, { timeout: 15000 });
    await fermerLeRappel();
    await page.click('#travaux-btn-actions');
    await page.click('#travaux-btn-evaluer');
    const mots = page.locator('input[id^="eval_mots_"]').first();
    await expect(mots).toBeVisible();
    // Le chargement de l'évaluation suspend l'enregistrement automatique (`_debouncerAutoSave`) : saisir après, comme
    // une personne qui lit l'écran avant de taper.
    await expect.poll(() => page.evaluate(() => !window._autoSaveSuspendu && !(window._chargementsEvaluationEnCours > 0))).toBe(true);
    await mots.fill('300');
    await mots.dispatchEvent('change');
    await expect.poll(() => page.evaluate(() => (obtenirDonneesSelonMode('evaluationsSauvegardees') || []).length), { message: 'l’évaluation s’enregistre seule', timeout: 15000 }).toBe(1);

    // 4. Le fichier : le vrai `Codex.generer`, l'aperçu « voici ce qui part » accepté d'office.
    await page.evaluate(() => { definirPreference('modeClair', true); });
    await repondreAuRappel(page);
    const b64Codex = await page.evaluate(async (n) => {
        await db.flush();
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        const rendu = await Codex.generer({ nom: n });
        const o = new Uint8Array(await rendu.blob.arrayBuffer());
        let binaire = '';
        for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
        return btoa(binaire);
    }, NOM_ESSAI);
    const octets = Buffer.from(b64Codex, 'base64');

    // Témoins, lus dans le zip : la grille aux dix-sept codes, la production, quatre personnes, la copie et son image.
    const zip = await JSZip.loadAsync(octets);
    const donnees = JSON.parse(await zip.file('donnees.json').async('string'));
    const t = (donnees.trimestres || []).filter((x) => x && x.id && x.id !== 'demo')[0].id;
    const grille = (donnees[t + '_grillesTemplates'] || []).find((g) => g.id === ids.grilleId);
    const travaux = Object.keys(zip.files).filter((n) => /^(trimestres\/[^/]+\/)?travaux\/.+\..+$/.test(n));
    expect({
        codes: grille.criteres[0].sousCriteres.map((s) => s.code),
        production: (donnees[t + '_productions'] || []).some((p) => p.id === ids.productionId && p.grilleId === ids.grilleId),
        eleves: (donnees[t + '_groupeEtudiants'] || []).length,
        copies: (donnees[t + '_fichiersTravaux'] || []).length,
        images: travaux.length,
        evaluations: (donnees[t + '_evaluationsSauvegardees'] || []).map((e) => ({
            da: e.etudiantDA, verrouillee: !!e.verrouillee,
            mots: Number(((e.donneesAlgorithmiques || {}).CR_ESSAI_CODES || {}).mots) })),
        sansLaDemo: Object.keys(donnees).filter((k) => /^demo_/.test(k)).length
    }).toEqual({ codes: CODES, production: true, eleves: 4, copies: 1, images: 1,
        evaluations: [{ da: ids.da, verrouillee: false, mots: 300 }], sansLaDemo: 0 });
    fs.mkdirSync(DOSSIER_DES_DEPARTS, { recursive: true });
    fs.writeFileSync(path.join(DOSSIER_DES_DEPARTS, FICHIER_ESSAI), octets);
    console.log('ÉCRIT →', FICHIER_ESSAI, octets.length, 'octets ; fichiers du zip :', Object.keys(zip.files).join(', '));
});
