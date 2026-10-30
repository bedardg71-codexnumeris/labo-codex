import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racine, 'index.html');

// 29 oct. 2026 — DES STANDARDS SANS PORTFOLIO, LOT 3, dans l'application réelle (consigne
// `plans de travail/CONSIGNE-LOT-2026-10-29-standards-sans-portfolio-lot-3.md`, § 3). La zone « À vérifier » de
// Conception › Productions : pour la chimie (laboratoires et examens pondérés, aucun « Artefact »), la seule ligne du
// texte 1 (lu dans TEXTES), sans bouton « Typer comme terminale » ; pour la pratique de Grégoire (six artefacts, un
// conteneur, une terminale, plus un exercice pondéré), l'avertissement d'avant. L'unitaire (sentinelle-standards-sans-
// portfolio, section G) juge la fonction ; ici, que la zone l'affiche. Noms fictifs.

const T = 'tstd1029b';
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');   // la forme de bareme-2
// Le texte 1 du lot 3, retouché par le texte 8 du lot 5 (sa seconde citation : l'encadré).
const TEXTE_1 = lire('plans de travail/TEXTES-2026-10-29-standards-lot-5.md')
    .split(/^## /m).find(s => s.startsWith('8.')).split('\n').filter(l => l.startsWith('> '))[1].slice(2).trim();

const CHIMIE = [['L1', 'Laboratoire 1', 'laboratoire', 15], ['L2', 'Laboratoire 2', 'laboratoire', 15], ['L3', 'Laboratoire 3', 'laboratoire', 15],
    ['X1', 'Examen 1', 'examen', 25], ['X2', 'Examen 2', 'examen', 30]];
const GREG = [['PF', 'Portfolio', 'portfolio', 60]].concat([1, 2, 3, 4, 5, 6].map(i => ['A' + i, 'Artefact ' + i, 'artefact-portfolio', 0]))
    .concat([['W1', 'Exercice 1', 'examen', 10], ['T1', 'Analyse finale', 'terminale', 40]]);

async function zoneAVerifier(page, productions) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.afficherSousSection === 'function', null, { timeout: 20000 });
    await page.evaluate(({ T, productions }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-std1029b';
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'CHM101', titre: 'Cours fictif' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_STD1029B', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'std-1029b', actif: true }]);
        // Une échelle : sans elle, la Standards est « illisible » (aucune instance) et la zone se tait (#898).
        window.db.setSync(T + '_echellesTemplates', [{ id: 'E1029', nom: 'IDME fictive', seuilMaitrise: 'M', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40 }, { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75 }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100 }] }]);
        window.db.setSync(T + '_pratiquesConfigurables', [{ id: 'std-1029b', nom: 'Standards fictifs', type: 'standards', calcul_note: { methode: 'conversion_niveaux' },
            dansBibliotheque: true, configuration: { approcheEvaluation: 'par-artefacts', echelleId: 'E1029', portfolio: { utiliser: true, nombreARetenir: 3, methodeSelection: 'tous', minimumCompletion: 3 } } }]);
        window.db.setSync(T + '_productions', productions.map(([id, titre, type, ponderation], i) => (
            { id, titre, description: titre, type, numero: i + 1, groupeCoursId: 'GC_STD1029B', ponderation })));
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'CHM101', groupe: '01', _groupeCoursId: 'GC_STD1029B' });
        window.db.setSync('groupeCoursActif', { id: 'GC_STD1029B', trimestreId: T });
        window.afficherSection('conception');
        window.afficherSousSection('conception-productions');
    }, { T, productions });
    // La liste rendue après les données posées (l'ouverture de la sous-section a pu la rendre avant).
    await page.evaluate(() => window.afficherTableauProductions());
    return page.locator('#zone-avertissements-productions');
}

test('CHIM-1 · laboratoires et examens pondérés, aucun « Artefact » : la zone dit le texte 1, une seule ligne, sans bouton', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    const zone = await zoneAVerifier(page, CHIMIE);
    await expect(zone.locator('li')).toHaveCount(1);
    await expect(zone).toBeVisible();
    expect((await zone.locator('li').textContent()).replace(/\s+/g, ' ').trim()).toBe(TEXTE_1);
    await expect(zone.locator('[data-action="typerProductionCommeTerminale"]')).toHaveCount(0);
    expect(erreurs).toEqual([]);
});

test('GREG · six artefacts, un conteneur, une terminale et un exercice pondéré : l\'avertissement d\'avant', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    const zone = await zoneAVerifier(page, GREG);
    await expect(zone.locator('li')).toHaveCount(1);
    await expect(zone.locator('li')).toHaveText('« Exercice 1 » porte une pondération (10 %) mais n\'entre pas dans le calcul STD : seuls le pool d\'artefacts et l\'évaluation terminale comptent.');
    expect(erreurs).toEqual([]);
});
