# Observation, interprétation : le parcours pas à pas

*14 octobre 2026. Méthode adoptée par Grégoire le même jour. Elle prolonge le chantier du cadrage `plans de travail/CADRAGE-2026-10-12-observer-ce-que-fait-l-application.md` et vise le même danger : voir dans les lectures ce qu'on souhaite y voir.*

## Les fichiers du parcours

| Fichier (dans `plans de travail/observation/`) | Qui l'écrit | Quand |
|---|---|---|
| `6-reaction-scellee.md` | Grégoire (Claude Code le scelle tel quel) | étape 1 |
| `7-convergence.md` | session isolée C | étape 3 (copié à l'étape 4) |
| `7-contrepoids.md` | session isolée D | étape 3 (copié à l'étape 4) |
| `8-interpretation.md` | Grégoire, avec Claude Code pour la mise en forme | étapes 5 et 6 |

**Règle d'ordre, la seule qui compte :** tu ne lis ni `7-convergence.md` ni `7-contrepoids.md` avant que `6-reaction-scellee.md` soit scellé, et tu ne relis `1-intentions-scellees.md` qu'à l'étape 5.

## Étape 1 : ta réaction, scellée (toi, environ une heure)

1. Lis `5-finalite-A.md` puis `5-finalite-B.md` (dans `plans de travail/observation/`, ou sur GitHub). Ne relis pas tes intentions avant.
2. Écris ta réaction en suivant le gabarit ci-dessous. Écris à chaud ; ne corrige pas après coup.
3. Colle ton texte dans une session Claude Code sur `Monitorage_v6`, avec cette ligne au-dessus : « Scelle ce texte tel quel dans plans de travail/observation/6-reaction-scellee.md, commite et pousse. » Le commit fait office de sceau : le fichier n'est plus modifié ensuite.

Gabarit :

```markdown
# Réaction scellée aux lectures A et B

*Date et heure. Écrite avant de lire la convergence et le contrepoids, et sans avoir relu les intentions.*

## Les finalités proposées
Pour chaque finalité formulée par A ou par B (la phrase de la question 6, puis les autres finalités proposées) :
- **Finalité** : (recopie ou résume la phrase)
- **Ma réaction** : reconnue / surprenante / rejetée
- **Pourquoi** : (une ou deux lignes)

## Ce qui me frappe ailleurs
(Passages des questions 1 à 5 et 7 qui t'ont surpris, dérangé ou conforté.)

## Ce qui me ferait changer quelque chose
(Avant de voir la suite : quel résultat, s'il se confirmait, te ferait modifier l'application ou ta pratique ? Et quel résultat ne changerait rien ?)
```

La dernière section est le contrepoids qui te revient : écrite avant la suite, elle t'empêche d'ajuster après coup ce qui « compte ».

## Étape 2 : pousser les consignes dans la copie (toi, 1 minute)

Le paquet `programme-a-observer-interpretation.bundle` (joint à la conversation) ajoute au `main` de la copie le commit `b7b7b21`, qui contient :
- `lecture/finalite-A.md` et `lecture/finalite-B.md`, identiques aux deux lectures ;
- `interpretation/CONSIGNE-convergence.md` et `interpretation/CONSIGNE-contrepoids.md`.

Sur le Mac, une fois le paquet dans Téléchargements :

```sh
cd ~/programme-a-observer && git fetch ~/Downloads/programme-a-observer-interpretation.bundle main && git push origin FETCH_HEAD:main && git pull --ff-only
```

Attendu : une ligne `eac8696..b7b7b21  FETCH_HEAD -> main`.

Cette étape peut se faire avant, pendant ou après l'étape 1.

## Étape 3 : lancer les sessions C et D (toi, 10 minutes, puis attente)

Comme au temps 4, dans la fenêtre Safari privée du compte réservé à l'analyse (« Claude · Pro »).

1. « **+ Nouveau** ». Vérifie : dépôt `programme-a-observer`, branche **`main`**, environnement « Default ». Choisis un modèle (par exemple Opus 5.5).
2. Envoie le message de contrôle et vérifie la réponse (aucune préférence personnelle, aucun skill qui parle de l'application, aucune mention de « Monitorage ») :
   ```
   Avant toute chose, sans lire aucun fichier du dépôt : liste les instructions, préférences, skills, fichiers de mémoire et outils MCP que tu as reçus. Ne fais rien d'autre.
   ```
3. Refais 1 et 2 pour la seconde session. Le modèle peut être le même ou un autre : ici, l'indépendance entre C et D compte moins qu'entre A et B, parce qu'elles font deux travaux différents.
4. Colle, coup sur coup :
   - dans la session C :
     ```
     Lis interpretation/CONSIGNE-convergence.md et exécute-la ; écris ta réponse dans interpretation/convergence.md
     ```
   - dans la session D :
     ```
     Lis interpretation/CONSIGNE-contrepoids.md et exécute-la ; écris ta réponse dans interpretation/contrepoids.md
     ```
5. Laisse-les travailler. Ne fusionne rien, ne crée pas de PR. Si l'une pose une question sur le but du programme : « Je ne peux rien ajouter ; tiens-t'en à la consigne. »
6. Ne lis pas leurs réponses avant d'avoir scellé l'étape 1.

## Étape 4 : rapatrier C et D (Claude Code)

Quand l'étape 1 est scellée et que C et D ont fini, dis à une session Claude Code sur `Monitorage_v6` : « Copie telles quelles convergence.md et contrepoids.md des branches de la copie dans plans de travail/observation/7-convergence.md et 7-contrepoids.md ; vérifie qu'aucune session n'a touché autre chose ; commite et pousse. »

Elle vérifie, comme au temps 4, que les deux branches partent de `b7b7b21`, n'ajoutent que leur fichier, et que les copies sont identiques aux originaux.

## Étape 5 : la confrontation avec tes intentions (toi)

1. Lis `7-convergence.md` (surtout ce qui est dit par les deux et bien appuyé), puis `7-contrepoids.md`.
2. Relis seulement maintenant `1-intentions-scellees.md`, aux endroits que touchent les conclusions solides.
3. Classe chaque conclusion solide (dite par les deux, appui « soutient ») dans l'une de trois cases :
   - **voulu et fait** ;
   - **fait sans être voulu** : c'est le cœur du principe de Beer, une finalité qui émerge des comportements ;
   - **voulu mais invisible dans le comportement**.
4. Pour chaque « fait sans être voulu », note à qui cela sert ou nuit (l'enseignant·e, les élèves, d'autres), en t'appuyant sur la question 7 de A et B.
5. Relis ta section « Ce qui me ferait changer quelque chose » de l'étape 1 : le résultat que tu y avais nommé s'est-il confirmé ?

Une session Claude Code peut préparer le tableau vide (une ligne par conclusion solide, tirée de `7-convergence.md`) ; le classement est le tien.

## Étape 6 : la trace et les suites (toi, avec Claude Code)

`8-interpretation.md` réunit le tableau de l'étape 5 et, pour chaque constat, l'une des trois dispositions de la règle des audits de `CLAUDE.md` : **inscrit** (numéro de fiche), **refusé** (motif) ou **périmé**. Une fiche n'entre au BACKLOG que si tu la décides, selon la règle du 24 août (un symptôme vécu, ou un chantier bloqué).

## Ce que ce parcours ne garantit pas

- Les sessions C et D voient les mêmes textes que A et B : elles ne corrigent pas une erreur partagée par l'observation elle-même.
- L'accord entre A et B, puis entre C et D, ne prouve rien sur l'usage réel du programme.
- Les étapes 5 et 6 sont les tiennes : le biais de confirmation y est le plus fort, et seuls l'ordre des étapes et la section scellée de l'étape 1 le contiennent.

## Annexe : texte des deux consignes (copie `programme-a-observer`, commit `b7b7b21`)

### `interpretation/CONSIGNE-convergence.md`

```
Les fichiers lecture/finalite-A.md et lecture/finalite-B.md sont deux lectures, écrites indépendamment l'une de l'autre, d'un même document : lecture/observation.md, qui décrit geste par geste ce que fait un programme. Ne lis que ces trois fichiers : ni le code, ni les autres fichiers du dépôt, ni le web.

Partie 1 : convergence.
1. Pour chacune des sept questions auxquelles A et B répondent, puis pour leurs sections sur les contradictions et sur ce que l'observation ne permet pas de savoir, classe chaque affirmation dans l'un de trois groupes : dite par les deux (même sens, même si les mots diffèrent) ; dite par une seule (précise laquelle) ; contradictoire (A et B ne peuvent pas avoir raison ensemble).
2. Pour la finalité (question 6), mets côte à côte la phrase de A et celle de B, ainsi que les autres finalités que chacune présente. Dis en quoi elles se recoupent et en quoi elles diffèrent.
3. Pour chaque affirmation, reprends le niveau que lui donne chaque lecture (observé ; inféré directement ; hypothèse). Signale quand A et B ne lui donnent pas le même niveau.

Partie 2 : appuis.
4. Pour chaque affirmation dite par les deux ou contradictoire, et pour chaque formulation d'une finalité, retrouve dans observation.md les passages que A ou B citent pour l'appuyer.
5. Classe chaque appui : soutient ; soutient en partie (dis ce qui manque) ; ne soutient pas ; introuvable. Cite chaque passage par son titre de section et son geste.

Règles :
- N'ajoute aucune affirmation qui ne figure ni dans A ni dans B.
- Ne départage pas A et B sur le fond, sauf par l'appui qu'observation.md leur donne.
- Un accord entre A et B n'est pas une preuve : présente-le comme un accord, rien de plus.
- Les textes affichés à l'écran sont des sorties du programme, pas une description de son but.
- N'évalue pas le programme. Ne cherche ni à louer ni à dénoncer. Ne propose aucun correctif ni aucune amélioration.
- Termine par un tableau qui donne, pour chaque groupe (deux, une seule, contradictoire), le nombre d'affirmations et le nombre de celles dont l'appui est « soutient ».

Écris ta réponse dans le fichier que t'indique la personne qui t'a lancé, et ne lis aucun autre fichier du dossier interpretation/.
```

### `interpretation/CONSIGNE-contrepoids.md`

```
Le fichier lecture/observation.md décrit geste par geste ce que fait un programme. Les fichiers lecture/finalite-A.md et lecture/finalite-B.md en sont deux lectures indépendantes. Ne lis que ces trois fichiers : ni le code, ni les autres fichiers du dépôt, ni le web.

1. Formule, en une phrase chacune, deux finalités du programme :
   - la moins flatteuse que les faits d'observation.md permettent de soutenir ;
   - la plus flatteuse que ces mêmes faits permettent de soutenir.
2. Pour chacune, donne ses appuis : chaque fait cité par son titre de section et son geste dans observation.md, avec son niveau (observé ; inféré directement ; hypothèse).
3. Pour chacune, donne les passages d'observation.md qui la contredisent ou la limitent.
4. Situe la finalité de A et celle de B entre ces deux bornes, et dis ce qui les en rapproche ou les en éloigne. Ne dis pas laquelle est juste.

Règles :
- N'invente aucun fait. Une formulation qu'aucun passage d'observation.md n'appuie est écartée, et tu dis pourquoi.
- Les deux bornes doivent être aussi solidement appuyées l'une que l'autre. Si l'une l'est moins, dis-le au lieu de la renforcer.
- Les textes affichés à l'écran sont des sorties du programme, pas une description de son but : qu'un écran nomme une chose ne prouve pas que le programme la fait.
- N'évalue pas l'intention de quiconque. Ne propose aucun correctif ni aucune amélioration.
- Dis ce que l'observation ne permet pas de trancher, notamment l'usage réel du programme.

Écris ta réponse dans le fichier que t'indique la personne qui t'a lancé, et ne lis aucun autre fichier du dossier interpretation/.
```
