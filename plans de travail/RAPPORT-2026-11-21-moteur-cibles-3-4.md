# Rapport – « Par standards », lots 3 et 4 : le niveau retenu par cible, puis la note

> **L'adresse d'essai fixe : https://deploy-preview-46--codexnumeris-051225.netlify.app**
> (PR d'aperçu en brouillon, « ne pas fusionner » : https://github.com/bedardg71-codexnumeris/labo-codex/pull/46).
> Toute correction ultérieure ira sur la branche `lot/moteur-cibles-3-4-retenu-note` : l'adresse ne change pas.
>
> **Corrections du 21 nov., 13 h 30 (Cowork), § 9.** Un commit par correction : `dbef22e3` (la liste des étudiant·es
> bornée à « Par standards »), `54757eb1` (« CIB » nulle part). **Mesuré** : la garde du lot 0, 16 sur 16 ; Vitest
> complet, un seul worker, sur le code de `54757eb1` : 942 fichiers, 12 150 verts, 0 rouge ; Chromium, les specs des
> lots 2, 3 et 4 : 13 sur 13 ; la liste d'une pratique « Par sélection de productions » rendue à l'identique de la base
> (relevé épinglé, contre-épreuve sur la base) ; aucun « CIB » sur six écrans ni dans le CSV ; l'Aperçu d'une classe
> entière en attente. **Non mesuré** : WebKit, l'iPad au doigt, l'adresse elle-même (refusée par le proxy du conteneur).
> **Le Mac passe sous WebKit la tête de la branche** : son code est celui de **`54757eb1`** (le commit qui porte ce
> rapport ne change que des documents), avec `par-standards-lots-3-4.spec.js`, `par-standards-lot-2-inscrire.spec.js` et
> `tableau-de-notation-1.spec.js`.
>
> **Relais (21 nov. 2026).** Branche `lot/moteur-cibles-3-4-retenu-note`, partie de `lot/moteur-cibles-2-inscrire`
> (`8ed02c6f`), puis réunie à `lot/moteur-cibles-1-cibles` (`8feaac75`, `main` à 1.252.0 ; un seul conflit, des jetons
> anti-cache d'`index.html`). **Rien n'est fusionné dans `main`, aucune release.** Session : Claude Code dans un conteneur
> cloud Linux. **WebKit n'y existe pas** : tout ce qui est « vu » l'est sous Chromium (§ 1). `RELAIS.md` (sur `main`) n'est
> pas touché : ce rapport tient lieu de relais de la branche.
> **Fait** : les gestes 3 et 4 entiers (les 15 points du mandat), la phrase du changelog 1.252, les textes proposés, le
> plan (décisions du mandat en tête, chacune avec son origine), dix captures.
> **Reste** : la relecture des textes par Grégoire (avec ceux du lot 2) ; le passage WebKit du Mac (§ 1) ; les questions
> du § 7 ; les essais de Grégoire puis des trois enseignant·es (§ 4).

## 1. Ce qui est mesuré, lu, non vu

**Mesuré** (une commande l'a rendu) :

- **La sentinelle des lots 3 et 4** : `tests/unit/sentinelle-par-standards-lots-3-4.test.js`, 41 essais, une section par
  règle (R1 à R15), sur les modules réels ; l'ordre des niveaux et la valeur ponctuelle sont tirés du code réel
  (`tests/unit/_helpers/moteur-cibles.js`), pas recopiés. **23 break-tests**, au moins un par règle de 1 à 12 (et 13 à 15),
  tous rouges puis retirés ; journal en fin de fichier.
- **La garde du lot 0 rejouée : 16 sur 16** (mêmes chiffres nu et habité ; aucun moteur existant ne lit les clés neuves ;
  le cliquet des six moteurs). **Le sens inverse**, que le lot 0 ne pouvait pas épingler : la note par cibles ne lit ni les
  évaluations, ni `indicesCP`, ni les productions (R13, break-test BT13 : une seule lecture ajoutée rougit).
- **Les sentinelles des lots 1 et 2**, révisées là où le mandat change l'écran (la case retenue, la note qui se calcule) :
  26 et 41 essais ; chaque essai révisé le dit.
- **Vitest, suite complète, un seul worker** : 942 fichiers, 12 147 verts, 0 rouge (§ 8).
- **Playwright sous Chromium** : `tests/integration/par-standards-lots-3-4.spec.js`, 6 sur 6 (le tableau et sa colonne de
  note, la fenêtre et le dernier plus bas, le profil, la liste et l'export, l'arrêt des notes, la fiche et le double seuil) ;
  `par-standards-lot-2-inscrire.spec.js` révisée, 6 sur 6 ; rejouées sans régression : `tableau-de-notation-1`,
  `sentinelle-717-editeur-cibles`, `lot-n4-spe-note-absente-cause`, `depistage-542-niveau-global-selon-pratique`,
  `profil-754-un-seul-rendu`, `lot-e3-creer-ou-modifier`, `assiduite-lot-D-date-arrivee-et-inconnu` (58 verts, 10
  captures sautées par leur spec). Break-test au navigateur : la garde de la liste retirée, la spec voit « 0 % » et rougit.
- **Les lecteurs, au navigateur** (banc : trois étudiant·es fictifs, une évaluation « par habitude » à 95 pour une
  étudiante sans inscription) : pendant la session, l'indice stocké, `simulerIndices`, la liste, l'export et le tableau
  disent tous « — » ou « non constructible » et la cause pour les deux étudiant·es en attente, 81 pour la troisième ; à
  l'arrêt des notes, 81, 19 et 0, statut « final ». L'évaluation à 95 n'est lue nulle part.
- **Dix captures** : `plans de travail/captures-2026-11-21-par-standards-lots-3-4/` (1180 × 820 et 820 × 1180, mode
  clair, échelle 2 ; le tableau, l'historique d'une case, le profil, la fiche). Vues : à 820 px, la colonne de la note se
  coupait au bord du défilement ; elle est maintenant fixée à droite.

**Les lecteurs de la note, un à un** (plan, § 5) :

| Lecteur | Ce qu'on y voit pour une note absente | Degré |
|---|---|---|
| Profil, section « Cibles » | « Pas encore de note. » et les cibles nommées ; ou « Note non calculable. » et le motif | mesuré |
| Profil, « Engagement ACP », « Accompagnement », « Rapport » | « — » et la cause (gardés par `noteConstructible`, avant ce lot) | lu (audit) |
| Profil, en-tête « Développement des habiletés » (*borné à « Par standards » le 21 nov., 13 h 30, § 9*) | **était « 0 % » précédé du code du niveau le plus bas** ; écrit « — » | corrigé, lu ; la section ne paraît qu'avec un portfolio et des artefacts |
| Tableau de notation (cibles) | « En attente » et les cibles ; « Non calculable » | mesuré |
| Liste des étudiant·es (*borné à « Par standards » le 21 nov., 13 h 30, § 9*) | **était « 0 % »** dès qu'une copie était remise ; « — », hors de la moyenne, des corrélations, et sous toute note au tri | corrigé, mesuré |
| Export des résultats finaux | cellule vide, « non constructible – » et la cause | mesuré |
| PDF de synthèse | aucune note pour cette pratique (il ne connaît que STD et SOM) ; aucun « 0 » | lu |
| Comparateur, profils fictifs | « — non constructible » (les profils fictifs n'ont pas d'inscriptions) | mesuré |
| Comparateur, mon groupe | la note, ou « — non constructible » | lu (même porte que l'export) |
| Exploration (« Construction de la note ») | aucune note, mais une description fausse de la pratique (§ 6) | mesuré |
| Indice stocké (`indicesCP`) | `P: 0` **et** `noteConstructible: false` (l'encodage #394, inchangé) | mesuré |
| Aperçu (tableau de bord) | badges et filtres gardés ; **les corrélations r(A↔P) et r(C↔P) comptent ce 0** (texte affiché seulement si \|r\| ≥ 0,5) | lu (audit) ; **non corrigé** (§ 6) |
| Méthodologie du profil (panneau caché) | « Indice P = 0 % » possible pour une pratique sommative seulement ; pas pour celle-ci | lu |
| Captures d'interventions, `indicesPatternsRaI` | un 0 rangé, sans lecteur ni appelant trouvé | lu (latent) |

**Non vu** :

- **Safari (WebKit) et l'iPad au doigt.** **Le Mac doit passer sous WebKit** : `par-standards-lots-3-4.spec.js`,
  `par-standards-lot-2-inscrire.spec.js` (révisée), `tableau-de-notation-1.spec.js` ; et, si le jeton du Mac le demande, la
  suite entière (`cd tests && npm test`). À l'œil sur l'iPad : la colonne de la note fixée à droite pendant que les cibles
  défilent (debout), le nom « Données insuffisantes » sur deux lignes dans une case, la case « Double seuil » et ses deux
  champs numériques (clavier de l'iPad), la section « Cibles » du profil (le tableau du récit défile seul).
- Le mode sombre (aucune capture sombre ; les couleurs neuves sont des variables de `styles.css`).
- L'adresse d'aperçu elle-même : le proxy du conteneur la refuse ; je ne l'ai pas ouverte (l'aperçu est construit par
  Netlify à chaque poussée, vert pour le premier commit de la branche).
- La démo, l'archivage d'un trimestre et la fusion d'un codex devant `doubleSeuil` : un champ de plus dans la
  configuration d'une pratique, qui voyage avec elle (*lu*, non joué).
- Les cas A et B du banc du plan : le banc n'avait pas été committé (plan, § 12) ; la sentinelle pose ses propres cas.

## 2. Ce que j'ai supposé

- **Le niveau retenu, entre deux inscriptions du même meilleur niveau** : la **première** qui l'a démontré (sa date, son
  origine, sa rétroaction). Second choix : la plus récente de ce niveau. La note n'en dépend pas.
- **La moyenne des cibles terminales est pondérée** par leurs poids (identique au cas de référence quand elles pèsent
  autant).
- « Inférieure » strict (60 pile non plafonné) : **supposé par Cowork**, à confirmer (mandat, point 8). Le niveau « sans
  donnée » inscrit = cible sans inscription : **tranché par Cowork, supposé** (point 11).
- **L'arrêt des notes est la case « Notes finalisées »** : supposé par Cowork, **mesuré** juste (c'est
  `configuration.notesFinales`, lue par l'export et le PDF, écrite pour toutes les familles, visible dans la fiche d'une
  pratique par standards). Elle vaut pour la pratique, donc pour tous les groupes qui l'emploient.
- **Deux arrondis**, comme pour les autres pratiques : la note entière au tableau, à la liste et à l'export (l'indice P,
  `arrondirIndiceSurCent`) ; une décimale au profil.
- **Le double seuil se règle dans la fiche** de la pratique, pas dans l'assistant (éteint au départ, l'assistant n'avait
  rien à demander ; le récapitulatif dit où le trouver).
- **Les mots** : tous proposés (`TEXTES-2026-11-21-par-standards-lots-3-4.md`, les questions Q1 à Q10 en tête).

## 3. Où je m'écarte du mandat, et pourquoi

1. ~~**La liste des étudiant·es et un en-tête du profil changent pour toutes les pratiques.**~~ **Retiré par la correction 1 du 21 nov., 13 h 30 (§ 9) : la garde ne joue plus qu'en « Par standards ».** Le point 13 demande qu'une note
   absente ne s'affiche « 0 » nulle part ; dans cette pratique, toute la classe est sans note tant qu'une cible est en
   attente, et la liste écrivait « 0 % » pour chacun·e (mesuré). La garde suit l'encodage existant (#394,
   `noteConstructible`) : une note non constructible d'une autre pratique s'écrit aussi « — » et sort de la moyenne
   « moy=… » de la liste. **Aucune note ne change** ; seule l'écriture d'une note absente change. La garde du lot 0 est
   verte.
2. **La case d'une cible sans donnée perd son « + »** au profit du nom du niveau « sans donnée » (point 3, appliqué au
   tableau) ; le libellé lu d'une case dit aussi désormais les inscriptions annulées (« …, aucune inscription, 1 annulée »).
3. **`etatDeLaCase` est retirée** (le lot 2) : sans lecteur une fois la case passée au niveau retenu (règle zéro-dette).
4. **Hors du mandat, non fait** : les sigles du Comparateur et la description de l'Exploration (§ 6) ; ils ne touchent pas
   la note.

## 4. Les gestes à faire sur l'aperçu

**Grégoire, d'abord (pour préparer l'adresse lundi matin)**

1. Ouvrir l'adresse sur l'iPad et sur le Mac.
2. Dans Conception, ouvrir les pratiques de notation et créer une pratique avec l'assistant : choisir « Par standards ».
3. Dire les cibles du cours : pour chacune, une étiquette, un énoncé, des critères (cocher ceux qui sont essentiels), un
   poids ; marquer au moins une cible « Cible terminale ». Choisir l'échelle de départ et son niveau « sans donnée ».
   Enregistrer. Lire le récapitulatif : il dit comment la note se fait.
4. Appliquer la pratique à un groupe qui a quelques étudiant·es fictifs.
5. Dans Évaluation, ouvrir le tableau de notation : une colonne par cible, et la colonne « Note » à droite, qui dit « En
   attente » et nomme les cibles sans donnée.
6. Toucher une case, choisir « Avancé », écrire une rétroaction, inscrire. Puis, pour la même cible, inscrire « Ça y est
   presque » à une date plus récente : la case garde « Avancé ». Rouvrir la case : la phrase sous « Niveau retenu » dit
   que le dernier niveau est plus bas.
7. Pour une autre cible, inscrire seulement une remarque (« Aucun niveau » et un texte) : la case reste « Données
   insuffisantes », avec ✎.
8. Remplir toutes les cibles d'un·e étudiant·e : la note paraît dans la colonne.
9. Annuler l'inscription « Avancé » (avec une raison) : le niveau retenu redescend au meilleur des autres ; l'inscription
   reste, barrée.
10. Dans Suivi, ouvrir le profil de cet·te étudiant·e, bouton « Cibles » : la note et son calcul (chaque cible, sa valeur,
    son poids, sa part, la moyenne), puis chaque cible, son niveau retenu, son origine, sa rétroaction, et toutes ses
    inscriptions.
11. Ouvrir les réglages de la pratique (le lien au-dessus du tableau) : cocher « Double seuil », lire le seuil (60) et le
    plafond (55). Revenir au tableau : une note dont les cibles terminales sont faibles dit « plafonnée » ; le profil dit
    pourquoi.
12. Cocher « Notes finalisées » dans les réglages : les cibles sans donnée comptent pour 0 %, et chaque étudiant·e a une
    note. Décocher pour revenir à la session.
13. Dans Suivi, la liste des étudiant·es : « — » pour celles et ceux qui n'ont pas encore de note, jamais « 0 % ».
    Exporter les résultats finaux : la note, ou « non constructible » et la raison.
14. Dans Conception, ouvrir une production : la pondération n'est plus exigée.

**Les trois enseignant·es, ensuite** (chacun·e sur son propre appareil : leurs essais restent dans leur navigateur)

1. Ouvrir l'adresse. Créer un trimestre, un cours, un groupe et quelques étudiant·es fictifs (ou suivre l'accueil de
   l'application).
2. Créer sa pratique « Par standards » avec l'assistant : ses propres cibles, leurs critères, leurs poids, ses cibles
   terminales, son échelle (celle de départ ou la sienne) et son niveau « sans donnée ». L'appliquer à son groupe.
3. Au tableau de notation, inscrire des niveaux comme on le ferait en classe : une case à la fois, ou « Inscrire pour une
   production » pour plusieurs cibles d'un coup ; des remarques sans niveau quand on triangule.
4. Regarder ce que la case retient et ce que la colonne « Note » dit (en attente, puis une note) ; ouvrir une case pour
   lire son historique.
5. Ouvrir le profil d'un·e étudiant·e, section « Cibles » : vérifier que la note et son calcul correspondent à ce qu'on
   aurait calculé soi-même.
6. Selon sa pratique : allumer ou non le double seuil, régler son seuil et son plafond ; cocher « Notes finalisées » pour
   voir la note de fin de session.
7. Dire ce qui ne correspond pas à leur façon de faire : la règle du meilleur niveau, la note en attente, le second seuil,
   les mots.

## 5. Ce qui a été livré

- **Le moteur** : `js/pratiques/note-cibles.js` (`NoteCibles`). Lecture seule ; il lit l'ensemble de cibles, l'échelle et
  les inscriptions par leurs propriétaires, et **ni `evaluationsSauvegardees`, ni `indicesCP`, ni les productions**.
  `ordreDeLEchelle` (par `ordonnerNiveauxParPlage`, seule source), `retenirDansLHistorique` et `retenirParCible` (le
  niveau retenu), `calculerNote` (la note), `lireEleve` (le tout pour un·e étudiant·e).
- **La pratique** (`pratique-configurable.js`) : le court-circuit du lot 1 devient le calcul. `calculerPerformance` rend
  la note sur 0-1, ou `null` (jamais 0) ; `decrireCalcul` le récit, dans la forme commune ; `expliquerNoteNonConstructible`
  la cause (les cibles en attente, nommées ; ou le motif de « non calculable »). La phrase N1' (« ne calcule pas
  encore ») est retirée avec le court-circuit.
- **Le tableau des cibles** : la case montre le **niveau retenu** (code, point de couleur, compte) ; une cible sans donnée
  porte le **nom du niveau « sans donnée »** (« Données insuffisantes ») en petit, et ✎ s'il y a des remarques ; ordre
  illisible : le motif au-dessus du tableau, « ? » dans les cases. **Une colonne « Note »**, fixée à droite comme celle du
  tableau des productions : la note (entière, comme l'indice P), « plafonnée » au besoin ; « En attente » et les cibles
  nommées ; « Non calculable » et son motif. La légende dit tout cela. **La fenêtre d'une case** dit, au-dessus de
  l'historique : « Niveau retenu : 4 · Avancé, inscrit le 1 octobre 2026. », et, si le dernier niveau inscrit est plus bas,
  la phrase qui le dit (dans le texte, aucune bulle) ; l'inscription retenue est marquée « niveau retenu ».
- **Le profil** : une section « Cibles » (`js/profil-cibles.js`), visible seulement pour cette pratique. La note et son
  récit (chaque cible, son niveau retenu, sa valeur, son poids, sa part ; la moyenne pondérée ; le second seuil allumé et
  ce qu'il fait) ; « Pas encore de note. » et la liste des cibles en attente ; « Note non calculable. » et le motif. Puis
  une ligne par cible : le niveau retenu, sa date, son origine, sa rétroaction ; et toutes les inscriptions datées,
  remarques et annulées (barrées) comprises, sans bouton : on inscrit et on annule au tableau.
- **La fiche de la pratique** : un bloc « La note du cours » (comment elle se fait, ce que fait « Notes finalisées ») et
  **« Double seuil »**, décoché d'office ; coché, le seuil (60) et le plafond (55) paraissent et se modifient. Sans cible
  terminale, la case est fermée et l'écran dit pourquoi. Rangé dans `configuration.doubleSeuil = { actif, seuil, plafond }` ;
  l'assistant le garde à la réédition (#938 : il ne nomme que ce qu'il édite).
- **Le formulaire d'une production** (trouvaille du lot 2) : en « Par standards », aucune pondération n'est exigée ;
  l'astérisque part ; une phrase le dit sous le champ.
- **Les lecteurs de la note** (§ 1 ; bornés à « Par standards » le 21 nov., 13 h 30, § 9) : la liste des étudiant·es et l'en-tête « Développement des habiletés » du profil
  écrivaient « 0 % » pour une note non constructible ; ils écrivent « — » (§ 3, écart 1).
- **Retiré** : `InscriptionsCibles.etatDeLaCase` (le « dernier niveau » du lot 2, sans lecteur une fois la case passée au
  niveau retenu) ; les mots « viendra » et « ne calcule pas encore » (assistant, fiche, Conception).
- **Hors des gestes** : la 1.252 des Nouvelles dit « Son badge dit maintenant « SEL ». » ; la sentinelle qui épingle la
  phrase dit aussi qu'elle ne nomme plus de couleur (break-test : remettre « , en sarcelle » la rougit).

## 6. Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| (Borné le 21 nov., 13 h 30 : « Par standards » seulement ; la correction générale est inscrite au plan, § 11, à porter à Grégoire.) La liste des étudiant·es et l'en-tête « Développement des habiletés » écrivaient « 0 % » pour une note non constructible | **corrigé** (casse le parcours livré : toute la classe en attente) |
| (Corrigé le 21 nov., 13 h 30, § 9.) Le Comparateur écrit « CIB » dans ses menus (le code, pas le sigle) et badge « SEL » une pratique par standards dans les maquettes (`comparateur-pratiques.js`, `_optionsSelect`, `_badgeFamille`) | **inscrire et continuer** (plan, § 11) : la décision « le sigle suit le nom » du lot 1 n'y est pas appliquée |
| L'Exploration décrit une pratique par standards comme une sélection d'artefacts, « Alignement sur des cibles : non couvert » (`construction-attributs.js` ne connaît pas le type `cibles`) | **inscrire et continuer** |
| Les corrélations de l'Aperçu comptent une note non constructible pour 0 | **inscrire et continuer** (une phrase affichée seulement si \|r\| ≥ 0,5) |
| Le PDF de synthèse n'a aucune note pour cette pratique | **commenter et oublier** : prix accepté du noyau ; aucun « 0 » |
| La date lisible dit « 1 octobre 2026 » (pas « 1er ») : `toLocaleDateString('fr-CA')`, au lot 2 aussi | **commenter et oublier** |

## 7. Ce qui remonte à Grégoire

1. **Les textes** : `TEXTES-2026-11-21-par-standards-lots-3-4.md`, en une seule page avec ceux du lot 2. En tête, les dix
   questions ; quatre touchent la note (Q1 le retenu entre deux égaux, Q2 la moyenne des terminales, Q3 60 % pile, Q4 le
   « sans donnée » inscrit).
2. ~~**L'écart 1 du § 3**~~ (réglé par la correction 1 du 21 nov., 13 h 30) ; **à porter à Grégoire à la place** : la correction générale de la liste pour les autres pratiques (plan, § 11) (la liste des étudiant·es pour toutes les pratiques) : à son jugement, s'il préfère le borner.
3. **Le passage WebKit du Mac** (§ 1).

## 8. La dernière passe

- **Vitest, suite complète, un seul worker**, sur le commit du code (`bbff6e09`) : **942 fichiers, 12 147 verts, 0 rouge**,
  aucune erreur non gérée au résumé. La passe d'avant, sur le même travail inachevé, avait 7 rouges : six cliquets que
  le lot faisait monter (complexité, classes sans règle #679, interpolations nues #467, insécables #1137, les sections de
  l'aide du profil, la bulle du sigle) ; tous finis dans le lot, aucun relevé ni assoupli sans raison écrite (la
  complexité : des fonctions extraites, aucune hausse assumée ; #467 : le compte descend de 2).
- Après le commit des documents (`DATA-OWNERSHIP.md`, le skill `pratiques-notation`, le plan) : les 11 fichiers d'essais
  qui les lisent rejoués, 181 verts.
- **Playwright sous Chromium** : 58 verts sur les neuf specs du § 1 (10 captures sautées par leur spec). **Aucun verdict
  WebKit** : il est dû au Mac (§ 1).

## 9. Corrections du 21 nov., 13 h 30

Demandées par Cowork, sur la même branche et la même PR (l'adresse ne change pas). Un commit par correction.

### Correction 1 – la liste des étudiant·es, bornée à « Par standards » (`dbef22e3`)

- **Le motif** (Cowork, mesuré dans le diff) : la garde du lot 4 valait pour toutes les pratiques ; un groupe « Par
  sélection de productions », en sommative, en spécifications ou en dénotation aurait vu « — » au lieu de « 0 % » et
  d'autres moyennes. **Décision de Grégoire (20 nov.)** : sa pratique de l'automne ne change pas, ni ses calculs ni ce que
  ses écrans en disent.
- **Fait** : dans `js/etudiants.js`, la garde ne joue que lorsque la pratique du groupe-cours est de la famille des cibles
  (`listeEnParStandards`, `pDeLaListe`, `sansNoteParStandards`). Pour toute autre pratique, chaque expression redevient
  celle de la base, y compris le P `null` d'un élève hors groupe que la base laissait passer.
- **Au-delà de la demande, même motif** : l'en-tête « Développement des habiletés » du profil, que Cowork n'avait pas
  nommé, est borné de la même façon. Il s'affiche justement dans la pratique de Grégoire (portfolio et artefacts) et
  aurait changé pour lui.
- **Sentinelle** (R13b, sur le vrai `js/etudiants.js` et son banc) : pour « Par sélection de productions » avec une note
  non constructible, le relevé entier (chaque rangée, « moy=47 % », les entrées des dix appels de corrélation, l'ordre du
  tri) est **celui mesuré sur la version de base** (`8ed02c6f`), épinglé ; la contre-épreuve (le même essai joué sur la
  base) est verte. Pour « Par standards » en attente : « — », « moy=70 % » (hors du 0), aucune corrélation ne reçoit de 0,
  sous toute note au tri. Break-tests BT24, BT24b, BT25 et BT26 : rouges, puis retirés.
- **Inscrit au plan (§ 11), à porter à Grégoire** : « une note non constructible s'affiche 0 % dans la liste des
  étudiant·es pour les autres pratiques » (et l'en-tête du profil), issue « inscrire et continuer ».

### Correction 2 – « CIB » ne s'affiche nulle part (`54757eb1`)

- **Fait** : dans `js/comparateur-pratiques.js`, les options des menus, le badge des maquettes et l'en-tête du CSV exporté
  lisent le sigle (`sigleDuCode`, par le code réel). Le badge passait par `genererBadgePratiqueHTML(p.id)`, qui retombe sur
  la famille par défaut pour une pratique configurable : une pratique par standards y portait « SEL ».
  `obtenirSiglePratique(id)` a le même défaut pour un id configurable ; je ne l'emploie donc pas.
- **Recherche de « CIB » dans la branche** : hors des commentaires, il n'est écrit qu'aux places internes déjà gardées
  par la sentinelle des sigles (le registre, les tables de codes de la fiche, la correspondance de l'assistant). Le
  Comparateur était le seul écran, et son CSV le seul fichier exporté, à l'écrire. Le champ `famille` des récits vaut
  « CIB », mais aucun écran ne l'affiche (il sert aux comparaisons).
- **Sentinelle** : la spec Chromium « « CIB » ne s'affiche nulle part » lit le texte, les bulles, les étiquettes lues et
  les options de six écrans (tableau, fenêtre d'une case, profil, fiche, Comparateur, en-tête du CSV). Aucun « CIB » ; la
  pratique par standards se lit « STD » au bandeau, à la fiche, dans les menus (« STD · Par standards fictive »), au badge
  des maquettes et dans le CSV. La sentinelle des sigles épingle la voie du sigle. Break-test : le Comparateur d'avant
  écrit « CIB · Par standards fictive » et les deux rougissent.
- Effet sur l'autre pratique : dans les menus et le CSV du Comparateur, « Par sélection de productions » se lit
  désormais « SEL » (elle se lisait « STD », son code), comme la décision du 21 nov., 6 h 56 le veut partout.

### Correction 3 – l'Aperçu, mesuré sans rien y toucher

Une pratique « Par standards », quatre étudiant·es, des copies remises pour trois d'entre eux (C de 0 à 100 %), aucune
inscription, donc toute la classe en attente. Ce que l'enseignant·e voit dans Suivi › Aperçu (Chromium) :

- **Performance (P)** : « La note du cours ne se construit pas encore : il n'y a rien à répartir. Le dépistage, lui,
  s'appuie sur les productions déjà évaluées. » Aucun 0, aucune barre de P.
- **Aucune phrase de corrélation** (« r(A↔P) », « r(C↔P) ») : toutes les notes absentes sont rangées à 0, la corrélation
  n'a rien à mesurer et la phrase ne paraît pas. Le défaut inscrit (le 0 compté) ne se voit donc que lorsqu'une partie
  de la classe a une note et que la corrélation atteint 0,5.
- **Complétion (C)** : la barre et sa moyenne, normales.
- **Une observation neuve, inscrite au plan (§ 11), sans correction** : l'aide « Méthodes de calcul des indices » dit
  « pratique active : Sommative » et décrit P comme une moyenne pondérée des évaluations. `genererExplicationCalculIndices`
  (`etudiants.js`) nomme « Sommative » toute pratique qui n'est pas « Par sélection de productions » (spécifications et
  dénotation comprises).
- Les deux trouvailles nommées par Cowork (l'Exploration ; les deux corrélations de l'Aperçu) restent inscrites,
  intouchées.

### Correction 4 – la passe

- La garde du lot 0 : **16 sur 16**.
- Vitest complet, un seul worker, sur le code de `54757eb1` : **942 fichiers, 12 150 verts, 0 rouge**.
- Chromium : `par-standards-lot-2-inscrire.spec.js` 6 sur 6, `par-standards-lots-3-4.spec.js` 7 sur 7 (la spec « CIB »
  comprise).
- Jetons anti-cache relevés pour les trois fichiers retouchés (`20261121r`).
- **Non mesuré** : WebKit et l'iPad (au Mac, sur la tête de la branche, dont le code est celui de `54757eb1`).

