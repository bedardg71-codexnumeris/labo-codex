# Rapport : lot « Le graphique suit les présences » (8 nov. 2026)

Consigne de Grégoire, relayée par Cowork le 8 nov. 2026 au matin. Branche `lot/graphique-suit-les-presences`, partie de
`main` = `cafc89ff2` (1.236.0 en ligne ; la chaîne des quatre lots était close à 7 h 32). Non fusionnée, non publiée,
rien au changelog. Écrit par Claude Code (session dans le nuage, reliée au Mac de Grégoire). Captures :
`Claude outputs/captures-2026-11-08-graphique-suit-les-presences/` (Chromium, 1366 px).

## 1. Ce qui change pour toi

- Enregistrer les présences d'une séance la fait paraître au graphique du Suivi du groupe, sans recharger
  l'application ni passer par Réglages.
- Corriger les présences d'une séance passée refait sa capture et celles des séances suivantes (l'assiduité est
  cumulative). Les captures d'avant ne bougent pas.
- Un groupe vu deux fois dans la semaine : chaque séance enregistrée a sa capture, donc son point.
- Aucune capture pour une date future.

## 2. Le constat de Cowork, mesuré

Les quatre points tiennent, lus dans `cafc89ff2` :
- le graphique (`creerGraphiqueGroupeSpaghettiACP`, `graphiques-progression.js`) ne lit que `obtenirSnapshotsHebdomadaires()` ;
- une capture est identifiée par sa séance (`SEANCE-<date>`), et une recapture de la même date remplace l'ancienne (#116-B) ;
- la seule capture automatique part de `initialiserModuleSnapshots` (`main.js`, à l'ouverture) → `verifierEtCapturerSnapshotHebdomadaire`,
  qui s'arrête dès qu'une capture de la semaine courante existe ;
- `ecrirePresencesSeance` (`saisie-presences.js`), l'écrivain unique des présences de l'écran, ne capturait rien.

## 3. Ce qui est fait

- **`recapturerDepuisSeance(D)`** (`snapshots.js`) : recapture D, puis chacune des séances déjà capturées après D, dans
  l'ordre, les évaluations lues une fois pour la chaîne. Les appels passent dans une file : deux enregistrements
  rapprochés ne se recalculent pas en même temps.
- **Une garde du groupe-cours.** Une capture se calcule sur le groupe-cours actif (ses élèves, ses travaux, sa clé). Si
  tu changes de groupe-cours avant ou pendant la chaîne, elle s'arrête plutôt que d'écrire les séances de l'un chez
  l'autre (le défaut que #116-A avait réparé pour la vérification à l'ouverture). La séance manquante se rattrape à la
  saisie suivante ou par « Recalculer les captures ».
- **`ecrirePresencesSeance`** l'appelle après chaque écriture réussie (geste, « Tous présents », « Confirmer la séance »,
  verrou, « Réinitialiser » : tous passent par lui). Le Suivi du groupe, s'il est affiché, se redessine **après** les
  captures ; avant, il se redessinait 0,3 s après l'écriture, sur les anciennes captures.
- **Une séance saisie en retard prend sa place** dans la liste des captures (avant : ajoutée à la fin). Les lecteurs
  trient par semaine seulement : sans cela, un jeudi saisi avant le mardi de la même semaine paraissait avant lui.

## 4. Ce que j'ai décidé seul (à corriger en dix secondes si c'est faux)

- **La vérification à l'ouverture reste.** Elle est la seule capture automatique d'un groupe dont on saisit les
  évaluations sans prendre les présences dans l'application : la retirer laisserait ce graphique vide jusqu'au lot des
  évaluations (#1242). Elle ne gêne pas la règle : elle capture les séances passées de la semaine si aucune ne l'est,
  et une saisie refait ensuite la sienne.
- **Le stock n'est pas recalculé.** Les séances enregistrées avant ce lot et jamais capturées restent absentes du
  graphique jusqu'à « Recalculer les captures » (Réglages › Données), qui reste là. Rien n'est réécrit d'office chez les gens.
- **Les présences d'une intervention RàI ne déclenchent pas de capture.** Elles n'entrent dans l'assiduité qu'à une
  séance du cours déjà saisie, où l'élève a déjà sa fiche, et un doublon n'est pas ajouté (`ajouterPresencesIntervention`) :
  l'effet est nul en pratique. Commenté dans le code.
- **Deux textes de l'enseignant·e changent, parce qu'ils devenaient faux** (texte proposé, à corriger) :
  - le graphique vide : « Capturez des snapshots hebdomadaires. » devient « Saisis les présences d'une séance. »
    (le canevas vide fait 300 px : une phrase plus longue était coupée, constaté sur la capture) ;
  - l'Aide, carte « Captures de progression hebdomadaires » : « L'application capture les indices une fois par semaine :
    à l'ouverture, … » devient « L'application capture les indices à chaque séance dont tu enregistres les présences.
    Elle le fait aussi une fois par semaine, à l'ouverture : … » ; et « Si tu corriges des présences ou des évaluations
    passées, « Recalculer les captures » les refait toutes… » devient « Si tu corriges les présences d'une séance passée,
    sa capture et celles des séances suivantes sont refaites. Si tu corriges des évaluations passées, « Recalculer les
    captures » les refait toutes… ».

## 5. Inscrit au backlog

- **#1242** : enregistrer une évaluation change C et P sans recapturer (sur consigne). La question ouverte : quelle date D
  pour une évaluation (sa date, ou l'échéance effective de la production, qui décide déjà du C et du P historiques).
- **#1243**, trouvaille : le graphique se lit mal à une seule séance (un point par élève, collé à l'axe) et à deux
  séances par semaine (deux points « Sem. 2 », sans date). Déjà vrai après « Recalculer les captures » ; le lot le rend
  courant. Visible sur la capture « après ».

## 6. Vérifié comment

- **Le test qui échoue avant la correction** : `tests/unit/sentinelle-graphique-suit-les-presences.test.js`, sur les
  modules réels (`indices.js`, `saisie-presences.js`, `snapshots.js`, `modes.js`), par le geste et l'enregistrement
  automatique. S0, S1, puis deux saisies dans la même semaine (S3, S4), puis la correction de S1 : S1, S3 et S4 refaites,
  l'absence de Bruno (fictif) s'y lit (100, 100, 88 → 50, 67, 63) ; S0 intacte, horodatage compris ; S2, jamais saisie,
  sans capture. Plus : la séance saisie en retard à sa place, la date future, le changement de groupe-cours, le Suivi
  redessiné après la capture. Sur `cafc89ff2` : **7 rouges sur 7**. Après : 7 verts.
- **Break-tests** (chaque altération rend rouge au moins un essai, puis retirée) : seulement D sans les suivantes → 3 et 4 ;
  les captures d'avant D refaites aussi → 3, 4 et 5 ; ajout en fin de liste → 4 ; Suivi redessiné sans attendre → 6 ;
  aucun appel depuis l'écrivain → 7 sur 7 ; sans la garde du groupe-cours → 6.
- **Au navigateur** : `tests/integration/graphique-suit-les-presences.spec.js`, groupe neuf (trimestre, horaire mardi et
  jeudi, groupe-cours créés à l'écran), première saisie par le champ de l'écran, puis retour au Suivi du groupe : un point,
  huit courbes ; la deuxième séance de la semaine : deux points. Vert sous **Chromium** (le conteneur n'a pas WebKit) ;
  rouge quand l'appel est retiré.
- **Vitest entier** : 886 fichiers, 10 775 essais, tous verts (dans le conteneur, depuis `tests/`).
- **Specs voisines** (présences, témoin, parcours neuf, anonymisation, barres de l'Aperçu ; 8 fichiers, 45 essais),
  sous Chromium : 44 verts, 1 rouge, `lot-a-anonymisation-enregistre` (a)(c), une évaluation en anonymisation. **Sans lien
  avec le lot, mesuré** : il rougit aussi sur `cafc89ff2` (2 sur 10 sous Chromium), et sur la branche avec le seul
  `index.html` modifié (le texte de l'Aide). Intermittence propre à Chromium ; WebKit en jugera au verdict.
- **Durée** (démo : 10 élèves, 30 séances capturées ; Chromium du conteneur, indicatif) : saisie de la dernière séance,
  13 ms ; correction de la première séance, 30 captures refaites, 359 ms, sans aucune tâche de plus de 50 ms (la page
  reste réactive : chaque capture rend la main). « Recalculer les captures » : 343 ms. Pour un groupe de 35, compter
  environ trois fois et demie, toujours par petites tranches.
- **Ratchets ajustés** : `sentinelle-contenir-complexite` 439 → 438 (`ecrirePresencesSeance` 16 → 14 ; le rafraîchissement
  sort en fonction de 4 : complexité déplacée, pas réduite) ; `sentinelle-audit-aide-15-oct` : l'essai « les captures sont
  hebdomadaires » interdisait à l'Aide de dire qu'une saisie capture, ce qui devient vrai ; il exige maintenant les deux phrases.
- **Pas vérifié** : WebKit et Safari, l'iPad. **Le verdict Playwright complet est à prendre sur le Mac** avant toute fusion.
