import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #881 (16 septembre 2026) — « J'ai supprimé des doublons individuels dans la section
// "Exporter et archiver", mais ils demeurent dans le carrousel de l'annotation et de l'évaluation. »
//
// Cause : au retour sur « Annoter et évaluer » avec une copie ouverte, `initialiserModuleTravaux`
// (cas 1) ne régénérait la bande de badges QUE si elle était vide. Elle ne l'est jamais après un
// aller-retour : les badges d'avant la suppression restaient.
//
// Même copie de banc que #868 : `recupererBlob` enveloppé (PNG d'un pixel), WebKit refusant un Blob
// dans IndexedDB en contexte éphémère. La suppression passe par la vraie modale de corbeille.
// Aucun `page.click` ni `waitForTimeout` : `el.click()` et attentes de RENDUS.

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];

async function monter(page) {
    const suivi = { dialogues: [], erreurs: [] };
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('dialog', (d) => { suivi.dialogues.push(d.message()); d.dismiss().catch(() => {}); });
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) suivi.erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) suivi.erreurs.push(m); }
    });

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherSousSection === 'function'
        && window.travauxUI && window.travauxStockage && typeof window.db !== 'undefined');
    await page.evaluate((png) => {
        const t = 'test881';
        window.db.setSync('trimestres', [{ id: t, nom: 'Trimestre test', actif: true }]);
        window.db.setSync('trimestreActif', t);
        const coursId = 'cours-881';
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]); // security-ok: fixture de test
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_881' }); // security-ok: fixture de test
        window.db.setSync('groupeCoursActif', { id: 'GC_881', trimestreId: t });
        window.db.setSync(t + '_groupesCours', [{ id: 'GC_881', trimestreId: t, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(window.cle('groupeEtudiants'), [ // security-ok: fixture de test
            { da: 'TEST881A', nom: 'Roy', prenom: 'Camille', groupe: '01', coursId },
            { da: 'TEST881B', nom: 'Gagnon', prenom: 'Léa', groupe: '01', coursId }
        ]);
        window.db.setSync(window.cle('productions'), [ // security-ok: fixture de test
            { id: 'p881', titre: 'Analyse 1', type: 'travail', ponderation: 100 }
        ]);
        const copie = (id, da, jour) => ({
            id, etudiantDA: da, productionId: 'p881', coursId, groupeCoursId: 'GC_881',
            nomFichier: id + '.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: `2026-09-1${jour}T12:00:00.000Z`,
            dateModification: `2026-09-1${jour}T12:00:00.000Z`, source: 'import-local', importePar: 'single', statut: 'actif'
        });
        // Camille a une copie ; Léa en a trois (les « doublons » du rapport).
        window.db.setSync(window.cle('fichiersTravaux'), [ // security-ok: fixture de test
            copie('FT881A', 'TEST881A', 1), copie('FT881B1', 'TEST881B', 2), copie('FT881B2', 'TEST881B', 3), copie('FT881B3', 'TEST881B', 4)
        ]);
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const blob = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return /^FT881/.test(id) ? blob : original.apply(this, arguments); };
        window.afficherSection('evaluations');
        window.afficherSousSection('evaluations-annoter');
    }, PNG);
    return suivi;
}

const badgesDuCarrousel = (page) => page.evaluate(() =>
    Array.from(document.querySelectorAll('.annot-toolbar-fichiers [data-fichier-id]')).map((b) => b.getAttribute('data-fichier-id')));

async function ouvrirCopie(page, id) {
    await page.waitForFunction(() => !!document.querySelector('#evaluations-contenu-fichiers'), null, { timeout: 10000 });
    await page.evaluate((fid) => window.travauxUI.ouvrirFichier(fid), id);
    await page.waitForFunction((fid) => {
        const fa = window.travauxVisionneuse.getFichierActuel();
        return fa && fa.id === fid && document.querySelectorAll('.annot-toolbar-fichiers [data-fichier-id]').length === 4;
    }, id, { timeout: 10000 });
}

/** Le geste de Grégoire : « Exporter les travaux », corbeille d'un badge, confirmer. */
async function jeterDepuisArchivage(page, id) {
    await page.evaluate(() => window.afficherSousSection('evaluations-exporter'));
    const badge = `#evaluations-contenu-archivage [data-action="travauxUI.supprimerFichierBadge"][data-param="${id}"]`;
    await page.waitForFunction((s) => !!document.querySelector(s), badge, { timeout: 10000 });
    await page.evaluate((s) => document.querySelector(s).click(), badge);
    await page.waitForFunction(() => !!document.getElementById('supprimer-fichier-btn-confirmer'), null, { timeout: 5000 });
    await page.evaluate(() => document.getElementById('supprimer-fichier-btn-confirmer').click());
    await page.waitForFunction((s) => !document.querySelector(s), badge, { timeout: 5000 });
}

test('Porte #881 · une copie jetée depuis « Exporter les travaux » quitte le carrousel', async ({ page }) => {
    const suivi = await monter(page);
    await ouvrirCopie(page, 'FT881A');

    await jeterDepuisArchivage(page, 'FT881B2');
    await page.evaluate(() => window.afficherSousSection('evaluations-annoter'));

    // AVANT le correctif : la bande gardait ses quatre badges, et cette attente expirait.
    await page.waitForFunction(() => {
        const ids = Array.from(document.querySelectorAll('.annot-toolbar-fichiers [data-fichier-id]')).map((b) => b.getAttribute('data-fichier-id'));
        return ids.length === 3 && !ids.includes('FT881B2');
    }, null, { timeout: 10000 });
    expect((await badgesDuCarrousel(page)).sort()).toEqual(['FT881A', 'FT881B1', 'FT881B3']);
    // La copie ouverte le reste, et son badge est marqué actif.
    expect(await page.evaluate(() => window.travauxVisionneuse.getFichierActuel().id)).toBe('FT881A');
    expect(await page.evaluate(() => !!document.querySelector('.annot-toolbar-fichiers [data-fichier-id="FT881A"].actif'))).toBe(true);
    // Le compteur du menu des productions suit.
    expect(await page.evaluate(() => document.querySelector('.annot-toolbar-production select').textContent)).toContain('(2 él. · 3 fich.)');

    expect(suivi.dialogues).toEqual([]);
    expect(suivi.erreurs, suivi.erreurs.join(' | ')).toEqual([]);
});

test('Porte #881 · la copie OUVERTE jetée depuis « Exporter les travaux » n\'est pas rouverte', async ({ page }) => {
    const suivi = await monter(page);
    await ouvrirCopie(page, 'FT881B2');

    await jeterDepuisArchivage(page, 'FT881B2');
    await page.evaluate(() => window.afficherSousSection('evaluations-annoter'));

    await page.waitForFunction(() => {
        const ids = Array.from(document.querySelectorAll('.annot-toolbar-fichiers [data-fichier-id]')).map((b) => b.getAttribute('data-fichier-id'));
        return ids.length === 3 && !ids.includes('FT881B2');
    }, null, { timeout: 10000 });
    expect((await badgesDuCarrousel(page)).sort()).toEqual(['FT881A', 'FT881B1', 'FT881B3']);
    // Sans la garde, le cas 1 rouvrait les palettes d'annotation sur la copie jetée, DANS LE MÊME
    // tour que la reconstruction des badges : l'absence se lit donc sans attendre (mesuré : 3 vs 0).
    expect(await page.evaluate(() => document.querySelectorAll('.palette-flottante').length)).toBe(0);

    expect(suivi.dialogues).toEqual([]);
    expect(suivi.erreurs, suivi.erreurs.join(' | ')).toEqual([]);
});
