# Rapport — lot « Un niveau sans seuils, une note au-dessus de 100 » (vue étendue)

Décision de Cowork du 9 nov. 2026, 21 h 43. Branche `lot/niveau-sans-seuils`, partie de `lot/vue-simple` (`58c396bb`, après le relais de 21 h 42). Session cloud, Chromium seulement. Rien n'est fusionné.

> **État de ce fichier : LES CORRECTIONS en tête (10 nov. 2026), LA MESURE dessous**, poussée avant elles comme demandé.

## LES CORRECTIONS (10 nov. 2026)

### Ce qui remonte à Grégoire

1. **Un mot neuf sur un document que des étudiant·es peuvent lire — PROPOSÉ.** Dans le PDF d'une échelle, la colonne « Plage » d'un niveau sans seuils dit :
   - « — »

   C'est le signe que ce PDF emploie déjà pour une description absente. Avant : « 0 % - 100 % ».
2. **Une supposition, à confirmer ou à renverser.** Une note au-dessus du plus haut seuil d'une échelle se range dans le plus haut niveau, plutôt que nulle part. ⚠ Elle vaut aussi pour une échelle dont le plus haut seuil est SOUS 100 : avec un plus haut seuil à 89, une note de 95 n'était rangée nulle part dans la répartition du Suivi ; elle va maintenant au plus haut niveau. C'est un changement pour des échelles ordinaires, pas seulement pour la vue simple (relevé par la relecture).
3. **Un choix d'affichage.** Le niveau sans seuils ne paraît PAS dans la répartition du Suivi (j'avais annoncé « à sa place dans la liste »). Motif : il ne peut recevoir personne, la ligne dirait toujours « Exemplaire : 0 ». À renverser si tu veux le voir.

### Ce qui est corrigé

| Constat de la consigne | Avant (mesuré) | Après (mesuré, même parcours) |
|---|---|---|
| (a) Répartition du Suivi | « Préstructurel : 0 • Exemplaire : 1 • … » : l'étudiant·e à 0 dans le niveau ajouté | « Préstructurel : 1 • Incomplet : 0 • Développement : 0 • Maîtrise : 1 • Étendu : 2 » |
| (a) PDF d'une échelle (aperçu et trois exports) | « X · Exemplaire · — · 0 % - 100 % » | « X · Exemplaire · — · — » ; les cinq autres plages inchangées |
| (a) Zones du graphique de progression | une zone aux bornes NaN | aucune zone pour ce niveau ; **exécuté hors navigateur seulement** |
| (b) Note de 110 dans la répartition | rangée nulle part (trois étudiant·es sur quatre) | rangée dans « Étendu » ; « 3 étudiant·es (75 %) ont atteint ou dépassé le niveau de maîtrise » |
| (c) Partage | « valeur 110 hors limites [0, 100] » | la valeur voyage (`valeurCalcul` et son jumeau `valeur`) ; une valeur négative reste refusée ; les seuils restent bornés à 100 |

**Source, stock, ou les deux ?** Source seulement. Aucune donnée déjà écrite n'est lue autrement, sauf le point 2 ci-dessus, qui change un AFFICHAGE pour les échelles au plus haut seuil sous 100. Rien n'est écrit dans les données de personne.

**Un choix de portée.** « Sans seuils » veut dire sans AUCUN des deux. Un niveau qui n'en a qu'un se lit comme avant ce lot (0 pour un `min` absent, 100 pour un `max` absent) : comparé à l'ancien code sur 20 échelles par la relecture, identique.

**Corrigé en passant, et dit.** Le nom d'un niveau entrait sans échappement dans la répartition du Suivi (règle de sécurité n° 1 ; relevé par la relecture). La ligne n'était pas de ce lot, mais elle est dans la fonction que je réécris et le nom d'un niveau se saisit maintenant en vue simple : échappé, avec son essai.

### Ce qui n'est PAS corrigé, avec sa disposition

| Constat | Disposition |
|---|---|
| **La légende des barres du profil** (annoncée au point 4 de la mesure) | *Périmé* : exécuté par la relecture, la source écarte déjà un niveau sans seuils. Aucun défaut. |
| **La courbe du graphique de progression, plafonnée à 100** | *Refusé dans ce lot* : ni exécutable ni visible ici (aucune capture hebdomadaire). Lu seulement. À décider. |
| **Aucune échelle de départ ne se partage** : deux couleurs des niveaux par défaut font 31 et 32 caractères, le schéma en accepte 30 | *Hors lot, à inscrire* — remonte. Exécuté sur le contrôle du partage, avec et sans ce lot ; **non vérifié par le geste de l'interface**. Le banc du lot le constate et rougira le jour où c'est levé. |
| **L'aperçu des niveaux dans les deux éditeurs d'échelle et l'assistant de pratique** : un niveau sans seuils s'affiche « X » suivi d'un tiret orphelin | *Hors lot, à inscrire* — écran d'enseignant·e. Exécuté par la relecture. |
| **Une troisième lecture « quel niveau reçoit ce pourcentage »** (`situerPourcentageDansEchelle`, profil et interventions) rend « aucun » au-dessus de 100 | *Hors lot, à inscrire.* Lu seulement. |
| **Une échelle dont AUCUN niveau n'a de seuils** : le Suivi dit « Les copies de ce groupe sont notées sans échelle » | *Hors lot, à inscrire.* Lu ; atteignable en retirant les cinq niveaux d'origine en vue simple, non rejoué. |
| Un niveau à UN seul seuil trace encore une zone aux bornes NaN ; des seuils illisibles (« 64,99 » avec une virgule) se lisent autrement qu'avant | *Sans suite* : données qu'aucun éditeur n'écrit. |

### La preuve

- **Vitest** : 19 essais neufs (`tests/unit/niveau-sans-seuils.test.js`) ; suite entière verte au push (voir le dernier commit).
- **Playwright, Chromium** : 4 essais neufs par l'interface (`tests/integration/niveau-sans-seuils.spec.js`) ; 65 sur 65 sur les bancs voisins (vue simple, tableau, Suivi, partage, PDF, échelles), lancés avant les suites de la relecture.
- **Break-tests** : 23, tous rouges. Un était resté vert (un seuil à zéro, seul) : essai durci, rejoué rouge.
- **Relecture par un agent neuf** : rien de bloquant ; sept constats. Suivis dans le lot : la note au-dessus d'un plus haut seuil sous 100 (déclarée et tenue par un essai), trois comportements sans essai (essais ajoutés), le champ jumeau `valeur` encore borné (aligné), le nom non échappé (corrigé). Les autres sont au tableau ci-dessus.
- **Une sentinelle existante mise à jour, et dit** : `sentinelle-partage-echelle-valeur` figeait la borne à 100 du champ `valeur`. Elle tient maintenant la règle neuve (zéro ou plus, les deux champs jumeaux identiques).
- Des bancs existants chargeaient le Suivi sans `echelles.js` : leurs harnais reçoivent les vraies fonctions, extraites du fichier (aucune copie de la règle).

**Non vérifié** : WebKit, iPad, la suite Playwright entière, le PDF réellement généré (seuls l'aperçu et la fonction commune aux quatre sorties sont exécutés), le graphique rendu à l'écran, des données réelles.

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
