// =======================================================================
// LE CINQUIÈME PARCOURS : LES MOTS DE « MONTER TON COURS », « NOUS FAISONS » (19 NOV. 2026)
// =======================================================================
// Depuis le 19 nov. 2026 (session de nuit B, lot 2), les sept bulles sont celles que Grégoire a réécrites le 19 nov. (13 h 49
// à 14 h 10 ; retouches de 15 h 34 et 15 h 53), dans la forme des « Nous faisons » : plans de travail/CONSIGNE-2026-11-19-
// nous-faisons-cours.md, mot pour mot. La ligne du panneau, le refus et le guide restent confrontés à leur consigne du 8 nov.
//   1. Chaque bulle, LUE À L'EXÉCUTION, porte dans l'ordre les lignes du relais : [C] la confirmation, [E] les explications
//      (des `note`), [G] les gestes (des lignes de liste, la dernière étant la consigne), l'objectif à la bulle 1 et
//      l'objectif atteint à la bulle 7 (sur la définition), la suite de la phrase du lieu à la bulle 1 ; la seconde forme
//      de la bulle 6.
//   2. La confirmation ne paraît que si l'étape d'avant a été faite pendant ce passage (après « Reprendre », rien).
//   3. Les gestes se grisent quand la carte dit qu'ils sont faits (carte simulée) ; une explication ne se grise jamais.
//   4. Le panneau : le titre, la ligne, la phrase du refus ; une production dans le cours actif suffit.
//   5. Le guide de la carte : les deux phrases alignées sur les bulles.
// Les relais citent leurs lignes entre guillemets français, avec des guillemets dedans : `citation` les apparie.
// ⚠ Deux traits de la forme n'ont pas de mécanisme dans le moteur de cette base : la parenthèse « hors du gras » d'une
// consigne reste dans son texte (le banc la recolle par une espace), et un geste qui n'est pas la consigne n'a pas de flèche.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
// Comme les sentinelles des parcours 1 à 4 : la consigne est lue par un lecteur. ⚠ `plans de travail/` est ignoré par la
// CI (paths-ignore) : un commit qui ne changerait QUE la consigne ne relancerait pas ce banc ; tout changement du code, si.
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const CONSIGNE = lire('plans de travail/CONSIGNE-LOT-2026-11-08-parcours-5-monter-ton-cours.md');

function charger(productions) {
    const enregistres = [];
    const win = {
        Assistance: { enregistrer: (d) => enregistres.push(d), definirEtat() {}, etatDe: () => ({ etat: 'a-faire', etape: 0 }) },
        ParcoursMoteur: { visible: () => false, actif: () => false, etapeCourante: () => null }
    };
    const document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], body: { appendChild() {} } };
    const globaux = { document };
    if (productions) globaux.obtenirDonneesSelonMode = (k) => (k === 'productions' ? productions : []);
    chargerScript('js/parcours-cours.js', globaux, win);
    return { def: enregistres[0], api: win.ParcoursCours };
}

function fauxElement() {
    return {
        style: {}, dataset: {}, classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], closest: () => null
    };
}

function pagesDuGuide() {
    const win = chargerScript('js/planification-carte.js', {
        db: { getSync: (k, d) => d }, cle: (k) => k, echapperHtml: (t) => String(t ?? ''),
        document: {
            getElementById: () => null, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {},
            createElement: fauxElement, createElementNS: fauxElement, body: { appendChild() {}, removeChild() {} }
        },
        navigator: {}
    });
    return win.planificationCarte.GUIDE_PAGES;
}

// Le texte rendu d'une page, apostrophes courbes ramenées aux droites de la consigne.
const rendu = (p) => p.contenu.replace(/<[^>]+>/g, ' ').replace(/’/g, "'").replace(/\s+/g, ' ');

// ---------- Le relais du 19 nov. (« Nous faisons »), lu dans sa consigne ----------

const RELAIS = (() => {
    const t = lire('plans de travail/CONSIGNE-2026-11-19-nous-faisons-cours.md');
    const i = t.indexOf('Pour Claude Code, à relayer');
    const j = t.indexOf('```', i);
    if (i === -1 || j === -1) throw new Error('le relais du 19 nov. est introuvable dans sa consigne');
    return t.slice(i, j);
})();

/** Le texte entre le premier « à partir de `depuis` et son » apparié (des guillemets peuvent s'y imbriquer). */
function citation(s, depuis = 0) {
    const a = s.indexOf('«', depuis);
    if (a === -1) return null;
    let prof = 0;
    for (let k = a; k < s.length; k++) {
        if (s[k] === '«') prof++;
        else if (s[k] === '»' && --prof === 0) return { texte: s.slice(a + 1, k).trim(), fin: k + 1 };
    }
    throw new Error('guillemets non appariés : ' + s.slice(a, a + 60));
}

/**
 * Les lignes d'une bulle du relais, dans l'ordre : { genre: 'C' | 'E' | 'G' | 'L' | 'O', texte }, et la seconde forme à
 * part. Un geste « suivi hors du gras de « (…) » » est recollé à sa parenthèse par une espace (voir l'en-tête).
 */
function bulleDuRelais(n) {
    const debut = RELAIS.indexOf(`Bulle ${n}, «`);
    const fin = n < 7 ? RELAIS.indexOf(`Bulle ${n + 1}, «`) : RELAIS.indexOf('\n3. Tests.');
    if (debut === -1 || fin === -1) throw new Error(`bulle ${n} introuvable dans le relais`);
    const bloc = RELAIS.slice(debut, fin);
    const titre = citation(bloc).texte;
    const premiere = [], seconde = [];
    let dans = premiere;
    for (const ligne of bloc.split('\n').slice(1)) {
        if (ligne.startsWith('Seconde forme')) { dans = seconde; continue; }
        const m = /^(Objectif|\[C\]|\[E\]|\[G\]|\[L\])/.exec(ligne);
        if (!m) continue;
        const genre = { Objectif: 'O', '[C]': 'C', '[E]': 'E', '[G]': 'G', '[L]': 'L' }[m[1]];
        const c = citation(ligne);
        let texte = c.texte;
        const suite = ligne.indexOf('suivi hors du gras de', c.fin);
        if (suite !== -1) texte += ' ' + citation(ligne, suite).texte;
        dans.push({ genre, texte });
    }
    return { titre, premiere, seconde, bloc };
}

/** Les lignes d'une étape du code, au même format (genre E pour une `note`, G pour une ligne de la liste). */
function lignesDuCode(etape) {
    return etape.lignes().map((l) => ({ genre: l.note ? 'E' : 'G', texte: l.texte, consigne: !!l.geste }));
}

// La carte simulée : ce que la carte rend au parcours, sans navigateur (relecture neuve du 9 nov.).
function carte({ noeuds = [], liens = [], pastille = 'avant', saisie = false, prods = [{ id: 'PROD_un' }], avant, reprise } = {}) {
    let enregistre = null;
    const N = new Map(noeuds.map((n) => [n.id, { enfants: [], metadata: {}, ...n }]));
    const L = new Map(liens.map((l, k) => [String(k), l]));
    const actif = saisie ? { isContentEditable: true, tagName: 'DIV', closest: (s) => (s === '#conception-carte' ? {} : null) } : null;
    const win = {
        Assistance: { enregistrer: (d) => { enregistre = d; }, definirEtat() {}, etatDe: () => ({ etat: 'en-cours', etape: reprise || 0 }) },
        ParcoursMoteur: { visible: () => true, actif: () => reprise === undefined, etapeCourante: () => 0, allerA() {}, lancer: () => Promise.resolve() },
        planificationCarte: {
            etat: { noeuds: N, liens: L },
            semaineDeLecon: (n) => n.metadata.semaine || null,
            objectifsDeLecon: (n) => n.metadata.objectifs || [],
            objectifsServisPar: (n) => n.metadata.objectifsServis || [],
            objectifsVerifiesPar: (n) => n.metadata.objectifsVerifies || [],
            evaluerPastilleEvaluation: () => ({ etat: pastille }),
            TYPES_SERVANTS_OBJECTIF: ['activite', 'evaluation']
        }
    };
    const document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], body: { appendChild() {}, classList: { toggle() {} } }, activeElement: actif };
    const ctx = avant ? { noeudsAvant: avant } : {};
    chargerScript('js/parcours-cours.js', { document, obtenirDonneesSelonMode: () => prods, obtenirPreference: () => ctx }, win);
    // « Reprendre » à l'étape `depuis` (le panneau dit « en cours ») : le lancement, tel que le panneau l'appelle.
    return Object.assign(win.ParcoursCours, { lancerPourLeBanc: (depuis) => enregistre.lancer(depuis) });
}
const COMP = { id: 'C', type: 'competence', titre: 'Analyser' };
const IDEE = { id: 'I', type: 'idee-maitresse', titre: 'Le texte' };
const DECLINE = { type: 'se_decline_en', source: 'C', cible: 'I' };
const LECON = (meta) => ({ id: 'L', type: 'lecon', titre: 'Lire', metadata: meta });
const CONCRETISE = { type: 'se_concretise_dans', source: 'I', cible: 'L' };


describe('« Monter ton cours », « Nous faisons » : les bulles, mot pour mot (relais du 19 nov.)', () => {
    const { def, api } = charger();
    const E = api.etapes();

    it('le panneau : le titre, la ligne (consigne du 8 nov.), sept étapes', () => {
        expect(def.id).toBe('monter');
        expect(def.titre).toBe('Monter ton cours');
        expect(CONSIGNE).toContain(`Titre : « ${def.titre} ». Ligne : « ${def.ligne} »`);
        expect(E).toHaveLength(7);
        expect(def.total).toBe(7);
    });

    it('plus de paragraphe ni de geste en une phrase : chaque bulle est en lignes', () => {
        for (const e of E) {
            expect(e.texte, e.titre).toBeUndefined();
            expect(e.geste, e.titre).toBeUndefined();
            expect(typeof e.lignes, e.titre).toBe('function');
        }
    });

    it.each([1, 2, 3, 4, 5, 6, 7])('bulle %i : le titre, la confirmation, les explications et les gestes, dans l’ordre du relais', (n) => {
        const r = bulleDuRelais(n);
        const e = E[n - 1];
        expect(e.titre).toBe(r.titre);
        const conf = r.premiere.filter((l) => l.genre === 'C').map((l) => l.texte);
        expect(typeof e.confirme === 'function' ? e.confirme() : (e.confirme || ''), 'la confirmation').toBe(conf[0] || '');
        const attendues = r.premiere.filter((l) => l.genre === 'E' || l.genre === 'G');
        let code = lignesDuCode(e);
        // La dernière bulle : sa consigne est celle du moteur (« Touche « Terminer » », que le moteur récrit en deux suites).
        if (n === 7) {
            expect(code[code.length - 1]).toEqual({ genre: 'G', texte: 'Touche « Terminer »', consigne: true });
            code = code.slice(0, -1);
        }
        expect(code.map(({ genre, texte }) => ({ genre, texte }))).toEqual(attendues);
        // Une seule consigne, et c'est le dernier geste.
        const gestes = lignesDuCode(e).filter((l) => l.genre === 'G');
        expect(gestes.filter((l) => l.consigne)).toHaveLength(1);
        expect(gestes[gestes.length - 1].consigne).toBe(true);
    });

    it('bulle 1 : l’objectif (sur la définition) et la suite de la phrase du lieu', () => {
        const r = bulleDuRelais(1);
        expect(def.objectif === undefined ? api.definition().objectif : def.objectif).toBe(r.premiere.find((l) => l.genre === 'O').texte);
        expect(E[0].lieu).toBe(true);
        expect(E[0].lieuSuite).toBe(r.premiere.find((l) => l.genre === 'L').texte);
        expect(E.slice(1).every((e) => !e.lieu), 'la phrase du lieu à la bulle 1 seulement').toBe(true);
    });

    it('bulle 6 : la seconde forme du relais (la variante ⚠), sans confirmation', () => {
        const r = bulleDuRelais(6);
        expect(r.seconde.map((l) => l.texte)).toEqual([api.texteVariante, api.gesteVariante]);
        expect(r.seconde.map((l) => l.genre)).toEqual(['E', 'G']);
        expect(typeof E[5].secondeForme).toBe('function');
    });

    it('bulle 7 : l’objectif atteint, entre deux filets, posé par le moteur depuis la définition', () => {
        const r = bulleDuRelais(7);
        const atteint = citation(r.bloc, r.bloc.indexOf('entre deux filets')).texte;
        expect(api.definition().objectifAtteint).toBe(atteint);
        expect(r.bloc).toContain('« Touche « Parcours suivant », ou « Terminer ». »');
    });

    it('les deux retouches de Grégoire (15 h 34 et 15 h 53) sont celles du code', () => {
        const tout = E.flatMap((e) => lignesDuCode(e).map((l) => l.texte)).join('\n');
        expect(tout).toContain('tes évaluations devront le vérifier');
        expect(tout).not.toContain("devront l'exiger");
        expect(tout).toContain('ton plan de cours le précisera');
        expect(tout).not.toContain("ton plan de cours l'écrira");
    });

    it('« Terminer » à la dernière, sans « Plus tard », au centre ; « Plus tard » sur les six autres', () => {
        expect(E[6].boutons.map((b) => b.libelle)).toEqual(['Terminer']);
        expect(E[6].sansSortie).toBe(true);
        expect(E[6].centre).toBe(true);
        expect(E.slice(0, 6).every((e) => !e.sansSortie && !e.centre)).toBe(true);
    });

    it('la phrase du refus est celle que Grégoire a validée ; une production dans le cours actif la lève', () => {
        const m = CONSIGNE.match(/le panneau dit : « (Commence par .*?) » \(texte validé par Grégoire\)/);
        expect(m).not.toBeNull();
        expect(api.refus()).toBe(m[1]);                       // aucune production
        expect(charger([]).api.refus()).toBe(m[1]);           // une liste vide
        expect(charger([{ id: 'PROD_un' }]).api.refus()).toBeNull();
    });
});


describe('Le guide de la carte, aligné sur les bulles (consigne, 10 h 29 et 10 h 37)', () => {
    const pages = pagesDuGuide();
    const page = (titre) => pages.find((p) => p.titre.replace(/’/g, "'") === titre);
    const remplacements = [...CONSIGNE.matchAll(/^- Page « (.*?) » : « (.*?) » devient « (.*?) »\.?$/gm)].map((m) => m.slice(1));

    it('la consigne nomme deux pages', () => {
        expect(remplacements.map((r) => r[0])).toEqual(["Ce que l'étudiant doit retenir", 'Ce que la leçon vise']);
    });

    it.each(["Ce que l'étudiant doit retenir", 'Ce que la leçon vise'])('page « %s » : la phrase nouvelle y est, l’ancienne n’y est plus ; le titre ne change pas', (t) => {
        const [titre, avant, apres] = remplacements.find((r) => r[0] === t);
        const p = page(titre);
        expect(p, titre).toBeTruthy();
        expect(rendu(p)).toContain(apres);
        expect(rendu(p)).not.toContain(avant);
    });

    it('les bulles 2 et 4 reprennent la phrase du guide', () => {
        const E = charger().api.etapes();
        expect(E[1].lignes()[0].texte.startsWith(remplacements[0][2].replace(/\.$/, ''))).toBe(true);
        expect(E[3].lignes()[0].texte).toContain(remplacements[1][2]);
    });
});

// Les conditions des étapes, sur une carte simulée (relecture neuve du 9 nov. : le banc ne départageait ni la date de la
// leçon, ni la production de l'évaluation). Et aucune étape n'avance pendant une saisie dans la carte (la bulle prenait
// le focus dès la première lettre).
// Break-tests (9 nov.) : `leconDatee` remplacé par `texte` dans `leconReliee` → ROUGE (3) ; `productionId` retiré
// d'`evaluationAlignee` → ROUGE (6) ; la garde `enSaisie` retirée → ROUGE (saisie). Rétablis.
describe('« Monter ton cours » : ce qui fait avancer chaque étape', () => {
    const atteint = (api, k) => api.etapes()[k - 1].atteint();

    it('2. l’idée maîtresse : titrée ET reliée par « se décline en » depuis la compétence', () => {
        expect(atteint(carte({ noeuds: [COMP, IDEE] }), 2)).toBe(false);
        expect(atteint(carte({ noeuds: [COMP, IDEE], liens: [{ ...DECLINE, source: 'I', cible: 'C' }] }), 2)).toBe(false);
        expect(atteint(carte({ noeuds: [COMP, IDEE], liens: [DECLINE] }), 2)).toBe(true);
    });

    it('3. la leçon : sa semaine, sa séance, et son lien « se concrétise dans »', () => {
        const avec = (meta, liens) => atteint(carte({ noeuds: [COMP, IDEE, LECON(meta)], liens: [DECLINE].concat(liens) }), 3);
        expect(avec({ semaine: 2 }, [CONCRETISE])).toBe(false);           // pas de séance
        expect(avec({ rangSeance: 1 }, [CONCRETISE])).toBe(false);        // pas de semaine
        expect(avec({ semaine: 2, rangSeance: 1 }, [])).toBe(false);      // pas de lien
        expect(avec({ semaine: 2, rangSeance: 1 }, [CONCRETISE])).toBe(true);
    });

    it('6. l’évaluation : une production ET sa pastille à ✓', () => {
        const ev = (meta) => ({ id: 'E', type: 'evaluation', titre: 'Journal', parent: 'L', metadata: meta });
        const avec = (meta, pastille) => atteint(carte({ noeuds: [LECON({ semaine: 2, rangSeance: 1 }), ev(meta)], pastille }), 6);
        expect(avec({}, 'avant')).toBe(false);                            // pas de production
        expect(avec({ productionId: 'PROD_un' }, 'apres')).toBe(false);   // posée avant l'activité
        expect(avec({ productionId: 'PROD_un' }, 'avant')).toBe(true);
    });

    it('aucune étape n’avance pendant une saisie dans la carte', () => {
        expect(atteint(carte({ noeuds: [COMP] }), 1)).toBe(true);
        expect(atteint(carte({ noeuds: [COMP], saisie: true }), 1)).toBe(false);
        expect(atteint(carte({ noeuds: [COMP, IDEE], liens: [DECLINE], saisie: true }), 2)).toBe(false);
    });

    it('seul ce qui est créé après « Commencer » ou « Refaire » fait avancer une étape (16 h 03)', () => {
        // Une compétence et son idée déjà posées : ni l'étape 1 ni l'étape 2 n'avancent.
        expect(atteint(carte({ noeuds: [COMP], avant: ['C'] }), 1)).toBe(false);
        expect(atteint(carte({ noeuds: [COMP, IDEE], liens: [DECLINE], avant: ['C', 'I'] }), 2)).toBe(false);
        // Une compétence neuve, à côté de l'ancienne : l'étape 1 avance.
        expect(atteint(carte({ noeuds: [COMP, { ...COMP, id: 'C2' }], avant: ['C'] }), 1)).toBe(true);
        // Une évaluation déjà posée, alignée : l'étape 6 n'avance pas.
        const ev = { id: 'E', type: 'evaluation', titre: 'Journal', parent: 'L', metadata: { productionId: 'PROD_un' } };
        expect(atteint(carte({ noeuds: [LECON({ semaine: 2, rangSeance: 1 }), ev], avant: ['E'] }), 6)).toBe(false);
    });

    it('la condition : une production retirée de la bibliothèque ne compte pas (le menu de l’Inspecteur ne l’offre pas)', () => {
        expect(carte({ prods: [{ id: 'P', dansBibliotheque: false }] }).refus()).not.toBeNull();
        expect(carte({ prods: [{ id: 'P', dansBibliotheque: false }, { id: 'Q' }] }).refus()).toBeNull();
    });
});

// Les gestes qui se grisent : chaque ligne de geste dit, par la carte (simulée), si elle est faite ; une explication n'a
// rien qui la rende faite. Les deux gestes que seule la page peut dire (la zone des objectifs dépliée, l'Inspecteur ouvert)
// se jugent au navigateur (parcours-5-nous-faisons-2026-11-19.spec.js).
// Break-tests (19-20 nov.) : la condition de « Glisse le bloc dans ta leçon » ramenée à `!!activiteNeuve()` → ROUGE (5) ;
// `rang > debutDuPassage` remplacé par `true` dans `confirmation` → ROUGE (Reprendre). Rétablis.
describe('« Nous faisons » : les gestes qui se grisent, et la confirmation de ce passage seulement', () => {
    const ligne = (api, n, debut) => {
        const l = api.etapes()[n - 1].lignes().find((x) => x.texte.startsWith(debut));
        if (!l) throw new Error(`bulle ${n} : aucune ligne ne commence par « ${debut} »`);
        return l;
    };
    const fait = (api, n, debut) => !!ligne(api, n, debut).fait();
    const LECON_DATEE = LECON({ semaine: 2, rangSeance: 1 });

    it('aucune explication ne porte de quoi se griser ; chaque geste en porte, sauf la consigne de la fin (un bouton la fait)', () => {
        const api = carte();
        for (const e of api.etapes()) {
            for (const l of e.lignes()) {
                if (l.note || l.texte === 'Touche « Terminer »') expect(l.fait, `${e.titre} : ${l.texte}`).toBeUndefined();
                else expect(typeof l.fait, `${e.titre} : ${l.texte}`).toBe('function');
            }
        }
    });

    it('1 : toucher « Compétence » se grise au bloc posé ; la consigne, à l’énoncé écrit', () => {
        expect(fait(carte(), 1, 'Touche « Compétence »')).toBe(false);
        expect(fait(carte({ noeuds: [{ ...COMP, titre: '' }] }), 1, 'Touche « Compétence »')).toBe(true);
        expect(fait(carte({ noeuds: [{ ...COMP, titre: '' }] }), 1, 'Écris son énoncé')).toBe(false);
        expect(fait(carte({ noeuds: [COMP] }), 1, 'Écris son énoncé')).toBe(true);
    });

    it('2 : toucher, écrire, puis relier', () => {
        const sansTitre = { ...IDEE, titre: '' };
        expect(fait(carte({ noeuds: [COMP, sansTitre] }), 2, 'Touche « Idée maîtresse »')).toBe(true);
        expect(fait(carte({ noeuds: [COMP, sansTitre] }), 2, 'Écris ton idée maîtresse')).toBe(false);
        expect(fait(carte({ noeuds: [COMP, IDEE] }), 2, 'Écris ton idée maîtresse')).toBe(true);
        expect(fait(carte({ noeuds: [COMP, IDEE] }), 2, 'Depuis l’un des petits cercles'.replace('’', "'"))).toBe(false);
        expect(fait(carte({ noeuds: [COMP, IDEE], liens: [DECLINE] }), 2, "Depuis l'un des petits cercles")).toBe(true);
    });

    it('3 : toucher, le titre, la semaine et la séance, puis relier', () => {
        const base = [COMP, IDEE];
        expect(fait(carte({ noeuds: base.concat([{ ...LECON({}), titre: '' }]), liens: [DECLINE] }), 3, 'Touche « Leçon »')).toBe(true);
        expect(fait(carte({ noeuds: base.concat([{ ...LECON({}), titre: '' }]), liens: [DECLINE] }), 3, 'Donne-lui un titre')).toBe(false);
        expect(fait(carte({ noeuds: base.concat([LECON({ semaine: 2 })]), liens: [DECLINE] }), 3, 'Donne-lui un titre')).toBe(true);
        expect(fait(carte({ noeuds: base.concat([LECON({ semaine: 2 })]), liens: [DECLINE] }), 3, 'Dans son en-tête')).toBe(false);
        expect(fait(carte({ noeuds: base.concat([LECON_DATEE]), liens: [DECLINE] }), 3, 'Dans son en-tête')).toBe(true);
        expect(fait(carte({ noeuds: base.concat([LECON_DATEE]), liens: [DECLINE] }), 3, 'Tire un trait')).toBe(false);
        expect(fait(carte({ noeuds: base.concat([LECON_DATEE]), liens: [DECLINE, CONCRETISE] }), 3, 'Tire un trait')).toBe(true);
    });

    it('5 : l’activité posée, titrée, glissée DANS la leçon, puis cochée', () => {
        const act = (m) => ({ id: 'A', type: 'activite', titre: 'Annoter', ...m });
        const l = { ...LECON_DATEE, enfants: ['A'] };
        expect(fait(carte({ noeuds: [LECON_DATEE, act({})] }), 5, 'Glisse le bloc dans ta leçon')).toBe(false);
        expect(fait(carte({ noeuds: [l, act({ parent: 'L' })] }), 5, 'Glisse le bloc dans ta leçon')).toBe(true);
        expect(fait(carte({ noeuds: [l, act({ parent: 'L' })] }), 5, "Dans l'Inspecteur, coche")).toBe(false);
        expect(fait(carte({ noeuds: [l, act({ parent: 'L', metadata: { objectifsServis: ['o1'] } })] }), 5, "Dans l'Inspecteur, coche")).toBe(true);
    });

    it('6 : l’évaluation glissée dans la leçon, l’objectif coché, puis la production choisie', () => {
        const ev = (m) => ({ id: 'E', type: 'evaluation', titre: 'Journal', parent: 'L', ...m });
        const l = { ...LECON_DATEE, enfants: ['E'] };
        expect(fait(carte({ noeuds: [l, ev({})] }), 6, 'Glisse le bloc dans ta leçon')).toBe(true);
        expect(fait(carte({ noeuds: [l, ev({})] }), 6, "Dans l'Inspecteur, coche")).toBe(false);
        expect(fait(carte({ noeuds: [l, ev({ metadata: { objectifsVerifies: ['o1'] } })] }), 6, "Dans l'Inspecteur, coche")).toBe(true);
        expect(fait(carte({ noeuds: [l, ev({ metadata: { objectifsVerifies: ['o1'] } })] }), 6, 'Choisis dans « Production »')).toBe(false);
        expect(fait(carte({ noeuds: [l, ev({ metadata: { objectifsVerifies: ['o1'], productionId: 'PROD_un' } })] }), 6, 'Choisis dans « Production »')).toBe(true);
    });

    it('la confirmation : présente quand ce passage a commencé avant l’étape d’avant ; absente à l’étape où « Reprendre » rentre', async () => {
        const E = carte().etapes();
        expect(E[0].confirme).toBeUndefined();
        expect(E[3].confirme()).toBe("C'est fait : ta leçon est datée et reliée à ton idée maîtresse.");
        const repris = carte({ reprise: 3 });
        await repris.lancerPourLeBanc(3);
        expect(repris.etapes()[3].confirme(), 'l’étape où l’on reprend').toBe('');
        expect(repris.etapes()[4].confirme(), 'l’étape suivante, faite pendant ce passage').toBe("C'est fait : ton objectif est écrit.");
    });
});
