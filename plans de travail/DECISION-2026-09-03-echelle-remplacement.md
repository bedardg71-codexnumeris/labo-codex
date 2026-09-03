# Décision — supprimer une échelle est un REMPLACEMENT *(#648)*

> **Arrêtée par Grégoire le 3 septembre 2026 au matin, avec Cowork.**
> Application au moment de l'écriture : **1.111.2**, build `0903-0544`, poussée.
> ⛔ **C'est une décision pédagogique. Elle ne se rouvre pas par une mesure.**

---

## La décision, dans la forme qu'il a validée

> Supprimer une échelle dont des évaluations dépendent n'est pas une suppression :
> c'est un **remplacement**. L'application demande par quoi remplacer, migre les
> évaluations, puis retire l'ancienne. **Elle ne propose jamais de la retirer sans
> successeur.**
>
> **Sauf dans un trimestre terminé ou archivé** : là elle refuse, en disant que le
> remplacement toucherait des notes déjà remises.

▣ **Son motif, dans ses mots** : *« On supprime une échelle pour la remplacer par une
autre. Une évaluation ne tient pas s'il n'y a pas d'échelle. Le geste est incomplet, il
doit être suivi d'un remplacement ou d'une correction. »*

⮕ **Ce que ça écarte, et il faut le dire** : les trois issues envisagées jusqu'ici —
*refuser*, *cascader*, *laisser aller* — posaient toutes la mauvaise question. Elles
traitaient la suppression comme un geste qui se suffit. **Il ne se suffit pas.**

---

## L'état mesuré, à remesurer avant de coder

`verifierDependancesEchelle` (`js/donnees-v2.js`, ~l. 1188) :

▣ Elle ne compte que les **pratiques de notation** (`cle('pratiquesConfigurables')`), sur
le **trimestre actif seul**. Elle ne regarde **jamais** les évaluations.
▣ Le compte tombe dans `dependances` et non dans `avertissements` ⮕ **le bouton est
désactivé, sans issue proposée.**
▣ **Témoin du périmètre** : la fonction sœur `verifierDependancesCartouche`, dans le même
fichier, énumère TOUS les trimestres (`enumererTrimestres()`). Le périmètre étroit de
l'échelle n'est donc pas une contrainte de l'architecture.

⚠ **L'archivage existe déjà** : `js/trimestre-v2-liste.js:209` porte « Désarchiver le
trimestre ». Le critère du trimestre terminé est donc disponible ; **mesure le champ exact
avant de t'y fier.**

---

## Les deux cas voisins — tranchés eux aussi, le 3 septembre

### ↻ CORRIGER une échelle sans la supprimer ⮕ le recalcul doit être POSSIBLE

▣ **Ses mots** : *« La correction d'une échelle doit permettre un recalcul, c'est souvent ce
à quoi sert la correction. »*

⮕ **Donc changer la valeur d'un niveau n'est pas un geste qui laisse les notes derrière.**
Un enseignant qui corrige une échelle corrige, la plupart du temps, quelque chose qui a
faussé des notes : lui refuser le recalcul, c'est lui refuser la raison même de son geste.

⚠ **La règle du trimestre terminé ou archivé s'applique ici comme au remplacement** : on
refuse, en disant que ça toucherait des notes déjà remises.

↻ **TRANCHÉ le 3 septembre : le recalcul est PROPOSÉ, jamais automatique.**
▣ **Ses mots** : *« Il permet d'informer l'utilisateur des conséquences de son geste. »*
⮕ **La proposition n'est donc pas une politesse : c'est le seul moment où l'enseignant
apprend combien d'évaluations sa correction touche.** Elle nomme le compte AVANT le geste.
⛔ **Un recalcul silencieux est exclu**, même s'il donne le bon résultat : il écrit dans ses
données sans qu'il ait vu ce que ça emportait.

### ↻ Une échelle qu'AUCUNE évaluation n'emploie ⮕ ON NE FAIT RIEN

▣ **Ses mots** : *« On ne fait rien, c'est peut-être tout simplement un projet qui n'est pas
terminé. »*

⛔ **Pas d'avertissement, pas de proposition de ménage, pas de signalement « inutilisée ».**
Une échelle sans dépendance n'est pas un déchet : c'est peut-être un travail en cours.
⮕ **Elle se supprime sans cérémonie, et elle se laisse tranquille le reste du temps.**
▣ **C'est le témoin négatif du même énoncé** : une suppression sans conséquence se fait
**sans un mot de plus**.

---

## Fini quand

**Un enseignant qui s'est trompé dans une échelle peut la remplacer, et ses notes suivent.**

▣ **Le témoin** : l'écran ne propose plus « Supprimer » nu sur une échelle employée par des
évaluations. Il propose de remplacer, et dit combien d'évaluations suivront.
▣ **Le témoin négatif** : dans un trimestre archivé, il refuse — et dit pourquoi, en nommant
les notes déjà remises.
