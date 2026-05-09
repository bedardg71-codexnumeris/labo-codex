# Lot T8 — Info-bulles Tableau de bord — Liste, profil, interventions

**Statut** : Validé (19 avril 2026)  
**Charte de référence** : `plans de travail/PLAN-REFONTE-TEXTES-ACCOMPAGNEMENT.md`, section 1  
**Source des textes actuels** : `docs/AUDIT-TEXTES-AIDE.md`, Partie A  
**Fichier cible** : `js/tooltips-contenu.js`

---

## Liste des individus

| Clé | Texte réécrit |
|-----|---------------|
| `liste-titre` | Liste complète des étudiant·es avec indices A-C-P, patterns et niveaux RàI. Filtrable et triable. |
| `liste-filtres` | Filtre par groupe, programme, niveau RàI ou pattern. Le champ de recherche accepte nom, prénom ou DA. |
| `liste-filtre-rai` | Filtre par niveau d'intervention : Tous, Niveau 1 (universel), Niveau 2 (préventif), Niveau 3 (intensif). |
| `liste-filtre-pattern` | Filtre par trajectoire détectée : progression stable, défi spécifique, difficulté émergente ou persistante. |
| `liste-recherche` | Recherche un·e étudiant·e par nom, prénom ou numéro d'admission (DA). |
| `liste-col-sa` | Services adaptés. Une coche indique que l'étudiant·e bénéficie d'un plan de services. |
| `liste-col-interv` | Interventions documentées pour cet·te étudiant·e. Clique pour consulter l'historique. |

## Profil étudiant·e

| Clé | Texte réécrit |
|-----|---------------|
| `profil-selecteur` | Choisis un·e étudiant·e. Les boutons Préc./Suiv. parcourent la liste séquentiellement. |
| `profil-nav-observations` | Sept vues d'observation : productions, mobilisation, progression, habiletés, accompagnement, travaux, rapport. |
| `profil-productions` | Liste des productions avec description, jeton, note, date et accès direct à l'évaluation. |
| `profil-col-jeton` | Jeton de reprise : permet à l'étudiant·e de reprendre une production pour démontrer à nouveau sa compétence ou son habileté. |
| `profil-mobilisation` | Vue d'ensemble des composantes A et C : présence en classe et remise des travaux. Indique comment l'étudiant·e se mobilise dans le cours. |
| `profil-progression` | Évolution des indices A-C-P au fil des semaines. Marqueurs : ○ artefact dû, ● jeton appliqué, ▼ intervention RàI. Zones : Insuffisant, en Développement, Maîtrisé, Étendu. |
| `profil-habiletes` | Graphique d'évolution des critères ou habiletés (si évaluations avec détails). Marqueurs : ● jeton, ▼ intervention. Forces et défis par critère. |
| `profil-accompagnement` | Analyse RàI, contexte d'apprentissage, structure SOLO et historique des interventions. |
| `profil-accomp-contexte` | Assiduité et complétion de l'étudiant·e. Interprétation du contexte d'apprentissage après les premières remises. |
| `profil-accomp-rai` | Performance globale et progression par critère. Détermine le niveau d'intervention suggéré. |
| `profil-accomp-solo` | Analyse des réponses selon la taxonomie SOLO (Biggs & Collis). Identifie les forces et les défis structurels. |
| `profil-historique` | Interventions RàI documentées pour cet·te étudiant·e. Crée une nouvelle intervention depuis le profil. |
| `profil-travaux` | Travaux soumis par l'étudiant·e. Les fichiers sont importés depuis Travaux > Import. |
| `profil-rapport` | Rapport textuel configurable. Coche les sections à inclure et copie dans le presse-papier. |
| `profil-rapport-sections` | Coche les sections souhaitées : Identification, Assiduité, Complétion, Performance, Jetons, Date. |

## Données confidentielles

| Clé | Texte réécrit |
|-----|---------------|
| `profil-confidentiel` | Données confidentielles stockées localement : parcours, défis, portrait spécifique, diagnostic, notes. |
| `profil-conf-parcours` | ÉPGC (étudiant·e de première génération au cégep) et historique du cours antérieur (ces données sont facultatives). |
| `profil-conf-lecteur` | Évaluation des compétences de lecture : structure, rigueur, plausibilité, nuance, français (SRPN/F). |
| `profil-conf-diagnostic` | Services adaptés, catégorie et sous-catégorie du diagnostic. Confidentiel. |

## Interventions RàI

| Clé | Texte réécrit |
|-----|---------------|
| `interv-titre` | Planification et suivi des interventions RàI de niveaux 2 et 3. Crée, consulte et documente. |
| `interv-btn-planifier` | Crée une nouvelle intervention de niveau 2 (préventif) ou 3 (intensif) pour un groupe ou un individu. |
| `interv-carte` | Fiche d'une intervention : statut, niveau, aperçu du sous-groupe (patterns, RàI, notes individuelles). |
| `interv-apercu-sous-groupe` | Agrégation des profils du sous-groupe : patterns d'apprentissage, niveaux RàI et notes individuelles. |
| `interv-criteres-cibles` | Critères de la grille de dépistage ciblés par l'intervention. Précochés selon les défis communs du sous-groupe. Le compteur montre combien d'étudiant·es sont en défi pour chaque critère. |
| `interv-objectif-vise` | Objectif mesurable de l'intervention. La suggestion est basée sur le critère ciblé le plus faible et le prochain seuil IDME atteignable. |
| `interv-niveaux-rai` | Répartition des niveaux RàI (1, 2, 3) dans le sous-groupe ciblé par l'intervention. |
| `interv-patterns` | Répartition des patterns détectés dans le sous-groupe ciblé par l'intervention. |
| `interv-notes-individuelles` | Tes observations pour chaque étudiant·e lors de l'intervention. |
| `interv-presences-notes` | Coche les présent·es et documente tes observations individuelles. Le badge indique le niveau RàI. |
| `interv-gestion-absences` | Lie l'intervention à une séance. Les absences sont motivées automatiquement (congé motivé). Attention, ce peut être différent du système de gestion institutionnel. |
| `interv-bilan` | Bilan post-intervention. Comparaison automatique avant/après sur les critères ciblés. L'«avant» est capturé au moment de la première sauvegarde, l'«après» est calculé en temps réel. |
