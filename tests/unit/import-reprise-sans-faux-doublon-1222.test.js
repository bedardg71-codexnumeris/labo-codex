import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #1222 (3 nov. 2026) — UN LOT « JETON DE REPRISE » N'EST PLUS ANNONCÉ EN DOUBLONS.
// Rapport de Grégoire (Mac, 1.231.0) : des reprises de l'Artefact 6, identifiées comme telles
// dans l'import, lui étaient présentées l'une après l'autre à la confirmation (« renommer » ou
// « intégrer »). Sa précision, 11 h 13 : « il ne faut pas que ces travaux écrasent l'artefact 6
// déjà évalué. » L'import laisse déjà passer une reprise (elle coexiste avec l'original) ; seule
// la pré-détection `detecterDoublonsStockage` l'ignorait. Noms fictifs (règle 6).

const ETUDIANTS = [
    { da: '9000058', nom: 'Exemple', prenom: 'Alma' },
    { da: '9000582', nom: 'Essai', prenom: 'Aria' }
];
const OCTETS_PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);

function faireFichier(nom) {
    const blob = new Blob([OCTETS_PDF], { type: 'application/pdf' });
    blob.name = nom;
    blob.lastModified = Date.UTC(2026, 10, 2, 15, 0, 0);
    return blob;
}

let win, magasin, ecrits, supprimes, ecrituresDb;

function monter() {
    magasin = [];
    ecrits = [];
    supprimes = [];
    ecrituresDb = [];
    const travauxStockage = {
        obtenirFichiersGroupeActif: () => magasin,
        ajouterFichierTravail: (meta) => {
            const f = Object.assign({ id: 'ft_' + (ecrits.length + 1) }, meta);
            ecrits.push(f);
            magasin.push(f);
            return f;
        },
        stockerBlob: async () => true,
        supprimerFichierTravail: (id) => { supprimes.push(id); },
        genererMiniaturePDF: async () => ({ thumbnail: '', nombrePages: 1 }),
        genererMiniatureImage: async () => '',
        stockerThumbnail: () => {}
    };
    return chargerScript('js/travaux-import.js', {
        obtenirDonneesSelonMode: (quoi) => (quoi === 'groupeEtudiants' ? ETUDIANTS : []),
        travauxStockage,
        db: { getSync: () => null, setSync: (cle) => { ecrituresDb.push(cle); } },
        notifications: { succes: () => {}, erreur: () => {}, info: () => {} }
    });
}

// L'Artefact 6 déjà importé (et évalué) des deux élèves.
const ORIGINAUX = [
    { id: 'ft_orig_1', etudiantDA: '9000058', productionId: 'prod_a6', nomFichier: 'Exemple_9000058_Artefact_6.pdf' },
    { id: 'ft_orig_2', etudiantDA: '9000582', productionId: 'prod_a6', nomFichier: 'Essai_9000582_Artefact_6.pdf' }
];

/** Dépose les reprises puis les marque comme le fait le sélecteur « Jeton de reprise ». */
function deposerReprises(noms) {
    win.travauxImport.setProductionGlobale('prod_a6');
    win.travauxImport.ajouterFichiersEnAttente(noms.map(faireFichier));
    const file = win.travauxImport.obtenirFileDAttente();
    file.forEach((f) => { f.estReprise = true; f.productionId = 'prod_a6'; f.productionIdParLea = false; });
    return file;
}

beforeEach(() => {
    win = monter();
    ORIGINAUX.forEach((o) => magasin.push({ ...o }));
});

describe('#1222 — une reprise n\'est pas un doublon de l\'original', () => {
    it('un lot de reprises de l\'Artefact 6 n\'est annoncé en doublons ni contre le stock, ni entre élèves', () => {
        const file = deposerReprises([
            'Exemple_9000058_Artefact_6_reprise.pdf',
            'Essai_9000582_Artefact_6_reprise.pdf'
        ]);
        expect(file.map((f) => f.etudiantDA)).toEqual(['9000058', '9000582']);
        expect(win.travauxImport.detecterDoublonsStockage()).toEqual([]);
    });

    it('témoin : le même lot SANS le jeton reste signalé contre le stock', () => {
        win.travauxImport.setProductionGlobale('prod_a6');
        win.travauxImport.ajouterFichiersEnAttente([faireFichier('Exemple_9000058_Artefact_6_v2.pdf')]);
        const doublons = win.travauxImport.detecterDoublonsStockage();
        expect(doublons).toHaveLength(1);
        expect(doublons[0].stockes.map((s) => s.id)).toEqual(['ft_orig_1']);
    });

    it('deux reprises du MÊME élève, hors d\'un même document, restent signalées dans la file', () => {
        const file = deposerReprises([
            'Exemple_9000058_Artefact_6_reprise.pdf',
            'Exemple_9000058_Artefact_6_reprise_bis.pdf'
        ]);
        file[1].groupeDocumentId = 'autre-document';
        file[0].groupeDocumentId = 'un-document';
        const doublons = win.travauxImport.detecterDoublonsStockage();
        expect(doublons).toHaveLength(1);
        expect(doublons[0].stockes).toEqual([]);
        expect(doublons[0].queue).toHaveLength(1);
    });

    it('la condition de Grégoire : après l\'import des reprises, l\'Artefact 6 d\'origine est intact', async () => {
        const avant = JSON.parse(JSON.stringify(magasin));
        const file = deposerReprises(['Exemple_9000058_Artefact_6_reprise.pdf']);
        const r = await win.travauxImport.importerFichier(file[0], 'prod_a6');
        expect(r.doublon).toBeUndefined();
        expect(ecrits).toHaveLength(1);
        // Les originaux : mêmes fichiers, mêmes champs, rien de jeté.
        expect(magasin.filter((f) => f.id.startsWith('ft_orig'))).toEqual(avant);
        expect(supprimes).toEqual([]);
        // L'import n'écrit aucune évaluation.
        expect(ecrituresDb.filter((c) => /evaluation/i.test(String(c)))).toEqual([]);
    });
});
