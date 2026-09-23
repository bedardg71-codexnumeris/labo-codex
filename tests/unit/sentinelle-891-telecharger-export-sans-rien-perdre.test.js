import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #891 (16 sept. 2026) — « Télécharger » (Exporter des travaux) perdait TOUT
// l'export sur un seul fichier illisible, et son ZIP portait un nom non assaini.
//
// #565 avait isolé chaque item par try/catch sur DEUX des trois exports de
// l'écran (« Trimestre complet », « Léa ») ; « Exporter des travaux »
// (`exporterTravaux`) et l'export du profil (`exporterParEtudiant`) n'avaient
// rien : un blob illisible remontait au catch global — alerte, rien de
// téléchargé, même pour les N−1 copies valides. Aucun test n'exécutait
// `exporterTravaux` ni `exporterSemestre` : c'est pour cela que la 565 était
// verte. Ce banc est celui de l'audit du 16 septembre, devenu sentinelle.
//
// #895 (23 sept. 2026) : « Trimestre complet » et son moteur `exporterSemestre`
// sont fondus dans `exporterTravaux(options, onProgression)` ; les essais qui
// visaient l'ancien moteur visent la forme « par étudiant·e et production » du
// moteur unique. Le reste de #895 : `sentinelle-895-une-carte-exporter-des-travaux`.
//
// Quatre invariants, sur les exports par ZIP :
//   · le lot survit : un fichier illisible est sauté et NOMMÉ, les autres partent ;
//   · le nom du ZIP téléchargé est assaini (« Roy/Tremblay » ne casse plus
//     l'enregistrement) et garde ses accents (« Écrit 1 » ≠ « _crit_1 », #572) ;
//   · les dossiers de production gardent aussi leurs accents ;
//   · « exporté » n'est posé QUE sur les fichiers réellement mis dans l'archive.
//
// Break-tests (à faire rougir AVANT de faire confiance à cette sentinelle) :
//   1. retirer le try/catch de la boucle d'`exporterTravaux` (ou faire lever
//      `_ajouterFichierAuZip` hors du try) → « le lot survit » et « l'échec
//      est nommé » rougissent pour cet export.
//   2. remettre `etudiant.nom + '_' + etudiant.prenom` brut dans `lancerExport`
//      → « le nom du ZIP est assaini » rougit.
//   3. remettre `.replace(/[^a-zA-Z0-9]/g, '_')` sur le titre de production
//      → « garde ses accents » rougit (ZIP et dossier).
//   4. remarquer tout le filtre (`fichiers.forEach(marquerExporte)`) →
//      « seuls les fichiers réellement exportés » rougit.

function monter({ recupererBlob, annotations } = {}) {
    const etudiants = [
        { da: '111', nom: 'Tremblay', prenom: 'Alix' },
        { da: '222', nom: 'Roy/Tremblay', prenom: 'Sam' },
        { da: '333', nom: 'Gagnon', prenom: 'Noa' }
    ];
    const fichiers = etudiants.map((e, i) => ({
        id: 'F' + (i + 1), etudiantDA: e.da, productionId: 'P1',
        nomFichier: `copie${i + 1}.pdf`, typeMIME: 'application/pdf'
    }));
    const store = {
        groupeEtudiants: etudiants,
        evaluationsSauvegardees: [],
        productions: [{ id: 'P1', titre: 'Écrit 1' }]
    };

    // Faux JSZip : enregistre les chemins écrits, à plat, dossiers compris.
    const entrees = [];
    function FauxZip(prefixe = '') {
        this.file = (chemin, contenu) => { entrees.push({ chemin: prefixe + chemin, contenu }); };
        this.folder = (nom) => new FauxZip(prefixe + nom + '/');
        this.generateAsync = async () => ({ fauxBlob: true, entrees: entrees.map(e => e.chemin) });
    }

    const marques = [];
    const telecharges = [];
    const alertes = [];
    const fauxDocument = {
        getElementById: () => null,
        createElement: () => ({ click() { telecharges.push(this.download); } })
    };

    const stubs = {
        document: fauxDocument,
        db: { get: async () => null, getSync: (_k, d) => d, set: async () => {}, setSync: () => {} },
        cle: (k) => k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (k) => store[k] || [],
        sauvegarderDonneesSelonMode: () => {},
        obtenirTrimestreActif: () => ({ id: 'a2026', nom: 'Automne 2026' }),
        travauxStockage: {
            obtenirFichiersGroupeActif: () => fichiers,
            obtenirFichiersEtudiant: (da) => fichiers.filter(f => f.etudiantDA === da),
            obtenirAnnotationFichier: (id) => (annotations && annotations[id]) || null,
            recupererBlob: recupererBlob || (async () => ({ taille: 1 })),
            marquerExporte: (id) => marques.push(id)
        },
        travauxResolution: {},
        travauxExportPDF: {
            // Un PDF qui rejette au rendu annoté : même trou que le blob illisible.
            rendrePDFAvecAnnotations: async () => { throw new Error('PDF corrompu'); }
        },
        URL: { createObjectURL: () => 'blob:faux', revokeObjectURL: () => {} },
        alert: (m) => alertes.push(String(m)),
        JSZip: FauxZip
    };

    const win = chargerScript('js/travaux-archivage.js', stubs, {
        addEventListener: () => {}, removeEventListener: () => {}
    });
    return { archivage: win.travauxArchivage, entrees, marques, telecharges, alertes };
}

// Le 2e fichier (Sam Roy/Tremblay) est illisible.
const blobIllisibleSurF2 = async (id) => {
    if (id === 'F2') throw new Error('Blob illisible');
    return { taille: 1 };
};

const cheminsCopies = (entrees) => entrees.map(e => e.chemin).filter(c => !c.endsWith('.json'));

describe('#891 · un fichier illisible n’emporte plus l’archive entière', () => {
    it('exporterTravaux : le lot survit (2 copies sur 3) et l’échec est nommé', async () => {
        const { archivage, entrees } = monter({ recupererBlob: blobIllisibleSurF2 });
        const { echecs, nbFichiers, exportes } = await archivage.exporterTravaux({ productionId: 'P1', forme: 'etudiant' });
        expect(cheminsCopies(entrees)).toEqual(['Tremblay_Alix_111/copie1.pdf', 'Gagnon_Noa_333/copie3.pdf']);
        expect(nbFichiers).toBe(3);
        expect(exportes).toEqual(['F1', 'F3']);
        expect(echecs).toHaveLength(1);
        expect(echecs[0]).toContain('Roy-Tremblay_Sam_222');
        expect(echecs[0]).toContain('copie2.pdf');
        expect(echecs[0]).toContain('Blob illisible');
    });

    it('exporterParEtudiant (profil) : même isolation, même bilan', async () => {
        const { archivage, entrees } = monter({
            recupererBlob: async (id) => (id === 'F2' ? null : { taille: 1 })
        });
        // L'élève 222 n'a qu'un fichier, et son blob est ABSENT (null, pas une
        // exception) : c'est le cas « if (!blob) continue » qui était sauté en silence.
        const { echecs, exportes } = await archivage.exporterParEtudiant('222', { inclureAnnotes: true });
        expect(cheminsCopies(entrees)).toEqual([]);
        expect(exportes).toEqual([]);
        expect(echecs).toHaveLength(1);
        // Un blob ABSENT est nommé avec le mot de l'export PDF, pas sauté en silence.
        expect(echecs[0]).toContain('Blob introuvable');
        expect(echecs[0]).toContain('copie2.pdf');

        const ok = monter({});
        const r = await ok.archivage.exporterParEtudiant('111', { inclureAnnotes: true });
        expect(cheminsCopies(ok.entrees)).toEqual(['Tremblay_Alix_111/originaux/copie1.pdf']);
        expect(r.exportes).toEqual(['F1']);
        expect(r.echecs).toEqual([]);
    });

    it('forme « par étudiant·e et production » (l’ancien « Trimestre complet ») — 2 copies, 1 échec nommé, résumé', async () => {
        const { archivage, entrees } = monter({ recupererBlob: blobIllisibleSurF2 });
        const { echecs, nbFichiers } = await archivage.exporterTravaux({}, null);
        expect(cheminsCopies(entrees)).toEqual([
            'Tremblay_Alix_111/Écrit 1/copie1.pdf',
            'Gagnon_Noa_333/Écrit 1/copie3.pdf'
        ]);
        expect(nbFichiers).toBe(3);
        expect(echecs).toHaveLength(1);
        expect(echecs[0]).toContain('Roy-Tremblay_Sam_222 / copie2.pdf');
        const resume = JSON.parse(entrees.find(e => e.chemin === '_resume.json').contenu);
        expect(resume.nbEchecs).toBe(1);
    });

    it('un PDF qui rejette au rendu annoté est sauté et nommé, et non marqué exporté', async () => {
        const { archivage, entrees } = monter({ annotations: { F3: { pages: { 1: {} } } } });
        const { echecs, exportes } = await archivage.exporterTravaux({ productionId: 'P1', forme: 'etudiant' });
        expect(echecs).toHaveLength(1);
        expect(echecs[0]).toContain('Gagnon_Noa_333 / copie3.pdf');
        expect(echecs[0]).toContain('PDF corrompu');
        // L'original de F3 est dans l'archive, mais le fichier est en échec :
        // il ne compte pas parmi les « réellement exportés ».
        expect(cheminsCopies(entrees)).toContain('Gagnon_Noa_333/copie3.pdf');
        expect(exportes).toEqual(['F1', 'F2']);
    });
});

describe('#891 · lancerExport (le bouton « Télécharger ») — nom, marquage, bilan', () => {
    it('le nom du ZIP est assaini : « Roy/Tremblay » ne crée plus de chemin', async () => {
        const { archivage, telecharges } = monter({});
        await archivage.lancerExport({ da: '222' });
        expect(telecharges).toEqual(['travaux_Roy-Tremblay_Sam.zip']);
    });

    it('le nom du ZIP garde ses accents : « Écrit 1 », pas « _crit_1 »', async () => {
        const { archivage, telecharges } = monter({});
        await archivage.lancerExport({ da: '111', productionId: 'P1' });
        expect(telecharges).toHaveLength(1);
        expect(telecharges[0]).toContain('Écrit 1');
        expect(telecharges[0]).not.toContain('_crit_1');
        expect(telecharges[0]).toBe('travaux_Tremblay_Alix_Écrit 1.zip');
    });

    it('seuls les fichiers réellement exportés sont marqués « exporté » ; l’archive part et le bilan nomme la perte', async () => {
        const { archivage, marques, telecharges, alertes } = monter({ recupererBlob: blobIllisibleSurF2 });
        await archivage.lancerExport({ productionId: 'P1' });
        expect(telecharges).toEqual(['travaux_Écrit 1.zip']);
        expect(marques).toEqual(['F1', 'F3']);
        expect(marques).not.toContain('F2');
        // Le bilan de #565, tel quel : « 2 exporté(s) sur 3, 1 en échec : ».
        expect(alertes).toHaveLength(1);
        expect(alertes[0]).toContain('2 exporté(s) sur 3, 1 en échec');
        expect(alertes[0]).toContain('Roy-Tremblay_Sam_222 / copie2.pdf — Blob illisible');
    });

    it('contrôle : sans échec, tout est marqué et rien n’est dit', async () => {
        const { archivage, marques, alertes } = monter({});
        await archivage.lancerExport({ productionId: 'P1' });
        expect(marques).toEqual(['F1', 'F2', 'F3']);
        expect(alertes).toEqual([]);
    });

    it('lancerExportEtudiant (profil) : même marquage ciblé, même bilan', async () => {
        const { archivage, marques, telecharges, alertes } = monter({
            recupererBlob: async (id) => (id === 'F2' ? null : { taille: 1 })
        });
        await archivage.lancerExportEtudiant('222', { inclureAnnotes: true });
        expect(telecharges).toEqual(['travaux_Roy-Tremblay_Sam.zip']);
        expect(marques).toEqual([]);
        expect(alertes).toHaveLength(1);
        expect(alertes[0]).toContain('0 exporté(s) sur 1, 1 en échec');
        expect(alertes[0]).toContain('Blob introuvable');
    });
});
