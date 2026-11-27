/**
 * SENTINELLE (21 nov. 2026) — LA PRATIQUE « PAR SÉLECTION DE PRODUCTIONS » N'EST PLUS DITE « PAN ».
 *
 * Choix de Grégoire (21 nov. 2026, remarque à 7 h 42, décision à 7 h 44 ; les sources ne tranchent pas) : « La preuve
 * n'est pas faite que SEL est vraiment une PAN. […] Demeurons prudent dans l'affirmation. » L'application n'affirme plus
 * que cette pratique est une PAN, ni qu'elle n'en est pas une, ni qu'elle est hybride. Consigne :
 * plans de travail/CONSIGNE-LOT-2026-11-21-moteur-cibles-1-corrections-2.md. Textes : TEXTES-2026-11-21-selection-sans-PAN.md,
 * lus dans le fichier, jamais recopiés ici.
 *
 * VERROUILLÉ ICI :
 *   A. Le nom de famille, là où il s'affiche (bibliothèque, ligne sous le titre de la fiche, aperçu) : « Par sélection de
 *      productions », sans « PAN », sans « Standards », quelle que soit la forme de la pratique rangée.
 *   B. Les bulles G1 et G2 ; l'assistant (A1, A2, A3).
 *   C. Chaque endroit corrigé : le nom qu'il affiche pour cette pratique ne contient ni « PAN » ni « Standards ».
 *   D. Ce qui NE change PAS (point 4 de la consigne) : la logique qui peut afficher un badge « PAN » est intacte ; les
 *      autres familles gardent leurs noms ; le code interne STD reste.
 *
 * ↻ 27 nov. 2026 (décisions de Grégoire, 14 h 07 à 14 h 21) : cette pratique s'appelle maintenant « Hybride » (badge HYB).
 * Ce qui reste verrouillé ici : son nom ne dit ni « PAN » ni « standards ». Les textes des repères que porte
 * TEXTES-2026-11-27-familles-cum-hyb.md se lisent dans ce fichier-là, qui remplace pour eux celui du 21 nov. (intact).
 * BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerAvecInterne, RACINE } from './_helpers/bac-suivi.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const INTERDIT = /\bPAN\b|standards/i;
const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const db = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
const REG = chargerScript('js/pratiques/pratique-registre.js', { db, cle: (k) => k });

/** Les textes `> …` d'un repère du fichier validé du 21 nov. */
const TEXTES = lire('plans de travail/TEXTES-2026-11-21-selection-sans-PAN.md');
const TEXTES_27 = lire('plans de travail/TEXTES-2026-11-27-familles-cum-hyb.md');
const REMPLACES_27 = ['A1', 'A2', 'A3', 'F3', 'F4', 'F10', 'P1', 'P2', 'G1', 'G5', 'T2', 'H1', 'H2'];
const citer = (fichier, repere) => fichier.split(/^## /m).find(s => s.startsWith(repere + ' ·')).split('\n').filter(l => l.startsWith('> ')).map(l => l.slice(2).trim());
const texte = (repere) => citer(REMPLACES_27.includes(repere) ? TEXTES_27 : TEXTES, repere);
// Le nom de la pratique à l'écran : « Hybride » depuis le 27 nov. 2026 (lu dans le menu « Type », repère F3).
const NOM = texte('F3')[0];

function gestion() {
    const win = {};
    chargerAvecInterne('js/pratiques-gestion.js', {
        db, cle: (k) => k, echapperHtml, sigleDuCode: REG.sigleDuCode, normaliserIdPratique: REG.normaliserIdPratique,
        obtenirRepresentationPratiqueStricte: REG.obtenirRepresentationPratiqueStricte, BibliothequeUI: { formaterInspireDe: () => '' },
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} }
    }, win, ['familleDeLaPratique', 'lignePratiqueBibliotheque', 'obtenirDescriptionCourtePratique', 'apercuPratiqueBibliotheque', 'genererBadgeTypePratique']);
    return win.__audit['pratiques-gestion.js'];
}
const G = gestion();
// Les formes qu'une pratique de cette famille a chez les gens : `pratiques[0]`, le type, un id ancien, la démo (`configuration.type`).
const FORMES_SEL = [{ pratiques: ['STD'] }, { type: 'standards' }, { type: 'pan-standards' }, { configuration: { type: 'standards' } }];
const titreDe = (html) => (/title="([^"]*)"/.exec(html) || [])[1];
/** Un texte ramené à ses mots : apostrophes échappées ou typographiques, insécables, entités et gras retirés. */
const net = (t) => t.replace(/\\'/g, '\'').replace(/’/g, '\'').replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').replace(/\\u00a0/g, ' ')
    .replace(/<\/?strong>/g, '').replace(/\s+/g, ' ');

/* ================================================================ A. LE NOM DE FAMILLE */
describe('A · le nom de famille de SEL, là où il s\'affiche', () => {
    it('la bibliothèque (la ligne de la rangée) : « Par sélection de productions », quelle que soit la forme rangée', () => {
        for (const p of FORMES_SEL) {
            expect(G.familleDeLaPratique(p).nom, JSON.stringify(p)).toBe(NOM);
            expect(G.lignePratiqueBibliotheque(p, ''), JSON.stringify(p)).toBe(NOM);
        }
    });
    it('la ligne sous le titre de la fiche et l\'aperçu : le nom, sans parenthèse anglaise ni « Standards »', () => {
        const ligne = G.obtenirDescriptionCourtePratique({ type: 'standards' });
        expect(ligne.startsWith(NOM + ' - ')).toBe(true);
        expect(ligne).not.toMatch(INTERDIT);
        expect(ligne).not.toMatch(/Grading/);
        const apercu = G.apercuPratiqueBibliotheque({ pratiques: ['STD'], configuration: {} }, { echelles: [], grilles: [] });
        expect(JSON.stringify(apercu)).toContain(NOM + ' - ');
        expect(JSON.stringify(apercu)).not.toMatch(INTERDIT);
    });
});

/* ================================================================ B. LES BULLES, L'ASSISTANT */
describe('B · les bulles G1, G2 et l\'assistant (A1, A2, A3)', () => {
    it('G1 : la bulle du badge SEL ; G2 : la bulle du badge PAN, sans liste de sigles', () => {
        expect(titreDe(G.genererBadgeTypePratique({ pratiques: ['STD'] }))).toBe(texte('G1')[0]);
        expect(titreDe(G.genererBadgeTypePratique({ pratiques: ['PAN'] }))).toBe(texte('G2')[0]);
        expect(texte('G1')[0]).not.toMatch(INTERDIT);
        expect(texte('G2')[0]).not.toMatch(/\b(SOM|STD|SEL|SPE|DEN)\b/);
    });
    it('G5 : la bulle de « Type de pratique », mot pour mot', () => {
        const bulle = lire('js/accompagnement-contenu-hover.js').replace(/\\'/g, '\'');
        expect(bulle).toContain(`'cn-pratique-type':\n        '${texte('G5')[0]}'`);
        expect(/HYB = ([^(]*)\(/.exec(texte('G5')[0])[1]).not.toMatch(INTERDIT);   // ↻ 27 nov. 2026 : le sigle HYB
    });
    it('l\'assistant : le nom du récapitulatif, la carte de la voie rapide, le titre de la configuration', () => {
        const win = { addEventListener() {}, removeEventListener() {}, echapperHtml };
        chargerScript('js/wizard-pratique-v2.js', { db, cle: (k) => k, echapperHtml, normaliserIdPratique: (t) => t }, win);
        expect(win.TYPE_BADGES.standards.label).toBe(texte('A1')[0]);
        const voieRapide = win.ETAPES_WIZARD['voie-rapide'].champs[0].options.find(o => o.value === 'niveaux');
        expect(voieRapide.label).toBe(texte('A2')[0]);
        expect(lire('js/wizard-pratique-v2.js')).toContain(`html += '<h4>${texte('A3')[0]}</h4>';`);
        for (const t of [win.TYPE_BADGES.standards.label, voieRapide.label, texte('A3')[0]]) expect(t).not.toMatch(INTERDIT);
    });
});

/* ================================================================ C. CHAQUE ENDROIT CORRIGÉ */
// [fichier, motif dont le groupe 1 est le nom affiché pour SEL à cet endroit, nombre d'endroits]. Mesuré le 21 nov. 2026.
const ENDROITS = [
    ['index.html', /<option value="standards">([^<]*)<\/option>/g, 1],                                     // F3
    ['index.html', /<strong>([^<]*)<\/strong>&nbsp;: la note retient les résultats/g, 1],                    // F4
    ['index.html', /est utilisée dans la pratique ([^.]*)\./g, 1],                                           // la carte « Note » des échelles
    ['index.html', /<h4 class="u-mb-10 u-texte-bleu">Cumulative<\/h4>[\s\S]*?<h4 class="u-mb-10 u-texte-bleu">([^<]*)<\/h4>/g, 1], // Aide (↻ 27 nov.)
    ['index.html', /<p><strong>([^<]*)\.<\/strong> Si ta pratique compte au moins une production/g, 1],     // Aide
    ['js/pratiques/pratique-pan-standards.js', /obtenirNom\(\) \{\s*return "([^"]*)";/g, 1],                 // F10, donc E1
    ['js/profil-etudiant-actions.js', /pratique: '([^']*)',/g, 2],                                           // P1, P2
    ['js/profil-etudiant-actions.js', /propre aux ([^:]*) :/g, 1],
    ['js/profil-etudiant-actions.js', /return 'Pratique ([^,]*), mais/g, 2],
    ['js/etudiants.js', /\(isPAN \? '([^']*)'/g, 1],                                                         // l'aide des indices
    ['js/etudiants.js', /<strong>([^<]*)<\/strong> : Moyenne des/g, 1],
    ['js/etudiants.js', /pratique pédagogique choisie \(Cumulative, ([^,]*), ou autre\)/g, 1],   // ↻ 27 nov.
    ['js/comparateur-pratiques.js', /Pour certaines pratiques — surtout ([^—]*) —/g, 1],                      // la note de l'Exploration
    ['js/donnees-v2.js', /'pan-standards': '([^']*)'/g, 1],
    ['js/profil-etudiant-sections-affichage.js', /indices\.pratique === 'PAN' \? '([^']*)'/g, 1],
    ['js/productions.js', /et facultative\. ([^,]*), elle entre dans le calcul/g, 1],                         // la bulle de la terminale
    ['js/pack-demo-10.js', /"id": "demo-std-litt",\s*"nom": "([^"]*)"/g, 1]                                  // la démo
];
describe('C · aux endroits corrigés, le nom affiché pour SEL ne contient ni « PAN » ni « Standards »', () => {
    it.each(ENDROITS.map(([f, m, n]) => [f + ' ' + m.source.slice(0, 40), f, m, n]))('%s', (_, fichier, motif, n) => {
        const noms = [...lire(fichier).matchAll(motif)].map(x => x[1]);
        expect(noms).toHaveLength(n);
        for (const nom of noms) {
            expect(nom, fichier).not.toMatch(INTERDIT);
            expect(nom.replace(/[«»]/g, '').trim().toLowerCase(), fichier).toContain(NOM.toLowerCase().replace(/ \(démo\)$/, ''));
        }
    });
    it('les textes dictés (F4, F10, P1, P2) et la bulle de la terminale (T2) se lisent à leur source, mot pour mot', () => {
        expect(net(lire('index.html'))).toContain(net(texte('F4')[0]));
        expect(net(lire('js/productions.js'))).toContain(net(texte('T2')[0]));
        expect(lire('js/pratiques/pratique-pan-standards.js')).toContain(`return "${texte('F10')[0]}";`);
        expect(lire('js/profil-etudiant-actions.js').split(`pratique: '${texte('P1')[0]}',`)).toHaveLength(3);
    });
});

/* ================================================================ D. CE QUI NE CHANGE PAS */
describe('D · ce qui ne change pas', () => {
    it('point 4 : la logique qui peut afficher un badge « PAN » (fiche, `pratiques[0]` à « PAN ») est intacte', () => {
        expect(lire('js/pratiques-gestion.js')).toContain("const typesValides = ['SOM', 'STD', 'SPE', 'DEN', 'CIB', 'PAN'];");
        expect((/>([^<]*)<\/span>$/.exec(G.genererBadgeTypePratique({ pratiques: ['PAN'] })) || [])[1]).toBe('PAN');
        // ↻ 27 nov. 2026 : le libellé de famille du registre est « Hybride » (trois familles) ; un seul écran le lit, le repli
        // de `_nomPratique` du Comparateur (mesuré le 27 nov.).
        expect(REG.obtenirLabelFamillePratique('standards')).toBe('Hybride');
    });
    it('les autres familles gardent leurs noms ; le code interne de SEL reste STD', () => {
        expect(G.familleDeLaPratique({ type: 'specifications' }).nom).toBe('PAN-Spécifications');
        expect(G.familleDeLaPratique({ type: 'denotation' }).nom).toBe('PAN-Dénotation');
        expect(G.familleDeLaPratique({ type: 'cibles' }).nom).toBe('Par standards');
        expect(REG.obtenirCodePratique('standards')).toBe('STD');
    });
});

/* ================================================================ JOURNAL DES BREAK-TESTS (21 nov. 2026)
 *
 * Chaque mutation posée dans le code, ce fichier lancé seul, le rouge relevé, la mutation retirée (empreinte sha256
 * identique à chaque restauration). 25 essais verts avant.
 *
 * X1 — pratiques-gestion.js : le nom de famille redevient « PAN-Standards ».
 *      ROUGE (2) : A « la bibliothèque… », A « la ligne sous le titre… ».
 * X2 — pratiques-gestion.js : la parenthèse anglaise « (Standards-Based Grading) » revient, le nom restant juste.
 *      ROUGE (1) : A « la ligne sous le titre… ».
 * X3 — pratiques-gestion.js : la bulle G1 redit « PAN – Sélection de productions ».
 *      ROUGE (1) : B « G1… ».
 * X4 — index.html : l'encadré F4 redit « PAN – Sélection de productions ».
 *      ROUGE (2) : C l'endroit F4, C « les textes dictés… ».
 * X5 — etudiants.js : l'aide des indices redit « PAN-Standards » devant « Moyenne des ».
 *      ROUGE (1) : C l'endroit de etudiants.js.
 * X6 — wizard-pratique-v2.js : la carte de la voie rapide redit « PAN – Sélection de productions ».
 *      ROUGE (1) : B « l'assistant… ».
 * X7 — pack-demo-10.js : la pratique de la démo redevient « PAN – Standards (démo) ».
 *      ROUGE (1) : C l'endroit de la démo.
 */
