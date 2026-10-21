/* ===============================
   MODULE : LA NOTE EN POURCENTAGE, À L'ÉCRAN
   Date : 21 octobre 2026 (consigne du jour, lot 2 ; bogue vécu par Grégoire le même jour,
   « E 89.23679060665361% » dans la Liste des productions du profil)

   Vocation
     La seule façon dont l'application affiche une note en pourcentage : une décimale au
     plus, sans zéro final, à la NORME FRANÇAISE (décision de Grégoire, 21 oct. 2026, 11 h 07) :
     virgule décimale et espace insécable avant le signe — « 89,2 % », « 67 % », « 0 % ».
     L'espace est le CARACTÈRE U+00A0, jamais l'entité `&nbsp;` : plusieurs appelants passent
     le texte par `echapperHtml`/`esc`, qui la doubleraient.
     Une note = ce qu'un élève obtient (copie, production, note provisoire ou finale) et les
     moyennes de ces notes. Pas les indices, les taux, les pondérations, les critères
     diagnostiques : ils gardent leur forme (item du BACKLOG).
     ⚠ La note se STOCKE exacte, délibérément (#572, #701 : `noteFinale`). Seul son
     affichage passe ici ; ni la valeur en base ni le calcul ne changent.
     Gardé par sentinelle-note-pourcentage-affichage.test.js : aucun fichier de `js/`
     n'interpole `noteFinale` suivi de « % » sans passer par cette fonction.

   Dépendances : aucune.

   API :
     window.formaterNotePourcentage(note) → « 89,2 % » ; '' quand la note n'est pas un nombre
       (l'appelant garde son repli : « - », « — »).
     window.formaterNoteNombre(note) → « 89,2 », le même nombre sans le signe : les termes
       d'une somme de notes (« (75 + 80) / 2 »).
     window.ESPACE_INSECABLE → '\u00A0'.
   =============================== */

(function() {
'use strict';

var ESPACE_INSECABLE = '\u00A0';

function formaterNoteNombre(note) {
    if (note === null || note === undefined || note === '') return '';
    var n = Number(note);
    if (!Number.isFinite(n)) return '';
    return String(Math.round(n * 10) / 10).replace('.', ',');
}

function formaterNotePourcentage(note) {
    var nombre = formaterNoteNombre(note);
    return nombre === '' ? '' : nombre + ESPACE_INSECABLE + '%';
}

if (typeof window !== 'undefined') {
    window.formaterNotePourcentage = formaterNotePourcentage;
    window.formaterNoteNombre = formaterNoteNombre;
    window.ESPACE_INSECABLE = ESPACE_INSECABLE;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formaterNotePourcentage: formaterNotePourcentage, formaterNoteNombre: formaterNoteNombre, ESPACE_INSECABLE: ESPACE_INSECABLE };
}

})();
