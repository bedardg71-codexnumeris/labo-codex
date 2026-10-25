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

//
// ↻ #1156 (25 oct. 2026) — RÉANCRÉ, comme T2 au lot 2 : la bibliothèque des productions passe en deux colonnes.
// La zone « Mes dossiers » dépliée et le « select » compact par dossier (Ajouter / Retirer) disparaissent ; un
// menu de dossiers filtre « Dans ta bibliothèque », « Gérer les dossiers… » ouvre la gestion à la demande, et
// « Classer dans » / « Retirer du dossier » sont au ⋮ de la rangée. Même chaîne éprouvée sur la nouvelle forme.
// BREAK-TEST (25 oct.) : `dossier: repCourant` retiré des rangées de bibliothèque (productions-bibliotheque-ui.js)
// → ROUGE (`aDossierSurRangee`).

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

test('T3 · productions · dossiers + assignation « Classer dans… » via le helper générique', async ({ page }) => {
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
            { id: prodId, titre: 'Production essai T3', discipline: 'Français', type: 'travail', ponderation: 10 }
        ]);

        const dossier = window.repertoiresBibliotheque.creer('Mon dossier productions', 'productions');

        // 1er rendu : la gestion (cachée, à la demande) + la production propose « Classer dans… » au ⋮
        await window.afficherBibliothequeProductions();
        const html1 = lireModal();
        const aZone = html1.includes('Mes dossiers') && !!document.querySelector('#modalBibliothequeProductions-dossiers[hidden]');
        const aChampCreation = !!document.getElementById('rep-productions-nouveau-nom');
        const aActionClasser = !!document.querySelector('[data-action="BibliothequeUI.repertoires.classer"][data-param3="' + dossier.id + '"]');
        const filtreDisciplineAbsent = !document.getElementById('filtreDisciplineProductions');

        // Classer via le handler générique (comme le fait le ⋮)
        await window.BibliothequeUI.repertoires.classer('productions', prodId, dossier.id);
        const aOptionDossier = !!document.querySelector('#modalBibliothequeProductions .biblio2-barre select option[value="' + dossier.id + '"]');
        const rangee = document.querySelector('#modalBibliothequeProductions .biblio2-rangee[data-biblio-item-id="' + prodId + '"]');
        const aDossierSurRangee = !!rangee && rangee.getAttribute('data-dossier') === dossier.id;
        const aActionRetirer = !!document.querySelector('[data-action="BibliothequeUI.repertoires.retirer"][data-param2="' + prodId + '"]');

        const reps = window.repertoiresBibliotheque.obtenir('productions');
        const estClassee = reps[0].itemIds.includes(prodId);

        // Retirer → repasse non classée
        await window.BibliothequeUI.repertoires.retirer('productions', prodId);
        const repsApres = window.repertoiresBibliotheque.obtenir('productions');
        const retiree = !repsApres[0].itemIds.includes(prodId);
        const rangeeApres = document.querySelector('#modalBibliothequeProductions .biblio2-rangee[data-biblio-item-id="' + prodId + '"]');

        return {
            aZone, aChampCreation, aActionClasser, filtreDisciplineAbsent,
            aOptionDossier, aDossierSurRangee, aActionRetirer,
            estClassee, retiree, nonClasseeApres: !!rangeeApres && rangeeApres.getAttribute('data-dossier') === '__nonclasse__'
        };
    });

    expect(resultat.erreur).toBeUndefined();
    expect(resultat.aZone).toBe(true);
    expect(resultat.aChampCreation).toBe(true);
    expect(resultat.aActionClasser).toBe(true);
    expect(resultat.filtreDisciplineAbsent).toBe(true);
    expect(resultat.aOptionDossier).toBe(true);
    expect(resultat.aDossierSurRangee).toBe(true);
    expect(resultat.aActionRetirer).toBe(true);
    expect(resultat.estClassee).toBe(true);
    expect(resultat.retiree).toBe(true);
    expect(resultat.nonClasseeApres).toBe(true);
    expect(erreurs).toEqual([]);
});
