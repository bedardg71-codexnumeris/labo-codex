# RELAIS #326 — Refonte du comparateur en « banc de décision » (retour terrain Grégoire)

**Date** : 16 juin 2026
**Auteur** : Claude Code (cloud), en dialogue avec Grégoire
**Statut** : 🟢 **CADRAGE VALIDÉ par Grégoire (16 juin 2026)** — prêt pour exécution : **#343 (DEN) préalable**, puis **R1→R6** (§5.3). Recadrage déclenché par la passe terrain sur l'UI D-2…D-5 (mécanisme livré, workflow raté). **Ne pas releaser 1.19.0 avant R6.**
**Succède à / amende** : `SPEC_D_exploration_pratiques.md` (8 juin, conception « close »). La présente note **n'invalide pas le moteur** livré (arbre, diff, phrases d'effet, `simulerIndices`) ; elle **recadre la mission et l'UI** du comparateur à la lumière d'un cas d'usage réel.

---

## 0. TL;DR

Le terrain révèle que **D-2…D-5 ont livré le *mécanisme* (dériver/diff/matrice) mais raté le *workflow*.** L'outil ne répond pas à la question pour laquelle un enseignant l'ouvre : **« entre deux de MES pratiques, laquelle choisir ? »**. Trois corrections de fond :

1. **Mission** : comparer des pratiques **est la raison d'être** (pas un à-côté de la dérivation de variantes). SOM vs STD/SPE **et** deux STD entre elles sont le même outil.
2. **Données** : la décision se prend **au début du trimestre, avant qu'aucune production n'existe** → les **profils fictifs réalistes sont le défaut** (pas un repli), la donnée réelle est un **raffinement de fin de trimestre**.
3. **UI** : un **banc unique** — choisir une source de données, déposer **2-3 pratiques en colonnes paires**, lire le **diff + l'écart de note décomposé**. Le « mode démo » disparaît comme *mode* (devient un *choix de source de données*).

**Bonne nouvelle moteur** : la question est **déjà calculable**. Ce qui manque est de l'**orchestration UI**, pas un nouveau chemin de calcul.

---

## 1. Ce que le terrain a montré (5 problèmes, captures à l'appui)

Passe iPad de Grégoire sur la sous-section « Exploration des pratiques » livrée (D-2…D-5) :

1. **Variantes indistinguables, zéro feedback** — 5 lignes « PAN-SDT-Litt H26 · essai N », toutes badge `STD ESSAI`, visuellement identiques. Le bloc promet « compare ce que chaque réglage change » mais **n'affiche aucun écart**. → on dérive à l'aveugle, on perd le fil, on doublonne.
2. **Doublons de doublons** — chaque essai porte « Dériver une variante » → branches de branches sans garde-fou ni feedback ; numérotation incohérente (« essai 2,3,4 » puis « essai 1 · essai 1 »).
3. **Comparaison une-à-la-fois contre la démo** — une seule colonne candidate, contre la **sommative démo** (« ta pratique » = données fictives, pas les siennes). **Impossible de mettre deux de SES pratiques côte à côte.**
4. **Essais absents du vrai select** — ils n'apparaissent que dans le `<select>` de la colonne du comparateur démo, pas dans la sélection de pratique active. D'où « je dois promouvoir », étape obscure, et **on reste en mode démo**.
5. **Bug réel** — toast « Pratique introuvable : `pratique_1781640779715_…` » sur une action (jeter/comparer). Référence cassée issue de la chaîne de dérivations. → **à corriger indépendamment du redesign** (régression de correction, pas un choix de design).

Verdict de Grégoire : *« Il faudrait réfléchir davantage au workflow et au nom qu'on donne au processus et au résultat. »*

---

## 2. Le cas d'usage de référence (acceptance test)

Deux pratiques très semblables entre lesquelles Grégoire a hésité cet hiver, sur **le même corpus** :

| | Pratique 1 | Pratique 2 |
|---|---|---|
| Portfolio | 10 artefacts : 8 exercices (garder les **4 meilleurs**) **+ 2 obligatoires** fondues dans le portfolio (6 comptés) | 8 artefacts : 8 exercices (garder les 4 meilleurs) **+ 2 terminales** en **composante séparée** |
| Pondération | (à l'intérieur du portfolio) | portfolio **65 %** / terminales **35 %** (ou : meilleures 65 % / obligatoires 35 %) |

**Question de Grégoire** : *« Est-ce seulement une question de terminologie, ou une question de pondération ? »* — ces nuances changent-elles la **note finale** ?

**Précisions actées (16 juin)** :
- Les 2 productions « spéciales » sont **distinctes**, pas ré-étiquetées.
- **Distinction comportementale, pas que pondérale** : on peut poser des **jetons de reprise** sur les exercices, **pas** sur les spéciales (terminales). → les profils fictifs doivent inclure des **scénarios de reprise** sinon la nuance reste invisible.
- C'est une différence **de config** sur des productions **partagées** entre A et B → **A/B propre** : mêmes entrées, deux jeux de règles, on lit l'écart.

> Réponse attendue de l'outil : si A et B donnent la **même note** → différence **terminologique** (deux façons de représenter la même maîtrise) ; si elles **divergent** → la pondération/les règles changent **ce que la note mesure**. C'est l'incarnation concrète de la doctrine §12 (« ce que la note représente »), pas un palmarès.

---

## 3. Faisabilité — verdict moteur (exploration de code, 16 juin)

Le **moteur sait déjà tout faire** pour ce cas (refs : `js/portfolio.js`, `js/pratiques/pratique-configurable.js`) :

| Capacité requise | Supportée ? | Où |
|---|---|---|
| Entrée **artefact par artefact** (≥ 8 notes distinctes) | ✅ | `simulerIndices(da, id)` lit la liste complète d'évaluations |
| Sélection **« N meilleurs sur M »** | ✅ | `methodeSelection:'meilleurs'` + `nombreARetenir` (`portfolio.js`) |
| **Composantes pondérées 65/35** | ✅ | `categories:{selection:{ponderation}, obligatoires:{ponderation}}` → `calculerNoteAvecCategories` |
| Distinction **obligatoire / terminale** | ✅ | `categorie:'obligatoire'`, `type:'terminale'` reconnus |
| **Reprises par type de production** | ✅ (à vérifier finement) | `systeme_reprises` STD ; éligibilité par type à confirmer pour « jetons sur exercices, pas sur terminales » |
| **Deux pratiques RÉELLES en colonnes paires** | ❌ | l'UI impose colonne 1 = pratique active (réf), colonnes 2+ = simulations sur profils démo |
| **Tourner hors « mode démo »** | ❌ | matrice *gated* sur les profils DEMO ; `simulerIndices` accepte pourtant n'importe quel `da` |

**Conclusion** : le manque est **entièrement UI/orchestration**. Aucun nouveau chemin de calcul. `simulerIndices(da, idA)` vs `simulerIndices(da, idB)` sur le **même** `da` répond déjà à la question — il faut juste une vue qui pose A et B en pairs sur des entrées choisies.

---

## 4. La refonte (direction validée avec Grégoire)

### 4.1 Mission clarifiée
- **Banc de décision** = fonction première : comparer des pratiques pour **éclairer et orienter les modalités avant de les appliquer officiellement**. Outil de **préparation** (début de trimestre). Un enseignant ne devrait pas changer de pratique en cours de route ; le banc sert à bien choisir **avant**.
- La **dérivation de variantes** reste un **mécanisme de support** (générer des candidats à comparer), pas la vedette.
- L'outil **fait comprendre, ne recommande jamais** (continuité SPEC §1 bis ; anti « palmarès de générosité »).

### 4.2 Données — fictif d'abord, réel ensuite
- **Défaut = profils fictifs réalistes.** La décision se prend **avant** que les élèves produisent → il n'y a structurellement pas de données réelles. **La qualité des profils fictifs EST la qualité de la décision.**
- **Raffinement = données réelles d'un groupe**, en fin de trimestre, pour préparer la prochaine itération. `simulerIndices` accepte déjà les `da` réels.
- **Exigence sur les profils fictifs** (chantier à part entière, pas un à-côté) : ≥ 8 artefacts par profil, étalement réaliste (dont le profil « maîtrise tardive » déjà noté D4), **et des scénarios de reprise** (sinon la distinction exercices-reprenables / spéciales-non-reprenables est invisible).

### 4.3 UI — un banc unique
1. **Choix de la source de données** en tête : *profils fictifs* (défaut) **ou** *un de mes groupes réels*. → supprime le **toggle « mode démo »** comme mode (devient un choix de source).
2. **2-3 pratiques en colonnes paires** : n'importe quelles pratiques (abouties **et/ou** variantes d'essai), sans colonne « réf » privilégiée. Plus de « ta pratique vs hypothèse ».
3. **Mêmes entrées pour toutes les colonnes** → l'écart final ne vient **que** des règles de la pratique.
4. **Le tableau montre le PROCESSUS, pas seulement la note** (demande Grégoire, 16 juin). Le comparatif a **plusieurs lignes** : la **note finale** n'en est **qu'une**. Les autres lignes sont les **attributs de processus qui diffèrent réellement** entre les pratiques comparées — exemples cités par Grégoire : **pondération** (ex. 100 % portfolio vs 65/35), **reprise possible ou non** (et sur quels types : exercices oui / terminales non), **nombre de productions comptées / retenues**, **méthode de sélection** (meilleurs/récents/tous), **composantes**. But : tracer un écart de note **jusqu'à la dimension qui le cause**, ou constater « identiques partout sauf le nom » → terminologie pure.
   - **Lignes = différences réellement observées** (pilotées par le diff), pas une liste exhaustive figée. Quelques **ancres** toujours visibles (pondération, reprises, nb de productions) même quand elles sont égales, pour confirmer « pareil sur cet axe ».
   - En complément, les **phrases d'effet** (diff de config — déjà livré) restent disponibles pour mettre en mots *ce que* chaque différence change dans la mesure (anti « palmarès de générosité » : on lit la dimension, pas juste le chiffre).
   - **Faisabilité** : la config **résolue** porte déjà ces attributs ; `diffConfigsPratiques` sait déjà *lesquels* diffèrent. Manque un **extracteur pur** « config → attributs lisibles par pratique » (testable sans DOM) pour peupler les lignes. La **reprise par type** (exercices oui / spéciales non) suppose un attribut **par type de production**, pas un booléen global (lié à l'item ouvert §4.5).
5. **Colonnes = RÉSUMÉ en lecture seule + lien vers le formulaire** (clarification Grégoire, 16 juin — **corrige mon « colonnes éditables live » antérieur**). Le tableau ne sert **qu'à résumer** la **configuration de la construction de la note** et le **résultat final** pour les **4 types de parcours étudiants** (profils-types). **Il n'édite pas les formulaires.** Pour changer un paramètre, on va dans le **bon formulaire** — accessible par un **lien dans chaque colonne**. Le comparateur ne fait que présenter **2-3 pratiques en simultané**.
   - **Invariant lecture seule PRÉSERVÉ proprement** (SPEC §12) : plus besoin de « what-if éphémère » ni d'éditeur embarqué. Le comparateur lit la **config résolue** + `simulerIndices` ; toute édition se fait dans le formulaire existant, **ailleurs**.
   - **Le formulaire EXISTE déjà** (`wizard-pratique-v2.js`, `ETAPES_WIZARD` + `modeEdition`), **spécifique par famille**. Le comparateur **y renvoie** ; il ne le ré-implémente pas.
   - **Lien vers le formulaire (#319 LIVRÉ)** : le formulaire pointé par le lien **existe déjà** (assistant #319, livré 1.2.0). Le comparateur s'y branche par **lien**, sans éditeur embarqué **ni co-chantier**. (#343 étend ce formulaire pour DEN.)
   - **Deux publics** : l'**assistant** présente l'**essentiel** au novice ; le **formulaire complet** est l'outil de l'expert ; le comparateur **informe les deux** en montrant l'effet des configurations **sans rien éditer**.
   - ⚠️ **« gabarit » abandonné** (collision : déjà = modèle préfabriqué) → « **formulaire de configuration** » ; une pratique (formulaire + config) est **partageable entre collègues**.

### 4.4 Ce qui SURVIT de D-0…D-5 (zéro-dette : on ne jette pas)
- ✅ **Moteur pur** `pratiques-exploration.js` (arbre `construireArbrePratiques`, `diffConfigsPratiques`, `phraseEffetPourDiff`/`diffPratiques`) — **réutilisé tel quel**.
- ✅ **Modèle** `inspireDe.sourceId` + `estEssai` — conservé.
- ✅ Consommation **`simulerIndices`** lecture seule — inchangée.
- ⚠️ **À refondre** : la disposition deux-blocs (arbre + matrice démo), le toggle démo, les colonnes réf-vs-sim, la richesse des profils fictifs, la lisibilité des variantes (diff inline sur chaque nœud), les garde-fous de dérivation.
- 🐛 **À corriger** : le bug « Pratique introuvable » (réf cassée dans la chaîne de dérivation).

### 4.5 Décisions (réponses Grégoire 16 juin) + ce qui reste ouvert

**✅ TRANCHÉ :**
- **« processus » → « construction »** (de la note). Grégoire : « processus » appartient à l'**apprentissage** ; ici c'est la **construction de la note propre à la pratique**. Les « lignes de processus » du tableau (§4.3.4) deviennent **lignes de construction de la note**. *(Le formulaire emploie déjà « Comment construis-tu ta note finale ? » et « Construction de la note ».)*
- **Champ lexical pour le nommage** : **construction, élaboration, simulation, expérimentation, modèle théorique**… (mot final à choisir).
- **« gabarit » abandonné** (collision : déjà = modèle préfabriqué). Le « gabarit détaillé » = un **formulaire de configuration** complet ; l'assistant n'en présente que **l'essentiel** au novice ; on **édite les réponses** plus tard ; une pratique (formulaire + config) est **partageable entre collègues**.
- **Dérivation : MAX 1 dérivé** — on part d'un **original**, on fait **une variante**, **jamais une variante d'une variante** (question de gestion). → garde-fou simple : pas de « dériver » sur un nœud déjà dérivé ; profondeur d'arbre = 1.
- **Reprises : pas d'axe universel** (relevé code 16 juin). Le **système de jetons** existe pour **STD** (captures : activer, nb jetons, jeton de délai, jeton de reprise [garder/supprimer], reprise ciblée [note max]) **et SPE** (étape `config-jetons` : nb délai + durée + nb reprise) — **contrôles différents** ; **absent en SOM** (reprises via un simple select « Illimitées / Limitées / Non permises ») et **DEN** (aucun). ✅ **Discordance LEVÉE (16 juin, R1 — lecture de code)** : la section jetons riche « STD » des captures provient de l'**ancien éditeur autonome** `pratique-notation-v2.js`, dont le HTML a été **retiré en #338** (743 lignes mortes ; ne subsistent que des fonctions orphelines ciblant des ids DOM `v2-*` désormais absents → **no-op**). Le **wizard de création vivant** (`wizard-pratique-v2.js`) n'offre/persiste les jetons **que pour SPE** : le build n'écrit `configuration.jetons` que sous la branche `specifications` (~l.2764-2783) et les deux branchements vers `config-jetons` sont dans le flux SPE. **Donc, côté pratique vivante, STD n'a PAS de jetons** — le « jeton STD » est un résidu de l'éditeur mort. **Conséquence R3** : ne PAS lister les jetons comme axe de construction STD, sauf décision contraire de **#338** (achèvement du retrait) / **#328 L2-c** (`configPAN.jetons`). **NE PAS confondre** avec les **types de production** (rédaction, oral, portfolio…), autre vocabulaire. *(Corrige deux fois mes raccourcis : ni « reprise par type », ni « propre à STD ».)*
- **#319 (refonte de l'assistant) est LIVRÉ** (1.2.0) — *correction d'une hypothèse antérieure : ce n'est PAS un chantier en cours à co-planifier.* Le **formulaire existe** ; le comparateur y **renvoie par lien**. **Pas de co-chantier #319.** (#343 l'étendra pour DEN.)
- **Autoriser des reprises = sortie du SOM traditionnel** (cadre Grégoire) : dès qu'un enseignant permet des reprises, il est dans une **PAN (étroite)**, plus dans une SOM. ⚠️ Or l'app permet à **SOM** d'avoir des « Reprises permises » (select Illimitées/Limitées/Non permises) → **tension de classification** à noter (« SOM avec reprises » = conceptuellement une PAN). À rapprocher du chantier description/famille (et du malentendu DEN, §4.7).

**✅ TRANCHÉ (16 juin, suite — réponses Grégoire) :**
- **Outil = « Comparateur de pratiques »** (mot **gardé** : on corrige le modèle, pas le nom ; id `'comparateur'` conservé).
- **Résultat = « maquette »** (**FIXÉ le 16 juin — « on prend maquette et on verra à l'usage »**) : une *maquette* d'une pratique, qu'on **construit pour comparer avant d'adopter**. Ancrage dans le champ **construction** (maquette = modèle d'essai) ; aucune collision (vs « modèle »/« gabarit »). Termes voisins écartés : prototype (techno), avant-projet (deux mots), esquisse/ébauche (minorent la complétude — une maquette est une config *complète et calculable*). Verbes : **créer / dériver une maquette**, **adopter** (remplace « promouvoir »).
- **Statut « essai » : GARDÉ, renommé** (concept `estEssai` → `estMaquette`) — une maquette reste **hors du sélecteur de pratique active** tant qu'elle n'est pas **adoptée**. Léger, surtout avec « max 1 dérivé ».

**◻️ ENCORE OUVERT :**
- **Profils-types** : voir §4.8 (cadrage en cours — dérivés de l'échelle de l'utilisateur).

---

## 4.6 Inventaire des paramètres du formulaire (relevé 16 juin, famille STD)

> Source : captures app en démo (formulaire **STD** existant). **Spécifique par famille** :
> SOM/SPE/DEN ont leurs propres paramètres (à relever séparément). Sert de base au
> composant réutilisable (§4.3.5) et aux **lignes de construction** du tableau (§4.3.4).

**Informations de base**
- Nom de la configuration (texte) · Type de pratique (select : PAN-Standards / Sommative / Spécifications / Dénotation)
- **« Comment construis-tu ta note finale ? »** (select — ex. « Je retiens les N meilleures évaluations ») ← sélecteur de **construction**
- Description (texte) · Discipline (select)
- **Affichage de la note en rétroaction** (radio : Note chiffrée / Niveau de performance)
- **Notes finalisées** (case — « Note finale » au lieu de « Note provisoire » sur les PDF ; fin de session)

**Échelle de performance**
- Échelle à utiliser (select — ex. « IDME0 - H26 » ; gérée dans Conception › Échelles)

**Structure des évaluations** (STD)
- Mode de sélection (select — ex. **Hybride (N meilleures + Obligatoires)**) · Artefacts pour la note finale (nb) · Nb minimal d'évaluations pour P et E (nb) · Total d'artefacts prévus (nb)
- **Activer les catégories Sélection / Obligatoires** (case ; total 100 %)

**Catégories** (si activées)
- **Sélection (N meilleures)** : Nombre à retenir (nb) · Pondération % → *pondération unitaire calculée par production*
- **Obligatoires (toujours comptées)** : Pondération % · « Note = 0 si production non remise »
- **« Construction de la note »** = résumé **recalculé en direct** (« N meilleures + M obligatoire = K productions ; X%+Y%=100% ») ← preuve qu'un **recalcul live structurel existe déjà**

**Système de jetons** (= axe « reprises », distinct des types de production)
- Activer le système de jetons (case) · Nombre de jetons alloués / étudiant·e (nb)
- **Jeton de délai** (case → durée en jours) · **Jeton de reprise** (case → évaluation originale : Garder en archive / Supprimer) · **Reprise ciblée** (case → note maximale, select)

**Métadonnées** (lecture seule) : auteur, créé le, modifié le, description.

**Famille SOM (Sommative)** — `wizard-pratique-v2.js` ~426-745
- Spécifiques : **Règles spéciales** (multi-case : Remplacement / Verrou / Portfolio de progression / Plafonnement / Aucune) → config dynamique (paires de remplacement ; verrou : seuil min + note max ; portfolio : nb artefacts + qualitatif ; plafonnement : condition + note max) · **Affichage rang / moyenne du groupe** (toggles) · **Reprises permises** (select : Illimitées / Limitées / Non permises).
- **Pas de jetons, pas d'échelle, pas de grille** (SOM n'est pas PAN). Pondération par production = **post-création** (Conception › Productions), pas au formulaire.

**Famille SPE (Spécifications)** — ~985-1096
- Spécifiques : **Seuil d'acceptabilité %** (défaut 100) · **Système de jetons** (toggle → nb jetons délai + durée + nb jetons reprise) · **Modèle de forfaits/bundles** (radio : Sciences / Simple / Littérature / Personnalisé) · **Échelle** + **grille de critères** (commun PAN).
- `typesTravaux` / `tableBundles` détaillés = **modèles prédéfinis ou édition post-création**, pas au formulaire.

**Famille DEN (Dénotation)** — ~234-272 + `denotation-saisie-ui.js`
- Spécifiques : **Cibles d'apprentissage** (textarea, une par ligne) · **Méthode de suggestion holistique** (radio : Mode / Médiane / Moyenne) · bannière d'accompagnement. **Pas d'échelle, pas de grille, pas de jetons.**
- **Jugement saisi au profil étudiant** (pas au formulaire) : cases « cible atteinte », note finale, justification ; garde 59 si cible non confirmée. **Non simulable** (déjà acté). ⚠️ Création DEN **partiellement désactivée** (#319 Lot 2 / #318) ; édition OK.

**Synthèse commun vs spécifique**

| Paramètre | SOM | STD | SPE | DEN |
|---|:-:|:-:|:-:|:-:|
| Identité (nom, prénom, établissement, discipline, description) | ✓ | ✓ | ✓ | ✓ |
| Nb d'évaluations prévues · seuils de vigilance (3) | ✓ | ✓ | ✓ | ✓ |
| Échelle de performance | — | ✓ | ✓ | — |
| Grille de critères | — | ✓ | ✓ | — |
| Mode de sélection / portfolio / catégories Sélection-Obligatoires | — | ✓ | — | — |
| Règles spéciales · affichage rang/moyenne · Reprises (select) | ✓ | — | — | — |
| Seuil d'acceptabilité · modèle de forfaits | — | — | ✓ | — |
| Système de jetons | — | ✓ (capt.) | ✓ | — |
| Cibles d'apprentissage · suggestion holistique · jugement (profil) | — | — | — | ✓ |

> ⚠️ **Les ✓/— ci-dessus = ce que le FORMULAIRE collecte aujourd'hui, pas la nécessité pédagogique.** Échelle / grille / **cartouche** sont des outils de **toutes** les pratiques (y compris DEN — Grégoire) ; le « — » de DEN sur échelle/grille reflète un **malentendu de l'app** confirmé (§4.7), pas la réalité.
>
> **Conséquences pour le banc** : (a) les colonnes partagent un **socle commun** (identité, nb éval, seuils) → toujours comparable ligne à ligne ; (b) le reste est **family-specific** → comparer inter-familles = des lignes qui n'existent que pour certaines colonnes (afficher « s.o. » ailleurs) ; (c) **plusieurs paramètres vivent hors formulaire** (pondération SOM, `typesTravaux`/bundles SPE, cibles DEN détaillées, pondérations par objectif STD) → la **config résolue** qui alimente le tableau doit les chercher, pas seulement lire le formulaire ; (d) `diffConfigsPratiques` gère déjà le diff inter-familles, mais la **lisibilité ligne-à-ligne** demande un **mapping de libellés par famille**.

---

## 4.7 Malentendu DEN « sans critères/grille/échelle » — VÉRIFIÉ présent (16 juin)

Point pédagogique Grégoire : un enseignant DEN utilise **bel et bien** grilles de critères + échelle **tout le trimestre** (rétroaction) ; il ne met **aucune note chiffrée** en cours de route ; la note arrive **à la fin** car le **RREC** l'exige pour toute pratique. **On n'évalue jamais sans critères.** Vérification de code → **le malentendu est présent à 3 niveaux** :

| Niveau | Présent ? | Preuve |
|---|---|---|
| Formulaire (wizard) | **Partiel** | Étapes échelle/grille non barrées (condition `!== 'sommative'`), **mais** le récapitulatif exclut DEN — `wizard-pratique-v2.js:2140` : *« pas pour la dénotation (jugement, sans grille IDME) »*. |
| Descriptions utilisateur | **Oui, flagrant** | `gabarits-utils.js:27` « Ungrading (autoévaluation guidée) » ; `accompagnement-contenu-terme.js` (`den-denotation`) « réduit ou élimine la notation chiffrée… commentaire plutôt que score » — **omettent les cibles/critères**. *(Partiellement corrigé par la saisie au profil + la description de la méthode, qui citent les « cibles ».)* |
| Modèle de données | **Oui** | Config DEN persistée — `wizard-pratique-v2.js:2798-2803` = `{type, modeDEN, objectifs, suggestion}`, **pas** d'`echelleId`/`grilleId` (STD les porte, `:2691-2696`). Validation : échelle non requise pour `jugement_global`. |

**Nuance + 🔑 principe (Grégoire, 16 juin)** : les **cibles d'apprentissage** de DEN **sont** des critères et le moteur les utilise (garde de certification → 59 si cible non confirmée) — **mais les critères d'évaluation doivent toujours être EXPLICITÉS, jamais implicites**. Ce qui manque : que DEN référence **grille + échelle** (outils partagés) **explicitement**, pour la **rétroaction formative**. L'app **conflate** « la note n'est pas calculée depuis une échelle » (vrai) avec « DEN n'utilise pas d'échelle/grille » (faux). ⚠️ `SKILL_pratiques_notation §2 bis` parle de « critères implicites » → **à reformuler en explicites** (chantier **#343**).

**✅ CHANTIER #343 LIVRÉ (17 juin 2026)** — descriptions (16 juin) + modèle/formulaire (17 juin). DEN porte échelle/grille optionnelles (formatif), note inchangée (jugement). Détail au BACKLOG #343.

**Direction de correction — chantier DEN DISTINCT, lié et PRÉALABLE à #326** :
- **Descriptions** : ajouter « s'appuie sur des **cibles/critères explicites** » + « produit une **note certificative (RREC 60/59) à la fin** » ; retirer la connotation « sans repères ». (`gabarits-utils.js`, `accompagnement-contenu-terme.js`, bannière wizard `:245`.)
- **Modèle/formulaire** : permettre à DEN de porter **grille + échelle optionnelles** (usage formatif), **sans** changer le fait que la note finale reste un **jugement saisi** (pas une conversion de niveaux). Revoir le commentaire `:2140` (« note par jugement, pas par conversion de niveaux » plutôt que « sans grille IDME »).
- **Impact #326** : une colonne **DEN** du tableau doit montrer **grille/échelle** dans ses lignes de construction (pas « s.o. ») + « note = jugement à la fin ». → ce chantier **change ce qu'une colonne DEN affiche**, donc à traiter **avant** la refonte du banc. *(Candidat backlog #343, à confirmer par Grégoire — distinct vs absorbé dans #326.)*

---

## 4.8 Les profils-types : DÉRIVÉS de l'échelle de l'utilisateur (cadrage 16 juin)

Idée Grégoire : les profils-types ne devraient pas être un **4 fixe** (Fort/Moyen/Difficulté/Irrégulier hérité de la démo), mais **découler du nombre de niveaux de l'échelle de performance de l'utilisateur** (lui en a 4 ; un autre peut en avoir 2, 3 ou 5).

**✅ Acquis (généricité)** : le comparateur — profils ET libellés — doit **parler l'échelle de l'utilisateur** (nombre de niveaux + leurs noms), **pas** une IDME à 4 niveaux codée en dur. Généralise l'outil au-delà du cas de Grégoire.

**⚠️ Nuance à concilier** : un profil **plat** « un par niveau » (élève constamment au niveau X) **sous-révèle** ce qui distingue les pratiques — car elles **divergent surtout sur les TRAJECTOIRES** (maîtrise tardive, parcours irrégulier), là où se joue « ce que la note représente » (doctrine §12 + profil irrégulier que Grégoire voulait construire comme une vraie progression, D4). Un élève toujours au même niveau donne ~la même note partout.

**Synthèse proposée (à valider)** :
- **Nombre de profils = nombre de niveaux de l'échelle** (2/3/4/5 → s'adapte). ✔ idée de Grégoire.
- Chaque profil = une **trajectoire réaliste ANCRÉE sur son niveau** (variance + évolution dans le temps), **pas des notes plates** — sinon sélection « N meilleures », reprises et terminale n'ont rien à mordre.
- **Garder au moins un profil « irrégulier » transversal** (maîtrise tardive) — le cas où SOM et PAN divergent le plus.

**Conséquence technique** : les profils deviennent **générés relativement à l'échelle active** (plus les enregistrements DEMO figés) → un **générateur** de profils, pas un seed en dur (item N1 enrichi).

**✅ TRANCHÉ (16 juin)** : **v1 = profils générés FIXES** (depuis l'échelle, non modifiables). **Plus tard** : remplacer un profil par un **parcours réel** (un élève réel que l'enseignant juge représentatif). L'édition libre des profils n'est **pas** dans le premier jet (outil de préparation léger).

---

## 5. Impact sur le plan #326 (re-lotting proposé, à valider)

| Lot original (SPEC §14) | Devenir |
|---|---|
| D-0/D-1 (moteur pur, modèle) | ✅ **acquis** — réutilisé |
| D-2/D-3 (arbre + dérivation) | 🔁 **à refondre** dans le banc unique (le mécanisme survit, la disposition change) |
| D-4 (matrice + diff) | 🔁 **réorienté** : colonnes paires + choix de source + diff + écart décomposé |
| D-5 (hygiène) | ⏸️ **conservé**, après le banc |
| D-6 (release 1.19.0) | ⛔ **suspendu** — pas de release tant que le workflow n'est pas refondu |

**Nouveaux items implicites** : (N1) profils fictifs riches + scénarios de reprise ; (N2) bug « Pratique introuvable » ; (N3) suppression du mode démo au profit d'un choix de source ; (N4) source de données réelle (groupe) — était « hors périmètre » (SPEC §13) mais redevient **central** vu la finalité fin-de-trimestre ; (N5) **extracteur pur « config résolue → attributs de construction lisibles par famille »** pour les lignes du tableau (pondération, reprises/jetons, nb productions, sélection, composantes), avec la note finale comme **une** ligne parmi d'autres (§4.3.4) ; (N6) **lien par colonne vers le formulaire #319 existant** (pas d'éditeur embarqué — §4.3.5 corrigé) ; (N7) **générateur de profils-types depuis l'échelle** active (§4.8).

---

### 5.3 Lots de la refonte (PROPOSITION 16 juin, à valider)

**Préalable** : **#343 (DEN) ✅ LIVRÉ (17 juin)** — DEN porte échelle/grille optionnelles (rétroaction formative, n'entrent pas dans le calcul) ; wizard (selects optionnels + build + récap + round-trip édition) ; R3 colonne DEN montre échelle/grille. La colonne DEN de R4 est débloquée.
**Acquis réutilisés** : moteur pur `pratiques-exploration.js` (arbre, `diffConfigsPratiques`, phrases d'effet — cœurs D-4) ; modèle `inspireDe`/`estEssai` ; `simulerIndices` ; **formulaire #319 (livré)** ; **#320** (répertoires, livré).

| Lot | Contenu | Nature | Dépend de |
|---|---|---|---|
| **R1** ✅ **LIVRÉ 16 juin** | **Maquette — modèle + cycle de vie** : `estEssai`→`estMaquette` (+ migration boot, supprime l'ancien champ) ; garde-fou **max 1 dérivé** (pas de dérivé-de-dérivé) ; verbes créer/dériver/**adopter**/jeter (`adopterMaquette`/`deriverMaquette`) ; **bug « Pratique introuvable » CORRIGÉ** (listener d'arbre accumulé → garde idempotente). Tests break-testés, 787 Vitest verts. CSS `exploration-*--essai` conservées (tokens internes). | données + UI (faible risque) | — |
| **R2** | **Générateur de profils-types depuis l'échelle** (pur) : N niveaux → N profils, trajectoires **ancrées non plates** + 1 **irrégulier** transversal, **scénarios de reprise**. Remplace les profils DEMO figés. | moteur pur | échelle active |
| **R2** ✅ **LIVRÉ 17 juin** | **Générateur de profils-types depuis l'échelle** (pur, déterministe) : N niveaux → N profils ancrés (non plats) + 1 irrégulier, scénarios de reprise (exercices seulement), corpus partagé. `ProfilsTypesGenerateur.genererCorpus`. **+ Injection mémoire (approche A)** : `simulerIndices(da,id,donnees?)` calcule sur un corpus injecté (try/finally, lecture seule, parité moteur si param absent ; interception dans `modes.js`). Tests 17 cas break-testés, 823 verts. | moteur pur | échelle active |
| **R3** ✅ **LIVRÉ 17 juin** | **Extracteur « config résolue → attributs de construction lisibles par famille »** (pur) + mapping de libellés par famille. Module `js/pratiques/construction-attributs.js` (`ConstructionAttributs.extraire`) : ancres (pondération/reprises/nb productions) + family-specific ; lit la config résolue ; **applique le constat R1** (STD sans jetons). Test 12 cas break-testé, 799 Vitest verts. R4 surlignera les diffs via `diffConfigsPratiques`. | moteur pur | inventaire §4.6 |
| **R4a** ✅ **LIVRÉ 17 juin** | Le banc tourne sur les **profils fictifs générés (R2)** injectés en lecture seule, **par défaut, sans mode démo** (corrige §1.3/§1.4). `comparateur-pratiques.js` : corpus généré depuis l'échelle, `simulerIndices`+injection pour les notes, garde démo retirée. Rendu = terrain. | UI | R2, R3 |
| **R4b** ✅ **LIVRÉ 17 juin** | Colonnes **paires** (2-3, sans réf, maquettes incluses) ; **lignes de construction** (R3, alignées par axe, « s.o. ») + section résultat ; **lien par colonne** → formulaire #319 ; **source fictif/réel**. Remplace réf-vs-simulations. Tests `comparateur-banc-r4b-326`. Rendu = terrain. | UI | R3, #343, R4a |
| **R5** ✅ **LIVRÉ 17 juin** | Retrait zéro-dette du code démo/matrice mort (PROFILS DEMO, PHRASES_CONTEXTE, MICROCOPY_E1, estEnDemo, construireInvitation, activerDemoEtOuvrir). Sentinelle anti-régression. | UI | R4b |
| **R6** 🟡 **release préparée 17 juin** | **Bump 1.19.0 + changelog** faits (code). **Reste la VALIDATION TERRAIN Mac+iPad (2 modes) = porte avant merge/déploiement.** | livraison | tout |
| **R5** | **Nettoyage zéro-dette** : retirer l'UI D-2…D-5 remplacée (arbre deux-régions, toggle démo, colonnes réf-vs-sim). | UI | R4 |
| **R6** | **Terrain + release** : Mac+iPad, sombre/clair ; release `minor` (**1.19.0**) + 1 entrée changelog. | livraison | tout + #343 |

**Séquence** : **#343** → (**R1 ∥ R2 ∥ R3**) → **R4** → **R5** → **R6**. Garde-fous SPEC §12 maintenus (lecture seule, `echapperHtml`, `data-action`, ≥ 1 test par lot).

---

## 6. Prochaine étape

1. ✅ **Grégoire a VALIDÉ le découpage (16 juin 2026)** — ordre, frontières de lots, scope R4 inclus.
2. **#343 d'abord** (préalable DEN ; son lot « descriptions » peut partir seul).
3. Reporter le découpage validé dans `SPEC_D_exploration_pratiques.md` (qui porte le bandeau de recadrage), puis exécuter **R1→R6**. Le **bug « Pratique introuvable »** (R1) est corrigeable isolément si on veut nettoyer en attendant.
4. **Au codage** : re-vérifier les `fichier:ligne` (datés), lever la discordance jetons STD (§4.5), re-confirmer les constats subagent-sourcés (§4.6/§4.7).
