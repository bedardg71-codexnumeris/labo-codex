import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';
import { echelleDeDepart27Oct } from './_helpers/echelle-de-depart-27-oct.js';

// SENTINELLE — « PS – Préstructurel », le cinquième niveau de l'Échelle de départ (IDME) (27 oct. 2026).
// Décision de Grégoire (27 oct., 17 h 56-17 h 57 ; le code « PS », 18 h 06) ; VERDICT-RELECTURE-2026-10-27-aide-lot-2b.md,
// § 4.3 et § 4.4. « PS se comporte comme I, D, M et E » ; « le 0 reste au non recevable » ; « le zéro reste un piège ».
//
// Les VRAIS lecteurs, sur les niveaux que sème le VRAI `echelles.js` :
//   · la déduction par pourcentage (`niveauDuPourcentage`, chemins algorithmique et analytique, `sansNiveauZero`) ;
//   · la couverture des plages (l'étape « Pourcentages » de la chaîne de l'échelle) ;
//   · la valeur ponctuelle (`valeurNumeriqueDuNiveau`) : un VRAI zéro ;
//   · la table de conversion par code, que lit PAN-Standards (`obtenirTableConversionNiveaux`).
// Le non recevable, code « 0 », reste écarté des trois premiers.
//
// ↻ 22 nov. 2026 — LA SOURCE NE SÈME PLUS « PS » (décision de Grégoire, 12 h 27 : « 0 – Aucun » en tête, « I » dès 0 %).
// TARIR, PAS RÉPARER : un trimestre installé avant garde « PS », et ses lecteurs n'ont pas changé. Ce banc les juge donc
// sur ce STOCK (`_helpers/echelle-de-depart-27-oct.js`), et vérifie d'abord que le semis ne le réécrit pas. Le semis
// neuf a son banc : sentinelle-echelle-de-depart-aucun-1-22-nov.test.js.

const dbVide = { getSync: (k, d) => d, setSync() {}, get: async () => null, set: async () => {}, modifier: async () => undefined };

function dbDepuisStore(store) {
    return {
        modifier: async (c, mutateur, defaut = null) => {
            const lue = c in store ? store[c] : defaut;
            const resultat = await mutateur(lue);
            if (resultat === undefined) return undefined;
            store[c] = resultat;
            return resultat;
        },
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; }, setSync: (c, v) => { store[c] = v; }
    };
}

let E, niveaux, niveauDuPourcentage, tableConversion, stockAvant, stockApres;
const NON_RECEVABLE = { code: '0', nom: 'Non recevable', min: 0, max: 0, valeurCalcul: 0 };

beforeAll(async () => {
    // Un trimestre semé avant le 22 nov. : son échelle de départ porte « PS ». Le semis repasse ; il ne doit rien réécrire.
    stockAvant = echelleDeDepart27Oct();
    const store = { a2026_echellesTemplates: [echelleDeDepart27Oct()] };
    const win = { cle: (k) => 'a2026_' + k, estRessourceSupprimee: () => false };
    await chargerScript('js/echelles.js', { db: dbDepuisStore(store), cle: win.cle }, win).assurerEchelleIdmeDeDepart();
    stockApres = store.a2026_echellesTemplates;
    niveaux = store.a2026_echellesTemplates[0].niveaux;

    const document = new JSDOM('<!doctype html><html><body></body></html>').window.document;
    E = chargerScript('js/echelles.js', { db: dbVide, cle: (k) => 'a2026_' + k, document, echapperHtml: (t) => String(t),
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {}, warning() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        alert() {}, confirm: () => true, genererIdUnique: (p) => (p || '') + 'X' });

    const winCalcul = { addEventListener() {}, removeEventListener() {} };
    chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau: E.valeurNumeriqueDuNiveau }, winCalcul);
    niveauDuPourcentage = winCalcul.niveauDuPourcentage;

    const echelle = { id: 'ECHELLE_IDME_DEPART', nom: 'Échelle de départ (IDME)', niveaux };
    const calculs = chargerPredicatsCopie(chargerScript('js/profil-etudiant-calculs.js', {
        db: { get: async () => null, getSync: (k, d) => (k === 'test_echellesTemplates' ? [echelle] : (d !== undefined ? d : null)), set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k, echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => [], obtenirPreference: () => null, obtenirEtudiantsCoursActif: () => [],
        afficherNotificationCopiee: () => {}, afficherSection: () => {}, afficherSousSection: () => {},
        calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0, M: 0, E: 0 }), obtenirSeuil: () => 0.70, chargerSeuilsInterpretation: () => ({}),
        estEtudiantExclu: () => false, filtrerEtudiantsParMode: (a) => a, estModeeLectureSeule: () => false,
        genererSeancesCompletes: () => {}, calculerEtSauvegarderIndicesAssiduite: () => {}, calculerEtStockerIndicesCP: () => {}
    }));
    tableConversion = calculs.obtenirTableConversionNiveaux('ECHELLE_IDME_DEPART');
});

describe('PS · un niveau comme les autres, le zéro compris (le stock du 27 oct., qui reste chez les gens)', () => {
    it('un trimestre semé avant le 22 nov. garde PS en tête : le semis ne réécrit pas son échelle de départ', () => {
        expect(stockApres).toEqual([stockAvant]);
        expect(niveaux.map((n) => n.code)).toEqual(['PS', 'I', 'D', 'M', 'E']);
        expect(niveaux.some((n) => n.code === '0' || n.code === 0)).toBe(false);
    });

    it('un pourcentage de 0 à 39,99 % donne PS, même sur les chemins qui écartent le non recevable', () => {
        for (const opt of [undefined, { sansNiveauZero: true }]) {
            expect([0, 20, 39, 39.4].map((p) => niveauDuPourcentage(p, niveaux, opt)), JSON.stringify(opt)).toEqual(['PS', 'PS', 'PS', 'PS']);
            expect(niveauDuPourcentage(40, niveaux, opt)).toBe('I');
        }
    });

    it('le non recevable (« 0 ») reste écarté, même posé à côté de PS', () => {
        expect(niveauDuPourcentage(0, [NON_RECEVABLE, ...niveaux], { sansNiveauZero: true })).toBe('PS');
    });

    it('l\'étape « Pourcentages » ne voit aucun trou sur l\'échelle de départ du stock', () => {
        expect(E.couvertureDesPourcentages(niveaux)).toEqual({ etat: 'ok' });
    });

    it('l\'import des commentaires d\'une cartouche lit « PS » : les codes viennent de l\'échelle (#531), pas d\'une classe [IDME]', () => {
        const document = new JSDOM('<!doctype html><html><body></body></html>').window.document;
        const C = chargerScript('js/cartouches.js', { db: dbVide, cle: (k) => 'a2026_' + k, document, echapperHtml: (t) => String(t),
            notifications: { succes() {}, erreur() {}, info() {}, avertissement() {}, warning() {} },
            BibliothequeUI: { obtenirAuteurActif: () => 'banc', filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
            alert() {}, confirm: () => true, genererIdUnique: (p) => (p || '') + 'X' });
        expect(C.lireLigneCommentaire('**Analyse (PS)** : Texte fictif.', niveaux)).toEqual({ critere: 'Analyse', niveau: 'PS', commentaire: 'Texte fictif.' });
        expect(C.parserMarkdownCartouche('## Analyse\n**Analyse (PS)** : Texte fictif.\n**Analyse (I)** : Autre texte.', niveaux))
            .toMatchObject({ ANALYSE_PS: 'Texte fictif.', ANALYSE_I: 'Autre texte.' });
    });

    it('la valeur ponctuelle de PS est un VRAI zéro, pour la note et pour PAN-Standards', () => {
        const ps = niveaux.find((n) => n.code === 'PS');
        expect(E.valeurNumeriqueDuNiveau(ps)).toBe(0);
        expect(tableConversion).toMatchObject({ PS: 0, I: 0.4, D: 0.65, M: 0.75, E: 1 });
    });
});
