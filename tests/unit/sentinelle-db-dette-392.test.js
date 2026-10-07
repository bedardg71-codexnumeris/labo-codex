import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #392 (audit qualité 5 août 2026, rapports C3+C4+C5, 🟢) —
// C3 : un setSync/removeSync émis AVANT la fin de db.init() n'atteignait
//      JAMAIS IndexedDB (clé invisible à db.keys() ; suppression ressuscitée
//      au boot par syncToLocalStorageCache). File _operationsAvantInit
//      rejouée par _rejouerOperationsAvantInit() à la fin de _init().
// C4 : db.get() ignorait memoryCache — une lecture async pouvait rendre une
//      valeur périmée pendant qu'une écriture setSync était pendante.
// C5 : registre _SSOT_OWNERS réaligné sur les écrivains réels post-refactor.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

function fauxLocalStorage() {
    const ls = {};
    return {
        get length() { return Object.keys(ls).length; },
        key: (i) => Object.keys(ls)[i] ?? null,
        getItem: (k) => (k in ls ? JSON.stringify(ls[k]) : null),
        setItem: (k, v) => { ls[k] = JSON.parse(v); },
        removeItem: (k) => { delete ls[k]; }
    };
}
const chargerDb = () => chargerScript('js/db.js', { localStorage: fauxLocalStorage() },
    { addEventListener: () => {}, dispatchEvent: () => {} });

describe('#392 C4 · db.get() consulte memoryCache en premier', () => {
    it('rend la valeur de memoryCache même absente des autres couches', async () => {
        const win = chargerDb();
        win.db.memoryCache.set('grosseCle', { fraiche: true });
        const lu = await win.db.get('grosseCle', null);
        expect(lu).toEqual({ fraiche: true });
    });
});

describe('#392 C3 · opérations synchrones pré-init rejouées vers IndexedDB', () => {
    it('setSync/removeSync avant ready sont mémorisées puis rejouées', () => {
        const win = chargerDb();
        // Simuler l'état pré-init
        win.db.ready = false;
        win.db.setSync('cleA', [1, 2]);
        win.db.removeSync('cleB');
        expect(win.db._operationsAvantInit).toEqual([
            { type: 'set', key: 'cleA', value: [1, 2] },
            { type: 'remove', key: 'cleB' }
        ]);
        // Rejeu quand IndexedDB devient disponible
        win.db.ready = true;
        win.db.useIndexedDB = true;
        win.db._trackWrite = vi.fn();
        // #1030 : `_trackOperation` rend la promesse d'origine (contrat réel) ; la suppression
        // rejouée l'attend pour dire un échec éventuel.
        win.db._trackOperation = vi.fn((promesse) => promesse);
        win.db._removeIndexedDB = vi.fn(() => Promise.resolve());
        win.db._rejouerOperationsAvantInit();
        expect(win.db._trackWrite).toHaveBeenCalledWith('cleA', [1, 2]);
        expect(win.db._removeIndexedDB).toHaveBeenCalledWith('cleB');
        expect(win.db._operationsAvantInit).toHaveLength(0);
    });

    it('_init appelle le rejeu (câblage réel, pas seulement la méthode)', () => {
        const src = readFileSync(path.join(racineProjet, 'js', 'db.js'), 'utf8');
        expect(src).toMatch(/this\.ready = true;\s*\n\s*this\._rejouerOperationsAvantInit\(\);/);
    });
});

describe('#392 C5 · registre _SSOT_OWNERS réaligné sur les écrivains réels', () => {
    const src = readFileSync(path.join(racineProjet, 'js', 'db.js'), 'utf8');
    it('groupeEtudiants / cadreCalendrier / groupeCoursActif / journeesSansCours', () => {
        expect(src).toMatch(/'groupeEtudiants':\s*\['trimestre-v2-etudiants\.js'\]/);
        expect(src).toMatch(/'cadreCalendrier':\s*\['trimestre-v2-init\.js', 'trimestre\.js'\]/);
        expect(src).toMatch(/'groupeCoursActif':\s*\['trimestre-v2-orchestre\.js', 'trimestre-v2-groupes-cours\.js'\]/);
        expect(src).toMatch(/'journeesSansCours':\s*\['trimestre-v2-init\.js', 'migrations\.js'\]/);
    });
});
