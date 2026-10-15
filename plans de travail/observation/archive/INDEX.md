# Archive de l'audit « observer ce que fait réellement l'application »

*15 octobre 2026. Ce dossier complète `plans de travail/observation/`, qui contient les documents de l'audit ; il n'en recopie aucun. L'archive complète, documents compris, existe aussi en un seul fichier à télécharger : `audit-observation-2026-10.zip`, remis à Grégoire le 15 octobre 2026.*

## Les documents de l'audit (dans `plans de travail/observation/` et `plans de travail/`)

| Fichier | Contenu |
|---|---|
| `../../CADRAGE-2026-10-12-observer-ce-que-fait-l-application.md` | Le cadrage : but, temps 1 à 4, limites assumées |
| `../0-preparation.md` | Temps 2, préparation de la copie aveugle : retraits, vérifications, isolement |
| `../1-intentions-scellees.md` | Temps 1 : ce que l'application est censée faire, corrigé par Grégoire puis scellé |
| `../2-observation-aveugle.md` | Temps 2 : ce que fait l'application, observé à l'aveugle (la description la plus détaillée) |
| `../3-ecarts.md` | Temps 3 : les écarts entre intention et observation, sans interprétation |
| `../4-dispositions.md` | Suites du temps 3 : tri des « fait autrement », fiches #1055 à #1067 |
| `../4-preparation-lecture.md` | Temps 4, préparation : version retenue de l'observation, nettoyage |
| `../5-finalite-A.md`, `../5-finalite-B.md` | Temps 4 : les deux lectures indépendantes de la finalité |
| `../6-parcours-interpretation.md` | La méthode d'interprétation en six étapes, avec le texte des consignes |
| `../6-reaction-scellee.md` | Étape 1 : la réaction de Grégoire, recueillie en entrevue et scellée |
| `../7-convergence.md` | Étapes 2 et 3 : convergence entre A et B, et vérification des appuis |
| `../7-contrepoids.md` | Étape 3 : les deux bornes de la finalité, et la place de A et de B |
| `../8-interpretation.md` | Étapes 5 et 6 : confrontation avec les intentions, et dispositions |
| `../9-rapport-audit.md` | Le rapport d'audit |
| `../10-description-application.md` | La description consolidée de ce que fait l'application (base de description) |
| `../11-confrontation-prevu-pas-fait.md` | Les 710 « prévu mais pas fait » du temps 3 : tri au code, contre-vérification, entrevue, dispositions (#1075 à #1086) |

## Les annexes (dans ce dossier)

| Fichier | Contenu |
|---|---|
| `consignes/temps4-lecture-CONSIGNE.md` | Consigne des lectures A et B (dépôt `programme-a-observer`, `lecture/CONSIGNE.md`) |
| `consignes/etape3-CONSIGNE-convergence.md` | Consigne de la session C (`interpretation/CONSIGNE-convergence.md`) |
| `consignes/etape3-CONSIGNE-contrepoids.md` | Consigne de la session D (`interpretation/CONSIGNE-contrepoids.md`) |
| `consignes/copie-aveugle-settings.json` | Réglage ajouté par Grégoire à la copie aveugle : refus de la recherche web et des outils de session |
| `entrevues/etape1-notes-brutes.md` | Notes brutes de l'entrevue de l'étape 1, avant mise en forme et corrections de dictée |
| `entrevues/etapes5-6-notes-brutes.md` | Notes brutes de l'entrevue des étapes 5 et 6 |
| `entrevues/confrontation-prevu-pas-fait-notes-brutes.md` | Notes brutes de l'entrevue sur les 131 entrées « prévu mais pas fait », avec la déclaration de Grégoire qui l'a interrompue |
| `consignes/tri-prevu-pas-fait-CONSIGNE.md` | Consigne commune des agents qui ont trié les 710 entrées au code |
| `tri-prevu-pas-fait/tri-1199-710-verdicts.json` | Les 710 verdicts du tri au code de la 1.199.0 (explication, preuve, recherches) |
| `tri-prevu-pas-fait/contre-verification-47.json`, `echantillon-ids.json` | Le second tri, à l'aveugle, de 47 entrées tirées au hasard |
| `tri-prevu-pas-fait/pas-fait-en-1201.json` | Les 29 « pas fait » recherchés dans la 1.201.0 |
| `copie-aveugle/programme-a-observer.bundle` | Le dépôt `programme-a-observer` complet, toutes branches : la copie aveugle, l'observation (branche de l'analyste), les lectures A et B, la convergence et le contrepoids |

Pour ouvrir la copie aveugle : `git clone programme-a-observer.bundle programme-a-observer`, puis `git branch -a` pour voir les branches.

## Ce qui manque

- La consigne donnée à l'analyste du temps 2 (l'observation à l'aveugle) a été tapée par Grégoire dans sa session ; elle n'est pas dans le dépôt. Le cadrage en donne le principe (« décrire ce que fait ce programme, sans description préalable de l'application ni de son but ») et la méthode.
- Les transcriptions des sessions isolées (A, B, C, D et l'analyste du temps 2) vivent sur l'autre compte claude.ai ; elles ne sont pas archivées ici.

## Ce que le fichier `.zip` ajoute

- **`html/`** : une version HTML lisible de chaque document, tableaux mis en forme. Elles restent hors du dépôt, parce que ce sont des dérivés des `.md`.
- **`outils/`** : les scripts de la préparation de la copie aveugle. Ils servaient à retirer les commentaires, à les vérifier, à traiter les SVG et à vider le changelog. Ils restent hors du dépôt, parce que ce ne sont pas du code de l'application.
- **`verifications/`** : les journaux des 33 essais Playwright passés sur l'original et sur la copie, et le relevé chiffré du nettoyage.
