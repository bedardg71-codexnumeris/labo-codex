/**
 * #1153 (24 oct. 2026) — CHANGER LA GRILLE D'UNE CARTOUCHE ENREGISTRÉE EN FAIT UNE COPIE.
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-24-cartouche-nouvelle-renomme.md.
 *
 * `forgerCopieCartouchePourGrille` (cartouches.js), pure : l'id neuf, la grille choisie, les
 * commentaires rattachés par id puis par nom (`cartoucheCorrespondance.rattacher`), tous les critères
 * de la grille dans son ordre, ceux de l'originale sans correspondant gardés avec leurs commentaires ;
 * le nom gardé sauf homonyme sous la grille choisie ; l'originale jamais modifiée ; aucune copie quand
 * le rattachement superposerait des commentaires.
 * Le geste dans le vrai index.html : tests/integration/cartouche-nouvelle-renomme-1153.spec.js.
 * Noms et ids fictifs.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';

const dbVide = { getSync: (k, d) => d, setSync() {}, get: async () => null, set: async () => {}, modifier: async () => undefined };

let forger;
beforeAll(() => {
    const document = new JSDOM('<!doctype html><html><body></body></html>').window.document;
    const commun = { db: dbVide, cle: (k) => 'a2032_' + k, document, echapperHtml: (t) => String(t == null ? '' : t),
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        alert() {}, confirm: () => true, genererIdUnique: (p) => (p || '') + 'X' };
    const win = chargerScript('js/identite-item.js', commun);
    chargerScript('js/cartouche-correspondance.js', commun, win);
    chargerScript('js/cartouches.js', { ...commun, nommerCopie: win.nommerCopie }, win);
    forger = win.forgerCopieCartouchePourGrille;
});

const ORIGINALE = () => ({
    id: 'CART_ori', nom: 'Cartouche fictive', grilleId: 'G_A', echelleId: 'ECH', idOriginal: 'CART_source_partagee',
    contexte: 'Contexte fictif', metadata_cc: { auteur_original: 'Auteur fictif' },
    criteres: [{ id: 'CR_a_1', nom: 'Structure' }, { id: 'CR_a_2', nom: 'Langue' }, { id: 'CR_a_3', nom: 'Sources' }],
    niveaux: [{ code: 'I', nom: 'Incomplet' }, { code: 'M', nom: 'Maîtrise' }],
    commentaires: { CR_a_1_I: 'S-I', CR_a_1_M: 'S-M', CR_a_2_M: 'L-M', CR_a_3_M: 'Src-M' }
});
const GRILLE_B = { id: 'G_B', criteres: [{ id: 'CR_b_9', nom: 'Style' }, { id: 'CR_a_1', nom: 'Structure' }, { id: 'CR_b_2', nom: 'Langue' }] };

describe('#1153 — forgerCopieCartouchePourGrille', () => {
    it('id neuf, grille choisie, commentaires par id puis par nom, l\'originale intacte', () => {
        const originale = ORIGINALE();
        const avant = JSON.stringify(originale);
        const copie = forger(originale, GRILLE_B, [], 'CART_neuf', '2026-10-24T21:00:00.000Z');
        expect(JSON.stringify(originale)).toBe(avant);
        expect(copie.id).toBe('CART_neuf');
        expect(copie.grilleId).toBe('G_B');
        expect(copie.commentaires).toEqual({ CR_a_1_I: 'S-I', CR_a_1_M: 'S-M', CR_b_2_M: 'L-M', CR_a_3_M: 'Src-M' });
        expect(copie.nom).toBe('Cartouche fictive');
        expect(copie.contexte).toBe('Contexte fictif');
        expect(copie.metadata_cc).toEqual({ auteur_original: 'Auteur fictif' });
        expect(copie.dateCreation).toBe('2026-10-24T21:00:00.000Z');
        expect(copie.dateModification).toBe('2026-10-24T21:00:00.000Z');
        expect(copie).not.toHaveProperty('idOriginal');
    });

    it('les critères : ceux de la grille dans son ordre, puis ceux de l\'originale sans correspondant', () => {
        const copie = forger(ORIGINALE(), GRILLE_B, [], 'CART_neuf', 'T');
        expect(copie.criteres).toEqual([
            { id: 'CR_b_9', nom: 'Style' }, { id: 'CR_a_1', nom: 'Structure' }, { id: 'CR_b_2', nom: 'Langue' },
            { id: 'CR_a_3', nom: 'Sources' }
        ]);
    });

    it('la copie ne partage aucun objet avec l\'originale', () => {
        const originale = ORIGINALE();
        const copie = forger(originale, GRILLE_B, [], 'CART_neuf', 'T');
        copie.niveaux[0].nom = 'changé';
        copie.metadata_cc.auteur_original = 'changé';
        expect(originale.niveaux[0].nom).toBe('Incomplet');
        expect(originale.metadata_cc.auteur_original).toBe('Auteur fictif');
    });

    it('le nom gardé sauf homonyme sous la grille choisie (casse et espaces comme la normalisation des noms)', () => {
        expect(forger(ORIGINALE(), GRILLE_B, [{ id: 'CART_x', nom: 'Autre' }], 'CART_neuf', 'T').nom).toBe('Cartouche fictive');
        const nom = forger(ORIGINALE(), GRILLE_B, [{ id: 'CART_x', nom: '  cartouche   FICTIVE ' }], 'CART_neuf', 'T').nom;
        expect(nom).not.toBe('Cartouche fictive');
        expect(nom).toContain('Cartouche fictive');
    });

    it('aucune copie quand deux critères de l\'originale visent le même critère de la grille', () => {
        const originale = ORIGINALE();
        originale.criteres.push({ id: 'CR_a_4', nom: 'Structure' });
        originale.commentaires.CR_a_4_M = 'S2-M';
        expect(forger(originale, GRILLE_B, [], 'CART_neuf', 'T')).toBeNull();
    });
});
