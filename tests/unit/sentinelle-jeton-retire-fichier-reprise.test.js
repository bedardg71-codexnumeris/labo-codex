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
        const stores = { evaluationsSauvegardees: [EVAL_ORIGINALE, EVAL_REPRISE] };
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
