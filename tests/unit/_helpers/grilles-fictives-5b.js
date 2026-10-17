/**
 * Les grilles fictives F1 à F8 de `plans de travail/PROPOSITION-2026-10-17-reconnaissance-des-grilles.md`
 * (« Les grilles fictives à verser aux bancs ») : la FORME de douze mises en page réelles, avec des
 * textes INVENTÉS, sans rapport avec les originaux. Partagées par le banc Vitest et la spec WebKit
 * de l'étape 5b.
 * ⛔ Aucun texte d'une grille réelle, aucun nom d'élève ni de collègue.
 */

const p = (lignes) => lignes.map((l) => '<p>' + l + '</p>').join('');
const td = (contenu, attrs) => '<td' + (attrs ? ' ' + attrs : '') + '>' + contenu + '</td>';
const tr = (cases) => '<tr>' + cases.join('') + '</tr>';
const reglette = (max) => Array.from({ length: max + 1 }, (_, k) => k).join(' ');

/** F1 — Bande à réglette : 4 critères (bande NOM | réglette fusionnée, puis énoncés ↳ | descripteurs), la langue, la ligne de calcul, le total. */
export const F1_POINTS = [10, 20, 15, 25];
export const F1_NOMS = ['REPÉRAGE', 'INTERPRÉTATION', 'ORGANISATION', 'APPUI SUR LE TEXTE'];
export function f1Html() {
    let h = '<p>Lecture fictive : grille à réglette</p><table>' +
        tr([td('Critères'), td('Débutant'), td('En progrès'), td('Acquis'), td('Maîtrisé')]);
    F1_NOMS.forEach((nom, i) => {
        // Une réglette écrite en entier, une autre abrégée par « … ».
        const r = i === 1 ? '0 1 2 3 … ' + F1_POINTS[i] : reglette(F1_POINTS[i]);
        h += tr([td(p([nom])), td(p([r]), 'colspan="4"')]);
        h += tr([td(p(['↳ Énoncé A' + (i + 1) + '.', '↳ Énoncé B' + (i + 1) + '.', '↳ Énoncé C' + (i + 1) + '.'])),
            ...[1, 2, 3, 4].map((j) => td(p(['Palier ' + j + ' du critère ' + (i + 1) + '.', 'Un exemple l’appuie.'])))]);
    });
    h += tr([td(p(['LANGUE'])), td(p([reglette(30)]), 'colspan="4"')]);
    h += tr([td(p(['Une erreur par ligne fautive.'])), td(p(['Nombre d’erreurs : ___ ; nombre de mots : ___']), 'colspan="4"')]);
    h += tr([td(p(['Total : ___ / 100']), 'colspan="5"')]);
    return h + '</table>';
}

/** F2 — Bandes à codes (forme du lot 3a) + une bande de langue « I D M E », sa ligne de calcul fusionnée, un total fusionné. */
export const F2_NOMS = ['COMPRÉHENSION FICTIVE', 'STRUCTURE FICTIVE'];
export function f2Html() {
    const niveaux = ['INCOMPLET', 'EN DÉVELOPPEMENT', 'MAÎTRISÉ', 'ÉTENDU'];
    let h = '<p>Analyse fictive : grille à bandes</p><table>' +
        tr([td(p(['Critères']), 'rowspan="2"'), td('Premier palier'), td('Deuxième palier'), td('Troisième palier'), td('Quatrième palier')]) +
        tr(niveaux.map((n) => td(p([n]))));
    F2_NOMS.forEach((nom, i) => {
        h += tr([td(p(['<b>' + nom + '</b>'])), td('I'), td('D'), td('M'), td('E')]);
        h += tr([td(p(['☐ Tâche un du critère ' + (i + 1), '☐ Tâche deux du critère ' + (i + 1)])),
            ...[1, 2, 3, 4].map((j) => td(p(['Le critère ' + (i + 1) + ' est atteint au palier ' + j + '.', 'Un exemple précis l’appuie.'])))]);
    });
    h += tr([td(p(['<b>LANGUE</b>'])), td('I'), td('D'), td('M'), td('E')]);
    h += tr([td(p(['I : plus de dix erreurs.'])), td(p(['Erreurs : ___ ; mots : ___ ; taux : ___ %']), 'colspan="4"')]);
    h += tr([td(p(['Total : ___ / 100']), 'colspan="5"')]);
    return h + '</table>';
}

/** F3 — Pondération dans la bande (« NOM | 0,15 »), titre dans la case d'angle, contenu étiqueté, cases au tutoiement, pied non fusionné. */
export const F3_NOMS = ['THÈSE', 'ARGUMENTS', 'EXEMPLES', 'COHÉRENCE', 'STYLE'];
export const F3_PONDS = ['0,15', '0,30', '0,10', '0,25', '0,20'];
export function f3Html() {
    let h = '<table>' +
        tr([td(p(['Essai fictif : grille']), 'rowspan="2"'), td('Premier'), td('Deuxième'), td('Troisième'), td('Quatrième')]) +
        tr(['INSUFFISANT', 'EN DÉVELOPPEMENT', 'ACQUIS', 'AVANCÉ'].map((n) => td(p([n]))));
    F3_NOMS.forEach((nom, i) => {
        h += tr([td(p([nom + ' | ' + F3_PONDS[i]])), td('I'), td('D'), td('M'), td('E')]);
        h += tr([td(p(['Repère : une idée claire.', 'Indice : elle se relie au sujet.', 'Piège : la paraphrase.'])),
            ...[1, 2, 3, 4].map((j) => td(p(['Tu atteins le palier ' + j + ' pour ce critère.'])))]);
    });
    h += tr([td(p(['Erreurs : ___ ; mots : ___'])), td(p(['Légende : une erreur par faute distincte.']), 'colspan="4"')]);
    h += tr([td(p(['Total : ___ / 100']), 'colspan="5"')]);
    return h + '</table>';
}

/** F4a — Parties qui recopient l'en-tête (la 1re est l'en-tête) ; noms « ↳ énoncé » + « · sous-élément » ; points sur la dernière ligne des cases. */
export const F4A_POINTS = [4, 10, 4, 4, 10, 16];
const BAREMES = { 4: ['2', '3', '4'], 10: ['5-6', '7-8', '9-10'], 16: ['8-9', '10-11-12', '13-14-15-16'] };
const NIVEAUX_F4 = ['Absent', 'Partiel', 'Juste', 'Riche'];
function rangeeF4(nom, k, max) {
    return tr([td(p(['↳ ' + nom, '· premier élément ' + k, '· second élément ' + k])),
        td(p(['• Aucune trace.'])),
        ...BAREMES[max].map((pts, j) => td(p(['Trace ' + (j + 1) + ' du critère ' + k + '.', pts])))]);
}
export function f4aHtml() {
    const entete = (partie) => tr([td(p([partie])), ...NIVEAUX_F4.map((n) => td(p([n])))]);
    const noms = ['Situer l’œuvre', 'Résumer le passage', 'Nommer le procédé', 'Citer juste', 'Interpréter', 'Conclure'];
    let h = '<p>Lecture fictive : grille par parties</p><p>Objectif : situer un texte dans son époque.</p><table>';
    h += entete('PARTIE A') + rangeeF4(noms[0], 1, 4) + rangeeF4(noms[1], 2, 10);
    h += entete('PARTIE B') + rangeeF4(noms[2], 3, 4) + rangeeF4(noms[3], 4, 4);
    h += entete('PARTIE C') + rangeeF4(noms[4], 5, 10) + rangeeF4(noms[5], 6, 16);
    h += tr([td(p(['TOTAL : / 48']), 'colspan="5"')]);
    return h + '</table>';
}

/** F4b — En-têtes faits d'icônes (« + », « ++ », deux cases vides) ; deux énoncés ↳ dans une case ; calcul fusionné ; points énumérés. */
export function f4bHtml() {
    return '<p>Lecture fictive : grille à icônes</p><table>' +
        tr([td(p(['PARTIES'])), td(p(['+'])), td(p(['++'])), td('<img alt="">'), td('<img alt="">')]) +
        tr([td(p(['↳ Relever les indices', '↳ Les classer'])), td(p(['• Peu d’indices.'])),
            td(p(['Quelques indices.', '2'])), td(p(['Des indices variés.', '3'])), td(p(['Des indices fins.', '4']))]) +
        tr([td(p(['↳ Développer'])), td(p(['• Aucune idée.'])),
            td(p(['Une idée.', '10-11-12'])), td(p(['Deux idées.', '13-14-15-16'])), td(p(['Des idées liées.', '17-18-19-20']))]) +
        tr([td(p(['Langue : erreurs ___ / mots ___']), 'colspan="5"')]) +
        tr([td(p(['TOTAL : / 24']), 'colspan="5"')]) +
        '</table>';
}

/** F5 — En-tête à case vide, un niveau sur deux colonnes ; qualificatif puis points ; un critère « / 5 » fusionné ; total avec pénalité. */
export function f5Html() {
    return '<p>Projet (30 %)</p><table>' +
        tr([td(''), td(p(['PALIER A']), 'colspan="2"'), td(p(['PALIER B'])), td(p(['PALIER C']))]) +
        tr([td(p(['Rigueur'])), td(p(['Jamais', '0-5'])), td(p(['Rarement', '6'])), td(p(['Souvent', '7-8'])), td(p(['Toujours', '9-10']))]) +
        tr([td(p(['Engagement'])), td(p(['Aucun', '0-2'])), td(p(['Peu', '3'])), td(p(['Assez', '4'])), td(p(['Beaucoup', '5']))]) +
        tr([td(p(['Présentation'])), td(p(['/ 5']), 'colspan="4"')]) +
        tr([td(p(['Total : ___ / 20 (pénalité de retard : 10 % par jour)']), 'colspan="5"')]) +
        '</table>';
}

/**
 * F6 — Liste à cocher : nom | points | case p.1 | case p.2 | constat. La rangée de numéros ; des parties
 * en rangée ; un critère sur plusieurs rangées (case de nom vide) ; des seuils sous un nom ; des « / 0 » ;
 * le pied (total, langue, note finale).
 */
export function f6Html() {
    const coche = [td('[ ]'), td('[ ]')];
    const crit = (nom, pts, constat) => tr([td(p(nom)), td(p([pts])), ...coche, td(p([constat]))]);
    const suite = (constat) => tr([td(''), td(''), ...coche, td(p([constat]))]);
    const partie = (nom) => tr([td(p([nom])), td(''), td(''), td(''), td('')]);
    return '<p>Commentaire fictif : liste de vérification</p><table>' +
        tr([td(''), td(''), td(p(['1'])), td(p(['2'])), td('')]) +
        partie('INTRODUCTION') +
        crit(['Sujet amené'], '/ 10', 'Le sujet est amené de loin.') + suite('Il mène au sujet posé.') +
        crit(['Sujet posé', '60% 70% 80% 90%'], '/ 20', 'La question est claire.') + suite('Elle reprend le sujet.') + suite('Elle annonce le plan.') +
        partie('DÉVELOPPEMENT') +
        crit(['Arguments', '18 21 24 27'], '/ 30', 'Chaque idée a sa preuve.') + suite('Les preuves sont commentées.') +
        crit(['Mise en page'], '/ 0', 'Les marges sont respectées.') +
        crit(['Bibliographie'], '/ 0', 'Les sources sont citées.') +
        tr([td(p(['TOTAL du contenu / 60'])), td(''), td(''), td(''), td(p(['échelle en points']))]) +
        tr([td(p(['LANGUE / 40'])), td(''), td(''), td(''), td('')]) +
        tr([td(p(['NOTE FINALE / 100'])), td(''), td(''), td(''), td('')]) +
        '</table>';
}

/** F7 — Sans en-tête, crochets séparés, noms coupés sur deux rangées, seuils sous un nom. 9 colonnes. */
export const F7_POINTS = [9, 9, 18, 9, 9, 6];
export function f7Html() {
    const crochets = [td('['), td(']'), td('['), td(']'), td('['), td(']')];
    const rangee = (nom, pts, constat) => tr([td(p(nom)), td(pts ? p([pts]) : ''), ...crochets, td(p([constat]))]);
    return '<table>' +
        rangee(['Mise en'], '/ 9', 'Le contexte est situé.') + rangee(['contexte'], '', 'Les repères sont exacts.') +
        rangee(['Thèse'], '/ 9', 'La thèse est formulée.') +
        rangee(['Arguments', '12 14 16 18'], '/ 18', 'Chaque argument est appuyé.') +
        rangee(['Exemples'], '/ 9', 'Les exemples sont précis.') +
        rangee(['Conclusion'], '/ 9', 'La synthèse est juste.') +
        rangee(['Propreté de la'], '/ 6', 'La copie est lisible.') + rangee(['copie'], '', 'Les ratures sont rares.') +
        '</table>';
}

/** F8 — Liste à barème en tableau sans bordure : texte | points. */
export const F8_LIGNES = [
    ['Introduction', '• amener le sujet', '• poser le sujet'], '/ 5',
    ['DÉVELOPPEMENT'], '',
    ['• Argumentation', '- idée principale', '- exemples'], '/ 40',
    ['• Citations', '- intégrées', '- commentées'], '/ 35',
    ['Conclusion', '• synthèse'], '/ 20',
    ['Commentaires :'], '',
    ['TOTAL'], '/ 100'
];
export function f8Html() {
    let h = '<table style="border: none">';
    for (let k = 0; k < F8_LIGNES.length; k += 2) {
        const texte = F8_LIGNES[k], pts = F8_LIGNES[k + 1];
        h += tr([td(p(texte.concat(texte[0] === 'Commentaires :' ? ['&nbsp;', '&nbsp;'] : []))), td(pts ? p([pts]) : '')]);
    }
    return h + '</table>';
}

/** F8-texte : les mêmes lignes en texte ; avec tabulations, seules les lignes à points en portent. */
export function f8Texte(avecTabulations) {
    const lignes = [];
    for (let k = 0; k < F8_LIGNES.length; k += 2) {
        const texte = F8_LIGNES[k], pts = F8_LIGNES[k + 1];
        lignes.push(texte[0] + (pts ? (avecTabulations ? '\t' : ' ') + pts : ''));
        texte.slice(1).forEach((l) => lignes.push(l));
    }
    return lignes.join('\n');
}
