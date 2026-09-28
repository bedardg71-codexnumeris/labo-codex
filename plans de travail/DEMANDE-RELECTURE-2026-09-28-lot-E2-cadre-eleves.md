# Demande de relecture – lot E2 de l'enregistrement, zone Cadre (D3) : étapes 1 à 5

> Écrite le 28 septembre 2026 par Claude Code, pour Cowork. **Compte rendu d'étape, demandé par Grégoire après l'étape 5 : le lot n'est pas fini.** Reste l'étape 6 (les élèves), le banc WebKit du lot entier et le placement des boutons (§ 9). Branche locale `lot-e2-cadre-eleves`, worktree `.claude/worktrees/lot-e2-cadre-eleves`, partie de `c8572cf0` puis rebasée sur `main` = `53adedfd` (le relevé de la porte de 1.165.0). Consigne : `plans de travail/CONSIGNE-DU-JOUR.md`, condition de départ remplacée à ta demande (`d8b35364`).

## 1 · Ce que le lot change, étape par étape

| Étape | Commit | Ce qui s'enregistre tout seul | Le geste qui crée | Autres changements |
|---|---|---|---|---|
| 1 · Trimestre | `0b28c6ab`* | le nom ; la session et l'année **ensemble**, au changement ; les huit dates | « Créer le trimestre » (aucun trimestre actif) | bouton « Enregistrer » retiré ; réinitialiser bornes / semaines et journées sans cours par le témoin |
| 2 · Profil enseignant | `3a9cbad6` | les sept champs (dont trois qui n'avaient AUCUN enregistrement : département, discipline, site web) | « Créer le profil » | « Fermer » ; carte de synthèse = ce qui est écrit |
| 3 · Cours ou service | `ac768698` | les neuf champs, nature et pondération comprises | « Créer le cours » / « Créer le service » | « Fermer » ; question avant qu'un cours devienne service |
| 4 · Horaire | `3e736dbb` | nom, groupe, nombre de séances, chaque champ de séance | « Créer l'horaire » | « Fermer » ; défauts de séance posés explicitement (§ 8) |
| 5 · Groupe-cours | `3803df98`, `6943a8c2` | les six sélections | « Créer le groupe-cours » | « Fermer » ; la reprise d'un cours attend la création (§ 8) |

\* après le rebase sur `53adedfd` ; `4a0c7ddc` avant.

**Mécanismes repris du lot E1, pas inventés** : le témoin commun (`sauvegarderDonneesSelonMode`, et `modifierEtAnnoncer` n'est pas utilisé ici, les écritures du Cadre étant synchrones) ; la question « … n'est pas encore créé. » de `ui-dialogues.js`, « Rester » / « Quitter sans créer » ; la fiche en création déclarée au `beforeunload` commun ; `raisonPourTemoin`. **Deux ajouts au mécanisme**, nommés :
- `quitterCreationSiConfirme(genre, titre)` accepte un titre : celui du cours dépend de la fiche (« Ce cours » / « Ce service », depuis `mots-nature.js`) ; `QUITTER_SANS` prépare « Quitter sans ajouter » pour l'élève.
- `ecrireEtAnnoncer` (`modes.js`) : le pendant de `modifierEtAnnoncer` pour une écriture faite par une **entité** qui possède sa collection (`CoursEntite` : forme de la fiche, garde #455). L'entité écrit, le témoin parle après ; un refus de l'entité (`null`) ne dit rien, l'appelant le dit.

**Un seul écrivain par fiche**, pour la création comme pour la modification (`sauvegarderCoursV2`, `sauvegarderHoraireV2`, `sauvegarderGroupeCoursV2`) : les vérifications et les gardes (#540, #455, CT-15, démo, #478) ne sont écrites qu'une fois. En création, les champs n'écrivent rien (une garde « en création, rien » par écrivain de champ) ; le bouton appelle l'écrivain.

## 2 · Le point délicat : l'identifiant du trimestre

- **Aucune migration de clés.** Aucun chemin du lot ne déplace ni ne renomme une donnée : une paire session / année prise, ou un trimestre qui a des données, est **refusé** par les deux gardes #379, **inchangées**, qui parlent maintenant par le témoin (« Non enregistré – Identification du trimestre : … », leurs phrases reprises telles quelles) et remettent les champs au stock.
- **État intermédiaire** (session changée, année vide ou pas à quatre chiffres) : rien d'écrit, rien de dit.
- **Le cadre s'écrit sous l'id en vigueur** : « Créer le trimestre » écrit l'identification, pose `trimestreActif`, PUIS le cadre (`cle()` le lit dans `trimestreActif`). Un essai vérifie qu'aucune clé ne naît sous un id vide.
- **Le double message** (« Identification incomplète » + « Cadre du trimestre sauvegardé ») est parti avec `sauvegarderTrimestreCompletV2`.
- ⚠ **Un piège que D3 rend possible, à trancher** : sur un trimestre existant, saisir **d'abord les dates** (qui s'enregistrent) puis corriger la session donne « Changement bloqué » : le trimestre « a des données ». Avant, le bouton unique écrivait l'identification d'abord. Je ne l'ai pas contourné (ce serait déplacer des clés). Fréquence : corriger la session d'un trimestre juste créé.

## 3 · Décisions techniques prises seul

- **Les dates partielles s'écrivent.** #215 exigeait les trois dates obligatoires avant d'écrire ; champ par champ, la première date saisie se serait perdue en quittant. Tant qu'il en manque une, le calendrier généré est **retiré** (même règle que « Réinitialiser les bornes », #390 B5) ; complet, il est régénéré.
- **`enseignants` inscrite à `CLES_GLOBALES`** (`trimestres.js`) : lue et écrite sans préfixe depuis toujours ; le témoin passe par `cle()`, qui avertissait « clé absente des registres ». Aucun changement de rangement (vérifié : la purge du désarchivage ne vise que l'intersection avec les gabarits archivés, le routage d'un trimestre nommé rend la même clé).
- **Un cours qui devient service** perd en base son code, sa discipline, sa compétence et sa pondération (règle de #834, faite au bouton jusqu'ici). Automatique au changement du menu, ce serait un effacement sans question : quand la fiche en porte, **une question d'abord** (mots au § 5).
- **La collection lue est COPIÉE avant d'être modifiée** (registre des trimestres, horaires, groupes-cours) : `db.getSync` peut rendre l'objet de son cache ; le modifier avant une écriture qui échoue le laissait faux en mémoire. Trouvé par un essai d'échec d'écriture (étape 1).
- **La carte de synthèse du profil** lit le profil en base, jamais la frappe (consigne).
- **Les messages de réussite** : « … modifié » disparaît partout (le témoin dit « Enregistré ») ; la création garde le sien, sur le patron de E1 (« Grille « … » créée. »).
- **Suppression** : les écritures passent par le témoin (« Supprimer le profil »…), rien d'autre ne change (confirmation, portée).
- `navigation.js` non touché ; l'archivage non touché (moratoire #622).

## 4 · Stock (tarir n'est pas réparer)

Le lot n'écrit rien de lui-même : chaque écriture suit un geste de l'usager. Deux effets à connaître :
- **Horaire** : la première modification d'un horaire ancien écrit `nombrePeriodes` sur ses séances, repris de `periodesParSeance` (le formulaire le pré-remplissait déjà, et « Enregistrer » l'écrivait déjà).
- **Profil** : la première modification d'un champ réécrit le miroir `profilEnseignant` (comme « Enregistrer » avant).

## 5 · Les mots – à faire accepter par Grégoire avant le push

| Où | Texte |
|---|---|
| Boutons (Cowork, repris) | « Créer le trimestre », « Créer le cours » / « Créer le service », « Créer l'horaire », « Créer le groupe-cours » ; « Fermer » |
| Bouton (neuf, proposé par moi) | « Créer le profil » |
| Question de sortie (Cowork, repris) | « Ce cours n'est pas encore créé. » / « Ce service n'est pas encore créé. », « Cet horaire n'est pas encore créé. », « Ce groupe-cours n'est pas encore créé. » ; « Rester » / « Quitter sans créer » |
| Question de sortie (neuf) | « Ce profil n'est pas encore créé. » |
| Après la création (neuf, patron E1) | « Trimestre « … » créé. », « Profil « … » créé. », « Cours « 601-101-MQ » créé. » / « Service d'orthopédagogie « … » créé. », « Horaire « … » créé. », « Groupe-cours « … » créé. » |
| Témoin, identification (Cowork) | « Non enregistré – Identification du trimestre : ‹raison› », raisons reprises telles quelles |
| Témoin, création sans session ni année | « Non enregistré – Créer le trimestre : choisis la session et l'année du trimestre — elles déterminent où ses données sont rangées. » |
| Témoin, profil | « Non enregistré – Modifier le profil : le prénom et le nom sont requis. » (et « le courriel est requis. », « l'institution est requise. ») |
| Témoin, cours | « … le code du cours est requis : il identifie la fiche pour tous les trimestres. Ex. : 601-101-MQ. », « … choisis la discipline dans la liste. », « … la pondération est requise : elle donne les heures de cours par semaine. Format du devis ministériel : 2-2-3. », « … la pondération n'est pas reconnue : trois nombres, comme sur le devis ministériel. Ex. : 2-2-3. », « … le nom du service est requis : c'est le seul champ d'un service d'orthopédagogie. » |
| Question, cours → service (neuf) | « Ce cours deviendra un service : son code, sa discipline, sa compétence et sa pondération seront effacés. Continuer ? » |
| Témoin, horaire | les phrases de #540 réunies en une (« séance 1 : nombre de périodes manquant. C'est lui qui compte… ») ; celles de #478 **approuvées le 13 sept.**, même ordre (« aucun groupe d'étudiant·es pour l'instant. Ajoute ou importe… ») |
| Témoin, groupe-cours | « choisis le trimestre. », « choisis le cours. », « choisis le groupe d'étudiant·es. », « choisis l'horaire. », « choisis l'enseignant·e. » (« l'orthopédagogue » pour un service) |
| Nouvelles | **à écrire à la fin du lot** (le texte de Cowork au § 3 de la consigne couvrira aussi les élèves) |

**Relevé des `alert` et du vouvoiement** (consigne : remplacés seulement si le lot touchait déjà la fonction) :

| Fichier | Avant | Après | Touché ? |
|---|---|---|---|
| trimestre-v2-init.js | Veuillez remplir la date et la description. (`alert`) | Remplis la date et la description. (`alert`) | oui |
| trimestre-v2-init.js | Veuillez indiquer quel jour de cours est remplacé. (`alert`) | Indique quel jour de cours est remplacé. (`alert`) | oui |
| trimestre-v2-horaires.js | Veuillez sélectionner un groupe associé (toast) | Choisis le groupe associé. (témoin) | oui |
| trimestre-v2-groupes-cours.js | Veuillez sélectionner un trimestre / un cours / un groupe d'étudiants / un horaire / un enseignant (toasts) | choisis le trimestre… (témoin, ci-dessus) | oui |
| trimestre-v2-init.js | Journée introuvable (`alert`) | inchangé | non |
| trimestre-v2-horaires.js | Séance non trouvée. ; Veuillez sélectionner un jour. / une heure de début. / le nombre de périodes. (`alert`, sous-formulaire de séance **sans appelant**, § 8) | inchangé | non |
| trimestre-v2-cours.js | Veuillez sélectionner un cours à modifier. / à dupliquer. ; Cours non trouvé. ×2 (`alert`, fonctions **sans appelant**) ; La suppression est indisponible… (garde de repli) | inchangé | non |
| trimestre-v2-etudiants.js | Veuillez coller des données à importer. ; Aucune donnée valide trouvée… ; Aucun étudiant à exporter. ; Aucun étudiant dans le groupe… (`alert`) | **étape 6** | – |
| trimestre-v2-liste.js | 19 `alert`, dont « Session invalide. Veuillez entrer A (Automne)… », « Année invalide. Veuillez entrer 4 chiffres… », « Aucun trimestre dans la bibliothèque. Cliquez sur… », « Trimestre "…" créé avec succès ! » | inchangé : la bibliothèque des trimestres (et son « + Nouveau trimestre » par `prompt`) est hors des fichiers de la consigne, et porte l'archivage (moratoire) | non |

## 6 · Fiches

- **#678** (des `alert` sur le parcours de la première chronique) : **en partie** — deux `alert` au tutoiement, les refus du groupe-cours et de l'horaire passent au témoin ; les 19 de la bibliothèque des trimestres et les 15 de `cours.js` restent.
- **#477** (CT-16, CT-19, CT-22) : **en partie** — le toast de succès « Modifications annulées » du profil est retiré ; mais « Fermer » l'horaire ne vide toujours pas l'horaire mémorisé (`cle('horaireSelectionne')`) : il se rouvre au prochain affichage. Non corrigé (code étranger au lot, issue 2).
- **#472** (nom du groupe-cours recalculé à l'affichage) : **non**.
- **#791** (formulaire d'élève de `groupe.js`, sept ids absents) : **non** — à revoir à l'étape 6.

## 7 · Preuves

- **Vitest** : 653 fichiers, **7 635 / 7 635**. Cinq bancs neufs : `sentinelle-lot-e2-trimestre` (17 essais), `-enseignant` (11), `-cours` (10), `-horaire` (9), `-groupe-cours` (10). Remplacé : `sentinelle-save-explicite-trimestre-306` (sa décision est renversée par D3). Réalignés, motif écrit dans chacun : #379, #390 B7, #306 (état vide, libellés), CT-15 H, #834 A2/B1, #540-E (par `tranche`, cliquet #858), #842 (5), étiquettes B, #540 C/E1, #478 B, horaire supprimable, refactor.
- **WebKit, par étape** (le verdict complet reste le dernier geste avant le push) : trimestre 2 bancs ; profil 2 ; cours 6 ; horaire 12 (36 essais) ; groupe-cours et cours 7 (16 essais), tous verts. Specs réalignés : nouveau* devenus asynchrones sont attendus ; #478 (b)/(c) lisent le témoin ; #540-G vide la saisie entre deux essais (la question de sortie s'ouvrait).
- **Mutations** (fichier restauré et empreinte vérifiée après chacune) :

| Mutation | Résultat |
|---|---|
| M1 l'identification écrite à la frappe (`data-on-input`) | rouge |
| M2 l'état intermédiaire écrit (année non vérifiée) | rouge |
| M3 un succès après un échec d'écriture (horaire) | rouge (2) |
| M4 un écrivain du Cadre sans témoin (cadre calendaire en `setSync`) | rouge (2) |
| M5 « Créer le cours » écrit avant le clic | rouge |
| M6 la question de sortie retirée (cours) | rouge |
| M8 l'horaire écrit avant « Créer l'horaire » | rouge |
| M9 le groupe-cours écrit avant « Créer le groupe-cours » | **survivait** : l'essai choisissait un groupe sans horaire, l'écriture était refusée pour une autre raison. Essai resserré (`6943a8c2`) : rouge |
| M10, M11 la question de sortie retirée (groupe-cours, profil) | rouge |
| M12 la garde de collision #379 retirée | rouge (2) |
| M7 le profil écrit avant « Créer le profil » (première garde retirée) | **survit, équivalente** : l'écrivain ne trouve aucun profil à l'index −1 et s'arrête ; une seconde garde protège |

## 8 · Trouvailles en chemin (issues)

1. **Régression de l'étape 5, corrigée** : « Reprendre dans ce trimestre » (bibliothèque des cours, `cours.js`) appelait `nouveauGroupeCoursV2()` sans l'attendre ; devenue asynchrone (la question de sortie), sa remise à zéro effaçait le cours présélectionné. Attrapée par le banc « Chantier E ». `nouveauGroupeCoursV2` rend `true`/`false` ; l'appel est attendu, « Rester » laisse la création en cours. **Issue 1** (le lot l'avait cassé).
2. **WebKit, mesuré** : une ligne de séance régénérée par `innerHTML`, aux mêmes identifiants, garde l'heure et les périodes de la ligne remplacée (le jour revient au défaut). Invisible tant qu'un seul geste régénérait ; depuis que réduire les séances enregistre, « + Nouvel horaire » héritait de l'horaire précédent (CT-01). Défauts posés explicitement. **Issue 1**.
3. **Code sans appelant**, laissé tel quel (**issue 3**, code étranger) : `modifierCoursSelectionneV2`, `dupliquerCoursSelectionneV2`, `afficherFormCoursV2`, `ouvrirModalNouveauCours` (visent `v2-apercuCours`, absent ; un banc #842 les exerce) ; le sous-formulaire de séance de l'horaire (`afficherFormSeanceV2`, `confirmerSeanceV2`…).
4. **La consigne cite `groupes-cours.js`** : le fichier est `trimestre-v2-groupes-cours.js`.
5. **« Fermer » l'horaire ne vide pas l'horaire mémorisé** (#477, CT-16) : **issue 2**, déjà inscrit.
6. **Le parcours « + Nouveau trimestre » de la bibliothèque** (`trimestre-v2-liste.js`, `prompt` + `alert`) est l'autre chemin qui crée un trimestre ; D3 ne l'a pas atteint. **À trancher** : dans E2 (fichier de l'archivage, moratoire) ou au lot F des mots ?

## 9 · Ce qui reste du lot

1. **Étape 6, les élèves** (`etudiants.js`, `trimestre-v2-etudiants.js`) : fiche existante automatique ; « Ajouter l'élève » (ou « Ajouter l'étudiant·e », à trancher par Grégoire) ; « Cet élève n'est pas encore ajouté. » / « Quitter sans ajouter » ; les gardes « Modification impossible » face au lot A ; les quatre `alert`.
2. **Banc WebKit du lot** (preuves (a) à (e) de la consigne, par comportement dans le vrai `index.html`) et **placement** des boutons renommés à 360, 768, 1024 et 1180 px, hors du témoin.
3. Mutation de l'étape 6 ; Vitest complet ; puis cette demande complétée pour ta relecture finale ; Nouvelles.

## 10 · Ce que je te demande de relire maintenant

1. Le § 2 (identifiant du trimestre), et le piège « dates d'abord ».
2. Les décisions du § 3, surtout les dates partielles et la question cours → service.
3. Les mots neufs du § 5.
4. Les deux trouvailles corrigées du § 8 (1 et 2), et la question du § 8.6.
