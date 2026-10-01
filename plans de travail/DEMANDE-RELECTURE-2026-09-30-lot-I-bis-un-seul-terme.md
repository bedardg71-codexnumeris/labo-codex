# Demande de relecture – chantier du codex, lot I bis : un seul terme (D9)

> Écrite le 30 septembre 2026, vers 22 h (Toronto), par Claude Code, pour Cowork. Exécute `plans de travail/CONSIGNE-DU-JOUR.md` (20 h 18, § 0 réécrit à 21 h 15 ; mots du § 3 validés par Grégoire entre 20 h 09 et 20 h 18). Branche `lot-i-bis-un-seul-terme` : `main` + un commit. Codée à partir de `6a0f61a4` (code de 1.172.0), puis reposée sur le bloc de relais de `main` (un document). **Ni poussée ni livrée** : aucune release, aucun numéro de version touché.
> Chaque constat dit s'il est **mesuré** (par exécution), **lu** au code, ou **inféré**. Je ne suis pas un pair développeur : ce qui suit est une mesure et une lecture, à relire comme telles.

## Pour Grégoire, en trois lignes

1. **Ce qui change à l'écran** : Réglages › Données, la première carte s'appelle « Ouverture et partage » et n'a plus que deux cases ; la fenêtre « Copie de secours » n'existe plus, et plus aucun texte de l'application ne dit ce mot (l'Aide conseille de mettre le codex à jour). Supprimer un trimestre est refusé tant que ton codex n'est pas à jour, par une fenêtre dont le bouton lance « Mettre à jour le codex ».
2. **La preuve** : deux anciens fichiers (`.json`, et `.zip` avec une copie), fabriqués par le vrai geste au code de 1.172.0 avant le retrait, s'ouvrent encore par « Ouvrir un Codex… » et écrivent exactement les mêmes données qu'avant (empreintes identiques, clé par clé). La suppression est jugée sur la vraie page par de vrais clics, dans les trois cas. Dix mutations, dix rouges.
3. **Ce qui te revient** : une phrase à valider (le refus quand il n'y a pas de codex du tout, § 4), et un point à trancher à froid sur « garde ce fichier » (§ 5.1). Une porte courte une fois le lot en ligne. **Tes données** : rien n'est effacé ni réécrit ; les réglages du rappel et les fichiers déjà faits restent où ils sont.

## 0 · Les deux gestes sans code (§ 0 de la consigne)

- Fichiers de Cowork commités tels quels sur `main` : `0ae5aaaf`.
- Skill `debut-de-session-labo-codex`, § 2 : il LIT désormais `scripts/.verdict-playwright.json` (sha, code, `rendule`) et le compare à `HEAD` ; il ne lance plus `verifier-playwright.mjs`. Commit `6a0f61a4` sur `main`. **Où vit la copie que mes sessions chargent** : dans le dépôt, `.claude/skills/debut-de-session-labo-codex/SKILL.md`, et nulle part ailleurs (`find ~/.claude -name SKILL.md -path "*debut-de-session*"` rend zéro ; témoin : `~/.claude/skills/synced/` contient quatorze autres skills). L'agent `audit-debut-session` (`.claude/agents/`) charge ce skill ; il ne nomme pas le script. À l'ouverture de cette session, l'audit a lu le jeton (`95ed3124`, code 0, 17 h 49) sans rien lancer, en 2 min : mais c'était sous mon interdiction écrite dans son mandat, le skill n'étant pas encore corrigé. **Le skill corrigé n'a pas encore été éprouvé par une session neuve** : ce sera la prochaine ouverture.
- Ces deux commits et celui du relais sont sur `main` en local, **non poussés** (aucun push ne m'a été demandé).

## 1 · La mesure avant le retrait (§ 2.1 de la consigne)

Commande : `grep -rniE "copies? de secours" js index.html | grep -v "^js/changelog-data.js"`. **36 lignes dans 6 fichiers** au départ (index.html 21, popup 7, hover 3, import-export 3, registre 1, trimestre-v2-liste 1). Témoin : la même commande sans le filtre trouve aussi les Nouvelles.

**Ce qui a bougé depuis l'inventaire du 29** (`MESURE-2026-09-29-lot-I-rappel-codex.md`, § 3) :

| Inventaire du 29 | Mesuré le 30 |
|---|---|
| Accueil, carte « Copie de secours » (`js/accueil.js` l. 238) | **Disparue** : le lot I l'a remplacée par « Ton codex ». Zéro occurrence. |
| Réglages › Données, `index.html` l. 9383-9423 | Présente, mêmes lignes. |
| La fenêtre, l. 14633 | Présente, l. 14631-14657. |
| Aide, dépannage et Réglages › Données | Présentes ; s'y ajoutent **trois lignes que l'inventaire ne nommait pas** : le glossaire « Local (stockage) » (l. 13942), l'encadré de la Loi 25 (l. 14062, texte approuvé par Grégoire le 15 sept.) et « Importer un fichier » (l. 14044). |
| Aide contextuelle, popup l. 1617-1668 | Présente ; s'y ajoute la fiche du portrait d'un·e étudiant·e (l. 1607 : « voyage avec ton codex et tes copies de secours »). |
| Rappel | Ne mène plus à la fabrication (lot I) : zéro appel. |

**Les appelants de la fabrication** (`grep -rnE "ouvrirModalExport|fermerModalExport|toggleToutesLesCles|executerExport\b|modalExport\b|listeClesExport|checkToutesLes"`) : un seul bouton (`index.html`, Réglages › Données), la fenêtre elle-même, et `js/import-export.js`. **Aucun appelant vivant hors de l'inventaire.** Témoin : `ouvrirModalExportPDF` (`js/export-pdf.js`) est un autre geste, il reste.

## 2 · Ce qui a changé

| Fichier | Changement |
|---|---|
| `index.html` | Carte « Ouverture et partage » à deux cases (mots du § 3) ; fenêtre `#modalExport` retirée ; cinq règles CSS qui ne servaient qu'à elle retirées (`.modal-content-scroll`, `.item-bleu-pale-clickable`, `.mr-10-scale-13`, `.overflow-y-300-border`, `.mt-20-flex-gap10-end` : zéro autre usage, mesuré) ; l'Aide (§ 3 ci-dessous) ; cinq jetons `?v=`. |
| `js/import-export.js` | `ouvrirModalExport`, `fermerModalExport`, `toggleToutesLesCles`, `executerExport` et leurs expositions retirés (327 lignes) ; dans `estRessourceDemo`, les deux branches (`etudiant`, `cours`) que seule la fabrication appelait ; les trois mots de la fenêtre d'ouverture. **Resté** : tout le chemin d'ouverture, `estRessourceDemo` et `filtrerRessourcesNonDemo` (six autres appelants), « Exporter ma config ». |
| `js/trimestre-v2-liste.js` | La garde du codex et la fenêtre de refus (`uiDialogues.demanderAction`, la fenêtre de l'application déjà utilisée par le lot G) ; la confirmation aux mots validés ; plus d'appel à `exporterTrimestreArchive` dans ce chemin. |
| `js/accompagnement-contenu-hover.js`, `-popup.js` | Infobulles de la carte (mots du § 3) ; entrée `donnees-codex-export` et fiche `modal-export` retirées ; trois phrases réécrites (§ 3). |
| `js/registre-longitudinal.js` | La phrase du § 3. |
| `README.md`, `docs/architecture/ECOSYSTEME-DONNEES.md` | Le bouton retiré n'y est plus conseillé ; la priorité « compresser `executerExport` » est dite sans objet. |
| `tests/` | § 6. Fixtures : `tests/fixtures/copies-de-secours-1.172.0/` (4 fichiers, 635 Ko). |
| `BACKLOG.md` | #1006 inscrite ; note à #985 (la case se coche à la release). |

**Non touché** (§ 5 de la consigne) : le menu du codex, le rappel, « Mettre à jour le codex », les archives, les boutons « Exporter les données » de la bibliothèque des trimestres, les Nouvelles passées.

## 3 · L'Aide et la FAQ : la table avant / après

Tout est dans `index.html` sauf mention. La question « Codex ou copie de secours : quelle différence ? » est retirée en entier (tableau et résumé).

| Où | Avant | Après |
|---|---|---|
| Dépannage, « Données perdues », Solution | Restaurer ta dernière copie de secours (Réglages → Données → Ouvrir un Codex…) | Rouvrir ton codex (menu Codex, en haut de l'écran → Ouvrir un codex…) |
| Idem, Prévention | Faire une copie de secours régulièrement (Réglages → Données), et mettre à jour ton codex | Mettre ton codex à jour régulièrement (menu Codex, en haut de l'écran) |
| FAQ « Mes données s'enregistrent-elles toutes seules ? » | Paragraphe « La copie de secours (Réglages → Données) est un fichier que tu gardes par précaution, pour retrouver tes données si le navigateur les perd. » | Paragraphe retiré ; le paragraphe du codex gagne une phrase : « C'est lui qui te rend tes données si le navigateur les perd. » ⚠ **phrase neuve** |
| Idem, Recommandation | Fais une copie de secours régulièrement (Réglages → Données). | Mets ton codex à jour régulièrement (menu Codex, en haut de l'écran). |
| Glossaire, « Local (stockage) » | Pense à faire une copie de secours régulièrement. | Pense à mettre ton codex à jour régulièrement. |
| Aide de Réglages → Données, titre | Copie de secours et partage de tes données | Ouverture et partage de tes données |
| Idem, introduction | La section Données offre trois options pour protéger, restaurer et partager tes données : | La section Données offre deux options pour ouvrir et partager tes données : |
| Idem, liste | « Trois options d'export » : Copie de secours · Configuration pédagogique · Importer un fichier (« Restaure une copie de secours ou importe la configuration d'un collègue… ») | « Deux options » : **Exporter ma config** (même texte) · **Ouvrir un Codex** : « Ouvre un codex ou une configuration partagée. Le type est détecté automatiquement. » Puis : « Pour mettre ton travail en sûreté ou le transporter, mets ton codex à jour : menu Codex, en haut de l'écran. » |
| Idem, bonnes pratiques 1 | Fais une copie de secours régulièrement : Clique « Faire une copie de secours » et coche « Toutes les clés » | Mets ton codex à jour régulièrement : menu Codex, en haut de l'écran, puis « Mettre à jour le codex » |
| Idem, 2 | Avant un changement majeur : Fais une copie de secours avant de modifier tes pratiques ou grilles | Avant un changement majeur : Mets ton codex à jour avant de modifier tes pratiques ou grilles |
| Idem, 4 | Transfert d'appareil : Exporte sur l'ancien appareil, importe sur le nouveau | Transfert d'appareil : Mets ton codex à jour sur l'ancien appareil, ouvre-le sur le nouveau |
| Idem, encadré | Ta copie de secours et ton codex sont tes seules protections. | Ton codex est ta seule protection. |
| Idem, encadré **Loi 25** (texte approuvé par Grégoire le 15 sept.) | Personne ne fait de copie de secours à ta place : utilise « Faire une copie de secours » régulièrement. | Personne ne met ton codex à jour à ta place : utilise « Mettre à jour le codex » régulièrement. ⚠ **à lui montrer** |
| Aide contextuelle, fiche du portrait (`popup`) | Cette information voyage avec ton codex et tes copies de secours. | Cette information voyage avec ton codex. |
| Aide contextuelle, fenêtre d'import (`popup`) | L'import écrase les clés correspondantes : utilise-le pour restaurer une copie de secours ou migrer un trimestre d'un appareil à l'autre. | L'import écrase les clés correspondantes. Pour transporter ton travail d'un appareil à l'autre, passe par le codex (menu Codex, en haut de l'écran). |
| Idem, formats | .json : copie de secours sans fichiers de travaux. · .zip : copie de secours avec fichiers de travaux, ou configuration partagée. | .json : fichier de données d'une version antérieure, sans fichiers de travaux. · .zip : configuration partagée, ou fichier de données d'une version antérieure avec ses fichiers de travaux. ⚠ **tournure neuve** |
| Idem, conseil | Fais toujours une copie de secours avant un import | Mets toujours ton codex à jour avant un import |
| Aide contextuelle, fenêtre des clés (`popup`, `modal-export`) | La fiche entière | Retirée avec la fenêtre |

Trois lignes portent ⚠ : elles vont au-delà du remplacement mécanique. À toi de dire si elles montent à Grégoire.

## 4 · La variante « sans codex » (à soumettre)

Le titre et le bouton restent ceux validés. **Texte proposé, codé tel quel en attendant** (une constante, `js/trimestre-v2-liste.js`, `refuserSuppressionCodexPasAJour`) :

> Supprimer un trimestre efface ses données pour de bon. Tu n'as pas encore de codex : crée-le avec le bouton ci-dessous, puis recommence.

Le bouton « Mettre à jour le codex » crée le codex par le même chemin (mesuré au lot I, et rejoué ici au cas 3 du banc).

## 5 · Trouvailles en chemin, et leur issue

1. **« Garde ce fichier » ne tient que jusqu'à la prochaine mise à jour, dans Chrome.** *Mesuré* : après la suppression, l'état du codex reste « à jour » (`Codex.etat()`, aucun événement d'enregistrement émis) ; *inféré* : le fichier du codex, écrit avant, contient donc encore le trimestre supprimé (je n'ai pas rouvert ce fichier). *Lu* (`js/codex.js`, sous-texte « Dans le même fichier ») : dans Chrome et Edge, « Mettre à jour le codex » réécrit le MÊME fichier ; à la mise à jour suivante, le trimestre supprimé n'y est plus. *Inféré* : sur Safari et l'iPad (un nouveau fichier à chaque fois), l'ancien fichier survit tant qu'on ne le jette pas. **Issue : remonte à Grégoire** (ses données, et la limite du 20 sept. sur l'irréversible). Je n'ai rien codé au-delà de la consigne.
2. **L'export d'un trimestre ne se rouvre pas.** *Mesuré par exécution* (§ 2.4 de la consigne confirmé) : 732 octets pour un trimestre avec une copie, aucun binaire ; déposé dans « Ouvrir un Codex… » : « Source inconnue », « Aucune ressource reconnue », aucune case, bouton désactivé. **Issue 2 : inscrite, #1006.**
3. **La case « Ouvrir un Codex » refuse un codex.** *Lu* (`previsualiserImport`) : un fichier de codex déposé là reçoit « Ce fichier est un codex… utilise le bouton Codex dans l'en-tête ». Les mots validés disent « Ouvre un codex ou une configuration partagée ». Antérieur au lot, non rejoué. **Issue : à toi de dire** (des mots que l'usager lit ; pas de symptôme vécu connu, donc non inscrite).
4. **L'ouverture d'un ancien fichier ne remet pas chaque clé à sa place.** *Mesuré* sur les fixtures : une clé nue `productions` est écrite et `a2031_productions` ne l'est pas, la clé `demo_groupeEtudiants` est réécrite, et le bilan compte « 315 dates de présences » (*inféré* : celles de la démo, que le fichier contient aussi). C'est le comportement de 1.172.0, **figé tel quel** par les empreintes : le lot garantit « comme avant », pas « mieux ». **Issue : non inscrite** (aucun symptôme vécu ; le stock de ces fichiers est petit, cinq utilisateurs). À toi de voir.
5. **La fabrication ne filtrait pas ce qu'elle disait filtrer** (les évaluations de la démo partaient dans le fichier : 447 Ko sur 581). Sans objet, le code est retiré. **Issue 3.**
6. *Mesuré, rassurant* : un codex réellement mis à jour reste « à jour » après deux rechargements sans geste. Le refus ne réapparaît donc pas à chaque ouverture.

## 6 · La preuve

**Les deux anciens fichiers.** `tests/fixtures/copies-de-secours-1.172.0/` : fabriqués par le vrai bouton, « Toutes les clés », au commit `6a0f61a4` (WebKit de Playwright, profil persistant ; la copie d'un pixel stockée et relue par le vrai `travauxStockage`). Jeu fictif (trimestre `a2031`, deux étudiant·es inventé·es). `fabrication.json` dit comment.

`tests/integration/lot-i-bis-anciens-fichiers-s-ouvrent.spec.js` (3 essais), par le vrai bouton « Ouvrir un Codex… », le vrai sélecteur de fichier, toutes les cases cochées, « Importer la sélection » :

| | `.json` | `.zip` |
|---|---|---|
| Restitution directe (l'espace après = le fichier, valeur pour valeur) | étudiant·es, présences, évaluations | étudiant·es, évaluations, fiches des copies, annotations ; la copie déposée **octet pour octet** (70 octets) |
| Empreintes de tout ce que l'ouverture écrit, **avant** (code de 1.172.0, deux passages identiques) et **après** le retrait | 13 clés, identiques | 14 clés et la copie, identiques |
| Bilan affiché | identique (23 éléments) | identique (24 éléments, « 1 PDF restauré ») |

Troisième essai : les trois étiquettes (« Fichier personnel », « Restauration de camille », « Source inconnue » avec « C'est mon propre fichier – Je confirme qu'il m'appartient »), et aucune fenêtre ne dit l'ancien terme (garde de non-vide : plus de 300 caractères lus). « Restauration de tes données » est un repli que je n'ai pas su atteindre par un geste (il faut un nom d'auteur·e vide et non vide à la fois) : **non éprouvé**, tenu seulement par le cliquet du mot.

**La suppression.** `tests/integration/lot-i-bis-suppression-trimestre-codex-a-jour.spec.js` (3 essais), pack démo et un trimestre fictif non actif, de vrais clics (bibliothèque, menu de la carte, « Supprimer… ») ; dans chaque cas, le registre et les quatre clés du trimestre sont relus :

| Cas | Ce que l'écran fait | Ce que l'application contient après |
|---|---|---|
| Codex pas à jour | fenêtre de refus aux mots validés, devant la bibliothèque ; aucune question native | inchangé |
| … puis le bouton du refus | une vraie mise à jour du codex ; le menu dit « Ton codex est à jour » | inchangé |
| … puis « Supprimer… » de nouveau | la confirmation aux mots validés, le nom, le message final ; **aucun téléchargement** | le trimestre n'est plus au registre, zéro clé ; la démo intacte |
| Sans codex | même fenêtre, variante du § 4 | inchangé |
| Codex à jour, confirmation refusée ; puis nom mal retapé | « Le nom saisi ne correspond pas » | inchangé |

Vitest (`sentinelle-suppression-trimestre-361`, réancré, 12 essais) juge l'ordre des gestes avec des doublures, dont « module du codex absent : refus ».

**Le cliquet.** `tests/unit/sentinelle-lot-I-bis-un-seul-terme.test.js` (5 essais) : aucune occurrence dans le dossier `js/` (hors `_archives`) ni `index.html`, **commentaires compris** (plus large que « texte affiché », exprès) ; toute casse, pluriel, espace insécable, fin de ligne. Garde de non-vide : plus de 150 fichiers et 5 Mo lus, les six fichiers d'origine nommés. Témoin : le même motif trouve le terme dans `js/changelog-data.js`. Un cinquième essai refuse le retour des noms de la fabrication (noms entiers).

**Mutations** (restauration par copie, empreintes vérifiées ; `mutation posée` exigée) : **10 sur 10 rouges.**

| Mutation | Rouge |
|---|---|
| La garde retirée | Vitest 4 ; WebKit cas 1 et 2 |
| Clause « sans changement » retirée | Vitest 2 ; WebKit cas 1 |
| Clause « un codex actif » retirée | Vitest 2 ; WebKit cas 2 |
| Le mot revient dans une chaîne de `js/` | cliquet |
| Le mot revient dans `index.html` avec `&nbsp;` | cliquet |
| Le bouton de la fabrication revient | cliquet |
| L'ouverture ne restitue plus les étudiant·es | `.json` et `.zip` |
| Le `.zip` ne dépose plus les copies | `.zip` |
| L'ouverture écrit une clé de plus | `.json` et `.zip` |
| « Fichier personnel » redevient un autre mot | essai des mots |

**Essais retirés ou réancrés, et leur remplaçant** :

| Essai | Sort | Remplaçant |
|---|---|---|
| `sentinelle-boot-export-401`, (c) « ouvrirModalExport ne fait aucun db.get » | retiré | aucun : la fonction n'existe plus ; son retour est refusé par le cliquet (5ᵉ essai) |
| `sentinelle-import-export-383-384-385`, « l'export ZIP boucle sur toutes les clés » | retiré | idem ; la restauration reste jugée (même fichier, essai suivant) et par exécution (spec des anciens fichiers) |
| `sentinelle-suppression-trimestre-361`, « export de sauvegarde PUIS suppression » et « export raté » | réancrés | « codex à jour : … aucun téléchargement », et les quatre refus |
| `sentinelle-862-aide-loi-25`, `sentinelle-audit-aide-lot-A`, `lot-f-placement-mots` | réancrés | le bouton nommé par l'Aide est « Mettre à jour le codex » ; la carte à deux cases est mesurée aux quatre largeurs (mots exacts, côte à côte, sans débordement) |

**Vitest complet** : 667 fichiers, 7 876 essais verts, aucune erreur hors essai (avant le lot : 666 et 7 870). **Playwright ciblé** : voir la dernière ligne de ce document. **Le verdict complet n'est pas rendu** : il est dû sur le commit de release.

## 7 · Ce que j'ai supposé

- La garde vit dans le parcours d'écran (`confirmerSuppressionTrimestre`), pas dans l'écrivain (`supprimerTrimestre`) : *mesuré*, c'est son seul appelant (`grep -rn "supprimerTrimestre\b" js index.html`), et les quatre boutons « Supprimer… » y mènent. La désactivation de la démo retire le trimestre « demo » par un autre chemin (`js/demo-activation.js`) : ce n'est pas un trimestre de l'usager, je ne l'ai pas compté comme un contournement.
- La confirmation et la saisie du nom restent des dialogues natifs (« comme aujourd'hui ») ; seul le refus est une fenêtre de l'application.
- Le texte de la confirmation est sur un seul paragraphe, mot pour mot.
- « Importer un fichier » (Aide) devient « Ouvrir un Codex », le nom réel de la case.
- Le cliquet couvre les commentaires : mes propres commentaires disent donc « l'ancien fichier » sans le nommer.

## 8 · Une ligne des Nouvelles, proposée (version mineure)

> **Un seul terme : le codex.** La copie de secours de Réglages › Données disparaît : pour mettre ton travail en sûreté, mets ton codex à jour. Un fichier de copie de secours déjà fait s'ouvre toujours, par « Ouvrir un Codex… ». Supprimer un trimestre demande maintenant un codex à jour.

## 9 · À la livraison

Cocher #985. Porte : `PORTES-TERRAIN-2026-09-30-lot-I-bis.md` (due une fois le lot en ligne ; l'artefact est à toi).

**Playwright ciblé** (19 specs : les deux du lot, la carte aux quatre largeurs, et les voisins de l'import, des trimestres, de l'archivage, du codex et de l'Aide ; `--retries=0`) : **54 essais verts en 4,6 min, aucune reprise.** Lancé après les mutations, fichiers restaurés à l'identique (empreintes comparées).
