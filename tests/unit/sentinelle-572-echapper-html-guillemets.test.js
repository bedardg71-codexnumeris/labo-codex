import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// #572 (28 août 2026) — `echapperHtml` n'échappait pas les guillemets.
//
// `textContent → innerHTML` délègue l'échappement au navigateur, qui traite `&`,
// `<` et `>` mais laisse `"` et `'` intacts : dans du TEXTE, ils sont inoffensifs.
// Or la règle 1 du projet applique cette même fonction à des valeurs interpolées
// DANS DES ATTRIBUTS (`data-*`, `title`, `style`). Là, un `"` referme l'attribut
// et laisse injecter les suivants — un `onerror=` par exemple.
//
// C'est la dépendance bloquante de #562 : poser `echapperHtml` sur les
// interpolations de la Liste des évaluations ne fermait AUCUN attribut tant que
// la fonction elle-même laissait passer le guillemet.
//
// Modification faite dans `js/config.js`, ZONE PROTÉGÉE, sur autorisation
// explicite de Grégoire.
//
// Break-tests (à faire rougir AVANT de faire confiance à cette sentinelle) :
//   1. retirer `.replace(/"/g, '&quot;')` → « guillemet double » rougit.
//   2. retirer `.replace(/'/g, '&#39;')` → « apostrophe » rougit.
//   3. retirer les deux → le cas d'attribut rougit aussi.

function monter() {
    // Reproduit fidèlement le navigateur : textContent → innerHTML échappe
    // &, < et > — et RIEN d'autre. C'est bien ce comportement-là qui laissait
    // passer les guillemets.
    const fauxDocument = {
        addEventListener: () => {}, removeEventListener: () => {},
        querySelector: () => null, querySelectorAll: () => [],
        getElementById: () => null,
        body: { addEventListener: () => {}, appendChild: () => {}, classList: { add(){}, remove(){}, contains(){ return false; } }, style: {}, setAttribute(){}, getAttribute(){ return null; } },
        documentElement: { addEventListener: () => {} },
        createElement: () => ({
            _t: '',
            set textContent(v) { this._t = String(v); },
            get textContent() { return this._t; },
            get innerHTML() {
                return this._t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            },
            setAttribute() {}, appendChild() {}, addEventListener() {},
            style: {}, classList: { add(){}, remove(){}, contains(){ return false; }, toggle(){ return false; } }
        })
    };
    // `config.js` n'est ni une IIFE ni pourvu d'exports `window.X` : ses
    // fonctions sont globales par simple déclaration, ce que le navigateur
    // suffit à faire. Dans un sandbox `new Function`, elles restent locales —
    // d'où la récupération explicite plutôt que par `chargerScript`. On évite
    // ainsi d'ajouter un export à une ZONE PROTÉGÉE pour les besoins d'un test.
    const src = readFileSync(path.join(racineProjet, 'js', 'config.js'), 'utf8');
    const fabriquer = new Function(
        'window', 'document', 'console', 'localStorage', 'sessionStorage',
        '"use strict";\n' + src + '\nreturn echapperHtml;'
    );
    const stockage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    return fabriquer({ addEventListener() {}, removeEventListener() {} },
        fauxDocument, console, stockage, stockage);
}

describe('#572 · echapperHtml est sûre en contexte d’attribut', () => {
    it('le guillemet DOUBLE est échappé — celui qui referme un attribut', () => {
        expect(monter()('a"b')).toBe('a&quot;b');
    });

    it('l’apostrophe est échappée — les attributs peuvent être en quotes simples', () => {
        expect(monter()("a'b")).toBe('a&#39;b');
    });

    it('le cas réel de #562 : une valeur ne peut plus sortir de son attribut', () => {
        const e = monter();
        const da = '123" onerror="alert(1)';
        const html = `<td data-da="${e(da)}">`;
        // Un seul couple de guillemets doit subsister : ceux du gabarit.
        expect(html.match(/"/g)).toHaveLength(2);
        expect(html).not.toContain('onerror="');
    });

    it('contrôle : &, < et > restent échappés (pas de régression)', () => {
        const e = monter();
        expect(e('<script>')).toBe('&lt;script&gt;');
        expect(e('a & b')).toBe('a &amp; b');
    });

    it('contrôle : null et undefined rendent une chaîne vide', () => {
        const e = monter();
        expect(e(null)).toBe('');
        expect(e(undefined)).toBe('');
    });

    it('contrôle : un texte ordinaire n’est pas abîmé', () => {
        expect(monter()('Noémie Gagnon-Roy')).toBe('Noémie Gagnon-Roy');
    });
});

describe('#572 · echapperHtml n’est jamais appliquée à du textContent', () => {
    // Corollaire du renforcement ci-dessus, trouvé par une session parallèle :
    // `textContent` échappe DÉJÀ par construction — c'est le mécanisme interne
    // d'`echapperHtml` elle-même — et il n'interprète PAS les entités. Les
    // enchaîner affiche le code littéral : une grille « L'atelier » devenait
    // « L&#39;atelier » dans le filtre des cartouches.
    //
    // Le défaut préexistait pour `&` (« Écrit & oral » → « Écrit &amp; oral ») ;
    // l'échappement des guillemets l'a seulement rendu courant en français.
    //
    // Break-test : rendre `option.textContent = echapperHtml(grille.nom)` à
    // `js/cartouches.js` → ce test doit rougir.
    it('aucun `textContent = echapperHtml(...)` dans les sources', () => {
        const sources = [];
        const parcourir = (dir) => {
            for (const e of readdirSync(dir, { withFileTypes: true })) {
                if (e.isDirectory() && e.name !== '_archives') parcourir(path.join(dir, e.name));
                else if (e.isFile() && e.name.endsWith('.js')) sources.push(path.join(dir, e.name));
            }
        };
        parcourir(path.join(racineProjet, 'js'));

        const fautifs = [];
        for (const f of sources) {
            const txt = readFileSync(f, 'utf8')
                .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
            txt.split('\n').forEach((l, i) => {
                if (/textContent\s*=\s*echapperHtml\s*\(/.test(l)) {
                    fautifs.push(`${path.relative(racineProjet, f)}:${i + 1}`);
                }
            });
        }
        expect(fautifs, 'textContent échappe déjà ; le double échappement affiche les entités')
            .toEqual([]);
    });
});
