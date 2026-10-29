import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 29 oct. 2026 — LES JETONS PAR DÉFAUT, dans l'application réelle (consigne
// `plans de travail/CONSIGNE-LOT-2026-10-29-jetons-par-defaut.md`, § 2). La pratique active de la démonstration ne règle
// pas ses jetons : le moteur les offre, et le formulaire le dit maintenant (case cochée ; avant : décochée). Avec un
// « non » explicite de l'assistant (`configuration.jetons = { activer: false }`), Annoter ne propose plus « Jeton de
// reprise » (avant : proposé, le « non » n'étant pas lu). L'unitaire (sentinelle-jetons-par-defaut-2026-10-29) juge le
// moteur, l'assistant et les modèles ; ici, que l'écran l'affiche. Données de la démonstration (fictives).

async function ouvrirDemo(page) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.activerModeDemo === 'function', null, { timeout: 20000 });
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForFunction(() => typeof window.obtenirIdPratiqueActive === 'function' && !!window.obtenirIdPratiqueActive(), null, { timeout: 20000 });
    return page.evaluate(() => window.obtenirIdPratiqueActive());
}

/** Pose (ou retire) le réglage de jetons de la pratique active, comme l'assistant l'écrit. */
const poserReglage = (page, id, jetons) => page.evaluate(({ id, jetons }) => {
    // security-ok: jeu d'essai littéral d'un test, aucune source externe.
    const liste = db.getSync(cle('pratiquesConfigurables'), []) || [];
    const p = liste.find(x => x.id === id);
    p.configuration = Object.assign({}, p.configuration || {});
    if (jetons) p.configuration.jetons = jetons; else delete p.configuration.jetons;
    delete p.jetons;
    if (p.config) delete p.config.jetons;
    db.setSync(cle('pratiquesConfigurables'), liste);
}, { id, jetons });

/** Annoter : déposer un fichier, rendre l'étape 2 de l'import ; rend les valeurs du menu « Production ». */
const optionsProduction = async (page) => {
    await page.evaluate(async () => {
        const f = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34])], 'copie.pdf', { type: 'application/pdf' });
        window.travauxImport.viderFileDAttente();
        await window.travauxImport.ajouterFichiersEnAttente([f]);
        window.travauxUI.afficherImport();
    });
    const menu = page.locator('#pipeline-select-production');
    await expect(menu).toBeAttached();
    return menu.locator('option').evaluateAll(os => os.map(o => o.value));
};

test('le formulaire : sans réglage, la case s\'affiche cochée ; avec le « non » de l\'assistant, décochée', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    const id = await ouvrirDemo(page);
    await poserReglage(page, id, null);
    await page.evaluate(() => naviguerVers('conception', 'pratiques-notation'));
    await page.evaluate((id) => chargerPratiquePourModif(id), id);
    await expect(page.locator('#mat-jetons-actif')).toBeChecked();
    await expect(page.locator('#mat-jetons-regles-ailleurs')).toBeHidden();

    await poserReglage(page, id, { activer: false });
    await page.evaluate((id) => chargerPratiquePourModif(id), id);
    await expect(page.locator('#mat-jetons-actif')).not.toBeChecked();
    await expect(page.locator('#mat-jetons-regles-ailleurs')).toBeVisible();
    await expect(page.locator('#mat-jetons-regles-ailleurs')).toHaveText(/ne peut pas les modifier\.\s*$/);
    expect(erreurs).toEqual([]);
});

test('Annoter : « Jeton de reprise » est proposé sans réglage, plus après un « non » explicite', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    const id = await ouvrirDemo(page);
    await poserReglage(page, id, null);
    expect(await optionsProduction(page)).toContain('__jeton_reprise__');
    await poserReglage(page, id, { activer: false });
    expect(await optionsProduction(page)).not.toContain('__jeton_reprise__');
    expect(erreurs).toEqual([]);
});
