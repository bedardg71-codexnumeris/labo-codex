import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Correctif meta.duree (signalement du rituel de fin de session du 4 août 2026,
// pré-approuvé dans plans de travail/AUDIT-2026-08-05-consigne.md §4) —
// `meta.duree` est une métadonnée PERSISTÉE qui peut provenir d'un import
// (bibliothèque d'alignements, import inter-trimestre) : une valeur non
// numérique injectée brute dans l'attribut `value=` sortirait de
// l'interpolation, et la CSP est un filet pour le script, pas pour l'injection
// d'attributs. La coercition `parseInt` garantit qu'il n'en sort qu'un entier
// ou une chaîne vide.
//
// ▣ RÉORIENTÉE LE 8 AOÛT — et c'est la leçon à retenir de ce fichier.
// Le champ de durée a QUITTÉ l'inspecteur pour l'en-tête du nœud
// (`dureeControleHTML`). Cette sentinelle visait `#planif-duree-min` : son
// sujet ayant disparu, sa seconde assertion serait devenue VRAIE POUR RIEN
// tandis que le risque, lui, avait simplement déménagé. **Un invariant de
// sécurité voyage avec le champ qu'il protège** — le déplacer sans déplacer sa
// garde, c'est le désarmer en silence.
//
// Elle est aussi passée de la LECTURE DE SOURCE au COMPORTEMENT : on rend le
// contrôle avec une valeur empoisonnée et on regarde ce qui sort. Une regex sur
// le fichier reste verte devant n'importe quelle réécriture équivalente — ou
// devient fausse au premier reformatage.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const carte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');

function monterModule() {
    const store = {};
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
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: {
            getElementById: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {},
            createElement: fauxElement,
            createElementNS: fauxElement,
            body: { appendChild() {}, removeChild() {} }
        }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = { getIndex: () => ({ active: 'carte_1' }), sauvegarderCarte: () => {}, chargerCarte: () => null };
    return win.planificationCarte;
}

const rendre = (api, duree) =>
    api.dureeControleHTML({ id: 'n1', type: 'activite', metadata: { duree } });

describe('meta.duree · la durée est coercée avant injection dans value=', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('une durée saine ressort telle quelle', () => {
        expect(rendre(api, 50)).toContain('value="50"');
    });

    it('une durée EMPOISONNÉE ne peut pas sortir de l’attribut', () => {
        // Le payload ferme `value="` puis ouvre un gestionnaire d'événement.
        // Sans coercition, il apparaîtrait tel quel dans le HTML rendu.
        const html = rendre(api, '" onfocus="alert(1)');
        expect(html).toContain('value=""');
        expect(html).not.toContain('onfocus');
        expect(html).not.toContain('alert(1)');
    });

    it('les autres formes non numériques retombent sur la chaîne vide', () => {
        for (const poison of ['<img src=x onerror=alert(1)>', {}, [], 'abc', null, undefined, NaN]) {
            const html = rendre(api, poison);
            expect(html, String(poison)).toContain('value=""');
            expect(html, String(poison)).not.toContain('onerror');
            expect(html, String(poison)).not.toContain('<img');
        }
    });

    it('une durée numérique en CHAÎNE est acceptée, mais nettoyée', () => {
        // `parseInt('45 min')` rend 45 : la valeur utile survit, le reste tombe.
        expect(rendre(api, '45 min')).toContain('value="45"');
    });

    it('l’identifiant du nœud est échappé — il finit dans un attribut lui aussi', () => {
        // Second point d'injection du même gabarit, plus discret que le premier.
        const html = api.dureeControleHTML({ id: 'n"1', type: 'activite', metadata: { duree: 10 } });
        expect(html).not.toContain('data-duree-noeud="n"1"');
        expect(html).toContain('&quot;');
    });

    it('ne réintroduit pas l’injection brute dans une interpolation de value=', () => {
        // Garde statique complémentaire : aucun `value="` du fichier ne doit
        // recevoir une metadata de durée sans passer par parseInt.
        expect(carte).not.toMatch(/value="'\s*\+\s*\(?\s*(meta|n\.metadata|donnees\.metadata)\.duree/);
    });
});
