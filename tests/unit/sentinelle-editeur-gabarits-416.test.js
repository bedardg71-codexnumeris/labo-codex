import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE UI — l'éditeur de gabarits (#416 lot H)
// =======================================================================
//
// ⚠ CE FICHIER REMPLACE `sentinelle-modale-export-perso-431`. La modale
// qu'il gardait — cocher des contenus, ordonner des sections — n'existe plus :
// elle édite maintenant des GABARITS, et le réglage unique de #431 a migré.
//
// DEUX INVARIANTS SONT REPRIS TELS QUELS, et c'est la raison d'être de ce
// fichier plutôt qu'une simple suppression :
//   1. l'aperçu est peuplé par textContent, JAMAIS innerHTML — il porte les
//      titres saisis par l'enseignant (règle de sécurité du projet) ;
//   2. aucun listener souris dans le code de la modale (ratchet #148).
// Un chantier qui remplace une interface ne doit pas emporter les gardes
// transversales qui vivaient dedans.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sourceIndex = readFileSync(path.join(racine, 'index.html'), 'utf8');
const sourceCarte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');

describe('Éditeur de gabarits · statique — le chrome et les gardes', () => {
    it('la modale existe dans le HTML avec ses zones', () => {
        expect(sourceIndex).toContain('id="modalExportPersonnalise"');
        for (const id of ['export-perso-liste', 'export-perso-nom', 'export-perso-granularite',
                          'export-perso-colonnes', 'export-perso-formats', 'export-perso-apercu']) {
            expect(sourceIndex).toContain('id="' + id + '"');
        }
    });

    it('les zones de l’ancienne modale #431 ont bien DISPARU', () => {
        // Zéro-dette : « Personnalisé » ne cohabite pas avec les gabarits.
        expect(sourceIndex).not.toContain('id="export-perso-contenus"');
        expect(sourceIndex).not.toContain('id="export-perso-ordre"');
        expect(sourceIndex).not.toContain('id="export-perso-partir"');
        expect(sourceCarte).not.toContain('persisterConfigExportPerso');
    });

    it('l’aperçu est peuplé par textContent, jamais innerHTML (titres saisis)', () => {
        // ⚠ REPRIS DE #431 — garde de sécurité, pas de fonctionnalité.
        expect(sourceCarte).toMatch(/apercu\.textContent = /);
        expect(sourceCarte).not.toMatch(/apercu\.innerHTML/);
    });

    it('aucun listener souris dans le code de la modale (ratchet #148)', () => {
        // ⚠ REPRIS DE #431 — ratchet transversal.
        const debut = sourceCarte.indexOf('function ouvrirModaleExportPerso');
        const fin = sourceCarte.indexOf('function copierExportFallback');
        expect(debut).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(debut);
        expect(sourceCarte.slice(debut, fin)).not.toMatch(/addEventListener\('mouse/);
    });
});

describe('Éditeur de gabarits · rendu', () => {
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

    it('la liste offre les quatre gabarits d’usine, marqués comme tels', () => {
        const html = elements['export-perso-liste'].innerHTML;
        expect((html.match(/type="radio"/g) || []).length).toBe(4);
        expect((html.match(/export-perso-badge-usine/g) || []).length).toBe(4);
        expect(html).toContain('Calendrier');
    });

    it('un gabarit d’usine a ses contrôles DÉSACTIVÉS — il se duplique, il ne s’édite pas', () => {
        expect(elements['export-perso-nom'].disabled).toBe(true);
        const colonnes = elements['export-perso-colonnes'].innerHTML;
        expect(colonnes).toContain('disabled');
        expect((colonnes.match(/type="checkbox"/g) || []).length).toBeGreaterThan(0);
    });

    it('les deux granularités sont offertes', () => {
        const html = elements['export-perso-granularite'].innerHTML;
        expect(html).toContain('data-granularite="noeuds"');
        expect(html).toContain('data-granularite="seances"');
    });

    it('les colonnes du gabarit sont listées, avec leur champ de renommage', () => {
        const html = elements['export-perso-colonnes'].innerHTML;
        expect(html).toContain('data-renom=');
        expect(html).toContain('export-perso-monter');
        expect(html).toContain('export-perso-descendre');
        // Les colonnes non retenues sont offertes à l'ajout.
        expect(html).toContain('data-cocher=');
    });

    it('le format TEXTE n’est PAS offert — un gabarit ne rend que des tableaux', () => {
        const html = elements['export-perso-formats'].innerHTML;
        expect(html).toContain('data-format="tsv"');
        expect(html).toContain('data-format="markdown"');
        expect(html).not.toContain('data-format="texte"');
    });

    it('une colonne sans effet dans la granularité est SIGNALÉE à l’écran', () => {
        // Le gabarit ouvert par défaut est le Calendrier, en « ligne par
        // séance » : rien n'y est inerte. Ce cas vérifie que le marquage
        // existe dans le rendu et qu'il porte son explication — le constat
        // terrain du 12 août était qu'une colonne vide ne s'explique pas
        // toute seule.
        const source = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
        expect(source).toContain('export-perso-colonne-inerte');
        expect(source).toContain('export-perso-note-inerte');
        expect(source).toContain('colonneUtileEn');
        // La colonne reste COCHABLE : le gabarit appartient à l'utilisateur.
        expect(source).not.toContain('inutile(id) ? \' disabled\'');
    });

    it('l’aperçu est rempli dès l’ouverture', () => {
        expect(elements['export-perso-apercu'].textContent.length).toBeGreaterThan(0);
    });
});
