# Note de conception — C0 Comparateur de pratiques (seed démo)

**Date** : 5 juin 2026
**Auteur** : Claude Code, en exécution de `SPEC_comparateur_pratiques.md` (lot C0)
**Statut** : à valider par Grégoire avant tout seed. Aucune écriture pour l'instant.
**Périmètre acté** : phase 1 = **SOM + STD + SPE** (DEN reporté #318).

---

## 0. Vue d'ensemble

C0 doit doter la démo de **trois pratiques calculables sur les mêmes artefacts**, puis
choisir **quatre profils-types** qui rendent l'écart entre pratiques visible et racontable.
Le diagnostic (campagne du 5 juin) a montré que, en l'état, la démo ne porte **aucune
pratique PAN configurée** : STD retombe en fallback (≈ SOM) et SPE rend `50` partout
(aucun palier). Les contrastes doivent donc être **construits**, comme la SPEC §4 l'autorise.

Cette note propose : (1) le schéma exécutable des configs ; (2) une config candidate par
famille ; (3) un point dur à trancher sur la production terminale ; (4) le plan des quatre
profils avec les ajustements de données ; (5) les décisions à valider ; (6) le plan d'exécution.

Les valeurs pédagogiques (nombre d'artefacts retenus, paliers, seuils, ajustements de notes)
sont **proposées comme candidates dérivées des données existantes**, jamais codées en dur
sans ton aval (principe zéro-fallback-arbitraire).

---

## 1. Schéma exécutable des configs (vérifié dans le code)

Le moteur ne lit **pas** le schéma descriptif des gabarits prédéfinis (`echelle`,
`structure_evaluations`…). Il lit le schéma de `pratiquesConfigurables` :

```
pratiquesConfigurables = [ { id, nom, configuration: { … } } ]
```

- `obtenirConfigPratiqueActive(id)` → renvoie `configuration` (`portfolio.js:1103`).
- `obtenirPratiqueParId(id)` → instancie `PratiqueConfigurable(config)` si l'id n'est pas
  une pratique codée en dur ; sa famille (`obtenirCode()` → 'STD'/'SPE'/'SOM') dérive du
  champ **`type`** de la configuration (relais Session B).

Les productions démo en place : 1 `portfolio` (pond 60), 9 `artefact-portfolio` (pond 0),
1 `travail` « Évaluation terminale » (pond 40). Évaluations présentes pour les 9 artefacts
et la terminale ; niveaux IDME par critère et `niveauFinal` présents.

---

## 2. Config STD candidate (PAN-Standards)

Lue par `calculerDetailsNoteFinale` via `_obtenirConfigPortfolioCalcul`
(`profil-etudiant-actions.js:207`) :

```js
{
  id: 'demo-std-litt',
  nom: 'PAN – Standards (démo)',
  configuration: {
    type: 'standards',
    portfolio: {
      nombreARetenir: 6,        // aligné sur modalitesEvaluation du pack (déjà 6/7/9)
      minimumCompletion: 7,     // idem pack
      methodeSelection: 'meilleurs',  // ← choix qui crée l'écart vs SOM (à valider)
      reglesConformite: { actif: false }
    },
    notesFinales: true          // mode finale → règle « obligatoires non remises = 0 »
  }
}
```

**Mécanique** : STD retient les **6 meilleurs** des 9 artefacts (écarte les 3 plus faibles),
moyenne le portfolio. C'est ce qui le fait **diverger de SOM** (qui, lui, compte tout).
`methodeSelection: 'meilleurs'` est le levier du contraste ; `'recents'` (valeur actuelle du
pack) le réduirait. **Décision pédagogique D2 ci-dessous.**

---

## 3. Config SPE candidate (PAN-Spécifications)

Lue par `pratique-pan-specifications.js` (`config.typesTravaux` + `config.tableBundles`).
Acceptabilité = `noteFinale >= seuilAcceptable` (seuil par type) — dérive des notes existantes.

```js
{
  id: 'demo-spe-litt',
  nom: 'PAN – Spécifications (démo)',
  configuration: {
    type: 'specifications',
    typesTravaux: [
      { id: 'artefact-portfolio', nom: 'Artefacts', seuilAcceptable: 70 },
      { id: 'travail',            nom: 'Analyse finale', seuilAcceptable: 70 }
    ],
    tableBundles: [
      { noteFixe: 100, requis: { 'artefact-portfolio': 8, 'travail': 1 } },
      { noteFixe: 80,  requis: { 'artefact-portfolio': 6, 'travail': 1 } },
      { noteFixe: 60,  requis: { 'artefact-portfolio': 4, 'travail': 1 } },
      { noteFixe: 50,  requis: null }   // palier plancher (échec)
    ]
  }
}
```

**Mécanique** : note **tout-ou-rien par palier**. Un profil fort partout mais dont la
**terminale (`travail`) reste sous 70** plafonne au palier sans `travail` requis — il « bute »
là où SOM/STD lissent. C'est la signature SPE. Les seuils (70) et paliers (4/6/8 + terminale)
sont calqués sur les notes_fixes [50,60,80,100] du gabarit `pan-specifications-fah` et la
structure 9 artefacts + 1 terminale. **Décision D3 ci-dessous.**

---

## 4. SOM (référence) — rien à configurer, mais une incohérence à corriger

SOM = instance codée en dur `'sommative'`, déjà calculante. **Mais** `calculerPerformance`
pondère chaque production par `ponderation || 1` : les 9 artefacts (pond 0) reçoivent donc
**poids 1 chacun**, la terminale **poids 40**, le conteneur portfolio (pond 60, sans
évaluation) compte pour **0**. Résultat : la terminale pèse ≈ 82 % de la note SOM — ce qui
n'est pas une « moyenne pondérée traditionnelle » lisible.

→ Pour que les trois pratiques calculent sur une base honnête et racontable, il faut **fixer
les pondérations des productions** (voir D1). Sans cela, le contraste observé serait en partie
un artefact de pondérations à 0.

---

## 5. Point dur : la terminale n'est pas reconnue par STD

`_identifierProductionTerminale` cherche `type === 'terminale'` ; la production démo a
`type === 'travail'`. Conséquence : **STD ignore la terminale** (portfolio = 100 %), alors que
SOM et SPE l'utilisent. Trois lectures possibles :

- **(a)** Renommer le type en `'terminale'` → STD l'intègre (portfolio 60 / terminale 40),
  les trois pratiques partagent la même ossature. *Recommandé* : récit homogène.
- **(b)** Laisser STD en portfolio 100 % (la terminale ne compte que pour SOM/SPE) — divergence
  plus brutale mais moins explicable.
- **(c)** Retirer la terminale du calcul STD par conception assumée (« en Standards, c'est la
  trajectoire de maîtrise qui compte, pas l'examen »).

C'est un choix **pédagogique** autant que technique → **Décision D1**.

---

## 6. Les quatre profils-types

Données actuelles (moyenne des notes d'artefacts actives ; reprises quasi inexistantes —
quelques remplacements à faible gain seulement) :

| Profil visé | Candidat | Moy | Étendue | Intention |
|---|---|---|---|---|
| **Fort** (convergence) | DEMO010 Ouellet | 84 | 68–100 | Les 3 pratiques élevées → « les PAN ne dégradent pas un bon dossier » |
| **Moyen** | DEMO013 Lévesque | 75 | 67–82 | Notes proches entre pratiques → cas neutre |
| **En difficulté** (convergence basse) | DEMO004 Côté | 57 | 0–73 | Les 3 pratiques basses → « les PAN ne sauvent pas magiquement » |
| **Irrégulier** (signature) | DEMO011 Diallo | 64 | 49–91 | Forte variance → **STD ≫ SOM** (meilleurs retenus) ; et **SPE plafonne** si la terminale est sous le seuil |

**Ajustements de données proposés** (sur la démo, idempotents, voir §8) :

1. **Irrégulier (DEMO011)** : s'assurer qu'il a **2-3 artefacts franchement faibles** (≈ 50, niveau I)
   et **6 artefacts forts** (≥ 80) + une **terminale moyenne-basse** (≈ 62). Effet attendu : SOM tirée
   vers le bas par les faibles + terminale ; STD « meilleurs 6 » remonte ; SPE plafonne au palier
   intermédiaire faute de terminale acceptable. C'est le cas qui raconte le mieux la transition.
2. **Fort (DEMO010)** : vérifier que la terminale est **≥ 70** (sinon SPE le plafonnerait à tort et
   casserait la convergence rassurante).
3. **En difficulté (DEMO004)** : a déjà un 0 et des notes basses — convergence basse naturelle, à
   confirmer après seed.
4. **Moyen (DEMO013)** : aucun ajustement, sert de témoin neutre.

Les ampleurs exactes seront **vérifiées par re-simulation** après seed (la campagne C0 re-jouée
montre les notes réelles ; on ajuste jusqu'à obtenir le récit voulu). **Décision D4** : valides-tu
ces quatre étudiants et ces intentions ?

**Phrases de contexte** (livrable de contenu, à écrire à la main — ébauches à valider) :
- Fort : « Dossier solide et régulier ; les reprises n'ont pas eu à servir. »
- Moyen : « Parcours sans accident ; les pratiques convergent. »
- En difficulté : « Plusieurs travaux non aboutis et un examen manqué ; aucune pratique ne compense. »
- Irrégulier : « A raté deux premiers travaux et l'examen final, puis démontré sa maîtrise ensuite —
  c'est ici que les pratiques racontent des histoires différentes. »

---

## 7. Décisions à valider (fermées)

| # | Décision | Recommandation |
|---|---|---|
| **D1** | Sort de la terminale en STD (§5) | (a) `type='terminale'` → ossature commune 60/40 |
| **D2** | `methodeSelection` STD (§2) | `'meilleurs'` (crée l'écart-signature) |
| **D3** | Seuils/paliers SPE (§3) | seuil 70 ; paliers 4/6/8 artefacts + terminale |
| **D4** | Les 4 profils + intentions (§6) | DEMO010 / 013 / 004 / 011 |
| **D5** | Pondérations productions SOM (§4) | fixer portfolio 60 / terminale 40, artefacts répartis |

Tu peux valider en bloc, ou ajuster une ligne ; je n'écris rien avant.

---

## 8. Plan d'exécution du seed (après validation)

1. **Incrémenter `_metadata.version`** du pack (`pack-demo-20.js`) et le flag
   `demo-version-installee` (idempotence du seed, `demo-namespace.js`).
2. **Ajouter les 2 pratiques configurables** (STD, SPE) à `demo_pratiquesConfigurables`
   (la clé n'existe pas encore → la créer dans `peuplerNamespace`). Attribution « Demo Labo Codex ».
3. **Ajuster les productions** : pondérations (D5) + type terminale (D1).
4. **Ajuster les évaluations** des 4 profils ciblés (D4) — sur la démo uniquement.
5. **Re-jouer la campagne C0** (`campagne-C0-diagnostic.js`, étendue aux 3 ids démo) pour
   vérifier que les 4 profils produisent les contrastes voulus. Itérer si besoin.
6. **Aucune écriture hors `demo_*`** (invariant SPEC §5). Snapshot avant/après (test §7-1).

---

## 9. Ce que cette note ne fait pas

Elle ne touche pas à l'UI (lots C1+), ne modifie aucune donnée pour l'instant, et ne tranche
aucune valeur pédagogique sans toi. Une fois D1–D5 validées, le seed est mécanique et vérifiable
par re-simulation.
