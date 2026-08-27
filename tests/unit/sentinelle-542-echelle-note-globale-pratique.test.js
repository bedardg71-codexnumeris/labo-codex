import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #542 lot 3, pas 3b — C'EST LA PRATIQUE QUI DIT DANS QUOI SA NOTE
// GLOBALE SE LIT. LE DÉPISTAGE NE LE DÉDUIT PLUS.
//
// LA CORRECTION DE GRÉGOIRE, 27 août 2026, ET CE QU'ELLE DÉPLACE.
//
// La question posée était « quelle échelle situe la performance globale, quand
// les évaluations peuvent en désigner plusieurs ? ». Elle était posée à
// l'envers : « c'est la pratique de notation qui établit la note globale de
// l'élève. Elle peut être la pratique sommative traditionnelle, comme elle peut
// être alternative. »
//
// ⮕ Le point de décision n'est donc pas dans les évaluations, il est dans la
// PRATIQUE. Et les trois répondent différemment, pour de bonnes raisons :
//
//   · SOMMATIVE — moyenne pondérée de `noteFinale` : un POURCENTAGE. Aucune
//     échelle, et ce n'est pas un manque. Un 87 % n'« est » pas un niveau.
//   · PAN-STANDARDS — moyenne de niveaux convertis par l'échelle de CHAQUE
//     évaluation : c'est cette même échelle qui relit la moyenne.
//   · CONFIGURABLE — porte son échelle en propre… quand elle travaille par
//     niveaux. Sinon, elle répond comme la sommative.
//
// ⚠ CE QUE ÇA CORRIGE À L'ÉCRAN. Le dépistage écrivait `pct >= 85 ? 'E' : …` en
// dur et affichait un niveau IDME pour TOUT LE MONDE, sommative comprise. Il
// faisait dire à une note chiffrée ce que la pratique ne prétend pas dire.

// ─────────────────────────────────────────────────────────────────────────────
// A · Le helper partagé — l'échelle commune des évaluations
// ─────────────────────────────────────────────────────────────────────────────

let winCalculs;
let echellesEnBase = [];
let evaluationsEnBase = [];

const ECHELLE_A = {
    id: 'ECH_A', nom: 'Échelle A',
    niveaux: [
        { code: 'P', nom: 'Partiel', min: 0, max: 59, valeurCalcul: 40, niveauSOLO: 'unistructurel' },
        { code: 'R', nom: 'Réussi', min: 60, max: 100, valeurCalcul: 80, niveauSOLO: 'relationnel' }
    ]
};
const ECHELLE_B = { ...ECHELLE_A, id: 'ECH_B', nom: 'Échelle B' };

function chargerCalculs() {
    return chargerScript('js/profil-etudiant-calculs.js', {
        db: {
            get: async () => null,
            getSync: (k, d) => (k === 'test_echellesTemplates' ? echellesEnBase : (d !== undefined ? d : null)),
            set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (quoi) => (quoi === 'evaluationsSauvegardees' ? evaluationsEnBase : []),
        obtenirPreference: () => null,
        obtenirEtudiantsCoursActif: () => [],
        afficherNotificationCopiee: () => {}, afficherSection: () => {}, afficherSousSection: () => {},
        calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0, M: 0, E: 0 }),
        obtenirSeuil: () => 0.70, chargerSeuilsInterpretation: () => ({}),
        estEtudiantExclu: () => false, filtrerEtudiantsParMode: (a) => a,
        estModeeLectureSeule: () => false, genererSeancesCompletes: () => {},
        calculerEtSauvegarderIndicesAssiduite: () => {}, calculerEtStockerIndicesCP: () => {}
    });
}

const evalDe = (echelleId) => ({
    etudiantDA: '1234567', retroactionFinale: 'texte', echelleId, criteres: []
});

beforeEach(() => {
    echellesEnBase = [ECHELLE_A, ECHELLE_B];
    evaluationsEnBase = [];
    winCalculs = chargerCalculs();
});

describe('#542 lot 3 pas 3b · A — obtenirEchelleCommuneDesEvaluations', () => {

    it('A1. une seule échelle en jeu : elle est rendue, sans raison', () => {
        evaluationsEnBase = [evalDe('ECH_A'), evalDe('ECH_A')];
        const r = winCalculs.obtenirEchelleCommuneDesEvaluations('1234567');
        expect(r.echelle).not.toBeNull();
        expect(r.echelle.id).toBe('ECH_A');
        expect(r.raison).toBeNull();
    });

    it('A2. DEUX échelles : aucune n\'est choisie, et la cause est nommée', () => {
        // Choisir la « bonne » reviendrait à en écarter une autre en silence.
        evaluationsEnBase = [evalDe('ECH_A'), evalDe('ECH_B')];
        const r = winCalculs.obtenirEchelleCommuneDesEvaluations('1234567');
        expect(r.echelle).toBeNull();
        expect(r.raison).toBe('echelles-divergentes');
        expect(r.message).toContain('2 échelles différentes');
    });

    it('A3. aucune évaluation : rien à situer, et c\'est dit', () => {
        const r = winCalculs.obtenirEchelleCommuneDesEvaluations('1234567');
        expect(r.echelle).toBeNull();
        expect(r.raison).toBe('aucune-evaluation');
    });

    it('A4. échelle désignée mais introuvable : la cause est distincte de la divergence', () => {
        evaluationsEnBase = [evalDe('ECH_DISPARUE')];
        const r = winCalculs.obtenirEchelleCommuneDesEvaluations('1234567');
        expect(r.echelle).toBeNull();
        expect(r.raison).toBe('echelle-non-resolue');
        expect(r.message).toContain('introuvable');
    });

    it('A5. les évaluations REMPLACÉES ne comptent pas — elles portent l\'état d\'avant une reprise', () => {
        evaluationsEnBase = [
            evalDe('ECH_A'),
            { ...evalDe('ECH_B'), remplaceeParId: 'EVAL_NEUVE' }
        ];
        const r = winCalculs.obtenirEchelleCommuneDesEvaluations('1234567');
        expect(r.raison, 'la remplacée ne doit pas créer une fausse divergence').toBeNull();
        expect(r.echelle.id).toBe('ECH_A');
    });

    it('A6. les évaluations d\'un AUTRE élève ne comptent pas', () => {
        evaluationsEnBase = [evalDe('ECH_A'), { ...evalDe('ECH_B'), etudiantDA: '7654321' }];
        const r = winCalculs.obtenirEchelleCommuneDesEvaluations('1234567');
        expect(r.raison).toBeNull();
        expect(r.echelle.id).toBe('ECH_A');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// B · Les trois pratiques répondent, et différemment
// ─────────────────────────────────────────────────────────────────────────────

const stubsPratique = {
    db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
    cle: (k) => 'test_' + k,
    echapperHtml: (s) => String(s == null ? '' : s),
    obtenirDonneesSelonMode: () => [],
    obtenirPreference: () => null,
    obtenirSeuil: () => 0.70,
    chargerSeuilsInterpretation: () => ({}),
    genererIdUnique: (p) => p + '1'
};

describe('#542 lot 3 pas 3b · B — chaque pratique dit dans quoi SA note se lit', () => {

    it('B1. SOMMATIVE : aucune échelle, raison « note-chiffree » — et c\'est la bonne réponse', () => {
        const w = chargerScript('js/pratiques/pratique-sommative.js', stubsPratique);
        const p = new w.PratiqueSommative();
        const r = p.obtenirEchelleNoteGlobale('1234567');
        expect(r.echelle, 'une note pondérée n\'est pas un niveau atteint').toBeNull();
        expect(r.raison).toBe('note-chiffree');
        expect(r.message).toContain('pourcentage');
    });

    it('B2. CONFIGURABLE par niveaux : son échelle embarquée, sans résolution ni ambiguïté', () => {
        const w = chargerScript('js/pratiques/pratique-configurable.js', stubsPratique);
        const p = new w.PratiqueConfigurable({
            id: 'prat1', nom: 'Ma pratique',
            calcul_note: { methode: 'conversion_niveaux' },
            echelle: { type: 'niveaux', niveaux: ECHELLE_A.niveaux }
        });
        const r = p.obtenirEchelleNoteGlobale('1234567');
        expect(r.raison).toBeNull();
        expect(r.echelle.niveaux).toHaveLength(2);
        expect(r.echelle.niveaux[1].niveauSOLO).toBe('relationnel');
    });

    it('B3. CONFIGURABLE qui ne travaille PAS par niveaux : même réponse que la sommative', () => {
        const w = chargerScript('js/pratiques/pratique-configurable.js', stubsPratique);
        const p = new w.PratiqueConfigurable({
            id: 'prat2', nom: 'Pratique chiffrée',
            calcul_note: { methode: 'moyenne_ponderee' }
        });
        const r = p.obtenirEchelleNoteGlobale('1234567');
        expect(r.echelle).toBeNull();
        expect(r.raison).toBe('note-chiffree');
    });

    it('B4bis. PAN-STANDARDS DÉLÈGUE au helper — elle ne réécrit pas la règle chez elle', () => {
        // L'invariant qui compte ici n'est pas « PAN rend une échelle », c'est
        // « PAN emploie LE MÊME chemin que le reste du dépistage ». Une seconde
        // règle écrite dans la pratique divergerait du helper au premier
        // changement — c'est le patron que #529 a défait, et que le pas 3a a
        // évité pour la résolution.
        let appelsRecus = [];
        const w = chargerScript('js/pratiques/pratique-pan-standards.js', {
            ...stubsPratique,
            obtenirEchelleCommuneDesEvaluations: (da) => {
                appelsRecus.push(da);
                return { echelle: ECHELLE_A, raison: null, message: null };
            }
        });
        const p = new w.PratiquePANStandards();
        const r = p.obtenirEchelleNoteGlobale('1234567');

        expect(appelsRecus, 'le helper partagé doit être appelé, avec le DA').toEqual(['1234567']);
        expect(r.echelle.id).toBe('ECH_A');
        expect(r.raison).toBeNull();
    });

    it('B4. LE CONTRAT — les trois pratiques implémentent la méthode', () => {
        // Une pratique qui ne l'implémenterait pas laisserait le dépistage sans
        // niveau global. C'est délibérément sûr, mais ça doit rester un choix,
        // pas un oubli : ce test compte les implémentations.
        const fichiers = [
            'js/pratiques/pratique-sommative.js',
            'js/pratiques/pratique-pan-standards.js',
            'js/pratiques/pratique-configurable.js'
        ];
        const fs = require('node:fs');
        const path = require('node:path');
        const racine = path.resolve(__dirname, '..', '..');
        const sans = fichiers.filter((f) =>
            !fs.readFileSync(path.join(racine, f), 'utf-8').includes('obtenirEchelleNoteGlobale('));
        expect(sans, `pratiques sans échelle de note globale : ${sans.join(', ')}`).toEqual([]);

        // Et le contrat lui-même la documente, sinon la prochaine pratique
        // écrite d'après l'interface l'ignorera.
        const contrat = fs.readFileSync(path.join(racine, 'js/pratiques/pratique-interface.js'), 'utf-8');
        expect(contrat).toContain('obtenirEchelleNoteGlobale(da)');
    });
});
