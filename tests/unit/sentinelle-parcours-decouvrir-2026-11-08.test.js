// =======================================================================
// LOT « LES DEUX PARCOURS » — 8 NOVEMBRE 2026, PARTIE 1 : LES MOTS ET LE RETRAIT
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md.
//   1. Les huit bulles de « Découvrir » sont celles que Grégoire a validées une à une :
//      chaque titre, texte et geste se trouve TEL QUEL dans la consigne. Un mot changé
//      dans le code, et ce banc rougit.
//   2. Le panneau « Assistance » et l'aide de la visite disent les phrases de la consigne.
//   3. La visite en sept étapes est partie, rien ne reste à côté (zéro dette) :
//      ETAPES_TOUR, TOUR_NAV, TOUR_TITRE_COURT, panneau-tour-guide, tour-etape-*,
//      tourGuide_* dans les défauts, « Bienvenue dans la visite guidée ».
// Break-test (8 nov.) : « dix étudiant·es » changé en « 10 étudiant·es » dans
// js/parcours-decouvrir.js → ROUGE (bloc 1), rétabli → vert.

import { describe, it, expect } from 'vitest';
import { tranche } from './_helpers/tranche.js';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const CONSIGNE = lire('plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md');
const DECOUVRIR = lire('js/parcours-decouvrir.js');

/** Les chaînes d'un champ (titre, texte, geste, libelle) dans le bloc ETAPES, guillemets simples ou doubles. */
function chaines(source, champ) {
    const bloc = tranche(source, 'var ETAPES = [', 'var DEF = ');
    const re = new RegExp(champ + ":\\s*(?:\"((?:[^\"\\\\]|\\\\.)*)\"|'((?:[^'\\\\]|\\\\.)*)')", 'g');
    // L'insécable des pourcentages (« 84\u00a0% », règle #1137) est de la typographie : la
    // consigne, recopiée de la page du tri, porte des espaces ordinaires.
    return [...bloc.matchAll(re)].map((m) => (m[1] ?? m[2]).replace(/\\'/g, "'").replace(/\\u00a0/g, ' '));
}

describe('« Découvrir » : les huit bulles, mot pour mot', () => {
    const titres = chaines(DECOUVRIR, 'titre');
    const textes = chaines(DECOUVRIR, 'texte');
    const gestes = chaines(DECOUVRIR, 'geste');

    it('huit étapes, huit titres, huit textes, six gestes (les étapes 4 et 8 n’en ont pas)', () => {
        expect(titres).toHaveLength(8);
        expect(textes).toHaveLength(8);
        expect(gestes).toHaveLength(6);
    });

    it.each(titres.map((t, i) => [i + 1, t]))('étape %i : le titre « %s » est celui de la consigne', (n, titre) => {
        expect(CONSIGNE).toContain(`Étape ${n}, « ${titre} »`);
    });

    it.each(textes.map((t, i) => [i + 1, t]))('étape %i : le texte est celui de la consigne', (n, texte) => {
        expect(CONSIGNE).toContain(`Texte : « ${texte} »`);
    });

    it.each(gestes.map((g) => [g]))('le geste « %s » est celui de la consigne', (geste) => {
        expect(CONSIGNE).toContain(`Geste : « ${geste} »`);
    });

    it('les boutons : « Continuer » (étape 4), « Commencer avec ma classe » et « Continuer d’explorer la démo » (étape 8)', () => {
        expect(chaines(DECOUVRIR, 'libelle')).toEqual(['Continuer', 'Commencer avec ma classe', "Continuer d'explorer la démo"]);
        expect(CONSIGNE).toContain('Bouton « Continuer »');
        expect(CONSIGNE).toContain('« Commencer avec ma classe »');
        expect(CONSIGNE).toContain("« Continuer d'explorer la démo »");
    });

    it('le lien de sortie et le message de reprise', () => {
        expect(DECOUVRIR).toContain("lienSortie: 'Quitter le parcours'");
        expect(CONSIGNE).toContain('« Quitter le parcours »');
        const message = 'Tu pourras reprendre ce parcours depuis « Assistance », dans le menu.';
        expect(DECOUVRIR).toContain(message);
        expect(CONSIGNE).toContain(message);
    });
});

describe('le panneau « Assistance » et l’aide disent les phrases de la consigne', () => {
    it('les lignes des deux parcours', () => {
        for (const [f, ligne] of [
            ['js/parcours-decouvrir.js', "Ce que Labo Codex te montre avant d'entrer en classe, sur une classe de démonstration."],
            ['js/parcours-classe.js', "De ton trimestre à ta première saisie de présences : ta classe d'un coup d'œil."]
        ]) {
            expect(lire(f)).toContain(ligne);
            expect(CONSIGNE).toContain(`« ${ligne.replace(/\.$/, '')}`);
        }
    });

    it('l’aide sur la visite est retirée : plus rien ne l’ouvrait', () => {
        // ↻ Partie 1 (9 nov. 2026), décision de Cowork : la fiche 'tour-guide' (« Visite guidée », bouton
        // « Démarrer la visite ») part, mesurée sans ouvreur (aucun data-aide, data-target, voirAussi ni appel
        // par clé) ; son action demarrerTourDepuisAide part avec elle.
        const popup = lire('js/accompagnement-contenu-popup.js');
        expect(popup).not.toContain("'tour-guide': {");
        expect(popup).not.toContain('Démarrer la visite');
        expect(popup).not.toContain('La visite guidée te présente');
        expect(lire('js/accompagnement.js')).not.toContain('demarrerTourDepuisAide');
    });

    it('le menu : « Assistance » ouvre le panneau, plus de « Visite guidée » ni d’interrupteur', () => {
        const index = lire('index.html');
        expect(index).toContain('data-action="ouvrirPanneauAssistance"');
        expect(index).not.toMatch(/entete-menu-mot">Visite guid/);
        expect(index).not.toContain('id="btn-assistance-nav"');
        expect(lire('js/accueil.js')).toContain('data-action="ouvrirPanneauAssistance">Assistance</button>');
    });
});

describe('la visite en sept étapes est partie, rien ne reste à côté', () => {
    const fichiersJs = readdirSync(path.join(racine, 'js')).filter((f) => f.endsWith('.js')).map((f) => 'js/' + f);
    const sources = [...fichiersJs, 'index.html', 'styles.css', 'css/accompagnement.css', 'css/parcours.css']
        .map((f) => [f, lire(f)]);

    it.each([
        'ETAPES_TOUR', 'TOUR_NAV', 'TOUR_TITRE_COURT', 'panneau-tour-guide', "'tour-etape-",
        'Bienvenue dans la visite guid', 'demarrerTourGuide', 'fermerPanneauTour', 'entete-tour-guide', 'ico-route'
    ])('« %s » n’existe plus dans le code', (motif) => {
        const restes = sources.filter(([, s]) => s.includes(motif)).map(([f]) => f);
        expect(restes).toEqual([]);
    });

    it('les défauts des préférences ne portent plus tourGuide_* (le stock chez les gens n’est pas réécrit)', () => {
        const prefs = lire('js/preferences.js');
        expect(prefs).not.toMatch(/^\s*tourGuide_\w+:/m);
        expect(prefs).toMatch(/^\s*parcoursAssistance: \{\},/m);
    });
});
