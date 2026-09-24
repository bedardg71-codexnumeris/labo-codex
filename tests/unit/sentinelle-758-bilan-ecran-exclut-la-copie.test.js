import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #758 — LE BILAN DE L'ÉCRAN N'EST PLUS SA PROPRE « PRÉCÉDENTE ».
//
// Mesuré le 6 septembre 2026 au matin (Rapports/MESURE-ce-que-l-eleve-lit-dans-le-pdf-2026-09-06.md,
// constat C2) : `_chargerHistoriqueBilan` (evaluation-retroaction.js) lisait toutes les évaluations de
// l'élève SANS exclure la copie en cours. Dès que l'auto-save l'a mise en base (1,5 s après le premier
// geste), la copie devenait son propre artefact « précédent » : « Cet objectif est prioritaire depuis
// 3 productions » avec UN seul artefact antérieur, et plus jamais « Progrès : I → D » ni « Tu as
// progressé en … ». Le PDF de synthèse, lui, exclut la copie (`lireHistorique`,
// synthese-retroaction-data.js : `e.id !== evaluation.id`) et disait le vrai.
//
// ⮕ Décision de Grégoire (6 sept., matin) : aligner le bilan de l'écran sur la lecture que le PDF fait
// déjà de l'historique. La garde du PDF est privée à son module ; l'écran possède déjà le résolveur de
// « la copie en base » (#576, `_chargerEvaluationEnregistreeBilan` : par `idModification`, sinon par
// élève + production, hors reprises remplacées). Le lecteur d'historique reçoit cette copie et lui
// applique le MÊME prédicat que le PDF — une seule règle, pas une seconde implémentation.
//
// Harnais : le patron de la sentinelle #555 (lecteurs d'échelle RÉELS de profil-etudiant-calculs.js).
// `copierToutRetroaction` copie le `textContent` de ce bilan dans ce qui est remis à l'élève.

const ECHELLE = { id: 'E1', nom: 'IDME', seuilSuffisance: 'D', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
    { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
] };
const GRILLE = { id: 'G1', criteres: [
    { id: 'c1', nom: 'Structure', description: '' },
    { id: 'c2', nom: 'Rigueur', description: '' },
    { id: 'c3', nom: 'Nuance', description: '' }
] };
const DA = '1234567';
const evaluation = (id, productionId, productionNom, date, niveaux, niveauFinal, extra) => Object.assign({
    id, etudiantDA: DA, productionId, productionNom, grilleId: 'G1', echelleId: 'E1', dateEvaluation: date,
    criteres: Object.keys(niveaux).map(cid => ({ critereId: cid, critereNom: GRILLE.criteres.find(c => c.id === cid).nom, niveauSelectionne: niveaux[cid] })),
    noteFinale: 60, niveauFinal
}, extra || {});

// L'artefact antérieur : I / I / D, niveau I.
const ANTERIEURE = evaluation('EV_P1', 'P1', 'Analyse 1', '2026-09-16T12:00:00.000Z', { c1: 'I', c2: 'I', c3: 'D' }, 'I');
// Un second artefact antérieur, plus ancien encore, Rigueur toujours I.
const ANTERIEURE_2 = evaluation('EV_P0', 'P0', 'Analyse 0', '2026-09-02T12:00:00.000Z', { c1: 'D', c2: 'I', c3: 'D' }, 'I');
// La copie en cours (P2), telle que l'auto-save l'a écrite : D / I / M, niveau D.
const COPIE_EN_BASE = evaluation('EV_P2', 'P2', 'Analyse 2', '2026-10-02T12:00:00.000Z', { c1: 'D', c2: 'I', c3: 'M' }, 'D');

function elements() {
    const boite = () => ({ innerHTML: '', classList: { add() {}, remove() {}, toggle() {} } });
    return { contenuRetroBilan: boite(), contenuRetroSpecifique: boite(), vueRetroGenerale: boite(), vueRetroSpecifique: boite(), vueRetroBilan: boite(),
        niveauProduction1: { textContent: 'D' } };
}
function chargerCalculs() {
    return chargerScript('js/profil-etudiant-calculs.js', {
        db: { getSync: (k, d) => (String(k).indexOf('echellesTemplates') !== -1 ? [ECHELLE] : (d !== undefined ? d : null)), get: async () => null, set: async () => {}, setSync() {} },
        cle: (k) => 'test_' + k, obtenirDonneesSelonMode: () => [], obtenirPreference: () => null, obtenirSeuil: () => null,
        obtenirPratiqueParId: () => null, obtenirTypePratiqueActive: () => 'standards'
    });
}
/** Le bilan de l'écran pour une copie dont les niveaux VIVANTS sont ceux de COPIE_EN_BASE. */
function bilan({ enBase, idModification }) {
    const calculs = chargerCalculs();
    const els = elements();
    const wEnonces = chargerScript('js/evaluation-enonces.js');
    // #940 — le bilan lit sa règle (ligne d'un critère, récurrences, historique) dans le vrai module.
    chargerScript('js/synthese-retroaction-data.js', {}, wEnonces);
    const w = chargerScript('js/evaluation-retroaction.js', {
        document: { addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
            getElementById: (id) => els[id] || null, createElement: () => ({ setAttribute() {}, appendChild() {}, style: {}, classList: { add() {}, remove() {} } }),
            body: { addEventListener() {}, appendChild() {}, setAttribute() {}, getAttribute: () => null, style: {}, classList: { add() {}, remove() {} } },
            documentElement: { addEventListener() {} } },
        db: { getSync: (k, d) => (String(k).indexOf('echellesTemplates') !== -1 ? [ECHELLE] : String(k).indexOf('grillesTemplates') !== -1 ? [GRILLE] : (d !== undefined ? d : null)),
            get: async () => null, set: async () => {}, setSync() {} },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: (quoi) => (quoi === 'evaluationsSauvegardees' ? JSON.parse(JSON.stringify(enBase)) : []),
        echapperHtml: (t) => (t == null ? '' : String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')),
        niveauxOrdonnesDeLEchelle: calculs.niveauxOrdonnesDeLEchelle, niveauDuCodeDansEchelle: calculs.niveauDuCodeDansEchelle,
        zoneDuNiveau: calculs.zoneDuNiveau, echellesComparables: calculs.echellesComparables, obtenirEchelleResolue: calculs.obtenirEchelleResolue
    }, wEnonces);
    w.evaluationEnCours = { etudiantDA: DA, productionId: 'P2', grilleId: 'G1', echelleId: 'E1', idModification, criteres: { c1: 'D', c2: 'I', c3: 'M' } };
    w.basculerVueRetroaction('bilan');
    return els.contenuRetroBilan.innerHTML;
}

describe('#758 · le bilan de l\'écran lit l\'historique comme le PDF : la copie en cours n\'en fait pas partie', () => {

    it('copie ENREGISTRÉE (idModification posé, copie en base) + un artefact antérieur : le progrès est dit, pas « depuis 3 productions »', () => {
        const html = bilan({ enBase: [COPIE_EN_BASE, ANTERIEURE], idModification: 'EV_P2' });
        expect(html).not.toContain('depuis 3 productions');
        expect(html).toContain('Progrès : I → D depuis Analyse 1');
        expect(html).toContain('Tu as progressé en Nuance.');
        expect(html).toContain('En Structure, tu as fait de beaux progrès');
    });

    it('copie AUTO-ENREGISTRÉE sans idModification (même élève, même production, en base) : même lecture', () => {
        // Le résolveur #576 retrouve la copie par élève + production quand l'identifiant n'est pas encore posé.
        const html = bilan({ enBase: [COPIE_EN_BASE, ANTERIEURE], idModification: undefined });
        expect(html).not.toContain('depuis 3 productions');
        expect(html).toContain('Progrès : I → D depuis Analyse 1');
    });

    it('copie FRAÎCHE (pas encore en base) : inchangé, le progrès est dit', () => {
        const html = bilan({ enBase: [ANTERIEURE], idModification: undefined });
        expect(html).not.toContain('depuis 3 productions');
        expect(html).toContain('Progrès : I → D depuis Analyse 1');
    });

    it('DEUX artefacts antérieurs où Rigueur est déjà prioritaire : « depuis 3 productions » se dit encore (l\'exclusion ne retire que la copie)', () => {
        const html = bilan({ enBase: [COPIE_EN_BASE, ANTERIEURE, ANTERIEURE_2], idModification: 'EV_P2' });
        expect(html).toContain('Rigueur');
        expect(html).toContain('depuis 3 productions');
        expect(html).toContain('Progrès : I → D depuis Analyse 1');
    });

    it('une reprise remplacée de la copie reste hors de l\'historique (comme avant)', () => {
        const remplacee = evaluation('EV_P2_v1', 'P2', 'Analyse 2', '2026-09-30T12:00:00.000Z', { c1: 'I', c2: 'I', c3: 'I' }, 'I', { remplaceeParId: 'EV_P2' });
        const html = bilan({ enBase: [COPIE_EN_BASE, remplacee, ANTERIEURE], idModification: 'EV_P2' });
        expect(html).toContain('Progrès : I → D depuis Analyse 1');
        expect(html).not.toContain('depuis Analyse 2');
    });
});
