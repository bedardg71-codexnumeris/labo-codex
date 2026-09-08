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
 * ── CE QU'IL MESURE ────────────────────────────────────────────────────────────────────────────────
 * `sauvegarderPresencesSansValidation` RETIRE les présences de la date pour tous les élèves du cours
 * actif (`:823-828`, liste venue de la BASE), puis n'en réécrit que pour ceux dont le champ
 * `#periodes_<da>` existe DANS LE DOM (`:831-833`). Quand le tableau de la séance n'est pas rendu —
 * une date qu'on n'a pas ouverte, un rendu pas encore arrivé — il ne reste RIEN à réécrire, et le
 * tableau amputé est écrit tel quel par `db.setSync` (`:862`).
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
function monterAvecDomFidele(store, tableauRendu) {
    const b = monter(store, { modules: ['js/saisie-presences.js'] });
    const creeParLeBac = b.document.getElementById;
    b.document.getElementById = (id) => {
        if (/^(periodes|notes)_/.test(id)) {
            if (!tableauRendu) return null;                 // le navigateur rend null, pas un élément neuf
            const el = creeParLeBac(id);
            if (id.startsWith('periodes_') && el.value === '') el.value = '2';
            return el;
        }
        return creeParLeBac(id);
    };
    return b;
}

const presencesDu = (store, date) => (store.test_presences || []).filter((p) => p.date === date);

describe('#785 · verrouiller une date dont le tableau n’est pas rendu', () => {
    it('⛔ EFFACE la séance : trois présences en base, zéro après le clic', () => {
        const store = storeAvecUneSeance();
        const b = monterAvecDomFidele(store, false);
        expect(presencesDu(store, DATE)).toHaveLength(3);   // avant : la séance existe

        try { b.win.basculerVerrouillageDate(DATE); } catch { /* le re-rendu ne concerne pas la mesure */ }

        // LE CONSTAT. Si un correctif rend ce cas inoffensif, cette attente tombe :
        // c'est le signal que le défaut est réparé, pas que le banc est faux.
        expect(presencesDu(store, DATE)).toHaveLength(0);
        // Et la date est verrouillée quand même — l'utilisateur voit un cadenas sur une séance vidée.
        expect(store.datesVerrouillees).toContain(DATE);
    });

    it('la destruction est SILENCIEUSE : aucune alerte, aucune notification', () => {
        const store = storeAvecUneSeance();
        const b = monterAvecDomFidele(store, false);
        try { b.win.basculerVerrouillageDate(DATE); } catch { /* idem */ }
        expect(presencesDu(store, DATE)).toHaveLength(0);
        expect(b.avertissements.filter((m) => /présence|perdu|effac/i.test(String(m)))).toHaveLength(0);
        expect(b.notifs).toHaveLength(0);
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
        expect(store.datesVerrouillees).toContain(DATE);
    });

    it('DÉVERROUILLER ne touche à rien — seul le verrouillage passe par la sauvegarde', () => {
        const store = storeAvecUneSeance();
        store.datesVerrouillees = [DATE];
        const b = monterAvecDomFidele(store, false);
        try { b.win.basculerVerrouillageDate(DATE); } catch { /* idem */ }
        expect(presencesDu(store, DATE)).toHaveLength(3);
        expect(store.datesVerrouillees || []).not.toContain(DATE);
    });
});
