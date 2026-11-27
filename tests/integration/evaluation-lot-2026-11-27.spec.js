import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ouvrirEspaceVide, mettreLaClasseEnPlace } from './harness/classe-de-banc.js';

// Captures : CAPTURES_PARCOURS=1 les écrit dans « plans de travail/captures-2026-11-27-evaluation/ ».
const DOSSIER = process.env.CAPTURES_PARCOURS
    ? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'plans de travail', 'captures-2026-11-27-evaluation')
    : '';

// =======================================================================
// LOT « ÉVALUATION » DU 27 NOV. 2026, À L'ÉCRAN : #598 VOLET B ET #1271
// =======================================================================
//
// Évaluation › Préparer, étape « Optimisation », sur la page réelle.
//  · #598 volet B : la case « Balance des blancs » est posée sur la ligne de « Rés. max. »,
//    cochée au départ ; décochée, la vignette « Aperçu » montre l'image sans la balance, et
//    l'import ne l'applique pas ; elle reste décochée après « Annuler tout » (comme « Rés. max. »).
//  · #1271 : la production choisie en haut tombe après « Annuler tout » : au dépôt suivant, le
//    menu revient à « — Choisir une production — » et le nom porté par le fichier propose la
//    production.
//  · Fiche 7 (décision de Grégoire du 22 nov., relayée le 27) : sous « Exporter pour Léa », une seule évaluation
//    prête, la phrase « Un seul PDF : il s'ouvrira dans un nouvel onglet. » ; l'onglet ouvert passe devant avec une page
//    d'attente habillée aux couleurs de l'application (sombre, puis clair), au nom de l'étudiant·e, puis reçoit le PDF.
// La logique est tenue par tests/unit/balance-du-lot-598-volet-b.test.js, tests/unit/production-du-lot-1271.test.js
// et tests/unit/onglet-du-pdf-attente.test.js. Données manifestement fictives (règle 6) : la classe
// du banc (classe-de-banc.js), deux productions « Journal 3 » et « Journal 4 ».

const PRODUCTIONS = [
    { id: 'PROD_journal3', titre: 'Journal 3' },
    { id: 'PROD_journal4', titre: 'Journal 4' }
];

/** Dépose une page jaunie (la balance des blancs la blanchit) au nom de Léa. */
async function deposer(page, nom, da, production) {
    const dt = await page.evaluateHandle(async ([n, d, p]) => {
        const t = new DataTransfer();
        const c = document.createElement('canvas');
        c.width = 300; c.height = 390;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#e8d8a0'; ctx.fillRect(0, 0, 300, 390);
        ctx.fillStyle = '#302010'; ctx.font = 'bold 30px sans-serif';
        ctx.fillText(n, 20, 80);
        const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
        t.items.add(new File([blob], `${n}_${d}_${p}_Remis_le_2026-11-20_09h46m45s.png`, { type: 'image/png', lastModified: Date.UTC(2026, 10, 20, 14) }));
        return t;
    }, [nom, da, production]);
    await page.dispatchEvent('#travaux-drop-zone', 'drop', { dataTransfer: dt });
    await expect(page.locator('.pipeline-col-originaux .pipeline-fichier-ligne')).toHaveCount(1);
}

/** La couleur moyenne de la vignette « Aperçu » du premier fichier, une fois rendue dans sa version `cle` (« bal » ou « raw »). */
async function couleurApercu(page, cle) {
    // La cellule montre d'abord la miniature brute ; l'aperçu traité la remplace un peu plus tard.
    await page.waitForFunction((k) => {
        const f = travauxImport.obtenirFileDAttente()[0];
        const img = document.querySelector('#pipeline-preview-0 img');
        return f && f._previewCache && f._previewCache[k] && img && img.src === f._previewCache[k] && img.complete && img.naturalWidth > 0;
    }, cle);
    return page.evaluate(() => {
        const img = document.querySelector('#pipeline-preview-0 img');
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let r = 0, g = 0, b = 0;
        for (let k = 0; k < d.length; k += 4) { r += d[k]; g += d[k + 1]; b += d[k + 2]; }
        const n = d.length / 4;
        return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };
    });
}

test('Optimisation : la case « Balance des blancs » vaut pour le lot ; la production choisie tombe avec « Annuler tout »', async ({ page }) => {
    test.setTimeout(240000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirEspaceVide(page, 1180);
    await mettreLaClasseEnPlace(page);
    await page.evaluate((productions) => {
        const gc = db.getSync('groupeCoursActif', null);
        db.setSync(cle('productions'), productions.map((p) => Object.assign({ type: 'travail', ponderation: 50, coursId: gc && gc.coursId, dansBibliotheque: true }, p))); // security-ok: fixture
        if (window.backupReminder) window.backupReminder.reporterApresMiseAJourDuCodex();
        afficherSection('evaluations');
        afficherSousSection('evaluations-importer');
    }, PRODUCTIONS);
    await page.waitForFunction(() => !!document.getElementById('travaux-drop-zone'));

    // A. La case, cochée au départ, sur la ligne de « Rés. max. ».
    await deposer(page, 'Cormoran_Cleo', '2390003', 'Journal_3');
    const caseLot = page.locator('#pipeline-opt-balance-lot');
    await expect(caseLot).toBeVisible();
    await expect(caseLot).toBeChecked();
    const ligne = page.locator('.pipeline-reglages-ligne');
    await expect(ligne.locator('#pipeline-opt-dpi')).toHaveCount(1);
    await expect(ligne.locator('#pipeline-opt-balance-lot')).toHaveCount(1);
    await expect(ligne.locator('label', { has: caseLot })).toHaveText('Balance des blancs');
    const boite = await ligne.locator('label', { has: caseLot }).boundingBox();
    expect(boite.height, 'la cible tactile de l\'iPad : 44 px').toBeGreaterThanOrEqual(44);

    // B. Décochée : la vignette « Aperçu » perd la balance ; recochée : elle la retrouve.
    const avec = await couleurApercu(page, 'bal');
    await caseLot.uncheck();
    const sans = await couleurApercu(page, 'raw');
    expect(avec.b - sans.b, 'la balance blanchit la page jaunie : plus de bleu avec elle').toBeGreaterThan(20);
    expect(await page.evaluate(() => travauxUI.balanceActiveePour(travauxImport.obtenirFileDAttente()[0]))).toBe(false);
    await caseLot.check();
    expect((await couleurApercu(page, 'bal')).b).toBe(avec.b);
    await caseLot.uncheck();
    await couleurApercu(page, 'raw');

    // C. #1271 : choisir une production pour le lot, puis « Annuler tout ».
    await page.selectOption('#pipeline-select-production', 'PROD_journal4');
    await expect.poll(() => page.evaluate(() => travauxImport.getProductionGlobale())).toBe('PROD_journal4');
    await page.click('[data-action="travauxUI.annulerImport"]');
    await expect(page.locator('.pipeline-col-originaux .pipeline-fichier-ligne')).toHaveCount(0);
    expect(await page.evaluate(() => travauxImport.getProductionGlobale())).toBe('');

    // D. Le dépôt suivant : le menu revient au choix vide, le nom du fichier propose « Journal 3 » ;
    //    la case est restée décochée (retenue comme « Rés. max. »).
    await deposer(page, 'Alpaga_Alix', '2390001', 'Journal_3');
    await expect(page.locator('#pipeline-select-production')).toHaveValue('');
    expect(await page.evaluate(() => travauxImport.obtenirFileDAttente()[0].productionId)).toBe('PROD_journal3');
    await expect(page.locator('#pipeline-opt-balance-lot')).not.toBeChecked();

    // E. L'import, case décochée : la balance automatique n'est pas appelée.
    const appels = await page.evaluate(async () => {
        let n = 0;
        const vraie = travauxPreparation.autoBalanceBlancs;
        travauxPreparation.autoBalanceBlancs = async (b) => { n++; return vraie(b); };
        try { await travauxUI._executerImportPipeline(); } finally { travauxPreparation.autoBalanceBlancs = vraie; }
        return n;
    });
    expect(appels).toBe(0);
    await expect.poll(() => page.evaluate(() => travauxStockage.obtenirFichiersGroupeActif().length)).toBe(1);

    expect(erreurs).toEqual([]);
});

const ATTENTE = 'Labo Codex prépare la rétroaction de Cléo Cormoran. Le PDF s\'affichera ici. Pour revenir à l\'application, ferme cet onglet.';

/** Exporter pour Léa, une seule évaluation prête : l'onglet, sa page d'attente, puis le PDF. */
async function exporterUnSeulPdf(page, clair) {
    await page.evaluate((c) => document.body.classList.toggle('mode-clair', c), clair);
    // La synthèse attend le banc : la page d'attente se lit le temps qu'elle se prépare.
    await page.evaluate(() => {
        window.__liberer = null;
        travauxExportPDF.genererDocSyntheseSeule = () => new Promise((fin) => {
            window.__liberer = () => {
                const doc = new window.jspdf.jsPDF();
                doc.text('Synthese fictive', 20, 20);
                fin({ doc, synthese: { ajoutee: true } });
            };
        });
    });
    const ongletAttendu = page.waitForEvent('popup');
    await page.click('[data-action="travauxUI.lancerExportLea"]');
    const onglet = await ongletAttendu;
    await expect.poll(() => onglet.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim())).toBe(ATTENTE);
    const lu = await onglet.evaluate(() => ({
        fond: getComputedStyle(document.body).backgroundColor,
        texte: getComputedStyle(document.body).color,
        scripts: document.querySelectorAll('script').length,
        titre: document.title,
        largeur: (document.querySelector('meta[name="viewport"]') || {}).content
    }));
    const attendu = await page.evaluate(() => {
        const t = document.createElement('div');
        t.style.cssText = 'background:var(--surface-page);color:var(--texte-principal)';
        document.body.appendChild(t);
        const r = { fond: getComputedStyle(t).backgroundColor, texte: getComputedStyle(t).color };
        t.remove();
        return r;
    });
    expect(lu.fond, 'le fond de la page de l\'application').toBe(attendu.fond);
    expect(lu.texte, 'le texte de l\'application').toBe(attendu.texte);
    expect(lu.scripts).toBe(0);
    expect(lu.titre).toBe('Rétroaction en PDF');
    expect(lu.largeur).toBe('width=device-width, initial-scale=1');
    if (DOSSIER) {
        await onglet.setViewportSize({ width: 820, height: 1180 });
        await onglet.screenshot({ path: path.join(DOSSIER, 'onglet-attente-' + (clair ? 'clair' : 'sombre') + '-820.png') });
    }
    // Le PDF arrive dans le même onglet.
    await page.evaluate(() => window.__liberer());
    await expect.poll(() => onglet.url()).toMatch(/^blob:/);
    await onglet.close();
    return lu;
}

test('Exporter pour Léa, une seule évaluation prête : la phrase sous le bouton, l\'onglet habillé (sombre et clair), puis le PDF', async ({ page }) => {
    test.setTimeout(240000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirEspaceVide(page, 1180);
    await mettreLaClasseEnPlace(page);
    await page.evaluate(() => {
        const gc = db.getSync('groupeCoursActif', null);
        db.setSync(cle('productions'), [{ id: 'PROD_journal3', titre: 'Journal 3', type: 'travail', ponderation: 50, coursId: gc && gc.coursId, dansBibliotheque: true }]); // security-ok: fixture
        // Une seule évaluation verrouillée, sans copie : la synthèse seule, un seul PDF.
        db.setSync(cle('evaluationsSauvegardees'), [{ id: 'EVAL_banc_1', etudiantDA: '2390003', productionId: 'PROD_journal3', groupeCoursId: gc && gc.id, verrouillee: true, criteres: [] }]); // security-ok: fixture
        if (window.backupReminder) window.backupReminder.reporterApresMiseAJourDuCodex();
        afficherSection('evaluations');
        afficherSousSection('evaluations-exporter');
    });
    await page.waitForFunction(() => !!document.getElementById('travaux-archivage-lea-production'));
    await page.selectOption('#travaux-archivage-lea-production', 'PROD_journal3');
    await expect(page.locator('#travaux-lea-un-seul-pdf')).toHaveText('Un seul PDF : il s\'ouvrira dans un nouvel onglet.');
    // Sous le bouton, et pas ailleurs.
    const ordre = await page.evaluate(() => {
        const b = document.querySelector('[data-action="travauxUI.lancerExportLea"]');
        return b.nextElementSibling && b.nextElementSibling.id;
    });
    expect(ordre).toBe('travaux-lea-un-seul-pdf');

    const sombre = await exporterUnSeulPdf(page, false);
    const clair = await exporterUnSeulPdf(page, true);
    expect(clair.fond, 'le thème clair n\'a pas le fond du sombre').not.toBe(sombre.fond);
    expect(page.context().pages().length, 'l\'application reste dans son onglet').toBe(1);
    expect(erreurs).toEqual([]);
});
