# Consigne : lot « Mettre tes données à l’abri, le sixième parcours »

**Recopiée par Cowork le 8 nov. 2026 vers 20 h 35 (heure de Montréal), mot pour mot, depuis la page du tri** (« Tri du chantier Labo Codex »), où elle vivait seule. En ligne : 1.237.2. Ce fichier se commite AVEC son lot (PROTOCOLE.md).

**Quand le lancer (page du tri)** : à lancer après « Les deux parcours », sur une branche à part ; il ne dépend pas des troisième à cinquième parcours

**Ce que Grégoire verra (page du tri)** : Tes décisions du 8 nov., et tes quatre textes validés de 12 h 48 à 13 h 43. Ce que tu verras : dans le panneau « Assistance », un sixième parcours. La personne ouvre le menu Codex, met son codex à jour, le range dans un lieu protégé (une clé USB chiffrée, un dossier synchronisé avec un infonuage chiffré), puis apprend quand le rouvrir, sans le faire : ouvrir un codex remplace ce qui est dans l’application. Aucun produit n’est nommé. Le rappel « Mets ton codex à jour » ne s’ouvre plus en plein parcours.

**Références (page du tri)** : (document « Parcours d’assistance : sixième parcours » ; js/codex.js, js/modal-backup-reminder.js, js/fichier-sortant.js)

---

Lot « Mettre tes données à l'abri », le sixième parcours de l'assistance. Après le lot « Les deux parcours » (le panneau « Assistance » et le moteur des parcours) ; il ne dépend pas des troisième à cinquième parcours. Sur une branche à part. Mêmes règles : pas de fusion vers main ni de publication sans l'accord de Grégoire, rien au changelog. Les textes des bulles sont validés par Grégoire, un à un, le 8 nov. (12 h 48 à 13 h 43) : pose-les mot pour mot. Ne modifie aucun autre texte lu par l'utilisateur que ceux nommés ici.
Vocabulaire (Grégoire, 8 nov.) : « production » pour ce que l'étudiant·e remet, jamais « copie », qui ne garde que le sens de sauvegarde ; aucun produit nommé dans un texte neuf, ni infonuage, ni appareil, ni navigateur : « infonuage », « tablette », « ton appareil ».

POURQUOI
Les données de Labo Codex vivent dans le navigateur. Le codex est leur seule copie hors de lui, et il ne change que par « Mettre à jour le codex » (l'enregistrement automatique est retiré depuis le 29 sept.). Le rappel « Mets ton codex à jour » interrompt déjà les parcours sans que rien ne l'explique. Ce parcours fait écrire un premier codex, le fait ranger dans un lieu protégé, et dit quand le rouvrir, sans faire faire ce geste : ouvrir un codex remplace l'espace de travail (chargerCodex, codex.js). Le codex n'est pas chiffré : la protection vient de l'endroit où on le range (décision de Grégoire, 12 h 43).

LE PANNEAU
- Sixième parcours de la liste. Titre : « Mettre tes données à l'abri ». Ligne : « Une copie complète de ton travail, hors du navigateur et rangée dans un lieu protégé : ton codex. »
- Sans trimestre réel (la démo ne compte pas : le codex l'exclut, _sansLeDemo), le bouton ne lance pas le parcours ; le panneau dit : « Commence par « Mettre ta classe en place » : ton codex gardera ce que tu y auras mis. »
- Le compteur du menu compte six parcours.
- Un texte du menu Codex change (validé par Grégoire, 8 nov., 14 h 47). Sans codex actif, le haut du menu (_actualiserMenu, codex.js) dit « Aucun codex actif — ouvre ou crée un codex pour commencer. » : il oriente vers « Ouvrir », qui remplace l'espace, ou vers « Nouveau codex », qui n'écrit rien, alors que la bulle 2 dit de toucher « Mettre à jour le codex ». Il devient : « Pas encore de codex : « Mettre à jour le codex » en crée un avec tes données. »
- Pendant ce parcours, et pendant tout autre parcours, le rappel « Mets ton codex à jour » (modal-backup-reminder.js) ne s'ouvre pas : vu le 8 nov., il bloque les clics en plein parcours. S'il était dû, il attend la fin du parcours. Une mise à jour réussie pendant ce parcours le repousse comme d'habitude.

LES QUATRE ÉTAPES
Étape 1, « Pourquoi un codex ». Contour sur le bouton « Codex » de l'en-tête. Texte : « Tes données vivent dans ce navigateur, sur cet appareil : Labo Codex ne les envoie nulle part. Elles peuvent donc être perdues si tu effaces les données de sites, changes de navigateur ou d'ordinateur. Ton codex en garde une copie complète, productions de tes étudiant·es comprises, que tu rouvres sur n'importe quel appareil. Ce fichier ne change que quand tu le mets à jour : l'application ne le fait jamais à ta place. Touche « Codex », en haut de l'écran. » Avance quand le menu Codex est ouvert.
Étape 2, « Mettre à jour ». Le menu ouvert, contour sur « Mettre à jour le codex », puis sur « Mettre à jour » dans l'aperçu. Texte : « Touche « Mettre à jour le codex ». Une fenêtre d'aperçu s'ouvre ; son « i » te dit ce que contient le fichier. Touche « Mettre à jour » : l'application rassemble tes données et les fichiers des productions de tes étudiant·es en un seul fichier. Plus tu as importé de productions, plus il est lourd, et plus sa préparation peut prendre un moment. Refais ce geste chaque semaine, et après chaque séance de travail importante : une saisie de présences, une série d'évaluations. »
Étape 3, « Range ton fichier ». Un texte commun, et une phrase choisie selon le chemin que prendra l'écriture (sauvegarderVersDestination, codex.js), à la place du crochet. Texte : « Ton codex contient les noms, les DA et les productions de tes étudiant·es, et il n'est pas chiffré : quiconque a le fichier peut le lire. Range-le dans un lieu protégé : une clé USB chiffrée, ou un dossier synchronisé avec un infonuage chiffré, protégé par un mot de passe solide et une double authentification. Ton ordinateur, lui, devrait avoir un mot de passe et un disque chiffré. [Phrase selon le navigateur.] Quand le menu affiche « Ton codex est à jour », ta copie est faite. »
  - Fenêtre de choix d'emplacement : « Une fenêtre te demande où l'enregistrer : choisis ta clé ou ton dossier synchronisé. Jusqu'à ce que tu recharges la page, chaque mise à jour réécrira ce même fichier, sans rien te demander. »
  - Feuille de partage : « Ton appareil te propose de partager le fichier : choisis de l'enregistrer, sur ta clé ou dans ton dossier synchronisé. »
  - Téléchargement : « Le fichier arrive dans tes téléchargements. Quand tu l'y vois, réponds « Il y est », puis déplace-le sur ta clé ou dans ton dossier synchronisé. Chaque mise à jour t'en remettra un nouveau : c'est le plus récent qui compte. »
  Le fichier déjà tenu (réécrit sans question) n'arrive pas dans un premier parcours ; s'il arrive, prends la phrase de la fenêtre de choix sans sa première phrase, et dis-le.
  Avance quand le menu affiche « Ton codex est à jour » (l'état posé par _marquerCodexAJour). Sur un échec (« Codex non mis à jour »), la bulle reste ; aucun texte de plus : la fenêtre d'échec et ses boutons suffisent.
  ATTENTION, LE MOMENT : une bulle ne peut pas se poser sur une fenêtre du système (choix d'emplacement, feuille de partage). La bulle 3 doit être lue AVANT qu'elle s'ouvre, et le toucher qui l'ouvre doit rester frais (le sélecteur et le partage exigent un geste de moins de 5 s environ : _motifToucherFrais). Propose le moment ; par exemple, la bulle 2 avance à l'ouverture de l'aperçu, et la bulle 3 se pose près de son bouton « Mettre à jour ». Choisis la phrase selon ce que le navigateur offre (showSaveFilePicker, partage de fichiers, sinon téléchargement). Dis ce que tu as retenu.
Étape 4, « Quand le rouvrir ». Le menu Codex ouvert (rouvre-le s'il s'est fermé), contour sur « Ouvrir un codex… », aucun geste attendu. Texte : « Ton codex te servira dans deux cas : pour travailler sur un autre appareil, ou pour retrouver tes données si ce navigateur les perd. Touche alors « Ouvrir un codex… », ici, dans le menu. Attention : ouvrir un codex remplace tout ce qui est dans l'application par le contenu du fichier. Ouvre donc toujours ton codex le plus récent. Pour savoir où tu en es, regarde le haut du menu : « Ton codex est à jour », ou « Ton codex n'a pas tes derniers changements ». Et si tu oublies, le rappel « Mets ton codex à jour » reviendra toutes les deux semaines, ou au rythme que tu choisis. » Bouton « Terminer » : le parcours passe à « Fait ».

À VÉRIFIER AVANT DE POSER LES TEXTES (lus ou inférés par Cowork le 8 nov., sur main 144a4dd66, sans rien exécuter ; le lien avec le Mac s'est coupé en cours de lecture). Si une phrase ne tient pas, ne la retouche pas toi-même : dis-le à Grégoire et propose.
- Étape 2, mesuré par Cowork (8 nov., 14 h 48, main f96b0bb20) : le libellé reste « Mettre à jour le codex » même sans codex (_actualiserMenu) ; « Nouveau codex » ne fait que nommer, sans écrire de fichier (actionNouveau) ; la première écriture réussie pose l'état actif et « Ton codex est à jour » (_marquerCodexAJour). Rien de plus à vérifier sur ce point.
- Étape 2 : l'aperçu « Mettre à jour le codex » a bien un « i » qui mène à « Ce que contient le fichier » (lu dans l'aide, pas dans le code).
- Étape 3 : le fichier choisi dans la fenêtre d'emplacement est réécrit sans question jusqu'au rechargement de la page, puis l'application redemande (inféré du commentaire « Perdu au rechargement de la page »).
- Étape 3, mesuré par Cowork (14 h 48) : « Il y est » (confirmerTelechargement) ne vient qu'après un téléchargement ; le partage compte comme écrit aussitôt (_ecrireLeCodexPrepare). Reste à voir : la feuille de partage peut-elle s'ouvrir sur un ordinateur ? La phrase dit « ton appareil » pour ne pas le supposer.
- Étape 3 : des fichiers de productions manquent. L'application demande alors toujours où écrire et ne garde pas le fichier (lu) ; la phrase de la fenêtre de choix est alors fausse sur la réécriture. Dis comment tu traites ce cas.
- Étape 4 : le menu Codex se referme-t-il après la mise à jour ?

INSCRIS AU BACKLOG, SANS LE FAIRE
- L'aide (carte Codex, index.html) nomme Chrome, Edge, Safari et l'iPad ; le message d'espace insuffisant à l'ouverture d'un codex dit « Sur un iPad : Réglages → Général → Stockage iPad ». À soumettre à Grégoire au regard de sa règle du 8 nov. (aucun produit nommé), sans y toucher.

LIVRAISON
- Captures Playwright WebKit des quatre étapes à 1180 px, sombre et clair, et des étapes 1 et 3 à 390 px ; l'étape 3 pour chacun des chemins que le banc peut produire.
- Un test qui échoue avant ton code : le rappel « Mets ton codex à jour », dû, ne s'ouvre pas pendant un parcours.
- Ce que tu as trouvé sur les vérifications ci-dessus, puis tes vérifications habituelles.
