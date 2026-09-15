# Plan de travail — « Évaluer » mène au formulaire, avec ou sans copie (#868)

> Écrit le 15 septembre 2026, 15 h 40 (Toronto), par Claude Code, sur `c358f29e`.
> **À valider par Grégoire AVANT toute ligne de code** (sa demande : « je veux être certain que
> nous parlons bien de la même chose »). Rien n'est commencé.

---

## 1 · En une phrase

Où que tu cliques « Évaluer » (profil d'un élève, liste des évaluations), tu arrives sur le
formulaire d'évaluation **de cet élève pour cette production**, avec les outils d'évaluation :
dans la copie si elle est importée, sans copie sinon.

## 2 · Ce que tu vis aujourd'hui

Tu cliques « Évaluer » dans le profil : l'application t'emmène dans Évaluation › Annoter et
évaluer, et **rien n'est choisi** — ni l'élève, ni la production. Tu refais tout à la main.
Aucun message ne le dit. Cause mesurée : trois fonctions portent le même nom ; celle qui répond
remplit des listes cachées qui sont vides tant qu'aucune copie n'est ouverte.

## 3 · Ce que tu verras après — trois cas

| La production de l'élève… | Tu arrives sur… |
|---|---|
| a une copie importée **et annotée** | la copie ouverte, en mode **Évaluer** (les palettes Paramètres, Évaluation, Rétroaction) |
| a une copie importée **pas encore annotée** | la copie ouverte, en mode **Évaluer** aussi — « Annoter » reste à un clic (question 1, **tranchée A par Grégoire, 15 h 45**) |
| n'a **aucune copie** (non remise, remise sur papier, évaluée hors application) | le **formulaire sans copie**, élève et production choisis, avec les outils du § 4 |

Le même comportement vaut pour « Évaluer » dans la liste des évaluations (qui t'envoyait
jusqu'ici vers « Importer » quand il n'y avait pas de copie — c'est ta réponse de 15 h 20).

## 4 · Les outils, sans copie

| Outil | Sans copie | Aujourd'hui (formulaire sans copie) |
|---|---|---|
| Nom de l'élève et de la production en tête | ✅ | ❌ affiche « — » |
| Grille, échelle, cartouche, intégrité, jetons | ✅ | ✅ |
| Critères et niveaux | ✅ | ✅ |
| Nombre d'erreurs, saisi à la main | ✅ | ✅ (si la grille a ce critère) |
| Rétroaction : vues Générale / Spécifique / Bilan | ✅ | ❌ |
| Rétroaction : « Copier tout », « Copier » | ✅ | ❌ |
| Cadenas (verrouiller l'évaluation) | ✅ | à mesurer |
| Enregistrer | ✅ | ✅ |
| Tampons, codes posés sur la copie, compteurs automatiques | ❌ **par nature** : ils s'appliquent à une copie | ❌ |

**Effet de bord voulu** : « Consulter » une évaluation sans copie passe par le même formulaire
— il gagne les mêmes outils.

**Mise en page** : le formulaire sans copie reste en colonne (pas de palettes flottantes sur
une page vide). Les outils manquants sont posés par **la même fonction** que celle qui équipe
les palettes, extraite pour servir les deux — pas une seconde copie du code.

## 5 · Les lots

| Lot | Contenu | Se vérifie par |
|---|---|---|
| 1 | Une seule fonction « Évaluer » ; les deux autres retirées | le contrôle qui interdit deux définitions (sa liste passe de 6 à 5) |
| 2 | Le cas **avec copie** | un contrôle au navigateur : la bonne copie s'ouvre, le mode demandé suit |
| 3 | Le formulaire **sans copie** équipé (§ 4) | un contrôle au navigateur sur le pack démo : nom affiché, élève et production choisis, vues et boutons présents |
| 4 | Chaque contrôle cassé exprès (il doit rougir), puis remis | le compte des rouges |
| 5 | Livraison `minor` (1.142.0), relecture croisée de Cowork, verdict Playwright, push | le rituel habituel |
| 6 | Porte terrain : l'arrivée **avec une vraie copie** (aucun banc n'a de copie) ; Safari, iPad | toi, deux ou trois rangées |

## 6 · Hors de ce plan

- **#871** (pourcentage et fraction qui se contredisent) : attend toujours ta décision.
- Une boucle sans fin dans le choix du cours du Cadre, déclenchée par mon montage de test
  (cours introuvable) : jamais vécue, notée au relais seulement.
- Ta proposition d'ajouter une copie au pack démo : utile pour les portes et les
  démonstrations, pas nécessaire ici. À reprendre à part si tu le veux.

## 7 · Durée

⚠ Les heures de ce plan étaient estimées sans horloge, et fausses : il a été écrit vers
15 h 15, pas 15 h 40. **Mesuré** (`TZ=America/Toronto date`) : lots 1 à 4 terminés à 15 h 40.
Lot 5 : une demi-heure (dont dix minutes de Playwright, Cowork fermé). **Coupure possible
proprement après le lot 4** : tout est commité, rien n'est poussé, la livraison se fait demain
matin.

## 9 · Avancement

- Lots 1 à 4 : **faits** (détail et « vérifié comment » : fiche #868 du BACKLOG).
- Lots 5 et 6 : à faire.
- Statut de remise sans copie : **tranché par Grégoire** — « remis mais non importé », soit
  « Reçu », statut existant ; les critères s'ouvrent. Fait et vérifié (mutation M10).

## 8 · La question qui te revient

**Question 1** — copie importée mais **pas encore annotée** : « Évaluer » l'ouvre…
- **A.** en mode **Évaluer** directement (tu as demandé à évaluer ; « Annoter » reste à un clic) ;
- **B.** en mode **Annoter** d'abord (ce que fait la liste aujourd'hui : importer → annoter → évaluer).
