import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

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
    const page = tranche(html, `<div id="${id}" class="sous-section`);
    return tranche(page, '<h2', '</h2>') + '</h2>';
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
    it('leurs contrôles (le « i ») se placent en haut à droite du contenu de la page, sur une rangée réservée (Cowork, 7 nov.)', () => {
        const css = lire('styles.css');
        expect(css).toMatch(/\n\.titre-page-controles \{\s*position: absolute;\s*top: 0;\s*right: 0;/);
        expect(css).toMatch(/\.section \.sous-section\.active \{ position: relative; \}/);
        expect(css).toMatch(/\.section \.sous-section\.active:has\(\.titre-page-controles\) \{ padding-top: 50px; \}/);
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

describe('3 · « Consulter la bibliothèque » : le même bouton partout', () => {
    it('neuf boutons, le même libellé, la même classe ; le Trimestre reprend la taille du modèle', () => {
        const boutons = [...html.matchAll(/<button[^>]*\bbtn-consulter-bibliotheque\b[^>]*>([^<]*)<\/button>/g)].map((m) => m[1].replace('&egrave;', 'è'));
        expect(boutons).toHaveLength(9);
        for (const b of boutons) expect(b).toBe('Consulter la bibliothèque');
        expect(lire('styles.css')).toMatch(/#calendrier-trimestre \.rangee-selection > \.btn-consulter-bibliotheque \{\s*font-size: var\(--font-moyen\);\s*padding: var\(--padding-moyen\);/);
    });
    it('la bibliothèque des tampons de Modélisation reste une icône d\'outil (décision de Cowork)', () => {
        expect(lire('js/modelisation.js') + html).not.toMatch(/btn-consulter-bibliotheque[^>]*tampons/);
    });
});

describe('4 · la barre de la carte d\'alignement : une rangée, dans l\'ordre de l\'esquisse 67', () => {
    const barre = tranche(html, '<div class="planif-header-toolbar">', 'id="planif-chaine"');
    it('à gauche : bibliothèque, sélecteur (le nom de la carte, sans état ajouté), Actions, un filet, Annuler, Rétablir, Rechercher', () => {
        // « en vigueur » : une erreur de la maquette (la fin du nom d'une carte de Grégoire), retirée (Cowork, 7 nov.).
        expect(barre).not.toContain('en vigueur');
        const ordre = ['id="planif-btn-bibliotheque"', 'id="planif-liste-cartes"', 'id="planif-btn-actions"',
            'planif-toolbar-separateur', 'id="planif-btn-annuler"', 'id="planif-btn-retablir"', 'id="planif-btn-rechercher"'];
        const pos = ordre.map((o) => barre.indexOf(o));
        expect(pos, JSON.stringify(pos)).not.toContain(-1);
        expect(pos).toEqual([...pos].sort((a, b) => a - b));
    });
    it('les trois icônes seules ont leur aria-label et leur infobulle ; la recherche s\'ouvre sous la loupe', () => {
        for (const [id, mot] of [['planif-btn-annuler', 'Annuler'], ['planif-btn-retablir', 'Rétablir'], ['planif-btn-rechercher', 'Rechercher dans la carte']]) {
            const b = barre.match(new RegExp('<button[^>]*id="' + id + '"[^>]*>'))[0];
            expect(b, id).toContain('aria-label="' + mot + '"');
            expect(b, id).toMatch(/title="[^"]+"/);
        }
        expect(barre).toMatch(/id="planif-btn-rechercher"[^>]*aria-controls="planif-recherche-zone"/);
        expect(barre).toMatch(/id="planif-recherche-zone" hidden>/);
    });
    it('à droite : Nœuds / Planificateur en segments, Vue, un filet, Inspecteur, Guide', () => {
        const droite = tranche(barre, '<div class="planif-toolbar-droite">');
        const ordre = ['class="planif-segments" role="group"', 'id="planif-btn-palette-noeuds"', 'id="planif-btn-palette-planificateur"', 'id="planif-btn-vue"',
            'planif-toolbar-separateur', 'id="planif-palette-inspecteur-btn"', 'id="planif-palette-aide-btn"'];
        const pos = ordre.map((o) => droite.indexOf(o));
        expect(pos, JSON.stringify(pos)).not.toContain(-1);
        expect(pos).toEqual([...pos].sort((a, b) => a - b));
    });
});

describe('5 · la frise compacte, dans le composant commun', () => {
    it('une ligne de 38 px, des étapes en petit, un chevron, un fond orange léger pour une étape à régler', () => {
        const css = lire('styles.css');
        expect(css).toMatch(/\n\.barre-convergence \{[^}]*min-height: 38px;/);
        expect(css).toMatch(/\n\.bc-etape:not\(\.bc-complet\) \{\s*background: color-mix\(in srgb, var\(--alerte-texte-attention\) 14%, transparent\);/);
        expect(css).toMatch(/\n\.bc-liaison \{[^}]*transform: rotate\(45deg\)/);
        expect(css).not.toMatch(/bc-liaison-ok|bc-liaison-finale/);
    });
});
