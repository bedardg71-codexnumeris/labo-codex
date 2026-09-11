import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE #825 — L'OUVERTURE IMMUABLE : UNE URL NE SERT JAMAIS DEUX CONTENUS.
//
// LE SYMPTÔME, mesuré par Grégoire le 11 septembre 2026 (Chrome, Network) :
// 30 à 45 s pour ouvrir `app.codexnumeris.org`, 313 requêtes, alors qu'un
// rechargement simple servait tout du cache en 0,92 s. `netlify.toml` servait
// `/js/*` et `/css/*` en `max-age=0, must-revalidate` : chaque ouverture
// revalidait 199 scripts, un aller-retour chacun derrière Cloudflare Access.
//
// LE CORRECTIF : `/js/*`, `/css/*`, `/styles.css` deviennent immuables un an.
// C'est sûr SEULEMENT si aucune URL de ces dossiers ne change jamais de
// contenu — donc si chaque référence porte un `?v=` que les filets existants
// (garde pre-commit #547, `release.mjs`) font bouger avec le fichier. Ces
// filets ne lisent qu'`index.html` : trois fichiers leur échappaient
// (`repertoires-bibliotheque.js` sans jeton ; `pack-demo-20.js` et
// `heic-worker.js` chargés dynamiquement, hors d'`index.html`).
//
// CE QUI EST VERROUILLÉ ICI, en trois invariants :
//   1. toute référence `js/`, `css/` ou `styles.css` d'`index.html` porte un
//      `?v=` — zéro exception, avec le compte total comme témoin ;
//   2. tout chargement dynamique dans `js/` (`.src = 'js/…'`, `new Worker('js/…')`)
//      porte un `?v=` — et la sentinelle VOIT bien les deux sites connus ;
//   3. `netlify.toml` : `/js/*`, `/css/*`, `/styles.css` portent `immutable` ;
//      `/*.html` et `/` ne le portent PAS (un `index.html` immuable figerait
//      l'ancienne application un an chez qui l'a reçu — le seul raté
//      irréversible de ce lot) ; `/version.json` reste `no-store`.
//
// BREAK-TESTS VÉRIFIÉS le 11 septembre 2026 — journal en fin de fichier.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(racineProjet, rel), 'utf8');

const indexHtml = lire('index.html');
const netlifyToml = lire('netlify.toml');

// ---------------------------------------------------------------------------
// 1. index.html : chaque référence js/, css/, styles.css porte un ?v=
// ---------------------------------------------------------------------------

/**
 * Toutes les références d'`index.html` vers les dossiers servis immuables,
 * avec ou sans jeton. On lit `src="…"` et `href="…"` sans présumer de la
 * balise : c'est la même lecture que celle du garde #547.
 * @returns {{chemin: string, jeton: string|null}[]}
 */
export function referencesImmuables(html) {
    const motif = /(?:src|href)="((?:js\/|css\/|styles\.css)[^"?]*)(?:\?v=([^"]*))?"/g;
    const refs = [];
    let m;
    while ((m = motif.exec(html)) !== null) {
        refs.push({ chemin: m[1], jeton: m[2] === undefined ? null : m[2] });
    }
    return refs;
}

describe('#825 · index.html — chaque script et feuille de style porte un ?v=', () => {
    const refs = referencesImmuables(indexHtml);

    it('la lecture voit bien les deux cents références (témoin du balayage)', () => {
        // 199 <script src="js/…"> + styles.css + css/accompagnement.css, mesuré
        // le 11 sept. 2026. Un balayage qui n'en verrait que dix passerait au
        // vert pour de mauvaises raisons.
        expect(refs.length).toBeGreaterThanOrEqual(190);
    });

    it('zéro référence sans jeton — un fichier immuable sans ?v= ne changerait plus jamais', () => {
        const nues = refs.filter((r) => r.jeton === null || r.jeton === '').map((r) => r.chemin);
        expect(nues, 'références sans ?v= dans index.html : ' + nues.join(', ')).toEqual([]);
    });

    it('repertoires-bibliotheque.js — le trou du 11 sept. — porte son jeton', () => {
        const r = refs.find((x) => x.chemin === 'js/repertoires-bibliotheque.js');
        expect(r, 'js/repertoires-bibliotheque.js introuvable').toBeTruthy();
        expect(r.jeton).toMatch(/^\d{8}[a-z]*$/);
    });
});

// ---------------------------------------------------------------------------
// 2. js/*.js : tout chargement dynamique porte un ?v=
// ---------------------------------------------------------------------------

/**
 * Les chargements dynamiques d'un source : `.src = 'js/…'` (script créé) et
 * `new Worker('js/…')`. Les chaînes de commentaire sont écartées avant lecture,
 * sinon « Source : js/pack-demo-20.js » compterait comme une URL nue.
 * @returns {{site: string, avecJeton: boolean}[]}
 */
export function chargementsDynamiques(source) {
    const sansCommentaires = source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:'"])\/\/[^\n]*/g, '$1');
    const motif = /(?:\.src\s*=\s*|new Worker\(\s*)(['"])(js\/[^'"]+)\1/g;
    const sites = [];
    let m;
    while ((m = motif.exec(sansCommentaires)) !== null) {
        sites.push({ site: m[2], avecJeton: m[2].includes('?v=') });
    }
    return sites;
}

describe('#825 · js/ — les chargements hors index.html portent un ?v=', () => {
    const dossierJs = path.join(racineProjet, 'js');
    const fichiers = readdirSync(dossierJs).filter((f) => f.endsWith('.js'));
    const tous = [];
    for (const f of fichiers) {
        for (const s of chargementsDynamiques(readFileSync(path.join(dossierJs, f), 'utf8'))) {
            tous.push({ fichier: 'js/' + f, ...s });
        }
    }

    it('la lecture voit les deux sites connus (pack démo, worker HEIC)', () => {
        const sites = tous.map((t) => t.site);
        expect(sites.some((s) => s.startsWith('js/pack-demo-20.js'))).toBe(true);
        expect(sites.some((s) => s.startsWith('js/heic-worker.js'))).toBe(true);
    });

    it('zéro chargement dynamique sans jeton', () => {
        const nus = tous.filter((t) => !t.avecJeton).map((t) => t.fichier + ' → ' + t.site);
        expect(nus, 'chargements sans ?v= : ' + nus.join(', ')).toEqual([]);
    });

    it('le jeton des deux sites est le build courant, avec un repli — jamais une URL nue', () => {
        // `version.js` est chargé en premier et réécrit à chaque release : un
        // jeton de build change dès que la version bouge. Le repli `Date.now()`
        // couvre un `version.js` absent sans jamais rendre l'URL nue.
        for (const f of ['js/demo-namespace.js', 'js/heic-decodeur.js']) {
            const src = lire(f);
            expect(src, f).toMatch(/window\.__VERSION__/);
            expect(src, f).toMatch(/Date\.now\(\)/);
        }
    });

    it('le repli tient : jetonAntiCache() rend le build, ou un instant', () => {
        const src = lire('js/demo-namespace.js');
        const corps = /function jetonAntiCache\(\) \{([\s\S]*?)\n\}/.exec(src);
        expect(corps, 'jetonAntiCache introuvable').toBeTruthy();
        // eslint-disable-next-line no-new-func
        const fabriquer = (win) => new Function('window', corps[1] + '')(win);
        expect(fabriquer({ __VERSION__: { build: '0911-1103' } })).toBe('0911-1103');
        expect(fabriquer({})).toMatch(/^\d{13}$/);
    });
});

// ---------------------------------------------------------------------------
// 3. netlify.toml : immuable là où chaque URL change, jamais sur la porte
// ---------------------------------------------------------------------------

/**
 * Les règles `[[headers]]` de netlify.toml : `for` → valeur de Cache-Control.
 * Lecture minimale du TOML, suffisante pour ce fichier (pas de tableau
 * inline, une valeur par ligne).
 * @returns {Map<string, string>}
 */
export function reglesCache(toml) {
    const regles = new Map();
    const blocs = toml.split(/^\[\[headers\]\]\s*$/m).slice(1);
    for (const bloc of blocs) {
        const cible = /^\s*for\s*=\s*"([^"]+)"/m.exec(bloc);
        const cc = /^\s*Cache-Control\s*=\s*"([^"]+)"/m.exec(bloc);
        if (cible) regles.set(cible[1], cc ? cc[1] : '');
    }
    return regles;
}

describe('#825 · netlify.toml — immuable un an, sauf la porte d\'entrée', () => {
    const regles = reglesCache(netlifyToml);

    it('la lecture voit les règles (témoin)', () => {
        expect(regles.size).toBeGreaterThanOrEqual(8);
    });

    for (const cible of ['/js/*', '/css/*', '/styles.css']) {
        it(cible + ' est immuable un an', () => {
            const cc = regles.get(cible);
            expect(cc, cible + ' sans règle').toBeTruthy();
            expect(cc).toMatch(/max-age=31536000/);
            expect(cc).toMatch(/\bimmutable\b/);
        });
    }

    for (const cible of ['/*.html', '/']) {
        it(cible + ' reste à zéro : c\'est le document qui porte les jetons', () => {
            // Le seul raté irréversible : un index.html immuable fige l'ancienne
            // liste d'URL — et l'ancienne application — un an chez qui l'a reçu.
            const cc = regles.get(cible);
            expect(cc, cible + ' sans règle').toBeTruthy();
            expect(cc).toMatch(/max-age=0/);
            expect(cc).not.toMatch(/\bimmutable\b/);
        });
    }

    it('/version.json reste no-store — la détection de mise à jour en dépend', () => {
        expect(regles.get('/version.json')).toMatch(/no-store/);
    });
});

// ---------------------------------------------------------------------------
// JOURNAL DES BREAK-TESTS (11 septembre 2026)
//
//   a. `js/repertoires-bibliotheque.js?v=20260911a` → `js/repertoires-bibliotheque.js`
//      dans index.html : « zéro référence sans jeton » ROUGE, nomme le fichier ;
//      « repertoires-bibliotheque.js porte son jeton » ROUGE. Remis.
//   b. `immutable` retiré de `/js/*` dans netlify.toml : « /js/* est immuable
//      un an » ROUGE. Remis.
//   c. `immutable` ajouté à `/*.html` : « /*.html reste à zéro » ROUGE. Remis.
// ---------------------------------------------------------------------------
