# Consigne – lot B de l'enregistrement : un seul témoin, et aucun « enregistré » sur un échec

> Écrite le 27 septembre 2026, à 6 h 09 (Toronto), par Cowork. Source qui fait foi : `plans de travail/DECISIONS-2026-09-26-enregistrement.md` (D0, point 2 ; ordre des lots). Constat : `plans de travail/INVENTAIRE-ENREGISTREMENT-2026-09-26.md` § 4, § 5 point 5, annexe A2 et A4. Fiches : #618, #786.
>
> **Condition de départ** : `git log origin/main` montre `de0b00f1` (1.160.4) ou plus récent, et l'arbre ne porte aucun changement dans `js/`. L'ancienne consigne (accueil et tutoriels) est déjà archivée par Cowork sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-27-accueil-tutoriels.md` : commite le déplacement avec ce lot. Travaille sur une branche (`lot-b-temoin-enregistrement`) ; ne fusionne qu'après la relecture croisée.
>
> **Tout ce qui suit est à remesurer avant le code** : les numéros de ligne et les comptes viennent de l'inventaire du 26 et de ma lecture du 27 (31 lignes d'appel de `sauvegarderDonneesSelonMode`, commentaires compris). Le lot A (1.160.0) a changé la branche anonymisation de la fonction : elle ne rend plus `false` en anonymisation.

## 1 · Ce que Grégoire a décidé (D0, point 2, 26 sept. vers 13 h 10)

« Un seul témoin, le même partout, dit « Enregistré » après chaque écriture. Si l'écriture échoue, il dit « Non enregistré », avec la raison. » Le modèle existe : le message des jetons, « Modification non enregistrée – {geste} : {cause} » (`js/evaluation-jetons.js`, vers la l. 284).

## 2 · Ce que le lot fait, et ce qu'il ne fait pas

**Fait** :

1. **Le contrat de `sauvegarderDonneesSelonMode`** (`js/modes.js`, #786). Aujourd'hui : `true`, ou les chaînes `'quota'` et `'error'`, *truthy*, que les appelants en `if (!…)` lisent comme un succès. **Décision de Cowork (technique)** : la fonction ne rend `true` que si l'écriture a eu lieu, `false` sinon, et c'est ELLE qui fait parler le témoin (succès comme échec). La raison reste lisible par un accesseur pour les rares appelants qui en ont besoin (`evaluation-sauvegarde.js`, ses quatre messages). Si tu mesures qu'un appelant vivant distingue `'quota'` de `'error'` pour agir (et pas seulement pour afficher), arrête-toi et dis-le avant de changer le contrat.
2. **La garde #340** (`db._ecritureAutorisee`, `js/db.js` vers les l. 453 et 1522) fait un `return` nu : la fonction rend alors `true` sans rien écrire. Elle doit se lire comme un échec, avec sa raison.
3. **Le faux message de mémoire pleine** : « Les données sont sauvegardées, mais l'espace disponible est limité… » est retiré ; le témoin dit l'échec.
4. **Les sites vivants qui affichent un succès sur un échec** (inventaire A2, à remesurer) : `evaluation.js` (modification, cadenas), `liste-evaluations.js` (trois sites), `saisie-presences.js` (mesuré au navigateur par l'inventaire). Un message de succès ne part que sur `=== true`. Les sites morts ou injoignables nommés en A2 ne se corrigent pas : commente-les dans ta demande de relecture (issue « commenter »).
5. **Le témoin commun** : un seul composant, posé une fois, que tout écrivain passant par `sauvegarderDonneesSelonMode` fait parler. Charge le skill `design-interface` avant. Mes contraintes :
   - « Enregistré » : discret et bref (il se montrera à chaque auto-enregistrement de l'évaluation, toutes les secondes et demie) ; `role="status"`, `aria-live="polite"`.
   - « Non enregistré : ‹raison› » : visible, et **il reste affiché jusqu'à la prochaine écriture réussie** ou jusqu'à ce qu'on le ferme ; `role="alert"`. Un échec qu'on n'a pas vu est exactement le mal que ce lot répare.
   - Il ne se pose PAS à côté du témoin du Codex (`#codex-menu-statut-haut`, « Tout est enregistré ») : ses mots changent au lot F (D4), pas ici, et deux « enregistré » côte à côte redonneraient la confusion de l'inventaire § 4.
   - Mesure à 360, 768 et 1024 px, en clair et en sombre ; il ne masque aucun bouton de la barre d'Annoter ni de la saisie des présences.
6. **Un échec ne se dit qu'une fois.** Là où un appelant dit déjà l'échec avec son geste (jetons, `evaluation-sauvegarde.js`), le geste passe dans le témoin (« Non enregistré – ‹geste› : ‹raison› », sur le modèle des jetons) et son propre message part. Relève les textes retirés dans ta demande de relecture.

**Ne fait pas** (lots suivants, D1 à D4) : retirer les boutons « Enregistrer » et les messages de succès propres à chaque écran (« Présences enregistrées », « Grille … sauvegardée ! ») ; ils coexistent avec le témoin jusqu'aux lots C à E, **mais seulement sur un succès réel**. Ne touche pas aux 384 appels directs de `db.setSync` (ils n'auront le témoin qu'avec leur écran), ni au double message du Cadre et des seuils (D3, lot E), ni aux mots du Codex (D4, lot F).

**À mesurer, sans coder** : un échec asynchrone d'IndexedDB (`db.js`, vers la l. 1597) n'est qu'un `console.warn`, alors que le témoin aura déjà dit « Enregistré ». Dis dans ta demande de relecture si c'est atteignable dans l'usage, et ce qu'il faudrait pour que le témoin le rattrape.

## 3 · Les mots – proposés par Cowork, à faire accepter par Grégoire AVANT le push

- Succès : « Enregistré »
- Mémoire pleine : « Non enregistré : la mémoire du navigateur est pleine. » ⚠ Si Réglages offre un vrai geste pour libérer de la place, ajoute la phrase qui le nomme **par ce que l'écran affiche** (vérifie le bouton et son appelant vivant ; l'ancien message disait « nettoyer les anciens trimestres dans Réglages », à vérifier contre l'écran).
- Autre erreur d'écriture : « Non enregistré : le navigateur a refusé l'écriture. »
- Garde #340 : « Non enregistré : ces données ne correspondent pas au trimestre ouvert. »
- **Nouvelles** : « Partout où l'application enregistre toute seule, un même témoin dit « Enregistré ». Si une écriture échoue, il dit « Non enregistré » et pourquoi, au lieu d'un message de réussite. » (À ajuster à ce que le lot couvre réellement : s'il ne couvre pas « partout », la phrase le dit.)

## 4 · Preuves

- Par comportement, pas par le texte (erreur 16 de Cowork) : pour chaque site vivant du point 4, simule `db.setSync` qui lève `QuotaExceededError`, puis `Error`, puis la garde #340 qui refuse → aucun message de succès, le témoin dit « Non enregistré : ‹raison› », la base est inchangée. Puis une écriture réussie → « Enregistré », et le « Non enregistré » précédent disparaît.
- Banc WebKit du témoin : visible, rôle et `aria-live` justes, à 360, 768 et 1024 px ; il ne recouvre ni la barre d'Annoter ni les boutons des présences.
- Mutations, chacune rouge : un site remis en `if (!…)` avec la fonction rendant `'quota'` ; le toast « Les données sont sauvegardées » remis ; la garde #340 rendue silencieuse (`true` sans écriture) ; le « Non enregistré » effacé par un simple délai au lieu d'une écriture réussie ; le témoin posé deux fois.
- Vitest complet vert ; les bancs voisins de l'évaluation (#959, #960, #961), des présences et des jetons, verts.

## 5 · Livraison

- **Relecture croisée exigée** (contrat d'une fonction d'écriture centrale) : commit → demande de relecture (`plans de travail/DEMANDE-RELECTURE-2026-09-27-lot-B-enregistrement.md`) → relecture de Cowork → corrections → verdict → fusion.
- **Cases à cocher à la livraison** : #618 et #786, **seulement si** tous leurs sites vivants sont couverts ; sinon, la ligne exacte de ce qui reste sous la fiche, et elle reste ouverte.
- **Stock** : aucun, le lot n'écrit aucune donnée d'utilisateur et n'en efface aucune.
- Release `minor` (un composant d'écran neuf). Les mots du § 3 acceptés par Grégoire avant le push.
- **Porte terrain** : le témoin sur l'iPad, pendant qu'on évalue une copie réelle (il ne doit ni gêner le Pencil ni masquer la barre).
