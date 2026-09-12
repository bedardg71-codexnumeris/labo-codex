# Où en est-on ?

> **Ce fichier répond à une seule question : qu'est-ce qui marche, et qu'est-ce
> qui ne marche pas encore, pour quelqu'un qui utilise l'application ?**
>
> Il est écrit **sans numéros de fiche** et sans vocabulaire de chantier. Les
> numéros (`#612`, `#674`…) sont des étiquettes d'archivage, pas une échelle de
> progression : ils servent aux sessions, pas à Grégoire. Quand il en faut un
> pour retrouver le détail, il est entre parenthèses, en fin de ligne.
>
> **À lire au début de toute session, Cowork ou Claude Code**, avant `CLAUDE.md`
> et `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, qui eux disent *comment*
> travailler. Celui-ci dit *où on en est*.
>
> **Mis à jour à la fin de chaque journée de travail.** Une ligne ne change
> d'état que si quelqu'un écrit **comment** il l'a vérifié.

🔶 **RELEASÉ EN 1.139.0, PAS ENCORE POUSSÉ (12 SEPTEMBRE 2026, 13 h — build `0912-1259` ; code `9ceca4ff` + correctif `6c8c91a9` de la relecture croisée de Cowork (13 h 10) ; Vitest 551 / 6 034 après le commit du bump ; reste : verdict Playwright Cowork fermé, push, porte) — SUIVI › INTERVENTIONS : « PLANIFIER » N'ÉCRIT PLUS RIEN AVANT « ENREGISTRER », LE BILAN LIT LES MÊMES SEUILS QUE LE RESTE DE L'APPLICATION, ET LA NOTE D'UN ÉLÈVE PARTI DU GROUPE RESTE, GRISÉE** (lot 5 du cadrage de l'onglet Suivi ; consigne de Cowork promue à 12 h 05 ; le chantier de l'orthopédagogie est clos).
**Ce que tu verras** : « Planifier une intervention » ouvre le formulaire sans rien inscrire dans tes données ; si tu changes d'onglet sans cliquer « Enregistrer », rien ne reste — comme avant à l'écran, mais sans que l'intervention ait existé entre-temps dans une sauvegarde. « Enregistrer » l'écrit, une fois. « Annuler » ne demande rien. Même chose pour « + Nouvelle rencontre ». Dans le bilan d'une intervention complétée, la lettre et le pourcentage s'accordent avec le reste de l'application : un 64,5 % est « D » ici comme dans la suggestion d'objectif (il était « I »). La note écrite pour un élève qui n'est plus dans le groupe reste visible, en gris, avec son nom — ou son DA s'il n'est plus au trimestre — suivi de « (n'est plus dans le groupe) » ; le nombre à côté de « Notes individuelles » compte les lignes affichées.
**Vérifié comment** : une sentinelle de 12 essais — Planifier sans écriture et Enregistrer en une seule écriture, dans les deux vues (Interventions et Rencontres), changer d'onglet, Annuler, un vieux brouillon resté en base ni affiché ni compté ni effacé, les lettres du bilan avec les seuils par défaut puis avec un seuil déplacé (le bilan et la suggestion bougent ensemble), la note d'un élève parti, y compris en anonymisation (ni son nom ni son DA) ; **treize fois cassée exprès, treize rouges**, fichier remis à l'identique (empreinte). Les bancs d'audit du 5 et du 6 septembre passés à leurs valeurs d'après. Vitest 551 fichiers / 6 032 essais.
**Relecture croisée de Cowork (13 h 10), corrigée avant la release** : un « Enregistrer » sur une intervention introuvable (après « Annuler », par exemple) annonçait « Intervention enregistrée » sans rien écrire — il dit maintenant « Intervention non trouvée. » et n'écrit rien (deux essais de plus, deux mutations, deux rouges).
**Pas vérifié** : ton navigateur et tes données (porte `plans de travail/PORTES-TERRAIN-2026-09-12-interventions.md`, à passer **avant lundi**, cinq cartes et une décision — le titre de l'entrée « Nouvelles », avec la proposition de Cowork). Aucun navigateur n'a tourné en session ; le verdict Playwright se prend avant le push.
⚠ **Ce que la mesure a corrigé de la consigne** : elle nommait un seuil `idme.etendu` qui n'existe pas — la fonction qui convertit un pourcentage en lettre existait déjà, le bilan la lit ; et deux fonctions de création et de présence que ce lot laissait sans appelant sont retirées avec le code mort. La porte perd la rangée du bilan (une machine y répond) et gagne celle des Rencontres.
**Laissé exprès** : `Labo › Données` compte encore un vieux brouillon s'il en reste un en base (cet écran lit le tableau brut ; aucun effacement d'office) ; la pré-coche des critères en défi n'a pas d'essai qui la casse.

✅ **FAIT EN 1.138.0, POUSSÉE (12 SEPTEMBRE 2026, 11 h 52 — `origin/main` = `61b5c883` ; release `a0ed0929`, build `0912-1116` ; code `e011ed64` (A-C) + `62f24316` (D), relus par Cowork à 11 h 08, + `e239787f` (E) ; Vitest 550 / 6 020 après le bump ; verdict Playwright local vert sur `61b5c883` à 11 h 51, Cowork fermé — 0 échec, 0 instable ; poussée par `git push` sur ta décision de 11 h 52. La relecture croisée du lot E par Cowork n'a pas été vue par Claude Code avant le push) — L'ACCUEIL PARLE AUX DEUX MÉTIERS, LE CHAMP 2 NE SE CONTREDIT PLUS, LES RENCONTRES NE DEMANDENT PLUS DE CIBLER DES CRITÈRES, SES PROCHAINS RENDEZ-VOUS S'AFFICHENT EN TÊTE, ET SUIVI N'A PLUS D'ONGLET « INTERVENTIONS » SUR UN SERVICE** (consigne du jour de Cowork, 10 h 25, révisée à 10 h 35, 10 h 50 et 11 h ; ta décision de 11 h 10 : les cinq d'un coup ; ta phrase de 7 h 35 : « Je veux que l'orthopédagogue sente qu'elle entre par la porte principale. »).
**Lot E, ce que tu verras** : sur un service, la barre de `Suivi` a six onglets — plus d'« Interventions », qui montrait la même liste que
« Rencontres » avec les mots de l'enseignement ; sur ton 601-101-MQ, les sept, dans le même ordre. La barre suit une bascule de contexte
faite **depuis Suivi**, sans te déplacer ; si tu étais sur « Interventions » en passant sur le service, tu arrives sur « Rencontres ».
**Vérifié comment** : une sentinelle de 11 essais qui charge les vrais fichiers de navigation, huit fois cassée exprès, huit rouges ; la
chaîne réelle rejouée dans WebKit sur le pack démo (7 → 6 → 7 → 6 onglets, l'onglet actif conservé ou remplacé par « Rencontres »,
zéro erreur) ; aucun écran ne change au harnais. ⚠ **Ce que la mesure a corrigé** : changer de contexte ne reconstruisait pas la barre
(la consigne le supposait) — c'est ce lot qui la fait suivre. **Laissé exprès** : sur un service, les boutons du profil qui mènent aux
interventions ouvrent encore la vue « Interventions » (sans onglet) ; les rediriger vers Rencontres empêchait leur formulaire de s'ouvrir.
Pas annoncé au changelog : rien ne change pour les enseignants.
**Lot D, ce que tu verras** : dans `Suivi › Rencontres`, sur un service, sous « + Nouvelle rencontre », le bloc **« Tes prochains rendez-vous »** —
au plus quatre rencontres à venir, la plus proche en premier (date, heure si notée, titre, individuelle ou en sous-groupe) ; la liste
dessous garde son ordre. Sans rencontre à venir : « Aucun rendez-vous à venir. Tes rencontres passées restent dans la liste ci-dessous. »
Sans aucune rencontre : pas de bloc (mon choix : la phrase serait fausse sous une liste vide). **Vérifié comment** : une sentinelle de 13
essais, dix fois cassée exprès, dix rouges ; le harnais du pack démo ne voit aucune différence de plus (listes hors service identiques).
⚠ **Ce que la mesure a corrigé** : le bloc devait se poser à l'ouverture de Rencontres ; il aurait disparu dès qu'on ouvre puis referme une
rencontre — il est donc refait avec la liste, à chaque fois.
**Ce que tu verras** : sur l'accueil, sous le bandeau « Bienvenue » et au-dessus des tâches, une carte blanche **« Tu es orthopédagogue ? »** —
« Décris ton service : son nom, la liste de tes étudiant·es et les dates de ton trimestre. » — et **« Commencer → »**, qui mène à Suivi ›
Rencontres par le même chemin que le sous-onglet. Les huit tâches sont toutes là. Dans le bandeau, **« Par où commencer ? »** répond en deux
branches (« Je suis enseignant·e — … », « Je suis orthopédagogue — Décris ton service dans Suivi › Rencontres : tes rencontres se tiennent
là. »), et les deux paragraphes que tu voulais retirer sont raccourcis (« Certains concepts sont nouveaux ? », « Ton courriel, une fois par
mois. »). Dans `Cadre › Groupe-cours`, le champ 2 dit **« Cours ou service »** sur un service comme sur ton 601-101-MQ (c'était la rangée 1
échouée de la porte d'hier : il disait « Service d’orthopédagogie » en listant tes cours). Sur un service, le formulaire d'une rencontre
n'a plus de bloc **« Critères ciblés / Objectif visé / Suggérer »**, et son bilan dit « Ce que tu retiens de la rencontre. » ; **sur ton
601-101-MQ, le formulaire d'une intervention ne change pas** — tes cinq critères y sont, « Suggérer » répond.
**Vérifié comment** : deux sentinelles (11 et 9 essais) — la carte au-dessus des huit tâches, son lien sur le chemin de la sous-navigation,
les mots arrêtés rendus dans l'ordre et écrits à un seul endroit, la carte conforme aux autres dans les deux modes ; le champ 2 identique
dans les deux contextes, son menu avec les deux natures ; la carte des critères absente sur un service (Rencontres et Interventions),
présente et inchangée hors service ; **une rencontre à « Structure » enregistrée sur un service garde « Structure » et son objectif**
(masquer la carte ne doit rien effacer ; l'objectif, la consigne ne le nommait pas : sans garde, il aurait été vidé). **Quinze fois
cassées exprès, quinze rouges** (une au second passage : au premier, c'est le script qui n'avait pas lu la sortie), code remis
(empreintes identiques). Le pack démo capturé AVANT (le code de 1.137.0) et rejoué APRÈS : 20 écrans, **8 identiques dont les deux
formulaires hors service**, les autres ne diffèrent que par les mots du lot et du bruit (heures de calcul, DA provisoires générés) —
**zéro valeur ne bouge**. Styles mesurés dans WebKit : la carte a le fond, le trait, le rayon et l'ombre d'une carte de tâche, dans les
deux modes ; captures regardées. Vitest 548 fichiers / 5 996 essais.
**Pas vérifié** : ton écran, Safari, l'iPad (porte `plans de travail/PORTES-TERRAIN-2026-09-12-accueil.md`, cinq rangées, deux décisions),
tes deux groupes.
⚠ **Ce que la mesure a corrigé de la consigne** : « Commencer → » mène aux trois questions **seulement sans trimestre** ; sur ton
601-101-MQ il mène à la carte « Créer un service d’orthopédagogie », sur un service à la liste des rencontres (porte, rangée 2).
**Ce qui attend ta décision** (porte § 3) : **deux autres libellés du Cadre ont le défaut du champ 2** — le menu de `Cadre › Cours` dit
« Sélectionner un service... » en listant tes cours, et la phrase des éléments obligatoires du groupe-cours dit l'horaire facultatif selon le
service **actif**, alors que l'application l'exige selon le cours **choisi** (#848) ; et le mot de l'option vide du champ 2, « — Choisir un
cours ou un service — », que j'ai tiré de ton « Cours ou service ».
**Laissé exprès** (hors service, rien ne change) : sans grille de référence, le formulaire d'une intervention envoie encore vers
« Conception › Grilles de critères » (le réglage vit dans Labo › Outils d'observation) ; sur un service, l'onglet Interventions garde le
sous-titre de bilan qui promet une comparaison ; les deux exemples gris « Structure / Rigueur » sont inscrits par Cowork (#847).

✅ **FAIT EN 1.137.0 (12 SEPTEMBRE 2026, 9 h 40 — release `5563b233`, build `0912-0935`, code `7b4beac2` relu par Cowork ; Vitest 546 / 5 976 après le bump ; poussée par `scripts/pousser.sh` après le verdict Playwright — voir RELAIS pour le SHA poussé) — LA SECTION COURS DU CADRE PARLE LES DEUX MÉTIERS, SANS SE CONTREDIRE** (consigne du jour de Cowork, 8 h 55 ; ta décision 3.4 de la porte des étiquettes et sa rangée 5 échouée).
**Ce que tu verras** : sur un service d'orthopédagogie, le premier choix du menu des profils dit **« Sélectionner un·e orthopédagogue »** — même après
que le menu s'est rafraîchi (c'était la rangée 5 : la reconstruction du menu réécrivait « — Sélectionner — » en dur par-dessus le bon mot) ; le
champ 5 du groupe-cours dit « — Choisir un·e orthopédagogue — », le champ 2 « — Choisir un service — ». L'accordéon des cours s'appelle
**« Cours et services »** (mot proposé, à corriger — porte § 3.1 ; tu avais dit « cours/service ») ; sur un service, il dit « Service : »,
« Sélectionner un service... », **« Modifier le service »**, « Dupliquer le service », le bandeau **« Mode modification — Service … »**, « Aucun
service sélectionné », et le fil d'Ariane dit « Service » ; dès que le menu Nature bascule, le titre du formulaire suit (« Nouveau service »).
Dans l'accordéon Groupe-cours, la phrase qui te contredisait dit maintenant, sur un service, **« renseigne les 4 éléments obligatoires :
trimestre, service d’orthopédagogie, numéro de groupe et orthopédagogue. L’horaire et la pratique de notation sont facultatifs. »** — et ses
trois échos (état vide, liste, formulaire) disent 4 éléments et « L'horaire des séances (facultatif) ». L'infobulle du groupe-cours nomme
« ton cours ou ton service d’orthopédagogie ». **Sur ton 601-101-MQ, tout redit cours et enseignant·e, aux mots d'avant** — sauf deux :
le titre « Cours et services », et « Sélectionner un enseignant·e » à la place de « — Sélectionner — » dans le menu des profils (le mot que
le point unique portait déjà). ⚠ **Laissé exprès** : « + Nouveau cours » et « … ou crée un nouveau cours » — les faire suivre ouvrirait un
formulaire dont le menu Nature dit « Enseignement » ; faire suivre ce défaut est un comportement, pas un mot : **ta décision** (porte § 3.2, #843).
**Vérifié comment** : une sentinelle de 17 essais (les trois reconstructions de menus lisent le point unique au moment de construire, dans les
deux ordres « le dernier qui écrit » ; verrou structurel étendu : aucune option vide nommant une personne en dur dans `js/` ni `index.html` ; la
phrase des éléments obligatoires dans les deux sens ; **les mots de 1.136.0 hors service figés** ; le titre et le bandeau suivent la fiche, la
synthèse et le menu suivent le contexte ; la valeur en base reste `'service'` après Modifier + Enregistrer), **onze fois cassée exprès, onze
rouges**, code remis (empreintes identiques). Le pack démo capturé AVANT et rejoué APRÈS : 411 feuilles (valeurs de `cours`, `groupesCours`,
`groupeEtudiants`, `infoCours`, `groupeCoursActif` ; textes du Cadre dans huit états du formulaire, Suivi du groupe, Liste, un profil — sur
le groupe-cours démo, sur un service créé par les trois questions, au retour) : **zéro valeur ne bouge** (identifiants générés, dates, DA
provisoires), **Suivi identique hors service**, seules les feuilles de texte du Cadre diffèrent, sur les mots du lot. Vitest 546 fichiers /
5 976 essais. ⚠ **Ce que la mesure a corrigé de la consigne** : la fonction de l'orchestre qui posait déjà le bon mot au menu des profils
**n'avait aucun appelant** (retirée) ; le champ 5 du groupe-cours est peuplé ailleurs (`trimestre-v2.js`), avec un troisième libellé ; la
liste des sites manquait le fil d'Ariane, « Cours : », « — Choisir un cours — » et trois « 5 éléments obligatoires ». **B3 tranché** : la
sentinelle #306 protège la mécanique Créer/Enregistrer du bouton, les titres n'étaient que son ancre — ancre déplacée, break-test rouge.
**Pas vérifié** : ton écran (porte `plans de travail/PORTES-TERRAIN-2026-09-12-section-cours.md`, cinq rangées, trois décisions), Safari,
tes deux groupes. Décisions 3.2 et 3.3 de la porte des étiquettes : « tel quel » (données au relevé, inscrites) ; « Sélectionner un enseignant·e »
hors service confirmé par toi à 9 h 40.

✅ **FAIT EN 1.136.0 (12 SEPTEMBRE 2026, 8 h 25 — release `2c84a34a`, POUSSÉE, `main` = `origin/main` ; relecture croisée de Cowork passée sur `fa27b531`, Playwright vert, Vitest 545 / 5 959) — LES ÉTIQUETTES : L'ORTHOPÉDAGOGUE ENTRE PAR LE CADRE, COMME TOUT LE MONDE** (consigne du jour de Cowork, 7 h 40 ; code `fa27b531`).
**Ce que tu verras** : dans `Cadre › Cours`, le menu **Nature** dit **« Enseignement »** ou **« Orthopédagogie »** (à la place de « Cours » /
« Service ») — tes champs, tes fiches, tes données sont intacts ; en base, la nature vaut toujours `'cours'` ou `'service'`, aucune
migration. Le mot vit à **un seul endroit** (`js/mots-nature.js`) : le jour où d'autres services existent, il se change là, et nulle part
ailleurs. Quand le contexte actif est un service d'orthopédagogie, le Cadre dit **« Orthopédagogue »** partout où il disait
« Enseignant·e » (fil d'Ariane, accordéon, « Profil orthopédagogue », « 2. Service d’orthopédagogie », « 5. Orthopédagogue », la carte du
groupe-cours « Service » / « Ortho. ») ; sur un cours, tout redit enseignant·e. Dans Suivi, le titre de la section dit **« Rencontres
(ortho.) »**, les trois questions créent « ton service d’orthopédagogie », le bouton dit « Créer mon service d’orthopédagogie », la
notification « Service d’orthopédagogie créé … Tes rencontres d'orthopédagogie se tiennent ici », et sur ton 601-101-MQ la carte nomme
l'orthopédagogie directement (texte proposé, à corriger : porte § 3.2). ⚠ **Le libellé de l'ONGLET « Rencontres » n'a pas changé** : il vit
dans `js/config.js`, zone protégée que ta consigne interdisait d'ouvrir — une ligne, sur ton autorisation (porte § 3.1).
**Vérifié comment** : une sentinelle de 13 essais (le point unique et un **verrou structurel** — aucun module de `js/` n'écrit plus
« Service » / « Enseignement » / « Orthopédagogie » en dur, les options d'index.html sont vides et libellées par le code, les mots par
défaut d'index.html sont ceux du point unique ; **l'aller-retour complet du formulaire** — créer un service, le sélectionner, Modifier,
Enregistrer, relire — laisse `'service'` en base ; le libellé de la personne dans les deux sens ; la carte du groupe-cours ; Rencontres ;
les deux infobulles), **huit fois cassée exprès, huit rouges**, code remis (empreintes identiques). Le pack démo capturé AVANT et rejoué
APRÈS : 54 feuilles (valeurs de `cours`, `groupesCours`, `groupeEtudiants`, `infoCours`, `groupeCoursActif` ; textes du Cadre, de cinq
sous-onglets de Suivi et de cinq profils, sur le groupe-cours démo, sur un service créé par les trois questions, et au retour) —
**zéro valeur ne bouge** (seules différences : deux identifiants générés et un DA provisoire), 9 feuilles de texte diffèrent, toutes sur
les mots du lot. Vitest 545 fichiers / 5 959 essais après le commit. ⚠ **Ce que la mesure a corrigé de la consigne** : sa liste des
sites était incomplète — `js/cours.js` (la bibliothèque des cours, deux cartes) écrivait aussi « - Service » ; le verrou l'a attrapé au
premier passage. **Laissé exprès** (perfectible, pas faux : un service EST un cours dans le Cadre) : « Modifier le cours », « Dupliquer le
cours », le bandeau « Mode modification — Cours », l'infobulle du groupe-cours, « 5 éléments obligatoires … horaire » (porte § 3.4).
**Pas vérifié** : ton écran (porte `plans de travail/PORTES-TERRAIN-2026-09-12-etiquettes.md`, dix rangées), Safari, tes deux groupes.

✅ **FAIT EN 1.135.1 (12 SEPTEMBRE 2026, 6 h 35 — release `473f3d75`, poussée, `main` = `origin/main` mesuré au rituel de 7 h 45 ; relecture croisée de Cowork passée vers 7 h) — DANS UN SERVICE, UN ÉLÈVE APPARTIENT PAR SON SERVICE, PAS PAR UN NUMÉRO DE GROUPE** (consigne du jour de Cowork, lots A et B ; commit `06868a06`).
**Ce que tu verras** : dans un service, `Suivi › Liste des étudiant·es` montre **tous** les élèves saisis, y compris ceux dont la
ligne collée d'Omnivox portait le numéro de groupe du collège (ta rangée 9 de ce matin : trois saisis, deux affichés) — corrigé à la
lecture, **rien n'est réécrit chez toi**, l'élève réapparaît (la colonne « Groupe » de sa fiche garde son « 00007 » ; une fiche créée
après ce correctif porte « 00001 », le seul groupe d'un service). Et si tu colles plusieurs élèves sur une seule ligne, elle est
**refusée et nommée** (« Une ligne n'a pas pu être lue — Ligne 1 (« … ») : ne commence pas par un numéro de DA. Une ligne par
élève… ») au lieu de fabriquer un élève fantôme : le service se crée avec les lignes valides, ou pas du tout. Sur tes deux groupes
réels : rien ne bouge.
**Vérifié comment** : une sentinelle de 13 essais (service à groupes hétérogènes rendu 3/3 par les deux sites ; groupe-cours ordinaire à
deux groupes et mode cours aux valeurs de 1.135.0 figées ; service et cours étanches ; groupe écrit ; refus nommé), huit fois cassée
exprès, sept rouges — la huitième (0 rouge) est une doublure d'écriture demandée par la consigne, nommée dans le journal ; une garde
« sans coursId » posée en plus dans le goulot rendait 0 rouge : inatteignable, retirée. Le harnais du pack démo rebâti (jetable) :
90 feuilles hors service AVANT/APRÈS, **0 différence** ; dans le service, 2/3 → 3/3 et les groupes écrits « 00001 ». Vitest 544 fichiers
/ 5 945 essais après le commit. ⚠ **Ce que la mesure a corrigé de la consigne** : le défaut n'était PAS dans `obtenirDonneesSelonMode`
(il ne compare le groupe qu'aux fiches sans coursId ; le harnais rendait 3/3 par ce chemin) — seulement dans le goulot
`obtenirEtudiantsCoursActif`. **Pas vérifié** : ton écran (porte, rangées 13 et 14), le mot du refus (porte § 3), Safari.

✅ **FAIT EN 1.135.0 (11 SEPTEMBRE 2026, 21 H 50) — « RENCONTRES » : UN SERVICE EST UN COURS, UN GROUPE-COURS SANS HORAIRE, LE SOUS-ONGLET SUIVI › RENCONTRES, UNE INTERVENTION QUI SAIT OÙ ELLE EST NÉE** (lots 1 et 2 du cadrage « l'orthopédagogue entre par Suivi »). ⚠ **Mesuré à la reprise : les quatre commits de code étaient DÉJÀ sur `origin/main` depuis 21 h 36** (reflog « update by push »), donc en ligne sous `1.134.0` sans changelog, contrairement à ce que disaient les trois relais (« non poussés exprès ») — la release 1.135.0 répare ce trou et emporte les **deux reprises de la relecture croisée de Cowork** : (1) une intervention née en mode cours (tous les groupes) est vue depuis chaque groupe de ce cours, et l'inverse — sans ça, changer de mode la faisait disparaître ; (2) **tranché par toi : « Rencontres » ne liste que les services** — sur un groupe-cours ordinaire, plus de liste à deux vocabulaires, seulement la porte « Créer un service » et, s'il existe déjà un service dans le trimestre, le lien pour l'activer ; « Interventions » ne change pas ; la fusion se rejuge après le mois d'usage.
**Ce que tu verras** : dans `Suivi`, un sous-onglet **« Rencontres »** entre « Interventions » et « Animation ». Sur un poste sans
trimestre (celui de l'orthopédagogue lundi), il pose **trois questions** sur un seul écran — les dates du trimestre, le nom du
service, la liste des élèves tapée (« Prénom Nom », « DA ; Nom ; Prénom ») ou collée d'Omnivox — et « Créer mon service » crée ce que
le magasin exige et rien d'autre : un trimestre, un **cours de nature « Service »** (sans code, sans discipline, sans compétence),
ses élèves, un **groupe-cours sans horaire** ; Cadre montre le tout tel quel, l'en-tête bascule dessus, Suivi › Liste montre ses
élèves. Ensuite « Rencontres » liste ses rencontres et en crée (« + Nouvelle rencontre », individuelle par défaut ou en sous-groupe,
date, heure, participants cochés, note par élève, bilan) — c'est l'intervention, même module, avec le vocabulaire « rencontre » ;
sur un service, ni « contexte de l'intervention » ni « séance concernée » (ils supposent une séance de groupe). Sur TES deux
groupes-cours, « Rencontres » ne montre AUCUNE liste (tranché le 11 au soir) : une carte qui dit que les rencontres se tiennent dans un
service et que tes interventions sont sous « Interventions », le lien vers un service du trimestre s'il en existe un, et la ligne « Tu
reçois des élèves hors d'un groupe-cours ? Créer un service ». Dans `Cadre › Cours`, un choix **« Nature : Cours / Service »** en tête du
formulaire (sur Cours, tout est comme avant). Pour tous : une intervention **sait désormais dans quel groupe-cours elle est née** et
la liste d'un groupe-cours ne mêle plus celles d'un autre ; tes interventions d'avant restent visibles partout et prennent leur
contexte au prochain Enregistrer de chacune (jamais réécrites en masse). Un élève de service sans séance garde A = 100 % et « En
attente » — c'est le comportement de tout groupe sans séance, laissé exprès (« tout est manuel pour un mois »), inscrit (#836).
**Vérifié comment** : le pack démo capturé AVANT le premier commit et rejoué APRÈS le dernier — 1 284 feuilles (Cadre, Suivi du
groupe et ses deux graphiques, Liste, Présences, 20 profils avec indices et palier, Interventions, export) : **0 différence de
valeur**, seules les chaînes statiques ajoutées diffèrent ; un service sans horaire créé dans le trimestre démo et 13 écrans + 6
sections du profil visités sans exception ; le parcours des trois questions joué dans WebKit sur un poste vide (trimestre a2026
créé, 117 jours de calendrier, service, 4 élèves dont deux à DA provisoire, groupe-cours sans horaire actif, une rencontre créée et
relue, 0 erreur) et en démo ; quatre sentinelles (40 essais : le service se crée sans code et un cours sans code est toujours
refusé, le groupe-cours de service sans horaire et l'ordinaire toujours refusé, aucune séance servie par repli, la liste du service
par le goulot commun, le point unique sur grille et verrou « plus aucune recopie », l'estampille et le filtre des interventions, la
lecture des quatre formes de ligne, la création sur poste vide et le refus sans nom / sans élève / sans dates, le marqueur démo),
vingt-quatre fois cassées exprès, vingt-quatre rouges, remises (empreintes identiques) ; les bancs du 5 et du 6 disent l'après
(E1) ; Vitest 543 fichiers / 5 928 essais. **Les deux reprises** (commit `ea90c376`) : sentinelle des traversées de mode (un cours à deux
groupes et un autre cours : née en mode cours → vue depuis un groupe ; née dans un groupe → vue en mode cours, jamais celle de l'autre
cours ; depuis un groupe, celle de l'autre groupe reste cachée) et sentinelle de la porte (aucune liste ni vocabulaire sur un cours
ordinaire ; le service d'un autre trimestre n'est pas offert ; l'activation mène à la liste) — 5 essais neufs, six fois cassés exprès,
six rouges, remis à empreinte identique ; Vitest 543 fichiers / 5 932 essais avant et après le commit de release `538fbb92` ; le verdict
Playwright local rendu sur ce SHA par `scripts/verifier-playwright.mjs`, puis `scripts/pousser.sh` (si tu lis ceci sur `origin/main`, le
push a eu lieu). **Corrigé en chemin** : `cours` est une clé globale — un service créé en démo restait dans
ta vraie liste de cours ; il est maintenant marqué et retiré quand tu quittes la démo. **Pas vérifié** : ton écran, tes deux groupes
réels, Safari, l'orthopédagogue sur son poste lundi ; **la formule « taux de repérage » (§ G) n'est pas livrée** — le registre ne
permet pas de renommer les libellés des saisies, un modèle avec « nombre de mots » sous « erreurs au total » serait un piège (#835).
**Zones protégées** : `js/config.js` et `js/navigation.js` touchés (sous-onglet, correspondance, initialisateur) avec ton
autorisation du 11 au soir. Porte terrain : `plans de travail/PORTES-TERRAIN-2026-09-12-rencontres.md` (treize rangées — la 11b vérifie la porte et
l'activation d'un service existant —, douze mots proposés dont un neuf pour la carte de la porte — silence = tel quel).

↻ **1.134.0 — PROFIL D'UN ÉLÈVE : UN SEUL RENDU À L'OUVERTURE ; LES GRAPHIQUES LISENT L'ÉCHELLE DE CHAQUE ÉVALUATION ; LE VOLET CONFIDENTIEL SUIT LA LISTE** (lot 4 du cadrage 11, build à lire en bas de page).
**Ce que tu verras** : dans `Suivi › Profils individuels`, le profil s'ouvre une fois — le 6, il se dessinait quatre
fois, et trois mots tapés dans la zone de texte du rapport disparaissaient à 100 ms. Dans Performance › Critères, les
courbes lisent l'échelle de CHAQUE évaluation (la tienne donne exactement les mêmes courbes qu'avant ; une échelle A/B/C
d'un collègue trace ses paliers au lieu d'une courbe trouée ; un critère en points trace sa fraction). Une valeur qui ne se
convertit pas n'est pas devinée : le point est absent et une ligne sous la légende dit « n évaluations sans valeur
convertible dans cette échelle » ; si tes évaluations désignent plusieurs échelles, la ligne dit laquelle donne les zones
(en démo, deux échelles coexistent : la ligne s'affiche, c'est voulu). Les cases « Inclure… » du rapport se mémorisent
quand tu les coches, par trimestre. Volet confidentiel : la case « Services adaptés » reflète `sa` de la liste des
étudiant·es (cochée ou non, non modifiable, « (d'après la liste des étudiant·es) ») ; Catégorie et Sous-catégorie ne
s'affichent que pour un « Oui » ; le « Portrait de lecteur » est parti (tes mots : « peuvent disparaître complètement » —
aucune purge : les valeurs tombent au prochain Enregistrer de ce volet). Accompagnement : « + Nouvelle intervention » à
droite du titre HISTORIQUE, la carte dessous (une classe CSS jamais définie). Trois gestes exportés sans bouton et le
panneau d'indice sans conteneur sont retirés ; l'export anonymisé de trimestre écrit enfin `services_adaptes` d'après la
liste (il écrivait toujours faux).
**Vérifié comment** : sonde Playwright #754 dans le vrai `index.html` — un rendu par quatre chemins (Liste, sélecteur,
Suivi du groupe, onglet Profil), rouge avant (4 rendus, texte effacé), vert après ; deux chemins de plus mesurés depuis
Évaluations (1 rendu). Non-régression des graphiques : les courbes des 20 profils du pack démo (945 points) et les
105 courbes de trajectoires capturées AVANT le correctif, identiques APRÈS. Sentinelle de onze essais sur les modules
réels (échelle A/B/C sans trou, 3 sur 30 → 10, niveau sans valeur → absent et compté, ton échelle → mêmes valeurs,
zones majoritaires, rapport au geste, case SA, portrait parti, gestes partis, rangée HISTORIQUE), quatre fois cassée
exprès, quatre rouges, remise (empreintes identiques) ; les bancs du 5 et du 6 (H1, G5, P-1, P-2, P-5) disent l'après ;
la rangée HISTORIQUE mesurée sous WebKit à 1024 et 1366 (même ligne, bouton à droite, carte dessous). Vitest 539 fichiers
/ 5890 essais. **Pas vérifié** : ton écran, tes deux groupes réels, TES courbes (la rangée 3 de la porte est la seule
vraie preuve de non-régression sur tes échelles), Safari — porte terrain de huit rangées
(`plans de travail/PORTES-TERRAIN-2026-09-11-profils-individuels.md`). **Pas touché** : `js/navigation.js` (zone protégée) —
aucun chemin n'a eu besoin d'y toucher.

↻ **1.133.0 — SAISIE DES PRÉSENCES : UNE DATE VERROUILLÉE NE L'EST QUE POUR CE GROUPE-COURS ET CE TRIMESTRE ; LA DÉMONSTRATION N'ANNONCE PLUS UNE CONFIGURATION INCOMPLÈTE** (lot 3 du cadrage 11, build à lire en bas de page).
**Ce que tu verras** : dans `Suivi › Saisie des présences`, verrouiller une date (le cadenas) ne vaut plus que pour
le groupe-cours et le trimestre où tu le fais — jusqu'ici, le 8 septembre verrouillé dans un groupe l'était dans
l'autre, et le serait resté l'an prochain. Les dates que tu avais verrouillées avant restent verrouillées dans
chacun de tes groupes (elles l'étaient partout ; rien n'est changé au passé, l'ancienne liste reste en place). La
date, le sous-groupe, le tri et la recherche de l'écran appartiennent maintenant au trimestre : la démonstration ne
te prend plus ta date, et te la rend au retour. La démonstration elle-même ouvre `Saisie des présences` sans le
bandeau « Configuration incomplète », sur la dernière séance passée, avec ses vingt élèves — le 6, elle ouvrait sur
le bandeau, une date vide et « (0 étudiant·e) ». « ← Précédent » sans date va à la dernière séance passée.
Invisible mais posé : sans cours actif, l'enregistrement n'écrit plus rien (il remplaçait la fiche d'un autre cours).
**Vérifié comment** : sentinelle de douze essais sur le module réel, dix fois cassée exprès (dix rouges) et remise ;
les trois bancs du 6 qui affirmaient l'avant (S-3, S-4, S-6, et le banc du cadenas #785) disent l'après ; un essai
Playwright active la démo dans le vrai `index.html`, ouvre la saisie et lit : aucun bandeau, une date posée, vingt
élèves — cassé exprès (l'appel retiré), rouge, remis. La relecture croisée a fait reprendre deux points : le
semis n'entre pas dans la démonstration (tes dates verrouillées y seraient restées, pour toujours), et le champ
Recherche est remis lui aussi ; quatre essais de plus, quatre fois cassés. **Pas vérifié** : ton écran, tes deux groupes réels, Safari,
l'adresse en ligne — porte terrain de cinq rangées (`plans de travail/PORTES-TERRAIN-2026-09-11-saisie-des-presences.md`),
dont la première écrit chez toi (le verrou et la grille qu'il sauvegarde ; déverrouiller remet tout comme avant).

↻ **1.132.0 — LISTE DES ÉTUDIANT·ES : LES ABANDONS RESTENT VISIBLES, GRISÉS ; LES TRIS TRIENT ; LA RECHERCHE IGNORE LES ACCENTS** (lot 2 du cadrage 11, build à lire en bas de page).
**Ce que tu verras** : dans `Suivi › Liste des étudiant·es`, un élève en abandon, inactif ou en décrochage
reste dans le tableau, en gris, avec son statut entre parenthèses après son nom — ta décision de 14 h 17.
La note sous le tableau le promettait déjà ; le tableau le retirait. Les moyennes et les corrélations
n'ont pas bougé : elles comptent les actifs, comme avant. Le clic sur « # » renverse l'ordre, le tri par DA
est numérique, « aime » trouve Aimé, la liste se rafraîchit quand tu cesses d'écrire. Le filtre des profils
offre les six profils que l'application calcule. « ≥ Min. » tient après un tri, et un élève sans aucune
évaluation compte comme sous le minimum. Dans `Cadre › Trimestre`, un DA déjà présent est refusé à l'ajout
(le message nomme l'élève existant) et ignoré à l'import ; le numéro de groupe s'écrit sur cinq chiffres.
Le bouton d'aide du titre ne disparaît plus au premier rendu.
**Vérifié comment** : sentinelle de quatorze essais sur les modules réels, dont le piège du lot (un abandon
rendu, `moy=` identique avec et sans lui), six fois cassée exprès et remise ; les bancs d'audit du 6 disent
l'après. **Pas vérifié** : ton écran, tes groupes réels, et un abandon réel (le pack de démonstration n'en
porte aucun) — porte terrain de sept rangées (`plans de travail/PORTES-TERRAIN-2026-09-11-liste-des-etudiants.md`).
Les deux textes de Cadre › Trimestre sont ceux de Cowork, posés tels quels sauf ton mot.

↻ **TES ÉVALUATIONS D'HIVER 2026 RETROUVENT LEURS GRILLES (données, 11 sept. ~15 h 20 — aucun code d'application)**.
**Ce que tu verras** : dans `Évaluation › Annoter et évaluer`, une évaluation d'Hiver 2026 s'ouvre avec sa
grille et son échelle dans la palette Paramètres ; la bannière « Grille d'origine introuvable » a disparu.
Ton rapport de 14 h 50 : les 408 évaluations citaient trois grilles absentes de l'instance en ligne.
C'était l'île non réparée : la réparation du 5 août vivait dans l'autre navigateur, et l'instance en
ligne a reçu la copie d'avant. Tu as recréé les trois grilles sous leurs identifiants d'origine, depuis
leurs jumelles « H26 », prouvées par leurs critères (223 sur 225, 92 sur 94, 89 sur 89 ; les quatre
mal estampillées de juin sont nommées, pas touchées). Huit cartouches recopiées, rien d'écrasé. Puis, à 15 h 45, **l'échelle** : 44 de ces évaluations (celles de
février) citaient une échelle de démonstration disparue ; tu l'as recréée sous son identifiant, copie de
« IDME et niv 0 » — ton hypothèse (la tienne descend de celle-là) confirmée par les notes : 43 sur 44 se
recalculent à l'identique.
**Vérifié comment** : dry-run relu par toi, exécution journalisée, outil éprouvé au banc (cassé deux
fois, remis). **Pas vérifié** : ton écran après Cmd+R — une évaluation H26 ouverte, puis un second
rechargement pour la durabilité. À noter : les jumelles restent, deux grilles de même nom dans le
menu d'Hiver 2026 ; les retirer est un autre geste, à ta décision.

↻ **1.131.1 — LA BARRE « ASSIDUITÉ (A) » DE TES GROUPES D'HIVER 2026 REVIENT** (build à lire en bas de page).
**Ce que tu verras** : dans `Suivi › Suivi du groupe`, sous un groupe d'Hiver 2026, la barre A porte de
nouveau ses points et sa moyenne, comme C et P. Ton rapport de 14 h 17 : la barre était vide pour tous
tes groupes H26. Depuis la fin août, le nombre de périodes d'une séance se lit dans l'horaire, séance
par séance, et ne se déduit plus des heures ; tes trois horaires de janvier ne le portaient pas, donc
zéro période offerte, zéro séance comptée, rien à l'écran et rien pour le dire. Mais chacun de ces
horaires porte le format que tu avais déclaré (« 2 périodes par séance ») : une séance qui n'a pas son
nombre reprend maintenant celui de son horaire, à la lecture. Rien n'est réécrit dans tes horaires ni
tes présences ; le cache des séances se refait tout seul à l'ouverture.
**Vérifié comment** : six sondes en lecture seule sur tes données, collées par toi dans la console,
jusqu'à la ligne qui disait 0 ; le cas rejoué au banc avec un horaire d'avant (format 2, séances sans
nombre), horaire.js et saisie-presences.js réels : 2 périodes, plus 0 ; cassé exprès, rouge, remis.
**Vérifié par toi** vers 14 h 50 sur `1.131.1` déployée : « ça marche » — la barre A de ton groupe H26 a
retrouvé ses points. Inscrit pour la suite : la barre doit dire pourquoi elle est vide
quand ça arrive (#830), au lieu de se taire.

↻ **1.131.0 — SUIVI DU GROUPE : TES ÉLÈVES SUIVIS SONT GARDÉS PAR GROUPE-COURS, CHANGER DE GROUPE NE LES EFFACE PLUS** (build à lire en bas de page).
**Ce que tu verras** : dans `Suivi › Suivi du groupe`, les élèves que tu suis (au plus cinq, les pilules
colorées) appartiennent maintenant au groupe-cours où tu les as choisis. Ouvrir « Détails » sous ton
deuxième groupe ne vide plus la liste du premier — jusqu'ici, c'était le cas, en base, sans un mot.
Ta liste actuelle, si tu en as une, est reprise telle quelle dans le groupe où sont ces élèves ; la
valeur d'avant reste en place. Un sixième clic sur un nom te dit pourquoi il refuse (cinq au maximum).
Un élève passé en abandon libère son siège. Le filtre « P < 65 % » ne retient plus un élève dont le P
s'affiche « — ». Le bandeau « Étudiant·es prioritaires » (qui ne s'ouvrait jamais) est parti ; en mode
Détails, une ligne dit où cliquer pour ouvrir un profil. En démonstration, la famille « Défi
spécifique » n'est plus à zéro et la console ne se remplit plus d'avertissements.
**Vérifié comment** : le cas réel de l'audit du 6 (deux élèves suivis sous A, « Détails » ouvert sous
B, retour sous A) rejoué au banc : les deux élèves survivent, rien n'est écrit sous B ; vingt essais,
cinq fois cassés exprès et remis. Les bancs d'audit du 5 et du 6 disent maintenant l'après. Les trois mots
tranchés par toi à 13 h (le refus du sixième tel quel ; « … d'un élève. » ; rien à écrire pour la
pratique absente, dont le texte n'avait pas de site). **Pas vérifié** : tes deux groupes réels et ton
iPad — porte terrain de cinq rangées (`plans de travail/PORTES-TERRAIN-2026-09-11-suivi-du-groupe.md`).

↻ **1.130.2 — L'APPLICATION NE REDEMANDE PLUS 300 FICHIERS À CHAQUE OUVERTURE ; LA CAUSE DES 30-45 S N'EST PAS ÉTABLIE** (build `0911-1139`).
**Ce que tu verras** : rien de nouveau à l'écran. Le serveur disait au navigateur, pour chacun des deux
cents scripts, « redemande-moi à chaque ouverture » même quand rien n'avait bougé. Il dit maintenant
« garde-le un an » — et c'est sûr, parce que chaque script change d'adresse dès que son contenu change
(les jetons `?v=` que la release pose), et que la page d'entrée, elle, est toujours redemandée.
⚠ **Mais ce n'est pas ce qui te coûtait 30 à 45 secondes.** Ta mesure de 11 h 58, sur la version
d'avant, dans un nouvel onglet : **527 ms**, 302 fichiers redemandés. Trois cents allers-retours coûtent
une demi-seconde, pas quarante. Les 34 à 51 s des captures du matin étaient des rechargements forcés,
pas des ouvertures. Le lot reste livré (moins de requêtes, sain), mais il ne règle pas ce que tu as
vécu, et les deux suites prévues (charger les scripts en parallèle, un écran d'attente) sont retirées :
elles répondaient à une cause qui n'est pas la bonne.
**Ce qui reste dû** : saisir la cause **au moment où ça se reproduit** — Chrome, Network, et la barre la
plus longue de la cascade (une requête ? le démarrage de l'application ? la base locale ?). Une capture
de cette barre dans un rapport de bug suffit ; sans reproduction, rien à coder.
**Vérifié comment** : trois fichiers qui échappaient aux jetons (un script sans jeton, le pack de
démonstration et le décodeur HEIC chargés à la demande) en ont reçu un ; une sentinelle refuse toute
référence sans jeton et refuse qu'`index.html` devienne immuable, break-testée cinq fois (rouge, remis).
Une relecture à froid a retenu que la feuille de style principale doit rester redemandée (la page de
référence d'interface la charge sans jeton) : une requête sur trois cents, gardée. **Pas vérifié** : que
l'en-tête arrive jusqu'à ton Chrome derrière Cloudflare, et que l'iPad dit bien `1.130.2` après le
déploiement — deux rangées de la porte (`plans de travail/PORTES-TERRAIN-2026-09-11-ouverture-immuable.md`).

↻ **1.130.1 — DEPUIS LE SUIVI, UN LIEN MÈNE AUX RÉGLAGES ; ET L'ÉCRAN DE RÉGLAGE EST CLOS** (build `0911-1103`).
**Ce que tu verras** : en tête de `Suivi › Suivi du groupe` et sous le titre de la carte RàI d'un
profil, un petit bouton-lien **« Régler les outils d'observation »** ouvre `Labo › Outils
d'observation`. C'est ta décision de 10 h 48 : l'écran reste dans Labo (quatre de ses réglages
agissent hors de Suivi), et Suivi y mène là où tu constates un effet. Rien d'autre ne change à l'écran.
**Ce qui a été retiré sans que rien ne bouge** : cinq chemins de code sous les seuils du dépistage,
inscrits hier, remesurés un par un aujourd'hui (930 lignes) — aucun n'atteignait un écran. Gardé, parce
que la leçon du 10 dit qu'un « mort » sur quatre est vivant : `identifierDefiSpecifique` (trois bancs
l'exécutent), les `detecterDefis` et `identifierPattern` des pratiques.
⚠ **Un constat qui te concerne** : le titre « Diagnostic par critère (seuil force : N %) », que la
porte 2.3b de ce matin te demandait de lire, **n'a jamais été affiché** — il n'était produit que par
une de ces chaînes mortes. Le seuil de défi agit bel et bien (couleur des badges « Forces et défis »,
défi principal de la carte RàI), et sa conversion est prouvée par cinq essais ; mais ce que tu as vu à
2.3b n'a pas pu être ce titre. La porte du matin porte la note.
**Vérifié comment** : chaque appelant remesuré dans le code, l'HTML et les tests, y compris sous forme
de chaîne ; une sentinelle neuve (#824) verrouille l'absence des cinq et la présence des gardés, et
rougit quand on réintroduit un nom ou qu'on retire la fonction gardée ; le lien du Suivi du groupe
cliqué sous WebKit dans les deux modes : arrivée sur l'écran, zéro erreur. **Pas vérifié** : le clic
sur le lien de la carte RàI (il faut un élève avec données) — une porte, deux rangées
(`plans de travail/PORTES-TERRAIN-2026-09-11-liens-depuis-suivi.md`), l'artefact revient à Cowork. Les
mots du lien attendent ton verdict (§ 3 de la porte).

↻ **1.130.0 — « OUTILS D'OBSERVATION » SE LIT SANS RIEN DÉPLIER** (build `0911-1022`).
**Ce que tu verras** : dans `Labo › Outils d'observation`, la forme que tu as validée sur maquette à
10 h 05. Les deux sections repliables et les trois cartes-accordéon sont devenues des blocs ouverts ;
un sommaire « Sur cette page » en tête mène à chaque carte ; les options vont deux par rangée ; chaque
réglage porte de petites étiquettes qui disent l'écran où son effet se voit (ambre = hors de Suivi) ;
les trois curseurs sont devenus des champs chiffrés avec leur unité, comme les seuils Fragile /
Acceptable / Bon ; les deux « Remettre les valeurs par défaut » disent lesquelles. **Tes valeurs sont
les mêmes, à la même place** : rien n'est écrit chez toi ni chez les testeurs.
**Ce que j'ai décidé seul, et que tu peux renverser en dix secondes** : j'ai gardé les textes d'aide
et les libellés de 1.129.2 là où la maquette les abrégeait (la consigne le demandait) ; j'ai écrit la
plage permise sous chaque champ chiffré (les bornes des curseurs disparaissaient avec eux) ; deux
étiquettes de la maquette ont été corrigées contre la carte des effets (la collecte ACP n'agit que dans
le profil ; les graphiques agissent aussi sur « Gestes cognitifs »), trois ajoutées (export recherche
pour les actions et la grille, Interventions pour le seuil de défi), une retirée (l'export recherche
que la maquette prêtait au RàI).
**Vérifié comment** : cinq essais qui EXÉCUTENT le panneau prouvent qu'un « 60 » tapé s'écrit 0,60 pour
les calculs, que 0,65 stocké s'affiche « 65 », que « Remettre » remet 3 · 10 · 5 · 70 sans toucher
70 · 80 · 85, et qu'aucun curseur ni repliable ne survit ; sans la division à l'écriture, deux cas
rougissent ; sans la multiplication à la lecture, un cas rougit ; fichier restauré par empreinte.
Rendu capturé sous WebKit à 1280 et 820 px, modes sombre et clair : zéro débordement, zéro erreur.
Vitest complet vert. **Pas vérifié** : Safari et l'iPad — quatre portes
(`plans de travail/PORTES-TERRAIN-2026-09-11-forme-outils-observation.md`), l'artefact revient à Cowork.

↻ **1.129.2 — L'ÉCHELLE DE DÉPART DIT LES QUATRE MOTS À LA SOURCE, ET LE BILAN AUSSI** (build `0911-0717`).
**Ce que tu verras : rien chez toi, rien chez les testeurs.** Ton échelle est du stock, et le stock ne
bouge pas — c'est ta décision de 7 h 11 (« oui, renommer » la source), et c'est mesuré : ce qui sème
l'échelle de départ ne fait rien quand un espace en a déjà une. Ta propre échelle dira « Maîtrisé »
à côté d'une prose qui dit « Maîtrise » jusqu'à ce que tu la renommes dans Conception › Échelles.
**Un nouvel espace** recevra une « Échelle de départ (IDME) » qui nomme ses niveaux Incomplet /
Développement / Maîtrise / Étendu, et dont la description dit la même chose (elle disait
« Insuffisant » alors que son I s'appelait déjà Incomplet). **Le bilan d'un élève** dont un critère de
français s'effondre lit « Incomplet », plus « Insuffisant » — en dur, comme avant, ton choix ; pour un
collègue dont l'échelle nomme autrement son premier niveau, ce mot ne suivra pas son échelle, alors
que le reste du bilan la lit. Trois aides qui décrivaient le gabarit suivent.
**Ce que la mesure a corrigé dans la consigne** : elle citait « le versement des huit échelles », retiré
le 1er septembre ; le semis d'aujourd'hui est une autre fonction, et c'est elle qui a été mesurée.
**Ce qu'un partage emporte** (mesure due, sans correction) : une grille partagée n'emporte PAS
d'échelle (les grilles n'en référencent aucune) ; une **échelle** partagée voyage entière, avec les
noms de ses niveaux. Un collègue peut donc te transmettre une échelle qui dit « Maîtrisé » pendant
qu'un espace neuf dit « Maîtrise ». Ce n'est pas un défaut, c'est le fonctionnement voulu des mots
qui voyagent.
**Vérifié comment** : douze substitutions visées par ligne et refusées si non uniques ; une sentinelle
neuve (un espace qui porte déjà « Maîtrisé » le garde après le semis, un espace neuf reçoit les quatre
mots), qui rougit quand on remplace la garde du semis par une réécriture, puis fichier restauré par
empreinte ; Vitest complet après le commit. **Aucune porte terrain** : tout ici se lit dans le code, et
tu ne crées pas d'espace neuf ni de critère effondré pour voir — ça attend un cas réel.

↻ **1.129.1 — L'ÉCHELLE IDME DIT LES MÊMES QUATRE MOTS PARTOUT, ET LE BLOC DES SEUILS DIT CE QU'IL RÈGLE** (build `0911-0644`).
**Ce que tu verras** : partout où l'application écrit l'échelle IDME en toutes lettres (aides,
infobulles, glossaire, guides, aide intégrée, écran de réglage), les quatre lettres se lisent
**Incomplet / Développement / Maîtrise / Étendu** — tes mots de ce matin. Plus d'« Insuffisant »,
d'« Insuffisant ou incomplet », d'« Excellent » ni d'« Excellence » ; plus d'« en Développement »
ni de « Maîtrisé » dans la prose. Dans `Labo › Outils d'observation`, le bloc « Seuils
d'interprétation » n'annonce plus l'IDME : il dit que ses trois seuils colorent les colonnes
Assiduité, Complétion, Performance et Mobilisation de la liste des élèves et qualifient
l'engagement dans le profil, sans toucher ni la note ni l'échelle. L'aide des « Indicateurs
visuels des seuils » dit que ce sont les niveaux de **ton** échelle qui se tracent sur les
graphiques ; le repère « note différée » renvoie au bon écran ; « cueillette » est devenu
« collecte ». Fragile / Acceptable / Bon n'ont pas bougé : ils attendent l'orthopédagogue.
**Rien n'est écrit dans tes données, et les noms des niveaux de tes échelles ne bougent pas** :
ce sont tes mots, et ils voyagent avec elles. ⚠ Conséquence à trancher : l'échelle de départ
semée chez chaque nouvel utilisateur dit encore « en Développement » et « Maîtrisé » (et sa
description, « Insuffisant ») — la porte terrain te pose la question (§ 3).
**Vérifié comment** : quarante-sept substitutions, chacune visée par numéro de ligne et
refusée si le texte n'y était pas exactement une fois ; diff relu en entier ; le multi-ensemble
des nombres du diff est identique avant et après (aucune borne, aucune couleur) ; Vitest 531
fichiers / 5793 essais. **Pas vérifié** : l'écran lui-même — une porte, trois rangées
(`plans de travail/PORTES-TERRAIN-2026-09-11-mots-depistage.md`), l'artefact revient à Cowork.
Le reste de #823 (les deux textes faux, « cueillette ») est livré : la fiche est close. (`#823`)

↻ **1.129.0 — DEUX RÉGLAGES QUI NE FAISAIENT RIEN S'EN VONT, LA FENÊTRE D'ANALYSE FONCTIONNE** (build `0910-1645`).
**Ce que tu verras** : dans `Labo › Outils d'observation`, la case « Découpler P et N » et le menu
« Unité d'affichage de l'assiduité » ont disparu — rien ne les lisait. La « Fenêtre d'analyse des
patterns » s'applique enfin : le nombre que tu tapes atteint les calculs du profil et du Suivi du
groupe, qui restaient à 3 quoi que tu tapes. ⚠ **Si tu y avais mis un autre nombre, il est reparti à
3** : cette valeur n'avait jamais eu d'effet, la reprendre aurait changé tes profils sans que tu l'aies
demandé (décision de Cowork, confirmée par toi). Retape-le, et cette fois ça compte. Et le curseur
« Direction du risque » s'appelle **« Sensibilité des flèches par critère »** : il agit, mais pas sur
ce que son nom disait — il règle la variation minimale pour qu'une flèche (→ / ←) apparaisse après un
critère dans le profil. Sa valeur et son effet ne changent pas.
**Rien n'est écrit dans tes données** : les préférences retirées restent chez toi, muettes.
**Ce que la relecture croisée a attrapé** : la carte des effets d'hier disait que ce curseur ne
faisait rien. Faux — elle avait suivi une fonction du même nom (morte) et pas le seuil, qui a un
second lecteur vivant. Sans la mesure préalable, les flèches auraient été figées à 0,05 sans que
personne le sache. C'est toi qui as tranché : garder et renommer.
**Vérifié comment** : neuf essais qui EXÉCUTENT le panneau sur le vrai code des seuils et prouvent
que la valeur tapée arrive à la fonction que les douze calculs appellent ; neuf ablations, neuf
rouges, arbre restauré par empreinte ; Vitest 531 fichiers / 5793 essais.
✅ **VU À L'ÉCRAN PAR GRÉGOIRE — porte terrain relevée le 10 septembre à 18 h 00, 12 sur 12, zéro
échec** (`plans de travail/PORTES-TERRAIN-2026-09-10-823.md`), sur `app.codexnumeris.org` : les deux
blocs partis sans trou ni titre orphelin, le curseur sous son nouveau nom et sa nouvelle aide, la
fenêtre qui survit au rechargement et qui atteint le profil (à 12, plus aucune flèche ; à 3, elles
reviennent). ⏳ **Reste de ce chantier** : les deux textes de l'écran qui promettent ce que le code ne
fait pas, et le mot « cueillette » — ce sont tes mots, ils attendent ton tri. (`#823`)

↻ **1.128.4 — LES QUATRE RÈGLES QUI QUALIFIENT UN CONTEXTE SONT ÉCRITES AU MÊME ENDROIT** (build `0910-1531`).
**Ce que tu verras : rien.** Pas un mot, pas une borne, pas une couleur n'a bougé — c'est le
critère de réussite de ce lot, et il est mesuré : les quatre règles ont été rejouées AVANT et
APRÈS sur 1630 cas (chaque borne, chaque borne ± 1 point, et le texte complet de la carte
Mobilisation du profil), zéro différence. **Ce qui a changé pour toi** : quand tu demandais
« comment l'application décide-t-elle qu'un contexte est Favorable ? », la réponse était
éparpillée dans quatre fichiers. Elle tient maintenant dans un seul (`js/contexte-qualification.js`),
avec la provenance et la date de chaque borne, et le tableau des désaccords réels — mot par mot,
en points de pourcentage — est écrit au § 8 de l'inventaire du 10 septembre. **C'est ce tableau
qui part chez l'orthopédagogue** ; rien n'y est recommandé. Trois faits que personne n'avait vus :
« Assiduité critique » veut dire « sous 60 % » sur une carte du profil et « sous 70 % » sur la
carte d'à côté ; une quatrième borne (60 %) n'est réglable nulle part ; et le palier
« Insuffisant » du contexte ne peut jamais s'afficher. Aucun des trois n'est corrigé : ce sont
des décisions de pédagogie, elles attendent l'automne (`#821`, `#822`).
**Vérifié comment** : harnais AVANT/APRÈS sur le code d'avant (`5c29d3fd`) et d'après ; sentinelle
de 24 essais dont 8 break-tests rouges ; Vitest 530 fichiers / 5785 essais. **Pas vérifié** :
l'écran dans Safari et sur iPad — aucun verdict local ; le CI WebKit tranche, et une divergence
serait une régression, pas une nouveauté.
**Ajouté le même soir, sans changement de version — ce que l'écran `Labo › Outils d'observation` fait
vraiment** : pour chacun de ses vingt réglages, on sait maintenant où son effet se voit (§ 4 du cadrage
de l'écran de réglage du dépistage). **Quatre réglages ne font rien** — « Découpler P et N », « Fenêtre
d'analyse des patterns », « Unité d'affichage de l'assiduité » et « Direction du risque » : tu peux les
changer, aucun écran ne bouge, et la fenêtre d'analyse reste à 3 quoi que tu tapes. Aucun des vingt ne
touche une note. Quatre agissent ailleurs que dans Suivi (la palette d'annotation, la liste des
évaluations, le badge « dépistage » d'une grille, l'export recherche). Rien n'est corrigé : ce tri des
réglages est le chantier que tu as ordonné le 10 septembre, et la forme de l'écran t'appartient.
**Vérifié comment** : chaque lecteur de chaque clé remonté jusqu'à un rendu, dans le code ; pas d'écran
ouvert. (`#823`, `#824`)

↻ **1.128.3 — QUATRE RÉGLAGES QUI N'ATTEIGNAIENT PAS LEUR CALCUL** (build `0910-1147`).
**Ce que tu verras** : (1) dans le panneau Portfolio d'un profil, les artefacts cochés
automatiquement correspondent enfin au mode que tu as choisi — « N derniers » retenait en
réalité les N *meilleurs*, et « Hybride » oubliait le bloc Obligatoires ; en hybride, tu peux
maintenant cocher à la main autant d'artefacts que la note en compte. (2) Le diagnostic par
critère affiche « seuil force : 70 % » au lieu d'un 0.7125 figé, et il bouge quand tu bouges
ton curseur. (3) La légende de couleurs du tableau de bord annonce ses vraies bornes
(30-47,5 / 47,5-65 / 65-82,5 / ≥ 82,5) ; **la barre elle-même ne change pas d'un pixel**.
(4) Les trois curseurs « Fragile / Acceptable / Bon » de Labo › Outils d'observation servent
enfin : ils gardaient ta valeur et te la remontraient, mais aucun calcul ne la lisait.
⚠ **Si tu avais déjà déplacé un de ces trois curseurs, ton réglage prend effet maintenant** —
les couleurs de ta liste peuvent bouger. C'est ton réglage qui s'applique ; rien de neuf n'a
été posé à ta place.
**Ta note du cours n'était touchée par aucun des quatre.**
**Vérifié comment** : trois bancs neufs, dont deux qui EXÉCUTENT le code au lieu de le lire
(les modes de sélection sur un jeu dont les numéros contredisent les identifiants, pour prouver
lequel des deux tris décide ; le rebranchement des curseurs sur une base montée en mémoire).
Chaque banc a été rendu ROUGE avant d'être cru : 16 ablations, 16 rouges, l'arbre restauré par
empreinte sha256 à chaque fois. Vitest : 529 fichiers, 5760 essais, zéro échec.
⛔ **CE QUI N'EST PAS VÉRIFIÉ** : rien de tout ceci n'a été vu à l'écran. Aucune session cloud ne
peut lancer Safari, et aucune spec Playwright existante ne touche ce code — le verdict WebKit
vient de la CI, et le verdict Safari/iPad reste à faire sur ton Mac. **À regarder en priorité** :
la légende du tableau de bord porte maintenant des décimales (« 47,5 % ») dans quatre colonnes
serrées — c'est là que ça peut déborder sur iPad.

↻ **1.128.0 — LA « CONSOLIDATION DES APPRENTISSAGES » N'EXISTE PLUS** (build `0910-0019`).
**Ce que tu verras** : la carte du Labo a disparu, et **deux autres affichages avec elle** — la
ligne « Consolidation : … » de l'onglet *Forces et défis* d'un profil étudiant, et les mentions
« Consolidé depuis cette production » qui apparaissaient au survol du graphique de progression.
C'est toi qui l'as demandé : « cette fonctionnalité n'a jamais vraiment été concluante ».
**Rien de ce que tu as saisi n'est touché** — ce module ne faisait que lire.
**Vérifié comment** : les six sous-sections du Labo ouvertes une à une dans un navigateur, aucune
erreur, et la page « Études » ne porte plus que ses deux autres cartes. Le repère
« Maîtrisé à partir de » de tes échelles, lui, **garde tout son effet** : il a d'autres lecteurs
(les cartouches, le classement des résultats par niveau), vérifiés un par un avant de couper.

↻ **La fenêtre « Soutenir Labo Codex » dit à quoi on s'abonne.** « Suivre le projet » passe
au-dessus de « Avec tes moyens », et les trois abonnements nomment le **blogue Codex Numeris** :
l'abonnement gratuit et celui de soutien sont deux niveaux du même abonnement au blogue.
Rien ne le disait, et ça se lisait comme un abonnement à l'application.
**Vérifié comment** : rendu mesuré à trois formats (iPad portrait et paysage, téléphone) — ordre
bon, aucun texte hors cadre, aucun défilement horizontal.

▣ **Le format HEIC : il n'y avait rien à corriger, et c'est mesuré.** Tu as signalé que Chrome ne
lit pas le HEIC. C'est vrai de Chrome, mais l'application ne compte plus sur lui depuis fin août :
elle embarque son propre décodeur. **Dans ton Chrome, une photo d'iPhone de 2,9 Mo est convertie en
3024 × 4032 en 2,5 secondes.** L'encadré ne promet le HEIC que là où il peut le tenir — il le
retire de lui-même quand tu ouvres l'application par double-clic. Rien changé.

⏳ **Ce qui reste à voir sur TA tablette** : la fenêtre de soutien dans Safari. Elle a changé deux
fois en vingt-quatre heures sans que personne l'y voie.

✅ **RELEVÉE — la porte terrain des sept livraisons du jour (#802) : 14 sur 14, zéro échec.**
`plans de travail/PORTES-TERRAIN-2026-09-09.md`, relevée le 9 sept. à 18 h 49. **Ta grille de
dépistage tient** : re-désignée, elle a survécu au rechargement (rangée 1.1) — plus rien à faire de
ce côté. Sur ta tablette, la bulle répond au doigt sur les cinq essais, et le Comparateur se lit en
mode sombre. Tes trois décisions sont écrites dans le markdown, pas dans une conversation : la prose
de l'Aide retenue telle quelle, « Verrou sur une évaluation » confirmé, et **l'intention prime — la
cible d'apprentissage**, ce dernier point ouvrant un chantier (#810) plutôt qu'un correctif.
Consigne de publication de l'artefact pour Cowork :
`plans de travail/CONSIGNE-COWORK-artefact-porte-802.md`.

↻ **1.127.5 — LA FENÊTRE « SOUTENIR LABO CODEX » SE LIT D'UN COUP** (build `0909-2314`).
**Ce que tu verras** : quatre sections en liste sont devenues **trois blocs cadrés** — « Avec ton
temps », « Avec tes moyens », « Suivre le projet » — et le contact descend en pied, sans titre. Le
bleu ne sert plus **qu'aux liens** : les titres de section le portaient aussi, si bien que rien ne
ressortait. Les filets entre les lignes et les puces disparaissent. **Le blogue dit enfin sur quoi il
porte** : procédures, trucs et astuces de Labo Codex, et analyses critiques sur la technologie, la
pédagogie et l'éducation. La Voûte ne s'y annonce plus — ta décision du 10 septembre.
**Vérifié comment** : rendu au navigateur (Chromium) en mode clair et en mode sombre, à 980 px, à
820 px (ta tablette en portrait — aucun débordement) et à 520 px (les blocs s'empilent). La fenêtre
passe de 945 à 759 pixels de haut. Deux maquettes t'ont été soumises à l'écran avant de coder ; tu as
tranché la direction et refusé mes phrases d'accroche, donc la prose reste la tienne. (#815)
⏳ **Ce qui reste dû, et c'est à toi** : cette fenêtre n'a pas été ouverte dans Safari sur ta
tablette. Rien dans le correctif ne dépend du navigateur, mais personne ne l'y a vue.
⚠ **Un défaut assumé, pas caché** : quatre libellés de liens passent sur deux lignes dans les
colonnes. C'est le prix des deux colonnes avec des libellés de cette longueur ; les raccourcir
toucherait tes mots, donc je ne l'ai pas fait.

↻ **1.127.4 — LE JOURNAL DE BORD D'UNE ÉVALUATION REDEVIENT LISIBLE** (build `0909-2129`).
**Ce que tu verras** : le journal de bord d'une copie s'ouvrait **sans panneau**. Son contenu se
lisait à même le voile bleu de la fenêtre, et la liste des évaluations le traversait — bandeau,
pastilles d'état, boutons — au point de le rendre illisible par bandes. Il a maintenant le même fond
opaque que les autres fenêtres de l'application, dans les deux modes, et ses étiquettes de détail
(durée, note, niveau) se lisent au lieu de se deviner.
**Vérifié comment** : une seule déclaration en était la cause — le fond du panneau s'appuyait sur une
couleur **qui n'existe nulle part** dans l'application, et une couleur inexistante annule la
déclaration au lieu de la dégrader. Onze couleurs et mesures du même bloc étaient dans ce cas ;
toutes rebranchées. Rendu au navigateur sur un banc qui **reproduit ta capture**, dans les deux
modes ; contrastes recalculés depuis la feuille de style, tous au-dessus du minimum d'accessibilité.
Un garde-fou empêche désormais ce type de couleur fantôme de se rajouter. (#811, signalé par toi le
9 septembre à 21 h 02)
⏳ **Ce qui reste dû, et c'est à toi** : rouvrir un journal de bord sur ta tablette. Safari n'a pas
été visité.
⚠ **Deux choses vues en réparant, écrites mais NON corrigées** : le bouton qui ferme ce journal
mesure 34 × 26 pixels au lieu des 44 × 44 visés au doigt, et c'est le seul moyen d'en sortir — ni le
voile ni la touche Échap ne ferment (#814). Et le nom de fichier de tes rapports de bug **avance
d'un jour** dès que tu en produis un après 20 h : celui de ce bug-ci porte le 10 alors que tu l'as
écrit le 9 (#812).

↻ **1.127.3 — DEUX MOTS POUR DEUX CHOSES, ET LE BOUTON COCCINELLE NE SERT PLUS QU'AUX BUGS**
(build `0909-1955`).
**Ce que tu verras** : dans ta grille, le champ « Niveau SOLO » s'appelle maintenant « **Complexité
SOLO du critère** » ; dans ton échelle, l'équivalent devient « **Palier SOLO du niveau** ». C'est le
même mot qui servait aux deux, et il désignait deux choses opposées : ce qu'un critère EXIGE d'un
côté, ce qu'un élève ATTEINT de l'autre. Tu t'y es trompé toi-même aujourd'hui sur ton critère
Structure, la fiche d'aide ouverte juste à côté. ⮕ **Rien n'a changé dans tes grilles ni dans tes
échelles** : c'est l'étiquette à l'écran, pas ce qui est enregistré.
▣ **Pourquoi maintenant, et pas après le 14** : dire « mon seuil est le relationnel » devant vingt
collègues ferait lire à une partie de la salle que trois de tes cinq critères passent sous ton propre
seuil. Le chantier de fond, lui, attend la rencontre — il est cadré dans la fiche #810.
▣ **Le bouton coccinelle annonce enfin ce qu'il y a derrière.** Il disait « Signaler un bug » ; la
fenêtre porte deux modes depuis toujours — un bug, ou un commentaire. Un collègue sans bug à
déclarer n'avait aucune raison de l'ouvrir. Il dit maintenant « **Signaler un bug ou donner ton
avis** », dans l'en-tête comme dans le menu.
▣ **Et l'invitation reste visible.** La fenêtre des « Nouveautés » porte un bouton « Donner ton
avis ». Elle est là parce que le bandeau de version, lui, **disparaît** : une invitation qu'on ne
voit qu'une fois, au moment précis où tu veux lire autre chose, se referme avant d'avoir servi.
▣ **Au passage, une phrase de l'Aide qui n'avait jamais été livrée** : en PAN – Standards, la note
« **vise** » le niveau atteint pour des cibles d'apprentissage — elle n'y « repose » plus — et l'Aide
dit désormais par quoi Labo Codex lit ce niveau aujourd'hui : les traces retenues au portfolio.
**Vérifié comment** : 12 mutations volontaires, 12 rouges, arbre restauré par empreinte sha256 — dont
une qui a révélé qu'un de mes propres essais passait QUOI QU'IL ARRIVE (il surveillait un bandeau
sous un identifiant qui n'existe nulle part). La fenêtre des nouveautés et son nouveau bouton ouverts
et cliqués au banc ; l'étiquette de grille tient sur une ligne. Suite complète : 5 714 essais verts
(520 fichiers).
⛔ **Ce qui n'est PAS vérifié** : ni Safari, ni l'iPad. Et l'éditeur de grille n'a pas été ouvert en
situation — son étiquette a été mesurée avec la vraie feuille de style, pas dans le vrai écran.

↻ **1.127.2 — LE TEXTE D'ACCUEIL DE L'AIDE DIT VRAI SUR TES DONNÉES** (build `0909-1912`).
**Ce que tu verras** : dans Aide › « Qu'est-ce que Labo Codex ? », la carte de présentation ne promet
plus deux choses que l'application ne tient pas. Elle disait « **son code est ouvert** » — le dépôt est
privé depuis le 23 juin — et « tes données restent **en sécurité** chez toi » — il n'y a aucun
chiffrement au repos ; elles restent *chez toi*, ce qui est vrai, mais rien ne les *protège* sur
l'appareil. Un collègue qui vérifiait tombait sur une affirmation fausse.
▣ **Un paragraphe neuf répond à la question qu'on te posera** : « Où vont tes données ? Nulle part. »
Le navigateur, ton appareil, aucun serveur ; le transport d'un appareil à l'autre par un fichier que tu
déplaces toi-même, sans nuage. Et ce que tu partages avec un collègue — grille, échelle, cartouche,
pratique — est **signé** et porte une **licence Creative Commons** : l'application refuse d'importer un
fichier non signé ou modifié en chemin.
▣ **La passerelle vers une IA est écrite, au lieu d'être seulement niée.** Il n'y a toujours aucune IA
dans l'application, et aucune décision n'est prise à ta place. Mais les boutons « Copier le prompt pour
IA » et le modèle de cartouche vide existent : le texte dit maintenant que ce qui sort d'ici est un
**gabarit**, jamais les données de tes élèves. Quelqu'un qui trouve ces boutons ne croira pas que le
texte lui a menti.
▣ **Ce qui n'a pas bougé** : les trois blocs « À quoi sert ce labo ? », « Qu'est-ce que ça change ? » et
« Qu'est-ce que ça demande ? », mot pour mot. Aucun calcul, aucune donnée, aucun réglage.
⛔ **Rien n'annonce que le code sera rouvert**, même si c'est ton intention : une promesse dans un texte
d'aide devient une dette. La phrase reviendra quand l'historique du dépôt aura été purgé.
**Vérifié comment** : les deux formules fautives ne sont plus dans `index.html` (recherche à zéro, avec
son témoin) ; le bloc **lu à l'écran**, carte dépliée, sur un banc jetable — accents, espaces
insécables et tirets tiennent. C'est un texte : la preuve est la lecture, et elle a été faite.
Suite complète : 5 703 essais verts (518 fichiers).

↻ **1.127.1 — LE TABLEAU DU COMPARATEUR SE LIT D'UN COUP D'ŒIL** (build `0909-1745`).
**Ce que tu verras** : dans Labo › Comparateur, les **titres de section**, les **six paramètres** et
les **lignes** ont enfin trois traitements distincts. Ce midi, le tableau est passé de deux en-têtes à
huit — et comme les trois classes du tableau n'étaient déclarées dans **aucune** feuille de style, rien
ne les séparait des lignes qu'elles coiffent. Le regroupement était l'apport du lot, il se lisait mal.
Corrigé : la section porte un fond et un filet, chaque paramètre est un intertitre sarcelle, et les
lignes sont en retrait sous le leur.
▣ **Corrigé à l'écran, pas sur plan.** La première version donnait un fond aux deux niveaux : en mode
**sombre**, la hiérarchie s'inversait — les six bandes de paramètres écrasaient le titre de section.
Mesuré, puis repris : six bandes pleine largeur alourdissaient de toute façon un tableau déjà dense.
Les contrastes des deux modes sont mesurés et tiennent (6,9:1 au plus serré, le seuil est 4,5:1).
▣ **Une case de règle sommative porte enfin le même nom partout.** L'assistant te faisait cocher
« **Verrou sur une évaluation** » et son récapitulatif répondait « **Verrou d'évaluation** » : une
seule case, deux mots. Les quatre libellés de règles étaient écrits dans **trois** tables ; ils
viennent maintenant d'un seul endroit, et c'est le mot de l'écran de saisie qui l'emporte.
▣ **Rien d'autre n'a bougé** : aucun calcul, aucune valeur par défaut, aucune donnée. Les `value`
persistées dans tes pratiques déjà créées sont intactes — seul l'affichage passe par la source unique.
**Vérifié comment** : le tableau ouvert et lu **dans les deux modes** sur un banc WebKit jetable (pack
de démonstration, profil éphémère), contrastes calculés ; **8 mutations volontaires, 8 rouges**, arbre
restauré par empreinte sha256 — dont **trois qui ont d'abord viré au VERT** et ont montré que mes
propres gardes ne mesuraient rien : vérifier qu'un nom de fonction *apparaît* alors que son corps est
vidé, exiger une règle CSS sans exiger le retrait qu'elle porte, et un sélecteur non ancré que sa
propre surcharge « mode clair » suffisait à satisfaire. Les trois resserrées, puis rouges.
Suite complète : 5 703 essais verts (518 fichiers).
⛔ **Ce qui n'est PAS vérifié** : ni Safari, ni l'iPad. Le rendu vient de WebKit en simulation, et
c'est précisément un lot d'affichage. La porte terrain (#802) couvre maintenant cinq livraisons.

▣ **LE VERT DE LA CI REDEVIENT UN SIGNAL** (9 sept., fin de journée — aucun changement pour toi).
La CI GitHub était **rouge sur `main` depuis 24 h** (dernier vert : hier 17 h 20), sur 4 essais. Un rouge
permanent ne signale plus rien : une vraie régression s'y noierait. Mesuré, et **ce n'était pas ton
application** — c'étaient les essais eux-mêmes.
▣ **Trois essais du toucher sur iPad accusaient un code sain.** `page.touchscreen.tap()` sous WebKit
sans écran émet `pointerdown`, `touchstart`, `touchend` — **et aucun `click`**. Or c'est un `click` que
l'application écoute. La sélection n'était donc jamais demandée : les essais mesuraient le harnais, pas
la tolérance de 44 px, qui **fonctionne** (vérifiée en la cassant : l'essai rougit).
▣ **Et deux essais de la même famille passaient QUOI QU'IL ARRIVE.** « Trop loin, le toucher ne saisit
personne » et « une barre voisine ne vole pas le toucher » attendent que rien ne soit sélectionné — or
rien ne l'était jamais. **Break-testés : la tolérance tactile entièrement retirée, ils restaient verts.**
Ils n'attestaient rien depuis le début. C'est le genre de vert qui coûte plus cher qu'un rouge.
▣ **Le quatrième courait après lui-même.** La poignée de la palette de codes est ramenée au coin visible
par un écouteur `scroll`, qui s'exécute au frame suivant ; l'essai mesurait avant. **4 vertes sur 5 en
local** avant correction, **6 sur 6** après — il attend maintenant la condition, pas un délai. Là non
plus le code n'était en cause : un frame de retard est invisible au doigt.
**Vérifié comment** : les 6 essais du toucher passent, et **4 mutations volontaires du code applicatif
les font rougir** (tolérance retirée, garde « pointeur grossier » sautée, barre voisine autorisée à voler
le toucher, poignée non repositionnée) — chaque fichier restauré et vérifié par empreinte sha256. La
baseline des rougeurs connues **rétrécit de 3 à 0**, comme elle le doit.
⛔ **Ce qui n'est PAS vérifié** : que le toucher marche sur TON iPad. Ces essais tournent sur un WebKit
sans écran ; ils disent que le code fait ce qu'on lui demande, pas que le doigt trouve la bulle. C'est
la porte terrain (#802) qui le dira.

↻ **1.127.0 — LE COMPARATEUR PARLE EN SIX PARAMÈTRES** (build `0909-1640`).
**Ce que tu verras** : dans Labo › Comparateur, le tableau n'aligne plus une suite de lignes à plat.
Il est **rangé sous les six paramètres** que l'Aide présente depuis ce midi — objet, révisabilité,
agentivité, communication, granularité, détermination. Les lignes n'ont pas changé de sens, aucun
chiffre ne bouge : elles sont **regroupées**, pour qu'on voie sur quelle dimension deux pratiques
diffèrent vraiment.
▣ **Ce que l'application ne couvre pas est écrit noir sur blanc.** L'**agentivité** — les choix et la
flexibilité laissés à l'étudiant·e — n'a aucun réglage dans Labo Codex, et le tableau l'affiche au
lieu de laisser un blanc. Idem pour les **niveaux de la note du cours**, et pour l'**alignement de la
note sur des cibles d'apprentissage** là où elle porte sur des instruments. Motif : un silence se
lirait comme une lacune de TA pratique, alors que c'est une limite de l'outil.
▣ **Deux lignes neuves, et rien à configurer.** «&nbsp;Ce à quoi la note se rapporte&nbsp;» dit si elle
porte sur des cibles ou sur des instruments — dérivé de la famille, aucun champ ajouté.
«&nbsp;Temporalité de la note&nbsp;» rappelle que la note différée est un **réglage global**, dans
Réglages › Préférences : elle n'est pas un attribut de la pratique comparée, et le tableau ne fait pas
semblant du contraire. Le réglage n'a pas bougé de place.
▣ **Les règles spéciales d'une pratique sommative ne sont plus entassées sur une ligne** : le
remplacement automatique sous la révisabilité, le verrou et le plafonnement sous la détermination, le
portfolio sous l'objet. C'était le seul cas qui ne se rangeait pas sous un seul paramètre — tranché en
éclatant, parce que garder la ligne unique aurait rangé trois règles sur quatre au mauvais endroit.
▣ **Rien d'autre n'a bougé** : ni le moteur de calcul, ni l'assistant de configuration, ni une seule
valeur par défaut, ni tes données. Les six paramètres **décrivent** une pratique, ils ne la règlent pas.
**Vérifié comment** : **14 mutations volontaires du code, 14 rouges**, chaque fichier restauré et
vérifié par empreinte sha256 — dont deux qui ont d'abord viré au VERT et ont révélé de vrais trous
dans mes propres tests (le repli « Autres » recréait les six groupes dans le bon ordre et masquait la
perte de l'ossature ; une clé `undefined` passait pour un groupe valide). Les deux gardes ont été
resserrées, puis rougissent. Le tableau a été **ouvert et lu à l'écran** sur un banc WebKit jetable
(pack de démonstration, profil éphémère — aucune de tes données touchée) : six en-têtes, 14 lignes,
zéro erreur console. Suite complète : 5 683 essais verts.
⛔ **Ce qui n'est PAS vérifié, et un défaut que ce lot rend plus visible** : les en-têtes du tableau
**ne se distinguent pas** de ses lignes — les trois classes CSS du tableau du Comparateur ne sont
définies nulle part (défaut préexistant, mesuré). Le tableau portait deux en-têtes indistincts, il en
porte huit. Le regroupement se lit donc moins bien qu'il ne le devrait. **Hors du périmètre que tu as
fixé** («&nbsp;rien d'autre&nbsp;») : non corrigé, inscrit (#808). Et rien n'a été vu sur Safari ni sur
l'iPad.

↻ **1.127.0 (même livraison) — TA GRILLE DE DÉPISTAGE RESTE CHOISIE, ET LA FICHE PRODUCTION S'ALIGNE**
(#806 et #807, tes deux rapports de cet après-midi).
**Ce que tu verras** : dans Labo › Outils d'observation, la **grille de critères pour le dépistage**
ne se vide plus toute seule. Et la fiche d'une production n'a plus son grand trou blanc au milieu.
▣ **Deux chemins l'effaçaient, et aucun n'était un geste de ta part.** Le premier : l'écran des forces
et défis — du code d'AFFICHAGE — effaçait le réglage chaque fois qu'il ouvrait un profil avant que la
base soit hydratée, sous le nom rassurant d'« auto-nettoyage silencieux ». Sa prémisse était fausse
(« absente de la liste DONC supprimée ») : `db.getSync` rend une liste vide aussi quand IndexedDB
n'est pas prête, et **ton localStorage est saturé** (5 119 Ko au rapport), donc tes grilles vivent en
IDB. Le second : le panneau des réglages réécrit TOUT à chaque changement d'une case, et lisait le
sélecteur avec un repli `|| ''` — un menu pas encore rempli rend une valeur vide, indiscernable d'un
retrait volontaire.
▣ **Le chemin affiché était faux, en trois exemplaires.** « Conception › Pratiques de notation », où
le réglage n'est plus. C'est la duplication qui lui a permis de survivre à la migration : les trois
sites lisent maintenant la même source, celle de #550, qui porte le bon chemin.
▣ **La fiche production** : la description du type était alignée sur le BAS de la colonne voisine, ce
qui suppose deux colonnes de hauteur comparable — pour un **artefact**, la pondération disparaît et la
description tombait sous un grand vide. Elle prend toute la largeur ; la case « Travail diagnostique »
reste avec la pondération (#790 : c'est là que le poids d'un travail se décide) ; le bouton PDF et les
trois choix à droite, libellés alignés au lieu de démarrer à trois hauteurs. Et le bouton
d'enregistrement des Outils d'observation remonte auprès du titre.
⛔ **TARIR N'EST PAS RÉPARER — et il reste un geste pour toi.** La source est tarie, **le stock ne
l'est pas** : la préférence déjà effacée dans tes données le reste. **Désigne ta grille une fois après
cette mise à jour** ; c'est ce passage-là qui prouvera le correctif, pas les tests.
**Vérifié comment** : **10 mutations volontaires, 10 rouges** sur les deux sentinelles neuves (#806
neuf cas, #807 cinq), chaque fichier restauré et vérifié par empreinte sha256 — y compris les
contreparties : rendre la garde de sauvegarde *totale* fait rougir le cas « retrait volontaire », et
retirer la seule règle CSS fait rougir l'alignement des sélecteurs. Rendu **mesuré dans Chrome** sur
serveur local : 0,0 px d'écart sur les libellés ET les sélecteurs, aux deux types de production
(artefact pondération masquée, examen visible) et à quatre largeurs de panneau, sans chevauchement ;
contraste du bouton 8,03:1 dans les deux modes. Suite complète mesurée en worktree isolé — une autre
session travaillait dans le même arbre.
⛔ **Ce qui n'est PAS vérifié** : Safari et l'iPad (le CSS garantit la cible de 44 px, personne ne l'a
vue) ; et la persistance dans la durée, qui demande ton usage réel — c'est un défaut de course, il ne
se produisait pas à chaque fois.

↻ **1.126.1 — LE GLOSSAIRE DIT LA MÊME CHOSE QUE LE RESTE DE L'AIDE** (build `0909-1512`).
**Ce que tu verras** : dans Consultation › Référence rapide, l'entrée **« PAN »** ne définit plus une
pratique alternative de notation par « sélectionner automatiquement les N meilleurs artefacts ». Elle
reprend les mots de la carte d'Introduction — droit à l'erreur, traces récentes ou représentatives —
et nomme les trois familles. **« Performance »** et **« Portfolio »** suivent&nbsp;: « les N meilleurs »
y est présenté comme **une** méthode de sélection parmi celles que tu peux choisir, pas comme la règle.
Et sur la carte de l'indice P, l'exemple ne dit plus « en PAN – Standards, P = moyenne des N meilleurs
artefacts (IDME) » — ni la méthode ni l'échelle ne sont des attributs de la famille.
▣ **Pourquoi maintenant** : c'était la contradiction laissée ouverte par 1.126.0 ce midi. L'Aide disait
deux choses différentes selon l'onglet où tu étais.
**Vérifié comment** : les quatre entrées relues à l'écran dans ton Chrome, app servie en local&nbsp;; la
recherche de l'Aide retrouve « dénotation » dans quatre cartes et « méthode de sélection » dans trois.
**Mesuré au passage** : le second glossaire (« 48 termes du parcours ») était déjà juste — il dit
« regroupe les pratiques STD, SPE et DEN ». Rien à y changer. Structure HTML identique avant/après.
⛔ **Ce qui n'est PAS vérifié** : ni Safari ni l'iPad. Toujours dû avec la porte terrain (#802).

↻ **1.126.0 — L'AIDE NE PRÉSENTE PLUS TA PRATIQUE COMME LA DÉFINITION** (build `0909-1452`).
**Ce que tu verras** : dans l'Aide, la carte sur les pratiques alternatives de notation s'appelle
désormais **« Les pratiques alternatives de notation (PAN) »**, au pluriel. Elle ne dit plus qu'une PAN
« sélectionne les N meilleurs artefacts » — c'était **ta** façon de faire, pas la définition. Elle dit ce
que les PAN ont en commun, présente les **quatre familles côte à côte** (dont la **dénotation**, qui
n'est plus annoncée comme « à venir »), et ajoute **six questions** pour situer une pratique : objet,
révisabilité, agentivité, communication, granularité, détermination.
▣ **La carte « Choisir ta pratique de notation » ne te recommande plus de chiffres.** « 8-14 artefacts
recommandés (standard : 12) » et « 3-4 jetons maximum » ont disparu : c'étaient les réglages d'une
classe en particulier, pas des normes. Les quatre familles y ont maintenant **le même gabarit** — un
principe, puis ce qu'il y a à régler — et un encadré dit ce que la recherche observe des reprises
sans imposer de nombre.
▣ **Les mots sont ceux de l'assistant.** « PAN – Standards », « PAN – Spécifications »,
« PAN – Dénotation » : l'Aide et l'assistant de configuration disent maintenant la même chose.
▣ **Réglages › À propos cite le rapport d'où viennent ces six questions** : « Laissons-les se
tromper » (Cormier, Voisard, Turcotte et Arseneault-Hubert, Cégep André-Laurendeau, 2026), avec le lien
vers le rapport complet. La phrase d'introduction ne parle plus de « deux blogues ».
▣ **Rien d'autre n'a bougé** : aucun calcul, aucune valeur par défaut, aucun réglage. Trois blocs de
texte, et c'est tout.
**Vérifié comment** : les trois blocs ouverts **dans ton Chrome**, sur l'application servie en local —
les deux cartes d'Aide s'ouvrent et se ferment au clic, et la recherche de l'Aide les retrouve sur
« six paramètres », « révisabilité », « agentivité » et « dénotation » (zéro erreur console). Le
tableau de l'À propos compte bien trois lignes, la troisième avec son lien. **Le risque de troncature
a été mesuré, pas supposé** : les cartes d'accordéon sont coupées à 2 000 px, et le texte neuf en fait
**1 087** au plus étroit (iPad portrait, 768 px) contre 497 avant — sous le plafond, sans débordement
horizontal. Structure HTML comparée avant/après : identique. Suite complète : 5 644 essais verts.
⛔ **Ce qui n'est PAS vérifié** : rien n'a été vu sur **Safari ni sur l'iPad réel** — la mesure iPad
vient de WebKit en simulation, pas de ta tablette. Et le **glossaire de l'Aide** (Consultation ›
Référence rapide) définit toujours « PAN » par « sélectionner automatiquement les N meilleurs
artefacts » : c'est la même confusion, dans un quatrième bloc qui n'était pas au périmètre. Non
corrigé, inscrit.

↻ **1.125.2 — CINQ CHOSES QUE TU AS SIGNALÉES CE MATIN** (build `0909-1356`).
**Ce que tu verras** : le menu « Actions » de la liste des évaluations a la **même largeur** d'une
ligne à l'autre ; dans la palette des codes, un libellé trop long **revient à la ligne** au lieu de
sortir du cadre ; le bandeau de nouvelle version t'envoie à la **carte « Nouveautés » de l'accueil**,
là où les nouveautés sont vraiment ; et dans « Annoter et évaluer », le bouton du mode **dit le mode
où tu es**, quel que soit le chemin par lequel tu es arrivé.
▣ **Le 404 après le chargement d'un codex : ton application n'y était pour rien.** Mesuré — le
déploiement en ligne était publié et sain depuis plus d'une heure quand c'est arrivé, et le site
répondait normalement juste après. C'était une panne passagère du service qui sert la page. **Tes
données étaient écrites avant le rechargement**, et elles l'étaient encore après.
▣ **Ce qui change quand même** : recharger la page était le seul moment où l'application se remettait
à la merci du réseau, juste après avoir écrit. Elle **vérifie maintenant que le serveur répond avant
de recharger**. S'il ne répond pas, elle reste ouverte et te dit que tes données sont enregistrées,
au lieu de disparaître derrière un message d'erreur en anglais.
⛔ **Ce qui n'est PAS vérifié** : rien de tout ceci n'a été vu sur Safari ni sur l'iPad, et la
vérification du serveur n'a pas été éprouvée sur un vrai codex — seulement au banc. La liste de
vérifications est due (#802).
▣ **Comment ça a été vérifié** : cinq sentinelles neuves (23 essais), **onze ablations rejouées, onze
rouges** ; deux mesures faites dans ton Chrome, sur un banc servi en local — le menu « Actions » à
150 px sur quatre listes d'options différentes, et la palette sans aucun débordement
(`scrollWidth = clientWidth = 255`). Suite complète : 5644 essais verts.

↻ **1.125.1 — LA GRILLE QUE TU IMPORTES SE MONTRE** (build `0909-0832`).
**Ce que tu verras** : après « Importer des grilles (JSON) », la grille importée est **amenée à
l'écran** et mise en évidence deux secondes, pour que tu voies laquelle vient d'arriver.
▣ **Ce qui se passait, et ce n'était pas ce que tu croyais.** Ton rapport du 8 septembre disait « la
bibliothèque n'est pas rafraîchie ». Elle l'était — à chaque fois. La grille était bien écrite, la
liste bien reconstruite. Mais la nouvelle venue s'ajoutait **tout en bas**, et la fenêtre repartait du
haut : sur ta bibliothèque, ça la plaçait à plus de huit mille pixels sous le bas de l'écran. Rien ne
bougeait sous tes yeux, ce qui ne se distingue pas d'une panne.
▣ **Et quand un filtre la cache, l'application le dit.** Deux cas mesurés au passage : la case
« Masquer les éléments déjà dans la barre latérale » cochée sur un réimport, et le matériel de
démonstration en mode normal. Dans les deux, tu lisais « 1 grille ajoutée » devant une liste
rigoureusement identique. Le message dit maintenant qu'un filtre les masque, et lequel décocher.
⛔ **Ce que ça ne fait PAS** : les **quatre autres bibliothèques** — cartouches, échelles, pratiques,
productions — ont exactement le même défaut, et il n'est pas corrigé. Tu n'avais signalé que les
grilles, et le périmètre ne s'élargit plus tout seul. C'est inscrit (#793).
**Vérifié comment** : 5 620 essais verts, plus deux gardiens neufs — l'un mesure que la carte est
réellement dans le cadre visible sur une liste de 61 grilles, l'autre que le message apparaît quand un
filtre avale le résultat. **Trois mutations du code faites exprès** pour les faire échouer : chacune
rouge, et chaque fichier restauré à l'octet près (empreinte vérifiée). La deuxième mutation **rejoue
le chiffre** : 8 548 pixels sous le bas de l'écran, deux fois de suite.
**Ce qui n'est PAS vérifié** : rien n'a été vu dans ton Chrome ni sur l'iPad — la mesure vient de
WebKit en ligne de commande. (#543, #793)

↻ **1.125.0 — UN TRAVAIL QUI REPÈRE SANS COMPTER** (build `0908-1502`). Ce que tu voulais depuis le
7 septembre : ton portrait de lecteur cesse de peser, sans cesser d'exister.
**Ce que tu verras** : sur la fiche d'un travail, sous la pondération, une case **« Travail
diagnostique — ne compte dans aucun calcul »**. Coche-la, et ce travail ne pèse plus ni sur la note,
ni sur la performance, ni sur la complétion, ni sur le palier RàI — mais il reste **entier** dans le
dossier de chaque élève : sa copie, ton annotation, ta rétroaction, son résultat. Tu peux la cocher
sur un travail que tu as déjà corrigé, c'est même le cas prévu.
▣ **Et le piège de la première semaine est fermé.** Un seul travail dû et une seule copie corrigée
suffisaient à déclarer « non-participation » — donc niveau intensif — les élèves qui n'avaient pas
encore leur horaire. Un travail diagnostique ne déclenche plus ce verdict.
▣ **Il peut lever un signalement, dans TES mots.** Sur chaque palier de ta grille de projection, une
case « ce palier lève un signalement » ; et dans les paramètres du critère, un champ où tu écris la
phrase que tu veux lire. Elle apparaît **à côté** du palier RàI de l'élève — jamais dedans — et dans
la vue de ton groupe, avec le nombre d'élèves concernés, pour voir l'ampleur avant de contacter qui
que ce soit. Rien n'est écrit sur la copie de l'élève.
⚠ **Rien n'est coché dans tes grilles, et c'est voulu** : aucune ne s'est mise à signaler toute
seule. Tant que tu n'as pas coché un palier ET écrit une phrase, il ne se passe rien.
▣ **Le champ « CAF » de la fiche s'appelle maintenant « Mesure d'aide »** — ta décision du jour : ce
pourrait être une autre matière qui est diagnostiquée, et rien dans l'application ne suppose plus une
discipline. Tes fichiers d'élèves restent lisibles, l'ancienne colonne est toujours reconnue.
**Vérifié comment** : 511 fichiers d'essais, 5 620 verts. Trois gardiens neufs, 45 cas, dont un
témoin à l'envers pour chaque exclusion — décoché, le même travail compte partout, sinon un filtre
trop large laisserait tout au vert. Puis **treize mutations du code faites exprès** pour les faire
échouer : treize rouges, et le fichier restauré à l'octet près chaque fois.
⚠ **Deux gardiens ont été REFAITS parce qu'ils ne pouvaient pas échouer** — un garde-fou en double
dont aucun des deux n'était mesurable, et un cas de comptage qui restait vert quoi qu'on casse. Sans
les mutations, les deux auraient été livrés comme du travail fini.
**Ce qui n'est PAS vérifié** : rien n'a été vu dans Safari ni sur l'iPad — trois éléments visuels
sont neufs. Porte terrain : `plans de travail/PORTES-TERRAIN-2026-09-08-travail-diagnostique.md`.
(#790)

↻ **1.124.4 — VERROUILLER UNE SÉANCE NE PEUT PLUS EFFACER SES PRÉSENCES** (build `0908-1324`).
**Ce que tu verras** : cocher « Verrouillée » sur une date dont la séance n'est pas affichée à l'écran
n'efface plus les présences que tu avais saisies pour cette date. Avant, le verrouillage enregistrait au
passage ce que l'écran montrait ; quand la séance n'était pas ouverte, l'écran ne montrait rien, et les
présences de cette date disparaissaient **sans un message** — le cadenas se posant sur une séance vide.
Seules les présences réellement affichées sont désormais remplacées.
⛔ **Ce que ça ne fait PAS** : ramener une séance déjà perdue. La correction ferme la porte, elle ne
répare rien de ce qui est déjà écrit chez toi — et rien n'a été touché dans tes données.
▣ **Et ta question du 7 sur l'enregistrement instable a sa réponse, mais ce n'était pas ce défaut-ci.**
Tu ouvrais l'application à deux adresses depuis l'automne : ton fichier local et le site web. Pour le
navigateur, ce sont deux coffres étanches qui portent le même nom à l'écran — tu saisissais dans l'un et
tu cherchais dans l'autre. Ta décision est prise : **le site web porte tes données réelles, le fichier
local ne porte plus de trimestre.** Les présences saisies en local cet automne existent toujours dans
leur coffre ; rien n'y a été touché, et ce que tu veux en faire t'appartient. (#542, #785)
⚠ **Une conséquence pratique de ta décision, à connaître** : quand une session te demande de vérifier
quelque chose à l'écran, il faut désormais que le travail soit **publié en ligne** — le déposer sur ton
disque ne suffit plus. C'est trente à soixante secondes après l'envoi.
**Vérifié comment** : 508 fichiers d'essais, 5 573 verts. L'essai qui affirmait la destruction a été
**retourné** en gardien : ses deux constats disent maintenant que la séance survit, et les trois autres
cas — dont le témoin, séance affichée — n'ont pas bougé, ce qui prouve que le remède n'a rien changé au
cas normal. Un sixième cas a été ajouté exprès contre le remède lui-même : un tableau affiché doit
toujours écraser l'ancienne valeur, sinon « ne rien effacer » deviendrait « ne rien enregistrer » sans
qu'aucun essai ne rougisse. Puis le code a été remis dans son état fautif : les deux constats ont rougi,
le témoin est resté vert, et le fichier a été restauré à l'octet près.
**Ce qui n'est PAS vérifié** : rien n'a été vu dans Safari ni sur l'iPad. Et trois essais du toucher des
bulles (Suivi › Groupe) sont rouges ici comme sur le serveur — **mesuré : ils l'étaient déjà avant ce
lot**, ils ne viennent pas de lui. La question qu'ils posent reste la tienne : les bulles répondent-elles
au doigt sur ton iPad ? (#789)

↻ **1.124.3 — SIX PETITES CHOSES RÉPARÉES PENDANT L'ATTENTE** (build `0907-1325`). Pendant que la question
des présences instables attend ta réponse, six items sans arbitrage ont été pris d'affilée.
**Ce que tu verras** : dans Évaluations › Liste, la colonne « Note % » n'affiche plus « 92.52136752136752% »
mais « 92.5% » — la même règle que la note d'origine d'une reprise, juste à côté ; ton calcul et tes notes
enregistrées ne changent pas, c'est l'affichage qui montrait le nombre entier de la machine. Et le badge
« SA » du résumé de groupe a de nouveau un fond : il appelait deux couleurs qui n'avaient **jamais** été
définies, donc le navigateur les ignorait. ⚠ **Une décision à revoir si elle te déplaît** : ce badge était
censé être orange, et aucune teinte orange du projet ne se lit correctement dans les deux modes. Il est
maintenant gris-surface avec une bordure. Si tu veux qu'il se distingue par la couleur, dis-le.
**Ce que tu ne verras pas, et qui compte quand même** : un fichier du code était illisible pour les outils de
recherche — dix minutes perdues hier à croire qu'un bout d'export n'existait pas ; il est redevenu du texte,
et la vérification posée pour l'empêcher de revenir en a trouvé **un second, du même genre**, dans un script de
réparation : corrigé aussi, sans rien changer à ce qu'il fait. Le garde-fou qui tourne avant chaque
envoi ne posait pas la même question que celui du serveur : il pouvait dire « rien à vérifier » là où le
serveur, lui, vérifiait. Il lit maintenant la liste du serveur. ⚠ **Conséquence assumée** : il te demandera
le verdict du navigateur un peu plus souvent qu'avant — exactement dans les cas où le serveur le rend déjà.
▣ **Deux mesures ont retourné leur fiche.** Une tâche notée « le seul cas franc, à faire tout de suite » était
**déjà faite** — trois lignes de vérification l'ont levée. Et en réparant un champ de date dont une classe
d'affichage se perdait, on a trouvé **vingt-deux autres cas identiques** dans la page. Ils ne sont **pas**
corrigés : ça changerait vingt-deux affichages d'un coup, et ça se juge à l'écran, avec toi. La liste est
gelée : elle ne peut plus grossir sans faire échouer les essais. (#753, #755, #756, #776, #778, #779, #787)
**Vérifié comment** : 506 fichiers d'essais, 5 561 verts (25 de plus qu'au départ) ; dix mutations du code
faites exprès pour faire rougir les essais neufs, vingt rougeurs obtenues, et le vert retrouvé après. Le contraste du
badge est **calculé** dans l'essai depuis la feuille de style, pas recopié à la main. Le garde-fou d'envoi est
**exécuté** dans l'essai et confronté à la règle du serveur sur vingt chemins. **Ce qui n'est PAS vérifié** :
rien n'a été vu dans Safari ni sur l'iPad — le navigateur reste hors de portée ici.

↻ **1.124.2 — LE REPORT VERS LÉA EST RETIRÉ** (build `0907-1011`). Grégoire l'a abandonné le jour même de
sa livraison : « Ce que tu as créé ne fait que trier l'information en la préparant pour Léa. Il s'agit d'un
transfert manuel des informations. Si on ne peut pas faire un copier/coller, il n'y a pas vraiment d'intérêt,
car aucun gain de temps. » L'application revient à son comportement d'avant : le panneau, son bouton et tout
son code sont partis, sans rien laisser en sommeil.
▣ **Ce que le travail a appris, et c'est la vraie leçon de la journée.** Le module faisait exactement ce qui
avait été demandé, et il ne servait à rien. Trois questions avaient été posées avant d'écrire une ligne de
code, et elles avaient écarté deux fausses pistes. Aucune n'a demandé : une fois le tri fait, combien de temps
reste-t-il vraiment à gagner ? L'outil agissait sur la lecture et le calcul ; le coût était dans la saisie.
**Ce n'est pas une erreur d'exécution, c'est une question qui manquait au cadrage.**
**Ce qui reste de la journée** : la barre de boutons de la saisie n'a plus qu'une seule définition, et ne peut
plus effacer ce qu'on lui ajoute. Et une question de Grégoire est tranchée : c'est l'enseignant qui juge si un
rattrapage reprend une absence — rien à automatiser là.
⚠ **Ce qui devient prioritaire** : il signale que l'enregistrement des présences est instable, qu'il a dû
saisir et enregistrer plusieurs fois. Ce n'est pas reproduit, et trois mesures pointent vers une écriture qui
n'attend pas d'être confirmée avant un rechargement. Trois questions lui sont posées avant de toucher au code.

↻ **1.124.1 EN LIGNE** (build `0907-0938`, commit `a64164cc`). **Déploiement VÉRIFIÉ par l'API Netlify** :
`6a9ebeee3b7291000831720a`, production, `ready`, publié à 13 h 41 UTC sur ce commit exact, en 8 s, sans erreur.
**Ce qui change** : le bouton « Reporter dans Léa », livré le matin même, **n'apparaissait nulle part**. Grégoire
l'a constaté sur son Mac et sur son iPad. La barre de boutons de la saisie des présences existait en deux
exemplaires — un dans la page, un second reconstruit par le programme — et le second effaçait le premier dès
qu'une séance s'affichait. Le bouton neuf, ajouté au premier seulement, disparaissait avant d'avoir pu servir.
Il n'y a plus qu'une seule barre. **Vérifié comment** : quatre mutations du code font rougir l'essai qui la
garde, et le bouton a été retrouvé dans un vrai navigateur en passant cette fois par l'affichage réel d'une
séance. Vitest 502 fichiers / 5 553 verts. **Ce qui n'est PAS vérifié** : Safari et l'iPad — la liste de
vérifications reprend à sa rangée 2.1a.
▣ **Ce que le travail a appris, et qui vaut d'être dit deux fois.** L'essai censé garder cette barre nommait
trois boutons : il est resté vert pendant que le quatrième disparaissait. Il gardait des exemples, pas la règle.
Et l'essai qui l'a remplacé était, au premier jet, **incapable d'échouer** — il sautait sa propre vérification en
silence. C'est en essayant de le casser qu'on l'a vu. Deux essais menteurs dans la même journée, tous deux
attrapés par le même geste : essayer de les faire rougir.

↻ **1.124.0 FUSIONNÉE DANS `main` ET POUSSÉE** (build `0907-0834`, commit `736928bb`), sur l'autorisation de
Grégoire. **Déploiement VÉRIFIÉ par l'API Netlify** : `6a9eb302a9b96b0008b2c867`, contexte production, état `ready`,
publié à 12 h 50 UTC sur ce commit exact, en 12 s, sans erreur, alias `app.codexnumeris.org`.
⚠ **La page servie n'a pas été lue** : le proxy de ce conteneur refuse le domaine de l'application, et refuse aussi le
CDN des captures de déploiement — les deux voies sont fermées. **Le geste qui tranche reste le numéro en bas de page.**
**Ce qui change pour quelqu'un qui reporte ses absences dans le portail du cégep** : après avoir saisi une séance,
un bouton « Reporter dans Léa » ouvre un panneau qui dit qui reporter, et combien. Jusqu'ici, il fallait relire les
vingt-huit lignes de Codex, faire la soustraction de tête pour chacune, puis retrouver les bonnes lignes dans une
seconde liste de vingt-huit noms, dans une autre fenêtre. Le panneau ne montre que les trois ou quatre élèves
concernés, avec leur numéro d'étudiant en premier — c'est ce numéro qui sert de repère dans le portail, et un
nombre à sept chiffres ne se confond pas dans une colonne de noms. Il montre aussi son calcul : les périodes de la
séance, celles de présence saisies, et l'absence qui en découle. On peut donc le contredire d'un coup d'œil.
**Deux choses qu'il refuse de faire, et c'est délibéré.** Il n'écrit jamais dans le portail : la saisie et la
sauvegarde restent le geste de l'enseignant. Et il ne propose jamais comme absent un élève qui n'a aucune saisie ce
jour-là — celui-là part dans une liste à part, parce que l'application ne peut pas distinguer « il était absent » de
« la séance n'a pas été saisie jusqu'au bout », et qu'une absence inventée finirait dans un dossier officiel.
Un élève venu à un rattrapage porte une mention à côté de son nom, et son absence au cours reste entière : savoir si
un rattrapage l'annule est une règle de cégep, pas une décision de l'application.
**Vérifié comment** : seize essais neufs sur le calcul, dont ceux qui protègent les deux refus ci-dessus ; cinq
mutations du code les font rougir, et le témoin repasse au vert. Un nom d'élève hostile, chargé de code, ressort en
texte inerte dans un vrai navigateur. Les couleurs mesurées à l'écran dans les deux modes, clair et sombre. Vitest
502 fichiers / 5 551 verts. **Ce qui n'est PAS vérifié** : Safari, l'iPad, et l'ordre réel du portail sur son vrai
groupe — le conteneur n'a pas WebKit, et la liste de vérifications terrain est déposée.
▣ **Ce que le travail a appris** : ce que Grégoire demandait au départ — coller une colonne entière dans le portail —
était impossible, et c'est LUI qui l'a mesuré en trente secondes, pas la session. Trois questions posées avant
d'écrire une ligne de code ont écarté deux fausses pistes et fait tomber la vraie contrainte : le coût n'était pas
de taper les chiffres, il était de retrouver les bonnes lignes.

↻ **1.123.12 EN LIGNE** (build `0907-0733`, commit `3b309ab9`). **Déploiement VÉRIFIÉ par l'API Netlify** :
`6a9ea3804c71af0008bf7f6c`, contexte production, état `ready`, publié à 11 h 44 UTC sur ce commit exact, en 11 s,
sans erreur, alias `app.codexnumeris.org`. ⚠ **La page servie n'a pas été lue** (le proxy du conteneur refuse le
domaine) — le geste qui tranche reste le numéro en bas de page. **Ce qui change pour quelqu'un qui ouvre le Suivi d'un groupe en début
de trimestre** : la carte des performances ne dit plus que tout le monde est en difficulté quand la note du cours
n'existe pas encore. Une pratique par standards construit sa note à partir de plusieurs résultats : tant qu'elle n'en
a pas assez, il n'y a pas de note — et ce n'est pas la même chose qu'une note de zéro. L'application le savait
déjà, elle le disait même aux bulles de la barre, mais quatre écrans du Suivi lisaient ce « pas de note » comme un
zéro : la répartition rangeait les vingt-huit élèves dans « Incomplet ou insuffisant », la phrase en dessous
annonçait « vingt-huit étudiant·es en difficulté », et le modèle d'intervention les plaçait tous au palier le plus
intensif — pendant que la barre juste au-dessous, elle, lisait les copies et disait « progression stable » pour
vingt-quatre d'entre eux. Maintenant la carte ne répartit que les élèves dont la note existe, dit combien restent en
attente, et **le palier d'intervention se décide sur le dépistage seul** — les derniers artefacts, la même donnée que
la barre des patterns — tant que la note ne se construit pas. C'est la règle que Grégoire a arrêtée ce matin-là,
entre trois possibles.
**Vérifié comment** : cinq essais neufs, dont celui qui protège l'envers — une note qui vaut VRAIMENT zéro garde son
palier intensif. Quatre mutations du code, une par écran corrigé, les font rougir. Vitest 501 fichiers / 5 534 verts.
**Ce qui n'est PAS vérifié** : l'écran réel sur l'iPad de Grégoire — le conteneur n'a pas WebKit.
▣ **Ce que le travail a appris** : la première mesure demandée à Grégoire était mal posée. On lui a fait toucher une
bulle pour lire une infobulle que Safari tactile n'affiche jamais. Ce qu'il a vu — une bulle sans pourcentage — était
pourtant la preuve cherchée.

↻ **1.123.11 EN LIGNE** (build `0906-2039`, commit `d50ed45d`). **Déploiement VÉRIFIÉ par l'API Netlify** :
`6a9e0c6912ce270008829994`, contexte production, état `ready`, publié à 00 h 59 UTC sur ce commit exact, en 8 s, sans
erreur, alias `app.codexnumeris.org` ; 17 fichiers, 2 redirections et 9 règles d'en-tête déployés sans faute.
⚠ **La PAGE SERVIE n'a pas été lue** : le proxy sortant de ce conteneur refuse `app.codexnumeris.org` comme les URL
`netlify.app` (`connect_rejected`, horodaté sur la tentative). « En ligne » repose donc sur l'état Netlify, pas sur une
lecture — **le geste qui tranche reste le numéro en bas de page**.
⚠ **Repère de dates, pour lever une ambiguïté qui traîne** : le script de release horodate en heure de Toronto (d'où le
build `0906`, soit le 6 septembre à 20 h 39), la session compte en UTC (d'où « 7 septembre »). Les deux nomment le même
moment.
**Ce qui change pour quelqu'un qui lit le Suivi sur iPad** : les bulles blanches des barres de dégradés se saisissent au
doigt. Une bulle fait dix pixels et elle bouge sans arrêt : la toucher tenait de la chance, et le journal du rapport le
montre — cinq touchers de suite sur le fond de la barre, pas un seul sur une bulle. Deux choses l'empêchaient. La cible
était douze fois trop petite pour un doigt. Et comme elle réagissait au survol, le premier toucher servait de survol pour
rien : il fallait toucher deux fois. Maintenant, un toucher à côté saisit la bulle la plus proche, et c'est bien la plus
proche du doigt qui est prise, pas celle qui se trouve au-dessus des autres. **À la souris, rien ne change.**
**Vérifié comment** : dix-neuf essais sur l'arbitrage, et six essais sur le vrai écran avec un vrai doigt simulé, dont
celui qui vérifie l'envers — sans doigt, la souris garde son geste. Dix mutations du code les font rougir. Vitest 500
fichiers / 5 529 verts. **Ce qui n'est PAS vérifié** : tout cela est mesuré sous Chromium, qui n'a pas les doigts de
Grégoire ; le conteneur n'a pas WebKit. **Le geste réel sur l'iPad Air reste dû.**
▣ **Ce que le travail a appris, et qui vaut d'être dit** : un des six essais était MENTEUR — il passait même quand on
cassait ce qu'il prétendait garder. C'est en essayant de le faire rougir qu'on l'a vu.

↻ **1.123.10 EN LIGNE** (build `0906-2017`, commit `cf73a83d`), emportée par le déploiement de 1.123.11 ci-dessus —
les deux lots de la soirée sont partis ensemble.
**Ce qui change pour quelqu'un qui planifie sur iPad** : pincer pour agrandir ou réduire la carte d'alignement (Conception) ne
devrait plus accrocher. Trois choses se battaient dans ce geste. Deux mécanismes de zoom tournaient en même temps sur le même
pincement — l'un recentrait sur le milieu de l'écran, l'autre sur l'endroit pincé — et se contredisaient à chaque image. Chacun
refaisait la mise en page de toute la carte, dix mille pixels sur six mille, à chaque instant du geste. Et au trackpad, le zoom
avançait par bonds de 5 % au rythme des signaux reçus plutôt qu'à l'ampleur du geste. Le pincement se comporte maintenant comme
celui d'Annoter et d'Évaluer, qui n'avait aucun de ces trois défauts. **Un changement visible à annoncer** : le zoom se recentre
désormais sur le point pincé, plus sur le centre de l'écran.
**Vérifié comment** : une sentinelle neuve de 31 essais qui tient l'arithmétique du geste — le point de carte sous les doigts ne
bouge pas, pendant le pincement comme après —, l'exclusion des deux mécanismes, et l'absence de remise en page dans la boucle ;
quatre mutations du code la font rougir, deux de plus pour la sentinelle voisine qui garde les bornes de zoom ; Vitest 499 fichiers
/ 5 510 verts. **Ce qui n'est PAS vérifié, et c'est l'essentiel ici** : rien de tout cela ne dit que c'est FLUIDE. Le conteneur n'a
pas WebKit, Playwright n'a pas de doigt, et aucun banc ici ne mesure une image par seconde. **Le geste réel sur l'iPad Air est le
seul juge**, et il reste dû. **Une supposition, à démentir si elle est fausse** : « les zoom in et out » a été lu comme le
pincement à deux doigts, pas comme les boutons + et −. Si c'était les boutons, le lot est à reprendre.

↻ **6 septembre 2026, 16 h 15 (Claude Code) — 1.123.9 EN LIGNE** (build `0906-1458`, `c09ca731` ; `main` = `origin/main`, arbre
propre ; poussée à 16 h 11, déploiement Netlify `ready` sur ce commit, vérifié par l'API — la page servie, elle, n'a pas pu être lue
d'ici, le proxy du conteneur refuse le domaine : le numéro en bas de page reste le geste qui tranche). **Ce qui change pour quelqu'un qui annote sur iPad** : le coin inférieur droit
d'une palette (Codes, Annotation, Tampons, Évaluer) se saisit enfin au doigt pour la redimensionner — il ne portait qu'un dessin, et
la vraie poignée était celle du navigateur, que Safari ne montre pas au toucher ; la taille choisie est retrouvée à la prochaine
ouverture, ce qui n'était jamais le cas. Et la palette mise en bandeau (↔) prend la hauteur de ce qu'elle contient au lieu des trois
cinquièmes de l'écran : sur la capture de Grégoire, dix codes tenaient en deux lignes et le vide couvrait la copie de l'élève.
**Vérifié comment** : deux specs sur le chemin réel de l'écran d'annotation (la vraie palette, le vrai bouton ↔), quatre break-tests
rouges dont deux croisés, une sentinelle statique de 8 cas, Vitest 498 fichiers / 5 479 verts. **Ce qui n'est PAS vérifié, et il faut
le lire** : tout cela est mesuré sous Chromium — le conteneur n'a pas WebKit, et Playwright n'a pas de doigt. **Le geste réel sur
l'iPad Air reste dû**, en usage normal, sans liste à cocher. Le seul rouge de la suite complète (277 passés, 1 échec) est un essai
déjà déclaré non-jugeant hors macOS : rejoué sur le commit d'avant, il rougit pareil.

↻ **5 septembre 2026, 13 h 51 (vingt-troisième passe, Cowork) — 1.120.0 EN LIGNE** (build `0905-1315`, `c4c7b04a`, poussée à
13 h 26 ; docs `7a40949b` à 13 h 28 ; `main` = `origin/main`, arbre propre, remesuré à 13 h 51). **Un seul lot, la carte
« Bilan »** (`1b06b1ba`) : dans un critère algorithmique, la carte « Observation » se titre « Bilan » et ne porte plus que les deux
phrases du bilan de l'élève et le menu du modèle, renommé « Modèle des phrases (bilan et décompte) » avec une ligne d'aide ;
« Aucune annotation », lue par l'enseignant seul, vit sous la case des codes dans un pli fermé « Quand la copie ne porte aucun
code » ; le modèle « Français écrit (formulations d'origine) » devient « Français écrit », description neuve — **le « #581 » que
les collègues lisaient depuis deux livraisons est parti** (`evaluation-enonces.js:247-248`, mots arrêtés par Grégoire à 11 h 41).
Aucune donnée ne change. **Vérifié comment** : relecture de Cowork sur le commit du lot (plus aucun « Observation » dans
`grilles.js`, `aucune` rendu une fois sous la case, diff nul sur `import-export.js`, `partage-schemas.js`,
`evaluation-projection.js`, deux lignes sur `evaluation-enonces.js`) ; sentinelle neuve `sentinelle-carte-bilan.test.js` (17 tests,
cinq break-tests rouges puis remis) ; Vitest 5 202 verts ; verdict Playwright local vert sur le commit de release ; coup d'œil de
Grégoire sur la carte, le menu et le pli — la ligne d'aide gardée telle quelle, les mots du changelog validés (« ça va »).
Deux tests de plus que le grep de la consigne ne voyait nommaient la carte sans ses mots (`texte-troue-reperes-enonces.spec.js`,
`lot4-gabarit-algo-cartes.spec.js` l. 160 et 182) : adaptés par Claude Code, dit dans son rapport.
▣ **Ouvert après ce jour, rien de daté** : la synthèse des rétroactions dans le PDF (nommée à 11 h 35, pas cadrée —
**mesurée le 6 septembre au matin**, rapport `Rapports/MESURE-ce-que-l-eleve-lit-dans-le-pdf-2026-09-06.md` : trois documents,
sept blocs, même squelette pour les trois types de grille, et deux textes faux que l'élève lisait dans le collage Léa — « 63.5 %% »,
et un bilan qui prenait la copie pour sa propre précédente — **corrigés le matin même sur arbitrage de Grégoire, 1.123.1** :
la ligne « Note finale » porte l'unité une fois, et le bilan copié lit l'historique comme le PDF le fait déjà (le progrès revient,
« depuis 3 productions » ne se dit plus après deux). **Vérifié comment** : deux sentinelles rouges avant / vertes après, break-testées
avec témoin ; le banc de mesure repassé aux valeurs d'après ; Vitest 486 fichiers / 5 411 ; verdict Playwright local au jeton avant le
push. Deux défauts de forme restent inscrits, pas corrigés : le collage Léa sans sauts de ligne, et le bloc « Observations » qui ne
s'écrit jamais (#759, #760)) ; recueillir ce
qui sortira du 14 (un gabarit et un canal — le canal est la décision de Grégoire ; personne ne l'a pris). Après le 14 : le recalcul
quand une échelle change, l'Inspecteur de sélection, le dépôt public.

↻ **5 septembre 2026, 11 h 16 (vingt-deuxième passe, Cowork) — 1.119.0 EN LIGNE** (build `0905-1053`, `f2fa5a2e`, poussée à
11 h 04, verdict Playwright local vert ; `main` = `origin/main`, arbre propre). **La journée du 5, livrée d'un coup, quatre
lots** : (A) une seule liste pour les sous-critères et les codes — la carte « Codes d'annotation » disparaît ; (B) les
collections de paramètres de projection — « Enregistrer ces paliers sous un nom… », « Mes collections » au menu, la COPIE
(décision de Grégoire), clé `collectionsProjection` namespacée, module `collections-projection.js` ; (D) le texte troué,
étape 3 — le badge s'affiche comme une pastille dans la phrase (`composeur-badges.js`, le `<textarea>` reste la valeur),
voulu par Grégoire aujourd'hui plutôt qu'après le 14 ; (C) les mêmes gestes partout — corbeille, chevrons, empilement iPad
sous 768 px. **Vérifié comment** : relecture croisée de Cowork sur B et D (rien à corriger), A et C au jugement de Claude
Code ; coups d'œil de Grégoire sur A, B, C ; **porte terrain iPad sur D passée 4/4** sur un aperçu de PR (`deploy-preview-82`,
option B, `netlify.toml` l. 29-31) — ⌫ retire la pastille d'un coup, la croix reste, pas de glissé ; une retouche née de la
porte (le curseur hors du cadre après une pastille terminale, `74e52ef8`) vue réglée par lui. Vitest 5 185 verts.
▣ **Ouvert après ce jour** : ~~l'étape 4 du texte troué~~ **abandonnée par Grégoire à 11 h 35** après un inventaire mesuré
(`INVENTAIRE-2026-09-05-badges-inventes.md`) — le prochain accent, non daté, est la synthèse des rétroactions dans le PDF ; la carte « Bilan » (cadrage du matin, avec le
« #581 » toujours en ligne dans la description du modèle « Français écrit », `evaluation-enonces.js:248`) ; rien ne prévoit
encore comment on recueille ce qui sortira du 14.

↻ **5 septembre 2026, 8 h 01 (vingt-et-unième passe, Cowork) — 1.118.0 EN LIGNE** (build `0905-0744`, `d6c4b3fc`,
poussée, verdict Playwright vert ; `origin/main` = `main`). Le texte troué, étape 2 : les paliers de projection se
composent avec des badges, et **une seule carte « Ce que l'élève lit »** (décompte, verdict, recommandation, lue de
haut en bas ; ligne « L'élève lira : » en gris ce qui est engendré, dans l'encre ce qu'on a écrit). Vérifié comment :
relecture croisée de Cowork sur les quatre commits du matin (`7ff78ced`, `91195f33`, `65ae6884`, `23bf5350`), trois
coups d'œil de Grégoire (l'aperçu, la composition, la carte fondue : « c'est bien »). Décisions de Grégoire du matin :
« Verdict » et « Recommandation (facultative) » ; fondre le décompte et les paliers en un seul endroit d'écriture ;
« Observation » → « Bilan » (inscrit, `CADRAGE-2026-09-05-carte-bilan.md`, pas dans 1.119). ⚠ Parti avec 1.118 : la
description du modèle « Français écrit » dit encore « #581 » aux collègues (dans le cadrage Bilan). **En cours** :
le lot A du 5 (une seule liste sous-critères + codes), `CONSIGNE-DU-JOUR.md` promue par Claude Code.

↻ **4 septembre 2026, 19 h 14 (vingtième passe, Cowork) — 1.118 codée, pas livrée.** Le texte troué, étape 2
(les paliers de projection se composent avec des badges) est sur `main` en local, cinq commits d'avance non
poussés (`2d9baafc` → `dccaf3d2`), carte relue, relecture croisée sans réserve, coup d'œil de Grégoire fait :
les phrases sont naturelles, l'aperçu change de place (sous chaque palier, retouche relayée à 18 h 40). Décisions
de Grégoire (17 h 15) : les huit badges (`service` `seuil` `longueur` · `erreurs` `mots` `moyenne` `projection`
`palier`) ; le préfixe engendré devient le badge `moyenne`. **Le matin du 5** : retouche relue, coup d'œil,
changelog, release 1.118, push ; puis la journée du 5 (`plans de travail/CONSIGNE-2026-09-05.md`) : fusion des
listes du gabarit · collections de paramètres · les mêmes gestes partout, **une seule livraison, 1.119**.
▣ Mesuré ce soir : **les codes par grille sont livrés depuis le 3** (`js/codes-annotation.js`) ; ce qui reste est
la fusion des deux rendus. En ligne, toujours **1.117.1**.

**Dernière mise à jour : 4 septembre 2026, 16 h 30 (dix-neuvième passe, Cowork) — release **1.117.1**
(build `0904-1507`, `e990e710`) en ligne : le lot 4 (gabarit algorithmique rangé, paliers d'une grille
analytique, « Aucun » au menu SOLO) et le mot « observation ». La CI rouge du matin (spec du lot 1) est
réglée ; celle de 1.117.0 (trois specs, clics lents sur le serveur) aussi ; le run de 1.117.1 est vert. Avant : 1.116.0 (build `0904-0729`), 4 septembre 10 h 20. ▣ **LES HUIT ÉNONCÉS TIENNENT.**

⚠ **Ce que « tiennent » veut dire, et ce que ça ne veut pas dire.** Chaque volet a sa
commande et son témoin ci-dessous. **Les quatre écrans ont été lus par Grégoire
lui-même**, à l'écran. Le dernier — la suppression définitive d'une copie d'élève — le
3 septembre au matin, dans la corbeille.

---

## La règle de lecture

Quatre états. Le quatrième a été ajouté le 1er septembre au soir, parce que trois
mentaient dans les deux sens :

- **Fait** : vérifié, et la façon de le vérifier est écrite à côté. ↻ **Depuis le
  1er septembre, la phrase porte LA COMMANDE**, pas seulement la méthode (règle 1
  de `PROTOCOLE.md`) : « des tests » est invérifiable, une commande se rejoue.
- **Éprouvé par Grégoire** : il a parcouru l'écran lui-même, en écrivant ses
  chroniques Labo Codex, et ça marchait. C'est la meilleure preuve qui existe, et
  elle a une portée : c'est l'AUTEUR qui a mesuré, sur SES données et SES réglages.
  Ce qu'un débutant rencontre par un autre chemin reste à voir.
- **Pas fait** : on sait ce qui cloche, et c'est nommé.
- **Jamais vérifié** : personne n'a regardé. **Ce n'est pas « probablement
  correct ».** C'est la confusion qui a coûté le plus cher dans ce projet.

---

## Le compte du jour : 5 faits, 3 éprouvés par Grégoire, 0 pas fait, 0 jamais vérifié

---

## FAIT

### On sait par où les gens entrent — et il n'y a plus qu'une porte
L'application était servie à **deux** adresses `.netlify.app` en plus de la
sienne, complètes et sans aucune authentification. Netlify comptait ces
visiteurs, Cloudflare Access ne les voyait jamais : c'est tout l'écart entre
« 17 » et « 0 ». Les deux redirigent maintenant vers `app.codexnumeris.org`.
**Vérifié comment** : après déploiement, `curl -sI https://codexnumeris-051225.netlify.app/`
rend **301** et `location: https://app.codexnumeris.org/` ; idem sur
`main--codexnumeris-051225.netlify.app` ; `/index.html` conserve son chemin.
**Témoin** : `app.codexnumeris.org` rend toujours **403** (Cloudflare), donc la
porte principale n'a pas été cassée et il n'y a pas de boucle.
⚠ **Ce que ça ne règle pas** : on ne sait toujours pas COMBIEN ils sont, ni qui.
La redirection ferme la porte, elle ne compte pas rétroactivement.
⚠ **Et l'annonce n'atteint pas sa cible** : le changelog s'affiche dans
l'application, donc derrière la porte. Quelqu'un qui a un signet `.netlify.app`
verra l'écran de code AVANT de pouvoir le lire. Le doublage (courriel, blog)
reste à faire. *(geste de Grégoire)*

### Importer des productions, et savoir ce qui se passe quand ça rate
Un import lancé sans groupe-cours actif est refusé, et le refus est dit. Un
fichier dont le numéro d'élève n'existe pas dans le groupe apparaît maintenant
dans la liste au lieu de disparaître sans trace.
**Vérifié comment** : quatre tests automatiques qui rejouent les quatre cas, plus
une relecture du rendu à l'écran (les tests seuls ne voient pas les couleurs).
**Reste** : l'essai à la main de Grégoire, pour juger l'écran réel. *(#612)*

### Une grille partagée arrive complète chez le destinataire
Les sous-critères, leurs rétroactions et les réglages de projection voyagent
maintenant avec la grille. L'évaluation du destinataire ne bascule plus de mode
à son insu.
**Vérifié comment** : tests automatiques sur le transport —
`cd tests && npm run test:unit` (433 fichiers / 4638 tests, code 0). *(#669)*

### Une rétroaction ne parle que de la discipline de celui qui l'écrit
↻ **Descendue de FAIT à PAS FAIT le 2 septembre à 11 h.** Ce n'est pas une
régression : la ligne était classée « fait » sur la première moitié de l'énoncé
seulement, et la seconde n'a jamais été livrée. **C'est le classement qui mentait,
pas le code.**

**Ce qui est livré, et en ligne** — quatre versions le 2 septembre, un seul fil :

- Le mot « français » ne s'imprime plus dans le PDF d'un élève dont le critère
  s'appelle autrement ; les quatre phrases engendrées se règlent depuis le gabarit
  de la grille et voyagent avec elle quand on la partage. *(1.108.0, #581)*
- Les modèles de pratique nommés « Chimie », « Géographie », « Philosophie »,
  « Comptabilité » ne sont plus offerts, et les modes de calcul perdent leur
  parenthèse disciplinaire. *(1.109.0, #687)*
- Le modèle sommatif cesse de reproduire la pratique de son auteur : sa
  configuration était un cours de littérature. *(1.109.1)*
- Ses quatre évaluations passent à **parts égales, 25 % chacune** — une pondération
  est une position pédagogique, pas un point de départ. `20/20/30/30` mettait 60 %
  du poids sur les examens, servi comme départ à des programmes où les examens sont
  minoritaires ou absents. *(1.109.2)*

**Vérifié comment** : `cd tests && npm run test:unit` rend **435 fichiers / 4701
tests, code 0** ; sentinelle #687 à **27 cas**, break-testée 4 fois, dont la
mutation `20/20/30/30`. Les quatre points de version mesurés PAR TÉMOIN :
`grep -rl '1\.109\.1' --include=*.js --include=*.json --include=*.html .` rend
**0** ; témoin du périmètre, `grep -rl '1\.109' .` rend **11** fichiers de prose
datée.
⮕ **Et Grégoire a regardé l'écran avant que ça parte** : Conception › Pratiques ›
« Partir d'un modèle » — cinq modèles fournis, aucun nommé par discipline.
⚠ **Une relecture croisée a rattrapé un trou avant l'envoi** : un critère nommé
« Maîtrise de la langue **française** » n'était pas reconnu et basculait en silence
sur le texte neutre. Le motif exigeait un non-alphabétique après « francais » ; la
forme fléchie échouait.

**La seconde phrase est livrée le 2 septembre à midi *(1.110.0)*, et elle attend
le regard de Grégoire :**

- **Plus aucune pratique offerte n'affiche de matière ni d'établissement.** Sept
  entrées de `js/pratiques/pratiques-predefines.js` déclaraient Chimie,
  Littérature, Mathématiques, Philosophie ou Biologie, et nommaient un cégep
  précis ; six identifiants et quatre constantes portaient un prénom de collègue.
  ⚠ **Mesure qui corrige la prémisse** : ce module n'est PAS celui que lit l'écran
  « Partir d'un modèle ». Ce dernier lit `MODELES_PRATIQUES_PREDEFINIS`
  (`js/pratiques-bibliotheque.js`), **déjà propre depuis #687**. Les sept entrées
  de `pratiques-predefines.js` n'ont pour lecteur vivant qu'un
  `Object.keys()` de `pratique-manager.js:159`, dans un test d'appartenance qui
  compare des NOMS DE CONSTANTES à des `id` — il ne matche jamais. Le renommage
  est donc sans effet observable, et c'est ce qui le rend gratuit. *(#690)*
  ⮕ ↻ **Contre-mesure de Cowork, 12 h 10 — il y a un SECOND lecteur mort, et il
  faut l'inscrire** : `pratique-manager.js:281`, `initialiserPratiquesPredefines()`,
  qui **écrirait ces sept pratiques dans la base d'un nouvel utilisateur**. Elle a
  **0 appelant** : `grep -rn "initialiserPratiquesPredefines" js/ index.html tests/`
  ne rend que sa définition. ▣ **Témoin** : sur le même objet,
  `migrerVersBibliotheque` en a 4, `obtenirPratiques` 9, `sauvegarderPratique` 26 —
  le zéro mesure donc quelque chose. **C'est un semis débranché, pas un semis
  absent** : il appartient au chantier « le matériel de départ cesse d'être semé ».
  *Inscrit, continué.*
  ⛔ **ET UNE ERREUR DE COWORK, À NE PAS REDÉCOUVRIR COMME UNE TROUVAILLE.** La
  passe de 11 h affirmait ici : *« six pratiques offertes à l'adoption… ce module
  est VIVANT, c'est ce que les gens peuvent prendre. »* **C'était faux.** Cowork
  avait conclu « vivant » d'un `grep` dont les résultats étaient des **commentaires
  JSDoc** (« Référence : PRATIQUE_… dans pratiques-predefines.js ») et une balise
  `<script>`. **Un fichier chargé n'est pas un fichier lu.** Troisième occurrence
  le 2 septembre de la même faute : *chercher un MOT là où il faut chercher une
  OFFRE.*
- **Les huit identifiants d'échelles disciplinaires sont retirés** de
  `IDS_GABARITS_HARDCODES` (`js/main.js`) et de la sonde
  (`js/echelles-bibliotheque.js`), et le commentaire périmé qui exigeait leur
  maintien est corrigé sur place. **Mesuré inerte** : le tombstone a quatre
  lecteurs, aucun ne les regarde, et le chemin d'import ne le consulte pas —
  `grep -rn "estRessourceSupprimee\|ressourcesSupprimees" js/import-export.js
  js/codex.js js/partage-section.js` rend **zéro** ; témoin du périmètre, la même
  commande sur `js/` rend **six**. *(#690)*
- **Le service d'aide cesse d'être servi à qui n'en a pas.** Six chaînes :
  les trois du plan de rattrapage (`pratique-sommative.js` l. 642/648/649) et les
  trois de `evaluation-projection.js` (l. 163 la phrase de l'élève, l. 211 le
  libellé du réglage, l. 213 le défaut). Mots arrêtés par Grégoire le 2 septembre
  à 11 h et 11 h 30 ; le tutoiement de la l. 163 reste, celui de l'élève, et les
  étiquettes de l'enseignant restent nominales. *(#539)*
- **Plus aucun nom de personne dans le code applicatif** : 86 occurrences avant,
  **5** après dans `js/` hors pack de démonstration, et aucune n'est un
  identifiant, une constante ni un libellé — quatre sont des commentaires, la
  cinquième est `js/config.js` (zone protégée, fiches fictives). *(#690)*

**Vérifié comment** : `cd tests && npm run test:unit` rend **436 fichiers / 4710
tests, code 0** (contre 435 / 4701 avant : la sentinelle neuve `#690`). Quatre
gardes break-testées : réintroduire `pan-standards-bruno` → rouge, une
`discipline` → rouge, un `etablissement` → rouge, « en français » dans le libellé
ou le défaut → rouge. Cas D de la sentinelle #464 **réorienté, pas désarmé** :
retirer `ECHELLE_IDME_DEPART` rougit, retirer `ECHELLE_BRUNO_CHIMIE` ne change
plus rien — les deux break-tests joués. **Témoin du geste 2** :
`grep -rn "CAF\|(SA)\|en français"` sur les deux fichiers passe de **9** à **3**,
et les trois restants sont les commentaires qui expliquent la transition CAF →
Passerelle + — un zéro ici aurait voulu dire que l'explication est partie avec le
défaut.

⚠ **TARIR N'EST PAS RÉPARER, et le stock est nommé** : un enseignant qui a déjà
inscrit son `nomServiceAide` porte sa valeur en base ; le changement de défaut ne
la touche pas, **et c'est voulu**. Les copies des huit échelles et des pratiques
adoptées restent elles aussi telles quelles. Rien n'a été écrit dans les données
de personne. *(#674)*

⚠ **Ce qui reste dû, et que Grégoire seul peut trancher** : la formule
« l'algorithme propose, le jugement tranche — Voisard »
(`js/pratiques/pratique-pan-standards.js:35`, `js/pratiques/denotation-saisie-ui.js:8`)
vient d'une **source publiée** — il l'a dit le 2 septembre. **La référence exacte
(auteur, œuvre, année) reste à fournir** ; les deux lignes sont laissées intactes
d'ici là, parce qu'effacer une attribution n'est pas de la protection.

**Fini quand** : un enseignant qui n'enseigne pas le français, et dont
l'établissement n'a ni CAF ni services adaptés, ne rencontre aucun de ces quatre
mots dans son interface — sauf s'il les a écrits lui-même.
⮕ **Ce qui reste avant de cocher, et ce n'est pas du code** : Grégoire doit
regarder DEUX écrans. Conception › Pratiques › « Partir d'un modèle » — aucune
pratique offerte n'affiche de matière. Et l'écran de réglages de la pratique
sommative — le nom du service d'aide est un champ qu'il peut remplir, avec
« Centre d'aide du collège » comme valeur de départ ; c'est là qu'il écrira
« Passerelle + » lui-même. **Ce réglage lui appartient : personne ne l'écrit à sa
place, ni dans le code, ni dans ses données.**

⚠ **Ce que ça ne réglera pas** : les évaluations DÉJÀ enregistrées gardent leur
texte gelé, et c'est voulu. On tarit la source, on ne réécrit pas ce qui est chez
les gens. Le mot reste aussi gravé dans les identifiants de champs du volet
confidentiel. *(#440 résiduel)*

↻ **PASSE À « FAIT » LE 2 SEPTEMBRE À 12 h 45.** Le code est en ligne (1.110.0), la suite
COMPLÈTE est verte, **et Grégoire a parcouru les deux écrans lui-même.**

**Vérifié comment, au complet :**
· `cd tests && npm test` — **436 fichiers / 4710 tests** ET **239 essais Playwright, 0 échec,
  0 instable, en 8,0 min**, sur `672e3c5f`. ⚠ **C'est le premier verdict NAVIGATEUR pris sur
  ce lot** : 1.110.0 était partie sans, le garde pré-push ne jugeant que Vitest.
· Sentinelle neuve `#690`, quatre gardes break-testées.
· ▣ **ÉPROUVÉ PAR GRÉGOIRE, sur ses vraies données, le 2 septembre** : Conception ›
  Pratiques › « Partir d'un modèle » affiche ce qui a été décidé ; et le champ « Nom du
  service d'aide » (Conception › Grilles de critères › critère algorithmique › Modèle de
  projection) tient ce qu'il y écrit.
  ⮕ **Et c'est LUI qui a trouvé, en le faisant, que le jeton s'écrit `{service}` avec des
  ACCOLADES** : il avait tapé `[service]`, que le code ne remplace jamais — l'élève aurait lu
  le crochet. **Aucun test ne voyait ça.** C'est la démonstration de ce que vaut un passage à
  l'écran.

### ⚠ LE DERNIER MOT DE L'ÉNONCÉ, QUE PERSONNE N'AVAIT MESURÉ : le SRPNF

L'énoncé en nomme quatre — SRPNF, EUF, CAF, littérature. Les trois derniers ont été traités ;
**le SRPNF ne l'avait jamais été.** Mesuré depuis Cowork le 2 septembre à 12 h 50 :

```bash
grep -rn "SRPNF" js/ --include=*.js
grep -c "copierCriteresSRPNF" index.html
```

▣ Un seul endroit l'affichait encore à un enseignant : `js/evaluation.js:3087`,
`notifications.succes('Copié', 'SRPNF copiés dans le presse-papiers')`, dans
`copierCriteresSRPNF()`.
▣ **Cette fonction n'a aucun appelant** : `grep -c` sur `index.html` rend **0**.
**Témoin** : au même test, `sauvegarderEvaluation` rend **2** et `supprimerEvaluation` **1**.
Le zéro mesure donc quelque chose. L'élément `criteresCopier` qu'elle lit n'est pas non plus
dans `index.html`.
⮕ **Le bouton n'existe plus ; la fonction est restée.** Personne ne voit cette notification.
· Les autres occurrences de SRPNF sont des noms de fonctions, des commentaires, une entrée de
  changelog, et `pratiques-predefines.js` — **le fichier mort** (voir plus haut).
⮕ **Inscrit comme code mort, PAS corrigé** — issue 2 de `CLAUDE.md`. Ça n'empêche aucun des
huit énoncés.

### Aucune note remise ne repose sur une pondération incomplète sans le dire
↻ **CORRIGÉ DANS LE DÉPÔT le 2 septembre 2026 en soirée — commité, NON poussé : il
attend ton coup d'œil (règle 6).** Pour qui utilise l'application en ligne, rien n'a
encore changé ; c'est pourquoi la ligne reste ici.

Ce que le défaut faisait, mesuré : il ne baissait pas la note, il la **montait**.
Grille 50/30/20, les trois critères renseignés → **84,0 %** (M) ; le critère à 20 %
sans niveau → **95,0 %** (E), sans un mot. Et une échelle dont les niveaux n'ont pas
de valeur (la forme des huit échelles disciplinaires retirées le 1er septembre, dont
les copies restent chez qui les avait adoptées) donnait **0,0 %** comme un résultat.

Ce qui change, en gestes :
- **À l'écran** : un critère sans niveau → la note et le niveau affichent « -- », et
  une ligne sous la note nomme le critère et son poids (« Pas de note tant qu'un
  critère est sans niveau — Langue (20 %). Sans lui, la note ne porterait que sur
  80 % de la grille. »). Renseigné, la note revient et la ligne disparaît. Une échelle
  muette est nommée de la même façon, avec quoi faire.
- **À l'enregistrement** (bouton Enregistrer, création ou modification) : refus
  nommé, et **le brouillon est conservé** (écrit sur-le-champ, non verrouillé, la
  note AVEC sa portée `ponderationCouverte` à côté de `noteFinale`) : la copie passe
  « Évalué » et reste exportable, son PDF dira qu'il ne conclut pas. ↻ Trouvé par
  Grégoire le 2 septembre à 17 h 53 : la première version du refus n'écrivait rien,
  et comme Enregistrer annule l'auto-save en attente, la copie restait « Importé »
  et l'export Léa rendait « aucune évaluation trouvée ». ↻↻ Et à 18 h 04, capture à
  l'appui, le second correctif n'avait rien changé : dans « Annoter et évaluer »,
  `evaluationEnCours` désigne DEUX objets (constat #646), les niveaux vont dans l'un
  et l'auto-save lit l'autre — il rendait la main sans écrire. Corrigé en soirée par
  un instantané qui prend les critères là où ils sont ; **prouvé par un banc Playwright
  qui rejoue ta séquence exacte** (rouge avant, vert après).
  ⚠ Ce banc a mesuré au passage que **l'auto-save débouncé n'écrit AUCUN brouillon dans
  ce flux** — depuis avant ce lot. C'est #646, pas #674 ; inscrit, pas corrigé.
- ⚠⚠ **À 18 h 50, ta comparaison de trois captures a mené à la trouvaille la plus lourde
  de la journée** : quatre des cinq critères de « Grille-5 FR-ALGO A26 » n'ont **aucun
  identifiant** (sonde, lecture seule). L'éditeur de grille en lignes les créait ainsi
  (tari le soir même) ; l'écran d'évaluation, lui, les confond en UN seul : le niveau
  choisi sur Rigueur, Plausibilité ou Nuance était lu sur Structure, et **n'a jamais été
  enregistré**. ↻ Précisé par toi à 19 h 30 : l'évaluation de Daniel était un test et
  **aucune autre évaluation n'utilise encore cette grille** — rien n'est perdu. Avant les
  vraies évaluations : donner un identifiant à ses quatre critères. ↻ **Fait par toi à
  19 h 45** (critères supprimés et recréés dans l'éditeur : « tout fonctionne »). Pour
  les autres enseignants, dont l'éditeur a pu créer les mêmes grilles depuis octobre
  2025, une réparation automatique est **à décider à froid**. Détail dans la consigne.
- **Sur le PDF de l'élève** : pas de bandeau « Niveau général » ; à sa place, la
  phrase que tu as arrêtée le 2 septembre en soirée : « Cette copie n’a pas de niveau
  général : Langue (20 %) reste à évaluer. » L'export te le dit avant la remise.
- **Rétroactif** : les évaluations déjà en base sont relues depuis leurs critères,
  leur grille et leur échelle — les copies muettes d'avant sont vues.

**Vérifié comment** (depuis `tests/`) :
`npx vitest run unit/sentinelle-674-la-note-dit-sur-quoi-elle-porte.test.js` rejoue
le cas 50/30/20 sur la fonction réelle — 10 cas, dont B (« 95.0 % » attendu « -- »)
et C (« 0.0 % » attendu « -- ») **rouges avant le correctif**, verts après ;
`npx vitest run unit/sentinelle-674-les-portes-refusent-l-incomplet.test.js` — 15 cas
(les deux portes, l'auto-save, le PDF, l'échappement) ;
`npx vitest run unit/sentinelle-674-la-portee-accompagne-la-note.test.js` — périmètre
DÉDUIT de `js/` (4 chemins trouvés, aucun sans portée, break-test intégré) ;
`npx playwright test integration/triptyque-seme-produit-une-note.spec.js` — 4 essais
WebKit, dont le geste ci-dessous. Break-tests par mutation : portée retirée d'un
chemin → 1 rouge ; porte retirée → 5 ; règle forcée à « complète » → 12 ; rendu qui
conclut quand même → 3 ; restauration vérifiée par empreinte.
Suite complète (`cd tests && npm test`) : Vitest **440 f. / 4753 t.** ; Playwright
**240 passés, 0 échoué, 0 instable, 7,9 min** en local — le verdict au jeton se prend
après ton coup d'œil, avant le push.

⮕ **Ce que tu dois aller voir** : Travaux → ouvrir une copie → laisser un critère
sans niveau. La note doit afficher « -- » et la ligne sous elle nommer le critère.
Cliquer Enregistrer : refus nommé. Donner le niveau : la note revient, plus un mot.
*(#674)*

↻ **CLOS PAR GRÉGOIRE le 2 septembre 2026, tard.** Ses mots : *« L'item "Aucune note remise
ne repose sur une pondération incomplète sans le dire" est clos. »*

↻ **POUSSÉ le 2 septembre au soir — `9fe13749..1402a17c`, release 1.111.0.** Le hook a relancé
Vitest (vert) et lu le jeton (« verdict vert à jour pour ce commit »). ▣ **L'énoncé est donc vrai
pour les utilisateurs**, et non plus seulement dans le dépôt.
⏳ **Reste à confirmer, et ce n'est pas cet énoncé-ci** : que la version affichée dans
l'application passe bien à **1.111.0** après le déploiement Netlify. C'est l'énoncé 7, et il se
vérifie d'un coup d'œil au bandeau.

**Vérifié comment :**
· **Reproduit en ROUGE avant de toucher au code**, sur le vrai `calculerNote()` : le cas 50/30/20
  rendait **95,0 %** quand le critère à 20 % perdait son niveau (84,0 % avec les trois), et une
  échelle muette rendait **0,0 %** comme un résultat. **Puis vert après.** 10 cas.
· Portes, auto-save, PDF, échappement : 15 cas verts.
· **Sentinelle au périmètre DÉDUIT de tout `js/`** — quatre chemins d'écriture trouvés, aucun sans
  sa portée. ▣ C'est la leçon du lot #572 du même jour, appliquée : **pas une liste de fichiers
  tapée à la main.**
· **Quatre break-tests par mutation** : 1, 5, 12 et 3 cas rouges, restauration vérifiée par empreinte.
· `Vitest` **441 fichiers / 4760 tests** · `Playwright` local **240 passés, 0 échoué, 0 instable**.
· ▣ **ÉPROUVÉ PAR GRÉGOIRE, à l'écran** : le refus nommé, le brouillon conservé, le PDF portant sa
  phrase, et sa propre grille réparée au passage.

**Ce que ça donne, en gestes :**
· **À l'écran** — un critère sans niveau (ou dont le niveau n'a pas de valeur dans l'échelle)
  **retient** la note et le niveau (« -- »), et une ligne dessous **nomme** le critère, son poids
  et quoi faire. Renseigné : la note revient, la ligne disparaît.
· **À l'enregistrement** — refus nommé, rien n'est écrit. ⚠ **L'auto-save continue d'écrire
  pendant la saisie**, la note avec sa portée : le brouillon n'est jamais perdu.
· **Sur le PDF de l'élève** — pas de bandeau « Niveau général », et une phrase nomme les critères
  en attente. ↻ **Les mots sont ceux de Grégoire**, choisis le 2 septembre parmi trois
  propositions (variante C, augmentée) : *« Cette copie n'a pas de note ni de niveau général :
  Langue (20 %) reste à évaluer. »* ▣ **Motif du choix** : « Évaluation incomplète » aurait pu se
  lire comme *le travail de l'élève* qui serait incomplet. **« Reste à évaluer » dit à qui revient
  le geste.**
· **Rétroactif** — les évaluations déjà en base sont relues depuis leurs critères, leur grille et
  leur échelle. ▣ **C'est la propriété qui avait écarté l'état « brouillon / conclue »** : elle
  seule répare l'existant.

⚠⚠ **LE TROU QUE CE LOT A NOMMÉ, ET C'EST LA LEÇON DE LA JOURNÉE.** La suite était **verte —
441 fichiers, 4760 tests — avec DEUX vrais défauts dedans** : le brouillon perdu au refus, et des
critères créés sans identifiant. ▣ **Aucun test ne les a vus. C'est le regard de Grégoire à
l'écran qui les a trouvés.**
⮕ **Quatrième occurrence du même motif le 2 septembre** : un vert qui ne prouve pas ce qu'on croit
(la CI rouge que personne ne lisait · la sentinelle #572 qui regardait deux fichiers sur trois ·
trois outils de poste plus permissifs que le serveur · et maintenant 4760 tests verts sur deux
défauts réels).
⮕ **C'est l'argument le plus fort en faveur de la règle 6** — *chaque lot se termine par un geste
à vérifier à l'écran, pas par un rapport.* Elle n'est pas une politesse : elle a attrapé
aujourd'hui ce que toute la machinerie a manqué.

⏳ **Trois trouvailles inscrites, PAS corrigées** : le portfolio et la liste des évaluations ne
lisent pas encore la portée ; l'export unitaire ignorait déjà la raison de #565 ; un repli mort
dans `calculerNote` contredit #527, sans effet en production.

⏳ **Et une décision qui reste à Grégoire** : la réparation automatique des grilles des AUTRES
enseignants — l'éditeur créait des critères sans identifiant depuis octobre 2025. **C'est une
écriture dans les données de quelqu'un.**

### Ce qu'un utilisateur détruit, il l'a voulu ; ce qu'il garde, il le retrouve
↻ **CLOS le 3 septembre 2026 au matin.** Quatre volets, trois versions : **1.111.1**
(cartouches), **1.111.2** (copie d'élève + vocabulaire), **1.112.0** (échelle).

▣ **La règle, tranchée par Grégoire le 2 septembre** : supprimer définitivement la copie d'un
élève emporte **tout ce qui touche le couple** (cet élève, cette production) — originale,
reprises, évaluation d'un fichier réimporté. **Le code le faisait déjà ; l'écran ne le disait
pas.** Le constat B5 de l'audit du 25 août, qui décrivait cette portée comme « trop large », est
donc **REFUSÉ** : elle ne l'est pas.

**Ce que chaque écran dit maintenant, et comment on le sait :**

· **La copie d'un élève** — « Le fichier, ses annotations et toutes les évaluations de cet élève
pour cette production seront effacés. » ↻ **Les mots sont ceux de Grégoire**, choisis le
2 septembre à 21 h 45 parmi trois propositions. Un seul prédicat décide de ce qui est annoncé
et de ce qui est détruit — deux prédicats auraient pu diverger sans qu'aucun test ne le voie.
**Vérifié comment** : sentinelle #560, 8 essais. ▣ **ÉPROUVÉ PAR GRÉGOIRE le 3 septembre au
matin**, à l'écran, dans la corbeille — sa phrase s'affiche mot pour mot. ⮕ **Et le témoin
négatif tient** : le déplacement à la corbeille, qui ne détruit rien, continue de dire « le
fichier pourra être restauré pendant 30 jours » et rien de plus.

· **La cartouche** — les quatre chemins vivants disent leur portée, mesurée au moment où ils
parlent. Celui de la liste, que Grégoire avait sous les yeux, disait « Es-tu sûr ? » et rien
d'autre ; il nomme maintenant la grille, ce qui survit, et l'irréversibilité.
**Vérifié comment** : sentinelle #647, 21 essais ; et **Grégoire a lu l'écran** — c'est même sa
capture qui a montré qu'un des chemins ne nommait pas sa grille, ce que ni les essais ni la
relecture du code n'avaient vu.

· **L'échelle** — « Supprimer l'échelle «X», c'est la remplacer : N évaluations, N productions…
suivront. Par quelle échelle la remplacer ? » ↻ **Décision de Grégoire, 3 septembre** :
*« On supprime une échelle pour la remplacer par une autre. Une évaluation ne tient pas s'il n'y
a pas d'échelle. »* Un seul cœur pour les cinq chemins ; refus nommé si le trimestre est
archivé ; ne propose que les successeurs aux mêmes codes de niveaux.
**Vérifié comment** : sentinelle #648, 18 essais, vraie fonction chargée en bac à sable ;
`grep "^async function supprimerEchelle" js/` rend 6 chemins, dont 5 passent par
`supprimerOuRemplacerEchelle` et le 6e ne touche que la Bibliothèque. **Grégoire a lu l'écran**
sur son échelle « 0-IDME » (28 évaluations, 10 productions, 1 pratique, 6 cartouches).
▣ **Relecture croisée de Cowork (règle 2)** : l'ordre est sûr — compte, refus, question,
**puis** écriture. Rien n'est touché avant que l'utilisateur ait vu le chiffre.

· **Un aiguillage mort** dans la suppression d'une production — `typeof
retirerProductionDeLaBibliotheque === 'function'` gardait une fonction jamais déclarée.
**Vérifié comment** : `grep -rn` rendait **2** occurrences (le garde et son appel), contre **5**
pour la fonction sœur `retirerPratiqueDeLaBibliotheque` — témoin que le motif trouve ce qui
existe. Retiré ; sentinelle #649, 105 lignes.

⏳ **Inscrit, PAS corrigé** *(issue 2)* :
· Le compte « N évaluation(s) l'emploient » d'une cartouche ne regarde que **le trimestre
courant**, alors que la Bibliothèque est commune à tous. La phrase omet, elle n'invente pas.
· Le remplacement d'une échelle **n'est pas atomique** : six écritures indépendantes. En cas
d'échec partiel, l'ancienne échelle survit et relancer le geste termine la migration — **mais
l'écran ne le dit pas.**
· `verifierDependancesEchelle` ne connaissait pas de marqueur « terminé » : **le refus porte sur
l'archivage seul**, faute d'un critère mesurable.

⚠ **Ce que le lot n'a PAS fait, et c'est un chantier ouvert** : **corriger** une échelle sans la
supprimer, avec **recalcul proposé, jamais automatique**. Décision de Grégoire le 3 septembre :
*« Il permet d'informer l'utilisateur des conséquences de son geste. »* Cadré dans
`plans de travail/DECISION-2026-09-03-echelle-remplacement.md`. *(#647, #648, #649, #560)*

---

### Le numéro de version affiché correspond au code qui tourne
Sans ça, aucun rapport de bug n'est interprétable, ni le sien ni celui d'un
utilisateur.
**Vérifié comment** : tests sur le bandeau de version, et les quatre points de
vérité mesurés PAR TÉMOIN à la release **1.109.2** (build `0902-1006`) —
`grep -rl '1\.109\.1' --include=*.js --include=*.json --include=*.html .` rend
**0**. ⚠ Le témoin dit aussi son périmètre : sur tout le dépôt, `1.109` rend encore
**11** fichiers de prose datée.
⚠ **Fragile** : ça se re-périme à chaque release. Le 2 septembre, **quatre versions
se sont succédé en une matinée** — cette ligne a cité un numéro périmé entre
chacune.
⮕ Le bump est passé par `scripts/release.mjs`, qui écrit les quatre points de
façon atomique **et** bumpe les jetons anti-cache d'`index.html` (11 ce matin,
qu'il liste). Le danger reste le bump fait à la main, et lui seul. *(#665)*

---

## PAS FAIT

▣ **Rien.** Pour la première fois depuis que ce fichier existe, aucun des huit énoncés n'est
ouvert. Le dernier est monté dans FAIT le 3 septembre 2026 au matin.

⚠ **Ça ne veut pas dire que l'application est finie.** Ça veut dire que **la liste fermée de
huit gestes que Grégoire s'était donnée pour la cohorte 1 est parcourue**. Ce qui reste vit
dans `BACKLOG.md` et dans `plans de travail/`, et ne se compte pas ici.

---

## ÉPROUVÉ PAR GRÉGOIRE

↻ **Corrigé le 1er septembre au soir.** Ces deux gestes étaient inscrits « jamais
vérifié ». C'était faux : Grégoire les a parcourus lui-même en écrivant les
chroniques Labo Codex, et il a vérifié à chaque fois que tout fonctionnait.
Le dépôt n'en portait aucune trace, et une session qui ne lit que le dépôt conclut
« personne n'a regardé ». **La trace manquait, pas la vérification.**

### Créer un trimestre, créer un groupe-cours, prendre les présences
**Éprouvé** par Grégoire, chronique 1.
**Ce qui reste sous cet écran** : des fenêtres d'alerte bloquantes sur ce parcours
exact. Il les a traversées sans être arrêté ; un débutant les lira autrement.
*(#678)*

### Créer une grille, une échelle, une cartouche
**Éprouvé** par Grégoire, chronique 2, avec SES grilles et SES échelles.
**Ce qui restait sous cet écran, et qu'il n'a pas pu rencontrer** : les huit
échelles « disciplinaires » de la bibliothèque (Chimie, Bio, Philo, Info, Géo…)
donnaient **zéro à la première évaluation, en silence**. Il ne s'en sert pas ; un
enseignant de chimie qui ouvrait la bibliothèque, lui, tombait dessus au premier
geste. *(mesuré le 1er septembre, plan du semis §1)*

↻ **Traité le 1er septembre en fin d'après-midi — et il faut lire ce que ça
couvre exactement.**
· ✅ **La source est tarie** : le versement des huit échelles est retiré, avec ses
  définitions et son appel. **Un nouvel enseignant ne les recevra jamais.**
· ✅ **L'échelle manquante est semée** : `ECHELLE_IDME_DEPART`, avec ses quatre
  `valeurCalcul`, modifiable et supprimable. Mesuré de bout en bout sous WebKit —
  espace vide, grille générique + échelle semée, « Maîtrisé » coché : **79,5 %,
  niveau M**. Le triptyque est complet et il calcule.
· ✅ **L'écran ne ment plus sur ce qu'il attend** : le texte d'attente nomme ses
  trois pièces, et choisir une grille sans échelle DIT ce qui manque.
· ✅ **L'autre source de matériel fictif est tarie aussi** : le module
  `js/spe-specifications.js` resemait **cinq** objets `[SPE]` signés « Labo Codex »
  à CHAQUE ouverture de la page — c'est pourquoi ils revenaient après chaque
  suppression. 1009 lignes retirées, zéro consommateur vivant, mesuré sur 24
  symboles. ⚠ **La pratique de notation par spécifications, elle, est intacte**, et
  une assertion la garde contre un futur retrait « de cohérence ». *(#681)*
  ⮕ **VÉRIFIÉ À L'ÉCRAN par Grégoire le 1er septembre** : les cinq gabarits
  supprimés depuis la bibliothèque, deux rechargements, **aucun retour**. Les
  sondes avaient d'abord mesuré zéro référence : rien de ce qui est parti ne
  portait la trace d'un jugement posé.
· ✅ **LES DEUX SONDES ONT TOURNÉ sur le corpus réel, le 1er septembre.**
  `_sonderEchellesDisciplinaires()` : **zéro partout** — bibliothèque, copies dans
  les trois trimestres, usages. Et le zéro porte son témoin : 3 trimestres et la
  bibliothèque partagée réellement lus. `nettoyage681()` : les cinq objets présents,
  **zéro référence, tous libres**, sur 15 clés ouvertes.
· ⏳ **CE QUI N'EST PAS RÉGLÉ, ET QUI A CHANGÉ DE NATURE CE SOIR.** Ce zéro ne
  couvre que le corpus de Grégoire. **Un enseignant qui a ouvert l'application
  avant aujourd'hui a pu ajouter l'échelle « Chimie » à sa sélection : sa copie
  reste muette et rend 0,0 % sans un mot.** Il n'est ni sondable, ni joignable, et
  **on ne sait pas combien ils sont** — le trafic n'est pas mesuré.
  ⮕ **#674 est le seul filet qui atteint ces gens-là.** Ce n'est plus une
  prévention pour la cohorte qui arrive : c'est une **réparation pour des
  utilisateurs déjà en place**, dont l'application ment aujourd'hui. Ça change son
  poids, pas seulement son rang.
↻ **1er septembre, tard — le §3 (« le matériel semé se dit utilisable ») est livré
dans le code et n'atteint personne.** Les trois pièces s'appellent maintenant
« Grille de départ », « Cartouche de départ », « Échelle de départ (IDME) »… **dans
un espace neuf seulement**. Sur une base qui porte déjà l'objet, le semis vérifie
l'identifiant et sort sans écrire : il ne recrée pas, donc **il ne renomme jamais**.
*(#682)*
⮕ ✅ **Réglé chez Grégoire le 1er septembre au soir** : il a tranché (b) — renommer
uniquement ce qui portait encore, au caractère près, un libellé écrit par le code.
**5 renommés, 0 nom personnel touché, 0 autre écriture**, vérifié par une relance de
la sonde. ⚠ **Mais chez les autres utilisateurs, rien n'a changé** : le renommage
est un script qu'il a lancé, pas une migration que l'application porte. Pour eux,
#682 est entier — et c'est encore « tarir n'est pas réparer ».
⮕ **La porte terrain du §3 est SUSPENDUE** : elle jugeait de libellés qui ne sont
pas arrivés, et elle envoyait dans un onglet « Matériel » qui n'existe pas. Le vrai
chemin est **Conception › Échelles de performance**.

↻ **Et la sonde a trouvé plus gros que le renommage** *(#683, ouvert)*. Deux
mécanismes, mesurés :
· **Changer de trimestre ne sème rien.** Le matériel de départ n'arrive qu'au
  chargement de la page. Un enseignant qui crée son second trimestre et va droit
  à l'évaluation n'y trouve rien, jusqu'à ce qu'il recharge — et rien ne le lui dit.
· **La suppression est par trimestre, l'interdiction est globale.** Supprimer la
  grille de départ dans un trimestre l'interdit dans TOUS, y compris ceux créés
  demain, pendant que les autres copies restent en place. ⮕ Ça touche aussi le
  geste 8 : la portée annoncée n'est pas la portée réelle. **Décision de Grégoire** :
  corriger changerait le sens de suppressions déjà faites.

⮕ Cette ligne reste donc « éprouvé par Grégoire » et ne devient pas « fait » :
ce qui a été mesuré, c'est la chaîne du NOUVEL utilisateur, pas le parcours
complet de l'énoncé 2.

---

↻ **Livré et éprouvé le 4 septembre 2026 — la grille déclare sa manière d'évaluer
(lot 1 des trois types de grille), en ligne dans 1.115.0, build `0903-2103`.**
· ✅ **Un menu « Type de la grille »** à côté du nom : holistique, analytique ou
  algorithmique. **Chaque critère neuf en hérite** sans rien cocher ; le menu de
  chaque critère reste là pour déroger. Le type voyage au partage et à l'import.
· ✅ **Le menu dit ce qui est ENREGISTRÉ, pas ce qui est déduit** (retouche décidée
  par Grégoire le 4 septembre) : « Non précisé » sur toute grille d'avant, et une
  ligne dessous dit ce que ses critères sont — « Tes critères sont tous
  holistiques. » Pas de couleur pour porter l'information : l'orange veut déjà dire
  « avertissement », et « déduit » est l'état normal de toutes les grilles d'avant.
· ✅ **Le badge de composition continue de dire ce qui EST**, depuis les critères,
  jamais depuis la déclaration.
· ⛔ **Rien n'est écrit dans les grilles existantes.** Rien du calcul des notes.
**Vérifié comment** : Grégoire, à l'écran, trois passages — une grille d'avant ouvre
sur « Non précisé » avec sa ligne, choisir un type tait la ligne et revenir la ramène ;
une grille neuve en « Analytique » reçoit trois critères analytiques sans rien cocher,
et un passé en algorithmique fait basculer le badge à MIXTE. Relecture croisée de
Cowork sur `fa5d34d2` : rien à corriger. Verdict au jeton vert sur `1228837a`.
*(commits `a6187760`, `fa5d34d2`, `1228837a`)*

↻ **Lots 2 et 3 livrés le 4 septembre 2026 au matin — release 1.116.0 EN LIGNE (`6309111e`,
build `0904-0729`, poussée à 7 h 32 : `git rev-parse origin/main` = `7a197996`), jeton WebKit
local vert sur ce commit.**
⚠ **MAIS LA CI EST ROUGE** : run GitHub 33869215489, Vitest vert, Playwright 254 / 255 — le rouge
est le spec du **lot 1** (`type-grille-lot1.spec.js`), jamais jugé sur Linux (le run de 1.115 avait
été annulé). Hypothèse mesurée par Claude Code : course de rendu sur le runner ; rien corrigé, par
consigne. **C'est le premier geste de la prochaine séance** (consigne du jour, §2). Règle 7 : le
vert local n'a rien prouvé ici.
· ✅ **L'analytique se saisit en points** : un champ « sur 30 » au lieu du menu, 24 sur 30 fait
  80 % ; le champ vide dit « – », un vrai zéro se tape (lot 2 + retouche).
· ✅ **Le chiffre trouve son niveau par les bornes de l'échelle, et ce niveau ouvre la cartouche** ;
  le critère analytique entre dans l'évaluation enregistrée avec ses points ET son niveau déduit,
  sous le même nom que les niveaux du menu — dix-huit lecteurs (dépistage, profil, archives,
  bilan, PDF) le voient sans changer (lot 3).
· ✅ **L'élève ne lit que le chiffre** : « 24 / 30 » sur le PDF, dans le texte copié vers LÉA, et
  dans les DEUX bilans (celui de l'app et celui du PDF — deux implémentations, retouches 1 et 2) ;
  la légende I·D·M·E disparaît du PDF d'une grille entièrement analytique. Le bandeau « Niveau
  général » de la copie reste : c'est le niveau de la copie, pas d'un critère.
· ✅ **Rouvrir une copie dont le premier critère est analytique charge l'évaluation et montre le
  cadenas** — régression du lot 3 trouvée par Grégoire à l'écran, corrigée avant publication
  (retouche 3).
**Vérifié comment** : relecture croisée de Cowork sur chacun des cinq commits (`b4039828`,
`5b8bc6b0`, `44559804`, `f485ea34`, et le lot 2 `37660b76`), cartographie faite à `37660b76`
avant de lire le patch ; Claude Code : Vitest **455 fichiers / 4989 tests, code 0**, sentinelle
lot 3 **43 cas** dont les cas rouges avant chaque retouche, break-tests par mutation à chaque
lot (14 + 4 + 5 + 3), WebKit complet **260 / 260** au lot 3 puis 15 / 15 sur les specs
d'évaluation à chaque retouche ; le verdict au jeton se prend par `scripts/pousser.sh` sur le
commit poussé. ▣ **ÉPROUVÉ PAR GRÉGOIRE, à l'écran, le 4 septembre** : sa grille « Analyse
littéraire » (12 critères analytiques), une copie évaluée, le PDF produit — **et c'est son
regard qui a trouvé les trois retouches** (les niveaux encore nommés dans le PDF, le « 0 » qui se
lisait comme une valeur, la copie qui ne se rechargeait pas). Aucun test ne les avait vues.
⏳ **Inscrit, pas corrigé** : points sans niveau déductible (échelle à trous ou muette) — le
critère n'entre pas dans `criteres[]` alors que la note compte ses points ; assumé par un test,
à décider avec les paliers du lot 4.
↻ **Lot 4 livré le 4 septembre 2026 en après-midi — release 1.117.0 (`4e7a1b03`, 13 h 36) puis 1.117.1
(`e990e710`, build `0904-1507`, 15 h 07), EN LIGNE.** Ce que tu vois dans Conception › Grilles :
· ✅ **Le critère algorithmique s'ouvre sur ses sous-critères**, puis quatre cartes repliables (formule ouverte ;
  observation, projection, codes repliés) qui restent comme tu les as laissées pendant que tu tapes. « Modèle de
  rétroaction » s'appelle **« Modèle d'observation »** (ton mot, 1.117.1 ; « rétroaction » reste à la cartouche),
  « Norme externe (épreuve uniforme) » s'appelle « Projection à l'EUF ». Un critère algorithmique neuf naît
  **sans projection**.
· ✅ **Les paliers de projection tiennent sur deux rangées**, numérotés, le nom lisible en entier ; la note
  « Écris {service}… » une seule fois.
· ✅ **Une grille analytique attache sa cartouche à des paliers en %** : le champ dit « Paliers (bornes en %) »,
  l'échelle de départ est déjà choisie, les colonnes portent les bornes de TON échelle (« 65–74,99 % »). Rien de
  ce qui voyage ne change (relecture croisée de Cowork sur `0385eadb`).
· ✅ **« Aucun » en tête du menu « Niveau SOLO »** : le critère compte dans la note, le dépistage des fondations
  ne le surveille pas ; le tableau de bord le dit quand plus rien n'est surveillé.
· ✅ **Un seul geste pour supprimer (la corbeille) et un seul pour déplacer (les chevrons)** dans l'éditeur de
  grille, sous-critères compris ; « Description » s'appelle « Descripteur ».
**Vérifié comment** : trois coups d'œil de Grégoire à l'écran le 4 septembre (c'est son regard qui a demandé
les huit retouches, toutes livrées sauf les chevrons sur les paliers, auxquels il a renoncé après la mesure :
l'ordre d'un palier EST son seuil) ; relecture croisée de Cowork sur A, B, C (rien à corriger, trois réserves
inscrites) ; Claude Code : Vitest **458 fichiers / 5042 tests**, sentinelles A, B, C break-testées, jeton WebKit
local vert sur `e990e710` ; runs GitHub **33884692393** (CI du matin, vert), **33907151093** (correctif des
trois specs de 1.117.0, vert), **33910422885** (1.117.1, vert : Vitest et Playwright WebKit, 19 h 20 → 19 h 46 Z). `origin/main` = `fd2b4ce6`.
⏳ **Inscrit, pas corrigé** : les deux colonnes des paliers ne s'empilent pas sur iPad en portrait (le formulaire
de groupe-cours dont elles héritent non plus) ; le ✕ rouge et la pile « Ordre » survivent hors de l'éditeur de
grille ; « Description / Rétroaction » des codes attend la fusion des deux listes (cadrage codes par grille,
points 7-8). ⚠ **Ce qui a retenu la publication aujourd'hui** : l'attente des runs GitHub (35 min, annulés par
tout push) — décision du soir, FAITE (`fd2b4ce6`) : on n'attend plus un run pour pousser (`PROTOCOLE.md` règle 7), et la règle des clics de spec vit dans `docs/securite/TESTS-AUTOMATISES.md` §4 avec son témoin au rituel de fin. Mesuré : les pushs de docs ne déclenchent aucun run ; un run complet reste entre 26 et 36 min.
⮕ **Prochaine séance** : le texte troué, étape 2 — les paliers de projection se composent avec des badges.

---

## L'ÉVALUATION — ce que l'audit du 25 août a déjà réglé

C'est le morceau qui inquiète, et il est moins ouvert qu'il n'en a l'air.

Un audit de l'onglet Évaluations (les quatre sous-onglets, le PDF de rétroaction,
le design) a relevé **20 constats le 25 août**. ↻ **Remesuré le 2 septembre, et
écrit DANS le rapport** (`Rapports/AUDIT-evaluation-onglet-2026-08-25.md`, temps 1) :
**15 inscrits et livrés, 4 partiels, 1 refusé avec motif** (les tailles du PDF, ta
décision), plus la section « mineurs » — partielle elle aussi. Les 17 fiches sont
cochées au backlog ; **coché ne veut pas dire couvert**, c'est ce que le rapport dit
maintenant constat par constat. ⚠ Et vingt constats LUS, **zéro écran parcouru** :
un audit fermé n'est pas une section vérifiée (temps 3, pas fait).

**Le quatrième site est corrigé — et il t'attend** *(temps 2, 2 septembre après-midi,
non poussé)*. #572 disait « la valeur calculée est la source » et avait corrigé
trois sites ; **rouvrir une copie déjà corrigée et la réenregistrer** passait par un
quatrième (`js/evaluation.js`, chemin de modification) qui relisait l'écran.
**Reproduit sur le chemin réel avant de corriger** : `79,46` calculé → **`79,5`
stocké** (l'arrondi de l'affichage) ; écran « -- » (rendu différé, #321) →
**`0` stocké** par-dessus la vraie note. Le second effet est réel, et c'est celui qui
départageait « arrondi bénin » et « zéro qui remplace une note ». Corrigé au même
patron que les trois sœurs ; la sentinelle #572 ne vérifie plus une liste tapée à la
main mais **tous les fichiers de `js/`, lus à chaque exécution** — c'est la leçon du
jour : elle était verte depuis le 29 août pendant que le défaut vivait.
**Vérifié comment** : test de reproduction en 3 cas (les 2 effets rouges avant, verts
après ; témoin que le chemin aboutit) ; break-tests : réintroduire la lecture d'écran
dans `evaluation.js` → rouge, l'introduire dans un fichier jamais listé → rouge ;
`grep -rn "parseFloat(.*noteProduction1" js/` rend **zéro**, et le témoin
`noteCalculeeCourante === 'number'` en rend **quatre**. Vitest 437 f. / 4715 t.
⮕ **Ce que tu dois aller voir** : ouvrir une copie que tu as déjà corrigée, ne rien
changer, réenregistrer, et vérifier que la note affichée est identique au centième.
⚠ **Ce que ça ne règle pas** : les quatre chemins écrivent toujours `0` quand la note
n'est pas calculable — c'est #674, l'énoncé 5, forme déjà tranchée (persister
`ponderationTotal`). Et les évaluations déjà enregistrées avec une note arrondie ou à
zéro gardent ce qu'elles portent : rien n'a été écrit dans tes données.
↻ **2 septembre en soirée** : les quatre chemins écrivent maintenant la portée à côté
de la note — voir le cinquième geste, plus bas.

**L'autre partiel qui t'attend** : la portée des suppressions par couple. Le garde a
été livré le 29 août, la règle métier non. C'est le geste 8 de cette page. *(#560)*

⚠ **Trois trous ont été découverts EN corrigeant**, et ils sont ouverts : neuf
fonctions définies deux fois sur `window`, 78 variables CSS fantômes, des clés de
session non préfixées. *(#587, #595, #596)*

⚠ **Ce que cet audit ne couvrait pas** : le calcul de la note lui-même. Il visait les
enregistrements, le PDF et le design. Le défaut mesuré le 1er septembre au soir (une
pondération incomplète qui affiche 0,0 %) n'est dans aucun des 20 constats. Un audit
propre ne dit rien de ce qu'il n'a pas regardé.

↻ **5 septembre 2026, 15 h 30 — le calcul de la note a été audité, et les trois trous qui pouvaient te faire écrire un chiffre faux sont fermés le jour même (1.121.0).** Rapport `Rapports/AUDIT-moteur-evaluation-2026-09-05.md` (huit flux, banc de 30 mesures exécutées), arbitré par toi : une échelle disparue ne fait plus enregistrer un zéro (l'enregistrement refuse et nomme l'échelle ; ton stock se MESURE avec `scripts/diagnostic-697-zeros-sans-echelle.js`, rien n'y est réparé) ; effacer les codes ou les mots d'un critère algorithmique efface aussi son résultat, la note bouge et le PDF ne dit plus « 0 erreur → 87,5 % » ; rouvrir une copie et changer un niveau : l'enregistrement automatique et le bilan lisent la même source que le calcul. Six constats inscrits (#700 à #706 : le trou entre deux bornes entières, « -- » en base, le type déclaré à la grille, zéro code, la grille rééditée, la pratique de notation qui compte les brouillons), à trancher après le 14 ou renvoyés au second audit. **Vérifié comment** : spec WebKit `evaluation-699-…` ROUGE avant le correctif dans le flux réel (base `c3 = I` sous 95) et verte après ; trois sentinelles (28 cas) break-testées, chaque fichier corrigé remis à HEAD → rouge, restauré à empreinte identique ; Vitest 473 fichiers verts depuis `tests/`. ⮕ **Ce que tu dois aller voir** : ouvre une copie dont la grille n'a pas d'échelle et clique Enregistrer → refus « Échelle introuvable » qui nomme l'échelle, rien d'écrit ; sur une copie avec des codes saisis, efface-les → la note bouge tout de suite et le PDF ne dit plus « 0 erreur ».

▣ **ÉPROUVÉ PAR GRÉGOIRE, à l'écran, le 5 septembre en fin d'après-midi** : les trois gestes laissés par Claude Code — la copie dont la grille n'a pas d'échelle (refus nommé, rien dans la liste), les codes effacés sur un critère algorithmique (la note passe à « -- », le critère nommé dessous), la copie rouverte dont on change un niveau (liste et Bilan suivent). Ses mots : « Ça fonctionne. » Relecture croisée de Cowork sur `d3111feb` : rien à corriger ; une réserve inscrite dans le rapport (G-2, source unique « en bloc » prouvée sur une grille holistique seulement). Le refus « Échelle introuvable » sans brouillon est confirmé par Grégoire.

↻ **5 septembre 2026, 16 h 50 — la NOTE DU COURS a été auditée à son tour (second audit cadré), et elle est juste sur le nombre principal des quatre familles ; trois choses ne tiennent pas, rien n'est corrigé.** Rapport `Rapports/AUDIT-pratique-de-notation-2026-09-05.md` (huit flux, banc de 46 mesures, quatre élèves de banc dont chaque nombre est calculé à la main avant le code), branche d'audit non poussée : **tu arbitres.** Ce qui marche : les deux systèmes de calcul donnent la même note (sommative 86,57, standards 79,45, spécifications 70, dénotation 78) et l'export dit ce que le profil dit ; une reprise remplace, la retirer restaure ; une dénotation sans jugement sort « non constructible », jamais 0. Ce qui ne tient pas : **une pratique par spécifications configurée dans l'application rend 0 % à toute la classe** (elle écrit des « forfaits », le moteur ne lit que des « tableBundles », rien ne traduit) ; **un 0 qui a l'air d'un résultat sort de l'export** quand les indices n'ont pas encore été calculés pour un élève (premier calcul d'un trimestre, élève ajouté) ; et le brouillon « 95 sur la moitié de la grille » compte 95 dans les trois familles qui calculent — ça, c'est ta règle à dire (déjà inscrit). Autour : deux replis différents pour un groupe sans pratique, un identifiant d'avant qui calcule avec des défauts, le panneau du profil qui annonce « 3 meilleurs » quand la pratique dit 4 et écrit dans les données à chaque affichage, la dénotation qui reçoit un niveau « M » par la règle des standards, le jeton de délai compté deux fois après une reprise, une clé de jetons hors trimestre. Deux « corriger maintenant » proposés (les spécifications, le zéro du premier calcul), le reste à inscrire — ton arbitrage, après ou avant le 14. Les deux passes automatiques d'avril-mai (`ultrareview-lot-3-indices.md`, `ultrareview-lot-4a-evaluation.md`) portent maintenant une disposition par constat : sur trente et un, treize périmés, cinq refusés, treize tenus. **Vérifié comment** : `cd tests && npx vitest run unit/audit-pratique-de-notation-2026-09-05.test.js` — 46 verts ; sept break-tests par mutation d'un point sur les golden masters (sommative, standards par les deux chemins, spécifications, hybride, dénotation, simulation) — chacun rougit au bon endroit, restauré à empreinte identique ; suite complète 474 fichiers / 5 309 tests verts. ⚠ Pas de navigateur, pas tes données : les nombres viennent d'élèves de banc. ⮕ **Ce que tu dois trancher** : (1) y a-t-il un collègue en spécifications à la mi-septembre ? Si oui, le moteur doit lire ses forfaits avant le 14 ; (2) le zéro du premier calcul se corrige en deux lignes ; (3) la règle du brouillon (#706). *(constats du rapport ; #465, #483, #590, #701 recoupés ; #482 proposé périmé)*

↻ **5 septembre 2026, soirée — ARBITRÉ PAR GRÉGOIRE ET LIVRÉ (1.122.0, build `0905-1722`, poussée `12b88c6e`, run GitHub `33994473211` VERT jusqu'au bout — Vitest et Playwright WebKit sur le serveur, le premier depuis 1.120.0) : un brouillon n'entre plus dans la note du cours, une pratique par spécifications configurée dans l'application calcule, et plus aucun « 0 » ne sort comme un résultat.** Trois gestes en un lot, sur les quatre familles et les deux systèmes de calcul. **La règle, dans ses mots** : une évaluation NON verrouillée (brouillon de l'enregistrement automatique, reprise pas encore réévaluée, copie déverrouillée) ou dont la portée est incomplète n'entre pas dans la note ; le profil et l'export disent combien ont été écartées — « 2 évaluations en brouillon, non comptées » (ses mots) et « 1 évaluation sans aucun critère évalué, non comptée » (les miens, pour la copie enregistrée sans aucun critère : **à valider par lui**). Les spécifications : le moteur lit maintenant les « forfaits » que le gabarit et l'éditeur écrivent, et « Examen » ou « Projet » s'apparient aux productions du même type ; rien n'est réécrit dans les pratiques de personne (une sonde, `scripts/diagnostic-708-spe-forfaits.js`, MESURE le stock) ; ce que l'assistant écrit, sans forfaits, reste « non constructible » — plus jamais 0. Le zéro du premier calcul : une sommative ou une spécification configurable calcule dès le premier appel, et un cache vide rend « non constructible ». Les douze constats moyens, quatre mineurs et quatre indices A/C sont inscrits (#710 à #729) ; #482 périmé ; les deux ultrareviews de mai fermées avec leurs numéros. **Vérifié comment** : `cd tests && npx vitest run unit/sentinelle-706-brouillons-hors-de-la-note.test.js unit/sentinelle-708-spe-forfaits-calculent.test.js unit/sentinelle-709-cache-vide-rend-null.test.js` — 23 cas, chaque sentinelle rougie par mutation de son correctif puis restaurée à empreinte identique ; les deux bancs d'audit passés aux valeurs d'après (l'avant en commentaire) ; suite complète depuis `tests/` verte. ⚠ Deux conséquences nommées, pas éprouvées à l'écran : une reprise pas encore réévaluée ne compte pas (ni son originale) tant qu'elle n'est pas enregistrée ; une copie enregistrée SANS aucun critère (0 sur rien) ne pèse plus 0 dans une moyenne sommative — un « non remis » qui doit compter 0 se note. ⮕ **Ce que tu dois aller voir** : le profil d'un élève dont une copie est en brouillon (ouverte, non enregistrée) — la note du cours est celle SANS ce brouillon, et la ligne « 1 évaluation en brouillon, non comptée » est sous « Performance globale (P) » et sous la note finale de session ; puis une pratique par spécifications créée depuis « Partir d'un modèle » › « Modèle simple », assignée à un groupe dont les productions sont de type Projet et Examen : une note qui n'est pas 0 (le forfait atteint : 90, 70, ou 50 si aucun). *(#706, #708, #709 livrés ; #710-#729 inscrits)*

⮕ **La série d'audits, pour ne pas la perdre de vue** (5 septembre, 16 h 30) : **trois audits cadrés**,
dans `Rapports/prompts-audit/`, tenus dans `plans de travail/00-CADRAGES-OUVERTS.md` (section « La
série d'audits cadrés »). Le 1, le moteur d'évaluation : **fait, fermé, ses trois correctifs livrés et
vus par Grégoire** (1.121.0). Le 2, la pratique de notation (la note du cours) : **prêt, à lancer**. Le 3,
l'onglet Suivi (dépistage, présences, interventions, volet confidentiel) : **prêt, à lancer après le 2** ;
c'est l'onglet qui n'avait jamais été audité. Chaque rapport se ferme constat par constat, dispositions
arbitrées par Grégoire.

---

## LE SUIVI — ce que le troisième audit cadré a mesuré, et ce qui en est corrigé le soir même (1.123.0)

*Section ouverte le 5 septembre 2026 au soir : l'onglet Suivi (présences, dépistage, interventions, volet confidentiel) n'avait jamais été pris pour objet, et c'est lui que l'orthopédagogue de la cohorte 1 lira. Il a sa propre section parce que ses défauts ne sont pas ceux de l'évaluation : la note du cours est juste (audits 1 et 2) ; c'est ce que le Suivi en fait qui ne l'est pas toujours.*

↻ **5 septembre 2026, 19 h 45 — L'ONGLET SUIVI A ÉTÉ AUDITÉ (troisième audit cadré), la chaîne est juste quand rien ne la dérange, et quatre choses la font mentir ; rien n'est corrigé : tu arbitres.** Rapport `Rapports/AUDIT-onglet-suivi-2026-09-05.md` (huit flux, banc de 42 mesures, quatre élèves de banc dont chaque palier et chaque indice est calculé à la main avant le code — l'assidu qui progresse, l'absent qui régresse, celui qui n'a rien remis, l'incohérent). **Ce qui marche** : pour l'assidu et l'absent, chaque écran — carte RàI, suivi des fondations, cible, contexte, Suivi du groupe, Liste — rend le palier attendu (niveau 1 « Stable » ; niveau 3 « Difficulté persistante », défi Structure), et tous lisent les mêmes fonctions ; les six constats de mai sur la saisie des présences sont corrigés ; la consolidation lit le repère de maîtrise de ton échelle ; **le volet confidentiel ne sort dans aucun flux du Suivi** (rapport, archives, consolidation, export, PDF, graphiques, console : cherché partout, rien). **Ce qui ne tient pas — quatre « corriger maintenant » proposés** : (1) **une reprise compte deux fois dans le dépistage** — la note du cours remplace l'originale, mais la performance des trois derniers travaux, l'IPB, les moyennes par critère et le défi comptent l'originale ET la reprise ; l'élève qui a repris et réussi reste « niveau 3 » (sept fonctions, un filtre manquant) ; (2) **« Non-participation, niveau 3 » pour toute la classe au retour de la première séance, avant le premier travail** — et pour un élève à zéro donnée dès qu'un écran du Suivi a été ouvert, parce qu'une assiduité sans séance vaut 100 % ; l'orthopédagogue verrait une classe entière en palier intensif ; (3) **le rapport du profil ne se génère pas** depuis le 18 mai (une fonction non exportée : le bouton écrit un message d'erreur), et quand on le fait parler, ses nombres ne sont pas ceux du profil (« 75 % » là où la note dit 77, « 0 remises / 0 productions ») ; (4) **les observations d'une intervention entrent dans la page sans échappement** (règle 1 de `CLAUDE.md`, une ligne). Autour, à inscrire après le 14 : le brouillon compte comme remis et comme artefact du dépistage (#706 s'arrête à la note du cours) ; un « non remis » à 0 compte comme remis pour la complétion sommative (cadrage « non remis par famille ») ; les courbes P des archives sont la moyenne du groupe pour tout cours sommatif (élargit #716) ; un élève arrivé en semaine 6 porte cinq absences ; un critère SOLO « Aucun » reste un défi ; deux paliers sur le même profil (la carte RàI par les seuils, le suivi des fondations par la matrice) ; les interventions ne portent pas leur groupe-cours ; la liste des cinq élèves suivis est une clé nue vidée à chaque changement de groupe ; deux « moyenne A » sur deux écrans ; le mode anonymisation n'anonymise pas le volet confidentiel ; les seuils d'alerte A-C et les lettres du bilan d'intervention sont écrits en clair. #551 (deux définitions de la maîtrise) est mesuré, pas redécouvert : sur une échelle à trois paliers, la consolidation dit « consolidé » et la carte RàI « niveau 2 » pour le même élève. **Vérifié comment** : `cd tests && npx vitest run unit/audit-onglet-suivi-2026-09-05.test.js` — 42 verts ; quatre break-tests par mutation d'un point dans `js/` (le filtre des remplacées, le filtre par élève des archives, l'export du rapport, la règle « Non-participation ») : **chacun ne rougit que ce banc** — aucune sentinelle existante ne verrouille ces comportements ; chaque fichier restauré à empreinte identique ; suite complète 478 fichiers / 5 374 tests verts depuis `tests/`. Les dispositions manquantes des deux rapports antérieurs (`ultrareview-lot-6-travaux-saisie.md` N1-N6, `AUDIT-decouplage-…-2026-08-27.md` §5.3, §8, §9) sont écrites dans leurs fichiers. ⚠ Pas de navigateur, pas tes données : des élèves de banc. ⮕ **Ce que tu dois trancher** : les quatre « corriger maintenant » avant le 14 (le rapport du profil et la reprise comptée deux fois touchent ce que l'orthopédagogue lira) ; le reste après le 14, avec #700-#705 et #710-#721.

↻ **5 septembre 2026, 20 h 45, puis la nuit pour les deux runs — ARBITRÉ PAR GRÉGOIRE ET LIVRÉ (1.123.0, build `0905-2025`, commit `507b7229` à 20 h 25, poussé vers 20 h 40 ; run GitHub `34001941420` VERT sur Vitest, ROUGE sur Playwright WebKit à cause de la spec neuve du rapport et non du code ; spec corrigée `c4ac5ae3`, run GitHub `34009795798` : Vitest vert, Playwright WebKit `failure` par une perte de la machine GitHub après 220 tests verts sur 264 (aucun rouge), au moment où cette spec, la 221e, devait s'imprimer : elle n'est ni prouvée ni infirmée par ce run ; le relancer est ta décision) : les quatre choses qui faisaient mentir le Suivi sont fermées, plus une cinquième ajoutée par Cowork.** Cinq gestes, un commit chacun (`1e8a1d72` → `00f82b28`, 19 h 54 → 20 h 07), une seule livraison à la fin, après son coup d'œil et le feu vert de la relecture croisée de Cowork à 20 h 15. (1) **Une reprise remplace aussi dans le dépistage** : le suivi des fondations, la performance des trois derniers travaux, les moyennes par critère et le défi principal ne comptent plus l'originale ; l'élève qui a repris et réussi n'est plus lu au palier de sa première copie. (2) **« Non-participation » seulement quand un travail est dû et qu'une copie du groupe est évaluée** (ta règle, au mot) : au début d'un trimestre, la carte RàI, la cible d'intervention, la barre RàI du groupe et l'alerte disent « En attente » tant qu'il n'y a rien à remettre ; le cas fondé reste niveau 3. (3) **Le bouton « Rapport » d'un profil produit un rapport**, et ses nombres sont ceux du profil : « Performance : 77% (note du cours) » (phrase que tu as validée), puis la liste des évaluations qui comptent dans la note, la reprise et non l'originale. (4) **Les observations d'une intervention et deux champs du volet confidentiel sont échappés** avant d'entrer dans la page. (5) **Les courbes de performance des archives sont celles de l'élève**, plus la moyenne du groupe ; ⚠ les captures déjà faites gardent leur valeur (tarir n'est pas réparer), la prochaine écrit la bonne. Une réserve de la relecture de Cowork, inscrite sous #731 et à trancher avec #737 : un seul brouillon commencé dans le groupe suffit à rendre la classe « jugeable ». Le reste de l'audit est inscrit, à trancher après le 14 (#735 à #753). **Vérifié comment** : `cd tests && npx vitest run unit/sentinelle-730-reprise-hors-du-depistage.test.js unit/sentinelle-731-non-participation-quand-un-travail-est-du.test.js unit/sentinelle-732-rapport-du-profil-dit-ce-que-le-profil-dit.test.js unit/sentinelle-733-regle-1-observations-et-attributs.test.js unit/sentinelle-734-snapshots-p-de-l-eleve.test.js` — 21 cas, chaque sentinelle ROUGE sur le code d'avant, puis break-testée en retirant le correctif d'un site à la fois (dix-sept mutations, dix-sept rouges, fichiers restaurés à empreinte identique) ; spec WebKit `profil-rapport-732-se-genere` ROUGE avant (« Can't find variable: obtenirDetailsAssiduite »), VERTE après ; le banc d'audit passé aux valeurs d'après (l'avant en commentaire) ; suite complète 483 fichiers / 5 395 tests verts depuis `tests/` ; verdict Playwright local vert sur `507b7229` (0 échec ; les quatre mêmes instables qu'à 1.122.0, #685) ; relecture croisée de Cowork sur les cinq commits, rien à corriger ; **sur le serveur GitHub (WebKit)**, le rapport du profil s'est généré en entier (l'instantané de la trace le montre : Camille Roy, complétion 100 %, performance 70 %, les deux copies) — la spec le lisait entre deux rendus du profil, corrigée sans toucher au code (le triple rendu à l'ouverture d'un profil est inscrit, #754). ▣ **ÉPROUVÉ PAR GRÉGOIRE, à l'écran, le 5 septembre en soirée, avant la release** (source : le brouillon de clôture de la session du lot, 20 h 45, retrouvé sur le Mac le 6 au matin) : le Suivi du groupe — la barre RàI et la carte Contexte disent « En attente », plus personne en « Non-participation » tant qu'aucune copie n'est évaluée ; le profil d'un élève › bouton « Rapport » — un rapport s'écrit, et son P est celui du haut du profil. Ses mots : la phrase du rapport « validée telle quelle (les deux formes) » — « Performance : 77% (note du cours) » et « non constructible (…) » —, le titre du changelog aussi. ⮕ **Ce qui reste à aller voir, sur tes données** : un profil dont l'élève a repris un travail et l'a réussi — la carte RàI ne le tient plus au niveau de sa première copie. *(#730 à #734 livrés ; #735 à #754 inscrits)*

---

↻ **6 septembre 2026, matin (Claude Code) — CINQ RETOURS DE GRÉGOIRE, CORRIGÉS LE MATIN MÊME : 1.123.2 À 1.123.6 EN LIGNE**
(builds `0906-0745`, `0906-0821`, `0906-0842`, `0906-0902` et `0906-1016`, commits `ddc94fcf`, `43c6cc6d`, `4f0e836a`, `aea9d144` et `126b41ce`, chacun poussé
après un verdict Playwright local vert au jeton ; runs serveur `34035446544` (1.123.5, 9 h 51), `34037433494` (relais) et `34039237638` (1.123.6, 10 h 52) VERTS de bout en bout,
les trois runs précédents annulés par le push suivant).
· ✅ **Dans le profil d'un élève, la vignette d'un travail (« Travaux soumis ») ouvre la copie** — elle menait à une page vide :
  l'onglet Annoter et évaluer s'activait sans que la section Évaluations s'affiche (le geste ne basculait que la sous-section,
  depuis la refonte du 18 février), et l'ouverture entrait en course avec l'initialisation du module. Le geste arrive d'abord,
  puis ouvre (1.123.2, #761).
· ✅ **« Appliquer au cours actif » assigne vraiment la pratique au groupe-cours** — depuis le 11 juin, le bouton n'appliquait
  que les réglages et disait « appliquée » ; le groupe-cours restait sans pratique (`pratiqueId` vide chez Grégoire, champ 6 vide,
  pas de badge), tout calculait en sommative par repli, et le profil parlait d'une pratique « introuvable ». Le bouton assigne, la
  barre latérale marque « Active », le profil dit « aucune pratique assignée » quand c'est le cas, et une pratique adoptée depuis
  un modèle sommatif n'est plus refusée pour une échelle qu'elle n'a pas (1.123.3, #762).
· ✅ **Le Cadre montre la pratique que tu viens d'appliquer, et le badge « Active » se lit comme un état** — le formulaire du
  groupe-cours ne se remplissait qu'au chargement de la page (l'initialiseur que la navigation appelle à chaque affichage avait été
  retiré comme « code mort » le 22 mai) ; il relit tes données chaque fois qu'il s'affiche (1.123.4, #763).
· ✅ **« Copier tout » livre la rétroaction entière, même sans cartouche** — sur sa grille à un seul critère algorithmique et sans
  cartouche, la générale restait sur son texte d'attente et le collage ne portait que la spécifique et le bilan ; chaque phrase de la
  spécifique était coupée à 120 caractères, à l'écran comme dans le collage. La générale s'écrit avec ou sans cartouche, la
  spécifique porte les textes entiers (1.123.5, #764). Le collage sans sauts de ligne, visible dans le même exemple, reste #759
  (inscrit, non corrigé sur sa décision du matin).
· ✅ **Dans la barre d'annotation, le sélecteur de production se lit en entier** — « Portrait de lecteur/lectrice (28) » était
  coupé au milieu des lettres : le bloc de styles d'index.html, chargé après la feuille principale, imposait à cette boîte de 28 px
  un padding de champ de formulaire. La règle du sélecteur porte le sien (1.123.6, #765). Le même doublon rabaisse 13 autres classes
  sans couper de texte : inscrit #766, à voir à l'écran (le retirer change bordure et padding de tous les contrôles).
**Vérifié comment** : chaque retour reproduit AU CODE puis AU NAVIGATEUR avant correction (specs WebKit
`profil-travaux-761-…`, `pratiques-762-…` et `cadre-763-…`, rouges avant, vertes après — la deuxième a attrapé un troisième défaut que
le banc Vitest ne voyait pas), sentinelles rouges avant / vertes après (dont `sentinelle-764-…`, 3 cas, et `sentinelle-765-…` qui parse la cascade réelle), treize
break-tests rouges avec témoin, Vitest 5 427 verts ; #765 reproduit puis remesuré DANS SON CHROME (application entière servie en local,
10 px de contenu avant, 26 après, capture) ; le
second diagnostic a été tranché par les données de Grégoire (deux captures, un dump console sans donnée d'élève), pas par supposition.
⏳ **Dû à Grégoire sur 1.123.3** : Conception › Pratiques › sa PAN-STD › « Appliquer au cours actif », une fois — son assignation est
vide et le correctif ne réécrit pas son groupe-cours ; puis le profil d'un élève calcule.

↻ **6 septembre 2026, 11 h 10 (Claude Code, worktree) — LES SIX SOUS-ONGLETS DE SUIVI ONT ÉTÉ AUDITÉS UN PAR UN (quatrième audit cadré : ce que l'écran montre, ce que chaque geste fait, ce que chaque écriture laisse en base), rien n'est corrigé : tu arbitres.** Rapport `Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md`, banc `tests/unit/audit-sous-onglets-suivi-2026-09-06.test.js` (34 mesures), 36 captures WebKit locales hors dépôt.
· ⚠ **Six choses à corriger maintenant, proposées en une page (§0)** : le mode anonymisation **plante** sur tout trimestre sans mapping (démo, A2026 — une variable jamais déclarée dans `modes.js`, depuis le 22 février) ; le bouton « Annuler » de la saisie des présences vide l'onglet Suivi et le bouton « Rapport » PDF disparaît dès qu'une date est choisie ; le titre et la description d'une intervention, et le nom d'un élève dans la modale du tirage, entrent bruts dans la page (règle 1) ; confirmer un import CSV écrit les élèves puis plante sans confirmation ; enregistrer une intervention efface les notes des élèves décochés et retire les participants d'un autre groupe-cours.
· Le reste est « inscrire » ou « commenter », section par section : douze clés nues (la liste suivie **purgée en base** quand on consulte un autre groupe-cours, le verrouillage de date partagé entre tous les cours et trimestres, l'état du tirage et la banque de questions partagés d'un trimestre à l'autre) ; un tri « # » qui ne fait rien, des DA triés comme du texte, des abandons absents du tableau contre ce que dit l'écran, une recherche qui ne trouve pas « Cesaire » ; une démo qui affiche « Configuration incomplète » dans la saisie jusqu'au rechargement, sans intervention ni question flash, et sans grille de référence (520 avertissements) ; 58 contrôles trop petits pour un doigt sur iPad.
**Vérifié comment** : 34 mesures exécutées sur le code réel (le geste réel, la clé réelle, le rechargement = window neuf sur le même stockage), trois break-tests rouges puis restaurés (dont un refait après une mutation non appliquée), cinq sondes navigateur — la première sonde de rechargement effaçait le stockage et faisait ré-amorcer la démo, ce qui donnait un faux « retour en arrière » ; refaite proprement, l'écriture survit. Vitest 491 fichiers / 5 459 verts. Rien dans `js/`.

↻ **6 septembre 2026, 11 h 45 (Claude Code) — LES SIX « CORRIGER MAINTENANT » SONT LIVRÉS EN UN LOT : 1.123.7 EN LIGNE** (build `0906-1108`, commit `a3909b23`, arbitrage de Grégoire relayé par Cowork à 10 h 57).
· ✅ **Le mode anonymisation fonctionne sur un trimestre neuf** (démo, A2026) : une variable jamais déclarée faisait échouer chaque lecture des élèves depuis février (#767).
· ✅ **Dans la saisie des présences, « Annuler » ramène à la liste et « Rapport » reste là** une fois la date choisie (#768).
· ✅ **Le titre et la description d'une intervention, et les noms de la modale du tirage, entrent échappés** — règle 1 (#769, #770).
· ✅ **Confirmer un import d'élèves le dit** : « N étudiant(s) importé(s) — M au total dans le groupe », au lieu d'une erreur silencieuse après l'écriture (#771).
· ✅ **Enregistrer une intervention ne détruit plus ce que le formulaire n'a pas montré** : la note d'un élève décoché reste, les participants d'un autre groupe-cours restent (#772). ⚠ Ta règle « une intervention appartient à un groupe-cours » n'est pas implémentée dans ce lot : mesuré (aucune intervention ne porte de cours, la liste n'est filtrée par rien), c'est #746, un lot à part.
**Vérifié comment** : une sentinelle par correctif (six fichiers, dix cas), sept break-tests rouges puis restaurés à empreinte identique, le banc d'audit repassé aux valeurs d'après sur six mesures, Vitest 497 fichiers / 5 471 verts sur le commit. **Verdict Playwright WebKit local VERT au jeton sur `a3909b23` (code 0, 0 échec connu, 0 instable, rendu 15 h 23 Z / 11 h 23 Toronto, 601 s)** ; push après le verdict, dans l'ordre du §4.5.
⏳ **Dû à Grégoire** : (1) la porte terrain `plans de travail/PORTE-TERRAIN-2026-09-06-interventions-rognees.md` — deux minutes dans la console, lecture seule : ses interventions de l'automne ont-elles perdu des participants avant #772 ? (2) sur 1.123.7, basculer une fois en anonymisation sur A2026 : le premier mapping se crée.

## CE QUI N'APPARTIENT QU'À GRÉGOIRE

Aucune session ne peut trancher ces points à sa place.

↻ **QUATRE POINTS RETIRÉS DE CETTE LISTE LE 3 SEPTEMBRE 2026, tranchés par lui.** La règle
de suppression d'un fichier (tout ce qui touche le couple élève-production), les mots des
messages de suppression, le facteur de normalisation 500 → 600, et le message à la communauté.
⮕ **Les décisions sur l'échelle sont écrites en entier dans
`plans de travail/DECISION-2026-09-03-echelle-remplacement.md`** — remplacement, correction,
recalcul proposé, refus dans un trimestre archivé, et le cas de l'échelle que personne
n'emploie. ⚠ **Ce fichier fait foi ; ne les redemande pas.**
↻ **Tranché le 2 septembre à 11 h 30, et retiré de cette liste : le nom du service
d'aide.** Trois décisions, dans ses mots :
  · Ce que lit un enseignant qui n'a rien réglé : un libellé générique —
    « Centre d'aide du collège », « Services adaptés du collège », et le nom reste
    un réglage qu'il peut remplir.
  · Ce que lit l'ÉLÈVE, dans la phrase du gabarit neuf : « au service d'aide de ton
    collège : … » — on retire « en français », et rien d'autre. Le deux-points reste,
    parce que la préposition voyage avec le nom (« t'inscrire au Passerelle + » ne se
    dit pas).
  · Chez lui : **« Passerelle + »**, qu'il écrira lui-même dans son réglage — le code
    n'écrit pas dans ses données.
- **Les essais à la main** que les tests ne remplacent pas : l'écran réel sur Mac
  et sur iPad.
- **Deux attributions d'idée** inscrites dans le code (« l'algorithme propose, le
  jugement tranche — Voisard »).
  ↻ **TRANCHÉ le 3 septembre 2026** : **la source EST publiée.** Ses mots : *« Le travail de
  Voisard est publié. Il tient un blogue sur Substack, et cette idée d'algorithme et de
  jugement personnel est dans l'une de ses chroniques. »*
  ⮕ **Donc elle se cite en règle — elle ne part pas.**
  ⏳ **Ce qui reste, et ce n'est pas urgent** : retrouver LAQUELLE des chroniques. *« Il faudra
  faire une recherche pour la retrouver, mais ce n'est pas le bon moment. »*
  ⚠ **Ne pas retirer les attributions en attendant** : une mention imprécise vaut mieux qu'une
  idée empruntée sans nom. Question d'honnêteté intellectuelle, pas de code.
↻ **Le message à la communauté de pratique** sur l'adresse unique : **fait**, le
3 septembre.

⮕ **Il ne reste donc qu'UN point sur cette liste : les essais à la main.** ▣ **Et c'est
celui qui a le plus payé** : le 2 et le 3 septembre, son coup d'œil à l'écran a trouvé
**trois** défauts que 4760 essais verts, deux relectures croisées et une suite de navigateur
complète avaient tous manqués — un brouillon perdu au refus, des critères créés sans
identifiant, et une fenêtre de suppression qui ne nommait pas sa grille.

↻ **Retiré de cette liste le 2 septembre** : les identifiants du code qui portent un
prénom de collègue. **Il a tranché — ils partent tous** — et la mesure a montré que
le retrait ne coûte rien : les huit identifiants d'échelles sont inertes, aucune
écriture dans les données de personne n'est nécessaire. *(#690)*

---

## CE QU'ON NE SAIT PAS, ET QUI COMPTE

⚠ **Des utilisateurs sont DÉJÀ dans l'application. Combien : inconnu.**
Le trafic n'est mesuré ni sur Netlify ni sur Cloudflare. On ne sait pas s'il y en
a un, vingt, ou aucun aujourd'hui.

↻ **1er septembre au soir — on sait maintenant POURQUOI on ne sait pas.** L'application
est servie à **deux adresses**, et une seule a une porte : `app.codexnumeris.org` passe
par Cloudflare Access, mais le domaine Netlify par défaut sert la même application,
complète, **sans aucune authentification**. Netlify compte les deux, Access une seule.
Ce n'est pas une fuite — l'application est locale d'abord, ce visiteur n'obtient qu'un
espace vide. Mais la porte ne compte pas ce qu'on croit. ⮕ **Redirection à l'ordre du
jour du 2 septembre.**

⮕ **Ce que ça change pour toute session** : on ne développe plus « avant les
utilisateurs ». Un défaut livré est un défaut que quelqu'un rencontre peut-être
déjà. Un enseignant de littérature, hors communauté de pratique, a signalé un
bug ; il a été corrigé. C'est la preuve que la porte est ouverte et qu'elle sert.

⮕ **La communauté de pratique Labo Codex se réunit le 14 septembre 2026.** Ce
n'est pas la date où les utilisateurs arrivent : c'est la date où ils se parlent.

---

## COMMENT CE FICHIER SE MET À JOUR

1. Une ligne passe à **Fait** seulement avec la phrase « vérifié comment ».
2. Une ligne ne quitte **Jamais vérifié** que par un passage réel dans l'écran,
   pas par une lecture de code.
3. Les huit gestes viennent d'`OBJECTIF-COHORTE-1.md`, arrêté par Grégoire. **Ce
   fichier-ci ne les amende pas** : il les traduit et les date.
4. Si un état change et que ce fichier ne bouge pas, c'est ce fichier qui a tort.
