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

test('C1-a · garde démo — en démo, le comparateur affiche la matrice (structure + fermeture)', async ({ page }) => {
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
        // Sans seed : la structure de la matrice se rend, les notes valent « — ».
        window.db.setSync('demo-actif', 'true');

        window.ouvrirComparateurPratiques();

        const panel = document.getElementById('comparateur-pratiques-panel');
        const matrice = panel ? panel.querySelector('#comparateur-matrice') : null;
        const table = matrice ? matrice.querySelector('table.comparateur-matrice-table') : null;
        const lignes = table ? table.querySelectorAll('tbody tr').length : 0;
        const aColNiveau = table ? table.textContent.includes('Niveau atteint') : false;

        // Fermeture (Échap déconnecté, panneau vidé, display none).
        let fermeOk = false;
        if (typeof window.fermerComparateurPratiques === 'function') {
            window.fermerComparateurPratiques();
            fermeOk = panel.style.display === 'none' && panel.innerHTML === '';
        }

        return {
            aMatrice: !!matrice,
            etatMatrice: matrice ? matrice.getAttribute('data-etat') === 'matrice' : false,
            aTable: !!table,
            nbLignes: lignes,
            aColNiveau,
            aBoutonActiver: !!(panel && panel.querySelector('.comparateur-activer-demo')),
            fermeOk
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.aMatrice).toBe(true);
    expect(resultat.etatMatrice).toBe(true);
    expect(resultat.aTable).toBe(true);
    expect(resultat.nbLignes).toBe(4);            // 4 profils-types en dur
    expect(resultat.aColNiveau).toBe(true);       // colonne « Niveau atteint »
    expect(resultat.aBoutonActiver).toBe(false);  // plus l'invitation
    expect(resultat.fermeOk).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('C1-b · matrice — parité moteur (réf = panneau profil) + divergence des pratiques (données démo)', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.activerModeDemo !== 'function') return { erreur: 'activerModeDemo absent' };
        if (typeof window.simulerIndices !== 'function') return { erreur: 'simulerIndices absent' };

        // Seed démo complet (fusionne demo_* + globaux) — données réelles des profils-types.
        await window.activerModeDemo();

        const DA = 'DEMO011'; // profil « Irrégulier » : STD≈81 / SOM≈76 / SPE≈60 (seed C0)
        const refId = window.obtenirPratiqueActiveGroupeCours() || 'standards';

        // PARITÉ : la réf simulée doit égaler le détail de note du panneau profil
        // (même appel sous-jacent, pratique active).
        const sim = window.simulerIndices(DA, refId);
        const det = window.calculerDetailsNoteFinale(DA, null);
        const pariteOk = !!(sim && det && sim.noteFinale === det.noteFinale);

        // DIVERGENCE : résoudre la SPE configurable, comparer les 3 familles.
        const cfgs = window.db.getSync(window.cle('pratiquesConfigurables'), null)
            || window.db.getSync('pratiquesConfigurables', []) || [];
        let speId = null;
        for (const p of cfgs) {
            const inst = window.obtenirPratiqueParId(p.id);
            if (inst && typeof inst.obtenirCode === 'function' && inst.obtenirCode() === 'SPE' && p.id !== refId) {
                speId = p.id; break;
            }
        }
        const pStd = window.simulerIndices(DA, refId).P;
        const pSom = window.simulerIndices(DA, 'sommative').P;
        const pSpe = speId ? window.simulerIndices(DA, speId).P : null;

        // Rendu DOM : la matrice affiche le niveau atteint (libellé d'échelle) + la note réf.
        window.ouvrirComparateurPratiques();
        const matrice = document.getElementById('comparateur-matrice');
        const texte = matrice ? matrice.textContent : '';

        return {
            pariteOk,
            refId,
            speTrouvee: !!speId,
            pStd, pSom, pSpe,
            domNiveauMaitrise: texte.includes('Maîtrisé'), // terminale DEMO011 = M
            domNoteStd: texte.includes(String(pStd))
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.pariteOk, `Parité réf/profil rompue (refId=${resultat.refId})`).toBe(true);
    expect(resultat.speTrouvee).toBe(true);

    // Les 3 familles calculent des notes finies.
    for (const p of [resultat.pStd, resultat.pSom, resultat.pSpe]) {
        expect(typeof p).toBe('number');
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(100);
    }
    // Divergence documentée du profil irrégulier : SPE plafonne sous SOM, sous STD.
    expect(resultat.pSpe).toBeLessThan(resultat.pSom);
    expect(resultat.pSom).toBeLessThan(resultat.pStd);

    // La maîtrise (niveau atteint) est montrée en regard, et la note réf est rendue.
    expect(resultat.domNiveauMaitrise).toBe(true);
    expect(resultat.domNoteStd).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
