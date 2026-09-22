import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #561 (29 août 2026) — LA RÉASSOCIATION REND UN VERDICT, ET L'APPELANT L'ATTEND.
//
// Constat B6 de l'audit du 25 août : `associerProductionDepuisListe` n'attendait pas
// `travauxUI.changerProductionFichier` (async, arrêtée par un `confirm()` refusé)
// et marquait quand même `estReprise: true` puis consommait le jeton — reprise
// créée sur l'ANCIENNE production. Cause amont : la fonction ne rendait rien (son
// `if (ok) {}` vide, sous-constat de #572).
//
// #932 (22 sept. 2026) — `changerProductionFichier` est devenue `reassignerCopie`
// (production ET élève, même porte), et le jeton de reprise vit dans Propriétés
// (`ouvrirProprieteFichier`), la modale aveugle de la Liste étant retirée. Le
// verdict et son cliquet sont les mêmes ; seuls les noms suivent.
//
//   A — comportement : `reassignerCopie` rend false sur un refus (et ne
//       déplace rien en corbeille), true quand le stockage a réassocié ;
//   B — cliquet : l'enregistrement de Propriétés ATTEND ce verdict et ne marque
//       la reprise qu'après un verdict vrai.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

function monter({ conflit = false, orpheline = false, confirmer = true, stockageOk = true } = {}) {
    const journal = [];
    const travauxStockage = {
        obtenirThumbnailSync: () => null, formaterTaille: () => '',
        reassocierFichier: (id, modifs, options) => {
            journal.push(['reassocier', id, modifs.productionId, !!(options && options.verificationSeule)]);
            if (options && options.verificationSeule) return { conflit, fichierExistant: { id: 'F_EXISTANT' }, evaluationOrpheline: orpheline };
            return stockageOk;
        },
        deplacerEnCorbeille: (id) => { journal.push(['corbeille', id]); }
    };
    const win = chargerScript('js/travaux-ui.js', {
        travauxImport: {},
        travauxStockage,
        obtenirDonneesSelonMode: () => [{ id: 'P2', titre: 'Production 2' }],
        echapperHtml: (s) => String(s),
        confirm: () => confirmer,
        setTimeout: () => 0, clearTimeout: () => {}
    }, { addEventListener: () => {}, removeEventListener: () => {} });
    return { win, journal };
}

describe('#561 · A — reassignerCopie rend un verdict', () => {
    it('conflit + refus : false, rien en corbeille, aucune réassociation', async () => {
        const { win, journal } = monter({ conflit: true, confirmer: false });
        const r = await win.travauxUI.reassignerCopie('F1', { productionId: 'P2' });
        expect(r).toBe(false);
        expect(journal.some(j => j[0] === 'corbeille')).toBe(false);
        expect(journal.filter(j => j[0] === 'reassocier' && j[3] === false)).toEqual([]);
    });

    it('évaluation orpheline + refus : false', async () => {
        const { win } = monter({ orpheline: true, confirmer: false });
        expect(await win.travauxUI.reassignerCopie('F1', { productionId: 'P2' })).toBe(false);
    });

    it('sans obstacle : true, et le stockage a bien réassocié', async () => {
        const { win, journal } = monter();
        expect(await win.travauxUI.reassignerCopie('F1', { productionId: 'P2' })).toBe(true);
        expect(journal.filter(j => j[0] === 'reassocier' && j[3] === false)).toEqual([['reassocier', 'F1', 'P2', false]]);
    });

    it('le stockage refuse : false', async () => {
        const { win } = monter({ stockageOk: false });
        expect(await win.travauxUI.reassignerCopie('F1', { productionId: 'P2' })).toBe(false);
    });
});

describe('#561 · B — cliquet : Propriétés attend le verdict avant de marquer la reprise', () => {
    const src = readFileSync(path.join(racineProjet, 'js', 'liste-evaluations.js'), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

    it('await + garde sur le verdict, AVANT le jeton de reprise', () => {
        const i = src.indexOf('function ouvrirProprieteFichier(');
        expect(i).toBeGreaterThan(-1);
        const corps = src.slice(i, src.indexOf('\nfunction ', i + 10));
        const posAwait = corps.search(/await travauxUI\.reassignerCopie\(fichierId, association\)/);
        const posGarde = corps.indexOf('if (!reassigne)');
        const posJeton = corps.indexOf('appliquerJetonRepriseSurCopie(fichierId');
        expect(posAwait, 'la réassignation doit être attendue').toBeGreaterThan(-1);
        expect(posGarde, 'le verdict doit être testé').toBeGreaterThan(posAwait);
        expect(posJeton, 'le jeton ne s\'applique qu\'après le verdict').toBeGreaterThan(posGarde);
        // Aucun appel non attendu ne subsiste.
        expect(corps).not.toMatch(/^\s*travauxUI\.reassignerCopie\(/m);
    });

    it('`estReprise: true` ne se pose QUE dans appliquerJetonRepriseSurCopie', () => {
        const occurrences = src.split('{ estReprise: true }').length - 1;
        expect(occurrences).toBe(1);
        const i = src.indexOf('function appliquerJetonRepriseSurCopie(');
        expect(i).toBeGreaterThan(-1);
        const corps = src.slice(i, src.indexOf('\nfunction ', i + 10));
        expect(corps).toContain('{ estReprise: true }');
    });
});
