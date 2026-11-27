/**
 * #1247 (décision de Grégoire, 27 nov. 2026, 15 h 19) — « EXPORTER POUR LÉA » : LA COPIE À LA CORBEILLE EST COMPTÉE À PART.
 *
 * `selectionnerEvaluationsLea` (travaux-archivage.js) rangeait dans `sansFichier` toute évaluation dont la copie ne se
 * résout pas : la copie évaluée sur papier, mais aussi une copie numérisée mise à la corbeille. Le compteur les disait
 * toutes « sur papier ». Mesuré le 27 nov. : seule la corbeille garde une trace de la copie ; une copie supprimée pour
 * de bon n'en laisse aucune (métadonnées, fichier et annotations partent, l'évaluation ne pointe pas vers sa copie).
 * Décision : la copie à la corbeille est comptée à part, « dont N dont la copie est à la corbeille », invariable comme
 * « sur papier » ; sa synthèse part quand même, le PDF de l'élève ne change pas ; une copie supprimée reste comptée
 * « sur papier » (limite assumée) ; aucune trace nouvelle n'est ajoutée aux évaluations. Noms fictifs.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const ELEVES = [
    { da: '2200001', nom: 'Fictifun', prenom: 'Ana' },      // copie importée, présente
    { da: '2200002', nom: 'Fictifdeux', prenom: 'Bea' },    // évaluée sur papier
    { da: '2200003', nom: 'Fictiftrois', prenom: 'Cleo' },  // copie importée, mise à la corbeille (même élève, même production)
    { da: '2200004', nom: 'Fictifquatre', prenom: 'Dan' },  // copie importée puis supprimée pour de bon : aucune trace
    { da: '2200005', nom: 'Fictifcinq', prenom: 'Eli' }     // reprise ; la copie de l'original, liée par son evaluationId, est à la corbeille
];
const FICHIERS = [{ id: 'F1', etudiantDA: '2200001', productionId: 'P1', nomFichier: 'copie-ana.pdf' }];
const CORBEILLE = [
    { id: 'F3', etudiantDA: '2200003', productionId: 'P1', nomFichier: 'copie-cleo.pdf', dateSuppression: '2026-11-20T10:00:00Z' },
    // La copie de l'original d'Eli, détachée de sa production (orpheline) puis mise à la corbeille : seul son
    // `evaluationId` la relie encore à l'évaluation reprise.
    { id: 'F5', etudiantDA: '2200005', productionId: '', evaluationId: 'E5', nomFichier: 'copie-eli.pdf', dateSuppression: '2026-11-21T10:00:00Z' },
    // Une copie d'une AUTRE production, à la corbeille : elle ne dit rien de l'évaluation de P1 de Bea.
    { id: 'F9', etudiantDA: '2200002', productionId: 'P2', nomFichier: 'copie-bea-p2.pdf', dateSuppression: '2026-11-22T10:00:00Z' }
];
const EVALUATIONS = [
    { id: 'E1', etudiantDA: '2200001', productionId: 'P1', verrouillee: true },
    { id: 'E2', etudiantDA: '2200002', productionId: 'P1', verrouillee: true },
    { id: 'E3', etudiantDA: '2200003', productionId: 'P1', verrouillee: true },
    { id: 'E4', etudiantDA: '2200004', productionId: 'P1', verrouillee: true },
    { id: 'E5', etudiantDA: '2200005', productionId: 'P1', verrouillee: true, remplaceeParId: 'E5R' },
    { id: 'E5R', etudiantDA: '2200005', productionId: 'P1', verrouillee: true, repriseDeId: 'E5' }
];

function monter({ corbeille = CORBEILLE } = {}) {
    const appels = { copies: [], syntheses: [] };
    const blob = (quoi) => ({ output: () => ({ quoi }) });
    const win = chargerScript('js/travaux-archivage.js', {
        db: { get: async () => null, getSync: (_k, d) => d, set: async () => {}, setSync: () => {} },
        cle: (k) => k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (k) => ({ groupeEtudiants: ELEVES, evaluationsSauvegardees: EVALUATIONS, productions: [{ id: 'P1', titre: 'Analyse fictive' }] })[k] || [],
        obtenirEtudiantsCoursActif: () => ELEVES,
        sauvegarderDonneesSelonMode: () => true,
        obtenirTrimestreActif: () => null,
        travauxStockage: {
            obtenirFichiersGroupeActif: () => FICHIERS, obtenirFichiersAffiches: () => FICHIERS,
            obtenirCorbeille: () => corbeille, obtenirAnnotationFichier: () => null
        },
        travauxResolution: { trouverFichierPourEvaluation: (e) => FICHIERS.find((f) => f.etudiantDA === e.etudiantDA && f.productionId === e.productionId) || null },
        travauxExportPDF: {
            genererDocPDF: async (id) => { appels.copies.push(id); return { doc: blob('copie ' + id), synthese: { ajoutee: true } }; },
            genererDocSyntheseSeule: async (da, _p, e) => { appels.syntheses.push(e.id); return { doc: blob('synthèse ' + da), synthese: { ajoutee: true } }; }
        },
        alert: () => {}, JSZip: function () {}
    }, { addEventListener: () => {}, removeEventListener: () => {}, dasElevesSupprimes: () => new Set() });
    return { a: win.travauxArchivage, appels };
}

describe('#1247 — la sélection distingue la copie à la corbeille de la copie sur papier', () => {
    it('les copies à la corbeille (même élève et même production, ou liée par l\'évaluation d\'origine) sont rendues à part', () => {
        const sel = monter().a.selectionnerEvaluationsLea('P1', null, false);
        expect(sel.fichiers.map((f) => f.id)).toEqual(['F1']);
        // `sansFichier` reste la liste des synthèses seules : elle ne change pas.
        expect(sel.sansFichier.map((e) => e.id).sort()).toEqual(['E2', 'E3', 'E4', 'E5R']);
        expect(sel.aLaCorbeille.map((e) => e.id).sort()).toEqual(['E3', 'E5R']);
    });

    it('la limite assumée : une copie supprimée pour de bon (aucune trace) reste avec le papier', () => {
        const sel = monter().a.selectionnerEvaluationsLea('P1', null, false);
        expect(sel.aLaCorbeille.map((e) => e.id)).not.toContain('E4');
        expect(sel.sansFichier.map((e) => e.id)).toContain('E4');
    });

    it('corbeille vide : rien à part, comme avant', () => {
        const sel = monter({ corbeille: [] }).a.selectionnerEvaluationsLea('P1', null, false);
        expect(sel.aLaCorbeille).toEqual([]);
    });

    it('l\'export ne change pas : la synthèse d\'une copie à la corbeille part quand même, avec les autres', async () => {
        const { a, appels } = monter();
        const r = await a.exporterPourLea('P1', null, false);
        expect(appels.copies).toEqual(['F1']);
        expect(appels.syntheses.sort()).toEqual(['E2', 'E3', 'E4', 'E5R']);
        expect(r.blobs).toHaveLength(5);
        expect(r.echecs).toEqual([]);
    });

    it('aucune trace nouvelle : la sélection n\'écrit rien', () => {
        const src = readFileSync(path.join(RACINE, 'js', 'travaux-archivage.js'), 'utf8');
        const corps = tranche(src, 'function selectionnerEvaluationsLea(', '    // Lot du 9 nov. 2026 : le texte validé');
        expect(corps).not.toMatch(/setSync|sauvegarder|mettreAJour/);
    });
});

describe('#1247 — le compteur dit la part de la corbeille (texte validé par Grégoire)', () => {
    const source = readFileSync(path.join(RACINE, 'js/travaux-ui.js'), 'utf8');
    const corps = tranche(source, 'function mettreAJourCompteurLea() {', '    /**\n     * Charge et affiche les infos de quota', { longueurMin: 400 });
    function compter(selection, { da = '' } = {}) {
        const elements = {
            'travaux-lea-compteur': { textContent: '' },
            'travaux-archivage-lea-production': { value: 'P1' },
            'travaux-archivage-lea-etudiant': { value: da },
            'travaux-lea-reprises-seulement': { checked: false }
        };
        const document = { getElementById: (id) => elements[id] || null };
        const travauxArchivage = { selectionnerEvaluationsLea: () => selection };
        new Function('document', 'travauxArchivage', corps + '\nmettreAJourCompteurLea();')(document, travauxArchivage);
        return elements['travaux-lea-compteur'].textContent;
    }
    // nbPapier : sans copie et sans trace ; nbCorbeille : sans copie, copie à la corbeille (comptée aussi dans sansFichier).
    const sel = (nbCopies, nbPapier, nbCorbeille) => {
        const corbeille = Array.from({ length: nbCorbeille }, () => ({}));
        return { fichiers: Array(nbCopies).fill({}), sansFichier: Array.from({ length: nbPapier }, () => ({})).concat(corbeille),
            aLaCorbeille: corbeille, evaluations: [], nonVerrouillees: [] };
    };

    it('une copie à la corbeille, seule de son espèce : le singulier', () => {
        expect(compter(sel(4, 0, 1))).toBe('5 PDF pour 5 étudiant·es, dont 1 dont la copie est à la corbeille');
    });

    it('plusieurs : la phrase ne change pas, comme « sur papier »', () => {
        expect(compter(sel(4, 0, 3))).toBe('7 PDF pour 7 étudiant·es, dont 3 dont la copie est à la corbeille');
    });

    it('les deux cas ensemble : le papier d\'abord, la corbeille ensuite ; le total compte les deux', () => {
        expect(compter(sel(9, 2, 1))).toBe('12 PDF pour 12 étudiant·es, dont 2 sur papier (synthèse seule), dont 1 dont la copie est à la corbeille');
    });

    it('sans corbeille, les phrases d\'avant (#1245), mot pour mot', () => {
        expect(compter(sel(9, 3, 0))).toBe('12 PDF pour 12 étudiant·es, dont 3 sur papier (synthèse seule)');
        expect(compter(sel(12, 0, 0))).toBe('12 PDF pour 12 étudiant·es');
        expect(compter({ fichiers: [], sansFichier: [{}], evaluations: [], nonVerrouillees: [] })).toBe('1 PDF pour 1 étudiant·e, dont 1 sur papier (synthèse seule)');
    });

    it('un seul élève choisi : la phrase d\'avant, « (synthèse seule) », que sa copie soit sur papier ou à la corbeille', () => {
        expect(compter(sel(0, 0, 1), { da: '2200003' })).toBe('1 évaluation prête (synthèse seule)');
    });
});
