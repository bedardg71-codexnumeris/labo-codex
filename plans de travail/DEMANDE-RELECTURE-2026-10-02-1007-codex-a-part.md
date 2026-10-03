# Demande de relecture – #1007, premier lot : avant de supprimer, un codex à part

> Écrite par Claude Code le 2 octobre 2026 à 20 h 46 (Toronto, mesurée par `date`), sur la consigne de Cowork de 20 h 29.
> Branche locale `claude/1007-codex-a-part`, commit `3a55b547` (lot + jetons anti-cache de `index.html` pour les cinq fichiers), partie de `main` à `5d370562` (les fichiers de Cowork commités tels quels et poussés, Vitest vert au hook). **Ni release, ni push du code.** Version : 1.174.6, inchangée.
> Ce chemin précède l'effacement des données de l'usager : relecture croisée avant toute release (règle 2).

## Pour Grégoire, en trois lignes

- **Ce qui se passe désormais** quand tu supprimes un trimestre, un groupe-cours, un groupe d'élèves, toute la liste ou toutes tes données : une fenêtre t'annonce un codex à part ; l'application l'écrit sous un autre nom (elle te demande où), et **seulement ensuite** viennent les confirmations habituelles. « Annuler » ou un échec, à n'importe quelle étape : rien n'est supprimé. Le refus « mets d'abord ton codex à jour » du trimestre disparaît.
- **Ce qui t'attend** : la relecture de Cowork, puis les mots neufs du § 5 à accepter (les quatre variantes, et trois phrases que la consigne ne donnait pas), puis la ligne des Nouvelles (§ 10).
- **Ce que j'ai supposé** : sur Chrome et sur l'iPad, un fichier que le navigateur dit écrit vaut « Il y est » (comme pour « Mettre à jour le codex ») ; seul le téléchargement demande à l'usager de le confirmer.

## 1 · Remesure des cinq gestes, avant d'ouvrir

| # | Geste | Où il vit (lu) | Ce qu'il fait aujourd'hui (lu) |
|---|---|---|---|
| X1 | Supprimer un trimestre | `js/trimestre-v2-liste.js`, `confirmerSuppressionTrimestre` (quatre boutons, une fonction) | Garde du trimestre actif ; refus « codex pas à jour » ; `confirm` ; nom retapé ; `supprimerTrimestre`. |
| X2 | Supprimer un groupe-cours | `js/trimestre-v2-groupes-cours.js`, **deux portes** : `supprimerGroupeCoursV2` (fiche) et `supprimerGroupeCoursDepuisBibliotheque` (bibliothèque › ⋮) | `confirm`, puis l'entrée de `groupesCours` part. |
| X3 | « Supprimer un groupe… » | `js/trimestre-v2-etudiants.js`, `supprimerGroupeSelectionneV2` | Garde « choisis d'abord un groupe » ; `confirm` ; les fiches du groupe partent. |
| X4 | « Vider la liste » | même fichier, `viderListeEtudiantsV2` → `reinitialiserEtudiantsV2` | `confirm` ; toutes les fiches partent. |
| X5 | Réinitialiser toutes les données | `js/import-export.js`, `reinitialiserDonnees` | Deux `confirm`, « EFFACER » à taper, puis tout part et la page se recharge. |

Conforme à l'inventaire de 17 h, sauf un détail : X2 a deux portes qui dupliquent le même code (mesuré par grep, `groupesCours.filter` aux deux endroits).

## 2 · Le parcours commun

Une seule fonction, `Codex.ecrireAPartAvantSuppression(premierePhrase)` (`js/codex.js`), appelée par les six portes. Elle rend `true` seulement si le fichier à part est écrit ; l'appelant ne fait rien d'autre sur `false`.

1. **La fenêtre** du § 7, mots acceptés à 20 h 28. « Annuler » a le focus (variante `danger` de `confirmerAction`, la seule qui le donne : le bouton « Écrire le codex à part » est donc rouge ; à dire si ça dérange).
2. **`genererCodex`**, avec **l'avertissement de 1.174.0** des copies manquantes, par la même fonction que la mise à jour (`_avertissementDesCopies`, extraite de `_mettreAJourLeCodex`, non contournée), puis l'aperçu habituel.
3. **L'écriture**, toujours en demandant où (`forcerDialogue`), **sans adoption** (`sansAdoption`, #1012). La boucle d'écriture de « Mettre à jour le codex » est extraite en `_ecrireLeCodexPrepare` et partagée : fenêtre de choix, feuille de partage (avec le toucher frais et le message d'attente de #988), téléchargement confirmé par « Il y est », et en cas d'échec « Réessayer » ou « Télécharger à la place ». Une seule boucle, pas deux.
4. **Rien n'est marqué** : `_marquerCodexAJour` n'est pas appelé, le fichier tenu n'est pas touché, l'état « à jour » du codex habituel ne bouge pas (mesuré, § 7).
5. **Le nom** : `options.nom` = le nom habituel du codex suivi de « avant-suppression » ; `_genererNomFichier` y ajoute la date et l'heure. Forme assertée par le banc : `codex-‹nom›-avant-suppression-AAAA-MM-JJ-HHhMM.zip`. Le manifeste porte le même nom, comme l'export d'une sélection porte « (sélection) » : rouvert, ce codex se dit « avant-suppression ».

L'ordre dans chaque geste : ses gardes d'abord (trimestre actif refusé, « choisis d'abord un groupe »), puis le codex à part, puis ses confirmations, inchangées.

## 3 · Le trimestre (X1)

Retirés : le refus « codex pas à jour » (`etatDuCodexPourSuppression`, `refuserSuppressionCodexPasAJour`, sans autre appelant, mesuré par grep) et la phrase « Ton codex à jour les contient encore… fais d'abord une copie de ce fichier. ». Le refus du trimestre actif reste, avant tout. Le banc du lot I bis, qui verrouillait le refus retiré, est retiré ; le nouveau banc le remplace.

## 4 · Sur l'iPad

Le chemin d'écriture est celui de « Mettre à jour le codex » : c'est littéralement la même fonction (`_ecrireLeCodexPrepare`). **Ce que le banc imite** : `showSaveFilePicker` absent, `navigator.canShare`/`share` posés à la main ; un partage qui réussit, puis un partage refermé (AbortError). **Ce qui reste inféré** : ce que Safari fait vraiment de la feuille (« Enregistrer dans Fichiers ») sur un vrai iPad, et la durée du toucher sous un vrai codex de 1 Go. Le banc épingle `navigator.userActivation.isActive`, comme le banc du lot I.

## 5 · Les mots

**Les quatre variantes de la première phrase**, sur le modèle accepté :

| Geste | Première phrase proposée |
|---|---|
| X2 groupe-cours | Supprimer le groupe-cours « ‹nom› » l'efface pour de bon. |
| X3 « Supprimer un groupe… » | Supprimer le groupe « ‹libellé› » efface pour de bon ses ‹n› étudiant·es. *(une seule fiche : « son étudiant·e »)* |
| X4 « Vider la liste » | Vider la liste efface pour de bon toute la liste : tes ‹n› étudiant·es, de tous les groupes. *(« ton étudiant·e »)* |
| X5 Réinitialiser | Réinitialiser efface pour de bon toutes tes données : tes trimestres, tes étudiant·es, tes évaluations, tes présences, tes productions, tes captures, tes modèles et tes réglages. |

**Rendu à Cowork** (la consigne : « si l'une d'elles demande un mot neuf, n'invente pas ») :
- **X2.** Supprimer un groupe-cours n'efface que son entrée ; ses élèves, évaluations et présences **restent**, sans accès par l'écran (inventaire, X2). Dire « efface ses étudiant·es » serait faux ; dire ce qui reste demande des mots neufs. J'ai mis la forme la plus courte qui ne ment pas. À trancher.
- **X4.** « de tous les groupes » est neuf : l'ancienne confirmation ne disait pas que tous les groupes partent (relevé de l'inventaire).
- **X5.** « tes réglages » est neuf dans cette fenêtre (le mot existe ailleurs dans l'application).

**Trois phrases neuves que la consigne ne donnait pas**, posées pour que le chemin soit complet, à accepter ou à remplacer :
- l'échec d'écriture — titre « Codex à part non écrit », texte « Le fichier (‹taille›) n'a pas été enregistré : rien n'a été supprimé. Si ton appareil manque d'espace, libères-en, puis réessaie. » (sur le modèle de « Codex non mis à jour ») ;
- l'échec de préparation — même titre, « Le fichier n'a pas pu être préparé : rien n'a été supprimé. Si ça se répète, utilise « Signaler un bug » : le détail y sera. » ;
- la réussite — notification « Codex à part écrit », avec le nom du fichier.

## 6 · Source et stock

Aucune donnée écrite chez l'usager n'est touchée par ce lot : il ajoute une étape avant des gestes existants. Rien à réparer.

## 7 · La preuve

**Banc** : `tests/integration/1007-codex-a-part-avant-suppression.spec.js` (WebKit, sept essais, la vraie page, le vrai dispatcher, les vrais boutons des fenêtres ; ce que l'application contient est lu après chaque étape).

| Essai | Ce qu'il montre |
|---|---|
| X1, fenêtre de choix | La fenêtre mot pour mot, focus sur « Annuler » ; « Annuler » de la fenêtre, de l'aperçu, de la fenêtre de choix, de la confirmation : rien d'effacé, aucune question posée avant l'écriture ; le fichier à part écrit **une fois** sous son nom, le fichier tenu écrit **une seule fois** (la mise à jour d'avant) ; puis la suppression comme avant ; l'état « à jour » inchangé ; la mise à jour suivante réécrit le fichier tenu **sans** fenêtre de choix (sans adoption). |
| X1, partage (iPad) | Feuille refermée : la fenêtre d'échec (mots, boutons), rien d'effacé ; réussie : la suppression suit. |
| X1, téléchargement | « Il n'y est pas » : rien d'effacé, aucune question ; « Il y est » : la suppression suit, aucune question avant. |
| X2, deux portes | Bibliothèque et fiche : fenêtre, « Annuler » sans effet, la confirmation d'avant, la suppression. |
| X3 et X4 | Le geste du menu « Groupe », puis « Vider la liste » : idem. |
| X5 | « Annuler » sans effet ; « Annuler » à la première confirmation sans effet ; le chemin entier efface tout. |
| Témoin | Supprimer une évaluation : la confirmation d'aujourd'hui, sans fenêtre de codex (le second lot n'est pas commencé). |

**Mutations** (treize, chacune posée par compte exact, `node --check`, restaurée par copie avec empreinte ; essai ciblé par `-g`) : **treize rouges**.

| # | Mutation | Rouge |
|---|---|---|
| M1 | « Annuler » de la fenêtre laisse continuer | oui (`toBe`, la sonde de tentative) |
| M2 | un échec d'écriture rend « écrit » | oui (partage et téléchargement) |
| M3 | `sansAdoption: false` | oui |
| M4 | `forcerDialogue: false` (écrit dans le fichier tenu) | oui |
| M5 | sans le nom « avant-suppression » | oui |
| M6 | variante non `danger` (focus sur « Écrire ») | oui |
| M7 | le trimestre ignore le résultat | oui |
| M8 / M9 | groupe-cours, porte bibliothèque / porte fiche, ignore le résultat | oui / oui |
| M10 / M11 | « Supprimer un groupe… » / « Vider la liste » ignore le résultat | oui / oui |
| M12 | Réinitialiser ignore le résultat | oui |
| M13 | le témoin : la suppression d'une évaluation ouvre le codex à part | oui |

**M1 a d'abord survécu** : après « Annuler », le banc lisait l'état avant que la génération (mutée) n'atteigne la fenêtre de choix. Corrigé par une sonde sans course (`Codex.derniereTentative()`, ouverte dès que la fenêtre dit oui), posée après chacun des six « Annuler » de la fenêtre ; M1 rougit ensuite. Limite : j'ai lu le type d'erreur de chaque rouge, pas sa ligne (le relevé des lignes n'a pas pris) ; les types concordent avec l'assertion visée.

**Vitest complet** (depuis `tests/`) : 673 fichiers, 7 937 essais verts, aucune ligne « Errors » ni « Unhandled ». Une première passe en avait rougi trois, adaptées (ci-dessous).

**Specs voisines** : `groupe-nomme-son-cours-872b.spec.js` clique « Supprimer le groupe » : une doublure y dit « écrit » et la phrase passée est assertée (le codex à part est jugé ici). Vert. Sentinelles unitaires adaptées : #361 (la garde du codex à jour remplacée par le codex à part ; preuve de retrait lue dans la source, ces fonctions n'étant pas sur `window`), #872 (phrase assertée, et un essai neuf : codex non écrit, ni question ni suppression), #390 B6 et #522 A.d (une doublure « écrit », la suppression reste l'objet de l'essai), et le verrou structurel de `codex.test.js` (#1012) : il attendait **un** appelant de `genererCodex`, il en attend désormais **deux**, qui passent tous deux l'avertissement par la même fonction. Le verdict Playwright complet n'est pas lancé : il viendra avec la release, après la relecture.

## 8 · Trouvailles en chemin

| Constat | Issue |
|---|---|
| Les deux portes de X2 nomment le groupe-cours différemment : la bibliothèque par le titre de sa carte (« Groupe 00001 » dans la démo), la fiche par le nom enregistré. Déjà vrai avant ce lot ; la fenêtre hérite de chacune. | 2 — inscrire si Grégoire l'a vécu ; sinon 3. |
| X5 demande encore « As-tu exporté tes données avant de continuer ? » juste après l'écriture du codex à part. Inchangé, comme la consigne le veut. | 2 — pour le second passage sur les mots. |
| L'avertissement des copies manquantes dit « donne un autre nom à celui-ci » ; dans ce parcours, le fichier a déjà un autre nom. Sans conséquence. | 3. |
| Après « Réinitialiser toutes les données », le pack démo se réamorce au démarrage (`initialiserDemoNamespace`). Voulu. | Rien. |

## 9 · Inscriptions dues à `BACKLOG.md`

Aucune. #1007 reste ouvert pour le second lot.

## 10 · Proposition pour les Nouvelles (à accepter par Grégoire)

> Avant d'effacer un trimestre, un groupe-cours, un groupe d'élèves, toute ta liste ou toutes tes données, l'application écrit d'abord un codex à part, sous un autre nom : tes mises à jour suivantes n'y touchent pas, et il te permet de revenir en arrière.

## 11 · Ce qui reste à Grégoire

Les mots du § 5. La ligne du § 10. Puis la release (patch ou minor : ma proposition est **minor**, un comportement neuf sur cinq gestes).
