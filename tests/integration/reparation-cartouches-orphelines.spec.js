import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racine, 'index.html');

test('PREUVE · le script de réparation liste puis rattache réellement', async ({ page }) => {
    page.on('dialog', d => d.accept().catch(() => {}));
    page.on('pageerror', e => console.log('PAGEERROR:', e.message));
    const logs = [];
    page.on('console', m => logs.push(m.text()));

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    await page.evaluate(async () => {
        db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');
        // security-ok: fixtures littérales écrites par le spec.
        await db.set('a2026_grillesTemplates', [
            { id: 'GR_VIVANTE', nom: 'Grille-5 FR-HOLIS A26', criteres: [], dansBibliotheque: true }
        ]);
        // security-ok: fixture de test, littéral écrit par le spec — aucune source externe.
        await db.set('cartouches_GR_VIVANTE', [{ id: 'DEJA', nom: 'Déjà là', grilleId: 'GR_VIVANTE' }]);
        // Le lot orphelin : sa grille n'existe plus.
        // security-ok: fixture de test, littéral écrit par le spec — aucune source externe.
        await db.set('cartouches_GRILLE_DISPARUE', [
            { id: 'ORPH1', nom: 'Carte mentale A26', grilleId: 'GRILLE_DISPARUE' },
            { id: 'ORPH2', nom: 'Plan de rédaction A26', grilleId: 'GRILLE_DISPARUE' }
        ]);
    });

    const src = fs.readFileSync(path.join(racine, 'scripts', 'reparation-cartouches-orphelines.js'), 'utf8');
    await page.evaluate(async (s) => { await eval(s); }, src);
    await page.waitForTimeout(300);

    const r = await page.evaluate(async () => {
        await window.reparerOrphelines(1, 'A');
        await new Promise(res => setTimeout(res, 400));
        return {
            destination: (await db.get('cartouches_GR_VIVANTE') || []).map(c => ({ nom: c.nom, grilleId: c.grilleId })),
            origineIntacte: (await db.get('cartouches_GRILLE_DISPARUE') || []).length
        };
    });

    console.log('\n--- SORTIE CONSOLE DU SCRIPT ---');
    logs.filter(l => l.includes('RÉPARATION') || l.includes('LOTS') || l.includes('✔') || l.includes('·')).slice(0, 20).forEach(l => console.log(l));
    console.log('\nRÉSULTAT →', JSON.stringify(r, null, 1));

    expect(r.destination, 'la cartouche déjà là est conservée, les deux orphelines arrivent').toHaveLength(3);
    expect(r.destination.map(c => c.nom)).toContain('Carte mentale A26');
    expect(r.destination.every(c => c.grilleId === 'GR_VIVANTE'), 'toutes pointent la grille d\'accueil').toBe(true);
    expect(r.origineIntacte, 'le lot d\'origine est laissé intact — rien de destructif').toBe(2);
});
