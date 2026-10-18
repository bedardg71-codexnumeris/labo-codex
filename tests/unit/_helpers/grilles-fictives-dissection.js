/**
 * Les grilles FICTIVES de la dissection (lot 1, `plans de travail/CONSIGNE-LOT-2026-10-18-dissection-1-etiqueter.md`) :
 * la FORME des deux grilles réelles éprouvées par Grégoire le 18 oct. 2026, avec des textes INVENTÉS.
 * Partagées par le banc Vitest et la spec WebKit du lot.
 * ⛔ Aucun texte d'une grille réelle, aucun nom d'élève ni de collègue.
 *
 * Une grille : des rangées de cases { cs?, l: [[texte, étiquette], …] } ; chaque ligne d'une case
 * porte l'étiquette qu'un enseignant lui poserait (null : laissée sans étiquette).
 */

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Le HTML que Word ou Pages mettraient au presse-papiers : un paragraphe par ligne de case. */
export function enHtml(grille) {
    return '<table>' + grille.map((row) => '<tr>' + row.map((c) =>
        '<td' + (c.cs > 1 ? ' colspan="' + c.cs + '"' : '') + '>' + c.l.map((x) => '<p>' + esc(x[0]) + '</p>').join('') + '</td>'
    ).join('') + '</tr>').join('') + '</table>';
}

/** Les étiquettes, dans l'ordre de lecture des morceaux. */
export function etiquettes(grille) {
    return grille.flatMap((row) => row.flatMap((c) => c.l.map((x) => x[1])));
}

/** Les étiquettes posées sur un document lu : { idDuMorceau: type }, par l'ordre de lecture. */
export function liensPar(ordre, types) {
    const liens = {};
    ordre.forEach((id, i) => { if (types[i]) liens[id] = types[i]; });
    return liens;
}

// ---------------------------------------------------------------------------
// (a) Des sections dont la rangée porte les noms des niveaux, des points par niveau, un total.
//     3 sections, 6 critères, 4 niveaux ; pondérations tirées des points : 5+10+5+10+5+15 = 50.
// ---------------------------------------------------------------------------
const NIVEAUX_A = ['Ébauché', 'Développé', 'Solide', 'Accompli'];
const sectionA = (nom) => [{ l: [[nom, 'section']] }, ...NIVEAUX_A.map((n) => ({ l: [[n, 'niveau']] }))];
const critereA = (n, pts) => [
    { l: [['L’élève accomplit la tâche fictive ' + n, 'critere'], ['· Indice observable ' + n + '.1', 'souscritere'], ['· Indice observable ' + n + '.2', 'souscritere']] },
    { l: [['●', 'ignorer'], ['Tâche ' + n + ' absente', 'descripteur']] },
    ...pts.map((p, j) => ({ l: [['Tâche ' + n + ', palier ' + (j + 2), 'descripteur'], [p, 'points']] }))
];
export const GRILLE_A = [
    [{ l: [['Carnet d’observation fictif', 'titre']] }, { cs: 4, l: [['Noter des observations et en dégager une idée d’ensemble.', 'description']] }],
    sectionA('PREMIÈRE SECTION : RECUEIL'),
    critereA(1, ['3', '4', '5']),
    critereA(2, ['6-7', '8-9', '10']),
    sectionA('DEUXIÈME SECTION : CLASSEMENT'),
    critereA(3, ['3', '4', '5']),
    critereA(4, ['6', '7-8', '9-10']),
    sectionA('TROISIÈME SECTION : SYNTHÈSE'),
    critereA(5, ['3', '4', '5']),
    critereA(6, ['9-10', '11-12-13', '14-15']),
    [{ cs: 5, l: [['TOTAL : / 50', 'total']] }]
];

// ---------------------------------------------------------------------------
// (b) Des réponses en lignes avec leurs points, sans niveaux nommés : un critère nommé, puis une
//     section avec des critères sans nom (coupés là où les points remontent), une phrase coupée
//     en deux rangées (« Suite »), une pondération « /2 ».
// ---------------------------------------------------------------------------
export const GRILLE_B = [
    [{ l: [['Question 1 : le sens du passage fictif', 'critere']] }, { l: [] }],
    [{ l: [['Réponse juste et complète', 'descripteur']] }, { l: [['4 points', 'points']] }],
    [{ l: [['Réponse juste, mais incomplète', 'descripteur']] }, { l: [['2 points', 'points']] }],
    [{ l: [['Réponse absente ou fausse', 'descripteur']] }, { l: [['0 point', 'points']] }],
    [{ cs: 2, l: [['Partie B : le vocabulaire fictif', 'section']] }],
    [{ l: [['Définit les trois termes', 'descripteur']] }, { l: [['3', 'points']] }],
    [{ l: [['Définit deux termes', 'descripteur']] }, { l: [['2', 'points']] }],
    [{ l: [['Définit un seul terme, ou en donne', 'descripteur']] }, { l: [] }],
    [{ l: [['un exemple sans le définir', 'suite']] }, { l: [['1', 'points']] }],
    [{ l: [['Aucun terme défini', 'descripteur']] }, { l: [['0', 'points']] }],
    [{ l: [['Donne un exemple juste', 'descripteur']] }, { l: [['1', 'points']] }],
    [{ l: [['Donne un exemple approximatif', 'descripteur']] }, { l: [['0,5', 'points']] }],
    [{ l: [['Ne donne aucun exemple', 'descripteur']] }, { l: [['0', 'points']] }],
    [{ l: [] }, { l: [['/2', 'ponderation']] }]
];

// ---------------------------------------------------------------------------
// (c) Un texte brut (un PDF copié) : rattachement par l'ordre.
// ---------------------------------------------------------------------------
export const TEXTE_C = [
    ['Grille d’exposé fictive', 'titre'],
    ['Insuffisant', 'niveau'], ['Réussi', 'niveau'], ['Excellent', 'niveau'],
    ['Clarté du propos', 'critere'],
    ['Propos confus', 'descripteur'], ['0-1', 'points'],
    ['Propos suivi', 'descripteur'], ['2-3', 'points'],
    ['Propos limpide', 'descripteur'], ['4', 'points'],
    ['Tenue de la langue', 'critere'],
    ['Erreurs nombreuses', 'descripteur'], ['0', 'points'],
    ['Quelques erreurs', 'descripteur'], ['1', 'points'],
    ['Langue soignée', 'descripteur'], ['2', 'points']
];

// ---------------------------------------------------------------------------
// (n) Lot 2b : une grille SEULEMENT en niveaux, sans aucun point. Un titre, une rangée des niveaux
//     (la première case, « Critères », sans étiquette), trois critères avec leur pondération en %
//     dans leur propre case : 40 + 35 + 25 = 100.
// ---------------------------------------------------------------------------
export const NIVEAUX_N = ['À reprendre', 'En voie', 'Atteint'];
const critereN = (n, pond) => [
    { l: [['Le travail fictif répond à l’attente ' + n, 'critere'], ['(' + pond + ' %)', 'ponderation']] },
    ...NIVEAUX_N.map((niv) => ({ l: [['Attente ' + n + ' : ' + niv.toLowerCase(), 'descripteur']] }))
];
export const GRILLE_N = [
    [{ cs: 4, l: [['Fiche d’appréciation fictive', 'titre']] }],
    [{ l: [['Critères', null]] }, ...NIVEAUX_N.map((n) => ({ l: [[n, 'niveau']] }))],
    critereN(1, 40),
    critereN(2, 35),
    critereN(3, 25)
];
