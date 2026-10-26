import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #327 T2 — câblage des répertoires de classement dans la bibliothèque d'ÉCHELLES
// via le helper générique BibliothequeUI.repertoires.* (paramétré par `biblio`).
// Les filtres discipline ET pratique ont été retirés.
//
// ↻ #1155 (25 oct. 2026) — RÉANCRÉ : la bibliothèque des échelles passe en deux colonnes (consigne du
// lot 2, § 1 : « Dossiers … comme au lot 1 »). La boîte « Mes dossiers » dépliée et le « select » compact
// par dossier (Ajouter / Retirer) disparaissent : un menu de dossiers filtre la colonne « Dans ta
// bibliothèque », « Gérer les dossiers… » ouvre la gestion à la demande, et « Classer dans » / « Retirer
// du dossier » sont dans le ⋮ de la rangée. L'essai éprouve la même chaîne sur la nouvelle forme : la
// gestion et son champ de création, « Classer dans » au ⋮, le dossier au menu de la barre, la rangée
// rangée (`data-dossier`), puis « Retirer du dossier », et la persistance du module.

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

        // 1er rendu : la gestion (cachée, à la demande) + l'échelle propose « Classer dans… » au ⋮
        await window.afficherBibliothequeEchelles();
        const html1 = lireModal();
        const aZone = html1.includes('Mes dossiers') && !!document.querySelector('#modalBibliothequeEchelles-dossiers[hidden]');
        const aChampCreation = !!document.getElementById('rep-echelles-nouveau-nom');
        const aActionClasser = !!document.querySelector('[data-action="BibliothequeUI.repertoires.classer"][data-param3="' + dossier.id + '"]');
        // filtres discipline + pratique retirés
        const filtresAbsents = !document.getElementById('filtreDisciplineEchelles') && !document.getElementById('filtrePratiqueEchelles');

        // Classer via le handler générique (comme le fait le ⋮)
        await window.BibliothequeUI.repertoires.classer('echelles', echelleId, dossier.id);
        const aOptionDossier = !!document.querySelector('#modalBibliothequeEchelles .biblio2-barre select option[value="' + dossier.id + '"]');
        const rangee = document.querySelector('#modalBibliothequeEchelles .biblio2-rangee[data-biblio-item-id="' + echelleId + '"]');
        const aDossierSurRangee = !!rangee && rangee.getAttribute('data-dossier') === dossier.id;
        const aActionRetirer = !!document.querySelector('[data-action="BibliothequeUI.repertoires.retirer"][data-param2="' + echelleId + '"]');

        const reps = window.repertoiresBibliotheque.obtenir('echelles');
        const estClassee = reps[0].itemIds.includes(echelleId);

        // Retirer → repasse non classée
        await window.BibliothequeUI.repertoires.retirer('echelles', echelleId);
        const repsApres = window.repertoiresBibliotheque.obtenir('echelles');
        const retiree = !repsApres[0].itemIds.includes(echelleId);
        const rangeeApres = document.querySelector('#modalBibliothequeEchelles .biblio2-rangee[data-biblio-item-id="' + echelleId + '"]');

        return {
            aZone, aChampCreation, aActionClasser, filtresAbsents,
            aOptionDossier, aDossierSurRangee, aActionRetirer,
            estClassee, retiree, nonClasseeApres: !!rangeeApres && rangeeApres.getAttribute('data-dossier') === '__nonclasse__'
        };
    });

    expect(resultat.erreur).toBeUndefined();
    expect(resultat.aZone).toBe(true);
    expect(resultat.aChampCreation).toBe(true);
    expect(resultat.aActionClasser).toBe(true);
    expect(resultat.filtresAbsents).toBe(true);
    expect(resultat.aOptionDossier).toBe(true);
    expect(resultat.aDossierSurRangee).toBe(true);
    expect(resultat.aActionRetirer).toBe(true);
    expect(resultat.estClassee).toBe(true);
    expect(resultat.retiree).toBe(true);
    expect(resultat.nonClasseeApres).toBe(true);
    expect(erreurs).toEqual([]);
});
