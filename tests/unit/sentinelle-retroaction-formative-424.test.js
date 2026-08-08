import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE — la rétroaction FORMATIVE entre dans l'Inspecteur (#424 Lot E)
// =======================================================================
//
// Le veto D2b (Grégoire, 8 août) a révélé une CAPACITÉ manquante, pas des
// données : poser une rétroaction formative sur une activité n'était
// possible QUE depuis la page « Plan de la leçon » — celle qu'on supprime.
// Ce lot l'ajoute à l'Inspecteur, et sépare les deux notions par leurs
// libellés (option 2) :
//   activité   → « Rétroaction formative »
//   évaluation → « Rétroaction sur le rendu »
//
// ⚠ Il corrige AU PASSAGE un bug préexistant : les listeners du nœud
// Évaluation étaient posés AVANT le bloc « niveau cognitif », dont le
// `extra.innerHTML +=` re-sérialisait le conteneur — sélecteurs MUETS
// (evaluation ∈ TYPES_AVEC_NIVEAU_COGNITIF). Le ratchet d'ordre ci-dessous
// verrouille la pose EN FIN de panneau.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');

let api;

beforeAll(() => {
    const db = {
        getSync: (k, d) => (d !== undefined ? d : null),
        setSync: () => {},
        get: async (k, d) => d,
        set: async () => {}
    };
    const fauxElement = () => ({
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => fauxElement(), querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    });
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? ''),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: {
            getElementById: () => null,
            querySelectorAll: () => [],
            querySelector: () => null,
            addEventListener: () => {},
            createElement: fauxElement,
            createElementNS: fauxElement,
            body: { appendChild() {}, removeChild() {} }
        }
    });
    win.cle = (k) => `a2026_${k}`;
    api = win.planificationCarte;
});

describe('Lot E · le sélecteur rendu — deux libellés, une fabrique', () => {
    it('rend le libellé demandé et les quatre options de RETROACTIONS', () => {
        const html = api.selecteurRetroactionHTML('Rétroaction formative', 'orale');
        expect(html).toContain('Rétroaction formative');
        for (const [valeur, libelle] of api.RETROACTIONS) {
            expect(html).toContain('value="' + valeur + '"');
            expect(html).toContain(libelle);
        }
        expect(html).toMatch(/value="orale" selected/);
    });

    it('sans valeur, « aucune » est sélectionnée', () => {
        const html = api.selecteurRetroactionHTML('Rétroaction sur le rendu', undefined);
        expect(html).toMatch(/value="aucune" selected/);
        expect(html).toContain('Rétroaction sur le rendu');
    });
});

describe('Lot E · la porte d’écriture unique', () => {
    it('écrit la valeur sur metadata.retroaction', () => {
        const noeud = { metadata: {} };
        api.appliquerRetroactionNoeud(noeud, 'ecrite');
        expect(noeud.metadata.retroaction).toBe('ecrite');
    });

    it('« aucune » RETIRE le champ — un défaut n’est pas un rattachement', () => {
        const noeud = { metadata: { retroaction: 'orale' } };
        api.appliquerRetroactionNoeud(noeud, 'aucune');
        expect('retroaction' in noeud.metadata).toBe(false);
    });

    it('survit à un nœud sans metadata', () => {
        const noeud = {};
        api.appliquerRetroactionNoeud(noeud, 'pairs');
        expect(noeud.metadata.retroaction).toBe('pairs');
    });
});

describe('Lot E · structure de l’Inspecteur (bornes vérifiées avant chaque lecture)', () => {
    // Région : ouvrirPanneau, de sa déclaration à fermerPanneau.
    const debut = sourceCarte.indexOf('function ouvrirPanneau(');
    const fin = sourceCarte.indexOf('function fermerPanneau(');

    it('la région ouvrirPanneau existe et est bornée', () => {
        // Leçon #413 : un indexOf à -1 découperait tout le fichier en silence.
        expect(debut).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(debut);
    });

    const region = () => sourceCarte.slice(debut, fin);

    it('les ACTIVITÉS reçoivent le sélecteur « Rétroaction formative »', () => {
        expect(region()).toMatch(
            /TYPES_ACTIVITE\.indexOf\(donnees\.type\) !== -1[\s\S]{0,400}selecteurRetroactionHTML\('Rétroaction formative'/
        );
    });

    it('l’ÉVALUATION garde le sien, relibellé « Rétroaction sur le rendu »', () => {
        expect(region()).toMatch(
            /donnees\.type === 'evaluation'[\s\S]{0,900}selecteurRetroactionHTML\('Rétroaction sur le rendu'/
        );
    });

    it('RATCHET : les listeners rétro/production sont posés APRÈS la dernière écriture innerHTML du panneau', () => {
        const r = region();
        const derniereEcriture = r.lastIndexOf('extra.innerHTML +=');
        const listenerRetro = r.indexOf("querySelector('#planif-panneau-retroaction')");
        const listenerProd = r.indexOf("querySelector('#planif-panneau-production')");
        // Bornes d'abord (leçon #413), verdict ensuite.
        expect(derniereEcriture).toBeGreaterThan(-1);
        expect(listenerRetro).toBeGreaterThan(-1);
        expect(listenerProd).toBeGreaterThan(-1);
        // Un listener posé avant la dernière écriture est un listener MORT :
        // c'est le bug qui rendait muets les sélecteurs du nœud Évaluation.
        expect(listenerRetro).toBeGreaterThan(derniereEcriture);
        expect(listenerProd).toBeGreaterThan(derniereEcriture);
    });
});
