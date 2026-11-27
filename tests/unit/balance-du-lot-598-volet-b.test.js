import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #598 VOLET B (décision de Grégoire, 27 nov. 2026) — LA BALANCE DES BLANCS POUR TOUT LE LOT.
// Évaluation › Préparer, étape « Optimisation ». La balance automatique était appliquée en dur
// (`optBalance = true`, puis `BALANCE_GLOBALE_ACTIVE = true` au volet A). Décision : une case
// « Balance des blancs », à côté de « Rés. max. », cochée au départ. Décochée, la balance ne
// s'applique ni aux aperçus ni à l'image importée : les deux lisent `balanceActiveePour`, la seule
// source (sentinelle 598). « Rés. max. » se retient d'un lot à l'autre (variable du module et
// session) : la case fait de même.
// Le bouton « Balance des blancs » des réglages spécifiques (la pipette, une image) ne change pas :
// sa correction est cuite dans l'image par `renduFinal`, et elle remplace la balance automatique
// (lot/perspective-coins, 17 nov.).

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function faireSession(initial) {
    return {
        _d: Object.assign({}, initial || {}),
        getItem(k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
        setItem(k, v) { this._d[k] = String(v); },
        removeItem(k) { delete this._d[k]; },
        clear() { this._d = {}; }
    };
}

function image(nom, extra) {
    return Object.assign({
        nomFichier: nom, estImage: true, estPDF: false, pipelineStatut: 'a-optimiser',
        fichier: { size: 10, nom }, parseLea: {}, operations: []
    }, extra || {});
}

let ui, session, queue, balancees, apercusRefaits;

function monter(sessionInitiale) {
    session = faireSession(sessionInitiale);
    queue = [];
    balancees = [];
    apercusRefaits = 0;
    const travauxImport = {
        obtenirFileDAttente: () => queue,
        regrouperParDocument: () => new Map(),
        trouverEtudiantParDA: () => null,
        persisterFileDAttente: () => {},
        purgerFichiersImportes: () => 0,
        importerTous: async () => ({ importes: queue.length, erreurs: 0, doublons: [], total: queue.length }),
        getProductionGlobale: () => '',
        oublierProductionDuLot: () => {},
        viderFileDAttente: () => { queue.length = 0; }
    };
    const win = chargerScript('js/travaux-ui.js', {
        travauxImport,
        travauxStockage: { obtenirThumbnailSync: () => null, formaterTaille: () => '', obtenirFichiersGroupeActif: () => [] },
        travauxPreparation: { autoBalanceBlancs: async (blob) => { balancees.push(blob.nom); return blob; } },
        obtenirDonneesSelonMode: () => [],
        echapperHtml: (s) => String(s),
        db: { getSync: (k, d) => (k === 'groupeCoursActif' ? { id: 'gc_1' } : d), setSync: () => {} },
        notifications: { succes: () => {}, erreur: () => {}, info: () => {} },
        sessionStorage: session,
        // Le « yield » de 100 ms du traitement par lots se résout ; les rendus différés (150 et
        // 300 ms) ne partent pas : le banc compte les aperçus demandés.
        setTimeout: (fn, ms) => { if (ms === 100) Promise.resolve().then(fn); else if (ms === 300) apercusRefaits++; return 0; },
        clearTimeout: () => {}
    }, { addEventListener: () => {}, removeEventListener: () => {} });
    return win.travauxUI;
}

beforeEach(() => {
    ui = monter();
});

describe('#598 volet B — la case « Balance des blancs » vaut pour tout le lot', () => {
    it('cochée au départ, et l\'Inspecteur la pose avec ses mots', () => {
        expect(ui.balanceActiveePour(image('a.jpg'))).toBe(true);
        const html = ui.htmlCaseBalanceDuLot();
        expect(html).toMatch(/<input type="checkbox"[^>]*\schecked>/);
        expect(html).toContain('data-on-change="travauxUI.basculerBalanceDuLot"');
        expect(html).toMatch(/>Balance des blancs<\/label>$/);
        expect(html).toContain('min-height:44px');   // la cible tactile de l'iPad (mesurée à 26 px sans)
    });

    it('décochée, plus aucun fichier du lot ne la reçoit, et les aperçus se refont', () => {
        ui.basculerBalanceDuLot({ checked: false });
        expect(ui.balanceActiveePour(image('a.jpg'))).toBe(false);
        expect(ui.balanceActiveePour(image('b.jpg', { skipBalance: false }))).toBe(false);
        expect(ui.htmlCaseBalanceDuLot()).not.toMatch(/\schecked>/);
        expect(apercusRefaits).toBe(1);
        ui.basculerBalanceDuLot({ checked: true });
        expect(ui.balanceActiveePour(image('a.jpg'))).toBe(true);
    });

    it('décochée, l\'image importée ne la reçoit pas ; cochée, elle la reçoit', async () => {
        queue.push(image('a.jpg'), image('b.jpg'));
        ui.basculerBalanceDuLot({ checked: false });
        await ui._executerImportPipeline();
        expect(balancees).toEqual([]);

        queue.length = 0;
        queue.push(image('c.jpg'), image('d.jpg', { skipBalance: true }));
        ui.basculerBalanceDuLot({ checked: true });
        await ui._executerImportPipeline();
        expect(balancees).toEqual(['c.jpg']);   // l'exception par fichier reste une exception
    });

    it('les réglages spécifiques ne changent pas : une couleur réglée à la main remplace la balance automatique, case cochée ou non', () => {
        const pipette = image('e.jpg', { operations: [{ type: 'whiteBalance', rFactor: 1.1, gFactor: 1, bFactor: 0.9 }] });
        expect(ui.balanceActiveePour(pipette)).toBe(false);
        ui.basculerBalanceDuLot({ checked: false });
        expect(ui.balanceActiveePour(pipette)).toBe(false);
    });

    it('retenue d\'un lot à l\'autre comme « Rés. max. » : la session la garde, un module rechargé la relit', () => {
        ui.basculerBalanceDuLot({ checked: false });
        expect(session.getItem('travaux-pipeline-balance')).toBe('false');
        // « Annuler tout » ne la touche pas (pas plus que « Rés. max. »).
        ui.annulerImport();
        expect(ui.balanceActiveePour(image('a.jpg'))).toBe(false);

        const rechargee = monter({ 'travaux-pipeline-balance': 'false', 'travaux-pipeline-dpi': '300' });
        expect(rechargee.balanceActiveePour(image('a.jpg'))).toBe(false);
        expect(rechargee.htmlCaseBalanceDuLot()).not.toMatch(/\schecked>/);
        expect(monter({ 'travaux-pipeline-balance': 'true' }).balanceActiveePour(image('a.jpg'))).toBe(true);
    });

    it('la case est posée à côté de « Rés. max. », sur la même ligne de l\'Inspecteur', () => {
        const src = readFileSync(path.join(RACINE, 'js', 'travaux-ui.js'), 'utf8');
        const ligne = src.split('\n').find((l) => l.includes('id="pipeline-opt-dpi"'));
        expect(ligne).toBeTruthy();
        expect(ligne.indexOf('${optionsDpi}</select></label>${htmlCaseBalanceDuLot()}')).toBeGreaterThan(-1);
    });
});
