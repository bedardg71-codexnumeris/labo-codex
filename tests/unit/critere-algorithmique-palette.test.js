/**
 * LE CRITÈRE ALGORITHMIQUE, ÉTAPE 2b (22 oct. 2026) — LA PALETTE.
 *
 * Consigne : plans de travail/CONSIGNE-DU-JOUR.md (22 oct., 20 h 51) ; plan :
 * PLAN-2026-10-21-critere-algorithmique-toute-discipline.md, étape 2 ; textes provisoires :
 * TEXTES-2026-10-22-palette-critere-algorithmique.md.
 *
 * Ce que ce banc verrouille (le module réel `js/palette-algo.js`, le gabarit réel `js/grilles.js`,
 * le composeur réel `js/composeur-badges.js`) :
 *   P — LA SENTINELLE : UNE palette par critère algorithmique, sur le côté de son gabarit ; plus aucune
 *       rangée « Poser : » ; rendue sans cible (tout inactif, l'invitation) ; chaque zone, devenue cible,
 *       n'active QUE les blocs de `reperesDeCle` (énoncé) ou de `listerReperes` (palier), et dit les autres.
 *   N — LES NOMS : chaque bloc est nommé en mots, jamais par son nom de code ; deux groupes ; « des » ne
 *       s'élide pas, jamais « de » devant un nom de l'enseignant·e ; les blocs des paliers gardent leurs
 *       libellés ; les chips de la phrase montrent le nom du bloc, le jeton reste la valeur.
 *   G — LE GARDE-FOU DU PLAN : une rédaction (« erreur / mot ») et une chimie (« unité manquante / calcul »,
 *       sans projection) ; aucun « erreur » ni « mot » dans la palette, les étiquettes ni les chips de la
 *       seconde. Avec une projection, les cinq libellés des paliers parlent encore d'erreurs et de mots :
 *       l'étape 3 les reprend — le banc le DIT (G.c), il ne le cache pas.
 *   X — UN NOM PIÉGÉ reste du texte : dans la palette, dans les étiquettes, dans les chips.
 *   R — LES RETOUCHES DE LA RELECTURE (22 oct., 21 h 51) : le `title` des blocs (l'aide, la mention quand
 *       inactif), les groupes vides marqués ; la feuille de style (bloc inactif réduit, palette compacte,
 *       liste des grilles sous la barre). La position de la palette se mesure dans WebKit (le spec).
 *   S — L'INVARIANT DU STOCK : un critère d'avant ce lot rend à l'élève les mêmes phrases ; le rendu du
 *       gabarit n'écrit rien, ni dans le critère ni dans le stockage ; un bloc posé écrit son JETON.
 *
 * Break-tests : voir DEMANDE-RELECTURE-2026-10-22-critere-algorithmique-palette.md. Grilles, noms et
 * textes FICTIFS.
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { etapeDe, etapeOuverte, atelierDe } from './_helpers/atelier-algo.js';
import { tranche } from './_helpers/tranche.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');
const require = createRequire(import.meta.url);
const E = require(path.join(racine, 'js/evaluation-enonces.js'));
const P = require(path.join(racine, 'js/evaluation-projection.js'));
const PA = require(path.join(racine, 'js/palette-algo.js'));
const C = require(path.join(racine, 'js/composeur-badges.js'));
const clone = (v) => JSON.parse(JSON.stringify(v));
const echapper = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CHIMIE_NOMS = { erreurs: { singulier: 'unité manquante', pluriel: 'unités manquantes' }, mots: { singulier: 'calcul', pluriel: 'calculs' } };
const REDACTION_NOMS = { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } };
const PIEGE = '<img src=x onerror=alert(1)>';

const REDACTION = { id: 'CR', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20, nomsAttendus: true, noms: REDACTION_NOMS,
                    modeleProjection: 'norme_externe', paramsProjection: { nomServiceAide: 'Centre d’aide' }, paliersProjection: P.paliersMigration() };
const CHIMIE = { id: 'CC', nom: 'Unités et chiffres significatifs', type: 'algorithmique', ponderation: 20, nomsAttendus: true, noms: CHIMIE_NOMS,
                 modeleProjection: 'aucune' };
const PIEGEE = { id: 'CP', nom: 'Piège', type: 'algorithmique', ponderation: 20, nomsAttendus: true,
                 noms: { erreurs: { singulier: PIEGE, pluriel: PIEGE }, mots: { singulier: PIEGE, pluriel: PIEGE } }, modeleProjection: 'aucune' };
// D'avant ce lot (et d'avant l'étape 2a) : ni marque, ni noms, ni modèle de phrases ; la projection lue par défaut.
const STOCK = { id: 'CS', nom: 'Français écrit', type: 'algorithmique', ponderation: 20 };

/* ------------------------------------------------------------------ harnais (patron des bancs du texte troué) */

function fauxElement() {
    return {
        value: '', innerHTML: '', textContent: '', style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        querySelectorAll: () => [], querySelector: () => null,
        addEventListener() {}, appendChild() {}, setAttribute() {}, focus() {}
    };
}

function monter(grilles) {
    const CLE = 'a2026_grillesTemplates';
    const store = { [CLE]: clone(grilles) };
    const ecrits = [];
    const elements = {};
    const document = {
        activeElement: null,
        getElementById: (id) => (elements[id] || (elements[id] = fauxElement())),
        querySelector: () => null, querySelectorAll: () => [],
        body: { appendChild() {}, removeChild() {} },
        createElement: () => fauxElement(),
        addEventListener() {}, removeEventListener() {}
    };
    const db = {
        get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { ecrits.push(k); store[k] = v; }, setSync: (k, v) => { ecrits.push(k); store[k] = v; },
        modifier: async (k, mutateur, defaut) => { ecrits.push(k); const r = await mutateur(k in store ? clone(store[k]) : defaut); if (r === undefined) return undefined; store[k] = r; return r; }
    };
    const globaux = { db, document, cle: (k) => 'a2026_' + k, echapperHtml: echapper,
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8), alert() {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc', grilleTemplateActuelle: null };
    const win = chargerScript('js/ui-blocs.js', globaux);
    chargerScript('js/grilles.js', globaux, win);
    win.formulesAlgo = require(path.join(racine, 'js/evaluation-formules.js'));
    win.enoncesAlgo = E;
    win.projectionAlgo = P;
    win.paletteAlgo = PA;
    win.codesAnnotation = require(path.join(racine, 'js/codes-annotation.js'));
    win.atelierAlgo = require(path.join(racine, 'js/atelier-algo.js'));   // #1150 : l'atelier du critère, qui rend le gabarit
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    const montes = [];
    win.composeurBadges = { monterTout: (c, nommer) => { montes.push(nommer); return 0; }, vueDe: () => null, textareaDe: () => null };
    return { win, store, ecrits, montes, liste: () => document.getElementById('listeCriteres') };
}

/** Le HTML du gabarit d'une grille enregistrée (édition : toutes les zones, « Aucune annotation » comprise). */
function rendu(criteres) {
    const grille = { id: 'G1', nom: 'Banc', dansBibliotheque: true, criteres: clone(criteres) };
    const m = monter([grille]);
    // Le chargement de grilles.js lance ses migrations (`migrerCategoriesVersSousCriteres`) : ce n'est pas le rendu.
    m.ecrits.length = 0;
    m.avantRendu = clone(m.store);
    m.win.afficherCriteresGrille(clone(grille));
    return Object.assign(m, { html: m.liste().innerHTML });
}

/** Le gabarit rendu, dans un vrai DOM (jsdom) : la palette et les zones d'UN critère. */
function domDe(m, id) {
    const doc = new JSDOM('<body>' + m.html + '</body>').window.document;
    const gabarits = [...doc.querySelectorAll('.gabarit-algo')];
    const g = gabarits.find((x) => x.dataset.critereId === id);   // ↻ #1150 : l'atelier porte l'id de son critère
    return { doc, gabarit: g, palette: g.querySelector('.palette-algo'), zones: [...g.querySelectorAll('textarea[data-enonce-cle], textarea[data-palier-index]')] };
}

const actifs = (palette) => [...palette.querySelectorAll('.palette-algo-bloc')].filter((b) => b.getAttribute('aria-disabled') !== 'true').map((b) => b.dataset.jeton);
const texteVisible = (el) => el.textContent.replace(/\s+/g, ' ').trim();
const MOTS_REDACTION = /\berreurs?\b|\bmots?\b/i;

/* ======================================================= P — LA SENTINELLE */

describe('palette · P — une palette par critère, plus aucune rangée « Poser : », chaque zone n\'active que ce qu\'elle offre', () => {
    it('P.a une palette par critère algorithmique, avant le corps du gabarit ; aucune rangée ni bouton de rangée', () => {
        const { html } = rendu([REDACTION, CHIMIE, { id: 'H', nom: 'Holistique', type: 'holistique', ponderation: 60 }]);
        expect((html.match(/<aside class="palette-algo"/g) || []).length).toBe(2);
        expect(html).not.toContain('Poser :');
        expect(html).not.toContain('reperes-enonce');
        expect(html).not.toContain('reperes-palier');
        expect(html).not.toMatch(/<button[^>]*class="repere-enonce/);
        const atelier = tranche(html, '<div class="gabarit-algo-atelier">', '<div class="gabarit-algo-corps">');
        expect(atelier).toContain('<aside class="palette-algo" data-palette-algo="0"');
        expect(source('js/grilles.js')).not.toMatch(/Poser :<|rendreBoutonsReperes|reperes-enonce-mot/);
        expect(source('styles.css')).not.toMatch(/\.reperes-enonce|\.reperes-palier/);
    });

    it('P.b rendue SANS CIBLE : tout bloc est inactif, sans mention « hors zone », et la ligne invite à placer le curseur', () => {
        const m = rendu([REDACTION]);
        const { palette } = domDe(m, 'CR');
        expect(actifs(palette)).toEqual([]);
        expect(palette.querySelectorAll('[data-hors-zone]').length).toBe(0);
        expect(palette.dataset.cible).toBeUndefined();
        expect(texteVisible(palette.querySelector('.palette-algo-cible'))).toBe(PA.TEXTES.invitation);
    });

    it('P.c chaque zone devenue cible n\'active QUE ce que son registre lui donne ; les autres blocs sont inactifs et le disent ; la palette la nomme', () => {
        const m = rendu([REDACTION]);
        const { palette, zones } = domDe(m, 'CR');
        // Les quatre énoncés (édition : « Aucune annotation » comprise) et les deux zones des six paliers.
        expect(zones.filter((z) => z.dataset.enonceCle !== undefined).map((z) => z.dataset.enonceCle).sort()).toEqual(['aucune', 'concentre', 'decompte', 'priorite']);
        expect(zones.filter((z) => z.dataset.palierIndex !== undefined).length).toBe(12);
        const tous = [...palette.querySelectorAll('.palette-algo-bloc')].map((b) => b.dataset.jeton);
        for (const zone of zones) {
            m.win.ciblerPaletteAlgo(palette, zone);
            const attendu = zone.dataset.palierIndex !== undefined
                ? P.listerReperes().map((r) => r.jeton)
                : E.reperesDeCle(zone.dataset.enonceCle).map((r) => r.jeton);
            expect([...actifs(palette)].sort(), zone.dataset.nomZone).toEqual([...attendu].sort());
            const horsZone = [...palette.querySelectorAll('[data-hors-zone]')].map((b) => b.dataset.jeton);
            expect([...horsZone].sort()).toEqual(tous.filter((j) => !attendu.includes(j)).sort());
            for (const b of palette.querySelectorAll('[data-hors-zone]')) expect(texteVisible(b)).toContain(PA.TEXTES.inactif);
            expect(texteVisible(palette.querySelector('.palette-algo-cible'))).toBe(PA.TEXTES.dans(zone.dataset.nomZone));
        }
        // « Aucune annotation » n'offre pas {erreurs} — la règle du 3 sept. ne change pas.
        m.win.ciblerPaletteAlgo(palette, zones.find((z) => z.dataset.enonceCle === 'aucune'));
        expect(actifs(palette)).not.toContain('{erreurs}');
    });

    it('P.d les blocs d\'une palette sont l\'union des zones présentes : sans projection, aucun bloc des paliers', () => {
        const avec = PA.blocs(REDACTION).map((b) => b.jeton);
        const sans = PA.blocs(CHIMIE).map((b) => b.jeton);
        expect(new Set(avec).size).toBe(avec.length);   // {erreurs} et {mots}, partagés : un bloc chacun
        expect([...avec].sort()).toEqual([...new Set(E.listerReperes().concat(P.listerReperes()).map((r) => r.jeton))].sort());
        expect([...sans].sort()).toEqual(E.listerReperes().map((r) => r.jeton).sort());
    });
});

/* ======================================================= R — LES RETOUCHES DE LA RELECTURE (22 oct., 21 h 51) */

describe('palette · R — les retouches : le bloc inactif réduit à son nom, la palette compacte, la liste des grilles sous la barre', () => {
    const aideDe = (b) => [b.querySelector('.palette-algo-bloc-aide'), b.querySelector('.palette-algo-bloc-precision')]
        .filter(Boolean).map((s) => texteVisible(s)).filter(Boolean).join(' ');

    it('R.a l\'aide de chaque bloc est son `title` ; devenu inactif, son `title` est la mention, et il la reprend redevenu actif', () => {
        const m = rendu([REDACTION]);
        const { palette, zones } = domDe(m, 'CR');
        for (const b of palette.querySelectorAll('.palette-algo-bloc')) expect(b.title, b.dataset.jeton).toBe(aideDe(b));
        const palier = zones.find((z) => z.dataset.palierIndex === '1');
        m.win.ciblerPaletteAlgo(palette, palier);
        const horsZone = [...palette.querySelectorAll('[data-hors-zone]')];
        expect(horsZone.map((b) => b.dataset.jeton)).toContain('{points}');   // le bloc qui a une précision
        for (const b of horsZone) expect(b.title, b.dataset.jeton).toBe(PA.TEXTES.inactif);
        m.win.ciblerPaletteAlgo(palette, zones.find((z) => z.dataset.enonceCle === 'decompte'));
        const points = palette.querySelector('[data-jeton="{points}"]');
        expect(points.dataset.horsZone).toBeUndefined();
        expect(points.title).toBe(aideDe(points));
        expect(points.title).toContain(texteVisible(points.querySelector('.palette-algo-bloc-precision')));
    });

    it('R.b un groupe sans bloc offert par la zone est marqué vide (la palette compacte le cache) ; il se rouvre avec la zone suivante', () => {
        const m = rendu([REDACTION]);
        const { palette, zones } = domDe(m, 'CR');
        const groupes = () => [...palette.querySelectorAll('.palette-algo-groupe')].map((g) => g.dataset.vide === '1');
        m.win.ciblerPaletteAlgo(palette, zones.find((z) => z.dataset.enonceCle === 'priorite'));
        expect(E.reperesDeCle('priorite').every((r) => r.famille === 'posee')).toBe(true);
        expect(groupes()).toEqual([false, true]);
        m.win.ciblerPaletteAlgo(palette, zones.find((z) => z.dataset.palierIndex === '0'));
        expect(groupes()).toEqual([false, false]);
    });

    it('R.c la feuille de style : un bloc inactif garde son nom seul (aide, précision, mention masquées à l\'œil, pas au lecteur d\'écran) ; sous le seuil, la palette se dit compacte et ne montre que ce que la zone offre ; la liste des grilles colle sous la barre', () => {
        const css = source('styles.css');
        const inactif = tranche(css, '.palette-algo-bloc[data-hors-zone] .palette-algo-bloc-aide,', '}');
        expect(inactif).toMatch(/\.palette-algo-bloc\[data-hors-zone\] \.palette-algo-bloc-precision,/);
        expect(inactif).toMatch(/clip-path: inset\(50%\)/);
        expect(inactif).not.toMatch(/display: none/);   // masqué à l'œil seulement : le lecteur d'écran lit encore la mention
        const compacte = tranche(css, '@container gabarit-algo (max-width: 753px) {', '\n}\n');
        expect(compacte).toMatch(/--palette-algo-compacte: 1;/);
        expect(compacte).toMatch(/\.palette-algo-groupe\[data-vide\],\s*\.palette-algo-bloc\[data-hors-zone\] \{ display: none; \}/);
        expect(compacte).toMatch(/\.palette-algo-bloc-aide,\s*\.palette-algo-bloc-precision \{[^}]*clip-path: inset\(50%\)/);
        const collant = tranche(css, '@media (min-width: 1025px) {\n    body:has(.section.active .sous-section.active .palette-algo)', '\n}\n');
        // #1147 (24 oct. 2026) : la liste des grilles n'est plus une barre latérale collante — sa règle est partie,
        // celles qui rendent la palette collante restent.
        expect(collant).toMatch(/\.conteneur:has\(\.section\.active \.sous-section\.active \.palette-algo\) \{ overflow: clip; \}/);
        expect(collant).not.toMatch(/sidebar-navigation/);
        // Le JS lit le seuil dans la feuille de style, il ne l'écrit pas une seconde fois.
        expect(source('js/grilles.js')).toMatch(/getPropertyValue\('--palette-algo-compacte'\)/);
    });
});

/* ======================================================= N — LES NOMS */

describe('palette · N — des blocs nommés en mots, deux groupes ; les chips montrent le nom', () => {
    it('N.a deux groupes, dans cet ordre, leurs titres à la place du paragraphe des couleurs ; chaque bloc, un nom et une aide', () => {
        const m = rendu([REDACTION]);
        const { palette } = domDe(m, 'CR');
        const groupes = [...palette.querySelectorAll('.palette-algo-groupe')];
        expect(groupes.map((g) => texteVisible(g.querySelector('.palette-algo-groupe-nom')))).toEqual(['Ce que tu écris dans la grille', 'Ce qui se remplit à la correction']);
        expect(groupes[0].querySelectorAll('.palette-algo-bloc--remplie').length).toBe(0);
        expect(groupes[1].querySelectorAll('.palette-algo-bloc--posee').length).toBe(0);
        for (const b of palette.querySelectorAll('.palette-algo-bloc')) {
            const nom = texteVisible(b.querySelector('.palette-algo-bloc-nom'));
            expect(nom.length, b.dataset.jeton).toBeGreaterThan(2);
            expect(nom, 'jamais le nom de code').not.toBe(b.dataset.jeton.slice(1, -1));
            expect(nom).not.toMatch(/[{}]/);
            expect(texteVisible(b.querySelector('.palette-algo-bloc-aide')).length).toBeGreaterThan(10);
        }
        expect(m.html).not.toContain('Le repère bleu est écrit dans la grille');
        expect(m.html).not.toContain('Les badges bleus sont écrits dans la grille');
    });

    it('N.b les blocs qui parlent de ce qu\'on compte portent les noms du critère ; « des » ne s\'élide pas, jamais « de » devant un nom', () => {
        const nom = (critere, jeton) => PA.blocs(critere).find((b) => b.jeton === jeton).nom;
        expect(nom(CHIMIE, '{erreurs}')).toBe('Compte des unités manquantes');
        expect(nom(CHIMIE, '{mots}')).toBe('Compte des calculs');
        expect(nom(CHIMIE, '{nomErreurs}')).toBe('« unités manquantes »');
        expect(nom(CHIMIE, '{nomMots}')).toBe('« calculs »');
        expect(nom(REDACTION, '{erreurs}')).toBe('Compte des erreurs');
        // Un nom qui commence par une voyelle ne s'élide pas non plus.
        const voyelle = { ...CHIMIE, noms: { erreurs: { singulier: 'oubli', pluriel: 'oublis' }, mots: { singulier: 'item', pluriel: 'items' } } };
        expect(nom(voyelle, '{erreurs}')).toBe('Compte des oublis');
        expect(nom(voyelle, '{mots}')).toBe('Compte des items');
        for (const b of PA.blocs(voyelle)) expect(b.nom + ' ' + b.aide).not.toMatch(/\bd’|\bd'(?=[oi])|\bde (oublis?|items?)\b/);
        // Un critère né depuis l'étape 2a, sans ses noms : le repli, jamais un nom vide.
        const neuf = { id: 'N', type: 'algorithmique', nomsAttendus: true };
        expect(nom(neuf, '{erreurs}')).toBe('Compte des éléments relevés');
    });

    it('N.c les blocs propres aux paliers gardent leurs libellés (avec leur majuscule) ; {critere} et {points} aussi', () => {
        const parJeton = Object.fromEntries(PA.blocs(REDACTION).map((b) => [b.jeton, b]));
        for (const r of P.listerReperes().filter((x) => x.jeton !== '{erreurs}' && x.jeton !== '{mots}')) {
            expect(parJeton[r.jeton].nom).toBe(r.libelle.charAt(0).toUpperCase() + r.libelle.slice(1));
            expect(parJeton[r.jeton].aide).toBe(r.aide);
        }
        expect(parJeton['{critere}'].nom).toBe('Nom du critère');
        expect(parJeton['{points}'].nom).toBe('Somme pondérée');
        expect(parJeton['{points}'].precision.length).toBeGreaterThan(10);
        expect(parJeton['{points}'].espaceDeTete).toBe(true);
    });

    it('N.d les chips de la phrase montrent le nom du bloc, la croix reste ; le jeton est la valeur, et elle se relit telle quelle', () => {
        const palette = PA.reperesDeZone(CHIMIE, { enonceCle: 'decompte' });
        const html = C.rendreHtml('Tu as {erreurs} {nomErreurs} pour {mots} {nomMots}.', palette);
        expect(html).toContain('data-jeton="{erreurs}" title="Compte des unités manquantes">Compte des unités manquantes<span class="composeur-chip-croix"');
        expect(html).toContain('data-jeton="{nomMots}" title="« calculs »">« calculs »<span class="composeur-chip-croix"');
        expect(html).not.toMatch(/>erreurs<|>nomMots</);
        expect(C.assembler(C.segmenter('Tu as {erreurs} {nomErreurs}.', palette))).toBe('Tu as {erreurs} {nomErreurs}.');
    });

    it('N.e le gabarit monte les vues avec les noms du critère de CHAQUE zone (`monterVuesBadges`, `reperesDeZone`)', () => {
        const m = rendu([REDACTION, CHIMIE]);
        const nommer = m.montes[0];
        expect(typeof nommer).toBe('function');
        const zone = { dataset: { critereIndex: '1', enonceCle: 'decompte' } };
        expect(nommer(zone).find((r) => r.jeton === '{erreurs}').libelle).toBe('Compte des unités manquantes');
        expect(nommer({ dataset: { critereIndex: '0', palierIndex: '2', champ: 'texte' } }).map((r) => r.jeton)).toEqual(P.listerReperes().map((r) => r.jeton));
    });
});

/* ======================================================= G — LE GARDE-FOU DU PLAN */

describe('palette · G — une rédaction et une chimie : la seconde ne lit ni « erreur » ni « mot »', () => {
    it('G.a la palette de la chimie, ses étiquettes de zones et ses noms de zones : aucun « erreur », aucun « mot »', () => {
        const m = rendu([CHIMIE]);
        const { palette, zones } = domDe(m, 'CC');
        expect(texteVisible(palette)).not.toMatch(MOTS_REDACTION);
        for (const z of zones) expect(z.dataset.nomZone).not.toMatch(MOTS_REDACTION);
        // La palette ciblée sur chaque zone dit son nom, sans erreur ni mot.
        for (const z of zones) { m.win.ciblerPaletteAlgo(palette, z); expect(texteVisible(palette)).not.toMatch(MOTS_REDACTION); }
        expect(m.html).toContain('>Décompte des unités manquantes</label>');
        expect(m.html).toContain('data-nom-zone="Décompte des unités manquantes"');
    });

    it('G.b la rédaction lit ses propres noms : « Compte des erreurs », « Compte des mots », « Décompte des erreurs »', () => {
        const m = rendu([REDACTION]);
        const { palette } = domDe(m, 'CR');
        expect(texteVisible(palette)).toContain('Compte des erreurs');
        expect(texteVisible(palette)).toContain('Compte des mots');
        expect(m.html).toContain('>Décompte des erreurs</label>');
    });

    it('G.c avec une projection, seuls les cinq libellés des paliers (que l\'étape 3 reprend) parlent encore d\'erreurs ou de mots', () => {
        const chimieProjetee = { ...CHIMIE, modeleProjection: 'norme_externe' };
        const fautifs = PA.blocs(chimieProjetee).filter((b) => MOTS_REDACTION.test(b.nom + ' ' + b.aide + ' ' + b.precision)).map((b) => b.jeton);
        // La limite connue, dite : elle existe (l'étape 3 la lèvera), et elle ne déborde pas des paliers.
        expect(fautifs.length).toBeGreaterThan(0);
        for (const j of fautifs) expect(['{seuil}', '{longueur}', '{moyenne}', '{projection}', '{palier}']).toContain(j);
    });
});

/* ======================================================= X — UN NOM PIÉGÉ */

describe('palette · X — un nom piégé reste du texte', () => {
    it('X.a dans la palette et les étiquettes : échappé, jamais une balise', () => {
        const m = rendu([PIEGEE]);
        expect(m.html).not.toContain(PIEGE);
        expect(m.html).toContain(echapper('Compte des ' + PIEGE));
        expect(m.html).toContain('>Décompte des ' + echapper(PIEGE) + '</label>');
        const { palette } = domDe(m, 'CP');
        expect(palette.querySelector('img')).toBeNull();
        expect(texteVisible(palette)).toContain('Compte des ' + PIEGE);
    });

    it('X.b dans les chips : échappé, jamais une balise', () => {
        const html = C.rendreHtml('{erreurs} {nomErreurs}', PA.reperesDeZone(PIEGEE, { enonceCle: 'decompte' }), echapper);
        expect(html).not.toContain(PIEGE);
        expect(html).toContain(echapper('« ' + PIEGE + ' »'));
        expect(new JSDOM('<body>' + html + '</body>').window.document.querySelector('img')).toBeNull();
    });
});

/* ======================================================= S — L'INVARIANT DU STOCK */

describe('palette · S — rien n\'est écrit dans le stock ; un critère d\'avant rend les mêmes phrases', () => {
    it('S.a un critère d\'avant rend à l\'élève les phrases d\'hier, au caractère près (mesurées sur 6cac9b1d)', () => {
        expect(E.enonce(STOCK, 'decompte', { erreurs: 12, mots: 500 })).toBe('Ta rédaction contient 12 erreurs de français pour 500 mots.');
        expect(E.enonce(STOCK, 'priorite', {})).toBe('la qualité du français écrit est à travailler en priorité');
        expect(E.enonce(STOCK, 'concentre', {})).toBe('Concentre-toi sur la qualité du français');
        expect(E.enonce(STOCK, 'aucune', {})).toBe('Aucun tampon ni erreur de français annotés.');
        expect(P.calculer(STOCK, { erreurs: 12, mots: 500 }).texte).toBe(P.calculer(clone(STOCK), { erreurs: 12, mots: 500 }).texte);
    });

    it('S.b le rendu du gabarit n\'écrit rien : ni dans le critère, ni dans le stockage ; l\'étiquette d\'hier reste « Décompte des erreurs »', () => {
        const avant = clone(STOCK);
        const m = rendu([STOCK]);
        expect(m.ecrits).toEqual([]);
        expect(m.store).toEqual(m.avantRendu);
        expect(m.store.a2026_grillesTemplates[0].criteres[0]).toEqual(avant);
        expect(m.html).toContain('>Décompte des erreurs</label>');
        const { palette } = domDe(m, 'CS');
        m.win.ciblerPaletteAlgo(palette, palette.ownerDocument.querySelector('textarea[data-enonce-cle="decompte"]'));
        expect(m.ecrits).toEqual([]);
    });

    it('S.c un bloc de la palette porte son JETON (le format que le moteur lit), jamais son nom', () => {
        const m = rendu([CHIMIE]);
        const { palette } = domDe(m, 'CC');
        const jetons = [...palette.querySelectorAll('.palette-algo-bloc')].map((b) => b.dataset.jeton);
        expect(jetons.every((j) => /^\{[a-zA-Z]+\}$/.test(j))).toBe(true);
        expect(E.insererRepere('Tu as', 5, 5, '{erreurs}', PA.reperesDeZone(CHIMIE, { enonceCle: 'decompte' })).texte).toBe('Tu as {erreurs}');
    });
});
