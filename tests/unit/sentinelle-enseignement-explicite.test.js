import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// ENSEIGNEMENT EXPLICITE — les étapes deviennent des nœuds (7 août 2026).
//
// Décision Grégoire : les CINQ étapes de la méthode (ouverture, modélisation,
// pratique guidée, pratique autonome, clôture) deviennent des nœuds de la
// palette, FRÈRES D'ACTIVITÉ — et l'ancienne UI d'étapes du Plan de la leçon
// est RETIRÉE (suppression franche actée, données de test sans valeur).
//
// C'est le même mouvement que la semaine (#410) et les objectifs (F1) : le
// concept entre dans le MODÈLE au lieu d'être compensé par un formulaire.
//
// Ce que cette sentinelle verrouille :
//  • « frère d'Activité » est UNE liste (TYPES_ACTIVITE), pas huit triplets en
//    dur — c'est elle qui définit le contrat, et un site qui la contourne le
//    brise en silence pour les nouveaux types ;
//  • l'ablation est COMPLÈTE côté organisateur (zéro-dette : pas d'alias, pas
//    de code mort « au cas où »).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');
const sourceOrganisateur = readFileSync(path.join(racineProjet, 'js', 'organisateur.js'), 'utf8');
const sourceIndex = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
const sourceCss = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');

const TYPES_EE = ['ouverture', 'modelisation', 'pratique-guidee', 'pratique-autonome', 'cloture'];

let store;
function monterModule() {
    store = {};
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
    const fauxElement = () => ({
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => fauxElement(), querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    });
    const fauxDocument = {
        getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {},
        createElement: fauxElement, createElementNS: fauxElement,
        body: { appendChild() {}, removeChild() {} }
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? ''),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: fauxDocument
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = { getIndex: () => ({ active: 'carte_1' }), sauvegarderCarte: () => {}, chargerCarte: () => null };
    return win.planificationCarte;
}

let api;
beforeEach(() => { api = monterModule(); });

describe('EE · les cinq étapes sont des types de premier rang', () => {
    it('chacune est enregistrée avec son libellé et sa couleur', () => {
        const attendus = {
            'ouverture': 'Ouverture', 'modelisation': 'Modélisation',
            'pratique-guidee': 'Pratique guidée', 'pratique-autonome': 'Pratique autonome',
            'cloture': 'Clôture'
        };
        for (const [type, label] of Object.entries(attendus)) {
            expect(api.TYPES[type], type).toBeTruthy();
            expect(api.TYPES[type].label).toBe(label);
            expect(api.TYPES[type].couleur).toContain('--planif-couleur-' + type);
        }
    });

    it('chaque couleur est réellement déclarée dans le CSS', () => {
        // Une variable absente rend une pastille TRANSPARENTE — pas d'erreur,
        // juste un nœud sans couleur. Même classe de défaut que le glyphe
        // fantôme de 1.53.1.
        for (const t of TYPES_EE) {
            expect(sourceCss, t).toContain('--planif-couleur-' + t + ':');
        }
    });

    it('la palette porte les cinq boutons, avec l’infobulle de méthode', () => {
        for (const t of TYPES_EE) {
            expect(sourceIndex).toContain('data-type="' + t + '"');
        }
        expect(sourceIndex).toMatch(/data-type="modelisation"[^>]*title="Démonstration/);
    });
});

describe('EE · frères d’Activité — le contrat', () => {
    it('les cinq types sont dans TYPES_ACTIVITE — la liste qui DÉFINIT le contrat', () => {
        for (const t of TYPES_EE) {
            expect(api.TYPES_ACTIVITE ? api.TYPES_ACTIVITE : [], t).toContain(t);
        }
    });

    it('une leçon peut les contenir, un autre conteneur non', () => {
        for (const t of TYPES_EE) {
            expect(api.peutContenir('lecon', t), 'lecon > ' + t).toBe(true);
            expect(api.peutContenir('sequence', t), 'sequence > ' + t).toBe(false);
        }
    });

    it('plus AUCUN triplet activite/soutien/revision en dur ne subsiste', () => {
        // Un triplet en dur ignore les nouveaux frères en silence : le site
        // paraît juste, et les nœuds EE n'y comptent pas.
        // Les DEUX listes de définition (TYPES_ACTIVITE, TYPES_SERVANTS_OBJECTIF)
        // sont retirées du balayage : ce sont elles, le contrat — le test
        // cherche les triplets qui vivent AILLEURS.
        const sansDefinitions = sourceCarte
            .replace(/var TYPES_ACTIVITE = \[[\s\S]*?\];/, '')
            .replace(/var TYPES_SERVANTS_OBJECTIF = \[[\s\S]*?\];/, '')
            // TYPES_AVEC_NIVEAU_COGNITIF est exempté : l'absence des types EE
            // y est DÉLIBÉRÉE (le niveau cognitif qualifie la tâche, pas
            // l'étape de méthode) — cf. le commentaire sur sa déclaration.
            .replace(/var TYPES_AVEC_NIVEAU_COGNITIF = \[[\s\S]*?\];/, '')
            .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        const triplets = sansDefinitions.match(
            /'activite'[^\n]{0,40}'soutien'[^\n]{0,40}'revision'/g
        ) || [];
        expect(triplets, triplets.join('\n')).toHaveLength(0);
    });

    it('normaliserType les rabat sur « activite » — les verbes de liens suivent', () => {
        for (const t of TYPES_EE) {
            expect(api.normaliserType(t)).toBe('activite');
        }
    });

    it('ils servent un objectif de leçon (#403)', () => {
        for (const t of TYPES_EE) {
            expect(api.TYPES_SERVANTS_OBJECTIF).toContain(t);
        }
    });
});

describe('EE · l’ablation du Plan de la leçon est complète', () => {
    it('l’organisateur ne connaît plus ni étapes ni checkbox EE', () => {
        for (const marqueur of ['NOMS_ETAPES', 'enseignementExplicite', 'org-ee', 'basculerEE', 'creerEtapesVides', 'afficherEtapesEE']) {
            expect(sourceOrganisateur, marqueur).not.toContain(marqueur);
        }
    });

    it('le HTML ne porte plus aucun vestige org-ee', () => {
        expect(sourceIndex).not.toContain('org-ee');
        expect(sourceIndex).not.toContain('Enseignement explicite\n                                </label>');
    });

    it('le CSS ne garde aucune règle orpheline', () => {
        expect(sourceCss).not.toContain('org-ee');
    });

    it('le cœur de la leçon reste — c’était la moitié NON-EE du bloc', () => {
        // L'ablation devait retirer les étapes, pas la liste d'activités avec
        // rétroaction/production qui vivait dans la même enveloppe.
        expect(sourceIndex).toContain('id="org-coeur-brut"');
        expect(sourceIndex).toContain('id="org-coeur-contenu"');
        expect(sourceOrganisateur).toContain('coeurContenu');
    });
});

describe('Palette · les descriptions sont devenues les titres', () => {
    it('les cinq zones portent leur description en titre', () => {
        // « Mise en action » est devenu « Déroulement » le 8 août : la famille
        // accueille désormais l'Exposé — le temps de parole du prof — et un nom
        // tourné vers le seul élève qui agit mentait sur un de ses membres.
        //
        // ⚠ La première assertion de cette boucle ne dépendait PAS de `titre` :
        // elle répétait cinq fois le même contrôle. Resserrée en même temps —
        // une assertion qui ne varie pas dans une boucle est un faux-vert qui
        // s'ignore.
        for (const titre of ['Intention curriculaire', 'Types de connaissances', 'Déroulement', 'Preuve de réussite', 'Organisation']) {
            expect(sourceIndex, titre).toMatch(
                new RegExp('planif-palette-zone-label" data-tooltip="planif-[a-z-]+">' + titre + '</div>')
            );
        }
    });

    it('les anciens slogans ont disparu de la PALETTE (le guide, lui, parle en prose)', () => {
        // Scoper au bloc de la palette : les mêmes mots peuvent vivre ailleurs
        // comme texte de guide — ce n'est pas la redondance visée.
        const palette = sourceIndex.slice(
            sourceIndex.indexOf('planif-palette-contenu'),
            sourceIndex.indexOf('planif-palette-bas-btns')
        );
        for (const slogan of ['>Pourquoi enseigner<', '>Quoi enseigner<', '>Comment enseigner<', ">Vérifier l'apprentissage<", '>Conception<']) {
            expect(palette, slogan).not.toContain(slogan);
        }
    });

    it('la ligne de sous-titre est retirée partout — balisage ET règle CSS', () => {
        expect(sourceIndex).not.toContain('planif-palette-zone-sous-titre');
        expect(sourceCss).not.toContain('planif-palette-zone-sous-titre');
    });
});
