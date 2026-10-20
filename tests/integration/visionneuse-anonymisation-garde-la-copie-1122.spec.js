import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1122 (20 oct. 2026) — BASCULER L'ANONYMISATION NE FERME PLUS LA COPIE OUVERTE.
// Rapport de Grégoire (iPad, 1.209.0) : « Le travail de mon élève est disparu après avoir été
// anonymisé à l'écran. » Le gestionnaire `modeChanged` de travaux-ui.js recréait la visionneuse :
// canevas neuf, « Clique sur un fichier ci-dessus pour l'ouvrir », et la copie ne revenait pas,
// même en repassant au mode normal. Seuls les noms doivent changer.
// Aucun `page.click` ni `waitForTimeout` : appels scriptés, attentes sur l'état. Noms fictifs (règle 6).

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 't1122';

async function monter(page) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.travauxUI && window.travauxStockage
        && typeof window.travauxUI.ouvrirFichier === 'function' && typeof window.changerMode === 'function');
    await page.evaluate(({ png, T }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-1122';
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC1122', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: 'TEST1122', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC1122' }
        ]);
        window.db.setSync(T + '_productions', [
            { id: 'p1122', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: 'G1122', groupeCoursId: 'GC1122' }
        ]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'G1122', nom: 'Grille témoin', type: 'holistique',
            criteres: [{ id: 'c1', nom: 'Contenu', ponderation: 100, type: 'holistique' }] }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'E1122', nom: 'IDME', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] }]);
        window.db.setSync(T + '_fichiersTravaux', [{
            id: 'FT1122', etudiantDA: 'TEST1122', productionId: 'p1122', coursId, groupeCoursId: 'GC1122',
            nomFichier: 'FICTIF_TEST1122_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-10-01T12:00:00.000Z', dateModification: '2026-10-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC1122' });
        window.db.setSync('groupeCoursActif', { id: 'GC1122', trimestreId: T });

        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FT1122' ? copie : original.apply(this, arguments); };
    }, { png: PNG, T });
    return erreurs;
}

/** La copie est-elle à l'écran, sur LE MÊME canevas que celui où elle a été ouverte ? */
const etat = (page) => page.evaluate(() => {
    const placeholder = document.getElementById('travaux-placeholder-visionneuse');
    const fichier = window.travauxVisionneuse.getFichierActuel();
    const badge = document.querySelector('.annot-toolbar-fichiers .annot-badge[data-fichier-id="FT1122"]');
    return {
        memeCanevas: document.getElementById('travaux-canvas-document') === window.__canevas1122,
        placeholderCache: !!placeholder && placeholder.classList.contains('u-hide'),
        fichier: fichier ? fichier.id : null,
        badge: badge ? badge.textContent.replace(/\s+/g, ' ').trim() : null,
        etiquette: (document.getElementById('travaux-annot-label-etudiant') || {}).textContent || null
    };
});

const sansBruit = (erreurs) => erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m));

test('#1122 · visionneuse : basculer l\'anonymisation garde la copie ouverte, seuls les noms changent', async ({ page }) => {
    const erreurs = await monter(page);
    await page.evaluate(() => window.naviguerVers('evaluations', 'annoter'));
    // Le tableau des copies (état A) : la visionneuse ne naît qu'à l'ouverture d'une copie.
    await page.waitForFunction(() => !!document.querySelector('#evaluations-contenu-fichiers [data-fichier-id="FT1122"]'), null, { timeout: 10000 });
    await page.evaluate(() => window.travauxUI.ouvrirFichier('FT1122'));
    await page.waitForFunction(() => {
        const f = window.travauxVisionneuse.getFichierActuel();
        const etiquette = document.getElementById('travaux-annot-label-etudiant');
        return f && f.id === 'FT1122' && etiquette && /Fictif/.test(etiquette.textContent);
    }, null, { timeout: 10000 });
    await page.evaluate(() => { window.__canevas1122 = document.getElementById('travaux-canvas-document'); });

    // Mode anonymisation : le badge (bande régénérée par le retour sur l'onglet) ne dit plus le vrai nom.
    await page.evaluate(async () => { await window.changerMode('anonymisation'); });
    await page.waitForFunction(() => {
        const b = document.querySelector('.annot-toolbar-fichiers .annot-badge.actif[data-fichier-id="FT1122"]');
        return b && !/Fictif/.test(b.textContent);
    }, null, { timeout: 10000 });
    const anonyme = await etat(page);
    console.warn('[1122 anonymisation] ' + JSON.stringify(anonyme));
    expect.soft(anonyme.memeCanevas, 'la visionneuse n\'est pas recréée').toBe(true);
    expect.soft(anonyme.placeholderCache, '« Clique sur un fichier » ne revient pas').toBe(true);
    expect.soft(anonyme.fichier).toBe('FT1122');
    expect.soft(anonyme.etiquette, 'l\'étiquette de la palette suit le mode').not.toMatch(/Fictif/);

    // Retour au mode normal : la copie est toujours là, le vrai nom revient.
    await page.evaluate(async () => { await window.changerMode('normal'); });
    await page.waitForFunction(() => {
        const b = document.querySelector('.annot-toolbar-fichiers .annot-badge.actif[data-fichier-id="FT1122"]');
        return b && /Fictif/.test(b.textContent);
    }, null, { timeout: 10000 });
    const normal = await etat(page);
    console.warn('[1122 normal] ' + JSON.stringify(normal));
    expect.soft(normal.memeCanevas, 'la visionneuse n\'est pas recréée').toBe(true);
    expect.soft(normal.placeholderCache, '« Clique sur un fichier » ne revient pas').toBe(true);
    expect.soft(normal.fichier).toBe('FT1122');
    expect.soft(normal.etiquette).toMatch(/Fictif/);
    expect(sansBruit(erreurs)).toEqual([]);
});

test('#1122 · visionneuse en mode Évaluer : la copie reste, le formulaire se reconstruit dans le nouveau mode', async ({ page }) => {
    const erreurs = await monter(page);
    await page.evaluate(() => window.naviguerVers('evaluations', 'annoter'));
    await page.waitForFunction(() => !!document.querySelector('#evaluations-contenu-fichiers [data-fichier-id="FT1122"]'), null, { timeout: 10000 });
    await page.evaluate(() => window.travauxUI.ouvrirFichier('FT1122'));
    await page.waitForFunction(() => {
        const f = window.travauxVisionneuse.getFichierActuel();
        return f && f.id === 'FT1122' && !!document.getElementById('travaux-annot-label-etudiant');
    }, null, { timeout: 10000 });
    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
    await page.waitForFunction(() => {
        const l = document.getElementById('travaux-eval-label-etudiant');
        return !!document.getElementById('travaux-palette-eval-gauche') && l && /Fictif/.test(l.textContent);
    }, null, { timeout: 10000 });
    await page.evaluate(() => { window.__canevas1122 = document.getElementById('travaux-canvas-document'); });

    await page.evaluate(async () => { await window.changerMode('anonymisation'); });
    await page.waitForFunction(() => {
        const l = document.getElementById('travaux-eval-label-etudiant');
        return !!document.getElementById('travaux-palette-eval-gauche') && l && !/Fictif/.test(l.textContent) && l.textContent !== '--';
    }, null, { timeout: 10000 });
    const anonyme = await etat(page);
    console.warn('[1122 évaluer, anonymisation] ' + JSON.stringify(anonyme));
    expect.soft(anonyme.memeCanevas, 'la visionneuse n\'est pas recréée').toBe(true);
    expect.soft(anonyme.placeholderCache, '« Clique sur un fichier » ne revient pas').toBe(true);
    expect.soft(anonyme.fichier).toBe('FT1122');
    expect(sansBruit(erreurs)).toEqual([]);
});
