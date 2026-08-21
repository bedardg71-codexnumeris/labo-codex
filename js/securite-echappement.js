/* ===============================
   MODULE: ÉCHAPPEMENT EN CONTEXTE D'ATTRIBUT (CT-29)

   Rôle: fonction PURE, sans accès au DOM ni au stockage.

   `echapperHtml()` (config.js — zone protégée) échappe par la voie
   textContent → innerHTML. Cette voie encode `&`, `<` et `>`, mais PAS les
   guillemets : le navigateur n'a aucune raison d'encoder un `"` dans du texte.
   Elle est donc correcte en contexte de TEXTE et insuffisante en contexte
   d'ATTRIBUT — `value="${echapperHtml(x)}"` laisse sortir de l'attribut dès que
   x contient un `"` (constat CT-29, audit du 20 août 2026).

   Ce module ne remplace pas `echapperHtml` et n'y touche pas : il ajoute la
   variante à utiliser QUAND la valeur atterrit entre guillemets d'attribut.

   API publique:
   - echapperAttribut(valeur) → chaîne sûre entre guillemets
     Fonction PURE (testée dans tests/unit/securite-echappement-CT29.test.js).
   =============================== */

(function() {
'use strict';

// L'ordre compte : `&` d'abord, sinon on ré-échapperait les `&` produits.
const REMPLACEMENTS = [
    [/&/g, '&amp;'],
    [/</g, '&lt;'],
    [/>/g, '&gt;'],
    [/"/g, '&quot;'],
    [/'/g, '&#39;']
];

/**
 * Échappe une valeur destinée à un attribut HTML entre guillemets.
 *
 * Couvre les cinq caractères qui permettent de sortir d'un attribut ou d'en
 * ouvrir un autre. `null`/`undefined` rendent la chaîne vide, comme
 * `echapperHtml`, pour rester interchangeables aux points d'appel.
 *
 * @param {*} valeur - valeur à insérer dans un attribut
 * @returns {string} valeur échappée
 */
function echapperAttribut(valeur) {
    if (valeur == null) return '';
    let sortie = String(valeur);
    for (const [motif, remplacement] of REMPLACEMENTS) {
        sortie = sortie.replace(motif, remplacement);
    }
    return sortie;
}

/* ===============================
   EXPORTS GLOBAUX
   =============================== */

window.echapperAttribut = echapperAttribut;

})();
