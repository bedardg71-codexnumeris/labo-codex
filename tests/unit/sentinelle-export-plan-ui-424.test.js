import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE UI — le panneau « Exporter le plan… » (#424 Lot D)
// =======================================================================
//
// Le portage REMPLACE les boutons 📄 Texte / 📊 TSV du panneau Organisateur
// par un seul point d'entrée dans le menu Actions. Deux volets :
//   1. statique — le chrome est bien remplacé, pas empilé (zéro-dette) ;
//   2. rendu — le panneau rend les 3 niveaux × 3 formats et les défauts.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sourceIndex = readFileSync(path.join(racine, 'index.html'), 'utf8');
const sourceCarte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
const sourceConfig = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');

describe('Lot D · statique — le chrome est remplacé, pas empilé', () => {
    it('le menu Actions porte « Exporter le plan… » et son panneau', () => {
        expect(sourceIndex).toContain('id="planif-btn-exporter-plan"');
        expect(sourceIndex).toContain('id="planif-export-plan-panel"');
    });

    it('les anciens boutons Texte/TSV ont DISPARU du HTML', () => {
        expect(sourceIndex).not.toContain('planif-btn-export-texte');
        expect(sourceIndex).not.toContain('planif-btn-export-tsv');
    });

    it('leur câblage a disparu du module — pas de listener orphelin', () => {
        expect(sourceCarte).not.toContain('planif-btn-export-texte');
        expect(sourceCarte).not.toContain('planif-btn-export-tsv');
    });

    it('le module d’export est chargé par index.html', () => {
        expect(sourceIndex).toMatch(/src="js\/planification-export\.js\?v=[^"]+"/);
    });
});

describe('Lot G · ratchet d’ablation — la page « Plan de la leçon » est partie', () => {
    // Ratchet d'ABSENCE (cas §4 « ratchet » de SKILL_verification_adverse) :
    // toute réapparition d'un de ces symboles est une régression. Break-testé
    // par RÉSURRECTION (réintroduire l'onglet dans config.js → rouge).
    it('l’onglet, la section, la balise script et le fichier n’existent plus', () => {
        expect(sourceConfig).not.toContain("id: 'organisateur'");
        expect(sourceIndex).not.toContain('conception-organisateur');
        expect(sourceIndex).not.toContain('js/organisateur.js');
        expect(existsSync(path.join(racine, 'js', 'organisateur.js'))).toBe(false);
    });

    it('les anciens générateurs et le panneau mort de la Carte sont partis', () => {
        for (const symbole of ['function genererPlanTexte', 'function genererPlanTSV',
                               'function sauvegarderChoixActivite', 'function afficherLeconOrganisateur',
                               'planif-panneau-seances']) {
            expect(sourceCarte, symbole).not.toContain(symbole);
        }
        expect(sourceIndex).not.toContain('planif-panneau-seances');
    });

    it('la clé des notes (#367) SURVIT — seule la machinerie activites est morte', () => {
        // La suppression ne devait PAS emporter les notes de leçon.
        expect(sourceCarte).toContain("CLE_SEANCES");
        expect(sourceCarte).toContain('cleNoteLecon');
    });
});

describe('Lot D · rendu — le panneau offre bien 3 niveaux × 3 formats', () => {
    let panneau;

    beforeAll(() => {
        const elements = {};
        function fauxElement(id) {
            const el = {
                id: id || '',
                style: {}, dataset: {}, innerHTML: '', textContent: '', value: '',
                classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
                setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
                addEventListener() {}, removeEventListener() {},
                querySelector: () => fauxElement(), querySelectorAll: () => [],
                closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
            };
            return el;
        }
        const db = {
            getSync: (k, d) => (d !== undefined ? d : null),
            setSync: () => {},
            get: async (k, d) => d,
            set: async () => {}
        };
        const globaux = {
            db,
            cle: (k) => `a2026_${k}`,
            echapperHtml: (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
            requestAnimationFrame: (fn) => { fn(); return 0; },
            navigator: {},
            document: {
                getElementById: (id) => {
                    if (!elements[id]) elements[id] = fauxElement(id);
                    return elements[id];
                },
                querySelectorAll: () => [],
                querySelector: () => null,
                addEventListener: () => {},
                createElement: fauxElement,
                createElementNS: fauxElement,
                body: { appendChild() {}, removeChild() {} }
            }
        };
        const win = chargerScript('js/planification-carte.js', globaux);
        win.cle = globaux.cle;
        win.planificationDonnees = {
            getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Test' }] }),
            sauvegarderCarte: () => {},
            chargerCarte: () => null
        };
        chargerScript('js/planification-export.js', globaux, win);
        win.planificationCarte.rendrePanneauExportPlan();
        panneau = elements['planif-export-plan-panel'];
    });

    it('les trois niveaux sont nommés par leur USAGE, pas par jargon', () => {
        expect(panneau.innerHTML).toContain('Plan de cours');
        expect(panneau.innerHTML).toContain('En classe');
        expect(panneau.innerHTML).toContain('Preuve d’alignement');
    });

    it('les trois formats sont offerts', () => {
        expect(panneau.innerHTML).toContain('Texte');
        expect(panneau.innerHTML).toContain('Tableau (TSV)');
        expect(panneau.innerHTML).toContain('Markdown');
    });

    it('défauts : « En classe » en texte — l’usage le plus fréquent (D4)', () => {
        expect(panneau.innerHTML).toMatch(/value="deroulement" checked/);
        expect(panneau.innerHTML).toMatch(/value="texte" checked/);
        expect(panneau.innerHTML).not.toMatch(/value="sommaire" checked/);
    });

    it('les deux gestes sont là : Copier et Télécharger', () => {
        expect(panneau.innerHTML).toContain('planif-export-plan-copier');
        expect(panneau.innerHTML).toContain('planif-export-plan-telecharger');
    });
});
