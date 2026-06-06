import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Lot C1-a — Comparateur de pratiques : squelette + GARDE DÉMO.
// Vérifie les deux états de la garde (NOTE-CONCEPTION-C1-comparateur.md §11) :
//   (1) hors démo → invitation à activer la démonstration (pas de matrice) ;
//   (2) démo active (flag posé) → vue comparateur (placeholder de matrice).
// On pose le flag `demo-actif` directement plutôt que d'exécuter le seed
// complet activerModeDemo() : C1-a ne dépend d'aucune donnée démo, seulement
// de estEnModeDemo(). Attrape aussi les ReferenceError silencieux au chargement.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function brancherErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });
}

test('C1-a · garde démo — hors démo, le comparateur invite à activer la démonstration', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(() => {
        if (typeof window.ouvrirComparateurPratiques !== 'function') {
            return { erreur: 'window.ouvrirComparateurPratiques absent' };
        }
        if (typeof window.db === 'undefined' || typeof window.estEnModeDemo !== 'function') {
            return { erreur: 'db ou estEnModeDemo absent' };
        }

        // S'assurer qu'on n'est PAS en démo
        window.db.setSync('demo-actif', null);

        window.ouvrirComparateurPratiques();

        const panel = document.getElementById('comparateur-pratiques-panel');
        const html = panel ? panel.innerHTML : '';
        return {
            aPanneau: !!panel,
            visible: panel ? panel.style.display !== 'none' : false,
            aBoutonActiver: !!(panel && panel.querySelector('.comparateur-activer-demo')),
            aMatrice: !!(panel && panel.querySelector('#comparateur-matrice')),
            aTitre: html.includes('Comparateur de pratiques'),
            focusSurTitre: !!(document.activeElement
                && document.activeElement.classList
                && document.activeElement.classList.contains('comparateur-titre'))
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.aPanneau).toBe(true);
    expect(resultat.visible).toBe(true);
    expect(resultat.aTitre).toBe(true);
    expect(resultat.aBoutonActiver).toBe(true);   // invitation présente
    expect(resultat.aMatrice).toBe(false);        // pas de vue matrice hors démo
    expect(resultat.focusSurTitre).toBe(true);    // focus SPA déplacé au titre

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('C1-a · garde démo — en démo, le comparateur affiche la vue (placeholder de matrice)', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(() => {
        if (typeof window.ouvrirComparateurPratiques !== 'function') {
            return { erreur: 'window.ouvrirComparateurPratiques absent' };
        }

        // Simuler le mode démo actif (estEnModeDemo lit ce flag en premier).
        window.db.setSync('demo-actif', 'true');

        window.ouvrirComparateurPratiques();

        const panel = document.getElementById('comparateur-pratiques-panel');
        const matrice = panel ? panel.querySelector('#comparateur-matrice') : null;

        // Vérifier la fermeture (Échap déconnecté, panneau vidé, display none).
        let fermeOk = false;
        if (typeof window.fermerComparateurPratiques === 'function') {
            window.fermerComparateurPratiques();
            fermeOk = panel.style.display === 'none' && panel.innerHTML === '';
        }

        return {
            aMatrice: !!matrice,
            etatSquelette: matrice ? matrice.getAttribute('data-etat') === 'squelette' : false,
            aBoutonActiver: !!(panel && panel.querySelector('.comparateur-activer-demo')),
            fermeOk
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.aMatrice).toBe(true);          // vue affichée en démo
    expect(resultat.etatSquelette).toBe(true);     // placeholder C1-a
    expect(resultat.aBoutonActiver).toBe(false);   // plus l'invitation
    expect(resultat.fermeOk).toBe(true);           // fermeture propre

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
