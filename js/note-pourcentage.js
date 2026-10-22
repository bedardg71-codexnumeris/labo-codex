/* ===============================
   MODULE : LES NOMBRES À L'ÉCRAN, À LA FRANÇAISE
   Date : 21 octobre 2026 (consigne du jour, lot 2 ; bogue vécu par Grégoire le même jour,
   « E 89.23679060665361% » dans la Liste des productions du profil)
   ↻ 22 octobre 2026 (#1137, décision de Grégoire, 6 h 59) : le module des NOTES devient celui
   de TOUT nombre affiché — indices, taux, pondérations, points, critères diagnostiques, axes et
   infobulles des graphiques, valeurs de configuration. À l'écran et dans le PDF de l'élève.

   Vocation
     La seule façon dont l'application affiche un nombre : à la NORME FRANÇAISE (décision de
     Grégoire, 21 oct. 2026, 11 h 07, étendue le 22) : virgule décimale et espace insécable avant
     le signe — « 89,2 % », « 67 % », « 44,5 pts ».
     L'espace est le CARACTÈRE U+00A0, jamais l'entité `&nbsp;` : plusieurs appelants passent
     le texte par `echapperHtml`/`esc`, qui la doubleraient.
     ⚠ Seul l'AFFICHAGE passe ici. Restent tels quels : les champs où l'on tape un nombre
     (`<input type="number">` et leurs valeurs), ce qui voyage (CSV, JSON, codex, partage), les
     valeurs stockées et les calculs. La note se STOCKE exacte, délibérément (#572, #701).
     Gardé par sentinelle-note-pourcentage-affichage.test.js (les notes) et
     sentinelle-nombres-a-la-francaise-1137.test.js (tout le reste, et le seul `replace('.', ',')`).

   Dépendances : aucune.

   API :
     window.formaterNombre(n, decimales) → « 2,75 », « 12 ». Avec `decimales` (un entier), autant de
       décimales FIXES que demandé, comme `toFixed` : la précision reste celle que l'appelant
       choisit (un indice et une pondération n'ont pas la même). Sans, deux décimales AU PLUS,
       sans zéro final : un nombre tel qu'on l'a saisi (12,5), débarrassé du bruit binaire.
       '' quand ce n'est pas un nombre (l'appelant garde son repli : « — », « ? »).
       Jamais « -0 » : un zéro arrondi ne garde pas de signe.
     window.formaterPourcentage(n, decimales) → « 12,5 % » : le même nombre, insécable, « % ».
     window.formaterNotePourcentage(note) → « 89,2 % » : une NOTE, une décimale au plus, sans zéro
       final. '' quand la note n'est pas un nombre.
     window.formaterNoteNombre(note) → « 89,2 », la même note sans le signe : les termes
       d'une somme de notes (« (75 + 80) / 2 »).
     window.formaterPoints(n, decimales) → « 44,5 pts » : les points. Par défaut une décimale fixe,
       la règle du PDF de l'élève (21 oct. 2026) ; une phrase qui additionne des points pour
       donner une note ne mêle pas deux normes. `decimales` comme pour `formaterNombre`.
     window.ESPACE_INSECABLE → '\u00A0'.
   =============================== */

(function() {
'use strict';

var ESPACE_INSECABLE = '\u00A0';

/** Le nombre, ou null quand la valeur n'en est pas un (vide, booléen, texte non numérique, infini). */
function _nombre(valeur) {
    if (valeur === null || valeur === undefined || valeur === '' || typeof valeur === 'boolean') return null;
    var n = Number(valeur);
    return Number.isFinite(n) ? n : null;
}

/** Le chiffre à la virgule, sans « -0 ». */
function _virgule(texte) {
    if (/^-0(\.0+)?$/.test(texte)) texte = texte.slice(1);
    return texte.replace('.', ',');
}

function formaterNombre(valeur, decimales) {
    var n = _nombre(valeur);
    if (n === null) return '';
    if (typeof decimales === 'number' && decimales >= 0) return _virgule(n.toFixed(decimales));
    return _virgule(String(Math.round(n * 100) / 100));
}

function formaterPourcentage(valeur, decimales) {
    var nombre = formaterNombre(valeur, decimales);
    return nombre === '' ? '' : nombre + ESPACE_INSECABLE + '%';
}

function formaterNoteNombre(note) {
    var n = _nombre(note);
    if (n === null) return '';
    return _virgule(String(Math.round(n * 10) / 10));
}

function formaterNotePourcentage(note) {
    var nombre = formaterNoteNombre(note);
    return nombre === '' ? '' : nombre + ESPACE_INSECABLE + '%';
}

function formaterPoints(points, decimales) {
    var nombre = formaterNombre(points, typeof decimales === 'number' ? decimales : 1);
    return nombre === '' ? '' : nombre + ESPACE_INSECABLE + 'pts';
}

var api = {
    formaterNombre: formaterNombre,
    formaterPourcentage: formaterPourcentage,
    formaterNotePourcentage: formaterNotePourcentage,
    formaterNoteNombre: formaterNoteNombre,
    formaterPoints: formaterPoints,
    ESPACE_INSECABLE: ESPACE_INSECABLE
};
if (typeof window !== 'undefined') {
    Object.keys(api).forEach(function (k) { window[k] = api[k]; });
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
}

})();
