// Sentinelle — ce qui tient la place d'une vignette sans image (import des travaux).
//
// Rapport de Grégoire du 15 sept. 2026, 17 h 26 : « Il y a des icônes
// "cassées" dans l'interface. » Mesuré : aucune icône n'était cassée. Le
// glyphe d'emplacement (`icon-image.svg`, une page à coin replié) et celui du
// bouton « Réglages spécifiques » (`icons8-photo-editor.svg`), aplatis par le
// filtre des icônes, se lisaient comme l'image cassée de Chrome — et ils
// paraissaient justement là où une image manque (trois HEIC non décodés).
// La raison de l'échec HEIC, elle, ne vivait que dans une infobulle.
//
// Ce qui est verrouillé :
//  · un signe par état (échec / sans aperçu / en cours), jamais l'ancien glyphe ;
//  · le bouton de réglages porte l'engrenage, comme les autres réglages ;
//  · la raison d'un HEIC non décodé s'écrit dans l'inspecteur, échappée.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(resolve(ICI, '../../js/travaux-ui.js'), 'utf8');

// Extrait la table des signes et la fonction, et les évalue seules : la
// fonction ne dépend de rien d'autre (c'est une de ses promesses).
function chargerContenuApercuAbsent() {
    const debut = SOURCE.indexOf('const SIGNES_APERCU_ABSENT');
    const debutFn = SOURCE.indexOf('function contenuApercuAbsent(');
    expect(debut, 'table des signes introuvable').toBeGreaterThan(-1);
    expect(debutFn, 'fonction introuvable').toBeGreaterThan(debut);
    // Fin de la fonction : première accolade fermante en colonne 4 après son début.
    const fin = SOURCE.indexOf('\n    }\n', debutFn);
    expect(fin).toBeGreaterThan(debutFn);
    const code = SOURCE.slice(debut, fin + 6);
    return new Function(code + '\nreturn contenuApercuAbsent;')();
}

const contenuApercuAbsent = chargerContenuApercuAbsent();

describe('contenuApercuAbsent — un signe par état', () => {

    it('un HEIC non décodé montre le triangle d\'avertissement', () => {
        const html = contenuApercuAbsent({ heicEchec: true, fichier: {} });
        expect(html).toContain('icons/icons8-warning.svg');
        expect(html).toContain('aria-label="Aperçu impossible"');
    });

    it('une miniature en cours de calcul montre des points, pas une image', () => {
        const html = contenuApercuAbsent({ fichier: {} });
        expect(html).toContain('pipeline-apercu-points');
        expect(html).not.toContain('<img');
        expect(html).toContain('aria-label="Aperçu en cours…"');
    });

    it('un fichier sans rien à lire montre le cercle barré', () => {
        const html = contenuApercuAbsent({});
        expect(html).toContain('icons/icon-unavailable.svg');
        expect(html).toContain('aria-label="Sans aperçu"');
    });

    it('l\'état forcé l\'emporte sur ce que le fichier laisse deviner', () => {
        expect(contenuApercuAbsent({ fichier: {} }, { etat: 'echec' })).toContain('icons8-warning.svg');
        expect(contenuApercuAbsent({}, { etat: 'attente' })).toContain('pipeline-apercu-points');
    });

    it('un PDF garde son 📄, sauf en échec', () => {
        expect(contenuApercuAbsent({ estPDF: true, fichier: {} })).toBe('&#x1F4C4;');
        expect(contenuApercuAbsent({ typeMIME: 'application/pdf' }, { etat: 'attente' })).toBe('&#x1F4C4;');
        expect(contenuApercuAbsent({ estPDF: true }, { etat: 'echec' })).toContain('icons8-warning.svg');
    });

    it('avec texte, le mot s\'écrit sous le signe (grand aperçu)', () => {
        const html = contenuApercuAbsent({ heicEchec: true }, { avecTexte: true });
        expect(html).toContain('<span class="pipeline-apercu-texte">Aperçu impossible</span>');
    });

    it('n\'y entrent que des constantes : aucun champ du fichier ne passe dans le HTML', () => {
        // Promesse sur laquelle repose `poserApercuAbsent` (innerHTML de son
        // résultat) : un fichier piégé ne doit rien y injecter.
        const piege = {
            heicEchec: true, fichier: {},
            heicRaison: '<script>alert(1)</script>',
            nomFichier: '<img src=x onerror=alert(2)>',
            typeMIME: 'image/heic"><b>gras</b>'
        };
        for (const etat of [undefined, 'echec', 'absent', 'attente']) {
            for (const avecTexte of [false, true]) {
                const html = contenuApercuAbsent(piege, { etat, avecTexte });
                expect(html).not.toContain('<script');
                expect(html).not.toContain('onerror');
                expect(html).not.toContain('<b>');
            }
        }
    });

    it('n\'utilise jamais l\'ancien glyphe, quel que soit l\'état', () => {
        for (const f of [{}, { fichier: {} }, { heicEchec: true }, { estPDF: true }]) {
            for (const etat of [undefined, 'echec', 'absent', 'attente']) {
                expect(contenuApercuAbsent(f, { etat })).not.toContain('icon-image.svg');
            }
        }
    });
});

describe('écran d\'import — les sites passent tous par contenuApercuAbsent', () => {

    it('l\'ancien glyphe a quitté travaux-ui.js', () => {
        expect(SOURCE).not.toContain('icon-image.svg');
    });

    it('le seul <img> d\'emplacement est celui que compose contenuApercuAbsent', () => {
        const n = SOURCE.split('class="pipeline-icone-placeholder-img"').length - 1;
        expect(n).toBe(1);
    });

    it('aucun innerHTML ne concatène l\'emplacement : les conteneurs passent par poserApercuAbsent', () => {
        // F.15 (lint-securite) compte toute concaténation dans un innerHTML ;
        // les quatre aperçus calculés après coup passent par le DOM.
        expect(SOURCE).not.toMatch(/\.innerHTML\s*=[^;\n]*\+\s*contenuApercuAbsent/);
        // Les APPELS, pas la définition (`function poserApercuAbsent(conteneur, f, …)`).
        const appels = SOURCE.match(/(?<!function )poserApercuAbsent\(conteneur, f\b/g) || [];
        expect(appels).toHaveLength(4);
    });

    it('le bouton « Réglages spécifiques » porte l\'engrenage', () => {
        const bouton = SOURCE.match(/<button[^>]*title="Réglages spécifiques"[^>]*>[\s\S]*?<\/button>/);
        expect(bouton, 'bouton introuvable').not.toBeNull();
        expect(bouton[0]).toContain('icons/icon-gear.svg');
        expect(SOURCE).not.toContain('icons8-photo-editor.svg');
    });

    it('la raison d\'un HEIC non décodé s\'écrit dans l\'inspecteur, échappée', () => {
        const bloc = SOURCE.match(/if \(f\.heicEchec\) \{\s*colCentre \+= '<div class="alerte alerte-attention pipeline-heic-raison">'[\s\S]*?\}/);
        expect(bloc, 'bloc de la raison introuvable').not.toBeNull();
        expect(bloc[0]).toContain('echapperHtml(f.heicRaison');
    });
});
