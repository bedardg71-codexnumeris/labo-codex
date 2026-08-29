# SUIVI — Onglets Conception et Évaluations, depuis les audits du 25 août 2026

> **Ce document est la référence unique** pour répondre à « où en sommes-nous par rapport au travail
> commencé le 25 août ? ». Il aligne, constat par constat, les deux audits de départ, l'item du backlog
> qui en est né, et l'état de cet item aujourd'hui. Les audits sont des photos ; le backlog est vivant
> mais dispersé ; ce fichier est la colonne « statut » qui manquait entre les deux.
>
> **Règle d'entretien** : chaque livraison qui touche une ligne d'ici coche sa ligne (statut, version,
> commit). `RELAIS.md` renvoie ici au lieu de redire. Une ligne sans item est un trou à inscrire, pas
> à oublier.
>
> **État au 29 août 2026, 1.106.0 (+ #578, #574-retrait et #593 livrés, bump dû), `main`.** Créé par Claude Code à la demande de Grégoire
> (option A : point zéro = 25 août ; la seconde passe du 27 s'y superpose en second bloc).

---

## 0. Les chiffres de tête

| Onglet | Constats de départ (25 août) | Réglés | Partiels | Ouverts | Items ouverts qui les portent |
|---|---|---|---|---|---|
| **Conception** | 15 (A1-A4, B1-B5, C1-C6) | **11** | 0 | **4** | #519 (C1, C3, C5), #520 (C6) — plus deux restes rattachés : #522, barre d'actions du 4ᵉ écran |
| **Évaluations** | 20 (A1-A2, B1-B13, C1-C5) + section D « mineurs » | **9** | **1** (B9) | **10** | #560, #561, #562, #563, #566, #567, #568, #569, #570, #571 ; D partiel → #572 |

Lecture honnête de ces chiffres : Conception est **presque bouclé sur sa liste de départ** — ce qui reste est du design et du zéro-dette. Évaluations a réglé **ses deux critiques et le cœur des majeurs** (import, auto-save, export) ; ce qui reste est surtout le garde des modes, l'échappement, et toute la colonne design.

Mais la seconde passe du 27 août (§2) a **ajouté au périmètre** : deux trous sous les correctifs de Conception (dont un livré depuis, #573), et tout le chantier des échelles (#555, #574, #577-#580, #583-#586, #590). C'est ce second bloc qui a brouillé les repères : il n'était rattaché à aucune des deux listes de départ.

---

## 1. Ligne de base — les deux audits du 25 août

### 1.1 Conception (`Rapports/AUDIT-conception-gabarits-2026-08-25.md`)

| Constat | Ce que c'était | Item | Statut | Preuve |
|---|---|---|---|---|
| **A1** « + Nouvelle production » n'initialise pas les blocs de consignes | Fiche neuve sans bloc au 1ᵉʳ geste ; consignes de la production précédente héritées et enregistrées | #509 | ✅ Livré 26 août | Porte terrain 26 août 21/21 ; sentinelle de couture |
| **A2** Course « lost update » sur l'autosave grilles/échelles | Deux blurs rapprochés lisaient le même instantané ; l'un écrasait l'autre | #510 | ✅ Livré 26 août | `db.modifier` (file par clé) ; 2 break-tests rouges |
| ↳ reste de A2 | Les autres autosaves en lecture-modification-écriture | #522 | ⏳ Ouvert | Audit non fait ; recoupe la mémoire `autosaves-a-auditer` |
| **A3** L'astérisque « Nom du critère » promettait un refus inexistant | Sentinelle #506 ancrée sur du code mort (`#critereNom`) | #516 | ✅ Livré 26 août — verdict D1 : refuser | Astérisques rouges partout ; preuve réancrée ; code mort `sauvegarderCritere` → #469 |
| **A4** Le transport des productions écartait le contenu pédagogique | `SCHEMAS_IMPORT.production` liste blanche sans consignes ; idem grilles (`sousCriteres`, `categoriesErreurs`) | #511 | ✅ Livré 26 août | Sentinelle « toute clé écrite est transportée ou exclue sciemment » |
| ↳ reste de A4 | Sort de `coursId` au transport | #521 | ✅ Tranché 26 août : non transporté | Décision 3.2, porte terrain |
| **B1** Cartouche : matrice en RAM jusqu'au bouton | Modèle inverse des voisins ; perte silencieuse | #517 | ✅ Livré 26 août — verdict D2 : autosave | `persisterCartouchePartielle` via `db.modifier` |
| ↳ reste de B1 | Barre d'actions en tête sur le 4ᵉ écran (#503 visait trois écrans) | versé à #519 | ⏳ Ouvert | — |
| ↳ trou trouvé sous B1 le 27 août | Après « Enregistrer », la cartouche ouverte était remplacée par une neuve ; l'autosave devenait muet | #573 | ✅ Livré 28 août | Cause du « des fois ça enregistre, des fois non » ; sentinelle exécute la séquence |
| **B2** Champ personnalisé rempli mais sans titre écarté en silence | — | #518 | ✅ Livré 26 août — verdict D4 : avertir | `validerBlocsNommes` ; 3 break-tests rouges |
| **B3** PDF : les blocs de consignes ne changeaient pas de page | Contenu dessiné sous le bord du papier | #514 | ✅ Livré 26 août | Sentinelle mesure ce qui est dessiné ; porte terrain |
| **B4** Le modal s'ouvrait sur « Consignes » au lieu du document complet | `select.value` = 1ʳᵉ option au 1ᵉʳ usage | #512 | ✅ Livré 26 août | — |
| **B5** « Consignes seules » exigeait grille ET échelle | Une production sans grille ne produisait pas son document | #513 | ✅ Livré 26 août | Formulaire inline « tel quel » (décision 3.1) ; prédicat unique `productionAConsignes` |
| **C1** `design-system.html` ne documente pas les composants du chantier | — | #519 | ⏳ Ouvert | — |
| **C2** Légende des astérisques absente hors Production | — | #524 | ✅ Livré 26 août (1.99.3) | Légende sur les 4 écrans ; Cartouche exclue par décision testée |
| **C3** Cibles tactiles < 44 px (chevrons, corbeille) | — | #519 | ⏳ Ouvert | — |
| **C4** `#f0c674` en dur | — | #515 | ✅ Livré 26 août | `--alerte-texte-attention` |
| **C5** Rangée de cinq boutons pleins multicolores | — | #519 | ⏳ Ouvert | — |
| **C6** « ANCIEN SYSTÈME » des échelles : ids dupliqués | Bloc caché qui **héberge des gardes qui rassurent à tort** (constat renforcé par #524) | #520 | ⏳ Ouvert | Ablation avec sentinelle ratchet |

Nés du même élan, hors liste de départ mais dans l'onglet : **#524-#528** (astérisques, `valeurCalcul`, plage vs valeur ponctuelle, retrait du repli milieu de plage, aides en paire — tous livrés le 26 août, 1.99.3 → 1.99.7) et **#529** (calcul et affichage sans SRPNF ni IDME, livré 26 août, 1.101.x).

### 1.2 Évaluations (`Rapports/AUDIT-evaluation-onglet-2026-08-25.md`)

| Constat | Ce que c'était | Item | Statut | Preuve |
|---|---|---|---|---|
| **A1** « Vider la corbeille » détruisait au-delà du périmètre annoncé | Modale filtrée par groupe-cours, destruction de tous les groupes | #556 | ✅ Livré 28 août | `viderCorbeille(fichiers)` refuse l'appel nu ; 9 mutations, 7 rouges |
| **A2** `supprimerEvaluation` en double, la corrigée écrasée | Le même écran se comportait différemment selon le bouton | #557 | ✅ Livré 28 août | Définition unique + **cliquet** anti-doublons de globaux |
| ↳ ce que le cliquet a révélé | Neuf autres fonctions définies deux fois sur `window` | #587 | ⏳ Ouvert | Liste tolérée fermée |
| **B1** File d'import non re-persistée après import | Fantômes « à re-déposer », ré-import en doublon | #558 | ✅ Livré 28 août (`e983d3dd`) | — |
| **B2** « Rés. max. » revenait à 250 à chaque re-render | — | #558 | ✅ Livré 28 août | — |
| **B3** Choix par fichier perdus à la restauration | Protection #313 inopérante après reload | #558 | ✅ Livré 28 août | — |
| **B4** Poste de préparation : la case cochée marquait un fichier étranger | — | #559 | ✅ Livré 28 août (`384ee6f1`) | Trois fonctions, pas deux |
| **B5** Suppressions par couple trop larges + contournement du garde des modes | — | #560 | ⏳ Ouvert | Deux sites vivants ; second défaut (portée) distinct |
| **B6** Réassociation avec jeton : l'async n'est pas attendu | Reprise créée sur l'ancienne production | #561 | ⏳ Ouvert | Se traite avec le `if` vide de `changerProductionFichier` (#572) |
| **B7** Échappement incomplet dans la Liste | `da`, `niveauFinal` + `evaluationId`, `productionId`, `fichierId` | #562 | ⏳ Ouvert — **débloqué** | Sa dépendance (`echapperHtml` n'échappait pas `"`) est **levée** le 28 août (`00a81a24`) |
| **B8** Le jeton personnalisé contournait le garde des modes | **Site mort** — mesuré le 28 août | #560 | ⏳ Ouvert | À traiter par retrait, pas par correctif |
| **B9** Décocher « Reprise ciblée » ne retirait rien ; échecs silencieux | — | #563 | 🟠 Partiel 28 août (`c5123798`) | Échecs silencieux réglés (point de persistance unique) ; **retrait de la case arbitré (option C) mais non exécuté** |
| **B10** L'auto-save ne couvrait que les critères | Rétroaction seule perdue en navigation rapide | #564 | ✅ Livré 28 août (`b4755301`) | — |
| **B11** Un étudiant en échec avortait tout le lot d'export | — | #565 | ✅ Livré 28 août (`cf378263`) | Échec isolé et nommé |
| **B12** L'échec de la page de synthèse était invisible | — | #565 | ✅ Livré 28 août | Copie sans synthèse signalée à part |
| **B13** Écart d'anonymisation dans la synthèse ; compteur trompeur | — | #566 | ⏳ Ouvert | Libellé cité inexistant (rectifié) ; l'écart, lui, est réel |
| **C1** Variables CSS fantômes (`--attention`…) | Avertissements sans couleur d'alerte | #567 | ⏳ Ouvert | ~12 usages |
| **C2** Cibles tactiles < 44 px | — | #568 | ⏳ Ouvert | Norme déjà appliquée ailleurs |
| **C3** Écran « Exporter et archiver » hors design system | `form-select` ×6 (+2 sur Importer), pas d'état vide | #569 | ⏳ Ouvert | Portée rectifiée 28 août |
| **C4** Flèches de tri à 2,0:1 en mode clair | **Ids dupliqués** à corriger avant la couleur | #570 | ⏳ Ouvert | Vérification à l'écran requise |
| **C5** PDF de rétroaction : densité et lisibilité | — | #571 | ⏳ Ouvert — **arbitré** 28 août | Correctifs oui (luminance, date), tailles non avant l'automne ; **à re-mesurer sur HEAD** (fichier touché par #555) |
| **D** Mineurs (Import, Liste, Annoter, Export, Design) | — | #572 | 🟠 Partiel 28 août (`43866c56`, `00a81a24`, `828981ad`) | Import et Export faits ; **restent Liste, Annoter, Design mineur** ; clés sessionStorage non namespacées à ouvrir à part ; `console.log` de diagnostic déclarés non recevables |

---

## 2. Seconde passe — ce que le 27 août a ajouté au périmètre

Source : `Rapports/AUDIT-decouplage-srpnf-idme-conception-2026-08-27.md` (§7 Conception, §9 « ce qui attend Grégoire »), puis `Rapports/AUDIT-copies-echelle-reperes-2026-08-28.md`. Ces constats **ne figuraient pas dans les listes du 25** ; c'est ici que les repères se sont perdus.

### 2.1 Conception — §7.2 « ce qui ne tient pas »

| N° | Constat | Item | Statut |
|---|---|---|---|
| 1 | Après « Enregistrer », la cartouche ouverte est remplacée par une neuve | #573 | ✅ Livré 28 août |
| 2 | Un niveau neuf naît avec `valeurCalcul: 50` écrit en base | dans #574 | ⏳ **Non tranché** — un niveau vide en base = collision de clés (#524) ; forme juste = tampon jusqu'à complétude ; lot à part |
| 3 | `ECHELLE_GENERIQUE` et les gabarits d'échelle sont non calculables depuis #527 | #574 | ✅ Retrait livré 29 août ; sonde rapportée : **aucune donnée à réparer** (0 échelle réelle sans valeur, 0 évaluation/production concernée) |
| 4 | La cartouche neuve prend les colonnes de la première échelle du trimestre | #578 | ✅ Livré 29 août (option A) — et une **régression du 26 août** trouvée en chemin : les deux listes du formulaire de cartouche étaient mortes (`e50155e0`), rebranchées ; cliquet posé. Reste : compter les cartouches existantes nées du chemin fautif |
| 5 | Sentinelle #549, tests 3-4 tautologiques sur l'en-tête | #593 | ✅ Livré 29 août (réancré sur `## Le travail demandé`) |
| 6 | Texte du modèle de cartouche : « seuil de maîtrise », figé dans le code | #593 | ✅ Livré 29 août (nomme le repère de l'échelle, ou dit qu'il n'y en a pas) |
| 7 | Course inter-cartouches (faible) ; câblage #518 non verrouillé ; `getCouleurNiveau` mort | #593 | ✅ Livré 29 août (course reproduite et fermée ; cliquet #518 ; colorieur retiré) |
| D3 | Clés `cartouches_${grilleId}` sans `cle()` — globales, orphelines si la grille disparaît | #593 (→ #358) | ⏳ Inscrit 29 août ; chantier de namespacing, renvoyé à la Brique D |

⮕ Les quatre lignes sont inscrites sous **#593** le 29 août (D3 y est renvoyé à #358).

### 2.2 Échelles — le chantier qui a grossi entre les deux audits

| Item | Objet | Statut |
|---|---|---|
| #555 | Seuil de défi, replis divergents, marque de maîtrise absente | ✅ Lots 1-2 livrés 27-28 août (1.105.0) ; **deux décisions tranchées le 29 août** : zone intermédiaire = progrès (option C) ; intention « Outils d'observation » close (option A) — **exécution due** |
| #577 | L'assistant de pratique ignore les repères | ✅ Livré 28 août |
| #579 | L'échelle embarquée d'une pratique ne reçoit pas ses repères | 🟠 Clos pour le cas de l'assistant ; reste ouvert |
| #580 | Deux reconstructions d'échelle à liste blanche | ⏳ Ouvert |
| #583 | Partager une échelle la prive de ses repères | ⏳ Ouvert |
| #584 | Export recherche muet sur les repères | ⏳ Ouvert |
| #586 | Trois chemins de duplication sur quatre emportent `idOriginal` | ⏳ Ouvert |
| #590 | Trois résolveurs d'échelle divergents | ⏳ Ouvert — diagnostic `_diagnostiquerResolutionEchelles()` **dû par Grégoire** |
| #592 | Mode « par objectifs » mort, porte encore `seuilMaitrise` | ⏳ Ouvert |

### 2.3 Évaluations — ajouts du 27-28 août

| Item | Objet | Statut |
|---|---|---|
| #576 | Bilan de rétroaction vide quand la grille d'origine est introuvable | ✅ Livré 28 août |
| #575 | Lot 4 du plan SOLO (codé en dur qui fausse les chiffres) — touche le bilan et le PDF | 🟠 Fini sauf B10, livré ensuite ; voir l'item |
| #581, #582 | Rétroaction EUF/CAF pour tout le monde ; devis lu en périodes | ⏳ Ouverts (adjacents) |
| #553, #554 | Rabotage `startsWith('francais')` ; statut de décrochage non transmis | ⏳ Ouverts (dépistage, adjacents) |

---

## 3. Ce qui reste, par onglet — la liste de travail

Ordre proposé : d'abord ce qui est **tranché et pas exécuté** (le plus court chemin vers un repère net), puis ce qui est ouvert sans décision, puis le design.

### Conception

1. ~~**#578 A**~~ — livré 29 août.
2. ~~**#574 B**~~ — retrait livré, sonde rapportée (rien à réparer) ; reste le niveau neuf (à trancher).
3. ~~**#593**~~ — livré 29 août (n° 5-6-7) ; D3 renvoyé à #358.
4. **#522** — audit des autres autosaves (la primitive `db.modifier` existe).
5. **#520** — ablation de l'« ANCIEN SYSTÈME » des échelles.
6. **#519** — passe design (C1, C3, C5 + barre d'actions du 4ᵉ écran).

### Évaluations

1. **#555 exécution** — ligne « Progrès » à trois zones (C) dans le PDF et le bilan ; texte d'aide du curseur « Seuil de défi » (A). Libellés = les mots de Grégoire.
2. **#563** — retirer la case « Reprise ciblée » (tranché option C) et son test devenu caduc.
3. **#562** — échappement de la Liste, désormais débloqué.
4. **#560** — garde des modes : deux sites vivants à router, un site mort à retirer.
5. **#561** — attendre `changerProductionFichier` (+ le `if` vide voisin).
6. **#571** — correctifs arbitrés (garde de luminance, date), à re-mesurer sur HEAD d'abord.
7. **#566** — anonymisation de la synthèse ; compteur.
8. **#572** — Liste, Annoter, Design mineur ; ouvrir à part les clés sessionStorage.
9. **#567, #568, #569, #570** — la colonne design (#570 : ids dupliqués d'abord).
10. **#587** — les neuf doublons tolérés par le cliquet.

### Échelles (transversal, né entre les deux audits)

#590 (après le diagnostic dû), #579, #580, #583, #584, #586, #592.

---

## 4. Registre des décisions rendues sur ce périmètre

| Date | Décision | Où |
|---|---|---|
| 26 août | D1 refuser un critère sans nom, astérisques rouges ; D2 autosave des cartouches ; D4 avertir pour un bloc sans titre ; 3.1 formulaire inline tel quel ; 3.2 `coursId` non transporté | #516, #517, #518, #513, #521 |
| 26 août | `valeurCalcul` obligatoire ; repli milieu de plage retiré (mesuré avant) | #526, #527 |
| 28 août | #563 retirer la case ; #571 correctifs oui, tailles non ; #574 retirer seeds/gabarits ; #578 mesurer avant de coder ; #555 repli non lisible = ne rien calculer et le dire (B) ; nommage (A) | items respectifs |
| 29 août | #555·1 zone intermédiaire = progrès (C) ; #555·2 clore l'intention (A) ; #578 la cartouche ne devine plus (A) | artefact `claude.ai/code/artifact/89f28423-…` |

---

## 5. Limites de ce suivi

- Les statuts sont ceux du backlog au 29 août, relus item par item, pas déduits d'un compte. Un item « livré » l'est au sens du backlog ; les portes terrain tenues sont citées quand elles existent (26 août : 21/21).
- Les constats de la seconde passe hors Conception/Évaluations (dépistage, interventions, volet données #542) ne sont pas suivis ici : ils ont leur propre plan (`PLAN-SOLO-echelle-et-depistage.md`, #575).
- Ce document ne remplace ni les audits (le détail y reste) ni le backlog (l'état y vit) : il les aligne.
