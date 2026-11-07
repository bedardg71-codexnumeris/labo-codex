import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — LOT 3 « LES PAGES SANS DOUBLONS » (7 novembre 2026)
// Consigne : plans de travail/CONSIGNE-2026-11-07-chaine-des-quatre-lots.md, § Lot 3. Inventaire approuvé par
// Grégoire : plans de travail/INVENTAIRE-2026-11-07-pages-sans-doublons.md ; textes : A-DECIDER-2026-11-07-lot-3-les-textes.md.
//
// VERROUILLÉ ICI :
//   1. un titre de page qui répète son onglet (le mot de l'onglet ou son ancien libellé long) quitte l'écran et
//      reste pour les lecteurs d'écran ; « Rencontres (ortho.) » reste affiché (décision de Cowork) ;
//   2. les lignes de description que Grégoire a désignées (D1, D2, D5 à D10, D13, D16, D19) sont parties, les
//      autres restent ; l'avertissement « en développement » de Mon matériel aussi est parti.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const html = lire('index.html');

/** Le premier <h2> d'une sous-section d'index.html. */
function titreDe(id) {
    const i = html.indexOf(`<div id="${id}" class="sous-section`);
    expect(i, id).toBeGreaterThan(-1);
    const j = html.indexOf('<h2', i);
    return html.slice(j, html.indexOf('</h2>', j) + 5);
}

const AVEC_CONTROLES = ['conception-materiel', 'conception-productions', 'conception-grille-criteres', 'conception-echelle-performance',
    'conception-retroactions', 'conception-pratiques-notation', 'calendrier-trimestre', 'calendrier-vue', 'suivi-groupe', 'suivi-liste',
    'suivi-saisie', 'suivi-profil', 'suivi-interventions', 'evaluations-liste', 'labo-etudes'];
const SANS_CONTROLES = ['conception-carte', 'labo-longitudinal', 'suivi-animation', 'labo-accompagnement', 'labo-rythme',
    'reglages-preferences', 'reglages-donnees', 'reglages-a-propos', 'aide-commencer', 'aide-cadre', 'aide-conception',
    'aide-evaluation', 'aide-suivi', 'aide-labo', 'aide-codex-archives', 'aide-reference'];

describe('1 · les titres qui répètent leur onglet quittent l\'écran, pas le plan de la page', () => {
    it('un titre sans contrôle : masqué en entier (classe titre-page-masque)', () => {
        for (const id of SANS_CONTROLES) expect(titreDe(id), id).toMatch(/^<h2 class="[^"]*\btitre-page-masque\b/);
    });
    it('un titre qui porte des contrôles : son texte seul est masqué, les contrôles restent', () => {
        for (const id of AVEC_CONTROLES) {
            const t = titreDe(id);
            expect(t, id).toMatch(/^<h2 [^>]*class="[^"]*\btitre-page-controles\b/);
            expect(t, id).toMatch(/<span class="titre-page-texte-masque"/);
            expect(t, id).toContain('btn-aide-contextuelle');
        }
    });
    it('« Rencontres (ortho.) » reste à l\'écran', () => {
        expect(titreDe('suivi-rencontres')).not.toMatch(/titre-page-/);
    });
    it('les titres dessinés par le code : Préparer, Annoter, Exporter, Exploration', () => {
        const ui = lire('js/travaux-ui.js');
        expect(ui).toContain('<span class="titre-page-texte-masque">Préparer et importer</span>');
        expect(ui.split('<span class="titre-page-texte-masque">Annoter et évaluer</span>')).toHaveLength(3);
        expect(ui).toContain('<span class="titre-page-texte-masque">Exporter les travaux</span>');
        expect(lire('js/comparateur-pratiques.js')).toContain("titre === 'Exploration des pratiques' ? '<span class=\"titre-page-texte-masque\">'");
    });
    it('la règle qui masque : celle des lecteurs d\'écran (le titre reste dans le plan de la page)', () => {
        const css = lire('styles.css');
        expect(css).toMatch(/\.titre-page-masque,\s*\.titre-page-texte-masque \{ position: absolute !important; width: 1px; height: 1px;[^}]*clip: rect\(0, 0, 0, 0\)/);
        expect(css).not.toMatch(/\.titre-page-(?:texte-)?masque[^{]*\{[^}]*display: none/);
    });
});

describe('2 · les lignes de description désignées par Grégoire', () => {
    const PARTIES = ['Organiser visuellement les séquences, leçons et activités du cours',
        'Évaluer ce qu\'on enseigne, et enseigner ce qu\'on évalue, au même niveau d\'exigence.',
        'Définir les productions du cours et leurs pondérations', 'Créer des grilles de critères réutilisables',
        'Créer des échelles de performance réutilisables', 'Créer des cartouches de rétroaction basées',
        'Configure tes pratiques de notation (SOM, STD, SPE, DEN)', 'Vue d\'ensemble des évaluations et calcul automatique',
        'Enregistre les présences d\'une séance.', 'Outils pour animer la classe', 'Analyse ce que révèle ta démarche pédagogique',
        'Cet outil est en développement', 'materiel-en-construction'];
    const GARDEES = ['Pose ici le squelette de ton trimestre', 'Ton matériel existe déjà ?', 'Observe où en est le groupe et repère qui prioriser.',
        'Parcours tout le groupe et ouvre le portfolio de chaque étudiant·e.', 'Planifie et documente tes interventions ciblées',
        'Tiens tes rencontres individuelles ou en sous-groupe', 'Durées d\'évaluation par activité d\'apprentissage',
        'Quatre concepts : <strong>Codex</strong> (espace de travail actif)'];
    it('D1, D2, D5 à D10, D13, D16, D19 et l\'avertissement de Mon matériel sont partis', () => {
        for (const t of PARTIES) expect(html, t).not.toContain(t);
    });
    it('D3, D4, D11, D12, D14, D15, D18 et D20 restent (D17 est dessinée par le comparateur)', () => {
        for (const t of GARDEES) expect(html, t).toContain(t);
        expect(lire('js/comparateur-pratiques.js')).toContain('Décline une pratique en maquettes');
    });
});
