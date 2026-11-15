import { test, expect } from '@playwright/test';
import { ouvrirCopie, attendre } from './harness/banc-copie-annotation.js';

// =======================================================================
// 15 nov. 2026 — LE CARROUSEL D'ANNOTER SUIT LES COPIES
// =======================================================================
//
// Bug vécu par Grégoire (iPad, 1.247.0, rapport de 8 h 50) : la copie d'un élève supprimée,
// la même production réimportée pour lui ; dans Annoter, toucher sa copie ne l'affiche pas, la
// précédente reste à l'écran ; neuf fois « [Travaux-Visionneuse] Fichier introuvable » avec le
// même identifiant. Un rechargement règle tout.
//
// La cause, reproduite ici : le carrousel n'est refait que par `afficherFichiers` et par le
// retour simple dans Annoter. Arriver par l'action « Annoter » d'une ligne de la Liste saute
// ces deux chemins : le carrousel d'avant reste, avec le badge de la copie partie et sans
// celui de la copie arrivée.
//
// Élèves, production et images fictifs. Le stockage des fichiers est une mémoire du banc.

const badges = (page) => page.evaluate(() => Array.from(document.querySelectorAll('.annot-toolbar-fichiers .annot-badge')).map((b) => b.dataset.fichierId));
const ouvert = (page) => page.evaluate(() => (window.travauxVisionneuse.getFichierActuel() || {}).id);

test('une copie mise à la corbeille puis réimportée : le carrousel montre la nouvelle, et elle s’ouvre', async ({ page }) => {
    test.setTimeout(120000);
    const introuvables = [];
    page.on('console', (m) => { if (/Travaux-Visionneuse\] Fichier introuvable/.test(m.text())) introuvables.push(m.text()); });
    const suivi = await ouvrirCopie(page);

    // Un second élève fictif et sa copie.
    await page.evaluate(async () => {
        const image = (couleur) => { const cv = document.createElement('canvas'); cv.width = 400; cv.height = 600;
            const cx = cv.getContext('2d'); cx.fillStyle = couleur; cx.fillRect(0, 0, 400, 600); return new Promise((r) => cv.toBlob(r, 'image/png')); };
        window.__image = image;
        window.__blobs = new Map([['FT_B', await image('#ffeeee')]]);
        const lire = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return window.__blobs.has(id) ? window.__blobs.get(id) : lire.apply(this, arguments); };
        window.travauxStockage.stockerBlob = async (id, blob) => { window.__blobs.set(id, blob); };
        const eleves = window.db.getSync(window.cle('groupeEtudiants'));
        eleves.push({ ...eleves[0], da: 'TEST1210', nom: 'Fictivenom', prenom: 'Basile' });
        window.db.setSync(window.cle('groupeEtudiants'), eleves); // security-ok: fixture de test
        const fichiers = window.db.getSync(window.cle('fichiersTravaux'));
        fichiers.push({ ...fichiers[0], id: 'FT_B', etudiantDA: 'TEST1210', nomFichier: 'FICTIVENOM_Analyse1.png', evaluationId: '' });
        window.db.setSync(window.cle('fichiersTravaux'), fichiers); // security-ok: fixture de test
        window.travauxUI.rafraichirUI();
    });
    await attendre(page, 500);
    await page.evaluate(() => window.travauxUI.ouvrirFichier('FT_B'));
    await expect.poll(() => ouvert(page)).toBe('FT_B');
    expect((await badges(page)).sort()).toEqual(['FT651', 'FT_B']);

    // Sa copie part à la corbeille (le geste de la Liste), puis la même production est réimportée.
    await page.evaluate(() => { window.travauxStockage.deplacerEnCorbeille('FT_B'); });
    await page.evaluate(() => window.afficherSousSection('evaluations-importer'));
    await attendre(page, 800);
    const nouvelle = await page.evaluate(async () => {
        window.travauxImport.viderFileDAttente();
        window.travauxImport.ajouterFichiersEnAttente([new File([await window.__image('#eeffee')],
            'Fictivenom_Basile_TEST1210_Analyse_1__Remis_le_2026-11-02_10h00m00s.png', { type: 'image/png' })]);
        await new Promise((r) => setTimeout(r, 1500));
        await window.travauxImport.importerTous('p651-1', () => {});
        window.travauxUI.afficherImport();
        return window.travauxStockage.obtenirFichiersGroupeActif().map((f) => f.id).find((id) => id !== 'FT651');
    });
    expect(nouvelle).toBeTruthy();
    expect(nouvelle).not.toBe('FT_B');

    // Retour dans Annoter par l'action « Annoter » d'une ligne de la Liste, sur l'autre copie.
    await page.evaluate(() => window.executerActionEval({ value: 'annoter|FT651|p651-1' }));
    await expect.poll(() => ouvert(page), { timeout: 10000 }).toBe('FT651');
    await attendre(page, 1500);

    // Le carrousel montre les copies d'aujourd'hui : la nouvelle y est, celle de la corbeille n'y est plus.
    expect((await badges(page)).sort()).toEqual(['FT651', nouvelle].sort());

    // Toucher la nouvelle copie l'affiche.
    await page.locator('.annot-toolbar-fichiers .annot-badge[data-fichier-id="' + nouvelle + '"]').click();
    await expect.poll(() => ouvert(page), { timeout: 10000 }).toBe(nouvelle);
    await expect(page.locator('.annot-toolbar-fichiers .annot-badge.actif')).toHaveAttribute('data-fichier-id', nouvelle);
    expect(introuvables).toEqual([]);
    expect(suivi.erreurs).toEqual([]);
});

test('ouvrir une copie qui n’existe plus ne change rien à l’écran et ne laisse pas son badge', async ({ page }) => {
    test.setTimeout(120000);
    const introuvables = [];
    page.on('console', (m) => { if (/Travaux-Visionneuse\] Fichier introuvable/.test(m.text())) introuvables.push(m.text()); });
    await ouvrirCopie(page);
    await page.evaluate(() => window.travauxUI.ouvrirFichier('FT_PARTIE'));
    await attendre(page, 1500);
    expect(await ouvert(page)).toBe('FT651');
    await expect(page.locator('.annot-toolbar-fichiers .annot-badge.actif')).toHaveAttribute('data-fichier-id', 'FT651');
    expect(introuvables).toEqual([]);
});
