import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #611 (S5 du plan « chaîne d'importation des travaux », constat S3 de l'audit
// du 30 août 2026) — UN FICHIER NE DOIT JAMAIS ÊTRE DONNÉ AU MAUVAIS ÉLÈVE
// PARCE QUE SON NOM EST UNE SOUS-CHAÎNE DE CELUI D'UN AUTRE.
//
// L'appariement par nom cherchait la sous-chaîne : `nomLower.includes(nom)`.
// Trois conséquences, toutes mesurées ici.
//
// 1. LE MAUVAIS ÉLÈVE. Le groupe compte `Martin, Léa` et `Martineau, Yann`.
//    Le fichier `Martineau_Yann_devoir.pdf` contient la chaîne « martin », donc
//    il partait chez Léa Martin — celle des deux qui précède dans la liste. Le
//    fichier était ensuite stocké sous SON DA, et le bandeau « sans DA » ne se
//    déclenchait pas : rien n'avertissait que l'association était FAUSSE.
//    Pire, un nom qui n'appartient à personne (`Martinez`) atterrissait quand
//    même chez Martin.
//
// 2. LE SILENCE. `Roy` (3 lettres, sous le seuil `nom.length > 3`) et `Côté`
//    (accent dans la fiche, absent du nom de fichier) n'étaient JAMAIS
//    reconnus. Sûr, mais muet : l'enseignant associe à la main sans savoir
//    pourquoi.
//
// 3. LE PREMIER ARRIVÉ GAGNE. Deux `Tremblay` dans le groupe : le fichier
//    `Tremblay_devoir.pdf` allait au premier de la liste, sans que l'ambiguïté
//    soit dite. Un nom ambigu doit rendre `null` — et laisser l'enseignant
//    trancher — plutôt que de deviner.
//
// ⚠ LE PIÈGE DU CORRECTIF, et il ne se voit pas à la lecture du diff de
// l'audit : le prédicat est un `.every()` sur les tokens du nom de la FICHE.
// Une fiche dont le nom ne produit AUCUN token après normalisation (nom fait
// de ponctuation, ou écrit dans un alphabet que `[^a-z0-9]+` efface) donne
// `[].every(...) === true` : elle s'apparie à TOUS les fichiers. Le dégât ne
// s'arrête pas à cette fiche — elle rend ambigu, donc `null`, tout appariement
// légitime du groupe. D'où la garde « liste de tokens non vide », verrouillée
// par le dernier cas de ce fichier.
//
// La logique vit à DEUX endroits qui devaient rester d'accord : la fonction du
// groupe actif (`trouverEtudiantParNom`, atteinte ici par
// `ajouterFichiersEnAttente`) et la recherche sur la collection brute
// (`chercherParNomEtendu`, atteinte par `detecterFichiersAutreGC`). S5 les
// fusionne ; les deux derniers blocs vérifient que la fusion tient des deux
// côtés.

const ETUDIANTS = [
    { da: '1000001', nom: 'Martin', prenom: 'Léa', coursId: 'c1', groupe: '00001' },
    { da: '1000002', nom: 'Martineau', prenom: 'Yann', coursId: 'c1', groupe: '00001' },
    { da: '1000003', nom: 'Roy', prenom: 'Sam', coursId: 'c1', groupe: '00001' },
    { da: '1000004', nom: 'Côté', prenom: 'Ida', coursId: 'c1', groupe: '00001' },
    { da: '1000005', nom: 'Nguyen Tran', prenom: 'Kim', coursId: 'c1', groupe: '00001' },
    { da: '1000006', nom: 'Saint-Pierre', prenom: 'Noé', coursId: 'c1', groupe: '00001' },
    { da: '1000007', nom: 'Tremblay', prenom: 'Alex', coursId: 'c1', groupe: '00001' },
    { da: '1000008', nom: 'Tremblay', prenom: 'Jo', coursId: 'c1', groupe: '00001' }
];

const OCTETS_PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);

// Aucun de ces noms de fichier ne porte sept chiffres contigus : `detecterDA`
// rend '' et l'appariement passe forcément par le NOM, jamais par le DA.
function faireFichier(nom) {
    const blob = new Blob([OCTETS_PDF], { type: 'application/pdf' });
    blob.name = nom;
    blob.lastModified = Date.UTC(2026, 7, 30, 9, 0, 0);
    return blob;
}

const STOCKAGE_MUET = {
    obtenirFichiersGroupeActif: () => [],
    obtenirFichiersTravaux: () => [],
    genererMiniaturePDF: async () => ({ thumbnail: '', nombrePages: 1 }),
    genererMiniatureImage: async () => '',
    stockerThumbnail: () => {}
};

function monter({ etudiants = ETUDIANTS, brut = [], groupesCours = [] } = {}) {
    const magasin = { groupeEtudiants: brut, groupesCours: groupesCours };
    return chargerScript('js/travaux-import.js', {
        obtenirDonneesSelonMode: (quoi) => (quoi === 'groupeEtudiants' ? etudiants : []),
        cle: (k) => k,
        db: {
            getSync: (k, defaut) => (Object.prototype.hasOwnProperty.call(magasin, k) ? magasin[k] : defaut),
            setSync: () => {}
        },
        travauxStockage: STOCKAGE_MUET,
        notifications: { succes: () => {}, erreur: () => {}, info: () => {} }
    });
}

// Passe par l'entrée réelle : `ajouterFichiersEnAttente` → `preparerFichier` →
// `trouverEtudiantParNom`. Rend le DA associé, ou `null`.
function apparier(nomFichier, options) {
    const win = monter(options);
    const [prepare] = win.travauxImport.ajouterFichiersEnAttente([faireFichier(nomFichier)]);
    return prepare.etudiantAssocie ? prepare.etudiantAssocie.da : null;
}

/* -------------------------------------------------------------------------
   1. Aucune association par sous-chaîne
   ---------------------------------------------------------------------- */

describe('#611 — plus aucune association par sous-chaîne', () => {
    it('Martineau_Yann va chez Martineau, pas chez Martin', () => {
        expect(apparier('Martineau_Yann_devoir.pdf')).toBe('1000002');
    });

    it('Martin_Lea va chez Martin, pas chez Martineau', () => {
        expect(apparier('Martin_Lea_devoir.pdf')).toBe('1000001');
    });

    it('un nom qui n\'appartient à personne n\'est donné à personne', () => {
        // « Martinez » CONTIENT « martin » : c'est le cas qui donnait le
        // fichier d'un inconnu à une élève du groupe.
        expect(apparier('Martinez_devoir.pdf')).toBe(null);
    });
});

/* -------------------------------------------------------------------------
   2. Les noms jusqu'ici invisibles deviennent reconnus
   ---------------------------------------------------------------------- */

describe('#611 — les noms courts et accentués sont reconnus', () => {
    it('Roy (3 lettres) est reconnu par le nom seul', () => {
        expect(apparier('Roy_travail.pdf')).toBe('1000003');
    });

    it('Cote sans accent trouve la fiche Côté', () => {
        expect(apparier('Cote_Ida_final.pdf')).toBe('1000004');
    });

    it('l\'ordre nom/prénom dans le fichier est indifférent', () => {
        expect(apparier('Ida_Cote.pdf')).toBe('1000004');
    });

    it('un nom composé de deux mots est reconnu', () => {
        expect(apparier('Nguyen_Tran_Kim_devoir.pdf')).toBe('1000005');
    });
});

/* -------------------------------------------------------------------------
   3. Mots entiers : les deux tokens d'un nom composé sont exigés
   ---------------------------------------------------------------------- */

describe('#611 — les tokens sont exigés en entier', () => {
    it('Saint-Pierre est reconnu quand les deux tokens sont là', () => {
        expect(apparier('Saint-Pierre_Noe.pdf')).toBe('1000006');
    });

    it('la moitié d\'un nom composé ne suffit pas', () => {
        // Règle documentée (T5.1) : « Pierre » seul n'apparie pas
        // « Saint-Pierre ». Un demi-nom n'est pas une identification.
        expect(apparier('Pierre_Noe_travail.pdf')).toBe(null);
    });
});

/* -------------------------------------------------------------------------
   4. L'ambiguïté rend null, elle ne devine pas
   ---------------------------------------------------------------------- */

describe('#611 — deux homonymes ne sont pas départagés au hasard', () => {
    it('deux Tremblay et un nom seul : aucun des deux', () => {
        expect(apparier('Tremblay_devoir.pdf')).toBe(null);
    });

    it('le prénom lève l\'ambiguïté, et ce n\'est pas le premier de la liste', () => {
        // L'ancienne boucle rendait Alex (premier arrivé) même quand le
        // fichier nommait Jo : elle testait les deux branches ÉLÈVE PAR ÉLÈVE.
        expect(apparier('Tremblay_Jo_devoir.pdf')).toBe('1000008');
    });

    it('deux fiches homonymes de nom ET de prénom : aucune', () => {
        const jumelles = [
            { da: '1000011', nom: 'Roy', prenom: 'Sam' },
            { da: '1000012', nom: 'Roy', prenom: 'Sam' }
        ];
        expect(apparier('Roy_Sam_devoir.pdf', { etudiants: jumelles })).toBe(null);
    });
});

/* -------------------------------------------------------------------------
   5. La garde des tokens vides — le piège du .every()
   ---------------------------------------------------------------------- */

describe('#611 — une fiche sans token ne s\'apparie à rien', () => {
    it('une fiche dont le nom ne produit aucun token n\'éteint pas l\'appariement du groupe', () => {
        // Sans la garde : `[].every(...)` rend `true`, la fiche « ??? »
        // s'apparie à TOUS les fichiers, et Roy devient ambigu donc `null`.
        const avecFicheVide = [
            { da: '1000010', nom: '???', prenom: '...' },
            { da: '1000003', nom: 'Roy', prenom: 'Sam' }
        ];
        expect(apparier('Roy_travail.pdf', { etudiants: avecFicheVide })).toBe('1000003');
    });
});

/* -------------------------------------------------------------------------
   6. La collection brute : `detecterFichiersAutreGC` tient le même contrat
   ---------------------------------------------------------------------- */

// T5.3 — `chercherParNomEtendu` portait une COPIE de la logique fautive. Elle
// est retirée : la même fonction sert, sur la collection brute cette fois. Ces
// deux cas mesurent le résultat visible — l'avertissement « ce fichier est
// celui d'un autre groupe-cours » — et non la fonction interne.

const GROUPES_COURS = [
    { id: 'gc1', coursId: 'c1', groupeNum: '00001', actif: true },
    { id: 'gc2', coursId: 'c1', groupeNum: '00002', actif: false },
    { id: 'gc3', coursId: 'c1', groupeNum: '00003', actif: false }
];

// Le groupe ACTIF ne contient qu'Aubin, qu'aucun de ces deux fichiers ne
// nomme : `trouverEtudiantParNom` rend donc `null` AVANT ET APRÈS le
// correctif, et seule la recherche sur la collection brute décide. C'est ce
// qui isole la copie locale — sans cette précaution, un rouge viendrait de la
// fonction du groupe actif et ne dirait rien de la copie.
const ACTIF = [{ da: '1000009', nom: 'Aubin', prenom: 'Zoé', coursId: 'c1', groupe: '00001' }];

function signalements(nomFichier, brut) {
    const win = monter({ etudiants: ACTIF, brut: brut, groupesCours: GROUPES_COURS });
    win.travauxImport.ajouterFichiersEnAttente([faireFichier(nomFichier)]);
    return win.travauxImport.detecterFichiersAutreGC();
}

describe('#611 — la recherche sur la collection brute suit la même règle', () => {
    it('un nom accentué de l\'autre groupe est enfin signalé', () => {
        // Avant : la copie locale butait sur l'accent, ne trouvait personne, et
        // le fichier d'Ida Côté entrait dans le groupe actif sans un mot.
        const brut = [
            { da: '1000009', nom: 'Aubin', prenom: 'Zoé', coursId: 'c1', groupe: '00001' },
            { da: '1000004', nom: 'Côté', prenom: 'Ida', coursId: 'c1', groupe: '00002' }
        ];
        const vus = signalements('Cote_Ida_final.pdf', brut);
        expect(vus.length).toBe(1);
        expect(vus[0].gcId).toBe('gc2');
        expect(vus[0].das).toEqual(['1000004']);
    });

    it('un nom inconnu ne déclenche pas une fausse alerte par sous-chaîne', () => {
        // `Martinez` contient « martin » : la copie locale désignait le groupe
        // de Martin, et l'écran annonçait un fichier venu d'un autre
        // groupe-cours pour un nom que personne ne porte.
        const brut = [
            { da: '1000009', nom: 'Aubin', prenom: 'Zoé', coursId: 'c1', groupe: '00001' },
            { da: '1000001', nom: 'Martin', prenom: 'Léa', coursId: 'c1', groupe: '00002' }
        ];
        expect(signalements('Martinez_devoir.pdf', brut)).toEqual([]);
    });

    it('le nom ET le prénom l\'emportent sur un homonyme placé plus tôt', () => {
        // L'ORDRE DE PRÉFÉRENCE, verrouillé SUR CE CHEMIN AUSSI. La fusion des
        // deux implémentations change le comportement de `detecterFichiersAutreGC`
        // par effet de bord : l'ancienne copie tranchait élève par élève, donc
        // Alex Tremblay — premier de la liste, reconnu par le nom seul —
        // l'emportait sur Jo Tremblay que le fichier nomme pourtant en entier.
        // Le bandeau désignait alors le mauvais groupe-cours. Sans ce cas, une
        // retouche future de `_apparierParNom` ferait rougir l'import seul et
        // laisserait ce chemin se dégrader en silence.
        const brut = [
            { da: '1000009', nom: 'Aubin', prenom: 'Zoé', coursId: 'c1', groupe: '00001' },
            { da: '1000007', nom: 'Tremblay', prenom: 'Alex', coursId: 'c1', groupe: '00002' },
            { da: '1000008', nom: 'Tremblay', prenom: 'Jo', coursId: 'c1', groupe: '00003' }
        ];
        const vus = signalements('Tremblay_Jo_devoir.pdf', brut);
        expect(vus.length).toBe(1);
        expect(vus[0].gcId).toBe('gc3');
        expect(vus[0].das).toEqual(['1000008']);
    });
});
