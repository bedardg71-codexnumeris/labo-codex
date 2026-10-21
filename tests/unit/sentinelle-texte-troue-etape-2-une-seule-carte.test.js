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

import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
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
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    return { win, store, document, ecrits, liste: () => document.getElementById('listeCriteres') };
}

const ALGO = { id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, modeleProjection: 'norme_externe',
               paramsProjection: { nomServiceAide: 'Passerelle +' } };
const GRILLE = { id: 'G1', nom: 'Philo', dansBibliotheque: true, criteres: [ALGO] };

/** Une carte du gabarit, de son `data-pli` jusqu'à la carte suivante. */
const carte = (html, id, section) => {
    const i = html.indexOf('data-pli="' + id + ':' + section + '"');
    if (i < 0) return '';
    const suivant = html.indexOf('class="carte accordeon gabarit-algo-carte', i + 10);
    return html.slice(i, suivant < 0 ? undefined : suivant);
};
const compter = (h, motif) => (h.split(motif).length - 1);
const clesDe = (h) => [...h.matchAll(/data-enonce-cle="([a-z]+)"/g)].map((m) => m[1]);
const boutons = (bloc) => [...bloc.matchAll(/<button type="button" class="repere-enonce repere-enonce--(posee|remplie)"\s+data-action="insererRepereEnonce" data-jeton="([^"]+)"[^>]*>([^<]*)<\/button>/g)]
    .map((m) => ({ famille: m[1], jeton: m[2], texte: m[3] }));
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
        expect(compter(projection, 'data-enonce-cle="decompte"')).toBe(1);
        expect(commentaire).not.toContain('data-enonce-cle="decompte"');
        expect(commentaire).not.toContain('Décompte des erreurs');
        expect(clesDe(commentaire)).toEqual(['priorite', 'concentre']);
        expect(clesDe(projection)).toEqual(['decompte']);
        // ↻ La carte « Bilan » (1.120) : « Aucune annotation » vit sous la case des codes, dans la liste
        // des sous-critères — rendue AVANT les cartes (sentinelle `carte-bilan`, B).
        expect(clesDe(html)).toEqual(['aucune', 'priorite', 'concentre', 'decompte']);
        // Témoin : le décompte est bien celui du registre — étiquette et aide au mot.
        const c = E.listerCles().find((x) => x.cle === 'decompte');
        expect(projection).toContain('>' + c.libelle + '</label>');
        expect(blocDecompte(projection)).toContain(echapper(c.aide));
    });

    it('A.b en CRÉATION (mode temp) : la même chose, par le handler temp', () => {
        const { html, projection, commentaire } = renduTemp();
        expect(compter(html, 'data-enonce-cle="decompte"')).toBe(1);
        expect(clesDe(projection)).toEqual(['decompte']);
        expect(clesDe(commentaire)).toEqual(['priorite', 'concentre']);
        // ↻ 21 oct. 2026 (#1131) : la liste des sous-critères existe en création ; « Aucune annotation » y vit, comme en édition.
        expect(clesDe(html)).toEqual(['aucune', 'priorite', 'concentre', 'decompte']);
        expect(blocDecompte(projection)).toMatch(/<textarea[^>]*data-on-change="modifierTexteEnonceTempHandler" data-critere-index="0" data-enonce-cle="decompte"/);
    });
});

/* ============================================================ B — L'ORDRE DE LECTURE */

describe('une seule carte · B — la carte se lit de haut en bas dans l\'ordre de la phrase de l\'élève', () => {
    it('B.a modèle et réglages → aide → décompte → paliers → notes du bas → bouton', () => {
        const { projection } = rendu();
        const pos = (motif) => { const i = projection.indexOf(motif); expect(i, motif).toBeGreaterThan(-1); return i; };
        const modele = pos('Modèle de projection');
        const reglage = pos('data-param-cle="motsReference"');
        const seuil = pos('Seuil de l\'épreuve');
        const aide = pos('palier-note-composer');
        const decompte = pos('data-enonce-cle="decompte"');
        const paliers = pos('class="sous-critere-item palier-projection"');
        const nonCorrigee = pos('palier-apercu-non-corrigee');
        const bouton = projection.lastIndexOf('+ Ajouter un palier');
        expect(modele).toBeLessThan(reglage);
        expect(reglage).toBeLessThan(seuil);
        expect(seuil).toBeLessThan(aide);
        expect(aide).toBeLessThan(decompte);
        expect(decompte).toBeLessThan(paliers);
        expect(paliers).toBeLessThan(nonCorrigee);
        expect(nonCorrigee).toBeLessThan(bouton);
        // Le décompte précède la palette du premier palier : le premier « Poser : » de la carte est le sien.
        expect(projection.indexOf('Poser :')).toBeGreaterThan(projection.lastIndexOf('<div class="groupe-form">', decompte));
        expect(projection.indexOf('Poser :')).toBeLessThan(decompte);
    });

    it('B.b « Aucune projection » : le décompte est là quand même, composable (ses quatre badges), avant la note ; ni palier, ni aide des paliers', () => {
        const { html, projection, commentaire } = rendu({ ...GRILLE, criteres: [{ ...ALGO, modeleProjection: 'aucune', paramsProjection: {} }] });
        expect(compter(html, 'data-enonce-cle="decompte"')).toBe(1);
        expect(compter(projection, 'data-enonce-cle="decompte"')).toBe(1);
        expect(clesDe(commentaire)).toEqual(['priorite', 'concentre']);
        expect(boutons(blocDecompte(projection)).map((b) => b.jeton)).toEqual(['{critere}', '{erreurs}', '{mots}', '{points}']);
        expect(projection).toContain('Aucune projection ne sera proposée');
        expect(projection.indexOf('data-enonce-cle="decompte"')).toBeLessThan(projection.indexOf('Aucune projection ne sera proposée'));
        expect(projection).not.toContain('palier-projection');
        expect(projection).not.toContain('palier-note-composer');
        expect(projection).not.toContain('reperes-palier');
        expect(projection).not.toContain('palier-apercu');
    });
});

/* ============================================================ C — LES MOTS */

describe('une seule carte · C — les titres que Grégoire lira, la clé de pli inchangée, la ligne « Texte de départ », l\'aide reprise', () => {
    const titre = (t) => new RegExp('<span class="accordeon-chevron">[▶▼]</span> ' + t.replace(/'/g, "(?:'|&#x27;|&#39;)") + '\\s*<');

    it('C.a « Ce que l\'élève lit » et « Bilan » (↻ 1.120, d\'abord « Observation ») ; plus de carte titrée « Projection » ; la clé de pli `projection` reste (mémoire des plis)', () => {
        const { html } = rendu();
        expect(html).toMatch(titre('Ce que l\'élève lit'));
        expect(html).toMatch(titre('Bilan'));
        expect(source('js/grilles.js')).not.toMatch(/carteGabaritAlgo\(critere, ctx, 'commentaire', 'Observation'/);
        expect(html).not.toMatch(titre('Projection'));
        expect(html).toContain('data-pli="CR:projection"');
        expect(html).toContain('data-pli="CR:commentaire"');
        expect(source('js/grilles.js')).toMatch(/carteGabaritAlgo\(critere, ctx, 'projection', 'Ce que l\\'élève lit'/);
    });

    it('C.b sous le décompte, une fois : « Texte de départ : le modèle des phrases, carte « Bilan ». » ; le menu du modèle reste dans « Bilan »', () => {
        const { projection, commentaire } = rendu();
        expect(compter(projection, 'decompte-texte-depart')).toBe(1);
        expect(projection).toContain('Texte de départ : le modèle des phrases, carte « Bilan ».');
        const ligne = projection.indexOf('decompte-texte-depart');
        expect(ligne).toBeGreaterThan(projection.indexOf('data-enonce-cle="decompte"'));
        expect(ligne).toBeLessThan(projection.indexOf('class="sous-critere-item palier-projection"'));
        expect(commentaire).toContain('Modèle des phrases (bilan et décompte)');
        expect(projection).not.toContain('Modèle des phrases (bilan et décompte)</label>');
        // Ses classes vivent dans styles.css, scopées à l'éditeur.
        const css = source('styles.css');
        expect(css).toMatch(/#listeCriteres \.decompte-eleve \{/);
        expect(css).toMatch(/#listeCriteres \.decompte-texte-depart \{[^}]*color: var\(--gris-clair\)/);
    });

    it('C.c l\'aide de la carte dit « la zone où est le curseur » (plus « du palier ») ; la ligne d\'aperçu redevient « L\'élève lira : »', () => {
        const { projection } = rendu();
        expect(projection).toContain('le pose dans la zone où est le curseur — sans curseur, dans « Verdict »');
        expect(projection).not.toContain('la zone du palier où est le curseur');
        expect(compter(projection, '<span class="palier-apercu-mot">L\'élève lira :</span>')).toBe(6);
        expect(projection).not.toContain('décompte, puis tes deux phrases');
    });
});

/* ============================================================ D — RIEN NE CHANGE DANS LES DONNÉES */

describe('une seule carte · D — même zone, mêmes attributs, même palette ; le rendu n\'écrit rien', () => {
    it('D.a la zone du décompte est celle d\'avant : handler, grille, index, clé, valeur en vigueur, palette avant la zone, aide après', () => {
        const { projection } = rendu();
        const bloc = blocDecompte(projection);
        expect(bloc).toMatch(/<textarea class="controle-form" rows="2"\s+data-on-change="modifierTexteEnonceGrilleHandler" data-grille-id="G1" data-critere-index="0" data-enonce-cle="decompte"/);
        expect(bloc).toContain('>' + echapper(E.normaliser(ALGO).enonces.decompte) + '</textarea>');
        expect(boutons(bloc).map((b) => [b.jeton, b.famille, b.texte])).toEqual([
            ['{critere}', 'posee', 'critere'], ['{erreurs}', 'remplie', 'erreurs'], ['{mots}', 'remplie', 'mots'], ['{points}', 'remplie', 'points']
        ]);
        expect(bloc).toContain('aria-label="Poser nom du critère, {critere}, dans « Décompte des erreurs »"');
        expect(bloc.indexOf('class="reperes-enonce"')).toBeLessThan(bloc.indexOf('<textarea'));
        expect(bloc.indexOf('<textarea')).toBeLessThan(bloc.indexOf('<small'));
    });

    it('D.b un décompte écrit par l\'enseignant·e se lit dans la carte de projection, échappé, et nulle part ailleurs', () => {
        const ecrit = 'Mon décompte : {erreurs} <b>fautes</b> sur {mots} "mots".';
        const { projection, commentaire } = rendu({ ...GRILLE, criteres: [{ ...ALGO, enonces: { decompte: ecrit } }] });
        expect(blocDecompte(projection)).toContain('>' + echapper(ecrit) + '</textarea>');
        expect(projection).not.toContain('<b>fautes</b>');
        expect(commentaire).not.toContain('Mon décompte');
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
    it('E.a `rendreChampEnonceAlgo` est déclaré une fois et appelé trois fois (↻ 1.120) ; « Bilan » filtre le décompte et « aucune » ; la zone n\'est écrite qu\'à un endroit', () => {
        const src = source('js/grilles.js');
        expect((src.match(/function rendreChampEnonceAlgo\(/g) || []).length).toBe(1);
        expect((src.match(/rendreChampEnonceAlgo\(/g) || []).length).toBe(4);   // la déclaration + trois appels (« Bilan », le décompte, « Aucune annotation » sous la case des codes)
        expect((src.match(/listerCles\(\)\.filter\(\(c\) => c\.cle !== 'decompte' && c\.cle !== 'aucune'\)/g) || []).length).toBe(1);
        expect((src.match(/data-enonce-cle="\$\{esc\(c\.cle\)\}"/g) || []).length).toBe(1);
        expect(src).not.toMatch(/rendreBlocApercuAlgo/);
    });

    it('E.b grilles.js et styles.css', () => {
        const html = source('index.html');
        { const j = jetonAuMoins(html, 'js/grilles.js', '20260904n'); expect(j.ok, j.message).toBe(true); }
        { const j = jetonAuMoins(html, 'styles.css', '20260904j'); expect(j.ok, j.message).toBe(true); }
    });
});
