// =======================================================================
// LE CINQUIÈME PARCOURS (9 NOV. 2026) : LES MOTS DE « MONTER TON COURS »
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-5-monter-ton-cours.md.
//   1. Les bulles sont celles que Grégoire a validées le 8 nov. (10 h 25 à 10 h 49), avec les CORRECTIONS du 9 nov.
//      (10 h 01 à 10 h 04, relayées par Cowork : étapes 2, 3, 5 et 6). Chaque texte, LU À L'EXÉCUTION, est égal au
//      texte de la consigne auquel on applique ces corrections ; chaque correction doit trouver dans la consigne la
//      phrase qu'elle remplace.
//   2. La variante ⚠ de l'étape 6 ; « Plus tard » partout sauf la dernière ; « Terminer » ; la 7 au centre.
//   3. Le panneau : le titre, la ligne, la phrase du refus ; une production dans le cours actif suffit.
//   4. Le guide de la carte : les deux phrases alignées sur les bulles (et rien d'autre dans ces deux pages).
// Break-test (9 nov.) : « par sa poignée ⠿ » retiré de l'étape 5 dans js/parcours-cours.js → ROUGE (étape 5) ;
// « l’étudiant·e saura faire » remis à « l’étudiant saura faire » dans GUIDE_PAGES → ROUGE (guide). Rétablis.

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
const lignes = CONSIGNE.split('\n');

function ligneEtape(n) { return lignes.find((l) => l.startsWith(`Étape ${n}, «`)); }
function titreDeLaConsigne(n) { const m = ligneEtape(n).match(/^Étape \d, « (.*?) »/); return m ? m[1] : null; }
function texteDe(ligne) { const m = ligne && ligne.match(/Texte : « (.*?) » ?(?:Avance|Bouton|$)/); return m ? m[1] : null; }

// [étape, phrase de la consigne, phrase validée le 9 nov.]
const CORRECTIONS = [
    [2, "« Se décline en » s'affiche.", "Le lien « se décline en » s'affiche."],
    [3, "« Se concrétise dans » apparaît : c'est ce lien qui", "Le lien « se concrétise dans » apparaît : c'est ce lien qui"],
    [5, "puis glisse le bloc dans ta leçon. Touche-le deux fois : dans l'Inspecteur, coche l'objectif qu'il sert.",
        "puis glisse le bloc dans ta leçon par sa poignée ⠿. Touche deux fois cette poignée : dans l'Inspecteur, coche l'objectif qu'il sert."],
    [6, "puis glisse le bloc dans ta leçon, sous ton activité : dans une leçon, l'ordre des blocs dit ce qui vient avant. Touche-le deux fois.",
        "puis glisse le bloc par sa poignée ⠿ dans ta leçon, sous ton activité : dans une leçon, l'ordre des blocs dit ce qui vient avant. Touche deux fois cette poignée."]
];

function corriger(n, t) {
    for (const [, avant, apres] of CORRECTIONS.filter((c) => c[0] === n)) {
        if (!t.includes(avant)) throw new Error(`étape ${n} : la consigne ne porte pas « ${avant} »`);
        t = t.replace(avant, apres);
    }
    return t;
}

function texteValide(n) { return corriger(n, texteDe(ligneEtape(n))); }

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

describe('« Monter ton cours » : les bulles, mot pour mot (consigne + corrections du 9 nov.)', () => {
    const { def, api } = charger();
    const E = api.etapes();

    it('le panneau : le titre, la ligne, sept étapes', () => {
        expect(def.id).toBe('monter');
        expect(def.titre).toBe('Monter ton cours');
        expect(CONSIGNE).toContain(`Titre : « ${def.titre} ». Ligne : « ${def.ligne} »`);
        expect(E).toHaveLength(7);
        expect(def.total).toBe(7);
    });

    it('chaque correction trouve, dans la consigne, la phrase qu’elle remplace', () => {
        for (const [n, avant] of CORRECTIONS) expect(texteDe(ligneEtape(n)), `étape ${n}`).toContain(avant);
    });

    it.each([1, 2, 3, 4, 5, 6, 7])('étape %i : le titre et le texte validés', (n) => {
        expect(E[n - 1].titre).toBe(titreDeLaConsigne(n));
        expect(E[n - 1].texte).toBe(texteValide(n));
    });

    it('la variante ⚠ de l’étape 6 est celle de la consigne', () => {
        const m = CONSIGNE.match(/^Variante de l'étape 6, .*? : « (.*) »$/m);
        expect(m).not.toBeNull();
        expect(api.texteVariante).toBe(m[1]);
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
        expect(api.condition()).toBe(m[1]);                       // aucune production
        expect(charger([]).api.condition()).toBe(m[1]);           // une liste vide
        expect(charger([{ id: 'PROD_un' }]).api.condition()).toBeNull();
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
        expect(E[1].texte.startsWith(remplacements[0][2].replace(/\.$/, ''))).toBe(true);
        expect(E[3].texte).toContain(remplacements[1][2]);
    });
});

// Les conditions des étapes, sur une carte simulée (relecture neuve du 9 nov. : le banc ne départageait ni la date de la
// leçon, ni la production de l'évaluation). Et aucune étape n'avance pendant une saisie dans la carte (la bulle prenait
// le focus dès la première lettre).
// Break-tests (9 nov.) : `leconDatee` remplacé par `texte` dans `leconReliee` → ROUGE (3) ; `productionId` retiré
// d'`evaluationAlignee` → ROUGE (6) ; la garde `enSaisie` retirée → ROUGE (saisie). Rétablis.
describe('« Monter ton cours » : ce qui fait avancer chaque étape', () => {
    function carte({ noeuds = [], liens = [], pastille = 'avant', saisie = false, prods = [{ id: 'PROD_un' }], avant } = {}) {
        const N = new Map(noeuds.map((n) => [n.id, { enfants: [], metadata: {}, ...n }]));
        const L = new Map(liens.map((l, k) => [String(k), l]));
        const actif = saisie ? { isContentEditable: true, tagName: 'DIV', closest: (s) => (s === '#conception-carte' ? {} : null) } : null;
        const win = {
            Assistance: { enregistrer() {}, definirEtat() {}, etatDe: () => ({ etat: 'en-cours', etape: 0 }) },
            ParcoursMoteur: { visible: () => true, actif: () => true, etapeCourante: () => 0, allerA() {} },
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
        const document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], body: { appendChild() {} }, activeElement: actif };
        const ctx = avant ? { noeudsAvant: avant } : {};
        chargerScript('js/parcours-cours.js', { document, obtenirDonneesSelonMode: () => prods, obtenirPreference: () => ctx }, win);
        return win.ParcoursCours;
    }
    const COMP = { id: 'C', type: 'competence', titre: 'Analyser' };
    const IDEE = { id: 'I', type: 'idee-maitresse', titre: 'Le texte' };
    const DECLINE = { type: 'se_decline_en', source: 'C', cible: 'I' };
    const LECON = (meta) => ({ id: 'L', type: 'lecon', titre: 'Lire', metadata: meta });
    const CONCRETISE = { type: 'se_concretise_dans', source: 'I', cible: 'L' };
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
        expect(carte({ prods: [{ id: 'P', dansBibliotheque: false }] }).condition()).not.toBeNull();
        expect(carte({ prods: [{ id: 'P', dansBibliotheque: false }, { id: 'Q' }] }).condition()).toBeNull();
    });
});
