import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 29 oct. 2026 — #1180 · LES ÉLÈVES DE LA DÉMO PORTENT DES TOTEMS SCOUTS, dans l'application réelle (consigne
// `plans de travail/CONSIGNE-LOT-2026-10-29-noms-demo-totems.md`, § 3). La démo activée, la Liste du Suivi montre les
// dix totems et aucun des anciens noms (des personnalités réelles). L'unitaire (sentinelle-noms-demo-totems-2026-10-29)
// juge le pack et le stock ; ici, que l'écran l'affiche.

const TOTEMS = [['Castor', 'Jovial'], ['Mésange', 'Joyeuse'], ['Hérisson', 'Chaleureux'], ['Bernache', 'Fidèle'],
    ['Vigogne', 'Fière'], ['Suricate', 'Loyal'], ['Condor', 'Courageux'], ['Grue', 'Gracieuse'],
    ['Gazelle', 'Intrépide'], ['Panda', 'Serein']];
const ANCIENS = ['Aimé', 'Césaire', 'Marie', 'Curie', 'Félix', 'Leclerc', 'Gabrielle', 'Roy', 'Frida', 'Kahlo',
    'Nelson', 'Mandela', 'Lionel', 'Messi', 'Toni', 'Morrison', 'Oumou', 'Sangaré', 'Ravi', 'Shankar'];

test('la démo activée, la Liste montre les dix totems et aucun ancien nom', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.activerModeDemo === 'function', null, { timeout: 20000 });
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.evaluate(() => naviguerVers('suivi', 'liste'));
    const lignes = page.locator('#tbody-suivi-liste tr');
    await expect(lignes).toHaveCount(10, { timeout: 20000 });

    const texte = await page.locator('#tbody-suivi-liste').textContent();
    for (const [prenom, nom] of TOTEMS) {
        expect(texte, `${prenom} ${nom}`).toContain(prenom);
        expect(texte, `${prenom} ${nom}`).toContain(nom);
    }
    const restants = ANCIENS.filter((n) => new RegExp(`(?<!\\p{L})${n}(?!\\p{L})`, 'u').test(texte));
    expect(restants).toEqual([]);
    expect(erreurs).toEqual([]);
});
