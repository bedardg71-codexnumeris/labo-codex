/**
 * SENTINELLE #785 — COCHER « VERROUILLÉE » NE DOIT PAS EFFACER UNE SÉANCE QUE L'ÉCRAN N'AFFICHE PAS.
 *
 * ── D'OÙ VIENT CE BANC ─────────────────────────────────────────────────────────────────────────────
 * Le 8 septembre 2026, Grégoire constate que deux séances d'automne (21 août, 1er septembre) manquent
 * sur `app.codexnumeris.org`. Il les ressaisit ; la mesure (sonde #785) dit qu'elles n'y sont toujours
 * pas, alors que la séance du jour même, elle, est bien passée. Différence entre les deux cas : les
 * dates manquantes étaient VERROUILLÉES, et `enregistrerPresences` refuse d'écrire sur une date
 * verrouillée (`js/saisie-presences.js:1449`, avec une `alert`).
 *
 * Reste la question qu'il pose : « J'ai donc coché la case sans enregistrer ? » — et la réponse n'allait
 * PAS de soi, parce qu'un correctif du 3 février 2026 (`:733`) fait justement appeler
 * `sauvegarderPresencesSansValidation(dateStr)` AVANT de verrouiller, « pour ne pas perdre les données
 * saisies ». Cocher la case est donc censé sauvegarder. Ce banc mesure si ce filet tient.
 *
 * ── LE DÉFAUT MESURÉ, ET SA CORRECTION (8 septembre 2026) ──────────────────────────────────────────
 * `sauvegarderPresencesSansValidation` RETIRAIT les présences de la date pour tous les élèves du cours
 * actif — liste venue de la BASE — puis n'en réécrivait que pour ceux dont le champ `#periodes_<da>`
 * existe DANS LE DOM. Quand le tableau de la séance n'est pas rendu — une date qu'on n'a pas ouverte,
 * un rendu pas encore arrivé — il ne restait RIEN à réécrire, et le tableau amputé était écrit tel quel
 * par `db.setSync`. Séance détruite en silence, et la date verrouillée par-dessus : un cadenas sur une
 * séance vide. `enregistrerPresences` portait le même motif ; les deux sites sont corrigés.
 *
 * ⮕ LE CORRECTIF, ET DONC L'INVARIANT QUE CE FICHIER GARDE : **on ne retire QUE ce qu'on va réécrire.**
 * `daReecrits` est bâti depuis le DOM avant le retrait, et le filtre ne consulte plus que lui. Un élève
 * dont le champ n'est pas à l'écran n'est plus touché.
 *
 * ⚠ CE BANC A D'ABORD AFFIRMÉ LE DÉFAUT (commit `4201bf62`, « reproduit, non corrigé ») avant d'être
 * retourné en sentinelle. Ses deux constats de destruction sont devenus des constats de survie ; le
 * TÉMOIN et les deux cas de bord n'ont pas bougé — c'est ce qui prouve que le remède n'a pas changé le
 * cas normal. Le break-test de la correction est le geste inverse : rétablir
 * `etudiantsATraiter.some(...)` dans les deux filtres doit rougir ce fichier.
 *
 * ⚠ LE FAUX `document` DU BAC PARTAGÉ NE SUFFIT PAS ICI : son `getElementById` CRÉE l'élément absent
 * au lieu de rendre `null` (`_helpers/bac-suivi.js`). Sous ce document-là, `if (inputPeriodes)` est
 * toujours vrai et le défaut est invisible. Ce banc remplace donc `getElementById` par une version
 * fidèle au navigateur : `null` quand l'élément n'existe pas. Sans cette substitution, le banc
 * mesurerait le bac, pas l'application.
 *
 * ── CE QU'IL N'ÉTABLIT PAS ─────────────────────────────────────────────────────────────────────────
 * Que ce soit ce qui est arrivé à Grégoire le 8 septembre. Son écran n'a pas été observé au moment du
 * clic, et l'hypothèse concurrente — il n'avait jamais saisi ces deux séances sur le web — reste
 * ouverte et plus simple. Ce banc établit que le chemin EXISTE et qu'un geste ordinaire y mène.
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase } from './_helpers/bac-suivi.js';

const DATE = '2026-09-01';
// #749 lot 3 (11 sept. 2026) : le verrou vit sous `<trim>_datesVerrouillees_gc_<gc>` (avant : la clé nue `datesVerrouillees`).
const K_VERROU = 'test_datesVerrouillees_gc_GC1';

/** Trois présences réelles au 1er septembre pour le groupe-cours actif. */
function storeAvecUneSeance() {
    const store = storeBase();
    store.test_presences = [
        { date: DATE, da: '2000001', periodesPresentes: 2, notes: '', coursId: 'GC1' },
        { date: DATE, da: '2000002', periodesPresentes: 1, notes: 'parti tôt', coursId: 'GC1' },
        { date: DATE, da: '2000003', periodesPresentes: 2, notes: '', coursId: 'GC1' },
        // Témoin d'une AUTRE date : elle ne doit jamais bouger.
        { date: '2026-08-25', da: '2000001', periodesPresentes: 2, notes: '', coursId: 'GC1' }
    ];
    return store;
}

/**
 * Monte le module et rend `document.getElementById` fidèle au navigateur.
 * @param {boolean} tableauRendu - false : aucun champ `periodes_*` dans la page (séance non affichée).
 */
function monterAvecDomFidele(store, tableauRendu, valeurAffichee = '2') {
    const b = monter(store, { modules: ['js/saisie-presences.js'] });
    const creeParLeBac = b.document.getElementById;
    b.document.getElementById = (id) => {
        if (/^(periodes|notes)_/.test(id)) {
            if (!tableauRendu) return null;                 // le navigateur rend null, pas un élément neuf
            const el = creeParLeBac(id);
            if (id.startsWith('periodes_') && el.value === '') el.value = valeurAffichee;
            return el;
        }
        return creeParLeBac(id);
    };
    return b;
}

const presencesDu = (store, date) => (store.test_presences || []).filter((p) => p.date === date);

describe('#785 · verrouiller une date dont le tableau n’est pas rendu', () => {
    it('✅ PRÉSERVE la séance : trois présences en base, trois après le clic', () => {
        const store = storeAvecUneSeance();
        const b = monterAvecDomFidele(store, false);
        expect(presencesDu(store, DATE)).toHaveLength(3);   // avant : la séance existe

        try { b.win.basculerVerrouillageDate(DATE); } catch { /* le re-rendu ne concerne pas la mesure */ }

        // L'INVARIANT. Rétablir `etudiantsATraiter.some(...)` dans le filtre fait tomber cette attente.
        expect(presencesDu(store, DATE)).toHaveLength(3);
        // Et la date est bien verrouillée : le geste demandé a eu lieu, sans emporter la séance.
        expect(store[K_VERROU]).toContain(DATE);
    });

    it('la séance est INTACTE, pas seulement du même nombre : périodes et notes inchangées', () => {
        const store = storeAvecUneSeance();
        const avant = JSON.stringify(presencesDu(store, DATE));
        const b = monterAvecDomFidele(store, false);
        try { b.win.basculerVerrouillageDate(DATE); } catch { /* idem */ }
        // Garde contre une « survie » qui réécrirait tout à zéro : le compte tiendrait, pas les valeurs.
        expect(JSON.stringify(presencesDu(store, DATE))).toBe(avant);
        expect(b.avertissements.filter((m) => /présence|perdu|effac/i.test(String(m)))).toHaveLength(0);
    });

    it('n’emporte QUE la date visée : la séance du 25 août survit', () => {
        const store = storeAvecUneSeance();
        const b = monterAvecDomFidele(store, false);
        try { b.win.basculerVerrouillageDate(DATE); } catch { /* idem */ }
        expect(presencesDu(store, '2026-08-25')).toHaveLength(1);
    });

    it('TÉMOIN — quand le tableau EST rendu, le filet du 3 février tient : la séance survit', () => {
        const store = storeAvecUneSeance();
        const b = monterAvecDomFidele(store, true);
        try { b.win.basculerVerrouillageDate(DATE); } catch { /* idem */ }
        // Trois élèves du groupe-cours actif, réécrits depuis les champs affichés.
        expect(presencesDu(store, DATE)).toHaveLength(3);
        expect(store[K_VERROU]).toContain(DATE);
    });

    it('⚠ CONTRE-ÉPREUVE DU REMÈDE — un tableau rendu ÉCRASE BIEN l’ancienne valeur', () => {
        // Sans ce cas, « ne retirer que ce qu’on va réécrire » pourrait dégénérer en « ne rien
        // retirer » : la sauvegarde deviendrait un geste sans effet, et les quatre cas ci-dessus
        // resteraient verts. Ici l’écran affiche 1 période là où la base en porte 2.
        //
        // Lot D (27 sept. 2026) : sur une séance DÉJÀ saisie, le verrou n'écrit que les lignes
        // TOUCHÉES (un chargement ou un verrou ne réécrit pas ce qui est en base). La contre-épreuve
        // passe donc par le geste : les trois lignes sont touchées, puis on verrouille.
        const store = storeAvecUneSeance();
        const b = monterAvecDomFidele(store, true, '1');
        for (const da of ['2000001', '2000002', '2000003']) {
            // Le geste passe par la note (même armement que la période ; ce banc n'a pas le calcul
            // d'affichage de l'assiduité que le champ de période relance).
            b.win.notePresenceModifiee({ dataset: { da, dateStr: DATE } });
        }
        try { b.win.basculerVerrouillageDate(DATE); } catch { /* idem */ }
        const apres = presencesDu(store, DATE);
        expect(apres).toHaveLength(3);
        expect(apres.every((p) => p.periodesPresentes === 1)).toBe(true);
    });

    it('Lot D · SANS geste, verrouiller une séance saisie ne la réécrit pas depuis l’écran', () => {
        // L'écran affiche 1 période partout, la base en porte 2 / 1 / 2 : rien n'a été touché, rien
        // ne change. Avant le lot, le verrou réécrivait toute ligne rendue.
        const store = storeAvecUneSeance();
        const avant = JSON.stringify(presencesDu(store, DATE));
        const b = monterAvecDomFidele(store, true, '1');
        try { b.win.basculerVerrouillageDate(DATE); } catch { /* idem */ }
        expect(JSON.stringify(presencesDu(store, DATE))).toBe(avant);
        expect(store[K_VERROU]).toContain(DATE);
    });

    it('DÉVERROUILLER ne touche à rien — seul le verrouillage passe par la sauvegarde', () => {
        const store = storeAvecUneSeance();
        store[K_VERROU] = [DATE];
        const b = monterAvecDomFidele(store, false);
        try { b.win.basculerVerrouillageDate(DATE); } catch { /* idem */ }
        expect(presencesDu(store, DATE)).toHaveLength(3);
        expect(store[K_VERROU] || []).not.toContain(DATE);
    });
});
