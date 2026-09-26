import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #607 (S1 du plan « chaîne d'importation des travaux », constat S5 de l'audit
// du 30 août 2026) — RETIRER UN JETON DE REPRISE DOIT EMPORTER SON FICHIER.
//
// Le défaut : `retirerJetonReprise` supprimait l'évaluation de reprise sans
// toucher au fichier importé pour elle. Ce fichier gardait `estReprise: true`,
// un `evaluationId` qui ne pointait plus sur rien, et surtout la
// `dateModification` LA PLUS RÉCENTE de la paire. La liste résout le fichier
// de chaque ligne SANS `id` (`liste-evaluations.js:60`), donc par le repli
// (DA, production) → « le plus récent ». Résultat : la ligne de l'originale
// restaurée ouvrait le travail de la reprise effacée.
//
// Symétriquement, `appliquerJetonReprise(..., archiverOriginale: false)`
// supprime l'originale et laissait le fichier original avec un `evaluationId`
// mort.
//
// Ce que la sentinelle verrouille, du côté OBSERVABLE (la résolution), pas du
// côté de l'implémentation : après le retrait, `trouverFichierPourEvaluation`
// sur l'originale rend le fichier ORIGINAL, et le fichier de reprise est en
// corbeille.

const DA = '1111111';
const PRODUCTION = 'PROD_1';

// Faux magasin de fichiers travaux, fidèle sur les trois points qui comptent :
//  - la corbeille est un magasin SÉPARÉ (deplacerEnCorbeille retire de l'actif) ;
//  - mettreAJourFichier rafraîchit `dateModification` (travaux-stockage.js:450) ;
//  - obtenirFichiersEtudiant lit la liste ACTIVE.
function creerStockage(fichiers) {
    const actifs = fichiers.map(f => Object.assign({}, f));
    const corbeille = [];
    return {
        _actifs: actifs,
        _corbeille: corbeille,
        obtenirFichiersTravaux: () => actifs,
        obtenirFichiersEtudiant: (da) => actifs.filter(f => f.etudiantDA === da),
        obtenirFichierParId: (id) => actifs.find(f => f.id === id) || null,
        mettreAJourFichier: (id, modifs) => {
            const f = actifs.find(x => x.id === id);
            if (!f) return false;
            Object.assign(f, modifs);
            f.dateModification = new Date().toISOString();
            return true;
        },
        deplacerEnCorbeille: (id) => {
            const i = actifs.findIndex(f => f.id === id);
            if (i === -1) return false;
            corbeille.push(Object.assign({}, actifs[i], { dateSuppression: new Date().toISOString() }));
            actifs.splice(i, 1);
            return true;
        }
    };
}

function monter({ evaluations, fichiers, reponseConfirm = true }) {
    const stores = {
        evaluationsSauvegardees: evaluations.map(e => Object.assign({}, e)),
        modalitesEvaluation: {
            jetons: { actif: true, reprise: { nombre: 5, maxParProduction: 3, archiverOriginale: true } }
        }
    };
    const travauxStockage = creerStockage(fichiers);
    const notifs = [];

    const db = {
        getSync: (k, d) => (k in stores ? stores[k] : (d !== undefined ? d : null)),
        setSync: () => {}, get: async () => null, set: async () => {}
    };

    const globaux = {
        db,
        cle: (k) => k,
        obtenirDonneesSelonMode: (k) => stores[k],
        sauvegarderDonneesSelonMode: (k, v) => { stores[k] = v; return true; },
        notifications: {
            succes: (t, m) => notifs.push({ type: 'succes', t, m }),
            erreur: (t, m) => notifs.push({ type: 'erreur', t, m }),
            info: (t, m) => notifs.push({ type: 'info', t, m }),
            avertissement: (t, m) => notifs.push({ type: 'avertissement', t, m })
        },
        confirm: () => reponseConfirm,
        genererIdUnique: (prefixe) => prefixe + '9999999999',
        travauxStockage
    };

    const win = chargerScript('js/evaluation-jetons.js', globaux);
    chargerScript('js/travaux-resolution.js', globaux, win);
    return { win, stores, travauxStockage, notifs };
}

// Deux évaluations : l'originale archivée, la reprise qui la remplace.
const EVAL_ORIGINALE = {
    id: 'EVAL_A', etudiantDA: DA, productionId: PRODUCTION, noteFinale: 60,
    remplaceeParId: 'EVAL_B', dateRemplacement: '2026-08-20T10:00:00.000Z',
    archivee: true, dateArchivage: '2026-08-20T10:00:00.000Z'
};
const EVAL_REPRISE = {
    id: 'EVAL_B', etudiantDA: DA, productionId: PRODUCTION, noteFinale: 80,
    repriseDeId: 'EVAL_A', jetonRepriseApplique: true,
    dateApplicationJetonReprise: '2026-08-20T10:00:00.000Z'
};

// Le fichier original est plus ANCIEN : c'est ce qui fait gagner celui de la
// reprise au tri « plus récent » du repli.
const FICHIER_ORIGINAL = {
    id: 'F_ORIG', etudiantDA: DA, productionId: PRODUCTION, nomFichier: 'devoir.pdf',
    evaluationId: '', estReprise: false, dateModification: '2026-08-01T08:00:00.000Z'
};
const FICHIER_REPRISE = {
    id: 'F_REPR', etudiantDA: DA, productionId: PRODUCTION, nomFichier: 'devoir-v2.pdf',
    evaluationId: 'EVAL_B', estReprise: true, dateModification: '2026-08-25T08:00:00.000Z'
};

describe('#607 · retirer un jeton de reprise emporte le fichier de la reprise', () => {

    it('la mise en place reproduit bien le piège : sans retrait, le repli rend le fichier de la REPRISE', () => {
        const { win } = monter({
            evaluations: [EVAL_ORIGINALE, EVAL_REPRISE],
            fichiers: [FICHIER_ORIGINAL, FICHIER_REPRISE]
        });
        // Ce que fait `liste-evaluations.js:60` : résoudre SANS id.
        const resolu = win.travauxResolution.trouverFichierPourEvaluation({
            etudiantDA: DA, productionId: PRODUCTION
        });
        expect(resolu.id).toBe('F_REPR');
    });

    it('après retirerJetonReprise(reprise), le fichier de reprise est EN CORBEILLE', () => {
        const { win, travauxStockage } = monter({
            evaluations: [EVAL_ORIGINALE, EVAL_REPRISE],
            fichiers: [FICHIER_ORIGINAL, FICHIER_REPRISE]
        });

        expect(win.retirerJetonReprise('EVAL_B')).toBe(true);

        expect(travauxStockage._actifs.map(f => f.id)).toEqual(['F_ORIG']);
        expect(travauxStockage._corbeille.map(f => f.id)).toEqual(['F_REPR']);
    });

    it('après le retrait, la ligne de l\'originale résout le fichier ORIGINAL', () => {
        const { win } = monter({
            evaluations: [EVAL_ORIGINALE, EVAL_REPRISE],
            fichiers: [FICHIER_ORIGINAL, FICHIER_REPRISE]
        });

        win.retirerJetonReprise('EVAL_B');

        const resolu = win.travauxResolution.trouverFichierPourEvaluation({
            etudiantDA: DA, productionId: PRODUCTION
        });
        expect(resolu).not.toBeNull();
        expect(resolu.id).toBe('F_ORIG');
    });

    it('la notification DIT le nombre de fichiers mis à la corbeille', () => {
        const { win, notifs } = monter({
            evaluations: [EVAL_ORIGINALE, EVAL_REPRISE],
            fichiers: [FICHIER_ORIGINAL, FICHIER_REPRISE]
        });

        win.retirerJetonReprise('EVAL_B');

        const succes = notifs.filter(n => n.type === 'succes').map(n => String(n.t) + ' ' + String(n.m));
        expect(succes.some(s => /corbeille/i.test(s))).toBe(true);
    });

    it('branche #141 (retrait depuis l\'ORIGINALE remplacée) : le fichier de la reprise part aussi', () => {
        const { win, travauxStockage } = monter({
            evaluations: [EVAL_ORIGINALE, EVAL_REPRISE],
            fichiers: [FICHIER_ORIGINAL, FICHIER_REPRISE]
        });

        // Appelée sur l'ORIGINALE : restaure l'originale et supprime la reprise.
        expect(win.retirerJetonReprise('EVAL_A')).toBe(true);

        expect(travauxStockage._corbeille.map(f => f.id)).toEqual(['F_REPR']);
    });

    it('appliquerJetonReprise avec archiverOriginale:false DÉLIE le fichier de l\'originale supprimée', () => {
        const originaleSeule = {
            id: 'EVAL_A', etudiantDA: DA, productionId: PRODUCTION, noteFinale: 60
        };
        const fichierLie = Object.assign({}, FICHIER_ORIGINAL, { evaluationId: 'EVAL_A' });

        const { win, travauxStockage } = monter({
            evaluations: [originaleSeule],
            fichiers: [fichierLie]
        });

        const reprise = win.appliquerJetonReprise('EVAL_A', false, { silencieux: true });
        expect(reprise).not.toBeNull();

        // Le fichier n'est PAS mis à la corbeille — l'élève a bien remis ce
        // travail — mais son lien vers une évaluation disparue est coupé.
        const f = travauxStockage._actifs.find(x => x.id === 'F_ORIG');
        expect(f).toBeDefined();
        expect(f.evaluationId).toBe('');
        expect(f.estReprise).toBe(false);
    });

    it('un module chargé sans travauxStockage ne lève pas (garde typeof)', () => {
        // ⚠ COPIER le corpus. `retirerJetonReprise` retire les quatre marqueurs
        // d'archivage EN PLACE : monté sans copie, ce cas vidait `EVAL_ORIGINALE`
        // pour tous les `describe` suivants, qui héritaient d'une originale déjà
        // « restaurée » — un faux vert (ou, ici, un faux rouge) à retardement.
        const stores = {
            evaluationsSauvegardees: [EVAL_ORIGINALE, EVAL_REPRISE].map(e => Object.assign({}, e))
        };
        const win = chargerScript('js/evaluation-jetons.js', {
            db: { getSync: (k, d) => (k in stores ? stores[k] : d), setSync: () => {} },
            cle: (k) => k,
            obtenirDonneesSelonMode: (k) => stores[k],
            sauvegarderDonneesSelonMode: (k, v) => { stores[k] = v; return true; },
            notifications: { succes: () => {}, erreur: () => {}, info: () => {}, avertissement: () => {} },
            confirm: () => true,
            genererIdUnique: (p) => p + '1'
        });
        expect(() => win.retirerJetonReprise('EVAL_B')).not.toThrow();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// #612 · T6.6 — LA MÊME PORTE, PAR LA LISTE DES ÉVALUATIONS.
//
// #607 a fermé le chemin des JETONS (`retirerJetonReprise`,
// `appliquerJetonReprise`). Il en restait un, plus fréquenté : supprimer une
// reprise depuis la LISTE. `supprimerEvaluation` (`js/liste-evaluations.js`)
// restaure l'originale — elle retire les quatre marqueurs d'archivage — et ne
// touche à AUCUN fichier. Le fichier de la reprise garde son `evaluationId`
// mort ET sa `dateModification` la plus récente : il gagne le repli
// (DA, production), et la ligne de l'originale restaurée ouvre le travail de
// la reprise qu'on vient d'effacer. Mécanisme identique, autre porte.
//
// ⚠ ORDRE DES DEUX ÉCRITURES — écart assumé avec le plan (S6/T6.6), qui disait
// « détacher AVANT `sauvegarderDonneesSelonMode` ». Appliqué tel quel, le
// refus d'écriture du mode anonymisation (`modes.js:756-759`, seul cas où la
// fonction rend `false`) laisserait le fichier à la corbeille alors que
// l'évaluation, elle, reste : un état incohérent PERMANENT. Les deux écritures
// sont synchrones dans les deux sens — « sans point d'attente entre elles »
// tient aussi bien à l'envers. On persiste donc D'ABORD, on détache
// IMMÉDIATEMENT après : le pire cas redevient l'ancien comportement (fichier
// resté actif), pas une perte.
//
// ⚠ ET INVERSER L'ORDRE NE SUFFIT PAS. `sauvegarderDonneesSelonMode` rend
// TROIS valeurs (`modes.js:751`) : `true`, `false`, et la chaîne `'quota'` —
// truthy, alors que rien n'a été écrit. Un refus RENDU n'est pas une exception :
// il doit être LU. Le détachement est donc conditionné à `=== true`, pas à la
// véracité. Les deux cas « écriture refusée » et « quota dépassé » ci-dessous
// verrouillent ce choix ; c'est le second qui rougit si quelqu'un réécrit la
// garde en test truthy.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Monte `evaluation-jetons.js` ET `liste-evaluations.js` dans le MÊME sandbox :
 * c'est la condition du correctif, qui traverse les deux IIFE par `window._…`.
 * `avecJetons: false` retire le module des jetons pour éprouver la garde
 * `typeof` — l'ordre de chargement d'`index.html` n'est pas garanti.
 */
function monterListe({ evaluations, fichiers, reponseConfirm = true, retourEcriture = true, avecJetons = true }) {
    const stores = {
        evaluationsSauvegardees: evaluations.map(e => Object.assign({}, e)),
        modalitesEvaluation: {
            jetons: { actif: true, reprise: { nombre: 5, maxParProduction: 3, archiverOriginale: true } }
        }
    };
    const travauxStockage = creerStockage(fichiers);
    const notifs = [];
    const confirmations = [];

    const globaux = {
        db: {
            getSync: (k, d) => (k in stores ? stores[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { stores[k] = v; },
            get: async () => null, set: async () => {}
        },
        cle: (k) => k,
        // `supprimerEvaluation` finit par `initialiserListeEvaluations()`, qui
        // vit dans la MÊME IIFE : l'appel résout lexicalement vers la vraie, et
        // son try/catch avalerait une ReferenceError. On la nourrit de vide —
        // un banc vert qui journalise une erreur finit par masquer la vraie.
        obtenirDonneesSelonMode: () => [],
        // `sauvegarderDonneesSelonMode` rend TROIS choses (`modes.js:751`) :
        // `true`, `false` (mode anonymisation) et la chaîne `'quota'` — truthy,
        // alors que RIEN n'a été écrit. Le faux magasin reproduit les trois, et
        // n'écrit que sur `true`.
        sauvegarderDonneesSelonMode: (k, v) => {
            if (retourEcriture !== true) return retourEcriture;
            stores[k] = v;
            return true;
        },
        notifications: {
            succes: (t, m) => notifs.push({ type: 'succes', t, m }),
            erreur: (t, m) => notifs.push({ type: 'erreur', t, m }),
            info: () => {}, avertissement: () => {}
        },
        confirm: (msg) => { confirmations.push(String(msg)); return reponseConfirm; },
        genererIdUnique: (p) => p + '9999999999',
        travauxStockage,
        calculerEtStockerIndicesCP: () => {},
        obtenirPreference: () => null,
        obtenirSeuil: () => null,
        document: {
            getElementById: () => null, addEventListener: () => {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} } }),
            body: { appendChild() {} }
        }
    };

    const win = { addEventListener: () => {}, removeEventListener: () => {} };
    if (avecJetons) chargerScript('js/evaluation-jetons.js', globaux, win);
    chargerScript('js/liste-evaluations.js', globaux, win);
    chargerScript('js/travaux-resolution.js', globaux, win);

    return { win, stores, travauxStockage, notifs, confirmations };
}

describe('#612 T6.6 · supprimer une reprise depuis la LISTE emporte son fichier', () => {

    it('la mise en place reproduit le piège : le fichier de la reprise gagne le repli', () => {
        const { win } = monterListe({
            evaluations: [EVAL_ORIGINALE, EVAL_REPRISE],
            fichiers: [FICHIER_ORIGINAL, FICHIER_REPRISE]
        });
        const resolu = win.travauxResolution.trouverFichierPourEvaluation({
            etudiantDA: DA, productionId: PRODUCTION
        });
        expect(resolu.id).toBe('F_REPR');
    });

    it('après supprimerEvaluation(reprise), le fichier de la reprise est EN CORBEILLE', () => {
        const { win, travauxStockage } = monterListe({
            evaluations: [EVAL_ORIGINALE, EVAL_REPRISE],
            fichiers: [FICHIER_ORIGINAL, FICHIER_REPRISE]
        });

        win.supprimerEvaluation('EVAL_B');

        expect(travauxStockage._actifs.map(f => f.id)).toEqual(['F_ORIG']);
        expect(travauxStockage._corbeille.map(f => f.id)).toEqual(['F_REPR']);
    });

    it('après la suppression, la ligne de l\'originale restaurée résout le fichier ORIGINAL', () => {
        const { win } = monterListe({
            evaluations: [EVAL_ORIGINALE, EVAL_REPRISE],
            fichiers: [FICHIER_ORIGINAL, FICHIER_REPRISE]
        });

        win.supprimerEvaluation('EVAL_B');

        // Ce que fait `liste-evaluations.js:60` : résoudre SANS id.
        const resolu = win.travauxResolution.trouverFichierPourEvaluation({
            etudiantDA: DA, productionId: PRODUCTION
        });
        expect(resolu).not.toBeNull();
        expect(resolu.id).toBe('F_ORIG');
    });

    it('le confirm ANNONCE le sort du fichier AVANT de le décider', () => {
        const { win, confirmations } = monterListe({
            evaluations: [EVAL_ORIGINALE, EVAL_REPRISE],
            fichiers: [FICHIER_ORIGINAL, FICHIER_REPRISE]
        });

        win.supprimerEvaluation('EVAL_B');

        // Même exigence que le `confirm` du retrait de jeton (#607) : la
        // question dit ce qu'elle emporte, y compris le nombre.
        const texte = confirmations.join(' ');
        expect(texte).toMatch(/corbeille/i);
        expect(texte).toMatch(/\b1\b/);
    });

    it('la notification de succès DIT le nombre de fichiers mis à la corbeille', () => {
        const { win, notifs } = monterListe({
            evaluations: [EVAL_ORIGINALE, EVAL_REPRISE],
            fichiers: [FICHIER_ORIGINAL, FICHIER_REPRISE]
        });

        win.supprimerEvaluation('EVAL_B');

        const succes = notifs.filter(n => n.type === 'succes').map(n => String(n.t) + ' ' + String(n.m));
        expect(succes.some(s => /corbeille/i.test(s))).toBe(true);
    });

    it('refuser le confirm ne touche NI l\'évaluation NI le fichier', () => {
        const { win, stores, travauxStockage } = monterListe({
            evaluations: [EVAL_ORIGINALE, EVAL_REPRISE],
            fichiers: [FICHIER_ORIGINAL, FICHIER_REPRISE],
            reponseConfirm: false
        });

        win.supprimerEvaluation('EVAL_B');

        expect(stores.evaluationsSauvegardees.map(e => e.id)).toEqual(['EVAL_A', 'EVAL_B']);
        expect(travauxStockage._corbeille).toEqual([]);
    });

    it('ÉCRITURE REFUSÉE (erreur du stockage) : le fichier n\'est PAS mis à la corbeille', () => {
        // Le cas qui décide de l'ORDRE. Détacher avant de persister laisserait
        // le fichier à la corbeille et l'évaluation en place — définitivement.
        // Réancré le 26 sept. 2026 (lot A de l'enregistrement) : le refus modélisé était celui
        // du mode anonymisation (`false`), qui n'existe plus — l'anonymisation écrit. Le refus
        // restant est `'error'`. Le message d'échec n'est plus asserté ici : `'error'` et
        // `'quota'` sont truthy, la suite les prend pour un succès (#618, lot B).
        const { win, stores, travauxStockage } = monterListe({
            evaluations: [EVAL_ORIGINALE, EVAL_REPRISE],
            fichiers: [FICHIER_ORIGINAL, FICHIER_REPRISE],
            retourEcriture: 'error'
        });

        win.supprimerEvaluation('EVAL_B');

        expect(travauxStockage._corbeille).toEqual([]);
        expect(travauxStockage._actifs.map(f => f.id)).toEqual(['F_ORIG', 'F_REPR']);
        expect(stores.evaluationsSauvegardees.map(e => e.id)).toEqual(['EVAL_A', 'EVAL_B']);
    });

    it('QUOTA DÉPASSÉ (retour \'quota\', truthy) : le fichier n\'est PAS mis à la corbeille', () => {
        // Le cas qui rougira si quelqu'un réécrit la garde en test truthy.
        // `'quota'` veut dire « l'écriture a levé, rien n'est enregistré » — le
        // geste destructeur ne doit donc pas partir. La suite de
        // `supprimerEvaluation` traite `'quota'` comme un succès : bug latent
        // PRÉEXISTANT, inscrit en #618, hors périmètre de T6.6. Ce cas verrouille
        // seulement que la CORBEILLE, elle, n'y touche pas.
        const { win, stores, travauxStockage } = monterListe({
            evaluations: [EVAL_ORIGINALE, EVAL_REPRISE],
            fichiers: [FICHIER_ORIGINAL, FICHIER_REPRISE],
            retourEcriture: 'quota'
        });

        win.supprimerEvaluation('EVAL_B');

        expect(travauxStockage._corbeille).toEqual([]);
        expect(travauxStockage._actifs.map(f => f.id)).toEqual(['F_ORIG', 'F_REPR']);
        // Rien n'a été enregistré : c'est ce que dit `'quota'`.
        expect(stores.evaluationsSauvegardees.map(e => e.id)).toEqual(['EVAL_A', 'EVAL_B']);
    });

    it('supprimer une évaluation ORDINAIRE n\'emporte aucun fichier et n\'annonce rien', () => {
        // Garde-fou de portée : T6.6 ne vise QUE la reprise dont la suppression
        // restaure une originale. Une évaluation isolée ne doit pas voir son
        // travail partir à la corbeille au passage.
        const evalSeule = { id: 'EVAL_X', etudiantDA: DA, productionId: PRODUCTION, noteFinale: 70 };
        const fichierLie = Object.assign({}, FICHIER_ORIGINAL, { evaluationId: 'EVAL_X' });

        const { win, travauxStockage, confirmations } = monterListe({
            evaluations: [evalSeule],
            fichiers: [fichierLie]
        });

        win.supprimerEvaluation('EVAL_X');

        expect(travauxStockage._corbeille).toEqual([]);
        expect(travauxStockage._actifs.map(f => f.id)).toEqual(['F_ORIG']);
        expect(confirmations.join(' ')).not.toMatch(/corbeille/i);
    });

    it('#360 · supprimer le survivant d\'un doublon réconcilié n\'emporte aucun fichier', () => {
        // `reconcilieParDoublon` pose `remplaceeParId` SANS être une originale
        // archivée par une reprise. La restauration l'exclut déjà ; l'annonce et
        // le détachement doivent l'exclure par le MÊME chemin, sinon les deux
        // gestes divergent.
        const doublon = {
            id: 'EVAL_D', etudiantDA: DA, productionId: PRODUCTION, noteFinale: 70,
            remplaceeParId: 'EVAL_S', reconcilieParDoublon: true
        };
        const survivant = { id: 'EVAL_S', etudiantDA: DA, productionId: PRODUCTION, noteFinale: 70 };
        const fichierLie = Object.assign({}, FICHIER_REPRISE, { evaluationId: 'EVAL_S' });

        const { win, stores, travauxStockage, confirmations } = monterListe({
            evaluations: [doublon, survivant],
            fichiers: [FICHIER_ORIGINAL, fichierLie]
        });

        win.supprimerEvaluation('EVAL_S');

        expect(travauxStockage._corbeille).toEqual([]);
        expect(confirmations.join(' ')).not.toMatch(/corbeille/i);
        // Et le doublon n'est pas ressuscité.
        expect(stores.evaluationsSauvegardees.find(e => e.id === 'EVAL_D').remplaceeParId).toBe('EVAL_S');
    });

    it('sans le module des jetons chargé, supprimerEvaluation ne lève pas et supprime quand même', () => {
        const { win, stores } = monterListe({
            evaluations: [EVAL_ORIGINALE, EVAL_REPRISE],
            fichiers: [FICHIER_ORIGINAL, FICHIER_REPRISE],
            avecJetons: false
        });

        expect(typeof win._detacherFichiersDeEvaluation).toBe('undefined');
        expect(() => win.supprimerEvaluation('EVAL_B')).not.toThrow();
        expect(stores.evaluationsSauvegardees.map(e => e.id)).toEqual(['EVAL_A']);
    });
});
