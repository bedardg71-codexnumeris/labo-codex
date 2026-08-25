import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// Sentinelle — supprimer une grille ne peut pas rendre ses cartouches introuvables
// (24 août 2026).
//
// Relevé sur le corpus de Grégoire : « Carte mentale A26 », « Plan de rédaction A26 »
// et « Stratégies de lecture A26 » vivaient dans des clés `cartouches_<grille>` dont
// la grille avait disparu de son trimestre. Rien n'était détruit — mais plus rien ne
// pouvait les lire, puisque la barre latérale n'énumère que les grilles PRÉSENTES.
// Symptôme vécu : « mes cartouches nouvellement configurées n'ont pas persisté ».
//
// `supprimerGrilleDefinitivement` portait déjà la garde ; `supprimerGrilleDepuisSidebar`
// — le chemin le plus utilisé — ne l'avait jamais reçue.

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set('a2026_grillesTemplates', [
        { id: 'GR_AVEC', nom: 'Grille avec cartouches', criteres: [], dansBibliotheque: true },
        { id: 'GR_SANS', nom: 'Grille sans cartouche', criteres: [], dansBibliotheque: true }
    ]);
    // security-ok: fixture de test, littéral écrit par le spec — aucune source externe.
    await db.set('cartouches_GR_AVEC', [
        { id: 'C1', nom: 'Carte mentale A26', grilleId: 'GR_AVEC' },
        { id: 'C2', nom: 'Plan de rédaction A26', grilleId: 'GR_AVEC' }
    ]);
    // security-ok: fixture de test, littéral écrit par le spec — aucune source externe.
    await db.set('cartouches_GR_SANS', []);
}`;

test('PREUVE · supprimer une grille PORTEUSE de cartouches est refusé, et le dit', async ({ page }) => {
    const dialogues = [];
    page.on('dialog', (d) => { dialogues.push(d.message()); d.accept().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const r = await page.evaluate(async (semer) => {
        await eval(semer)();
        await supprimerGrilleDepuisSidebar('GR_AVEC');
        await new Promise(res => setTimeout(res, 400));
        return {
            grilles: (await db.get('a2026_grillesTemplates') || []).map(g => g.id),
            cartouches: (await db.get('cartouches_GR_AVEC') || []).map(c => c.nom)
        };
    }, SEMER);

    console.log('REFUS →', JSON.stringify(r));
    console.log('DIALOGUES →', JSON.stringify(dialogues, null, 1));
    expect(r.grilles, 'la grille est toujours là').toContain('GR_AVEC');
    expect(r.cartouches, 'et ses cartouches aussi').toHaveLength(2);
    // Le message NOMME ce qui bloque — sinon l'enseignant ne sait pas quoi faire.
    expect(dialogues.join(' ')).toContain('Impossible de supprimer');
    expect(dialogues.join(' ')).toContain('Carte mentale A26');
    expect(dialogues.join(' '), 'le dialogue de confirmation ne doit même pas s\'ouvrir')
        .not.toContain('Supprimer cette grille ?');
});

test('PREUVE · une grille SANS cartouche se supprime toujours normalement', async ({ page }) => {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const r = await page.evaluate(async (semer) => {
        await eval(semer)();
        await supprimerGrilleDepuisSidebar('GR_SANS');
        await new Promise(res => setTimeout(res, 400));
        return { grilles: (await db.get('a2026_grillesTemplates') || []).map(g => g.id) };
    }, SEMER);

    console.log('SUPPRESSION NORMALE →', JSON.stringify(r));
    expect(r.grilles, 'la garde ne bloque pas ce qui ne risque rien').not.toContain('GR_SANS');
    expect(r.grilles).toContain('GR_AVEC');
});
