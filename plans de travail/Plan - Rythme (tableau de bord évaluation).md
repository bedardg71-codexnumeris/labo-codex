# Plan — Rythme : tableau de bord du travail d'évaluation

**Date** : 6 avril 2026
**Statut** : Conception — en attente de validation
**Priorité** : Post-AQPC (fonctionnalité nouvelle)

---

## 1. Vision

**Rythme** est un outil de conscience de soi pour l'enseignant-évaluateur.
Il répond à trois questions :

1. **Combien de temps ça prend ?** — mesures réelles par type d'activité
2. **Quand est-ce que je travaille ?** — portrait des habitudes d'évaluation
3. **Est-ce que je prends soin de moi ?** — rappels de pauses, signaux de surcharge

Ce n'est pas un outil de productivité. C'est une station météo : elle révèle
des conditions, l'enseignant décide.

---

## 2. Concepts clés

### 2.1 Type d'activité (clé de regroupement)

Le chronomètre est associé au **type d'activité** de la production, pas à la
production spécifique.

- Source : `production.description` (champ existant dans le gabarit)
- Exemples : « Rédaction », « Stratégies de lecture », « Carte mentale », « Plan »
- Regroupement : toutes les productions avec la même description partagent
  leurs statistiques de durée

**Données stockées par entrée chrono :**
```
{
  dureeMs,
  date,                    // ISO timestamp
  activite,                // prod.description (ex: "Rédaction")
  productionId,            // pour drill-down
  productionNom,           // pour affichage
  groupeCoursId            // pour ventilation par groupe
}
```

### 2.2 Plages de travail (préférences)

L'enseignant configure ses **disponibilités d'évaluation** — pas un horaire
précis, mais des plages indicatives.

**Niveaux de préférence :**
- **Privilégié** : jours de semaine sans cours (ex: vendredi après-midi)
- **Acceptable** : soirs de semaine (ex: lundi-jeudi, 19h-21h)
- **À éviter** : weekends, soirs tardifs

**Source potentielle :** L'horaire du trimestre contient déjà les séances
de cours. Les plages « sans cours » sont calculables automatiquement.

**Modèle :**
```
{
  plagesPrivilegiees: ["vendredi-pm", "mercredi-am"],
  plagesAcceptables: ["lundi-soir", "mardi-soir", "mercredi-soir", "jeudi-soir"],
  plagesAEviter: ["samedi", "dimanche", "soir-tardif"],
  pauseApresMinutes: 45,       // suggérer une pause après X minutes
  dureeMaxJournaliere: 180     // alerte après X minutes cumulées dans une journée
}
```

### 2.3 Rappels de bien-être

L'application observe passivement le rythme d'évaluation et propose
des micro-interventions :

- **Pause courte** : après N minutes d'évaluation continue → notification
  discrète « Tu évalues depuis 45 min — une pause de 5 min ? »
- **Fin de séance** : après la durée max journalière → « Tu as évalué 3h
  aujourd'hui. Demain est un autre jour. »
- **Évaluation en weekend** : si détecté → ton neutre, pas de jugement,
  juste une mention « Évaluation un samedi — les copies seront encore là lundi. »

Aucun blocage, aucune obligation. L'enseignant peut ignorer ou désactiver.

---

## 3. Interface — Onglet Rythme (Boîte à outils)

### 3.1 Vue principale : statistiques par activité

Tableau synthèse :

| Activité | Moy. | Méd. | Min | Max | N | Tendance |
|----------|------|------|-----|-----|---|----------|
| Rédaction | 7:23 | 6:50 | 4:12 | 12:30 | 42 | ↘ (accélère) |
| Stratégies lecture | 4:15 | 4:00 | 2:30 | 7:45 | 28 | → (stable) |
| Carte mentale | 3:02 | 2:45 | 1:30 | 5:20 | 25 | → (stable) |

- Barres horizontales comparatives (durée moyenne par activité)
- Clic sur une activité → détail avec répartition par production/groupe

### 3.2 Vue planification : charge d'évaluation

Pour chaque lot d'évaluations en cours ou à venir :

```
Artefact 7 — Rédaction (Pow-pow-wow)
├── Groupe 01 : 25 copies × ~7 min = ~2h55
├── Groupe 02 : 26 copies × ~7 min = ~3h02
└── Total estimé : ~5h57
    → 2 plages de vendredi après-midi (3h chacune)
    → ou 3 soirées de ~2h
```

L'estimation utilise la moyenne chrono de l'activité « Rédaction ».
Si aucune donnée n'existe pour cette activité, afficher « Pas encore de données ».

### 3.3 Vue habitudes : portrait temporel

- Graphique simple : nombre d'évaluations par jour de la semaine / moment
  de la journée (heatmap léger, pas besoin de Chart.js complexe)
- Comparaison avec les préférences configurées :
  « 15% de tes évaluations sont en weekend — tu visais 0% »

### 3.4 Palette chrono (existante, enrichie)

Modification de la palette flottante actuelle :

```
┌─ CHRONOMÉTRER ──────── ? ─┐
│      ⏸️  7:33              │
│  Moy. 7:02 × 12           │
│  Rédaction                 │
└───────────────────────────┘
```

- Le type d'activité remplace le nom de production
- La moyenne est filtrée par activité (pas par productionId)
- Le compteur `× 12` = nombre d'évaluations chronométrées de ce type

---

## 4. Architecture technique

### 4.1 Stockage

**Historique chrono** (clé existante, enrichie) :
`cle('chronoEvaluations')` — 200 dernières entrées (augmenté de 50)

Chaque entrée inclut `activite` (nouveau) en plus de `productionId`.

**Préférences Rythme** (nouvelle clé) :
`cle('preferencesRythme')` — objet de configuration

**Pas de nouvelle clé IDB.** Les données existent déjà dans l'historique
chrono et dans les évaluations sauvegardées (qui contiennent `dureeEvaluation`).

### 4.2 Fichiers

| Fichier | Rôle | Taille estimée |
|---------|------|----------------|
| `js/rythme.js` (nouveau) | Module Rythme : calculs, vues, planification | ~400 lignes |
| `js/travaux-ui.js` | Modification : chrono stocke `activite` au lieu de `productionId` seul | ~10 lignes |
| `index.html` | Section Rythme dans Boîte à outils | ~150 lignes HTML |
| `styles.css` | Styles du tableau, barres, heatmap | ~80 lignes |

### 4.3 Données sources

Le module lit (lecture seule, principe SSOT) :

- `cle('chronoEvaluations')` — historique chrono (source primaire)
- `cle('evaluationsSauvegardees')` — durées d'évaluation historiques (backup)
- `cle('productions')` — pour mapper productionId → activité
- `cle('calendrier')` / `cle('horaire')` — pour plages sans cours
- `cle('preferencesRythme')` — configuration personnelle

---

## 5. Phases d'implémentation

### Phase 1 — Chrono par activité (immédiat, ~30 min)
- Modifier `arreterChrono()` pour stocker `activite` (prod.description)
- Modifier `_calculerMoyenneProduction()` → `_calculerMoyenneActivite()`
- Filtrer par activité au lieu de productionId
- Afficher le type d'activité dans la palette chrono

### Phase 2 — Onglet Rythme : statistiques (1-2h)
- Créer `js/rythme.js` avec le tableau synthèse par activité
- Section dans Boîte à outils avec le tableau + barres comparatives
- Drill-down par activité (productions, groupes)

### Phase 3 — Planification de la charge (1-2h)
- Estimation du temps par lot (copies restantes × moyenne)
- Vue par groupe-cours
- Suggestion de plages (basée sur l'horaire du calendrier)

### Phase 4 — Préférences et bien-être (1h)
- Configuration des plages de travail
- Rappels de pauses (notification discrète après N minutes)
- Portrait temporel (heatmap jour/moment)

### Phase 5 — Raffinements (selon usage)
- Courbe d'apprentissage de l'évaluateur (tendance par activité)
- Alerte weekend / soir tardif
- Export du portrait pour réflexion professionnelle

---

## 6. Décisions (6 avril 2026)

1. **Nom** : « Rythme de travail »
2. **Position** : Onglet dans Boîte à outils
3. **Historique** : Utiliser les deux sources (chrono enrichi + évaluations existantes
   avec `dureeEvaluation`). Raffiner après accumulation de données réelles.
4. **Champ activité** : Renommer `prod.description` → `prod.activiteApprentissage`
   (label UI : « Activité d'apprentissage »). Unifie le vocabulaire avec le module
   Alignement (carte mentale). Migration transparente avec fallback sur l'ancien champ.
5. **Plages horaires** : Inférer de l'horaire du calendrier (jours/plages sans cours).
   L'enseignant peut ajouter manuellement des plages (soirs, weekends).
   Les copies sont réparties automatiquement dans les plages disponibles.
6. **Tampon pré-cours** : L'application signale que ce n'est pas l'idéal d'évaluer
   juste avant un cours, mais ne bloque pas. Suggestion douce, pas d'interdiction.
7. **Chaîne post-évaluation** : L'estimation de la charge inclut la relecture des
   rétroactions, la génération des PDF et le dépôt sur LÉA — pas juste le chrono brut.
   Ratios configurables (ex: +25% pour post-évaluation, +15% pour imprévus).
8. **Échéance** : Montrable au colloque AQPC (juin 2026). Phases 1-3 prioritaires.

---

## 7. Principes directeurs

- **Zéro culpabilisation** — l'outil constate, ne juge pas
- **Opt-in total** — tout est désactivable (chrono, rappels, stats)
- **Données locales** — rien ne sort de l'appareil
- **Utile dès la Phase 1** — la moyenne par activité dans le chrono a une
  valeur immédiate, les phases suivantes sont incrémentales
