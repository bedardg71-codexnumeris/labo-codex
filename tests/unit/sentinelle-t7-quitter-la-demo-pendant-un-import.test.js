import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// =====================================================================
// SENTINELLE T7 DU CHANTIER DU DÉMO — QUITTER LA DÉMO PENDANT UN IMPORT
// =====================================================================
//
// Constat C3 de Rapports/AUDIT-2026-10-05-chantier-demo.md : `importerTous` attend chaque
// fichier, et chaque fiche s'écrit sous `cle('fichiersTravaux')` au moment de son écriture.
// Quitter la démo pendant l'import rangeait les copies suivantes du démo dans le trimestre
// restauré. La sortie est bloquée tant que `travauxImport.importEnCours` est vrai.
//
// CE QUE CE BANC JUGE, par le vrai js/demo-activation.js :
//   (a) import en cours : « Quitter la démo » ne change rien et donne un avis ;
//   (b) sans import : la sortie se fait comme avant ;
//   (c) la case de l'accueil passe par la même garde et reste cochée.
// TÉMOIN : la garde neutralisée, la sortie se fait pendant l'import (rouge attendu).

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function base() {
    const store = {
        'demo-actif': 'true',
        trimestres: [{ id: 'h2026' }, { id: 'demo' }],
        trimestreActif: 'demo',
        listeCours: [], cours: [], enseignants: []
    };
    return {
        store,
        db: {
            getSync: (k, d) => (k in store ? store[k] : d),
            setSync: (k, v) => { store[k] = v; },
            removeSync: (k) => { delete store[k]; }
        }
    };
}

function monter(importEnCours, muter) {
    const { store, db } = base();
    const avis = [];
    const win = {
        travauxImport: { importEnCours },
        notifications: { warning: (m, d) => avis.push([m, d]) }
    };
    const brut = readFileSync(path.join(racine, 'js/demo-activation.js'), 'utf8');
    const code = muter ? muter(brut) : brut;
    if (muter && code === brut) throw new Error('Témoin inerte : la mutation n\'a rien remplacé dans js/demo-activation.js.');
    const doc = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], body: { classList: { add() {}, remove() {} } } };
    new Function('window', 'document', 'db', 'PACK_DEMARRAGE', 'cle', 'console', code)(
        win, doc, db, {}, (k) => 'demo_' + k, { log() {}, warn() {}, error() {}, info() {} });
    return { w: win, store, avis };
}

describe('T7 · « Quitter la démo » pendant un import de copies', () => {
    it('(a) import en cours : rien ne bouge, un avis est donné', async () => {
        const { w, store, avis } = monter(true);
        await w.desactiverModeDemo();
        expect(store['demo-actif']).toBe('true');
        expect(store.trimestres.map((t) => t.id)).toEqual(['h2026', 'demo']);
        expect(avis).toHaveLength(1);
        expect(avis[0][1]).toMatch(/fin de l'import/);
    });

    it('(b) sans import : la sortie se fait comme avant', async () => {
        const { w, store, avis } = monter(false);
        await w.desactiverModeDemo();
        expect(store['demo-actif']).toBeUndefined();
        expect(store.trimestres.map((t) => t.id)).toEqual(['h2026']);
        expect(avis).toHaveLength(0);
    });

    it('break-test : la garde neutralisée, la sortie se fait pendant l\'import (rouge attendu)', async () => {
        const { w, store } = monter(true, (src) => src.replace(
            '    if (importEmpecheDeQuitterLaDemo()) return;\n', ''));
        await w.desactiverModeDemo();
        expect(store['demo-actif']).toBeUndefined();
    });

    it('le harnais refuse une mutation inerte', () => {
        expect(() => monter(true, (src) => src.replace('CHAINE_ABSENTE_T7', 'x'))).toThrow(/Témoin inerte/);
    });
});

describe('T7 · la case de l\'accueil passe par la même garde', () => {
    const accueil = readFileSync(path.join(racine, 'js/accueil.js'), 'utf8');
    const corps = tranche(accueil, 'function toggleDemoHandler(', 'function toggleAccompagnementHandler(');

    it('au décochage, la garde précède la sortie et recoche la case', () => {
        const garde = corps.indexOf('window.importEmpecheDeQuitterLaDemo()');
        expect(garde).toBeGreaterThan(-1);
        expect(garde).toBeLessThan(corps.indexOf('desactiverModeDemo();'));
        expect(corps.slice(garde, corps.indexOf('desactiverModeDemo();'))).toMatch(/el\.checked = true;\s*return;/);
    });
});
