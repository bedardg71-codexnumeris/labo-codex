# Mesure – emprunter et rendre un trimestre entier

> Écrite par Claude Code le 4 octobre 2026, de 16 h 05 à 16 h 30 (Toronto), sur 1.182.0 (`af586f45`), à la demande de la consigne de Cowork de 14 h 41 (point 8) et de son complément de 14 h 56 (question 6). **Lecture seule** : aucun code, rien d'écrit dans les données de Grégoire. Le codex réel n'a été lu que par des comptes et des octets, sans aucun nom d'étudiant·e. Chaque constat porte sa marque : *mesuré* (commande ou banc, avec son témoin), *lu* (code, fichier:ligne) ou *inféré*.

## Pour Grégoire, en quatre lignes

- **Ce qui existe déjà** : l'archive d'un groupe-cours, vérifiée copie par copie, et « Faire revenir » ses copies. Le codex à part, écrit avant de supprimer un trimestre, ramène ce trimestre entier quand on le rouvre.
- **Le défaut** : rouvrir ce codex ramène tout l'espace tel qu'il était, autres trimestres et réglages compris. Ce que tu as fait entre-temps est écrasé ou laissé à moitié.
- **Ce qui manque** : une archive du trimestre entier (pas seulement d'un groupe) ; un geste qui ne fait revenir que ce trimestre, sans toucher au reste ; et un geste qui le rend, c'est-à-dire qui le retire, fichiers des copies compris.
- **La marge du codex** : environ 770 Mo avant la borne de 2 Go. Les copies d'A2026 la grignotent de 25 à 80 Mo par remise. Sans H2026, le codex pèserait environ 0,28 Go.

## 1 · Ce que l'archive d'un groupe-cours emporte aujourd'hui

- **Les données du trimestre** (*lu*, `js/reserve.js` l. 597-755) : toutes les clés `<trimestre>_*` partent. Certaines sont filtrées pour ne garder que le groupe : liste des étudiant·es par numéro de groupe, fiches des copies par groupe-cours, et par DA les présences, évaluations, interventions, indices et portfolios. Les autres partent entières, y compris toute clé inconnue (l. 751-755).
  ⚠ *Inféré* de cette dernière règle : `notesRapport`, `resultatsUlterieurs`, `confidentielEtudiants` et quelques autres emportent aussi les élèves des **autres** groupes du trimestre.
- **Les clés globales** (*lu*, l. 57-70 et 763-786) : `listeCours`, `cours`, `enseignants`, `horaires`, `productionsTemplates`, `pratiquesConfigurables`, `modalitesEvaluation`, `infoCours`, `profilEnseignant`, `trimestres`, ainsi que les cartouches sous clé nue.
- **Ce qui ne part pas** (*lu*) :
  - le registre longitudinal (`docs/DATA-OWNERSHIP.md` l. 46) ;
  - la version vivante des séances (`seancesCompletes_gc_<id>`) ;
  - les bibliothèques (`bibliothequeGrilles`, `Echelles`, `Alignements`), `fichiersModelisation`, `tamponsPersonnalises` et `seuilsInterpretation` ;
  - les fichiers de la corbeille : seules leurs fiches partent.
- **Les copies** (*lu*, l. 802-861) : les fichiers du groupe seulement, chacun avec son empreinte SHA-256, ce qui permet de les vérifier (lot A2).
- **Archiver n'enlève rien** (*lu*) : `reserve.js` n'écrit que la liste des archives (`_manifesteReserve`). Le trimestre reste entier dans l'application.
- **Faire revenir** (*lu*, `js/reserve-revenir.js` l. 12-33, 150-226) : ne remet que les **fichiers** des copies, sous des fiches qui existent déjà. Aucune donnée, aucune fiche créée.
- **Ouvrir une archive** (*lu*, `js/reserve-ouvrir.js` l. 17-19, 1056-1195) : ne réimporte que des **bibliothèques** (grilles, échelles, tampons, productions, cartouches, pratiques), et vers le trimestre actif. Étudiant·es, évaluations, présences et copies sont « hors scope ».

⮕ **Aujourd'hui, l'archive sait garder un groupe entier et rendre ses fichiers. Aucun geste ne sait en faire revenir les données.**

## 2 · Le codex à part, écrit avant de supprimer un trimestre

**Ce qu'il contient** (*lu*, `js/codex.js` l. 3544-3600, 385-415) : c'est un codex **complet** de l'espace, fabriqué par la même fonction que le codex habituel, sous un autre nom (« … avant-suppression »). Il contient toutes les clés de données, et dans `travaux/` les fichiers des copies, de la corbeille et de la modélisation. Ce n'est pas un extrait du trimestre.

**Le banc** (*mesuré*) :
- Montage : WebKit, profil persistant jetable, espace vierge, `index.html` de 1.182.0. Jeu fictif : H2032 (deux élèves, dont un « doubleur », deux évaluations, une copie PDF dont le fichier est dans le navigateur) et A2032 (le doubleur).
- Fabrication : codex à part par `Codex.generer`, la fonction qu'appelle la fenêtre « Avant de supprimer ».
- Suppression : `supprimerTrimestre('h2032')`.
- Puis la vie continue : A2032 gagne une élève et une évaluation, et le profil de l'enseignant change.
- Enfin, « Ouvrir un Codex… » sur le codex à part, dans le même espace, puis « Recharger ».
- Sonde jetable, posée sous `tests/` puis retirée.

| Moment | H2032 | A2032 | Profil | Fichier de la copie |
|---|---|---|---|---|
| Avant (témoin) | 3 clés, 2 élèves, 2 évaluations, 1 fiche | 1 élève | « avant » | présent |
| Après la suppression | **0 clé**, absent de la liste des trimestres | 1 élève | « avant » | **encore présent** |
| La vie continue | — | 2 élèves, 1 évaluation | « après » | présent |
| Codex à part rouvert, puis rechargé | **revenu entier** : 2 élèves, 2 évaluations, la fiche « present » | **1 élève** ; l'évaluation de l'élève ajoutée **reste** | **« avant »** | présent |

**Ce qui revient, ce qui manque, ce qui est écrasé** (*mesuré*) :
- **Revient** : le trimestre supprimé, entier, et de nouveau dans la liste des trimestres.
- **Écrasé** : toute clé que le codex contient reprend sa valeur d'avant la suppression. La liste d'A2032 a perdu l'élève ajoutée, et le profil (un réglage) est revenu à « avant ».
- **Laissé à moitié** : une clé née après le codex n'est pas touchée. L'évaluation d'A2032 survit, mais l'élève qu'elle note n'est plus dans le groupe. Aucune fenêtre de purge ne s'est présentée après le rechargement.
- **Le codex à part devient le codex actif** : les mises à jour suivantes s'écriraient sous son nom, « avant-suppression ».
- **La suppression ne retire pas les fichiers des copies** : `FT_1` est resté dans le navigateur, faute de fiche qui le désigne. *Lu*, cause : `supprimerTrimestre` liste les clés par `db.keys()`, qui ne lit que le magasin `keyvalue` (`js/db.js` l. 925-964). Les fichiers vivent dans le magasin `fichiers`.
  ⮕ Pour H2026, supprimer le trimestre laisserait ses 1,1 Go de copies dans le navigateur, sans rien qui les montre (*inféré*). Le banc n'a donc pas pu dire si le codex sait remettre un fichier : celui-ci n'était jamais parti.

**Pas vérifié** : l'iPad ; un vrai codex de 1,3 Go rouvert (mémoire, durée : #992) ; l'ouverture dans un espace neuf, déjà jugée par `lot-i-bis-la-case-ouvre-un-codex.spec.js`.

⮕ **Le codex à part est un retour en arrière de tout l'espace, pas un retour du trimestre.** Il ne sert à « rendre et réemprunter » que si rien n'a changé ailleurs entre-temps.

## 3 · Ce qu'un trimestre partage avec les autres

| Ce qui est partagé | Comment (*lu*) | Si H2026 n'est plus là | Pour qu'il revienne intact |
|---|---|---|---|
| **Cours** (`cours`, `listeCours`), `enseignants`, `trimestres` | Clés globales (`js/trimestres.js` l. 202-221). La fiche du cours 601-101 porte `trimestreId: "h2026"` et sert aussi A2026 (l. 1567-1574). La suppression ne touche pas `cours` (#455). | Le cours reste ; A2026 continue de fonctionner (*inféré*). | Rien, si l'archive ne réécrit pas `cours`. Une archive qui le réécrirait écraserait celui d'A2026. |
| **Gabarits** (`productionsTemplates`, `infoCours`, `fichiersModelisation`) | Hors des registres, lus nus (`cle()` les rend sans préfixe, l. 435-439). | Restent. | Ne pas les réécrire au retour. |
| **Modèles de travail** (grilles, échelles, pratiques, modalités, cartouches) | Namespacés `h2026_*` (régime #358/#623). | Partent avec le trimestre. Ce qu'un autre trimestre en a **copié** (Brique C) reste indépendant (*inféré*, `js/grilles.js` l. 2503-2520). | Ils reviennent avec ses clés. |
| **Élèves présents dans plusieurs trimestres** (doubleurs) | Aucune fiche élève globale : chaque trimestre a sa liste, reliée par le DA. | Les autres trimestres ne perdent rien (*mesuré* au banc : le doubleur d'A2032 est resté). | Rien à faire. |
| **Registre longitudinal** | Clé globale, copie **figée** du dossier de chaque élève inscrit ; survit à la suppression (`js/registre-longitudinal.js` l. 22, 554-583). | Les dossiers H2026 déjà inscrits restent. On ne peut plus **inscrire** un élève présent seulement en H2026 : il est introuvable. | Rien, s'il n'est pas réécrit au retour. |
| **Alignement** (`planification_mindmap`, `planification_seances`) | Namespacés `h2026_*`. Les séances vivantes (`seancesCompletes_gc_<id>`) sont **globales** et ne contiennent pas « h2026 » dans leur nom. | La carte part avec le trimestre ; les séances vivantes **restent**, orphelines (*inféré*). | Le retour doit ramener ou retrouver `seancesCompletes_gc_<id>` des groupes H2026. |
| **Fichiers des copies** | Magasin `fichiers`, à part des clés. | **Restent** (*mesuré*, § 2). | — |

⮕ **Un trimestre se détache proprement par ses clés `h2026_*`.** Trois choses n'en ont pas la marque : les fichiers des copies, les séances vivantes des groupes et la fiche du cours qu'A2026 partage. Le retour ne doit **jamais** réécrire une clé globale ; c'est exactement ce que fait aujourd'hui la réouverture d'un codex.

## 4 · La marge du codex

**Taille réelle** (*mesuré*, `zipfile` sur `codex-601-101-A26-A25H26-2026-10-03-19h12.zip`, iCloud, déjà présent sur le Mac, lecture seule) :
- 1 361,4 Mo sur disque, 1 378,6 Mo une fois décompressé, 513 entrées.
- Copies : H2026, 394 copies, 1 100,8 Mo ; A2026, 106 copies, 204,7 Mo.
- Corbeille d'A2026 : 10 fichiers (46,5 Mo avec un fichier hors fiche). Elle part maintenant dans le codex.
- Données : 26,7 Mo.

**La borne** (*lu*, `js/import-export.js` l. 22, 39-50) : 2 × 1024³ octets, soit 2 147,5 Mo, comptés **décompressés**.
⮕ **Marge aujourd'hui : environ 769 Mo.**

**La croissance des copies d'A2026** (*mesuré*, date d'import et taille des fiches, sans aucun nom) :

| Remise | Copies | Poids |
|---|---|---|
| 30 août | 26 | 61,9 Mo |
| 1er sept. | 1 | 1,6 Mo |
| 15 sept. | 27 | 79,0 Mo |
| 22 sept. | 26 | 23,4 Mo |
| 29 sept. | 26 | 38,8 Mo |

Les codex successifs le confirment : 80 copies au 24 sept., 106 au 29 sept., 106 au 3 oct. Les copies d'H2026 n'ont pas bougé.

**Projection à la fin de l'automne** (*inféré*). Hypothèses : une remise par semaine jusqu'à la mi-décembre (environ 11 remises) ; un seul groupe ; aucune copie retirée.

| Rythme | Ajout | Codex décompressé | Borne atteinte |
|---|---|---|---|
| bas, 25 Mo par remise | ≈ 275 Mo | ≈ 1,65 Go | non |
| moyen, 50 Mo | ≈ 550 Mo | ≈ 1,93 Go | non, mais à environ 200 Mo près |
| haut, 80 Mo | ≈ 880 Mo | ≈ 2,26 Go | **oui, vers la fin novembre ou début décembre** |

L'hiver 2027 ajoutera ses propres copies par-dessus. **Sans H2026**, le codex décompressé pèserait environ 0,28 Go.

**Au-delà de 2 Go** : *lu*, et mesuré seulement sur la fonction. `validerZipSecurite` refuse un ZIP de plus de 2 Go décompressés ; `tests/unit/validation-zip.test.js` l'éprouve avec des tailles simulées. Un vrai codex de plus de 2 Go n'a été ouvert ni sur le Mac ni sur l'iPad, et la mémoire d'une ouverture n'a jamais été mesurée (#992). La case « Ouvrir un Codex » ne lit que la fin d'un fichier de 1,1 Go avant de le confier au codex (*mesuré*, `lot-i-bis-la-case-ouvre-un-codex.spec.js`, essai 2).

## 5 · Les morceaux qui manquent, en lots

C'est une proposition, pas une décision. Les tailles sont estimées à la lecture du code.

| Lot | Ce qu'il fait | Taille | Ce qui revient à Grégoire |
|---|---|---|---|
| **E1 – L'archive d'un trimestre** | Étendre l'archive d'un groupe-cours à « tout le trimestre » : même collecte sans le filtre de groupe, mêmes empreintes, même vérification (lot A2). Toutes les copies, la corbeille comprise, et les séances vivantes de ses groupes. Elle n'emporte **aucune** clé globale qu'elle réécrirait au retour (registre, cours). | moyen | le nom du geste ; ce qu'il dit à l'écran |
| **E2 – Ouvrir le trimestre** (emprunter) | Depuis une archive vérifiée, remettre **seulement** les clés `<trimestre>_*`, les séances vivantes et les fichiers, sans toucher une clé globale ni un autre trimestre. Le trimestre revient **clos** (lecture seule). Refusé s'il est déjà présent. Réemploie « Faire revenir » pour les fichiers. | moyen à gros | les mots ; ce qui se passe si le trimestre est déjà là |
| **E3 – Rendre le trimestre** | Retirer un trimestre clos **dont l'archive est vérifiée** : ses clés, **et les fichiers de ses copies** (ce que la suppression ne fait pas aujourd'hui), sans réécrire l'archive. Le retour exige le statut clos : le livre rendu est celui qu'on a emprunté. | moyen | ⚠ geste irréversible sur ses données : la règle, et la première fois sur H2026 |
| **E0 – Préalable : la suppression oublie les fichiers** | Indépendant du chemin. Aujourd'hui, `supprimerTrimestre` laisse les fichiers des copies dans le navigateur. À inscrire (issue 2) ; E3 le corrige pour son propre geste. | petit | rien (technique), sauf le sort du stock déjà orphelin |

**L'hypothèse de Cowork** (« un trimestre clos est en lecture seule, donc le livre rendu est celui qu'on a emprunté, et le rendre n'est qu'un retrait »).
- **Tient pour les clés du trimestre** (*lu*) : le mode clos garde l'écriture par la CSS et par l'écrivain (mémoire « Mode archive : garde CSS seulement »).
- **Ne tient pas encore tout à fait** (*inféré*) : la case « Permission d'écriture » du bandeau rouvre l'écriture temporaire, et le démarrage réécrit les indices du trimestre **actif** même s'il est clos (mémoire « Le boot réécrit indicesCP »).
- E2 devrait donc ramener le trimestre clos **sans pouvoir l'activer**, ou comparer à l'archive avant de rendre (empreinte du lot A2).

**Ce que deviennent les autres fiches** :
- **#1001 (alléger un groupe)** : rendu caduc par E3. Retirer les seules copies d'un groupe, en gardant ses données, n'est plus le but. À fermer comme dépassée, ou à garder comme variante si Grégoire veut encore alléger A2026 en cours de session.
- **#1006 (les trois boutons « Exporter les données »)** : un export sans lecteur, aux clés incomplètes (*lu* : seulement les noms fixes du registre, ni `snapshots_<gc>` ni cartouches ni copies). E1 le remplace. Proposition : retirer les trois boutons quand E1 est livré.

## 6 · Les bibliothèques : prendre et rendre un élément (complément de 14 h 56)

| Mécanisme | Format | Lecteur | Pour l'archive d'un trimestre |
|---|---|---|---|
| **Partage** d'une grille ou d'une production (`js/partage-*.js`) | Paquet `labo-codex-partage-v1` : manifeste, licence, signature ECDSA, entités à schéma **fermé** (5 types), 10 Mo au plus (*lu*, `partage-format.js` l. 339-370, `partage-import.js` l. 9-34, 81) | Oui. Chaîne de validation (octets d'en-tête, garde ZIP, schémas, signature, confiance à la première rencontre, aperçu obligatoire) ; écrit dans `partage_*` ; registre qui permet de **retirer** | **Le modèle du geste**, pas le format : aperçu avant d'écrire, registre de ce qui est entré, retrait. Le format ne se réemploie pas : schémas fermés, pas de données d'élèves, plafond de 10 Mo. |
| **Import entre trimestres** (Brique C, « modèle COPIE ») | Lecture d'un autre trimestre par `cleSource`, sans changer de trimestre actif (*lu*, `trimestres.js` l. 442-460) | — | **Se réemploie** : lire un trimestre sans l'activer, c'est ce qu'il faut pour consulter un trimestre emprunté. |
| **Bibliothèque des trimestres** (activer, clore, rouvrir) | Le registre `trimestres` | — | **Se réemploie** : c'est là que vivent « Emprunter » et « Rendre », à côté de « Clore ». |
| **« Exporter les données »** (#1006) | JSON `archive-trimestre`, clés incomplètes, sans fichiers ni empreinte (*lu*, l. 1430-1486) | **Aucun** | La moitié d'un aller sans retour ; **ne se réemploie pas**. E1 le remplace. |
| **L'archive d'un groupe-cours** (lots A1-A3) | ZIP vérifiable, empreinte par copie, liste des archives (*lu*) | Vérifier, Faire revenir (fichiers) ; Ouvrir une archive (bibliothèques) | **Le socle** : collecte, empreintes, vérification et retour des fichiers se réemploient tels quels. Manque le retour des **données**. |
| **Le codex** | ZIP de tout l'espace (*lu*, `codex.js` l. 385-415). Un export filtré par trimestre existe (`_filtrerDonneesPourExport`, l. 4236-4290, 2641-2662). | Ouvrir un Codex : **écrase clé par clé** (*mesuré*, § 2) | L'écriture clé par clé se réemploie **si on la borne** aux clés du trimestre. La garde de taille (2 Go) et la vérification des octets d'en-tête se réemploient. |

⮕ **Ce qui se réemploie** :
- la collecte, les empreintes et la vérification de l'archive d'un groupe-cours ;
- « Faire revenir », pour les fichiers ;
- `cleSource`, pour consulter sans activer ;
- la bibliothèque des trimestres, comme lieu du geste ;
- le **parcours** du partage (aperçu, registre, retrait).

⮕ **Ce qui ne se réemploie pas** :
- le format du partage ;
- l'export `archive-trimestre` ;
- l'ouverture d'un codex telle quelle, qui écrit tout l'espace.

Le modèle « bibliothèque » tient, à une condition : l'archive est l'exemplaire, et l'application n'en a qu'une copie de prêt. Le prêt se fait clé par clé, borné au trimestre, et le retour retire ce qui a été prêté, fichiers compris.

## Trouvailles, et leur issue

| Trouvaille | Issue |
|---|---|
| `supprimerTrimestre` laisse les fichiers des copies dans le navigateur (*mesuré*) | **Inscrire** (issue 2) : elle touche les données de Grégoire dès qu'il supprime un trimestre. Proposée comme E0. Non inscrite par cette mesure, faute de décision : à Cowork. |
| Rouvrir un codex écrase les clés plus récentes et laisse à moitié celles qui sont nées après (*mesuré*) | Inscrire : c'est le comportement voulu d'une restauration complète, mais la fenêtre du codex à part promet « revenir en arrière » sans dire que tout l'espace recule. Les mots sont à Grégoire. |
| Le codex à part rouvert devient le codex actif, sous le nom « avant-suppression » (*mesuré*) | Inscrire, avec la précédente. |
| L'archive d'un groupe emporte entières les clés `{[da]}` inconnues, avec les élèves des autres groupes (*inféré*) | Inscrire et continuer : non vécu ; à mesurer sur une archive réelle. |
| `infoCours` est dite namespacée dans `DATA-OWNERSHIP.md`, mais lue nue par le code (*lu*) | Commenter et oublier (documentation). |

## Méthode, et ce que je n'ai pas vérifié

- **Codex réel** : `zipfile` de Python sur les dix codex d'iCloud, déjà présents sur le Mac. Lus : les tailles d'entrées, et dans `donnees.json` les compteurs, dates, tailles et statuts des fiches. Aucun nom n'a été lu ni écrit.
- **Banc** : sonde jetable `tests/_sonde-q2-jetable.mjs`, posée puis retirée dans la même commande, en WebKit à profil persistant jetable et sur un jeu fictif. Le témoin de chaque étape est la photo précédente.
- **Code** : lecture déléguée à un agent en lecture seule pour les § 1, 3 et 6. J'ai vérifié moi-même deux constats : `db.keys()` ne lit que `keyvalue` ; la suppression liste par `db.keys()`.
- **Pas vérifié** :
  - l'iPad ;
  - l'ouverture d'un codex réel (mémoire, durée) ;
  - une archive réelle de groupe-cours ouverte par « Ouvrir une archive » ;
  - le comportement de la case « Permission d'écriture » sur un trimestre emprunté ;
  - ce que le codex remet quand un fichier de copie est vraiment parti du navigateur (dans le banc, il n'était jamais parti).
