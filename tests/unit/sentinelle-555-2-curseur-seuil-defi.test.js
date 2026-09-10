import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racineProjet, f), 'utf8');

// Sentinelle #555·2 (30 août 2026) — LE CURSEUR « SEUIL DE DÉFI » DIT CE QU'IL
// NE RÈGLE PAS.
//
// Décision de Grégoire (29 août 2026, 8 h 18, option A de l'artefact
// « Arbitrages du 29 août ») : l'intention « demander à l'utilisateur dans
// Outils d'observation » est close — le repère « Maîtrisé à partir de » de
// l'échelle EST le réglage utilisateur, aucun second réglage n'est ajouté.
// Ce qui reste : lever la collision de noms. Le curseur « Seuil de défi
// spécifique » règle `defiSpecifique`, le seuil du DÉPISTAGE ; il ne règle PAS
// le seuil de maîtrise de la « Consolidation des apprentissages », qui vient
// des repères posés sur l'échelle. Deux réglages différents sous des noms
// voisins : sans cette phrase, l'intention de 2025 renaîtra (« ce bloc a
// disparu, on devrait y revenir ») chaque fois que quelqu'un cherchera le
// seuil de maîtrise à cet écran.
//
// ⚠⚠ RÉDUIT LE 10 SEPTEMBRE 2026 — LE MODULE « CONSOLIDATION » A ÉTÉ RETIRÉ.
// La collision de noms que ce banc prévenait n'a plus de second terme : il n'y
// a plus d'écran « Consolidation des apprentissages » où chercher un seuil de
// maîtrise. Les trois cas qui exigeaient de le NOMMER (B, C, l'ancien D) sont
// partis avec lui.
//
// ⚠ CE QUE CE BANC TIENT ENCORE : que l'aide à l'écran et l'infobulle du survol
// disent ce que le curseur règle — le DÉPISTAGE, et lui seul — et qu'aucun
// second réglage de maîtrise ne renaisse dans cet écran (cas E, la décision A
// du 29 août).

function blocCurseur() {
    const html = lire('index.html');
    const debut = html.indexOf('<!-- Défi spécifique -->');
    const fin = html.indexOf('<!-- Bouton restaurer seuils de détection -->', debut);
    if (debut < 0 || fin < 0) return null;
    return html.slice(debut, fin);
}

function infobulle() {
    const hover = lire('js/accompagnement-contenu-hover.js');
    const i = hover.indexOf("'depist-seuil-defi'");
    if (i < 0) return null;
    return hover.slice(i, hover.indexOf("\n    '", i + 10));
}

describe('#555·2 · le curseur « Seuil de défi » dit ce qu\'il ne règle pas', () => {
    it('A. le bloc du curseur existe et son aide dit ce qu\'il règle : le dépistage', () => {
        const bloc = blocCurseur();
        expect(bloc, 'bloc « Défi spécifique » trouvé dans index.html').toBeTruthy();
        expect(bloc).toContain('v2-seuil-defi');
        expect(bloc).toMatch(/dépistage/i);
    });




    it('D. l\'infobulle du survol dit la même chose que l\'aide à l\'écran', () => {
        // Deux textes pour le même curseur : si l'un part sans l'autre, l'écran
        // se contredit selon que la souris survole ou non.
        const texte = infobulle();
        expect(texte, 'infobulle depist-seuil-defi trouvée').toBeTruthy();
        expect(texte).toMatch(/dépistage seulement/);
    });

    it('E. aucun second réglage de maîtrise n\'est né dans cet écran (option B écartée)', () => {
        // La décision A dit « rien à ajouter » : un curseur « seuil de
        // maîtrise » dans le dépistage recréerait la double source que #555
        // a passé une journée à supprimer.
        const bloc = blocCurseur();
        expect(bloc, 'un seul input range dans le bloc')
            .not.toMatch(/id="v2-seuil-maitrise/);
        expect((bloc.match(/<input type="range"/g) || []).length).toBe(1);
    });
});
