import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE — Phases B et C de la refonte de la note finale du portfolio
// =======================================================================
//
// `plans de travail/PLAN-refonte-note-finale-portfolio.md` (24 mai 2026)
// portait ses phases B et C comme « À FAIRE » — jusqu'au 9 août 2026, où la
// vérification au code a montré qu'elles étaient **livrées**, sans trace et
// sans filet. C'est le motif que l'audit des plans a rencontré cinq fois :
// le plan dormait, le travail était en production.
//
// ⚠ Ce qui rend cette absence de filet dangereuse ici : les défauts que B et C
// corrigent sont des défauts d'AFFICHAGE. Ils ne cassent aucun calcul, aucun
// test ne les voit, et ils sortent chez l'élève dans un PDF. Le bug d'origine
// (Bug 3/Bug 4 du plan) a vécu des semaines exactement comme ça.
//
// Ce qui est verrouillé, en suivant les six décisions architecturales du §4
// du plan :
//   C1-C4 — profil : aucun bloc « Évaluation terminale » fantôme, formule et
//           grille adaptées, branche hybride-sans-terminale ;
//   B1-B4 — PDF de rétroaction : sélection et obligatoires strictement séparés
//           (fin du doublon), pondérations PAR BLOC réellement rendues, titre
//           piloté par l'enseignant et non codé en dur ;
//   D1-D2 — les deux garde-fous du calcul : zéro pondération de repli, et la
//           terminale identifiée par son TYPE, jamais par une heuristique.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

const sourceProfil = lire('js', 'profil-etudiant-sections-affichage.js');
const sourceActions = lire('js', 'profil-etudiant-actions.js');
const sourceRegistre = lire('js', 'pratiques', 'pratique-registre.js');
const sourceData = lire('js', 'synthese-retroaction-data.js');
const sourceRendu = lire('js', 'synthese-retroaction-rendu.js');
const sourceGestion = lire('js', 'pratiques-gestion.js');
const sourceIndex = lire('index.html');

describe('Phase C · le panneau du profil ne montre plus de terminale fantôme', () => {
    it('C1 — la carte de la terminale est CONDITIONNÉE à sa présence', () => {
        // Bug 4 du plan : le bloc était rendu même sans terminale, avec un
        // « × 0% » qui ne voulait rien dire.
        expect(sourceProfil).toMatch(/const carteTerminale = terminal\.present \?/);
    });

    it('C2 — la formule ne promet « X% + Y% = 100% » que s’il y a deux composantes', () => {
        expect(sourceProfil).toMatch(/const formuleClassique = terminal\.present\s*\n?\s*\?/);
        expect(sourceProfil).toContain('Note finale (portfolio à 100\\u00a0%)');
    });

    it('C3 — la grille passe en colonne unique quand la terminale est absente', () => {
        // Sans ça, la carte Portfolio occupe une demi-largeur et l'autre moitié
        // reste vide : le lecteur cherche ce qui manque.
        expect(sourceProfil).toMatch(/note-finale-grid\$\{terminal\.present \? '' : ' note-finale-grid-single'\}/);
    });

    it('C4 — le mode hybride sans terminale a sa propre branche', () => {
        expect(sourceProfil).toMatch(/if \(estHybride && !terminal\.present\)/);
    });
});

describe('Phase B · le PDF de rétroaction explique honnêtement la note', () => {
    it('B1 — la sélection EXCLUT les obligatoires (fin du doublon)', () => {
        // Bug 3 du plan : `retenus` fusionnait les deux, la colonne de gauche
        // annonçait « les N meilleurs » en y comptant des productions retenues
        // d'office, et la colonne de droite les listait une seconde fois.
        expect(sourceData).toMatch(/retenusDecrits\.filter\(r => r\.categorie !== 'obligatoire'\)/);
        expect(sourceData).toMatch(/retenusDecrits\.filter\(r => r\.categorie === 'obligatoire'\)/);
    });

    it('B2 — les pondérations par bloc sont exposées ET rendues', () => {
        // Elles étaient calculées puis jamais utilisées — un calcul mort qui
        // donnait l'illusion que le rendu en tenait compte.
        for (const champ of ['ponderationSelection', 'ponderationObligatoires']) {
            expect(sourceData, champ).toContain(champ + ':');
            expect(sourceRendu, champ).toContain('note.' + champ);
        }
        expect(sourceRendu).toContain('badgePondSel');
        expect(sourceRendu).toContain('badgePondObl');
    });

    it('B3 — le titre est piloté par l’enseignant, jamais codé en dur', () => {
        // Décision §4-5 du plan : pas d'inférence automatique du statut.
        expect(sourceRendu).toMatch(/estFinale \? 'Note finale' : 'Note provisoire'/);
        expect(sourceData).toMatch(/notesFinales === true/);
    });

    it('B4 — le toggle Provisoire/Finale existe dans l’UI et fait l’aller-retour', () => {
        expect(sourceIndex).toContain('mat-notes-finales');
        expect(sourceGestion).toMatch(/setCheckbox\('mat-notes-finales'/);      // lecture
        expect(sourceGestion).toMatch(/notesFinales = getCheckbox\('mat-notes-finales'\)/); // écriture
    });
});

describe('Décisions §4 · les deux garde-fous du calcul', () => {
    it('D1 — aucune pondération de repli 60/40 ne subsiste', () => {
        // Décision §4-1 : les pondérations viennent TOUJOURS de la
        // configuration. Le seul implicite légitime est « pas de terminale
        // → portfolio 100 % », qui est une conséquence, pas un défaut choisi.
        expect(sourceActions).not.toMatch(/ponderationPortfolio\s*=\s*[^;]*\|\|\s*60/);
        expect(sourceActions).not.toMatch(/ponderationTerminale\s*=\s*[^;]*\|\|\s*40/);
        expect(sourceActions).toContain('ponderationPortfolio = 100;');
    });

    it('D2 — la terminale est identifiée par son TYPE, jamais par son titre', () => {
        // Décision §4-2 : l'heuristique `titreLC.includes('terminal')` pouvait
        // promouvoir n'importe quel artefact.
        expect(sourceRegistre).toMatch(/productions\.find\(p => p && p\.type === 'terminale'\)/);
        expect(sourceRegistre).not.toMatch(/includes\(['"]terminal['"]\)/);
        expect(sourceActions).not.toMatch(/includes\(['"]terminal['"]\)/);
    });

    it('D3 — une configuration incomplète REFUSE de calculer au lieu de mentir', () => {
        // Décision §4-3 : pas de calcul silencieux trompeur.
        expect(sourceActions).toContain('erreurConfiguration');
        expect(sourceActions).toMatch(/noteFinale = erreurConfiguration\s*\n?\s*\?/);
        expect(sourceProfil).toContain('Note finale non calculable.');
    });
});
