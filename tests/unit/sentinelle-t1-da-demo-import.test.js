import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// T1 — CHANTIER DU DÉMO (audit du 5 oct. 2026, §5.2 et §5 bis).
//
// Symptôme vécu par Grégoire le 5 oct. : deux photos d'une même remise, au
// format Léa et portant un DA du pack démo (« Curie_DEMO011_Artefact_n9_revise
// _Remis_le_…_12h31m39s.jpg » puis « …_12h32m13s.jpg »), ouvrent « Doublon
// détecté » au lieu de s'assembler. Cause : aucun motif de `PATTERNS_DA` ne lit
// `DEMO011` (ils cherchent sept chiffres), donc `parseLea.da` est vide, donc
// pas de `groupeDocumentId`, donc chaque page est un document — et la seconde
// heurte la garde (etudiantDA, productionId).
//
// ⚠ La clé de regroupement de #873 n'est PAS en cause : l'horodatage n'y
// revient pas (décision de Grégoire du 15 sept.). Les deux pages ont ici des
// secondes différentes exprès.
//
// Trois verrous : la lecture en démo (et la coupe du nom à la position du
// motif, constat C5), l'assemblage sans doublon, et l'absence de tout
// changement hors démo.

const ETUDIANTS = [
    { da: 'DEMO011', nom: 'Curie', prenom: 'Marie' },
    { da: 'DEMO004', nom: 'Fictif', prenom: 'Lubin' },
    { da: '9000058', nom: 'Bourdages', prenom: 'Alma' }
];

const OCTETS_JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);

function faireFichier(nom) {
    const blob = new Blob([OCTETS_JPEG], { type: 'image/jpeg' });
    blob.name = nom;
    blob.lastModified = Date.UTC(2025, 11, 1, 12, 0, 0);
    return blob;
}

const PAGE_1 = 'Curie_DEMO011_Artefact_n9_revise_Remis_le_2026-05-11_12h31m39s.jpg';
const PAGE_2 = 'Curie_DEMO011_Artefact_n9_revise_Remis_le_2026-05-11_12h32m13s.jpg';

let win;
let enDemo;

beforeEach(() => {
    enDemo = true;
    win = chargerScript('js/travaux-import.js', {
        obtenirDonneesSelonMode: (quoi) => (quoi === 'groupeEtudiants' ? ETUDIANTS : []),
        // Renvoi par fermeture : le mode se bascule d'un essai à l'autre sans recharger.
        estEnModeDemo: () => enDemo,
        travauxStockage: {
            obtenirFichiersGroupeActif: () => [],
            ajouterFichierTravail: (meta) => meta,
            stockerBlob: async () => true,
            supprimerFichierTravail: () => {},
            genererMiniaturePDF: async () => ({ thumbnail: '', nombrePages: 1 }),
            genererMiniatureImage: async () => '',
            stockerThumbnail: () => {}
        },
        db: { getSync: () => null, setSync: () => {} },
        notifications: { succes: () => {}, erreur: () => {}, info: () => {} }
    });
});

describe('T1 — en démo, le DA du pack est lu', () => {

    it('lit DEMO011 dans un nom au format Léa', () => {
        const r = win.travauxImport.parserNomFichierLea(PAGE_1);
        expect(r.da).toBe('DEMO011');
        expect(r.nom).toBe('Curie');
        expect(r.nomProduction).toBe('Artefact n9 revise');
    });

    it('normalise « demo004 » en DEMO004 et coupe nom et production à la position du motif (C5)', () => {
        const r = win.travauxImport.parserNomFichierLea('X_Y_demo004_Artefact_1_Remis_le_2025-12-01_10h00m00s.jpg');
        expect(r.da).toBe('DEMO004');
        expect(r.nom).toBe('X Y');
        expect(r.nomProduction).toBe('Artefact 1');
    });

    it('tolère l\'accent, composé ou décomposé', () => {
        expect(win.travauxImport.detecterDA('Fictif_démo004_x.jpg')).toBe('DEMO004');
        expect(win.travauxImport.detecterDA('Fictif_Démo004_x.jpg')).toBe('DEMO004');
    });

    it('ne lit pas un DEMO suivi de plus de trois chiffres, ni collé à un mot', () => {
        expect(win.travauxImport.detecterDA('Curie_DEMO0111_x.jpg')).toBe('');
        expect(win.travauxImport.detecterDA('Curie_pseudodemo011_x.jpg')).toBe('');
    });

    it('les sept chiffres gardent la priorité', () => {
        expect(win.travauxImport.detecterDA('Bourdages_9000058_DEMO011_x.jpg')).toBe('9000058');
    });
});

describe('T1 — en démo, deux pages d\'une même remise forment UN document', () => {

    it('un seul groupe, deux pages, l\'élève du pack associé', () => {
        win.travauxImport.ajouterFichiersEnAttente([faireFichier(PAGE_1), faireFichier(PAGE_2)]);
        const groupes = win.travauxImport.regrouperParDocument();
        expect(groupes.size).toBe(1);
        const pages = [...groupes.values()][0];
        expect(pages).toHaveLength(2);
        expect(pages.every(f => f.etudiantAssocie && f.etudiantAssocie.da === 'DEMO011')).toBe(true);
    });

    it('aucun doublon annoncé', () => {
        win.travauxImport.setProductionGlobale('prod_artefact_9');
        win.travauxImport.ajouterFichiersEnAttente([faireFichier(PAGE_1), faireFichier(PAGE_2)]);
        expect(win.travauxImport.detecterDoublonsStockage()).toEqual([]);
    });
});

describe('T1 — hors démo, rien ne change', () => {

    it('DEMO011 n\'est pas un DA', () => {
        enDemo = false;
        expect(win.travauxImport.detecterDA('DEMO010_x.pdf')).toBe('');
        expect(win.travauxImport.parserNomFichierLea(PAGE_1).da).toBe('');
    });

    it('un DA à sept chiffres se lit et se coupe comme avant', () => {
        enDemo = false;
        const r = win.travauxImport.parserNomFichierLea(
            'Bourdages_9000058_Portrait_de_lecteur__Remis_le_2026-08-21_11h36m32s.jpg');
        expect(r.da).toBe('9000058');
        expect(r.nom).toBe('Bourdages');
        expect(r.nomProduction).toBe('Portrait de lecteur');
    });
});
