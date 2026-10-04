# Consigne du jour – emprunter un trimestre (E2, #1023)

> Écrite par Cowork le 4 octobre 2026 à 19 h 06 (Toronto, mesurée par `date`). Remplace la consigne du 4 octobre à 17 h 19, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-04-e1-mise-en-ligne.md`.

## Où on en est

1.183.0 est en ligne (E1, #1022 close ; #1006 close), relu par Cowork à 19 h 04. Plan : `PLAN-2026-10-04-emprunter-et-rendre-un-trimestre.md` ; ce lot est **E2, emprunter**. Lis aussi les fiches #1023 et #1024, et le § 3 de `MESURE-2026-10-04-emprunter-un-trimestre.md` (ce que les trimestres partagent).

Ce lot **écrit dans les données de l'utilisateur** (il ramène un trimestre entier) : **relecture croisée** obligatoire (règle 2 de `PROTOCOLE.md`).

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, et à travailler sur une branche `claude/e2-emprunter-trimestre`. **Ne pousse pas le lot et ne fais pas de release** : tu t'arrêtes au point 6. Pousse `RELAIS.md` seul sur `main` en t'arrêtant (règle du 8 août).

## Les décisions de Cowork (techniques ; dis-moi si une mesure les dément)

1. **D'où** : depuis la liste des archives (Réglages › Données › Archives), sur une archive de trimestre **vérifiée dans ce navigateur**, comme « Faire revenir ». Une archive venue d'un autre appareil entre dans la liste par le chemin qui existe (« Ouvrir une archive… », `upsertEntreeManifeste`) puis se vérifie : mesure que ce chemin accepte une archive de trimestre, sinon dis ce qui manque.
2. **Refus d'abord, rien d'écrit** : si le trimestre est au registre `trimestres`, ou si une seule clé `<trimestre>_*` existe déjà, ou si une séance `seancesCompletes_gc_<id>` de l'archive existe déjà : **refus en entier**. (Ce que dit l'écran dans ce cas est à Grégoire : point 6.)
3. **Tout est recomparé au moment du geste** : `meta.json` à la vérification, chaque clé à son empreinte, chaque fichier à son empreinte. Une seule différence : refus en entier, rien d'écrit.
4. **Ce qui est écrit, dans cet ordre** : les fichiers des copies (par la pièce de « Faire revenir ») ; puis les clés `<trimestre>_*` et les séances, telles quelles ; **puis en dernier** l'entrée du trimestre au registre `trimestres` (depuis `pour_memoire`), **ajoutée** sans modifier aucune autre entrée, **marquée clos**. Le trimestre n'apparaît dans la bibliothèque qu'une fois tout écrit.
5. **Aucune autre clé globale n'est écrite** : ni `cours`, ni profil, ni registre longitudinal, ni bibliothèques. Mesure que le trimestre revenu se lit quand même (le cours qu'il cite existe-t-il ? s'il n'existe plus, dis ce que l'écran montre).
6. **En cas d'échec en cours de route** : retire **seulement ce que ce geste a écrit**, dans l'ordre inverse, et dis-le ; rien d'autre n'est touché.
7. **Les vignettes** (`thumbnail_<id>`) ne sont pas dans l'archive : mesure qu'elles se régénèrent à l'affichage.
8. **Clos, et ensuite** : le trimestre revient clos. Mesure ce qui arrive quand l'usager l'**active** pour le consulter (la mesure du 4 dit que le démarrage réécrit les indices du trimestre actif même clos, et que le bandeau offre une permission d'écriture) : liste les clés que cette consultation change, sans rien corriger. C'est ce dont E3 aura besoin pour savoir si le livre rendu est celui qu'on a emprunté.
9. **Mémoire** : une copie à la fois, comme « Faire revenir » ; mesure sur une archive de taille réelle (~1,1 Go).

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne et son archive sur `main`, pousse `main`.
2. **Mesure avant de coder** : le point 1 (une archive de trimestre entre-t-elle dans la liste sur un navigateur neuf ?) ; dis si une mesure dément une décision.
3. **Code** sur la branche, mots provisoires.
4. **Tests** : un banc sur un espace qui porte un trimestre en cours (avec un doubleur) et des réglages : archiver un trimestre clos fictif (E1), le **supprimer**, faire **évoluer** l'espace (une élève ajoutée ailleurs, le profil changé), puis emprunter. Témoins : le trimestre revient entier et clos ; **rien d'autre n'a changé** (toutes les clés hors du trimestre comparées avant et après) ; les cas de refus du point 2 et du point 3 n'écrivent rien ; un échec provoqué au milieu ne laisse que ce qu'il y avait avant. Mutations rouges : une clé globale réécrite ; le registre écrit avant les clés ; une empreinte non recomparée. Largeur iPad. Vitest complet.
5. **La mémoire et le point 8**, mesurés.
6. **Arrête-toi et rends** : le commit sur la branche ; une `DEMANDE-RELECTURE-2026-10-04-e2-emprunter-trimestre.md` ; et, pour Grégoire, **les mots exacts** (bouton, fenêtre, bilan, refus), avec **le refus « déjà là »** et ta recommandation. Pas de verdict complet, pas de push du lot, pas de release.

## Ce que tu rends

À Grégoire, deux lignes : ce que fait « emprunter », et ce qu'il ne touche jamais. Les mots dans un bloc à part, avec le cas « déjà là ». Ce que tu as supposé, en une ligne.
