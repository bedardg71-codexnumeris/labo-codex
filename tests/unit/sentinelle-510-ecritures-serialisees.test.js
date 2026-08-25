import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #510 (25 août 2026) — DEUX ENREGISTREMENTS COUP SUR COUP NE
// S'EFFACENT PLUS L'UN L'AUTRE.
//
// Le symptôme, rapporté par Grégoire avant l'audit du 25 août : « les boutons
// d'enregistrement des paramètres semblent avoir causé des soucis à quelques
// moments — on dirait que les données n'étaient pas toujours enregistrées. »
//
// La cause, reproduite au navigateur pendant l'audit : les éditeurs de
// gabarits enregistrent champ par champ, et le `change` d'un champ part AU
// BLUR — donc au moment précis où l'on clique dans le champ suivant. Chaque
// enregistrement lisait la collection entière, la modifiait, la réécrivait
// entière. Deux rafales rapprochées lisaient le même instantané ; la seconde
// réécrivait la collection SANS la modification de la première.
//
//     A : get ──────────── set(+ nomA)
//     B :   get ─────────────── set(SANS nomA)   ⇒ « NOM-A » perdu, en silence
//
// ⚠ Sérialiser les ÉCRITURES n'y aurait rien fait : le mal est fait à la
// LECTURE. C'est la séquence entière qui doit être atomique — d'où la file par
// clé de `db.modifier` (db.js).
//
// Ce banc est COMPORTEMENTAL de bout en bout : la VRAIE db.js (mode
// localStorage-seul, celui que Node offre) et les VRAIS éditeurs, dans un même
// sandbox. Rien n'est simulé du chemin de données.

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

/** La vraie base, bootée. Node n'a pas d'IndexedDB : mode localStorage-seul. */
async function monterDb() {
    const fenetre = {
        addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true
    };
    chargerScript('js/db.js', { localStorage: fauxLocalStorage() }, fenetre);
    await new Promise((res) => setTimeout(res, 25));
    // Garde de validité du banc : sans base prête, tout ce qui suit ne prouve rien.
    if (!fenetre.db || fenetre.db.ready !== true) throw new Error('db non prête');
    return fenetre.db;
}

/* ------------------------------------------ A — le contrat de `db.modifier` */

describe('#510 · A — `db.modifier` sérialise lecture, modification et écriture', () => {

    it('A.a LE CAS QUI PORTE LE SENS : deux modifications concurrentes survivent toutes les deux', async () => {
        const db = await monterDb();
        await db.set('grilles', [{ id: 'G1', criteres: [{ nom: '' }, { nom: '' }] }]);

        // Les deux rafales partent SANS s'attendre — c'est le geste réel :
        // quitter un champ pour cliquer dans le suivant.
        await Promise.all([
            db.modifier('grilles', (g) => { g[0].criteres[0].nom = 'NOM-A'; return g; }, []),
            db.modifier('grilles', (g) => { g[0].criteres[1].nom = 'NOM-B'; return g; }, [])
        ]);

        const apres = await db.get('grilles');
        // Avant le correctif : critère 0 restait vide — « NOM-A » perdu.
        expect(apres[0].criteres[0].nom, 'la première modification ne doit pas être écrasée').toBe('NOM-A');
        expect(apres[0].criteres[1].nom).toBe('NOM-B');
    });

    it('A.b dix rafales d\'affilée : aucune ne se perd', async () => {
        const db = await monterDb();
        await db.set('liste', []);

        await Promise.all(Array.from({ length: 10 }, (_, i) =>
            db.modifier('liste', (l) => { l.push(i); return l; }, [])
        ));

        const apres = await db.get('liste');
        expect(apres.slice().sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('A.c un mutateur qui rend `undefined` n\'écrit rien', async () => {
        // C'est le chemin des refus : grille introuvable, index hors bornes.
        // Réécrire la collection « telle quelle » y serait une occasion de
        // perdre ce qu'une autre rafale vient d'y poser.
        const db = await monterDb();
        await db.set('cle', { valeur: 'INTACTE' });

        const rendu = await db.modifier('cle', () => undefined, null);

        expect(rendu).toBeUndefined();
        expect(await db.get('cle')).toEqual({ valeur: 'INTACTE' });
    });

    it('A.d une opération qui lève ne bloque pas la file derrière elle', async () => {
        // Sans ça, une seule erreur suspendrait TOUS les enregistrements
        // suivants de cette clé, pour le reste de la session.
        const db = await monterDb();
        await db.set('cle', { n: 0 });

        const echouee = db.modifier('cle', () => { throw new Error('boum'); }, null);
        await expect(echouee).rejects.toThrow('boum');

        await db.modifier('cle', (v) => ({ n: v.n + 1 }), null);
        expect(await db.get('cle')).toEqual({ n: 1 });
    });

    it('A.e deux clés différentes ne s\'attendent pas', async () => {
        // La file est PAR CLÉ : une file globale ferait attendre l'édition
        // d'une échelle derrière celle d'une grille, sans raison.
        const db = await monterDb();
        await db.set('lente', 0);
        await db.set('rapide', 0);

        let debloquer;
        const barriere = new Promise((res) => { debloquer = res; });
        const journal = [];

        const lente = db.modifier('lente', async () => { await barriere; journal.push('lente'); return 1; }, 0);
        await db.modifier('rapide', () => { journal.push('rapide'); return 1; }, 0);

        expect(journal, 'la clé rapide a fini pendant que la lente attendait').toEqual(['rapide']);
        debloquer();
        await lente;
        expect(journal).toEqual(['rapide', 'lente']);
    });
});

/* --------------------------------- B — les éditeurs passent bien par la file */

/**
 * Monte la vraie db PUIS un vrai module d'édition dans le même sandbox.
 * Ce que le module appelle hors de son IIFE doit lui être remis en main :
 * `chargerScript` ne passe que des paramètres nommés.
 */
async function monterEditeur(fichier, globauxSupplementaires = {}) {
    const db = await monterDb();
    const globaux = {
        db,
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        alert: () => {}, confirm: () => true,
        genererIdUnique: (p) => p + '1',
        notifications: { succes() {}, erreur() {}, info() {} },
        document: {
            getElementById: () => null, querySelector: () => null,
            querySelectorAll: () => [], createElement: () => ({ style: {}, classList: { add() {}, remove() {} } }),
            addEventListener() {}
        },
        ...globauxSupplementaires
    };
    const win = chargerScript(fichier, globaux);
    return { db, win };
}

describe('#510 · B — l\'éditeur de grilles n\'écrase plus sa propre saisie', () => {
    it('B.a deux critères nommés coup sur coup gardent leurs deux noms', async () => {
        const { db, win } = await monterEditeur('js/grilles.js', {
            grilleTemplateActuelle: null,
            calculerEtAfficherTotalPonderation: () => {}
        });
        await db.set('a2026_grillesTemplates', [   // security-ok: littéral de banc, aucune source externe
            { id: 'G1', nom: 'Grille', criteres: [{ id: 'C0', nom: '' }, { id: 'C1', nom: '' }] }
        ]);

        // Le geste réel : le blur du premier champ et celui du second se
        // suivent de si près que les deux enregistrements se chevauchent.
        await Promise.all([
            win.modifierCritereGrille('G1', 0, 'nom', 'NOM-A'),
            win.modifierCritereGrille('G1', 1, 'nom', 'NOM-B')
        ]);

        const grilles = await db.get('a2026_grillesTemplates');
        expect(grilles[0].criteres[0].nom, 'la saisie du premier champ doit rester').toBe('NOM-A');
        expect(grilles[0].criteres[1].nom).toBe('NOM-B');
    });

    it('B.b une grille introuvable ne réécrit pas la collection', async () => {
        const { db, win } = await monterEditeur('js/grilles.js', {
            grilleTemplateActuelle: null,
            calculerEtAfficherTotalPonderation: () => {}
        });
        await db.set('a2026_grillesTemplates', [{ id: 'G1', criteres: [{ nom: 'INTACT' }] }]);   // security-ok: littéral de banc, aucune source externe

        await win.modifierCritereGrille('GRILLE-QUI-N-EXISTE-PAS', 0, 'nom', 'X');

        const grilles = await db.get('a2026_grillesTemplates');
        expect(grilles[0].criteres[0].nom).toBe('INTACT');
    });
});

describe('#510 · B — l\'éditeur d\'échelles non plus', () => {
    it('B.c deux niveaux édités coup sur coup gardent leurs deux valeurs', async () => {
        const { db, win } = await monterEditeur('js/echelles.js', {
            echelleTemplateActuelle: null,
            afficherNiveauxEchelle: () => {}
        });
        await db.set('a2026_echellesTemplates', [   // security-ok: littéral de banc, aucune source externe
            { id: 'E1', nom: 'Échelle', niveaux: [{ code: 'I', nom: '' }, { code: 'D', nom: '' }] }
        ]);

        await Promise.all([
            win.modifierNiveauEchelle('E1', 0, 'nom', 'NIVEAU-A'),
            win.modifierNiveauEchelle('E1', 1, 'nom', 'NIVEAU-B')
        ]);

        const echelles = await db.get('a2026_echellesTemplates');
        expect(echelles[0].niveaux[0].nom, 'la saisie du premier niveau doit rester').toBe('NIVEAU-A');
        expect(echelles[0].niveaux[1].nom).toBe('NIVEAU-B');
    });
});
