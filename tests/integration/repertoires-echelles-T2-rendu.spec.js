import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #327 T2 — câblage des répertoires de classement dans la bibliothèque d'ÉCHELLES
// via le helper générique BibliothequeUI.repertoires.* (paramétré par `biblio`).
// Vérifie : zone « Mes dossiers » (echelles), assignation « Classer dans… » au menu
// d'une carte du pool, select compact du dossier (option + Ajouter + Retirer), et
// persistance module. Les filtres discipline ET pratique ont été retirés.

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

test('T2 · échelles · zone dossiers + assignation « Classer dans… » via le helper générique', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.afficherBibliothequeEchelles !== 'function' || !window.repertoiresBibliotheque) {
            return { erreur: 'pré-requis absents' };
        }
        const lireModal = () => {
            const m = document.getElementById('modalBibliothequeEchelles');
            return m ? m.innerHTML : '';
        };

        // État déterministe : aucun dossier, une échelle réelle dans le pool partagé.
        window.db.setSync('repertoiresBibliotheques', []);
        const echelleId = 'ECH_TEST_T2';
        await window.db.set('bibliothequeEchelles', [
            { id: echelleId, nom: 'Échelle essai T2', discipline: 'Chimie', niveaux: [{ id: 'n1', nom: 'N1' }] }
        ]);

        const dossier = window.repertoiresBibliotheque.creer('Mon dossier échelles', 'echelles');

        // 1er rendu : zone « Mes dossiers » (echelles) + l'échelle propose « Classer dans… »
        await window.afficherBibliothequeEchelles();
        const html1 = lireModal();
        const aZone = html1.includes('Mes dossiers');
        const aChampCreation = !!document.getElementById('rep-echelles-nouveau-nom');
        const aActionClasser = !!document.querySelector('[data-action="BibliothequeUI.repertoires.classer"][data-param3="' + dossier.id + '"]');
        // filtres discipline + pratique retirés
        const filtresAbsents = !document.getElementById('filtreDisciplineEchelles') && !document.getElementById('filtrePratiqueEchelles');

        // Classer via le handler générique (comme le ferait le menu ⋮)
        await window.BibliothequeUI.repertoires.classer('echelles', echelleId, dossier.id);
        const html2 = lireModal();
        const aEnteteDossier = html2.includes('Mon dossier échelles');
        const aOptionSelect = !!document.querySelector('#rep-echelles-select-' + dossier.id + ' option[value="' + echelleId + '"]');
        const aBoutonAjouterSelect = !!document.querySelector('[data-action="BibliothequeUI.repertoires.ajouterSel"][data-param2="rep-echelles-select-' + dossier.id + '"]');
        const aActionRetirer = !!document.querySelector('[data-action="BibliothequeUI.repertoires.retirerSel"][data-param2="rep-echelles-select-' + dossier.id + '"]');

        const reps = window.repertoiresBibliotheque.obtenir('echelles');
        const estClassee = reps[0].itemIds.includes(echelleId);

        // Retirer → repasse non classée
        await window.BibliothequeUI.repertoires.retirer('echelles', echelleId);
        const repsApres = window.repertoiresBibliotheque.obtenir('echelles');
        const retiree = !repsApres[0].itemIds.includes(echelleId);

        return {
            aZone, aChampCreation, aActionClasser, filtresAbsents,
            aEnteteDossier, aOptionSelect, aBoutonAjouterSelect, aActionRetirer,
            estClassee, retiree
        };
    });

    expect(resultat.erreur).toBeUndefined();
    expect(resultat.aZone).toBe(true);
    expect(resultat.aChampCreation).toBe(true);
    expect(resultat.aActionClasser).toBe(true);
    expect(resultat.filtresAbsents).toBe(true);
    expect(resultat.aEnteteDossier).toBe(true);
    expect(resultat.aOptionSelect).toBe(true);
    expect(resultat.aBoutonAjouterSelect).toBe(true);
    expect(resultat.aActionRetirer).toBe(true);
    expect(resultat.estClassee).toBe(true);
    expect(resultat.retiree).toBe(true);
    expect(erreurs).toEqual([]);
});
