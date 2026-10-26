# Textes à corriger – la table de cas du critère algorithmique (étape 3)

> ✅ **TRANCHÉ PAR GRÉGOIRE le 25 oct. 2026 à 17 h 19**, dans la page « Table de cas à trancher » (https://claude.ai/artifact/KqZzFNTEEVfPqedyr1hQ7i) : **toutes les propositions de Cowork sont retenues**, mot pour mot. Égalité : le premier dans la liste des sous-critères (critères neufs seulement). Tout maîtrisé : « Tu pourrais encore raffiner : {nom du critère}. » Paliers : « Aucune occurrence », « Excellent », « Très bien », « Bien », « Risqué », « Au-delà », avec les phrases et les deux phrases d'aide du tableau ci-dessous. Les cas 1, 3 et 5 : inchangés.

> Proposés par Cowork le dimanche 25 octobre 2026 vers 17 h 30 (Toronto), à la demande de Grégoire (17 h 10 : « ok, on fait ça »), pour qu'il les corrige **le 26**, avant la consigne de l'étape 3. Plan : `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, étape 3.
> **Mesuré dans le code** (`js/evaluation-enonces.js`, `js/evaluation-projection.js`, `js/evaluation-calcul.js`, `js/evaluation-retroaction.js`). Rien n'est codé.

## Ce que fait la table de cas, et ce qu'on corrige ici

L'étape 3 transforme les choix que l'application fait aujourd'hui (souvent sans les montrer) en une table lisible : **« quand… , l'élève lit ce texte »**, un texte par champ, que l'enseignant modifie. Les **textes par défaut** sont ceux qu'un **critère neuf** reçoit, dans **toute discipline**. Les critères existants (les tiens compris) gardent leurs textes : aucune copie déjà évaluée ne change.

**Trois contraintes d'écriture**, parce que les noms de l'enseignant (« ce que tu comptes », « ce à quoi tu le rapportes ») sont tapés par lui :
1. **Aucun accord** sur ces noms : l'application ne connaît pas leur genre (« aucun calcul », « aucune erreur »). Les phrases les évitent.
2. **Pas de « de » devant eux** : l'élision ne se pose pas (« de erreurs »).
3. **Aucune discipline** nommée (le principe du 21 oct., 9 h 20), et le **conditionnel** plutôt que la prescription (le principe du 15 oct.).

---

## Les cas que l'application connaît déjà

Pour chacun : **quand** il se présente, **qui** le lit, ce qui s'affiche **aujourd'hui** (modèle « Générique »), et le texte **proposé**.

### 1. Le décompte

- **Quand** : toujours.
- **Qui** : l'élève (sous le critère, et dans le PDF).
- **Aujourd'hui** : « Ta production contient {nombre} {ce que tu comptes}{(après pondération)} pour {nombre} {ce à quoi tu le rapportes}. »
- **Proposé** : **inchangé.** Arrêté par toi le 2 septembre, les deux noms validés le 22 octobre.

### 2. Ce qui revient le plus souvent

- **Quand** : la copie porte au moins un code. L'application prend le sous-critère **le plus fréquent** et ajoute son observation à la phrase de l'élève. **Choix aujourd'hui invisible** : en cas d'égalité, c'est le code qui a atteint ce nombre le premier, dans l'ordre où tu les as posés.
- **Qui** : l'élève.
- **Aujourd'hui** : l'observation du sous-critère, seule, sans phrase d'introduction.
- **Proposé** : **inchangé** (l'observation seule). Une observation est déjà écrite pour être lue seule ; une introduction la doublerait souvent.
- **⚠ Une question pour toi (la règle, pas le texte)** : en cas d'égalité, garder « le premier posé », ou prendre **« le premier dans la liste des sous-critères »** ? La seconde est plus prévisible : l'élève lit toujours la même observation pour les mêmes nombres. Elle ne s'appliquerait qu'aux critères neufs.

### 3. Le défi prioritaire

- **Quand** : la note du critère tombe à 0 alors que la copie porte au moins un code.
- **Qui** : l'élève, en tête du bilan.
- **Aujourd'hui** : « {nom du critère} est à travailler en priorité »
- **Proposé** : **inchangé.**

### 4. Quand tout est maîtrisé

- **Quand** : tous les critères de la grille sont acquis.
- **Qui** : l'élève, dans le bilan.
- **Aujourd'hui** : « Concentre-toi sur {nom du critère} »
- **Proposé** : **« Tu pourrais encore raffiner : {nom du critère}. »**
  Motif : « Concentre-toi sur » est prescriptif, pour un élève qui a tout réussi ; le deux-points évite l'article devant un nom de critère qu'on ne connaît pas (« sur la Structure » ou « sur Structure » ?).

### 5. Aucune annotation

- **Quand** : la copie ne porte ni tampon ni code.
- **Qui** : toi seul (à la correction).
- **Aujourd'hui** : « Aucun tampon ni {ce que tu comptes} annotés. »
- **Proposé** : **inchangé** (« annotés » au masculin pluriel s'accorde avec « tampon », quel que soit le nom).

---

## Les paliers (seulement si l'enseignant fixe une limite)

Un critère neuf naît **sans** paliers. Ils paraissent quand l'enseignant fixe ce qu'il tolère (« Erreurs tolérées » sur une « Longueur de référence »). Aujourd'hui, le gabarit offert aux nouveaux utilisateurs reprend les tiens, avec « En prévision de l'épreuve uniforme » : **une épreuve de français**. Pour toute discipline, la limite est celle que l'enseignant fixe.

Chaque palier a un **nom court** (la rangée des paliers du PDF), une **phrase** (ajoutée après le décompte) et, s'il a nommé un service d'aide, une **phrase d'aide**. Le seuil est la part de la limite.

| Palier (nom court) | Quand (part de la limite) | Phrase proposée | Phrase d'aide proposée |
|---|---|---|---|
| **Sans erreur** → proposé : **« Aucune occurrence »** | rien de compté | **« C'est exceptionnel. »** | – |
| **Excellent** | jusqu'à 30 % | **« Ce rapport est excellent. »** | – |
| **Très bien** | jusqu'à 40 % | **« Ce rapport est très bien. »** | – |
| **Bien** | jusqu'à 50 % | **« Ce rapport est bien. »** | – |
| **Risqué** | jusqu'à 100 % | **« Ce rapport est risqué : il approche de la limite. »** | **« Il pourrait être utile de demander de l'aide : {service}. »** |
| **Échec** → proposé : **« Au-delà »** | plus de 100 % | **« Ce rapport dépasse la limite fixée. »** | **« Il serait important de demander de l'aide : {service}. »** |

Motifs :
- « Sans erreur » nomme ce qu'on compte ; « Aucune occurrence » vaut pour un critère qui compte des réussites comme des erreurs.
- « C'est exceptionnel. » suit le décompte (« … 0 erreur pour 900 mots. C'est exceptionnel. ») et vaut quel que soit le nom.
- « Échec » prédit un résultat que seule l'épreuve de français rend automatique ; ailleurs, l'enseignant n'a fixé qu'une limite.
- La phrase d'aide est au **conditionnel** et met le service **après un deux-points** : sans nom de service, l'application retire l'apposition et la phrase tient seule (« Il pourrait être utile de demander de l'aide. »), comme le gabarit d'aujourd'hui.
- Les seuils (30, 40, 50, 100 %) sont ceux d'aujourd'hui : non touchés.

---

## Ce que je n'ai pas trouvé

Le plan nomme aussi, parmi les choix invisibles, **« la tendance »** et **« la réussite »**. Je ne les ai pas trouvés dans le code du critère algorithmique : « la réussite » est sans doute le cas 4 (tout maîtrisé) ; « la tendance » reste à éclaircir avec Claude Code au moment de la consigne. Si tu sais ce qu'elle désignait, dis-le.

## Ce qui te revient, dans l'ordre (un à la fois, le 26)

1. Le cas 2 : la règle d'égalité.
2. Le cas 4 : « Tu pourrais encore raffiner : {nom du critère}. »
3. Les paliers : les deux noms courts (« Aucune occurrence », « Au-delà »), puis les phrases, puis les deux phrases d'aide.
