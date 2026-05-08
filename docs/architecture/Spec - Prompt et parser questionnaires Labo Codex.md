# Spécification — Évolution du prompt et du parser de questionnaires Labo Codex

> **Auteur·rices** : Grégoire (besoins) + Claude Cowork (analyse).
> **Statut** : Document de spécification. Le code source de Labo Codex n'est pas accessible depuis cette session ; les recommandations qui suivent sont à valider techniquement par Claude Code.
> **Genèse** : Frictions observées lors de la conversion du Bilan réflexif H2026 v07 (47 items, format pédagogique riche) vers le format Labo Codex actuel (65 items, format strict 4-niveaux + ouverte).

---

## 1. Diagnostic — Où le prompt actuel pince

### 1.1 Cas observés lors de la conversion v07 → format Labo Codex

| # | Question naturelle (v07) | Forme dans le format actuel | Effet |
|---|---|---|---|
| 1 | « Quel est ton parcours avant ce cours ? » (1 question, 5 cases à cocher) | 5 questions Likert « Je suis dans cette situation : ... » | Gonflage artificiel (×5), réponses sémantiquement étranges (forcément un seul « Tout à fait d'accord ») |
| 2 | « Les rétroactions reçues étaient (coche tout ce qui s'applique) : Claires / Utiles / À temps / Suffisantes » | 4 questions Likert distinctes | Acceptable mais répétitif. Les 4 questions partagent la même échelle d'accord — une matrice serait plus économique. |
| 3 | « Combien de jetons as-tu utilisés ? Aucun / Un / Deux / Plus de deux » | Soit converti en Likert artificiel, soit retiré | Perte de l'information de fréquence exacte |
| 4 | « As-tu utilisé l'IA ce trimestre ? Fréquemment / Occasionnellement / Une ou deux fois / Jamais » | « J'utilise régulièrement l'IA » en Likert 4 niveaux | Approximation : « Plutôt en désaccord » couvre à la fois « occasionnellement » et « une ou deux fois ». Données moins exploitables. |
| 5 | « Manuel utile ? + option Je ne l'utilise pas vraiment » | Likert 4 strict, option « Je ne l'utilise pas » supprimée | Force une réponse qui n'a pas de sens pour l'élève qui n'a pas utilisé le manuel |
| 6 | « Si tu n'as pas utilisé de jeton de reprise, pourquoi ? » (cases à cocher) | Soit 4 Likerts artificiels, soit 1 ouverte | Convertie en ouverte, la donnée n'est plus agrégeable mécaniquement |
| 7 | « Identifie les 3 concepts les plus utiles » + « Identifie le concept le moins utile » | 8 Likerts « X est parmi les plus utiles » | Plus de hiérarchie nette ; le top-3 doit être reconstruit après coup en triant les valeurs |
| 8 | « Charge de travail » avec libellés enrichis (« charge appropriée » / « un peu trop » / « charge trop lourde ») | Libellés enrichis retirés, Likert standard | Perte de précision sémantique |

### 1.2 Limites structurantes du prompt actuel

Le prompt actuel impose **deux types** de questions seulement (Likert 4 niveaux et Ouvert), et ce choix architectural a six conséquences :

1. **Les questions à réponses multiples** (cases à cocher) sont éclatées en séries de Likerts, ce qui multiplie le nombre d'items de 4 à 8 fois par question éclatée.
2. **Les questions à choix unique non-Likert** (radio buttons : Aucun / Un / Deux / Plus de deux) n'ont pas de mapping naturel — soit on les retire, soit on les approxime en Likert.
3. **Les options de filet de sécurité** (« Non applicable », « Je ne l'utilise pas », « Je n'en ai pas eu besoin ») sont impossibles. Elles forcent des réponses bruitées chez les non-concernés.
4. **Pas de logique conditionnelle** : impossible de poser « Si tu as répondu X, alors... ». Tous les répondants voient toutes les questions.
5. **Pas de matrice** : les groupes de questions partageant la même échelle (ex. : « Évalue chaque concept ») doivent être listés comme questions séparées, ce qui rallonge la passation.
6. **Pas de classement (rang ordinal)** : pour des questions du type « Classe les 3 plus utiles », un rang ordinal serait plus précis qu'une série de Likerts.

### 1.3 Effet net mesuré sur le Bilan H2026

- v07 (format pédagogique riche) : **47 items, ~18-20 minutes** de passation.
- Format Labo Codex actuel : **65 items, ~22-25 minutes** de passation.
- **Augmentation de 38 % du nombre d'items** sans gain d'information — plutôt avec des pertes (filets de sécurité retirés, hiérarchie écrasée, conditionnelles supprimées).

---

## 2. Proposition — Prompt v2 (rétrocompatible)

### 2.1 Principes directeurs

- **Rétrocompatibilité** : tout questionnaire produit par le prompt v1 reste valide. Le parser v2 lit les deux formats.
- **Élargissement minimal** : on ajoute uniquement les types observés comme manquants à l'usage. Pas de feature pour la feature.
- **Format texte préservé** : pas de passage à JSON/YAML, qui complique l'écriture manuelle.
- **Ambiguïté évitée** : chaque type de question est marqué explicitement par un préfixe `[TYPE]` ou par la forme de ses options.

### 2.2 Types ajoutés (priorisés)

| Priorité | Type | Justification |
|---|---|---|
| **P1** | `[CHECKBOX]` (réponses multiples) | Couvre 4 cas observés sur 8. Réduit la longueur de 30 %. |
| **P1** | Option `e. Non applicable` (Likert 5e branche optionnelle) | Couvre 3 cas observés. Élimine le bruit de réponse forcée. |
| **P2** | `[RADIO]` (choix unique non-Likert) | Couvre les questions de fréquence et de quantité. |
| **P3** | `[MATRIX]` (groupe de questions à échelle partagée) | Économique pour les blocs « Évalue chaque X ». Optionnel. |
| **P4** | Conditionnelles `[IF Q12 = a OR b]` | Utile pour les sections IA, jetons. À implémenter en dernier. |

### 2.3 Texte du prompt v2

Voici le prompt v2 à utiliser pour générer des questionnaires destinés à Labo Codex (à remplacer dans l'application si le parser est étendu en conséquence) :

```
Tu m'aides à créer un questionnaire de bilan réflexif de fin de trimestre,
à importer dans Labo Codex. Produis UNIQUEMENT du texte respectant le format
suivant, sans aucune autre prose autour.

== FORMAT ==

Première ligne (titre) :
=== BILAN RÉFLEXIF — <titre> ===

Pour chaque bloc thématique :
SECTION : <titre du bloc>

Quatre types de questions sont disponibles :

(A) Question Likert (échelle d'accord) — pas de balise, identifiée par
    la séquence des choix a-b-c-d :
1. <texte de la question>
a. Tout à fait d'accord
b. Plutôt d'accord
c. Plutôt en désaccord
d. Pas du tout d'accord

L'option « e. Non applicable » est autorisée à la fin de la séquence pour
les questions où certains répondants peuvent ne pas être concernés. Elle
est optionnelle.

(B) Question à choix unique non-Likert — préfixée par [RADIO] :
[RADIO]
2. <texte de la question>
a. <option 1>
b. <option 2>
c. <option 3>
d. <option 4>

Les options peuvent aller de a à h (4 à 8 options).

(C) Question à réponses multiples — préfixée par [CHECKBOX] :
[CHECKBOX]
3. <texte de la question>
a. <option 1>
b. <option 2>
c. <option 3>
d. <option 4>

Le répondant peut cocher zéro, une ou plusieurs options.

(D) Question ouverte (texte libre) — préfixée par [OUVERT] :
[OUVERT]
4. <texte de la question>

(La balise [OUVERT] est optionnelle pour la rétrocompatibilité ; une question
sans choix ni balise est traitée comme ouverte.)

Les questions sont séparées par une ligne vide. La numérotation suit l'ordre.

== CONTRAINTES STRICTES ==

- AUCUN paragraphe d'introduction, AUCUNE consigne pour l'élève, AUCUN séparateur (---).
- Pas de Markdown : pas de **gras**, pas de puces - , pas de # titres.
- Pas de matrice, pas de classement (à venir dans une version ultérieure).
- Une question = une seule ligne pour son énoncé.
- Tutoiement, registre étudiant·e collégial·e du Québec.
- Privilégier le bon type de question pour la donnée recherchée :
  * Likert pour mesurer un accord/désaccord sur un énoncé.
  * RADIO pour une caractéristique mutuellement exclusive non ordinale (parcours, fréquence par paliers).
  * CHECKBOX pour des caractéristiques cumulables (usages, qualificatifs).
  * OUVERT pour les justifications, conseils, surprises.
- Ne pas convertir en Likert ce qui est naturellement RADIO ou CHECKBOX.

== TÂCHE ==

Produis un questionnaire de bilan réflexif. Voici le contexte :
- Cours / niveau : [À COMPLÉTER]
- Thèmes à sonder : [À COMPLÉTER]
- Nombre de blocs souhaités : [À COMPLÉTER, ex. 4-6]
- Nombre approximatif de questions : [À COMPLÉTER, ex. 20-30]

Une fois prêt, je copierai ton output et l'importerai dans Labo Codex via
le bouton « Importer un questionnaire ».
```

### 2.4 Effet attendu sur le Bilan H2026

Avec le prompt v2 et le parser étendu, le Bilan H2026 redescendrait à environ **45-50 items**, avec :

- 1 question CHECKBOX pour le profil (au lieu de 5 Likerts)
- 1 question CHECKBOX pour la caractérisation des rétroactions (au lieu de 4 Likerts)
- 1 question CHECKBOX pour les concepts les plus utiles (au lieu de 8 Likerts) — avec une éventuelle question RADIO pour le moins utile
- 1 question CHECKBOX pour les usages spécifiques de l'IA (au lieu de 6 Likerts)
- 1 question RADIO pour la fréquence d'usage de l'IA (au lieu d'un Likert approximatif)
- Options « Non applicable » réintroduites sur jetons, manuel, ressources externes

Gain estimé : 15-20 items en moins, plus du temps gagné par les répondants (les CHECKBOX sont plus rapides qu'une série de Likerts), plus des données plus propres.

---

## 3. Cahier des charges pour Claude Code

### 3.1 Modules à modifier (à confirmer côté code)

Sans accès au code source, je ne peux pas pointer les fichiers exacts. À toi (Claude Code) de localiser :

- Le **parser** qui lit le texte importé via le bouton « Importer un questionnaire » (probablement dans un module type `questionnaire-parser.js`, `questionnaire-import.js`, ou intégré au module questionnaires de Labo Codex).
- Le **modèle de données** des questions (probablement une structure type `{type, text, options}` à étendre).
- Le **rendu** des questions côté élève (composants de présentation Likert, ouverte, à compléter pour CHECKBOX et RADIO).
- L'**agrégation** des réponses pour la consultation enseignante (statistiques par type de question).
- Le **prompt** stocké quelque part dans l'application (à remplacer par le v2 ci-dessus une fois le parser étendu).

### 3.2 Étapes recommandées

**Étape 1 — Étendre le modèle de données** :

Ajouter un champ `type` aux questions parsées, prenant les valeurs `likert4`, `likert4_na` (avec option Non applicable), `radio`, `checkbox`, `open`. Garder une valeur par défaut `likert4` pour la rétrocompatibilité.

**Étape 2 — Étendre le parser** :

Détecter les balises `[RADIO]`, `[CHECKBOX]`, `[OUVERT]` en début de bloc question. Détecter la 5e option `e. Non applicable` pour le type `likert4_na`. Conserver le comportement actuel quand aucune balise n'est présente (Likert si options a-d présentes, ouvert sinon).

**Étape 3 — Étendre le rendu** :

- `radio` : groupe de boutons radio, une seule sélection.
- `checkbox` : groupe de cases à cocher, sélections multiples permises.
- `likert4_na` : Likert 4 niveaux + une 5e option grisée ou séparée visuellement (« Non applicable »).
- Le rendu actuel des `likert4` et `open` reste inchangé.

**Étape 4 — Étendre l'agrégation** :

- Pour `radio` : distribution simple sur les options.
- Pour `checkbox` : taux de sélection de chaque option (et co-occurrences si pertinent).
- Pour `likert4_na` : compter les « Non applicable » séparément ; la moyenne d'accord se calcule sur les répondants concernés uniquement.

**Étape 5 — Mettre à jour le prompt stocké** :

Remplacer le prompt v1 par le prompt v2 (§2.3) une fois le parser étendu et testé.

**Étape 6 — Tester avec le Bilan H2026** :

Le fichier `Bilan reflexif H2026 - format Labo Codex.txt` (v1 actuelle) doit continuer à se parser correctement (rétrocompatibilité). Une nouvelle version v2 du même bilan, plus courte, doit pouvoir être générée et parsée sans perte.

### 3.3 Tests à prévoir

- Import d'un questionnaire v1 pur (format actuel) → doit parser sans erreur.
- Import d'un questionnaire v2 avec mélange des 4 types → doit parser correctement.
- Import d'un questionnaire malformé (balise inconnue, options manquantes) → doit afficher un message d'erreur précis pointant la ligne fautive.
- Rendu côté élève des 4 types → doit être visuellement distinct et accessible (clavier, lecteur d'écran).
- Agrégation des réponses → doit gérer les cas vides (aucune option cochée pour CHECKBOX, « Non applicable » pour likert4_na).

### 3.4 Hors scope (à reporter à une version ultérieure)

- Matrice (`[MATRIX]`) : à introduire seulement si le besoin se confirme à l'usage.
- Classement (`[RANK]`) : idem.
- Conditionnelles (`[IF Q12 = a OR b]`) : nécessite une logique de saut côté UI, plus complexe. À spécifier séparément.
- Migration des données existantes : si des questionnaires v1 sont déjà passés et stockés, vérifier qu'ils restent lisibles après l'extension du parser.

### 3.5 Question architecturale ouverte

Le format texte avec lignes vides comme séparateurs est lisible mais fragile (un espace en trop, un saut de ligne mal placé peut casser le parsing). Une alternative serait un format YAML ou JSON, plus robuste mais moins agréable à éditer manuellement.

**Recommandation** : conserver le format texte pour l'import manuel (priorité à la facilité d'écriture côté enseignant), mais ajouter un format JSON de sortie/sauvegarde pour les questionnaires une fois importés (priorité à la robustesse côté stockage). À discuter.

---

## 4. Limites assumées de cette spécification

- Je n'ai pas accès au code source de Labo Codex depuis cette session. Les noms de modules et la structure interne sont des hypothèses ; à toi (Claude Code) de les confirmer.
- Je n'ai pas accès à l'historique des questionnaires déjà passés dans Labo Codex. Si certains contiennent déjà des choix multiples gérés via une convention non documentée ici, ma proposition pourrait entrer en conflit. À vérifier.
- L'estimation « 45-50 items » pour le Bilan H2026 v2 est une projection basée sur la conversion en sens inverse. À confirmer après implémentation.
- Le prompt v2 proposé est rétrocompatible mais sa nouvelle syntaxe ([RADIO], [CHECKBOX]) repose sur des conventions ad hoc. Si Claude Code identifie une convention déjà en usage dans Labo Codex pour un autre besoin, il vaut mieux s'y aligner.

---

**Document à transmettre à Claude Code** dans une session avec accès au repo Labo Codex.
**Auteur de la pratique** : Grégoire Bédard.
**Date** : 3 mai 2026.
