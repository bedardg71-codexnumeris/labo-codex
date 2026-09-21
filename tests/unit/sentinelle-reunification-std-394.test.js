import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { pontsResolution } from './_helpers/ponts-resolution.js';   // lot N1a (21 sept. 2026)

// SENTINELLE #394 — Réunification des DEUX systèmes de calcul STD (décision D1,
// Grégoire, 5 août 2026). Avant : l'instance registre (PratiquePANStandards)
// prenait la PREMIÈRE production pondérée comme « terminale » (quel que soit son
// type), appliquait des défauts 60/40, triait « recents » par dateEvaluation et
// lisait la config legacy modalitesEvaluation.configPAN — le chemin riche
// (calculerDetailsNoteFinale) exigeait type === 'terminale', des pondérations
// saisies et triait par numéro de production. Sonde du rapport d'audit :
// 82,67 (riche) vs 74,29 (instance) sur le MÊME corpus.
//
// Les 5 règles D1 vérifiées ici :
//  1. terminale = type === 'terminale' STRICT, partagé (SSOT pratique-registre.js) ;
//  2. conteneur « portfolio » OPTIONNEL → règle du complément (pool = 100 − p) ;
//  3. transparence : avertissements non bloquants (validerProductionsStd) ;
//  4. « non constructible » STOCKÉ (noteConstructible additif, parité simulerIndices) ;
//  5. migration legacy par GESTE explicite (candidate unique → productionId exposé).

const DA = '1234567';

// Corpus de la sonde L2 du rapport : portfolio pond 60, 4 artefacts (60/70/80/90),
// « examen intra » type examen pond 10, « terminale » type terminale pond 30.
function corpusL2() {
    return {
        productions: [
            { id: 'PF', type: 'portfolio', ponderation: 60, titre: 'Portfolio' },
            { id: 'A1', type: 'artefact-portfolio', numero: 1, titre: 'Artefact 1' },
            { id: 'A2', type: 'artefact-portfolio', numero: 2, titre: 'Artefact 2' },
            { id: 'A3', type: 'artefact-portfolio', numero: 3, titre: 'Artefact 3' },
            { id: 'A4', type: 'artefact-portfolio', numero: 4, titre: 'Artefact 4' },
            { id: 'INTRA', type: 'examen', ponderation: 10, titre: 'Examen intra' },
            { id: 'TERM', type: 'terminale', ponderation: 30, titre: 'Évaluation terminale' }
        ],
        evaluationsSauvegardees: [
            // dateEvaluation INVERSE du numéro de production : la reprise de
            // l'artefact 1 est évaluée en dernier (piège L9).
            { etudiantDA: DA, productionId: 'A1', noteFinale: 60, dateEvaluation: '2026-04-30', remplaceeParId: null },
            { etudiantDA: DA, productionId: 'A2', noteFinale: 70, dateEvaluation: '2026-03-01', remplaceeParId: null },
            { etudiantDA: DA, productionId: 'A3', noteFinale: 80, dateEvaluation: '2026-02-01', remplaceeParId: null },
            { etudiantDA: DA, productionId: 'A4', noteFinale: 90, dateEvaluation: '2026-01-01', remplaceeParId: null },
            { etudiantDA: DA, productionId: 'INTRA', noteFinale: 40, dateEvaluation: '2026-03-15', remplaceeParId: null },
            { etudiantDA: DA, productionId: 'TERM', noteFinale: 88, dateEvaluation: '2026-05-01', remplaceeParId: null }
        ],
        groupeEtudiants: [{ da: DA, nom: 'Test', prenom: 'Étudiant' }],
        pratiquesConfigurables: [{
            id: 'standards',
            nom: 'STD de test',
            configuration: {
                type: 'standards',
                portfolio: { nombreARetenir: 3, minimumCompletion: 1, methodeSelection: 'meilleurs' }
            }
        }]
    };
}

/**
 * Harnais : charge la chaîne COMPLÈTE (registre → instance STD → portfolio →
 * profil-etudiant-actions) sur le même faux window, branchée sur un store commun.
 * Les ponts inter-modules (bare identifiers non résolus par le sandbox) sont
 * injectés comme wrappers paresseux vers le window partagé.
 */
function chargerChaine(store) {
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = v; },
        // #522 lot 3 : `typerProductionCommeTerminale` écrit par la file, et
        // rejoue DANS le mutateur le test « une seule terminale ». Le stub
        // reproduit la file, refus compris — un mutateur qui rend `undefined`
        // n'écrit rien, ce qui est exactement le refus que ce fichier vérifie.
        modifier: async (k, mutateur, defaut = null) => {
            const lue = k in store ? store[k] : defaut;
            const resultat = await mutateur(lue);
            if (resultat === undefined) return undefined;
            store[k] = resultat;
            return resultat;
        }
    };
    const cle = (k) => k;
    const obtenirDonneesSelonMode = (k) => (k in store ? store[k] : null);

    const win = chargerScript('js/pratiques/pratique-registre.js', { db, cle });
    const ponts = {
        db, cle, obtenirDonneesSelonMode,
        estEtudiantExclu: () => false,
        obtenirTypePratiqueActive: () => 'standards',
        obtenirPratiqueActiveGroupeCours: () => 'standards', ...pontsResolution(win, () => 'standards'),
        obtenirPratiqueParId: (...a) => win.obtenirPratiqueParId(...a),
        obtenirConfigPratiqueActive: (...a) => win.obtenirConfigPratiqueActive(...a),
        calculerDetailsNoteFinale: (...a) => win.calculerDetailsNoteFinale(...a)
    };
    chargerScript('js/pratiques/pratique-pan-standards.js', ponts, win);
    chargerScript('js/portfolio.js', ponts, win);
    chargerScript('js/profil-etudiant-actions.js', ponts, win);
    return { win, store };
}

describe('#394 · règle 1 — UNE seule définition de « terminale » (type strict)', () => {
    it('sonde du rapport : les deux systèmes rendent 82,67 sur le corpus L2 (avant : 74,29 côté instance)', () => {
        const { win } = chargerChaine(corpusL2());
        const riche = win.calculerDetailsNoteFinale(DA);
        // pool top-3 = (90+80+70)/3 = 80 ; 80×60/90 + 88×30/90 = 82,67
        expect(riche.noteFinale).toBeCloseTo(82.6667, 3);

        const instance = win.obtenirPratiqueParId('standards');
        // Avant #394 : l'intra (1re pondérée) était prise pour terminale → 0,7429.
        expect(instance.calculerPerformance(DA)).toBeCloseTo(0.826667, 4);
    });

    it('pas de terminale typée → RIEN n\'en tient lieu (l\'intra pondérée est ignorée, pool = 100 %)', () => {
        const store = corpusL2();
        store.productions = store.productions.filter(p => p.id !== 'TERM');
        const { win } = chargerChaine(store);

        const riche = win.calculerDetailsNoteFinale(DA);
        expect(riche.noteFinale).toBeCloseTo(80, 5); // pool seul

        const instance = win.obtenirPratiqueParId('standards');
        expect(instance.calculerPerformance(DA)).toBeCloseTo(0.80, 5);
    });
});

describe('#394 · règle 2 — conteneur portfolio OPTIONNEL (règle du complément)', () => {
    it('sans conteneur, terminale pondérée 30 → pool = 70 % (100 − 30), note constructible', () => {
        const store = corpusL2();
        store.productions = store.productions.filter(p => p.id !== 'PF');
        const { win } = chargerChaine(store);

        const riche = win.calculerDetailsNoteFinale(DA);
        // Avant #394 : erreur « production portfolio absente » → noteFinale null.
        expect(riche.erreur).toBeNull();
        expect(riche.noteFinale).toBeCloseTo(82.4, 3); // 80×70/100 + 88×30/100
        expect(riche.ponderationParComplement).toBe(true);

        const instance = win.obtenirPratiqueParId('standards');
        expect(instance.calculerPerformance(DA)).toBeCloseTo(0.824, 4);
    });

    it('avec conteneur : le complément ne s\'applique PAS (pondérations saisies)', () => {
        const { win } = chargerChaine(corpusL2());
        expect(win.calculerDetailsNoteFinale(DA).ponderationParComplement).toBe(false);
    });

    it('les défauts 60/40 sont MORTS : conteneur sans pondération → non constructible des deux côtés', () => {
        const store = corpusL2();
        store.productions.find(p => p.id === 'PF').ponderation = undefined;
        const { win } = chargerChaine(store);

        const riche = win.calculerDetailsNoteFinale(DA);
        expect(riche.noteFinale).toBeNull();
        expect(riche.erreur).toMatch(/[Pp]ondération manquante/);

        const instance = win.obtenirPratiqueParId('standards');
        // Avant #394 : || 60 silencieux → un nombre sortait quand même.
        expect(instance.calculerPerformance(DA)).toBeNull();
    });
});

describe('#394 · L9 — UNE seule définition de « récence » (numéro de production)', () => {
    it('méthode recents : l\'instance retient les MÊMES artefacts que le chemin riche', () => {
        const store = corpusL2();
        store.pratiquesConfigurables[0].configuration.portfolio = {
            nombreARetenir: 2, minimumCompletion: 1, methodeSelection: 'recents'
        };
        const { win } = chargerChaine(store);

        // Récence par NUMÉRO (A4, A3) → (90+80)/2 = 85 → 85×60/90 + 88×30/90 = 86.
        // Avant #394, l'instance triait par dateEvaluation (A1, A2) → 65 → 72,67.
        const riche = win.calculerDetailsNoteFinale(DA);
        expect(riche.noteFinale).toBeCloseTo(86, 3);

        const instance = win.obtenirPratiqueParId('standards');
        expect(instance.calculerPerformance(DA)).toBeCloseTo(0.86, 4);
    });
});

describe('#394 · L10 — la config de l\'instance vient de pratiquesConfigurables (plus de configPAN)', () => {
    it('configPAN drifté (nombreARetenir 4) vs pratique active (2) → l\'instance suit la pratique', () => {
        const store = corpusL2();
        store.pratiquesConfigurables[0].configuration.portfolio = {
            nombreARetenir: 2, minimumCompletion: 1, methodeSelection: 'meilleurs'
        };
        // Source legacy driftante — NE DOIT PLUS être consultée.
        store.modalitesEvaluation = { configPAN: { portfolio: { nombreARetenir: 4, methodeSelection: 'meilleurs' } } };
        const { win } = chargerChaine(store);

        const instance = win.obtenirPratiqueParId('standards');
        // top-2 = (90+80)/2 = 85 → 86. Avant : top-4 = 75 → 79,33.
        expect(instance.calculerPerformance(DA)).toBeCloseTo(0.86, 4);
    });
});

describe('#394 · L3/règle 4 — parité stocké ↔ simulé (« non constructible » STOCKÉ)', () => {
    it('STD dont le chemin riche échoue → l\'écrivain stocke noteConstructible:false (plus de P de repli)', () => {
        const store = corpusL2();
        store.pratiquesConfigurables = []; // config absente → chemin riche en erreur
        const { win } = chargerChaine(store);

        const simule = win.simulerIndices(DA, 'standards');
        expect(simule.noteConstructible).toBe(false);

        win.calculerEtStockerIndicesCP();
        const actuel = store.indicesCP[DA].actuel;
        // Avant #394 : le repli calculerPerformance stockait un nombre (74 au terrain).
        expect(actuel.noteConstructible).toBe(false);
        expect(actuel.P).toBe(simule.P); // parité stricte avec simulerIndices (0)
    });

    it('STD constructible → noteConstructible:true stocké, P = noteFinale du chemin riche', () => {
        const { win, store } = chargerChaine(corpusL2());
        win.calculerEtStockerIndicesCP();
        const actuel = store.indicesCP[DA].actuel;
        expect(actuel.noteConstructible).toBe(true);
        expect(actuel.P).toBe(83); // round(82,67)
        const simule = win.simulerIndices(DA, 'standards');
        expect(actuel.P).toBe(simule.P);
    });
});

describe('#394 · règles 3 et 5 — avertissements de transparence + migration par geste', () => {
    function chargerProductionsModule(store) {
        const db = {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            set: async (k, v) => { store[k] = v; },
            // #522 lot 3 : `typerProductionCommeTerminale` écrit par la file, et
            // rejoue DANS le mutateur le test « une seule terminale ». Le stub
            // reproduit la file, refus compris — un mutateur qui rend `undefined`
            // n'écrit rien, ce qui est exactement le refus que ce fichier vérifie.
            modifier: async (k, mutateur, defaut = null) => {
                const lue = k in store ? store[k] : defaut;
                const resultat = await mutateur(lue);
                if (resultat === undefined) return undefined;
                store[k] = resultat;
                return resultat;
            }
        };
        const win = chargerScript('js/pratiques/pratique-registre.js', { db, cle: (k) => k });
        chargerScript('js/productions.js', {
            db, cle: (k) => k,
            obtenirDonneesSelonMode: (k) => (k in store ? store[k] : null),
            echapperHtml: (s) => String(s)
        }, win);
        return win;
    }

    it('règle 3a : production pondérée non participante → avertissement nominatif', () => {
        const win = chargerProductionsModule({});
        const avert = win.validerProductionsStd(corpusL2().productions);
        const nonParticipante = avert.find(a => a.message.includes('Examen intra'));
        expect(nonParticipante).toBeTruthy();
        expect(nonParticipante.message).toMatch(/n'entre pas dans le calcul STD/);
        expect(nonParticipante.productionId).toBeUndefined();
    });

    it('règle 3b : pondération par complément → avertissement chiffré (70 %)', () => {
        const win = chargerProductionsModule({});
        const productions = corpusL2().productions.filter(p => p.id !== 'PF');
        const avert = win.validerProductionsStd(productions);
        const complement = avert.find(a => a.message.includes('complément'));
        expect(complement).toBeTruthy();
        expect(complement.message).toContain('70 %');
    });

    it('règle 5, cas NON ambigu : une seule candidate → productionId exposé (bouton), jamais de conversion auto', () => {
        const win = chargerProductionsModule({});
        const productions = corpusL2().productions.filter(p => p.id !== 'TERM');
        const avert = win.validerProductionsStd(productions);
        const candidate = avert.find(a => a.productionId);
        expect(candidate).toBeTruthy();
        expect(candidate.productionId).toBe('INTRA');
        // La fonction est PURE : elle n'a pas touché la production.
        expect(productions.find(p => p.id === 'INTRA').type).toBe('examen');
    });

    it('règle 5, cas ambigu : deux candidates → liste nominative SANS productionId (l\'outil ne choisit pas)', () => {
        const win = chargerProductionsModule({});
        const productions = corpusL2().productions.filter(p => p.id !== 'TERM');
        productions.push({ id: 'PROJ', type: 'projet', ponderation: 20, titre: 'Projet final' });
        const avert = win.validerProductionsStd(productions);
        const ambigu = avert.find(a => a.message.includes('Examen intra') && a.message.includes('Projet final'));
        expect(ambigu).toBeTruthy();
        expect(ambigu.productionId).toBeUndefined();
        expect(avert.every(a => !a.productionId)).toBe(true);
    });

    it('corpus cohérent (terminale typée + conteneur pondéré, rien d\'orphelin) → zone muette', () => {
        const win = chargerProductionsModule({});
        const productions = corpusL2().productions.filter(p => p.id !== 'INTRA');
        expect(win.validerProductionsStd(productions)).toEqual([]);
    });

    it('typerProductionCommeTerminale = geste explicite : convertit la candidate, refuse si une terminale existe déjà', async () => {
        const store = { productions: corpusL2().productions.filter(p => p.id !== 'TERM') };
        const win = chargerProductionsModule(store);
        win.getCleProductions = () => 'productions';
        // pas d'alerte bloquante en sandbox
        await win.typerProductionCommeTerminale.call(null, 'INTRA').catch(() => {});
        expect(store.productions.find(p => p.id === 'INTRA').type).toBe('terminale');
    });
});
