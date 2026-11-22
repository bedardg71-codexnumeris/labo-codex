// =======================================================================
// LE SIXIÈME PARCOURS, « METTRE TES DONNÉES À L'ABRI », « JE REGARDE » — 22 NOVEMBRE 2026 : LES MOTS, DANS LES DEUX SENS
// =======================================================================
// plans de travail/CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md, § 5 (la suite, 15 h, point 7). Ce banc lit
// la consigne (`_helpers/consigne-2026-11-22-parcours.js`) et le VRAI js/parcours-donnees.js, chargé dans un bac à sable,
// et exige, bulle par bulle, les mêmes titres, confirmations, explications et gestes principaux, dans le même ordre : ce
// que la consigne dit et que le code ne dit pas rougit, et l'inverse. Le « Nous faisons » a sa sentinelle (9 nov.).
// Break-test (22 nov.) : au rapport du lot (plans de travail/RAPPORT-2026-11-22-parcours-6-7-8-suite.md).
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { bullesDu, consigneDu } from './_helpers/consigne-2026-11-22-parcours.js';

function charger() {
    const enregistres = [];
    const win = { addEventListener() {}, removeEventListener() {}, Assistance: { enregistrer: (d) => enregistres.push(d) } };
    chargerScript('js/parcours-donnees.js', { db: { getSync: (k, d) => d } }, win);
    return { P: win.ParcoursDonnees, def: enregistres[0] };
}

const { P, def } = charger();
const consigne = bullesDu('5.');
const vuDuCode = (b, k) => ({ titre: b.titre, petit: k === 0 ? null : (b.confirme || null), lieu: null, lignes: b.lignes, puis: null });
const vuDeLaConsigne = (c, k) => ({ titre: c.titre, petit: k === 0 ? null : (c.petit || null), lieu: c.lieu || null, lignes: c.lignes, puis: c.puis });

describe('§ 5 · « Je regarde », la visite du menu « Codex », bulle par bulle', () => {
    it('cinq bulles, numérotées « n sur 5 », de part et d\'autre ; le « Nous faisons » garde ses quatre', () => {
        expect(consigne.map((b) => [b.rang, b.total])).toEqual(Array.from({ length: 5 }, (_, i) => [i + 1, 5]));
        expect(P.textesModele.bulles).toHaveLength(5);
        expect(P.etapesModele).toHaveLength(5);
        expect(def.totalModele).toBe(5);
        expect(def.total).toBe(4);
    });

    it.each([1, 2, 3, 4, 5])('bulle %i : mêmes mots, même ordre, dans les deux sens', (n) => {
        expect(vuDuCode(P.textesModele.bulles[n - 1], n - 1)).toEqual(vuDeLaConsigne(consigne[n - 1], n - 1));
    });

    it('l\'entrée, l\'objectif, l\'objectif atteint, la suite ; les titres des étapes', () => {
        expect(consigne[0].petit).toBe(`Parcours 6 · ${def.titre} · Je regarde`);
        expect([consigne[0].objectif, consigne[4].atteint]).toEqual([P.textesModele.objectif, P.textesModele.objectifAtteint]);
        expect([P.definitionModele.objectif, P.definitionModele.objectifAtteint]).toEqual([P.textesModele.objectif, P.textesModele.objectifAtteint]);
        expect(consigne[4].suite).toBe('Suite suggérée : le parcours 7, « Lire ta classe et intervenir ». Boutons : « Le refaire avec ma classe », « Voir le parcours 7 », « Terminer ».');
        expect(P.etapesModele.map((e) => e.titre)).toEqual(consigne.map((b) => b.titre));
    });

    it('ce que la consigne exige de la visite : la personne ne touche que « Codex » (bulle 1), puis « Continuer » ; aucun contour ensuite', () => {
        const c = consigneDu('5.');
        expect(c).toContain('La personne ne touche que le bouton « Codex » (bulle 1) ; elle avance ensuite par « Continuer », dans la bulle.');
        expect(c).toContain('sans la pulsation qui veut dire « ce que tu toucheras »');
        expect(P.etapesModele.slice(1, 4).map((e) => e.boutons.map((b) => b.libelle))).toEqual([['Continuer'], ['Continuer'], ['Continuer']]);
        expect(P.etapesModele.slice(1).map((e) => e.contour())).toEqual([null, null, null, null]);
        expect(typeof def.lancerModele).toBe('function');
        expect(typeof def.defaireModele).toBe('function');
    });
});
