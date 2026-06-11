# Plan #335 + #336 — Garde-fous données : import, fusion, ouverture

> **Date du cadrage** : 11 juin 2026 (Claude Code, après l'incident bis du matin).
> **Statut** : décisions D1-D3 ACTÉES (Grégoire, 11 juin : recommandations telles
> quelles — ordre C→A→B puis D ; marqueur = coursId référencés + manifeste en appoint ;
> garde BLOQUANTE avec choix). ✅ **Lot C LIVRÉ** (11 juin) : `_verifierEcritureTemoins`
> (clés témoins relues depuis IDB, comparaison JSON stricte, retentative ciblée unique,
> alerte explicite), câblé en étape 5 bis de `chargerCodex` après `db.flush()`. Tests :
> `sentinelle-persistance-import-335C.test.js` (9 cas, dont la repro exacte de
> l'incident bis — copie périmée en IDB → signalée).
> ✅ **Lot A LIVRÉ** (11 juin) : `_detecterModeleAnterieur` (coursId référencés
> disjoints par trimestre = modèles divergents ; chevauchement partiel = même lignée,
> pas d'alerte) + garde BLOQUANTE avec choix dans `chargerCodex` (avant toute écriture,
> Annuler → throw, espace intact) ET `actionFusionner` (avant l'analyse). Tests :
> `sentinelle-modele-anterieur-335A.test.js` (10 cas, dont la repro I1/I3).
> ✅ **Lot B LIVRÉ** (11 juin) : `corrigerTrimestresMultiplesActifs` choisit PARMI les
> trimestres marqués actifs (année desc, H>E>A) — la date du jour ne peut plus élire un
> trimestre non marqué (incident I2). Tests : `sentinelle-trimestre-intention-335B.test.js`
> (4 cas, repro I2). **Reste : Lot D (#336, purge à l'ouverture — session dédiée).**
> **Pourquoi maintenant** : trois incidents de la même famille en 28 heures, tous sur
> données réelles H2026 — (I1) import du codex iPad pré-chantier-D qui écrase le modèle
> consolidé Mac (10-11 juin) ; (I2) trimestre actif basculé sur Été par l'heuristique de
> date après restauration ; (I3) résurrection de la version périmée de `h2026_productions`
> après un simple rechargement (11 juin 09h10→09h30, hypothèse copie IDB périmée —
> détail au BACKLOG #335). Le dénominateur commun : **rien ne vérifie qu'un état écrit
> est bien celui qui sera relu**, et **rien ne détecte qu'un état entrant est plus vieux
> que l'état courant**.

---

## Lots proposés (ordre recommandé : C → A → B → D)

### Lot C — Vérification d'écriture post-import (petit, protection immédiate)
Après `chargerCodex` (phase données terminée), relire EN IDB des clés témoins
(`productions`, `evaluationsSauvegardees`, `groupesCours`, `trimestres`, namespacées du
trimestre du codex) et comparer leur empreinte à ce qui devait être écrit — on a déjà
`_sha256Hex`/`_indexerSnapshot` (#334 C), c'est une réutilisation directe. Écart →
message explicite « L'écriture n'a pas persisté (clé X) — réessaie ou libère de
l'espace », JAMAIS d'échec silencieux. C'est exactement le trou de l'incident I3.
**Risque : faible** (lecture + comparaison, aucun changement des écritures).

### Lot A — Détection de modèle antérieur (import ET fusion)
Avant d'appliquer un codex externe, comparer l'identité du modèle entrant à l'espace
courant et BLOQUER avec choix explicite si l'entrant paraît antérieur. Marqueurs
candidats (D2 à trancher) :
- les `coursId` référencés par `productions`/`evaluationsSauvegardees` de l'externe
  vs ceux de l'espace courant (le marqueur qui aurait attrapé I1 ET I3) ;
- la date du manifeste externe vs la date du dernier état local (`_codex_etat`) ;
- les flags de migration embarqués dans le dataset externe.
S'applique à `chargerCodex` ET à `actionFusionner` (un externe antérieur en fusion
3-way régresse silencieusement toute clé non modifiée localement — mécanique correcte,
résultat désastreux).
**Risque : moyen** (faux positifs à calibrer — un avertissement de trop vaut mieux
qu'un écrasement de trop, mais pas un avertissement à CHAQUE import légitime).

### Lot B — Trimestre actif : l'intention prime sur le calendrier (#335 volet 2)
`corrigerTrimestresMultiplesActifs` tranche les multi-actifs par la date du jour et
PERSISTE — l'intention déclarée du codex importé est écrasée (I2 : H2026 → Été).
Fix : le trimestre actif du codex importé fait foi ; l'heuristique de date ne sert
qu'en l'absence totale d'intention déclarée.
**Risque : faible-moyen** (toucher une fonction de boot, sentinelle requise).

### Lot D — Purge de l'espace précédent à l'ouverture (#336)
Ouvrir un codex = REMPLACEMENT (ECOSYSTEME-DONNEES.md) : purger blobs non référencés
et clés orphelines à la fin d'un import COMPLET seulement. Préview/comptage console
d'abord, périmètre strictement `chargerCodex` (jamais la fusion).
**Risque : élevé** (suppression de données) → session dédiée, en dernier.

## Décisions à trancher (Grégoire)

- **D1 — Ordre** : C → A → B → D (recommandé : protection immédiate d'abord, purge
  destructive en dernier). C+A+B tiennent dans une session ; D séparée.
- **D2 — Marqueur de détection (lot A)** : recommandation = comparaison des `coursId`
  référencés (attrape I1/I3, robuste sans nouveau format) + date de manifeste en
  appoint. Alternative plus structurante : versionner le modèle dans le manifeste
  (champ `modeleVersion`) — propre mais ne protège pas contre les codex déjà existants.
- **D3 — Comportement à la détection (lot A)** : bloquer avec choix explicite
  (« Ce codex semble plus ancien que ton espace — Remplacer quand même / Annuler »)
  vs avertissement non bloquant. Recommandation : bloquant (deux incidents réels).

## Critères de fin
Lot C : sentinelle + test d'un import avec écriture IDB sabotée (stub) → message visible.
Lot A : les codex de l'incident (29 mai, iPad pré-D) déclenchent la garde en import ET
fusion ; un codex frais ne la déclenche pas. Lot B : import d'un codex H2026 en juin →
H2026 reste actif. Lot D : preview console validée par Grégoire avant activation.
