# Rapport — recentrage du rituel de début de session (10 nov. 2026)

**Branche** : `lot/rituel-debut-de-session`, partie de `origin/main` (`358eb82a5`). Mandat : décision de Grégoire du
10 nov. 2026, sur recommandation de Cowork. **Un seul fichier de consigne touché** :
`.claude/skills/debut-de-session-labo-codex/SKILL.md`. Aucun fichier de `js/`, pas de verdict, pas de release, pas de
fusion : la session principale fusionnera après le groupe 3.

> **Relais du 10 nov. 2026, second passage (décisions techniques de Cowork sur ce rapport)** : fait et poussé, rien
> fusionné. **Le skill chargé à chaque ouverture pèse 16 109 octets (272 lignes)**, contre 22 745 (465 lignes) au
> départ et 24 281 après le premier passage. Les mesures sous condition vivent à côté, dans
> `mesures-sous-condition.md` (10 321 octets, 180 lignes), lu seulement si le mandat demande une release, un verdict
> ou un push sur `main`.
>
> Ce qui a changé à ce passage : (a) les trois suppositions sont retenues ; (b) `cat RELAIS.md` retiré du §1.0 — rien
> de `RELAIS.md` si le mandat nomme la branche, sinon sa dernière entrée seule, avec `offset`/`limit` ; (c) l'arrêt
> « branche distante plus récente que `main` » retiré, **et avec lui le balayage `for-each-ref`, qui ne servait qu'à
> le nourrir** (ma décision : une commande sans conséquence est du bruit) ; (d) §2, §2.1 et §3 sortis mot pour mot
> (vérifié par `diff` contre le texte d'origine) ; (e) agent retiré ; (f) `CLAUDE.md` ; (g) renvois mis à jour.
>
> **Fichiers touchés à ce passage** :
> - `.claude/skills/debut-de-session-labo-codex/SKILL.md` (modifié)
> - `.claude/skills/debut-de-session-labo-codex/mesures-sous-condition.md` (neuf)
> - `.claude/agents/audit-debut-session.md` (retiré ; le dossier `.claude/agents/` n'existe plus, c'était son seul fichier)
> - `CLAUDE.md` (deux passages : la délégation à l'agent, la règle des lectures ciblées ; 249 lignes)
> - `.claude/skills/verification-adverse/SKILL.md` et `ANALYSE-verification-adverse.md`
> - `.claude/skills/fin-de-session-labo-codex/SKILL.md`
> - `FICHE-RELECTURE.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`
> - ce rapport
>
> **Un renvoi reste faux, laissé tel quel** : `Modèle de consigne de démarrage à froid.txt`, l. 5-6, dit encore
> « délègue l'audit de début de session au subagent `audit-debut-session` ». C'est un exemple daté du 30 août
> (1.106.3), hors de la liste (g) : je l'ai traité comme un récit historique. S'il sert encore de gabarit à Cowork,
> il est à corriger.
>
> **Non vérifié** : le déclenchement réel du skill dans une session neuve. Les sections plus bas décrivent l'état
> après le PREMIER passage ; les « deux renvois qui annulent l'effet » et les trois questions sont désormais réglés.
>
> **Relais du premier passage** : le lot est fait et poussé. Restent à trancher, hors de ce lot : les renvois listés plus bas (dont deux
> qui annulent une partie de l'effet tant qu'ils ne sont pas corrigés), et trois questions en fin de rapport.

## La taille, avant et après

| | Avant | Après |
|---|---|---|
| Lignes | 465 | 420 |
| Octets | 22 745 | 24 281 |
| dont tests, verdict GitHub, version | 9 633 (toujours exécutés) | 9 735 (sous condition) |
| dont le reste | 13 112 | 14 546 |

**Le fichier n'a pas maigri : il a grossi de 1 536 octets.** Deux causes mesurées : l'entrée d'historique (environ
1 300 octets) et le texte des §2, §2.1 et §3, gardé mot pour mot parce qu'il porte les leçons du 2 sept., du 30 sept.
et du 10 oct. Ce qui a baissé n'est pas le poids du fichier, c'est ce qu'il fait exécuter : une session de lot ne lance
plus Vitest ni `gh`, ne lit plus `SESSION.md` ni `BACKLOG.md`, et rend une ligne au lieu d'une trentaine. Je n'ai pas
mesuré le coût en tokens d'une ouverture après recentrage : c'est une inférence, pas un chiffre.

## Ce qui est retiré

- Les déclencheurs « relai », « audit », « on commence », « où en est-on », « état des lieux » ; avec eux « fais le
  point », la « prémisse de relance avec des commandes git » et « plus de quelques heures écoulées ». Seul reste le
  premier tour d'une session.
- La lecture de `SESSION.md` (ancien §4) et celle de l'en-tête de `BACKLOG.md` (ancien §5), y compris la vérification
  du « Dernier ID ».
- Le tableau prémisse/réel (ancien §6) et la « note de relance à insérer dans `SESSION.md` ».
- Le rapport « état des lieux » (ancien §7) : sections Repo, Tests, Version, priorités annoncées, cap recommandé, et
  l'arrêt systématique en attente de confirmation.
- `git log main -10`, le décompte des commits depuis la prémisse, l'inventaire détaillé des fichiers non suivis.
- Le renvoi d'en-tête vers le mode B de `verification-adverse` (le rituel ne produit plus ce baseline par défaut).

## Ce qui demeure

- **§0.5** (piège du répertoire de démarrage) et **§1.0** (où vit le travail) : identiques à l'octet près, vérifié par
  `diff`.
- **§2, §2.1, §3** (tests, verdict de GitHub, version) : texte inchangé, placé derrière une condition — le mandat
  demande une release, un verdict ou un push sur `main`. Seules les listes « Reporter » de fin sont remplacées par ce
  qui compte comme écart.
- La lecture seule, et le pendant avec `fin-de-session-labo-codex`.
- L'historique, complété d'une entrée du 10 nov.

## Ce qui est neuf

- **§0.1** : le premier message est le mandat ; on en tire la branche, sa base, ses assertions, et s'il demande une
  release, un verdict ou un push sur `main`.
- **§1.1** : l'inventaire d'UNE branche (celle du mandat, ou `main`) : HEAD, état de l'arbre, avance et retard sur
  origin. Cas de la branche neuve traité.
- **§1.2** : lecture de l'en-tête du `RAPPORT-…` de la branche, lu sur la branche. Commandes éprouvées sur
  `lot/parcours-7-lire-ta-classe` : l'en-tête fait 790 octets.
- **§4** : seuls les écarts sortent, cinq lignes au plus ; sans écart, une ligne et la session travaille.

## Ce que j'ai supposé (à corriger si faux)

1. **Session principale sur `main` : pas de rapport de branche à lire**, et ce n'est pas un écart. Le mandat ne dit pas
   quoi lire dans ce cas ; j'ai retenu « rien », puisque l'état d'ensemble vit dans la relève de Cowork.
2. **Devant un écart** : la session s'arrête seulement s'il change ce que le mandat demande (travail déjà livré,
   mauvaise branche, arbre portant le travail d'un autre) ; sinon elle le dit et travaille. Le mandat ne fixait que le
   cas sans écart.
3. **« En-tête du rapport »** = du titre au premier `## `. C'est la forme des rapports de novembre ; je n'ai pas
   vérifié les 51.

## Les renvois au rituel tel qu'il était — non modifiés

**Deux d'entre eux annulent une partie de l'effet tant qu'ils restent :**

- **`.claude/agents/audit-debut-session.md`** (l. 4-9) : sa description porte encore les déclencheurs « où en est-on »,
  « état des lieux », « on commence », « relai », « audit », « fais le point ». **Le déclenchement sur ces mots survit
  donc par l'agent.** Son corps est aussi périmé : « suis-le intégralement, §1 à §7 » (l. 21-22 ; le §7 n'existe
  plus), Vitest lancé d'office (piège 1), lecture de `SESSION.md` et de `BACKLOG.md` (pièges 2 et 3, « Voir §5 du
  skill »), et « UNIQUEMENT le rapport du §7 : repo, tests, version, écart, priorités annoncées, cap recommandé »
  (l. 44-45).
- **`CLAUDE.md`** (l. 39-43) : « déléguer le rituel au subagent `audit-debut-session` […] audit git + tests + version,
  lecture ciblée de `SESSION.md`/`BACKLOG.md`, comparaison avec la prémisse ». Aussi l. 49-51 : la règle des lectures
  ciblées cite `SESSION.md` et `BACKLOG.md` comme lectures d'ouverture.

Les autres :

- **`CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`** : l. 376 (« Puis le rituel : skill […] délégué au subagent ») ; l. 619
  (§0.5 : toujours juste) ; l. 620 (« Les deux mesures d'ouverture […] §2 » : le numéro tient, mais elles sont
  maintenant sous condition) ; l. 634 (historique, exact).
- **`.claude/skills/verification-adverse/SKILL.md`** : l. 407 (« Mode A (baseline d'entrée) : […] git/tests/version,
  prémisse vs réel ») et l. 415 (« En mode B, charger aussi le skill `debut-de-session-labo-codex` (baseline
  factuel) »). Le skill ne rend plus tests ni version par défaut. Même renvoi dans
  `ANALYSE-verification-adverse.md`, l. 101.
- **`.claude/skills/fin-de-session-labo-codex/SKILL.md`** : l. 352 (« le rituel d'ouverture lit les JOBS du dernier
  run ») : vrai seulement sous condition désormais.
- **`FICHE-RELECTURE.md`** : l. 153 (« Dire "on commence" → `debut-de-session-labo-codex` doit se déclencher ») : ce
  contrôle échouera, et c'est voulu.
- **`PROTOCOLE.md`** : l. 180 (« le rituel de début de session a menti le 1er septembre […] Il est l'ancre de confiance
  de la session ») : récit historique, encore exact ; la qualification d'« ancre de confiance » vise l'ancien
  périmètre.
- **`ETAT-PROJET.md`** : l. 845, simple mention du chemin du skill.
- **`SESSION.md`** : 17 mentions, toutes des récits de sessions passées (l. 395, 5894, 7637, 7918, 8056, 9710, 11662,
  11668, 11755, 15162, 15240, 15351, entre autres) ; la l. 8056 répète « on commence → `debut-de-session-labo-codex` ».
  `BACKLOG.md` (8) et `RELAIS.md` (16) : non dépouillés ligne à ligne, fichiers d'historique.
- `README.md` l. 104, `SUIVI-BUGS.md` l. 450 et cinq rapports de `Rapports/` : mentions de passage, sans consigne.

## Trois questions que le lot laisse ouvertes

1. **Le §1.0, gardé tel quel, fait `cat RELAIS.md`** : le fichier pèse 1 237 034 octets, et `CLAUDE.md` interdit de le
   lire sans `offset`/`limit`. À chaque ouverture, c'est le plus gros coût qui reste.
2. **Le §1.0 dit de s'arrêter « si une branche distante est plus récente que `main` »** : avec des lots menés en
   parallèle sur leurs branches, c'est vrai à presque toutes les ouvertures. La règle entre en tension avec « une
   ligne, puis au travail ». Je ne l'ai pas touchée ; elle demande une décision.
3. **Proposition, non faite** : sortir les §2, §2.1 et §3 (9 735 octets) dans un fichier voisin du skill, chargé
   seulement quand la condition est remplie. Le skill chargé à chaque ouverture tomberait à environ 14 500 octets.
   Coût : le renvoi « §2 » de la consigne de démarrage (l. 620) casserait.

## Vérifié comment

- `diff` entre l'ancien et le nouveau texte des §0.5 et §1.0 : aucun écart.
- Les commandes des §1.1 et §1.2 lancées dans ce conteneur sur une branche réelle.
- **Non vérifié** : le déclenchement réel du skill dans une session neuve (description modifiée), et le comportement
  de l'agent `audit-debut-session`, qui charge ce skill avec une consigne devenue contradictoire. Cela ne se mesure
  qu'à la prochaine ouverture.
