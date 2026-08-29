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
//   A — comportement : `changerProductionFichier` rend false sur un refus (et ne
//       déplace rien en corbeille), true quand le stockage a réassocié ;
//   B — cliquet : l'appelant de la Liste ATTEND ce verdict et ne marque la reprise
//       qu'après un verdict vrai.

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

describe('#561 · A — changerProductionFichier rend un verdict', () => {
    it('conflit + refus : false, rien en corbeille, aucune réassociation', async () => {
        const { win, journal } = monter({ conflit: true, confirmer: false });
        const r = await win.travauxUI.changerProductionFichier('F1', 'P2');
        expect(r).toBe(false);
        expect(journal.some(j => j[0] === 'corbeille')).toBe(false);
        expect(journal.filter(j => j[0] === 'reassocier' && j[3] === false)).toEqual([]);
    });

    it('évaluation orpheline + refus : false', async () => {
        const { win } = monter({ orpheline: true, confirmer: false });
        expect(await win.travauxUI.changerProductionFichier('F1', 'P2')).toBe(false);
    });

    it('sans obstacle : true, et le stockage a bien réassocié', async () => {
        const { win, journal } = monter();
        expect(await win.travauxUI.changerProductionFichier('F1', 'P2')).toBe(true);
        expect(journal.filter(j => j[0] === 'reassocier' && j[3] === false)).toEqual([['reassocier', 'F1', 'P2', false]]);
    });

    it('le stockage refuse : false', async () => {
        const { win } = monter({ stockageOk: false });
        expect(await win.travauxUI.changerProductionFichier('F1', 'P2')).toBe(false);
    });
});

describe('#561 · B — cliquet : la Liste attend le verdict avant de marquer la reprise', () => {
    it('await + garde sur le verdict, AVANT estReprise: true', () => {
        const src = readFileSync(path.join(racineProjet, 'js', 'liste-evaluations.js'), 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
        const i = src.indexOf('function associerProductionDepuisListe(');
        expect(i).toBeGreaterThan(-1);
        const corps = src.slice(i, src.indexOf('\nfunction ', i + 10));
        const posAwait = corps.search(/await travauxUI\.changerProductionFichier\(fichierId, jetonProdId\)/);
        const posGarde = corps.indexOf('if (!reassocie)');
        const posReprise = corps.indexOf('{ estReprise: true }');
        expect(posAwait, 'la réassociation doit être attendue').toBeGreaterThan(-1);
        expect(posGarde, 'le verdict doit être testé').toBeGreaterThan(posAwait);
        expect(posReprise, 'estReprise ne se pose qu\'après le verdict').toBeGreaterThan(posGarde);
        // Aucun appel non attendu ne subsiste.
        expect(corps).not.toMatch(/^\s*travauxUI\.changerProductionFichier\(/m);
    });
});
