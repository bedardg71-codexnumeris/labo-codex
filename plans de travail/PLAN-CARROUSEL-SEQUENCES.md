# Plan — Carrousel de séquences (carte mentale)

**Date** : 11 avril 2026  
**Statut** : Idée documentée, à planifier  
**Origine** : Session d'implémentation import/export MD — constat que l'import en bloc encombre le canevas

---

## Constat

Quand un plan de cours est importé (5-8 séquences, 15-20 leçons), tout apparaît sur le canevas d'un coup. Les nœuds se chevauchent et l'enseignant doit réorganiser manuellement avant de pouvoir travailler. Le canevas unique devient dense quand le cours est complet (compétences + idées maîtresses + séquences + leçons + activités + évaluations).

## Idée

Remplacer le canevas unique par un **carrousel de séquences** dans la toolbar, inspiré du carrousel d'étudiants dans Annoter/Évaluer.

### Principe

- Chaque séquence est un **espace de travail focalisé** : l'enseignant ne voit qu'une séquence à la fois, avec ses leçons, activités et connaissances.
- Le carrousel dans la toolbar permet de naviguer entre les séquences (comme on navigue entre les étudiants dans Annoter/Évaluer).
- Une **vue globale** (premier élément du carrousel ou mode dédié) affiche le canevas d'alignement final : compétences, idées maîtresses, évaluations, et les séquences comme blocs reliés.

### Flux de travail visé

```
Import MD → séquences chargées dans le carrousel
         → l'enseignant ouvre Seq 1
         → il enrichit (activités, connaissances, liens)
         → il passe à Seq 2 via le carrousel
         → ...
         → Vue globale : il relie les séquences aux compétences et idées maîtresses
```

### Maquette toolbar

```
[Carte ▾] │ Vue globale │ Seq 1: Introduction ● │ Seq 2: Modelage │ Seq 3: Pratique… │ ← 2/5 → │ 📔 Export/Import
```

## Différences avec le carrousel Annoter/Évaluer

| Aspect | Annoter/Évaluer | Carrousel séquences |
|--------|----------------|---------------------|
| Éléments | Étudiants (liste fixe) | Séquences (nombre variable) |
| Contenu | Fichiers/annotations d'un étudiant | Canevas focalisé sur une séquence |
| Persistence | Toujours présent | Toujours présent (pas de staging) |
| Navigation | ← → entre étudiants | ← → entre séquences |
| Mode spécial | — | Vue globale (alignement cross-séquence) |

## Points d'architecture à résoudre

1. **Filtrage des nœuds visibles** : le canevas doit afficher uniquement les nœuds d'une séquence donnée (leçons enfants + leurs propres enfants). `reconstruireDOM()` doit accepter un filtre.

2. **Stockage** : les nœuds restent dans `etat.noeuds` (Map globale), mais chaque vue ne rend qu'un sous-ensemble. Pas de changement au modèle de données.

3. **Liens cross-séquence** : dans la vue globale, les liens entre séquences et compétences/idées maîtresses sont visibles. Dans la vue focalisée, seuls les liens internes à la séquence sont rendus.

4. **Position par séquence** : chaque séquence a son propre espace de coordonnées, ou bien on utilise un offset pour « zoomer » sur la zone de la séquence active. Option offset = plus simple (pas de changement au modèle).

5. **Création de séquences** : le carrousel doit permettre d'ajouter une nouvelle séquence (bouton +), pas seulement naviguer dans les existantes.

6. **Vue globale** : les séquences apparaissent comme des blocs compacts (titre + badge nombre de leçons), pas comme des conteneurs ouverts. L'enseignant peut ouvrir une séquence en double-cliquant → bascule vers la vue focalisée.

## Portée estimée

C'est une refonte du modèle d'interaction de la carte, pas un ajout incrémental. Touche à :
- Navigation (carrousel toolbar)
- Rendu (filtrage nœuds visibles)
- Liens (cross-séquence vs intra-séquence)
- Import MD (les séquences arrivent dans le carrousel, pas sur le canevas)
- Potentiellement le stockage (si on veut des coordonnées par vue)

**Prérequis** : import/export MD stabilisé (fait).

---

## Hors portée (à traiter séparément)

- Refonte complète du modèle de données (le Map `etat.noeuds` reste)
- Multi-utilisateur / collaboration
- Import de devis ministériel (assistant séparé, voir plan import-export MD)
