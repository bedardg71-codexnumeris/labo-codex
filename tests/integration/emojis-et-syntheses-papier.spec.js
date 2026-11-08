import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';
import { attendreRepos, suivreLesReactions } from './harness/attendre-repos.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// « LES EMOJIS COMME TAMPONS, ET LES SYNTHÈSES PDF DES COPIES SUR PAPIER » (8 nov. 2026, décisions de Grégoire)
// =======================================================================
//
// #1244 — un emoji devient un vrai tampon : « + Ajouter » dans « Rétroactions — Observations », l'emoji tapé dans
// « ou un emoji » ; l'application l'écrit dans une image PNG. Il garde ses couleurs (ni teinte de catégorie, ni
// inversion) ; sa phrase arrive dans la synthèse de l'étudiant·e, sous sa vignette en couleurs.
// #1245 — « Exporter pour Léa » produit aussi la synthèse seule d'une copie évaluée sur papier, nommée avec le DA ; la
// démo n'a aucune copie importée : chacune de ses évaluations est une copie sur papier.
// Le détail des règles : tests/unit/sentinelle-1245-lea-copies-sur-papier.test.js.
//
// DOSSIER_CAPTURES=<dossier> : la fenêtre avec le tampon-emoji, la synthèse qui le porte, la carte « Export Léa ».
// ⚠ Il part d'un stockage vidé (origine file:// partagée, workers: 1). Noms fictifs.

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
    page.on('dialog', (d) => d.dismiss());
    return erreurs;
}

const DOSSIER_CAPTURES = process.env.DOSSIER_CAPTURES || '';
if (DOSSIER_CAPTURES) test.use({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2 });

async function ouvrirDemo(page) {
    await suivreLesReactions(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await attendreApplication(page);
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
    await attendreApplication(page);
    await page.evaluate(() => activerModeDemo());
    await attendreRepos(page);
    await page.addStyleTag({ content: '#notifications-pile { display: none !important; }' });
}

test('#1244 · un emoji devient un tampon : image PNG, ses couleurs gardées, sa phrase dans la synthèse', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = brancherEcouteurs(page);
    await ouvrirDemo(page);
    // La catégorie a une couleur : un tampon ordinaire y serait repeint.
    await page.evaluate(() => { db.setSync('couleursCategories', { observations: '#c62828' }); });

    await page.evaluate(() => travauxOutils.ouvrirEditionRetroObservations());
    await page.locator('#modal-retro-observations [data-action="travauxOutils.ajouterTamponRetroObs"][data-param="observations"]').click();
    const ligne = page.locator('#modal-retro-observations .travaux-retro-row[data-custom="true"]').last();
    // Vidé, le champ rend à la ligne l'image d'avant l'emoji : ici, aucune (ligne neuve), et pas de drapeau.
    await ligne.locator('input[data-emoji-id]').fill('🌟');
    await ligne.locator('input[data-emoji-id]').fill('');
    const videe = await ligne.locator('img[data-img-id]').evaluate((img) => ({ src: img.getAttribute('src'), emoji: img.dataset.emoji ?? null, base64: img.dataset.base64 ?? null }));
    expect(videe, 'le champ vidé rend l\'image d\'avant').toEqual({ src: '', emoji: null, base64: null });
    await ligne.locator('input[data-emoji-id]').fill('🌟');
    await ligne.locator('input[data-nom-id]').fill('Étoile fictive');
    await ligne.locator('textarea[data-retro-id]').fill('Une idée qui brille : garde-la.');
    await expect(ligne.locator('img[data-img-id]')).toHaveAttribute('src', /^data:image\/png/);
    if (DOSSIER_CAPTURES) {
        await ligne.scrollIntoViewIfNeeded();
        await page.mouse.move(5, 5);   // la souris laissée sur « + Ajouter » survolerait l'image de la ligne neuve
        await page.screenshot({ path: path.join(DOSSIER_CAPTURES, 'fenetre-tampon-emoji.png') });
    }
    await page.locator('#modal-retro-observations [data-action="travauxOutils.enregistrerRetroObservations"]').click();
    await attendreRepos(page);

    const etat = await page.evaluate(() => {
        const pers = db.getSync('personnalisationObservations', {}) || {};
        const id = Object.keys(pers).find((k) => pers[k].emoji);
        const ordinaire = travauxOutils.getAutocollant('obs-hoc');   // un tampon livré de la catégorie « observations »
        return {
            id, emoji: id && pers[id].emoji, png: !!(id && /^data:image\/png/.test(pers[id].imageBase64 || '')),
            garde: id ? travauxOutils.tamponGardeSesCouleurs(id) : null,
            teinteEmoji: id ? travauxOutils.obtenirCouleurCategorieAutocollant(id) : 'sans id',
            teinteOrdinaire: ordinaire ? travauxOutils.obtenirCouleurCategorieAutocollant(ordinaire.id) : 'aucun tampon ordinaire'
        };
    });
    expect(etat.emoji).toBe('🌟');
    expect(etat.png, 'l\'image du tampon est un PNG').toBe(true);
    expect(etat.garde).toBe(true);
    expect(etat.teinteEmoji, 'le tampon-emoji n\'est pas repeint').toBeNull();
    expect(etat.teinteOrdinaire, 'témoin : un tampon ordinaire de la même catégorie l\'est').toBe('#c62828');

    // La synthèse d'une copie qui porte ce tampon : sa phrase, et sa vignette en couleurs (non repeinte).
    await page.waitForFunction((id) => { const i = travauxOutils.getImageAutocollant(id); return !!(i && i.complete && i.naturalWidth); }, etat.id);
    if (DOSSIER_CAPTURES) await page.evaluate(() => { window.__dossierCaptures = true; });
    const synthese = await page.evaluate((id) => {
        const e = obtenirDonneesSelonMode('evaluationsSauvegardees').find((x) => !x.remplaceeParId);
        const fichier = { id: 'F-BANC', etudiantDA: e.etudiantDA, productionId: e.productionId };
        const annotation = { pages: { 0: { stickers: [{ id: 'STK-BANC', autocollantId: id, x: 0.1, y: 0.1, width: 0.05, height: 0.05 }], shapes: [], strokes: [], texts: [] } } };
        const fb = syntheseRetroactionData.construireFeedback(e, fichier, annotation);
        const html = syntheseRetroactionRendu.rendreSyntheseHTML(fb);
        const items = [].concat(...(fb.stamps || []).map((c) => c.items || []));
        const item = items.find((i) => i.id === id);
        const img = travauxOutils.getImageAutocollant(id);
        const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        const sansTeinte = c.toDataURL('image/png');
        if (window.__dossierCaptures) {
            const boite = document.createElement('div'); boite.id = 'banc-synthese';
            boite.style.cssText = 'position:fixed;left:0;top:0;width:816px;z-index:99999;background:#fff;';
            boite.innerHTML = html; document.body.appendChild(boite);
        }
        return { phrase: html.includes('Une idée qui brille : garde-la.'), nom: html.includes('Étoile fictive'), item: !!item, iconeSansTeinte: !!item && item.icone === sansTeinte };
    }, etat.id);
    expect(synthese.item, 'le tampon-emoji est dans les tampons de la synthèse').toBe(true);
    expect(synthese.nom).toBe(true);
    expect(synthese.phrase, 'sa phrase arrive dans la synthèse').toBe(true);
    expect(synthese.iconeSansTeinte, 'sa vignette garde ses couleurs').toBe(true);
    if (DOSSIER_CAPTURES) {
        const bloc = page.locator('#banc-synthese').getByText('Étoile fictive').locator('xpath=ancestor::*[self::section or self::div][2]');
        await bloc.screenshot({ path: path.join(DOSSIER_CAPTURES, 'synthese-tampon-emoji.png') });
    }
    expect(erreurs).toEqual([]);
});

test('#1245 · la démo n\'a que des copies sur papier : le compteur les compte, l\'export donne leur synthèse avec le DA', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = brancherEcouteurs(page);
    await ouvrirDemo(page);
    const cible = await page.evaluate(() => {
        const e = obtenirDonneesSelonMode('evaluationsSauvegardees').filter((x) => !x.remplaceeParId);
        const p = e[0].productionId;
        const sel = travauxArchivage.selectionnerEvaluationsLea(p, null, false);
        return { p, nbCopies: sel.fichiers.length, nbPapier: sel.sansFichier.length, da: sel.sansFichier[0] && sel.sansFichier[0].etudiantDA };
    });
    expect(cible.nbCopies, 'la démo n\'a aucune copie importée').toBe(0);
    expect(cible.nbPapier).toBeGreaterThan(0);

    // Le compteur de la carte « Export Léa ».
    await page.evaluate(() => naviguerVers('evaluations', 'exporter'));
    await attendreRepos(page);
    await page.evaluate((p) => {
        const sel = document.getElementById('travaux-archivage-lea-production');
        sel.value = p;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
    }, cible.p);
    await expect(page.locator('#travaux-lea-compteur'))
        .toHaveText(`${cible.nbPapier} PDF pour ${cible.nbPapier} étudiant·es, dont ${cible.nbPapier} sur papier (synthèse seule)`);
    if (DOSSIER_CAPTURES) {
        const carte = page.locator('#travaux-lea-compteur').locator('xpath=ancestor::*[contains(@class,"carte")][1]');
        await carte.scrollIntoViewIfNeeded();
        await carte.screenshot({ path: path.join(DOSSIER_CAPTURES, 'carte-export-lea.png') });
    }

    // L'export d'un élève : sa synthèse seule, un vrai PDF, nommé avec son DA.
    const r = await page.evaluate(async ({ p, da }) => {
        const res = await travauxArchivage.exporterPourLea(p, da, false);
        return { noms: res.blobs.map((b) => b.nom), octets: res.blobs.map((b) => b.blob.size), echecs: res.echecs };
    }, cible);
    expect(r.echecs).toEqual([]);
    expect(r.noms).toHaveLength(1);
    expect(r.noms[0]).toMatch(new RegExp(`_${cible.da}_.+_Evalue\\.pdf$`));
    expect(r.octets[0], 'un PDF qui porte une page').toBeGreaterThan(5000);
    expect(erreurs).toEqual([]);
});
