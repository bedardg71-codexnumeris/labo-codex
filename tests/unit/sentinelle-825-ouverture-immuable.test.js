import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chargementsDynamiques, referencesSansJeton } from '../../scripts/verifier-anticache-stage.mjs';

// SENTINELLE #825 — L'OUVERTURE IMMUABLE : UNE URL NE SERT JAMAIS DEUX CONTENUS.
//
// LE SYMPTÔME, mesuré par Grégoire le 11 septembre 2026 (Chrome, Network) :
// 30 à 45 s pour ouvrir `app.codexnumeris.org`, 313 requêtes, alors qu'un
// rechargement simple servait tout du cache en 0,92 s. `netlify.toml` servait
// `/js/*` et `/css/*` en `max-age=0, must-revalidate` : chaque ouverture
// revalidait 199 scripts, un aller-retour chacun derrière Cloudflare Access.
//
// LE CORRECTIF : `/js/*` et `/css/*` deviennent immuables un an.
// C'est sûr SEULEMENT si aucune URL de ces dossiers ne change jamais de
// contenu — donc si chaque référence porte un `?v=` que les filets existants
// (garde pre-commit #547, `release.mjs`) font bouger avec le fichier. Ces
// filets ne lisent qu'`index.html` : trois fichiers leur échappaient
// (`repertoires-bibliotheque.js` sans jeton ; `pack-demo-10.js` et
// `heic-worker.js` chargés dynamiquement, hors d'`index.html`).
//
// CE QUI EST VERROUILLÉ ICI, en trois invariants :
//   1. toute référence `js/`, `css/` ou `styles.css` d'`index.html` porte un
//      `?v=` — zéro exception, avec le compte total comme témoin ;
//   2. tout chargement dynamique dans `js/` (`.src = 'js/…'`, `new Worker('js/…')`)
//      porte un `?v=` — et la sentinelle VOIT bien les deux sites connus ;
//   3. `netlify.toml` : `/js/*` et `/css/*` portent `immutable` ; `/*.html`, `/`
//      et `/styles.css` ne le portent PAS (un `index.html` immuable figerait
//      l'ancienne application un an chez qui l'a reçu — le seul raté
//      irréversible de ce lot ; `styles.css` est chargée SANS jeton par
//      `design-system.html` et ses 17 modules, servis eux aussi) ;
//      `/version.json` reste `no-store` ;
//   4. les deux fichiers à jeton de build (`pack-demo-10.js`, `heic-worker.js`)
//      n'ont PAS changé depuis la release précédente : leur URL ne bouge qu'avec
//      le build, donc un commit qui les touche sans release servirait un contenu
//      neuf sous une URL immuable. Jugé au pre-push (hook `test:unit`), là où le
//      garde #547 ne voit rien (il ne lit qu'index.html).
//
// CE QUE CETTE SENTINELLE NE VOIT PAS (relecture adverse, 11 sept.) : elle
// verrouille l'ÉTAT, pas la FORME. Une référence `src='…'` à guillemets simples,
// `src="./js/…"`, `.setAttribute('src', …)` ou `.src = variable` lui
// échapperait. Aucune n'existe aujourd'hui (grep vide) ; si l'une apparaît, c'est
// le motif de lecture qu'il faut étendre, pas la règle.
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

// La lecture des chargements dynamiques vit dans le garde pre-commit
// (`scripts/verifier-anticache-stage.mjs`) : une seule lecture pour les deux
// filets. Deux copies avaient déjà divergé une fois — celle d'ici ne voyait ni
// `importScripts` ni `workerSrc` (#602, 13 sept. 2026).
describe('#825 · js/ — les chargements hors index.html portent un ?v=', () => {
    const dossierJs = path.join(racineProjet, 'js');
    const fichiers = readdirSync(dossierJs).filter((f) => f.endsWith('.js'));
    const tous = [];
    for (const f of fichiers) {
        for (const s of chargementsDynamiques(readFileSync(path.join(dossierJs, f), 'utf8'), 'js/' + f)) {
            tous.push({ fichier: 'js/' + f, ...s });
        }
    }

    it('la lecture voit les deux sites connus (pack démo, worker HEIC)', () => {
        const sites = tous.map((t) => t.site);
        expect(sites.some((s) => s.startsWith('js/pack-demo-10.js'))).toBe(true);
        expect(sites.some((s) => s.startsWith('js/heic-worker.js'))).toBe(true);
    });

    it('#602 · la lecture voit aussi workerSrc et importScripts (témoin)', () => {
        const chemins = tous.map((t) => t.chemin);
        expect(chemins, 'workerSrc de travaux-visionneuse.js').toContain('libs/pdf.worker.min.js');
        expect(chemins, 'importScripts de heic-worker.js, résolu depuis js/').toContain('libs/libheif-bundle.js');
    });

    it('zéro chargement dynamique sans jeton dans les dossiers immuables (js/, css/)', () => {
        const nus = tous.filter((t) => /^(js|css)\//.test(t.chemin) && !t.avecJeton)
            .map((t) => t.fichier + ' → ' + t.site);
        expect(nus, 'chargements sans ?v= : ' + nus.join(', ')).toEqual([]);
    });

    it('#602 · CE QUE CES FILETS NE COUVRENT PAS, nommé : les bibliothèques de libs/ chargées sans jeton', () => {
        // Hors périmètre VOLONTAIREMENT (netlify.toml : `libs/` sans règle,
        // donc revalidé à chaque ouverture) : aucun filet ne peut dire si leur
        // contenu a changé sous la même URL. Leur poser un jeton change le
        // chemin de chargement de la visionneuse PDF, des graphiques et des
        // exports PDF — des écrans à vérifier chez Grégoire, hors de ce lot.
        // Cette liste est un CONSTAT, pas une permission : si elle change, c'est
        // qu'on a posé un jeton (la retirer ici) ou ajouté une bibliothèque
        // nue (la nommer ici, ou mieux, lui donner un jeton).
        // #602, lot 23 (12 oct. 2026) : les jetons sont posés — la version de chaque
        // bibliothèque (`?v=4.4.1`…), comme `pdf.min.js` l'avait déjà. La liste est vide, et
        // elle doit le rester : une bibliothèque nue se nomme ici, ou mieux reçoit son jeton.
        const dynNus = tous.filter((t) => !/^(js|css)\//.test(t.chemin) && !t.avecJeton).map((t) => t.chemin);
        expect(dynNus.sort()).toEqual([]);
        expect([...referencesSansJeton(indexHtml)].filter((c) => c.startsWith('libs/')).sort()).toEqual([]);
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

    for (const cible of ['/js/*', '/css/*']) {
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

    it('/styles.css reste revalidée — design-system.html et ses modules la chargent sans jeton', () => {
        // Mesuré le 11 sept. : `grep -c 'href="styles.css"' design-system.html`
        // → 1 ; 17 modules en `../styles.css`. Immuable, la référence
        // d'interface afficherait l'ancienne feuille un an après un correctif.
        const cc = regles.get('/styles.css');
        expect(cc, '/styles.css sans règle').toBeTruthy();
        expect(cc).toMatch(/max-age=0/);
        expect(cc).not.toMatch(/\bimmutable\b/);
    });

    it('/version.json reste no-store — la détection de mise à jour en dépend', () => {
        expect(regles.get('/version.json')).toMatch(/no-store/);
    });
});

// ---------------------------------------------------------------------------
// 4. Les deux fichiers à jeton de build n'ont pas changé depuis la release
// ---------------------------------------------------------------------------

const FICHIERS_A_JETON_DE_BUILD = ['js/pack-demo-10.js', 'js/heic-worker.js'];

function git(args) {
    return execFileSync('git', args, {
        cwd: racineProjet, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
        maxBuffer: 64 * 1024 * 1024,
    });
}

/**
 * Le commit de la release précédente : le dernier qui a touché version.json.
 * Au pre-push, c'est la release qu'on pousse. (`release.mjs`, lui, tourne AVANT
 * le commit de release et remonte d'un cran — #675, 13 sept. 2026.)
 */
function commitDeLaDerniereRelease() {
    try { return git(['log', '-1', '--format=%H', '--', 'version.json']).trim() || null; }
    catch { return null; }
}

/**
 * Parmi `fichiers`, ceux qui diffèrent entre `repere` et HEAD.
 * @returns {string[]}
 */
export function fichiersChangesDepuis(repere, fichiers) {
    if (!repere) return [];
    return git(['diff', '--name-only', repere, 'HEAD', '--', ...fichiers])
        .split('\n').map((l) => l.trim()).filter(Boolean);
}

describe('#825 · pre-push — un fichier à jeton de build ne change pas sans release', () => {
    const repere = commitDeLaDerniereRelease();

    it('le repère existe (témoin : version.json a un historique)', () => {
        expect(repere, 'aucun commit ne touche version.json').toBeTruthy();
    });

    it('pack-demo-10.js et heic-worker.js sont ceux de la dernière release', () => {
        // Leur URL est `?v=<build>` : sans release, le build ne bouge pas, et un
        // navigateur qui a déjà l'ancien contenu sous cette URL le garde un an.
        // Un commit qui les touche doit donc être une release, ou la précéder
        // dans le MÊME push. Corriger : `node scripts/release.mjs patch`.
        const changes = fichiersChangesDepuis(repere, FICHIERS_A_JETON_DE_BUILD);
        expect(changes, 'modifiés depuis la release ' + (repere || '').slice(0, 8)
            + ' sans nouveau build : ' + changes.join(', ')).toEqual([]);
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
//   d. `immutable` ajouté à `/styles.css` : « /styles.css reste revalidée »
//      ROUGE. Remis.
//   e. commit jetable touchant `js/heic-worker.js` (commentaire) après la release
//      1.130.2 : « sont ceux de la dernière release » ROUGE, nomme le fichier.
//      `git reset --soft HEAD~1` + restauration, arbre propre.
//
// 13 septembre 2026 (#602, lecture seule) :
//   f. lecture partagée ramenée à `.src =` et `new Worker(` (l'état d'avant) :
//      « la lecture voit aussi workerSrc et importScripts » ROUGE, « CE QUE CES
//      FILETS NE COUVRENT PAS » ROUGE. Remis.
//   g. `?v=4.4.0` posé sur `libs/chart.min.js` dans index.html : « CE QUE CES
//      FILETS NE COUVRENT PAS » ROUGE — la liste est un constat à tenir à jour.
//      Remis.
// ---------------------------------------------------------------------------
