# Consigne de démarrage – la session Cowork qui prend le relais

> **Réécrite le mercredi 30 septembre 2026, 17 h 56 (Toronto)**, à la demande de Grégoire, après la mise en ligne de 1.172.0 (lot A2 des archives) et sa décision sur l'ordre des chantiers : le codex d'abord.
> Elle REMPLACE toute version précédente ; celle du 30 à 16 h 57 est dans git (`bf0b9065`), celle du 30 à 5 h 31 sous `plans de travail/_ancienne-CONSIGNE-DEMARRAGE-COWORK-2026-09-30-05h31.md` (sections 1, 5, 6 reprises, erreur 40 ajoutée ; section 2, un compte mis à jour ; 3 et 4 réécrites).
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête ; c'est elle qui fait foi.
> ⛔ **Il ne porte que ce qui PÉRIME** : l'état mesuré, le mandat, ce qui est dû, et les erreurs déjà payées.
> ⛔⛔ **Il se réécrit à la fin de CHAQUE journée Cowork**, même quand la page du tri et `OU-EN-EST-ON.md` sont à jour : ce sont eux que tu lis pour l'état, mais c'est ce fichier qui te dit de les lire.

---

## 1 · CE QUE TU ES, ET CE QUE TU N'ES PAS

**Le dispositif est à trois, et les canaux ne se croisent pas.** Grégoire décide, relaie, et fait tourner l'application sur ses vraies
données. **Toi, Cowork** : tu **mesures** le dépôt, tu **rédiges** les consignes de lot, tu **relis** ce qui ne se reprend pas, tu
**publies les artefacts des portes** et tu tiens ses fichiers de cadrage.

⛔ **TU NE PARLES PAS À CLAUDE CODE.** Une consigne va dans un FICHIER (`plans de travail/CONSIGNE-DU-JOUR.md`, l'ancienne archivée
`_ancienne-CONSIGNE-DU-JOUR-<date>-<sujet>.md`) **et** dans le message, dans un **bloc de code** – jamais dans un artefact, jamais avec
des retours à la ligne manuels.

⚠⚠ **TU NE VOIS PAS LE CANAL ENTRE GRÉGOIRE ET CLAUDE CODE, ET TU NE VOIS PAS TOUT LE DÉPÔT.** Claude Code travaille parfois dans un
worktree, sur une branche non fusionnée : un fichier qu'il a écrit ET COMMITÉ là n'existe pas dans l'arbre principal.
⮕ **Devant un fichier annoncé et absent, l'ordre des hypothèses est : (1) il est en train de l'écrire, (2) il l'a écrit sur une branche
ou dans un autre dossier, (3) le relais a échoué.** Dis-le dans cet ordre-là plutôt que de conclure. Et devant un écart, remesure, puis
demande-toi de QUEL objet chacun parle. Un verdict se rend sur un SHA : redis lequel.

⚠ **TU N'ÉCRIS PAS DANS `js/`, ni dans `BACKLOG.md`** – tu en proposes le texte, Claude Code l'écrit. ⚠ Enfreint le 16 au soir (erreur 12) ET de nouveau le 17 au matin (erreur 21) : la règle tient. **Une décision de Grégoire s'écrit dans la consigne du lot, avec la ligne exacte à poser sous la fiche** ; Claude Code l'écrit (fait ainsi pour #898 au lot 29). `PROTOCOLE.md`,
`CONSIGNE-DEMARRAGE-COWORK.md` et `plans de travail/` sont à TOI : tu les écris, il les commite.
⚠⚠ **`git --no-optional-locks`** pour TOUTE lecture git, jamais `git status` nu. **Ton montage n'a pas le droit d'effacer** : un `git status` nu, un `git add` ou un `git commit` crée `.git/index.lock` (et `HEAD.lock`) puis ne peut plus le supprimer – **plus aucun commit n'est possible dans le dépôt, Claude Code compris.** Mesuré le 16 à 16 h 33 ; l'effacement a été refusé, les verrous ont été DÉPLACÉS dans `.git/_to_delete/` (six fichiers vides, à effacer par Grégoire). ⮕ **Tu ne commites pas. Tu écris, et tu donnes à Claude Code la liste des chemins à commiter.** Si un verrou apparaît quand même : `mv -n` vers `.git/_to_delete/`, jamais laissé en place, et dis-le.
⚠ **L'horloge du montage est en UTC** : toute heure s'écrit après `TZ=America/Toronto date`, dans la même commande que l'écriture.

---

## 2 · CE QUE TU PEUX ÉPROUVER TOI-MÊME

**La suite de tests, oui.** Le `tests/node_modules` du Mac est installé pour macOS ; une installation à neuf, côté Linux, fonctionne.

1. `git clone --shared --quiet --branch main "$HOME/mnt/Monitorage_v6" "$HOME/banc"` – instantané.
2. `cd "$HOME/banc/tests" && npm install --silent --no-audit --no-fund` – ~40 s.
3. `cd "$HOME/banc/tests" && timeout 165 npx vitest run --reporter=dot` – ~26 s. Claude Code rapporte **666 fichiers / 7 870 essais** sur `95ed3124` (1.172.0). ⚠ Le 17, `npm ci` sur un clone `--no-hardlinks` a pris ~2 s (cache chaud) ; un lien symbolique vers le `node_modules` du Mac échoue (rollup natif macOS).

⛔ **Lecture seule sur le dépôt de Grégoire** : aucun `gc`, `prune`, `push`, et **jamais `git worktree`** (l'entrée reste fantôme
dans son `.git`). ⚠ **Efface ton banc à la fin** (`rm -rf "$HOME/banc"`). ⚠ Un `npx vitest` lancé en arrière-plan MEURT à la fin de
l'appel : chaque `device_bash` est un shell neuf – lance en synchrone. ⚠ La suite rend 7 essais ROUGES dans un banc sans `.git` :
**toujours le clone, jamais `git archive`.**

⮕ **Pour poser des mutations sans te tromper de fichier** (méthode du 16-17 sept.) : un petit `mut.py` hors du dépôt (`$HOME/rel/`) lit un JSON `{nom: {f, old, new}}`, **refuse si `old` n'apparaît pas exactement une fois**, écrit dans le CLONE, relit pour vérifier que la mutation est posée ; puis la sentinelle seule, puis `git checkout -q -- js` dans le clone et `git status --porcelain --untracked-files=no` vide. ⚠ Le VM de session est neuf à chaque ouverture : `$HOME/rel/` et `$HOME/banc/` n'existent plus, réécris-les. Pour un scénario que la sentinelle ne couvre pas, copie son en-tête (jusqu'au premier `describe`) dans un fichier jetable du clone, ajoute ton essai, lance-le, puis déplace-le hors du clone.
⮕ Tu peux donc écrire **« vert par exécution »**, et tu DOIS alors reposer les mutations toi-même : poser la mutation par `python3`,
**vérifier qu'elle est posée avant de lire**, lancer les bancs visés seuls, restaurer par `git checkout --`, finir par un témoin vert.
⛔ **Le verdict Playwright reste hors de ta portée** : il se prend Cowork fermé, et tu ne peux pas te fermer toi-même.

⛔⛔ **ET TU NE LANCES RIEN PENDANT QU'UN VERDICT TOURNE CHEZ LUI.** Le 16 au matin, Claude Code l'a dit dans ses mots : lancer autre
chose à côté est exactement le scénario des deux kills mémoire. Lecture git seule, et dis-le.

⮕ **TU ÉPROUVES TES PROPRES ARTEFACTS AU NAVIGATEUR AVANT DE PUBLIER.** Chromium est dans le conteneur :
`ls -d /opt/pw-browsers/chromium*/` **avant de lancer** – le dossier porte un numéro de build qui change –, puis
`npm install playwright-core` dans le scratchpad. **Mesure à 360, 400, 768 et 1280 px, en clair ET en sombre**, et vérifie
`document.documentElement.scrollWidth` contre `clientWidth` : c'est comme ça qu'un débordement se voit.

---

## 3 · L'ÉTAT MESURÉ – le 30 septembre 2026, 17 h 56 (Toronto)

**Remesure, ne recopie pas** : `cat version.json` · `git --no-optional-locks log --oneline -3 main` · `git --no-optional-locks log --oneline -1 origin/main` · `git --no-optional-locks branch --list 'lot-*'` · `ls .git/worktrees` · `git --no-optional-locks status --porcelain` · `TZ=America/Toronto date`. Détail : premier bloc de `RELAIS.md`, page du tri (https://claude.ai/artifact/1qhNTJjv1peETqedTQr6bN, à jour du 30 à 17 h 56).
⮕ **« En ligne » se lit chez Netlify** : le connecteur Netlify répond depuis Cowork (`get-project` sur le site `f06b34ab-3511-4bf5-9beb-4736cc56ca8c` → `currentDeploy.id` ; `get-deploy-for-site` → `commit_ref`, `state`, `published_at` en UTC).

- **`main` = `origin/main` = `bf0b9065` : 1.172.0** (build `0930-1703`), **en ligne** : Netlify « ready », `commit_ref` `bf0b9065`, `published_at` 21:52:16 Z, constaté par Cowork le 30 à 17 h 55 (la release `95ed3124` était en ligne à 17 h 50, rapporté par Claude Code). Aucune branche de lot en cours (les six `lot-*` listées sont anciennes), aucun worktree, arbre propre hors les non-suivis qui ne sont pas à Cowork.
- **Passé le 30** : 1.170.1, 1.170.2, 1.171.0 (un gros codex se met à jour sur l'iPad ; porte passée à 10 h 38) ; le lot de mesure des archives ; 1.171.1 (lot A1 : archiver sans charger la mémoire, une empreinte par copie ; porte passée dans Chrome à 16 h 22, 205 sur 205) ; **1.172.0** (lot A2 : « Vérifier » une archive ; relecture de Cowork « le lot part après une correction », les fichiers cachés du système ; mots et ligne des Nouvelles acceptés par Grégoire).
- ⚠⚠ **TROIS CHANTIERS SONT OUVERTS** (règle 11 de `PROTOCOLE.md`, écrite ce jour). **Ordre arrêté par Grégoire le 30 à 17 h 25** : finir le codex, puis les archives, puis le reste du plan du 29. Son motif : il est le seul à porter un gros codex, ce chantier défriche le terrain pour les autres.
  1. **Le codex – en cours, en premier.** ⮕⮕ **Le 1er oct. à 2 h 12 : lot I bis codé (`820fe58e`, branche `lot-i-bis-un-seul-terme`), relu par Cowork (« le lot part après deux corrections », `VERDICT-RELECTURE-2026-10-01-lot-I-bis-un-seul-terme.md`), mots validés par Grégoire, consigne de corrections et de release écrite. Dû ensuite : publier l'artefact de la porte (`PORTES-TERRAIN-2026-09-30-lot-I-bis.md`) une fois le lot en ligne ; Grégoire n'y supprime aucun trimestre. Puis dire le chantier du codex « clos » sur la page (règle 11) et revenir aux archives (A3).** ⮕ **Le 30 à 20 h 18 : mots validés par Grégoire (règle : « un seul terme », codex ; aucun écran ne dit plus « copie de secours »), consigne écrite dans `plans de travail/CONSIGNE-DU-JOUR.md` (lot I bis, branche `lot-i-bis-un-seul-terme`), relayée ou non : à remesurer.** La suppression d'un trimestre sera refusée tant que le codex n'est pas à jour (son choix). Il reste le lot I bis (D9) du plan `PLAN-2026-09-29-fin-carte-et-enregistrement.md` : la copie de secours disparaît, ses anciens fichiers restent ouvrables, et la suppression d'un trimestre garde son filet, qui devient « mettre à jour le codex » (limite du 20 sept.). Mots neufs à Grégoire. #985 reste ouverte pour lui.
  2. **Les archives – suspendues après A2.** Plan `PLAN-2026-09-30-chantier-archives.md`. En ligne : A1, A2. Dû : la porte du lot A2. Restent A3 (faire revenir), A5 (les mots « clos », recommandé avant A4), A4 (alléger, le seul qui retire ; il exigera les deux identifiants égaux, l'empreinte de `meta.json` et la couverture mesurée). Fiches #1000 à #1002.
  3. **La carte d'alignement et l'enregistrement – suspendus.** Restent, au plan du 29 : J (l'export du plan dit vrai, la carte démo), K (la carte, côté technique), L (« Écraser » un homonyme, #967), M (écritures sans geste, #981, #983, #962), N (créer un trimestre par la bibliothèque, #975 ; vérifier le moratoire #622), O (le clavier de l'iPad, #986). Questions à Grégoire à l'ouverture de leur lot : #982, #976, #984.
- **Porte du lot A2 : PASSÉE le 30 à 20 h 09, 6 rangées sur 6** (résultat et trois trouvailles à la fin de `PORTES-TERRAIN-2026-09-30-lot-A2-verifier.md` ; à inscrire par Claude Code : Chrome demande le droit de MODIFIER pour une vérification qui ne fait que lire). Elle se faisait dans Chrome sur le Mac. Artefact publié par une autre session Cowork : « Porte · Vérifier une archive », https://claude.ai/artifact/JoWkDNb6mssddeGzaeD9n3 (six rangées, 1.172.0). Trace : `plans de travail/PORTES-TERRAIN-2026-09-30-lot-A2-verifier.md`. Son archive : `Réserve_LaboCodex Backup/trimestres/h2026-601-101-gr00008` (iCloud ; ce dossier n'est pas connecté d'office à une session neuve). **Non prouvé** pour A1 comme pour A2 : le chemin de Safari, et l'iPad.
- ⚠ **Le 30, deux sessions Cowork ont travaillé en même temps** : une sur son Mac (relecture du lot A2, porte), une dans le cloud pendant que le Mac était fermé (la page du tri, cette consigne). Elles ne se voient pas. **Avant de republier la page du tri, relis-la** ; avant de réécrire ce fichier, regarde son heure.
- **Comptes, par ensembles** (30 sept. 17 h 55, sur `main`) : backlog **218** fiches ouvertes (219 cases `- [ ]` de premier niveau, moins le gabarit `#XX` ; lu par « première occurrence de `#nnn` sur la ligne », pas par `**#nnn**`, qui n'en voit que 91), page **219** ; seul écart, #974, qui vit au registre des retours.
- ⮕ **Le 30 à 21 h 15, remesuré** : `main` = `origin/main` = `3736e044` (documents seulement, 1.172.0 inchangée). Porte, règle 11 et #1005 sont commités et poussés. Le lot I bis n'est PAS commencé (aucune branche `lot-i*`). ⚠ **Une session Claude Code a lancé toute la suite Playwright à son ouverture (20 h 12 → 20 h 44, tuée, sans verdict), pendant que Cowork écrivait dans le dépôt** : je ne pouvais pas le voir. La correction du skill est dans la consigne du lot I bis, § 0.
- **Fichiers de Cowork à faire commiter (liste de 17 h 56, périmée : voir la consigne du jour, § 0)** : `CONSIGNE-DEMARRAGE-COWORK.md`, `PROTOCOLE.md` (règle 11), `plans de travail/PORTES-TERRAIN-2026-09-30-lot-A2-verifier.md` (résultat de la porte). ⚠ D'autres non suivis ne sont pas à Cowork (`Claude outputs/`, `docs/projet de développement/`, `guide-alignement-actuel.md`, `Retours des testeurs/jean-françois/`, `Modèle de consigne…txt`) : ne pas les faire commiter sans Grégoire.

---

## 4 · CE QUI EST DÛ – dans l'ordre

**a) À l'ouverture** : remesurer (§ 3). Un retour de la CoP, de l'orthopédagogue ou d'un·e testeur·se passe AVANT tout. Si un verdict tourne chez lui : lecture git seule (§ 2).

**b) Faire inscrire les trouvailles de la porte du lot A2** (fin de `PORTES-TERRAIN-2026-09-30-lot-A2-verifier.md`) dans la prochaine consigne à Claude Code, avec les fichiers de Cowork à commiter (ce fichier, `PROTOCOLE.md`, le markdown de la porte).

**c) Le lot I bis (D9) : la copie de secours disparaît.** C'est le chantier du codex, que Grégoire veut finir en premier. Avant la consigne : remesurer l'inventaire du lot I (§ 3 de sa mesure) ; proposer à Grégoire les mots neufs, un écran à la fois (Réglages › Données, Aide, FAQ, la confirmation de suppression d'un trimestre). ⛔ Le filet avant la suppression d'un trimestre ne disparaît pas.

**d) Puis les archives : A3, A5, A4**, dans l'ordre du plan. Avant A4 : Grégoire clôt l'hiver 2026 dans l'application (plan § 5) ; le nom de l'état d'une copie partie aux archives, les mots du refus et de la confirmation sont à lui ; la copie marquée « manquante » (#997) se répare en A3 ou A4 et se lui dit à ce moment-là.

**e) Puis le reste du plan du 29** : J, K, L, M, N, O.

**f) Avant d'ouvrir quoi que ce soit d'autre : la règle 11.** L'état du chantier qu'on quitte s'écrit sur la page du tri et au § 3.

**g) À Grégoire, une à la fois, au moment où elles se posent** : la taille du codex dite en Go par l'application et autrement par iPadOS (#993) ; le message d'échec qui nomme l'espace quelle que soit l'erreur (#994) ; mesurer dans son Chrome pourquoi un onglet garde l'ancienne version (#1004 : Réseau › `index.html`, et le bandeau) ; le codex data dit anonymisable (#989) ; le seuil par défaut des spécifications (#935) ; la vérification planifiée de GitHub annulée à 60 min, qui n'a plus conclu depuis le 25 (#979).

**h) Trous de preuve connus, sans lot** : le chemin de Safari pour « Archiver… » et « Vérifier » sur ses vraies copies ; tout le chantier des archives sur l'iPad ; le refus du mauvais dossier dans un vrai Chrome ; le partage qui charge le fichier entier en mémoire au banc du Mac (#996, à mesurer sur l'iPad) ; une note à quatre décimales juste sous une demie (59,4996 → 59) dans `portfolio.js` ; la garde « évaluation précédente sans critère » du bilan de l'élève ; `pousser.sh` qui juge la branche de l'arbre (#980).

**i) CE QUI NE SE ROUVRE PAS** : inchangé (archive du 17) ; #915 reste ouverte exprès jusqu'au retour de la porte des lots 3-4.

---

## 5 · LES ERREURS QUE J'AI PAYÉES – ne les refais pas

0. ⚠⚠⚠ **MON MOTIF NE VOIT PAS LES SYNONYMES.** 5 balises comptées pour 6 réelles ; 112 découpes pour 167 ; **153 fiches au lieu de 225**,
   parce que le motif exigeait `- [ ] **#nnn` et que des dizaines commencent par un emoji ; et 6 candidats rendus dont 4 faux, mon motif
   ne distinguant pas une classe qui cache TOUJOURS d'une classe qui cache SELON UN ÉTAT.
   ⮕ **Quand un nombre te surprend, c'est ton instrument qu'il faut mesurer, pas le monde.** Compte deux fois, par deux chemins, et **dis
   dans ta mesure par quelle transformation tu as lu.**
   ⮕ **Et quand deux comptes divergent, compare les ENSEMBLES, pas les totaux** : c'est ce qui a clos, le 15 au soir, un flou que six
   révisions du nombre avaient laissé debout.

1. ⚠⚠ **J'AI PRIS LA LIMITE DE MON INSTRUMENT POUR UNE LIMITE DU MONDE.** Mon shell n'atteint pas le dépôt en SSH → j'ai écrit que
   personne n'avait la clé. `codexnumeris.org` rendait 403 **depuis mon proxy** ; la page était en ligne. Et le 15, mon banc Chromium
   rendait une erreur console sur la feuille de Google Fonts : **c'est mon proxy, pas la page.**
   ⮕ **Écris ce que TU as mesuré, avec l'outil que tu as employé** – et quand un outil refuse, essaie l'autre avant de conclure.

2. ⚠⚠⚠ **J'AI NOMMÉ DES ÉCRANS QUE JE N'AVAIS PAS REGARDÉS.** J'ai écrit « le groupe Sauvegarder / Réinitialiser » : ces mots venaient
   d'un **commentaire HTML**, pas de l'écran (les boutons s'appellent « Enregistrer » et « ↺ »). Et j'ai donné comme geste à poser un
   bouton qui vivait dans **deux fonctions que rien n'appelait**.
   ⮕ **Un écran se nomme par ce qu'il AFFICHE, jamais par un commentaire, un identifiant ou un nom de fonction.** Et avant de donner un
   geste à poser : **vérifie que la fonction qui le rend a un appelant vivant.**

3. ⚠ **J'AI PUBLIÉ DEUX FOIS UN ARTEFACT QUI DÉBORDAIT.** Le tri poussait la page de 2 px à 400 px depuis le 14 – un état de livraison
   long dans une étiquette en `nowrap`. Je ne l'avais mesuré qu'à 1280 px. ⮕ **Un artefact se mesure aussi au téléphone**, et le
   débordement se lit sur `scrollWidth`, pas à l'œil.

4. ⚠ **J'AI APPLIQUÉ LA MAUVAISE RÈGLE À UNE PORTE TERRAIN.** « Réversible en usage » répond à *la porte est-elle un PRÉALABLE*, pas à
   *une porte est-elle due*. Les deux règles de tête sont : **aucune porte si une machine peut répondre ; préalable dû seulement si un
   raté est irréversible.** ⮕ Quand la machine a répondu pour le Mac, la porte **rétrécit** à ce que la machine n'atteint pas – l'iPad,
   Safari, le corpus réel – elle ne disparaît pas.

5. ⚠ **TROIS COMPTES DE RANGÉES ANNONCÉS COURTS.** ⮕ **Recompte les rangées d'une porte avant de publier.**

6. **J'AI CHERCHÉ UN BANC PAR SON NOM DE FICHIER AU LIEU DE SON CONTENU.** ⮕ `grep -rln` sur le SYMBOLE, jamais `ls | grep`.

7. **J'AI FAIT INSCRIRE UN DOUBLON** (#857 = #553). ⮕ Avant d'inscrire une trouvaille, `grep` les DEUX registres sur ses mots-clés.

8. ⚠⚠ **J'AI DONNÉ UNE INFÉRENCE POUR UN FAIT, À GRÉGOIRE, EN LUI PROPOSANT UN LOT.** Le 16 à 15 h 50, j'ai écrit que #652 était « vraisemblablement déjà corrigée » parce que le message d'erreur avait quitté le code le 4 sept. La mesure suivante l'a réfuté : ce correctif visait un champ qui n'existait pas encore le jour du rapport. ⮕ **Avant d'annoncer qu'une fiche est réglée, date le correctif CONTRE la date du symptôme** (`git log -S` sur le symbole que le correctif introduit). Et quand ça tombe, dis-le à Grégoire en une phrase, dans le tour suivant.
9. ⚠ **DEUX SUPPOSITIONS DE CONSIGNE RÉFUTÉES DANS LA MÊME HEURE.** Sur #651, « la vignette du profil restaurait le mode Évaluer avant #761 » : faux, elle menait à une page vide. Et « défaut : inscrire » pour une trouvaille sans symptôme contredisait la règle du 24 août (**un item n'entre que s'il a un symptôme vécu ou bloque un chantier**) : #890 est entrée par ma faute. ⮕ **Relis la règle d'entrée au BACKLOG avant d'écrire « inscrire » dans une consigne** ; pour du code mort sans symptôme, le défaut est « commenter, ou retirer dans le lot qui passe là ».
10. **LA TABLE DU TRI DISAIT « À TOI » POUR UNE FICHE DÉJÀ TRANCHÉE** (#871, tranchée le 15 au soir, listée en attente le 16). ⮕ **Avant de présenter une question à Grégoire, cherche dans le bloc de la fiche ET dans `RELAIS.md` le mot « tranché ».**
11. ⚠⚠ **J'AI ÉCRIT DANS LE DÉPÔT PENDANT UN VERDICT PLAYWRIGHT** (16 sept., vers 17 h 25) : quatorze lignes au backlog et trois cadrages, pendant que Claude Code prenait son verdict et poussait. Il l'a signalé. ⮕ **Pendant un verdict, tu ne fais RIEN dans le dépôt, pas même écrire** ; tu attends le signal « poussé ».
12. ⚠⚠ **J'AI ÉCRIT DANS `BACKLOG.md`**, alors que la section 1 le réserve à Claude Code. J'avais lu « la coordinatrice tient `BACKLOG.md` » dans `PROTOCOLE.md` sans vérifier QUI est la coordinatrice. ⮕ **Relis la section 1 avant d'écrire un fichier que tu n'as pas écrit toi-même aujourd'hui.** Les lignes sont justes et ont été gardées ; la faute est de procédure.
13. ⚠⚠ **J'AI COMMITÉ DEPUIS MON MONTAGE, ET J'AI BLOQUÉ LE DÉPÔT.** Un `git status` nu, puis deux commits : chaque fois, des verrous que je ne pouvais pas effacer. Le premier aurait empêché Claude Code de commiter 1.142.16. ⮕ **Tu ne commites pas** (section 1). La lecture git se fait TOUJOURS avec `--no-optional-locks`, comme la consigne le disait déjà : je ne l'avais pas relue.
14. ⚠ **TROIS CONSIGNES DE LOT REMISES SEULEMENT DANS LA CONVERSATION** (lots 22, 23, 24), alors que la section 1 exige aussi le FICHIER `CONSIGNE-DU-JOUR.md`. Rattrapé pour le lot A à 19 h. ⮕ **Une consigne = le fichier ET le bloc de code, dans le même tour.**
15. **UNE AMBIGUÏTÉ DE DESTINATAIRE.** Un message de Grégoire écrit pour Claude Code (« commite, prends le verdict, pousse ») m'est arrivé à moi. J'ai commité ; j'ai eu raison de ne pas prendre le verdict ni pousser. ⮕ **Un message qui te tutoie comme Claude Code se lit comme un relais mal aiguillé** : fais ce qui est à toi, rends le reste en bloc de relais.
16. ⚠⚠ **UNE PREUVE « PAR LE TEXTE » NE JUGE PAS LE COMPORTEMENT.** La sentinelle du lot A vérifiait par expression régulière que cinq lecteurs appelaient le bon prédicat. J'ai muté ces lecteurs en **gardant le texte exigé** (`(prédicat(e) || ancienne règle)`) : cinq survivantes sur toute la suite. ⮕ **Devant une assertion sur le source, pose une mutation qui la satisfait et change le calcul.** C'est ce qui a donné le complément 1.142.20.
17. ⚠ **UN BANC DONT LES NOMS RANGENT L'ALPHABET COMME LA RÈGLE NE JUGE PAS LE TRI.** Lot F : A55…, A60…, A65…, A90… sont dans le même ordre par nom et par urgence ; ma mutation « meilleur indice au lieu du pire » a survécu. ⮕ **Un essai de tri a besoin d'un élément dont le nom contredit l'ordre attendu.** Même famille : une boucle qui ne parcourt pas toutes les valeurs (`['P', 'A']` sans `'C'`).
18. ⚠⚠ **J'AI ENCORE NOMMÉ UN ÉCRAN PAR SON TEXTE D'AIDE** (erreur 2, refaite). Ma consigne du lot F reprenait « les zones colorées en arrière-plan » de l'Aide et proposait une phrase qui les décrivait ; Claude Code a mesuré qu'aucun graphique n'en dessinait depuis #240. ⮕ **Un texte d'aide est une affirmation à vérifier, pas une description de l'écran.** Quand je propose des mots qui décrivent un écran, j'écris « à vérifier contre ce que l'écran dessine » – ce qui a sauvé la phrase cette fois-ci.
19. ⚠ **MA CONDITION D'ARRÊT N'ÉTAIT PAS MESURABLE PAR CELUI QUI DEVAIT S'ARRÊTER.** Lot A : « si le cas existe et qu'un chemin réel le produit, arrête-toi ». Claude Code a trouvé le chemin, a mesuré 0 cas dans les données qu'il voit, et ne s'est pas arrêté – il ne voit pas les données de Grégoire, où le cas se jugeait. Sa décision était défendable ; ma consigne était floue. ⮕ **Écris un arrêt sur ce que Claude Code PEUT mesurer** (« si un chemin réel produit le cas, arrête-toi, quel que soit le stock »), et nomme la sonde à faire tourner chez Grégoire.
20. **J'AI ÉCRIT « LOT REMIS » DANS `RELAIS.md` AVANT QUE GRÉGOIRE L'AIT RELAYÉ.** Corrigé en « proposé par Cowork ». ⮕ **Une consigne est « proposée » tant qu'il ne l'a pas relayée ; le relais n'est pas le mien.**
21. ⚠⚠ **J'AI ENCORE ÉCRIT DANS `BACKLOG.md`** (erreur 12, refaite le 17 au matin) : quatre lignes « TRANCHÉ » / « MOTS CHOISIS » sous #871, #744, #745 et #735, par lecture-écriture Python pendant que Claude Code travaillait sur le lot 27 puis le lot 28. Les lignes sont justes et ont été commitées avec le lot 28 ; **la faute est de procédure, et le risque était d'écraser une écriture concurrente.** ⮕ **La décision va dans la consigne, avec la ligne exacte ; Claude Code l'écrit.**
22. ⚠⚠ **MA CONDITION DE DÉPART NOMMAIT LE MAUVAIS OBJET.** Consigne du lot 29 : « `git log` doit montrer 1.142.24 ». Le commit existait, le push tournait encore : **une autre session a démarré le lot 29 pendant le push du 28** (renommage à 8 h 56, premier fichier `js/` à 9 h 03). Le verdict est resté valide par chance d'une minute. ⮕ **Une condition de départ nomme `git log origin/main`** (corrigé dans la consigne du lot 30). Et quand Grégoire a DEUX sessions Claude Code ouvertes, dis-lui laquelle reçoit la ligne.
23. ⚠ **J'AI ÉCRIT DES HEURES DE MÉMOIRE.** « Tranché vers 9 h 15 / 9 h 30 » alors qu'il était 8 h 50 : l'erreur du 4 septembre, sous une autre forme. Corrigé une heure plus tard. ⮕ **Toute heure écrite sort d'un `TZ=America/Toronto date` lancé dans la même commande**, même pour « vers ».
24. **J'AI RETOUCHÉ UNE CONSIGNE PENDANT QU'ELLE S'EXÉCUTAIT** (heures corrigées dans `CONSIGNE-DU-JOUR.md` du lot 29, 9 h 08). Sans effet cette fois. ⮕ **Une consigne relayée ne se retouche plus** ; ce qui change va dans la suivante ou dans `RELAIS.md`.
25. **J'AI LANCÉ `git log` ET `git diff --cached` SANS `--no-optional-locks`.** Aucun verrou n'est apparu (vérifié), mais la règle de la section 1 est absolue. ⮕ Relis-la.
26. **UNE CONDITION D'ARRÊT « SI UNE SEULE CANDIDATE » QUI N'ARRIVAIT JAMAIS** (#898) : le pack porte deux échelles, donc le volet ne pouvait pas partir. Claude Code s'est arrêté comme prévu. ⮕ **Avant d'écrire une condition, mesure si le cas visé la remplit** – ici, une ligne de `grep` sur le pack.
27. **UNE PRÉMISSE D'AUDIT REPRISE SANS LA MESURER** : « le moteur applique déjà les règles spéciales » (A-1) était faux – `calculerNoteFinale` n'avait aucun appelant. Claude Code l'a mesuré et branché pour de vrai. ⮕ **Quand je recopie une affirmation d'audit dans une consigne, j'écris « à remesurer ».**
28. ⚠⚠ **LA CONSIGNE DE DÉMARRAGE N'A PAS ÉTÉ RÉÉCRITE PENDANT QUATRE JOURS** (17 → 21 sept.). Les sessions Cowork intermédiaires ont tenu la page du tri et relu les lots, mais aucune n'a réécrit ce fichier : la session du 21 a ouvert sur « 1.142.25, lot 30 en cours » quand le dépôt était à 1.151.6. ⮕ **Ce fichier se réécrit à la fin de chaque journée Cowork, sans exception**, même en trois lignes.
29. **LA PAGE DU TRI DISAIT « UNE PHRASE T'EST DUE » POUR UNE FICHE TRANCHÉE** (#909, tranchée le 17 à 15 h 06 ; la page le disait encore le 21 à 5 h 51). Même famille que l'erreur 10. ⮕ **Avant de dire à Grégoire qu'une question l'attend, `grep TRANCHÉ` dans le bloc de la fiche.**

30. **UNE CONDITION DE CONSIGNE QUI COMPTAIT DES OCCURRENCES, PAS DES SITES** (N1b : « 53 / 13 / 34 », réels 22 / 13 / 14). J'avais recopié les comptes de Claude Code sans les remesurer. ⮕ **Un compte de sites se remesure par appel réel**, et se dit « occurrences » quand c'en est.
31. **UN LOT LIVRÉ SANS SES CASES COCHÉES** (1.153.0). La consigne ne demandait pas de cocher. ⮕ **Toute consigne de lot porte la liste des cases à cocher à la livraison**, et la fiche restée ouverte à dessein.

32. ⚠⚠ **LA CONSIGNE DE DÉMARRAGE N'A PAS ÉTÉ RÉÉCRITE PENDANT HUIT JOURS** (21 → 29 sept.) : l'erreur 28, refaite, et pire. Les sessions intermédiaires ont tenu la page du tri, les relectures et les portes ; la session du 29 a ouvert sur « 1.153.0, matin du 22 : terminer la notation » quand le dépôt était à 1.168.0, chantier de l'enregistrement fini. ⮕ **Ce fichier se réécrit à la fin de chaque journée Cowork, sans exception.** Si tu ne sais pas si la journée finit, réécris-le quand même après chaque lot livré : trois lignes au § 3 suffisent.
33. **UNE PORTE DONT LE PRÉALABLE EXIGE UN NUMÉRO EXACT ROUGIT À LA VERSION SUIVANTE.** La porte de 1.167.0 attendait « 1.167.0 » ; dès 1.168.0 en ligne, sa rangée 0.1 aurait été un faux rouge (corrigée le 29 avant usage). ⮕ **Une porte encore due quand une version suivante part s'écrit « X ou plus récent »**, et se relit à chaque livraison.
34. **UNE FICHE PERDUE AU REBASE** : #974 (d'abord #967 sur la branche de la carte) n'a plus de bloc au backlog, seulement sa mention dans l'en-tête et sa ligne au registre. ⮕ **Après un rebase qui renumérote, compte par ensembles** : c'est ce qui l'a trouvée.

35. ⚠ **UN RELEVÉ « 6 PASSÉES » QUI CACHAIT UN ÉCHEC** (porte du lot I, 30 sept. 5 h 18). La rangée 1.1 était cochée alors que le codex n'avait pas été écrit ; les captures jointes le montraient (menu « pas à jour », dernier fichier de la veille). Et 1.2-1.3 n'avaient de sens que si 1.1 avait réussi, sans le dire. ⮕ **Lis les captures et les constats avant le compteur.** Une rangée dont le sens dépend d'une autre l'écrit (« seulement si 1.1 a produit un fichier daté d'aujourd'hui »), et la preuve se demande en champ (le nom du fichier).
36. **UNE FICHE CLOSE SUR UNE RÉUSSITE, PAS SUR SA CAUSE.** #988 est passée aux corrigés le 29 parce qu'une mise à jour avait réussi à 15 h 03 ; la cause de l'échec du matin n'était pas trouvée. Elle est revenue le 30 à 5 h 20. ⮕ **Un défaut dont la cause est inconnue ne se clôt pas sur une réussite** : il reste ouvert, « en observation », jusqu'à sa cause.

37. ⚠⚠ **J'AI SUPPOSÉ SON NAVIGATEUR SANS LE DEMANDER.** Le plan et la porte du lot A1 visaient Safari sur le Mac ; Grégoire y utilise **Chrome**. Sa porte de 15 h 08 a donc éprouvé le mode dossier, que rien n'avait mesuré, et pas le lot. ⮕ **Une porte nomme l'appareil ET le navigateur, demandés à Grégoire, pas supposés.** Sur le Mac : Chrome ; sur l'iPad : Safari.
38. ⚠ **UNE PORTE FAITE SUR UNE VERSION PÉRIMÉE, RELEVÉE « 7 SUR 7 ».** Son onglet servait 1.170.2 quand 1.171.0 était en ligne (#1004), et le champ du numéro était vide. C'est le `meta.json` de l'archive qui l'a dit. ⮕ **La première rangée d'une porte est un rechargement forcé, et le numéro lu est un champ obligatoire.** Et quand le geste laisse un objet (un fichier, une archive), **juge la porte sur l'objet, pas sur le relevé.**
39. **LA PAGE DU TRI COMPTAIT « AU DÉPART » DES FICHES INSCRITES DEPUIS.** Quinze fiches ajoutées à `FICHES` depuis le 28 (dont #967 à #976, #988, #990 à #995) manquaient à `INSCRITES_DEPUIS` ; corrigé le 30 à 16 h 57 (version 101). ⮕ **Toute fiche ajoutée à `FICHES` s'ajoute à `INSCRITES_DEPUIS` dans le même script**, qui liste ce qu'il a ajouté.

40. ⚠⚠ **TROIS CHANTIERS OUVERTS, ET LA PAGE N'EN MONTRAIT QU'UN.** Le 30, on est passés du plan du 29 au codex de l'iPad, puis aux archives, sans écrire ce qu'on laissait ; Grégoire l'a découvert en demandant « sommes-nous passés aux archives sans avoir terminé le codex ? ». ⮕ **Règle 11 de `PROTOCOLE.md`** : avant d'ouvrir un chantier, l'état de celui qu'on quitte s'écrit sur la page du tri, « clos » ou « suspendu, il reste X ». À l'ouverture d'une session, compte les plans ouverts, pas seulement le lot en cours.

### Ce qui a tenu, et qu'il faut refaire
- **INSTRUMENTER AVANT DE CORRIGER** (lot G, 29 sept.) : faute de cause, le lot G a seulement fait dire l'échec et laissé une trace de la tentative dans le rapport de bug. Le 30 à 5 h 22, cette trace a donné la cause probable en une ligne (« page rechargée pendant la compression, 1,33 Go »), et répondu à la question ouverte (la trace survit au rechargement). ⮕ **Quand la cause d'un échec terrain échappe, livrer d'abord de quoi la lire au prochain échec.**
- **COUPER UN LOT LOURD EN DEUX, SUR BRANCHE, ET NE LIVRER QUE LE TOUT** (N1a sur `lot-n1a`, puis N1b) : les écrivains et les lecteurs ne se contredisent jamais en ligne.
- **UN VERDICT ROUGE REJOUÉ À CHARGE BASSE AVANT D'ÊTRE CRU** (2 rouges au deuxième verdict de 1.153.0, 6 / 6 seule, troisième verdict vert). Pas de correctif pour un rouge de charge.
- **LA PORTE TERRAIN TROUVE CE QU'AUCUN TEST NE PEUT TROUVER.** « Je ne vois aucune option de verrouillage » a donné #863, puis, le même
  refus répété, **#864 : tout le verrouillage des cartouches était mort.** ⮕ **Quand une vérification ne trouve pas son écran, c'est
  parfois l'écran qui manque. Ne conclus pas « il a mal cherché ».**
- **LA RELECTURE CROISÉE DOIT VISER CE QUE LE LOT PROMET, PAS SEULEMENT CE QU'IL CODE.** Sur #868, l'entrée de « Nouvelles » annonçait
  « Consulter » sans copie alors qu'aucune mesure ne le jugeait. ⮕ **La bonne issue a été d'AJOUTER la mesure, pas de retirer la
  phrase** : la promesse était vraie, c'est la preuve qui manquait.
- **UN REPORT N'EST PAS UN REFUS, ET IL NE SE REPOSE PAS D'OFFICE.** La fusion des PDF d'un même élève était « à voir à l'usage » le 15
  au soir ; un cas vécu l'a rouverte et tranchée le 16 au matin. ⮕ **C'est le symptôme vécu qui rouvre un report**, pas le calendrier.
- **UN LOT ÉVITÉ VAUT UN LOT LIVRÉ, et un chantier SUPPRIMÉ vaut mieux encore.** Le bilan PDF était déjà livré depuis quinze jours ;
  #863, corrigé le matin, a été **retiré le soir** parce que la question qu'il réparait n'existait plus. ⮕ **Avant de réparer, demande
  si l'objet a lieu d'être.**
- **Mesurer avant de cadrer.** Sur presque tous les lots depuis le 13, la mesure a démenti la fiche.
- **Dire quand une de ses propres hypothèses est réfutée.** Une ligne, et un lot évité.
- **LA REVUE PAR SOUS-AGENTS, EN LECTURE SEULE, PENDANT QUE CLAUDE CODE CODE.** Trois agents, un groupe de fiches chacun, interdits de lancer quoi que ce soit : ils ont trouvé deux fiches en partie périmées (#677, #744), une contradiction entre l'Aide et le code (#740), un défaut technique caché dans une question (#738, `'non-recu'`). ⮕ **Une question se remesure avant de se poser.**
- **UNE PAGE DE DÉCISIONS QUI ENREGISTRE, PLUTÔT QUE ONZE TOURS DE CONVERSATION.** Il tranche à son rythme, sur l'iPad s'il veut, et on relit ses choix par `ArtifactData`. C'est la règle « une idée par tour » appliquée à un paquet de questions.
- **L'AVANCEMENT CONTRE LE DÉPART, DEMANDÉ PAR LUI.** Les cases du tri disent « il reste 81, sur 95 vues passer, 14 closes ». ⚠ Il mesure ses progrès par les parcours, pas par les compteurs : garde les deux avertissements de la page (le total monte quand on inscrit ; les laborieuses avancent peu parce qu'on choisit les lots qui lui demandent le moins).
- **UN LOT AJOUTÉ AVANT LE VERDICT, SUR LE MÊME PARCOURS** (#700 derrière #651) : un seul verdict Playwright, un seul Cowork fermé. ⮕ Pas plus d'un : chaque ajout retarde la mise en ligne du premier.
- **LA RELECTURE PAR EXÉCUTION, AVEC D'AUTRES MUTATIONS QUE L'AUTEUR.** Deux fois le 16 au soir, dans un bac à sable hors du dépôt : six mutations sur six, puis six sur sept – et la septième s'est révélée **équivalente** (l'ancien filtre écartait déjà le cas). ⮕ **Une mutation qui survit n'est pas un trou tant qu'on n'a pas lu pourquoi.**
- **CHERCHER, EN RELISANT, LE LECTEUR QUE LE LOT N'A PAS VU.** La pratique PAN par standards garde son propre calcul des défis ; il est dormant, donc sans effet – mais il fallait le trouver pour le dire.
- **UN PIÈGE TROUVÉ EN PROPOSANT LE LOT, PAS EN LE CODANT** : « Non reçu » est aussi le défaut du formulaire. La consigne prévoit l'arrêt plutôt que de supposer.
- **LA RELECTURE EN SCÉNARIO, PAS SEULEMENT EN MUTATIONS** (16 sept., 19 h 50). J'ai demandé ce que l'écran écrit quand PERSONNE n'a encore enregistré un travail ; le rapport disait « 100 % (3 remises / 4 productions) ». Le lot avait aligné la complétion et oublié la ligne voisine. ⮕ **Cherche le cas limite que la règle du lot rend nouveau**, pas seulement les cas qu'elle nomme. Un petit essai jetable dans le clone, avec le banc de la sentinelle, a suffi.
- **UN COMPLÉMENT AVANT DE PASSER AU LOT SUIVANT.** Relu à 19 h 56, poussé à 20 h 04 : quarante minutes, un seul verdict de plus, et le défaut n'a vécu qu'un soir. ⮕ **Une relecture « à compléter » se règle tout de suite**, par une consigne courte qui liste les mutations survivantes et exige des essais de COMPORTEMENT.
- **LES COMPTES PAR ENSEMBLES, À CHAQUE LOT.** L'écart de la page du tri est passé de {#575} à nul le 17 ; aucune révision de nombre n'a été nécessaire.
- **DES MOTS PROPOSÉS DANS LE TOUR OÙ IL CHOISIT LE LOT, AVEC UNE RECOMMANDATION.** « A ou C < 70% » proposé avec son motif, « ok » en un mot ; les trois textes du lot F présentés ensemble avec « garde-les tels quels », « ok ». ⮕ **Un texte à corriger et un avis, pas une question ouverte.**
- **LES ARBITRAGES EN RAFALE, UNE CARTE PAR TOUR** (17 sept., 8 h – 9 h 15) : onze décisions en une heure et quart, chacune par `AskUserQuestion`, un seul objet, un texte à corriger et une option « (Recommandé) » en tête. Il a demandé lui-même « fixons les arbitrages qui bloquent » pendant que Claude Code codait. ⚠ **Il a pris la recommandation onze fois sur onze** (comme le 16) : la justesse repose sur mes critères, écris-les dans la question.
- **LA RELECTURE EN SCÉNARIO A ENCORE PAYÉ** (lot 27) : l'élève « terminale seule manquante » a montré « Artefacts remis : 9/10 … tous les artefacts remis ! » sur la même carte – aucun banc ne le voyait. Un essai jetable dans le clone, avec l'en-tête de la sentinelle, a suffi. C'est devenu le lot 30.
- **VÉRIFIER QU'UN VERDICT PORTE SUR LE COMMIT** quand une autre session a écrit pendant qu'il tournait : `scripts/.verdict-playwright.json` (sha, `rendule`) contre les `mtime` des fichiers `js/` (`ls --time-style=+%H:%M:%S`). Le 17 : verdict rendu à 13:02:40 UTC, premier fichier du lot suivant à 13:03:43 – verdict valide.

## 6 · COMMENT GRÉGOIRE VEUT QU'ON LUI PARLE

- ⚠ **Sur le Mac, son navigateur est Chrome** (dit à la porte du 30 sept.) ; sur l'iPad, Safari.
- ⚠⚠ **Ce qui le met en surcharge n'est PAS la quantité de travail, c'est la quantité d'information par TOUR.** Une séance peut avoir
  quarante tours ; **chaque tour n'a qu'UN objet.** ⚠ C'est la règle qui se perd en session longue – **revérifie-la avant chaque réponse.**
- **Pose ta question au moment où elle se pose**, et **ne reviens jamais trois tours plus tard** sur un item présenté avant.
- **Toujours une recommandation argumentée**, jamais un exposé d'options neutre. **Propose-lui un texte à corriger.** Tutoiement,
  guillemets français, tiret demi-cadratin, réponse courte d'abord.
- **Les numéros de fiches ne lui disent rien** : rends l'avancement en gestes d'utilisateur, les numéros entre parenthèses en fin de ligne.
- ⚠ **Il corrige bien, et souvent contre toi.** Ma recommandation sur les zones du graphique était « garde l'échelle et arrête le repli
  muet » ; il a répondu « suppression pure », et il avait raison. **Quand il tranche contre toi, cherche d'abord ce qui le rend juste.**
- ⚠ **Le 13 sept.**, il demandait les lots qui lui demandent le moins ; **le 19 sept., il a levé cette réserve** : « je suis disponible pour des lots qui nécessitent un arbitrage. Ne gardons pas ces lots pour plus tard. » Propose-les aussi, sans les différer.
- ⛔ **Le 20 sept. : « Je ne veux pas qu'on efface des données de façon irréversible. »** Aucun lot dont le code supprime définitivement des données d'utilisateur (c'est ce qui a donné 1.151.6). Retirer une case d'un écran n'est pas effacer ce qu'elle a écrit : dis lequel des deux un lot fait.

- ⚠ **Le 17 au matin**, il enchaîne les lots et relaie vite (quatre lots poussés entre 7 h 17 et 9 h 16) ; il a demandé de **trancher les arbitrages pendant que Claude Code code**. Les cartes à choix, une par tour, avec « (Recommandé) », lui conviennent.
- ⚠ **Le 16, après-midi et soir, il corrigeait des copies en parallèle** et a demandé des lots simples. Préfère les lots sans question, sans écran à vérifier, dans **l'Évaluation** (où il travaille) ou le **Dépistage** (son prochain article, labo #6).

### Ce qui remonte jusqu'à lui, et rien d'autre
La **didactique** · ses **données réelles** · les **mots que ses élèves et ses collègues lisent** · ce qui **l'engage publiquement**.
⮕ **Tout le reste, tu le tranches seul et tu le dis en une ligne, en nommant ce que tu as supposé.**

⚠ **Une chose qu'il est SEUL à pouvoir faire, et ce n'est pas un arbitrage : fermer Cowork** avant le verdict Playwright. Demande-le en
une phrase, et donne-lui le bloc de relais AVANT qu'il ferme – après, tu n'es plus là.

- ⚠ **Le 17 sept., entre 2 h et 3 h, il répondait « ok » à chaque proposition.** Quand il valide des mots, **écris-le aussitôt dans `RELAIS.md`** (ajout daté) : c'est ce que Claude Code lira pour savoir qu'aucun patch de mots n'est dû.
