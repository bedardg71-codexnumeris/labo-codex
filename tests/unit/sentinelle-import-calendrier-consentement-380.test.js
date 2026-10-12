import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { suitDansLaFonction } from './_helpers/tranche.js';

// SENTINELLE — #380 (audit qualité 5 août 2026, rapport A1, 🔴) —
// executerImportSelectif écrivait les clés calendrier (cadreCalendrier,
// journeesSansCours, seancesCompletes, horaireHebdo…) INCONDITIONNELLEMENT :
// aucune case dans la modale, aucun isChecked, pas comptées au total. Un
// import « rien coché » affichait « Coche au moins un élément » alors que le
// cadre du trimestre du poste était DÉJÀ remplacé par celui du fichier.
// Verrous : (1) l'import passe par isChecked('calendrier') et la liste
// unique CLES_CALENDRIER_IMPORT ; (2) la modale offre la ligne dédiée ;
// (3) la case compte dans quelqueChoseCoche. Sentinelle source-level
// (le couplage modale/DOM rend le test fonctionnel disproportionné) —
// break-testée par retrait du gate puis de la ligne modale.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racineProjet, 'js', 'import-export.js'), 'utf8');

describe('#380 · l\'import des clés calendrier exige un consentement explicite', () => {
    it('le bloc d\'import calendrier est GATÉ par isChecked(\'calendrier\')', () => {
        expect(suitDansLaFonction(source, /if \(isChecked\('calendrier'\)\) \{/, /estCleCalendrierImport\(cleCal\)/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });

    it('ne réintroduit pas la liste inline non gatée de l\'ancien bloc', () => {
        expect(source).not.toMatch(/var clesCalendrier = \['cadreCalendrier'/);
    });

    it('la liste des clés est UNIQUE (CLES_CALENDRIER_IMPORT) et couvre journeesSansCours', () => {
        expect(source).toMatch(/const CLES_CALENDRIER_IMPORT = \['cadreCalendrier'[^\]]*'journeesSansCours'/);
    });

    it('la modale offre la ligne « Cadre du trimestre (calendrier) »', () => {
        expect(source).toMatch(/genererLigneDonnee\('calendrier', 'Cadre du trimestre \(calendrier\)'/);
    });

    it('la case calendrier compte dans quelqueChoseCoche (message « coche au moins un élément » honnête)', () => {
        expect(source).toMatch(/isChecked\('calendrier'\) \|\|/);
    });

    it('l\'analyse recense les clés calendrier pour la modale', () => {
        expect(source).toMatch(/calendrier: \{ count: 0, cles: \[\] \}/);
    });
});
