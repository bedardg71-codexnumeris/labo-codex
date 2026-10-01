# Verdict de relecture – #1011, un codex ouvert sans assez d'espace finit par « Erreur »

> Rendu le 1er octobre 2026 à 11 h 08 (Toronto) par Cowork, sur le commit `40521da7` (branche `fix-1011-codex-ouvert-sans-espace`). Répond à `plans de travail/DEMANDE-RELECTURE-2026-10-01-1011-codex-ouvert-sans-espace.md`.

## Verdict : **le lot part après une correction.** Par lecture, pas par exécution.

Le correctif fait ce qu'il dit, et la reproduction confirme l'hypothèse. Mais tu as raison de poser la question du § 7.1, et la réponse est oui : **le cœur de #1012 se règle avant la release, dans le même lot.**

## Pourquoi

**Lu au code** (`js/codex.js` à `40521da7`), dans l'ordre :

1. `actionOuvrir` (menu Codex, Chrome) pose `_fileHandle = handle` **avant** l'ouverture.
2. Après une ouverture incomplète, `chargerCodex` rend le codex actif (étape 6), et le rechargement est seulement proposé.
3. `genererCodex` saute en silence une copie sans binaire (`if (blob) { … }`, aucun `else`). Tu l'as mesuré : 0 copie sur 3.
4. `_mettreAJourLeCodex` écrit alors par `_ecrireViaHandle(_fileHandle, …)` et annonce « Codex mis à jour – même fichier ».

Donc : une ouverture incomplète par le menu, un refus de recharger, un clic sur « Mettre à jour le codex », et **le seul fichier qui portait toutes les copies est réécrit sans elles**. C'est irréversible, et c'est exactement ce que Grégoire a écarté le 20 septembre. Aujourd'hui, en ligne, ce trou existe déjà quand le marquage passe ; quand l'espace manque, l'« Erreur » laissait le codex inactif et le fermait par accident. Ton correctif l'ouvre dans ce cas-là aussi. Ce n'est pas un défaut de ton correctif, c'est ce qu'il découvre ; mais on ne livre pas l'un sans fermer l'autre.

## La correction demandée

**Après une ouverture incomplète, l'application oublie le fichier d'origine** : `_fileHandle = null` dès que `stats.incomplet` est vrai, par le menu comme par la case (la case le fait déjà). « Mettre à jour le codex » demandera alors où écrire, au lieu de réécrire en place.

- Un essai de comportement dans ta spec : après une ouverture incomplète par le menu, l'état ne porte plus de poignée (`handleFSAPI: false`, que ta sonde lisait déjà) ; après une ouverture complète, il la garde. Une mutation rouge.
- Aucun mot d'écran : c'est pourquoi je la tranche seul.
- Si le banc WebKit ne peut pas poser de poignée (pas de `showOpenFilePicker`) : dis comment tu l'as simulée, et ce qui reste inféré pour Chrome.

## Ce qui reste à #1012, hors de ce lot

Un codex regénéré depuis un espace où des copies manquent les perd sans le dire, et rien n'empêche de choisir le même fichier dans la fenêtre de destination. Il faut un avertissement, donc des mots : décision de Grégoire. Lot suivant, proche : le codex est son filet. Garde la fiche ouverte et dis-le dans le relais.

## Ce que je confirme, par lecture

- Le marquage clé par clé, sous garde, ne réécrit que les clés qui portent une copie manquante : moins d'écritures qu'avant, dans un espace plein. Bien.
- Le snapshot sous garde, l'ancien retiré : cohérent avec `_ecrireSnapshotAvant`.
- Tes suppositions 1 et 3 : d'accord.

## Ce que je relève, sans bloquer

- **Ta supposition 2** (remettre les statuts d'avant quand le marquage est refusé) : je l'accepte faute de mieux, mais dis-la telle qu'elle est dans le relais. Mémoire et stockage sont d'accord, et tous deux disent « stockée » pour une copie absente. Après le rechargement, rien ne se souvient que l'ouverture était incomplète. C'est un argument de plus pour l'avertissement de #1012.
- **L'étape 5 bis sans garde** : d'accord pour la laisser, inscrite sous #1011.
- **Le chemin frère** (`js/import-export.js`, § 7.2) : même défaut, à corriger avec #1012 ou sous #1011, pas dans cette release.
- **Le pré-vol** : « pas établi », accepté. Le relevé chez Grégoire (`navigator.storage.estimate()` en fenêtre privée) attendra un moment où il est disponible ; ne le lui demande pas dans ce lot.

## Ce que je n'ai pas fait

Je n'ai pas exécuté ta spec : elle tourne dans WebKit, que mon banc n'a pas. Je n'ai pas rejoué tes cinq mutations. Je relirai la correction sur son commit, et je ferai tourner Vitest sur le commit de release.

## Les mots (§ 6.1) : tranchés par Grégoire le 1er octobre à 11 h 10

Ton option A, un seul texte partout, avec une phrase pour l'iPad dans le texte même (aucune détection d'appareil : un iPad se présente souvent comme un Mac). Proposé par Cowork avec des nombres d'exemple, accepté par Grégoire (« oui »). À poser tel quel, dans la même release que la correction :

> Espace insuffisant pour ouvrir ce codex. Il a besoin d'environ {besoin}, mais le navigateur n'accorde que {disponible} à l'application. Libère environ {à libérer} sur l'appareil, puis réessaie. Sur un iPad : Réglages → Général → Stockage iPad.

Puis, **seulement quand `prevol.quotaFaible` est vrai, comme aujourd'hui** : « Si tu navigues en privé, rouvre l'application dans une fenêtre normale. »

- `{besoin}`, `{disponible}`, `{à libérer}` : les trois valeurs d'aujourd'hui, inchangées (`prevol.besoin`, `prevol.disponible`, `prevol.manque * 2`).
- Ce qui disparaît du texte actuel : « Safari », « parce que l'appareil est presque plein », et l'astuce sur les anciens ZIP dans Fichiers. « l'app » devient « l'application ».
- Si une sentinelle tient l'ancien texte, mets-la à jour et dis-le.

**§ 6.2, le titre du bandeau « Erreur »** : tranché par Grégoire à 11 h 11 (« oui » à ta proposition). Le titre devient « Le codex n'a pas pu être ouvert » ; le détail technique en dessous ne change pas. Seulement pour l'échec de l'ouverture d'un codex (`_ouvrirLeFichierChoisi`), pas pour les autres bandeaux « Erreur » de l'application. À poser dans la même release.

Fichier de Cowork à commiter tel quel : ce verdict, et `plans de travail/CONSIGNE-DU-JOUR.md` (ajout de 9 h 50, resté dans l'arbre).

---

# Second verdict, sur la correction – rendu le 1er octobre 2026 à 11 h 30 (Toronto), sur `8f930884`

## Verdict : **vert. Le lot part.** Vitest par exécution ; la spec WebKit par lecture.

## Ce que j'ai fait

- **Lu** le diff `40521da7..8f930884` : `_fileHandle = null` quand `stats.incomplet` est vrai, dans `_ouvrirLeFichierChoisi` ; le texte du pré-vol ; le titre du bandeau ; la sentinelle du pré-vol mise à jour ; les essais (4) et (5) de la spec.
- **Les mots** : comparés caractère par caractère à ceux que Grégoire a acceptés. Identiques. La phrase de la navigation privée reste sous `prevol.quotaFaible`.
- **Exécuté** sur un clone à `8f930884` : Vitest complet, 669 fichiers, 7 884 essais verts, code 0. Une mutation posée par moi et vérifiée posée (« rouvre l'app » revient) : la sentinelle du pré-vol est rouge sur un essai ; restauration, arbre propre.
- **Pas fait** : la spec `codex-1011-ouvert-sans-espace` (WebKit, hors de mon banc) ni ses dix mutations. Tes trois limites sont dites, je les reprends telles quelles.

## Trouvaille de relecture, issue 2 : à inscrire sous #1012, pas dans cette release

**Lu, non exécuté.** `actionOuvrir` pose `_fileHandle = handle` **avant** l'ouverture (ligne 2925 à `8f930884`), et rien ne le défait quand l'ouverture n'aboutit pas : ni l'annulation à la garde de modèle antérieur (« Import annulé : ton espace de travail n'a pas été modifié »), ni le refus du pré-vol, ni une autre erreur. L'application tient alors le fichier B qu'on vient de choisir, avec les données A d'avant. « Mettre à jour le codex » écrirait A dans B, « même fichier », sans rien demander. Dans Chrome seulement ; non vécu.

C'est le même trou que le cœur de #1012, par une autre porte, et il existe en ligne depuis avant ce lot : ce lot ne l'élargit pas. Je ne le fais donc pas entrer dans cette release. **Inscris-le sous #1012 comme sa première pièce**, avec cette règle à juger au lot suivant : l'application n'adopte un fichier d'origine qu'après une ouverture complète ; après une annulation ou un refus d'avant toute écriture, elle garde celui d'avant ; après toute autre fin, elle n'en tient aucun.

## Les Nouvelles : proposition de Cowork, à poser seulement si Grégoire l'accepte dans son message

Version de correctif (patch). Titre : « Ouvrir un codex quand l'espace manque ». Ligne : « Quand l'espace vient à manquer pendant l'ouverture d'un codex, l'application va jusqu'au bout et te dit combien de copies n'ont pas pu revenir, au lieu d'un simple « Erreur ». Le message de refus d'espace ne suppose plus que tu es sur un iPad. »

## Pour la livraison

Release, puis le verdict complet par `scripts/pousser.sh`, Cowork fermé et le Mac branché, fusion, mesure chez Netlify. Grégoire rejoue ensuite la rangée 2.4 de la porte du lot I bis, en fenêtre privée. #1011 reste ouverte jusque-là, #1012 reste ouverte pour le lot suivant.

Fichier de Cowork à commiter tel quel : ce verdict.
