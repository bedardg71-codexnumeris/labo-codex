import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE #949 (25 septembre 2026) — ARRÊTER UN EXPORT EN COURS.
//
// Demande de Grégoire (capture de la carte « Exporter des travaux », 48/80) :
// « J'ai simplement oublié d'anonymiser l'export et je veux l'annuler. »
// Sa décision : à l'arrêt, RIEN n'est téléchargé.
//
// Invariants :
//   · pendant l'export, « Arrêter l'export » remplace « Télécharger » ; après, l'inverse ;
//   · arrêté entre deux fichiers : aucune archive, aucun téléchargement, aucune copie
//     marquée « exportée », les fichiers suivants ne sont pas lus, message d'arrêt ;
//   · arrêté pendant la compression : l'archive est jetée, rien n'est marqué ;
//   · un second « Télécharger » pendant un export ne lance rien ;
//   · après un arrêt, un nouvel export part normalement ;
//   · sans arrêt, l'export est inchangé.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

function monter({ surLecture, surCompression } = {}) {
    const fichiers = ['F1', 'F2', 'F3', 'F4'].map((id, i) => ({
        id, etudiantDA: i < 2 ? '111' : '222', productionId: 'P1', typeMIME: 'application/pdf', nomFichier: id.toLowerCase() + '.pdf'
    }));
    const store = {
        groupeEtudiants: [{ da: '111', nom: 'Tremblay', prenom: 'Alix' }, { da: '222', nom: 'Roy', prenom: 'Sam' }],
        productions: [{ id: 'P1', titre: 'Écrit 1' }],
        evaluationsSauvegardees: []
    };
    const lus = [], marques = [], telecharges = [], generations = [], etats = [];
    const elements = {
        'travaux-texte-progression': { textContent: '' },
        'travaux-barre-progression': { style: { width: '' } },
        'travaux-archivage-telecharger': { style: { display: '' } },
        'travaux-archivage-arreter': { style: { display: 'none' }, disabled: false }
    };
    const etatBoutons = () => ({
        telecharger: elements['travaux-archivage-telecharger'].style.display,
        arreter: elements['travaux-archivage-arreter'].style.display
    });
    let archivage;
    function FauxZip() {
        this.file = () => {};
        this.folder = () => new FauxZip();
        this.generateAsync = async (opts) => {
            generations.push(opts);
            if (surCompression) surCompression(archivage);
            return { fauxBlob: true };
        };
    }
    const win = chargerScript('js/travaux-archivage.js', {
        document: {
            getElementById: (id) => elements[id] || null,
            createElement: () => ({ click() { telecharges.push(this.download); } })
        },
        db: { getSync: (_k, d) => d, setSync: () => {} },
        cle: (k) => k,
        obtenirDonneesSelonMode: (k) => store[k] || [],
        obtenirTrimestreActif: () => ({ id: 'a2026', nom: 'Automne 2026' }),
        travauxStockage: {
            obtenirFichiersGroupeActif: () => fichiers,
            obtenirAnnotationFichier: () => null,
            recupererBlob: async (id) => {
                lus.push(id);
                etats.push(etatBoutons());
                if (surLecture) surLecture(id, archivage);
                return { taille: 1 };
            },
            marquerExporte: (id) => marques.push(id)
        },
        travauxExportPDF: {},
        URL: { createObjectURL: () => 'blob:faux', revokeObjectURL: () => {} },
        alert: () => {},
        JSZip: FauxZip
    }, { addEventListener() {}, removeEventListener() {} });
    archivage = win.travauxArchivage;
    return { archivage, lus, marques, telecharges, generations, etats, elements, etatBoutons };
}

describe('#949 · « Arrêter l\'export » : rien n\'est téléchargé', () => {
    it('pendant l\'export, « Arrêter » remplace « Télécharger » ; après, l\'inverse', async () => {
        const b = monter();
        await b.archivage.lancerExport({});
        expect(b.etats[0]).toEqual({ telecharger: 'none', arreter: '' });
        expect(b.etatBoutons()).toEqual({ telecharger: '', arreter: 'none' });
        expect(b.telecharges).toHaveLength(1);
        expect(b.marques).toEqual(['F1', 'F2', 'F3', 'F4']);
    });

    it('arrêté pendant le 2e fichier : il se termine, les suivants ne sont pas lus ; aucune archive, rien de marqué', async () => {
        const b = monter({ surLecture: (id, a) => { if (id === 'F2') a.arreterExport(); } });
        await b.archivage.lancerExport({});
        expect(b.lus).toEqual(['F1', 'F2']);
        expect(b.generations).toHaveLength(0);
        expect(b.telecharges).toEqual([]);
        expect(b.marques).toEqual([]);
        expect(b.elements['travaux-texte-progression'].textContent).toBe('Export arrêté. Aucun fichier téléchargé.');
        expect(b.elements['travaux-barre-progression'].style.width).toBe('0%');
        expect(b.etatBoutons()).toEqual({ telecharger: '', arreter: 'none' });
        expect(b.elements['travaux-archivage-arreter'].disabled).toBe(false);
    });

    it('au clic, le bouton se désactive et dit « Arrêt en cours… » jusqu\'à la fin du fichier courant', async () => {
        let pendant;
        const b = monter({ surLecture: (id, a) => {
            if (id === 'F1') {
                a.arreterExport();
                pendant = { texte: b.elements['travaux-texte-progression'].textContent, desactive: b.elements['travaux-archivage-arreter'].disabled };
            }
        } });
        await b.archivage.lancerExport({});
        expect(pendant).toEqual({ texte: 'Arrêt en cours…', desactive: true });
    });

    it('arrêté pendant la compression : l\'archive est jetée, rien n\'est marqué', async () => {
        const b = monter({ surCompression: (a) => a.arreterExport() });
        await b.archivage.lancerExport({});
        expect(b.generations).toHaveLength(1);
        expect(b.telecharges).toEqual([]);
        expect(b.marques).toEqual([]);
        expect(b.elements['travaux-texte-progression'].textContent).toBe('Export arrêté. Aucun fichier téléchargé.');
    });

    it('un second « Télécharger » pendant un export ne lance rien', async () => {
        let second;
        const b = monter({ surLecture: (id, a) => { if (id === 'F1') second = a.lancerExport({}); } });
        await b.archivage.lancerExport({});
        await second;
        expect(b.telecharges).toHaveLength(1);
        expect(b.lus).toEqual(['F1', 'F2', 'F3', 'F4']);
    });

    it('après un arrêt, un nouvel export part normalement', async () => {
        let arreterUneFois = true;
        const b = monter({ surLecture: (id, a) => { if (id === 'F2' && arreterUneFois) { arreterUneFois = false; a.arreterExport(); } } });
        await b.archivage.lancerExport({});
        expect(b.telecharges).toEqual([]);
        await b.archivage.lancerExport({});
        expect(b.telecharges).toHaveLength(1);
        expect(b.marques).toEqual(['F1', 'F2', 'F3', 'F4']);
    });

    it('« Arrêter » sans export en cours ne fait rien', async () => {
        const b = monter();
        b.archivage.arreterExport();
        expect(b.elements['travaux-texte-progression'].textContent).toBe('');
        await b.archivage.lancerExport({});
        expect(b.telecharges).toHaveLength(1);
    });
});

describe('#949 · le moteur exporterTravaux', () => {
    it('doitArreter vrai après le 1er fichier : arrete, sans archive, exportes vide', async () => {
        const b = monter();
        let n = 0;
        const r = await b.archivage.exporterTravaux({ doitArreter: () => n++ >= 1 });
        expect(r).toEqual({ blob: null, echecs: [], nbFichiers: 4, exportes: [], arrete: true });
        expect(b.lus).toEqual(['F1']);
    });

    it('sans doitArreter : export complet, arrete faux', async () => {
        const b = monter();
        const r = await b.archivage.exporterTravaux({});
        expect(r.arrete).toBe(false);
        expect(r.exportes).toEqual(['F1', 'F2', 'F3', 'F4']);
        expect(r.blob).toEqual({ fauxBlob: true });
    });
});

describe('#949 · la carte porte le bouton, branché', () => {
    it('« Arrêter l\'export » est dans la carte, caché au départ, et travauxUI le relaie', () => {
        const ui = lire('js/travaux-ui.js');
        const carte = tranche(ui, '<h4>Exporter des travaux</h4>', '<!-- Export Lea -->');
        expect(carte).toContain('id="travaux-archivage-telecharger"');
        expect(carte).toMatch(/<button id="travaux-archivage-arreter"[^>]*data-action="travauxUI\.arreterArchivage"[^>]*style="display:none">Arrêter l'export<\/button>/);
        expect(tranche(ui, 'function arreterArchivage()', '}')).toContain('travauxArchivage.arreterExport()');
        expect(ui).toContain('arreterArchivage: arreterArchivage,');
    });
});
