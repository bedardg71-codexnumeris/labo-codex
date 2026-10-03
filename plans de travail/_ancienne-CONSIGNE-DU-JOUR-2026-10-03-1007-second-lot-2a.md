# Consigne suivante – #1007, second lot : proposer le codex avant une suppression ordinaire

> Écrite par Cowork le 3 octobre 2026 à 3 h 34 (Toronto, mesurée par `date`), pendant ta mise en ligne de 1.175.0. **Ne l'ouvre qu'une fois 1.175.0 en ligne et `claude/1007-codex-a-part` fusionnée dans `main`** : ce lot part de `js/codex.js` tel que le premier lot l'a laissé. Si ce n'est pas le cas, arrête-toi et dis-le à Grégoire.
> Référence : `plans de travail/DECISIONS-2026-10-02-1007-suppressions.md` (§ 1 à 4, 6 et 8), `plans de travail/INVENTAIRE-2026-10-02-1007-gestes-qui-suppriment.md` (§ 2.2 et 2.3).

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork et à écrire dans `BACKLOG.md`. **Ni push du code ni release** : ce chemin précède l'effacement des données de l'usager, relecture croisée d'abord (règle 2).

## 0 · Mise en place

Archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-03-1007-release-1.175.0.md`, puis renomme ce fichier-ci en `CONSIGNE-DU-JOUR.md`. Commite ces deux mouvements tels quels.

## 1 · Le périmètre, tranché par Cowork

Le second lot se coupe en deux, **tu fais 2a seulement** :

- **2a** (ce lot) : les 38 gestes P1 à P38 ; les trois gestes de la corbeille et de la Modélisation, G1 à G3 (le codex les rend depuis 1.174.6) ; la suppression d'un paramètre de configuration dans Réglages › Gestion avancée, **pour les seules clés `enseignants` et `modalitesEvaluation`**.
- **2b** (lot suivant, pas maintenant) : les lignes d'éditeur qui portent des notes d'élèves (critère, sous-critère, niveau d'échelle, cible de dénotation déjà employés dans au moins une évaluation). Motif de la coupe : 2b exige un test « déjà employé » mesuré au moment du geste, qui est un travail à part ; 2a n'est que le branchement d'une fenêtre commune.
- **Rien** pour le reste des réglages, des lignes d'éditeur et des classements (décisions § 2 à 4) : n'y touche pas.

Si ta remesure (§ 2) montre que 2a est trop gros pour un seul lot relisible, propose une coupe dans ta demande au lieu de tout livrer d'un coup.

## 2 · Remesure, avant d'ouvrir

Pour chaque geste de 2a : vérifie qu'il vit encore là où l'inventaire le dit (fichier, fonction, porte ou portes), et ce qu'il demande aujourd'hui avant d'effacer. Rends-le en tableau, comme le § 1 de ta demande du premier lot. Signale tout geste déplacé, disparu ou neuf.

## 3 · Le parcours commun (décisions § 6 et 8)

Une seule fonction dans `js/codex.js`, appelée par toutes les portes de 2a, sur le modèle de `ecrireAPartAvantSuppression` : elle rend `true` si la suppression peut continuer, `false` sinon, et l'appelant ne fait rien d'autre sur `false`.

1. **Codex à jour** (`Codex.etat`) : la fonction rend `true` sans rien afficher. Le geste garde sa confirmation habituelle, inchangée.
2. **Codex pas à jour** : avant la confirmation habituelle du geste, la fenêtre du § 8, mots acceptés par Grégoire :
   > **Mettre ton codex à jour avant de supprimer ?**
   > Supprimer cette évaluation l'efface pour de bon. Ton codex à jour pourra te la rendre, jusqu'à ta mise à jour suivante.
   > [Annuler] [Supprimer sans mettre à jour] [Mettre à jour, puis supprimer]
   - « Annuler » : rien n'est supprimé. Il a le focus.
   - « Supprimer sans mettre à jour » : la confirmation habituelle du geste, puis le geste.
   - « Mettre à jour, puis supprimer » : **le chemin habituel de « Mettre à jour le codex »**, avertissement des copies manquantes de 1.174.0 compris, par les mêmes fonctions (`_mettreAJourLeCodex`, `_ecrireLeCodexPrepare`), pas une copie. Seulement s'il réussit, la confirmation habituelle du geste, puis le geste. Un échec ou un abandon : rien n'est supprimé.
3. **Aucun codex actif** : même fenêtre, le bouton du milieu reste ; le troisième devient le chemin d'écriture d'un codex. Propose ses mots dans ta demande si les mots existants ne vont pas.
4. **Gestes sans question aujourd'hui** (page supprimée puis « Enregistrer », fusion de copies, « Effacer tout », tampon) : la fenêtre paraît au moment où l'effacement se fait réellement (à « Enregistrer » pour P10 et P11), et seulement si le codex n'est pas à jour.
5. La première phrase s'adapte au geste (« cette évaluation », « cette grille », « ces copies »… et « la », « les »). **Propose la liste exacte des variantes**, une par geste, sans autre mot neuf : elles sont à Grégoire.

## 4 · Ce que tu ne fais pas

- Aucun mot changé dans les confirmations existantes, même ceux qui disent faux (constat C8 de l'inventaire) : ils restent à Grégoire, hors de ce lot.
- Aucune garde ajoutée là où il n'y en a pas (pratique, grille, profil enseignant : C4, C5, C9). Trouvaille en chemin : issue 2 par défaut, inscrite sous #1007.
- Pas de 2b.

## 5 · La preuve

- Un banc WebKit neuf : pour un échantillon d'au moins un geste par famille (structure, évaluation et copies, matériel, corbeille, configuration), les trois chemins (codex à jour : aucune fenêtre ; pas à jour : « Annuler » ne supprime rien, « Supprimer sans mettre à jour » supprime, « Mettre à jour, puis supprimer » met à jour puis supprime ; échec de l'écriture : rien n'est supprimé).
- Une sentinelle qui échoue si une porte de 2a efface sans passer par la fonction commune. Démontre qu'elle peut rougir (mutation).
- Vitest complet. Pas de verdict Playwright complet : il viendra avec la release.

## 6 · Ce que tu rends

1. Commit sur une branche locale `claude/1007-propose-codex`, non poussée ; l'arbre principal laissé sur `main`.
2. `plans de travail/DEMANDE-RELECTURE-2026-10-03-1007-propose-codex.md` : en tête, pour Grégoire, trois lignes en gestes d'utilisateur ; puis la remesure, le parcours, la liste des variantes de mots, la proposition de ligne des Nouvelles, ce que tu as supposé.
3. `RELAIS.md` à jour.

À Grégoire, trois lignes : ce que le lot fera à l'écran ; ce qui l'attend (la relecture, puis les variantes de mots) ; ce que tu as supposé.
