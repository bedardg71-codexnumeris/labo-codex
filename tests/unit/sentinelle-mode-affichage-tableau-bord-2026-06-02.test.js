import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Bug terrain #308 (Grégoire, 2 juin 2026, 601-101 H2026) — la section
// « Observation globale des indices d'engagement » affichait « Performance (P)
// — alternatif » à 0 % pour tout le groupe, alors que A et C calculaient bien.
//
// Cause : afficherMetriquesGlobales FORÇAIT PAN par défaut quand les clés
// afficherSommatif/afficherAlternatif étaient absentes (cas normal depuis le
// retrait du mode comparatif) → la barre P lisait `alternatif.performance`,
// non calculable sur un groupe sommatif → 0 %.
//
// Fix : la logique est extraite dans determinerModeAffichageTableauBord(config)
// qui SUIT la pratique active du groupe (sommative → SOM, sinon → PAN) au lieu
// de forcer PAN. Cette sentinelle verrouille ce comportement.
//
// #328 L2-b2 (11 juin 2026) : le type de la pratique active ne vient plus du
// miroir config.pratique mais de la SSOT via obtenirTypePratiqueActive —
// le stub du helper remplace les fixtures de config.

describe('#308 · determinerModeAffichageTableauBord suit la pratique active', () => {
    let win;

    function charger(typeActif) {
        win = chargerScript('js/tableau-bord-apercu.js', {
            normaliserIdPratique: (id) => id,
            obtenirTypePratiqueActive: () => typeActif
        });
        win.PRATIQUE_DEFAUT = 'standards';
    }

    it('expose la fonction sur window', () => {
        charger('sommative');
        expect(typeof win.determinerModeAffichageTableauBord).toBe('function');
    });

    it('groupe sommatif → SOM (et pas PAN)', () => {
        charger('sommative');
        const r = win.determinerModeAffichageTableauBord({});
        expect(r).toEqual({ afficherSom: true, afficherPan: false });
    });

    it('groupe PAN (standards) → PAN', () => {
        charger('standards');
        const r = win.determinerModeAffichageTableauBord({});
        expect(r).toEqual({ afficherSom: false, afficherPan: true });
    });

    it('aucune pratique résolue (null) → défaut PRATIQUE_DEFAUT (standards) → PAN', () => {
        charger(null);
        const r = win.determinerModeAffichageTableauBord({});
        expect(r).toEqual({ afficherSom: false, afficherPan: true });
    });

    it('L2-b2 : le miroir config.pratique n\'est PLUS lu — la SSOT prime', () => {
        charger('sommative');
        // Une config qui prétend « standards » via l'ancien miroir ne change rien.
        const r = win.determinerModeAffichageTableauBord({ pratique: 'standards' });
        expect(r).toEqual({ afficherSom: true, afficherPan: false });
    });

    it('Session C : deux clés true (ancien comparatif) → suit quand même la pratique active', () => {
        charger('sommative');
        const r = win.determinerModeAffichageTableauBord({
            affichageTableauBord: { afficherSommatif: true, afficherAlternatif: true }
        });
        expect(r).toEqual({ afficherSom: true, afficherPan: false });
    });

    it('Session C : un override explicite n\'est plus honoré (suit la pratique active)', () => {
        charger('sommative');
        const r = win.determinerModeAffichageTableauBord({
            affichageTableauBord: { afficherAlternatif: true }
        });
        expect(r).toEqual({ afficherSom: true, afficherPan: false });
    });

    it('régression : ne force PLUS PAN sur un groupe sommatif (cause du P à 0 %)', () => {
        charger('sommative');
        const r = win.determinerModeAffichageTableauBord({});
        expect(r.afficherPan).toBe(false);
    });
});
