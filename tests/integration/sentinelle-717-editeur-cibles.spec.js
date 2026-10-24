import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #717 — lot N5 (23 sept. 2026) : l'éditeur des cibles de dénotation, à l'écran, sur iPad (768 px, WebKit).
// Vrais clics sur le composant commun (EditeurCibles), dans la gestion des pratiques ET dans l'assistant :
// chaque cible garde son id quand on la déplace, la renomme ou en retire une autre ; retirer une cible cochée
// pose la question (la cible, le nombre d'élèves) et « Annuler » n'écrit rien. Les boutons font 44 px.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

const PRATIQUE = {
    id: 'P_DEN_717', nom: 'DEN 717', type: 'denotation', pratiques: ['DEN'], dansBibliotheque: true, auteur: 'Banc',
    calcul_note: { methode: 'jugement_global' },
    configuration: { type: 'denotation', modeDEN: 'eliminee', objectifs: [{ id: 'cible_lire', nom: 'Lire' }, { id: 'cible_ecrire', nom: 'Écrire' }],
        suggestion: { methode: 'mode' }, echelleId: null, grilleId: null }
};
const JUGEMENTS = { P_DEN_717: {
    '1000001': { ciblesAtteintes: { cible_lire: true, cible_ecrire: true }, noteFinale: 78, justification: 'banc', date: '2026-09-01' },
    '1000002': { ciblesAtteintes: { cible_lire: true, cible_ecrire: false }, noteFinale: 78, justification: 'banc', date: '2026-09-01' }
} };

async function preparer(page) {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.chargerPratiquePourModif === 'function' && !!window.EditeurCibles && typeof window.db !== 'undefined', null, { timeout: 15000 });
    await page.evaluate(({ PRATIQUE, JUGEMENTS }) => {
        window.db.setSync(window.cle('pratiquesConfigurables'), [PRATIQUE]);
        window.db.setSync(window.cle('jugementsDenotation'), JUGEMENTS);
        // #1007, lot 2b : une cible cochée porte des notes, le codex est proposé avant la
        // question. Ce banc juge les identités et la question : doublure « codex à jour »
        // (la fenêtre est jugée par 1007-lignes-notes-2b.spec.js).
        window.Codex.proposerAvantSuppression = async () => true;
    }, { PRATIQUE, JUGEMENTS });
}
const objectifs = (page) => page.evaluate(() => window.db.getSync(window.cle('pratiquesConfigurables'), [])[0].configuration.objectifs);
const lignes = (page, sel) => page.evaluate((sel) => [...document.querySelectorAll(sel + ' .editeur-cibles-ligne')]
    .map(li => ({ id: li.dataset.cibleId, nom: li.querySelector('.editeur-cibles-nom').value })), sel);

test('gestion des pratiques · déplacer, renommer, retirer : les ids restent, la question précède l\'écriture', async ({ page }) => {
    await preparer(page);
    await page.evaluate(() => { window.afficherSection('conception'); window.afficherSousSection('conception-pratiques-notation'); });
    // Le geste réel : choisir la pratique dans le menu de la sélection ouvre son formulaire (#1147).
    await page.evaluate(() => window.afficherListePratiquesMateriel());
    // L'initialisation de la sous-section part 100 ms après `afficherSousSection` (navigation.js) et referme la
    // fiche : le clic sur une carte de l'ancienne barre l'attendait par construction (la barre redessinée), le
    // choix au menu non — on la laisse passer, comme l'enseignant qui arrive à l'écran.
    await page.waitForTimeout(300);
    await page.locator('#menuPratiques').selectOption('P_DEN_717');
    await expect(page.locator('#mat-den-cibles .editeur-cibles-ligne').first()).toBeVisible();
    const liste = page.locator('#mat-den-cibles');
    await expect(liste.locator('.editeur-cibles-ligne')).toHaveCount(2);
    expect(await lignes(page, '#mat-den-cibles')).toEqual([{ id: 'cible_lire', nom: 'Lire' }, { id: 'cible_ecrire', nom: 'Écrire' }]);

    // iPad : chaque bouton fait au moins 44 × 44, et la liste ne déborde pas de la page.
    const tailles = await page.evaluate(() => [...document.querySelectorAll('#mat-den-cibles button')]
        .map(b => { const r = b.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)); }));
    expect(tailles.length).toBe(7);
    expect(Math.min(...tailles)).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    // Déplacer « Lire » vers le bas (vrai tap sur « Descendre »).
    await liste.locator('.editeur-cibles-ligne').first().locator('[data-action="EditeurCibles.descendre"]').click();
    await expect.poll(() => objectifs(page)).toEqual([{ id: 'cible_ecrire', nom: 'Écrire' }, { id: 'cible_lire', nom: 'Lire' }]);

    // Renommer « Écrire » (saisie puis sortie du champ).
    const champ = liste.locator('.editeur-cibles-nom').first();
    await champ.fill('Écrire un essai');
    await champ.press('Tab');
    await expect.poll(() => objectifs(page)).toEqual([{ id: 'cible_ecrire', nom: 'Écrire un essai' }, { id: 'cible_lire', nom: 'Lire' }]);

    // Retirer « Lire », cochée pour deux élèves : la question la nomme ; « Annuler » n'écrit rien et remet la ligne.
    const questions = [];
    page.once('dialog', (d) => { questions.push(d.message()); d.dismiss(); });
    await liste.locator('.editeur-cibles-ligne').nth(1).locator('[data-action="EditeurCibles.retirer"]').click();
    await expect.poll(() => questions.length).toBe(1);
    expect(questions[0]).toContain('« Lire »');
    expect(questions[0]).toContain('cochée pour 2 étudiant·es');
    await expect(liste.locator('.editeur-cibles-ligne')).toHaveCount(2);
    expect(await objectifs(page)).toEqual([{ id: 'cible_ecrire', nom: 'Écrire un essai' }, { id: 'cible_lire', nom: 'Lire' }]);

    // Accepter : « Lire » part ; « Écrire » garde son id ; les coches restent dans les données.
    page.once('dialog', (d) => d.accept());
    await liste.locator('.editeur-cibles-ligne').nth(1).locator('[data-action="EditeurCibles.retirer"]').click();
    await expect.poll(() => objectifs(page)).toEqual([{ id: 'cible_ecrire', nom: 'Écrire un essai' }]);
    expect(await page.evaluate(() => window.db.getSync(window.cle('jugementsDenotation'), {}))).toEqual(JUGEMENTS);

    // Ajouter : une cible neuve reçoit un id neuf, jamais celui de « Lire » ni une position.
    await liste.locator('[data-action="EditeurCibles.ajouter"]').click();
    const nouveau = liste.locator('.editeur-cibles-nom').last();
    await nouveau.fill('Argumenter');
    await nouveau.press('Tab');
    await expect.poll(async () => (await objectifs(page)).length).toBe(2);
    const idNeuf = (await objectifs(page))[1].id;
    expect(idNeuf).not.toBe('cible_lire');
    expect(idNeuf).not.toMatch(/^cible-\d+$/);
});

test('assistant · la réouverture garde les ids ; déplacer puis enregistrer ne touche pas aux coches', async ({ page }) => {
    await preparer(page);
    await page.evaluate(() => {
        window.ouvrirWizardV2(true, 'P_DEN_717');
        window.wizardState.etapeActuelle = 'config-denotation';
        window.afficherEtapeWizardV2('config-denotation');
    });
    const liste = page.locator('#wizardv2-ciblesDenotation');
    await expect(liste.locator('.editeur-cibles-ligne')).toHaveCount(2);
    expect(await lignes(page, '#wizardv2-ciblesDenotation')).toEqual([{ id: 'cible_lire', nom: 'Lire' }, { id: 'cible_ecrire', nom: 'Écrire' }]);
    const tailles = await page.evaluate(() => [...document.querySelectorAll('#wizardv2-ciblesDenotation button')]
        .map(b => { const r = b.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)); }));
    expect(Math.min(...tailles)).toBeGreaterThanOrEqual(44);

    await liste.locator('.editeur-cibles-ligne').nth(1).locator('[data-action="EditeurCibles.monter"]').click();
    await page.locator('#wizard-v2-btn-suivant').click();
    await expect.poll(() => page.evaluate(() => window.wizardState.reponses.ciblesDenotation))
        .toEqual([{ id: 'cible_ecrire', nom: 'Écrire' }, { id: 'cible_lire', nom: 'Lire' }]);
    await page.evaluate(() => window.creerPratiqueV2());
    await expect.poll(() => objectifs(page)).toEqual([{ id: 'cible_ecrire', nom: 'Écrire' }, { id: 'cible_lire', nom: 'Lire' }]);
    expect(await page.evaluate(() => window.db.getSync(window.cle('jugementsDenotation'), {}))).toEqual(JUGEMENTS);
});
