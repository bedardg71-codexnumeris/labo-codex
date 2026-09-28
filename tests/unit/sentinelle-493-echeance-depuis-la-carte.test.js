import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #493 (25 août 2026) — LA CARTE D'ALIGNEMENT PROPOSE LA DATE
// D'ÉCHÉANCE, ET CHAQUE GROUPE REÇOIT LA SIENNE.
//
// Le fil : une leçon de la carte porte une semaine et un rang de séance
// (« S4 », « B »). Une production rattachée à son bloc Évaluation est donc
// SITUÉE dans le trimestre — mais l'écran des échéances demandait quand même
// la date à la main, pour chaque groupe. Or deux groupes du même cours ne se
// rencontrent pas le même jour : même case de la carte, lundi pour l'un,
// mardi pour l'autre. C'est ce que Grégoire saisissait à la main cet hiver.
//
// ⚠ CE QUE LE PREMIER JET A RATÉ, ET QUE LE NAVIGATEUR A DIT. La liste était
// tirée de `obtenirSeancesCompletes(coursId)` puis filtrée sur
// `seance.groupe === groupeNum`. Elle rendait TOUJOURS []. Deux raisons, et la
// première suffit : `obtenirSeancesCompletes` rend déjà la table du groupe-cours
// actif, donc ce filtre en était un second sur une table déjà filtrée ; et
// `seance.groupe` est un champ de saisie d'horaire, vide dans le cas courant.
// La source juste est `obtenirSeancesCompletesDuGroupe(groupeCoursId)`, celle
// que l'export du plan de cours utilisait déjà. D'où T1.d.
//
// ▣ CE QUI REND CETTE MÉCANIQUE SÛRE : une seule liste, lue dans les deux sens.
// `datesSeancesDeLaSemaine` donne les dates de rencontre d'un groupe pour une
// semaine. Le libellé sous le champ fait `indexOf(date) + 1` pour dire « 2e
// séance » ; la dérivation fait `[rang - 1]` pour rendre la date. Deux
// fonctions séparées auraient pu diverger d'une séance et faire dire à l'écran
// le contraire de la carte — sur la date que lisent ses étudiant·es.
//
// Ce que cette sentinelle tient :
//   T1 — LE VERROU : rang → date → rang est l'identité. Les deux sens ne
//        peuvent pas se contredire, quelle que soit la semaine ou le groupe.
//   T2 — un rang qui n'existe pas ne rend PAS une date approchante.
//   T3 — la position dans la carte : trouvée quand elle existe, null dans tous
//        les cas incomplets, et jamais lue depuis la carte d'un autre cours.
//   T4 — LE CAS DE GRÉGOIRE : deux groupes, une case de carte, deux dates.
//   T5 — une date déjà saisie n'est JAMAIS écrasée ; l'écart est dit.

/* ------------------------------------------------------------------ harnais */

// Semaine 4, telle que l'horaire réel la produit : un horaire PAR GROUPE-COURS,
// et un champ `groupe` laissé vide — c'est le cas courant, et c'est lui qui
// faisait échouer le filtre du premier jet.
const HORAIRES = {
    GC_A: {
        '2026-02-12': [{ groupe: '', numeroSemaine: 4 }],
        '2026-02-16': [{ groupe: '', numeroSemaine: 4 }]
    },
    GC_B: {
        '2026-02-13': [{ groupe: '', numeroSemaine: 4 }],
        '2026-02-17': [{ groupe: '', numeroSemaine: 4 }]
    }
};

const CTX_A = { coursId: 'COURS_A', groupeCoursId: 'GC_A' };
const CTX_B = { coursId: 'COURS_A', groupeCoursId: 'GC_B' };

const noeud = (id, type, extra = {}) =>
    Object.assign({ id, type, titre: id, parent: null, enfants: [], metadata: {} }, extra);

// Une carte : la leçon « La carte mentale » en S4/B, son bloc Évaluation
// rattaché à l'artefact 1.
function carteAvec(metadataLecon, metadataEval) {
    return {
        noeuds: [
            noeud('lecon-1', 'lecon', { metadata: metadataLecon, enfants: ['eval-1'] }),
            noeud('eval-1', 'evaluation', { parent: 'lecon-1', metadata: metadataEval })
        ],
        liens: []
    };
}

function charger({ cartes = [], contenus = {}, horaires = HORAIRES, horaireDuCours = null } = {}) {
    const store = {};
    const globaux = {
        db: {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async (k, d) => (k in store ? store[k] : d),
            set: async (k, v) => { store[k] = v; }
        },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t == null ? '' : t),
        obtenirSeancesCompletesDuGroupe: (gcId) => horaires[gcId] || {},
        obtenirSeancesCompletes: () => horaireDuCours || {},
        obtenirCoursActifId: () => 'COURS_A',
        GabaritsUtils: { lirePratiquesSelectionnees: () => [] },
        alert: () => {},
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: miniDom()
    };

    const win = chargerScript('js/productions.js', globaux);
    win.cle = globaux.cle;
    chargerScript('js/planification-carte.js', globaux, win);
    win.planificationDonnees = {
        getIndex: () => ({ active: cartes[0] ? cartes[0].id : null, cartes }),
        chargerCarte: (id) => contenus[id] || null,
        sauvegarderCarte: () => {}
    };
    return win;
}

/* --------------------------------------------------------------- mini-DOM */
// Juste assez pour que `afficherEcartAvecLaCarte` s'exécute pour de vrai :
// createElement, textContent, appendChild, remove, querySelector par classe.

function element(tag = 'div') {
    const el = {
        tagName: tag, className: '', textContent: '', type: '', value: '',
        style: { cssText: '' }, enfants: [], parentElement: null,
        appendChild(n) { n.parentElement = el; el.enfants.push(n); return n; },
        remove() {
            if (!el.parentElement) return;
            const i = el.parentElement.enfants.indexOf(el);
            if (i >= 0) el.parentElement.enfants.splice(i, 1);
        },
        querySelector(sel) {
            const cls = sel.replace('.', '');
            return el.enfants.find(n => n.className === cls) || null;
        },
        addEventListener(evt, fn) { (el._ecouteurs[evt] ||= []).push(fn); },
        declencher(evt) { (el._ecouteurs[evt] || []).forEach(fn => fn()); },
        // Lot E3 : « Utiliser cette date » émet un « change » (la production existante
        // s'enregistre par lui) ; le mini-DOM le relaie et le garde pour l'essai T5.c.
        emis: [],
        dispatchEvent(ev) { el.emis.push(ev); (el._ecouteurs[ev.type] || []).forEach(fn => fn(ev)); return true; },
        _ecouteurs: {}
    };
    return el;
}

function miniDom() {
    return {
        createElement: (tag) => element(tag),
        getElementById: () => null, querySelector: () => null,
        querySelectorAll: () => [], addEventListener() {}
    };
}

// Un champ date dans son conteneur, comme l'écran des échéances en pose un.
function champDate(valeur = '') {
    const parent = element('div');
    const input = element('input');
    input.value = valeur;
    parent.appendChild(input);
    return { input, parent, span: element('span') };
}

/* ------------------------------------------------- T1 — LE VERROU (aller-retour) */

describe('#493 · T1 — rang et date sont deux lectures d\'une seule liste', () => {
    it('T1.a Pour chaque groupe, rang → date → rang rend le rang de départ', () => {
        const win = charger();
        for (const ctx of [CTX_A, CTX_B]) {
            const dates = win.datesSeancesDeLaSemaine(ctx, 4, false);
            expect(dates.length, `${ctx.groupeCoursId} doit avoir des séances`).toBeGreaterThan(0);
            dates.forEach((_, i) => {
                const rang = i + 1;
                const date = win.dateSeanceDuRang(ctx, 4, rang);
                expect(date).toBe(dates[i]);
                expect(dates.indexOf(date) + 1).toBe(rang);
            });
        }
    });

    it('T1.b L\'horaire d\'un groupe ne contient que SES séances', () => {
        const win = charger();
        expect(win.datesSeancesDeLaSemaine(CTX_A, 4, false)).toEqual(['2026-02-12', '2026-02-16']);
        expect(win.datesSeancesDeLaSemaine(CTX_B, 4, false)).toEqual(['2026-02-13', '2026-02-17']);
    });

    it('T1.c Sans horaire pour ce groupe, la dérivation ne se rabat sur personne', () => {
        // Le repli sur l'horaire du cours est bon pour un libellé, pas pour une
        // échéance : ce serait la date d'un AUTRE groupe.
        const win = charger({ horaireDuCours: HORAIRES.GC_A });
        const inconnu = { coursId: 'COURS_A', groupeCoursId: 'GC_INCONNU' };
        expect(win.datesSeancesDeLaSemaine(inconnu, 4, false)).toEqual([]);
        expect(win.dateSeanceDuRang(inconnu, 4, 1)).toBeNull();
        // Le libellé, lui, a le droit de replier.
        expect(win.datesSeancesDeLaSemaine(inconnu, 4, true).length).toBeGreaterThan(0);
    });

    it('T1.d LA GARDE QUI MANQUAIT : des séances au champ `groupe` vide sont trouvées', () => {
        // C'est le défaut du 25 août. L'ancien chemin filtrait sur
        // `seance.groupe === groupeNum` ; comme ce champ est vide dans l'horaire
        // réel, la liste sortait toujours vide et rien n'était jamais proposé.
        const win = charger();
        const seances = HORAIRES.GC_A['2026-02-16'];
        expect(seances[0].groupe, 'la fixture DOIT porter un groupe vide').toBe('');
        expect(win.datesSeancesDeLaSemaine(CTX_A, 4, false)).toContain('2026-02-16');
    });

    it('T1.e La semaine est lue sur la séance, pas sur un calendrier partagé', () => {
        const win = charger({
            horaires: { GC_A: { '2026-03-02': [{ groupe: '', numeroSemaine: 7 }] } }
        });
        expect(win.datesSeancesDeLaSemaine(CTX_A, 7, false)).toEqual(['2026-03-02']);
        expect(win.datesSeancesDeLaSemaine(CTX_A, 4, false)).toEqual([]);
    });
});

/* ----------------------------------------------------- T2 — pas d'à-peu-près */

describe('#493 · T2 — un rang qui n\'existe pas ne rend rien', () => {
    it('T2.a Rang 3 sur une semaine à deux rencontres', () => {
        const win = charger();
        expect(win.dateSeanceDuRang(CTX_A, 4, 3)).toBeNull();
    });

    it('T2.b Semaine hors trimestre', () => {
        const win = charger();
        expect(win.dateSeanceDuRang(CTX_A, 12, 1)).toBeNull();
    });

    it('T2.c Rang absurde', () => {
        const win = charger();
        expect(win.dateSeanceDuRang(CTX_A, 4, 0)).toBeNull();
        expect(win.dateSeanceDuRang(CTX_A, 4, -1)).toBeNull();
        expect(win.dateSeanceDuRang(CTX_A, 4, null)).toBeNull();
    });
});

/* ------------------------------------------------ T3 — la position dans la carte */

describe('#493 · T3 — où la carte situe cette production', () => {
    const FICHE = [{ id: 'carte_1', nom: 'Alignement H26', coursId: 'COURS_A' }];

    it('T3.a Une leçon située rend sa semaine et son rang', () => {
        const win = charger({
            cartes: FICHE,
            contenus: { carte_1: carteAvec({ semaine: 4, rangSeance: 2 }, { productionId: 'PROD_A1' }) }
        });
        expect(win.planificationCarte.positionCarteDeLaProduction('PROD_A1', 'COURS_A'))
            .toMatchObject({ semaine: 4, rangSeance: 2, noeudId: 'eval-1' });
    });

    it('T3.b Production non rattachée à un bloc ⇒ null', () => {
        const win = charger({
            cartes: FICHE,
            contenus: { carte_1: carteAvec({ semaine: 4, rangSeance: 2 }, {}) }
        });
        expect(win.planificationCarte.positionCarteDeLaProduction('PROD_A1', 'COURS_A')).toBeNull();
    });

    it('T3.c Leçon sans semaine, ou sans rang ⇒ null (situation incomplète)', () => {
        const sansSemaine = charger({
            cartes: FICHE,
            contenus: { carte_1: carteAvec({ rangSeance: 2 }, { productionId: 'PROD_A1' }) }
        });
        expect(sansSemaine.planificationCarte.positionCarteDeLaProduction('PROD_A1', 'COURS_A')).toBeNull();

        const sansRang = charger({
            cartes: FICHE,
            contenus: { carte_1: carteAvec({ semaine: 4 }, { productionId: 'PROD_A1' }) }
        });
        expect(sansRang.planificationCarte.positionCarteDeLaProduction('PROD_A1', 'COURS_A')).toBeNull();
    });

    it('T3.d LE GARDE-FOU : la carte d\'un AUTRE cours n\'est jamais lue', () => {
        const win = charger({
            cartes: [{ id: 'carte_philo', nom: 'Philosophie', coursId: 'COURS_B' }],
            contenus: { carte_philo: carteAvec({ semaine: 4, rangSeance: 2 }, { productionId: 'PROD_A1' }) }
        });
        expect(win.planificationCarte.positionCarteDeLaProduction('PROD_A1', 'COURS_A')).toBeNull();
    });

    it('T3.e Une carte sans cours sert de repli', () => {
        const win = charger({
            cartes: [{ id: 'carte_libre', nom: 'Ma carte', coursId: null }],
            contenus: { carte_libre: carteAvec({ semaine: 4, rangSeance: 2 }, { productionId: 'PROD_A1' }) }
        });
        expect(win.planificationCarte.positionCarteDeLaProduction('PROD_A1', 'COURS_A'))
            .toMatchObject({ semaine: 4, rangSeance: 2 });
    });

    it('T3.f DEUX POSITIONS CONTRADICTOIRES ⇒ aucune, jamais un tirage au sort', () => {
        const win = charger({
            cartes: [{ id: 'c1', coursId: 'COURS_A' }, { id: 'c2', coursId: 'COURS_A' }],
            contenus: {
                c1: carteAvec({ semaine: 4, rangSeance: 2 }, { productionId: 'PROD_A1' }),
                c2: carteAvec({ semaine: 7, rangSeance: 1 }, { productionId: 'PROD_A1' })
            }
        });
        expect(win.planificationCarte.positionCarteDeLaProduction('PROD_A1', 'COURS_A')).toBeNull();
    });

    it('T3.g Deux positions D\'ACCORD ⇒ la réponse commune', () => {
        const win = charger({
            cartes: [{ id: 'c1', coursId: 'COURS_A' }, { id: 'c2', coursId: 'COURS_A' }],
            contenus: {
                c1: carteAvec({ semaine: 4, rangSeance: 2 }, { productionId: 'PROD_A1' }),
                c2: carteAvec({ semaine: 4, rangSeance: 2 }, { productionId: 'PROD_A1' })
            }
        });
        expect(win.planificationCarte.positionCarteDeLaProduction('PROD_A1', 'COURS_A'))
            .toMatchObject({ semaine: 4, rangSeance: 2 });
    });
});

/* ------------------------------------------------------ T4 — LE CAS DE GRÉGOIRE */

describe('#493 · T4 — une case de carte, deux groupes, deux dates', () => {
    function winDeuxGroupes() {
        return charger({
            cartes: [{ id: 'carte_1', coursId: 'COURS_A' }],
            contenus: { carte_1: carteAvec({ semaine: 4, rangSeance: 2 }, { productionId: 'PROD_A1' }) }
        });
    }

    it('T4.a le groupe du lundi et celui du mardi — 2e séance de la semaine 4', () => {
        const win = winDeuxGroupes();
        expect(win.dateEcheanceProposeeParLaCarte('PROD_A1', CTX_A)).toBe('2026-02-16');
        expect(win.dateEcheanceProposeeParLaCarte('PROD_A1', CTX_B)).toBe('2026-02-17');
    });

    it('T4.b Et les deux dates sont bien la 2e séance de LEUR semaine 4', () => {
        const win = winDeuxGroupes();
        for (const [ctx, date] of [[CTX_A, '2026-02-16'], [CTX_B, '2026-02-17']]) {
            const dates = win.datesSeancesDeLaSemaine(ctx, 4, false);
            expect(dates.indexOf(date) + 1).toBe(2);
        }
    });

    it('T4.c Sans carte, rien n\'est proposé — le champ reste manuel', () => {
        const win = charger({ cartes: [], contenus: {} });
        expect(win.dateEcheanceProposeeParLaCarte('PROD_A1', CTX_A)).toBeNull();
    });
});

/* --------------------------------------- T5 — ce qui est saisi n'est pas écrasé */

describe('#493 · T5 — la carte propose, elle ne dispose pas', () => {
    function winAvecCarte() {
        return charger({
            cartes: [{ id: 'carte_1', coursId: 'COURS_A' }],
            contenus: { carte_1: carteAvec({ semaine: 4, rangSeance: 2 }, { productionId: 'PROD_A1' }) }
        });
    }

    it('T5.a Un champ vide reçoit la date de la carte', () => {
        const win = winAvecCarte();
        const { input, span } = champDate('');
        win.brancherPropositionDeLaCarte(input, span, 'PROD_A1', CTX_A);
        expect(input.value).toBe('2026-02-16');
    });

    it('T5.b LE POINT DÉCISIF : une date saisie n\'est jamais écrasée', () => {
        const win = winAvecCarte();
        const { input, parent, span } = champDate('2026-03-02');
        win.brancherPropositionDeLaCarte(input, span, 'PROD_A1', CTX_A);
        expect(input.value).toBe('2026-03-02');
        // Mais l'écart est DIT, sinon carte et écran se contrediraient sans témoin.
        const ecart = parent.querySelector('.echeance-ecart-carte');
        expect(ecart, 'l\'écart avec la carte doit être signalé').toBeTruthy();
    });

    it('T5.c L\'écart s\'adopte d\'un clic, et le signal disparaît', () => {
        const win = winAvecCarte();
        const { input, parent, span } = champDate('2026-03-02');
        win.brancherPropositionDeLaCarte(input, span, 'PROD_A1', CTX_A);
        const bouton = parent.querySelector('.echeance-ecart-carte')
            .enfants.find(n => n.tagName === 'button');
        bouton.declencher('click');
        expect(input.value).toBe('2026-02-16');
        expect(parent.querySelector('.echeance-ecart-carte')).toBeNull();
        // Lot E3 (D3) : sans ce « change », la date adoptée ne s'enregistrerait pas.
        expect(input.emis.map(e => e.type + ':' + e.bubbles)).toEqual(['change:true']);
    });

    it('T5.d Champ déjà d\'accord avec la carte : aucun signal', () => {
        const win = winAvecCarte();
        const { input, parent, span } = champDate('2026-02-16');
        win.brancherPropositionDeLaCarte(input, span, 'PROD_A1', CTX_A);
        expect(parent.querySelector('.echeance-ecart-carte')).toBeNull();
    });

    it('T5.e Sans proposition, le champ vide reste vide', () => {
        const win = charger({ cartes: [], contenus: {} });
        const { input, parent, span } = champDate('');
        win.brancherPropositionDeLaCarte(input, span, 'PROD_A1', CTX_A);
        expect(input.value).toBe('');
        expect(parent.querySelector('.echeance-ecart-carte')).toBeNull();
    });

    it('T5.f Une production neuve (sans id) ne déclenche rien', () => {
        const win = winAvecCarte();
        const { input } = champDate('');
        win.brancherPropositionDeLaCarte(input, null, null, CTX_A);
        expect(input.value).toBe('');
    });
});
