import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #326 D-5 — moteur d'hygiène de l'exploration (PUR) : tri / filtre / péremption.
// SPEC §9 : signaler les maquettes dormantes (jamais détruire), trier/filtrer.

const win = chargerScript('js/pratiques/pratiques-exploration.js');
const { trierMaquettes, filtrerMaquettes, maquetteDormante } = win.ExplorationPratiques;

const essai = (nom, type, date) => ({
    id: 'e-' + nom, nom, configuration: { type },
    inspireDe: { sourceId: 's', date }
});

describe('#326 D-5 · trierMaquettes (pur, ne mute pas l\'entrée)', () => {
    it('par nom (ordre alphabétique)', () => {
        const src = [essai('Charlie', 'standards'), essai('alpha', 'standards'), essai('Bravo', 'standards')];
        const out = trierMaquettes(src, 'nom');
        expect(out.map(p => p.nom)).toEqual(['alpha', 'Bravo', 'Charlie']);
        expect(src.map(p => p.nom)).toEqual(['Charlie', 'alpha', 'Bravo']); // entrée intacte
    });

    it('par famille (type stocké)', () => {
        const src = [essai('x', 'specifications'), essai('y', 'denotation'), essai('z', 'standards')];
        expect(trierMaquettes(src, 'famille').map(p => p.configuration.type))
            .toEqual(['denotation', 'specifications', 'standards']);
    });

    it('par date (plus récent d\'abord ; sans date en dernier)', () => {
        const src = [
            essai('vieux', 'standards', '2026-01-01'),
            essai('sansdate', 'standards', null),
            essai('recent', 'standards', '2026-06-10')
        ];
        expect(trierMaquettes(src, 'date').map(p => p.nom)).toEqual(['recent', 'vieux', 'sansdate']);
    });

    it('entrée non-tableau → []', () => {
        expect(trierMaquettes(null, 'nom')).toEqual([]);
    });
});

describe('#326 D-5 · filtrerMaquettes (pur)', () => {
    const src = [
        essai('Portfolio strict', 'standards'),
        essai('Spec bundles', 'specifications'),
        essai('Portfolio souple', 'standards')
    ];
    it('par texte sur le nom (insensible casse)', () => {
        expect(filtrerMaquettes(src, { texte: 'portfolio' }).map(p => p.nom))
            .toEqual(['Portfolio strict', 'Portfolio souple']);
    });
    it('par famille', () => {
        expect(filtrerMaquettes(src, { famille: 'specifications' }).map(p => p.nom)).toEqual(['Spec bundles']);
    });
    it('texte + famille combinés', () => {
        expect(filtrerMaquettes(src, { texte: 'souple', famille: 'standards' }).map(p => p.nom)).toEqual(['Portfolio souple']);
    });
    it('aucun critère → tout', () => {
        expect(filtrerMaquettes(src, {})).toHaveLength(3);
    });
});

describe('#326 D-5 · maquetteDormante (péremption douce — signale, ne détruit pas)', () => {
    const maintenant = new Date('2026-06-16T00:00:00Z').getTime();
    it('dormant si plus vieux que le seuil', () => {
        expect(maquetteDormante(essai('x', 'standards', '2026-01-01'), { maintenant, seuilJours: 30 })).toBe(true);
    });
    it('pas dormant si récent', () => {
        expect(maquetteDormante(essai('x', 'standards', '2026-06-10'), { maintenant, seuilJours: 30 })).toBe(false);
    });
    it('sans date → jamais signalé (aucun faux positif)', () => {
        expect(maquetteDormante(essai('x', 'standards', null), { maintenant })).toBe(false);
    });
    it('date invalide → jamais signalé', () => {
        expect(maquetteDormante({ inspireDe: { date: 'pas-une-date' } }, { maintenant })).toBe(false);
    });
    it('seuil par défaut = 30 jours', () => {
        expect(maquetteDormante(essai('x', 'standards', '2026-05-01'), { maintenant })).toBe(true);
    });
});
