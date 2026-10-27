// SENTINELLE — LE CRITÈRE ALGORITHMIQUE, ÉTAPE 1 : LE MIROIR (22 octobre 2026).
// Consigne `plans de travail/CONSIGNE-LOT-2026-10-21-critere-algorithmique-miroir.md` ;
// plan `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, étape 1 et « Le garde-fou commun ».
//
// Sous la formule, « Essai sur des copies fictives » : pour chaque copie, la note et ce que
// l'élève lirait. Deux disciplines fictives (garde-fou du plan) : « Français écrit » (rédaction,
// mots) et « Unités et chiffres significatifs » (chimie, longueur de référence en calculs).
//
//   A. UN SEUL CALCUL : la note du miroir est celle de `formulesAlgo.calculer` pour la même copie,
//      pour les trois modèles ; aucune note ne vient d'ailleurs ;
//   B. LES COPIES SUIVENT LES RÉGLAGES : l'étendue est la longueur de référence (facteur, ou
//      projection), « beaucoup » est le plancher de la formule ; changer un réglage change les copies ;
//   C. LA COPIE PONDÉRÉE : « (N après pondération) » dans la phrase, et la note suit la somme ;
//      absente quand tous les codes pèsent 1 ou que le critère ne tire pas ses codes de ses sous-critères ;
//   D. LECTURE SEULE : rien n'est écrit dans le critère ni dans le stockage ;
//   E. LE RENDU : le bloc est dans la carte « Formule », sous « Formule appliquée », sans contrôle,
//      en création comme en modification ; sans pondération, une phrase le dit ; en chimie, il ne
//      dit pas « français » ; la phrase « Aucun sous-critère pour l'instant » (point 7) ;
//   F. LE CHARGEMENT : index.html charge miroir-algo.js après ses registres, avant grilles.js.
//
// ↻ #1150, LOT 4 (24 oct. 2026, maquette validée) : le bloc rendu sous la formule est remplacé par « Ce que
// l'élève lira », la copie fictive réglable de l'atelier. A à D (le calcul, les copies, la pondération, la
// lecture seule) restent ici ; E vérifie que le bloc est parti de l'étape « Note » sans rien changer à ce que
// le rendu écrit ; ce que l'aperçu montre (note, phrases, copie pondérée, ligne du facteur, sans pondération)
// est éprouvé par `atelier-algo.test.js` (jsdom) et `critere-algorithmique-presentation.spec.js` (WebKit).
//
// BREAK-TESTS (faits le 22 octobre 2026, chacun restauré, `cmp` identique) :
//   · `essayer` rend `points: 30` en dur au lieu du calcul → A.a, A.b et E.a rougissent ;
//   · `etendue` rend 500 en dur au lieu du réglage → B.a, B.b, B.c, B.d et C.a rougissent ;
//   · la somme sans les poids (`codesAnnotation.sommePonderee`) → C.a, E.b, et S.a de critere-algorithmique-dit-vrai.
// VERDICT DU 22 OCT. (retouches 1 à 3), break-tests faits le même jour, restaurés, `cmp` identique :
//   · la ligne du facteur rendue quelle que soit l'origine de l'étendue → E.e rougit ;
//   · le tiret cadratin remis avant « la note touche le plancher » → E.a rougit.

import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');

/* ------------------------------------------------------------------ harnais */

/** Les registres et le miroir dans UN même window : `codesAnnotation` y lit `enoncesAlgo`. */
function registres() {
    const win = {};
    ['js/evaluation-enonces.js', 'js/evaluation-formules.js', 'js/evaluation-projection.js',
        'js/codes-annotation.js', 'js/miroir-algo.js'].forEach((f) => chargerScript(f, {}, win));
    return win;
}

const geler = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === 'object') geler(v); }); return Object.freeze(o); };

const FRANCAIS = {
    id: 'CR_FR', nom: 'Français écrit', type: 'algorithmique', ponderation: 30,
    modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 500 },
    modeleProjection: 'aucune', paramsProjection: {}
};
const CHIMIE = {
    id: 'CR_CH', nom: 'Unités et chiffres significatifs', type: 'algorithmique', ponderation: 20,
    modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 12 },
    modeleProjection: 'aucune', paramsProjection: {},
    codesSousCriteresSeulement: true,
    // Étape 2a (22 oct. 2026) : le banc sans texte du plan — « unité manquante » sur « calcul ».
    noms: { erreurs: { singulier: 'unité manquante', pluriel: 'unités manquantes' }, mots: { singulier: 'calcul', pluriel: 'calculs' } },
    sousCriteres: [
        { code: '1', nom: 'Unité manquante', ponderation: 1.5 },
        { code: '2', nom: 'Chiffres significatifs', ponderation: 0.5 },
        { code: '3', nom: 'Arrondi', ponderation: 1 }
    ]
};
const avec = (c, modele, params) => ({ ...c, modeleFormule: modele, paramsFormule: params });
const MODELES = [
    ['penalite_normalisee', { facteurNormalisation: 500 }],
    ['ratio_cible', { motsParErreurCible: 60 }],
    ['penalite_par_erreur', { pointsParErreur: 2 }]
];

/* ======================================================== A — UN SEUL CALCUL */

describe('miroir · A — la note est celle de formulesAlgo.calculer, pour les trois modèles', () => {
    it('A.a chaque copie, chaque modèle, deux disciplines : points et pourcentage = calculer(…).pctBorne', () => {
        const win = registres();
        [FRANCAIS, CHIMIE].forEach((base) => MODELES.forEach(([modele, params]) => {
            const c = avec(base, modele, params);
            const essais = win.miroirAlgo.essais(c);
            expect(essais.length, modele).toBeGreaterThanOrEqual(3);
            essais.forEach((e) => {
                const r = win.formulesAlgo.calculer(c, { ponderation: c.ponderation, erreurs: e.copie.erreursFormule, mots: e.copie.mots || 0 });
                expect(e.applicable, modele + ' ' + e.copie.cle).toBe(r.applicable);
                expect(e.pourcentage, modele + ' ' + e.copie.cle).toBe(r.pctBorne);
                expect(e.points, modele + ' ' + e.copie.cle).toBeCloseTo(r.pctBorne * c.ponderation / 100, 10);
            });
        }));
    });

    it('A.b la note passe PAR calculer : un registre espionné qui rend 37 % donne 37 % partout', () => {
        const win = registres();
        const vrai = win.formulesAlgo.calculer;
        const appels = [];
        win.formulesAlgo.calculer = (c, d) => {
            appels.push(d);
            const r = vrai(c, d);
            return r.applicable ? { ...r, pctBorne: 37 } : r;
        };
        const essais = win.miroirAlgo.essais(FRANCAIS);
        win.formulesAlgo.calculer = vrai;
        expect(appels.length).toBeGreaterThan(0);
        essais.forEach((e) => {
            expect(e.pourcentage).toBe(37);
            expect(e.points).toBeCloseTo(0.37 * 30, 10);
        });
        // et elle reçoit ce que la copie porte : la somme pondérée, l'étendue, la pondération du critère ;
        // ↻ étape 4b (27 oct.) : et le compte brut, que lit un calcul composé.
        essais.forEach((e) => expect(appels).toContainEqual({ ponderation: 30, erreurs: e.copie.erreursFormule, mots: e.copie.mots, compte: e.copie.erreurs }));
    });

    it('A.c la phrase de l\'élève = décompte (avec mentionPonderee) puis projection, comme l\'évaluation', () => {
        const win = registres();
        const c = { ...FRANCAIS, modeleProjection: 'norme_externe', paramsProjection: { nomServiceAide: 'Centre d\'aide' } };
        win.miroirAlgo.essais(c).forEach((e) => {
            const decompte = win.enoncesAlgo.enonce(c, 'decompte', { erreurs: e.copie.erreurs, mots: e.copie.mots, points: win.enoncesAlgo.mentionPonderee(e.copie.erreurs, e.copie.erreursFormule) });
            const p = win.projectionAlgo.calculer(c, { erreurs: e.copie.erreurs, mots: e.copie.mots });
            expect(e.eleve).toBe([decompte, p.applicable ? p.texte : ''].filter(Boolean).join(' '));
        });
    });
});

/* ======================================================= B — LES RÉGLAGES */

describe('miroir · B — les copies viennent des réglages de la grille', () => {
    it('B.a l\'étendue : la longueur de la projection, sinon celle de la formule — 500 mots en français, 12 calculs en chimie', () => {
        const win = registres();
        expect(win.miroirAlgo.copies(FRANCAIS).every((x) => x.mots === 500)).toBe(true);
        expect(win.miroirAlgo.copies(CHIMIE).every((x) => x.mots === 12)).toBe(true);
        const autre = { ...FRANCAIS, paramsFormule: { facteurNormalisation: 600 } };
        expect(win.miroirAlgo.copies(autre).every((x) => x.mots === 600)).toBe(true);
        expect(win.miroirAlgo.copies({ ...FRANCAIS, modeleProjection: 'norme_externe', paramsProjection: { motsReference: 900 } })
            .every((x) => x.mots === 900)).toBe(true);
    });

    it('B.b changer le facteur change les notes (copies à la longueur de la projection) ; sans projection, l\'étendue suit le facteur', () => {
        const win = registres();
        const proj = { ...FRANCAIS, modeleProjection: 'norme_externe', paramsProjection: { motsReference: 900 } };
        const a = win.miroirAlgo.essais(proj);
        const b = win.miroirAlgo.essais({ ...proj, paramsFormule: { facteurNormalisation: 250 } });
        expect(a.map((e) => e.copie.erreurs)).not.toEqual(b.map((e) => e.copie.erreurs));
        // 900 mots, facteur 500 → plancher à 54 erreurs ; facteur 250 → à 108
        expect(a.find((e) => e.copie.cle === 'beaucoup').copie.erreurs).toBe(54);
        expect(b.find((e) => e.copie.cle === 'beaucoup').copie.erreurs).toBe(108);
        expect(win.miroirAlgo.copies({ ...FRANCAIS, paramsFormule: { facteurNormalisation: 250 } })[0].mots).toBe(250);
        [FRANCAIS, CHIMIE, avec(FRANCAIS, 'penalite_par_erreur', { pointsParErreur: 2 })].forEach((c) => {
            const beaucoup = win.miroirAlgo.copies(c).find((x) => x.cle === 'beaucoup');
            const note = (n) => win.formulesAlgo.calculer(c, { ponderation: c.ponderation, erreurs: n, mots: beaucoup.mots || 0 }).pctBorne;
            expect(note(beaucoup.erreurs), c.id).toBe(0);
            expect(note(beaucoup.erreurs - 1), c.id).toBeGreaterThan(0);
        });
        // Français : 30 − E × 500/500 → plancher à 30 erreurs ; quelques = 8
        expect(win.miroirAlgo.copies(FRANCAIS).map((x) => [x.cle, x.erreurs])).toEqual([['aucune', 0], ['quelques', 8], ['beaucoup', 30]]);
    });

    it('B.c le ratio visé n\'atteint jamais le plancher : « beaucoup » est la moitié de la note', () => {
        const win = registres();
        const c = avec(FRANCAIS, 'ratio_cible', { motsParErreurCible: 60 });
        const beaucoup = win.miroirAlgo.essais(c).find((e) => e.copie.cle === 'beaucoup');
        expect(beaucoup.copie.mots).toBe(600);   // dix fois le ratio visé, sans projection
        expect(beaucoup.pourcentage).toBeLessThanOrEqual(50);
        expect(beaucoup.plancher).toBe(false);
    });

    it('B.d sans longueur dans la formule, la projection la donne ; sans les deux, la copie est sans étendue', () => {
        const win = registres();
        const fixe = avec(FRANCAIS, 'penalite_par_erreur', { pointsParErreur: 1 });
        const projete = { ...fixe, modeleProjection: 'norme_externe', paramsProjection: { motsReference: 800 } };
        expect(win.miroirAlgo.copies(projete)[0].mots).toBe(800);
        expect(win.miroirAlgo.copies(fixe)[0].mots).toBe(null);
    });

    it('B.e sans pondération, aucune copie : aucune note ne se calcule', () => {
        const win = registres();
        expect(win.miroirAlgo.copies({ ...FRANCAIS, ponderation: 0 })).toEqual([]);
        expect(win.miroirAlgo.copies({ ...FRANCAIS, ponderation: null })).toEqual([]);
    });
});

/* ===================================================== C — LA COPIE PONDÉRÉE */

describe('miroir · C — la copie pondérée montre la parenthèse et son effet sur la note', () => {
    it('C.a en chimie (codes 1,5 et 0,5) : la somme d\'Annoter, la parenthèse, la note sur la somme', () => {
        const win = registres();
        const e = win.miroirAlgo.essais(CHIMIE).find((x) => x.copie.cle === 'ponderee');
        expect(e).toBeTruthy();
        const quelques = win.miroirAlgo.copies(CHIMIE).find((x) => x.cle === 'quelques').erreurs;
        expect(e.copie.erreurs).toBe(quelques);
        const compteurs = { errfr_1: Math.ceil(quelques / 2), errfr_2: quelques - Math.ceil(quelques / 2) };
        expect(e.copie.erreursFormule).toBe(win.codesAnnotation.sommePonderee({ criteres: [CHIMIE] }, compteurs));
        expect(e.copie.erreursFormule).toBe(compteurs.errfr_1 * 1.5 + compteurs.errfr_2 * 0.5);
        expect(e.decompte).toContain(win.enoncesAlgo.mentionPonderee(e.copie.erreurs, e.copie.erreursFormule).trim());
        expect(e.decompte).toMatch(/après pondération\)/);
        const r = win.formulesAlgo.calculer(CHIMIE, { ponderation: 20, erreurs: e.copie.erreursFormule, mots: 12 });
        expect(e.pourcentage).toBe(r.pctBorne);
        const brute = win.miroirAlgo.essais(CHIMIE).find((x) => x.copie.cle === 'quelques');
        expect(e.pourcentage).not.toBe(brute.pourcentage);
    });

    it('C.b pas de copie pondérée quand tous les codes pèsent 1, ou que le critère ne tire pas ses codes de ses sous-critères', () => {
        const win = registres();
        const unite = { ...CHIMIE, sousCriteres: CHIMIE.sousCriteres.map((s) => ({ ...s, ponderation: 1 })) };
        expect(win.miroirAlgo.copies(unite).some((x) => x.cle === 'ponderee')).toBe(false);
        const sansCodes = { ...CHIMIE };
        delete sansCodes.codesSousCriteresSeulement;
        expect(win.miroirAlgo.copies(sansCodes).some((x) => x.cle === 'ponderee')).toBe(false);
    });

    it('C.c Annoter lit la même somme : travauxOutils.sommePondereeErreurs délègue à codesAnnotation.sommePonderee', () => {
        const src = readFileSync(path.join(racine, 'js/travaux-outils.js'), 'utf8');
        const corps = tranche(src, 'function sommePondereeErreurs(', 'function mettreAJourCompteursErreurs(');
        expect(corps).toContain('t.sommePonderee(g, compteurs)');
        expect(corps).not.toMatch(/\.poids/);
    });
});

/* ======================================================= D — LECTURE SEULE */

describe('miroir · D — lecture seule', () => {
    it('D.a un critère gelé passe sans erreur et sans changement, pour les trois modèles et la copie pondérée', () => {
        const win = registres();
        [CHIMIE, ...MODELES.map(([m, p]) => avec(FRANCAIS, m, p))].forEach((c) => {
            const gele = geler(JSON.parse(JSON.stringify(c)));
            const avant = JSON.stringify(gele);
            expect(() => win.miroirAlgo.essais(gele)).not.toThrow();
            expect(JSON.stringify(gele)).toBe(avant);
        });
    });
});

/* ============================================================ E — LE RENDU */

const echapper = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function monterGrilles(grilles) {
    const store = { a2026_grillesTemplates: JSON.parse(JSON.stringify(grilles)) };
    const ecrits = [];
    const elements = {};
    const element = () => ({ value: '', innerHTML: '', textContent: '', style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        querySelectorAll: () => [], querySelector: () => null, addEventListener() {}, appendChild() {}, setAttribute() {}, focus() {} });
    const document = { activeElement: null, getElementById: (id) => (elements[id] || (elements[id] = element())),
        querySelector: () => null, querySelectorAll: () => [], body: { appendChild() {}, removeChild() {} },
        createElement: () => element(), addEventListener() {}, removeEventListener() {} };
    const db = {
        get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { ecrits.push(k); store[k] = v; },
        setSync: (k, v) => { ecrits.push(k); store[k] = v; },
        modifier: async (k, m, d) => { ecrits.push(k); const r = await m(k in store ? store[k] : d); if (r !== undefined) store[k] = r; return r; }
    };
    const globaux = { db, document, cle: (k) => 'a2026_' + k, echapperHtml: echapper,
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8), alert() {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc', grilleTemplateActuelle: null };
    const win = registres();
    chargerScript('js/atelier-algo.js', { document }, win);   // #1150 : l'atelier rend le gabarit
    chargerScript('js/ui-blocs.js', globaux, win);
    chargerScript('js/grilles.js', globaux, win);
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    return { win, ecrits, store, html: () => document.getElementById('listeCriteres').innerHTML };
}

describe('miroir · E — ↻ #1150 : le bloc est parti de l\'étape « Note » ; « Ce que l\'élève lira » le remplace', () => {
    it('E.a ni « Essai sur des copies fictives » ni liste de copies dans le gabarit, en édition comme en création ; l\'aperçu est là, et le rendu n\'écrit rien de plus', () => {
        const G = { id: 'G1', nom: 'Rédaction', criteres: [FRANCAIS] };
        const { win, store, html } = monterGrilles([G]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(G)));
        expect(html()).not.toContain('miroir-algo');
        expect(html()).not.toContain('Essai sur des copies fictives');
        expect(html()).toContain('<aside class="apercu-algo" data-apercu-algo="0"');
        expect(html()).toContain('Le calcul de la note');   // ↻ étape 4a : les cartes de « Note calculée »
        const temp = monterGrilles([]);
        temp.win.tempCriteres = [{ ...FRANCAIS, id: 'T1' }];
        temp.win.afficherCriteresTemp();
        expect(temp.html()).not.toContain('miroir-algo');
        expect(temp.html()).toContain('<aside class="apercu-algo" data-apercu-algo="0"');
        // Le rendu n'écrit rien que le rendu sans miroir n'écrivait déjà (mesuré le 22 oct.).
        const temoin = monterGrilles([G]);
        delete temoin.win.miroirAlgo;
        temoin.win.afficherCriteresGrille(JSON.parse(JSON.stringify(G)));
        expect(JSON.stringify(store)).toBe(JSON.stringify(temoin.store));
        expect(source('js/grilles.js')).not.toMatch(/rendreMiroirAlgo|suivreMiroirAlgo/);
    });

    it('E.e la ligne du facteur reste un libellé du miroir, qui nomme ce que le critère compte (étape 2a)', () => {
        const LIGNE = 'Sans limite fixée, ces copies ont la longueur fixée dans le calcul : à cette longueur, chaque erreur coûte un point.';
        expect(registres().miroirAlgo.libelles(FRANCAIS).etendueDuFacteur).toBe(LIGNE);
        expect(registres().miroirAlgo.libelles(CHIMIE).etendueDuFacteur).toBe(LIGNE.replace('chaque erreur', 'chaque unité manquante'));
        expect(registres().miroirAlgo.libelles(FRANCAIS)).not.toHaveProperty('titre');
    });

    it('E.d sous un critère sans sous-critère : « Aucun sous-critère pour l\'instant » (point 7 de la consigne)', () => {
        const G = { id: 'G3', criteres: [{ id: 'CR', nom: 'X', type: 'algorithmique', ponderation: 20 }] };
        const { win, html } = monterGrilles([G]);
        win.afficherCriteresGrille(JSON.parse(JSON.stringify(G)));
        expect(html()).toContain('Aucun sous-critère pour l\'instant : ajoute les tiens, ou pars de la liste du français écrit.');
        expect(html()).not.toContain('Aucun sous-critère défini');
    });
});

/* ======================================================== F — LE CHARGEMENT */

describe('miroir · F — index.html', () => {
    it('F.a miroir-algo.js est chargé après ses registres et avant grilles.js, avec un jeton', () => {
        const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
        const pos = (f) => html.indexOf('src="js/' + f + '?v=');
        expect(pos('miroir-algo.js')).toBeGreaterThan(0);
        ['evaluation-formules.js', 'evaluation-projection.js', 'evaluation-enonces.js', 'codes-annotation.js', 'note-pourcentage.js']
            .forEach((f) => expect(pos('miroir-algo.js'), f).toBeGreaterThan(pos(f)));
        expect(pos('miroir-algo.js')).toBeLessThan(pos('grilles.js'));
    });
});
