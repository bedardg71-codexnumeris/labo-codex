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
// #327 — le câblage est passé au helper générique BibliothequeUI.repertoires.*
// (handlers paramétrés par `biblio`, ids préfixés rep-pratiques-*). Mêmes
// comportements vérifiés, sélecteurs mis à jour.

//
// ↻ #1156 (25 oct. 2026) — RÉANCRÉ : la zone « Mes dossiers » repliable (`genererZone`, `basculer`) est retirée
// avec la fenêtre d'avant. La gestion des dossiers vit dans la barre de « Dans ta bibliothèque » : cachée
// d'abord, ouverte par « Gérer les dossiers… » (le menu des dossiers), refermée par « Fermer ». Mêmes
// comportements éprouvés : le champ de création, le message « aucun dossier », un dossier créé apparaît au
// ré-affichage (renommable, supprimable), et le dépliage suit le geste.
// BREAK-TEST (25 oct.) : `zone.hidden = false` retiré de `BibliothequeUI.ouvrirGestionDossiers` → ROUGE.

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

test('L1 · la gestion des dossiers se rend et un répertoire créé apparaît', async ({ page }) => {
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
        window.BibliothequeUI.repertoires.poserDeplie('pratiques', false);

        // 1er rendu : la gestion, son champ de création, le message « aucun dossier »
        await window.afficherBibliothequePratiques();
        const zone = () => document.getElementById('modalBibliothequePratiques-dossiers');
        const aZone = !!zone() && zone().textContent.includes('Mes dossiers');
        const aChampCreation = !!document.getElementById('rep-pratiques-nouveau-nom');
        const aMessageVide = !!zone() && zone().textContent.includes('Aucun dossier');

        // Création via le module + ré-affichage (simule le handler)
        const cree = window.repertoiresBibliotheque.creer('Essais L1', 'pratiques');
        await window.afficherBibliothequePratiques();
        const modal2 = document.getElementById('modalBibliothequePratiques');
        const champRenomme = modal2 ? modal2.querySelector('input[data-rep-id="' + cree.id + '"]') : null;
        const aBoutonSupprimer = !!(modal2 && modal2.querySelector('[data-action="BibliothequeUI.repertoires.supprimer"][data-param2="' + cree.id + '"]'));

        // Cachée par défaut ; « Gérer les dossiers… » l'ouvre, « Fermer » la referme
        const repliee = zone().hidden === true;
        const select = document.querySelector('#modalBibliothequePratiques .biblio2-barre select');
        const aOptionGerer = !!select && [...select.options].some(o => o.value === '__gerer__');
        select.value = '__gerer__';
        window.BibliothequeUI.choisirDossier('modalBibliothequePratiques', select);
        const ouverteApresGeste = zone().hidden === false;
        const filtreIntact = select.value === '__tous__';
        window.BibliothequeUI.fermerGestionDossiers('modalBibliothequePratiques');
        const fermeeApresFermer = zone().hidden === true;

        const aHandlers = typeof window.BibliothequeUI.repertoires.creer === 'function'
            && typeof window.BibliothequeUI.repertoires.renommer === 'function'
            && typeof window.BibliothequeUI.repertoires.supprimer === 'function';

        return {
            aZone, aChampCreation, aMessageVide,
            valeurChamp: champRenomme ? champRenomme.value : null,
            aBoutonSupprimer, repliee, aOptionGerer, ouverteApresGeste, filtreIntact, fermeeApresFermer, aHandlers
        };
    });

    expect(resultat.erreur).toBeUndefined();
    expect(resultat.aZone).toBe(true);
    expect(resultat.aChampCreation).toBe(true);
    expect(resultat.aMessageVide).toBe(true);
    expect(resultat.valeurChamp).toBe('Essais L1');
    expect(resultat.aBoutonSupprimer).toBe(true);
    expect(resultat.repliee).toBe(true);
    expect(resultat.aOptionGerer).toBe(true);
    expect(resultat.ouverteApresGeste).toBe(true);
    expect(resultat.filtreIntact).toBe(true);
    expect(resultat.fermeeApresFermer).toBe(true);
    expect(resultat.aHandlers).toBe(true);
    expect(erreurs).toEqual([]);
});
