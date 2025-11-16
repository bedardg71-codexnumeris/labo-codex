# PHASE 6 - Session de tests #2 : Régression complète

**Date** : 11 novembre 2025
**Objectif** : Valider que les workflows existants fonctionnent après les correctifs Beta 90
**Contexte** : Suite aux correctifs PHASE 6.1-6.4, validation complète avant finalisation

---

## 🎯 Objectifs des tests de régression

Vérifier que les modifications Beta 90 n'ont **pas cassé** les fonctionnalités existantes:
1. Profil étudiant : navigation, affichage, calculs
2. Tableau de bord : compteurs, statistiques, alertes
3. Portfolio : sélection artefacts, calculs indices
4. Mode comparatif : basculement SOM/PAN, checkboxes
5. Edge cases : données manquantes, configurations invalides

---

## 📋 Plan de tests

### GROUPE A : Profil étudiant (workflows principaux)

#### TEST A1 : Navigation entre étudiants
**Scénario** : Ouvrir profil → Cliquer Suivant → Cliquer Précédent
**Résultat attendu** :
- Changement d'étudiant fluide
- Données actualisées
- Pas d'erreur console
- Boutons désactivés correctement (premier/dernier)

**Statut** :

---

#### TEST A2 : Affichage section Suivi de l'apprentissage
**Scénario** : Ouvrir profil étudiant avec données complètes
**Résultat attendu** :
- Indices A-C-P-R affichés
- Échelle de risque visible avec indicateur positionné
- Niveau RàI affiché (1, 2 ou 3)
- Recommandations adaptées au niveau

**Statut** :

---

#### TEST A3 : Affichage défis (pratique active)
**Scénario** : Ouvrir profil avec pratique PAN-Maîtrise active
**Résultat attendu** :
- Section "Développement des habiletés" affichée
- Tableau scores SRPNF avec moyennes calculées
- Forces et défis identifiés
- Défi principal mis en évidence

**Statut** :

---

#### TEST A4 : Affichage défis (pratique Sommative)
**Scénario** : Basculer vers pratique Sommative → Recharger profil
**Résultat attendu** :
- Section "Développement des habiletés" affichée
- Défis génériques (notes faibles, tendance baisse, irrégularité)
- Statistiques correctes (moyenne, écart-type, min/max)
- Tendance calculée (hausse/baisse/stable)

**Statut** :

---

#### TEST A5 : Cible RàI adaptée à la pratique
**Scénario** : Comparer cible RàI entre PAN et SOM pour même étudiant
**Résultat attendu** :
- Cible PAN basée sur critères SRPNF ("Remédiation en X")
- Cible SOM basée sur productions ("Reprise obligatoire: Y")
- Niveau RàI cohérent avec pattern identifié
- Stratégies pertinentes au contexte

**Statut** :

---

### GROUPE B : Tableau de bord (compteurs et statistiques)

#### TEST B1 : Chargement tableau de bord
**Scénario** : Naviguer vers Tableau de bord → Aperçu
**Résultat attendu** :
- 4 sections affichées (Indicateurs, Risque, Patterns, RàI)
- Valeurs numériques cohérentes (somme = 100%)
- Pas d'erreur console
- Temps de chargement < 3 secondes

**Statut** :

---

#### TEST B2 : Indicateurs globaux (mode normal)
**Scénario** : Pratique Sommative seule active
**Résultat attendu** :
- Badge [SOM] affiché en orange
- Assiduité, Complétion, Performance calculés
- Pourcentages arrondis correctement
- Libellés clairs

**Statut** :

---

#### TEST B3 : Compteurs patterns (mode normal)
**Scénario** : Pratique PAN-Maîtrise seule active
**Résultat attendu** :
- Badge [PAN] affiché en bleu
- 4 compteurs: Stable, Défi spécifique, Blocage émergent, Blocage critique
- Somme = nombre total d'étudiants
- Valeurs > 0 (pas tous à zéro)

**Statut** :

---

#### TEST B4 : Compteurs RàI (mode normal)
**Scénario** : Pratique Sommative active
**Résultat attendu** :
- 3 compteurs: Niveau 1 (Universel), Niveau 2 (Préventif), Niveau 3 (Intensif)
- Pourcentages cohérents (somme ≈ 100%)
- Descriptions claires (suivi régulier, interventions préventives, intensives)

**Statut** :

---

#### TEST B5 : Mode comparatif (checkboxes)
**Scénario** : Activer mode comparatif dans Réglages
**Résultat attendu** :
- Checkboxes [☑ SOM] [☑ PAN] affichées en haut à droite
- Valeurs SOM (orange) et PAN (bleu) côte à côte
- Checkboxes interactives (cocher/décocher)
- Calculs distincts pour les deux pratiques

**Statut** :

---

### GROUPE C : Mode comparatif (workflows avancés)

#### TEST C1 : Basculement SOM → PAN
**Scénario** : Mode comparatif actif → Décocher [SOM]
**Résultat attendu** :
- Valeurs SOM disparaissent
- Valeurs PAN restent affichées en bleu
- Badge [PAN] remplace checkboxes
- Aucune erreur console

**Statut** :

---

#### TEST C2 : Basculement PAN → SOM
**Scénario** : Mode PAN seul → Cocher [SOM] + Décocher [PAN]
**Résultat attendu** :
- Valeurs PAN disparaissent
- Valeurs SOM affichées en orange
- Badge [SOM] remplace checkboxes
- Compteurs recalculés correctement

**Statut** :

---

#### TEST C3 : Réactivation mode comparatif
**Scénario** : Mode SOM seul → Cocher [PAN]
**Résultat attendu** :
- Les deux pratiques visibles simultanément
- Checkboxes réapparaissent
- Valeurs colorées correctement
- Pas de clignotement ou reload

**Statut** :

---

### GROUPE D : Portfolio (calculs indices)

#### TEST D1 : Sélection artefacts PAN
**Scénario** : Ouvrir portfolio étudiant → Cocher/décocher artefacts
**Résultat attendu** :
- Artefacts cochés sauvegardés dans localStorage
- Indice P_pan recalculé automatiquement
- Moyenne des N meilleurs artefacts
- Affichage actualisé dans profil

**Statut** :

---

#### TEST D2 : Calcul dual SOM + PAN
**Scénario** : Ajouter une nouvelle évaluation
**Résultat attendu** :
- `indicesCP[da].actuel.SOM` calculé (toutes évaluations)
- `indicesCP[da].actuel.PAN` calculé (artefacts portfolio)
- Valeurs différentes (filtrage distinct)
- Historique mis à jour

**Statut** :

---

### GROUPE E : Edge cases (gestion d'erreurs)

#### TEST E1 : Aucune pratique configurée
**Scénario** : `localStorage.removeItem('modalitesEvaluation')` → Recharger
**Résultat attendu** :
- Message d'erreur explicite
- Invitation à configurer une pratique
- Pas de crash
- Interface reste fonctionnelle

**Statut** :

---

#### TEST E2 : Pratique inexistante dans registre
**Scénario** : `modalitesEvaluation.pratique = 'pratique-xyz'` → Recharger
**Résultat attendu** :
- Message d'erreur "Pratique non trouvée"
- Retour à pratique par défaut (sommative)
- Pas de crash
- Console affiche warning

**Statut** :

---

#### TEST E3 : Étudiant sans évaluations
**Scénario** : Ouvrir profil étudiant sans aucune évaluation
**Résultat attendu** :
- Indices C = 0%, P = 0%
- Message "Aucune évaluation disponible"
- Pas de division par zéro
- Pas d'erreur console

**Statut** :

---

#### TEST E4 : Étudiant sans présences
**Scénario** : Ouvrir profil étudiant sans aucune présence saisie
**Résultat attendu** :
- Indice A = 0% ou "Non calculable"
- Message informatif
- Pattern par défaut ("Données insuffisantes")
- Pas d'erreur console

**Statut** :

---

#### TEST E5 : Changement pratique en cours de session
**Scénario** : Pratique PAN active → Basculer vers SOM → Recharger profil
**Résultat attendu** :
- Cache invalidé automatiquement
- Nouvelles données chargées (SOM)
- Affichage cohérent (défis génériques, pas SRPNF)
- Aucune donnée PAN résiduelle

**Statut** :

---

## 📊 Grille de validation

| Groupe | Tests | ✅ Passés | ❌ Échoués | Statut |
|--------|-------|----------|-----------|--------|
| A - Profil étudiant | 5 | 0 | 0 | ⏳ En attente |
| B - Tableau de bord | 5 | 0 | 0 | ⏳ En attente |
| C - Mode comparatif | 3 | 0 | 0 | ⏳ En attente |
| D - Portfolio | 2 | 0 | 0 | ⏳ En attente |
| E - Edge cases | 5 | 0 | 0 | ⏳ En attente |
| **TOTAL** | **20** | **0** | **0** | **0%** |

---

## 🐛 Bugs découverts

*(À remplir au fur et à mesure)*

---

## ✅ Validation finale

- [ ] Tous les tests passés (20/20)
- [ ] Aucune régression identifiée
- [ ] Performance acceptable (< 3s chargement)
- [ ] Aucune erreur console critique
- [ ] Documentation à jour

---

**Version** : 1.0
**Date** : 11 novembre 2025
**Testeur** : Grégoire Bédard
**Assistant** : Claude Code
