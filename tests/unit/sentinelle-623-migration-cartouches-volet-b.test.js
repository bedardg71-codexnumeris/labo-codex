import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// =====================================================================
// SENTINELLE S5 / #623 — VOLET (b) : LA MIGRATION QUI SUPPRIME
// =====================================================================
//
// `migrerCartouchesVersNamespace()` (js/trimestres.js:1012) est le seul endroit
// du lot S5 où un défaut DÉTRUIT DES DONNÉES : son dernier temps est un
// `removeSync` des clés nues, sans annulation. Elle tourne au boot
// (`js/main.js:733`), donc sur les données réelles, sans que personne ne
// l'ait demandée.
//
// La fonction se protège en cinq temps : recenser → copier vers CHAQUE
// trimestre → `await db.flush()` → RELIRE chaque copie → et seulement alors
// supprimer. Un seul échec de relecture retient TOUTE la suppression.
// ⮕ Ce fichier verrouille cette discipline, et surtout le RENONCEMENT (§4).
//
// Pourquoi la copie va vers CHAQUE trimestre plutôt qu'un seul : aujourd'hui
// tous lisent la même case globale. Leur donner à tous la même copie préserve
// exactement ce que chacun affichait ; ils divergeront ensuite. En copier un
// seul ferait disparaître les cartouches de tous les autres.
//
// ---------------------------------------------------------------------
// CE QUE CE BANC EXERCE, ET CE QU'IL N'EXERCE PAS
// ---------------------------------------------------------------------
// Le `db` ci-dessous est un faux INSTRUMENTÉ : il journalise l'ordre des
// opérations (c'est ce qui permet d'asserter que la suppression ne précède
// jamais la relecture, §5, plutôt que de le lire dans le code), et il sait
// simuler une copie qui ne se relit pas (§4).
//
// ⚠ Il FOURNIT `flush()`. La fonction ne draine que si `typeof db.flush ===
// 'function'` (:1047) : un banc sans `flush` sauterait le drainage EN SILENCE,
// et le cas du renoncement ne prouverait plus rien. Un cas vérifie donc que le
// drainage a bien eu lieu, et AVANT la relecture.
// ⚠ Ce banc ne reproduit PAS le comportement asynchrone d'IndexedDB : ses
// écritures sont immédiates. Il vérifie la DISCIPLINE (ordre, renoncement,
// idempotence), pas la durabilité réelle. La fenêtre où une écriture n'a pas
// encore atterri n'existe pas ici — c'est précisément pour elle que le
// `flush()` du code de production existe, et ce banc ne peut que constater
// qu'il est appelé.

/* ------------------------------------------------------------------ harnais */

/**
 * Faux `db` : store en clair, journal des opérations, et un point d'injection
 * pour faire échouer la relecture d'une copie précise.
 */
function creerDb(initial = {}, options = {}) {
    const store = { ...initial };
    const journal = [];          // suite ordonnée : 'set:<clé>', 'get:<clé>', …
    // Clés dont la LECTURE rendra `[]` après avoir été écrites : simule une
    // copie qui n'a pas atterri (quota, transaction perdue, éviction).
    const copiesQuiNeSeRelisentPas = new Set(options.copiesQuiEchouent || []);
    const dejaEcrites = new Set();

    return {
        _store: store,
        _journal: journal,
        ready: true,
        keysSync: () => { journal.push('keys'); return Object.keys(store); },
        getSync: (k, defaut = null) => {
            journal.push('get:' + k);
            if (copiesQuiNeSeRelisentPas.has(k) && dejaEcrites.has(k)) return [];
            return k in store ? store[k] : defaut;
        },
        setSync: (k, v) => { journal.push('set:' + k); store[k] = v; dejaEcrites.add(k); },
        removeSync: (k) => { journal.push('remove:' + k); delete store[k]; },
        flush: async () => { journal.push('flush'); },
        get: async (k, d = null) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; },
        remove: async (k) => { delete store[k]; },
        keys: async () => Object.keys(store)
    };
}

const TROIS_TRIMESTRES = [
    { id: 'a2025', nom: 'Automne 2025', actif: false, archive: false },
    { id: 'h2026', nom: 'Hiver 2026', actif: true, archive: false },
    { id: 'e2026', nom: 'Été 2026', actif: false, archive: false }
];

const CARTOUCHES = [{ id: 'CART1', texte: 'Rétroaction' }, { id: 'CART2', texte: 'Autre' }];

function monter(storeInitial, optionsDb = {}) {
    const db = creerDb(storeInitial, optionsDb);
    const win = chargerScript('js/trimestres.js', {
        db,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        obtenirDonneesSelonMode: () => [],
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => (p || '') + 'X'
    });
    if (typeof win.migrerCartouchesVersNamespace !== 'function') {
        throw new Error('Banc invalide : migrerCartouchesVersNamespace non exposée sur window.');
    }
    return { db, win };
}

const storeNominal = () => ({
    trimestres: structuredClone(TROIS_TRIMESTRES),
    cartouches_G1: structuredClone(CARTOUCHES)
});

describe('#623/S5 volet (b) · gardes de validité du banc', () => {

    it('`keysSync` voit bien la clé nue AVANT l\'appel — sinon la fonction sort tôt et tout passe', async () => {
        // Sans cette garde, un corpus que `keysSync` ne rendrait pas ferait sortir
        // la fonction au `if (clesNues.length === 0) return rapport` (:1026) avec un
        // rapport vide. TOUS les cas ci-dessous seraient alors verts sans avoir rien
        // migré : le pire faux vert possible sur une fonction qui supprime.
        const { db } = monter(storeNominal());
        expect(db.keysSync()).toContain('cartouches_G1');
    });

    it('la fonction est ASYNC — un banc qui ne l\'attend pas ne vérifierait rien', () => {
        // Elle `await db.flush()` (:1048) et le boot l'attend (`js/main.js:736`).
        // Appelée sans `await`, elle rendrait une Promise : `rapport.echecs` serait
        // `undefined`, et toute assertion dessus passerait par vacuité.
        const { win } = monter(storeNominal());
        const rendu = win.migrerCartouchesVersNamespace();
        expect(rendu).toBeInstanceOf(Promise);
        return rendu; // ne pas laisser une promesse pendante
    });

});

describe('#623/S5 volet (b) · le trajet nominal', () => {

    it('copie vers CHAQUE trimestre, puis supprime la clé nue', async () => {
        const { db, win } = monter(storeNominal());

        const rapport = await win.migrerCartouchesVersNamespace();

        // Les trois trimestres reçoivent la MÊME valeur : c'est ce que chacun
        // affichait avant, puisque tous lisaient la case globale.
        expect(db._store.a2025_cartouches_G1).toEqual(CARTOUCHES);
        expect(db._store.h2026_cartouches_G1).toEqual(CARTOUCHES);
        expect(db._store.e2026_cartouches_G1).toEqual(CARTOUCHES);

        // Et la clé nue a disparu — c'est le geste irréversible.
        expect('cartouches_G1' in db._store).toBe(false);

        expect(rapport.migrees).toBe(3);
        expect(rapport.trimestres).toBe(3);
        expect(rapport.nuesSupprimees).toBe(1);
        expect(rapport.echecs).toEqual([]);
    });

    it('une clé nue VIDE n\'engendre aucune copie et n\'est pas supprimée', async () => {
        // `[]` est TRUTHY : sans le test de longueur (:1033), une case vide
        // produirait trois copies vides puis la suppression de la source.
        const { db, win } = monter({
            trimestres: structuredClone(TROIS_TRIMESTRES),
            cartouches_VIDE: []
        });

        const rapport = await win.migrerCartouchesVersNamespace();

        expect(db._store.a2025_cartouches_VIDE).toBeUndefined();
        expect('cartouches_VIDE' in db._store).toBe(true);
        expect(rapport.migrees).toBe(0);
        expect(rapport.nuesSupprimees).toBe(0);
    });

});

describe('#623/S5 volet (b) · idempotence', () => {

    it('un second passage sur une base migrée n\'écrit ni ne supprime rien', async () => {
        const { db, win } = monter(storeNominal());
        await win.migrerCartouchesVersNamespace();

        const journalAvant = db._journal.length;
        const rapport = await win.migrerCartouchesVersNamespace();

        expect(rapport.migrees).toBe(0);
        expect(rapport.nuesSupprimees).toBe(0);
        expect(rapport.echecs).toEqual([]);
        // Aucune écriture ni suppression pendant le second passage.
        const depuis = db._journal.slice(journalAvant);
        expect(depuis.filter((o) => o.startsWith('set:') || o.startsWith('remove:'))).toEqual([]);
    });

    it('une copie MODIFIÉE DEPUIS n\'est pas écrasée par un second passage', async () => {
        // Le cas dur : la migration a eu lieu, l'enseignant a travaillé, puis la
        // migration retourne (drapeau perdu, réinstallation, base restaurée). Si
        // elle réécrivait la copie depuis la clé nue, elle DÉTRUIRAIT ce travail.
        // La garde est le `if (Array.isArray(dejaLa) && dejaLa.length > 0) return`
        // (:1037).
        const travailRecent = [{ id: 'CART1', texte: 'Rétroaction RETRAVAILLÉE' }];
        const { db, win } = monter({
            trimestres: structuredClone(TROIS_TRIMESTRES),
            cartouches_G1: structuredClone(CARTOUCHES),   // la clé nue traîne encore
            h2026_cartouches_G1: structuredClone(travailRecent)
        });

        await win.migrerCartouchesVersNamespace();

        expect(db._store.h2026_cartouches_G1).toEqual(travailRecent);
        // Les autres, eux, reçoivent bien leur copie.
        expect(db._store.a2025_cartouches_G1).toEqual(CARTOUCHES);
    });

});

describe('#623/S5 volet (b) · les clés déjà namespacées ne sont pas reprises', () => {

    // ⚠ CE CAS A CHANGÉ DE TÉMOIN LE 31 AOÛT 2026, ET C'EST LA PARTIE INSTRUCTIVE.
    //
    // Le recensement (`js/trimestres.js:1035-1037`) portait DEUX conditions :
    // `k.startsWith('cartouches_')` et `!prefixes.some(pfx => k.startsWith(pfx))`.
    // On pouvait croire que la seconde écartait les clés déjà namespacées. Break-test :
    // la neutraliser laissait ce fichier VERT à 10/10. Elle était INATTEIGNABLE —
    // une clé qui commence par `h2026_` ne commence pas par `cartouches_`, donc la
    // première l'avait déjà écartée. Pire, dans son unique cas d'application (un
    // trimestre dont l'id serait littéralement `cartouches`), son préfixe aurait
    // exclu TOUTES les clés nues : la migration n'aurait rien fait, en silence, et
    // le drapeau aurait été posé comme si elle avait réussi.
    // La clause a été retirée par `kuekatsheu-c8` le même jour.
    //
    // ⮕ CONSÉQUENCE POUR CE FICHIER, et c'est le point : **ce cas a perdu son
    //   témoin**. Le retrait d'un code mort emporte souvent le SUJET d'une assertion
    //   voisine, et un cas sans témoin est un cas dont plus personne ne sait s'il
    //   mord. On ne l'a donc pas laissé orphelin : son nouveau témoin vise la VRAIE
    //   protection — muter `startsWith('cartouches_')` en `includes('cartouches_')`
    //   fait recenser `h2026_cartouches_G1` et produit `h2026_h2026_cartouches_G1`.
    //   Mesuré : ROUGE ici, plus deux cas d'idempotence. Le cas est de nouveau tenu.
    //
    // ⮕ Et l'assertion, elle, n'a pas bougé : elle porte sur le RÉSULTAT (aucun
    //   double préfixe), qui doit tenir quelle que soit la condition qui l'obtient.
    //   C'est ce qui lui a permis de survivre au retrait de la clause sans être
    //   réécrite — une assertion branchée sur le MÉCANISME aurait dû l'être.
    it('`h2026_cartouches_G1` n\'engendre jamais `h2026_h2026_cartouches_G1`', async () => {
        const { db, win } = monter({
            trimestres: structuredClone(TROIS_TRIMESTRES),
            h2026_cartouches_G1: structuredClone(CARTOUCHES)
        });

        const rapport = await win.migrerCartouchesVersNamespace();

        expect(Object.keys(db._store).filter((k) => k.includes('_h2026_'))).toEqual([]);
        expect(Object.keys(db._store).some((k) => /_(a2025|h2026|e2026)_cartouches_/.test(k))).toBe(false);
        expect(rapport.migrees).toBe(0);
        expect(rapport.nuesSupprimees).toBe(0);
    });

});

describe('#623/S5 volet (b) · LE RENONCEMENT — le cas qui compte le plus', () => {

    // ⚠⚠ Le seul endroit du lot où un défaut détruit des données. Si une copie ne
    // se relit pas, AUCUNE clé nue ne doit être supprimée : mieux vaut un état non
    // migré, que le fil de détente de `creerSnapshotRessources` sait reconnaître,
    // qu'un état mi-migré dont plus personne ne saura quoi faire.

    it('une copie qui ne se relit pas retient TOUTE la suppression', async () => {
        const { db, win } = monter(storeNominal(), {
            copiesQuiEchouent: ['e2026_cartouches_G1']   // une seule, sur trois
        });

        const rapport = await win.migrerCartouchesVersNamespace();

        // 1. La source est INTACTE. C'est ce qui compte : rien n'est perdu.
        expect('cartouches_G1' in db._store).toBe(true);
        expect(db._store.cartouches_G1).toEqual(CARTOUCHES);
        expect(rapport.nuesSupprimees).toBe(0);

        // 2. L'échec est RAPPORTÉ, et il nomme le trimestre fautif — sans quoi le
        //    boot ne saurait pas qu'il doit retenir le drapeau.
        expect(rapport.echecs).toHaveLength(1);
        expect(rapport.echecs[0].cle).toBe('cartouches_G1');
        expect(rapport.echecs[0].trimestresSansCopie).toEqual(['e2026']);

        // 3. Aucune suppression, nulle part.
        expect(db._journal.filter((o) => o.startsWith('remove:'))).toEqual([]);
    });

    it('le boot ne pose PAS le drapeau quand le rapport porte un échec', () => {
        // La seconde moitié de la garde, côté appelant : un renoncement que le boot
        // ne lirait pas serait décoratif — la migration ne serait jamais retentée.
        // Assertion statique, faute de pouvoir booter `main.js` ici.
        const main = lireMain();
        const bloc = extraireBlocMigrationCartouches(main);
        expect(bloc).toContain('rapport.echecs.length > 0');
        // Le drapeau n'est posé QUE dans la branche sans échec.
        const indexDrapeau = bloc.indexOf("migration_cartouches_namespacees_done', true");
        const indexEchec = bloc.indexOf('rapport.echecs.length > 0');
        expect(indexDrapeau).toBeGreaterThan(-1);
        expect(indexEchec).toBeGreaterThan(-1);
        expect(indexEchec).toBeLessThan(indexDrapeau);
    });

});

describe('#623/S5 volet (b) · l\'ORDRE des opérations', () => {

    it('aucune suppression AVANT la relecture, et le drainage précède la relecture', async () => {
        // Asserté sur le JOURNAL, pas sur la lecture du code : c'est la séquence
        // réellement exécutée. Un `removeSync` qui remonterait avant la relecture
        // supprimerait la source sur la foi d'une écriture non vérifiée.
        const { db, win } = monter(storeNominal());
        await win.migrerCartouchesVersNamespace();

        const journal = db._journal;
        const iFlush = journal.indexOf('flush');
        const premierRemove = journal.findIndex((o) => o.startsWith('remove:'));
        // Relecture = les `get:` des copies, qui suivent le flush.
        const relecture = journal.findIndex((o, i) => i > iFlush && o.startsWith('get:a2025_cartouches_'));

        expect(iFlush, 'le drainage n\'a pas eu lieu — `flush` absent du journal').toBeGreaterThan(-1);
        expect(relecture, 'aucune relecture après le drainage').toBeGreaterThan(iFlush);
        expect(premierRemove, 'aucune suppression : le cas nominal doit en produire une').toBeGreaterThan(-1);
        expect(premierRemove).toBeGreaterThan(relecture);
    });

});

/* ------------------------------------------------------ lecture de main.js */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Racine trouvée par REMONTÉE jusqu'à `js/main.js`, pas par un nombre de `..`.
 * Motif mesuré le 31 août : un break-test qui exécute une COPIE de ce fichier
 * depuis un autre dossier voyait `racine` pointer ailleurs, `readFileSync`
 * échouer, et le cas ci-dessous rougir sous CHAQUE mutation — y compris celles
 * qui ne touchent pas `main.js`. Un cas qui rougit toujours ne distingue rien :
 * il masquait les vrais verdicts des autres break-tests.
 */
function trouverRacine() {
    let dossier = path.dirname(fileURLToPath(import.meta.url));
    for (let i = 0; i < 8; i++) {
        if (existsSync(path.join(dossier, 'js', 'main.js'))) return dossier;
        dossier = path.dirname(dossier);
    }
    throw new Error('Banc invalide : racine du projet introuvable (js/main.js).');
}
const racine = trouverRacine();
const lireMain = () => readFileSync(path.join(racine, 'js', 'main.js'), 'utf8');

/** Fenêtre bornée par la BRANCHE, pas par un nombre de caractères. */
function extraireBlocMigrationCartouches(src) {
    const debut = src.indexOf("if (!db.getSync('migration_cartouches_namespacees_done'");
    if (debut === -1) throw new Error('Bloc de migration des cartouches introuvable dans main.js.');
    const suite = src.indexOf("\n        }\n", src.indexOf('migration_cartouches_namespacees_done', debut + 10));
    return src.slice(debut, suite > debut ? suite + 200 : debut + 3000);
}
