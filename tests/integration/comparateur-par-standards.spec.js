import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 21 nov. 2026 — LE COMPARATEUR DÉCRIT « PAR STANDARDS » (Labo → Exploration), dans l'application réelle.
// Rapport : plans de travail/RAPPORT-2026-11-21-comparateur-par-standards.md.
// L'unitaire (sentinelle-comparateur-par-standards) juge l'extracteur ligne par ligne ; ici, la colonne telle que
// l'écran la rend : la pratique active du groupe est une « Par standards », le comparateur lit son ensemble de cibles
// par son propriétaire, et une ligne qu'elle ne porte pas s'affiche « s.o. ». Noms fictifs.

const T = 'a2026';
const GC = 'GC_CMPSTD';
const NBSP = ' ';

const CINQ = [['0', 'Données insuffisantes', 0], ['1', 'En apprentissage', 25], ['2', 'Ça y est presque', 50], ['3', 'Acquis', 75], ['4', 'Avancé', 100]]
    .map(([code, nom, v], i) => ({ code, nom, valeurCalcul: v, min: i * 20, max: i * 20 + 19, couleur: 'var(--gris-moyen)' }));

async function installer(page, { configuration = {}, avecEnsemble = true } = {}) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.NoteCibles && window.EnsemblesCibles
        && typeof window.initialiserComparateurPratiques === 'function', null, { timeout: 20000 });
    await page.evaluate(({ T, GC, niveaux, configuration, avecEnsemble }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-cmpstd';
        const echelle = { id: 'ECH_CMPSTD', nom: 'Échelle fictive', niveaux };
        const ensemble = { id: 'ENSC_CMPSTD', coursId, cibles: [
            { id: 'cible_a', etiquette: 'Analyser', enonce: 'Analyser un texte littéraire.', poids: 1, terminale: false, criteres: [] },
            { id: 'cible_b', etiquette: 'Structurer', enonce: 'Organiser un propos.', poids: 1, terminale: false, criteres: [] },
            { id: 'cible_c', etiquette: 'Dissertation', enonce: 'Rédiger une dissertation.', poids: 2, terminale: true, criteres: [] }] };
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Cours fictif' }]);
        window.db.setSync(T + '_groupesCours', [{ id: GC, trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'cmp-std', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: '2100001', nom: 'Fictive', prenom: 'Zoé', groupe: '01', coursId, groupeCoursId: GC }]);
        window.db.setSync(T + '_echellesTemplates', [echelle]);
        window.db.setSync(T + '_ensemblesCibles', avecEnsemble ? [ensemble] : []);
        window.db.setSync(T + '_pratiquesConfigurables', [{ id: 'cmp-std', nom: 'Par standards fictive', type: 'cibles', calcul_note: { methode: 'niveaux_par_cible' },
            dansBibliotheque: true, configuration: Object.assign({ type: 'cibles', ensembleCiblesId: ensemble.id, echelleId: echelle.id, niveauSansDonnee: '0' }, configuration) }]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: GC });
        window.db.setSync('groupeCoursActif', { id: GC, trimestreId: T });
    }, { T, GC, niveaux: CINQ, configuration, avecEnsemble });
    await page.evaluate(() => { window.afficherSection('labo'); window.afficherSousSection('labo-comparateur'); });
    await expect(page.locator('#comparateur-matrice table.comparateur-matrice-table')).toBeVisible();
}

/** La colonne de la pratique « Par standards fictive » : { libellé de la ligne → texte de sa cellule }. */
async function colonneParStandards(page) {
    return page.evaluate(() => {
        const table = document.querySelector('#comparateur-matrice table.comparateur-matrice-table');
        const selects = [...table.querySelectorAll('thead .comparateur-select')];
        const rang = selects.findIndex(s => s.value === 'cmp-std');
        const lignes = {};
        table.querySelectorAll('tr.comparateur-ligne-constr').forEach(tr => {
            lignes[tr.querySelector('th').textContent.trim()] = tr.querySelectorAll('td')[rang].textContent.trim();
        });
        return { rang, lignes, sigle: (table.querySelectorAll('thead th.comparateur-col-pratique')[rang].querySelector('.badge-type-pratique') || {}).textContent };
    });
}

test('la colonne « Par standards » dit ses cibles, son échelle et ses règles ; rien de l\'ancienne famille', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await installer(page);
    const { rang, lignes, sigle } = await colonneParStandards(page);
    expect(rang).toBeGreaterThanOrEqual(0);
    expect(sigle).toBe('STD');
    expect(lignes).toMatchObject({
        'Cibles comptées': '3 cibles, dont 1 terminale',
        'Alignement sur des cibles d\'apprentissage': 'Couvert (la note se rapporte aux cibles)',
        'Reprises': 'Le meilleur niveau démontré est retenu pour chaque cible ; une reprise ne le fait jamais baisser',
        'Ce à quoi la note se rapporte': 'Cibles d\'apprentissage',
        'Échelle de performance': 'Échelle fictive (5 niveaux)',
        'Niveaux de performance (évaluations)': '5 niveaux',
        'Niveau « sans donnée »': 'Données insuffisantes',
        'Pondération': 'Inégale entre les cibles (poids de 1 à 2)',
        'Calcul de la note': 'Moyenne pondérée des valeurs des niveaux retenus',
        'Double seuil': 'Éteint',
        'Notes finalisées': 'Non : pas de note tant qu\'une cible est sans donnée'
    });
    // Une ligne que la pratique ne porte pas : « s.o. », jamais une valeur empruntée.
    expect(lignes['Productions comptées']).toBe('s.o.');
    const tout = Object.values(lignes).join(' | ');
    expect(tout).not.toMatch(/artefact|instruments|prend la place de la copie|Portfolio/i);
    expect(erreurs).toEqual([]);
});

test('le double seuil allumé et les notes finalisées se lisent dans la colonne', async ({ page }) => {
    await installer(page, { configuration: { doubleSeuil: { actif: true, seuil: 60, plafond: 55 }, notesFinales: true } });
    const { lignes } = await colonneParStandards(page);
    expect(lignes['Double seuil']).toBe(`Note plafonnée à 55${NBSP}% si la moyenne des cibles terminales est sous 60${NBSP}%`);
    expect(lignes['Notes finalisées']).toBe(`Oui : une cible sans donnée compte pour 0${NBSP}%`);
});

test('un ensemble de cibles absent du trimestre : la colonne le dit, sans erreur', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await installer(page, { avecEnsemble: false });
    const { lignes } = await colonneParStandards(page);
    expect(lignes['Cibles comptées']).toBe('Cibles introuvables dans ce trimestre');
    expect(lignes['Pondération']).toBe('Cibles introuvables dans ce trimestre');
    expect(erreurs).toEqual([]);
});
