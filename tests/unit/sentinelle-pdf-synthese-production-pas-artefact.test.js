import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE (21 sept. 2026) — LE PDF DE SYNTHÈSE REMIS À L'ÉLÈVE NE DIT PLUS
// « ARTEFACT ».
//
// « Artefact » est le mot du cours de Grégoire ; tout texte qui sort de son
// cours dit « production ». Trois chaînes du rendu le portaient encore en dur :
// l'en-tête (« artefact 2 de 5 »), le titre de la rangée de note (« Voici les
// 4 meilleurs artefacts que tu as produits ») et la liste « Artefacts à venir ».
// Mots validés par Grégoire le 21 sept. 2026.
//
// ⚠ LA SYNTHÈSE EST JOUÉE, pas lue : `construireFeedback` puis
// `rendreSyntheseHTML`, et c'est le texte que l'élève LIT qui est mesuré
// (balises et commentaires partis, entités rendues).
//
// ⚠ UNE SEULE RETENUE est un chemin réel : hors hybride, `nombreSelection` est
// la longueur de la sélection, et un élève à sa première évaluation n'a qu'une
// production retenue. « Voici les 1 meilleures productions » ne se lit pas ;
// « Voici ta meilleure production » non plus (rien n'est comparé) : Grégoire a
// tranché « Voici la production retenue » le 21 sept. 2026.

const IDME = {
    id: 'ECH_IDME', nom: 'IDME', seuilSuffisance: 'D', seuilMaitrise: 'M',
    niveaux: [
        { code: 'I', nom: 'Insuffisant',   min: 0,  max: 59,  valeurCalcul: 40 },
        { code: 'D', nom: 'Développement', min: 60, max: 74,  valeurCalcul: 67 },
        { code: 'M', nom: 'Maîtrisé',      min: 75, max: 84,  valeurCalcul: 80 },
        { code: 'E', nom: 'Étendu',        min: 85, max: 100, valeurCalcul: 95 }
    ]
};

// La règle d'échappement de `config.js`, apostrophe comprise (#572).
const echapper = (t) => (t == null ? '' : String(t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;'));

// Ce que l'élève LIT : commentaires et balises partis (donc les attributs
// aussi), entités rendues.
const texteLu = (html) => String(html)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');

// Cinq productions du portfolio ; l'élève est évalué sur la deuxième.
const PRODUCTIONS = [1, 2, 3, 4, 5].map((n) => ({
    id: 'P' + n, numero: n, titre: 'Labo ' + n, type: 'artefact-portfolio', categorie: 'selection'
}));

/** La vraie synthèse : données, puis HTML du PDF. `retenus` = ids des productions retenues. */
function synthese(retenus) {
    const calculs = chargerScript('js/profil-etudiant-calculs.js', {
        db: {
            getSync: (k, d) => (String(k).indexOf('echellesTemplates') !== -1 ? [IDME] : (d !== undefined ? d : null)),
            get: async () => null, set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null, obtenirSeuil: () => null,
        obtenirPratiqueParId: () => null, obtenirTypePratiqueActive: () => 'standards'
    });
    const critere = (nom, code) => ({ critereId: 'c_' + nom, critereNom: nom, niveauSelectionne: code, ponderation: 50 });
    const evaluationDe = (id) => ({
        id: 'EV_' + id, etudiantDA: '111', grilleId: 'G1', echelleId: IDME.id, productionId: id,
        dateEvaluation: '2026-04-0' + id.slice(1), productionNom: 'Labo ' + id.slice(1),
        niveauFinal: 'M', noteFinale: 80,
        criteres: [critere('Démarche', 'M'), critere('Calculs', 'M')]
    });
    const evaluations = retenus.map(evaluationDe);
    const data = chargerScript('js/synthese-retroaction-data.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null), get: async () => null, set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: (k) => (k === 'evaluationsSauvegardees' ? evaluations
            : k === 'productions' ? PRODUCTIONS : []),
        obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }),
        obtenirEtudiantsCoursActif: () => [],
        obtenirGroupesCours: () => [],
        travauxStockage: { obtenirAnnotationFichier: () => null },
        travauxOutils: { AUTOCOLLANTS: [] },
        obtenirPreference: () => null,
        obtenirEchelleResolue: calculs.obtenirEchelleResolue,
        niveauDuCodeDansEchelle: calculs.niveauDuCodeDansEchelle,
        niveauxOrdonnesDeLEchelle: calculs.niveauxOrdonnesDeLEchelle,
        echellesComparables: calculs.echellesComparables,
        zoneDuNiveau: calculs.zoneDuNiveau,
        // Hors hybride : toutes les retenues vont dans la sélection.
        obtenirConfigPratiqueActive: () => ({ configuration: {} }),
        calculerDetailsNoteFinale: () => ({
            portfolio: {
                methodeSelection: 'meilleurs', moyenne: 80, nombreEvalues: retenus.length,
                artefactsRetenus: retenus.map((id, i) => ({ productionId: id, niveau: 'M', note: 80 - i }))
            }
        })
    }).syntheseRetroactionData;
    const rendu = chargerScript('js/synthese-retroaction-rendu.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null) },
        cle: (k) => 'test_' + k,
        echapperHtml: echapper
    }).syntheseRetroactionRendu;
    const feedback = data.construireFeedback(evaluationDe('P2'), { id: 'F1' }, null);
    return { feedback, html: rendu.rendreSyntheseHTML(feedback), lu: texteLu(rendu.rendreSyntheseHTML(feedback)) };
}

describe('PDF de synthèse · « production », plus « artefact », dans ce que l\'élève lit', () => {

    it('le montage mesure quelque chose : rangée de note hors hybride, quatre retenues, une à venir', () => {
        const { feedback } = synthese(['P1', 'P2', 'P3', 'P4']);
        const note = feedback.bilan.note;
        expect(note, 'rangée de note absente : le montage ne mesure rien').toBeTruthy();
        expect(note.estHybride).toBe(false);
        expect(note.nombreSelection).toBe(4);
        expect(note.avenir.map((a) => a.titre)).toEqual(['Labo 5']);
        expect(feedback.artefact.number).toBe(2);
        expect(feedback.artefact.total).toBe(5);
    });

    it('en-tête : « production 2 de 5 »', () => {
        const { lu } = synthese(['P1', 'P2', 'P3', 'P4']);
        expect(lu).toContain('production 2 de 5');
    });

    it('rangée de note : « Voici les 4 meilleures productions que tu as réalisées », au féminin', () => {
        const { lu } = synthese(['P1', 'P2', 'P3', 'P4']);
        expect(lu).toContain('Voici les 4 meilleures productions que tu as réalisées :');
        expect(lu).not.toContain('meilleurs ');
    });

    it('liste à venir : « Productions à venir : »', () => {
        const { lu } = synthese(['P1', 'P2', 'P3', 'P4']);
        expect(lu).toContain('Productions à venir : Labo 5');
    });

    it('une seule retenue : « Voici la production retenue », jamais « les 1 » ni « meilleure »', () => {
        const { feedback, lu } = synthese(['P2']);
        expect(feedback.bilan.note.nombreSelection).toBe(1);
        expect(lu).toContain('Voici la production retenue :');
        expect(lu).not.toContain('meilleure');
        expect(lu).not.toContain('les 1 ');
        expect(lu).not.toContain('meilleures productions');
    });

    it('aucun « artefact » dans le texte visible, à quatre retenues comme à une seule', () => {
        [['P1', 'P2', 'P3', 'P4'], ['P2']].forEach((retenus) => {
            const { html, lu } = synthese(retenus);
            expect(lu.length, 'rendu vide : la comparaison ne mesure rien').toBeGreaterThan(200);
            expect(lu).not.toMatch(/artefact/i);
            // Le HTML brut non plus n'en porte pas hors des balises.
            expect(html.replace(/<[^>]+>/g, ' ')).not.toMatch(/artefact/i);
        });
    });
});
