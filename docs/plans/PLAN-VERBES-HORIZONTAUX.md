# Plan — Verbes horizontaux (relations entre éléments de même niveau)

> Document autonome destiné à Claude Code.
> Complète PLAN-VERBES-LIENS.md qui définit les verbes verticaux (amont → aval).
> Ce plan ajoute trois verbes pour les relations entre éléments de même niveau ou de niveaux voisins.

---

## 1. Contexte

PLAN-VERBES-LIENS.md définit cinq verbes. Quatre sont verticaux (amont → aval) et un seul est horizontal (`s'appuie sur`). Ce verbe unique ne suffit pas : les éléments entretiennent entre eux des relations de dépendance, de complémentarité et de séquence.

---

## 2. Trois verbes horizontaux

| Verbe | Identifiant code | Sens | Exemple |
|---|---|---|---|
| **s'appuie sur** | `s_appuie_sur` | A dépend de B (prérequis) | « Annotation efficace *s'appuie sur* Postures de lecture » |
| **complète** | `complete` | A enrichit B (complémentarité) | « Observer le paratexte *complète* Observer les motifs » |
| **conduit à** | `conduit_a` | A mène à B (séquence logique ou temporelle) | « Distinguer les postures *conduit à* Appliquer une méthode d'annotation » |

### Différences sémantiques

- **s'appuie sur** : relation de fondation. Sans B, A ne tient pas. L'enseignant sait qu'il doit enseigner B avant A.
- **complète** : relation de renforcement. A et B s'enrichissent mutuellement. L'ordre n'est pas strict, mais les deux ensemble sont plus forts que chacun seul.
- **conduit à** : relation de progression. A mène logiquement ou temporellement à B. L'enseignant sait que A vient avant B dans la séquence d'apprentissage.

---

## 3. Couples autorisés

Ces verbes s'appliquent entre éléments de même catégorie ou de catégories voisines. La direction est choisie par l'enseignant (pas d'inversion automatique).

| Source | Cible | Verbes autorisés |
|---|---|---|
| Connaissance | Connaissance | s'appuie sur, complète, conduit à |
| Activité | Activité | complète, conduit à |
| Idée maîtresse | Idée maîtresse | s'appuie sur, complète |

> « Connaissance » = Information, Stratégie ou Condition.
> « Activité » = Apprentissage, Soutien ou Révision.

### Couple Connaissance → Activité

Ce couple est déjà couvert par le verbe vertical « s'acquiert par » (voir PLAN-VERBES-LIENS.md). Aucun verbe horizontal ne s'y ajoute. Si l'enseignant tire un lien d'une Connaissance vers une Activité, le verbe « s'acquiert par » est attribué automatiquement.

### Combinaisons non autorisées

Les verbes horizontaux ne s'appliquent pas entre éléments de niveaux éloignés (par exemple, Compétence ↔ Activité). Ces relations passent par les verbes verticaux.

---

## 4. Ajouts à TABLE_VERBES et LABELS_VERBES

```javascript
// Ajouts à TABLE_VERBES (voir PLAN-VERBES-LIENS.md)
// Les verbes horizontaux acceptent plusieurs couples source-cible.
// La clé utilise les types normalisés.

// s'appuie sur — déjà défini pour connaissance->connaissance et idee-maitresse->idee-maitresse
// Ajouter :
'idee-maitresse->idee-maitresse:complete':   'complete',
'connaissance->connaissance:complete':        'complete',
'connaissance->connaissance:conduit_a':       'conduit_a',
'activite->activite:complete':                'complete',
'activite->activite:conduit_a':               'conduit_a',
// PAS de connaissance->activite ici : ce couple est couvert par le verbe vertical 's_acquiert_par'
```

> **Note d'implémentation** : contrairement aux verbes verticaux (un seul verbe possible par couple), les verbes horizontaux offrent un choix. Quand l'enseignant tire un lien entre deux éléments de même niveau, le popup de sélection de verbe s'ouvre avec les verbes autorisés pour ce couple.

```javascript
// Ajouts à LABELS_VERBES
'complete':    'complète',
'conduit_a':   'conduit à'
// 's_appuie_sur' est déjà défini
```

---

## 5. Modification de determinerVerbe()

La fonction `determinerVerbe()` de PLAN-VERBES-LIENS.md retournait `{ verbe, source, cible, inverse }`. Cette version la **remplace** : elle retourne maintenant un objet avec un champ `type` ('vertical' ou 'horizontal'). Les appels existants doivent vérifier `resultat.type` avant d'accéder à `resultat.verbe` (vertical) ou `resultat.verbes` (horizontal, liste).

```javascript
function determinerVerbe(sourceType, cibleType) {
  const src = TYPES_CONNAISSANCE.includes(sourceType) ? 'connaissance' :
              TYPES_ACTIVITE.includes(sourceType) ? 'activite' : sourceType;
  const cbl = TYPES_CONNAISSANCE.includes(cibleType) ? 'connaissance' :
              TYPES_ACTIVITE.includes(cibleType) ? 'activite' : cibleType;

  // 1. Chercher un verbe vertical (unique, automatique)
  const cleVerticale = `${src}->${cbl}`;
  if (TABLE_VERBES_VERTICAUX[cleVerticale]) {
    return {
      type: 'vertical',
      verbe: TABLE_VERBES_VERTICAUX[cleVerticale],
      source: sourceType,
      cible: cibleType
    };
  }

  // 2. Chercher un verbe vertical inversé
  const cleInverse = `${cbl}->${src}`;
  if (TABLE_VERBES_VERTICAUX[cleInverse]) {
    return {
      type: 'vertical',
      verbe: TABLE_VERBES_VERTICAUX[cleInverse],
      source: cibleType,
      cible: sourceType,
      inverse: true
    };
  }

  // 3. Chercher les verbes horizontaux disponibles pour ce couple
  const verbesH = TABLE_VERBES_HORIZONTAUX[`${src}->${cbl}`];
  if (verbesH && verbesH.length > 0) {
    return {
      type: 'horizontal',
      verbes: verbesH,    // Liste de verbes possibles
      source: sourceType,
      cible: cibleType
    };
  }

  // 4. Aucun lien valide
  return null;
}
```

### Tables séparées

```javascript
const TABLE_VERBES_VERTICAUX = {
  'competence->idee-maitresse':     'se_decline_en',
  'idee-maitresse->lecon':          'se_concretise_dans',
  'connaissance->activite':         's_acquiert_par',
  'idee-maitresse->evaluation':     'se_verifie_par',
  'connaissance->evaluation':       'se_verifie_par'
};

const TABLE_VERBES_HORIZONTAUX = {
  'connaissance->connaissance':     ['s_appuie_sur', 'complete', 'conduit_a'],
  'activite->activite':             ['complete', 'conduit_a'],
  'idee-maitresse->idee-maitresse': ['s_appuie_sur', 'complete']
  // Pas de connaissance->activite : couvert par le verbe vertical 's_acquiert_par'
};
```

---

## 6. Comportement du popup

Quand l'enseignant tire un lien :

1. **Lien vertical** (ex. Idée maîtresse → Leçon) : le verbe est attribué automatiquement. Pas de popup.
2. **Lien horizontal** (ex. Information → Stratégie) : le popup s'ouvre avec les verbes autorisés. L'enseignant en choisit un.
3. **Lien invalide** : message « Ce lien n'est pas possible. »

Le popup est celui déjà visible dans l'interface (capture). Il affiche les verbes disponibles pour le couple sélectionné, plus l'option « Supprimer ce lien » si le lien existe déjà.

---

## 7. Impact sur les badges

Les verbes horizontaux ne modifient pas les règles de badges existantes. Les badges vérifient l'alignement vertical (objectif → contenu → activité → évaluation). Les liens horizontaux sont informatifs : ils enrichissent la carte mais ne conditionnent pas la validation.

Aucune modification de `evaluerBadge()` n'est nécessaire.

---

## 8. Migration

Aucune migration nécessaire. Le verbe `s_appuie_sur` existe déjà. Les deux nouveaux verbes (`complete`, `conduit_a`) n'ont pas d'équivalent ancien à convertir.

---

## 9. Résumé des modifications

| Composant | Modification |
|---|---|
| TABLE_VERBES | Séparée en TABLE_VERBES_VERTICAUX et TABLE_VERBES_HORIZONTAUX |
| LABELS_VERBES | Ajout de `complete` → « complète » et `conduit_a` → « conduit à » |
| determinerVerbe() | Retourne un type ('vertical' ou 'horizontal') et une liste de verbes si horizontal |
| Popup de lien | Affiche les verbes autorisés pour les liens horizontaux, attribution auto pour les verticaux |
| evaluerBadge() | Aucune modification |
