# Verdict de relecture – lot A2 : vérifier une archive (chantier des archives)

> Écrit le 30 septembre 2026 à 16 h 57 (Toronto) par Cowork. Porte sur `c202c0b0`, branche `lot-a2-verifier-archive`.

## Verdict : le lot part après UNE correction (les fichiers cachés du système), et l'accord de Grégoire sur trois textes.

## Ce que j'ai fait, et ce que je n'ai pas fait

- **Lu** : `js/reserve-verifier.js` en entier pour la lecture du ZIP, les deux sources, `verifierArchive`, l'état retenu ; ton rapport ; le § 5 de la demande.
- **Rejoué, indépendamment de ton banc** (Node 22, le module de la branche) :
  - **L'archive réelle de Grégoire**, en mode dossier, par un faux FSAPI posé sur le vrai dossier : `verifiee`, 205 sur 205, données concordantes, en 1,3 s. (Couverture non mesurée : pas d'application dans cet essai.)
  - **Mode fichier**, archives fabriquées par `FichierSortant.assemblerZip` : saine → `verifiee` ; un octet altéré → `incomplete`, « altérée » ; sans empreintes → `a_refaire` ; fichier amputé de sa fin → « Le fichier choisi n'est pas un ZIP lisible » ; identifiant d'une autre archive → `autre_archive`.
- **Pas fait** : ton banc, tes 27 mutations, Playwright, la mesure de mémoire ; le vrai Chrome ; le vrai Safari.

## La correction demandée

**Un fichier caché du système rend une archive saine « incomplète ».** Rejoué : l'archive réelle, plus un `.DS_Store` dans `travaux/` → `incomplete`, « 1 fichiers en trop ». Le Finder en pose un dès qu'on ouvre un dossier dans certains affichages (il y en a déjà un dans `trimestres/`, écrit à 16 h 19). L'archive de Grégoire vit dans iCloud, et il l'ouvre dans le Finder : la fausse alarme est une question de jours.

⮕ Dans les deux modes, un fichier de `travaux/` dont le nom commence par un point, ou qui s'appelle `Thumbs.db` ou `desktop.ini`, n'est ni une copie ni un fichier en trop : il est ignoré. Un essai, une mutation. Si tu vois une raison de ne pas l'ignorer, dis-la avant de corriger.

## Remarques sans correction

1. `etatVerification` tient pour vérifiée une entrée dont l'un des deux identifiants manque. Acceptable pour l'affichage ; **le lot A4 exigera les deux identifiants égaux, l'empreinte de `meta.json` et la couverture mesurée**. À noter au plan.
2. Une archive vérifiée l'est contre ses propres empreintes, pas contre les copies de l'application. C'est le plan : la comparaison avec l'application se fait au retrait (lot A4).
3. Tes choix « décidé seul » sont retenus, dont #998 fermé avec sa réserve, et la règle « une fiche sans fichier rend le groupe invérifiable ».

## Les mots hors du § 3

- **Tranché par Cowork (accord grammatical, mécanique)** : le détail sous « Archive incomplète » s'accorde en nombre et nomme la chose : « 1 copie absente », « 2 copies absentes », « 1 copie tronquée », « 1 copie altérée », « 1 copie illisible », « 1 fichier en trop dans l'archive », « 1 fiche du groupe sans copie dans l'archive ». Les deux dernières lignes (données, couverture) restent telles quelles. La ligne sous « Archive à refaire », l'infobulle et les dix phrases d'« Archive illisible » restent telles quelles.
- **Soumis à Grégoire** : « Ce n'est pas cette archive », « Dossier à choisir de nouveau », et la ligne des Nouvelles (réécrite plus court par Cowork). La consigne de release suit sa réponse.
