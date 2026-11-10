# Rapport — lot « Un niveau sans seuils, une note au-dessus de 100 » (vue étendue)

Décision de Cowork du 9 nov. 2026, 21 h 43. Branche `lot/niveau-sans-seuils`, partie de `lot/vue-simple` (`58c396bb`, après le relais de 21 h 42). Session cloud, Chromium seulement. Rien n'est fusionné.

> **État de ce fichier : LA MESURE seulement, poussée AVANT toute correction**, comme demandé. Le rapport des corrections viendra en tête.

---

## LA MESURE, par exécution (10 nov. 2026)

**Méthode.** Une application neuve, en vue simple : une classe de quatre étudiant·es fictifs, une pratique par standards, un niveau ajouté « X — Exemplaire », valeur 110, sans seuils ; deux productions. Notes obtenues : 110, 88, 53 ou 0 selon la passe, 75. Puis la vue étendue, écran par écran. Script : hors du dépôt. Ce qui n'a PAS pu être exécuté est dit comme tel.

### (a) Un niveau sans seuils

| Écran | Ce que j'avais lu dans le code | Ce que l'exécution montre |
|---|---|---|
| **Suivi › Groupe, la répartition par niveaux** | « Le niveau ajouté capte tous les étudiant·es » | **Faux pour « tous », et pire pour un cas.** Le niveau sans seuils est rangé en DEUXIÈME position (« Préstructurel : 0 • Exemplaire : 0 • Incomplet… »). Il ne capte pas ceux qu'un autre niveau reçoit ; **il capte ceux du niveau le plus bas : un·e étudiant·e à 0 est compté·e « Exemplaire : 1 », et « Préstructurel : 0 »**. Mesuré deux fois (notes 53 puis 0 pour la même étudiant·e) |
| **Le PDF d'une échelle** (aperçu et export) | « Imprime 0 % - 100 % » | **Confirmé** : la ligne dit « X · Exemplaire · — · 0 % - 100 % », à côté de « E · Étendu · 85 % - 100 % » |
| **Le graphique de progression, ses zones de niveaux** | « Tri et zones faussés » | **Confirmé hors navigateur** (la fonction est exécutée seule, sur la même échelle) : la zone du niveau ajouté a des bornes qui ne sont pas des nombres. Les cinq autres zones sont justes, parce que le niveau ajouté est le dernier ; je n'ai pas mesuré l'ordre quand il est ailleurs. **Non rendu à l'écran** : le graphique dit « Aucune donnée de progression disponible » tant qu'aucune capture hebdomadaire n'existe |
| **Le profil, la légende des barres par critère** | « Position qui n'est pas un nombre » | **Non exécuté** : cet écran demande des évaluations faites avec une grille. L'arithmétique est certaine (la moyenne de deux seuils absents), le rendu n'a pas été vu |

### (b) Une note au-dessus de 100

| Écran | Ce que l'exécution montre |
|---|---|
| **Suivi › Groupe, la répartition** | **Confirmé** : l'étudiant·e à 110 n'est rangé·e dans aucun niveau. La ligne additionne trois étudiant·es sur quatre. La barre, elle, dit bien « 110 % » |
| Le tableau, la Note finale, le CSV, le profil, la Liste, Suivi › Étudiant·es | 110 partout (mesuré à la troisième livraison de la vue simple) |
| **Le graphique de progression** | **Non exécuté** (même raison : pas de capture hebdomadaire). Lu : la courbe est plafonnée à 100 |

### (c) Le partage d'une échelle

Le contrôle d'un partage est exécuté sur trois échelles.

| Échelle | Verdict du contrôle |
|---|---|
| Sans le niveau ajouté | **Refusée**, pour une autre raison : la couleur de deux niveaux fait 31 et 32 caractères, la limite est 30 |
| Avec le niveau sans seuils, valeur 100 | Refusée pour la même raison, **et rien d'autre** : un niveau sans seuils n'est pas un problème pour le partage |
| Avec le niveau sans seuils, valeur 110 | Refusée pour la même raison, **plus** : « valeur 110 hors limites [0, 100] » |

**Une trouvaille hors du lot** : l'échelle née d'un modèle porte des couleurs dont le nom dépasse la limite du partage. Je n'ai pas vérifié si le geste de partage de l'interface réduit ce nom avant le contrôle (j'ai appelé le contrôle directement). Si ce n'est pas le cas, **aucune échelle de départ ne se partage aujourd'hui**, avec ou sans ce lot. Disposition : inscrire, hors de ce lot ; à mesurer par l'interface.

### En vue étendue, aucun de ces écrans ne lève d'erreur

Aucune erreur en console pendant la mesure. Les défauts sont des affichages faux, pas des pannes.

### Ce que je vais corriger, et comment

1. **La répartition du Suivi** : un niveau sans seuils ne reçoit personne (comme la conversion d'un pourcentage l'ignore déjà), et il se range à sa place dans la liste, pas en deuxième. Une note au-dessus du plus haut seuil est rangée dans le plus haut niveau qui a des seuils.
2. **Le PDF d'une échelle** : pour un niveau sans seuils, la colonne « Plage » dit un tiret, pas « 0 % - 100 % ». **Mot neuf, à valider (PROPOSÉ) : « — »**, le même signe que le PDF emploie déjà pour une description absente. Ce PDF peut être remis à des étudiant·es.
3. **Les zones du graphique** : un niveau sans seuils n'a pas de zone.
4. **La légende des barres du profil** : un niveau sans seuils n'y paraît pas.
5. **Le partage** : la valeur d'un niveau n'est plus bornée à 100 (un nombre, zéro ou plus), comme en vue simple. Je ne touche pas à la limite des couleurs.

Je ne corrige PAS : la courbe plafonnée à 100 du graphique de progression. Je ne peux ni l'exécuter ni la voir ; la changer à l'aveugle déplacerait l'axe d'un graphique que je ne sais pas rendre. Disposition au rapport final.
