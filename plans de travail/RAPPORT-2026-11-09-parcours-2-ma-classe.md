# Rapport : lot « Les deux parcours », partie 2 — « Mettre ta classe en place » (session H, nuit du 8 au 9 nov. 2026)

Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md`, partie 2 (sur cette branche depuis la partie 1).
Plan de la nuit : `plans de travail/NUIT-2026-11-08-TRAVAIL-DANS-LE-CLOUD.md` (sur `main`, `98c04bf`), section H, étape 1.
Branche `lot/parcours-2-ma-classe`, partie de `origin/lot/parcours-1-et-2` (`a328bb9`). Non fusionnée, non publiée,
rien au changelog, pas de release. Écrit par Claude Code, session dans le nuage, sans Grégoire (il dormait).
**Tout ce qui suit a tourné sous Chromium** : WebKit n'existe pas ici. Le verdict WebKit et les captures WebKit se
prennent sur le Mac. Captures Chromium : `plans de travail/captures-2026-11-09-parcours-2-ma-classe/`.

## En tête, en gestes

### Ce qui est fait

- **« Commencer avec ma classe »**, à la fin de « Découvrir », et **« Commencer »** sur la carte « Tu enseignes ? » de
  l'accueil lancent le deuxième parcours. Il ne démarre jamais de lui-même. Si la démo est ouverte, il la referme d'abord.
- **Le Cadre bloc par bloc** (trimestre, cours, profil, étudiant·es, horaire, groupe-cours) : chaque étape ouvre son
  bloc et, s'il n'existe encore rien, son formulaire « + Nouveau… » ; elle éclaire le formulaire, pose le contour orange
  sur « Créer… », et n'avance que quand la donnée est **enregistrée**. Un « Créer le trimestre » refusé (session et
  année manquantes) laisse la bulle à l'étape 1 : mesuré.
- **La première étape non faite** : quelqu'un qui a déjà son trimestre commence au cours. Le parcours lit ce que montre
  la barre du Cadre (la même fonction, `etapesDuCadre`).
- **« Plus tard »** sur chaque bulle sauf la dernière (et Échap) : la bulle se ferme, le panneau dit « Étape n sur 8 » et
  « Reprendre », le menu montre « 2 sur 2 ». Ni un changement de section ni un rechargement ne rouvrent la bulle.
  « Reprendre » repart à la même étape.
- **Étape 7, la première saisie** : Suivi › Présences s'ouvre avec la date du cours le plus récent **dès l'arrivée**
  (le défaut de la consigne, corrigé, voir § 3) ; deux contours, sur la date et sur « Verrouiller la saisie » ; le
  tableau des étudiant·es est éclairé (on y note les absences). L'étape avance quand la saisie est verrouillée.
- **Avant le premier cours**, l'étape 7 affiche le texte prévu et « D'accord » : la bulle se ferme, le parcours attend à
  l'étape 7 ; « Reprendre » rouvre cette même bulle tant qu'aucun cours du groupe n'a eu lieu.
- **Étape 8** : la bande d'assiduité de ton groupe, éclairée ; « Terminer » fait passer le parcours à « Fait ».
- Les huit textes, la variante et les boutons sont posés **mot pour mot** ; une sentinelle les confronte à la consigne.
- Le lancement provisoire de la partie 1 est retiré.

### Ce qui attend Grégoire (une question par ligne, avec ma recommandation)

1. **Les captures Chromium** de chaque étape (1180 px, sombre) et des étapes 1, 7 et 8 à 390 px, du menu et du panneau :
   à juger. *Recommandation : les juger après celles de la partie 1, puisque la partie 2 se remettra sur elle.*
2. **Sur l'iPhone, les formulaires du Cadre sont plus hauts que l'écran** : la bulle se range au bord et couvre une
   partie du formulaire (étape 3 : elle touche l'anneau du contour ; étape 7 : la date sort de l'écran, la bulle couvre
   le tableau). C'est la règle du moteur de la partie 1 (« si rien ne tient, le côté le plus libre »), que je n'ai pas le
   droit de refondre cette nuit. *Recommandation : au moteur, sous ~500 px de large, une bulle rangée en bas et
   repliable (titre + « n sur 8 » seulement), qu'on déplie d'un toucher.*
3. **Le témoin « Enregistré » recouvre le lien « Plus tard »** de la bulle quand elle est rangée en bas à gauche (390 px,
   étapes 3 et 7 vues sur capture). Le lien est inatteignable au doigt. *Recommandation : poser la bulle au-dessus du
   témoin (moteur ou témoin, partie 1) ; à mesurer aussi sur « Découvrir ».*
4. **Les éléments de la démo dans un Cadre neuf** (mesuré, § 4) : on ne peut pas les choisir (options grisées) et la
   création d'un groupe-cours qui en forcerait un est refusée ; mais le refus et l'Aide demandent de les « Dupliquer »,
   un geste qui n'existe pas dans le Cadre. *Recommandation : les retirer des menus du Cadre hors de la démo (option (a)
   du § 4), comme Conception le fait déjà ; rien n'est écrit dans tes données.*
5. **Étape 7, la phrase « verrouille la saisie : c'est ce qui dit à l'application que ce cours a eu lieu »** tient (une
   séance laissée sans verrou et sans absence ne compte pas : mesuré), mais le verrou n'est pas le seul geste qui la
   fait compter : une absence saisie, « Confirmer la séance » ou une note la font compter aussi. Le parcours, lui,
   n'avance qu'au verrou (la consigne le dit). *Recommandation : garder la phrase ; elle guide vers un seul geste, et elle
   est vraie de ce geste.*

### Ce que j'ai supposé (une supposition nommée se corrige en dix secondes)

- **Étape 4** : le contour passe de « Prévisualiser » à « Confirmer » quand l'aperçu paraît : c'est « Confirmer » qui
  importe. La consigne ne nomme que « Prévisualiser ».
- **La variante d'avant le premier cours n'a pas de « Plus tard »** : « D'accord » fait la même chose. Échap vaut
  « D'accord ».
- **Échap sur la dernière bulle vaut « Terminer »** (comme Échap vaut « Continuer d'explorer la démo » à la fin de
  « Découvrir »).
- **« Refaire » repart à la première étape non faite** : chez quelqu'un dont tout est en place, c'est l'étape 8.
- **« Premier cours passé »** : une séance du groupe-cours actif tombe aujourd'hui ou avant (séances tirées des dates
  du trimestre et de l'horaire, lues sans rien écrire). Un trimestre sans dates n'a aucune séance : la variante dit
  alors « pas encore eu lieu », ce qui n'est pas la vraie raison. Les dates sont demandées à l'étape 1 ; le formulaire
  ne les exige pas.
- **« Plus tard » ne montre aucun message.** « Découvrir » en montre un (« Tu pourras reprendre ce parcours depuis
  « Assistance », dans le menu. ») ; le poser ici serait un texte de plus, que la consigne ne demande pas.

### Ce que je n'ai pas pu vérifier ici

- WebKit (Safari, iPad) : rien n'a tourné sous WebKit. À refaire sur le Mac : `parcours-2-ma-classe`, `parcours-1-et-2`
  et les specs listées au § 6.
- La suite Playwright complète : seulement les specs touchées (§ 6), sous Chromium.
- Les données réelles de Grégoire : rien n'a été lu ni écrit. *À mesurer sur le Mac* : sur ton poste, le parcours
  commencerait à l'étape 8 si ton trimestre d'automne, ton groupe-cours et une séance verrouillée sont en place.

## 1. Ce qui change, par fichier

- **`js/parcours-classe.js`** (il ne portait que l'inscription au panneau et un lancement provisoire) : les huit
  étapes. Les six du Cadre ouvrent leur accordéon (`toggleAccordeonV2`, sans le défilement doux de la barre) et, quand
  le bouton « Créer… » n'est pas déjà à l'écran et qu'aucun élément n'existe, le formulaire « + Nouveau… »
  (`nouveauCoursV2`, `nouveauProfilEnseignantV2`, `nouveauHoraireV2`, `nouveauGroupeCoursV2` ; le trimestre s'ouvre en
  création de lui-même, l'import des étudiant·es est toujours là). Une saisie déjà commencée n'est pas effacée à la
  reprise. Zone éclairée : le formulaire du bloc (`.panneau-formulaire`), sans la rangée de sélection au-dessus ; à
  l'étape 4, la seule zone « Importer des étudiant·es ». L'étape avance sur l'état de la barre du Cadre, donc sur ce
  qui est **écrit**. L'étape 7 a deux bulles sous un même rang (getters lus par le moteur), décidées à sa préparation.
  Le lancement provisoire de la partie 1 est retiré.
- **`js/trimestre-v2.js`** : `etapesDuCadre()`, extraite de `mettreAJourBarreContexte` : la barre la dessine, le
  parcours s'y repère (une seule source), y compris pour l'accordéon que chaque étape ouvre. L'export `window.ouvrirAccordeonDeLEtape` est retiré : son seul consommateur
  était l'ancienne porte de l'accueil ; la fonction reste, pour le clic sur la barre.
- **`js/accueil.js`** : `commencerParLeTrimestre` (le nom de l'action reste, `data-action` inchangé) lance le parcours.
  Changement de comportement à nommer : si la démo est ouverte, « Commencer » la referme maintenant (le parcours se
  joue sur les vraies données).
- **`js/saisie-presences.js`** : le défaut de la date (§ 3) ; `lireDatesVerrouilleesSansSemis`, une lecture des dates
  verrouillées qui n'écrit rien : l'étape 7 avance quand une **séance du groupe** est verrouillée (§ 7).
- **`index.html`** : quatre jetons anti-cache, au jour du build (`20261108`) avec une lettre neuve, puisque
  `scripts/release.mjs` est interdit cette nuit. La release du Mac les réécrira.
- **Bancs** : `tests/unit/sentinelle-parcours-classe-2026-11-09.test.js` (les mots, le retrait du provisoire, la
  source unique) ; `tests/integration/parcours-2-ma-classe-2026-11-09.spec.js` (deux essais qui tournent toujours, un
  troisième pour les captures de l'iPhone seulement) ; `sentinelle-accueil-porte-ortho-et-champ2-846` suit la nouvelle
  porte (elle exigeait l'ancien geste et l'export retiré).

**Ce que le moteur n'offre pas, et comment je l'ai contourné sans le refondre** (règle de la nuit) :
- **Un seul contour par étape.** L'étape 7 en veut deux. Le second (sur la date) est posé par le parcours, dans le
  même dessin (`parcours-contour`), et suit la page tant que l'étape 7 est à l'écran. *Il faudrait* : `contour()` qui
  rende une liste.
- **Il amène la zone dans la vue une seule fois, sans attendre que la page soit immobile.** L'application lance
  elle-même des défilements doux (le formulaire « + Nouveau… » se fait défiler ; l'import des étudiant·es fait défiler
  jusqu'à l'Horaire) : ils l'emportaient sur celui du moteur, 2 passes sur 4 rouges. Le parcours attend désormais que
  la page soit immobile avant de rendre la main (6 passes sur 6 vertes ensuite). *Il faudrait* : que le moteur
  attende lui-même.
- **Quand la zone ne tient pas à l'écran, il y amène le contour** (le bas d'un formulaire), et le haut sort de l'écran.
  Contourné en éclairant le formulaire seul, plus court que l'accordéon : à 1180 px, tout tient. À 390 px, rien ne tient
  (question 2 de l'en-tête).
- **`attendre` et `aller`** sont recopiés de « Découvrir » (quatre lignes chacun). *Il faudrait* : que le moteur les offre.
- **« Reprendre » ne repart pas de l'étape retenue par le panneau** : le parcours recalcule la première étape non faite.
  C'est la même tant que les étapes avancent sur les données ; si quelqu'un supprime son horaire entre deux reprises,
  le parcours repart à l'horaire, ce qui me semble juste.

## 2. Les deux affirmations à vérifier avant de poser les textes

Les deux tiennent ; les textes sont posés tels quels. Mesuré sous Chromium par un sous-agent, sur un groupe créé par
l'interface, horloge au 10 nov. 2026.

- **Étape 2, « si tu donnes le même cours à deux groupes, tu les prépares une seule fois » : tient, dans le trimestre.**
  Une production reçoit le `coursId` du cours actif (`productions.js:2024`, `:2087`) ; la clé `productions` est rangée
  par trimestre (`trimestres.js:63`) ; l'import et l'évaluation filtrent par cours, jamais par groupe-cours
  (`modes.js:771`, `:807`). Mesuré : deux groupes-cours du même cours (00001 et 00002, deux horaires) ; une production
  créée depuis le premier paraît dans le menu du second après `changerGroupeCoursActifV2`. Nuances : les échéances
  restent une par groupe (`productions.js:1010`, voulu) ; rien ne passe au trimestre suivant (déduit du code, non mesuré).
- **Étape 7, « une séance laissée sans verrou et sans aucune absence ne compte pas » : tient.** Ouvrir une séance
  n'écrit rien (`saisie-presences.js:945`) ; l'assiduité ne compte que les dates qui ont au moins une fiche
  (`indices.js:156`, `:225`). Mesuré : trois dates affichées sans aucun geste, puis un rechargement → `presences` vide,
  0 séance au profil, « 1 séance en attente » à la bande. « Verrouiller la saisie » sans absence → trois fiches, 100 %,
  1 séance. **Mais** une absence saisie, « Confirmer la séance » seul, ou une note tapée seule font aussi compter la
  séance (question 5 de l'en-tête).

## 3. Le défaut de la consigne : la date vide de Présences

**Reproduit** sous Chromium, par l'interface : trimestre, cours, profil, trois étudiant·es, horaire, groupe-cours,
puis Suivi › Présences sans recharger → date vide, ni « Confirmer la séance » ni « Verrouiller la saisie » ; après un
rechargement, le 10 nov. est proposé.

**Cause** : la date se propose au démarrage (`initialiserModuleSaisiePresences`, appelée une fois par `main.js`) ; sur
un poste neuf, il n'y avait alors rien à proposer. Le premier groupe-cours devient actif par une simple écriture
(`sauvegarderGroupeCoursV2`), et l'observateur qui rafraîchit la saisie à l'arrivée ne le faisait que si une date était
déjà là.

**Correction, à la source** : à l'arrivée dans Présences, si la date est vide **et la base prête**, l'observateur passe
par le même chemin que le démarrage (séances régénérées, la plus récente ≤ aujourd'hui proposée). Une date déjà là ne
change pas de chemin. Coût : avant le premier cours (aucune date à proposer), chaque arrivée relance le calendrier et
les indices, comme au démarrage. **Source ou stock** : un état d'écran, rien n'est écrit chez les gens ; pas de stock.
**Break-test** : la correction retirée → l'essai de bout en bout rougit sur la date (`""` au lieu de `2026-11-10`),
rétablie → vert.

## 4. Les éléments de la démo dans un Cadre neuf (mesuré, rien d'écrit)

**D'où ils viennent.** `initialiserDemoNamespace` (`demo-namespace.js`, appelée à chaque chargement par `main.js:1255`)
écrit 15 clés `demo_*` dès le premier chargement d'un navigateur neuf, sans que la démo ait été ouverte ; l'enseignant,
l'horaire et le groupe-cours de la démo sont fabriqués à `demo-namespace.js:207-250`. Puis huit menus du Cadre leur
ajoutent un groupe d'options « Démo (par Labo Codex – à dupliquer pour utiliser) »
(`BibliothequeUI.ajouterOptgroupDemo`, `bibliotheque-ui.js:260`) : `trimestre-v2.js:326` (cours), `:349` (horaire),
`:369` (enseignant), `:393` (pratique) dans le formulaire du groupe-cours ; `trimestre-v2-cours.js:260`,
`trimestre-v2-enseignants.js:184`, `trimestre-v2-horaires.js:556`, `trimestre-v2-groupes-cours.js:150` dans les menus
de chaque bloc. Deux corrections au constat de la consigne : aucun trimestre de la démo n'est proposé ; le menu des
cours n'affiche le cours de la démo qu'à partir d'un vrai cours (sans aucun cours, il dit « Aucun cours — crée ou
importe un cours »).

**Peut-on en choisir un à l'étape 6 ? Non.** Toutes ces options sont grisées (`disabled`) : ni au toucher, ni au clavier
(Fin, flèches, première lettre), ni par `selectOption` ; seule une affectation par programme prend. Une valeur forcée
est refusée par « Créer le groupe-cours » (`verifierReferencesPasDemo`, `trimestre-v2-groupes-cours.js:801`) :
« Non enregistré – Créer le groupe-cours : le cours sélectionné est un exemple fourni par Labo Codex. Clique sur
« Dupliquer » dans sa bibliothèque pour en créer ta propre version avant de l'utiliser. » **Ce message, et l'Aide
(`accompagnement-contenu-popup.js:1289`), demandent un geste qui n'existe pas dans le Cadre** : le plan qui prévoyait
une fiche en lecture seule avec « Dupliquer » (PLAN-AUTONOMISATION-UTILISATEUR, § 3.1 et 3.4) n'a pas été livré ici ;
sa tentative est partie avec le retour en arrière du 22 avril (`docs/POST-MORTEM-PHASE5-22-AVRIL.md:74-76`).

**Trois façons de les tenir hors des listes** (aucune n'est faite) :
- **(a) Retirer le groupe démo des menus du Cadre** hors de la démo, comme Conception le fait déjà
  (`filtrerParModeDemo`, `bibliotheque-ui.js:92`) : les huit appels, la fonction, trois faux objets de bancs et la
  phrase de l'Aide partent ; la garde contre les valeurs forcées reste. Environ 40 lignes retirées. On perd le seul signe
  de la démo dans le Cadre, et une prémisse du plan 2 (§ 2.5), à rouvrir avec lui. **Ma recommandation.**
- **(b) Retirer seulement les quatre du formulaire du groupe-cours** : minime, mais « Primo Primavera », « Lun-AM /
  Mer-PM » et « DEMO-601-101-MQ-0demo » restent dans les menus des blocs, là où ils ont été vus.
- **(c) Livrer ce que le plan dessinait** (option cliquable, fiche en lecture seule, « Dupliquer » pour cinq fiches) :
  coûteux, rien ne se retire ; le message de la garde deviendrait vrai.

### 4 bis. L'option (a), faite (9 nov. 2026, décision de Grégoire à 9 h 24)

Fait dans la session principale, après la fusion de la partie 1 sous ce lot :
- les huit appels à `ajouterOptgroupDemo` sont retirés (`trimestre-v2.js` quatre, `trimestre-v2-cours.js`,
  `trimestre-v2-enseignants.js`, `trimestre-v2-horaires.js`, `trimestre-v2-groupes-cours.js`), puis la fonction
  (`bibliotheque-ui.js`), plus rien ne l'appelant ; ses trois faux objets de bancs (`sentinelle-449`, `-458`, `-762`) ;
  sa ligne dans `docs/modules/demo-et-autonomisation.md` ;
- dans la fenêtre « Données démo » de l'Aide, la phrase « Dans les menus de Cadre › Trimestre (…) sous « Démo (par Labo
  Codex – à dupliquer pour utiliser) ». » est retirée. **Supposé par moi** : la seconde phrase du même conseil (« Ton
  matériel ne peut pas pointer vers un modèle de la démo : duplique-le d'abord, puis choisis ta copie. ») reste, mot pour
  mot : elle est toujours vraie (la garde reste) et la décision nomme une phrase. `sentinelle-guidage-demo-2026-10-29`
  garde le reste du bloc 6 mot pour mot ;
- le cliquet de complexité descend de 437 à 435 : `populerDropdownsAssemblageV2` 29 → 13, `chargerDropdownCoursV2` 17 → 12 ;
- banc neuf `tests/unit/sentinelle-cadre-sans-groupe-demo.test.js` (3 cas : plus d'appel ni de définition, plus du
  libellé dans `js/`, la garde toujours définie) ; rouge sans le retrait (2 cas sur 3), vérifié.

**La garde `verifierReferencesPasDemo` reste.** Son message devient inatteignable par l'interface (plus aucune option
`demo-` à forcer dans le Cadre), mais il reste faux : il demande « Dupliquer » dans une bibliothèque, geste qui n'existe
pas pour un cours, un horaire, un enseignant ou un groupe-cours. Non changé. **Texte proposé** (à décider par Grégoire) :
« Non enregistré – le cours sélectionné vient de la démo. Choisis un de tes cours, ou crée-le dans Cadre › Trimestre. »
(le type et le chemin suivent `labelType` : cours, horaire, enseignant·e, pratique).

**La prémisse du plan 2 que ce retrait touche** : `plans de travail/HOOKS-PLAN2.md`, § 2.5 « Sélecteurs à 2 sections
(`ajouterOptgroupDemo`) », prévoyait d'étendre ces sélecteurs à trois sections (« Mes documents | Démo | Partagés »)
en généralisant la fonction. La fonction n'existe plus et le Cadre n'a plus de section « Démo » : le jour où le plan 2
reprend, ce paragraphe est à réécrire (une section « Partagés » seulement, ou rien). Le plan n'est pas modifié.

## 5. Trouvailles, et leur issue

1. **Le témoin « Enregistré » recouvre « Plus tard » à 390 px** — *inscrire* (question 3 de l'en-tête ; code de la
   partie 1).
2. **Sur l'iPhone, la bulle couvre une partie des formulaires du Cadre** — *inscrire* (question 2 ; règle du moteur).
3. **« Trimestre : 15 semaines • 30 jours de cours »** s'affiche dans Cadre › Trimestre alors qu'aucun trimestre n'existe,
   juste après être sorti de la démo par « Commencer avec ma classe » (capture `classe-1-1180-sombre`). Le résumé lit
   `cle('calendrierComplet')` ; je n'ai pas établi s'il montre un calendrier resté de la démo ou un affichage non
   rafraîchi — *inscrire*.
4. **« Supprimer » paraît dans « Nouveau profil »**, en création (capture `classe-3-1180-sombre`) ; le toucher dit
   « Aucun profil sélectionné ». Vu sur capture, non creusé — *inscrire*.
5. **Banc de la partie 1, `parcours-1-et-2` › « panneau : titre, phrase… »** : rouge sous Chromium, sur la base comme sur
   ce lot : il mesure la position du panneau pendant qu'il glisse encore (−172 px au lieu de 0). Vert sur le Mac
   (WebKit, 25/25 selon le commit de la partie 1) — *inscrire* : attendre la fin de la transition, comme le fait déjà
   `capture()`.
6. **`en-tete-epure`** : trois rouges sous Chromium, identiques sur la base — *commenter et oublier* (Chromium n'est pas
   la cible ; la config Chromium le dit elle-même).
7. **Rouge GitHub sur `main`** (audit de début de session) : le run de la 1.237.2 (`54a87bca`) a quatre essais hors de la
   baseline Linux ; deux sont déjà rattachés à #1246, deux sont neufs : `aide-cp-suit-la-case-1086` et
   `tampons-masques-bibliotheque-1216` — *inscrire*.
8. **`calculerNombreSeances`** (`saisie-presences.js:580`) n'a aucun appelant — *commenter et oublier* (non commenté :
   hors du lot ; noté ici).

## 6. Tests

- **Vitest** (depuis `tests/`), sur le lot : **10 893/10 893**, 893 fichiers (la base en avait 10 869 ; + 24 essais de la sentinelle neuve).
- **Playwright, sous Chromium** (`playwright.chromium.config.js`) :
  - `parcours-2-ma-classe` : 2/2, et 6 passes sur 6 de l'essai de bout en bout ; l'essai des captures de l'iPhone, vert
    avec `CAPTURES_PARCOURS`.
  - Les specs liées, en entier : `barre-convergence-suit-les-enregistrements-918`, `chaines-etapes-1149` (les deux),
    `demo-saisie-presences-749-lot3`, `graphique-suit-les-presences`, `parcours-neuf-saisie-presences`,
    `presences-lot-d-enregistrement`, `temoin-dans-le-flux-1240`, `temoin-enregistrement-lot-b`,
    `trimestre-v2-chargement`, `accueil-epure`, `en-tete-epure`, `guidage-demo`, `parcours-1-et-2`,
    `lot-e2-cadre-creer-ou-modifier`, `parcours-rentree-478`, `groupe-cours-sans-ses-eleves-1038` : **99 verts, 4 rouges,
    10 sautés**. Les 4 rouges le sont aussi sur la base `a328bb9` (§ 5, points 5 et 6) : aucun n'est dû à ce lot.
- **Break-tests** : la sentinelle (« tes présences, tes évaluations » → « tes présences et tes évaluations » : rouge,
  rétabli : vert) ; la correction de la date (§ 3) ; après la relecture, le départ forcé à 0, « tout est fait » ramené
  à l'étape 7, et le verrou compté sans croisement avec les séances : chacun rougit, rétabli : vert.
- **Après les corrections de la relecture** : Vitest 10 893/10 893 ; `parcours-2-ma-classe` 2/2 ; `barre-convergence-918`,
  `chaines-etapes-1149` (les deux), `presences-lot-d-enregistrement`, `parcours-neuf-saisie-presences`,
  `demo-saisie-presences-749-lot3`, `graphique-suit-les-presences` : 33 verts, 2 sautés.
- **Sur le Mac, à faire** : le verdict WebKit complet, et les captures WebKit (chaque étape à 1180 px en sombre ; 1, 7
  et 8 à 390 px ; menu et panneau).

## 7. Relecture par un agent neuf

Un sous-agent qui n'avait pas vu le travail, avec la consigne et `git show a17bc783` seulement (skill
`verification-adverse`). **Verdict : « bon avec réserves »**, cinq réserves ; les quatre premières portaient sur ce que
j'avais écrit, elles sont finies dans le lot (commit suivant) :

1. **Le semis faisait sauter l'étape 7** (mesuré par lui) : chez qui a encore la clé nue `datesVerrouillees` (stock
   d'avant le 11 sept.), la première lecture la copie chez le groupe-cours neuf ; le parcours comptait toute date
   verrouillée et passait de l'étape 6 à « 8 sur 8 » sans saisie. **Corrigé** : lecture sans semis
   (`lireDatesVerrouilleesSansSemis`), et seule compte une date qui est une séance du groupe. Le banc de bout en bout
   pose désormais ce vieux stock ; break-test : sans le croisement, il rougit à l'étape 7.
2. **L'observateur n'attendait pas la base** (#990 : avant elle, ce chemin écrit un calendrier vide sous une clé nue).
   **Corrigé** : `window.dbReady === true` en condition. Non reproduit (fenêtre étroite), lu dans le code.
3. **`window.ParcoursClasse` sans consommateur, et la table des accordéons recopiée de `trimestre-v2.js`**.
   **Corrigé** : l'export retiré ; `etapesDuCadre()` porte l'accordéon de chaque étape.
4. **L'essai « première étape non faite » ne mordait pas** (départ forcé à 0 : vert, le moteur passait seul à l'étape 2 ;
   « tout est fait » ramené à l'étape 7 : vert). **Corrigé** : le banc note chaque bulle rendue ; la porte de l'accueil ne
   doit montrer que « Ton cours », et « Refaire », tout étant en place, que l'étape 8. Break-tests : les deux rougissent.
5. **Les trois éléments « INSCRIS AU BACKLOG » ne sont pas dans `BACKLOG.md`** : voulu, la règle 3 de la nuit interdit d'y
   écrire ; ils sont plus bas, pour la session du Mac.

Il a aussi relevé : la spec saute à la fin de « Découvrir » (`ParcoursMoteur.allerA(7)`) au lieu de le jouer — son
propre banc, `parcours-1-et-2`, le joue étape par étape ; les captures du menu et du panneau viennent de l'essai de
captures de la partie 1 (`parcours-1-et-2` › « captures du menu et du panneau »), relancé ici.

## À inscrire au BACKLOG

Les trois que la consigne demande d'inscrire sans les faire :
- Sur un groupe neuf sans aucune production, la complétion affiche « 1 évaluation en attente » et la performance
  « 3 évaluations en attente » (vu aussi sur la capture `classe-8-1180-sombre`).
- « Aucun production défini », dans « Trajectoires par production » : l'accord.
- Sous le sélecteur du profil enseignant, « nom, établissement, discipline » : le formulaire exige le courriel (et
  l'institution), pas la discipline.

Ceux de cette nuit (§ 5) :
- Le témoin « Enregistré » recouvre le lien « Plus tard » (et « Quitter le parcours » ?) de la bulle à 390 px.
- Sur l'iPhone, la bulle couvre une partie des formulaires du Cadre : une bulle repliable sous ~500 px.
- « 15 semaines • 30 jours de cours » sans trimestre, après la sortie de la démo.
- « Supprimer » dans « Nouveau profil », en création.
- `parcours-1-et-2` › « panneau » mesure le panneau pendant qu'il glisse (rouge sous Chromium).
- Deux essais neufs rouges sur le run GitHub de la 1.237.2 : `aide-cp-suit-la-case-1086`, `tampons-masques-bibliotheque-1216`.
- Si Grégoire retient l'option (a) du § 4 : retirer le groupe « Démo » des menus du Cadre. ⮕ **Fait** (§ 4 bis), n'est plus à inscrire.
