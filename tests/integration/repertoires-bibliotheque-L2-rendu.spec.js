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

//
// ↻ #1156 (25 oct. 2026) — RÉANCRÉ, comme T2 au lot 2 : la bibliothèque des pratiques passe en deux colonnes.
// Plus d'en-têtes de groupe ni de « select » compact par dossier : un menu de dossiers (« Tous les dossiers »,
// « Non classées », les dossiers) filtre « Dans ta bibliothèque », chaque rangée porte son dossier
// (`data-dossier`), et « Classer dans » / « Retirer du dossier » sont à son ⋮. Le filtre se joue ici pour de vrai.
// BREAK-TEST (25 oct.) : `dossier: repCourant` retiré des rangées de bibliothèque (pratiques-gestion.js) → ROUGE.

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

test('L2 · bibliothèque rangée par dossier + assignation « Classer dans… »', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.afficherBibliothequePratiques !== 'function' || !window.repertoiresBibliotheque) {
            return { erreur: 'pré-requis absents' };
        }
        const M = '#modalBibliothequePratiques';

        // État déterministe + un dossier
        window.db.setSync('repertoiresBibliotheques', []);
        const dossier = window.repertoiresBibliotheque.creer('Expérimentations', 'pratiques');

        // 1er rendu : tout est « Non classées », et chaque rangée propose « Classer dans… »
        await window.afficherBibliothequePratiques();
        const aOptionNonClassees = [...document.querySelectorAll(M + ' .biblio2-barre select option')].some(o => o.textContent === 'Non classées');
        const aActionClasser = !!document.querySelector('[data-action="BibliothequeUI.repertoires.classer"][data-param3="' + dossier.id + '"]');

        // Une pratique réelle de la bibliothèque (son passage « ← Utiliser »)
        const passage = document.querySelector(M + ' [data-action="ajouterPratiqueALaSelection"]');
        const pratiqueId = passage ? passage.getAttribute('data-param') : null;
        if (!pratiqueId) return { erreur: 'aucune pratique dans la bibliothèque' };

        // Classer cette pratique via le handler générique (comme le fait le ⋮)
        await window.BibliothequeUI.repertoires.classer('pratiques', pratiqueId, dossier.id);
        const optionDossier = document.querySelector(M + ' .biblio2-barre select option[value="' + dossier.id + '"]');
        const aOptionDossier = !!optionDossier && optionDossier.textContent === 'Expérimentations';
        const rangee = () => document.querySelector(M + ' .biblio2-panneau--bibliotheque .biblio2-rangee[data-biblio-item-id="' + pratiqueId + '"]');
        const aDossierSurRangee = !!rangee() && rangee().getAttribute('data-dossier') === dossier.id;
        const aActionRetirer = !!document.querySelector('[data-action="BibliothequeUI.repertoires.retirer"][data-param2="' + pratiqueId + '"]');

        // Le menu de la barre filtre la colonne : le dossier choisi, la rangée seule reste visible
        const select = document.querySelector(M + ' .biblio2-barre select');
        select.value = dossier.id;
        window.BibliothequeUI.choisirDossier('modalBibliothequePratiques', select);
        const visibles = [...document.querySelectorAll(M + ' .biblio2-panneau--bibliotheque .biblio2-liste > .biblio2-rangee:not([hidden])')]
            .map(li => li.getAttribute('data-biblio-item-id'));
        select.value = '__tous__';
        window.BibliothequeUI.choisirDossier('modalBibliothequePratiques', select);

        // Persistance : le module connaît l'appartenance
        const estClassee = window.repertoiresBibliotheque.obtenir('pratiques')[0].itemIds.includes(pratiqueId);

        // Retirer → repasse non classée
        await window.BibliothequeUI.repertoires.retirer('pratiques', pratiqueId);
        const retiree = !window.repertoiresBibliotheque.obtenir('pratiques')[0].itemIds.includes(pratiqueId);
        const nonClasseeApres = !!rangee() && rangee().getAttribute('data-dossier') === '__nonclasse__';

        return { aOptionNonClassees, aActionClasser, aOptionDossier, aDossierSurRangee, aActionRetirer, visibles, pratiqueId, estClassee, retiree, nonClasseeApres };
    });

    expect(resultat.erreur).toBeUndefined();
    expect(resultat.aOptionNonClassees).toBe(true);
    expect(resultat.aActionClasser).toBe(true);
    expect(resultat.aOptionDossier).toBe(true);
    expect(resultat.aDossierSurRangee).toBe(true);
    expect(resultat.aActionRetirer).toBe(true);
    expect(resultat.visibles).toEqual([resultat.pratiqueId]);
    expect(resultat.estClassee).toBe(true);
    expect(resultat.retiree).toBe(true);
    expect(resultat.nonClasseeApres).toBe(true);
    expect(erreurs).toEqual([]);
});
