/**
 * SENTINELLE (21 nov. 2026) — LA PRATIQUE « PAR STANDARDS », LOT 1 : DIRE LES CIBLES DU COURS.
 *
 * Plan : plans de travail/PLAN-2026-11-20-moteur-par-objectifs.md (section du 20 nov., 21 h 25, et lot 1).
 * Consigne : plans de travail/CONSIGNE-LOT-2026-11-20-moteur-cibles-1-cibles.md.
 *
 * VERROUILLÉ ICI, sur les modules RÉELS (aucun navigateur ; l'écran est éprouvé par les captures du lot) :
 *   A. L'IDENTITÉ PERMANENTE. Dans le mode « Par standards » du composant commun (`EditeurCibles`), une cible ou un
 *      critère renommé, déplacé ou réécrit garde son id ; une cible ou un critère neufs reçoivent un id jamais vu. Les
 *      poids sont égaux d'office et leur total se lit. Le mode de la dénotation ne change pas.
 *   B. LES REFUS, EN MOTS : aucune cible ; une cible commencée sans étiquette ; un poids nul, négatif ou absent ; aucune
 *      échelle ; une échelle sans niveau à 0 % ; aucun niveau « sans donnée » désigné.
 *   C. L'ASSISTANT RÉEL ÉCRIT la pratique, son ensemble de cibles et l'échelle de départ (dans cet ordre : l'ensemble et
 *      l'échelle AVANT la pratique qui les désigne) ; il refuse sans rien écrire ; il rouvre la pratique avec les mêmes
 *      ids et la réécrit sous le même ensemble.
 *   D. LE REGISTRE ET LA PRATIQUE : la famille `cibles` a son code (CIB) et sa méthode (`niveaux_par_cible`) ; sa note
 *      est `null` et elle dit pourquoi, sans lire ni les évaluations ni le cache des indices.
 *   E. LES REGISTRES NOMINATIFS portent la clé `ensemblesCibles`.
 *
 * CE QUI N'EST PAS ICI : les modèles existants de l'assistant (golden master octet pour octet) restent gardés par
 * `sentinelle-wizard-golden-creation-319.test.js`, inchangé par ce lot ; la non-ingérence dans les notes existantes, par
 * `sentinelle-moteur-cibles-0-garde.test.js` (lot 0), rejouée.
 *
 * Données fictives (cours « 999-ZZZ-ZZ », cibles de banc). BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { fonctionsDeLEchelle } from './_helpers/moteur-cibles.js';
import { chargerScript } from './_helpers/charger-script.js';
import { dbBanc, RACINE } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* ================================================================ Le composant, dans un vrai DOM (jsdom) */
function monterEditeur() {
    const dom = new JSDOM('<!doctype html><div id="hote"></div>');
    const win = { echapperHtml };
    chargerScript('js/pratiques/ensembles-cibles.js', { echapperHtml }, win);
    chargerScript('js/pratiques/editeur-cibles.js', { document: dom.window.document, Event: dom.window.Event, echapperHtml }, win);
    return { win, hote: dom.window.document.getElementById('hote'), doc: dom.window.document };
}
const CIBLES = [
    { id: 'cib-lire', etiquette: 'Lire un texte', enonce: 'Dégager le sens d\'un texte.', poids: 1, terminale: false,
        criteres: [{ id: 'crit-a', texte: 'Repère les idées', essentiel: true }, { id: 'crit-b', texte: 'Cite le texte', essentiel: false }] },
    { id: 'cib-ecrire', etiquette: 'Rédiger une analyse', enonce: 'Rédiger une analyse structurée.', poids: 1, terminale: true,
        criteres: [{ id: 'crit-c', texte: 'Structure son propos', essentiel: true }] }
];

describe('A · identité permanente des cibles et des critères (mode « Par standards » du composant commun)', () => {
    it('renommer, réécrire et déplacer ne changent aucun id ; les critères gardent le leur', () => {
        const { win, hote } = monterEditeur();
        win.EditeurCibles.poserStandards(hote, clone(CIBLES));
        const lignes = hote.querySelectorAll('.editeur-cibles-ligne--std');
        lignes[0].querySelector('.editeur-cibles-etiquette').value = 'Lire et comprendre';
        lignes[0].querySelector('.editeur-cibles-critere-texte').value = 'Repère les idées principales';
        win.EditeurCibles.descendre(lignes[0].querySelector('[data-action="EditeurCibles.descendre"]'));
        const lues = win.EditeurCibles.lireStandards(hote);
        expect(lues.map(c => c.id)).toEqual(['cib-ecrire', 'cib-lire']);
        expect(lues[1].etiquette).toBe('Lire et comprendre');
        expect(lues[1].criteres.map(k => k.id)).toEqual(['crit-a', 'crit-b']);
        expect(lues[1].criteres[0]).toEqual({ id: 'crit-a', texte: 'Repère les idées principales', essentiel: true });
        expect(lues[0].terminale).toBe(true);
    });

    it('une cible et un critère neufs reçoivent un id jamais vu ; retirer ne fait glisser aucun id', () => {
        const { win, hote } = monterEditeur();
        win.EditeurCibles.poserStandards(hote, clone(CIBLES));
        win.EditeurCibles.ajouter(hote.querySelector('.editeur-cibles-ajouter'));
        const neuve = hote.querySelectorAll('.editeur-cibles-ligne--std')[2];
        neuve.querySelector('.editeur-cibles-etiquette').value = 'Réviser sa copie';
        win.EditeurCibles.ajouterCritere(neuve.querySelector('[data-action="EditeurCibles.ajouterCritere"]'));
        neuve.querySelectorAll('.editeur-cibles-critere-texte').forEach((i, n) => { i.value = 'Critère ' + n; });
        win.EditeurCibles.retirer(hote.querySelectorAll('.editeur-cibles-ligne--std')[0].querySelector('[data-action="EditeurCibles.retirer"]'));
        const lues = win.EditeurCibles.lireStandards(hote);
        expect(lues.map(c => c.id).slice(0, 1)).toEqual(['cib-ecrire']);
        const idNeuf = lues[1].id;
        expect(idNeuf).toMatch(/^cible_/);
        expect(['cib-lire', 'cib-ecrire']).not.toContain(idNeuf);
        const idsCriteres = lues[1].criteres.map(k => k.id);
        expect(idsCriteres).toHaveLength(2);
        expect(new Set(idsCriteres).size).toBe(2);
        for (const id of idsCriteres) expect(id).toMatch(/^crit_/);
    });

    it('les poids sont égaux d\'office, leur total se lit, la part de chacun aussi', () => {
        const { win, hote } = monterEditeur();
        win.EditeurCibles.poserStandards(hote, []);
        win.EditeurCibles.ajouter(hote.querySelector('.editeur-cibles-ajouter'));
        win.EditeurCibles.ajouter(hote.querySelector('.editeur-cibles-ajouter'));
        const poids = [...hote.querySelectorAll('.editeur-cibles-poids')].map(i => i.value);
        expect(poids).toEqual(['1', '1', '1']);
        expect(hote.querySelector('.editeur-cibles-total').textContent).toBe('Total des poids : 3. Chaque cible compte pour sa part du total.');
        const champ = hote.querySelectorAll('.editeur-cibles-poids')[2];
        champ.value = '2';
        win.EditeurCibles.majTotal(champ);
        expect([...hote.querySelectorAll('.editeur-cibles-part')].map(p => p.textContent)).toEqual(['25 %', '25 %', '50 %']);
        champ.value = '0';
        win.EditeurCibles.majTotal(champ);
        expect(hote.querySelector('.editeur-cibles-total').textContent).toMatch(/^Total des poids : —/);
        // Le poids fautif, et lui seul, est marqué (le refus de l'assistant ne rougit pas toute la liste).
        expect([...hote.querySelectorAll('.editeur-cibles-poids')].map(i => i.getAttribute('aria-invalid'))).toEqual(['false', 'false', 'true']);
        expect(champ.classList.contains('editeur-cibles-poids--refuse')).toBe(true);
    });

    it('le mode de la dénotation ne change pas : mêmes lignes, même forme { id, nom }', () => {
        const { win, hote } = monterEditeur();
        win.EditeurCibles.poser(hote, [{ id: 'c1', nom: 'Lire' }, { id: 'c2', nom: 'Écrire' }]);
        expect(hote.querySelector('[data-editeur-cibles]').dataset.mode).toBeUndefined();
        expect(win.EditeurCibles.lire(hote)).toEqual([{ id: 'c1', nom: 'Lire' }, { id: 'c2', nom: 'Écrire' }]);
        expect(win.EditeurCibles.motifRefus([])).toBe('Ajoute au moins une cible : sans cible, aucune note ne peut dépasser 59.');
    });
});

/* ================================================================ B. Les refus, en mots (module pur) */
const EC = (() => { const w = { echapperHtml }; chargerScript('js/pratiques/ensembles-cibles.js', { echapperHtml }, w); return w.EnsemblesCibles; })();
const ECHELLE_DEPART = EC.echelleDeDepart('ECH-banc');
const ECHELLE_SANS_ZERO = { id: 'E1', nom: 'IDME sans zéro', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40 }, { code: 'M', nom: 'Maîtrisé', min: 65, max: 100, valeurCalcul: 80 }] };

describe('B · les refus, avec leur motif en mots', () => {
    it('aucune cible', () => {
        expect(EC.motifsRefusCibles([])).toEqual([EC.MOTIFS.AUCUNE_CIBLE]);
        expect(EC.motifsRefusCibles([{ id: 'x', etiquette: '', enonce: '', criteres: [], poids: '1' }])).toEqual([EC.MOTIFS.AUCUNE_CIBLE]);
    });
    it('un poids nul, négatif ou absent : le motif nomme la cible', () => {
        const avec = (poids) => EC.motifsRefusCibles([{ id: 'x', etiquette: 'Lire un texte', poids }]);
        expect(avec('0')).toEqual(['Le poids de la cible « Lire un texte » doit être plus grand que zéro (il vaut 0).']);
        expect(avec('-2,5')).toEqual(['Le poids de la cible « Lire un texte » doit être plus grand que zéro (il vaut -2,5).']);
        expect(avec('')).toEqual(['Donne un poids à la cible « Lire un texte » : chaque cible a besoin d\'un poids plus grand que zéro.']);
        expect(avec('1,5')).toEqual([]);
    });
    it('une cible commencée sans étiquette ne se perd pas en silence', () => {
        expect(EC.motifsRefusCibles([{ id: 'x', etiquette: '', enonce: 'Rédiger', poids: '1' }])).toEqual([EC.MOTIFS.SANS_ETIQUETTE]);
    });
    it('aucune échelle ; une échelle sans niveau à 0 % ; aucun niveau « sans donnée » désigné', () => {
        expect(EC.motifsRefusEchelle(null, '0')).toEqual([EC.MOTIFS.AUCUNE_ECHELLE]);
        expect(EC.motifsRefusEchelle(ECHELLE_SANS_ZERO, 'I')).toEqual([EC.MOTIFS.ECHELLE_SANS_ZERO]);
        expect(EC.motifsRefusEchelle(ECHELLE_DEPART, '')).toEqual([EC.MOTIFS.SANS_DONNEE]);
        expect(EC.motifsRefusEchelle(ECHELLE_DEPART, '1'), 'un niveau qui ne vaut pas 0 % ne dit pas « sans donnée »').toEqual([EC.MOTIFS.SANS_DONNEE]);
        expect(EC.motifsRefusEchelle(ECHELLE_DEPART, '0')).toEqual([]);
    });
    it('les motifs sont des phrases, et la pratique complète n\'en a aucun', () => {
        for (const m of Object.values(EC.MOTIFS)) expect(m).toMatch(/^[A-ZÀ-Ü].{30,}[.]$/);
        expect(EC.motifsRefus({ cibles: clone(CIBLES), echelle: ECHELLE_DEPART, niveauSansDonnee: '0' })).toEqual([]);
    });
    it('l\'échelle de départ : cinq niveaux, 0, 25, 50, 75 et 100 %, plages et valeurs posées (#526), le 0 dit « sans donnée »', () => {
        expect(ECHELLE_DEPART.niveaux.map(n => [n.code, n.valeurCalcul])).toEqual([['0', 0], ['1', 25], ['2', 50], ['3', 75], ['4', 100]]);
        for (const n of ECHELLE_DEPART.niveaux) {
            expect(typeof n.min).toBe('number');
            expect(typeof n.max).toBe('number');
            expect(n.nom.length).toBeGreaterThan(2);
        }
        expect(EC.niveauxSansDonneePossibles(ECHELLE_DEPART).map(n => n.code)).toEqual([EC.CODE_SANS_DONNEE_DEPART]);
    });
});

/* ================================================================ C. L'assistant réel */
function monterAssistant(store) {
    const journal = [];
    const erreurs = [];
    const win = { addEventListener() {}, removeEventListener() {}, echapperHtml };
    let n = 0;
    const globaux = {
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, removeEventListener() {} },
        db: dbBanc(store, journal), cle: (k) => 'test_' + k,
        notifications: { erreur: (m) => erreurs.push(m), succes() {}, info() {}, warning() {} },
        normaliserIdPratique: (t) => t, genererIdUnique: (p) => p + 'NEUF' + (++n), echapperHtml,
        formaterPourcentage: (v) => String(v).replace('.', ',') + '\u00a0%',
        confirm: () => true
    };
    chargerScript('js/pratiques/ensembles-cibles.js', globaux, win);
    chargerScript('js/pratiques/editeur-cibles.js', globaux, win);
    chargerScript('js/wizard-pratique-v2.js', globaux, win);
    return { win, store, journal, erreurs };
}
const REPONSES = (echelleId, code) => ({ nom: 'Par standards banc', prenom: 'Zoé', nomAuteur: 'Fictive', calcNoteFinale: 'cibles', coursCibles: 'COURS-ZZZ',
    ciblesStandards: clone(CIBLES).map(c => Object.assign(c, { poids: String(c.poids) })), echelleId, niveauSansDonnee: code });
async function creer(a, reponses, { echelleDeDepart = null } = {}) {
    a.win.wizardState.reponses = reponses;
    a.win.wizardState.pratiqueId = null;
    a.win.wizardState.modeEdition = false;
    a.win.wizardState.echelleDeDepart = echelleDeDepart;
    await a.win.creerPratiqueV2();
}

describe('C · l\'assistant réel écrit la pratique, son ensemble de cibles et l\'échelle de départ', () => {
    it('la forme écrite : la pratique désigne son ensemble, son échelle et le niveau « sans donnée »', async () => {
        const a = monterAssistant({ test_pratiquesConfigurables: [], test_echellesTemplates: [] });
        const depart = a.win.EnsemblesCibles.echelleDeDepart('ECH-depart');
        await creer(a, REPONSES('ECH-depart', '0'), { echelleDeDepart: depart });
        expect(a.erreurs).toEqual([]);
        const [p] = a.store.test_pratiquesConfigurables;
        expect(p).toMatchObject({ nom: 'Par standards banc', type: 'cibles', pratiques: ['CIB'], calcul_note: { methode: 'niveaux_par_cible' } });
        expect(Object.keys(p.configuration).sort()).toEqual(['echelleId', 'ensembleCiblesId', 'niveauSansDonnee', 'type']);
        expect(p.configuration).toMatchObject({ type: 'cibles', echelleId: 'ECH-depart', niveauSansDonnee: '0' });
        const [ens] = a.store.test_ensemblesCibles;
        expect(ens.id).toBe(p.configuration.ensembleCiblesId);
        expect(ens.coursId).toBe('COURS-ZZZ');
        expect(ens.cibles).toEqual(clone(CIBLES));                         // poids lus en nombres, ids gardés
        expect(a.store.test_echellesTemplates.map(e => e.id)).toEqual(['ECH-depart']);
        // L'ordre : l'échelle, puis l'ensemble, puis la pratique qui les désigne.
        expect(a.journal.map(e => e.k)).toEqual(['test_echellesTemplates', 'test_ensemblesCibles', 'test_pratiquesConfigurables']);
    });

    it('une échelle de départ proposée mais non retenue n\'est pas écrite', async () => {
        const echelle = clone(ECHELLE_DEPART); echelle.id = 'ECH-maison';
        const a = monterAssistant({ test_pratiquesConfigurables: [], test_echellesTemplates: [echelle] });
        await creer(a, REPONSES('ECH-maison', '0'), { echelleDeDepart: a.win.EnsemblesCibles.echelleDeDepart('ECH-depart') });
        expect(a.store.test_echellesTemplates.map(e => e.id)).toEqual(['ECH-maison']);
        expect(a.journal.map(e => e.k)).toEqual(['test_ensemblesCibles', 'test_pratiquesConfigurables']);
    });

    for (const [cas, retouche, motif] of [
        ['un poids nul', (r) => { r.ciblesStandards[1].poids = '0'; }, 'Le poids de la cible « Rédiger une analyse » doit être plus grand que zéro (il vaut 0).'],
        ['aucune cible', (r) => { r.ciblesStandards = []; }, null],
        ['aucune échelle', (r) => { r.echelleId = ''; }, null],
        ['aucun niveau « sans donnée »', (r) => { r.niveauSansDonnee = ''; }, null]
    ]) {
        it('refus sans rien écrire : ' + cas, async () => {
            const echelle = clone(ECHELLE_DEPART); echelle.id = 'ECH-maison';
            const a = monterAssistant({ test_pratiquesConfigurables: [], test_echellesTemplates: [echelle] });
            const r = REPONSES('ECH-maison', '0');
            retouche(r);
            await creer(a, r);
            expect(a.journal, 'aucune écriture').toEqual([]);
            expect(a.erreurs).toHaveLength(1);
            if (motif) expect(a.erreurs[0]).toBe(motif);
            expect(Object.values(a.win.EnsemblesCibles.MOTIFS).concat(motif ? [motif] : [])).toContain(a.erreurs[0]);
        });
    }

    // Décision confirmée le 21 nov. 2026 : rien n'est codé en dur — l'enseignant·e choisit n'importe quelle échelle, son
    // nombre de niveaux et leurs noms ; l'échelle de départ n'est qu'un point de départ.
    for (const [nom, niveaux, zero] of [
        ['trois niveaux', [['N', 'Non démontré', 0, 49.99, 0], ['P', 'Partiel', 50, 79.99, 60], ['A', 'Atteint', 80, 100, 100]], 'N'],
        ['six niveaux', [['0', 'Rien encore', 0, 9.99, 0], ['1', 'Amorcé', 10, 29.99, 20], ['2', 'En route', 30, 49.99, 40],
            ['3', 'Presque', 50, 69.99, 60], ['4', 'Atteint', 70, 89.99, 80], ['5', 'Dépassé', 90, 100, 100]], '0']
    ]) {
        it('une échelle à ' + nom + ' : la pratique se crée, l\'étape montre ses niveaux et n\'offre que ceux à 0 %', async () => {
            const echelle = { id: 'ECH-' + niveaux.length, nom: 'Échelle maison à ' + nom, niveaux: niveaux.map(([code, n, min, max, v]) => ({ code, nom: n, min, max, valeurCalcul: v })) };
            const a = monterAssistant({ test_pratiquesConfigurables: [], test_echellesTemplates: [echelle] });
            await creer(a, REPONSES(echelle.id, zero));
            expect(a.erreurs).toEqual([]);
            expect(a.store.test_pratiquesConfigurables[0].configuration).toMatchObject({ echelleId: echelle.id, niveauSansDonnee: zero });
            expect(a.store.test_echellesTemplates).toEqual([echelle]);   // l'échelle n'est ni réécrite ni complétée
            // L'étape de l'échelle, rendue : tous les niveaux à l'aperçu ; au menu « sans donnée », le seul niveau à 0 %.
            a.win.obtenirEchellesOffertesAdoption = () => [echelle];
            a.win.wizardState.reponses = { echelleId: echelle.id, niveauSansDonnee: zero };
            a.win.wizardState.echelleDeDepart = null;
            const html = a.win.genererContenuEtape(a.win.ETAPES_WIZARD['echelle-cibles']);
            expect((html.match(/class="wizard-v2-niveau-code"/g) || []).length).toBe(niveaux.length);
            const menu = tranche(html, 'echelleCibles-sansDonnee"', '</select>');
            expect((menu.match(/<option value="/g) || []).length).toBe(2);   // l'option vide, et le niveau à 0 %
            expect(menu).toContain('value="' + zero + '" selected');
        });
    }

    it('rouvrir : les cibles reviennent avec leurs ids ; renommer, déplacer et enregistrer réécrit le MÊME ensemble', async () => {
        const echelle = clone(ECHELLE_DEPART); echelle.id = 'ECH-maison';
        const a = monterAssistant({ test_pratiquesConfigurables: [], test_echellesTemplates: [echelle] });
        await creer(a, REPONSES('ECH-maison', '0'));
        const p = a.store.test_pratiquesConfigurables[0];
        const idEnsemble = p.configuration.ensembleCiblesId;
        const creeLe = a.store.test_ensemblesCibles[0].dateCreation;

        a.win.wizardState.modeEdition = true;
        a.win.wizardState.pratiqueId = p.id;
        a.win.chargerPratiqueExistante(p.id);
        const r = a.win.wizardState.reponses;
        expect(r.calcNoteFinale).toBe('cibles');
        expect(r.ciblesStandards.map(c => c.id)).toEqual(['cib-lire', 'cib-ecrire']);
        expect(r.coursCibles).toBe('COURS-ZZZ');
        expect([r.echelleId, r.niveauSansDonnee]).toEqual(['ECH-maison', '0']);

        r.ciblesStandards.reverse();
        r.ciblesStandards[0].etiquette = 'Rédiger';
        await a.win.creerPratiqueV2();
        expect(a.store.test_pratiquesConfigurables).toHaveLength(1);
        expect(a.store.test_pratiquesConfigurables[0].configuration.ensembleCiblesId).toBe(idEnsemble);
        expect(a.store.test_ensemblesCibles).toHaveLength(1);
        const ens = a.store.test_ensemblesCibles[0];
        expect(ens.cibles.map(c => [c.id, c.etiquette])).toEqual([['cib-ecrire', 'Rédiger'], ['cib-lire', 'Lire un texte']]);
        expect(ens.cibles[1].criteres.map(k => k.id)).toEqual(['crit-a', 'crit-b']);
        expect(ens.dateCreation).toBe(creeLe);
    });

    it('le récapitulatif nomme le cours, chaque cible, l\'échelle et le niveau « sans donnée », et dit comment la note se fait (révisé au lot 4)', () => {
        const a = monterAssistant({ test_pratiquesConfigurables: [], test_echellesTemplates: [], cours: [{ id: 'COURS-ZZZ', codeCours: '999-ZZZ-ZZ', nomCours: 'Cours de banc' }] });
        a.win.wizardState.echelleDeDepart = a.win.EnsemblesCibles.echelleDeDepart('ECH-depart');
        a.win.wizardState.reponses = Object.assign(REPONSES('ECH-depart', '0'), { typePratique: 'cibles' });
        const html = a.win.genererRecapitulatif();
        expect(html).toContain('Par standards');
        expect(html).toContain('999-ZZZ-ZZ - Cours de banc');
        expect(html).toContain('<strong>Lire un texte</strong> · 50 % · 2 critères, dont 1 essentiel');
        expect(html).toContain('cible terminale');
        expect(html).toContain('Échelle de départ – Par standards');
        expect(html).toContain('0 – Données insuffisantes');
        // Lot 4 (21 nov. 2026) : la pratique calcule ; le récapitulatif ne dit plus qu'elle ne calcule pas encore.
        expect(html).toContain('La note est la moyenne pondérée des niveaux retenus');
        expect(html).not.toContain('ne calcule pas encore');
        expect(html).not.toContain('Matériel pédagogique');
    });

    it('le texte de l\'enseignant·e est échappé au récapitulatif', () => {
        const a = monterAssistant({ test_pratiquesConfigurables: [], test_echellesTemplates: [] });
        const r = Object.assign(REPONSES('ECH-depart', '0'), { typePratique: 'cibles' });
        r.ciblesStandards[0].etiquette = '<img src=x onerror=alert(1)>';
        a.win.wizardState.reponses = r;
        expect(a.win.genererRecapitulatif()).not.toContain('<img src=x');
    });
});

describe('C bis · la fiche de la pratique montre les cibles, et échappe le texte de l\'enseignant·e', () => {
    it('cours, échelle, niveau « sans donnée », chaque cible ; aucune balise reçue n\'est rendue telle quelle', () => {
        const cibles = clone(CIBLES);
        cibles[0].etiquette = '<img src=x onerror=alert(1)>';
        cibles[1].criteres[0].texte = '<b>gras</b>';
        const store = { test_ensemblesCibles: [{ id: 'ENS1', coursId: 'COURS-ZZZ', cibles }], test_echellesTemplates: [clone(ECHELLE_DEPART)],
            cours: [{ id: 'COURS-ZZZ', codeCours: '999-ZZZ-ZZ', nomCours: 'Cours <i>de banc</i>' }] };
        const w = { echapperHtml };
        chargerScript('js/pratiques/ensembles-cibles.js', { db: dbBanc(store, []), cle: (k) => 'test_' + k, echapperHtml }, w);
        const html = w.EnsemblesCibles.rendreFiche({ ensembleCiblesId: 'ENS1', echelleId: 'ECH-banc', niveauSansDonnee: '0' });
        expect(html).not.toContain('<img src=x');
        expect(html).not.toContain('<b>gras');
        expect(html).not.toContain('<i>de banc');
        expect(html).toContain('&lt;img src=x');
        expect(html).toContain('Données insuffisantes');
        expect(html).toContain('Échelle de départ – Par standards');
        expect(html).toContain('Total des poids : 2.');
        expect((html.match(/class="cibles-fiche-cible"/g) || []).length).toBe(2);
        expect(w.EnsemblesCibles.rendreFiche({ ensembleCiblesId: 'ABSENT' })).toContain('introuvables');
    });
});

/* ================================================================ D. Le registre et la pratique configurable */
function storeTemoin(store) {
    const lues = [];
    return { lues, db: { getSync: (k, d) => { lues.push(k); return k in store ? clone(store[k]) : (d !== undefined ? d : null); }, setSync() {}, get: async () => null, set: async () => {} } };
}
describe('D · le registre et la pratique : un code, une méthode, aucune note encore, et la raison en mots', () => {
    const PRATIQUE = { id: 'cib-banc', nom: 'Par standards banc', type: 'cibles', calcul_note: { methode: 'niveaux_par_cible' }, dansBibliotheque: true,
        configuration: { type: 'cibles', ensembleCiblesId: 'ENS1', echelleId: 'ECH-banc', niveauSansDonnee: '0' } };   // l'échelle de départ du banc (B)
    function monter() {
        const store = { pratiquesConfigurables: [clone(PRATIQUE)], echellesTemplates: [clone(ECHELLE_DEPART)],
            ensemblesCibles: [{ id: 'ENS1', coursId: null, cibles: clone(CIBLES) }],   // lot 4 : la note lit l'ensemble
            evaluationsSauvegardees: [{ etudiantDA: '2000001', productionId: 'P1', noteFinale: 90 }], indicesCP: { '2000001': { actuel: { P: 77 } } } };
        const t = storeTemoin(store);
        const win = { PratiqueManager: {} };   // la présence du gestionnaire ouvre la bibliothèque au registre (obtenirPratiqueParId)
        // Le registre construit l'instance par un identifiant nu (`new PratiqueConfigurable`) : renvoi par fermeture.
        const globaux = { db: t.db, cle: (k) => k, resoudreModeleParId: (type, id) => clone(store.echellesTemplates.find(e => e.id === id) || null),
            PratiqueConfigurable: function (config) { return new win.PratiqueConfigurable(config); } };
        chargerScript('js/pratiques/pratique-configurable.js', globaux, win);
        chargerScript('js/pratiques/pratique-registre.js', globaux, win);
        // Lot 4 : le moteur de la note (l'ensemble, les inscriptions, NoteCibles), avec l'ordre et la valeur réels.
        const g2 = Object.assign({}, globaux, fonctionsDeLEchelle(), { obtenirEchelleResolue: (id) => clone(store.echellesTemplates.find(e => e.id === id) || null) });
        chargerScript('js/pratiques/ensembles-cibles.js', g2, win);
        chargerScript('js/pratiques/inscriptions-cibles.js', g2, win);
        chargerScript('js/pratiques/note-cibles.js', g2, win);
        return { win, lues: t.lues };
    }
    it('la famille `cibles` : code CIB, famille PAN, méthode niveaux_par_cible', () => {
        const { win } = monter();
        // 21 nov. 2026 (« le sigle suit le nom ») : le code interne reste CIB ; le sigle affiché est STD, avec le bleu de STD.
        expect(win.obtenirRepresentationPratique('cibles')).toMatchObject({ code: 'CIB', sigle: 'STD', famille: 'PAN', couleurVar: '--std-bleu' });
        expect(win.METHODE_PAR_FAMILLE.cibles).toBe('niveaux_par_cible');
        expect(win.obtenirRepresentationPratiqueStricte('standards').code).toBe('STD');   // l'autre famille ne bouge pas
    });
    it('(révisé au lot 4) sans inscription, sa note est null et sa cause nomme les cibles en attente — sans lire les évaluations ni le cache', () => {
        const { win, lues } = monter();
        const p = win.obtenirPratiqueParId('cib-banc');
        expect(p).toBeTruthy();
        expect(p.obtenirCode()).toBe('CIB');
        lues.length = 0;
        expect(p.calculerPerformance('2000001')).toBeNull();
        // Lot 4 (21 nov. 2026) : la phrase N1' (« ne calcule pas encore ») est retirée ; la cause est celle de NoteCibles.
        expect(p.expliquerNoteNonConstructible('2000001')).toBe('Pas encore de note : les cibles « Lire un texte », « Rédiger une analyse » sont sans donnée. '
            + 'La note se calcule quand chaque cible a un niveau retenu, ou à l’arrêt des notes.');
        expect(lues.filter(k => /evaluationsSauvegardees|indicesCP/.test(k))).toEqual([]);
        expect(lues.filter(k => /inscriptionsCibles/.test(k)).length, 'elle lit les inscriptions').toBeGreaterThan(0);
    });
});

/* ================================================================ E. Les registres nominatifs */
describe('E · la clé `ensemblesCibles` est inscrite à tous les registres nominatifs', () => {
    const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
    const liste = (src, debut) => { const i = src.indexOf(debut); expect(i, debut).toBeGreaterThan(-1); return src.slice(i, src.indexOf('];', i)); };
    it('par trimestre (`CLES_NAMESPACEES`), propriétaire (`db._SSOT_OWNERS`), Réserve, codex, DATA-OWNERSHIP', () => {
        expect(liste(lire('js/trimestres.js'), 'const CLES_NAMESPACEES')).toContain("'ensemblesCibles'");
        expect(lire('js/db.js')).toMatch(/'ensemblesCibles':\s*\['ensembles-cibles\.js'\]/);
        expect(liste(lire('js/reserve.js'), 'var CLES_SANS_FILTRE')).toContain("'ensemblesCibles'");
        expect(liste(lire('js/codex.js'), 'var ciblesExactes')).toContain("'ensemblesCibles'");
        expect(lire('docs/DATA-OWNERSHIP.md')).toMatch(/\| `ensemblesCibles` \| NS/);
    });
    it('le module propriétaire ne nomme ni les évaluations ni les inscriptions (lot 2) : il ne les lit pas', () => {
        const src = lire('js/pratiques/ensembles-cibles.js');
        expect(src).not.toMatch(/getSync\([^)]*evaluationsSauvegardees/);
        expect(src).not.toMatch(/inscriptionsCibles/);
    });
});

/* ================================================================ JOURNAL DES BREAK-TESTS (21 nov. 2026)
 *
 * Chaque mutation a été posée dans `js/`, ce fichier lancé seul (un worker), le rouge relevé, puis la mutation
 * retirée (script hors dépôt ; le fichier muté est réécrit à l'identique après chaque essai). 23 essais au vert avant.
 *
 * BT1 — editeur-cibles.js, `lireEditeurCiblesStandards` : l'id lu devient la position (`'cible-' + i`).
 *       ROUGE (2) : A « renommer, réécrire et déplacer… », A « une cible et un critère neufs… ». C reste vert : la
 *       réédition relit l'ensemble rangé, pas l'écran — c'est pourquoi A existe à côté de C.
 * BT2 — ensembles-cibles.js, `motifsRefusCibles` : le filtre des poids neutralisé (`.filter(c => false)`).
 *       ROUGE (2) : B « un poids nul, négatif ou absent », C « refus sans rien écrire : un poids nul » (la pratique s'écrit).
 * BT3 — ensembles-cibles.js, `niveauxSansDonneePossibles` : la condition « vaut 0 % » retirée.
 *       ROUGE (2) : B « aucune échelle ; une échelle sans niveau à 0 %… », B « l'échelle de départ… » (cinq possibles).
 * BT4 — wizard-pratique-v2.js, branche `cibles` de `creerPratiqueV2` : un id d'ensemble neuf même en modification.
 *       ROUGE (1) : C « rouvrir… » (deux ensembles, l'id désigné change).
 * BT5 — wizard-pratique-v2.js, `finaliserCreationPratique` : l'écriture de l'ensemble déplacée APRÈS celle de la pratique.
 *       ROUGE (2) : C « la forme écrite… » et C « une échelle de départ proposée mais non retenue… » (l'ordre du journal).
 * BT6 — pratique-configurable.js : le court-circuit `niveaux_par_cible` de `calculerPerformance` retiré.
 *       ROUGE (1) : D « la pratique se construit, sa note est null… » (le repli lit `indicesCP`).
 * BT7 — reserve.js : `'ensemblesCibles'` retirée de `CLES_SANS_FILTRE`.
 *       ROUGE (1) : E « par trimestre (`CLES_NAMESPACEES`)… Réserve, codex, DATA-OWNERSHIP ».
 * BT8 — ensembles-cibles.js, `ligneFicheHtml` : `esc(c.etiquette)` → `c.etiquette`.
 *       ROUGE (1) : C bis « cours, échelle, niveau… aucune balise reçue n'est rendue telle quelle ».
 */
