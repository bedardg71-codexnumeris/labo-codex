import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// =======================================================================
// #1007, LOT 2b (3 oct. 2026) — LE CODEX PROPOSÉ AVANT DE RETIRER UNE LIGNE QUI PORTE DES NOTES
// =======================================================================
//
// Sur la vraie page, par le vrai bouton :
//  - un critère qu'une évaluation emploie : la fenêtre AVANT la question habituelle ;
//    « Annuler » ne retire rien, n'écrit rien, ne pose pas la question ;
//  - un critère qu'aucune évaluation n'emploie : aucune fenêtre, la question, le retrait ;
//  - une cible de dénotation cochée (gestion des pratiques, où le retrait s'écrit au clic) :
//    la fenêtre AVANT la question existante (« Tu retires une cible déjà cochée… ») ;
//    « Annuler » remet la liste ; « Supprimer sans codex » mène à la question, puis au retrait.
// Le banc n'a pas de codex actif : la fenêtre est celle « sans codex » (2a-1 a jugé les deux
// titres et le chemin de mise à jour, communs à toutes les portes). La structure et la lecture
// « déjà employé », famille par famille : tests/unit/sentinelle-1007-lignes-notes.test.js.

const TITRE_SANS_CODEX = 'Écrire un codex avant de supprimer ?';
const BOUTONS_SANS_CODEX = ['Annuler', 'Supprimer sans codex', 'Écrire un codex, puis supprimer'];
const SUITE_LE = 'Ton codex à jour pourra te le rendre, jusqu\'à ta mise à jour suivante.';
const SUITE_LA = 'Ton codex à jour pourra te la rendre, jusqu\'à ta mise à jour suivante.';

function brancher(page) {
    const etat = { questions: [], erreurs: [] };
    page.on('pageerror', (e) => etat.erreurs.push(e.message));
    page.on('dialog', (d) => { etat.questions.push(d.message()); d.accept().catch(() => {}); });
    return etat;
}

const fenetre = (page) => page.evaluate(() => {
    const o = document.getElementById('overlay-ui-dialogue');
    if (!o || o.getClientRects().length === 0) return null;
    return {
        titre: o.querySelector('.modal-titre').textContent,
        texte: o.querySelector('.modal-section').textContent.replace(/\s+/g, ' ').trim(),
        boutons: Array.from(o.querySelectorAll('.modal-actions button')).map((b) => b.textContent.trim()),
        focus: document.activeElement ? document.activeElement.textContent.trim() : null
    };
});
const attendreFenetre = async (page) => {
    await expect.poll(async () => (await fenetre(page))?.titre ?? null, { timeout: 30000 }).toBe(TITRE_SANS_CODEX);
    return fenetre(page);
};
const cliquerDansFenetre = (page, texte) => page.locator('#overlay-ui-dialogue .modal-actions button', { hasText: texte }).click();
const aucuneFenetre = async (page) => expect.poll(() => fenetre(page), { timeout: 15000 }).toBeNull();
/** Le clic du bouton, sans l'attendre : la fenêtre doit pouvoir paraître. */
const cliquerSans = async (page, selecteur) => {
    const n = await page.evaluate((s) => { const el = document.querySelector(s); if (!el) return 0; el.click(); return 1; }, selecteur);
    expect(n, 'bouton introuvable : ' + selecteur).toBe(1);
};

const lireGrille = (page) => page.evaluate(() =>
    JSON.parse(JSON.stringify((db.getSync(cle('grillesTemplates'), []) || []).find((g) => g.id === 'GR_BANC_2B') || null)));

/** Pack démo, puis une grille du banc (copie d'une grille de la démo) et UNE évaluation qui emploie son premier critère. */
async function demarrerGrille(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForTimeout(1500);
    const ids = await page.evaluate(async () => {
        const grilles = db.getSync(cle('grillesTemplates'), []) || [];
        const modele = grilles.find((g) => (g.criteres || []).length >= 2 && g.criteres.every((c) => c.id));
        const g = JSON.parse(JSON.stringify(modele));
        g.id = 'GR_BANC_2B'; g.nom = 'Grille du banc 2b';
        db.setSync(cle('grillesTemplates'), grilles.concat([g]));
        const cleEv = cle('evaluationsSauvegardees');
        db.setSync(cleEv, (db.getSync(cleEv, []) || []).concat([{ id: 'EVAL_BANC_2B', etudiantDA: '9000101', productionId: 'PROD_BANC',
            grilleId: 'GR_BANC_2B', echelleId: '', noteFinale: 72,
            criteres: [{ critereId: g.criteres[0].id, critereNom: g.criteres[0].nom, niveauSelectionne: 'D' }] }]));
        await db.flush();
        naviguerVers('conception', 'grille-criteres');
        return g.criteres.map((c) => c.id);
    });
    await page.waitForTimeout(800);
    await page.evaluate(() => chargerGrillePourModif('GR_BANC_2B'));
    await expect(page.locator('[data-action="supprimerCritereGrille"][data-param="GR_BANC_2B"]').first()).toBeAttached();
    return ids;
}

test.describe('#1007, lot 2b — le codex proposé avant de retirer une ligne qui porte des notes', () => {
    test.setTimeout(180000);
    test.beforeEach(async ({ page }) => { page.setDefaultTimeout(15000); });

    test('critère employé : la fenêtre avant la question ; « Annuler » ne retire rien et n\'écrit rien', async ({ page }) => {
        const ecoute = brancher(page);
        const ids = await demarrerGrille(page);
        expect(await page.evaluate(() => Codex.etat().actif)).toBe(false);
        const avant = await lireGrille(page);

        await cliquerSans(page, '[data-action="supprimerCritereGrille"][data-param="GR_BANC_2B"][data-param2="0"]');
        const f = await attendreFenetre(page);
        expect(f.texte).toBe('Supprimer ce critère l\'efface pour de bon. ' + SUITE_LE);
        expect(f.boutons).toEqual(BOUTONS_SANS_CODEX);
        expect(f.focus).toBe('Annuler');
        expect(ecoute.questions, 'la question habituelle vient APRÈS la fenêtre').toEqual([]);

        await cliquerDansFenetre(page, 'Annuler');
        await aucuneFenetre(page);
        await page.waitForTimeout(800);
        expect(ecoute.questions, '« Annuler » : la question n\'est pas posée').toEqual([]);
        expect(await lireGrille(page), '« Annuler » : rien n\'est écrit').toEqual(avant);
        expect((await lireGrille(page)).criteres.map((c) => c.id)).toEqual(ids);
        await expect(page.locator('[data-action="supprimerCritereGrille"][data-param="GR_BANC_2B"]')).toHaveCount(ids.length);
        expect(ecoute.erreurs).toEqual([]);
    });

    test('critère qu\'aucune évaluation n\'emploie : aucune fenêtre, la question, le retrait', async ({ page }) => {
        const ecoute = brancher(page);
        const ids = await demarrerGrille(page);

        await cliquerSans(page, '[data-action="supprimerCritereGrille"][data-param="GR_BANC_2B"][data-param2="1"]');
        await expect.poll(() => ecoute.questions.length).toBe(1);
        expect(ecoute.questions[0]).toBe('Es-tu sûr de vouloir supprimer ce critère ?');
        await expect.poll(async () => (await lireGrille(page)).criteres.map((c) => c.id)).toEqual(ids.filter((_, i) => i !== 1));
        expect(await fenetre(page), 'aucune fenêtre pour une ligne sans notes').toBeNull();
        expect(ecoute.erreurs).toEqual([]);
    });

    test('cible de dénotation cochée : la fenêtre avant la question existante ; « Annuler » remet la liste', async ({ page }) => {
        const ecoute = brancher(page);
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto(indexHtml);
        await page.waitForFunction(() => typeof window.chargerPratiquePourModif === 'function' && !!window.EditeurCibles && typeof window.db !== 'undefined', null, { timeout: 15000 });
        const PRATIQUE = {
            id: 'P_DEN_2B', nom: 'DEN 2b', type: 'denotation', pratiques: ['DEN'], dansBibliotheque: true, auteur: 'Banc',
            calcul_note: { methode: 'jugement_global' },
            configuration: { type: 'denotation', modeDEN: 'eliminee', objectifs: [{ id: 'cible_lire', nom: 'Lire' }, { id: 'cible_ecrire', nom: 'Écrire' }],
                suggestion: { methode: 'mode' }, echelleId: null, grilleId: null }
        };
        await page.evaluate((P) => {
            db.setSync(cle('pratiquesConfigurables'), [P]);
            db.setSync(cle('jugementsDenotation'), { P_DEN_2B: { 9000101: { ciblesAtteintes: { cible_lire: true, cible_ecrire: false }, noteFinale: 78, justification: 'banc', date: '2026-09-01' } } });
        }, PRATIQUE);
        await page.evaluate(() => { afficherSection('conception'); afficherSousSection('conception-pratiques-notation'); afficherListePratiquesMateriel(); });
        await page.locator('#sidebarListePratiques .sidebar-item[data-id="P_DEN_2B"]').click();
        const liste = page.locator('#mat-den-cibles');
        await expect(liste.locator('.editeur-cibles-ligne')).toHaveCount(2);
        const objectifs = () => page.evaluate(() => db.getSync(cle('pratiquesConfigurables'), [])[0].configuration.objectifs);

        // 1. « Lire » est cochée : la fenêtre d'abord, la question existante pas encore
        await liste.locator('.editeur-cibles-ligne').first().locator('[data-action="EditeurCibles.retirer"]').click();
        const f = await attendreFenetre(page);
        expect(f.texte).toBe('Retirer cette cible l\'efface pour de bon. ' + SUITE_LA);
        expect(ecoute.questions).toEqual([]);
        await cliquerDansFenetre(page, 'Annuler');
        await aucuneFenetre(page);
        await expect(liste.locator('.editeur-cibles-ligne'), '« Annuler » remet la liste enregistrée').toHaveCount(2);
        expect(ecoute.questions).toEqual([]);
        expect(await objectifs()).toEqual(PRATIQUE.configuration.objectifs);

        // 2. « Supprimer sans codex » : puis la question existante, telle quelle, puis le retrait
        await liste.locator('.editeur-cibles-ligne').first().locator('[data-action="EditeurCibles.retirer"]').click();
        await attendreFenetre(page);
        await cliquerDansFenetre(page, 'Supprimer sans codex');
        await expect.poll(() => ecoute.questions.length).toBe(1);
        expect(ecoute.questions[0]).toMatch(/^Tu retires une cible déjà cochée\.\n\n« Lire » : cochée pour 1 étudiant·e/);
        await expect.poll(objectifs).toEqual([{ id: 'cible_ecrire', nom: 'Écrire' }]);

        // 3. « Écrire » n'est cochée pour personne : aucune fenêtre, aucune question
        await liste.locator('[data-action="EditeurCibles.ajouter"]').click();
        const neuve = liste.locator('.editeur-cibles-nom').last();
        await neuve.fill('Argumenter');
        await neuve.press('Tab');
        await expect.poll(async () => (await objectifs()).length).toBe(2);
        await liste.locator('.editeur-cibles-ligne').first().locator('[data-action="EditeurCibles.retirer"]').click();
        await expect.poll(async () => (await objectifs()).map((c) => c.nom)).toEqual(['Argumenter']);
        expect(await fenetre(page)).toBeNull();
        expect(ecoute.questions).toHaveLength(1);
        expect(ecoute.erreurs).toEqual([]);
    });
});
