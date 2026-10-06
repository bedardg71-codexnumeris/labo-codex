import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LOT I BIS (D9, 30 sept. 2026) — UN SEUL TERME : LA COPIE DE SECOURS DISPARAÎT,
// MAIS UN ANCIEN FICHIER S'OUVRE TOUJOURS.
//
// On ne peut plus FABRIQUER de copie de secours (la fenêtre des clés de Réglages ›
// Données est retirée). Ce qui ne se reprend pas : les fichiers déjà faits, chez les
// gens. Ils s'ouvrent encore par « Ouvrir un Codex… », et restituent les mêmes données.
//
// ⚠ LES DEUX FICHIERS DE `tests/fixtures/copies-de-secours-1.172.0/` ONT ÉTÉ FABRIQUÉS
// AVANT LE RETRAIT, par le vrai geste (fenêtre « Copie de secours », « Toutes les
// clés »), au code de 1.172.0, sur un jeu fictif. Ils ne se régénèrent pas : le code qui
// les fabriquait n'existe plus. `fabrication.json` dit comment ils ont été faits.
//
// DEUX PREUVES, DE DEUX NATURES :
//  (1) RESTITUTION DIRECTE — après l'ouverture, les données personnelles de l'espace
//      sont celles du fichier, valeur pour valeur (aucune référence intermédiaire).
//  (2) EMPREINTES AVANT / APRÈS — tout ce que l'ouverture a écrit dans l'espace, clé par
//      clé, a la même empreinte qu'au code de 1.172.0 (`empreintes-1.172.0.json`, relevé
//      AVANT le retrait par ce même essai). Une clé de plus, de moins, ou autre : rouge.
//
// L'horloge est figée : l'import date ce qu'il importe (`dateImport`), et une empreinte
// ne se compare pas d'un jour à l'autre sans cela.

const FIXTURES = path.join(racineProjet, 'tests', 'fixtures', 'copies-de-secours-1.172.0');
const REFERENCE = JSON.parse(fs.readFileSync(path.join(FIXTURES, 'empreintes-1.172.0.json'), 'utf8'));
const HORLOGE = new Date('2031-10-01T12:00:00.000Z');

const sha = (texte) => crypto.createHash('sha256').update(texte).digest('hex').slice(0, 16);

async function demarrer(page) {
    await page.clock.setFixedTime(HORLOGE);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        await new Promise((res) => { const r = indexedDB.deleteDatabase('LaboCodexDB'); r.onsuccess = r.onerror = r.onblocked = () => res(); setTimeout(res, 1500); });
    });
    await page.reload();
    await page.waitForTimeout(3000);
}

/** L'état de l'espace : chaque clé, sérialisée de façon stable (clés d'objet triées). */
async function lireEtat(page) {
    return page.evaluate(async () => {
        const stable = (v) => {
            if (Array.isArray(v)) return v.map(stable);
            if (v && typeof v === 'object') { const o = {}; Object.keys(v).sort().forEach((k) => { o[k] = stable(v[k]); }); return o; }
            return v;
        };
        const cles = Array.from(new Set([...(await db.keys()), ...Object.keys(localStorage)])).sort();
        const etat = {};
        for (const c of cles) etat[c] = JSON.stringify(stable(await db.get(c, null)));
        return etat;
    });
}

/** Ce que l'ouverture a écrit : les clés créées ou changées, et leur empreinte. */
// #1012, les quatre cases (2 oct. 2026) — UNE SEULE EMPREINTE NE SE COMPARE PLUS, ET LA RÉFÉRENCE N'EST PAS
// RÉAJUSTÉE. Au code de 1.172.0, la case « Étudiants » remplaçait le groupe de l'espace par celui du
// fichier : le fichier porte `demo_groupeEtudiants: []`, et l'ouverture VIDAIT le groupe démo que
// l'espace neuf avait déjà (l'empreinte relevée, 4f53cda18c2baa0c, est celle de `[]`). C'est la perte
// que #1012 supprime : le groupe de l'espace reste, la clé ne fait plus partie de l'écart. Toutes les
// autres empreintes se comparent comme avant.
const CLES_GARDEES_PAR_1012 = ['demo_groupeEtudiants'];
// Et le bilan compte ce qui est ENTRÉ : les 313 fiches de présences démo du fichier sont déjà dans
// l'espace neuf, seules les 2 dates de l'ancien format (`a2031_presences`, un dictionnaire, l'espace n'en
// ayant aucune) entrent. Le reste du bilan se compare au caractère près.
const bilan1012 = (bilan) => bilan.replace('315 date(s) de présences', '2 date(s) de présences');
const sauf1012 = (empreintes) => Object.fromEntries(Object.entries(empreintes).filter(([c]) => !CLES_GARDEES_PAR_1012.includes(c)));

// T2 DU CHANTIER DU DÉMO (décision G1 de Grégoire, 6 oct. 2026) — LA RÉFÉRENCE N'EST PAS RÉAJUSTÉE NON PLUS.
// Les deux fichiers de 1.172.0 portent le démo de ce jour-là (`demo_*`). À 1.172.0, l'ouverture par
// la case en versait les 11 productions dans la clé de productions de l'espace (ici `productions`, la
// page n'ayant pas de trimestre actif) — une fuite du démo vers une clé réelle — et cochait le
// groupe-cours, l'horaire et le calendrier du démo. Le démo du fichier n'entre plus : `productions`
// ne garde que la vraie (PROD_BANC_1), ces trois cases disparaissent, et le bilan le dit. Tout le
// reste se compare comme avant.
const CLES_CHANGEES_PAR_T2 = ['productions'];
const CASES_DU_DEMO_T2 = ['import-calendrier', 'import-groupesCours', 'import-horaires'];
const bilanT2 = (bilan) => bilan
    .replace('12 production(s)', '1 production(s)')
    .replace('1 groupe-cours\n1 horaire(s)\n2 config(s) calendrier\n', '')
    .replace('Total : 23 élément(s)', 'Total : 9 élément(s)')
    .replace('Total : 24 élément(s)', 'Total : 10 élément(s)');
const saufT2 = (empreintes) => Object.fromEntries(Object.entries(empreintes).filter(([c]) => !CLES_CHANGEES_PAR_T2.includes(c)));
const casesT2 = (cases) => cases.filter((c) => !CASES_DU_DEMO_T2.includes(c));
/** T2 : la clé de productions de l'espace ne reçoit que la vraie production du fichier. */
function verifierProductionsSansLeDemo(r) {
    expect(JSON.parse(r.apres.productions).map((p) => p.id), 'T2 : aucune production du démo n\'entre').toEqual(['PROD_BANC_1']);
}

function empreintesDeLEcart(avant, apres) {
    const ecart = {};
    for (const c of Object.keys(apres)) if (avant[c] !== apres[c]) ecart[c] = sha(apres[c]);
    for (const c of Object.keys(avant)) if (!(c in apres)) ecart[c] = '(retirée)';
    return ecart;
}

const stable = (v) => {
    if (Array.isArray(v)) return v.map(stable);
    if (v && typeof v === 'object') { const o = {}; Object.keys(v).sort().forEach((k) => { o[k] = stable(v[k]); }); return o; }
    return v;
};

/** Le relevé de ce passage, déposé dans test-results/ : ce qu'on lit quand une empreinte diverge. */
function deposerReleve(nom, releve) {
    fs.writeFileSync(test.info().outputPath(nom), JSON.stringify(releve, null, 2) + '\n');
}

/** Réglages › Données, le bouton « Ouvrir un Codex… », le fichier : jusqu'à la fenêtre « Contenu du fichier ». */
async function deposerParOuvrirUnCodex(page, fichier) {
    await page.evaluate(() => { afficherSection('reglages'); });
    await page.waitForTimeout(300);
    await page.evaluate(() => { afficherSousSection('reglages-donnees'); });
    await page.waitForTimeout(500);
    const bouton = page.locator('#reglages-donnees [data-action="ouvrirModalImport"]');
    await expect(bouton).toHaveText(/Ouvrir un Codex…/);
    await bouton.click();
    await page.setInputFiles('#fichierImport', fichier);
    await page.waitForSelector('#modalPreviewConfigComplete');
}

/** Ce que la fenêtre « Contenu du fichier » dit, sans rien y cocher. */
const lireFenetre = (page) => page.evaluate(() => {
    const m = document.getElementById('modalPreviewConfigComplete');
    const confirmer = m.querySelector('#confirmMaSauvegarde');
    return {
        etiquette: m.querySelector('strong + span').textContent.replace(/\s+/g, ' ').trim(),
        confirmation: confirmer ? confirmer.closest('label').textContent.replace(/\s+/g, ' ').trim() : null,
        texte: m.textContent.replace(/\s+/g, ' ')
    };
});

/** Le geste entier : Réglages › Données, « Ouvrir un Codex… », le fichier, tout cocher, importer. */
async function ouvrirAncienFichier(page, fichier) {
    const dialogues = [];
    page.on('dialog', (d) => {
        dialogues.push({ type: d.type(), message: d.message() });
        // On ne recharge pas : l'état se lit tel que l'import vient de l'écrire.
        if (d.type() === 'confirm' && /^Recharger la page/.test(d.message())) d.dismiss().catch(() => {});
        else d.accept().catch(() => {});
    });
    const avant = await lireEtat(page);

    await deposerParOuvrirUnCodex(page, fichier);

    const fenetre = await page.evaluate(() => {
        const m = document.getElementById('modalPreviewConfigComplete');
        const etiquette = m.querySelector('strong + span').textContent.replace(/\s+/g, ' ').trim();
        const confirmer = m.querySelector('#confirmMaSauvegarde');
        if (confirmer && !confirmer.checked) confirmer.click();
        m.querySelectorAll('.import-category-toggle').forEach((cb) => { if (!cb.checked) cb.click(); });
        m.querySelectorAll('input[type="checkbox"][id^="import-"]').forEach((cb) => { if (!cb.checked) cb.click(); });
        const cases = Array.from(m.querySelectorAll('input[type="checkbox"][id^="import-"]')).map((cb) => cb.id + (cb.checked ? '' : ' (NON cochée)')).sort();
        return { etiquette, cases, texte: m.textContent.replace(/\s+/g, ' ') };
    });

    await page.click('#modalPreviewConfigComplete [data-action="executerImportSelectif"]');
    await expect.poll(() => dialogues.some((d) => /^Recharger la page/.test(d.message)), { timeout: 20000 }).toBe(true);
    await page.waitForTimeout(500);

    const apres = await lireEtat(page);
    const bilan = (dialogues.find((d) => d.type === 'alert') || { message: '(aucun bilan)' }).message;
    return { avant, apres, fenetre, bilan, empreintes: empreintesDeLEcart(avant, apres) };
}

test.describe('Lot I bis — une ancienne copie de secours s\'ouvre encore, par « Ouvrir un Codex… »', () => {
    test('le .json (sans les copies) : mêmes données qu\'à 1.172.0', async ({ page }) => {
        test.setTimeout(90000);
        await demarrer(page);
        const fichier = path.join(FIXTURES, 'copie-de-secours.json');
        const contenu = JSON.parse(fs.readFileSync(fichier, 'utf8'));
        const r = await ouvrirAncienFichier(page, fichier);
        deposerReleve('releve-json.json', { etiquette: r.fenetre.etiquette, cases: r.fenetre.cases, bilan: r.bilan, empreintes: r.empreintes });

        // (1) Restitution directe : les données personnelles sont celles du fichier.
        for (const cle of ['a2031_groupeEtudiants', 'a2031_presences', 'a2031_evaluationsSauvegardees']) {
            expect(contenu[cle], cle + ' est dans le fichier').toBeTruthy();
            expect(JSON.parse(r.apres[cle]), cle + ' : restitué tel quel').toEqual(stable(contenu[cle]));
            expect(r.avant[cle], cle + ' : absent avant l\'ouverture').toBeUndefined();
        }
        // (2) Empreintes : tout ce que l'ouverture a écrit, comme à 1.172.0.
        expect(Object.keys(REFERENCE.json.empreintes).length, 'la référence n\'est pas vide').toBeGreaterThan(5);
        expect(saufT2(r.empreintes)).toEqual(saufT2(sauf1012(REFERENCE.json.empreintes)));
        verifierProductionsSansLeDemo(r);
        expect(r.avant.demo_groupeEtudiants, '#1012 : l\'espace neuf a un groupe démo').toBeDefined();
        expect(r.apres.demo_groupeEtudiants, '#1012 : le groupe démo de l\'espace n\'est pas vidé').toBe(r.avant.demo_groupeEtudiants);
        expect(r.bilan).toBe(bilanT2(bilan1012(REFERENCE.json.bilan)));
        expect(r.fenetre.cases).toEqual(casesT2(REFERENCE.json.cases));
        expect(r.fenetre.etiquette).toBe(REFERENCE.json.etiquette);
    });

    test('le .zip (avec les copies) : mêmes données qu\'à 1.172.0, et la copie revient octet pour octet', async ({ page }) => {
        test.setTimeout(90000);
        await demarrer(page);
        // Le port de stockage des copies : on relève ce que l'import y dépose. (WebKit sous
        // Playwright refuse un Blob en IndexedDB éphémère : le dépôt réel échouerait pour une
        // raison qui n'est pas celle qu'on mesure.)
        await page.evaluate(() => {
            window.__depots = [];
            window.travauxStockage.stockerBlob = async function (id, blob, da, productionId) {
                const octets = Array.from(new Uint8Array(await blob.arrayBuffer()));
                window.__depots.push({ id, da, productionId, octets });
            };
        });
        const fichier = path.join(FIXTURES, 'copie-de-secours-avec-travaux.zip');
        const r = await ouvrirAncienFichier(page, fichier);
        const depots = await page.evaluate(() => window.__depots);
        const blobs = depots.map((d) => ({ id: d.id, da: d.da, productionId: d.productionId, taille: d.octets.length, sha: crypto.createHash('sha256').update(Buffer.from(d.octets)).digest('hex').slice(0, 16) }));
        deposerReleve('releve-zip.json', { etiquette: r.fenetre.etiquette, cases: r.fenetre.cases, bilan: r.bilan, empreintes: r.empreintes, blobs });

        // (1) Restitution directe : la copie déposée est le PNG d'un pixel du jeu fictif.
        const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
        expect(depots.length, 'une copie déposée').toBe(1);
        expect(Buffer.from(depots[0].octets).equals(PNG), 'octet pour octet').toBe(true);
        expect({ id: depots[0].id, da: depots[0].da, productionId: depots[0].productionId }).toEqual({ id: 'FT_BANC_1', da: '9000001', productionId: 'PROD_BANC_1' });
        for (const cle of ['a2031_groupeEtudiants', 'a2031_evaluationsSauvegardees', 'a2031_fichiersTravaux', 'a2031_annotationsTravaux']) {
            expect(r.apres[cle], cle + ' : restitué').toBeTruthy();
            expect(r.avant[cle], cle + ' : absent avant l\'ouverture').toBeUndefined();
        }
        expect(JSON.parse(r.apres['a2031_fichiersTravaux']).map((f) => f.id)).toEqual(['FT_BANC_1']);
        // (2) Empreintes : comme à 1.172.0.
        expect(Object.keys(REFERENCE.zip.empreintes).length, 'la référence n\'est pas vide').toBeGreaterThan(5);
        expect(saufT2(r.empreintes)).toEqual(saufT2(sauf1012(REFERENCE.zip.empreintes)));
        verifierProductionsSansLeDemo(r);
        expect(r.avant.demo_groupeEtudiants, '#1012 : l\'espace neuf a un groupe démo').toBeDefined();
        expect(r.apres.demo_groupeEtudiants, '#1012 : le groupe démo de l\'espace n\'est pas vidé').toBe(r.avant.demo_groupeEtudiants);
        expect(blobs).toEqual(REFERENCE.zip.blobs);
        expect(r.bilan).toBe(bilanT2(bilan1012(REFERENCE.zip.bilan)));
        expect(r.fenetre.cases).toEqual(casesT2(REFERENCE.zip.cases));
        expect(r.fenetre.etiquette).toBe(REFERENCE.zip.etiquette);
    });

    // LES MOTS (validés par Grégoire, 30 sept.) : la fenêtre ouvre l'ancien fichier sans le
    // nommer. Trois sources, trois étiquettes ; aucune ne dit l'ancien terme.
    test('la fenêtre ne nomme plus l\'ancien fichier : « Fichier personnel », « C\'est mon propre fichier »', async ({ page }) => {
        test.setTimeout(90000);
        page.on('dialog', (d) => d.accept().catch(() => {}));
        const ANCIEN_TERME = /copies?\s+de\s+secours/i;
        const fichier = path.join(FIXTURES, 'copie-de-secours.json');

        // (a) Le fichier est le mien (même enseignant·e ici et dans le fichier).
        await demarrer(page);
        await page.evaluate(() => db.setSync('infoCours', { enseignant: 'Camille Tremblay-Fictive' }));
        await deposerParOuvrirUnCodex(page, fichier);
        const mien = await lireFenetre(page);
        expect(mien.etiquette).toBe('Fichier personnel');
        expect(mien.texte.length, 'la fenêtre n\'est pas vide').toBeGreaterThan(300);
        expect(mien.texte).not.toMatch(ANCIEN_TERME);
        await page.evaluate(() => fermerModalPreviewConfigComplete());

        // (b) Sur un appareil neuf (aucun profil ici) : le prénom de l'auteur·e.
        await page.evaluate(() => db.setSync('infoCours', {}));
        await deposerParOuvrirUnCodex(page, fichier);
        const neuf = await lireFenetre(page);
        expect(neuf.etiquette).toBe('Restauration de camille');
        expect(neuf.texte.length).toBeGreaterThan(300);
        expect(neuf.texte).not.toMatch(ANCIEN_TERME);
        await page.evaluate(() => fermerModalPreviewConfigComplete());

        // (c) Un fichier sans auteur·e (dérivé du témoin, à l'exécution) : la case de confirmation.
        const contenu = JSON.parse(fs.readFileSync(fichier, 'utf8'));
        delete contenu.infoCours;
        const sansAuteur = test.info().outputPath('ancien-fichier-sans-auteur.json');
        fs.writeFileSync(sansAuteur, JSON.stringify(contenu));
        await deposerParOuvrirUnCodex(page, sansAuteur);
        const inconnu = await lireFenetre(page);
        expect(inconnu.etiquette).toBe('Source inconnue');
        expect(inconnu.confirmation).toBe('C\'est mon propre fichier – Je confirme qu\'il m\'appartient');
        expect(inconnu.texte.length).toBeGreaterThan(300);
        expect(inconnu.texte).not.toMatch(ANCIEN_TERME);
    });
});
