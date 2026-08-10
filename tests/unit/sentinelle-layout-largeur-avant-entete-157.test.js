import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE #157 — la largeur du conteneur se pose AVANT la mesure de
// l'en-tête
// =======================================================================
//
// Terrain du 10 août 2026 (Grégoire, Mac) : au dépli du badge 🎯, la
// première feuille recouvrait le titre de la leçon. Cause : les deux
// fonctions de layout mesuraient `hauteurEnteteConteneur` PUIS changeaient
// la largeur du conteneur — or la hauteur des objectifs et du titre dépend
// de la largeur (le texte se replie). L'en-tête mesuré sur l'ancienne
// largeur était trop court ; les enfants étaient posés dessous ; le texte
// se repliait sur la nouvelle largeur et le titre descendait sur eux.
// ⚠ Invisible avec des objectifs COURTS (une ligne ne se replie pas) —
// c'est pour ça qu'aucun essai à blanc ne l'avait vu. Reproduit au
// Chromium du conteneur avec des textes longs, corrigé, revérifié (36 px
// de respiration après dépli).
//
// Ce cliquet est STATIQUE (l'ordre des opérations dans la source) parce
// que le comportement n'est observable qu'en navigateur : le compagnon
// comportemental est tests/integration/planif-objectifs-espacement-157.spec.js
// (WebKit, CI). Les deux fonctions de placement sont tenues : le layout
// normal ET le layout pendant un drag.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');

function corpsDeFonction(nom) {
    const debut = source.indexOf('function ' + nom + '(');
    expect(debut, 'function ' + nom + ' introuvable').toBeGreaterThan(-1);
    // Borne : la déclaration de fonction suivante au même niveau
    const fin = source.indexOf('\nfunction ', debut + 1);
    return source.slice(debut, fin === -1 ? undefined : fin);
}

for (const nom of ['reLayoutConteneur', 'reLayoutConteneurSaufDragged']) {
    describe(`#157 · ${nom}`, () => {
        it('pose la largeur du conteneur AVANT de mesurer hauteurEnteteConteneur', () => {
            const corps = corpsDeFonction(nom);
            const poseLargeur = corps.indexOf(".style.width = newW + 'px'");
            const mesure = corps.indexOf('hauteurEnteteConteneur(');
            expect(poseLargeur, 'la pose de largeur pré-mesure a disparu').toBeGreaterThan(-1);
            expect(mesure, 'la mesure d\'en-tête a disparu').toBeGreaterThan(-1);
            expect(poseLargeur < mesure,
                `${nom} mesure l'en-tête avant de poser la largeur — le repli du texte ` +
                'des objectifs invalidera la mesure (chevauchement #157)').toBe(true);
        });

        it('l\'en-tête mesuré sert bien au placement (curY) et à la hauteur (newH)', () => {
            const corps = corpsDeFonction(nom);
            expect(corps).toMatch(/HEADER_H \+ PADDING/);
            expect(corps).toMatch(/newH = totalH \+ PADDING \* 2 \+ HEADER_H/);
        });
    });
}
