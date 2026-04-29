# Audit de cohérence du Labo — pistes pour la prochaine itération

**Date** : 27 avril 2026
**Contexte** : session de débogage des indices ACP qui a révélé des questions plus larges sur la cohérence statistique et conceptuelle du Labo.
**Statut** : brief de lancement pour discussion avec Cowork. Ce document n'est pas un plan d'implémentation — c'est une cartographie des enjeux pour ouvrir la réflexion.

---

## 1. Le projet en une phrase

Labo Codex éclaire les interventions de l'enseignant — les préparer, les ajuster, en mesurer l'impact — pour que les décisions reposent sur des données et non sur des impressions. Les indices A, C, P, le bilan réflexif, les patterns RàI et les interventions sont autant de capteurs de l'écosystème-classe que le Labo doit savoir composer en récit cohérent.

---

## 2. Constat post-session du 27 avril 2026

### 2.1 Ce qui a été corrigé aujourd'hui

- **Divergence des moyennes ACP** entre l'Aperçu (86 / 83 / 67) et la Liste (76 / 74 / 63) sur le même groupe : l'Aperçu filtrait les étudiants `inactif | abandon | décrochage`, la Liste non. Règle métier (`main.js:60-62`) violée.
- **Corrélations r** également calculées sur tous les étudiants côté Liste, gonflées par le cluster faible-A faible-P des décrocheurs. Aligné sur la même population que les moyennes (actifs uniquement).
- **Tooltips et notice** : chaque cellule `moy=` et `r=` documente maintenant son dénominateur ; la notice au-dessus du tableau introduit Pearson, ses seuils d'intensité, et six lectures possibles d'une corrélation faible — dont le « paradoxe du succès ».

### 2.2 Ce qui était déjà cohérent et l'est resté

- Les **snapshots hebdomadaires** filtraient déjà les exclus au moment de leur capture (`snapshots.js:476-479`). L'histoire est donc préservée fidèlement : un étudiant qui abandonne en sem. 11 reste présent dans les snapshots des sem. 1-10 où il était encore actif.
- Le module **Labo** (Dynamique des corrélations) consomme ces snapshots et hérite donc du bon filtrage par construction.
- La règle « exclus des moyennes mais affichés dans la liste » est doctrinalement saine et confirmée par la réflexion d'aujourd'hui.

### 2.3 Limites résiduelles connues

- **Reconstruction rétroactive** des snapshots (`reconstruireSnapshotsHistoriques`) applique le statut courant — donc réécrit l'histoire si elle est lancée après un changement de statut. À utiliser avec précaution.
- Le **statut historique** n'est pas stocké dans le snapshot lui-même (seulement DA + valeurs A/C/P). On ne peut pas, après coup, distinguer « actifs à l'époque » vs « actifs maintenant ». Limite acceptable aujourd'hui, à reconsidérer si un module de comparaison fine entre cohortes est demandé.

---

## 3. Le cadre conceptuel qui guide la suite

### 3.1 Ce que A et C mesurent vraiment

Ce sont des **proxies d'engagement** :

- **A** = exposition à l'enseignement (explications, modélisation, accompagnement, pratique guidée)
- **C** = pratique active (les travaux qui font apprendre par essai-erreur-correction)

P est le résultat. Donc r(A↔P) et r(C↔P) mesurent indirectement **l'efficacité de l'enseignement** à transformer engagement en performance. Ce cadre est rigoureux et défendable.

### 3.2 Ce que P ne mesure pas

P mesure la **qualité cognitive du résultat académique** (taxonomie SOLO). Il ne mesure pas :

- le sentiment d'efficacité de l'étudiant
- son rapport au stress et au plaisir d'apprendre
- sa métacognition et sa capacité d'autorégulation
- son sentiment de transfert à d'autres situations
- le climat de classe perçu

Or ces dimensions **sont** des résultats d'apprentissage. Un étudiant atteignant le niveau « Étendu » dans un climat anxiogène emporte une trajectoire très différente d'un étudiant restant en « Maîtrise » mais avec une confiance durable. Le bilan réflexif (questionnaire de fin de trimestre, déjà implémenté dans Labo Codex) capte précisément ces dimensions — mais il n'est pas encore intégré au Labo.

### 3.3 Le « paradoxe du succès » comme grille de lecture

Une stratégie pédagogique qui ramène dans le rang les élèves à risque (reprises, acceptation des travaux en retard) **réduit la variance** de A et C. Pearson exigeant de la variance pour produire un r élevé, **r chute mécaniquement** quand l'intervention fonctionne. Une corrélation en baisse session-à-session peut donc être le signe que la stratégie de soutien a réussi à empêcher la formation d'un cluster d'élèves décrochés.

Conséquence : un Labo qui se contente d'afficher r sans contextualiser invite à la mauvaise lecture. La cohérence à viser passe par la **multiplication des angles** (variance, distribution, comparaison inter-sessions, dimensions subjectives) plutôt que par la chasse au seul r élevé.

---

## 4. Pistes de cohérence à explorer

### 4.1 Intégrer le bilan réflexif au Labo

Aujourd'hui, le bilan réflexif vit dans son propre module. Il devrait apparaître dans le Labo comme un **autre angle de la même question** : l'enseignement a-t-il fonctionné ?

Idées :
- Agrégats Likert par sous-section (Système d'évaluation, Sentiment d'efficacité, Climat, Métacognition…) affichés en barres horizontales avec moyenne + dispersion
- Évolution session-à-session quand plusieurs trimestres sont enregistrés
- Coups d'œil sur les commentaires ouverts (extraits anonymisés)

### 4.2 Triangulation quantitatif × qualitatif

Le croisement le plus instructif est probablement **l'écart entre P-mesurée et efficacité-perçue** :

- Étudiants à P haute mais sentiment d'efficacité bas → signal de stress, charge mentale, syndrome de l'imposteur
- Étudiants à P modérée mais sentiment d'efficacité fort → confiance bien calibrée, possible bonne base pour la suite
- Le delta moyen du groupe est une mesure du **climat pédagogique** que ni P ni les Likert seuls ne donnent

### 4.3 Comparer les sessions, pas seulement les semaines

Le Labo actuel est intra-session. Mais l'enseignant a besoin de voir **l'évolution de sa pratique** d'une session à l'autre :

- Distributions A et C par session (histogrammes superposés H24, H25, H26)
- σ(A) et σ(C) par session — l'indicateur direct du « paradoxe du succès »
- Taux de décrochage par session — la mesure la plus brute de l'effet d'une stratégie de soutien
- Tendances longitudinales du bilan réflexif sur plusieurs cohortes

### 4.4 Mesurer l'impact d'une intervention sur plusieurs dimensions

L'« Impact des jetons » dans Labo mesure aujourd'hui l'effet sur P. Une vue plus complète mesurerait l'effet sur :

- P (déjà fait)
- Taux de complétion suivant l'intervention
- Taux de présence post-intervention
- Sentiment d'efficacité ressenti dans le bilan de fin
- Probabilité d'abandon (variable binaire en fin de session)

### 4.5 Le Labo comme récit composé, pas comme tableau de bord juxtaposé

L'écueil est de produire un tableau de bord à 12 graphiques que personne ne lit. La cohérence à viser est narrative :

- Une **page d'ouverture** du Labo qui formule en deux phrases ce que cette session révèle (ex. « Cette session, votre groupe a vu sa moyenne P progresser de 4 points et son sentiment d'efficacité monter, malgré un r(A↔P) en baisse — pattern compatible avec une stratégie de soutien efficace »).
- Des sections qui développent chacune un angle (efficacité quantitative, vécu subjectif, dynamique d'intervention) avec un **point d'entrée unique** par section.
- Des liens explicites entre les sections (« le sentiment d'efficacité élevé contraste avec la P modérée — voir la sous-section *Climat de classe* du bilan réflexif »).

---

## 5. Questions ouvertes pour Cowork

Ces questions ne sont pas rhétoriques — elles méritent vraiment d'être tranchées avant tout chantier d'implémentation.

1. **Unité d'analyse du Labo** : la séance ? la semaine ? la session ? la cohorte ? Le module actuel oscille entre séance (axe X) et session (filtres). Une cohérence d'unité aiderait à structurer.
2. **Toggle « Inclure abandons et inactifs »** ou bien deux modules distincts (« Efficacité de l'enseignement » vs « Pattern de décrochage ») ? Le toggle cache la complexité ; les modules distincts l'affichent. Lequel sert mieux l'enseignant en action ?
3. **Statut historique dans le snapshot** : faut-il l'ajouter pour permettre des analyses fines de cohorte ? Coût en stockage négligeable, gain en analytique potentiellement important.
4. **Bilan réflexif et scientisme** : les Likert ne sont pas des données dures. Comment les exposer dans le Labo sans laisser croire qu'un score moyen de 4,2/5 sur « Sentiment d'efficacité » est aussi solide qu'un r=0,45 sur 23 étudiants ? Quelle convention visuelle pour signaler les niveaux d'incertitude ?
5. **Représentation de l'écart P-mesurée vs efficacité-perçue** : nuage de points ? barres divergentes ? indicateur agrégé unique ? Cette mesure est probablement la plus précieuse mais la plus difficile à représenter.
6. **Comparaison inter-sessions** : nécessite une couche de persistance qu'on n'a pas encore. À planifier en parallèle de l'évolution du module Réserve (qui archive les trimestres) ?
7. **Charge cognitive vs richesse** : l'enseignant en action n'a pas le temps de lire un tableau de bord à 30 indicateurs. Quelle est la « salle de pilotage minimale » du Labo qui dit l'essentiel en 30 secondes ?

---

## 6. Principes directeurs proposés

Pour cadrer la suite, six principes :

1. **Décisions sur données, pas impressions** — l'enseignant doit pouvoir pointer le chiffre qui justifie son geste pédagogique.
2. **Données contextualisées** — un r faible n'est pas un échec ; une moyenne de 65% n'est pas une catastrophe ; chaque chiffre vient avec une grille de lecture.
3. **Données multi-dimensionnelles** — la performance académique est un résultat d'apprentissage parmi d'autres ; le Labo doit refléter cette pluralité.
4. **Données préservées dans leur vérité historique** — pas de réécriture rétroactive ; les snapshots disent ce qui était vrai à l'époque.
5. **Cohérence inter-vues** — la même règle de calcul partout, des options d'affichage complémentaires plutôt que des calculs divergents.
6. **Récit avant graphique** — le Labo guide la lecture, il ne la délègue pas à l'enseignant. Chaque section a une question, une réponse, et un chemin vers le détail.

---

## 7. Prochaines étapes possibles

Sans engagement, par ordre de coût croissant :

- **Court terme (heures)** : ajouter une notice dans le Labo équivalente à celle de la Liste ; documenter les conventions de calcul dans `docs/architecture/`.
- **Moyen terme (jours)** : intégrer les agrégats du bilan réflexif au Labo en lecture seule ; ajouter les barres de distribution Likert à côté des courbes A↔P et C↔P.
- **Plus long (semaine+)** : bâtir la couche de comparaison inter-sessions ; concevoir la page d'ouverture narrative du Labo ; ajouter le statut historique aux snapshots.

À discuter avec Cowork pour prioriser et raffiner.
