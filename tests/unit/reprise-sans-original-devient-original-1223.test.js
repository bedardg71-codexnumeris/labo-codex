import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #1223 (entrée 6 bis de la file, 3 nov. 2026) — UNE COPIE REMISE AVEC UN
// JETON, QUAND L'ÉLÈVE N'A AUCUNE ÉVALUATION DE CETTE PRODUCTION, DEVIENT SON
// ORIGINAL (décision de Grégoire, 3 nov., 16 h 35).
//
// Le vecteur : le balayage post-import laissait ce fichier `estReprise: true`
// sans `evaluationId`. Au prochain import du groupe, il le retrouvait, trouvait
// l'évaluation faite entre-temps et lui appliquait un jeton EN SILENCE :
// l'original devenait une reprise, et un jeton était consommé.

const DA = '3333333';
const PRODUCTION = 'PROD_ARTEFACT_6';

function monter({ evaluations = [], fichiers = [] } = {}) {
    const actifs = fichiers.map(f => Object.assign({}, f));
    const notifs = [];
    const jetonsAppliques = [];
    let evals = evaluations.map(e => Object.assign({}, e));

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
        travauxImport: { trouverEtudiantParDA: () => ({ prenom: 'Zoé', nom: 'Lavoie' }) },
        obtenirConfigJetons: () => ({ actif: true, reprise: { nombre: 5, maxParProduction: 2, archiverOriginale: true } }),
        verifierDisponibiliteJeton: () => true,
        appliquerJetonReprise: (evaluationId) => {
            const originale = evals.find(e => e.id === evaluationId);
            if (!originale) return null;
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

    return {
        win, notifs, jetonsAppliques, actifs,
        evaluations: () => evals,
        evaluer: (e) => { evals = evals.concat([Object.assign({}, e)]); },
        importer: (f) => { actifs.push(Object.assign({}, f)); }
    };
}

const COPIE_AVEC_JETON = {
    id: 'F_COPIE', etudiantDA: DA, productionId: PRODUCTION,
    nomFichier: 'artefact6.pdf', estReprise: true, evaluationId: '',
    dateImport: '2026-11-03T21:20:00.000Z'
};

describe('#1223 · une copie remise avec un jeton, sans évaluation, devient l\'original', () => {

    it('sans évaluation : la copie quitte l\'état de reprise, aucun jeton n\'est consommé', async () => {
        const { win, actifs, jetonsAppliques } = monter({ fichiers: [COPIE_AVEC_JETON] });

        const bilan = await win.travauxUI._appliquerJetonsReprisePostImport();

        expect(actifs.find(f => f.id === 'F_COPIE').estReprise).toBe(false);
        expect(jetonsAppliques).toEqual([]);
        expect(bilan.jetons).toBe(0);
        expect(bilan.originaux).toEqual(['Zoé Lavoie']);
    });

    it('le message rouge « Jetons non appliqués » ne s\'affiche plus', async () => {
        const { win, notifs } = monter({ fichiers: [COPIE_AVEC_JETON] });
        await win.travauxUI._appliquerJetonsReprisePostImport();
        expect(notifs.filter(n => n.type === 'erreur')).toEqual([]);
    });

    it('le vecteur : évaluée puis un second import, l\'évaluation reste l\'originale et aucun jeton n\'est consommé', async () => {
        const { win, jetonsAppliques, evaluations, evaluer, importer } = monter({ fichiers: [COPIE_AVEC_JETON] });

        // 1. Import du lot avec jeton : l'élève n'a aucune évaluation.
        await win.travauxUI._appliquerJetonsReprisePostImport();
        // 2. Grégoire évalue la copie.
        evaluer({ id: 'EVAL_ORIGINALE', etudiantDA: DA, productionId: PRODUCTION, noteFinale: 72 });
        // 3. Un autre import dans le même groupe (un autre élève, une autre production).
        importer({ id: 'F_AUTRE', etudiantDA: '4444444', productionId: 'PROD_AUTRE', estReprise: false, evaluationId: '' });
        const bilan = await win.travauxUI._appliquerJetonsReprisePostImport();

        expect(jetonsAppliques).toEqual([]);
        expect(bilan.jetons).toBe(0);
        const originale = evaluations().find(e => e.id === 'EVAL_ORIGINALE');
        expect(originale.remplaceeParId).toBeUndefined();
        expect(evaluations().some(e => e.jetonRepriseApplique)).toBe(false);
    });

    it('toutes les copies de reprise de l\'élève pour cette production basculent, pas seulement la plus récente', async () => {
        const seconde = Object.assign({}, COPIE_AVEC_JETON, {
            id: 'F_COPIE_P2', nomFichier: 'artefact6-p2.pdf', dateImport: '2026-11-03T21:21:00.000Z'
        });
        const { win, actifs } = monter({ fichiers: [COPIE_AVEC_JETON, seconde] });

        await win.travauxUI._appliquerJetonsReprisePostImport();

        expect(actifs.filter(f => f.estReprise)).toEqual([]);
    });

    it('le stock : une copie déjà écrite comme reprise, évaluée AVANT le prochain import, devient l\'original sans jeton', async () => {
        // Écrite par l'ancien balayage le 3 nov. à 16 h 20 ; Grégoire l'évalue à 19 h ; un import suit.
        const { win, actifs, jetonsAppliques, evaluations } = monter({
            evaluations: [{ id: 'EVAL_FAITE_SUR_LA_COPIE', etudiantDA: DA, productionId: PRODUCTION,
                noteFinale: 72, dateEvaluation: '2026-11-04T00:00:00.000Z' }],
            fichiers: [COPIE_AVEC_JETON]
        });

        const bilan = await win.travauxUI._appliquerJetonsReprisePostImport();

        expect(jetonsAppliques).toEqual([]);
        expect(bilan.originaux).toEqual(['Zoé Lavoie']);
        expect(actifs.find(f => f.id === 'F_COPIE').estReprise).toBe(false);
        expect(evaluations().find(e => e.id === 'EVAL_FAITE_SUR_LA_COPIE').remplaceeParId).toBeUndefined();
    });

    it('une évaluation faite AVANT l\'import de la reprise reste l\'original : le jeton s\'applique', async () => {
        const { win, jetonsAppliques } = monter({
            evaluations: [{ id: 'EVAL_1', etudiantDA: DA, productionId: PRODUCTION,
                noteFinale: 55, dateEvaluation: '2026-10-20T15:00:00.000Z' }],
            fichiers: [COPIE_AVEC_JETON]
        });
        await win.travauxUI._appliquerJetonsReprisePostImport();
        expect(jetonsAppliques.length).toBe(1);
    });

    it('avec une évaluation existante, le jeton s\'applique toujours comme avant', async () => {
        const { win, actifs, jetonsAppliques } = monter({
            evaluations: [{ id: 'EVAL_1', etudiantDA: DA, productionId: PRODUCTION, noteFinale: 55 }],
            fichiers: [COPIE_AVEC_JETON]
        });

        const bilan = await win.travauxUI._appliquerJetonsReprisePostImport();

        expect(jetonsAppliques.length).toBe(1);
        expect(bilan.originaux).toEqual([]);
        expect(actifs.find(f => f.id === 'F_COPIE').estReprise).toBe(true);
    });
});
