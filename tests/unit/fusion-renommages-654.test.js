import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #654 (26 sept. 2026) — `fusionnerParIdentite` REND SES RENOMMAGES.
//
// Un entrant en conflit (même id, contenu différent) reçoit un id neuf. Jusqu'ici, cet id
// neuf n'était retenu nulle part : rien ne pouvait rebrancher ce qui désignait l'ancien
// (une production vers sa cartouche). Les trois chemins d'import qui s'en servent sont
// rejoués au navigateur dans `integration/import-cartouche-renommee-654.spec.js`.

let w;
let n;
// `genererIdUnique` vient d'un autre script de la page : stub déterministe.
beforeEach(() => { n = 0; w = chargerScript('js/import-export.js', { genererIdUnique: (p) => p + 'NEUF_' + (++n) }); });

const LOCALE = { id: 'CART1', grilleId: 'G1', nom: 'Locale' };

describe('#654 · fusionnerParIdentite · renommages', () => {
    it('un conflit réel rend ancienId → id neuf, et l\'id neuf est bien celui écrit', () => {
        const r = w.fusionnerParIdentite([LOCALE], [{ id: 'CART1', grilleId: 'G1', nom: 'Arrivante' }], 'cartouches');
        expect(r.conflits).toBe(1);
        const neuf = r.renommages.CART1;
        expect(neuf).toBeTruthy();
        expect(neuf).not.toBe('CART1');
        expect(r.liste.find(c => c.id === neuf).nom).toBe('Arrivante');
        expect(r.liste.find(c => c.id === 'CART1').nom).toBe('Locale');
    });

    it('un entrant identique ou nouveau ne produit AUCUN renommage', () => {
        const r = w.fusionnerParIdentite([LOCALE], [{ ...LOCALE }, { id: 'CART2', grilleId: 'G1', nom: 'Neuve' }], 'cartouches');
        expect(r.ignores).toBe(1);
        expect(r.ajoutes).toBe(1);
        expect(r.renommages).toEqual({});
    });
});
