import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { globauxIdentiteNaturelle } from './_helpers/identite-naturelle.js';

// =======================================================================
// SENTINELLE #442 — la fusion legacy→canonique dédoublonne par IDENTITÉ
// =======================================================================
//
// Terrain du 9 août 2026 (dry-run `reparer154()` sur le Chrome de Grégoire) :
// le magasin global `cours` contenait TROIS entrées 601-102-MQ portant
// toutes le même id `h2026-601-102-MQ-00001`.
//
// Mécanisme trouvé le 10 août au soir dans `_migrerListeCoursVersCoursV2`
// (`js/trimestre-v2-cours.js`) : la fusion dédoublonnait par TUPLE NATUREL
// (code|SESSION+ANNÉE) et calculait bien un `Set` d'ids… qu'elle ne
// consultait QUE dans la branche « pas de tuple ». Un cours legacy au tuple
// DIFFÉRENT mais à l'id IDENTIQUE passait donc au travers.
// Le cas concret : l'entrée V2 porte `session`+`annee` (tuple
// `601-102-MQ|H2026`), la copie legacy restaurée par un import ancien ne les
// porte pas (tuple dégradé `601-102-MQ`). Deux tuples, un seul id — et un
// exemplaire de plus dans le magasin à CHAQUE import qui repeuple
// `listeCours`.
//
// Ce qui est verrouillé ici :
//   A. un id déjà présent dans `cours` n'est JAMAIS réinjecté, même quand
//      le tuple naturel diffère (LE défaut) ;
//   B. deux entrées legacy au même id dans le MÊME lot n'entrent pas toutes
//      les deux (la porte se referme pendant la boucle) ;
//   C. le dédoublonnage par tuple, lui, reste opérant — il attrape les
//      doublons à ids différents, que le point A ne peut pas voir ;
//   D. un cours réellement nouveau passe toujours (le garde ne mord pas
//      sur le cas légitime) ;
//   E. la décision est PURE : elle ne mute pas ses arguments ;
//   F. bout-en-bout, après `chargerDropdownCoursV2`, le magasin `cours` ne
//      contient AUCUN id en double — c'est la chaîne réelle, pas seulement
//      la fonction de décision ;
//   G. la fonction est réellement EXPORTÉE (leçon du 10 août : un garde sur
//      un nom absent n'échoue pas, il absorbe).
//
// ▣ Pourquoi écarter par id ne perd rien : tous les lecteurs du magasin
//   résolvent par `find`/`findIndex`/`some` sur `.id`. Un second exemplaire
//   au même id est inatteignable par construction — il ne pèse que sur le
//   budget de stockage (#353).

function chargerModule(globauxSupp = {}) {
    return chargerScript('js/trimestre-v2-cours.js', {
        db: { getSync: (k, d) => d, setSync: () => {} },
        cle: (k) => k,
        toggleDisplay: () => {},
        // #842 (12 sept. 2026) : chargerDropdownCoursV2 échappe le mot de son option vide (point unique) — le vrai global du module.
        echapperHtml: (s) => String(s == null ? '' : s),
        // CT-15 : l'identité du cours vit désormais dans identite-naturelle.js.
        ...globauxIdentiteNaturelle(),
        ...globauxSupp
    });
}

function fusionner(coursExistants, listeCours) {
    const win = chargerModule();
    return win._fusionnerListeCoursDansCours(coursExistants, listeCours);
}

// L'entrée V2 réelle : elle porte la période, donc un tuple COMPLET.
const V2_601_102 = {
    id: 'h2026-601-102-MQ-00001',
    codeCours: '601-102-MQ',
    nomCours: 'Littérature et imaginaire',
    session: 'Hiver',
    annee: '2026'
};
// La copie legacy restaurée par un import ancien : même id, PAS de période,
// donc tuple dégradé — c'est toute la faille.
const LEGACY_601_102 = {
    id: 'h2026-601-102-MQ-00001',
    codeCours: '601-102-MQ',
    titre: 'Littérature et imaginaire'
};

describe('#442 · fusion listeCours → cours : dédoublonnage par identité', () => {

    it('A · le cas du terrain : un id déjà présent est écarté même si le tuple diffère', () => {
        const { ajouts, collisionsId } = fusionner([V2_601_102], [LEGACY_601_102]);

        // Le tuple legacy ('601-102-MQ') DIFFÈRE bien du tuple V2
        // ('601-102-MQ|H2026') : sans le garde d'identité, rien ne l'arrête.
        expect(ajouts).toHaveLength(0);
        expect(collisionsId).toHaveLength(1);
        expect(collisionsId[0].id).toBe('h2026-601-102-MQ-00001');
    });

    it('A2 · trois passages d\'import ne produisent toujours qu\'UNE entrée', () => {
        // Chaque import repeuple `listeCours`, donc rejoue la fusion sur un
        // magasin déjà servi. C'est la répétition qui avait produit les 3
        // exemplaires observés sur les données réelles.
        let magasin = [V2_601_102];
        for (let passage = 0; passage < 3; passage++) {
            const { ajouts } = fusionner(magasin, [LEGACY_601_102]);
            magasin = [...magasin, ...ajouts];
        }
        expect(magasin).toHaveLength(1);
    });

    it('B · deux entrées legacy au même id dans le même lot : une seule entre', () => {
        const neuf1 = { id: 'COURS_NEUF', codeCours: '340-102-MQ', session: 'Automne', annee: '2026' };
        const neuf2 = { id: 'COURS_NEUF', codeCours: '340-102-MQ' }; // tuple dégradé, même id

        const { ajouts, collisionsId } = fusionner([], [neuf1, neuf2]);

        expect(ajouts).toHaveLength(1);
        expect(ajouts[0]).toBe(neuf1);
        expect(collisionsId).toHaveLength(1);
    });

    it('C · le dédoublonnage par tuple reste opérant (ids différents, même tuple)', () => {
        const jumeau = { id: 'AUTRE_ID', codeCours: '601-102-MQ', session: 'Hiver', annee: '2026' };

        const { ajouts, doublonsTuple, collisionsId } = fusionner([V2_601_102], [jumeau]);

        expect(ajouts).toHaveLength(0);
        expect(collisionsId).toHaveLength(0);
        expect(doublonsTuple).toHaveLength(1);
        expect(doublonsTuple[0]).toMatchObject({ legacyId: 'AUTRE_ID', v2Id: V2_601_102.id });
    });

    it('D · un cours réellement nouveau passe (le garde ne mord pas sur le cas légitime)', () => {
        const neuf = { id: 'COURS_601_103', codeCours: '601-103-MQ', session: 'Automne', annee: '2026' };

        const { ajouts, doublonsTuple, collisionsId } = fusionner([V2_601_102], [neuf]);

        expect(ajouts).toEqual([neuf]);
        expect(doublonsTuple).toHaveLength(0);
        expect(collisionsId).toHaveLength(0);
    });

    it('D2 · legacy sans tuple : entre s\'il a un id neuf, écarté s\'il n\'a rien', () => {
        const sansCode = { id: 'LEGACY_SANS_CODE', titre: 'Vieille fiche' }; // pas de code → pas de tuple
        const sansRien = { titre: 'Fiche anonyme' };                        // ni tuple ni id

        const { ajouts } = fusionner([V2_601_102], [sansCode, sansRien]);

        expect(ajouts).toEqual([sansCode]);
    });

    it('E · la décision est pure : elle ne mute pas ses arguments', () => {
        const magasin = [V2_601_102];
        const legacy = [LEGACY_601_102, { id: 'COURS_NEUF', codeCours: '340-102-MQ' }];
        const avantMagasin = JSON.stringify(magasin);
        const avantLegacy = JSON.stringify(legacy);

        fusionner(magasin, legacy);

        expect(JSON.stringify(magasin)).toBe(avantMagasin);
        expect(JSON.stringify(legacy)).toBe(avantLegacy);
    });

    it('F · bout-en-bout : après chargerDropdownCoursV2, zéro id en double dans le magasin', () => {
        const store = {
            cours: [V2_601_102],
            // Ce que produit un import ancien : la clé legacy repeuplée avec
            // deux copies de la même fiche.
            listeCours: [LEGACY_601_102, { ...LEGACY_601_102 }]
        };
        const db = {
            getSync: (k, d) => (k in store ? store[k] : d),
            setSync: (k, v) => { store[k] = v; }
        };
        const select = {
            innerHTML: '', options: [],
            appendChild(o) { this.options.push(o); },
            addEventListener() {}, classList: { add() {}, remove() {}, contains: () => false },
            style: {}, setAttribute() {}, getAttribute: () => null
        };
        const doc = {
            getElementById: (id) => (id === 'v2-selectCours' ? select : null),
            createElement: () => ({
                value: '', textContent: '', selected: false, disabled: false,
                setAttribute() {}, appendChild() {}, style: {},
                classList: { add() {}, remove() {} }
            }),
            querySelector: () => null, querySelectorAll: () => [],
            addEventListener() {}, removeEventListener() {},
            body: { addEventListener() {}, appendChild() {}, classList: { add() {}, remove() {} }, style: {} },
            documentElement: { addEventListener() {} }
        };

        const win = chargerModule({ db, document: doc });
        win.chargerDropdownCoursV2();

        const ids = store.cours.map(c => c.id);
        expect(ids).toHaveLength(new Set(ids).size);   // aucun doublon d'id
        expect(store.cours).toHaveLength(1);
        expect(store.listeCours).toEqual([]);          // la clé legacy est vidée
    });

    it('G · la fonction de décision est réellement exportée', () => {
        // Leçon du 10 août : un appel gardé par `typeof … === 'function'`
        // sur un nom jamais exporté ne proteste pas, il absorbe. On vérifie
        // donc l'EXPORT, pas la présence de l'appel.
        const win = chargerModule();
        expect(typeof win._fusionnerListeCoursDansCours).toBe('function');
    });
});
