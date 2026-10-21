import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LE CRITÈRE ALGORITHMIQUE, ÉTAPE 0 (consigne du 21 oct. 2026), dans un vrai WebKit :
//   · Grilles de critères : une grille neuve, un critère algorithmique « Unités et chiffres significatifs »
//     (chimie, fictif), créée ; une copie de sa production ouverte dans Annoter (`travaux-fichier-ouvert`) → la
//     palette des codes invite à ajouter des sous-critères, et ne dit pas « français » ;
//   · la grille démo livrée (« Français écrit », pack démo) : sa copie reçoit les mêmes codes qu'hier — le
//     repli, à l'octet près, celui d'une copie sans grille ;
//   · le PDF : une copie démo n'a PAS de ligne de calcul (ses vingt évaluations sont en mode Catégories,
//     `totalErreurs` : #1133, mesuré) ; la ligne d'une copie fictive en mode simple prend la virgule.
// Les montages : celui de `codes-par-grille-palette` (la copie ouverte par l'évènement) et celui de
// `critere-algorithmique-dit-vrai`. Captures : CAPTURES_ETAPE0=<dossier>.

async function ouvrir(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await page.waitForFunction(() => window.dbReady === true && window.travauxOutils && window.syntheseRetroactionData && window.PACK_DEMARRAGE, null, { timeout: 20000 });
    return erreurs;
}

/** La copie d'une production ouverte dans Annoter : la palette des codes, telle qu'elle se rend. */
const PALETTE = `(productionId) => {
    window.dispatchEvent(new CustomEvent('travaux-fichier-ouvert', { detail: { fichier: { id: 'F_' + productionId, productionId: productionId } } }));
    const html = travauxOutils.genererContenuErreursFr();
    const grille = travauxOutils.grilleCourante();
    return { html, grilleId: grille ? grille.id : null, codes: codesAnnotation.listeCodes(grille).map((c) => [c.id, c.numero, c.nom]) };
}`;

async function capturerPalette(page, html, fichier) {
    await page.evaluate((h) => {
        const d = document.createElement('div');
        d.id = 'capture-palette-etape0';
        d.className = 'travaux-palette-erreurs-fr';
        d.style.cssText = 'position:fixed;top:20px;left:20px;z-index:99999;background:var(--fond-carte,#fff);border:1px solid var(--bordure-claire);border-radius:8px;padding:6px;';
        d.innerHTML = h;
        document.body.appendChild(d);
    }, html);
    await page.locator('#capture-palette-etape0').screenshot({ path: fichier });
    await page.evaluate(() => document.getElementById('capture-palette-etape0').remove());
}

test('une grille neuve, un critère algorithmique de chimie : Annoter n’offre pas les dix codes du français, il invite à définir les siens', async ({ page }) => {
    const erreurs = await ouvrir(page);
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await page.locator('[data-action="creerNouvelleGrille"]').click();
    await page.locator('#nomGrilleTemplate').fill('Laboratoire fictif');
    const carte = page.locator('#listeCriteres .item-liste').first();
    await carte.locator('select[data-on-change="modifierTypeCritereTempHandler"]').selectOption('algorithmique');
    const nom = carte.locator('input[data-on-change="modifierCritereTempHandler"][data-champ="nom"]');
    await nom.fill('Unités et chiffres significatifs');
    await nom.press('Tab');
    await expect(carte.locator('[data-action="initialiserSousCriteresParDefaut"]')).toHaveText('Partir de la liste du français écrit (codes 1 à 10)');
    await page.locator('#btnCreerGrille').click();
    await expect.poll(() => page.evaluate(() => db.getSync(cle('grillesTemplates'), []).some((g) => g.nom === 'Laboratoire fictif'))).toBe(true);
    const grilleId = await page.evaluate(() => {
        const g = db.getSync(cle('grillesTemplates'), []).find((x) => x.nom === 'Laboratoire fictif');
        // security-ok: fixture littérale du spec, aucune source externe.
        db.setSync(cle('productions'), [{ id: 'P_CHIMIE', titre: 'Rapport de laboratoire fictif', grilleId: g.id }]);
        return g.id;
    });
    const r = await page.evaluate('(' + PALETTE + ')("P_CHIMIE")');
    expect(r.grilleId).toBe(grilleId);
    expect(r.codes).toEqual([]);
    expect(r.html).toContain('Aucun code : ajoute des sous-critères à ton critère algorithmique, dans la grille.');
    expect(r.html.toLowerCase()).not.toContain('français');
    if (process.env.CAPTURES_ETAPE0) await capturerPalette(page, r.html, path.join(process.env.CAPTURES_ETAPE0, 'palette-critere-neuf-chimie.png'));
    expect(erreurs).toEqual([]);
});

test('la grille démo livrée : sa copie reçoit les mêmes codes qu’hier — le repli, à l’octet près', async ({ page }) => {
    const erreurs = await ouvrir(page);
    const r = await page.evaluate('(' + `() => {
        const demo = JSON.parse(JSON.stringify(window.PACK_DEMARRAGE.grillesTemplates.find((g) => g.id === 'GRILLE_DEMO_1759529438501')));
        // security-ok: la grille démo livrée par l'application, et une production fictive.
        db.setSync(cle('grillesTemplates'), [demo]);
        db.setSync(cle('productions'), [{ id: 'P_DEMO', titre: 'Analyse démo', grilleId: demo.id }, { id: 'P_SANS', titre: 'Sans grille', grilleId: '' }]);
        const avecDemo = (${PALETTE})('P_DEMO');
        const sansGrille = (${PALETTE})('P_SANS');
        return { avecDemo, sansGrille, marque: demo.criteres.some((c) => 'codesSousCriteresSeulement' in c), repli: codesAnnotation.REPLI_DEFAUT.map((t) => t.id) };
    }` + ')()');
    expect(r.marque, 'la grille démo ne porte pas la marque : c’est du stock').toBe(false);
    expect(r.avecDemo.grilleId).toBe('GRILLE_DEMO_1759529438501');
    expect(r.avecDemo.codes.map((c) => c[0])).toEqual(r.repli);
    expect(r.avecDemo.html).toBe(r.sansGrille.html);
    expect(erreurs).toEqual([]);
});

test('le PDF : une copie démo n’a pas de ligne de calcul (mode Catégories, #1133) ; une copie en mode simple prend la virgule', async ({ page }) => {
    const erreurs = await ouvrir(page);
    const r = await page.evaluate(() => {
        const P = window.PACK_DEMARRAGE;
        const k = (b) => cle(b);
        // security-ok: les données du pack démo livré par l'application, copiées dans le trimestre du banc.
        ['grillesTemplates', 'echellesTemplates', 'productions', 'groupeEtudiants', 'modalitesEvaluation', 'pratiquesConfigurables'].forEach((c) => db.setSync(k(c), JSON.parse(JSON.stringify(P[c]))));
        db.setSync(k('cartouches_GRILLE_DEMO_1759529438501'), JSON.parse(JSON.stringify(P.cartouches_GRILLE_DEMO_1759529438501)));
        const evs = P.evaluationsSauvegardees.filter((e) => e.grilleId === 'GRILLE_DEMO_1759529438501');
        const ev = JSON.parse(JSON.stringify(evs[0]));
        const demoHtml = window.syntheseRetroactionRendu.rendreSyntheseHTML(window.syntheseRetroactionData.construireFeedback(ev, { id: 'F_DEMO' }, null));
        const enCategories = evs.filter((e) => Object.values(e.donneesAlgorithmiques || {}).some((d) => typeof d.totalErreurs === 'number' && typeof d.erreurs !== 'number')).length;
        // La même copie, en mode simple (`erreurs`), comme l'écrit une évaluation d'aujourd'hui.
        const simple = JSON.parse(JSON.stringify(ev));
        const id = Object.keys(simple.donneesAlgorithmiques)[0];
        simple.donneesAlgorithmiques[id] = { erreurs: 7, mots: 400, noteCalculee: 20.25, pourcentage: 67.5 };   // sur 30, le poids du critère démo
        const simpleHtml = window.syntheseRetroactionRendu.rendreSyntheseHTML(window.syntheseRetroactionData.construireFeedback(simple, { id: 'F_DEMO' }, null));
        const ligne = (h) => ((h.match(/\d+ erreurs?[^<]*sur \d+ mots &rarr; <b[^>]*>[^<]*<\/b> \([^)]*\)/) || [''])[0]).replace(/<[^>]+>/g, '');
        return { total: evs.length, enCategories, ligneDemo: ligne(demoHtml), ligneSimple: ligne(simpleHtml), simpleHtml };
    });
    expect(r).toMatchObject({ total: 20, enCategories: 20, ligneDemo: '' });
    expect(r.ligneSimple).toBe('7 erreurs sur 400 mots &rarr; 20,25/30 (67,5 %)');
    if (process.env.CAPTURES_ETAPE0) {
        const p = await page.context().newPage();
        await p.setContent(r.simpleHtml);
        await p.locator('body').screenshot({ path: path.join(process.env.CAPTURES_ETAPE0, 'pdf-ligne-virgule.png') });
        await p.close();
    }
    expect(erreurs).toEqual([]);
});
