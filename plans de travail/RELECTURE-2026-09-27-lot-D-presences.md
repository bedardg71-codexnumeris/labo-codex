# Relecture croisée – lot D de l'enregistrement (branche `lot-d-presences`, `709993d5`)

> Écrite le 27 septembre 2026, à 11 h 07 (Toronto), par Cowork. Demande lue : `plans de travail/DEMANDE-RELECTURE-2026-09-27-lot-D-presences.md`. Lu au code : `construireDatesSaisiesGroupe` (`indices.js`) et ses deux lecteurs neufs dans `saisie-presences.js` (vers les l. 979 et 1541).

## Verdict : **verte pour ce qui est codé** – une trouvaille remonte à Grégoire avant la fusion

- **Vitest, par exécution**, sur un clone de `709993d5` : 644 fichiers, **7 493 / 7 493**. Le banc WebKit n'est pas à ma portée : lu, pas exécuté.
- Onze mutations rouges, dont les cinq de la consigne et les deux de D2 bis : je n'en ajoute pas. La règle « saisie » lue par l'écran **est** celle de l'assiduité (exportée, pas recopiée) : c'est le bon choix, l'écran ne peut plus dire autre chose que le calcul.
- Tes décisions prises seul (« Tous les groupes » avec un seul sous-groupe saisi ; la validation au témoin ; une date par ligne ; le verrou sans validation) : justes.
- « Réinitialiser » sur une séance **non** saisie écrit désormais tout le monde absent sans question : acceptable, c'est un geste voulu et « Tous présents » le défait (rien n'est effacé).

## La trouvaille 1 ne peut pas attendre : le lot la rend active

`construireDatesSaisiesGroupe` compte **toute** fiche, facultative comprise. Une présence RàI (`facultatif`) notée à la date d'un cours rend la séance « saisie » pour tout le sous-groupe ; les autres élèves y comptent absents. C'est déjà vrai dans le calcul d'aujourd'hui (des absences inventées), mais le lot en fait **un piège à l'écran** : la séance s'ouvre sur « Séance saisie », sans « Confirmer la séance », et chaque autre élève porte « Non saisi·e : compté·e absent·e ». D2 bis (b) interdit de les écrire sans toucher leur ligne : l'enseignant·e devrait toucher trente lignes une à une.

**Recommandation de Cowork** : corriger dans ce lot. Une fiche `facultatif` ne rend pas une séance « saisie » (une présence RàI n'est pas l'appel du cours). Une ligne dans `construireDatesSaisiesGroupe`, lue par l'assiduité et par l'écran. **Effet sur les données de Grégoire, à la lecture, sans écriture** : les élèves d'un sous-groupe dont la seule fiche à une date de cours est une présence RàI passent d'« absent·e » à « en attente » pour cette séance ; leur indice A peut monter. C'est une correction de ses données réelles : **la décision est à lui.**

Si Grégoire dit oui : essai (fiche RàI seule à une date de cours → la séance n'est pas saisie, l'écran dit « Séance non saisie », l'assiduité la dit en attente ; une fiche RàI **et** une fiche ordinaire → saisie) ; mutation (la condition `facultatif` retirée → rouge) ; la ligne « Stock » de la demande dit l'effet sur l'indice A. Pas de nouvelle relecture si la mutation est rouge.
Si Grégoire dit non : inscrire la trouvaille au BACKLOG avec ce texte, et fusionner tel quel.

## Tes deux autres trouvailles

- Le tableau des présences qui déborde à 360 px : hors du parcours de Grégoire (Mac, iPad) ; commenter, sans fiche.
- La fenêtre d'aide « Saisir les présences efficacement » qui liste « Justifié » et « Retard » : ce sont des mots que les collègues lisent et qui décrivent un écran qui n'existe pas. **À corriger au lot F (les mots)**, que je complète ; sans fiche.

## RELAIS

Pas de push de relais : Cowork a relu dans la même session ; la fusion attend seulement la réponse de Grégoire sur la trouvaille 1 et ses mots.

## Réponse de Grégoire – 11 h 07

**« Corriger dans ce lot »** (option recommandée par Cowork). Une fiche `facultatif` ne rend plus une séance « saisie ». Appliquer le § « La trouvaille 1 » ci-dessus : essai, mutation, ligne « Stock ».
