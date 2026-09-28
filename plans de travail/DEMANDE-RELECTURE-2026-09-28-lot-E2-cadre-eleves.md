# Demande de relecture – lot E2 de l'enregistrement, zone Cadre et étudiant·es (D3) : relecture finale

> Écrite le 28 septembre 2026 par Claude Code, pour Cowork. **Demande finale** : les six étapes sont faites, le banc WebKit du lot et le placement aussi. Elle remplace le compte rendu d'étape (`4d282162`), auquel tu as répondu dans `RELECTURE-2026-09-28-lot-E2-etapes-1-a-5.md` (non suivi sur `main`) ; tes décisions y sont appliquées (§ 3). Branche locale `lot-e2-cadre-eleves`, worktree `.claude/worktrees/lot-e2-cadre-eleves`, rebasée sur `main` = `53adedfd`. Consigne : `plans de travail/CONSIGNE-DU-JOUR.md`.

## 1 · Ce que le lot change

| Étape | Commit | S'enregistre tout seul (fiche existante) | Le geste qui crée | Aussi |
|---|---|---|---|---|
| 1 · Trimestre | `0b28c6ab` | le nom ; la session et l'année **ensemble** ; les huit dates | « Créer le trimestre » (aucun trimestre actif) | bouton « Enregistrer » retiré ; réinitialiser bornes / semaines et journées sans cours par le témoin |
| 2 · Profil enseignant | `3a9cbad6` | les sept champs (trois n'avaient AUCUN enregistrement) | « Créer le profil » | « Fermer » ; carte de synthèse = ce qui est écrit |
| 3 · Cours ou service | `ac768698` | les neuf champs, nature et pondération comprises | « Créer le cours » / « Créer le service » | « Fermer » ; question avant qu'un cours devienne service |
| 4 · Horaire | `3e736dbb` | nom, groupe, nombre de séances, chaque champ de séance | « Créer l'horaire » | « Fermer » ; défauts de séance posés explicitement |
| 5 · Groupe-cours | `3803df98`, `6943a8c2` | les six sélections | « Créer le groupe-cours » | « Fermer » ; la reprise d'un cours attend la création |
| 6 · Étudiant·e | `01ea62d0` | les sept champs d'une fiche ouverte par « Modifier » | « Ajouter l'étudiant·e » (gardé, décision de Grégoire) | « Fermer » ; supprimer, statut, import, vider, supprimer un groupe par le témoin |

**Mécanismes repris du lot E1** : le témoin commun (`sauvegarderDonneesSelonMode` pour le Cadre, synchrone ; `modifierEtAnnoncer` pour les fiches d'étudiant·e, qui passaient déjà par la file) ; la question « … n'est pas encore créé. » de `ui-dialogues.js`, « Rester » / « Quitter sans créer » ; la fiche en création déclarée au `beforeunload` commun ; `raisonPourTemoin`. **Trois ajouts**, nommés :
- `quitterCreationSiConfirme(genre, titre)` : le titre du cours dépend de la fiche (« Ce cours » / « Ce service », depuis `mots-nature.js`) ; `QUITTER_SANS` porte « Quitter sans ajouter » (étudiant·e).
- `ecrireEtAnnoncer` (`modes.js`) : le pendant de `modifierEtAnnoncer` pour une écriture faite par une **entité** (`CoursEntite`) ; l'entité écrit, le témoin parle après ; un refus de l'entité (`null`) ne dit rien, l'appelant le dit.
- Mots cours / service dans le point unique `mots-nature.js` (clés `creer`, `pasEncoreCree`).

**Un seul écrivain par fiche**, pour créer comme pour modifier (`sauvegarderCoursV2`, `sauvegarderHoraireV2`, `sauvegarderGroupeCoursV2`, `soumettreEtudiantV2`) : les vérifications et les gardes (#540, #455, CT-15, démo, #478, #914, L-8, #382) ne sont écrites qu'une fois. En création, les champs n'écrivent rien (une garde « en création, rien » par écrivain de champ, chacune tenue par une mutation).

## 2 · Le point délicat : l'identifiant du trimestre

- **Aucune migration de clés.** Une paire session / année prise, ou un trimestre qui a des données, est **refusé** par les deux gardes #379, **inchangées**, qui parlent par le témoin (« Non enregistré – Identification du trimestre : … », phrases reprises) et remettent les champs au stock. **Mesuré dans WebKit** sur le trimestre de démonstration : aucune clé `demo_…` ne bouge (banc (b)).
- **État intermédiaire** (session changée, année vide ou pas à quatre chiffres) : rien d'écrit, rien de dit (Vitest et WebKit).
- **Le cadre s'écrit sous l'id en vigueur** : « Créer le trimestre » écrit l'identification, pose `trimestreActif`, PUIS le cadre ; aucune clé ne naît sous un id vide.
- **Le double message** (« Identification incomplète » + « Cadre du trimestre sauvegardé ») est parti avec `sauvegarderTrimestreCompletV2`.

## 3 · Tes décisions de la relecture d'étape, appliquées

| Point | Fait |
|---|---|
| 1 · Piège « dates d'abord » gardé | écrit au § 5 (limites), pas de porte |
| 2 · Dates partielles, un essai | **existant** : `sentinelle-lot-e2-trimestre`, « une date seule : le cadre partiel est écrit, le calendrier généré est retiré, pas régénéré » et « les trois dates obligatoires : le calendrier est régénéré » |
| 3 · Cours → service, « Annuler » | **existant** : `sentinelle-lot-e2-cours`, « un cours qui devient service : la question ; « Annuler » remet le menu, rien d'écrit » |
| 4 · « + Nouveau trimestre » hors lot | **#975 inscrite** (BACKLOG, section « Lot E2 ») ; « Dernier ID utilisé : #975 » |
| 5 · La ligne de séance régénérée, en WebKit | essai du banc du lot (« relecture 5 ») ; **mutation** (défauts non posés) : rouge |
| 6 · Plus de tiret cadratin | **quatre** phrases du témoin corrigées (point-virgule), dont celle de « Créer le trimestre » ; les trois autres : les deux séances de l'horaire, la collision à la création |
| Bouton de l'étudiant·e | « Ajouter l'étudiant·e » gardé ; question « Cet·te étudiant·e n'est pas encore ajouté·e. », « Rester » / « Quitter sans ajouter » ; « Étudiant·e « … » ajouté·e. » ; aucun « élève » dans les mots neufs |

## 4 · Décisions techniques prises seul

- **Les dates partielles s'écrivent** (tu es d'accord) ; le calendrier généré est retiré tant qu'il en manque une.
- **`enseignants` inscrite à `CLES_GLOBALES`** (`trimestres.js`) : lue et écrite sans préfixe depuis toujours ; le témoin passe par `cle()`, qui avertissait. Aucun changement de rangement (la purge du désarchivage ne vise que l'intersection avec les gabarits archivés).
- **La collection lue est COPIÉE avant d'être modifiée** (registre des trimestres, horaires, groupes-cours) : `db.getSync` peut rendre l'objet de son cache ; le modifier avant une écriture qui échoue le laissait faux en mémoire.
- **Étudiant·e, la fiche reste ouverte** après une modification (champ par champ) ; « Fermer » ramène au formulaire d'ajout. Le bouton « Enregistrer les modifications » est retiré.
- **« DA manquant / invalide » devient « Le DA est manquant / invalide : … »** : le témoin met l'initiale en minuscule, « dA manquant » sinon.
- **Les messages de réussite** : « … modifié » disparaît partout (le témoin dit « Enregistré ») ; les créations gardent le leur, sur le patron de E1.
- **Suppressions** : par le témoin, rien d'autre ne change (confirmation, portée).
- `navigation.js` non touché ; l'archivage non touché (moratoire #622).

## 5 · Stock et limites

Le lot n'écrit rien de lui-même : chaque écriture suit un geste. À connaître :
- **Horaire** : la première modification d'un horaire ancien écrit `nombrePeriodes` sur ses séances, repris de `periodesParSeance` (le formulaire le pré-remplissait, « Enregistrer » l'écrivait déjà).
- **Profil** : la première modification réécrit le miroir `profilEnseignant` (comme avant).
- **Piège « dates d'abord »** (gardé, ta décision) : corriger la session d'un trimestre après avoir saisi ses dates donne « Changement bloqué » ; le témoin dit quoi faire.
- **Profil de démonstration** (mesuré) : sans courriel ni institution, obligatoires ; un de ses champs modifié seul est refusé, et le témoin le dit, tant que ces deux champs ne sont pas remplis. Même règle qu'au bouton d'avant.
- ⚠ **À trancher : changer le DA d'une fiche existante.** C'était possible au bouton (sept chiffres, pas de doublon, #914) ; c'est désormais un seul `change`. Le DA identifie l'élève (évaluations, présences) : un DA changé laisse ses évaluations et présences sous l'ancien. **Je n'ai rien changé à la règle** (ni migration, ni refus neuf). Question : garder, demander confirmation, ou refuser en modification ?

## 6 · Les mots – à faire accepter par Grégoire avant le push

| Où | Texte |
|---|---|
| Boutons | « Créer le trimestre », « Créer le profil » *(neuf)*, « Créer le cours » / « Créer le service », « Créer l'horaire », « Créer le groupe-cours », « Ajouter l'étudiant·e » (gardé) ; « Fermer » |
| Question de sortie | « Ce profil n'est pas encore créé. » *(neuf)*, « Ce cours / Ce service n'est pas encore créé. », « Cet horaire… », « Ce groupe-cours… » : « Rester » / « Quitter sans créer » ; « Cet·te étudiant·e n'est pas encore ajouté·e. » : « Rester » / « Quitter sans ajouter » (Grégoire) |
| Après la création | « Trimestre « … » créé. », « Profil « … » créé. », « Cours « 601-101-MQ » créé. » / « Service d'orthopédagogie « … » créé. », « Horaire « … » créé. », « Groupe-cours « … » créé. », « Étudiant·e « … » ajouté·e. » (Grégoire) |
| Témoin, identification | « Non enregistré – Identification du trimestre : ‹raison› », raisons reprises ; à la création : « choisis la session et l'année du trimestre ; elles déterminent où ses données sont rangées. », « le trimestre « … » existe déjà ; active-le depuis la bibliothèque des trimestres. » |
| Témoin, profil | « le prénom et le nom sont requis. », « le courriel est requis. », « l'institution est requise. » |
| Témoin, cours | « le code du cours est requis : il identifie la fiche pour tous les trimestres. Ex. : 601-101-MQ. », « choisis la discipline dans la liste. », « la pondération est requise : … 2-2-3. », « la pondération n'est pas reconnue : … », « le nom du service est requis : c'est le seul champ d'un service d'orthopédagogie. » |
| Question, cours → service *(neuf)* | « Ce cours deviendra un service : son code, sa discipline, sa compétence et sa pondération seront effacés. Continuer ? » |
| Témoin, horaire | « séance 1 : heure de début manquante. Sans elle, la durée de la séance ne peut pas être calculée ; c'est cette durée qui sert à l'assiduité. » (et fin, périodes) ; celles de #478 **approuvées le 13 sept.**, même ordre ; « choisis le groupe associé. » |
| Témoin, groupe-cours | « choisis le trimestre. », « choisis le cours. », « choisis le groupe d'étudiant·es. », « choisis l'horaire. », « choisis l'enseignant·e. » (« l'orthopédagogue » pour un service) |
| Témoin, étudiant·e | « le nom et le prénom sont obligatoires. », « le DA est manquant : c'est celui du collège, sept chiffres, rien d'autre. » (et « invalide »), « ce DA est déjà dans le groupe : ‹nom›. » (mots du 11 sept.), « étudiant introuvable : la liste a changé depuis l'ouverture du formulaire. Resélectionne l'étudiant. » |
| **Nouvelles (proposées)** | « Cadre : le trimestre, ton profil, un cours, un horaire, un groupe-cours ou la fiche d'un·e étudiant·e s'enregistrent tout seuls, champ par champ ; le témoin le dit. Pour en créer un nouveau, un bouton nomme le geste (« Créer le cours », « Ajouter l'étudiant·e »), et l'application te prévient si tu fermes la fiche ou recharges la page avant. « Annuler » devient « Fermer ». » (ta phrase de la consigne, « élève » remplacé ; « si tu quittes » ramené à ce que le lot couvre : changer de section n'avertit pas, `navigation.js`) |

**Relevé des `alert` et du vouvoiement** (remplacés seulement si le lot touchait la fonction) :

| Fichier | Avant | Après | Touché ? |
|---|---|---|---|
| trimestre-v2-init.js | Veuillez remplir la date et la description. / Veuillez indiquer quel jour de cours est remplacé. (`alert`) | Remplis la date et la description. / Indique quel jour de cours est remplacé. (`alert`) | oui |
| trimestre-v2-horaires.js | Veuillez sélectionner un groupe associé (toast) | choisis le groupe associé. (témoin) | oui |
| trimestre-v2-groupes-cours.js | Veuillez sélectionner un trimestre / cours / groupe d'étudiants / horaire / enseignant (toasts) | choisis le trimestre… (témoin) | oui |
| trimestre-v2-init.js | Journée introuvable (`alert`) | inchangé | non |
| trimestre-v2-horaires.js | Séance non trouvée. ; Veuillez sélectionner un jour. / une heure de début. / le nombre de périodes. (sous-formulaire de séance **sans appelant**) | inchangé | non |
| trimestre-v2-cours.js | Veuillez sélectionner un cours à modifier. / à dupliquer. ; Cours non trouvé. ×2 (fonctions **sans appelant**) ; La suppression est indisponible… (repli) | inchangé | non |
| trimestre-v2-etudiants.js | Veuillez coller des données à importer. ; Aucune donnée valide trouvée. Vérifie le format. ; Aucun étudiant à exporter. ; Aucun étudiant dans le groupe. Importe d'abord une liste. (`alert`) | inchangé : aperçu, analyse et export de l'import (non touchés) ; le dernier est dans `sauvegarderGroupeEtudiantsV2`, sans appelant | non |
| trimestre-v2-liste.js | 19 `alert` (bibliothèque des trimestres) | inchangé : **#975** | non |

## 7 · Fiches

- **#678** (des `alert` sur le parcours de la première chronique) : **en partie** (deux `alert` au tutoiement ; les refus du groupe-cours, de l'horaire et de l'étudiant·e passent au témoin ; restent ceux de la bibliothèque des trimestres, de `cours.js` et de l'import).
- **#477** (CT-16, CT-19, CT-22) : **en partie** (le toast « Modifications annulées » du profil est retiré ; « Fermer » l'horaire ne vide toujours pas l'horaire mémorisé, il se rouvre au prochain affichage).
- **#472** (nom du groupe-cours recalculé à l'affichage) : **non**.
- **#791** (formulaire d'élève de `groupe.js`, sept ids absents) : **non** (le formulaire du Cadre est `trimestre-v2-etudiants.js` ; `groupe.js` non touché).
- **#975** : inscrite (§ 3).

## 8 · Preuves

- **Vitest** : 654 fichiers, **7 643 / 7 643**. Six bancs neufs : `sentinelle-lot-e2-trimestre` (17), `-enseignant` (11), `-cours` (10), `-horaire` (9), `-groupe-cours` (10), `-eleve` (8). Remplacé : `sentinelle-save-explicite-trimestre-306` (décision renversée par D3). Réalignés, motif écrit dans chacun : #379, #390 B7, #306 (état vide, libellés), CT-15 H, #834 A2/B1, #540-E (par `tranche`, cliquet #858), #842, étiquettes B, #540 C/E1, #478 B, horaire supprimable, #914, #382, #872 O, #749 G, #522 lot 5a (plus aucune écriture directe de `groupeEtudiants`), audit L-6, refactor ; deux harnais d'audit transmettent `modifierEtAnnoncer` et un témoin.
- **WebKit** :
  - **banc du lot** `lot-e2-cadre-creer-ou-modifier.spec.js`, **8 / 8** : (a) à (e), (c bis) étudiant·e, la ligne de séance régénérée, le placement de « Fermer » et « Créer le cours » à 360, 768, 1024 et 1180 px, dans l'écran et hors du témoin ;
  - **bancs voisins, par étape** : trimestre 2, profil 2, cours 6, horaire 12 (36 essais), groupe-cours et cours 7 (16), étudiant·es 7 (17), tous verts. Specs réalignés : les `nouveau…` devenus asynchrones sont attendus ; les refus se lisent au témoin ; #540-G et #478 (b) vident la saisie entre deux essais.
  - Le **verdict WebKit complet** reste le dernier geste avant le push.
- **Mutations** (fichier restauré, empreinte vérifiée après chacune) :

| Mutation | Résultat |
|---|---|
| M1 l'identification écrite à la frappe (`data-on-input`) | rouge |
| M2 l'état intermédiaire écrit | rouge |
| M3 un succès après un échec d'écriture (horaire) | rouge (2) |
| M4 un écrivain du Cadre sans témoin (cadre en `setSync`) | rouge (2) |
| M5 « Créer le cours » écrit avant le clic | rouge |
| M6, M10, M11, M14 la question de sortie retirée (cours, groupe-cours, profil, étudiant·e) | rouges |
| M8, M9, M13 horaire / groupe-cours / étudiant·e écrits avant leur bouton | rouges (M9 survivait : essai resserré, `6943a8c2`) |
| M12 la garde de collision #379 retirée | rouge (2) |
| M15 la fiche d'étudiant·e écrite hors témoin (`db.modifier`) | rouge (3) |
| M16 (WebKit) les défauts de séance non posés | rouge |
| M7 le profil écrit avant « Créer le profil » (première garde retirée) | **survit, équivalente** : une seconde garde (index −1) arrête l'écriture |

## 9 · Trouvailles en chemin (issues)

1. **Régression de l'étape 5, corrigée** (issue 1) : « Reprendre dans ce trimestre » (`cours.js`) n'attendait pas `nouveauGroupeCoursV2`, devenue asynchrone : le cours présélectionné était effacé. Attrapée par le banc « Chantier E ».
2. **WebKit : une ligne de séance régénérée gardait l'heure et les périodes de la précédente** ; défauts posés explicitement (issue 1). Essai WebKit et mutation (§ 8).
3. **Code sans appelant**, laissé (issue 3) : `modifierCoursSelectionneV2`, `dupliquerCoursSelectionneV2`, `afficherFormCoursV2`, `ouvrirModalNouveauCours` ; le sous-formulaire de séance de l'horaire ; `sauvegarderGroupeEtudiantsV2`.
4. **Les gardes « Modification impossible »** citées par la consigne n'existent plus : le lot A les a remplacées par des champs d'identité masqués (rien à affaiblir).
5. **La consigne cite `groupes-cours.js`** : `trimestre-v2-groupes-cours.js` ; et `etudiants.js` l. 622-740 : c'est `trimestre-v2-etudiants.js`.
6. **Le trimestre de démonstration** a l'id « demo », la session « D » (hors du menu, qui reste vide) et une année en texte. Sans effet sur le lot (les gardes refusent tout changement : il a des données).

## 10 · Ce que je te demande de relire

1. Le diff du lot (`git diff 53adedfd..lot-e2-cadre-eleves -- js index.html`) contre D3 et la consigne.
2. Le § 2 (identifiant du trimestre) par exécution, et la question du DA au § 5.
3. Les mots neufs et les Nouvelles du § 6.
4. Les mutations du § 8, et M7 (équivalente).

## 11 · La suite

Ta relecture → corrections → **Grégoire accepte les mots du § 6 et les Nouvelles** → release `minor` → Vitest → verdict WebKit complet (Cowork et navigateurs fermés) → fusion → push → porte terrain (sur ses données réelles, sans rien créer de fictif, avec une rangée de retour pour chaque geste qui modifie).
