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
            removeSync: (k) => { delete store[k]; },
            // Lot « deux temps » (12 nov. 2026) : la sortie énumère les clés pour retirer les séances des groupes de la démo.
            keysSync: () => Object.keys(store)
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

describe('T7 · « Explorer », sur l\'accueil, entre par activerModeDemo, qui porte la garde', () => {
    // « L'accueil épuré » (7 nov. 2026) : la case « Données démo » de l'accueil est retirée. La porte
    // « Explorer » appelle activerModeDemo, dont la garde d'entrée est jugée plus haut ; on sort de la
    // démo par « Quitter la démo » (bandeau vert), qui appelle desactiverModeDemo, gardé lui aussi.
    const accueil = readFileSync(path.join(racine, 'js/accueil.js'), 'utf8');
    const corps = tranche(accueil, 'async function explorerDonneesDemo(', '/**\n * « Adopter ta pratique » (décision de Cowork');

    function explorer(enDemo, muter) {
        const appels = [];
        const texte = muter ? muter(corps) : corps;
        if (muter && texte === corps) throw new Error('Témoin inerte');
        // eslint-disable-next-line no-new-func
        // ↻ Lot 3 (7 nov. 2026) : « Explorer » attend l'entrée pour ouvrir l'aide de la démo, la première fois ;
        // l'appel à activerModeDemo, lui, part avant toute attente : il se compte sans attendre.
        const f = new Function('estEnModeDemo', 'activerModeDemo', texte + '\nreturn explorerDonneesDemo;')(
            () => enDemo, () => appels.push('activer'));
        f();
        return appels;
    }

    it('hors de la démo, « Explorer » appelle activerModeDemo ; dans la démo, rien', () => {
        expect(explorer(false)).toEqual(['activer']);
        expect(explorer(true)).toEqual([]);
    });

    it('break-test : sans l\'appel, « Explorer » n\'entre pas (rouge attendu)', () => {
        expect(explorer(false, (c) => c.replace('activerModeDemo();', 'void 0;'))).toEqual([]);
    });

    it('la case « Données démo » n\'existe plus, et le bandeau garde sa sortie', () => {
        expect(accueil).not.toContain('checkbox-demo-accueil');
        expect(readFileSync(path.join(racine, 'index.html'), 'utf8')).toMatch(/data-action="desactiverModeDemo"[^>]*>\s*Quitter la démo/);
    });
});
