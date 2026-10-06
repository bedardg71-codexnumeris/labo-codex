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
//   (d) relecture de Cowork : ENTRER dans la démo pendant un import de vraies copies est
//       bloqué de même (les copies restantes iraient sous demo_fichiersTravaux, que le codex
//       n'emporte plus) ; la case de l'accueil reste décochée.
// TÉMOINS : chaque garde neutralisée, la bascule se fait pendant l'import (rouges attendus).

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function base(enDemo = true) {
    const store = enDemo ? {
        'demo-actif': 'true',
        trimestres: [{ id: 'h2026' }, { id: 'demo' }],
        trimestreActif: 'demo',
        listeCours: [], cours: [], enseignants: []
    } : {
        trimestres: [{ id: 'h2026' }],
        trimestreActif: 'h2026',
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

function monter(importEnCours, muter, enDemo = true) {
    const { store, db } = base(enDemo);
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
            '    if (importEmpecheLaBascule(false)) return;\n', ''));
        await w.desactiverModeDemo();
        expect(store['demo-actif']).toBeUndefined();
    });

    it('le harnais refuse une mutation inerte', () => {
        expect(() => monter(true, (src) => src.replace('CHAINE_ABSENTE_T7', 'x'))).toThrow(/Témoin inerte/);
    });
});

describe('T7 · entrer dans la démo pendant un import de vraies copies', () => {
    it('(d) import en cours : la démo ne s\'active pas, un avis est donné', async () => {
        const { w, store, avis } = monter(true, null, false);
        await w.activerModeDemo();
        expect(store['demo-actif']).toBeUndefined();
        expect(store.trimestreActif).toBe('h2026');
        expect(store.trimestres.map((t) => t.id)).toEqual(['h2026']);
        expect(avis).toEqual([['Import en cours', 'Attends la fin de l\'import des copies avant d\'entrer dans la démo.']]);
    });

    it('break-test : la garde d\'entrée neutralisée, la démo s\'active pendant l\'import (rouge attendu)', async () => {
        const { w, store } = monter(true, (src) => src.replace(
            '    if (importEmpecheLaBascule(true)) return;\n', ''), false);
        await w.activerModeDemo();
        expect(store['demo-actif']).toBe('true');
    });

    it('sans import, la démo s\'active comme avant', async () => {
        const { w, store, avis } = monter(false, null, false);
        await w.activerModeDemo();
        expect(store['demo-actif']).toBe('true');
        expect(avis).toHaveLength(0);
    });
});

describe('T7 · la case de l\'accueil passe par la même garde, dans les deux sens', () => {
    const accueil = readFileSync(path.join(racine, 'js/accueil.js'), 'utf8');
    const corps = tranche(accueil, 'function toggleDemoHandler(', 'function toggleAccompagnementHandler(');

    function basculer(importEnCours, coche, muter) {
        const appels = [];
        const el = { checked: coche };
        const win = {
            importEmpecheLaBascule: (versLaDemo) => { appels.push(['garde', versLaDemo]); return importEnCours; }
        };
        // eslint-disable-next-line no-new-func
        const texte = muter ? muter(corps) : corps;
        if (muter && texte === corps) throw new Error('Témoin inerte');
        const toggle = new Function('window', 'activerModeDemo', 'desactiverModeDemo', texte + '\nreturn toggleDemoHandler;')(
            win, () => appels.push(['activer']), () => appels.push(['desactiver']));
        toggle(el);
        return { el, appels };
    }

    it('import en cours : cocher laisse la case décochée, décocher la laisse cochée ; rien ne bascule', () => {
        expect(basculer(true, true)).toEqual({ el: { checked: false }, appels: [['garde', true]] });
        expect(basculer(true, false)).toEqual({ el: { checked: true }, appels: [['garde', false]] });
    });

    it('break-test : sans la garde dans la case, cocher active la démo pendant l\'import (rouge attendu)', () => {
        const r = basculer(true, true, (c) => c.replace(
            "if (typeof window.importEmpecheLaBascule === 'function' && window.importEmpecheLaBascule(el.checked)) {", 'if (false) {'));
        expect(r.appels).toEqual([['activer']]);
        expect(r.el.checked).toBe(true);
    });

    it('sans import : la bascule se fait comme avant', () => {
        expect(basculer(false, true).appels).toEqual([['garde', true], ['activer']]);
        expect(basculer(false, false).appels).toEqual([['garde', false], ['desactiver']]);
    });
});
