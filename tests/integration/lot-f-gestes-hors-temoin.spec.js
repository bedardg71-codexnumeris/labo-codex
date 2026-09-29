import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// LOT F — LES GESTES QUI ÉCRIVENT HORS DU TÉMOIN COMMUN LE DISENT AU CODEX (29 sept. 2026)
// =======================================================================
//
// Relecture de Cowork (29 sept.) : un geste qui écrit en `db` direct, sans passer par
// `sauvegarderDonneesSelonMode` / `modifierEtAnnoncer` / `ecrireEtAnnoncer`, laissait le codex
// dire « à jour » à tort. Inventaire : 165 sites de gestes, raccordés par
// `signalerEcritureUsager(cle)` (même événement `donnees-enregistrees`, rien d'affiché).
//
// Un essai par famille : le geste émet au moins un signal ; les chemins de la machine
// (`discret`, sauvegarde qui ne change rien, ouverture) n'en émettent aucun. Le dernier essai
// vérifie la chaîne entière : le témoin du codex passe à « pas à jour ».
//
// Pack démo, noms fictifs.

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

async function demarrerDemo(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
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
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
        window.__signaux = [];
        window.addEventListener('donnees-enregistrees', (e) => window.__signaux.push(e.detail && e.detail.cle));
    });
}

/** Rend le nombre de signaux émis pendant `geste` (une fonction évaluée dans la page). */
async function signauxPendant(page, geste, arg) {
    await page.evaluate(() => { window.__signaux.length = 0; });
    await page.evaluate(geste, arg);
    await page.waitForTimeout(150);
    return page.evaluate(() => window.__signaux.length);
}

test.describe('Lot F — gestes hors témoin raccordés au codex', () => {
    test.setTimeout(180000);

    test('un geste par famille signale ; la machine se tait', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await demarrerDemo(page);

        // Copies et annotations (travaux-stockage).
        expect(await signauxPendant(page, () => travauxStockage.ajouterFichierTravail({
            nomFichier: 'copie-banc.pdf', da: 'DEMO001', productionId: 'P_BANC', type: 'application/pdf', taille: 10
        }))).toBeGreaterThan(0);
        expect(await signauxPendant(page, () => travauxStockage.sauvegarderAnnotationFichier({ id: 'AN_BANC', fichierId: 'F_BANC', pages: {} }))).toBeGreaterThan(0);
        expect(await signauxPendant(page, () => travauxStockage.sauvegarderAnnotationFichier({ id: 'AN_BANC', fichierId: 'F_BANC', pages: {} }, { discret: true }))).toBe(0);
        expect(await signauxPendant(page, async () => {
            db.setSync(cle('corbeilleFichiers'), [{ id: 'FT_VIEUX', dateSuppression: '2020-01-01T00:00:00.000Z' }]);
            await travauxStockage.purgerCorbeilleExpiree();
        })).toBe(0);

        // Bibliothèque de tampons.
        expect(await signauxPendant(page, () => tamponsBibliotheque.ajouterALaBibliotheque({ id: 'TAMPON_BANC', nom: 'Tampon du banc', categorie: 'observations' }))).toBeGreaterThan(0);

        // Carte d'alignement : une carte qui change signale ; la même, non ; l'onglet, non.
        expect(await signauxPendant(page, () => planificationDonnees.sauvegarderCarte('carte_banc', { noeuds: [{ id: 'n1' }], liens: [] }))).toBeGreaterThan(0);
        expect(await signauxPendant(page, () => planificationDonnees.sauvegarderCarte('carte_banc', { noeuds: [{ id: 'n1' }], liens: [] }))).toBe(0);
        expect(await signauxPendant(page, () => planificationDonnees.sauvegarderIndex(planificationDonnees.getIndex() || { active: 'carte_banc', cartes: [] }, { discret: true }))).toBe(0);

        // Suivi longitudinal : retirer un·e élève du registre (un registre posé par le banc ;
        // le pack démo n'a pas d'élève inscriptible, `inscrire` le refuse sans écrire).
        expect(await signauxPendant(page, async () => {
            db.setSync(registreLongitudinal.NOM_CLE, {
                format: registreLongitudinal.FORMAT, version: registreLongitudinal.VERSION,
                eleves: { BANC001: { da: 'BANC001', nom: 'Témoin', prenom: 'Daniel', dossiers: [], resultatsUlterieurs: [] } },
                modeles: { grilles: {}, echelles: {} }
            });
            const r = await registreLongitudinal.retirerDuRegistre('BANC001');
            if (!r.ok) throw new Error('retrait refusé : le banc ne mesure rien');
        })).toBeGreaterThan(0);

        // Cadre : un cours retiré de la sélection.
        expect(await signauxPendant(page, async () => {
            const c = (db.getSync('cours', []) || []).find((x) => x && x.dansBibliotheque !== false) || (db.getSync('cours', []) || [])[0];
            await retirerCoursDeBibliotheque(c.id);
        })).toBeGreaterThan(0);

        // Productions : descendre la première (monter la deuxième).
        expect(await signauxPendant(page, async () => {
            const prods = db.getSync(cle('productions'), []) || [];
            await monterEvaluation(prods[1].id);
        })).toBeGreaterThan(0);
        // Monter la première ne change rien : aucun signal.
        expect(await signauxPendant(page, async () => {
            const prods = db.getSync(cle('productions'), []) || [];
            await monterEvaluation(prods[0].id);
        })).toBe(0);

        // Pratiques et modalités.
        expect(await signauxPendant(page, () => {
            const p = (db.getSync(cle('pratiquesConfigurables'), []) || [])[0];
            definirPratiqueParDefaut(p.id);
        })).toBeGreaterThan(0);
        expect(await signauxPendant(page, () => modalitesEvaluation.modifier((m) => { m.__banc = 1; }))).toBeGreaterThan(0);
        expect(await signauxPendant(page, () => modalitesEvaluation.modifier((m) => { m.__banc = 2; }, { discret: true }))).toBe(0);

        // Dossiers de classement.
        expect(await signauxPendant(page, () => repertoiresBibliotheque.creer('Dossier du banc', 'pratiques'))).toBeGreaterThan(0);

        // Seuils d'interprétation remis aux valeurs par défaut.
        expect(await signauxPendant(page, () => reinitialiserSeuilsInterpretation())).toBeGreaterThan(0);

        // Notes libres du rapport.
        expect(await signauxPendant(page, () => {
            const da = (db.getSync(cle('groupeEtudiants'), []) || [])[0].da;
            enregistrerNotesRapport(da, { value: 'Note du banc' });
        })).toBeGreaterThan(0);

        // Duplication (BibliothequeUI) : la copie écrite signale.
        expect(await signauxPendant(page, async () => {
            db.setSync('banc_lotF_liste', [{ id: 'SRC_1', nom: 'Source' }]);
            await BibliothequeUI.dupliquerVersBibliotheque({
                id: 'SRC_1', prefixeId: 'BANC_',
                modifierListe: (m) => db.modifier('banc_lotF_liste', m, []),
                nommerLaCopie: (c) => { c.nom = 'Copie'; }, forgerProvenance: () => null
            });
        })).toBeGreaterThan(0);

        expect(erreurs).toEqual([]);
    });

    test('la chaîne entière : un geste hors témoin rend le codex « pas à jour »', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await demarrerDemo(page);
        await page.evaluate(() => db.setSync('_codex_etat', { actif: true, nom: 'Codex du banc', derniereSauvegarde: new Date().toISOString(), modificationsDepuis: null, manifeste: null, temoinFiable: true }));
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(4000);
        expect(await page.evaluate(() => Codex.etat().modificationsNonSauvees)).toBe(false);
        await page.evaluate(() => planificationDonnees.sauvegarderCarte('carte_chaine', { noeuds: [{ id: 'x' }], liens: [] }));
        expect(await page.evaluate(() => Codex.etat().modificationsNonSauvees)).toBe(true);
        expect(erreurs).toEqual([]);
    });
});
