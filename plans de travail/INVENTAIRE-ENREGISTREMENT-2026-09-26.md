# Inventaire de l'enregistrement – où l'application enregistre toute seule, où il faut enregistrer, et ce que l'écran en dit

> 26 septembre 2026, Claude Code, sur `main` = `15d2b2c5` (1.159.12). Consigne : `plans de travail/CONSIGNE-DU-JOUR.md` (Cowork, 26 sept., 11 h 20).
> **Aucun changement de code.** Mesure au navigateur (WebKit, banc jetable non commité, données fictives de la démonstration) pour ce que l'écran dit ; lecture du code pour le mécanisme. Chaque ligne porte `[exécuté]` (vu au navigateur) ou `[lu]` (lu dans le code, pas vu à l'écran).
> Ce document **décrit et mesure**. Il ne tranche rien : les décisions sont à Grégoire (consigne, § 1). Mes recommandations sont à part, § 5.

---

# PARTIE 1 – pour Grégoire

## 1 · En bref

**Synthèse.** L'application compte **33 écrans ou gestes** qui écrivent des données. Leur régime se répartit ainsi : **6 automatiques**, **3 automatiques qui affichent pourtant un bouton « Enregistrer »**, **16 manuels**, **7 mixtes** (automatique et manuel dans le même écran), **1 jamais enregistré**. Ce que l'écran en dit est clair sur 12 d'entre eux, ambigu sur 12, et **faux sur 9**. Trois écrans expliquent le mieux ce que les usagers t'ont dit :

1. **L'évaluation d'une copie** s'enregistre toute seule, une seconde et demie après chaque geste, et ne le dit nulle part. L'écran garde un bouton « Enregistrer », et la Liste des évaluations affiche « Non enregistrée » pour une évaluation qui est pourtant en base.
2. **Les grilles, les échelles et les cartouches** mélangent les deux régimes dans le même écran : la plupart des champs s'enregistrent à la sortie, sans rien dire, et le bouton « Enregistrer » reste là. L'échelle dit même « puis enregistre » après un ajout qui est déjà enregistré.
3. **Les réglages** (Préférences et Outils d'observation) s'enregistrent à chaque changement, et un bouton « Enregistrer » les surmonte. Le sous-titre dit « Chaque réglage s'enregistre dès que tu le changes », à côté du bouton.

## 2 · Une trouvaille qui ne peut pas attendre la décision d'ensemble

**Grille : un critère ajouté disparaît quand on clique « Enregistrer ».** `[exécuté]`
Dans Conception › Grilles, on ouvre une grille existante (5 critères), puis on clique « + Ajouter un critère ». Le critère est aussitôt en base, qui en compte 6. On clique ensuite « Enregistrer » : l'écran dit « Grille "…" sauvegardée ! », et la base revient à **5 critères**. Le critère ajouté est perdu, sans un mot. La lecture du code dit que le même sort guette les sous-critères (ajout, modification, suppression, « par défaut »), mais je ne l'ai pas vu au navigateur.
C'est une perte de données dans un écran que tu utilises en ce moment. Rien ne l'inscrit encore au BACKLOG ni au suivi des bugs. **Ce n'est pas corrigé ici** : la consigne l'interdit. Voir § 5.

## 3 · Écran par écran

Légende : **Auto** = rien à faire, l'application écrit seule. **Manuel** = il faut cliquer un bouton. « Quitter » = ce qui arrive si on change d'écran, d'élève, de date ou d'onglet sans enregistrer. « Échec » = ce que l'écran dit quand l'écriture ne se fait pas (mémoire pleine, erreur, mode anonymisation).

**Deux faits valent pour toute l'application** :

- **Aucun écran n'avertit quand on le quitte avec des modifications non enregistrées.** Aucun ne demande « Quitter sans enregistrer ? ». Le seul avertissement existant concerne le fichier du Codex. `[lu]`
- **Le mode anonymisation ne bloque qu'une petite partie des écritures** (l'évaluation, les présences, la suppression d'une évaluation, les jetons, la modification d'un élève). Tout le reste (grilles, échelles, cartouches, pratiques, profil confidentiel, interventions, alignement, annotations) écrit dans tes vraies données, en silence. `[lu]`

### Cadre

| Le geste | Comment ça s'enregistre | Ce que l'écran dit | Quitter sans enregistrer | Échec | Verdict |
|---|---|---|---|---|---|
| Modifier le nom, la session, l'année ou les dates du trimestre | Manuel, bouton « Enregistrer » | Après : « Cadre du trimestre sauvegardé ». Si l'identification est refusée, **deux messages à la fois** : « Identification incomplète – Choisis la session et l'année… » **et** « Cadre du trimestre sauvegardé » `[exécuté]` | Perte, sans avertissement `[lu]` | Rien `[lu]` | **ment** : dit « sauvegardé » juste après un refus |
| Réinitialiser les bornes ou les semaines spéciales, ajouter une journée sans cours | Auto, dès le geste (après confirmation) | « Journée ajoutée », « Bornes du trimestre réinitialisées » `[lu]` | – | Rien `[lu]` | **ambigu** : dans la même carte que le bouton « Enregistrer », mais ces gestes ne l'attendent pas |
| Créer ou modifier un cours ou un service | Manuel, « Créer » / « Enregistrer » | « Cours créé avec succès » / « … modifié avec succès » `[lu]` | Perte, sans avertissement `[lu]` | Rien `[lu]` | clair |
| Profil enseignant | Manuel, « Enregistrer » | « Profil enseignant modifié » ; la carte de synthèse change pendant la saisie, avant l'enregistrement `[lu]` | Perte, sans avertissement | Rien | **ambigu** : la carte montre comme acquis ce qui ne l'est pas encore |
| Horaire, groupe-cours | Manuel, « Créer » / « Enregistrer » | « Horaire "…" modifié », « Groupe-cours modifié » `[lu]` | Perte, sans avertissement | Rien | clair |
| Ajouter, modifier ou retirer un élève | Manuel, « Ajouter l'étudiant·e » / « Enregistrer les modifications » | « … ajouté / modifié », « Étudiant supprimé » `[lu]` | Perte, sans avertissement | Anonymisation : « Modification impossible » `[lu]` | clair |
| Archiver un trimestre | Manuel, « Archiver » | « Trimestre "…" archivé avec succès. Un fichier d'export a été téléchargé. » `[lu]` | – | Si l'archivage est refusé : « Erreur: undefined » `[lu]` | **ment** : promet un fichier sans vérifier qu'il a été produit |

### Conception

| Le geste | Comment ça s'enregistre | Ce que l'écran dit | Quitter | Échec | Verdict |
|---|---|---|---|---|---|
| Modifier un critère d'une grille existante (nom, pondération, description) | Auto, à la sortie du champ | Rien. Nom vidé : « La modification n'a pas été enregistrée. » `[lu]` | Déjà écrit | Rien `[lu]` | clair |
| **Ajouter un critère, puis « Enregistrer »** | Auto, puis le bouton réécrit une copie périmée | « Grille "…" sauvegardée ! » – le critère ajouté a disparu `[exécuté]` | – | – | **ment** (§ 2) |
| Bouton « Enregistrer » d'une grille existante | Manuel, alors que tout est déjà écrit | « Grille "…" sauvegardée ! » `[exécuté]` | – | – | **ambigu** : il fait croire que sans lui rien ne tient |
| « Annuler » dans une grille ou une échelle existante | Ferme la fiche | Rien ; les modifications restent en base `[lu]` | – | – | **ment** : n'annule rien |
| Nouvelle grille, nouvelle échelle | Manuel : rien n'est écrit avant « Enregistrer » | « … sauvegardée ! » `[lu]` | **Perte silencieuse** `[lu]` | – | **ambigu** : même écran que l'édition, qui est automatique |
| Modifier un niveau d'échelle | Auto, à la sortie du champ | Rien `[lu]` | Déjà écrit | Rien | clair |
| Ajouter un niveau d'échelle | Auto | « Niveau ajouté ! … Ajuste ses propriétés (code, nom, min, max), puis enregistre. » `[lu]` | – | – | **ambigu** : demande d'enregistrer ce qui l'est déjà |
| Cartouche : cellule de la matrice, contexte général | Auto, à la sortie du champ | Rien ; une cartouche jamais enregistrée dit une fois « Ce que tu tapes n'est gardé qu'à l'écran. Clique sur « Enregistrer »… » `[lu]` | Déjà écrit | Rien | clair |
| Cartouche : **nom** et **contexte spécifique** | Manuel seulement | Rien pendant ; « Cartouche "…" sauvegardée ! » après `[lu]` | **Perte silencieuse**, alors que le champ voisin (contexte général) est gardé `[lu]` | – | **ambigu** : deux champs jumeaux, deux régimes |
| Pratique : nom, type, échelle, catégories… | Auto, à la sortie du champ | Rien `[lu]` | Déjà écrit | Rien | clair |
| Pratique : **système de jetons** | Manuel seulement (« Enregistrer la pratique ») | « Pratique enregistrée » `[lu]` | **Perte silencieuse** `[lu]` | – | **ambigu** : un régime caché dans un écran automatique |
| Assistant de pratique | Manuel, « ✓ Créer la pratique » | « Pratique « … » créée. », **même quand on modifie** une pratique existante `[lu]` | Tout est perdu, et l'aide le dit | – | **ambigu** |
| Production (tous les champs) | Manuel, « Enregistrer » | « Production modifiée avec succès ! » `[lu]` | **Perte silencieuse** | Rien | clair par lui-même, mais contraire aux écrans voisins |

### Alignement

| Le geste | Comment ça s'enregistre | Ce que l'écran dit | Quitter | Échec | Verdict |
|---|---|---|---|---|---|
| Titre, description, niveau, semaine, liens d'un bloc sur la carte | Auto, à chaque frappe | Rien `[lu]` | Déjà écrit | **Rien** : l'erreur est avalée `[lu]` | clair tant que ça marche |
| **Titre modifié dans l'Inspecteur** (panneau latéral) | Pas écrit tout de suite : attend le geste suivant | Rien `[lu]` | Recharger juste après fait probablement perdre le titre `[lu]` | – | **ambigu** |

### Évaluer : la copie, le formulaire, l'annotation

| Le geste | Comment ça s'enregistre | Ce que l'écran dit | Quitter | Échec | Verdict |
|---|---|---|---|---|---|
| **Choisir un niveau, taper la rétroaction** | **Auto**, 1,5 s après le dernier geste : l'évaluation est écrite en base, « non verrouillée » | **Rien, jamais.** Le seul mot d'état dans le formulaire est le bouton « Enregistrer » `[exécuté]`. La Liste des évaluations montre ensuite « NON ENREGISTRÉE » sur cette ligne `[exécuté]` | Changer d'élève par les flèches : l'écriture en attente part avant `[lu]`. Recharger dans la seconde et demie : perdu `[lu]` | **Anonymisation : rien à l'écran.** L'évaluation semble présente pendant la séance, puis **disparaît au rechargement** `[exécuté]` | **ment** : dit « non enregistrée » pour une évaluation écrite |
| Bouton « Enregistrer » (première fois) | Manuel : verrouille, et l'évaluation compte | « Évaluation sauvegardée : … » ; chaque échec a son message (anonymisation, espace insuffisant, erreur) `[lu]` | – | Clair `[lu]` | clair |
| « Enregistrer » sur une évaluation déjà écrite | Manuel | « Évaluation modifiée : … » `[lu]` | – | **Erreur ou mémoire pleine : « Évaluation modifiée » quand même** (#618) `[lu]` | **ment** en cas d'échec |
| Nombre d'erreurs, nombre de mots, statut de remise, intégrité | **Pas** d'écriture automatique : seuls les niveaux et la rétroaction la déclenchent `[lu]` | Rien | **Perte silencieuse** si on change d'élève sans autre geste `[lu]` | – | **ambigu** |
| Cadenas du formulaire | Manuel | « Évaluation verrouillée – Modification impossible » `[lu]` | – | Erreur : message de succès quand même `[lu]` | **ambigu** : verrouiller un brouillon revient à l'enregistrer, sans la vérification de « Enregistrer » |
| Trait, texte, tampon sur la copie | Auto, 2 s après | Rien `[lu]` | Changer de copie dans les 2 s : le dernier trait est probablement perdu `[lu]` | Rien ; **écrit même en anonymisation** `[lu]` | clair |
| Rétroaction par la bulle du badge | Manuel, « Sauvegarder » | « Rétroaction sauvegardée » `[lu]` | Perdu (attendu) | **Anonymisation ou erreur : la fenêtre se ferme, le texte est perdu, rien n'est dit** `[lu]` | **ambigu** |
| Raccourcis, tampons et rétroactions de la palette | Manuel, « Enregistrer » | « Tampons et rétroactions enregistrés » `[lu]` | Perdu (attendu) | Rien | clair |

### Liste des évaluations

| Le geste | Comment ça s'enregistre | Ce que l'écran dit | Échec | Verdict |
|---|---|---|---|---|
| Lire l'état d'une évaluation | – | Badge « Non enregistrée » et filtre « Non enregistrée » pour une évaluation écrite mais non verrouillée `[exécuté]` | – | **ambigu** : « non enregistrée » veut dire « non verrouillée » |
| Supprimer une évaluation, vider la corbeille | Manuel, après confirmation | « Évaluation supprimée », « Corbeille vidée. » `[lu]` | Anonymisation : message clair ; **erreur : message de succès** `[lu]` | **ment** en cas d'échec |
| Appliquer ou retirer un jeton | Immédiat | « Modification non enregistrée – {geste} : {cause} » pour chaque échec `[lu]` | Clair `[lu]` | **clair, le modèle à suivre** |

### Présences

| Le geste | Comment ça s'enregistre | Ce que l'écran dit | Quitter sans enregistrer | Échec | Verdict |
|---|---|---|---|---|---|
| Changer les périodes d'un élève, taper une note | Manuel, bouton « Enregistrer » | Rien pendant ; les compteurs changent (« Présents : 9 ») `[exécuté]` | **Perte silencieuse** en changeant de date, puis en revenant `[exécuté]`, ou en changeant d'onglet `[exécuté]`, de groupe ou de tri `[lu]` | – | **ambigu** |
| **Ouvrir une date jamais enregistrée** | – | Tous les élèves « présents », compteurs remplis (10 sur 10), aucune mention « non enregistrée » `[exécuté]` | Rien en base | – | **ambigu** : l'écran ressemble à une séance saisie |
| Bouton « Enregistrer » | Manuel | « Présences enregistrées » `[exécuté]` | – | **Mémoire pleine : « Espace de stockage presque plein – Les données sont sauvegardées… » PUIS « Présences enregistrées », et rien n'est écrit** `[exécuté]`. **Erreur : « Présences enregistrées », rien n'est écrit** `[exécuté]`. Anonymisation : « Modification impossible » `[exécuté]` | **ment** en cas d'échec |
| **Cocher « Verrouiller »** sans cliquer « Enregistrer » | Enregistre en silence ce qui est à l'écran | Le libellé devient « Verrouillée », aucun message d'enregistrement `[exécuté]` | La saisie survit au changement de date `[exécuté]` | **Écrit même en anonymisation**, et réécrit les présences `[exécuté]` | **ambigu** : un « Enregistrer » caché |

### Interventions et rencontres

| Le geste | Comment ça s'enregistre | Ce que l'écran dit | Quitter | Échec | Verdict |
|---|---|---|---|---|---|
| Remplir une intervention ou une rencontre | Manuel, « Enregistrer » | « Intervention enregistrée » / « Rencontre enregistrée » `[lu]` | **Perte silencieuse** au changement d'onglet `[lu]` | Rien ; **écrit en anonymisation** `[lu]` | **ambigu** |
| Modifier une intervention déjà « complétée » (décocher un élève, changer la durée) | Manuel | « Intervention enregistrée » `[lu]` | – | – | **ambigu** : la modification n'atteint probablement pas la saisie des présences `[lu]` |
| « Créer mon service » | Manuel | « Service créé » + nombre d'élèves `[lu]` | – | – | clair |

### Profil de l'élève

| Le geste | Comment ça s'enregistre | Ce que l'écran dit | Quitter | Échec | Verdict |
|---|---|---|---|---|---|
| Informations confidentielles | Manuel, « Enregistrer » | **Rien** : la fenêtre se ferme, une pastille verte apparaît `[lu]` | « Annuler » ou × : perte silencieuse `[lu]` | Rien ; **écrit en anonymisation**, alors que « Mes notes » y est verrouillé `[lu]` | **ambigu** |
| « Mes notes » du Rapport | Auto, à la frappe | « — enregistrées à mesure, gardées d'une visite à l'autre » `[lu]` | Déjà écrit | Verrouillé en anonymisation, et c'est dit `[lu]` | **clair** |
| Texte du rapport (modifiable) | Jamais | Bulle : « … n'est pas sauvegardé automatiquement. » `[lu]` | Perdu ; cocher une section écrase aussi les retouches `[lu]` | – | **ambigu** : « pas automatiquement » laisse croire à un enregistrement manuel qui n'existe pas |

### Réglages et préférences

| Le geste | Comment ça s'enregistre | Ce que l'écran dit | Quitter | Échec | Verdict |
|---|---|---|---|---|---|
| Cases et menus des Préférences | Auto, au changement | Aide : « Tout changement est sauvegardé automatiquement. » `[exécuté]` — et un bouton « Enregistrer » → « Préférences enregistrées » `[lu]` | Rien à perdre | Rien | **ambigu** : bouton inutile qui fait croire le contraire |
| Outils d'observation (Labo) | Auto, au changement | Sous-titre : « Chaque réglage s'enregistre dès que tu le changes. » — et un bouton « Enregistrer » `[exécuté]` | – | – | **ambigu** |
| Seuils mal ordonnés (Fragile 85, Acceptable 80), puis « Enregistrer » | Refusés | Alerte « Erreur : Les seuils doivent être ordonnés… » **et** « Préférences enregistrées » ; rien n'est écrit, le champ garde 85 `[exécuté]` | – | – | **ment** |

### Codex (le fichier sur ta clé USB)

| Le geste | Comment ça s'enregistre | Ce que l'écran dit | Quitter | Échec | Verdict |
|---|---|---|---|---|---|
| « Enregistrer le codex », « Enregistrer sous… » | Manuel : écrit un **fichier** | « Codex enregistré » + emplacement `[lu]` | – | Annuler l'aperçu de sécurité produit probablement un message technique (« Erreur » + « Cannot read properties of null ») `[lu]` | **ambigu** |
| **Le témoin du menu Codex** | – | **« Tout est enregistré » en vert, juste après avoir enregistré des présences** : aucun fichier ne les contient `[exécuté]` | Donc aucun avertissement à la fermeture, et l'enregistrement automatique « Toutes les 5 min » ne part jamais `[lu]` | – | **ment** |
| Annuler la fenêtre d'enregistrement | – | Le témoin dit quand même « Tout est enregistré » et « Dernier fichier : … » `[lu]` | – | – | **ment** |
| Rappel « Protège tes données » | – | « Exporte régulièrement tes données via Réglages → Données. Le fichier JSON… » — un autre fichier que le Codex ; « Exporter maintenant » repousse le rappel de 7 jours sans rien exporter `[lu]` | – | – | **ambigu** |

### Réserve (affichée « Archives »)

| Le geste | Comment ça s'enregistre | Ce que l'écran dit | Échec | Verdict |
|---|---|---|---|---|
| « Archiver… » un groupe-cours (Chrome, dossier lié) | Manuel, écrit dans le dossier | « Archive enregistrée » `[lu]` | « Erreur de archive » (coquille) `[lu]` | clair |
| Même geste sous Safari, puis annuler l'aperçu | – | L'archive est inscrite à la liste « Archives enregistrées » alors qu'aucun fichier n'existe `[lu]` | – | **ment** |
| Rouvrir une archive, reprendre ses ressources | Manuel, confirmé | « Réimport terminé » `[lu]` | « Erreur de réimport » | clair |

### Autres écrans

| Écran et geste | Comment ça s'enregistre | Ce que l'écran dit | Verdict |
|---|---|---|---|
| Bilan réflexif › Auto-réflexion | Auto à la sortie du champ, **et** un bouton « Enregistrer » | « Auto-réflexion sauvegardée » `[lu]` | **ambigu** |
| Bilan réflexif › « Charger les données de démonstration » | Remplace les vrais résultats importés, **sans confirmation** | « Données de démonstration chargées » `[lu]` | **ambigu** (risque de perte) |
| Suivi › Animation › Tirage : exclure des élèves | Auto à chaque clic ; le reste attend « Appliquer » | « Annuler » n'annule pas les exclusions `[lu]` | **ambigu** |
| Labo › Suivi longitudinal | Manuel, « Inscrire au registre », « Ajouter » | Résumé mis à jour ; « Retirer » un résultat sans confirmation `[lu]` | clair |
| Tableau de bord : élèves suivis | Auto au clic | « Cinq élèves suivis au maximum… » `[lu]` | clair |
| Partage (fichiers de grille) | Manuel | « Package de … importé » `[lu]` | clair |
| Portfolio : artefacts retenus | Auto au clic | Rien ; en cas d'échec, « Erreur lors de la sauvegarde » `[lu]` | clair |
| Rythme | Auto | Rien `[lu]` | clair |
| Aide › FAQ | – | « Mes données sont-elles sauvegardées automatiquement ? — Oui, toutes les modifications sont sauvegardées automatiquement dans ton navigateur. » `[exécuté pour la question, lu pour la réponse]` | **ment** : faux pour les 16 écrans manuels |

## 4 · Les sens du mot « enregistrer »

L'hypothèse de Cowork est **confirmée dans les faits, mais elle n'explique qu'une partie de ce que les usagers ont dit**.

**Les trois sens coexistent, et le mot ne les distingue jamais :**

- **(a) écrire dans le navigateur** : les boutons « Enregistrer » du Cadre, des présences, de l'évaluation, des grilles ;
- **(b) écrire un fichier sur le disque ou la clé USB** : « Enregistrer le codex », « Enregistrer sous… », « Enregistrer en TXT » (rapport de bogue), « Codex enregistré » ;
- **(c) verser à la Réserve** : « Archive enregistrée », « Archives enregistrées ».

Un quatrième usage s'y ajoute : **(d) « sauvegarder » au sens d'une copie de secours**. On le trouve sur la carte « Sauvegarder » de l'Accueil, dans « Le registre est sauvegardé par l'export complet », et dans le rappel « Protège tes données », qui parle d'« exporter » un « fichier JSON ».

**Où (a) et (b) se confondent réellement** `[exécuté]` :

- le témoin du Codex dit « Tout est enregistré » (sens b) quand rien n'a été mis dans un fichier ;
- les détails du Codex disent « « Enregistrer le codex » pour sauvegarder tes données actuelles », ce qui laisse entendre qu'elles ne le sont pas autrement.

**Pourquoi cette confusion n'explique pas tout.** Tes usagers croyaient devoir enregistrer alors que l'application le faisait déjà. Or cette croyance naît surtout d'un conflit **entre (a) et (a)** : le même bouton « Enregistrer » trône sur des écrans qui s'enregistrent seuls (évaluation, réglages, grilles, échelles, auto-réflexion) et sur des écrans où il est indispensable (Cadre, présences, productions, interventions).

L'écran n'offre **aucune marque commune** pour distinguer les deux régimes. Il y a :

- aucun témoin « Enregistré » partagé : chaque écran a le sien, ou n'en a pas ;
- **« sauvegardé » et « enregistré » employés indifféremment** pour le même geste : 35 et 94 occurrences à l'écran ou dans le code `[lu]` ;
- le mot « Sauvegarder » sur huit boutons, dont celui de la rétroaction.

---

# 5 · Recommandations (séparées du constat)

Ce sont des propositions. **Rien n'est décidé.**

1. **Grille : critère perdu à l'« Enregistrer ».** Je recommande un lot court **avant** toute décision d'ensemble, parce que c'est une perte de données active dans un écran que tu utilises. Si tu es d'accord, je l'inscris au BACKLOG (issue 2 aujourd'hui, sur consigne) et une session le corrige seule. Tarir la source ne réparera pas le stock : une grille qui a déjà perdu un critère ne le retrouvera pas. Ce que je ne sais pas mesurer d'ici, c'est si l'une de tes grilles réelles l'a déjà subi.
2. **Pour les écrans automatiques, la décision la plus économe à mon avis :** retirer le bouton « Enregistrer » là où tout s'écrit déjà (réglages, outils d'observation, auto-réflexion, grilles et échelles existantes), et poser partout un seul et même témoin (par exemple « Enregistré » discret après chaque écriture). Pour l'évaluation, le mot « Non enregistrée » décrit en réalité « non verrouillée » : c'est un mot que tes élèves ne voient pas, mais que toi tu vois, et il remonte à toi (mots d'écran).
3. **Pour les écrans manuels qui le restent** (présences, Cadre, productions, interventions, confidentiel), la pièce qui manque est l'avertissement « Tu as des modifications non enregistrées » quand on quitte. Aujourd'hui, la perte est silencieuse partout.
4. **« Enregistrer » réservé à un seul sens.** Une piste : garder « Enregistrer » pour le fichier du Codex (sens b), qui est le seul geste vraiment manuel que tu demandes à tes usagers (« avant de partir, enregistre le codex sur ta clé USB »), et ne plus l'employer pour l'écriture dans le navigateur.
5. **Les messages qui disent « enregistré » sur un échec** (#618, #786) : les cinq endroits encore vivants sont nommés dans l'annexe. Le message de mémoire pleine qui dit « Les données sont sauvegardées » est faux à chaque fois qu'il s'affiche.

**Dispositions** (règle d'un audit, CLAUDE.md) : chaque constat de ce document est **« à trancher par Grégoire »**, comme le demande la consigne (§ 5). Il n'est pas inscrit au BACKLOG tant que tu n'as pas tranché. Seul le code mort relevé en annexe (§ A7) reçoit l'issue 3 : commenté ici, sans suite.

---

# PARTIE 2 – Annexe technique (pour la session qui corrigera)

## A1 · Le banc `[exécuté]`

- **Script** : un script Playwright jetable, déposé sous `tests/_sonde-enreg-jetable.mjs` le temps de l'exécution, puis retiré. `git status` le confirme propre. La copie de référence est restée dans le scratchpad de la session ; elle n'est pas versionnée.
- **Environnement** : WebKit (Playwright), `file://index.html`, un contexte neuf par scénario, `activerModeDemo()`, données fictives du pack démo (élèves `DEMO0xx`).
- **Relevé** : tout ce que l'écran affiche, par un `MutationObserver` sur les nœuds `.notification-avec-icone` ajoutés à `body`, et `page.on('dialog')` pour les `alert`/`confirm`.
- **Gestes** :
  - vrais boutons quand c'est possible (`page.click('[data-action="enregistrerPresences"]')`, `sauvegarderTrimestreCompletV2`, `ajouterCritereGrille`, `sauvegarderGrilleComplete`, `sauvegarderToutesPreferencesV2`, `#btn-codex`) ;
  - sinon `value` + `dispatchEvent('change')` sur les vrais champs.
- **Échecs simulés** :
  - `db.setSync` remplacé pour les clés `*presences` : il lève `DOMException('quota','QuotaExceededError')`, ou `Error` ;
  - anonymisation par `basculerModeAnonymisation()`.

| Scénario | Mesure | Résultat |
|---|---|---|
| Présences, date sans saisie | `obtenirDonneesSelonMode('presences')` filtré sur la date | 0 entrée ; écran « Présents : 10 / Total : 10 », aucun message |
| Présences, saisie puis `allerCoursSuivant()` / `allerCoursPrecedent()` | valeur du champ `periodes_DEMO004` | 0 → 2 (perdu), note vidée, 0 message |
| Présences, saisie puis `naviguerVers('suivi','liste')` / `'saisie'` | idem | perdu, 0 message |
| Présences, case `#checkbox-verrouillage-presences` | entrées en base pour la date | 0 → 10, libellé « Verrouillée », 0 message |
| Présences, quota simulé | toasts ; base | erreur « Espace de stockage presque plein – Les données sont sauvegardées… » + succès « Présences enregistrées » ; base inchangée |
| Présences, `Error` simulée | toasts ; base | succès « Présences enregistrées » ; base inchangée |
| Présences, anonymisation, « Enregistrer » | toasts | erreur « Modification impossible – Impossible de sauvegarder les présences en mode anonymisation » ; base inchangée |
| Présences, anonymisation, verrou | `localStorage` `*datesVerrouillees` ; présences | verrou écrit, présences réécrites, 0 message |
| Seuils 85/80, puis bouton | dialogues, toasts, `seuilsInterpretation` | alert « Erreur : Les seuils doivent être ordonnés… » (au `change` puis au bouton) + succès « Préférences enregistrées » ; clé inchangée ; champ à 85 |
| Cadre, « Enregistrer » (démo, session vide) | toasts | erreur « Identification incomplète… » + succès « Cadre du trimestre sauvegardé » (avec ou sans changement d'année) |
| Grille `GRILLE_DEMO_1759243306842` | `criteres.length` en base | 5 → 6 (ajout) → 5 (« Enregistrer »), succès « Grille "…" sauvegardée ! » |
| Évaluation sans copie (`evaluerProduction`, EV3, échelle posée, niveau choisi) | clé brute `cle('evaluationsSauvegardees')` | 0,3 s : absente ; 2,8 s : présente, `verrouillee:false` ; texte d'état du formulaire : seul « Enregistrer » ; Liste : « … NON ENREGISTRÉE – 100% » |
| Même geste en anonymisation | trace de `sauvegarderDonneesSelonMode` ; clé brute ; après `reload` | `→ false`, aucun `setSync` ; la clé semble contenir l'évaluation pendant la séance, absente après rechargement ; 0 message |
| Codex : `_codex_etat` posé « actif, sans modification », présences enregistrées | texte de `#codex-menu-statut-haut` | « Tout est enregistré » avant **et** après ; `modificationsDepuis` reste `null` |

**Remarque sur l'anonymisation.** L'autosave pousse la nouvelle évaluation dans le tableau rendu par `db.getSync(cle('evaluationsSauvegardees'))`, puis l'écriture est refusée (evaluation-chargement.js:2037, 2041). Ce tableau étant probablement l'objet du `memoryCache` (inférence), la séance voit l'évaluation, et le rechargement la perd.

## A2 · `sauvegarderDonneesSelonMode` (`js/modes.js:848`) et `db.js`

- **Valeurs de retour** : `false` en anonymisation (l. 851-854, `console.warn` seulement) ; `'quota'` (l. 870-878, avec le toast « … Les données sont sauvegardées… », faux) ; `'error'` (l. 880-882, rien à l'écran).
- **28 appels réels** (les 33 lignes du grep comptent aussi la définition, l'export et 3 commentaires). Tests du retour :
  - retour ignoré : 13 ;
  - `if (!…)` : 12 ;
  - `=== true` / `!== true` : 3.
- **Sites vivants qui affichent un succès sur `'quota'`/`'error'`** (#618 et #786 tiennent toujours) :
  - `evaluation.js:1908` (modification) ;
  - `evaluation.js:2584` (cadenas) ;
  - `liste-evaluations.js:2284`, `2967`, `3065` ;
  - `saisie-presences.js:1706` (**mesuré**).
- **Sites morts ou injoignables** : `evaluation.js:1934`, `1960`, `2393`, `2458`, `2498`, `2540`. La « Banque d'évaluations » est sans `#modalBanqueEvaluations` dans `index.html`.
- **Seuls appelants complets** : `evaluation-sauvegarde.js:489` (`!== true`, quatre messages, l. 326-343) et `evaluation-jetons.js:278` (`=== true`, « Modification non enregistrée — … »).
- **Silence total** :
  - `evaluation-chargement.js:2005`, `2041` (autosave) ;
  - `travaux-ui.js:3795` ;
  - `travaux-ui.js:7161` (`=== true`, mais F et E ferment la modale sans message) ;
  - `liste-evaluations.js:2358` ;
  - `indices.js:336` ;
  - `migrations.js:1036` : le drapeau de migration est posé à l. 1039 même sur un refus.
- **Cinquième cas invisible** : la garde #340 `db._ecritureAutorisee` (`db.js:168-190`) fait un `return` nu. `sauvegarderDonneesSelonMode` rend alors `true` sans rien écrire.
- **`db.setSync`** (`db.js:1494-1584`) :
  - quand le localStorage est plein et qu'IndexedDB est prêt, repli silencieux sur memoryCache et IDB (l. 1556-1562) ;
  - il ne **lève** que si IDB est absent ou pas encore prêt (l. 1566) ;
  - un échec IDB asynchrone donne seulement un `console.warn` (l. 1597-1599) ;
  - **il ne lit jamais le mode** : 384 appels directs dans 78 fichiers écrivent en anonymisation.
- **Seuil réel IDB** : `SEUIL_IDB_FIRST` = 25 Ki caractères (l. 120). L'en-tête de `db.js` et `CLAUDE.md` disent « 200 Ko ».
- **`beforeunload`** : trois seulement.
  - `db.js:1803` : écritures IDB en vol, boîte générique ;
  - `codex.js:253` : codex modifié ;
  - `travaux-annotation.js:131` : vide l'annotation. Sa tentative de vider l'autosave de l'évaluation passe par `typeof _flusherAutoSave`, toujours faux, car c'est un nom privé d'une autre IIFE (l. 116-121).
  - `navigation.js` et `main.js` : aucune garde.

## A3 · Par zone : fichier, ligne, mécanisme

**Cadre.**
- `trimestre-v2-init.js:277-280` : `sauvegarderTrimestreCompletV2` appelle identification puis cadre, sans condition. D'où le double toast (mesuré) ; « Cadre du trimestre sauvegardé » l. 395.
- Journées sans cours : l. 700-743. Bornes et semaines : l. 401-483.
- `trimestre-v2-enseignants.js:81-93` et `trimestre-v2-horaires.js:834-961` : le toast part avant le `setSync` (`groupes-cours.js:618-830` idem).
- `etudiants.js:622-740` : `await db.modifier` sans try.
- Anonymisation vérifiée seulement à `trimestre-v2-etudiants.js:354`, `965`.
- Archivage : `trimestre-v2-liste.js:199-222` et `trimestres.js:699-722` (`exportGenere` non lu ; « Erreur: undefined »).

**Conception.**
- `grilles.js:5013-5210` : ajout et gestion des critères et sous-critères par `db.modifier`, **sans synchroniser `grilleTemplateActuelle`**. Puis `sauvegarderGrilleComplete` (l. 5430) → `sauvegarderGrilleTemplate` réécrit l'objet mémoire périmé (l. 690-710). Toast l. 772. **Mesuré.**
- « Annuler » : `grilles.js:5367`, `echelles.js:2305`.
- « puis enregistre » : `echelles.js:2990-2993`.
- Cartouches :
  - auto au blur : `cartouches.js:711`, `761-780`, `885-892` ;
  - nom et contexte spécifique manuels : `index.html:5414`, `cartouches.js:881-884`, `1007` ;
  - message « pas encore enregistrée » : l. 912-924.
- Pratiques :
  - auto : `pratiques-gestion.js:1457-1581` ;
  - jetons sans gestionnaire : l. 2545, 1691-1710 ;
  - « Enregistrer la pratique » : l. 1727-1747.
- Assistant :
  - « créée » en édition : `wizard-pratique-v2.js:2199-2215` ;
  - grille de base créée même si on annule : l. 1811-1827.
- Productions : `productions.js:2020-2112`.
- Méthode inexistante `notifications.avertissement` : `grilles.js:4267`, `travaux-ui.js:2304`.

**Alignement.**
- Auto à la frappe : `planification-carte.js:7118-7121`.
- Titre de l'Inspecteur sans `sauvegarder()` : l. 3101-3109.
- Erreur avalée : `planification-donnees.js:145-150`, `planification-bibliotheque.js:40-46`.

**Évaluer.**
- Autosave 1,5 s : `evaluation-chargement.js:1697-1722`.
- Déclencheurs :
  - niveau : l. 1630 ;
  - points : l. 1672 ;
  - rétroaction : l. 1743.
- **Non déclencheurs** :
  - données algorithmiques : `evaluation-handlers.js:22-40` ;
  - statut de remise et intégrité : `evaluation-sauvegarde.js:555-600` contre `evaluation-chargement.js:1878-1932`.
- Création refusée sans échelle résolue (#697) : l. 2029-2033. Le banc a dû poser l'échelle.
- Badge « Non enregistrée » : `liste-evaluations.js:142`, `1391-1397`.
- Bulle de rétroaction : `travaux-ui.js:7128-7170`.
- Annotation 2 s : `travaux-annotation.js:20`, `3222-3240`, `206`, `266-276`.

**Présences.**
- `saisie-presences.js:1591-1711` (test l. 1706).
- Verrou : `sauvegarderPresencesSansValidation` l. 831-849, 897-991 (commentaire #736 l. 838).
- Date par défaut « présent » : l. 1326-1330.
- Reconstruction au changement : l. 1062-1080, 1871, 1902, 2260-2282.

**Interventions.**
- `interventions.js:1423-1580`.
- Report des présences qui ignore les entrées existantes : l. 1567-1573, `saisie-presences.js:2345-2362`.
- Perte au changement d'onglet : l. 1690-1697.

**Profil.**
- Confidentiel : `profil-etudiant-confidentiel.js:264`, sans garde d'anonymisation. Notes de présence : l. 201-219.
- « Mes notes » : `profil-etudiant-rapport.js:269`, `449`, `460`.
- Bulle « pas sauvegardé automatiquement » : l. 196.

**Réglages.**
- `preferences-v2.js:443-447` : `sauvegarderToutesPreferencesV2` affiche le succès sans lire le refus de `sauvegarderSeuilsV2` (l. 337-340). **Mesuré.**
- Aides :
  - `index.html:8686` (Outils d'observation) ;
  - `index.html:11235` (Préférences) ;
  - `index.html:13737-13739` (FAQ).

**Codex.**
- `marquerModification()` n'a que deux appelants : `codex.js:3059` (renommer) et `3213` (fusionner). Rien ne la déclenche lors d'une écriture de données. **Mesuré.**
- `genererCodex` remet `modificationsDepuis` à `null` avant l'écriture sur disque : l. 446-454.
- Aperçu annulé → `null` lu comme résultat : l. 425-427, 2786-2805.
- Auto 5 min : l. 2564-2635.
- Rappel : `modal-backup-reminder.js:187-229`, sélecteur de repli `[data-sous-section="import-export"]` inexistant.

**Réserve.**
- Entrée du manifeste écrite avant l'aperçu Safari : `reserve.js:1252-1299`.
- « Erreur de archive » : l. 1200-1235.

**Autres.**
- `bilan-reflexif-reflexion.js:50`, `349-353`, `408-415`.
- `bilan-reflexif-csv.js:61-101` (démo sans confirmation).
- `boite-outils.js:386-453` (Tirage).
- `rechargement-sur.js:65` affirme « Tes données sont enregistrées — rien n'est perdu. », sans vérification.

## A4 · Libellés, comptes `[lu]`

- **Toasts de succès** : « sauvegardé(e) » ≈ 35, « enregistré(e) » ≈ 94 (≈ 45 à l'écran).
- **Aucun composant commun** d'état d'enregistrement : le grep sur indicateur / témoin / statut × enregistr / sauvegard ne rend rien.
- **Boutons « Sauvegarder »** :
  - `cc-license.js:1409` ;
  - `grilles.js:263`, `5528` ;
  - `horaire.js:1329` ;
  - `liste-evaluations.js:1884` ;
  - `objectifs.js:338`, `513`, `589` ;
  - `productions-import-export.js:575` ;
  - `travaux-ui.js:6307`, `7128` ;
  - `trimestre-v2-init.js:632`.
- **Vouvoiement dans des `alert`** : « Veuillez… », dans grilles, échelles, cartouches, productions.

## A5 · Ce que le banc n'a pas vu

- Tout ce qui est marqué `[lu]` : notamment le Codex sous Chrome (dialogue de fichier), la Réserve sous Safari, les cartouches, les pratiques, l'Alignement, le Profil.
- Aucune mesure sur Safari réel ni sur iPad.
- Aucune mesure sur tes données réelles.

## A6 · Contexte de la mesure

- Démonstration : `trimestreActif = demo`, session vide dans le Cadre. C'est pourquoi le Cadre répond « Identification incomplète » : le double toast y est mesuré dans ce cas, et lu (non mesuré) pour « Changement bloqué » et « Trimestre déjà existant ».

## A7 · Code mort relevé en chemin (issue 3 : noté ici, sans suite)

- `evaluation.js` : `verrouillerEvaluationIndividuelle`, `deverrouiller…`, `verrouillerToutesEvaluations`, la Banque (l. 2378-2556), le bandeau « MODE MODIFICATION » (l. 1973-2012).
- `sauvegarderGroupeEtudiantsV2`, `confirmerSeanceV2` (Cadre).
- `objectifs.js` (sans écran).
- `sauvegarderPratiqueMateriel`, `ouvrirModaleSauvegardeConfig`, `sauvegarderCritere`.
- L'assistant de migration des catégories (`productions-import-export.js:575`, 682-688).
- `viderRapport` (`profil-etudiant-rapport.js:378`).
