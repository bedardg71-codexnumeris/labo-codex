# Rapport — « Découvrir » seul en ligne, l'interrupteur éteint par défaut : prêt sur la branche, NON MIS EN LIGNE (16 nov. 2026)

**Relais.** Branche `lot/deux-temps-modeles`, PR d'aperçu n° 23. Consigne :
`plans de travail/CONSIGNE-2026-11-16-decouvrir-en-ligne.md` (relais de Cowork, demande de Grégoire de 15 h 48).
Arbre de travail : `../labo-codex-deux-temps`. Build de l'aperçu : 1.248.3, `1116-1631`.
**Fait** : A (le verrou par parcours, « Découvrir » seul ouvert, sa fin à deux boutons, les entrées vérifiées) et B
(l'interrupteur éteint à la première arrivée), avec leurs bancs et leurs break-tests ; `main` (1.248.3) repris dans
la branche ; l'accord de Grégoire sur les deux lignes des Nouvelles (16 nov., vers 16 h 30).
**Pas fait : C, la mise en ligne.** Le verdict complet a été arrêté au cinquième morceau sur quarante : onze rouges
nouveaux dans quatre bancs de parcours. **Rien n'est parti sur `main`.** La release préparée (fusion, 1.249.0, les deux
lignes) est gardée en local sous `attente/1.249.0-non-jugee` (`f4f8702f9`, arbre `../labo-codex-fusion`), non poussée ;
`main` local y est revenu à `origin/main` (`baddec78f`).
**Reste** : §3, puis la fusion, le verdict et le push.

---

## 1. Ce qui est livré sur la branche

| Demande | Ce qui est fait | Jugé par |
|---|---|---|
| A.1 le verrou | `PARCOURS_OUVERTS = ['decouvrir']` : la liste des parcours ouverts. Un parcours fermé reste inscrit, mais n'est offert nulle part et rien ne le lance. Le panneau liste les ouverts, puis dit « À venir », sans nommer les autres. | sentinelle et banc `parcours-verrou-2026-11-16` |
| A.2 « Découvrir » | Il part avec le défaut corrigé et les retouches du relais de 13 h 20. | banc `parcours-je-regarde` |
| A.3 sa fin | Tant que « Mettre ta classe en place » est fermé : « Explorer la démo par moi-même » et « Terminer ». | sentinelle, banc |
| A.4 les entrées | Panneau, porte « Tu enseignes ? », reprise d'un parcours fermé resté en cours, fin de parcours, « Parcours suivant ». Trois break-tests, trois rouges. | banc `parcours-verrou` (4 essais) |
| A.5 « À propos » | Non touchée. | — |
| B.1 à B.3 | Éteint à la première arrivée, puis l'état laissé. Deux gestes écrivent : l'interrupteur, le lien de sortie de la carte. `grilleCreee`, `noterGrilleCreee` et le cas `navigator.webdriver` sont retirés. Pendant un parcours, rien ne change. | sentinelle ; banc `carte-aide-materiel` (9 essais, dont I5 neuf) ; break-test rouge sur 5 essais |
| B.4 | L'en-tête de `js/materiel-aide.js`, `docs/DATA-OWNERSHIP.md` et les deux bancs de la page réalignés. | — |

Ni `js/config.js` ni `js/navigation.js` ne sont touchés.

**Le stock de l'interrupteur** (la clé `laboCodex.aideMateriel` écrite sous la règle du 12 nov.), jugé par I5 :

| La clé contient | Ce que la personne retrouve |
|---|---|
| rien, ou `{}` | éteint |
| `ouvert: false` (avec ou sans `grilleCreee`) | éteint, comme laissé |
| `ouvert: true` sans `grilleCreee` | allumé : elle l'avait rallumé elle-même |
| `ouvert: true` avec `grilleCreee` | allumé. ⚠ Ce `true` a pu être noté à la création d'une grille, sans geste sur l'interrupteur : c'est l'état qu'elle voyait alors |
| `grilleCreee` seul | éteint |

Rien n'est écrit à l'arrivée. `grilleCreee`, qui n'est plus lu, quitte la clé au prochain geste de la personne.

## 2. Ce que j'ai supposé

1. **Minor, 1.249.0** : un parcours qui revient est une nouveauté. Le titre de l'entrée des Nouvelles reprend le
   début de la première ligne accordée (« Le parcours « Découvrir » est de retour ») : aucun mot ajouté.
2. **« Terminer »** rend l'application comme le parcours l'a trouvée : s'il a ouvert la démo, il la referme.
3. **Le lien de sortie de la carte compte comme un geste sur l'interrupteur** : c'est lui qui l'éteint.
4. **La présentation du panneau** : la branche remplaçait la phrase de `main` par les quatre temps, qui nomment
   « Je regarde » et « Nous faisons ». Tant qu'aucun parcours ouvert n'a ces deux boutons, la phrase de `main`
   reste, au caractère près. Les quatre temps reviendront avec le premier parcours à deux temps.
5. **« Remettre la démo à neuf »** ne paraît que si un parcours ouvert a un modèle. Le rang du menu compte les
   parcours ouverts : « 1 sur 1 ».
6. **Dans la démo, le geste sur l'interrupteur n'est toujours pas retenu** (le confinement de la démo).

## 3. Pourquoi la mise en ligne est arrêtée

Les trente bancs qui touchent les parcours ont été joués un à un. Vingt-cinq sont verts.

| Banc | Rouges | Origine, mesurée sur `bfd4789f8` (la branche avant cette session) |
|---|---|---|
| `parcours-fleches-2026-11-10` | 6 | déjà rouges : la réécriture de « Découvrir » de ce matin a périmé le banc |
| `bulle-sur-telephone-2026-11-09` | 3 | déjà rouges |
| `deux-temps-modeles-2026-11-13` | 1 (B, 1180 × 820, la flèche d'un point à l'écart) | déjà rouge |
| `parcours-2-ma-classe-2026-11-09` | 1 | **de cette session** : voir dessous |
| `gel-etape-7-2026-11-15` | 1 | intermittente connue, à la baseline (fiche 36) |

Fait : les dix premiers précèdent cette session. Le rapport de ce matin ne les avait pas vus : ces trois bancs
n'avaient pas été rejoués. Non établi : pour chacun, si c'est le banc qui est périmé ou l'écran qui a régressé.
Deux au moins méritent d'être lus de près avant d'être réalignés : « une flèche va de la bulle à l'onglet
« Évaluation » » (la règle « ce qu'il faut toucher a sa flèche ») et « le filet » sur téléphone.

**Le rouge de cette session, qui demande une décision.** La ligne de la poignée (B.7 du relais de 13 h 20) allonge
de 45 px la première bulle de chaque parcours. Dans « Nous faisons », à 1180 × 900, la bulle « Ton trimestre » n'a
alors plus de place à côté du formulaire : elle couvre le champ du nom du trimestre. Déclarer ce champ ne fait que
déplacer le recouvrement vers l'année (essayé, retiré). Trois issues possibles : garder la ligne et accepter ; ne pas
la dire dans une première bulle qui porte un formulaire ; la dire ailleurs. C'est à Cowork et à Grégoire.

Un autre rouge de cette session est corrigé : `essai-novice-lot2-moteur` attendait un espace ordinaire devant les
deux-points (le banc suit maintenant l'insécable).

## 4. Ce que la fusion apporterait à `main` au-delà de « Découvrir »

À savoir avant de la refaire : la branche porte aussi le lot des deux temps. Les parcours restent fermés, mais du
code change pour tout le monde : `js/demo-activation.js` (+141 lignes : l'entrée et la sortie de la démo mises en
file, les cours créés dans la démo rangés à la sortie, les clés absentes avant l'entrée retirées), `js/demo-namespace.js`
(la remise à neuf), une garde dans `js/travaux-stockage.js` et une marque dans `js/trimestre-v2-cours.js`. Ces
chemins servent « Explorer la démo », en ligne depuis la 1.248.3. Leurs bancs de confinement existent ; le verdict
complet ne les a pas encore jugés.

## 5. Les passages de tests

Un à la fois, au premier plan ; charge entre 2 et 7, mémoire libre entre 62 et 81 % (un relevé à 42 % pendant un
passage, revenu à 79 % ensuite).

| Passage | Résultat |
|---|---|
| Vitest complet, sur la branche et sur la release préparée | 931 fichiers, 11 888 essais, verts |
| `parcours-verrou` | 4 sur 4 ; trois break-tests rouges |
| `carte-aide-materiel` | 9 sur 9 ; break-test rouge (5 essais) |
| `dissection-defilement-aide`, `parcours-je-regarde` | 6 sur 6 |
| `parcours-8-commentaires`, `en-tete-epure` | 19 verts après correction (ils rouvrent de nouveau les parcours eux-mêmes) |
| Verdict complet, morceaux 1 à 5 sur 40 (50 specs) | 4 verts, 1 rouge (`parcours-fleches`), puis arrêté |
| Les 30 bancs de parcours | 25 verts ; 5 rouges (§3) |

**Deux fautes de conduite, les miennes.** J'ai préparé la fusion et la release avant d'avoir joué les bancs que le
moteur touche : deux bancs et Vitest ne suffisaient pas pour une branche restée longtemps à part. Et un commit
(`7f2cc67ce`) est parti avec un rouge de Vitest, faute d'avoir attendu son verdict ; le hook a refusé le push, le
commit suivant (`b05dfc8c2`) corrige.

**Non vérifié** : les 347 specs que les morceaux 6 à 40 auraient jouées ; Safari et l'iPad ; aucune relecture croisée.
