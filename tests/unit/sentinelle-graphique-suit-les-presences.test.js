/**
 * « LE GRAPHIQUE SUIT LES PRÉSENCES » (8 nov. 2026, règle validée par Grégoire).
 *
 * Avant : le graphique du Suivi du groupe ne lit que les captures, et une capture ne se prenait qu'à
 * l'ouverture de l'application, pour une seule semaine à la fois (`verifierEtCapturerSnapshotHebdomadaire`
 * s'arrête dès qu'une séance de la semaine courante est capturée). Enregistrer des présences ne capturait
 * rien ; seule « Recalculer les captures » (Réglages › Données) rattrapait.
 *
 * La règle :
 *   · chaque enregistrement de présences pour une date D recapture la séance D, puis chacune des séances
 *     DÉJÀ capturées après D (les indices sont cumulatifs : une correction en semaine 2 change les
 *     captures suivantes) ; les captures d'avant D ne bougent pas, une séance jamais saisie n'en reçoit pas ;
 *   · un groupe vu deux fois dans la semaine : chaque séance enregistrée a sa capture ;
 *   · jamais de capture pour une date future ;
 *   · le Suivi du groupe affiché se redessine APRÈS l'écriture des captures (il montre la séance).
 *
 * Modules RÉELS : `js/indices.js` (l'assiduité), `js/saisie-presences.js` (l'écrivain des présences, par le
 * geste et l'enregistrement automatique de 1,5 s), `js/snapshots.js`, sur `modes.js` réel (bac-suivi).
 * Noms fictifs.
 *
 * Break-tests : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase, elementDom, clone } from './_helpers/bac-suivi.js';

const AUJOURDHUI = '2026-09-06';
const DAS = ['2000001', '2000002', '2000003'];
const BRUNO = '2000002';
// Mardi et jeudi : le groupe est vu deux fois par semaine.
const S0 = '2026-08-20';   // jeudi, semaine 1
const S1 = '2026-08-25';   // mardi, semaine 2
const S2 = '2026-08-27';   // jeudi, semaine 2 — jamais saisie dans le scénario principal
const S3 = '2026-09-01';   // mardi, semaine 3
const S4 = '2026-09-03';   // jeudi, semaine 3
const SEMAINES = { [S0]: 1, [S1]: 2, [S2]: 2, [S3]: 3, [S4]: 3 };
const JOURS = { [S0]: 'Jeudi', [S1]: 'Mardi', [S2]: 'Jeudi', [S3]: 'Mardi', [S4]: 'Jeudi' };

function storeTrimestre() {
    const store = storeBase();
    store.test_calendrierComplet = {};
    store.test_seancesCompletes = {};
    for (const d of Object.keys(SEMAINES)) {
        store.test_calendrierComplet[d] = { statut: 'cours', numeroSemaine: SEMAINES[d], jourSemaine: JOURS[d] };
        store.test_seancesCompletes[d] = [{ id: 'S-' + d, date: d, nombrePeriodes: 2, numeroSemaine: SEMAINES[d], jour: JOURS[d] }];
    }
    store.test_horaire = [{ jour: 'Mardi', nombrePeriodes: 2, heureDebut: '08:00', heureFin: '09:40' }, { jour: 'Jeudi', nombrePeriodes: 2, heureDebut: '08:00', heureFin: '09:40' }];
    return store;
}

/** Le tableau de saisie : un champ de périodes et un champ de note par élève (redatés à chaque séance ouverte). */
function monterSaisie(store, globaux = {}) {
    const elements = { 'date-cours': elementDom({ value: S0 }), selectGroupePresences: elementDom({ value: '' }), selectTriPresences: elementDom({ value: 'nom' }) };
    const periodes = [], notes = [];
    for (const da of DAS) {
        elements['periodes_' + da] = elementDom({ id: 'periodes_' + da, value: '2', dataset: { da, dateStr: S0, nbPeriodes: '2' } });
        elements['notes_' + da] = elementDom({ id: 'notes_' + da, value: '', dataset: { da, dateStr: S0 } });
        periodes.push(elements['periodes_' + da]); notes.push(elements['notes_' + da]);
    }
    return monter(store, {
        aujourdhui: AUJOURDHUI,
        modules: ['js/indices.js', 'js/saisie-presences.js', 'js/snapshots.js'],
        elements, selecteurs: { '.input-periodes': periodes, '.input-notes': notes },
        globaux: Object.assign({
            obtenirInfosJour: (d) => (store.test_calendrierComplet[d] || null), obtenirSeancesJour: (d) => (store.test_seancesCompletes[d] || []),
            obtenirRangSeanceDansSemaine: () => 1, pluriel: (n, s) => s, genererCalendrierComplet() {}, cleSeancesCompletes: () => 'test_seancesCompletes', DUREE_PERIODE_DEFAUT: 50,
            obtenirEcheanceEffective: (p) => ({ date: p.dateEcheance || null, assignee: true }),
            uiDialogues: { confirmerAction: async () => false }
        }, globaux)
    });
}

/** Laisse finir ce qui suit l'écriture (les captures sont asynchrones) : une macro-tâche réelle, deux fois. */
const laisserFinir = async () => { for (let i = 0; i < 2; i++) await new Promise((r) => setImmediate(r)); };

/**
 * Le geste de l'enseignant·e sur la séance `date` : ouvrir la séance, poser les périodes (2 = présent),
 * toucher les lignes `touches`, puis l'enregistrement automatique (1,5 s) et ce qui le suit.
 */
async function saisir(b, date, { valeurs = {}, touches = DAS } = {}) {
    b.elements['date-cours'].value = date;
    for (const da of DAS) {
        b.elements['periodes_' + da].dataset.dateStr = date;
        b.elements['periodes_' + da].value = String(da in valeurs ? valeurs[da] : 2);
        b.elements['notes_' + da].dataset.dateStr = date;
    }
    for (const da of touches) b.win.notePresenceModifiee({ dataset: { da, dateStr: date } });
    b.avancer(2000);   // 1,5 s d'enregistrement automatique ; l'ancien rafraîchissement du Suivi attendait 0,3 s de plus
    await laisserFinir();
}

const captures = (b) => ((b.store[b.win.cleSnapshots()] || {}).hebdomadaires || []);
const capture = (b, date) => captures(b).find((s) => s.dateSeance === date);
const aDe = (s, da) => s.etudiants.find((e) => e.da === da).A;

/** Pose une marque dans l'horodatage de chaque capture : une capture refaite la perd, une capture laissée la garde. */
function marquerCaptures(b) {
    const k = b.win.cleSnapshots();
    const s = clone(b.store[k]);
    s.hebdomadaires.forEach((c) => { c.timestamp = 'MARQUE-' + c.dateSeance; });
    b.store[k] = s;
}

/** Le scénario du lot : S0, puis S1, puis DEUX saisies dans la même semaine (S3, S4). S2 n'est jamais saisie. */
async function scenarioDeBase(b) {
    await saisir(b, S0);
    await saisir(b, S1);
    await saisir(b, S3);
    await saisir(b, S4, { valeurs: { [BRUNO]: 1 }, touches: [BRUNO] });
}

describe('le graphique suit les présences — chaque enregistrement capture sa séance', () => {
    it('1. une première saisie capture sa séance (avant : aucune capture)', async () => {
        const b = monterSaisie(storeTrimestre());
        await saisir(b, S0);
        expect(captures(b).map((s) => s.dateSeance)).toEqual([S0]);
        expect(capture(b, S0).numSemaine).toBe(1);
        expect(aDe(capture(b, S0), BRUNO)).toBe(100);
    });

    it('2. deux saisies dans la même semaine : deux captures, chacune la sienne', async () => {
        const b = monterSaisie(storeTrimestre());
        await scenarioDeBase(b);
        expect(captures(b).map((s) => s.dateSeance), 'S2, jamais saisie, n\'a pas de capture').toEqual([S0, S1, S3, S4]);
        expect(captures(b).map((s) => s.numSemaine)).toEqual([1, 2, 3, 3]);
        // Bruno n'a qu'une période sur deux le jeudi S4 : 7 périodes sur 8 au cumul.
        expect(aDe(capture(b, S3), BRUNO)).toBe(100);
        expect(aDe(capture(b, S4), BRUNO)).toBe(88);
    });

    it('3. une correction à une date antérieure recapture sa séance et les suivantes ; les autres ne bougent pas', async () => {
        const b = monterSaisie(storeTrimestre());
        await scenarioDeBase(b);
        const avant = clone(captures(b));
        marquerCaptures(b);

        // La correction : Bruno était absent le mardi S1.
        await saisir(b, S1, { valeurs: { [BRUNO]: 0 }, touches: [BRUNO] });

        const apres = captures(b);
        expect(apres.map((s) => s.dateSeance), 'aucune capture créée pour S2, jamais saisie').toEqual([S0, S1, S3, S4]);
        // S0, avant la correction : intacte, horodatage compris (elle n'a pas été refaite).
        expect(capture(b, S0)).toEqual({ ...avant.find((s) => s.dateSeance === S0), timestamp: 'MARQUE-' + S0 });
        // S1, S3, S4 : refaites, et l'absence de Bruno s'y lit (A cumulatif).
        for (const d of [S1, S3, S4]) expect(capture(b, d).timestamp, `${d} refaite`).not.toBe('MARQUE-' + d);
        expect([S1, S3, S4].map((d) => aDe(capture(b, d), BRUNO))).toEqual([50, 67, 63]);
        expect([S1, S3, S4].map((d) => aDe(avant.find((s) => s.dateSeance === d), BRUNO))).toEqual([100, 100, 88]);
        expect(capture(b, S1).groupe.moyenneA).toBeLessThan(avant.find((s) => s.dateSeance === S1).groupe.moyenneA);
    });

    it('4. une séance saisie en retard prend sa place dans l\'ordre des séances, et refait les captures qui la suivent', async () => {
        const b = monterSaisie(storeTrimestre());
        await scenarioDeBase(b);
        marquerCaptures(b);
        await saisir(b, S2, { valeurs: { [BRUNO]: 0 } });
        expect(captures(b).map((s) => s.dateSeance)).toEqual([S0, S1, S2, S3, S4]);
        expect(captures(b).map((s) => s.numSemaine)).toEqual([1, 2, 2, 3, 3]);
        expect(capture(b, S0).timestamp).toBe('MARQUE-' + S0);
        expect(capture(b, S1).timestamp).toBe('MARQUE-' + S1);
        expect(capture(b, S3).timestamp).not.toBe('MARQUE-' + S3);
        expect(capture(b, S4).timestamp).not.toBe('MARQUE-' + S4);
    });

    it('5. jamais de capture pour une date future', async () => {
        const b = monterSaisie(storeTrimestre());
        await saisir(b, S0);
        const enCours = b.win.recapturerDepuisSeance('2026-09-10');
        b.avancer(1);   // le départ attend le tour suivant (minuterie virtuelle du banc)
        const recapturees = await enCours;
        expect(recapturees).toEqual([]);
        expect(captures(b).map((s) => s.dateSeance)).toEqual([S0]);
    });

    it('6. un changement de groupe-cours avant la chaîne l\'arrête : rien n\'est écrit chez l\'un ni chez l\'autre', async () => {
        const b = monterSaisie(storeTrimestre());
        await saisir(b, S0);
        const cleGC1 = b.win.cleSnapshots();
        const enCours = b.win.recapturerDepuisSeance(S1);   // la chaîne attend son tour dans la file
        b.store.infoCours = { id: 'GC2', nom: 'Cours banc 2', groupe: '02', _groupeCoursId: 'GC2' };
        b.avancer(1);   // le départ attend le tour suivant (minuterie virtuelle du banc)
        expect(await enCours).toEqual([]);
        expect(b.win.cleSnapshots()).not.toBe(cleGC1);
        expect(b.store[cleGC1].hebdomadaires.map((s) => s.dateSeance)).toEqual([S0]);
        expect(b.store[b.win.cleSnapshots()], 'aucune capture écrite pour l\'autre groupe-cours').toBeUndefined();
    });

    it('7. le Suivi du groupe affiché se redessine une fois la capture écrite : il montre la séance', async () => {
        const vus = [];
        let b = null;
        b = monterSaisie(storeTrimestre(), { chargerTableauBordApercu: () => vus.push(captures(b).map((s) => s.dateSeance)) });
        b.document.getElementById('suivi-groupe').classList.add('active');
        await saisir(b, S0);
        expect(vus.length, 'le Suivi affiché est redessiné').toBeGreaterThan(0);
        expect(vus[vus.length - 1], 'au dernier dessin, la séance saisie est capturée').toEqual([S0]);
    });

});

/*
 * JOURNAL DES BREAK-TESTS (8 nov. 2026) — sur `cafc89ff2` (avant la correction) : 7 rouges sur 7. Puis chaque
 * altération de la correction, retirée ensuite (7 verts) :
 *   A. seulement D, pas les séances suivantes (`suivantes` vide)            → 3, 4
 *   B. les captures d'avant D refaites aussi (`!== dateSeance`)             → 3, 4, 5
 *   C. une capture neuve ajoutée en fin de liste (sans `splice`)            → 4
 *   D. le Suivi redessiné sans attendre les captures                        → 7
 *   E. aucun appel depuis `ecrirePresencesSeance`                           → 1 à 7
 *   F. sans la garde du groupe-cours (`memeGroupe` ne compare plus la clé)  → 6
 */
