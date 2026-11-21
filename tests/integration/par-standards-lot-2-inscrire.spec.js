import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 21 nov. 2026 — LA PRATIQUE « PAR STANDARDS », LOT 2 : INSCRIRE UN NIVEAU, dans l'application réelle (consigne
// `plans de travail/CONSIGNE-LOT-2026-11-21-moteur-cibles-2-inscrire.md`). Le geste de bout en bout : le tableau des
// cibles, l'inscription avec des critères cochés, l'historique, l'annulation (barrée, datée, raison), le geste
// « inscrire pour une production », la liste des cibles d'une production. L'unitaire
// (sentinelle-par-standards-lot-2-inscrire) juge la forme et les registres ; ici, l'écran. Noms fictifs.
// Jugé sous Chromium dans le conteneur (playwright.chromium.config.js) ; Safari reste dû au Mac.

const T = 'a2026';
const GC = 'GC_CIB2';
const ZOE = '2100001';
const YAN = '2100002';

async function ouvrirTableau(page, { niveaux, inscriptions = [] } = {}) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.TableauCibles && window.InscriptionsCibles, null, { timeout: 20000 });
    await page.evaluate(({ T, GC, ZOE, YAN, niveaux, inscriptions }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-cib2';
        const echelle = { id: 'ECH_CIB2', nom: 'Échelle fictive', niveaux };
        const ensemble = { id: 'ENSC_CIB2', coursId, cibles: [
            { id: 'cible_a', etiquette: 'Analyser un texte', enonce: 'Analyser un texte littéraire en relevant les procédés et leurs effets.', poids: 1, terminale: false,
                criteres: [{ id: 'crit_a1', texte: 'Relève au moins trois procédés pertinents', essentiel: true },
                    { id: 'crit_a2', texte: 'Explique l\'effet de chaque procédé', essentiel: true }, { id: 'crit_a3', texte: 'Cite le texte avec exactitude', essentiel: false }] },
            { id: 'cible_b', etiquette: 'Structurer', enonce: 'Organiser un propos en paragraphes cohérents.', poids: 1, terminale: false,
                criteres: [{ id: 'crit_b1', texte: 'Chaque paragraphe a une idée directrice', essentiel: true }] },
            { id: 'cible_c', etiquette: 'Rédiger une dissertation', enonce: 'Rédiger une dissertation explicative complète.', poids: 2, terminale: true, criteres: [] }] };
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Cours fictif' }]);
        window.db.setSync(T + '_groupesCours', [{ id: GC, trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'cib-2', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: ZOE, nom: 'Fictive', prenom: 'Zoé', groupe: '01', coursId, groupeCoursId: GC },
            { da: YAN, nom: 'Inventé', prenom: 'Yan', groupe: '01', coursId, groupeCoursId: GC },
            { da: '2100003', nom: 'Imaginaire', prenom: 'Léa', groupe: '01', coursId, groupeCoursId: GC }]);
        window.db.setSync(T + '_echellesTemplates', [echelle]);
        window.db.setSync(T + '_ensemblesCibles', [ensemble]);
        window.db.setSync(T + '_pratiquesConfigurables', [{ id: 'cib-2', nom: 'Par standards fictive', calcul_note: { methode: 'niveaux_par_cible' }, dansBibliotheque: true,
            configuration: { type: 'cibles', ensembleCiblesId: ensemble.id, echelleId: echelle.id, niveauSansDonnee: String(niveaux[0].code) } }]);
        window.db.setSync(T + '_productions', [
            { id: 'P1', titre: 'Analyse 1', type: 'travail', numero: 1, groupeCoursId: GC, ponderation: 10 },
            { id: 'P2', titre: 'Dissertation', type: 'travail', numero: 2, groupeCoursId: GC, ponderation: 10, ciblesRenseignees: ['cible_a', 'cible_c'] }]);
        window.db.setSync(T + '_inscriptionsCibles', inscriptions);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: GC });
        window.db.setSync('groupeCoursActif', { id: GC, trimestreId: T });
        window.afficherSection('evaluations');
        window.afficherSousSection('evaluations-liste');
        window.TableauNotation.afficher();
    }, { T, GC, ZOE, YAN, niveaux, inscriptions });
    await expect(page.locator('.tc-tableau')).toBeVisible();
}

const CINQ = [['0', 'Données insuffisantes', 0, 'var(--gris-moyen)'], ['1', 'En apprentissage', 25, 'var(--niveau-attention-critique)'],
    ['2', 'Ça y est presque', 50, 'var(--niveau-attention-modere)'], ['3', 'Acquis', 75, 'var(--niveau-attention-minimal)'], ['4', 'Avancé', 100, 'var(--niveau-attention-nul)']]
    .map(([code, nom, v, couleur], i) => ({ code, nom, valeurCalcul: v, min: i * 20, max: i * 20 + 19, couleur }));
const stock = (page) => page.evaluate((T) => window.db.getSync(T + '_inscriptionsCibles'), T);

test('le tableau des cibles : une colonne par cible, la phrase de la note absente, une case vide par étudiant·e', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirTableau(page, { niveaux: CINQ });
    await expect(page.locator('.tc-col-cible .tn-production-titre')).toHaveText(['Analyser un texte', 'Structurer', 'Rédiger une dissertation']);
    await expect(page.locator('.tc-note-absente')).toHaveText('Pas encore de note : cette pratique par standards ne calcule pas encore. La note viendra des niveaux inscrits pour chaque cible.');
    await expect(page.locator('.tc-case')).toHaveCount(9);
    await expect(page.locator('.tc-case--vide')).toHaveCount(9);
    // La cible tactile : 44 px au moins, dans les deux sens.
    const boite = await page.locator('.tc-case').first().boundingBox();
    expect(boite.width).toBeGreaterThanOrEqual(44);
    expect(boite.height).toBeGreaterThanOrEqual(44);
    expect(erreurs).toEqual([]);
});

test('inscrire avec des critères cochés, rouvrir, annuler : l\'inscription reste, barrée, datée, avec sa raison', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirTableau(page, { niveaux: CINQ });
    const laCase = page.locator(`.tc-case[data-da="${ZOE}"][data-cible="cible_a"]`);
    await laCase.click();
    const f = page.locator('.tc-fenetre');
    await expect(f.locator('.tc-cible-etiquette')).toHaveText('Analyser un texte');
    await expect(f.locator('.tc-critere .cibles-fiche-essentiel')).toHaveCount(2);
    await f.locator('.tc-critere[data-critere="crit_a1"] .tc-coche--oui').click();
    await f.locator('.tc-critere[data-critere="crit_a2"] .tc-coche--non').click();
    await expect(f.locator('.tc-niveaux input:checked'), 'aucun niveau proposé').toHaveCount(0);
    await f.locator('.tc-niveau', { hasText: 'Ça y est presque' }).click();
    await f.locator('.tc-retroaction').fill('Procédés bien relevés ; <b>effets</b> à expliquer.');
    await f.locator('.tc-origine').selectOption('P1');
    await f.locator('[data-tc="inscrire"]').click();
    await expect(page.locator('.tc-fenetre')).toHaveCount(0);
    await expect(laCase).toHaveAttribute('aria-label', 'Zoé Fictive, Analyser un texte : dernier niveau inscrit Ça y est presque, 1 inscription');
    let s = await stock(page);
    expect(s).toHaveLength(1);
    expect(s[0]).toMatchObject({ type: 'inscription', da: ZOE, cibleId: 'cible_a', niveau: '2', productionId: 'P1' });
    expect(s[0].criteres.map(k => k.respecte)).toEqual([true, false, null]);

    // Rouvrir : l'historique, puis annuler avec une raison.
    await laCase.click();
    await expect(f.locator('.tc-entree')).toHaveCount(1);
    await expect(f.locator('.tc-entree-note')).toHaveText('Procédés bien relevés ; <b>effets</b> à expliquer.');
    await f.locator('[data-tc="annuler"]').click();
    await page.locator('#ui-dialogue-saisie').fill('Erreur de saisie : mauvaise étudiante.');
    await page.locator('#overlay-ui-dialogue .btn-supprimer').click();
    await expect(f.locator('.tc-entree--annulee')).toHaveCount(1);
    await expect(f.locator('.tc-entree-annulation')).toHaveText(/^Annulée le .+ : Erreur de saisie : mauvaise étudiante\.$/);
    await expect(f.locator('.tc-entree--annulee .tc-entree-corps')).toHaveCSS('text-decoration-line', 'line-through');
    s = await stock(page);
    expect(s).toHaveLength(2);
    expect(s[1]).toMatchObject({ type: 'annulation', inscriptionId: s[0].id, raison: 'Erreur de saisie : mauvaise étudiante.' });
    await page.keyboard.press('Escape');
    await expect(page.locator('.tc-fenetre')).toHaveCount(0);
    await expect(laCase).toHaveAttribute('aria-label', 'Zoé Fictive, Analyser un texte : aucune inscription');
    expect(erreurs).toEqual([]);
});

test('inscrire pour une production : seules ses cibles sont offertes ; seule celle qui reçoit un niveau s\'inscrit', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirTableau(page, { niveaux: CINQ });
    await page.locator('[data-tc="par-production"]').click();
    const f = page.locator('.tc-fenetre');
    await f.locator('.tc-pr-eleve').selectOption(YAN);
    await f.locator('.tc-pr-production').selectOption('P2');
    await expect(f.locator('.tc-bloc-cible > legend')).toHaveText(['Analyser un texte', 'Rédiger une dissertation Cible terminale']);
    await f.locator('.tc-bloc-cible[data-cible="cible_c"] .tc-niveau', { hasText: 'Avancé' }).click();
    await expect(f.locator('.tc-bloc-cible[data-cible="cible_c"] .tc-bloc-details')).toBeVisible();
    await expect(f.locator('.tc-bloc-cible[data-cible="cible_a"] .tc-bloc-details')).toBeHidden();
    await f.locator('[data-tc="inscrire-production"]').click();
    await expect(page.locator('.tc-fenetre')).toHaveCount(0);
    const s = await stock(page);
    expect(s).toHaveLength(1);
    expect(s[0]).toMatchObject({ da: YAN, cibleId: 'cible_c', niveau: '4', productionId: 'P2' });
    await expect(page.locator(`.tc-case[data-da="${YAN}"][data-cible="cible_c"] .tc-case-niveau`)).toHaveText('4');
    expect(erreurs).toEqual([]);
});

test('une échelle à trois niveaux : trois tuiles, le « sans donnée » compris, et il s\'inscrit comme un autre', async ({ page }) => {
    const TROIS = [['A', 'Absent', 0], ['P', 'Partiel', 60], ['R', 'Réussi', 100]].map(([code, nom, v], i) => ({ code, nom, valeurCalcul: v, min: i * 34, max: i * 34 + 33 }));
    await ouvrirTableau(page, { niveaux: TROIS });
    await page.locator(`.tc-case[data-da="${ZOE}"][data-cible="cible_b"]`).click();
    const f = page.locator('.tc-fenetre');
    await expect(f.locator('.tc-niveaux .tc-niveau')).toHaveCount(3);
    await expect(f.locator('.tc-niveau-marque')).toHaveText(['sans donnée']);
    await f.locator('.tc-niveau', { hasText: 'Absent' }).click();
    await f.locator('[data-tc="inscrire"]').click();
    await expect(page.locator('.tc-fenetre')).toHaveCount(0);
    expect((await stock(page)).map(i => i.niveau)).toEqual(['A']);
});

test('la fiche d\'une production : les cibles qu\'elle renseigne, cochées, et l\'enregistrement suit le changement', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrirTableau(page, { niveaux: CINQ });
    await page.evaluate(async () => { window.afficherSection('conception'); window.afficherSousSection('conception-productions'); await window.modifierProduction('P2'); });
    const bloc = page.locator('#productionCiblesBloc');
    await expect(bloc).toBeVisible();
    await expect(bloc.locator('.prod-cible')).toHaveText(['Analyser un texte', 'Structurer', 'Rédiger une dissertation']);
    await expect(bloc.locator('.prod-cible-case:checked')).toHaveCount(2);
    await bloc.locator('.prod-cible-case[value="cible_c"]').uncheck();
    await bloc.locator('.prod-cible-case[value="cible_b"]').check();
    await expect.poll(() => page.evaluate((T) => (window.db.getSync(T + '_productions') || []).find(p => p.id === 'P2').ciblesRenseignees, T))
        .toEqual(['cible_a', 'cible_b']);
    expect(erreurs).toEqual([]);
});
