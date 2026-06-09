import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #320 Lot L1 — zone « Mes dossiers » dans la modale biblio pratiques.
// Vérifie le rendu de la zone de gestion (création/renommage/suppression) et
// que l'intégration module ↔ UI fonctionne (un répertoire créé apparaît au
// ré-affichage). L'affichage groupé du pool et l'assignation = Lot L2.

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

test('L1 · zone « Mes dossiers » se rend et un répertoire créé apparaît', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.afficherBibliothequePratiques !== 'function') {
            return { erreur: 'afficherBibliothequePratiques absent' };
        }
        if (!window.repertoiresBibliotheque) {
            return { erreur: 'module repertoiresBibliotheque absent' };
        }

        // Partir d'une collection vide (état déterministe)
        window.db.setSync('repertoiresBibliotheques', []);

        // 1er rendu : zone présente, champ de création, message « aucun dossier »
        await window.afficherBibliothequePratiques();
        const modal = document.getElementById('modalBibliothequePratiques');
        const html1 = modal ? modal.innerHTML : '';
        const aZone = html1.includes('Mes dossiers');
        const aChampCreation = !!document.getElementById('rep-nouveau-nom');
        const aMessageVide = html1.includes('Aucun dossier');

        // Création via le module + ré-affichage (simule le handler)
        const cree = window.repertoiresBibliotheque.creer('Essais L1', 'pratiques');
        await window.afficherBibliothequePratiques();
        const modal2 = document.getElementById('modalBibliothequePratiques');
        const champRenomme = modal2
            ? modal2.querySelector('input[data-rep-id="' + cree.id + '"]')
            : null;
        const aBoutonSupprimer = !!(modal2 && modal2.querySelector('[data-action="supprimerRepertoirePratiques"][data-param="' + cree.id + '"]'));

        // Le handler de suppression existe et est branché
        const aHandlers = typeof window.creerRepertoirePratiques === 'function'
            && typeof window.renommerRepertoirePratiques === 'function'
            && typeof window.supprimerRepertoirePratiques === 'function';

        return {
            aZone,
            aChampCreation,
            aMessageVide,
            valeurChamp: champRenomme ? champRenomme.value : null,
            aBoutonSupprimer,
            aHandlers
        };
    });

    expect(resultat.erreur).toBeUndefined();
    expect(resultat.aZone).toBe(true);
    expect(resultat.aChampCreation).toBe(true);
    expect(resultat.aMessageVide).toBe(true);
    expect(resultat.valeurChamp).toBe('Essais L1');
    expect(resultat.aBoutonSupprimer).toBe(true);
    expect(resultat.aHandlers).toBe(true);
    expect(erreurs).toEqual([]);
});
