# SESSION ACTIVE - BETA 98.5

**Date** : 14 mars 2026
**Version** : Beta 98.5
**Statut** : Classeur Phase 3 — Multi-classeur + fusion (#227)

## PROCHAINE TÂCHE — #227 Classeur Phase 3 : Multi-classeur + fusion

**Contexte** : Le Classeur (module `js/classeur.js`, ~2657 lignes) est un workspace portable ZIP.
Phase 1 (COMPLÉTÉE) : generer/charger/valider/sauvegarder multi-plateforme.
Phase 2 (COMPLÉTÉE) : TimeMachine — snapshots automatiques dans `historique/`, restauration, comparaison visuelle.

**Objectif Phase 3** : Permettre d'ouvrir plusieurs classeurs et de fusionner leurs données intelligemment.

**Cas d'usage principal** :
- L'enseignant travaille sur Mac (classeur A) et iPad (classeur B) pendant la semaine
- Vendredi, il veut fusionner les deux pour avoir un classeur complet
- Le système doit détecter les conflits (même clé modifiée des deux côtés) et proposer une résolution

**Sous-fonctionnalités prévues** :
1. Ouvrir un 2e classeur ZIP sans écraser le 1er (lecture seule pour comparaison/fusion)
2. Fusion intelligente par ID + timestamp (la donnée la plus récente gagne par défaut)
3. Détection de conflits (même clé modifiée des deux côtés depuis le dernier ancêtre commun)
4. Résolution de conflits (choix par l'utilisateur : garder A, garder B, ou les deux)
5. Export sélectif (par groupe-cours, par étudiant — optionnel, à valider)

**Fichiers à modifier** : `js/classeur.js`, `index.html` (menu), potentiellement `styles.css`
**Plan détaillé** : `docs/plan-classeur.md` (section Phase 3)
**Approche** : étape par étape, valider chaque sous-étape avant de continuer

**IMPORTANT** : Lire `docs/plan-classeur.md` et `js/classeur.js` en début de session.

## SESSION DU 14 MARS 2026

### Travail accompli — Classeur Phase 3 : Fusion, étapes 3.1-3.3 (14 mars 2026)

191. **Lecture classeur externe (3.1)** : `lireClasseurExterne(fichierZip)` lit un ZIP en mémoire SANS écrire dans IndexedDB. Retourne `{manifeste, donnees, travauxListe, _zip}`. API publique : `Classeur.lireExterne()`. Base pour toute opération de comparaison/fusion. **Fichier** : `js/classeur.js`.

192. **Analyse de fusion diff 3 parties (3.2)** : `_analyserFusion(local, externe, ancetre)` — avec ancêtre commun, détecte les vrais conflits (modifié/supprimé des deux côtés). Sans ancêtre, mode dégradé (toute différence = conflit). 8 catégories : ajouteesLocal/Externe, modifieesLocal/Externe, supprimeesLocal/Externe, conflits, identiques. Helpers : `_analyserFusionTravaux()` (diff blobs par chemin), `_formaterAnalyseFusion()` (résumé lisible). **Fichier** : `js/classeur.js`.

193. **Résolution interactive des conflits (3.3)** : `_resoudreConflits(analyse, donneesLocales, donneesExternes, analyseTravaux)` — auto-résolution des cas non-conflictuels + 4 stratégies pour conflits (tout local, tout externe, un par un, annuler). Helper `_resumerValeur()` pour résumé lisible des valeurs. Retourne `{resolutions, importerTravaux, annule}`. **Fichier** : `js/classeur.js`.

194. **Fusion des blobs travaux (3.4)** : `_fusionnerTravaux(zipExterne, donneesExternes, cheminsAImporter, onProgression)` — extrait et stocke les blobs manquants via `travauxStockage.stockerBlob()`, fusionne la liste `fichiersTravaux` locale sans doublon. Retourne `{importes, ignores, erreurs}`. **Fichier** : `js/classeur.js`.

195. **Action menu Fusionner (3.5)** : `actionFusionner()` — flux complet en 12 étapes : file picker → lecture externe → collecte IDB → ancêtre commun → analyse diff → résolution conflits → application IDB → sync cache → import blobs → résumé. Bouton "Fusionner avec un classeur..." dans le menu en-tête (visible si classeur actif). **Fichiers** : `js/classeur.js`, `index.html`.

196. **Export sélectif par trimestre (3.6)** : `actionExporterSelection()` — détecte les trimestres disponibles, propose un choix (numéros ou "tous"), filtre les données + blobs associés, génère un ZIP partiel (sans TimeMachine). Helpers : `_detecterTrimestresDisponibles()`, `_filtrerDonneesPourExport()`, `_filtrerTravauxPourExport()`, `_formaterNomTrimestre()`. Manifeste marqué `exportSelectif: true`. Bouton "Exporter une sélection..." toujours visible dans le menu. **Fichiers** : `js/classeur.js`, `index.html`.

### Travail accompli — Classeur TimeMachine Phase 2 (14 mars 2026)

187. **TimeMachine infrastructure** : Ajout des constantes (`DOSSIER_HISTORIQUE`, `MAX_SNAPSHOTS=10`, `MAX_JOURS_HISTORIQUE=30`), cles IDB (`_classeur_hist_index`, `_classeur_snapshot_avant`, `_classeur_hist_*`), et 4 helpers : `_purgerHistorique()` (rotation), `_ecrireHistoriqueDansZip()` (IDB→ZIP), `_chargerHistoriqueDepuisZip()` (ZIP→IDB), `_nettoyerHistoriqueIDB()` (nettoyage). Aucun flux existant modifie. Commit `9eedefa`.

188. **TimeMachine branchement** : `genererClasseur()` archive le snapshot precedent dans `historique/`, applique la rotation, ecrit tous les snapshots dans le ZIP, et enrichit le manifeste avec `historique[]`. `chargerClasseur()` capture `donnees.json` comme snapshot de reference et charge l'historique existant du ZIP vers IDB. `fermerClasseur()` nettoie l'historique IDB. Commit `20442df`.

189. **TimeMachine restauration** : `actionRestaurer()` affiche un prompt() avec liste numerotee des snapshots (date, appareil, taille), confirm() de securite, archive automatiquement les donnees actuelles avant ecrasement, restaure le snapshot choisi dans IDB, sync cache localStorage, et propose le rechargement. Bouton "Historique des versions..." dans le menu en-tete (visible si classeur actif). **Fichiers** : `js/classeur.js`, `index.html`. Commit `bf11f3e`.

190. **TimeMachine comparaison visuelle** : `actionComparer()` permet de comparer les donnees actuelles avec un snapshot historique. Diff par cle via JSON.stringify : cles ajoutees, supprimees, modifiees. Affichage regroupe par prefixe (ex: `h2026_* (12 cles)`) pour lisibilite. Helpers : `_comparerDonnees()`, `_formaterDiff()`, `_grouperParPrefixe()`. Bouton "Comparer avec une version..." dans le menu en-tete. **Fichiers** : `js/classeur.js`, `index.html`.

---

## SESSION DU 4 MARS 2026

### Travail accompli — Corbeille fichiers + changement de grille (4 mars 2026)

184. **Corbeille persistante pour fichiers supprimes** : Remplacement du hard-delete par un soft-delete avec restauration possible pendant 30 jours. Bouton « Corbeille (N) » dans la liste des evaluations, vue dediee avec restaurer/supprimer/vider. Cle namespacee `corbeilleFichiers`. Purge automatique > 30j dans `initialiserStockageTravaux()`. **Fichiers** : `js/trimestres.js`, `js/travaux-stockage.js` (+7 fonctions), `js/liste-evaluations.js` (+vue corbeille). Commit `b5562d1`.

185. **Changement de grille sur cartouche et evaluation existantes** : Dropdown grille deverrouille en edition de cartouche (avec confirmation). `chargerGrilleSelectionnee()` regenere les criteres et recalcule la note quand on change de grille. Commit `a5bdd3e`.

186. **Preservation des criteres communs lors du changement de grille** : Correspondance par nom de critere (insensible a la casse) quand les IDs different entre deux grilles. Ex: SRPNF → SRPN conserve S, R, P, N automatiquement. Commit `0db149e`.

---

## SESSION DU 1 MARS 2026

### Travail accompli — Consolidation styles inline (#210) + fix accueil (1 mars 2026)

181. **Consolidation styles inline** : Remplacement mecanique de 276 attributs `style="..."` par les classes utilitaires `u-*` existantes dans `index.html` (1 137 → 861). ~1 150 proprietes extraites sur 770+ lignes. Aucune nouvelle classe CSS creee, aucun fichier JS modifie. Les 53 elements toggles par `.style.display` en JS inline sont preserves intacts. Commit `eedbad4`.

182. **Fix lecture cle cours dans accueil.js** : La migration dans `trimestre-v2.js` deplace `listeCours` → `cours` puis vide `listeCours` a chaque chargement. `accueil.js` lisait `listeCours` (toujours `[]`) et affichait l'ecran premier lancement. Corrige pour lire `cours` en priorite avec fallback sur `listeCours`. Commit `a95a536`.

183. **Page d'accueil unifiee** : Suppression de l'ecran "Bienvenue dans le Monitorage" (premier lancement avec 2 cartes). Tous les utilisateurs voient la meme page avec les 3 accordeons Decouvrir, Parcourir et Piloter. Titre unifie "Que souhaites-tu faire ?". -66 lignes de code mort. Commit `41d6eb6`.

---

## SESSION DU 28 FÉVRIER 2026

### Travail accompli — Plan de vérification audit Beta 98.3 (28 février 2026)

180. **Plan de vérification manuelle** : Création de `docs/Plan d'audit/PLAN-VERIFICATION-AUDIT-98.3.md` — guide de 11 tests manuels couvrant les 18 correctifs des Phases 1-3 + #206. Tests : console propre (EVL-06, TRM-07), cohérence indices 3 vues (SUI-01), guard NaN (SUI-02), isolation trimestres (TRM-01/02/03/04), modes assisté/simulation (EVL-01), import fichiers + limite 20 MB (TRV-01/03), annotations stables (TRV-02/04), import/export sans résidu (AUT-01), performance tableau de bord (SUI-06, PLN-03), corrélation Pearson et historique indices (#206). Archivage complet du dossier `docs/Plan d'audit/` avec les 8 plans d'exécution des 4 phases de correction. Commit `2e317ba`.

### Travail accompli — Audit qualité : centralisation indices (#206) (28 février 2026)

178. **Nouveau module `js/indices.js`** : Extraction pure de 7 fonctions de calcul d'indices A-C-P-E dispersées dans 4 fichiers vers un module centralisé. Fonctions déplacées : `calculerCorrelationPearson` (doublon éliminé), `determinerNiveauEngagement`, `obtenirIndicesCP`, `obtenirHistoriqueIndicesCP`, `calculerPerformancePAN`, `calculerTousLesIndices`, `calculerIndicesEtudiant`. Les producteurs (`calculerEtStockerIndicesCP`, `calculerEtSauvegarderIndicesAssiduite`) restent dans leur module d'origine. Ref audit : SUI-01, backlog #206.

### Travail accompli — Audit qualité du code (28 février 2026)

179. **Audit qualité complet** : 134 constats (24 critiques, 63 modérés, 47 mineurs) documentés dans `docs/AUDIT-QUALITE.md`. Phase 1 (intégrité données, 7 correctifs), Phase 2 (robustesse, 8 correctifs), Phase 3 (performance, throttle rAF + cache) — toutes complétées. Reste : #207 (travaux-stockage → db.js), #210 (styles inline), #159/#160 (UX bibliothèques).

---

### Travail accompli — Toolbar unifiée 1 rangée (28 février 2026)

168. **Toolbar 1 rangée — Modélisation** : Réécriture de `construireUI()` dans `modelisation.js`. Les 2 rangées (carrousel badges + toolbar outils) sont fusionnées en une seule `<div class="annot-toolbar">` avec zone badges scrollable à gauche (`annot-toolbar-fichiers`) et outils de navigation/zoom à droite (`annot-toolbar-outils`), séparées par `annot-toolbar-separateur`. Suppression de `model-carrousel` et `model-nom-fichier`. La toolbar reste toujours visible (même sans fichier ouvert).

169. **Toolbar 1 rangée — Annoter/Évaluer** : Réécriture de `afficherVisionneuse()` dans `travaux-ui.js`. Le dropdown artefact + badges sont intégrés dans la toolbar (`.annot-toolbar-fichiers.travaux-fichiers-compact`) au lieu d'avoir une rangée séparée. Suppression du badge actif dans la toolbar (`travaux-badge-fichier-actif`), remplacé par scroll-to-badge actif dans le strip.

170. **CSS unifié `.annot-toolbar`** : Nouvelles classes `.annot-toolbar`, `.annot-toolbar-fichiers`, `.annot-toolbar-separateur`, `.annot-toolbar-outils`, `.annot-toolbar-badges-zone` dans `styles.css`. Suppression de `.model-carrousel`, `.model-carrousel-badges`, `.model-toolbar-nom-fichier`. Ajustement des hauteurs (`calc(100vh - 120px)`).

171. **Padding optimisé Modélisation** : Ajout de surcharges `:has()` dans `styles.css` pour supprimer le padding des conteneurs imbriqués quand Modélisation est active (`.contenu:has(#boite-outils-modelisation...)`, `#section-boite-outils...`). `.model-layout` passe à `padding: 0`.

172. **Zoom pleine hauteur par défaut** : `ouvrirFichierModelisation()` appelle désormais `zoomPleineHauteur()` au lieu de `zoomPleineLargeur()` pour un affichage optimal du document.

173. **Accents badges Modélisation** : `determinerStatutModelisation()` retourne maintenant `'Importé'` et `'Annoté'` (avec accents) au lieu de `'Importe'`/`'Annote'`.

174. **Fix layout annotation Modélisation** : `creerLayoutAnnotation()` cherche maintenant `.annot-toolbar` en priorité (puis `.travaux-toolbar` en fallback) pour insérer le layout flex au bon endroit.

175. **Fix document invisible Modélisation** : Le zoom après ouverture utilise double `requestAnimationFrame` (attend le reflow complet du layout flex) suivi de `scrollerEnHaut()` avec délai 150ms. Corrige le canvas invisible causé par le déplacement DOM du canvas container dans le layout flex.

176. **Fix visionneuse non chargée** : `afficherFichiers()` dans `travaux-ui.js` remet `conteneur.innerHTML = ''` avant `afficherVisionneuse()` pour forcer la reconfiguration de `setConteneur()` après navigation entre modules.

177. **Fix décalage document Annoter/Évaluer** : `basculerMode()` utilise `requestAnimationFrame` + `scrollerEnHaut()` pour les transitions Annoter↔Évaluer, évitant le décalage causé par un zoom calculé avant le reflow.

---

## SESSION DU 26 FÉVRIER 2026

### Travail accompli — Outils d'annotation unifiés et duplication (26 février 2026)

162. **Fusion Ligne/Flèche** : Les outils `ligne` et `fleche` sont fusionnés en un seul outil `fleche` (affiché « Ligne ») avec 4 modes d'extrémités via la propriété `pointes` : `'fin'` (→), `'debut'` (←), `'double'` (↔), `'aucune'` (—). Helper `normaliserPointes(forme)` assure la rétrocompatibilité : `type:'ligne'` → `'aucune'`, `double:true` → `'double'`. Fichiers : `travaux-outils.js`, `travaux-annotation.js`, `travaux-export-pdf.js`.

163. **Extrémités pour Vague** : L'outil ondulé dispose des mêmes 4 modes d'extrémités. Les pointes de flèche se dessinent aux extrémités de la courbe sur le canvas et dans l'export PDF.

164. **Grille 2×2 Formes** : Les boutons Formes sont disposés en grille 2×2 avec la classe CSS `travaux-palette-outils--grille2x2`. Ordre : Cercle, Rectangle, Ligne, Vague.

165. **Bouton Dupliquer** : Nouveau bouton « Dupliquer » à côté de « Sélection ». Fonction `dupliquerSelection()` dans `travaux-annotation.js` clone les annotations sélectionnées avec offset 2%, IDs uniques, support annuler/rétablir (`duplication-multiple`).

166. **Curseur codes d'erreur corrigé** : `genererCurseurErrFr()` utilise `obtenirOrdreErreursFr()` pour afficher le rang personnalisé au lieu de l'ID fixe.

167. **Effacer tout** : Le bouton « Effacer » renommé en « Effacer tout ».

---

## SESSION DU 25 FÉVRIER 2026 (après-midi)

### Travail accompli — Gestion avancée, évaluation et nettoyage (25 février 2026)

154. **Gestion avancée : fusion bibliothèque + templates** : La Gestion avancée des ressources (Réglages > Données) ne lisait que les clés `bibliothequeGrilles`/`bibliothequeEchelles`, ignorant `grillesTemplates`/`echellesTemplates` utilisées par les dropdowns d'Évaluer. Nouvelle fonction `fusionnerRessources(biblio, templates)` dans `donnees-v2.js` qui combine, déduplique par `id` (priorité bibliothèque) et ajoute un marqueur `_source`. Compteurs, tableaux d'affichage (V1 et V2), lookup de suppression et suppression effective mis à jour pour lire et supprimer des deux côtés. Colonne « Source » ajoutée aux tableaux grilles et échelles avec badges Bibliothèque/Templates.

155. **Panneau évaluation : scrollbar pour tous les critères** : Le 5e critère d'une grille à 5 critères (ex: « Français ») était coupé sans scrollbar. Cause : `.travaux-panneau-lateral` avait `overflow: hidden` et `.travaux-panneau-corps` un `max-height: calc(100vh - 220px)` trop restrictif. Corrigé : `overflow-y: auto` sur le panneau latéral, `max-height` ajusté à `calc(100vh - 120px)`.

156. **Panneau Rétroaction redimensionnable** : Le splitter entre Évaluation et Rétroaction ne permettait pas de rétrécir Rétroaction vers la droite. Deux causes : `#travaux-palette-eval-retro` avait `min-width: 400px` (réduit à 100px), et `.eval-col-retro` avait `flex-shrink: 0` (changé à `flex: 0 1 340px`). La largeur par défaut passe de 260px à 340px pour un meilleur équilibre initial.

157. **Bouton Export PDF déplacé (productions et cartouches)** : Les zones d'aperçu PDF flottantes (`#zoneApercuProductions`, `#zoneApercuCartouche`) supprimées de `index.html`. Remplacées par un bouton « Exporter en PDF » dans la barre de boutons du formulaire d'édition (`btnExporterPDFProduction`, `btnExporterPDFCartouche`), visible uniquement en mode édition.

158. **Export PDF cartouche : source corrigée** : `exporterCartoucheSelectionneeEnPDF()` dans `export-pdf.js` utilisait les anciens selects cachés (`selectGrilleRetroaction`, `selectCartouche`). Corrigé : utilise `window.cartoucheActuel` en priorité (nouvelle interface sidebar), avec fallback sur les anciens selects.

159. **Métadonnées cartouche : backfill systématique** : `sauvegarderCartouche()` dans `cartouches.js` initialise maintenant `metadata_cc` (date_creation, auteur_original, contributeurs) pour toutes les cartouches, pas seulement les nouvelles. Corrige les cartouches anciennes sans métadonnées.

160. **Filtre production persisté** : Le dropdown « Filtrer par production » dans la grille de fichiers est maintenant persisté en `sessionStorage` (`travaux-filtre-production`). Le filtre est restauré automatiquement lors du rafraîchissement de la vue. La sélection de production dans le pipeline est aussi persistée (`travaux-pipeline-production`).

161. **Modal suppression ressource : migration style** : `modal-suppression-ressource` dans `index.html` migré de `style="display:none"` vers la classe `.modal-overlay` standard. Les alertes de dépendances et avertissements migrent de `style="display:none"` vers `u-hide`.

### Travail accompli — Pipeline d'import et préférences (25 février 2026, matin)

148. **Bouton « Re-déposer les fichiers »** : Quand la file d'attente du pipeline est restaurée depuis `sessionStorage`, les blobs `File` sont perdus (non sérialisables). Ajout d'une alerte orange globale indiquant le nombre de fichiers à re-déposer, avec un bouton qui ouvre un sélecteur de fichiers. Correspondance par nom exact (`nomFichier === fichier.name`). Les thumbnails sont régénérées automatiquement. Nouvelle fonction `reattacherBlobs()` dans `travaux-import.js`, fonction `redeposerFichiers()` dans `travaux-ui.js`.

149. **Inspecteur pipeline remanié** : La colonne centre du pipeline affiche désormais un « Inspecteur » avec sélecteur de production, réglages par défaut (DPI, balance des blancs, doublons, assemblage), et métadonnées du fichier sélectionné (toggle LEA/Autre, étudiant avec autocomplete, production, date).

150. **Réglages spécifiques par fichier (préparation)** : Nouvelle section « Import » dans la palette de préparation permettant de désactiver la balance des blancs ou de conserver la résolution originale pour un fichier individuel. Flags `skipBalance` et `format11x17` par fichier, respectés lors de `appliquerEtImporter()`.

151. **Scroll synchronisé colonnes pipeline** : Les colonnes gauche (originaux) et droite (confirmés) scrollent en synchronisation. Le scroll est préservé lors de la sélection d'un fichier et du rafraîchissement UI.

152. **Préférence SIS (Système d'information scolaire)** : Nouvelle carte dans les préférences v2 permettant de choisir le SIS du cégep (Omnivox/Léa par défaut, COBA et Col.NET prévus). Persisté dans `preferencesAffichage.sisDefaut`.

153. **Mode import par défaut LEA** : `modeImport` initialisé à `'lea'` au lieu de `'libre'` pour tous les fichiers, peu importe la détection du DA.

---

## SESSION DU 24 FÉVRIER 2026

### Travail accompli — Correction bugs évaluations (rapport Grégoire, 24 février 2026)

> **Rapport** : `Retours des testeurs/gregoire/24 février 2026/ID- grégoire 2026-02-24 13-36-16.txt`
> **Bugs** : #69, #70, #71, #72

127. **Namespace manquant rapport-bug** (#69) : `rapport-bug.js:470` lisait `'evaluationsSauvegardees'` sans `cle()`, affichant `nbEvaluations: 0` dans les rapports de bug. Corrigé avec `cle('evaluationsSauvegardees')`.

128. **Appel redondant `afficherFichiers()` retiré** (#69) : `navigation.js:531-538` appelait `travauxUI.afficherFichiers()` après `initialiserModuleTravaux()` qui fait déjà `rafraichirUI()` → `afficherFichiers()`. Le double-rendu pouvait écraser les badges mis à jour.

129. **Badge étudiant restauré dans la toolbar** (#70) : Le commit `0dd47d2` (23 fév) avait déplacé le badge vers le panneau Paramètres uniquement. Restauration du `<span#travaux-badge-fichier-actif>` dans `travaux-toolbar-gauche` + peuplement dans `ouvrirFichier()` avec pill statut (EN COURS/ÉVALUÉ), scroll-to-badge au clic, et suppression du bouton supprimer.

130. **Perte données inter-cours corrigée** (#71) : 4 fonctions (`sauvegarderEvaluationModifiee`, `basculerVerrouillageEvaluation`, `supprimerEvaluation`, `toggleVerrouillerEvaluation`) utilisaient `obtenirDonneesSelonMode('evaluationsSauvegardees')` qui filtre par `coursId`. Sauvegarder ce sous-ensemble écrasait les évaluations des autres cours. Remplacé par `db.getSync(cle('evaluationsSauvegardees'), [])` pour lire/écrire le tableau complet.

131. **Badge « EN COURS » au lieu de « ÉVALUÉ »** (#72) : `genererBadgeFichierImporte()` cherchait les évaluations avec correspondance exacte `(etudiantDA, productionId)`. Quand un fichier importé sans production (`productionId = ''`) était évalué avec une production sélectionnée dans le formulaire, la recherche échouait (`'' !== 'artefact1'`). Corrigé : si le fichier n'a pas de `productionId`, accepter toute évaluation pour cet étudiant.

132. **Cadenas 🔒 manquant après modification** (#72) : `sauvegarderEvaluationModifiee()` auto-verrouille l'évaluation (`verrouillee: true`) mais n'ajoutait pas l'icône cadenas sur les badges. Le cadenas est maintenant injecté dans le DOM (badge liste + badge toolbar) immédiatement après sauvegarde.

133. **Diagnostic ajouté** : `console.warn('[Badge]')` dans `genererBadgeFichierImporte()` quand un fichier annoté n'a pas d'évaluation correspondante — aide au débogage en conditions réelles.

> **Rapport** : `Retours des testeurs/gregoire/24 février 2026/ID- grégoire 2026-02-24 14-59-41.txt`
> **Bug** : #73

134. **Bouton « Évaluer » bloqué après navigation** (#73) : Après navigation vers le Tableau de bord et retour au module Annoter, `modeCourant` restait à `'evaluer'` car les palettes DOM étaient détruites pendant la navigation sans appel à `fermerModeEvaluation()`. `basculerMode('evaluer')` voyait `modeCourant === 'evaluer'` et retournait immédiatement. Corrigé en réinitialisant `modeCourant = 'annoter'` dans `initialiserModuleTravaux()` à chaque entrée dans le module.

> **Rapport** : `Retours des testeurs/gregoire/24 février 2026/ID- gregoire 2026-02-24 15-06-02.txt`
> **Bug** : #74

135. **Export affiche le mauvais groupe** (#74) : Grégoire évalue 21 copies du groupe 8, mais l'export montre 23 copies du groupe 2. Cause : `peuplerDropdownGroupeCoursActif()` (trimestre-v2.js:5652) validait `groupeCoursActif` contre `groupesCours` (filtrée par `dansSidebar !== false`). Si le groupe actif avait `dansSidebar === false`, il était considéré invalide et remplacé silencieusement par le premier groupe visible. Corrigé : validation contre `tousGroupesCours` (liste non filtrée).

> **Bugs** : #75-#84

136. **Export Lea : compteur et fichiers du mauvais groupe** (#75) : `mettreAJourCompteurLea()` et `exporterPourLea()` utilisaient les fichiers sans filtre groupe. Corrigé avec `obtenirFichiersGroupeActif()` et matching évaluations par `productionId` sélectionnée.

137. **Production non identifiée au rechargement** (#76) : `fichier.productionId` vide malgré évaluation sauvegardée. Triple correction : (a) `sauvegarderEvaluation()` propage productionId/etudiantDA/groupeCoursId vers le fichier, (b) fallback sécuritaire dans `ouvrirFichier()` (1 seule production → auto-select, multiples → sélection manuelle).

138. **Synthèse rétroaction absente de l'export PDF** (#77) : `ajouterPageSynthese()` matchait par `fichier.productionId` (vide). Paramètre `productionIdOverride` propagé via toute la chaîne d'export. Checkboxes « Inclure évaluations » cochées par défaut.

139. **Note chiffrée malgré « Lettre seulement »** (#78) : Cascade de priorité inversée dans `travaux-export-pdf.js` et `evaluation.js`. Réordonnée : pratique active > évaluation sauvegardée > défaut. `cocherOptionsParDefaut()` appliqué aussi au chargement d'évaluation existante.

140. **Compteur « 21 annotés » vs badges « ÉVALUÉ »** (#79) : `determinerStatutFichier()` utilisait un matching strict sur `productionId`. Aligné avec le matching souple de `genererBadgeFichierImporte()`.

141. **Rétro-propagation métadonnées fichiers orphelins** (#80) : Fonction `retroPropagerMetadonnees()` à l'initialisation : propage `productionId` depuis les évaluations et `groupeCoursId` depuis l'appartenance réelle de l'étudiant (groupeEtudiants + groupesCours).

142. **Archivage affichait fichiers du mauvais groupe** (#81) : Rétro-propagation `groupeCoursId` corrigée pour utiliser l'index `DA → groupeCoursId` plutôt que les évaluations (qui avaient le mauvais groupe). Compteur filtré par groupe actif.

143. **Archivage ne se rafraîchissait pas au changement de groupe** (#82) : Ajout de `travauxUI.afficherArchivage()` dans les handlers de changement groupe-cours (modes COURS et GROUPE-COURS) dans trimestre-v2.js.

144. **Checkboxes rétroaction décochées au chargement** (#83) : `verifierEtChargerEvaluationExistante()` restaurait les valeurs sauvegardées (souvent `false`). Remplacé par `cocherOptionsParDefaut()` qui coche tout et applique la préférence pratique pour le radio.

145. **Déverrouiller une éval déverrouille toutes les autres** (#84) : `basculerVerrouillageEvaluationCourante()` utilisait `obtenirDonneesSelonMode` (filtré par coursId) → sauvegardait un sous-ensemble → écrasait les données. Corrigé avec `db.getSync(cle(...))` + rafraîchissement badges après basculement.

### Travail accompli — Validation et humanisation de l'onglet Aide (Beta 97.13, build 0224-0505)

121. **Disclaimer IA supprimé** : Le bloc d'avertissement « généré par IA » dans l'onglet Aide est retiré.

122. **Tutoiement harmonisé** : 11 instances de vouvoiement (vos/votre/Créez/Utilisez/Glissez/etc.) corrigées en tutoiement cohérent dans la section Aide et les notes de version.

123. **Mentions « à venir » mises à jour** : Import CSV → retiré (fonctionnalité existe). Filtres par niveau de risque et Export automatique hebdomadaire → reformulés « prévu dans une version future ».

124. **10 titres d'accordéons recadrés** : Titres descriptifs convertis en format actionnable (ex: « Qu'est-ce que le suivi ? » → « Comprendre le suivi de l'apprentissage », « Tableau de bord → Aperçu - LECTEUR » → « Consulter le tableau de bord »).

125. **Validation du contenu contre l'app** : Navigation corrigée dans 3 accordéons (Groupe → Trimestre/Groupe d'étudiants, Horaire → Trimestre/Horaire, Pratique → Construction/Pratiques de notation). Labels alignés (Enseignant·e, retrait MODULE SOURCE).

126. **5 nouveaux accordéons** : Gérer la liste des étudiants, Planifier les leçons, Annoter et corriger les travaux, Personnaliser les préférences, Exporter et sauvegarder tes données.

## SESSION DU 22 FÉVRIER 2026

### Travail accompli — Correction fichiers fantômes et isolation par groupe-cours (Beta 97.10, build 0222-1750)

115. **Filtrage fichiers par groupe-cours** : Nouvelle fonction `obtenirFichiersGroupeActif()` dans `travaux-stockage.js` qui filtre les fichiers par `groupeCoursId` du groupe-cours actif. Remplace tous les appels à `obtenirFichiersTravaux()` dans les modules UI (`travaux-ui.js`, `liste-evaluations.js`, `travaux-export-pdf.js`, `travaux-archivage.js`). Les fonctions internes de stockage conservent la liste non filtrée pour les opérations CRUD.

116. **Stampage coursId/groupeCoursId à l'import** : `importerFichier()` (`travaux-import.js`) lit `infoCours` et `groupeCoursActif` depuis db et les injecte dans les métadonnées du fichier. Les fichiers sont désormais correctement taggés à leur groupe d'origine.

117. **Cascade de suppression fichier+évaluation** : `supprimerFichierImporte()` (`travaux-ui.js`) vérifie dans `evaluationsSauvegardees` si une évaluation est associée (même DA + productionId). Si oui, propose de supprimer les deux via `confirm()`. Empêche les évaluations fantômes après suppression de fichiers.

118. **Rollback métadonnées si stockage blob échoue** : `importerFichier()` (`travaux-import.js`) encapsule `stockerBlob()` dans un try/catch. En cas d'échec (quota dépassé), `supprimerFichierTravail()` nettoie les métadonnées orphelines.

119. **Rafraîchissement travaux au changement de groupe** : `changerGroupeCoursActifV2()` (`trimestre-v2.js`) appelle `travauxUI.afficherImport()` et `travauxUI.afficherFichiers()` si les conteneurs sont visibles. Corrige le problème où les fichiers de l'ancien groupe restaient affichés après changement.

120. **Stats fichiers cohérentes par groupe** : Le compteur « Fichiers importés (N) — X Mo » dans `afficherImport()` utilise maintenant la taille calculée depuis la liste filtrée, pas le total global de `statistiquesFichiers()`.

### Travail accompli — Éditeur de pages, layout évaluation et mode annotation (Beta 97.9, build 0222-0949)

111. **Éditeur de pages pour documents importés** : Nouveau workflow drag-and-drop pour éditer un document déjà importé. Glisser un badge vers la zone « Éditer un document » décompose le PDF en pages individuelles (via PDF.js). Interface avec thumbnails, boutons ↑/↓ pour réordonner, × pour supprimer, « Ajouter des pages » pour insérer. Sauvegarde le PDF réassemblé (jsPDF) dans IndexedDB. Fichiers modifiés : `travaux-ui.js` (ouvrirEditeurPages, renderEditeurPages, sauvegarderEdition), `travaux-import.js` (decomposerPDF, reassemblerPages), `styles.css`.

112. **Layout flex plein canevas en mode Évaluer** : Les palettes d'évaluation occupent tout le canevas en colonnes flex. Paramètres (gauche), Document à 165 % (centre), Évaluation (milieu-droit), Rétroaction pleine hauteur (droite). Jetons intégrés dans la palette Paramètres avec checkboxes compactes. Boutons emojis en bas de Paramètres pour naviguer. Textarea rétroaction occupe toute la hauteur grâce à la propagation flex. `travaux-ui.js` : `afficherPalettesEval()` réécrite, `fermerModeEvaluation()` mise à jour. `travaux-visionneuse.js` : `setZoomManuel()` ajoutée.

113. **Persistance des checkboxes jetons** : Correction du bug où les checkboxes jetons se décochaient immédiatement après clic. Remplacement du `setTimeout(() => peuplementPaletteJetons())` (reconstruction HTML complète) par `mettreAJourEtatJetonsPalette()` qui synchronise les états depuis les checkboxes originales et met à jour les compteurs sans détruire le DOM.

114. **Mode Annoter redessiné** : Le document s'ouvre en pleine largeur (`zoomPleineLargeur()`) avec le haut aligné au viewport (`scrollerEnHaut()`). Les palettes tampons et codes d'erreur ne sont plus créées automatiquement — seule la palette d'annotation est visible par défaut. Palette réduite à max 180px. `travaux-annotation.js` : suppression de la création automatique des palettes tampons/erreurs. `travaux-visionneuse.js` : `scrollerEnHaut()` ajoutée.

## SESSION DU 21 FÉVRIER 2026

### Travail accompli — Améliorations évaluation, statuts et configuration des pratiques (Beta 97.9, build 0221-1535)

103. **8 améliorations UI (Évaluer, Liste, Tableau de bord)** : Badges compacts (`white-space: nowrap`), rétroaction structurée avec auto-dépliage de la palette, suppression du dropdown Groupe redondant, refonte des statuts d'évaluation (Non reçu → Reçu → Importé → Annoté → Évalué → Remis) avec badges colorés, colonne "Statut" remplace "Niveau" dans la liste, navigation intelligente depuis le bouton Évaluer selon l'étape du flux, inversion des couleurs Gauss entre modes clair/sombre, connexion palette Jetons aux réglages.

104. **Zone badges et filtre production** : Les badges ont la même largeur que le canvas (retrait du `.conteneur`). Dropdown de production ajouté à gauche des badges avec filtre `filtrerBadgesParProduction()`. Labels "ÉTUDIANT·E" et "PRODUCTION" retirés de la palette Paramètres.

105. **Structure des évaluations corrigée** : Correction `afficherConfigurationType()` (pratique-notation-v2.js) — les IDs `v2-*` remplacés par `mat-*` et `classList.remove('u-hide')` remplacé par `style.display = ''` pour surcharger le style inline. Badge "6 meilleures" corrigé en "4 meilleures + 2 oblig." dans `genererBadgeCaracteristiques()` (pratiques-materiel.js).

106. **Canvas toujours centré** : Ajout `requestAnimationFrame(() => recentrerVue())` dans `ouvrirFichier()` (travaux-visionneuse.js) pour garantir le centrage après layout finalisé.

107. **Dropdown production toujours visible** : Le `<select>` de production est généré même avec une seule production (remplacement du `<span>` statique).

108. **Bridge jetons pratique → évaluation** : Synchronisation de `configurations[index].jetons` (pratiques-materiel.js) vers `modalitesEvaluation.configPAN.jetons` dans `chargerEchellePerformance()` (evaluation.js). La palette Jetons lit désormais les bons compteurs.

109. **Palette Jetons repositionnée** : Déplacée de `top: 55%, left: 12px` (superposée à Paramètres) vers `bottom: 12px, left: 12px`.

110. **Configuration des pratiques — toggleDisplay global** : Correction de `toggleDisplay()` (main.js) pour gérer `style.display` en plus de `classList`, résolvant l'affichage des catégories Sélection/Obligatoires et du contenu jetons. Correction de `afficherConfigurationTypeMat()` (pratiques-materiel.js) avec même approche.

## SESSION DU 20 FÉVRIER 2026

### Travail accompli — Correctifs UX palette et évaluation (Beta 97.9, build 0220-2030)

97. **Palette fixe au scroll** : L'insertion de la palette flottante est déplacée de `#travaux-canvas-container` vers `#travaux-conteneur-document` (`.travaux-zone-document`) dans `activerAnnotation()` (travaux-annotation.js). La palette reste fixe lors du défilement du canvas. Référence drag mise à jour dans `configurerDragPalette()` (travaux-outils.js).

98. **Emojis remplacés par texte** : Toutes les icônes emoji des outils d'annotation (OUTILS dans travaux-outils.js) remplacées par des mots courts : Sél., Stylo, Surl., Gomme, Texte, Cercle, Flèche, Rect., ✓, ✗. Boutons undo/redo/effacer remplacés par « Annuler », « Rétablir », « Effacer » (`.travaux-palette-btn-pied`). Bouton tampons : texte « Tampons ». CSS `.travaux-btn-outil` adapté (11px, padding texte, min-height 28px).

99. **Panneau gauche style palette** : `#travaux-eval-gauche` reçoit un `.travaux-panneau-header` (titre « Paramètres », 0.7rem uppercase) et `.travaux-panneau-corps` wrappant le contenu. CSS `.travaux-slot-panneau` harmonisé avec le design prep-palette (300px, rgba borders, surface-carte background). Styles compacts pour les formulaires internes.

100. **Panneau droit critères uniquement** : `#travaux-eval-droite` ne contient plus que `.travaux-panneau-header` (« Critères ») et `#listeCriteresGrille1`. La zone de rétroaction est extraite dans un élément séparé.

101. **Rétroaction sous le canvas** : Nouvel élément `#travaux-eval-retroaction` contenant textarea, checkboxes et bouton copier. Slot `#travaux-slot-retroaction` ajouté sous le canvas dans `afficherVisionneuse()`. `evaluerDepuisAnnotation()` déplace la rétroaction dans ce slot. CSS `.travaux-slot-retroaction` (border-top, max-height 250px, textarea compact).

102. **Page d'accueil réorganisée** : Trois sections en accordéons dans `afficherAccueilRetour()` (accueil.js) : « Découvrir » (toggles démo/tour/tooltips/aide), « Parcourir » (8 cartes d'action, ouvert par défaut), « Piloter » (panneau parcours, ouvert par défaut). Emoji pin retiré de l'aide contextuelle.

### Travail accompli — Refonte visionneuse : palette flottante + évaluation 3 colonnes (Beta 97.9, build 0220-2000)

93. **Palette flottante d'annotation** : `genererHTMLPalette()` (travaux-outils.js) génère désormais une palette flottante (`.travaux-palette-flottante`) avec barre de titre draggable, bouton replier/déplier, sections verticales (outils, formes, tampons, couleurs, épaisseur) et pied de palette (Annuler/Rétablir/Effacer). `configurerDragPalette()` et `togglePaletteReplie()` ajoutées au module. `activerAnnotation()` (travaux-annotation.js) insère la palette dans `#travaux-canvas-container` (position absolute). `desactiverAnnotation()` la retire du DOM. L'ancien `#travaux-palette-container` et le div `#travaux-undo-redo` séparé sont supprimés.

94. **Évaluation en 3 colonnes** : `evaluerDepuisAnnotation()` (travaux-ui.js) déplace les panneaux `#travaux-eval-gauche` (paramètres) et `#travaux-eval-droite` (critères) dans des slots latéraux (`#travaux-slot-gauche`, `#travaux-slot-droite`) flanquant le canvas. Classe `.mode-evaluation` sur le layout. Le canvas se comprime entre les panneaux (flex). Quand on quitte, les panneaux retournent dans leur conteneur d'origine. HTML index.html restructuré : la `grille-evaluation-principale` est remplacée par deux panneaux identifiés indépendants.

95. **Exclusivité annotation/évaluation** : Activer l'annotation ferme le mode évaluation (et vice-versa). `activerAnnotation()` vérifie `.mode-evaluation` et appelle `evaluerDepuisAnnotation()` pour toggle off. `evaluerDepuisAnnotation()` appelle `desactiverAnnotation()` si l'annotation est active.

96. **Améliorations toolbar visionneuse** : Badge étudiant actif (`#travaux-badge-fichier-actif`) dans l'entête. Bouton Zoom 100% (`zoom100()` dans travaux-visionneuse.js). Ordre des boutons : Annoter → Évaluer → Exporter PDF. Badge sélectionné avec `--accent-primaire` (box-shadow bleu vif).

## SESSION DU 19 FÉVRIER 2026

### Travail accompli — Module Travaux : pipeline fonctionnel (Beta 97.8, build 0219-1515)

89. **Autocollants fiabilisés** : `prechargerAutocollants()` (travaux-outils.js) crée désormais les images avec `onload`/`onerror` et stocke une Promise par image. `dessinerAutocollant()` (travaux-annotation.js) attache un listener one-shot si l'image n'est pas encore chargée. `dessinerAnnotationsSurCtx()` (travaux-export-pdf.js) est devenue `async` et attend le chargement complet des autocollants avant le dessin.

90. **Modale texte multiligne** : `ajouterTexte()` (travaux-annotation.js) remplace `prompt()` par une modale HTML (textarea multiligne, slider taille 10-32px, boutons Annuler/Ajouter, fermeture Escape/clic arrière-plan). `dessinerTexte()` et le rendu export PDF gèrent le multiligne (split `\n`, interligne 1.3×). La bounding box texte est corrigée pour le multiligne.

91. **Vue côte-à-côte corrigée** : `ouvrirVueCoteACote()` (travaux-ui.js) masque la visionneuse standard avant de créer les canvas split-view, évitant les conflits d'IDs `getElementById`. CSS `.travaux-split-panel` : `min-width` passée de 0 à 300px.

92. **Flux Annotation → Évaluation robuste** : `evaluerDepuisAnnotation()` (travaux-ui.js) remplace les `setTimeout` en cascade par `preRemplirEvaluation()` — boucle de retry (max 10 essais, 150ms intervalle) qui attend que l'option production existe dans le select avant de la sélectionner.

## SESSION DU 18 FÉVRIER 2026

### Travail accompli — Nettoyage données orphelines (Beta 97.8, build 0218-0550)

88. **Nettoyage groupe-cours fantôme** : Un groupe-cours `GC_1771159365742` et un cours `COURS1771159365741` orphelins (créés accidentellement le ~16 février, code vide, titre vide) polluaient le dropdown du sélecteur de groupe-cours actif. Cause : données persistantes dans IndexedDB malgré nettoyage localStorage. Fix : suppression via `db.setSync`/`db.set` des deux stockages (localStorage + IndexedDB).

## SESSION DU 17 FÉVRIER 2026

### Travail accompli — Fix carte démo en mode démo (Beta 97.8, build 0217-1837)

87. **Fix carte démo invisible** : La carte démo n'apparaissait pas en mode démonstration. Cause : `planification_mindmap` n'était pas dans `CLES_NAMESPACEES` de `trimestres.js`, donc `cle('planification_mindmap')` retournait la clé sans préfixe au lieu de `demo_planification_mindmap`. Fix : ajout de la clé dans la liste namespacée.

### Travail accompli — Carte démo et licence CC (Beta 97.8, build 0217-1505)

85. **Carte démo mise à jour** : La carte démo hardcodée « Écriture et littérature (démo) » est remplacée par l'export réel de la carte reconstruite manuellement (16 nœuds, 14 liens, IDs `planif-` corrects, positions exactes). Compteurs alignés sur l'export (compteur: 26, compteurLiens: 45).

86. **Métadonnées CC BY-NC-SA 4.0** : Ajout du champ `metadata_cc` à la carte démo suivant le patron de `cc-license.js` (licence, auteur, dates, type `alignement_pedagogique`, version 2.0).

### Travail accompli — Plan de la leçon et mode clair (Beta 97.8, build 0217-1445)

81. **Menu Actions déroulant** : Les boutons émojis (➕❌📋⬆️⬇️↩️) de la carte mentale sont remplacés par un menu déroulant « Actions ▾ » contenant : Nouvelle carte, Dupliquer cette carte, Importer un alignement, Supprimer cette carte. Le bouton Annuler reste visible dans la toolbar. Le bouton Exporter est retiré (déplacé dans Plan de la leçon).

82. **Mode clair — Carte mentale** : Surcharges CSS pour les nœuds (bordures), liens SVG (trait gris), labels de liens (fond blanc), titre de carte, sélecteur, dropdown Actions, boutons zoom, palette, items calendrier.

83. **Mode clair — Plan de la leçon** : Surcharges CSS pour l'organisateur complet : conteneur, sélecteurs, sections, objectif, prérequis, activités, badges séances, panneau calendrier, avertissements, étapes EE, zone de dépôt, mini-activités, notes, checkbox.

84. **Fix layout carte mentale** : Correction du désordre d'affichage après bascule Plan de la leçon → Alignement pédagogique. Cause : `initialiserModuleOrganisateur()` appelait `changerCarte()` systématiquement, déclenchant `reconstruireDOM()` pendant que la sous-section carte avait `display:none` (offsetWidth/offsetHeight = 0). Fix : ne changer que si la carte sélectionnée diffère de l'active.

### Travail accompli — Refonte interface carte mentale (Beta 97.8, build 0217-0900)

68. **Fix #68 multi-cours** : Correction "Pas de cours pour ce groupe" en multi-cours + export `mettreAJourBoutonsNavigation`. Fallback via `obtenirSeancesHoraire()` pour les jours 'jour-ouvrable'.

69. **Fix séance/semaine** : Affichage info séance/semaine corrigé en multi-cours. Synchronisation `horaireHebdo` depuis toutes les entités horaire dans `genererCalendrierComplet()`.

70. **Toolbar unifiée** : Barre d'outils unique — sélecteur + boutons (gauche), titre centré auto-dimensionné (centre), zoom + recentrer (droite). Footer supprimé.

71. **Plein écran** : Padding parent `.contenu` retiré via `:has()`, wrapper `height: 100vh`. Surface de travail maximisée.

72. **Palette Raccourcis** : Nouveau panneau flottant 🛎️ avec raccourcis clavier, draggable, −/+/×. Positionné en haut à droite.

73. **Panneau Inspecteur** : Panneau de propriétés renommé "Inspecteur" avec en-tête dédiée. Accessible via bouton 🔎 dans la palette ou double-clic sur un noeud.

74. **Guide repliant** : Boutons −/+ pour replier/déplier le contenu. Police uniformisée à 10.5px. Classe `.planif-guide-conclusion` pour le mot de la fin. Positionné à gauche près de la palette.

75. **Titres uniformisés** : Tous les panneaux (INSPECTEUR, GUIDE, RACCOURCIS, ÉLÉMENTS) partagent la classe `.planif-palette-titre` — majuscules, 11px, 700.

76. **Emojis export/import** : ⬆️ = Exporter, ⬇️ = Importer (inversés pour cohérence conceptuelle).

77. **Panneaux premier plan** : Clic sur un panneau flottant l'amène au premier plan (z-index incrémental).

78. **Description Beta 97.8** : Document marketing mis à jour avec alignement pédagogique, systèmes d'assistance, module annotation.

79. **Guide badges corrigé** : Page 1 — système couleurs (vert/gris/orange) remplacé par symboles réels (✓/!/⚠). Pages 2, 6 — « panneau de droite » → « Inspecteur ». Page 3 — « passe au vert » → « affiche ✓ ». Page 7 — conclusion mise à jour.

80. **Carte mentale démo** : Carte « Écriture et littérature (démo) » hardcodée dans `donnees-demo.js`. 14 nœuds (compétence, 3 IM, séquence, 2 leçons, 4 connaissances, 2 activités, évaluation) + 14 liens formant un alignement pédagogique complet. Injectée au chargement démo, nettoyée à la sortie.

## SESSION DU 16 FÉVRIER 2026

### Travail accompli — Cohérence visuelle et normalisation (Beta 97.8, build 0216-0950)

63. **Audit modes clair/sombre (#172)** : ~50 variables CSS ajoutées dans `:root` et `body.mode-clair`, ~60 couleurs hardcodées remplacées par `var(--...)` dans styles.css, index.html et 7 fichiers JS. Phases : cartes info pédagogiques, badges pattern, jetons profil, calendrier, utilitaires texte/gris, inline styles HTML, couleurs JS.

64. **Guide détaché (#167)** : Le guide d'utilisation de la carte mentale est détaché en panneau flottant indépendant, accessible via le bouton 📔.

65. **Normalisation emojis (#168-#171)** : 📔 guidage, 📚 bibliothèques, 🔒/🔓 verrouillage, 🥋 assistants de création — normalisés dans toute l'application.

66. **Accents Archivage (#173)** : Caractères accentués manquants corrigés dans la page Archivage de Construction de la note.

67. **Élimination couleurs hardcodées (#166)** : 6 phases antérieures : badge-compteur/controle-form, alertes inline, variables IDME/planification, hex hardcodés CSS, couleurs JS, mise à jour design-system.html.

## SESSION DU 15 FÉVRIER 2026

### Travail accompli — Cohérence iconographique et organisation accueil (Beta 97.7, build 0215-1230)

56. **Parcours repliable** : Le panneau « Ton parcours » est désormais un accordéon repliable (`.carte.accordeon` + `toggleAccordeonV2`) comme « Découvrir ». Ouvert par défaut.

57. **Tutoiement unifié** : Les 8 cartes d'action de la page d'accueil sont reformulées au « tu » pour s'aligner avec le ton du parcours d'apprentissage.

58. **Boutons d'aide contextuelle 📍** : Toutes les icônes 🧭 utilisées pour l'aide contextuelle (boutons `.btn-aide-contextuelle` et `.primo-aide`) sont remplacées par 📍 dans 9 fichiers (44 occurrences). 🧭 reste réservé au mode découverte.

59. **Bouton changement de mode** : Nouveau bouton `.parcours-btn-mode` dans l'en-tête du parcours pour basculer entre mode explicite (🗺️) et découverte (🧭) sans passer par les réglages.

60. **Assistant intégré au parcours** : Le chapitre « Construire » du parcours affiche un bouton « 🛠️ Lancer l'assistant de création » quand il n'est pas complété. La carte « Créer du matériel » est retirée de l'accordéon Découvrir (4 → 3 toggles).

61. **Barre utilitaire compacte** : « 💾 Sauvegarder » et « ✉️ Nouvelles » sont déplacés des cartes principales vers une barre compacte `.accueil-utilitaires` sous les 8 cartes pédagogiques. Grille réduite de 10 à 8 colonnes.

62. **Séparation tour guidé 🔦** : L'icône du tour guidé est séparée du mode découverte (🧭). Le tour guidé utilise désormais 🔦 (18 occurrences dans 6 fichiers : accueil.js, modal-bienvenue.js, parcours-apprentissage.js, primo-modal.js, primo-accueil.js, index.html). Système d'icônes finalisé : 🗺️ explicite, 🧭 découverte, 🔦 tour guidé, 📍 aide contextuelle, 💬 info-bulles, 📌 conseils pédagogiques, 🎓 autonome.

### Travail accompli — Point d'entrée visible du parcours sur l'accueil (Beta 97.7, build 0215-0941)

52. **Panneau CTA sur l'accueil** : Nouvelle fonction `genererPanneauCTA()` dans parcours-apprentissage.js. Quand le parcours n'est pas initialisé (`mode === null`), un panneau à bordure dashed affiche « Commence ton parcours » avec deux boutons `.btn-bienvenue` (🗺️ Étape par étape → `setMode('explicite')` / 🧭 Par exploration → `setMode('decouverte')`). Pied de panneau : « Tu pourras changer d'avis dans Réglages → Préférences ».

53. **Parcours toujours visible** : `genererPanneauParcours()` retourne désormais le CTA au lieu d'une chaîne vide quand le mode est null. Dans accueil.js, le guard `estInitialise()` est retiré : `genererPanneauParcours()` est toujours appelé.

54. **Hero adaptatif** : Le titre de l'accueil s'adapte à l'état du parcours : « Bienvenue ! Par où commencer ? » (non initialisé) vs « Que souhaitez-vous faire ? » (initialisé).

55. **CSS variante CTA** : Styles `.parcours-panneau--cta`, `.parcours-cta-header`, `.parcours-cta-desc`, `.parcours-cta-actions`, `.parcours-cta-footer` avec responsive 600px. Le CTA hérite du masquage `@media print` existant.

## SESSION DU 14 FÉVRIER 2026

### Travail accompli — Section Découvrir et points d'entrée assistant (Beta 97.8, build 0214-2001)

49. **Section « Découvrir » sur l'accueil** : Les toggles d'onboarding (données démo, tour guidé, info-bulles) sont regroupés dans une section accordéon repliable avec 4 cartes visuelles. La 4e carte « Créer du matériel pédagogique » lance directement l'assistant conversationnel sans passer par le tour guidé.

50. **Bannière dans Construction > Aperçu** : Point d'entrée secondaire vers l'assistant de création de matériel avec bouton « Lancer l'assistant », placé après la carte « Ressources configurées ».

51. **Backlog mis à jour** : Ajout des tâches #161 (banque de verbes cognitifs Anderson), #162 (guide intégré carte mentale) et #163 (vérification accompagnement création matériel).

### Travail accompli — Assistant actif de création de matériel pédagogique (Beta 97.8, build 0214-1736)

45. **Retrait persona Primo** : Le personnage de Primo est retiré du tour guidé. Textes reformulés en vouvoiement impersonnel. Emoji 🧭 conservé. Commentaires et console.log nettoyés dans primo-accueil.js, primo-modal.js, primo-questions.js.

46. **Module 5 « Créer du matériel »** : Nouvelle carte dans le tour guidé. 21 nouvelles questions (materiel-intro → materiel-recapitulatif) remplacent les 11 anciennes étapes passives. Parcours adaptatif selon la pratique détectée (sommative, PAN-Standards, PAN-Spécifications).

47. **Création programmatique** : 5 nouvelles fonctions dans primo-modal.js — detecterContexteMateriel(), creerEchelleDepuisParcours() (IDME/ABCD/perso), creerGrilleDepuisParcours() (base/perso), creerProductionDepuisParcours() (titre/type/poids), creerCartoucheDepuisParcours() (matrice critère×niveau vide). Vérification post-création dans IndexedDB.

48. **Module 2 simplifié** : demarrerEvaluation() navigue directement vers la section Évaluations au lieu de lancer le mode notification supprimé.

### Travail accompli — Taxonomie d'Anderson dans la carte mentale (Beta 97.8, build 0214-1015)

39. **Types de connaissances (Anderson)** : Remplacement des 3 anciens types (Information, Stratégie, Condition) par les 4 types d'Anderson & Krathwohl (2001) : Factuelle (#fb923c), Conceptuelle (#f97316), Procédurale (#ea580c), Métacognitive (#d97706). Palette, TYPES, VERBES_AUTO, badges, conteneurs, CSS et tooltips mis à jour.

40. **Migration automatique** : Les cartes existantes sont migrées silencieusement au chargement (connaissance→factuelle, strategie→procedurale, condition→procedurale). Migration aussi dans restaurerSnapshot() et importerCarte(). Liens et badges préservés.

41. **Banque de verbes cognitifs** : 6 niveaux (Mémoriser→Créer) avec 10 verbes chacun. Constantes NIVEAUX_COGNITIFS et BANQUE_VERBES ajoutées. Sélecteur dans le panneau de propriétés pour les types : compétence, idée maîtresse, activité, soutien, révision, évaluation.

42. **Verbes cliquables** : Étiquettes cliquables sous le sélecteur. Un clic insère le verbe au début du titre du nœud (avec majuscule). Description du niveau affichée en aide contextuelle grisée.

43. **Badge cognitif sur le canevas** : Indicateur discret (.planif-badge-cognitif) dans le coin inférieur droit du nœud. Rendu au chargement et mis à jour via mettreAJourApparenceNoeud().

44. **Organisateur mis à jour** : Le filtre de type dans organisateur.js reconnaît les 4 nouveaux types de connaissances.

### Travail accompli — Simplification page d'accueil (Beta 97.7, build 0214-0940)

36. **Réorganisation des cartes d'accueil** : Nouvel ordre → Planifier → Configurer pratique → Présences → Annoter → Évaluer → Profil → État des lieux → Interventions → Sauvegarde → Nouvelles. La carte « Configurer ma pratique de notation » monte en 2e position.

37. **Textes simplifiés** :
    - « Configurer une pratique » → « Configurer ma pratique de notation » + description simplifiée
    - « Préparer des interventions » → description sans « (niveaux 1, 2, 3) »
    - « Suivre le développement du projet » → « Dernières nouvelles »

38. **Entête corrigée** : Beta 97.6 → 97.7 dans le bandeau et le titre de page

### Travail accompli — Améliorations UX du wizard (Beta 97.7, build 0214-0932)

31. **Grille démo** : Quand aucune grille de critères n'existe, le wizard propose un bouton « Créer une grille de base (4 critères) » qui génère une grille générique (Compréhension, Démarche, Communication, Esprit critique à 25% chacun). Auto-sélectionnée après création. Modifiable dans Matériel → Critères.

32. **Annonce du type diagnostiqué au récapitulatif** : Le récapitulatif commence par un encadré proéminent avec badge coloré (SOM bleu / PAN orange / SPE vert), le nom du type, et une explication pédagogique vulgarisant la méthode. Variante et règles aussi affichées.

33. **Champ nom modifiable au récapitulatif** : Sous le diagnostic, un champ texte éditable pré-rempli avec le nom saisi à l'étape 1. Le placeholder suggère un format contextualisé. `creerPratiqueV2()` lit ce champ avant de sauvegarder.

34. **Carte d'accueil renommée** : « Construire la note » → « Configurer une pratique de notation » avec description actualisée.

35. **Placeholder simplifié** : « Ex: PAN-Standards Littérature H2026 » → « Ex: Ma pratique de notation » (moins intimidant pour les novices).

### Travail accompli — Refonte du wizard de configuration (Beta 97.7, build 0214-0909)

28. **Classification comportementale** : Remplacement de l'étape `type-pratique` (qui demandait aux enseignants de se classer dans une taxonomie académique) par des questions concrètes sur le comportement de notation.
    - **Q1** : « Comment calculez-vous la note finale ? » → moyenne / niveaux / acceptable / pas certain
    - **Q2** : « Utilisez-vous des règles spéciales ? » (multi-select) → remplacement / verrou / portfolio / plafonnement / aucune
    - **Q3** : « Comment structurez-vous vos évaluations ? » → par artefacts / par objectifs
    - **Q4** : « Combien d'évaluations prévoyez-vous ? » → nombre
    - **Q5** : « Quels sont vos seuils personnels ? » → 3 seuils en %
    - **`deduireTypePratique()`** : Fonction d'inférence qui retourne `{ type, variante, regles, confiance }` — score 12/12 enseignants
    - **Nouveau type de champ** : `checkbox-cards` (multi-sélection avec exclusion mutuelle pour "aucune")

29. **Méthodes de calcul manquantes** (pratique-configurable.js) :
    - **`calculerParSpecifications()`** : Vérifie les spécifications satisfaites, retourne la note du forfait le plus élevé (ref: François)
    - **`appliquerDoubleVerrou()`** : Plafonne la note finale si l'évaluation verrouillée est sous le seuil (ref: Marie-Hélène)
    - **`calculerParRemplacementProgression()`** : Pour chaque paire, utilise `max(initiale, finale)` avec pondérations (ref: Jordan)

30. **Enrichissement de la capture** (Phase 2) :
    - **`config-sommative-regles`** : Étape conditionnelle pour configurer remplacement/verrou/portfolio/plafonnement
    - **`config-objectifs-definition`** : Capture du nombre d'objectifs d'apprentissage
    - **`config-reprises`** : Toggle reprises + mode (illimité/limité/non) + nb max
    - **CSS** : Styles pour checkbox-cards, dynamic-list, weight-slider, replacement-pair
    - **`construireConfigComplete()`** : Extension pour les nouveaux champs (variante, reglesSpeciales, objectifs, seuils)

### Fichiers modifiés (14 février - Beta 97.7)
- `js/wizard-pratique-v2.js` — Classification comportementale Q1-Q5, deduireTypePratique(), grille démo, récapitulatif refondu, nom modifiable
- `js/pratiques/pratique-configurable.js` — 3 méthodes de calcul implémentées (+190 lignes)
- `js/pratiques/pratique-registre.js` — Extension construireConfigComplete() pour nouveaux champs (+5 lignes)
- `styles.css` — CSS checkbox-cards, dynamic-list, weight-slider, replacement-pair (+150 lignes)
- `js/accueil.js` — Réorganisation cartes, textes simplifiés, nouvel ordre
- `js/changelog-data.js` — Entrées changelog wizard + accueil
- `index.html` — Entête Beta 97.7, titre page, BUILD_ID 0214-0940
- `version.json` — Build 0214-0940
- `index.html` — VERSION_MAJEURE 97.7, BUILD_ID 0214-0932
- `version.json` — Build 0214-0932, Beta 97.7

### Matrice de validation (12 cartographies)
| # | Enseignant | Q1 | Type déduit | Variante | OK |
|---|-----------|-----|-------------|----------|-----|
| 1 | Jordan R. | moyenne | sommative | progressive | OK |
| 2 | Bruno V. | niveaux | pan-standards | n-meilleurs | OK |
| 3 | Michel B. | niveaux | pan-standards | moyenne-ponderee | OK |
| 4 | Étienne L. | moyenne | sommative | classique | OK |
| 5 | Olivier L. | moyenne | sommative | classique | OK |
| 6 | Marie-Hélène L. | moyenne | sommative | verrou | OK |
| 7 | François A.-H. | acceptable | pan-specifications | bundles | OK |
| 8 | Hélène C. | moyenne | sommative | portfolio | OK |
| 9 | Annie Bourgoin | moyenne | sommative | portfolio | OK |
| 10 | Xavier C.-T. | niveaux | pan-standards | seuils-critiques | OK |
| 11 | Élise Desgreniers | niveaux | pan-standards | comptage | OK |
| 12 | Grégoire Bédard | niveaux | pan-standards | n-meilleurs | OK |

---

## SESSION DU 13 FÉVRIER 2026

### Travail accompli — Sécurisation des données personnelles (Beta 97.6)

26. **Sécurisation des données personnelles** : Audit et corrections systémiques pour protéger les données d'étudiants.
    - **Anti-XSS** : `echapperHtml()` appliqué systématiquement dans import-export.js, grilles.js, entites-ui.js
    - **Validation imports** : Fonctions `assainirChaine()` et `assainirObjet()` avec schémas whitelist (grille, échelle, pratique, production). Limite 10 Mo par fichier JSON importé.
    - **Exports sécurisés** : Avertissement données personnelles + préfixe CONFIDENTIEL dans le nom de fichier. Noms d'étudiants retirés des snapshots exportés (DA conservé).
    - **Isolation groupes** : `cleSnapshots()` retourne null sans cours actif. Fallbacks vers `[]` au lieu de `obtenirDonneesSelonMode('groupeEtudiants')` dans snapshots.js.
    - **Nettoyage démo** : Suppression de `demo_snapshots_GC_DEMO` + balayage générique de toutes les clés `demo_*` via `db.keys()`.

27. **Corrections bugs Élise** (#64, #65, #66, #67) :
    - **Bug #64** : `afficherNotificationSucces` / `afficherNotificationErreur` non accessibles depuis trimestre-v2.js → wrappers locaux + exports vers window dans evaluation.js et groupe.js
    - **Bug #65** : `e.target.closest is not a function` dans tooltips.js → guard typeof avant appel
    - **Bug #66** : 0 étudiants affichés malgré 24 dans la DB — étudiants importés sans champ `groupe` filtrés silencieusement par `normaliserGroupe(undefined)="00000" ≠ "00001"`. Correction : inclusion des étudiants sans groupe dans `obtenirDonneesSelonMode()` et `obtenirEtudiantsCoursActif()` (modes.js)
    - **Bug #67** : Rapport de bug affichait "Cours actif: undefined (A2025)" — `rapport-bug.js` cherchait dans `listeCours` au lieu de lire `infoCours` (source de vérité)

### Fichiers modifiés (13 février - Beta 97.6)
- `js/import-export.js` — Échappement HTML, fonctions assainissement, schémas validation, limite taille, barrière exports
- `js/grilles.js` — Échappement HTML dans option grille
- `js/entites-ui.js` — Échappement HTML dans options groupe-cours et enseignant
- `js/snapshots.js` — Isolation groupe (fallback []), cleSnapshots null-safe
- `js/donnees-demo.js` — Nettoyage demo_snapshots_GC_DEMO + balayage générique demo_*
- `js/changelog-data.js` — Entrée changelog sécurisation
- `index.html` — VERSION_MAJEURE 97.6, BUILD_ID 0213-1351
- `js/trimestre-v2.js` — Wrappers locaux afficherNotificationSucces/Erreur
- `js/evaluation.js` — Export window.afficherNotificationSucces
- `js/groupe.js` — Export window.afficherNotificationErreur
- `js/tooltips.js` — Guard typeof sur e.target.closest
- `js/modes.js` — Inclusion étudiants sans champ groupe (bug #66)
- `js/rapport-bug.js` — Lecture infoCours au lieu de listeCours (bug #67)
- `Retours des testeurs/SUIVI-BUGS.md` — Bugs #64, #65, #66, #67 documentés
- `version.json` — Build 0213-1530, Beta 97.6

---

### Travail accompli — Suivi d'étudiants au tableau de bord

25. **Suivi d'étudiants** : Nouveau panneau dans la section Observer du tableau de bord.
    - Bouton « Suivi » + panneau collapsible avec liste des étudiants du groupe actif
    - Jusqu'à 5 étudiants trackés simultanément, chacun avec couleur distincte (palette Océan)
    - Points blancs deviennent des billes 3D colorées dans toutes les barres (A, C, P, E, Patterns, RàI)
    - Clic sur un point → surligne la badge correspondante dans le panneau
    - Nettoyage automatique des entrées obsolètes lors du changement de groupe
    - Compatible mode anonymisation et mode archive
    - Badges semi-transparentes avec backdrop-filter, style design system Océan
    - Stockage : `db.setSync('etudiantsSuivis', [...])` (préférence UI, non namespacée)

### Fichiers modifiés (13 février)
- `styles.css` — Classes .tracked-0 à .tracked-4 (billes 3D), panneau suivi, badges, surlignage
- `index.html` — Bouton Suivi + panneau collapsible dans carte Observer, notes de version, BUILD_ID
- `js/tableau-bord-apercu.js` — Logique complète : stockage, couleurs, nettoyage, UI panneau, événements délégués
- `js/changelog-data.js` — Entrée changelog suivi d'étudiants
- `version.json` — Build 0213-1101

---

## SESSION DU 12 FÉVRIER 2026

### Travail accompli — Tour guide & accueil enrichi

22. **Primo → Tour guide** : Remplacement de l'emoji 😎 par 🧭 et suppression des références au personnage "Primo" dans tous les textes utilisateur.
    - `index.html` : 46 emojis remplacés, textes d'aide/glossaire mis à jour
    - `js/primo-accueil.js` : Textes d'accueil modernisés ("Bienvenue dans le tour guidé")
    - `js/primo-modal.js` : Avatar et texte de confirmation mis à jour
    - `js/primo-tooltips.js` : Popup "Conseil de Primo" → "Conseil"
    - `js/primo-validation-champs.js` : Tooltips "Complété par Primo" → "Complété automatiquement"
    - `js/primo-questions.js` : Message d'accueil vouvoiement
    - 8 fichiers JS additionnels (aide-contextuelle, modal-bienvenue, profil-etudiant, etudiants, bibliotheque-ui, pratiques-materiel, changelog-data, aide-contextuelle-contenu)
    - Console logs `[Primo]` → `[Guide]` dans tous les fichiers primo-*.js

23. **Activation Tour guide** : Checkbox fonctionnelle sur la page d'accueil.
    - `js/accueil.js` : Checkbox déverrouillée, lecture de `preferencesAffichage.tourGuide`
    - `js/modes.js` : `estModeAssiste()` lit la préférence au lieu de retourner `false`
    - `js/modes.js` : Nouvelle fonction `definirTourGuide()` (sauvegarde, sync checkboxes, toggle classe CSS, événement)
    - `js/modes.js` : Initialisation au démarrage (`document.body.classList.add('mode-assiste')` si actif)

24. **Accueil élargi (10 cartes)** : Deux nouvelles cartes d'action.
    - 🎯 Construire la note → ouvre directement le wizard de création de pratique
    - 🛟 Préparer des interventions → navigue vers Tableau de bord > Interventions RàI
    - Grille passée de 4 à 5 colonnes (`accueil-cartes--10`)
    - Conteneur élargi de 800px à 1200px
    - Descriptions réduites (0.75rem) pour décompacter les colonnes

### Fichiers modifiés
- `index.html` — Emojis, textes, glossaire, CSS grille 5 colonnes, notes de version, BUILD_ID
- `js/accueil.js` — 10 cartes, checkbox tour guide, grille --10
- `js/modes.js` — estModeAssiste(), definirTourGuide(), init mode-assiste
- `js/primo-accueil.js` — Textes et console logs
- `js/primo-modal.js` — Avatar, texte, console logs
- `js/primo-tooltips.js` — Popup titre, console logs
- `js/primo-validation-champs.js` — Tooltips, console logs
- `js/primo-questions.js` — Message accueil, console logs
- `js/changelog-data.js` — Entrée Beta 97.5
- `js/aide-contextuelle.js` — Emoji titre modal
- `js/modal-bienvenue.js` — Emoji et textes Primo
- `js/aide-contextuelle-contenu.js` — Texte bouton
- `js/profil-etudiant.js` — Emojis spans et commentaires
- `js/etudiants.js` — Emoji et commentaire
- `js/bibliotheque-ui.js` — Emoji bouton
- `js/pratiques-materiel.js` — Emoji bouton

## SESSION DU 11 FÉVRIER 2026

### Travail accompli — Corrections et améliorations

17. **Notification toast** : Bandeau de mise à jour remplacé par une notification compacte en haut à droite (slide-in, X pour fermer).
18. **Double tooltip Aide** : Retiré l'attribut `title` obsolète du bouton Aide (le tooltip custom du parent suffisait).
19. **Bouton Confidentiel** : Modal corrigé — utilise `.classList.add('actif')` / `.remove('actif')` au lieu de `u-hide` (compatible avec `.modal-overlay` CSS).
    - `js/profil-etudiant.js` : `ouvrirModalConfidentiel()` et `fermerModalConfidentiel()` corrigés
    - `index.html` : Retiré `style="display: none;"` et `u-hide` du modal
20. **Type d'intervention MIO** : Nouveau type «Message écrit (MIO) à un groupe ciblé» ajouté aux interventions.
    - `js/interventions.js` : Ajouté aux 3 dropdowns, badge "MIO", garde dans `transfererPresencesVersModule()` pour ne pas affecter les présences
    - `js/profil-etudiant.js` : Icône ✉️ pour le type MIO
21. **Verrouillage des présences** : Contrôle refait et intégré dans la barre de statistiques (Présents/Absents/Total).
    - `js/saisie-presences.js` : Nouvelles fonctions `basculerVerrouillageDateActive()` et `mettreAJourControleVerrouillage()`, checkbox injecté par `restaurerCompteurPresences()`
    - Ancien mécanisme `enteteDateSeance` remplacé par une approche autonome sans dépendance à `obtenirInfosJourCalendrier`

### Travail accompli — Onglet Dépistage (Réglages)

16. **Nouvel onglet Dépistage** : Extraction des 2 cartes dépistage (Configuration du dépistage + Seuils d'interprétation) depuis Préférences vers un onglet dédié dans Réglages.
    - `js/config.js` : Ajout entrée `{ id: 'depistage', label: 'Dépistage' }` dans le tableau `reglages`
    - `js/navigation.js` : Ajout case `reglages-depistage` qui réutilise `initialiserPreferencesV2()`
    - `index.html` : HTML déplacé vers `<div id="reglages-depistage" class="sous-section">`, description Préférences mise à jour
    - L'onglet Préférences ne contient plus que : Outils, Affichage, Expérience visuelle, Navigation

## SESSION DU 10 FÉVRIER 2026

### Travail accompli — Tooltips au survol

12. **Nouveau systeme de tooltips** : Moteur leger avec delegation d'evenements (`mouseenter`/`mouseleave`), positionnement automatique (bas/haut/droite/gauche), animation CSS.
    - `css/tooltips.css` : Styles integres au theme via variables CSS (`--bleu-fonce`, `--shadow-fort`, `--radius-moyen`)
    - `js/tooltips-contenu.js` : 31 cles de contenu regroupees par zone (en-tete + reglages)
    - `js/tooltips.js` : Moteur de positionnement et cycle de vie
13. **En-tete (10 tooltips)** : Logo, version, mode affichage, signaler bug, pratique, semaine, groupe-cours, nav principale, sous-nav, reglages
14. **Reglages Trimestre (21 tooltips)** : 6 panneaux accordeon + 12 champs specifiques + 3 boutons bibliotheque
15. **Tooltips dynamiques** : `entete-pratique` et `entete-semaine` marques dans le HTML genere par `contexte.js`

### Fichiers crees
- `css/tooltips.css`
- `js/tooltips.js`
- `js/tooltips-contenu.js`

### Fichiers modifies (tooltips)
- `index.html` — 29 attributs `data-tooltip` + chargement des 3 fichiers
- `js/contexte.js` — 2 attributs `data-tooltip` sur contenu dynamique

### Travail accompli — Bibliothèques

1. **Suppression deux stores** : `supprimerXDefinitivement()` appelle maintenant `retirerXDeLaBibliotheque()` dans les 4 modules (grilles, échelles, productions, cartouches)
2. **Bouton Supprimer en Section 2** : Ajout d'un bouton "Supprimer" dans la section "Disponibles à ajouter" des 4 bibliothèques + fonctions `supprimerXDeBibliothequePartagee()`
3. **Boutons "Ajouter à la bibliothèque"** : Grilles et échelles ont maintenant un bouton `ajouterMesXALaBibliotheque()` comme productions
4. **Audit complet** : Analyse des 4 modales → 14 tâches ajoutées au BACKLOG (#144-#157) couvrant bugs fonctionnels, uniformisation visuelle et refactoring architectural

### Travail accompli — Indicateurs de développement

5. **Nouveau module `badges-dev.js`** : MutationObserver non-intrusif qui appose 🚧 pulsant sur les onglets de sous-navigation en développement actif
6. **Sections marquées** : Construction de la note (5 sous-sections) + Planification (2 sous-sections) + Aide (6 sous-sections)

### Travail accompli — Notification de mise à jour

7. **Polling `version.json`** : Vérifie toutes les 5 minutes si une nouvelle version est déployée (première vérification après 30s)
8. **Bandeau vert discret** : Apparaît en bas de l'écran avec animation slide-up quand le build distant diffère du local. Bouton "Recharger" pour appliquer la mise à jour
9. **Résilience offline** : Échecs réseau silencieux, cache-busting via `?t=timestamp`, détection unique (pas de spam)

---

## SESSION DU 8 FÉVRIER 2026 (soir)

### Travail accompli — Démo et UX

7. **Thème sarcelle en mode démo**
   - `body.mode-demo` redéfinit toutes les variables `--bleu-*` → `--sarcelle-*`
   - Navigation, boutons, fonds, info-boxes basculent automatiquement
   - Retour au bleu normal quand on quitte la démo

8. **Fix patterns d'apprentissage à 0%**
   - Export manquant `window.determinerCibleIntervention` depuis l'IIFE de profil-etudiant.js
   - Export manquant `window.calculerTauxCompletion` depuis etudiants.js
   - Race condition `calculerEtStockerIndicesCP` async→sync (portfolio.js)
   - Crash `I.toFixed(1)` quand `francaisMoyen` est null

9. **Nettoyage démo robuste**
   - `db.removeSync()` + `db.remove()` pour chaque clé demo (deux couches de stockage)
   - `db.setSync()` + `db.set()` pour les données globales filtrées
   - Élimine les résidus après rechargement

10. **Page d'accueil**
    - Carte groupe remplacée par invitation démo (mode normal)
    - Boutons "Explorer la démo | Tableau de bord" retirés du pied de page
    - Lien codexnumeris.org en pied de page
    - Cartes interverties : Sauvegarde avant Suivre le projet
    - Émoji 🔍→🗺️, pastille ✉️ à taille normale + 🔴 petit en exposant

11. **Correctifs visuels démo**
    - "Démonstration 2025" → "Données de démonstration"
    - Section "Cours (tous groupes)" masquée en mode démo
    - Encarts guidage : classe `.info-box--info` hérite du thème sarcelle automatiquement

### Fichiers modifiés (soir)
- `styles.css` — bloc `body.mode-demo` sarcelle, `.pastille-nouveautes` réduite
- `js/donnees-demo.js` — nettoyage dual localStorage+IndexedDB
- `js/accueil.js` — invitation démo, pied de page, interversion cartes
- `js/guidage-demo.js` — commentaire mis à jour
- `js/profil-etudiant.js` — export `determinerCibleIntervention`
- `js/etudiants.js` — export `calculerTauxCompletion`
- `js/portfolio.js` — `calculerEtStockerIndicesCP` sync
- `js/tableau-bord-apercu.js` — contexte démo, try/catch patterns
- `js/trimestre-v2.js` — masquer dropdown "Cours (tous groupes)" en démo
- `js/changelog-data.js` — nouvelle entrée changelog
- `index.html` — BUILD_ID, `mettreAJourPastille` adapté

---

### Travail accompli — Alignement pédagogique

1. **Système de clonage (PLAN-CLONAGE.md)**
   - `cloneSourceId` ajouté au modèle de données (creerNoeud, clonerEtatPersistant, restaurerSnapshot, chargerCarte)
   - `clonerNoeud()` remplace `dupliquerNoeud()` : copie avec identité partagée
   - Propagation titre/description à tous les clones
   - `supprimerNoeud()` : transfert d'original si l'original est supprimé
   - `evaluerBadge()` : agrège les liens de tous les clones
   - Indicateur visuel 🧬 avec surbrillance au survol
   - Bouton « Cloner » dans le panneau d'information

2. **Verbes verticaux refondus (PLAN-VERBES-LIENS.md)**
   - 5 verbes amont→aval : se décline en, se concrétise dans, s'acquiert par, se vérifie par, s'appuie sur
   - `VERBES_AUTO` réécrit avec direction inversée
   - `MIGRATION_VERBES` + `VERBES_COMPAT` pour migration automatique des anciens liens
   - Messages `evaluerBadge()` mis à jour

3. **Verbes horizontaux (PLAN-VERBES-HORIZONTAUX.md)**
   - 2 nouveaux verbes : complète, conduit à
   - `VERBES_HORIZONTAUX` table séparée avec normalisation de types
   - `resoudreVerbe()` retourne `type: 'vertical'` ou `type: 'horizontal'`
   - Popup de choix pour liens horizontaux, attribution automatique pour verticaux
   - `afficherMenuLienExistant()` filtre les verbes pertinents par couple

4. **Évaluations**
   - Nouveau type avec couleur #D946EF (rose/magenta)
   - Insertion dans les conteneurs Leçon (`peutContenir()`)
   - Champs Rétroaction et Production dans le panneau d'information

5. **UX carte mentale**
   - Carte d'aide flottante : draggable, redimensionnable, fermable
   - Bouton « ? » dans la palette (toggle afficher/masquer)
   - Espacement conteneurs augmenté (GAP 12→30px)
   - Menu sélection verbes sur liens existants

6. **Renommage**
   - Onglet « Carte mentale » → « Alignement pédagogique » (config.js)

### Fichiers modifiés
- `js/planification-carte.js` — logique clonage, verbes, évaluations
- `js/config.js` — label sous-nav
- `index.html` — palette, panneau, carte d'aide, changelog, BUILD_ID
- `styles.css` — clone, carte d'aide, évaluation

---

## HISTORIQUE PRÉCÉDENT — BETA 97.3

---

## POUR REPRENDRE

> **Lire ce fichier puis demander : "Ou en sommes-nous ?"**
> La refactorisation est découpée en phases. Chaque phase est documentée ci-dessous.

---

## REFACTORISATION PROGRESSIVE (Beta 97.1)

**Ticket principal** : #76 (595 `.style.display` dans 31 fichiers JS → `classList` + `u-hide`)
**Tickets connexes** : #74 (classes CSS utilitaires pour inline styles)

### Phase 1 — COMPLETEE (6 fév 2026, session 1)

**Objectif** : Poser les fondations + migrer un premier lot de fichiers moyens

**Infrastructure créée** :
1. `window.toggleDisplay(element, show)` — helper global dans `js/main.js`
   - `toggleDisplay(el, true)` → `el.classList.remove('u-hide')`
   - `toggleDisplay(el, false)` → `el.classList.add('u-hide')`
   - Gère `null` silencieusement
2. `.u-hide` renforcé avec `!important` dans `styles.css:340` (garantit priorité sur inline styles)
3. Nouvelles classes CSS utilitaires dans `styles.css` (~ligne 2457) :
   - `.info-box` + `--attention`, `--info`, `--succes`, `--erreur` (remplace inline `background: #fff3cd; border-left: 4px solid...`)
   - `.badge-source` + `--locale`, `--bibliotheque`, `--retiree`, `--id` (remplace inline badges colorés)

**Fichiers JS migrés (Phase 1)** :
- `js/cc-license.js` (30 changements)
- `js/echelles.js` (64 changements)
- `js/entites-ui.js` (46 changements)
- `js/etudiants.js` (24 changements)
- `js/export-pdf.js` (46 changements)
- `js/groupe.js` (18 changements)
- `js/pratique-notation-v2.js` (42 changements)
- `js/pratiques-materiel.js` (56 changements)
- `js/profil-etudiant.js` (22 changements)
- `js/saisie-presences.js` (22 changements)
- `js/donnees-v2.js` (16 changements)

**Nettoyage** :
- Suppression `Archives/Design system - Modules/` (37 fichiers, ~16 000 lignes)
- Suppression `docs/A2024/` (scripts d'import historique)
- Suppression retours testeurs anciens (`bruno/`, `gregoire/`, `jordan/`, `olivier/`)
- Déplacement `DESIGN_SYSTEM.html` et `Design system - Modules/` à la racine

**Non commité** : Tous ces changements sont dans le working tree, pas encore commités.

### Phase 2 — COMPLETEE (6 fév 2026, session 2)

**Objectif** : Migrer TOUS les fichiers JS restants (434 occurrences dans 23 fichiers)

**Résultat** : 434 → 11 (423 occurrences migrées, 11 exceptions légitimes)

| Fichier | Avant | Migrés | Restants | Raison |
|---------|-------|--------|----------|--------|
| `pratiques.js` | 97 | 95 | 2 | `= ''` (nettoyage accordéons) |
| `trimestre-v2.js` | 88 | 83 | 5 | `= ''` (nettoyage inline styles) |
| `evaluation.js` | 51 | 51 | 0 | — |
| `cartouches.js` | 51 | 49 | 2 | Code commenté |
| `productions.js` | 41 | 40 | 1 | `= ''` (reset display) |
| `grilles.js` | 39 | 39 | 0 | — |
| `horaire.js` | 6 | 6 | 0 | — |
| `import-export.js` | 6 | 6 | 0 | — |
| `tableau-bord-apercu.js` | 6 | 6 | 0 | — |
| `travaux-ui.js` | 6 | 6 | 0 | — |
| `travaux-annotation.js` | 6 | 6 | 0 | — |
| `wizard-pratique-v2.js` | 5 | 5 | 0 | — |
| `modes.js` | 5 | 5 | 0 | — |
| `liste-evaluations.js` | 5 | 5 | 0 | — |
| `trimestres.js` | 4 | 4 | 0 | — |
| `trimestre.js` | 4 | 4 | 0 | — |
| `cours.js` | 4 | 4 | 0 | — |
| `rapport-bug.js` | 2 | 2 | 0 | — |
| `primo-modal.js` | 2 | 2 | 0 | — |
| `primo-tooltips.js` | 2 | 2 | 0 | — |
| `objectifs.js` | 2 | 2 | 0 | — |
| `modal-doublon.js` | 1 | 1 | 0 | — |
| `main.js` | 1 | 0 | 1 | Helper toggleDisplay lui-même |

**Fichiers JS migrés (Phase 2)** : 22 fichiers
**Exceptions restantes** : 8 `= ''` (nettoyage), 2 commentés, 1 helper = **aucune utilisation active de `.style.display` pour show/hide**

**Changements HTML associés** :
- `#modalExport` et `#modalImport` (index.html) : `style="display:none"` → `class="u-hide"` + `style="display:flex"`
- `#modalWizardPratiqueV2` (index.html) : Supprimé `style="display:none"` redondant (CSS `.modal-overlay` le gère)

**Patterns de migration utilisés** :
- `.modal-overlay` → `.actif` (pattern CSS existant)
- Éléments génériques → `u-hide` (classe utilitaire avec `!important`)
- Ternaires → `toggleDisplay(element, condition)` (helper global)
- Vérifications → `element.classList.contains('u-hide')`
- Reset inline → `style.display = ''` gardé tel quel

**Règles de migration** :
- `.style.display = 'none'` → `element.classList.add('u-hide')`
- `.style.display = 'block'|'flex'|'inline-block'` → `element.classList.remove('u-hide')`
- `.style.display = condition ? 'X' : 'none'` → `toggleDisplay(element, condition)`
- `.style.display !== 'none'` (test) → `!element.classList.contains('u-hide')`
- `.style.display = ''` → GARDER (nettoyage legacy, pas du show/hide)

### Phase 3 — COMPLETEE (6 fév 2026, session 3)

**Objectif** : Nettoyer et moderniser le Design System pour en faire la reference efficace

**Commits** : `fdf8558` (Phase 2), `1821dfc` (Phase 3)

**Diagnostic initial** (score 2.5/5) :
- 478 lignes de CSS chrome dupliquees dans 17 fichiers HTML
- 20 fichiers parasites (audits, previews, archives) sur 38 au total
- Redefinitions CSS dans `02c-badges-tetris.html` et `03d-modals.html` qui masquent `styles.css`
- Patterns Beta 97.1 absents du Design System (.u-hide, .info-box, .badge-source, toggleDisplay, .modal-overlay.actif)

**4 etapes executees** :

**Etape 1 — Nettoyage du repertoire** :
- Cree `Design system - Modules/_archives/`
- Deplace 17 fichiers parasites :
  - 8 audits (AUDIT_*.md, AUDIT_*.html)
  - 3 previews Liquid Glass
  - 1 doublon (4b - En-tete v3)
  - 1 comparatif, 1 archive monolithique (204KB)
  - 2 docs obsoletes, 2 fichiers caches temporaires
- Resultat : 20 fichiers actifs (17 modules + index + guide-common.css + README)

**Etape 2 — Extraction CSS chrome partage** :
- Cree `Design system - Modules/guide-common.css` (~230 lignes) contenant :
  - Reset body
  - `.guide-header`, `.guide-header h1/p`, `.guide-header-nav`
  - `.guide-container`, `.guide-section`, `.guide-section-title`, `.guide-section-intro`
  - `.guide-component`, `.guide-component-title`, `.guide-component-description`
  - `.guide-example`, `.guide-example-title`
  - `.guide-code`, `.guide-code-title`
  - `.guide-specs`, `.guide-specs-title`, `.guide-specs ul/li`
  - `.guide-do-dont`, `.guide-do`, `.guide-dont`, `.guide-do-title`, `.guide-dont-title`
  - `.guide-table`, `.guide-table th/td`, `.guide-table tr:nth-child(even)`
- 18 fichiers HTML modifies : `<link rel="stylesheet" href="guide-common.css">` ajoute, CSS chrome inline supprime
- 12 modules n'ont plus de `<style>` du tout (100% guide chrome)
- 6 fichiers gardent un `<style>` avec CSS specifique au module :
  - `01a` (palette couleurs), `02c` (badges tetris), `03d` (modals demo)
  - `04b` (box-shadow demo), `design-system-index` (cartes nav), `06d` (utilitaires demo)

**Etape 3 — Suppression des redefinitions CSS** :
- `03d-modals.html` : Supprime les 75 lignes de `.btn*` redefinitions (tous dans `styles.css` lignes 2574-2698)
  - Garde les styles `.modal-entete/corps/pied` (pas dans styles.css) et `.modal-overlay` (demo statique)
- `02c-badges-tetris.html` : Ajoute commentaire d'avertissement (noms partiellement differents de styles.css : `.badge-rai1` vs `.badge-rai-1`)

**Etape 4 — Nouveau module 06d : Utilitaires Beta 97.1** :
- Cree `Design system - Modules/06d-utilitaires-beta97.html` documentant :
  1. `.u-hide` — Classe utilitaire show/hide (styles.css:343)
  2. `toggleDisplay(element, show)` — Helper JS global null-safe (main.js:37)
  3. `.modal-overlay.actif` — Pattern modal show/hide (styles.css:2774-2789)
  4. `.info-box` + `--attention`, `--info`, `--succes`, `--erreur` (styles.css:2462-2484)
  5. `.badge-source` + `--locale`, `--bibliotheque`, `--retiree`, `--id` (styles.css:2487-2504)
- Chaque section : exemples Do/Don't, code CSS/JS, demos interactives, tableau recapitulatif
- Mise a jour `design-system-index.html` (carte 06d avec badge NOUVEAU)
- Mise a jour `README.md` (architecture CSS, module 06d, instructions maintenance)

**Architecture resultante du Design System** :
```
Design system - Modules/
├── guide-common.css           ← CSS chrome partage (NOUVEAU)
├── design-system-index.html   ← Index avec cartes cliquables
├── README.md                  ← Documentation structure
├── 01a-palette-couleurs.html  ← Module 1a
├── 01b-typographie.html       ← Module 1b
├── 02a-boutons.html           ← Module 2a
├── 02b-formulaires.html       ← Module 2b
├── 02c-badges-tetris.html     ← Module 2c
├── 03a-tableaux.html          ← Module 3a
├── 03b-cartes-sidebars.html   ← Module 3b
├── 03c-barres-gradient.html   ← Module 3c
├── 03d-modals.html            ← Module 3d
├── 04a-navigation.html        ← Module 4a
├── 04b-box-shadow.html        ← Module 4b
├── 05-patterns-pedagogiques.html ← Module 5
├── 06a-emojis-CRITIQUE.html   ← Module 6a
├── 06b-toggles.html           ← Module 6b
├── 06c-alertes.html           ← Module 6c
├── 06d-utilitaires-beta97.html ← Module 6d (NOUVEAU)
├── 07-primo-assistant.html    ← Module 7
└── _archives/                 ← 17 fichiers historiques
```

**Pour ajouter un nouveau module** :
1. Creer le fichier HTML avec `<link rel="stylesheet" href="../styles.css">` et `<link rel="stylesheet" href="guide-common.css">`
2. Utiliser les classes `.guide-*` de `guide-common.css` pour la structure
3. CSS specifique dans un `<style>` local si necessaire
4. Ajouter lien retour vers `design-system-index.html`
5. Ajouter carte dans `design-system-index.html`
6. Mettre a jour `README.md`

---

## ETAT ACTUEL

### Ce qui fonctionne
- Section Trimestre operationnelle (tous les accordeons)
- Creation et selection de groupe-cours
- Dropdown groupe-cours dans l'en-tete
- **Dropdown "Cours (tous groupes)"** : Voir tous les groupes fusionnes
- Design harmonise (Design System v7)
- Message de bienvenue et notes de version a jour
- Variables CSS adoptees massivement (box-shadow 43%, border-radius 95%)
- **Badge nb personnes** : S'ajuste au groupe-cours selectionne
- **Vue calendaire** : Affiche correctement l'horaire du groupe-cours actif
- **Pratiques de notation** : Sauvegarde fiable via wizard et mode expert
- **Dropdown note maximale** : Peuplé dynamiquement selon l'échelle de performance
- **Graphique spaghetti** : Visualisation de l'évolution de tous les étudiants (nouveau Beta 96)
- **Modal Confidentiel** : Informations sensibles sur l'étudiant (ÉPGC, services adaptés, etc.)
- **Anonymisation groupes** : Numéros de groupe remplacés par lettres en mode anonymisation

### Derniere tache completee (6 février - Beta 97.1)

- **35 correctifs de l'audit du 5 février** (#64-#65, #85-#108) — tous corrigés
- **Refactorisation Phase 1** (Beta 97.1) — `.style.display` fondations + 11 fichiers JS migres
- **Refactorisation Phase 2** (Beta 97.1) — 434 → 11 occurrences dans 22 fichiers JS (`fdf8558`)
- **Design System Phase 3** (Beta 97.1) — Nettoyage, deduplication CSS, module 06d (`1821dfc`)

### Tache precedente (6 février - Beta 96.3)

- **MODULE TRAVAUX - Import, Annotation et Archivage**
  - **Objectif** : Gestion complete des travaux etudiants directement dans Monitorage
  - **5 phases implementees** :
    1. **Import + Visualisation** : Import drag-drop de PDF/images, detection auto du DA etudiant, miniatures, PDF.js pour rendu PDF
    2. **Moteur d'annotation** : Canvas overlay, Apple Pencil (Pointer Events, rejet paume, pression), outils (stylo, surligneur, gomme, texte, formes, symboles), undo/redo (50 niveaux), sauvegarde auto (debounce 2s)
    3. **Integration evaluation** : Bouton "Voir le travail" dans evaluations, vue cote-a-cote (travail + grille), section "Travaux soumis" dans profil etudiant
    4. **Archivage** : Export ZIP par etudiant/production/semestre via JSZip, aplatissement annotations sur images
    5. **Optimisation** : File System Access API (Mac Chrome/Edge) pour stockage sur disque, scroll virtuel (500+ miniatures), pre-rendu pages adjacentes, moniteur quota avec nettoyage
  - **Nouveaux fichiers** (7 modules JS + 3 libs) :
    - `js/travaux-stockage.js` - Abstraction stockage (IndexedDB + FSAPI)
    - `js/travaux-import.js` - Import fichiers, drag-drop, jumelage auto DA
    - `js/travaux-visionneuse.js` - Rendu PDF.js + images, zoom/pan, cache pages
    - `js/travaux-annotation.js` - Moteur annotation canvas, Apple Pencil
    - `js/travaux-outils.js` - Definitions outils, palette, pression
    - `js/travaux-archivage.js` - Generation ZIP/PDF, export portfolio
    - `js/travaux-ui.js` - Coordinateur UI, scroll virtuel, vue cote-a-cote
    - `libs/pdf.min.js` + `libs/pdf.worker.min.js` (PDF.js v4.2.67)
    - `libs/jszip.min.js` (JSZip v3.10.1)
  - **Fichiers modifies** : `index.html`, `styles.css`, `js/config.js`, `js/navigation.js`, `js/trimestres.js`, `js/evaluation.js`, `js/profil-etudiant.js`
  - **Navigation** : Nouvel onglet "Travaux" avec 3 sous-sections (Import, Visionneuse, Archivage)
  - **Donnees** : 3 nouvelles cles namespacees (`fichiersTravaux`, `annotationsTravaux`, `archivesBundles`)
  - **Stockage** : IndexedDB blobs (iPad) ou fichiers sur disque via FSAPI (Mac), annotations JSON legeres

### Tache precedente (4 février - Beta 96.2)

- **REFONTE GESTION DES RESSOURCES (Réglages > Données > Maintenance)**
  - **Objectif** : Outil développeur pour auditer et nettoyer les ressources pédagogiques accumulées
  - **Avant** : 5 accordéons imbriqués avec problèmes de scroll et de chargement
  - **Après** : Dropdown unique avec compteurs, tableau unifié, interface simplifiée
  - **Types de ressources gérés** :
    - Pratiques de notation (source: `pratiquesConfigurables`)
    - Grilles de critères
    - Cartouches de rétroaction
    - Échelles de performance
    - Productions
  - **Informations affichées** :
    - Nom et auteur/description
    - Type (pour pratiques: SOM/STD/SPE/DEN badges)
    - Statut: Sidebar (visible) ou Masquée
    - Usage: cours, évaluations, productions liées
    - Actions: Voir, Supprimer définitivement
  - **Fichiers modifiés** :
    - `index.html` : Section Maintenance avec dropdown et conteneur unique
    - `js/donnees-v2.js` : Fonctions V2 pour affichage dynamique
    - `styles.css` : Nettoyage CSS accordéons obsolètes

### Tache precedente (1er février - Beta 96.2)

- **CORRECTION ERREUR SUPPRESSION GRILLES (Bugs Gregoire #5, #6, #7)**
  - **Symptôme** : Impossible de supprimer certaines grilles de la barre latérale (bouton inactif)
  - **Erreur console** : `null is not an object (evaluating 'document.getElementById('optionsImportExportGrilles').style')`
  - **Cause** : L'élément `#optionsImportExportGrilles` a été supprimé en Beta 92, mais le code continuait à y accéder
  - **Fonctions affectées** :
    - `supprimerGrilleDepuisSidebar()` (ligne 3614)
    - `annulerFormGrille()` (ligne 3625)
  - **Correction** : Suppression des deux lignes qui référençaient l'élément supprimé
  - **Fichier modifié** : `js/grilles.js`

- **CORRECTION IMPORT PRODUCTIONS NON DÉTECTÉES (Bug Gregoire #3)**
  - **Symptôme** : "Aucune production n'a été importée" après import de sauvegarde
  - **Cause** : Les fonctions d'analyse et d'import ne cherchaient que dans les clés globales (`productions`, `bibliothequeProductions`), pas les clés namespacées (`h2026_productions`, etc.)
  - **Fonctions corrigées** :
    - `analyserRessourcesDetaillees()` : Recherche maintenant dans `*_productions`
    - `executerImportSelectif()` : Importe depuis toutes les clés productions
    - `executerImportVersBibliotheques()` : Même correction
    - `exporterConfigurationComplete()` : Exporte depuis la clé namespacée
  - **Fichier modifié** : `js/import-export.js`

- **CORRECTION HORAIRES NON TROUVÉS (Bugs Gregoire #1, #2)**
  - **Symptôme** : Aperçu présences vide, compte de semaines incorrect (horaireActif: non défini)
  - **Cause** : La clé `horaires` est dans `CLES_NAMESPACEES` mais était lue sans namespacing dans 4 fichiers
  - **Fichiers corrigés** :
    - `js/horaire.js:92` - `obtenirSeancesHoraire()`
    - `js/entites-ui.js:74`
    - `js/trimestre-v2.js:1957`
    - `js/migrations.js:1036`
  - **Correction** : Utilisation de `cle('horaires')` pour obtenir la clé namespacée

- **CORRECTION COURS A25 NON SAUVEGARDÉ (Bugs Gregoire #9, #10)**
  - **Symptôme** : Cours créé pour A2025 était sauvegardé comme H2026 malgré permission d'écriture
  - **Cause** : `reinitialiserFormCoursV2()` forçait session='H' et ne définissait pas l'année
  - **Impact** : À la sauvegarde, année=2026 (défaut), donc trimestreId='h2026' au lieu de 'a2025'
  - **Correction** : Extraction session/année depuis le trimestre actif (`obtenirTrimestreActif()`)
  - **Fichier modifié** : `js/trimestre-v2.js`

- **CORRECTION SECTION TRIMESTRE TRONQUÉE SUR iPad (Bug Gregoire #8)**
  - **Symptôme** : Contenu coupé à droite (dates, boutons) sur iPad Safari
  - **Cause** : Layouts CSS sans media queries pour tablettes (grilles 2 colonnes fixes)
  - **Correction** : Ajout de media queries responsive pour :
    - `.layout-sidebar-2col` : Sidebar réduite à 220px puis empilée sous 850px
    - `.grille-2col` / `.grille-2col-gap15` : Empilées verticalement sur tablette
    - `#reglages-trimestre` : Styles spécifiques pour dates et blocs compacts
  - **Fichier modifié** : `styles.css`

- **CORRECTION ERREUR `reglages-horaire` INTROUVABLE (Tous les rapports)**
  - **Symptôme** : Erreur console `❌ Sous-section introuvable: reglages-horaire` au démarrage
  - **Cause** : La sous-section a été renommée en `reglages-horaire-legacy` et masquée en Beta 95, mais des références pointaient encore vers l'ancien ID
  - **Fichiers corrigés** :
    - `js/guidage.js` : Étape "horaire" → pointe maintenant vers `reglages-trimestre`
    - `js/saisie-presences.js` : Lien "Configurer l'horaire" → `reglages-trimestre`
    - `index.html` : Lien dans l'aide → `reglages-trimestre`
    - `js/primo-validation-champs.js` : Configuration `reglages-horaire` supprimée (obsolète)

- **FEATURE REQUEST : SUPPRIMER PRATIQUES HORS-BIBLIOTHÈQUE (FR Gregoire #4)**
  - **Demande** : Pouvoir supprimer des pratiques qui sont dans "Disponibles à ajouter" mais pas dans "Ma sélection"
  - **Problème** : Avant, ces pratiques ne pouvaient qu'être ajoutées, pas supprimées
  - **Solution** : Ajout d'un bouton "Supprimer" dans la section "Disponibles à ajouter" du modal Bibliothèque
  - **Nouvelle fonction** : `supprimerPratiqueHorsBibliotheque(pratiqueId)`
  - **Fichier modifié** : `js/pratiques.js`

- **#56 - NOMMAGE EXPORTS AVEC HORODATAGE COMPLET**
  - **Demande** : Inclure l'heure dans le nom des fichiers exportés pour éviter confusion
  - **Avant** : `sauvegarde-monitorage-2026-02-01.json`
  - **Après** : `sauvegarde-monitorage-2026-02-01-08-08-30.json`
  - **Fichier modifié** : `js/import-export.js` (ligne 252)

- **NETTOYAGE ÉMOJIS DANS LES NOUVEAUTÉS**
  - Retrait de tous les émojis du modal Nouveautés pour un affichage plus sobre
  - Fichier modifié : `index.html`

- **#51 - HORAIRE HEURES NON PILES**
  - **Demande** : Permettre des heures de début non piles (ex: 8h55 au lieu de 8h00)
  - **Solution** : Remplacement du dropdown par `<input type="time">` avec step="300" (5 min)
  - **Fichier modifié** : `index.html` (ligne 7355)

- **#49 - IMPORT CSV OMNIVOX (SA + ACCENTS)**
  - **Problème 1** : Accents mal gérés (é → caractères bizarres)
  - **Cause** : Omnivox exporte en Windows-1252, pas UTF-8
  - **Solution** : `reader.readAsText(fichier, 'windows-1252')`
  - **Problème 2** : Colonne SA non reconnue
  - **Cause** : Position variable (colonne 5 ou 6 selon format)
  - **Solution** : Chercher SA dans colonnes 5 ET 6, normaliser valeurs (Oui/SA/X → "Oui")
  - **Fichier modifié** : `js/trimestre-v2.js`

- **#50 - PRIMO CONFIGURATION INCOMPLÈTE (JOUR SEMAINE)**
  - **Symptôme Bruno** : Jour de la semaine du cours pas configuré après Primo
  - **Cause** : `creerHoraireDansBanquePrimo()` cherchait `reponses['horaireHebdomadaire']` (vide)
  - **Solution** : Lire les séances depuis `cle('horaireHebdo')` ou `seancesHoraire_{coursId}` (créées par creerSeancesHoraire)
  - **Fichier modifié** : `js/primo-modal.js`

- **#53 - MENU FORMAT HORAIRE NE SE MET PAS À JOUR**
  - **Symptôme** : Changer le nombre d'heures/semaine ne met pas à jour les options du dropdown Format horaire
  - **Cause** : Options statiques (1×4h, 2×2h, 4×1h) au lieu de dynamiques
  - **Solution** : Nouvelle fonction `mettreAJourOptionsFormatHoraire()` qui génère les diviseurs
  - **Fichiers modifiés** : `index.html` (onchange), `js/trimestre-v2.js` (fonction)

- **MODAL DE BIENVENUE POUR NOUVEAUX UTILISATEURS**
  - **Problème** : Premier lancement sur iPad affiche le modal backup au lieu d'un accueil guidé
  - **Cause** : Primo ne s'affichait qu'en mode Assisté, mais le mode par défaut est Normal
  - **Solution** : Nouveau modal de bienvenue qui s'affiche avant tout autre modal
  - **Choix offerts** :
    - "Configuration guidée" : Passe en mode Assisté et lance Primo
    - "Explorer par moi-même" : Ferme le modal avec conseil vers section Trimestre
  - **Coordination** : Le modal backup ne s'affiche pas si le modal bienvenue est présent
  - **Fichiers créés/modifiés** :
    - `js/modal-bienvenue.js` (nouveau)
    - `styles.css` (styles modal bienvenue)
    - `js/modal-backup-reminder.js` (check bienvenue actif)
    - `index.html` (script + nouveautés)

- **AMÉLIORATION MODAL BIENVENUE - REPÈRES VISUELS**
  - Ajout d'une section expliquant les 3 icônes de l'en-tête :
    - ✉️ Nouveautés — Corrections et nouvelles fonctionnalités
    - 😎 Primo — Guide interactif et navigation générale
    - ⚠️ Rappel backup — Protection des données
  - **Fichiers modifiés** : `js/modal-bienvenue.js`, `styles.css`

- **RENOMMAGE "DÉCOUVRIR L'APPLICATION" → "PREMIERS PAS"**
  - Titre du bouton 😎 et du modal intro mis à jour
  - **Fichier modifié** : `index.html`

- **AMÉLIORATION ANIMATION BULLES EN-TÊTE**
  - **Style 3D** : Gradient blanc→gris + box-shadow multicouche (identique aux points du tableau de bord)
  - **Effet parallaxe** : Grandes bulles rapides (proches), petites lentes (éloignées)
  - **Vitesses** : grande 30-50s, moyenne 55-75s, petite 80-120s
  - **Couleur** : Toutes blanches (uniformité avec tableau de bord)
  - **Référence** : CSS `index.html:1465-1560`, JS `js/main.js:128-240`
  - **Fichiers modifiés** : `index.html`, `js/main.js`, `CLAUDE.md` (référence ajoutée)

### Tache precedente (31 janvier - Beta 96.2)

- **#48 - SYNCHRONISATION MULTI-APPAREILS (MacBook ↔ iPad)**
  - **Symptôme** : Import sur nouvel appareil échouait, données non chargées
  - **Corrections** :
    - Auto-cochage des cases Étudiants/Présences/Notes quand "C'est ma propre sauvegarde" coché
    - Préservation des IDs originaux pour pratiques, grilles, échelles, productions
    - Import des données calendrier (cadreCalendrier, horaireHebdo, etc.)
  - **Résultat** : 68 éléments importés avec succès (22 pratiques, 14 grilles, 8 échelles, 137 étudiants, 2797 présences, 6 groupe-cours, 9 horaires)
  - Fichier modifié : `js/import-export.js`

- **#55 - PRATIQUES CONFIGURABLES NON TROUVÉES DANS LE REGISTRE**
  - **Symptôme** : Erreur `❌ Pratique "pratique-1768910384608" non disponible dans le registre`
  - **Cause 1** : `obtenirPratiqueParId()` ne cherchait pas dans `pratiquesConfigurables`
  - **Cause 2** : Pratiques créées via wizard ont structure différente (ID/échelle à la racine, pas dans `config`)
  - **Solution** : Nouvelle fonction `construireConfigComplete()` qui normalise les deux formats
    - Fusionne champs racine + config interne
    - Charge l'échelle par ID depuis `echellesTemplates` si non embarquée
    - Fallback vers échelle IDME par défaut si référence introuvable
  - Fichier modifié : `js/pratiques/pratique-registre.js`

- **DÉSACTIVATION MODAL MIGRATION LEGACY**
  - **Symptôme** : Modal "Mise à jour de vos données" apparaissait après nettoyage des clés obsolètes
  - **Cause** : Flag `migrationLegacyEffectuee` supprimé par le script de nettoyage
  - **Solution** : `detecterDonneesLegacy()` vérifie maintenant si des données namespacées existent
    - Si `h2026_groupeEtudiants` ou `h2026_groupesCours` présents → migration non nécessaire
    - Marque automatiquement `migrationLegacyEffectuee=true`
  - Fichier modifié : `js/migrations.js`

- **SCRIPT DE NETTOYAGE DES CLÉS OBSOLÈTES**
  - Nouveau script `scripts/nettoyage-cles.js` pour usage en console navigateur
  - 3 étapes : `etape1_identifier()` → `etape2_backup()` → `etape3_supprimer()`
  - Catégories nettoyées : test/simulation, séances test, globales obsolètes, flags migration, snapshots anciens
  - 48 clés supprimées (189 → 141 clés)

### Tache precedente (30 janvier - Beta 96.2)
- **CORRECTION CRITIQUE - EXPORT SAUVEGARDE COMPLÈTE (IndexedDB)**
  - Bug critique : La "Sauvegarde complète" exportait SEULEMENT les données de localStorage
  - Les données volumineuses (groupes-cours, horaires, etc.) stockées uniquement dans IndexedDB étaient PERDUES
  - **Correction** :
    - `ouvrirModalExport()` : Utilise maintenant `db.keys()` pour lister TOUTES les clés
    - `executerExport()` : Convertie en async, utilise `await db.get(cle)` au lieu de `localStorage.getItem()`
    - Exports window ajoutés pour les fonctions d'export
  - Fichier modifié : `js/import-export.js`

- **CORRECTION - UTF-16 Safari (envoyerRapportParCourriel)**
  - Erreur répétée sur iPad : `URIError: String contained an illegal UTF-16 sequence`
  - **Cause** : Caractères Unicode invalides dans les rapports de bug
  - **Correction** : Fonction `nettoyerUTF16()` compatible Safari (sans lookbehind regex)
  - Fichier modifié : `js/rapport-bug.js`

- **AMÉLIORATION - Archivage local des rapports de bug**
  - Les rapports sont maintenant sauvegardés localement (max 50)
  - Fichier modifié : `js/rapport-bug.js`

### Tache precedente (30 janvier - Beta 96.1)
- **CORRECTION - IMPORT SAUVEGARDE COMPLÈTE (clés manquantes)**
  - Bug signalé par testeur (iPad/Safari) : Import réussi mais données non chargées
  - **Cause** : Les clés `*_groupesCours`, `*_horaires`, `enseignants` n'étaient pas gérées par l'import sélectif
  - **Correction** : Ajout du support des entités structurelles Beta 95+ dans `import-export.js`
    - Analyse des clés `*_groupesCours`, `*_horaires`, `enseignants`
    - Affichage dans le modal avec section "Structure du trimestre"
    - Importation effective de ces données
  - Fichier modifié : `js/import-export.js`

- **CORRECTION - ERREUR CONSOLE ouvrirModalPreparationPDF**
  - Erreur systématique au chargement : `Can't find variable: ouvrirModalPreparationPDF`
  - **Cause** : Fonction renommée `ouvrirModalExportPDF` mais window.export pas mis à jour
  - **Correction** : Mise à jour des exports window dans `js/export-pdf.js`

- **BOÎTE À OUTILS - QUESTIONS FLASH**
  - Deuxième outil dans la section Boîte à outils
  - Tirage aléatoire de questions pour pratiques de récupération en classe
  - **Questions liées au cours** : Chaque cours a ses propres questions (stockage par coursId)
  - **Organisation par catégories** : Créer, modifier, supprimer des catégories thématiques
  - **Gestion CRUD** : Ajouter, modifier, supprimer des questions depuis le modal
  - **Changement de catégorie** : Dropdown pour déplacer une question vers une autre catégorie
  - **Filtre par catégorie** : Dropdown dans la carte pour filtrer les questions à tirer
  - **Animation roulette** : Même effet de suspense que le tirage d'étudiants
  - **Mode avec/sans remise** : Option pour répéter ou non les questions
  - **Mise en page** : Deux cartes côte à côte (Questions Flash | Tirage au sort)
  - Fichiers modifiés : `js/boite-outils.js`, `js/navigation.js`, `js/trimestre-v2.js`, `index.html`, `styles.css`

- **NAVIGATION - ICÔNE RÉGLAGES**
  - Le texte "Réglages" remplacé par l'icône d'engrenage dans la barre de navigation
  - Tooltip "Réglages" au survol pour l'accessibilité

- **BOÎTE À OUTILS - TIRAGE AU SORT** (précédent)
  - Nouvelle section "Boîte à outils" dans la navigation principale
  - Premier outil : Tirage au sort d'étudiants pour pratiques de récupération en classe
  - **Animation roulette** : Effet de suspense avec défilement ralentissant
  - **Modal paramètres** : Nombre à tirer, mode avec/sans remise, exclusions manuelles
  - **Persistance** : État conservé lors du changement d'onglet (localStorage)
  - **Rafraîchissement auto** : Liste mise à jour lors du changement de groupe-cours
  - Design System v7 respecté (modal, boutons, couleurs)
  - Fichiers créés : `js/boite-outils.js`
  - Fichiers modifiés : `js/config.js`, `js/navigation.js`, `js/trimestre-v2.js`, `js/contexte.js`, `index.html`, `styles.css`

### Tache precedente (28 janvier - Beta 96.1)
- **ANIMATION 3D DES POINTS (Tableau de bord)**
  - Les points blancs dans les barres graduées oscillent avec un effet de rotation 3D
  - Tous les points partent du centre de la barre (ligne horizontale)
  - Chaque point a une amplitude aléatoire (5-22px) et un délai aléatoire (0-3s)
  - Durée inversement proportionnelle à l'amplitude (grandes amplitudes = plus rapide)
  - Effet de profondeur via z-index (premier plan en montant, arrière-plan en descendant)
  - **Option désactivable** : Préférences > Expérience visuelle > Animation des points
  - Fichiers modifiés : `styles.css`, `js/tableau-bord-apercu.js`, `js/preferences-v2.js`, `index.html`

- **MODAL CONFIDENTIEL (Profil étudiant)**
  - Nouveau bouton 🔒 Confidentiel dans la section Accompagnement
  - Formulaire pour saisir : ÉPGC, cours antérieur, services adaptés, défis particuliers, notes
  - Services adaptés avec dropdowns conditionnels (catégorie → sous-catégorie)
  - Interface réorganisée en 2 colonnes pour optimiser l'espace
  - Indicateur vert si l'étudiant a des infos confidentielles
  - Fichiers modifiés : `index.html`, `js/profil-etudiant.js`

- **AMÉLIORATIONS TABLEAU DE BORD**
  - **Corrélations significatives** : Messages A↔P et C↔P affichés uniquement si r ≥ 0.5
  - **Barres uniformisées** : Patterns et RàI alignées sur hauteur ACPE (55px)
  - **Graphique Trajectoire** : Courbe sélectionnée au premier plan (order: 0)
  - Fichiers modifiés : `js/tableau-bord-apercu.js`, `js/graphiques-progression.js`, `styles.css`

- **ANONYMISATION DES GROUPES**
  - Nouvelle fonction `anonymiserGroupe()` : 00001 → Gr. A, 00002 → Gr. B
  - Appliquée dans l'en-tête du tableau de bord et les tableaux d'étudiants
  - Mapping persisté dans localStorage (réinitialisé avec mapping anonymisation)
  - Fichiers modifiés : `js/modes.js`, `js/tableau-bord-apercu.js`

- **CORRECTIONS MINEURES**
  - "Correction" → "Permission d'écriture" dans bandeau trimestre archivé
  - "heures" → "périodes" dans section Engagement du profil étudiant

### Tache precedente (28 janvier - Beta 96.1)
- **REFONTE EXPORT PDF - FORMULAIRE INLINE ET APERÇU AMÉLIORÉ**
  - **Formulaire inline** : Le bouton "Préparer le PDF" affiche le formulaire dans la zone principale (pas de navigation)
    - Production, Grille, Échelle, Cartouche sur 2 lignes compactes
    - Bouton "Annuler" restaure le contenu précédent
    - Bouton "Voir l'aperçu →" ouvre le modal d'aperçu
  - **Modal d'aperçu optimisé** : Options compactes sur une seule ligne
    - **Orientation** : Portrait/Paysage
    - **Entête** : Code cours ✓ / Nom cours ✓ / Trimestre ✓ (nouvelles options)
    - **Pied de page** : Enseignant ✓ / Licence CC ✓
    - **Production** (conditionnel) : Nom ✓ / Objectif ✓ / Tâche ✓ / Desc. critères ☐
  - **Aperçu dynamique** : Toutes les options mettent à jour l'aperçu en temps réel
  - **Pied de page visible** : CSS modifié pour afficher le footer même si le contenu dépasse
  - **Fichiers modifiés** : `index.html`, `styles.css`, `js/export-pdf.js`

- **CORRECTIONS VISUELLES ET UX** (#40-#46)
  - **Boutons d'aide dans bibliothèques** (#40) : Bouton 😎 ajouté aux 5 bibliothèques
    - Contenu d'aide expliquant les badges (Locale/Bibliothèque/Retirée) et les boutons
  - **Uniformisation sidebars** (#41) : Style uniforme pour boutons "Consulter la bibliothèque"
    - Classe `.sidebar-vide` pour messages vides
  - **Uniformisation bibliothèques** (#42) : Badges, ID courts, détection doublons
  - **Z-index modal d'aide** : 10002 (au-dessus des bibliothèques à 10000)
  - **Doublon bouton cartouches** : Supprimé le bouton HTML dupliqué
  - **Bouton "Préparer le PDF" productions** : Ajouté pour cohérence avec grilles/échelles/cartouches
  - **Footer PDF corrigé** : Espacement correct, nom enseignant affiché
  - **Effet 3D bulles tableaux** : Classe `.bulle-niveau-tableau` (même effet que barres graduées)
  - **Fichiers modifiés** : `index.html`, `styles.css`, `js/export-pdf.js`, `js/profil-etudiant.js`, `js/aide-contextuelle-contenu.js`, et 5 fichiers bibliothèques

- **GESTION BIBLIOTHÈQUES COMPLÈTE** : Boutons Supprimer et Dupliquer (session précédente)
  - **Bouton Supprimer** : Suppression définitive avec confirmation modale
    - Vérification des dépendances (ex: impossible de supprimer une grille avec cartouches liées)
    - Bouton "Retirer" changé de rouge (btn-supprimer) à gris (btn-secondaire)
    - Implémenté dans 5 bibliothèques : Grilles, Cartouches, Échelles, Pratiques, Productions
  - **Bouton Dupliquer** : Crée une copie avec nouvel ID et suffixe "(copie)"
    - Métadonnées CC nettoyées sur la copie
    - Bouton vert (btn-confirmer)
    - Implémenté dans les 5 bibliothèques
  - **Détection doublons (Productions)** : Avertissement si titres en double
    - Badges de source : Locale (vert), Bibliothèque (bleu), Retirée (orange)
    - ID court affiché (#abc123) pour distinguer les doublons
  - **Fichiers modifiés** : `js/grilles.js`, `js/cartouches.js`, `js/echelles.js`, `js/pratiques-materiel.js`, `js/productions.js`

- **ISOLATION DES TEMPLATES ARCHIVÉS** : Protection des trimestres archivés
  - **Problème résolu** : Supprimer une grille en H2026 affectait les trimestres archivés (A2025)
  - **Solution** : Copie des templates UTILISÉS lors de l'archivage
    - Nouvelle constante `CLES_TEMPLATES_ARCHIVES` dans trimestres.js
    - Nouvelle fonction `identifierTemplatesUtilises()` pour identifier les templates référencés
    - Modification de `creerSnapshotRessources()` pour copier vers des clés namespacées
    - Modification de `cle()` pour utiliser les copies archivées en lecture
  - **Templates copiés** : grillesTemplates, echellesTemplates, pratiquesConfigurables, cartouches_{grilleId}
  - **Fichier modifié** : `js/trimestres.js`

### Tache precedente (26 janvier - Beta 96)
- **FIX APERÇU DES PRÉSENCES** : Alignement calculs sur tableau de bord
  - **Problème** : Élèves=53 (au lieu de 25), Taux=90% (au lieu de 98%), Séances=1/2 (au lieu de 1/30)
  - **Causes multiples** :
    1. Étudiants non filtrés par groupe-cours actif → utilisait tous les étudiants du trimestre
    2. Taux faisait la moyenne SOM/PAN → si sommatif=98% et alternatif=82%, moyenne=90%
    3. Indices lus comme valeurs directes → mais format réel est `{indice: 0.98, nombreSeances: 1}`
    4. Séances comptées jusqu'à aujourd'hui → au lieu du total trimestre
    5. `seancesHoraire` lu sans namespace → clé globale au lieu de trimestre actif
  - **Corrections** :
    - Utilisation de `obtenirEtudiantsCoursActif()` pour filtrer par groupe
    - Taux utilise **sommatif uniquement** (pas de moyenne avec alternatif)
    - Extraction `.indice` des objets indices
    - Division par `nbAvecDonnees` (pas nbTotal) pour éviter dilution
    - Comptage de TOUTES les séances du trimestre
    - Utilisation de `obtenirSeancesHoraire()` pour le bon namespace
  - **Résultat** : Élèves=25, Taux=98%, Séances=1/30
  - **Fichiers modifiés** : `js/presences-apercu.js`

### Tache precedente (25 janvier - Beta 96)
- **FIX #30 : EXPORT PDF - INFOS COURS/ENSEIGNANT** : Le PDF affiche maintenant les infos complètes
  - **Problème** : Infos cours et enseignant non affichées dans le PDF (seulement trimestre visible)
  - **Cause** : `window.trimestreActif` était vide, et pas de fallback sur `profilEnseignant`
  - **Solution** : Fonctions `obtenirInfosCoursPDF()` et `obtenirNomEnseignantPDF()` améliorées
    - Utilisation de `obtenirTrimestreActif()` au lieu de juste `window.trimestreActif`
    - Fallbacks multiples : `coursActif`, `infoCours`, cours unique dans `listeCours`
    - Fallback final sur `profilEnseignant` même si groupe-cours non trouvé
  - **Résultat** : En-tête affiche "601-101-MQ / Écriture et littérature / Hiver 2026"
  - **Résultat** : Pied de page affiche "Grégoire Bédard" et "CC BY-NC-SA 4.0"
  - **Fichier modifié** : `js/export-pdf.js`

- **FIX #37 : COHÉRENCE INDICE P = NOTE FINALE** : L'indice P reflète maintenant la vraie note
  - **Problème** : P=50% dans tableau de bord mais Note finale=59% dans profil
  - **Cause** : `calculerPerformance()` utilisait TOUTES les évaluations, pas la méthode de sélection
  - **Solution** : `calculerEtStockerIndicesCP()` utilise maintenant `calculerDetailsNoteFinale()`
  - L'indice P respecte : méthode de sélection, pondérations, règles de conformité
  - **Fichiers modifiés** : `js/portfolio.js`, `js/profil-etudiant.js`

- **UNIFORMISATION VISUELLE DES POINTS** : Tous les graphiques ont le même style
  - **Points blancs par défaut** : Fond `rgba(255, 255, 255, 0.9)` + contour bleu pâle `rgba(33, 150, 243, 0.5)`
  - **Points noirs au survol/sélection** : Fond `rgba(0, 0, 0, 0.85)` + contour blanc
  - **Taille uniformisée** : 10px pour les barres ACEP (CSS), pointRadius: 5 pour Chart.js
  - **Barres ACEP** : `.barre-etudiant` CSS modifié pour style uniforme
  - **Graphiques Chart.js** : Tous les `pointBackgroundColor` et `pointBorderColor` uniformisés
  - **Fichiers modifiés** : `styles.css`, `js/graphiques-progression.js`

- **CORRECTION CLIC SUR NOMS ÉTUDIANTS** : Le verrouillage fonctionne maintenant partout
  - **Problème** : Cliquer sur le nom d'un étudiant/indice ne déclenchait pas le verrouillage
  - **Cause** : Coordonnées du clic en espace CSS vs zones cliquables en espace canvas
  - **Fix** : Application du ratio de scale (`canvas.width / rect.width`) dans les gestionnaires de clic
  - **Graphiques corrigés** : Évolution temporelle, Progression temporelle, Développement des habiletés
  - **Fichier modifié** : `js/graphiques-progression.js`

- **CORRECTION ANONYMISATION ARCHIVES** : Les noms sont anonymisés partout
  - **Problème** : Noms réels affichés dans graphiques "Évolution temporelle" malgré mode anonymisation
  - **Cause** : Les labels étaient construits directement depuis snapshot sans vérifier l'anonymisation
  - **Fix** : Ajout vérification `anonymiserNom(da)` dans `creerGraphiqueGroupeSpaghettiACP` et `creerGraphiqueGroupeSpaghetti`
  - **Fichier modifié** : `js/graphiques-progression.js`

- **RÉORGANISATION DU TABLEAU DE BORD** : 4 sections distinctes (tâche précédente)
  1. **Indicateurs ACPE du groupe** : Barres A, C, P, E avec mini-courbes Gauss
  2. **Indicateurs d'apprentissage** : Patterns + RàI (nouvelle section séparée)
  3. **Évolution temporelle** : Graphique spaghetti ACP
  4. **Trajectoire d'apprentissage** : Graphique spaghetti par production
  - Chaque section a son propre ID pour injection JS ciblée
  - Notes d'aide mises à jour pour chaque section
  - **Fichiers modifiés** : `index.html`, `js/tableau-bord-apercu.js`

- **MINI-COURBES DE GAUSS INTÉGRÉES** (tâche précédente)
  - Mini-courbe de Gauss SVG superposée sur chaque barre ACPE
  - Ligne μ pleine + lignes ±σ pointillées
  - Statistiques sous chaque barre : μ=XX% | ±1σ: X/N (Y%)
  - Barres agrandies : 55px (ACPE), 45px (Patterns, RàI)

### Tache precedente (25 janvier - Beta 96)
- **UNIFORMISATION DES GRAPHIQUES** : Tous les graphiques adoptent le même look
  - **Échelle Y dynamique** : S'adapte aux données (min-5% à max+5%) au lieu de 0-100% fixe
  - **Zones IDME dynamiques** : Utilisent l'échelle utilisateur partout (via `genererZonesDepuisEchelle()`)
  - **Étiquettes de zones** : Centrées dans le graphique avec couleurs saturées (rouge, orange, vert, bleu)
  - **Survol interactif** : Courbe survolée mise en évidence, autres atténuées, nom affiché au bout
  - **Graphiques uniformisés** :
    - `creerGraphiqueIndividuel` : Progression temporelle A-C-P (profil étudiant)
    - `creerGraphiqueGroupeMoyennes` : Moyennes A-C-P du groupe (tableau de bord)
    - `creerGraphiqueGroupeSpaghettiACP` : Trajectoires ACP par étudiant (tableau de bord)
    - `creerGraphiqueGroupeSpaghetti` : Trajectoires par production (tableau de bord)
    - `creerGraphiqueCriteres` : Développement des habiletés (profil étudiant)
  - **Fichiers modifiés** :
    - `js/graphiques-progression.js` : Ajout plugins, onHover, échelle dynamique
    - `index.html` : Notes de version Beta 96
  - **Plugins créés** :
    - `pluginEtiquettesZones` / `pluginEtiquettesZones100` : Étiquettes centrées
    - `pluginNomCritereSurvol` : Affiche nom du critère au survol

### Tache precedente (25 janvier - Beta 96)
- **GRAPHIQUE SPAGHETTI - TRAJECTOIRES D'APPRENTISSAGE** : Nouvelle visualisation
  - Affiche les **résultats bruts par artefact** (pas l'indice P agrégé)
  - Montre la volatilité réelle de l'apprentissage (hauts et bas)
  - Révèle les artefacts difficiles (convergence vers le bas)
  - Permet de voir la résilience (rebonds après difficultés)
  - Zones IDME colorées en arrière-plan avec étiquettes
  - Carte d'aide expliquant la différence avec l'indice P

### Tache precedente (25 janvier - Beta 95.7)
- **IMPORT HISTORIQUE A2024** : Archivage trimestre Automne 2024
  - Import retroactif : 55 etudiants, 2 groupes, 750 evaluations, 1650 presences
  - Echelle IDME documentee (I=40%, D=65%, M=85%, E=100%)
  - Pratique : 6 artefacts recents (60%) + Analyse finale (40%)
  - Correction tri "recents" par numero de production (pas par date)
  - Scripts d'import dans `docs/A2024/`
  - Trimestre archive en lecture seule
  - **Fichiers modifies** : `js/portfolio.js`, `js/profil-etudiant.js`

### Tache precedente (24 janvier)
- **NETTOYAGE DOUBLON GROUPE-COURS** : Groupe 1 de A25 apparaissait dans H26
  - **Symptome** : Le dropdown groupe-cours en H26 affichait 3 groupes (1, 2, 8) au lieu de 2 (2, 8)
  - **Cause** : La migration `migrerHorairesEtGroupesCours()` du 21 jan avait copie les donnees globales vers le trimestre actif, incluant le groupe 1 de A25 dans h2026_groupesCours
  - **Diagnostic** : Script console pour lister les groupes par trimestre
    - `db.getSync("h2026_groupesCours")` → 3 groupes (00001, 00002, 00008)
    - `db.getSync("a2025_groupesCours")` → 1 groupe (00001)
  - **Fix** : Nettoyage manuel via console (suppression du groupe 00001 de h2026_groupesCours)
    - Script : `db.setSync("h2026_groupesCours", db.getSync("h2026_groupesCours").filter(gc => gc.groupe !== "00001"))`
  - **Resultat** : H26 affiche maintenant seulement les groupes 2 et 8, A25 conserve son groupe 1
  - **Note** : Pas de changement de code, correction de donnees uniquement

- **CORRECTION AFFICHAGE TABLEAU DE BORD** : Messages "en attente" contradictoires
  - **Symptome 1** : Trimestre archive A25 affichait les moyennes (92%, 78%, 89%) ET "(X evaluations en attente)" simultanement
  - **Cause** : La condition d'affichage du message "en attente" ne verificait pas si une moyenne existait deja
  - **Fix** : Ajout condition `moyenneSignificative` - le message n'apparait que si la moyenne est 0%
  - **Symptome 2** : H26 sans evaluations affichait "100% en blocage critique" et "100% Niveau 3 intensif"
  - **Cause** : Le filtrage incluait les etudiants avec A > 0 mais C = P = 0 pour les patterns/RaI
  - **Fix** : Filtrage corrige pour ne considerer que les etudiants avec C > 0 OU P > 0
  - **Fichier modifie** : `js/tableau-bord-apercu.js`
    - `genererBarreDistribution()` : Condition `moyenneSignificative` (ligne 1418)
    - `afficherPatternsApprentissage()` : Filtrage `etudiantsAvecDonneesCP` sur C et P uniquement
    - `afficherNiveauxRaI()` : Meme correction pour les niveaux RaI
  - **Resultat** :
    - A25 (archive) : Moyennes affichees sans message "en attente" parasite
    - H26 (sans evaluations) : Message "En attente de donnees" pour Patterns et RaI

### Tache precedente (23 janvier)
- **CORRECTION BUG ANONYMISATION #2** : Liste etudiants vide en mode anonymise
  - **Symptome** : Passage Normal → Anonymise affichait "0 personne" et "Aucun etudiant trouve"
  - **Cause** : Le filtrage par groupe dans `obtenirEtudiantsCoursActif()` comparait le groupe anonymise (`AN.00001`) avec le groupe reel (`00001`)
    - `anonymiserDonnees()` remplacait `e.groupe` par `AN.${e.groupe}` sans preserver le groupe reel
    - La comparaison `normaliserGroupe(e.groupe) === normaliserGroupe(groupeCours)` echouait systematiquement
  - **Fix** : Ajout de `groupeReel` dans l'anonymisation + utilisation dans le filtrage
    - `anonymiserDonnees()` : Ajout `groupeReel: etudiant.groupe` (ligne 667)
    - `obtenirEtudiantsCoursActif()` : Utilise `e.groupeReel || e.groupe` pour le filtrage (ligne 889)
    - `etudiantDansCoursActif()` : Meme correction (ligne 955)
  - **Fichier modifie** : `js/modes.js`

- **CORRECTION BUG ANONYMISATION #1** : "Eleve introuvable" lors du changement de mode
  - **Symptome** : Checkbox Anonymiser ou dropdown mode affichait "Eleve introuvable"
  - **Cause** : Incoherence de filtrage dans `rafraichirContenuSelonMode()` (modes.js)
    - La verification utilisait `filtrerEtudiantsParMode` (sans filtre coursId)
    - Mais `afficherProfilComplet` utilisait `obtenirEtudiantsCoursActif()` (avec filtre coursId)
  - **Fix** : Utiliser `obtenirEtudiantsCoursActif()` partout pour coherence
  - **Fichier modifie** : `js/modes.js`

- **DIAGNOSTIC ET CORRECTION DONNEES A25** : Trimestre A2025 inutilisable (pas d'etudiants, pas d'indices)
  - **Symptome** : Groupe-cours 00001 de l'A25 n'affichait aucune donnee malgre 30 etudiants
  - **Cause 1** : Mismatch coursId - etudiants, evaluations, presences et productions avaient un ancien coursId
    - Fix : Script console pour corriger coursId dans toutes les entites
  - **Cause 2** : Pratique non reconnue - `pan-standards-bruno` (pratique utilisateur) non trouvee par `obtenirPratiqueParId()`
    - Fix : Changement vers `pan-standards` (pratique built-in)
  - **Cause 3** : Cache indicesCP ancien format causait erreur `historique.length`
    - Fix : Nettoyage cache et recalcul avec nouveau format
  - **Cause 4** : Configuration affichage manquante - `affichageTableauBord` non defini
    - Fix : Ajout `afficherAlternatif: true` dans `modalitesEvaluation`
  - **Resultat** : A25 affiche maintenant A=98%, C=92%, P=78%, E=89% + patterns + niveaux RaI
  - **Note** : Corrections via scripts console (pas de changement de code)

- **CORRECTION FILTRAGE PRESENCES PAR GROUPE-COURS** : Les presences etaient melangees entre les groupes
  - **Symptome** : Le groupe 2 affichait les presences du groupe 8 (indice A incorrect)
  - **Cause** : `chargerGroupesPresences()`, `chargerTableauPresences()` et `sauvegarderToutesPresences()` utilisaient `obtenirDonneesSelonMode('groupeEtudiants')` (retourne TOUS les etudiants du trimestre)
  - **Fix** : Utilisation de `obtenirEtudiantsCoursActif()` pour ne prendre que les etudiants du groupe-cours actif
  - **Fichier modifie** : `js/saisie-presences.js`

- **CORRECTION CALCUL MOYENNE A PAR GROUPE-COURS** : Le calcul incluait les presences d'autres groupes
  - **Symptome** : Groupe 2 affichait la moyenne A du groupe 8
  - **Cause** : Les presences n'etaient pas filtrees par `coursId` du groupe-cours actif
  - **Fix** : Ajout filtrage `presencesGlobal.filter(p => p.coursId === coursIdActif)` dans le calcul moyenneA
  - **Fichier modifie** : `js/etudiants.js`

- **CORRECTION DROPDOWN TRIMESTRE ACTIF** : Le dropdown affichait le mauvais trimestre
  - **Symptome** : Apres changement vers A2025, le dropdown affichait toujours "Demonstration"
  - **Cause** : La valeur du select n'etait pas forcee apres population des options
  - **Fix** : Ajout `select.value = trimestreActif.id` apres population des options
  - **Fichier modifie** : `js/trimestre-v2.js`

- **CORRECTION DOUBLONS TRIMESTRES** : Deux entrees "Demonstration" dans le dropdown
  - **Cause** : Doublons dans la liste des trimestres enregistres
  - **Fix** : Nettoyage automatique des doublons dans `obtenirTrimestres()` (detection par ID et par nom)
  - **Fichier modifie** : `js/trimestres.js`

- **MASQUAGE TRIMESTRE DEMO EN MODE NORMAL** : Le trimestre Demo n'apparait plus en mode Normal
  - Le trimestre Demo est maintenant visible uniquement en Mode Assiste
  - **Fichier modifie** : `js/trimestre-v2.js`

- **AJOUT BACKLOG #32** : Refonte architecture groupe Demo planifiee
  - Le groupe Demo devient un "bac a sable" accessible en Mode Assiste
  - Plus de switch de trimestre, mais switch de MODE (Normal/Assiste)
  - Dataset complet : 5 etudiants, ~8-10 semaines, presences variees, evaluations, productions
  - Prerequis : Documentation complete avant codage

### Tache precedente (21 janvier)
- **BUG CRITIQUE TRIMESTRES A2025/DEMO** : Données inaccessibles après changement de trimestre
  - **Symptôme** : "0 personne" affiché, aucun étudiant ni résultat visible
  - **Cause 1** : `changerTrimestreActif()` ne mettait pas à jour `window.trimestreActif`
    - Fix : Ajout `window.trimestreActif = id;` après `db.setSync` (trimestres.js)
  - **Cause 2** : `groupesCours` et `horaires` manquants dans `CLES_NAMESPACEES`
    - `cle('groupesCours')` retournait 'groupesCours' au lieu de 'a2025_groupesCours'
    - Fix : Ajout des deux clés à `CLES_NAMESPACEES` (trimestres.js)
  - **Cause 3** : Données demo n'avaient pas de groupe-cours
    - Fix : `fusionnerDonneesDemo()` crée maintenant automatiquement un horaire et groupe-cours demo
    - Fichier modifié : `js/donnees-demo.js`
  - **Cause 4** : Création automatique groupe-cours demo au changement de trimestre
    - Fix : Nouvelle fonction `creerGroupeCoursDemoSiNecessaire()` appelée dans `changerTrimestreActif()`
    - Crée `HOR_DEMO` et `GC_DEMO` si manquants quand on passe au trimestre demo
    - Fichier modifié : `js/trimestres.js`
  - **Résultat** : A2025 affiche maintenant 30 étudiants avec assiduité (98%)
  - **Problème résiduel A2025** : Complétion et Performance à 0% dans le tableau de bord agrégé
    - Cause probable : Grille d'évaluation originale (`GRILLE1759243306842 - Global-5 FR-HOLIS`) supprimée/modifiée
    - Les notes individuelles sont conservées mais le calcul agrégé échoue
    - Ce n'est pas un bug de code mais un problème de données

- **MIGRATION HORAIRES/GROUPESCOURS** : Données H2026 manquantes après ajout à CLES_NAMESPACEES
  - **Symptôme** : Horaires et groupe-cours créés pour H2026 n'apparaissaient pas
  - **Cause** : Données stockées dans `horaires`/`groupesCours` (sans préfixe) mais lues depuis `h2026_horaires`/`h2026_groupesCours`
  - **Fix** : Nouvelle fonction `migrerHorairesEtGroupesCours()` dans `initialiserModuleTrimestres()`
  - Migre automatiquement les données vers le trimestre actif au démarrage
  - **Fichier modifié** : `js/trimestres.js`

- **EXPORT PDF GRILLES DESCRIPTIVES (#30)** : Améliorations mise en page
  - **Nouvelle disposition** :
    - En-tête droite : Code cours, Nom du cours, Trimestre (empilés verticalement)
    - Pied de page gauche : Nom complet de l'enseignant uniquement
    - Pied de page droite : Licence CC BY-NC-SA 4.0
  - **Corrections SST** (Single Source of Truth) :
    - `obtenirInfosCoursPDF()` : Lecture depuis `listeCours`/`cours` via `coursId` (comme trimestre-v2.js:4117-4120)
    - `obtenirNomEnseignantPDF()` : Gestion correcte `enseignantId === 'profil'` (comme trimestre-v2.js:4127-4140)
  - **Options simplifiées** :
    - Retiré : Option "Cours" du pied de page (maintenant dans l'en-tête)
    - Retiré : Taille police (fixée à "petit")
    - Ajouté : Checkbox "Afficher le trimestre"
  - **Marges réduites** : 0.5 inch au lieu de 1 inch
  - **Bug en cours** : Les infos cours/enseignant ne s'affichent pas encore dans le PDF
    - Prochaine étape : Ajouter logs de débogage pour identifier la source des données
  - **Fichiers modifiés** : `js/export-pdf.js`, `index.html`, `styles.css`

### Tache precedente (20 janvier)

- **CLARIFIER ARTEFACTS MEILLEURS VS OBLIGATOIRES (#3)** : Workflow amélioré
  - Primo : Nouvelle question "Combien de productions Obligatoires ?"
  - Primo : Message validation affiche total (ex: "4 meilleures + 2 obligatoires = 6 productions")
  - Wizard : Transfert config catégories Primo → pratique.configuration
  - Expert : Résumé visuel "📊 Construction de la note" avec calcul dynamique
  - **Fichiers modifiés** : `js/primo-questions.js`, `js/wizard-pratique-v2.js`, `js/pratiques-materiel.js`, `index.html`

- **DROPDOWN NOTE MAXIMALE (Beta 95.7)** : Reprise ciblée avec échelle dynamique
  - Champ texte remplacé par dropdown dans Construction > Pratiques et Réglages
  - Peuplé automatiquement avec les niveaux de l'échelle sélectionnée
  - **Fichiers modifiés** : `index.html`, `js/pratiques-materiel.js`, `js/pratiques.js`

- **ORDRE DISCIPLINES DROPDOWN (Beta 95.7)** : Correction ordre 100→600
  - Groupe 400 (Administration) était à la fin, maintenant après 300
  - **Fichier modifié** : `js/wizard-pratique-v2.js`

- **MESSAGE AIDE BIBLIOTHEQUE (Beta 95.7)** : Guide pour édition des pratiques
  - Message ajouté dans les modals bibliothèque (Construction et Réglages)
  - "Pour éditer une pratique, transférez-la d'abord dans la barre latérale..."
  - **Fichiers modifiés** : `js/pratiques-materiel.js`, `js/pratiques.js`

- **VALEURS PAR DEFAUT JETONS (Beta 95.7)** : Ajustement selon usage réel
  - Nombre de jetons par élève : 4 → **2**
  - Durée du délai : 7 → **2 jours**
  - **Fichiers modifiés** : `index.html`, `js/pratiques.js`, `js/pratiques-materiel.js`, `js/pratique-notation-v2.js`, `js/evaluation-jetons.js`, `js/profil-etudiant.js`, `js/pratiques/pratique-pan-specifications.js`

- **MENAGE REPERTOIRE PRINCIPAL (Beta 95.7)** : Réorganisation des fichiers
  - Fusion `archive/` dans `Archives/` (documentation + scripts obsolètes)
  - Fichiers temporaires déplacés vers `Archives/`
  - Documentation utilisateur → `docs/utilisateur/`
  - Fichiers de référence → `docs/references/`
  - Logo et images → `img/`
  - Racine nettoyée : uniquement fichiers essentiels

- **BACKLOG.md CREE** : Fichier dédié pour les tâches à faire
  - Accès rapide en début de session
  - Structure : À faire / Complété
  - Référencé dans CLAUDE.md

- **BACKLOG P2 ENRICHI** : 20 éléments ajoutés à la roadmap
  - **Fichier modifié** : `docs/ROADMAP_H2026.md`
  - **Éléments ajoutés** :
    - Clarifier nombre total d'artefacts (meilleurs vs obligatoires)
    - Persistance données Primo ↔ Mode Expert
    - Valeurs par défaut système de jetons
    - Reprise ciblée - dropdown note maximale
    - Gestion bibliothèques (boutons Supprimer/Dupliquer)
    - Message aide bibliothèque pratiques
    - Document backlog indépendant (BACKLOG.md)
    - Mettre à jour section AIDE + Notes de version
    - Message "Nouveautés de la beta" automatisé
    - Audit db.get() vs db.getSync()
    - Outil vérification intégrité données
    - Audit champs texte → dropdown
    - Consolidation wizard vs pratiques-materiel
    - Système changelog automatisé
    - Checklist tests de régression
    - Étendre aide contextuelle 😎
    - Ordre disciplines dans dropdown (100→600)
    - Mettre à jour liste programmes d'études

- **DROPDOWN DISCIPLINE (Beta 95.6)** : Remplacement du champ texte libre par dropdown
  - Champ "Discipline" dans l'édition d'une pratique (Construction > Pratiques)
  - Même dropdown que Primo avec 6 catégories (100-600)
  - **Fichier modifié** : `index.html`

- **CORRECTION SAUVEGARDE PRATIQUES (Beta 95.6)** : Bug critique corrigé
  - **Symptôme** : Pratiques créées disparaissaient au rechargement de la page
  - **Cause** : Désynchronisation IndexedDB ↔ localStorage
    - Lectures depuis IndexedDB (données anciennes) écrasaient localStorage (données récentes)
    - Wizard ne définissait pas `dansBibliotheque: true` ni `pratiques: ['STD']`
  - **Corrections** :
    - `js/pratiques-materiel.js` : Toutes les lectures utilisent `db.getSync()` (localStorage)
    - `js/pratiques-materiel.js` : Vérification explicite après sauvegarde
    - `js/wizard-pratique-v2.js` : Ajout `dansBibliotheque: true` et `pratiques: [type]`
    - `js/wizard-pratique-v2.js` : Sauvegarde async avec attente IndexedDB
    - `js/wizard-pratique-v2.js` : Rafraîchissement sidebar après création

### Tache precedente (19 janvier)
- **AIDE CONTEXTUELLE 😎 (Beta 95.6)** : Systeme de boutons d'aide en Mode Assiste
  - 15 sections d'aide couvrant toutes les zones critiques de l'application
  - Nouvelle section "Cartouches de rétroaction" (rôle dans les grilles descriptives)
  - Nouvelle section "Reflexion sur les objectifs d'apprentissage"
  - Tutoiement systematique (tu/ton/tes) pour ton chaleureux
  - Ordre de configuration clarifie : Echelles → Pratiques → Grilles → Productions
  - **Fichiers crees** : `js/aide-contextuelle.js`, `js/aide-contextuelle-contenu.js`
  - **Fichiers modifies** : `index.html`, `styles.css`

- **MODULARISATION DESIGN SYSTEM (Beta 95.6)** : Separation en modules
  - 16 modules HTML dans `Design system - Modules/`
  - Index navigable `design-system-index.html`
  - Redirection depuis `DESIGN_SYSTEM.html`
  - Archive du fichier monolithique

- **AUDIT CONFORMITE DS7 (Beta 95.6)** : Corrections styles.css et index.html
  - Border-radius non conformes corriges (3px→5px, 10px→12px, 15px→20px)
  - Box-shadow rgba(0,0,0) remplaces par rgba(3,46,92) via variables CSS
  - Styles inline corriges (border-radius 4px/8px, box-shadow)
  - Rapport d'audit : `docs/AUDIT_CONFORMITE_DS7.md`

- **BADGE NB ETUDIANTS (Beta 95.6)** : Uniformisation affichage
  - Badge "X personne(s)" dans "Indicateurs globaux" et "Étudiant·es inscrit·es"
  - Mise à jour automatique au changement de groupe-cours
  - **Fichiers modifiés** : `tableau-bord-apercu.js`, `trimestre-v2.js`

- **BUG VUE CALENDAIRE (Beta 95.6)** : Calendrier n'affichait pas les bons jours de cours
  - **Symptome** : Groupe Lun-Jeu affichait des cours le mardi, ne changeait pas selon groupe-cours actif
  - **Causes multiples** :
    1. Comparaison case-sensitive `seance.jour` ("lundi") vs `jourSemaine` ("Lundi")
    2. `obtenirSeancesHoraire()` priorisait clé legacy avant entité horaire du groupe-cours
    3. Logique `typeFinal` ne distinguait pas cours-reel vs jour-ouvrable
  - **Corrections** :
    - `js/horaire.js` : Priorité à l'entité Horaire du groupe-cours actif (ordre de recherche modifié)
    - `js/calendrier-vue.js` : Normalisation minuscules + logique typeFinal améliorée
    - `js/saisie-presences.js` : Normalisation minuscules pour filtrage dates
    - `js/presences-apercu.js` : Normalisation dans `calculerTotalSeances()` et `calculerProchaineSeance()`

### Tache precedente (11 janvier)
- **SEPARATION MODAL BIENVENUE (Beta 95.4)** : Deux modals distincts
  - ✉️ Modal News : Nouveautes par version (95.4, 95.3, 95.2, 95.1)
  - 😎 Modal Introduction : Guide de demarrage (Primo, Mode Assiste)
  - Deux boutons dans l'entete (a cote de ⚠️ backup)
  - Contenu Beta 95.1 integre depuis "Docu Pour les testeurs.txt"

- **COMPATIBILITE DONNEES A2025 (Beta 95.5)** : Correction affichage indices
  - **Probleme** : Badge "0 personne" et barres vides pour trimestres anterieurs
  - **Cause 1** : `infoCours` non initialise quand changement de trimestre
  - **Cause 2** : `tableau-bord-apercu.js` lisait directement `.SOM/.PAN` (ancien format)
  - **Corrections** :
    - Auto-selection du premier groupe-cours quand changement trimestre
    - Detection format ancien (SOM/PAN) vs nouveau (pratique unique)
    - Retrocompatibilite complete pour les deux formats
  - **Fichiers modifies** :
    - `js/trimestre-v2.js` : Auto-selection groupe-cours dans `peuplerDropdownGroupeCoursActif()`
    - `js/tableau-bord-apercu.js` : Detection format dans `calculerIndicesEtudiant()`

- **OPTIMISATION INDICES C/P (Beta 95.5)** : Migration IndexedDB + pratique unique
  - **Probleme resolu** : Saturation localStorage avec calcul DUAL SOM/PAN
  - **Solution** :
    - Stockage principal dans IndexedDB (pas de limite de taille)
    - Calcul d'une seule pratique (pratique active du groupe-cours)
    - Structure simplifiee : `{ date, pratique, C, P, E, details }`
  - **Nouvelles fonctions** :
    - `obtenirPratiqueActiveGroupeCours()` dans modes.js
    - `obtenirIndicesCPAsync(da)` pour lecture async
    - `calculerEtStockerIndicesCP()` maintenant async
  - **Retrocompatibilite** : `obtenirIndicesCP(da, 'SOM')` fonctionne toujours
  - **Bug corrige** : db.js memoryCache pour donnees > localStorage
  - **Fichiers modifies** :
    - `js/portfolio.js` : Refonte calcul + nouvelles fonctions lecture
    - `js/modes.js` : obtenirPratiqueActiveGroupeCours()
    - `js/db.js` : Fix memoryCache pour QuotaExceededError

- **BADGE NB PERSONNES** : Ajout et correction du filtrage par groupe-cours
  - **Ajout badge** : "Indicateurs globaux du groupe" affiche maintenant le nombre de personnes
  - **Terminologie** : "etudiant(s)" remplace par "personnes"
  - **Correction filtrage** : Le badge s'ajuste correctement quand on change de groupe-cours
  - **Probleme resolu** : `infoCours.id` utilisait l'ID groupe-cours au lieu de l'ID cours
  - **Probleme resolu** : `db.set` async n'ecrivait pas dans localStorage sature → utilisation `db.setSync`
  - **Suppression duplication** : `changerGroupeCoursActifV2` n'existe plus que dans trimestre-v2.js
  - **Fichiers modifies** :
    - `js/trimestre-v2.js` : Mise a jour directe de `infoCours` avec `db.setSync` + correction `id: gc.coursId`
    - `js/etudiants.js` : Badge dans header "Indicateurs globaux" + terminologie "personnes"
    - `js/modes.js` : Logs DEBUG pour diagnostic (a retirer plus tard)
    - `js/entites-ui.js` : Suppression fonctions dupliquees
    - `index.html` : Ajout span badge + mise a jour versions scripts

### Tache precedente (10 janvier)
- **REDESIGN UX** : Categories Selection/Obligatoires (Beta 95.4)
  - **Separation design/notation** : Champ categorie retire du formulaire Production
  - **Nouveau design** : Deux cartes cote a cote dans Structure des evaluations
    - Carte "Selection (N meilleures)" : nombre a retenir + ponderation + checkboxes
    - Carte "Obligatoires (toujours comptees)" : ponderation + checkboxes
  - **Calcul automatique** : Ponderation unitaire affichee en temps reel
    - Selection : 65% / 4 = 16.25% par production retenue
    - Obligatoires : 35% / 2 = 17.5% par production
  - **Checkboxes exclusives** : Une production ne peut etre que dans UNE categorie
    - Cocher dans Selection → grise dans Obligatoires
    - Indication visuelle quand deja assignee ailleurs
  - **Fichiers modifies** :
    - `index.html` : Nouveau HTML cartes avec checkboxes + retrait champ categorie
    - `js/pratiques-materiel.js` : Nouvelles fonctions checkboxes + calcul unitaire
    - `js/productions.js` : Preserve categorie existante (plus de lecture du champ retire)

- **Tache precedente** : Categories Selection/Obligatoires (implementation initiale)
  - Permet de distinguer des productions "pool" (N meilleures retenues) vs "toujours comptees"
  - **Cas d'usage** : 4 meilleures sur 8 artefacts (65%) + 2 certifications obligatoires (35%)
  - Fonction `calculerNoteAvecCategories()` dans portfolio.js
  - Questions Primo pour configurer les categories

- **Tache precedente** : Mode "Cours" dans le dropdown de l'en-tete
  - Permet de selectionner un cours entier (tous les groupes fusionnes)
  - Format dropdown : `SIGLE (X groupes)` dans section "Cours (tous groupes)"
  - Etudiants de tous les groupes affiches ensemble
  - Statistiques agregees pour le cours complet
  - **Fichiers modifies** :
    - `js/trimestre-v2.js` : `peuplerDropdownGroupeCoursActif()` + `changerGroupeCoursActifV2()`
    - `js/modes.js` : `obtenirEtudiantsCoursActif()` + `obtenirDonneesSelonMode()`
  - **Implementation** :
    - Valeur dropdown avec prefixe `cours:` pour le mode cours
    - Flag `modeCours: true` dans `groupeCoursActif` et `infoCours._modeCours`
    - Filtrage par coursId sans filtre groupe quand mode cours actif
  - **Amelioration** : Option "Cours" visible meme avec 1 seul groupe-cours actif (permet de voir tous les etudiants meme si d'autres groupes sont masques)
  - **Rafraichissement automatique** : Changement de groupe-cours dans l'entete rafraichit la liste des etudiants et reinitialise le filtre Groupe
  - **Suppression dropdown redondant** : L'ancien dropdown cours dans la zone contextuelle est supprime, seul le dropdown "Groupe-cours actif" reste
- **CORRECTIONS DE BUGS** (10 janvier) :
  - **Dropdown pratique de notation** : Utilise maintenant la bonne cle `pratiquesConfigurables` (etait `pratiquesNotation`)
  - **Echelle de performance** : Persiste correctement apres rechargement (ordre de chargement corrige dans pratiques-materiel.js)
  - **Grilles de criteres** : Modifications persistaient pas apres rechargement (synchronisation grilleTemplateActuelle ajoutee)
  - **Fichiers modifies** :
    - `js/trimestre-v2.js` : Cle dropdown pratique corrigee
    - `js/pratiques-materiel.js` : Dropdown echelles charge AVANT remplissage formulaire
    - `js/contexte.js` : Suppression dropdown cours redondant
    - `js/grilles.js` : 4 fonctions synchronisent maintenant grilleTemplateActuelle (modifierCritereGrille, deplacerCritereGrilleHaut/Bas, supprimerCritereGrille)

### Tache precedente (9 janvier)
- **BUG CRITIQUE CORRIGE** : Perte de donnees etudiants (55 → 29)
  - **Symptome** : Import 29 etudiants OK, import 26 de plus OK (55 total), mais dropdown affiche 29
  - **Cause racine** : `db.getSync()` lisait depuis localStorage qui contenait des donnees obsoletes
  - **Solution** : Convertir toutes les fonctions en async avec `await db.get/set` pour lire/ecrire depuis IndexedDB (source de verite)
  - **Fichiers modifies** :
    - `js/trimestre-v2.js` : 8 fonctions converties en async
      - `confirmerImportV2`, `soumettreEtudiantV2`, `supprimerEtudiantV2`
      - `reinitialiserEtudiantsV2`, `supprimerGroupeSelectionneV2`, `sauvegarderGroupeEtudiantsV2`
      - `chargerListeEtudiantsV2`, `filtrerParGroupeV2`, `chargerGroupesCoursV2`
    - `js/modes.js` : Normalisation des groupes pour comparaison ("1" == "00001")
  - **Suppression appels legacy** : `afficherListeEtudiants()` retire de `chargerListeEtudiantsV2`
- **Bouton "Supprimer ce groupe"** : Nouvelle fonctionnalite
  - Permet de supprimer tous les etudiants d'un groupe en un clic
  - Bouton visible uniquement quand un groupe est selectionne
  - Confirmation requise avant suppression
- **Support format Excel** : `="valeur"` maintenant reconnu lors de l'import
- **Section AIDE mise a jour** : Documentation Beta 95.3
  - Carte "Etapes de configuration" : Workflow Beta 95 unifie
  - Carte "Primo" : Integration Section Trimestre + detection config existante
  - Carte "Partage et communs" : Import trimestre precedent + nommage exports
  - Carte "Section Trimestre" : 6 accordeons + syntheses intelligentes
  - Carte "Groupe-cours" : 5 composantes + bibliotheque
- **Audit module evaluation** : 3/3 problemes critiques resolus
  - `docs/modules/AUDIT_EVALUATION.md` : 16 548 lignes analysees
  - Fix #1: Namespacing `evaluationsSauvegardees` (34 occurrences, 7 fichiers)
  - Fix #2: Integration groupe-cours (`groupeCoursId` + logs)
  - Fix #3: Validations references (etudiant/production/grille)
- **Compatibilite A2025** : Verifiee, donnees legacy nettoyees
- **Donnees demo (groupe 9999)** : Bug fusion corrige
- **Protocole mise a jour beta** : Documentation + script automatisation

---

## PROCHAINE TACHE

**Choisir une tache dans le backlog Beta 95.x**

---

## BACKLOG BETA 95.x (A FAIRE)

### Prioritaire (H2026)
- [x] **Separation modal Bienvenue** : Deux modals distincts (FAIT)
  - ✉️ News (nouveautes par version : 95.4, 95.3, 95.2, 95.1)
  - 😎 Introduction (guide demarrage, Primo, Mode Assiste)
  - Contenu Beta 95.1 integre depuis "Docu Pour les testeurs.txt"
- [x] **Systeme modals info 😎 (Mode Assiste)** : Aide contextuelle (FAIT Beta 95.6)
  - 15 sections d'aide couvrant toutes les zones critiques
  - Tutoiement systematique + ordre configuration clarifie
  - Visible uniquement en Mode Assiste
- [x] **Badge nb etudiants (uniformisation)** : Afficher badge "X etudiant(s)" (FAIT Beta 95.6)
  - En-tete "Indicateurs globaux du groupe" (Vue d'ensemble)
  - En-tete "Etudiant·es inscrit·es" (Liste des etudiant·es)
  - Mise a jour automatique au changement de groupe-cours
- [x] **Modularisation design_system.html** : Separation en 16 modules (FAIT Beta 95.6)
  - Index navigable + redirection + archive monolithique
- [x] **Audit conformite Design System v7** : Corrections styles.css et index.html (FAIT Beta 95.6)
  - Border-radius et box-shadow conformes aux specifications
- [ ] **Optimisation page Trimestre** : Performance et UX
- [ ] **Tests export/import metadata CC** : Verifier que les metadonnees CC sont correctement exportees et reimportees
- [ ] **Test securite donnees sensibles** : Audit des donnees stockees (localStorage, IndexedDB)

### Ameliorations rapport de bug (post-testeurs) — FAIT 18 jan 2026
- [x] **Stack trace complet** : Ajouter trace detaillee au lieu de juste fichier:ligne
- [x] **Historique actions recentes** : Capturer les 5-10 dernieres actions (clics, navigation) avant l'erreur
- [x] **Contexte de donnees** : Inclure infos pertinentes selon la section (ex: type de fichier importe, cles localStorage actives)
- [x] **Capture d'ecran integree** : Bouton pour capturer et joindre automatiquement une capture
- [x] **Etat stockage** : Inclure cles localStorage/IndexedDB pertinentes pour la section active

### Archivage trimestre (post-H2026)
- [ ] **Snapshot complet lors archivage** : Figer TOUTES les dependances d'un trimestre
  - Productions (`trimestre_productions`)
  - Grilles de criteres (`trimestre_grilles`)
  - Echelles de performance (`trimestre_echelles`)
  - Cartouches (`trimestre_cartouches`)
  - Pratique de notation (`trimestre_pratiques`)
  - **Objectif** : Garantir consultation des anciens trimestres meme si config evolue
- [ ] **Compatibilite donnees A2025** : Corriger les references cassees
  - Probleme : Evaluations A2025 referencent grilles/echelles supprimees
  - Cause : Productions/grilles/echelles modifiees pour H2026
  - Impact : Notes non calculees pour A2025
  - Solution : Reconstruire les metadonnees ou accepter perte partielle
- [ ] **Message groupe-cours manquant** : Quand aucun groupe-cours pour un trimestre
- [ ] **Pratique de notation fallback** : Utiliser defaut si pratique configuree n'existe plus

---

## DECISIONS RECENTES

| Decision | Date | Raison |
|----------|------|--------|
| Mode Cours (tous groupes) dans dropdown | 10 jan | Suivre plusieurs groupes simultanément |
| Migration massive variables CSS | 9 jan | Maintenabilite + coherence |
| Modularisation code reportee a Beta 96 | 8 jan | Priorite = stabilite pour H2026 |
| Garder tout dans trimestre-v2.js | 8 jan | Structure donnees deja modulaire |
| Design System v7 | 8 jan | Harmonisation border-radius 12px/6px |

---

## BACKLOG BETA 95.x (COMPLETE)

### Prioritaire (fait)
- [x] Valider import/export (Productions, Grilles, Echelles, Cartouches, Pratiques)
- [x] Connexion calendrier avec groupe-cours
- [x] Saisie des presences avec groupe-cours actif
- [x] Migration variables CSS (box-shadow, border-radius)

### Plus tard
- [x] **Bug trimestre par defaut** : Resolu - detection et correction auto si plusieurs trimestres actifs
- [x] **Incoherence profil enseignant** : Resolu - liste unifiee `enseignants` (migration auto de profilEnseignant)
- [x] **Bouton supprimer groupe-cours** : Deja implementé (bouton dans formulaire + liste)
- [x] **Modal bibliotheque groupe-cours** : Vue liste avec Activer/Supprimer (Beta 95.3)
- [x] **Affichage dropdown groupe-cours** : "Groupe 00001" au lieu de "??? gr.00001"
- [x] Optimiser utilisation de l'espace (limiter scrolling vertical)
- [x] Revoir design page Trimestre (harmonisation complete)
- [x] Compatibilite page Trimestre avec wizard Primo (dropdown pratique ajoute)
- [x] Creer protocole de mise a jour des beta (docs/operations/ + scripts/)
- [x] Auditer module evaluation (3/3 problemes critiques resolus)
- [x] Syntheses intelligentes dans sidebars (5 fonctions Beta 95.3)
- [x] **Filtres par discipline/cours** : Deja implementes dans Grilles, Echelles, Productions
- [x] **Import par trimestre filtrable par cours** : Section + filtre cours + preview (Productions)
- [x] **UX modal Echelles** : Section "Importer depuis un autre trimestre" ajoutee
- [x] **Filtres discipline Echelles/Grilles** : Capture auto discipline depuis infoCours
- [x] **Harmoniser largeur modaux** : Tous a 800px (cours 900→800, groupe-cours 700→800)
- [x] **Nommage fichiers export** : Fonction genererNomFichierExport() standardisee
- [x] **Audit design global** : 16 parties verifiees, toutes conformes

### Compatibilite et donnees
- [x] Assurer compatibilite donnees A2025 avec modifications au code
- [x] Tester l'application avec les donnees A2025
- [x] Assurer la fonctionnalite des donnees demo (groupe 9999)

---

## FICHIERS CLES MODIFIES (9 janvier)

| Fichier | Modification |
|---------|--------------|
| `js/groupe.js` | **FIX CRITIQUE** : Perte donnees etudiants + format Excel ="valeur" |
| `js/trimestre-v2.js` | Bouton supprimer groupe + reset dropdown + format Excel |
| `index.html` | Bouton "Supprimer ce groupe" + Section AIDE |
| `js/cc-license.js` | Fonction genererNomFichierExport() standardisee |
| `js/echelles.js` | Import trimestre + discipline auto + nommage export |
| `js/grilles.js` | Discipline auto + nommage export |
| `js/productions.js` | Filtre cours import + nommage export |
| `js/cours.js` | Modal 800px (etait 900px) |
| `js/evaluation.js` | Namespacing evaluationsSauvegardees via cle() |
| `js/evaluation-jetons.js` | Namespacing evaluationsSauvegardees via cle() |
| `js/portfolio.js` | Namespacing evaluationsSauvegardees via cle() |
| `js/snapshots.js` | Namespacing evaluationsSauvegardees via cle() |
| `js/donnees-demo.js` | Fix fusion demo - syncToLocalStorageCache() avant cle() |
| `docs/modules/AUDIT_EVALUATION.md` | Documentation audit module evaluation |

---

## RAPPELS CRITIQUES

### Architecture
- **Single Source of Truth** : Chaque donnee a UNE source unique
- **Namespacing** : Utiliser `cle('nomCle')` pour cles localStorage
- **Priorite testeurs** : Les retours utilisateurs passent AVANT le backlog

### Design System v7
- Conteneurs : `border-radius: var(--radius-grand)` (12px)
- Petits elements : `border-radius: var(--radius-moyen)` (6px)
- Box-shadow : 5 niveaux (subtil, normal, prononce, fort, inset)

### Zones protegees
- `js/config.js` - Ne pas modifier
- `js/navigation.js` - Ne pas modifier
- `noms_stables.json` - Ne pas modifier

---

## HISTORIQUE RECENT

### 31 janvier 2026
- **#48 SYNCHRONISATION MULTI-APPAREILS** : Export/Import MacBook ↔ iPad fonctionnel
  - Auto-cochage cases données personnelles quand "C'est ma propre sauvegarde" coché
  - Préservation IDs originaux (pratiques, grilles, échelles, productions)
  - Import données calendrier (cadreCalendrier, horaireHebdo, bornesTrimestre)
  - Test réussi : 146 clés exportées, 68 éléments importés sur iPad
  - **Fichier** : `js/import-export.js`
- **#55 PRATIQUES CONFIGURABLES** : Correction chargement depuis registre
  - Nouvelle fonction `construireConfigComplete()` normalise formats wizard vs legacy
  - Chargement échelle par ID depuis `echellesTemplates`
  - Fallback échelle IDME par défaut
  - **Fichier** : `js/pratiques/pratique-registre.js`
- **MODAL MIGRATION DÉSACTIVÉ** : Détection automatique données modernes
  - `detecterDonneesLegacy()` vérifie présence clés namespacées
  - Marque auto `migrationLegacyEffectuee=true` si données modernes détectées
  - **Fichier** : `js/migrations.js`
- **SCRIPT NETTOYAGE** : Nouveau `scripts/nettoyage-cles.js`
  - 3 étapes interactives pour supprimer clés obsolètes
  - 48 clés nettoyées (tests, migrations, snapshots anciens)
- **COMMITS** : 309be1c, 4e75c0e (Build 0131-1510)

### 25 janvier 2026
- **IMPORT HISTORIQUE A2024** : Archivage complet du trimestre Automne 2024
  - Import retroactif des donnees historiques (session de developpement initial)
  - 55 etudiants, 2 groupes, 14 artefacts + 1 analyse finale
  - 750 evaluations (700 artefacts + 50 analyses finales)
  - 1650 presences importees
  - Echelle IDME A2024 creee dans bibliotheque (I=40%, D=65%, M=85%, E=100%)
  - Pratique de notation : 6 recents (60%) + Analyse finale (40%)
  - Analyse finale : 5 criteres (Structure 15%, Rigueur 20%, Plausibilite 10%, Nuance 25%, Francais 30%)
  - Correction tri "recents" : par numero de production (pas par date d'evaluation)
  - Scripts d'import et diagnostic dans `docs/A2024/`
  - Documentation complete dans `docs/A2024/README.md`
  - Trimestre archive en lecture seule
  - **Fichiers modifies** : `js/portfolio.js`, `js/profil-etudiant.js`

### 24 janvier 2026
- **NETTOYAGE DOUBLON GROUPE-COURS** : Groupe 1 de A25 retire de H26 (correction donnees via console)
- **CORRECTION AFFICHAGE TABLEAU DE BORD** : Messages "en attente" et patterns/RaI incoherents
  - Trimestre archive A25 : Moyennes affichees sans message "en attente" contradictoire
  - H26 sans evaluations : Message "En attente de donnees" au lieu de "100% blocage critique"
  - Corrections dans `genererBarreDistribution()`, `afficherPatternsApprentissage()`, `afficherNiveauxRaI()`
  - Fichier : `js/tableau-bord-apercu.js`

### 23 janvier 2026
- **BUG ANONYMISATION #2 CORRIGE** : Liste etudiants vide en mode anonymise
  - Cause : Comparaison groupe anonymise (`AN.00001`) vs groupe reel (`00001`) dans `obtenirEtudiantsCoursActif()`
  - Fix : Ajout `groupeReel` dans `anonymiserDonnees()` + utilisation dans le filtrage (modes.js)
- **BUG ANONYMISATION #1 CORRIGE** : "Eleve introuvable" lors du changement de mode (anonymisation)
  - Cause : Incoherence entre `filtrerEtudiantsParMode` et `obtenirEtudiantsCoursActif()`
  - Fix : Utiliser `obtenirEtudiantsCoursActif()` dans `rafraichirContenuSelonMode()` (modes.js)
- **DIAGNOSTIC DONNEES A25** : Corrections multiples pour rendre le trimestre A2025 fonctionnel
  - Mismatch coursId corrige pour etudiants (30), evaluations (305), presences (941), productions (11)
  - Pratique `pan-standards-bruno` → `pan-standards` (built-in)
  - Cache indicesCP nettoye (ancien format incompatible)
  - Configuration `affichageTableauBord.afficherAlternatif: true` ajoutee
  - Resultat : Tableau de bord A25 affiche tous les indicateurs (A, C, P, E, patterns, RaI)
- **CORRECTION FILTRAGE PRESENCES** : Presences et calcul A maintenant filtres par groupe-cours actif
  - Corrige la contamination croisee entre groupes (ex: groupe 2 affichait les donnees du groupe 8)
  - `chargerGroupesPresences()`, `chargerTableauPresences()`, `sauvegarderToutesPresences()` utilisent maintenant `obtenirEtudiantsCoursActif()`
  - Calcul moyenneA filtre les presences par `coursId`
  - **Fichiers** : `js/saisie-presences.js`, `js/etudiants.js`
- **CORRECTION DROPDOWN TRIMESTRE** : Synchronisation correcte apres changement
  - Le dropdown affiche maintenant le bon trimestre actif
  - Nettoyage automatique des doublons dans la liste des trimestres
  - Trimestre Demo masque en Mode Normal (visible seulement en Mode Assiste)
  - **Fichiers** : `js/trimestre-v2.js`, `js/trimestres.js`
- **BACKLOG #32 AJOUTE** : Refonte architecture groupe Demo planifiee
  - Concept : Demo devient un "bac a sable" accessible en Mode Assiste
  - Plus de switch de trimestre, mais switch de MODE
  - Prerequis : Documentation complete avant codage

### 21 janvier 2026
- **BUG CRITIQUE CORRIGÉ** : Données A2025/Démo inaccessibles après changement de trimestre
  - **Symptôme** : Aucun résultat, aucun élève, aucun travail affiché pour trimestres autres que H2026
  - **Causes multiples** :
    1. `changerTrimestreActif()` ne mettait pas à jour `window.trimestreActif`
    2. `groupesCours` et `horaires` manquaient dans `CLES_NAMESPACEES`
  - **Impact** :
    - Les modules lisaient l'ancienne valeur de `window.trimestreActif`
    - `cle('groupesCours')` retournait `'groupesCours'` au lieu de `'a2025_groupesCours'`
  - **Fix** :
    - Ajout `window.trimestreActif = id;` dans `changerTrimestreActif()`
    - Ajout `'groupesCours'` et `'horaires'` à `CLES_NAMESPACEES`
  - **Fichier** : `js/trimestres.js`

- **EXPORT PDF GRILLES DESCRIPTIVES (#30)** : Améliorations mise en page
  - Nouvelle disposition : cours/trimestre en haut à droite, enseignant en bas à gauche
  - Fonctions refactorisées selon SST de trimestre-v2.js
  - Options simplifiées (retrait option Cours du pied de page, taille fixe "petit")
  - Marges réduites à 0.5 inch
  - Bug en cours : infos cours/enseignant non affichées (à déboguer)

### 20 janvier 2026
- **EXPORT PDF GRILLES DESCRIPTIVES (#30)** : Première version fonctionnelle
  - Formulaire 2 étapes : sélection contenu → aperçu mise en page
  - Options : orientation, taille police, pied de page personnalisable (enseignant, cours, licence CC)
  - Titre inclut l'activité d'apprentissage (production.description)
  - Fichiers : export-pdf.js, index.html (modal aperçu)
- **DROPDOWN NOTE MAXIMALE (Beta 95.7)** : Reprise ciblée avec échelle dynamique
  - Champ texte → dropdown peuplé selon l'échelle de l'utilisateur
  - Fonctions : `peuplerDropdownNoteMaximaleMat()`, `peuplerDropdownPlafondNoteCiblee()`
- **ORDRE DISCIPLINES DROPDOWN** : Groupe 400 déplacé à la bonne position (après 300)
- **MESSAGE AIDE BIBLIOTHEQUE** : Guide pour édition des pratiques ajouté aux modals
- **VALEURS PAR DEFAUT JETONS** : Jetons par élève 4→2, Durée délai 7→2 jours
- **BACKLOG.md** : Fichier dédié créé pour accès rapide aux tâches
- **BACKLOG P2 ENRICHI** : 20 éléments ajoutés à docs/ROADMAP_H2026.md
  - Fiabilité : audit db.get/getSync, outil intégrité données
  - UX : clarifier artefacts, persistance Primo/Expert, dropdowns, gestion bibliothèques
  - Maintenance : changelog automatisé, checklist régression, section AIDE
  - Données : programmes d'études, ordre disciplines
- **CORRECTION SAUVEGARDE PRATIQUES** : Bug critique corrigé
  - Pratiques disparaissaient au rechargement (désync IndexedDB/localStorage)
  - Fix dans pratiques-materiel.js et wizard-pratique-v2.js
- **DROPDOWN DISCIPLINE** : Champ texte remplacé par dropdown (6 catégories)

### 19 janvier 2026
- **AIDE CONTEXTUELLE 😎** : Systeme complet de boutons d'aide en Mode Assiste
  - 15 sections : evaluations, construction (grilles, echelles, cartouches, productions, pratiques), tableau de bord, presences, reglages
  - Nouvelle section "Reflexion sur les objectifs d'apprentissage" (avant creation grilles)
  - Tutoiement systematique pour ton chaleureux et accessible
  - Ordre de configuration clarifie : Echelles → Pratiques → Grilles → Productions
  - Fichiers : aide-contextuelle.js, aide-contextuelle-contenu.js
- **MODULARISATION DESIGN SYSTEM** : Separation en 16 modules HTML
  - Index navigable design-system-index.html
  - Redirection depuis DESIGN_SYSTEM.html
  - Archive du fichier monolithique (4000+ lignes)
- **AUDIT CONFORMITE DS7** : Corrections styles.css et index.html
  - Border-radius : 3px→5px, 10px→12px, 15px→20px (utilisation variables CSS)
  - Box-shadow : rgba(0,0,0) → rgba(3,46,92) via variables CSS
  - Styles inline corriges (border-radius 4px/8px)
  - Rapport : docs/AUDIT_CONFORMITE_DS7.md
- **BADGE NB ETUDIANTS** : Uniformisation dans Vue d'ensemble et Liste
  - Mise à jour automatique au changement de groupe-cours (tableau-bord-apercu.js, trimestre-v2.js)
- **BUG VUE CALENDAIRE** : Calendrier n'affichait pas les bons jours selon groupe-cours actif
  - Causes : (1) Comparaison case-sensitive, (2) Ordre priorité dans obtenirSeancesHoraire(), (3) Logique typeFinal
  - Corrections : horaire.js (priorité entité), calendrier-vue.js (logique améliorée), saisie-presences.js, presences-apercu.js

### 11 janvier 2026
- **Separation modal Bienvenue** : Deux modals distincts ✉️ News / 😎 Introduction
- **Optimisation indices C/P** : Migration IndexedDB + calcul pratique unique
- **Compatibilite A2025** : Detection format ancien/nouveau + auto-selection groupe-cours
- **Fix db.js** : memoryCache pour QuotaExceededError

### 10 janvier 2026
- **Mode "Cours" dans dropdown entete** : Voir tous les groupes fusionnes d'un cours
  - Section "Cours (tous groupes)" dans le dropdown
  - Format : `SIGLE (X groupes)`
  - Filtrage par coursId sans filtre groupe
  - Flag `_modeCours` et `groupe: null` pour detecter le mode
- **FIX Grilles de criteres** : Modifications ne persistaient pas apres rechargement
  - Cause : grilleTemplateActuelle n'etait pas synchronisee apres modification inline
  - Solution : Synchroniser grilleTemplateActuelle dans 4 fonctions (modifierCritereGrille, deplacerHaut/Bas, supprimer)

### 9 janvier 2026
- **BUG CRITIQUE CORRIGE** : Perte donnees etudiants lors import/suppression
  - Cause : obtenirDonneesSelonMode() filtrait par coursId puis sauvegarderDonneesSelonMode() ecrasait TOUT
  - Fix : db.getSync() direct dans groupe.js (confirmerImport, supprimerEtudiant)
- **Bouton "Supprimer ce groupe"** : Permet de supprimer un groupe entier avec confirmation
- **Support format Excel** : `="valeur"` reconnu lors de l'import etudiants
- **Section AIDE mise a jour** : Documentation Beta 95.3 (workflow, Primo, import trimestre)
- **Modal bibliotheque groupe-cours** : Vue liste, Activer, Supprimer, bouton 📚
- **Syntheses intelligentes sidebars** : 5 fonctions (Cours, Enseignant, Groupe, Horaire, Groupe-cours)
- **Libelle dropdown groupe-cours** : "Groupe 00001" au lieu de "??? gr.00001" (5 endroits)
- **UX modal Echelles** : Section "Importer depuis un autre trimestre" (3 fonctions)
- **Import Productions filtrable par cours** : Dropdown filtre cours + preview
- **Harmonisation modaux** : Tous a 800px (cours, groupe-cours)
- **Nommage exports** : genererNomFichierExport() type-nom-cours-discipline-date
- **Filtres discipline** : Auto-capture depuis infoCours (echelles, grilles)
- **Audit module evaluation** : 16 548 lignes, 3 problemes critiques identifies et resolus
- **Fix #1 namespacing evaluationsSauvegardees** : 34 occurrences, 7 fichiers
- **Fix #2 integration groupe-cours** : groupeCoursId ajoute aux evaluations + logs
- **Fix #3 validations references** : Verification etudiant/production/grille avant sauvegarde
- **Compatibilite A2025** : Verifiee, donnees legacy nettoyees
- **Donnees demo (groupe 9999)** : Bug fusion corrige (sync cache avant cle())
- **Protocole mise a jour beta** : Documentation + script automatisation
- **Audit Design System v7 COMPLET** : 16 parties verifiees, toutes conformes

### 8 janvier 2026
- Consolidation entites-ui.js → trimestre-v2.js
- Correction dropdown groupe-cours (namespacing)
- Harmonisation design section Trimestre
- Persistance groupe-cours et horaire au rechargement
- Bouton suppression horaire + simplification UI
- Bouton "Voir le calendrier" dans sidebar groupe-cours
- Connexion presences avec groupe-cours (filtrage par coursId dans saisie-presences.js)
- Primo dynamique : detection config existante (enseignant, cours, trimestre)
- Correction bug Primo : creerGroupeCoursDepuisPrimo() pour que le dropdown fonctionne
- **5 dropdowns groupe-cours** : Trimestre, Cours, Groupe, Horaire, Enseignant selectionnables
- **Multi-profils enseignants** : Liste unifiee `enseignants` avec dropdown, boutons nouveau/supprimer
- Migration automatique profilEnseignant → enseignants au chargement
- **Alignement SST Primo/Trimestre** : obtenirCoursExistants() utilise listeCours + filtrage trimestre
- **Fix discipline cours** : sauvegarderCoursV2() + remplirFormCoursV2() corriges
- **Fix affichage cours** : chargerDropdownCoursV2() appelle changerCoursSelectionneV2()

### 6-7 janvier 2026
- Corrections bugs testeurs (Bruno, Olivier)
- Systeme de notification automatique
- Architecture modulaire Trimestre

### 24-27 decembre 2025
- Multi-trimestres avec namespacing
- Archivage automatique trimestres termines

---

## CONTACTS TESTEURS

| Testeur | Discipline | Derniers retours |
|---------|------------|------------------|
| Bruno V. | Chimie organique | 6 jan (bugs corriges) |
| Olivier L. | Geographie | 6 jan (bugs corriges) |

---

## LIENS UTILES

- `docs/00-START-HERE.md` - Point d'entree documentation
- `docs/ROADMAP_H2026.md` - Feuille de route et backlog
- `Design system - Modules/AUDIT_V5.md` - Reference design
- `Documentation/Changelogs/BETA_95_CHANGELOG.md` - Notes de version

---

**Derniere mise a jour** : 31 janvier 2026
