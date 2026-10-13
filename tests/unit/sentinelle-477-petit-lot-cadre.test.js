import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #477 (lot 8, consigne de Cowork du 11 oct. 2026) — PETIT LOT CADRE, remesuré au code actuel
// (constats CT-16, CT-19, CT-22 de `plans de travail/AUDIT-cadre-trimestre-2026-08-20.md`).
//
//   A — CT-16 : « Fermer » un horaire oublie aussi l'horaire mémorisé ; au chargement suivant,
//       il ne se rouvre plus en édition. (Le toast « Modifications annulées » de l'audit n'existe plus.)
//   B — CT-19 : les trimestres se dédoublonnent par id À LA LECTURE ; la liste enregistrée n'est
//       jamais réécrite ; deux noms jumeaux sont deux trimestres. Le menu « Trimestre » du groupe-cours
//       n'affiche plus un doublon d'id deux fois.
//   C — CT-22 : l'outil de diagnostic rattache un relevé (`{trim}_snapshots_{contexte}`) au cours de
//       son groupe-cours ; le recensement d'un cours lit les clés nues d'un groupe-cours nu.
// Noms fictifs.

const clone = (x) => JSON.parse(JSON.stringify(x));

/* ------------------------------------------------------------------ A — l'horaire fermé */

function element(classes = [], valeur = '') {
    const set = new Set(classes);
    return { value: valeur, textContent: '', innerHTML: '', options: [], focus() {}, scrollIntoView() {},
        classList: { add: (c) => set.add(c), remove: (c) => set.delete(c), contains: (c) => set.has(c),
            toggle: (c, f) => { if (f === undefined ? !set.has(c) : f) set.add(c); else set.delete(c); } } };
}
const HORAIRE = { id: 'HOR_1', groupeAssocie: '00001', nom: 'Lun-Mer fictif', seances: [{ jour: 'Lundi', heureDebut: '08:00', heureFin: '10:00', nombrePeriodes: 2, local: 'A-101' }] };

function monterHoraires() {
    // Une liste FIXE, celle du banc du lot E2 : un faux qui fabrique tout identifiant fait boucler
    // l'éditeur, qui avance tant qu'il trouve `v2-hor-seance-N-…`.
    const ids = {
        'v2-btnSupprimerHoraire': element(['u-hide']), 'v2-selectHoraire': element(), 'v2-titreFormHoraire': element(),
        'v2-btnCreerHoraire': element(['u-hide']), 'v2-carteResumeHoraire': element(), 'v2-horaireEtatVide': element(),
        'v2-formulaireHoraire': element(['u-hide']),
        'v2-hor-groupeAssocie': element(), 'v2-hor-nom': element(), 'v2-hor-nbSeances': element([], '1'),
        'v2-hor-seance-0-jour': element([], 'Lundi'), 'v2-hor-seance-0-debut': element([], '08:00'), 'v2-hor-seance-0-fin': element([], '10:00'),
        'v2-hor-seance-0-periodes': element(), 'v2-hor-seance-0-local': element()
    };
    ids['v2-hor-groupeAssocie'].options = [{ value: '' }, { value: '00001' }];
    const document = { getElementById: (id) => ids[id] || null, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], createElement: () => element() };
    const stores = { a2026_horaires: [clone(HORAIRE)], a2026_horaireHebdo: [], a2026_groupeEtudiants: [] };
    const win = chargerScript('js/trimestre-v2-horaires.js', {
        document,
        db: { getSync: (k, d) => (k in stores ? stores[k] : d), setSync: (k, v) => { stores[k] = v; } },
        cle: (n) => 'a2026_' + n,
        sauvegarderDonneesSelonMode: (k, v) => { stores['a2026_' + k] = clone(v); return true; },
        echapperHtml: (s) => String(s == null ? '' : s), echapperAttribut: (s) => String(s == null ? '' : s),
        genererIdUnique: (p) => p + 'NEUF', calculerHeureFin: () => '10:00',
        fusionnerSeancesHoraires: (hs) => (hs || []).flatMap(h => (h && h.seances) || []),
        notifications: { succes() {}, erreur() {} },
        estEnModeDemo: () => false
    }, { temoinEnregistrement: { nonEnregistre() {}, enregistre() {} }, raisonPourTemoin: (r) => r,
        uiDialogues: { declarerFicheEnCreation() {}, quitterCreationSiConfirme: async () => true } });
    win.populerDropdownsAssemblageV2 = () => {};
    return { win, stores };
}

describe('#477 · A — « Fermer » un horaire oublie l\'horaire mémorisé (CT-16)', () => {
    it('A.0 témoin : ouvrir un horaire le mémorise, et le chargement suivant le rouvre en édition', () => {
        const { win, stores } = monterHoraires();
        win.changerHoraireSelectionneV2('HOR_1');
        expect(stores.a2026_horaireSelectionne).toBe('HOR_1');
        win.chargerHorairesV2();
        expect(stores.a2026_horaireSelectionne, 'la sélection mémorisée reste : l\'horaire se rouvre').toBe('HOR_1');
    });
    it('A.1 « Fermer » : la sélection mémorisée est oubliée ; le chargement suivant laisse l\'éditeur vide', async () => {
        const { win, stores } = monterHoraires();
        win.changerHoraireSelectionneV2('HOR_1');
        await win.fermerFicheHoraireV2();
        expect(stores.a2026_horaireSelectionne).toBeNull();
        win.chargerHorairesV2();
        expect(stores.a2026_horaireSelectionne, 'rien ne la remet').toBeNull();
        expect(stores.a2026_horaires, 'l\'horaire lui-même reste').toHaveLength(1);
    });
});

/* ------------------------------------------------------------- B — les trimestres en double */

function monterTrimestres(trimestres) {
    const store = { trimestres: clone(trimestres) };
    const ecritures = [];
    const db = {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; ecritures.push(c); },
        setSync: (c, v) => { store[c] = v; ecritures.push(c); }
    };
    const win = chargerScript('js/trimestres.js', { db });
    return { win, store, ecritures };
}
const LISTE = [
    { id: 'a2031', nom: 'Automne 2031', actif: true },
    { id: 'a2031', nom: 'Automne 2031 (copie)' },
    { id: 'h2032', nom: 'Automne 2031' }          // un nom jumeau, un autre trimestre
];

describe('#477 · B — les trimestres se dédoublonnent par id à la lecture, sans réécriture (CT-19)', () => {
    it('B.1 le premier de chaque id ; un nom jumeau reste ; la liste enregistrée n\'est pas réécrite', () => {
        const b = monterTrimestres(LISTE);
        expect(b.win.obtenirTrimestres().map((t) => t.id + '|' + t.nom)).toEqual(['a2031|Automne 2031', 'h2032|Automne 2031']);
        expect(b.win.enumererTrimestres().map((t) => t.id)).toEqual(['a2031', 'h2032']);
        b.win.cle('groupeEtudiants');
        b.win.obtenirTrimestres();
        expect(b.ecritures, 'aucune écriture de la liste à la lecture').toEqual([]);
        expect(b.store.trimestres, 'la liste enregistrée reste telle quelle').toEqual(LISTE);
    });
    it('B.2 le menu « Trimestre » du formulaire de groupe-cours n\'affiche pas un doublon d\'id deux fois', () => {
        const b = monterTrimestres(LISTE);
        const select = { innerHTML: '', value: '' };
        const document = { getElementById: (id) => (id === 'v2-gc-trimestre' ? select : null), querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
        const winTv2 = { obtenirTrimestres: b.win.obtenirTrimestres };
        chargerScript('js/trimestre-v2.js', { document, db: { getSync: (k, d) => (k === 'trimestres' ? clone(LISTE) : d), setSync() {} },
            cle: (k) => 'a2031_' + k, echapperHtml: (s) => String(s), echapperAttribut: (s) => String(s), estEnModeDemo: () => false }, winTv2);
        winTv2.populerDropdownsAssemblageV2();
        const valeurs = [...select.innerHTML.matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]);
        expect(valeurs).toEqual(['', 'a2031', 'h2032']);
    });
});

/* -------------------------------------------------------------- C — l'outil de diagnostic */

function monterCours(store) {
    const db = {
        get: async (k, d = null) => (k in store ? clone(store[k]) : d),
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        keys: async () => Object.keys(store),
        setSync() {}, set: async () => {}
    };
    return chargerScript('js/cours.js', { db, localStorage: {},
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} },
        echapperHtml: (s) => String(s), notifications: { succes() {}, erreur() {} } });
}

describe('#477 · C — le schéma de l\'outil de diagnostic (CT-22)', () => {
    it('C.1 un relevé `{trim}_snapshots_{groupe-cours}` compte pour le cours de son groupe-cours, pas comme orphelin', async () => {
        const win = monterCours({
            cours: [{ id: 'COURS_A', codeCours: '601-101-MQ' }],
            trimestres: [{ id: 'a2031', nom: 'Automne 2031' }],
            a2031_groupesCours: [{ id: 'GC_1', coursId: 'COURS_A', groupeNum: '00001' }],
            a2031_snapshots_GC_1: { hebdomadaires: [] }
        });
        const r = await win._diagnostiquerModeleCours();
        expect(r.orphelins, 'l\'id du groupe-cours n\'est pas un cours orphelin').toEqual([]);
        expect(r.scores.COURS_A.snapshots).toBe(1);
        // I14 / #469 (12 oct. 2026) : le rapport est rendu, plus imprimé en console.
        expect(r.rapport[0]).toBe('[Diagnostic modèle cours] 1 cours · 1 trimestres');
        expect(r.rapport).toContain('601-101-MQ : 1 objet(s)');
    });
    it('C.2 un groupe-cours sous la clé nue : ses élèves sont lus sous la clé nue, pas sous « (sans trimestre)_… »', async () => {
        const win = monterCours({
            cours: [{ id: 'COURS_A', codeCours: '601-101-MQ' }],
            groupesCours: [{ id: 'GC_1', coursId: 'COURS_A', groupeNum: '00001' }],
            groupeEtudiants: [{ da: '9000001', nom: 'Fictif', groupeCoursId: 'GC_1' }]
        });
        const plan = await win.recenserDependancesCours('COURS_A');
        expect(plan.gcDependants).toHaveLength(1);
        expect(plan.gcDependants[0].trim, 'le libellé reste').toBe('(sans trimestre)');
        expect(plan.gcDependants[0].nbEtu, 'l\'élève du groupe-cours nu est compté').toBe(1);
    });
});
