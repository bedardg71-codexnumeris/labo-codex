import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// Sentinelle — le menu du formulaire de cartouche n'offre que la SÉLECTION
// (24 août 2026).
//
// Rapport terrain de Grégoire : « les grilles disponibles dans le dropdown des
// cartouches ne correspondent pas à celles que j'utilise cet automne. J'utilise
// 3 grilles, mais celles de H26 sont encore dans le dropdown. » Mesuré sur ses
// captures : 3 grilles en barre latérale, SEPT dans le menu.
//
// `afficherListeGrilles` filtre sur `dansBibliotheque !== false` ; ce menu ne
// filtrait rien. Aucun test de logique pure ne voit ça : c'est du DOM peuplé.

const SEMER = `async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set('a2026_grillesTemplates', [
        { id: 'GR_A1', nom: 'Grille-5 FR-HOLIS A26', criteres: [{ id: 'C1' }], dansBibliotheque: true },
        { id: 'GR_A2', nom: 'Grille-4 A26', criteres: [{ id: 'C1' }], dansBibliotheque: true },
        { id: 'GR_A3', nom: 'Grille-5 FR-ALGO A26', criteres: [{ id: 'C1' }], dansBibliotheque: true },
        // Retirées de la sélection — elles ne doivent plus être proposées.
        { id: 'GR_H1', nom: 'Grille-5 FR-ALGO H26', criteres: [{ id: 'C1' }], dansBibliotheque: false },
        { id: 'GR_H2', nom: 'Grille-4 H26', criteres: [{ id: 'C1' }], dansBibliotheque: false },
        { id: 'GR_H3', nom: 'Grille-5 FR-HOLIS H26', criteres: [{ id: 'C1' }], dansBibliotheque: false }
    ]);
    // security-ok: fixture de test, littéral écrit par le spec — aucune source externe.
    await db.set('a2026_echellesTemplates', [
        { id: 'ECH_A', nom: '0-IDME (5 niv.)', niveaux: [{ code: 'I' }], dansBibliotheque: true },
        { id: 'ECH_H', nom: 'Échelle retirée H26', niveaux: [{ code: 'I' }], dansBibliotheque: false }
    ]);
}`;

async function ouvrir(page) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
}

test('PREUVE · le menu n\'offre que les grilles et échelles de la sélection', async ({ page }) => {
    await ouvrir(page);
    const r = await page.evaluate(async (semer) => {
        await eval(semer)();
        await populerDropdownsCartouche('', '', false);
        return {
            grilles: [...document.getElementById('selectGrilleCartouche').options].map(o => o.textContent.trim()),
            echelles: [...document.getElementById('selectEchelleCartouche').options].map(o => o.textContent.trim())
        };
    }, SEMER);

    console.log('MENU →', JSON.stringify(r, null, 1));
    // 3 grilles + l'option vide « -- Grille -- » : c'est exactement sa barre latérale.
    expect(r.grilles, 'trois grilles proposées, comme dans la barre latérale').toHaveLength(4);
    expect(r.grilles.join(' ')).not.toContain('H26');
    expect(r.echelles, 'une échelle proposée').toHaveLength(2);
    expect(r.echelles.join(' ')).not.toContain('retirée');
});

test('PREUVE · une cartouche DÉJÀ liée à une grille retirée continue de l\'afficher', async ({ page }) => {
    await ouvrir(page);
    const r = await page.evaluate(async (semer) => {
        await eval(semer)();
        // Cas d'une cartouche ancienne, rattachée à une grille retirée depuis.
        await populerDropdownsCartouche('GR_H3', 'ECH_H', false);
        const sg = document.getElementById('selectGrilleCartouche');
        const se = document.getElementById('selectEchelleCartouche');
        return {
            grilles: [...sg.options].map(o => o.textContent.trim()),
            valeurGrille: sg.value,
            valeurEchelle: se.value
        };
    }, SEMER);

    console.log('LIEN EXISTANT →', JSON.stringify(r, null, 1));
    expect(r.valeurGrille, 'la grille liée reste sélectionnée, pas rebasculée en silence').toBe('GR_H3');
    expect(r.valeurEchelle, 'idem pour l\'échelle').toBe('ECH_H');
    // 3 de la sélection + celle qui est liée + l'option vide
    expect(r.grilles, 'la grille liée s\'ajoute, les deux autres retirées restent absentes').toHaveLength(5);
    expect(r.grilles.join(' ')).toContain('FR-HOLIS H26');
    expect(r.grilles.join(' ')).not.toContain('FR-ALGO H26');
});
