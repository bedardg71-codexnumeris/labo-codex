/**
 * #1245 (8 nov. 2026, décision de Grégoire : « que ce soit par Léa ou sur papier, nous avons besoin de produire une
 * rétroaction en format PDF ») — « EXPORTER POUR LÉA » ET LA REMISE HYBRIDE.
 *
 * Dans un même groupe, des copies numérisées (importées) et des copies remises sur papier. Avant :
 *   · la sélection ne retenait que les élèves qui avaient au moins une copie importée dans le groupe ; un élève évalué
 *     uniquement sur papier n'était ni exporté ni compté ;
 *   · celui qui avait une copie pour un autre travail tombait dans `sansFichier`, compté « sans fichier, sans PDF ».
 * Maintenant (solution acceptée par Grégoire le 8 nov., phrases du compteur comprises) :
 *   · les élèves du groupe-cours actif qui ont une évaluation du travail sont retenus ; les élèves supprimés restent
 *     écartés (#1013) ;
 *   · une copie importée : rien ne change (même générateur, même nom) ;
 *   · une copie sur papier : la synthèse seule, nommée comme les autres (Nom_DA_Production_Evalue.pdf), dans le même ZIP ;
 *   · le compteur dit le nombre de PDF, et la part du papier.
 * Noms fictifs. Break-tests : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const ELEVES = [
    { da: '2100001', nom: 'Fictifun', prenom: 'Ana' },      // copie numérisée du travail P1
    { da: '2100002', nom: 'Fictifdeux', prenom: 'Bea' },    // évaluée sur papier, aucune copie importée nulle part
    { da: '2100003', nom: 'Fictiftrois', prenom: 'Cleo' },  // copie importée pour P2 seulement ; P1 sur papier
    { da: '2100004', nom: 'Fictifquatre', prenom: 'Dan' },  // supprimé·e (#1013), évalué·e sur papier
    { da: '2100005', nom: 'Fictifcinq', prenom: 'Eli' }     // pas d'évaluation de P1
];
const FICHIERS = [
    { id: 'F1', etudiantDA: '2100001', productionId: 'P1', nomFichier: 'copie-ana.pdf' },
    { id: 'F3', etudiantDA: '2100003', productionId: 'P2', nomFichier: 'copie-cleo-p2.pdf' }
];
const EVALUATIONS = [
    { id: 'E1', etudiantDA: '2100001', productionId: 'P1', verrouillee: true },
    { id: 'E2', etudiantDA: '2100002', productionId: 'P1', verrouillee: true },
    { id: 'E3', etudiantDA: '2100003', productionId: 'P1', verrouillee: true },
    { id: 'E4', etudiantDA: '2100004', productionId: 'P1', verrouillee: true }
];

function monter({ syntheseSeule, evaluations = EVALUATIONS } = {}) {
    const appels = { copies: [], papier: [], evaluationsPassees: [] };
    const blob = (quoi) => ({ output: () => ({ quoi }) });
    const win = chargerScript('js/travaux-archivage.js', {
        db: { get: async () => null, getSync: (_k, d) => d, set: async () => {}, setSync: () => {} },
        cle: (k) => k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (k) => ({ groupeEtudiants: ELEVES, evaluationsSauvegardees: evaluations, productions: [{ id: 'P1', titre: 'Analyse fictive' }] })[k] || [],
        obtenirEtudiantsCoursActif: () => ELEVES,
        sauvegarderDonneesSelonMode: () => true,
        obtenirTrimestreActif: () => null,
        travauxStockage: { obtenirFichiersGroupeActif: () => FICHIERS, obtenirFichiersAffiches: () => FICHIERS, obtenirAnnotationFichier: () => null },
        travauxResolution: { trouverFichierPourEvaluation: (e) => FICHIERS.find((f) => f.etudiantDA === e.etudiantDA && f.productionId === e.productionId) || null },
        travauxExportPDF: {
            genererDocPDF: async (fichierId, _p, evaluation) => { appels.copies.push(fichierId); appels.evaluationsPassees.push(evaluation && evaluation.id); return { doc: blob('copie ' + fichierId), synthese: { ajoutee: true } }; },
            genererDocSyntheseSeule: syntheseSeule || (async (da, _p, evaluation) => { appels.papier.push(da); appels.evaluationsPassees.push(evaluation && evaluation.id); return { doc: blob('synthèse ' + da), synthese: { ajoutee: true } }; })
        },
        alert: () => {}, JSZip: function () {}
    }, { addEventListener: () => {}, removeEventListener: () => {}, dasElevesSupprimes: () => new Set(['2100004']) });
    return { a: win.travauxArchivage, appels };
}

describe('#1245 — « Exporter pour Léa » prend aussi les copies évaluées sur papier', () => {
    it('1. la sélection : la copie importée d\'un côté, les deux copies sur papier de l\'autre ; l\'élève supprimé·e nulle part', () => {
        const sel = monter().a.selectionnerEvaluationsLea('P1', null, false);
        expect(sel.fichiers.map((f) => f.id)).toEqual(['F1']);
        expect(sel.sansFichier.map((e) => e.etudiantDA).sort(), 'avant : seule Cleo, Bea absente').toEqual(['2100002', '2100003']);
        expect(sel.evaluations.map((e) => e.etudiantDA)).not.toContain('2100004');
    });

    it('2. l\'export : trois PDF dans le même lot, chacun avec le DA dans son nom ; la copie importée passe par le même générateur qu\'avant', async () => {
        const { a, appels } = monter();
        const r = await a.exporterPourLea('P1', null, false);
        expect(r.blobs.map((b) => b.nom).sort()).toEqual([
            'Fictifdeux_2100002_Analyse-fictive_Evalue.pdf',
            'Fictiftrois_2100003_Analyse-fictive_Evalue.pdf',
            'Fictifun_2100001_Analyse-fictive_Evalue.pdf'
        ]);
        expect(appels.copies).toEqual(['F1']);
        expect(appels.papier.sort()).toEqual(['2100002', '2100003']);
        expect(r.blobs.find((b) => b.nom.startsWith('Fictifun')).blob).toEqual({ quoi: 'copie F1' });
        expect(r.echecs).toEqual([]);
    });

    it('3. une synthèse sur papier qui ne peut pas être faite est un échec nommé ; les autres partent', async () => {
        const { a } = monter({ syntheseSeule: async (da) => (da === '2100002'
            ? { doc: null, synthese: { ajoutee: false, raison: 'aucune évaluation enregistrée pour cette copie' } }
            : { doc: { output: () => ({}) }, synthese: { ajoutee: true } }) });
        const r = await a.exporterPourLea('P1', null, false);
        expect(r.blobs).toHaveLength(2);
        expect(r.echecs).toEqual(['Bea Fictifdeux (2100002) — sur papier : aucune évaluation enregistrée pour cette copie']);
    });

    it('4. un seul élève, sur papier : sa synthèse seule', async () => {
        const { a, appels } = monter();
        const r = await a.exporterPourLea('P1', '2100002', false);
        expect(r.blobs.map((b) => b.nom)).toEqual(['Fictifdeux_2100002_Analyse-fictive_Evalue.pdf']);
        expect(appels.copies).toEqual([]);
    });
});

describe('Lot du 9 nov. 2026 — « Exporter pour Léa » n\'envoie que les évaluations verrouillées', () => {
    const avec = (modifs) => EVALUATIONS.map((e) => Object.assign({}, e, modifs[e.id] || {}));

    it('7. une évaluation non verrouillée : pas de PDF, et rendue dans `nonVerrouillees` pour le compteur', async () => {
        const evaluations = avec({ E2: { verrouillee: false } });
        const { a } = monter({ evaluations });
        const sel = a.selectionnerEvaluationsLea('P1', null, false);
        expect(sel.nonVerrouillees.map((e) => e.id)).toEqual(['E2']);
        const r = await monter({ evaluations }).a.exporterPourLea('P1', null, false);
        expect(r.blobs.map((b) => b.nom).sort()).toEqual([
            'Fictiftrois_2100003_Analyse-fictive_Evalue.pdf',
            'Fictifun_2100001_Analyse-fictive_Evalue.pdf'
        ]);
    });

    it('8. un doublon non verrouillé (plus récent, d\'abord en base) : la verrouillée part, et c\'est ELLE que le générateur reçoit', async () => {
        const doublon = { id: 'E1B', etudiantDA: '2100001', productionId: 'P1', verrouillee: false };
        const doublonPapier = { id: 'E2B', etudiantDA: '2100002', productionId: 'P1', verrouillee: false };
        const { a, appels } = monter({ evaluations: [doublon, doublonPapier].concat(EVALUATIONS) });
        const sel = a.selectionnerEvaluationsLea('P1', null, false);
        expect(sel.evaluations.map((e) => e.id).sort()).toEqual(['E1', 'E2', 'E3']);
        expect(sel.nonVerrouillees).toEqual([]);
        await a.exporterPourLea('P1', null, false);
        expect(appels.evaluationsPassees.sort(), 'le PDF porte l\'évaluation choisie, pas la plus récente du couple').toEqual(['E1', 'E2', 'E3']);
    });
});

describe('#1245 — le compteur de « Export Léa » compte le papier et le dit', () => {
    const source = readFileSync(path.join(RACINE, 'js/travaux-ui.js'), 'utf8');
    // Lot du 9 nov. 2026 : le compteur et ses deux phrases (`_texteCompteurLea`, `_laisseesDeCoteLea`), jusqu'au quota.
    const corps = tranche(source, 'function mettreAJourCompteurLea() {', '    /**\n     * Charge et affiche les infos de quota', { longueurMin: 400 });
    function compter(selection, { da = '', reprises = false } = {}) {
        const elements = {
            'travaux-lea-compteur': { textContent: '' },
            'travaux-archivage-lea-production': { value: 'P1' },
            'travaux-archivage-lea-etudiant': { value: da },
            'travaux-lea-reprises-seulement': { checked: reprises }
        };
        const document = { getElementById: (id) => elements[id] || null };
        const travauxArchivage = { selectionnerEvaluationsLea: () => selection };
        new Function('document', 'travauxArchivage', corps + '\nmettreAJourCompteurLea();')(document, travauxArchivage);
        return elements['travaux-lea-compteur'].textContent;
    }
    const sel = (nbCopies, nbPapier, nbNon = 0) => ({ fichiers: Array(nbCopies).fill({}), sansFichier: Array(nbPapier).fill({}), evaluations: [], nonVerrouillees: Array(nbNon).fill({}) });

    it('5. les phrases validées par Grégoire', () => {
        expect(compter(sel(9, 3))).toBe('12 PDF pour 12 étudiant·es, dont 3 sur papier (synthèse seule)');
        expect(compter(sel(12, 0))).toBe('12 PDF pour 12 étudiant·es');
        expect(compter(sel(0, 1))).toBe('1 PDF pour 1 étudiant·e, dont 1 sur papier (synthèse seule)');
        expect(compter(sel(0, 1), { da: '2100002' })).toBe('1 évaluation prête (synthèse seule)');
        expect(compter(sel(1, 0), { da: '2100001' })).toBe('1 évaluation prête');
        expect(compter(sel(0, 1), { da: '2100002', reprises: true })).toBe('1 reprise prête (synthèse seule)');
        expect(compter(sel(0, 0))).toBe('Aucune évaluation trouvée');
    });

    it('6. lot du 9 nov. — les non verrouillées laissées de côté : le texte validé par Grégoire, au singulier et au pluriel', () => {
        expect(compter(sel(2, 1, 1))).toBe('3 PDF pour 3 étudiant·es, dont 1 sur papier (synthèse seule) · 1 évaluation non verrouillée laissée de côté');
        expect(compter(sel(3, 0, 2))).toBe('3 PDF pour 3 étudiant·es · 2 évaluations non verrouillées laissées de côté');
        expect(compter(sel(3, 0, 0))).toBe('3 PDF pour 3 étudiant·es');
    });
});

/*
 * BREAK-TESTS (8 nov. 2026) — avec `travaux-archivage.js`, `travaux-ui.js` et `travaux-export-pdf.js` d'avant : 5 rouges
 * sur 5. Puis chaque altération, retirée ensuite (5 verts) :
 *   M. seuls les élèves qui ont une copie importée (l'ancienne règle)   → 1, 2, 3, 4
 *   N. les élèves supprimé·es ne sont plus écarté·es                    → 1, 2, 3
 *   O. aucune synthèse pour les copies sur papier                        → 2, 3, 4
 *   P. le compteur ne dit plus la part du papier                         → 5
 */
