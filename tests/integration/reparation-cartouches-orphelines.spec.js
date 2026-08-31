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
        // ⚠ LA DESTINATION EST NAMESPACÉE (corrigé le 31 août 2026, #636).
        // Ce « déjà là » était posé sous la clé NUE `cartouches_GR_VIVANTE`. Depuis
        // S5 (#623), l'application lit et écrit `<trimestreId>_cartouches_<grilleId>` :
        // la clé nue n'est plus une destination, c'est un RÉSIDU que plus rien ne lit.
        // Le lot conservé doit donc être posé là où l'app le cherche, sinon ce cas ne
        // mesure plus la fusion — il mesure une adresse morte.
        // ⮕ MESURÉ, pas déduit : avec le « déjà là » sous la clé nue, la destination
        // namespacée reçoit 2 cartouches (les orphelines seules) et la fusion n'est
        // PAS exercée ; avec ce même lot à l'adresse namespacée, elle en reçoit 3 —
        // « Déjà là » en tête, les deux orphelines ajoutées. C'est la seconde forme
        // qui prouve « on ajoute sans écraser », c'est-à-dire l'invariant du cas.
        // security-ok: fixture de test, littéral écrit par le spec — aucune source externe.
        await db.set(cle('cartouches_GR_VIVANTE'), [{ id: 'DEJA', nom: 'Déjà là', grilleId: 'GR_VIVANTE' }]);
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
            // L'oracle vise l'adresse que l'APPLICATION lit — `cle()` la calcule,
            // on ne la réécrit pas à la main ici : une adresse recopiée dans le test
            // se désaligne en silence le jour où le routage change, et c'est
            // exactement ce qui est arrivé à ce fichier.
            destination: (await db.get(cle('cartouches_GR_VIVANTE')) || []).map(c => ({ nom: c.nom, grilleId: c.grilleId })),
            origineIntacte: (await db.get('cartouches_GRILLE_DISPARUE') || []).length,
            // Le résidu nu ne doit PAS devenir une seconde destination silencieuse.
            residuNu: (await db.get('cartouches_GR_VIVANTE') || []).length
        };
    });

    console.log('\n--- SORTIE CONSOLE DU SCRIPT ---');
    logs.filter(l => l.includes('RÉPARATION') || l.includes('LOTS') || l.includes('✔') || l.includes('·')).slice(0, 20).forEach(l => console.log(l));
    console.log('\nRÉSULTAT →', JSON.stringify(r, null, 1));

    expect(r.destination, 'la cartouche déjà là est conservée, les deux orphelines arrivent').toHaveLength(3);
    expect(r.destination.map(c => c.nom)).toContain('Carte mentale A26');
    expect(r.destination.every(c => c.grilleId === 'GR_VIVANTE'), 'toutes pointent la grille d\'accueil').toBe(true);
    expect(r.origineIntacte, 'le lot d\'origine est laissé intact — rien de destructif').toBe(2);
    expect(r.residuNu, 'rien n\'est écrit sous la clé NUE : elle n\'est plus une destination').toBe(0);
});
