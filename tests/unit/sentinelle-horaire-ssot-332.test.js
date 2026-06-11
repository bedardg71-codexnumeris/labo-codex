import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #332 — obtenirSeancesHoraire : la SSOT `groupesCours[].horaireId` fait foi.
//
// Bug d'origine (constat 2, 10 juin 2026) : la fonction lisait d'abord la
// COPIE `groupeCoursActif.horaireId` (pointeur dénormalisé) et la SSOT
// seulement en fallback. Toute désync copie/SSOT servait silencieusement le
// mauvais horaire — cas réel : cache seancesCompletes du GC 00008 régénéré
// « Lun-Jeu » malgré l'intention Mar-Jeu. Ces tests reproduisent la désync et
// verrouillent la priorité inversée (cf. feedback-fix-perdu-refactoring-
// extraction : tout fix défensif critique doit être verrouillé par test).

const SEANCES_COPIE = [{ jour: 'lundi' }, { jour: 'jeudi' }];   // l'horaire périmé
const SEANCES_SSOT = [{ jour: 'mardi' }, { jour: 'jeudi' }];    // l'horaire voulu

let store;
const db = {
    getSync: (k, def) => (k in store ? store[k] : (def !== undefined ? def : null)),
    setSync: (k, v) => { store[k] = v; }
};
const cle = (k) => 't1_' + k;

const win = chargerScript('js/horaire.js', { db, cle });

beforeEach(() => {
    store = {
        t1_horaires: [
            { id: 'H_COPIE', seances: SEANCES_COPIE },
            { id: 'H_SSOT', seances: SEANCES_SSOT }
        ]
    };
});

describe('#332 · obtenirSeancesHoraire — priorité SSOT sur la copie pointeur', () => {

    it('désync copie/SSOT → la SSOT gagne (le bug du GC 00008)', () => {
        store['groupeCoursActif'] = { id: 'GC1', horaireId: 'H_COPIE' };   // copie périmée
        store['t1_groupesCours'] = [{ id: 'GC1', horaireId: 'H_SSOT' }];  // SSOT à jour
        expect(win.obtenirSeancesHoraire('C1')).toEqual(SEANCES_SSOT);
    });

    it('copie et SSOT alignées → comportement inchangé', () => {
        store['groupeCoursActif'] = { id: 'GC1', horaireId: 'H_SSOT' };
        store['t1_groupesCours'] = [{ id: 'GC1', horaireId: 'H_SSOT' }];
        expect(win.obtenirSeancesHoraire('C1')).toEqual(SEANCES_SSOT);
    });

    it('GC introuvable dans la SSOT → la copie sert de dernier recours', () => {
        store['groupeCoursActif'] = { id: 'GC_FANTOME', horaireId: 'H_COPIE' };
        store['t1_groupesCours'] = [{ id: 'GC1', horaireId: 'H_SSOT' }];
        expect(win.obtenirSeancesHoraire('C1')).toEqual(SEANCES_COPIE);
    });

    it('SSOT dit « pas d\'horaire » → la copie ne la contredit pas (chaîne de fallback)', () => {
        store['groupeCoursActif'] = { id: 'GC1', horaireId: 'H_COPIE' };
        store['t1_groupesCours'] = [{ id: 'GC1' }];                       // sans horaireId
        store['t1_seancesHoraire'] = [{ jour: 'vendredi' }];              // fallback 4
        expect(win.obtenirSeancesHoraire('C1')).toEqual([{ jour: 'vendredi' }]);
    });

    it('sans groupe-cours actif → chaîne de fallback historique intacte', () => {
        store['t1_horaireHebdo'] = [{ jour: 'mercredi' }];                // fallback 3
        expect(win.obtenirSeancesHoraire('C1')).toEqual([{ jour: 'mercredi' }]);
    });

});
