import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1182 (29 oct. 2026) — « FUSIONNER » RÉUNIT DEUX CODEX COPIE PAR COPIE.
//
// Le cas de Grégoire : le Mac et l'iPad évaluent chacun de leur côté depuis le même codex.
// L'ancienne fusion décidait par clé entière contre le dernier codex de l'appareil, et prenait
// la liste de l'autre sans annoncer de conflit.
//
// Retouche (29 oct.) : les données d'ici passent par IndexedDB avec une propriété `undefined` ;
// la fusion les compare comme le codex les écrit, et n'annonce pas de faux conflit.
//
// CE QUE CE BANC JUGE, par le vrai geste (menu Codex › « Fusionner avec un codex… ») : un codex
// « de l'iPad » est fabriqué par le vrai `Codex.generer` dans un autre contexte (l'ancêtre +14
// évaluations, +14 annotations) ; l'espace « du Mac » (l'ancêtre +3, +4) le fusionne. Le résumé
// d'avant n'annonce aucun conflit, la fin dit ce qui est entré, et l'espace porte les deux séries.
//
// CE QU'IL NE JUGE PAS : les copies (leurs fichiers ne se stockent pas dans le contexte éphémère
// de WebKit — la fusion des fichiers est jugée par Vitest, sentinelle-1182) ; Chrome ; le vrai
// corpus (mesuré en lecture seule, comptes seulement, dans la demande de relecture).

const T = 'a2031';
const EVALS = T + '_evaluationsSauvegardees';
const ANNOTS = T + '_annotationsTravaux';
const evaluation = (id) => ({ id, etudiantDA: '9000001', etudiantNom: 'Alix Fictif', productionId: 'PROD_banc', productionNom: 'Dissertation inventée', noteFinale: 70 });
const annotation = (id) => ({ id, fichierId: 'FT_' + id, etudiantDA: '9000001', productionId: 'PROD_banc', pages: [] });
const serie = (prefixe, n, fabrique) => Array.from({ length: n }, (_, i) => fabrique(prefixe + '_' + (i + 1)));

const ANCETRE_EVALS = serie('EV_ancetre', 5, evaluation);
const ANCETRE_ANNOTS = serie('AN_ancetre', 3, annotation);
const IPAD = { [EVALS]: ANCETRE_EVALS.concat(serie('EV_ipad', 14, evaluation)), [ANNOTS]: ANCETRE_ANNOTS.concat(serie('AN_ipad', 14, annotation)) };
const MAC = { [EVALS]: ANCETRE_EVALS.concat(serie('EV_mac', 3, evaluation)), [ANNOTS]: ANCETRE_ANNOTS.concat(serie('AN_mac', 4, annotation)) };

/** Démarre l'application et attend que le stockage soit prêt (un événement, pas un délai). */
async function demarrer(page) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.auDbPret === 'function' && !!window.Codex);
    await page.evaluate(() => new Promise((r) => window.auDbPret(r)));
}

/** Ce que l'espace porte (hors clés internes) : le point de départ commun des deux appareils. */
function lireLEspace(page) {
    return page.evaluate(async () => {
        const etat = {};
        for (const k of await db.keys()) {
            if (k.charAt(0) === '_') continue;
            const v = await db.get(k, null);
            if (v !== null) etat[k] = v;
        }
        return etat;
    });
}

/**
 * Le codex « de l'iPad » : le vrai `Codex.generer`, dans un contexte à part, parti du même état
 * que le Mac (deux installations neuves sèment chacune leur démo, avec leurs horodatages : elles
 * différeraient sur des éléments que deux appareils partis du même codex partagent).
 */
async function fabriquerLeCodexDeLIPad(browser, chemin, depart) {
    const contexte = await browser.newContext();
    const page = await contexte.newPage();
    await demarrer(page);
    const b64 = await page.evaluate(async ({ depart, donnees }) => {
        Object.keys(depart).forEach((k) => db.setSync(k, depart[k]));
        Object.keys(donnees).forEach((k) => db.setSync(k, donnees[k]));
        await db.flush();
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        const rendu = await Codex.generer({ nom: 'Codex de l\'iPad' });
        const o = new Uint8Array(await rendu.blob.arrayBuffer());
        let binaire = '';
        for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
        return btoa(binaire);
    }, { depart, donnees: IPAD });
    fs.writeFileSync(chemin, Buffer.from(b64, 'base64'));
    await contexte.close();
}

test.describe('#1182 — Fusionner, copie par copie', () => {
    test('le Mac fusionne le codex de l\'iPad : aucune évaluation perdue, la fin dit ce qui est entré', async ({ page, browser }) => {
        test.setTimeout(90000);
        const fichier = test.info().outputPath('codex-de-l-ipad.zip');
        await demarrer(page);
        await fabriquerLeCodexDeLIPad(browser, fichier, await lireLEspace(page));

        // L'espace « du Mac », avec un codex actif (le menu ne propose « Fusionner » qu'alors).
        // Ses évaluations de l'ancêtre portent `dateModification: undefined`, comme en pose
        // evaluation-jetons.js : IndexedDB la garde, le JSON du codex de l'iPad ne l'a pas
        // (retouche de #1182 — elle faisait de chaque évaluation un faux conflit).
        await page.evaluate(async ({ donnees, cleE }) => {
            donnees[cleE].forEach((e) => { if (e.id.indexOf('EV_ancetre') === 0) e.dateModification = undefined; });
            Object.keys(donnees).forEach((k) => db.setSync(k, donnees[k]));
            db.setSync('_codex_etat', { actif: true, nom: 'Codex du Mac', derniereSauvegarde: new Date().toISOString(), modificationsDepuis: null, manifeste: null, temoinFiable: true });
            await db.flush();
        }, { donnees: MAC, cleE: EVALS });
        await page.reload();
        await page.waitForFunction(() => typeof window.auDbPret === 'function' && !!window.Codex);
        await page.evaluate(() => new Promise((r) => window.auDbPret(r)));
        const gardee = await page.evaluate(async (cleE) => {
            const e = ((await db.get(cleE, [])) || []).find((x) => x.id === 'EV_ancetre_1');
            return !!e && Object.prototype.hasOwnProperty.call(e, 'dateModification') && e.dateModification === undefined;
        }, EVALS);
        expect(gardee, 'témoin : IndexedDB a gardé la propriété undefined (ce que la fusion lit ici)').toBe(true);

        await page.locator('#btn-codex').click();
        const item = page.locator('#codex-menu-fusionner');
        await expect(item, 'témoin : le codex est actif, « Fusionner » est proposé').toBeVisible();
        const [choix] = await Promise.all([page.waitForEvent('filechooser'), item.click()]);
        await choix.setFiles(fichier);

        // Le résumé d'avant : ce qui viendra, et aucun conflit.
        const resume = page.getByText('Viendront de l\'autre codex : 14 évaluations et 14 annotations.', { exact: false });
        await expect(resume).toBeVisible({ timeout: 30000 });
        await expect(page.getByText('Différent des deux côtés')).toHaveCount(0);
        await page.getByRole('button', { name: 'Fusionner', exact: true }).click();

        // La fin, en mots d'utilisateur.
        await expect(page.getByText('14 évaluations et 14 annotations venues de l\'autre codex.', { exact: false })).toBeVisible({ timeout: 30000 });

        const apres = await page.evaluate(async ({ cleE, cleA }) => ({
            evaluations: ((await db.get(cleE, [])) || []).map((e) => e.id),
            annotations: ((await db.get(cleA, [])) || []).length
        }), { cleE: EVALS, cleA: ANNOTS });
        expect(apres.evaluations.length, 'l\'ancêtre, les 3 du Mac et les 14 de l\'iPad').toBe(5 + 3 + 14);
        ['EV_mac_1', 'EV_mac_2', 'EV_mac_3', 'EV_ipad_14'].forEach((id) => expect(apres.evaluations).toContain(id));
        expect(apres.annotations).toBe(3 + 4 + 14);
    });
});
