import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE-CLIQUET — #391 (audit qualité 5 août 2026, rapports A7+B8, 🟢) —
// Ablation zéro-dette du code mort vérifié à 0 appelant :
// - executerImport + donneesImportEnAttente + bouton btnExecuterImport :
//   la variable n'était JAMAIS assignée non-nulle → fonction inerte, bouton
//   désactivé à vie (l'ancienne modale bascule toujours vers la nouvelle).
// - executerImportVersBibliotheques : 0 appelant ET fusion NON assainie
//   (pas d'assainirObjet) — dangereuse si rebranchée un jour.
// - analyserRessourcesBibliotheques : 0 appelant ET buggée (lisait
//   details.pratiques au lieu de details.ressources.pratiques → TypeError).
// - mettreAJourGuideGroupeCours / mettreAJourApercuGroupeCours /
//   _supprimerGroupeCoursV2_legacy : ciblaient des éléments DOM disparus
//   d'index.html (status-*, v2-gc-apercu-texte) → no-ops intégraux.
// Cliquet d'absence (cf. SKILL_verification_adverse §4 cas ratchet) :
// break-testé par RÉINTRODUCTION d'un symbole.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racineProjet, f), 'utf8');

describe('#391 · le code mort retiré ne revient pas (cliquet)', () => {
    it('import-export.js : trio mort absent, chemins vivants intacts', () => {
        const src = lire('js/import-export.js');
        expect(src).not.toMatch(/donneesImportEnAttente/);
        expect(src).not.toMatch(/function executerImport\(\)/);
        expect(src).not.toMatch(/executerImportVersBibliotheques/);
        expect(src).not.toMatch(/analyserRessourcesBibliotheques/);
        // Les chemins VIVANTS de la même modale survivent à l'ablation
        expect(src).toMatch(/function ouvrirModalImport\(\)/);
        expect(src).toMatch(/function previsualiserImport\(/);
        expect(src).toMatch(/async function executerImportSelectif\(\)/);
    });

    it('index.html : plus de bouton btnExecuterImport inerte', () => {
        expect(lire('index.html')).not.toMatch(/btnExecuterImport/);
    });

    it('famille trimestre-v2 : plus aucune référence aux no-ops à cibles DOM disparues', () => {
        for (const f of ['trimestre-v2.js', 'trimestre-v2-init.js', 'trimestre-v2-etudiants.js',
                         'trimestre-v2-cours.js', 'trimestre-v2-groupes-cours.js',
                         'trimestre-v2-horaires.js', 'trimestre-v2-orchestre.js']) {
            const src = lire('js/' + f);
            expect(src, f).not.toMatch(/mettreAJourGuideGroupeCours/);
        }
        const orch = lire('js/trimestre-v2-orchestre.js');
        expect(orch).not.toMatch(/mettreAJourApercuGroupeCours/);
        expect(orch).not.toMatch(/_supprimerGroupeCoursV2_legacy/);
    });
});
