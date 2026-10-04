import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// #565 (28 août 2026) — deux défauts d'un même bouton.
//
// B11 : les boucles d'export (Léa, trimestre) n'avaient AUCUN try/catch par item.
// Une seule exception — blob manquant, PDF corrompu — remontait au catch global :
// zéro PDF livré, même pour les N−1 étudiants valides, et un seul `alert`.
//
// B12 : `ajouterPageSynthese` avalait ses échecs (`return` nus, `console.warn`).
// L'enseignant pouvait téléverser sur Léa des copies SANS leur page de
// rétroaction sans jamais le savoir — alors que c'est la promesse du bouton.
//
// Invariant tenu ici : un item en échec est ISOLÉ, NOMMÉ, et n'empêche pas les
// autres de partir. Une copie livrée sans sa synthèse est signalée à part des
// échecs, parce qu'elle est exportée et lisible — c'est un avertissement, pas
// une perte.
//
// Break-tests (à faire rougir AVANT de faire confiance à cette sentinelle) :
//   1. retirer le try/catch de la boucle d'`exporterPourLea` → « le lot survit »
//      et « l'étudiant en échec est nommé » rougissent (l'exception ressort).
//   2. cesser de collecter `sansSynthese` → « la copie sans synthèse est
//      signalée » rougit seul.
//   3. remettre un `return;` nu dans `ajouterPageSynthese` → « tous les chemins
//      de sortie disent quelque chose » rougit seul.

function monter({ genererDocPDF }) {
    const etudiants = [
        { da: '111', nom: 'Tremblay', prenom: 'Alix' },
        { da: '222', nom: 'Roy', prenom: 'Sam' },
        { da: '333', nom: 'Gagnon', prenom: 'Noa' }
    ];
    const fichiers = etudiants.map((e, i) => ({
        id: 'F' + (i + 1), etudiantDA: e.da, productionId: 'P1', nomFichier: `copie${i + 1}.pdf`
    }));
    const evaluations = etudiants.map((e, i) => ({
        id: 'E' + (i + 1), etudiantDA: e.da, productionId: 'P1'
    }));

    const store = {
        groupeEtudiants: etudiants,
        evaluationsSauvegardees: evaluations,
        productions: [{ id: 'P1', titre: 'Dissertation' }]
    };

    const stubs = {
        db: { get: async () => null, getSync: (_k, d) => d, set: async () => {}, setSync: () => {} },
        cle: (k) => k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (k) => store[k] || [],
        sauvegarderDonneesSelonMode: () => {},
        obtenirTrimestreActif: () => ({ id: 'h2026', nom: 'Hiver 2026' }),
        travauxStockage: {
            obtenirFichiersGroupeActif: () => fichiers,
            obtenirFichiersAffiches: () => fichiers, // #1013 : la lecture de ce qui montre ou envoie
            obtenirAnnotationFichier: () => null,
            recupererBlob: async () => ({ taille: 1 })
        },
        travauxResolution: {
            trouverFichierPourEvaluation: (ev) => fichiers.find(f => f.etudiantDA === ev.etudiantDA)
        },
        travauxExportPDF: { genererDocPDF },
        alert: () => {},
        JSZip: function () {}
    };

    const win = chargerScript('js/travaux-archivage.js', stubs, {
        addEventListener: () => {}, removeEventListener: () => {}
    });
    return win.travauxArchivage;
}

// Le 2e étudiant (Sam Roy) fait échouer la génération ; le 3e (Noa Gagnon)
// produit un PDF mais SANS page de rétroaction.
const genererDocPDFMixte = async (fichierId) => {
    if (fichierId === 'F2') throw new Error('Blob introuvable');
    return {
        doc: { output: () => ({ pdf: fichierId }) },
        synthese: fichierId === 'F3'
            ? { ajoutee: false, raison: 'échec de la mise en image : canvas vide' }
            : { ajoutee: true, raison: null }
    };
};

describe('#565 · un étudiant en échec n’avorte plus le lot d’export', () => {
    it('le lot survit : les 2 copies valides sont produites malgré l’échec du 3e', async () => {
        const archivage = monter({ genererDocPDF: genererDocPDFMixte });
        const { blobs } = await archivage.exporterPourLea('P1', null, false, null);
        expect(blobs).toHaveLength(2);
    });

    it('l’étudiant en échec est NOMMÉ, pas seulement compté', async () => {
        const archivage = monter({ genererDocPDF: genererDocPDFMixte });
        const { echecs } = await archivage.exporterPourLea('P1', null, false, null);
        expect(echecs).toHaveLength(1);
        expect(echecs[0]).toContain('Roy');
        expect(echecs[0]).toContain('222');
        expect(echecs[0]).toContain('Blob introuvable');
    });

    it('la copie livrée SANS page de rétroaction est signalée à part des échecs', async () => {
        const archivage = monter({ genererDocPDF: genererDocPDFMixte });
        const { blobs, echecs, sansSynthese } = await archivage.exporterPourLea('P1', null, false, null);
        // Elle compte parmi les livrées : le PDF est bon, il lui manque une page.
        expect(blobs).toHaveLength(2);
        expect(echecs).toHaveLength(1);
        expect(sansSynthese).toHaveLength(1);
        expect(sansSynthese[0]).toContain('Gagnon');
        expect(sansSynthese[0]).toContain('mise en image');
    });

    it('contrôle : sans aucun échec, les deux listes sont vides (garde ciblée)', async () => {
        const archivage = monter({
            genererDocPDF: async () => ({
                doc: { output: () => ({}) }, synthese: { ajoutee: true, raison: null }
            })
        });
        const { blobs, echecs, sansSynthese } = await archivage.exporterPourLea('P1', null, false, null);
        expect(blobs).toHaveLength(3);
        expect(echecs).toHaveLength(0);
        expect(sansSynthese).toHaveLength(0);
    });
});

describe('#565 · ajouterPageSynthese ne sort plus jamais en silence', () => {
    it('tous les chemins de sortie disent quelque chose', () => {
        const src = readFileSync(path.join(racineProjet, 'js', 'travaux-export-pdf.js'), 'utf8');

        // Isoler le corps de la fonction, puis RETIRER les commentaires avant
        // d'asserter : une sentinelle qui lit la source ne doit pas être
        // satisfaite — ni mise en défaut — par de la documentation.
        const debut = src.indexOf('async function ajouterPageSynthese');
        expect(debut, 'ajouterPageSynthese doit exister').toBeGreaterThan(-1);
        const fin = src.indexOf('\n    }', debut);
        const corps = src.slice(debut, fin)
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/.*$/gm, '');

        // Un `return;` nu (ou `return` suivi d'une fin de ligne) est exactement
        // le défaut B12 : la fonction abandonne sans dire pourquoi.
        expect(corps).not.toMatch(/\breturn\s*;/);
        // Et elle doit bien produire le statut attendu par ses appelants.
        expect(corps).toContain('ajoutee: true');
        expect(corps).toContain('ajoutee: false');
    });
});
