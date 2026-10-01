# Consigne du jour – chantier du codex, lot I bis : la copie de secours disparaît (D9)

> Écrite le 30 septembre 2026 à 20 h 18 (Toronto) par Cowork. Dernier lot du chantier du codex (`PLAN-2026-09-29-fin-carte-et-enregistrement.md`, lot 1 bis). Grégoire a arrêté l'ordre le 30 à 17 h 25 : finir le codex, puis reprendre les archives (règle 11 de `PROTOCOLE.md`).
> **Condition de départ** : `git log origin/main` à `3736e044` ou plus récent (1.172.0 en ligne). Branche neuve `lot-i-bis-un-seul-terme`. **Ni release ni push avant la relecture de Cowork.**

## 0 · D'abord, deux gestes sans code

*Section réécrite par Cowork le 30 à 21 h 15, avant tout relais : ta session de 20 h a déjà commité la porte, la règle 11 et inscrit #1005. Il ne reste que ceci.*

1. **Commite les fichiers de Cowork tels quels** : `CONSIGNE-DEMARRAGE-COWORK.md`, `plans de travail/CONSIGNE-DU-JOUR.md`, `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-30-lot-A2-release.md`.
2. **Corrige le skill `debut-de-session-labo-codex`** (§ 2, vers la l. 145) : il prescrit `node ../scripts/verifier-playwright.mjs` comme une mesure de dix secondes, et ce script lance toute la suite (≈ 43 min ; tuée à 30 min le 30 à 20 h 44, sans verdict). À l'ouverture, on LIT le verdict déjà rendu (`scripts/.verdict-playwright.json` : sha, code, heure), on ne relance rien. Tranché par Cowork (technique). Dis où vit la copie du skill que tes sessions chargent, si ce n'est pas le dépôt.

## 1 · Ce que le lot doit produire, en gestes

L'application ne parle plus que du **codex**. On ne peut plus fabriquer de copie de secours ; un ancien fichier de copie de secours s'ouvre toujours, par le même bouton, sans que l'écran le nomme. Supprimer un trimestre n'est possible que si le codex est à jour.

**Décision de Grégoire, 30 sept., entre 20 h 09 et 20 h 18** : « un seul terme ». Motif : cinq utilisateurs, lui peut-être le seul à faire un codex ; deux mots pour deux fichiers créent de la confusion. Aucun texte d'écran ne dit plus « copie de secours ».

**Ses données** : rien n'est effacé ni réécrit. Retirer un bouton n'efface pas ce qu'il a écrit : les réglages du rappel et les fichiers déjà faits restent où ils sont.

## 2 · Ce que tu fais

1. **Mesure avant de retirer** : l'inventaire du lot I (`MESURE-2026-09-29-lot-I-rappel-codex.md`, § 3) date du 29 ; remesure-le (`grep -rni "copies\? de secours"` hors `js/changelog-data.js`, puis les appelants de la fabrication). Dis ce qui a bougé.
2. **Retire la fabrication** : la case « Copie de secours » de Réglages › Données, la fenêtre « Copie de secours » (choix des clés), leur aide contextuelle, et le code qui ne sert qu'à eux. Ce qui est partagé avec « Exporter ma config » ou avec l'ouverture d'un fichier reste. Si tu trouves un appelant vivant que l'inventaire ne nomme pas : arrête-toi et dis-le.
3. **L'ouverture d'un ancien fichier reste** : une copie de secours `.json` et une `.zip` (avec travaux) faites par 1.172.0 s'ouvrent encore, par « Ouvrir un Codex… », et restituent les mêmes données. C'est ce qui ne se reprend pas : un essai qui le juge, sur des fichiers fabriqués AVANT le retrait (garde-les en fixtures).
4. **La suppression d'un trimestre change de filet** (`js/trimestre-v2-liste.js`, autour de la l. 407) :
   - Aujourd'hui elle télécharge `exporterTrimestreArchive(id)` avant d'effacer. **Lu au code par Cowork, à remesurer** : ce fichier (`type: 'archive-trimestre'`) ne contient pas les copies, et aucun lecteur ne le reconnaît (`grep archive-trimestre` : une seule occurrence).
   - Désormais : **la suppression est refusée tant que le codex n'est pas à jour**, au sens exact de l'état que le menu du codex affiche (« Ton codex est à jour »). Pas de codex : même refus. Le bouton du refus lance la mise à jour du codex (ou sa création), par le chemin existant.
   - Codex à jour : la confirmation, puis le nom à retaper comme aujourd'hui, puis la suppression. Plus de téléchargement automatique dans ce chemin.
   - Le refus porte un bouton : il lui faut une vraie fenêtre de l'application, pas `confirm()`. Le moyen est à toi.
   - ⛔ **Condition d'arrêt** : si un chemin réel permet de supprimer un trimestre sans passer par cette garde (un autre bouton, `js/trimestres.js` l. 726), arrête-toi et dis lequel.
   - Les autres appelants d'`exporterTrimestreArchive` (boutons de la bibliothèque des trimestres) : **n'y touche pas**. Si ta mesure confirme que rien ne rouvre ce fichier, inscris-le comme fiche (un export qu'on ne peut pas faire revenir) ; c'est du ressort du chantier des archives.
5. **L'Aide et la FAQ** : la question « Codex ou copie de secours : quelle différence ? » disparaît en entier. Ailleurs dans l'Aide (Réglages › Données, dépannage), ce qui conseillait une copie de secours conseille de mettre le codex à jour. Tranché par Cowork (mécanique, sur la règle de Grégoire) ; rends-moi la table avant / après dans la demande de relecture.
6. **Un cliquet** : un essai qui échoue si un texte affiché contient « copie de secours » (toute casse, singulier ou pluriel), hors `js/changelog-data.js` (historique daté, on n'y touche pas). Avec sa garde de non-vide (règle 10).

## 3 · Les mots

**Validés par Grégoire le 30 sept., entre 20 h 09 et 20 h 18, à ne pas modifier.**

**Réglages › Données, première carte** (deux cases au lieu de trois ; « Exporter ma config » inchangée) :
- Titre : « Ouverture et partage »
- Sous le titre : « Ouvre un codex ou une configuration partagée, ou exporte ta configuration pédagogique pour la partager. Pour mettre ton travail en sûreté ou le transporter, mets ton codex à jour : menu Codex, en haut de l'écran. »
- Case « Ouvrir un Codex » : « Ouvre un codex ou une configuration partagée. Le type est détecté automatiquement. »
- Les infobulles de cette carte (`js/accompagnement-contenu-hover.js`, l. 189 et 193) reprennent ces deux phrases ; l. 670, « Copie de secours, restauration, … » devient « Codex, restauration, … ».

**Suppression d'un trimestre** :
- Refus – titre : « Mets d'abord ton codex à jour » ; texte : « Supprimer un trimestre efface ses données pour de bon. Ton codex n'a pas tes derniers changements : mets-le à jour, puis recommence. » ; bouton : « Mettre à jour le codex »
- Confirmation, codex à jour : « Supprimer définitivement le trimestre « NOM » ? Toutes ses données seront effacées : étudiant·es, évaluations, présences, productions, captures et modèles. Ton codex à jour les contient encore : garde ce fichier. »
- Sans codex du tout, le texte du refus dit une chose fausse (« n'a pas tes derniers changements ») : propose la variante dans la demande de relecture, Cowork la soumettra.

**Fenêtre d'ouverture d'un ancien fichier** (`js/import-export.js`, l. 1820-1823 et 1990) :
- « Copie de secours personnelle » → « Fichier personnel »
- « Restauration de ta copie de secours » (repli sans prénom) → « Restauration de tes données »
- « C'est ma propre copie de secours – Je confirme que ce fichier m'appartient » → « C'est mon propre fichier – Je confirme qu'il m'appartient »

**Registre longitudinal** (`js/registre-longitudinal.js`, l. 94) : « Le registre voyage dans ton codex ; pas dans l'archive d'un trimestre. »

## 4 · La preuve attendue

- Les deux anciens fichiers (`.json`, `.zip`) s'ouvrent et restituent leurs données : empreintes avant / après.
- La suppression : refusée codex pas à jour, refusée sans codex, permise codex à jour ; dans les trois cas, ce que contient l'application après. Mutation : la garde retirée → rouge. Un essai de COMPORTEMENT, pas une lecture du source (erreur 16).
- Le cliquet du mot, et sa mutation.
- Vitest complet ; Playwright ciblé ; le verdict complet est dû sur le commit de release.

## 5 · Ce que tu ne fais pas

Aucun changement au menu du codex, au rappel, à « Mettre à jour le codex ». Aucun changement aux archives ni au mot « archivé » (lot A5, plus tard). Les Nouvelles passées restent telles quelles.

## 6 · Ce que tu rends

- `DEMANDE-RELECTURE-2026-09-30-lot-I-bis-un-seul-terme.md` : la mesure, la table avant / après de l'Aide, la variante « sans codex », une ligne des Nouvelles proposée (version mineure).
- `PORTES-TERRAIN-…-lot-I-bis.md` : la carte de Réglages › Données à deux cases ; le REFUS de suppression sur un trimestre non actif, codex pas à jour, **sans aller plus loin** (Grégoire ne supprime aucun trimestre réel) ; nommer l'appareil et le navigateur (Mac : Chrome ; iPad : Safari). Cowork publie l'artefact.
- Cases à cocher à la livraison : #985 (elle n'attendait que ce lot).
- À Grégoire, trois lignes : ce qui change à l'écran, la preuve, ce qui lui revient.
