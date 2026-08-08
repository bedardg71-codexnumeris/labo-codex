# Audit qualité — 5 août 2026 (session autonome, rejoint « audit blanc »)

> **Référence** : `plans de travail/_archives/AUDIT-2026-08-05-consigne.md`. Audit en LECTURE SEULE
> des 4 modules dans l'ordre de risque (import-export → trimestre-v2-* → db.js →
> planification-*). Chaque trouvaille a passé la vérification adverse (tentative de
> réfutation par lecture des appelants, grep des garde-fous, contraste avec le code
> frère) avant d'être consignée. **CONFIRMÉ** = reproduit par sonde ou lecture complète
> du chemin ; **PLAUSIBLE** = non réfuté, non reproduit. Les propositions sont **sans
> numéros d'items** : Grégoire trie au retour, puis versement au BACKLOG.
> Seule écriture de code de la session : le correctif pré-approuvé `meta.duree`
> (sentinelle break-testée ROUGE→VERT, détail en fin de rapport).

## Sommaire exécutif

Quatre trouvailles rouges, toutes CONFIRMÉES par lecture complète du chemin : (1) modifier
la session/année du trimestre actif orpheline TOUTES ses données namespacées (aucune
migration n'existe, bloc prévu vide) ; (2) l'import sélectif écrase les clés calendrier
(cadre, journées sans cours…) SANS case à cocher ni garde collègue — même quand rien
n'est coché ; (3) créer+activer un nouveau trimestre laisse l'identification affichée sur
l'ancien, et un « Enregistrer » ensuite déclenche (1) avec collision d'id ; (4) les notes
de leçon (`planification_seances`) sont indexées par un id unique seulement PAR carte →
notes aliassées/écrasées entre cartes, à trancher AVEC la migration de la clé nue, pas après.

---

## Module 1 — `js/import-export.js` (lu en entier, 3365 lignes)

### A1 🔴 CONFIRMÉ · Import sélectif : clés calendrier écrasées sans consentement
`executerImportSelectif`, `js/import-export.js:2994-3011`. Le bloc `clesCalendrier`
(cadreCalendrier, calendrierComplet, journeesSansCours + anciens noms, seancesCompletes,
horaireHebdo, variantes namespacées) est écrit par `db.set` **inconditionnellement** :
aucune case dans la modale, aucun `isChecked`, aucun `bloquerDonneesPerso`. Le compteur
`nbCalendrier` n'entre pas dans `total` : si rien n'est coché, l'app affiche « Coche au
moins un élément à importer » alors que le cadre du trimestre est DÉJÀ remplacé.
- **Repro** : export brut d'un poste B (cadre saisi) → poste A : Réglages → Données →
  Importer → sélectionner le fichier → ne rien cocher → Importer → vérifier
  `h2026_cadreCalendrier` remplacé malgré le message.
- **Correctif esquissé** : ligne « Cadre du trimestre (calendrier) » dans la modale +
  gate + inclure au total. **Coût M.**

### A2 🟡 CONFIRMÉ · Sélection de cartouches : n'importe jamais rien
La modale mappe les cartouches en items agrégés sans id (`js/import-export.js:1476`) →
`data-item-id` = `cartouches_0`, `cartouches_1`… ; l'import filtre les cartouches
INDIVIDUELLES par `c.id`/`c.nom` (`:2849-2850`) → aucune ne matche jamais. L'utilisateur
coche « Cartouches », l'import se dit réussi (ou « aucune nouvelle donnée »), zéro
cartouche importée. **Correctif** : porter la clé `cartouches_<grilleId>` dans le
data-item-id et filtrer par grille. **Coût S-M.**

### A3 🟡 CONFIRMÉ · Export ZIP : blobs travaux d'UNE seule clé `fichiersTravaux`
`executerExport` (`js/import-export.js:787`) : `clesSelectionnees.find(...)` — seule la
PREMIÈRE clé fichiersTravaux trouvée alimente les blobs du ZIP. « Toutes les clés » avec
2+ trimestres à travaux → métadonnées des autres trimestres exportées SANS leurs PDF,
perte découverte à la restauration. Symétrique à l'import (`_restaurerBlobsDepuisZip`,
`:1068`). Atténuant : le backup recommandé (codex) couvre tout. **Correctif** : `filter`
au lieu de `find`, boucler sur toutes les clés (export et restauration). **Coût S.**

### A4 🟡 CONFIRMÉ · Blobs restaurés du ZIP sans `validerMagicBytes` (couture)
`_restaurerBlobsDepuisZip` (`js/import-export.js:1076-1080`) stocke via
`travauxStockage.stockerBlob` sans validation de signature — la règle CLAUDE.md est
appliquée sur le chemin codex (`js/codex.js:704-705`) mais pas ici, et `stockerBlob` ne
valide rien lui-même (vérifié). **Correctif** : même garde que codex.js + 1 test
(règle Défense I). **Coût S.**

### A5 🟡 CONFIRMÉ · Modale « configuration complète » : métadonnées injectées sans échappement
`afficherModalPreviewConfigComplete` (`js/import-export.js:1953-1962`) : `meta.nom`,
`meta.auteur`, `meta.discipline.join(', ')`, `meta.niveau`, `meta.description` d'un
FICHIER IMPORTÉ (potentiellement d'un tiers) injectés dans innerHTML sans
`echapperHtml()` — violation de la règle non négociable. CSP bloque le script inline,
l'injection de balises passe (defacement/phishing dans la modale). Bonus : `discipline`
en string (pas array) → TypeError avalé en « Erreur analyse » générique. Le lint F
(baseline par SEUIL) ne détecte pas ces cas hérités. **Correctif** : échapper les 5
champs + garde `Array.isArray` + test. **Coût S.**

### A6 🟡 CONFIRMÉ · Détection de format : « 2026 » codé en dur (bombe janvier 2027)
`detecterFormatConfig` (`js/import-export.js:1213`) :
`c.includes('_') && c.includes('2026')`. Depuis le namespacing (grillesTemplates,
echellesTemplates, pratiquesConfigurables, modalitesEvaluation, cadreCalendrier tous
namespacés — vérifié dans `CLES_NAMESPACEES`), un export récent contient rarement ≥ 2
noms globaux de la liste `clesBrut` : la détection repose de facto sur ce « 2026 ». Dès
des clés `a2027_…`, « Fichier non reconnu » → restauration valide refusée.
**Correctif** : regex `/^[aeh]\d{4}_/` + test avec clés 2027. **Coût S.**

### A7 🟢 CONFIRMÉ · Code mort autour de l'ancien import (zéro-dette)
- `executerImport` + `donneesImportEnAttente` : la variable n'est JAMAIS assignée
  non-nulle (grep exhaustif) → fonction inerte ; le bouton `btnExecuterImport`
  (`index.html:14885`) reste désactivé à vie (l'ancienne modale bascule toujours vers la
  nouvelle). UI + fonction mortes.
- `executerImportVersBibliotheques` (~290 lignes) : 0 appelant — et sa fusion N'ASSAINIT
  PAS (`assainirObjet` absent), dangereuse si rebranchée un jour.
- `analyserRessourcesBibliotheques` : 0 appelant ET buggée (lit `details.pratiques.count`
  au lieu de `details.ressources.pratiques.count` → TypeError si appelée).
- **Correctif** : retirer les trois (+ bouton/modale si seule action morte). **Coût S-M.**

### A8 🟢 · Chemins d'erreur mi-parcours (question de la consigne)
`executerImport`/`executerImportSelectif`/`…LocalStorageBrut` : boucles `db.set`
séquentielles ; échec à mi-course → alert générique + fermeture de la modale. Les clés
déjà écrites RESTENT écrites (pas de rollback), `syncToLocalStorageCache` n'est pas
appelé sur le chemin d'erreur, aucune invite de rechargement → état partiellement
importé, illisible pour l'utilisateur. **Amélioration** : message listant les clés
écrites + inviter à recharger + snapshot préalable (le garde-fou existe côté codex).
**Coût M.**

### A9 🟢 · Divers (dette mineure)
- `verifierUniciteIds` mute en place et peut ré-identifier un item EXISTANT (doublon déjà
  dans la partie existante du tableau fusionné) → références grilleId/echelleId cassées
  en silence. Cas rare. **S.**
- `estCollègue` : deux orthographes du même nom d'enseignant → propre backup traité
  « collègue » → restauration des données perso BLOQUÉE sans contournement (la case
  « C'est ma propre sauvegarde » n'apparaît que si source inconnue). PLAUSIBLE, terrain
  non reproduit ; le codex reste la voie.
- `enseignants` importé par REMPLACEMENT complet (`:2987`) au lieu d'une fusion par
  identité (anti-pattern SKILL_integrite_globaux) — la collection locale est écrasée.
- Conversion tableau sparse → objet à l'export (`:746-758`) change la forme au
  round-trip. Hérité Beta 97.9.
- **Currency #374 : RAS** — `journeesSansCours` + anciens noms acceptés en lecture,
  fusion au boot idempotente (localStorage + memoryCache depuis 1.31.2), aucune
  référence orpheline.

---

## Module 2 — famille `js/trimestre-v2-*.js`

### B1 🔴 CONFIRMÉ · Modifier session/année du trimestre actif orpheline TOUTES ses données
`sauvegarderIdentificationTrimestreV2` (`js/trimestre-v2-init.js:145-161`) : l'id du
registre est réécrit (`trimestres[index].id = id`, `trimestreActif` bascule) mais AUCUNE
clé namespacée (`h2026_groupeEtudiants`, `_productions`, `_evaluationsSauvegardees`…)
n'est migrée — le bloc `if (ancienId !== id) { }` est VIDE, et aucune fonction de
migration n'existe ailleurs (grep). Toutes les données du trimestre « disparaissent »
(restent sous l'ancien préfixe). Aggravant : aucune garde de collision — passer l'actif
sur l'id d'un trimestre EXISTANT crée deux entrées de même id dans le registre. Même
famille que l'incident « cartes perdues » du 4 août ; le point d'entrée est le bouton
« Enregistrer » unique.
- **Repro** : h2026 actif avec étudiants → formulaire Trimestre → session : Automne →
  Enregistrer → liste d'étudiants vide, données toujours sous `h2026_*`.
- **Correctif esquissé** : sur `ancienId !== id`, bloquer avec message si des clés
  existent sous l'ancien préfixe (option sûre) OU migrer les clés (patron connu :
  copie + purge + backup préalable) ; + garde de collision d'id. **Coût M/L.**

### B2 🔴 CONFIRMÉ · Nouveau trimestre activé : identification affichée périmée → corruption en chaîne
`ouvrirModalNouveauTrimestre` (`js/trimestre-v2-liste.js:553-558`) recharge cadre,
journées et stats mais PAS `chargerIdentificationTrimestreV2` — alors que
`changerTrimestreActifV2` le fait (`:440`, avec un commentaire « FIX » prouvant que ce
trou a déjà mordu). Les champs nom/session/année affichent l'ANCIEN trimestre pendant
que le nouveau est actif ; « Enregistrer » (p. ex. pour saisir le cadre) applique alors
B1 : l'id du nouveau trimestre actif est réécrit avec la session/année périmées →
collision avec l'ancien trimestre. **Correctif** : ajouter l'appel manquant dans le bloc
`if (activer)`. **Coût S** (le fond reste B1).

### B3 🟡 CONFIRMÉ · Boutons « Activer » un groupe-cours : `infoCours` jamais mis à jour
`activerGroupeCoursV2` (`js/trimestre-v2-groupes-cours.js:57-81`) et
`activerGroupeCoursDepuisBibliotheque` (`:868-896`) écrivent flags + `groupeCoursActif`
mais pas `infoCours` — l'invariant d'atomicité du couple est pourtant documenté en tête
de `js/trimestre-v2-orchestre.js:25-28`. Leur chaîne de rafraîchissement ne répare que
si le GC actif est invalide, et `obtenirContexteCoursActif` (`js/modes.js:503`) ne
corrige par le flag actif QUE si le coursId matche : activer un GC d'un AUTRE cours
laisse étudiants/présences/évals sur l'ancien cours pendant que l'en-tête affiche le
nouveau. Ne mord qu'en multi-cours — le cas de la rentrée. Aucune vue n'est rafraîchie
non plus. **Correctif** : déléguer les deux boutons à `changerGroupeCoursActifV2(gcId)`.
**Coût S.**

### B4 🟡 CONFIRMÉ · Éditer un étudiant efface son statut (abandon/inactif) et tout champ hors formulaire
`soumettreEtudiantV2` (`js/trimestre-v2-etudiants.js:338-356`) : en édition, l'objet
reconstruit (7 champs) REMPLACE l'existant — `statut` (cf. `estEtudiantExclu`,
`js/main.js:72`) est perdu : corriger une coquille du nom d'un étudiant en abandon le
réintègre en silence dans les moyennes. Second défaut : l'index d'édition est capturé à
l'ouverture ; si la liste change entre-temps, l'écriture par index touche le mauvais
étudiant (le fix « chercher par DA » du 4 fév ne couvre que l'ouverture).
**Correctif** : spread `{ ...etudiants[index], ...champs }` + retrouver l'index par DA à
la sauvegarde. **Coût S.**

### B5 🟡 CONFIRMÉ · Réinitialiser bornes / semaines spéciales : calendrier et stats jamais régénérés
`reinitialiserBornesTrimestreV2` et `reinitialiserSemainesSpecialesV2`
(`js/trimestre-v2-init.js:326-396`) vident champs + cadre mais ne régénèrent pas
`calendrierComplet` et n'appellent ni stats ni avertissements — la sidebar garde
« 15 sem. · 75 jours » après réinitialisation (contraste :
`sauvegarderCadreCalendrierV2` fait les trois). **Coût S.**

### B6 🟡 CONFIRMÉ · `supprimerGroupeCoursV2` : garde morte (objet === string)
`js/trimestre-v2-groupes-cours.js:720-722` compare l'OBJET `groupeCoursActif` à un id
string — jamais vrai (le code frère `:911-913` compare `.id` correctement). Supprimer le
GC actif ne purge pas `groupeCoursActif` ; auto-réparé par le dropdown SAUF en
supprimant le DERNIER groupe-cours → `groupeCoursActif`/`infoCours` pointent un GC
effacé (données fantômes). **Coût S.**

### B7 🟡 CONFIRMÉ · Validation silencieuse de l'identification sous le bouton Enregistrer unique
`js/trimestre-v2-init.js:129-131` : `if (!session || !annee) return;` sans message —
suivie de « Cadre du trimestre sauvegardé », l'utilisateur croit tout enregistré.
**Correctif** : notification d'erreur (comme le cadre) ou zone « À vérifier ». **Coût S.**

### B8 🟢 CONFIRMÉ · Références orphelines à des éléments DOM disparus (code mort silencieux)
`mettreAJourGuideGroupeCours` (`js/trimestre-v2.js:475`, cibles `status-*` absentes
d'index.html, appelé ~8×, contient une clé legacy `seancesHoraire_<id>` jamais
namespacée) ; `mettreAJourApercuGroupeCours` (`js/trimestre-v2-orchestre.js:514`,
`v2-gc-apercu-texte` absent → no-op intégral) ; `changerEnseignantSelectionneV2`
(`:448`, `v2-btnModifierEnseignant`/`v2-apercuEnseignant` absents) ; `v2-totalConges`
(`init.js:355`). Zéro-dette : retirer ou restaurer. **Coût S-M.**

### B9 🟢 · Échappement innerHTML incomplet sur les libellés saisis (famille, avec A5)
Ids échappés mais PAS les noms : `populerDropdownsAssemblageV2`
(`js/trimestre-v2.js:241/265/309/328/352`), `afficherListeTrimestreGestion`
(`liste.js:151`), `peuplerDropdownGroupeCoursActif` (`orchestre.js:104/118`),
`peuplerDropdownEnseignants` (`orchestre.js:436`), `populerDropdownGroupeCoursV2`
(`groupes-cours.js:161`). Noms potentiellement importés (config partagée). Lot mécanique
avec A5/D2. **Coût S.**

### B10 🟢 · Divers
`confirmerEvenementV2` : pas de garde doublon de date ni d'`horaireReprise` orphelin ;
`activerGroupeV2` (etudiants.js:934) mute `infoCours.groupe` hors du couple GC actif
(chemin « compat » à auditer/retirer) ; `_definirInfoCoursModeGroupeCours`
(orchestre.js:235) écrit la clé NUE `seancesHoraire` en plus des namespacées — clé
legacy partagée entre trimestres, même classe que la clé nue de planification, chantier
de dé-doublement à cadrer. **Currency #374/#369 : RAS** (tous les `window.X()` de la
famille résolvent ; zone d'avertissements présente et rafraîchie au bon rythme).

---

## Module 3 — `js/db.js` (lu en entier, 1626 lignes) + call-sites d'énumération

### C1 🟡 CONFIRMÉ · Purge des trimestres orphelins : les clés RESSUSCITENT au boot suivant
`purgerTrimestresOrphelins` (`js/trimestres.js:2382-2399`) supprime par
`localStorage.removeItem` brut — jamais `db.removeSync`. La copie IndexedDB survit et
`syncToLocalStorageCache` réhydrate tout au boot suivant → purge annulée en silence.
`listerTrimestresOrphelins` (`:2349`) ne scanne que localStorage (orphelins en
memoryCache invisibles, tailles sous-estimées). Contraste probant : `supprimerTrimestre`
(`js/trimestres.js:1147-1152`) fait correctement l'union des 3 couches via `db.remove`.
- **Repro** : purger un préfixe orphelin → localStorage vide → recharger → clés de retour.
- **Correctif** : `db.removeSync` + énumération union (patron supprimerTrimestre). **Coût S.**

### C2 🟡 CONFIRMÉ (classe, grep exhaustif) · Énumérations « localStorage seulement » — la leçon du 5 août a d'autres cibles
La bascule silencieuse sur quota fait vivre des clés UNIQUEMENT en memoryCache+IDB ;
corrigé dans `migrations.js` (#374) mais la même supposition survit à :
- `js/import-export.js:3145` (export config complète : cartouches absentes du fichier) ;
- `js/cartouches.js:1607` (`exporterCartouches`) ;
- `js/evaluation.js:303` (lecture des cartouches À L'ÉVALUATION : une banque > 200 Ko
  disparaît de l'UI) ;
- `js/grilles-bibliotheque.js:192`, `js/echelles-bibliotheque.js:183`,
  `js/cartouches-bibliotheque.js:190`, `js/productions-bibliotheque.js:214` (scans
  inter-trimestres des bibliothèques) ;
- `js/trimestres.js:2349` (cf. C1).
Patrons sains à imiter : `js/cours.js:706` (LS∪IDB), `js/travaux-outils.js:786`
(LS∪memoryCache), `migrations.js:881`, `supprimerTrimestre`.
**Correctif structurel** : helper `db.keysSync()` (localStorage ∪ memoryCache) et/ou
`await db.keys()` pour les exports, bascule des sites listés + sentinelle-cliquet
interdisant tout nouveau `Object.keys(localStorage)` hors db.js. **Coût M (mécanique).**

### C3 🟡 PLAUSIBLE · `setSync` avant `db.ready` : écriture IndexedDB silencieusement sautée
`js/db.js:1221/1264` : `idbDispo = this.ready && this.useIndexedDB` — un `setSync` émis
avant la fin de `db.init()` (au parse d'un module) n'atteint JAMAIS IndexedDB : la clé
ne vit qu'en localStorage, invisible à `db.keys()` (modale d'export = liste IDB seule),
préservée seulement parce que le nettoyage préventif ne retire que les clés présentes en
IDB. Auto-guérison partielle à la première lecture ASYNC (`_getIndexedDB:238-243`),
jamais pour une clé lue en getSync seul. Non reproduit (la plupart des écritures
attendent db-ready). **Correctif** : file d'attente rejouée à l'init (ou warn). **Coût S-M.**

### C4 🟢 · `db.get()` ignore memoryCache — lecture async potentiellement périmée
`js/db.js:212-222` : après un `setSync` d'une grosse clé (memoryCache à jour, commit IDB
pendant), `await db.get(cle)` peut rendre l'ancienne valeur. Chemin réel :
`executerExport` lit tout via `db.get` sans `db.flush()` préalable. Course étroite.
**Correctif** : memoryCache d'abord dans `get()` et/ou `flush()` en tête d'export. **Coût S.**

### C5 🟢 CONFIRMÉ · Registre `_SSOT_OWNERS` périmé (mode dev seulement)
`js/db.js:1599-1624` : `groupeEtudiants`→trimestre-v2.js (réel :
trimestre-v2-etudiants.js), `cadreCalendrier`→trimestre.js (réel : trimestre-v2-init.js),
`groupeCoursActif`→trimestre-v2.js (réel : orchestre + groupes-cours) ;
`journeesSansCours` absent. À réaligner avec DATA-OWNERSHIP. **Coût S.**

### Constats sains (module 3)
Durabilité A/B/C cohérente partout (commit `oncomplete`, _pendingWrites, flush, drainage
visibilitychange/pagehide) ; garde #340 fail-open avec pile de l'écrivain ; seuil
IDB-first unique ; #353 Option 1 fidèle à sa promesse (mesure sans changement
d'écriture, purge dry-run couvrant memoryCache) ; invalidation préventive #300 sans
perte pour les clés localStorage-seules ; réparation double-stringify sans faux positifs
primitifs.

---

## Module 4 — famille `js/planification-*.js`

### D1 🔴 CONFIRMÉ · Notes de leçon aliassées entre cartes : ids uniques PAR CARTE, dictionnaire PLAT
Ids de nœuds = `'planif-noeud_' + (++etat.compteur)` avec compteur PAR CARTE
(`js/planification-carte.js:864/1485`) ; notes/objectifs/choix d'activités indexés par
id de leçon SEUL dans `planification_seances` (`:3559-3565`, `:5317-5320`) — clé déjà
partagée entre trimestres et démo (diagnostic du 4 août), donc AUSSI entre cartes.
Conséquences : la leçon `planif-noeud_7` de la carte B affiche et écrase les notes de la
`planif-noeud_7` de la carte A ; `supprimerNoeud` (`:1291-1352`) ne purge jamais
l'entrée → une nouvelle leçon à id recyclé HÉRITE des vieilles notes ; l'import
inter-trimestre préserve les ids (voulu) → la carte importée aliase les leçons
homonymes, et `copierSeancesLecons` (« sans écraser ») IGNORE silencieusement les notes
importées si l'id est pris par une autre carte.
- **Point de décision** : la migration de la clé nue par trimestre NE règle PAS la
  collision entre cartes d'un même trimestre. La clé devrait devenir composite
  (`carteId + leconId`) avec migration des entrées existantes — à trancher AVEC la
  migration de la clé nue, pas après.
- **Repro** : carte A, noter l'id d'une leçon, écrire une note ; carte B, créer des
  nœuds jusqu'au même id de leçon → sa vue leçon affiche la note de la carte A.
- **Coût M** (clé composite + migration one-shot + sentinelle).

### D2 🟡 CONFIRMÉ · Titre de nœud injecté brut dans innerHTML (3 chemins) + attributs value= non coercés
`js/planification-carte.js:1512` (clonage ⌥) et `:2418/:2431` (rendu au CHARGEMENT de
carte) injectent `n.titre` sans `echapperHtml` — le site jumeau `:2406` et le sommaire
(`:5085-5096`) échappent. Titre = texte utilisateur persistant, potentiellement importé
(bibliothèque partagée) : du HTML stocké est re-parsé à chaque chargement. Même famille :
`js/planification-bibliotheque.js:545` (`c.nom` + `data-param` bruts) ; inspecteur
`:1057/:1059` (`metadata.semaineDebut/semaineFin` bruts dans `value=` — MÊME patron que
`meta.duree` corrigé ce jour, non couverts par la pré-approbation). **Correctif** :
échapper les 4 sites + coercition parseInt sur les 2 semaines (extension de la
sentinelle livrée). **Coût S.**

### D3 🟢 · Écart doc↔code : ordre spatial du sommaire
SESSION.md (1.28.0) annonce « leçons en ordre spatial (x puis y) » ; le code trie les
séquences par y seul (`:4950`) et les leçons par ordre du tableau enfants (maintenu par
y au layout, `:2126/:2203`) — aucun tri x-puis-y (grep). Doc en avance ou tri perdu ; le
comportement actuel est cohérent pour des colonnes verticales. À trancher.

### D4 🟢 · Divers
`supprimerCarte` (planification-donnees.js:91) ne purge pas les entrées seances de ses
leçons (absorbé par D1) ; `planification-bibliotheque.js:557` code le namespacing en dur
au lieu de `cleSource()` ; garde-fou carte active (#261) et réparation d'intégrité
parent/enfants au chargement (`:2534-2535/:2619-2631`) : sains. Patron Brique C de
l'import inter-trimestre respecté côté carte (deep-clone, source intouchée, trace
importeDe).

---

## Correctif livré (seule exception pré-approuvée)

`js/planification-carte.js:1010` — l'inspecteur injecte désormais
`parseInt(meta.duree, 10) || ''` dans le `value=` de l'input durée (métadonnée
persistée, potentiellement importée). Sentinelle
`tests/unit/sentinelle-inspecteur-duree-coercition.test.js` (patron coercé présent +
patron brut absent), **break-testée** : VERT → retrait du correctif → ROUGE 2/2 sur les
bonnes assertions → restauration → VERT. Vitest complet : 1297/1297.

## Limites de l'audit (P6)

- Aucune trouvaille reproduite EN NAVIGATEUR (session cloud, WebKit absent ; Chromium
  disponible mais non utilisé — arbitrage temps au profit de la couverture) : les
  CONFIRMÉ le sont par lecture complète du chemin, pas par sonde d'exécution, sauf le
  break-test de la sentinelle livrée.
- `js/planification-carte.js` (5415 lignes) audité par ciblage (ids, seances,
  suppression, injection, inspecteur, sommaire), pas en lecture intégrale ; idem
  `trimestre-v2-cours/horaires/enseignants` (balayage par motifs à risque).
- `estCollègue` (A9) et C3 restent PLAUSIBLES : non reproduits.
- Les modules hors périmètre croisés en chemin (evaluation.js, cartouches.js,
  bibliothèques) n'ont été lus qu'aux sites cités.
