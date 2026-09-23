/**
 * SENTINELLE — lot 29 (17 sept. 2026) : les cinq textes choisis par Grégoire (#901 : C-1, C-2, C-3, C-6 ;
 * #899) sont dans le code livré, MOT POUR MOT, et les anciens n'y sont plus.
 *
 * Ces phrases sont des mots que des enseignant·es lisent : elles ne se reformulent pas en chemin. Le banc
 * lit les fichiers de js/ tels que livrés (pas de DOM) ; la ligne #899 est en plus exercée par
 * genererRecapitulatif dans le banc de l'audit (création : présente ; réédition complète : absente).
 *
 *   cd tests && npx vitest run unit/sentinelle-lot-29-cinq-textes-901-899.test.js
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
/** Les espaces insécables du fichier (entité ou caractère) valent une espace : on juge les MOTS. */
const mots = (s) => s.replace(/&nbsp;| |\\u00a0/g, ' ');

describe('lot 29 · #901 — quatre phrases de l\'Aide disent ce que fait le code', () => {
    it('C-1 · le récapitulatif de l\'assistant dit « Par artefacts », sans la parenthèse', () => {
        const src = lire('js/wizard-pratique-v2.js');
        expect(src).toContain("'n-meilleurs': 'Par artefacts',");
        expect(src).not.toContain('Par artefacts (N meilleurs)');
    });

    it('C-2 · la dénotation : titre sans « à l\'horizon », encadré « disponible »', () => {
        const src = mots(lire('js/guides-pedagogiques.js'));
        expect(src).toContain("titre: 'La dénotation : une PRÉN',");
        expect(src).toContain("<strong>Statut dans Labo Codex.</strong> La dénotation est disponible : l'assistant de création la propose, et le jugement sur chaque cible se saisit dans le profil de l'élève.</div>");
        expect(src).not.toMatch(/PRÉN à l.horizon/);
        expect(src).not.toContain('pas encore activable');
        expect(src).not.toContain('ne décrit pas une fonction disponible');
    });

    it('C-2 (vérité) · l\'assistant propose bien la dénotation, et le profil porte la saisie du jugement', () => {
        expect(lire('js/wizard-pratique-v2.js')).toMatch(/config-denotation/);
        expect(lire('js/pratiques/denotation-saisie-ui.js')).toMatch(/ciblesAtteintes/);
    });

    it('C-6 · l\'indice P : « note courante », les quatre familles nommées', () => {
        const src = mots(lire('js/guides-pedagogiques.js'));
        expect(src).toContain("<p>L'indice P est la note courante de l'étudiant·e, calculée selon la pratique de notation active (Standards, Spécifications, Dénotation ou Sommative). Il ne représente <em>pas</em> la note finale du trimestre");
        expect(src).not.toContain('PAN – Standards, Sommative, ou une pratique personnalisée');
    });

    it('C-3 · glossaire « PAN » : STD et SPE ; la dénotation est une PRÉN', () => {
        const src = mots(lire('js/accompagnement-contenu-terme.js'));
        expect(src).toContain("definition: 'Terme qui désigne les pratiques Standards (STD) et Spécifications (SPE). La Dénotation (DEN) est une PRÉN ; l\\'application lui donne aussi le badge « PAN » par commodité. Dans le contexte PAN, les productions");
        expect(src).not.toContain('Terme générique qui regroupe les pratiques STD, SPE et DEN');
    });
});

describe('lot 29 · #899 — le récapitulatif d\'une spécification dit où régler types et forfaits', () => {
    it('la ligne est dans le code, mot pour mot', () => {
        const src = mots(lire('js/wizard-pratique-v2.js'));
        // Lot N6 (#899, la flèche) : « → », comme les autres chemins des pratiques de notation ; le reste mot pour mot.
        expect(src).toContain('<strong>Types de productions et forfaits :</strong> à régler après la création, dans Conception → Pratiques de notation (clique sur la pratique). Tant qu\\\'ils manquent, aucune note ne peut être calculée.');
        expect(src).not.toContain('Conception › Pratiques de notation');
    });

    it('le chemin qu\'elle promet existe : section « Pratiques de notation » sous Conception, et les deux titres de l\'éditeur', () => {
        expect(lire('js/config.js')).toMatch(/id: 'pratiques-notation', label: 'Pratiques de notation'/);
        const html = lire('index.html');
        expect(html).toMatch(/<h4[^>]*>Types de productions<\/h4>/);
        expect(html).toMatch(/<h4[^>]*>Table des forfaits \(bundles\)<\/h4>/);
    });
});
