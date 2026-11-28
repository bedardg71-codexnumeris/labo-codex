/**
 * SENTINELLE (27 nov. 2026) — TROIS FAMILLES À L'ÉCRAN : PAN, CUMULATIVE, HYBRIDE.
 *
 * Décisions de Grégoire (27 nov. 2026, 14 h 07 à 14 h 21). Affichage seulement, aucun calcul :
 *   - « Sommative » s'appelle « Cumulative » (badge CUM) ; « Par sélection de productions » s'appelle « Hybride »
 *     (badge HYB) ; les PAN gardent leur sigle de pratique (STD, SPE, DEN).
 *   - Le champ `famille` du registre prend trois valeurs : « Cumulative », « Hybride », « PAN ».
 *   - Le code interne ne bouge pas (SOM, STD, SPE, DEN, CIB ; ids `sommative`, `standards`…) : aucune donnée n'est
 *     réécrite ; les classes CSS suivent le code, donc les couleurs ne changent pas.
 *   - Une pratique déjà créée chez quelqu'un garde son nom : on change la SOURCE (les pratiques fournies), pas le STOCK.
 * Rapport : plans de travail/RAPPORT-2026-11-27-familles-cum-hyb.md.
 *
 * VERROUILLÉ ICI :
 *   A. Le registre : code, sigle et famille des cinq pratiques ; son badge.
 *   B. Les producteurs de libellés hors registre : l'assistant, la fiche (bulles, bibliothèque), la vue simple.
 *   C. Les sources : les pratiques fournies portent les nouveaux noms.
 *   D. Aucun écran de js/ ni d'index.html ne dit plus « Par sélection de productions » (commentaires mis à part).
 * BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';
import { RACINE } from './_helpers/bac-suivi.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const db = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
const REG = chargerScript('js/pratiques/pratique-registre.js', { db, cle: (k) => k });
const CINQ = ['sommative', 'standards', 'specifications', 'denotation', 'cibles'];

describe('A · le registre : trois familles, le code ne bouge pas', () => {
    it('les codes INTERNES restent SOM, STD, SPE, DEN, CIB', () => {
        expect(CINQ.map(REG.obtenirCodePratique)).toEqual(['SOM', 'STD', 'SPE', 'DEN', 'CIB']);
    });
    it('les sigles AFFICHÉS : CUM, HYB, puis la pratique pour les PAN', () => {
        expect(CINQ.map(REG.obtenirSiglePratique)).toEqual(['CUM', 'HYB', 'SPE', 'DEN', 'STD']);
        expect(['SOM', 'STD', 'SPE', 'DEN', 'CIB', 'PAN'].map(REG.sigleDuCode)).toEqual(['CUM', 'HYB', 'SPE', 'DEN', 'STD', 'PAN']);
    });
    it('le champ `famille` : Cumulative, Hybride, PAN', () => {
        expect(CINQ.map(REG.obtenirLabelFamillePratique)).toEqual(['Cumulative', 'Hybride', 'PAN', 'PAN', 'PAN']);
        expect(REG.obtenirLabelFamillePratique('pan-standards')).toBe('Hybride');   // un id ancien, normalisé
    });
    it('le badge montre le sigle ; sa classe (donc sa couleur) suit le code interne', () => {
        expect(REG.genererBadgePratiqueHTML('sommative')).toBe('<span class="badge-type-pratique badge-type-som">CUM</span>');
        expect(REG.genererBadgePratiqueHTML('standards')).toBe('<span class="badge-type-pratique badge-type-std">HYB</span>');
        expect(REG.obtenirCouleurPratique('sommative')).toBe('var(--som-orange)');
        expect(REG.obtenirCouleurPratique('standards')).toBe('var(--sel-sarcelle)');
    });
});

describe('B · les libellés hors registre', () => {
    it('l\'assistant : les deux familles, les cartes de « Choisis directement ta famille », le lien de la voie rapide, le mode « Deux blocs »', () => {
        const win = { addEventListener() {}, removeEventListener() {}, echapperHtml };
        chargerScript('js/wizard-pratique-v2.js', { db, cle: (k) => k, echapperHtml, normaliserIdPratique: (t) => t }, win);
        expect(win.TYPE_BADGES.sommative).toMatchObject({ code: 'CUM', classe: 'som', label: 'Cumulative',
            description: 'Ta note finale est le cumul pondéré de toutes tes évaluations, sans reprise. C\'est la méthode habituelle, souvent appelée sommative.' });   // ↻ 28 nov. 2026 (familles par réglages, texte 10)
        expect(win.TYPE_BADGES.standards).toMatchObject({ code: 'HYB', classe: 'sel', label: 'Hybride',
            description: 'Ta note se construit par cumul, mais une note peut être révisée : ta règle retient certaines productions, ou tes élèves ont des jetons de reprise. D\'autres productions peuvent compter d\'office.' });   // ↻ 28 nov. 2026 (texte 11)
        const cartes = win.ETAPES_WIZARD['voie-rapide'].champs[0].options;   // les lignes 230 et 231 du mandat
        expect(cartes.find(o => o.value === 'moyenne')).toMatchObject({ label: 'Cumulative (CUM)', description: 'Note finale par cumul pondéré des évaluations.' });
        expect(cartes.find(o => o.value === 'niveaux')).toMatchObject({ label: 'Hybride (HYB)', description: 'Des niveaux (ex. I-D-M-E) ; la note retient certaines productions.' });
        const lien = win.ETAPES_WIZARD['calcul-note-finale'].champs.find(c => c.id === 'voie-rapide-lien');
        expect(lien.description).toBe('Choisis directement ta famille de pratique (CUM, HYB ou PAN : STD, SPE, DEN) et passe à sa configuration.');
        const src = lire('js/wizard-pratique-v2.js');
        expect(src).toContain("html += '<h4>Configuration – Hybride</h4>';");
        expect(src).toContain('avant de créer cette pratique hybride. ');
        // Le mode deux blocs ne dit plus « Hybride » dans la famille « Hybride » (texte 12, étendu à l'assistant).
        const mode = win.ETAPES_WIZARD['config-portfolio'].champs.find(c => c.id === 'modeSelectionPortfolio');
        expect(mode.options.find(o => o.value === 'hybride').label).toBe('Deux blocs (N meilleures + Obligatoires)');
        expect(mode.aide).toMatch(/^Deux blocs : combine les N meilleures productions/);
        expect(src).toContain("'hybride': 'Deux blocs (N meilleures + Obligatoires)'");
        expect(src).not.toContain('Hybride (N meilleures + Obligatoires)');
    });
    it('la fiche : le menu « Type », la légende, l\'encadré, le mode « Deux blocs »', () => {
        const html = lire('index.html');
        expect(html).toMatch(/<option value="sommative">Cumulative<\/option>/);
        expect(html).toMatch(/<option value="standards">Hybride<\/option>/);
        // ↻ 28 nov. 2026 (familles par réglages, textes 4 et 5 de Grégoire).
        expect(html).toContain('<strong>CUM</strong> (Cumulative) : toutes les évaluations sommatives comptent, chacune à sa pondération, sans reprise.');
        expect(html).toContain('<strong>HYB</strong> (Hybride) : un cumul où une note peut être révisée, en retenant certaines productions ou en offrant des reprises.');
        expect(html).toContain('<strong>Hybride</strong>&nbsp;: la note retient les résultats');
        expect(html).toMatch(/<option value="hybride"[^>]*>Deux blocs \(N meilleures \+ Obligatoires\)<\/option>/);
        expect(html).not.toContain('Hybride (N meilleures + Obligatoires)');
    });
    it('la bibliothèque : noms, résumés et bulles', () => {
        const src = lire('js/pratiques-gestion.js');
        // ↻ 28 nov. 2026 (familles par réglages, textes 6 à 9 de Grégoire) : les résumés ; les bulles CUM et HYB disent le
        // motif et vivent au registre (banc sentinelle-familles-par-reglages-2026-11-28).
        expect(src).toContain("'sommative': { nom: 'Cumulative', anglais: 'Traditional Grading', resume: 'Cumul pondéré de toutes les évaluations, sans reprise' }");
        expect(src).toContain("'standards': { nom: 'Hybride', resume: 'Un cumul où une note peut être révisée' }");
        const registre = lire('js/pratiques/pratique-registre.js');
        expect(registre).toContain("'tout-compte': 'Cumulative : toutes les évaluations sommatives comptent, sans reprise.',");
        expect(registre).toContain("'retenu': 'Hybride : cette pratique retient certaines productions.',");
    });
    it('la vue simple : le modèle « Hybride » et ses messages', () => {
        const src = lire('js/vue-simple.js');
        // ↻ 28 nov. 2026 (décision de Grégoire, 8 h 40) : le modèle s'appelle « Cumulative par niveaux » (il installe « Toutes
        // les productions », jetons refusés : sa famille déduite est la cumulative).
        expect(src).toContain("titre: 'Cumulative par niveaux', texte: 'Chaque production reçoit un niveau.");
        expect(src).toContain('Choisis un modèle : par standards, par spécifications ou cumulative par niveaux. Tu règles ensuite ce qui construit la note.');
        expect(src).toContain('Le tableau sert aux pratiques par standards, par spécifications et par niveaux (cumulatives ou hybrides).');
    });
});

describe('C · les pratiques fournies (source seulement)', () => {
    it('les gabarits prédéfinis, les noms des pratiques codées', () => {
        // ↻ 28 nov. 2026 (second lot du renommage) : « traditionnelle » → « habituelle ».
        expect(lire('js/pratiques/pratiques-predefines.js')).toMatch(/nom: 'Cumulative habituelle'/);
        expect(lire('js/pratiques/pratiques-predefines.js')).toMatch(/nom: 'Cumulative avec remplacement'/);
        // ↻ release 1.260.0 (27 nov. 2026) : la pratique de la démo s'appelle « Hybride (démo) ». Source seulement : la version
        // du pack reste 21.3, une démo déjà installée garde son ancien nom jusqu'à « Remettre la démo à neuf ».
        expect(lire('js/pack-demo-10.js')).toMatch(/"id": "demo-std-litt",\s*"nom": "Hybride \(démo\)"/);
        expect(lire('js/pratiques/pratique-sommative.js')).toContain('return "Cumulative habituelle";');
        expect(lire('js/pratiques/pratique-pan-standards.js')).toContain('return "Hybride";');
    });
    // ↻ 28 nov. 2026 (second lot du renommage, décision de Grégoire) : RÉÉCRITE, pas retirée. Le 27 nov., elle figeait
    // « Modèle sommatif garde son nom » : renommer le modèle aurait fait « pas intacte » la copie rangée chez Grégoire
    // (iPad, id SOM-litterature, 22 nov.) et rouvert « Supprimer » sur une ligne qui revient. La règle neuve : le modèle
    // s'appelle « Modèle cumulatif », et la garde tient pour intacte la copie à l'ANCIENNE paire nom et description —
    // elle seule : une copie renommée à la main reste modifiée. Le détail au banc sentinelle-modele-fourni-intact.
    it('« Modèle cumulatif » : renommé, et la copie rangée à l\'ancienne paire reste intacte (pas une copie renommée)', () => {
        const win = chargerScript('js/pratiques-bibliotheque.js');
        const modele = win.MODELES_PRATIQUES_PREDEFINIS['SOM-litterature'];
        expect(modele.nom).toBe('Modèle cumulatif');
        expect(modele.description).toBe('Pour débuter avec une pratique cumulative');
        const copie = (extra) => Object.assign(JSON.parse(JSON.stringify(modele)), extra);
        expect(win.estModeleFourniIntact(copie({ nom: 'Modèle sommatif', description: 'Pour débuter avec une pratique sommative' })),
            'l\'ancienne paire').toBe(true);
        expect(win.estModeleFourniIntact(copie({ nom: 'Modèle sommatif' })), 'l\'ancien nom seul').toBe(false);
        expect(win.estModeleFourniIntact(copie({ nom: 'Modèle cumulatif à moi' })), 'un nom à soi').toBe(false);
    });
});

/* ---------------------------------------------------------------- D. Le nom disparaît de l'écran */
function occurrencesHorsCommentaires(f, motif) {
    return lire(f).split('\n').filter(l => !/^\s*(\/\/|\*|\/\*|<!--)/.test(l) && motif.test(l));
}
describe('D · « Par sélection de productions » ne s\'affiche plus', () => {
    it('aucun fichier chargé par index.html ne l\'écrit hors commentaires (les Nouvelles passées mises à part)', () => {
        const fichiers = [...new Set(lire('index.html').match(/js\/[\w./-]+\.js/g))].concat(['index.html'])
            .filter(f => f !== 'js/changelog-data.js');   // l'historique des versions dit ce qui était vrai
        const vus = {};
        for (const f of fichiers) {
            let lignes;
            try { lignes = occurrencesHorsCommentaires(f, /[Ss]élection de productions/); } catch (e) { continue; }
            if (f === 'index.html') lignes = lignes.filter(l => !/<script src=/.test(l));
            if (lignes.length) vus[f] = lignes.map(l => l.trim().slice(0, 120));
        }
        expect(vus).toEqual({});
    });
});

/* ================================================================ JOURNAL DES BREAK-TESTS (27 nov. 2026)
 *
 * AVANT tout changement de js/ (registre à SOM/SEL, famille « Sommative »/« PAN ») : ce fichier lancé seul, 9 rouges sur
 * 10 (seul « les codes INTERNES restent » vert, comme voulu).
 *
 * APRÈS (11 essais verts) : chaque mutation posée, le banc relancé, la mutation retirée (sha256 identique à chaque fois).
 *   B1 pratique-registre.js — le sigle de `standards` redevient SEL       → 2 rouges ici (A sigles, A badge), 3 dans la
 *      sentinelle des sigles du 21 nov.
 *   B2 pratique-registre.js — la famille de `standards` redevient « PAN »  → 1 rouge (A famille)
 *   B3 wizard-pratique-v2.js — le mode redit « Hybride (N meilleures… »   → 1 rouge (B assistant)
 *   B4 pratiques-bibliotheque.js — « Modèle sommatif » renommé            → 1 rouge (C « Modèle sommatif » garde son nom)
 *      ↻ 28 nov. 2026 : le test de C est réécrit pour la règle neuve (le renommage est fait) ; son break-test est au journal
 *      de sentinelle-modele-fourni-intact.test.js.
 *   B5 index.html — un titre de l'Aide redit « Par sélection de… »        → 1 rouge (D)
 *   B6 parcours-evaluer.js — la bulle 2 de « Nous faisons » redit SEL     → 1 rouge dans sentinelle-parcours-evaluer-2026-11-09
 *      (la retouche T27 du module d'aide `familles-cum-hyb-2026-11-27.js`).
 */
