/**
 * SENTINELLE (21 nov. 2026) — LE SIGLE SUIT LE NOM.
 *
 * Décision de Grégoire (21 nov. 2026, 6 h 56) : à l'écran, « STD » désigne la pratique « Par standards » ; la pratique
 * « Par sélection de productions » s'affiche « SEL » ; « CIB » ne s'affiche nulle part. Changement d'AFFICHAGE seulement :
 * le CODE interne des familles (STD pour l'ancienne, CIB pour la nouvelle) ne change pas — le moteur le compare et les
 * pratiques rangées chez les gens le portent (`pratiques: ['STD']`). Consigne :
 * plans de travail/CONSIGNE-LOT-2026-11-21-moteur-cibles-1-corrections.md.
 *
 * VERROUILLÉ ICI :
 *   A. Le registre sépare le code (interne) du sigle (affiché) ; son badge montre le sigle.
 *   B. Les producteurs de badges hors registre (la fiche, l'assistant, le badge global, le Comparateur, l'export)
 *      affichent le sigle : une pratique qui porte `pratiques: ['STD']` se lit « SEL ».
 *   C. « CIB » n'est écrit qu'aux places INTERNES mesurées (un code, une clé) : aucune ailleurs.
 *   D. Les textes qui nommaient l'ancienne famille « STD » disent « SEL » (A5, l'état vide, l'avertissement des
 *      productions, la carte « Note » de la Conception, deux bulles).
 *
 * Hors de ce banc, et dit au rapport : le glossaire, la fenêtre d'aide et le guide pédagogique (sortis du périmètre).
 * BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerAvecInterne, RACINE } from './_helpers/bac-suivi.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const db = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
const REG = chargerScript('js/pratiques/pratique-registre.js', { db, cle: (k) => k });
const texteDuBadge = (html) => (/>([^<]*)<\/span>\s*$/.exec(html) || [])[1];

describe('A · le registre : le code reste, le sigle s\'affiche', () => {
    it('les codes INTERNES ne bougent pas', () => {
        expect(['sommative', 'standards', 'specifications', 'denotation', 'cibles'].map(REG.obtenirCodePratique))
            .toEqual(['SOM', 'STD', 'SPE', 'DEN', 'CIB']);
    });
    it('les sigles AFFICHÉS suivent le nom : SEL pour « Par sélection de productions », STD pour « Par standards »', () => {
        expect(['sommative', 'standards', 'specifications', 'denotation', 'cibles'].map(REG.obtenirSiglePratique))
            .toEqual(['SOM', 'SEL', 'SPE', 'DEN', 'STD']);
        expect(['SOM', 'STD', 'SPE', 'DEN', 'CIB', 'PAN'].map(REG.sigleDuCode)).toEqual(['SOM', 'SEL', 'SPE', 'DEN', 'STD', 'PAN']);
    });
    it('le badge du registre montre le sigle ; sa classe garde le code', () => {
        expect(REG.genererBadgePratiqueHTML('standards')).toBe('<span class="badge-type-pratique badge-type-std">SEL</span>');
        expect(texteDuBadge(REG.genererBadgePratiqueHTML('cibles'))).toBe('STD');
        expect(texteDuBadge(REG.genererBadgePratiqueHTML('pan-standards'))).toBe('SEL');   // un id ancien, normalisé
    });
    it('les couleurs : la sarcelle à « Par sélection de productions », le bleu de STD à « Par standards »', () => {
        expect(REG.obtenirCouleurPratique('standards')).toBe('var(--sel-sarcelle)');
        expect(REG.obtenirCouleurPratique('cibles')).toBe('var(--std-bleu)');
        const css = lire('styles.css');
        expect(css).toMatch(/--sel-sarcelle: #0e9384;/);
        expect(css).not.toMatch(/--cib-sarcelle/);
        expect(css).toMatch(/\.wizard-v2-recap-diagnostic--sel \{ --recap-couleur: var\(--sel-sarcelle\); \}/);
        expect(css).toMatch(/\.wizard-v2-recap-diagnostic--std \{ --recap-couleur: var\(--std-bleu\); \}/);
    });
});

describe('B · les autres producteurs de badges affichent le sigle', () => {
    it('la fiche (`genererBadgeTypePratique`) : `pratiques: [\'STD\']` se lit SEL, `[\'CIB\']` se lit STD, et leurs bulles le disent', () => {
        const win = {};
        chargerAvecInterne('js/pratiques-gestion.js', {
            db, cle: (k) => k, echapperHtml, sigleDuCode: REG.sigleDuCode,
            obtenirRepresentationPratiqueStricte: REG.obtenirRepresentationPratiqueStricte,
            document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} }
        }, win, ['genererBadgeTypePratique']);
        const badge = win.__audit['pratiques-gestion.js'].genererBadgeTypePratique;
        const ancien = badge({ pratiques: ['STD'] });
        expect(texteDuBadge(ancien)).toBe('SEL');
        expect(ancien).toContain('title="Par sélection de productions : ');   // ↻ G1, 21 nov., 7 h 44 : plus de « PAN » pour SEL
        const neuf = badge({ pratiques: ['CIB'] });
        expect(texteDuBadge(neuf)).toBe('STD');
        expect(neuf).toContain('title="Par standards : un niveau par cible d\'apprentissage du cours ; la note viendra du meilleur niveau démontré pour chaque cible."');
        expect(texteDuBadge(badge({ type: 'standards' }))).toBe('SEL');
        expect(texteDuBadge(badge({ type: 'cibles' }))).toBe('STD');
        expect(neuf + ancien).not.toMatch(/—/);   // F3 : sans tiret cadratin
    });

    it('l\'assistant : le badge du récapitulatif et la ligne de « Partir d\'un modèle »', () => {
        const win = { addEventListener() {}, removeEventListener() {}, echapperHtml };
        chargerScript('js/wizard-pratique-v2.js', { db, cle: (k) => k, echapperHtml, normaliserIdPratique: (t) => t }, win);
        expect(win.TYPE_BADGES.standards).toMatchObject({ code: 'SEL', classe: 'sel' });
        expect(win.TYPE_BADGES.cibles).toMatchObject({ code: 'STD', classe: 'std', label: 'Par standards' });
        const lien = win.ETAPES_WIZARD['calcul-note-finale'].champs.find(c => c.id === 'voie-rapide-lien');
        expect(lien.description).toBe('Choisis directement ta famille de pratique (SOM, STD, SEL, SPE ou DEN) et passe à sa configuration.');
        const carte = win.ETAPES_WIZARD['calcul-note-finale'].champs[0].options.find(o => o.value === 'cibles');
        expect(carte.description).toBe('Tu inscris, pour chaque cible du cours, le niveau que l\'étudiant·e a démontré. La note vient des niveaux de chaque cible.');
    });

    it('le badge global, le Comparateur et l\'export passent par le sigle', () => {
        expect(lire('js/main.js')).toMatch(/const sigle = \(typeof sigleDuCode === 'function'\) \? sigleDuCode\(code\) : code;\s*\n\s*\n\s*return `<span class="\$\{classe\}">\$\{sigle\}<\/span>`;/);
        expect(lire('js/comparateur-pratiques.js')).toMatch(/var sigle = \(typeof sigleDuCode === 'function'\) \? sigleDuCode\(code\) : code;\s*\n\s*return '<span class="badge-type-pratique badge-type-' \+ c \+ '">' \+ sigle \+ '<\/span>';/);
        expect(lire('js/export-resultats-finaux.js')).toMatch(/pratiqueCode: [^\n]*sigleDuCode\(pratique\.obtenirCode\(\)\)/);
    });
});

/* ---------------------------------------------------------------- C. « CIB » ne s'affiche nulle part */
function occurrencesHorsCommentaires(f, motif) {
    return lire(f).split('\n').filter(l => !/^\s*(\/\/|\*|\/\*|<!--)/.test(l) && motif.test(l));
}
// Les seules places de « CIB » : le code interne et ses clés (mesuré le 21 nov. 2026).
const CIB_INTERNE = {
    'js/pratiques/pratique-registre.js': [/cibles:\s*\{ code: 'CIB', sigle: 'STD'/],
    'js/pratiques-gestion.js': [/const typesValides = \[[^\]]*'CIB'/, /^\s*CIB: 'Par standards : /, /const CODE_PAR_TYPE = \{[^}]*cibles: 'CIB'/, /const PAR_CODE = \{[^}]*CIB: 'cibles'/],
    'js/wizard-pratique-v2.js': [/^\s*'cibles': 'CIB'\s*\/\/ lot 1/]
};
describe('C · « CIB » n\'est écrit qu\'aux places internes', () => {
    it('aucun fichier de js/ ni index.html ne l\'écrit ailleurs, commentaires mis à part', () => {
        const fichiers = [...new Set(lire('index.html').match(/js\/[\w./-]+\.js/g))].concat(['index.html']);
        const vus = {};
        for (const f of fichiers) {
            let lignes;
            try { lignes = occurrencesHorsCommentaires(f, /\bCIB\b/); } catch (e) { continue; }
            if (f === 'index.html') lignes = lignes.filter(l => !/<script src=/.test(l));   // les notes de version des <script>
            if (lignes.length) vus[f] = lignes;
        }
        expect(Object.keys(vus).sort()).toEqual(Object.keys(CIB_INTERNE).sort());
        for (const [f, motifs] of Object.entries(CIB_INTERNE)) {
            expect(vus[f].length, f).toBe(motifs.length);
            for (const l of vus[f]) expect(motifs.some(m => m.test(l)), f + ' : ' + l.trim()).toBe(true);
        }
    });
});

/* ---------------------------------------------------------------- D. Les textes qui nommaient l'ancienne famille « STD » */
describe('D · les textes qui disaient « STD » pour l\'ancienne famille disent « SEL »', () => {
    it('l\'état vide, l\'avertissement des productions, la carte « Note », deux bulles', () => {
        expect(lire('js/etats-vides.js')).toContain('type de notation (SOM, STD, SEL, SPE ou DEN)');
        expect(lire('js/productions.js')).toContain("mais n'entre pas dans le calcul SEL : ");
        expect(lire('js/productions.js')).not.toContain('calcul STD :');
        const html = lire('index.html');
        expect(html).toContain('<strong>SEL</strong> (Par sélection de productions) : ');
        expect(html).toContain('<strong>STD</strong> (Par standards) : ');
        expect(html).not.toContain('<strong>STD</strong> (Standards)');
        const bulles = lire('js/accompagnement-contenu-hover.js');
        // ↻ G5, 21 nov., 7 h 44 (choix de Grégoire) : « PAN » passe de SEL à STD.
        expect(bulles).toContain('STD = PAN par standards (un niveau par cible d\\\'apprentissage), SEL = par sélection de productions');
        expect(bulles).not.toContain('STD = PAN basée sur des standards');
        expect(bulles).toContain('(SOM, STD, SEL, SPE, DEN)');
    });
});

/* ================================================================ JOURNAL DES BREAK-TESTS (21 nov. 2026)
 *
 * Chaque mutation posée dans `js/`, ce fichier lancé seul, le rouge relevé, la mutation retirée. 9 essais verts avant.
 *
 * S1 — pratique-registre.js : le sigle de `standards` remis à « STD ».
 *      ROUGE (3) : A « les sigles AFFICHÉS… », A « le badge du registre… », B « la fiche… » (le badge d'une pratique
 *      qui porte `pratiques: ['STD']` redit STD pour l'ancienne famille).
 * S2 — wizard-pratique-v2.js : A5 remis à « (SOM, STD, SPE, DEN ou CIB) ».
 *      ROUGE (2) : B « l'assistant… », C « … ne l'écrit ailleurs » (un « CIB » affiché).
 * S3 — pratiques-gestion.js, `genererBadgeTypePratique` : le badge affiche `${type}` (le code) au lieu du sigle.
 *      ROUGE (1) : B « la fiche… ».
 * S4 — main.js, `genererBadgePratique` : `${sigle}` → `${code}`.
 *      ROUGE (1) : B « le badge global, le Comparateur et l'export… ».
 */
