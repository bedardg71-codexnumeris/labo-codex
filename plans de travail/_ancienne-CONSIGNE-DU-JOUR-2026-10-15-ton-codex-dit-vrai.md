# Consigne du jour – « Ton codex dit vrai » : trois corrections de mots (#994, #993, #1020)

> Écrite par Cowork le 15 octobre 2026 à 9 h 25 (Toronto, mesurée par `date`). L'ancienne consigne (préparer la clôture de l'hiver 2026, avec le verdict de Cowork du 14 à 11 h 01) est archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-14-clore-l-hiver-2026.md`. Commite ce fichier, ce déplacement et `DECISIONS-2026-10-15-ton-codex-dit-vrai.md` avec ton lot.

## Où on en est

`main` à `ee49f035` au moment de l'écriture : 1.201.0 en ligne depuis 9 h 06 (ton rapport). **Remesure avant de toucher.** Une autre session écrit l'observation sous `plans de travail/observation/` : n'y touche pas.

## Les décisions de Grégoire (15 oct. 2026, de 9 h 18 à 9 h 23)

Toutes dans `plans de travail/DECISIONS-2026-10-15-ton-codex-dit-vrai.md`, mots d'écran compris. **Recopie les mots tels quels**, apostrophes et guillemets compris ; un mot qui ne tient pas dans l'écran remonte à Cowork, il ne se retouche pas en chemin.

## Le mandat : un lot, trois parties

### 1. #994 – l'échec d'écriture du codex ne devine plus la cause

- `_ecrireLeCodexPrepare` (`js/codex.js`) : `reglage.echec` ne reçoit aujourd'hui que la taille. Il lui faut savoir si le navigateur a signalé lui-même un manque d'espace (`QuotaExceededError` dans `sauvegarde.erreur`). Les deux appelants, `_mettreAJourLeCodex` et `ecrireCodexAPartAvantSuppression`, prennent les mots de la question 1.
- Mesure, et dis-le dans la demande de relecture : quelles erreurs `sauvegarderVersDestination` peut rendre sur chaque chemin (fenêtre de choix, partage, téléchargement dit absent), et si l'une d'elles dit l'espace sous un autre nom que `QuotaExceededError`. N'en ajoute aucune à la règle sans le dire.
- Le témoin (`_direNonMisAJour`) est déjà neutre : n'y touche pas. Les boutons « Réessayer » et « Télécharger à la place » ne changent pas.

### 2. #993 – une seule façon de dire une taille de fichier

- Une seule fonction (son emplacement : à toi). Base 1000, sauf sous Windows (1024). Unités « Ko », « Mo », « Go ». La détection du système : à toi ; dis laquelle, et ce qu'elle rend sur un iPad (Safari s'y déclare souvent Mac : même base, sans conséquence).
- Tous les écrans qui disent une taille de fichier à l'usager passent par elle. L'inventaire de la question 2 est un point de départ : **remesure-le** (`1024`, `1048576`, `Math.log(1024)`…), et liste dans la demande de relecture ceux que tu laisses, avec leur motif. Les « K car. » de `db.js` sont hors champ (des caractères, pas des octets).
- Les limites gardent leur valeur en octets ; seul leur affichage suit la règle. ⚠ Là où un texte écrit la limite en dur (« Limite : 2 Go », « Limite : 50 Mo »), il doit dire le même nombre que la fonction pour la même valeur : mesure, et dis ce que chaque limite affichera sous Windows et ailleurs.
- « environ » reste là où il est aujourd'hui, et seulement là. Les fonctions remplacées sont retirées (zéro-dette), pas laissées en alias.

### 3. #1020 – la fenêtre du codex à part dit ce que fera sa réouverture

- `ecrireCodexAPartAvantSuppression` : la phrase qui suit la première devient celle de la question 3 ; mets à jour le commentaire qui date les mots (2 oct. 2026, 20 h 28 → 15 oct. 2026, 9 h 23).
- Le reste de #1020 (après réouverture, les mises à jour s'écriraient sous le nom « … avant-suppression ») n'est pas dans ce lot.

### Les lignes à poser au BACKLOG

Coche #994 et #993 une fois le lot fait ; #1020 reste ouverte. Sous chaque fiche, cette ligne, telle quelle :

- #994 : `**Décidé par Grégoire le 15 oct. 2026 à 9 h 18** : le message ne devine plus la cause ; l'espace n'est nommé que si le navigateur signale lui-même un manque d'espace. Mots : plans de travail/DECISIONS-2026-10-15-ton-codex-dit-vrai.md, question 1.`
- #993 : `**Décidé par Grégoire le 15 oct. 2026 à 9 h 22** : l'application compte comme le système de la personne, base 1000 sur Mac et iPad, 1024 sous Windows, partout où elle dit une taille de fichier. Détail : plans de travail/DECISIONS-2026-10-15-ton-codex-dit-vrai.md, question 2.`
- #1020 : `**Décidé par Grégoire le 15 oct. 2026 à 9 h 23** : la fenêtre du codex à part dit que le rouvrir remet aussi le reste des données dans leur état du jour (mots : même fichier, question 3) ; fait au lot « Ton codex dit vrai ». Reste ouvert : après la réouverture, les mises à jour s'écrivent sous le nom « … avant-suppression ».`

### Source ou stock

Source seulement : des mots et un calcul d'affichage. Rien n'est écrit dans les données de personne.

## Pas de porte terrain

Une machine peut répondre. Les bancs le prouvent, chaque essai neuf avec son break-test : la fonction de taille (254 700 000 octets → « 255 Mo » hors Windows, « 243 Mo » sous Windows, à la précision que chaque écran emploie aujourd'hui) ; la fenêtre d'échec avec et sans `QuotaExceededError`, pour la mise à jour et pour le codex à part ; la phrase du codex à part.

## La ligne des Nouvelles

Propose-la dans la demande de relecture, en mots d'utilisateur ; Cowork la soumettra à Grégoire avec la version du soir.

## La méthode

Commit, Vitest complet (depuis `tests/`), demande `plans de travail/DEMANDE-RELECTURE-2026-10-15-ton-codex-dit-vrai.md`. **Aucun push, aucune release, aucun verdict Playwright avant son signal du soir.** Rapport court à Grégoire en gestes d'utilisateur.

## Verdict de Cowork, 15 oct. 2026 à 9 h 46 (Toronto, mesuré par `date`)

**Relu sur `69fdd026` : accepté, sans correction.** Lu au diff et dans `DEMANDE-RELECTURE-2026-10-15-ton-codex-dit-vrai.md` ; non exécuté par Cowork (ta suite complète verte, 8 786 sur 8 786, et les break-tests décrits font foi).

- Les mots des trois fenêtres sont ceux du fichier de décisions, lus dans `js/codex.js`. La place de la phrase d'espace (supposition 1) est acceptée.
- Suppositions 2 à 5 acceptées : virgule partout, octets sous la base, unité qui suit la taille, précision de chaque écran gardée.
- `js/taille-fichier.js` lu en entier : détection par `userAgentData.platform` puis par l'agent ; l'iPad tombe en base 1000.
- Les limites affichées « 52 Mo » et « 105 Mo » hors Windows sont acceptées. Motif : le message dit la taille du fichier et la limite dans la même base, la comparaison reste juste ; arrondir la valeur à 50 000 000 octets changerait ce que l'application accepte.
- **La trouvaille (fichier tenu, erreur avalée) : issue 3, pas de fiche.** Motif : le détour par la fenêtre de choix ne dit rien de faux. Si l'espace manque vraiment, le second échec, par la fenêtre de choix, porte sa propre erreur et la phrase d'espace s'affiche ; seule une annulation de cette fenêtre perd la cause, sans rien affirmer. **À faire en tête du prochain lot** : un commentaire de deux lignes, à l'endroit où l'erreur est avalée, qui dit cela.
- La ligne des Nouvelles sera reformulée par Cowork sans « base 1000 » ni « base 1024 », et soumise à Grégoire avec la version du soir.
