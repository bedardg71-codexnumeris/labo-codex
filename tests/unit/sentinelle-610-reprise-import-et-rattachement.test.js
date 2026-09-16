import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #610 (S4 du plan « chaîne d'importation des travaux », constats S1 et S2 de
// l'audit du 30 août 2026) — UN IMPORT INTERROMPU PUIS REJOUÉ NE DOIT PAS
// CRÉER DE DOUBLON MUET, ET UN RE-DÉPÔT NE DOIT JAMAIS RATTACHER UN BLOB À LA
// MAUVAISE ENTRÉE.
//
// S1 — LE DOUBLON QUE PERSONNE NE VOIT. La détection de doublon exige
// `etudiantDA && productionId`. Or la confirmation permet explicitement
// d'importer « sans production associée », et le bandeau « sans DA » n'est pas
// bloquant. Scénario mesuré : 40 photos sans DA, l'iPad se met en veille au
// 25e fichier ; au retour la file affiche 40 fichiers « à re-déposer » (le
// statut `importe` n'était persisté qu'APRÈS le dernier) ; l'enseignant
// re-dépose et confirme. 25 fichiers en double, aucun avertissement, et
// l'écran annonce « 40 fichier(s) importé(s) ».
//
// S2 — LE BLOB QUI CHANGE D'ÉLÈVE. `reattacherBlobs` apparie par NOM SEUL.
// Deux entrées `devoir.pdf` associées à la main à A et à B, rechargement,
// re-dépôt des deux en une sélection : le premier `File` rendu par le
// navigateur prend la première entrée libre, quel que soit son contenu. Le
// travail de B est stocké sous le DA de A, sans trace.
//
// ⚠ LE PIÈGE DU CORRECTIF : `tailleFichier` est la taille APRÈS préparation —
// un HEIC converti en JPEG n'a plus la taille du fichier déposé. Comparer
// `tailleFichier` au re-dépôt échouerait sur toutes les photos d'iPhone. D'où
// `tailleOriginale`, figée à la taille du `File` déposé.

const ETUDIANTS = [
    { da: '1000001', nom: 'Alonzo', prenom: 'Ana' },
    { da: '1000002', nom: 'Bilodeau', prenom: 'Bo' }
];

const OCTETS_PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);

// Un Blob nommé, de taille contrôlée : `preparerFichier` lit name/size,
// `validerMagicBytes` lit les quatre premiers octets.
function faireFichier(nom, taille, type = 'application/pdf') {
    const bourrage = new Uint8Array(Math.max(0, taille - OCTETS_PDF.length));
    const blob = new Blob([OCTETS_PDF, bourrage], { type });
    blob.name = nom;
    blob.lastModified = Date.UTC(2026, 7, 30, 9, 0, 0);
    return blob;
}

let win;
let magasin;

function monter() {
    magasin = [];
    const travauxStockage = {
        obtenirFichiersGroupeActif: () => magasin,
        obtenirFichiersTravaux: () => magasin,
        ajouterFichierTravail: (meta) => {
            const f = Object.assign({ id: 'ft_' + (magasin.length + 1) }, meta);
            magasin.push(f);
            return f;
        },
        stockerBlob: async () => true,
        supprimerFichierTravail: (id) => {
            const i = magasin.findIndex(f => f.id === id);
            if (i !== -1) magasin.splice(i, 1);
        },
        genererMiniaturePDF: async () => ({ thumbnail: '', nombrePages: 1 }),
        genererMiniatureImage: async () => '',
        stockerThumbnail: () => {}
    };
    return chargerScript('js/travaux-import.js', {
        obtenirDonneesSelonMode: (quoi) => (quoi === 'groupeEtudiants' ? ETUDIANTS : []),
        travauxStockage,
        db: { getSync: () => null, setSync: () => {} },
        notifications: { succes: () => {}, erreur: () => {}, info: () => {} }
    });
}

beforeEach(() => { win = monter(); });

/* -------------------------------------------------------------------------
   S1 — le doublon des fichiers non identifiés
   ---------------------------------------------------------------------- */

describe('#610 · S1 — un fichier sans DA re-déposé est reconnu comme doublon', () => {

    // ⚠ LIMITE DU BANC, mesurée le 30 août : ces cas passent par des PDF, pas
    // des images. `compresserImageSiNecessaire` construit un `new Image()`, que
    // Node n'a pas — importer une image au banc lève `ReferenceError: Image is
    // not defined` AVANT d'atteindre la détection de doublon. Le type n'entre
    // pas dans la décision (la comparaison porte sur `nomFichierLea` et
    // `tailleFichier`), donc le PDF éprouve exactement le même chemin. Le
    // scénario réel — 40 photos d'iPad — reste couvert par le test manuel T4.7.
    it('deux imports du MÊME fichier sans DA : le second est un doublon', async () => {
        win.travauxImport.ajouterFichiersEnAttente([faireFichier('photo-sans-da.pdf', 5000)]);
        const premier = await win.travauxImport.importerFichier(
            win.travauxImport.obtenirFileDAttente()[0], '');
        expect(premier.doublon).toBeFalsy();

        // L'enseignant re-dépose le même fichier après une interruption.
        win.travauxImport.viderFileDAttente();
        win.travauxImport.ajouterFichiersEnAttente([faireFichier('photo-sans-da.pdf', 5000)]);
        const second = await win.travauxImport.importerFichier(
            win.travauxImport.obtenirFileDAttente()[0], '');

        expect(second.doublon).toBe(true);
        expect(second.critere).toBe('nom-taille');
    });

    it('le doublon nomme le fichier existant, pour que la modale puisse le montrer', async () => {
        win.travauxImport.ajouterFichiersEnAttente([faireFichier('copie.pdf', 4000)]);
        await win.travauxImport.importerFichier(win.travauxImport.obtenirFileDAttente()[0], '');
        win.travauxImport.viderFileDAttente();
        win.travauxImport.ajouterFichiersEnAttente([faireFichier('copie.pdf', 4000)]);
        const r = await win.travauxImport.importerFichier(win.travauxImport.obtenirFileDAttente()[0], '');

        expect(r.fichierExistant).toBeDefined();
        expect(r.fichierExistant.nomFichierLea).toBe('copie.pdf');
    });

    it('même nom mais TAILLE différente : ce n\'est pas un doublon', async () => {
        // Deux élèves peuvent déposer « devoir.pdf » — seul le contenu tranche.
        win.travauxImport.ajouterFichiersEnAttente([faireFichier('devoir.pdf', 4000)]);
        await win.travauxImport.importerFichier(win.travauxImport.obtenirFileDAttente()[0], '');
        win.travauxImport.viderFileDAttente();
        win.travauxImport.ajouterFichiersEnAttente([faireFichier('devoir.pdf', 9000)]);
        const r = await win.travauxImport.importerFichier(win.travauxImport.obtenirFileDAttente()[0], '');

        expect(r.doublon).toBeFalsy();
        expect(magasin).toHaveLength(2);
    });

    it('un fichier PLEINEMENT identifié garde la détection par (DA, production)', async () => {
        // La clé forte reste prioritaire : le critère nom-taille ne la remplace pas.
        win.travauxImport.ajouterFichiersEnAttente([
            faireFichier('Alonzo_1000001_Essai__Remis_le_2026-08-21_11h36m32s.pdf', 4000)
        ]);
        await win.travauxImport.importerFichier(win.travauxImport.obtenirFileDAttente()[0], 'PROD_1');
        win.travauxImport.viderFileDAttente();
        // Nom DIFFÉRENT, même élève et même production : nom-taille ne le verrait pas.
        win.travauxImport.ajouterFichiersEnAttente([
            faireFichier('Alonzo_1000001_Essai_v2__Remis_le_2026-08-22_11h36m32s.pdf', 7000)
        ]);
        const r = await win.travauxImport.importerFichier(win.travauxImport.obtenirFileDAttente()[0], 'PROD_1');

        expect(r.doublon).toBe(true);
        expect(r.critere).toBeUndefined();   // clé (DA, production), pas nom-taille
    });

    it('les contournements assumés restent des contournements', async () => {
        win.travauxImport.ajouterFichiersEnAttente([faireFichier('reprise.pdf', 4000)]);
        await win.travauxImport.importerFichier(win.travauxImport.obtenirFileDAttente()[0], '');

        for (const drapeau of ['remplaceExistant', 'livrableAdditionnel']) {
            win.travauxImport.viderFileDAttente();
            win.travauxImport.ajouterFichiersEnAttente([faireFichier('reprise.pdf', 4000)]);
            const prepare = win.travauxImport.obtenirFileDAttente()[0];
            prepare[drapeau] = true;
            const r = await win.travauxImport.importerFichier(prepare, '');
            expect(r.doublon, drapeau).toBeFalsy();
        }
    });
});

/* -------------------------------------------------------------------------
   S2 — le rattachement des blobs après rechargement
   ---------------------------------------------------------------------- */

describe('#610 · S2 — un blob ne se rattache qu\'à l\'entrée dont il a le nom ET la taille', () => {

    it('preparerFichier fige la taille d\'ORIGINE, distincte de tailleFichier', () => {
        win.travauxImport.ajouterFichiersEnAttente([faireFichier('devoir.pdf', 4000)]);
        const f = win.travauxImport.obtenirFileDAttente()[0];
        expect(f.tailleOriginale).toBe(4000);
    });

    it('deux homonymes de tailles différentes : chaque blob va à SA ligne', () => {
        win.travauxImport.ajouterFichiersEnAttente([
            faireFichier('devoir.pdf', 4000),
            faireFichier('devoir.pdf', 9000)
        ]);
        const queue = win.travauxImport.obtenirFileDAttente();
        queue[0].etudiantDA = '1000001';
        queue[1].etudiantDA = '1000002';
        // Simuler le rechargement : les blobs sont perdus, les métadonnées restent.
        queue.forEach(f => { f.fichier = null; f.fichierOriginal = null; });

        // Le navigateur rend les fichiers dans l'ordre INVERSE du dépôt.
        const bilan = win.travauxImport.reattacherBlobs([
            faireFichier('devoir.pdf', 9000),
            faireFichier('devoir.pdf', 4000)
        ]);

        expect(bilan.rattaches).toBe(2);
        expect(bilan.ignores).toEqual([]);
        // Chaque élève récupère SON travail — c'est tout l'enjeu.
        expect(queue.find(f => f.etudiantDA === '1000001').fichier.size).toBe(4000);
        expect(queue.find(f => f.etudiantDA === '1000002').fichier.size).toBe(9000);
    });

    it('un fichier dont la taille ne correspond à rien est IGNORÉ, et dit', () => {
        win.travauxImport.ajouterFichiersEnAttente([faireFichier('devoir.pdf', 4000)]);
        const queue = win.travauxImport.obtenirFileDAttente();
        queue.forEach(f => { f.fichier = null; f.fichierOriginal = null; });

        const bilan = win.travauxImport.reattacherBlobs([faireFichier('devoir.pdf', 8888)]);

        expect(bilan.rattaches).toBe(0);
        expect(bilan.ignores).toEqual(['devoir.pdf']);
        expect(queue[0].fichier).toBeNull();
    });

    it('reattacherBlobs rend un OBJET, jamais un nombre nu', () => {
        const bilan = win.travauxImport.reattacherBlobs([]);
        expect(typeof bilan).toBe('object');
        // #884 : `rejeu` (promesse des réglages réappliqués) s'y ajoute.
        expect(bilan).toMatchObject({ rattaches: 0, ignores: [] });
    });
});
