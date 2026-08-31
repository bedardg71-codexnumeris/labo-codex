import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #517 (26 août 2026) — LA MATRICE D'UNE CARTOUCHE NE VIT PLUS EN RAM.
//
// `sauvegarderCommentaire` n'écrivait qu'en mémoire : la persistance n'arrivait
// qu'au bouton « Enregistrer », tout en bas d'un écran long. Changer de
// cartouche, de sous-onglet, ou fermer l'app perdait toute la saisie — sans un
// mot. C'était le modèle INVERSE des trois écrans voisins, dans le même onglet,
// et cette incohérence suffisait à nourrir « des fois ça enregistre, des fois
// non ».
//
// Verdict de Grégoire (D2, 26 août) : enregistrement automatique, comme les
// autres.
//
// ⚠ Ce que ce banc surveille en plus du symptôme : que l'enregistrement au fil
// de l'eau ne réveille PAS la machinerie du bouton (validation de nom, dialogue
// de doublons). Une boîte de dialogue au milieu d'une saisie serait un défaut
// pire que celui qu'on corrige.

/* ------------------------------------------------------------------ harnais */

// ⚠ CLÉ MIGRÉE PAR S5/#623 LE 31 AOÛT 2026. Le corpus semait sous la clé NUE
// `cartouches_G1` ; `js/cartouches.js` route désormais ses lectures et ses
// écritures par `cle(...)`, donc vers `a2026_cartouches_G1`. Le corpus ne
// correspondait plus à ce que le code lit — d'où des valeurs `undefined` et des
// textes qui semblaient perdus, alors que rien n'était cassé.
// ⮕ La clé est DÉRIVÉE du même préfixe que le stub `cle` ci-dessous, jamais
//   recopiée : si le stub change, le corpus suit. Un préfixe écrit deux fois
//   est un désaccord qui attend son heure.
const PREFIXE_TRIMESTRE = 'a2026_';
const CLE_CART = PREFIXE_TRIMESTRE + 'cartouches_G1';


function monter({ cartouches = [], cartoucheOuverte = null, champs = {} } = {}) {
    const store = { [CLE_CART]: cartouches };
    const journal = [];
    const els = {};
    Object.keys(champs).forEach(id => { els[id] = { value: champs[id] }; });

    const globaux = {
        db: {
            // ⚠⚠ CHAQUE LECTURE REND UNE COPIE, comme une vraie base qui
            // sérialise. Un faux `get` qui rend la MÊME référence rend la course
            // de #510 structurellement impossible : les deux appels modifient
            // alors le même tableau, rien ne se perd jamais, et le test C.a
            // passe au vert quoi qu'il arrive au code. Constaté au break-test du
            // 26 août — le banc était complaisant avant de l'être moins.
            get: async (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
            getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
            set: async (k, v) => { store[k] = v; },
            setSync: (k, v) => { store[k] = v; },
            // La file par clé de #510, reproduite : les séquences ne se chevauchent pas.
            modifier: (() => {
                const files = new Map();
                return async (k, mutateur, defaut) => {
                    const precedente = files.get(k) || Promise.resolve();
                    const courante = precedente.then(() => {}, () => {}).then(async () => {
                        const valeur = (k in store ? JSON.parse(JSON.stringify(store[k])) : defaut);
                        const resultat = await mutateur(valeur);
                        if (resultat === undefined) return undefined;
                        store[k] = resultat;
                        return resultat;
                    });
                    files.set(k, courante);
                    return courante;
                };
            })()
        },
        cle: (k) => PREFIXE_TRIMESTRE + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        alert: (m) => journal.push(['alert', String(m)]),
        confirm: () => { journal.push(['confirm']); return true; },
        prompt: () => { journal.push(['prompt']); return 'x'; },
        verifierEtGererDoublon: async () => { journal.push(['dialogue-doublon']); return null; },
        notifications: { succes: () => {}, erreur: () => {}, info: () => {}, avertissement: () => {} },
        cartoucheActuel: cartoucheOuverte,
        calculerPourcentageComplete: async () => {},
        document: {
            getElementById: (id) => els[id] || null,
            querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} } })
        }
    };
    const win = chargerScript('js/cartouches.js', globaux);
    win.cartoucheActuel = cartoucheOuverte;
    return { win, store, journal, els };
}

// ⚠ `criteres` et `niveaux` ne sont pas décoratifs : `calculerPourcentageComplete`
// les parcourt à chaque saisie, et il vit dans la même IIFE que le code testé —
// un stub passé au sandbox ne le remplace pas.
const CARTOUCHE = () => ({
    id: 'CA1', grilleId: 'G1', nom: 'Cartouche de français',
    contexte: 'Contexte initial',
    criteres: [{ id: 'CR_1', nom: 'Français' }, { id: 'CR_2', nom: 'Structure' }],
    niveaux: [{ code: 'I' }, { code: 'M' }, { code: 'E' }],
    commentaires: { 'CR_1_I': 'texte de départ' }
});

/* ------------------------------------------ A — la matrice atteint les données */

describe('#517 · A — chaque cellule de la matrice s\'enregistre seule', () => {

    it('A.a LE CAS QUI PORTE LE SENS : un commentaire saisi est EN BASE, sans bouton', async () => {
        const ouverte = CARTOUCHE();
        const { win, store } = monter({
            cartouches: [CARTOUCHE()], cartoucheOuverte: ouverte,
            champs: { 'comm_CR_1_M': 'Ta démonstration est complète.' }
        });

        await win.sauvegarderCommentaire('CR_1_M');

        // Avant #517 : la base ne bougeait pas tant qu'on n'avait pas cliqué.
        expect(store[CLE_CART][0].commentaires['CR_1_M'])
            .toBe('Ta démonstration est complète.');
    });

    it('A.b LE PIÈGE ÉVITÉ : aucune boîte de dialogue ne s\'ouvre pendant la saisie', async () => {
        // `sauvegarderCartouche` valide le nom par une alerte et interroge sur
        // les doublons. La réveiller à chaque frappe ouvrirait une fenêtre au
        // milieu d'une phrase.
        const ouverte = CARTOUCHE();
        const { win, journal } = monter({
            cartouches: [CARTOUCHE()], cartoucheOuverte: ouverte,
            champs: { 'comm_CR_1_M': 'un texte' }
        });

        await win.sauvegarderCommentaire('CR_1_M');

        expect(journal, 'ni alerte, ni confirm, ni dialogue de doublon').toEqual([]);
    });

    it('A.c une cartouche JAMAIS enregistrée n\'écrit rien, et ne casse rien', async () => {
        // Même modèle que les grilles et les échelles : le premier
        // enregistrement reste un geste.
        const ouverte = { id: 'CA_NEUVE', grilleId: 'G1', commentaires: {},
                          criteres: [{ id: 'CR_1' }], niveaux: [{ code: 'M' }] };
        const { win, store } = monter({
            cartouches: [], cartoucheOuverte: ouverte,
            champs: { 'comm_CR_1_M': 'un texte' }
        });

        await win.sauvegarderCommentaire('CR_1_M');

        expect(store[CLE_CART]).toEqual([]);
        expect(ouverte.commentaires['CR_1_M'], 'la mémoire, elle, a bien reçu').toBe('un texte');
    });

    it('A.d les autres cellules ne sont pas touchées', async () => {
        const ouverte = CARTOUCHE();
        const { win, store } = monter({
            cartouches: [CARTOUCHE()], cartoucheOuverte: ouverte,
            champs: { 'comm_CR_1_M': 'neuf' }
        });
        await win.sauvegarderCommentaire('CR_1_M');
        expect(store[CLE_CART][0].commentaires['CR_1_I']).toBe('texte de départ');
    });
});

/* ------------------------------------------------- B — le contexte aussi */

describe('#517 · B — le contexte ouvre chaque rétroaction : il ne se perd plus', () => {
    it('B.a le contexte saisi atteint les données', async () => {
        const ouverte = CARTOUCHE();
        const { win, store } = monter({
            cartouches: [CARTOUCHE()], cartoucheOuverte: ouverte,
            champs: { 'contexteCartouche': '  Ce travail portait sur Nelligan.  ' }
        });

        await win.sauvegarderContexteCartouche();

        expect(store[CLE_CART][0].contexte).toBe('Ce travail portait sur Nelligan.');
    });

    it('B.b le NOM, lui, reste au bouton — et c\'est délibéré', async () => {
        // Il déclenche la vérification de doublons, qui pose une question. Une
        // question par frappe n'est pas un enregistrement automatique.
        const source = chargerScript.toString();  // garde de validité du banc
        expect(typeof source).toBe('string');
        const ouverte = CARTOUCHE();
        const { win, store, journal } = monter({
            cartouches: [CARTOUCHE()], cartoucheOuverte: ouverte,
            champs: { 'contexteCartouche': 'x' }
        });
        await win.sauvegarderContexteCartouche();
        expect(store[CLE_CART][0].nom, 'le nom n\'a pas bougé').toBe('Cartouche de français');
        expect(journal).toEqual([]);
    });
});

/* --------------------------------- C — la course de #510 n'est pas réintroduite */

describe('#517 · C — deux cellules quittées coup sur coup gardent leurs deux textes', () => {
    it('C.a l\'écriture passe par la file par clé, pas par un lire-modifier-écrire nu', async () => {
        const ouverte = CARTOUCHE();
        const { win, store, els } = monter({
            cartouches: [CARTOUCHE()], cartoucheOuverte: ouverte,
            champs: { 'comm_CR_1_M': 'TEXTE-A', 'comm_CR_2_E': 'TEXTE-B' }
        });

        await Promise.all([
            win.sauvegarderCommentaire('CR_1_M'),
            win.sauvegarderCommentaire('CR_2_E')
        ]);

        const enBase = store[CLE_CART][0].commentaires;
        expect(enBase['CR_1_M'], 'la première saisie ne doit pas être écrasée').toBe('TEXTE-A');
        expect(enBase['CR_2_E']).toBe('TEXTE-B');
    });
});
