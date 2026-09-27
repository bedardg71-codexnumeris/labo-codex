import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, elementDom, clone, RACINE } from './_helpers/bac-suivi.js';

// SENTINELLE #749 lot 3 — SAISIE DES PRÉSENCES : UNE DATE VERROUILLÉE NE L'EST QUE
// POUR CE GROUPE-COURS ET CE TRIMESTRE ; LES PRÉFÉRENCES NE FUIENT PLUS ; LE
// BANDEAU « CONFIGURATION INCOMPLÈTE » DIT VRAI.
//
// L'INCIDENT (audit du 6 sept. 2026, § 3, S-3/S-4/S-6, mesuré) :
//   - `datesVerrouillees` était une clé NUE : le 8 septembre verrouillé dans le
//     groupe A l'était dans le groupe B, et le restait l'an prochain ;
//   - `presences_date`, `presences_groupe`, `presences_tri`, `recherchePresences`
//     étaient nues : la date d'un trimestre s'ouvrait dans l'autre ;
//   - le bandeau `#alerteFormatHoraire` n'était évalué qu'au démarrage, sur le seul
//     horaire : un collègue qui activait la démonstration lisait « Configuration
//     incomplète » devant un horaire à deux séances et trente séances complètes,
//     avec une date vide que « ← Précédent » laissait vide ;
//   - sans cours actif, `enregistrerPresences` remplaçait la fiche d'un AUTRE cours.
//
// CE QUI EST VERROUILLÉ ICI (lot 3 du cadrage 11, 11 sept. 2026) :
//   a. verrouiller le 1er septembre sous GC1 ne le verrouille pas sous GC2, et le
//      retour sous GC1 le trouve verrouillé ; rien n'est écrit sous la clé nue ;
//   b. le semis lit la clé nue d'avant (liste ENTIÈRE) et NE L'ÉCRIT PAS — valeur
//      identique avant/après ; il lit de même `<trim>_datesVerrouillees` ;
//   c. déverrouiller rend la liste vide, et une liste vide n'est PAS re-semée ;
//   d. sans groupe-cours actif, la clé est celle du trimestre, sans suffixe ;
//   e. les quatre préférences s'écrivent et se lisent sous `cle()` ; une nue n'est
//      plus lue ; le champ est remis depuis la base, pas laissé à son résidu ;
//   f. le bandeau : horaire à deux séances + séances complètes → aucun ; rien →
//      bandeau ; horaire vide mais séances complètes (le pack démo au boot) →
//      aucun ; et il est RÉÉVALUÉ à chaque initialisation, sans remonter ;
//   g. sans date mémorisée, l'écran ouvre sur la dernière séance ≤ aujourd'hui ;
//      « ← Précédent » sans date y va aussi ;
//   h. sans cours actif, aucune écriture — la fiche de l'autre cours survit.
//
// BREAK-TESTS VÉRIFIÉS le 11 septembre 2026 — journal en fin de fichier.

const DATE = '2026-09-01';
const DATE2 = '2026-09-03';
const AUJOURDHUI = '2026-09-06';
const K1 = 'test_datesVerrouillees_gc_GC1';
const K2 = 'test_datesVerrouillees_gc_GC2';
const INTERNES = ['validerDateSaisie', 'verifierConfigurationFormatHoraire', 'cleDatesVerrouillees', 'obtenirDatesVerrouillees',
    'derniereSeancePassee'];

function storeSaisie() {
    const store = storeBase();
    store.test_presences = [
        { date: DATE, da: '2000001', periodesPresentes: 2, notes: '', coursId: 'GC1' },
        { date: DATE, da: '2000002', periodesPresentes: 1, notes: '', coursId: 'GC1' },
        { date: DATE, da: '2000003', periodesPresentes: 2, notes: '', coursId: 'GC1' }
    ];
    store.test_calendrierComplet = { [DATE]: { statut: 'cours', numeroSemaine: 2, jourSemaine: 'Mardi' }, [DATE2]: { statut: 'cours', numeroSemaine: 2, jourSemaine: 'Jeudi' } };
    store.test_seancesCompletes = { [DATE]: [{ id: 'S1', date: DATE, nombrePeriodes: 2, numeroSemaine: 2, jour: 'Mardi' }], [DATE2]: [{ id: 'S2', date: DATE2, nombrePeriodes: 2, numeroSemaine: 2, jour: 'Jeudi' }] };
    store.test_horaire = [{ jour: 'Mardi', nombrePeriodes: 2, heureDebut: '08:00', heureFin: '09:40' }, { jour: 'Jeudi', nombrePeriodes: 2, heureDebut: '08:00', heureFin: '09:40' }];
    return store;
}

function activerGroupe(store, id) {
    store.infoCours = { id, nom: 'Cours ' + id, groupe: id === 'GC1' ? '01' : '02', _groupeCoursId: id };
    store.groupeCoursActif = { id, trimestreId: 'test', coursId: id, groupeNum: id === 'GC1' ? '01' : '02' };
}

/** Monte saisie-presences.js RÉEL sur `store` (remonter = recharger la page). */
function monterS(store, opts = {}) {
    const globaux = Object.assign({
        obtenirInfosJour: (d) => (store.test_calendrierComplet[d] || null), obtenirSeancesJour: (d) => (store.test_seancesCompletes[d] || []),
        calculerAssiduitePourAffichage: () => ({ taux: 100, periodesPresentes: 2, periodesTotal: 2 }), calculerEtSauvegarderIndicesAssiduite() {},
        obtenirRangSeanceDansSemaine: () => 1, pluriel: (n, s) => s, genererCalendrierComplet() {}, cleSeancesCompletes: () => 'test_seancesCompletes', DUREE_PERIODE_DEFAUT: 50,
        obtenirCoursActifId: () => (opts.coursIdNul ? null : (store.infoCours && store.infoCours.id))
    }, opts.globaux || {});
    const elements = Object.assign({ 'date-cours': elementDom({ value: opts.date === undefined ? DATE : opts.date }), selectGroupePresences: elementDom({ value: '' }), selectTriPresences: elementDom({ value: opts.tri || 'nom' }),
        'periodes_2000001': elementDom({ value: '2' }), 'periodes_2000002': elementDom({ value: '1' }), 'periodes_2000003': elementDom({ value: '2' }),
        'notes_2000001': elementDom({ value: '' }), 'notes_2000002': elementDom({ value: '' }), 'notes_2000003': elementDom({ value: '' }) }, opts.elements || {});
    const selecteurs = { '.input-periodes': ['2000001', '2000002', '2000003'].map(da => Object.assign(elements['periodes_' + da], { id: 'periodes_' + da, dataset: { da } })) };
    return monter(store, Object.assign({ aujourdhui: AUJOURDHUI }, opts, { modules: [{ chemin: 'js/saisie-presences.js', internes: INTERNES }], globaux, elements, selecteurs }));
}

const bandeauVisible = (b) => !b.elements['alerteFormatHoraire'].classList.contains('u-hide');
const ecrituresSur = (b, k) => b.journal.filter(j => j.k === k);

describe('#749 lot 3 · a. le verrou vit par groupe-cours', () => {
    it('verrouiller le 1er septembre sous GC1 ne le verrouille pas sous GC2 ; le retour sous GC1 le trouve verrouillé ; la clé nue reste absente', () => {
        const store = storeSaisie();
        const b1 = monterS(store);
        b1.win.basculerVerrouillageDate(DATE);
        expect(store[K1]).toEqual([DATE]);
        expect(b1.interne['saisie-presences.js'].validerDateSaisie(DATE).verrouille).toBe(true);
        expect(Object.keys(store)).not.toContain('datesVerrouillees');
        expect(ecrituresSur(b1, 'datesVerrouillees')).toHaveLength(0);

        activerGroupe(store, 'GC2');
        const b2 = monterS(store);
        expect(b2.interne['saisie-presences.js'].validerDateSaisie(DATE).verrouille).toBe(false);
        expect(Object.keys(store)).not.toContain(K2);          // rien à semer : rien d'écrit

        activerGroupe(store, 'GC1');
        const b3 = monterS(store);
        expect(b3.interne['saisie-presences.js'].validerDateSaisie(DATE).verrouille).toBe(true);
        expect(store.test_presences).toHaveLength(3);         // la sauvegarde qui accompagne le verrou réécrit les trois fiches
    });

    it('d. sans groupe-cours actif : la clé du trimestre, sans suffixe', () => {
        const store = storeSaisie();
        store.groupeCoursActif = null;
        const b = monterS(store);
        expect(b.interne['saisie-presences.js'].cleDatesVerrouillees()).toBe('test_datesVerrouillees');
    });
});

describe('#749 lot 3 · b/c. le semis lit la clé nue sans l’écrire ; déverrouiller vide, sans re-semis', () => {
    it('b. la liste nue ENTIÈRE devient celle de chaque groupe à sa première lecture ; la nue est identique avant/après, jamais écrite', () => {
        const store = storeSaisie();
        store.datesVerrouillees = [DATE, '2026-08-25'];
        const nueAvant = JSON.stringify(store.datesVerrouillees);
        const b1 = monterS(store);
        expect(b1.interne['saisie-presences.js'].validerDateSaisie(DATE).verrouille).toBe(true);
        expect(store[K1]).toEqual([DATE, '2026-08-25']);
        expect(JSON.stringify(store.datesVerrouillees)).toBe(nueAvant);
        expect(ecrituresSur(b1, 'datesVerrouillees')).toHaveLength(0);
        expect(ecrituresSur(b1, K1)).toHaveLength(1);         // une lecture qui écrit UNE fois

        activerGroupe(store, 'GC2');
        const b2 = monterS(store);
        expect(b2.interne['saisie-presences.js'].validerDateSaisie(DATE).verrouille).toBe(true);   // hier, elle l'était partout
        expect(store[K2]).toEqual([DATE, '2026-08-25']);
        expect(JSON.stringify(store.datesVerrouillees)).toBe(nueAvant);
    });

    it('b bis. la seconde source, `<trim>_datesVerrouillees` (résidu rapatrié par trimestres.js), est lue de même, sans être écrite', () => {
        const store = storeSaisie();
        store.test_datesVerrouillees = [DATE];
        const b = monterS(store);
        expect(b.interne['saisie-presences.js'].validerDateSaisie(DATE).verrouille).toBe(true);
        expect(store[K1]).toEqual([DATE]);
        expect(store.test_datesVerrouillees).toEqual([DATE]);
        expect(ecrituresSur(b, 'test_datesVerrouillees')).toHaveLength(0);
    });

    it('c. déverrouiller rend la liste vide ; une liste vide N’EST PAS re-semée depuis la nue au rechargement', () => {
        const store = storeSaisie();
        store.datesVerrouillees = [DATE];
        const b1 = monterS(store);
        b1.win.basculerVerrouillageDate(DATE);                  // déverrouille (semée verrouillée)
        expect(store[K1]).toEqual([]);
        const b2 = monterS(store);                               // recharger
        expect(b2.interne['saisie-presences.js'].validerDateSaisie(DATE).verrouille).toBe(false);
        expect(store[K1]).toEqual([]);
        expect(store.datesVerrouillees).toEqual([DATE]);         // la nue, intacte
        b2.win.basculerVerrouillageDate(DATE);                   // re-verrouiller puis re-déverrouiller : même état
        b2.win.basculerVerrouillageDate(DATE);
        expect(store[K1]).toEqual([]);
    });
});

describe('#749 lot 3 · relecture croisée du 11 sept. — les reprises', () => {
    it('le semis n’entre PAS dans la démonstration : nue présente, trimestre « demo » → rien de semé, rien de verrouillé', () => {
        const store = storeSaisie();
        store.datesVerrouillees = [DATE];
        store.trimestreActif = 'demo';
        const b = monterS(store);
        expect(b.interne['saisie-presences.js'].validerDateSaisie(DATE).verrouille).toBe(false);
        expect(Object.keys(store)).not.toContain(K1);
        expect(store.datesVerrouillees).toEqual([DATE]);
    });

    it('la recherche est REMISE depuis la base : sans terme pour ce trimestre, le résidu du champ est effacé', () => {
        const store = storeSaisie();
        const b = monterS(store);
        b.document.getElementById('recherche-saisie-presences').value = 'ali';    // résidu d'un autre trimestre
        b.win.initialiserSaisiePresences();
        expect(b.elements['recherche-saisie-presences'].value).toBe('');
        store.test_recherchePresences = 'bru';
        b.win.initialiserSaisiePresences();
        expect(b.elements['recherche-saisie-presences'].value).toBe('bru');
    });

    it('sur un poste sans trimestre, le démarrage ne génère rien (aucune clé nue seancesCompletes) ; le bandeau se lit sur le cache', () => {
        const store = storeSaisie();
        store.test_horaire = []; store.test_seancesCompletes = {};   // un poste vide : ni horaire, ni cache
        let generations = 0;
        const b = monterS(store, { date: '', globaux: { genererSeancesCompletes: () => { generations++; } } });
        b.win.initialiserModuleSaisiePresences();
        expect(generations).toBe(0);
        expect(bandeauVisible(b)).toBe(true);
        expect(b.elements['date-cours'].value).toBe('');
        store.trimestreActif = 'test';                               // un trimestre existe : on génère
        b.win.initialiserModuleSaisiePresences();
        expect(generations).toBeGreaterThan(0);
    });

    it('les cinq familles sont inscrites à CLES_NAMESPACEES (sinon `cle()` les rend nues, avec un warn)', () => {
        const src = readFileSync(path.join(RACINE, 'js/trimestres.js'), 'utf8');
        const registre = src.slice(src.indexOf('const CLES_NAMESPACEES = ['), src.indexOf('];', src.indexOf('const CLES_NAMESPACEES = [')));
        for (const nom of ['datesVerrouillees', 'presences_date', 'presences_groupe', 'presences_tri', 'recherchePresences']) {
            expect(registre, nom).toContain("'" + nom + "'");
        }
    });
});

describe('#749 lot 3 · e. les préférences de l’écran vivent par trimestre', () => {
    it('initialiser la saisie écrit date, sous-groupe et tri sous `cle()` ; la recherche aussi ; aucune clé nue n’est écrite', () => {
        const store = storeSaisie();
        const b = monterS(store);
        b.win.initialiserSaisiePresences();
        b.elements['recherche-saisie-presences'].value = 'ali';
        b.win.filtrerTableauPresences();
        const nues = b.journal.map(j => j.k).filter(k => /^(presences_|recherchePresences)/.test(k));
        expect(nues).toEqual([]);
        expect(store.test_presences_date).toBe(DATE);
        expect(store.test_presences_groupe).toBe('');
        expect(store.test_presences_tri).toBe('nom');
        expect(store.test_recherchePresences).toBe('ali');
    });

    it('au démarrage, la date et le tri viennent de la clé du trimestre ; une nue d’avant n’est plus lue ; le résidu du DOM est remis', () => {
        const store = storeSaisie();
        store.presences_date = DATE;          // la nue d'avant : ignorée
        store.presences_tri = 'da';
        store.test_presences_tri = 'prenom';  // celle du trimestre : lue
        const b = monterS(store, { date: '2026-08-25', tri: 'da' });   // résidu du DOM (un autre trimestre)
        b.win.initialiserModuleSaisiePresences();
        expect(b.elements['date-cours'].value).toBe(DATE2);   // pas de date pour ce trimestre → dernière séance ≤ aujourd'hui, pas la nue, pas le résidu
        expect(b.elements.selectTriPresences.value).toBe('prenom');
        // La date d'un trimestre est restaurée telle quelle (≤ aujourd'hui)
        store.test_presences_date = DATE;
        const b2 = monterS(store, { date: '' });
        b2.win.initialiserModuleSaisiePresences();
        expect(b2.elements['date-cours'].value).toBe(DATE);
    });
});

describe('#749 lot 3 · f/g. le bandeau dit vrai, à chaque initialisation ; la date se pose seule', () => {
    it('f. horaire à deux séances + séances complètes → aucun bandeau ; rien → bandeau ; horaire vide mais séances complètes → aucun', () => {
        const store = storeSaisie();
        const b = monterS(store);
        const v = b.interne['saisie-presences.js'].verifierConfigurationFormatHoraire;
        v();
        expect(bandeauVisible(b)).toBe(false);
        store.test_horaire = []; store.test_seancesCompletes = {};
        v();
        expect(bandeauVisible(b)).toBe(true);
        store.test_seancesCompletes = { [DATE]: [{ id: 'S1', date: DATE, nombrePeriodes: 2 }] };   // le cas du pack démo au boot (audit S-6)
        v();
        expect(bandeauVisible(b)).toBe(false);
    });

    it('f bis. le bandeau est RÉÉVALUÉ par initialiserSaisiePresences, sans remonter la page', () => {
        const store = storeSaisie();
        store.test_horaire = []; store.test_seancesCompletes = {};
        const b = monterS(store);
        b.win.initialiserModuleSaisiePresences();
        expect(bandeauVisible(b)).toBe(true);
        store.test_horaire = storeSaisie().test_horaire; store.test_seancesCompletes = storeSaisie().test_seancesCompletes;
        b.elements['date-cours'].value = DATE;
        b.win.initialiserSaisiePresences();                       // le geste d'un changement de date / de groupe / de démo
        expect(bandeauVisible(b)).toBe(false);
    });

    it('g. sans date mémorisée, l’écran ouvre sur la dernière séance ≤ aujourd’hui ; « ← Précédent » sans date y va aussi', () => {
        const store = storeSaisie();
        store.test_seancesCompletes['2026-09-08'] = [{ id: 'S3', date: '2026-09-08', nombrePeriodes: 2 }];   // future : jamais choisie
        const b = monterS(store, { date: '' });
        expect(b.interne['saisie-presences.js'].derniereSeancePassee()).toBe(DATE2);
        b.win.initialiserModuleSaisiePresences();
        expect(b.elements['date-cours'].value).toBe(DATE2);
        expect(store.test_presences_date).toBe(DATE2);

        const b2 = monterS(store, { date: '' });
        b2.win.allerCoursPrecedent();
        expect(b2.elements['date-cours'].value).toBe(DATE2);
    });
});

describe('#749 lot 3 · h. sans cours actif, rien n’est écrit', () => {
    // Lot D (27 sept. 2026) : les deux écrivains d'avant (`enregistrerPresences`, le verrou) sont
    // devenus un seul, `ecrirePresencesSeance`. La garde vit en lui ; les deux portes la traversent.
    it('« Confirmer la séance » avec coursId nul : la fiche GC2 d’Alice survit, aucune écriture, aucun mot neuf', () => {
        const store = storeSaisie();
        store.test_presences = [{ date: DATE, da: '2000001', periodesPresentes: 2, notes: 'GC2', coursId: 'GC2' }];
        const b = monterS(store, { coursIdNul: true });
        b.win.confirmerSeancePresences();
        expect(store.test_presences).toEqual([{ date: DATE, da: '2000001', periodesPresentes: 2, notes: 'GC2', coursId: 'GC2' }]);
        expect(ecrituresSur(b, 'test_presences')).toHaveLength(0);
        expect(b.notifs).toHaveLength(0);
        expect(b.avertissements).toHaveLength(0);
    });

    it('le verrou avec coursId nul : même garde', () => {
        const store = storeSaisie();
        store.test_presences = [{ date: DATE, da: '2000001', periodesPresentes: 2, notes: 'GC2', coursId: 'GC2' }];
        const b = monterS(store, { coursIdNul: true });
        b.win.basculerVerrouillageDate(DATE);
        expect(store.test_presences[0].coursId).toBe('GC2');
        expect(ecrituresSur(b, 'test_presences')).toHaveLength(0);
    });
});

/*
 * JOURNAL DES BREAK-TESTS — 11 septembre 2026, sur l'arbre du lot (module restauré à
 * l'empreinte près après chaque mutation ; 12 essais verts avant et après).
 *   a.     `cleDatesVerrouillees` sans suffixe `_gc_`            → 4 rouges (a, b, b bis, c)
 *   b.     le semis écrit AUSSI la clé nue                        → 1 rouge  (b)
 *   c.     une liste vide est re-semée (`liste.length > 0`)       → 1 rouge  (c)
 *   e.     `presences_date` réécrite nue                          → 2 rouges (e, g)
 *   e bis. `presences_tri` relue depuis la nue                    → 1 rouge  (e, démarrage)
 *   f.     bandeau sur le seul horaire                            → 1 rouge  (f)
 *   f bis. bandeau plus réévalué par initialiserSaisiePresences   → 1 rouge  (f bis)
 *   g.     `derniereSeancePassee` rend null                       → 2 rouges (e démarrage, g)
 *   h.     garde `!coursId` retirée d'enregistrerPresences (lot D : d'ecrirePresencesSeance)       → 1 rouge  (h)
 *   d.     résidu du DOM gardé quand la préférence manque         → 1 rouge  (e, démarrage)
 * Reprises de la relecture croisée (même jour, 16 essais verts avant et après) :
 *   r1. semis autorisé en démo (`trimestreActif === 'demo'` retiré)  → 1 rouge
 *   r2. recherche non remise (ancienne forme)                        → 1 rouge
 *   r3. génération au boot sans trimestre                            → 1 rouge
 *   r4. `'recherchePresences'` retiré de CLES_NAMESPACEES            → 1 rouge
 */
