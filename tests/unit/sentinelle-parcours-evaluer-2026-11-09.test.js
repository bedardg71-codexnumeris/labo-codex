// =======================================================================
// LE TROISIÈME PARCOURS : LES MOTS D'« ÉVALUER UNE PREMIÈRE PRODUCTION », DANS SES DEUX TEMPS
// =======================================================================
// Depuis le 20 nov. 2026 (essai de Grégoire sur l'iPad), cette sentinelle confronte LES DEUX TEMPS à
// `plans de travail/CONSIGNE-2026-11-20-essai-parcours.md`, dont les textes ont été validés par lui un à un
// (15 h 24 à 16 h 12) :
//   · « NOUS FAISONS » (section D) : dix bulles neuves. Chaque titre, chaque confirmation, chaque phrase du lieu,
//     chaque explication, chaque geste et chaque consigne de la consigne est dans le code, DANS SON GENRE, et le code
//     ne porte rien d'autre (les deux sens). L'ancienne Pratique guidée (neuf étapes, la grille d'abord ; consigne du
//     8 nov.) est retirée : ses textes ne sont plus dans le code.
//   · « JE REGARDE » (section C) : les retouches de l'essai, mot pour mot ; le reste du modèle est jugé par
//     tests/unit/sentinelle-je-regarde-evaluer-2026-11-18.test.js contre sa propre consigne.
// Le rendu (l'ordre à l'écran, les secondes formes, ce qui fait avancer) est jugé au navigateur :
// tests/integration/nous-faisons-evaluer-2026-11-20.spec.js.
// Break-test (20 nov. 2026) : voir le rapport du lot (plans de travail/RAPPORT-2026-11-20-essai-parcours.md).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';
import { CONSIGNE_20_NOV, suiteFactice } from './_helpers/fin-des-parcours-2026-11-20.js';
import { RETOUCHES_22_NOV } from './_helpers/parcours-apres-par-standards-2026-11-22.js';
import { retoucherLignes27 } from './_helpers/familles-cum-hyb-2026-11-27.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const EVALUER = lire('js/parcours-evaluer.js');
const aPlat = (x) => String(x).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

// ---------- Le fichier, chargé hors du navigateur (aucune page : rien n'est ouvert, rien n'est visible) ----------

const definitions = {};
const fenetre = {
    Assistance: { enregistrer: (def) => { definitions[def.id] = def; }, parcours: () => [], suivantDe: () => null, suiteDe: suiteFactice(4) },
    ParcoursMoteur: { visible: () => false }
};
const pageVide = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], body: { classList: { toggle() {} } } };
new Function('window', 'document', lire('js/parcours-classe.js'))(fenetre, pageVide);
new Function('window', 'document', EVALUER)(fenetre, pageVide);
const P = fenetre.ParcoursEvaluer;
const ETAPES = P.etapes();
const DEF = definitions.evaluer;

// ---------- La consigne, section D, lue ----------

// Le 22 nov. 2026 (plans de travail/CONSIGNE-2026-11-22-parcours-apres-par-standards.md, A1) : la phrase des codes de
// famille, dans la voie « Partir d'un modèle », est lue retouchée par cette consigne (SEL et STD) ; une seule occurrence.
const D = (() => {
    const brut = tranche(CONSIGNE_20_NOV, 'D. PARCOURS 3, « NOUS FAISONS » : DIX BULLES NEUVES', '\nE. PARCOURS 4, « RECEVOIR LES PRODUCTIONS », « JE REGARDE »');
    const a1 = RETOUCHES_22_NOV.find((r) => r.repere === 'A1.');
    if (brut.split(a1.avant).length !== 2) throw new Error('consigne du 20 nov., section D : la phrase de A1 (22 nov.) n’y est pas une fois');
    return brut.replace(a1.avant, a1.apres);
})();

/** Le texte entre guillemets qui s'ouvre à `i` (sur « ), guillemets emboîtés compris ; rend [texte, fin]. */
function citation(texte, i) {
    let n = 0;
    for (let k = i; k < texte.length; k++) {
        if (texte[k] === '«') n++;
        if (texte[k] === '»') { n--; if (n === 0) return [texte.slice(i + 1, k).trim(), k + 1]; }
    }
    throw new Error('citation non refermée : ' + texte.slice(i, i + 60));
}

/** Les items d'un bloc de la consigne, dans l'ordre : { genre: C|L|E|G, texte, sansCrochet?: bool }. */
function itemsDe(bloc) {
    const items = [];
    const re = /\[(C|L|E|G)\]/g;
    let m;
    while ((m = re.exec(bloc))) {
        const suite = bloc.slice(m.index + m[0].length);
        // « [C] comme ci-dessus. » : la confirmation de la voie d'avant.
        if (/^ comme ci-dessus/.test(suite)) { items.push(Object.assign({}, items.filter((x) => x.genre === 'C').pop())); continue; }
        const ouvre = suite.indexOf('«');
        const [texte, fin] = citation(suite, ouvre);
        const apres = suite.slice(fin);
        const item = { genre: m[1], texte };
        if (/^ \(ne se grise pas\)/.test(apres)) item.sansCrochet = true;
        // La parenthèse hors du gras : elle termine la consigne, dans le code.
        const hors = /^, suivi hors du gras de «/.exec(apres);
        if (hors) item.texte += ' ' + citation(apres, apres.indexOf('«'))[0];
        items.push(item);
        re.lastIndex = m.index + m[0].length + fin;
    }
    return items;
}

/** Les formes d'une bulle (« Puis » et « Voie » en ouvrent une) : le dernier [G] de chacune est la consigne. */
function formesDe(bloc) {
    return bloc.split(/(?=Puis, |Voie (?:modèle|décrire|« ))/).map(itemsDe).filter((f) => f.length);
}

function blocDeLaBulle(k) {
    const fin = k < 10 ? `\nBulle ${k + 1}, ` : '\nPuis la fin du moteur selon A3';
    return tranche(D, `\nBulle ${k}, `, fin);
}

// ↻ 27 nov. 2026 (trois familles, textes 26 et 27) : les explications de la consigne sont lues retouchées ; chaque retouche
// attendue ici doit trouver sa ligne (vérifié plus bas).
const SERVIES_27 = new Set();
const retouche27 = (liste) => { const r = retoucherLignes27(liste, aPlat, ['T26a', 'T26c', 'T27']); r.servies.forEach((s) => SERVIES_27.add(s)); return r.lignes; };
const BULLES = Array.from({ length: 10 }, (x, i) => {
    const bloc = blocDeLaBulle(i + 1);
    const formes = formesDe(bloc);
    const tous = formes.reduce((a, f) => a.concat(f), []);
    const consignes = formes.map((f) => f.filter((x) => x.genre === 'G').pop()).filter(Boolean);
    return {
        bloc,
        confirmations: [...new Set(tous.filter((x) => x.genre === 'C').map((x) => x.texte))],
        lieux: [...new Set(tous.filter((x) => x.genre === 'L').map((x) => x.texte))],
        explications: retouche27([...new Set(tous.filter((x) => x.genre === 'E').map((x) => x.texte))]),
        consignes: consignes.map((x) => x.texte),
        gestes: tous.filter((x) => x.genre === 'G' && consignes.indexOf(x) === -1),
        nombreDeFormes: formes.length
    };
});

// ---------- Le code, lu ----------

/** Les chaînes d'un genre dans le source d'une fonction : `note("…")`, `consigne("…")`, `sansTemoin("…"`, `texte: "…"`. */
function chaines(source, motif) {
    const re = new RegExp(motif + '"((?:[^"\\\\]|\\\\.)*)"', 'g');
    return [...source.matchAll(re)].map((m) => JSON.parse('"' + m[1] + '"'));
}

/** Le source de ce qui écrit les lignes de la bulle k : sa fonction `lignes`, et les formes de `NOUS` qu'elle appelle. */
function sourceDesLignes(k) {
    const e = ETAPES[k - 1];
    let s = e.lignes.toString();
    if (k === 1) s += P.nous.bulle1.page.toString() + P.nous.bulle1.assistant.toString();
    if (k === 2) s += P.nous.bulle2.modele.choix.toString() + P.nous.bulle2.modele.recapitulatif.toString() + P.nous.bulle2.decrire.lignes.toString();
    return s;
}

function codeDeLaBulle(k) {
    const e = ETAPES[k - 1], s = sourceDesLignes(k);
    const confirmations = k === 2 ? [P.nous.bulle2.modele.confirme, P.nous.bulle2.decrire.confirme]
        : (e.confirme ? [typeof e.confirme.texte === 'function' ? e.confirme.texte() : e.confirme.texte] : []);
    const suites = !e.lieuSuite ? [] : (typeof e.lieuSuite === 'function' ? chaines(e.lieuSuite.toString(), '') : [e.lieuSuite]);
    return {
        confirmations,
        suitesDuLieu: suites,
        notes: [...new Set(chaines(s, 'note\\('))],
        consignes: chaines(s, 'consigne\\('),
        sansTemoin: chaines(s, 'sansTemoin\\('),
        gestes: chaines(s, '\\{ texte: ')
    };
}

const TITRES = ['Ta pratique de notation', null, "L'appliquer à ton cours", 'Ton échelle de performance', 'Ta grille', 'Ta cartouche',
    'Ta production', 'Tes consignes', 'Évaluer', "Le point qui s'allume"];

describe('« Nous faisons » : dix bulles, dans l’ordre et sous les titres de la consigne du 20 nov.', () => {
    it('dix étapes ; le panneau en annonce dix', () => {
        expect(ETAPES).toHaveLength(10);
        expect(DEF.total).toBe(10);
        expect(P.definition.etapes).toBe(ETAPES);
    });

    it.each(TITRES.map((t, i) => [i + 1, t]).filter((x) => x[1]))('bulle %i : « %s »', (k, titre) => {
        expect(ETAPES[k - 1].titre).toBe(titre);
        expect(D).toContain(`\nBulle ${k}, « ${titre} »`);
    });

    it('bulle 2 : deux voies, deux titres (« Un modèle », « Tes réponses ») ; la voie « Partir d’un modèle » par défaut', () => {
        expect(blocDeLaBulle(2)).toContain('Voie modèle, titre « Un modèle ».');
        expect(blocDeLaBulle(2)).toContain('Voie décrire, titre « Tes réponses ».');
        expect(P.nous.bulle2.modele.titre).toBe('Un modèle');
        expect(P.nous.bulle2.decrire.titre).toBe('Tes réponses');
        expect(ETAPES[1].titre).toBe('Un modèle');
    });

    it('l’objectif (bulle 1) et l’objectif atteint (bulle 10), posés par le moteur d’après la définition', () => {
        expect(D).toContain('Objectif : « ' + P.nous.objectif + ' »');
        expect(D).toContain('Objectif atteint : « ' + P.nous.objectifAtteint + ' »');
        expect(P.definition.objectif()).toBe(P.nous.objectif);
        expect(P.definition.objectifAtteint).toBe(P.nous.objectifAtteint);
    });

    it('la forme : pas de « Remplir » ; la dernière bulle sans « Plus tard », son seul bouton « Terminer » (le moteur y joint la suite)', () => {
        const bloc = tranche(EVALUER, 'var ETAPES = [', 'var DEF = ');
        expect(bloc).not.toMatch(/remplir\(|mots\.remplir|MATERIEL|TEXTES\./);
        expect(ETAPES[9].boutons.map((b) => b.libelle)).toEqual(['Terminer']);
        expect(ETAPES[9].sansSortie).toBe(true);
        expect(ETAPES.slice(0, 9).every((e) => !e.sansSortie)).toBe(true);
        // La dernière bulle n'a pas de ligne de consigne : la fin est celle du moteur (A3).
        expect(chaines(ETAPES[9].lignes.toString(), 'consigne\\(')).toEqual([]);
    });

    it('les boutons de bulle que nomme la consigne : « Je garde celle-ci » (4), « Je la compose ici » (5)', () => {
        expect(blocDeLaBulle(4)).toContain('(« Je garde celle-ci » : bouton de la bulle)');
        expect(blocDeLaBulle(5)).toContain('(« Je la compose ici » : bouton de la bulle)');
        expect(ETAPES[3].boutons.map((b) => b.libelle)).toEqual(['Je garde celle-ci']);
        expect(ETAPES[4].boutons.map((b) => b.libelle)).toEqual(['Je la compose ici']);
        ETAPES.slice(0, 3).concat(ETAPES.slice(5, 9)).forEach((e) => expect(e.boutons || null).toBeNull());
    });
});

describe('« Nous faisons » : chaque ligne de la consigne est dans le code, dans son genre, et le code ne porte rien d’autre', () => {
    const cas = BULLES.map((b, i) => [i + 1, b, codeDeLaBulle(i + 1)]);

    it.each(cas)('bulle %i : les confirmations', (k, b, c) => {
        expect(c.confirmations.map(aPlat).sort()).toEqual(b.confirmations.map(aPlat).sort());
        if (k > 1) expect(c.confirmations.length).toBeGreaterThan(0);
        c.confirmations.forEach((t) => expect(t).toMatch(/^C'est fait : /));
    });

    it.each(cas)('bulle %i : la phrase du lieu (le moteur lit le menu ; le code porte ce qui suit, ou la phrase entière)', (k, b, c) => {
        // Une phrase du lieu qui nomme le menu (« Tu es dans « X », à l'onglet « Y » : … ») : le code n'en porte que la suite.
        const duMenu = b.lieux.filter((l) => /^Tu es dans « [^»]+ », à l'onglet « [^»]+ » : /.test(l));
        expect(c.suitesDuLieu.map(aPlat).sort()).toEqual(duMenu.map((l) => aPlat(l.replace(/^Tu es dans « [^»]+ », à l'onglet « [^»]+ » /, ''))).sort());
        // Les autres (bulles 3 et 8 : la page ne change pas d'onglet) sont écrites entières, en explication.
        b.lieux.filter((l) => duMenu.indexOf(l) === -1).forEach((l) => expect(c.notes.map(aPlat)).toContain(aPlat(l)));
    });

    it('les retouches du 27 nov. trouvent chacune leur ligne dans la consigne du 20', () => {
        expect([...SERVIES_27].sort()).toEqual(['T26a', 'T26c', 'T27']);
    });

    it.each(cas)('bulle %i : les explications (sans marque)', (k, b, c) => {
        const litterales = b.lieux.filter((l) => !/^Tu es dans « [^»]+ », à l'onglet « [^»]+ » : /.test(l));
        expect(c.notes.map(aPlat).sort()).toEqual(b.explications.concat(litterales).map(aPlat).sort());
    });

    it.each(cas)('bulle %i : les gestes (une flèche à faire, un crochet fait) ; ceux qui ne se grisent pas', (k, b, c) => {
        expect(c.gestes.concat(c.sansTemoin).map(aPlat).sort()).toEqual(b.gestes.map((g) => aPlat(g.texte)).sort());
        expect(c.sansTemoin.map(aPlat).sort()).toEqual(b.gestes.filter((g) => g.sansCrochet).map((g) => aPlat(g.texte)).sort());
    });

    it.each(cas)('bulle %i : la consigne de chaque forme (le dernier geste, en gras)', (k, b, c) => {
        expect(c.consignes.map(aPlat).sort()).toEqual(b.consignes.map(aPlat).sort());
    });

    it('le compte : la consigne porte 10 bulles et leurs formes (2, 3, 1, 2, 4, 2, 2, 1, 3, 1)', () => {
        expect(BULLES.map((b) => b.nombreDeFormes)).toEqual([2, 3, 1, 2, 4, 2, 2, 1, 3, 1]);
        expect(BULLES.reduce((n, b) => n + b.explications.length + b.gestes.length + b.consignes.length, 0)).toBeGreaterThan(90);
    });
});

describe('« Nous faisons » : l’ordre et ce qui fait avancer', () => {
    it('l’ordre diffère de « Je regarde » aux étapes 3 et 4, exprès : l’application au cours, puis l’échelle', () => {
        expect(D).toContain("L'ordre diffère de « Je regarde » aux étapes 3 et 4, exprès.");
        expect(P.etapesModele().map((e) => e.titre).slice(2, 4)).toEqual(['Une échelle de performance', "L'appliquer à ton cours"]);
        expect(ETAPES.map((e) => e.titre).slice(2, 4)).toEqual(["L'appliquer à ton cours", 'Ton échelle de performance']);
    });

    it('chaque bulle avance sur une donnée (ce qui existe, #1273), jamais sur un bouton « Continuer »', () => {
        ETAPES.slice(0, 9).forEach((e, i) => expect(typeof e.atteint, 'bulle ' + (i + 1)).toBe('function'));
        expect(tranche(EVALUER, 'var ETAPES = [', 'var DEF = ')).not.toContain("'Continuer'");
        // Hors d'une page, rien n'existe : aucune bulle n'est atteinte.
        ETAPES.slice(2, 9).forEach((e, i) => expect(e.atteint(), 'bulle ' + (i + 3)).toBe(false));
    });

    it('la confirmation ne se dit que si l’étape d’avant a été faite pendant ce passage (hors d’un passage : rien)', () => {
        ETAPES.slice(1).forEach((e, i) => expect(e.confirme(), 'bulle ' + (i + 2)).toBe(''));
        const conf = tranche(EVALUER, 'function confirmation(k, texte) {', '\n    }\n');
        expect(conf).toContain('faitesAuLancement && !faitesAuLancement[k] && etapeFaite(k)');
    });

    it('ce que l’ancienne Pratique guidée posait et que la nouvelle ne nomme plus est retiré (zéro dette)', () => {
        const code = EVALUER.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        ['TEXTE_1', 'LIGNES_1', 'TITRES_1', 'modeRendu', 'modeEtape1', 'grillePrise', 'prendreCetteGrille', 'continuerLOuverture', 'avisCartouche',
            'cartoucheHorsDeLaGrille', 'ouNommerLaCartouche', 'productionNommeLaCartouche', 'ouToucherEnReecrivant', 'GESTE_GRILLES', 'GESTE_EXISTANTE',
            'complementEtape1', 'texteDuChoix', 'Pourquoi étiqueter', 'Tu apprends aussi', 'Ta rétroaction, avec tes mots', 'Prendre cette grille']
            .forEach((nom) => expect(code, nom).not.toContain(nom));
        expect(P.texteDuChoix).toBeUndefined();
    });

    it('le repère : les échelles qui existaient à « Commencer », des identifiants seulement ; un repère d’avant le 20 nov. est refait', () => {
        const repere = tranche(EVALUER, 'function poserLeRepere() {', '\n    }\n');
        expect(repere).toContain('echellesAvant: ');
        // #1273 (27 nov. 2026) : ce qui existe fait l'étape ; plus d'instantané des grilles, productions, pratiques, cartouches.
        ['grillesAvant', 'productionsAvant', 'pratiquesAvant', 'cartouchesAvant'].forEach((c) => expect(repere).not.toContain(c));
        // Chaque valeur est une liste d'identifiants (`ids(…)`) ou rien : aucun nom, aucun DA.
        expect(repere).not.toMatch(/\.nom\b|etudiantDA|obtenirEtudiants/);
        expect(tranche(EVALUER, 'async function lancer() {', 'return M().lancer(DEF, {')).toContain("Array.isArray(lireCtx().echellesAvant)");
    });
});
