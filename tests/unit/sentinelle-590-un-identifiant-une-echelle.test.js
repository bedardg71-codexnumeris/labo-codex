import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #590 — UN MÊME IDENTIFIANT D'ÉCHELLE RÉSOUT PAREIL, ET RIEN N'EST CODÉ EN DUR.
//
// Option A de Grégoire, 28 août 2026 : « Rien codé en dur ! ». Deux gestes, remesurés le
// 11 oct. 2026 sur main :
//   1. `resoudreModeleParId` (trimestres.js) ne comparait que `m.id` ; `obtenirEchelleResolue`
//      (profil-etudiant-calculs.js) lisait aussi `idOriginal`. Une échelle importée — id neuf,
//      ancien gardé dans `idOriginal` — se trouvait d'un côté et pas de l'autre.
//   2. Quand l'échelle d'une pratique ne se résolvait pas, `construireConfigComplete` posait
//      une IDME 50/65/80/95 inventée (couvert par le banc d'audit E6, sur le vrai moteur).
//
// ⚠ Les GRILLES n'apprennent pas `idOriginal` : des évaluations d'H2026 pointent des grilles
// absentes, et les rattacher changerait des notes déjà remises (cas D ci-dessous).
// ⚠ Le repli au POOL n'est PAS ajouté à `obtenirEchelleResolue` : `echellesComparables` lit une
// échelle introuvable comme une absence (ligne « Progrès » du PDF élève). Inscrit, pas fait.
//
// Modules RÉELS : trimestres.js ; pratique-configurable.js et pratique-registre.js.

function dbDepuisStore(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; }
    };
}

// a2026 ACTIF, h2026 clos. Les échelles portent des niveaux distincts pour savoir laquelle répond.
function store() {
    return {
        trimestres: [
            { id: 'a2026', actif: true, archive: false },
            { id: 'h2026', actif: false, archive: true }
        ],
        a2026_echellesTemplates: [
            { id: 'E_COPIE', idOriginal: 'E_ANCIEN', nom: 'copie importée (actif)' },
            { id: 'E_EXACT', nom: 'id exact (actif)' },
            { id: 'E_PIEGE', idOriginal: 'E_EXACT', nom: 'porte l\'id exact d\'une autre en idOriginal' }
        ],
        h2026_echellesTemplates: [
            { id: 'E_ANCIEN', nom: 'l\'ancienne, au pool' },
            { id: 'E_POOL_COPIE', idOriginal: 'E_POOL_ANCIEN', nom: 'copie au pool' }
        ],
        a2026_grillesTemplates: [{ id: 'G_COPIE', idOriginal: 'G_ANCIEN', nom: 'grille copiée' }]
    };
}

const charger = () => chargerScript('js/trimestres.js', { db: dbDepuisStore(store()) });

describe('#590 · resoudreModeleParId reconnaît l\'ancien identifiant d\'une échelle', () => {
    it('A · un ancien id (idOriginal) d\'une échelle du trimestre actif se résout vers sa copie', () => {
        // Avant : null (seul `m.id` était comparé) ; au pool, E_ANCIEN aurait même répondu
        // par l'ancienne, d'un autre trimestre, au lieu de la copie vivante.
        expect(charger().resoudreModeleParId('echelle', 'E_ANCIEN')?.nom).toBe('copie importée (actif)');
    });

    it('B · l\'id exact l\'emporte sur un idOriginal homonyme', () => {
        expect(charger().resoudreModeleParId('echelle', 'E_EXACT')?.nom).toBe('id exact (actif)');
    });

    it('C · au pool aussi : un ancien id d\'un autre trimestre se résout', () => {
        expect(charger().resoudreModeleParId('echelle', 'E_POOL_ANCIEN')?.nom).toBe('copie au pool');
    });

    it('D · une GRILLE ne se résout pas par idOriginal (des notes déjà remises en dépendent)', () => {
        const win = charger();
        expect(win.resoudreModeleParId('grille', 'G_ANCIEN')).toBeNull();
        expect(win.resoudreModeleParId('grille', 'G_COPIE')?.nom).toBe('grille copiée');
    });
});

describe('#590 · construireConfigComplete n\'invente aucun niveau', () => {
    function registre(pratiques) {
        const win = { PratiqueManager: {} };
        const globaux = {
            db: { getSync: (k, d) => (String(k).indexOf('pratiquesConfigurables') !== -1 ? JSON.parse(JSON.stringify(pratiques)) : (d !== undefined ? d : null)),
                get: async () => null, set: async () => {}, setSync() {} },
            cle: (k) => 'test_' + k,
            resoudreModeleParId: () => null
        };
        chargerScript('js/pratiques/pratique-configurable.js', globaux, win);
        chargerScript('js/pratiques/pratique-registre.js', Object.assign({ PratiqueConfigurable: win.PratiqueConfigurable }, globaux), win);
        return win;
    }

    it('E · échelle introuvable : niveaux vides, marquée introuvable, et la pratique se charge', () => {
        const avert = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const erreurs = vi.spyOn(console, 'error').mockImplementation(() => {});
        const win = registre([{ id: 'std', nom: 'STD', type: 'standards', configuration: { echelleId: 'DISPARUE' } }]);
        const config = win.construireConfigComplete({ id: 'std', nom: 'STD', type: 'standards', configuration: { echelleId: 'DISPARUE' } });
        expect(config.echelle).toEqual({ type: 'niveaux', echelle_id: 'DISPARUE', introuvable: true, niveaux: [] });
        expect(win.obtenirPratiqueParId('std'), 'une échelle vide ne doit pas rendre la pratique introuvable').not.toBeNull();
        expect(erreurs).not.toHaveBeenCalled();
        avert.mockRestore(); erreurs.mockRestore();
    });
});
