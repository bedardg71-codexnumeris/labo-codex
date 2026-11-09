Reçue le 9 nov. 2026 pendant le verdict de la 1.238.1 (relais de Cowork, texte tel quel). File : reprise → CE LOT → « Mettre ta classe en place ».

Pour Claude Code, à relayer (à la session principale, celle du lot de la reprise)

À INSÉRER DANS TA FILE : juste après le lot de la reprise, AVANT « Mettre ta classe en place ». Lot « Exporter pour Léa n'envoie que les évaluations verrouillées ». Décidé avec Grégoire le 9 nov. 2026, 10 h 00, en Cowork. Il touche ce qui part chez ses élèves. Écris cette consigne dans `plans de travail/CONSIGNE-LOT-2026-11-09-export-lea-verrouillees.md` et commite-la avec le lot. Branche `lot/export-lea-verrouillees`, partie de `origin/main` à jour.

LE CONSTAT (mesuré par la session cloud H, `RAPPORT-2026-11-09-verifications-parcours-3-a-5.md`, parcours 4, étape 8, recontrôlé dans le code) : « Exporter pour Léa » met dans le ZIP le PDF d'une évaluation non verrouillée (mesuré : DEMO006 non verrouillée, son PDF dans le ZIP). Le compteur dit « 3 PDF pour 3 étudiant·es, dont 1 sur papier (synthèse seule) », sans rien sur le verrou.

VALIDÉ PAR GRÉGOIRE :
1. L'export ne prend que les évaluations verrouillées, avec ou sans fichier (synthèse seule comprise). Une évaluation non verrouillée est laissée de côté.
2. Le compteur le dit. Texte validé, mot pour mot, accordé au nombre : « 3 PDF pour 3 étudiant·es · 1 évaluation non verrouillée laissée de côté » (au pluriel : « 2 évaluations non verrouillées laissées de côté »). La mention « dont N sur papier (synthèse seule) » reste là où elle est. Rien n'est ajouté quand tout est verrouillé.
3. Si aucune évaluation n'est verrouillée : c'est toi qui décides du comportement (bouton inactif, ou export refusé avec un message). Propose le texte dans ton rapport, ne le pose pas sans Grégoire ; d'ici là, garde le compteur validé.

LE STOCK : les ZIP déjà envoyés ne se rappellent pas. Dis s'il existe une trace des exports passés ; s'il n'y en a pas, écris « stock non mesurable ».

VÉRIFICATION : essai sur trois évaluations (verrouillée avec fichier, non verrouillée avec fichier, verrouillée sur papier) : deux PDF dans le ZIP, le compteur exact, au singulier et au pluriel ; break-test. Audite les autres chemins qui produisent les PDF des élèves (export par production, Dossier PDF à l'unité) et dis lesquels filtrent sur le verrou ; ne change que l'export Léa dans ce lot, inscris le reste. Vitest depuis `tests/`, relecture par un agent neuf.

LIVRAISON : release patch après verdict WebKit, push, fusion vers main. Propose la ligne des Nouvelles à Grégoire, ne la pose pas sans son accord.

---

## Ce que Claude Code a tranché (9 nov. 2026)

| Question | Décision |
|---|---|
| Où | Une seule règle : `selectionnerEvaluationsLea` (`js/travaux-archivage.js`), que l'export ET le compteur lisent (#566). Elle rend en plus `nonVerrouillees`. |
| L'ordre | Une évaluation par élève d'abord (la reprise l'emporte), le verrou ensuite. **Supposé** : une reprise non verrouillée (réévaluation en cours) laisse l'élève de côté ; son originale ne part pas à sa place. |
| « Reprises seulement » | Le compteur garde le mot validé : « évaluation(s) non verrouillée(s) laissée(s) de côté », même quand la case « Reprises seulement » est cochée. |
| Un seul élève choisi | La même mention s'ajoute à la phrase d'un élève (« Aucune évaluation · 1 évaluation non verrouillée laissée de côté »). |
| Aucune verrouillée (point 3) | **Export refusé**, par le chemin qui existe déjà : `exporterPourLea` lève « Aucune évaluation trouvée pour ces critères. » et l'écran affiche « L'export Léa a échoué : Aucune évaluation trouvée pour ces critères. ». Le compteur, d'ici là : « Aucune évaluation trouvée · N évaluation(s) non verrouillée(s) laissée(s) de côté ». **Texte proposé, non posé** (à la place des deux) : « Aucune évaluation verrouillée : rien à envoyer. Verrouille les évaluations à remettre, puis relance l'export. » |
| Le compteur découpé | `mettreAJourCompteurLea` dépassait le seuil de complexité (cliquet) : ses phrases passent dans `_texteCompteurLea` et `_laisseesDeCoteLea`, sans changement de mots. |

## Les autres chemins qui produisent les PDF des élèves (audit, consigne)

| Chemin | Filtre sur le verrou ? |
|---|---|
| « Exporter pour Léa » (`exporterPourLea`) | **Oui, depuis ce lot.** |
| « Dossier PDF » de la Liste (`exporterDossierComplet`, `exporterSyntheseSeule`, `trouverEvaluationPourSynthese`) | **Non.** Offert sur toute ligne « évaluée », verrouillée ou non. **À inscrire.** |
| Aperçu et « Exporter » d'une copie dans la visionneuse (`previsualiserPDF`, `exporterPDF`, `exporterPDFDepuisApercu`) | **Non.** **À inscrire.** |
| Archives « Exporter les travaux » / par élève (`exporterTravaux`, `exporterParEtudiant`) | Non, mais ce n'est pas un PDF d'élève : l'archive de l'enseignant (copies, versions annotées, données). |

Les deux « à inscrire » sont dans le rapport du lot ; ils n'entrent pas au BACKLOG sans symptôme vécu (règle du 24 août) : c'est à Grégoire de dire s'il les veut.

## Le stock

**Stock non mesurable.** L'export pour Léa ne laisse aucune trace : ni marque sur la copie (la `dateExport` de `marquerExporte` n'est posée que par les archives), ni journal. Les ZIP déjà envoyés ne se retrouvent pas depuis l'application.

## Vérification

Spec WebKit `tests/integration/export-lea-verrouillees.spec.js` : trois évaluations (verrouillée avec copie, non verrouillée avec copie, verrouillée sur papier) → deux PDF dans le ZIP téléchargé, le compteur au singulier ; une quatrième non verrouillée → le pluriel ; tout verrouillé → rien d'ajouté, trois PDF. Banc Vitest #1245, cas 6 (les phrases). Break-tests : sans le filtre, la spec rougit ; sans la mention, le cas 6 rougit. Les bancs de l'export qui exportaient des évaluations sans verrou (#565, #566, #950, #1245, « Un mot pour ton étudiant·e ») les verrouillent désormais.
