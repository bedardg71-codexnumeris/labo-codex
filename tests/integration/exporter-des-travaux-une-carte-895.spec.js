// #895 (23 sept. 2026) — Une seule carte « Exporter des travaux ».
//
// Par le VRAI GESTE, sous WebKit : on laisse « Toutes / Tous », on clique
// « Télécharger », et on OUVRE l'archive reçue (JSZip côté Node) : tout le groupe,
// rangé par élève et par production, `_resume.json` et `_evaluations.json`
// compris ; la copie illisible est nommée dans le résumé et dans le bilan, les
// autres partent ; seules les copies parties sont marquées « exporté ». Puis
// l'autre forme et l'archive non compressée, et un filtre qui ne donne rien.
//
// Le stock est semé par l'API de l'application (`sauvegarderFichiersTravaux`) :
// le pack démo ne porte aucun fichier de travaux. WebKit refuse un Blob en
// IndexedDB sous file:// : on enveloppe `travauxStockage.recupererBlob`, qui
// rend des blobs tenus en mémoire (null pour la copie illisible).
//
// Break-tests (23 sept. 2026) : rougissent ici le refus remis, la forme ignorée,
// la compression forcée ou non lue, l'absence de marquage, les échecs hors du
// résumé, le filtre élève ignoré, le filtre vide muet, le résumé absent, la case
// décochée et la forme par défaut inversée (liste complète : sentinelle-895).

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

// Noms fictifs (règle 6 de CLAUDE.md).
const ETUDIANTS = [
    { da: '1000001', nom: 'Fictif', prenom: 'Alix' },
    { da: '1000002', nom: 'Factice', prenom: 'Sam' }
];
const PRODUCTIONS = [{ id: 'P895a', titre: 'Écrit 1' }, { id: 'P895b', titre: 'Écrit 2' }];
const F = (id, da, productionId) => ({
    id, etudiantDA: da, productionId, groupeCoursId: '', nomFichier: id + '.pdf',
    typeMIME: 'application/pdf', tailleFichier: 20000, dateImport: '2026-09-01T12:00:00.000Z',
    blobStatut: 'present', statut: 'actif'
});
// Alix : les deux productions ; Sam : Écrit 1 seulement, et sa copie est illisible.
const STOCK = [F('FT_a1', '1000001', 'P895a'), F('FT_a2', '1000001', 'P895b'), F('FT_s1', '1000002', 'P895a')];

async function ouvrirEcran(page) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.naviguerVers === 'function'
        && typeof window.travauxUI === 'object' && typeof window.travauxStockage === 'object'
        && typeof window.travauxArchivage === 'object');
    await page.evaluate(({ stock, etudiants, productions }) => {
        window.sauvegarderDonneesSelonMode('groupeEtudiants', etudiants);
        window.sauvegarderDonneesSelonMode('productions', productions);
        window.sauvegarderDonneesSelonMode('evaluationsSauvegardees',
            [{ id: 'EVAL_895', etudiantDA: '1000001', productionId: 'P895a', noteFinale: 80 }]);
        window.travauxStockage.sauvegarderFichiersTravaux(stock);
        // Contenu très compressible : la compression se voit à la taille de l'archive.
        window.travauxStockage.recupererBlob = async (id) => (id === 'FT_s1'
            ? null
            : new Blob(['%PDF-1.4 ' + id + ' ' + 'x'.repeat(20000)], { type: 'application/pdf' }));
        window.naviguerVers('evaluations', 'exporter');
    }, { stock: STOCK, etudiants: ETUDIANTS, productions: PRODUCTIONS });
    await page.waitForSelector('#travaux-archivage-forme');
}

const statuts = (page) => page.evaluate(() => Object.fromEntries(
    window.travauxStockage.obtenirFichiersTravaux().map((f) => [f.id, f.blobStatut])));

async function telecharger(page) {
    const [telechargement] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('[data-action="travauxUI.lancerArchivage"]').click()
    ]);
    const zip = await JSZip.loadAsync(readFileSync(await telechargement.path()));
    return { nom: telechargement.suggestedFilename(), zip, taille: readFileSync(await telechargement.path()).length };
}

function suivreErreursEtDialogues(page) {
    const erreurs = [];
    const dialogues = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('dialog', async (d) => { dialogues.push(d.message()); await d.accept(); });
    return { erreurs, dialogues };
}

test('#895 · « Toutes / Tous » + « Télécharger » : l\'archive de tout le groupe, par élève et par production', async ({ page }) => {
    const { erreurs, dialogues } = suivreErreursEtDialogues(page);
    await ouvrirEcran(page);

    // Une seule carte d'export par ZIP ; les réglages sont à leur défaut.
    const carte = await page.evaluate(() => ({
        titres: [...document.querySelectorAll('.travaux-archivage-carte > h4')].map((h) => h.textContent.trim()),
        production: document.getElementById('travaux-archivage-production').value,
        etudiant: document.getElementById('travaux-archivage-etudiant').value,
        forme: document.getElementById('travaux-archivage-forme').value,
        compression: document.getElementById('travaux-archivage-compression').checked
    }));
    expect(carte).toEqual({ titres: ['Exporter des travaux', 'Export Léa'], production: '', etudiant: '', forme: 'etudiant-production', compression: true });

    const { nom, zip } = await telecharger(page);
    expect(nom).toMatch(/^travaux_.+_\d{4}-\d{2}-\d{2}\.zip$/);
    const fichiers = Object.values(zip.files).filter((f) => !f.dir).map((f) => f.name).sort();
    expect(fichiers).toEqual([
        'Fictif_Alix_1000001/Écrit 1/FT_a1.pdf',
        'Fictif_Alix_1000001/Écrit 2/FT_a2.pdf',
        '_evaluations.json',
        '_resume.json'
    ]);
    expect(await zip.file('Fictif_Alix_1000001/Écrit 1/FT_a1.pdf').async('string')).toContain('%PDF-1.4 FT_a1');
    const resume = JSON.parse(await zip.file('_resume.json').async('string'));
    expect(resume).toMatchObject({ nbFichiers: 3, nbEtudiants: 2, nbProductions: 2, nbEchecs: 1 });
    expect(resume.echecs[0]).toContain('Factice_Sam_1000002 / FT_s1.pdf — Blob introuvable');
    expect(JSON.parse(await zip.file('_evaluations.json').async('string')).map((e) => e.id)).toEqual(['EVAL_895']);

    // Le bilan nomme la perte ; aucun refus.
    await expect.poll(() => dialogues.length).toBe(1);
    expect(dialogues[0]).toContain('2 exporté(s) sur 3, 1 en échec');
    expect(dialogues[0]).not.toContain('Sélectionne au moins');

    // « Exporté » : ce qui est parti, et seulement là.
    await expect.poll(() => statuts(page)).toEqual({ FT_a1: 'exporte', FT_a2: 'exporte', FT_s1: 'present' });
    expect(erreurs).toEqual([]);
});

test('#895 · « Par étudiant·e », sans compression, un·e élève : l\'autre forme, l\'archive plus lourde', async ({ page }) => {
    const { erreurs, dialogues } = suivreErreursEtDialogues(page);
    await ouvrirEcran(page);

    const compresse = await telecharger(page);
    await expect.poll(() => dialogues.length).toBe(1);

    await page.selectOption('#travaux-archivage-etudiant', '1000001');
    await page.selectOption('#travaux-archivage-forme', 'etudiant');
    await page.locator('#travaux-archivage-compression').uncheck();
    const brut = await telecharger(page);

    expect(brut.nom).toBe('travaux_Fictif_Alix.zip');
    const fichiers = Object.values(brut.zip.files).filter((f) => !f.dir).map((f) => f.name).sort();
    expect(fichiers).toEqual(['Fictif_Alix_1000001/FT_a1.pdf', 'Fictif_Alix_1000001/FT_a2.pdf', '_evaluations.json', '_resume.json']);
    // Deux copies de ~20 Ko stockées brutes, contre trois compressées.
    expect(brut.taille).toBeGreaterThan(40000);
    expect(compresse.taille).toBeLessThan(10000);
    expect(dialogues, 'aucun échec pour Alix : rien à dire').toHaveLength(1);
    expect(erreurs).toEqual([]);
});

test('#895 · un filtre sans fichier ne télécharge rien et le dit dans la carte, sans dialogue', async ({ page }) => {
    const { erreurs, dialogues } = suivreErreursEtDialogues(page);
    let telechargements = 0;
    page.on('download', () => { telechargements++; });
    await ouvrirEcran(page);

    // Sam n'a aucune copie d'« Écrit 2 ».
    await page.selectOption('#travaux-archivage-etudiant', '1000002');
    await page.selectOption('#travaux-archivage-production', 'P895b');
    await page.locator('[data-action="travauxUI.lancerArchivage"]').click();
    await expect(page.locator('#travaux-texte-progression')).toHaveText('Aucun fichier trouvé pour ces critères.');
    await page.waitForTimeout(300);
    expect(telechargements).toBe(0);
    expect(dialogues).toEqual([]);
    expect(await statuts(page)).toEqual({ FT_a1: 'present', FT_a2: 'present', FT_s1: 'present' });
    expect(erreurs).toEqual([]);
});
