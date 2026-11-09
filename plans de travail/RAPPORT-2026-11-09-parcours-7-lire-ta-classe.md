# Rapport — le septième parcours, « Lire ta classe et intervenir » (session F, nuit du 8 au 9 nov. 2026)

**Branche** : `lot/parcours-7-lire-ta-classe`, partie de `origin/lot/parcours-1-et-2` (`a328bb9f`). Consigne :
`plans de travail/CONSIGNE-LOT-2026-11-08-parcours-7-lire-ta-classe.md` (recopiée de `main`, commitée avec le lot).
Rien au changelog, pas de release, pas de fusion. **Chromium seulement** (WebKit n'existe pas dans ce cloud) : le
verdict WebKit et les captures WebKit se prennent sur le Mac.

> **Mis à jour le 9 nov. 2026, après les décisions de 9 h 37 à 9 h 39 (Cowork)** : les huit questions sont tranchées,
> les six phrases proposées sont validées et posées, le point 7 est corrigé (section suivante). Reste au Mac : le
> verdict WebKit et la fusion.

## Les corrections du 9 nov. (ce que tu verras)

- **Les six phrases proposées sont validées**, mot pour mot, et ne portent plus de marque « proposé » : les refus
  de l'anonymisation, de l'option RàI, de la collecte ACP, de la démo et du service d'orthopédagogie, et la phrase
  de l'étape 2 sur une personne sans donnée. Dans la démo, « Commencer » ne la quitte pas : le panneau dit
  seulement pourquoi. La sentinelle Vitest exige chacune.
- **Une assiduité de 0 % est maintenant une donnée** (point 7, décision de Cowork dans la ligne de #743). La
  personne absente à toutes les séances, sans production, a son Accompagnement complet et « + Nouvelle
  intervention ». Le parcours la suit comme les autres. La phrase de l'étape 2 ne vaut plus que pour une personne
  dont l'assiduité est inconnue (arrivée après les séances saisies, par exemple) et qui n'a aucune production.
- Rien n'est écrit dans tes données : la règle se calcule à l'affichage. Aucun stock à réparer.

### Ce que chaque lecteur de la règle affichait, et ce qu'il affiche

Mesuré sous Chromium, sur un groupe monté par les formulaires du Cadre : une personne absente aux deux séances
saisies (0 %), sans production, sans pratique assignée.

Ce tableau date des corrections du matin. Depuis la retouche de 13 h 44, la colonne RàI et la carte disent
« Non-participation » quand le groupe permet déjà d'en juger (un travail dû, une copie évaluée) ; le tableau ci-dessous
reste vrai tant qu'il ne le permet pas.

| Lecteur de `aucuneDonneeDeSuivi` | Avant | Maintenant |
|---|---|---|
| Profil › Accompagnement (`js/profil-etudiant-sections-affichage.js:857`) | Trois cartes « En attente de données » ; ni l'historique des interventions, ni « + Nouvelle intervention » | Ses trois cartes : Contexte d'apprentissage (« Assiduité (A) : 0 % », complétion « — ») ; Observation SOLO (« Aucune évaluation retenue pour cet·te étudiant·e… ») ; RàI « En attente » (« Données insuffisantes · Aucune production évaluée… », « Mobilisation : Assiduité 0 % ») ; l'historique et « + Nouvelle intervention » |
| Suivi › Liste, colonne RàI (`js/etudiants.js:1250`) | « — » | « — », inchangé ici : son niveau RàI est 0 (« En attente »). Inférence tirée du code, non mesurée : la colonne montrerait un niveau si une production diagnostique en fixait un sans note (`_niveauFixeParLeDiagnostic`), comme le profil le montre déjà |
| Septième parcours, étape 2 (`sansDonnee`) | Renvoyée aux noms, avec la phrase de l'étape 2 | Suivie jusqu'à « + Nouvelle intervention » |
| Bancs qui la lisent | `sentinelle-749-lot2` (un faux de la règle) ; `assiduite-lot-D-date-arrivee-et-inconnu` (assiduité inconnue) | Inchangés, verts |

## La retouche du 9 nov. (13 h 44) : l'absent·e total·e en non-participation

Décision de Grégoire (Cowork), sur la question de ce rapport : une personne absente à toutes les séances passées, sans
production, est lue en non-participation et reçoit le niveau RàI que cette règle donne déjà (niveau 3, #731).

### Ce qui change

- La condition « assiduité au-dessus de 0 » devient « au moins une séance passée connue » : une assiduité connue,
  0 % compris (`_seLitEnNonParticipation`, `js/profil-etudiant-calculs.js`). Le reste de #731 ne bouge pas : il faut
  toujours un travail dû et une copie évaluée dans le groupe.
- **Avant la première séance** (assiduité inconnue), rien ne change : « En attente ».
- **Une personne marquée inactive reste hors des signaux.** Mesuré : sans garde, la règle neuve la faisait passer au
  niveau 3 dans Suivi › Liste (colonne RàI et filtre « niveau 3 »). La garde : une personne absente partout qui est
  hors des calculs du groupe (`estEtudiantExclu`) reste « En attente », comme avant. **Mon hypothèse, à corriger au
  besoin** : la garde vaut pour les trois statuts que l'application traite ensemble (inactivité, décrochage,
  abandon), pas pour l'inactivité seule. Une personne inactive qui est venue au moins une fois, sans production, était
  déjà en non-participation sur son profil et dans la liste : rien ne change pour elle.
- La cible d'intervention ne recopie plus la règle : elle suit la carte RàI (#744). La règle vit dans une seule
  fonction.
- Ce qui s'écrit (relecture du 9 nov.) : le niveau se calcule à l'affichage, mais deux endroits en gardent une
  trace. Une intervention enregistre l'analyse de son sous-groupe quand on y reporte les présences (`niveauxRai`,
  `patternsCommuns`, `js/interventions.js`) : celles déjà enregistrées gardent l'ancien compte, datées ; les suivantes
  prennent le nouveau. Le cache `indicesPatternsRaI` est recalculé à chaque rendu de l'Aperçu. **Aucun stock à
  réparer** : la règle change la source, pas ce qui est déjà écrit. Le module des instantanés, qui lirait le niveau, est
  en commentaire (`js/snapshots.js`).

### Ce que montre chaque lecteur du niveau RàI, pour ce cas

Mesuré sous Chromium sur un groupe monté par les formulaires du Cadre : un travail dû, une copie évaluée d'une autre
personne, une personne absente aux deux séances (active), une autre absente aux deux séances puis marquée inactive.

| Lecteur | Personne absente partout, active | Personne absente partout, inactive |
|---|---|---|
| Profil › Accompagnement, carte RàI | « En attente » → **« Non-participation »**, niveau 3, avec la description de ce niveau (voir les textes à corriger) | « En attente », inchangé |
| Suivi › Groupe, filtre « RàI 2-3 » | absente des retenues → **retenue** (3/5 → 4/5) | hors de la liste du Suivi, inchangé |
| Suivi › Groupe, les bandes (A, C, P) | sans filtre, inchangées (« A 0 % » comme avant). Avec « RàI 2-3 » actif, ses trois bulles sont colorées en corail comme celles des personnes retenues (`appliquerCouleursPrioritaires`, mesuré par la relecture) ; avant, aucune | hors de la liste, inchangé |
| Aperçu, « Modèle de la Réponse à l'intervention » | « Niveau 3 Intensif » compte une personne de plus (sur ce groupe : 3 → 4, 60 % → 80 %) ; une de moins « en attente de sa note du cours » | n'y entre pas, inchangé |
| Aperçu, barre des patterns | elle compte une personne de plus sous « Difficulté persistante » (3 → 4) : la barre range déjà la non-participation des présent·es à cet endroit | n'y entre pas, inchangé |
| Suivi › Liste, colonne RàI | « — » → **« Niveau 3 »** | « — », inchangé |
| Suivi › Liste, filtre « niveau 3 » | absente → **présente** | absente, inchangé |
| La répartition du groupe (le réglage des seuils) | une personne de plus au niveau 3, une de moins hors des pourcentages | n'y entre pas, inchangé |
| Suivi › Liste, filtre « Profils » | « Données insuffisantes » → **« Non-participation »** (relecture) | inchangé |
| Suivi › Liste, tri et corrélations Pattern ↔ P et RàI ↔ P | elle entre dans les corrélations (score 0, niveau 3) : les valeurs de r affichées bougent (relecture, lu dans le code) | exclue des corrélations, inchangé |
| Aperçu, l'alerte « … présent·e sans aucun travail remis » | **déjà là avant la retouche** dès qu'une pratique est assignée : elle retient toute assiduité connue, 0 % compris, depuis #743, et la dit « présent·e », « A : 0 % » (mesuré par la relecture). Sixième texte à corriger, plus bas | — |
| Formulaire d'intervention : la carte « Niveaux RàI » et le niveau à côté de chaque personne cochée | niveau 3 (relecture, lu dans le code) | sans objet |
| Septième parcours, condition d'entrée | inchangé : elle était déjà signalée (A sous le seuil) | inchangé (exclue) |
| Fiche d'intervention, niveau proposé | inférence tirée du code, non mesurée : 3 (`js/interventions.js`, le niveau du profil) | sans objet |

### Les textes qui disent « présent·e », à corriger (proposés, pas posés)

Pour l'absent·e total·e, six textes lus à l'écran sont faux : cinq le deviennent avec la règle neuve, le sixième
l'était déjà (trouvé par la relecture). **Je n'en ai touché aucun.** Ma proposition pour chacun, à valider ou à
corriger :

1. **L'Aide, « Repérer les patterns de progression »** (`index.html`, accordéon `accordeon-aide-patterns`). Aujourd'hui :
   « Non-participation : présent·e en classe, mais aucune production évaluée, quand le groupe permet d'en juger (un
   travail dû et au moins une copie du groupe évaluée). » Proposé : « Non-participation : aucune production évaluée
   après au moins une séance, présent·e ou absent·e, quand le groupe permet d'en juger (un travail dû et au moins une
   copie du groupe évaluée). »
2. **Le guide pédagogique** (`js/guides-pedagogiques.js`), même phrase : même proposition.
3. **La carte d'information « Profils d'apprentissage »** (`index.html`) : « Non-participation : Présent·e en classe,
   aucune production évaluée ». Proposé : « Non-participation : aucune production évaluée, présent·e ou absent·e ».
4. **L'infobulle du filtre des patterns** (`js/accompagnement-contenu-hover.js`) : « non-participation (présent·e, rien
   de remis) ». Proposé : « non-participation (rien de remis, présent·e ou absent·e) ».
5. **La description de la carte RàI du profil** (`js/profil-etudiant-calculs.js`, `_niveauNonParticipation`) :
   « Étudiant·e présent·e en classe mais aucune production remise. Profil prioritaire nécessitant une intervention
   immédiate. » Elle se lit sur le profil d'une personne précise. Deux voies : une phrase commune, « Aucune production
   remise depuis le début des séances, présent·e ou absent·e. Profil prioritaire nécessitant une intervention
   immédiate. » ; ou deux phrases, la présente telle quelle et, pour l'absent·e total·e, « Absent·e à toutes les
   séances passées, et aucune production remise. Profil prioritaire nécessitant une intervention immédiate. » Je
   recommande les deux phrases : la carte dit alors ce qui est vrai pour cette personne-là.
6. **L'alerte de l'Aperçu** (`js/tableau-bord-apercu.js`, `afficherAlerteNonParticipation`) : « N étudiant·e présent·e
   sans aucun travail remis », suivie, pour chacun·e, de « A : 0 % » quand c'est le cas. Fausse depuis #743 pour
   l'absent·e total·e, avant cette retouche. Proposé : « N étudiant·e sans aucun travail remis » (la ligne de chacun·e
   donne déjà son assiduité).

La sentinelle de l'Aide (`sentinelle-aide-2026-10-28-lot-2c-bis`) relie déjà ce texte au code par sa phrase « Non-participation » le
niveau 3 ; elle ne lit pas « présent·e ». Quand une proposition sera validée, l'essai de ce texte sera à mettre à jour avec.

### Ce qui reste à trancher (relecture du 9 nov.)

- **Une personne inactive qui est venue au moins une fois, sans production**, reste au niveau 3 sur son profil et dans
  Suivi › Liste, comme avant la retouche ; l'inactive jamais venue, elle, reste « En attente ». J'ai lu « comme
  aujourd'hui » comme le maintien de ce qui existait. Lue au mot, « une personne marquée inactive reste hors des
  signaux » pourrait viser aussi ce cas. À trancher (Cowork) ; aucun banc ne fixe ce cas pour l'instant.
- **À inscrire** : le harnais de `sentinelle-731-non-participation-quand-un-travail-est-du` fait passer A = 0 pour une
  assiduité inconnue (`assiduite: null`), contraire à #743 ; son essai à 0 % ne vérifie donc pas l'alerte de l'Aperçu,
  que la page montre.
- **Commenté dans le code, sans suite** : la garde des personnes hors du groupe ne lit que le groupe-cours actif ; le
  cache des patterns, qui parcourt le trimestre, peut lire autrement une personne exclue d'un autre groupe (cache lu
  seulement en repli d'erreur).

### Les essais

- **Playwright (Chromium)**, un essai neuf dans le banc du parcours : sur le groupe décrit plus haut, plus une personne
  arrivée après les séances, il vérifie la règle (niveau 3 pour l'absente, « En attente » pour l'inactive et pour
  l'arrivée) et chaque lecteur mesuré (profil, « RàI 2-3 », Aperçu, colonne et filtre de la liste). Break-tests :
  la condition remise à « A > 0 » → **rouge** ; la garde des personnes hors du groupe retirée → **rouge**. Rétablies →
  vertes. Banc complet : **7 / 7** hors captures (3 sautés). `assiduite-lot-D-date-arrivee-et-inconnu` et
  `profil-etudiant-chargement` : verts.
- **Vitest** : trois bancs encodaient l'ancienne règle (« jamais présent → En attente », modélisé par A = 0) :
  `sentinelle-731-non-participation-quand-un-travail-est-du`, `sentinelle-niveau-au-critere-2026-10-30` (deux essais),
  `sentinelle-aide-2026-10-28-lot-2c-bis`. Leur intention est gardée (sans séance passée, assiduité inconnue : « En
  attente ») et le cas décidé est ajouté (absente partout : non-participation). Le cliquet de complexité
  (`sentinelle-contenir-complexite`) avait vu une fonction de plus au-dessus de 15 : la règle est sortie dans sa propre
  fonction, et il repasse au vert. Vitest complet : **10 912 / 10 912**, 894 fichiers.
- Jeton : `profil-etudiant-calculs.js` 20261108j.
- **Relecture par un agent neuf** (la retouche, `fbd071d`). Verdict, en une ligne : **la règle est juste et fait ce que
  la décision demande, sans toucher aucun texte affiché ; le rapport était incomplet sur les lecteurs et faux à deux
  endroits, et un sixième texte « présent·e » manquait.** Il a vérifié les cas `null`, 0 et au-dessus, la garde #731
  fermée, le décrochage (inchangé : la cible dit déjà « Décrochage »), la démo (sans effet : chacun·e y a des copies),
  et fait cinq break-tests (quatre rouges ; le cinquième est le cas à trancher plus haut). Ce que j'en ai fait : le
  tableau des lecteurs complété (bandes, filtre « Profils », corrélations, formulaire d'intervention, alerte de
  l'Aperçu), la phrase sur ce qui s'écrit corrigée, le sixième texte ajouté, le compte du banc corrigé, une précision
  au tableau du matin, un commentaire dans le code.

## En tête, en gestes d'utilisateur (premier dépôt, nuit du 8 au 9 nov.)

### Ce qui est fait

- Dans le panneau « Assistance », un parcours de plus : « Lire ta classe et intervenir », avec sa ligne
  « Avant chaque cours, voir qui a besoin de toi et de quoi ; puis, si tu le décides, noter une intervention. »
- « Commencer » ne part que si ton groupe-cours réel a des présences saisies et qu'au moins une personne s'écarte
  (A ou C sous ton seuil le plus bas, ou RàI 2-3). Sinon, le panneau reste ouvert et dit pourquoi, sous le bouton,
  avec tes deux phrases validées.
- Les neuf bulles, mot pour mot : les bandes, « Détails », un filtre et une pastille, le profil sur l'engagement
  (les pastilles d'absence et de production restent sous le voile), « Accompagnement », la grille de dépistage
  (étape 5, seulement si aucune n'est désignée), « + Nouvelle intervention », la fiche, « Créer l'intervention »,
  l'après (le statut « Complétée » montré, sous le voile), puis la dernière bulle, au centre, sans voile, et
  « Terminer ».
- « Plus tard » sur chaque bulle sauf la dernière ; le parcours attend dans le panneau (« Étape n sur 9 »,
  « Reprendre ») ; Échap vaut « Plus tard » (« Terminer » à la dernière bulle).
- Le parcours n'écrit rien de lui-même : seuls tes gestes écrivent (le choix de la grille, l'intervention créée).
  Il ne garde que son état dans le panneau (la préférence `parcoursAssistance`, comme les autres parcours).

### Les huit questions, tranchées (9 nov. 2026, 9 h 37 à 9 h 39)

1. **Mode anonymisation** : validé par Grégoire, « En mode anonymisation, une intervention ne garde ni son titre ni tes observations : reviens au mode normal pour faire ce parcours. »
2. **Option RàI décochée** : validé par Grégoire, « Ce parcours passe par l'onglet « Accompagnement » du profil : coche « Appliquer une adaptation du modèle de la Réponse à l'intervention » dans Labo › Observation pour le commencer. »
3. **Collecte ACP décochée** : validé par Grégoire, « Ce parcours passe par l'onglet « Engagement ACP » du profil : coche « Activer la collecte des données sur le contexte d'apprentissage et la performance » dans Labo › Observation pour le commencer. »
4. **Dans la démo** : validé par Grégoire, « Ce parcours se joue sur ta propre classe : quitte la démonstration pour le commencer. » « Commencer » ne quitte pas la démo lui-même (déjà le cas).
5. **Service d'orthopédagogie** : validé par Grégoire, « Ce parcours se joue sur un groupe-cours : choisis-en un dans l'en-tête pour le commencer. »
6. **Personne sans donnée à l'étape 2** : validé par Grégoire, « Son profil n'a encore aucune donnée que l'Accompagnement puisse lire : choisis une autre personne. »
7. **Une assiduité de 0 % n'est pas « aucune donnée »** (Cowork, dans la ligne de #743) : corrigé maintenant, hors du parcours, parce qu'il cassait le parcours en livraison. Ses lecteurs, avant et après : tableau plus haut. Le parcours ne traite plus ce cas comme le point 6.
8. **Le placement de la bulle aux étapes 3 et 7** : on garde (Grégoire a approuvé les captures des neuf étapes et du panneau).

### Ce qui attend encore Grégoire

Aucun texte n'a été écrit en dehors des six phrases validées. **Tranchée le 9 nov. à 13 h 44** (voir « La retouche du
9 nov. », plus haut) : la question ci-dessous. Restent à valider : les six textes qui disent « présent·e », et le cas
de la personne inactive venue au moins une fois.

La question, relevée par la relecture :

- La personne absente à toutes les séances, sans production, a maintenant son Accompagnement, mais son niveau RàI
  reste 0, « En attente » : la non-participation exige une assiduité au-dessus de 0 (`js/profil-etudiant-calculs.js:1975`,
  « Élève présent mais aucune production », #731). Elle n'est signalée que par sa pastille A. Est-ce ce que tu veux,
  ou l'absent·e total·e devrait-il ou elle être lu·e en non-participation ? Je n'ai pas de recommandation ferme :
  l'absence et la non-participation sont deux signaux que tu as distingués jusqu'ici.

### Ce que je n'ai pas pu vérifier

- **WebKit et Safari** : tout s'est joué sous Chromium (banc et captures). À refaire sur le Mac, branche par branche.
- **Tes données réelles** (à mesurer sur le Mac) : sur ton groupe, le panneau laisse-t-il entrer ? Qui est
  signalé ? La leçon manquée s'affiche-t-elle sous une absence avec ta carte d'alignement ? Ta grille de dépistage
  est-elle déjà désignée (l'étape 5 se sauterait) ?
- **L'iPad** : le toucher à travers les trous du voile, le menu natif des grilles à l'étape 5, la fiche qui défile
  sous le voile à l'étape 7.

## Le détail

### Ce qui est livré

| Fichier | Quoi |
|---|---|
| `js/parcours-lire-ta-classe.js` (neuf) | Le parcours : ses neuf étapes, sa condition d'entrée (`refus`), sa reprise, les masques |
| `js/assistance.js` | Trois lignes de plus au toucher de « Commencer » : si le parcours déclare `refus` et qu'il rend une phrase, elle s'affiche sous le bouton (`<p class="assistance-parcours-refus" role="status">`, `textContent`), le panneau reste ouvert, rien ne part |
| `css/parcours.css` | La variante de voile `aucun` (étape 9, « sans voile ») et le style du refus |
| `index.html` | La balise du parcours après `parcours-classe.js` ; jetons `?v=20261108b` (jour du build : la sentinelle anti-cache refuse un jeton d'un autre jour sans release) |
| `tests/integration/parcours-7-lire-ta-classe-2026-11-09.spec.js` (neuf) | Le banc de bout en bout |
| `tests/unit/sentinelle-parcours-lire-ta-classe-2026-11-09.test.js` (neuf) | Les mots, confrontés à la consigne |
| `tests/integration/parcours-1-et-2-2026-11-08.spec.js` | Le panneau compte trois parcours sur cette branche (« 1 sur 3 », trois titres, trois lignes, trois états) |
| `plans de travail/captures-2026-11-09-parcours-7-chromium/` | Les captures (liste plus bas) |

### Ce que j'ai décidé seul (hypothèses nommées)

- **« Présences saisies »** = au moins une personne du groupe-cours actif dont l'assiduité est connue (la bande A a
  un point). Des présences saisies sous un horaire sans périodes (#830) ne comptent donc pas : le panneau dit alors
  « Commence par « Mettre ta classe en place » ».
- **« Signalée »** = exactement le filtre « A ou C < … » du Suivi (`borneBasseAssiduiteCompletion`, seule source)
  ou un niveau RàI 2 ou 3 (`determinerNiveauRaiPedagogique`), parmi les personnes actives (`estEtudiantExclu`).
- **L'ordre des refus** : démo, service, présences, personne signalée, puis RàI, ACP, anonymisation. Les deux
  manques de données passent avant les réglages : « commence par tes présences » est plus utile que « change ton mode ».
- **L'ordre dans le panneau** : celui des balises `<script>` d'`index.html`, comme la première partie. Sur cette
  branche seule, le parcours est le troisième de la liste (pastille « 3 », compteur « sur 3 ») ; après les fusions,
  septième (et le compteur compte tous les parcours inscrits, neuf avec ceux de la nuit). La consigne dit « le
  compteur compte sept parcours » : elle a été écrite avant les parcours 8 et 9.
- **« Plus tard »** ferme la bulle sans message (la consigne « Les deux parcours » n'en prévoit pas pour « Plus
  tard » ; celui de « Découvrir » est propre à « Quitter le parcours »).
- **La personne retenue et la fiche ouverte vivent en mémoire seulement** (pas dans le stockage : un DA dans une
  préférence voyagerait avec elle). Après un rechargement, « Reprendre » à une étape entre 3 et 7 repart de
  l'étape 2 ; à l'étape 8, la bulle se lit sans la fiche si elle n'est plus connue.
- **Étape 8** : la consigne dit « La fiche, contour sur le statut » (et non « la fiche éclairée », comme à
  l'étape 7) : seul le contour est ouvert dans le voile, et masqué. La bulle se pose à côté sans couvrir le statut.
- **Étape 9** : « sans voile » veut dire rien d'assombri **ni de retenu** : la page reste à portée de main
  derrière la bulle (relecture neuve, constat 3).
- **Étape 5** : la bulle a deux temps (le lien « Régler les outils d'observation » de la carte RàI, puis, dans
  Labo › Observation, le menu), sans changer de numéro. Le menu est amené dans la vue une fois la page immobile :
  `ouvrirOutilsObservation` défile en douceur vers le haut de la sous-section, et le menu passait à l'écran puis
  repartait (mesuré au banc).

### Ce qu'il faudrait au moteur (la première partie), et comment j'ai contourné

1. **Garder sous le voile une partie d'une zone éclairée** (les pastilles de l'étape 3, le statut de l'étape 8).
   Un trou du voile ne peut pas contenir de plein : deux trous qui se recouvrent sont fondus (`fusionnerTrous`).
   Contournement, sans toucher au moteur : un second chemin `#parcours-masques`, posé dans le SVG du voile, recouvre
   ces éléments (recalculé à chaque passage de la sonde, retiré avec le voile). **Ce qu'il faudrait** : une option
   d'étape `masques: () => Element[]` dans `parcours-moteur.js`.
2. **Un voile qui ne voile rien** (étape 9) : la variante `.parcours-voile--aucun` (une règle CSS).
3. **Une condition d'entrée** : `refus` dans la définition d'un parcours, lu par `assistance.js`. Les parcours 4, 5,
   6, 8 et 9 en ont besoin aussi : à la fusion, garder **une** façon de le faire (celle-ci est en trois lignes).
4. **Le placement de la bulle quand la zone ne tient pas à l'écran** (étapes 3 et 7) : voir la question 8.

### Les vérifications « À VÉRIFIER AVANT DE POSER LES TEXTES »

Lecture du code (et banc Chromium quand il est dit).

| Étape | Verdict | Où |
|---|---|---|
| 1 : les bandes « Assiduité (A) », « Complétion (C) », « Performance (P) » | **tient** | `js/tableau-bord-apercu.js:2036` |
| 1 : « N évaluations en attente » / « N séances en attente » | **tient** | `js/tableau-bord-apercu.js:1879-1884` ; vu au banc (« 1 évaluation en attente », « 3 évaluations en attente ») |
| 1 : zones de A et C depuis Labo › Observation, de P depuis l'échelle | **tient** | `_badgeIndiceSuivi`, `js/tableau-bord-apercu.js:684-688` ; `zonesDeLaBarre` (contexte-qualification.js) |
| 2 : filtres en intersection, personnes retenues en tête | **tient** | `appliquerFiltres`, `js/tableau-bord-apercu.js:434-499` ; vu au banc (la personne à l'écart remonte en tête) |
| 2 : « les plus éloignées de tes seuils d'abord » | **tient, avec une nuance** | pour « A ou C » et « P », le tri suit l'écart au seuil ; pour « RàI 2-3 » seul, il suit le niveau (3 avant 2), puis l'ordre alphabétique (`:487`). Je ne propose pas de retouche : le niveau est lui-même une distance |
| 2 : le toucher d'une pastille ouvre le profil, puis Engagement ACP après 100 ms | **tient** | `js/tableau-bord-apercu.js:1224-1234` ; vu au banc |
| 3 : la leçon manquée dans la pastille (`badge-absence-lecon`) | **tient** (lecture) ; **non vérifiable ici** sur une vraie carte | `js/profil-etudiant-sections-affichage.js:599`, `:1851` |
| 4 : la recommandation du palier le plus bas | **tient** | « …rencontrer l'étudiant·e pour comprendre les absences ou les travaux manquants… », `js/contexte-qualification.js:408` |
| 4 : le niveau ne vient ni de A ni de C, sauf en non-participation | **tient** | `classerNiveauAuCritere`, `js/profil-etudiant-calculs.js:1796` ; non-participation `:1975` (ligne d'après les corrections du 9 nov.) |
| 4 : niveau 1 ou « En attente » sans difficulté dans les productions | **tient** | `:1797-1805` ; vu au banc (« En attente ») |
| 5 : le choix s'enregistre au changement, gardé par #806 | **tient** | `_sauvegarderGrilleReferenceSiFiable`, `js/preferences-v2.js:267` ; vu au banc (préférence écrite, étape 6 atteinte) |
| 5 : au retour, l'Accompagnement affiche le défi | **tient** (lecture) ; au banc, sans évaluation, il n'y a pas encore de défi à afficher | |
| 6 : `naviguerVersNouvelleIntervention`, intervalle de 50 ms abandonné après 2 s | **tient** ; le parcours se repère sur `[data-fiche-intervention]` | `js/profil-etudiant-sections-affichage.js:4148-4164` |
| 7 : la fiche se crée-t-elle sans titre ? | **oui** : rien ne l'exige (l'attribut `required` n'est pas lu, il n'y a pas de `<form>`). **Ce qui s'écrit** : `titre: ''` (`js/interventions.js:1533`) ; la fiche rouverte et la liste montrent alors un titre vide. La bulle avance quand même | inscrit (n° 6) |
| 7 : le cochage des critères part 100 ms après l'ouverture | **tient** | `js/interventions.js:1262-1275` |
| 7 : « Suggérer » ne propose rien sans critère coché | **tient, et plus** : sans critère coché, il **efface** l'objectif déjà écrit (`js/interventions.js:1430`, `:1437`). Or la bulle dit « écris ton objectif toi-même » quand l'intervention porte sur les absences | inscrit (n° 7) |
| 7 : « l'application propose le 3 quand son profil l'y situe, sinon le 2 » | **tient** | `js/interventions.js:825-829` |
| 7, anonymisation | **ne tient pas** (« Donne-lui un titre » impossible) | voir la question 1 |
| 8 : « Marquer cette intervention complétée ? », case décochée | **tient** | `_demanderReport`, `js/interventions.js:1716` ; textes `:119-121` |
| 8 : le bilan seulement à « Complétée » ; ne compare que les critères ciblés | **tient** | `js/interventions.js:1147` et suivantes |
| Option RàI décochée : onglet et bouton disparaissent | **tient** | `pref: 'activerRai'`, `js/profil-etudiant-sections-affichage.js:2319` ; voir la question 2 |
| Une personne sans aucune donnée | **tient** (ni historique ni bouton) | `js/profil-etudiant-sections-affichage.js:857` ; voir la question 6 |
| Étape 9 : « Labo › Observation » | **tient** | `{ id: 'accompagnement', label: 'Observation' }`, `js/config.js:90` |

### Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| Une assiduité de 0 % compte comme « aucune donnée » (`aucuneDonneeDeSuivi`) | ~~Inscrire (n° 5)~~ **Corrigé le 9 nov.** (décision de Cowork : il cassait le parcours en livraison) |
| Une intervention créée sans titre a un titre vide | **Inscrire** (n° 6) |
| « Suggérer » efface l'objectif écrit quand aucun critère n'est coché | **Inscrire** (n° 7) |
| À 390 px, la rangée des filtres du Suivi déborde à droite (« A ou C < 8… » coupé) ; vu sur la capture de l'étape 2 | **Inscrire** (n° 8) |
| « Découvrir », étape 1 : si « Détails » était déjà actif, `avant` retire `ouvert` du panneau sans désactiver le bouton ; il faut alors deux touchers pour avancer (lecture du code, `js/parcours-decouvrir.js:146-147`, non exécuté) | **Inscrire** (n° 9), code de la première partie |
| Le parcours, au refus « sans présences », ne distingue pas « aucune séance » de « séances sans périodes » (#830) | **Commenter et oublier** : le message reste juste (« Mettre ta classe en place » mène à l'horaire) |

### À inscrire au BACKLOG

Les quatre de la consigne (questions et décisions de Grégoire du 8 nov. ; chacune se mesure et se propose à
Grégoire avant tout code) :

1. **Dépister quand les critères varient d'une production à l'autre** (question de Grégoire, 15 h 58). Le dépistage
   ne lit qu'une grille et reconnaît les critères des autres grilles par leur nom (`trouverCritereDepistage` : nom
   normalisé, égalité ou préfixe) ; un·e enseignant·e dont les critères changent n'a ni défi, ni force, ni critères
   ciblés, ni bilan. Piste jugée « très bonne » par Grégoire : rattacher chaque critère aux objectifs de la carte
   d'alignement, qui traversent les productions. Remarque de Grégoire : « le devis ministériel propose déjà des
   critères de performance pour chaque élément de compétence. Ils ne sont pas obligatoires, mais ce sont des pistes
   très pertinentes pour l'enseignant. » (La fiche du cours porte déjà « Éléments de compétence ».)
2. **Des recommandations transparentes, sur lesquelles l'utilisateur·rice a prise** (Grégoire, 16 h 10) :
   « L'application doit être transparente sur les recommandations qui sont faites, comment sont-elles créées, sur
   quelle base, et l'utilisateur devrait pouvoir intervenir dans la création de ces recommandations. » Mesuré par
   Cowork : aucune IA, des règles fixes ; le « Seuil de défi spécifique » (70 % par défaut, « seuil conventionnel ;
   non validé empiriquement », `interpretation-config.js`) ne vient pas de l'échelle de l'enseignant·e ; un critère
   peut être « en défi » à 68 % au-dessus du seuil de réussite ; « De 60 % (plus exigeant) à 80 % (moins exigeant) »
   se lit dans les deux sens ; à mesurer aussi au regard de « une seule source par famille de seuils » (30 oct.).
3. **Le bilan d'une intervention compare aussi l'assiduité, la complétion et l'écart avec le groupe** (décision de
   Grégoire, 16 h 12). Aujourd'hui, il ne compare que les critères ciblés ; l'« avant » ne garde ni A ni C (mesuré
   ici : `snapshotAvant[da] = { P, criteres }`, `js/interventions.js:1571-1590`). Le bilan dira aussi qu'une
   remontée n'est qu'un indice. Le stock : les « avant » déjà figés sans A ni C, à assumer et écrire. Quand ce lot
   sera fait, l'étape 8 du parcours sera à revoir.
4. **La fiche d'intervention, sans grille de dépistage, dit « Configure une grille de référence dans Conception ›
   Grilles de critères »** (`js/interventions.js:985`) ; le réglage est dans Labo › Observation.

Les miennes (trouvées en chemin) :

5. ~~**Une assiduité de 0 % compte comme « aucune donnée »**~~ **Corrigé le 9 nov. (question 7) : ne pas inscrire.** Dans `aucuneDonneeDeSuivi`
   (`js/profil-etudiant-calculs.js:1938`) : la personne absente à toutes les séances, sans production, n'a ni
   historique ni « + Nouvelle intervention », alors que le Suivi la signale. Contredit #743. Symptôme visible : le
   bouton manque sur le profil de la personne la plus absente.
6. **Une intervention créée sans titre a un titre vide** (fiche rouverte, liste) : rien n'exige le titre.
7. **« Suggérer » efface l'objectif déjà écrit** quand aucun critère n'est coché (`js/interventions.js:1430`, `:1437`).
8. **À 390 px, la rangée des filtres du Suivi déborde** à droite du panneau des noms (capture de l'étape 2).
9. **« Découvrir », étape 1 : deux touchers sur « Détails » quand il était déjà actif** (lecture du code, à mesurer).
10. **(Relecture du 9 nov.) Le refus « service d'orthopédagogie » n'est joué par aucun essai dans le navigateur**
    (`js/parcours-lire-ta-classe.js`, `refus()`). La sentinelle juge ses mots, pas son câblage : si la branche
    rendait une autre phrase, rien ne rougirait. Il faudrait monter un service dans le banc. Aucun symptôme vécu.

### Les essais

- **Le test de la consigne** (`le bouton refuse sans présences, refuse quand personne ne s'écarte, lance avec une
  seule personne sous le seuil d'assiduité et aucune évaluation`) : sur un groupe-cours réel monté par les
  formulaires du Cadre, présences prises par l'écran de saisie. Il échoue avant ce lot (le parcours n'existe pas).
  **Break-tests** (9 nov.) : `refus()` qui rend toujours `null` → **rouge** (aucun refus affiché) ; la condition
  qui ignore A → **rouge** (personne n'est signalé). Rétablis → vert.
- **Le banc complet du parcours**, sous Chromium : 9/9 (le test de la consigne ; les neuf étapes sans grille
  désignée ; avec grille désignée, l'étape 4 mène à l'étape 6 ; une personne absente à toutes les séances, à 0 % :
  signalée, puis l'étape 2 dit pourquoi elle ramène aux noms, et une autre personne mène à l'étape 3 (**réécrit le 9 nov.** : voir
  « Corrections du 9 nov. » plus bas) ; « Plus
  tard », « Reprendre » et Échap ; les refus proposés ; trois passes de captures). Break-test de la personne à
  0 % : sans le message, **rouge** ; rétabli, vert. Il vérifie aussi que les pastilles d'absence (étape 3) et le statut
  (étape 8) **reçoivent le toucher du masque**, pas d'eux-mêmes, et que l'intervention créée porte la personne,
  son « avant » et le statut « en préparation ».
- **La sentinelle des mots** (Vitest) : neuf titres, neuf textes, cinq gestes, trois boutons, le titre et la ligne
  du panneau, les deux refus validés, confrontés à la consigne ; les cinq refus proposés (**validés le 9 nov.**, voir plus bas) absents de la consigne et
  présents dans ce rapport. **Break-test** : « avant chaque cours » changé en « avant chaque séance » dans la bulle
  de l'étape 1 → **rouge**, rétabli → vert.
- **Les bancs de la première partie, sous Chromium** : parcours-1-et-2, accueil-epure, guidage-demo verts, sauf
  deux familles qui **échouent aussi sur la base** `a328bb9f` sous Chromium (mesuré dans un arbre de travail à
  part) : trois tests d'en-tete-epure (des mesures en pixels de l'en-tête) et la géométrie du panneau dans
  parcours-1-et-2 (429,99 px au lieu de 430, position lue pendant le glissement d'entrée). Rien à voir avec ce lot ;
  le verdict se prend sous WebKit sur le Mac.
- **Vitest complet** (depuis `tests/`) : 10 900/10 900, 893 fichiers.
- **Corrections du 9 nov.** Vitest : la sentinelle des mots exige les six phrases validées, mot pour mot, et
  l'absence de toute marque « proposé » (break-test : « reviens au mode normal » changé en « reviens en mode
  normal » → **rouge**, rétabli → vert) ; un banc neuf, `sentinelle-assiduite-zero-est-une-donnee-2026-11-09`,
  juge la règle sur sa source réelle (break-test : la règle remise à `A === null || A === 0` → **rouge**, rétablie →
  vert). Vitest complet : **10 910 / 10 910**, 894 fichiers. Playwright (Chromium) : le banc du parcours, **6 / 6**
  (l'essai de la personne à 0 % réécrit : une personne arrivée après les séances, sans donnée, est renvoyée aux noms
  avec la phrase ; la personne à 0 % mène à « + Nouvelle intervention », sans « En attente de données » ; break-test
  de la règle → **rouge**, rétablie → vert). `assiduite-lot-D-date-arrivee-et-inconnu` (l'assiduité inconnue reste
  « En attente de données ») : vert. Jetons : `profil-etudiant-calculs.js` 20261108h, `parcours-lire-ta-classe.js`
  20261108d.
- **Relecture par un agent neuf** : voir la dernière section.

### Conflits attendus à la fusion (la session du Mac s'en charge)

- `index.html` : la balise du parcours après `parcours-classe.js`, et les jetons de `assistance.js` et
  `parcours.css` ; les parcours 3 à 6 se placent **avant** celui-ci, 8 et 9 après.
- `js/assistance.js` : la condition d'entrée (`refus`) ; d'autres branches de la nuit en ajouteront une.
- `tests/integration/parcours-1-et-2-2026-11-08.spec.js` : le nombre de parcours (« 1 sur 3 », les titres, les
  lignes, les états).

### Les captures (Chromium)

`plans de travail/captures-2026-11-09-parcours-7-chromium/` : les neuf étapes à 1180 px en sombre et en clair
(l'étape 5 en deux temps, `5a` et `5b`) ; l'étape 4 avec une grille désignée (`p7-etape-4-1180-sombre-grille-designee`,
qui mène à l'étape 6) ; les étapes 1, 2 et 7 à 390 px en sombre et en clair ; le panneau dans quatre refus (sans
présences, personne à l'écart, et deux des textes proposés cette nuit-là, validés le 9 nov. : RàI, anonymisation).

### La relecture par un agent neuf

**Seconde relecture, des corrections du 9 nov.** (un agent neuf, avec les deux décisions et le diff de `aa703d6`).
Verdict, en une ligne : **le commit tient, avec quatre réserves mineures ; aucun défaut bloquant.** Il a comparé les
six phrases caractère par caractère (apostrophes, espaces, guillemets : identiques), cherché tous les lecteurs de la
règle (trois, tous au tableau) et tout autre endroit qui traiterait A = 0 comme « aucune donnée » (aucun), relancé
Vitest (10 910 / 10 910) et le banc (6 / 6), et fait trois break-tests, tous rouges (la règle sans condition sur A ;
une apostrophe typographique et une espace insécable dans deux phrases ; l'Accompagnement seul qui diverge de la
règle). Ce que j'ai fait de ses réserves :
- une variable morte dans la sentinelle des mots (la lecture du rapport) : retirée ;
- un commentaire devenu faux dans `js/profil-etudiant-sections-affichage.js` (« elle aussi ») : corrigé (jeton
  20261108h) ;
- deux refus jamais exercés dans le navigateur : celui de la collecte ACP est maintenant joué par l'essai des refus ;
  celui du service d'orthopédagogie ne l'est toujours pas (inscrit, n° 10) ;
- trois passages du rapport d'avant les corrections : marqués comme réécrits, la référence de ligne corrigée.
Il relève aussi une question de didactique : elle est plus haut, sous « Ce qui attend encore Grégoire ».

**Première relecture (nuit du 8 au 9 nov.)** :

Verdict de l'agent neuf (il n'a eu que la consigne et le diff) : **« tient avec réserves »** — la condition
d'entrée laissait partir le parcours pour une personne que l'étape 2 renvoyait sans un mot (A = 0 %) ; un banc de
la première partie était rouge au deuxième commit. Ses deux break-tests (la condition sans A ; les masques de
l'étape 3 neutralisés) rougissent ; aucun écart de texte (comparaison indépendante des neuf bulles, du titre, de la
ligne et des deux refus) ; règles de CLAUDE.md respectées.

Ce que j'en ai fait : l'étape 2 dit maintenant pourquoi elle ramène aux noms (question 6), avec un essai et son
break-test ; le banc de la première partie était déjà corrigé au commit suivant ; l'étape 9 ne retient plus le
toucher ; le masque de l'étape 8 ne couvre plus que le contour (il assombrissait deux fois le reste du statut).
Le compteur « sur 3 » de cette branche est une supposition nommée plus haut ; le couplage des masques au SVG du
moteur est le contournement décrit dans « Ce qu'il faudrait au moteur ».
