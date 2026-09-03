# Consigne du jour — supprimer une échelle devient la remplacer *(#648)*

> **Écrite le 3 septembre 2026 à 6 h 10 (heure de Grégoire), par Cowork, avec lui.**
> **Application au moment de l'écriture : `1.111.2`, build `0903-0544`, POUSSÉE.**
> Elle remplace la consigne du vocabulaire, exécutée et livrée (`a69fb166`, `225f55e2`,
> `763f5e46`).
>
> ▣ **État à l'écriture, mesuré** : `HEAD` = `763f5e46`,
> `git rev-list --count origin/main..HEAD` rend **0** — témoin, `HEAD..origin/main` rend **0**
> lui aussi. Arbre propre sauf `OU-EN-EST-ON.md` et `PROTOCOLE.md`, qui sont à Cowork :
> **ne les commite pas.**
>
> ▣ **Grégoire est éveillé** et regardera l'écran dès que tu diras que c'est prêt.
>
> ⚠ **REMESURE TOUT** (règle 1). Les lignes citées ici ont été prises par Cowork en lecture
> seule ; elles ne sont pas les tiennes.
>
> ⮕ **La décision complète, avec ses motifs, est dans
> `plans de travail/DECISION-2026-09-03-echelle-remplacement.md`. LIS-LA D'ABORD.**
> Cette consigne en est l'exécution, pas le résumé.

---

## ⛔ LE POINT QUI COMMANDE TOUT LE RESTE — TU VAS ÉCRIRE DANS SES DONNÉES

**Migrer des évaluations vers une autre échelle, c'est réécrire des évaluations réelles de
Grégoire.** C'est le point 2 de ce qui remonte jusqu'à lui (`CLAUDE.md`), et c'est le
périmètre exact de la **règle 2** de `PROTOCOLE.md` : relecture croisée obligatoire, parce
que ça ne se reprend pas.

⮕ **Ce que ça t'impose, et ce n'est pas négociable :**
1. **La migration ne s'exécute jamais sans que l'utilisateur ait vu le compte AVANT.**
2. **Aucun essai sur ses trimestres réels.** Bancs et données forgées seulement.
3. ⛔ **Tu ne répares aucun stock existant d'office.** « Tarir n'est pas réparer » : ce
   correctif change ce qui se passera, pas ce qui est déjà écrit chez les gens.
4. **Le lot passe par la relecture croisée de Cowork avant tout verdict.** Dis-le quand tu es
   prêt ; ne prends pas le verdict au jeton avant.

---

## Le mandat — décision de Grégoire, 3 septembre au matin

**Supprimer une échelle dont des évaluations dépendent n'est pas une suppression : c'est un
remplacement.** L'application demande par quoi remplacer, migre les évaluations, puis retire
l'ancienne. **Elle ne propose jamais de la retirer sans successeur.**

▣ **Son motif, dans ses mots** : *« On supprime une échelle pour la remplacer par une autre.
Une évaluation ne tient pas s'il n'y a pas d'échelle. Le geste est incomplet, il doit être
suivi d'un remplacement ou d'une correction. »*

⮕ **Ce que ça écarte** : les trois issues envisagées jusqu'ici — refuser, cascader, laisser
aller — posaient toutes la mauvaise question. Elles traitaient la suppression comme un geste
qui se suffit. **Il ne se suffit pas.**

### Les trois cas, tous tranchés

| cas | comportement arrêté |
|---|---|
| des évaluations dépendent de l'échelle | **remplacement obligatoire** : par quoi, puis migration, puis retrait |
| trimestre **terminé ou archivé** | **refus**, en disant que ça toucherait des notes déjà remises |
| **aucune** évaluation ne l'emploie | **rien de spécial** : elle se supprime sans un mot de plus |

⚠ **Le troisième est le témoin négatif, et il compte autant que les deux autres.** Pas
d'avertissement, pas de proposition de ménage, aucun signalement « inutilisée ». **Ses mots** :
*« C'est peut-être tout simplement un projet qui n'est pas terminé. »*

---

## L'état mesuré — à rejouer avant de coder

`verifierDependancesEchelle` → **`js/donnees-v2.js:1188`**

▣ Elle ne compte que les **pratiques de notation** (`cle('pratiquesConfigurables')`), sur le
**trimestre actif seul**. Elle ne regarde **jamais** les évaluations.
▣ Le compte tombe dans `dependances`, pas dans `avertissements` ⮕ **le bouton est désactivé,
sans issue proposée.** L'enseignant est bloqué sans savoir quoi faire.
▣ **Témoin que le périmètre étroit n'est pas une contrainte d'architecture** : la fonction
sœur `verifierDependancesCartouche`, dans le même fichier, énumère TOUS les trimestres
(`enumererTrimestres()`).

▣ **L'archivage existe déjà, et son champ est mesuré** : `js/trimestre-v2-liste.js:88` teste
`t.archive === true`, et la l. 100 affiche le badge « Archivé ». ⚠ **« Terminé » n'est pas
mesuré** : cherche s'il existe un autre marqueur, et **si tu n'en trouves pas, dis-le et
n'invente pas de critère** — le refus portera alors sur l'archivage seul.

⚠⚠ **Et cherche la DUALITÉ avant de coder.** `supprimerEchelleDefinitivement` existe en
**deux corps** — `js/echelles.js` et `js/donnees-v2.js` — mesuré le 2 septembre : deux
chemins de suppression indépendants, l'un depuis l'onglet Données, l'autre depuis Conception
› Échelles. **Remesure-le, et traite les deux.** Un remplacement offert d'un côté et une
suppression nue de l'autre serait pire que l'état actuel.

---

## Le cas voisin — CORRIGER une échelle sans la supprimer

**Le recalcul doit être possible, et il est PROPOSÉ, jamais automatique.**

▣ **Ses mots** : *« La correction d'une échelle doit permettre un recalcul, c'est souvent ce à
quoi sert la correction. »* et *« Il permet d'informer l'utilisateur des conséquences de son
geste. »*

⮕ **La proposition n'est pas une politesse : c'est le seul moment où l'enseignant apprend
combien d'évaluations sa correction touche.** Elle nomme le compte AVANT le geste.
⛔ **Un recalcul silencieux est exclu**, même s'il donne le bon résultat.
⚠ **La règle du trimestre archivé vaut ici aussi.**

⮕ **Si ce volet double la taille du lot, ARRÊTE-TOI APRÈS LE REMPLACEMENT et dis-le.**
Deux lots valent mieux qu'un lot à moitié fait sur des chemins qui écrivent dans ses données.

---

## Fini quand

**Un enseignant qui s'est trompé dans une échelle peut la remplacer, et ses notes suivent.**

▣ **Le témoin** : l'écran ne propose plus « Supprimer » nu sur une échelle employée par des
évaluations — il propose de remplacer, et dit combien d'évaluations suivront.
▣ **Le témoin négatif** : une échelle qu'aucune évaluation n'emploie se supprime **sans un mot
de plus** qu'avant ce lot.
▣ **Le témoin du refus** : dans un trimestre archivé, il refuse, et nomme les notes déjà
remises.
▣ **Le témoin des données** : aucune évaluation réelle n'a été écrite pendant ton travail.
Cite la commande qui le montre.

---

## L'ordre

1. **Rapporte le verdict de GitHub sur `763f5e46`** (rituel d'ouverture, §2.1).
2. **Lis la décision** (`plans de travail/DECISION-2026-09-03-echelle-remplacement.md`).
3. **Remesure** : les deux chemins de suppression, le champ d'archivage, le périmètre du
   compte. **Rends-moi ça avant de coder.**
4. Ce lot touche `js/` ⮕ **bump du bloc de jetons d'`index.html`**.
5. `cd tests && npm run test:unit` pour travailler ; **`npm test` complet avant de dire que
   c'est prêt** — ce lot touche des chemins qui écrivent dans les évaluations.
   ⚠ Vitest se lance **depuis `tests/`**.
6. ⛔ **Tu commites, puis tu t'arrêtes.** Pas de release, pas de push, pas de verdict au
   jeton : relecture croisée de Cowork, puis coup d'œil de Grégoire, puis seulement le reste.
7. **Ce fichier se commite avec ton lot.** Nomme tes fichiers ; pas de `git add -A`.

⮕ **CE QUE GRÉGOIRE DOIT ALLER VOIR** : ouvrir **Conception › Échelles**, tenter de supprimer
une échelle qu'il emploie, et lire ce que l'écran propose. Il doit lui demander par quoi la
remplacer, et dire combien d'évaluations suivront. ⚠ **Qu'il ne confirme pas.** Lire suffit.
