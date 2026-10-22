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
// BREAK-TESTS (faits le 4 septembre 2026, chacun restauré, `cmp` identique) :
//   · B — `reperesPalier` rendu vide → B rougit ;
//   · B — la note du composeur privée de sa dernière phrase → B.c rougit ;
//   · C — `ligneInconnus` rend '' → C rougit ;
//   · D — `_zoneCibleDuPalier` ignore `document.activeElement` → D.b rougit ;
//   · D — l'écriture du palier retirée de `insererRepereEnonce` → D.a et D.d rougissent ;
//   · A — `_repere` ignore la palette reçue → A rougit.

import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
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
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    return { win, store, document, liste: () => document.getElementById('listeCriteres') };
}

const ALGO = { id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, modeleProjection: 'norme_externe' };
const GRILLE = { id: 'G1', nom: 'Philo', dansBibliotheque: true, criteres: [ALGO] };

/** Le HTML de la carte « Projection » du critère CR. */
function carteProjection(html) {
    const i = html.indexOf('data-pli="CR:projection"');
    const suivant = html.indexOf('class="carte accordeon gabarit-algo-carte', i + 10);
    return html.slice(i, suivant < 0 ? undefined : suivant);
}
const paliersDe = (projection) => projection.split('class="sous-critere-item palier-projection"').slice(1);
const boutons = (bloc) => [...bloc.matchAll(/<button type="button" class="repere-enonce repere-enonce--(posee|remplie)"\s+data-action="insererRepereEnonce" data-jeton="([^"]+)"[^>]*>([^<]*)<\/button>/g)]
    .map((m) => ({ famille: m[1], jeton: m[2], texte: m[3] }));

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

    it('B.a chaque palier porte UNE palette, avec les huit badges dans l\'ordre arrêté, sans accolades sur le bouton', () => {
        const projection = rendu();
        const paliers = paliersDe(projection);
        expect(paliers.length).toBe(6);   // les six paliers de migration
        expect((projection.match(/class="reperes-enonce reperes-palier"/g) || []).length).toBe(6);
        for (const pal of paliers) {
            const b = boutons(pal.split('class="sous-critere-item palier-projection"')[0]);
            expect(b.map((x) => x.jeton)).toEqual(['{service}', '{seuil}', '{longueur}', '{erreurs}', '{mots}', '{moyenne}', '{projection}', '{palier}']);
            expect(b.map((x) => x.texte)).toEqual(['service', 'seuil', 'longueur', 'erreurs', 'mots', 'moyenne', 'projection', 'palier']);
            expect(b.map((x) => x.famille)).toEqual(['posee', 'posee', 'posee', 'remplie', 'remplie', 'remplie', 'remplie', 'remplie']);
        }
    });

    it('B.b la palette est ENTRE la rangée « Palier · Jusqu\'à » et les deux zones, et les zones portent leur index et leur champ', () => {
        const projection = rendu();
        paliersDe(projection).forEach((pal, i) => {
            const bloc = pal.split('class="sous-critere-item palier-projection"')[0];
            const rangees = [...bloc.matchAll(/class="grille-form-2col palier-rangee"/g)].map((m) => m.index);
            const palette = bloc.indexOf('class="reperes-enonce reperes-palier"');
            expect(rangees.length, 'deux rangées').toBe(2);
            expect(palette).toBeGreaterThan(rangees[0]);
            expect(palette).toBeLessThan(rangees[1]);
            expect(bloc).toContain(`aria-label="Badges à poser dans le palier ${i + 1}"`);
            expect(bloc).toMatch(new RegExp(`<textarea[^>]*data-palier-index="${i}" data-champ="texte"`));
            expect(bloc).toMatch(new RegExp(`<textarea[^>]*data-palier-index="${i}" data-champ="texteAide"`));
        });
    });

    it('B.c la note « Écris {service}… » est partie ; la note du composeur dit la décision sur le préfixe, au mot, une fois — ↻ §7 : EN TÊTE, avant le premier palier, et les zones s\'appellent « Verdict » et « Recommandation »', () => {
        const projection = rendu();
        expect(projection).not.toContain('palier-note-service');
        expect(projection).not.toContain('là où le nom du service doit apparaître');
        expect((projection.match(/palier-note-composer/g) || []).length).toBe(1);
        expect(projection).toContain('Sans badge, la phrase est précédée de « Tu fais en moyenne 1 erreur à chaque N mots » ; avec un badge, elle est entière : c\'est toi qui l\'écris.');
        expect(projection).toContain('sans curseur, dans « Verdict »');
        // §7 (5 sept.) : l'aide était à six paliers de la rangée « Poser : » ; elle précède le premier palier.
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

    it('B.d les énoncés gardent leur palette, par le même helper : « Décompte des erreurs » offre ses quatre repères — ↻ §8 : dans « Ce que l\'élève lit »', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(GRILLE)));
        const html = liste().innerHTML;
        const projection = carteProjection(html);
        const decompte = projection.slice(projection.indexOf('Décompte des erreurs'), projection.indexOf('class="sous-criteres-liste-conteneur"'));
        expect(boutons(decompte).map((b) => b.jeton)).toEqual(['{critere}', '{erreurs}', '{nomErreurs}', '{mots}', '{nomMots}', '{points}']);   // ↻ étape 2a (22 oct. 2026) : les deux noms, offerts
        expect(decompte).toContain('aria-label="Poser nom du critère, {critere}, dans « Décompte des erreurs »"');
        expect((source('js/grilles.js').match(/rendreBoutonsReperes\(/g) || []).length).toBe(3);   // la déclaration + deux appels
    });

    it('B.e « Aucune projection » : ni palette ni note — rien à composer', () => {
        const { win, liste } = monter([GRILLE]);
        win.afficherCriteresGrille({ ...GRILLE, criteres: [{ ...ALGO, modeleProjection: 'aucune' }] });
        const projection = carteProjection(liste().innerHTML);
        expect(projection).not.toContain('reperes-palier');
        expect(projection).not.toContain('palier-note-composer');
        expect(projection).toContain('Aucune projection ne sera proposée');
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
    function zoneFactice(dataset, valeur) {
        return {
            tagName: 'TEXTAREA', value: valeur, dataset: Object.assign({}, dataset),
            selectionStart: valeur.length, selectionEnd: valeur.length,
            focus() {}, setSelectionRange(a) { this.selectionStart = this.selectionEnd = a; }
        };
    }
    /** Un palier factice avec ses deux zones ; `actif` : la zone que le document dit focalisée. */
    function palierFactice(zones) {
        return {
            dataset: {},
            contains: (n) => zones.includes(n),
            querySelector: (sel) => {
                const m = sel.match(/data-champ="([^"]+)"/);
                return m ? (zones.find((z) => z.dataset.champ === m[1]) || null) : (zones[0] || null);
            }
        };
    }
    const bouton = (palier, jeton) => ({ closest: (sel) => (sel === '.palier-projection' ? palier : null), dataset: { jeton } });
    const tick = () => new Promise((r) => setTimeout(r, 0));

    it('D.a en CRÉATION (temp) : sans curseur, le badge va dans « Ce que l\'élève lit », à la fin, et le palier est écrit sur le critère', () => {
        const { win, document } = monter([]);
        win.tempCriteres = [{ ...ALGO, id: 'T' }];
        const texte = zoneFactice({ palierIndex: '4', champ: 'texte', critereIndex: '0' }, 'Verdict.');
        const aide = zoneFactice({ palierIndex: '4', champ: 'texteAide', critereIndex: '0' }, 'Inscris-toi.');
        const palier = palierFactice([texte, aide]);
        document.activeElement = null;
        win.insererRepereEnonce(bouton(palier, '{erreurs}'));
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

    it('D.b la zone FOCALISÉE du palier reçoit le badge, au curseur — la recommandation ici', () => {
        const { win, document } = monter([]);
        win.tempCriteres = [{ ...ALGO, id: 'T' }];
        const texte = zoneFactice({ palierIndex: '4', champ: 'texte', critereIndex: '0' }, 'Verdict.');
        const aide = zoneFactice({ palierIndex: '4', champ: 'texteAide', critereIndex: '0', curseurVu: '1' }, 'Inscris-toi vite.');
        aide.selectionStart = aide.selectionEnd = 'Inscris-toi'.length;
        const palier = palierFactice([texte, aide]);
        document.activeElement = aide;
        win.insererRepereEnonce(bouton(palier, '{service}'));
        expect(aide.value).toBe('Inscris-toi {service} vite.');
        expect(aide.selectionStart, 'le curseur est juste après le badge ; l\'espace qui suit était déjà là').toBe('Inscris-toi {service}'.length);
        expect(texte.value).toBe('Verdict.');
        expect(win.tempCriteres[0].paliersProjection[4].texteAide).toBe('Inscris-toi {service} vite.');
    });

    it('D.c sans focus, la dernière zone VISITÉE du palier (`data-zone-active`) est la cible', () => {
        const { win, document } = monter([]);
        win.tempCriteres = [{ ...ALGO, id: 'T' }];
        const texte = zoneFactice({ palierIndex: '1', champ: 'texte', critereIndex: '0' }, 'V');
        const aide = zoneFactice({ palierIndex: '1', champ: 'texteAide', critereIndex: '0' }, 'A');
        const palier = palierFactice([texte, aide]);
        palier.dataset.zoneActive = 'texteAide';
        document.activeElement = null;
        win.insererRepereEnonce(bouton(palier, '{projection}'));
        expect(aide.value).toBe('A {projection}');
        expect(texte.value).toBe('V');
        expect(win.tempCriteres[0].paliersProjection[1].texteAide).toBe('A {projection}');
    });

    it('D.d en ÉDITION (grille enregistrée) : l\'écriture passe par `db.modifier`, sans rendu', async () => {
        const { win, store, document } = monter([GRILLE]);
        const texte = zoneFactice({ palierIndex: '0', champ: 'texte', critereIndex: '0', grilleId: 'G1' }, 'Zéro faute.');
        const palier = palierFactice([texte]);
        document.activeElement = null;
        let rendus = 0;
        win.afficherCriteresGrille = () => { rendus++; };
        win.insererRepereEnonce(bouton(palier, '{palier}'));
        await tick();
        expect(texte.value).toBe('Zéro faute. {palier}');
        const paliers = store[CLE][0].criteres[0].paliersProjection;
        expect(paliers[0].texte).toBe('Zéro faute. {palier}');
        expect(paliers[0].sansErreur).toBe(true);
        expect(paliers.length).toBe(6);
        expect(rendus, 'le clic ne re-rend pas le gabarit : le curseur doit survivre').toBe(0);
    });

    it('D.e un jeton hors de la palette des paliers ({critere}) ne pose rien et n\'écrit rien', () => {
        const { win, document } = monter([]);
        win.tempCriteres = [{ ...ALGO, id: 'T' }];
        const texte = zoneFactice({ palierIndex: '0', champ: 'texte', critereIndex: '0' }, 'V');
        document.activeElement = null;
        win.insererRepereEnonce(bouton(palierFactice([texte]), '{critere}'));
        expect(texte.value).toBe('V');
        expect(win.tempCriteres[0].paliersProjection).toBeUndefined();
    });

    it('D.f une zone d\'ÉNONCÉ passe toujours par son chemin — rien de l\'étape 1 ne bouge', () => {
        const { win } = monter([]);
        win.tempCriteres = [{ ...ALGO, id: 'T' }];
        const zone = zoneFactice({ enonceCle: 'priorite', critereIndex: '0' }, 'le calcul d\'abord');
        const groupe = { querySelector: (sel) => (sel === 'textarea[data-enonce-cle]' ? zone : null) };
        const el = { closest: (sel) => (sel === '.groupe-form' ? groupe : null), dataset: { jeton: '{critere}' } };
        win.insererRepereEnonce(el);
        expect(zone.value).toBe('le calcul d\'abord {critere}');
        expect(win.tempCriteres[0].enonces.priorite).toBe('le calcul d\'abord {critere}');
        expect(win.tempCriteres[0].paliersProjection).toBeUndefined();
    });
});

/* ======================================================== E — LES INVARIANTS */

describe('texte troué 2 · E — les invariants statiques du gabarit', () => {
    const grilles = source('js/grilles.js');

    it('E.a le clic ne prend pas le focus, et `focusin` connaît les zones de palier', () => {
        expect(grilles).toMatch(/\['pointerdown', 'mousedown'\]/);
        expect(grilles).toMatch(/closest\('\[data-action="insererRepereEnonce"\]'\)\) e\.preventDefault\(\)/);
        expect(grilles).toMatch(/zone\.dataset\.palierIndex !== undefined/);
        expect(grilles).toMatch(/palier\.dataset\.zoneActive = zone\.dataset\.champ/);
        expect(grilles).toMatch(/function _zoneCibleDuPalier\(palier\)/);
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
