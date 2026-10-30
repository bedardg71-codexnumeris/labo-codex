---
name: depistage-rai
description: >
  Dépistage SOLO et réponse à l'intervention (RàI) dans Labo Codex. Utiliser ce
  skill dès qu'il est question de dépistage, d'interventions, de suivi des
  élèves, de niveaux RàI, d'IPB, de patterns d'apprentissage, de trajectoire de
  progression, de SOLO appliqué au dépistage, ou du module interventions.js.
  Aussi quand Grégoire ou un utilisateur mentionne le formulaire
  d'intervention, les sous-groupes, ou le suivi à travers les productions.
---

# Skill — Réponse à l'intervention (RàI) dans Labo Codex

> **Déclenchement** : Utiliser ce skill dès qu'il est question de dépistage, d'interventions, de suivi des élèves, de niveaux RàI, d'IPB, de patterns d'apprentissage, de trajectoire de progression, de SOLO appliqué au dépistage, ou du module interventions.js. Aussi quand Grégoire ou un utilisateur mentionne le formulaire d'intervention, les sous-groupes, ou le suivi à travers les productions.

---

## Positionnement — Ce que la RàI est dans Labo Codex

La RàI dans Labo Codex est une **inspiration**, pas un cadre normatif. Le modèle validé par la recherche (Fuchs, Fuchs & Malone, 2017 ; Desrochers, 2021) est adapté pour servir des enseignants de différentes disciplines et différents collèges, dans des contextes très variés.

### Principes de conception

**Universalité.** Labo Codex est destiné à des enseignants de différents programmes, disciplines et établissements collégiaux. Rien dans l'architecture ne doit être codé en dur pour une pratique personnelle, une discipline ou un cours spécifique. L'assise universelle est la taxonomie SOLO et le modèle RàI — pas les critères d'évaluation d'un enseignant particulier.

**Souplesse.** Les critères d'évaluation (par exemple SRPNF pour la littérature, ou d'autres critères pour d'autres disciplines) sont une couche configurable définie par chaque enseignant dans sa grille de dépistage. Le système de dépistage repose sur les **niveaux taxonomiques SOLO**, pas sur des critères spécifiques.

**Praticabilité.** Un enseignant au cégep n'a ni le temps ni les ressources d'un modèle RàI canonique (primaire/secondaire). L'outil doit être utilisable par un enseignant seul, sans surcharge, avec les ressources réellement disponibles. Les paramètres du modèle théorique (fréquence des séances, taille des groupes, durée des cycles) servent de références, pas de prescriptions.

**Jugement professionnel.** L'app fournit des données et des éclairages. L'enseignant prend les décisions. Labo Codex ne prescrit jamais une intervention — il éclaire le jugement professionnel.

### Ce qui distingue le contexte collégial

Les élèves du cégep savent lire et écrire. Les compétences visées sont complexes : analyse, argumentation, pensée critique, nuance interprétative, résolution de problèmes — dans des disciplines variées. On ne travaille pas sur le décodage ou la fluence de lecture. Le modèle RàI, développé surtout pour le primaire et le secondaire, est ici adapté à un contexte d'enseignement supérieur où les difficultés sont d'un autre ordre.

L'enseignant est souvent le seul intervenant auprès de ses élèves. L'écosystème de soutien (services adaptés, aide pédagogique individuelle, tuteurs) existe mais n'est pas toujours coordonné. Labo Codex pourrait éventuellement servir de lien entre ces intervenants (voir §Vision future).

---

## Ce que Labo Codex emprunte au modèle RàI

Quatre principes directeurs, tirés de Desrochers (2021) et de Fuchs, Fuchs & Malone (2017) :

**1. Le dépistage universel comme portrait, pas comme diagnostic.**
«La fonction générale du dépistage universel n'est pas d'inscrire l'élève dans une catégorie diagnostique, mais plutôt de dresser un portrait de ses forces et de ses faiblesses pour mieux intervenir.» (Desrochers, p. 66) — Dans Labo Codex, ce portrait se construit automatiquement à partir des productions évaluées (artefacts) via les indices, l'IPB et les patterns d'apprentissage.

**2. L'intensification par paliers comme continuum ajustable.**
Trois niveaux d'intervention qui ne sont pas des catégories figées, mais un curseur d'intensité que l'enseignant ajuste selon la réponse de l'élève. Si plus de 20 % des élèves sont en difficulté, c'est le palier 1 qu'il faut renforcer avant d'intensifier aux paliers supérieurs. (Desrochers, p. 68)

**3. Les données au service des décisions, pas l'inverse.**
«L'appréciation des progrès des élèves s'appuie sur des données fiables au lieu d'impressions et chaque évaluation sert à guider des décisions et des actions.» (Desrochers, p. 52) — Labo Codex fournit les données ; l'enseignant prend les décisions.

**4. L'individualisation fondée sur les données.**
Le processus teach-test-revise-test de Fuchs : enseigner, évaluer la réponse, ajuster l'intervention, réévaluer. Dans Labo Codex, les artefacts successifs servent de mesures et les ajustements se documentent dans le module interventions.

### Quatre fonctions du dépistage (Desrochers, 2021)

1. **Suivre les progrès** de chaque élève (trajectoire d'apprentissage)
2. **Repérer les élèves à risque** qui ne réalisent pas les apprentissages attendus malgré un palier 1 efficace
3. **Guider le choix de l'intervention** : quel palier, quelles composantes cibler
4. **Évaluer l'efficacité de l'enseignement** — les données de dépistage sont aussi une rétroaction sur le palier 1. Si trop d'élèves sont en difficulté, ce n'est pas eux le problème — c'est l'enseignement qu'il faut ajuster.

---

## Le système de dépistage — Architecture actuelle

### La taxonomie SOLO comme fondement universel

Le dépistage repose sur les niveaux taxonomiques SOLO, qui sont indépendants de la discipline. La correspondance complète SOLO ↔ IDME (seuils et valeurs normalisées) est définie dans le skill `ecosysteme-classe` (propriétaire désigné par `CLAUDE.md`). Interprétation propre au dépistage :

| Niveau SOLO | Seuil IDME | Interprétation dans le dépistage |
|-------------|-----------|----------------------------------|
| Préstructurel / Unistructurel | I (Insuffisant) | Compréhension fragmentaire, difficulté majeure |
| Multistructurel | D (Développement) | Éléments identifiés mais pas intégrés, fondations fragiles |
| Relationnel | M (Maîtrisé) | Éléments intégrés en un tout cohérent |
| Abstrait étendu | E (Étendu) | Généralisation et transfert au-delà du contexte immédiat |

Chaque critère de la grille de dépistage de l'enseignant porte un attribut `niveauSOLO` (multistructurel, relationnel ou abstrait_étendu). **Le dépistage surveille les critères multistructurels** — ce sont les fondations. Si les fondations ne sont pas acquises, les compétences de niveau supérieur (relationnel, abstrait) ne peuvent pas se développer.

### Les critères de l'enseignant — une couche configurable

Les critères d'évaluation sont définis par chaque enseignant dans sa grille de dépistage (`obtenirGrilleReferenceDepistage()`). Par exemple, un enseignant de littérature pourrait avoir Structure, Rigueur, Plausibilité, Nuance, Français (SRPNF). Un enseignant de philosophie ou de chimie aurait d'autres critères. Ce qui compte pour le dépistage, c'est le **niveau SOLO** de chaque critère, pas son nom.

**Flux grille → dépistage → intervention** :
1. L'enseignant crée sa grille avec des critères nommés librement, chacun avec un `niveauSOLO` (multistructurel, relationnel, abstrait_étendu), un type et une pondération
2. À chaque artefact évalué, le dépistage calcule l'IPB sur les critères multistructurels et le diagnostic croisé sur tous les critères
3. Le profil étudiant (onglet Accompagnement) affiche les critères en défi, classés par niveau SOLO
4. Au moment de planifier une intervention, le formulaire propose les **critères en défi communs** du sous-groupe sélectionné — l'enseignant n'a qu'à valider ou ajuster

Ce flux garantit que l'intervention est alignée sur le dépistage (Alignment de Fuchs) sans que l'enseignant ait à faire l'analyse lui-même.

### L'Indice de Persistance du Blocage (IPB)

L'IPB mesure le nombre d'artefacts consécutifs récents dont le score pondéré des **critères multistructurels** est sous le seuil de défi configurable.

**Fonctionnement** (`calculerIPB()` dans `js/profil-etudiant-calculs.js`) :
1. Filtrer les critères dont le `niveauSOLO === 'multistructurel'`
2. Pour chaque artefact récent, calculer la moyenne pondérée de ces critères
3. Compter les artefacts consécutifs sous le seuil (en partant du plus récent)
4. Calculer la direction (↗ progression, → stable, ↘ régression)

**Note historique** : L'ancien Indice de Blocage (IB) — formule pondérée fixe sur des critères SRPNF spécifiques — a été supprimé en Phase 6. Il est remplacé par l'IPB + le diagnostic croisé (IPB × direction). Les documents de référence dans `références tableur/` qui mentionnent la formule `IB = 0.35×NS + 0.35×NF + 0.30×NR` sont obsolètes sur ce point.

### Le diagnostic croisé IPB × direction

La fonction `diagnostiquerSuiviApprentissage()` (`js/profil-etudiant-calculs.js`) croise l'IPB avec la direction pour produire un diagnostic :

| IPB | Direction | Diagnostic |
|-----|-----------|------------|
| 0 | — | Maîtrise acquise |
| 1 | ↗ | Difficulté résolue |
| 1 | → ou ↘ | Difficulté récente |
| 2 | ↗ | Progression |
| 2 | → | Plateau |
| 2 | ↘ | Difficulté constante |
| ≥ 3 | ↗ | Progression lente |
| ≥ 3 | → ou ↘ | Difficulté persistante |

**#744 (tranché par Grégoire, 16-17 sept. 2026)** : ce diagnostic décrit la PERSISTANCE et ne rend plus de palier — la colonne « Niveau RàI » et le champ `niveauRaI` sont retirés. Le palier d'intervention vient de la carte RàI seule (voir plus bas), y compris pour `determinerCibleIntervention`. « Difficulté récente » est le mot du suivi ; « Difficulté émergente » reste le pattern de la carte RàI, et lui seul.

**#745 (tranché par Grégoire le 16 sept. 2026, livré le 17 — lot E du cadrage du dépistage)** : un élève EXCLU PAR STATUT (inactif, décrochage, abandon — `estEtudiantExclu`, `js/main.js`) est calculé par la règle de SA pratique, comme un actif ; son profil s'ouvre et dit sous le nom « <libellé du statut> · hors des moyennes du groupe » (`libelleStatutEtudiant`). Les deux producteurs (`calculerEtSauvegarderIndicesAssiduite`, `calculerEtStockerIndicesCP`) calculent tout le groupe ; « hors des moyennes » se tient À LA LECTURE (chaque lecteur part d'une liste filtrée et lit les magasins DA par DA — ne jamais parcourir `indicesCP` ni `indicesAssiduite` par leurs clés). Un DA qui n'est plus dans le groupe n'est pas calculé (`horsGroupe: true`, indices `null`). Le repli « 3 meilleures notes » n'existe plus. Sentinelle : `sentinelle-lot-E-745-eleve-exclu`.

### Les patterns d'apprentissage

La fonction `identifierPatternActuel()` (`js/profil-etudiant-calculs.js`) détermine un pattern basé sur la performance (P) et la présence de défis :

| Pattern | Condition | Badge |
|---------|-----------|-------|
| **Difficulté persistante** | sous le repère de suffisance de l'échelle (sans ce repère, sous la note de passage) | `badge-pattern-difficulte-persistante` |
| **Difficulté émergente** | sous le repère de maîtrise ET présence d'un défi | `badge-pattern-difficulte-emergente` |
| **Défi spécifique** | au repère de maîtrise ou au-dessus, mais un défi récurrent identifié | `badge-pattern-defi-specifique` |
| **Stable** | Pas de défi identifié | `badge-pattern-stable` |
| **En progression** | Amélioration sur la fenêtre d'analyse | (via tableau de bord) |

### Le niveau RàI pédagogique

La fonction `determinerNiveauRaiPedagogique()` (`js/profil-etudiant-calculs.js`) dérive les niveaux à partir des patterns et de P :

- **Niveau 3 — Intensif** : Pattern «Difficulté persistante» OU P sous le repère de suffisance
- **Niveau 2 — Préventif** : P sous le repère de maîtrise OU «Difficulté émergente» OU «Défi spécifique»
- **Niveau 1 — Universel** : ni l'un ni l'autre

**Une seule source par famille de seuils (décision de Grégoire, 30 oct. 2026)** : `js/contexte-qualification.js`. A et C lisent les trois champs de Labo › Outils d'observation (défauts 95 · 90 · 85, quatre paliers) ; P lit les repères de l'échelle des copies du groupe (`reperesPerformance`) ; la note de passage, `NOTE_DE_PASSAGE`. Sans repère, seule la note de passage signale, et le test « sous la maîtrise » n'existe pas. Mesures de ce chantier : `scripts/mesures-depistage/`, résultats en page privée seulement.

Cas spéciaux : «Non-participation» (présent mais aucune production → Niveau 3), «En attente» (aucune donnée).

---

## Les trois paliers dans Labo Codex

### Palier 1 — Enseignement universel (≈80 % des élèves)

**Qui** : Tous les élèves, en classe régulière.

**Ce que l'enseignant fait** : Enseignement de qualité pour tous — enseignement explicite, différenciation, rétroaction régulière. C'est le palier déterminant : un palier 1 efficace réduit le nombre d'élèves nécessitant une intensification.

**Ce que Labo Codex fournit** :
- Portrait de classe (distribution des indices, patterns, alertes)
- Dépistage à chaque artefact (minimum 3 points pour dégager une trajectoire)
- Identification automatique des élèves en difficulté émergente
- Rétroaction sur l'efficacité de l'enseignement (fonction 4 du dépistage)

### Palier 2 — Intervention ciblée (≈15 % des élèves)

**Qui** : Élèves identifiés par le dépistage, regroupés par besoins similaires.

**Ce que l'enseignant fait** : Avec les moyens dont il dispose (périodes de disponibilité, séances de rattrapage, moments en classe), il offre un soutien plus ciblé. La forme varie selon le contexte : petit groupe pendant le cours, rattrapage ciblé, rencontre pendant la disponibilité. Le modèle théorique préconise 3-5 séances de 20-45 min par semaine pendant 8-15 semaines — c'est une référence, pas une exigence. L'enseignant adapte à sa réalité.

**Ce que Labo Codex fournit** :
- Analyse automatique du sous-groupe : défis communs, patterns partagés, engagement
- Suivi des présences et notes individuelles
- Trajectoire avant/pendant/après l'intervention via les artefacts
- Documentation de l'intervention

### Palier 3 — Intervention intensive (≈5 % des élèves)

**Qui** : Élèves en difficulté persistante malgré le palier 2.

**Ce que l'enseignant fait** : Ce qu'il peut — accompagnement individuel quand c'est possible, référence vers les services adaptés, coordination avec d'autres intervenants si disponibles. Avec les allocations et ressources actuelles au collégial, un enseignant seul ne peut pas assurer un suivi intensif au sens du modèle canonique (4-5 séances/semaine de 45-60 min). Ce sont les services spécialisés (services adaptés, aide pédagogique individuelle, éventuellement orthopédagogue) qui devraient prendre le relais pour les cas les plus lourds. L'enseignant participe à cet écosystème, il ne le porte pas seul.

**Ce que Labo Codex fournit** :
- Profil complet de l'élève : historique des indices, trajectoire, tous les artefacts
- Documentation détaillée de chaque intervention avec notes individuelles
- Suivi de l'impact (comparaison avant/après chaque ajustement)
- Données partageables avec d'autres intervenants (vision future)

---

## Le profil étudiant — Source de données pour l'intervention

Le profil individuel de chaque élève dans Labo Codex contient déjà un portrait bien plus riche que ce que le formulaire Student Intervention Plan du NCII demande de remplir manuellement. Le module d'intervention doit **puiser dans ces données**, pas les redemander à l'enseignant.

### Cartographie des onglets du profil et leur correspondance NCII

| Onglet du profil | Données disponibles | Correspond à (NCII) |
|------------------|--------------------|--------------------|
| **Accompagnement** | Niveau RàI, Performance globale (P), progression par critère, pattern, défi principal, contexte d'apprentissage (favorable/fragile/défavorable), observation SOLO des résultats, services adaptés | §Description of Student (forces, besoins, données actuelles) |
| **Développement des habiletés** | Courbe de chaque critère dans le temps, suivi des fondamentaux (IPB), diagnostic croisé (IPB × direction), seuils IDME | §Data Collection Plan — Progress monitoring measure |
| **Engagement** | Indices A, C, P détaillés ; absences avec dates ; productions remises/non remises ; jetons ; artefacts retenus | §Dosage (contexte de participation) |
| **Informations confidentielles** | Parcours (ÉPOC, etc.), défis particuliers (FLS, socialisation…), diagnostic services adaptés, portrait de lecteur, notes personnelles, notes de présences | §Implementation Logistics — Additional resources ; §Communication with staff |
| **Productions** | Liste de tous les artefacts avec notes, jetons, dates | §Data Collection Plan — Frequency of data collection |
| **Rapport** | Synthèse textuelle exportable (sections au choix) | Dossier de référence pour un orthopédagogue ou l'API |

### Ce que le formulaire d'intervention n'a PAS besoin de demander

L'analyse du Student Intervention Plan du NCII (4 pages, 4 sections, 7 dimensions taxonomiques + logistique + plan de collecte) montre que la majorité des champs sont soit déjà calculés par Labo Codex, soit hors du périmètre d'un enseignant seul :

**Déjà couvert par le profil** (ne pas redemander) :
- Description des forces et besoins de l'élève → onglet Accompagnement
- Habiletés déficitaires → observation SOLO + défis identifiés
- Données actuelles de performance → indices A-C-P-E
- Outil de mesure des progrès → les artefacts successifs (c'est Labo Codex lui-même)
- Fréquence de collecte → au rythme des productions de l'enseignant

**Hors périmètre enseignant** (éliminer ou reporter) :
- Rating des 7 dimensions de Fuchs (cadre de réflexion, pas de formulaire)
- Colonnes Adaptation 1/2/3 (processus DBI itératif — trop formel)
- Force / preuves d'efficacité du programme (l'enseignant n'utilise pas un «programme validé»)
- Plan de fidélité (contrôle de qualité d'un programme — pas applicable)
- Communication parentale (cégep = étudiants adultes)

**Vision future — palier 3 et multi-intervenants** (champ optionnel, caché par défaut) :
- Personne responsable (pour l'instant : toujours l'enseignant)
- Ressources additionnelles / collaborations (services adaptés, API, tuteur)
- Communication avec d'autres intervenants

### Les 3 ajouts essentiels au formulaire actuel

Ce qui manque réellement et qui justifie un ajout :

**1. Critères ciblés** (Alignment de Fuchs)

L'intervention doit être liée aux critères spécifiques de la grille de l'enseignant. L'onglet Accompagnement identifie déjà les défis (via l'analyse SOLO), mais le formulaire d'intervention actuel ne demande pas «sur quoi tu interviens».

Logique de données :
- Quand l'enseignant coche des étudiants, l'app croise leurs profils pour identifier les **critères en difficulté communs** (ceux dont le score moyen est sous le seuil IDME pour leur niveau SOLO)
- Ces critères sont pré-cochés dans un sélecteur (l'enseignant peut ajuster)
- Chaque critère porte son `niveauSOLO` (visible dans la grille de dépistage), ce qui permet de distinguer les fondations (multistructurel) des compétences supérieures (relationnel, abstrait étendu)
- Le lien critères ciblés → artefacts ultérieurs permet ensuite de mesurer l'impact

**2. Objectif visé** (Goal du NCII — «How will we know if the intervention is working?»)

La seule pièce que l'app ne peut pas calculer. Quand l'enseignant planifie une intervention, qu'espère-t-il voir changer ?

Logique de données :
- Champ texte court avec **suggestion auto-générée** basée sur le profil du sous-groupe :
  - Ex. «Amener Structure au seuil D (65%)» si Structure est le critère multistructurel le plus faible
  - Ex. «Réduire l'IPB à 0 pour le sous-groupe» si l'IPB est ≥ 2
  - Ex. «Stabiliser la performance au-dessus du seuil M (75%)» pour un défi spécifique
- L'enseignant peut accepter la suggestion, la modifier ou écrire son propre objectif
- L'objectif sert de référence au moment du bilan post-intervention

**3. Bilan post-intervention** (Adaptation / Next Steps du NCII)

Quand l'enseignant marque l'intervention comme complétée, un moment de réflexion structuré :

Logique de données :
- L'app affiche automatiquement la **comparaison avant/après** : performance des critères ciblés avant la première séance vs au dernier artefact disponible
- Question simple : «L'objectif est-il atteint ?» (Oui / Partiellement / Non)
- Si Non ou Partiellement : «Quelle est la suite ?» (Reconduire / Ajuster / Référer / Aucune action)
- Champ texte libre pour observations de bilan
- Ce bilan alimente le cycle teach-test-revise-test de Fuchs sans demander un formulaire lourd

---

## Le module interventions — État actuel et vision

### Architecture actuelle (`js/interventions.js` — refonte 11 avril 2026)

**Structure de données d'une intervention** :
```javascript
{
  id, date, heure, duree,
  type: 'groupe' | 'individuel' | 'mio',
  niveauRai: 2 | 3,
  titre, description, contexte,
  seanceConcernee, marquerNonParticipantsMotives,
  etudiants: [DAs],
  analyse: { defisCommuns, patternsCommuns, progressions,
             niveauxRai, engagementMoyen, engagementDistribution },
  observations, notesIndividuelles,
  criteresCibles: ['Structure', 'Rigueur'],  // Critères de la grille ciblés par l'intervention
  objectifVise: 'Amener Structure au seuil D (65%)',  // Objectif mesurable
  snapshotAvant: {                           // Indices au moment de la première sauvegarde (par DA)
    'DA123': { P: 62, criteres: { structure: 0.58, rigueur: 0.55 } }
  },
  bilan: {                                   // Rempli quand statut = completee
    atteint: 'partiellement',                // 'oui' | 'partiellement' | 'non'
    suite: 'ajuster',                        // 'reconduire' | 'ajuster' | 'referer' | 'aucune'
    observationsBilan: '...',                // Texte libre
    dateBilan: 1234567890                    // Timestamp du bilan
  },
  statut: 'planifiee' | 'en-cours' | 'completee',
  dateCreation, dateModification
}
```

**Workflow unifié (un seul temps)** :
1. `afficherFormulaireIntervention(da)` construit l'intervention EN MÉMOIRE (le brouillon — rien n'est écrit avant « Enregistrer », lot 5 du cadrage 11, 12 sept. 2026) et ouvre directement `ouvrirIntervention(id, { modeCreation: true })`
2. Vue unique : logistique (titre, niveau RàI, contexte, date, statut) → aperçu sous-groupe + étudiants → critères ciblés + objectif → observations
3. À la complétion : section bilan avec comparaison avant/après automatique

**Fonctions supprimées lors de la refonte** :
- `sauvegarderNouvelleIntervention`, `afficherFormulaireModification`, `sauvegarderModificationIntervention` (Phase 2)
- `terminerIntervention`, `rouvrirIntervention` (Phase 5)

**Source unique pour le niveau RàI** : `determinerNiveauRaiPedagogique()` (`js/profil-etudiant-calculs.js`) — utilisée partout, y compris dans `analyserSousGroupe()` et la liste des étudiants
- Pas de suivi de la trajectoire au fil des interventions successives

### Formulaire unifié (implémenté 11 avril 2026)

Un seul formulaire en sections progressives, guidé par les données du profil étudiant. L'enseignant ne remplit que ce que l'app ne peut pas calculer.

**Section 1 — Logistique** (quand + où + comment) ✅
Titre, niveau RàI, contexte, date/heure/durée, description, statut. Gestion des absences si contexte = rattrapage.

**Section 2 — Ciblage** (qui + pourquoi) ✅
Aperçu du sous-groupe (patterns, niveaux RàI, défis communs) + liste des étudiants avec checkboxes, notes individuelles et badge RàI (via `determinerNiveauRaiPedagogique`).

**Section 3 — Critères ciblés et objectif** (sur quoi + vers où) ✅
Critères pré-cochés selon les défis communs (`mettreAJourCriteresCibles`). Objectif avec suggestion automatique (`suggererObjectifIntervention`). C'est la pièce «Alignment» de Fuchs.

**Section 4 — Observations** (pendant + après) ✅
Observations générales (les notes individuelles sont dans la section 2, à côté de chaque étudiant).

**Section 5 — Bilan** (est-ce que ça a marché ?) ✅
Visible quand statut = complétée. Tableau comparatif avant/après automatique sur les critères ciblés. «Objectif atteint ?» (oui/partiellement/non) + suite envisagée + observations de bilan.

---

## La taxonomie de l'intensité de l'intervention (Fuchs, 2017)

Sept dimensions pour évaluer et renforcer l'intensité. Elles servent de cadre de réflexion, pas de formulaire à remplir. Certaines dimensions sont directement outillées par Labo Codex, d'autres relèvent de la pratique enseignante.

| Dimension | Rôle de Labo Codex |
|-----------|-------------------|
| **Force** (efficacité de l'intervention) | L'app mesure l'effet *a posteriori* via les artefacts. Pas de prescription *a priori* |
| **Dosage** (occasions de répondre/rétroaction) | L'app documente la fréquence/durée des interventions |
| **Alignement** (cibler les vrais déficits) | L'app identifie les critères en défi. L'analyse de sous-groupe montre les défis communs |
| **Transfert** (application dans d'autres contextes) | Les artefacts successifs mesurent si le transfert se produit |
| **Exhaustivité** (principes d'enseignement explicite) | Relève de la pratique enseignante |
| **Soutien comportemental** (persévérance, autorégulation) | L'indice E (Engagement) et les patterns de mobilisation mesurent l'engagement |
| **Individualisation** (ajustement basé sur les données) | C'est le cœur du cycle que Labo Codex outille |

---

## Correspondances RàI ↔ Labo Codex

| Concept RàI | Équivalent Labo Codex |
|-------------|----------------------|
| Dépistage universel | Évaluation des artefacts → indices, IPB, patterns |
| Portrait de classe | Tableau de bord (distribution, patterns, alertes) |
| Habiletés déficitaires | Critères en défi (selon la grille de l'enseignant) |
| Niveaux taxonomiques | SOLO via l'échelle IDME (I-D-M-E) |
| Critères multistructurels | Fondations surveillées par l'IPB |
| Trajectoire d'apprentissage | Courbe des indices au fil des artefacts |
| Progress monitoring | Artefacts successifs (min. 3 points pour une tendance) |
| Alignement de l'intervention | Ciblage des critères en défi pour chaque élève |
| Sous-groupes homogènes | Regroupement par défis communs (analyse automatique) |
| Data-Based Individualization | Cycle planifier → intervenir → observer artefact → ajuster |
| Faux positifs / faux négatifs | Jugement professionnel sur les alertes automatiques |

---

## Vision future — Labo Codex multi-intervenants

L'architecture actuelle sert un enseignant seul. Le modèle RàI prend toutefois tout son sens dans un système de soutien à paliers multiples avec plusieurs intervenants coordonnés (enseignant, API, services adaptés, tuteur pair, orthopédagogue, travailleur social), structurés au besoin en centre de soutien (type CALFÉ — Centre d'Aide en Littératie et en Français Écrit — ou équivalent disciplinaire).

**Contraintes à préserver dès maintenant** pour ne pas fermer cette porte : rôles et permissions (vues différenciées sur les mêmes données), traçabilité des interventions par intervenant, confidentialité sélective de certaines notes, plans d'intervention partageables (inspirés du Student Intervention Plan du NCII), historique inter-trimestres, et indépendance disciplinaire du modèle de données (aucun critère ni discipline codé en dur).

---

## Références bibliographiques

- Desrochers, A. (dir.) (2021). *L'approche de la réponse à l'intervention et l'enseignement de la lecture-écriture*. Presses de l'Université du Québec. ISBN 978-2-7605-5404-7.
- Fuchs, L.S., Fuchs, D. & Malone, A.S. (2017). The Taxonomy of Intervention Intensity. *TEACHING Exceptional Children*, 50(1), 35-43.
- National Center on Intensive Intervention (NCII). *Taxonomy of Intervention Intensity: Academic Rating Rubric*. American Institutes for Research.
- National Center on Intensive Intervention (NCII). *Student Intervention Plan*. American Institutes for Research.
- Institut des troubles d'apprentissage (Institut TA). *Fiches pratiques : Réponse à l'intervention — Niveaux 1, 2, 3*.

### Corpus documentaire dans le projet

Le corpus de recherche complet (notes Desrochers 2021, traductions de la taxonomie
NCII, articles Fuchs, Student Intervention Plan, fiches Institut TA, explorations
CALFÉ et brouillons RàI) **n'est pas versionné dans le dépôt** — il vit dans les
archives de travail de Grégoire. Les seuls documents présents dans le repo :

| Document | Emplacement |
|----------|-------------|
| Guide d'intervention basé sur le monitorage (historique) | `références tableur/` |
| Section sur les blocages d'apprentissage (historique) | `références tableur/` (⚠️ mentionne la formule IB obsolète) |
| Guide de monitorage vA2025 (PDF) | `références tableur/` |
