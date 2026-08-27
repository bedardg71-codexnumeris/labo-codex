# CADRAGE D'AUDIT — le travail du 26 août 2026

> **Pour l'auditeur.** Ce document te dit quoi vérifier, pas quoi conclure.
> Il a été rédigé par l'une des trois sessions dont tu audites le travail —
> lis le §0 avant tout le reste, il t'explique pourquoi tu ne dois pas me faire
> confiance sur le volet 1.
>
> Commanditaire : Grégoire Bédard. Rédigé le 26 août 2026 au soir, **corrigé
> le même soir** (§7).
>
> ⚠⚠ **NE TE FIE PAS AUX CHIFFRES DE PÉRIMÈTRE ÉCRITS ICI — CALCULE-LES.**
> Entre la première rédaction de ce document et sa correction, deux heures plus
> tard, le périmètre est passé de 11 à 22 commits et de 5 200 à 7 800 lignes.
> Deux sessions travaillaient encore. La seule définition fiable du périmètre
> est la commande, pas le nombre :
>
> ```bash
> git log --oneline 3e8faabe..HEAD        # borne basse = fin de session 17h29
> git diff --stat 3e8faabe..HEAD
> ```
>
> **Tout le travail audité est du mercredi 26 août 2026.** Aucun commit du 27,
> malgré le nom de ce fichier — qui désigne la date prévue de l'audit, pas
> celle du travail. Une session a daté ses commits du 27 en recopiant une date
> annoncée au lieu de lire l'horloge ; ne cherche pas les commits qu'elle
> semble annoncer.

---

## 0. AVERTISSEMENT — CONFLIT D'INTÉRÊT DU RÉDACTEUR

Trois sessions Claude ont travaillé dans ce dépôt en parallèle le 26 août. **Je suis l'une d'elles.**

- Le correctif **#541** est de moi.
- Le **plan #542** est de moi, y compris ses erreurs.
- Le volet 2 (#540) ne me concerne pas : je ne l'ai ni écrit ni relu.

Je ne peux donc pas cadrer neutrement l'audit du volet 1. Ce que j'ai fait pour limiter le biais :

1. **Le §5 liste les endroits où mon jugement est déjà démontré faux**, avec la preuve. Commence par là.
2. Je n'ai formulé **aucune conclusion** sur la qualité du travail — uniquement des faits vérifiables et des commandes.
3. Là où j'aurais tendance à défendre un choix, j'ai écrit la question sous une forme qui appelle sa réfutation.

**Ce que je ne saurai pas faire : voir ce que je n'ai pas vu.** Si une zone du volet 1 te paraît sous-spécifiée dans ce document, c'est un signal — pas une permission de la sauter.

---

## 1. CE QUI EST DEMANDÉ, ET CE QUI NE L'EST PAS

### Dans le périmètre

**A — Vérification adverse.** Les correctifs font-ils ce qu'ils prétendent ? Les sentinelles peuvent-elles réellement échouer ? Les affirmations chiffrées tiennent-elles au grep ?

**C — Intégrité des données.** Quatre scripts destinés à la console de Grégoire ont été écrits. Ils touchent des données réelles et irréversibles. Sont-ils sûrs ?

### Hors périmètre — décision explicite de Grégoire

**B — La conception.** Ne juge pas si retirer la durée de période était la bonne décision, si SOLO doit vivre sur l'échelle, si le niveau « 0 » doit disparaître. **Ces choix ont été pris avec Grégoire, sur sa didactique et sa pratique d'enseignant.** Les faire arbitrer par un modèle reviendrait à lui retirer ce qui lui appartient.

⮕ Si une décision de conception te paraît **techniquement impossible à tenir**, dis-le comme un fait technique (« telle décision suppose X, or X est faux ») — jamais comme un avis pédagogique.

---

## 2. COMMENT VÉRIFIER

```bash
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6

# ⚠ Vitest se lance DEPUIS tests/, jamais de la racine
# (de la racine il balaie .claude/worktrees/ sans la config : 217 faux rouges)
cd tests && npx vitest run

# Le périmètre exact
git log --oneline 3e8faabe..HEAD
git diff --stat 3e8faabe..HEAD
```

⚠ **Le dépôt est vivant pendant ton audit.** Deux sessions y travaillent encore. Les numéros de ligne de ce document sont ceux du 26 au soir : **re-localise chaque site par son nom de fonction**, jamais par sa ligne. Si `git log` montre des commits plus récents que `07f89d1a`, tu audites un arbre qui a bougé — signale-le plutôt que de l'ignorer.

⚠ **N'écris rien, ne commite rien, ne pousse rien.** Cet audit est en lecture seule. Aucun `--build-only`, aucun bump : Grégoire a l'application ouverte en `file://`.

---

## 3. VOLET A — VÉRIFICATION ADVERSE

### A.1 · Le test le plus important : les sentinelles mordent-elles ?

**C'est le cœur de l'audit.** Sept sentinelles ont été créées dans le périmètre. Chacune prétend verrouiller un correctif. Une sentinelle qui reste verte quand on retire le correctif ne prouve rien — et le projet en a déjà connu trois de cette espèce.

| Sentinelle | Verrouille | Rouges annoncés |
|---|---|---|
| `sentinelle-541-niveau-depuis-pourcentage` | #541 — l'unité du dépistage | 7 |
| `sentinelle-542-a4-defis-communs` | trois causes indépendantes | 7 / 7 / 7 |
| `sentinelle-542-a2-a3-depistage-non-muet` | l'échelle non résolue | 4 / 4 |
| `sentinelle-540-ponderation-requise` | #540 lot A | 5 |
| `sentinelle-540-lotB-semaines-reelles` | #540 lot B | 4 |
| `sentinelle-540-lotC-duree-derivee-horaire` | #540 lot C | 5 |
| `sentinelle-540-lotE1-seance-porte-ses-periodes` | #540 lot E1 | 4 |

**Procédure, pour chacune** : retire le correctif dans le code source (ou réintroduis l'ablation d'origine), relance la seule sentinelle concernée, note si elle rougit **et sur quelle assertion**, puis restaure et vérifie par `diff` que l'arbre est intact.

**Ce qu'il faut chercher, pas seulement le rouge** :
- une sentinelle qui rougit sur une assertion **différente** de celle qui porte le sens (elle teste autre chose que ce qu'elle annonce) ;
- une sentinelle qui rougit parce qu'elle lève une **exception** plutôt qu'une assertion (elle teste que le code s'exécute, pas qu'il est juste) ;
- une sentinelle dont l'attendu est **la valeur de repli** qu'on vient de retirer (elle passait au vert par coïncidence — ce cas s'est produit deux fois dans ce dépôt le 26 août).

### A.2 · Le motif récurrent de la journée : le vert qui ne prouve rien

**Quatre défauts distincts, tous de la même famille, ont été trouvés en 24 h.** Ils partagent une signature : *une comparaison qui ne lève aucune erreur et rend un verdict rassurant.*

| Défaut | Mécanisme |
|---|---|
| #541 | un pourcentage 0-100 comparé à des seuils 0-1 → tout classé « Étendu » |
| #542 A4, cause 1 | `score < undefined` → toujours faux → aucun défi détecté |
| #542 A4, cause 2 | mêmes deux unités, autre fichier |
| #540 lot E | minutes divisées par la durée d'enseignement, sans la pause → 4 périodes au lieu de 3 |

⮕ **Cherche la cinquième.** Ce sont les endroits où une valeur traverse une frontière d'unité, de type ou de nullité sans conversion explicite. Motifs utiles :

```bash
grep -rn "< *seuil\|> *seuil\|<= *obtenirSeuil\|< *obtenirSeuil" js/ --include="*.js"
grep -rn "|| 0\.\|?? 0\b" js/profil-etudiant-*.js js/interventions.js js/indices.js
```

Pour chaque site : **quelle est l'unité de gauche, quelle est l'unité de droite, et qui garantit qu'elles sont les mêmes ?**

### A.3 · Les affirmations chiffrées à re-dériver

Chaque message de commit affirme des nombres. Confronte-les au dépôt réel — pas au message.

| Commit | Affirme | À re-dériver |
|---|---|---|
| `422f9e0b` | 5 break-tests rouges · 3488/3488 · 171/171 | |
| `69ce1483` | 7 rouges · 3495/3495 · 330 fichiers | |
| `a7fe6c29` | 4 break-tests rouges · 3513/3513 | |
| `5e7f0ddb` | 5 break-tests rouges · 3534/3534 · 177/177 | |
| `2951f095` | 7/7/7 puis 4/4 rouges · 3574/3574 · 335 fichiers | |
| `2a6f9a06` | 4 break-tests rouges · 3574/3574 · 179/179 · **41 lectures** retirées | le « 41 » est vérifiable au grep |
| `07f89d1a` | 279/280 · 283/338 · 95/338 · 11/11 | **ces ratios portent sur des données réelles — voir §4** |

⚠ **Deux commits annoncent `3574/3574`** (`2951f095` et `2a6f9a06`) alors qu'ils ajoutent des tests chacun. Vérifie si c'est cohérent ou si l'un des deux comptes est repris d'une mesure antérieure.

⚠ Un rouge anti-cache (`?v=` non mis à jour) a échappé à **trois sessions différentes en deux jours**. Vérifie que `sentinelle-anticache-fichiers-modifies` est verte à l'instant où tu audites.

### A.4 · Les zones où deux chantiers se croisent

`js/interventions.js` et `js/profil-etudiant-sections-affichage.js` ont été modifiés par **les deux** chantiers, par deux sessions qui ne se voyaient pas.

- volet 1 : `analyserSousGroupe`, `obtenirPerformancesSRPNF`, la carte RàI
- volet 2 : les lectures de périodes et de durée

**Question à trancher** : une modification d'un chantier a-t-elle altéré une hypothèse de l'autre ? Lis le diff complet de ces deux fichiers, pas seulement les hunks de chaque commit isolément.

### A.5 · Le point aveugle structurel

`js/indices.js`, `js/etudiants.js` et `js/saisie-presences.js` ont reçu de petites modifications (2 à 17 lignes) qui n'appartiennent au lot principal d'aucun commit. Vérifie que chacune est **intentionnelle et couverte**, plutôt qu'un effet de bord d'un rechercher-remplacer.

---

## 4. VOLET C — INTÉGRITÉ DES DONNÉES

**C'est la partie irréversible.** Quatre scripts ont été écrits pour être collés dans la console de l'application de Grégoire, sur ses données réelles d'enseignement.

| Script | Point d'entrée | Prétend |
|---|---|---|
| `diagnostic-542-echelles-et-niveaux.js` | `await diag542()` | mesurer les échelles et niveaux |
| `diagnostic-542bis-traquer-echelle.js` | `await traquer542()` | traquer une échelle disparue |
| `diagnostic-542ter-voisinage-echelles.js` | `await inventaire542()` | inventorier le voisinage |
| `oracle-542-identifier-echelle-orpheline.js` | `await oracle542()` | **identifier** l'échelle de 339 évaluations orphelines |

### C.1 · Sont-ils réellement en lecture seule ?

Tous se présentent comme des sondes. **Vérifie-le, ne le crois pas.**

⚠ **Piège de méthode, que j'ai rencontré en préparant ce document** : `grep '\.set('` produit des **faux positifs** — les scripts utilisent abondamment `Map.set()`, qui n'écrit rien en base. Le motif juste :

```bash
grep -nE "db\.(set|setSync|delete|clear)|localStorage\.(setItem|removeItem)|indexedDB" scripts/*542*.js
```

Ma mesure : **aucune écriture en base** dans les quatre. À confirmer indépendamment.

### C.2 · L'oracle est-il honnête sur son incertitude ?

C'est la question centrale du volet C. L'oracle doit **identifier** à quelle échelle appartiennent 339 évaluations dont l'identifiant ne correspond à rien. Un oracle qui se trompe conduirait à réparer des données réelles avec la mauvaise échelle — donc à falsifier silencieusement des résultats d'élèves.

À vérifier :

1. **Sur quel témoin repose-t-il ?** Un groupe d'évaluations dont l'échelle est connue et vérifiable, ou un échantillon de commodité ?
2. **Que fait-il quand il n'est pas sûr ?** Il annonce se taire sous 90 % de reproduction. Trouve ce seuil dans le code, vérifie qu'il est appliqué **et** qu'il n'est pas contourné par une branche.
3. **Le seuil de 90 % est-il justifié, ou inventé ?** Le commit `07f89d1a` s'intitule « mes seuils inventés sont retirés » — donc une version antérieure en portait. Vérifie qu'il n'en reste pas.
4. **Les ratios annoncés** (`279/280`, `283/338`, `95/338`) sont-ils reproductibles, ou dépendent-ils de données que tu n'as pas ? Si tu ne peux pas les reproduire, **dis-le** plutôt que de les accepter.

### C.3 · Le constat qui a déclenché tout ceci

La sonde a mesuré : **383 évaluations sur 670 — 57 % des niveaux — désignent une échelle introuvable**, dont 339 sous un seul identifiant en H2026.

Deux choses à vérifier :

- **Le chiffre lui-même.** Il vient d'une exécution console chez Grégoire, non reproductible dans le dépôt. Vérifie au moins que la **méthode de comptage** du script est correcte : que compte-t-il exactement — des évaluations, des niveaux, des critères ? Un dénominateur de 670 est-il le bon ?
- **La conséquence annoncée.** Si l'échelle n'est pas résolue, la conversion rend `null` et l'évaluation est écartée des moyennes, de l'IPB et du dépistage. **Re-dérive cette chaîne dans le code** : est-il vrai qu'une échelle introuvable produit un silence plutôt qu'une valeur fausse ? Les deux sont graves, mais pas de la même façon.

### C.4 · ⚠ LA RÉPARATION A ÉTÉ EXÉCUTÉE — c'est le point le plus important du volet C

**Ce paragraphe corrige la première version de ce document, qui disait « aucune réparation n'a été engagée ». C'est faux depuis `71a3ffea`.**

`scripts/reparation-542-echelle-orpheline.js` a été écrit, passé en dry-run (`04acd7e9`), corrigé (`e3d5af34` — « la réparation disait l'inverse de son effet, et propageait `parDefaut` »), puis **exécuté sur les données réelles de Grégoire**. Mesure annoncée avant/après :

```
niveaux convertibles ......  1277  ->  2807   (+1530)
echelleId introuvable .....   383  ->    44
```

Tu n'audites donc plus un risque à venir, mais **un acte déjà posé sur des données d'enseignement réelles**. Quatre questions, par ordre de gravité :

**1. La concordance dry-run / résultat prouve-t-elle quelque chose ?** Le commit affirme « le +1530 est EXACTEMENT ce que le dry-run avait prédit ». **Vérifie si la prédiction et la mesure sont produites par le même code.** Si oui, leur concordance est une tautologie : elle prouve que le script est déterministe, pas qu'il a raison. C'est la forme la plus élégante du « vert qui ne prouve rien », et elle rassure d'autant mieux qu'elle est chiffrée.

**2. « Aucune note touchée, aucune évaluation modifiée : une échelle ajoutée ».** Re-dérive-le du code de la réparation, pas du message. Que fait-elle exactement — crée-t-elle une échelle, réécrit-elle des `echelleId`, ou les deux ? Une réparation qui « ajoute une échelle » sous un identifiant attendu change le résultat de toutes les évaluations qui le désignent : c'est correct si l'identification est juste, et silencieusement faux sinon.

**3. L'identification était-elle sûre ?** La réparation repose sur l'oracle (§C.2). Si l'oracle s'est trompé d'échelle, 1 530 niveaux d'élèves viennent d'être réinterprétés avec la mauvaise grille de conversion — sans erreur, sans message, avec des notes qui restent plausibles. **Remonte la chaîne oracle → réparation et vérifie que le verdict de l'oracle est bien ce que la réparation applique.**

**4. La réparation peut-elle se défaire ?** Le commit l'admet : « LA CAUSE DU DÉSAPPARIEMENT RESTE INCONNUE. L'échelle avait déjà été recréée le 5 août ; quelque chose l'a re-orphelinée depuis. » Une réparation dont la cause est inconnue est une réparation à durée indéterminée. **Cherche le mécanisme qui ré-orpheline** — c'est la question ouverte la plus utile de tout cet audit.

⮕ **Reste ouvert et inscrit** : 44 évaluations `ECHELLE_DEMO` (176 niveaux) en h2026. Vérifie que ces élèves affichent bien « Dépistage incomplet » plutôt qu'un chiffre.

### C.5 · Et si tu trouves autre chose qui écrit

Si tu trouves, **hors des scripts de réparation nommés ci-dessus**, du code du périmètre qui modifie des données d'évaluation, de grille ou d'échelle en dehors des chemins normaux de l'application : signalement de priorité maximale.

---

## 5. LES ENDROITS OÙ MON JUGEMENT EST DÉJÀ DÉMONTRÉ FAUX

Commence l'audit du volet 1 par ici. Ce ne sont pas des hypothèses : ce sont des erreurs constatées **dans le plan que j'ai écrit**, trouvées par la session qui l'a exécuté.

**5.1 — J'ai décrit un défaut à trois causes comme « une ligne à corriger ».** Le plan prescrivait de corriger `seuils.acceptable`. Il y avait deux autres causes indépendantes au même endroit, chacune suffisante pour produire le même silence. Corriger la seule que j'avais vue aurait laissé le tableau de bord muet — et le lot aurait été déclaré clos.

⮕ **Question pour toi** : les autres défauts que mon plan décrit comme simples le sont-ils ? Regarde en particulier `A5` (`c.valeur > 0`) et `B1/B2` (le repli de `portfolio.js` et sa clé jamais écrite), que le plan classe comme isolés.

**5.2 — J'ai classé une cause au mauvais lot.** Le constat « `evaluation.criteres` lu comme un dictionnaire » était rangé au lot 4, comme une incohérence cosmétique. Il **co-causait** le défaut du lot 1. J'ai classé par famille de symptôme au lieu de classer par cause.

⮕ **Question pour toi** : les autres constats classés « incohérences internes » au lot 4 du plan sont-ils vraiment sans effet fonctionnel ?

**5.3 — J'ai prescrit le mauvais seuil.** Le plan disait d'employer `interpretation.acceptable`. Le bon est `obtenirSeuil('defiSpecifique')` — celui qu'emploient les trois autres sites qui identifient un défi, et le seul exposé dans les préférences. Les deux valent 0,70 aujourd'hui, **donc l'erreur était invisible** et le serait restée jusqu'au jour où Grégoire règle son seuil.

⮕ **Question pour toi** : d'autres constantes du périmètre coïncident-elles aujourd'hui tout en ayant des sources différentes ? C'est la forme de défaut la plus difficile à voir et la plus durable.

**5.4 — J'ai déclaré non appliquée une règle qui l'était.** Le plan affirme (C4) que l'astérisque « Champ obligatoire » sur *Valeur ponctuelle* n'est pas appliqué, en s'appuyant sur le titre d'un test de #524 : « le refus ne vaut QUE pour le code et le nom ». **C'était vrai pour #524 et périmé par #526**, livré le matin même, qui étend `refusChampNiveau` à `min`, `max` et `valeurCalcul` (`js/echelles.js:3435`). J'ai lu un test au lieu de lire le code courant. Appliquer mon plan aurait retiré un garde-fou en croyant corriger un défaut d'affichage.

⮕ **Question pour toi** : combien d'autres affirmations de ce périmètre reposent sur le **titre** ou l'**intitulé** d'un test plutôt que sur le code qu'il exécute ? C'est une source d'erreur distincte du test tautologique, et elle survit mieux.

⮕ **Et une contradiction réelle en découle**, versée au backlog sous #546 : mon §2-D4 pose que « jugement suspendu = valeurCalcul vide, mécanisme déjà en place ». Il l'est dans le **calcul** ; #526 en interdit l'entrée par l'**interface**. Deux exigences de Grégoire du même jour qui se contredisent. **Ne tranche pas** — c'est de la conception, donc hors périmètre. Vérifie seulement que la contradiction est réelle et correctement décrite.

**5.5 — Mon correctif #541 n'a qu'un seul appelant vivant.** J'ai affirmé que le second (`genererTableauObjectifs`) est du code mort. Vérifie-le. Si je me trompe, le correctif a une portée que je n'ai pas mesurée.

---

## 6. CE QU'IL FAUT RENDRE

Un rapport où **chaque affirmation est adossée à un artefact reproductible** : une sortie de test, une ligne de grep, un numéro de ligne. Jamais une opinion.

Structure attendue :

1. **Ce qui est confirmé** — les affirmations qui tiennent, avec la preuve.
2. **Ce qui est infirmé** — les affirmations fausses, avec la preuve. *C'est la section la plus utile ; ne la laisse pas vide par politesse.*
3. **Les sentinelles qui ne mordent pas** — s'il y en a, nommées, avec le résultat du break-test.
4. **Les risques sur les données** — volet C, classés par réversibilité.
5. **Ce que tu n'as pas pu vérifier**, et pourquoi. *Une zone non couverte déclarée vaut mieux qu'une couverture supposée.*

⮕ **Ne conclus jamais « la suite est verte donc le travail est bon ».** Dans ce dépôt, quatre défauts réels ont coexisté avec une suite entièrement verte, parce que rien n'appelait les fonctions fautives. Un test d'existence n'est pas un test de comportement.

⮕ **Si tu ne trouves rien sur un volet entier, dis-le franchement.** C'est un résultat possible et acceptable. Un audit qui invente des réserves pour paraître rigoureux est pire qu'un audit vide.

---

## 7. CORRECTIONS APPORTÉES À CE DOCUMENT

Ce document a été corrigé le soir même de sa rédaction, après retour de la session qui exécute #542. Les quatre corrections sont elles-mêmes des données d'audit — elles montrent à quelle vitesse un cadrage se périme dans un dépôt à trois sessions.

| # | Ce que disait la v1 | Correction |
|---|---|---|
| 1 | « le travail des 26-27 août » | **Tout est du 26.** Aucun commit du 27 |
| 2 | « 11 commits, 34 fichiers, ~5 200 lignes » | **22 commits, 51 fichiers, ~7 800 lignes** deux heures plus tard — d'où la consigne de calculer le périmètre plutôt que de le lire |
| 3 | §5 comptait trois erreurs du rédacteur | **Quatre** : C4 s'ajoute (voir §5.4) |
| 4 | « aucune réparation n'a été engagée » | **La réparation a été exécutée** sur les données réelles (voir §C.4) |

⮕ La correction 4 est la plus lourde : elle fait passer le volet C d'un audit de prévention à un audit de dommage possible. Si tu ne devais traiter qu'une section de ce document, ce serait §C.4.
