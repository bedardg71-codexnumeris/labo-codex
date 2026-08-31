import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #612 · T6.3 (S6 du plan « chaîne d'importation des travaux », constat S4 de
// l'audit du 30 août 2026) — UN DA QUI NE CORRESPOND À PERSONNE DOIT ÊTRE DIT
// AVANT L'IMPORT.
//
// LE DÉFAUT. Le seul avertissement pré-import visait les fichiers *sans* DA
// (`detecterFichiersSansDA`). Un DA FAUX passait sans un mot : faute de frappe,
// `12345678_devoir.pdf` tronqué en `2345678` par `PATTERNS_DA[2]`, ou fichier
// d'un élève qui n'est pas inscrit ici. Le fichier était alors stocké sous ce
// DA inexistant (`etudiantDA: etudiant ? etudiant.da : daDetecte`,
// `travaux-import.js:608`) — identifié, mais dans un groupe où l'élève n'existe
// pas. Il ne restait visible que dans la grille de l'onglet Importer, sous
// « Inconnu », que l'enseignant ne consulte pas pour évaluer.
//
// CE QUE CE BANC VERROUILLE : le détecteur, et surtout sa PARTITION avec
// `detecterFichiersSansDA`. Les deux répondent à la même question — « ce
// fichier trouvera-t-il son élève ? » — par deux motifs distincts. Aucun
// fichier ne doit tomber dans les deux, et aucun fichier non associé ne doit
// tomber dans ni l'un ni l'autre : c'est le trou d'origine.
//
// ⚠ MESURÉ AVANT D'ÉCRIRE, pour un lecteur futur qui se poserait la question :
// le prédicat porte sur `f.daDetecte` seul, PAS sur
// `(f.parseLea && f.parseLea.da) || f.daDetecte` comme son voisin
// `detecterFichiersSansDA`. Ce n'est pas une omission. `parseLea.da` vaut
// `detecterDA(partieIdentite)` (`travaux-import.js:137`), où `partieIdentite`
// est un PRÉFIXE du nom complet dont `daDetecte` est tiré. Un DA trouvé dans le
// préfixe est donc forcément trouvé dans le nom entier : `parseLea.da` non vide
// ⟹ `daDetecte` non vide. Les deux expressions sont vraies ensemble ; la
// partition tient. Le cas « Léa » ci-dessous l'éprouve plutôt que de le croire.

const ETUDIANTS = [
    { da: '1000001', nom: 'Martin', prenom: 'Léa', coursId: 'c1', groupe: '00001' },
    { da: '1000002', nom: 'Tremblay', prenom: 'Alex', coursId: 'c1', groupe: '00001' }
];

const OCTETS_PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);

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

function monter({ etudiants = ETUDIANTS } = {}) {
    const magasin = { groupeEtudiants: etudiants, groupesCours: [] };
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

/** Passe par l'entrée réelle : `ajouterFichiersEnAttente` → `preparerFichier`. */
function deposer(win, ...noms) {
    return win.travauxImport.ajouterFichiersEnAttente(noms.map(faireFichier));
}

const nomsRecenses = (liste) => liste.map(f => f.nomFichier).sort();

describe('#612 · detecterFichiersDAInconnu — un DA sans élève dans ce groupe est DIT', () => {

    it('la fonction est exportée sur travauxImport', () => {
        const win = monter();
        expect(typeof win.travauxImport.detecterFichiersDAInconnu).toBe('function');
    });

    it('une file vide ne recense rien', () => {
        const win = monter();
        expect(win.travauxImport.detecterFichiersDAInconnu()).toEqual([]);
    });

    it('un DA qui ne correspond à AUCUN élève est recensé, avec le DA lu', () => {
        const win = monter();
        deposer(win, '9999999_devoir.pdf');

        const inconnus = win.travauxImport.detecterFichiersDAInconnu();
        expect(nomsRecenses(inconnus)).toEqual(['9999999_devoir.pdf']);
        // Le bandeau doit pouvoir NOMMER le DA fautif : c'est ce qui permet à
        // l'enseignant de voir la faute de frappe.
        expect(inconnus[0].daDetecte).toBe('9999999');
    });

    it('le cas de l\'audit : un DA à huit chiffres tronqué à sept est recensé', () => {
        // `PATTERNS_DA[2]` (/(\d{7})[_\-\s]/) retient les SEPT premiers chiffres
        // d'une suite de huit. Le fichier repart alors sous un DA qui n'existe
        // pas — exactement le scénario nommé par le constat S4.
        const win = monter();
        const [prepare] = deposer(win, '12345678_devoir.pdf');

        expect(prepare.daDetecte).not.toBe('12345678');
        expect(prepare.etudiantAssocie).toBeNull();
        expect(nomsRecenses(win.travauxImport.detecterFichiersDAInconnu()))
            .toEqual(['12345678_devoir.pdf']);
    });

    it('un DA qui correspond à un élève du groupe n\'est PAS recensé', () => {
        const win = monter();
        deposer(win, '1000001_devoir.pdf');
        expect(win.travauxImport.detecterFichiersDAInconnu()).toEqual([]);
    });

    it('un fichier SANS DA n\'est pas recensé ici — c\'est l\'autre bandeau qui le porte', () => {
        const win = monter();
        deposer(win, 'devoir-sans-numero.pdf');

        expect(win.travauxImport.detecterFichiersDAInconnu()).toEqual([]);
        expect(nomsRecenses(win.travauxImport.detecterFichiersSansDA()))
            .toEqual(['devoir-sans-numero.pdf']);
    });

    it('un fichier associé par le NOM n\'est JAMAIS un « DA inconnu » — il reste « sans DA »', () => {
        // #611 : l'appariement par nom renseigne `etudiantAssocie`. Le fichier
        // trouvera donc son élève, et n'a rien à faire dans « DA inconnu ».
        // ⚠ Il RESTE dans « sans DA », et c'est voulu : sans DA dans le nom, le
        //   regroupement multi-pages ne fonctionne pas — c'est l'autre moitié de
        //   ce que ce bandeau-là annonce. Mon premier jet de ce banc affirmait
        //   « recensé nulle part » et se trompait : c'est l'ASSERTION qui était
        //   fausse, pas le code.
        const win = monter();
        const [prepare] = deposer(win, 'Tremblay_Alex_devoir.pdf');

        expect(prepare.etudiantAssocie).not.toBeNull();
        expect(win.travauxImport.detecterFichiersDAInconnu()).toEqual([]);
        expect(nomsRecenses(win.travauxImport.detecterFichiersSansDA()))
            .toEqual(['Tremblay_Alex_devoir.pdf']);
    });

    it('un nom au format Léa dont le DA est inconnu est recensé (et une seule fois)', () => {
        // Éprouve la mesure du bandeau d'en-tête : le DA du parse Léa vient d'un
        // PRÉFIXE du nom, donc `daDetecte` le voit aussi. Les deux détecteurs
        // restent d'accord.
        const win = monter();
        const [prepare] = deposer(win, 'Nadeau_Ima_9999998_Analyse_Remis_le_2026-08-30_09h00m00s.pdf');

        expect(prepare.parseLea.da).toBe('9999998');
        expect(prepare.daDetecte).toBeTruthy();
        expect(win.travauxImport.detecterFichiersDAInconnu()).toHaveLength(1);
        expect(win.travauxImport.detecterFichiersSansDA()).toEqual([]);
    });

    it('PARTITION : aucun fichier dans les deux listes, aucun fichier non associé hors des deux', () => {
        // Le cœur du constat S4. Avant le correctif, « DA inconnu + production
        // valide » n'apparaissait NULLE PART.
        const win = monter();
        deposer(win,
            '1000001_devoir.pdf',              // associé par DA
            'Tremblay_Alex_devoir.pdf',        // associé par nom
            '9999999_devoir.pdf',              // DA inconnu
            '12345678_devoir.pdf',             // DA tronqué, donc inconnu
            'devoir-sans-numero.pdf'           // sans DA
        );

        const sansDA = new Set(win.travauxImport.detecterFichiersSansDA().map(f => f.nomFichier));
        const daInconnu = new Set(win.travauxImport.detecterFichiersDAInconnu().map(f => f.nomFichier));

        // Disjoints.
        for (const nom of daInconnu) expect(sansDA.has(nom)).toBe(false);

        // Couvrants : tout fichier sans élève associé est dans l'une des deux.
        const nonAssocies = win.travauxImport.obtenirFileDAttente()
            .filter(f => !f.etudiantAssocie)
            .map(f => f.nomFichier);
        expect(nonAssocies.length).toBeGreaterThan(0);
        for (const nom of nonAssocies) {
            expect(sansDA.has(nom) || daInconnu.has(nom)).toBe(true);
        }

        // Le fichier associé par son DA n'est dans ni l'une ni l'autre.
        expect(sansDA.has('1000001_devoir.pdf')).toBe(false);
        expect(daInconnu.has('1000001_devoir.pdf')).toBe(false);

        // Celui associé par son NOM est dans « sans DA » seulement — jamais
        // dans « DA inconnu », qui affirmerait à tort qu'il ne trouvera personne.
        expect(daInconnu.has('Tremblay_Alex_devoir.pdf')).toBe(false);
        expect(sansDA.has('Tremblay_Alex_devoir.pdf')).toBe(true);
    });

    it('groupe vide : tout fichier portant un DA devient un DA inconnu', () => {
        const win = monter({ etudiants: [] });
        deposer(win, '1000001_devoir.pdf', 'devoir-sans-numero.pdf');

        expect(nomsRecenses(win.travauxImport.detecterFichiersDAInconnu()))
            .toEqual(['1000001_devoir.pdf']);
    });
});
