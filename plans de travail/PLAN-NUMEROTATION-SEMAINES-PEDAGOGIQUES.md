# Plan — Numérotation des semaines alignée sur le calendrier de la DÉ

**Date de création** : 28 avril 2026
**Contexte d'entrée** : Beta 99.11 (build 0411‑2010). Constat : pour le 28 avril 2026, l'app affiche « semaine 12 » alors que le calendrier officiel du Cégep Drummond, version mise à jour le 25 mars 2026 (post‑grève du 27 mars), indique « semaine 13 ».
**Plateforme prioritaire** : Mac Safari + iPad Safari.
**Mot d'ordre** : reproduire fidèlement la table jour→semaine du calendrier de la DÉ par règles paramétrables, sans aucune table en dur. Le numéro de semaine doit refléter la **semaine pédagogique du collège** (5 jours pédagogiques par semaine), indépendamment de l'horaire spécifique d'un groupe‑cours.

---

## 1. Contexte du problème

### 1.1 Symptôme observé

Pour le groupe‑cours `601‑101‑MQ‑gr00002` (horaire Lun/Mar/Jeu, 3 jours/sem), le `h2026_calendrierComplet` stocké au 26 avril 2026 produit la table suivante (extrait) :

| Date | Statut app | Sem app | Sem officielle DÉ |
|---|---|---|---|
| jeu 26 mars | cours | 9 | 9 |
| ven 27 mars | jour‑ouvrable | — | (grève — aucun indice) |
| lun 30 mars | cours | 9 | 9 |
| mar 31 mars | cours | 9 | 9 |
| mer 1 avr | jour‑ouvrable | — | 10 |
| jeu 2 avr (devient ven) | reprise | **10** | **9** |
| ven 3 avr (Vendredi saint) | conge | — | — |
| lun 6 avr (Lundi de Pâques) | conge | — | — |
| mar 7 avr | cours | 10 | 10 |
| mer 8 avr (devient lun) | reprise | 10 | 10 |
| jeu 9 avr | cours | 10 | 10 |
| lun 27 avr | cours | 12 | 13 |
| **mar 28 avr** | cours | **12** | **13** |

Deux divergences nettes :

D'abord, l'app place le 2 avril en sem 10, alors que le PDF de la DÉ le place en sem 9 (le jeudi 2 avril joue le rôle du vendredi 27 mars annulé par la grève).

Ensuite, à partir du 27 avril, l'app accumule un retard d'une semaine entière sur la numérotation officielle.

### 1.2 Document de référence

`uploads/DE_Calendrier scolaire_25-26-MAJ_2026-03-25.pdf` — version 5 du calendrier 2025‑2026, mise à jour le 25 mars 2026 à la suite de la levée de cours du 27 mars. Le PDF affiche, pour chaque jour de cours, l'indice de semaine en exposant à droite du numéro de jour (ex. `2₆` = mardi 2 mars en semaine 6). Les permutations sont marquées par un libellé (`VEN`, `LUN`, `MER`).

---

## 2. Analyse des causes

Le décalage observé combine **trois causes distinctes** : deux dans le code (objet du présent plan), une dans la configuration H2026 (objet du document utilisateur séparé, voir §6).

### 2.1 Cause de code n° 1 — `joursParSemaine` indexé sur l'horaire du groupe

Dans `js/trimestre.js` (fonction de génération du `calendrierComplet`, lignes ≈ 716‑833), le calcul du numéro de semaine repose sur :

```javascript
const joursParSemaine = joursAvecCours ? joursAvecCours.size : 5;
// …
if (joursDeCoursMemeSemaine === 1) { numeroSemaine++; }
// …
if (joursDeCoursMemeSemaine >= joursParSemaine) { joursDeCoursMemeSemaine = 0; }
```

Pour le groupe Lun/Mar/Jeu, `joursAvecCours.size = 3`, donc une « semaine » dans la logique app vaut 3 jours pédagogiques au lieu de 5. Le compteur reste à peu près aligné tant que les semaines sont régulières (les 3 jours du groupe tombent dans la sem pédagogique correspondante du collège), mais dès qu'une permutation entre en jeu, l'app diverge.

Conséquence : la sem affichée dans l'app dépend de l'horaire du cours sélectionné, alors qu'elle devrait être une donnée du **collège**, identique pour tous les groupes‑cours d'un même trimestre.

### 2.2 Cause de code n° 2 — incohérence `>= 5` vs `>= joursParSemaine`

Toujours dans `js/trimestre.js`, la branche `'reprise'` (lignes ≈ 786‑810) utilise un seuil **codé en dur** :

```javascript
// Réinitialiser après 5 jours de cours
if (joursDeCoursMemeSemaine >= 5) {
    joursDeCoursMemeSemaine = 0;
}
```

…tandis que la branche `'cours'` (lignes ≈ 815‑833) utilise `joursParSemaine`. Pour un groupe à 3 jours/sem qui rencontre une reprise, la sem peut s'allonger à 4 jours réels au lieu de 3 (cas observé : sem 10 = jeu 2 avr + mar 7 + mer 8 + jeu 9 = 4 jours), ce qui ajoute un décalage supplémentaire.

Les deux causes sont indépendantes. Corriger n° 1 suffit à éliminer le décalage de sem 12→13 ; corriger n° 2 stabilise le code pour tous les futurs trimestres.

### 2.3 Cause externe (config H2026)

Voir §6 ci‑dessous. Le 27 mars n'est pas configuré comme jour de levée et la reprise du 2 avril est rattachée au mauvais événement (Vendredi saint au lieu de la grève). Cette correction est à faire **dans les données**, pas dans le code, et ne fait pas partie du brief Claude Code. Elle reste indispensable : sans elle, même un code correct continuera à mal placer le 2 avril, parce que la donnée d'entrée est fausse.

### 2.4 Cause de modèle de données — distinction institutionnel/personnel manquante

Le schéma actuel des événements distingue `evenementsPrevus` (saisis au début du trimestre depuis le calendrier officiel) et `evenementsImprevus` (ajoutés en cours de trimestre). C'est une distinction **temporelle** (quand l'événement a été saisi), pas une distinction **fonctionnelle** (qui le subit).

Pour le calcul de la numérotation des semaines pédagogiques du collège, ce qui compte est la portée de l'événement :

- **Institutionnel** : le collège annule, déplace ou férie ces jours pour tout le monde (Pâques, Patriotes, EUF, grève du 27 mars, semaine de planif). Ces événements modifient le calendrier officiel et donc le décompte des rôles (un Vendredi institutionnel férié sans reprise = un Vendredi en moins dans la séquence des Vendredis pédagogiques).
- **Personnel** : l'utilisateur n'a pas pu enseigner ce jour (congé repos, maladie, formation imprévue, contenu réaménagé). Le collège continue ses cours pour les autres profs. Le calendrier officiel ne change pas — la numérotation non plus. La case du jour reste rattachée à sa semaine, simplement sans cours pour le groupe‑cours, et le rôle (Lundi, Mardi…) continue de compter normalement.

Or les deux catégories se croisent avec prévu/imprévu : la grève du 27 mars est imprévue **et** institutionnelle ; un congé repos personnel est imprévu **et** personnel. Les deux atterrissent aujourd'hui dans `evenementsImprevus` sans distinction, et à `js/trimestre.js:736` les listes sont fusionnées en un seul `tousEvenements` que l'algorithme ne sait pas désambiguïser.

Il manque donc un champ `categorie` (`'institutionnel' | 'personnel'`) sur chaque événement, **orthogonal à prévu/imprévu**. Voir §3.0 pour le détail du schéma et §4.X pour l'UI.

---

## 3. Spécification de la correction (code)

### 3.0 Extension du schéma événement

Avant toute modification de l'algorithme, étendre le schéma des entrées de `evenementsPrevus` et `evenementsImprevus` avec un champ :

```
categorie: 'institutionnel' | 'personnel'
```

**Sémantique** :

- `'institutionnel'` (défaut historique) : événement qui touche le calendrier du collège pour tout le monde. Affecte le décompte des rôles dans la passe 2 du §3.2. Peut avoir une `dateReprise`/`horaireReprise`.
- `'personnel'` : événement qui touche uniquement l'utilisateur. **Ne touche pas** la numérotation des semaines (le rôle du jour continue de compter normalement) ; affecte seulement l'affichage (pas de cours saisissable ce jour‑là pour le groupe‑cours). Convention : pas de `dateReprise` (les absences personnelles sont compensées par réaménagement du contenu, pas par permutation calendaire). Si une `dateReprise` est saisie sur un événement `personnel`, l'algorithme l'ignore et lève un `console.warn`.

**Migration au boot** : tout événement existant sans champ `categorie` est marqué `'institutionnel'` à la prochaine régénération (la fonction de migration existante à `js/trimestre.js:96-128` est étendue pour ajouter le champ manquant). L'utilisateur reclasse manuellement les absences personnelles via la modale d'édition (cf. §4.X). Volumes attendus faibles (quelques événements par trimestre), migration non destructive.

### 3.1 Principe directeur

Le numéro de semaine attribué à un jour est **celui de la semaine pédagogique du collège**, défini comme suit :

Une semaine pédagogique du collège regroupe les cinq « rôles de jour » (Lundi, Mardi, Mercredi, Jeudi, Vendredi) tels qu'ils sont vécus dans le calendrier officiel. La n‑ième semaine pédagogique du trimestre est composée du n‑ième Lundi pédagogique, n‑ième Mardi pédagogique, etc., en tenant compte des permutations (un jour calendaire qui « joue le rôle » d'un autre prend la position de ce dernier dans la séquence).

Cette définition reproduit exactement la logique du PDF de la DÉ et reste indépendante de l'horaire d'un groupe‑cours.

### 3.2 Algorithme proposé

L'algorithme se décompose en deux passes.

**Passe 1 — Construction de la séquence des jours pédagogiques du collège.**

Itérer chronologiquement sur tous les jours entre `dateDebut` et `finCours` du trimestre. Pour chaque jour :

- Si c'est un weekend → ignorer.
- Si c'est dans `semainePlanificationDebut`/`Fin` ou `semaineExamensDebut`/`Fin` → ignorer.
- Si c'est un jour férié déclaré dans `evenementsPrevus`/`Imprevus` (`mapConges`) **avec `categorie === 'institutionnel'`** et **sans** dateReprise → ignorer (jour pédagogique perdu, pas d'indice de sem). C'est ce qui produit les « 14 vendredis au lieu de 15 » du courriel DÉ pour le Vendredi saint.
- Si c'est un jour férié déclaré avec **`categorie === 'personnel'`** → **inclure dans la séquence** comme jour pédagogique normal (son rôle = jour calendaire). Le calendrier collège n'a rien annulé ce jour‑là, le rôle continue donc de compter ; seul l'affichage indiquera « pas de cours » pour le groupe‑cours. Toute `dateReprise` sur un événement `personnel` est ignorée (cf. §3.0).
- Si c'est un jour qui sert de reprise pour un événement institutionnel antérieur (`mapReprises`) → ce jour adopte le **rôle du jour cible** (par ex. un jeudi qui devient vendredi est traité comme un vendredi). Il rejoint la séquence à la position du rôle qu'il joue.
- Sinon → c'est un jour pédagogique « normal », son rôle est son jour calendaire (Lun, Mar, Mer, Jeu, Ven).

Construire la séquence ordonnée de tous les jours pédagogiques retenus, chacun avec son rôle effectif.

**Passe 2 — Attribution du numéro de semaine.**

Compter, pour chaque rôle indépendamment, l'occurrence chronologique de ce rôle. Le n‑ième Lundi pédagogique a `numeroSemaine = n`, le n‑ième Mardi pédagogique aussi, etc.

Conséquence : un jour donné `J` reçoit `numeroSemaine = n` où `n` est le rang de l'occurrence de son rôle effectif. Le 2 avril (jeudi qui joue le rôle de vendredi) prend le rang du vendredi correspondant, soit la 9ᵉ occurrence du rôle « Vendredi » du trimestre = sem 9. Le 1ᵉʳ avril (mercredi sans permutation) est la 10ᵉ occurrence du rôle « Mercredi » = sem 10. Cohérent avec le PDF.

### 3.3 Cas particuliers à valider

Quelques situations méritent d'être explicitement vérifiées :

**Permutations multiples sur la même date.** Le 15 mai 2026 est aujourd'hui rattaché à deux événements (Patriotes → Lundi, EUF → Mercredi). C'est une erreur de config qui sera corrigée par l'utilisateur (§6), mais le code doit être robuste à ce cas : si deux reprises ciblent la même date, lever un avertissement dans la console (`console.warn`) et n'en garder qu'une (la dernière par ordre d'insertion, par ex.) plutôt que produire silencieusement un calendrier incohérent.

**Jour férié sans reprise au milieu d'une semaine.** Le Vendredi saint 3 avril 2026 est férié sans reprise. Dans la séquence des « Vendredis pédagogiques », il est simplement absent — il n'y a pas de 10ᵉ Vendredi pédagogique au trim H2026 (d'où la mention du courriel : « 14 vendredis au lieu des 15 habituels »). Le calendrier doit refléter ce trou sans casser la numérotation des autres rôles.

**Semaine de relâche / planification.** Dans H2026, la sem du 9‑13 mars est marquée comme `semainePlanificationDebut/Fin`. Les jours de cette plage n'ont pas d'indice de sem dans le PDF. Le calcul ne doit donc pas leur attribuer de `numeroSemaine`, et la séquence reprend immédiatement après. Vérifier que l'absence de cette plage ne décale pas la numérotation (sem 7 = mer 4 + jeu 5 + ven 6 mars + lun 16 + mar 17, étalée sur trois semaines calendaires).

**Jours d'évaluation institutionnelle (EUF).** Le mer 13 mai 2026 est un jour EUF — le PDF n'y inscrit pas d'indice numérique. Comportement attendu : traiter comme un jour férié sans reprise (pas d'indice de sem), même si la reprise du 15 mai (qui devient mercredi) prend le rôle de « Mercredi de la sem 15 ». À confirmer en lisant attentivement le PDF.

**Absences personnelles (`categorie === 'personnel'`).** Cas concret : l'utilisateur prend deux jours de repos non repris (mar 14 + mer 15 avr) en réaménageant le contenu de cours dans les semaines suivantes. Comportement attendu : ces jours apparaissent dans la grille calendrier avec `numeroSemaine = 11` (le rôle Mardi continue de compter, donc Mar 14 = Mar#11), un statut `'conge'` et un libellé qui indique l'absence. Le 28 avril reste sem 13 conformément au PDF. Cas d'usage représentatif des utilisateurs (fréquent), à valider explicitement par les tests §4.5.

### 3.4 Affichage dans la grille calendrier

Exigence utilisateur : le numéro de la semaine pédagogique du collège doit être visible **dans toutes les cases de jour de cours du collège** (Lundi à Vendredi non fériés, hors planification/examens), pas uniquement les jours où le groupe enseigne. Concrètement, dans la grille calendrier (`js/calendrier-vue.js`), un mercredi sans cours pour le groupe `601‑101` doit malgré tout afficher « sem 10 » (par exemple) si le PDF officiel le marque ainsi.

Statuts à modifier dans la génération du calendrier complet :

- `'cours'` (jour de cours du groupe) → numeroSemaine assigné. Inchangé.
- `'reprise'` (jour permuté) → numeroSemaine assigné selon le rôle joué. Inchangé sur le principe, corrigé sur la valeur.
- `'jour-ouvrable'` (jour de cours du collège, hors horaire du groupe) → **nouveau** : numeroSemaine doit aussi être assigné, calculé sur le même algorithme. Aujourd'hui ce statut a `numeroSemaine: null`.
- `'weekend'`, `'semaine-planification'`, `'semaine-examens'`, `'conge'` → pas de numeroSemaine. Inchangé.

L'affichage CSS de la grille (`js/calendrier-vue.js` ligne ≈ 292) lit déjà `statut.numeroSemaine`. Il faudra peut‑être ajouter un style discret pour distinguer le numéro affiché sur un `'jour-ouvrable'` (badge plus pâle ?) du numéro affiché sur un `'cours'` ou `'reprise'`. À discuter au moment de l'implémentation visuelle.

---

## 4. Localisation des changements

### 4.1 Fichier principal — `js/trimestre.js`

Réécriture de la fonction de génération du calendrier complet (lignes ≈ 700‑852). La structure actuelle (boucle séquentielle avec compteur `joursDeCoursMemeSemaine`) ne permet pas le calcul rétroactif requis pour les permutations. Proposition : remplacer par une implémentation en deux passes (cf. §3.2).

Supprimer `joursParSemaine = joursAvecCours.size`. L'horaire du groupe ne doit plus intervenir dans le calcul du `numeroSemaine`. Il continue à servir, ailleurs, à déterminer si un jour est « cours » ou « jour‑ouvrable » pour ce groupe précis.

Supprimer le `>= 5` codé en dur (cause n° 2) — il n'a plus lieu d'être avec la nouvelle logique.

### 4.2 Affichage — `js/calendrier-vue.js`

Vérifier que l'affichage du numéro de sem fonctionne correctement quand le statut est `'jour-ouvrable'` (cas non couvert aujourd'hui car `numeroSemaine` était null). Adapter le rendu CSS si on souhaite un visuel distinct pour les cases « pas de cours pour ce groupe mais sem du collège affichée ».

Vérifier aussi le rendu des congés `personnel` : la case affiche le numéro de semaine (le rôle du jour reste compté) mais avec un libellé court (« Absence » ou le `description` de l'événement) et sans cours saisissable. Visuellement distinct des congés institutionnels (lesquels n'ont pas d'indice de sem) — par exemple, congé institutionnel = teinte grise foncée sans badge ; congé personnel = teinte grise claire avec badge sem.

### 4.X UI — Modale d'ajout/édition d'événement

Localiser la modale (probablement dans `js/trimestre.js` ou `js/trimestres.js`, à confirmer) et y ajouter un sélecteur à 2 choix pour `categorie` :

- Étiquette : « Type d'événement »
- Options : « Institutionnel (collège) » / « Personnel (vous seulement) »
- Aide contextuelle courte : « Institutionnel = le collège a annulé/déplacé ces cours pour tout le monde. Personnel = vous étiez absent, le collège a continué normalement. »
- Défaut à la création : `'institutionnel'` (cas le plus fréquent).
- Si `categorie === 'personnel'` est sélectionné, désactiver/masquer les champs `dateReprise` et `horaireReprise` (cf. §3.0 : pas de reprise sur un événement personnel).

Le sélecteur doit fonctionner identiquement pour les événements prévus et imprévus (les deux axes sont orthogonaux).

### 4.3 Modules consommateurs (à auditer, pas forcément à modifier)

`js/snapshots.js`, `js/correlations-longitudinales.js`, `js/horaire.js`, `js/organisateur.js`, `js/planification-carte.js` consomment `numeroSemaine` à divers endroits (cf. recherche `grep numeroSemaine|numSemaine`). Auditer chacun pour vérifier que le changement de définition (sem du collège au lieu de sem du groupe) reste cohérent avec leur usage. Risque principal : un module qui suppose qu'il y a exactement 3 jours par sem (= jours du groupe) verrait maintenant des sem à 5 entrées dont seulement 3 marquées `'cours'`.

Identifier en priorité tout usage de la forme `for (sem = 1; sem <= N; sem++) { ... }` qui présume une numérotation séquentielle dense — la nouvelle logique peut produire des trous (ex. sem sans aucun jour `'cours'` pour un groupe particulier).

### 4.4 Stockage et migration

Le calendrier complet est stocké dans la clé `{trimestre}_calendrierComplet` (par ex. `h2026_calendrierComplet`). Cette clé est régénérée à chaque modification du cadre, des événements ou de l'horaire. Aucune migration explicite n'est nécessaire : la prochaine régénération produira un calendrier conforme.

Toutefois, les **données dérivées qui contiennent le `numeroSemaine` figé** (snapshots hebdomadaires, séquences avec `metadata.semaineDebut`, etc.) restent à l'ancienne convention. À auditer.

### 4.5 Tests à ajouter

Dans le dossier de tests (à créer si absent), ajouter une suite de tests unitaires qui valide la table jour→semaine pour H2026 contre les valeurs lues dans le PDF de la DÉ. Au minimum :

| Date | Sem attendue (PDF DÉ) |
|---|---|
| 2026‑01‑21 (mer) | 1 |
| 2026‑01‑27 (mar) | 1 |
| 2026‑01‑28 (mer) | 2 |
| 2026‑03‑06 (ven) | 7 |
| 2026‑03‑10 (mar) | aucune (planification) |
| 2026‑03‑16 (lun) | 7 |
| 2026‑03‑27 (ven) | aucune (grève, sans reprise dans cette config) |
| 2026‑04‑01 (mer) | 10 |
| 2026‑04‑02 (jeu, joue ven) | 9 |
| 2026‑04‑03 (ven, férié sans reprise) | aucune |
| 2026‑04‑08 (mer, joue lun) | 10 |
| 2026‑04‑13 (lun, congé personnel sans reprise) | 11 |
| 2026‑04‑14 (mar, congé personnel sans reprise) | 11 |
| 2026‑04‑27 (lun) | 13 |
| 2026‑04‑28 (mar) | 13 |
| 2026‑05‑15 (ven, joue mer) | 15 |
| 2026‑05‑18 (lun, férié) | aucune |

Ces valeurs supposent que la config H2026 a été corrigée selon §6. À ajuster si la config évolue.

---

## 5. Critères d'acceptation

Le travail est considéré comme terminé quand :

1. La table `h2026_calendrierComplet` régénérée reproduit fidèlement les indices du PDF de la DÉ (validation par les tests du §4.5).

2. Le 28 avril 2026 affiche `numeroSemaine = 13` dans toute l'app (calendrier vue, snapshots, séquences, etc.).

3. Le numéro de semaine est visible dans toutes les cases lun‑ven non fériées de la grille calendrier, y compris les jours où le groupe n'enseigne pas.

4. Aucune valeur codée en dur dans le calcul (le `>= 5` ligne 808 a disparu, et aucune autre valeur du même type n'est introduite).

5. Le code reste compatible avec le trimestre A2025 archivé (le calendrier de l'automne ne doit pas être altéré par la nouvelle logique).

6. Les modules consommateurs de `numeroSemaine` continuent à fonctionner (snapshots se capturent, séquences se trient correctement, etc.).

7. Le rendu visuel distingue (par CSS) un numéro de sem affiché sur un jour de cours du groupe vs un jour ouvrable du collège sans cours pour le groupe.

---

## 6. Travaux qui ne relèvent PAS de Claude Code

Cette section est destinée à l'utilisateur et liste les ajustements à faire **manuellement dans l'app**, dans la configuration H2026 du trimestre actif, **après** que le code ait été corrigé et redéployé. Ces ajustements concernent les données et reflètent le nouveau calendrier de la DÉ post‑grève du 27 mars 2026.

### 6.1 Ajouter le 27 mars 2026 comme événement imprévu

Dans la section « Événements imprévus » du cadre H2026, créer une entrée :

- Date : 27 mars 2026
- Description : « Levée de cours (grève AGE) »
- Type : **Institutionnel**
- Date de reprise : 2 avril 2026
- Horaire de la reprise : Vendredi

Effet attendu : le 27 mars devient un jour de congé sans cours, et le jeu 2 avril joue le rôle de vendredi pour la sem 9.

### 6.2 Retirer la reprise du Vendredi saint (3 avril 2026)

Dans la section « Événements prévus », modifier l'entrée du 3 avril :

- Vider le champ « Date de reprise » (laisser vide)
- Vider le champ « Horaire de la reprise »

Justification : le courriel du DE indique « 14 vendredis de cours au lieu des 15 habituels ». Le 3 avril est donc un congé **sans** reprise. Le 2 avril (qui était jusqu'ici sa reprise) est désormais affecté au 27 mars (§6.1).

### 6.3 Renommer « St‑Patrick » en « Fête des Patriotes »

Dans la section « Événements prévus », l'entrée du 18 mai 2026 est libellée « St‑Patrick ». Erreur de nom : la Saint‑Patrick est le 17 mars. Le 18 mai est la **Fête des Patriotes** (jour férié au Québec, dernier lundi avant le 25 mai).

### 6.4 Retirer la reprise de la Fête des Patriotes (18 mai 2026)

Dans la même entrée du 18 mai, vider les champs « Date de reprise » et « Horaire de la reprise ». Selon le courriel du DE, seule la reprise pour l'EUF (15 mai → mercredi) est conservée. La Fête des Patriotes est un congé sans reprise.

### 6.5 Vérifier l'entrée EUF (13 mai 2026)

L'entrée du 13 mai (EUF, reprise au 15 mai « Mercredi ») est correcte selon le PDF. À conserver telle quelle.

### 6.6 Reclasser les deux congés repos (13‑14 avril 2026) en `Personnel`

Les entrées « congé repos » des 13 et 14 avril sont des absences personnelles enregistrées par l'utilisateur — le collège, lui, a continué ses cours pour les autres profs ces jours‑là. Avec le nouveau modèle (§3.0, §4.X), les marquer **Type : Personnel** dans la modale d'édition. Le cas échéant, vider toute `dateReprise`/`horaireReprise` qui aurait été saisie (sans effet de toute façon : l'algorithme l'ignore pour les événements personnels).

Effet attendu : ces deux jours apparaîtront en sem 11 sur la grille calendrier (le rôle Mardi/Mercredi continue de compter normalement), sans cours saisissable, et avec un libellé indiquant l'absence. Le 28 avril restera sem 13.

Tous les autres événements existants restent par défaut **Institutionnel** (la migration au boot les marque ainsi). À reclasser en Personnel uniquement les absences vraiment personnelles (formations imprévues, maladies passées, etc., s'il y en a d'autres dans la liste).

### 6.7 Régénérer le calendrier complet

Une fois ces ajustements faits, déclencher la régénération du `calendrierComplet` (probablement automatique à la sauvegarde du cadre, sinon via le bouton de régénération du module Trimestre). Vérifier que le 28 avril affiche bien sem 13.

---

## 7. Risques et points d'attention

L'algorithme proposé (§3.2) suppose que toutes les permutations sont déclarées explicitement dans `evenementsPrevus`/`Imprevus`. Si la DÉ produit à l'avenir un calendrier avec une permutation non déclarée par l'utilisateur, l'app reproduira la version « non permutée ». Pas de solution magique : le calendrier de l'app ne peut être plus précis que les événements qui le nourrissent. À documenter.

Le passage de `joursAvecCours.size` à 5 jours pédagogiques fixe peut révéler des bugs latents dans les modules qui supposaient implicitement la convention actuelle. Auditer prudemment §4.3 avant de pousser, et prévoir une vérification visuelle des graphiques de progression et des snapshots pour A2025 archivé.

L'affichage du numéro de sem sur tous les jours ouvrables (§3.4) augmente la densité visuelle de la grille. Vérifier sur iPad Air (Safari) que le rendu reste lisible — éventuellement réduire la taille du badge ou l'opacité.

---

## 8. Étapes d'implémentation suggérées

**Important — ordre de déploiement.** Les ajustements utilisateur du §6 (notamment §6.1, qui ajoute une reprise institutionnelle pour le 27 mars) ne doivent **pas** être appliqués avant que le code §3 soit en place et testé. Avec l'ancien code, ajouter cette reprise rendrait le calendrier temporairement plus faux qu'il ne l'est aujourd'hui (la sem 10 dériverait davantage). L'utilisateur attend la confirmation que le code est déployé avant de toucher à la config.

1. Lire ce plan en entier et discuter des ambiguïtés (notamment les cas particuliers du §3.3) avant de coder.
2. Étendre le schéma des événements avec le champ `categorie` et la migration au boot (§3.0). Aucun changement d'algorithme à cette étape — vérifier juste que le boot d'un trimestre existant marque tous les événements `'institutionnel'` sans rien casser.
3. Adapter la modale d'ajout/édition d'événement (§4.X) — sélecteur Type, désactivation des champs reprise pour `personnel`. Tester la création/édition d'un événement personnel sur un Codex de test.
4. Écrire d'abord la suite de tests du §4.5 — qu'elle soit rouge avant de commencer la réécriture algorithmique. Inclure au minimum un cas avec un événement `personnel` (mar 14 avr 2026, attendu sem 11).
5. Réécrire la fonction de génération du calendrier complet en deux passes (§3.2), en intégrant le filtre `categorie` dans la passe 1.
6. Faire passer les tests au vert sur H2026 corrigé. La correction §6 est à faire **dans un Codex de test isolé** à cette étape, pas dans le Codex actif de l'utilisateur.
7. Vérifier sur A2025 archivé : aucune régression sur le calendrier d'automne (il ne devrait pas être régénéré tant que l'utilisateur n'y modifie rien — confirmer en navigant dans A2025 sans toucher à son cadre).
8. Auditer les consommateurs de `numeroSemaine` (§4.3) — `horaire.js`, `snapshots.js`, `correlations-longitudinales.js`, `impact-jetons.js`, `trimestres.js`.
9. Adapter l'affichage de la grille (§4.2 + §3.4) — numéro sur les `'jour-ouvrable'`, distinction visuelle entre congés institutionnels (pas d'indice) et congés personnels (indice de sem affiché).
10. Vérification croisée Mac + iPad du rendu visuel.
11. **Une fois le code validé sur Codex de test**, communiquer à l'utilisateur qu'il peut appliquer §6 sur son Codex actif (ajout grève 27 mars, retrait reprise Vendredi saint, reclassement congés repos en `Personnel`, etc.).
12. Mettre à jour `js/changelog-data.js` avec une entrée Beta XX (à demander à l'utilisateur).
13. Mettre à jour `version.json` et les fallback de `index.html` selon la procédure CLAUDE.md.

---

## 9. Référentiels et liens

- Document de référence DÉ : `uploads/DE_Calendrier scolaire_25-26-MAJ_2026-03-25.pdf`
- Code à modifier : `js/trimestre.js` (fonction principale lignes ≈ 700‑852), `js/calendrier-vue.js`
- Données concernées : clés `{trimestre}_cadreCalendrier`, `{trimestre}_evenementsPrevus`, `{trimestre}_evenementsImprevus`, `{trimestre}_calendrierComplet`
- Sauvegarde de référence pour la reproduction du bug : `Sauvegarde réserve 26 avril/groupe 2/donnees.json` (cours 601‑101‑MQ‑gr00002)
