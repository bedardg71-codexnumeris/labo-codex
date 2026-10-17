/**
 * « APPORTER MON MATÉRIEL », ÉTAPE 5b DU PLAN « PRÊT POUR LUNDI » — la reconnaissance, d'après douze
 * grilles réelles.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-5b-reconnaissance.md ;
 * numéros (1 à 11) et grilles fictives (F1 à F8) de PROPOSITION-2026-10-17-reconnaissance-des-grilles.md.
 *
 * Ce que ce banc verrouille :
 *   F — LES GRILLES FICTIVES F1 à F8 et F8-texte : la lecture ATTENDUE de la proposition, sans aucun
 *       geste au menu des rôles.
 *   R — LES RÈGLES, une par une : pied et calcul (2), puces (3), points d'un niveau (4), réglette (5),
 *       case de nom et « selon les puces » (6), suites et noms coupés (7), cases à cocher (8), pas
 *       d'en-tête (9), parties en rangée (10), pondération au bout du nom (11), « / 0 » (1).
 *   C — LA CRÉATION d'une grille en points À NIVEAUX : analytique, sans échelle, descripteurs rangés
 *       sous le nom du niveau ; lisibles dans Grilles de critères ; rien ne se perd au partage.
 *   U — L'INTERFACE : Vérification et aperçu avec les niveaux, « Dans l'application », « Aller plus loin ».
 *   N — NON-RÉGRESSION : l'exemple, la grille du lot 3a.
 *
 * ⛔ Aucun texte d'une grille réelle de Grégoire : tout est inventé.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import * as F from './_helpers/grilles-fictives-5b.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

function vraiEchapperHtml(doc) {
    const src = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');
    const fabriquer = new Function('window', 'document', 'console', 'localStorage', 'sessionStorage',
        '"use strict";\n' + src + '\nreturn echapperHtml;');
    const stockage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    return fabriquer({ addEventListener() {}, removeEventListener() {} }, doc || fenetreDom.document, console, stockage, stockage);
}

/** Un faux `db` qui se comporte comme le vrai pour `modifier` (même forme qu'au lot 2). */
const db = {
    store: new Map(),
    reset() { this.store = new Map(); },
    getSync(k, d) { return this.store.has(k) ? JSON.parse(JSON.stringify(this.store.get(k))) : d; },
    async get(k, d) { return this.getSync(k, d); },
    async set(k, v) { this.store.set(k, JSON.parse(JSON.stringify(v))); },
    async modifier(k, mutateur, d) {
        const r = await mutateur(await this.get(k, d));
        if (r === undefined) return undefined;
        await this.set(k, r);
        return r;
    }
};

let w, L, A, C, materiel, grilleEntierementEnPoints;
let compteur = 0;
beforeAll(() => {
    w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-creation.js', { db }, w);
    chargerScript('js/materiel.js', { echapperHtml: vraiEchapperHtml(), db }, w);
    L = w.materielLecture; A = w.materielAssistant; C = w.materielCreation; materiel = w.materiel;
    w.genererIdUnique = (p) => p + 'banc' + (++compteur);
    ({ grilleEntierementEnPoints } = chargerScript('js/gabarits-utils.js', {
        db: { getSync: (c, d) => (d !== undefined ? d : null), setSync() {}, get: async () => null, set: async () => {} },
        cle: (k) => 'test_' + k, echapperHtml: (t) => String(t == null ? '' : t)
    }));
});
beforeEach(() => {
    w.cle = (k) => 'a2032_' + k;
    w.estTrimestreArchive = () => false;
    db.reset();
});

const html = (h) => L.interpreter(L.lireHtml(h), 'colle');
const texte = (t) => L.interpreter(L.lireTexte(t), 'colle');
const noms = (m) => m.criteres.map(c => c.nom.valeur);
const points = (m) => m.criteres.map(c => c.ponderation.valeur);
const raisons = (m) => m.aClasser.map(a => a.raison);
const R = () => L.RAISONS_PIED;

/* ========================================================== F — LES GRILLES FICTIVES */

describe('étape 5b · F — les grilles fictives de la proposition, lues sans un geste', () => {
    it('F1 bande à réglette : 5 critères, points 10, 20, 15, 25, 30 repris ; énoncés en sous-critères sans ↳ ; calcul et total à classer', () => {
        const m = html(F.f1Html());
        expect(noms(m)).toEqual(F.F1_NOMS.concat('LANGUE'));
        expect(points(m)).toEqual(['10', '20', '15', '25', '30']);
        expect(m.criteres.every(c => c.ponderation.etat === 'repris')).toBe(true);
        expect(m.criteres[0].sousCriteres).toEqual(['Énoncé A1.', 'Énoncé B1.', 'Énoncé C1.']);
        expect(raisons(m)).toEqual([R().calcul, R().total]);
        expect(m.enPoints).toBe(true);
        expect(m.niveaux.map(n => n.titre.valeur)).toEqual(['Débutant', 'En progrès', 'Acquis', 'Maîtrisé']);
        expect(m.criteres[0].cases[2].valeur).toBe('Palier 3 du critère 1.\nUn exemple l’appuie.');
        expect(A.calculs(A.preparer(m)).manquants).toEqual(['2 passages à classer ou à écarter']);
    });

    it('F2 bandes à codes + langue : comme au lot 3a ; la bande de langue est un critère ; le calcul à classer, pas dans un descripteur', () => {
        const m = html(F.f2Html());
        expect(m.roles.rangees).toEqual(['ignorer', 'niveaux', 'nomCritere', 'suite', 'nomCritere', 'suite', 'nomCritere', 'critere', 'critere']);
        expect(noms(m)).toEqual(F.F2_NOMS.concat('LANGUE'));
        expect(m.criteres[0].sousCriteres).toEqual(['Tâche un du critère 1', 'Tâche deux du critère 1']);
        expect(m.criteres[2].cases.every(c => !c.valeur)).toBe(true);
        expect(m.niveaux.map(n => n.code.valeur)).toEqual(['I', 'D', 'M', 'E']);
        expect(raisons(m)).toEqual([R().calcul, R().total]);
        expect(m.enPoints).toBe(false);
    });

    it('F3 pondération dans la bande : noms sans « | 0,15 », pondérations 15, 30, 10, 25, 20 ; paragraphes en description ; rétroactions proposées ; rien du pied', () => {
        const m = html(F.f3Html());
        expect(noms(m)).toEqual(F.F3_NOMS);
        expect(points(m)).toEqual(['15', '30', '10', '25', '20']);
        expect(m.criteres[0].description.valeur).toBe('Repère : une idée claire.\nIndice : elle se relie au sujet.\nPiège : la paraphrase.');
        expect(m.criteres[0].sousCriteres).toEqual([]);
        expect(m.nature).toEqual({ valeur: 'retroactions', etat: 'propose' });
        expect(raisons(m)).toEqual([R().calcul, R().total]);
    });

    it('F4a parties et points par niveau : 6 critères, noms sans puce préfixés de leur partie, sous-éléments en sous-critères, points 4, 10, 4, 4, 10, 16', () => {
        const m = html(F.f4aHtml());
        expect(m.roles.rangees).toEqual(['niveaux', 'critere', 'critere', 'partie', 'critere', 'critere', 'partie', 'critere', 'critere', 'critere']);
        expect(noms(m)).toEqual(['PARTIE A – Situer l’œuvre', 'PARTIE A – Résumer le passage', 'PARTIE B – Nommer le procédé',
            'PARTIE B – Citer juste', 'PARTIE C – Interpréter', 'PARTIE C – Conclure']);
        expect(points(m)).toEqual(F.F4A_POINTS.map(String));
        expect(m.criteres[0].sousCriteres).toEqual(['premier élément 1', 'second élément 1']);
        expect(m.enPoints).toBe(true);
        expect(m.criteres[5].cases[3].valeur).toBe('Trace 3 du critère 6.\n13-14-15-16');   // le nombre reste au descripteur
        expect(raisons(m)).toEqual(['Texte avant le tableau', R().total]);
    });

    it('F4b en-têtes d’icônes : deux noms de niveau manquent, nommés ; points repris (max 20) ; calcul et total à classer', () => {
        const m = A.preparer(html(F.f4bHtml()));
        expect(m.niveaux.map(n => n.titre.valeur)).toEqual(['+', '++', '', '']);
        expect(points(m)).toEqual(['4', '20']);
        expect(A.calculs(m).manquants).toEqual(['le nom de 2 niveaux', '2 passages à classer ou à écarter']);
        expect(raisons(m)).toEqual([R().calcul, R().total]);
    });

    it('F5 en-tête à case vide, un niveau sur deux colonnes : le nom du 2e niveau manque ; points 10, 5 et 5 ; « (30 %) » reste au titre', () => {
        const m = A.preparer(html(F.f5Html()));
        expect(m.nom.valeur).toBe('Projet (30 %)');
        expect(noms(m)).toEqual(['Rigueur', 'Engagement', 'Présentation']);
        expect(points(m)).toEqual(['10', '5', '5']);
        expect(A.calculs(m).manquants).toEqual(['le nom d’un niveau', 'un passage à classer ou à écarter']);
        expect(raisons(m)).toEqual([R().total]);
    });

    it('F6 liste à cocher : critères en points, « / 0 » compris ; constats en description ; cases ignorées ; parties ; totaux à classer', () => {
        const m = A.preparer(html(F.f6Html()));
        expect(m.roles.colonnes).toEqual(['noms', 'pond', 'ignorer', 'ignorer', 'description']);
        expect(noms(m)).toEqual(['INTRODUCTION – Sujet amené', 'INTRODUCTION – Sujet posé', 'DÉVELOPPEMENT – Arguments',
            'DÉVELOPPEMENT – Mise en page', 'DÉVELOPPEMENT – Bibliographie', 'LANGUE']);
        expect(points(m)).toEqual(['10', '20', '30', '0', '0', '40']);
        expect(m.criteres[0].description.valeur).toBe('Le sujet est amené de loin.\nIl mène au sujet posé.');
        expect(raisons(m)).toEqual([R().total, R().total]);
        expect(A.calculs(m).manquants).toEqual(['2 passages à classer ou à écarter']);
        expect(A.calculs(m).total).toBe(100);
    });

    it('F7 sans en-tête, crochets séparés, noms coupés : la 1re rangée est un critère ; noms recollés ; 6 critères aux points repris', () => {
        const m = html(F.f7Html());
        expect(m.roles.rangees[0]).toBe('critere');
        expect(noms(m)).toEqual(['Mise en contexte', 'Thèse', 'Arguments', 'Exemples', 'Conclusion', 'Propreté de la copie']);
        expect(points(m)).toEqual(F.F7_POINTS.map(String));
        expect(m.roles.colonnes.filter(r => r === 'ignorer')).toHaveLength(6);
        expect(m.aClasser).toEqual([]);
    });

    it('F8 liste à barème en tableau : chargée sans refus ; 4 critères ; sous-éléments en sous-critères ; commentaires et total à classer', () => {
        const r = L.charger(L.lireHtml(F.f8Html()), 'colle');
        expect(r.erreur).toBeUndefined();
        const m = r.modele;
        expect(noms(m)).toEqual(['Introduction', 'DÉVELOPPEMENT – Argumentation', 'DÉVELOPPEMENT – Citations', 'Conclusion']);
        expect(points(m)).toEqual(['5', '40', '35', '20']);
        expect(m.criteres.map(c => c.sousCriteres)).toEqual([['amener le sujet', 'poser le sujet'], ['idée principale', 'exemples'], ['intégrées', 'commentées'], ['synthèse']]);
        expect(raisons(m)).toEqual([R().commentaires, R().total]);
    });

    it('F8-texte, point de départ de la lecture d’un texte brut (sans règle neuve) : avec tabulations, 4 critères et les lignes sans points à classer ; sans, « pas de tableau »', () => {
        const m = L.charger(L.lireTexte(F.f8Texte(true)), 'colle').modele;
        expect(noms(m)).toEqual(['Introduction', 'Argumentation', 'Citations', 'Conclusion']);
        expect(m.aClasser.filter(a => a.raison === 'Texte après le tableau')).toHaveLength(9);
        expect(L.charger(L.lireTexte(F.f8Texte(false)), 'colle')).toEqual({ erreur: L.MESSAGE_SANS_TABLEAU });
    });

    it('F.z aucune des huit ne demande un geste au menu : les rôles proposés sont ceux qu’on attend', () => {
        [F.f1Html, F.f2Html, F.f3Html, F.f4aHtml, F.f4bHtml, F.f5Html, F.f6Html, F.f7Html, F.f8Html].forEach((f) => {
            const m = html(f());
            expect(m.roles.propose, f.name).toBe(true);
            expect(m.criteres.length, f.name).toBeGreaterThan(0);
        });
    });
});

/* ================================================================ R — LES RÈGLES */

describe('étape 5b · R — les règles, une à une', () => {
    it('R.2a pied : Total, Note finale, « Note : », Résultat → à classer « total » ; « Résultats de… » reste un critère', () => {
        ['Total / 20', 'NOTE FINALE / 100', 'Note : ___', 'Résultat : ___'].forEach((t) => {
            const m = texte('Critère\tPoints\nClarté\t/4\n' + t + '\t');
            expect(raisons(m), t).toEqual([R().total]);
            expect(noms(m), t).toEqual(['Clarté']);
        });
        expect(noms(texte('Critère\tPoints\nRésultats de recherche\t/4\nNotes de lecture\t/6'))).toEqual(['Résultats de recherche', 'Notes de lecture']);
    });

    it('R.2b calcul de la langue (erreurs, mots ET des blancs), pénalité, « Commentaires : » seul → à classer, chacun sa raison', () => {
        expect(raisons(texte('Critère\tPoints\nClarté\t/4\nErreurs : ___ ; mots : ___\t'))).toEqual([R().calcul]);
        expect(raisons(texte('Critère\tPoints\nClarté\t/4\nPénalité de retard\t-10 %'))).toEqual([R().penalite]);
        expect(raisons(texte('Critère\tPoints\nClarté\t/4\nCommentaires :\t'))).toEqual([R().commentaires]);
        // Sans blancs, un descripteur qui parle d'erreurs et de mots est un critère.
        expect(noms(texte('Critère\tA\tB\nLangue\tMoins de 5 erreurs par 100 mots.\tPlus de 10 erreurs par 100 mots.'))).toEqual(['Langue']);
        expect(noms(texte('Critère\tPoints\nCommentaires : soigner la copie\t/4'))).toEqual(['Commentaires : soigner la copie']);
    });

    it('R.2c un pied fusionné garde sa raison (et non « autre forme ») ; une rangée fusionnée ordinaire, toujours « autre forme »', () => {
        const m = html('<table><tr><td>C</td><td>A</td><td>B</td></tr><tr><td>X</td><td>Bien.</td><td>Moins bien.</td></tr>' +
            '<tr><td colspan="3">Total : ___ / 20</td></tr><tr><td colspan="3">Remarque fusionnée</td></tr></table>');
        expect(raisons(m)).toEqual([R().total, 'Ligne d’une autre forme que le tableau (cases fusionnées ?)']);
    });

    it('R.2d une ligne de pied à case de nom vide, sous un critère, n’en est pas la suite : elle va à classer', () => {
        const m = texte('Critère\tPoints\nClarté\t/4\n\tTotal : ___ / 4');
        expect(m.roles.rangees).toEqual(['ignorer', 'critere', 'critere']);
        expect(raisons(m)).toEqual([R().total]);
        expect(m.criteres[0].description.valeur).toBe('');
    });

    it('R.3 les puces ↳ · • ▪ ◦ ‣ ➤ – ☐ ☑ □ ■ * - sont retirées du nom, des sous-critères et de la description', () => {
        const puces = ['↳', '·', '•', '▪', '◦', '‣', '➤', '–', '☐', '☑', '□', '■', '*', '-'];
        puces.forEach((pu) => {
            const m = html('<table><tr><td>C</td><td>Points</td></tr><tr><td><p>' + pu + ' Nom fictif</p><p>' + pu + ' un élément</p></td><td>/4</td></tr>' +
                '<tr><td>Autre</td><td>/6</td></tr></table>');
            expect(noms(m)[0], pu).toBe('Nom fictif');
            expect(m.criteres[0].sousCriteres, pu).toEqual(['un élément']);
        });
    });

    it('R.4a les points d’un niveau : nombre, plage, énumération ; le plus grand est le maximum, repris ; la grille est en points', () => {
        expect(L.pointsDesNiveaux(['Peu.\n1', 'Assez.\n2-3', 'Beaucoup.\n4-5-6'])).toBe(6);
        expect(L.pointsDesNiveaux(['• Rien.', 'Un peu.\n2', 'Beaucoup.\n4'])).toBe(4);   // la 1re case peut s'en passer
        expect(L.pointsDesNiveaux(['Un peu.\n2', '• Rien.', 'Beaucoup.\n4'])).toBe(null);  // une autre, non
        expect(L.pointsDesNiveaux(['Un peu.', 'Beaucoup.\n4'])).toBe(null);                // deux cases à points au moins
        // Relecture de Cowork (C1) : un nombre seul compte (Q1) ; (C2) l'unité aussi ; jamais « % ».
        expect(L.pointsDesNiveaux(['1', '2', '3'])).toBe(3);
        expect(L.pointsDesNiveaux(['Un peu.\n(2 points)', 'Beaucoup.\n4'])).toBe(4);
        expect(L.pointsDesNiveaux(['Peu.\n2 pt', 'Assez.\n3 pts', 'Beaucoup.\n4 points'])).toBe(4);
        expect(L.pointsDesNiveaux(['Peu.\n(2 pts.)', 'Beaucoup.\n(5 POINTS)'])).toBe(5);
        expect(L.pointsDesNiveaux(['Peu.\n2 %', 'Beaucoup.\n4 %'])).toBe(null);
        expect(L.pointsDesNiveaux(['Peu.\n(2', 'Beaucoup.\n4)'])).toBe(null);
        expect(L.pointsDesNiveaux(['Peu.\n2 points de plus', 'Beaucoup.\n4'])).toBe(null);
        const m = html('<table><tr><td>C</td><td>A</td><td>B</td></tr><tr><td>X</td><td><p>Peu.</p><p>0,5</p></td><td><p>Beaucoup.</p><p>2,5</p></td></tr></table>');
        expect(points(m)).toEqual(['2.5']);
        expect(m.criteres[0].ponderation.etat).toBe('repris');
        expect(m.enPoints).toBe(true);
        expect(A.calculs(A.preparer(m)).manquants).toContain('des points en nombre entier de 0 à 100 pour un critère');
    });

    it('R.4c (C1) « Clarté | 10 | 7 | 4 » est une grille en points ; une bande à codes et un en-tête recopié se lisent comme avant', () => {
        const m = texte('Critère\tExcellent\tBien\tFaible\nClarté\t10\t7\t4\nRigueur\t5\t3\t1');
        expect(m.enPoints).toBe(true);
        expect(points(m)).toEqual(['10', '5']);
        expect(m.niveaux.map(n => n.titre.valeur)).toEqual(['Excellent', 'Bien', 'Faible']);
        const f2 = html(F.f2Html());   // les cases « I D M E » d'une bande n'entrent pas dans les cases du critère
        expect(f2.enPoints).toBe(false);
        expect(f2.criteres.map(c => c.ponderation.etat)).toEqual(['complete', 'complete', 'complete']);
        expect(f2.niveaux.map(n => n.code.valeur)).toEqual(['I', 'D', 'M', 'E']);
        const f4a = html(F.f4aHtml());   // les parties qui recopient l'en-tête ne sont pas des critères
        expect(f4a.roles.rangees.filter(r => r === 'partie')).toHaveLength(2);
        expect(points(f4a)).toEqual(F.F4A_POINTS.map(String));
    });

    it('R.4b une grille dont CHAQUE critère tire ses points de ses niveaux est en points ; une grille mixte reste à niveaux', () => {
        const toutes = html(F.f5Html().replace('<tr><td><p>Présentation</p></td><td colspan="4"><p>/ 5</p></td></tr>', ''));
        expect(toutes.enPoints).toBe(true);
        const mixte = html('<table><tr><td>C</td><td>A</td><td>B</td></tr><tr><td>X</td><td><p>Peu.</p><p>1</p></td><td><p>Beaucoup.</p><p>4</p></td></tr>' +
            '<tr><td>Y</td><td>Peu clair.</td><td>Très clair.</td></tr></table>');
        expect(mixte.enPoints).toBe(false);
        expect(points(mixte)).toEqual(['4', '']);
    });

    it('R.5 la réglette : nombres écrits en entier, abrégés par « … », ou « / 5 », sur UNE case fusionnée ; non fusionnée, ce n’en est pas une', () => {
        const ligne = (cases) => L.deplier([[{ t: 'NOM', span: 1, rspan: 1 }].concat(cases)])[0];
        const K = ['noms', 'niveau', 'niveau', 'niveau'];
        expect(L.pointsReglette(ligne([{ t: '0 1 2 3 4 5 6 7 8 9 10 11 12', span: 3, rspan: 1 }]), K)).toBe(12);
        expect(L.pointsReglette(ligne([{ t: '0 1 2 … 25', span: 3, rspan: 1 }]), K)).toBe(25);
        expect(L.pointsReglette(ligne([{ t: '/ 5', span: 3, rspan: 1 }]), K)).toBe(5);
        expect(L.pointsReglette(ligne([{ t: '0 1 2', span: 1, rspan: 1 }, { t: '', span: 1, rspan: 1 }, { t: '', span: 1, rspan: 1 }]), K)).toBe(null);
        expect(L.pointsReglette(ligne([{ t: 'Un texte', span: 3, rspan: 1 }]), K)).toBe(null);
    });

    it('R.6 case de nom : lignes à puce en sous-critères, les autres en description ; « selon les puces » est proposé, en 1re des quatre options', () => {
        expect(L.CHOIX_SUITE.map(o => o.id)).toEqual(['selonPuces', 'sousCriteres', 'description', 'rien']);
        const m = html('<table><tr><td>Critères</td><td>A</td><td>B</td></tr><tr><td><b>CRITÈRE UN</b></td><td>I</td><td>D</td></tr>' +
            '<tr><td><p>Ce qu’on observe.</p><p>• tâche a</p><p>• tâche b</p></td><td>Descr. A.</td><td>Descr. B.</td></tr></table>');
        expect(m.roles.suiteNom).toBe('selonPuces');
        expect(m.criteres[0].sousCriteres).toEqual(['tâche a', 'tâche b']);
        expect(m.criteres[0].description.valeur).toBe('Ce qu’on observe.');
        const tout = L.relire(m, Object.assign({}, m.roles, { suiteNom: 'sousCriteres' }));
        expect(tout.criteres[0].sousCriteres).toEqual(['Ce qu’on observe.', 'tâche a', 'tâche b']);
    });

    it('R.7a une case de nom vide sous un critère : sa suite ; sous une ligne allée à classer, non (« sans nom », lot 1)', () => {
        const m = texte('Critère\tA\tB\nX\tBien.\tMoins bien.\n\tEncore.\tAussi.');
        expect(m.roles.rangees).toEqual(['niveaux', 'critere', 'suite']);
        expect(m.criteres[0].cases.map(c => c.valeur)).toEqual(['Bien.\nEncore.', 'Moins bien.\nAussi.']);
        const apresPied = texte('Critère\tA\tB\nX\tBien.\tMoins bien.\nTotal : ___\t\t\n\tEncore.\tAussi.');
        expect(apresPied.roles.rangees.slice(-1)).toEqual(['critere']);
        expect(raisons(apresPied)).toEqual([R().total, 'Ligne sans nom de critère']);
    });

    it('R.7b un nom coupé sur deux rangées se recolle : une ligne sans ponctuation finale, puis une minuscule, sans points', () => {
        expect(noms(texte('Critère\tPoints\tConstat\nMise en\t/4\tSitué.\ncontexte\t\tExact.'))).toEqual(['Mise en contexte']);
        expect(noms(texte('Critère\tPoints\tConstat\nMise en.\t/4\tSitué.\ncontexte\t\tExact.'))).toEqual(['Mise en.', 'contexte']);   // une ponctuation finale : un critère
        expect(noms(texte('Critère\tPoints\nMise en\t/4\ncontexte\t/2'))).toEqual(['Mise en', 'contexte']);     // ses propres points : un critère
        expect(noms(texte('Critère\tPoints\nMise en\t/4\nContexte\t'))).toEqual(['Mise en', 'Contexte']);       // une majuscule : un critère
    });

    it('R.8 colonnes de cases à cocher → à ignorer ; la rangée de numéros aussi ; les constats en description', () => {
        const m = texte('\t\t1\t2\t\nClarté\t/ 4\t[ ]\t[ ]\tLe propos est clair.\nRigueur\t/ 6\t☐\t☐\tLes faits sont justes.');
        expect(m.roles.colonnes).toEqual(['noms', 'pond', 'ignorer', 'ignorer', 'description']);
        expect(m.roles.rangees[0]).toBe('ignorer');
        expect(m.criteres.map(c => c.description.valeur)).toEqual(['Le propos est clair.', 'Les faits sont justes.']);
        // La rangée de numéros, en plein corps du tableau, n'est pas la suite du critère du dessus.
        expect(texte('Critère\tPoints\t\t\tConstat\nClarté\t/ 4\t[ ]\t[ ]\tClair.\n\t\t1\t2\t\nRigueur\t/ 6\t[ ]\t[ ]\tJuste.').roles.rangees)
            .toEqual(['ignorer', 'critere', 'ignorer', 'critere']);
        // Des nombres seuls, sans case à cocher, ne sont pas une colonne à cocher.
        expect(texte('Critère\tA\tB\nX\t1\t2\nY\t3\t4').roles.colonnes).toEqual(['noms', 'niveau', 'niveau']);
    });

    it('R.9 pas d’en-tête : des points dans la colonne des points, ou des cases longues → la 1re rangée est un critère ; « Critères | /20 » reste un en-tête', () => {
        expect(texte('Clarté\t/ 4\nRigueur\t/ 6').roles.rangees).toEqual(['critere', 'critere']);
        const longues = texte('Clarté\t' + 'x'.repeat(70) + '\t' + 'y'.repeat(70) + '\nRigueur\tBien.\tMoins bien.');
        expect(longues.roles.rangees[0]).toBe('critere');
        expect(texte('Critères\t/ 20\nClarté\t/ 4\nRigueur\t/ 6').roles.rangees).toEqual(['ignorer', 'critere', 'critere']);
        expect(texte('Critère\tPoints\nClarté\t/ 4').roles.rangees).toEqual(['ignorer', 'critere']);
    });

    it('R.10 parties en rangée : majuscules seules suivies d’un critère ; ou les niveaux de l’en-tête recopiés, la case d’angle nommant la 1re', () => {
        const m = texte('Critère\tPoints\nINTRODUCTION\t\nSujet\t/4\nPlan\t/6');
        expect(m.roles.rangees).toEqual(['ignorer', 'partie', 'critere', 'critere']);
        expect(noms(m)).toEqual(['INTRODUCTION – Sujet', 'INTRODUCTION – Plan']);
        expect(texte('Critère\tPoints\nIntroduction\t\nSujet\t/4').roles.rangees[1]).toBe('critere');   // pas en majuscules
        expect(texte('Critère\tPoints\nSujet\t/4\nPLAN\t').roles.rangees[2]).toBe('critere');           // rien ne suit
        expect(texte('Critère\tPoints\nSujet\t/4\nPLAN\t\nTotal : ___\t/ 4').roles.rangees[2]).toBe('critere');   // un pied suit
        expect(texte('Critère\tPoints\nSujet\t/4\nPLAN\t\n\t/ 4').roles.rangees[2]).toBe('critere');               // une case de nom vide suit
        expect(L.ROLES_RANGEES.map(r => r.id)).toContain('partie');
        const sansAngle = html(F.f4aHtml().replace('<td><p>PARTIE A</p></td>', '<td><p>Critères</p></td>').replace(/<tr><td><p>PARTIE [BC]<\/p><\/td>.*?<\/tr>/g, ''));
        expect(noms(sansAngle)[0]).toBe('Situer l’œuvre');   // sans partie recopiée, la case d'angle ne nomme rien
    });

    it('R.11 pondération au bout du nom : « | 0,20 » (décimaux qui totalisent 1 → sur 100), « (25 %) », « – 15 pts », « / 40 »', () => {
        expect(points(texte('Critère\tA\tB\nX | 0,6\tBien.\tMoins.\nY | 0,4\tBien.\tMoins.'))).toEqual(['60', '40']);
        const m = texte('Critère\tA\tB\nThèse (25 %)\tBien.\tMoins.\nPlan – 15 pts\tBien.\tMoins.\nLangue / 40\tBien.\tMoins.');
        expect(noms(m)).toEqual(['Thèse', 'Plan', 'Langue']);
        expect(points(m)).toEqual(['25', '15', '40']);
        expect(noms(texte('Critère\tA\tB\nAnalyse 1/2\tBien.\tMoins.'))).toEqual(['Analyse 1/2']);   // sans espace : du nom
        // Une colonne de pondération passe devant.
        expect(points(texte('Critère\tPondération\tA\nThèse (25 %)\t30\tBien.'))).toEqual(['30']);
    });

    it('R.1 « / 0 » accepté : 0 à 100 ; un nombre négatif ou décimal bloque', () => {
        const m = A.preparer(texte('Barème fictif\nCritère\tPoints\nClarté\t/ 0\nRigueur\t/ 4'));
        expect(points(m)).toEqual(['0', '4']);
        expect(A.calculs(m).manquants).toEqual([]);
        m.criteres[0].ponderation = { valeur: '-1', etat: 'saisi' };
        expect(A.calculs(m).manquants).toEqual(['des points en nombre entier de 0 à 100 pour un critère']);
    });
});

/* ========================================================= C — LA CRÉATION À NIVEAUX */

const ctx = () => ({ id: (pre) => pre + (++compteur), maintenant: '2026-10-17T12:00:00.000Z' });

describe('étape 5b · C — une grille en points à niveaux se crée sans échelle, ses descripteurs sous le nom de leur niveau', () => {
    function f5Complete() {
        const m = A.preparer(html(F.f5Html()));
        m.niveaux[1].titre = { valeur: 'PALIER A+', etat: 'saisi' };
        return A.ecarter(m, m.aClasser[0].id);
    }

    it('C.a la grille seule, analytique ; `grilleEntierementEnPoints` vrai ; ni échelle ni cartouche écrites', async () => {
        const r = await C.creer(f5Complete());
        expect(r.erreur).toBeUndefined();
        expect([...db.store.keys()]).toEqual(['a2032_grillesTemplates']);
        const g = db.getSync('a2032_grillesTemplates')[0];
        expect(grilleEntierementEnPoints(g)).toBe(true);
        expect(g.criteres.map(c => [c.type, c.ponderation])).toEqual([['analytique', 10], ['analytique', 5], ['analytique', 5]]);
        expect(r.resume).toMatchObject({ enPoints: true, totalPoints: 20, descr: true, ids: { echelle: null, cartouche: null } });
    });

    it('C.b les descripteurs, rangés sous le NOM du niveau, sans `echelleId` ; la nature des cases n’y change rien', () => {
        const g = A.construire(f5Complete(), ctx()).grille;
        expect(g.criteres[0].descripteurs).toEqual({ parNiveau: { 'PALIER A': 'Jamais\n0-5', 'PALIER A+': 'Rarement\n6', 'PALIER B': 'Souvent\n7-8', 'PALIER C': 'Toujours\n9-10' } });
        expect(g.criteres[2]).not.toHaveProperty('descripteurs');   // « / 5 » fusionné : aucun texte de niveau
        const retro = A.construire(A.choisirNature(f5Complete(), 'retroactions'), ctx());
        expect(retro.cartouche).toBeNull();
        expect(Object.keys(retro.grille.criteres[0].descripteurs.parNiveau)).toHaveLength(4);
    });

    it('C.c les noms de niveau : requis, uniques, sans « _ » en tête ; ni plage, ni note retenue, ni code demandés', () => {
        const m = f5Complete();
        expect(A.calculs(m).manquants).toEqual([]);
        m.niveaux[1].titre = { valeur: 'palier a', etat: 'saisi' };
        expect(A.calculs(m).manquants).toEqual(['un nom différent pour chaque niveau']);
        m.niveaux[1].titre = { valeur: '_secret', etat: 'saisi' };
        expect(A.calculs(m).manquants).toEqual(['un nom de niveau qui ne commence pas par « _ »']);
    });

    it('C.d Grilles de critères les montre avec le nom de leur niveau, dans l’ordre (`rendreAttenduCritere`)', () => {
        const g = A.construire(f5Complete(), ctx()).grille;
        const dom = new JSDOM('<!doctype html><html><body><div id="listeCriteres"></div></body></html>');
        const store = { 'a2032_echellesTemplates': [] };
        const dbG = { getSync: (k, d) => (k in store ? store[k] : d), get: async (k) => store[k], modifier: async () => {}, set: async () => {} };
        const win = chargerScript('js/grilles.js', {
            db: dbG, cle: (k) => 'a2032_' + k, document: dom.window.document, echapperHtml: vraiEchapperHtml(dom.window.document),
            notifications: { succes() {}, erreur() {}, info() {} }, grilleTemplateActuelle: null
        });
        const div = dom.window.document.createElement('div');
        div.innerHTML = win.rendreAttenduCritere(g.criteres[0]);
        expect([...div.querySelectorAll('.grille-attendu-niveau strong')].map(s => s.textContent)).toEqual(['PALIER A', 'PALIER A+', 'PALIER B', 'PALIER C']);
        expect(div.querySelector('.grille-attendu-niveau p').textContent).toBe('Jamais\n0-5');
    });

    it('C.e rien ne se perd au partage : projetés tels quels, paquet valide ; l’import les garde', () => {
        const g = A.construire(f5Complete(), ctx()).grille;
        g.metadata_cc = { auteur_original: 'Auteur fictif', licence: 'CC BY-NC-SA 4.0', contributeurs: [] };
        const dbP = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
        const wp = chargerScript('js/partage-schemas.js');
        chargerScript('js/partage-validation.js', { db: dbP }, wp);
        chargerScript('js/partage-format.js', { db: dbP }, wp);
        const projete = wp.partageFormat.projeterEntite(g, 'grille');
        expect(projete.criteres.map(c => c.descripteurs)).toEqual(g.criteres.map(c => c.descripteurs));
        const paquet = wp.partageFormat.construirePackage(g, { type: 'grille', identiteAuteur: 'Auteur fictif' });
        expect(wp.partageValidation.validerPackage(paquet).erreurs).toEqual([]);
        // Un `echelleId: null` y serait refusé : c'est pourquoi la grille en points n'en porte pas.
        const avecNull = JSON.parse(JSON.stringify(g));
        avecNull.criteres[0].descripteurs.echelleId = null;
        expect(wp.partageValidation.validerPackage(wp.partageFormat.construirePackage(avecNull, { type: 'grille', identiteAuteur: 'Auteur fictif' })).valide).toBe(false);
        const wie = chargerScript('js/import-export.js');
        expect(wie.assainirObjet(g, wie.SCHEMAS_IMPORT.grille).criteres[0].descripteurs).toEqual(g.criteres[0].descripteurs);
    });
});

/* ================================================================ U — L'INTERFACE */

describe('étape 5b · U — l’interface', () => {
    function rendu(m, id) {
        const etapes = A.etapesPour(m).concat(A.etapesPour(m).indexOf(id) < 0 ? [id] : []);
        const div = fenetreDom.document.createElement('div');
        div.innerHTML = materiel.assistantHtml({ modele: m, etapes, etape: etapes.indexOf(id) });
        return div;
    }

    it('U.a la Vérification d’une grille en points à niveaux : Critère | Description | Points | un nom par niveau ; un descripteur par case', () => {
        const d = rendu(A.preparer(html(F.f5Html())), 'final');
        expect([...d.querySelectorAll('.materiel-verif thead th')].map(th => th.querySelector('label') ? th.querySelector('label').textContent : th.textContent))
            .toEqual(['Critère', 'Description', 'Points', 'Niveau', 'Niveau', 'Niveau', 'Niveau']);
        expect(d.querySelector('#materiel-v-titre-1').value).toBe('');
        expect(d.querySelector('#materiel-v-titre-1').getAttribute('data-param')).toBe('niveau.1.titre');
        expect(d.querySelector('[data-param="case.0.1"]').value).toBe('Rarement\n6');
        expect(d.querySelector('[data-param="case.0.1"]').getAttribute('aria-label')).toBe('Descripteur : Rigueur, niveau ');
        expect(d.querySelector('#materiel-v-min-0, #materiel-v-note-0, #materiel-v-code-0')).toBeNull();   // ni plage, ni note, ni code
        expect(d.querySelector('#materiel-cree li').textContent).toBe('Une grille en points « Projet (30 %) » (3 critères), sur 20, avec ce qui est attendu à chaque niveau.');
    });

    it('U.b sans niveau, la Vérification d’une grille en points est celle de l’étape 5', () => {
        const d = rendu(A.preparer(html(F.f8Html())), 'final');
        expect([...d.querySelectorAll('.materiel-verif thead th')].map(th => th.textContent)).toEqual(['Critère', 'Description', 'Points']);
        expect(d.querySelector('#materiel-cree li').textContent).toBe('Une grille en points « sans nom » (4 critères), sur 100.');
    });

    it('U.c l’aperçu d’une grille en points montre ses niveaux par leur nom, et leurs cases', () => {
        const div = fenetreDom.document.createElement('div');
        div.innerHTML = materiel.apercuHtml(A.preparer(html(F.f4aHtml())));
        expect([...div.querySelectorAll('thead th')].map(th => th.textContent)).toEqual(['Critère', 'Points', 'Absent', 'Partiel', 'Juste', 'Riche']);
        expect(div.querySelectorAll('tbody tr')[0].querySelectorAll('td')).toHaveLength(5);
    });

    it('U.d « Dans l’application » à l’étape des rôles dit ce qui vaut pour la grille lue', () => {
        const mot = (m) => rendu(A.preparer(m), 'roles').querySelector('.materiel-mot-app span').textContent;
        expect(mot(html(F.f5Html()))).toBe('Ce que tu règles ici, l’application s’en sert pour construire ta grille de critères, notée en points : les critères, leurs points, ce qui est attendu à chaque niveau, leurs descriptions et leurs sous-critères. Aucune échelle n’est créée. Rien n’est encore créé.');
        expect(mot(html(F.f8Html()))).toBe('Ce que tu règles ici, l’application s’en sert pour construire ta grille de critères, notée en points : les critères, leurs points, leurs descriptions et leurs sous-critères. Rien n’est encore créé.');
        expect(mot(L.interpreter(L.lireHtml(L.exempleHtml()), 'exemple'))).toContain('et son échelle de performance');
    });

    it('U.e l’étape « Points » dit « de 0 à 100 »', () => {
        const m = A.preparer(texte('Critère\tPoints\nClarté\t\nRigueur\t/4'));
        expect(rendu(m, 'points').querySelector('.materiel-question p').textContent).toContain('un nombre entier de 0 à 100 par critère');
    });

    it('U.f « Aller plus loin » : une grille en points qui décrit ses niveaux a la phrase commune seule ; sans descripteurs, son paragraphe', () => {
        const para = (r) => {
            const div = fenetreDom.document.createElement('div');
            div.innerHTML = materiel.confirmationHtml(r);
            return [...div.querySelectorAll('.materiel-plus-loin p')].length;
        };
        const base = { nom: 'G', nbC: 3, enPoints: true, totalPoints: 20, retro: false, ids: {}, niveaux: [] };
        expect(para(Object.assign({}, base, { descr: true }))).toBe(1);
        expect(para(Object.assign({}, base, { descr: false }))).toBe(2);
    });

    it('U.g la Vérification à niveaux d’une grille en points échappe ce qui vient du document', () => {
        const m = A.preparer(html(F.f5Html().replace('PALIER B', '<img src=x onerror=alert(1)>B')));
        const d = rendu(m, 'final');
        expect(d.querySelector('img')).toBeNull();
    });
});

/* ============================================================ N — NON-RÉGRESSION */

describe('étape 5b · N — comme avant', () => {
    it('N.a l’exemple : à niveaux, mêmes rôles, mêmes pondérations', () => {
        const m = L.interpreter(L.lireHtml(L.exempleHtml()), 'exemple');
        expect(m.enPoints).toBe(false);
        expect(m.roles.rangees).toEqual(['niveaux', 'critere', 'critere', 'critere']);
        expect(points(m)).toEqual(['40', '30', '30']);
        expect(raisons(m)).toEqual(['Texte après le tableau']);
    });
});
