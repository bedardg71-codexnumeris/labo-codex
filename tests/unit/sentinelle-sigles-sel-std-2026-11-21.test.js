/**
 * SENTINELLE (21 nov. 2026) — LE SIGLE SUIT LE NOM. Version de la release du renommage (21 nov. 2026).
 *
 * Décision de Grégoire (21 nov. 2026, 6 h 56) : la pratique « Par sélection de productions » s'affiche « SEL », en
 * sarcelle. Changement d'AFFICHAGE seulement : le CODE interne de la famille (STD) ne change pas — le moteur le compare
 * et les pratiques rangées chez les gens le portent (`pratiques: ['STD']`).
 *
 * PÉRIMÈTRE (règle de Grégoire, 21 nov., 8 h 33) : rien de la nouvelle pratique « Par standards » dans `main` avant que
 * ses quatre gestes existent. Ce banc tient donc aussi qu'aucune famille `cibles`, aucun code « CIB » et aucun texte
 * « Par standards » ne sont livrés ici, et que les listes de sigles ne nomment que les familles qui existent
 * (SOM, SEL, SPE, DEN). Le lot 1 de « Par standards » reprendra ce banc dans sa forme complète.
 *
 * VERROUILLÉ ICI :
 *   A. Le registre sépare le code (interne) du sigle (affiché) ; son badge montre le sigle.
 *   B. Les producteurs de badges hors registre (la fiche, l'assistant, le badge global, le Comparateur, l'export)
 *      affichent le sigle : une pratique qui porte `pratiques: ['STD']` se lit « SEL ».
 *   C. Rien de la nouvelle pratique : ni « CIB », ni famille `cibles`, ni « Par standards » offert à l'écran.
 *   D. Les textes qui nommaient l'ancienne famille « STD » disent « SEL » (A5, l'état vide, l'avertissement des
 *      productions, la carte « Note » de la Conception, deux bulles), et aucun n'offre « STD ».
 *
 * Hors de ce banc, et dit au rapport : le glossaire, la fenêtre d'aide et le guide pédagogique disent encore « STD »
 * (définitions à réécrire, sorties du périmètre).
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
    const FAMILLES = ['sommative', 'standards', 'specifications', 'denotation'];
    it('les codes INTERNES ne bougent pas', () => {
        expect(FAMILLES.map(REG.obtenirCodePratique)).toEqual(['SOM', 'STD', 'SPE', 'DEN']);
    });
    it('les sigles AFFICHÉS suivent le nom : SEL pour « Par sélection de productions » ; « STD » n\'est le sigle de personne', () => {
        expect(FAMILLES.map(REG.obtenirSiglePratique)).toEqual(['SOM', 'SEL', 'SPE', 'DEN']);
        expect(['SOM', 'STD', 'SPE', 'DEN', 'PAN'].map(REG.sigleDuCode)).toEqual(['SOM', 'SEL', 'SPE', 'DEN', 'PAN']);
    });
    it('le badge du registre montre le sigle ; sa classe garde le code', () => {
        expect(REG.genererBadgePratiqueHTML('standards')).toBe('<span class="badge-type-pratique badge-type-std">SEL</span>');
        expect(texteDuBadge(REG.genererBadgePratiqueHTML('pan-standards'))).toBe('SEL');   // un id ancien, normalisé
    });
    it('la couleur : la sarcelle à « Par sélection de productions »', () => {
        expect(REG.obtenirCouleurPratique('standards')).toBe('var(--sel-sarcelle)');
        const css = lire('styles.css');
        expect(css).toMatch(/--sel-sarcelle: #0e9384;/);
        expect(css).not.toMatch(/--cib-sarcelle/);
        expect(css).toMatch(/\.wizard-v2-recap-diagnostic--sel \{ --recap-couleur: var\(--sel-sarcelle\); \}/);
        expect(css).not.toMatch(/\.wizard-v2-recap-diagnostic--std\b/);   // plus aucune famille ne porte la classe « std » au récapitulatif
    });
});

describe('B · les autres producteurs de badges affichent le sigle', () => {
    it('la fiche (`genererBadgeTypePratique`) : `pratiques: [\'STD\']` se lit SEL, et sa bulle le dit sans « PAN »', () => {
        const win = {};
        chargerAvecInterne('js/pratiques-gestion.js', {
            db, cle: (k) => k, echapperHtml, sigleDuCode: REG.sigleDuCode,
            obtenirRepresentationPratiqueStricte: REG.obtenirRepresentationPratiqueStricte,
            document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} }
        }, win, ['genererBadgeTypePratique']);
        const badge = win.__audit['pratiques-gestion.js'].genererBadgeTypePratique;
        const ancien = badge({ pratiques: ['STD'] });
        expect(texteDuBadge(ancien)).toBe('SEL');
        expect(ancien).toContain('title="Par sélection de productions : ');   // G1, 21 nov., 7 h 44 : plus de « PAN » pour SEL
        expect(texteDuBadge(badge({ type: 'standards' }))).toBe('SEL');
        expect(ancien).not.toMatch(/—/);
        // Aucun badge ne rend « STD », quelle que soit la forme rangée d'une pratique des quatre familles.
        for (const p of [{ pratiques: ['SOM'] }, { pratiques: ['STD'] }, { pratiques: ['SPE'] }, { pratiques: ['DEN'] }, { type: 'pan-standards' }]) {
            expect(texteDuBadge(badge(p)), JSON.stringify(p)).not.toBe('STD');
        }
        expect(badge({ pratiques: ['PAN'] })).toContain('title="Pratique alternative de notation."');   // G2
    });

    it('l\'assistant : le badge du récapitulatif et la ligne de « Partir d\'un modèle »', () => {
        const win = { addEventListener() {}, removeEventListener() {}, echapperHtml };
        chargerScript('js/wizard-pratique-v2.js', { db, cle: (k) => k, echapperHtml, normaliserIdPratique: (t) => t }, win);
        expect(win.TYPE_BADGES.standards).toMatchObject({ code: 'SEL', classe: 'sel', label: 'Par sélection de productions' });
        expect(Object.keys(win.TYPE_BADGES).sort()).toEqual(['denotation', 'sommative', 'specifications', 'standards']);
        expect(Object.values(win.TYPE_BADGES).map(b => b.code).sort()).toEqual(['DEN', 'SEL', 'SOM', 'SPE']);
        const lien = win.ETAPES_WIZARD['calcul-note-finale'].champs.find(c => c.id === 'voie-rapide-lien');
        expect(lien.description).toBe('Choisis directement ta famille de pratique (SOM, SEL, SPE ou DEN) et passe à sa configuration.');   // A5, périmètre de la release
        expect(win.ETAPES_WIZARD['calcul-note-finale'].champs[0].options.some(o => o.value === 'cibles')).toBe(false);
    });

    it('le badge global, le Comparateur et l\'export passent par le sigle', () => {
        expect(lire('js/main.js')).toMatch(/const sigle = \(typeof sigleDuCode === 'function'\) \? sigleDuCode\(code\) : code;\s*\n\s*\n\s*return `<span class="\$\{classe\}">\$\{sigle\}<\/span>`;/);
        expect(lire('js/comparateur-pratiques.js')).toMatch(/var sigle = \(typeof sigleDuCode === 'function'\) \? sigleDuCode\(code\) : code;\s*\n\s*return '<span class="badge-type-pratique badge-type-' \+ c \+ '">' \+ sigle \+ '<\/span>';/);
        expect(lire('js/export-resultats-finaux.js')).toMatch(/pratiqueCode: [^\n]*sigleDuCode\(pratique\.obtenirCode\(\)\)/);
    });
});

/* ---------------------------------------------------------------- C. Rien de la nouvelle pratique « Par standards » */
const FICHIERS = () => [...new Set(lire('index.html').match(/js\/[\w./-]+\.js/g))].concat(['index.html']);
describe('C · rien de la nouvelle pratique « Par standards » n\'est livré', () => {
    it('« CIB » n\'est écrit nulle part dans js/ ni index.html, commentaires compris', () => {
        const vus = FICHIERS().filter(f => { try { return /\bCIB\b/.test(lire(f)); } catch (e) { return false; } });
        expect(vus).toEqual([]);
    });
    it('le registre n\'a que quatre familles, et ni l\'éditeur des ensembles de cibles ni son script ne sont chargés', () => {
        expect(REG.obtenirRepresentationPratiqueStricte('cibles')).toBe(null);
        expect(lire('index.html')).not.toMatch(/ensembles-cibles\.js/);
    });
    it('« Par standards » ne s\'écrit qu\'à une phrase connue du parcours « notation alternative », laissée à Grégoire (rapport du 21 nov., STOCK et NON VU)', () => {
        const vus = {};
        for (const f of FICHIERS()) {
            let l; try { l = lire(f).split('\n').filter(x => /Par standards/.test(x)); } catch (e) { continue; }
            if (l.length) vus[f] = l;
        }
        expect(Object.keys(vus)).toEqual(['js/parcours-notation-alternative.js']);
        expect(vus['js/parcours-notation-alternative.js'].length).toBe(1);
        // La phrase dit l'ancienne famille par son ancien nom, en début de phrase ; elle n'offre aucune pratique nouvelle.
        expect(vus['js/parcours-notation-alternative.js'][0]).toContain('Par standards, la note retient certaines productions selon une règle que tu choisis');
    });
});

/* ---------------------------------------------------------------- D. Les textes qui nommaient l'ancienne famille « STD » */
describe('D · les textes qui disaient « STD » pour l\'ancienne famille disent « SEL », et aucun n\'offre « STD »', () => {
    it('l\'état vide, l\'avertissement des productions, la carte « Note », deux bulles', () => {
        expect(lire('js/etats-vides.js')).toContain('type de notation (SOM, SEL, SPE ou DEN)');   // G7
        expect(lire('js/productions.js')).toContain("mais n'entre pas dans le calcul SEL : ");      // G8
        expect(lire('js/productions.js')).not.toContain('calcul STD :');
        const html = lire('index.html');
        expect(html).toContain('<strong>SEL</strong> (Par sélection de productions) : ');           // G3
        expect(html).not.toContain('<strong>STD</strong>');                                         // G4 attend la nouvelle pratique
        const bulles = lire('js/accompagnement-contenu-hover.js');
        // G5, périmètre de la release : sans le segment « STD = PAN par standards (…) ».
        expect(bulles).toContain('SOM = sommative (moyenne pondérée traditionnelle), SEL = par sélection de productions (la note retient certaines productions), SPE = PAN basée sur des spécifications (contrat), DEN = dénotation (pratiques réduisant ou éliminant la notation).');
        expect(bulles).not.toMatch(/STD = /);
        expect(bulles).toContain('(SOM, SEL, SPE, DEN)');                                           // G6
        for (const f of ['js/etats-vides.js', 'js/accompagnement-contenu-hover.js', 'js/wizard-pratique-v2.js']) {
            expect(lire(f), f).not.toMatch(/\(SOM, STD/);
        }
    });
});

/* ================================================================ JOURNAL DES BREAK-TESTS
 *
 * Le journal S1 à S4 du lot 1 (21 nov. 2026, matin) portait sur la forme à deux familles ; il est rejoué ici sur la forme
 * de la release. Chaque mutation posée dans `js/` ou `index.html`, ce fichier lancé seul, le rouge relevé, la mutation
 * retirée (`git diff` vide après chacune).
 * 11 essais verts avant (21 nov. 2026, 8 h 50).
 * S1 — pratique-registre.js : le sigle de `standards` remis à « STD ».                          ROUGE (3) : A (sigles), A (badge), B (fiche).
 * S2 — wizard-pratique-v2.js : A5 remis à « (SOM, STD, SEL, SPE ou DEN) ».                      ROUGE (2) : B (assistant), D.
 * S3 — pratiques-gestion.js, `genererBadgeTypePratique` : `${sigle}` → `${type}`.               ROUGE (1) : B (fiche).
 * S4 — main.js, `genererBadgePratique` : `${sigle}` → `${code}`.                                ROUGE (1) : B (badge global…).
 * S5 — pratique-registre.js : une famille `cibles` (code CIB, sigle STD) ajoutée.               ROUGE (2) : C (« CIB »), C (quatre familles).
 * S6 — accompagnement-contenu-hover.js : le segment « STD = PAN par standards (…) » remis à G5. ROUGE (1) : D.
 * S7 — index.html : la ligne G4 « <strong>STD</strong> (Par standards) » remise à la carte.     ROUGE (2) : C (« Par standards »), D.
 */
