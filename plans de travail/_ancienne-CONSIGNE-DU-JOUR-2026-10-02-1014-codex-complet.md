# Consigne du jour – le codex emporte aussi la corbeille et la Modélisation (#1014), et une correction de sécurité

> Écrite par Cowork le 2 octobre 2026 à 17 h 56 (Toronto, mesurée par `date`), sur `main` à `e1bb1df6`. Remplace la consigne de l'inventaire, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-02-1007-inventaire.md`. Commite d'abord, tels quels, les fichiers de Cowork qui traînent dans l'arbre, puis pousse les commits de documents de `main`.

## Pourquoi ce lot passe avant les décisions de #1007

Décision de Grégoire (« oui », 17 h 56), sur la recommandation de Cowork : proposer ou exiger un codex avant une suppression n'a de sens que si le codex contient ce qu'on supprime. Ton inventaire a montré (§ 5, #1014) qu'il n'emporte pas les fichiers de la corbeille (mesuré) ni ceux de la Modélisation (lu). Ce lot rend le codex complet ; les quatre familles de questions de l'inventaire passent ensuite à Grégoire, une à la fois, par Cowork.

## A. Le codex emporte tous les fichiers que l'application désigne (#1014)

**La règle** : tout fichier désigné par une des trois familles de listes (`fichiersTravaux`, `corbeilleFichiers`, `fichiersModelisation`, celles de `CLES_REFERENCANT_BLOBS`, `js/codex.js:2008`), dans tous les trimestres, part dans le codex et revient à son ouverture. Le codex devient la copie complète que Grégoire croit avoir.

1. **Remesure** avant d'ouvrir, par le geste, les deux cas : une copie à la corbeille, un fichier de Modélisation ; ce que le codex emporte, ce que l'ouverture rend sur un espace neuf. Dis si `fichiersModelisation` est namespacée ou globale.
2. **L'écriture** (`genererCodex`, l. 384 et suivantes) : les deux autres familles passent par le même chemin que les copies (`FichierSortant.assemblerZip`, pas de lecture en mémoire). **L'avertissement de 1.174.0 ne change pas** : il ne compte que les copies de travail ; un fichier manquant de la corbeille ou de la Modélisation ne le déclenche pas. Aucun mot neuf.
3. **L'ouverture** (`chargerCodex`) : ces fichiers reviennent comme les copies (même garde `validerMagicBytes`, même refus faute d'espace). Leur échec compte au bilan d'une ouverture incomplète comme celui d'une copie, sans mot neuf ; si les mots actuels (« copies ») mentent pour un fichier de Modélisation, relève-le sans y toucher.
4. **Les autres chemins qui assemblent ou relisent un codex** : l'export de sélection, l'import partiel (l. 2641 et autour), l'archive d'un groupe : dis pour chacun s'il doit suivre, et ne change que ceux qui fabriquent ou rouvrent un codex. Le reste s'inscrit (issue 2).
5. **La taille** : dis combien un codex grossit sur le pack démo, et ce qu'il faudrait pour le savoir chez Grégoire (en lecture seule, avec son accord, comme le 1er octobre à 17 h 03 : le nombre et la taille des fichiers de corbeille et de Modélisation dans son espace).
6. **Source et stock** : ce lot tarit la source. Le stock, c'est le codex actuel de Grégoire : il deviendra complet à sa prochaine mise à jour habituelle, rien à réparer. Dis-le dans la demande.

## B. La correction de sécurité (règle n° 1 de CLAUDE.md)

`js/rapport-bug.js`, la fenêtre des rapports de bug archivés (l. 158 et autour) : le prénom, la description et tout champ venu des données passent par `echapperHtml()`, y compris dans les attributs (`data-param`). Parcours toute la fonction, pas seulement la ligne 158. **Règle n° 5** : au moins un essai qui couvre la défense (un prénom `<img src=x onerror=…>` ne crée aucun élément). Ces données voyagent dans le codex : c'est une correction « maintenant » (issue 1).

## Les neuf autres constats de l'inventaire

Ne les inscris pas, ne les corrige pas : Cowork les passera à Grégoire avec les familles de décisions.

## La preuve

Un banc par le geste pour A (une copie à la corbeille et un fichier de Modélisation écrits dans le codex, rouverts sur un espace neuf, présents et lisibles ; un témoin : un codex sans eux, d'avant ce lot, s'ouvre comme avant ; l'avertissement ne bouge pas) ; l'essai de B ; des mutations rouges ; Vitest complet.

## Arrête-toi à la demande de relecture

`plans de travail/DEMANDE-RELECTURE-2026-10-02-1014-codex-complet.md`, avec une proposition de ligne pour les Nouvelles. Ni release, ni push du code : ce chemin écrit et rouvre les données de l'usager, relecture croisée (règle 2).

## Ce que tu rends

À Grégoire, trois lignes en gestes : ce que son codex emporte désormais ; de combien il grossit ; ce qui l'attend. Ce que tu as supposé, en une ligne.
