/**
 * #851 (rapport de Grégoire, 13 sept. 2026, 8 h 47) — « Cours (tous groupes) » dans l'entête
 * n'affichait que le groupe courant.
 *
 * Cause : la vue fusionnée écrit `infoCours._modeCours = true` et laisse le dernier groupe-cours
 * marqué `actif`. La correction #130 d'`obtenirContexteCoursActif` (js/modes.js) retrouvait ce
 * groupe-cours (même coursId) et rabattait le contexte sur son `groupeNum`, `_modeCours: false`.
 *
 * Modules RÉELS : modes.js monté par le banc de Suivi, sur un store à deux groupes d'un même cours.
 * On mesure l'effet par `obtenirEtudiantsCoursActif` (la liste de Suivi) : le banc n'expose pas
 * `obtenirContexteCoursActif`. Le filtre partagé `obtenirDonneesSelonMode` n'est pas essayé ici :
 * sur des fiches qui portent un coursId, il ne filtre pas par groupe et restait vert sans le
 * correctif (break-test du 13 sept.).
 */
import { describe, it, expect } from 'vitest';
import { monter } from './_helpers/bac-suivi.js';

function storeDeuxGroupes(infoCours) {
    return {
        infoCours,
        groupeCoursActif: infoCours._modeCours
            ? { modeCours: true, coursId: 'C1', trimestreId: 'test', groupe: null, id: null }
            : { modeCours: false, id: 'GC2', coursId: 'C1', trimestreId: 'test', groupe: '02' },
        cours: [{ id: 'C1', codeCours: '601-101-MQ' }, { id: 'C9', codeCours: '601-102-MQ' }],
        // Le dernier groupe choisi reste marqué actif pendant la vue fusionnée : c'est le cas du rapport.
        test_groupesCours: [
            { id: 'GC1', coursId: 'C1', trimestreId: 'test', actif: false, groupeNum: '01' },
            { id: 'GC2', coursId: 'C1', trimestreId: 'test', actif: true, groupeNum: '02' }
        ],
        test_groupeEtudiants: [
            { da: '2000001', nom: 'Un', prenom: 'A', groupe: '01', coursId: 'C1', statut: 'actif' },
            { da: '2000002', nom: 'Deux', prenom: 'B', groupe: '01', coursId: 'C1', statut: 'actif' },
            { da: '2000003', nom: 'Trois', prenom: 'C', groupe: '02', coursId: 'C1', statut: 'actif' },
            { da: '2000009', nom: 'Ailleurs', prenom: 'D', groupe: '01', coursId: 'C9', statut: 'actif' }
        ],
        test_productions: [], test_evaluationsSauvegardees: [], test_presences: []
    };
}

const das = (liste) => liste.map(e => e.da).sort();

describe('#851 — la vue « Cours (tous groupes) » fond les groupes du cours', () => {

    it('la liste de Suivi rend les élèves des DEUX groupes du cours, et seulement ce cours', () => {
        const { winModes } = monter(storeDeuxGroupes({ id: 'C1', codeCours: '601-101-MQ', groupe: null, _modeCours: true }));
        expect(das(winModes.obtenirEtudiantsCoursActif())).toEqual(['2000001', '2000002', '2000003']);
    });

    it('#130 tient toujours : hors vue fusionnée, un infoCours périmé est rabattu sur le groupe actif', () => {
        // infoCours coincé sur « 01 » par une écriture de cours legacy ; le groupe-cours actif porte « 02 ».
        const { winModes } = monter(storeDeuxGroupes({ id: 'C1', codeCours: '601-101-MQ', groupe: '01' }));
        expect(das(winModes.obtenirEtudiantsCoursActif())).toEqual(['2000003']);
    });
});
