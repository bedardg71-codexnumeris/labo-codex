import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #946 (25 sept. 2026) — À L'OUVERTURE D'UNE COPIE DÉJÀ ÉVALUÉE, LA CARTOUCHE DE L'ÉVALUATION FAIT FOI.
// Règle de Grégoire (#939) : ce qui est enregistré avec l'évaluation fait foi. La cartouche que
// la production prévoit ne sert qu'à pré-remplir une copie SANS évaluation.
//
// Le cas : les évaluations de la production n'ont pas toutes la même GRILLE (une copie notée avec
// une autre grille) ; `_modeleProductionPourEval` retombe alors sur `production.cartoucheId`
// (CT946R), alors que la copie de l'élève TEST946 a été évaluée avec CT946 (même grille).
// Aucun `page.click` : appels et `change` scriptés. Noms fictifs (règle 6).

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 't946';
const ENREGISTRE = "ENREGISTRÉ c1_M : ton propos tient, d'un bout à l'autre.";

async function monter(page, { avecCopie = true, grillesMixtes = true, sansCartouche = false } = {}) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.travauxUI && window.travauxStockage
        && typeof window.evaluerProduction === 'function');
    await page.evaluate(({ png, T, ENREGISTRE, avecCopie, grillesMixtes, sansCartouche }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-946';
        const crit = [{ id: 'c1', nom: 'Contenu', ponderation: 60, type: 'holistique' },
            { id: 'c2', nom: 'Structure', ponderation: 40, type: 'holistique' }];
        const echelle = { id: 'E946', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] };
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC946', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: 'TEST946', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC946' },
            { da: 'TEST947', nom: 'Témoin', prenom: 'Autre', groupe: '01', coursId, groupeCoursId: 'GC946' },
            { da: 'TEST948', nom: 'Neuf', prenom: 'Sans', groupe: '01', coursId, groupeCoursId: 'GC946' }
        ]);
        window.db.setSync(T + '_productions', [
            { id: 'p946', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: 'G946', echelleId: 'E946', cartoucheId: 'CT946R', groupeCoursId: 'GC946' },
            { id: 'p2', titre: 'Dissertation', type: 'travail', ponderation: 40, grilleId: 'G946', echelleId: 'E946', groupeCoursId: 'GC946' }
        ]);
        window.db.setSync(T + '_grillesTemplates', [
            { id: 'G946', nom: 'Grille témoin', type: 'holistique', criteres: crit },
            { id: 'G946B', nom: 'Grille autre', type: 'holistique', criteres: crit }
        ]);
        window.db.setSync(T + '_echellesTemplates', [echelle]);
        window.db.setSync(T + '_cartouches_G946', [
            { id: 'CT946', nom: 'Cartouche de la copie', grilleId: 'G946', contexte: '', criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }],
                commentaires: { c1_M: 'CARTOUCHE DE LA COPIE c1_M' } },
            { id: 'CT946R', nom: 'Cartouche de la production', grilleId: 'G946', contexte: '', criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }],
                commentaires: { c1_M: 'CARTOUCHE DE LA PRODUCTION c1_M' } }
        ]);
        const evals = [{
            id: 'EV946', etudiantDA: 'TEST946', productionId: 'p946', groupeCoursId: 'GC946',
            grilleId: 'G946', echelleId: 'E946', cartoucheId: sansCartouche ? '' : 'CT946', statutRemise: 'evalue',
            dateEvaluation: '2026-09-15T08:00:00.000Z', noteFinale: 74, niveauFinal: 'D', verrouillee: false,
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 60, retroaction: ENREGISTRE },
                { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: 'D', ponderation: 40, retroaction: '' }
            ],
            retroactionFinale: 'Critère 1 (Contenu) — M\n' + ENREGISTRE
        }, {
            // L'autre copie : autre grille si `grillesMixtes`, sinon même grille et autre cartouche
            // (l'état mixte de #944 : `_modeleProductionPourEval` ne rend alors aucune cartouche).
            id: 'EV947', etudiantDA: 'TEST947', productionId: 'p946', groupeCoursId: 'GC946',
            grilleId: grillesMixtes ? 'G946B' : 'G946', echelleId: 'E946', cartoucheId: grillesMixtes ? '' : 'CT946R', statutRemise: 'evalue',
            dateEvaluation: '2026-09-15T09:00:00.000Z', noteFinale: 80, niveauFinal: 'M', verrouillee: false,
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 60, retroaction: '' },
                { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: 'M', ponderation: 40, retroaction: '' }
            ]
        }];
        window.db.setSync(T + '_evaluationsSauvegardees', evals);
        const fichier = (id, da) => ({
            id, etudiantDA: da, productionId: 'p946', coursId, groupeCoursId: 'GC946',
            nomFichier: 'FICTIF_' + da + '_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-09-01T12:00:00.000Z', dateModification: '2026-09-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        });
        window.db.setSync(T + '_fichiersTravaux', avecCopie ? [fichier('FT946', 'TEST946'), fichier('FT948', 'TEST948')] : []);

        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC946' });
        window.db.setSync('groupeCoursActif', { id: 'GC946', trimestreId: T });

        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return /^FT94/.test(id) ? copie : original.apply(this, arguments); };

        // Journal de toutes les valeurs que prend le menu Cartouche (poses scriptées comprises).
        window._journal946 = [];
        const s = document.getElementById('selectCartoucheEval');
        const proto = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
        Object.defineProperty(s, 'value', { configurable: true,
            get() { return proto.get.call(this); },
            set(v) { proto.set.call(this, v); window._journal946.push(v); } });
    }, { png: PNG, T, ENREGISTRE, avecCopie, grillesMixtes, sansCartouche });
    return erreurs;
}

const etat = (page) => page.evaluate((T) => ({
    menu: document.getElementById('selectCartoucheEval').value,
    // Deux liaisons (config.js : `let evaluationEnCours`, et `window.evaluationEnCours`) : on lit les deux.
    enCours: (typeof evaluationEnCours !== 'undefined' && evaluationEnCours) ? evaluationEnCours.cartoucheId : null,
    enCoursWindow: window.evaluationEnCours ? window.evaluationEnCours.cartoucheId : null,
    base: (window.db.getSync(T + '_evaluationsSauvegardees', []).find(e => e.id === 'EV946') || {}).cartoucheId,
    journal: window._journal946.join(' > ')
}), T);

/** Toutes les minuteries des chargeurs (150 ms + 8 × 250 ms au pire) passées, et l'auto-save écrit. */
async function laisserPasserLesChargeurs(page) {
    await page.waitForTimeout(3500);
    await page.waitForFunction(() => !window._timerAutoSave && !window._modifierEvaluationEnCours, null, { timeout: 10000 });
}

/** Le bouton « Enregistrer » du formulaire, tel que l'enseignant le presse. */
async function enregistrer(page) {
    await page.evaluate(() => document.getElementById('btnVerrouillerEvaluation').click());
    await page.waitForTimeout(1500);
    await page.waitForFunction(() => !window._timerAutoSave, null, { timeout: 10000 });
}

test('#946 · visionneuse : copie évaluée avec CT946, production qui prévoit CT946R, grilles mixtes — la cartouche de la copie reste', async ({ page }) => {
    const erreurs = await monter(page);
    await page.evaluate(() => window.evaluerProduction('TEST946', 'p946'));
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV946', null, { timeout: 15000 });
    await laisserPasserLesChargeurs(page);
    const e = await etat(page);
    console.warn('[946 visionneuse] ' + JSON.stringify(e));
    // Même quand l'évaluation finit par l'emporter, le menu ne doit jamais passer par celle de la production.
    expect.soft(e.journal, 'aucun chargeur ne pose la cartouche de la production').not.toContain('CT946R');
    expect(e.menu, 'le menu montre la cartouche de l\'évaluation').toBe('CT946');
    expect.soft(e.enCours).toBe('CT946');
    await enregistrer(page);
    expect((await etat(page)).base, '« Enregistrer » garde la cartouche de l\'évaluation').toBe('CT946');
    expect(erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m))).toEqual([]);
});

test('#946 · « Consulter » sans copie : même élève, même production — la cartouche de la copie reste', async ({ page }) => {
    const erreurs = await monter(page, { avecCopie: false });
    await page.evaluate(() => window.modifierEvaluationParId('EV946'));
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV946', null, { timeout: 15000 });
    await laisserPasserLesChargeurs(page);
    const e = await etat(page);
    console.warn('[946 consulter sans copie] ' + JSON.stringify(e));
    expect.soft(e.menu, 'le menu montre la cartouche de l\'évaluation').toBe('CT946');
    expect.soft(e.enCoursWindow).toBe('CT946');
    await enregistrer(page);
    const apres = await etat(page);
    console.warn('[946 après Enregistrer] ' + JSON.stringify(apres));
    expect(apres.base, '« Enregistrer » garde la cartouche de l\'évaluation').toBe('CT946');
    expect(erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m))).toEqual([]);
});

test('#946 · menu « Production » : formulaire ouvert sur une autre production, puis p946 choisie au menu — la cartouche de la copie reste', async ({ page }) => {
    const erreurs = await monter(page, { avecCopie: false });
    await page.evaluate(() => window.evaluerProduction('TEST946', 'p2'));
    await page.waitForFunction(() => document.getElementById('selectProduction1')?.value === 'p2'
        && window._modifierEvaluationEnCours === false, null, { timeout: 15000 });
    await laisserPasserLesChargeurs(page);
    await page.evaluate(() => {
        window._journal946.push('|menu Production|');
        const s = document.getElementById('selectProduction1');
        s.value = 'p946';
        s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await laisserPasserLesChargeurs(page);
    const e = await etat(page);
    console.warn('[946 menu Production] ' + JSON.stringify(e));
    expect.soft(e.menu, 'le menu montre la cartouche de l\'évaluation').toBe('CT946');
    expect.soft(e.enCours).toBe('CT946');
    await enregistrer(page);
    const apres = await etat(page);
    console.warn('[946 après Enregistrer] ' + JSON.stringify(apres));
    expect(apres.base, '« Enregistrer » garde la cartouche de l\'évaluation').toBe('CT946');
    expect(erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m))).toEqual([]);
});

// Relecture de Cowork (25 sept.) : une copie évaluée SANS cartouche. Rien n'a été enregistré, rien
// ne s'impose : la cartouche de la production ne s'y pose pas (comme la visionneuse, qui vide le menu).
for (const chemin of ['Consulter', 'menu Production']) {
test(`#946 · copie évaluée SANS cartouche, par ${chemin} : la cartouche de la production ne s'y pose pas`, async ({ page }) => {
    const erreurs = await monter(page, { avecCopie: false, sansCartouche: true });
    if (chemin === 'Consulter') {
        await page.evaluate(() => window.modifierEvaluationParId('EV946'));
        await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV946', null, { timeout: 15000 });
    } else {
        await page.evaluate(() => window.evaluerProduction('TEST946', 'p2'));
        await page.waitForFunction(() => document.getElementById('selectProduction1')?.value === 'p2'
            && window._modifierEvaluationEnCours === false, null, { timeout: 15000 });
        await laisserPasserLesChargeurs(page);
        await page.evaluate(() => {
            const s = document.getElementById('selectProduction1');
            s.value = 'p946';
            s.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }
    await laisserPasserLesChargeurs(page);
    const e = await etat(page);
    console.warn(`[946 sans cartouche, ${chemin}] ` + JSON.stringify(e));
    expect.soft(e.menu, 'le menu reste sans cartouche').toBe('');
    expect.soft(e.journal).not.toContain('CT946R');
    expect.soft(e.enCours, 'le pivot de l\'évaluation ne reçoit pas celle de la production').not.toBe('CT946R');
    await enregistrer(page);
    const apres = await etat(page);
    console.warn(`[946 sans cartouche, ${chemin}, après Enregistrer] ` + JSON.stringify(apres));
    expect(apres.base, '« Enregistrer » n\'écrit pas la cartouche de la production').not.toBe('CT946R');
    expect(erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m))).toEqual([]);
});
}

test('#946 · copie SANS évaluation : elle reçoit la cartouche que la production prévoit', async ({ page }) => {
    const erreurs = await monter(page);
    await page.evaluate(() => window.evaluerProduction('TEST948', 'p946'));
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.etudiantDA === 'TEST948', null, { timeout: 15000 });
    await laisserPasserLesChargeurs(page);
    const e = await etat(page);
    console.warn('[946 sans évaluation] ' + JSON.stringify(e));
    expect(e.menu).toBe('CT946R');
    expect(e.enCours).toBe('CT946R');
    expect(erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m))).toEqual([]);
});

test('#946 · copie SANS évaluation choisie au menu « Production » : elle reçoit la cartouche que la production prévoit', async ({ page }) => {
    const erreurs = await monter(page, { avecCopie: false });
    await page.evaluate(() => window.evaluerProduction('TEST948', 'p2'));
    await page.waitForFunction(() => document.getElementById('selectProduction1')?.value === 'p2'
        && window._modifierEvaluationEnCours === false, null, { timeout: 15000 });
    await laisserPasserLesChargeurs(page);
    await page.evaluate(() => {
        const s = document.getElementById('selectProduction1');
        s.value = 'p946';
        s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await laisserPasserLesChargeurs(page);
    const e = await etat(page);
    console.warn('[946 sans évaluation, menu Production] ' + JSON.stringify(e));
    expect(e.menu).toBe('CT946R');
    expect(e.enCours).toBe('CT946R');
    expect(erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m))).toEqual([]);
});

test('#946 · état mixte de #944 (même grille, cartouches différentes) : la copie garde la sienne', async ({ page }) => {
    const erreurs = await monter(page, { grillesMixtes: false });
    await page.evaluate(() => window.evaluerProduction('TEST946', 'p946'));
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV946', null, { timeout: 15000 });
    await laisserPasserLesChargeurs(page);
    const e = await etat(page);
    console.warn('[946 état mixte] ' + JSON.stringify(e));
    expect.soft(e.menu, 'le menu montre la cartouche de l\'évaluation').toBe('CT946');
    expect.soft(e.enCours).toBe('CT946');
    expect(erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m))).toEqual([]);
});
