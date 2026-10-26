// SENTINELLE — LE TEXTE TROUÉ, ÉTAPE 2 · §8 : UNE SEULE CARTE POUR CE QUE L'ÉLÈVE LIT
// (5 septembre 2026, 7 h 15 — décision de Grégoire : « non pas doublonner, mais fondre les
// deux en un seul endroit d'écriture », dans 1.118 ; titres confirmés par lui à 7 h 24).
//
// Le décompte gris de la ligne « L'élève lira : » « tombait du ciel » : son composeur était
// une carte plus haut. La carte « Projection » devient « Ce que l'élève lit » et se lit de
// haut en bas dans l'ordre exact de la phrase de l'élève : modèle et réglages → aide →
// DÉCOMPTE (venu d'« Observation ») → paliers → notes du bas → bouton. « Observation » garde
// le modèle d'observation et les trois énoncés qui ne parlent pas sur la copie. UN RENDU QUI
// BOUGE, AUCUNE DONNÉE : même clé `enonces.decompte`, mêmes handlers, même texte de départ.
//
//   A. le décompte est rendu UNE fois dans tout le gabarit, dans la carte de projection,
//      absent d'« Observation » — en édition comme en création ;
//   B. l'ordre de lecture de la carte fondue ; le décompte présent même sous « Aucune
//      projection » (il reste composable), sans palier ni aide des paliers ;
//   C. les titres, la clé de pli inchangée, la ligne « Texte de départ », l'aide reprise ;
//   D. même zone, mêmes attributs, même palette, rien d'écrit : rien ne change dans les données ;
//   E. la factorisation (un helper, deux appels) et les jetons anti-cache.
//
// BREAK-TESTS (faits le 5 septembre 2026, chacun restauré, `cmp` identique) :
//   · le décompte rendu DEUX fois (laissé aussi dans « Observation ») → A.a, A.b, B.b, D.b, D.c,
//     E.a rougissent (6) ;
//   · le décompte retiré de la carte de projection → A.a, A.b, B.a, B.b, C.b, D.a, D.b, D.c
//     rougissent, et le B.d de la sentinelle du gabarit avec (9) ;
//   · le titre « Projection » remis → C.a rougit, et le B.c de la sentinelle lot 4 C avec (2).
//
// ↻ LA CARTE « BILAN » (5 septembre 2026, 1.120 — cadrage `CADRAGE-2026-09-05-carte-bilan.md`) :
// « Observation » s'appelle « Bilan » et ne porte plus que `priorite` et `concentre` ; « Aucune
// annotation » vit sous la case des codes, dans la liste des sous-critères (grille enregistrée
// seulement). Les attentes ci-dessous sont adaptées ; `sentinelle-carte-bilan.test.js` porte le
// reste (le pli, le menu, le modèle « Français écrit »).
//
// ↻ #1150, LOT 4 (24 oct. 2026, maquette validée par Grégoire) : les cartes sont devenues les étapes de
// l'atelier. L'INVARIANT DE CE BANC RESTE — le décompte a UN endroit d'écriture —, l'endroit change :
// l'étape « Ce que l'élève lit » (le décompte PUIS les deux phrases du bilan, sous le menu du modèle),
// absent de l'étape « Paliers » (l'ancienne carte de projection). `projection` lit l'étape « Paliers »,
// `commentaire` l'étape « Ce que l'élève lit ». La ligne « Texte de départ » est partie : le menu du
// modèle est juste au-dessus du décompte, dans la même étape.
// BREAK-TESTS (24 oct., restaurés, `shasum` identique) : le décompte rendu aussi dans « Paliers » → A.a,
// A.b, B.a, B.b, D.b, D.c, E.a (et « Bilan » A.b) ; retiré de « Ce que l'élève lit » → A.a, A.b, B.a, B.b,
// D.a, D.b, D.c, E.a (et « Bilan » A.a, A.b, A.c).

import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { etapeDe, etapeOuverte, atelierDe } from './_helpers/atelier-algo.js';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { jetonAuMoins } from './_helpers/jeton-anticache.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');
const require = createRequire(import.meta.url);

const E = require(path.join(racine, 'js/evaluation-enonces.js'));
const P = require(path.join(racine, 'js/evaluation-projection.js'));
const PA = require(path.join(racine, 'js/palette-algo.js'));
const AT = require(path.join(racine, 'js/atelier-algo.js'));

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
        _elements: elements, activeElement: null,
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
    const ecrits = [];
    const db = {
        get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { ecrits.push(k); store[k] = v; },
        setSync: (k, v) => { ecrits.push(k); store[k] = v; },
        modifier: async (k, mutateur, defaut) => {
            ecrits.push(k);
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
    win.paletteAlgo = PA;
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    return { win, store, document, ecrits, liste: () => document.getElementById('listeCriteres') };
}

const ALGO = { id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, modeleProjection: 'norme_externe',
               paramsProjection: { nomServiceAide: 'Passerelle +' } };
const GRILLE = { id: 'G1', nom: 'Philo', dansBibliotheque: true, criteres: [ALGO] };

/** Une carte du gabarit, de son `data-pli` jusqu'à la carte suivante. */
// ↻ #1150, lot 4 (24 oct. 2026) : les cartes sont devenues les étapes de l'atelier (`_helpers/atelier-algo.js`).
const ETAPE_DE = { formule: 'note', projection: 'paliers', commentaire: 'eleve' };
const carte = (html, id, section) => etapeDe(html, id, ETAPE_DE[section] || section);
const compter = (h, motif) => (h.split(motif).length - 1);
const clesDe = (h) => [...h.matchAll(/data-enonce-cle="([a-z]+)"/g)].map((m) => m[1]);
/** Le rendu du gabarit d'une grille en ÉDITION : tout, la carte de projection, la carte « Bilan » (clé de pli `commentaire`). */
function rendu(grille) {
    const m = monter([grille || GRILLE]);
    m.win.afficherCriteresGrille(JSON.parse(JSON.stringify(grille || GRILLE)));
    const html = m.liste().innerHTML;
    return Object.assign(m, { html, projection: carte(html, 'CR', 'projection'), commentaire: carte(html, 'CR', 'commentaire') });
}
/** Le rendu en CRÉATION (mode temp, critère « T »). */
function renduTemp(critere) {
    const m = monter([]);
    // ⚠ Mesuré : au CHARGEMENT de grilles.js (pas au rendu), `migrerCategoriesVersSousCriteres`
    // fait un `db.modifier` — hors de ce lot. Ce qui compte ici, c'est ce que le RENDU écrit.
    m.ecrits.length = 0;
    m.win.tempCriteres = [{ ...ALGO, ...(critere || {}), id: 'T' }];
    m.win.afficherCriteresTemp();
    const html = m.liste().innerHTML;
    return Object.assign(m, { html, projection: carte(html, 'T', 'projection'), commentaire: carte(html, 'T', 'commentaire') });
}
/** Le bloc du décompte dans une carte : de son étiquette au premier palier (ou à la fin). */
const blocDecompte = (projection) => {
    const debut = projection.indexOf('data-enonce-cle="decompte"');
    if (debut < 0) return '';
    const debutGroupe = projection.lastIndexOf('<div class="groupe-form">', debut);
    const fin = projection.indexOf('class="sous-criteres-liste-conteneur"', debut);
    return projection.slice(debutGroupe, fin < 0 ? undefined : fin);
};

/* ====================================================== A — UNE FOIS, AU BON ENDROIT */

describe('une seule carte · A — le décompte est rendu UNE fois, dans « Ce que l\'élève lit », absent d\'« Observation »', () => {
    it('A.a en ÉDITION : une zone `decompte` dans tout le gabarit, dans la carte de projection ; « Bilan » rend les deux du bilan, dans l\'ordre ; « Aucune annotation » sous la case des codes', () => {
        const { html, projection, commentaire } = rendu();
        expect(projection.length).toBeGreaterThan(0);
        expect(commentaire.length).toBeGreaterThan(0);
        expect(compter(html, 'data-enonce-cle="decompte"')).toBe(1);
        // ↻ #1150 : l'étape « Ce que l'élève lit » porte le décompte puis le bilan ; « Paliers » n'en porte aucun.
        expect(compter(commentaire, 'data-enonce-cle="decompte"')).toBe(1);
        expect(projection).not.toContain('data-enonce-cle="decompte"');
        expect(projection).not.toContain('Décompte des erreurs');
        expect(clesDe(commentaire)).toEqual(['decompte', 'priorite', 'concentre']);
        expect(clesDe(projection)).toEqual([]);
        // « Aucune annotation » vit avec les codes (sentinelle `carte-bilan`, B) — l'étape « Codes », avant.
        expect(clesDe(html)).toEqual(['aucune', 'decompte', 'priorite', 'concentre']);
        // Témoin : le décompte est bien celui du registre — son étiquette au mot ; ↻ lot 3a : l'aide est celle
        // de l'atelier (ébauche validée du 26 oct.), qui dit qui lit la phrase, et quand.
        const c = E.listerCles().find((x) => x.cle === 'decompte');
        expect(commentaire).toContain('class="table-cas-zone-nom">' + c.libelle + '</span>');
        expect(blocDecompte(commentaire)).toContain(echapper(AT.TEXTES.aides.decompte));
    });

    it('A.b en CRÉATION (mode temp) : la même chose, par le handler temp', () => {
        const { html, projection, commentaire } = renduTemp();
        expect(compter(html, 'data-enonce-cle="decompte"')).toBe(1);
        expect(clesDe(projection)).toEqual([]);
        expect(clesDe(commentaire)).toEqual(['decompte', 'priorite', 'concentre']);
        // ↻ 21 oct. 2026 (#1131) : la liste des sous-critères existe en création ; « Aucune annotation » y vit, comme en édition.
        expect(clesDe(html)).toEqual(['aucune', 'decompte', 'priorite', 'concentre']);
        expect(blocDecompte(commentaire)).toMatch(/<textarea[^>]*data-on-change="modifierTexteEnonceTempHandler" data-critere-index="0" data-enonce-cle="decompte"/);
    });
});

/* ============================================================ B — L'ORDRE DE LECTURE */

describe('une seule carte · B — la carte se lit de haut en bas dans l\'ordre de la phrase de l\'élève', () => {
    // ↻ #1150 : l'étape « Paliers » se lit sans le décompte — modèle et réglages → aide → paliers → notes → bouton ;
    // l'étape « Ce que l'élève lit », le menu du modèle → le décompte → le bilan.
    it('B.a « Paliers » : modèle et réglages → aide → paliers → notes du bas → bouton ; « Ce que l\'élève lit » : menu → décompte → bilan', () => {
        const { projection, commentaire } = rendu();
        expect(projection).not.toContain('data-enonce-cle="decompte"');
        const menu = commentaire.indexOf('Modèle des phrases</label>');   // ↻ lot 3a : le mot de l'ébauche
        expect(menu).toBeGreaterThan(-1);
        expect(menu).toBeLessThan(commentaire.indexOf('data-enonce-cle="decompte"'));
        expect(commentaire.indexOf('data-enonce-cle="decompte"')).toBeLessThan(commentaire.indexOf('data-enonce-cle="priorite"'));
        const pos = (motif) => { const i = projection.indexOf(motif); expect(i, motif).toBeGreaterThan(-1); return i; };
        // ↻ Lot 3a (26 oct. 2026) : la table des paliers de l'ébauche — l'en-tête (« Retirer la limite »),
        // l'introduction, les réglages, la ligne « Limite : », les rangées, « + Ajouter un palier ».
        const modele = pos('data-action="retirerLimiteAlgo"');
        const aide = pos('class="table-cas-ou"');
        const reglage = pos('data-param-cle="motsReference"');
        const seuil = pos('Limite : 1 erreur à chaque');
        const paliers = pos('class="table-cas-rangee"');
        const bouton = projection.lastIndexOf('+ Ajouter un palier');
        expect(modele).toBeLessThan(aide);
        expect(aide).toBeLessThan(reglage);
        expect(reglage).toBeLessThan(seuil);
        expect(seuil).toBeLessThan(paliers);
        expect(paliers).toBeLessThan(bouton);
        // ↻ Étape 2b (22 oct. 2026) : plus aucune rangée « Poser : » dans la carte — la palette du critère la sert.
        expect(projection).not.toContain('Poser :');
    });

    it('B.b « Aucune projection » : le décompte est là quand même, composable (ce que sa zone offre), avant la note ; ni palier, ni aide des paliers', () => {
        const { html, projection, commentaire } = rendu({ ...GRILLE, criteres: [{ ...ALGO, modeleProjection: 'aucune', paramsProjection: {} }] });
        expect(compter(html, 'data-enonce-cle="decompte"')).toBe(1);
        expect(compter(commentaire, 'data-enonce-cle="decompte"')).toBe(1);
        expect(clesDe(commentaire)).toEqual(['decompte', 'priorite', 'concentre']);
        // ↻ 2b : ce que la zone offre se lit par `paletteAlgo.reperesDeZone`, la source de la palette et de la pose.
        expect(PA.reperesDeZone(ALGO, { enonceCle: 'decompte' }).map((b) => b.jeton)).toEqual(['{critere}', '{erreurs}', '{nomErreurs}', '{mots}', '{nomMots}', '{points}']);
        expect(projection).toContain('Aucune limite fixée : l’étudiant·e ne lit aucun palier.');   // ↻ lot 3a
        expect(projection).not.toContain('data-enonce-cle="decompte"');
        expect(projection).not.toContain('table-cas-rangee');
        expect(projection).not.toContain('table-cas-ou');
        expect(projection).not.toContain('reperes-palier');
        expect(projection).not.toContain('palier-apercu');
    });
});

/* ============================================================ C — LES MOTS */

describe('une seule carte · C — les titres que Grégoire lira, la clé de pli inchangée, la ligne « Texte de départ », l\'aide reprise', () => {
    const titre = (t) => new RegExp('<span class="accordeon-chevron">[▶▼]</span> ' + t.replace(/'/g, "(?:'|&#x27;|&#39;)") + '\\s*<');

    // ↻ #1150 : les titres sont ceux des étapes de la maquette validée ; ↻ lot 3a (ébauche du 26 oct.) :
    // « Cas d'interprétation » et « Ce que l'étudiant·e lit » ; ni « Projection », ni « Bilan », ni « Observation ».
    const etape = (t) => new RegExp('<span class="atelier-algo-etape-nom">' + t.replace(/’/g, "(?:’|&#x2019;)") + '</span>');
    it('C.a les étapes « Cas d\'interprétation » et « Ce que l\'étudiant·e lit » ; plus de carte titrée « Projection » ni « Bilan » ; plus de clé de pli de carte', () => {
        const { html } = rendu();
        expect(html).toMatch(etape('Ce que l’étudiant·e lit'));
        expect(html).toMatch(etape('Cas d’interprétation'));
        expect(html).not.toMatch(titre('Projection'));
        expect(html).not.toMatch(titre('Bilan'));
        expect(html).not.toContain('data-pli="CR:projection"');
        expect(html).not.toContain('data-pli="CR:commentaire"');
        expect(source('js/grilles.js')).not.toMatch(/carteGabaritAlgo/);
    });

    it('C.b la ligne « Texte de départ » est partie : le menu du modèle est dans la même étape, juste au-dessus du décompte', () => {
        const { html, projection, commentaire } = rendu();
        expect(html).not.toContain('decompte-texte-depart');
        expect(html).not.toContain('Texte de départ : le modèle des phrases');
        expect(commentaire).toContain('Modèle des phrases</label>');
        expect(projection).not.toContain('Modèle des phrases</label>');
        const css = source('styles.css');
        expect(css).not.toMatch(/\.decompte-eleve \{/);
        expect(css).not.toMatch(/\.decompte-texte-depart \{/);
    });

    // ↻ Lot 3a (26 oct. 2026) : la ligne d'aperçu sous chaque palier est partie ; « Voir ce que l'étudiant·e
    // lirait à ce palier » règle la simulation de l'atelier sur lui (banc `critere-algorithmique-table-de-cas`).
    it('C.c l\'aide de la carte ne dit plus où le bloc se pose (la palette le dit) ; chaque palier a son « Voir ce que l\'étudiant·e lirait à ce palier »', () => {
        const { projection } = rendu();
        expect(projection).not.toContain('le pose dans la zone où est le curseur');
        expect(projection).not.toContain('la zone du palier où est le curseur');
        expect(projection).not.toContain('palier-apercu');
        expect(compter(projection, 'data-apercu-geste="palier"')).toBe(6);
        expect(projection).not.toContain('décompte, puis tes deux phrases');
    });
});

/* ============================================================ D — RIEN NE CHANGE DANS LES DONNÉES */

describe('une seule carte · D — même zone, mêmes attributs, même palette ; le rendu n\'écrit rien', () => {
    it('D.a la zone du décompte est celle d\'avant : handler, grille, index, clé, valeur en vigueur, aide après ; ↻ 2b : son nom, plus de rangée', () => {
        const { commentaire } = rendu();
        const bloc = blocDecompte(commentaire);
        expect(bloc).toMatch(/<textarea class="controle-form" rows="2"\s+data-on-change="modifierTexteEnonceGrilleHandler" data-grille-id="G1" data-critere-index="0" data-enonce-cle="decompte"/);
        expect(bloc).toContain('>' + echapper(E.normaliser(ALGO).enonces.decompte) + '</textarea>');
        expect(bloc).toContain('data-enonce-cle="decompte" data-nom-zone="Décompte des erreurs"');
        expect(bloc).not.toContain('insererRepereEnonce');   // ↻ lot 3a : le seul bouton est « Revenir au modèle »
        expect(bloc.indexOf('<textarea')).toBeLessThan(bloc.indexOf('<small'));
    });

    it('D.b un décompte écrit par l\'enseignant·e se lit dans l\'étape « Ce que l\'élève lit », échappé, et pas dans « Paliers »', () => {
        const ecrit = 'Mon décompte : {erreurs} <b>fautes</b> sur {mots} "mots".';
        const { html, projection, commentaire } = rendu({ ...GRILLE, criteres: [{ ...ALGO, enonces: { decompte: ecrit } }] });
        expect(blocDecompte(commentaire)).toContain('>' + echapper(ecrit) + '</textarea>');
        expect(html).not.toContain('<b>fautes</b>');
        // Les lignes « L'élève lira : » des paliers le citent rempli (c'est leur objet) ; aucune zone ne l'y écrit.
        expect(projection).not.toContain('>' + echapper(ecrit) + '</textarea>');
    });

    it('D.c le rendu n\'écrit ni dans la grille ni dans le stockage, en édition comme en création', () => {
        const m = monter([GRILLE]);
        m.ecrits.length = 0;
        const avant = JSON.stringify(m.store[CLE]);
        const copie = JSON.parse(JSON.stringify(GRILLE));
        m.win.afficherCriteresGrille(copie);
        expect(compter(m.liste().innerHTML, 'data-enonce-cle="decompte"')).toBe(1);
        expect(JSON.stringify(m.store[CLE])).toBe(avant);
        expect(copie).toEqual(GRILLE);
        expect(m.ecrits).toEqual([]);
        const t = renduTemp();
        expect(t.ecrits).toEqual([]);
        expect(t.win.tempCriteres[0].enonces).toBeUndefined();
    });
});

/* ============================================================ E — LA FACTORISATION, LES JETONS */

describe('une seule carte · E — un helper, deux appels ; les jetons anti-cache ont bougé', () => {
    it('E.a `rendreChampEnonceAlgo` est déclaré une fois et appelé deux fois (↻ #1150) ; « Ce que l\'élève lit » ne filtre que « aucune » ; la zone n\'est écrite qu\'à un endroit', () => {
        const src = source('js/grilles.js');
        expect((src.match(/function rendreChampEnonceAlgo\(/g) || []).length).toBe(1);
        expect((src.match(/rendreChampEnonceAlgo\(/g) || []).length).toBe(3);   // la déclaration + deux appels (« Ce que l'élève lit », « Aucune annotation » avec les codes)
        expect((src.match(/listerCles\(\)\.filter\(\(c\) => c\.cle !== 'aucune'\)/g) || []).length).toBe(1);
        expect((src.match(/data-enonce-cle="\$\{esc\(c\.cle\)\}"/g) || []).length).toBe(1);
        expect(src).not.toMatch(/rendreBlocApercuAlgo/);
    });

    it('E.b grilles.js et styles.css', () => {
        const html = source('index.html');
        { const j = jetonAuMoins(html, 'js/grilles.js', '20260904n'); expect(j.ok, j.message).toBe(true); }
        { const j = jetonAuMoins(html, 'styles.css', '20260904j'); expect(j.ok, j.message).toBe(true); }
    });
});
