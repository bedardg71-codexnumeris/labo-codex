/**
 * #1075, POINT 9 — UN PAQUET DE PRATIQUE EMPORTE SON ÉCHELLE (22 oct. 2026).
 *
 * Constat (audit 4.195) : `rassemblerDependances` (partage-format.js) n'ajoutait rien pour une pratique,
 * sur la foi d'une échelle « embarquée ». Une pratique de l'assistant ne porte pourtant que la référence
 * `configuration.echelleId` : le `.lcz` partait sans l'échelle, et la pratique importée ne la trouvait pas.
 * Intention de Grégoire : « un paquet de pratique emporte son échelle ; à l'import, la pratique suit cette
 * échelle, même si celle-ci change d'identifiant ». La seconde moitié existait (`rebrancherReferences`,
 * #627) ; ce banc tient la première, et le passage par la validation.
 *
 * Ce banc verrouille, sur les modules RÉELS du format :
 *   A — le paquet d'une pratique contient l'échelle qu'elle nomme, et la référence pratique → échelle ;
 *   B — ce paquet passe `validerPackage` (aucune référence orpheline) ;
 *   C — les lecteurs du namespace partagé lisent l'échelle partagée ;
 *   D — une pratique sans référence, ou dont l'échelle est introuvable, ne change pas de paquet.
 *
 * Break-test (22 oct.) : sans la branche `type === 'pratique'`, A et C rougissent (B reste vert : un paquet
 * sans l'échelle ni sa référence est valide, c'est bien le défaut — il part amputé sans rien dire).
 *
 * Données FICTIVES.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const ECHELLE = { id: 'ECH_FICT', nom: 'Échelle fictive', niveaux: [{ code: 'A', nom: 'Atteint', min: 60, max: 100 }, { code: 'N', nom: 'Non atteint', min: 0, max: 59 }] };
const PRATIQUE = { id: 'PRAT_FICT', nom: 'Pratique fictive', type: 'standards', configuration: { echelleId: 'ECH_FICT', famille: 'STD' } };

let win;
beforeAll(() => {
    const store = { h2032_echellesTemplates: [ECHELLE] };
    const db = { getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)) };
    win = chargerScript('js/partage-schemas.js', { db });
    win.cle = (k) => 'h2032_' + k;
    chargerScript('js/partage-validation.js', { db }, win);
    chargerScript('js/partage-format.js', { db }, win);
});

const paquet = (pratique, options = {}) => win.partageFormat.construirePackage(pratique, { type: 'pratique', identiteAuteur: 'Auteur fictif', ...options });

describe('#1075, point 9 — le paquet d\'une pratique emporte son échelle', () => {
    it('A — l\'échelle nommée est dans le paquet, avec sa référence', () => {
        const pkg = paquet(PRATIQUE);
        expect(pkg.entites.echelles.map((e) => e.id)).toEqual(['ECH_FICT']);
        expect(pkg.entites.echelles[0].niveaux).toHaveLength(2);
        expect(pkg.references).toContainEqual({ depuis: { type: 'pratique', id: 'PRAT_FICT' }, vers: { type: 'echelle', id: 'ECH_FICT' }, nature: 'utilise' });
    });

    it('B — le paquet passe la validation', () => {
        const r = win.partageValidation.validerPackage(JSON.parse(JSON.stringify(paquet(PRATIQUE))));
        expect(r.erreurs || []).toEqual([]);
        expect(r.valide).toBe(true);
    });

    it('C — depuis le namespace partagé, l\'échelle partagée part aussi', () => {
        const lecteurs = { cartouchesDeGrille: () => [], grilleParId: () => null, echelleParId: (id) => (id === 'ECH_PARTAGEE' ? { ...ECHELLE, id: 'ECH_PARTAGEE' } : null) };
        const pkg = paquet({ ...PRATIQUE, configuration: { echelleId: 'ECH_PARTAGEE' } }, { lecteurs });
        expect(pkg.entites.echelles.map((e) => e.id)).toEqual(['ECH_PARTAGEE']);
    });

    it('D — sans référence, ou échelle introuvable : aucune échelle, aucune référence', () => {
        for (const p of [{ ...PRATIQUE, configuration: {} }, { ...PRATIQUE, configuration: { echelleId: 'FANTOME' } }]) {
            const pkg = paquet(p);
            expect(pkg.entites.echelles || []).toEqual([]);
            expect(pkg.references).toEqual([]);
        }
    });
});
