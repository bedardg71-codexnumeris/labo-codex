import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE-CLIQUET #396 — ablation du chemin 'pan_par_objectif' (décision D2,
// Grégoire, 5 août 2026). Le chemin n'a JAMAIS été fonctionnel (double défaut de
// champ, rapport L4 : filtre sur evaluation.note au lieu de noteFinale + lien
// evaluation.objectifs qu'aucun écrivain ne pose) → retiré, zéro-dette.
// - pratique-configurable.js : méthode calculerPerformanceParObjectif + case du
//   switch + branche detecterDefis SUPPRIMÉS ;
// - wizard : l'approche « par objectifs » pose conversion_niveaux (fold Standards) ;
// - configs stockées legacy : NORMALISÉES à la lecture par construireConfigComplete
//   (avertissement console, AUCUNE écriture de données).
// Break-test = mutation INVERSE (réintroduire le symbole → ce cliquet ROUGIT).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

describe('#396 · cliquet d\'absence — le chemin pan_par_objectif ne revient pas', () => {
    it('pratique-configurable.js ne porte plus ni le case ni la méthode', () => {
        const src = lire('js', 'pratiques', 'pratique-configurable.js');
        expect(src).not.toMatch(/case\s*'pan_par_objectif'/);
        expect(src).not.toMatch(/calculerPerformanceParObjectif\s*\(/);
        // l'échelle n'est plus exigée que pour conversion_niveaux
        expect(src).toMatch(/METHODES_AVEC_ECHELLE = \['conversion_niveaux'\]/);   // #1149, lot 3b : la liste sortie de valider(), partagée
    });

    it('le wizard ne produit plus jamais pan_par_objectif', () => {
        const src = lire('js', 'wizard-pratique-v2.js');
        expect(src).not.toMatch(/pan_par_objectif/);
    });

    it('hors normalisation du registre, plus AUCUNE occurrence du jeton dans js/', () => {
        // Le seul site légitime est la normalisation lecture seule de
        // construireConfigComplete (pratique-registre.js).
        const registre = lire('js', 'pratiques', 'pratique-registre.js');
        expect(registre).toMatch(/pan_par_objectif/); // le normalisateur existe
        const configurable = lire('js', 'pratiques', 'pratique-configurable.js');
        // seule mention tolérée : le commentaire d'ablation
        const occCode = (configurable.match(/pan_par_objectif/g) || [])
            .length - (configurable.match(/\/\/.*pan_par_objectif/g) || []).length;
        expect(occCode).toBe(0);
    });
});

describe('#396 · normalisation lecture seule des configs legacy', () => {
    it('une config stockée en pan_par_objectif est résolue en conversion_niveaux, SANS écriture', () => {
        const store = {};
        const db = {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async () => null, set: async () => {}
        };
        const win = chargerScript('js/pratiques/pratique-registre.js', { db, cle: (k) => k });

        const legacy = {
            id: 'legacy-obj', nom: 'Par objectifs legacy', type: 'standards',
            calcul_note: { methode: 'pan_par_objectif', nombre_artefacts: 3 },
            echelle: { type: 'niveaux', niveaux: [{ code: 'M', valeur_pourcentage: 80 }] }
        };
        const config = win.construireConfigComplete(legacy);

        expect(config.calcul_note.methode).toBe('conversion_niveaux'); // normalisé
        expect(config.calcul_note.nombre_artefacts).toBe(3);           // reste préservé
        expect(legacy.calcul_note.methode).toBe('pan_par_objectif');   // source JAMAIS mutée
        expect(Object.keys(store)).toEqual([]);                        // aucune écriture
    });

    it('une config saine passe inchangée (pas de normalisation parasite)', () => {
        const win = chargerScript('js/pratiques/pratique-registre.js', {
            db: { getSync: (_k, d) => (d !== undefined ? d : null), setSync: () => {}, get: async () => null, set: async () => {} },
            cle: (k) => k
        });
        const config = win.construireConfigComplete({
            id: 'som-ok', nom: 'SOM', type: 'sommative',
            calcul_note: { methode: 'moyenne_ponderee' }
        });
        expect(config.calcul_note.methode).toBe('moyenne_ponderee');
    });
});
