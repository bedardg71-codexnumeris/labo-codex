import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// SENTINELLE #948 (25 septembre 2026) — L'ANONYMISATION SE REND JUSQU'AU BOUT DE L'ARCHIVE.
//
// Symptôme vécu (capture du Finder de Grégoire) : en mode anonymisation, l'export
// « Exporter des travaux » donnait `_Élève 32_<DA>/Artefact 1/<Nom>_<DA>_Artefact_1_….pdf`.
// Le dossier portait le nom anonyme, mais le DA réel y restait, et chaque copie gardait
// son nom d'origine (le nom Léa de l'élève). `_evaluations.json` portait aussi le DA.
//
// Invariants, en anonymisation :
//   · aucun chemin de l'archive ne contient le nom réel ni le DA réel ;
//   · deux copies d'un même dossier ne s'écrasent pas (rang) ; l'extension reste ;
//   · la version annotée suit le nom anonyme ;
//   · le bilan d'échec et `_resume.json` ne nomment ni l'élève ni son DA ;
//   · `_evaluations.json` ne porte aucun DA réel ;
//   · l'export d'UN élève (dossier, fichiers, nom du ZIP) suit la même règle.
// Hors anonymisation : chemins inchangés (nom_prénom_DA, nom de fichier d'origine).

const NOM = 'Tremblay';
const PRENOM = 'Alix';
const DA = '2600111';

function monter({ anonyme, recupererBlob } = {}) {
    // Ce que rend `obtenirDonneesSelonMode` dans chaque mode (modes.js, anonymiserDonnees).
    const etudiants = anonyme
        ? [{ da: DA, daReel: DA, daAffichage: DA, nom: '', prenom: 'Élève 32' }]
        : [{ da: DA, nom: NOM, prenom: PRENOM }];
    const evaluations = anonyme
        ? [{ id: 'E1', etudiantDA: DA, etudiantDAReel: DA, etudiantDAffichage: DA, etudiantNom: 'Élève 32', productionId: 'P1' }]
        : [{ id: 'E1', etudiantDA: DA, etudiantNom: `${PRENOM} ${NOM}`, productionId: 'P1' }];
    const fichiers = [
        { id: 'F1', etudiantDA: DA, productionId: 'P1', typeMIME: 'application/pdf', nomFichier: `${NOM}_${DA}_Artefact_1_Remis_le_2026-09-15_09h46m28s.pdf` },
        { id: 'F2', etudiantDA: DA, productionId: 'P1', typeMIME: 'application/pdf', nomFichier: `${NOM}_${DA}_Artefact_1_Remis_le_2026-09-20_10h00m00s.pdf` }
    ];
    const store = {
        groupeEtudiants: etudiants,
        productions: [{ id: 'P1', titre: 'Artefact 1' }],
        evaluationsSauvegardees: evaluations
    };

    const entrees = [];
    function FauxZip(prefixe = '') {
        this.file = (chemin, contenu) => { entrees.push({ chemin: prefixe + chemin, contenu }); };
        this.folder = (nom) => new FauxZip(prefixe + nom + '/');
        this.generateAsync = async () => ({ fauxBlob: true });
    }
    const telecharges = [];
    const stubs = {
        document: {
            getElementById: () => null,
            createElement: () => ({ click() { telecharges.push(this.download); } })
        },
        db: { get: async () => null, getSync: (_k, d) => d, set: async () => {}, setSync: () => {} },
        cle: (k) => k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (k) => store[k] || [],
        sauvegarderDonneesSelonMode: () => {},
        obtenirTrimestreActif: () => ({ id: 'a2026', nom: 'Automne 2026' }),
        travauxStockage: {
            obtenirFichiersGroupeActif: () => fichiers,
            obtenirFichiersEtudiant: (da) => fichiers.filter(f => f.etudiantDA === da),
            // Une annotation sur F1 : la version annotée doit suivre le nom anonyme.
            obtenirAnnotationFichier: (id) => (id === 'F1' ? { pages: { 1: [] } } : null),
            recupererBlob: recupererBlob || (async () => ({ taille: 1 })),
            marquerExporte: () => {}
        },
        travauxResolution: {},
        travauxExportPDF: { rendrePDFAvecAnnotations: async () => ({ annote: true }) },
        URL: { createObjectURL: () => 'blob:faux', revokeObjectURL: () => {} },
        alert: () => {},
        JSZip: FauxZip
    };
    const win = chargerScript('js/travaux-archivage.js', stubs, {
        addEventListener: () => {}, removeEventListener: () => {},
        estModeAnonymisation: () => anonyme === true
    });
    return { archivage: win.travauxArchivage, entrees, telecharges };
}

const chemins = (entrees) => entrees.map(e => e.chemin);
const toutLeTexte = (entrees) => entrees.map(e => e.chemin + '\n' + (typeof e.contenu === 'string' ? e.contenu : '')).join('\n');

describe('#948 · en anonymisation, l\'archive ne porte ni nom ni DA', () => {
    it('export du groupe, par élève et production : dossiers et copies anonymes, rangés, annotée comprise', async () => {
        const { archivage, entrees } = monter({ anonyme: true });
        await archivage.exporterTravaux({});
        expect(chemins(entrees).filter(c => !c.endsWith('.json'))).toEqual([
            'Élève 32/Artefact 1/Élève 32_Artefact 1_1.pdf',
            'Élève 32/Artefact 1/Élève 32_Artefact 1_1_annote.pdf',
            'Élève 32/Artefact 1/Élève 32_Artefact 1_2.pdf'
        ]);
        const texte = toutLeTexte(entrees);
        expect(texte).not.toContain(NOM);
        expect(texte).not.toContain(DA);
    });

    it('forme « par élève » : le titre de la production reste dans le nom de la copie', async () => {
        const { archivage, entrees } = monter({ anonyme: true });
        await archivage.exporterTravaux({ forme: 'etudiant' });
        expect(chemins(entrees).filter(c => !c.endsWith('.json'))).toEqual([
            'Élève 32/Élève 32_Artefact 1_1.pdf',
            'Élève 32/Élève 32_Artefact 1_1_annote.pdf',
            'Élève 32/Élève 32_Artefact 1_2.pdf'
        ]);
    });

    it('_evaluations.json : le DA réel est retiré de chaque évaluation', async () => {
        const { archivage, entrees } = monter({ anonyme: true });
        await archivage.exporterTravaux({});
        const evals = JSON.parse(entrees.find(e => e.chemin === '_evaluations.json').contenu);
        expect(evals[0].etudiantDA).toBe('Élève 32');
        expect(evals[0]).not.toHaveProperty('etudiantDAReel');
        expect(evals[0]).not.toHaveProperty('etudiantDAffichage');
    });

    it('une copie illisible : le bilan et _resume.json la nomment sans nom ni DA', async () => {
        const { archivage, entrees } = monter({
            anonyme: true,
            recupererBlob: async (id) => { if (id === 'F2') throw new Error('Blob illisible'); return { taille: 1 }; }
        });
        const r = await archivage.exporterTravaux({});
        expect(r.echecs).toEqual(['Élève 32 / Élève 32_Artefact 1_2.pdf — Blob illisible']);
        const resume = entrees.find(e => e.chemin === '_resume.json').contenu;
        expect(resume).not.toContain(NOM);
        expect(resume).not.toContain(DA);
    });

    it('export d\'UN élève : dossier, copies, évaluations et nom du ZIP anonymes', async () => {
        const { archivage, entrees, telecharges } = monter({ anonyme: true });
        await archivage.lancerExportEtudiant(DA, { inclureAnnotes: true, inclureEvaluations: true });
        expect(chemins(entrees)).toEqual([
            'Élève 32/originaux/Élève 32_Artefact 1_1.pdf',
            'Élève 32/annotes/Élève 32_Artefact 1_1_annote.pdf',
            'Élève 32/originaux/Élève 32_Artefact 1_2.pdf',
            'Élève 32/evaluations.json'
        ]);
        expect(toutLeTexte(entrees)).not.toContain(DA);
        expect(telecharges).toEqual(['travaux_Élève 32.zip']);
    });

    it('filtre sur un élève (carte « Exporter des travaux ») : le nom du ZIP est anonyme', async () => {
        const { archivage, telecharges } = monter({ anonyme: true });
        await archivage.lancerExport({ da: DA });
        expect(telecharges).toHaveLength(1);
        expect(telecharges[0]).not.toContain(DA);
        expect(telecharges[0]).toContain('Élève 32');
    });
});

describe('#948 · hors anonymisation, rien ne change', () => {
    it('nom_prénom_DA et noms de fichiers d\'origine', async () => {
        const { archivage, entrees } = monter({ anonyme: false });
        await archivage.exporterTravaux({});
        expect(chemins(entrees).filter(c => !c.endsWith('.json'))).toEqual([
            `${NOM}_${PRENOM}_${DA}/Artefact 1/${NOM}_${DA}_Artefact_1_Remis_le_2026-09-15_09h46m28s.pdf`,
            `${NOM}_${PRENOM}_${DA}/Artefact 1/${NOM}_${DA}_Artefact_1_Remis_le_2026-09-15_09h46m28s_annote.pdf`,
            `${NOM}_${PRENOM}_${DA}/Artefact 1/${NOM}_${DA}_Artefact_1_Remis_le_2026-09-20_10h00m00s.pdf`
        ]);
        const evals = JSON.parse(entrees.find(e => e.chemin === '_evaluations.json').contenu);
        expect(evals[0].etudiantDA).toBe(DA);
    });
});

describe('#948 · l\'accesseur du mode, que le banc ci-dessus remplace par un stub', () => {
    it('modes.js expose estModeAnonymisation, qui compare modeActuel au mode anonymisation', () => {
        const src = readFileSync(path.join(racine, 'js/modes.js'), 'utf8');
        expect(src).toContain('window.estModeAnonymisation = estModeAnonymisation;');
        const corps = tranche(src, 'function estModeAnonymisation()', '\nwindow.MODES');
        expect(corps).toContain('return modeActuel === MODES.ANONYMISATION;');
    });
});

// R1 de la relecture de Cowork (25 sept. 2026) : la rétroaction générée commence
// par « Bonjour ‹prénom› » et elle est stockée avec le prénom réel. Les textes
// libres de `_evaluations.json` passent donc par le VRAI `anonymiserTexteRetroaction`
// (modes.js chargé ici, en mode anonymisation). Prénoms fictifs.
function monterModes({ anonyme = true, etudiants }) {
    const store = { modeApplication: anonyme ? 'anonymisation' : 'normal', test_groupeEtudiants: etudiants };
    const db = { getSync: (k, d) => (k in store ? store[k] : d), setSync: (k, v) => { store[k] = v; } };
    const cle = (k) => 'test_' + k;
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', cle };
    chargerScript('js/modes.js', { db, cle, doitRegenerer: false, obtenirPreference: () => null }, win);
    return win;
}

const ELEVES_FICTIFS = [
    { da: '2600201', prenom: 'Éloïse', nom: 'Gagnon' },
    { da: '2600202', prenom: 'René', nom: 'Lavoie' },
    { da: '2600203', prenom: 'Marie', nom: 'Côté' },
    { da: '2600204', prenom: 'Marie-Ève', nom: 'Roy' }
];

describe('#948 · R1 · anonymiserTexteRetroaction reconnaît tout le prénom', () => {
    it('prénom qui commence ou finit par une lettre accentuée, au milieu d\'une phrase', () => {
        const modes = monterModes({ etudiants: ELEVES_FICTIFS });
        const sortie = modes.anonymiserTexteRetroaction('Ton texte, Éloïse, rejoint celui de René.', '2600201');
        expect(sortie).not.toContain('Éloïse');
        expect(sortie).not.toContain('René');
    });

    it('prénom composé : « Marie-Ève » n\'est pas mangé par « Marie »', () => {
        const modes = monterModes({ etudiants: ELEVES_FICTIFS });
        const sortie = modes.anonymiserTexteRetroaction('Bonjour Marie-Ève, tu lis avec Marie.', '2600204');
        expect(sortie).not.toMatch(/Marie|Ève(?!\s?\d)/);
        expect(sortie).not.toContain('-Ève');
    });

    it('prénom saisi avec un surnom entre parenthèses : pas d\'erreur de motif, remplacé', () => {
        const modes = monterModes({ etudiants: [{ da: '2600205', prenom: 'Anne (Annie)', nom: 'Poirier' }] });
        const sortie = modes.anonymiserTexteRetroaction('Bonjour Anne (Annie), bravo.', '2600205');
        expect(sortie).toMatch(/^Bonjour Élève \d+, bravo\.$/);
    });

    it('un prénom inclus dans un mot plus long n\'est pas touché ; hors anonymisation, rien ne change', () => {
        const modes = monterModes({ etudiants: ELEVES_FICTIFS });
        expect(modes.anonymiserTexteRetroaction('Renée et Mariel', null)).toBe('Renée et Mariel');
        const normal = monterModes({ anonyme: false, etudiants: ELEVES_FICTIFS });
        expect(normal.anonymiserTexteRetroaction('Bonjour Éloïse', '2600201')).toBe('Bonjour Éloïse');
    });
});

describe('#948 · R1 · _evaluations.json ne porte aucun prénom réel', () => {
    it('rétroaction finale, rétroaction de critère et note d\'intégrité passent par l\'anonymisation', async () => {
        const modes = monterModes({ etudiants: ELEVES_FICTIFS });
        const e = ELEVES_FICTIFS[0];
        const entrees = [];
        function FauxZip(prefixe = '') {
            this.file = (chemin, contenu) => { entrees.push({ chemin: prefixe + chemin, contenu }); };
            this.folder = (nom) => new FauxZip(prefixe + nom + '/');
            this.generateAsync = async () => ({ fauxBlob: true });
        }
        const store = {
            groupeEtudiants: [{ da: e.da, daReel: e.da, nom: '', prenom: 'Élève 1' }],
            productions: [{ id: 'P1', titre: 'Artefact 1' }],
            evaluationsSauvegardees: [{
                id: 'E1', etudiantDA: e.da, etudiantDAReel: e.da, etudiantNom: 'Élève 1', productionId: 'P1',
                retroactionFinale: 'Bonjour Éloïse, ton analyse progresse.',
                notesIntegrite: 'Parlé avec Éloïse le 20 septembre.',
                criteres: [{ critereId: 'C1', retroaction: 'Éloïse, cite le texte.' }, { critereId: 'C2' }]
            }]
        };
        const win = chargerScript('js/travaux-archivage.js', {
            document: { getElementById: () => null, createElement: () => ({ click() {} }) },
            db: { getSync: (_k, d) => d, setSync: () => {} },
            cle: (k) => k,
            obtenirDonneesSelonMode: (k) => store[k] || [],
            obtenirTrimestreActif: () => ({ id: 'a2026', nom: 'Automne 2026' }),
            anonymiserTexteRetroaction: modes.anonymiserTexteRetroaction,
            travauxStockage: {
                obtenirFichiersGroupeActif: () => [{ id: 'F1', etudiantDA: e.da, productionId: 'P1', typeMIME: 'application/pdf', nomFichier: 'copie.pdf' }],
                obtenirAnnotationFichier: () => null,
                recupererBlob: async () => ({ taille: 1 })
            },
            travauxExportPDF: {},
            URL: { createObjectURL: () => 'blob:faux', revokeObjectURL: () => {} },
            JSZip: FauxZip
        }, { addEventListener() {}, removeEventListener() {}, estModeAnonymisation: modes.estModeAnonymisation });
        await win.travauxArchivage.exporterTravaux({});
        const brut = entrees.find(x => x.chemin === '_evaluations.json').contenu;
        expect(brut).not.toContain('Éloïse');
        expect(brut).not.toContain(e.da);
        const [evaluation] = JSON.parse(brut);
        // Le numéro « Élève N » est tiré au hasard par genererMappingAnonyme.
        expect(evaluation.retroactionFinale).toMatch(/^Bonjour Élève \d+, ton analyse progresse\.$/);
        expect(evaluation.notesIntegrite).toMatch(/^Parlé avec Élève \d+ le 20 septembre\.$/);
        expect(evaluation.criteres[0].retroaction).toMatch(/^Élève \d+, cite le texte\.$/);
        expect(evaluation.criteres[1].critereId).toBe('C2');
    });
});
