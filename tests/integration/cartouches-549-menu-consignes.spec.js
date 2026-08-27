import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #549 — le menu « Consignes du travail » existe et se peuple.
//
// La composition du fichier est couverte unitairement
// (`sentinelle-549-modele-cartouche-consignes`). Ce qui ne l'est pas, c'est le
// DOM : que le `<select>` soit bien dans `index.html` sous l'id que le code
// interroge, et que `populerDropdownsCartouche` le remplisse. Un identifiant qui
// ne correspond pas rendrait un menu vide en permanence, sans erreur — le
// téléchargement continuerait de marcher, simplement toujours sans consignes.

test('#549 · le menu « Consignes du travail » se peuple avec les productions', async ({ page }) => {
    const erreurs = [];
    const attendues = [
        /version\.json.*access control/i,
        /Cross origin requests are only supported/i,
        /Not allowed to load local resource.*\.(svg|png)/i
    ];
    page.on('pageerror', (e) => { const m = e.message; if (!attendues.some(r => r.test(m))) erreurs.push('pageerror: ' + m); });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });

    const r = await page.evaluate(async () => {
        if (typeof window.populerDropdownsCartouche !== 'function') {
            return { erreur: 'populerDropdownsCartouche absent' };
        }
        const trimestreId = 'test549';
        window.db.setSync('trimestres', [{ id: trimestreId, nom: 'Test', actif: true }]); // security-ok: fixture de test, litteral du fichier
        window.db.setSync('trimestreActif', trimestreId); // security-ok: fixture de test, litteral du fichier
        await window.db.set(window.cle('productions'), [
            { id: 'PR_AVEC', type: 'production', activiteApprentissage: 'Dissertation Hamlet', objectif: 'Reconnaître le propos' },
            { id: 'PR_SANS', type: 'production', activiteApprentissage: 'Exercice sans consignes' },
            { id: 'PR_CONTENEUR', type: 'portfolio', activiteApprentissage: 'Portfolio du trimestre' }
        ]);
        await window.populerDropdownsCartouche('', '', false);

        const sel = document.getElementById('selectProductionCartouche');
        if (!sel) return { erreur: 'selectProductionCartouche absent du DOM' };
        return {
            valeurs: [...sel.options].map(o => o.value),
            libelles: [...sel.options].map(o => o.textContent)
        };
    });

    expect(r.erreur, `Erreur : ${r.erreur}`).toBeUndefined();

    // L'option neutre en tête : la production reste FACULTATIVE.
    expect(r.valeurs[0]).toBe('');
    expect(r.libelles[0]).toContain('aucune');

    // Les deux productions sont proposées, le conteneur portfolio ne l'est pas —
    // ce n'est pas un travail dont on remet les consignes.
    expect(r.valeurs).toContain('PR_AVEC');
    expect(r.valeurs).toContain('PR_SANS');
    expect(r.valeurs, 'le conteneur portfolio n\'est pas un travail').not.toContain('PR_CONTENEUR');

    // ⮕ Et le libellé DIT laquelle n'a pas de consignes : sans cette mention, en
    // choisir une qui n'en a pas rend un modèle identique à celui d'avant, sans
    // que rien ne l'explique.
    const avec = r.libelles.find(l => l.includes('Dissertation Hamlet'));
    const sans = r.libelles.find(l => l.includes('Exercice sans consignes'));
    expect(avec, 'une production qui a des consignes ne porte pas la mention').not.toContain('sans consignes');
    expect(sans, 'une production sans consignes doit le dire').toContain('— sans consignes');

    expect(erreurs, `Erreurs de page : ${erreurs.join(' | ')}`).toEqual([]);
});
