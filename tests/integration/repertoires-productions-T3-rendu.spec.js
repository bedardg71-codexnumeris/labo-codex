import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #327 T3 — câblage des répertoires de classement dans la bibliothèque de PRODUCTIONS
// via le helper générique BibliothequeUI.repertoires.* (paramétré par `biblio`).
// Vérifie : zone « Mes dossiers » (productions), assignation « Classer dans… » au
// menu d'une carte du pool, select compact du dossier (option + Ajouter + Retirer),
// persistance module. Le filtre par discipline a été retiré ; l'import trimestre reste.

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

test('T3 · productions · zone dossiers + assignation « Classer dans… » via le helper générique', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.afficherBibliothequeProductions !== 'function' || !window.repertoiresBibliotheque) {
            return { erreur: 'pré-requis absents' };
        }
        const lireModal = () => {
            const m = document.getElementById('modalBibliothequeProductions');
            return m ? m.innerHTML : '';
        };

        // État déterministe : aucun dossier, une production réelle dans le pool partagé.
        window.db.setSync('repertoiresBibliotheques', []);
        const prodId = 'PROD_TEST_T3';
        await window.db.set('bibliothequeProductions', [
            { id: prodId, titre: 'Production essai T3', discipline: 'Français', type: 'devoir', ponderation: 10 }
        ]);

        const dossier = window.repertoiresBibliotheque.creer('Mon dossier productions', 'productions');

        // 1er rendu : zone « Mes dossiers » (productions) + la production propose « Classer dans… »
        await window.afficherBibliothequeProductions();
        const html1 = lireModal();
        const aZone = html1.includes('Mes dossiers');
        const aChampCreation = !!document.getElementById('rep-productions-nouveau-nom');
        const aActionClasser = !!document.querySelector('[data-action="BibliothequeUI.repertoires.classer"][data-param3="' + dossier.id + '"]');
        // filtre discipline retiré
        const filtreDisciplineAbsent = !document.getElementById('filtreDisciplineProductions');

        // Classer via le handler générique (comme le ferait le menu ⋮)
        await window.BibliothequeUI.repertoires.classer('productions', prodId, dossier.id);
        const html2 = lireModal();
        const aEnteteDossier = html2.includes('Mon dossier productions');
        const aOptionSelect = !!document.querySelector('#rep-productions-select-' + dossier.id + ' option[value="' + prodId + '"]');
        const aBoutonAjouterSelect = !!document.querySelector('[data-action="BibliothequeUI.repertoires.ajouterSel"][data-param2="rep-productions-select-' + dossier.id + '"]');
        const aActionRetirer = !!document.querySelector('[data-action="BibliothequeUI.repertoires.retirerSel"][data-param2="rep-productions-select-' + dossier.id + '"]');

        const reps = window.repertoiresBibliotheque.obtenir('productions');
        const estClassee = reps[0].itemIds.includes(prodId);

        // Retirer → repasse non classée
        await window.BibliothequeUI.repertoires.retirer('productions', prodId);
        const repsApres = window.repertoiresBibliotheque.obtenir('productions');
        const retiree = !repsApres[0].itemIds.includes(prodId);

        return {
            aZone, aChampCreation, aActionClasser, filtreDisciplineAbsent,
            aEnteteDossier, aOptionSelect, aBoutonAjouterSelect, aActionRetirer,
            estClassee, retiree
        };
    });

    expect(resultat.erreur).toBeUndefined();
    expect(resultat.aZone).toBe(true);
    expect(resultat.aChampCreation).toBe(true);
    expect(resultat.aActionClasser).toBe(true);
    expect(resultat.filtreDisciplineAbsent).toBe(true);
    expect(resultat.aEnteteDossier).toBe(true);
    expect(resultat.aOptionSelect).toBe(true);
    expect(resultat.aBoutonAjouterSelect).toBe(true);
    expect(resultat.aActionRetirer).toBe(true);
    expect(resultat.estClassee).toBe(true);
    expect(resultat.retiree).toBe(true);
    expect(erreurs).toEqual([]);
});
