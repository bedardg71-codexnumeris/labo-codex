# Consigne du jour – un élève supprimé ne revient plus par un ancien fichier (#1012, la décision de Grégoire)

> Écrite par Cowork le 2 octobre 2026 à 11 h 28, sous le nom `CONSIGNE-SUIVANTE-2026-10-02-1012-eleve-desinscrit.md` (jamais commitée sous ce nom) ; **ouverte à 12 h 30** (Toronto), 1.174.3 étant en ligne et fusionnée (`main` = `503d4fd2`). Remplace la consigne de mise en ligne de 11 h 22, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-02-1012-release-1.174.3.md`. Commite d'abord, tels quels, les fichiers de Cowork qui traînent dans l'arbre. C'est un lot du chantier du codex.

## La décision de Grégoire (« ok », vers 11 h 26)

Ses mots, vers 11 h 24 : quand il supprime un élève, c'est qu'il est **désinscrit** (démarche officielle auprès de la direction des études, abandon avant la mention d'échec) ; retiré de la liste officielle, ses travaux, ses notes et ses annotations disparaissent avec son dossier.

**Précisé par Grégoire, vers 11 h 31** : supprimer, c'est retirer le nom de l'élève dans le Cadre ; il n'apparaît plus dans le groupe-cours. **Une désinscription n'est pas un décrochage** : le décrochage (l'élève ne vient plus au cours) est un statut, l'élève reste dans la liste. Donc **seul « Supprimer » écrit la trace** ; « Décrochage », « Inactivité », « Réactiver » et tout changement de groupe-cours ne l'écrivent jamais. Un témoin du banc le tient : un élève en décrochage dans l'espace, l'ancien fichier qui le porte, sa fiche de l'espace reste telle quelle (l'espace l'emporte) et aucune trace n'est écrite.

La règle qu'il a acceptée, proposée par Cowork (sa limite du 20 septembre exclut d'effacer le dossier pour de bon) : **quand il supprime un élève, l'application garde une trace de son DA. Un ancien fichier ne ramène plus rien de lui** : ni sa fiche, ni ses copies, ni ses notes, ni ses présences, ni ses annotations. Ce qui reste de lui dans l'application n'est pas effacé. La trace ne vaut que pour les suppressions faites après ce lot ; avant, rien ne la garde.

## Ce que Cowork a lu (à remesurer)

- Deux gestes suppriment : `supprimerEtudiantV2` (`js/trimestre-v2-etudiants.js`, l. 1020, par `modifierEtAnnoncer`) et `supprimerEtudiant` (`js/groupe.js`, l. 924, un `filter`). Les deux ne retirent que la fiche ; copies, évaluations, présences et annotations restent, sans fiche. Dis si `groupe.js` a encore un bouton ; s'il n'en a pas, il n'écrit pas la trace, et tu l'inscris (issue 2).
- L'import par cases fusionne depuis 1.174.3 (`fusionnerDonneesPersoImportees`, `fusionnerCopiesImportees`).

## Ce que tu fais, sur une branche

1. **La trace** : une clé namespacée par trimestre (nom à toi, inscrite dans `docs/DATA-OWNERSHIP.md`), une liste de `{ da, date }`, écrite par le geste qui supprime, dans la même écriture que le retrait de la fiche si le mécanisme le permet. Elle voyage dans le codex et dans l'export comme les autres clés du trimestre.
2. **L'import par cases l'applique** aux cinq familles : une entrée du fichier dont le DA est dans la trace n'entre pas (élève, copie par `etudiantDA`, évaluation, présence, annotation : pour l'annotation, par la copie qu'elle annote, si l'annotation ne porte pas de DA). Une copie écartée ne dépose pas son fichier au magasin.
3. **Aucun mot neuf à l'écran** sans Grégoire. Si le bilan doit dire « N élève(s) désinscrit(s) écarté(s) », propose les mots dans ta demande ; ne les pose pas.
4. **Regarde autour, sans corriger** : où ce qui reste d'un élève supprimé apparaît encore (Liste des évaluations, Suivi, exports, calcul d'une moyenne de groupe, codex). Lu ou mesuré, inscrit (issue 2). Ce que Grégoire attend, c'est que cela « disparaisse avec son dossier » : ce relevé dira l'écart.
5. **Ouvrir un codex entier** restaure un état complet, trace comprise ; un codex écrit avant la suppression ramène l'élève, parce qu'il ramène tout ce jour-là. C'est voulu (une restauration est un retour en arrière délibéré) : dis-le dans ta demande, n'y touche pas.
6. **La preuve** : un banc par le geste (supprimer un élève, ouvrir un ancien `.zip` qui le porte avec copie, évaluation, présence et annotation, tout coché : rien de lui n'entre ; un autre élève du même fichier entre), des témoins (sans suppression, il entre comme avant ; la trace survit à un rechargement et à « Mettre à jour le codex »), des mutations rouges, Vitest complet.
7. **Arrête-toi à la demande de relecture** : `plans de travail/DEMANDE-RELECTURE-2026-10-02-1012-eleve-desinscrit.md`, avec une proposition de ligne pour les Nouvelles. Ce chemin écrit les données de l'usager : relecture croisée.

## Ce que tu rends

À Grégoire, trois lignes en gestes : ce qui est codé ; où un élève supprimé apparaît encore ; ce qui l'attend. Ce que tu as supposé, en une ligne.
