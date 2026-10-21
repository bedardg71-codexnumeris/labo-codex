/* ===============================
   MODULE : LA NOTE EN POURCENTAGE, À L'ÉCRAN
   Date : 21 octobre 2026 (consigne du jour, lot 2 ; bogue vécu par Grégoire le même jour,
   « E 89.23679060665361% » dans la Liste des productions du profil)

   Vocation
     La seule façon dont l'application affiche une note en pourcentage : une décimale au
     plus, sans zéro final (« 67% », « 57.5% », « 89.2% »), la convention déjà en place
     dans la Liste des évaluations (bogue 123, 24 mai 2026).
     ⚠ La note se STOCKE exacte, délibérément (#572, #701 : `noteFinale`). Seul son
     affichage passe ici ; ni la valeur en base ni le calcul ne changent.
     Gardé par sentinelle-note-pourcentage-affichage.test.js : aucun fichier de `js/`
     n'interpole `noteFinale` suivi de « % » sans passer par cette fonction.

   Dépendances : aucune.

   API : window.formaterNotePourcentage(note) → string
     « 89.2% » ; '' quand la note n'est pas un nombre (l'appelant garde son repli : « - », « — »).
   =============================== */

(function() {
'use strict';

function formaterNotePourcentage(note) {
    if (note === null || note === undefined || note === '') return '';
    var n = Number(note);
    if (!Number.isFinite(n)) return '';
    return (Math.round(n * 10) / 10) + '%';
}

if (typeof window !== 'undefined') window.formaterNotePourcentage = formaterNotePourcentage;
if (typeof module !== 'undefined' && module.exports) module.exports = { formaterNotePourcentage: formaterNotePourcentage };

})();
