# Demande de relecture – lot B de l'enregistrement : un seul témoin, et aucun « enregistré » sur un échec

> Écrite le 27 septembre 2026 par Claude Code, pour Cowork. Branche `lot-b-temoin-enregistrement`, partie de `de0b00f1` (1.160.4). Consigne : `plans de travail/CONSIGNE-DU-JOUR.md` (27 sept., 6 h 09). Fiches : #618, #786. **Pas de release ni de fusion avant ta relecture**, et pas de push avant que Grégoire ait accepté les mots du § 5.

## 1 · Ce que le lot change, en une phrase par pièce

| Pièce | Avant | Après |
|---|---|---|
| `sauvegarderDonneesSelonMode` (`js/modes.js`) | `true`, `'quota'`, `'error'` (chaînes truthy) ; toast « Les données sont sauvegardées… » sur un quota | `true` ou `false`, jamais une chaîne ; c'est elle qui fait parler le témoin (succès et échec) ; 3e paramètre `{ geste, discret }` |
| `db.setSync` (`js/db.js`) | `return` nu sur la garde #340 (la fonction centrale rendait `true` sans écriture) | rend `false` sur la garde, `true` sinon (aucun appelant ne lisait son retour, mesuré par grep) |
| Témoin commun (`js/temoin-enregistrement.js`, neuf) | aucun | un nœud `#temoin-enregistrement`, deux régions : « Enregistré » (`status`, `polite`, 2 s) et « Non enregistré… » (`alert`, reste jusqu'à la prochaine écriture réussie ou « Fermer ») |
| Sites vivants (§ 2) | succès affiché sur `'quota'`/`'error'` | succès seulement sur `=== true` |
| Jetons, `evaluation-sauvegarde.js`, rétroaction | leur propre toast d'échec | le geste passe au témoin, leur toast part (§ 4) |

**Décision technique prise seule (je la nomme)** : pas d'accesseur de la raison. La consigne en prévoyait un « pour les rares appelants qui en ont besoin » ; mesuré, aucun appelant vivant ne distingue `'quota'` de `'error'` pour **agir** – `evaluation-sauvegarde.js` ne le faisait que pour choisir son message, et ce message part (point 6). Un export sans consommateur serait du code mort à la naissance. Le paramètre `geste` couvre le seul besoin réel.

**Deuxième décision technique** : l'option `discret: true` tait le succès (jamais l'échec) pour les écritures que l'usager n'a pas faites : `indices.js` (recalcul de l'assiduité), `migrations.js`, `migration-diagnostic.js` (outil de console). Sans elle, « Enregistré » clignoterait au démarrage sans geste de personne.

## 2 · Sites d'appel remesurés (47 lignes du nom dans `js/`, 28 appels réels)

La consigne annonçait 31 lignes ; l'inventaire, 28 appels – même compte. Les 19 autres lignes : définition, export, commentaires. Numéros d'avant le lot.

**Vivants, qui affichaient un succès sur un échec – corrigés, éprouvés au navigateur :**

- `evaluation.js:1956` (`sauvegarderEvaluationModifiee`, « Évaluation modifiée ») ;
- `evaluation.js:2611` (cadenas, `basculerVerrouillageEvaluationCourante`) : sur un échec, le verrou reprend aussi sa valeur dans le tableau lu (il peut être l'objet du cache mémoire) ;
- `liste-evaluations.js:2284` (`supprimerEvaluation`) : retour immédiat, ni détachement ni « Évaluation supprimée » ;
- `liste-evaluations.js:2962` (suppression définitive d'un fichier) : le compte « et N évaluations » n'est posé que sur `true` ; « Fichier supprimé définitivement. » reste, il est vrai ;
- `liste-evaluations.js:3057` (vider la corbeille) : « Corbeille vidée. » reste (les fichiers sont partis) ; le témoin dit l'échec pour les évaluations ;
- `saisie-presences.js:1733` (« Présences enregistrées »).

**Vivants et silencieux – ils parlent maintenant par le témoin, sans autre changement :** l'auto-enregistrement (`evaluation-chargement.js:2035`, `2071`), `evaluation-sauvegarde.js:464`, `liste-evaluations.js:2354`, `travaux-ui.js:3797`, `evaluation.js:1819`.

**Morts ou injoignables – non corrigés (issue « commenter »)** : `evaluation.js:1979`, `2002` (aucun appelant), `2432`, `2494`, `2531` (Banque : `ouvrirBanqueEvaluations` sort à la 1re ligne, `#modalBanqueEvaluations` absent d'`index.html`), `2570` (aucun appelant). Ils gardent un succès inconditionnel ; ils rejoindront le retrait du code mort (inventaire A7).

## 3 · Deux constats en chemin (issue « inscrire »)

1. **`travaux-ui.js:3797`** (supprimer une copie importée qui porte une évaluation) : si l'écriture des évaluations échoue, le fichier est quand même supprimé. Le témoin le dit désormais, mais l'état reste incohérent (évaluation sans copie). Hors lot : ce n'est pas un succès affiché sur un échec.
2. **`migrations.js:1036`** : le drapeau de migration est posé même sur un refus (déjà relevé en A2). Le témoin dit maintenant l'échec ; le drapeau, non.
3. Observation, sans fiche : sur un échec, `supprimerEvaluation` a déjà muté le tableau lu (`restaurerOriginaleSiReprise`). Pour une clé servie par le cache mémoire (valeurs de plus de 25 Ki caractères), la séance peut voir l'originale restaurée jusqu'au rechargement. Même famille que la remarque de l'inventaire sur l'anonymisation.

À toi de dire si 1 et 2 méritent une fiche (règle du BACKLOG : aucun symptôme vécu à ce jour).

## 4 · Textes retirés (un échec ne se dit qu'une fois)

| Où | Texte retiré |
|---|---|
| `modes.js` | « Espace de stockage presque plein – Les données sont sauvegardées, mais l'espace disponible est limité. Tu peux nettoyer les anciens trimestres dans Réglages. » |
| `evaluation-jetons.js` | « Modification non enregistrée – ‹geste› : l'espace de stockage est plein. » / « … : le stockage a refusé l'écriture. » |
| `evaluation-sauvegarde.js` | « Espace de stockage insuffisant – Le quota de stockage du navigateur est dépassé. Exporte tes données (Réglages → Données) puis supprime des évaluations anciennes. » ; « Erreur de sauvegarde – Une erreur inattendue s'est produite. Consulte la console pour plus de détails. » |
| `travaux-ui.js` (rétroaction) | « Espace de stockage insuffisant – Impossible de sauvegarder la rétroaction. » |

Gestes passés au témoin : « Enregistrement de l'évaluation », « Verrouillage / Déverrouillage de l'évaluation », « Suppression de l'évaluation », « Suppression des évaluations du fichier », « Suppression des évaluations de la corbeille », « Suppression de l'évaluation du fichier », « Enregistrement des présences », « Enregistrement de la rétroaction », et les quatre gestes des jetons, inchangés.

## 5 · Les mots – à faire accepter par Grégoire avant le push

- Succès : « Enregistré »
- Mémoire pleine : « Non enregistré : la mémoire du navigateur est pleine. Pour libérer de la place : Cadre › Trimestre › Bibliothèque, « Supprimer… » sur un ancien trimestre. »
  - ⚠ **L'ancien message se trompait d'écran** : il n'y a rien pour libérer de la place dans Réglages. Le seul geste réel est **Cadre › Trimestre › Bibliothèque › « Supprimer… »** (`trimestre-v2-liste.js:301`, `confirmerSuppressionTrimestre`), et il est irréversible. D'où la question à Grégoire (§ 8).
  - ⚠ Le chemin « quota » est quasi mort : `db.setSync` ne lève que si IndexedDB est absent ou pas encore prêt (#786 le disait déjà).
- Autre erreur : « Non enregistré : le navigateur a refusé l'écriture. »
- Garde #340 : « Non enregistré : ces données ne correspondent pas au trimestre ouvert. »
- Avec un geste : « Non enregistré – ‹geste› : ‹raison› » (modèle des jetons).
- **Nouvelles**, ajustées à ce que le lot couvre (pas « partout ») : « Quand l'application enregistre une évaluation, un jeton, une rétroaction ou des présences, un même témoin dit « Enregistré » en bas de l'écran. Si l'écriture échoue, il dit « Non enregistré » et pourquoi, et reste affiché jusqu'à la prochaine écriture réussie – au lieu d'un message de réussite. »

## 6 · Preuves

**Vitest** : 643/643 fichiers, 7 470/7 470 tests, 0 « Errors » ni « Unhandled ». Nouvelle sentinelle `tests/unit/sentinelle-lot-b-contrat-enregistrement-786.test.js` : `modes.js` réel, les trois pannes, le succès, le mode discret, l'ordre garde → succès dans quatre fichiers. Six fichiers de tests réancrés sur le nouveau contrat : leurs doublures rendaient `'quota'`/`'error'` et asservaient l'ancien toast des jetons (#563, #725, #560, #340, G5 de l'audit du 5 sept., fichier de reprise #612).

**WebKit** `tests/integration/temoin-enregistrement-lot-b.spec.js` (10 essais, verts) :

- le témoin : un seul nœud après sept écritures, `alert` / `status` + `polite`, l'échec encore là 3,5 s plus tard, effacé par une écriture réussie, « Fermer » à 44 px, `pointer-events: none` ailleurs ;
- par comportement, sur chaque site vivant : `db.setSync` lève `QuotaExceededError`, puis `Error`, puis la **vraie** garde #340 (posée par `db.enregistrerGardeEcriture`) → aucun toast de succès, le témoin dit « Non enregistré – ‹geste› : ‹raison› », base inchangée ; puis écriture réussie → succès, « Enregistré », échec effacé ; ceci pour les présences (bouton réel), la modification, le cadenas, la suppression, et les deux gestes de la corbeille ;
- placement : 360, 768 et 1024 px, clair et sombre → aucun contrôle des présences (barre d'actions, verrou, précédent/suivant, date) ni de la barre d'Annoter en plein écran sous le « Non enregistré » le plus long ; aucun débordement horizontal.

**Placement, mesuré puis corrigé** : posé d'abord en bas à gauche sur 420 px, il recouvrait « Rapport · Enregistrer » des présences à 768 px (la barre passe à la ligne, x = 294 px). Rétréci à 280 px, il devenait plus haut et, à 1024 × 768, montait sur « ← Précédent ». Retenu : à gauche sur 270 px au plus sous 900 px de large, à droite sur 420 px au plus au-delà. Contrastes calculés : sombre 8,05 (succès) et 9,22 (échec) ; clair 5,14 et 14,64.

**Mutations (restauration par copie, empreintes vérifiées)** – chacune rougit :

| Mutation | Rouge |
|---|---|
| présences remises en `if (!…)` + la fonction rend `'quota'` | Vitest 3, WebKit 2 |
| toast « Les données sont sauvegardées » remis | Vitest 2 |
| garde #340 silencieuse (`return true`) | Vitest 1 (#340), WebKit présences |
| « Non enregistré » effacé par un délai de 3 s | WebKit témoin |
| témoin posé à chaque appel | WebKit 2 |

**Bancs voisins** (WebKit, 78 essais, verts) : #919, #926, #959 (×2), #961, #939, #944, #946, #606, #881, lot A, présences (#749, parcours neuf), audit sommatif du 24 sept., #760/#759, rendu de l'évaluation.

## 7 · À mesurer sans coder : l'échec asynchrone d'IndexedDB

**Atteignable dans l'usage – oui.** `db._setIndexedDB` rejette sur `onabort`/`onerror` (quota de l'origine, transaction avortée, connexion fermée – le cas connu de Safari sur iPad après une mise en arrière-plan), et `_trackOperation` n'en fait qu'un `console.warn` (`db.js`, vers la l. 1603). Le témoin a déjà dit « Enregistré ». **C'est le cas le plus grave** pour les grosses clés (au-delà de `SEUIL_IDB_FIRST`, 25 Ki caractères – `evaluationsSauvegardees` d'un groupe réel les dépasse vraisemblablement) : elles ne vont QUE dans le cache mémoire et IndexedDB. Un échec asynchrone y est une perte au rechargement.

**Ce qu'il faudrait** : que `_trackOperation` émette un signal d'échec (sur le modèle de `_signalerEcriture` / `surEcriture`), auquel `modes.js` s'abonne pour appeler `temoinEnregistrement.nonEnregistre(raison)` – sans geste (on ne sait plus lequel), ou avec un geste retrouvé par la clé. Le « Non enregistré » restant jusqu'à la prochaine écriture réussie, il faudrait aussi qu'une écriture synchrone qui « réussit » ne l'efface pas tant que l'écriture IDB de la même clé n'a pas commit. Chantier distinct, à trancher.

## 8 · Ce qui remonte à Grégoire – TRANCHÉ le 27 sept. 2026, vers 6 h 45

- **Mémoire pleine** : trois suites lui ont été proposées (nommer la Bibliothèque ; la phrase seule ; « Fais une copie de secours, puis… »). Il garde **« Nommer la Bibliothèque »**, telle que codée : « … Pour libérer de la place : Cadre › Trimestre › Bibliothèque, « Supprimer… » sur un ancien trimestre. »
- **Les autres mots du § 5 et la phrase des Nouvelles** : **« Oui, tels quels »**.

## 9 · Livraison prévue après ta relecture

- Cases : #618 et #786 cochées – tous leurs sites vivants sont couverts (§ 2) ; les morts sont nommés.
- **Stock** : aucun – le lot n'écrit ni n'efface aucune donnée d'utilisateur.
- Release `minor` (composant d'écran neuf), puis fusion.
- **Porte terrain** : le témoin sur l'iPad, pendant qu'on évalue une copie réelle – il ne gêne pas le Pencil, ne masque ni la barre ni le carrousel, et « Enregistré » ne distrait pas toutes les 1,5 s. Le banc n'a pas vu le carrousel ni le panneau d'évaluation avec une vraie copie.
