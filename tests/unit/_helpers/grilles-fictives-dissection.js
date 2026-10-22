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
    { l: [['L’étudiant·e accomplit la tâche fictive ' + n, 'critere'], ['· Indice observable ' + n + '.1', 'souscritere'], ['· Indice observable ' + n + '.2', 'souscritere']] },
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

// ---------------------------------------------------------------------------
// (d) Lot 5 (« Couper ») : la FORME de la grille de la porte du 18 oct. (13 h 14), textes INVENTÉS.
//     Un tableau d'une colonne ; trois sections ; chaque critère écrit SUR UNE LIGNE avec son nom,
//     « / N » et ses cases « [ ] … / … » (plus de 200 caractères) ; deux lignes de total, « / 70 »
//     (parties A et B : 10 + 20 + 15 + 25) et « / 30 » (partie C : 10 + 20).
// ---------------------------------------------------------------------------
const casesD = (n) => ['le premier repère fictif ' + n + ' est relevé / n’est pas relevé',
    'le deuxième repère fictif ' + n + ' est expliqué / n’est pas expliqué',
    'le troisième repère fictif ' + n + ' est relié à l’ensemble / n’y est pas relié'];
/** Les trois morceaux qu'un enseignant tirerait d'une ligne de critère : son nom, « / N », ses cases. */
export function partiesD(nom, n, k) {
    return [nom, '/ ' + n, casesD(k).map((c) => '[ ] ' + c).join(' ')];
}
export const CRITERES_D = [
    ['Repérage fictif des images', 10], ['Classement fictif des images', 20],
    ['Interprétation fictive des motifs', 15], ['Mise en relation fictive des motifs', 25],
    ['Rédaction fictive de la synthèse', 10], ['Justesse fictive de la langue', 20]
];
/** La ligne d'un critère telle que collée : ses trois parties, bout à bout. */
export const ligneD = (i) => partiesD(CRITERES_D[i][0], CRITERES_D[i][1], i + 1).join(' ');
export const SECTIONS_D = ['PARTIE A : REPÉRER', 'PARTIE B : INTERPRÉTER', 'PARTIE C : RÉDIGER'];
export const TOTAUX_D = ['Total des parties A et B : / 70', 'Total de la partie C : / 30'];
/** (d), étiquetée comme le 18 oct. : titre, sections, critères sur leur ligne entière, une Pondération sur chaque total. */
export const GRILLE_D = [
    [{ l: [['Évaluation fictive sur les images', 'titre']] }],
    [{ l: [[SECTIONS_D[0], 'section']] }],
    [{ l: [[ligneD(0), 'critere']] }],
    [{ l: [[ligneD(1), 'critere']] }],
    [{ l: [[SECTIONS_D[1], 'section']] }],
    [{ l: [[ligneD(2), 'critere']] }],
    [{ l: [[ligneD(3), 'critere']] }],
    [{ l: [[TOTAUX_D[0], 'ponderation']] }],
    [{ l: [[SECTIONS_D[2], 'section']] }],
    [{ l: [[ligneD(4), 'critere']] }],
    [{ l: [[ligneD(5), 'critere']] }],
    [{ l: [[TOTAUX_D[1], 'ponderation']] }]
];

// ---------------------------------------------------------------------------
// (d7) Lot 7 (« Rattacher ») : (d) complétée d'une case de la FORME de celle de la porte du 18 oct.
//     (16 h 43), textes INVENTÉS : une partie D, puis un nom de critère écrit sur trois lignes d'une même
//     case, entrecoupées de cases à cocher. Étiquetée comme ce jour-là : les deux fins du nom en Critère.
// ---------------------------------------------------------------------------
export const SECTION_D7 = 'PARTIE D : NUANCER';
/** Le nom du critère, en trois lignes ; mises bout à bout avec une espace, le nom entier. */
export const NOM_D7 = ['Nuances fictives du propos', '(exemples, contrastes,', 'renvois)'];
export const POND_D7 = '/ 24';
export const CASES_D7 = ['[ ] [ ] nuance fictive absente / présente', '[ ] [ ] nuance fictive peu développée / développée'];
/** La case telle que collée : six lignes, dans l'ordre de sa grille. */
export const CASE_D7 = [
    [NOM_D7[0], 'critere'], [POND_D7, 'ponderation'], [CASES_D7[0], 'souscritere'],
    [NOM_D7[1], 'critere'], [CASES_D7[1], 'souscritere'], [NOM_D7[2], 'critere']
];
export const GRILLE_D7 = [...GRILLE_D, [{ l: [[SECTION_D7, 'section']] }], [{ l: CASE_D7 }]];

/**
 * (d) — ou (d7) — coupée comme l'enseignant le ferait (lots 5, 7 et 9) : chaque ligne de critère en son nom
 * (« Critère »), « / N » (« Pondération ») et une case par morceau (« Élément observable ») ; les totaux en
 * « Total ». `D` : `materielDissectionLecture` ; `e` : { doc, liens, … }. Rend un nouvel état.
 */
export function decouperD(D, e0) {
    const idDe = (doc, t) => { const M = D.morceaux(doc); return M.ordre.find((id) => M.texte[id] === t); };
    const couper = (e, id, n) => {
        const r = D.couper(e.doc, id, n);
        if (!r) throw new Error('Coupe impossible : ' + id);
        return { e: Object.assign({}, e, { doc: r.doc, liens: D.liensApresCoupe(e.liens, id, r.parties) }), parties: r.parties };
    };
    let e = e0;
    CRITERES_D.forEach(([nom, n], i) => {
        let parties;
        ({ e, parties } = couper(e, idDe(e.doc, ligneD(i)), nom.length));
        ({ e, parties } = couper(e, parties[1], partiesD(nom, n, i + 1)[1].length));
        e.liens[parties[0]] = 'ponderation';
        let reste = parties[1];
        for (;;) {
            e.liens[reste] = 'souscritere';
            const k = D.morceaux(e.doc).texte[reste].indexOf(' [ ] ');
            if (k < 0) break;
            ({ e, parties } = couper(e, reste, k));
            reste = parties[1];
        }
    });
    TOTAUX_D.forEach((t) => { e.liens[idDe(e.doc, t)] = 'total'; });
    return e;
}

// ---------------------------------------------------------------------------
// Étape 5 du critère algorithmique (22 oct. 2026) : deux LISTES DE CODES fictives, en tableau (code, nom,
// poids, commentaire), une rangée d'en-tête laissée sans étiquette. Le garde-fou du plan : une discipline
// qui écrit (une rédaction), une qui n'écrit pas (des calculs de chimie). Textes INVENTÉS.
// ---------------------------------------------------------------------------
const enTete = [{ l: [['Code', null]] }, { l: [['Nom', null]] }, { l: [['Poids', null]] }, { l: [['Commentaire', null]] }];
const rangeeCode = (code, nom, poids, commentaires) => [
    { l: [[code, 'code']] }, { l: [[nom, 'nomcode']] }, { l: poids == null ? [] : [[poids, 'poids']] },
    { l: commentaires.map((c) => [c, 'commentaire']) }
];
export const LISTE_CODES_REDACTION = [
    enTete,
    rangeeCode('S', 'Syntaxe fictive', '1', ['Relis la phrase fictive à voix haute.']),
    rangeeCode('A', 'Accord fictif', '0,5', ['Repère le nom fictif, puis son déterminant.', 'Vérifie ensuite l’adjectif fictif.']),
    rangeeCode('P', 'Ponctuation fictive', null, ['Une virgule fictive manque.'])
];
export const LISTE_CODES_CHIMIE = [
    enTete,
    rangeeCode('U1', 'Unité manquante', '2', ['Écris l’unité de chaque résultat fictif.']),
    rangeeCode('CS', 'Chiffres significatifs', '1', ['Arrondis au nombre de chiffres significatifs des données fictives.'])
];
