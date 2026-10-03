import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE #892 — « PROPOSER UN NETTOYAGE » N'EFFACE QUE CE QUI EST DÉJÀ EXPORTÉ.
//
// LE DÉFAUT. `proposerNettoyage` prenait LA MOITIÉ LA PLUS ANCIENNE des fichiers
// du groupe, demandait un `confirm` natif qui ne montrait rien, puis effaçait
// blob, vignette et métadonnées — sans corbeille, sans vérifier que le fichier
// était sorti. Décision de Grégoire (20 sept. 2026) : rien ne s'efface de façon
// irréversible ; seul l'exporté est proposé ; sans exporté, rien ne s'efface.
//
// CE QUI EST ÉPROUVÉ :
//   1. la sélection (fonction pure) : non exporté, « exporté » sans date, exporté
//      avant la borne du 16 septembre 2026, annoté APRÈS son export → jamais
//      proposés ; l'âge n'ordonne que la liste ;
//   2. l'écrivain porte SA garde : lui passer tous les ids n'efface que l'exporté,
//      et le stock des autres ne bouge pas d'un octet ;
//   3. l'écran passe par la sélection, ne demande plus de `confirm` natif, et
//      pose les textes validés mot pour mot.
//
// Break-tests (rougis le 20 sept. 2026, avant de faire confiance à ce banc) :
//   A. critère retombé sur « la moitié la plus ancienne » ;
//   B. `dateExport` ignorée (le statut seul suffit) ;
//   C. borne du 16 septembre retirée ;
//   D. annotation postérieure à l'export ignorée ;
//   E. garde de l'écrivain retirée (`permis.has` toujours vrai).
//   F. un `confirm(` natif reposé dans l'écran.
//   G. le test du statut (`blobStatut !== 'exporte'`) retiré — trouvée VERTE par la
//      relecture croisée de Cowork (20 sept., 19 h 54) : aucun essai ne portait une
//      copie re-déposée. Essais ajoutés, mutation reposée : rouge.
//   ⮕ sept mutations, sept rouges.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const ui = readFileSync(path.join(racine, 'js', 'travaux-ui.js'), 'utf8');

const CLE_FICHIERS = 'test_fichiersTravaux';
const CLE_ANNOTATIONS = 'test_annotationsTravaux';

function monter(fichiers, annotations = []) {
    const magasin = {
        [CLE_FICHIERS]: JSON.parse(JSON.stringify(fichiers)),
        [CLE_ANNOTATIONS]: JSON.parse(JSON.stringify(annotations))
    };
    const journal = { blobsSupprimes: [], vignettesSupprimees: [] };
    const db = {
        getSync: (k, d) => (k in magasin ? magasin[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { magasin[k] = v; },
        get: async () => null,
        set: async () => {},
        remove: async (k) => { journal.vignettesSupprimees.push(k); },
        deleteBlob: async (id) => { journal.blobsSupprimes.push(id); },
        listBlobsByStudent: async () => []
    };
    const w = chargerScript('js/travaux-stockage.js', {
        db,
        cle: (k) => 'test_' + k,
        Image: function () {},
        document: { createElement: () => ({ getContext: () => null }) },
        navigator: { storage: null }
    });
    return { travauxStockage: w.travauxStockage, magasin, journal };
}

const F = (id, champs) => Object.assign({
    id, etudiantDA: 'DA_' + id, productionId: 'P1', groupeCoursId: 'GC1',
    tailleFichier: 1000, dateImport: '2026-09-01T12:00:00.000Z', blobStatut: 'present'
}, champs);

// Les quatre cas de la consigne, du plus ANCIEN au plus récent à l'import : avec
// l'ancien critère (« la moitié la plus ancienne »), ce sont les deux premiers
// qui partaient — dont un jamais exporté.
const QUATRE = [
    F('FT_jamais', { dateImport: '2026-08-25T12:00:00.000Z' }),
    F('FT_sansdate', { dateImport: '2026-08-26T12:00:00.000Z', blobStatut: 'exporte' }),
    F('FT_dix_sept', { dateImport: '2026-08-27T12:00:00.000Z', blobStatut: 'exporte', dateExport: '2026-09-10T15:00:00.000Z' }),
    F('FT_hier', { dateImport: '2026-08-28T12:00:00.000Z', blobStatut: 'exporte', dateExport: '2026-09-19T15:00:00.000Z' })
];

describe('#892 · la sélection : seul un fichier exporté, de marque fiable, est proposé', () => {
    it('des quatre cas de la consigne, seul l\'exporté d\'hier est proposé', () => {
        const { travauxStockage } = monter([]);
        const tri = travauxStockage.selectionnerCopiesARetirer(QUATRE, []);
        expect(tri.aRetirer.map(f => f.id)).toEqual(['FT_hier']);
    });

    it('l\'exporté du 10 septembre est compté à part, pour être DIT à l\'écran', () => {
        const { travauxStockage } = monter([]);
        const tri = travauxStockage.selectionnerCopiesARetirer(QUATRE, []);
        expect(tri.marqueAncienne.map(f => f.id)).toEqual(['FT_dix_sept']);
    });

    it('une `dateExport` illisible vaut une date absente', () => {
        const { travauxStockage } = monter([]);
        const tri = travauxStockage.selectionnerCopiesARetirer(
            [F('FT_x', { blobStatut: 'exporte', dateExport: 'pas une date' })], []);
        expect(tri.aRetirer).toEqual([]);
        expect(tri.marqueAncienne).toEqual([]);
    });

    it('une copie annotée APRÈS son export n\'est pas proposée ; annotée avant, elle l\'est', () => {
        const { travauxStockage } = monter([]);
        const fichiers = [
            F('FT_apres', { blobStatut: 'exporte', dateExport: '2026-09-18T15:00:00.000Z' }),
            F('FT_avant', { blobStatut: 'exporte', dateExport: '2026-09-18T15:00:00.000Z' })
        ];
        const annotations = [
            { id: 'A1', fichierId: 'FT_apres', dateModification: '2026-09-19T09:00:00.000Z' },
            { id: 'A2', fichierId: 'FT_avant', dateModification: '2026-09-17T09:00:00.000Z' }
        ];
        const tri = travauxStockage.selectionnerCopiesARetirer(fichiers, annotations);
        expect(tri.aRetirer.map(f => f.id)).toEqual(['FT_avant']);
    });

    it('l\'âge n\'ordonne que la liste : le plus anciennement exporté d\'abord', () => {
        const { travauxStockage } = monter([]);
        const tri = travauxStockage.selectionnerCopiesARetirer([
            F('FT_b', { blobStatut: 'exporte', dateExport: '2026-09-19T15:00:00.000Z' }),
            F('FT_a', { blobStatut: 'exporte', dateExport: '2026-09-17T15:00:00.000Z' })
        ], []);
        expect(tri.aRetirer.map(f => f.id)).toEqual(['FT_a', 'FT_b']);
    });

    it('la sélection ne réécrit rien', () => {
        const { travauxStockage, magasin } = monter(QUATRE);
        const avant = JSON.stringify(magasin);
        travauxStockage.selectionnerCopiesARetirer(travauxStockage.obtenirFichiersTravaux(), []);
        expect(JSON.stringify(magasin)).toBe(avant);
    });
});

describe('#892 · l\'écrivain porte sa garde : il ne peut pas effacer un fichier non exporté', () => {
    it('lui passer TOUS les ids n\'efface que l\'exporté ; le reste du stock est intact', async () => {
        const { travauxStockage, magasin, journal } = monter(QUATRE);
        const temoin = JSON.stringify(QUATRE.filter(f => f.id !== 'FT_hier'));

        const retires = await travauxStockage.nettoyerFichiersArchives(QUATRE.map(f => f.id));

        expect(retires).toBe(1);
        expect(journal.blobsSupprimes).toEqual(['FT_hier']);
        expect(journal.vignettesSupprimees).toEqual(['thumbnail_FT_hier']);
        expect(JSON.stringify(magasin[CLE_FICHIERS])).toBe(temoin);
    });

    it('une copie annotée entre l\'affichage de la liste et le clic n\'est plus effacée', async () => {
        const { travauxStockage, magasin, journal } = monter(QUATRE);
        magasin[CLE_ANNOTATIONS] = [{ id: 'A1', fichierId: 'FT_hier', dateModification: '2026-09-20T09:00:00.000Z' }];

        const retires = await travauxStockage.nettoyerFichiersArchives(['FT_hier']);

        expect(retires).toBe(0);
        expect(journal.blobsSupprimes).toEqual([]);
        expect(magasin[CLE_FICHIERS].map(f => f.id)).toContain('FT_hier');
    });

    it('sans aucun exporté, rien ne s\'efface', async () => {
        const { travauxStockage, magasin, journal } = monter([QUATRE[0], QUATRE[1]]);
        const avant = JSON.stringify(magasin);
        expect(await travauxStockage.nettoyerFichiersArchives(['FT_jamais', 'FT_sansdate'])).toBe(0);
        expect(journal.blobsSupprimes).toEqual([]);
        expect(JSON.stringify(magasin)).toBe(avant);
    });

    // Re-déposer une copie remet `blobStatut = 'present'` SANS effacer `dateExport`
    // (`travaux-import.js`, remplacement du blob sous le même id) : la date dit
    // « sortie hier », le fichier est NEUF et n'est jamais sorti. Même chose pour
    // une copie `manquant` qui garde sa date. Seul le statut les écarte.
    const REDEPOSEES = [
        F('FT_redeposee', { blobStatut: 'present', dateExport: '2026-09-19T15:00:00.000Z' }),
        F('FT_manquante', { blobStatut: 'manquant', dateExport: '2026-09-19T15:00:00.000Z' })
    ];

    it('une copie re-déposée (`present`) ou `manquant` qui garde sa date d\'export n\'est pas proposée', () => {
        const { travauxStockage } = monter([]);
        const tri = travauxStockage.selectionnerCopiesARetirer(REDEPOSEES, []);
        expect(tri.aRetirer).toEqual([]);
        expect(tri.marqueAncienne).toEqual([]);
    });

    it('et l\'écrivain, appelé avec leurs ids, ne les efface pas', async () => {
        const { travauxStockage, magasin, journal } = monter(REDEPOSEES);
        const avant = JSON.stringify(magasin);
        expect(await travauxStockage.nettoyerFichiersArchives(['FT_redeposee', 'FT_manquante'])).toBe(0);
        expect(journal.blobsSupprimes).toEqual([]);
        expect(journal.vignettesSupprimees).toEqual([]);
        expect(JSON.stringify(magasin)).toBe(avant);
    });

    it('`nettoyerFichiersArchives` n\'a qu\'un appelant : l\'écran du nettoyage', () => {
        const js = path.join(racine, 'js');
        const appelants = [];
        (function parcourir(dossier) {
            for (const nom of readdirSync(dossier, { withFileTypes: true })) {
                const chemin = path.join(dossier, nom.name);
                if (nom.isDirectory()) parcourir(chemin);
                else if (nom.name.endsWith('.js')) {
                    const n = (readFileSync(chemin, 'utf8').match(/\.nettoyerFichiersArchives\(/g) || []).length;
                    if (n > 0) appelants.push(path.relative(racine, chemin) + ' ×' + n);
                }
            }
        })(js);
        expect(appelants).toEqual(['js/travaux-ui.js ×1']);
    });
});

describe('#892 · l\'écran : la liste est vue, et les textes sont ceux que Grégoire a validés', () => {
    const fonction = tranche(ui, '    async function proposerNettoyage() {', '       PREPARATION DES IMAGES', { longueurMin: 3000 });

    it('l\'écran passe par la sélection et ne trie plus par moitié', () => {
        expect(fonction).toContain('travauxStockage.selectionnerCopiesARetirer(');
        expect(fonction).not.toMatch(/Math\.ceil\([^)]*\/\s*2\)/);
        expect(fonction).not.toContain('dateImport');
    });

    it('plus de dialogue natif : ni `confirm(` ni `alert(`', () => {
        expect(fonction).not.toMatch(/\bconfirm\(/);
        expect(fonction).not.toMatch(/\balert\(/);
    });

    it('ce qui part est la liste CAPTURÉE à l\'affichage', () => {
        expect(fonction).toContain('const ids = aRetirer.map(f => f.id);');
        expect(fonction).toContain('travauxStockage.nettoyerFichiersArchives(ids)');
    });

    it('sans exporté, l\'écran sort AVANT toute offre de retrait', () => {
        const sortie = fonction.indexOf('if (aRetirer.length === 0) {');
        const retrait = fonction.indexOf('nettoyerFichiersArchives(');
        expect(sortie).toBeGreaterThan(-1);
        expect(retrait).toBeGreaterThan(sortie);
        expect(tranche(fonction, 'if (aRetirer.length === 0) {', 'const etudiants =', { longueurMin: 200 })).toContain('return;');
    });

    it('les textes validés sont posés mot pour mot', () => {
        const source = fonction.replace(/\\'/g, '\'');
        for (const texte of [
            'Libérer de l\'espace',
            'Ces copies ont déjà été exportées : leur fichier existe ailleurs, sur ton ordinateur. Les retirer d\'ici libère de l\'espace tout de suite. Les copies qui n\'ont pas encore été exportées ne sont jamais proposées.',
            'Retirer ces ${n} copies (${taille})',
            'Rien à retirer sans risque',
            'Aucune copie de ce groupe n\'a encore été exportée : les retirer les perdrait. Exporte-les d\'abord dans « Exporter et archiver », puis reviens ici.',
            '${nbAnciennes} copies portent une marque d\'exportation antérieure au 16 septembre 2026, que l\'application ne garantit pas. Elles ne sont pas proposées : exporte-les de nouveau si tu veux les retirer.',
            '${nbEvaluees} de ces copies sont évaluées. Leur évaluation reste : la note, la grille et la rétroaction ne bougent pas. Seule la copie annotée ne s\'ouvrira plus ici.'
        ]) {
            expect(source, 'texte absent : ' + texte.slice(0, 50)).toContain(texte);
        }
    });

    it('chaque donnée de la liste est échappée', () => {
        const ligne = tranche(fonction, 'return `<li', '</li>`', { longueurMin: 200 });
        const interpolations = ligne.match(/\$\{[^}]+\}/g) || [];
        expect(interpolations.length).toBeGreaterThanOrEqual(5);
        for (const i of interpolations) expect(i, 'non échappé : ' + i).toMatch(/^\$\{echapperHtml\(/);
    });
});
