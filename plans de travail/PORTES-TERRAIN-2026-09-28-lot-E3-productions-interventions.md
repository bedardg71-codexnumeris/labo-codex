# Portes terrain – lot E3 (1.167.0) : productions, interventions, volet confidentiel, réglages

> Écrites le 28 septembre 2026, au soir, par Claude Code. **Cowork publie l'artefact** (bouton « Copier mes résultats » obligatoire). Sur tes **données réelles**, à l'adresse `https://app.codexnumeris.org`, **sans rien créer de fictif** ; chaque geste qui modifie a sa rangée de retour. Ce qui échoue devient une fiche du BACKLOG.
>
> **Deux portes seulement** : le reste est mesuré par les tests (Vitest 7 700, WebKit, dont le banc du lot : 15 essais sur le vrai `index.html`). Ce qu'aucune machine ne juge : que ce que tu changes **au doigt sur l'iPad**, sur **ta** production et **ta** fiche confidentielle, soit encore là après un rechargement.

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 | Sur l'iPad, ouvre `https://app.codexnumeris.org`, recharge, lis le numéro en bas de page. | **1.167.0**, build **0928-1959**. Un autre numéro : arrête-toi, la version n'est pas encore en ligne. |

## §1 · Interface, sur l'iPad

### 1.1 · Une de tes productions s'enregistre toute seule `iPad`

*Pourquoi : avant, une production modifiée n'était gardée qu'après « Enregistrer » ; ce bouton a disparu. Si l'écriture au doigt ratait, ta modification se perdrait en silence.*

| | Geste | Attendu |
|---|---|---|
| 1.1.a | Conception › Productions : touche une de tes productions. Note mentalement le texte du champ « Activité d'apprentissage ». | La fiche s'ouvre ; en haut, « Fermer » seul (pas de « Créer la production »). |
| 1.1.b | Ajoute « (essai) » à la fin du champ « Activité d'apprentissage », puis touche ailleurs sur la page. | En bas à gauche, « Enregistré » apparaît un instant. |
| 1.1.c | Recharge la page, rouvre la même production. | « (essai) » est toujours là. |
| 1.1.d | **Retour** : retire « (essai) », touche ailleurs. | « Enregistré » ; le champ a retrouvé son texte d'origine. |

### 1.2 · Le volet confidentiel d'un·e de tes étudiant·es s'enregistre tout seul `iPad` `⚠⚠ Données`

*Pourquoi : avant, « Annuler » ou la croix perdaient ce que tu venais de cocher ; il n'y a plus que « Fermer », et chaque case s'écrit au toucher.*

| | Geste | Attendu |
|---|---|---|
| 1.2.a | Suivi › Profil d'un·e étudiant·e › Accompagnement › « Confidentiel ». Repère une case de la section des défis qui n'est **pas** cochée. | La fenêtre s'ouvre ; en bas, « Fermer » seul (plus d'« Enregistrer »). |
| 1.2.b | Coche cette case. | « Enregistré » apparaît un instant. |
| 1.2.c | Touche « Fermer », recharge la page, rouvre le volet du même étudiant·e. | La case est toujours cochée. |
| 1.2.d | **Retour** : décoche-la, puis « Fermer ». | « Enregistré » au décochage ; rouvert, la case est décochée comme au départ. |

## §2 · Décisions

Aucune : les mots et les Nouvelles sont acceptés (28 sept., 19 h 46).

## §3 · Ce que je n'ai pas pu vérifier

- **La question de complétion d'une intervention, avec sa case, au doigt sur l'iPad** : aucune intervention réelle n'existe cet automne, et en créer une fictive est exclu. Les tests la jugent dans WebKit (case décochée à l'ouverture, aucune présence écrite sans elle, report une fois cochée). À ta première vraie intervention complétée : si la case ne se coche pas au doigt, ou si des présences apparaissent sans que tu l'aies cochée, dis-le.
- **Le changement de sous-onglet pendant une création** (production ou intervention) ne pose pas la question de sortie : il passe par une zone protégée de l'application. Une intervention en cours de création reste à l'écran au retour (mesuré) ; pour une production en cours de création, ce retour n'a pas été mesuré.
- **Le passé** : des présences en double laissées par d'anciennes interventions complétées puis redatées ne sont ni mesurées ni corrigées (ta décision du 28 sept., 19 h 45 ; fiche #978 pour la suite).
