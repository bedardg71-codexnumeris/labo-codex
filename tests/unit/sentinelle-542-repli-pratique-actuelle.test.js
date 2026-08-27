import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #542 lot 3 — LE REPLI DE `obtenirPratiqueActuelle` LEVAIT UN
// `ReferenceError`.
//
// LE DÉFAUT, MESURÉ AVANT D'ÊTRE CORRIGÉ (27 août 2026).
//
// Le repli instanciait `PratiquePANMaitrise` — une classe qui n'existe NULLE
// PART dans le dépôt. Elle s'appelle `PratiquePANStandards`
// (`js/pratiques/pratique-pan-standards.js:75`), et le nom fautif ne vivait qu'à
// deux endroits : cette ligne, et le JSDoc juste au-dessus. Aucun des deux
// n'était exécuté par un test.
//
// ⮕ CE N'EST PAS DU CODE MORT, et c'est ce qui rend le défaut sérieux.
// `obtenirPratiqueParId` rend `null` dans deux cas réels : la pratique
// configurable a été supprimée, ou sa construction a levé et le `catch` de
// `pratique-registre.js` l'a rattrapée. Le repli prend alors la main — et fait
// tomber TOUT le profil de l'élève, sur un nom mal écrit.
//
// ⮕ COMMENT IL A ÉTÉ TROUVÉ, parce que la méthode compte plus que la trouvaille :
// en écrivant la sentinelle du pas 3b, `new w.PratiquePANMaitrise()` a échoué.
// Le nom venait de `obtenirPratiqueActuelle`, que j'avais lu sans le voir. Un
// test qui instancie pour de vrai a vu ce que la lecture avait manqué.
//
// ⮕ POURQUOI CE TEST NE CHERCHE PAS LE NOM DANS LE SOURCE : le commentaire du
// correctif CITE le nom fautif, comme trace. Une sentinelle qui grepperait
// « PratiquePANMaitrise » rougirait sur sa propre documentation. C'est le
// COMPORTEMENT qu'il faut tenir : le repli s'instancie sans lever.

class PratiquePANStandardsFactice { obtenirId() { return 'standards'; } }
class PratiqueSommativeFactice { obtenirId() { return 'sommative'; } }

function charger(surcharges) {
    return chargerScript('js/profil-etudiant-helpers.js', {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null,
        obtenirEtudiantsCoursActif: () => [],
        afficherNotificationCopiee: () => {}, afficherSection: () => {}, afficherSousSection: () => {},
        calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0, M: 0, E: 0 }),
        obtenirSeuil: () => 0.70, chargerSeuilsInterpretation: () => ({}),
        estEtudiantExclu: () => false, filtrerEtudiantsParMode: (a) => a,
        estModeeLectureSeule: () => false, genererSeancesCompletes: () => {},
        calculerEtSauvegarderIndicesAssiduite: () => {}, calculerEtStockerIndicesCP: () => {},
        PratiquePANStandards: PratiquePANStandardsFactice,
        PratiqueSommative: PratiqueSommativeFactice,
        ...surcharges
    });
}

describe('#542 · le repli de obtenirPratiqueActuelle ne lève pas', () => {

    it('1. LE CAS QUI PLANTAIT — le registre ne trouve rien, la pratique est « standards »', () => {
        // Reproduit exactement le chemin du `catch` de pratique-registre.js.
        const win = charger({
            obtenirPratiqueParId: () => null,
            obtenirTypePratiqueActive: () => 'standards'
        });
        let leve = null;
        let instance = null;
        try { instance = win.obtenirPratiqueActuelle(); } catch (e) { leve = e; }
        expect(leve, leve ? `${leve.constructor.name} : ${leve.message}` : '').toBeNull();
        expect(instance).toBeInstanceOf(PratiquePANStandardsFactice);
    });

    it('2. le repli sommatif fonctionnait déjà — il doit continuer', () => {
        const win = charger({
            obtenirPratiqueParId: () => null,
            obtenirTypePratiqueActive: () => 'sommative'
        });
        expect(win.obtenirPratiqueActuelle()).toBeInstanceOf(PratiqueSommativeFactice);
    });

    it('3. quand le registre RÉPOND, c\'est lui qui gagne — le repli n\'est pas pris', () => {
        const duRegistre = { obtenirId: () => 'venu-du-registre' };
        const win = charger({
            obtenirPratiqueParId: () => duRegistre,
            obtenirTypePratiqueActive: () => 'standards'
        });
        expect(win.obtenirPratiqueActuelle()).toBe(duRegistre);
    });

    it('4. registre absent du tout (fonction non définie) : le repli tient aussi', () => {
        const win = charger({
            obtenirPratiqueParId: undefined,
            obtenirTypePratiqueActive: () => 'standards'
        });
        let leve = null;
        try { win.obtenirPratiqueActuelle(); } catch (e) { leve = e; }
        expect(leve, leve ? `${leve.constructor.name} : ${leve.message}` : '').toBeNull();
    });
});
