// SENTINELLE — LE TEXTE TROUÉ, ÉTAPE 3 : LE COMPOSEUR DE BADGES (lot D du 5 septembre 2026, volet 1)
// Carte : `plans de travail/CARTE-2026-09-05-texte-troue-etape-3.md` (relue par Cowork : le fond
// tient ; réserve traitée ici : le saut de ligne passe par ecrire() puis lire(), pas seulement
// segmenter / assembler). Le module réel (`js/composeur-badges.js`) ; sa couche DOM est éprouvée
// sur des nœuds SIMULÉS bâtis depuis le HTML qu'il rend (un parseur du seul HTML qu'il produit,
// plus les formes de bloc que WebKit et Blink produiraient si un Entrée leur échappait).
//
//   A. l'aller-retour PUR : `assembler(segmenter(t)) === t` au caractère, pour tous les textes
//      des palettes et les cas limites ; un jeton hors palette est du texte ; `{s}` aussi ;
//   B. `rendreHtml` : tout texte échappé, la chip = la pastille (sans data-action, non éditable,
//      avec sa croix), `\n` → `<br>`, un `<br>` de plus quand le texte finit par `\n` ;
//   C. l'aller-retour par la VUE : `lire(ecrire(t)) === t` sur une, deux, trois lignes, une ligne
//      vide au milieu, une fin de ligne ; les formes de bloc des deux moteurs ; un placeholder ;
//   D. les positions texte ↔ nœuds (`entreesDe`) ;
//   E. `disponible` mesure, ne suppose pas ; `paletteDe` choisit la palette de la zone ;
//   F. index.html, styles.css, et le module n'écrit jamais du texte brut dans le rendu.
//
// BREAK-TESTS (faits le 5 septembre 2026, chacun restauré, `cmp` identique) :
//   · `assembler` joint les segments par une espace → A rougit ;
//   · `rendreHtml` n'échappe pas le texte → B.a et F.c rougissent ;
//   · `entreesDe` ignore la frontière des blocs → C.c rougit.
// BREAK-TESTS DE LA RETOUCHE iPad (5 sept., 10 h 30 — l'ancre après une chip terminale) :
//   · `lire` ne retire plus l'ancre → C.d rougit (elle fuit dans la valeur) ;
//   · `rendreHtml` ne pose plus l'ancre → C.d rougit (plus de nœud texte après la chip).

import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');
const require = createRequire(import.meta.url);
const E = require(path.join(racine, 'js/evaluation-enonces.js'));
const P = require(path.join(racine, 'js/evaluation-projection.js'));
const C = require(path.join(racine, 'js/composeur-badges.js'));

const PAL_PROJ = P.listerReperes();
const PAL_DECOMPTE = E.reperesDeCle('decompte');
const PAL_TOUS = E.listerReperes();

/* ------------------------------------------------- un DOM simulé, depuis le HTML rendu */

const desechapper = (t) => t.replace(/&#x27;|&#39;/g, '\'').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const texteNoeud = (v) => ({ nodeType: 3, nodeName: '#text', nodeValue: v, textContent: v });
const el = (nom, enfants, attrs) => ({ nodeType: 1, nodeName: nom.toUpperCase(), childNodes: enfants || [], dataset: attrs && attrs.jeton ? { jeton: attrs.jeton } : {},
                                        getAttribute: (a) => (attrs && a === 'data-jeton' && attrs.jeton) ? attrs.jeton : null,
                                        classList: { contains: (c) => !!(attrs && attrs.chip && c === 'composeur-chip') },
                                        closest: () => null, contains: () => false });
/** Parse le seul HTML que `rendreHtml` produit : texte (échappé), <br>, et la chip. */
function domDe(html) {
    const enfants = [];
    const motif = /<br>|<span class="repere-enonce repere-enonce--(posee|remplie) composeur-chip" contenteditable="false" data-jeton="([^"]+)" title="[^"]*">[^<]*<span class="composeur-chip-croix"[^>]*>×<\/span><\/span>/g;
    let dernier = 0, m;
    while ((m = motif.exec(html)) !== null) {
        if (m.index > dernier) enfants.push(texteNoeud(desechapper(html.slice(dernier, m.index))));
        if (m[0] === '<br>') enfants.push(el('br'));
        else enfants.push(el('span', [texteNoeud(desechapper(m[2]).slice(1, -1)), el('span', [texteNoeud('×')])], { chip: true, jeton: desechapper(m[2]) }));
        dernier = m.index + m[0].length;
    }
    if (dernier < html.length) enfants.push(texteNoeud(desechapper(html.slice(dernier))));
    return el('div', enfants);
}
/** ecrire() puis lire(), sur la vue simulée : ce que la carte promet. */
const allerRetourVue = (t, palette) => C.lireNoeuds(domDe(C.rendreHtml(t, palette)));

/* ------------------------------------------------- le corpus */

const modeles = E.listerModeles().map((m) => m.id);
const textesEnonces = [];
modeles.forEach((id) => {
    const n = E.normaliser({ modeleEnonces: id, nom: 'Rigueur' });
    Object.keys(n.enonces).forEach((cle) => textesEnonces.push({ t: n.enonces[cle], palette: E.reperesDeCle(cle) }));
});
const textesPaliers = [];
P.paliersMigration().concat(P.paliersGabaritNeuf()).forEach((p) => { textesPaliers.push({ t: p.texte, palette: PAL_PROJ }); textesPaliers.push({ t: p.texteAide, palette: PAL_PROJ }); });
const limites = [
    '', '{erreurs}', '{erreurs}{mots}', '{erreurs} {mots}', ' {erreurs}', '{erreurs} ', 'a{truc}b', 'a { b } c', '{', '}', '{}',
    'x<b>y</b>&"\'', 'Tu as {erreurs} erreur{s} pour {mots} mots.', '{service}{s}', '{s}{service}',
    'ligne 1\nligne 2', '\n', 'fin\n', 'a\n\nb', 'une\ndeux\ntrois', 'a\n', 'a\n\n', '\n\n', '{erreurs}\n{mots}', 'Va voir {service}.\nEt {seuil}.'
].map((t) => ({ t, palette: PAL_PROJ })).concat([{ t: 'Tu as {erreurs} erreur{s}{points}.', palette: PAL_DECOMPTE }, { t: '{critere} {erreurs}', palette: E.reperesDeCle('aucune') }]);
const corpus = textesEnonces.concat(textesPaliers, limites);

/* ============================================================ A — ALLER-RETOUR PUR */

describe('composeur · A — segmenter / assembler : l\'aller-retour au caractère', () => {
    it('A.a pour tout le corpus (énoncés des deux modèles, paliers, cas limites), `assembler(segmenter(t)) === t`', () => {
        expect(corpus.length).toBeGreaterThan(30);
        corpus.forEach(({ t, palette }) => expect(C.assembler(C.segmenter(t, palette)), JSON.stringify(t)).toBe(t));
    });

    it('A.b les segments : jetons de la palette seulement ; un `{truc}` hors palette, `{s}`, une accolade seule restent du texte ; jamais deux textes de suite', () => {
        const s = C.segmenter('Tu as {erreurs} erreur{s} pour {mots} mots {truc}.', PAL_DECOMPTE);
        expect(s.map((x) => x.type)).toEqual(['texte', 'jeton', 'texte', 'jeton', 'texte']);
        expect(s[1]).toEqual({ type: 'jeton', jeton: '{erreurs}', famille: 'remplie', libelle: 'nombre d\'erreurs' });
        expect(s[2].valeur).toBe(' erreur{s} pour ');
        expect(s[4].valeur).toBe(' mots {truc}.');
        expect(C.segmenter('{erreurs}{mots}', PAL_PROJ).map((x) => x.type)).toEqual(['jeton', 'jeton']);
        expect(C.segmenter('{service}{s}', PAL_PROJ).map((x) => x.type)).toEqual(['jeton', 'texte']);
        expect(C.segmenter('', PAL_PROJ)).toEqual([]);
        expect(C.segmenter('abc', [])).toEqual([{ type: 'texte', valeur: 'abc' }]);
        expect(C.segmenter(null, PAL_PROJ)).toEqual([]);
        corpus.forEach(({ t, palette }) => {
            const seg = C.segmenter(t, palette);
            for (let i = 1; i < seg.length; i++) expect(!(seg[i].type === 'texte' && seg[i - 1].type === 'texte'), t).toBe(true);
        });
        // La palette d'une zone d'énoncé ne fait de chips que de ce qu'elle offre.
        expect(C.segmenter('{critere} {erreurs}', E.reperesDeCle('aucune')).map((x) => x.type)).toEqual(['jeton', 'texte']);
    });

    it('A.c la famille vient de la palette : posé (bleu) ou rempli (vert)', () => {
        const s = C.segmenter('{service} {erreurs}', PAL_PROJ);
        expect(s[0].famille).toBe('posee');
        expect(s[2].famille).toBe('remplie');
    });
});

/* ============================================================ B — LE HTML DE LA VUE */

describe('composeur · B — rendreHtml : échappé, la chip est la pastille, les sauts de ligne', () => {
    it('B.a tout segment texte est échappé ; la chip porte les classes de la pastille, contenteditable="false", son jeton, sa croix, et aucun data-action', () => {
        const html = C.rendreHtml('Va <b>voir</b> {service} & "vite" {erreurs}', PAL_PROJ);
        expect(html).toContain('Va &lt;b&gt;voir&lt;/b&gt; ');
        expect(html).not.toContain('<b>voir</b>');
        expect(html).toContain('&amp; &quot;vite&quot; ');
        // ↻ Étape 2b (22 oct. 2026) : la chip montre le NOM du bloc (`libelle`), plus le nom de code.
        expect(html).toContain('<span class="repere-enonce repere-enonce--posee composeur-chip" contenteditable="false" data-jeton="{service}" title="nom du service">nom du service<span class="composeur-chip-croix" aria-hidden="true" title="Retirer ce badge">×</span></span>');
        expect(html).toContain('repere-enonce--remplie composeur-chip" contenteditable="false" data-jeton="{erreurs}"');
        expect(html).not.toContain('data-action');
        expect(html).not.toContain('onclick');
        // Un libellé de palette échappé lui aussi (title).
        const piege = [{ jeton: '{x}', famille: 'posee', libelle: 'a"b<c' }];
        expect(C.rendreHtml('{x}', piege)).toContain('title="a&quot;b&lt;c"');
        expect(C.rendreHtml('{x}', piege)).not.toContain('a"b<c');
        expect(C.rendreHtml('{x}', piege)).toContain('>a&quot;b&lt;c<span class="composeur-chip-croix"');
    });

    it('B.b `\\n` → `<br>` ; un texte qui finit par `\\n` reçoit un `<br>` de plus (le placeholder) ; rien n\'est ajouté ailleurs', () => {
        expect(C.rendreHtml('a\nb', PAL_PROJ)).toBe('a<br>b');
        expect(C.rendreHtml('a\n', PAL_PROJ)).toBe('a<br><br>');
        expect(C.rendreHtml('a\n\nb', PAL_PROJ)).toBe('a<br><br>b');
        expect(C.rendreHtml('\n', PAL_PROJ)).toBe('<br><br>');
        expect(C.rendreHtml('', PAL_PROJ)).toBe('');
        expect(C.rendreHtml('a', PAL_PROJ)).toBe('a');
        // (retouche iPad : l'ancre U+200B suit une chip avant un saut de ligne — voir C.d)
        expect(C.rendreHtml('{erreurs}\n{mots}', PAL_PROJ)).toMatch(/^<span[^>]*data-jeton="\{erreurs\}"[\s\S]*<\/span>\u200B<br><span[^>]*data-jeton="\{mots\}"/);
    });
});

/* ============================================================ C — L'ALLER-RETOUR PAR LA VUE */

describe('composeur · C — ecrire() puis lire() : le texte revient au caractère, sauts de ligne compris', () => {
    it('C.a pour tout le corpus, y compris une, deux, trois lignes, une ligne vide au milieu, une fin de ligne', () => {
        corpus.forEach(({ t, palette }) => expect(allerRetourVue(t, palette), JSON.stringify(t)).toBe(t));
        expect(allerRetourVue('une\ndeux\ntrois', PAL_PROJ)).toBe('une\ndeux\ntrois');
        expect(allerRetourVue('a\n\nb', PAL_PROJ)).toBe('a\n\nb');
        expect(allerRetourVue('fin\n', PAL_PROJ)).toBe('fin\n');
        expect(allerRetourVue('\n', PAL_PROJ)).toBe('\n');
    });

    it('C.d (retouche iPad) un texte qui FINIT par un jeton : un nœud texte (l\'ancre U+200B) suit la chip terminale — ou la chip avant un saut de ligne — et l\'ancre ne fuit jamais dans la valeur', () => {
        const ANCRE = '\u200B';
        const finissent = ['Va voir {service}', '{erreurs}', 'Concentre-toi sur {critere}', 'x {erreurs}\n', '{erreurs}\n{mots}', '{erreurs}\n', '{erreurs}{mots}', 'a {erreurs} {mots}'];
        finissent.forEach((t) => {
            const html = C.rendreHtml(t, PAL_PROJ);
            expect(allerRetourVue(t, PAL_PROJ), JSON.stringify(t)).toBe(t);
            expect(C.lireNoeuds(domDe(html)), JSON.stringify(t)).not.toContain(ANCRE);
        });
        // L'ancre : après la chip terminale, après une chip suivie d'un saut de ligne — nulle part ailleurs.
        expect(C.rendreHtml('Va voir {service}', PAL_PROJ)).toMatch(/<\/span>\u200B$/);
        expect(C.rendreHtml('{erreurs}\n{mots}', PAL_PROJ)).toMatch(/<\/span>\u200B<br><span[\s\S]*<\/span>\u200B$/);
        expect(C.rendreHtml('{erreurs}\n', PAL_PROJ)).toMatch(/<\/span>\u200B<br><br>$/);
        expect(C.rendreHtml('{erreurs}{mots}', PAL_PROJ).split(ANCRE).length - 1).toBe(1);
        expect(C.rendreHtml('Tu as {erreurs} sur {mots}.', PAL_PROJ)).not.toContain(ANCRE);
        expect(C.rendreHtml('sans jeton', PAL_PROJ)).not.toContain(ANCRE);
        // Le dernier nœud d'une vue rendue depuis un texte à jeton final est un nœud TEXTE, jamais la chip.
        const vue = domDe(C.rendreHtml('Va voir {service}', PAL_PROJ));
        expect(vue.childNodes[vue.childNodes.length - 1].nodeName).toBe('#text');
        expect(vue.childNodes[vue.childNodes.length - 1].nodeValue).toBe(ANCRE);
        // Ce que le doigt tape dans l'ancre entre dans le texte, l'ancre non ; une ancre seule ne vaut rien.
        expect(C.lireNoeuds(el('div', [texteNoeud('a '), el('span', [texteNoeud('erreurs')], { chip: true, jeton: '{erreurs}' }), texteNoeud(ANCRE + ' erreurs')]))).toBe('a {erreurs} erreurs');
        expect(C.lireNoeuds(el('div', [texteNoeud(ANCRE)]))).toBe('');
        expect(C.lireNoeuds(el('div', [texteNoeud(ANCRE), el('div', [texteNoeud('b')])]))).toBe('b');
        // Les positions : l'ancre est une entrée de longueur 0, à la fin de la chip.
        const e = C.entreesDe(vue);
        expect(e.map((x) => [x.type, x.debut, x.texte.length])).toEqual([['texte', 0, 8], ['jeton', 8, 9], ['texte', 17, 0]]);
        expect(e[2].brut).toBe(ANCRE);
    });

    it('C.b la vue simulée porte bien des chips et des <br>, pas du texte `{erreurs}` (le témoin du parseur)', () => {
        const vue = domDe(C.rendreHtml('Tu as {erreurs}\nsur {mots}.', PAL_PROJ));
        // (retouche iPad : un nœud texte — l'ancre — entre la chip et le <br>)
        expect(vue.childNodes.map((n) => n.nodeName)).toEqual(['#text', 'SPAN', '#text', 'BR', '#text', 'SPAN', '#text']);
        expect(vue.childNodes[2].nodeValue).toBe('\u200B');
        expect(vue.childNodes[1].dataset.jeton).toBe('{erreurs}');
    });

    it('C.c les formes de bloc des deux moteurs se lisent : un bloc est une frontière `\\n` ; un <br> dernier de son parent est le placeholder', () => {
        // WebKit : Entrée en fin de texte → « a<div><br></div> » ; puis du texte → « a<div>b</div> ».
        expect(C.lireNoeuds(el('div', [texteNoeud('a'), el('div', [el('br')])]))).toBe('a\n');
        expect(C.lireNoeuds(el('div', [texteNoeud('a'), el('div', [texteNoeud('b')])]))).toBe('a\nb');
        expect(C.lireNoeuds(el('div', [texteNoeud('a'), el('div', [el('br')]), el('div', [el('br')])]))).toBe('a\n\n');
        expect(C.lireNoeuds(el('div', [texteNoeud('a'), el('div', [texteNoeud('b'), el('br')])]))).toBe('a\nb');
        expect(C.lireNoeuds(el('div', [texteNoeud('a'), el('div', [texteNoeud('b'), el('br'), texteNoeud('c')])]))).toBe('a\nb\nc');
        expect(C.lireNoeuds(el('div', [el('div', [texteNoeud('a')]), el('div', [texteNoeud('b')])]))).toBe('a\nb');
        // Blink : « a<br><br> » après un Entrée en fin ; « a<br>b » avec du texte.
        expect(C.lireNoeuds(el('div', [texteNoeud('a'), el('br'), el('br')]))).toBe('a\n');
        expect(C.lireNoeuds(el('div', [texteNoeud('a'), el('br'), texteNoeud('b')]))).toBe('a\nb');
        expect(C.lireNoeuds(el('div', [texteNoeud('a'), el('br')]))).toBe('a');
        // Un élément quelconque (collage échappé au filtre) se lit par ses enfants — son texte, sans balise.
        expect(C.lireNoeuds(el('div', [texteNoeud('a '), el('b', [texteNoeud('gras')]), texteNoeud(' b')]))).toBe('a gras b');
        expect(C.lireNoeuds(el('div', [el('p', [texteNoeud('un')]), el('p', [texteNoeud('deux')])]))).toBe('un\ndeux');
        // Une chip, où qu'elle soit, vaut son jeton.
        expect(C.lireNoeuds(el('div', [texteNoeud('x '), el('span', [texteNoeud('erreurs')], { chip: true, jeton: '{erreurs}' }), el('div', [el('span', [texteNoeud('mots')], { chip: true, jeton: '{mots}' })])]))).toBe('x {erreurs}\n{mots}');
        expect(C.lireNoeuds(el('div', []))).toBe('');
    });
});

/* ============================================================ D — LES POSITIONS */

describe('composeur · D — entreesDe : la table des positions texte ↔ nœuds', () => {
    it('D.a chaque entrée connaît son début ; une chip compte la longueur de son jeton ; un saut compte 1', () => {
        const vue = domDe(C.rendreHtml('Tu as {erreurs} sur\n{mots}.', PAL_PROJ));
        const e = C.entreesDe(vue);
        expect(e.map((x) => [x.type, x.debut, x.texte.length])).toEqual([
            ['texte', 0, 6], ['jeton', 6, 9], ['texte', 15, 4], ['saut', 19, 1], ['jeton', 20, 6], ['texte', 26, 1]
        ]);
        expect(e[1].noeud).toBe(vue.childNodes[1]);
        expect(e.map((x) => x.texte).join('')).toBe('Tu as {erreurs} sur\n{mots}.');
    });
});

/* ============================================================ E — DISPONIBLE, PALETTE */

describe('composeur · E — disponible() mesure ; paletteDe() choisit la palette de la zone', () => {
    it('E.a disponible : faux sans sélection ou sans contentEditable ; vrai quand l\'élément l\'accepte — mesuré sur un document donné', () => {
        const divOk = { contentEditable: 'inherit', isContentEditable: false };
        const docOk = { createElement: () => divOk };
        const globalWin = globalThis.window;
        globalThis.window = { getSelection: () => null };
        try {
            expect(C.disponible(docOk)).toBe(true);
            expect(C.disponible({ createElement: () => ({}) })).toBe(false);
            expect(C.disponible(null)).toBe(false);
            globalThis.window = {};
            expect(C.disponible(docOk)).toBe(false);
        } finally {
            if (globalWin === undefined) delete globalThis.window; else globalThis.window = globalWin;
        }
    });

    it('E.b paletteDe : les paliers → la palette de projection ; un énoncé → celle de sa clé ; une autre zone → rien', () => {
        const globalWin = globalThis.window;
        globalThis.window = { projectionAlgo: P, enoncesAlgo: E };
        try {
            expect(C.paletteDe({ dataset: { palierIndex: '0', champ: 'texte' } }).map((r) => r.jeton)).toEqual(PAL_PROJ.map((r) => r.jeton));
            expect(C.paletteDe({ dataset: { enonceCle: 'decompte' } }).map((r) => r.jeton)).toEqual(['{critere}', '{erreurs}', '{nomErreurs}', '{mots}', '{nomMots}', '{points}']);   // ↻ étape 2a (22 oct. 2026) : les deux noms, offerts
            expect(C.paletteDe({ dataset: { enonceCle: 'aucune' } }).map((r) => r.jeton)).toEqual(['{critere}', '{nomErreurs}']);
            expect(C.paletteDe({ dataset: {} })).toEqual([]);
            expect(C.paletteDe(null)).toEqual([]);
        } finally {
            if (globalWin === undefined) delete globalThis.window; else globalThis.window = globalWin;
        }
    });
});

/* ============================================================ F — LES SOURCES */

describe('composeur · F — index.html, styles.css, et le module n\'écrit jamais du texte brut', () => {
    it('F.a index.html charge le module après les deux registres et avant grilles.js, avec un jeton', () => {
        const html = source('index.html');
        const enonces = html.indexOf('js/evaluation-enonces.js?v=');
        const composeur = html.indexOf('js/composeur-badges.js?v=');
        const grilles = html.indexOf('js/grilles.js?v=');
        expect(enonces).toBeGreaterThan(-1);
        expect(composeur).toBeGreaterThan(enonces);
        expect(grilles).toBeGreaterThan(composeur);
        expect(html).toMatch(/js\/composeur-badges\.js\?v=2026090[5-9]|js\/composeur-badges\.js\?v=20261/);
    });

    it('F.b styles.css : la vue a l\'aspect du champ, la chip ne prend pas la taille d\'un bouton, même en tactile', () => {
        const css = source('styles.css');
        expect(css).toContain('.composeur-badges {');
        expect(css).toMatch(/\.composeur-badges \{[^}]*white-space: pre-wrap/);
        // ↻ Étape 2b (22 oct. 2026) : `.repere-enonce` n'est plus qu'une pastille (les boutons des
        // rangées sont partis) — aucune hauteur de bouton à défaire, ni au doigt ni à la souris.
        const pastille = css.match(/\n\.repere-enonce \{[^}]*\}/);
        expect(pastille).not.toBeNull();
        expect(pastille[0]).not.toMatch(/min-height/);
        // Dans LE bloc tactile de #568 (un seul bloc, que sa sentinelle lit en premier), pas un bloc à part.
        const debut = css.indexOf('@media (pointer: coarse) {');
        const coarse = css.slice(debut, css.indexOf('\n}\n', debut));
        expect(coarse).not.toMatch(/\.repere-enonce \{/);
        expect(coarse).toMatch(/\.composeur-badges \.composeur-chip \{ padding: 3px 10px/);
        expect(coarse).toMatch(/\.composeur-badges \.composeur-chip-croix \{ padding: 4px 8px/);
        expect(css).toContain('.composeur-badges .composeur-chip-croix {');
        expect(css).toContain('.composeur-badges:empty::before {');
    });

    it('F.c dans le module, `innerHTML` ne reçoit que `rendreHtml(...)`, et `rendreHtml` n\'écrit un texte que par l\'échappeur', () => {
        const m = source('js/composeur-badges.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        const affectations = m.match(/\.innerHTML\s*=\s*[^;]+;/g) || [];
        expect(affectations.length).toBeGreaterThan(0);
        affectations.forEach((a) => expect(a).toMatch(/rendreHtml\(/));
        expect(m).not.toMatch(/insertAdjacentHTML|document\.write/);
        expect(m).toMatch(/e\(s\.valeur\)\.replace\(\/\\n\/g, '<br>'\)/);
        expect(m).not.toMatch(/on(click|change|input)=/);
        expect(m).toMatch(/addEventListener\('keydown'/);
        expect(m).toMatch(/execCommand\('insertText', false, texte\)/);
        expect(m).toMatch(/getData\('text\/plain'\)/);
    });
});
