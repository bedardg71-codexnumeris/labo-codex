# Rapport : « production » plutôt que « copie », étape 2

9 nov. 2026, session dans le cloud. Branche `lot/production-plutot-que-copie`, partie de `origin/main` (158ff5d, 1.238.0). Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-production-plutot-que-copie.md`. Relevé de la nuit : `plans de travail/RAPPORT-2026-11-09-production-plutot-que-copie.md`, recopié sur cette branche. Décisions de Grégoire du 9 nov., 10 h 14 à 10 h 17, en Cowork.

## En tête

### À porter à Grégoire avant tout : les tampons ne partent pas dans les archives

C'est vérifié dans le code [lu]. La liste blanche des Archives (`CLES_GLOBALES_INCLUSES`, `js/reserve.js:58`) ne contient ni `tamponsPersonnalises` ni `bibliothequeTampons`. Les autres passes de la collecte ne prennent que les clés d'un trimestre et les cartouches. L'archive d'un trimestre, elle, n'emporte aucune clé globale, et c'est voulu (`js/reserve-trimestre.js:22`). Je n'ai rien corrigé.

Ce qu'une archive rouverte perdrait :
- **Tes tampons personnalisés et ta bibliothèque de tampons** [lu]. Dans « Ouvrir une archive », la section « Tampons personnalisés » lit `donnees.tamponsPersonnalises` (`js/reserve-ouvrir.js:299`). Elle est donc toujours vide pour une archive faite aujourd'hui.
- **L'image des tampons sur les productions annotées** [inféré, non éprouvé]. Une annotation ne garde que l'identifiant du tampon (`autocollantId`, `js/travaux-annotation.js`), pas son image ni son texte. Sur un appareil où seule l'archive est rouverte, sans le codex, ces tampons n'auraient plus rien à afficher. Les textes qu'ils portent dans la rétroaction manqueraient aussi. À mesurer sur le Mac.
- **Le codex, lui, les emporte** : toute clé y part.

La banque de types, elle, entre bien dans la liste blanche des Archives, comme le demandait la consigne.

### Ce qui est fait

- **Partout dans l'application, ce que tes étudiant·es remettent s'appelle « production », et ce qui porte la note s'appelle « évaluation ».**
  - 368 des 369 lignes du relevé sont posées selon tes trois règles. La dernière, la 444, ne s'affiche nulle part : c'est un identifiant interne. Elle passe parmi les écartées.
  - Les libellés que tu as validés sont à l'écran : « Réunir en une production », « Production de référence » (Annoter › Actions) et « Production fictive » (l'atelier du critère algorithmique).
  - « Copie » ne reste qu'au sens de double ou de sauvegarde (« une copie complète », « Créer une copie ») et pour le verbe « copier ».
- **Le PDF de tes étudiant·es** dit « Cette évaluation n'a pas de niveau général » et « Note : 74 % ».
- **Le rappel « Mets ton codex à jour »** dit « productions de tes étudiant·es comprises ». C'est ton texte du 8 nov.
- **Conception › Productions, le menu « Type »**, tel que tu l'as arrêté :
  - les quatorze exemples, de l'Examen à l'Enregistrement ;
  - puis Portfolio et « Épreuve terminale » ;
  - puis tes types (« Mes types ») ;
  - puis « + Nouveau type… » et « Gérer mes types… ».

  « Autre » est sorti du menu. Une production qui le porte le garde, et son menu le montre encore.
- **La banque de types** suit ta décision 9 :
  - un type créé revient d'un trimestre à l'autre ;
  - renommer ou retirer un type ne touche aucune production ;
  - une production garde son type même retiré de la banque ;
  - on retire de sa vue un exemple qui ne sert pas.

  Ta décision 8 tient aussi : un type reçu d'un·e collègue reste sur sa production et n'entre jamais dans ta banque.
- **Tes textes validés de la partie 2 sont posés mot pour mot** :
  - la définition « Production » du glossaire ;
  - les infobulles « Type », titre et grille ;
  - les trois définitions sous le menu (Portfolio, Artefact, Épreuve terminale). Aucune autre définition ne s'affiche.
- **Le type s'affiche par son libellé partout où il s'affiche** : la liste des productions, la carte d'alignement (un type de ta banque y a son groupe à son nom), Réglages › Données, les exports de Conception.
- **Vérifié contre le code** : « Structure des évaluations » est bien le titre affiché dans Conception › Pratiques.

### Ce qui attend Grégoire (une question par ligne, ma recommandation entre parenthèses)

1. **Les textes neufs de la banque.** Je les ai posés pour que l'écran fonctionne, et ils restent à corriger (liste complète au § 3). La fenêtre de fusion de deux codex nomme aussi la banque. Les principaux : « Mes types » (le groupe du menu et le titre de la fenêtre), « Ta banque », « Exemples du menu », « Décoche ceux qui ne te servent pas : ils sortent du menu. », « Nouveau type », « Nom du type », « Ex. : Prise de sang », « Il restera dans ta banque, d'un trimestre à l'autre. » (Les garder : ils reprennent les mots de ton infobulle.)
2. **Le nom commun « évaluation terminale »** reste dans une quarantaine de phrases : l'Aide, la démo, les avertissements de Productions. Seules les citations du type entre guillemets sont devenues « Épreuve terminale » (trois). Est-ce que la prose suit ? (Oui, mais dans un lot à part, avec son propre relevé : c'est le même exercice que celui-ci.)
3. **L'écran vide de Préparer** (ligne 465 du relevé) dit maintenant « regroupe les pages d'une même production et les associe à une production ». L'aide de Préparer (ligne 100) dit de même « rassemble les productions numérisées de tes étudiant·es […] et les associe à une production ». Le mot y prend tes deux sens. (« … et les rattache à ta production ».)
4. **L'avis « Non recevable »** (lignes 56 et 250) dit « Ton évaluation est gardée, mais l'évaluation montre « Non recevable » », puis « elle compte comme non remise ». La phrase se répète, et le « elle » vise mal. (À reformuler avec toi. La session A touche aussi cette phrase.)
5. **La fenêtre de fusion de deux codex** titre un conflit « Production d'« Analyse 1 » », avec le nom de l'étudiant·e à côté. Avant, on lisait « Copie d'« Analyse 1 » ». (« Production remise pour « Analyse 1 » ».)
6. **Les propositions que la nuit marquait « à confirmer »** sont posées telles quelles. « jamais dans sa rétroaction » (159, 161, 247), « la note de chaque production » (303), et la réécriture « Si la production l'atteint, la note est entière » (27, 241). (Confirmer.)
7. **La définition du portfolio** garde son nom en gras « Portfolio (conteneur) : », comme aujourd'hui. (Garder : c'est le libellé du menu.)
8. **Deux codex de toi qui n'ont pas la même banque.** La fenêtre de fusion fait choisir, pour « Tes types » comme pour « Les exemples retirés de ta vue », la version de l'un des deux codex. Elle ne les additionne pas. (Laisser ainsi pour la cohorte : c'est la règle de toute clé de réglages dans la fusion. Une banque additionnée serait un lot à part.)
9. **Un type reçu d'un·e collègue** reste sur sa production (ta décision 8), et son menu le montre à part. La nuit parlait de « l'ajouter d'un geste » à ta banque : ce geste n'existe pas en propre. On l'ajoute en écrivant le même nom dans « + Nouveau type… ». (Suffisant.)

### Ce que je n'ai pas pu vérifier

- **WebKit n'existe pas ici.** Les specs et les captures sont sous Chromium seulement. Le verdict WebKit et les captures WebKit se prennent sur le Mac.
- **Tes données ne sont pas ici.** Deux mesures restent à faire sur le Mac :
  - combien de tes productions portent « Autre », ou un type que la table ne connaît pas ;
  - ce qu'une archive rouverte montre de tes tampons.
- **Le menu « Type » déplié** est une fenêtre native que la capture ne prend pas. La capture 06 montre les mêmes options, en liste ouverte.
- **Le PDF en points** (capture 05) est le vrai rendu du code, mais monté sur une évaluation à niveaux de la démo, dont j'ai porté la note en points. Le bloc « Niveau général · Note : 74 % » est exact. Les critères autour, eux, sont ceux de la démo.

## 1. Partie 1, les mots : ce qui est posé

Les règles appliquées sont celles du relevé (§ 2), validées par Grégoire :
- (a) → « production », avec le possessif de sa règle ;
- EV → « évaluation » ;
- FI → « fichier », accordé au masculin ;
- 2S → « productions remises » dans les comptes et les Archives, « de tes étudiant·es » ou « d'un·e étudiant·e » ailleurs, « rangées » dans la Liste ;
- VA : les huit lignes changent, et le reste de leurs phrases ne bouge pas.

Les identifiants, les clés de stockage, les classes CSS et `js/changelog-data.js` ne changent pas.

Lignes posées, par écran (six agents, un groupe de fichiers chacun ; moi pour le PDF) :

| Groupe | Lignes |
|---|---|
| `index.html` (Aide, infobulles statiques, Liste) | 55 |
| Aide, glossaire, infobulles, accueil, démo (`accompagnement-contenu-*`, `accueil`, `guidage-demo`, `demo-activation`, `guides-pedagogiques`) | 56 |
| Critère algorithmique (`atelier-algo`, `palette-algo`, `grilles`, `evaluation-projection`, `composeur-calcul`, `evaluation-formules`, `evaluation-enonces`, `miroir-algo`, `tables-cas-algo`) | 61 |
| Codex et Archives (`codex`, `reserve-copies`, `reserve-trimestre`, `reserve-reglages`) | 56 |
| Archives (suite), matériel, évaluation, profil, tableau de bord | 71 |
| Liste, Préparer, Annoter, Exporter, Rythme, Données, Trimestre | 66 |
| PDF des élèves (448, 449) | 2 |
| Rappel du codex (305, posé le matin même, repris par cherry-pick) | 1 |
| **Total posé** | **368** |
| Écartée : 444 (`js/reserve.js`, `return 'copies'`, valeur interne de `_classerCleTrimestre`, jamais affichée) | 1 |

**Les neuf lignes FI?** sont toutes tranchées en « fichier » : le geste porte chaque fois sur le fichier.

| n° | Où | Posé |
|---|---|---|
| 397 | `js/reserve-emprunter.js` | Le stockage des fichiers n'est pas disponible dans cette page. |
| 399 | `js/reserve-emprunter.js` | un fichier de l'archive ne concorde pas avec son empreinte |
| 408 | `js/reserve-renvoyer.js` | … ou un fichier y est illisible. |
| 409 | `js/reserve-renvoyer.js` | … ou un fichier y est illisible. |
| 410 | `js/reserve-renvoyer.js` | Le stockage des fichiers n'est pas disponible dans cette page. |
| 419 | `js/reserve-revenir.js` | N fichiers de l'archive sont abîmés / 1 fichier de l'archive est abîmé (et « ils ne sont pas revenus » / « il n'est pas revenu ») |
| 425 | `js/reserve-revenir.js` | N fichiers n'ont pas pu être écrits / 1 fichier n'a pas pu être écrit |
| 428 | `js/reserve-revenir.js` | Le stockage des fichiers n'est pas disponible dans cette page. |
| 438 | `js/reserve-verifier.js` | N fichier(s) absent(s) / tronqué(s) / altéré(s) / illisible(s). La ligne « données du trimestre » emprunte maintenant ses propres adjectifs au féminin (`MOTS.trimestre.adjectifs`). |

**Le PDF des élèves** reçoit tes deux textes, mot pour mot. Seul le mot change : l'apostrophe typographique du code (’) est gardée, et la suite de la phrase de #674 (« : Langue (20 %) reste à évaluer. ») ne bouge pas.

**Trouvées en plus, posées selon les mêmes règles.** Ce sont trois « copie » de l'Aide › « Comment ta pratique construit la note », sur des lignes du relevé mais hors de l'extrait proposé :
- « une copie non recevable y vaut 0 » devient « une production non recevable y vaut 0 » ;
- « Sans aucune copie qui compte » devient « Sans aucune évaluation qui compte » ;
- « le niveau d'une copie n'y entre pas » devient « le niveau d'une évaluation n'y entre pas ».

**Suivent le type renommé.** Trois citations du type entre guillemets disent maintenant « Épreuve terminale » :
- `js/productions.js`, deux avertissements de Productions ;
- `index.html`, Aide › Standards : « de l'« Épreuve terminale » ».

La prose « évaluation terminale » ne change pas (question 2).

**Accords ajustés au-delà du mot**, au masculin pour « fichier » : « Aucun fichier », « laissé tel quel », « Choisis-en un », « ils s'y restaurent », « ils ne sont pas revenus ». Le détail est dans le commit.

**Ce qui reste « copie »** est tenu par une sentinelle : 202 occurrences, toutes rangées.
- b (double ou sauvegarde) : 91 ;
- c (le verbe « copier », le presse-papier) : 32 ;
- n (jamais affiché : identifiant, classe, message de console, commentaire dans un gabarit) : 79.

## 2. Partie 2, la banque de types : ce qui est codé

La proposition du § 8 du relevé est appliquée telle que validée.

**La clé.**
- `banqueTypesProduction` est GLOBALE, hors trimestre : `{ types: ['Prise de sang', …], exemplesMasques: ['film', …] }`.
- Son propriétaire unique est `js/productions.js`. Elle est inscrite à `docs/DATA-OWNERSHIP.md`.
- Elle s'écrit par `db.setSync`, avec l'annonce « Enregistré » (`annoncerEcritureUsager`).

**Sur la production**, le type créé s'écrit tel qu'il est nommé, dans `production.type`. Aucun format ne change : le partage `.lcz`, l'import et le codex le transportent comme aujourd'hui, et une version plus ancienne l'affiche tel quel.

**Le menu** est bâti par `remplirMenuTypesProduction` depuis `TYPES_PRODUCTION`, et le `<select>` d'`index.html` ne porte plus de liste. La dérive entre deux listes (#492) devient impossible.
- Les identifiants des types existants ne changent pas.
- Les six types nouveaux sont `demonstration`, `oeuvre`, `maquette`, `photographie`, `film` et `enregistrement`.
- `autre` reste dans la table, marqué `horsMenu`.

**Le type d'une production ouverte garde toujours son option** (décision 9) : un exemple retiré de la vue, « Autre », un type retiré de la banque, ou un type reçu d'un·e collègue. La nuit avait mesuré qu'à l'édition, `select.value = prod.type` vidait le type « Autre » dès qu'il sortait du menu. C'est réglé par la même règle.

**« + Nouveau type… »** passe le nom par `analyserNomTypeProduction` :
- un nom qui reprend un exemple choisit l'exemple, et le fait revenir dans le menu s'il était retiré de la vue ;
- un nom déjà dans la banque choisit celui-là ;
- un nom vide est refusé ;
- un nom réservé est refusé : Portfolio, Artefact, Épreuve terminale, « Autre », un identifiant, une forme « <type>-formatif ».

La saisie est bornée à 50 caractères, la borne du partage.

**« Gérer mes types… »** renomme, retire, et coche ou décoche les quatorze exemples. Le portfolio, l'artefact et l'épreuve terminale ne se retirent pas de la vue : ils changent le calcul.

**Les deux options d'action** ouvrent leur fenêtre et remettent aussitôt le type d'avant. `surChangementFormulaireProduction` les écarte : leur valeur n'est jamais écrite dans une production. La spec B1 le vérifie sous Chromium.

**`estTypeFormatif`** : la convention « <type>-formatif » ne vaut que pour un identifiant connu. « Quiz formatif », nommé par la personne, n'est pas formatif. `productions.js` et `productions-liste.js` l'emploient, et aucun `includes('formatif')` ne reste.

**Règle de sécurité 1.** `echapperHtml()` est posé aux trois endroits du relevé :
- `js/productions.js`, la valeur du champ « Type » de la liste ;
- `js/productions.js`, la ligne compacte ;
- `js/productions-import-export.js`, l'assistant de migration.

Dans la carte d'alignement, un type que la table ne connaît pas a maintenant son groupe à son nom, échappé. Le groupe commun « Type non répertorié » taisait ce nom. Le menu, lui, passe tout par `textContent` et `value`.

**Le type affiché partout.** Réglages › Données et les exports de Conception (`js/export-pdf.js` : l'aperçu et les deux tableaux du PDF des productions) montrent maintenant le libellé (« Artefact d'un portfolio », « Épreuve terminale »), et non l'identifiant. La nuit citait `js/travaux-export-pdf.js`, qui n'affiche aucun type ; c'est la relecture neuve qui a trouvé le bon fichier. Le plan de cours n'affiche pas le type.

**Ce qui voyage.**
- La banque part avec le codex et avec l'archive d'un groupe : elle entre dans `CLES_GLOBALES_INCLUSES`.
- L'archive d'un trimestre n'emporte aucune clé globale, et c'est voulu.
- Rouvrir une archive ne verse pas sa banque dans la tienne. Les productions qu'elle rapporte portent le nom de leur type et se lisent sans elle. Rien n'écrit donc dans tes données.

## 3. Les textes neufs, proposés, à corriger par Grégoire

Ils sont posés pour que l'écran fonctionne. Aucun n'est validé.

| Où | Texte |
|---|---|
| Menu « Type », groupe de la banque | Mes types |
| Menu « Type », fin de liste | + Nouveau type… / Gérer mes types… (ces deux-là viennent du § 8 validé) |
| Fenêtre « + Nouveau type… », titre | Nouveau type |
| Fenêtre « + Nouveau type… », étiquette | Nom du type |
| Fenêtre « + Nouveau type… », exemple dans le champ | Ex. : Prise de sang |
| Fenêtre « + Nouveau type… », sous le champ | Il restera dans ta banque, d'un trimestre à l'autre. |
| Fenêtre « + Nouveau type… », boutons | Ajouter / Annuler |
| Fenêtre « + Nouveau type… », erreurs | Écris le nom du type. / Ce nom est déjà celui d'un type de l'application. Choisis-en un autre. |
| Fenêtre « Gérer mes types… », titre | Mes types |
| Fenêtre « Gérer mes types… », en tête | Renommer ou retirer un type ne change aucune production : chacune garde le type qu'elle porte. |
| Fenêtre « Gérer mes types… », sections | Ta banque / Exemples du menu |
| Fenêtre « Gérer mes types… », sous « Exemples du menu » | Décoche ceux qui ne te servent pas : ils sortent du menu. |
| Fenêtre « Gérer mes types… », banque vide | Ta banque est vide. Crée un type avec « + Nouveau type… », au bas du menu. |
| Fenêtre « Gérer mes types… », boutons | Retirer / Fermer |
| Fenêtre « Gérer mes types… », erreur de renommage | Ce nom est déjà dans ton menu. |
| Fusion de deux codex, nom de la clé | ta banque de types de production (où elle se règle : Conception › Productions › Type) |
| Fusion de deux codex, ses deux entrées | Tes types / Les exemples retirés de ta vue |

## 4. Vérifications

- **Vitest complet**, depuis `tests/` : 898 fichiers, 10 870 essais sur 10 870, après les suites de la relecture (et au crochet de chaque push).
- **Sentinelles neuves** :
  - `sentinelle-pdf-eleve-evaluation-plutot-que-copie-2026-11-09` : PDF rendu par le vrai code dans le bac à sable. Rouge avant (4/4), vert après. Break-test refait sur l'ancien texte : 4 rouges.
  - `sentinelle-production-plutot-que-copie-2026-11-09` : le relevé de la nuit refait à chaque passage (acorn pour `js/`, parse5 pour `index.html`). Chaque « copie » restante est rangée (b, c, n), et une occurrence neuve fait rougir. Break-tests : « Réunir en une copie » remis → 2 rouges ; « Importer des copies » remis → 1 rouge.
  - `banque-types-production-2026-11-09` (15 essais, jsdom, chemins réels de `productions.js`). Il couvre :
    - B1, un type créé revient dans un autre trimestre ;
    - B2, une production garde son nom après qu'on l'a retiré de la banque ou renommé, « Autre » reste lisible, et un type reçu n'entre pas dans la banque ;
    - B3, l'ordre et les groupes du menu ;
    - B4, les noms refusés ;
    - B5, « formatif » ;
    - B6, l'échappement ;
    - B7, seul `productions.js` écrit la clé, et la banque est dans `CLES_GLOBALES_INCLUSES`.

    Break-tests :
    - M3, le type courant n'est plus gardé : 3 rouges ;
    - M4, la banque passée par trimestre : 6 rouges ;
    - M5, `includes('formatif')` remis : 1 rouge ;
    - M6, l'échappement retiré de la liste : 2 rouges ;
    - M7, l'échappement retiré de l'assistant de migration : 1 rouge.
  - La sentinelle 492 est réécrite pour le menu bâti :
    - S1.0, le `<select>` statique n'a plus que « — Sélectionner — » ;
    - S1.a et S1.b, le menu bâti contre la table ;
    - S5, le groupe d'un type inconnu porte son nom ;
    - S5.c, un nom piégé est échappé.

    Break-test M8, l'échappement du groupe de la carte retiré : 1 rouge.
- **Bancs existants mis au texte neuf** : 94 fichiers de test. Chaque fois, l'ancien passage doit exister dans le texte validé, et seul le passage changé est remplacé. Aucun essai n'est retiré.
- **Playwright, sous Chromium seulement.** Les 41 specs que le lot touche, plus `lot-e3-creer-ou-modifier` et `bibliotheques-menu-1147` (qui choisissent un type dans le menu bâti), plus la spec neuve `banque-types-production-2026-11-09`.
  - **206 essais passent**, dont la spec neuve (B1, B2) et les deux specs corrigées après la relecture ; un est sauté par la spec elle-même.
  - **12 rougissent, et aucun ne tient au lot.** Les mêmes 11 essais, lancés sur `origin/main` (158ff5d) sous Chromium, rougissent de la même façon :
    - deux tailles de fichier propres à l'encodeur d'images de Chromium (« 188,5 Ko » au lieu de « 193,0 Ko », « 2,0 Mo » au lieu de « 2,1 Mo ») : `1028-archiver-copies:245`, `nettoyage-sans-perte-892:100` ;
    - l'écriture de fichier et l'espace simulé : `codex-1011-ouvert-sans-espace` (3), `codex-1012-avertissement:323`, `codex-1012-fichier-d-origine:364`, `e1-archiver-trimestre:141`, `e3-renvoyer-trimestre:251` ;
    - le défilement et une largeur de 690 au lieu de 700 px : `critere-algorithmique-calculs-4a:71`, `critere-algorithmique-presentation:300`.

    Le douzième, `clore-et-alleger-un-trimestre:327`, a rougi une fois pendant que d'autres essais tournaient à côté. Relancé seul, il passe sur cette branche comme sur `origin/main`.
  - **Le verdict qui compte se prend sous WebKit, sur le Mac.** La configuration Chromium qui a servi ici n'est pas commitée.
- **Captures sous Chromium, à 1180 px**, dans `plans de travail/captures-2026-11-09-production-plutot-que-copie/` :
  - 01, Évaluation › Liste, deux rangées cochées (« 2 rangées sélectionnées ») ;
  - 02, Annoter › Actions (« Production de référence ») ;
  - 03, le rappel « Mets ton codex à jour » ;
  - 04, l'avertissement du codex (« Ce codex n'aura pas toutes les productions de tes étudiant·es ») ;
  - 05, le PDF en points (« Note : 74 % ») ;
  - 06, le menu « Type » avec la banque ;
  - 07, « Nouveau type » ;
  - 08, « Gérer mes types » ;
  - 09, la définition du portfolio.
- **Anti-cache** : 55 `?v=` portés au jour du build (20261109). Les deux sentinelles anti-cache sont vertes, et le crochet de commit a laissé passer. La release du Mac refera les jetons.
- **Relecture par un agent neuf** (`BOUCLE-SANS-RELAIS.md`, § 4, point 4). Verdict, en une ligne : « le code de la banque et des mots est sain ; le lot ne doit pas passer avant les deux specs rouges et l'export PDF promis ; le reste est mineur ». Chaque constat a reçu une disposition :

  | Constat | Disposition |
  |---|---|
  | Deux specs citaient encore l'ancien texte (`bibliotheque-deux-colonnes-1156:240`, « Évaluation terminale · 40 % » ; `materiel-dissection-9:93`, « la note d'une copie évaluée ») | corrigé (mon lot) ; un balayage de toutes les specs contre les textes (a) du relevé n'en trouve plus |
  | `js/export-pdf.js` montrait l'identifiant brut du type (trois endroits) | corrigé : `libelleTypeExport`, par `getTypeLabel` |
  | La clé `banqueTypesProduction` n'avait pas de nom dans la fenêtre de fusion du codex (`LIBELLES_DES_CLES`) | corrigé ; mots proposés au § 3 ; question 8 |
  | Un nom de la banque en « -formatif » sortait des listes « sélection / obligatoires » (`pratiques-gestion.js`, `productions-import-export.js` lisent `endsWith('-formatif')`) | corrigé : tout nom qui finit par « -formatif » est refusé |
  | L'ancien nom « Évaluation terminale » pouvait devenir un type libre | corrigé : réservé (`libellesAnciens`) |
  | Le type d'une production hors de la banque se rangeait sous « Mes types » | corrigé : il est à part, sous son nom ; question 9 pour le geste d'ajout |
  | La chaîne des étapes restait dessinée avec la valeur de l'action du menu | corrigé : redessinée après le retour au type d'avant |
  | Double sens « associe à une production » (465, aide de Préparer) | question 3 |
  | Deux entrées de la sentinelle rangées « n » au lieu de « b » (« Copies », « Réimporter, c'est faire une copie. ») | corrigé |
  | S1 de la sentinelle 492 compare la table au menu bâti depuis elle | refusé : B3 (`banque-types-production`) tient la liste écrite à la main, mot pour mot ; S1.0 garde que le `<select>` statique est vide |
  | La spec neuve et la config Chromium n'étaient pas commitées | la spec est commitée après son passage ; la config Chromium est un fichier de travail, retirée en fin de session |

## 5. À reporter, à la fusion

- **`lot/copie-non-recevable-choix` (session A) dit « copie »** dans ses textes neufs, et ils suivront les mêmes règles. C'est la branche qui fusionne en second qui les applique. Ses chaînes, relevées sur `origin/lot/copie-non-recevable-choix` :
  - `index.html`, la fiche de la pratique :
    - « Une copie non recevable (plagiat, IA non autorisée), dans la note » ;
    - « L'écarter, comme une copie non remise » ;
    - « Ta règle. Quand tu marques une copie non recevable, elle apparaît déjà cochée ; tu peux la changer pour cette copie-là. »
  - `index.html`, l'Aide :
    - « Une copie non recevable compte comme non remise dans la complétion (C) ; … » ;
    - « « L'écarter » : elle est traitée comme une copie non remise. … » ;
    - « En dénotation, ta note est ton jugement : la copie n'y entre pas par calcul. »
  - `js/evaluation-sauvegarde.js` :
    - « Règle de ta pratique : … Ton choix ne vaut que pour cette copie. » ;
    - « Ton choix ne vaut que pour cette copie. » ;
    - « l'écarter, comme une copie non remise » (quatre variantes : « elle n'entre pas dans la moyenne », « elle manque au portfolio », « elle manque aux productions retenues », la courte).
  - `js/wizard-pratique-v2.js` :
    - « Quand tu marques une copie non recevable (plagiat, IA non autorisée), que devient-elle dans la note ? » ;
    - « Une copie non recevable » ;
    - « Elle est traitée comme une copie non remise. » ;
    - « … entre pas dans la moyenne, comme une copie non remise. » ;
    - « Elle manque au portfolio, comme une copie non remise. … » ;
    - « … Quand tu marqueras une copie non recevable, elle apparaîtra déjà cochée, et tu pourras la changer pour cette copie-là. … »
  - `js/pratiques-gestion.js` : « … une copie non recevable, telle que le calcul la lit … ».

  Selon les règles, « copie non recevable » devient « production non recevable », et « comme une copie non remise » devient « comme une production non remise ». « Pour cette copie-là » / « pour cette copie » désigne l'évaluation : il devient « pour cette évaluation-là » / « pour cette évaluation ». Les identifiants (`data-choix-copie`, `sortCopieNonRecevable`) restent.
- **Les mêmes phrases de cette branche touchent aussi les lignes A du relevé** : 15, 17, 44, 49 à 53, 55, 56, 75 et 250. Ici, elles disent déjà « production ». À la fusion, garder les mots de cette branche-ci là où les deux se rencontrent.
- **La bulle du parcours 4 qui cite « Réunir en une copie »** n'est posée sur aucune branche : je n'en trouve que dans les commentaires et dans `js/changelog-data.js`. Sa consigne (`CONSIGNE-LOT-2026-11-08-parcours-4-recevoir-et-rendre.md`) devra citer « Réunir en une production ». Même chose pour la bulle du choix du parcours 3 (« Le résultat d'une évaluation viendrait »), et pour l'étape 4 du parcours 8 (« Sur la production fictive : … »).
- **Conflits de `?v=` attendus dans `index.html`** avec `lot/parcours-3-evaluer`, `lot/completion-suit-la-remise` et `lot/parcours-6-donnees-a-l-abri`. Ce dernier touche aussi `js/modal-backup-reminder.js`, `js/codex.js` et `js/accompagnement-contenu-hover.js`. Ce sont des conflits de lignes, sans désaccord de fond.

## 6. À inscrire au BACKLOG

1. **Les tampons dans les archives**, si Grégoire le veut (voir l'en-tête) : ajouter `tamponsPersonnalises` et `bibliothequeTampons` à `CLES_GLOBALES_INCLUSES`, puis mesurer sur le Mac ce que montre une archive rouverte.
2. **« évaluation terminale » dans la prose** (question 2), si Grégoire dit oui : un relevé à part.

## 7. Trouvailles faites en chemin, et ce qu'elles deviennent

- **« 1 productions sur 9 manquent »** (`js/reserve-verifier.js`, le compte des échecs d'une vérification) : le pluriel ne s'accorde pas au singulier. Avant, on lisait déjà « 1 copies sur 9 ». Les bancs figent cette forme. → *inscrire et continuer* (c'est antérieur au lot, et seul le mot a changé).
- **Le bouton « examen-formatif »** (`afficherToutesLesProductionsParType`, `js/productions.js`) vit dans un conteneur caché d'`index.html` (`#vueProductionsParType`, sous « Conteneurs cachés pour compatibilité ») : personne ne le voit. → *commenter et oublier* : sans conséquence observable.
- **Deux commentaires de code citent encore « Réunir en une copie »** (`js/travaux-import.js:2056`, `js/travaux-preparation.js:2376`). → *commenter et oublier* : ce ne sont pas des textes lus.
- **« tes étudiants »**, sans point médian (ligne 104, `js/accompagnement-contenu-popup.js`) : gardé tel quel, la forme inclusive n'étant pas décidée. → *inscrire et continuer*, avec la question à Grégoire.
- **La vérification de GitHub, rouge sur la 1.237.2** (relevée par la session de la nuit) : non revue ici.
