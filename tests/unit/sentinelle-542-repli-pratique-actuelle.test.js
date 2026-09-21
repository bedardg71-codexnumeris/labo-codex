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

// ↻ LOT N1a (21 sept. 2026, #710 / #719) — LE REPLI DE #542 N'EXISTE PLUS, ET C'EST VOULU.
// Décision de Grégoire : sans pratique assignée, aucune note. `obtenirPratiqueActuelle` ne fabrique
// plus d'instance : elle part de la DÉSIGNATION de la pratique active (`designerPratiqueActive`,
// pratique-registre.js) et rend null quand rien n'est assigné ou que l'id ne mène à rien.
// Ce que #542 protégeait reste tenu : elle ne LÈVE jamais, quel que soit l'état du registre.
const designation = (etat, famille) => () => ({ etat, idBrut: etat === 'aucune' ? null : 'p1', id: etat === 'ok' ? 'p1' : null, donnees: etat === 'ok' ? {} : null, famille: famille || null });

describe('#542 ↻ N1a · obtenirPratiqueActuelle : aucun repli, et jamais d\'exception', () => {

    it('1. rien n\'est assigné → null (avant : une PratiquePANStandards fabriquée)', () => {
        const win = charger({ designerPratiqueActive: designation('aucune'), obtenirPratiqueParId: () => { throw new Error('le registre ne doit pas être interrogé'); } });
        expect(win.obtenirPratiqueActuelle()).toBeNull();
    });

    it('2. un id assigné qui ne mène à rien → null, pas de sommative ni de standards de remplacement', () => {
        const win = charger({ designerPratiqueActive: designation('introuvable'), obtenirPratiqueParId: () => new PratiqueSommativeFactice() });
        expect(win.obtenirPratiqueActuelle()).toBeNull();
    });

    it('3. une Standards assignée → l\'instance du registre de SA famille (elle porte #575 et le P historique)', () => {
        const duRegistre = { obtenirId: () => 'venu-du-registre' };
        const demandes = [];
        const win = charger({ designerPratiqueActive: designation('ok', 'standards'), obtenirPratiqueParId: (id) => { demandes.push(id); return duRegistre; } });
        expect(win.obtenirPratiqueActuelle()).toBe(duRegistre);
        expect(demandes).toEqual(['standards']);
    });

    it('4. une dénotation assignée → l\'instance de la pratique ASSIGNÉE, jamais une Standards fabriquée (#719)', () => {
        const assignee = { obtenirId: () => 'den-banc' };
        const win = charger({ designerPratiqueActive: designation('ok', 'denotation'), obtenirPratiqueParId: () => new PratiquePANStandardsFactice(),
            resoudrePratiqueActive: () => ({ etat: 'ok', pratique: assignee }) });
        expect(win.obtenirPratiqueActuelle()).toBe(assignee);
    });

    it('5. registre absent du tout (aucune fonction définie) : null, sans lever', () => {
        const win = charger({});
        let leve = null, rendu;
        try { rendu = win.obtenirPratiqueActuelle(); } catch (e) { leve = e; }
        expect(leve, leve ? `${leve.constructor.name} : ${leve.message}` : '').toBeNull();
        expect(rendu).toBeNull();
    });
});
