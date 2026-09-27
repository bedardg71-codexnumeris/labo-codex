/**
 * LOT D DE L'ENREGISTREMENT — les présences (D2, D2 bis ; Grégoire, 26 et 27 sept. 2026)
 *
 * Ce que ce banc verrouille, sur les modules RÉELS (`js/saisie-presences.js`, `js/indices.js`,
 * `js/modes.js`) :
 *   1. un chargement n'écrit rien : une séance jamais saisie reste sans présence ;
 *   2. le premier geste sur une séance non saisie l'écrit tout entière, 1,5 s après : les élèves
 *      qu'on n'a pas touchés comptent présents — ceux que la recherche cache aussi (D2 bis a) ;
 *   3. dans une séance DÉJÀ saisie, un élève sans fiche n'est pas écrit par un geste sur une autre
 *      ligne (D2 bis b) ; toucher SA ligne l'écrit ;
 *   4. l'écriture en attente part avant un nouveau rendu du tableau (changement de séance) ;
 *   5. « Réinitialiser » demande confirmation sur une séance saisie, pas sur une séance non saisie ;
 *      « Annuler » ne change rien ;
 *   6. le verrou enregistre et le dit en UN message ; un échec d'écriture ne verrouille pas ;
 *   7. une absence motivée RàI survit à « Tous présents » et à l'enregistrement automatique ;
 *   8. un échec d'écriture ne dit aucun succès et laisse la base intacte.
 * La règle « saisie » est celle de l'assiduité (`construireDatesSaisiesGroupe`), lue par la saisie.
 *
 * Break-tests : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';

const DATE = '2026-09-01';
const DATE2 = '2026-09-03';
const DAS = ['2000001', '2000002', '2000003'];

function storeSeance(presences = []) {
    const store = storeBase();
    store.test_presences = presences;
    store.test_calendrierComplet = { [DATE]: { statut: 'cours', numeroSemaine: 2, jourSemaine: 'Mardi' }, [DATE2]: { statut: 'cours', numeroSemaine: 2, jourSemaine: 'Jeudi' } };
    store.test_seancesCompletes = { [DATE]: [{ id: 'S1', date: DATE, nombrePeriodes: 2, numeroSemaine: 2, jour: 'Mardi' }], [DATE2]: [{ id: 'S2', date: DATE2, nombrePeriodes: 2, numeroSemaine: 2, jour: 'Jeudi' }] };
    store.test_horaire = [{ jour: 'Mardi', nombrePeriodes: 2, heureDebut: '08:00', heureFin: '09:40' }, { jour: 'Jeudi', nombrePeriodes: 2, heureDebut: '08:00', heureFin: '09:40' }];
    return store;
}

/**
 * Le tableau d'une séance tel que le rendu le laisse : un champ de période et un champ de note par
 * élève, marqués de la date. `valeurs` : les périodes affichées (défaut : 2, « présent »).
 */
function monterSeance(store, opts = {}) {
    const valeurs = opts.valeurs || {};
    const reponses = opts.reponsesConfirmation || [];
    const dialogues = [];
    const elements = { 'date-cours': elementDom({ value: opts.date || DATE }), selectGroupePresences: elementDom({ value: '' }), selectTriPresences: elementDom({ value: 'nom' }) };
    const periodes = [], notes = [];
    for (const da of DAS) {
        elements['periodes_' + da] = elementDom({ id: 'periodes_' + da, value: String(da in valeurs ? valeurs[da] : 2), dataset: { da, dateStr: opts.date || DATE, nbPeriodes: '2' } });
        elements['notes_' + da] = elementDom({ id: 'notes_' + da, value: '', dataset: { da, dateStr: opts.date || DATE } });
        periodes.push(elements['periodes_' + da]); notes.push(elements['notes_' + da]);
    }
    if (opts.cacher) elements['periodes_' + opts.cacher].classList.add('u-hide');
    const globaux = Object.assign({
        obtenirInfosJour: (d) => (store.test_calendrierComplet[d] || null), obtenirSeancesJour: (d) => (store.test_seancesCompletes[d] || []),
        obtenirRangSeanceDansSemaine: () => 1, pluriel: (n, s) => s, genererCalendrierComplet() {}, cleSeancesCompletes: () => 'test_seancesCompletes', DUREE_PERIODE_DEFAUT: 50,
        uiDialogues: { confirmerAction: async (o) => { dialogues.push(o); return reponses.length ? reponses.shift() : false; } }
    }, opts.globaux || {});
    const b = monter(store, { modules: ['js/indices.js', 'js/saisie-presences.js'], globaux, elements,
        selecteurs: { '.input-periodes': periodes, '.input-notes': notes } });
    b.dialogues = dialogues;
    return b;
}

const fichesDu = (store, date) => (store.test_presences || []).filter((p) => p.date === date);
const ecrituresPresences = (b) => b.journal.filter((j) => j.k === 'test_presences');
const geste = (b, da, date = DATE) => b.win.notePresenceModifiee({ dataset: { da, dateStr: date } });

describe('lot D · 1. un chargement n’écrit rien', () => {
    it('ouvrir une séance jamais saisie ne crée aucune présence', () => {
        const store = storeSeance();
        const b = monterSeance(store);
        try { b.win.initialiserSaisiePresences(); } catch { /* le rendu du faux document n'est pas mesuré ici */ }
        b.avancer(5000);
        expect(ecrituresPresences(b)).toHaveLength(0);
        expect(fichesDu(store, DATE)).toHaveLength(0);
    });

    it('ouvrir une séance saisie ne la réécrit pas', () => {
        const store = storeSeance([{ date: DATE, da: '2000001', periodesPresentes: 1, notes: '', coursId: 'GC1' }]);
        const b = monterSeance(store);
        try { b.win.initialiserSaisiePresences(); } catch { /* idem */ }
        b.avancer(5000);
        expect(ecrituresPresences(b)).toHaveLength(0);
    });
});

describe('lot D · 2. le premier geste saisit la séance (D2, D2 bis a)', () => {
    it('une absence marquée : rien avant 1,5 s, puis la séance entière — les autres présents', () => {
        const store = storeSeance();
        const b = monterSeance(store, { valeurs: { '2000002': 0 } });
        geste(b, '2000002');
        b.avancer(1400);
        expect(fichesDu(store, DATE)).toHaveLength(0);
        b.avancer(200);
        const fiches = fichesDu(store, DATE);
        expect(fiches.map((p) => [p.da, p.periodesPresentes]).sort()).toEqual([['2000001', 2], ['2000002', 0], ['2000003', 2]]);
        expect(fiches.every((p) => p.coursId === 'GC1')).toBe(true);
    });

    it('un élève caché par la recherche compte présent lui aussi', () => {
        const store = storeSeance();
        const b = monterSeance(store, { valeurs: { '2000002': 0 }, cacher: '2000003' });
        geste(b, '2000002');
        b.avancer(1500);
        expect(fichesDu(store, DATE).find((p) => p.da === '2000003')).toMatchObject({ periodesPresentes: 2 });
    });
});

describe('lot D · 3. un élève sans fiche dans une séance déjà saisie (D2 bis b)', () => {
    const seanceSaisie = () => storeSeance([
        { date: DATE, da: '2000001', periodesPresentes: 2, notes: '', coursId: 'GC1' },
        { date: DATE, da: '2000002', periodesPresentes: 2, notes: '', coursId: 'GC1' }
    ]);

    it('un geste sur une autre ligne n’écrit pas la sienne : il reste compté absent', () => {
        const store = seanceSaisie();
        const b = monterSeance(store, { valeurs: { '2000001': 1 } });
        geste(b, '2000001');
        b.avancer(1500);
        const fiches = fichesDu(store, DATE);
        expect(fiches.find((p) => p.da === '2000001').periodesPresentes).toBe(1);
        expect(fiches.find((p) => p.da === '2000003')).toBeUndefined();
        expect(fiches).toHaveLength(2);
    });

    it('toucher sa ligne l’écrit comme toute autre', () => {
        const store = seanceSaisie();
        const b = monterSeance(store);
        geste(b, '2000003');
        b.avancer(1500);
        expect(fichesDu(store, DATE).find((p) => p.da === '2000003')).toMatchObject({ periodesPresentes: 2 });
    });

    it('l’assiduité le compte absent, et le rendu le dit', () => {
        const store = seanceSaisie();
        const b = monterSeance(store);
        expect(b.win.construireDatesSaisiesGroupe('2000003', store.test_presences).has(DATE)).toBe(true);
        let html = '';
        const tbody = b.document.getElementById('tbody-saisie-presences');
        tbody.appendChild = (tr) => { html += tr.innerHTML; };
        try { b.win.initialiserSaisiePresences(); } catch { /* idem */ }
        expect(html).toContain('id="non-saisi_2000003"');
        expect(html).toContain('Non saisi·e : compté·e absent·e');
        expect(html).not.toContain('id="non-saisi_2000001"');
    });
});

describe('lot D · 4. le vidage avant un nouveau rendu', () => {
    it('saisie puis séance suivante, sans attendre : l’absence est en base', () => {
        const store = storeSeance();
        const b = monterSeance(store, { valeurs: { '2000002': 0 } });
        geste(b, '2000002');
        b.elements['date-cours'].value = DATE2;
        try { b.win.initialiserSaisiePresences(); } catch { /* idem */ }
        expect(fichesDu(store, DATE).find((p) => p.da === '2000002')).toMatchObject({ periodesPresentes: 0 });
        expect(fichesDu(store, DATE2)).toHaveLength(0);
    });

    it('« Fermer » emporte aussi l’écriture en attente', () => {
        const store = storeSeance();
        const b = monterSeance(store, { valeurs: { '2000002': 0 } });
        geste(b, '2000002');
        b.win.fermerSaisiePresences();
        expect(fichesDu(store, DATE)).toHaveLength(3);
    });
});

describe('lot D · 5. « Réinitialiser »', () => {
    it('séance saisie : demande, et « Annuler » ne change rien', async () => {
        const store = storeSeance([{ date: DATE, da: '2000001', periodesPresentes: 2, notes: 'là', coursId: 'GC1' }]);
        const avant = JSON.stringify(store.test_presences);
        const b = monterSeance(store, { reponsesConfirmation: [false] });
        await b.win.reinitialiserSaisie();
        b.avancer(5000);
        expect(b.dialogues).toHaveLength(1);
        expect(b.dialogues[0].message).toBe('Mettre tout le monde absent et vider les notes de cette séance ?');
        expect(b.dialogues[0].texteConfirmer).toBe('Réinitialiser');
        expect(b.dialogues[0].variante).toBe('danger');   // #945 : « Annuler » a le focus, Entrée le suit
        expect(b.elements['periodes_2000001'].value).toBe('2');
        expect(JSON.stringify(store.test_presences)).toBe(avant);
    });

    it('séance saisie, confirmé : tout le monde absent en base', async () => {
        const store = storeSeance([{ date: DATE, da: '2000001', periodesPresentes: 2, notes: 'là', coursId: 'GC1' }]);
        const b = monterSeance(store, { reponsesConfirmation: [true] });
        await b.win.reinitialiserSaisie();
        b.avancer(1500);
        expect(fichesDu(store, DATE).map((p) => p.periodesPresentes)).toEqual([0, 0, 0]);
        expect(fichesDu(store, DATE).find((p) => p.da === '2000001').notes).toBe('');
    });

    it('séance non saisie : aucune question', async () => {
        const store = storeSeance();
        const b = monterSeance(store);
        await b.win.reinitialiserSaisie();
        expect(b.dialogues).toHaveLength(0);
    });
});

describe('lot D · 6. le verrou enregistre et le dit', () => {
    const K_VERROU = 'test_datesVerrouillees_gc_GC1';

    it('séance non saisie : saisie ET verrouillée, un seul message', () => {
        const store = storeSeance();
        const b = monterSeance(store);
        try { b.win.basculerVerrouillageDate(DATE); } catch { /* idem */ }
        expect(fichesDu(store, DATE)).toHaveLength(3);
        expect(store[K_VERROU]).toEqual([DATE]);
        expect(b.notifs.map((n) => n.t)).toEqual(['Séance saisie et verrouillée : les élèves non marqué·es comptent présent·es.']);
    });

    it('séance déjà saisie : « Séance verrouillée. »', () => {
        const store = storeSeance(DAS.map((da) => ({ date: DATE, da, periodesPresentes: 2, notes: '', coursId: 'GC1' })));
        const b = monterSeance(store);
        try { b.win.basculerVerrouillageDate(DATE); } catch { /* idem */ }
        expect(b.notifs.map((n) => n.t)).toEqual(['Séance verrouillée.']);
    });

    it('le geste en attente part dans l’écriture du verrou', () => {
        const store = storeSeance(DAS.map((da) => ({ date: DATE, da, periodesPresentes: 2, notes: '', coursId: 'GC1' })));
        const b = monterSeance(store, { valeurs: { '2000002': 0 } });
        geste(b, '2000002');
        try { b.win.basculerVerrouillageDate(DATE); } catch { /* idem */ }
        expect(fichesDu(store, DATE).find((p) => p.da === '2000002').periodesPresentes).toBe(0);
    });

    it('un échec d’écriture ne verrouille pas', () => {
        const store = storeSeance();
        const b = monterSeance(store);
        const setSync = b.db.setSync;
        b.db.setSync = (k, v) => { if (k === 'test_presences') throw new Error('refus simulé'); return setSync(k, v); };
        try { b.win.basculerVerrouillageDate(DATE); } catch { /* idem */ }
        expect(store[K_VERROU] || []).not.toContain(DATE);
        expect(b.notifs.filter((n) => n.type === 'succes')).toHaveLength(0);
    });
});

describe('lot D · 7. une absence motivée RàI survit', () => {
    it('« Tous présents » puis l’enregistrement automatique : l’absence motivée garde 0 et sa marque', () => {
        const store = storeSeance([{ date: DATE, da: '2000002', periodesPresentes: 0, notes: '', coursId: 'GC1', facultatif: true }]);
        const b = monterSeance(store, { valeurs: { '2000002': 0, '2000001': 0 } });
        b.win.tousPresents();
        b.avancer(1500);
        const bruno = fichesDu(store, DATE).filter((p) => p.da === '2000002');
        expect(bruno).toEqual([{ date: DATE, da: '2000002', periodesPresentes: 0, notes: '', coursId: 'GC1', facultatif: true }]);
        expect(fichesDu(store, DATE).find((p) => p.da === '2000001').periodesPresentes).toBe(2);
    });
});

describe('lot D · 7 bis. la ligne d’une absence motivée, touchée, garde sa marque', () => {
    it('une note tapée sur sa ligne la réécrit avec `facultatif`', () => {
        const store = storeSeance([{ date: DATE, da: '2000002', periodesPresentes: 0, notes: '', coursId: 'GC1', facultatif: true }]);
        const b = monterSeance(store, { valeurs: { '2000002': 0 } });
        b.elements['notes_2000002'].value = 'rencontre RàI';
        geste(b, '2000002');
        b.avancer(1500);
        expect(fichesDu(store, DATE).filter((p) => p.da === '2000002')).toEqual([
            { date: DATE, da: '2000002', periodesPresentes: 0, notes: 'rencontre RàI', coursId: 'GC1', facultatif: true }]);
    });
});

describe('lot D · 8. un échec d’écriture ne dit aucun succès', () => {
    it('base intacte, aucune notification de succès', () => {
        const store = storeSeance();
        const b = monterSeance(store, { valeurs: { '2000002': 0 } });
        b.db.setSync = () => { throw new Error('refus simulé'); };
        geste(b, '2000002');
        b.avancer(1500);
        expect(fichesDu(store, DATE)).toHaveLength(0);
        expect(b.notifs.filter((n) => n.type === 'succes')).toHaveLength(0);
    });
});

/*
 * JOURNAL DES BREAK-TESTS — 27 sept. 2026, sur l'arbre du lot (module restauré par copie, empreinte
 * vérifiée). Bancs rejoués : ce fichier, #785, audit du 6 sept. (§ 3), #749 lot 3.
 *   M1.  un chargement qui écrit (« Confirmer » au rendu)                → 1 rouge (1)
 *   M2.  l'écriture retire toute la séance, pas seulement ce qu'elle réécrit (#785) → 2 rouges (3, 7)
 *   M3.  pas de vidage au changement de séance (l'attente est jetée)     → 1 rouge (4)
 *   M4.  « Réinitialiser » sans confirmation sur une séance saisie       → 1 rouge (5)
 *   M5.  le verrou réécrit toutes les lignes rendues (l'ancien écrivain) → 2 rouges (#785)
 *   M6.  D2 bis b ignoré : toute ligne sans fiche s'écrit                → 1 rouge (3)
 *   M7.  la marque `facultatif` n'est plus reportée                      → 1 rouge (7 bis)
 *   M8.  verrou posé malgré l'échec d'écriture                           → 1 rouge (6)
 *   M9.  les lignes cachées par la recherche sautées                     → 1 rouge (2)
 *   M10. délai de 1,5 s ramené à 0                                       → 1 rouge (2)
 *   M11. le verrou dit toujours « Séance verrouillée. »                  → 1 rouge (6)
 */
