import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #309 — fondation linguistique du chantier terminologie production/artefact.
// Le terme suit la pratique active : « artefact » (masculin) pour 'standards',
// « production » (féminin) sinon. Les mots d'accord (remis/remise, total/totaux/
// totales, aucun/aucune…) doivent suivre le genre ET le nombre, sinon on obtient
// « productions remis / totaux ». Cette sentinelle verrouille genreTermeProduction
// et accordTermeProduction (table interne), base du routage des call-sites.

describe('#309 · genre et accord du terme production/artefact', () => {
    let win;
    let pratiqueActive;

    beforeEach(() => {
        pratiqueActive = 'standards';
        const db = {
            getSync: (k, d) => (k === 'modalitesEvaluation'
                ? { pratique: pratiqueActive }
                : (d !== undefined ? d : null)),
            get: async () => null,
            set: async () => {},
            setSync: () => {}
        };
        win = chargerScript('js/profil-etudiant-helpers.js', {
            db,
            cle: (k) => k,
            normaliserIdPratique: (id) => id
        });
        win.PRATIQUE_DEFAUT = 'standards';
    });

    it('expose genreTermeProduction et accordTermeProduction', () => {
        expect(typeof win.genreTermeProduction).toBe('function');
        expect(typeof win.accordTermeProduction).toBe('function');
    });

    it('genre = masculin pour la pratique standards (artefact)', () => {
        pratiqueActive = 'standards';
        expect(win.genreTermeProduction()).toBe('m');
    });

    it('genre = féminin pour une pratique non-standards (production)', () => {
        pratiqueActive = 'sommative';
        expect(win.genreTermeProduction()).toBe('f');
        pratiqueActive = 'specifications';
        expect(win.genreTermeProduction()).toBe('f');
    });

    it('accord masculin (standards) : remis invariable, total→totaux, Aucun', () => {
        pratiqueActive = 'standards';
        expect(win.accordTermeProduction('remis', 1)).toBe('remis');
        expect(win.accordTermeProduction('remis', 3)).toBe('remis');
        expect(win.accordTermeProduction('total', 1)).toBe('total');
        expect(win.accordTermeProduction('total', 3)).toBe('totaux');
        expect(win.accordTermeProduction('retenu', 3)).toBe('retenus');
        expect(win.accordTermeProduction('aucun', 1, true)).toBe('Aucun');
    });

    it('accord féminin (production) : remise(s), totale(s), retenues, évaluée, Aucune', () => {
        pratiqueActive = 'sommative';
        expect(win.accordTermeProduction('remis', 1)).toBe('remise');
        expect(win.accordTermeProduction('remis', 3)).toBe('remises');
        expect(win.accordTermeProduction('total', 1)).toBe('totale');
        expect(win.accordTermeProduction('total', 3)).toBe('totales');
        expect(win.accordTermeProduction('retenu', 3)).toBe('retenues');
        expect(win.accordTermeProduction('evalue', 1)).toBe('évaluée');
        expect(win.accordTermeProduction('recevable', 3)).toBe('recevables');
        expect(win.accordTermeProduction('aucun', 1, true)).toBe('Aucune');
        expect(win.accordTermeProduction('tous', 2, true)).toBe('Toutes');
    });

    it('« tous » s\'accorde : Tous (m) / Toutes (f)', () => {
        pratiqueActive = 'standards';
        expect(win.accordTermeProduction('tous', 2, true)).toBe('Tous');
        pratiqueActive = 'sommative';
        expect(win.accordTermeProduction('tous', 2, true)).toBe('Toutes');
    });

    it('« dernier » s\'accorde : derniers (m) / dernières (f)', () => {
        pratiqueActive = 'standards';
        expect(win.accordTermeProduction('dernier', 3)).toBe('derniers');
        pratiqueActive = 'sommative';
        expect(win.accordTermeProduction('dernier', 1)).toBe('dernière');
        expect(win.accordTermeProduction('dernier', 3)).toBe('dernières');
    });

    it('mot-clé inconnu : renvoie le mot tel quel (pas de crash)', () => {
        expect(win.accordTermeProduction('inexistant', 1)).toBe('inexistant');
    });

    it('cohérence terme ↔ genre (même pratique résolue)', () => {
        pratiqueActive = 'standards';
        expect(win.obtenirTermeProduction('singulier')).toBe('artefact');
        expect(win.genreTermeProduction()).toBe('m');
        pratiqueActive = 'sommative';
        expect(win.obtenirTermeProduction('singulier')).toBe('production');
        expect(win.genreTermeProduction()).toBe('f');
    });
});
