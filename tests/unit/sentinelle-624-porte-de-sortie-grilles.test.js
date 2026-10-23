import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #624 — LA PORTE DE SORTIE DU DÉPLACEMENT DE CARTOUCHES.
//
// Grégoire a tranché la forme : déplacer les cartouches, remapper leurs critères
// par ID puis par NOM, et NOMMER les commentaires sans correspondance plutôt que
// de les perdre en silence. Chaque cas ci-dessous porte la mutation qu'il tue ;
// un cas qui n'en tue aucune n'a rien à faire ici.
//
// ⚠ LE BANC MONTE LA VRAIE db.js, PAS UN STUB. `db.modifier` a un contrat que
// l'on n'imite pas sans risque : le mutateur rend la valeur à écrire, ou
// `undefined` pour NE RIEN écrire. Un stub qui écrirait quand même laisserait
// les cas 1-3 et 5 verts sans que rien ne soit en base. On monte donc la vraie
// base, avec le chemin IndexedDB de production (clone structuré + commit
// différé) — même harnais que les sentinelles #522 lot 4 et #650.

/* ------------------------------------------------------------------ harnais */

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

function fausseConnexionIDB() {
    const disque = new Map();
    const cloner = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
    return {
        transaction() {
            const store = {
                get(key) { const r = {}; Promise.resolve().then(() => { r.result = disque.has(key) ? { key, value: cloner(disque.get(key)) } : undefined; r.onsuccess && r.onsuccess(); }); return r; },
                put(rec) { const r = {}; const fige = cloner(rec.value); Promise.resolve().then(() => { r.onsuccess && r.onsuccess(); setTimeout(() => { disque.set(rec.key, fige); tx.oncomplete && tx.oncomplete(); }, 0); }); return r; },
                getAll() { const r = {}; Promise.resolve().then(() => { r.result = [...disque].map(([key, value]) => ({ key, value: cloner(value) })); r.onsuccess && r.onsuccess(); }); return r; },
                delete(key) { const r = {}; Promise.resolve().then(() => { disque.delete(key); r.onsuccess && r.onsuccess(); setTimeout(() => tx.oncomplete && tx.oncomplete(), 0); }); return r; }
            };
            const tx = { objectStore: () => store };
            return tx;
        }
    };
}

async function monterDb() {
    const fenetre = { addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true };
    chargerScript('js/db.js', { localStorage: fauxLocalStorage() }, fenetre);
    await new Promise((res) => setTimeout(res, 25));
    if (!fenetre.db || fenetre.db.ready !== true) throw new Error('db non prête');
    const db = fenetre.db;
    db.db = fausseConnexionIDB();
    db.useIndexedDB = true;
    db.memoryCache.clear();
    return db;
}

const cleBanc = (nom) => `a2026_${nom}`;

async function monter() {
    const db = await monterDb();
    // #1144 : la correspondance vit dans cartouche-correspondance.js, chargé avant grilles.js comme dans index.html.
    const win = chargerScript('js/grilles.js', {
        db,
        cle: cleBanc,
        notifications: { succes() {}, info() {}, avertissement() {}, erreur() {} },
        echapperHtml: (t) => String(t ?? ''),
        genererIdUnique: (p) => (p || '') + Math.random().toString(36).slice(2, 8),
        BibliothequeUI: new Proxy({}, { get: () => (() => '') }),
        nommerCopie: (n) => n
    }, chargerScript('js/cartouche-correspondance.js', {}));
    // Garde de validité : sans l'export, tout passerait au vert sans rien exercer.
    if (typeof win.deplacerCartouchesVersAutreGrille !== 'function') {
        throw new Error('deplacerCartouchesVersAutreGrille absente du sandbox — export manquant ?');
    }
    return { db, deplacer: win.deplacerCartouchesVersAutreGrille };
}

/* ---------------------------------------------------------------- fixtures */
// ⚠ LES CRITÈRES SOURCE VIENNENT DE LA CARTOUCHE, PAS DE LA GRILLE SOURCE.
// `deplacerCartouchesVersAutreGrille` lit `cartouche.criteres` pour la source et
// `grille.criteres` (via `cle('grillesTemplates')`) pour la CIBLE seulement. Une
// fixture qui poserait les critères source sur la grille laisserait
// `criteresSource` vide : toutes les clés deviendraient « sans critère » et les
// cas 1, 2 et 5 échoueraient pour une raison qui n'est pas celle qu'ils testent.

const cartouche = (criteres, commentaires) => ([{
    id: 'CA_1', nom: 'Cartouche du banc', grilleId: 'G_SRC', criteres, commentaires
}]);

async function semer(db, criteresCartouche, criteresCible, commentaires) {
    await db.set(cleBanc('grillesTemplates'), [                       // security-ok: littéral de banc
        { id: 'G_SRC', nom: 'Grille source',  criteres: [] },
        { id: 'G_DST', nom: 'Grille accueil', criteres: criteresCible }
    ]);
    await db.set(cleBanc('cartouches_G_SRC'), cartouche(criteresCartouche, commentaires)); // security-ok: littéral de banc
}

const lireCartouchesCible = (db) => db.get(cleBanc('cartouches_G_DST'));

/* ------------------------------------------------------------------ les cas */

describe('#624 · A — le remappage des clés (assertions sur l\'EFFET, pas sur le compte-rendu)', () => {

    it('1. un niveau à CODE VIDE ne perd pas son commentaire', async () => {
        // Tue : le découpage au PREMIER souligné. Un id de critère commence
        // toujours par `CR_`, donc ce découpage rend `CR` — le cas général, pas
        // un cas limite.
        const { db, deplacer } = await monter();
        await semer(db, [{ id: 'CR_SRC', nom: 'Analyse' }], [{ id: 'CR_DST', nom: 'Analyse' }], { 'CR_SRC_': 'sans code' });

        await deplacer('G_SRC', 'G_DST');

        const [ca] = await lireCartouchesCible(db);
        expect(ca.commentaires['CR_DST_']).toBe('sans code');
    });

    it('2. un CODE CONTENANT UN SOULIGNÉ est conservé entier', async () => {
        // Tue : le découpage au premier ET au dernier souligné.
        const { db, deplacer } = await monter();
        await semer(db, [{ id: 'CR_SRC', nom: 'Analyse' }], [{ id: 'CR_DST', nom: 'Analyse' }], { 'CR_SRC_TRES_BIEN': 'texte' });

        await deplacer('G_SRC', 'G_DST');

        const [ca] = await lireCartouchesCible(db);
        expect(ca.commentaires['CR_DST_TRES_BIEN']).toBe('texte');
    });

    it('3. un critère à IDENTIFIANT VIDE ne revendique pas les clés des autres', async () => {
        // ⚠ La clé DOIT être bâtie sur le critère à id vide (`_M`). Avec
        // `CR_X_M`, `''.startsWith` n'est jamais confronté à rien et le retrait
        // du garde `if (!cs.id) return` resterait VERT. Mesuré le 31 août.
        const { db, deplacer } = await monter();
        await semer(db, [{ id: '', nom: 'Vide' }, { id: 'CR_SRC', nom: 'Analyse' }], [{ id: 'CR_DST', nom: 'Analyse' }], { '_M': 'orpheline' });

        const res = await deplacer('G_SRC', 'G_DST');

        expect(res.sansCritere).toBe(1);
    });

    it('5. VERROU DE CONVENTION — un identifiant préfixe d\'un autre : le PLUS LONG gagne', async () => {
        // ⚠ CE CAS N'ANNONCE AUCUN BUG DE TERRAIN. L'ambiguïté n'a pas de
        // producteur crédible : les id créés ont une forme fixe
        // (`CR_<ts>_<compteur>_<hex>`, 0 paire sur 200), les id semés n'en
        // forment aucune, et seul l'import peut en fabriquer une — où « le plus
        // long » tranche juste de toute façon.
        //
        // Il est là pour qu'une simplification de bonne foi de
        // `(!source || cs.id.length > source.id.length)` en `!source` ne passe
        // pas en silence. C'est le SEUL témoin de cette règle : sans lui, les
        // cinq autres cas restent verts sur cette mutation.
        // ⚠ LES IDENTIFIANTS CIBLE DOIVENT DIFFÉRER DES SOURCES, sinon ce cas ne
        // prouve RIEN. Avec un remappage identité (CR_A→CR_A, CR_A_B→CR_A_B), les
        // deux lectures de la clé produisent la MÊME sortie : « CR_A_B » + « _M » et
        // « CR_A » + « _B_M » se recollent tous deux en `CR_A_B_M`. Le cas passait au
        // vert sur la mutation qu'il prétend tuer — mesuré le 31 août. En faisant
        // pointer les deux critères vers des id DIFFÉRENTS (par le NOM), les deux
        // lectures divergent et la mutation devient visible.
        const { db, deplacer } = await monter();
        const src = [{ id: 'CR_A', nom: 'Court' }, { id: 'CR_A_B', nom: 'Long' }];
        const dst = [{ id: 'CR_X', nom: 'Court' }, { id: 'CR_Y', nom: 'Long' }];
        await semer(db, src, dst, { 'CR_A_B_M': 'appartient au LONG' });

        await deplacer('G_SRC', 'G_DST');

        const [ca] = await lireCartouchesCible(db);
        expect(ca.commentaires['CR_Y_M'], 'la clé doit être rattachée au PLUS LONG (CR_A_B → CR_Y)').toBe('appartient au LONG');
        expect(ca.commentaires['CR_X_B_M'], 'et surtout PAS au plus court avec « B_M » pour code').toBeUndefined();
    });

    it('5bis. le même cas, ORDRE DE LISTE INVERSÉ', async () => {
        // ⚠ CE CAS ET LE PRÉCÉDENT SONT UN COUPLE : NE PAS EN RETIRER UN SEUL.
        // Mesuré le 31 août, par mutation :
        //   · « le PREMIER trouvé gagne » → rougit ICI ? non. Rougit sur le cas 5.
        //   · « le DERNIER trouvé gagne » → rougit sur le cas 5 ? non. Rougit ICI.
        // Chacune des deux simplifications plausibles de la règle « le plus long
        // gagne » n'est vue que par UN des deux ordres. Retirer celui-ci laisse
        // « le dernier gagne » sans témoin ; retirer l'autre laisse « le premier
        // gagne » sans témoin. C'est la paire qui verrouille la règle, pas l'un
        // des deux — et pris isolément, chacun a l'air redondant.
        //
        // L'ordre n'a de sujet QUE sur ces deux fixtures : ce sont les seules à
        // deux candidats. Partout ailleurs il y en a un ou zéro, et permuter ne
        // peut rien changer.
        const { db, deplacer } = await monter();
        const src = [{ id: 'CR_A_B', nom: 'Long' }, { id: 'CR_A', nom: 'Court' }];
        const dst = [{ id: 'CR_Y', nom: 'Long' }, { id: 'CR_X', nom: 'Court' }];
        await semer(db, src, dst, { 'CR_A_B_M': 'appartient au LONG' });

        await deplacer('G_SRC', 'G_DST');

        const [ca] = await lireCartouchesCible(db);
        expect(ca.commentaires['CR_Y_M']).toBe('appartient au LONG');
        expect(ca.commentaires['CR_X_B_M']).toBeUndefined();
    });
});

describe('#624 · B — ce que le déplacement RAPPORTE', () => {

    it('4. un critère PRÉSENT dans la cartouche mais ABSENT de la grille d\'accueil est NOMMÉ', async () => {
        // La décision de Grégoire : nommer plutôt que perdre en silence.
        const { db, deplacer } = await monter();
        await semer(db,
            [{ id: 'CR_SRC', nom: 'Analyse' }, { id: 'CR_PERDU', nom: 'Synthèse' }],
            [{ id: 'CR_DST', nom: 'Analyse' }],
            { 'CR_SRC_M': 'gardé', 'CR_PERDU_M': 'sans accueil', 'CR_PERDU_E': 'sans accueil non plus' });

        const res = await deplacer('G_SRC', 'G_DST');

        expect(res.orphelins).toHaveLength(1);
        expect(res.orphelins[0].critere, 'l\'orphelin porte le NOM du critère, pas son identifiant').toBe('Synthèse');
        expect(res.orphelins[0].nbCommentaires).toBe(2);
    });

    it('6. un commentaire SANS CRITÈRE D\'ORIGINE est compté À PART, pas fondu dans les pertes', async () => {
        // ⚠ NE PAS ASSERTER LE DÉCLENCHEMENT DE L'ALERTE. Elle sort sur
        // `orphelins.length > 0 || sansCritere > 0` : une mutation qui gonfle
        // `orphelins` de `sansCritere` puis remet ce dernier à 0 laisse cette
        // condition VRAIE. Une assertion sur « l'alerte s'affiche » resterait
        // verte sur la fusion même que ce cas interdit. On vise les DEUX
        // nombres, séparément — la source, jamais le dérivé.
        const { db, deplacer } = await monter();
        await semer(db,
            [{ id: 'CR_SRC', nom: 'Analyse' }, { id: 'CR_PERDU', nom: 'Synthèse' }],
            [{ id: 'CR_DST', nom: 'Analyse' }],
            { 'CR_SRC_M': 'gardé', 'CR_PERDU_M': 'perte réelle', 'CR_FANTOME_M': 'déjà détaché avant' });

        const res = await deplacer('G_SRC', 'G_DST');

        expect(res.sansCritere, 'la clé qu\'aucun critère source ne revendique').toBe(1);
        expect(res.orphelins, 'elle ne doit PAS gonfler les pertes imputables au déplacement').toHaveLength(1);
    });
});
