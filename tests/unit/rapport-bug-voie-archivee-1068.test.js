/**
 * #1068 (3 nov. 2026) — UN RAPPORT DE BUG ARCHIVÉ DIT PAR OÙ IL EST PARTI.
 * Observé : « Copier le rapport » écrivait dans `rapportsBugArchives` une entrée `envoye: true`,
 * alors que le rapport n'avait été que copié. Les trois voies (copier, télécharger le TXT, ouvrir
 * le courriel) posaient le même `envoye: true` en dur. L'entrée dit maintenant sa `voie`.
 * Le vrai module, dans un JSDOM ; les trois boutons appelés tels quels.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = readFileSync(path.join(racine, 'js/rapport-bug.js'), 'utf8');

let w, magasin;
beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body><textarea id="descriptionBug">Un défaut fictif</textarea></body></html>',
        { runScripts: 'outside-only', url: 'https://exemple.test/' });
    w = dom.window;
    magasin = {};
    w.db = {
        getSync: (k, d) => (k in magasin ? JSON.parse(JSON.stringify(magasin[k])) : d),
        setSync: (k, v) => { magasin[k] = JSON.parse(JSON.stringify(v)); }
    };
    Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: async () => {} }, configurable: true });
    let n = 0;
    w.genererIdUnique = (prefixe) => prefixe + (++n);   // utils.js, chargé avant dans l'application
    w.URL.createObjectURL = () => 'blob:fictif';
    w.URL.revokeObjectURL = () => {};
    w.eval(source);
});

const archives = () => magasin.rapportsBugArchives || [];

describe('#1068 — l\'archive dit la voie du rapport, et « envoyé » ne se dit plus d\'une copie', () => {
    it('« Copier le rapport » archive une copie', async () => {
        await w.copierRapportBug(null);
        expect(archives()).toHaveLength(1);
        expect(archives()[0].voie).toBe('copie');
        expect(archives()[0].envoye).toBeUndefined();
    });

    it('« Télécharger le TXT » archive un fichier', async () => {
        await w.telechargerRapportTxt(null);
        expect(archives()).toHaveLength(1);
        expect(archives()[0].voie).toBe('fichier');
    });

    it('« Envoyer par courriel » archive un courriel', () => {
        w.envoyerRapportParCourriel(null);
        expect(archives()).toHaveLength(1);
        expect(archives()[0].voie).toBe('courriel');
    });
});
