import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #1271 (décision de Grégoire, 27 nov. 2026) — LA PRODUCTION CHOISIE POUR LE LOT VIT LE TEMPS
// DU LOT. Évaluation › Préparer : la production choisie en haut (« S'applique à tout le lot »)
// survivait à une importation et à « Annuler tout » ; le dépôt suivant la recevait, et elle
// passait avant le nom de production porté par les fichiers de Léa.
// Décision : remise à zéro après chaque importation réussie et après « Annuler tout » ; pendant
// un même lot, elle reste choisie ; au dépôt suivant, c'est le nom porté par les fichiers qui
// propose la production. Aucun mot nouveau.
//
// Le banc monte le VRAI travaux-import.js et le VRAI travaux-ui.js dans la même fenêtre, avec
// le même sessionStorage : le choix y vit à deux endroits (la variable du module et la clé de
// session que l'Inspecteur relit), et les deux doivent tomber ensemble. Noms fictifs (règle 6).

const ETUDIANTS = [
    { da: '9000058', nom: 'Exemple', prenom: 'Alma' },
    { da: '9000582', nom: 'Essai', prenom: 'Aria' }
];
const PRODUCTIONS = [
    { id: 'prod_a5', titre: 'Artefact 5' },
    { id: 'prod_a6', titre: 'Artefact 6' }
];
const OCTETS_PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);

function fichierLea(nom, da, production) {
    const blob = new Blob([OCTETS_PDF], { type: 'application/pdf' });
    blob.name = `${nom}_${da}_${production}_Remis_le_2026-11-20_09h46m45s.pdf`;
    blob.lastModified = Date.UTC(2026, 10, 20, 14, 46, 45);
    return blob;
}

function faireSession() {
    return {
        _d: {},
        getItem(k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
        setItem(k, v) { this._d[k] = String(v); },
        removeItem(k) { delete this._d[k]; },
        clear() { this._d = {}; }
    };
}

let win, session, refuser, magasin;

function monter() {
    session = faireSession();
    refuser = new Set();
    magasin = [];
    const travauxStockage = {
        obtenirFichiersGroupeActif: () => magasin,
        ajouterFichierTravail: (meta) => {
            if (refuser.has(meta.etudiantDA)) throw new Error('écriture refusée (banc)');
            const f = Object.assign({ id: 'ft_' + (magasin.length + 1) }, meta);
            magasin.push(f);
            return f;
        },
        stockerBlob: async () => true,
        supprimerFichierTravail: () => {},
        genererMiniaturePDF: async () => ({ thumbnail: '', nombrePages: 1 }),
        genererMiniatureImage: async () => '',
        stockerThumbnail: () => {},
        obtenirThumbnailSync: () => null,
        formaterTaille: () => ''
    };
    const communs = {
        obtenirDonneesSelonMode: (quoi) => (quoi === 'groupeEtudiants' ? ETUDIANTS
            : quoi === 'productions' ? PRODUCTIONS : []),
        travauxStockage,
        db: { getSync: () => null, setSync: () => {} },
        notifications: { succes: () => {}, erreur: () => {}, info: () => {}, avertissement: () => {} },
        sessionStorage: session,
        echapperHtml: (s) => String(s),
        setTimeout: () => 0,
        clearTimeout: () => {}
    };
    const w = chargerScript('js/travaux-import.js', communs,
        { addEventListener: () => {}, removeEventListener: () => {} });
    chargerScript('js/travaux-ui.js', Object.assign({}, communs, { travauxImport: w.travauxImport }), w);
    return w;
}

/** Le geste de l'Inspecteur : choisir une production « pour tout le lot ». */
function choisirPourLeLot(productionId) {
    win.travauxUI.associerProductionGlobale(productionId);
}

function deposer(...fichiers) {
    win.travauxImport.ajouterFichiersEnAttente(fichiers);
    return win.travauxImport.obtenirFileDAttente();
}

const CLE_SESSION = 'travaux-pipeline-production';

beforeEach(() => {
    win = monter();
});

describe('#1271 — la production choisie pour le lot ne survit pas au lot', () => {
    it('témoin du banc : le nom porté par les fichiers propose la production quand rien n\'est choisi', () => {
        const file = deposer(fichierLea('Essai_Aria', '9000582', 'Artefact_6'));
        expect(file[0].productionId).toBe('prod_a6');
    });

    it('pendant un même lot, le choix reste : un second dépôt avant l\'import le reçoit', () => {
        deposer(fichierLea('Exemple_Alma', '9000058', 'Artefact_5'));
        choisirPourLeLot('prod_a5');
        const file = deposer(fichierLea('Essai_Aria', '9000582', 'Artefact_6'));
        expect(file.map((f) => f.productionId)).toEqual(['prod_a5', 'prod_a5']);
        expect(win.travauxImport.getProductionGlobale()).toBe('prod_a5');
    });

    it('après une importation réussie, le choix tombe et le dépôt suivant suit le nom de ses fichiers', async () => {
        deposer(fichierLea('Exemple_Alma', '9000058', 'Artefact_5'));
        choisirPourLeLot('prod_a5');
        expect(session.getItem(CLE_SESSION)).toBe('prod_a5');

        const r = await win.travauxImport.importerTous(null);
        expect(r.importes).toBe(1);
        expect(win.travauxImport.obtenirFileDAttente()).toHaveLength(0);

        expect(win.travauxImport.getProductionGlobale()).toBe('');
        expect(session.getItem(CLE_SESSION)).toBeNull();

        const file = deposer(fichierLea('Essai_Aria', '9000582', 'Artefact_6'));
        expect(file[0].productionId).toBe('prod_a6');
        expect(file[0].productionIdParLea).toBe(true);
    });

    it('une importation qui laisse des fichiers dans la file ne finit pas le lot : le choix reste', async () => {
        refuser.add('9000582');
        deposer(
            fichierLea('Exemple_Alma', '9000058', 'Artefact_5'),
            fichierLea('Essai_Aria', '9000582', 'Artefact_5')
        );
        choisirPourLeLot('prod_a5');

        const r = await win.travauxImport.importerTous(null);
        expect(r.importes).toBe(1);
        expect(r.erreurs).toBe(1);
        expect(win.travauxImport.obtenirFileDAttente()).toHaveLength(1);
        expect(win.travauxImport.getProductionGlobale()).toBe('prod_a5');
        expect(session.getItem(CLE_SESSION)).toBe('prod_a5');
    });

    it('les doublons arbitrés après l\'import : le choix tombe quand le ménage vide la file', async () => {
        // L'Artefact 5 de cette élève est déjà en stock : `importerTous` laisse le doublon dans
        // la file ; l'arbitrage l'écrit, puis `purgerFichiersImportes` fait le ménage
        // (executerImportPipeline, #604).
        magasin.push({ id: 'ft_deja', etudiantDA: '9000058', productionId: 'prod_a5' });
        deposer(fichierLea('Exemple_Alma', '9000058', 'Artefact_5'));
        choisirPourLeLot('prod_a5');

        const r = await win.travauxImport.importerTous(null);
        expect(r.doublons).toHaveLength(1);
        expect(win.travauxImport.obtenirFileDAttente()).toHaveLength(1);
        expect(win.travauxImport.getProductionGlobale()).toBe('prod_a5');

        win.travauxImport.obtenirFileDAttente()[0].statut = 'importe';   // l'arbitrage l'a écrit
        win.travauxImport.purgerFichiersImportes();
        expect(win.travauxImport.obtenirFileDAttente()).toHaveLength(0);
        expect(win.travauxImport.getProductionGlobale()).toBe('');
        expect(session.getItem(CLE_SESSION)).toBeNull();
    });

    it('« Annuler tout » fait tomber le choix, et le dépôt suivant suit le nom de ses fichiers', () => {
        deposer(fichierLea('Exemple_Alma', '9000058', 'Artefact_5'));
        choisirPourLeLot('prod_a5');

        win.travauxUI.annulerImport();

        expect(win.travauxImport.obtenirFileDAttente()).toHaveLength(0);
        expect(win.travauxImport.getProductionGlobale()).toBe('');
        expect(session.getItem(CLE_SESSION)).toBeNull();
        const file = deposer(fichierLea('Essai_Aria', '9000582', 'Artefact_6'));
        expect(file[0].productionId).toBe('prod_a6');
    });

    it('« Annuler tout » fait aussi tomber le jeton de reprise et sa production cible', () => {
        session.setItem('travaux-jeton-production', 'prod_a6');
        deposer(fichierLea('Exemple_Alma', '9000058', 'Artefact_6'));
        win.travauxImport.setProductionGlobale('__jeton_reprise__');
        session.setItem(CLE_SESSION, '__jeton_reprise__');

        win.travauxUI.annulerImport();

        expect(win.travauxImport.getProductionGlobale()).toBe('');
        expect(session.getItem(CLE_SESSION)).toBeNull();
        expect(session.getItem('travaux-jeton-production')).toBeNull();
        const file = deposer(fichierLea('Exemple_Alma', '9000058', 'Artefact_6'));
        expect(file[0].estReprise).toBeFalsy();
        expect(file[0].productionId).toBe('prod_a6');
    });
});
