import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 28 oct. 2026 — DES STANDARDS SANS PORTFOLIO, LOT 1, dans l'application réelle (consigne
// `plans de travail/CONSIGNE-LOT-2026-10-28-standards-sans-portfolio-lot-1.md`, § 3).
// CHIM-6 : une pratique Standards de laboratoires et d'examens, l'Examen 2 typé « Évaluation terminale » ; l'élève n'a que
// sa terminale évaluée. Le profil montre l'encadré « Note finale non calculable » et la seconde phrase du mot neuf 2.
// L'unitaire (sentinelle-standards-sans-portfolio) juge la chaîne ; ici, qu'elle s'affiche. Noms fictifs.

const T = 'tstd1028';
const DA = '1028601';
const PHRASE = 'Seule l\'évaluation terminale a une note. En standards, la note du cours s\'appuie aussi sur les productions retenues : elle ne se calcule pas sur la terminale seule.';

test('CHIM-6 · seule la terminale évaluée : le profil dit pourquoi la note manque', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.afficherProfilComplet === 'function'
        && typeof window.calculerDetailsNoteFinale === 'function', null, { timeout: 20000 });
    await page.evaluate(({ T, DA }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-std1028';
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre chimie', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'CHM101', titre: 'Chimie fictive' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_STD1028', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'std-1028', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: DA, nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC_STD1028' },
            { da: '1028602', nom: 'Témoin', prenom: 'Autre', groupe: '01', coursId, groupeCoursId: 'GC_STD1028' }]);
        window.db.setSync(T + '_pratiquesConfigurables', [{ id: 'std-1028', nom: 'Standards de chimie', type: 'standards', calcul_note: { methode: 'conversion_niveaux' },
            dansBibliotheque: true, configuration: { approcheEvaluation: 'par-artefacts', portfolio: { utiliser: true, nombreARetenir: 3, methodeSelection: 'tous', minimumCompletion: 3 } } }]);
        const prod = (id, titre, type, ponderation) => ({ id, titre, description: titre, type, ponderation, groupeCoursId: 'GC_STD1028' });
        window.db.setSync(T + '_productions', [prod('L1', 'Laboratoire 1', 'laboratoire', 15), prod('L2', 'Laboratoire 2', 'laboratoire', 15),
            prod('L3', 'Laboratoire 3', 'laboratoire', 15), prod('X1', 'Examen 1', 'examen', 25), prod('X2', 'Examen 2', 'terminale', 30)]);
        const ev = (id, da, productionId, noteFinale) => ({ id, etudiantDA: da, productionId, noteFinale, niveauFinal: 'M', verrouillee: true, ponderationCouverte: 100,
            groupeCoursId: 'GC_STD1028', coursId, statutRemise: 'evalue', statutIntegrite: 'recevable', criteres: [], dateEvaluation: '2026-10-20T12:00:00.000Z' });
        window.db.setSync(T + '_evaluationsSauvegardees', [ev('E1', DA, 'X2', 85), ev('E2', '1028602', 'L1', 70), ev('E3', '1028602', 'X2', 80)]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'CHM101', groupe: '01', _groupeCoursId: 'GC_STD1028' });
        window.db.setSync('groupeCoursActif', { id: 'GC_STD1028', trimestreId: T });
        window.afficherSection('etudiants');
        window.afficherProfilComplet(DA);
    }, { T, DA });

    const encadre = page.locator('#contenuProfilEtudiant .note-finale-section .alerte-attention');
    await expect(encadre).toContainText('Note finale non calculable.');
    await expect(encadre).toContainText(PHRASE);
    // Ce que l'encadré montre autour de la phrase (rapporté à Grégoire, non changé par le lot) : le bouton des réglages.
    await expect(page.locator('#contenuProfilEtudiant .note-finale-section .lien-reglages')).toHaveText('Réglages de la pratique');
    expect(erreurs).toEqual([]);
});
