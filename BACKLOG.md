# BACKLOG - Monitorage Pedagogique

> **Pour Claude** : Ce fichier liste les **items ouverts** uniquement. L'historique complet des items livrés (313 items, fév-mai 2026) vit dans `BACKLOG-ARCHIVE.md`.
>
> **Dernière bascule** : 25 mai 2026 fin de journée — extraction des items livrés vers BACKLOG-ARCHIVE.md.
> **État courant** : Beta 99.66 (Build 0526-0503), HEAD main `4df4f21`. 28 items ouverts (session 26 mai matin : 3 items #278/#280/#281 livrés + 3 bugs testeurs résolus + 1 item #286 ajouté).
> **Dernier ID utilisé** : #298 (révision PRIVACY.md suite au retrait Cloudflare Access, créé 28 mai 2026 PM dans le cadre du chantier #294).
> **Présentation AQPC** : 3 juin 2026 (J−8).
> **Pour ajouter un item** : `- [ ] **#XX** Description courte` + sous-puces de contexte. Dernier ID utilisé : **#285** (livré).

---

## Légende

- 🟡 **Important pour expérimentateurs post-AQPC** (juin-été 2026, première vague d'utilisateurs externes)
- 🟢 **Backlog long terme** (utile mais sans urgence — peut attendre la rentrée d'automne)
- 📦 **Reporté / hors v1.0** (acté explicitement par Grégoire ou par calendrier projet)
- ⚠️ **Priorité haute actée** (à traiter dès que possible — décision Grégoire datée)
- 📐 **Décision UX en attente** (besoin d'un choix Grégoire avant de coder)

Voir le plan de travail détaillé dans `plans de travail/PLAN-TRAVAIL-26-MAI.md` pour la classification en ordre de prise et les estimations d'effort.

---

## A faire

### Bugs UX et cohérence interface

- [ ] 🟡 ⚠️ **#282** Migrer `js/cours.js` de la clé legacy `listeCours` vers la clé V2 `cours`
  - **PRIORITÉ HAUTE** actée par Grégoire 23 mai 2026 PM (« il faudra y revenir absolument »).
  - Modal Bibliothèque cours vide en V2 — 10 sites dans cours.js lisent encore `listeCours`.
  - Effort estimé révisé : 5-7 h (scope réel 93 sites dans 15+ fichiers d'après post-mortem du 23 mai matin, tentative revertée).
  - **Prérequis P1-P4 LIVRÉS** : bandeau mode édition, activation explicite, migration tuple naturel, snippet recovery (cf. BACKLOG-ARCHIVE.md pour le post-mortem et le snippet).

- [ ] 🟢 **#283** Harmonisation responsive des pages à sidebar en mobile (<1024 px)
  - Pages : Conception (Productions/Grilles/Échelles/Pratiques/Cartouches), Évaluation (Liste), possiblement Calendrier.
  - Bug pré-existant, pas introduit par chrome unifié. Trois options de fix à arbitrer.
  - Lié à #284.

- [ ] 📐 🟢 **#284** Harmonisation de la structure des pages (titres + sous-titres descriptifs manquants)
  - Pages sans titre : Alignement pédagogique (carte mentale), Tirage au sort (Labo).
  - Décision : ajouter h1 + sous-titre 1-ligne partout, OU décider que certaines pages sont délibérément plein écran.

### Fonctionnalités à compléter

- [ ] 📐 🟡 **#279** Ajouter 3 champs au formulaire de production : DESCRIPTION DÉTAILLÉE des consignes, FORMAT ET MISE EN PAGE, REMISE
  - Refactor `refactor/productions` mergé le 17 mai. Chantier prêt dès qu'une capture de référence est fournie par Grégoire (placement exact, type d'input).
  - Impact : `afficherFormProduction`, `lireDonneesFormulaireProduction`, `construireProductionData`, `prerenseignerFormulaireProduction` + affichage côté consultation.

- [ ] 📐 🟢 **#275** Rétroactions visuelles enrichies dans la synthèse
  - Aujourd'hui : seulement les courts descriptifs de palette. Insuffisant pour rétroaction pédagogique significative.
  - À explorer : phrases complètes par critère/niveau, pistes d'amélioration, forces observées, ou génération assistée depuis le contexte production. Décision conceptuelle à prendre avant code.

- [ ] 🟢 **#240** Tampon visuel pour jetons (Délai, Reprise, Reprise ciblée) sur les travaux annotés
  - Cliquer sur le mot du jeton → curseur tampon → appose « JETON DE DÉLAI/REPRISE/REPRISE CIBLÉE » en rouge majuscule.
  - Une fois tamponné, checkbox du jeton se coche auto. Même mécanisme que les tampons existants. PDF montre clairement le jeton appliqué.

- [ ] 🟢 **#18** Tooltips d'aide au survol — déploiement progressif par zone (chantier continu)
  - Mécanisme : `data-tooltip="cle"` + moteur `tooltips.js` + base `tooltips-contenu.js`.
  - **Complété** : En-tête (10), Réglages Trimestre (29), Préférences (12), Dépistage (14), Données (14), Évaluations (84 clés actives au 13 mai 2026).
  - **Reste** : Planification, Présences, Construction de la note, Tableau de bord, Boîte à outils, Aide.

- [ ] 📦 **#2** Guide PDF pour utilisateurs — reformulé 11 mai 2026
  - Décision : ne PAS produire un guide générique. À fusionner avec le matériel pédagogique de la cohorte CoP (8 rencontres sept 2026 → avril 2027, voir `docs/CALENDRIER.md` §8.3).
  - Version « papier » pour AQPC peut être dérivée de `docs/securite/SECURITE-POUR-ENSEIGNANTS.md` (à écrire post-Défense E).

### Cohérence visuelle UI

- [ ] 🟢 **#297** Dette technique : duplication des règles CSS entre `<style>` inline d'index.html et styles.css
  - **Phase 1 livrée 28 mai 2026 PM — audit lecture seule**.
  - **Rapport** : `Rapports/audit-duplication-css-2026-05-28.md` (script reproductible dans `Rapports/_outils/audit-duplication-css.py`).
  - **Constats clés** :
    - 625 règles dans le bloc inline `<style>` (l. 16-3806 d'index.html), 3947 dans `styles.css`.
    - Recouvrement : **48 sélecteurs communs**, dont **15 identiques** (retrait sûr possible) et **33 divergents** (overrides silencieux, sources potentielles de bugs comme `.contenu min-height` du 28 mai matin).
    - Divergence majeure : `:root` (variables) — le inline est en retard de plusieurs lots (manque acc-*, section-*, idme-*, focus-ring-*, rai-niveau-*, etc.). Visible si styles.css échoue à charger.
    - Autres divergences notables avec diff dans le rapport : `body`, `.carte`, `.conteneur`, `.section.active`, `.sous-navigation`.
  - **Phase 2 à trancher (post-AQPC)** : décider par sélecteur (a) retrait inline, (b) retrait externe, (c) garder les deux + commentaire de synchronisation. Voir §5 du rapport pour la grille de décision.
  - **Phase 3 finale** : inscrire une convention en tête du bloc inline (encadré « CSS critique inliné délibérément » + règles de modification). Voir §5.3 du rapport.
  - **Calendrier** : phase 1 ✅ livrée. Phases 2-3 post-AQPC.

- [x] 🟢 **#287** Picker couleur custom (modale Personnaliser tampons + Codes erreurs FR) — **livré 28 mai 2026 PM**
  - **Implémentation** : `<details>` HTML5 + popover absolute avec grille des 12 couleurs prédéfinies (constante `COULEURS`) + bouton « Personnalisé » qui rouvre le picker natif macOS pour les couleurs hors-palette. La couleur active dans la grille est marquée via `.actif`.
  - **5 sites couverts** : pastille catégorie tampon (l. 2104 + l. 2746), pastille item tampon (l. 2149 + l. 2687), couleur outil de dessin avec numéro (l. 3135).
  - **Architecture** : helper `_renderPickerCouleur(idAttr, idVal, couleur, opts)` paramétré (supporte un summary avec contenu — numéro pour le site 3135). Handlers `travauxOutils.choisirCouleurPalette(el)` et `travauxOutils.ouvrirCouleurPerso(el)` exposés via `data-action`. L'`<input type="color">` original est conservé en hidden (CSS `.travaux-retro-couleur-input`) — il reste la source de vérité pour la sauvegarde (`input[data-color-cat-id]` l. 2510, 2531, 3241, 3328) et reçoit un event `input` dispatché manuellement quand on clique une couleur de la grille. Le picker natif est appelé via `input.click()` depuis « Personnalisé ».
  - **Auto-fermeture** : event `toggle` capture phase qui ferme tous les autres `<details.travaux-retro-couleur-picker>` quand l'un s'ouvre. Évite plusieurs popovers superposés.
  - **Zéro-dette** : ancienne classe CSS `.travaux-retro-couleur-wrap` retirée (remplacée par le picker).
  - **Capture déclencheuse** : Grégoire 27 mai 2026 matin (modale Personnaliser tampons, picker macOS ouvert sans indication de la couleur active).

- [x] ⚠️ 🟡 **#294** Configurer Netlify + Cloudflare pour accueillir la visite AQPC du 3 juin
  - **Acté par Grégoire 28 mai 2026 matin** : à faire en PM, avant AQPC.
  - **Décision majeure 28 mai 2026 PM** : retrait complet du Cloudflare Access pour ouvrir l'app publiquement (élimine le challenge bot bloquant, élimine la friction OTP pour les expérimentateurs AQPC, libère la liste blanche). Cf. ADR-008 révisé + DEPLOY.md v1.1.
  - **Audit local livré** : `netlify.toml` ✅ propre (Cache-Control corrects). `labo.codexnumeris.org` n'a plus de DNS → URL réelle `app.codexnumeris.org` (substitution dans DEPLOY.md).
  - **Action restante côté dashboard Grégoire** : levée effective du Cloudflare Access dans le tableau Zero Trust + re-test public. Procédure dans la note de session.
  - **Post-AQPC** : `#298` créé pour révision PRIVACY.md (posture Loi 25 sans liste blanche).

- [ ] 🟡 **#298** Révision PRIVACY.md suite au retrait du Cloudflare Access
  - **Origine** : décision du 28 mai 2026 PM (cf. ADR-008 révisé) — l'app `app.codexnumeris.org` est désormais publique sans liste blanche d'emails.
  - **Sections impactées dans PRIVACY.md** : §3.3 (Données d'accès Cloudflare Access), §6 (Cloudflare Access — entière), §7 (sécurité du canal Navigateur ↔ Cloudflare Access).
  - **Question posture Loi 25** : la liste blanche servait de base de consentement explicite. Sans elle, quel est le nouveau cadre de consentement pour les visiteurs publics ? Bannière d'accueil ? Lien permanent vers `PRIVACY.md` ? À trancher avant de retoucher PRIVACY.md.
  - **Effort estimé** : 2-3 h (analyse posture + rédaction + revue croisée avec ADR-008).
  - **Priorité** : post-AQPC, pas bloquant pour la conférence (l'app n'expose aucune donnée utilisateur côté serveur — l'enjeu est documentaire et de conformité formelle).

- [x] 🟢 **#293** Toggle « Masquer les items déjà dans la barre latérale » en section 2 des modales bibliothèque — **livré 28 mai 2026 PM**
  - **Constat 28 mai 2026** (Bibliothèque de grilles de Grégoire) : la Section 2 montre toutes les entrées de la biblio partagée, y compris celles « Déjà dans la barre latérale ». Quand le ratio biblio/sidebar est lourd (ex. 5 entrées biblio pour 3 grilles sidebar = anciennes variantes accumulées), l'affichage devient encombrant et donne une fausse impression de doublons.
  - **Périmètre réel livré** : 3 modales (grilles, échelles, cartouches) au lieu des 5 initialement prévues. Audit pendant l'implémentation : `productions-bibliotheque-ui.js` et `pratiques-gestion.js` filtrent NATIVEMENT les items « déjà dans la sélection » avant Section 2 (ligne 76-82 productions, ligne 411-412 pratiques). Le toggle y serait sans objet — items « déjà présents » jamais affichés.
  - **Helpers ajoutés à `BibliothequeUI`** : `estMasquerDejaPresentActif()`, `filtrerParDejaPresent(cartes)`, `renderToggleMasquerDejaPresent(refreshFnName)`, `basculerMasquerDejaPresent(elementOuNom)`. Persistance dans `db` via la clé `biblio-masquer-deja-present` (préférence globale partagée par les 3 modales).

- [x] 🟡 **#292** Déduplication défensive au chargement de codex — filet de sécurité contre la propagation de doublons d'ID — **livré 28 mai 2026 PM, commit `ed83d74`**
  - **Constat 28 mai 2026** : `chargerCodex` (`js/codex.js:500`) fait un overwrite complet par clé (`db.set(cle, valeur)`). Si le codex source contient déjà des doublons d'ID dans `grillesTemplates`, `echellesTemplates`, `cartouches_*`, `bibliothequeProductions`, `bibliothequePratiques`, ils sont restaurés à l'identique à chaque ouverture. Les codex de Grégoire en sont infectés (3 doublons confirmés dans `grillesTemplates` au 28 mai).
  - **Origine probable** : un ou plusieurs imports historiques contournaient `verifierUniciteIds` (`js/import-export.js:66`) ou ne déduplicaient pas avant `push`. Audit à faire : grep tous les sites qui font `grilles.push(...)` / `echelles.push(...)` / etc. sans passer par `verifierUniciteIds` ou `importerGrillesExternes` (dont la version actuelle déduplique correctement, ligne 3940).
  - **Fix proposé** : dans `chargerCodex`, après `db.set(cle, valeur)`, si la clé correspond à une biblio partagée (liste connue), appliquer `verifierUniciteIds` sur la valeur AVANT le `set`. Idem pour les clés `cartouches_*` (pattern à matcher).
  - **Hygiène data** : nettoyer le codex de Grégoire (snippet console fourni le 28 mai 2026 — déduplique en gardant le premier item de chaque ID, puis ré-export du codex pour avoir une version propre comme base de démo AQPC).
  - **Effort estimé** : 1-2 h (fix `chargerCodex` + audit des chemins d'import historiques + un test).

- [ ] 🟡 **#291** Workflow de résolution de doublons dans les bibliothèques (grilles, cartouches, échelles, productions, pratiques)
  - **Constat 28 mai 2026** : la détection de doublons (`detecterDoublonsGrilles`, `detecterDoublonsCartouches`, etc.) affiche un avertissement informatif mais aucune action de résolution. Capture de Grégoire : 3 doublons détectés dans la Bibliothèque de grilles (« Global-4 (SRPN) H26 », « Global-5 (FR-HOLIS) H26 », « Global-5 (FR-ALGO) H26 »), tous avec 2 exemplaires.
  - **Patch UX appliqué le 28 mai 2026 (build 0528-05XX)** : `BibliothequeUI.renderAvertissementDoublons` enrichi avec une consigne textuelle (« ouvre le menu ⋮ et choisis Retirer ou Supprimer ») et un tooltip sur les IDs courts qui affiche l'ID complet (permet de distinguer vraie collision vs homonyme légitime). Pas un vrai workflow, juste une aide à la résolution manuelle.
  - **Vrai workflow attendu** :
    - Pour chaque doublon détecté, proposer un sous-modal de comparaison côte-à-côte (nom, date de modification, contenu, nombre de critères pour grilles, etc.).
    - Action « Garder X / Supprimer Y » en un clic, ou « Tout fusionner » pour les cas évidents.
    - Distinguer **vraie collision d'ID** (anomalie data, IDs identiques) de **homonymie légitime** (2 entités distinctes au même nom, IDs différents).
  - **Audit data préalable** : enquêter sur l'origine des collisions d'ID si elles existent vraiment (sur la capture du 28 mai, les IDs courts affichés sont identiques — mais c'est peut-être un faux positif du `genererIdCourt` qui ne prend que les 6 derniers caractères). Dump du stockage à faire pour confirmer.
  - **Cas observé 28 mai 2026 (Bibliothèque de grilles de Grégoire)** : 5 grilles distinctes (IDs différents) dans `bibliothequeGrilles`, toutes des variantes des 3 grilles de `grillesTemplates`. Hypothèse : renommage + ré-import successifs ont créé des copies forkées (chaque copie a un `idOriginal` qui pointe vers une grille locale). La détection actuelle (par nom exact) ne les signale pas car les noms diffèrent (« Global-5 FR-HOLIS » vs « Global-5 (FR-HOLIS) H26 »). Le vrai workflow doit inclure une détection par **similarité** : nom approximatif + nombre de critères + structure des critères + lien `idOriginal`.
  - **Effort estimé** : 4-6 h pour un vrai workflow (UI sous-modal + actions batch + heuristique de similarité + tests sur les 5 biblios concernées).

- [x] ⚠️ 🟡 **#290** Intégrer 4 pratiques personnelles anonymisées au seed `MODELES_PRATIQUES_PREDEFINIS` — **livré 28 mai 2026 PM en 2 phases, commits `1fcad27` (phase 1 — anonymisation seed + zéro-dette IDs) et `c791f1b` (phase 2 — convention 'Demo Labo Codex' pour 3 modèles génériques + filtre transitoire OR)**
  - **Priorité actée par Grégoire le 28 mai 2026 matin** : les premiers expérimentateurs accéderont à l'application dès le 3 juin et iront probablement voir la bibliothèque de pratiques en premier (« existe-t-il une configuration de base pour ma discipline ? »). Le seed doit être enrichi avant cette date.
  - **Calendrier** : à exécuter APRÈS le plan de vérification visuelle en cours (28 mai matin), avant le 3 juin. Probablement 28-29 mai.
  - **Origine des données** : 4 pratiques actuellement dans le `bibliothequePratiques` IndexedDB local du Codex de Grégoire (importées de collègues du Cégep de Drummondville) — pas dans le code source. Grégoire conserve ces fichiers personnels **inchangés** en stockage, prêts à être récupérés pour le portage.
    - Modèle Chimie (FAH) — François A.-H. — Chimie — Notation par contrats
    - Par objectifs (Pondéré) — Michel B. — Mathématiques — Moyenne pondérée des objectifs
    - Par objectifs (Comptage) — Bruno V. — Chimie — Comptage d'objectifs essentiels et complémentaires
    - STD Chimie organique (BV) — Bruno V. — Chimie — Standards avec critères par standard
    - STD Interfaces et BD (Xavier C.-T.) — Xavier C.-T. — Informatique — 6 objectifs niveau 3+, base 80% + bonus
  - **Méthode suggérée** :
    1. Grégoire dump son `bibliothequePratiques` IDB (script console à fournir) pour récupérer les configurations exactes (typesTravaux, forfaits, parObjectifs, seuilsCritiques, etc.).
    2. Pour chaque pratique : extraire la configuration, **strip les initiales** en fin de `nom` (« STD Chimie organique (BV) » → « STD Chimie organique »), **anonymiser** `auteur: 'Gabarit Labo Codex'`, **nettoyer** tout `metadata_cc.auteur_original` et `metadata_cc.contributeurs`.
    3. Ajouter au seed `js/pratiques-bibliotheque.js` `MODELES_PRATIQUES_PREDEFINIS` avec `estGabarit: true`, IDs **sans prénom** (ex. `SPE-chimie-contrats`, `STD-chimie-organique`, `STD-info-interfaces-bd` au lieu de `STD-Bruno-Chimie` / `STD-Xavier-Info`).
    4. **Vérifier les IDs existants** dans le seed : `SPE-francois` (Modèle Chimie générique), `STD-par-objectifs-comptage`, `STD-par-objectifs-pondere`, `STD-Bruno-Chimie`, `STD-Xavier-Info` existent déjà avec `auteur: 'Labo Codex'`. Décider si on **remplace** la config existante par la version enrichie du collègue, ou si on **ajoute** une nouvelle entrée à côté. Recommandation : remplacer (le nom du seed actuel est générique, la config enrichie du collègue apporte plus de valeur pour les expérimentateurs).
    5. Renommer `STD-Bruno-Chimie` → `STD-chimie-organique` et `STD-Xavier-Info` → `STD-info-interfaces-bd` dans la même passe (zéro-dette : les IDs contiennent des prénoms).
  - **Convention auteur** : `auteur: 'Gabarit Labo Codex'` (et non « Anonyme » ni « Labo Codex » seul, pour distinguer les gabarits dérivés de pratiques de collègues anonymisées des modèles génériques originaux).
  - **Effort estimé** : 1-2 h (dump + lecture des configs + ajout au seed + renommage IDs + test visuel modale).

- [x] 🟢 **#289** Audit visuel des palettes de création — pattern « icônes 100 % + hover sur le bouton » **livré 28 mai 2026 PM**
  - **Pattern de référence** (livré 28 mai 2026 sur la palette Nœuds d'Alignement pédagogique, build 0528-0448) : l'icône est pleinement visible en permanence (blanc 100 % en sombre, noir 100 % en clair), et l'effet hover porte sur le bouton qui entoure l'icône (fond + bordure plus saturés), pas sur l'icône elle-même qui reste à 100 %.
  - **Classes auditées et migrées** :
    - `.outil-svg-icon` (palette annotation Travaux + ses variantes `.palette-toggle-icon`, `.palette-bas-icon`) — repos `invert(0.6/0.35)` → `invert(1)/brightness(0)`.
    - `.planif-icon` (boutons vue/zoom carte mentale) — idem.
    - `.nav-seq-icon` (chevrons navigation séquence/leçon, partagé entre planif et toolbars Travaux) — idem. État `:disabled` préservé à `invert(0.25/0.7)` pour signaler la désactivation.
    - `.editeur-page-icon` (boutons éditeur de pages + pipeline) — idem.
    - `.popover-icon` (mode clair uniquement) — passé de `invert(0.25)` à `brightness(0)` (100 % noir).
    - Tous les `:hover .X-icon { filter: ... }` retirés.
  - **Hors scope** (icônes sciemment pâles, design délibéré) : `.btn-inline-icon` (inline avec texte), `.modal-close-icon` (X de fermeture subtil), `.btn-delete-icon` (corbeille, action destructrice signalée par pâleur), `.drop-zone-icon` (zone drag&drop), `.codex-menu-icone img`, `.pipeline-icone-placeholder-img`. `.prep-btn` également hors scope (bouton purement textuel sans icône SVG).

- [x] 🟡 **#288** Terminologie collégiale : remplacer « élève(s) » par « étudiant·e(s) » dans l'UI — **balayage UI visible livré 28 mai 2026 PM**
  - **Convention** : au collégial le terme « élève » est réservé au primaire/secondaire. L'UI Labo Codex (Cégep de Drummondville) doit utiliser « étudiant·e(s) ».
  - **Bilan migration livrée** : 56 sites visibles migrés (169 occurrences brutes → 113 restantes). Les 113 restantes sont volontairement préservées : commentaires `//` et JSDoc, format de donnée d'anonymisation `'Élève X'` (modes.js, evaluation-chargement.js, reserve-ouvrir.js — convention stockée), patterns de matching CSV import (groupe.js l. 209-210 — détectent les colonnes externes avec ces mots), banniers ASCII de section, commentaire CSS, et la citation bibliographique (index.html:14459, titre d'ouvrage de Gauthier-Bissonnette-Richard 2013).
  - **Couverture** : index.html (24 libellés UI), 14 modules JS — descriptions SOLO (profil-etudiant-sections-affichage), objectifs pédagogiques d'organisateur et planification-carte, tooltips moyennes (etudiants, tableau-bord-apercu), bulles d'aide (accompagnement-contenu-popup), placeholders bilan réflexif (bilan-reflexif-editeur), alertes (liste-evaluations, profil-etudiant-sections-affichage), libellés tooltips d'action (travaux-outils, travaux-ui), descriptions RaI (profil-etudiant-calculs), dropdowns (graphiques-progression).
  - **Convention de remplacement appliquée** : « élève » → « étudiant·e », « élèves » → « étudiant·e·s », « Élève » → « Étudiant·e », adjectifs adjacents migrés vers la forme épicène (« sélectionné » → « sélectionné·e ») quand le mot suit immédiatement, accord par défaut conservé sinon. Pour « un élève » → « un·e étudiant·e ».
  - **Reste à faire post-AQPC** (si pertinent) : documentation `docs/` (rapports, plans, skills) — non inclus dans ce balayage UI.

- [ ] 🟡 **#286** Migration globale emojis UI → Icônes SVG icons8 (chantier en 5 lots)
  - **Capture déclencheuse** : iPad 26 mai 05:15 — section « Préparer et importer » avec ✴ orange à droite du titre + 📝 papier-crayon au-dessus de « Annoter les travaux ».
  - **Cartographie réalisée 26 mai 2026** : 593 occurrences UI (200 HTML + 393 JS hors `console.*`/commentaires), 56 emojis distincts. 70 SVG icons8 déjà présents dans `icons/` (crédit inscrit dans À propos).
  - **Plan détaillé** : `plans de travail/PLAN-MIGRATION-ICONES-SVG.md` — table de mapping, lots A/B/C/D/E, ordre recommandé, décisions Grégoire pendantes.
  - **Top 3 emojis** : ✴ ×76 (bouton aide, à mapper → `icon-info` à ajouter), ⚠ ×63 (warning), ✓ ×48 (check simple).
  - **Effort total** : 5-6 h réparties sur 3-5 sessions.
  - **Lot A** (bouton aide ✴, 45 min) recommandé en premier — gros impact visuel, mapping unique.

### Codex / Onboarding

- [ ] 🟡 **#295** Diagnostic mémoire/quota avant la tentative d'ouverture d'un Codex (Mac + iPad + iPhone)
  - **Constat 28 mai 2026 PM** : Grégoire est actuellement incapable d'ouvrir un Codex sur son iPad parce que l'espace mémoire est saturé. La tentative échoue après coup, sans signal préalable. Conséquence directe : **ses tests sur iPad et iPhone sont limités** depuis plusieurs sessions — facteur d'incertitude pour le projet (le poste iPad reste un cas d'usage majeur).
  - **Comportement actuel** : `chargerCodex` (`js/codex.js`) déclenche les écritures `db.set(cle, valeur)` sans vérification préalable de l'espace disponible côté navigateur. Sur iPad Safari avec quota saturé, l'opération avorte en cours ou laisse l'état partiellement écrit.
  - **Comportement souhaité** :
    1. AVANT toute écriture, appeler `navigator.storage.estimate()` (retourne `{quota, usage}` en octets, supporté Safari iOS 17+) et calculer le ratio + l'espace restant.
    2. Calculer le poids du ZIP du codex à charger (somme des `JSON.stringify(valeur).length` à venir).
    3. Si `usage + poidsCodex > quota * 0.9` → bloquer le chargement et afficher une modale d'avertissement : « Votre espace de stockage navigateur est presque plein (X Mo / Y Mo). Le codex que vous tentez d'ouvrir pèse Z Mo. Libérez de l'espace avant de continuer. » + bouton « Voir comment libérer de l'espace » (renvoie vers une mini-doc avec Réglages Safari iOS).
    4. Si ratio > 0.95 → bouton « Forcer le chargement » désactivé. Sinon proposer le forçage avec avertissement explicite (état partiel possible).
  - **Affichage permanent suggéré** : badge discret quelque part dans les Réglages ou l'En-tête « Stockage : X% utilisé » (mêmes calculs) pour donner à l'utilisateur une visibilité en continu sur son quota.
  - **Effort estimé** : 1-2 h pour le diagnostic préventif + modale. +1 h pour l'affichage permanent du quota.
  - **Tests iPad/iPhone** : Grégoire devra vider partiellement son cache avant de pouvoir tester sur ses propres devices. Alternative : tester sur iPad/iPhone d'un tiers, ou en simulation desktop (DevTools Safari → quota artificiel).

- [ ] 🟢 **#233** Simplifier le flux Codex pour l'utilisateur lambda (Mac + iPad)
  - Concept de fichier ZIP transportable complexe pour non-technicien. Safari sans FSAPI (chaque save = nouveau téléchargement). iPad WebKit imposé.
  - Pistes : assistant premier lancement, détection navigateur + adaptation instructions, guidage remplacement fichier sur clé USB.

### Reserve / Archives — extension

- [ ] 🟢 **#257 v2.B** Ouvrir la réserve v2.B — mode consultation namespace temporaire
  - Suite de #257 v2.A (livré 28 avril). Effort estimé : 5-6 h.
  - Use cases : adapter une grille A2024 pour H2026, démo trimestre passé en formation, récupérer un cartouche bien rédigé retiré de la bibliothèque active.
  - Mécanisme : namespace temporaire `__archive_a2025_*` séparé du trimestre actif, lecture seule. Panneau « Contenu de l'archive » + bouton « Réimporter dans mes bibliothèques actives ».

### Données démo (utiles AQPC et expérimentateurs)

- [ ] 🟡 **#296** Audit catégoriel des items `'Labo Codex'` dans les seed + migration vers `'Demo Labo Codex'`
  - **Constat 28 mai 2026 PM** (post-livraison #290) : ~30 occurrences de `auteur: 'Labo Codex'` dans 8 fichiers seed (`echelles.js` ×8, `gabarits-utils.js` ×7, `spe-specifications.js` ×4, `demo-namespace.js` ×4, `objectifs.js` ×1, `pratiques-gestion.js` ×1, `planification-bibliotheque.js` ×1, et `pratiques-bibliotheque.js` ×3 — ces 3 ont été migrées vers `'Demo Labo Codex'` dans #290). Le filtre `BibliothequeUI.estItemDemo` (`js/bibliotheque-ui.js:33`) considère tout item avec `auteur === 'Labo Codex'` comme « démo », ce qui masque ces ~30 items en mode normal.
  - **Hypothèse de Grégoire 28 mai PM** : « Beaucoup de ce matériel est en réalité des résidus de tests de développement que j'ai voulu supprimer mais qui sont restés. »
  - **Tri catégoriel à effectuer** (3 catégories) :
    - **A. Vraies démos** : items référencés par le dataset démo (étudiants/productions/évaluations démo qui se chargent via la checkbox de la page d'accueil). Ces items DOIVENT rester visibles en mode démo et compatibles avec le dataset. Action : renommer `'Labo Codex'` → `'Demo Labo Codex'`.
    - **B. Canevas génériques mal taggués** : modèles utiles aux nouveaux utilisateurs (ex. `SPE-simple`-équivalents dans d'autres biblios), pas du démo. Action : déterminer le marqueur approprié (auteur neutre, ou pas d'auteur seed, ou nouveau marqueur `'Canevas Labo Codex'`).
    - **C. Résidus de tests** : anciennes données de dev orphelines, non utilisées ni en démo ni en normal. Action : supprimer du code source (zéro-dette).
  - **Méthode suggérée** :
    1. Lire `js/demo-activation.js` et `js/demo-namespace.js` pour identifier exhaustivement les IDs référencés par le dataset démo.
    2. Pour chaque occurrence `'Labo Codex'` dans les 8 fichiers : croiser avec la liste des IDs du dataset démo. Si référencé → catégorie A. Sinon → catégorie B ou C selon utilité documentée.
    3. Migrer les A vers `'Demo Labo Codex'`, déclasser les B (marqueur neutre), supprimer les C.
    4. Finaliser `BibliothequeUI.estItemDemo` pour ne matcher QUE `'Demo Labo Codex'` (retirer la chaîne `'Labo Codex'` legacy une fois la migration complète).
  - **Filet transitoire en place (livré dans le même commit que #290 phase 2)** : `estItemDemo` accepte temporairement les deux chaînes (`'Labo Codex'` OR `'Demo Labo Codex'`) pour éviter une régression du filtre démo pendant la transition.
  - **Calendrier** : post-AQPC (3 juin 2026). Pas urgent — le système fonctionne correctement avec le filet transitoire.
  - **Effort estimé** : 2-3 h (lecture demo-activation/namespace + croisement + tri + migration + ajustement filtre).
  - **Lien** : #290 (livraison du 28 mai 2026 PM qui a soulevé la question).

- [ ] 🟡 **#273** Évaluations démo basées sur de vrais travaux d'élèves anonymisés
  - Consentement obtenu de plusieurs élèves H2026. Travaux à anonymiser avant intégration au pack démo.
  - Périmètre : 2-3 dossiers complets (annotation Apple Pencil + évaluation grille + rétroaction structurée).
  - Préfixe `PROD_DEMO_` obligatoire (#86 : `PROD_` seul matche les vraies productions).
  - **Visée double** : valider flux bout-en-bout + servir d'exemples concrets aux nouveaux utilisateurs (AQPC 3 juin et après).

- [ ] 🟢 **#274** Produire des cartes mentales démo pour le matériel pédagogique (été 2026)
  - 2-3 cartes complètes couvrant différentes disciplines. Utile pour la cohorte CoP (Rencontre 5 « Aligner sa pratique », janvier 2027).
  - Période cible : été 2026 (préparation pendant la phase expérimentateurs juin-août).

### Recherche / Analyse longitudinale

- [ ] 🟢 **#35** Import historique H2024 (premier trimestre du portfolio, pratique sommative uniquement)
  - Baseline pour comparaison longitudinale (pas de PAN, pas de RaI).
  - Données disponibles : TSV artefacts, étudiants, évaluations. Même méthode d'import que A2024.

- [ ] 🟢 **#36** Rapport comparatif inter-trimestres (H2024, A2024, A2025, H2026)
  - Variables système (+Portfolio H24, +PAN A25, +RaI A25, +Patterns A25) + variables pratique.
  - **Hypothèse principale** : RaI (A25) → enseignant plus proactif → interventions précoces → moins de décrochages → meilleures moyennes.
  - **Potentiel communication AQPC** si résultats concluants.
  - **Prérequis** : #35.

- [ ] 🟢 **#245** Interventions N3 dans le profil étudiant — progression temporelle
  - Les interventions N3 (individuelles) ne sont pas significatives au niveau du groupe.
  - Approche : marqueur sur la courbe P individuelle + delta P avant/après. Prérequis : graphique de progression individuel existant.

- [ ] 🟢 **#241** Analyser l'impact des jetons de reprise sur P dans les courbes d'intervention
  - Quand un étudiant utilise un jeton, P change rétroactivement → masque l'effet réel d'une intervention.
  - Objectif : marquer les séances avec jetons, ou calculer un P « sans reprises » pour isoler l'effet net.

### Module Travaux — Phase 1 import (mars 2026, en suspens)

- [ ] 🟢 **#177** Import par dossier complet Lea (A1)
  - Lire le dossier téléchargé, parser noms `Nomdefamille_DA_Travail_Date`. Associer auto via DA.
  - Gestion des doublons (garder le dépôt le plus récent).

- [ ] 🟢 **#178** Assemblage multi-images par élève (A3)
  - Détecter fichiers multiples d'un même élève (même DA, même production).
  - Ordonner par nom/horodatage, assembler en document multi-pages. Le groupement existe déjà (`grouperSelection()`) — l'automatiser.

### Module Planification

- [ ] 📦 🟢 **#140** Organisateur — Refonte layout deux colonnes (horizon automne 2026)
  - Layout vertical actuel = trop de scroll. Cible : colonne gauche (vue d'ensemble leçon) + panneau droit (3 modes : Détail / Enseignement explicite / Vue calendrier).
  - Plan complet : `plans de travail/PLAN-ORGANISATEUR-LAYOUT.md`.
  - Inclus dans la complétion du module Alignement à l'automne 2026, pour Rencontre 5 « Aligner sa pratique » (janvier 2027).

### Module Évaluation — refactor architectural

- [ ] 🟢 **#272** Remplacer les 5 flags globaux + setTimeout imbriqués par un module `eval-chargement.js` (machine à états)
  - Coordonne ouverture fichiers et chargement évaluations. 5 flags + chaînes setTimeout (150-800ms) non annulables.
  - Cause race conditions, flags collants, restauration aveugle du mode Évaluer.
  - 5 phases, 6 points d'entrée à migrer. Plans détaillés : `plans de travail/Plan — Machine a etats pour le chargement d'evaluations.txt` + `Contre-expertise — Machine a etats eval-chargement.md`.
  - **Priorité** : moyenne — à planifier quand les correctifs de session ne suffisent plus.

### Rythme Phase 5 — Raffinements

- [ ] 📦 🟢 **#268** Courbe d'apprentissage de l'évaluateur (tendance temporelle par activité)
- [ ] 📦 🟢 **#269** Export du portrait temporel pour réflexion professionnelle
- [ ] 📦 🟢 **#270** Drill-down par activité → détail productions/groupes
- [ ] 📦 🟢 **#271** Planification multi-productions avec priorités

### Sécurité / Modes alternatifs

- [ ] 🟢 **#47** Mot de passe optionnel pour sauvegarde/restauration
  - AES-256 via Web Crypto API. Couvre la protection au repos (fichier exporté en local), distincte de la signature ECDSA prévue pour la Voûte (Défense F, juillet 2026).
  - Décision D3 du 11 mai 2026 a écarté le chiffrement au repos pour la Voûte ; cet item reste pertinent pour les sauvegardes personnelles cloud/USB.
  - À reconsidérer après Voûte Phase 1.

- [ ] 📦 🟢 **#33** Mode Tableur — Saisie directe des résultats (POST v1.0)
  - Utiliser l'app sans créer productions/grilles/échelles. Entrée directe des résultats comme dans un tableur.
  - Public cible : enseignants avec leur propre système d'évaluation ou voulant un outil simple.
  - Prérequis : documenter la logique complète avant codage.

---

## Notes

### Priorités

- **Retours testeurs** passent TOUJOURS AVANT ce backlog (politique CLAUDE.md).
- Items classés par thème, pas par ordre d'exécution. Le plan d'exécution recommandé vit dans `plans de travail/PLAN-TRAVAIL-26-MAI.md`.

### Pour ajouter un item

```markdown
- [ ] [emoji catégorie] **#XX** Description courte
  - Détail 1
  - Détail 2
```

### Pour marquer comme complété

1. Changer `[ ]` en `[x]` et ajouter `✅ LIVRÉ (date, build)`.
2. Déplacer l'item entier (avec son contexte) dans `BACKLOG-ARCHIVE.md`, dans une nouvelle section datée ou en ajoutant à la section existante.
3. Si pertinent : noter dans `SESSION.md` la livraison + référence au commit.

### Historique

Tous les items livrés/abandonnés/obsolètes (313 items au 25 mai 2026) sont consultables dans `BACKLOG-ARCHIVE.md` (2 198 lignes, organisé chronologiquement par beta/session).
