import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #935 (15 oct. 2026) — LE SEUIL D'ACCEPTABILITÉ PAR DÉFAUT D'UNE PRATIQUE PAR SPÉCIFICATIONS.
//
// Décision de Grégoire (13 h 01) : quand une pratique par spécifications ne porte aucun seuil, le défaut est
// 100 % partout (une copie est satisfaisante quand toutes ses spécifications sont respectées). Avant : 75 à
// l'adoption et au formulaire, 100 à l'assistant, 60 au moteur (`typeTravail.seuilAcceptable || 60`), qui
// lisait aussi un seuil écrit à 0 comme 60. Les pratiques existantes gardent le seuil qu'elles portent :
// mesuré le 15 oct., aucune pratique connue (démo, gabarit « Modèle simple ») n'est sans seuil.

function moteur() {
    const win = {
        addEventListener() {}, removeEventListener() {},
        evaluationEntreDansLaNote: () => true,
        evaluationNonRemise: () => false
    };
    chargerScript('js/pratiques/pratique-pan-specifications.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null) }, cle: (k) => k, obtenirDonneesSelonMode: () => []
    }, win);
    return new win.PratiquePanSpecifications();
}

const copie = (note) => ({ id: 'E', etudiantDA: '111', productionId: 'P', noteFinale: note, verrouillee: true });

describe('#935 — le moteur des spécifications : 100 % sans seuil, et un 0 écrit reste 0', () => {

    it('SANS SEUIL : 99 n\'est pas satisfaisant, 100 l\'est (avant : 60 suffisait)', () => {
        const m = moteur();
        expect(m._estTravailAcceptable(copie(99), { id: 't', nom: 'Projet' })).toBe(false);
        expect(m._estTravailAcceptable(copie(60), { id: 't', nom: 'Projet' })).toBe(false);
        expect(m._estTravailAcceptable(copie(100), { id: 't', nom: 'Projet' })).toBe(true);
    });

    it('SEUIL ÉCRIT À 0 : il reste 0 (avant : lu comme 60)', () => {
        expect(moteur()._estTravailAcceptable(copie(10), { id: 't', nom: 'Projet', seuilAcceptable: 0 })).toBe(true);
    });

    it('TÉMOIN — un seuil porté (70) décide, défaut ou pas', () => {
        const m = moteur();
        expect(m._estTravailAcceptable(copie(69), { id: 't', nom: 'Projet', seuilAcceptable: 70 })).toBe(false);
        expect(m._estTravailAcceptable(copie(70), { id: 't', nom: 'Projet', seuilAcceptable: 70 })).toBe(true);
    });
});
