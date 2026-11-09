/**
 * LA BANQUE DE TYPES, AU NAVIGATEUR — lot « Production plutôt que copie », étape 2 (9 nov. 2026)
 *
 * Le geste entier, sur une fiche de Conception › Productions déjà enregistrée (elle s'écrit
 * toute seule) : « + Nouveau type… » ouvre la fenêtre, « Prise de sang » entre dans la banque
 * et devient le type de la fiche ; « Gérer mes types… » renomme et retire sans toucher la fiche
 * (décision 9 de Grégoire) ; un exemple se retire de la vue. Les deux options d'action
 * n'écrivent jamais leur valeur dans la production.
 *
 * ⚠ Session cloud : éprouvée sous Chromium seulement ; le verdict WebKit se prend sur le Mac.
 * ⚠ Données de la démo seulement, noms fictifs.
 */
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';
import { attendreRepos, suivreLesReactions } from './harness/attendre-repos.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

async function ouvrirFicheDemo(page) {
    page.on('dialog', async (d) => { await d.accept(); });
    await suivreLesReactions(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await attendreApplication(page);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await attendreRepos(page);
    await page.evaluate(() => naviguerVers('conception', 'productions'));
    await attendreRepos(page);
    const id = await page.evaluate(async () => {
        const liste = db.getSync(cle('productions'), []) || [];
        const p = liste.find(x => x.type === 'artefact-portfolio') || liste[0];
        p.isDemo = false; p.auteur = 'Banc banque'; p.auteurOriginal = 'Banc banque'; delete p.metadata_cc;
        await db.set(cle('productions'), liste);   // security-ok: banc, marque « démo » retirée pour que la fiche s'écrive
        return p.id;
    });
    await page.evaluate((id) => chargerProductionPourModif(id), id);
    await attendreRepos(page);
    return id;
}

const choisir = (page, valeur) => page.evaluate((valeur) => {
    const s = document.getElementById('productionType');
    s.value = valeur;
    s.dispatchEvent(new Event('change', { bubbles: true }));
}, valeur);
const typeEnBase = (page, id) => page.evaluate((id) => (db.getSync(cle('productions'), []) || []).find(p => p.id === id).type, id);
const banque = (page) => page.evaluate(() => db.getSync('banqueTypesProduction', null));
const options = (page) => page.evaluate(() => Array.from(document.getElementById('productionType').options).map(o => o.value));

test('(B1) « + Nouveau type… » : la fenêtre, puis le type dans la banque et sur la fiche', async ({ page }) => {
    test.setTimeout(120000);
    const id = await ouvrirFicheDemo(page);
    const avant = await typeEnBase(page, id);
    expect(await options(page)).toContain('__nouveau-type__');

    await choisir(page, '__nouveau-type__');
    await attendreRepos(page);
    await expect(page.locator('#fenetre-nouveau-type-production')).toBeVisible();
    expect(await page.evaluate(() => document.getElementById('productionType').value), 'le menu revient au type d\'avant').toBe(avant);
    expect(await typeEnBase(page, id), 'l\'option d\'action n\'est jamais écrite').toBe(avant);

    // Un nom réservé est refusé, la fenêtre reste ouverte.
    await page.fill('#nouveau-type-production-nom', 'Portfolio');
    await page.click('#nouveau-type-production-ajouter');
    await expect(page.locator('#nouveau-type-production-erreur')).toBeVisible();

    await page.fill('#nouveau-type-production-nom', 'Prise de sang');
    await page.click('#nouveau-type-production-ajouter');
    await attendreRepos(page);
    await expect(page.locator('#fenetre-nouveau-type-production')).toHaveCount(0);
    expect(await page.evaluate(() => document.getElementById('productionType').value)).toBe('Prise de sang');
    await expect.poll(() => typeEnBase(page, id), { message: 'la fiche s\'écrit avec le nom du type' }).toBe('Prise de sang');
    expect(await banque(page)).toEqual({ types: ['Prise de sang'], exemplesMasques: [] });
    // Aucune définition sous le menu pour un type qui ne change pas le calcul.
    expect(await page.evaluate(() => document.getElementById('carteDefinitionType').classList.contains('u-hide'))).toBe(true);
});

test('(B2) « Gérer mes types… » : renommer et retirer ne touchent pas la fiche ; un exemple se retire de la vue', async ({ page }) => {
    test.setTimeout(120000);
    const id = await ouvrirFicheDemo(page);
    await choisir(page, '__nouveau-type__');
    await attendreRepos(page);
    await page.fill('#nouveau-type-production-nom', 'Prise de sang');
    await page.click('#nouveau-type-production-ajouter');
    await attendreRepos(page);
    await expect.poll(() => typeEnBase(page, id)).toBe('Prise de sang');

    await choisir(page, '__gerer-types__');
    await attendreRepos(page);
    await expect(page.locator('#fenetre-gerer-types-production')).toBeVisible();
    expect(await typeEnBase(page, id)).toBe('Prise de sang');

    const champ = page.locator('#gerer-types-production-banque input[type="text"]').first();
    await champ.fill('Prélèvement');
    await champ.dispatchEvent('change');
    expect((await banque(page)).types).toEqual(['Prélèvement']);
    expect(await typeEnBase(page, id), 'renommer ne réécrit pas la fiche (décision 9)').toBe('Prise de sang');
    expect(await options(page)).toEqual(expect.arrayContaining(['Prélèvement', 'Prise de sang']));

    await page.locator('#gerer-types-production-banque button', { hasText: 'Retirer' }).first().click();
    expect((await banque(page)).types).toEqual([]);
    expect(await typeEnBase(page, id), 'retirer ne réécrit pas la fiche (décision 9)').toBe('Prise de sang');
    expect(await page.evaluate(() => document.getElementById('productionType').value), 'le menu garde le type de la fiche').toBe('Prise de sang');

    await page.locator('#gerer-types-production-exemples input[value="film"]').uncheck();
    expect((await banque(page)).exemplesMasques).toEqual(['film']);
    expect(await options(page)).not.toContain('film');
});
