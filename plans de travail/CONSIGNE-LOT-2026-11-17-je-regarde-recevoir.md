# Consigne du lot — « Je regarde » de « Recevoir les productions, rendre tes rétroactions » (17 nov. 2026)

> Préparée par une session du nuage (Claude Code) avec Grégoire, le 17 nov. 2026, pour une session du nuage qui
> code de nuit. Ce fichier est le mandat : il porte les décisions de Grégoire, ce qui a été mesuré, ce qui reste à
> mesurer, et les questions qui lui reviennent. Tout ce qui est marqué « inférence » ou « à mesurer » n'est pas un fait.

**Branche** : une branche neuve, partie de `origin/main` (`03dc7d2f` ou plus récent, 1.249.0). Chromium seulement
(`tests/playwright.chromium.config.js`), en le disant ; le verdict WebKit viendra à la fusion, sur le Mac.
**Livraison** : push de la branche et une PR en brouillon pour son aperçu Netlify. **Pas de fusion, pas de release,
pas de Nouvelles** : Grégoire l'essaie d'abord.

---

## 0. Où en est le projet (mesuré sur `origin/main`, 17 nov., 9 h 02)

- En ligne (1.249.0) : seul « Découvrir » est ouvert. `PARCOURS_OUVERTS = ['decouvrir']` (`js/assistance.js`) : les
  huit autres parcours restent inscrits, mais ne sont offerts nulle part.
- Dans `main`, fermés par ce verrou : le panneau en quatre temps (« Je regarde » / « Nous faisons ») ; le « Je
  regarde » de « Mettre ta classe en place » (`js/parcours-classe.js`, huit bulles, deuxième groupe de dix) ; le
  « Je regarde » d'« Évaluer une première production » (`js/parcours-evaluer.js`, `pourLeModele`, neuf étapes).
- **Pas fait** : le « Je regarde » de « Recevoir les productions, rendre tes rétroactions » (`js/parcours-recevoir.js`,
  qui ne se joue que sur les vraies données : neuf étapes, deux voies). Aucune branche ne le porte.

**À lire avant de planifier**, de façon ciblée :
- `plans de travail/CONSIGNE-2026-11-16-parcours-je-regarde.md` : les règles de ton et de forme des bulles (la
  perspective, « Remplir », les règles a à f du moteur, la dernière bulle qui rappelle l'objectif). **Elles valent ici.**
- `plans de travail/RAPPORT-2026-11-13-deux-temps-modeles.md` (partie B) et
  `plans de travail/RAPPORT-2026-11-15-deux-temps-remise-a-jour.md` : comment le modèle d'« Évaluer » reprend les
  étapes du parcours réel, son matériel, son refus (`refusModele`), son confinement et ses break-tests. **C'est le
  patron à suivre.**
- `plans de travail/RAPPORT-2026-11-16-decouvrir-en-ligne.md` : le verrou.
- `js/demo-activation.js` (T3, « Retirer les copies », et le confinement de la sortie).

## 1. Ce que Grégoire a décidé (17 nov. 2026, dans cette session)

1. **Le principe** est celui de « Mettre ta classe en place » : le modèle se joue dans la démo, sur le deuxième
   groupe ; la personne fait elle-même chaque geste dans les vrais écrans ; le matériel est fourni ; chaque bulle
   nomme, pointe et explique, un geste à la fois.
2. **L'ordre** : importer, puis annoter, puis évaluer, puis regarder la rétroaction. L'évaluation sans copie reste
   dans le parcours précédent (« Évaluer une première production ») : les deux parcours sont distincts, et
   Grégoire tient à cet enchaînement.
3. **Le matériel** : trois copies fictives, une page chacune, de trois étudiant·es du deuxième groupe. Elles sont
   dans `plans de travail/materiel-2026-11-17-copies-deux-rives/` :
   - `Enjouee_9900002_Artefact-1_Remis_le_2026-09-08_23h41m12s.pdf` (Loutre Enjouée) ;
   - `Doux_9900005_Artefact-1_Remis_le_2026-09-09_07h58m03s.pdf` (Tapir Doux) ;
   - `Vaillante_9900006_Artefact-1_Remis_le_2026-09-08_19h22m47s.pdf` (Antilope Vaillante).
   Ce sont des « Artefact 1 » sur le texte « Deux-Rives » : la production que le modèle d'« Évaluer » fait créer
   (`MATERIEL.production`, `js/parcours-evaluer.js`). Le reste du matériel (grille « G4H Sans français », échelle
   « IDME et niv 0 », cartouche « Artefact 1 ») existe déjà et ne se refait pas.
4. **Option a, le dépôt des copies** : un bouton dans la bulle de l'étape 1 place les trois copies dans la zone de
   dépôt. La personne ne manipule pas de fichiers. La bulle dit en une phrase d'où ils viennent dans la vraie vie.
   La voie « Rien à importer » n'est pas dans le modèle.
5. **Une seule copie est travaillée** : celle de Loutre Enjouée. Les deux autres restent « Importé ».
6. **Les niveaux de Loutre Enjouée, les tampons et les codes sont libres** : la personne choisit ce qu'elle veut.
   Le modèle n'impose rien à ces étapes ; il avance sur l'état atteint, comme le parcours réel.
7. **Les sept autres personnes du groupe sont déjà évaluées** quand le modèle commence : pas de « Non reçu ». Des
   évaluations fictives, **verrouillées**, **sans fichier attaché**. L'enseignant·e peut les déverrouiller et jouer
   avec. Niveaux validés par Grégoire (« oui, c'est plausible ») :

   | | Structure | Rigueur | Plausibilité | Nuance |
   |---|---|---|---|---|
   | Toucan Souriante (9900010) | E | E | M | M |
   | Hermine Généreuse (9900004) | E | M | M | M |
   | Cigogne Bienveillante (9900008) | M | M | M | D |
   | Koala Câlin (9900001) | M | M | D | D |
   | Yack Amical (9900007) | M | D | D | D |
   | Lémur Rieur (9900003) | D | D | I | D |
   | Caribou Attentionné (9900009) | D | I | D | I |

   L'une des sept est celle que la personne a évaluée elle-même dans le modèle d'« Évaluer » (M, D, D, D, les niveaux
   imposés). Le tableau la place sur Yack Amical **par hypothèse** (voir §3.1).

## 2. Les étapes proposées (les neuf du parcours réel, dans le même ordre)

| | Étape | Dans la démo |
|---|---|---|
| 1 | Leurs productions | le bouton de la bulle dépose les trois copies dans la zone |
| 2 | Vérifie avant d'importer | choisir la production du modèle d'« Évaluer », voir les trois DA reconnus, « Importer », confirmer |
| 3 | La liste | trois « Importé », sept évaluées ; « Actions › Annoter » sur la ligne de Loutre Enjouée |
| 4 | Tes tampons | l'engrenage, lire les phrases, « Enregistrer » |
| 5 | Annoter | poser ce qu'on veut, puis « Annoter ▾ › Évaluer » |
| 6 | Évaluer | un niveau par critère, au choix |
| 7 | Ta rétroaction | relire, puis le cadenas « Verrouiller » |
| 8 | Rends tes rétroactions | « Exporter pour Léa » |
| 9 | Remets-les | la dernière bulle : l'objectif atteint, la suite dans la démo, « Nous faisons » |

Ce que chaque étape désigne et ce qui la fait avancer ne changent pas : seuls le texte, le geste et le bouton de
matériel sont propres au modèle (le patron de `pourLeModele`). **Les textes des bulles sont PROPOSÉS**, dans le ton de
la consigne du 16 nov. ; Grégoire les juge sur l'aperçu. Les textes validés du parcours réel ne changent pas d'un mot
(leur sentinelle reste verte).

**Préalable** : le « Je regarde » d'« Évaluer une première production » fait (la production, sa grille, son échelle
et sa cartouche existent dans le deuxième groupe). Sinon le panneau refuse, le nomme, et la pulsation va à sa carte.

## 3. À MESURER AVANT TOUT CODE (et à rapporter)

1. **Qui est évalué·e au modèle d'« Évaluer ».** `etudiantDeLaLigne()` prend la première ligne de la liste : la
   personne dépend du tri. Inférence, non mesurée : par nom, Yack Amical ; par prénom, Antilope Vaillante, qui est
   l'une des trois copies. Mesure-le à l'écran. **Ce qu'il faut garantir** : les sept évaluations portent sur les
   sept personnes sans copie, quelle que soit celle qui a été évaluée avant ; aucune évaluation n'est posée sur
   Loutre Enjouée, Tapir Doux ni Antilope Vaillante. Si le modèle d'« Évaluer » peut tomber sur l'une des trois,
   **arrête-toi là-dessus et dis-le** : la correction touche ce modèle, et c'est une décision de Grégoire.
2. **Comment poser les six (ou sept) évaluations fictives.** Elles doivent être de vraies évaluations de
   l'application (mêmes champs, même verrou, rétroaction tirée de la cartouche), écrites **dans la démo seulement**
   (`demo_*`), au lancement du modèle, sans rien écraser : une évaluation qui existe déjà pour une personne n'est pas
   remplacée (push sans replace, skill `integrite-globaux`). Passe par les fonctions de l'application qui écrivent
   une évaluation, pas par une écriture directe de la clé, si c'est possible ; sinon dis pourquoi.
3. **Les fichiers dans une page ouverte en `file://`.** Les bancs ouvrent `index.html` en `file://`, où `fetch` d'un
   fichier local ne répond pas (inférence : c'est la raison pour laquelle `pack-demo-10.js` est chargé par une
   balise de script). Les trois PDF (830 Ko en tout) devront sans doute être livrés dans un script chargé à la
   demande, avec son jeton `?v=` (sentinelle #825), et non dans `index.html`. Mesure, puis choisis.
4. **Les dates.** L'échéance de la production du modèle est le **9 septembre 2025** (la démo est en A2025). Les trois
   fichiers sont nommés « Remis le **2026**-09-08 » et « **2026**-09-09 », et l'en-tête imprimé des copies dit
   « A2026 ». Si l'application lit la date de remise dans le nom, les trois copies auraient un an de retard.
   Supposition de la session qui a préparé ce lot, à corriger au besoin : **les fichiers sont déposés sous des noms
   en 2025** (mêmes jours, mêmes heures) ; l'image, elle, garde « A2026 ». Dis ce que tu as mesuré et ce que tu en fais.
5. **L'import dans la démo.** `validerMagicBytes` s'applique (règle de sécurité 3). Les copies importées en démo
   restent dans la démo (T3 et T4 : IndexedDB seulement) ; « Retirer les copies » et « Remettre la démo à neuf » les
   emportent, fichiers et vignettes compris.
6. **« Exporter pour Léa » dans la démo** : ce qu'il produit avec huit évaluations verrouillées dont sept sans
   fichier, et s'il écrit quoi que ce soit hors de `demo_*`.

## 4. Les règles qui ne se négocient pas

- **Aucune écriture dans les vraies données.** Le banc de confinement du modèle d'« Évaluer » est le patron : un
  trimestre réel peuplé au départ, toutes les clés hors de `demo_*` identiques avant l'entrée et après la sortie,
  avec son break-test. Ce lot ajoute des blobs (les copies) : le relevé doit aussi couvrir IndexedDB.
- **Aucun effacement non voulu.** Les évaluations fictives ne remplacent rien.
- **Ne rouvre pas les parcours sur `main`.** Sur ta branche seulement, comme le 16 nov. (`PARCOURS_OUVERTS`, et côté
  tests ce que `RELAIS.md` décrit à l'entrée du 15 nov., 21 h 39). Dis comment tu l'as fait.
- Ni `js/config.js` ni `js/navigation.js` (zones protégées). Les notes d'A2025 et d'H2026 ne sont pas rouvertes.
- Aucun nom d'élève réel. Les sept noms et les trois copies sont fictifs.
- `CLAUDE.md` : `echapperHtml`, zéro handler inline, zéro `console.log`, jetons `?v=` selon la garde, Vitest lancé
  depuis `tests/`, le plafond de complexité.

## 5. Bancs attendus (Chromium du nuage, en le disant)

- Le modèle de bout en bout dans la démo, après les deux modèles précédents : la pulsation et une flèche jugées
  avant chaque geste ; les trois copies dans la zone après le bouton ; trois « Importé » et sept évaluées à l'étape 3.
- Le refus sans le préalable, avec son break-test.
- Les sept évaluations : présentes, verrouillées, sans fichier, aux niveaux du tableau ; celle faite au modèle
  d'« Évaluer » n'est pas remplacée ; aucune sur les trois copies. Break-test.
- Le confinement, clés et blobs, avec son break-test ; « Remettre la démo à neuf » rend la démo du pack.
- Une sentinelle Vitest : le tableau des niveaux et les trois noms de fichiers confrontés à cette consigne.
- Les bancs existants du parcours réel et des deux modèles précédents : rejoués ; chaque rouge départagé avec `main`.
- Une porte terrain pour l'iPad (markdown ; Cowork publie l'artefact) : le parcours clic par clic, et les textes
  proposés en décisions.

## 6. Ce qui revient à Grégoire (ne décide pas à sa place)

- Les textes des neuf bulles et le libellé du bouton de l'étape 1.
- **Le nom d'un auteur réel sur les copies** : chacune porte « Texte inventé à la manière de Sébastien Bérubé,
  *Rivières-aux-Cartouches* (Perce-neige, 2023) ». Ce n'est pas un nom d'élève, mais la démo est publique : signale-le
  dans la porte, sans y toucher.
- Tout ce qui toucherait le modèle d'« Évaluer » (§3.1).

## 7. Rapport

`plans de travail/RAPPORT-<date>-je-regarde-recevoir.md`, avec en tête le dernier relais (branche, base, fait, reste).
Pour la conversation du Projet, un bloc de quinze lignes au plus : le commit, le build, l'adresse de l'aperçu ; les
six mesures du §3 et ce que tu en as fait ; les étapes ; les textes proposés ; les bancs et leurs break-tests ; ce que
tu as supposé ; ce que tu n'as pas pu vérifier.
