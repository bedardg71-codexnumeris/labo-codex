# Compte rendu d'étape : lot F, étape 1 (le témoin du codex dit vrai)

> Écrit le 28 septembre 2026, vers 22 h 20, par Claude Code, sur la branche `lot-f-les-mots` (partie de `main` = `053d96cb`, 1.167.0). Consigne : `plans de travail/CONSIGNE-DU-JOUR.md` (lot F). **Arrêt obligatoire** : la question de l'enregistrement automatique (§ 3) va à Grégoire, par Cowork. Aucune release, aucun push.

## 1 · Ce que Grégoire verra

- Dans le menu du codex (en haut), la ligne d'état dit **« Ton codex n'a pas tes derniers changements »** dès qu'il fait un geste qui écrit (celui où le témoin du bas dit « Enregistré »), et **« Ton codex est à jour »** après une mise à jour réussie du fichier. Avant, elle disait « Tout est enregistré » après n'importe quelle évaluation.
- Ouvrir l'application ne change rien à cet état.
- S'il annule l'aperçu du codex, ou la fenêtre de choix du fichier : aucun message, et le codex reste « pas à jour ». Avant, un aperçu annulé affichait « Erreur : Cannot read properties of null ».
- Le bouton s'appelle encore « Enregistrer le codex » : les mots viennent à l'étape 2.

## 2 · Comment, et ce que j'ai supposé

**Le point d'accroche est le témoin commun, pas la base.** J'ai d'abord mesuré (sonde WebKit jetable, pack démo, codex actif « à jour ») ce que l'application écrit à l'ouverture, sans aucun geste : **une quinzaine de clés à chaque ouverture**, et quatre d'entre elles changent vraiment de contenu même à la deuxième ouverture (`indicesCP`, `indicesAssiduite` et `indicesPatternsRaI`, qui portent une date de calcul, ainsi que `cours`). S'accrocher à `db` (le crochet `_signalerEcriture` existe) aurait fait dire « pas à jour » à chaque ouverture ; comparer les contenus n'aurait pas suffi non plus.

⮕ J'ai donc accroché le codex à `temoinEnregistrement.enregistre` : il émet l'événement `donnees-enregistrees`, que `codex.js` écoute. C'est un seul point, et il couvre les trois chemins du témoin (`sauvegarderDonneesSelonMode`, `modifierEtAnnoncer`, `ecrireEtAnnoncer`). Les écritures `discret` (indices, migrations) n'y passent pas, par construction.

**Supposition nommée** : « tes derniers changements » désigne ce que l'usager a changé, pas ce que la machine recalcule. Conséquence assumée : un geste qui écrirait **hors** du témoin commun ne rendrait pas le codex « pas à jour ». C'est la même lacune que celle du témoin commun (D0) ; un geste qui dit « Enregistré » la couvre. Je ne l'ai pas inventoriée ce soir. **À trancher par Cowork** : inscrire l'inventaire des gestes hors témoin, ou le juger couvert par les lots A à E3.

**L'état « à jour » suit l'écriture.** `genererCodex` ne pose plus l'état ; `_marquerCodexAJour`, appelé après l'écriture réussie du fichier, le pose. Il écrit aussi l'instantané de référence de la fusion : avant, un aperçu annulé laissait cet instantané décrire un fichier qui n'existait pas. C'est le même défaut, et j'ai choisi de le corriger dans le lot (issue 1 : il touche le fichier de sauvegarde, la fusion le lit). Une écriture survenue pendant la génération laisse le codex « pas à jour » (compteur de modifications).

**Sous Safari et sur iPad**, « à jour » veut dire qu'un fichier a été produit (dans Téléchargements, ou dans Fichiers par le partage). L'application ne peut pas savoir s'il a été déplacé sur la clé. C'était déjà le sens avant le lot.

## 3 · ARRÊT : l'enregistrement automatique « Toutes les 5 min »

**Laissé inerte** : `AUTO_SAVE_AUTORISE = false` (`codex.js`), le minuteur ne démarre pas. Le banc le prouve (aucun minuteur posé alors qu'un fichier est tenu), et une mutation qui le rallume le fait rougir.

**Ce qu'il ferait si on l'activait.** Lu dans `codex.js` ; seule son inertie est éprouvée au banc :

| | Ce qu'il ferait |
|---|---|
| **Quand il démarre** | Seulement après que Grégoire a ouvert **ou** enregistré son codex **dans la même séance** (le lien vers le fichier vit en mémoire, perdu au rechargement de la page). |
| **Chrome sur Mac** | Toutes les 5 minutes, **s'il y a eu un changement** depuis la dernière écriture : il régénère tout le codex en silence (sans aperçu, sans barre de progression) et **écrase le même fichier**, celui choisi à l'enregistrement ou celui ouvert, par exemple sur la clé. Écriture atomique : le fichier est remplacé d'un coup, jamais à moitié. Il affiche ensuite un message « Enregistrement auto », avec la taille et l'heure. |
| **Safari sur Mac** | Jamais : Safari n'offre pas l'écriture directe dans un fichier. |
| **iPad (Safari ou Chrome)** | Jamais, pour la même raison (sur iPad, Chrome est aussi du WebKit). |
| **Clé retirée, fichier déplacé** | L'écriture échoue, il s'arrête sans rien dire (avertissement en console seulement). Le témoin reste « pas à jour », ce qui est vrai. |

**Trois points que Grégoire devrait connaître avant de répondre** (inférences tirées du code, non mesurées sur ses données) :
1. **Le nom du fichier ne change pas.** S'il a ouvert `codex-…-2026-09-20-14h00.zip`, l'automatique réécrit **ce** fichier : le nom garde la date du 20, le contenu est celui du jour. Le fichier précédent n'est plus gardé à côté.
2. **Fréquence réelle.** Pendant une séance d'évaluation, le témoin dit « Enregistré » toutes les 1,5 s : l'automatique écrirait donc le codex complet toutes les 5 minutes, fichiers des travaux compris, tant qu'il travaille. Je n'ai pas mesuré la taille de son codex réel.
3. **L'aperçu de sécurité est sauté** (la liste des fichiers montrée avant « Télécharger ») ; la validation du contenu (Défense K) reste faite. Et un fichier **ouvert** (et non enregistré) n'a peut-être qu'une permission de lecture dans Chrome : l'écriture automatique échouerait alors en silence dès la première fois. C'est une inférence, non vérifiée.

**La question pour Grégoire** (proposée, fermée) : sous Chrome, après que tu as ouvert ou mis à jour ton codex, veux-tu que l'application réécrive **ce même fichier** toutes les 5 minutes quand tu as fait des changements ?
- (a) Non : on retire l'automatique (code et menu), et « Mettre à jour le codex » reste ton seul geste.
- (b) Oui, tel quel.
- (c) Oui, mais seulement sur un fichier que tu as mis à jour toi-même dans la séance (pas sur un fichier seulement ouvert).

## 4 · Preuves

- Banc WebKit `tests/integration/codex-temoin-dit-vrai-lot-f.spec.js`, 1/1 vert. Il éprouve (a) l'ouverture sans effet ; (b) les trois chemins du témoin rendent le codex « pas à jour », et une écriture discrète ne le touche pas ; (c) une mise à jour réussie rend « à jour » ; (d) l'aperçu annulé ; (f) une écriture pendant la génération ; (g) un « Enregistrer sous » annulé ; (e) l'automatique inerte. Faux fichier (`showSaveFilePicker` simulé) : aucune écriture sur disque.
- **Mutations, 6 sur 6 rouges** (restauration par copie, empreintes vérifiées) : l'écoute retirée ; l'émission du témoin retirée ; l'état posé avant l'écriture ; l'aperçu annulé lu comme un succès ; le compteur ignoré ; l'automatique rallumé.
- Vitest depuis `tests/` : 659 fichiers, 7 700/7 700.
- **Pas encore fait** : des gestes réels (une évaluation, une présence, une fiche du Cadre) au banc ; ils passent tous par le témoin commun, mais ce n'est pas éprouvé écran par écran. Les étapes 2 à 4 (les mots) restent à faire.

## 5 · Trouvailles

- `cours` (clé globale) change de contenu à **chaque** ouverture, sans geste (mesuré à la deuxième ouverture sur le pack démo). C'est hors du lot : **inscrire et continuer** (non inscrit ce soir, à faire à la reprise après relecture de « Dernier ID utilisé »).
- Le commentaire d'en-tête de `temoin-enregistrement.js` dit encore « Les 384 `db.setSync` directs n'ont PAS le témoin (ils l'auront… lots C à E) » : ce texte est périmé depuis E3. **Commenter et oublier** : je le corrigerai en passant à l'étape 2.
