import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #884 (16 sept. 2026, capture de Grégoire, 10 h 21) — « les réglages spécifiques
// que j'avais paramétrés (ici la correction de la perspective) n'ont pas été
// appliqués au moment de l'import ». Même chose pour le rognage.
//
// CAUSE. Au « Confirmer » du poste de préparation, les opérations sont CUITES
// dans le blob de la file ; seule leur LISTE survit au rechargement
// (sessionStorage). « Re-déposer les fichiers » rattachait l'ORIGINAL sans rien
// rejouer, pendant que la file affichait encore « Perspective, Rognage ».
//
// Trois trous du même chemin :
//   1. le re-dépôt ne rejouait pas les opérations ;
//   2. une seconde ouverture des réglages REMPLAÇAIT la liste (la pile repart
//      vide sur un blob déjà traité) : le rejeu aurait perdu la première passe ;
//   3. « Confirmer » ne persistait pas la file : un rechargement juste après
//      perdait la liste elle-même.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(racineProjet, rel), 'utf8');

function sansCommentaires(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}
function corpsDe(nomFonction, source) {
    const debut = source.indexOf('function ' + nomFonction + '(');
    if (debut === -1) return null;
    // Borné à la fonction SUIVANTE (une accolade à 4 espaces peut venir d'un gabarit).
    const suivante = source.indexOf('\n    function ', debut + 1);
    const fin = suivante === -1 ? source.length : suivante;
    return sansCommentaires(source.slice(debut, fin));
}

const OPERATIONS = [
    { type: 'perspective', corners: [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.05 }, { x: 0.95, y: 0.9 }, { x: 0.05, y: 0.95 }], fill: 'white' },
    { type: 'crop', x: 0.05, y: 0.05, width: 0.9, height: 0.9 }
];

function faireFichier(nom, taille) {
    const blob = new Blob([new Uint8Array(taille)], { type: 'image/jpeg' });
    blob.name = nom;
    return blob;
}

// Une file persistée comme la laisse un rechargement : métadonnées seules.
function fileRestauree(entrees) {
    const stockage = {
        _data: { pipeline_queue: JSON.stringify(entrees) },
        getItem(k) { return this._data[k] != null ? this._data[k] : null; },
        setItem(k, v) { this._data[k] = String(v); },
        removeItem(k) { delete this._data[k]; }
    };
    return stockage;
}

function monter(entrees, renduFinal) {
    const sessionStorage = fileRestauree(entrees);
    const appels = [];
    const fauxWindow = {
        travauxPreparation: {
            renduFinal: async (donnees) => {
                appels.push(donnees);
                return renduFinal(donnees);
            }
        }
    };
    const win = chargerScript('js/travaux-import.js', {
        sessionStorage,
        obtenirDonneesSelonMode: () => [],
        travauxStockage: { genererMiniatureImage: async () => '' },
        db: { getSync: () => null, setSync: () => {} },
        notifications: { succes: () => {}, erreur: () => {}, info: () => {} }
    }, fauxWindow);
    return { win, appels, sessionStorage };
}

const ENTREE = (nom, taille, operations) => ({
    nomFichier: nom, typeMIME: 'image/jpeg', tailleFichier: taille - 100,
    tailleOriginale: taille, estImage: true, estPDF: false,
    pipelineStatut: 'a-optimiser', operations
});

describe('#884 — les réglages spécifiques survivent au rechargement + re-dépôt', () => {
    it('rejoue perspective ET rognage sur l\'original, dans l\'ordre, et pose le blob corrigé', async () => {
        const corrige = new Blob([new Uint8Array(42)], { type: 'image/jpeg' });
        const { win, appels, sessionStorage } = monter([ENTREE('fontaine.jpg', 5000, OPERATIONS)], async () => corrige);
        const original = faireFichier('fontaine.jpg', 5000);

        const bilan = win.travauxImport.reattacherBlobs([original]);
        const entree = win.travauxImport.obtenirFileDAttente()[0];

        expect(bilan.rattaches).toBe(1);
        // Pendant le rendu : pas de blob (l'import ne doit rien voir partir brut).
        expect(entree.fichier).toBeNull();
        expect(entree.reglagesEnRejeu).toBe(true);

        const r = await bilan.rejeu;
        expect(r).toEqual({ rejoues: ['fontaine.jpg'], echecs: [] });
        expect(appels).toHaveLength(1);
        expect(appels[0].fichier).toBe(original);
        expect(appels[0].operations.map(o => o.type)).toEqual(['perspective', 'crop']);
        expect(entree.fichier).toBe(corrige);
        expect(entree.fichierOriginal).toBe(original);
        expect(entree.tailleFichier).toBe(42);
        expect(entree.reglagesEnRejeu).toBe(false);
        // La liste reste : un second rechargement doit pouvoir rejouer encore.
        expect(entree.operations).toHaveLength(2);
        const persistee = JSON.parse(sessionStorage.getItem('pipeline_queue'))[0];
        expect(persistee.operations.map(o => o.type)).toEqual(['perspective', 'crop']);
        expect(persistee.tailleOriginale).toBe(5000);
    });

    it('échec du rendu : original rattaché, liste vidée, échec NOMMÉ', async () => {
        const { win } = monter([ENTREE('houle.jpg', 3000, OPERATIONS)], async () => { throw new Error('canvas'); });
        const original = faireFichier('houle.jpg', 3000);

        const bilan = win.travauxImport.reattacherBlobs([original]);
        const r = await bilan.rejeu;
        const entree = win.travauxImport.obtenirFileDAttente()[0];

        expect(r).toEqual({ rejoues: [], echecs: ['houle.jpg'] });
        expect(entree.fichier).toBe(original);
        expect(entree.operations).toEqual([]);
        expect(entree.reglagesEnRejeu).toBe(false);
    });

    it('sans réglage : rattachement immédiat, aucun rendu', async () => {
        const { win, appels } = monter([ENTREE('guerette.jpg', 2000, [])], async () => null);
        const original = faireFichier('guerette.jpg', 2000);

        const bilan = win.travauxImport.reattacherBlobs([original]);
        expect(win.travauxImport.obtenirFileDAttente()[0].fichier).toBe(original);
        expect(await bilan.rejeu).toEqual({ rejoues: [], echecs: [] });
        expect(appels).toHaveLength(0);
    });
});

describe('#884 — le poste de préparation garde la liste complète et la persiste', () => {
    const srcPrep = lire('js/travaux-preparation.js');
    const corpsConfirmer = corpsDe('confirmer', srcPrep);

    it('« Confirmer » AJOUTE les opérations à celles déjà cuites', () => {
        expect(corpsConfirmer).toMatch(/\.operations\s*=\s*dejaCuites\.concat\(f\.operations\)/);
        expect(corpsConfirmer).not.toMatch(/\.operations\s*=\s*f\.operations\.slice\(\)/);
    });

    it('« Confirmer » persiste la file', () => {
        expect(corpsConfirmer).toContain('travauxImport.persisterFileDAttente()');
    });

    it('renduFinal est exporté (consommé par le re-dépôt)', () => {
        expect(srcPrep).toMatch(/renduFinal:\s*renduFinal/);
    });
});

describe('#884 — l\'import attend la fin du rejeu', () => {
    const srcUI = lire('js/travaux-ui.js');

    it('appliquerEtImporter (bouton « Importer ») refuse tant qu\'un fichier est en rejeu, AVANT le test des blobs manquants', () => {
        const corps = corpsDe('appliquerEtImporter', srcUI);
        const iRejeu = corps.indexOf('f.reglagesEnRejeu');
        const iSansBlob = corps.indexOf('queue.filter(f => !f.fichier)');
        expect(iRejeu).toBeGreaterThan(-1);
        expect(iSansBlob).toBeGreaterThan(iRejeu);
    });

    it('le re-dépôt annonce un échec de rejeu', () => {
        const corps = corpsDe('redeposerFichiers', srcUI);
        expect(corps).toContain('bilan.rejeu');
        expect(corps).toContain('r.echecs');
    });
});
