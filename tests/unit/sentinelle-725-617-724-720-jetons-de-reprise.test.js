import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Lot « les jetons de reprise ne mentent plus » (13 sept. 2026) — #725, #617, #724, #720.
//
// GESTE 1 · retirerJetonReprise. `sauvegarderDonneesSelonMode` rendait trois refus : `false`
// (anonymisation), `'quota'` et `'error'` (l'écriture a levé) — les deux derniers truthy. Depuis
// le lot B de l'enregistrement (27 sept. 2026), un seul : `false`, et c'est la fonction qui dit
// l'échec par le témoin commun, avec le geste reçu en option.
// Avant : « Originale restaurée » était notifié (#725) et le fichier de la reprise mis à la
// corbeille (#617) AVANT l'écriture ; sur `'quota'`/`'error'`, le refus passait même pour un succès.
//
// GESTE 2 · appliquerJetonReprise. Avant : aucune garde sur une évaluation déjà remplacée ou
// réconciliée (#724), et la reprise recopiait tout l'état de l'originale — le délai accordé (un
// second jeton au quota, #720), `remplaceeParId`/`archivee` (exclue de la note), la marque de
// réconciliation.
//
// Ces essais TARISSENT la source ; le stock déjà écrit chez les gens n'est pas touché.
//
// Relecture croisée de Cowork (13 sept.) : l'essai « déjà remplacée » passait pour la MAUVAISE
// raison (la limite `maxParProduction` répondait à la place de la garde) — il monte désormais une
// originale remplacée SANS reprise concurrente et vérifie le titre « Conflit » ; l'essai du
// déliement sur écriture ACCEPTÉE manquait ; une assertion sur le magasin, que le harnais rend
// invariant sur un refus, ne pouvait pas rougir — retirée.

const DA = '1111111';
const P = 'PROD_1';
const REFUS = [false];

function creerStockage(fichiers) {
    const actifs = fichiers.map(f => Object.assign({}, f));
    const corbeille = [];
    return {
        _actifs: actifs, _corbeille: corbeille,
        obtenirFichiersTravaux: () => actifs,
        mettreAJourFichier: (id, modifs) => { const f = actifs.find(x => x.id === id); if (!f) return false; Object.assign(f, modifs); return true; },
        deplacerEnCorbeille: (id) => { const i = actifs.findIndex(f => f.id === id); if (i === -1) return false; corbeille.push(actifs[i]); actifs.splice(i, 1); return true; }
    };
}

/** evaluation-jetons.js RÉEL ; configuration des jetons = défauts du module (délai 2/élève, reprise 2, 1 par production). */
function monter({ evaluations, fichiers = [], retourEcriture = true }) {
    const stores = { evaluationsSauvegardees: evaluations.map(e => JSON.parse(JSON.stringify(e))) };
    const travauxStockage = creerStockage(fichiers);
    const notifs = [];
    const gestes = [];
    const globaux = {
        db: { getSync: (k, d) => (k in stores ? JSON.parse(JSON.stringify(stores[k])) : (d !== undefined ? d : null)), setSync: () => {}, get: async () => null, set: async () => {} },
        cle: (k) => k,
        obtenirDonneesSelonMode: (k) => stores[k],
        // Le faux magasin rend le refus de `modes.js` et n'écrit que sur `true`.
        sauvegarderDonneesSelonMode: (k, v, options) => { gestes.push(options && options.geste); if (retourEcriture !== true) return retourEcriture; stores[k] = v; return true; },
        notifications: {
            succes: (t, m) => notifs.push({ type: 'succes', t, m }), erreur: (t, m) => notifs.push({ type: 'erreur', t, m }),
            info: () => {}, avertissement: () => {}
        },
        confirm: () => true,
        genererIdUnique: (p) => p + 'NEUF',
        travauxStockage
    };
    const win = chargerScript('js/evaluation-jetons.js', globaux);
    return { win, stores, travauxStockage, notifs, gestes };
}

const ORIGINALE = { id: 'EVAL_A', etudiantDA: DA, productionId: P, noteFinale: 60,
    remplaceeParId: 'EVAL_B', dateRemplacement: '2026-09-01', archivee: true, dateArchivage: '2026-09-01' };
const REPRISE = { id: 'EVAL_B', etudiantDA: DA, productionId: P, noteFinale: 80,
    repriseDeId: 'EVAL_A', jetonRepriseApplique: true, dateApplicationJetonReprise: '2026-09-01' };
const F_REPRISE = { id: 'F_REPR', etudiantDA: DA, productionId: P, evaluationId: 'EVAL_B', estReprise: true };

describe('Geste 1 · retirer une reprise : sur un refus d\'écriture, rien ne bouge et rien ne ment (#725, #617)', () => {
    // Les deux portes : décocher sur la REPRISE (EVAL_B), ou restaurer depuis l'ORIGINALE (EVAL_A).
    for (const porte of ['EVAL_B', 'EVAL_A']) {
        for (const refus of REFUS) {
            it(`porte ${porte}, retour ${JSON.stringify(refus)} : false, aucune notification propre (le témoin dit l'échec, avec le geste), aucun fichier déplacé`, async () => {
                const b = monter({ evaluations: [ORIGINALE, REPRISE], fichiers: [F_REPRISE], retourEcriture: refus });
                expect(await b.win.retirerJetonReprise(porte)).toBe(false);
                expect(b.notifs).toEqual([]);
                expect(b.gestes).toEqual(['Retrait du jeton de reprise']);
                expect(b.travauxStockage._corbeille).toEqual([]);
                expect(b.travauxStockage._actifs.map(f => f.id)).toEqual(['F_REPR']);
            });
        }
        it(`porte ${porte}, écriture acceptée : succès annoncé APRÈS, fichier de reprise à la corbeille, compte dit`, async () => {
            const b = monter({ evaluations: [ORIGINALE, REPRISE], fichiers: [F_REPRISE] });
            expect(await b.win.retirerJetonReprise(porte)).toBe(true);
            expect(b.notifs.map(n => n.type)).toEqual(['succes']);
            expect(b.notifs[0].t).toMatch(/originale restaurée/i);
            expect(b.notifs[0].t).toMatch(/1 fichier\(s\) de reprise mis à la corbeille/);
            expect(b.travauxStockage._corbeille.map(f => f.id)).toEqual(['F_REPR']);
            expect(b.stores.evaluationsSauvegardees.map(e => e.id)).toEqual(['EVAL_A']);
        });
    }

    it('le point de persistance rend un BOOLÉEN et passe le geste au témoin (retirerJetonDelai)', () => {
        const b = monter({ evaluations: [{ id: 'E1', etudiantDA: DA, productionId: P, jetonDelaiApplique: true }], retourEcriture: false });
        expect(b.win.retirerJetonDelai('E1')).toBe(false);
        expect(b.notifs).toEqual([]);
        expect(b.gestes).toEqual(['Retrait du jeton de délai']);
    });
});

describe('Geste 2 · accorder une reprise : garde d\'entrée (#724) et reprise née propre (#720)', () => {
    it('une évaluation déjà remplacée est refusée PAR LA GARDE (« Conflit »), rien d\'écrit', async () => {
        // Aucune reprise concurrente sur cette production : la limite `maxParProduction` (défaut 1)
        // ne peut pas répondre à la place de la garde. Le titre départage les deux refus.
        const b = monter({ evaluations: [{ id: 'EVAL_A', etudiantDA: DA, productionId: P, noteFinale: 60,
            remplaceeParId: 'EVAL_AILLEURS', archivee: true }] });
        expect(await b.win.appliquerJetonReprise('EVAL_A')).toBeNull();
        expect(b.stores.evaluationsSauvegardees.map(e => e.id)).toEqual(['EVAL_A']);
        expect(b.notifs.map(n => n.type + ':' + n.t)).toEqual(['erreur:Conflit']);
    });

    it('un doublon réconcilié (#360) est refusé PAR LA GARDE (« Conflit »), même sans `remplaceeParId`', async () => {
        const b = monter({ evaluations: [{ id: 'EVAL_D', etudiantDA: DA, productionId: P, noteFinale: 70, reconcilieParDoublon: true }] });
        expect(await b.win.appliquerJetonReprise('EVAL_D')).toBeNull();
        expect(b.stores.evaluationsSauvegardees).toHaveLength(1);
        expect(b.notifs.map(n => n.type + ':' + n.t)).toEqual(['erreur:Conflit']);
    });

    it('la reprise naît SANS délai, remplacement, archivage, réconciliation ni reprise ciblée hérités ; la note est conservée', async () => {
        const origine = { id: 'EVAL_O', etudiantDA: DA, productionId: P, noteFinale: 55,
            jetonDelaiApplique: true, dateApplicationJetonDelai: '2026-09-02', delaiAccorde: true, dureeDelaiJours: 2,
            jetonRepriseCibleeApplique: true, archivee: true, dateArchivage: '2026-09-02' };
        const b = monter({ evaluations: [origine] });
        const r = await b.win.appliquerJetonReprise('EVAL_O', true, { silencieux: true });
        expect(r).not.toBeNull();
        for (const champ of ['jetonDelaiApplique', 'dateApplicationJetonDelai', 'delaiAccorde', 'dureeDelaiJours',
            'jetonRepriseCibleeApplique', 'remplaceeParId', 'dateRemplacement', 'archivee', 'dateArchivage', 'reconcilieParDoublon']) {
            expect(r[champ], champ).toBeUndefined();
        }
        expect(r.noteFinale).toBe(55);
        expect(r.repriseDeId).toBe('EVAL_O');
        expect(r.jetonRepriseApplique).toBe(true);
        // L'originale, elle, garde son délai : c'est le jeton réellement accordé.
        const o = b.stores.evaluationsSauvegardees.find(e => e.id === 'EVAL_O');
        expect(o.jetonDelaiApplique).toBe(true);
        expect(o.remplaceeParId).toBe(r.id);
    });

    it('quota de délais compté juste après une reprise : 1 utilisé sur 2, un nouveau délai reste possible ailleurs', async () => {
        const b = monter({ evaluations: [
            { id: 'EVAL_O', etudiantDA: DA, productionId: P, noteFinale: 55, jetonDelaiApplique: true, delaiAccorde: true },
            { id: 'EVAL_X', etudiantDA: DA, productionId: 'PROD_2', noteFinale: 70 }
        ] });
        await b.win.appliquerJetonReprise('EVAL_O', true, { silencieux: true });
        expect(b.win.compterJetonsUtilises(DA, 'delai')).toBe(1);   // avant #720 : 2
        expect(b.win.verifierDisponibiliteJeton(DA, 'delai')).toBe(true);
        expect(b.win.appliquerJetonDelai('EVAL_X')).toBe(true);
    });

    const F_ORIG_LIE = { id: 'F_ORIG', etudiantDA: DA, productionId: P, evaluationId: 'EVAL_O', estReprise: false };

    for (const refus of REFUS) {
        it(`originale supprimée (archiverOriginale: false), retour ${JSON.stringify(refus)} : le fichier de l'originale n'est PAS délié`, async () => {
            const b = monter({ evaluations: [{ id: 'EVAL_O', etudiantDA: DA, productionId: P, noteFinale: 55 }],
                fichiers: [F_ORIG_LIE], retourEcriture: refus });
            expect(await b.win.appliquerJetonReprise('EVAL_O', false, { silencieux: true })).toBeNull();
            expect(b.travauxStockage._actifs[0].evaluationId).toBe('EVAL_O');
        });
    }

    it('originale supprimée (archiverOriginale: false), écriture ACCEPTÉE : le fichier de l\'originale EST délié, pas jeté', async () => {
        const b = monter({ evaluations: [{ id: 'EVAL_O', etudiantDA: DA, productionId: P, noteFinale: 55 }], fichiers: [F_ORIG_LIE] });
        expect(await b.win.appliquerJetonReprise('EVAL_O', false, { silencieux: true })).not.toBeNull();
        expect(b.travauxStockage._actifs.map(f => [f.id, f.evaluationId])).toEqual([['F_ORIG', '']]);
        expect(b.travauxStockage._corbeille).toEqual([]);
    });
});
