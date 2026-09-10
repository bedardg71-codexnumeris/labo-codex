/**
 * SENTINELLE #730 — UNE ÉVALUATION REMPLACÉE PAR UNE REPRISE NE COMPTE PLUS DANS LE DÉPISTAGE.
 *
 * Audit de l'onglet Suivi, 5 septembre 2026, constat B-3 (Rapports/AUDIT-onglet-suivi-2026-09-05.md).
 * La note du cours remplace l'originale (`remplaceeParId`, filtré par les quatre familles) ; le
 * dépistage la comptait ENCORE : sept fonctions lisaient `evaluationsSauvegardees` sans ce filtre —
 * `calculerMoyennesCriteres`, `calculerMoyennesCriteresRecents`, `_filtrerEtTrierEvaluationsIPB`
 * (donc `calculerIPB` et le suivi des fondations), `calculerIndicesNDerniersArtefacts` (la performance
 * du RàI), `identifierDefiSpecifique` (profil-etudiant-calculs.js) ; `calculerDirectionRisque` et
 * `calculerDirectionsCriteres` (profil-etudiant-sections-affichage.js). (`calculerDirectionRisque`,
 * dont le résultat n'était lu par personne, est retirée au #823 — six sites restent gardés ici.) L'élève qui a repris sa
 * dissertation (55 → 75) était lu « niveau 3 » : le dépistage voyait 50, 75, 55 là où la note du cours
 * voit 50, 75, 70. Les deux sœurs du même fichier (`obtenirEchelleCommuneDesEvaluations`,
 * `diagnostiquerConversionNiveaux`) filtraient déjà : c'est leur patron qui est repris.
 *
 * Le jeu : quatre travaux, la dissertation (P3) reprise. Les nombres attendus sont calculés à la main
 * SANS l'originale ; en commentaire, ce que chaque fonction rendait AVEC (l'avant).
 *
 * Break-test attendu : retirer `!e.remplaceeParId` d'UN site à la fois → au moins un cas rougit à chaque fois.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const clone = (x) => JSON.parse(JSON.stringify(x));
const r3 = (x) => Math.round(x * 1000) / 1000;
const DA = '2000002';

const E0 = { id: 'E0', nom: 'IDME0', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40 }, { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75 }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100 } ] };
const GRILLE = { id: 'G1', nom: 'Dépistage', criteres: [
    { id: 'c1', nom: 'Structure', ponderation: 30, niveauSOLO: 'multistructurel' },
    { id: 'c2', nom: 'Rigueur', ponderation: 30, niveauSOLO: 'multistructurel' },
    { id: 'c3', nom: 'Nuance', ponderation: 40, niveauSOLO: 'relationnel' } ] };
const PRODUCTIONS = ['P1', 'P2', 'P3', 'P4'].map((id, i) => ({ id, titre: 'Travail ' + (i + 1), type: 'travail', ponderation: 25, dateEcheance: '2026-0' + (2 + i) + '-01' }));
function ev(id, prodId, note, niveau, codes, date, extra) {
    return Object.assign({ id, etudiantDA: DA, productionId: prodId, noteFinale: note, niveauFinal: niveau, echelleId: 'E0', grilleId: 'G1',
        ponderationCouverte: 100, verrouillee: true, dateEvaluation: date, retroactionFinale: 'Rétroaction.',
        criteres: ['Structure', 'Rigueur', 'Nuance'].map((nom, i) => ({ critereId: 'c' + (i + 1), critereNom: nom, niveauSelectionne: codes[i], ponderation: GRILLE.criteres[i].ponderation })) }, extra || {});
}
// P1 85 · P2 70 · P3 55 REMPLACÉE par P3R 75 · P4 50. Fondations (Structure, Rigueur) : P1 0,875 · P2 0,65 · P3 0,40 · P3R 0,75 · P4 0,40.
const EVALUATIONS = [
    ev('E_P1', 'P1', 85, 'E', ['M', 'E', 'M'], '2026-02-01T12:00:00.000Z'),
    ev('E_P2', 'P2', 70, 'D', ['D', 'D', 'M'], '2026-03-01T12:00:00.000Z'),
    ev('E_P3', 'P3', 55, 'I', ['I', 'I', 'D'], '2026-04-01T12:00:00.000Z', { remplaceeParId: 'E_P3R', archivee: true }),
    ev('E_P3R', 'P3', 75, 'M', ['M', 'M', 'M'], '2026-04-20T12:00:00.000Z', { repriseDeId: 'E_P3', jetonRepriseApplique: true }),
    ev('E_P4', 'P4', 50, 'I', ['I', 'I', 'I'], '2026-05-01T12:00:00.000Z')
];

const MODULES = ['js/interpretation-config.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js', 'js/profil-etudiant-sections-affichage.js'];
const EXPORTS = (() => { const n = new Set(); for (const f of MODULES) for (const m of readFileSync(path.join(RACINE, f), 'utf8').matchAll(/^\s*window\.([A-Za-z_$][\w$]*)\s*=/gm)) n.add(m[1]); return [...n]; })();

function monter() {
    const store = { test_evaluationsSauvegardees: clone(EVALUATIONS), test_productions: clone(PRODUCTIONS), test_echellesTemplates: [clone(E0)], test_grillesTemplates: [clone(GRILLE)],
        test_groupeEtudiants: [{ da: DA, nom: 'Absent', prenom: 'Bruno' }] };
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); }, get: async () => null, set: async () => {} };
    const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', dateLocaleYMD: () => '2026-05-15' };
    const fwd = (nom) => (...a) => win[nom](...a);
    const globaux = { db, cle, obtenirDonneesSelonMode: (k) => { const kb = String(k).replace(/^test_/, ''); return ('test_' + kb) in store ? clone(store['test_' + kb]) : []; },
        obtenirPreference: (n) => (n === 'grilleReferenceDepistage' ? 'G1' : null), definirPreference() {}, echapperHtml: (s) => String(s == null ? '' : s),
        obtenirTypePratiqueActive: () => 'sommative', estEtudiantExclu: () => false, filtrerEtudiantsParMode: (a) => a, estModeeLectureSeule: () => false,
        obtenirEtudiantsCoursActif: () => clone(store.test_groupeEtudiants), calculerTousLesIndices: () => ({ A: 100, C: 100, P: 69, M: 100 }),
        resoudreModeleParId: (type, id) => clone((store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []).find(m => m.id === id) || null) };
    for (const nom of EXPORTS) if (!(nom in globaux) && !/^[A-Z]/.test(nom) && nom !== 'SEUILS_PAR_DEFAUT') globaux[nom] = fwd(nom);
    chargerScript('js/interpretation-config.js', globaux, win);
    chargerScript('js/profil-etudiant-calculs.js', globaux, win);
    chargerScript('js/profil-etudiant-helpers.js', globaux, win);
    chargerScript('js/profil-etudiant-sections-affichage.js', globaux, win);
    return win;
}

describe('#730 · la reprise remplace, dans le dépistage aussi', () => {
    it('calculerMoyennesCriteres : Structure (0,75 + 0,65 + 0,75 + 0,40) / 4 = 0,6375 — avant, cinq évaluations : 0,59', () => {
        expect(r3(monter().calculerMoyennesCriteres(DA).structure)).toBe(0.638);
    });
    it('calculerMoyennesCriteresRecents : même moyenne sur les quatre artefacts — avant 0,59', () => {
        expect(r3(monter().calculerMoyennesCriteresRecents(DA).structure)).toBe(0.638);
    });
    it('calculerIPB : quatre artefacts dans l\'historique, pas cinq ; fenêtre 0,65 · 0,75 · 0,40 → IPB 1 ↘', () => {
        const ipb = monter().calculerIPB(DA);
        expect(ipb.historiqueComplet.length).toBe(4);
        expect(ipb.scoresParArtefact.map(r3)).toEqual([0.65, 0.75, 0.4]);
        expect([ipb.ipb, ipb.direction]).toEqual([1, '↘']);
    });
    it('calculerIndicesNDerniersArtefacts : (50 + 75 + 70) / 3 = 0,65 — avant, l\'originale en troisième : 0,60', () => {
        const n3 = monter().calculerIndicesNDerniersArtefacts(DA, true);
        expect([r3(n3.performance), n3.nbArtefacts]).toEqual([0.65, 3]);
    });
    it('identifierDefiSpecifique : Structure sur les trois derniers (0,40 + 0,75 + 0,65) / 3 = 0,60 — avant 0,5167', () => {
        const defi = monter().identifierDefiSpecifique(DA);
        expect([defi.defi, r3(defi.score)]).toEqual(['Structure', 0.6]);
    });
    it('calculerDirectionsCriteres : Structure, moyenne récente 60,0 — avant 51,7', () => {
        const d = monter().calculerDirectionsCriteres(DA);
        expect(d.structure.moyenneRecente).toBe('60.0');
    });
});
