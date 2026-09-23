import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';   // lot A (16 sept. 2026) : les deux prédicats réels du registre

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
    return chargerPredicatsCopie(chargerScript('js/profil-etudiant-calculs.js', {
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
    }));
}

// Lot A (#718, 16 sept. 2026) : une copie compte quand elle est ENREGISTRÉE (noteFinale posée), texte ou pas.
const evalDe = (echelleId) => ({
    etudiantDA: '1234567', noteFinale: 70, retroactionFinale: 'texte', echelleId, criteres: []
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
        expect(r.message, 'la divergence qui bloque est celle de deux échelles PRÉSENTES')
            .toContain('présentes');
    });

    it('A3. aucune évaluation : rien à situer, et c\'est dit', () => {
        const r = winCalculs.obtenirEchelleCommuneDesEvaluations('1234567');
        expect(r.echelle).toBeNull();
        expect(r.raison).toBe('aucune-evaluation');
    });

    it('A4. TOUTES les échelles introuvables : la cause est distincte de la divergence', () => {
        evaluationsEnBase = [evalDe('ECH_DISPARUE')];
        const r = winCalculs.obtenirEchelleCommuneDesEvaluations('1234567');
        expect(r.echelle).toBeNull();
        expect(r.raison).toBe('echelle-non-resolue');
        expect(r.message).toContain('trouvable');
    });

    it('A4bis. ⚠ LE CAS RÉEL — une échelle disparue parmi neuf bonnes ne bloque PAS le niveau', () => {
        // Trouvé le 27 août par la porte terrain, sur les données de Grégoire, et
        // NON par une fixture : un élève avec 10 évaluations, dont 1 désignant une
        // échelle disparue du trimestre. La première version comptait les
        // IDENTIFIANTS distincts, trouvait « 2 », concluait « divergentes », et le
        // niveau ne s'affichait plus du tout.
        //
        // ⮕ Or cette 10e évaluation est DÉJÀ écartée du calcul : la performance
        // globale est calculée sur les 9 autres, et l'écran l'annonce
        // (« Dépistage incomplet »). Refuser de situer une moyenne à cause d'une
        // donnée qui n'entre pas dans cette moyenne était incohérent.
        evaluationsEnBase = [];
        for (let i = 0; i < 9; i++) evaluationsEnBase.push(evalDe('ECH_A'));
        evaluationsEnBase.push(evalDe('ECH_DISPARUE'));

        const r = winCalculs.obtenirEchelleCommuneDesEvaluations('1234567');
        expect(r.raison, 'une échelle absente n\'est pas une échelle concurrente').toBeNull();
        expect(r.echelle).not.toBeNull();
        expect(r.echelle.id).toBe('ECH_A');
    });

    it('A4ter. deux ids qui pointent vers la MÊME échelle ne sont pas une divergence', () => {
        // Après un import, une échelle porte un id neuf et garde son `idOriginal`.
        // Des évaluations d'avant et d'après désignent donc deux ids pour un seul
        // objet. La comparaison porte sur l'échelle RÉSOLUE, pas sur l'id désigné.
        echellesEnBase = [{ ...ECHELLE_A, id: 'ECH_NEUF', idOriginal: 'ECH_ANCIEN' }];
        evaluationsEnBase = [evalDe('ECH_NEUF'), evalDe('ECH_ANCIEN')];
        const r = winCalculs.obtenirEchelleCommuneDesEvaluations('1234567');
        expect(r.raison).toBeNull();
        expect(r.echelle.id).toBe('ECH_NEUF');
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

    it('B4. ↻ LOT N7 — la sommative et PAN-Standards du registre NE répondent PLUS : la règle vit dans `lireEchelleNoteGlobale`', () => {
        // Avant N7 (23 sept. 2026), chaque instance du registre portait sa réponse, et PAN-Standards
        // déléguait à `obtenirEchelleCommuneDesEvaluations`. La seule raison d'appeler ces instances
        // était `obtenirPratiqueActuelle`, retirée : la famille de la pratique assignée route, à UN
        // endroit (`profil-etudiant-helpers.js`). Une méthode qui reviendrait ici serait une seconde
        // règle, que rien n'appelle — et qui divergerait au premier changement (#529).
        const fs = require('node:fs');
        const path = require('node:path');
        const racine = path.resolve(__dirname, '..', '..');
        for (const f of ['js/pratiques/pratique-sommative.js', 'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js']) {
            expect(fs.readFileSync(path.join(racine, f), 'utf-8'), f).not.toContain('obtenirEchelleNoteGlobale(');
        }
    });

    it('B5. ↻ LOT N7 — une CONFIGURABLE de type Standards ne lit JAMAIS son niveau dans `config.echelle` (décision de Grégoire, 22 sept.)', () => {
        // La VRAIE normalisation des ids (le registre, chargé dans un bac jetable) : « pan-standards »
        // est une Standards, et la garde doit le savoir sans recopier la table.
        const registre = chargerScript('js/pratiques/pratique-registre.js', {}, {});
        const w = chargerScript('js/pratiques/pratique-configurable.js', { ...stubsPratique, normaliserIdPratique: registre.normaliserIdPratique });
        for (const type of ['standards', 'pan-standards']) {
            const p = new w.PratiqueConfigurable({
                id: 'prat-std', nom: 'STD', type,
                calcul_note: { methode: 'conversion_niveaux' },
                echelle: { type: 'niveaux', niveaux: ECHELLE_A.niveaux }
            });
            const r = p.obtenirEchelleNoteGlobale('1234567');
            expect(r.echelle, type).toBeNull();
            expect(r.raison, type).toBe('echelle-des-evaluations');
        }
    });
});
