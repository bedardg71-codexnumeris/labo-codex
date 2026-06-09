import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #320 Lot L2 — affichage groupé du pool par dossier + assignation « Classer dans… ».
// Vérifie l'intégration UI ↔ module : en-têtes de groupe, menu d'assignation,
// et les handlers classer/retirer qui déplacent une pratique entre groupes.
// #327 — câblage générique BibliothequeUI.repertoires.* (biblio en param, ids
// rep-pratiques-select-*). Mêmes comportements, sélecteurs mis à jour.

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

test('L2 · pool groupé par dossier + assignation « Classer dans… »', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.afficherBibliothequePratiques !== 'function' || !window.repertoiresBibliotheque) {
            return { erreur: 'pré-requis absents' };
        }
        const lireModal = () => {
            const m = document.getElementById('modalBibliothequePratiques');
            return m ? m.innerHTML : '';
        };

        // État déterministe + un dossier
        window.db.setSync('repertoiresBibliotheques', []);
        const dossier = window.repertoiresBibliotheque.creer('Expérimentations', 'pratiques');

        // 1er rendu : tout est « Non classées », et chaque carte propose « Classer dans… »
        await window.afficherBibliothequePratiques();
        const html1 = lireModal();
        const aGroupeNonClassees = html1.includes('Non classées');
        // #327 — classer(biblio, itemId, repId) : repId = param3.
        const aActionClasser = !!document.querySelector('[data-action="BibliothequeUI.repertoires.classer"][data-param3="' + dossier.id + '"]');

        // Récupérer une pratique réelle du pool (bouton « Ajouter »)
        const boutonAjouter = document.querySelector('[data-action="ajouterPratiqueALaSelection"]');
        const pratiqueId = boutonAjouter ? boutonAjouter.getAttribute('data-param') : null;
        if (!pratiqueId) return { erreur: 'aucune pratique dans le pool' };

        // Classer cette pratique via le handler générique (comme le ferait le menu ⋮)
        await window.BibliothequeUI.repertoires.classer('pratiques', pratiqueId, dossier.id);
        const html2 = lireModal();
        const aEnteteDossier = html2.includes('Expérimentations');
        // La pratique classée est désormais une OPTION du select compact du dossier
        const aOptionSelect = !!document.querySelector('#rep-pratiques-select-' + dossier.id + ' option[value="' + pratiqueId + '"]');
        // Ligne compacte : bouton « Ajouter » câblé sur le select du dossier (param2 = selectId)
        const aBoutonAjouterSelect = !!document.querySelector('[data-action="BibliothequeUI.repertoires.ajouterSel"][data-param2="rep-pratiques-select-' + dossier.id + '"]');
        // Le menu ⋮ du dossier propose « Retirer du dossier » (agit sur la sélection)
        const aActionRetirer = !!document.querySelector('[data-action="BibliothequeUI.repertoires.retirerSel"][data-param2="rep-pratiques-select-' + dossier.id + '"]');
        // Persistance : le module connaît l'appartenance
        const reps = window.repertoiresBibliotheque.obtenir('pratiques');
        const estClassee = reps[0].itemIds.includes(pratiqueId);

        // Retirer → repasse non classée
        await window.BibliothequeUI.repertoires.retirer('pratiques', pratiqueId);
        const repsApres = window.repertoiresBibliotheque.obtenir('pratiques');
        const retiree = !repsApres[0].itemIds.includes(pratiqueId);

        const aHandlers = typeof window.BibliothequeUI.repertoires.classer === 'function'
            && typeof window.BibliothequeUI.repertoires.retirer === 'function';

        return { aGroupeNonClassees, aActionClasser, aEnteteDossier, aOptionSelect, aBoutonAjouterSelect, aActionRetirer, estClassee, retiree, aHandlers };
    });

    expect(resultat.erreur).toBeUndefined();
    expect(resultat.aGroupeNonClassees).toBe(true);
    expect(resultat.aActionClasser).toBe(true);
    expect(resultat.aEnteteDossier).toBe(true);
    expect(resultat.aOptionSelect).toBe(true);
    expect(resultat.aBoutonAjouterSelect).toBe(true);
    expect(resultat.aActionRetirer).toBe(true);
    expect(resultat.estClassee).toBe(true);
    expect(resultat.retiree).toBe(true);
    expect(resultat.aHandlers).toBe(true);
    expect(erreurs).toEqual([]);
});
