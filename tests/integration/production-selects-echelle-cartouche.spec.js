import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Terrain (lancement, 3 juin 2026) — Dans le formulaire « Nouvelle production »,
// le select « Échelle de performance » restait vide (chargerGrillesDisponibles-
// PourProduction ne peuplait que la grille), et les cartouches (dépendantes de
// la grille) ne se chargeaient pas (listener attaché seulement dans
// afficherFormProduction). Correctifs : peuplerEchellesProduction() + onchange
// cartouche dans le chemin « Nouvelle production ».
//
// Ce test couvre les DEUX modes (données réelles + données démo). Les grilles
// sont namespacées (cle()) ; sans trimestre actif au chargement, cle() retombe
// sur la clé nue (trimestres.js:306) — le test écrit donc directement les stores
// lus par chargerGrillesDisponiblesPourProduction. (#358 G3 : la démo ne fusionne
// plus de modèles vers le global ; en mode démo, cle()=demo_* est lu directement.)

test('Production · échelle + cartouche se peuplent (données réelles)', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await page.evaluate(async () => {
        if (typeof window.chargerGrillesDisponiblesPourProduction !== 'function') {
            return { erreur: 'chargerGrillesDisponiblesPourProduction absent' };
        }
        if (typeof window.cle !== 'function' || typeof window.db === 'undefined') {
            return { erreur: 'cle/db absents' };
        }

        const GRILLE_ID = 'GRILLE_TEST_PROD';
        // Grille : namespacée (cle). Échelle : globale. Cartouches : globales (cartouches_<grilleId>).
        await window.db.set(window.cle('grillesTemplates'), [{ id: GRILLE_ID, nom: 'Grille Test Prod' }]);
        await window.db.set('echellesTemplates', [{ id: 'ECH_TEST', nom: 'Échelle Test Prod' }]);
        await window.db.set('cartouches_' + GRILLE_ID, [{ id: 'CART_TEST', nom: 'Cartouche Test Prod' }]);

        await window.chargerGrillesDisponiblesPourProduction();

        const selGrille = document.getElementById('productionGrille');
        const selEchelle = document.getElementById('productionEchelle');
        const selCartouche = document.getElementById('productionCartouche');

        // Sélectionner la grille et déclencher le repeuplement des cartouches.
        selGrille.value = GRILLE_ID;
        selGrille.dispatchEvent(new Event('change'));
        await new Promise((res) => setTimeout(res, 100));

        const noms = (sel) => Array.from(sel.options).map((o) => o.textContent);
        return {
            echelle: noms(selEchelle),
            cartouche: noms(selCartouche)
        };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    expect(r.echelle).toContain('Échelle Test Prod');
    expect(r.cartouche).toContain('Cartouche Test Prod');
});

test('Production · échelle + cartouche se peuplent (données démo)', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await page.evaluate(async () => {
        if (typeof window.activerModeDemo !== 'function') {
            return { erreur: 'activerModeDemo absent' };
        }
        if (typeof window.chargerGrillesDisponiblesPourProduction !== 'function') {
            return { erreur: 'chargerGrillesDisponiblesPourProduction absent' };
        }

        // Activer le mode démo (fusionne les données démo vers les globaux + demo_*).
        await window.activerModeDemo();
        await window.chargerGrillesDisponiblesPourProduction();

        const selGrille = document.getElementById('productionGrille');
        const selEchelle = document.getElementById('productionEchelle');
        const selCartouche = document.getElementById('productionCartouche');

        // Échelle : doit lister au moins une échelle démo (au-delà de « Aucune »).
        const nbEchelles = selEchelle.options.length;

        // Cartouche : parcourir les grilles démo, en trouver une dont la
        // sélection peuple des cartouches (toutes les grilles n'en ont pas).
        let cartouchesTrouvees = 0;
        let grilleAvecCartouches = null;
        const optionsGrille = Array.from(selGrille.options).filter((o) => o.value);
        for (const opt of optionsGrille) {
            selGrille.value = opt.value;
            selGrille.dispatchEvent(new Event('change'));
            await new Promise((res) => setTimeout(res, 60));
            if (selCartouche.options.length > 1) {
                cartouchesTrouvees = selCartouche.options.length - 1;
                grilleAvecCartouches = opt.textContent;
                break;
            }
        }

        return {
            nbGrillesDemo: optionsGrille.length,
            nbEchelles,
            cartouchesTrouvees,
            grilleAvecCartouches
        };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    // En démo, le select Grille liste des grilles démo.
    expect(r.nbGrillesDemo).toBeGreaterThan(0);
    // Le select Échelle liste au moins une échelle démo (en plus de « Aucune »).
    expect(r.nbEchelles).toBeGreaterThan(1);
    // Au moins une grille démo peuple ses cartouches.
    expect(r.cartouchesTrouvees).toBeGreaterThan(0);
});
