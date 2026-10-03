// #892 (20 sept. 2026) — « Proposer un nettoyage » n'efface que ce qui est déjà exporté.
//
// Par le VRAI GESTE, sous WebKit : l'espace est dit presque plein, le bouton de
// l'alerte ouvre une liste nommée ; « Annuler » ne retire rien ; le bouton de
// retrait ne retire que les copies exportées, et le compte annoncé est le compte
// retiré. Sans aucune copie exportée, l'écran n'offre aucun retrait.
//
// Le stock est semé par l'API de l'application (`sauvegarderFichiersTravaux`) :
// le pack démo ne porte aucun fichier de travaux (mesuré le 20 sept.). Les blobs
// ne sont pas semés — WebKit refuse un Blob en IndexedDB sous file:// — : on
// enveloppe `db.deleteBlob` pour LIRE ce qui est demandé à l'effacement.
//
// Break-tests (rougis le 20 sept. 2026) :
//   1. garde de l'écrivain retirée ET sélection retombée sur la moitié la plus
//      ancienne → « seules les copies exportées partent » rougit ;
//   2. la sortie « aucun exporté » retirée → le second essai rougit.

import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1007, second lot (3 oct. 2026) : ce banc ne juge pas le codex proposé avant une suppression
// (jugé par 1007-propose-codex-avant-suppression.spec.js). Doublure « codex à jour » : la fenêtre
// qui propose ne paraît pas, et le geste se déroule comme avant le lot.
test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.Codex) window.Codex.proposerAvantSuppression = async () => true;
        });
    });
});

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

const MO = 1024 * 1024;
const F = (id, champs) => Object.assign({
    id, etudiantDA: '1234567', productionId: 'P892', groupeCoursId: '', nomFichier: id + '.pdf',
    typeMIME: 'application/pdf', tailleFichier: MO, dateImport: '2026-09-01T12:00:00.000Z',
    blobStatut: 'present', statut: 'actif'
}, champs);

// Du plus ancien au plus récent à l'import : l'ancien critère prenait les TROIS
// premiers (la moitié de cinq, arrondie) — dont une copie jamais exportée.
const STOCK = [
    F('FT_jamais', { dateImport: '2026-08-25T12:00:00.000Z' }),
    F('FT_sansdate', { dateImport: '2026-08-26T12:00:00.000Z', blobStatut: 'exporte' }),
    F('FT_dix_sept', { dateImport: '2026-08-27T12:00:00.000Z', blobStatut: 'exporte', dateExport: '2026-09-10T15:00:00.000Z' }),
    F('FT_avant_hier', { dateImport: '2026-08-28T12:00:00.000Z', blobStatut: 'exporte', dateExport: '2026-09-18T15:00:00.000Z', tailleFichier: 2 * MO }),
    F('FT_hier', { dateImport: '2026-08-29T12:00:00.000Z', blobStatut: 'exporte', dateExport: '2026-09-19T15:00:00.000Z' })
];

async function ouvrirEcranPresquePlein(page, stock) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.naviguerVers === 'function'
        && typeof window.travauxUI === 'object' && typeof window.travauxStockage === 'object');
    await page.evaluate((fichiers) => {
        window.travauxStockage.sauvegarderFichiersTravaux(fichiers);
        // Une evaluation pour (1234567, P892) : chaque copie du stock y est rattachee.
        window.sauvegarderDonneesSelonMode('evaluationsSauvegardees',
            [{ id: 'EVAL_892', etudiantDA: '1234567', productionId: 'P892', noteFinale: 80 }]);
        // L'espace est dit presque plein : c'est la seule condition d'apparition du bouton.
        window.travauxStockage.estimerQuota = async () => ({
            utilise: 85, total: 100, pourcentage: 0.85, alerteQuota: true,
            utiliseFormate: '85.0 Mo', totalFormate: '100.0 Mo'
        });
        window.__blobsEffaces = [];
        const effacer = window.db.deleteBlob.bind(window.db);
        window.db.deleteBlob = async (id) => { window.__blobsEffaces.push(id); return effacer(id); };
        window.naviguerVers('evaluations', 'exporter');
    }, stock);
    await page.waitForFunction(() => {
        const q = document.getElementById('travaux-quota-info');
        return q && q.querySelector('[data-action="travauxUI.proposerNettoyage"]');
    });
}

const lireStock = (page) => page.evaluate(() => JSON.stringify(window.travauxStockage.obtenirFichiersTravaux()));
const lireModale = (page) => page.evaluate(() => {
    const m = document.getElementById('pipeline-modal-overlay');
    if (!m) return null;
    return {
        titre: m.querySelector('.modal-titre').textContent.trim(),
        lignes: [...m.querySelectorAll('.travaux-nettoyage-liste li')].map((li) => ({
            id: li.dataset.fichierId, texte: li.textContent.replace(/\s+/g, ' ').trim()
        })),
        boutons: [...m.querySelectorAll('.modal-actions button')].map((b) => b.textContent.trim()),
        texte: m.querySelector('.modal-contenu').textContent.replace(/\s+/g, ' ').trim()
    };
});

test('#892 · la liste est vue ; annuler ne retire rien ; seules les copies exportées partent', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    // Aucun dialogue natif ne doit paraître : l'ancien `confirm` est parti.
    const dialogues = [];
    page.on('dialog', async (d) => { dialogues.push(d.message()); await d.dismiss(); });

    await ouvrirEcranPresquePlein(page, STOCK);
    const stockInitial = await lireStock(page);

    await page.locator('[data-action="travauxUI.proposerNettoyage"]').click();
    await page.waitForSelector('#pipeline-modal-overlay .travaux-nettoyage-liste');
    const modale = await lireModale(page);

    expect(modale.titre).toBe('Libérer de l\'espace');
    expect(modale.lignes.map((l) => l.id), 'seules les deux copies exportées depuis le 16 septembre').toEqual(['FT_avant_hier', 'FT_hier']);
    expect(modale.lignes[0].texte).toMatch(/2\.0 Mo · exportée le 18 septembre 2026/);
    expect(modale.lignes[1].texte).toMatch(/1\.0 Mo · exportée le 19 septembre 2026/);
    expect(modale.boutons).toEqual(['Annuler', 'Retirer ces 2 copies (3.0 Mo)']);
    expect(modale.texte).toContain('Ces copies ont déjà été exportées : leur fichier existe ailleurs, sur ton ordinateur.');
    expect(modale.texte).toContain('1 copie porte une marque d\'exportation antérieure au 16 septembre 2026, que l\'application ne garantit pas.');
    // Les deux copies proposées sont évaluées : l'écran dit ce que leur évaluation devient.
    expect(await page.evaluate(() => window.obtenirDonneesSelonMode('evaluationsSauvegardees').length), 'témoin : l\'évaluation semée est lue').toBe(1);
    expect(modale.texte).toContain('2 de ces copies sont évaluées. Leur évaluation reste : la note, la grille et la rétroaction ne bougent pas. Seule la copie annotée ne s\'ouvrira plus ici.');

    // La liste tient dans la modale : elle défile, et le bouton reste à l'écran.
    const tenue = await page.evaluate(() => {
        const liste = document.querySelector('.travaux-nettoyage-liste');
        const bouton = [...document.querySelectorAll('#pipeline-modal-overlay .modal-actions button')].pop();
        return { defile: getComputedStyle(liste).overflowY, boutonVisible: bouton.getBoundingClientRect().height > 0 };
    });
    expect(tenue).toEqual({ defile: 'auto', boutonVisible: true });

    // ANNULER : rien n'est supprimé.
    await page.locator('#pipeline-modal-overlay .modal-actions button', { hasText: 'Annuler' }).click();
    await page.waitForFunction(() => !document.getElementById('pipeline-modal-overlay'));
    expect(await lireStock(page), 'annuler ne touche pas au stock').toBe(stockInitial);
    expect(await page.evaluate(() => window.__blobsEffaces)).toEqual([]);

    // CONFIRMER : seules les copies exportées partent, et le compte correspond.
    await page.locator('[data-action="travauxUI.proposerNettoyage"]').click();
    await page.waitForSelector('#pipeline-modal-overlay .travaux-nettoyage-liste');
    await page.locator('#pipeline-modal-overlay .modal-actions button', { hasText: 'Retirer ces 2 copies' }).click();
    await page.waitForFunction(() => window.travauxStockage.obtenirFichiersTravaux().length === 3);

    const restant = JSON.parse(await lireStock(page));
    expect(restant, 'aucune donnée réécrite hors des copies retirées').toEqual(STOCK.slice(0, 3));
    expect(await page.evaluate(() => window.__blobsEffaces)).toEqual(['FT_avant_hier', 'FT_hier']);
    expect(await page.evaluate(() => JSON.stringify(window.obtenirDonneesSelonMode('evaluationsSauvegardees'))), 'l\'évaluation reste entière')
        .toBe(JSON.stringify([{ id: 'EVAL_892', etudiantDA: '1234567', productionId: 'P892', noteFinale: 80 }]));

    // L'écran est redessiné sur le stock réel.
    await page.waitForFunction(() => /3 fichiers de travaux/.test(document.getElementById('travaux-quota-info').textContent));

    expect(dialogues, 'aucun dialogue natif').toEqual([]);
    expect(erreurs, 'aucune erreur de page').toEqual([]);
});

test('#892 · aucune copie exportée : l\'écran n\'offre aucun retrait et mène à l\'exportation', async ({ page }) => {
    const dialogues = [];
    page.on('dialog', async (d) => { dialogues.push(d.message()); await d.dismiss(); });

    const sansExporte = STOCK.slice(0, 3);
    await ouvrirEcranPresquePlein(page, sansExporte);
    const stockInitial = await lireStock(page);

    await page.locator('[data-action="travauxUI.proposerNettoyage"]').click();
    await page.waitForSelector('#pipeline-modal-overlay');
    const modale = await lireModale(page);

    expect(modale.titre).toBe('Rien à retirer sans risque');
    expect(modale.lignes).toEqual([]);
    expect(modale.boutons).toEqual(['Fermer']);
    expect(modale.texte).toContain('Aucune copie de ce groupe n\'a encore été exportée : les retirer les perdrait. Exporte-les d\'abord dans « Exporter et archiver », puis reviens ici.');
    expect(modale.texte).toContain('1 copie porte une marque d\'exportation antérieure au 16 septembre 2026');

    await page.locator('#pipeline-modal-overlay .modal-actions button', { hasText: 'Fermer' }).click();
    await page.waitForFunction(() => !document.getElementById('pipeline-modal-overlay'));
    expect(await lireStock(page)).toBe(stockInitial);
    expect(await page.evaluate(() => window.__blobsEffaces)).toEqual([]);
    expect(dialogues, 'aucun dialogue natif').toEqual([]);
});
