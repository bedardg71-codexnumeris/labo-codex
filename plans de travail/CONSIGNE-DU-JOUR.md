# Consigne – lot D de l'enregistrement : les présences (D2)

> Écrite le 27 septembre 2026, à 10 h 32 (Toronto), par Cowork. Source qui fait foi : `plans de travail/DECISIONS-2026-09-26-enregistrement.md`, **D2** (et D0). Constat : `plans de travail/INVENTAIRE-ENREGISTREMENT-2026-09-26.md`, § 3 « Présences », annexe A1 (scénarios mesurés).
>
> **Condition de départ** : `git log origin/main` montre `06af5089` (1.162.0) ou plus récent, et l'arbre ne porte aucun changement dans `js/`. Supprime d'abord la branche locale `lot-c-evaluation-verrouiller` (fusionnée et poussée). L'ancienne consigne (lot C) est archivée par Cowork sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-27-lot-C-evaluation.md` : commite le déplacement avec ce lot. Branche `lot-d-presences` ; fusion après la relecture croisée seulement.
>
> **À remesurer avant le code** : ce qui suit vient de l'inventaire du 26 et de ma lecture de `js/saisie-presences.js` et d'`index.html` (vers la l. 7967) le 27 vers 10 h 30.

## 1 · Ce que Grégoire a décidé (D2, 26 sept. vers 13 h 39, « bien pensé ! je garde »)

- Tout changement dans une séance s'enregistre tout seul ; le témoin commun dit « Enregistré ».
- **Dès qu'on change quelque chose dans une séance, elle devient saisie** : les élèves qu'on n'a pas touchés comptent présents (pratique « on ne marque que les absences »).
- Une séance jamais saisie le dit : **« Séance non saisie »**. Elle reste « en attente » dans l'assiduité, comme aujourd'hui. **Aucune présence n'est inventée pour une séance qu'on n'a pas touchée.**
- Le bouton « Enregistrer » devient **« Confirmer la séance »** (tout le monde présent, rien à changer) ; la séance passe à « saisie ».
- « Verrouiller » garde son rôle, mais dit qu'il enregistre la séance quand il le fait.

## 2 · Ce que j'ai lu, et les décisions techniques de Cowork

- **Deux écrivains aujourd'hui** : `enregistrerPresences` (bouton, avec validation) et `sauvegarderPresencesSansValidation` (appelée par le verrou). **Un seul écrivain après le lot**, qui passe par `sauvegarderDonneesSelonMode` avec un geste (le témoin du lot B), et que l'enregistrement automatique, « Confirmer la séance », « Tous présents » et le verrou appellent tous. Il garde les protections existantes : la garde #749 (aucun cours actif → rien n'est écrit), la règle #785 (**ne retirer que ce qui sera réécrit** : seules les lignes rendues au tableau s'écrivent), les absences motivées RàI (`facultatif`) préservées, les notes par `_notesDuChamp`.
- **Enregistrement automatique** : changer les périodes d'un·e élève, taper une note, « Tous présents » → écriture après un court délai (même patron que l'évaluation : délai de 1,5 s pour la frappe, **vidage** de l'écriture en attente avant tout changement de date, de séance, de groupe, de tri, d'onglet, et au rechargement). Les pertes mesurées par l'inventaire (A1 : saisie puis séance suivante, puis `naviguerVers`) doivent disparaître.
- **Un chargement n'écrit rien** : ouvrir une séance jamais saisie n'écrit aucune présence (c'est le cœur de « aucune présence inventée ») ; ouvrir une séance saisie ne la réécrit pas. Même famille que #960.
- **La validation** (`validerDateSaisie`, jour sans cours, etc.) : l'enregistrement automatique n'écrit que ce que « Confirmer la séance » accepterait ; un refus se dit **une fois** (pas à chaque frappe), et rien n'est écrit.
- **Séance verrouillée** : ses champs restent en lecture seule ; rien ne s'écrit en arrière-plan.
- **« Réinitialiser »** met tout le monde absent et vide les notes, **sans confirmation** (`reinitialiserSaisie`, « pour être plus rapide »). Avec l'enregistrement automatique, un seul toucher remplacerait une séance déjà saisie : c'est une perte que la règle de Grégoire du 20 sept. interdit de laisser passer en silence. **Sur une séance saisie**, « Réinitialiser » demande confirmation (patron #945 : « Annuler » sélectionné, Entrée suit la sélection) ; sur une séance non saisie, rien ne change.
- **« Annuler »** (barre des présences) n'annule rien : il ramène à la liste. Il devient **« Fermer »** (même logique que D3), sous réserve des mots du § 3.
- **Le message « Présences enregistrées »** part : le témoin le dit.

## 3 · Ce qui s'arrête et remonte à Grégoire (arrête-toi et dis-le, sans coder cette partie)

1. **Un filtre qui cache des élèves.** Si la séance est déclarée « saisie » pour tout le groupe (et non élève par élève) et qu'un filtre de sous-groupe ou de recherche cache des élèves au moment du premier geste, D2 compterait présents des élèves que l'enseignant·e n'a pas vus. Mesure comment l'assiduité décide qu'une séance est « en attente » (par élève ou par séance) : **si c'est par élève**, écrire seulement les lignes rendues suffit, continue ; **si c'est par séance**, arrête-toi et décris le cas.
2. **Une séance en partie saisie** (des élèves écrits, d'autres non, par exemple un·e élève arrivé·e après la saisie) : dis ce que l'écran affiche aujourd'hui et ce que l'assiduité en fait. Si D2 changerait leur compte, arrête-toi.

## 4 · Les mots – à faire accepter par Grégoire AVANT le push

Déjà décidés (D2) : « Séance non saisie » ; « Confirmer la séance ».

Proposés par Cowork :
- Sur une séance saisie, à la place du bouton : **« Séance saisie »** (texte d'état, pas un bouton).
- Au verrouillage d'une séance non saisie : **« Séance saisie et verrouillée : les élèves non marqué·es comptent présent·es. »** ; d'une séance déjà saisie : **« Séance verrouillée. »**
- Confirmation de « Réinitialiser » sur une séance saisie : **« Mettre tout le monde absent et vider les notes de cette séance ? »**, boutons **« Annuler »** / **« Réinitialiser »**.
- **« Fermer »** à la place d'« Annuler » dans la barre des présences.
- **Nouvelles** : « Présences : tout changement dans une séance s'enregistre tout seul, et le témoin le dit ; les élèves que tu n'as pas touché·es comptent présent·es. Une séance à laquelle tu n'as pas touché le dit : « Séance non saisie ». « Enregistrer » devient « Confirmer la séance », pour une séance où tout le monde était là. »
- **Aide** : relève les textes de l'Aide et de l'accompagnement qui parlent d'« Enregistrer » les présences ; ils changent avec le lot, Grégoire les relit.

## 5 · Preuves

- Par comportement : (a) marquer une absence, passer à la séance suivante sans autre geste, revenir → l'absence est en base, le témoin a dit « Enregistré », les autres élèves sont présents ; idem avec une note tapée, puis rechargement dans la seconde et demie ; idem par changement d'onglet. (b) Ouvrir une séance jamais saisie : **aucune** présence écrite, l'écran dit « Séance non saisie », l'assiduité la compte « en attente ». (c) « Confirmer la séance » : tous présents en base, l'écran dit « Séance saisie ». (d) Verrouiller une séance non saisie : elle devient saisie et verrouillée, un seul message. (e) « Réinitialiser » sur une séance saisie : confirmation, « Annuler » ne change rien, Entrée sur « Annuler » ne change rien. (f) Une absence motivée RàI survit à « Tous présents » et à l'enregistrement automatique. (g) Échec d'écriture : le témoin dit « Non enregistré – Enregistrement des présences : … », aucun succès.
- Mutations, chacune rouge : un chargement qui écrit ; l'écriture qui retire aussi les lignes non rendues (#785) ; pas de vidage au changement de séance ; « Réinitialiser » sans confirmation sur une séance saisie ; le verrou qui passe par l'ancien écrivain.
- Vitest complet ; bancs WebKit des présences (#749, #768, #785, parcours neuf, lot B) verts ; placement de la barre à 360, 768, 1024 et 1180 px (le libellé « Confirmer la séance » est plus long qu'« Enregistrer » : il ne passe pas sous le témoin).

## 6 · Livraison

- **Relecture croisée exigée** (l'assiduité entre dans le dépistage et l'indice A) : commit → `plans de travail/DEMANDE-RELECTURE-2026-09-27-lot-D-presences.md` → relecture de Cowork → corrections → verdict → fusion.
- **Fiches** : cherche dans `BACKLOG.md` et `SUIVI-BUGS.md` les fiches ouvertes que le lot règle (présences perdues, séance non saisie, verrou qui enregistre, #785…) ; coche celles-là seules, ligne exacte sous celles réglées en partie.
- **Stock** : rien n'est réécrit ; une séance jamais saisie le reste tant qu'on n'y touche pas.
- Release `minor`. Mots et Aide acceptés par Grégoire avant le push.
- **Porte terrain** (iPad, groupe réel) : marquer une absence, passer à la séance suivante, revenir ; une séance jamais touchée dit « Séance non saisie » ; « Confirmer la séance » ; verrouiller.
