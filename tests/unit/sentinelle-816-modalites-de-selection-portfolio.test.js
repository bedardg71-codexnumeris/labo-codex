import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #816 (10 sept. 2026) — « deux des quatre modes de sélection ne calculent pas
// ce que leur nom annonce ».
//
// CE QUI A ÉTÉ MESURÉ. Le `<select>` de la pratique écrit `meilleurs` /
// `derniers` / `tous` / `hybride` ; `selectionnerArtefactsSelonModalite` ne
// connaissait que `meilleurs` / `recents` / `recents-meilleurs` / `tous`.
// `derniers` et `hybride` tombaient donc dans le `default` — « les N
// meilleures » — sous un nom qui annonce autre chose. Et le tri de récence
// legacy comparait des `dateRemise` que l'appelant posait toutes au MÊME
// instant (`new Date()` à la lecture) : il ne triait rien.
//
// ⚠ CE QUE CE DÉFAUT NE TOUCHAIT PAS, et la fiche se trompait dessus : ni la
// note ni l'indice P. `pratique-pan-standards.js` ne lit jamais
// `portfoliosEleves` (0 occurrence). Ce qui était faux, c'est ce que le panneau
// Portfolio COCHE — et qu'il ÉCRIT dans les données de l'utilisateur.
//
// Ce que « Hybride » veut dire a été tranché par Grégoire le 10 sept. : les N
// meilleures de la SÉLECTION, plus TOUTES les OBLIGATOIRES, le N étant celui
// des catégories et non celui du portfolio.
//
// Break-tests (faits rougir AVANT de faire confiance à ce banc) :
//   1. retirer la traduction `derniers` → `recents` → cas 2 et 6 rougissent.
//   2. retirer la branche hybride → cas 4 et 7 rougissent.
//   3. trier `recents` par note au lieu de la récence → cas 2 rougit.
//   4. faire lire `nombreARetenir` à l'hybride au lieu du N des catégories → cas 4 rougit.

// Le `numero` CONTREDIT volontairement l'ordre des identifiants : un tri qui
// retomberait sur les chiffres de l'id, ou sur l'ordre d'entrée, rendrait un
// autre résultat. C'est ce qui prouve que le comparateur de la SSOT est bien
// celui qui décide.
const PRODUCTIONS = [
    { id: 'A1', numero: 40, categorie: 'selection' },
    { id: 'A2', numero: 10, categorie: 'selection' },
    { id: 'A3', numero: 30, categorie: 'selection' },
    { id: 'A4', numero: 20, categorie: 'selection' },
    { id: 'O1', numero: 50, categorie: 'obligatoire' },
    { id: 'O2', numero: 5,  categorie: 'obligatoire' }
];

// Volontairement SANS `numero` : la récence doit venir des productions.
const ARTEFACTS = [
    { id: 'A1', productionId: 'A1', note: 60, categorie: 'selection' },
    { id: 'A2', productionId: 'A2', note: 90, categorie: 'selection' },
    { id: 'A3', productionId: 'A3', note: 70, categorie: 'selection' },
    { id: 'A4', productionId: 'A4', note: 80, categorie: 'selection' },
    { id: 'O1', productionId: 'O1', note: 50, categorie: 'obligatoire' },
    { id: 'O2', productionId: 'O2', note: 55, categorie: 'obligatoire' }
];

const CATEGORIES = { actif: true, selection: { nombreARetenir: 2, ponderation: 65 }, obligatoires: { ponderation: 35 } };

let win;
const ids = (r) => r.map((a) => a.id);

beforeAll(() => {
    const store = {};
    const globaux = {
        db: {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async () => null, set: async () => {}
        },
        cle: (k) => k,
        obtenirDonneesSelonMode: () => []
    };
    win = chargerScript('js/pratiques/pratique-registre.js', globaux);
    chargerScript('js/portfolio.js', globaux, win);
});

function choisir(modalite, n, options = {}) {
    return win.selectionnerArtefactsSelonModalite(
        ARTEFACTS, n, modalite, { productions: PRODUCTIONS, ...options }
    );
}

describe('#816 · chaque mode de sélection calcule ce que son nom annonce', () => {

    it('0. la fonction est exposée et ne mute pas son entrée', () => {
        expect(typeof win.selectionnerArtefactsSelonModalite).toBe('function');
        const avant = ids(ARTEFACTS).join(',');
        choisir('meilleurs', 3);
        choisir('derniers', 3);
        expect(ids(ARTEFACTS).join(','), 'la sélection a réordonné le tableau de l\'appelant').toBe(avant);
    });

    it('1. « N meilleurs » rend les N plus fortes notes', () => {
        expect(ids(choisir('meilleurs', 3))).toEqual(['A2', 'A4', 'A3']); // 90, 80, 70
    });

    it('2. « N derniers » rend les N plus récents, PAS les meilleurs', () => {
        // Par numéro décroissant : O1(50), A1(40), A3(30).
        expect(ids(choisir('derniers', 3))).toEqual(['O1', 'A1', 'A3']);
    });

    it('3. « Tous » rend tout, sans coupure', () => {
        expect(ids(choisir('tous', 3))).toEqual(ids(ARTEFACTS));
    });

    it('4. « Hybride » rend les N meilleures de la Sélection PLUS toutes les Obligatoires', () => {
        const r = choisir('hybride', 99, { configCategories: CATEGORIES });
        // 2 meilleures de la sélection (90, 80) + les DEUX obligatoires (50 et 55,
        // les notes les plus basses du lot : elles entrent quand même).
        expect(ids(r)).toEqual(['A2', 'A4', 'O1', 'O2']);
        expect(r.length, 'le compte doit être 2 + 2, pas le N du portfolio').toBe(4);
    });

    it('5. les vocabulaires legacy restent lisibles (pratiques d\'avant #434)', () => {
        expect(ids(choisir('recents', 3))).toEqual(ids(choisir('derniers', 3)));
        // top 50 % par note = {A2:90, A4:80, A3:70}, puis par récence : A3(30), A4(20), A2(10).
        expect(ids(choisir('recents-meilleurs', 3))).toEqual(['A3', 'A4', 'A2']);
    });

    it('6. RÉGRESSION #816 — « derniers » ne rend PAS ce que rend « meilleurs »', () => {
        expect(
            ids(choisir('derniers', 3)),
            'le mode « N derniers » est retombé dans le default « N meilleurs »'
        ).not.toEqual(ids(choisir('meilleurs', 3)));
    });

    it('7. RÉGRESSION #816 — l\'hybride ne perd aucune Obligatoire', () => {
        const r = choisir('hybride', 3, { configCategories: CATEGORIES });
        for (const oblig of ['O1', 'O2']) {
            expect(ids(r), `l'obligatoire ${oblig} est tombée de la sélection`).toContain(oblig);
        }
    });

    it('8. les catégories actives ont priorité sur la modalité écrite', () => {
        // Même config, mais la pratique dit « meilleurs » : le moteur de la note
        // (`_selectionnerArtefactsHybride`, profil) traite ce cas en hybride, le panneau aussi.
        const r = choisir('meilleurs', 3, { configCategories: CATEGORIES });
        expect(ids(r)).toEqual(['A2', 'A4', 'O1', 'O2']);
    });
});
