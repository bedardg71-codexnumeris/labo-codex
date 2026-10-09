import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #393 (audit qualité 5 août 2026, sous-lot mécanique, 🟢) —
// - Validation #369 étendue : deux journées sans cours à la même date =
//   avertissement (la 2e écrasait la 1re dans les maps du générateur, en
//   silence). Fonction PURE validerCadreTrimestre → test fonctionnel.
// - Import interrompu (rapport A8) : les catch d'import resynchronisent le
//   cache et disent que les éléments déjà importés sont conservés.
// - planification-bibliotheque : voie canonique cleSource() (plus de
//   namespacing dupliqué en dur).
// - Ablation compat 0 appelant : activerGroupeV2 (mutait infoCours.groupe
//   hors du couple GC actif), gererEtudiantsGroupeV2, ouvrirModalNouveauGroupe.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racineProjet, 'js', f), 'utf8');

describe('#393 · validerCadreTrimestre signale les doublons de date (fonctionnel)', () => {
    const win = chargerScript('js/trimestre-v2.js', {
        db: { getSync: () => null, setSync: () => {} }, cle: (k) => k,
        echapperHtml: (s) => s
    });

    const cadre = { dateDebut: '2026-08-24', finCours: '2026-12-11', finTrimestre: '2026-12-22' };

    it('deux journées à la même date → avertissement', () => {
        const avertissements = win.validerCadreTrimestre(cadre, [
            { id: 'A', dateEvenement: '2026-09-07', description: 'Fête du travail' },
            { id: 'B', dateEvenement: '2026-09-07', description: 'Fête du travail (bis)' }
        ]);
        expect(avertissements.some(m => m.includes('même date') && m.includes('2026-09-07'))).toBe(true);
    });

    it('dates distinctes → silencieux (aucun faux positif)', () => {
        const avertissements = win.validerCadreTrimestre(cadre, [
            { id: 'A', dateEvenement: '2026-09-07', description: 'Fête du travail' },
            { id: 'B', dateEvenement: '2026-10-12', description: 'Action de grâce' }
        ]);
        expect(avertissements).toEqual([]);
    });
});

describe('#393 · filet des imports interrompus + voie canonique + ablation compat', () => {
    it('les catch d\'import resynchronisent le cache et annoncent l\'état partiel', () => {
        const src = lire('import-export.js');
        const occurrences = src.match(/Import interrompu : /g) || [];
        expect(occurrences.length).toBe(2);
        expect(src).toMatch(/catch \(erreur\) \{[\s\S]{0,600}syncToLocalStorageCache\(\)/);
    });

    it('planification-bibliotheque ne lit aucun trimestre en direct : planificationDonnees le fait, par cleSource()', () => {
        // Lot 3 de la carte (9 oct. 2026) : la Bibliothèque importe vers le trimestre
        // actif par `planificationDonnees` (listerTrimestresAvecCartes, reprise).
        const src = lire('planification-bibliotheque.js');
        expect(src).not.toMatch(/_planification_mindmap/);
        expect(src).not.toMatch(/planification_mindmap/);
        expect(src).toContain('listerTrimestresAvecCartes()');
        const donnees = lire('planification-donnees.js');
        expect(donnees).toMatch(/db\.getSync\(cleSource\(CLE_DONNEES, t\.id\), null\)/);
    });

    it('les fonctions compat 0 appelant ne reviennent pas (cliquet)', () => {
        const src = lire('trimestre-v2-etudiants.js');
        expect(src).not.toMatch(/activerGroupeV2/);
        expect(src).not.toMatch(/gererEtudiantsGroupeV2/);
        expect(src).not.toMatch(/ouvrirModalNouveauGroupe/);
    });
});
