# Consigne – Le rouge de GitHub sur la 1.217.0, avant la version du soir

> Écrite par Cowork le dimanche 25 octobre 2026 à 9 h (Toronto). `main` = `53e13205` (l'entrée de relais) ; la branche `bibliotheques-deux-colonnes` porte le lot 1 des bibliothèques, clos (`f43b6e44`), et attend le lot 3.
> **Ordre décidé par Cowork** : ce lot passe avant le lot 2 des bibliothèques. Grégoire a voulu que le rouge soit regardé avant la mise en ligne (24 oct., 21 h 43) ; la version du soir porte six lots relus (#1148, #1151, #1149, #1153, #1152, #1150), et ce lot est le seul qui la conditionne.

## 0. Avant tout

- **Sur `main`**, pas sur la branche des bibliothèques. Rien de ce lot n'y va.
- Rituel de début de session. Un commit de docs seul : ce fichier.
- **Pas de suite Playwright complète** (règle 7 : elle se prend le soir, sur le commit de release). Des specs ciblées seulement, une à la fois. Le Mac a redémarré cette nuit à 2 h 48, mémoire saturée : regarde la pression mémoire avant chaque lancement.

## 1. Ce qui est établi

- La 1.217.0 (`973ad366`) a été poussée le 24 oct. à 16 h 06 après un verdict complet **vert sur le Mac** (`RELAIS.md`).
- Le job « Playwright — verdict » de GitHub est **rouge sur le même commit : 32 essais échouent sous Linux**.
- Le 19 oct., la première vérification sur GitHub en comptait **25** (`plans de travail/RAPPORT-2026-10-19-premiere-verification-github.md`). #1114 prévoit une baseline propre à Linux pour ceux-là ; d'ici sa bascule, le jeton du Mac reste le juge du push (décision du 10 oct.).
- **Ce qu'on ne sait pas** : les 7 de plus (ou plus, si des 25 sont réparés et d'autres apparus) sont-ils des régressions du code ou des effets de l'environnement Linux ?

## 2. Le mandat

1. Lis la liste des échecs du run de `973ad366` (`gh run view --log-failed`, ou l'artefact du rapport) ; si un run plus récent existe sur `main`, prends aussi le sien.
2. Compare-la, spec par spec, aux 25 du 19 oct. Trois listes : les **anciens** (dans les 25), les **nouveaux**, les **réparés** (dans les 25, plus en échec).
3. Pour chaque **nouveau** : lis l'erreur, lance la spec sur le Mac (WebKit, puis Chromium si la CI tourne en Chromium), et donne-lui une cause :
   - **régression du code** (elle échoue aussi sur le Mac, ou l'erreur désigne un changement d'un lot) : **corriger maintenant**, sur `main`, avec son break-test : elle partirait dans la version du soir ;
   - **environnement Linux** (polices, fuseau, chemins sensibles à la casse, délais, `file://`) : elle rejoint la baseline Linux de #1114 ;
   - **instable** : relance trois fois, dis-le.
4. Si la liste des « environnement » est établie, **crée la baseline Linux de #1114** (`scripts/playwright-baseline-linux.json`, lue par le job à la place de la commune), avec les anciens et les nouveaux de cette cause seulement. Le critère de bascule de #1114 ne change pas.

## 3. Ce qui n'entre pas

Réparer les 25 anciens ; changer le juge du push ; la branche des bibliothèques.

## 4. Clôture

- **Demande de relecture** : `plans de travail/DEMANDE-RELECTURE-2026-10-25-rouge-github-1217.md`, avec un tableau (spec ; ancien, nouveau ou réparé ; Mac ; Linux ; cause ; issue) et, pour chaque régression, le commit qui l'a introduite.
- Pas de release, de verdict complet ni de push : le soir, au signal de Grégoire.
