# Système de Monitorage Pédagogique
## Un outil pour accompagner TOUS les enseignants dans le suivi de leurs étudiants

---

## 🎯 En une phrase

**Monitorage** est une application web qui aide les enseignants à **identifier précocement les étudiants à risque** et à **planifier des interventions ciblées**, tout en respectant leur propre pratique d'évaluation.

---

## 💡 Le problème qu'on résout

### Ce que vivent les enseignants au quotidien :

**Vous vous reconnaissez peut-être dans ces situations :**

- 📊 **« J'ai 90 étudiants répartis dans 3 groupes... comment garder le fil ? »**
  - Difficile de repérer qui décroche quand on jongle entre plusieurs classes
  - On remarque souvent trop tard qu'un étudiant est en difficulté

- ⏰ **« Je n'ai pas le temps d'analyser les données de chaque étudiant »**
  - Compiler les présences, les travaux remis, les notes... ça prend des heures
  - On finit par se fier à son « intuition » plutôt qu'aux données réelles

- 🤔 **« Comment savoir QUI a vraiment besoin d'aide en PRIORITÉ ? »**
  - Certains étudiants sont discrets mais en difficulté
  - D'autres sont absents mais réussissent quand même
  - Impossible de tout garder en tête

- 📝 **« Mes outils actuels (Excel, papier, tête) ne me suivent plus »**
  - Données éparpillées (présences sur papier, notes dans Excel, plan RàI ailleurs)
  - Aucune vue d'ensemble pour prendre des décisions éclairées

### Ce que l'application fait pour vous :

✅ **Centralise toutes vos données** en un seul endroit (présences, évaluations, interventions)

✅ **Calcule automatiquement des indices prédictifs** qui vous disent QUI surveiller en priorité

✅ **Génère des recommandations d'intervention** adaptées à chaque étudiant

✅ **Fonctionne hors-ligne** : vos données restent sur votre ordinateur, rien dans le cloud

✅ **S'adapte à VOTRE pratique** : évaluation traditionnelle OU pratique alternative (PAN)

---

## 🧠 Les fondements pédagogiques (expliqués simplement)

### L'idée centrale : le triangle A-C-P

L'application s'appuie sur **3 indices simples** qui, combinés, prédisent le risque d'échec :

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│    A = ASSIDUITÉ                                    │
│    « Est-ce que l'étudiant vient en classe ? »     │
│                                                     │
│    C = COMPLÉTION                                   │
│    « Est-ce qu'il remet ses travaux ? »            │
│                                                     │
│    P = PERFORMANCE                                  │
│    « Est-ce qu'il réussit ses évaluations ? »      │
│                                                     │
│    E = ENGAGEMENT (A × C × P)                       │
│    « Quel est son niveau d'engagement global ? »    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Pourquoi c'est puissant ?**

- **Assiduité faible** → L'étudiant rate des contenus essentiels
- **Complétion faible** → L'étudiant ne pratique pas, ne développe pas ses habiletés
- **Performance faible** → L'étudiant ne maîtrise pas les compétences

**Quand les 3 sont bas, le risque d'échec est très élevé.**

L'application calcule ces indices **automatiquement** à partir de vos données, et vous dit : *« Voici les 5 étudiants qui ont besoin d'aide MAINTENANT »*.

### Mais ce n'est pas juste une « note » !

L'application vous aide aussi à **comprendre le profil** de chaque étudiant :

| Profil | A | C | P | Qu'est-ce que ça signifie ? | Intervention recommandée |
|--------|---|---|---|----------------------------|--------------------------|
| **L'étudiant modèle** | 95% | 100% | 85% | Présent, remet tout, réussit bien | Niveau 1 : Suivi régulier |
| **Le brillant absent** | 60% | 80% | 90% | Absent souvent, mais réussit | Niveau 2 : Discussion sur assiduité |
| **Le travaillant en difficulté** | 100% | 100% | 55% | Présent, remet tout, mais échoue | Niveau 2 : Soutien pédagogique ciblé |
| **Le décrocheur silencieux** | 70% | 40% | 50% | De moins en moins présent/engagé | Niveau 3 : Intervention intensive |
| **L'étudiant à risque élevé** | 50% | 30% | 40% | Absences fréquentes, ne remet rien | Niveau 3 : Rencontre urgente |

**L'application identifie ces profils automatiquement** et vous suggère le niveau d'intervention approprié.

---

## 🛠️ Comment ça fonctionne concrètement ?

### 1️⃣ Configuration initiale (15 minutes, une fois par session)

**Ce que vous faites :**
- Vous créez votre cours (nom, session, pondération)
- Vous importez votre liste d'étudiants (Excel, CSV ou saisie manuelle)
- Vous configurez votre trimestre (dates de début/fin, congés)
- Vous définissez votre horaire de cours

**Résultat :** L'application est prête à recevoir vos données.

---

### 2️⃣ Utilisation hebdomadaire (10-15 minutes/semaine)

#### A. Saisir les présences (2-3 minutes)
- Vous cochez « Présent », « Absent » ou « Retard » pour chaque étudiant
- L'application calcule automatiquement l'indice A (Assiduité)

#### B. Saisir les évaluations (5-10 minutes par évaluation)
- Vous créez une évaluation (titre, pondération, grille de critères)
- Vous saisissez les notes ou niveaux de performance
- L'application calcule automatiquement les indices C (Complétion) et P (Performance)

#### C. Consulter le tableau de bord (2 minutes)
- Vous voyez en un coup d'œil **qui va bien** et **qui a besoin d'aide**
- Vous identifiez les étudiants à surveiller (codes couleur)
- Vous planifiez vos interventions RàI (Réponse à l'Intervention)

---

### 3️⃣ Suivi individuel (5 minutes par étudiant au besoin)

Quand vous voulez comprendre **en profondeur** la situation d'un étudiant :

**Vous ouvrez son profil** et vous voyez :

1. **Section Engagement** : Ses indices A-C-P et son niveau de risque
   - Graphique visuel (très clair, codes couleur)
   - Recommandations d'intervention (Niveau 1, 2 ou 3)

2. **Section Performance** : Ses forces et défis par critère
   - Exemple : « Fort en Rigueur (85%), mais faible en Nuance (45%) »
   - Vous savez exactement **où** concentrer votre aide

3. **Section Mobilisation** : Historique de ses absences et travaux remis
   - Vous voyez les patterns (« absences récentes », « a cessé de remettre depuis la semaine 7 »)

4. **Section Accompagnement** : Historique des interventions passées
   - Vous documentez vos rencontres, vos suivis
   - Vous attribuez des jetons (délai, reprise, aide)

**Résultat :** En 5 minutes, vous avez une vue complète et vous savez **quoi faire**.

---

## 🎓 Deux modes pour DEUX pratiques d'évaluation

### Mode « Sommative » (évaluation traditionnelle)

**Pour qui ?** Enseignants qui utilisent la notation classique (examens, travaux, moyenne pondérée).

**Ce que l'application calcule :**
- Moyenne pondérée de toutes les évaluations
- Complétion = % de travaux remis
- Performance = moyenne des notes obtenues

**Exemple d'utilisation typique :**
- Vous créez vos évaluations : Examen 1 (30%), Travail 1 (20%), Quiz (10%), etc.
- Vous saisissez les notes : 75%, 82%, 90%, etc.
- L'application calcule la moyenne pondérée et identifie les étudiants sous 60%

---

### Mode « PAN-Maîtrise » (pratique alternative)

**Pour qui ?** Enseignants qui utilisent une approche par **portfolio** et **niveaux de maîtrise** (au lieu de notes chiffrées).

**Ce que l'application permet :**
- Évaluer selon une **échelle qualitative** (Insuffisant, Développement, Maîtrisé, Étendu)
- Sélectionner les **meilleurs artefacts** pour le calcul (ex : 3, 7 ou 12 meilleurs)
- Utiliser une **grille de critères** personnalisée (ex : Structure, Rigueur, Plausibilité, Nuance, Français)

**Exemple d'utilisation typique :**
- Vous créez 12 artefacts portfolio dans la session (descriptions, analyses, réflexions)
- Vous évaluez avec une échelle IDME (Insuffisant, Développement, Maîtrisé, Étendu)
- L'application retient les **7 meilleurs artefacts** pour calculer la performance finale

**Avantage :** Reflète mieux la **progression** de l'étudiant (on garde ses meilleures productions, pas ses échecs initiaux).

---

### Mode « Comparatif » (pour les curieux !)

**Pour qui ?** Enseignants qui veulent **expérimenter** et comparer les deux approches.

**Ce que l'application fait :**
- Calcule SIMULTANÉMENT les indices selon les deux pratiques (Sommative ET PAN)
- Affiche les deux résultats côte à côte (ex : « Sommative 67% vs PAN 82% »)
- Vous permet de voir si les deux approches donnent des diagnostics différents

**Cas d'usage :**
- Vous voulez essayer une pratique alternative sans abandonner votre notation traditionnelle
- Vous voulez voir si certains étudiants « réussissent mieux » avec une approche qu'avec l'autre
- Vous êtes en transition pédagogique et vous explorez

---

## ✨ Les fonctionnalités qui font la différence

### 🎯 Détection précoce des patterns

L'application ne se contente pas de dire « cet étudiant a 55% ». Elle identifie des **patterns** :

- **« Stable »** : Aucun critère en difficulté, tout va bien
- **« Difficulté émergente »** : Commence à baisser sur 1-2 critères récemment
- **« Défi persistant »** : Faible sur plusieurs critères, situation stable mais préoccupante
- **« Blocage émergent »** : Assiduité et complétion OK, mais performance en chute
- **« Blocage critique »** : Tout baisse en même temps, risque d'échec très élevé

**Résultat :** Vous intervenez **avant** que ça devienne catastrophique.

---

### 🎭 Mode Anonymisation

**Pour quoi faire ?**
Vous voulez montrer votre tableau de bord à un collègue, ou faire une présentation publique, sans révéler l'identité de vos étudiants.

**Comment ça marche ?**
- Un simple clic : vous passez en mode « Anonymisation »
- Tous les noms deviennent « Élève 1 », « Élève 2 », etc.
- Les numéros DA sont masqués
- Les groupes sont préfixés « AN. » (pour « ANonyme »)
- Les données restent les mêmes, seule l'identité est cachée

**Résultat :** Vous pouvez partager vos analyses sans violer la confidentialité.

---

### 🎁 Système de jetons

**Qu'est-ce que c'est ?**
Des « permissions spéciales » que vous pouvez accorder à certains étudiants (délai, reprise, aide).

**Exemples d'utilisation :**
- **Jeton de délai** : L'étudiant peut remettre un travail en retard sans pénalité
- **Jeton de reprise** : L'étudiant peut refaire une évaluation (la meilleure note compte)
- **Jeton d'aide** : L'étudiant bénéficie d'un accompagnement (tutorat, rencontre)
- **Jeton bonus** : Reconnaissance d'un effort exceptionnel

**Pourquoi c'est utile ?**
- Vous respectez l'équité (vous définissez combien chaque étudiant peut utiliser)
- Vous documentez vos interventions (historique des jetons attribués)
- Vous responsabilisez l'étudiant (« Tu as 2 jetons de délai pour la session, utilise-les judicieusement »)

---

### 📊 Visualisations intuitives

**Au lieu de tableaux de chiffres**, l'application vous montre :

- **Barres de distribution** : Vous voyez d'un coup d'œil où se situent vos étudiants (nuages de points avec gradients de couleur)
- **Échelle de risque** : Gradient visuel de 6 niveaux (vert foncé → rouge foncé)
- **Recommandations RàI** : 3 niveaux clairement identifiés (Universel, Préventif, Intensif)

**Résultat :** Moins de temps à analyser, plus de temps à agir.

---

### 📥 Import/Export des données

**Vous ne perdez rien :**
- Export JSON de toutes vos données (backup complet)
- Export CSV/Excel pour analyses externes
- Import depuis Excel (liste d'étudiants, notes)
- Partage de ressources pédagogiques (grilles, cartouches) avec des collègues

**Résultat :** Vos données restent VÔTRES, vous les contrôlez.

---

## 🚀 Pourquoi cette application peut vous aider (VOUS, personnellement)

### Si vous êtes **novice en pédagogie** :

✅ **L'application vous guide pas à pas**
- Vous n'avez pas besoin de connaître la taxonomie SOLO ou l'échelle IDME
- Vous utilisez simplement les fonctions de base (présences, notes)
- L'application fait les calculs et vous dit **quoi surveiller**

✅ **Vous apprenez en utilisant**
- Au fil du temps, vous découvrez pourquoi certains étudiants réussissent et d'autres non
- Vous comprenez mieux les **liens** entre assiduité, engagement et performance
- Vous développez votre « œil pédagogique » avec le support des données

**Exemple concret :**
> « Au début, je saisissais juste les présences et les notes. Puis j'ai remarqué que l'application me disait toujours d'intervenir auprès des mêmes 3-4 étudiants. En creusant, j'ai compris qu'ils avaient tous le même pattern : présents, mais ils ne remettaient rien. Ça m'a fait réaliser que j'avais un problème de clarté dans mes consignes de travaux. J'ai ajusté, et leur complétion a remonté. »

---

### Si vous êtes **expérimenté en pédagogie** :

✅ **L'application systématise ce que vous faisiez déjà « dans votre tête »**
- Vous avez toujours su repérer les étudiants à risque, mais c'était intuitif
- Maintenant vous avez des **données objectives** pour confirmer (ou infirmer) vos intuitions
- Vous pouvez **documenter** vos interventions et en mesurer l'impact

✅ **Vous gagnez du temps sur l'administratif**
- Plus besoin de compiler manuellement dans Excel
- Plus besoin de chercher « où en est cet étudiant ? » : son profil vous dit TOUT
- Vous passez moins de temps à analyser, plus de temps à ACCOMPAGNER

**Exemple concret :**
> « Avant, je savais intuitivement que Sarah avait besoin d'aide. Mais je ne savais pas exactement POURQUOI ni PAR OÙ commencer. L'application m'a montré qu'elle était excellente en Structure et Rigueur, mais très faible en Nuance. J'ai pu cibler mon accompagnement sur le développement de son raisonnement critique, au lieu de faire du "tutorat général". Résultat : elle a progressé rapidement sur CE critère spécifique. »

---

### Si vous êtes **en transition pédagogique** (ex : vous explorez le PAN) :

✅ **L'application vous permet d'expérimenter SANS RISQUE**
- Mode comparatif : vous calculez les deux (Sommative ET PAN) en parallèle
- Vous voyez les différences concrètes dans les diagnostics
- Vous prenez des décisions éclairées (« Est-ce que cette approche me convient vraiment ? »)

✅ **Vous n'êtes pas seul dans votre démarche**
- La documentation intégrée explique les fondements pédagogiques
- Les exemples concrets vous montrent comment d'autres enseignants l'utilisent
- La communauté (AQPC, Teams) peut vous soutenir

**Exemple concret :**
> « Je voulais essayer le PAN-Maîtrise, mais j'avais peur d'abandonner complètement mes examens traditionnels. Le mode comparatif m'a permis de faire les deux pendant une session. J'ai réalisé que certains étudiants "réussissaient mieux" en PAN (leur portfolio montrait des compétences que les examens ne captaient pas). Ça m'a convaincu de basculer progressivement, mais en gardant quelques évaluations sommatives pour rassurer les étudiants (et moi !) pendant la transition. »

---

## 🌟 Ce que l'application N'EST PAS

### ❌ Ce n'est PAS un système de gestion de notes « intelligent » qui évalue à votre place

**L'application ne note PAS vos étudiants.**
Vous restez le seul juge de la qualité du travail. L'outil **organise** vos évaluations et **calcule** les indices, c'est tout.

---

### ❌ Ce n'est PAS un outil qui « prédit l'échec avec certitude »

**Les indices A-C-P sont des INDICATEURS, pas des certitudes.**
Un étudiant avec E = 40% PEUT réussir s'il se ressaisit. L'objectif est de vous alerter TÔT pour que vous puissiez intervenir et **faire mentir la prédiction**.

**Philosophie :** *« L'objectif du monitorage pédagogique est de faire mentir les prédictions de risque par nos interventions proactives. »*

---

### ❌ Ce n'est PAS un outil « clé en main » qui fonctionne sans réflexion pédagogique

**Vous devez toujours exercer votre jugement professionnel.**
L'application vous dit « cet étudiant a besoin d'aide », mais c'est VOUS qui décidez :
- Quel type d'intervention (rencontre, tutorat, référence au centre d'aide)
- Quand intervenir (maintenant ou après la prochaine évaluation)
- Comment aborder l'étudiant (motivationnel, méthodologique, référence)

L'outil **augmente** votre capacité d'intervention, il ne la **remplace** pas.

---

## 🛡️ Confidentialité et sécurité

### Vos données restent CHEZ VOUS

✅ **Aucune connexion Internet requise** : L'application fonctionne 100% hors-ligne

✅ **Aucune donnée envoyée dans le cloud** : Tout est stocké localement sur votre ordinateur (localStorage du navigateur)

✅ **Aucun compte à créer** : Pas de login, pas de mot de passe, pas de serveur distant

✅ **Vous contrôlez vos exports** : Vous décidez quoi exporter, quand, et avec qui le partager

**Limite à connaître :** Si vous effacez le cache de votre navigateur, vous perdez vos données. **Solution :** Exportez régulièrement en JSON (backup).

---

## 📚 Ressources pour bien démarrer

### 1. Documentation intégrée (dans l'application)

Section **« Aide »** accessible depuis le menu de navigation :
- Introduction au monitorage
- Guide de configuration (trimestre, horaire, groupe)
- Guide d'utilisation hebdomadaire (présences, évaluations)
- Guide de consultation (profil étudiant, tableau de bord)
- Glossaire des termes (A-C-P-E, RàI, IDME, etc.)
- FAQ (30+ questions)

### 2. Données de démonstration

Fichier `donnees-demo.json` inclus :
- 30 étudiants fictifs (noms québécois + multiculturels)
- 23 séances de cours avec présences saisies
- 5 artefacts portfolio évalués avec critères SRPNF
- Données réalistes (absences, retards, notes variées)

**Utilité :** Vous pouvez explorer TOUTES les fonctionnalités sans avoir à tout configurer.

### 3. Guide testeurs

Fichier `GUIDE_TESTEURS.md` :
- Scénarios de test (15-30-60 minutes)
- Explication des fonctionnalités principales
- Comment faire vos retours

### 4. Communauté et support

**Équipe Teams** « Labo Codex » (à venir) :
- Canal #discussions-pédagogiques : Échanges entre enseignants
- Canal #tests-beta : Rapports de bugs et suggestions
- Canal #documentation : Guides, tutoriels, vidéos

**Contact :** labo@codexnumeris.org

---

## 🎯 Cas d'usage concrets

### Cas 1 : L'enseignant débordé (90 étudiants, 3 groupes)

**Problème :**
« J'ai tellement d'étudiants que je ne sais plus qui est qui. Je me fie à mon impression générale, mais je rate sûrement des signaux. »

**Comment l'application aide :**
- **Tableau de bord global** : Vous voyez les 90 étudiants en un coup d'œil, triés par niveau de risque
- **Alertes visuelles** : Les étudiants à surveiller sont surlignés (codes couleur)
- **Profils individuels** : 2 clics pour avoir TOUTE l'information sur un étudiant
- **Gain de temps** : 10 minutes/semaine pour saisir les données, vs 2-3 heures pour compiler manuellement

**Résultat :** Vous gardez le contrôle, même avec beaucoup d'étudiants.

---

### Cas 2 : L'enseignant qui veut mieux comprendre ses étudiants

**Problème :**
« Je vois qu'ils échouent, mais je ne comprends pas POURQUOI. C'est la pédagogie ? La matière ? Leur motivation ? »

**Comment l'application aide :**
- **Décomposition par critère** : Vous voyez exactement OÙ ils échouent (ex : « faible en Nuance, fort en Structure »)
- **Historique longitudinal** : Vous voyez l'ÉVOLUTION (« il a progressé en Rigueur, mais stagné en Français »)
- **Patterns** : L'application identifie les profils (« Décrocheur silencieux », « Travaillant en difficulté »)

**Résultat :** Vous comprenez mieux vos étudiants, vous ajustez vos interventions.

---

### Cas 3 : L'enseignant qui explore une pratique alternative (PAN)

**Problème :**
« Je veux essayer le portfolio et l'évaluation par niveaux de maîtrise, mais je ne sais pas par où commencer. »

**Comment l'application aide :**
- **Mode PAN-Maîtrise** : Structure prête (artefacts, échelle IDME, grille SRPNF)
- **Mode comparatif** : Vous gardez vos examens traditionnels en parallèle (sécurité)
- **Documentation pédagogique** : Explications des fondements (SOLO, IDME)
- **Communauté AQPC** : 387 membres qui expérimentent, vous n'êtes pas seul

**Résultat :** Vous expérimentez avec confiance, vous avez un filet de sécurité.

---

### Cas 4 : L'enseignant en démarche RàI (Réponse à l'Intervention)

**Problème :**
« Mon cégep veut qu'on fasse du RàI, mais je ne sais pas comment identifier les niveaux 1-2-3. »

**Comment l'application aide :**
- **Calcul automatique des niveaux RàI** : Basé sur l'indice E (Engagement = A × C × P)
  - Niveau 1 (Universel) : E ≥ 55% → Suivi régulier en classe
  - Niveau 2 (Préventif) : 35% ≤ E < 55% → Interventions préventives
  - Niveau 3 (Intensif) : E < 35% → Interventions intensives individuelles
- **Planification des interventions** : Vous documentez vos rencontres, suivis, jetons
- **Historique complet** : Vous pouvez prouver vos interventions (pour la direction, pour le dossier étudiant)

**Résultat :** Vous remplissez vos obligations institutionnelles TOUT EN aidant vraiment vos étudiants.

---

## 📈 Vision et évolution

### Où en sommes-nous ? (Version Beta 90.5 - Novembre 2025)

✅ **Fonctionnalités de base stabilisées** :
- Gestion multi-groupes (jusqu'à 10-15 groupes simultanés)
- Deux pratiques implémentées (Sommative et PAN-Maîtrise)
- Système de jetons personnalisés
- Visualisations avancées (nuages de points, gradients)
- Mode anonymisation complet
- RàI optionnel et configurable

✅ **Testé par 20+ enseignants** sur 2 ans de développement

⚠️ **Limites actuelles** :
- Stockage local uniquement (pas de synchronisation multi-appareils)
- Interface en français uniquement
- Données de démo pour expérimenter, mais vous devez créer vos propres groupes

---

### Où allons-nous ? (Version 1.0 - Juin 2026)

🎯 **Objectif** : Lancement public au Colloque AQPC (juin 2026)

**Améliorations prévues** :
- Migration vers IndexedDB (meilleure performance, support 300+ étudiants)
- Export PDF des profils étudiants (pour rencontres, dossiers)
- Templates de grilles partagées (bibliothèque communautaire)
- Tutoriels vidéo (10-15 vidéos de 3-5 minutes)
- Support multi-sessions (suivi longitudinal sur plusieurs trimestres)

**Et après ?** (Version 1.1-2.0)
- Autres pratiques PAN (Spécifications, Dénotation) si demande réelle
- Analyses prédictives avancées (machine learning)
- Synchronisation cloud optionnelle (pour ceux qui le souhaitent)
- Application mobile (consultation des profils sur tablette)

**Principe directeur :** *Implémenter UNIQUEMENT ce que la communauté utilise réellement.* Qualité > Quantité.

---

## 🤝 Rejoindre la communauté

### Vous voulez participer ?

**Plusieurs façons de contribuer** (selon votre disponibilité et compétences) :

#### 🧪 **Testeur** (2-5 heures/mois)
- Utiliser l'application avec vos groupes réels
- Rapporter les bugs et suggestions
- Valider les nouvelles fonctionnalités avant leur sortie

#### 📝 **Documenteur** (3-10 heures/mois)
- Rédiger des guides utilisateurs
- Créer des tutoriels vidéo
- Traduire la documentation

#### 🎓 **Ambassadeur** (1-3 heures/mois)
- Promouvoir l'outil dans votre cégep
- Organiser des sessions de démo locales
- Répondre aux questions de vos collègues

#### 💻 **Développeur** (5-20 heures/mois, compétences techniques requises)
- Implémenter de nouvelles fonctionnalités
- Corriger des bugs
- Améliorer l'architecture

**Comment s'impliquer ?**
1. Présentation le **19 novembre 2025** devant la communauté PAN de l'AQPC (387 membres)
2. Sondage de recrutement après la présentation
3. Intégration à l'équipe Teams « Labo Codex »

**Contact :** labo@codexnumeris.org

---

## 💬 Questions fréquentes

### « Combien de temps ça prend pour apprendre à l'utiliser ? »

**Exploration initiale** : 10-15 minutes avec les données de démo
**Configuration pour votre cours** : 15-30 minutes la première fois
**Utilisation hebdomadaire** : 10-15 minutes (saisie présences + évaluations)

**Courbe d'apprentissage** : Très douce. Si vous savez utiliser Excel, vous saurez utiliser Monitorage.

---

### « Est-ce que je peux l'utiliser sur iPad ? »

**Oui !** L'application fonctionne dans Safari sur iPad (et tous les navigateurs modernes).

L'interface s'adapte à la taille de l'écran (responsive design).

---

### « Mes données sont-elles en sécurité ? »

**Oui, vos données restent SUR votre appareil** (localStorage du navigateur).

**Rien n'est envoyé sur Internet.** Même si vous n'avez pas de connexion, l'application fonctionne.

**Limite** : Si vous effacez le cache de votre navigateur, vos données sont perdues.
**Solution** : Exportez régulièrement en JSON (fichier de backup sur votre ordinateur).

---

### « Puis-je utiliser l'application sans connaître les fondements pédagogiques (SOLO, IDME, SRPNF) ? »

**Absolument !** Vous pouvez utiliser le mode Sommative (évaluation traditionnelle) sans rien connaître de ces théories.

L'application calcule simplement vos moyennes pondérées et vous dit qui est en difficulté.

**Par contre**, si vous voulez approfondir votre pratique pédagogique, la documentation intégrée explique ces concepts de façon accessible.

---

### « Ça remplace-t-il Moodle / Omnivox / Léa ? »

**Non, c'est COMPLÉMENTAIRE.**

- **Moodle/Omnivox/Léa** : Gestion des cours, dépôt de travaux, communication avec étudiants
- **Monitorage** : Analyse des données pédagogiques, détection précoce, planification d'interventions

**Cas d'usage typique :**
- Vous utilisez Léa pour que les étudiants déposent leurs travaux
- Vous exportez les notes de Léa en Excel
- Vous importez ces notes dans Monitorage
- Monitorage calcule les indices A-C-P et vous dit qui surveiller

---

### « C'est gratuit ? »

**Oui, l'application est gratuite et open source.**

**Licences :**
- Code source : AGPL v3 (libre, gratuit, modifiable)
- Contenu pédagogique : CC BY-NC-SA 4.0 (libre, gratuit, non commercial)

**Vous pouvez :**
- Utiliser gratuitement
- Modifier le code pour vos besoins
- Partager avec vos collègues

**Vous ne pouvez PAS :**
- Vendre l'application
- Retirer les crédits de l'auteur

---

### « Qui développe cette application ? »

**Créateur principal :** Grégoire Bédard, enseignant en Sciences humaines au Cégep de Sherbrooke.

**Motivation :** 5 ans d'expérimentation pédagogique avec la PAN-Maîtrise, besoin d'un outil pour gérer le suivi de 90 étudiants avec une approche portfolio.

**Aucun outil existant ne répondait aux besoins**, donc création de Monitorage.

**Développement collaboratif :** Communauté de testeurs et contributeurs (recrutement prévu novembre 2025).

---

## 🎓 En résumé

### Monitorage, c'est :

✅ Un **outil de suivi pédagogique** qui centralise vos données (présences, évaluations, interventions)

✅ Un **système d'alerte précoce** qui vous dit QUI a besoin d'aide, MAINTENANT

✅ Un **support à votre jugement professionnel** (pas un remplacement !)

✅ Un **outil adaptable** à VOTRE pratique (sommative OU alternative)

✅ Un **projet ouvert** porté par la communauté enseignante

---

### Monitorage, ce n'est PAS :

❌ Un système qui évalue à votre place

❌ Un outil « magique » qui prédit l'échec avec certitude

❌ Un remplacement de votre plateforme de cours (Moodle, Léa, Omnivox)

❌ Un produit commercial ou propriétaire

---

### Le message principal :

**« L'objectif du monitorage pédagogique est de faire mentir les prédictions de risque par nos interventions proactives. »**

L'application ne vous dit pas « cet étudiant va échouer, tant pis ».

Elle vous dit « **cet étudiant est À RISQUE, voici ce que vous pouvez faire MAINTENANT pour l'aider** ».

C'est un outil d'**espoir** et d'**action**, pas de fatalisme.

---

## 🚀 Prochaines étapes

### Vous voulez essayer ?

1. **Téléchargez** le package Beta 90.5 (disponible novembre 2025)
2. **Importez** les données de démonstration (2 minutes)
3. **Explorez** pendant 15-30 minutes
4. **Décidez** si ça peut vous aider dans VOTRE contexte

### Vous voulez en savoir plus ?

- **Présentation publique** : 19 novembre 2025, Communauté PAN de l'AQPC
- **Documentation complète** : Section « Aide » dans l'application
- **Contact** : labo@codexnumeris.org
- **Site web** : https://codexnumeris.org

---

**Merci de votre intérêt !** 🙏

Nous espérons que Monitorage pourra vous aider à mieux accompagner vos étudiants, peu importe votre niveau d'expertise pédagogique.

**Parce que tous les enseignants méritent des outils qui les soutiennent dans leur mission.**

---

**Document créé le :** 17 novembre 2025
**Version :** 1.0
**Auteur :** Grégoire Bédard (avec Claude Code)
**Licence :** CC BY-NC-SA 4.0
