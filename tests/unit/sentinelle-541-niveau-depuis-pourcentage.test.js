import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #541, RÉVISÉE LE 30 OCT. 2026 — un pourcentage et un seuil ne se comparent pas sans
// conversion.
//
// LE DÉFAUT D'ORIGINE (26 août 2026). `obtenirNiveauIDMEDepuisPourcentage` comparait un pourcentage
// (0-100) à des seuils 0-1 : tout score au-dessus de 1 % était « Étendu », et le dépistage répondait
// « tout va bien » sans un message. La fonction est retirée le 30 oct. 2026 avec les seuils qu'elle
// lisait : c'est l'échelle de l'enseignant qui situe un pourcentage. La LEÇON reste, et elle a deux
// lieux : `situerPourcentageDansEchelle` (pourcentage ⟷ plages 0-100) et `bornesDepistage`, le seul
// endroit où un repère 0-100 devient une proportion 0-1 pour le dépistage.

const ECHELLE = { id: 'E', niveaux: [
    { code: 'I', min: 0, max: 64 }, { code: 'D', min: 65, max: 74 }, { code: 'M', min: 75, max: 84 }, { code: 'E', min: 85, max: 100 }
], seuilSuffisance: 'D', seuilMaitrise: 'M' };

let win;

beforeAll(() => {
    const db = { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} };
    const stubs = {
        db, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (k) => (k === 'evaluationsSauvegardees' ? [{ echelleId: 'E', noteFinale: 70, verrouillee: true }] : []),
        obtenirPreference: () => null, obtenirEtudiantsCoursActif: () => [],
        designerPratiqueActive: () => ({ etat: 'ok', famille: 'standards' })
    };
    win = chargerScript('js/profil-etudiant-helpers.js', stubs);
    chargerScript('js/interpretation-config.js', stubs, win);
    win.evaluationEntreDansLaNote = () => true;
    win.obtenirEchelleResolue = () => ECHELLE;
    chargerScript('js/contexte-qualification.js', { ...stubs, obtenirSeuil: win.obtenirSeuil }, win);
});

describe('#541 · un pourcentage se situe sur des plages 0-100', () => {
    it('un critère à 12 % n\'est PAS « Étendu » : le cas qui rendait le dépistage aveugle', () => {
        expect(win.situerPourcentageDansEchelle(12, ECHELLE).code).toBe('I');
    });

    it('chaque niveau est atteignable, dans sa plage', () => {
        expect([0, 55, 70, 80, 95].map((p) => win.situerPourcentageDansEchelle(p, ECHELLE).code)).toEqual(['I', 'I', 'D', 'M', 'E']);
    });

    it('le contrat d\'ENTRÉE est 0-100 : un score 0-1 n\'est pas deviné', () => {
        // 0.8 est LU comme 0,8 %. Si un appelant passe un jour du 0-1, c'est l'appelant qu'on corrige.
        expect(win.situerPourcentageDansEchelle(0.8, ECHELLE).code).toBe('I');
    });
});

describe('#541 · la conversion entre repères 0-100 et dépistage 0-1 a un seul lieu', () => {
    it('`bornesDepistage` rend des proportions, `reperesPerformance` des pourcentages', () => {
        const r = win.reperesPerformance();
        expect([r.suffisance, r.maitrise, r.audela]).toEqual([65, 75, 85]);
        expect(win.bornesDepistage(r)).toEqual({ bas: 0.65, maitrise: 0.75 });
    });

    it('`zonePerformance` compare des pourcentages à des pourcentages', () => {
        const r = win.reperesPerformance();
        expect([12, 65, 75, 85].map((p) => win.zonePerformance(p, r))).toEqual(['bas', 'signale', 'acquis', 'audela']);
    });
});
