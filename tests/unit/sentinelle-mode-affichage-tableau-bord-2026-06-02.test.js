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

describe('#308 · determinerModeAffichageTableauBord suit la pratique active', () => {
    let win;

    beforeEach(() => {
        // normaliserIdPratique injecté en stub identité ; PRATIQUE_DEFAUT = 'standards'.
        win = chargerScript('js/tableau-bord-apercu.js', {
            normaliserIdPratique: (id) => id
        });
        win.PRATIQUE_DEFAUT = 'standards';
    });

    it('expose la fonction sur window', () => {
        expect(typeof win.determinerModeAffichageTableauBord).toBe('function');
    });

    it('groupe sommatif sans mode posé → SOM (et pas PAN)', () => {
        const r = win.determinerModeAffichageTableauBord({ pratique: 'sommative' });
        expect(r).toEqual({ afficherSom: true, afficherPan: false });
    });

    it('groupe PAN (standards) sans mode posé → PAN', () => {
        const r = win.determinerModeAffichageTableauBord({ pratique: 'standards' });
        expect(r).toEqual({ afficherSom: false, afficherPan: true });
    });

    it('aucune pratique posée → défaut PRATIQUE_DEFAUT (standards) → PAN', () => {
        const r = win.determinerModeAffichageTableauBord({});
        expect(r).toEqual({ afficherSom: false, afficherPan: true });
    });

    it('Session C : deux clés true (ancien comparatif) → suit quand même la pratique active', () => {
        // Le mode comparatif est retiré : determinerMode ne renvoie JAMAIS deux couches.
        const r = win.determinerModeAffichageTableauBord({
            pratique: 'sommative',
            affichageTableauBord: { afficherSommatif: true, afficherAlternatif: true }
        });
        expect(r).toEqual({ afficherSom: true, afficherPan: false });
    });

    it('Session C : un override explicite n\'est plus honoré (suit la pratique active)', () => {
        const r = win.determinerModeAffichageTableauBord({
            pratique: 'sommative',
            affichageTableauBord: { afficherAlternatif: true }
        });
        expect(r).toEqual({ afficherSom: true, afficherPan: false });
    });

    it('régression : ne force PLUS PAN sur un groupe sommatif (cause du P à 0 %)', () => {
        const r = win.determinerModeAffichageTableauBord({ pratique: 'sommative' });
        expect(r.afficherPan).toBe(false);
    });
});
