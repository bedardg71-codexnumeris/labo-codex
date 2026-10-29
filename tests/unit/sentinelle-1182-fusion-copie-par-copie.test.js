import { describe, it, expect } from 'vitest';
import { chargerCodex } from './_helpers/charger-codex.js';

/**
 * #1182 (29 oct. 2026) — « Fusionner » réunit deux codex copie par copie.
 *
 * Le cas de Grégoire : le Mac et l'iPad évaluent chacun de leur côté depuis le même codex.
 * L'ancienne fusion décidait par clé entière, contre un ancêtre qui était le dernier codex de
 * L'APPAREIL : il contenait déjà les évaluations du Mac, le Mac se voyait « inchangé », et la
 * fusion prenait la liste de l'iPad sans annoncer de conflit. Les 3 évaluations du Mac
 * disparaissaient en silence.
 *
 * Ce banc juge la fonction pure (_analyserFusion → _valeurApresFusion) et l'écriture
 * (_ecrireLaFusion, dans la file de chaque clé). Noms fictifs.
 *
 * Break-tests intégrés : la décision par clé remise (le cas silencieux rougit) ; `.find`
 * remis dans l'import des fichiers (le cas du second trimestre rougit).
 */

const T = 'a2031';
const EVALS = T + '_evaluationsSauvegardees';
const ANNOTS = T + '_annotationsTravaux';
const COPIES = T + '_fichiersTravaux';
const CORBEILLE = T + '_corbeilleFichiers';
const CHRONO = T + '_chronoEvaluations';

const evaluation = (id, extra = {}) => ({
    id, etudiantDA: '9000001', etudiantNom: 'Alix Fictif', productionId: 'PROD_1',
    productionNom: 'Dissertation inventée', noteFinale: 70, dateModification: '2031-09-01T10:00:00Z', ...extra
});
const annotation = (id) => ({ id, fichierId: 'FT_' + id, etudiantDA: '9000001', productionId: 'PROD_1', pages: [] });
const copie = (id, extra = {}) => ({ id, etudiantDA: '9000002', productionId: 'PROD_1', nomFichier: id + '.pdf', ...extra });
const serie = (prefixe, n, fabrique) => Array.from({ length: n }, (_, i) => fabrique(prefixe + '_' + (i + 1)));

// L'ancêtre commun, puis chaque appareil : le Mac +3 évaluations, l'iPad +14.
const ANCETRE_EVALS = serie('EV_ancetre', 20, evaluation);
const ANCETRE_ANNOTS = serie('AN_ancetre', 10, annotation);
const MAC = {
    [EVALS]: ANCETRE_EVALS.concat(serie('EV_mac', 3, evaluation)),
    [ANNOTS]: ANCETRE_ANNOTS.concat(serie('AN_mac', 4, annotation))
};
const IPAD = {
    [EVALS]: ANCETRE_EVALS.concat(serie('EV_ipad', 14, evaluation)),
    [ANNOTS]: ANCETRE_ANNOTS.concat(serie('AN_ipad', 14, annotation))
};

/** La valeur d'une clé après la fusion (ce qui serait écrit, sinon la valeur d'ici). */
function apres(Codex, local, externe, cle, choix = {}, options = {}) {
    const analyse = Codex._analyserFusion(local, externe, options);
    const v = Codex._valeurApresFusion(cle, local[cle] === undefined ? null : local[cle], externe, analyse, choix, {});
    return v === undefined ? local[cle] : v;
}

const Codex = chargerCodex().Codex;

describe('#1182 — le cas du Mac et de l\'iPad', () => {
    it('ancêtre + 3 ici + 14 là-bas : 37 évaluations, 38 annotations, aucun conflit', () => {
        const analyse = Codex._analyserFusion(MAC, IPAD);
        expect(analyse.conflits).toEqual([]);
        expect(analyse.ajouts[EVALS].map((e) => e.id)).toEqual(serie('EV_ipad', 14, (id) => id));
        expect(apres(Codex, MAC, IPAD, EVALS).length).toBe(20 + 3 + 14);
        expect(apres(Codex, MAC, IPAD, ANNOTS).length).toBe(10 + 4 + 14);
    });

    it('le cas silencieux d\'avant : les 3 évaluations d\'ici restent, quel que soit le dernier codex de l\'appareil', () => {
        // L'ancienne fusion lisait un ancêtre égal au dernier état d'ici : elle n'en lit plus.
        const ids = apres(Codex, MAC, IPAD, EVALS).map((e) => e.id);
        serie('EV_mac', 3, (id) => id).forEach((id) => expect(ids).toContain(id));
    });

    it('l\'ordre : celui d\'ici, puis les ajouts de l\'autre', () => {
        const ids = apres(Codex, MAC, IPAD, EVALS).map((e) => e.id);
        expect(ids.slice(0, 23)).toEqual(MAC[EVALS].map((e) => e.id));
        expect(ids.slice(23)).toEqual(serie('EV_ipad', 14, (id) => id));
    });

    it('la fin dit ce qui est entré, en mots d\'utilisateur', () => {
        const analyse = Codex._analyserFusion(MAC, IPAD);
        const fin = Codex._direLaFinDeLaFusion('Codex de l\'iPad', analyse, IPAD, {}, { importes: 0, erreurs: [] }, false);
        expect(fin).toContain('14 évaluations et 14 annotations venues de l\'autre codex.');
        expect(fin).not.toMatch(/a2031_|evaluationsSauvegardees/);
    });

    it('break-test : la décision par clé remise, une des deux séries disparaît (rouge attendu)', () => {
        const SITE = 'if (_estListeAId(valeurIci) && _estListeAId(externe[nomCle])) {';
        const ParCle = chargerCodex(null, {}, (s) => {
            expect(s, 'le site du break-test existe').toContain(SITE);
            return s.replace(SITE, 'if (false) {');
        }).Codex;
        const analyse = ParCle._analyserFusion(MAC, IPAD);
        expect(analyse.conflits).toContainEqual({ cle: EVALS });
        // Prendre l'autre pour la clé entière : les 3 du Mac partent.
        const pris = apres(ParCle, MAC, IPAD, EVALS, { [EVALS]: 'externe' });
        expect(pris.length).toBe(34);
        expect(pris.map((e) => e.id)).not.toContain('EV_mac_1');
    });
});

describe('#1182 — un élément, pas une clé', () => {
    const local = { [EVALS]: [evaluation('EV_1'), evaluation('EV_2', { noteFinale: 60 })] };
    const externe = { [EVALS]: [evaluation('EV_1'), evaluation('EV_2', { noteFinale: 85 })] };

    it('un même id différent des deux côtés : le conflit de CET élément', () => {
        expect(Codex._analyserFusion(local, externe).conflits).toEqual([{ cle: EVALS, id: 'EV_2' }]);
    });

    it('sans choix, la version d\'ici ; tranché pour l\'autre, la sienne, à sa place', () => {
        expect(apres(Codex, local, externe, EVALS)[1].noteFinale).toBe(60);
        const pris = apres(Codex, local, externe, EVALS, { [EVALS + '\nEV_2']: 'externe' });
        expect(pris.map((e) => e.id)).toEqual(['EV_1', 'EV_2']);
        expect(pris[1].noteFinale).toBe(85);
    });

    it('le même objet écrit dans un autre ordre n\'est pas un conflit', () => {
        const melange = { [EVALS]: [evaluation('EV_1'), Object.fromEntries(Object.entries(evaluation('EV_2', { noteFinale: 60 })).reverse())] };
        expect(Codex._analyserFusion(local, melange).conflits).toEqual([]);
    });

    it('rien n\'est effacé : un élément ou une clé d\'ici seulement est gardé', () => {
        const ici = { [EVALS]: [evaluation('EV_seul_ici')], [T + '_brouillon']: { x: 1 } };
        const analyse = Codex._analyserFusion(ici, { [EVALS]: [] });
        expect(Codex._clesAEcrire(analyse, {})).toEqual([]);
    });

    it('une valeur simple différente des deux côtés est montrée, jamais prise en silence', () => {
        const analyse = Codex._analyserFusion({ [T + '_reglage']: { a: 1 } }, { [T + '_reglage']: { a: 2 } });
        expect(analyse.conflits).toEqual([{ cle: T + '_reglage' }]);
        expect(Codex._clesAEcrire(analyse, {})).toEqual([]);
    });
});

describe('#1182 — les familles de clés', () => {
    it('les valeurs calculées ne viennent ni d\'ici ni de l\'autre : recalculées', () => {
        const analyse = Codex._analyserFusion({ [T + '_indicesCP']: { a: 1 } }, { [T + '_indicesCP']: { a: 2 }, indicesAssiduite: {} });
        expect(analyse.calculees.sort()).toEqual([T + '_indicesCP', 'indicesAssiduite'].sort());
        expect(Codex._clesAEcrire(analyse, {})).toEqual([]);
    });

    it('les réglages de l\'appareil et les clés internes gardent la valeur d\'ici, sans question', () => {
        const analyse = Codex._analyserFusion(
            { elementsMasques: ['a'], 'monitorage-version-vue': '1.0' },
            { elementsMasques: ['b'], 'monitorage-version-vue': '2.0', _copiesAuxArchives: { h2031: { ids: {} } }, migration_x_done: true });
        expect(analyse.conflits).toEqual([]);
        expect(analyse.importees).toEqual([]);
        expect(analyse.appareil.sort()).toEqual(['_copiesAuxArchives', 'elementsMasques', 'migration_x_done', 'monitorage-version-vue']);
    });

    it('le chronomètre : union par le contenu, puis la règle de son écrivain (200, par date)', () => {
        const entree = (i) => ({ dureeMs: i, date: '2031-09-' + String(1 + (i % 28)).padStart(2, '0') + 'T' + String(i).padStart(6, '0'), productionId: 'P' });
        const communs = Array.from({ length: 190 }, (_, i) => entree(i));
        const ici = communs.concat([entree(500), entree(501), entree(502)]);
        const labas = communs.concat(Array.from({ length: 14 }, (_, i) => entree(600 + i)));
        const valeur = apres(Codex, { [CHRONO]: ici }, { [CHRONO]: labas }, CHRONO);
        expect(valeur.length).toBe(200);
        const dates = valeur.map((e) => e.date);
        expect(dates).toEqual(dates.slice().sort());
        expect(Codex._analyserFusion({ [CHRONO]: ici }, { [CHRONO]: labas }).conflits).toEqual([]);
    });
});

describe('#1182 — les copies', () => {
    it('une copie aux archives ici ne vient pas de l\'autre, ni sa fiche ni sa vignette', () => {
        const local = { [COPIES]: [copie('FT_a')] };
        const externe = { [COPIES]: [copie('FT_a'), copie('FT_arch'), copie('FT_neuve')], thumbnail_FT_arch: 'data:x', thumbnail_FT_neuve: 'data:y' };
        const analyse = Codex._analyserFusion(local, externe, { auxArchives: { FT_arch: true } });
        expect(analyse.ajouts[COPIES].map((e) => e.id)).toEqual(['FT_neuve']);
        expect(analyse.importees).toEqual(['thumbnail_FT_neuve']);
        expect(Object.keys(Codex._copiesPrisesDeLAutre(analyse, {}))).toEqual(['FT_neuve']);
        expect(analyse.auxArchives).toBe(2);
    });

    it('à la corbeille d\'un côté, dans les travaux de l\'autre : à la corbeille', () => {
        const local = { [COPIES]: [copie('FT_garde'), copie('FT_jetee_labas')], [CORBEILLE]: [copie('FT_jetee_ici')] };
        const externe = { [COPIES]: [copie('FT_garde'), copie('FT_jetee_ici')], [CORBEILLE]: [copie('FT_jetee_labas')] };
        const analyse = Codex._analyserFusion(local, externe);
        expect(analyse.conflits).toEqual([]);
        expect(apres(Codex, local, externe, COPIES).map((e) => e.id)).toEqual(['FT_garde']);
        expect(apres(Codex, local, externe, CORBEILLE).map((e) => e.id).sort()).toEqual(['FT_jetee_ici', 'FT_jetee_labas']);
        const cles = Codex._clesAEcrire(analyse, {});
        expect(cles.indexOf(CORBEILLE)).toBeLessThan(cles.indexOf(COPIES));
    });

    it('une copie prise de l\'autre dont le fichier n\'est pas venu est écrite « manquante »', () => {
        const local = { [COPIES]: [] };
        const externe = { [COPIES]: [copie('FT_x', { blobStatut: 'stocke' })] };
        const analyse = Codex._analyserFusion(local, externe);
        const v = Codex._valeurApresFusion(COPIES, [], externe, analyse, {}, { FT_x: true });
        expect(v[0].blobStatut).toBe('manquant');
        expect(externe[COPIES][0].blobStatut).toBe('stocke');
    });
});

describe('#1182 — les fichiers de toutes les listes, tous trimestres', () => {
    const DEUX_TRIMESTRES = {
        a2030_fichiersTravaux: [copie('FT_premier', { etudiantDA: '9000001', productionId: 'P_A' })],
        a2031_fichiersTravaux: [copie('FT_second', { etudiantDA: '9000002', productionId: 'P_B' })]
    };
    function monter(transformer) {
        const stockes = [];
        const C = chargerCodex(null, {
            travauxStockage: { stockerBlob: async (id, blob, da, prod) => { stockes.push({ id, da, prod }); } },
            travauxImport: { validerMagicBytes: async () => true }
        }, transformer).Codex;
        return { C, stockes };
    }
    const zip = { file: (ch) => ({ async: async () => 'octets de ' + ch }) };

    it('la copie du second trimestre est stockée avec son élève et sa production', async () => {
        const { C, stockes } = monter();
        const stats = await C._fusionnerTravaux(zip, DEUX_TRIMESTRES, ['travaux/FT_second.pdf']);
        expect(stats.importes).toBe(1);
        expect(stats.manquants).toEqual({});
        expect(stockes).toEqual([{ id: 'FT_second', da: '9000002', prod: 'P_B' }]);
    });

    it('break-test : `.find` remis, la fiche du second trimestre n\'est plus lue (rouge attendu)', async () => {
        const SITE = '_clesDesListesDeFichiers(Object.keys(donneesExternes), LISTES_DE_FICHIERS).forEach(function(c) {';
        const { C, stockes } = monter((s) => {
            expect(s, 'le site du break-test existe').toContain(SITE);
            return s.replace(SITE,
                '[{ cle: Object.keys(donneesExternes).find(function(c) { return c.includes(\'fichiersTravaux\'); }) }].forEach(function(c) {');
        });
        await C._fusionnerTravaux(zip, DEUX_TRIMESTRES, ['travaux/FT_second.pdf']);
        expect(stockes).toEqual([{ id: 'FT_second', da: '', prod: '' }]);
    });

    it('une copie ajoutée au second trimestre est une copie prise de l\'autre', () => {
        const local = { a2030_fichiersTravaux: DEUX_TRIMESTRES.a2030_fichiersTravaux, a2031_fichiersTravaux: [] };
        const analyse = Codex._analyserFusion(local, DEUX_TRIMESTRES);
        expect(Object.keys(Codex._copiesPrisesDeLAutre(analyse, {}))).toEqual(['FT_second']);
    });
});

describe('#1182 — l\'écriture, dans la file de chaque clé', () => {
    it('un geste fait pendant la fusion n\'est pas écrasé', async () => {
        const base = new Map(Object.entries(JSON.parse(JSON.stringify(MAC))));
        const appels = [];
        const db = {
            ready: true, init: async () => {}, get: async () => null, set: async () => {}, remove: async () => {},
            keys: async () => [], getSync: () => null, setSync: () => {},
            modifier: async (cle, mutateur, defaut) => {
                appels.push(cle);
                // Une évaluation enregistrée entre l'analyse et l'écriture.
                if (cle === EVALS) base.set(cle, base.get(cle).concat([evaluation('EV_pendant')]));
                const r = await mutateur(base.has(cle) ? base.get(cle) : defaut);
                if (r !== undefined) base.set(cle, r);
                return r;
            }
        };
        const C = chargerCodex(db).Codex;
        const analyse = C._analyserFusion(MAC, IPAD);
        const ecrites = await C._ecrireLaFusion(analyse, IPAD, {}, {});
        expect(ecrites).toBe(2);
        expect(appels.sort()).toEqual([ANNOTS, EVALS].sort());
        expect(base.get(EVALS).length).toBe(20 + 3 + 1 + 14);
        expect(base.get(EVALS).map((e) => e.id)).toContain('EV_pendant');
    });

    it('après l\'écriture, les indices sont recalculés par leur module', () => {
        const win = chargerCodex();
        let appele = 0;
        win.calculerEtSauvegarderIndicesAssiduite = () => { appele++; };
        expect(win.Codex._recalculerApresFusion()).toBe(true);
        expect(appele).toBe(1);
    });
});
