# Plan de travail — le ménage des répertoires

> **Écrit le 2 septembre 2026 en soirée, par Cowork, à la demande de Grégoire.**
> **Rien n'a été déplacé, rien n'a été supprimé.** Ce plan mesure, propose, et attend.
>
> ⛔ **Trois raisons de ne rien faire avant d'avoir tranché**, et elles valent d'être écrites :
> 1. **Une suppression est irréversible** dès qu'elle est commitée et poussée.
> 2. **Claude Code a un lot en vol** (le verdict de la CI). Deux sessions qui écrivent dans le
>    même arbre se marchent dessus.
> 3. ▣ **`device_bash` ne peut PAS supprimer** — `rm` y rend « Operation not permitted ». Tout
>    ménage passe donc soit par Claude Code, soit par une permission que Grégoire accorde.
>    **C'est une contrainte utile : elle force le passage par lui.**

---

## L'état, mesuré le 2 septembre

| endroit | fichiers | poids |
|---|---|---|
| **`Retours des testeurs/`** | **317** | **92 Mo** |
| `docs/` | 36 | 6,4 Mo |
| **`plans de travail/`** | **146** | 3,1 Mo |
| `Rapports/` | 58 | 1,5 Mo |
| racine (fichiers) | 31 | — |

**Les quatre gros de la racine** : `SESSION.md` **1,3 Mo** · `BACKLOG.md` **964 Ko** ·
`BACKLOG-ARCHIVE.md` 276 Ko · `RELAIS.md` 244 Ko.

---

## Les quatre constats, du plus au moins net

### 1 · `Retours des testeurs/` porte 92 Mo pour 317 fichiers — et ce ne sont pas des retours

`find … | sed 's/.*\.//' | sort | uniq -c` :
**209 `.txt`** · **97 `.png`** · 5 `.md` · 5 `.DS_Store` · 1 `.json`.
▣ Les cinq `.md` sont les vrais documents (`SUIVI-BUGS.md`, 126 Ko, en est le cœur). **Le reste
est de la capture** — 250 entrées sous `gregoire/`, plus `bruno/` et `jordan/` datés de février.

⮕ **C'est là qu'est le poids**, et de loin : 92 Mo sur ~103 Mo de documents.
⚠ **Ce sont des données de terrain**, pas du bruit : des rapports d'usage réels, avec des
captures d'écran. **Rien ne dit qu'ils sont jetables** — mais rien ne dit non plus qu'ils ont
leur place dans un dépôt de code que tout le monde clone.
⮕ **Question pour Grégoire, la seule qui compte ici** : ces captures servent-elles encore, ou
sont-elles la trace d'un moment ?

### 2 · `plans de travail/` : 62 fichiers sur 121 ne sont cités nulle part

Mesure, à rejouer :

```bash
for f in "plans de travail"/*.md; do b=$(basename "$f")
  grep -rqF "$b" CLAUDE.md .claude/ BACKLOG.md OU-EN-EST-ON.md PROTOCOLE.md OBJECTIF-COHORTE-1.md \
  || echo "$b"; done
```

▣ **59 cités · 62 jamais cités.** Aucun fichier des gouvernants ne les mentionne.

⚠⚠ **« Jamais cité » ne veut PAS dire « inutile ».** Un cadrage lu une fois pendant un chantier a
fait son travail sans jamais être cité. **Ce compte mesure la référence, pas la valeur.** ⛔ **Ne
pas en faire une liste de suppression.**

▣ **La répartition par âge dit autre chose, et c'est plus parlant** : 4 en avril, 8 en mai,
**39 en juin**, 2 en juillet, **79 en août**, 9 en septembre. ⮕ Le dossier n'est pas encombré
d'archives : **il est encombré de l'été en cours.**

### 3 · La racine porte 31 fichiers, dont quatre énormes

`SESSION.md` (1,3 Mo) et `BACKLOG.md` (964 Ko) sont **actifs et gouvernants** — ils ne bougent
pas. ⚠ Mais leur taille a déjà un coût mesuré : la mémoire de Cowork porte la consigne *« greps
ciblés uniquement »* sur ces trois fichiers, parce qu'ils ne se lisent pas d'un bloc.
⮕ **`BACKLOG-ARCHIVE.md` existe déjà** : le patron de dégonflement est donc établi, et il a
servi. **La question n'est pas de ranger, c'est de savoir si `SESSION.md` mérite le sien.**

### 4 · Cinq `.DS_Store` sont suivis

⮕ Bruit pur, aucune valeur, aucun risque à retirer. **Le seul cas franc de tout ce plan.**

---

## Ce que je propose — et l'ordre compte plus que le contenu

⮕ **Recommandation générale : ne rien SUPPRIMER, déplacer le moins possible, et commencer par
ce qui ne se discute pas.**

**Étape A — les `.DS_Store`** *(cinq minutes, aucune décision)*
Les retirer du suivi et les ajouter à `.gitignore` s'ils n'y sont pas. Aucun contenu perdu.

**Étape B — décider du sort des 92 Mo** *(une question à Grégoire, zéro travail avant)*
Les 306 captures et `.txt` de `Retours des testeurs/`. Trois issues :
· ils restent — le dépôt pèse, et c'est assumé ;
· ils sont archivés hors du dépôt (un dossier local, une sauvegarde) — le dépôt s'allège de 90 %,
  et **le lien vers eux se perd** ;
· ils sont triés — ceux qui ont produit une fiche restent, les autres sortent. ⚠ **Le tri coûte
  cher** : il faut ouvrir 306 fichiers.
⮕ **Ma recommandation : la deuxième**, avec un fichier `README` laissé sur place qui dit où ils
sont allés et à quelle date. **Un déplacement muet est une perte différée.**

**Étape C — `plans de travail/`** *(à faire APRÈS B, et sans hâte)*
⛔ **Ne supprimer aucun.** ⮕ Proposer un sous-dossier daté — `plans de travail/2026-T1/`,
`/2026-T2/` — et n'y descendre que ce qui a **plus de trois mois** et n'est **pas cité**. Les
deux critères ensemble, jamais un seul.
⚠ **Et vérifier que rien ne casse** : un `grep` des chemins déplacés dans tout le dépôt, y compris
les skills. **Un lien mort dans un skill est pire qu'un dossier encombré.**

**Étape D — `SESSION.md`** *(la plus délicate, à ne pas improviser)*
1,3 Mo. Le patron d'archive existe (`BACKLOG-ARCHIVE.md`). ⚠ **Mais `SESSION.md` est lu par des
skills et des sessions** : le dégonfler change ce qu'elles trouvent. ⮕ **Mesurer d'abord QUI le
lit**, et ce qu'il y cherche. **Aucune coupe avant cette mesure.**

---

## Ce que ce plan ne dit pas

⛔ **Aucun fichier nommé pour la suppression.** Ce plan n'en propose aucune.
⛔ **Aucune estimation d'effort mesurée.**
⚠ **Le poids d'un dépôt n'empêche aucun des huit gestes.** ⮕ C'est du confort, et ça passe
**après** la note qui monte en silence et les suppressions qui disent vrai. Grégoire a décidé
aujourd'hui de finir ce qui est commencé : **ce plan attend son tour.**
▣ **Une seule étape mérite d'être faite tout de suite** : les cinq `.DS_Store`. Elle ne coûte
rien et ne se discute pas.
