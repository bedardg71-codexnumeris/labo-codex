/**
 * Fiche 5 du lot « Suivi », reprise (décisions de Grégoire du 27 nov. 2026, 15 h 06 ; C tranché par Cowork) — L'ÉCHELLE
 * DE DÉPART ET SES DEUX SEUILS, UNE LECTURE À DEUX PORTÉES.
 *   A · une échelle de départ semée maintenant porte ses deux seuils : D (65 %) et M (75 %) ; les bornes ne bougent pas.
 *   B · une échelle de départ déjà installée, restée sans seuils, est lue à D et M pour les écrans de l'ENSEIGNANT·E
 *       seulement (la source de la famille P, `reperesPerformance`) ; rien de ce que lit l'élève ne change (le bilan et
 *       la synthèse par `zoneDuNiveau`, le PDF des consignes par `pageAutoevaluation`, le modèle de cartouche) ; rien
 *       n'est écrit. Dès que la personne pose ses seuils, ce sont les siens, partout.
 *   C · « Mes niveaux » (Vue simple) : née maintenant, elle porte une marque d'origine et ses deux seuils (A) ; plus
 *       ancienne, elle suit B tant que ses niveaux sont restés ceux de l'échelle de départ ; modifiée, elle reste sans seuils.
 *
 *   cd tests && npx vitest run unit/echelle-de-depart-deux-seuils-2026-11-27.test.js
 *
 * Break-tests (27 nov. 2026) : au journal du rapport du lot (plans de travail/RAPPORT-2026-11-27-suivi.md, section 11).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, copieSurEchelle, RACINE } from './_helpers/bac-suivi.js';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

/** L'échelle de départ que sème le vrai `assurerEchelleIdmeDeDepart` aujourd'hui. */
async function semer() {
    const store = {};
    const db = { modifier: async (c, m, d = null) => { const r = await m(c in store ? store[c] : d); if (r !== undefined) store[c] = r; return r; },
        getSync: (c, d) => (c in store ? store[c] : d), get: async (c) => store[c] ?? null, set: async (c, v) => { store[c] = v; }, setSync: (c, v) => { store[c] = v; } };
    const win = { cle: (k) => 'a2026_' + k, estRessourceSupprimee: () => false };
    await chargerScript('js/echelles.js', { db, cle: win.cle }, win).assurerEchelleIdmeDeDepart();
    return store.a2026_echellesTemplates.find((e) => e.id === 'ECHELLE_IDME_DEPART');
}
/** Une échelle de départ installée avant ce jour : la même, sans ses deux seuils. */
async function ancienne() {
    const e = clone(await semer());
    delete e.seuilSuffisance;
    delete e.seuilMaitrise;
    return e;
}

/**
 * Un groupe dont les copies sont posées sur `echelle` ; `autres` : les autres échelles de la bibliothèque du trimestre.
 * Les VRAIS modules : la source de P (contexte-qualification.js), le résolveur et les zones (profil-etudiant-calculs.js).
 */
function banc(echelle, autres = []) {
    const store = storeBase();
    store.test_echellesTemplates = [echelle, ...autres];
    store.test_evaluationsSauvegardees = [copieSurEchelle(echelle)];
    const avant = clone(store.test_echellesTemplates);
    const b = monter(store, {
        modules: ['js/contexte-qualification.js', 'js/profil-etudiant-calculs.js', { chemin: 'js/tableau-bord-apercu.js', internes: ['genererInterpretationPerformance'] }],
        globaux: { designerPratiqueActive: () => ({ etat: 'ok', famille: 'standards' }), formaterPourcentage: (v) => v + ' %' }
    });
    b.win.pluriel = (n, un, plusieurs) => (n > 1 ? plusieurs : un);
    return { b, store, avant };
}
const GROUPE = [{ da: 'a', valeur: 0.80 }, { da: 'b', valeur: 0.70 }, { da: 'c', valeur: 0.40 }];

describe('fiche 5 · A — une échelle de départ semée maintenant porte ses deux seuils', () => {
    it('D et M, et des bornes qui ne bougent pas (D commence à 65, M à 75)', async () => {
        const e = await semer();
        expect(e.seuilSuffisance).toBe('D');
        expect(e.seuilMaitrise).toBe('M');
        expect(e.niveaux.find((n) => n.code === 'D').min).toBe(65);
        expect(e.niveaux.find((n) => n.code === 'M').min).toBe(75);
    });
});

describe('fiche 5 · B — une échelle de départ déjà installée, sans seuils : l\'enseignant·e lit D et M, l\'élève ne voit rien de neuf', () => {
    it('B1 la source de P rend 65 et 75 ; la phrase sous la bande parle ; le seuil de défi vaut 0,75 ; rien n\'est écrit', async () => {
        const { b, store, avant } = banc(await ancienne());
        const r = b.win.reperesPerformance();
        expect([r.suffisance, r.maitrise]).toEqual([65, 75]);
        expect(b.interne['tableau-bord-apercu.js'].genererInterpretationPerformance(GROUPE, r)).toContain('1 étudiant·e (33 %) a atteint ou dépassé le seuil de maîtrise');
        expect(b.win.obtenirSeuil('defiSpecifique')).toBe(0.75);
        expect(store.test_echellesTemplates).toEqual(avant);
        expect(b.journal.filter((j) => /echellesTemplates/.test(j.k))).toEqual([]);
    });

    it('B2 le bilan et la synthèse (par `zoneDuNiveau`) ne voient aucun seuil : comme avant, ils ne disent rien', async () => {
        const { b } = banc(await ancienne());
        for (const code of ['I', 'D', 'M', 'E']) expect(b.win.zoneDuNiveau(code, 'ECHELLE_IDME_DEPART')).toBeNull();
        // Le résolveur rend l'échelle enregistrée, telle quelle.
        const lue = b.win.obtenirEchelleResolue('ECHELLE_IDME_DEPART');
        expect(lue.seuilSuffisance).toBeUndefined();
        expect(lue.seuilMaitrise).toBeUndefined();
    });

    it('B3 le PDF des consignes : pas de grille d\'autoévaluation, comme avant ; le modèle de cartouche, identique à celui d\'une échelle sans seuils', async () => {
        const depart = await ancienne();
        const P = chargerScript('js/export-pdf.js', { db: { get: async () => null, getSync: (k, d) => d, set: async () => {}, setSync() {} }, cle: (k) => k,
            echapperHtml: (t) => String(t ?? ''), toggleDisplay() {}, alert() {}, bareme: { tranchesDuCritere: () => [] },
            document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, createElement: () => ({ style: {} }) } });
        const grille = { id: 'G', nom: 'Grille', criteres: [{ id: 'c', nom: 'Critère', type: 'holistique', descripteurs: { parNiveau: { D: 'Texte D.', M: 'Texte M.' } } }] };
        const production = { id: 'P', titre: 'P', activiteApprentissage: 'Activité' };
        expect(P.reperesAutoevaluation(depart)).toBeNull();
        expect(P.pageAutoevaluation(grille, depart, production)).toBeNull();
        expect(P.autoevaluationSansReperes(grille, depart, production)).toBe(true);
        // Témoin : la même échelle avec ses seuils posés rend la page ; l'essai voit donc les seuils quand ils existent.
        expect(P.pageAutoevaluation(grille, Object.assign({}, depart, { seuilSuffisance: 'D', seuilMaitrise: 'M' }), production)).not.toBeNull();
    });

    it('B4 aucun lecteur qui mène à un document d\'élève n\'appelle la source de P (le seul lieu du repli)', () => {
        const corps = (f, nom) => tranche(lire(f), 'function ' + nom + '(', '\n}\n');
        for (const [f, nom] of [['js/profil-etudiant-calculs.js', 'obtenirEchelleResolue'], ['js/profil-etudiant-calculs.js', 'zoneDuNiveau'],
            ['js/profil-etudiant-calculs.js', 'zoneDuCodeDansNiveaux']]) {
            expect(corps(f, nom), `${f} › ${nom}`).not.toMatch(/reperesPerformance|_echelleDeLaPerformance/);
        }
        for (const f of ['js/export-pdf.js', 'js/evaluation-retroaction.js', 'js/synthese-retroaction-data.js', 'js/cartouches.js', 'js/grilles.js', 'js/wizard-pratique-v2.js', 'js/echelles.js']) {
            expect(lire(f), f).not.toMatch(/reperesPerformance|_echelleDeLaPerformance/);
        }
    });
});

describe('fiche 5 · B — dès que la personne pose ses seuils, ce sont les siens ; une échelle créée sans seuils reste sans seuils', () => {
    it('B5 l\'échelle de départ aux seuils posés (I et E) : I et E, côté enseignant·e et côté élève', async () => {
        const posee = Object.assign(await ancienne(), { seuilSuffisance: 'I', seuilMaitrise: 'E' });
        const { b } = banc(posee);
        const r = b.win.reperesPerformance();
        expect([r.suffisance, r.maitrise]).toEqual([0, 85]);
        expect(b.win.zoneDuNiveau('M', 'ECHELLE_IDME_DEPART')).toBe('signale');
    });

    it('B6 une échelle créée par la personne, sans seuils, aux niveaux identiques : sans seuils', async () => {
        const perso = Object.assign(await ancienne(), { id: 'ECH_PERSO', nom: 'Mon échelle' });
        const { b } = banc(perso, [await ancienne()]);
        const r = b.win.reperesPerformance();
        expect([r.suffisance, r.maitrise]).toEqual([null, null]);
        expect(b.win.obtenirSeuil('defiSpecifique')).toBe(0.70);
    });
});

describe('fiche 5 · C — « Mes niveaux » (Vue simple)', () => {
    const W = { addEventListener() {}, removeEventListener() {} };
    const D = chargerScript('js/vue-simple-donnees.js', {}, W).VueSimpleDonnees;
    const pratique = { id: 'PRAT_1', nom: 'Par standards', configuration: {} };

    it('C1 née maintenant d\'une échelle de départ (ancienne ou neuve) : la marque d\'origine et les seuils D et M', async () => {
        for (const depart of [await semer(), await ancienne()]) {
            const r = D.echelleReglee(depart, pratique, D.brouillonDeLaPratique(pratique, depart).niveaux, { idNeuf: 'ECH_N', maintenant: 'm', naissance: true });
            expect(r.echelle).toMatchObject({ id: 'ECH_N', nom: 'Mes niveaux', origine: 'ECHELLE_IDME_DEPART', seuilSuffisance: 'D', seuilMaitrise: 'M' });
        }
    });

    it('C2 copiée au réglage, elle garde les seuils dont le niveau existe encore', async () => {
        const nee = D.echelleReglee(await semer(), pratique, D.brouillonDeLaPratique(pratique, await semer()).niveaux, { idNeuf: 'ECH_N', maintenant: 'm', naissance: true }).echelle;
        const b = D.brouillonDeLaPratique(pratique, nee).niveaux.map((n) => (n.code === 'D' ? Object.assign({}, n, { code: 'DEV' }) : n));
        const r = D.echelleReglee(nee, pratique, b, { idNeuf: 'ECH_C', maintenant: 'm', lueAilleurs: true });
        expect(r.copiee).toBe(true);
        expect(r.echelle.seuilSuffisance).toBeUndefined();   // D n'existe plus
        expect(r.echelle.seuilMaitrise).toBe('M');
        expect(r.echelle.origine).toBe('ECHELLE_IDME_DEPART');
    });

    it('C3 une « Mes niveaux » d\'avant ce jour, restée identique à l\'échelle de départ : lue à D et M (côté enseignant·e)', async () => {
        const depart = await ancienne();
        const mes = { id: 'ECH_ANC', nom: 'Mes niveaux', pratiqueId: 'PRAT_1', origines: [], niveaux: clone(depart.niveaux) };
        const { b } = banc(mes, [depart]);
        expect([b.win.reperesPerformance().suffisance, b.win.reperesPerformance().maitrise]).toEqual([65, 75]);
        expect(b.win.zoneDuNiveau('M', 'ECH_ANC')).toBeNull();   // côté élève : rien
    });

    it('C4 modifiée par la personne (une valeur, un nom, une borne ou l\'ordre) : sans seuils', async () => {
        const depart = await ancienne();
        const modifs = [
            (n) => n.map((x) => (x.code === 'D' ? Object.assign({}, x, { valeurCalcul: 70 }) : x)),
            (n) => n.map((x) => (x.code === 'M' ? Object.assign({}, x, { nom: 'Acquis' }) : x)),
            (n) => n.map((x) => (x.code === 'E' ? Object.assign({}, x, { min: 90 }) : x)),
            (n) => n.slice().reverse()
        ];
        for (const modifier of modifs) {
            const mes = { id: 'ECH_ANC', nom: 'Mes niveaux', pratiqueId: 'PRAT_1', niveaux: modifier(clone(depart.niveaux)) };
            const { b } = banc(mes, [depart]);
            expect([b.win.reperesPerformance().suffisance, b.win.reperesPerformance().maitrise]).toEqual([null, null]);
        }
    });

    it('C5 une « Mes niveaux » marquée (née après ce jour) dont les seuils ont été retirés : sans seuils', async () => {
        const depart = await ancienne();
        const mes = { id: 'ECH_N', nom: 'Mes niveaux', pratiqueId: 'PRAT_1', origine: 'ECHELLE_IDME_DEPART', niveaux: clone(depart.niveaux) };
        const { b } = banc(mes, [depart]);
        expect(b.win.reperesPerformance().maitrise).toBeNull();
    });
});
