# Consigne de démarrage à froid — les sessions qui prennent le relais

> Écrite le **31 août 2026, en soirée**, par `kuekatsheu-85`, qui a coordonné le
> **second** trio du jour (`5d`, `dc`) sur la fermeture de S5. Elle **REMPLACE**
> celle de la fin d'après-midi, qui décrivait S5 comme livré mais non fermé.
> Il l'est maintenant.
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête,
> c'est elle qui fait foi. Un nom qui ne peut pas rôtir vaut mieux qu'une date qu'on
> oublie de retirer.

--

Ouvre le dépôt Monitorage_v6. Rituel d'abord : délègue l'audit de début de session
au subagent `audit-debut-session`, puis lis le bloc en tête de `RELAIS.md`.
On est à la **1.106.13** (build `0831-0734`) — **aucune release**, mais 4 jetons
`?v=` sont passés à `20260831f` : **recharge ta session `file://`**.

⚠ **Piège de démarrage payé quatre jours de suite** : si ta session s'ouvre dans
`/Users/kuekatsheu` et non dans le dépôt, **les skills et les agents de `.claude/`
ne se chargent PAS, en silence**. Lis leur fichier à la main.

---

## ⛔ LE MORATOIRE EST TOUJOURS ACTIF

Les trois gestes de l'écran Trimestres restent interdits. **La levée est une
décision de Grégoire, et il ne l'a pas prise.** Ne la présente pas comme une
formalité et ne la prends pas à sa place.

⮕ Toujours pas réparé, et à ne pas croire réparé :
- **le fichier « Exporter » n'a aucun chemin de restauration** ;
- **le snapshot d'archivage n'a aucun lecteur.**

---

## ⏳ UN GESTE QUI APPARTIENT À GRÉGOIRE, ET QU'IL FAUT LUI DIRE

**`scripts/restaurer-isoler-cartouches-A25.mjs` refuse désormais d'écrire.**
`--ecrire` sort en code 2 ; le dry-run reste entier. C'est délibéré : le script est
un one-shot de juin écrit sous le régime pré-S5, et l'exécuter aujourd'hui
reposerait des clés nues. Le refus **dit comment le lever**, site par site.
⮕ Si Grégoire en a besoin, la voie est de le réécrire, pas de retirer la garde.

---

## OÙ EN EST S5 — FERMÉ

Les trois restes de S5 sont livrés. Il n'y a plus de lot S5 en attente.

| Lot | État |
|---|---|
| **#623 · spec WebKit dédiée** | LIVRÉE (`3eda7d0d`). 5 cas, 5 témoins obtenus. Barre latérale + matrice à grille identique dans deux trimestres · migration au boot par vrai redémarrage · désarchivage · les deux moitiés de l'annonce de partage. |
| **#636 · les sites de `scripts/`** | LIVRÉ (`aa87f9e0`). **22 points de décision, pas 15.** |
| **#639 · l'avis daté** | LIVRÉ (`b8ba7504`), avant que la condition ne s'éteigne à minuit. |
| **#643 · le `.lcz` ne porte pas le trimestre source** | **TOUJOURS OUVERT.** Schéma du manifeste FERMÉ (`partage-schemas.js:22` : champ inconnu = rejet) — l'y ajouter ferait rejeter le paquet par notre propre auto-contrôle. Évolution de format, à ouvrir si Grégoire le veut. |

---

## PIÈGES DÉJÀ PAYÉS — ne les réapprends pas

Les pièges des cycles précédents restent valables (§ correspondant du bloc plus bas
dans `RELAIS.md`). Ceux-ci sont **nouveaux**, et chacun a coûté ce soir.

· ⚠⚠ **`migration_cartouches_namespacees_done` EST UN PIÈGE EN SOI.** Le drapeau
  d'une migration porte le nom de la famille qu'il migre : **tout filtre sur
  `cartouches_` l'attrape**, et sa valeur est un BOOLÉEN. Il a fait planter les
  scripts de #636 (`l.cartouches.forEach is not a function`), **puis, dix minutes
  plus tard, le banc écrit pour les vérifier** — deux sessions, deux codes
  différents, même clé. Ce n'est plus une inattention.
  ⮕ Remède : **deux gardes qui ne peuvent pas se tromper ensemble** — l'une sur le
  NOM (`^([ahe]\d{4}|demo)$` ; le `e` parce que `creerTrimestre` accepte la session
  Été), l'autre sur la VALEUR (est-ce une liste ?).
· ⚠⚠ **UNE GARDE PEUT NAÎTRE MORTE.** Un motif de tolérance visant un
  `console.warn` sur un collecteur restreint aux `error` n'est **jamais confronté à
  rien**. Il avait voyagé par copie sur trois specs sans être re-dérivé.
  ⮕ La question n'est pas seulement « ce motif est-il encore juste ? » mais
  **« peut-il seulement atteindre son collecteur ? »**. Le TYPE du message décide,
  pas son texte. Plus dur à voir qu'une garde périmée : aucun symptôme, jamais.
· ⚠⚠ **UN CORPUS PEUT GARDER UN RÉGIME DISPARU.** Une sentinelle montée sous la
  clé NUE était verte avant S5, **verte pendant toute la régression**, verte après.
  ⮕ Remède : **AJOUTER** la famille neuve, **GARDER** l'ancienne. On ne raccourcit
  pas le corpus d'une sentinelle, on le scinde.
· ⚠ **UN DRAPEAU PEUT RESTER VRAI SUR UN GESTE ENTIÈREMENT NEUTRALISÉ.**
  `js/main.js:735` pose le drapeau de migration dès que `rapport.echecs` est vide —
  or un rapport qui n'a RIEN fait n'a rien à échouer.
  ⮕ **Asserte l'EFFET, jamais le drapeau qui prétend l'attester.**
· ⚠ **UN ORACLE PEUT VISER UNE ADRESSE QUE L'APP NE LIT PLUS** — et corriger le
  seul oracle ne suffit pas. Le réflexe suivant est d'ajuster l'attente au chiffre
  observé, et le test devient vert **en cessant d'exercer son invariant**.
  ⮕ **Une assertion qu'on aligne sur le comportement observé cesse d'être un test.**
  Pose la fixture à l'adresse réelle, fais passer fixture ET oracle par `cle()`, et
  AJOUTE une assertion plutôt que d'en affaiblir une.
· ⚠ **LE CODE DE SORTIE : le pipe n'est pas le seul piège.** `grep -c` qui compte
  **zéro** sort en **1** et **coupe un `&&`** — la suite n'est jamais exécutée et le
  `$?` lu est celui du grep. ⮕ Le code appartient à la dernière commande
  **EXÉCUTÉE**, pas à celle qu'on croit avoir lancée.
· ⚠ **UN NOMBRE SE TRANSMET AVEC SON SCÉNARIO, DANS LA MÊME PHRASE.** Un « 3 »
  juste sous trois appels, rapporté pour un cas qui n'en fait qu'un (où c'est 2), a
  failli faire construire le mauvais remède. Les conditions étaient dans le message,
  un paragraphe plus loin — trop loin pour voyager avec le chiffre.
  ⮕ **Un chiffre dont les conditions ne voyagent pas avec lui est faux à l'usage,
  même quand la mesure était bonne.**
· ⚠ **UNE RÈGLE APPLIQUÉE PARTOUT DEVIENT UN RÉFLEXE.** « Lire = balayer tous les
  trimestres » est juste — sauf là où la question est « joignable POUR CET
  ARTEFACT » (`reparation-453:256`), où balayer produit un faux positif.
  ⮕ **Chercher la frontière d'une règle vaut plus que la règle.**
· ⚠ **LE CHIFFRE D'UNE GARDE N'EST PAS TOUJOURS LA MESURE QU'ON CROIT LIRE.** Le
  hook pré-commit annonçait « 17 » là où la règle compte 18 sites : il ne compte pas
  les sites concernés, il compte ceux que **sa propre tolérance** ne couvre pas
  déjà. ⮕ Pour savoir, va à la RÈGLE, pas à sa SORTIE.
· ⚠ **UN PIÈGE ÉCRIT EN COMMENTAIRE N'ARRÊTE PAS CELUI QUI L'A ÉCRIT.** Troisième
  occurrence en deux jours. Une garde, si.

---

## COMMENT SE COORDONNER — deux trios de suite, zéro collision

· **La coordinatrice tient trois choses, et elle seule** : les identifiants de
  backlog, les commits, et le jeton anti-cache.
· **Un périmètre de FICHIERS par session**, jamais un périmètre de sujet.
· **La coordinatrice lit le diff ENTIER avant de committer** — un `--stat` repère un
  fichier étranger, pas un bloc étranger.
· ⚠ **Toute fenêtre de mutation sur l'arbre partagé s'annonce AUX DEUX BOUTS**, et
  se ferme sur une **somme SHA comparée**, pas sur « j'ai restauré ». Aucun commit
  entre les deux. Une mutation ne vit pas que dans `tests/` : elle touche souvent du
  code de production, et un `--stat` ne dit pas qu'un fichier est saboté.
· ⚠ **Toute consigne d'attente doit avoir une fin explicite.** Dis toujours
  « cycle fini ».
· **Exige un rouge OBTENU par cas, et demande ce qu'il accuse** — pas « c'est rouge ».
· ⚠⚠ **VÉRIFIE TES PROPRES CONSIGNES.** Les deux sessions ont contesté mes prémisses
  avec des mesures, **et elles avaient raison les deux fois** : « `cle()` n'existe
  pas en console » était faux (il est exporté, `js/trimestres.js:2791`), et mon
  compte d'avertissements venait de la sortie d'un outil, pas de sa règle. Une
  consigne de coordinatrice se vérifie comme le reste — et une session qui la
  conteste avec des chiffres fait son travail.
· **Ne prends aucune mesure de seconde main pour un fait**, la tienne comprise :
  un témoin rejoué soi-même a confirmé, un chiffre rapporté a dû être requalifié.

---

## PROPOSE-LUI UN CHOIX FERMÉ ENTRE

**(a)** **S6 / #624** — débloqué, S5 étant fermé. L'écart le plus actionnable est
vérifié : `supprimerGrilleActive` (`js/grilles.js`) ne vérifie AUCUNE dépendance,
alors que son jumeau délègue en deux lignes au chemin gardé — **le patron existe six
lignes plus haut**.
**(b)** **S9 / #627** — libre. ⚠ **Plus petit qu'annoncé sur trois implémentations
sur quatre** : le remède tient dans `fusionnerParIdentite`, un helper partagé par
**cinq** collections, qui connaît la paire `ancienId → nouvelId`, la DIT en
`console.warn`, puis la jette. Voir la correction additive du 31 août au rapport Z2.
**(c)** **#643** — le manifeste `.lcz` ne porte pas le trimestre source des
cartouches. Schéma FERMÉ : c'est une évolution de format, pas un correctif.
**(d)** **Une porte terrain** — plusieurs chantiers d'août attendent une vérification
iPad/Safari que les sessions ne peuvent pas faire à sa place.

⮕ **Une seule décision principale par session.**
