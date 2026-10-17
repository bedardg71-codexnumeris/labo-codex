/**
 * « APPORTER MON MATÉRIEL », LOT 3a — dire à l'application ce qu'est chaque partie du tableau.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-3a-roles.md (« Les bancs »).
 *
 * Ce que ce banc verrouille :
 *   D — DÉPLIER : une case fusionnée (colspan, rowspan, les deux) donne une grille régulière,
 *       son texte dans la première case, les suivantes vides et marquées.
 *   R — RETOURS À LA LIGNE : un paragraphe, un élément de liste, un <br> donnent un `\n` ;
 *       les retours du source HTML ne sont que des blancs.
 *   G — LA GRILLE FICTIVE de même forme que celle de Grégoire (textes inventés) : lue juste
 *       sans rien toucher.
 *   P — PROPOSER : la grille fictive, l'exemple, les grilles simples du lot 1.
 *   M — RÔLES → MODÈLE : chaque rôle de rangée et de colonne ; un seul « Noms des niveaux » ;
 *       une suite orpheline signalée ; changer un rôle relit tout.
 *   C — CODES : repris, complétés en repli ; requis, uniques sans la casse, 1 à 4 caractères,
 *       sans souligné ; modifier un titre ne touche pas un code repris ou saisi.
 *   F — FORME : critère et sous-critères créés ont la forme de l'éditeur (`grilles.js`).
 *   S — L'ÉTAPE « Ce que contient ton tableau » : un menu par rangée et par colonne, étiqueté ;
 *       tout texte venu du document en sort échappé.
 *
 * ⛔ Aucun texte de la grille réelle de Grégoire : tâches, descripteurs et noms sont inventés.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

function vraiEchapperHtml() {
    const src = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');
    const fabriquer = new Function('window', 'document', 'console', 'localStorage', 'sessionStorage',
        '"use strict";\n' + src + '\nreturn echapperHtml;');
    const stockage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    return fabriquer({ addEventListener() {}, removeEventListener() {} }, fenetreDom.document, console, stockage, stockage);
}

let w, L, A, materiel;
let compteur = 0;
beforeAll(() => {
    w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel.js', { echapperHtml: vraiEchapperHtml(), db: { getSync: (k, d) => d } }, w);
    L = w.materielLecture; A = w.materielAssistant; materiel = w.materiel;
});
beforeEach(() => { w.cle = (k) => 'a2032_' + k; });

/* ------------------------------------------------------------------ la grille fictive */

const NIVEAUX = ['Incomplet', 'En développement', 'Maîtrisé', 'Étendu'];
const CRITERES = [
    { nom: 'COMPRÉHENSION DU CORPUS', taches: ['Résumer chaque extrait', 'Situer l’époque', 'Nommer le narrateur'] },
    { nom: 'TRAVAIL DES CITATIONS', taches: ['Choisir une citation courte', 'L’introduire', 'La commenter', 'Donner la page', 'Éviter la paraphrase'] },
    { nom: 'STRUCTURE DE L’ANALYSE', taches: ['Annoncer le plan', 'Une idée par paragraphe', 'Relier les parties', 'Conclure', 'Ouvrir', 'Relire le tout', 'Titrer'] },
    { nom: 'CLARTÉ DE L’EXPRESSION', taches: ['Phrases complètes', 'Vocabulaire juste', 'Ponctuation soignée', 'Registre constant'] }
];
const descripteur = (i, j) => `Le critère ${i + 1} est atteint au palier ${j + 1}.\nUn exemple précis l’appuie.`;

/**
 * Même FORME que la grille collée par Grégoire le 17 oct. (Pages) : deux rangées d'en-tête,
 * la première case fusionnée sur les deux ; pour chaque critère, une bande « NOM | I | D | M | E »
 * puis une rangée « tâches en lignes ☐ | quatre descripteurs ». Paragraphes et <br> comme Pages ;
 * des retours dans le SOURCE HTML, qui ne sont que des blancs.
 */
function grilleFictiveHtml() {
    const p = (t) => t.split('\n').map(l => '<p>' + l + '</p>').join('\n      ');
    let h = '<p>Analyse littéraire : grille fictive</p>\n<table>\n' +
        '<tr><td rowspan="2"><p>Critères</p></td><td>Premier palier</td><td>Deuxième palier</td><td>Troisième palier</td><td>Quatrième palier</td></tr>\n' +
        '<tr>' + NIVEAUX.map(n => '<td><p>' + n.toUpperCase() + '</p></td>').join('') + '</tr>\n';
    CRITERES.forEach((c, i) => {
        h += '<tr><td><p><b>' + c.nom + '</b></p></td><td>I</td><td>D</td><td>M</td><td>E</td></tr>\n';
        h += '<tr><td>\n      ' + c.taches.map(t => '<p>☐ ' + t + '</p>').join('\n      ') + '\n    </td>' +
            NIVEAUX.map((n, j) => '<td>' + p(descripteur(i, j)) + '</td>').join('') + '</tr>\n';
    });
    return h + '</table>';
}

const fictive = () => L.interpreter(L.lireHtml(grilleFictiveHtml()), 'colle');
const exemple = () => L.interpreter(L.lireHtml(L.exempleHtml()), 'exemple');
const texte = (t) => L.interpreter(L.lireTexte(t), 'colle');

/* ================================================================ D — DÉPLIER */

describe('lot 3a · D — les cases fusionnées sont dépliées', () => {
    it('D.a colspan : le texte dans la première case, les suivantes vides et marquées', () => {
        const g = L.deplier(L.lireHtml('<table><tr><td>C</td><td colspan="2">Niveaux</td></tr><tr><td>X</td><td>1</td><td>2</td></tr></table>').rangees);
        expect(g.map(r => r.length)).toEqual([3, 3]);
        expect(g[0].map(c => [c.t, c.fusion, c.suite])).toEqual([['C', false, ''], ['Niveaux', true, ''], ['', true, 'h']]);
    });

    it('D.b rowspan : le texte dans la première rangée, la case du dessous vide et marquée', () => {
        const g = L.deplier(L.lireHtml('<table><tr><td rowspan="2">C</td><td>A</td></tr><tr><td>B</td></tr></table>').rangees);
        expect(g.map(r => r.map(c => c.t))).toEqual([['C', 'A'], ['', 'B']]);
        expect(g[1][0]).toEqual({ t: '', fusion: true, suite: 'v' });
    });

    it('D.c les deux à la fois : un bloc 2 × 2', () => {
        const g = L.deplier(L.lireHtml('<table><tr><td colspan="2" rowspan="2">Bloc</td><td>a</td></tr><tr><td>b</td></tr><tr><td>c</td><td>d</td><td>e</td></tr></table>').rangees);
        expect(g.map(r => r.map(c => c.t))).toEqual([['Bloc', '', 'a'], ['', '', 'b'], ['c', 'd', 'e']]);
        expect(g[0].map(c => c.suite)).toEqual(['', 'h', '']);
        expect(g[1].map(c => c.suite)).toEqual(['v', 'v', '']);
        expect(g.every(r => r.length === 3)).toBe(true);
    });

    it('D.d une rangée plus courte que le tableau (dépliage impossible) : marquée, et elle seule va à classer', () => {
        const m = texte('C\tA\tB\nX\t1\t2\nY\t3');
        expect(m.tableau[2][2]).toMatchObject({ manque: true });
        expect(m.criteres.map(c => c.nom.valeur)).toEqual(['X']);
        expect(m.aClasser.map(a => a.raison)).toEqual(['Ligne d’une autre forme que le tableau (cases fusionnées ?)']);
    });
});

/* ========================================================== R — RETOURS À LA LIGNE */

describe('lot 3a · R — les retours à la ligne d’une case survivent', () => {
    it('R.a <p>, <li>, <br> : un retour chacun ; lignes vides resserrées ; retours du source = blancs', () => {
        const lu = L.lireHtml('<table><tr><td>C</td><td>A</td></tr><tr><td>\n  un\n  mot\n</td>' +
            '<td><p>Un</p><p>&nbsp;</p><ul><li>deux</li><li>trois</li></ul>quatre<br><br>cinq</td></tr></table>');
        expect(lu.rangees[1][0].t).toBe('un mot');
        expect(lu.rangees[1][1].t).toBe('Un\ndeux\ntrois\nquatre\ncinq');
    });

    it('R.b les noms de critère et de niveau restent sur une ligne ; les descripteurs gardent leurs retours', () => {
        const m = L.interpreter(L.lireHtml('<table><tr><td>C</td><td><p>Très</p><p>bien</p></td><td>Faible</td></tr>' +
            '<tr><td><p>Thèse</p><p>claire</p></td><td><p>Oui.</p><p>Nuancée.</p></td><td>Non.</td></tr></table>'), 'colle');
        expect(m.niveaux[0].titre.valeur).toBe('Très bien');
        expect(m.criteres[0].nom.valeur).toBe('Thèse claire');
        expect(m.criteres[0].cases[0].valeur).toBe('Oui.\nNuancée.');
    });

    it('R.c l’aperçu et la Vérification montrent les retours (texte échappé, CSS pre-line)', () => {
        const m = A.preparer(fictive());
        expect(materiel.apercuHtml(m)).toContain('Le critère 1 est atteint au palier 1.\nUn exemple précis l’appuie.');
        const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');
        expect(css).toMatch(/\.materiel-case, \.materiel-description \{ white-space: pre-line; \}/);
    });
});

/* ===================================================== G — LA GRILLE FICTIVE, SANS RIEN TOUCHER */

describe('lot 3a · G — une grille de la forme de celle de Grégoire se lit juste sans rien toucher', () => {
    it('G.a quatre critères nommés par les bandes, rien à classer', () => {
        const m = fictive();
        expect(m.criteres.map(c => c.nom.valeur)).toEqual(CRITERES.map(c => c.nom));
        expect(m.aClasser).toEqual([]);
        expect(m.manquesLecture).toEqual([]);
        expect(m.nom.valeur).toBe('Analyse littéraire : grille fictive');
    });

    it('G.b les niveaux de la SECONDE rangée d’en-tête, codés I, D, M, E repris des bandes', () => {
        const m = fictive();
        expect(m.niveaux.map(n => n.titre.valeur)).toEqual(NIVEAUX.map(n => n.toUpperCase()));
        expect(m.niveaux.map(n => n.code)).toEqual(['I', 'D', 'M', 'E'].map(v => ({ valeur: v, etat: 'repris' })));
    });

    it('G.c les tâches en sous-critères, une par ligne, sans les ☐ ; les descripteurs intacts, retours gardés', () => {
        const m = fictive();
        expect(m.criteres.map(c => c.sousCriteres)).toEqual(CRITERES.map(c => c.taches));
        m.criteres.forEach((c, i) => expect(c.cases.map(d => d.valeur)).toEqual(NIVEAUX.map((n, j) => descripteur(i, j))));
    });

    it('G.d les rôles proposés : en-têtes, puis bandes et suites ; colonnes : noms puis quatre niveaux', () => {
        const r = fictive().roles;
        expect(r.rangees).toEqual(['ignorer', 'niveaux', 'nomCritere', 'suite', 'nomCritere', 'suite', 'nomCritere', 'suite', 'nomCritere', 'suite']);
        expect(r.colonnes).toEqual(['noms', 'niveau', 'niveau', 'niveau', 'niveau']);
        expect(r.suiteNom).toBe('sousCriteres');
        expect(r.propose).toBe(true);
    });

    it('G.e parts égales (le document n’en donne pas) ; la création n’attend que plages et notes', () => {
        let m = A.preparer(fictive());
        expect(m.criteres.map(c => c.ponderation)).toEqual(['25', '25', '25', '25'].map(v => ({ valeur: v, etat: 'complete' })));
        m.niveaux.forEach((n, j) => {
            n.min = { valeur: String(j * 25), etat: 'saisi' };
            n.max = { valeur: String(j * 25 + 24), etat: 'saisi' };
            n.note = { valeur: String(j * 25 + 12), etat: 'saisi' };
        });
        expect(A.calculs(m).manquants).toEqual([]);
    });
});

/* ================================================================ P — PROPOSER */

describe('lot 3a · P — ce que propose l’application', () => {
    it('P.a l’exemple : une rangée de niveaux, trois critères, une colonne de pondération ; lu comme avant', () => {
        const m = exemple();
        expect(m.roles.rangees).toEqual(['niveaux', 'critere', 'critere', 'critere']);
        expect(m.roles.colonnes).toEqual(['noms', 'pond', 'niveau', 'niveau', 'niveau', 'niveau']);
        expect(m.criteres.map(c => [c.nom.valeur, c.ponderation.valeur])).toEqual([['Contenu', '40'], ['Organisation', '30'], ['Communication', '30']]);
        expect(m.criteres.every(c => c.sousCriteres.length === 0 && c.description.valeur === '')).toBe(true);
    });

    it('P.b les grilles simples du lot 1 : une rangée d’en-tête, chaque rangée un critère', () => {
        ['C\tA\tB\nX\t1\t2\nY\t1\t2\nZ\t1\t2', 'C\tPondération\tA\tB\nX\t50\t1\t2\nY\t\t1\t2',
            'C\tA\tB\nX\tTu as bien cerné la thèse.\tRevois ton plan.\nY\tBien.\tPeu clair.'].forEach((t) => {
            const m = texte(t);
            expect(m.roles.rangees.slice(1).every(r => r === 'critere'), t).toBe(true);
            expect(m.roles.rangees[0], t).toBe('niveaux');
        });
    });

    it('P.c une rangée de codes et une de plages sous la rangée des niveaux sont reconnues', () => {
        const m = texte('Critère\tExcellent\tFaible\n\tEX\tFA\n\t80-100\t0 à 79 %\nClarté\tTrès clair\tConfus');
        expect(m.roles.rangees).toEqual(['niveaux', 'codes', 'plages', 'critere']);
        expect(m.niveaux.map(n => [n.code.valeur, n.code.etat, n.min.valeur, n.max.valeur])).toEqual([['EX', 'repris', '80', '100'], ['FA', 'repris', '0', '79']]);
    });

    it('P.d des cases de bande différentes d’une bande à l’autre ne sont pas des codes', () => {
        const m = texte('C\tA\tB\nUn\tx\ty\n\tTexte long un.\tTexte long deux.\nDeux\tz\tw\n\tAutre texte.\tEncore un.');
        expect(m.roles.rangees).toEqual(['niveaux', 'nomCritere', 'suite', 'nomCritere', 'suite']);
        expect(m.niveaux.map(n => n.code.etat)).toEqual(['complete', 'complete']);
    });
});

/* ========================================================== M — DES RÔLES AU MODÈLE */

describe('lot 3a · M — chaque rôle, et le modèle qui en découle', () => {
    const avec = (m, sorte, i, role) => L.relire(m, L.changerRole(m.roles, sorte, i, role));

    it('M.a « Suite du critère » → « À ignorer » retire ses sous-critères et ses descripteurs', () => {
        const m = avec(fictive(), 'rangees', 3, 'ignorer');
        expect(m.criteres[0].sousCriteres).toEqual([]);
        expect(m.criteres[0].cases.map(d => d.valeur)).toEqual(['', '', '', '']);
        expect(m.criteres[1].sousCriteres).toEqual(CRITERES[1].taches);
    });

    it('M.b « Un critère » : nom, cases, pondération de la colonne qui la porte', () => {
        const m = avec(fictive(), 'rangees', 2, 'critere');
        // Ses cases de niveau deviennent des descripteurs ; la suite au-dessous s'y ajoute, après un retour.
        expect(m.criteres[0].cases.map(d => d.valeur)).toEqual(['I', 'D', 'M', 'E'].map((c, j) => c + '\n' + descripteur(0, j)));
        expect(m.criteres[0].nom.valeur).toBe(CRITERES[0].nom);
    });

    it('M.c une seule « Noms des niveaux » : en choisir une autre fait passer la précédente à « À ignorer »', () => {
        const r = L.changerRole(fictive().roles, 'rangees', 0, 'niveaux');
        expect(r.rangees.slice(0, 2)).toEqual(['niveaux', 'ignorer']);
        expect(r.rangees.filter(x => x === 'niveaux')).toHaveLength(1);
        expect(r.propose).toBe(false);
        const m = L.relire(fictive(), r);
        expect(m.niveaux.map(n => n.titre.valeur)).toEqual(['Premier palier', 'Deuxième palier', 'Troisième palier', 'Quatrième palier']);
    });

    it('M.d une « Suite du critère » sans critère au-dessus est signalée dans « Avant de créer, il reste »', () => {
        const m = A.preparer(avec(avec(fictive(), 'rangees', 2, 'ignorer'), 'rangees', 1, 'ignorer'));
        expect(m.manquesLecture).toEqual(['un critère au-dessus de la rangée 4 (« Suite du critère »), à l’étape « Ce que contient ton tableau »']);
        expect(A.calculs(m).manquants).toContain(m.manquesLecture[0]);
    });

    it('M.e « Codes des niveaux », « Plages de notes » : une rangée choisie les donne', () => {
        let m = texte('C\tA\tB\n\tx1\ty1\n\t10-20\t21-30\nX\tTexte un.\tTexte deux.');
        m = avec(avec(m, 'rangees', 1, 'codes'), 'rangees', 2, 'plages');
        expect(m.niveaux.map(n => [n.code.valeur, n.min.valeur, n.max.valeur])).toEqual([['x1', '10', '20'], ['y1', '21', '30']]);
    });

    it('M.f la case de la colonne des noms d’une suite : sous-critères, description, ou rien', () => {
        const choix = (v) => L.relire(fictive(), Object.assign({}, fictive().roles, { suiteNom: v })).criteres[0];
        expect(choix('sousCriteres').sousCriteres).toEqual(CRITERES[0].taches);
        expect(choix('description').description.valeur).toBe(CRITERES[0].taches.map(t => '☐ ' + t).join('\n'));
        expect(choix('description').sousCriteres).toEqual([]);
        expect(choix('rien').sousCriteres).toEqual([]);
        expect(choix('rien').description.valeur).toBe('');
    });

    it('M.g colonnes « Sous-critères », « Description du critère », « À ignorer », « Pondération »', () => {
        let m = texte('C\tTâches\tNote\tPoids\tA\tB\nX\t• a\tUne description.\t60\tDescr. A.\tDescr. B.\nY\tb\tAutre.\t40\tDescr. C.\tDescr. D.');
        m = avec(avec(avec(m, 'colonnes', 1, 'sousCriteres'), 'colonnes', 2, 'description'), 'colonnes', 3, 'pond');
        expect(m.criteres.map(c => [c.sousCriteres, c.description.valeur, c.ponderation.valeur])).toEqual([[['a'], 'Une description.', '60'], [['b'], 'Autre.', '40']]);
        expect(m.niveaux.map(n => n.titre.valeur)).toEqual(['A', 'B']);
        m = avec(m, 'colonnes', 5, 'ignorer');
        expect(m.niveaux.map(n => n.titre.valeur)).toEqual(['A']);
    });

    it('M.h sans colonne « Un niveau » ni « Noms des critères » : deux manques nommés, aucun critère inventé', () => {
        let m = texte('C\tA\tB\nX\t1\t2');
        m = avec(avec(avec(m, 'colonnes', 1, 'ignorer'), 'colonnes', 2, 'ignorer'), 'colonnes', 0, 'ignorer');
        expect(m.manquesLecture).toEqual([
            'au moins une colonne « Un niveau », à l’étape « Ce que contient ton tableau »',
            'une colonne « Noms des critères », à l’étape « Ce que contient ton tableau »'
        ]);
        expect(m.criteres).toEqual([]);
        expect(m.aClasser).toEqual([]);
    });

    it('M.i changer un rôle relit tout : nom et nature choisie gardés ; étapes recalculées, étape courante gardée', () => {
        let m = A.preparer(fictive());
        m.nom = { valeur: 'Mon nom', etat: 'saisi' };
        m = A.choisirNature(m, 'retroactions');
        const etapes = A.etapesPour(m);
        const k = etapes.indexOf('roles');
        const relue = A.choisirRole(m, 'rangees', 3, 'ignorer');
        expect(relue.nom).toEqual({ valeur: 'Mon nom', etat: 'saisi' });
        expect(relue.nature).toEqual({ valeur: 'retroactions', etat: 'choisi' });
        expect(relue.niveaux.every(n => n.note.etat === 'remplir')).toBe(true);   // préparé
        expect(A.recalculerEtapes(relue, etapes, k)).toEqual({ etapes: A.etapesPour(relue), etape: A.etapesPour(relue).indexOf('roles') });
        expect(A.choisirRole(m, 'rangees', 3, 'suite')).toBe(m);           // même rôle : rien
        expect(A.choisirRole(m, 'rangees', 3, 'inconnu')).toBe(m);         // rôle hors liste : rien
    });

    it('M.j une inversion remet les rôles à la proposition de l’application', () => {
        const m = L.relire(fictive(), L.changerRole(fictive().roles, 'rangees', 3, 'ignorer'));
        const deux = L.inverser(L.inverser(m));
        expect(deux.roles).toEqual(fictive().roles);
        expect(deux.criteres).toEqual(fictive().criteres);
    });

    it('M.k l’étape « Ce que contient ton tableau » suit « Sens du tableau » ; pas pour « à la main »', () => {
        expect(A.etapesPour(A.preparer(exemple()))).toEqual(['axes', 'roles', 'nature', 'valeurs', 'classer', 'final']);
        expect(A.etapesPour(A.preparer(L.modeleVide()))).toEqual(['final']);
    });
});

/* ================================================================ C — CODES */

describe('lot 3a · C — les codes de niveau se corrigent', () => {
    const avecCodes = (codes) => {
        const m = A.preparer(exemple());
        m.niveaux.forEach((n, j) => { n.code = { valeur: codes[j], etat: codes[j] ? 'saisi' : 'remplir' }; });
        return m;
    };
    const manques = (m) => A.calculs(m).manquants.filter(t => /code/.test(t));

    it('C.a requis, uniques sans tenir compte de la casse, 1 à 4 caractères, sans souligné', () => {
        expect(manques(avecCodes(['E', 'S', 'A', 'I']))).toEqual([]);
        expect(manques(avecCodes(['E', '', 'A', 'I']))).toEqual(['le code d’un niveau']);
        expect(manques(avecCodes(['E', 'e', 'A', 'I']))).toEqual(['un code différent pour chaque niveau (deux niveaux ont le même code : « e »)']);
        expect(manques(avecCodes(['E', 'e', 'E', 'I']))).toEqual(['un code différent pour chaque niveau (des niveaux ont le même code : « e »)']);
        expect(manques(avecCodes(['E', 'e', 'A', 'a']))).toEqual(['un code différent pour chaque niveau (des niveaux ont le même code : « e », « a »)']);
        expect(manques(avecCodes(['EXCEL', 'S', 'A_1', 'I']))).toEqual(['un code de 1 à 4 caractères, sans souligné, pour 2 niveaux']);
    });

    it('C.b complétés en repli seulement : un code repris ou saisi n’est jamais recalculé, les complétés l’évitent', () => {
        const n = (titre, code) => ({ titre: { valeur: titre, etat: 'repris' }, code });
        const r = L.coder([n('Excellent', { valeur: 'E', etat: 'complete' }), n('Émergent', { valeur: 'X', etat: 'saisi' }), n('Faible'), n('Fort', { valeur: 'f', etat: 'repris' })]);
        expect(r.map(x => [x.code.valeur, x.code.etat])).toEqual([['E', 'complete'], ['X', 'saisi'], ['FA', 'complete'], ['f', 'repris']]);
    });

    it('C.c modifier un titre ne touche pas un code saisi ; un code complété suit son titre', () => {
        const m = A.preparer(exemple());
        materiel.etatCourant();   // l'état de la page n'est pas en jeu : on éprouve la règle de saisie
        m.niveaux[0].code = { valeur: 'TB', etat: 'saisi' };
        m.niveaux[0].titre = { valeur: 'Remarquable', etat: 'saisi' };
        m.niveaux[1].titre = { valeur: 'Passable', etat: 'saisi' };
        const r = L.coder(m.niveaux);
        expect(r[0].code).toEqual({ valeur: 'TB', etat: 'saisi' });
        expect(r[1].code).toEqual({ valeur: 'P', etat: 'complete' });
    });

    it('C.d le code construit est celui saisi, sans blancs, dans l’échelle et dans les descripteurs', () => {
        const m = A.preparer(exemple());
        m.niveaux[0].code = { valeur: ' tb ', etat: 'saisi' };
        const o = A.construire(m, { id: (p) => p + (++compteur), maintenant: '2026-10-17T12:00:00.000Z' });
        expect(o.echelle.niveaux[0].code).toBe('tb');
        expect(Object.keys(o.grille.criteres[0].descripteurs.parNiveau)[0]).toBe('tb');
    });
});

/* ================================================================ F — FORME */

describe('lot 3a · F — critère et sous-critères ont la forme de l’éditeur', () => {
    const grilles = readFileSync(path.join(racine, 'js', 'grilles.js'), 'utf8');
    /** Les clés d'un littéral d'objet du source, entre `debut` et la première `fin`. */
    function cles(debut, fin) {
        const i = grilles.indexOf(debut);
        expect(i, debut).toBeGreaterThan(0);
        const bloc = grilles.slice(i + debut.length, grilles.indexOf(fin, i + debut.length));
        return [...bloc.matchAll(/^\s*(\w+):/gm)].map(x => x[1]).sort();
    }

    it('F.a les clés d’un critère créé à la main (« Créer l’objet critère »), plus son id', () => {
        const editeur = cles('// Créer l\'objet critère\n    const critere = {', '\n    };');
        const o = A.construire(A.preparer(exemple()), { id: (p) => p + (++compteur), maintenant: 'x' });
        const sansFacultatifs = Object.keys(o.grille.criteres[0]).filter(k => k !== 'descripteurs').sort();
        expect(sansFacultatifs).toEqual([...editeur, 'id'].sort());
        expect(o.grille.criteres[0]).toMatchObject({ description: '', formule: '', niveauSOLO: 'multistructurel', verrouille: false, type: 'holistique' });
        expect(o.grille.criteres[0]).not.toHaveProperty('sousCriteres');   // aucun : absent, comme à l'éditeur
    });

    it('F.b un sous-critère : les clés et les défauts d’« ajouterSousCritere », dans l’ordre des lignes', () => {
        const editeur = cles('g.criteres[critereIndex].sousCriteres.push({', '\n        });');
        const o = A.construire(A.preparer(fictive()), { id: (p) => p + (++compteur), maintenant: 'x' });
        const sc = o.grille.criteres[2].sousCriteres;
        expect(sc.map(s => Object.keys(s).sort())).toEqual(sc.map(() => editeur));
        expect(sc.map(s => [s.code, s.nom, s.ponderation, s.retroaction])).toEqual(CRITERES[2].taches.map((t, k) => [String(k), t, 1, '']));
        expect(sc.every(s => /^SC_/.test(s.id))).toBe(true);
    });

    it('F.c au-delà de 30 sous-critères (borne du partage), la création est refusée et le dit', () => {
        const m = A.preparer(fictive());
        m.criteres[0].sousCriteres = Array.from({ length: 31 }, (x, k) => 'tâche ' + k);
        expect(A.calculs(m).manquants).toContain('au plus 30 sous-critères par critère');
    });
});

/* ================================================== S — L'ÉTAPE « CE QUE CONTIENT TON TABLEAU » */

describe('lot 3a · S — l’étape « Ce que contient ton tableau »', () => {
    function rendre(m) {
        const etapes = A.etapesPour(m);
        const div = fenetreDom.document.createElement('div');
        div.innerHTML = materiel.assistantHtml({ modele: m, etapes, etape: etapes.indexOf('roles') });
        return div;
    }

    it('S.a un menu étiqueté au début de chaque rangée et en tête de chaque colonne, réglé sur la proposition', () => {
        const m = A.preparer(fictive());
        const d = rendre(m);
        const menus = [...d.querySelectorAll('select.materiel-role')];
        expect(menus).toHaveLength(10 + 5);
        menus.forEach((s) => expect(d.querySelector('label[for="' + s.id + '"]').textContent).toMatch(/^Rôle de la (rangée|colonne) \d+$/));
        expect(d.querySelector('#materiel-role-r-3').value).toBe('suite');
        expect(d.querySelector('#materiel-role-c-0').value).toBe('noms');
        expect(d.querySelector('#materiel-role-r-3').getAttribute('data-on-change')).toBe('materiel.choisirRole');
        expect(d.textContent).toContain('Proposé par l’application : à vérifier');
        expect(d.querySelectorAll('[data-action="materiel.choisirSuiteNom"]')).toHaveLength(3);
        expect(d.querySelectorAll('.materiel-case-fusion').length).toBe(2);   // la case fusionnée sur deux rangées
    });

    it('S.b la mention disparaît une fois un rôle changé ; sans suite, pas de choix pour la colonne des noms', () => {
        const m = A.choisirRole(A.preparer(exemple()), 'rangees', 1, 'ignorer');
        const d = rendre(m);
        expect(d.textContent).not.toContain('Proposé par l’application');
        expect(d.querySelectorAll('[data-action="materiel.choisirSuiteNom"]')).toHaveLength(0);
    });

    it('S.c tout texte venu du document en sort échappé, dans le tableau lu comme dans l’aperçu', () => {
        const m = A.preparer(texte('C\t<img src=x onerror=alert(1)>\tB\n<b>X</b>\t<script>t()</script>\t2'));
        const d = rendre(m);
        expect(d.querySelector('img, script, b')).toBeNull();
        expect(d.textContent).toContain('<script>t()</script>');
    });

    it('S.d l’étape Sens du tableau signale les cases fusionnées et renvoie à cette étape', () => {
        const m = A.preparer(fictive());
        const div = fenetreDom.document.createElement('div');
        div.innerHTML = materiel.assistantHtml({ modele: m, etapes: A.etapesPour(m), etape: 0 });
        expect(div.querySelector('.alerte-attention').textContent).toContain('« Ce que contient ton tableau »');
        div.innerHTML = materiel.assistantHtml({ modele: A.preparer(exemple()), etapes: ['axes'], etape: 0 });
        expect(div.querySelector('.alerte-attention')).toBeNull();
    });

    it('S.f l’aperçu montre les sous-critères, ou la description si c’est le choix', () => {
        const div = fenetreDom.document.createElement('div');
        div.innerHTML = materiel.apercuHtml(A.preparer(fictive()));
        expect([...div.querySelectorAll('tbody tr')[0].querySelectorAll('.materiel-sous-criteres li')].map(li => li.textContent)).toEqual(CRITERES[0].taches);
        const m = A.choisirSuiteNom(A.preparer(fictive()), 'description');
        div.innerHTML = materiel.apercuHtml(m);
        expect(div.querySelector('tbody tr .materiel-description').textContent).toBe(CRITERES[0].taches.map(t => '☐ ' + t).join('\n'));
        expect(div.querySelector('.materiel-sous-criteres')).toBeNull();
    });

    it('S.e un champ « Code » par niveau, à l’étape Plages de notes et à la Vérification', () => {
        const m = A.preparer(fictive());
        const etapes = A.etapesPour(m);
        const div = fenetreDom.document.createElement('div');
        div.innerHTML = materiel.assistantHtml({ modele: m, etapes, etape: etapes.indexOf('valeurs') });
        expect([...div.querySelectorAll('[id^="materiel-q-code-"]')].map(i => i.value)).toEqual(['I', 'D', 'M', 'E']);
        div.innerHTML = materiel.assistantHtml({ modele: m, etapes, etape: etapes.indexOf('final') });
        expect([...div.querySelectorAll('[id^="materiel-v-code-"]')].map(i => i.getAttribute('data-param'))).toEqual(['niveau.0.code', 'niveau.1.code', 'niveau.2.code', 'niveau.3.code']);
        expect(div.querySelector('label[for="materiel-v-code-0"]').textContent).toBe('Code');
    });
});
