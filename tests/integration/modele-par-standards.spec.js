import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 21 nov. 2026 — LE « MODÈLE PAR STANDARDS » DE L'ASSISTANT, dans l'application réelle.
// Rapport : plans de travail/RAPPORT-2026-11-21-modele-par-standards.md. L'unitaire (sentinelle-modele-par-standards)
// juge les règles une à une ; ici, le parcours entier : Partir d'un modèle → Modèle par standards → écrire deux cibles →
// récapitulatif → la pratique créée, son tableau des cibles ouvert. Noms fictifs.

const T = 'a2026';
const GC = 'GC_MODSTD';

async function ouvrir(page) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.EnsemblesCibles && window.EditeurCibles && window.TableauCibles
        && typeof window.ouvrirWizardV2 === 'function', null, { timeout: 20000 });
    await page.evaluate(({ T, GC }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: 'cours-modstd', codeCours: 'FRA101', titre: 'Cours fictif' }]);
        window.db.setSync(T + '_groupesCours', [{ id: GC, trimestreId: T, coursId: 'cours-modstd', groupeNum: '01', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: '2100001', nom: 'Fictive', prenom: 'Zoé', groupe: '01', coursId: 'cours-modstd', groupeCoursId: GC }]);
        window.db.setSync(T + '_pratiquesConfigurables', []);
        window.db.setSync(T + '_echellesTemplates', []);
        window.db.setSync(T + '_productions', []);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: 'cours-modstd', codeCours: 'FRA101', groupe: '01', _groupeCoursId: GC });
        window.db.setSync('groupeCoursActif', { id: GC, trimestreId: T });
    }, { T, GC });
    await page.evaluate(() => window.ouvrirWizardV2());
    await expect(page.locator('#wizard-v2-titre')).toHaveText('Comment veux-tu créer ta pratique ?');
}
const suivant = (page) => page.locator('#wizard-v2-btn-suivant').click();
const carte = (page, texte) => page.locator('.wizard-v2-radio-card', { hasText: texte });
const lirePratiques = (page) => page.evaluate((T) => window.db.getSync(T + '_pratiquesConfigurables', []) || [], T);

async function jusquAuxModeles(page) {
    await carte(page, 'Partir d\'un modèle').click();
    await suivant(page);
    await expect(page.locator('#wizard-v2-titre')).toHaveText('Choisis un modèle');
}
async function ecrireDeuxCibles(page) {
    const lignes = page.locator('.editeur-cibles-ligne--std');
    if (await lignes.count() === 0) await page.locator('.editeur-cibles-ajouter').first().click();
    await lignes.nth(0).locator('.editeur-cibles-etiquette').fill('Analyser un texte');
    await lignes.nth(0).locator('.editeur-cibles-enonce').fill('Analyser un texte littéraire fictif.');
    await page.locator('.editeur-cibles-ajouter').first().click();
    await lignes.nth(1).locator('.editeur-cibles-etiquette').fill('Rédiger une dissertation');
}

test('la liste des modèles : les cinq d\'avant, dans leur ordre, puis « Modèle par standards », à l\'essai, sigle STD', async ({ page }) => {
    await ouvrir(page);
    await jusquAuxModeles(page);
    const titres = await page.locator('.wizard-v2-radio-card .wizard-v2-card-title').allTextContents();
    expect(titres.map(t => t.replace(/\s+/g, ' ').trim())).toEqual([
        'N plus récentes HYB · Général', 'N meilleures évaluations HYB · Général', 'Modèle cumulatif CUM · Général',
        'Modèle simple SPE · Général', 'Modèle de base DEN · Général', 'Modèle par standards STD · Général À l’essai']);
    const laCarte = carte(page, 'Modèle par standards');
    await expect(laCarte.locator('.etiquette-essai')).toHaveText('À l’essai');
    await expect(laCarte.locator('.wizard-v2-card-description')).toHaveText('Pour débuter avec une notation par standards : tu écris les cibles de ton cours');
    await expect(page.locator('.wizard-v2-radio-card .etiquette-essai')).toHaveCount(1);
    await expect(page.locator('#wizard-v2-contenu')).not.toContainText('CIB');
    await expect(page.locator('#wizard-v2-contenu [onclick]')).toHaveCount(0);
});

test('le parcours entier : Partir d\'un modèle → Modèle par standards → deux cibles → récapitulatif → la pratique créée, son tableau des cibles', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrir(page);
    await jusquAuxModeles(page);
    await carte(page, 'Modèle par standards').click();
    await suivant(page);

    // L'étape des cibles, pas le récapitulatif ; rien n'est écrit.
    await expect(page.locator('#wizard-v2-titre')).toHaveText('Les cibles du cours');
    expect(await lirePratiques(page)).toEqual([]);

    // Sans cible, l'assistant ne passe pas : le refus se lit.
    await suivant(page);
    await expect(page.locator('#wizard-v2-titre')).toHaveText('Les cibles du cours');

    await ecrireDeuxCibles(page);
    await suivant(page);
    // L'échelle est déjà posée : son étape ne s'ouvre pas.
    await expect(page.locator('#wizard-v2-titre')).toHaveText('Récapitulatif');
    const recap = page.locator('#wizard-v2-contenu');
    await expect(recap).toContainText('Configuration – Par standards');
    await expect(recap).toContainText('Analyser un texte');
    await expect(recap).toContainText('Rédiger une dissertation');
    await expect(recap).toContainText('Échelle de départ – Par standards');
    await expect(recap).toContainText('0 – Données insuffisantes');
    await expect(recap).not.toContainText('CIB');
    await expect(page.locator('#wizard-v2-recap-nom')).toHaveValue('Modèle par standards');
    await page.locator('#wizard-v2-recap-nom').fill('Par standards du cours fictif');

    await page.locator('#wizard-v2-btn-creer').click();
    await expect.poll(async () => (await lirePratiques(page)).length).toBe(1);
    const etat = await page.evaluate((T) => ({
        pratiques: window.db.getSync(T + '_pratiquesConfigurables', []),
        ensembles: window.db.getSync(T + '_ensemblesCibles', []),
        echelles: window.db.getSync(T + '_echellesTemplates', []),
        bibliotheque: window.db.getSync(window.CLE_BIBLIOTHEQUE_PRATIQUES || 'bibliothequePratiques', []) || []
    }), T);
    const p = etat.pratiques[0];
    expect(p).toMatchObject({ nom: 'Par standards du cours fictif', type: 'cibles', calcul_note: { methode: 'niveaux_par_cible' },
        jetons: { actif: false }, inspireDe: { sourceId: 'par-standards' } });
    expect(p.configuration.doubleSeuil).toBeUndefined();               // éteint
    expect(p.configuration.niveauSansDonnee).toBe('0');
    expect(etat.ensembles).toHaveLength(1);
    expect(etat.ensembles[0].id).toBe(p.configuration.ensembleCiblesId);   // la pratique nomme un ensemble qui existe
    expect(etat.ensembles[0].cibles.map(c => c.etiquette)).toEqual(['Analyser un texte', 'Rédiger une dissertation']);
    // L'échelle de départ de la pratique est rangée avec elle ; celle que l'application sème (IDME) n'est pas touchée.
    const deDepart = etat.echelles.filter(e => e.nom === 'Échelle de départ – Par standards');
    expect(deDepart.map(e => e.id)).toEqual([p.configuration.echelleId]);
    expect(deDepart[0].niveaux.map(n => [n.code, n.valeurCalcul])).toEqual([['0', 0], ['1', 25], ['2', 50], ['3', 75], ['4', 100]]);
    expect(etat.bibliotheque).toEqual([]);                              // le modèle n'entre pas dans la bibliothèque

    // Son tableau des cibles : une colonne par cible, tout « sans donnée ».
    await page.evaluate(async ({ T, GC, id }) => {
        const gc = window.db.getSync(T + '_groupesCours', []);
        gc[0].pratiqueId = id;
        window.db.setSync(T + '_groupesCours', gc);   // security-ok: fixture du banc (désigner la pratique au groupe fictif)
        window.afficherSection('evaluations');
        window.afficherSousSection('evaluations-liste');
        await window.TableauNotation.afficher();
    }, { T, GC, id: p.id });
    await expect(page.locator('.tc-col-cible .tn-production-titre')).toHaveText(['Analyser un texte', 'Rédiger une dissertation']);
    await expect(page.locator('.tc-tableau tbody tr .tc-case')).toHaveText(['Données insuffisantes', 'Données insuffisantes']);
    expect(erreurs).toEqual([]);
});

test('une seconde pratique par le même modèle réutilise l\'échelle de départ déjà rangée, et a son propre ensemble', async ({ page }) => {
    await ouvrir(page);
    for (const nom of ['Première fictive', 'Seconde fictive']) {
        if (nom === 'Seconde fictive') await page.evaluate(() => window.ouvrirWizardV2());
        await jusquAuxModeles(page);
        await carte(page, 'Modèle par standards').click();
        await suivant(page);
        await ecrireDeuxCibles(page);
        await suivant(page);
        await page.locator('#wizard-v2-recap-nom').fill(nom);
        await page.locator('#wizard-v2-btn-creer').click();
        await expect.poll(async () => (await lirePratiques(page)).some(p => p.nom === nom)).toBe(true);
    }
    const etat = await page.evaluate((T) => ({ p: window.db.getSync(T + '_pratiquesConfigurables', []), e: window.db.getSync(T + '_echellesTemplates', []), c: window.db.getSync(T + '_ensemblesCibles', []) }), T);
    expect(etat.e.filter(e => e.nom === 'Échelle de départ – Par standards')).toHaveLength(1);
    expect(etat.c).toHaveLength(2);
    expect(etat.p[0].configuration.echelleId).toBe(etat.p[1].configuration.echelleId);
    expect(etat.p[0].configuration.ensembleCiblesId).not.toBe(etat.p[1].configuration.ensembleCiblesId);
});

test('un autre modèle saute toujours au récapitulatif ; revenir et changer d\'avis ne laisse rien du modèle par standards', async ({ page }) => {
    await ouvrir(page);
    await jusquAuxModeles(page);
    await carte(page, 'Modèle par standards').click();
    await suivant(page);
    await expect(page.locator('#wizard-v2-titre')).toHaveText('Les cibles du cours');
    await page.locator('#wizard-v2-btn-precedent').click();
    await expect(page.locator('#wizard-v2-titre')).toHaveText('Choisis un modèle');
    await carte(page, 'Modèle cumulatif').click();
    await suivant(page);
    await expect(page.locator('#wizard-v2-titre')).toHaveText('Récapitulatif');
    await expect(page.locator('#wizard-v2-recap-nom')).toHaveValue('Modèle cumulatif');
    await page.locator('#wizard-v2-btn-creer').click();
    await expect.poll(async () => (await lirePratiques(page)).length).toBe(1);
    const etat = await page.evaluate((T) => ({ p: window.db.getSync(T + '_pratiquesConfigurables', []), e: window.db.getSync(T + '_echellesTemplates', []), c: window.db.getSync(T + '_ensemblesCibles', null) }), T);
    expect(etat.p[0].type).toBe('sommative');
    expect(etat.p[0]).not.toHaveProperty('inspireDe');
    expect(etat.e.filter(e => e.nom === 'Échelle de départ – Par standards')).toEqual([]);
    expect(etat.c === null || etat.c.length === 0).toBe(true);
});

// Les captures du rapport : posées seulement à la demande (CAPTURES_MODELE = un dossier).
test('captures : la liste des modèles et l\'étape des cibles, 1180 × 820 et 820 × 1180, clair et sombre', async ({ page }) => {
    const dossier = process.env.CAPTURES_MODELE;
    test.skip(!dossier, 'CAPTURES_MODELE non posée');
    const fs = await import('node:fs');
    fs.mkdirSync(dossier, { recursive: true });
    const peint = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const prendre = async (nom) => {
        for (const [l, h] of [[1180, 820], [820, 1180]]) {
            await page.setViewportSize({ width: l, height: h });
            for (const sombre of [false, true]) {
                await page.evaluate((s) => document.body.classList.toggle('mode-clair', !s), sombre);
                await peint();
                // Les transitions du thème sont menées à leur terme : sans cela, la capture saisit des cartes à mi-chemin (vu le 21 nov.).
                await page.screenshot({ path: path.join(dossier, `${nom}-${l}x${h}-${sombre ? 'sombre' : 'clair'}.png`), animations: 'disabled' });
            }
        }
    };
    await page.setViewportSize({ width: 1180, height: 820 });
    await ouvrir(page);
    await jusquAuxModeles(page);
    await carte(page, 'Modèle par standards').scrollIntoViewIfNeeded();
    await prendre('modeles');                                   // aucune carte cochée : les mots se lisent
    await carte(page, 'Modèle par standards').click();
    await suivant(page);
    await ecrireDeuxCibles(page);
    await prendre('cibles');
});
