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
            description: 'Ta note finale est le cumul pondéré de tes évaluations. C\'est la méthode traditionnelle, souvent appelée sommative.' });
        expect(win.TYPE_BADGES.standards).toMatchObject({ code: 'HYB', classe: 'sel', label: 'Hybride',
            description: 'Tu évalues chaque production par niveaux (ex.\u00a0: I-D-M-E). La note se construit à partir des productions que ta règle retient ; d\'autres peuvent compter d\'office.' });
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
        expect(html).toContain('<strong>CUM</strong> (Cumulative) utilise une moyenne pondérée traditionnelle.');
        expect(html).toContain('<strong>HYB</strong> (Hybride) : des niveaux (ex. I-D-M-E) ; la note retient certaines productions.');
        expect(html).toContain('<strong>Hybride</strong>&nbsp;: la note retient les résultats');
        expect(html).toMatch(/<option value="hybride"[^>]*>Deux blocs \(N meilleures \+ Obligatoires\)<\/option>/);
        expect(html).not.toContain('Hybride (N meilleures + Obligatoires)');
    });
    it('la bibliothèque : noms, résumés et bulles', () => {
        const src = lire('js/pratiques-gestion.js');
        expect(src).toContain("'sommative': { nom: 'Cumulative', anglais: 'Traditional Grading', resume: 'Cumul pondéré des évaluations' }");
        expect(src).toContain("'standards': { nom: 'Hybride', resume: 'Des niveaux (ex. I-D-M-E) ; la note retient certaines productions' }");
        expect(src).toContain("SOM: 'Cumulative — note finale par cumul pondéré des évaluations.',");
        expect(src).toContain("STD: 'Hybride : des niveaux (ex. I-D-M-E) ; la note retient certaines productions.',");
    });
    it('la vue simple : le modèle « Hybride » et ses messages', () => {
        const src = lire('js/vue-simple.js');
        expect(src).toContain("titre: 'Hybride', texte: 'Chaque production reçoit un niveau.");
        expect(src).toContain('Choisis un modèle : par standards, par spécifications ou hybride. Tu règles ensuite ce qui construit la note.');
        expect(src).toContain('Le tableau sert aux pratiques par standards, par spécifications et hybrides.');
    });
});

describe('C · les pratiques fournies (source seulement)', () => {
    it('les gabarits prédéfinis, les noms des pratiques codées', () => {
        expect(lire('js/pratiques/pratiques-predefines.js')).toMatch(/nom: 'Cumulative traditionnelle'/);
        expect(lire('js/pratiques/pratiques-predefines.js')).toMatch(/nom: 'Cumulative avec remplacement'/);
        // « Hybride (démo) » attend la release : js/pack-demo-10.js se sert sous le jeton du BUILD, et un commit qui le touche
        // doit partir dans le même push qu'une release (sentinelle #825, hook pre-push). Ce lot n'en fait pas (mandat).
        expect(lire('js/pratiques/pratique-sommative.js')).toContain('return "Cumulative traditionnelle";');
        expect(lire('js/pratiques/pratique-pan-standards.js')).toContain('return "Hybride";');
    });
    it('« Modèle sommatif » GARDE son nom : `estModeleFourniIntact` compare le nom d\'une copie rangée à celui du modèle', () => {
        // Mesuré le 27 nov. : renommer le modèle ferait « pas intacte » toute copie déjà rangée sous l\'id SOM-litterature
        // (celle de l\'iPad de Grégoire, 22 nov.), et rouvrirait « Supprimer » sur une ligne qui revient. Arrêté, rapporté.
        const win = chargerScript('js/pratiques-bibliotheque.js');
        const modele = win.MODELES_PRATIQUES_PREDEFINIS['SOM-litterature'];
        expect(modele.nom).toBe('Modèle sommatif');
        expect(win.estModeleFourniIntact(Object.assign(JSON.parse(JSON.stringify(modele)), { nom: 'Modèle cumulatif' }))).toBe(false);
    });
});

/* ---------------------------------------------------------------- D. Le nom disparaît de l'écran */
function occurrencesHorsCommentaires(f, motif) {
    return lire(f).split('\n').filter(l => !/^\s*(\/\/|\*|\/\*|<!--)/.test(l) && motif.test(l));
}
describe('D · « Par sélection de productions » ne s\'affiche plus', () => {
    it('aucun fichier chargé par index.html ne l\'écrit hors commentaires (les Nouvelles passées et la démo mises à part)', () => {
        const fichiers = [...new Set(lire('index.html').match(/js\/[\w./-]+\.js/g))].concat(['index.html'])
            .filter(f => f !== 'js/changelog-data.js')    // l'historique des versions dit ce qui était vrai
            .filter(f => f !== 'js/pack-demo-10.js');     // la démo attend la release (jeton du build, sentinelle #825)
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
 *   B5 index.html — un titre de l'Aide redit « Par sélection de… »        → 1 rouge (D)
 *   B6 parcours-evaluer.js — la bulle 2 de « Nous faisons » redit SEL     → 1 rouge dans sentinelle-parcours-evaluer-2026-11-09
 *      (la retouche T27 du module d'aide `familles-cum-hyb-2026-11-27.js`).
 */
