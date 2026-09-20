import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// #703 ET #705, DANS UN VRAI WEBKIT (consigne du 19 septembre 2026).
//
// #703 — par le vrai geste : une grille d'avant le lot 1 (critères sans type) passée en « Analytique »
//   → l'éditeur le DIT (le compte, lu à l'écran) et PROPOSE (le bouton) ; sans le geste, rien n'est écrit ;
//   avec lui, les critères sans type — et eux seuls — prennent le type ; aucune évaluation ne bouge.
//   Et à 768 px de large, l'avis ne fait pas déborder la page.
// #705 — une évaluation faite AVANT l'ajout d'un critère à sa grille : son PDF CONCLUT, et l'enseignant·e
//   lit le signalement en ouvrant la copie. Témoin : le même critère né AVANT l'évaluation et resté sans
//   niveau reste un manque — le PDF refuse de conclure (la protection de #674 tient).
// Aucune donnée réelle lue ni écrite. Clics par l'événement DOM (budget de `page.click` sur le runner).

const NE_EN_JUIN_2025 = (n) => 'CR_1750000000000_' + n + '_aabbccddeeff';
const NE_LE_15_SEPT_2026 = 'CR_' + new Date('2026-09-15T12:00:00.000Z').getTime() + '_3_aabbccddeeff';

const ECHELLE = { id: 'E70', nom: 'IDME témoin', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 59, valeurCalcul: 50 }, { code: 'D', nom: 'En développement', min: 60, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 }, { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 } ] };

async function ouvrirPage(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.modifierEvaluationParId === 'function' && typeof window.db !== 'undefined'
        && typeof window.chargerGrillePourModif === 'function' && typeof window.criteresAjoutesDepuis === 'function');
    await page.evaluate(() => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', 'a2026');
    });
    return erreurs;
}

test('#703 · grille passée en « Analytique » avec des critères sans type : l\'éditeur le dit, propose, et rien ne change sans le geste', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const erreurs = await ouvrirPage(page);
    await page.evaluate(async () => {
        const k = (b) => window.cle(b);
        // security-ok: fixtures littérales du banc, aucune source externe.
        await window.db.set(k('grillesTemplates'), [{ id: 'G703', nom: 'Grille d\'avant le lot 1', dansBibliotheque: true, criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 40 }, { id: 'c2', nom: 'Organisation', ponderation: 30 }, { id: 'c3', nom: 'Style', ponderation: 10 },
            { id: 'a1', nom: 'Français écrit', ponderation: 20, type: 'algorithmique' } ] }]);
        const ev = (id) => ({ id, etudiantDA: '1234567', productionId: 'P1', grilleId: 'G703', echelleId: 'E70', noteFinale: 80, ponderationCouverte: 100, niveauFinal: 'M', verrouillee: true,
            criteres: ['c1', 'c2', 'c3', 'a1'].map((c) => ({ critereId: c, niveauSelectionne: 'M' })) });
        window.db.setSync(k('evaluationsSauvegardees'), [ev('EV1'), ev('EV2')]);
        window.afficherSection('conception');
        window.afficherSousSection('conception-grille-criteres');
        await window.chargerGrillePourModif('G703');
    });
    const avis = page.locator('#avisTypeCriteresGrille');
    await expect(avis, 'grille sans type : l\'éditeur se tait').toBeHidden();

    const evalsAvant = await page.evaluate(() => JSON.stringify(window.db.getSync(window.cle('evaluationsSauvegardees'), [])));
    await page.selectOption('#typeGrille', 'analytique');
    await expect(avis).toBeVisible();
    await expect(avis).toContainText('3 critères de cette grille n\'ont pas de type : ils se calculent encore en holistique.');
    await expect(avis).toContainText('Les 2 évaluations déjà faites avec ces critères gardent leur note.');
    const bouton = avis.locator('button[data-action="appliquerTypeGrilleAuxCriteresSansType"]');
    await expect(bouton).toHaveText('Les passer en analytique');

    // SANS LE GESTE : la grille porte son type, ses critères n'ont rien reçu.
    const sansGeste = await page.evaluate(async () => { const g = (await window.db.get(window.cle('grillesTemplates')))[0]; return { type: g.type, criteres: g.criteres.map((c) => c.type || null) }; });
    expect(sansGeste).toEqual({ type: 'analytique', criteres: [null, null, null, 'algorithmique'] });

    // À 768 px : ni la page ni l'avis ne débordent, et le bouton tient dans l'avis.
    const mesure = await page.evaluate(() => {
        const a = document.getElementById('avisTypeCriteresGrille'); const b = a.querySelector('button');
        const ra = a.getBoundingClientRect(); const rb = b.getBoundingClientRect();
        // L'ÉTALON : le bouton standard et sa variante compacte, mêmes mots, mesurés dans la même page, hors de l'avis.
        const etalon = (classes) => { const e = document.createElement('button'); e.type = 'button'; e.className = classes; e.textContent = b.textContent;
            a.parentElement.appendChild(e); const h = Math.round(e.getBoundingClientRect().height); e.remove(); return h; };
        return { page: document.documentElement.scrollWidth <= window.innerWidth, avis: Math.round(ra.right) <= window.innerWidth, bouton: Math.round(rb.right) <= Math.round(ra.right), hauteurBouton: Math.round(rb.height),
            hauteurStandard: etalon('btn btn-secondaire'), hauteurCompacte: etalon('btn btn-secondaire btn-compact') };
    });
    console.log('MESURE 768 px →', JSON.stringify(mesure));
    expect(mesure).toMatchObject({ page: true, avis: true, bouton: true });
    // Le bouton STANDARD de l'application, pas sa variante compacte (mesurée au premier jet).
    // L'écart du bouton standard à la cible tactile de 44 px est connu et inscrit (#879) : pas rouvert ici.
    // ⚠ 20 sept. 2026 — la spec figeait « 37 px », la hauteur du bouton standard SOUS macOS. `.btn` n'a ni `min-height`
    // ni `line-height` : sa hauteur suit la police du système, et WebKit sous Ubuntu la dessine à 36 px (run GitHub
    // 35469302437 : « Expected: >= 37, Received: 36 »). Comparé à l'étalon de la même page, le jugement ne dépend plus de la police.
    expect(mesure.hauteurStandard, 'l\'étalon distingue les deux variantes : sans cela, la comparaison ne juge rien').toBeGreaterThan(mesure.hauteurCompacte);
    expect(mesure.hauteurBouton).toBeGreaterThanOrEqual(mesure.hauteurStandard);

    // LE GESTE.
    await page.evaluate(() => document.querySelector('#avisTypeCriteresGrille button').click());
    await expect(avis).toBeHidden();
    const apres = await page.evaluate(async () => { const g = (await window.db.get(window.cle('grillesTemplates')))[0]; return g.criteres.map((c) => c.type || null); });
    expect(apres, 'les critères sans type prennent le type ; l\'algorithmique n\'est pas touché').toEqual(['analytique', 'analytique', 'analytique', 'algorithmique']);
    const evalsApres = await page.evaluate(() => JSON.stringify(window.db.getSync(window.cle('evaluationsSauvegardees'), [])));
    expect(evalsApres, 'aucune évaluation n\'est réécrite par le geste').toBe(evalsAvant);
    expect(erreurs).toEqual([]);
});

async function semer705(page, { idSources, declaree }) {
    await page.evaluate(({ idSources, declaree, c1, c2, echelle }) => {
        const k = (b) => window.cle(b);
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('groupeCoursActif', { id: 'GC1', trimestreId: 'a2026', nom: 'Groupe 00007' });
        window.db.setSync(k('groupeEtudiants'), [{ da: '1234567', prenom: 'Daniel', nom: 'Témoin', groupe: '00007', groupeCoursId: 'GC1' }]);
        window.db.setSync(k('grillesTemplates'), [{ id: 'G705', nom: 'Grille témoin', type: 'holistique', criteres: [
            { id: c1, nom: 'Contenu', ponderation: 60, type: 'holistique' }, { id: c2, nom: 'Structure', ponderation: 40, type: 'holistique' },
            { id: idSources, nom: 'Sources', ponderation: 10, type: 'holistique' } ] }]);
        window.db.setSync(k('echellesTemplates'), [echelle]);
        window.db.setSync(k('cartouches_G705'), []);
        window.db.setSync(k('productions'), [{ id: 'P705', titre: 'Analyse témoin', grilleId: 'G705', echelleId: 'E70', groupeCoursId: 'GC1', cartoucheId: '' }]);
        window.db.setSync(k('evaluationsSauvegardees'), [Object.assign({
            id: 'EVAL705', etudiantDA: '1234567', productionId: 'P705', grilleId: 'G705', echelleId: 'E70', cartoucheId: '', statutRemise: 'remis', statutIntegrite: 'recevable',
            criteres: [{ critereId: c1, critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 60 }, { critereId: c2, critereNom: 'Structure', niveauSelectionne: 'M', ponderation: 40 }],
            noteFinale: 80, niveauFinal: 'M', dateEvaluation: '2026-09-05T14:00:00.000Z', verrouillee: true
        }, declaree ? { ponderationCouverte: 100 } : {})]);
        window.chargerListeEtudiantsEval(); window.chargerGroupesEval(); window.chargerProductionsDansSelect(); window.chargerGrillesDansSelect(); window.chargerEchellePerformance();
    }, { idSources, declaree, c1: NE_EN_JUIN_2025(1), c2: NE_EN_JUIN_2025(2), echelle: ECHELLE });
}

const pdfDe = (page) => page.evaluate(() => {
    const ev = window.db.getSync(window.cle('evaluationsSauvegardees'), [])[0];
    const fb = window.syntheseRetroactionData.construireFeedback(ev, { id: 'F705' }, null);
    const html = window.syntheseRetroactionRendu.rendreSyntheseHTML(fb);
    return { incomplete: fb.portee.incomplete, couverte: fb.portee.ponderationCouverte, grille: fb.portee.ponderationGrille,
        conclut: html.includes('Niveau général · Maîtrisé'), refuse: html.includes('n’a pas de niveau général'), nommeSources: html.includes('Sources') };
});

test('#705 · une évaluation d\'AVANT l\'ajout d\'un critère : son PDF conclut, et la copie ouverte le signale à l\'enseignant·e', async ({ page }) => {
    const erreurs = await ouvrirPage(page);
    await semer705(page, { idSources: NE_LE_15_SEPT_2026, declaree: true });
    const pdf = await pdfDe(page);
    console.log('PDF (critère né après) →', JSON.stringify(pdf));
    // AVANT #705 : incomplète (100 sur 110), « Cette copie n'a pas de niveau général : Sources (10 %) reste à évaluer. »
    expect(pdf).toEqual({ incomplete: false, couverte: 100, grille: 100, conclut: true, refuse: false, nommeSources: false });

    const enBaseAvant = await page.evaluate(() => JSON.stringify(window.db.getSync(window.cle('evaluationsSauvegardees'), [])));
    await page.evaluate(() => window.modifierEvaluationParId('EVAL705'));
    await page.waitForFunction(() => !!document.getElementById('avisCriteresAjoutesDepuis'), null, { timeout: 15000 });
    const avis = await page.evaluate(() => document.getElementById('avisCriteresAjoutesDepuis').textContent);
    expect(avis).toBe('Un critère a été ajouté à la grille après cette évaluation' + 'Sources (10 %)'
        + 'La note enregistrée ne le couvre pas et reste valable : le PDF de l\'élève conclut normalement. Si tu modifies cette copie, il faudra lui donner un niveau avant d\'enregistrer.');
    await page.evaluate(() => new Promise((r) => setTimeout(r, 2500)));   // au-delà du débounce de l'auto-save (1,5 s)
    expect(await page.evaluate(() => !!document.getElementById('avisCriteresAjoutesDepuis')), 'l\'avis survit aux réécritures de la liste').toBe(true);
    const enBaseApres = await page.evaluate(() => JSON.stringify(window.db.getSync(window.cle('evaluationsSauvegardees'), [])));
    expect(enBaseApres, 'ouvrir la copie ne réécrit rien').toBe(enBaseAvant);
    expect(erreurs).toEqual([]);
});

// RELECTURE CROISÉE DE COWORK (19 sept. 2026) — la date qui tranche prenait `dateModification`, que le
// modal de rétroaction de Travaux pose SANS écrire un critère. Par le vrai chemin : ouvrir le modal,
// retoucher le texte, cliquer « Sauvegarder ». AVANT le correctif : le PDF refusait de conclure après ce geste.
test('#705 · retoucher la rétroaction depuis le modal de Travaux, APRÈS l\'ajout du critère : le PDF conclut toujours', async ({ page }) => {
    const erreurs = await ouvrirPage(page);
    await semer705(page, { idSources: NE_LE_15_SEPT_2026, declaree: true });
    await page.waitForFunction(() => window.travauxUI && typeof window.travauxUI.afficherRetroaction === 'function');
    await page.evaluate(() => {
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(window.cle('fichiersTravaux'), [{ id: 'F705', nomFichier: 'temoin.pdf', etudiantDA: '1234567', productionId: 'P705', groupeCoursId: 'GC1', typeMIME: 'application/pdf' }]);
        window.travauxUI.afficherRetroaction('F705');
    });
    await page.waitForSelector('#travaux-modal-retro-texte');
    await page.fill('#travaux-modal-retro-texte', 'Un mot corrigé après coup.');
    await page.evaluate(() => document.querySelector('[data-action="travauxUI.sauvegarderRetroactionDepuisModal"]').click());
    await page.waitForFunction(() => !!window.db.getSync(window.cle('evaluationsSauvegardees'), [])[0].dateModification);
    const enBase = await page.evaluate(() => { const e = window.db.getSync(window.cle('evaluationsSauvegardees'), [])[0];
        return { retro: e.retroactionFinale, modifieeApresLAjout: new Date(e.dateModification).getTime() > new Date('2026-09-15T12:00:00.000Z').getTime(),
            dateEvaluation: e.dateEvaluation, criteres: e.criteres.length }; });
    // TÉMOIN : le geste a bien eu lieu, et il a posé une `dateModification` postérieure à la naissance du critère.
    expect(enBase).toEqual({ retro: 'Un mot corrigé après coup.', modifieeApresLAjout: true, dateEvaluation: '2026-09-05T14:00:00.000Z', criteres: 2 });
    const pdf = await pdfDe(page);
    console.log('PDF (après retouche de la rétroaction) →', JSON.stringify(pdf));
    expect(pdf).toEqual({ incomplete: false, couverte: 100, grille: 100, conclut: true, refuse: false, nommeSources: false });
    expect(erreurs).toEqual([]);
});

test('#705 · témoin — le même critère NÉ AVANT l\'évaluation et resté sans niveau est un manque : le PDF refuse de conclure (#674 tient)', async ({ page }) => {
    await ouvrirPage(page);
    await semer705(page, { idSources: NE_EN_JUIN_2025(3), declaree: false });
    const pdf = await pdfDe(page);
    console.log('PDF (critère né avant) →', JSON.stringify(pdf));
    expect(pdf).toMatchObject({ incomplete: true, grille: 110, conclut: false, refuse: true, nommeSources: true });
});
