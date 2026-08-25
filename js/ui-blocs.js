/* ===============================
   MODULE : LES BOUTONS D'UN BLOC RÉORDONNABLE (#504, 25 août 2026)

   ⚠ POURQUOI UN MODULE À PART PLUTÔT QUE `main.js`. Cinq écrans rendent ce même
   geste, et leurs sentinelles chargent chacune leur module dans un sandbox.
   Laisser les helpers dans `main.js` — un fichier de 3 000 lignes qui touche à
   la navigation, aux hooks et au dispatcher — obligeait chaque test à le
   charger entier, ou à recopier les helpers. Recopiés, ils auraient divergé du
   jour où l'un des cinq change.
   =============================== */

(function() {
'use strict';

/**
 * LES BOUTONS D'UN BLOC RÉORDONNABLE (#504, 25 août 2026).
 *
 * ⚠⚠ POURQUOI UN HELPER PLUTÔT QUE CINQ COPIES. Cinq endroits du projet
 * rendent le même geste — monter, descendre, retirer un bloc : les critères
 * d'une grille (×2), les niveaux d'une échelle (×2) et les champs d'une
 * production. Ils l'écrivaient chacun à leur façon : glyphes `↑`/`↓` dans des
 * `btn-compact` ici, chevrons SVG là ; `✕` dans un `btn-supprimer` rouge d'un
 * côté, icône de corbeille de l'autre. Le même geste ne se ressemblait pas
 * d'un écran à l'autre.
 *
 * ⮕ Un seul rendu, cinq appels. Le prochain bloc réordonnable le reprendra
 * sans avoir à deviner la convention.
 *
 * ⚠ `.btn-supprimer` est un bouton PLEIN, réservé aux gestes qui engagent —
 * supprimer une grille entière, une production. Retirer un bloc d'un formulaire
 * qu'on n'a pas encore enregistré est local et réversible : lui donner le poids
 * visuel d'une suppression définitive fait mentir la couleur.
 *
 * @param {Object} o - { actionHaut, actionBas, param, premier, dernier, quoi }
 * @returns {string} HTML des deux chevrons
 */
window.boutonsReordonnerBloc = function(o) {
    const p = window.echapperHtml ? window.echapperHtml(String(o.param)) : String(o.param);
    const quoi = o.quoi || 'ce bloc';
    // ⚠ `param2` est facultatif : deux des cinq blocs identifient leur élément
    // par un couple (grille + index), les trois autres par un seul index.
    const p2 = (o.param2 === undefined || o.param2 === null) ? ''
        : ` data-param2="${window.echapperHtml ? window.echapperHtml(String(o.param2)) : String(o.param2)}"`;
    return `<button type="button" class="pipeline-btn-reorder" title="Monter" aria-label="Monter ${quoi}"
                data-action="${o.actionHaut}" data-param="${p}"${p2}${o.premier ? ' disabled' : ''}
                ><img src="icons/icon-chevron-up.svg" alt=""></button>
            <button type="button" class="pipeline-btn-reorder" title="Descendre" aria-label="Descendre ${quoi}"
                data-action="${o.actionBas}" data-param="${p}"${p2}${o.dernier ? ' disabled' : ''}
                ><img src="icons/icon-chevron-down.svg" alt=""></button>`;
};

/**
 * Le bouton qui retire un bloc d'un formulaire. Icône seule, sans fond : c'est
 * l'icône qui porte le sens, et sa couleur de survol vient de
 * `.btn-delete-icon`. Voir ci-dessus pourquoi ce n'est pas un `.btn-supprimer`.
 *
 * @param {Object} o - { action, param, titre }
 */
window.boutonRetirerBloc = function(o) {
    const p = window.echapperHtml ? window.echapperHtml(String(o.param)) : String(o.param);
    const titre = o.titre || 'Retirer ce bloc';
    const p2 = (o.param2 === undefined || o.param2 === null) ? ''
        : ` data-param2="${window.echapperHtml ? window.echapperHtml(String(o.param2)) : String(o.param2)}"`;
    const coin = o.coin ? ' bloc-retirer-coin' : '';
    return `<button type="button" class="btn-mini btn-icone-nu${coin}" title="${titre}" aria-label="${titre}"
                data-action="${o.action}" data-param="${p}"${p2}
                ><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>`;
};


})();
