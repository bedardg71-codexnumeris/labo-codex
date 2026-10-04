import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #950 (25 septembre 2026) — L'EXPORT LÉA, EN MODE ANONYMISATION, NE PORTE PLUS LE DA RÉEL.
//
// Vécu par Grégoire (capture du Finder, 1.159.6) : l'export individuel pour Léa, anonymisé, rendait
// `Inconnu_<DA réel>_Artefact-2-rév_Evalue.pdf` — le nom anonyme est vide (« Inconnu ») et le DA,
// réel. Même règle que l'export des travaux (#948) : le nom anonyme seul, ni nom ni DA.
//
// Invariants, en anonymisation : le nom du PDF, le bilan d'échec et celui des synthèses manquantes
// ne portent ni le nom réel ni le DA réel. Hors anonymisation : `Nom_DA_production_Evalue.pdf`, inchangé.
// Noms et DA fictifs (règle 6).

const DA = '2600301';

function monter({ anonyme, genererDocPDF }) {
    const etudiants = anonyme
        ? [{ da: DA, daReel: DA, daAffichage: DA, nom: '', prenom: 'Élève 32' }]
        : [{ da: DA, nom: 'Tremblay', prenom: 'Alix' }];
    const fichiers = [{ id: 'F1', etudiantDA: DA, productionId: 'P1', nomFichier: 'copie.pdf' }];
    const store = {
        groupeEtudiants: etudiants,
        evaluationsSauvegardees: [{ id: 'E1', etudiantDA: DA, productionId: 'P1' }],
        productions: [{ id: 'P1', titre: 'Artefact 2 (rév)' }]
    };
    const win = chargerScript('js/travaux-archivage.js', {
        db: { getSync: (_k, d) => d, setSync: () => {} },
        cle: (k) => k,
        obtenirDonneesSelonMode: (k) => store[k] || [],
        obtenirTrimestreActif: () => ({ id: 'a2026', nom: 'Automne 2026' }),
        travauxStockage: { obtenirFichiersGroupeActif: () => fichiers, obtenirFichiersAffiches: () => fichiers, /* #1013 */ obtenirAnnotationFichier: () => null, recupererBlob: async () => ({ taille: 1 }) },
        travauxResolution: { trouverFichierPourEvaluation: (ev) => fichiers.find(f => f.etudiantDA === ev.etudiantDA) },
        travauxExportPDF: { genererDocPDF: genererDocPDF || (async () => ({ doc: { output: () => ({ pdf: 1 }) }, synthese: { ajoutee: true } })) },
        alert: () => {},
        JSZip: function () {}
    }, { addEventListener() {}, removeEventListener() {}, estModeAnonymisation: () => anonyme === true });
    return win.travauxArchivage;
}

describe('#950 · export Léa en anonymisation : ni nom ni DA', () => {
    it('le PDF se nomme « Élève 32_‹production›_Evalue.pdf »', async () => {
        const { blobs } = await monter({ anonyme: true }).exporterPourLea('P1', null, false, null);
        expect(blobs.map(b => b.nom)).toEqual(['Élève 32_Artefact-2-rév_Evalue.pdf']);
        expect(blobs[0].nom).not.toContain(DA);
        expect(blobs[0].nom).not.toContain('Inconnu');
    });

    it('le bilan d\'échec et celui des synthèses manquantes ne portent pas le DA', async () => {
        const echec = await monter({ anonyme: true, genererDocPDF: async () => { throw new Error('Blob introuvable'); } })
            .exporterPourLea('P1', null, false, null);
        expect(echec.echecs).toEqual(['Élève 32 — Blob introuvable']);
        const sans = await monter({ anonyme: true, genererDocPDF: async () => ({ doc: { output: () => ({}) }, synthese: { ajoutee: false, raison: 'canvas vide' } }) })
            .exporterPourLea('P1', null, false, null);
        expect(sans.sansSynthese).toEqual(['Élève 32 — canvas vide']);
    });
});

describe('#950 · hors anonymisation, rien ne change', () => {
    it('« Nom_DA_production_Evalue.pdf » et le bilan avec prénom, nom et DA', async () => {
        const { blobs } = await monter({ anonyme: false }).exporterPourLea('P1', null, false, null);
        expect(blobs.map(b => b.nom)).toEqual([`Tremblay_${DA}_Artefact-2-rév_Evalue.pdf`]);
        const echec = await monter({ anonyme: false, genererDocPDF: async () => { throw new Error('Blob introuvable'); } })
            .exporterPourLea('P1', null, false, null);
        expect(echec.echecs).toEqual([`Alix Tremblay (${DA}) — Blob introuvable`]);
    });
});

// Suite vécue (capture de Grégoire, 25 sept., 14 h 30) : la page de rétroaction du PDF imprimait
// « Élève 32 32 · DA <réel> · Gr. … ». `construireStudent` (synthese-retroaction-data.js) : en
// anonymisation, le nom anonyme seul, pas de DA, le groupe anonyme sans son « Gr. » (l'en-tête l'ajoute).
function chargerSynthese({ anonyme, etudiants }) {
    return chargerScript('js/synthese-retroaction-data.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null), setSync: () => {} },
        cle: (k) => 'test_' + k,
        obtenirEchelleResolue: () => ({ niveaux: [{ code: 'M', nom: 'Maîtrisé', min: 75, max: 89 }] }),
        obtenirDonneesSelonMode: (k) => (k === 'groupeEtudiants' ? etudiants : []),
        obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }),
        obtenirEtudiantsCoursActif: () => [], obtenirGroupesCours: () => [],
        travauxStockage: { obtenirAnnotationFichier: () => null },
        travauxOutils: { AUTOCOLLANTS: [] },
        obtenirPreference: () => null,
        anonymiserTexteRetroaction: (t) => t,
        anonymiserNom: () => 'Élève 99'
    }, { addEventListener() {}, removeEventListener() {}, estModeAnonymisation: () => anonyme === true });
}
const EVAL_950 = { id: 'EV1', etudiantDA: DA, etudiantNom: 'Élève 32', groupe: 'Gr. A', grilleId: 'G1', criteres: [] };

describe('#950 · la page de rétroaction du PDF, en anonymisation', () => {
    it('« Élève 32 », sans DA ni « 32 » doublé ; le groupe anonyme sans « Gr. » répété', () => {
        const win = chargerSynthese({ anonyme: true, etudiants: [{ da: DA, nom: '', prenom: 'Élève 32', groupe: 'Gr. A' }] });
        const s = win.syntheseRetroactionData.construireFeedback(EVAL_950, { id: 'F1' }, null).student;
        expect(s).toEqual({ firstName: 'Élève 32', lastName: '', da: '', group: 'A' });
    });

    it('élève absent de la liste : le nom anonyme vient de anonymiserNom, pas d\'etudiantNom ni du DA', () => {
        const win = chargerSynthese({ anonyme: true, etudiants: [] });
        const s = win.syntheseRetroactionData.construireFeedback(EVAL_950, { id: 'F1' }, null).student;
        expect(s).toEqual({ firstName: 'Élève 99', lastName: '', da: '', group: '' });
    });

    it('hors anonymisation : prénom, nom, DA et groupe réels, inchangés', () => {
        const win = chargerSynthese({ anonyme: false, etudiants: [{ da: DA, nom: 'Tremblay', prenom: 'Alix', groupe: '01' }] });
        const s = win.syntheseRetroactionData.construireFeedback({ ...EVAL_950, groupe: '01' }, { id: 'F1' }, null).student;
        expect(s).toEqual({ firstName: 'Alix', lastName: 'Tremblay', da: DA, group: '01' });
    });
});
