import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #757 — LA LIGNE « NOTE FINALE » DU TEXTE COPIÉ VERS LÉA NE DOUBLE PAS LE SIGNE %.
//
// Mesuré le 6 septembre 2026 au matin (Rapports/MESURE-ce-que-l-eleve-lit-dans-le-pdf-2026-09-06.md,
// constat C1) : l'élève lisait « Note finale : 63.5 %%  |  Niveau : D ». `calculerNote` écrit
// « 63.5 % » dans `noteProduction1` (evaluation-calcul.js l. 1404) et `_rendreNoteFinale`
// (evaluation-retroaction.js) relisait ce texte et lui ajoutait un second « % ». Présent au moins
// depuis l'extraction du module (9ffff2cf, 18 mai 2026) ; aucun test ne lisait cette ligne.
//
// ⮕ La ligne lit désormais la SOURCE du calcul (`noteCalculeeCourante` et sa portée, #572), la
// même que les quatre chemins d'écriture, et met l'unité une fois. Ce fichier charge les modules
// RÉELS (calcul + rétroaction) : c'est `calculerNote` qui pose la note, pas le banc.
//
// Décision de Grégoire (6 sept., matin) : corriger le jour même, sans toucher au reste.

function classList(initial) {
    const s = new Set(initial || []);
    return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); },
        toggle(c, force) { if (force === undefined) force = !s.has(c); if (force) s.add(c); else s.delete(c); return force; } };
}
function elementDom(init) {
    return Object.assign({ value: '', textContent: '', checked: false, style: {}, classList: classList(),
        closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
        appendChild() {}, remove() {}, setAttribute() {}, addEventListener() {}, dispatchEvent() { return true; } }, init || {});
}
function valeurNumeriqueDuNiveau(n) {
    if (!n) return null;
    const p = Number(n.valeurCalcul);
    return (n.valeurCalcul != null && n.valeurCalcul !== '' && !isNaN(p)) ? p : null;
}

const GRILLE = { id: 'G1', nom: 'Grille', criteres: [
    { id: 'c1', nom: 'Structure', ponderation: 60, type: 'holistique' },
    { id: 'c2', nom: 'Nuance', ponderation: 40, type: 'holistique' }
] };
const ECHELLE = { id: 'E1', nom: 'IDME', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
    { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
] };
const CARTOUCHE = { id: 'CT1', grilleId: 'G1', commentaires: { c1_D: 'Structure en développement.', c2_M: 'Nuance maîtrisée.' } };

/** Calcul + rétroaction RÉELS dans un même bac ; `mode` = 'complet' (défaut) ou 'lettre'. */
function monter({ niveaux, mode = 'complet' } = {}) {
    const ecran = {
        noteProduction1: elementDom(), niveauProduction1: elementDom(), criteresCopier: elementDom(),
        porteeNote1: elementDom({ classList: classList(['u-hide']) }),
        selectEtudiantEval: elementDom({ value: '1234567' }), selectProduction1: elementDom({ value: 'P1' }),
        selectGrille1: elementDom({ value: 'G1' }), selectEchelle1: elementDom({ value: 'E1' }), selectCartoucheEval: elementDom({ value: 'CT1' }),
        retroactionFinale1: elementDom({ value: '' }), 'compteur-mots-retro': elementDom(),
        afficherDescription1: elementDom(), afficherObjectif1: elementDom(), afficherTache1: elementDom(), afficherAdresse1: elementDom(), afficherContexte1: elementDom(),
        eval_c1: elementDom(), eval_c2: elementDom(), comm_c1: elementDom(), comm_c2: elementDom()
    };
    const document = {
        getElementById: (id) => ecran[id] || null,
        querySelector: (sel) => (sel.indexOf('affichageNote1') !== -1 ? { value: mode } : null),
        querySelectorAll: () => [], createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom()
    };
    const ec = { etudiantDA: '1234567', productionId: 'P1', grilleId: 'G1', echelleId: 'E1', cartoucheId: 'CT1',
        criteres: Object.assign({}, niveaux), donneesAlgorithmiques: {}, pointsAnalytiques: {} };
    const base = { test_grillesTemplates: [GRILLE], test_echellesTemplates: [ECHELLE], test_cartouches_G1: [CARTOUCHE], test_pratiquesConfigurables: [], test_evaluationsSauvegardees: [] };
    const win = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: ec, majBadgesApresEvaluation() {} };
    const globaux = {
        document, evaluationEnCours: ec,
        db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : d), setSync() {}, get: async () => null, set: async () => {} },
        cle: (k) => 'test_' + k, valeurNumeriqueDuNiveau, echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (k) => k === 'groupeEtudiants' ? [{ da: '1234567', prenom: 'A', nom: 'B', groupe: '01' }] : k === 'productions' ? [{ id: 'P1', titre: 'Prod' }] : [],
        sauvegarderDonneesSelonMode: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        niveauDuCodeDansEchelle: (code) => { const i = ['I', 'D', 'M', 'E'].indexOf(code); return i === -1 ? null : { code, nom: ECHELLE.niveaux[i].nom, rang: i + 1 }; },
        zoneDuNiveau: (code) => ({ I: 'priorite', D: 'signale', M: 'acquis', E: 'acquis' })[code] || null,
        obtenirPreference: () => null, obtenirCoursActifId: () => null, estModeeLectureSeule: () => false,
        obtenirConfigJetons: () => ({}), pluriel: (n, s, p) => (n > 1 ? p : s), setTimeout: () => 0, clearTimeout() {},
        calculerNote: (...a) => win.calculerNote(...a), genererRetroaction: (...a) => win.genererRetroaction(...a)
    };
    // #939 — la règle du commentaire d'un critère (`commentaireDuCritere`), le vrai module.
    chargerScript('js/synthese-retroaction-data.js', globaux, win);
    chargerScript('js/evaluation-calcul.js', globaux, win);
    chargerScript('js/evaluation-retroaction.js', globaux, win);
    return { win, ecran };
}

describe('#757 · la ligne « Note finale » du texte copié vers Léa porte l\'unité une seule fois', () => {

    it('D (60 %) + M (40 %) → « Note finale : 71.0 %  |  Niveau : D », jamais « %% »', () => {
        const { win, ecran } = monter({ niveaux: { c1: 'D', c2: 'M' } });
        win.calculerNote();
        expect(ecran.noteProduction1.textContent, 'ce que l\'écran affiche (source de la mesure C1)').toBe('71.0 %');
        win.genererRetroaction(1);
        const texte = ecran.retroactionFinale1.value;
        expect(texte).toContain('Note finale : 71.0 %  |  Niveau : D');
        expect(texte).not.toContain('%%');
    });

    it('le mode « lettre » ne donne que le niveau, sans note', () => {
        const { win, ecran } = monter({ niveaux: { c1: 'D', c2: 'M' }, mode: 'lettre' });
        win.calculerNote();
        win.genererRetroaction(1);
        const texte = ecran.retroactionFinale1.value;
        expect(texte).toContain('Niveau de performance : D');
        expect(texte).not.toContain('Note finale');
    });

    // ⚠ Trouvé en écrivant ce fichier, HORS #757 : une copie sans AUCUN niveau choisi affiche
    // « 0.0 % » à l'écran (`calculerNote`, portée « pas commencée » ≠ « incomplète »), et le texte
    // copié le suit — « Note finale : 0.0 % ». C'est le choix de l'écran, laissé tel quel ici ;
    // la ligne d'à côté ne fait que le recopier sans doubler l'unité.
});
