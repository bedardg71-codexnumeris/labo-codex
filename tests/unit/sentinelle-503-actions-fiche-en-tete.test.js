import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// Sentinelle #503 (25 août 2026) — LES ACTIONS DE LA FICHE SUIVENT LEUR
// FORMULAIRE, MAINTENANT QU'ELLES N'Y SONT PLUS.
//
// Le fil : Dupliquer, Supprimer, Annuler et Enregistrer vivaient au BAS du
// formulaire de production. Grégoire les voulait en haut, à côté de
// « + Nouvelle production » — plutôt qu'au terme d'un écran qu'il faut
// parcourir pour enregistrer.
//
// ⚠⚠ CE QUE LE DÉPLACEMENT A CASSÉ, ET QU'IL FALLAIT REMPLACER. Ces boutons ne
// portaient aucune règle d'affichage : ils tiraient leur visibilité du
// formulaire qui les CONTENAIT. Sortis de lui, ils resteraient visibles sur un
// écran vide — quatre boutons qui proposent d'enregistrer une fiche qui n'est
// pas ouverte, dont un « Supprimer ».
//
// ⮕ `lierActionsAuFormulaire` OBSERVE le formulaire au lieu de s'accrocher à
// chacun des endroits qui l'ouvrent ou le ferment. Les accrocher un à un aurait
// demandé de tous les trouver — et d'en retrouver un de plus au prochain
// chantier, le jour où quelqu'un ajoute un chemin d'ouverture sans savoir que
// des boutons en dépendent ailleurs.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const indexHtml = readFileSync(path.join(racine, 'index.html'), 'utf8');
const mainJs = readFileSync(path.join(racine, 'js', 'main.js'), 'utf8');

describe('#503 · les actions de la fiche ont monté en tête', () => {
    it('a. Les quatre boutons sont dans la barre de section, hors du formulaire', () => {
        const barre = indexHtml.match(/<div id="actionsFicheProduction"[\s\S]*?\n {32}<\/div>/);
        expect(barre, 'barre actionsFicheProduction trouvée').toBeTruthy();
        for (const action of ['dupliquerProductionActive', 'supprimerProductionActive',
                              'annulerFormProduction', 'sauvegarderProduction']) {
            expect(barre[0], action).toContain(action);
        }
        // Et elle précède le formulaire dans le document.
        expect(indexHtml.indexOf('id="actionsFicheProduction"'))
            .toBeLessThan(indexHtml.indexOf('id="formulaireProduction"'));
    });

    it('b. « Exporter en PDF » n\'y est plus — « Préparer le PDF » le remplace', () => {
        const barre = indexHtml.match(/<div id="actionsFicheProduction"[\s\S]*?\n {32}<\/div>/);
        expect(barre[0]).not.toContain('btnExporterPDFProduction');
        expect(indexHtml).toContain('afficherFormulairePDFDepuisProduction');
    });

    it('c. LE POINT DÉCISIF : la barre naît MASQUÉE', () => {
        // Sans ça, l'application s'ouvre sur quatre boutons — dont Supprimer —
        // qui proposent d'agir sur une fiche que personne n'a ouverte.
        const barre = indexHtml.match(/<div id="actionsFicheProduction"[^>]*>/);
        expect(barre[0]).toContain('u-hide');
        expect(barre[0]).toContain('display: none');
    });

    it('d. LES QUATRE ÉCRANS sont liés au démarrage', () => {
        // ⚠ La garde ne cherche plus un appel littéral : les trois couples sont
        // déclarés dans une table. Ce qui compte est qu'aucun écran ne soit
        // oublié — une barre non liée reste visible sur un écran vide.
        for (const [formulaire, actions] of [
            ['formulaireProduction', 'actionsFicheProduction'],
            ['conteneurEditionGrille', 'actionsFicheGrille'],
            ['conteneurEditionEchelle', 'actionsFicheEchelle'],
            // 30 août 2026 — la cartouche, quatrième écran. Son formulaire est
            // `#infoCartouche` : c'est lui que cartouches.js bascule (`u-hide`).
            ['infoCartouche', 'actionsFicheCartouche']
        ]) {
            expect(mainJs, formulaire).toContain(`['${formulaire}', '${actions}']`);
            expect(indexHtml, actions).toContain(`id="${actions}"`);
        }
        expect(mainJs).toContain('window.lierActionsAuFormulaire(couple[0], couple[1])');
    });

    it('d2. Les barres de la grille, de l\'échelle et de la cartouche naissent masquées', () => {
        for (const id of ['actionsFicheGrille', 'actionsFicheEchelle', 'actionsFicheCartouche']) {
            const barre = indexHtml.match(new RegExp('<div id="' + id + '"[^>]*>'));
            expect(barre, id).toBeTruthy();
            expect(barre[0], id).toContain('u-hide');
            expect(barre[0], id).toContain('display: none');
        }
    });

    it('d3. Leurs formulaires ne gardent pas de barre orpheline', () => {
        for (const [debutMarq, finMarq, action] of [
            ['id="conteneurEditionGrille"', 'Fin conteneurEditionGrille', 'sauvegarderGrilleComplete'],
            ['id="conteneurEditionEchelle"', 'Fin conteneurEditionEchelle', 'sauvegarderEchelleComplete'],
            // La cartouche n'a pas de marqueur « Fin » : son formulaire se termine
            // au panneau de métadonnées, qui le suit immédiatement.
            ['id="infoCartouche"', 'id="panneauMetadonneesCartouche"', 'sauvegarderCartoucheComplete']
        ]) {
            const dedans = tranche(indexHtml, debutMarq, finMarq);
            expect(dedans, action).not.toContain('data-action="' + action + '"');
        }
    });

    it('d4. CARTOUCHE — la barre de fiche porte les QUATRE mêmes actions que la grille et l\'échelle', () => {
        // Composition arrêtée le 30 août : la barre de fiche des trois écrans
        // porte la même chose, ni plus ni moins. Les actions de DOCUMENT
        // (les deux exports, le modèle vide) vivent à côté, pas dedans.
        const barre = indexHtml.match(/<div id="actionsFicheCartouche"[\s\S]*?\n {36}<\/div>/);
        expect(barre, 'barre actionsFicheCartouche trouvée').toBeTruthy();
        // ↻ Lot E1 (D3, 27 sept. 2026) : « Annuler » devient « Fermer » (`fermerFicheCartouche`) ;
        // `sauvegarderCartoucheComplete` porte désormais « Créer la cartouche ».
        for (const action of ['dupliquerCartoucheActive', 'supprimerCartoucheActive',
                              'fermerFicheCartouche', 'sauvegarderCartoucheComplete']) {
            expect(barre[0], action).toContain(action);
        }
        for (const dehors of ['btnExporterPDFCartouche', 'btnExporterTexteCartouche', 'btnModeleCartouche']) {
            expect(barre[0], `${dehors} est une action de document, pas de fiche`).not.toContain(dehors);
        }
    });

    it('d5. CARTOUCHE — « Télécharger un modèle » reste visible SANS fiche ouverte (#531)', () => {
        // ⚠⚠ L'INVARIANT QUI SE PERDRAIT LE PLUS FACILEMENT. Ce bouton sert
        // AVANT qu'une cartouche existe : le ranger dans la barre qui suit
        // `#infoCartouche`, ou lui poser `u-hide` comme à ses deux voisins, le
        // ferait disparaître exactement quand il est utile. Un futur ménage qui
        // uniformiserait « les trois boutons de document » casserait #531 sans
        // qu'aucun test ne parle — celui-ci parle.
        const modele = indexHtml.match(/<button id="btnModeleCartouche"[^>]*>/);
        expect(modele, 'btnModeleCartouche trouvé').toBeTruthy();
        expect(modele[0], 'le modèle vide reste visible sans fiche ouverte').not.toContain('u-hide');
        // Il vit en tête, avant le formulaire.
        expect(indexHtml.indexOf('id="btnModeleCartouche"'))
            .toBeLessThan(indexHtml.indexOf('id="infoCartouche"'));
        // Ses deux voisins, EUX, gardent `u-hide` : cartouches.js les bascule.
        for (const id of ['btnExporterPDFCartouche', 'btnExporterTexteCartouche']) {
            const b = indexHtml.match(new RegExp('<button id="' + id + '"[^>]*>'));
            expect(b[0], `${id} doit rester masqué tant qu'aucune cartouche n'est ouverte`).toContain('u-hide');
        }
    });

    it('e. Le lien OBSERVE le formulaire, il ne se greffe pas sur ses appelants', () => {
        const fn = mainJs.slice(mainJs.indexOf('window.lierActionsAuFormulaire'));
        expect(fn).toContain('MutationObserver');
        expect(fn, 'les changements de classe ET de style comptent')
            .toContain("attributeFilter: ['class', 'style']");
    });

    it('f. Les deux manières de masquer sont lues', () => {
        // `u-hide` et le style inline ont tous deux cours dans le projet : ne
        // regarder que l'un laisserait la barre visible une fois sur deux.
        const fn = mainJs.slice(mainJs.indexOf('window.lierActionsAuFormulaire'));
        expect(fn).toContain("classList.contains('u-hide')");
        expect(fn).toContain("style.display === 'none'");
    });

    it('g. Le formulaire ne garde aucune barre de boutons orpheline', () => {
        const debut = indexHtml.indexOf('id="formulaireProduction"');
        const fin = indexHtml.indexOf('Fin du formulaireProduction');
        expect(fin).toBeGreaterThan(debut);
        const dedans = indexHtml.slice(debut, fin);
        expect(dedans).not.toContain('data-action="sauvegarderProduction"');
        expect(dedans).not.toContain('data-action="annulerFormProduction"');
    });
});
