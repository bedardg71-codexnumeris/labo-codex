# Demande de relecture – lot 21 : le premier contact sans fenêtre qui bloque

> Claude Code, 12 octobre 2026, 7 h 49 (mesuré par `date`). Consigne : `CONSIGNE-DU-JOUR.md`, série des lots 20 à 23.
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright**. Vitest complet vert (748 fichiers, 8 734 essais).

## 1 · Ce qui change pour l'usager

Sur le parcours de la première chronique (créer un trimestre, créer un groupe-cours, prendre les présences), les messages ne bloquent plus l'écran : ils arrivent en notification, en haut à droite, avec les mêmes mots. Un seul passe par une fenêtre de l'application : le refus de supprimer un cours qui porte encore des données (il énumère ce qui s'y rattache, une ligne par élément).

## 2 · Fiche par fiche

| Fiche | Commit | Remesure sur main | Geste |
|---|---|---|---|
| #678 (parcours 1) | `a4473f19` | 40 `alert()` dans les huit fichiers du parcours (la fiche en comptait 53 au 1er sept., la consigne 46) ; 23 atteints par un geste | les 23 convertis : `cours.js` ×16, `trimestre-v2-init.js` ×3, `trimestre-v2-horaires.js` ×1, `trimestre-v2-etudiants.js` ×3 ; les 17 restants nommés au banc |

Vérifications : banc `sentinelle-678-premier-contact-sans-alert` (11 essais), 3 mutations, 3 rouges (`cours.js` d'avant → le décompte et les deux essais de comportement ; `trimestre-v2-init.js` d'avant ; un appelant fabriqué pour `confirmerSeanceV2`). Banc #449 réancré : le refus se lit dans la fenêtre d'information, et `alert` lève désormais dans ce banc. Les specs Playwright du parcours (`portes-relais-cadre`, `import-nomme-le-cours-887`, `lot-f-gestes-hors-temoin`) acceptent ou ferment les dialogues sans en attendre ; aucune n'attend ces mots. Non relancées.

### Les 17 alertes restantes, et pourquoi

| Fichier | Fonctions | Raison |
|---|---|---|
| `trimestre-v2-liste.js` ×7 | `confirmerArchivage`, `confirmerDesarchivage`, `archiverTrimestreActif` | moratoire de l'archivage (#622), comme au lot 17 |
| `trimestre-v2-cours.js` ×5 | `modifierCoursSelectionneV2`, `dupliquerCoursSelectionneV2` ; `supprimerCoursV2` | aucun déclencheur (remesuré) ; garde de repli, ne parle que si `cours.js` manque |
| `trimestre-v2-horaires.js` ×3 | `confirmerSeanceV2` | aucun appelant ; son bouton `v2-btnConfirmerSeance` n'existe pas dans `index.html` |
| `trimestre-v2-etudiants.js` ×1 | `sauvegarderGroupeEtudiantsV2` | aucun appelant |
| `trimestre-v2-groupes-cours.js` ×1 | `ouvrirAideGroupeCours` | aucun appelant |

## 3 · Mots d'écran

Aucun mot neuf : chaque message garde ses mots. Trois mises en forme changent, à citer :

1. Import de cours (`cours.js`) : « Import terminé » en titre, puis « ✓ N cours ajoutés • N doublon(s) ignoré(s) » sur une ligne (avant : trois lignes dans la fenêtre native).
2. Cours partagé : « Cours partagé avec succès ! » en titre, la phrase « Il est maintenant disponible… » en détail.
3. Refus de supprimer un cours : « Impossible de supprimer « … ». » devient le titre de la fenêtre ; le reste, ligne pour ligne, dans le corps.

Gardés tels quels, à signaler : le vouvoiement de « Veuillez coller des données à importer. » et la phrase du refus « dis-le-moi en session s'il s'agit de données de test à nettoyer », qui s'adresse à une session de développement, pas à un usager.

## 4 · La mesure du reste (parcours 2 et 3)

`alert()` hors commentaires, mesurés à 7 h 49, sans instruction de l'atteignabilité : **parcours 2** (grilles, échelles, cartouches) `cartouches.js` 44, `grilles.js` 32, `echelles.js` 27, soit 103 ; **parcours 3** (importer des productions) `travaux-ui.js` 16, `productions-import-export.js` 7, `travaux-import.js` 4, `productions.js` 3, `productions-liste.js` 2, soit 32. La fiche #678 reste ouverte pour ces deux parcours ; à instruire parcours par parcours, en commençant par le 2.

## 5 · Trouvailles, avec leur issue

- **Trois fonctions sans appelant** : `confirmerSeanceV2` (et le bouton absent qu'elle lit), `sauvegarderGroupeEtudiantsV2`, `ouvrirAideGroupeCours` ; plus `modifierCoursSelectionneV2` et `dupliquerCoursSelectionneV2` (seul appelant : la spec `ponderation-requise-540`). Issue 2, inscrire : du code mort, hors de la liste du lot 22.

## 6 · Ce que j'ai supposé – une ligne chacune

- Le type de chaque notification : succès pour un geste réussi, erreur pour « introuvable » et les échecs, avertissement pour un champ manquant, information pour « aucun… à … ».
- Une fonction appelée par un bouton généré mais dont l'alerte ne parle que sur une donnée absente (« Séance non trouvée. », « Journée introuvable ») est atteinte : convertie.

## 7 · Documents à mettre à jour

Aucun, mesuré : aucun de ces messages n'est cité dans `docs/`.

## 8 · Item de Nouvelles proposé

« Créer un trimestre et un groupe-cours ne t'interrompt plus par des fenêtres qui bloquent l'écran : les messages arrivent en notification. »
