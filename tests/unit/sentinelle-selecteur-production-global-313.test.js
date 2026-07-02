import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #313 — sentinelle écrasement silencieux du sélecteur global de production
// (2 juillet 2026, décision Grégoire 29 juin 2026).
// Bug réel : le pipeline d'import expose DEUX selects « Production » — le
// GLOBAL (associerProductionGlobale, tout le lot) et le PAR-FICHIER
// (« Modifier », changerProductionPipeline). Le global réécrivait f.productionId
// sur TOUS les fichiers, écrasant silencieusement les corrections par-fichier.
// Contrat verrouillé :
//  1. un choix par-fichier DIVERGENT (« Modifier ») survit au sélecteur global ;
//  2. les fichiers sans correction par-fichier suivent toujours le global ;
//  3. la désélection globale (« — ») ne vide pas un choix par-fichier ;
//  4. revenir à « — » dans « Modifier » rend la main au global ;
//  5. zéro-dette : l'ancien setter mort associerProductionPipeline est retiré.

let queue;
let win;

function fichierPipeline(id) {
    return {
        id,
        etudiantDA: 'DA-' + id,
        productionId: '',
        productionIdParLea: false,
        estReprise: false,
        parseLea: {},
        pipelineStatut: 'pret'
    };
}

beforeEach(() => {
    queue = [fichierPipeline('F1'), fichierPipeline('F2'), fichierPipeline('F3')];

    const travauxImport = {
        obtenirFileDAttente: () => queue,
        setProductionGlobale: () => {},
        getProductionGlobale: () => '',
        trouverEtudiantParDA: () => null
    };

    win = chargerScript('js/travaux-ui.js', {
        travauxImport,
        travauxStockage: { obtenirThumbnailSync: () => null, formaterTaille: () => '' },
        obtenirDonneesSelonMode: () => [],
        echapperHtml: (s) => String(s),
        // Neutraliser le re-rendu différé (DOM absent dans le sandbox)
        setTimeout: () => 0,
        clearTimeout: () => {}
    }, { addEventListener: () => {}, removeEventListener: () => {} });
});

describe('#313 · sélecteur global vs corrections par-fichier « Modifier »', () => {
    it('un choix par-fichier divergent SURVIT au sélecteur global', () => {
        // Correction par-fichier sur F2
        win.travauxUI.changerProductionPipeline(1, 'PROD-SPECIALE');
        // Puis choix global
        win.travauxUI.associerProductionGlobale('PROD-LOT');

        expect(queue[0].productionId).toBe('PROD-LOT');
        expect(queue[1].productionId).toBe('PROD-SPECIALE'); // préservé
        expect(queue[2].productionId).toBe('PROD-LOT');
    });

    it('sans correction par-fichier, tout le lot suit le global (comportement intact)', () => {
        win.travauxUI.associerProductionGlobale('PROD-LOT');

        expect(queue.map(f => f.productionId)).toEqual(['PROD-LOT', 'PROD-LOT', 'PROD-LOT']);
    });

    it('la désélection globale (« — ») ne vide PAS un choix par-fichier', () => {
        win.travauxUI.changerProductionPipeline(0, 'PROD-SPECIALE');
        win.travauxUI.associerProductionGlobale('');

        expect(queue[0].productionId).toBe('PROD-SPECIALE');
        expect(queue[1].productionId).toBe('');
    });

    it('revenir à « — » dans « Modifier » rend la main au sélecteur global', () => {
        win.travauxUI.changerProductionPipeline(1, 'PROD-SPECIALE');
        win.travauxUI.changerProductionPipeline(1, ''); // l'utilisateur annule sa correction
        win.travauxUI.associerProductionGlobale('PROD-LOT');

        expect(queue[1].productionId).toBe('PROD-LOT');
    });

    it('le global écrase toujours une identification parseLea (intention utilisateur forte)', () => {
        queue[2].productionId = 'PROD-LEA';
        queue[2].productionIdParLea = true;

        win.travauxUI.associerProductionGlobale('PROD-LOT');

        expect(queue[2].productionId).toBe('PROD-LOT');
        expect(queue[2].productionIdParLea).toBe(false);
    });

    it('zéro-dette #313 : le setter mort associerProductionPipeline est retiré', () => {
        expect(win.travauxUI.associerProductionPipeline).toBeUndefined();
        expect(typeof win.travauxUI.changerProductionPipeline).toBe('function');
        expect(typeof win.travauxUI.associerProductionGlobale).toBe('function');
    });
});
