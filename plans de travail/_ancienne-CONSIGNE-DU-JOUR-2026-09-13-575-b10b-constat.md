# Consigne du jour – **IL N'Y A PAS DE LOT**, et c'est le constat principal

> **Écrite par Cowork le dimanche 13 septembre 2026, 18 h 30 (Toronto)**, à la fermeture de la journée. Elle remplace la consigne
> des échelles, archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-13-658-659-echelles.md`.
>
> ⚠ **Mesuré sur `b108723f`.** Comme toujours : **remesure avant d'agir**, les numéros de ligne et les comptes vieillissent.

---

## 0 · CE QUE CETTE CONSIGNE DEMANDE, ET CE QU'ELLE NE DEMANDE PAS

**Elle ne te donne aucun lot de code, parce qu'il n'y en a plus qui ne passe pas par Grégoire.** Ce n'est pas un manque de
matière : **224 fiches** sont ouvertes. C'est que chacune demande son arbitrage, ses données réelles, un écran qu'il faut
regarder, ou porte son verrou « après le 14 ».

⛔ **NE SONDE PAS LE BACKLOG FICHIER PAR FICHIER POUR EN TROUVER UN AUTRE.** Cowork l'a fait le 13 sur la dernière grappe
disponible (`js/echelles.js`, six fiches) : **une seule était un lot de code**, et elle est livrée. Le prochain lot viendra du
**terrain**, pas du tri.

⮕ **Ce que cette consigne demande, en deux gestes, et c'est tout** : le §1 (commiter trois fichiers), puis attendre. Si un retour
de testeur arrive, il prend toute la place — voir §3.

---

## 1 · LE SEUL GESTE DÛ : COMMITER LES TROIS FICHIERS DE COWORK

Ils sont écrits, hors commit, et ils t'attendent. **Rien d'autre dans l'arbre ne doit entrer dans ce commit.**

| Fichier | Ce qu'il porte |
|---|---|
| `PROTOCOLE.md` | la section **« Le cycle d'un lot — la méthode, du backlog au push »**, écrite le 13 à la demande de Grégoire |
| `CONSIGNE-DEMARRAGE-COWORK.md` | réécrite à 18 h 30 : elle **corrige une affirmation fausse** (voir §2) |
| `plans de travail/_ancienne-CONSIGNE-DEMARRAGE-COWORK-2026-09-13-15h35.md` et `-18h.md` | les deux archives |
| `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-13-658-659-echelles.md` | l'archive de la consigne des échelles |
| `plans de travail/CONSIGNE-DU-JOUR.md` | **ce fichier** |

⚠ **Aucun de ces fichiers n'est du code ni du texte d'application.** Pas de release, pas de bump, pas de jeton anti-cache : le
rituel de fin de session s'applique, mais son volet « suite de tests » n'a rien à éprouver ici. Dis-le dans le message de commit.

⛔ **Ne commite PAS** ce qui traîne en `??` et qui n'est pas à nous : `Modèle de consigne de démarrage à froid.txt`,
`Retours des testeurs/jean-françois/`, `docs/projet de développement/`, `ignorés/`. **Ils sont à Grégoire**, et #694 (les dossiers
de retours nominatifs qui voyagent avec le dépôt) dit exactement pourquoi on ne les aspire pas sans lui demander.

---

## 2 · CE QUE LA CONSIGNE DE COWORK CORRIGE, ET POURQUOI ÇA TE CONCERNE

Jusqu'au 13 au soir, ce fichier affirmait que **Cowork ne peut pas lancer la suite de tests**. **C'est faux.** Une installation à
neuf côté Linux fonctionne : clone partagé, `npm install` dans `tests/`, `npx vitest run` — 36 s, 559 fichiers, 6 337 essais.

⮕ **Ce que ça change pour toi** : sa relecture croisée peut désormais **reposer tes break-tests elle-même** au lieu de relire ton
journal. Elle l'a fait le 13 sur #658 : cinq mutations, cinq rouges, témoin vert. **Attends-toi à ce que ses verdicts soient
étiquetés « par exécution » plutôt que « par lecture »**, et à ce qu'un journal de mutations non reproductible soit relevé.

⛔ **Ce que ça ne change pas : le verdict Playwright reste à toi**, et il se prend **Cowork fermé**. Elle ne peut pas se fermer
elle-même.

---

## 3 · PRIORITÉ ABSOLUE, ET ELLE EST IMMINENTE : LES RETOURS DE TERRAIN

**Lundi 14, l'orthopédagogue ouvre l'application sur son poste. Mardi 15, la communauté de pratique découvre l'accueil neuf.**
Ils verront **1.140.6**, qui est bien en ligne (vérifié chez l'hébergeur, pas seulement au sommet d'`origin/main`).

⮕ **Un bug ou un besoin signalé par l'un d'eux INTERROMPT tout et passe avant le backlog.**
- `Retours des testeurs/SUIVI-BUGS.md` — consulter **de façon ciblée** (120 Ko) AVANT de corriger.
- `Retours des testeurs/USAGE-FORMATS.md` — y noter toute observation en moins de 30 s (date + initiales + 1-3 lignes).
- Un numéro de bug et un numéro de fiche viennent du **même compteur** : la ligne « Dernier ID » en tête de `BACKLOG.md`, à
  #859, et elle se met à jour **dans le même commit**.

---

## 4 · LES TROIS CHOSES QUI ATTENDENT GRÉGOIRE

Elles sont listées sous le lot 10 de la page de tri. **Ne les ouvre pas de toi-même** ; s'il te les donne, voici ce que chacune
demande.

**a) L'écran des échelles sur Safari et sur iPad.** Le lot #658 a retiré huit conteneurs, ≈ 930 lignes et 18 règles CSS sans
qu'aucun œil ne regarde le résultat. Tout ce qui part était caché, donc l'attente est « rien n'a bougé » — mais c'est une
attente, pas une mesure. ⮕ Si Grégoire veut le vérifier : skill `portes-terrain`, **deux livrables jumeaux** (le markdown de
`plans de travail/` que TU écris, l'artefact publié que COWORK publie). Deux règles de tête : aucune porte si une machine peut
répondre ; préalable dû seulement si un raté est irréversible.

**b) Le stock de `configEchelle` dans sa base réelle.** Depuis #658, **plus aucun lecteur ni écrivain** des clés nues
`configEchelle` et `niveauxEchelle` : la source est tarie, le stock est **inerte**. Au plus une clé par base, tous trimestres
confondus, et elle voyage dans toute sauvegarde Codex. ⛔ **Tarir n'est pas réparer, et écrire dans ses données lui revient** :
on mesure, on sépare, on propose. Sa console : `localStorage.getItem('configEchelle')`.

**c) #859 — le repère « build vu » écrit deux fois par deux chemins** (`js/init-inline.js`). ⮕ **Recommandation de Cowork : ne
pas l'ouvrir.** C'est un niveau 2 sans symptôme vécu, et la règle du 24 août dit qu'un item n'entre en lot que s'il a un
symptôme que Grégoire a VÉCU, ou s'il bloque un chantier en cours. Ni l'un ni l'autre.

---

## 5 · LES PIÈGES MESURÉS, À RELIRE AVANT DE TOUCHER À QUOI QUE CE SOIT

- ⚠ **Vitest se lance DEPUIS `tests/`** : de la racine il balaie `.claude/worktrees/` sans la config et rend 217 fichiers rouges.
- ⚠ **Lectures ciblées obligatoires.** `SESSION.md` (1,6 Mo), `BACKLOG.md` (1,3 Mo) et `RELAIS.md` (446 Ko) : **jamais sans
  `offset`/`limit`.** En-tête, puis cibler.
- ⚠ **« PUSH RÉUSSI » NE SIGNIFIE PAS « SUITE COMPLÈTE VERTE »** : le hook pre-push ne lance que Vitest. L'ordre qui fait qu'un
  push est jugé est au §4.5 de `fin-de-session` : commit, relecture, **puis** verdict, **puis** push.
- ⚠⚠ **ET « POUSSÉ » NE SIGNIFIE PAS « EN LIGNE ».** Mesuré le 13 : ni le shell de Cowork ni le conteneur n'atteint
  `app.codexnumeris.org`. Le déploiement se lit chez l'hébergeur — projet Netlify `codexnumeris-051225`, qui rend le `commit_ref`
  publié et son état. C'est Cowork qui a cette route.
- ⚠ **Le compte des fiches ne se filtre pas sur la forme du numéro** : `grep -c '\*\*#'` en rate deux (#521 et #523, barrés).
  Compte les lignes `- [ ] ` à la racine et retire le seul gabarit `#XX` de la section « Notes ».
- ⚠ **Zones protégées, inchangées** : `js/config.js`, `js/navigation.js`, `noms_stables.json`. Et **les notes d'A2025 et d'H2026
  ne sont pas rouvertes** (décision de Grégoire du 1er sept., explicitement sans retour).

---

## 6 · SI TU N'AS RIEN À FAIRE

C'est le cas attendu, et **ce n'est pas un problème à résoudre**. Fais le §1, écris ton relais, et arrête-toi. ⛔ N'ouvre pas un
chantier « en attendant » : la règle de stabilité zéro-dette a été révisée le 1er septembre — **l'élargissement de scope n'est
plus gratuit**, la cohorte 1 est arrivée. Un lot non demandé est un lot que personne n'a mesuré.
