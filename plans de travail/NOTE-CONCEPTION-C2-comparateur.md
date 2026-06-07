# Note de conception — Comparateur de pratiques, lot C2 (fiche de profil)

> **Statut** : **moteur de traçabilité COMPLET (C2-a/b/c livrés et poussés)** ; design C2-d acté le 7 juin 2026, **code C2-d à venir**. Orientation A validée le 6 juin (étendre le moteur, additif + découpage par famille).
> - **C2-a** (STD, `recit` dans `calculerDetailsNoteFinale`) — livré, `278b95f7`.
> - **C2-b** (SOM, `PratiqueSommative.decrireCalcul`) — livré, `1e5778a1` (7 juin).
> - **C2-c** (SPE, `PratiquePanSpecifications.decrireCalcul`) — livré, `71b7119a` (7 juin).
> Les 3 familles produisent le contrat §4. 230 Vitest + 32 Playwright verts. Pas de bump.
> Préalable : C0 livré (seed démo v20.8) + C1 livré et poussé.
> Cadre : `SPEC_comparateur_pratiques.md` §3.2 ; finalité §1 bis ; skill `pratiques_notation`.
> Les emplacements `fichier:ligne` datent du 6 juin — **revérifier au moment de coder**.

---

## 1. Objet et périmètre

**C2 = la fiche de profil** (le « récit » qui s'ouvre au clic sur une ligne de la matrice C1).

**Dans C2** :
- **(E2) Récit de calcul par pratique** : le *sort de chaque résultat* du profil (compté X %, écarté, remplacé par reprise, non exigé pour le forfait, obligatoire).
- **(E2 bis) Maîtrise en fin de parcours** : trajectoire des niveaux dans le temps + démonstration finale (terminale).
- **Phrase de contexte** écrite à la main pour chacun des 4 profils.
- **Navigation matrice ↔ fiche** (clic ligne → fiche ; retour 1 clic ; éphémère ; focus à l'ouverture).

**Hors C2** : export CSV (**C3**), entrée de navigation pérenne (**C4**), release `minor` (**C5**), famille DEN (#318).

---

## 2. Décisions actées (6 juin 2026)

1. **Orientation A — étendre le moteur (SSOT)**, pas dériver dans le comparateur. Motif : principe zéro-dette/SSOT (CLAUDE.md) + éviter l'anti-pattern documenté « deux systèmes de calcul » (mémoire `project-deux-systemes-calcul-pratiques`). Dériver le sort des résultats dans la vue recréerait un **troisième** chemin de sélection → divergence.
2. **Extension strictement ADDITIVE** : on ajoute de la *traçabilité*, on ne change **aucune note calculée**. Invariant verrouillé par sentinelle (cf. §10).
3. **Livraison par famille** (blocs courts) : C2-a STD → C2-b SOM → C2-c SPE → C2-d intégration fiche (E2bis + navigation + phrases de contexte). La fiche STD est un livrable intermédiaire complet.
4. **Continuité C1** : vocabulaire neutre, **jamais `I/D/M/E` en dur** ; les niveaux passent par les **libellés de l'échelle** ; SOLO seulement au survol (mémoire `project-comparateur-niveau-atteint-neutre`). Finalité §1 bis : la maîtrise est mise *en regard* de la note, l'écart en points reste discret.

---

## 3. Constat moteur (vérifié le 6 juin)

| Bloc | Exposé aujourd'hui | Manquant pour E2 |
|---|---|---|
| **STD** | `calculerDetailsNoteFinale` (`profil-etudiant-actions.js:403`) → `portfolio.artefactsRetenus[]` (id, note, niveau), `methodeSelection`, `plafonnement`, pondérations portfolio/terminale | artefacts **écartés** (évalués hors sélection), **remplacements** par reprise |
| **SOM** | `calculerPerformance` (`pratique-sommative.js:63`) → un nombre (indice P) | la **décomposition** : chaque évaluation, sa pondération, sa contribution ; les remplacées exclues |
| **SPE** | `calculerPerformance` (`pratique-pan-specifications.js`) → un nombre ; `calculerDetailsNoteFinale` **ne supporte pas SPE** (`return null` ligne 420 hors STD) | le **palier atteint** vs requis, les exigences **satisfaites / non exigées** par type de travail |
| **E2bis (trajectoire IDME)** | `_evalsProfil()` + `_niveauAtteint()` dans `comparateur-pratiques.js` extraient déjà la séquence triée par date + repèrent la terminale (`type==='terminale'`, `_identifierProductionTerminale` `profil-etudiant-actions.js:222`) | rien de bloquant — réutilisable en lecture seule |

**Conclusion** : E2bis et la navigation sont faisables avec l'existant. Le travail moteur porte **uniquement** sur le récit E2, famille par famille, en additif.

---

## 4. Brique neuve centrale — le contrat de traçabilité unifié

Pour que la fiche reste **neutre** (pluraliste) et **agnostique du chemin de calcul** (STD via procédural, SOM/SPE via instances), chaque famille produit un **même objet normalisé**. La vue ne connaît que ce contrat ; elle n'inspecte jamais les internes d'une famille.

```
RecitCalcul = {
  famille:   'STD' | 'SOM' | 'SPE',        // code registre (obtenirCode())
  pratiqueNom: string,
  resultats: [                              // un par évaluation/exigence, trié par date
    {
      label:   string,                      // titre de la production/éval (echapperHtml à l'affichage)
      date:    string | null,               // dateEvaluation
      niveau:  string | null,               // CODE de niveau brut (jamais affiché tel quel ;
                                            //   traduit par l'échelle à la vue)
      note:    number | null,               // 0-100
      sort:    'compte' | 'ecarte' | 'remplace'
             | 'obligatoire' | 'non-exige' | 'satisfait' | 'manquant',
      detail:  string                       // phrase neutre prête à afficher :
                                            //   « compté · poids 30 % », « écarté · 4ᵉ rang »,
                                            //   « remplacé par la reprise du 15 avril »,
                                            //   « non exigé pour le forfait B »…
    }
  ],
  synthese: {                               // ce qui produit la note finale
    formuleTexte: string,                   // ex. « (78,5 × 60 + 82 × 40) / 100 »
    noteFinale:   number | null,
    plafonnement: object | null             // STD : déficit de conformité, le cas échéant
  }
}
```

> **Règle de neutralité** : `niveau` reste un **code brut** dans le contrat ; sa traduction en libellé (« Maîtrisé ») et la description SOLO au survol se font **à la vue** via l'échelle de la grille — exactement comme la colonne « Niveau atteint » de C1. Aucun littéral `I/D/M/E` dans le moteur de traçabilité ni dans la vue.

Le contrat est **lecture seule** et **additif** : produit par une nouvelle méthode, sans toucher `calculerPerformance` ni la `noteFinale`.

---

## 5. Extensions moteur par famille (additives)

### C2-a — STD
- Enrichir `_selectionnerArtefactsLegacy` / `_selectionnerArtefactsHybride` (appelées par `calculerDetailsNoteFinale`, `profil-etudiant-actions.js:470`) pour renvoyer **aussi** les **écartés** (évaluations valides non retenues) — pas seulement `artefactsRetenus`.
- Dériver les **remplacements** depuis les données d'évaluation (`remplaceeParId` / `estReprise`, déjà présents).
- Ajouter au retour de `calculerDetailsNoteFinale` un champ `recit` conforme au contrat §4 (la `noteFinale` et tout le reste **inchangés**).

### C2-b — SOM
- Méthode additive `decrireCalcul(da)` sur `PratiqueSommative` : reprend la boucle de `calculerPerformance` (`pratique-sommative.js:89-96`) pour exposer, par évaluation, `note` + `ponderation` + contribution, et marquer `remplace` celles filtrées par `remplaceeParId`. `calculerPerformance` **inchangée** (la note ne bouge pas).

### C2-c — SPE
- Méthode additive `decrireCalcul(da)` sur `PratiquePanSpecifications` : exposer le **palier atteint** (`_determinerPalierBundle`) et, par type de travail, `satisfait` / `non-exige` / `manquant` (depuis `_compterTravauxAcceptables`). Aucune note recalculée.

> Les 3 familles non concernées en phase 1 (par-objectifs, dénotation, configurable générique) peuvent recevoir une `decrireCalcul` minimale ou un repli « récit indisponible » — **jamais** d'échec global (cf. §3.3 SPEC, diagnostic par colonne).

---

## 6. Layout de la fiche

```
┌─────────────────────────────────────────────────────────────┐
│  ‹ Retour à la comparaison                            [✕]     │
│  Irrégulier · DEMO011                                         │
│  « A raté deux des premières remises ; a démontré la          │
│    maîtrise sur les productions suivantes. »   ← contexte     │
├─────────────────────────────────────────────────────────────┤
│  MAÎTRISE EN FIN DE PARCOURS                      (E2 bis)    │
│  Débuts → … → Maîtrisé   (trajectoire, libellés d'échelle)    │
│  Démonstration finale (terminale) : Maîtrisé                  │
├─────────────────────────────────────────────────────────────┤
│  CE QUE CHAQUE PRATIQUE RETIENT                  (E2)         │
│  ┌── Standards (Ta pratique) ──────────────────────────┐     │
│  │  Artefact 1 · Maîtrisé 85  · compté (retenu)         │     │
│  │  Artefact 2 · …       60  · écarté (hors 4 meilleurs)│     │
│  │  Artefact 3 · …       —   · remplacé par la reprise  │     │
│  │  Terminale  · Maîtrisé 82 · compté · poids 40 %      │     │
│  │  → (78,5 × 60 + 82 × 40) / 100 = 79,9                │     │
│  └─────────────────────────────────────────────────────┘     │
│  ┌── Sommative (simulation) ──────────────────────────┐      │
│  │  chaque résultat · compté une fois · à son poids    │      │
│  └─────────────────────────────────────────────────────┘     │
│  …                                                            │
├─────────────────────────────────────────────────────────────┤
│  Une pratique ne « vaut » pas mieux qu'une autre — elles      │
│  ne mesurent pas la même chose.            ← ligne de garde   │
└─────────────────────────────────────────────────────────────┘
```

- **En-tête** : libellé de profil + DA + **phrase de contexte** (§9).
- **Bloc maîtrise (E2bis) en premier** : c'est lui qui porte la finalité (« la note reflète-t-elle la compétence atteinte ? »). Trajectoire en **libellés d'échelle**, terminale mise en évidence.
- **Bloc récit (E2)** : une carte par pratique comparée (référence d'abord, marquée « Ta pratique »), pilotée par le contrat §4. Le sort de chaque résultat en clair ; la formule de synthèse discrète en pied de carte.
- **Réutilisation** : s'inspirer du rendu existant `profil-etudiant-sections-affichage.js:2554-2797` (`_decrireRetenu`, `renderLigneRetenu`) — **sans le copier**, en le réécrivant sur le contrat §4 pour rester neutre et unifié.
- `echapperHtml()` sur tout label injecté.

---

## 7. Navigation matrice ↔ fiche

- C1 ne pose pas encore de handler de ligne. En C2-d : rendre chaque `<tr>` de profil **activable** (clic + clavier Entrée/Espace, `role` adéquat, cible ≥ 44 px).
- Ouverture de la fiche = **remplacement de contenu dans le même panneau** (`#comparateur-pratiques-panel`) ou sous-vue ; **focus déplacé** vers le titre de la fiche (règle SPA).
- Retour = un clic « ‹ Retour à la comparaison » → re-rendu de la matrice (état des sélecteurs préservé, comme le recalcul C1-d).
- **Éphémère** : aucun état persisté entre deux ouvertures.

---

## 8. E2 bis — trajectoire de maîtrise (réutilisation, pas de moteur neuf)

- Source : `_evalsProfil(da)` (déjà dans le module, tri par date) + `_niveauAtteint(da)` (terminale ou repli dernière éval datée).
- Traduction des niveaux par l'**échelle de la grille** (mécanisme identique à la colonne « Niveau atteint » de C1) — libellés + description SOLO au survol.
- Aucune valeur IDME en dur ; aucune écriture.

---

## 9. Phrases de contexte — **livrable de contenu (Grégoire)**

Une phrase par profil, écrite à la main (registre pédagogique, pas de génération). À fournir/valider par Grégoire avant C2-d :

| Profil | DA | Phrase de contexte (à rédiger par Grégoire) |
|---|---|---|
| Fort | DEMO010 | _… ex. « Régulier et solide ; les trois pratiques convergent. »_ |
| Moyen | DEMO013 | _…_ |
| En difficulté | DEMO004 | _…_ |
| Irrégulier | DEMO011 | _… ex. « A raté deux premières remises ; maîtrise démontrée ensuite — la moyenne en garde la trace, la trajectoire monte. »_ |

Stockées **en dur** dans le module (stables, racontables), `echapperHtml()` à l'affichage.

---

## 10. Invariant et sentinelle (le garde-fou de l'orientation A)

- **Invariant dur** : pour chaque famille et chaque profil démo, la `noteFinale` (et `P`) **avant/après** l'ajout de la traçabilité est **strictement égale**. L'extension n'ajoute que des champs ; elle ne modifie aucun calcul.
- **Sentinelle de parité** (1 par sous-lot livré) : `tests/unit/sentinelle-recit-calcul-C2-*.test.js` — vérifie (a) `noteFinale` inchangée (golden master sur les 4 profils), (b) le contrat §4 est bien rempli (résultats non vides, `sort` dans l'énumération, somme cohérente avec la synthèse).
- **Invariant non-destructif** (réaffirmé) : aucune écriture (clés réelles **ni** `demo_*`) ; pratique active inchangée ; snapshot avant/après égal.

---

## 11. Accessibilité et responsive (SPEC §3.5)

Focus à l'ouverture de la fiche ; lignes de matrice activables au clavier ; cibles ≥ 44 px ; survol SOLO également atteignable au focus (pas hover-only) ; deux modes sombre/clair ; sur iPad, la fiche reste lisible sans scroll horizontal (cartes empilées). Continuité du relief mode clair livré en C1.

---

## 12. Sous-lots C2 (à valider avant exécution)

| Sous-lot | Contenu | Test ajouté |
|---|---|---|
| **C2-a** | STD : écartés + remplacements dans `_selectionnerArtefacts*` ; champ `recit` (contrat §4) dans `calculerDetailsNoteFinale` | sentinelle parité STD (`noteFinale` inchangée) + contrat rempli |
| **C2-b** | SOM : `decrireCalcul(da)` additif (décomposition pondérée) | sentinelle parité SOM (P inchangé) + contrat rempli |
| **C2-c** | SPE : `decrireCalcul(da)` additif (palier + exigences) ; pas d'échec global hors STD | sentinelle parité SPE + repli familles non couvertes |
| **C2-d** | Fiche : E2bis + cartes récit (contrat) + phrase de contexte + navigation matrice↔fiche (clic/clavier/focus) | rendu DOM fiche + invariant non-destructif (snapshot) |

Chaque sous-lot : `node --check`, `cd tests && npm test`, validation terrain Mac + iPad / sombre + clair avant de poursuivre. **Pas de bump version** (le `minor` reste réservé à C5).

---

## 13. Points à revérifier au code / questions ouvertes

1. **Forme `_selectionnerArtefactsLegacy`/`Hybride`** : confirmer qu'on peut renvoyer les écartés sans casser les appelants existants (signature étendue, pas modifiée).
2. **Remplacements** : confirmer la sémantique réelle dans la démo (`estReprise=0` au seed C0 d'après NOTE C0 ; les remplacements y sont marginaux) — le récit doit rester honnête si aucun remplacement n'existe (« aucune reprise »).
3. **SPE sur la démo** : la pratique SPE configurable calcule des paliers depuis C0 (délégation `PanSpecifications`, commit `47ce3a5f`) — confirmer que `decrireCalcul` lit bien la config configurable, pas un défaut.
4. **Navigation** : sous-vue dans le même panneau vs panneau pair — trancher au code selon la simplicité de gestion du focus (préférence : même panneau, re-rendu).
5. **Phrases de contexte** : à fournir par Grégoire (§9).
6. **Ordre des blocs** dans la fiche — **TRANCHÉ (7 juin 2026) : maîtrise d'abord, puis récit.** Motif de finalité : la maîtrise est l'enjeu, les notes sont mises *en regard* ensuite (sortir du paradigme du cumul). Cf. §14.

---

## 14. Plan d'exécution C2-d (acté 7 juin 2026)

Préalable établi (lecture du code, 7 juin) : `simulerIndices(da, pratiqueId)` (`portfolio.js:714`)
est **déjà l'unique point d'aiguillage** (STD → `calculerDetailsNoteFinale`, sinon
`calculerPerformance`) et conserve `details = d`. Pour STD, `details.recit` (C2-a) y est
donc déjà disponible. La fiche ne doit PAS ré-aiguiller elle-même (sinon 3ᵉ chemin de
résolution = anti-pattern « deux systèmes de calcul »).

**Décision d'architecture (reco actée)** : étendre `simulerIndices` d'un champ `recit`
unifié — STD `recit = details.recit` ; SOM/SPE `recit = instance.decrireCalcul(da)`. La
fiche lit alors `simulerIndices(da, id).recit` quelle que soit la famille. Additif,
lecture seule, verrouillé par sentinelle.

| Sous-lot | Contenu | Nature | Test |
|---|---|---|---|
| **C2-d.0** | Champ `recit` unifié dans `simulerIndices` (aiguillage STD/SOM/SPE) | moteur (additif) | sentinelle : `recit` présent pour les 3 familles, parité `noteFinale` |
| **C2-d.1** | Navigation matrice↔fiche : `<tr>` activable (clic + clavier Entrée/Espace, ≥44 px), ouverture = re-rendu dans `#comparateur-pratiques-panel`, focus au titre, retour 1 clic (état sélecteurs préservé) | UI | rendu DOM + invariant non-destructif |
| **C2-d.2** | Bloc **MAÎTRISE EN FIN DE PARCOURS** (en premier) : trajectoire via `_evalsProfil` + niveau de fin via `_niveauAtteint` (libellés d'échelle, SOLO au survol/focus, jamais I/D/M/E) | UI | rendu DOM |
| **C2-d.3** | Bloc **CE QUE CHAQUE PRATIQUE RETIENT** : une carte par pratique (réf « Ta pratique » d'abord), consommant le contrat §4 via `simulerIndices().recit` ; sort + detail en clair, `niveau` traduit par l'échelle (null pour SPE → pas de pastille), synthèse discrète en pied + ligne de garde | UI | rendu DOM (3 familles) |
| **C2-d.4** | Phrases de contexte (§9, **contenu Grégoire**) en en-tête + intégration finale | contenu + UI | rendu DOM |

Ordre fiche acté : **en-tête (profil + phrase) → MAÎTRISE → RÉCIT → ligne de garde**.
Chaque sous-lot : `node --check`, `cd tests && npm test`, validation terrain Mac + iPad /
sombre + clair. Pas de bump (le `minor` reste réservé à C5). `echapperHtml()` sur tout label.

**En attente de Grégoire avant C2-d.4** : les 4 phrases de contexte (§9).
