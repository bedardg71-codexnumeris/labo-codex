/**
 * SENTINELLE #871 (volet assiduité) — LE POURCENTAGE SUIT LA FRACTION.
 *
 * Audit du module « profil de l'élève », 15 septembre 2026. `obtenirDetailsAssiduite` arrondissait les
 * périodes pour les afficher, alors que l'indice A est calculé sur les valeurs non arrondies et que la
 * saisie accepte les demi-périodes : sur 22,5 / 25, le profil et le rapport écrivaient
 * « 90% (23 / 25 périodes) », or 23 / 25 = 92 %. Tranché par Grégoire le 15 sept. au soir : « le
 * pourcentage doit suivre la fraction » — il veut lire « 90 % (22,5 / 25) ».
 *
 * Ce banc exécute LA CHAÎNE RÉELLE : `calculerAssiduite` (indices.js) calcule sur des présences saisies,
 * son résultat est stocké comme le fait la saisie (`indicesAssiduite.sommatif`), `obtenirDetailsAssiduite`
 * (sections-affichage.js) le relit, `genererRapportAPI` (rapport.js) l'écrit avec
 * `formaterNombrePeriodes` (helpers.js). Les deux sites HTML du profil sont gardés ici par un verrou
 * structurel, et joués dans WebKit par tests/integration/profil-871-assiduite-demi-periode.spec.js.
 *
 * Break-tests attendus : `Math.round` remis dans `obtenirDetailsAssiduite` → (b) rougit ; point décimal
 * dans le formateur → (a) et (b) ; `toFixed(1)` (« 23,0 ») → (a) et (c) ; un site qui interpole le nombre
 * brut → (e), site par site ; arrondi du dénominateur remis → (b2). Onze mutations jouées le 17 sept.,
 * onze rouges (la dixième était verte au premier jet : (b2) est née de là).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DA = '2000001';
const DATES = ['2026-09-01', '2026-09-03', '2026-09-08', '2026-09-10', '2026-09-15'];   // 5 séances de 5 périodes = 25

function monter(periodesParDate, periodesParSeance = 5) {
    const presences = [];
    DATES.forEach((date, i) => {
        if (periodesParDate[i] === undefined) return;
        presences.push({ da: DA, date, periodesPresentes: periodesParDate[i] });
    });
    const store = {
        test_groupeEtudiants: [{ da: DA, nom: 'Assidu', prenom: 'Alice', groupe: '01' }],
        test_presences: presences, test_productions: [], test_evaluationsSauvegardees: [], test_indicesAssiduite: {}
    };
    const copie = (v) => JSON.parse(JSON.stringify(v));
    const db = { getSync: (k, d) => (k in store ? copie(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = copie(v); }, get: async () => null, set: async () => {} };
    const seancesCompletes = periodesParDate.length ? Object.fromEntries(DATES.map(d => [d, [{ nombrePeriodes: periodesParSeance }]])) : {};
    const socle = {
        db, cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: (k) => copie(store['test_' + k] || []),
        obtenirSeancesCompletes: () => seancesCompletes,
        obtenirNombrePeriodesSeance: (d) => (seancesCompletes[d] || []).reduce((n, s) => n + (s.nombrePeriodes || 0), 0),
        obtenirSeancesHoraire: () => [], obtenirDureePeriode: () => 50
    };

    // 1. LE CALCUL RÉEL de l'indice, stocké comme la saisie le stocke.
    const winIndices = chargerScript('js/indices.js', socle);
    const calcul = winIndices.calculerAssiduite(DA, '2026-09-30');
    if (periodesParDate.length) store.test_indicesAssiduite = { sommatif: { [DA]: calcul } };

    // 2. LE FORMATEUR RÉEL et le LECTEUR RÉEL du profil.
    const winHelpers = chargerScript('js/profil-etudiant-helpers.js', socle);
    const winSections = chargerScript('js/profil-etudiant-sections-affichage.js', socle);

    // 3. LE RAPPORT RÉEL, branché sur les deux (les noms nus d'une IIFE résolvent aux globaux du banc).
    const win = { addEventListener() {}, removeEventListener() {} };
    chargerPredicatsCopie(win);
    chargerScript('js/profil-etudiant-rapport.js', Object.assign({}, socle, {
        calculerTousLesIndices: () => ({ A: calcul.indice === null ? null : Math.round(calcul.indice * 100), C: 0, P: 0, noteConstructible: false }),   // #743 : null reste null
        obtenirDetailsAssiduite: winSections.obtenirDetailsAssiduite,
        formaterNombrePeriodes: winHelpers.formaterNombrePeriodes,
        // Volet complétion de #871 : le rapport lit le détail de la pratique (portfolio.js) ; ce banc ne juge que l'assiduité.
        obtenirDetailsCompletion: () => null, evaluationEntreDansLaNote: win.evaluationEntreDansLaNote,
        calculerEtStockerIndicesCP() {}, estModeeLectureSeule: () => false
    }), win);
    const ligne = String(win.genererRapportAPI(DA, { assiduite: true })).split('\n').find(l => l.startsWith('Assiduité')) || null;
    return { calcul, details: winSections.obtenirDetailsAssiduite(DA), ligne, formater: winHelpers.formaterNombrePeriodes };
}

describe('#871 · assiduité : le pourcentage suit la fraction', () => {
    it('(a) le formateur : une demi-période s\'écrit avec une virgule, un entier reste un entier', () => {
        const { formater } = monter([5, 5, 5, 5, 5]);
        expect(formater(22.5)).toBe('22,5');
        expect(formater(23)).toBe('23');
        expect(formater(0)).toBe('0');
        expect(formater(0.5)).toBe('0,5');
        expect(formater(0.1 + 0.2)).toBe('0,3');          // bruit binaire d'une somme
        expect(formater(22.4999999999)).toBe('22,5');
        expect(formater(undefined)).toBe('0');
        expect(formater(null)).toBe('0');
        expect(formater('abc')).toBe('0');
    });

    it('(b) 22,5 / 25 : l\'indice réel dit 90, le lecteur du profil rend 22.5 sans l\'arrondir, le rapport écrit « 90% (22,5 / 25 périodes) »', () => {
        const r = monter([5, 5, 5, 5, 2.5]);
        expect(r.calcul.periodesPresentes).toBe(22.5);
        expect(r.calcul.periodesOffertes).toBe(25);
        expect(r.details.periodesPresentes).toBe(22.5);
        expect(r.details.periodesOffertes).toBe(25);
        expect(r.ligne).toBe('Assiduité : 90\u00A0% (22,5 / 25 périodes)');
        // Ce que la fraction affichée donne, recalculé à la main, EST le pourcentage affiché.
        expect(Math.round(22.5 / 25 * 100)).toBe(90);
    });

    it('(b2) le dénominateur non plus n\'est pas arrondi : des séances de 2,5 périodes → « 88% (11 / 12,5 périodes) »', () => {
        const r = monter([2.5, 2.5, 2.5, 2.5, 1], 2.5);
        expect(r.details.periodesOffertes).toBe(12.5);
        expect(r.ligne).toBe('Assiduité : 88\u00A0% (11 / 12,5 périodes)');
    });

    it('(c) 23 / 25 : « 92% (23 / 25 périodes) », sans décimale', () => {
        const r = monter([5, 5, 5, 5, 3]);
        expect(r.ligne).toBe('Assiduité : 92\u00A0% (23 / 25 périodes)');
    });

    it('(d) 0 / 0 et l\'élève sans aucune donnée gardent leur écriture « (0 / 0 périodes) » — et l\'assiduité inconnue s\'écrit d\'un tiret (#743 ; avant : 100%)', () => {
        const sansSeance = monter([]);                       // aucune séance au calendrier, rien de stocké
        expect(sansSeance.details).toMatchObject({ periodesPresentes: 0, periodesOffertes: 0, nombreSeances: 0 });
        expect(sansSeance.calcul.indice).toBeNull();
        expect(sansSeance.ligne).toBe('Assiduité : — (0 / 0 périodes)');
    });

    it('(e) verrou structurel : dans js/, aucune interpolation n\'écrit un nombre de périodes du profil sans `formaterNombrePeriodes`, et il n\'a qu\'UNE définition', () => {
        const fichiers = ['js/profil-etudiant-sections-affichage.js', 'js/profil-etudiant-rapport.js'];
        const NOMS = /\$\{\s*(?:details|detailsA|abs)?\.?(periodesPresentes|periodesOffertes|periodesManquees|periodesPresence)\s*\}/g;
        const bruts = [];
        let sitesFormates = 0;
        fichiers.forEach(f => {
            readFileSync(path.join(RACINE, f), 'utf8').split('\n').forEach((l, i) => {
                if (NOMS.test(l)) bruts.push(`${f}:${i + 1}`);
                NOMS.lastIndex = 0;
                sitesFormates += (l.match(/\$\{formaterNombrePeriodes\(/g) || []).length;
            });
        });
        expect(bruts).toEqual([]);
        // Compte figé : 2 (méthodologie) + 2 (statistiques) + 2 (pastilles d'absence) + 4 (deux sections sans appelant) + 2 (rapport).
        expect(sitesFormates).toBe(12);
        const definitions = [];
        ['js/profil-etudiant-helpers.js', ...fichiers].forEach(f => {
            const n = (readFileSync(path.join(RACINE, f), 'utf8').match(/function formaterNombrePeriodes\s*\(/g) || []).length;
            if (n) definitions.push(`${f} × ${n}`);
        });
        expect(definitions).toEqual(['js/profil-etudiant-helpers.js × 1']);
        // Et le lecteur ne contient plus d'arrondi des périodes.
        const src = readFileSync(path.join(RACINE, 'js/profil-etudiant-sections-affichage.js'), 'utf8');
        const debut = src.indexOf('function obtenirDetailsAssiduite(da)');
        const fin = src.indexOf('\nfunction ', debut + 10);
        const corps = src.slice(debut, fin > debut ? fin : undefined);
        expect(corps.length).toBeGreaterThan(500);           // la tranche n'est pas vide (règle 10 du PROTOCOLE)
        expect(/Math\.(round|floor|ceil)\([^;\n]*detailsSommatif/.test(corps)).toBe(false);
    });
});
