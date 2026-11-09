# Rapport : écarter une copie plagiée, ou lui mettre 0 (#1176)

**Deux sessions de Claude Code dans le cloud, le 9 nov. 2026.** Branche `lot/copie-non-recevable-choix`.
- **Session A** (nuit du 8 au 9 nov., entre 3 h et 6 h) : le lot en entier, partie de `origin/main` (`98c04bfc`, 1.237.2) ;
  ses textes posés comme PROPOSÉS. Son rapport est conservé plus bas (§ « Le détail »).
- **Session du 9 nov. après-midi** (celle-ci) : `origin/main` (1.238.0, « Un mot pour ton étudiant·e ») fusionnée dans la
  branche ; les textes validés par Grégoire posés mot pour mot ; le relevé du stock écrit ; les captures refaites.
  Consigne recopiée ci-dessous. Aucun fichier de coordination touché, aucune release, rien au changelog.

## En tête : ce que Grégoire verra

### Ce qui est fait

- **Les textes sont ceux que tu as validés** (9 nov., 10 h 08 à 10 h 13, en Cowork), mot pour mot, sans leur marque
  « proposé ». Une sentinelle les exige (`tests/unit/sentinelle-textes-copie-non-recevable-valides-9-nov.test.js`).
- **Ta variante « N meilleures » sur la copie** : en standards, quand la copie est au portfolio (ou aux productions
  retenues, sans Artefact) et que le mode de sélection de la pratique est « N meilleures », « lui mettre 0 » dit
  « lui mettre 0 : elle entre au portfolio avec 0 ; en « N meilleures », ce 0 ne compte que s'il te manque des
  productions ». **Elle s'affiche aussi en mode « Hybride »** (décision de Cowork, après ton relevé : la Sélection de
  l'hybride retient les meilleures) ; la phrase est la même, mot pour mot. Les modes « Tous » et « N plus récentes »
  gardent « lui mettre 0 : elle entre au portfolio avec 0 ». La terminale et l'obligatoire gardent leur texte, quel que
  soit le mode.
- **L'assistant** : « Lui mettre 0 », standards, dit ta phrase. Rien n'est coché d'avance. **Les réglages** : inchangés.
- **L'Aide** : ta puce « Lui mettre 0 » dans « Travail NON RECEVABLE » ; l'exemple de la terminale dans « Travail NON
  REMIS » ; et l'aide de « Notes finalisées » se termine par « En standards, une terminale non remise ou écartée vaut
  alors 0. »
- **Le calcul n'a pas bougé** (ta question 2). Tu choisiras toi-même « Lui mettre 0 » dans les réglages de ta pratique
  par standards, après la mise en ligne : **je n'ai rien écrit dans tes données**, et le lot n'écrit rien tant que tu ne
  cliques pas.
- **Le relevé de tes copies non recevables** (`scripts/releve-copies-non-recevables-a2026.js`, lecture seule). La
  relecture neuve y a trouvé deux défauts (des comptes faux sur la terminale, une écriture possible dans IndexedDB) :
  corrigés avant que tu le lances. **Lancé sur ton Mac le 9 nov. à 15 h 46** (relayé par Cowork) : **1 copie non
  recevable** en A2026 (IA non autorisée), dans ta pratique par standards (mode hybride, groupe 00007), au portfolio,
  verrouillée, lue « l'écarter » faute de règle écrite ; **aucune terminale touchée, 0 changement de note.** La fusion
  n'attend plus le relevé.
- **Captures Chromium à 1180 px** (pas WebKit), dans `plans de travail/captures-2026-11-09-copie-non-recevable-choix/`,
  qui remplacent celles de la nuit : la copie marquée dans une pratique par standards en « N meilleures », règle
  « l'écarter » cochée (`1a-…`), puis « lui mettre 0 » choisi (`1b-…`) ; les réglages de la pratique (`2-…`) ; l'étape de
  l'assistant, standards (`3-…`).

### Ce qui attend Grégoire (une question par ligne, avec ma recommandation)

1. **Ta copie au portfolio, dans ta pratique hybride.** Le relevé la lit « l'écarter » (ta pratique n'a pas de règle
   écrite) : elle manque à ta Sélection, comme une copie non remise. Si tu choisis « Lui mettre 0 » dans les réglages
   de ta pratique, comme tu l'as prévu, elle y entrera avec 0, qui ne comptera que s'il manque des productions à cet
   élève ; la ligne de la copie le dira. *Rien à décider ici ; c'est ton geste, après la mise en ligne.*
2. ~~En mode « Hybride », la copie au bloc Sélection garde le texte commun.~~ **Réglé par Cowork** : la précision
   s'affiche aussi en hybride. (Ma recommandation disait « ta pratique n'est pas hybride » : c'était faux, le relevé
   montre qu'elle l'est.)
3. **Le glossaire, « Notes finalisées »** (`js/accompagnement-contenu-terme.js:606`), dit seulement qu'en hybride une
   obligatoire non remise compte alors pour zéro ; il ne dit rien de la terminale. Non touché (texte non validé).
   *Proposition : ajouter « En standards, une terminale non remise ou écartée compte alors pour zéro. »*
4. **Une supposition de typographie, carte « Travail NON REMIS ».** Ta phrase commence par une majuscule ; je l'ai posée
   comme une phrase à elle : « … par exemple, en sommative, il n'y entre pas. En standards, une fois les notes finales
   cochées, une terminale non remise vaut 0 ; en mode hybride, une obligatoire non remise aussi. » (avant : « … il n'y
   entre pas ; en standards hybride, … »). *Si tu préfères la suite après « ; », c'est une minuscule à changer.*
5. **À la fusion des deux lots** : la phrase de l'étape 8 du neuvième parcours sur « Notes finalisées » (branche
   `lot/parcours-9-notation-alternative`) est à compléter pour la terminale. Non faite ici (autre branche) ; reportée.

Questions de la nuit, réglées par toi le 9 nov. : 1 (les textes) et 6 (l'Aide et « Notes finalisées ») sont posées ;
2 (le minimum des standards) : le calcul ne change pas ; 3 (un brouillon ou un « Incomplet » de terminale laisse la note
provisoire aux notes finales) : validé, c'est ce qui est codé ; 4, 7, 8 et 9 : gardées ; 5 : le relevé (question 1).

### Ce que je n'ai pas pu vérifier

- **WebKit, Safari, l'iPad** : rien. Les captures et les specs sont sous Chromium. À rejouer sur le Mac :
  `copie-non-recevable-choix-1176.spec.js`, les trois specs de l'assistant retouchées par la nuit, et les captures.
- **Tes données réelles** : le relevé (question 1). Il a été éprouvé ici sur un A2026 fictif seulement, contre les notes
  que l'application calcule elle-même avant et après le lot.
- **La relecture croisée de Cowork** (règle 2 de `PROTOCOLE.md`) : le champ `sortCopieNonRecevable` voyage avec la copie
  et la pratique.

## La consigne de cette session (relayée par Cowork, décisions de Grégoire du 9 nov. 2026, 10 h 08 à 10 h 13)

> LOT : finir « Écarter une copie plagiée, ou lui mettre 0 ». Branche existante `lot/copie-non-recevable-choix`. Fusionne
> d'abord origin/main dans la branche.
>
> 1. LE FOND (question 2) : le calcul ne change pas. Grégoire constate que sa règle des standards du 8 nov. (0 seulement
>    si la copie est nécessaire pour atteindre le nombre minimal) correspond à « lui mettre 0 » en « N meilleures ». Il
>    choisira lui-même « lui mettre 0 » dans les réglages de sa pratique après la mise en ligne : n'écris rien dans ses
>    données ; dis-le dans le rapport.
> 2. LES TEXTES, validés mot pour mot (retire leur marque « PROPOSÉS » ; une sentinelle Vitest les exige) :
>    - La ligne sur la copie (`TEXTES_SORT_COPIE_NON_RECEVABLE`) : ton tableau du rapport, tel quel, sauf une variante. En
>      standards, à la place « portfolio » et « sans Artefact », quand le mode de sélection de la pratique est « N
>      meilleures », « lui mettre 0 » dit : « lui mettre 0 : elle entre au portfolio avec 0 ; en « N meilleures », ce 0 ne
>      compte que s'il te manque des productions » (et l'équivalent « aux productions retenues » sans Artefact). Les
>      autres modes gardent ton texte. Le titre « Dans la note du cours : » et la ligne « Règle de ta pratique : … Ton
>      choix ne vaut que pour cette copie. » : validés.
>    - L'assistant et les réglages : tes textes, tels quels, sauf « Lui mettre 0 », standards : « Elle entre au portfolio
>      avec 0 ; en « N meilleures », ce 0 ne compte que s'il te manque des productions. Une terminale vaut 0. » Sans
>      réponse cochée d'avance : validé.
>    - L'avis « Travail non recevable » du formulaire : le retrait de la phrase « Dans la note du cours, elle vaut ce que
>      dit ta pratique : … » est validé ; le reste mot pour mot.
>    - L'Aide, « Travail NON RECEVABLE » : ton paragraphe, tel quel, sauf la puce « Lui mettre 0 », qui devient « « Lui
>      mettre 0 » : 0 en sommative, un travail non satisfaisant en spécifications, 0 en standards, au portfolio comme à la
>      terminale ; en « N meilleures », ce 0 ne compte que s'il manque des productions. »
>    - Question 6 : l'Aide, carte « Travail NON REMIS » : l'exemple devient « En standards, une fois les notes finales
>      cochées, une terminale non remise vaut 0 ; en mode hybride, une obligatoire non remise aussi. » ; l'aide de « Notes
>      finalisées » reçoit « En standards, une terminale non remise ou écartée vaut alors 0. »
> 3. LES AUTRES QUESTIONS : 3, validé par Grégoire : un brouillon ou un « Incomplet » de terminale laisse la note
>    provisoire aux notes finales (ce qui est codé). 4, 7, 8, 9 : on garde (Cowork). 5 : voir point 4.
> 4. LES DONNÉES DE GRÉGOIRE (question 5), avant toute fusion : prépare un relevé en LECTURE SEULE, à coller dans la
>    console de Chrome sur son Mac (`scripts/releve-copies-non-recevables-a2026.js`). Il compte, sans aucun nom d'élève,
>    les copies d'A2026 marquées non recevables, par pratique et par famille ; il dit si une pratique par standards a
>    « Notes finalisées » cochée avec une terminale non remise (elle passerait à 0), et si une terminale non recevable est
>    déjà marquée (elle passerait de 0 à provisoire). La fusion attendra que Grégoire l'ait lancé.
> 5. À REPORTER : la phrase de l'étape 8 du neuvième parcours sur « Notes finalisées » (branche
>    `lot/parcours-9-notation-alternative`) sera à compléter à la fusion des deux lots.
>
> Captures Chromium de la copie marquée (standards en « N meilleures », les deux choix), de l'étape de l'assistant et des
> réglages, à 1180 px, à remplacer dans `plans de travail/captures-2026-11-09-copie-non-recevable-choix/`. Mets à jour le
> rapport. Pousse. Le verdict WebKit et la fusion se feront sur le Mac.

## Les textes, validés le 9 nov. (mot pour mot)

**1. La ligne sur la copie** (`TEXTES_SORT_COPIE_NON_RECEVABLE`, `js/evaluation-sauvegarde.js`). Titre : « Dans la note du
cours : ». Les deux choix, selon la famille et la place de la copie :

| Où | « l'écarter » | « lui mettre 0 » |
|---|---|---|
| Sommative | l'écarter, comme une copie non remise : elle n'entre pas dans la moyenne | lui mettre 0 : elle compte pour 0 dans la moyenne |
| Spécifications | l'écarter, comme un travail non remis | lui mettre 0 : elle compte comme un travail non satisfaisant |
| Standards, portfolio | l'écarter, comme une copie non remise : elle manque au portfolio | lui mettre 0 : elle entre au portfolio avec 0 |
| Standards, portfolio, **« N meilleures »** | (idem) | lui mettre 0 : elle entre au portfolio avec 0 ; en « N meilleures », ce 0 ne compte que s'il te manque des productions |
| Standards sans « Artefact » | … elle manque aux productions retenues | … elle entre aux productions retenues avec 0 |
| Standards sans « Artefact », **« N meilleures »** | (idem) | lui mettre 0 : elle entre aux productions retenues avec 0 ; en « N meilleures », ce 0 ne compte que s'il te manque des productions |
| Standards, obligatoire (hybride) | l'écarter, comme une obligatoire non remise : elle vaut 0 une fois les notes finales cochées | lui mettre 0 : elle compte pour 0 tout de suite |
| Standards, terminale | l'écarter, comme une terminale non remise : la note reste provisoire, puis la terminale vaut 0 une fois les notes finales cochées | lui mettre 0 : la terminale vaut 0 tout de suite |
| Sans pratique | l'écarter, comme une copie non remise | lui mettre 0 |

Dessous : « Règle de ta pratique : l'écarter. Ton choix ne vaut que pour cette copie. » (ou « lui mettre 0 »).

**Quand la précision s'affiche** (`_poolRetientLesMeilleures`, `js/evaluation-sauvegarde.js`) : quand le pool de la
pratique retient les meilleures, lu comme le calcul le lit (`_obtenirConfigPortfolioCalcul`,
`js/profil-etudiant-actions.js`) — en hybride (catégories actives : la Sélection retient les N meilleures, décision de
Cowork du 9 nov.), et sinon quand `portfolio.methodeSelection` vaut « meilleurs » (aussi quand rien n'est écrit) ou
« hybride » écrit sans catégories actives (le calcul le trie comme « meilleurs »). « Tous » et « N plus récentes » : le
texte commun. Sans configuration de portfolio : le texte commun. **Supposition nommée** : l'ancien drapeau
`portfolio.hybride` n'est pas lu, parce que le calcul ne le lit plus (l'assistant ne l'écrit plus) ; seul, avec « Tous »,
l'écran des réglages afficherait « Hybride » pendant que la note fait « Tous » : la phrase suit la note.

**L'avis « Travail non recevable »** du formulaire : la phrase « Dans la note du cours, elle vaut ce que dit ta pratique : … »
est retirée (validé) ; le reste mot pour mot.

**2. L'assistant** (`js/wizard-pratique-v2.js`, étape `copie-non-recevable`) : titre « Une copie non recevable » ; « Quand
tu marques une copie non recevable (plagiat, IA non autorisée), que devient-elle dans la note ? » ; « L'écarter » —
sommative : « Elle n'entre pas dans la moyenne, comme une copie non remise. » ; spécifications : « Elle compte comme un
travail non remis. » ; standards : « Elle manque au portfolio, comme une copie non remise. Une terminale écartée laisse la
note provisoire, puis vaut 0 une fois les notes finales cochées. » ; « Lui mettre 0 » — sommative : « Elle compte pour 0
dans la moyenne. » ; spécifications : « Elle compte comme un travail non satisfaisant. » ; standards : **« Elle entre au
portfolio avec 0 ; en « N meilleures », ce 0 ne compte que s'il te manque des productions. Une terminale vaut 0. »** ;
l'encadré : « C'est ta règle. Quand tu marqueras une copie non recevable, elle apparaîtra déjà cochée, et tu pourras la
changer pour cette copie-là. La règle elle-même se change dans les réglages de ta pratique. »

**Les réglages de la pratique** (`index.html`) : « Une copie non recevable (plagiat, IA non autorisée), dans la note » ;
« L'écarter, comme une copie non remise » ; « Lui mettre 0 » ; « Ta règle. Quand tu marques une copie non recevable, elle
apparaît déjà cochée ; tu peux la changer pour cette copie-là. » L'aide de « Notes finalisées » se termine par **« En
standards, une terminale non remise ou écartée vaut alors 0. »**

**3. L'Aide** (`index.html`, `accordeon-aide-irrecevables`), « Travail NON RECEVABLE » :

> Une copie non recevable compte comme non remise dans la complétion (C) ; elle reste dans le total attendu. Dans la note, c'est
> toi qui choisis son sort. Ta pratique de notation porte ta règle ; quand tu marques une copie non recevable, ta règle apparaît
> déjà cochée sous le menu, et tu peux la changer pour cette copie-là.
> - « L'écarter » : elle est traitée comme une copie non remise. En sommative, elle n'entre pas dans la moyenne ; en
>   spécifications, elle compte comme un travail non remis ; en standards, elle manque au portfolio, avec ce que ta pratique fait
>   d'une copie manquante. Une terminale écartée laisse la note provisoire, puis vaut 0 une fois les notes finales cochées, comme
>   une terminale non remise ; en mode hybride, une obligatoire écartée aussi.
> - **« Lui mettre 0 » : 0 en sommative, un travail non satisfaisant en spécifications, 0 en standards, au portfolio comme à la
>   terminale ; en « N meilleures », ce 0 ne compte que s'il manque des productions.**
> - En dénotation, ta note est ton jugement : la copie n'y entre pas par calcul.
>
> Une pratique créée avant ce choix, tant que tu ne choisis pas sa règle, lit : 0 en sommative, un travail non satisfaisant en
> spécifications, « L'écarter » en standards. Tu changes sa règle dans Conception → Pratiques. Une reprise remplace la copie non
> recevable, quel que soit son sort.

« Travail NON REMIS » : « … La note dépend de ta pratique ; par exemple, en sommative, il n'y entre pas. **En standards, une
fois les notes finales cochées, une terminale non remise vaut 0 ; en mode hybride, une obligatoire non remise aussi.** »
(question 4 : la ponctuation avant ta phrase).

L'infobulle `eval-integrite` (« dans la note, son sort dépend de ta pratique ») tient encore : non touchée.

## Le détail

### La session du 9 nov. après-midi

**Commits** (`git log --oneline 3095eec..lot/copie-non-recevable-choix`) :
- `e2a3e7f8` merge : `origin/main` (1.238.0) fusionnée. Deux conflits de code, les deux côtés gardés : la reprise part
  sans le choix de la copie ET sans le mot (`js/evaluation-jetons.js`) ; la modification enregistre le choix de la copie
  ET le mot (`js/evaluation.js` ; le chemin de création les portait déjà tous deux, `js/evaluation-sauvegarde.js`).
  `index.html` : les jetons de `main`, puis `20261109s` pour les 18 fichiers dont le contenu fusionné diffère de `main`
  (aucun autre `20261109s` sur les branches du dépôt).
- `5ba6c36d` les textes validés, la variante « N meilleures », la sentinelle (jetons `20261109t` des deux fichiers retouchés).
- `0df3f9c4` le relevé du stock.
- `f500c0cc` les captures.
- `421ec565` le rapport (premier jet de la session).
- `241838a1` le relevé corrigé après la relecture neuve, et le rapport complété.
- (le dernier : la précision « N meilleures » affichée aussi en hybride, et ce rapport.)

**La sentinelle des textes validés** (`tests/unit/sentinelle-textes-copie-non-recevable-valides-9-nov.test.js`, 13 essais).
La ligne de la copie se juge AU RENDU : le vrai `evaluation-sauvegarde.js` sur le bloc d'`index.html` (menu « Intégrité
académique » et `divSortNonRecevable`), avec les vrais prédicats du registre ; chaque famille, chaque place, et pour le
pool des standards chaque mode (« meilleurs », rien d'écrit, « tous », « derniers », « recents », hybride par `categories`,
« hybride » écrit sans catégories, l'ancien drapeau `portfolio.hybride` seul, sans portfolio). L'assistant par ses options, les réglages, l'avis et l'Aide dans `index.html`. Les
insécables sont ramenées à l'espace avant comparaison (ce ne sont pas des mots) ; un essai à part exige celles de la
source. Plus aucune marque « PROPOSÉS, en attente de Grégoire » sur ces textes.
Break-tests, une mutation à la fois, fichier restauré : **11 mutants, 11 rouges** — la variante jamais prise ; l'hybride
par `categories` oublié ; « meilleurs » par défaut oublié ; « te manque » → « manque » (productions retenues) ; le titre ;
le texte standards de l'assistant revenu à celui de la nuit ; la puce de l'Aide revenue ; l'exemple « NON REMIS » revenu ;
la phrase de « Notes finalisées » retirée ; la marque « PROPOSÉS » remise ; un mot retiré de l'aide des réglages.
Trois sentinelles existantes suivent : `sentinelle-audit-aide-15-oct-…` (la puce « Lui mettre 0 » citée mot pour mot) et,
en commentaire seulement, `sentinelle-copie-non-recevable-affichage-28-oct` et `sentinelle-note-provisoire-reservee`.

**Le relevé** (`scripts/releve-copies-non-recevables-a2026.js`). Autonome : la version en ligne n'a pas le code du lot.
Il recopie la règle du code sans l'appeler : les prédicats d'une copie du registre (`_copieCompteParElleMeme`,
`originaleEstRemplacee`, `evaluationEntreDansLaNote`, `evaluationNonRemise`, identiques sur `main` et sur le lot), et la
note de terminale de `_obtenirNoteTerminaleEtudiant` (`js/profil-etudiant-actions.js`) dans ses deux versions : celle de
`main` pour « avant », celle du lot pour « après » (`copieNonRecevableEcartee`, `terminaleManquante`). Il la calcule pour
CHAQUE élève de chaque groupe-cours par standards et compte les changements (0 → provisoire, provisoire → 0, autres), avec
leur cause (non recevable ; non recevable avec une reprise accordée pas encore évaluée ; non remise ; aucune copie).
La pratique d'un groupe-cours : `groupesCours[].pratiqueId`. Une copie se range sous le groupe-cours qu'elle porte, sinon
celui de son cours, départagé par le groupe de l'élève ; sinon elle est comptée « sans groupe-cours retrouvé ».
Lecture par `db.getSync` seul (au démarrage, db.js range tout IndexedDB en mémoire ou dans le localStorage ; `db.get`,
lui, recopie dans IndexedDB une clé qu'il n'y trouve pas).

**L'oracle du relevé** (script jetable, Chromium) : un A2026 fictif de huit élèves en standards, une terminale chacun dans
une situation différente (plagiée et verrouillée ; plagiée avec une reprise accordée pas encore évaluée, la reprise née
comme le fait `appliquerJetonReprise` ; brouillon plagié ; aucune copie ; non remise ; notée ; plagiée puis reprise
évaluée ; brouillon ordinaire), avec et sans « Notes finalisées ». La vérité : la note de terminale calculée **par
l'application elle-même** (`calculerDetailsNoteFinale`), sur `origin/main` (un worktree jetable) puis sur le lot. Le
relevé, lancé sur `main` derrière un `db` et un `localStorage` qui refusent toute écriture, rend **les mêmes comptes** :
sans notes finales, 2 de 0 à provisoire ; avec, 1 de 0 à provisoire (la reprise en attente) et 3 de provisoire à 0
(brouillon plagié, aucune copie, non remise). 0 écriture tentée ; aucun nom ni DA dans la sortie. **Le premier relevé,
devant le même oracle, rendait 0 et 4 avec notes finales** (au lieu de 1 et 3) : l'essai sait le prendre en défaut.

**La précision en hybride** (décision de Cowork, 9 nov., après le relevé de Grégoire). Seule la condition d'affichage
change ; la phrase reste mot pour mot. `_modeSelectionNMeilleures` devient `_poolRetientLesMeilleures` : vrai si les
catégories sont actives, ou si `methodeSelection` vaut « meilleurs » (ou rien) ou « hybride » ; l'ancien drapeau
`portfolio.hybride` n'est plus lu (le calcul ne le lit plus). L'obligatoire et la terminale d'une hybride gardent leur
texte (la précision n'existe qu'au pool). Jeton `20261109v`. La sentinelle (13 essais) exige la précision en hybride
(catégories actives, « hybride » écrit), au pool comme aux productions retenues, et son absence en « Tous », « N plus
récentes » (« derniers », « recents »), avec l'ancien drapeau seul et « Tous », et à la terminale d'une hybride.
Break-tests, une mutation à la fois, fichier restauré : **5 mutants, 5 rouges** — l'hybride exclu ; l'ancien drapeau
relu ; « hybride » écrit oublié ; « recents » ajouté ; une pratique sans portfolio prise pour « N meilleures ». Les
captures `1a` et `1b` (une pratique en « N meilleures ») restent justes.
Vitest depuis `tests/`, après ce changement : **896 fichiers, 10 903 essais, tous verts**.

**Les captures** : script jetable (hors dépôt), Chromium, 1180 × 820, deviceScaleFactor 2 ; une pratique par standards
« Standards témoin » en « N meilleures », sans règle écrite (elle lit « l'écarter »), l'élève fictif « Élève Fictif »,
Artefact 1 marqué « Non recevable (Plagiat) ». Le clic sur « lui mettre 0 » s'est enregistré tout seul avec la copie
(`sortCopieNonRecevable: 'zero'`). L'étape de l'assistant est ouverte directement (son compteur dit « Étape 1/2 » ; dans
un vrai parcours, elle vient après la configuration de la famille). Les notifications ont été retirées avant chaque prise.

**Vérifié** : Vitest depuis `tests/`, à `f500c0cc` : **896 fichiers, 10 903 essais, tous verts** (au départ de la session,
3095eec : 893 et 10 875 ; +2 fichiers venus de `main`, +1 la sentinelle). Playwright **sous Chromium** :
`copie-non-recevable-choix-1176.spec.js` et `un-mot-pour-ton-etudiant.spec.js`, **12/12 verts** (les deux lots que la
fusion a croisés). **Le verdict WebKit reste à prendre sur le Mac.**

**Relecture par un agent neuf** (sans mon raisonnement ; skill `verification-adverse` ; commits `e2a3e7f8` à `f500c0cc`) :
**« à corriger »** — les textes, le mode « N meilleures », la sentinelle et la fusion sont bons ; le relevé comptait faux
les deux chiffres de la question 5. Ses trouvailles et leur sort :

1. *Le relevé comptait faux les terminales qui bougent* : il prenait toute copie marquée pour un 0 « avant le lot » (un
   brouillon plagié n'entre pas dans la note) et toute originale dont la reprise existe pour remplacée (elle ne l'est que
   si sa reprise compte). **Corrigé** (mon code : le lot n'était pas fini) ; prouvé par l'oracle ci-dessus.
2. *Le relevé pouvait écrire dans IndexedDB* (`db.get` recopie une clé absente). **Corrigé** : `db.getSync` seul.
3. *Les textes sont conformes mot pour mot.* Typographie, supposition nommée : dans l'assistant et la puce de l'Aide, les
   espaces avant « ; », « : » et dans « » sont ordinaires, comme le texte voisin ; la ligne sur la copie est en
   insécables, comme la sienne. La carte « NON REMIS » : le point avant ta phrase est jugé fidèle (question 4).
4. *La détection « N meilleures » est conforme à la lettre de la consigne.* Trois écarts, sans défaut : l'hybride
   (question 2) ; un ancien drapeau `portfolio.hybride` sans catégories actives, que l'écran montre « Hybride » et que le
   calcul trie en « N meilleures » ; « Hybride » choisi puis catégories décochées (`methodeSelection: 'hybride'`), même
   effet. Le texte suivait l'écran dans les deux derniers cas : issue 3, sans conséquence observable pour la cohorte.
   ↻ Après la décision de Cowork sur l'hybride (plus bas), la phrase suit le calcul dans les trois cas.
5. *La sentinelle mord* : 13 mutations sur 15 la font rougir ; les deux qui restent vertes (le titre et la phrase du jeton
   de l'avis) sont gardées par `sentinelle-copie-non-recevable-affichage-28-oct` (rouge prouvé).
6. *La fusion est bonne* : les deux ajouts sont gardés aux trois chemins d'écriture (Enregistrer, Modifier,
   auto-sauvegarde) ; les 18 jetons sont neufs, et seuls eux ont changé.

**Trouvailles, et leur issue**
- **Le glossaire, « Notes finalisées »**, ne dit rien de la terminale (question 3 de l'en-tête). Texte non validé : issue 2,
  proposé, non posé.
- **L'audit d'ouverture** signale, sur GitHub, le push de la 1.238.0 : `pages-sans-emboitement-2026-11-07.spec.js ›
  Préparer (sombre)` rouge sur le runner Linux, ni au BACKLOG ni au RELAIS (vert sur le Mac, selon le relais). Hors lot :
  issue 2, à inscrire par la session du Mac (§ « À inscrire »).
- **La branche `lot/completion-suit-la-remise`** (session D) touche sept fichiers de ce lot (`index.html`, quatre moteurs
  de pratique, `predicats-copie.js`, `sentinelle-audit-aide-15-oct-…`) : la seconde à rejoindre `main` aura des conflits.
  Attendu ; à la fusion sur le Mac.


### L'en-tête de la session A (nuit du 8 au 9 nov.), conservé

**Ce qu'elle avait fait** (tel quel ; seuls les textes ont changé depuis, et les captures) :

- **Marquer une copie « Non recevable (Plagiat) » ou « Non recevable (IA non autorisée) »** fait apparaître, juste sous le menu
  « Intégrité académique », la ligne « Dans la note du cours : » et deux choix, « l'écarter » et « lui mettre 0 », chacun avec ce
  qu'il fera à la note pour la famille de la pratique et la place de la production (portfolio, obligatoire, terminale). La règle de
  la pratique est **déjà cochée** ; dessous, « Règle de ta pratique : … Ton choix ne vaut que pour cette copie. » Un clic change le
  choix pour cette copie seulement ; il s'enregistre tout seul avec elle (comme le statut) et revient quand on la rouvre, même
  après un rechargement. Repasser à « Recevable » efface le choix. En dénotation, rien ne s'affiche.
- **Conception → Pratiques, les réglages de la pratique** portent une nouvelle ligne : « Une copie non recevable (plagiat, IA non
  autorisée), dans la note », avec « L'écarter, comme une copie non remise » et « Lui mettre 0 ». Elle montre la règle telle que
  le calcul la lit. **Changer un autre réglage ne l'écrit pas** ; seul un clic sur elle l'écrit.
- **L'assistant de création** pose une question neuve après la configuration de la famille : « Une copie non recevable — Quand tu
  marques une copie non recevable (plagiat, IA non autorisée), que devient-elle dans la note ? », **sans réponse cochée d'avance**
  (on ne passe pas sans choisir). Un modèle adopté passe par la même question. Sautée en dénotation. Rouvrir une pratique dans
  l'assistant montre sa règle ; ré-enregistrer sans y toucher n'écrit rien de plus.
- **Les notes** suivent la règle, dans toutes les familles et partout où la note se calcule (profil, indice P, Comparateur,
  captures, export) :
  - « l'écarter » : la copie est traitée **exactement comme une copie non remise** (prouvé cas par cas contre la même copie retirée) ;
  - « lui mettre 0 » : 0 en sommative, un travail non satisfaisant en spécifications, 0 en standards (portfolio et terminale).
    Retenue au portfolio, la copie montre partout son libellé et le 0 compté, **jamais sa note ni ses niveaux d'origine** (profil,
    bilan et PDF de l'élève) ;
  - une pratique sans règle écrite se lit comme avant (sommative 0, spécifications non satisfaisant, standards « l'écarter ») :
    **aucune donnée n'est réécrite**, ni pratique ni copie ;
  - **terminale des standards** : non remise ou écartée, la note reste provisoire pendant le trimestre ; une fois « Notes
    finalisées » cochée, elle vaut 0. Un brouillon de terminale, un « Incomplet » : provisoires, comme avant (question 3).
- **Le dépistage et les trajectoires** suivent la règle : écartée, la copie sort comme une non remise ; à 0, elle compte 0
  (avant, le dépistage lisait sa note calculée brute).
- **L'Aide**, carte « Copies non remises, non recevables… », paragraphe « Travail NON RECEVABLE » : réécrit (proposé, plus bas).
- **La complétion (C) n'a pas bougé** : une copie non recevable y reste non remise dans les deux cas (la session D y touche).

Captures Chromium (pas WebKit) : `plans de travail/captures-2026-11-09-copie-non-recevable-choix/` — la copie marquée,
les réglages, l'étape de l'assistant, à 1440 px et à la largeur de l'iPad (820 px).

**Ses questions**, réglées par Grégoire le 9 nov. (voir l'en-tête) :

1. **Les textes proposés** (section suivante) : à corriger. La consigne voulait les mots validés avant l'écran ; le plan de la
   nuit m'a demandé de les poser pour que l'écran fonctionne, marqués « PROPOSÉS » dans le code. Chacun vit à un seul endroit.
   *Recommandation : les lire sur les captures, d'abord la ligne de la copie ; ne rien publier avant ton accord.*
2. **Ton exemple des standards ne correspond pas à « l'écarter »** (piège du minimum, mesuré, § « Le minimum »). Avec
   4 productions retenues, 3 faites (80, 75, 70) et la 4e plagiée : « l'écarter » donne **75** (la moyenne des trois, comme une
   copie non remise ; 70 ou 0 si la pratique plafonne sous le minimum) ; « lui mettre 0 » donne **56,25**, c'est-à-dire ton exemple
   « la 4e, plagiée, vaut 0 ». En « N meilleures », une copie à 0 n'entre que s'il manque des productions : c'est mot pour mot ta
   phrase du 8 nov. (« elle vaut 0 seulement si elle est nécessaire pour atteindre le nombre minimal »). *Recommandation : ne rien
   coder ; garder « l'écarter = une copie non remise » (ta décision 2), et choisir « lui mettre 0 » pour ta pratique standards si
   c'est cet effet que tu veux. Si le mot « lui mettre 0 » ne te va pas pour ce cas, c'est le texte à revoir, pas le calcul.*
3. **Une terminale en brouillon (ou « Incomplet ; travail en cours ») aux notes finales : 0, ou provisoire ?** Ta décision 4 dit
   « non remise OU écartée ». Je m'en suis tenu là : un brouillon, un incomplet ou une copie de portée nulle laissent la note
   provisoire, comme avant. Les obligatoires hybrides, elles, comptent déjà 0 en brouillon aux notes finales (#896). Le pack démo
   en porte deux cas (DEMO006 et DEMO020, terminales en brouillon). *Recommandation : provisoire (ce qui est codé) : un brouillon
   est une copie remise, pas encore jugée ; la mettre à 0 punirait le retard de l'enseignant·e.*
4. **Pack démo : un élève bouge sans geste.** **DEMO004** : note inchangée (64,92), mais RàI 2 → **1** : sa copie plagiée
   (Artefact 9, note 0) sort du dépistage (standards sans règle écrite = « l'écarter »), sa performance récente passe de 0,452 à
   0,697. *Recommandation : garder ; c'est l'effet voulu (le plagiat se lit dans la complétion, pas comme une performance de 0).
   Si tu préfères qu'un plagiat pèse au dépistage, c'est « lui mettre 0 » qu'il faut choisir pour la pratique démo.*
5. **Tes données réelles** (à mesurer sur le Mac) : combien de copies sont marquées non recevables en A2026, dans quelles
   pratiques ; si une pratique standards a « Notes finalisées » cochée avec une terminale non remise (elle passerait à 0) ; et si
   une terminale non recevable est déjà marquée (elle passerait de 0 à provisoire). *Recommandation : mesurer avant la fusion ;
   aucune note de sommative ou de spécifications ne peut bouger sans geste, seules les standards le peuvent, par la terminale.*
6. **Deux textes que ta décision 4 rend incomplets, non posés** :
   - l'Aide, carte « Travail NON REMIS » : ajouter « ; une terminale non remise aussi » à l'exemple « en standards hybride, une
     fois les notes finales cochées, une obligatoire non remise vaut 0 » ;
   - l'aide de « Notes finalisées » (réglages de la pratique) dit seulement qu'elle change le titre du PDF ; en standards, cocher
     la case met maintenant à 0 une terminale non remise ou écartée. *Proposition : « En standards, une terminale non remise ou
     écartée vaut alors 0. »*
7. **Le choix fait sur une copie vaut pour toutes les pratiques que le Comparateur simule** (supposition nommée : c'est une
   décision sur la copie, pas sur la pratique). *Recommandation : garder.*
8. **Dans le récit de calcul** (profil, Comparateur), une copie écartée n'apparaît plus, comme une copie non remise ; une terminale
   manquante aux notes finales s'y inscrit « comptée · poids 40 % » à 0. *Recommandation : garder pour la cohorte ; un mot neuf
   (« manquante, 0 ») si tu veux la nommer.*
9. **« Ajouter » depuis la bibliothèque, « Dupliquer » et l'import ne posent pas la question** : la pratique garde la règle de sa
   source, ou, sans règle, la lecture de sa famille. *Recommandation : suffisant ; la question se pose à la création.*

### Session A : commits

```
git log --oneline 98c04bfc..lot/copie-non-recevable-choix
```
- `9ebe8763` feat(#1176) : le calcul, l'écran, l'Aide, les essais (et les jetons anti-cache de 15 fichiers) ;
- `c13ee690` test(#1176) : le verrou sommatif juge une copie écartée sous le seuil (mutant « note brute ») ;
- `ae2a9b0a` fix(#1176) : le choix de la copie vit sur l'écran, pas dans « l'évaluation en cours » ; la spec ; l'assistant ;
- `c28b97b5` docs(#1176) : premier jet de ce rapport, captures, les « Flux E » répondent à la question neuve ;
- `cedef6fb` fix(#1176) : ce que la relecture neuve a trouvé (§ Relecture) ;
- (le dernier : ce rapport complété.)

### Où vit la règle (choix techniques de Cowork, gardés)

- **Un seul lecteur, le registre** (`js/pratiques/pratique-registre.js`) : `sortCopieNonRecevableDeLaPratique(configuration,
  famille)` (la règle écrite, sinon la lecture de la famille), `valeurCopieNonRecevable(copie, règle)` (le choix de la copie, sinon
  la règle), `copieNonRecevableEcartee`, `noteRetenueParLeCalcul`, et `terminaleManquante` (décision 4). Aucune famille ne relit
  `statutIntegrite` (sentinelle).
- **Chaque famille nomme la règle de LA pratique qu'elle calcule** : la sommative et les spécifications configurables la passent
  à leur délégué ; les standards la lisent sur la configuration demandée (`calculerDetailsNoteFinale(da, pratiqueId)`) — le
  Comparateur simule d'autres pratiques que l'active (gardé par trois essais). Le dépistage, les trajectoires et le PDF lisent la
  pratique active.
- **Lecture au calcul, sans migration** : rien n'est écrit dans `pratiquesConfigurables` ni dans les copies tant que
  l'utilisateur ne choisit pas (essai « Le stock »). Le champ `sortCopieNonRecevable` voyage avec la copie et la pratique
  (codex, export, import : objets entiers) ; une reprise naît sans lui (`evaluation-jetons.js`).
- **Sur l'écran, le choix de la copie vit sur le bloc** (`data-choix-copie`), comme le statut dans son menu : l'application a deux
  « évaluation en cours » qui ne sont pas toujours le même objet (#699) ; la spec l'a montré.
- **Les niveaux d'une copie non recevable** restent hors des lectures dans les deux cas (#1228) ; gardée à 0 et retenue, elle
  montre son libellé et le 0 compté.

### Le minimum des standards (piège 1 de la consigne)

Mesuré avec un banc jetable (le banc de `copie-non-recevable-choix-1176`, N = 4, minimum 4, A1 80, A2 75, A3 70, A4 plagiée) :

| Plafonnement de la pratique | « l'écarter » | non remise (témoin) | « lui mettre 0 » |
|---|---|---|---|
| aucun | 75 | 75 | 56,25 |
| un manquant → 70 au plus | 70 | 70 | 56,25 |
| un manquant → échec | 0 | 0 | 56,25 |

Ce que fait le code d'une copie manquante sous le minimum : il fait la moyenne de ce qui est là, puis applique le plafonnement de
conformité si la pratique en porte un (`_appliquerPlafonnementConformite`). Il ne compte jamais la manquante pour 0. **Non
tranché** : c'est la question 2.

### La terminale des standards pendant le trimestre (piège 2)

Une terminale non recevable **écartée** (lecture des standards existantes) ne vaut plus 0 tout de suite : la note reste
provisoire jusqu'aux notes finales. C'est la seule note qui peut bouger sans geste dans une pratique existante. **Au pack démo :
aucun cas** (aucune terminale non recevable).

### Mesure du pack démo

Script jetable (`node`, Chromium, `activerModeDemo()` sur `origin/main` puis sur la branche à `cedef6fb` ; pour chaque élève :
note du profil, provisoire, terminale, P stocké, niveau RàI et son motif, performance du dépistage). Pratique active :
`demo-std-litt`, standards, « Notes finalisées » cochée, des deux côtés. Dix élèves ; **un seul change** :

```
DEMO004 profil 64,92 = ; P 65 = ; RàI 2 (persistante) → 1 (au-dessus-de-la-ligne) ; dépistage 0,452 → 0,697
```
Témoin : les neuf autres sortent identiques, champ par champ. Avant la relecture (`ae2a9b0a`), DEMO006 (77,43 → 46,46) et DEMO020
(84,53 → 50,72) bougeaient aussi : leurs terminales sont en brouillon, et le code les mettait à 0 aux notes finales. C'est la
trouvaille 2 de la relecture ; resserré à la décision 4 (question 3).

### Session A : essais

- **Vitest** (depuis `tests/`) : 893 fichiers, 10 875 essais verts (§ Verdict).
- **`tests/unit/copie-non-recevable-choix-1176.test.js`** (43 cas) : chaque famille × chaque choix × chaque place, sur les
  modules réels (P stocké, Comparateur, captures, profil) ; chaque « l'écarter » comparé à la même copie retirée ; le minimum ; la
  terminale provisoire puis finale, le brouillon qui ne manque pas, et l'instance de repli ; l'obligatoire hybride ; la
  dénotation ; le Comparateur sur une pratique non active (SOM, STD, SPE) ; ce que les vues lisent (liste des retenues, bloc Note
  du PDF) ; le registre ; le dépistage ; les trajectoires ; le stock (aucune écriture).
- **Break-tests** (une mutation à la fois, fichier restauré) : 15 mutants du calcul, 15 rouges, plus un équivalent nommé (retirer
  le filtre du verrou sommatif ne change rien : `appliquerDoubleVerrou` ignore déjà une note absente ; l'essai a été durci pour la
  note brute). Après la relecture : 6 mutants de plus, 6 rouges (règle de l'active au Comparateur ×2, fuite de la note d'origine,
  brouillon de terminale à 0 ×2, obligatoire du PDF sans son 0).
- **`tests/unit/sentinelle-wizard-golden-creation-319.test.js`** (+5) : l'étape, rien de coché d'avance (lu au rendu réel), la
  réponse écrite à la création et au modèle adopté, rouvrir sans changer n'écrit rien, famille changée, dénotation rien. Cinq
  mutants, cinq rouges.
- **`tests/integration/copie-non-recevable-choix-1176.spec.js`** (3, **Chromium**) : le choix au marquage, coché selon la règle ;
  le geste enregistré, revenu après un rechargement ; sans geste rien d'écrit ; « Recevable » le retire ; les réglages de la
  pratique (un autre champ n'écrit pas la règle, le geste l'écrit, la copie la suit). Break-tests : sans le chargeur, rouge ; sans
  la garde « au geste seulement », rouge. Aucune pause fixe (cliquet des pauses).
- **Sentinelles mises à jour là où la décision change la valeur**, chaque fois avec la date et le motif dans l'essai :
  `sentinelle-copie-non-recevable-vaut-la-regle-28-oct` (terminale provisoire, puis 52 aux notes finales ; le « réglage simulé »
  devient le vrai), `sentinelle-construction-de-la-note-2026-10-28` (STD-6, STD-C3) et `…-correctifs-2026-10-28` (E7-b),
  `sentinelle-audit-aide-15-oct-…` (le code et l'Aide), `sentinelle-copie-non-recevable-affichage-28-oct` (l'avis),
  `sentinelle-note-provisoire-reservee` (deux exceptions « pratique alternative »), `sentinelle-wizard-golden-creation-319` (la
  porte « modèle » passe par la question : 4 étapes au lieu de 3), deux harnais (`…-935-…`, `…-spe-configurable-delegation-…`) ;
  quatre specs qui parcourent l'assistant répondent à la question neuve (« Flux E », audit sommatif, 898, 909).
- **Complexité** : aucune fonction figée ne monte, le compte au-dessus de 15 reste 437.

### Session A : relecture par un agent neuf

Un sous-agent sans mon raisonnement, avec la consigne et le diff `98c04bfc..ae2a9b0a`, skill `verification-adverse`. **Verdict :
« à corriger »**. Ses neuf trouvailles, et leur sort :

1. *Sous « lui mettre 0 » en standards, la note et le niveau d'origine d'une copie plagiée sortaient jusqu'au bilan et au PDF de
   l'élève et au profil* (une couture que le lot ouvrait : avant, aucune copie non recevable n'entrait au pool). **Corrigé**
   (`cedef6fb`) : libellé et 0 compté, à la source (`_artefactRetenuVu`), au PDF (obligatoires), à la carte du profil. Essais.
2. *Le rapport disait « pas de terminale » pour DEMO006 et DEMO020 ; ce sont des brouillons, que le code mettait à 0 aux notes
   finales, au-delà de la décision 4.* **Corrigé** : resserré à « non remise ou écartée » (`terminaleManquante`) ; question 3.
3. *Trois specs de l'assistant rougissaient (étape neuve).* **Corrigé** : elles répondent à la question.
4. *L'essai « rien de coché d'avance » ne pouvait pas échouer* (`defaut` au lieu de `default`). **Corrigé**, mutant rouge.
5. *Aucun essai ne gardait le Comparateur sur une pratique non active.* **Corrigé** : trois essais, deux mutants rouges.
6. *Des textes non validés à l'écran ; une phrase de l'Aide fausse pour la terminale ; l'aide de « Notes finalisées » muette.*
   **Remonté** (questions 1 et 6) ; la phrase de l'Aide est corrigée.
7. *Forme `.config` (#712) : la configurable ne relisait que `.configuration`.* **Corrigé** (mon code : « le lot n'était pas fini »).
8. *Assistant rouvert, famille changée : la réponse montrée pouvait céder à la lecture de l'autre famille.* **Corrigé**, essai.
9. *Le récit écrit « comptée » pour une terminale manquante à 0 ; un commentaire périmé.* **Commenté** (question 8).

### Session A : les specs Playwright des fichiers touchés, sous Chromium

Les 71 specs qui touchent la surface du lot (`grep -lE "statutIntegrite|wizard|Wizard|ouvrirReglagesPratique|chargerPratiquePourModif|
mat-notes-finales|calculerDetailsNoteFinale|determinerNiveauRai|trajectoire|non-recevable|plagiat" tests/integration/*.spec.js`),
plus la spec neuve, sous Chromium (configuration jetable hors dépôt ; WebKit absent). Les 40 fichiers où un premier passage avait
rougi ont été rejoués **à l'identique sur `main` (`98c04bfc`) et sur la branche (`cedef6fb`)** :

| | rouges | instables | verts |
|---|---|---|---|
| `main` | 5 | 2 | 232 |
| branche | 6 | 2 | 234 |

- **Rouges des deux côtés** (Chromium n'est pas la cible ; mise en page) : `barre-outils-compacte` ×2, `palette-retroaction-compacte`
  ×2.
- **`comptes-erreurs-stock-1142`** : instable des deux côtés (rejoué seul, deux fois : branche 24/24 avec la suivante ; `main`, un
  rouge sur 24). **`critere-algorithmique-calculs-4a`** : rouge sur `main`, vert sur la branche (instable).
- **`lot-a-anonymisation-enregistre`** : rouge au passage complet de la branche (la rétroaction sans « Bonjour Élève N ! »), vert
  rejoué seul deux fois. Instable ; rien dans le lot ne touche la génération de la rétroaction.
- **Ce que le lot avait cassé, et qui ne l'est plus** : les « Flux E » (3), l'audit sommatif, les adoptions 898 et 909, tous
  parcourant l'assistant sans répondre à la question neuve (premier passage). Verts au second.

Un premier passage a été faussé par ma faute : j'ai retiré du dépôt la configuration jetable pendant qu'il tournait, et chaque
essai relancé ensuite est tombé sur « Cannot find module ». Écarté ; c'est le second passage qui compte.

### Session A : verdict

- **Vitest** (depuis `tests/`, à `791f08b5`, le code de `cedef6fb`) : **893 fichiers, 10 875 essais, tous verts**. Au départ
  (`98c04bfc`) : 892 fichiers, 10 825 essais.
- **Playwright** : sous Chromium seulement (ci-dessus). **Le verdict WebKit reste à prendre sur le Mac.**

### Session A : trouvailles, et leur issue

1. **Deux « évaluation en cours »** (le nom nu de `config.js` et `window.evaluationEnCours`) : trouvé par la spec, sur mon
   propre code. Corrigé dans le lot (`ae2a9b0a`). Pas une trouvaille au sens des trois issues : c'était le lot qui n'était pas fini.
2. **Les cinq sites du dépistage que #1176 nomme dans les instances** (`_calculerIndicesTroisDerniersArtefacts`, `detecterDefis`,
   `identifierPattern`, `obtenirDonneesProfil` des familles) lisent encore la note brute, mais n'ont **aucun appelant vivant**
   (`git grep -n "\.detecterDefis(\|\.identifierPattern(\|\.obtenirDonneesProfil("` ne rend que des appels internes à ces mêmes
   instances ; la relecture le confirme). Issue 3 : sans conséquence observable.
3. **`_estActiveMoteur`** (`js/entites/reconciliation-evaluations.js`) tient une copie non recevable hors de la réconciliation des
   doublons, même gardée à 0. Issue 3 : commenté dans le code, sans effet sur la note.
4. **Le cliquet anti-cache** a refusé deux commits (jetons `?v=` à relever) : fait. À la fusion, les autres branches de la nuit
   auront relevé les mêmes jetons : conflits attendus dans `index.html`, à résoudre en prenant la lettre la plus haute.
5. **Sous Chromium, sur `main` comme sur la branche**, des specs de mise en page rougissent (§ specs) : Chromium n'est pas la
   cible. Issue 3 pour ce lot.

## À inscrire au BACKLOG

- **Session du 9 nov. après-midi** : `pages-sans-emboitement-2026-11-07.spec.js › Préparer (sombre)`, rouge sur le
  runner Linux de GitHub au push de la 1.238.0, absente du BACKLOG et du RELAIS (mesure de l'audit d'ouverture) ; à ranger
  avec #1246 ou à part, à la décision de la session du Mac. Hors de ce lot.
- Le reste, de la session A :

- **#1176 devient ce lot** (consigne du 8 nov.) ; #1226 y est lié (les trajectoires suivent la règle). **La terminale non remise à
  0 une fois les notes finales cochées s'inscrit dans #1176** (mon choix, la consigne me le laissait) : même décision, même code.
  Y noter que les cinq sites du dépistage des instances n'ont pas d'appelant (trouvaille 2).
- ~~**Si Grégoire répond « 0 » à la question 3**~~ : périmé. Il a validé « provisoire » le 9 nov. (ce qui est codé) : rien à inscrire.
- Du rituel d'ouverture (audit de début de session, à `98c04bfc`) : sur GitHub, le verdict Playwright du push de la 1.237.2 est
  rouge par quatre specs ; deux sont déjà dans #1246 (`annotation-formes-fermees-polygone`, `palette-evaluation-compacte`), **deux
  n'apparaissent ni dans le BACKLOG ni dans le RELAIS** : `aide-cp-suit-la-case-1086.spec.js` et
  `tampons-masques-bibliotheque-1216.spec.js` (vertes sur le Mac). À inscrire dans #1246 ou à part, à la décision de la session du
  Mac. Hors de ce lot.
