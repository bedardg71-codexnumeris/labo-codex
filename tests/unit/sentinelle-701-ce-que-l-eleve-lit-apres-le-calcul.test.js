/**
 * #701 · #702 · #704 · #686 — CE QUE L'ÉLÈVE LIT UNE FOIS SA NOTE CALCULÉE
 * (décisions de Grégoire du 17 sept. 2026 ; consigne de Cowork du 19 sept.)
 *
 *   #701 — le pourcentage est ARRONDI À L'ENTIER avant de chercher le niveau, par UNE fonction
 *          (`niveauDuPourcentage`) que lisent les trois chemins : global, algorithmique, analytique.
 *   #702 — « -- » n'entre plus dans `evaluationEnCours.criteres`, donc plus en base ; sur une échelle
 *          aux bornes espacées, l'algorithmique prend le niveau le plus proche, comme le global.
 *   #704 — zéro erreur donne la note complète dans les deux modes ; seule la copie sans texte reste
 *          sans résultat.
 *   #686 — grille introuvable : le registre des énoncés reçoit le nom que l'évaluation porte.
 *
 * (#705 est verrouillé par `sentinelle-674-*` et le banc E2 de l'audit du moteur ; #703 par
 * `sentinelle-703-criteres-sans-type.test.js`.)
 *
 * Harnais : celui de `sentinelle-698-*` (les vraies fonctions, un faux écran). Aucune donnée réelle.
 */
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function classList(initial) {
    const s = new Set(initial || []);
    return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); },
        toggle(c, force) { if (force === undefined) force = !s.has(c); if (force) s.add(c); else s.delete(c); return force; } };
}
function elementDom(init) {
    return Object.assign({ value: '', textContent: '', innerHTML: '', checked: false, style: {}, classList: classList(),
        closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
        appendChild() {}, replaceChildren() {}, remove() {}, setAttribute() {}, addEventListener() {}, dispatchEvent() { return true; } }, init || {});
}
function valeurNumeriqueDuNiveau(niveau) {
    if (!niveau) return null;
    const p = Number(niveau.valeurCalcul);
    return (niveau.valeurCalcul != null && niveau.valeurCalcul !== '' && !isNaN(p)) ? p : null;
}

// Les deux jeux de bornes que l'application sème : entières (le gabarit d'échelle neuve,
// `echelles.js`) et en « ,99 » (`niveauxDefaut`, l'IDME d'origine).
const ENTIERES = [{ code: 'I', min: 0, max: 59, valeurCalcul: 30 }, { code: 'D', min: 60, max: 74, valeurCalcul: 67 },
    { code: 'M', min: 75, max: 89, valeurCalcul: 82 }, { code: 'E', min: 90, max: 100, valeurCalcul: 95 }];
const EN_99 = [{ code: 'I', min: 0, max: 64.99, valeurCalcul: 32 }, { code: 'D', min: 65, max: 74.99, valeurCalcul: 69.5 },
    { code: 'M', min: 75, max: 84.99, valeurCalcul: 79.5 }, { code: 'E', min: 85, max: 100, valeurCalcul: 92.5 }];
// Bornes ESPACÉES : rien entre 70 et 75, rien entre 55 et 60.
const ESPACEE = [{ code: 'I', min: 0, max: 55, valeurCalcul: 40 }, { code: 'D', min: 60, max: 70, valeurCalcul: 65 },
    { code: 'M', min: 75, max: 89, valeurCalcul: 84 }, { code: 'E', min: 90, max: 100, valeurCalcul: 95 }];

function chargerCalculSeul() {
    const win = { addEventListener() {}, removeEventListener() {} };
    chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau }, win);
    return win;
}

describe('#701 · le pourcentage est arrondi à l\'entier avant de chercher le niveau', () => {
    const win = chargerCalculSeul();
    const n = (p, niveaux, o) => win.niveauDuPourcentage(p, niveaux, o);

    it('témoin de source : les deux jeux de bornes éprouvés ici sont bien ceux que `echelles.js` sème', () => {
        const src = readFileSync(path.join(racine, 'js/echelles.js'), 'utf8');
        expect(src).toContain("min: 75, max: 89, valeurCalcul: 82");
        expect(src).toContain('max: 74.99');
    });

    it('bornes entières : 74,4 reste D ; 74,5 monte à M ; 89,5 → E ; 59,5 → D ; 59,4 reste I', () => {
        expect([74.4, 74.5, 89.5, 59.5, 59.4, 89.4].map((p) => n(p, ENTIERES))).toEqual(['D', 'M', 'E', 'D', 'I', 'M']);
    });

    it('bornes en « ,99 » : 74,4 reste D ; 74,5 monte à M ; 84,5 → E ; 64,5 → D ; et 74,995 (l\'ancien trou d\'un centième) → M', () => {
        expect([74.4, 74.5, 84.5, 64.5, 64.4, 74.995].map((p) => n(p, EN_99))).toEqual(['D', 'M', 'E', 'D', 'I', 'M']);
    });

    it('le bruit de la virgule flottante ne fait pas tomber d\'un niveau : 74,49999999999999 (ce que rend 20 − 51/5000×500, en %) se lit 74,5', () => {
        const bruite = (20 - 51 / 5000 * 500) / 20 * 100;
        expect(bruite).not.toBe(74.5);
        expect(bruite).toBeCloseTo(74.5, 10);
        expect(n(bruite, ENTIERES)).toBe('M');
    });

    it('L\'ARRONDI FERME TOUS LES TROUS des deux jeux de bornes : de 0 à 100 par centième, jamais le repli « le plus proche »', () => {
        const avertir = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            for (const niveaux of [ENTIERES, EN_99]) {
                for (let c = 0; c <= 10000; c++) expect(n(c / 100, niveaux)).toMatch(/^[IDME]$/);
            }
            expect(avertir).not.toHaveBeenCalled();
        } finally { avertir.mockRestore(); }
    });

    it('TROU RÉSIDUEL sur des bornes espacées : le niveau le plus proche (milieu de plage), jamais « -- » ni rien', () => {
        const avertir = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            expect(n(72, ESPACEE)).toBe('D');    // milieu de D = 65 (à 7), milieu de M = 82 (à 10)
            expect(n(74, ESPACEE)).toBe('M');    // 9 contre 8
            expect(n(57, ESPACEE)).toBe('D');    // milieu de I = 27,5 (à 29,5), milieu de D = 65 (à 8)
            expect(avertir).toHaveBeenCalledTimes(3);
            for (let c = 0; c <= 10000; c += 7) expect(n(c / 100, ESPACEE)).toMatch(/^[IDME]$/);
        } finally { avertir.mockRestore(); }
    });

    it('le niveau « 0 » (non recevable) ne se déduit jamais d\'un chiffre quand l\'appelant le demande', () => {
        const avecZero = [{ code: '0', min: 0, max: 0, valeurCalcul: 0 }].concat(ENTIERES);
        expect(n(0, avecZero)).toBe('0');
        expect(n(0, avecZero, { sansNiveauZero: true })).toBe('I');
    });

    it('rien ne se déduit de rien : pourcentage absent, échelle absente ou vide → undefined, jamais « -- »', () => {
        expect([n(null, ENTIERES), n(undefined, ENTIERES), n('', ENTIERES), n(NaN, ENTIERES), n(80, null), n(80, []), n(80, [{ code: '0', min: 0, max: 0 }], { sansNiveauZero: true })])
            .toEqual([undefined, undefined, undefined, undefined, undefined, undefined, undefined]);
    });

    it('UNE SEULE RECHERCHE : hors `niveauDuPourcentage`, plus aucune comparaison aux bornes dans evaluation-calcul.js (hors commentaires)', () => {
        const code = readFileSync(path.join(racine, 'js/evaluation-calcul.js'), 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        expect((code.match(/<= *Number\(n\.max\)|<= *n\.max/g) || []).length).toBe(1);
        expect((code.match(/niveauDuPourcentage\(/g) || []).length).toBe(4);   // sa déclaration + global, algorithmique, analytique
    });
});

/* ------------------------------------------------------------ le moteur, avec un faux écran */

const GRILLE_SIMPLE = { id: 'GS', nom: 'Contenu 80 · Français 20', criteres: [
    { id: 'c1', nom: 'Contenu', ponderation: 80 }, { id: 'a1', nom: 'Français écrit', ponderation: 20, type: 'algorithmique' } ] };
const GRILLE_CATEGORIES = { id: 'GC', nom: 'Contenu 80 · Français 20 (catégories)', criteres: [
    { id: 'c1', nom: 'Contenu', ponderation: 80 },
    { id: 'a1', nom: 'Français écrit', ponderation: 20, type: 'algorithmique', sousCriteres: [
        { id: 'SC1', code: '1', nom: 'Syntaxe', ponderation: 1, retroaction: '' }, { id: 'SC4', code: '4', nom: 'Accord GN', ponderation: 1.5, retroaction: '' } ] } ] };
const GRILLE_ANALYTIQUE = { id: 'GN', nom: 'Contenu 70 · Démarche 30 (points)', criteres: [
    { id: 'c1', nom: 'Contenu', ponderation: 70 }, { id: 'k1', nom: 'Démarche', ponderation: 30, type: 'analytique' } ] };

function monter({ grille, niveaux = ENTIERES, echelleEnBase = true, chaine = false, grilleEnBase = true, evaluations = [], idModification } = {}) {
    const ecran = {
        noteProduction1: elementDom(), niveauProduction1: elementDom(), criteresCopier: elementDom(), porteeNote1: elementDom({ classList: classList(['u-hide']) }),
        selectEchelle1: elementDom({ value: 'E1' }), selectEtudiantEval: elementDom({ value: '1234567' }), selectProduction1: elementDom({ value: 'P1' }),
        selectGrille1: elementDom({ value: grille.id }), selectCartoucheEval: elementDom({ value: '' }), remiseProduction1: elementDom({ value: 'remis' }),
        statutIntegrite: elementDom({ value: 'recevable' }), notesIntegrite: elementDom({ value: '' }), retroactionFinale1: elementDom({ value: '' }),
        afficherDescription1: elementDom(), afficherObjectif1: elementDom(), afficherTache1: elementDom(), afficherAdresse1: elementDom(), afficherContexte1: elementDom(),
        eval_c1: elementDom(), comm_c1: elementDom()
    };
    ['eval_erreurs_', 'eval_mots_', 'eval_categories_', 'total_erreurs_', 'mots_formule_', 'total_erreurs_simple_', 'mots_simple_', 'note_algo_', 'pct_algo_',
        'niveau_algo_', 'cat_dominante_', 'formule_algo_', 'resultat_algo_', 'retroaction_cat_', 'comm_', 'eval_'].forEach((p) => { ecran[p + 'a1'] = elementDom(); });
    const document = { getElementById: (id) => ecran[id] || null, querySelector: () => null, querySelectorAll: () => [], createElement: () => elementDom(),
        addEventListener() {}, removeEventListener() {}, body: elementDom(), documentElement: elementDom() };
    const ec = { etudiantDA: '1234567', productionId: 'P1', grilleId: grille.id, echelleId: 'E1', cartoucheId: '', criteres: { c1: 'M' }, donneesAlgorithmiques: {}, pointsAnalytiques: {} };
    const base = { test_grillesTemplates: grilleEnBase ? [grille] : [], test_echellesTemplates: echelleEnBase ? [{ id: 'E1', nom: 'Échelle', niveaux }] : [],
        test_pratiquesConfigurables: [], test_evaluationsSauvegardees: evaluations };
    base['test_cartouches_' + grille.id] = [];
    const ecritures = [], refus = [];
    const win = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: Object.assign(ec, idModification ? { idModification } : {}), majBadgesApresEvaluation() {}, genererRetroaction() {} };
    const globaux = {
        document, evaluationEnCours: ec, cle: (k) => 'test_' + k, valeurNumeriqueDuNiveau, echapperHtml: (s) => String(s == null ? '' : s), genererIdUnique: (p) => p + 'NEUF',
        db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : d), setSync() {}, get: async () => null, set: async () => {} },
        obtenirDonneesSelonMode: (k) => k === 'groupeEtudiants' ? [{ da: '1234567', prenom: 'A', nom: 'B', groupe: '01' }] : k === 'productions' ? [{ id: 'P1', titre: 'Prod' }] : [],
        sauvegarderDonneesSelonMode: (k, v) => { ecritures.push({ k, v: JSON.parse(JSON.stringify(v)) }); return true; },
        notifications: { succes() {}, erreur(t, m) { refus.push({ titre: t, details: m }); }, info() {}, warning() {} },
        obtenirPreference: () => null, obtenirCoursActifId: () => null, afficherNotificationSucces() {}, afficherNotificationErreur() {}, afficherNotificationCopiee() {},
        afficherSection() {}, afficherSousSection() {}, estModeeLectureSeule: () => false, obtenirConfigJetons: () => ({}), verifierDisponibiliteJeton: () => true, compterJetonsUtilises: () => 0,
        copierEnFormatTSV() {}, setTimeout: () => 0, clearTimeout() {}, genererRetroaction() {}, calculerNote: () => win.calculerNote(), mettreAJourCompteurMots() {}
    };
    chargerScript('js/evaluation-formules.js', globaux, win);
    chargerScript('js/evaluation-enonces.js', globaux, win);
    chargerScript('js/evaluation-projection.js', globaux, win);
    chargerScript('js/evaluation-calcul.js', globaux, win);
    if (chaine) {
        chargerScript('js/evaluation-chargement.js', globaux, win);
        chargerScript('js/evaluation-sauvegarde.js', globaux, win);
        chargerScript('js/evaluation.js', globaux, win);
    }
    return { win, ecran, ec, ecritures, refus };
}
const simple = (h, erreurs, mots) => { h.ecran.eval_erreurs_a1.value = erreurs; h.ecran.eval_mots_a1.value = mots; h.win.calculerNoteAlgorithmiqueSimple('a1', 20, 500); };
const categories = (h, codes, mots) => { h.ecran.eval_categories_a1.value = codes; h.ecran.eval_mots_a1.value = mots; h.win.calculerNoteAlgorithmiqueAvecCategories('a1', 20, 500, 'a1'); };

describe('#701 · les trois chemins donnent le MÊME niveau à 74,5 %', () => {
    it('global : deux critères à 50 %, E (95) et I (54) — la moyenne fait 74,5 : M, et la note affichée reste 74,5 %', () => {
        const grille = { id: 'G5', nom: '50/50', criteres: [{ id: 'c1', nom: 'A', ponderation: 50 }, { id: 'c2', nom: 'B', ponderation: 50 }] };
        const niveaux = [{ code: 'I', min: 0, max: 59, valeurCalcul: 54 }, { code: 'D', min: 60, max: 74, valeurCalcul: 65 },
            { code: 'M', min: 75, max: 89, valeurCalcul: 84 }, { code: 'E', min: 90, max: 100, valeurCalcul: 95 }];
        const h = monter({ grille, niveaux });
        h.ecran.eval_c2 = elementDom(); h.ec.criteres = { c1: 'E', c2: 'I' };   // (95 + 54) / 2 = 74,5
        h.win.calculerNote();
        expect(h.ecran.noteProduction1.textContent).toBe('74,5\u00A0%');   // la NOTE garde son pourcentage exact
        expect(h.ecran.niveauProduction1.textContent).toBe('M');
    });
    it('algorithmique : 51 erreurs / 5000 mots = 74,5 % → M, à l\'écran, dans l\'évaluation en cours et dans la mémoire', () => {
        const h = monter({ grille: GRILLE_SIMPLE });
        simple(h, '51', '5000');
        expect(h.ecran.pct_algo_a1.textContent).toBe('74,5');
        expect([h.ecran.niveau_algo_a1.textContent, h.ec.criteres.a1, h.ec.donneesAlgorithmiques.a1.niveau]).toEqual(['M', 'M', 'M']);
    });
    it('analytique : 22,35 points sur 30 = 74,5 % → M', () => {
        const h = monter({ grille: GRILLE_ANALYTIQUE });
        expect(h.win.niveauDeduitDesPoints(GRILLE_ANALYTIQUE.criteres[1], 22.35, ENTIERES)).toBe('M');
        expect(h.win.niveauDeduitDesPoints(GRILLE_ANALYTIQUE.criteres[1], 22.2, ENTIERES)).toBe('D');   // 74,0 %
    });
});

describe('#702 · « -- » n\'entre plus dans l\'évaluation, ni en base', () => {
    it('bornes espacées, 72 % : l\'algorithmique prend le plus proche (D), comme le global — avant : « -- »', () => {
        const avertir = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const h = monter({ grille: GRILLE_SIMPLE, niveaux: ESPACEE });
            simple(h, '56', '5000');   // 20 − 5,6 = 14,4 → 72 %
            expect(h.ecran.pct_algo_a1.textContent).toBe('72,0');
            expect(h.ec.criteres.a1).toBe('D');
            expect(h.ecran.criteresCopier.textContent).toBe('M\tD');
        } finally { avertir.mockRestore(); }
    });
    it('échelle INTROUVABLE : le critère n\'entre pas du tout (avant : criteres.a1 = « -- ») ; l\'écran du critère montre « -- », qui n\'est qu\'un affichage', () => {
        const h = monter({ grille: GRILLE_SIMPLE, echelleEnBase: false });
        simple(h, '4', '500');
        expect(h.ec.criteres.a1).toBeUndefined();
        expect(Object.values(h.ec.criteres)).not.toContain('--');
        expect(h.ecran.niveau_algo_a1.textContent).toBe('--');
        expect(h.ec.donneesAlgorithmiques.a1.niveau).toBeUndefined();
    });
    it('l\'ENREGISTREMENT à 72 % sur bornes espacées écrit niveauSelectionne « D » — aucun « -- » dans ce qui part en base', () => {
        const avertir = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const h = monter({ grille: GRILLE_SIMPLE, niveaux: ESPACEE, chaine: true });
            simple(h, '56', '5000');
            h.win.sauvegarderEvaluation();
            expect(h.refus).toEqual([]);
            const ev = h.ecritures.filter((x) => x.k === 'evaluationsSauvegardees').pop().v.find((e) => e.id === 'EVAL_NEUF');
            expect(ev.criteres.map((c) => c.critereId + ':' + c.niveauSelectionne)).toEqual(['c1:M', 'a1:D']);
            expect(JSON.stringify(ev)).not.toContain('"--"');
        } finally { avertir.mockRestore(); }
    });
});

describe('#704 · zéro erreur donne la note complète, dans les deux modes', () => {
    it('mode CATÉGORIES, aucun code sur 500 mots : 100 % (E), note 85,6 % — avant : pas de résultat, note retenue', () => {
        const h = monter({ grille: GRILLE_CATEGORIES });
        categories(h, '', '500');
        expect(h.ec.donneesAlgorithmiques.a1).toMatchObject({ totalErreurs: 0, pourcentage: 100, noteCalculee: 20, niveau: 'E' });
        expect(h.ec.criteres.a1).toBe('E');
        expect(h.ecran.noteProduction1.textContent).toBe('85,6\u00A0%');   // 0,8×82 + 0,2×100
        expect(h.win.porteeCalculeeCourante.incomplete).toBe(false);
    });
    it('…et la rétroaction est celle du gabarit pour zéro erreur — la même phrase que le mode simple, jamais l\'amorce', () => {
        const c = monter({ grille: GRILLE_CATEGORIES }); categories(c, '', '500');
        const s = monter({ grille: GRILLE_SIMPLE }); simple(s, '0', '500');
        expect(c.ecran.comm_a1.textContent).toContain('0 erreur de français pour 500 mots.');
        expect(c.ecran.comm_a1.textContent).toBe(s.ecran.comm_a1.textContent);
        expect(c.ecran.cat_dominante_a1.textContent).toBe('--');
    });
    it('mode SIMPLE, témoin : 0 erreur sur 500 mots = 100 % (E)', () => {
        const h = monter({ grille: GRILLE_SIMPLE });
        simple(h, '0', '500');
        expect(h.ec.donneesAlgorithmiques.a1).toMatchObject({ pourcentage: 100, niveau: 'E' });
    });
    it('la copie SANS TEXTE reste sans résultat, dans les deux modes (`mots === 0`)', () => {
        const c = monter({ grille: GRILLE_CATEGORIES }); categories(c, '', '');
        const s = monter({ grille: GRILLE_SIMPLE }); simple(s, '0', '');
        for (const h of [c, s]) {
            expect(h.ec.criteres.a1).toBeUndefined();
            expect(h.ec.donneesAlgorithmiques.a1.pourcentage).toBeUndefined();
            expect(h.ecran.noteProduction1.textContent).toBe('--');
        }
    });
    it('un niveau choisi À LA MAIN au menu d\'une copie sans code n\'est pas remplacé par 100 % (la seule façon de la noter jusqu\'ici)', () => {
        const h = monter({ grille: GRILLE_CATEGORIES });
        h.ecran.eval_a1.value = 'M'; h.ec.criteres.a1 = 'M';
        categories(h, '', '500');
        expect(h.ec.criteres.a1).toBe('M');
        expect(h.ec.donneesAlgorithmiques.a1.pourcentage).toBeUndefined();
        expect(h.ecran.noteProduction1.textContent).toBe('82\u00A0%');   // M vaut 82 partout
    });
    it('le registre dit déjà « aucune erreur : la note est complète » — modèle `ratio_cible`', () => {
        const h = monter({ grille: GRILLE_SIMPLE });
        const critere = { modeleFormule: 'ratio_cible' };
        expect(h.win.formulesAlgo.normaliser(critere)).toMatchObject({ modeleId: 'ratio_cible', herite: false });
        const zero = h.win.formulesAlgo.calculer(critere, { ponderation: 20, erreurs: 0, mots: 500 });
        expect(zero).toMatchObject({ applicable: true, note: 20, pctBorne: 100 });
        // ↻ Étape 4a (27 oct.) : la ligne dit le cas « vaut 0 » choisi (au départ, la note entière).
        expect(h.win.formulesAlgo.libelleChiffre(critere, { ponderation: 20, erreurs: 0, mots: 500 })).toBe('Le compte pondéré des erreurs vaut 0 : la note est entière, 20 / 20.');
        // Témoin : le même modèle, avec des erreurs, ne rend PAS la note complète — l'essai distingue.
        expect(h.win.formulesAlgo.calculer(critere, { ponderation: 20, erreurs: 25, mots: 500 }).note).toBeLessThan(20);
    });
});

describe('#686 · grille introuvable : le critère garde les mots de son nom', () => {
    const EV = { id: 'EV1', grilleId: 'GS', criteres: [{ critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M' }, { critereId: 'a1', critereNom: 'Français écrit', niveauSelectionne: 'M' }],
        donneesAlgorithmiques: { a1: { erreurs: 4, mots: 500, pourcentage: 80 } } };

    it('le registre : sans grille, `critereAlgorithmiqueOuNomme` rend le nom que l\'évaluation porte — et « concentre » parle de français', () => {
        const { win } = monter({ grille: GRILLE_SIMPLE });
        const api = win.enoncesAlgo;
        expect(api.critereAlgorithmiqueOuNomme(null, EV)).toEqual({ nom: 'Français écrit' });
        expect(api.critereAlgorithmiqueOuNomme(null, EV, 'a1')).toEqual({ nom: 'Français écrit' });
        expect(api.enonce(api.critereAlgorithmiqueOuNomme(null, EV), 'concentre', {})).toMatch(/français/i);
        expect(api.enonce(null, 'concentre', {}), 'témoin : sans nom, le modèle générique ne nomme aucune discipline').not.toMatch(/français/i);
        expect(api.libelleCritere(api.critereAlgorithmiqueOuNomme(null, EV))).toBe('Français écrit');
    });
    it('la grille PRÉSENTE l\'emporte toujours, et une grille présente sans ce critère ne devine rien', () => {
        const { win } = monter({ grille: GRILLE_SIMPLE });
        expect(win.enoncesAlgo.critereAlgorithmiqueOuNomme(GRILLE_SIMPLE, EV)).toBe(GRILLE_SIMPLE.criteres[1]);
        expect(win.enoncesAlgo.critereAlgorithmiqueOuNomme({ id: 'GX', criteres: [{ id: 'c1', nom: 'Contenu' }] }, EV)).toBeNull();
        expect(win.enoncesAlgo.critereAlgorithmiqueOuNomme(null, { criteres: [{ critereId: 'c1', critereNom: 'Contenu' }] })).toBeNull();
    });
    it('le calcul : grille introuvable, évaluation ouverte en modification → « Ta rédaction contient 4 erreurs de français… » (avant : « Ta production contient… »)', () => {
        const avec = monter({ grille: GRILLE_SIMPLE, grilleEnBase: false, evaluations: [EV], idModification: 'EV1' });
        simple(avec, '4', '500');
        expect(avec.ecran.comm_a1.textContent).toContain('Ta rédaction contient 4 erreurs de français pour 500 mots.');
        const sans = monter({ grille: GRILLE_SIMPLE, grilleEnBase: false });
        simple(sans, '4', '500');
        expect(sans.ecran.comm_a1.textContent, 'témoin : sans évaluation enregistrée, rien à lire — le générique').toContain('Ta production contient 4 erreurs pour 500 mots.');
    });
    it('…et le mode CATÉGORIES aussi (l\'autre appelant) : « 1;4 » sur 500 mots, grille introuvable → les mots du français', () => {
        const evCat = Object.assign({}, EV, { grilleId: 'GC' });
        const avec = monter({ grille: GRILLE_CATEGORIES, grilleEnBase: false, evaluations: [evCat], idModification: 'EV1' });
        categories(avec, '1;4', '500');
        expect(avec.ecran.comm_a1.textContent).toContain('Ta rédaction contient 2 erreurs de français pour 500 mots.');
        const sans = monter({ grille: GRILLE_CATEGORIES, grilleEnBase: false });
        categories(sans, '1;4', '500');
        expect(sans.ecran.comm_a1.textContent).toContain('Ta production contient 2 erreurs pour 500 mots.');
    });

    it('le PDF de l\'élève : grille introuvable → le décompte d\'erreurs est titré « Français écrit » (avant : le libellé neutre) ; grille présente : inchangé', () => {
        const monterPdf = (grilles) => {
            const win = { addEventListener() {}, removeEventListener() {} };
            chargerScript('js/evaluation-enonces.js', {}, win);
            const calcul = chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau }, { addEventListener() {}, removeEventListener() {} });
            const base = { test_grillesTemplates: grilles };
            chargerScript('js/synthese-retroaction-data.js', {
                db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : (d !== undefined ? d : null)), get: async () => null, set: async () => {}, setSync() {} },
                cle: (k) => 'test_' + k, echapperHtml: (t) => String(t == null ? '' : t),
                obtenirEchelleResolue: () => ({ id: 'E1', niveaux: ENTIERES }), obtenirDonneesSelonMode: () => [], obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }),
                obtenirEtudiantsCoursActif: () => [], obtenirGroupesCours: () => [], travauxStockage: { obtenirAnnotationFichier: () => null },
                travauxOutils: { AUTOCOLLANTS: [] }, obtenirPreference: () => null,
                porteeDepuisEvaluation: calcul.porteeDepuisEvaluation, texteCriteresHorsNote: calcul.texteCriteresHorsNote
            }, win);
            return (evaluation) => win.syntheseRetroactionData.construireFeedback(evaluation, { id: 'F1' }, null);
        };
        const ev = Object.assign({ etudiantDA: '111', echelleId: 'E1', noteFinale: 82, niveauFinal: 'M', ponderationCouverte: 100 }, EV);
        expect(monterPdf([])(ev).errorsLabel).toBe('Français écrit');
        expect(monterPdf([])(Object.assign({}, ev, { donneesAlgorithmiques: {} })).errorsLabel, 'témoin : rien ne désigne le critère algorithmique').not.toBe('Français écrit');
        expect(monterPdf([GRILLE_SIMPLE])(ev).errorsLabel).toBe('Français écrit');
    });
});
