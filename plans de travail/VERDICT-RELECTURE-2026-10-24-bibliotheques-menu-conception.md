# Verdict de relecture – les bibliothèques de la Conception en menu déroulant (lot 1, #1147)

> Cowork, samedi 24 octobre 2026, 13 h 35 (Toronto). Relu : `DEMANDE-RELECTURE-2026-10-24-bibliotheques-menu-conception.md`, `e3f42ec4` (statistiques, `js/menu-selection.js` en entier, les appels `MenuSelection.marquer`, l'essai `bibliotheques-menu-1147.spec.js` sur la valeur du menu après un choix, les sous-titres des bibliothèques), captures Grilles à 1440 et 820 px.

## Verdict : **accepté, avec une retouche** (§ 2)

Le lot livre ce que la consigne demandait, et la rangée correspond à la maquette validée par Grégoire (version « Menu déroulant »). Le composant est sobre : noms et identifiants échappés, `data-on-change`, aucun gestionnaire en ligne ; le recalage après un refus d'ouverture est éprouvé (break-test C.b). L'essai vérifie la valeur du menu après chaque choix, pour les cinq écrans (l. 98 et 105 de la spec) : un écran qui oublierait `marquer` rougirait.

## 1. Les écarts à la consigne : tous acceptés

| Écart | Décision de Cowork |
|---|---|
| Le tri des productions est gardé, et réparé | **Accepté. La consigne avait tort** : elle retirait un geste dont Grégoire se sert (#930). Le réparer touchait le parcours livré : issue 1, à bon droit. |
| « (à planifier) » après une production sans échéance ; « Diagnostique » quitte le menu | **Accepté.** Sans échéance, la production sort du calendrier et des indices : c'est un état, la règle s'applique. « Diagnostique » est une caractéristique ; la Liste des évaluations la garde. |
| Artefacts à plat | Accepté (la barre ne les groupait pas). |
| Pratiques sans « Fermer » ; l'assistant ne rouvre pas la pratique créée | Accepté tel quel. Rien au backlog : aucun symptôme vécu. |
| La palette du critère algorithmique colle dès 1 025 px | **Accepté.** Mesuré (−622 px de défilement hors écran à 1 180 px) ; le seuil d'origine protégeait des sous-navigations qui vivent sous 1 024 px. |
| « Barre latérale » devient « ta sélection » dans les textes de la bibliothèque | Accepté, sauf le défaut du § 2, introduit par ce remplacement. |

## 2. La retouche due avant le push

Cinq sous-titres de la fenêtre de la bibliothèque mêlent maintenant le vouvoiement et le tutoiement dans la même phrase : « **Gérez** les grilles de critères offertes dans **ta** sélection. » Le « Gérez » datait d'avant ; le « ta » vient de ce lot, donc la phrase est du lot (« est-ce que je viens de l'écrire ? »).

Sites : `js/grilles.js` l. ~2354, `js/echelles.js` ~1157, `js/cartouches.js` ~3875, `js/pratiques-gestion.js` ~452, `js/productions-bibliotheque-ui.js` ~253.

Mots (Cowork ; texte d'enseignant, pas d'élève) : **« Gère les grilles de critères de ta sélection. »**, et de même : « Gère les échelles de performance de ta sélection. », « Gère les cartouches de rétroaction de ta sélection. », « Gère les pratiques de notation de ta sélection. », « Gère les productions de ta sélection. » Un `grep` de « Gérez » et des autres impératifs au vouvoiement dans les textes que ce lot a touchés ; un essai qui lit les cinq sous-titres.

## 3. Pour la suite du plan

- **La Carte d'alignement** diffère (pas de bande bleu pâle, menu de hauteur native sur le Mac, « Actions ▾ » au lieu de « + Nouvelle … ») : ajouté au plan, à aligner au lot 2, l'apparence seulement.
- Le composant `MenuSelection` est celui que le lot 2 (le Cadre) réemploiera : la consigne du lot 2 le nommera.
- Trouvaille `afficherListePratiquesSidebar` (code mort antérieur) : commenter et oublier, d'accord.

## 4. Portes terrain

D'accord : aucune porte due (de l'affichage, aucune donnée). Rien à publier. Le sélecteur natif de l'iPad réel se verra à l'usage.

## 5. Avant le push (au signal de Grégoire)

La retouche du § 2 ; le verdict Playwright complet ; `RELAIS.md`, qui date du 23 oct. ; puis `scripts/pousser.sh`.
