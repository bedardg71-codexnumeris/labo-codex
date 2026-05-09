# Labo Codex — D'un tableur à un outil de suivi des apprentissages

**Octobre 2025 – Avril 2026**

---

## L'origine : un besoin pédagogique, pas un projet informatique

Labo Codex n'est pas né dans un département d'informatique. Il est né d'un tableur Numbers — un outil artisanal qu'un enseignant de littérature utilisait depuis l'hiver 2024 pour suivre, évaluation après évaluation, le développement des habiletés de ses étudiants.

Le problème était simple : les outils institutionnels permettent de consigner des notes, mais pas de comprendre comment un étudiant progresse. Où sont ses forces ? Ses fragilités récurrentes ? Quels critères sont consolidés, lesquels restent fragiles ? Pour répondre à ces questions, il fallait un outil conçu par quelqu'un qui les pose quotidiennement.

En août 2025, sans formation en programmation, Grégoire Bédard a commencé à transformer ce tableur en application web — en donnant des instructions en langage naturel à un assistant d'intelligence artificielle (Claude, d'Anthropic), qui écrivait le code correspondant.

Ce qui suit est l'histoire des sept mois qui ont transformé cette intuition en un outil fonctionnel, testé en classe, et prêt à être partagé.

---

## Octobre 2025 — Les fondations

La première semaine donne le ton : 77 modifications en une seule journée, le 25 octobre. L'application prend sa forme de base. Les données de chaque étudiant sont séparées par groupe-cours et par trimestre, ce qui permet à l'enseignant de gérer plusieurs groupes sans mélanger les informations. Un système de saisie des présences est mis en place. Les premières grilles d'évaluation descriptives apparaissent, exportables en PDF.

À la fin du mois, l'architecture est posée : chaque fonction de l'application vit dans son propre module, et chaque donnée n'existe qu'à un seul endroit. Ce principe — une seule source de vérité — sera maintenu rigoureusement par la suite. C'est ce qui rend l'outil fiable quand les données se multiplient.

**Ce que ça change pour l'enseignant** : il peut créer ses groupes, saisir ses présences et exporter des grilles. L'outil existe.

---

## Novembre–décembre 2025 — L'adaptation à la diversité des pratiques

Une enquête informelle auprès d'une dizaine d'enseignants de disciplines variées — mathématiques, chimie, biologie, littérature — révèle que chacun note autrement. Certains utilisent des pourcentages, d'autres des lettres, d'autres encore des échelles descriptives. Un outil qui impose une seule façon de faire serait inutilisable.

L'application s'adapte : les pratiques de notation deviennent configurables. L'enseignant décrit sa façon de noter, et l'outil s'ajuste sans qu'il ait besoin de toucher au code. Les indices de suivi (Apprentissage, Compétence, Progrès) commencent à calculer des portraits réels à partir des évaluations saisies. Les premiers graphiques de trajectoires apparaissent — des courbes qui montrent, pour chaque étudiant, l'évolution de ses indices au fil du trimestre.

En parallèle, un gros travail de nettoyage retire plus d'un million de lignes de code hérité de la maquette initiale. L'application passe d'un prototype fragile à une base solide.

**Ce que ça change pour l'enseignant** : l'outil respecte sa façon de noter. Les graphiques rendent visible ce qui était jusque-là enfoui dans des colonnes de chiffres.

---

## Janvier 2026 — L'outil entre en classe

C'est le mois où Labo Codex cesse d'être un projet personnel et devient un outil de travail. Le module Travaux permet d'importer les copies des étudiants (photos, PDF, fichiers), de les annoter directement au stylet sur iPad, et de les évaluer côte à côte avec la grille. L'enseignant peut corriger sans imprimer, sans post-it, sans aller-retour entre applications.

Un système d'import-export par fichier ZIP permet de transporter toutes ses données entre un MacBook et un iPad — ou de les sauvegarder. L'application fonctionne entièrement hors-ligne, sans serveur, sans compte à créer.

Un assistant de configuration est ajouté : à la première utilisation, l'outil pose quelques questions sur la pratique de notation de l'enseignant et se configure en conséquence.

**Ce que ça change pour l'enseignant** : il peut corriger, annoter et évaluer dans un seul endroit. Ses données voyagent avec lui.

---

## Février 2026 — Le mois le plus intense

Février est de loin le mois le plus intense : 178 heures, soit plus du quart de tout le travail réalisé depuis octobre. C'est le mois où l'outil prend sa dimension d'accompagnement pédagogique.

Le **dépistage SOLO** arrive : un système qui identifie automatiquement les étudiants dont le profil suggère des difficultés d'apprentissage, en croisant plusieurs indicateurs (résultats, progression, assiduité). L'enseignant reçoit un signal, pas un diagnostic — c'est à lui de valider et d'agir.

Le module **Réponse à l'intervention (RàI)** permet ensuite de documenter les interventions ciblées : quel étudiant, quel critère est visé, quel objectif mesurable, quel résultat. C'est un outil de suivi professionnel — l'enseignant peut démontrer ce qu'il a tenté et ce que ça a donné.

Une **carte mentale de planification** apparaît, permettant de visualiser l'alignement entre les objectifs du cours, les activités d'apprentissage et les évaluations. L'enseignant peut vérifier, d'un coup d'œil, que ce qu'il enseigne, ce qu'il fait faire et ce qu'il évalue sont cohérents.

Les profils étudiants deviennent dynamiques : forces, fragilités, portrait par critère, graphiques d'évolution — tout se met à jour en temps réel à mesure que les évaluations sont saisies.

**Ce que ça change pour l'enseignant** : il peut repérer les étudiants en difficulté plus tôt, documenter ses interventions, et vérifier la cohérence de son cours. L'outil passe du suivi passif à l'accompagnement actif.

---

## Mars 2026 — La consolidation

Pas de grandes nouveautés visibles ce mois-ci — et c'est volontaire. Un audit complet de l'application est mené pour renforcer la sécurité, la stabilité et la cohérence. La navigation est réorganisée pour être plus intuitive : cinq sections claires (Aperçu, Structure, Contexte, Suivi, Évaluations) remplacent l'ancienne structure qui avait grandi de façon organique.

L'aide intégrée est entièrement réécrite pour les nouveaux utilisateurs. Chaque section de l'application est documentée, avec un parcours guidé pour la prise en main.

La sécurité est renforcée : les données importées sont validées (taille, format, intégrité), les entrées utilisateur sont protégées contre l'injection de contenu malveillant. L'application respecte les standards modernes de sécurité web — un point important pour un éventuel déploiement institutionnel.

**Ce que ça change pour l'enseignant** : l'outil est plus facile à prendre en main, plus sûr, et prêt à être montré à d'autres.

---

## Avril 2026 — L'enrichissement

L'outil continue de s'affiner. Un nouveau système d'observation — les **Actions RLO** (Repérage, Liaison, Ouverture) — permet de poser des « tampons cognitifs » sur les productions des étudiants : l'enseignant marque les gestes intellectuels qu'il observe (repérer une information, faire un lien, ouvrir une perspective). Ces observations s'agrègent automatiquement en courbes d'évolution.

Les profils étudiants gagnent des onglets thématiques (critères, forces et défis, gestes cognitifs) pour réduire la surcharge d'information. Un outil de planification du rythme de travail aide l'enseignant à estimer la charge de son cours.

Le module d'interventions RàI est enrichi : formulaire unifié, critères ciblés directement depuis le dépistage, bilan avant/après pour mesurer l'effet de l'intervention.

**Ce que ça change pour l'enseignant** : l'observation des gestes cognitifs devient systématique, et les interventions sont mieux ciblées et mieux documentées.

---

## En chiffres

Sur sept mois de développement (octobre 2025 – avril 2026), Labo Codex représente environ **634 heures de travail**, réparties sur **145 jours actifs**. L'application compte aujourd'hui **35 modules** couvrant l'ensemble du cycle pédagogique : de la planification du cours jusqu'au suivi individualisé des apprentissages.

L'outil fonctionne entièrement hors-ligne, sur MacBook et iPad, sans compte ni serveur. Il est distribué sous licence libre (AGPL v3.0).

---

## Ce que Labo Codex rend possible

Labo Codex ne remplace pas le jugement de l'enseignant — il l'outille. En consolidant dans un seul endroit les évaluations, les observations, les interventions et les profils de progression, il rend visible ce qui reste habituellement dispersé dans des piles de copies, des fichiers Excel et la mémoire de l'enseignant.

Pour l'étudiant, cela signifie un accompagnement plus attentif : ses difficultés sont repérées plus tôt, les interventions sont documentées, sa progression est suivie sur la durée.

Pour l'enseignant, c'est un outil qui valorise son expertise pédagogique : ses observations, ses choix d'intervention, son évaluation fine des apprentissages deviennent traçables et partageables.

Pour l'institution, c'est une démonstration concrète de ce que l'intelligence artificielle peut apporter quand elle est mise au service d'un besoin réel, identifié par les praticiens eux-mêmes.

---

*Développé par Grégoire Bédard, enseignant en littérature au Cégep de Drummondville.*
*Codé avec Claude Code et Claude Cowork (Anthropic) · Licence AGPL v3.0*
