import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// PORTE #926 (20 septembre 2026) — « ENREGISTRER » GRISÉ SOUS UN CADENAS OUVERT.
//
// Rapport de Grégoire, 20 sept. 2026, 6 h 52, trimestre A2024 : le cadenas de la palette est OUVERT, le bouton
// « Enregistrer » est gris. Mesuré le même matin dans ses données (lecture seule) : 10 évaluations de portfolio
// du groupe 00002 sont restées non enregistrées (`verrouillee: false`), donc hors de la note et de la complétion.
// Cause : le panneau Paramètres est du HTML statique, il garde l'état du dernier chargement. « Consulter » une
// évaluation verrouillée éteint le bouton ; « Consulter » ensuite une évaluation NON verrouillée ouvrait le
// cadenas sans jamais rallumer le formulaire (`_gererIndicateurEtVerrouillageModif` n'avait que la moitié du
// si/sinon que `verifierEtChargerEvaluationExistante` porte en entier).
//
// Le banc fait le trajet vécu : la liste, « Consulter » la verrouillée, retour à la liste, « Consulter » l'autre.
// Aucun `page.click` : `change` sur le vrai menu de la liste, `el.click()` sur le vrai bouton.

const T = 't926';

async function monter(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.evaluerProduction === 'function'
        && typeof window.executerActionEval === 'function' && typeof window.sauvegarderEvaluation === 'function');
    await page.evaluate((T) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-926';
        const commune = { productionId: 'p926', grilleId: 'G926', echelleId: 'E926', cartoucheId: '', groupeCoursId: 'GC_926', coursId,
            statutRemise: 'remis', statutIntegrite: 'recevable' };
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre sans copie', annee: 2024, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_926', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: 'TEST926A', nom: 'Allard', prenom: 'Léa', groupe: '01', coursId, groupeCoursId: 'GC_926' },
            { da: 'TEST926B', nom: 'Bouchard', prenom: 'Tom', groupe: '01', coursId, groupeCoursId: 'GC_926' }
        ]);
        window.db.setSync(T + '_productions', [{ id: 'p926', titre: 'Portfolio', type: 'travail', ponderation: 100, grilleId: 'G926', echelleId: 'E926', groupeCoursId: 'GC_926' }]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'G926', nom: 'Grille témoin', type: 'holistique', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 100, type: 'holistique' }] }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'E926', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'M', nom: 'Maîtrisé', min: 55, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }] }]);
        // Allard : enregistrée, donc verrouillée. Bouchard : posée par l'enregistrement automatique, jamais enregistrée.
        window.db.setSync(T + '_evaluationsSauvegardees', [
            { ...commune, id: 'EVAL926A', etudiantDA: 'TEST926A', criteres: [{ critereId: 'c1', niveauSelectionne: 'M' }], noteFinale: 80,
                dateEvaluation: '2024-10-20T12:00:00.000Z', verrouillee: true },
            { ...commune, id: 'EVAL926B', etudiantDA: 'TEST926B', criteres: [{ critereId: 'c1', niveauSelectionne: 'I' }], noteFinale: 40,
                dateEvaluation: '2024-10-21T12:00:00.000Z', verrouillee: false }
        ]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_926' });
        window.db.setSync('groupeCoursActif', { id: 'GC_926', trimestreId: T });
    }, T);
    return erreurs;
}

async function consulter(page, evalId, da, c1) {
    await page.evaluate(() => { window.afficherSection('evaluations'); window.afficherSousSection('evaluations-liste'); });
    await page.waitForFunction((id) => !!document.querySelector(`.eval-actions-select option[value="consulter|${id}"]`), evalId, { timeout: 10000 });
    await page.evaluate((id) => {
        const menu = document.querySelector(`.eval-actions-select option[value="consulter|${id}"]`).closest('select');
        menu.value = `consulter|${id}`;
        menu.dispatchEvent(new Event('change', { bubbles: true }));
    }, evalId);
    await page.waitForFunction(([da, c1]) => (document.getElementById('selectEtudiantEval') || {}).value === da
        && !!document.getElementById('eval_c1') && document.getElementById('eval_c1').value === c1, [da, c1], { timeout: 10000 });
    // Le cadenas est posé à la toute fin du chargement, avec l'état du formulaire : on l'attend, puis on lit.
    await page.waitForFunction(() => {
        const cadenas = document.getElementById('btnVerrouPalette');
        return !!cadenas && cadenas.style.display !== 'none' && !!cadenas.querySelector('img');
    }, null, { timeout: 10000 });
}

const etat = (page) => page.evaluate(() => ({
    cadenasOuvert: /icon-open-lock/.test(document.getElementById('btnVerrouPalette').innerHTML),
    enregistrerEteint: document.getElementById('btnVerrouillerEvaluation').disabled,
    bouton: document.getElementById('btnVerrouillerEvaluation').textContent.trim(),   // lot C (D1)
    niveauEteint: document.getElementById('eval_c1').disabled
}));

// #927 (même matin, même montage) — LA LISTE DIT CE QUE LA NOTE SAIT. Elle affichait « Évalué » pour une évaluation
// que la note et la complétion ignoraient : rien ne menait aux 10 portfolios. Mot validé par Grégoire : « Non enregistrée ».
test('#927 · la liste nomme l\'évaluation non enregistrée, et le filtre « Non enregistrée » n\'en garde qu\'elle', async ({ page }) => {
    const erreurs = await monter(page);
    await page.evaluate(() => { window.afficherSection('evaluations'); window.afficherSousSection('evaluations-liste'); });
    await page.waitForFunction(() => document.querySelectorAll('tr[data-evaluation-id^="EVAL926"]').length === 2, null, { timeout: 10000 });

    const badges = () => page.evaluate(() => Array.from(document.querySelectorAll('tr[data-evaluation-id^="EVAL926"]'))
        .map((tr) => ({ id: tr.dataset.evaluationId, badge: tr.querySelector('.travaux-badge-pill').textContent.trim(),
            classe: tr.querySelector('.travaux-badge-pill').className.replace('travaux-badge-pill', '').trim() }))
        .sort((a, b) => a.id.localeCompare(b.id)));
    expect(await page.evaluate(() => document.querySelector('tr[data-evaluation-id="EVAL926B"] .travaux-badge-pill').title),
        'lot C : l\'aide courte').toBe('Non verrouillée : ne compte pas encore dans la note.');
    expect(await badges()).toEqual([
        { id: 'EVAL926A', badge: 'Évalué', classe: 'evalue' },
        { id: 'EVAL926B', badge: 'Non verrouillée', classe: 'non-enregistree' }   // lot C (D1)
    ]);

    await page.evaluate(() => {
        const filtre = document.getElementById('filtre-statut-eval');
        // L'option vit dans index.html : sans elle, `value` retomberait sur « Tous » et le banc ne filtrerait rien.
        filtre.value = 'non-enregistree';
        filtre.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(await page.evaluate(() => document.getElementById('filtre-statut-eval').value)).toBe('non-enregistree');
    await page.waitForFunction(() => document.querySelectorAll('tr[data-evaluation-id^="EVAL926"]').length === 1, null, { timeout: 10000 }).catch(() => {});
    expect((await badges()).map((b) => b.id)).toEqual(['EVAL926B']);
    expect(erreurs).toEqual([]);
});

test('#926 · « Consulter » une évaluation non enregistrée APRÈS une verrouillée : cadenas ouvert, « Enregistrer » allumé, et il enregistre', async ({ page }) => {
    const erreurs = await monter(page);

    await consulter(page, 'EVAL926A', 'TEST926A', 'M');
    // La prémisse, mesurée : la verrouillée éteint bien le formulaire — c'est cet état que le panneau gardait.
    // Lot C (D1) : sous le verrou, le bouton n'est plus éteint — il devient « Déverrouiller l'évaluation ».
    expect(await etat(page)).toEqual({ cadenasOuvert: false, enregistrerEteint: false, bouton: 'Déverrouiller l\'évaluation', niveauEteint: true });

    await consulter(page, 'EVAL926B', 'TEST926B', 'I');
    expect(await etat(page), 'le cadenas et le bouton disent la même chose').toEqual({ cadenasOuvert: true, enregistrerEteint: false, bouton: 'Verrouiller l\'évaluation', niveauEteint: false });

    await page.waitForFunction(() => !window._autoSaveSuspendu, null, { timeout: 5000 });
    await page.evaluate(() => document.getElementById('btnVerrouillerEvaluation').click());
    await page.waitForFunction((T) => window.db.getSync(T + '_evaluationsSauvegardees', [])
        .some((e) => e.id === 'EVAL926B' && e.verrouillee === true), T, { timeout: 10000 }).catch(() => {});

    const stock = await page.evaluate((T) => window.db.getSync(T + '_evaluationsSauvegardees', [])
        .map((e) => ({ id: e.id, verrouillee: e.verrouillee })).sort((a, b) => a.id.localeCompare(b.id)), T);
    expect(stock, 'le vrai bouton sort l\'évaluation de Bouchard de l\'état « non enregistrée », sans doublon').toEqual([
        { id: 'EVAL926A', verrouillee: true },
        { id: 'EVAL926B', verrouillee: true }
    ]);
    expect(erreurs, 'aucune erreur de page, aucun dialogue').toEqual([]);
});
