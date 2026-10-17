# Consigne – « Apporter mon matériel », étape 7 du plan : les textes de Grégoire

> Écrite par Cowork le samedi 17 octobre 2026 à 15 h 02 (Toronto, mesuré par `date`). Étape 7 de `PLAN-2026-10-17-pret-pour-lundi.md`. **Les 89 textes provisoires** de `INVENTAIRE-TEXTES-2026-10-17-apporter-mon-materiel.md` ont été soumis à Grégoire sur la page « Tes textes pour lundi » (Cowork, 14 h 27) ; **il a répondu à tous à 15 h 00**. 75 lui vont tels quels : rien à faire pour eux. Ci-dessous, les 14 qui changent, **mot pour mot**.
> Skills : `labo-codex`, `design-interface`, `release-et-changelog`, `verification-adverse`.

## Les textes qui changent (validés par Grégoire, 17 oct., 15 h 00)

Garde les apostrophes typographiques (’) et les espaces insécables de l'onglet, comme dans le reste du code.

| # | Où (inventaire) | Texte neuf |
|---|---|---|
| 1.1 | `<title>` d'`index.html` | Labo Codex – Soutenir l’enseignement et le suivi des apprentissages |
| 1.4 | bulle `nav-conception-materiel` | Colle ta grille d’évaluation (format tableau), copiée depuis Word, Pages ou un autre traitement de texte : l’application te montre ce qu’elle en a compris, et tu corriges au besoin. |
| 2.1 | `#materiel-en-construction` | 🚧 Cet outil est en développement : il pourrait ne pas reconnaître toutes les grilles et certaines étapes manquent encore. |
| 8.1 | titre de « Ce que contient ton tableau » | Vérifie ce que l’application a lu dans ton tableau |
| 8.2 | texte sous ce titre | Voici ton tableau, tel que l’application l’a lu. Le menu au début de chaque rangée, et celui en tête de chaque colonne, disent ce qu’elle en a compris. Si elle s’est trompée, change le menu : l’aperçu plus bas se met à jour aussitôt. |
| 8.6 | `MOTS_APP.roles` | L’application construira ta grille de critères et son échelle de performance à partir de ce que tu décris ici : les niveaux, les critères, leurs descripteurs et leurs sous-critères. Rien n’est encore créé. |
| 20.13 | `MOTS_APP.rolesPoints` | L’application construira ta grille de critères, notée en points, à partir de ce que tu indiques ici : les critères, leurs points, leurs descriptions et leurs sous-critères. Rien n’est encore créé. |
| 20.14 | `MOTS_APP.rolesPointsNiveaux` | L’application construira ta grille de critères, notée en points, à partir de ce que tu établis ici : les critères, leurs points, ce qui est attendu à chaque niveau, leurs descriptions et leurs sous-critères. Elle ne créera pas d’échelle : la note se calculera à partir des points. Rien n’est encore créé. |
| 10.2 | texte de « Plages de notes » | Pour chaque niveau, indique de quelle note à quelle note il s’étend, en pourcentage, et la note que l’application retiendra pour une copie classée à ce niveau. |
| 12.6 | `MOTS_APP.points` | Les points de chaque critère font partie de ta grille de critères : à l’évaluation, tu noteras chaque critère sur ce nombre, et la note de la copie se calculera à partir des points seuls. |
| 15.11 | manque « code invalide » | un code de 1 à 4 caractères, sans « _ », pour un niveau · un code de 1 à 4 caractères, sans « _ », pour ‹N› niveaux |

Suppositions de Cowork, à dire à Grégoire en une ligne chacune : en 1.1, l'espace double de sa saisie (« Soutenir  l’enseignement ») est ramenée à une seule ; la ligne sous le logo (1.2, validée le 16 oct.) **ne change pas**. En 2.1, l'emoji est dans un `<span aria-hidden="true">` (VoiceOver ne lit pas « panneau de travaux ») ; le `<strong>En construction.</strong>` disparaît avec l'ancien texte. Le bandeau reste jusqu'à ce que Grégoire le retire.

## Une règle de lecture (8.16, validée par Grégoire)

Le nom fabriqué d'un critère sous une partie : **une partie écrite entièrement en capitales est ramenée à une majuscule initiale** (« INTRODUCTION » → « Introduction », « DÉVELOPPEMENT » → « Développement »), puis « ‹Partie› – ‹critère› » comme aujourd'hui. Motif de Grégoire : ce nom s'imprime sur le PDF des étudiant·es s'il n'est pas corrigé à la Vérification. Vaut pour la partie en rangée (5b) **et** la colonne « Partie » (étape 5). Une partie qui porte déjà des minuscules garde sa casse. Le nom du critère n'est jamais touché. Bancs : les lectures attendues de F4a, F6, F8 (et ce qui en dépend) suivent ; un essai neuf, avec sa mutation.

## Un mot dans Grilles de critères (D1, validé par Grégoire)

Le champ du texte d'un critère, libellé « Descripteur » (`grilles.js` ~3437 et ~4811, décision du 4 sept.), devient **« Description »**. Motif : sur le même écran, le bloc « Ce qui est attendu à chaque niveau » montre les vrais descripteurs, par niveau ; l'assistant appelle ce champ « Description du critère ». Mesure d'un `grep` toute autre mention de CE champ sous le nom « Descripteur » (texte d'exemple, aide, info-bulle) et aligne-la ; ne touche **jamais** aux descripteurs par niveau.

## L'entrée des Nouvelles (N1, la version de Grégoire, mot pour mot)

Version `1.203`, couleur `vert`, posée dans `js/changelog-data.js` avec les espaces insécables des entrées voisines. Le numéro de version lui-même ne bouge qu'à l'étape 8 (le script).

- Titre : **Apporter mon matériel**
1. Un nouvel onglet, en tête de Conception : colle ta grille d’évaluation copiée depuis un traitement de texte, et l’application te montre ce qu’elle en a compris. L’onglet est en construction : il pourrait ne pas reconnaître toutes les grilles.
2. Tu corriges sa lecture d’un menu, rangée par rangée et colonne par colonne : critères, niveaux, sous-critères, parties, lignes à mettre de côté. Rien n’est créé avant que tu aies tout vérifié.
3. Une grille en points, avec ou sans niveaux, est acceptée telle quelle ; les totaux et les lignes de calcul de la langue sont mis de côté, chacun avec sa raison.
4. « Créer ma grille » la range dans Grilles de critères ; son échelle, s’il y en a une, dans Échelles de performance ; et, si tes cases s’adressent à l’étudiant·e, ses rétroactions dans Cartouches de rétroaction.
5. Après la création, « Aller plus loin avec ta grille » présente les trois façons d’évaluer un critère que l’application sait exploiter.
6. Dans Grilles de critères, un critère venu de ta grille montre ce qui est attendu à chaque niveau, et ses sous-critères.
7. Les icônes « i » de Grilles de critères et d’Échelles de performance ouvrent de nouveau leur aide.

## La méthode

1. Un commit pour les textes et D1, un pour 8.16, un pour les Nouvelles (ou ce qui est plus sûr).
2. Les essais qui épinglent un ancien texte suivent le neuf, et rien d'autre.
3. **L'inventaire** : marque chaque ligne « validé G. – 17 oct., 15 h 00 » (les 89), avec le texte neuf pour les 14.
4. Bump des jetons (date du build courant, `1015`, lettre suivante : la sentinelle anti-cache ne regarde que ce qui est commité).
5. Vitest complet **après le dernier commit** ; specs du matériel, seules, dans WebKit. Break-test de l'essai neuf de 8.16.
6. Demande `plans de travail/DEMANDE-RELECTURE-2026-10-17-apporter-mon-materiel-7-textes.md`.

Aucun push, aucune release, aucune vérification complète : c'est l'étape 8, au signal de Grégoire. Rapport court, en gestes d'utilisateur.
