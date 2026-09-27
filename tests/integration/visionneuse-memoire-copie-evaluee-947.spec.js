import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #947 (25 sept. 2026) — DANS LA VISIONNEUSE, LA MÉMOIRE DES DERNIERS CHOIX NE TOUCHE PLUS UNE COPIE DÉJÀ ÉVALUÉE.
// Règle de Grégoire (#939, appliquée en #946) : ce qui est enregistré avec l'évaluation fait foi. La mémoire
// (`dernieresSelectionsEvaluation`, écrite en évaluant une AUTRE copie) pré-remplit une copie SANS évaluation ;
// sur une copie évaluée, elle ne pose ni grille, ni échelle, ni cartouche.
// Le cas : copie évaluée sans cartouche (et sans échelle), la mémoire porte CT947M et E947M.
// Aucun `page.click` : appels et `change` scriptés. Noms fictifs (règle 6).

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 't947';

async function monter(page, { cartoucheEval = '', echelleEval = '' } = {}) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.travauxUI && window.travauxStockage
        && typeof window.evaluerProduction === 'function');
    await page.evaluate(({ png, T, cartoucheEval, echelleEval }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-947';
        const crit = [{ id: 'c1', nom: 'Contenu', ponderation: 60, type: 'holistique' },
            { id: 'c2', nom: 'Structure', ponderation: 40, type: 'holistique' }];
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC947', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: 'TEST947', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC947' },
            { da: 'TEST949', nom: 'Neuf', prenom: 'Sans', groupe: '01', coursId, groupeCoursId: 'GC947' }
        ]);
        // La production ne prévoit ni échelle ni cartouche : seule la mémoire peut en poser.
        window.db.setSync(T + '_productions', [
            { id: 'p947', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: 'G947', groupeCoursId: 'GC947' }
        ]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'G947', nom: 'Grille témoin', type: 'holistique', criteres: crit }]);
        window.db.setSync(T + '_echellesTemplates', [
            { id: 'E947', nom: 'IDME de la copie', niveaux },
            { id: 'E947M', nom: 'IDME de la mémoire', niveaux }
        ]);
        window.db.setSync(T + '_cartouches_G947', [
            { id: 'CT947', nom: 'Cartouche de la copie', grilleId: 'G947', contexte: '', criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }],
                commentaires: { c1_M: 'CARTOUCHE DE LA COPIE c1_M' } },
            { id: 'CT947M', nom: 'Cartouche de la mémoire', grilleId: 'G947', contexte: '', criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }],
                commentaires: { c1_M: 'CARTOUCHE DE LA MÉMOIRE c1_M' } }
        ]);
        window.db.setSync(T + '_evaluationsSauvegardees', [{
            id: 'EV947', etudiantDA: 'TEST947', productionId: 'p947', groupeCoursId: 'GC947',
            grilleId: 'G947', echelleId: echelleEval, cartoucheId: cartoucheEval, statutRemise: 'evalue',
            dateEvaluation: '2026-09-15T08:00:00.000Z', noteFinale: 74, niveauFinal: 'D', verrouillee: false,
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 60, retroaction: 'Enregistré.' },
                { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: 'D', ponderation: 40, retroaction: '' }
            ],
            retroactionFinale: 'Enregistré.'
        }]);
        const fichier = (id, da) => ({
            id, etudiantDA: da, productionId: 'p947', coursId, groupeCoursId: 'GC947',
            nomFichier: 'FICTIF_' + da + '_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-09-01T12:00:00.000Z', dateModification: '2026-09-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        });
        window.db.setSync(T + '_fichiersTravaux', [fichier('FT947', 'TEST947'), fichier('FT949', 'TEST949')]);
        // La mémoire, telle qu'une AUTRE copie évaluée juste avant l'a laissée.
        window.db.setSync('dernieresSelectionsEvaluation', {
            production: 'p947', grille: 'G947', echelle: 'E947M', cartouche: 'CT947M', remise: 'evalue',
            afficherDescription: true, afficherObjectif: true, afficherTache: true, afficherAdresse: true, afficherContexte: true, affichageNote: 'complet'
        });

        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC947' });
        window.db.setSync('groupeCoursActif', { id: 'GC947', trimestreId: T });

        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return /^FT94/.test(id) ? copie : original.apply(this, arguments); };
    }, { png: PNG, T, cartoucheEval, echelleEval });
    return erreurs;
}

const etat = (page) => page.evaluate((T) => {
    const ev = window.db.getSync(T + '_evaluationsSauvegardees', []).find(e => e.id === 'EV947') || {};
    return {
        cartouche: document.getElementById('selectCartoucheEval').value,
        echelle: document.getElementById('selectEchelle1').value,
        grille: document.getElementById('selectGrille1').value,
        enCours: window.evaluationEnCours ? window.evaluationEnCours.cartoucheId : null,
        baseCartouche: ev.cartoucheId,
        baseEchelle: ev.echelleId
    };
}, T);

/** La restauration de la visionneuse (+2,5 s puis +0,2 s) passée, et l'auto-save écrit. */
async function laisserPasserLaRestauration(page) {
    await page.waitForTimeout(3500);
    await page.waitForFunction(() => !window._timerAutoSave && !window._modifierEvaluationEnCours && window._bloquerMemorisation === false,
        null, { timeout: 10000 });
}

async function enregistrer(page) {
    await page.evaluate(() => document.getElementById('btnVerrouillerEvaluation').click());
    await page.waitForTimeout(1500);
    await page.waitForFunction(() => !window._timerAutoSave, null, { timeout: 10000 });
}

const sansBruit = (erreurs) => erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m));

test('#947 · visionneuse : copie évaluée sans cartouche ni échelle — la mémoire n\'y pose rien, « Enregistrer » n\'écrit rien', async ({ page }) => {
    const erreurs = await monter(page);
    await page.evaluate(() => window.evaluerProduction('TEST947', 'p947'));
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV947', null, { timeout: 15000 });
    await laisserPasserLaRestauration(page);
    const e = await etat(page);
    console.warn('[947 évaluée sans cartouche] ' + JSON.stringify(e));
    expect.soft(e.cartouche, 'le menu Cartouche reste vide').toBe('');
    expect.soft(e.echelle, 'le menu Échelle ne reçoit pas celle de la mémoire').not.toBe('E947M');
    expect.soft(e.enCours, 'le pivot ne reçoit pas la cartouche de la mémoire').not.toBe('CT947M');
    await enregistrer(page);
    const apres = await etat(page);
    console.warn('[947 après Enregistrer] ' + JSON.stringify(apres));
    expect(apres.baseCartouche, '« Enregistrer » n\'écrit pas la cartouche de la mémoire').not.toBe('CT947M');
    expect(apres.baseEchelle, '« Enregistrer » n\'écrit pas l\'échelle de la mémoire').not.toBe('E947M');
    expect(sansBruit(erreurs)).toEqual([]);
});

test('#947 · visionneuse : copie évaluée avec sa cartouche et son échelle — elle les garde', async ({ page }) => {
    const erreurs = await monter(page, { cartoucheEval: 'CT947', echelleEval: 'E947' });
    await page.evaluate(() => window.evaluerProduction('TEST947', 'p947'));
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV947', null, { timeout: 15000 });
    await laisserPasserLaRestauration(page);
    const e = await etat(page);
    console.warn('[947 évaluée avec cartouche] ' + JSON.stringify(e));
    expect(e.cartouche).toBe('CT947');
    expect(e.echelle).toBe('E947');
    expect(sansBruit(erreurs)).toEqual([]);
});

test('#947 · visionneuse : copie SANS évaluation — la mémoire pré-remplit échelle et cartouche', async ({ page }) => {
    const erreurs = await monter(page);
    await page.evaluate(() => window.evaluerProduction('TEST949', 'p947'));
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.etudiantDA === 'TEST949', null, { timeout: 15000 });
    await laisserPasserLaRestauration(page);
    const e = await etat(page);
    console.warn('[947 sans évaluation] ' + JSON.stringify(e));
    expect(e.cartouche).toBe('CT947M');
    expect(e.echelle).toBe('E947M');
    expect(sansBruit(erreurs)).toEqual([]);
});
