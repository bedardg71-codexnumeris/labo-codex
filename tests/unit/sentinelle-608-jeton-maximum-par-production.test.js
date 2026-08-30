import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #608 (S2 du plan « chaîne d'importation des travaux », constat S6 de l'audit
// du 30 août 2026) — LE JETON OFFERT DOIT ÊTRE UN JETON QU'ON PEUT CONSOMMER,
// ET UN RATTACHEMENT N'EST PAS UN JETON.
//
// Deux défauts distincts, qui se composaient en un mensonge d'écran :
//
//  1. La modale de doublon n'offrait « Appliquer comme jeton de reprise » qu'en
//     regardant le compte GLOBAL de jetons de l'élève
//     (`verifierDisponibiliteJeton`), jamais le maximum PAR PRODUCTION. Au-delà
//     du maximum, `appliquerJetonReprise(..., silencieux: true)` rend `null`
//     sans un mot : le fichier était importé comme reprise, aucun jeton n'était
//     consommé, et rien ne le disait.
//
//  2. Le balayage post-import comptait comme « jeton appliqué » un fichier
//     simplement RATTACHÉ à une reprise déjà accordée. L'écran annonçait
//     « 1 jeton(s) de reprise appliqué(s) » alors qu'aucun jeton n'avait été
//     accordé — et la première reprise se retrouvait avec deux fichiers.
//
// Ce que la sentinelle verrouille : la DÉCISION d'offrir le bouton, et la
// SÉPARATION des deux comptes dans ce que la fonction rend.

const DA = '2222222';
const PRODUCTION = 'PROD_A';

function monter({ evaluations = [], fichiers = [], maxParProduction = 1, jetonsRestants = true } = {}) {
    const actifs = fichiers.map(f => Object.assign({}, f));
    const notifs = [];
    const jetonsAppliques = [];

    const configJetons = {
        actif: true,
        reprise: { nombre: 5, maxParProduction: maxParProduction, archiverOriginale: true }
    };

    const travauxStockage = {
        obtenirFichiersGroupeActif: () => actifs,
        obtenirFichiersTravaux: () => actifs,
        obtenirFichiersEtudiant: (da) => actifs.filter(f => f.etudiantDA === da),
        mettreAJourFichier: (id, modifs) => {
            const f = actifs.find(x => x.id === id);
            if (!f) return false;
            Object.assign(f, modifs);
            return true;
        }
    };

    let evals = evaluations.map(e => Object.assign({}, e));

    const globaux = {
        db: { getSync: (k, d) => d, setSync: () => {} },
        cle: (k) => k,
        obtenirDonneesSelonMode: (k) => (k === 'evaluationsSauvegardees' ? evals : []),
        sauvegarderDonneesSelonMode: () => true,
        notifications: {
            succes: (t, m) => notifs.push({ type: 'succes', t, m }),
            erreur: (t, m) => notifs.push({ type: 'erreur', t, m }),
            info: (t, m) => notifs.push({ type: 'info', t, m }),
            avertissement: (t, m) => notifs.push({ type: 'avertissement', t, m })
        },
        echapperHtml: (s) => String(s),
        travauxStockage,
        travauxImport: { trouverEtudiantParDA: () => ({ prenom: 'Léa', nom: 'Tremblay' }) },
        obtenirConfigJetons: () => configJetons,
        verifierDisponibiliteJeton: () => jetonsRestants,
        // Le vrai `appliquerJetonReprise` refuse au-delà du maximum PAR
        // PRODUCTION, en silence quand `silencieux` est posé : on reproduit
        // exactement ce refus.
        appliquerJetonReprise: (evaluationId) => {
            const originale = evals.find(e => e.id === evaluationId);
            if (!originale) return null;
            const deja = evals.filter(e =>
                e.etudiantDA === originale.etudiantDA &&
                e.productionId === originale.productionId &&
                e.jetonRepriseApplique === true).length;
            if (deja >= maxParProduction) return null;
            const nouvelle = {
                id: 'EVAL_REPRISE_' + (jetonsAppliques.length + 1),
                etudiantDA: originale.etudiantDA,
                productionId: originale.productionId,
                repriseDeId: originale.id,
                jetonRepriseApplique: true
            };
            originale.remplaceeParId = nouvelle.id;
            evals = evals.concat([nouvelle]);
            jetonsAppliques.push(nouvelle.id);
            return nouvelle;
        }
    };

    const win = chargerScript('js/travaux-ui.js', globaux,
        { addEventListener: () => {}, removeEventListener: () => {} });

    return { win, notifs, jetonsAppliques, actifs, evaluations: () => evals };
}

const ORIGINALE = { id: 'EVAL_1', etudiantDA: DA, productionId: PRODUCTION, noteFinale: 55 };
const REPRISE_DEJA_ACCORDEE = {
    id: 'EVAL_2', etudiantDA: DA, productionId: PRODUCTION,
    repriseDeId: 'EVAL_1', jetonRepriseApplique: true
};
const FICHIER_REPRISE_NEUF = {
    id: 'F_NEUF', etudiantDA: DA, productionId: PRODUCTION,
    nomFichier: 'devoir-v3.pdf', estReprise: true, evaluationId: '',
    dateImport: '2026-08-30T12:00:00.000Z'
};

describe('#608 · le maximum par production, et le rattachement qui n\'est pas un jeton', () => {

    describe('la décision d\'offrir le bouton « Appliquer comme jeton de reprise »', () => {

        it('sous le maximum : le bouton est offert', () => {
            const { win } = monter({ evaluations: [ORIGINALE], maxParProduction: 2 });
            expect(win.travauxUI._jetonRepriseOffrable(DA, PRODUCTION)).toBe(true);
        });

        it('maximum PAR PRODUCTION atteint : le bouton n\'est PAS offert, même si l\'élève a des jetons', () => {
            const { win } = monter({
                evaluations: [ORIGINALE, REPRISE_DEJA_ACCORDEE],
                maxParProduction: 1,
                jetonsRestants: true   // il lui reste des jetons — c'est bien la production qui borne
            });
            expect(win.travauxUI._jetonRepriseOffrable(DA, PRODUCTION)).toBe(false);
        });

        it('le maximum se compte PAR PRODUCTION : une autre production reste offerte', () => {
            const { win } = monter({
                evaluations: [ORIGINALE, REPRISE_DEJA_ACCORDEE],
                maxParProduction: 1
            });
            expect(win.travauxUI._jetonRepriseOffrable(DA, 'PROD_AUTRE')).toBe(true);
        });

        it('plus aucun jeton disponible : le bouton n\'est pas offert non plus', () => {
            const { win } = monter({ evaluations: [ORIGINALE], maxParProduction: 3, jetonsRestants: false });
            expect(win.travauxUI._jetonRepriseOffrable(DA, PRODUCTION)).toBe(false);
        });
    });

    describe('le balayage post-import sépare les jetons des rattachements', () => {

        it('un jeton réellement accordé est compté comme jeton, et rien n\'est rattaché', async () => {
            const { win, jetonsAppliques } = monter({
                evaluations: [ORIGINALE],
                fichiers: [FICHIER_REPRISE_NEUF],
                maxParProduction: 2
            });

            const bilan = await win.travauxUI._appliquerJetonsReprisePostImport();

            expect(jetonsAppliques.length).toBe(1);
            expect(bilan.jetons).toBe(1);
            expect(bilan.rattaches).toEqual([]);
        });

        it('un fichier lié à une reprise DÉJÀ accordée est rattaché, PAS compté comme jeton', async () => {
            const { win, jetonsAppliques } = monter({
                evaluations: [ORIGINALE, REPRISE_DEJA_ACCORDEE],
                fichiers: [FICHIER_REPRISE_NEUF],
                maxParProduction: 1
            });

            const bilan = await win.travauxUI._appliquerJetonsReprisePostImport();

            expect(jetonsAppliques.length).toBe(0);      // aucun jeton consommé
            expect(bilan.jetons).toBe(0);                // et l'écran ne doit pas en annoncer
            expect(bilan.rattaches.length).toBe(1);
        });

        it('le fichier rattaché pointe bien la reprise existante', async () => {
            const { win, actifs } = monter({
                evaluations: [ORIGINALE, REPRISE_DEJA_ACCORDEE],
                fichiers: [FICHIER_REPRISE_NEUF],
                maxParProduction: 1
            });

            await win.travauxUI._appliquerJetonsReprisePostImport();

            expect(actifs.find(f => f.id === 'F_NEUF').evaluationId).toBe('EVAL_2');
        });

        it('le rattachement est ANNONCÉ, avec le nom de l\'élève', async () => {
            const { win, notifs } = monter({
                evaluations: [ORIGINALE, REPRISE_DEJA_ACCORDEE],
                fichiers: [FICHIER_REPRISE_NEUF],
                maxParProduction: 1
            });

            await win.travauxUI._appliquerJetonsReprisePostImport();

            const dits = notifs.map(n => String(n.t) + ' ' + String(n.m));
            expect(dits.some(s => /rattach/i.test(s) && /Léa Tremblay/.test(s))).toBe(true);
            // Et surtout : rien ne doit annoncer un jeton appliqué.
            expect(dits.some(s => /jeton.*appliqu/i.test(s))).toBe(false);
        });

        it('aucun fichier de reprise : bilan à zéro, forme stable', async () => {
            const { win } = monter({ evaluations: [ORIGINALE], fichiers: [] });
            const bilan = await win.travauxUI._appliquerJetonsReprisePostImport();
            expect(bilan).toEqual({ jetons: 0, rattaches: [] });
        });
    });
});
