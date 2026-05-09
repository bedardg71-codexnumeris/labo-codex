# Lot T6 — Info-bulles Travaux (import, annotation, export)

**Statut** : Validé (19 avril 2026)  
**Charte de référence** : `plans de travail/PLAN-REFONTE-TEXTES-ACCOMPAGNEMENT.md`, section 1  
**Source des textes actuels** : `docs/AUDIT-TEXTES-AIDE.md`, Partie A  
**Fichier cible** : `js/tooltips-contenu.js`

---

## Import et pipeline

| Clé | Texte réécrit |
|-----|---------------|
| `travaux-production` | Sélectionne la production (travail, examen) que tu es en train d'évaluer. Les fichiers importés seront associés à cette production. |
| `travaux-pipeline-optimisation` | Les images sont optimisées automatiquement (résolution DPI uniformisée, compression JPEG). Les PDF sont importés tels quels. |
| `travaux-fsapi-config` | Stocke les fichiers importés directement sur le disque local au lieu d'IndexedDB. Recommandé sur ordinateur pour éviter les limites de stockage du navigateur. |

## Actions sur les travaux

| Clé | Texte réécrit |
|-----|---------------|
| `travaux-btn-annoter` | Mode annotation : surligne, écris et appose des tampons / estampes ou des codes spécifiques directement sur la copie de l'étudiant·e. |
| `travaux-btn-evaluer` | Mode évaluation : ouvre les panneaux de critères et de paramètres pour évaluer cette production selon la grille. |
| `travaux-evaluer` | Ouvre l'interface d'évaluation avec l'étudiant·e et la production présélectionnés. Tu pourras appliquer une grille de critères et générer une rétroaction. |
| `travaux-btn-alleger` | Remplace l'original par un fac-similé plus léger (niveaux de gris, 800 px). Réduit l'espace de stockage. Les annotations sont conservées. |
| `travaux-btn-reimporter` | Remplace le fichier allégé par l'original complet. Utile si tu as besoin de revoir les détails de la copie originale. |

## Archivage et export

| Clé | Texte réécrit |
|-----|---------------|
| `travaux-archivage-etudiant` | Télécharge un ZIP contenant tous les travaux d'un·e étudiant·e. Utile pour remettre un dossier complet en fin de session. |
| `travaux-archivage-production` | Télécharge un ZIP regroupant tous les travaux d'une production. Pratique pour archiver une évaluation complète. |
| `travaux-archivage-semestre` | Archive complète de tous les travaux du trimestre en un seul ZIP. Recommandé en fin de session pour la conservation. |
| `travaux-archivage-inclure-annotes` | Ajoute les versions annotées (avec surlignage, commentaires et tampons) au ZIP. Décoche pour n'exporter que les originaux. |
| `travaux-archivage-inclure-evals` | Ajoute un fichier de rétroaction pour chaque évaluation complétée. Pratique pour la remise aux étudiant·es. |
| `travaux-archivage-alleger` | Convertit les originaux déjà exportés en fac-similés légers (niveaux de gris, 800 px). Libère de l'espace de stockage sans perdre les annotations. |
