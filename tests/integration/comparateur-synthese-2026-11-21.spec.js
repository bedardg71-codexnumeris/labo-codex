import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// lot/comparateur-synthese (21 nov. 2026) — Labo › Comparateur : « Ce que règle cette pratique » sous chaque colonne.
// Le texte est éprouvé en Vitest (sentinelle-comparateur-synthese-recap) ; ici, ce que seul un navigateur dit : le volet
// est replié d'office, s'ouvre au clavier, ne fait pas déborder le tableau à 820 px, ne montre jamais « CIB », et
// n'écrit rien. Pack démo + une pratique « Par standards » fictive posée dans le stockage du banc.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

async function ouvrirAvecParStandards(page) {
    await page.goto(indexHtml);
    await attendreApplication(page);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    // Le pack démo est posé quand ses pratiques sont lues (aucune pause fixe).
    await expect.poll(() => page.evaluate(() => (db.getSync(cle('pratiquesConfigurables'), []) || []).length)).toBeGreaterThan(0);
    await page.evaluate(async () => {
        const EC = window.EnsemblesCibles;
        const echs = db.getSync(cle('echellesTemplates'), []) || [];
        echs.push(EC.echelleDeDepart('ECH_BANC_SYNTH'));
        db.setSync(cle('echellesTemplates'), echs);
        await EC.enregistrer({ id: 'ENSC_BANC_SYNTH', coursId: null, cibles: [
            { id: 'c1', etiquette: 'Lire un récit inventé', poids: 2, criteres: [{ id: 'k1', texte: 'Repère le narrateur', essentiel: true }] },
            { id: 'c2', etiquette: 'Rédiger une analyse', poids: 1, terminale: true, criteres: [] }] });
        const pr = db.getSync(cle('pratiquesConfigurables'), []) || [];
        pr.push({ id: 'pratique_banc_synth', nom: 'Banc fictif par standards', type: 'cibles', pratiques: ['CIB'], dansBibliotheque: true,
            calcul_note: { methode: 'niveaux_par_cible' },
            configuration: { type: 'cibles', ensembleCiblesId: 'ENSC_BANC_SYNTH', echelleId: 'ECH_BANC_SYNTH', niveauSansDonnee: '0' } });
        db.setSync(cle('pratiquesConfigurables'), pr);
        naviguerVers('labo', 'comparateur');
    });
    await expect(page.locator('.comparateur-select[data-slot="1"]')).toBeVisible();
    await page.selectOption('.comparateur-select[data-slot="1"]', 'pratique_banc_synth');
    await expect(page.locator('details.comparateur-synthese')).toHaveCount(2);
}

const stock = (page) => page.evaluate(() => JSON.stringify([db.getSync(cle('pratiquesConfigurables'), null),
    db.getSync(cle('ensemblesCibles'), null), db.getSync(cle('echellesTemplates'), null)]));

test.describe('Comparateur : « Ce que règle cette pratique »', () => {
    test('replié d\'office, ouvert au clavier, le texte du récapitulatif, jamais « CIB », rien d\'écrit', async ({ page }) => {
        await ouvrirAvecParStandards(page);
        const avant = await stock(page);
        const volets = page.locator('details.comparateur-synthese');
        for (let i = 0; i < 2; i++) await expect(volets.nth(i)).not.toHaveAttribute('open', /.*/);

        const resume = volets.nth(1).locator('summary');
        await expect(resume).toHaveText('Ce que règle cette pratique');
        await resume.focus();
        await page.keyboard.press('Enter');
        await expect(volets.nth(1)).toHaveAttribute('open', /.*/);

        // Au caractère près : le corps du volet EST la section que rend la source unique.
        const memeHtml = await page.evaluate(() => {
            const env = (db.getSync(cle('pratiquesConfigurables'), []) || []).find(p => p.id === 'pratique_banc_synth');
            const attendu = document.createElement('div'); attendu.innerHTML = window.syntheseConfigurationDePratique(env);
            const corps = document.querySelectorAll('details.comparateur-synthese')[1].querySelector('.comparateur-synthese-corps');
            return corps.innerHTML === attendu.innerHTML;
        });
        expect(memeHtml).toBe(true);
        await expect(volets.nth(1)).toContainText('Configuration – Par standards');
        await expect(volets.nth(1)).toContainText('cible terminale');
        await expect(page.locator('#labo-comparateur')).not.toContainText('CIB');
        expect(await stock(page)).toBe(avant);
    });

    test('à 820 px de large, ni fermé ni ouvert, le tableau ne déborde', async ({ page }) => {
        await page.setViewportSize({ width: 820, height: 1180 });
        await ouvrirAvecParStandards(page);
        const deborde = () => page.evaluate(() => {
            const m = document.querySelector('.comparateur-matrice');
            return m.scrollWidth > m.clientWidth || document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(await deborde()).toBe(false);
        await page.locator('details.comparateur-synthese summary').nth(0).click();
        await page.locator('details.comparateur-synthese summary').nth(1).click();
        expect(await deborde()).toBe(false);
    });
});
