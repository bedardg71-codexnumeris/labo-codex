import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE UI — la modale « Export personnalisé » (#431)
// =======================================================================
//
// Modale ASSUMÉE (décision du 8 août, plan #431) : cases + ordre + aperçu
// ne tiennent pas dans un panneau de 380 px. Deux volets :
//   1. statique — le chrome existe, le panneau Actions offre le point
//      d'entrée, aucun listener souris (ratchet #148) ;
//   2. rendu — la modale rend les 8 cases, les 4 sections ordonnables,
//      les 3 presets de départ, les 3 formats, et l'aperçu est PEUPLÉ
//      par textContent (jamais innerHTML : il porte des titres saisis).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sourceIndex = readFileSync(path.join(racine, 'index.html'), 'utf8');
const sourceCarte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');

describe('#431 · statique — le chrome de la modale', () => {
    it('la modale existe dans le HTML avec ses cinq zones', () => {
        expect(sourceIndex).toContain('id="modalExportPersonnalise"');
        for (const id of ['export-perso-partir', 'export-perso-contenus', 'export-perso-ordre',
                          'export-perso-formats', 'export-perso-apercu']) {
            expect(sourceIndex).toContain('id="' + id + '"');
        }
    });

    it('le panneau Actions offre « Régler le niveau personnalisé… »', () => {
        expect(sourceCarte).toContain('planif-export-plan-personnaliser');
        expect(sourceCarte).toContain('Régler le niveau personnalisé…');
    });

    it('l’aperçu est peuplé par textContent, jamais innerHTML (titres saisis)', () => {
        // La zone d'aperçu ne doit JAMAIS être une cible innerHTML.
        expect(sourceCarte).toMatch(/apercu\.textContent = /);
        expect(sourceCarte).not.toMatch(/apercu\.innerHTML/);
    });

    it('aucun listener souris dans le code de la modale (ratchet #148)', () => {
        const debut = sourceCarte.indexOf('function ouvrirModaleExportPerso');
        const fin = sourceCarte.indexOf('function copierExportFallback');
        expect(debut).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(debut);
        expect(sourceCarte.slice(debut, fin)).not.toMatch(/addEventListener\('mouse/);
    });
});

describe('#431 · rendu — la modale offre tout ce que le moteur sait faire', () => {
    let elements;
    let api;

    beforeAll(() => {
        elements = {};
        function fauxElement(id) {
            return {
                id: id || '',
                style: {}, dataset: {}, innerHTML: '', textContent: '', value: '',
                classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
                setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
                addEventListener() {}, removeEventListener() {},
                querySelector: () => fauxElement(), querySelectorAll: () => [],
                closest: () => null, contains: () => false, focus() {}
            };
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
            echapperHtml: (t) => String(t ?? ''),
            requestAnimationFrame: (fn) => { fn(); return 0; },
            navigator: {},
            document: {
                getElementById: (id) => {
                    if (!elements[id]) elements[id] = fauxElement(id);
                    return elements[id];
                },
                querySelectorAll: () => [], querySelector: () => null,
                addEventListener: () => {},
                createElement: fauxElement, createElementNS: fauxElement,
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
        api = win.planificationCarte;
        api.remplirModaleExportPerso();
    });

    it('les HUIT cases de contenu sont rendues, cochées selon « En classe »', () => {
        const html = elements['export-perso-contenus'].innerHTML;
        expect((html.match(/type="checkbox"/g) || []).length).toBe(8);
        expect(html).toMatch(/data-contenu="objectifs" checked/);
        expect(html).toMatch(/data-contenu="durees" checked/);
        expect(html).toMatch(/data-contenu="connaissances"(?! checked)/);
    });

    it('les QUATRE sections ordonnables, avec leurs flèches', () => {
        const html = elements['export-perso-ordre'].innerHTML;
        expect((html.match(/export-perso-ordre-ligne/g) || []).length).toBe(4);
        expect(html).toContain('Objectifs');
        expect(html).toContain('Déroulement');
        expect(html).toContain('Productions rattachées');
        expect(html).toContain('export-perso-monter');
    });

    it('les trois presets de départ et les trois formats d’aperçu', () => {
        expect((elements['export-perso-partir'].innerHTML.match(/export-perso-preset/g) || []).length).toBe(3);
        expect((elements['export-perso-formats'].innerHTML.match(/data-format="/g) || []).length).toBe(3);
    });

    it('l’aperçu est rempli dès l’ouverture', () => {
        expect(elements['export-perso-apercu'].textContent).toContain('PLAN DE COURS');
        expect(elements['export-perso-apercu'].textContent).toContain('Niveau : Personnalisé');
    });
});
