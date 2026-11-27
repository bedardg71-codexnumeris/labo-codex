// =======================================================================
// « RECEVOIR LES PRODUCTIONS », « NOUS FAISONS », ÉTAPE « TA RÉTROACTION » : LE VERROU DÉJÀ POSÉ
// =======================================================================
// Vécu par Grégoire le 22 nov. 2026 (aperçu n° 53), bloquant : l'étape n'avançait pas quand l'évaluation ouverte était
// déjà verrouillée. La bulle disait de toucher le cadenas « Verrouiller », le bouton disait « Déverrouiller », le halo
// était dessus. L'étape attendait une évaluation verrouillée absente de `verrousAvant` (le repère de « Commencer ») :
// une évaluation déjà verrouillée ne pouvait jamais la satisfaire, même déverrouillée puis reverrouillée (son identifiant
// ne change pas). Tranché par Cowork : une évaluation ouverte déjà verrouillée fait l'étape (on compte ce verrou), sans
// mot nouveau.
// Ce banc juge les deux voies (avec un fichier ouvert ; sans fichier) hors du navigateur. Break-test (27 nov. 2026) :
// voir le rapport du lot (plans de travail/RAPPORT-2026-11-27-parcours.md).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE = readFileSync(path.join(racine, 'js/parcours-recevoir.js'), 'utf8');

const DA = '1000001';        // Loutre Enjouée (fictive)
const AUTRE_DA = '1000002';  // Tapir Doux (fictif)
const PROD = 'PROD_1';

/**
 * Le parcours chargé, sa voie et son repère posés. `evaluations` : celles du cours actif ; `ouverte` : ce que le
 * formulaire d'évaluation montre (`etatVivantEvaluationEnCours`) ; `fichier` : la production ouverte dans l'annotation.
 */
function monter({ voie, verrousAvant, evaluations, ouverte, fichier }) {
    const prefs = { parcoursRecevoir: { voie, verrousAvant, fichiersAvant: [] } };
    const fenetre = {
        innerWidth: 1180,
        Assistance: { enregistrer() {}, etatDe: () => ({ etat: 'en-cours' }), definirEtat() {} },
        ParcoursMoteur: { visible: () => false, etapeCourante: () => null, actif: () => false },
        etatVivantEvaluationEnCours: () => (ouverte ? Object.assign({ criteres: {}, pointsAnalytiques: {} }, ouverte) : null),
        travauxVisionneuse: { getFichierActuel: () => fichier || null },
        addEventListener() {}
    };
    const page = {
        getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
        body: { classList: { toggle() {} } }, addEventListener() {}
    };
    const globaux = {
        obtenirPreference: (k) => JSON.parse(JSON.stringify(prefs[k])),
        definirPreference: (k, v) => { prefs[k] = v; },
        estEnModeDemo: () => false,
        obtenirDonneesSelonMode: (n) => (n === 'evaluationsSauvegardees' ? JSON.parse(JSON.stringify(evaluations)) : [])
    };
    const noms = Object.keys(globaux);
    new Function('window', 'document', ...noms, SOURCE)(fenetre, page, ...noms.map((n) => globaux[n]));
    const V = fenetre.ParcoursRecevoir.voies();
    return { etape7: voie === 'sans-fichier' ? V['sans-fichier'][1] : V.fichiers[6] };
}

const verrouillee = (id, da, extra) => Object.assign({ id, etudiantDA: da, productionId: PROD, verrouillee: true }, extra || {});

describe('« Ta rétroaction » : une évaluation ouverte déjà verrouillée fait l’étape', () => {
    it('sans fichier : l’évaluation ouverte était verrouillée à « Commencer » (le cas vécu le 22 nov.)', () => {
        const { etape7 } = monter({
            voie: 'sans-fichier', verrousAvant: ['EV_1'], evaluations: [verrouillee('EV_1', DA)],
            ouverte: { etudiantDA: DA, productionId: PROD, idModification: 'EV_1' }
        });
        expect(etape7.titre).toBe('Ta rétroaction');
        expect(etape7.atteint()).toBe(true);
    });

    it('avec un fichier : l’évaluation de la production ouverte, déjà verrouillée', () => {
        const { etape7 } = monter({
            voie: 'fichiers', verrousAvant: ['EV_1'], evaluations: [verrouillee('EV_1', DA)],
            ouverte: { etudiantDA: DA, productionId: PROD, idModification: 'EV_1' },
            fichier: { id: 'F_1', etudiantDA: DA, productionId: PROD }
        });
        expect(etape7.titre).toBe('Ta rétroaction');
        expect(etape7.atteint()).toBe(true);
    });

    it('sans identifiant retenu par le formulaire : l’évaluation de l’étudiant·e et de la production qu’il montre', () => {
        const { etape7 } = monter({
            voie: 'sans-fichier', verrousAvant: ['EV_1'], evaluations: [verrouillee('EV_1', DA)],
            ouverte: { etudiantDA: DA, productionId: PROD }
        });
        expect(etape7.atteint()).toBe(true);
    });
});

describe('« Ta rétroaction » : ce qui ne fait pas l’étape', () => {
    it('l’évaluation ouverte n’est pas verrouillée ; une autre l’est, d’avant « Commencer »', () => {
        const { etape7 } = monter({
            voie: 'sans-fichier', verrousAvant: ['EV_2'],
            evaluations: [{ id: 'EV_1', etudiantDA: DA, productionId: PROD, verrouillee: false }, verrouillee('EV_2', AUTRE_DA)],
            ouverte: { etudiantDA: DA, productionId: PROD, idModification: 'EV_1' }
        });
        expect(etape7.atteint()).toBe(false);
    });

    it('avec un fichier : le formulaire montre encore l’évaluation verrouillée d’une autre copie que celle ouverte', () => {
        const { etape7 } = monter({
            voie: 'fichiers', verrousAvant: ['EV_2'], evaluations: [verrouillee('EV_2', AUTRE_DA)],
            ouverte: { etudiantDA: AUTRE_DA, productionId: PROD, idModification: 'EV_2' },
            fichier: { id: 'F_1', etudiantDA: DA, productionId: PROD }
        });
        expect(etape7.atteint()).toBe(false);
    });

    it('l’identifiant retenu par le formulaire ne désigne pas l’évaluation verrouillée de cet·te étudiant·e', () => {
        const { etape7 } = monter({
            voie: 'sans-fichier', verrousAvant: ['EV_1'], evaluations: [verrouillee('EV_1', DA)],
            ouverte: { etudiantDA: DA, productionId: PROD, idModification: 'EV_NEUVE' }
        });
        expect(etape7.atteint()).toBe(false);
    });

    it('sans identifiant retenu : ni l’évaluation verrouillée d’un·e autre étudiant·e, ni celle d’une autre production', () => {
        const ouverte = { etudiantDA: DA, productionId: PROD };
        const autreEleve = monter({ voie: 'sans-fichier', verrousAvant: ['EV_2'], evaluations: [verrouillee('EV_2', AUTRE_DA)], ouverte });
        expect(autreEleve.etape7.atteint()).toBe(false);
        const autreProduction = monter({ voie: 'sans-fichier', verrousAvant: ['EV_3'], evaluations: [verrouillee('EV_3', DA, { productionId: 'PROD_2' })], ouverte });
        expect(autreProduction.etape7.atteint()).toBe(false);
    });

    it('une évaluation remplacée (une reprise l’a remplacée) ne compte pas', () => {
        const { etape7 } = monter({
            voie: 'sans-fichier', verrousAvant: ['EV_1'], evaluations: [verrouillee('EV_1', DA, { remplaceeParId: 'EV_9' })],
            ouverte: { etudiantDA: DA, productionId: PROD, idModification: 'EV_1' }
        });
        expect(etape7.atteint()).toBe(false);
    });
});

describe('« Ta rétroaction » : la règle d’avant tient toujours', () => {
    it('un verrou neuf (absent du repère de « Commencer ») fait l’étape, quelle que soit l’évaluation ouverte', () => {
        const { etape7 } = monter({
            voie: 'sans-fichier', verrousAvant: [], evaluations: [verrouillee('EV_1', AUTRE_DA)],
            ouverte: { etudiantDA: DA, productionId: PROD }
        });
        expect(etape7.atteint()).toBe(true);
    });
});
