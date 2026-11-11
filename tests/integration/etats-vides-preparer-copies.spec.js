import { test, expect } from '@playwright/test';
import { ouvrirEspaceVide, mettreLaClasseEnPlace } from './harness/classe-de-banc.js';
import { attendreApplication } from './harness/attendre-application.js';

// =======================================================================
// « AUCUN TRAVAIL IMPORTÉ » SUR PRÉPARER (10 nov. 2026)
// =======================================================================
//
// Rapport iPad de Grégoire (BUG_grégoire_2026-11-10_15-20-18, 1.241.0) : sur
// Évaluation › Préparer, le bandeau « Aucun travail importé » paraissait alors que
// le groupe avait des copies. etats-vides.js jugeait la page par son DOM, et
// Préparer ne montre jamais les copies importées ; le bandeau posé avant un import
// restait aussi après lui. Correctif : PR n° 15 (lot/bandeau-preparer, a0d6808).
// Le banc Vitest (etats-vides-preparer-copies-importees.test.js) tient la logique ;
// celui-ci, la page réelle sous WebKit.
//
// Pourquoi pas la démonstration : les états vides s'y taisent tous
// (`estDonneesDemoActives`) et elle n'a aucune copie. Le banc part d'une classe mise en
// place par le deuxième parcours (classe-de-banc.js), plus une production posée.
//
// Ce qui n'est pas le vrai : sous WebKit, les blobs des copies vivent dans le
// sessionStorage (WebKit refuse un Blob en IndexedDB sous file://, cf. le banc du
// parcours 4, d'où vient ce magasin) ; la production est posée en base, sans grille.
// Noms manifestement fictifs (règle 6).

const BANDEAU = '#evaluations-importer .etat-vide-banniere';

// Le magasin du banc du parcours 4 (parcours-4-recevoir-et-rendre-2026-11-09.spec.js), à l'identique.
async function magasinDeCopiesDuBanc(page) {
    if (page.context().browser().browserType().name() !== 'webkit') return;
    await page.addInitScript(() => {
        const CLE = '__banc_copies';
        const lire = () => { try { return JSON.parse(sessionStorage.getItem(CLE) || '{}'); } catch (e) { return {}; } };
        const ecrire = (o) => sessionStorage.setItem(CLE, JSON.stringify(o));
        const brancher = (db) => {
            db.storeBlob = async (enr) => {
                const u = new Uint8Array(await enr.blob.arrayBuffer());
                let bin = ''; for (let i = 0; i < u.length; i++) bin += String.fromCharCode(u[i]);
                const o = lire(); o[enr.id] = Object.assign({}, enr, { blob: null, b64: btoa(bin), type: enr.blob.type }); ecrire(o);
            };
            db.getBlob = async (id) => {
                const r = lire()[id]; if (!r) return null;
                const bin = atob(r.b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
                const enr = Object.assign({}, r, { blob: new Blob([u], { type: r.type }) }); delete enr.b64; delete enr.type; return enr;
            };
            db.deleteBlob = async (id) => { const o = lire(); delete o[id]; ecrire(o); };
            db.listBlobIds = async () => Object.keys(lire());
        };
        let interne;
        Object.defineProperty(window, 'db', { configurable: true, get: () => interne, set: (v) => { interne = v; if (v) brancher(v); } });
    });
}

async function fermerLeRappel(page) {
    await page.evaluate(() => {
        if (window.backupReminder) window.backupReminder.reporterApresMiseAJourDuCodex();
        const o = document.querySelector('#overlay-backup-reminder.actif');
        const b = o && [...o.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Plus tard');
        if (b) b.click();
    });
}

/**
 * Ouvre Évaluation › Préparer, puis fait juger la page par etats-vides.js tout de suite : le
 * même jugement que l'injection différée (350 ms après l'affichage), sans pause fixe
 * (sentinelle-pauses-apres-ouverture). L'injection différée, quand elle vient, rend le même verdict.
 */
async function ouvrirPreparer(page) {
    await page.evaluate(() => { afficherSection('evaluations'); afficherSousSection('evaluations-importer'); });
    await page.waitForFunction(() => !!document.getElementById('travaux-drop-zone'));
    await page.evaluate(() => window.etatsVides.afficherPourSousSection('evaluations-importer'));
}

const nbCopies = (page) => page.evaluate(() => (travauxStockage.obtenirFichiersGroupeActif() || []).length);

test('Préparer : sans copie, le bandeau paraît et part au premier import ; avec des copies, il ne revient pas (WebKit)', async ({ page }) => {
    test.setTimeout(240000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await magasinDeCopiesDuBanc(page);
    await ouvrirEspaceVide(page, 1180);
    await mettreLaClasseEnPlace(page);
    await page.evaluate(() => {
        const gc = db.getSync('groupeCoursActif', null);
        db.setSync(cle('productions'), [{ id: 'PROD_banc_bandeau', titre: 'Journal fictif', type: 'travail', ponderation: 100, coursId: gc && gc.coursId, dansBibliotheque: true }]); // security-ok: fixture de test
    });
    await fermerLeRappel(page);

    // 1. Un groupe sans copie : le bandeau paraît (contre-épreuve : le correctif ne l'a pas muet).
    expect(await nbCopies(page)).toBe(0);
    await ouvrirPreparer(page);
    await expect(page.locator(BANDEAU)).toHaveCount(1);
    await expect(page.locator(BANDEAU)).toContainText('Aucun travail import');

    // 2. Une photo déposée : la file d'import la porte, le bandeau part.
    const dt = await page.evaluateHandle(async () => {
        const c = document.createElement('canvas');
        c.width = 300; c.height = 390;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 300, 390);
        ctx.fillStyle = '#202020'; ctx.fillRect(30, 30, 150, 20);
        const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
        const d = new DataTransfer();
        d.items.add(new File([blob], 'IMG_0101.png', { type: 'image/png', lastModified: Date.UTC(2026, 10, 10, 15) }));
        return d;
    });
    await page.dispatchEvent('#travaux-drop-zone', 'drop', { dataTransfer: dt });
    await expect(page.locator('.pipeline-col-originaux .pipeline-fichier-ligne')).toHaveCount(1);
    await expect(page.locator(BANDEAU), 'une photo en file : le bandeau part').toHaveCount(0);

    // 3. La production, l'élève, puis l'import.
    await page.selectOption('.pipeline-production-selecteur select', 'PROD_banc_bandeau');
    await page.locator('.pipeline-fichier-ligne').first().click();
    const champ = page.locator('.pipeline-input-etudiant');
    await champ.click();
    await champ.fill('2390001');
    await page.locator('.pipeline-autocomplete-item[data-param2="2390001"]').dispatchEvent('mousedown');
    // Le clic qu'on éprouve : l'import réel, qui redessine Préparer (fin-de-session §4.1 bis).
    await page.click('[data-action="travauxUI.appliquerEtImporter"]');
    await expect(page.locator('.modal-overlay.actif')).toContainText('1 fichier(s) seront importés');
    await page.locator('.modal-overlay.actif button', { hasText: 'Oui, importer' }).click();
    await page.waitForFunction(() => travauxImport.obtenirFileDAttente().length === 0 && !travauxImport.importEnCours, null, { timeout: 60000 });
    await expect.poll(() => nbCopies(page), { message: 'la copie est enregistrée' }).toBe(1);

    // 4. Retour sur Préparer (l'import mène à la liste) : la file est vide, le groupe a une copie, aucun bandeau.
    await ouvrirPreparer(page);
    await expect(page.locator('.pipeline-col-originaux .pipeline-fichier-ligne')).toHaveCount(0);
    await expect(page.locator(BANDEAU), 'un groupe qui a une copie : aucun bandeau sur Préparer').toHaveCount(0);

    // 5. Rechargé, comme une session qui rouvre le lendemain : toujours aucun bandeau.
    await page.reload();
    await attendreApplication(page);
    await fermerLeRappel(page);
    expect(await nbCopies(page)).toBe(1);
    await ouvrirPreparer(page);
    await expect(page.locator(BANDEAU), 'rechargé : aucun bandeau').toHaveCount(0);

    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});
