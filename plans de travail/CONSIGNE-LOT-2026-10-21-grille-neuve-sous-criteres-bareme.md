# Consigne – Une grille neuve se construit entière dans l'application : sous-critères et barème dès la création, le barème sous les sous-critères (#1120)

> Écrite par Cowork le mercredi 21 octobre 2026 à 8 h 06 (Toronto, mesuré par `date`), sur `main` à `c4b4b41f` (1.212.0, en ligne depuis le 20 à 21 h 33). Plan : `PLAN-2026-10-19-bareme.md`. Retour de Grégoire (symptôme vécu, deux captures, 7 h 56 et 8 h 05) : passe avant le reste.

## Le symptôme, dans ses mots

« Si je crée une grille neuve, aucun de ces boutons n'existe. Ce serait un peu absurde d'avoir besoin de Word pour les créer... » Dans Grilles de critères, une grille **en création** (« Créer la grille » au pied) n'offre ni « + Ajouter un sous-critère » ni la section « Barème » et son « + Ajouter une tranche », même pour un critère analytique. Elles n'apparaissent que sur une grille enregistrée, ou venue d'« Apporter mon matériel ».

Et : « le barème devrait être disposé sous les sous-critères plutôt qu'au-dessus ». Cowork est d'accord : la grille d'un enseignant se lit critère → ce qu'on observe → ce que ça vaut, et c'est l'ordre du PDF (les éléments observables sous le nom du critère, le barème ensuite).

## La cause, mesurée au code par Cowork (à remesurer)

- `rendreAttenduCritere` (`js/grilles.js`, vers la l. 4519) ne rend le barème et les sous-critères qu'avec un contexte de handlers (`ctx`), fourni seulement par le rendu d'une grille enregistrée (l. 5266). Le rendu des critères en création (`afficherCriteresTemp`, l. 3464, sur `window.tempCriteres`) n'en fournit pas.
- Les deux éditeurs écrivent aussitôt dans une grille enregistrée (`_modifierBaremeCritere`, ajout de sous-critère). Or rien ne s'écrit avant « Créer la grille » (décision de Grégoire, lot E1 : la question à « Fermer » en création).
- Le précédent existe : les gestes de collection d'un critère algorithmique ont déjà deux cibles, `temp` (en création) et une grille enregistrée (`_critereCibleCollection`, `_redessinerCibleCollection`, l. 4178-4190).

## Ce qu'il faut

1. **En création, les mêmes sections qu'en modification**, pour un critère holistique ou analytique : « Sous-critères » et « + Ajouter un sous-critère » ; pour un critère analytique, « Barème » et « + Ajouter une tranche ». Mêmes textes, mêmes bulles, mêmes refus, même disposition. Ils agissent sur `window.tempCriteres` et s'écrivent avec la grille, à « Créer la grille », comme le reste. **Aucune écriture avant** (décision E1) ; « Fermer » sans créer pose la même question qu'aujourd'hui et n'écrit rien.
2. **Une seule implémentation pour les deux cibles**, sur le modèle de `_critereCibleCollection` : pas un second éditeur de barème ni de sous-critères à côté du premier (zéro-dette).
3. **Le barème sous les sous-critères**, en création comme en modification.
4. Changer le type d'un critère en création (analytique ↔ holistique) fait ce que fait le même geste sur une grille enregistrée : mesure-le et aligne-toi dessus, sans inventer de règle.
5. Les sous-critères d'un critère **algorithmique** (« se définissent une fois la grille enregistrée ») : hors de ce lot. **Inscrire et continuer**, avec son numéro dans la demande.
6. Inscris ce retour au BACKLOG (une fiche, liée à #1120) et dans `Retours des testeurs/SUIVI-BUGS.md` (lecture ciblée), dans le même commit.

## Les bancs

- **WebKit** : « + Nouvelle grille », un nom, un critère analytique ; deux sous-critères et trois tranches ajoutés avant « Créer la grille » → rien en base avant ; après « Créer la grille », la grille enregistrée les porte, dans l'ordre, et la page rechargée les garde. « Fermer » sans créer → rien en base. Le barème est sous les sous-critères, en création et en modification. Mac et iPad (1 024 px), séparément.
- **Vitest** : ce qui s'écrit à la création (sous-critères, barème) ; un critère holistique ne porte pas de barème.
- **Break-test** : en création, le barème remis absent → rouge ; l'ordre remis (barème au-dessus) → rouge. Code restauré.
- Vitest complet vert ; les specs de Grilles de critères et du barème touchées vertes en WebKit. Le verdict complet tourne ce soir, au signal de Grégoire.

## Ce qu'il ne faut pas

- Écrire une grille avant « Créer la grille ».
- Toucher le calcul (invariant 1 du plan), la dissection, le PDF.
- Le verdict complet, un numéro de version, le push.

## Livrer

Un commit sur `main`, non poussé, avec : cette consigne, le correctif, les bancs, les deux inscriptions, et la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-21-grille-neuve-sous-criteres-bareme.md` (avec deux captures, création et modification, Mac). Ajoute aussi les deux fichiers de Cowork restés hors suivi, `DEMANDE-RELECTURE-2026-10-20-version-1.212.0.md` (le tien) et `VERDICT-RELECTURE-2026-10-20-version-1.212.0.md`. Par leur chemin, jamais `git add -A`. Lance `/fin-de-session` avant le commit, sans le verdict complet. **Puis arrête-toi.**

## Complément de 8 h 11 – guider l'ordre de création (décision de Grégoire, 8 h 11)

Grégoire : « ces éléments ne peuvent pas être créés dans n'importe quel ordre pour être fonctionnels […] Il faudrait le faire comprendre à l'utilisateur dans la logique de création. » Mesuré par Cowork : la seule dépendance réelle, ce sont les points du critère, maximum de ses tranches (`bareme.js`, l. 263) ; à 0, défaut d'un critère neuf, les points de toute tranche sont refusés, et l'utilisateur ne l'apprend qu'au refus.

7. **Tant que la pondération d'un critère analytique est à 0**, une phrase sous le titre « Barème », en création comme en modification, mot pour mot (texte validé par Grégoire à 8 h 11) :
   « Donne d'abord ses points à ce critère : ceux de ses tranches iront de 0 à ce nombre. »
   Elle ne bloque rien : « + Ajouter une tranche », le nom et le texte restent permis. Elle disparaît dès que la pondération dépasse 0, sans recharger. Pas le style d'une alerte ni d'une erreur (skill `design-interface`) : une aide en ligne, comme « à compléter ».
8. **Bancs** : la phrase présente à 0, absente à 5, en création et en modification ; break-test (phrase toujours absente → rouge).
