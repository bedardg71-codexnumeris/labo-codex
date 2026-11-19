/**
 * LA GRILLE D'AUTOÉVALUATION DANS LE PDF DES CONSIGNES — lot `autoevaluation-consignes` (19 nov. 2026, fiche #1287 ;
 * ébauche validée par Grégoire de 7 h 52 à 8 h 03).
 *
 * Ce que ce banc verrouille :
 *   Q — « POUR VÉRIFIER » DANS L'ÉDITEUR (`grilles.js`) : la question s'écrit dans `descripteurs.pourVerifier`, sans
 *       poser d'échelle ; vidée, SA clé part, rien d'autre ; bornée ; la case suit les niveaux d'un critère par
 *       niveaux, jamais d'un critère en points ; le geste passe par la file commune.
 *   V — ELLE VOYAGE : partage (projection et validation) et import la gardent ; les deux schémas restent fermés.
 *   P — LA PAGE (`pageAutoevaluation`, `export-pdf.js`) : les deux repères de l'échelle choisie, lus par leur code ;
 *       l'ordre de la grille ; les lignes absentes ; l'échelle sans repères ; le critère sans texte ; les textes de
 *       l'enseignant·e intacts ; les mots de l'élève mot pour mot.
 *   M — LE MODÈLE : la page entre au modèle unique, la case de l'aperçu la retire, sa feuille vient après les
 *       consignes.
 *   H — L'APERÇU : la feuille montre ce que la page contient, échappé.
 *   D — LE PDF DESSINÉ (faux jsPDF qui note ce qui est posé) : une case tracée par ligne, l'italique de la
 *       question, un texte long qui passe à la page suivante sans rien perdre.
 *
 * Break-tests : voir le rapport du lot (plans de travail/RAPPORT-2026-11-19-autoevaluation-consignes.md).
 * Grilles, échelles, productions et textes FICTIFS (textes inventés sur les stratégies de lecture).
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { elementEchappant } from './_helpers/element-echappant.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const NBSP = ' ';

/* ============================================================ données fictives */

const IDME = { id: 'ECH_FICTIVE_IDME', nom: 'Échelle fictive IDME', seuilSuffisance: 'D', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Incomplet' }, { code: 'D', nom: 'En développement' }, { code: 'M', nom: 'Maîtrisé' }, { code: 'E', nom: 'Étendu' }] };
const TROIS = { id: 'ECH_FICTIVE_TROIS', nom: 'Échelle fictive à trois paliers', seuilSuffisance: 'P2', seuilMaitrise: 'P3', niveaux: [
    { code: 'P1', nom: 'Palier un' }, { code: 'P2', nom: 'Palier deux' }, { code: 'P3', nom: 'Palier trois' }] };

const T_D1 = 'Tu nommes au moins trois stratégies de lecture et tu en laisses une trace sur le texte.';
const T_M1 = 'Chaque stratégie nommée laisse une trace précise, et ton système de couleurs reste le même d’une page à l’autre.';
const Q_1 = 'Est-ce qu’un lecteur qui ne te connaît pas retrouverait chaque stratégie sur la page ?';
const T_M2 = 'Ton hypothèse s’appuie sur au moins deux traces de ta lecture.';

const PRODUCTION = { id: 'PROD_F', titre: 'Artefact fictif', activiteApprentissage: 'Appliquer des stratégies de lecture variées',
    objectif: 'Objectif fictif.', tache: 'Tâche fictive.' };

/** Une grille fictive : deux critères décrits aux repères, un décrit ailleurs, un en points, un aux textes vides. */
function grille() {
    return { id: 'GR_F', nom: 'Grille fictive', criteres: [
        { id: 'C1', nom: 'Repérage des stratégies', type: 'holistique', ponderation: 40,
            descripteurs: { echelleId: IDME.id, parNiveau: { I: 'Texte I jamais imprimé.', D: T_D1, M: T_M1, E: 'Texte E jamais imprimé.' }, pourVerifier: Q_1 } },
        { id: 'C2', nom: 'Hypothèse de lecture', type: 'algorithmique', ponderation: 30,
            descripteurs: { echelleId: IDME.id, parNiveau: { M: T_M2 } } },
        { id: 'C3', nom: 'Décrit ailleurs', type: 'holistique', ponderation: 10,
            descripteurs: { echelleId: IDME.id, parNiveau: { E: 'Seul E est décrit.' }, pourVerifier: 'Question sans repère.' } },
        { id: 'C4', nom: 'En points', type: 'analytique', ponderation: 10,
            descripteurs: { echelleId: IDME.id, parNiveau: { D: 'Texte d’un critère en points.' } } },
        { id: 'C5', nom: 'Textes vides', type: 'holistique', ponderation: 10,
            descripteurs: { echelleId: IDME.id, parNiveau: { D: '   ', M: '' }, pourVerifier: '  ' } }
    ] };
}

/* ============================================================ harnais */

function vraiEchapperHtml(document) {
    const src = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');
    const fabriquer = new Function('window', 'document', 'console', 'localStorage', 'sessionStorage',
        '"use strict";\n' + src + '\nreturn echapperHtml;');
    const stockage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    return fabriquer({ addEventListener() {}, removeEventListener() {} }, document, console, stockage, stockage);
}

const K = 'a2032_grillesTemplates';
const cle = (k) => 'a2032_' + k;

/** L'éditeur de grilles monté sur un faux stockage (le harnais du lot `descripteurs-grille`). */
function monterEditeur(grilles) {
    const dom = new JSDOM('<!doctype html><html><body><div id="listeCriteres"></div></body></html>');
    const document = dom.window.document;
    const store = { [K]: grilles, [cle('echellesTemplates')]: [IDME, TROIS] };
    const journal = [];
    let n = 0;
    const db = {
        get: async (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d),
        set: async (k, v) => { store[k] = v; },
        setSync: (k, v) => { store[k] = v; },
        modifier: async (k, mutateur, defaut) => {
            const resultat = await mutateur(k in store ? JSON.parse(JSON.stringify(store[k])) : defaut);
            if (resultat === undefined) return undefined;
            store[k] = resultat;
            journal.push(['ecrit', k]);
            return resultat;
        }
    };
    const echapperHtml = vraiEchapperHtml(document);
    const win = { echapperHtml };
    chargerScript('js/temoin-enregistrement.js', { document }, win);
    win.temoinEnregistrement = { enregistre() {}, fermer() {}, nonEnregistre() {} };
    chargerScript('js/ui-blocs.js', { document }, win);
    chargerScript('js/bareme.js', {}, win);
    chargerScript('js/grilles.js', {
        db, cle, document, echapperHtml, confirm: () => true,
        genererIdUnique: (p) => p + 'banc' + (++n),
        notifications: { succes() {}, erreur() {}, info() {} }, grilleTemplateActuelle: null
    }, win);
    win.afficherCriteresGrille(JSON.parse(JSON.stringify(store[K][0])));
    const carte = (i) => document.querySelectorAll('#listeCriteres .item-liste')[i];
    const question = (i) => carte(i).querySelector('textarea[data-on-change="modifierQuestionVerificationHandler"]');
    const ecrireQuestion = async (i, texte) => {
        const t = question(i);
        t.value = texte;
        await win.modifierQuestionVerificationHandler(t);
        return t;
    };
    const ecritures = () => journal.filter(e => e[0] === 'ecrit' && e[1] === K).length;
    return { win, document, store, carte, question, ecrireQuestion, ecritures, critere: (i) => store[K][0].criteres[i] };
}

const N = () => chargerScript('js/grilles.js', {
    db: { getSync: (k, d) => d, get: async () => null, modifier: async () => {}, set: async () => {} }, cle,
    document: new JSDOM('').window.document, echapperHtml: (s) => s, notifications: {}, grilleTemplateActuelle: null
}).descripteursNiveaux;

function chargerPDF() {
    return chargerScript('js/export-pdf.js', {
        db: { get: async () => null, getSync: (k, d) => (k === 'trimestres' ? [{ id: 'a2032', nom: 'Automne 2032', actif: true }] : (d !== undefined ? d : null)),
              set: async () => {}, setSync: () => {} },
        cle, echapperHtml: (t) => String(t == null ? '' : t), toggleDisplay: () => {}, alert: () => {},
        bareme: { tranchesDuCritere: () => [] },
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
            createElement: (tag) => elementEchappant(tag) }
    });
}
const P = chargerPDF();

/* ============================================================ Q — l'éditeur */

describe('autoévaluation · Q — « Pour vérifier » dans l’éditeur', () => {
    it('Q.a la question s’écrit seule, sans poser d’échelle ; rognée ; un objet neuf, rien de muté', () => {
        const avant = { echelleId: 'ECH_X', parNiveau: { D: 'Texte D.' } };
        const gel = JSON.stringify(avant);
        const r = N().avecQuestion(avant, '  ' + Q_1 + '\n ');
        expect(r).toEqual({ descripteurs: { echelleId: 'ECH_X', parNiveau: { D: 'Texte D.' }, pourVerifier: Q_1 } });
        expect(JSON.stringify(avant)).toBe(gel);
        expect(N().avecQuestion(undefined, Q_1)).toEqual({ descripteurs: { pourVerifier: Q_1 } });
    });

    it('Q.b vidée, SA clé part, rien d’autre ; vide sur vide, et même texte : inchangé', () => {
        const d = { echelleId: 'ECH_X', parNiveau: { D: 'Texte D.' }, pourVerifier: Q_1 };
        expect(N().avecQuestion(d, '  ')).toEqual({ descripteurs: { echelleId: 'ECH_X', parNiveau: { D: 'Texte D.' } } });
        expect(N().avecQuestion({ pourVerifier: Q_1 }, '')).toEqual({ descripteurs: {} });
        expect(N().avecQuestion({ echelleId: 'ECH_X' }, '')).toEqual({ inchange: true });
        expect(N().avecQuestion(undefined, '')).toEqual({ inchange: true });
        expect(N().avecQuestion(d, Q_1)).toEqual({ inchange: true });
    });

    it('Q.c bornée à 5 000 caractères, comme un descripteur', () => {
        expect(N().avecQuestion(undefined, 'x'.repeat(5000)).descripteurs.pourVerifier).toHaveLength(5000);
        expect(N().avecQuestion(undefined, 'x'.repeat(5001))).toEqual({ refuse: 'Une question fait 5 000 caractères au plus' });
    });

    it('Q.d la case suit les niveaux d’un critère par niveaux ; aucune pour un critère en points', () => {
        const m = monterEditeur([grille()]);
        const section = m.carte(0).querySelector('.grille-attendu');
        const enfants = [...section.children];
        const caseQ = m.question(0).parentElement;
        expect(enfants.indexOf(caseQ), 'sous les cases de niveaux').toBe(enfants.indexOf(section.querySelector('.grille-attendu-niveaux')) + 1);
        expect(caseQ.querySelector('strong').textContent).toBe('Pour vérifier');
        expect(m.question(0).value).toBe(Q_1);
        expect(m.question(1).value).toBe('');
        expect(m.question(1), 'un algorithmique se note par niveaux').not.toBeNull();
        expect(m.question(3), 'un critère en points n’a pas la case').toBeNull();
    });

    it('Q.e le geste écrit par la file commune, et vider retire la seule question', async () => {
        const m = monterEditeur([grille()]);
        await m.ecrireQuestion(1, 'Ton hypothèse tient-elle sans ta lecture ?');
        expect(m.critere(1).descripteurs).toEqual({ echelleId: IDME.id, parNiveau: { M: T_M2 }, pourVerifier: 'Ton hypothèse tient-elle sans ta lecture ?' });
        await m.ecrireQuestion(0, '');
        expect(m.critere(0).descripteurs).toEqual({ echelleId: IDME.id, parNiveau: { I: 'Texte I jamais imprimé.', D: T_D1, M: T_M1, E: 'Texte E jamais imprimé.' } });
        expect(m.ecritures()).toBe(2);
    });

    it('Q.f un critère en points n’est jamais touché par le geste (un DOM périmé ne l’écrit pas)', async () => {
        const m = monterEditeur([grille()]);
        const leurre = m.document.createElement('textarea');
        Object.assign(leurre.dataset, { grilleId: 'GR_F', critereIndex: '3' });
        leurre.value = 'x';
        const avant = JSON.stringify(m.store[K]);
        await m.win.modifierQuestionVerificationHandler(leurre);
        expect(JSON.stringify(m.store[K])).toBe(avant);
    });

    it('Q.g une question piégée reste du texte', () => {
        const g = grille();
        g.criteres[0].descripteurs.pourVerifier = '</textarea><img src=x onerror=alert(1)>';
        const m = monterEditeur([g]);
        expect(m.question(0).value).toBe('</textarea><img src=x onerror=alert(1)>');
        // (la carte porte ses icônes de geste : seule l'image injectée compte)
        expect(m.carte(0).querySelectorAll('img[src="x"], [onerror]').length).toBe(0);
    });
});

/* ============================================================ V — le voyage */

describe('autoévaluation · V — la question voyage', () => {
    const wp = chargerScript('js/partage-schemas.js');
    const db = { getSync: (c, d) => (d !== undefined ? d : null), setSync() {} };
    chargerScript('js/partage-validation.js', { db }, wp);
    chargerScript('js/partage-format.js', { db }, wp);
    const wie = chargerScript('js/import-export.js');
    const aPartager = () => {
        const g = grille();
        g.dansBibliotheque = true;
        g.metadata_cc = { auteur_original: 'Auteur fictif', licence: 'CC BY-NC-SA 4.0', contributeurs: [] };
        return g;
    };

    it('V.a le partage la projette et le paquet est valide ; l’import la garde', () => {
        expect(wp.partageFormat.projeterEntite(aPartager(), 'grille').criteres[0].descripteurs.pourVerifier).toBe(Q_1);
        const paquet = wp.partageFormat.construirePackage(aPartager(), { type: 'grille', identiteAuteur: 'Auteur fictif' });
        expect(wp.partageValidation.validerPackage(paquet).erreurs).toEqual([]);
        expect(wie.assainirObjet(aPartager(), wie.SCHEMAS_IMPORT.grille).criteres[0].descripteurs.pourVerifier).toBe(Q_1);
    });

    it('V.b bornes : plus de 5 000 caractères → paquet refusé ; l’import tronque ; les schémas restent fermés', () => {
        const longue = aPartager();
        longue.criteres[0].descripteurs.pourVerifier = 'x'.repeat(5001);
        const paquet = wp.partageFormat.construirePackage(longue, { type: 'grille', identiteAuteur: 'Auteur fictif' });
        expect(wp.partageValidation.validerPackage(paquet).valide).toBe(false);
        expect(wie.assainirObjet(longue, wie.SCHEMAS_IMPORT.grille).criteres[0].descripteurs.pourVerifier).toHaveLength(5000);
        const etrangere = aPartager();
        etrangere.criteres[0].descripteurs.charge = 'x';
        expect(wp.partageFormat.projeterEntite(etrangere, 'grille').criteres[0].descripteurs).not.toHaveProperty('charge');
        expect(wie.assainirObjet(etrangere, wie.SCHEMAS_IMPORT.grille).criteres[0].descripteurs).not.toHaveProperty('charge');
    });
});

/* ============================================================ P — la page */

describe('autoévaluation · P — la page, aux deux repères de l’échelle', () => {
    it('P.a les mots de l’élève, mot pour mot ; les repères de l’échelle ; l’ordre de la grille ; les lignes absentes', () => {
        const page = P.pageAutoevaluation(grille(), IDME, PRODUCTION);
        expect(page.titre).toBe(`Appliquer des stratégies de lecture variées${NBSP}: grille d'autoévaluation`);
        expect(page.introduction).toBe('Avant de remettre ton travail, coche ce que tu trouves dans ta copie. '
            + `Le seuil de réussite correspond au niveau D de l'échelle${NBSP}; le seuil de maîtrise, au niveau M.`);
        expect(page.criteres).toEqual([
            { nom: 'Repérage des stratégies', question: Q_1, lignes: [
                { repere: 'reussite', etiquette: `Réussite${NBSP}:`, texte: T_D1 },
                { repere: 'maitrise', etiquette: `Maîtrise${NBSP}:`, texte: T_M1 }] },
            { nom: 'Hypothèse de lecture', question: null, lignes: [
                { repere: 'maitrise', etiquette: `Maîtrise${NBSP}:`, texte: T_M2 }] }
        ]);
        expect(P.TEXTES_AUTOEVALUATION.pourVerifier).toBe(`Pour vérifier${NBSP}:`);
    });

    it('P.b l’ordre est celui de la grille, pas celui des textes', () => {
        const g = grille();
        g.criteres.reverse();
        expect(P.pageAutoevaluation(g, IDME, PRODUCTION).criteres.map(c => c.nom)).toEqual(['Hypothèse de lecture', 'Repérage des stratégies']);
    });

    it('P.c rien de codé en dur : les repères d’une autre échelle, retrouvés par leur code', () => {
        const g = grille();
        g.criteres[0].descripteurs.parNiveau = { P1: 'Palier un.', P2: 'Palier deux.', P3: 'Palier trois.' };
        const page = P.pageAutoevaluation(g, TROIS, PRODUCTION);
        expect(page.introduction).toContain(`niveau P2 de l'échelle${NBSP}; le seuil de maîtrise, au niveau P3.`);
        expect(page.criteres).toHaveLength(1);
        expect(page.criteres[0].lignes.map(l => l.texte)).toEqual(['Palier deux.', 'Palier trois.']);
        // Un repère écrit autrement que le code du niveau (casse, espaces) le retrouve ; le code imprimé est celui de l'échelle.
        const casse = Object.assign({}, IDME, { seuilSuffisance: ' d ', seuilMaitrise: 'm' });
        expect(P.reperesAutoevaluation(casse)).toEqual({ reussite: 'D', maitrise: 'M' });
    });

    it('P.d une échelle sans ses deux repères, ou dont un repère ne désigne aucun niveau : pas de page', () => {
        const sans = (modif) => P.pageAutoevaluation(grille(), Object.assign({}, IDME, modif), PRODUCTION);
        expect(sans({ seuilSuffisance: undefined, seuilMaitrise: undefined })).toBeNull();
        expect(sans({ seuilSuffisance: undefined })).toBeNull();
        expect(sans({ seuilMaitrise: '' })).toBeNull();
        expect(sans({ seuilMaitrise: 'Z' })).toBeNull();
        expect(P.pageAutoevaluation(grille(), null, PRODUCTION)).toBeNull();
        expect(P.pageAutoevaluation(grille(), { seuilSuffisance: 'D', seuilMaitrise: 'M' }, PRODUCTION), 'sans niveaux').toBeNull();
    });

    it('P.e aucun critère n’a de texte à un repère (seul E décrit, une question seule, un critère en points) : pas de page', () => {
        const g = grille();
        g.criteres = g.criteres.filter(c => ['C3', 'C4', 'C5'].includes(c.id));
        expect(P.pageAutoevaluation(g, IDME, PRODUCTION)).toBeNull();
        expect(P.pageAutoevaluation({ criteres: [] }, IDME, PRODUCTION)).toBeNull();
        expect(P.pageAutoevaluation({ criteres: [{ nom: 'Sans descripteurs', type: 'holistique' }] }, IDME, PRODUCTION)).toBeNull();
    });

    it('P.f le titre : l’activité, sinon le nom de la production ; sans production, pas de page', () => {
        const titre = (prod) => P.pageAutoevaluation(grille(), IDME, prod).titre;
        expect(titre({ titre: 'Artefact fictif' })).toBe(`Artefact fictif${NBSP}: grille d'autoévaluation`);
        expect(titre({ titre: 'Artefact fictif', activiteApprentissage: '  ' })).toBe(`Artefact fictif${NBSP}: grille d'autoévaluation`);
        expect(titre({ titre: 'Artefact fictif', description: 'Activité fictive d’avant' })).toBe(`Activité fictive d’avant${NBSP}: grille d'autoévaluation`);
        expect(P.pageAutoevaluation(grille(), IDME, null)).toBeNull();
    });

    it('P.g les textes de l’enseignant·e, tels qu’écrits : retours à la ligne et signes compris', () => {
        const g = grille();
        const ecrit = 'Première ligne & « guillemets » <b>pas une balise</b>\nSeconde ligne.  ';
        g.criteres[0].descripteurs.parNiveau.D = ecrit;
        g.criteres[0].descripteurs.pourVerifier = ecrit;
        const c = P.pageAutoevaluation(g, IDME, PRODUCTION).criteres[0];
        expect(c.lignes[0].texte).toBe(ecrit);
        expect(c.question).toBe(ecrit);
    });
});

/* ============================================================ M — le modèle */

describe('autoévaluation · M — le modèle et ses feuilles', () => {
    const opts = (plus) => Object.assign({ production: PRODUCTION, inclureObjectif: true, inclureDescription: true }, plus);

    it('M.a la page entre au modèle ; la case de l’aperçu la retire sans effacer qu’elle existe', () => {
        const m = P.construireModeleDocument(grille(), null, opts(), IDME);
        expect(m.autoevaluationDisponible).toBe(true);
        expect(m.autoevaluation).toEqual(P.pageAutoevaluation(grille(), IDME, PRODUCTION));
        const retiree = P.construireModeleDocument(grille(), null, opts({ inclureAutoevaluation: false }), IDME);
        expect(retiree.autoevaluationDisponible).toBe(true);
        expect(retiree.autoevaluation).toBeNull();
        expect(P.feuillesDuDocument(retiree)).toEqual(['consignes', 'evaluation']);
    });

    it('M.b sa feuille vient après les consignes, avant l’évaluation ; à tout cran', () => {
        expect(P.feuillesDuDocument(P.construireModeleDocument(grille(), null, opts(), IDME))).toEqual(['consignes', 'autoevaluation', 'evaluation']);
        expect(P.feuillesDuDocument(P.construireModeleDocument(grille(), null, opts({ cran: 'consignes' }), IDME))).toEqual(['consignes', 'autoevaluation']);
        // Une production sans aucun bloc coché garde sa feuille de consignes (la date de remise, #498) : la grille
        // d'autoévaluation vient toujours après une feuille, jamais en tête du document.
        const sansConsignes = { titre: 'Artefact fictif', activiteApprentissage: 'Activité fictive' };
        expect(P.feuillesDuDocument(P.construireModeleDocument(grille(), null, { production: sansConsignes }, IDME))).toEqual(['consignes', 'autoevaluation', 'evaluation']);
    });

    it('M.c un appelant qui ne donne pas d’échelle n’a pas de page (le document d’avant, inchangé)', () => {
        const m = P.construireModeleDocument(grille(), null, opts());
        expect(m.autoevaluationDisponible).toBe(false);
        expect(P.feuillesDuDocument(m)).toEqual(['consignes', 'evaluation']);
    });
});

/* ============================================================ H — l'aperçu */

describe('autoévaluation · H — la feuille de l’aperçu', () => {
    const rendu = (partie, g = grille(), plus = {}) => P.genererApercuCombine(g, IDME, null,
        Object.assign({ production: PRODUCTION, inclureNomProduction: true, inclureObjectif: true, partie }, plus));

    it('H.a la feuille porte son titre, l’introduction, les critères, une case par ligne et la question en italique', () => {
        const html = rendu('autoevaluation');
        expect(html).toContain(`Appliquer des stratégies de lecture variées${NBSP}: grille d'autoévaluation`);
        expect(html).toContain('Avant de remettre ton travail, coche ce que tu trouves dans ta copie.');
        expect(html).toContain('Repérage des stratégies');
        expect(html).toContain(`Réussite${NBSP}: ${T_D1}`);
        expect(html).toContain(`Maîtrise${NBSP}: ${T_M2}`);
        expect(html.match(/data-case-a-cocher/g)).toHaveLength(3);
        expect(html).toMatch(new RegExp(`font-style: italic;[^>]*>Pour vérifier${NBSP}: ` + Q_1.replace(/[?]/g, '\\?')));
        expect(html).not.toContain('Texte E jamais imprimé');
        expect(html).not.toContain('Décrit ailleurs');
        expect(html.indexOf('Repérage des stratégies')).toBeLessThan(html.indexOf('Hypothèse de lecture'));
    });

    it('H.b les autres feuilles ne la montrent pas ; « tout » la place entre consignes et évaluation', () => {
        expect(rendu('consignes')).not.toContain('data-autoevaluation');
        expect(rendu('evaluation')).not.toContain('data-autoevaluation');
        const tout = P.genererApercuCombine(grille(), IDME, null, { production: PRODUCTION, inclureObjectif: true, cran: 'evaluation' });
        expect(tout.indexOf('Objectif fictif.')).toBeLessThan(tout.indexOf('data-autoevaluation'));
        expect(tout.indexOf('data-autoevaluation')).toBeLessThan(tout.indexOf('<table'));
    });

    it('H.c un texte piégé reste du texte', () => {
        const g = grille();
        g.criteres[0].descripteurs.parNiveau.D = '<img src=x onerror=alert(1)>';
        g.criteres[0].nom = '<script>x</script>';
        const html = rendu('autoevaluation', g);
        expect(html).not.toContain('<img src=x');   // (le pied de page porte l'image de la licence, légitime)
        expect(html).not.toContain('<script>');
        expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });
});

/* ============================================================ D — le PDF dessiné */

const HAUTEUR = 279.4, LARGEUR = 215.9, LIMITE = HAUTEUR - 13;

/** Un jsPDF de banc : il note chaque texte, case et police avec la page qui avait cours. */
function fauxDoc() {
    const journal = [];
    let page = 1, police = 'normal';
    return {
        journal,
        internal: { pageSize: { getHeight: () => HAUTEUR, getWidth: () => LARGEUR } },
        addPage() { page += 1; journal.push({ type: 'addPage', page }); },
        setFont(_f, style) { police = style; }, setFontSize() {}, setTextColor() {}, setDrawColor() {}, setLineWidth() {},
        rect(x, y, l, h, mode) { journal.push({ type: 'rect', page, x, y, l, h, mode }); },
        // 40 caractères par ligne : déterministe, de quoi fabriquer un débordement.
        splitTextToSize(texte) {
            const s = String(texte), lignes = [];
            for (let i = 0; i < s.length; i += 40) lignes.push(s.slice(i, i + 40));
            return lignes.length ? lignes : [''];
        },
        text(contenu, x, y) { journal.push({ type: 'text', page, x, y, texte: String(contenu), police }); }
    };
}

describe('autoévaluation · D — le PDF dessiné', () => {
    const page = () => P.pageAutoevaluation(grille(), IDME, PRODUCTION);

    it('D.a une case tracée par ligne, à côté de la première ligne de son texte ; le nom en gras, la question en italique', () => {
        const doc = fauxDoc();
        P.poserAutoevaluationPDF(doc, page(), 40, LARGEUR - 26, 0.85);
        const cases = doc.journal.filter(e => e.type === 'rect');
        expect(cases).toHaveLength(3);
        cases.forEach(c => expect(c.mode).toBe('S'));
        const textes = doc.journal.filter(e => e.type === 'text');
        const premiere = (debut) => textes.find(t => t.texte.startsWith(debut));
        expect(premiere('Repérage des strat').police).toBe('bold');
        expect(premiere(`Réussite${NBSP}: `).police).toBe('normal');
        expect(premiere(`Pour vérifier${NBSP}: `).police).toBe('italic');
        // Chaque case est sur la ligne de base de son texte (le carré la chevauche), sur la même page.
        [`Réussite${NBSP}: Tu nommes`, `Maîtrise${NBSP}: Chaque`, `Maîtrise${NBSP}: Ton hyp`].forEach((debut, i) => {
            const t = premiere(debut.slice(0, 20));
            expect(cases[i].page).toBe(t.page);
            expect(cases[i].y).toBeLessThan(t.y);
            expect(cases[i].y + cases[i].h).toBeGreaterThanOrEqual(t.y);
            expect(cases[i].x).toBeLessThan(t.x);
        });
        // Aucun caractère de case n'est écrit : ils s'impriment « & » avec les polices de jsPDF (mesuré le 19 nov.).
        expect(textes.some(t => /[☐□]/.test(t.texte))).toBe(false);
    });

    it('D.b un texte long passe à la page suivante : rien sous la limite, rien de perdu, l’ordre gardé', () => {
        const g = grille();
        const long = 'Phrase fictive de remplissage. '.repeat(160);   // ~5 000 caractères
        g.criteres[0].descripteurs.parNiveau.D = long;
        g.criteres[0].descripteurs.parNiveau.M = long;
        const pg = P.pageAutoevaluation(g, IDME, PRODUCTION);
        const doc = fauxDoc();
        P.poserAutoevaluationPDF(doc, pg, 40, LARGEUR - 26, 0.85);
        expect(doc.journal.filter(e => e.type === 'addPage').length).toBeGreaterThan(0);
        const textes = doc.journal.filter(e => e.type === 'text');
        expect(textes.filter(t => t.y > LIMITE)).toEqual([]);
        const attendu = [pg.introduction, ...pg.criteres.flatMap(c => [c.nom, ...c.lignes.map(l => l.etiquette + ' ' + l.texte),
            ...(c.question ? [P.TEXTES_AUTOEVALUATION.pourVerifier + ' ' + c.question] : [])])].join('');
        expect(textes.map(t => t.texte).join('')).toBe(attendu);
        // Une case ne reste jamais seule au bas d'une page : elle est sur la page de sa première ligne.
        doc.journal.filter(e => e.type === 'rect').forEach(c => {
            expect(textes.some(t => t.page === c.page && Math.abs(t.y - (c.y + c.h - 0.3)) < 0.01)).toBe(true);
        });
    });

    it('D.c le nom d’un critère ne reste pas seul au bas d’une page', () => {
        const doc = fauxDoc();
        P.poserAutoevaluationPDF(doc, page(), LIMITE - 6, LARGEUR - 26, 0.85);
        const textes = doc.journal.filter(e => e.type === 'text');
        const nom = textes.find(t => t.texte === 'Repérage des stratégies');
        const suivant = textes[textes.indexOf(nom) + 1];
        expect(suivant.page).toBe(nom.page);
    });
});
