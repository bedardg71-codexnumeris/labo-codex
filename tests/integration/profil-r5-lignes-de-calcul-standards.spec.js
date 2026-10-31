import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// R5 (décision de Grégoire, 31 oct. 2026) — LE PROFIL EN STANDARDS : LES LIGNES DE CALCUL REPRENNENT LE MOT DU TITRE.
// Tant que les notes ne sont pas finalisées, « Note provisoire = … », « … pondérée (…) », « … (portfolio à 100 %) » ;
// une fois finalisées, « Note finale … ». Sur le vrai profil, dans un vrai WebKit : chaque forme, dans les deux états.

const T = 'tr5';
const DA = '5000001';
const CATEGORIES = { actif: true, selection: { nombreARetenir: 2, ponderation: 65 }, obligatoires: { ponderation: 35 } };
const artefact = (id, categorie) => ({ id, titre: id, type: 'artefact-portfolio', categorie, ponderation: 0 });
const NOTES = [['S1', 70], ['S2', 67]];

const FORMES = [
    { nom: 'hybride, les deux contributions', categories: CATEGORIES,
        productions: [artefact('S1', 'selection'), artefact('S2', 'selection'), artefact('O1', 'obligatoire')],
        notes: [...NOTES, ['O1', 81.2]], suite: ' = 44,5 pts + 28,4 pts = 72,9 %' },
    { nom: 'hybride, sans obligatoire à additionner', categories: CATEGORIES,
        productions: [artefact('S1', 'selection'), artefact('S2', 'selection')],
        notes: NOTES, suite: ' pondérée (Sélection 65 % + Obligatoires 35 % = 100 %)' },
    { nom: 'classique, avec terminale', categories: null,
        productions: [{ id: 'PF', titre: 'Portfolio', type: 'portfolio', ponderation: 60 }, artefact('S1'), artefact('S2'), { id: 'T1', titre: 'Analyse finale', type: 'terminale', ponderation: 40 }],
        notes: [...NOTES, ['T1', 80]], suite: ' pondérée (60 % + 40 % = 100 %)' },
    { nom: 'classique, sans terminale', categories: null,
        productions: [artefact('S1'), artefact('S2')],
        notes: NOTES, suite: ' (portfolio à 100 %)' }
];

async function lireCarte(page, { categories, productions, notes }, notesFinales) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.afficherProfilComplet === 'function', null, { timeout: 20000 });
    return page.evaluate(({ T, DA, categories, productions, notes, notesFinales }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-r5';
        const portfolio = { actif: true, utiliser: true, methodeSelection: 'meilleurs', nombreARetenir: 2, minimumCompletion: 1 };
        const configuration = { type: 'standards', notesFinales, portfolio };
        if (categories) { configuration.categories = categories; portfolio.categories = categories; }
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Cours fictif' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_R5', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'std-r5', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: DA, nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC_R5' }]);
        window.db.setSync(T + '_pratiquesConfigurables', [{ id: 'std-r5', nom: 'Standards du banc', type: 'standards', configuration }]);
        window.db.setSync(T + '_productions', productions.map((p, i) => Object.assign({ description: p.titre, dateEcheance: `2026-09-0${i + 1}`, groupeCoursId: 'GC_R5' }, p)));
        window.db.setSync(T + '_evaluationsSauvegardees', notes.map(([productionId, noteFinale], i) => ({ id: 'E' + i, etudiantDA: DA, productionId, noteFinale, niveauFinal: 'D',
            verrouillee: true, groupeCoursId: 'GC_R5', coursId, statutRemise: 'remis', statutIntegrite: 'recevable', criteres: [], dateEvaluation: '2026-09-20T12:00:00.000Z' })));
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_R5' });
        window.db.setSync('groupeCoursActif', { id: 'GC_R5', trimestreId: T });
        window.afficherProfilComplet(DA);
        const carte = document.querySelector('#contenuProfilEtudiant .note-finale-section');
        const lire = (s) => { const n = carte && carte.querySelector(s); return n ? n.textContent.replace(/\s+/g, ' ').trim() : null; };
        return { titre: lire('.note-finale-titre'), formule: lire('.note-finale-formule') };
    }, { T, DA, categories, productions, notes, notesFinales });
}

for (const forme of FORMES) {
    test(`${forme.nom} : non finalisée, « Note provisoire » ; finalisée, « Note finale »`, async ({ page }) => {
        const provisoire = await lireCarte(page, forme, false);
        expect(provisoire.titre).toContain('Note provisoire de session');
        expect(provisoire.formule).toBe('Note provisoire' + forme.suite);

        const finale = await lireCarte(page, forme, true);
        expect(finale.titre).toContain('Note finale de session');
        expect(finale.formule).toBe('Note finale' + forme.suite);
    });
}
