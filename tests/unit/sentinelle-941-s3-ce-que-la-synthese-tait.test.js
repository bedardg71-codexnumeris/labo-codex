/**
 * Sentinelle — #941 LOT S3 (24 septembre 2026) : CE QUE LA SYNTHÈSE NE DOIT PAS DIRE
 * (décision D5 de Grégoire ; C2 et C5 tranchés par Cowork — `plans de travail/DECISIONS-2026-09-24-
 * parcours-sommatif.md`).
 *
 *   T.a `jetonsDeclares` : les jetons que la pratique DÉCLARE actifs, jamais les défauts du code ;
 *   T.b le bloc « Jetons utilisés » du PDF et la mention « Note provisoire » lisent cette règle ;
 *   T.c l'écran (copié par « Copier tout ») : pas de « Jetons utilisés » sans jetons déclarés, et
 *       « Présentement, il faut se concentrer sur : » ne s'écrit pas quand rien ne s'y range (C2) ;
 *   T.d le ruban du PDF ne pose pas d'étiquette sur une cellule vide (C5).
 *
 * Preuve de bout en bout : `tests/integration/audit-parcours-sommatif-2026-09-24.spec.js`.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (f) => readFileSync(path.join(racine, f), 'utf8');

/** Le module des jetons, sur une pratique active et des modalités données. */
function jetons({ pratique = null, modalites = null } = {}) {
    const store = {
        'test_pratiquesConfigurables': pratique ? [pratique] : [],
        'test_modalitesEvaluation': modalites
    };
    return chargerScript('js/evaluation-jetons.js', {
        db: { getSync: (k, d) => (k in store && store[k] !== null ? store[k] : (d !== undefined ? d : null)), setSync() {}, get: async () => null, set: async () => {} },
        cle: (k) => 'test_' + k,
        obtenirIdPratiqueActive: () => (pratique ? pratique.id : null)
    });
}
const SOMMATIVE_SANS_JETONS = { id: 'P_SOM', type: 'sommative', configuration: { nom: 'Sommative' } };
const AVEC_JETONS = (actif) => ({ id: 'P_STD', type: 'standards', configuration: { jetons: {
    actif, delai: { nombre: 1, dureeJours: 3 }, reprise: { nombre: 2 }, repriseCiblee: { actif: false } } } });

describe('#941 S3 · T.a — les jetons DÉCLARÉS, jamais les défauts', () => {
    it('une sommative sans bloc de jetons : aucun jeton — alors que obtenirConfigJetons rend les défauts actifs', () => {
        const w = jetons({ pratique: SOMMATIVE_SANS_JETONS });
        expect(w.jetonsDeclares()).toBe(null);
        expect(w.obtenirConfigJetons().actif).toBe(true);   // le défaut du code reste pour les gestes de l'enseignant·e
    });
    it('une pratique qui déclare des jetons actifs : ses jetons', () => {
        const d = jetons({ pratique: AVEC_JETONS(true) }).jetonsDeclares();
        expect(d && d.actif).toBe(true);
        expect(d.delai.nombre).toBe(1);
    });
    it('une pratique qui les déclare INACTIFS : aucun', () => {
        expect(jetons({ pratique: AVEC_JETONS(false) }).jetonsDeclares()).toBe(null);
    });
    it('aucune pratique : l\'ancien réglage explicite compte, le défaut non', () => {
        expect(jetons({}).jetonsDeclares()).toBe(null);
        const d = jetons({ modalites: { configurationJetons: { jetonsActif: true, nombreParEleve: 3 } } }).jetonsDeclares();
        expect(d && d.delai.nombre).toBe(3);
        expect(jetons({ modalites: { configurationJetons: { jetonsActif: false } } }).jetonsDeclares()).toBe(null);
    });
});

describe('#941 S3 · T.b / T.c — le PDF et l\'écran lisent la même règle', () => {
    it('PDF : « Jetons utilisés » et la mention de la note, par `jetonsDeclares`', () => {
        const data = source('js/synthese-retroaction-data.js');
        expect(data).toContain("config = (typeof jetonsDeclares === 'function') ? jetonsDeclares() : null;");
        expect(data).toContain("note.sansJetons = !(typeof jetonsDeclares === 'function' && jetonsDeclares());");
        expect(data).not.toMatch(/config = obtenirConfigJetons\(\)/);
        const rendu = source('js/synthese-retroaction-rendu.js');
        expect(rendu).toContain('const texteProvisoire = note.sansJetons');
        expect(rendu).not.toContain('const texteProvisoire = note.sommative');
    });
    it('écran : les jetons par `jetonsDeclares`, et le titre de « Présentement » seulement s\'il suit quelque chose', () => {
        const retro = source('js/evaluation-retroaction.js');
        expect(retro).toContain('var configJetons = jetonsDeclares();');
        expect(retro).not.toContain('var configJetons = obtenirConfigJetons();');
        expect(retro).toContain("if (presentement) html += '<h5>Présentement, il faut se concentrer sur :</h5>' + presentement;");
        expect(retro.match(/<h5>Présentement, il faut se concentrer sur :<\/h5>/g)).toHaveLength(1);
    });
});

describe('#941 S3 · T.d — le ruban : pas d\'étiquette sur une cellule vide (C5)', () => {
    it('le rendu filtre les cellules vides et ajuste ses colonnes', () => {
        const rendu = source('js/synthese-retroaction-rendu.js');
        expect(rendu).toContain('const pleines = cellules.filter(c => c.texte && c.texte.trim());');
        expect(rendu).toContain('grid-template-columns: repeat(${pleines.length}, 1fr)');
    });
});
