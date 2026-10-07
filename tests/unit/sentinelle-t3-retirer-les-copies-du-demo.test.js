import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =====================================================================
// SENTINELLE T3 DU CHANTIER DU DÉMO — « RETIRER LES COPIES (N) », PAR IDENTITÉ
// =====================================================================
//
// Décision G3 de Grégoire (7 oct. 2026, par Cowork) : un bouton du bandeau vert retire pour de
// bon les copies importées dans la démo. Constat C4 de Rapports/AUDIT-2026-10-05-chantier-demo.md
// et skill hygiene-donnees-partagees : la sélection se fait par IDENTITÉ (ids des listes du
// démo, annotations par `fichierId`), moins tout id que porte aussi une liste réelle — la règle
// du codex (`Codex.partDuDemo`, T2), reprise telle quelle. Rien hors des clés `demo_` et des
// vignettes `thumbnail_<id>` de ces ids. Les évaluations ne sont pas touchées.
//
// CE QUE CE BANC JUGE, par le vrai js/demo-activation.js et le vrai js/codex.js :
//   (a) une copie réelle, deux copies du démo (dont une en corbeille) et un id partagé côte à
//       côte : N = 2 ; le retrait emporte les deux du démo, leur vignette et leurs entrées ; la
//       réelle et le fichier partagé survivent, avec leur vignette ; rien d'autre ne bouge ;
//   (b) hors démo, et pendant un import : rien n'est retiré, le bouton est caché ;
//   (c) le bouton : son compte, l'accord pour N = 1, la confirmation (variante danger,
//       « Annuler » au focus), « Annuler » ne retire rien.
// TÉMOINS : le filtre par identité (les listes réelles non lues), la garde hors démo, la garde
// d'import ; une mutation inerte est refusée. Noms fictifs.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const consoleMuette = { log() {}, warn() {}, info() {}, debug() {}, error() {} };

function etatInitial() {
    return {
        trimestres: [{ id: 'h2026' }, { id: 'demo' }],
        h2026_fichiersTravaux: [{ id: 'FT_reel_1', etudiantDA: '0000001' }, { id: 'FT_commun', etudiantDA: '0000002' }],
        h2026_annotationsTravaux: [{ id: 'AN_r', fichierId: 'FT_reel_1' }],
        h2026_evaluationsSauvegardees: [{ id: 'EV_r', etudiantDA: '0000001' }],
        demo_fichiersTravaux: [{ id: 'FT_demo_1', etudiantDA: '9000001' }, { id: 'FT_commun', etudiantDA: '0000002' }],
        demo_corbeilleFichiers: [{ id: 'FT_demo_2', etudiantDA: '9000002' }],
        demo_annotationsTravaux: [{ id: 'AN_d', fichierId: 'FT_demo_1' }, { id: 'AN_c', fichierId: 'FT_commun' }],
        demo_evaluationsSauvegardees: [{ id: 'EV_d', etudiantDA: '9000001' }],
        thumbnail_FT_reel_1: 'data:image/jpeg;base64,AA',
        thumbnail_FT_commun: 'data:image/jpeg;base64,BB',
        thumbnail_FT_demo_1: 'data:image/jpeg;base64,CC'
    };
}

function creerDb(initial) {
    const map = new Map(Object.entries(structuredClone(initial)));
    return {
        _map: map,
        get: async (k, d = null) => (map.has(k) ? structuredClone(map.get(k)) : d),
        keys: async () => [...map.keys()],
        remove: async (k) => { map.delete(k); },
        getSync: (k, d = null) => (map.has(k) ? structuredClone(map.get(k)) : d),
        setSync: (k, v) => { map.set(k, structuredClone(v)); },
        removeSync: (k) => { map.delete(k); }
    };
}

/** Le vrai codex.js, pour sa règle d'identité (`partDuDemo`). */
function monterCodex() {
    const win = { addEventListener() {}, removeEventListener() {} };
    const doc = {
        readyState: 'loading', addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
        body: { addEventListener() {}, appendChild() {} }, documentElement: { addEventListener() {} }
    };
    const code = readFileSync(path.join(racine, 'js/codex.js'), 'utf8');
    new Function('window', 'document', 'console', '"use strict";\n' + code)(win, doc, consoleMuette);
    return win.Codex;
}
const Codex = monterCodex();

function monter({ demo = true, importEnCours = false, reponse = true, initial = etatInitial(), muter } = {}) {
    const db = creerDb(initial);
    const blobs = new Set(['FT_reel_1', 'FT_commun', 'FT_demo_1', 'FT_demo_2']);
    const dialogues = [];
    const bouton = { textContent: '', classList: { _c: new Set(['u-hide']), toggle(c, v) { v ? this._c.add(c) : this._c.delete(c); }, contains(c) { return this._c.has(c); } } };
    const win = {
        Codex,
        estEnModeDemo: () => demo,
        travauxImport: { importEnCours },
        travauxStockage: {
            supprimerBlob: async (id) => { blobs.delete(id); },
            supprimerThumbnail: async (id) => { await db.remove('thumbnail_' + id); }
        },
        uiDialogues: { confirmerAction: async (o) => { dialogues.push(o); return reponse; } },
        notifications: { warning() {} }
    };
    const doc = {
        getElementById: (id) => (id === 'bandeau-demo-retirer-copies' ? bouton : null),
        querySelector: () => null, querySelectorAll: () => [],
        body: { classList: { add() {}, remove() {} } }
    };
    const brut = readFileSync(path.join(racine, 'js/demo-activation.js'), 'utf8');
    const code = muter ? muter(brut) : brut;
    if (muter && code === brut) throw new Error('Témoin inerte : la mutation n\'a rien remplacé dans js/demo-activation.js.');
    new Function('window', 'document', 'db', 'PACK_DEMARRAGE', 'cle', 'console', code)(
        win, doc, db, {}, (k) => 'demo_' + k, consoleMuette);
    return { w: win, db, blobs, bouton, dialogues };
}

const ids = (db, cle, champ = 'id') => (db._map.get(cle) || []).map((e) => e[champ]);

describe('T3 · le retrait, par identité', () => {
    it('(a) passe à blanc : N = 2 (copie et corbeille du démo), le fichier partagé exclu ; rien n\'est écrit', async () => {
        const { w, db, blobs } = monter();
        const plan = await w.planDuRetraitDesCopiesDuDemo();
        expect(plan.copies).toBe(2);
        expect(Object.keys(plan.ids).sort()).toEqual(['FT_demo_1', 'FT_demo_2']);
        expect(Object.fromEntries(db._map)).toEqual(etatInitial());
        expect(blobs.size).toBe(4);
    });

    it('(a) le retrait emporte les copies du démo ; la réelle et le fichier partagé survivent ; rien d\'autre ne bouge', async () => {
        const { w, db, blobs } = monter();
        expect(await w.retirerCopiesDuDemo()).toEqual({ copies: 2, fichiers: 2 });
        expect([...blobs].sort()).toEqual(['FT_commun', 'FT_reel_1']);
        expect(ids(db, 'demo_fichiersTravaux')).toEqual(['FT_commun']);
        expect(ids(db, 'demo_corbeilleFichiers')).toEqual([]);
        expect(ids(db, 'demo_annotationsTravaux', 'fichierId')).toEqual(['FT_commun']);
        const attendu = etatInitial();
        delete attendu.thumbnail_FT_demo_1;
        attendu.demo_fichiersTravaux = [attendu.demo_fichiersTravaux[1]];
        attendu.demo_corbeilleFichiers = [];
        attendu.demo_annotationsTravaux = [attendu.demo_annotationsTravaux[1]];
        expect(Object.fromEntries(db._map)).toEqual(attendu);   // réelles, évaluations, vignettes des autres : intactes
    });

    it('(b) hors démo : rien n\'est retiré', async () => {
        const { w, db, blobs } = monter({ demo: false });
        expect(await w.retirerCopiesDuDemo()).toBeNull();
        expect(Object.fromEntries(db._map)).toEqual(etatInitial());
        expect(blobs.size).toBe(4);
    });

    it('(b) pendant un import : rien n\'est retiré', async () => {
        const { w, db, blobs } = monter({ importEnCours: true });
        expect(await w.retirerCopiesDuDemo()).toBeNull();
        expect(Object.fromEntries(db._map)).toEqual(etatInitial());
        expect(blobs.size).toBe(4);
    });
});

describe('T3 · le bouton du bandeau et sa confirmation', () => {
    it('(c) en démo : visible, « Retirer les copies (2) »', async () => {
        const { w, bouton } = monter();
        await w.majBoutonRetirerCopiesDemo();
        expect(bouton.textContent).toBe('Retirer les copies (2)');
        expect(bouton.classList.contains('u-hide')).toBe(false);
    });

    it('(c) N = 1 : le singulier, au bouton et dans la question', async () => {
        const initial = etatInitial();
        initial.demo_corbeilleFichiers = [];
        const { w, bouton, dialogues } = monter({ initial, reponse: false });
        await w.majBoutonRetirerCopiesDemo();
        expect(bouton.textContent).toBe('Retirer la copie (1)');
        await w.actionRetirerCopiesDuDemo();
        expect(dialogues[0].message).toBe('Retirer la copie importée dans la démo ? Tes vraies copies et tes données ne sont pas touchées. Pour la retrouver, il faudra l\'importer de nouveau.');
    });

    it('(b) hors démo, et pendant un import : caché', async () => {
        for (const o of [{ demo: false }, { importEnCours: true }]) {
            const { w, bouton } = monter(o);
            bouton.classList.toggle('u-hide', false);
            await w.majBoutonRetirerCopiesDemo();
            expect(bouton.classList.contains('u-hide')).toBe(true);
        }
    });

    it('(c) la confirmation : mots validés, variante danger ; « Annuler » ne retire rien', async () => {
        const { w, db, blobs, dialogues } = monter({ reponse: false });
        await w.actionRetirerCopiesDuDemo();
        expect(dialogues).toEqual([{
            titre: 'Retirer les copies',
            message: 'Retirer les 2 copies importées dans la démo ? Tes vraies copies et tes données ne sont pas touchées. Pour les retrouver, il faudra les importer de nouveau.',
            texteAnnuler: 'Annuler',
            texteConfirmer: 'Retirer',
            variante: 'danger'
        }]);
        expect(Object.fromEntries(db._map)).toEqual(etatInitial());
        expect(blobs.size).toBe(4);
    });

    it('(c) « Retirer » : les copies du démo partent, le bouton se cache', async () => {
        const { w, blobs, bouton } = monter({ reponse: true });
        await w.majBoutonRetirerCopiesDemo();
        await w.actionRetirerCopiesDuDemo();
        expect([...blobs].sort()).toEqual(['FT_commun', 'FT_reel_1']);
        expect(bouton.classList.contains('u-hide')).toBe(true);
    });
});

describe('T3 · témoins', () => {
    it('le harnais refuse une mutation inerte', () => {
        expect(() => monter({ muter: (s) => s.replace('CHAINE_ABSENTE_T3', 'x') })).toThrow(/Témoin inerte/);
    });

    it('break-test : les listes réelles non lues, le fichier partagé est supprimé (rouge attendu)', async () => {
        const { w, blobs } = monter({ muter: (s) => s.replace(
            'if (_estListeDeFichiers(cles[i])) donnees[cles[i]]', 'if (cles[i].indexOf(\'demo_\') === 0) donnees[cles[i]]') });
        await w.retirerCopiesDuDemo();
        expect(blobs.has('FT_commun')).toBe(false);
    });

    it('break-test : sans la garde du mode, hors démo les copies partent (rouge attendu)', async () => {
        const { w, blobs } = monter({ demo: false, muter: (s) => s.replace(
            '    if (!_enDemo() || _importEnCours()) return null;', '    if (_importEnCours()) return null;') });
        await w.retirerCopiesDuDemo();
        expect(blobs.has('FT_demo_1')).toBe(false);
    });

    it('break-test : sans la garde d\'import, pendant un import les copies partent (rouge attendu)', async () => {
        const { w, blobs } = monter({ importEnCours: true, muter: (s) => s.replace(
            '    if (!_enDemo() || _importEnCours()) return null;', '    if (!_enDemo()) return null;') });
        await w.retirerCopiesDuDemo();
        expect(blobs.has('FT_demo_1')).toBe(false);
    });
});
