// =======================================================================
// LOT « LES DEUX PARCOURS » — PARTIE 2 (9 NOV. 2026) : LES MOTS DE « METTRE TA CLASSE EN PLACE »
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md, partie 2.
//   1. Les huit bulles sont celles que Grégoire a validées une à une le 8 nov. au matin : chaque
//      titre et chaque texte se trouve TEL QUEL dans la consigne. Un mot changé, et ce banc rougit.
//   2. La variante d'avant le premier cours, et les boutons « D'accord » et « Terminer ».
//   3. « Plus tard », le lien discret de chaque bulle sauf la dernière.
//   4. Le lancement provisoire de la partie 1 est parti (zéro dette) : « Commencer » ne fait plus
//      qu'ouvrir Cadre › Trimestre, il lance le parcours.
// Break-test (9 nov.) : « tes présences, tes évaluations » changé en « tes présences et tes
// évaluations » dans js/parcours-classe.js → ROUGE (étape 1), rétabli → vert.

import { describe, it, expect } from 'vitest';
import { tranche } from './_helpers/tranche.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const CONSIGNE = lire('plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md');
const PARTIE_2 = tranche(CONSIGNE, 'PARTIE 2, DE « COMMENCER » À SA PROPRE CLASSE', 'À MESURER ET RENDRE COMPTE');
const CLASSE = lire('js/parcours-classe.js');

/** Les chaînes d'un champ dans le bloc ETAPES (titre, texte, libelle), guillemets simples ou doubles. */
function chaines(source, champ, debut = 'var ETAPES = [', fin = 'var DEF = ') {
    const bloc = tranche(source, debut, fin);
    const re = new RegExp('(?<![\\w.])' + champ + ":\\s*(?:\"((?:[^\"\\\\]|\\\\.)*)\"|'((?:[^'\\\\]|\\\\.)*)')", 'g');
    return [...bloc.matchAll(re)].map((m) => (m[1] ?? m[2]).replace(/\\'/g, "'"));
}

/** Une constante `var NOM = "…";` du fichier. */
function constante(source, nom) {
    const m = source.match(new RegExp('var ' + nom + ' = (?:"((?:[^"\\\\]|\\\\.)*)"|\'((?:[^\'\\\\]|\\\\.)*)\');'));
    return m ? (m[1] ?? m[2]).replace(/\\'/g, "'") : null;
}

describe('« Mettre ta classe en place » : les huit bulles, mot pour mot', () => {
    const titres = chaines(CLASSE, 'titre');
    // Les textes posés directement, puis celui de l'étape 7 (une constante : la bulle a deux états).
    const textes = chaines(CLASSE, 'texte');

    it('huit titres ; sept textes posés directement et celui de l’étape 7 dans sa constante', () => {
        expect(titres).toHaveLength(8);
        expect(textes).toHaveLength(7);
        expect(CLASSE).toContain('get texte() { return avantPremierCours ? TEXTE_7_AVANT : TEXTE_7; }');
    });

    it.each(titres.map((t, i) => [i + 1, t]))('étape %i : le titre « %s » est celui de la consigne', (n, titre) => {
        expect(PARTIE_2).toContain(`Étape ${n}, « ${titre} »`);
    });

    it.each([1, 2, 3, 4, 5, 6, 8].map((n, i) => [n, i]))('étape %i : le texte est celui de la consigne', (n, i) => {
        const etape = tranche(PARTIE_2, `Étape ${n}, «`, n === 8 ? 'Bouton « Terminer »' : `Étape ${n + 1}, «`);
        expect(etape).toContain(`Texte : « ${textes[i]} »`);
    });

    it('étape 7 : le texte de la saisie', () => {
        const etape = tranche(PARTIE_2, 'Étape 7, «', 'Défaut à corriger');
        expect(etape).toContain(`Texte : « ${constante(CLASSE, 'TEXTE_7')} »`);
    });

    it('étape 7, avant le premier cours : le texte de la consigne, et « D’accord »', () => {
        const variante = constante(CLASSE, 'TEXTE_7_AVANT');
        expect(PARTIE_2).toContain(`l'étape 7 affiche à la place : « ${variante} »`);
        expect(chaines(CLASSE, 'libelle', 'var BOUTONS_7_AVANT', 'var ETAPES = [')).toEqual(["D'accord"]);
        expect(PARTIE_2).toContain("Bouton « D'accord »");
    });

    it('étape 8 : « Terminer », et rien d’autre', () => {
        expect(chaines(CLASSE, 'libelle')).toEqual(['Terminer']);
        expect(PARTIE_2).toContain('Bouton « Terminer »');
    });

    it('« Plus tard » sur chaque bulle sauf la dernière', () => {
        expect(CLASSE).toContain("lienSortie: 'Plus tard'");
        expect(PARTIE_2).toContain('Un lien discret « Plus tard » sur chaque bulle sauf la dernière');
        const derniere = tranche(CLASSE, "titre: \"Ta classe d'un coup d'œil\"", 'var DEF = ');
        expect(derniere).toContain('sansSortie: true');
    });

    it('la ligne du panneau', () => {
        const ligne = "De ton trimestre à ta première saisie de présences : ta classe d'un coup d'œil.";
        expect(CLASSE).toContain(ligne);
        expect(CONSIGNE).toContain(`« ${ligne.replace(/\.$/, '')}`);
    });
});

describe('le lancement provisoire de la partie 1 est parti', () => {
    it('« Commencer » (carte enseignant de l’accueil) lance le parcours, il n’ouvre plus Cadre › Trimestre lui-même', () => {
        const accueil = tranche(lire('js/accueil.js'), 'function commencerParLeTrimestre()', '\n}\n');
        expect(accueil).toContain("p.id === 'classe'");
        expect(accueil).toContain('classe.lancer()');
        expect(accueil).not.toContain('naviguerAccueilCarte');
        expect(accueil).not.toContain('ouvrirAccordeonDeLEtape');
    });

    it('parcours-classe.js ne passe plus par commencerParLeTrimestre ; plus d’export d’ouvrirAccordeonDeLEtape', () => {
        expect(CLASSE).not.toContain('commencerParLeTrimestre()');
        expect(CLASSE).not.toMatch(/PARTIE 1 SEULEMENT|lancement provisoire/);
        expect(lire('js/trimestre-v2.js')).not.toContain('window.ouvrirAccordeonDeLEtape');
    });

    it('le parcours se repère sur la frise du Cadre, une seule source (etapesDuCadre)', () => {
        const t = lire('js/trimestre-v2.js');
        expect(t).toContain('ChaineEtapes.dessiner(barre, etapesDuCadre(),');
        expect(t).toContain('window.etapesDuCadre = etapesDuCadre;');
        expect(CLASSE).toContain('window.etapesDuCadre()');
    });
});
