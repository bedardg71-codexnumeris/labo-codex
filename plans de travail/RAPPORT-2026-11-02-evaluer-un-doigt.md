# Rapport pour Cowork – En Évaluer, un doigt sur la copie ne ramène plus en Annoter (#1217, 2 novembre 2026)

> Claude Code, lundi 2 novembre 2026, matin. Consigne : `CONSIGNE-LOT-2026-11-02-evaluer-un-doigt-ne-ramene-pas.md` (commitée avec la fiche #1217 au BACKLOG et au suivi des bugs, `5c03aecb`). **Pas de release, rien de poussé.**
> Le lot de mesure des tampons a été interrompu par celui-ci : sa mesure est faite, son plan écrit (`PLAN-2026-11-02-tampons-tous-dans-la-bibliotheque.md`, non commité), son rapport reste à écrire. Il reprend après.

## 1. La reproduction

WebKit, 1180 × 820, la copie fictive du banc ouverte en Évaluer, événements de pointeur fabriqués et envoyés au canevas d'annotation (le WebKit de bureau n'a ni doigt ni stylet).

| Geste en Évaluer | Avant le correctif | Après |
|---|---|---|
| Outil Sélection, un toucher | **revient en Annoter** | reste en Évaluer |
| Outil Sélection, défilement à deux doigts | **revient en Annoter** (au premier doigt) ; la copie défile de 60 px | reste en Évaluer ; la copie défile de 60 px |
| Un code actif, un toucher puis deux doigts | **revient en Annoter** | reste en Évaluer, rien de posé |
| Un tampon actif, un toucher | **revient en Annoter** | reste en Évaluer, rien de posé |
| Un tampon actif, le stylet | pose et revient en Annoter | inchangé |
| En Annoter, un tampon actif, un toucher | pose (#1123) | inchangé |

**La cause lue par Cowork est confirmée** : sous Sélection, le doigt allait jusqu'à `avantPremiereAnnotation()` dans `onPointerDown` ; sous un code ou un tampon, le toucher en attente posait au relâcher et basculait (`terminerToucherEnAttente`).

## 2. Le correctif

Dans `premierTriDuPointeur` (`js/travaux-annotation.js`), le tri des pointeurs que `onPointerDown` fait en premier : en Évaluer, un pointeur `touch` s'arrête là. Il ne sélectionne pas, n'arme aucun toucher en attente (donc ne pose ni code ni tampon) et n'appelle pas `avantPremiereAnnotation()`. Le stylet est trié avant (il ne peut pas être arrêté par ce garde), le second doigt aussi : le défilement et le pincement à deux doigts ne passent pas par là et ne changent pas. La souris n'est pas touchée ; en Annoter, rien ne change. Une petite fonction `_enEvaluer()` sert au garde et à `avantPremiereAnnotation`, qui faisait le même test.

**Pourquoi là et pas dans `onPointerDown`** : posé d'abord dans `onPointerDown`, le garde faisait monter sa complexité de 48 à 50, et la sentinelle « contenir » (fonction figée) a rougi. Dans `premierTriDuPointeur`, son seul appelant, l'effet est le même et rien ne monte au-dessus des seuils.

## 3. Les tests

`evaluer-un-doigt-ne-ramene-pas-1217.spec.js`, six essais : les six lignes du tableau.

**Contre-épreuves** (skill `verification-adverse`), rejouées sur la version finale du garde, chacune annulée ensuite (fichier vérifié identique) :

| Sabotage | Essais rouges |
|---|---|
| Sans le garde | les quatre gestes au doigt en Évaluer |
| Le garde avant le tri du stylet, pour tout pointeur | le stylet |
| Le garde aussi en Annoter | le toucher en Annoter (#1123) |
| (première version, dans `onPointerDown`) le garde réservé à l'outil Sélection | code actif, tampon actif |

**Rejouées** : les specs `annotation-*`, `palette*` et `evaluer-*`, après la version finale du garde : **147 verts, 2 sautés, 0 rouge, 0 reprise** (8,1 min). Même résultat à la première passe, avant le déplacement du garde. Plus, à part : `annotation-deux-doigts-page` et `annotation-tampon-au-doigt-1123`, verts.

**Vitest entier** : **863 fichiers, 10 615 essais, tous verts.** Avec le garde dans `onPointerDown`, la sentinelle « contenir » rougissait (complexité 48 → 50) : c'est ce qui l'a fait déplacer (§ 2).

## 4. Ce que le banc ne voit pas (pour la porte terrain)

- **Le geste réel sur l'iPad** : les événements sont fabriqués. À éprouver : en Évaluer, toucher la copie, la faire défiler à deux doigts, la pincer ; avec un code actif, puis un tampon actif. Le stylet pose toujours et ramène en Annoter.
- **Le double toucher** : sous Sélection, un double-clic modifie un texte ou agrandit un tampon (`onDoubleClick`). Il ne ramène pas en Annoter. Je ne sais pas si Safari en émet un au double toucher du doigt sur ce canevas ; le banc ne peut pas le produire. Disposition : **commenter et oublier** tant que personne ne le vit ; la porte peut le demander en une ligne.
- **Un doigt ne fait pas défiler la copie** en Évaluer, comme avant : le défilement reste à deux doigts, comme Grégoire le fait. Rien n'a changé là.

## 5. Pour la mise en ligne (à Cowork)

Le point de Nouvelles est à écrire par Cowork et à faire valider par Grégoire. Proposition de fond, pas de texte : « En Évaluer, toucher la copie du doigt ne te ramène plus en Annoter ; le stylet, lui, annote toujours. » Puis la vérification complète, à son signal.
