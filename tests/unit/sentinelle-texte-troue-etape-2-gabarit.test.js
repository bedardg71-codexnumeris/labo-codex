// SENTINELLE — LE TEXTE TROUÉ, ÉTAPE 2 · VOLET 2 : LE GABARIT OFFRE LES BADGES
// D'UN PALIER, ET LE CLIC LES POSE (4 septembre 2026).
//
// Ce banc EXÉCUTE les fonctions réelles de grilles.js (patron des sentinelles
// #516 / #522 / lot 4 C) avec les registres réels ; les cas D simulent le geste
// avec des éléments factices qui ne portent que ce que `insererRepereEnonce` lit.
//
//   A. la POSE est commune : `insererRepere` (énoncés) accepte la palette de la
//      projection en 5e paramètre, refuse un jeton hors palette, et les neuf cas
//      de l'étape 1 ne bougent pas (leur sentinelle tourne à côté) ;
//   B. le RENDU : une palette par palier, les huit badges dans l'ordre arrêté,
//      deux couleurs, entre la rangée « Palier · Jusqu'à » et les deux zones ;
//      la note « Écris {service}… » est partie, la note du composeur porte la
//      décision de Grégoire sur le préfixe, au mot ; les énoncés gardent leur
//      palette (même helper) ;
//   C. un jeton INCONNU se dit sous son palier, échappé ; rien sans inconnu ;
//   D. le GESTE : la cible est la zone focalisée, sinon la dernière visitée,
//      sinon « Ce que l'élève lit » ; l'écriture passe par `_muterPalier`
//      (temp et grille), sans rendu ; un jeton hors palette ne pose rien ;
//      une zone d'énoncé fonctionne toujours ;
//   E. les invariants statiques : le clic ne prend pas le focus, `focusin`
//      connaît les zones de palier, les jetons anti-cache ont bougé.
//
// ↻ ÉTAPE 2b (22 oct. 2026) : les palettes de palier sont parties, la palette du critère sert ses
//   zones (`palette-algo.js`) ; B dit ce qui reste du rendu (les zones, leur nom, la note), D simule
//   la palette et sa cible (le focus, sinon la dernière zone visitée ; sans elle, rien), E lit les
//   invariants d'aujourd'hui. Le banc de la palette : `critere-algorithmique-palette.test.js`.
//
// BREAK-TESTS (faits le 4 septembre 2026, chacun restauré, `cmp` identique) :
//   · B — `reperesPalier` rendu vide → B rougit ;
//   · B — la note du composeur privée de sa dernière phrase → B.c rougit ;
//   · C — `ligneInconnus` rend '' → C rougit ;
//   · D — `_zoneCibleDuPalier` ignore `document.activeElement` → D.b rougit ;
//   · D — l'écriture du palier retirée de `insererRepereEnonce` → D.a et D.d rougissent ;
//   · A — `_repere` ignore la palette reçue → A rougit.

import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { etapeDe, etapeOuverte, atelierDe } from './_helpers/atelier-algo.js';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { jetonAuMoins } from './_helpers/jeton-anticache.js';
import { tranche } from './_helpers/tranche.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');
const require = createRequire(import.meta.url);

const E = require(path.join(racine, 'js/evaluation-enonces.js'));
const P = require(path.join(racine, 'js/evaluation-projection.js'));

/* ------------------------------------------------------------------ harnais */

const echapper = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function fauxElement() {
    return {
        value: '', innerHTML: '', textContent: '', style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        querySelectorAll: () => [], querySelector: () => null,
        addEventListener() {}, appendChild() {}, setAttribute() {}, focus() {}
    };
}

function fauxDocument() {
    const elements = {};
    return {
        _elements: elements,
        activeElement: null,
        getElementById: (id) => (elements[id] || (elements[id] = fauxElement())),
        querySelector: () => null, querySelectorAll: () => [],
        body: { appendChild() {}, removeChild() {} },
        createElement: () => fauxElement(),
        addEventListener() {}, removeEventListener() {}
    };
}

const CLE = 'a2026_grillesTemplates';

function monter(grilles) {
    const store = { [CLE]: JSON.parse(JSON.stringify(grilles)) };
    const db = {
        get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = v; },
        setSync: (k, v) => { store[k] = v; },
        modifier: async (k, mutateur, defaut) => {
            const valeur = (k in store ? store[k] : defaut);
            const resultat = await mutateur(valeur);
            if (resultat === undefined) return undefined;
            store[k] = resultat;
            return resultat;
        }
    };
    const document = fauxDocument();
    const globaux = {
        db, document,
        cle: (k) => 'a2026_' + k,
        echapperHtml: echapper,
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8),
        alert() {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null,
                          filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc',
        grilleTemplateActuelle: null
    };
    const win = chargerScript('js/ui-blocs.js', globaux);
    chargerScript('js/grilles.js', globaux, win);
    win.formulesAlgo = require(path.join(racine, 'js/evaluation-formules.js'));
    win.enoncesAlgo = E;
    win.projectionAlgo = P;
    win.codesAnnotation = require(path.join(racine, 'js/codes-annotation.js'));
    win.atelierAlgo = require(path.join(racine, 'js/atelier-algo.js'));   // #1150 : l'atelier du critère, qui rend le gabarit
    win.paletteAlgo = require(path.join(racine, 'js/palette-algo.js'));
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    return { win, store, document, liste: () => document.getElementById('listeCriteres') };
}

const ALGO = { id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, modeleProjection: 'norme_externe' };
const GRILLE = { id: 'G1', nom: 'Philo', dansBibliotheque: true, criteres: [ALGO] };

/** Le HTML de la carte « Projection » du critère CR. */
// ↻ #1150, lot 4 (24 oct. 2026) : la carte est devenue l'étape « Paliers » de l'atelier (`_helpers/atelier-algo.js`).
function carteProjection(html) {
    return etapeDe(html, 'CR', 'paliers');
}
const paliersDe = (projection) => projection.split('class="sous-critere-item palier-projection"').slice(1);

/* ================================================================ A — LA POSE */

describe('texte troué 2 · A — la pose est commune : `insererRepere` accepte la palette de la projection', () => {
    const palette = P.listerReperes();

    it('A.a un badge de la projection est refusé sans palette, posé avec — le texte n\'est pas touché au refus', () => {
        expect(E.insererRepere('Tu as', 5, 5, '{palier}')).toBeNull();
        expect(E.insererRepere('Tu as', 5, 5, '{palier}', palette)).toEqual({ texte: 'Tu as {palier}', curseur: 14 });
        for (const r of palette) expect(E.insererRepere('x', 1, 1, r.jeton, palette).texte, r.jeton).toBe('x ' + r.jeton);
    });

    it('A.b avec la palette de la projection, un badge des énoncés n\'est pas posable — chaque zone a les siens', () => {
        expect(E.insererRepere('Tu as', 5, 5, '{critere}', palette)).toBeNull();
        expect(E.insererRepere('Tu as', 5, 5, '{points}', palette)).toBeNull();
        expect(E.insererRepere('Tu as', 5, 5, '{critere}')).toEqual({ texte: 'Tu as {critere}', curseur: 15 });
    });

    it('A.c les espaces et la frontière de mot suivent : collé à un mot, avant un mot, dans un mot', () => {
        expect(E.insererRepere('Tu as erreurs', 5, 5, '{erreurs}', palette).texte).toBe('Tu as {erreurs} erreurs');
        expect(E.insererRepere('Tu as', 5, 5, '{mots}', palette).texte).toBe('Tu as {mots}');
        expect(E.insererRepere('Bravo', 2, 2, '{palier}', palette).texte).toBe('{palier} Bravo');
        // Une palette vide ou absente vaut celle des énoncés : {points} garde son espace de tête.
        expect(E.insererRepere('a{points}', 1, 1, '{critere}', []).texte).toBe('a {critere}{points}');
        expect(E.insererRepere('a{points}', 1, 1, '{critere}', null).texte).toBe('a {critere}{points}');
    });
});

/* ================================================================ B — LE RENDU */

describe('texte troué 2 · B — une palette par palier, les huit badges, la note du composeur', () => {
    const rendu = () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        return carteProjection(liste().innerHTML);
    };

    it('B.a aucun palier ne porte plus de palette : les huit blocs des paliers sont dans la palette du critère, dans leur ordre', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = liste().innerHTML;
        const projection = carteProjection(html);
        expect(paliersDe(projection).length).toBe(6);   // les six paliers de migration
        expect(projection).not.toContain('reperes-palier');
        expect(projection).not.toContain('data-action="insererRepereEnonce"');
        const palette = tranche(html, '<aside class="palette-algo"', '</aside>');
        const jetons = [...palette.matchAll(/data-jeton="([^"]+)"/g)].map((m) => m[1]);
        for (const j of P.listerReperes().map((r) => r.jeton)) expect(jetons, j).toContain(j);
        const ordre = ['{service}', '{seuil}', '{longueur}', '{moyenne}', '{projection}', '{palier}'].map((j) => jetons.indexOf(j));
        expect([...ordre].sort((a, b) => a - b)).toEqual(ordre);
    });

    it('B.b les zones portent leur index, leur champ et leur nom — celui que la palette dit', () => {
        const projection = rendu();
        paliersDe(projection).forEach((pal, i) => {
            const bloc = pal.split('class="sous-critere-item palier-projection"')[0];
            expect([...bloc.matchAll(/class="grille-form-2col palier-rangee"/g)].length, 'deux rangées').toBe(2);
            expect(bloc).toMatch(new RegExp(`<textarea[^>]*data-palier-index="${i}" data-champ="texte" data-nom-zone="Verdict, palier ${i + 1}"`));
            expect(bloc).toMatch(new RegExp(`<textarea[^>]*data-palier-index="${i}" data-champ="texteAide" data-nom-zone="Recommandation, palier ${i + 1}"`));
        });
    });

    it('B.c la note « Écris {service}… » est partie ; la note du composeur dit la décision sur le préfixe, au mot, une fois — ↻ §7 : EN TÊTE, avant le premier palier, et les zones s\'appellent « Verdict » et « Recommandation »', () => {
        const projection = rendu();
        expect(projection).not.toContain('palier-note-service');
        expect(projection).not.toContain('là où le nom du service doit apparaître');
        expect((projection.match(/palier-note-composer/g) || []).length).toBe(1);
        expect(projection).toContain('Sans bloc, la phrase est précédée de « Tu fais en moyenne 1 erreur à chaque N mots » ; avec un bloc, elle est entière : c\'est toi qui l\'écris.');
        // ↻ 2b : plus de « sans curseur, dans « Verdict » » — sans zone visitée, rien ne se pose ; ni d'explication des couleurs.
        expect(projection).not.toContain('sans curseur');
        expect(projection).not.toContain('bleus sont écrits');
        const note = projection.indexOf('palier-note-composer');
        expect(note).toBeGreaterThan(-1);
        expect(note).toBeLessThan(projection.indexOf('palier-projection'));
        // Les étiquettes des deux zones (mots de Grégoire, 5 sept., 6 h 35) — et plus aucune trace des anciennes.
        expect((projection.match(/>Verdict<\/label>/g) || []).length).toBe(6);
        expect((projection.match(/>Recommandation \(facultative\)<\/label>/g) || []).length).toBe(6);
        // ↻ §8 : « Ce que l'élève lit » est désormais le TITRE de la carte — c'est l'ancienne étiquette de zone qui ne doit plus exister.
        expect(projection).not.toContain('>Ce que l\'élève lit</label>');
        expect(projection).not.toContain('Phrase de recommandation');
    });

    // ↻ #1150 : le décompte est dans l'étape « Ce que l'élève lit » de l'atelier (plus dans la carte des paliers).
    it('B.d le décompte, dans « Ce que l\'élève lit », par le même helper : son étiquette, sa zone, son nom ; aucune rangée', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const eleve = etapeDe(liste().innerHTML, 'CR', 'eleve');
        expect(rendu()).not.toContain('data-enonce-cle="decompte"');
        const decompte = eleve.slice(eleve.indexOf('Décompte des erreurs'), eleve.indexOf('data-enonce-cle="priorite"'));
        expect(decompte).toContain('data-enonce-cle="decompte" data-nom-zone="Décompte des erreurs"');
        expect(decompte).not.toContain('<button');
        expect(source('js/grilles.js')).not.toMatch(/rendreBoutonsReperes/);
    });

    it('B.e « Aucune projection » : ni note du composeur, ni blocs des paliers dans la palette', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille({ ...GRILLE, criteres: [{ ...ALGO, modeleProjection: 'aucune' }] });
        const html = liste().innerHTML;
        const projection = carteProjection(html);
        expect(projection).not.toContain('palier-note-composer');
        expect(projection).toContain('Aucune projection ne sera proposée');
        const palette = tranche(html, '<aside class="palette-algo"', '</aside>');
        for (const j of ['{service}', '{seuil}', '{longueur}', '{moyenne}', '{projection}', '{palier}']) expect(palette, j).not.toContain(`data-jeton="${j}"`);
        expect(palette).toContain('data-jeton="{erreurs}"');
    });
});

/* ========================================================= C — LE JETON INCONNU */

describe('texte troué 2 · C — un jeton inconnu se dit sous son palier', () => {
    const avec = (paliersProjection) => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille({ ...GRILLE, criteres: [{ ...ALGO, paliersProjection }] });
        return carteProjection(liste().innerHTML);
    };

    it('C.a un inconnu dans « Ce que l\'élève lit » : une ligne sous ce palier, et seulement lui', () => {
        const projection = avec([
            { cle: 'a', libelle: 'A', ratioMax: 0.5, texte: 'Bravo {truc}.', texteAide: '' },
            { cle: 'b', libelle: 'B', ratioMax: null, texte: 'Tu as {erreurs} erreurs.', texteAide: '' }
        ]);
        const paliers = paliersDe(projection);
        expect(paliers[0]).toContain('palier-jetons-inconnus');
        expect(paliers[0]).toContain('Le badge « {truc} » est inconnu de cette version de l\'application : l\'élève le lirait tel quel.');
        expect(paliers[1]).not.toContain('palier-jetons-inconnus');
    });

    it('C.b plusieurs inconnus, dans les deux zones : nommés une fois chacun, au pluriel, échappés', () => {
        const projection = avec([
            { cle: 'a', libelle: 'A', ratioMax: null, texte: '{truc} et {truc}', texteAide: 'puis {<b>}' }
        ]);
        const pal = paliersDe(projection)[0];
        expect(pal).toContain('Les badges « {truc} », « {&lt;b&gt;} » sont inconnus de cette version de l\'application : l\'élève les lirait tels quels.');
        expect(pal).not.toContain('{<b>}');
    });

    it('C.c aucun inconnu — les huit connus et {s} ne déclenchent rien', () => {
        const projection = avec([
            { cle: 'a', libelle: 'A', ratioMax: null, texte: '{palier} : {erreurs} erreur{s} sur {mots} mots, {moyenne}, {projection}, {seuil}, {longueur}.', texteAide: 'Va au {service}.' }
        ]);
        expect(projection).not.toContain('palier-jetons-inconnus');
    });
});

/* ================================================================ D — LE GESTE */

describe('texte troué 2 · D — le clic pose le badge dans la bonne zone et l\'écrit sans rendu', () => {
    /** Le gabarit d'un critère et sa palette ; `visitee` : la dernière zone visitée (sa cible sans focus). */
    function gabaritFactice() {
        const palette = { dataset: {}, querySelector: () => null, querySelectorAll: () => [] };
        const gabarit = { querySelector: (sel) => (sel === '.palette-algo' ? palette : null) };
        return { palette, gabarit };
    }
    function zoneFactice(g, dataset, valeur) {
        return {
            tagName: 'TEXTAREA', value: valeur, dataset: Object.assign({}, dataset),
            selectionStart: valeur.length, selectionEnd: valeur.length,
            closest: (sel) => (sel === '.gabarit-algo' ? g.gabarit : null),
            focus() {}, setSelectionRange(a) { this.selectionStart = this.selectionEnd = a; }
        };
    }
    const bouton = (g, jeton) => ({ closest: (sel) => (sel === '.palette-algo' ? g.palette : null), dataset: { jeton } });
    const tick = () => new Promise((r) => setTimeout(r, 0));

    it('D.a en CRÉATION (temp) : la zone visitée reçoit le badge, à la fin sans curseur connu, et le palier est écrit sur le critère', () => {
        const { win, document } = monter([]);
        win.tempCriteres = [{ ...ALGO, id: 'T' }];
        const g = gabaritFactice();
        const texte = zoneFactice(g, { palierIndex: '4', champ: 'texte', critereIndex: '0' }, 'Verdict.');
        const aide = zoneFactice(g, { palierIndex: '4', champ: 'texteAide', critereIndex: '0' }, 'Inscris-toi.');
        g.palette._zoneCible = texte;
        document.activeElement = null;
        win.insererRepereEnonce(bouton(g, '{erreurs}'));
        expect(texte.value).toBe('Verdict. {erreurs}');
        expect(texte.dataset.curseurVu).toBe('1');
        expect(aide.value).toBe('Inscris-toi.');
        // Écrit par `_muterPalier` : les six paliers migrés sont matérialisés, le 5e porte le badge.
        const paliers = win.tempCriteres[0].paliersProjection;
        expect(paliers.length).toBe(6);
        expect(paliers[4].texte).toBe('Verdict. {erreurs}');
        expect(paliers[4].cle).toBe('risque');
        expect(paliers[4].texteAide).toBe('Il est recommandé de t\'inscrire au {service}.');   // celui de la migration, pas la zone factice
        expect(win.enoncesAlgo).toBe(E);
    });

    it('D.b la zone FOCALISÉE reçoit le badge, au curseur — la recommandation ici, même si la dernière visitée est le verdict', () => {
        const { win, document } = monter([]);
        win.tempCriteres = [{ ...ALGO, id: 'T' }];
        const g = gabaritFactice();
        const texte = zoneFactice(g, { palierIndex: '4', champ: 'texte', critereIndex: '0' }, 'Verdict.');
        const aide = zoneFactice(g, { palierIndex: '4', champ: 'texteAide', critereIndex: '0', curseurVu: '1' }, 'Inscris-toi vite.');
        aide.selectionStart = aide.selectionEnd = 'Inscris-toi'.length;
        g.palette._zoneCible = texte;
        document.activeElement = aide;
        win.insererRepereEnonce(bouton(g, '{service}'));
        expect(aide.value).toBe('Inscris-toi {service} vite.');
        expect(aide.selectionStart, 'le curseur est juste après le badge ; l\'espace qui suit était déjà là').toBe('Inscris-toi {service}'.length);
        expect(texte.value).toBe('Verdict.');
        expect(win.tempCriteres[0].paliersProjection[4].texteAide).toBe('Inscris-toi {service} vite.');
    });

    it('D.c sans focus et sans zone visitée depuis le rendu : rien ne se pose, rien ne s\'écrit', () => {
        const { win, document } = monter([]);
        win.tempCriteres = [{ ...ALGO, id: 'T' }];
        const g = gabaritFactice();
        const texte = zoneFactice(g, { palierIndex: '1', champ: 'texte', critereIndex: '0' }, 'V');
        document.activeElement = null;
        win.insererRepereEnonce(bouton(g, '{projection}'));
        expect(texte.value).toBe('V');
        expect(win.tempCriteres[0].paliersProjection).toBeUndefined();
    });

    it('D.d en ÉDITION (grille enregistrée) : l\'écriture passe par `db.modifier`, sans rendu', async () => {
        const { win, store, document } = monter([GRILLE]);
        const g = gabaritFactice();
        const texte = zoneFactice(g, { palierIndex: '0', champ: 'texte', critereIndex: '0', grilleId: 'G1' }, 'Zéro faute.');
        g.palette._zoneCible = texte;
        document.activeElement = null;
        let rendus = 0;
        win.afficherCriteresGrille = () => { rendus++; };
        win.insererRepereEnonce(bouton(g, '{palier}'));
        await tick();
        expect(texte.value).toBe('Zéro faute. {palier}');
        const paliers = store[CLE][0].criteres[0].paliersProjection;
        expect(paliers[0].texte).toBe('Zéro faute. {palier}');
        expect(paliers[0].sansErreur).toBe(true);
        expect(paliers.length).toBe(6);
        expect(rendus, 'le clic ne re-rend pas le gabarit : le curseur doit survivre').toBe(0);
    });

    it('D.e un bloc que la zone de palier n\'offre pas ({critere}) ne pose rien et n\'écrit rien', () => {
        const { win, document } = monter([]);
        win.tempCriteres = [{ ...ALGO, id: 'T' }];
        const g = gabaritFactice();
        const texte = zoneFactice(g, { palierIndex: '0', champ: 'texte', critereIndex: '0' }, 'V');
        g.palette._zoneCible = texte;
        document.activeElement = null;
        win.insererRepereEnonce(bouton(g, '{critere}'));
        expect(texte.value).toBe('V');
        expect(win.tempCriteres[0].paliersProjection).toBeUndefined();
    });

    it('D.f une zone d\'ÉNONCÉ passe toujours par son chemin — rien de l\'étape 1 ne bouge', () => {
        const { win, document } = monter([]);
        win.tempCriteres = [{ ...ALGO, id: 'T' }];
        const g = gabaritFactice();
        const zone = zoneFactice(g, { enonceCle: 'priorite', critereIndex: '0' }, 'le calcul d\'abord');
        g.palette._zoneCible = zone;
        document.activeElement = null;
        win.insererRepereEnonce(bouton(g, '{critere}'));
        expect(zone.value).toBe('le calcul d\'abord {critere}');
        expect(win.tempCriteres[0].enonces.priorite).toBe('le calcul d\'abord {critere}');
        expect(win.tempCriteres[0].paliersProjection).toBeUndefined();
    });
});

/* ======================================================== E — LES INVARIANTS */

describe('texte troué 2 · E — les invariants statiques du gabarit', () => {
    const grilles = source('js/grilles.js');

    it('E.a toucher la palette ne prend pas le focus, et `focusin` connaît les zones de palier et d\'énoncé', () => {
        expect(grilles).toMatch(/\['pointerdown', 'mousedown'\]/);
        expect(grilles).toMatch(/if \(cible\.closest\('\.palette-algo'\)\) e\.preventDefault\(\)/);
        expect(grilles).toMatch(/zone\.dataset\.enonceCle !== undefined \|\| zone\.dataset\.palierIndex !== undefined/);
        expect(grilles).toMatch(/ciblerPaletteAlgo\(_paletteDeZone\(zone\), zone\)/);
        // La cible d'hier (« la zone du palier, sinon Verdict ») est partie, sans alias.
        expect(grilles).not.toMatch(/_zoneCibleDuPalier|zoneActive/);
    });

    it('E.b le bloc projection n\'a toujours aucun handler inline, et échappe ce qui vient de la grille', () => {
        const bloc = tranche(grilles, 'function rendreBlocProjectionAlgo', 'function modifierProjectionCritereGrille');
        expect(bloc).not.toMatch(/\bon(click|change|input|blur|focus)\s*=/);
        expect(bloc).toMatch(/inconnus\.map\(j => '« ' \+ esc\(j\) \+ ' »'\)/);
    });

    it('E.c les jetons anti-cache des quatre fichiers du volet ont bougé', () => {
        const html = source('index.html');
        { const j = jetonAuMoins(html, 'js/grilles.js', '20260904i'); expect(j.ok, j.message).toBe(true); }
        { const j = jetonAuMoins(html, 'js/evaluation-enonces.js', '20260904a'); expect(j.ok, j.message).toBe(true); }
        { const j = jetonAuMoins(html, 'js/evaluation-projection.js', '20260904d'); expect(j.ok, j.message).toBe(true); }
        { const j = jetonAuMoins(html, 'styles.css', '20260904f'); expect(j.ok, j.message).toBe(true); }
    });
});
