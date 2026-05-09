# Lot T2 — Info-bulles Réglages (panneaux + champs)

**Statut** : Validé (18 avril 2026)  
**Charte de référence** : `plans de travail/PLAN-REFONTE-TEXTES-ACCOMPAGNEMENT.md`, section 1  
**Source des textes actuels** : `docs/AUDIT-TEXTES-AIDE.md`, Partie A  
**Fichier cible** : `js/tooltips-contenu.js`

---

## Panneaux

| Clé | Texte réécrit |
|-----|---------------|
| `reglages-gestion-trimestres` | Ton calendrier du trimestre. Les dates que tu entres ici (début, fin, congés, imprévus) génèrent automatiquement la grille de toutes tes séances. |
| `reglages-cours` | Ton cours : code, compétence et éléments de compétence — les mêmes informations que sur le devis ministériel ou le plan-cadre. |
| `reglages-enseignant` | Ton profil. Ton nom apparaîtra dans le sélecteur de groupe-cours et sur les ressources que tu partages. |
| `reglages-groupe-etudiants` | Ta liste d'étudiant·es. Tu peux les ajouter séparément ou les importer depuis un tableur ou Omnivox. Le marqueur SA identifie ceux et celles qui sont inscrit·es aux Services adaptés. |
| `reglages-horaire` | L'horaire de ton groupe : jours, heures, locaux. Combiné au calendrier du trimestre, il génère automatiquement la grille de tes séances. |
| `reglages-groupe-cours` | Ton espace de travail pour le trimestre — tu relies ici ton cours, ton groupe, ton horaire et ta façon de construire la note. C'est le groupe-cours actif qui détermine ce que tu vois partout dans l'application. |

## Champs Trimestre

| Clé | Texte réécrit |
|-----|---------------|
| `reglages-trim-identification` | Le nom et la période de ton trimestre (ex. : Hiver 2026). Sert de repère dans toute l'application. |
| `reglages-trim-bornes` | Les dates clés de ton trimestre : début, fin des cours, remise des notes. Le calendrier des séances se calcule à partir de ces dates. |
| `reglages-trim-semaines-speciales` | Semaines de planification et d'examens. Ces semaines sont exclues du décompte des séances régulières. |
| `reglages-trim-conges` | Tes congés fériés et leurs reprises. Le calendrier des séances s'ajuste automatiquement. |
| `reglages-trim-imprevus` | Annulations, fermetures, maladie, météo — tout ce qui n'était pas prévu. Le calendrier des séances s'ajuste. |

## Champs Cours

| Clé | Texte réécrit |
|-----|---------------|
| `reglages-cours-competence` | La compétence de ton cours — le code et l'énoncé qu'on retrouve dans le devis ministériel ou le plan-cadre. |
| `reglages-cours-elements` | Les éléments de compétence de ton cours — les sous-objectifs que tes étudiant·es doivent atteindre. Servent de référence pour tes évaluations. |

## Champs Groupe

| Clé | Texte réécrit |
|-----|---------------|
| `reglages-etudiants-sa` | Coche les étudiant·es inscrit·es aux Services adaptés (diagnostic posé par un·e professionnel·le). Ce marqueur est visible dans le suivi et les interventions. |
| `reglages-etudiants-import` | Importe ta liste d'étudiant·es en lot : colle depuis le système de gestion institutionnel ou un tableur, ou charge un fichier CSV. Le format attendu est affiché dans le panneau d'import. |

## Champs Horaire

| Clé | Texte réécrit |
|-----|---------------|
| `reglages-horaire-periodes` | Combien de périodes par séance et combien de temps dure chaque période. Le volume hebdomadaire se calcule automatiquement. |

## Champs Groupe-cours

| Clé | Texte réécrit |
|-----|---------------|
| `reglages-gc-nom-genere` | Nom généré à partir de ton trimestre, cours, groupe, horaire et profil. C'est ce nom qui apparaît dans le sélecteur en haut de l'écran. |
| `reglages-gc-pratique` | Ta façon de calculer la note finale pour ce groupe : moyenne sommative traditionnelle ou pratique alternative (meilleurs résultats retenus dans un portfolio, par exemple). |

## Bibliothèque

| Clé | Texte réécrit |
|-----|---------------|
| `reglages-bibliotheque` | Tes ressources réutilisables d'un trimestre à l'autre (trimestres, cours, horaires, grilles…). Choisis une ressource existante ou crées-en une nouvelle. |
