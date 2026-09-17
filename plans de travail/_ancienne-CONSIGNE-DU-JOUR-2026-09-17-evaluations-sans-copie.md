# Consigne suivante – relire une évaluation sans copie (bug testeur, tout le trimestre A2025)

> Écrite le 17 septembre 2026, 13 h 54 (Toronto), par Cowork, pendant le lot 34. **Rapport de testeur : passe AVANT le backlog.**
> **Condition de départ** : `git --no-optional-locks log --oneline -1 origin/main` doit montrer la version du lot 34 (#898) ; sinon, arrête-toi et signale-le. Puis archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-17-echelle-a-l-adoption.md` et renomme `plans de travail/CONSIGNE-SUIVANTE-evaluations-sans-copie.md` en `CONSIGNE-DU-JOUR.md`.
> ⚠ **La consigne `CONSIGNE-SUIVANTE-date-d-arrivee.md` (lot 35, #735) est REPORTÉE derrière celle-ci** : un retour de testeur passe devant. Ne la renomme pas.
> **Identifiant** : prendre **#911** pour le bug — ⚠ #909 et #910 ont été pris par le lot 34 pendant l'écriture de cette consigne ; **relis la ligne « Dernier ID utilisé » sur `main` avant d'en prendre un** — et écrire sa fiche dans `Retours des testeurs/SUIVI-BUGS.md`, pas dans le backlog. Mettre à jour la ligne « Dernier ID utilisé » dans le même commit.

## 1 · Le symptôme, tel qu'il est vécu

Rapport du 17 sept., 13 h 49 (`Retours des testeurs/gregoire/BUG__grégoire__2026-09-17_13-49-26.txt`), gravité GÊNANT, sur **1.142.28**, Chrome 152, Mac.
**Grégoire ne peut ouvrir AUCUNE de ses évaluations du trimestre Automne 2025.** Trimestre actif `a2025` (bandeau « LECTURE SEULE — Automne 2025 »), 30 élèves, 303 évaluations. Depuis Évaluation › Liste des évaluations › menu « Actions… », l'ouverture échoue et l'application affiche **« Erreur de chargement — Impossible de charger l'évaluation: Timeout : les critères de la grille ne sont pas rendus »** ; la page reste vide.
Console : `❌ Timeout : le premier critère n'est pas rendu (ni menu de niveaux, ni champ de points)` puis `Contenu listeCriteresGrille1: undefined` (`js/evaluation.js:1693`).

**Ce trimestre est le cas d'usage d'origine de l'application** : le module d'importation n'existait pas, Grégoire évaluait avec les grilles et les échelles, puis recopiait la rétroaction dans Léa à la main. **Aucune copie n'a jamais été importée.**

## 2 · Ce que Cowork a MESURÉ chez lui (sonde de console, lecture seule, trimestre a2025 actif)

```
A2025 : {"total":303,"sansGrilleId":0,"grilleIntrouvable":0,"sansCriteres":7,"avecFichier":0,"sansFichier":303} | grilles visibles : 3
```
⮕ **Les 303 évaluations sont sans fichier** (`travauxResolution.trouverFichierPourEvaluation` rend `null` pour toutes). **Aucune grille n'est introuvable** : la piste « grille perdue » est écartée par la mesure. **Sept évaluations n'ont aucun critère enregistré** — cas à part, à nommer (l'attente rend `false` sans critère, elle ne rejette pas).
⛔ **La cause n'est PAS mesurée** : que le conteneur `#listeCriteresGrille1` n'existe pas au bout de 3 s est un CONSTAT, pas un diagnostic. **Remesure d'abord**, sur un jeu d'essai qui reproduit le cas (évaluations enregistrées, aucun fichier), avant d'écrire une ligne.
- Pistes à éprouver, dans cet ordre, sans les prendre pour acquises : (a) le formulaire ne s'ouvre qu'à partir d'un FICHIER ouvert dans la visionneuse (`basculerMode` exige un fichier ouvert, `travaux-ui.js:4677` — limite déjà nommée au lot #868) ; (b) le chemin de la Liste des évaluations (`liste-evaluations.js`, menu « Actions… ») n'est pas celui qu'a corrigé #868, qui visait les cinq boutons du PROFIL ; (c) le mode **lecture seule** d'un trimestre archivé change-t-il le rendu ? à départager de (a) : mesure un trimestre NON archivé sans copie.
- ⚠ #652 (lot 1.142.16) a déjà corrigé une attente voisine : elle guette maintenant n'importe quel critère enregistré. Ici le conteneur lui-même est absent : **ce n'est pas le même défaut**, ne le recorrige pas sans mesure.

## 3 · Ce que le lot doit rendre possible

1. **Ouvrir et relire une évaluation sans copie**, depuis la **Liste des évaluations** ET depuis le profil de l'élève : la grille se rend, les niveaux et les rétroactions enregistrés sont restaurés, la note s'affiche. Sur un trimestre en lecture seule, en lecture seule — **rien ne doit être écrit dans A2025**.
2. **La synthèse de rétroaction se génère pour une évaluation sans copie.** C'est la demande explicite de Grégoire : « il faudrait que la synthèse des rétroactions soit possible ». Mesure d'abord ce qu'elle fait aujourd'hui sans fichier (`synthese-retroaction-data.js`, `synthese-retroaction-rendu.js`) : si elle fonctionne déjà, dis-le et ne touche à rien ; si elle exige un fichier, nomme où.
3. **Les sept évaluations sans critère** : dis ce qu'elles font à l'ouverture, et ne les répare pas dans ce lot si elles demandent une décision.

⛔ **Arrêt** : si rendre la grille sans copie demande de toucher au moteur de la visionneuse (`travaux-ui.js`) au-delà d'une garde, arrête-toi et rapporte le périmètre avant de coder — c'est un chemin que tout le monde emprunte.

## 4 · Au passage, mesuré et vécu (à traiter seulement si c'est une garde)

**Le formulaire de rapport de bogue ne se remplit pas quand l'alerte d'erreur est affichée** : Grégoire a cliqué huit fois sur `#sectionFormulaireBug` sans pouvoir écrire sa description (son rapport est parti sans texte). Mesure si l'alerte capte le clic ou le focus ; si c'est une garde d'une ligne, corrige ; sinon, inscris et continue.

## 5 · Preuve attendue

- **Un jeu d'essai qui reproduit le cas** : des évaluations enregistrées, avec critères et niveaux, **sans aucun fichier**. Le banc doit être ROUGE avant le correctif — c'est le symptôme de Grégoire reproduit — et vert après.
- **Des mutations qui changent le comportement**, une clause à la fois.
- **Un banc WebKit** qui ouvre une évaluation sans copie depuis la Liste des évaluations, par les vrais boutons, et lit la grille rendue ; plus un essai sur la synthèse de rétroaction sans copie.
- **Mesuré à 768 px** si un écran change.

## 6 · Mots et traces

- **Fiche #909 dans `Retours des testeurs/SUIVI-BUGS.md`** (pas dans le backlog), avec la mesure de la sonde ci-dessus et la version du rapport (1.142.28).
- **Phrase de « Nouvelles »** : à proposer à Grégoire par Cowork avant la release.
- **Fichiers de Cowork à commiter avec le lot** : cette consigne renommée, son archive, `plans de travail/DECISIONS-2026-09-17-apres-midi.md` (neuf décisions rendues cet après-midi, chacune avec la ligne exacte à poser sous sa fiche) et `plans de travail/CONSIGNE-SUIVANTE-date-d-arrivee.md` (lot reporté).
