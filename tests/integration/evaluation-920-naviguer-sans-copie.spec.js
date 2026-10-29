import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// PORTE #920 (18 septembre 2026) — D'UN ÉLÈVE À L'AUTRE SUR LE FORMULAIRE SANS COPIE.
//
// Rapport de Grégoire, 18 sept. 2026, 13 h 56 (1.146.1), saisie des notes d'A2024 : « Je ne peux pas passer
// d'un élève à l'autre comme je le fais dans la page "Évaluer" habituellement. » Mesuré : avec une copie, c'est
// la bande des élèves de la visionneuse qui fait ce geste ; le formulaire sans copie (#868) n'avait rien, et
// l'insertion des flèches d'`evaluation.js` n'avait plus aucun appelant.
//
// Le banc fait le trajet vécu : « Évaluer » depuis la liste, flèche « suivant », un niveau saisi, flèche
// « précédent », retour. Aucun `page.click` : `el.click()` et `change` sur le vrai <select>.

const T = 't920';
const stock = (page) => page.evaluate((T) => window.db.getSync(T + '_evaluationsSauvegardees', [])
    .map((e) => ({ id: e.id.startsWith('EVAL920') ? e.id : 'neuve', da: e.etudiantDA, c1: ((e.criteres || []).find((c) => c.critereId === 'c1') || {}).niveauSelectionne }))
    .sort((a, b) => a.da.localeCompare(b.da)), T);

const barre = (page) => page.evaluate(() => {
    const b = document.getElementById('eval-navigation-sans-copie');
    const visible = !!b && !b.classList.contains('u-hide') && b.getBoundingClientRect().height > 0;
    return {
        visible,
        position: (document.getElementById('eval-navigation-position') || {}).textContent,
        precedentEteint: b.querySelector('[data-action="naviguerEtudiantPrecedent"]').disabled,
        suivantEteint: b.querySelector('[data-action="naviguerEtudiantSuivant"]').disabled,
        eleve: (document.getElementById('travaux-eval-label-etudiant') || {}).textContent,
        production: (document.getElementById('travaux-eval-label-production') || {}).textContent,
        da: (document.getElementById('selectEtudiantEval') || {}).value,
        c1: (document.getElementById('eval_c1') || {}).value
    };
});

async function monter(page, { consulter = false } = {}) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.evaluerProduction === 'function'
        && typeof window.executerActionEval === 'function' && typeof window.naviguerEtudiantSuivant === 'function');
    await page.evaluate(({ T, consulter }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-920';
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre sans copie', annee: 2024, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_920', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: 'TEST920A', nom: 'Allard', prenom: 'Léa', groupe: '01', coursId, groupeCoursId: 'GC_920' },
            { da: 'TEST920B', nom: 'Bouchard', prenom: 'Tom', groupe: '01', coursId, groupeCoursId: 'GC_920' },
            { da: 'TEST920C', nom: 'Côté', prenom: 'Mia', groupe: '01', coursId, groupeCoursId: 'GC_920' }
        ]);
        window.db.setSync(T + '_productions', [{ id: 'p920', titre: 'Analyse', type: 'travail', ponderation: 100, grilleId: 'G920', echelleId: 'E920', groupeCoursId: 'GC_920' }]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'G920', nom: 'Grille témoin', type: 'holistique', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 100, type: 'holistique' }] }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'E920', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'M', nom: 'Maîtrisé', min: 55, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }] }]);
        // Allard a déjà son évaluation ; Bouchard et Côté n'en ont pas. Scénario « Consulter » : celle d'Allard est
        // VERROUILLÉE (l'état de toute évaluation enregistrée) et Bouchard a la sienne.
        const deBouchard = { id: 'EVAL920B', etudiantDA: 'TEST920B', productionId: 'p920', grilleId: 'G920', echelleId: 'E920', cartoucheId: '',
            groupeCoursId: 'GC_920', coursId, statutRemise: 'remis', statutIntegrite: 'recevable',
            criteres: [{ critereId: 'c1', niveauSelectionne: 'I' }], noteFinale: 40, dateEvaluation: '2024-10-21T12:00:00.000Z', verrouillee: false };
        window.db.setSync(T + '_evaluationsSauvegardees', [{
            id: 'EVAL920A', etudiantDA: 'TEST920A', productionId: 'p920', grilleId: 'G920', echelleId: 'E920', cartoucheId: '',
            groupeCoursId: 'GC_920', coursId, statutRemise: 'remis', statutIntegrite: 'recevable',
            criteres: [{ critereId: 'c1', niveauSelectionne: 'M' }], noteFinale: 80,
            dateEvaluation: '2024-10-20T12:00:00.000Z', verrouillee: consulter
        }].concat(consulter ? [deBouchard] : []));
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_920' });
        window.db.setSync('groupeCoursActif', { id: 'GC_920', trimestreId: T });
    }, { T, consulter });
    return erreurs;
}

const fleche = (page, action) => page.evaluate((a) => document.querySelector(`#eval-navigation-sans-copie [data-action="${a}"]`).click(), action);
const attendreEleve = (page, da, c1) => page.waitForFunction(([da, c1]) => (document.getElementById('selectEtudiantEval') || {}).value === da
    && !!document.getElementById('eval_c1') && document.getElementById('eval_c1').value === c1, [da, c1], { timeout: 10000 });

test('#920 · sans copie : les flèches mènent d\'un élève à l\'autre, la saisie en attente est gardée, l\'évaluation existante est relue au retour', async ({ page }) => {
    const erreurs = await monter(page);

    await page.evaluate(() => window.executerActionEval({ value: 'evaluer|TEST920A|p920' }));
    await attendreEleve(page, 'TEST920A', 'M');
    await page.waitForFunction(() => !document.getElementById('eval-navigation-sans-copie').classList.contains('u-hide'));
    expect(await barre(page)).toMatchObject({ visible: true, position: 'Étudiant·e 1 de 3', precedentEteint: true, suivantEteint: false });

    // → Bouchard : formulaire vide, étiquette et position suivent.
    await fleche(page, 'naviguerEtudiantSuivant');
    await attendreEleve(page, 'TEST920B', '');
    const surB = await barre(page);
    expect(surB).toMatchObject({ position: 'Étudiant·e 2 de 3', precedentEteint: false, suivantEteint: false, da: 'TEST920B' });
    expect(surB.eleve).toContain('Tom Bouchard');
    expect(surB.production, 'la production reste nommée (vue « Non associée » à la capture du 18 sept.)').toBe('Analyse');

    // Un niveau saisi pour Bouchard, SANS « Enregistrer », puis → Côté : la saisie en attente est écrite.
    // Le chargement d'un élève suspend l'auto-save une demi-seconde (`_suspendreAutoSaveTemporairement`) :
    // une main humaine arrive après ; le banc attend la levée au lieu de supposer un délai.
    await page.waitForFunction(() => !window._autoSaveSuspendu, null, { timeout: 5000 });
    await page.evaluate(() => {
        const niveau = document.getElementById('eval_c1');
        niveau.value = 'E';
        niveau.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await fleche(page, 'naviguerEtudiantSuivant');
    await attendreEleve(page, 'TEST920C', '');
    expect(await barre(page)).toMatchObject({ position: 'Étudiant·e 3 de 3', suivantEteint: true });
    expect(await stock(page)).toEqual([
        { id: 'EVAL920A', da: 'TEST920A', c1: 'M' },
        { id: 'neuve', da: 'TEST920B', c1: 'E' }
    ]);

    // ← ← retour sur Allard : son évaluation est relue, pas un formulaire vide.
    await fleche(page, 'naviguerEtudiantPrecedent');
    await attendreEleve(page, 'TEST920B', 'E');
    await fleche(page, 'naviguerEtudiantPrecedent');
    await attendreEleve(page, 'TEST920A', 'M');
    const retour = await barre(page);
    expect(retour).toMatchObject({ position: 'Étudiant·e 1 de 3', precedentEteint: true });
    expect(retour.eleve).toContain('Léa Allard');

    expect(erreurs, 'aucune erreur de page, aucun dialogue').toEqual([]);
});

// RETOUR DE GRÉGOIRE, 18 sept. 14 h 42, sur 1.146.4 : « Les flèches ne sont pas là. » Pour un élève déjà noté, la liste
// n'offre que « Consulter » — jamais « Évaluer » : le premier banc ne faisait pas SON geste. Et « Consulter » pose
// `window.evaluationEnCours` avec l'élève et l'id de son évaluation : si ce pivot ne suit pas l'élève, le retour sur
// Allard ne recharge rien et « Enregistrer » écrit dans l'évaluation d'un autre.
test('#920 · par « Consulter », évaluation verrouillée : la barre est là, l\'aller-retour relit chaque évaluation, et « Enregistrer » écrit dans celle de l\'élève affiché', async ({ page }) => {
    const erreurs = await monter(page, { consulter: true });

    await page.evaluate(() => { window.afficherSection('evaluations'); window.afficherSousSection('evaluations-liste'); });
    await page.waitForFunction(() => !!document.querySelector('.eval-actions-select option[value="consulter|EVAL920A"]'), null, { timeout: 10000 });
    // Le menu réel n'offre pas « Évaluer » pour Allard : c'est la prémisse du retour, mesurée.
    expect(await page.evaluate(() => !!document.querySelector('.eval-actions-select option[value^="evaluer|TEST920A"]'))).toBe(false);
    await page.evaluate(() => {
        const menu = document.querySelector('.eval-actions-select option[value="consulter|EVAL920A"]').closest('select');
        menu.value = 'consulter|EVAL920A';
        menu.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await attendreEleve(page, 'TEST920A', 'M');
    await page.waitForFunction(() => !document.getElementById('eval-navigation-sans-copie').classList.contains('u-hide'), null, { timeout: 10000 });
    expect(await barre(page)).toMatchObject({ visible: true, position: 'Étudiant·e 1 de 3', precedentEteint: true, suivantEteint: false });

    await fleche(page, 'naviguerEtudiantSuivant');
    await attendreEleve(page, 'TEST920B', 'I');
    // L'invariant : le pivot posé par « Consulter » porte l'élève AFFICHÉ et l'id de SON évaluation. Un pivot resté sur
    // Allard avec l'id de Bouchard ferait écrire, par un autre chemin que les flèches, le formulaire de l'un dans l'évaluation de l'autre.
    await page.waitForFunction(() => (window.evaluationEnCours || {}).idModification === 'EVAL920B', null, { timeout: 5000 }).catch(() => {});
    expect(await page.evaluate(() => ({ da: window.evaluationEnCours.etudiantDA, id: window.evaluationEnCours.idModification })))
        .toEqual({ da: 'TEST920B', id: 'EVAL920B' });
    await fleche(page, 'naviguerEtudiantPrecedent');
    await attendreEleve(page, 'TEST920A', 'M');          // le retour RELIT l'évaluation d'Allard
    await fleche(page, 'naviguerEtudiantSuivant');
    await attendreEleve(page, 'TEST920B', 'I');

    await page.waitForFunction(() => !window._autoSaveSuspendu, null, { timeout: 5000 });
    await page.evaluate(() => {
        const niveau = document.getElementById('eval_c1');
        niveau.value = 'E';
        niveau.dispatchEvent(new Event('change', { bubbles: true }));
        document.getElementById('btnVerrouillerEvaluation').click();
    });
    await page.waitForFunction((T) => window.db.getSync(T + '_evaluationsSauvegardees', [])
        .some((e) => e.id === 'EVAL920B' && (e.criteres || []).some((c) => c.niveauSelectionne === 'E')), T, { timeout: 10000 }).catch(() => {});

    expect(await stock(page)).toEqual([
        { id: 'EVAL920A', da: 'TEST920A', c1: 'M' },
        { id: 'EVAL920B', da: 'TEST920B', c1: 'E' }
    ]);
    expect(erreurs, 'aucune erreur de page, aucun dialogue').toEqual([]);
});

// RAPPORT DE GRÉGOIRE, 18 sept. 15 h 39, encore sur 1.146.4 : « Je suis toujours à 24/24, pour peu importe quel élève. » La barre
// n'était recalculée que par « Évaluer » : ouverte ensuite par « Consulter », elle gardait la position du dernier « Évaluer ».
// Le banc refait ce trajet : « Évaluer » la DERNIÈRE élève (3 de 3, flèche droite éteinte), puis « Consulter » la première.
test('#920 · après « Évaluer » la dernière élève, « Consulter » la première remet la barre sur elle — pas sur la position d\'avant', async ({ page }) => {
    const erreurs = await monter(page, { consulter: true });

    await page.evaluate(() => window.executerActionEval({ value: 'evaluer|TEST920C|p920' }));
    await attendreEleve(page, 'TEST920C', '');
    await page.waitForFunction(() => (document.getElementById('eval-navigation-position') || {}).textContent === 'Étudiant·e 3 de 3', null, { timeout: 10000 });
    expect(await barre(page)).toMatchObject({ position: 'Étudiant·e 3 de 3', suivantEteint: true });

    await page.evaluate(() => { window.afficherSection('evaluations'); window.afficherSousSection('evaluations-liste'); });
    await page.waitForFunction(() => !!document.querySelector('.eval-actions-select option[value="consulter|EVAL920A"]'), null, { timeout: 10000 });
    await page.evaluate(() => {
        const menu = document.querySelector('.eval-actions-select option[value="consulter|EVAL920A"]').closest('select');
        menu.value = 'consulter|EVAL920A';
        menu.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await attendreEleve(page, 'TEST920A', 'M');
    await page.waitForFunction(() => (document.getElementById('eval-navigation-position') || {}).textContent === 'Étudiant·e 1 de 3', null, { timeout: 10000 }).catch(() => {});
    expect(await barre(page)).toMatchObject({ visible: true, position: 'Étudiant·e 1 de 3', precedentEteint: true, suivantEteint: false });
    expect(erreurs).toEqual([]);
});
