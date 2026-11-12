# Rapport : « Les parcours en deux temps », première partie

12 nov. 2026. Session du cloud (Claude Code), **Chromium seulement**. Branche `claude/deux-temps-modelisation-da3icr`
(le mandat nommait `lot/deux-temps` ; la session du cloud impose ce nom), partie de `origin/main` à `271dc9177`
(1.243.0), poussée, non fusionnée. Mandat : relais de la conversation du Projet, 12 nov., 8 h 20.
Porte terrain : `plans de travail/PORTES-TERRAIN-2026-11-12-deux-temps-modelisation.md`.
**Aperçu** : PR n° 20 (brouillon, à ne pas fusionner), `https://deploy-preview-20--codexnumeris-051225.netlify.app`,
build 1112-0943. Netlify le dit prêt ; il n'a pas pu être ouvert depuis le conteneur (le réseau y bloque `netlify.app`).

**Dernier relais : 12 nov., session du cloud.** Fait : le panneau (texte en quatre temps, choix du matériel, carte
sans modélisation, « Remettre la démo à neuf »), la modélisation de « Mettre ta classe en place » (huit bulles dans la
démo), le confinement mesuré puis corrigé, les bancs et leurs break-tests. Reste : l'essai de Grégoire sur l'aperçu
(porte terrain), le verdict WebKit à la fusion, la deuxième partie (« Évaluer une première production », sur une
branche partie de la dissection). `js/parcours-evaluer.js`, `js/navigation.js` et `js/config.js` n'ont pas été touchés.

---

## 1. Le confinement : ce qui a été mesuré AVANT tout code

Méthode : un espace vide, un trimestre réel bâti par les formulaires du Cadre (un cours, un profil, trois
étudiant·es, un horaire, un groupe-cours), un relevé de TOUTES les clés (base et stockage du navigateur) ; entrée
dans la démo ; création d'un cours, d'une liste, d'un horaire et d'un groupe-cours ; sortie ; second relevé ;
différence clé par clé, hors `demo_*`.

| Ce qui est créé dans la démo | Où cela s'écrit | Verdict |
|---|---|---|
| étudiant·es, horaire, groupe-cours, calendrier, présences, dates verrouillées | `demo_*` (par `cle()`) | confiné |
| **le cours** | **`cours`, clé globale** | **fuite : il restait dans la vraie liste après la sortie** |
| les séances d'un groupe-cours de la démo | `seancesCompletes_gc_<id>`, sans préfixe | fuite (existait déjà pour `GC_DEMO`, sans parcours) |
| `listeCours`, `modeApplication` | globales | écart bénin : absentes avant, `[]` et « normal » après |

Deux autres fuites sont sorties du banc de confinement lui-même, une fois la modélisation jouée de bout en bout :

- **`etatTirage`** (le tirage au sort de l'Animation, clé sans préfixe) : réécrit à chaque changement de groupe.
  Passer d'un groupe à l'autre dans la démo, ce que la modélisation fait faire, remettait à zéro le tirage réel.
- **Une sortie demandée pendant l'entrée** : la reconstruction des captures, lancée par l'entrée, écrit séance par
  séance sous la clé du contexte du moment. Sortir avant sa fin lui faisait écrire des séances de la démo sous
  `a2026_snapshots_…`, une clé du trimestre réel.

Conclusion : le confinement se garantit **sans refondre le mode démo**. Aucun arrêt n'a été nécessaire.

## 2. Ce qui a été changé pour le garantir

- `js/trimestre-v2-cours.js` : un cours créé pendant la démo reçoit `isDemo` et `creeEnDemonstration`, la marque
  qu'utilise déjà le service de Suivi › Rencontres.
- `js/demo-activation.js`, à la sortie : ces cours sont **rangés dans `demo_listeCours`** (d'où l'entrée les remet),
  puis retirés de `cours` et de `listeCours` par identité et par marque ; les `seancesCompletes_gc_<id>` des
  groupes-cours de la démo sont retirées (par identité : les ids de `demo_groupesCours`, moins tout id d'un
  groupe-cours réel) ; `etatTirage` revient à sa valeur d'avant l'entrée ; les clés absentes avant l'entrée et
  revenues à vide redeviennent absentes.
- `js/demo-activation.js` : l'entrée et la sortie passent **l'une après l'autre** (une file).
- Ce qui est créé **reste dans la démo** : au retour, le cours, la liste, l'horaire, le groupe-cours et la saisie
  verrouillée sont là (jugé par le banc).

**Source ou stock ?** Source. Le seul effet sur le stock : à la prochaine sortie de démo, `seancesCompletes_gc_GC_DEMO`
est retirée chez qui l'a déjà (un cache de la démo, refait à l'entrée). Un cours créé dans la démo AVANT ce lot et
resté dans la vraie liste d'une personne n'est pas touché : il ne porte pas la marque, et le retirer serait écrire
dans ses données.

**Ce qui n'est pas couvert, et nommé** (hors du lot, issue 2, non inscrit : aucun symptôme vécu) : créer un PROFIL
dans la démo l'écrit dans `enseignants` et `profilEnseignant` (globales) ; les équipes et les questions éclair de
l'Animation (`equipesAnimation_<coursId>`, `questionsFlash_<coursId>`) s'écrivent sans préfixe si on s'en sert dans la
démo. La modélisation ne passe par aucun des deux.

## 3. Le panneau « Assistance » (`js/assistance.js`, `css/parcours.css`)

- (a) La présentation : le texte validé, mot pour mot ; le titre et le début de chaque ligne en gras ; une liste
  sans numéros.
- (b) Le choix : deux options côte à côte entre « Tes parcours » et la liste (un groupe de boutons radio, flèches du
  clavier, 44 px de haut). Mémorisé sur l'appareil, hors des données : `localStorage`, clé `laboCodex.assistance`,
  qui porte aussi l'état des modélisations (`{ materiel, modeles: { classe: { etat, etape } } }`).
- (c) Sous « Matériel de la démo » : un parcours sans modélisation le dit sur sa carte et son « Commencer »,
  pâle, ne part pas. **« Découvrir » s'affiche tel quel sous les deux choix** (il déclare `dansLaDemo`) : même état,
  même bouton, il ouvre la démo comme avant.
- (d) « Remettre la démo à neuf » : sous le choix, visible avec « Matériel de la démo ». Confirmation (« Annuler » par
  défaut) ; la démo ouverte se referme, les copies importées dans la démo partent par le retrait existant (T3),
  toutes les clés `demo_*` sont effacées puis réécrites par `peuplerNamespace` ; la démo se rouvre si elle l'était ;
  les modélisations redeviennent « À faire ». Si le pack ne se charge pas, rien n'est effacé.
- Une définition de parcours déclare `lancerModele` et `totalModele` (sa modélisation) ou `dansLaDemo`. La deuxième
  partie n'aura qu'à les ajouter à « Évaluer une première production » : la dernière bulle de « Mettre ta classe en
  place » portera alors son titre, sans toucher à ce fichier.

## 4. La modélisation de « Mettre ta classe en place » (`js/parcours-classe.js`)

Les huit étapes du parcours réel ne changent pas (leur sentinelle reste verte). La modélisation est une seconde
définition, `ETAPES_MODELE`, huit bulles :

| | Bulle | Le geste | Avance quand |
|---|---|---|---|
| 1 | Un cours | remplir avec le matériel, « Créer le cours » | un cours marqué existe |
| 2 | Une liste d'étudiant·es | « Copier la liste », coller, « Prévisualiser » | l'aperçu est ouvert |
| 3 | Le cours de la liste | choisir le cours dans l'aperçu, « Importer 8 étudiant·es » | la liste est importée |
| 4 | Un horaire | remplir, « Créer l'horaire » | un second horaire existe |
| 5 | Un groupe-cours | les cinq morceaux, « Créer le groupe-cours » | un second groupe-cours existe |
| 6 | D'un groupe à l'autre | le menu du groupe, dans l'en-tête | le groupe actif est le nouveau |
| 7 | Un premier cours | « Précédent », une absence, « Verrouiller la saisie » | une séance du groupe est verrouillée |
| 8 | Le groupe d'un coup d'œil | « Explorer la démo » ou « Refaire avec mon matériel » | |

**Les étapes du parcours réel qui n'ont pas de sens dans la démo, et ce que j'en fais :**
- **le trimestre** : la démo a le sien ; en créer un en sortirait. Retiré.
- **le profil** : donnée globale et personnelle ; le créer dans la démo l'écrirait dans les vraies données. Retiré ;
  le groupe-cours prend l'enseignant de la démo, Primo Primavera.

**Deux étapes de plus que prévu**, sorties de la mesure :
- « Le cours de la liste » : le menu de rattachement n'apparaît que dans l'aperçu ; dans une seule bulle, celle-ci
  couvrait le menu. Séparée, elle se replace.
- « D'un groupe à l'autre » : créer un groupe-cours dans la démo ne le rend pas actif (un groupe l'est déjà).
  Le geste du menu de l'en-tête est celui que la bulle 6 du parcours réel annonce.

**Trouvaille** (code étranger, issue 2, non inscrite : à ton jugement) : en changeant de groupe, la saisie des
présences garde la date de l'autre groupe, même si le nouveau n'a pas cours ce jour-là (« durée inconnue : horaire
à configurer »). La bulle 7 le dit et montre « Précédent ».

### Le matériel fourni

- Le cours : `601-999-DM`, « Littérature et imaginaire », « 601 Français (langue et littérature) », `3-1-3`. Un code
  qu'aucun cours réel ne porte, pour ne pas déclencher l'avis de doublon chez qui donne le 601-102.
- Le groupe : `00002`. L'horaire : « Mardi matin », le mardi de 8 h à 12 h, quatre périodes.
- La liste (DA, groupe, nom, prénom), huit totems, aucun du pack, quatre noms au féminin et quatre au masculin :

```
9900001	00002	Câlin	Koala          (Océanie)
9900002	00002	Enjouée	Loutre         (Europe, Amériques)
9900003	00002	Rieur	Lémur          (Afrique)
9900004	00002	Généreuse	Hermine        (Europe, Asie)
9900005	00002	Doux	Tapir          (Amériques, Asie)
9900006	00002	Vaillante	Antilope       (Afrique)
9900007	00002	Amical	Yack           (Asie)
9900008	00002	Bienveillante	Cigogne        (Europe, Afrique)
```

### Les phrases proposées (à valider sur l'aperçu)

Panneau :
- « Ce parcours n'a pas encore son modèle dans la démo. Pour le faire dès maintenant, choisis « Mon matériel ». »
- « Remettre la démo à neuf » · « Tout ce que tu as fait dans la démo s'efface : ce que tu y as créé, modifié, évalué
  ou importé. La démo revient telle qu'elle était au départ. Tes données, elles, ne bougent pas. » · « Remettre à
  neuf » · « La démo est remise à neuf. » · « La démo n'a pas pu être remise à neuf. Rien n'a été effacé. »

Dernière bulle : « Explorer la démo » (en principal, à la place du parcours suivant tant qu'il n'a pas sa
modélisation ; ensuite, son titre) · « Refaire avec mon matériel ».

Les huit bulles (titre · texte · geste) :
1. **Un cours** · « Dans la démo, tu vas monter un second groupe, geste par geste, avec du matériel fourni. D'abord
   son cours. Le matériel : le code 601-999-DM, le nom « Littérature et imaginaire », la discipline « 601 Français
   (langue et littérature) » et la pondération 3-1-3. Les productions se rangent sous le cours : si tu donnes le
   même cours à deux groupes, tu les prépares une seule fois. » · « Remplis les champs obligatoires avec le matériel
   fourni, puis touche « Créer le cours ». »
2. **Une liste d'étudiant·es** · « Voici une liste de huit étudiant·es fictif·ves, comme celle que tu copieras du
   système de ton établissement : une ligne par personne, avec le DA, le groupe, le nom et le prénom. Copie-la, puis
   colle-la dans le champ. Le DA reconnaît chaque personne partout dans l'application ; le numéro de groupe, 00002,
   servira à l'horaire et au groupe-cours. » · « Touche « Copier la liste », colle-la dans le champ, puis touche
   « Prévisualiser ». » · bouton « Copier la liste » · « Liste copiée. Colle-la dans le champ. » · « La liste n'a pas
   pu être copiée. Essaie de nouveau. »
3. **Le cours de la liste** · « L'aperçu montre les huit personnes, telles qu'elles seront importées. Dessous,
   l'application demande à quel cours les rattacher : elle propose le cours actif, celui de la démo. Choisis le cours
   que tu viens de créer, puis confirme l'import. » · « Choisis le cours 601-999-DM, puis touche « Importer
   8 étudiant·es ». » · avis : « L'aperçu est refermé : touche « Prévisualiser » pour le rouvrir. »
4. **Un horaire** · « Le nouveau groupe a besoin d'un horaire. Le matériel : le groupe 00002, le nom « Mardi matin »,
   une séance, le mardi de 8 h à 12 h, quatre périodes. L'application en tire le calendrier des séances : c'est à
   chacune que s'attachent les présences. » · « Remplis les champs obligatoires avec le matériel fourni, puis touche
   « Créer l'horaire ». »
5. **Un groupe-cours** · « Réunis les cinq morceaux : le trimestre « Démonstration », le cours 601-999-DM, le groupe
   00002, l'horaire « Mardi matin » et l'enseignant de la démo, Primo Primavera. Le groupe-cours relie tout : c'est
   sur lui que travaillent le Suivi et l'Évaluation. » · « Choisis les cinq morceaux, puis touche « Créer le
   groupe-cours ». »
6. **D'un groupe à l'autre** · « Le nouveau groupe est maintenant dans l'en-tête, à côté de celui de la démo. C'est
   là que tu passes d'un groupe à l'autre : tout ce que montrent le Suivi et l'Évaluation suit le groupe choisi.
   Choisis celui que tu viens de créer. » · « Dans l'en-tête, choisis le groupe 601-999-DM. »
7. **Un premier cours** · « Voici la saisie des présences du nouveau groupe. Choisis un de ses cours : « Précédent »
   et « Suivant » passent de l'un à l'autre. Tout le monde est présent par défaut : tu ne notes que les absences et
   les retards, et tout s'enregistre au fur et à mesure. Note une absence pour l'exemple, puis verrouille la saisie :
   c'est ce qui dit à l'application que ce cours a eu lieu. » · « Choisis un cours du groupe, note une absence ou un
   retard, puis touche « Verrouiller la saisie ». » · avis : « Ce jour-là, ce groupe n'a pas cours : touche
   « Précédent » pour revenir à son dernier cours. »
8. **Le groupe d'un coup d'œil** · « Voici le groupe que tu viens de monter. Chaque point blanc est une des huit
   personnes de la liste, placée selon son assiduité : l'absence que tu as notée s'y voit déjà. C'est le coup d'œil à
   donner avant d'entrer en classe. Tu as fait tous les gestes : il reste à les refaire avec ta vraie liste, ton vrai
   cours et ton vrai horaire. » · « Explore la démo, ou refais le parcours avec ton matériel. »

Une ligne de Nouvelles, proposée, pas écrite : « Les parcours se font maintenant en deux temps : d'abord dans la
démo, avec du matériel fourni, puis avec le tien. « Mettre ta classe en place » ouvre la marche. »

## 5. Les bancs (Chromium du cloud, `playwright.chromium.config.js` ; le verdict WebKit vient à la fusion)

`tests/integration/deux-temps-modelisation-2026-11-12.spec.js`, quatre essais, et
`tests/unit/sentinelle-deux-temps-2026-11-12.test.js`, vingt-quatre.

| Essai | Ce qu'il juge | Break-test (code cassé → rouge → rétabli → vert) |
|---|---|---|
| le panneau | le texte mot pour mot, le choix et son défaut (drapeau du banc éteint), la carte sans modélisation et son bouton qui ne part pas, « Remettre la démo à neuf » visible ou caché, le choix qui se souvient après rechargement, les flèches du clavier | sentinelle : « à ton rythme » changé → rouge |
| la modélisation de bout en bout | les huit bulles dans la démo, **la pulsation et une flèche jugées avant chaque geste** (dix gestes), la liste copiée puis collée au clavier, « Annuler » dans l'aperçu, l'état de la modélisation hors des données | sentinelle : « Câlin » → « Jovial » (un nom du pack) → rouge |
| **le confinement** (même essai) | un trimestre réel peuplé au départ (cours, profil, trois étudiant·es, horaire, groupe-cours, une séance verrouillée) ; **toutes les clés hors `demo_*`, base et stockage, identiques avant l'entrée et après la sortie** ; seul écart permis, nommé : `laboCodex.assistance` | quatre gardes de la sortie cassées dans un même passage : le rouge nomme `cours`, `seancesCompletes_gc_GC_DEMO` et celle du groupe créé, `listeCours` et `modeApplication`, `etatTirage` |
| ce qui est créé reste dans la démo (même essai) | « Refaire » y revient : le cours marqué est là, la modélisation reprend à « D'un groupe à l'autre » puis va à sa dernière bulle | |
| « Refaire avec mon matériel » (même essai) | la démo se referme, le parcours réel repart (« … sur 8 », trimestre `a2026`), « Mon matériel » choisi, le cours de la démo absent de la vraie liste | |
| la remise à neuf | la confirmation et ses deux phrases ; « Annuler » ne change rien ; confirmée, **les `demo_*` sont identiques à la démo jamais ouverte, et toutes les autres clés identiques** ; démo ouverte, elle reste ouverte avec ses dix étudiant·es | l'effacement des `demo_*` retiré → rouge (`demo_calendrierComplet`, `demo_indicesCP`… restent) |
| une sortie pendant l'entrée | les deux bascules lancées sans attendre : aucune clé réelle ne change | la file retirée → rouge (`a2026_snapshots_…`) |
| sentinelle Vitest (24 essais) | le texte validé, les deux mots du choix, le stockage hors de `db`, la règle de la liste, la marque du cours, l'ordre « ranger puis retirer », la file, la remise à neuf bornée à `demo_*`, le parcours réel inchangé | `creeEnDemonstration` retiré de la marque → rouge |

**Mesures (Chromium, 12 nov.)** : `deux-temps-modelisation` 4 sur 4 ; Vitest complet 920 fichiers, 11 498 essais, tous
verts (après avoir ajouté `keysSync` à la doublure de la sentinelle T7, et sorti le bouton de la carte en fonction
pour tenir le plafond de complexité à 434).

**Bancs voisins, rejoués** : `assistance-refus` 2 sur 2, `registre-des-parcours` 1 sur 1 ; les bancs de la démo
(`demo-saisie-presences`, `guidage-demo`, `noms-demo-totems`, `t3-retirer-les-copies`, `copie-demo-bibliotheque`)
10 sur 11 ; `parcours-1-et-2` 6 sur 7 ; `parcours-2-ma-classe` 2 sur 4 ; `pied-de-page-et-assistance` 2 sur 4 ; les
parcours 3 à 9 et `parcours-fleches` 68 sur 73 au premier passage. Chaque rouge a été rejoué sur `main` :
aucun n'est propre à ce lot. Deux d'entre eux (`parcours-3`, « grille en points » ; `parcours-8`, « sans fichier, sur
une grille déjà employée ») passent sur `main` et passent aussi sur la branche au second essai : instables, un contour
attendu 5 s.

**Rouges nommés, tous rouges aussi sur `main` (`271dc9177`) sous Chromium, mesurés dans un second arbre** :
- `parcours-1-et-2`, « panneau : titre, phrase… » : le panneau mesuré à −126 px du bord droit (pris pendant son entrée).
- `pied-de-page-et-assistance`, 820 px, sombre et clair : la version et « Nouveautés » ne sont pas sur la même ligne.
- `parcours-2-ma-classe`, deux essais : une minuterie dans la page ne part pas sous l'horloge figée (le parcours réel,
  lui, y est joué jusqu'à « Terminer » avant ce point).
- `parcours-3`, « étape 8 à 820 px » ; `parcours-8`, « 820 px : aucun avis ne couvre la bulle » ; `parcours-fleches`,
  « la flèche suit le défilement et le redimensionnement » : non creusés.
- `copie-demo-bibliotheque`, « rien sans le geste » : **une grille dupliquée dans la démo se retrouve dans
  `a2031_grillesTemplates`, le vrai trimestre, après la sortie.** Vert au verdict WebKit du 11 nov. (1 623 sur 1 624) ;
  sous Chromium, c'est une écriture de la démo dans des données réelles. Non creusé : hors du lot, à ton jugement
  (issue 2, non inscrit).


**Les écrivains d'un cours, passés en revue** (`CoursEntite.creer`) : le formulaire du Cadre, en création et en
duplication (marqué par ce lot) ; le service de Suivi › Rencontres (déjà marqué) ; la vue simple (`js/vue-simple.js`),
qui ne s'ouvre pas dans la démo. Rituel de fin de session : aucun `innerHTML`, aucun gestionnaire en ligne, aucun
`console.log`, aucun nom réel dans le diff ; le hook de commit signale une écriture sans assainissement, dans le banc
(un test, acquitté ici).

## 6. Ce que j'ai supposé

- Le choix du matériel et l'état des modélisations vivent dans `localStorage` (`laboCodex.assistance`), hors de
  `db` : rien de ce qu'on fait dans la démo n'écrit dans les données. Le rang du menu (« 2 sur 9 ») suit toujours
  les parcours faits sur les vraies données.
- Sous un banc piloté (`navigator.webdriver`), sans choix, le matériel est « Mon matériel » : les bancs des neuf
  parcours touchent « Commencer » pour jouer sur les vraies données. Même règle que la vue au démarrage. Le banc du
  panneau éteint le drapeau pour juger le vrai défaut.
- « Refaire avec mon matériel » choisit aussi « Mon matériel » dans le panneau.
- « Refaire », sur une modélisation faite, reprend où la démo en est ; « Remettre la démo à neuf » repart de zéro.
- La remise à neuf efface TOUTES les clés `demo_*`, pas seulement celles que `peuplerNamespace` réécrit : sans cela,
  le calendrier, les indices et les verrous de la démo survivraient.
- La sortie de la démo retire `seancesCompletes_gc_GC_DEMO` chez qui l'a déjà (un cache de la démo).
- « Commencer avec ma classe », à la fin de « Découvrir », part toujours sur les vraies données : non touché.
- Aucune release ni ligne de Nouvelles écrite : la version reste 1.243.0. Le build passe à **1112-0943**
  (`release.mjs --build-only`) : la garde anti-cache l'exige pour que les jetons `?v=` des fichiers du lot changent.
