import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerTravauxOutilsReel } from './_helpers/travaux-outils-reel.js';

// SENTINELLE #764 — « COPIER TOUT » LIVRE UN TEXTE COMPLET, MÊME SANS CARTOUCHE, ET SANS PHRASE COUPÉE.
//
// Rapport de Grégoire, 6 septembre 2026, 8 h 54 (BUG_grégoire_2026-09-06_08-54-01, 1.123.4, capture) :
// « Quand je copie la rétroaction créée automatiquement lors de l'évaluation, le texte est incomplet. »
// Sa grille : un seul critère, « Français écrit (100 %) », algorithmique, 59 erreurs sur 460 mots →
// 23,0 %, niveau I. Son exemple ne porte que « === RÉTROACTION SPÉCIFIQUE === » et « === BILAN === »,
// et la capture montre la zone « Générale » encore sur son texte d'attente.
//
// DEUX CAUSES, DANS `evaluation-retroaction.js` :
// 1. `genererRetroaction` sortait dès que `evaluationEnCours.cartoucheId` était vide — la générale
//    était née cartouche, mais la rétroaction d'un critère algorithmique (le paragraphe engendré au
//    calcul), le décompte des codes « --- Langue --- » et la ligne « Note finale » n'ont pas besoin de
//    cartouche. Une grille de français sans cartouche ne donnait donc RIEN à copier de son critère.
// 2. `genererRetroactionSpecifique` coupait le texte de chaque code à 120 caractères (« … minuscule,
//    sou ») : un aperçu d'écran, copié tel quel dans ce qui est remis à l'élève.
//
// ⮕ La générale s'écrit avec ou sans cartouche (la cartouche n'ajoute que son contexte et ses
// commentaires) ; la spécifique porte les textes entiers. Le collage sans sauts de ligne (#759) n'est
// pas l'objet de ce fichier.
// Modules RÉELS : evaluation-calcul.js, evaluation-retroaction.js, travaux-export-pdf.js (compte des
// annotations), evaluation-enonces.js, evaluation-formules.js, codes-annotation.js. Doublures
// nommées : la palette de tampons (vide), les jetons, les lecteurs d'échelle (miroir IDME).

function classList(initial) {
    const s = new Set(initial || []);
    return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); },
        toggle(c, force) { if (force === undefined) force = !s.has(c); if (force) s.add(c); else s.delete(c); return force; } };
}
const decoder = (s) => String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
/** Comme `Node.textContent` : le texte des nœuds, sans séparateur (c'est ce que « Copier tout » copie). */
function elementDom(init) {
    const el = Object.assign({ value: '', checked: false, style: {}, classList: classList(), closest() { return null; },
        querySelector() { return null; }, querySelectorAll() { return []; }, appendChild() {}, remove() {}, setAttribute() {},
        addEventListener() {}, dispatchEvent() { return true; } }, init || {});
    let html = (init && init.innerHTML) || ''; let texte = (init && init.textContent) || '';
    Object.defineProperty(el, 'innerHTML', { get() { return html; }, set(v) { html = String(v); texte = decoder(html.replace(/<[^>]*>/g, '')); } });
    Object.defineProperty(el, 'textContent', { get() { return texte; }, set(v) { texte = String(v); html = texte; } });
    return el;
}
function valeurNumeriqueDuNiveau(n) {
    if (!n) return null;
    const p = Number(n.valeurCalcul);
    return (n.valeurCalcul != null && n.valeurCalcul !== '' && !isNaN(p)) ? p : null;
}

// La grille de Grégoire, au plus près : un critère algorithmique à 100 %, ses codes portés par la grille,
// deux d'entre eux avec un texte de plus de 120 caractères.
const TEXTE_10 = 'Les erreurs concernent l\'orthographe d\'usage (lettre, chiffre) ou des éléments de typographie (majuscule, minuscule, soulignement, italique) : relis chaque mot douteux avec le dictionnaire, et vérifie les majuscules de début de phrase.';
const TEXTE_4 = 'Les erreurs concernent l\'accord en genre et en nombre dans le groupe du nom (déterminant, nom, adjectif). Il devient plus difficile de comprendre le lien entre les mots si ces accords ne sont pas faits.';
const GRILLE = { id: 'G_F', nom: 'Français écrit', criteres: [
    { id: 'f1', nom: 'Français écrit', ponderation: 100, type: 'algorithmique', description: 'Respect des normes de la langue française écrite.',
      codesDepuisSousCriteres: true, sousCriteres: [
          { code: '10', nom: 'Orthographe d\'usage ou éléments de typographie', ponderation: 1, retroaction: TEXTE_10, couleur: '#2e7d32' },
          { code: '4', nom: 'Groupe du nom', ponderation: 1, retroaction: TEXTE_4, couleur: '#1565c0' }
      ] }
] };
const ECHELLE = { id: 'E1', nom: 'IDME', seuilSuffisance: 'D', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Incomplet ou insuffisant', min: 0, max: 54, valeurCalcul: 40 },
    { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
] };
const CARTOUCHE = { id: 'CT_F', grilleId: 'G_F', contexte: 'CONTEXTE-CARTOUCHE', commentaires: {} };
const RETRO_ALGO = 'ALGO : Ta rédaction contient 59 erreurs de français pour 460 mots.';
const FICHIER = { id: 'F1', etudiantDA: '1234567', productionId: 'P1' };
const ANNOTATION = { pages: { '1': { stickers: [], shapes: [].concat(Array(23).fill({ type: 'errfr_10' }), Array(17).fill({ type: 'errfr_4' })) } } };

function monter({ avecCartouche }) {
    const ecran = {
        noteProduction1: elementDom(), niveauProduction1: elementDom(), criteresCopier: elementDom(),
        porteeNote1: elementDom({ classList: classList(['u-hide']) }),
        selectEtudiantEval: elementDom({ value: '1234567' }), selectProduction1: elementDom({ value: 'P1' }),
        selectGrille1: elementDom({ value: 'G_F' }), selectEchelle1: elementDom({ value: 'E1' }), selectCartoucheEval: elementDom({ value: avecCartouche ? 'CT_F' : '' }),
        retroactionFinale1: elementDom({ value: '' }), 'compteur-mots-retro': elementDom(),
        afficherDescription1: elementDom({ checked: true }), afficherObjectif1: elementDom({ checked: true }), afficherTache1: elementDom({ checked: true }),
        afficherAdresse1: elementDom({ checked: true }), afficherContexte1: elementDom({ checked: true }),
        vueRetroGenerale: elementDom(), vueRetroSpecifique: elementDom(), vueRetroBilan: elementDom(),
        contenuRetroSpecifique: elementDom(), contenuRetroBilan: elementDom(),
        eval_f1: elementDom({ value: '' }), comm_f1: elementDom(), eval_mots_f1: elementDom({ value: '460' }), eval_erreurs_f1: elementDom({ value: '59' })
    };
    const document = { getElementById: (id) => ecran[id] || null, querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {}, body: elementDom(), documentElement: elementDom() };
    const ec = { etudiantDA: '1234567', productionId: 'P1', grilleId: 'G_F', echelleId: 'E1', cartoucheId: avecCartouche ? 'CT_F' : '',
        criteres: { f1: 'I' }, pointsAnalytiques: {},
        donneesAlgorithmiques: { f1: { erreurs: 59, mots: 460, noteCalculee: 23.04, pourcentage: 23.04, retroaction: RETRO_ALGO } } };
    const base = { test_grillesTemplates: [GRILLE], test_echellesTemplates: [ECHELLE], test_cartouches_G_F: [CARTOUCHE], test_pratiquesConfigurables: [], test_evaluationsSauvegardees: [], test_productions: [{ id: 'P1', titre: 'Écrire un récit', activiteApprentissage: 'ACTIVITÉ-P1' }] };
    const copie = { texte: null };
    const reg = chargerScript('js/evaluation-enonces.js');
    chargerScript('js/evaluation-formules.js', {}, reg);
    chargerScript('js/codes-annotation.js', { db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : (d !== undefined ? d : null)) }, cle: (k) => 'test_' + k, obtenirDonneesSelonMode: (k) => JSON.parse(JSON.stringify(base['test_' + k] || [])) }, reg);
    const exportPdf = chargerScript('js/travaux-export-pdf.js', { document }).travauxExportPDF;
    const win = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: ec, majBadgesApresEvaluation() {},
        enoncesAlgo: reg.enoncesAlgo, codesAnnotation: reg.codesAnnotation, formulesAlgo: reg.formulesAlgo };
    const globaux = {
        document, evaluationEnCours: ec,
        db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : (d !== undefined ? d : null)), setSync() {}, get: async () => null, set: async () => {} },
        cle: (k) => 'test_' + k, valeurNumeriqueDuNiveau, echapperHtml: (s) => String(s == null ? '' : s),
        genererIdUnique: (p) => p + 'NEUF',
        obtenirDonneesSelonMode: (k) => k === 'groupeEtudiants' ? [{ da: '1234567', prenom: 'Alice', nom: 'Assidu', groupe: '01' }] : JSON.parse(JSON.stringify(base['test_' + k] || [])),
        sauvegarderDonneesSelonMode: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        niveauDuCodeDansEchelle: (code) => { const i = ['I', 'D', 'M', 'E'].indexOf(code); return i === -1 ? null : { code, nom: ECHELLE.niveaux[i].nom, rang: i + 1 }; },
        zoneDuNiveau: (code) => ({ I: 'priorite', D: 'signale', M: 'acquis', E: 'acquis' })[code] || null,
        echellesComparables: () => true, niveauxOrdonnesDeLEchelle: () => ECHELLE.niveaux,
        obtenirPreference: () => null, obtenirCoursActifId: () => null, estModeeLectureSeule: () => false,
        obtenirConfigJetons: () => ({ actif: true, reprise: { nombre: 2 } }), verifierDisponibiliteJeton: () => true, compterJetonsUtilises: () => 0,
        copierEnFormatTSV() {}, setTimeout: () => 0, clearTimeout() {}, alert() {},
        pluriel: (n, s, p) => (n > 1 ? p : s),
        navigator: { clipboard: { writeText: (t) => { copie.texte = t; return Promise.resolve(); } } },
        travauxVisionneuse: { getFichierActuel: () => FICHIER },
        travauxStockage: { obtenirAnnotationFichier: () => JSON.parse(JSON.stringify(ANNOTATION)), obtenirFichierParId: () => FICHIER },
        // #760 — le vrai lecteur des tampons, sur des réglages vides.
        travauxOutils: chargerTravauxOutilsReel().travauxOutils,
        travauxExportPDF: exportPdf,
        calculerNote: (...a) => win.calculerNote(...a), genererRetroaction: (...a) => win.genererRetroaction(...a)
    };
    chargerScript('js/evaluation-calcul.js', globaux, win);
    chargerScript('js/evaluation-retroaction.js', globaux, win);
    win.calculerNote();
    win.genererRetroaction(1);
    win.copierToutRetroaction();
    return { ecran, copie };
}

describe('#764 · « Copier tout » livre un texte complet', () => {

    it('la grille de Grégoire (un critère algorithmique, SANS cartouche) : la générale existe, avec la rétroaction du critère, le décompte des codes et la note', () => {
        const { ecran, copie } = monter({ avecCartouche: false });
        expect(ecran.noteProduction1.textContent).toBe('23.0 %');
        expect(copie.texte, 'avant : la générale était vide (la zone montrait son texte d\'attente) et le collage commençait à « SPÉCIFIQUE »').toContain('=== RÉTROACTION GÉNÉRALE ===');
        expect(copie.texte).toContain('Critère 1 (Français écrit) — I');
        expect(copie.texte).toContain(RETRO_ALGO);
        expect(copie.texte).toContain('--- Langue ---');
        expect(copie.texte).toContain('Code 10 – Orthographe d\'usage ou éléments de typographie (×23) :');
        expect(copie.texte).toContain('Note finale : 23.0 %  |  Niveau : I');
        // Sans cartouche, aucun contexte de cartouche, et pas de « [Non défini] » à la place d'un commentaire.
        expect(copie.texte).not.toContain('CONTEXTE-CARTOUCHE');
        expect(copie.texte).not.toContain('[Non défini]');
    });

    it('la spécifique porte le texte ENTIER de chaque code (avant : coupé à 120 caractères)', () => {
        const { ecran } = monter({ avecCartouche: false });
        const specifique = ecran.contenuRetroSpecifique.textContent;
        expect(specifique).toContain(TEXTE_10);
        expect(specifique).toContain(TEXTE_4);
        expect(specifique).not.toContain('minuscule, sou' + 'Groupe');   // la coupure de son exemple
    });

    it('AVEC une cartouche, la générale garde son contexte et sa forme (non-régression)', () => {
        const { copie } = monter({ avecCartouche: true });
        expect(copie.texte).toContain('=== RÉTROACTION GÉNÉRALE ===');
        expect(copie.texte).toContain('CONTEXTE-CARTOUCHE');
        expect(copie.texte).toContain(RETRO_ALGO);
        expect(copie.texte).toContain('Note finale : 23.0 %  |  Niveau : I');
    });
});
