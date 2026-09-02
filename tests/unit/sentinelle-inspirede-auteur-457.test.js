import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

/**
 * SENTINELLE #457 — `forgerInspireDe` doit retrouver l'auteur où qu'il soit rangé.
 *
 * DÉFAUT D'ORIGINE (porte terrain 1.1, 18 août 2026, corpus réel de Grégoire) :
 * après un import inter-trimestre, la carte affichait
 * « Inspiré de Grille-5 FR-HOLIS-30 A25 par Inconnu ». Le NOM était juste — le
 * correctif `ca7564bb` venait de le réparer — mais l'AUTEUR restait « Inconnu ».
 *
 * CAUSE : `forgerInspireDe` ne lisait que `item.auteur`. Ce champ racine n'existe
 * QUE sur les copies faites par `dupliquerGrille` / `dupliquerPratiqueBibliotheque`.
 * Un item créé par le chemin normal range son auteur dans
 * `metadata_cc.auteur_original` ; un item reçu d'un autre enseignant, dans
 * `auteurOriginal`. Le fallback « Inconnu » mordait donc sur tout le matériel réel.
 *
 * PORTÉE : 11 appelants (grilles, échelles, cartouches, pratiques). La trace
 * `inspireDe` existe pour respecter CC BY : elle perdait l'attribution.
 *
 * BREAK-TEST (vérif adverse — ce test DOIT pouvoir rougir) :
 *   - Revenir à `auteur: (itemSource && itemSource.auteur) || 'Inconnu'` dans
 *     `forgerInspireDe` → les cas « chemin normal » et « matériel importé »
 *     rendent « Inconnu » → assertions rouges.
 *   - Retirer le dernier maillon `|| 'Inconnu'` → le cas « aucune source » rend
 *     undefined → assertion rouge.
 *   - Inverser l'ordre (metadata_cc avant auteur) → le cas de priorité rougit.
 */
describe('#457 · forgerInspireDe retrouve l’auteur où qu’il soit rangé', () => {
    let BibliothequeUI;

    beforeAll(() => {
        const w = chargerScript('js/bibliotheque-ui.js');
        BibliothequeUI = w.BibliothequeUI;
    });

    it('la fonction est exposée', () => {
        expect(typeof BibliothequeUI.forgerInspireDe).toBe('function');
        expect(typeof BibliothequeUI.resoudreAuteurSource).toBe('function');
    });

    it('CAS RÉEL DU DÉFAUT — item créé par le chemin normal (auteur dans metadata_cc)', () => {
        // C'est la forme produite par sauvegarderGrilleTemplate : PAS de champ
        // `auteur` racine. C'est exactement la grille de la porte terrain 1.1.
        const grille = {
            id: 'GRILLE_abc',
            nom: 'Grille-5 FR-HOLIS-30 A25',
            metadata_cc: { auteur_original: 'Grégoire Bédard', contributeurs: [] }
        };
        const trace = BibliothequeUI.forgerInspireDe(grille);
        expect(trace.nom).toBe('Grille-5 FR-HOLIS-30 A25');
        expect(trace.auteur).toBe('Grégoire Bédard');
        expect(trace.auteur).not.toBe('Inconnu');
        expect(trace.sourceId).toBe('GRILLE_abc');
    });

    it('matériel reçu d’un autre enseignant (auteur dans auteurOriginal)', () => {
        const cartouche = { id: 'CART_1', nom: 'Cartouche partagée', auteurOriginal: 'Ada Lovelace' };
        expect(BibliothequeUI.forgerInspireDe(cartouche).auteur).toBe('Ada Lovelace');
    });

    it('copie issue d’une duplication (champ auteur racine) — inchangé', () => {
        const pratique = { id: 'pratique_9', nom: 'PAN standards', auteur: 'Grégoire Bédard' };
        expect(BibliothequeUI.forgerInspireDe(pratique).auteur).toBe('Grégoire Bédard');
    });

    it('PRIORITÉ — `auteur` racine l’emporte sur metadata_cc et auteurOriginal', () => {
        const item = {
            id: 'ECH_1', nom: 'Échelle',
            auteur: 'Racine',
            metadata_cc: { auteur_original: 'MetadataCC' },
            auteurOriginal: 'Importe'
        };
        expect(BibliothequeUI.resoudreAuteurSource(item)).toBe('Racine');
    });

    it('PRIORITÉ — metadata_cc l’emporte sur auteurOriginal', () => {
        const item = { nom: 'X', metadata_cc: { auteur_original: 'MetadataCC' }, auteurOriginal: 'Importe' };
        expect(BibliothequeUI.resoudreAuteurSource(item)).toBe('MetadataCC');
    });

    it('AUCUNE source d’auteur — le fallback « Inconnu » tient encore', () => {
        // Le correctif ne doit pas supprimer le filet : un item sans aucune
        // trace d'auteur reste « Inconnu », il ne devient pas undefined.
        expect(BibliothequeUI.forgerInspireDe({ id: 'X', nom: 'Sans auteur' }).auteur).toBe('Inconnu');
        expect(BibliothequeUI.resoudreAuteurSource(null)).toBe('Inconnu');
        expect(BibliothequeUI.resoudreAuteurSource(undefined)).toBe('Inconnu');
    });

    it('metadata_cc présent mais vide — ne casse pas, retombe sur Inconnu', () => {
        expect(BibliothequeUI.resoudreAuteurSource({ nom: 'X', metadata_cc: {} })).toBe('Inconnu');
    });

    it('la trace reste conforme au sous-schéma transversal (nom, auteur, date, sourceId)', () => {
        const trace = BibliothequeUI.forgerInspireDe({ id: 'G1', nom: 'N', metadata_cc: { auteur_original: 'A' } });
        expect(Object.keys(trace).sort()).toEqual(['auteur', 'date', 'nom', 'sourceId']);
        expect(trace.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});
