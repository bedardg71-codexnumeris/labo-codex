# Relecture croisée – lot F (les mots), relecture finale

> Écrite le 29 sept. à 5 h 55 (Toronto), par Cowork. Répond à `DEMANDE-RELECTURE-2026-09-29-lot-F-les-mots.md` (branche `lot-f-les-mots`, tête `5d84f5d1`). Fichier non suivi sur `main`.

## Verdict : **vert après R1 et R2** (des mots, pas de code) ; puis les réponses de Grégoire, la suite complète, le commit des deux fichiers de sécurité, la release, le push

## Ce qui a été vérifié, et comment

- Clone jetable de `5d84f5d1` : les deux sentinelles du lot passent, sauf le raccord de `cc-license.js`, **attendu** (le fichier est modifié mais non commité, § en tête de ta demande).
- Mutations rejouées par Cowork, **rouges** : une ligne de raccord retirée (`bibliotheque-ui.js`, « Dupliquer ») ; « Enregistrer le codex » remis dans `codex.js`. ⚠ Une première mutation de Cowork (renommer l'appel) **survivait** : la sentinelle compte les lignes qui contiennent le nom, pas les appels. Sans conséquence pour le lot (un appel renommé casserait à l'exécution), noté pour mémoire.
- **Pas à ma portée** : les bancs WebKit (le témoin du codex sur un vrai geste, le rappel, la Réserve Safari). Ils se prennent au verdict complet, sur le Mac.
- Lu : le bouton de Réglages › Données garde son action (`ouvrirModalExport`, la fenêtre sélective) ; l'ancienne description (« ZIP complet du trimestre actif ») était **fausse**, la nouvelle dit ce que fait le bouton. « Ouvrir un Codex… » (ligne 63) est bien le libellé réel. Tes arbitrages du § 2 : acceptés tels quels.

## R1 – la FAQ promet un avertissement qui n'existe pas partout (ligne 66)

« … l'application te prévient si tu quittes sans l'avoir fait. » est faux pour un changement de section (`navigation.js`, zone protégée : aucune question). ⮕ « … tant que tu ne l'as pas cliqué, rien n'est écrit, et l'application te prévient si tu fermes la fiche ou recharges la page avant. » (la formule des Nouvelles de E1 à E3, acceptée par Grégoire).

## R2 – l'aide du codex dit « .codex.zip » pour un fichier « .zip »

Une erreur de fait dans un texte d'aide : corrige-la dans ce lot (« un fichier .zip »), ligne ajoutée au tableau. Tranché par Cowork.

## Tranché par Cowork (technique)

- **Afficher « Enregistré » sur les écrans qui n'avaient pas de témoin** : pas dans ce lot. Inscris une fiche (issue 2) ; le mécanisme est prêt (tes 101 appels).
- **Le nom des fichiers de copie de secours** (`sauvegarde-‹auteur›-‹date›.json`) : on le garde (il voyage, l'import le reconnaît par son contenu).
- **La sélection automatique du portfolio écrite à l'ouverture, sans geste** (`portfolio.js:277`) : inscris une fiche (issue 2) ; c'est une donnée pédagogique écrite sans geste.
- **Les anciens guides** (`docs/utilisateur/`, au vouvoiement, écrans périmés) : une fiche « retirer ou réécrire », hors lot.
- **Le blogue et ses tutoriels** : hors dépôt ; Cowork le dit à Grégoire.

## À Grégoire (Cowork, une question à la fois) – réponses ajoutées ici

1. **Le stock – tranché par Grégoire à 5 h 57 : option (b).** Une seule fois, au premier chargement de la nouvelle version, si un codex est actif, poser « pas à jour » (écrit `_codex_etat` seulement, jamais les données pédagogiques). Essai : premier chargement → « pas à jour » ; second chargement → inchangé ; sans codex actif → rien ; mutation (marque rejouée à chaque chargement) → rouge.
2. **Les textes – acceptés par Grégoire à 5 h 59** : la FAQ (ligne 66, avec R1), la fermeture d'un codex pas à jour (17), le rappel (41-43), Réglages › Données (37), la bulle du Rapport (87), l'aide des présences (86), le glossaire du codex (68), tels que dans ton tableau. Les remplacements décidés par D4 (lignes 1-16, 18-36, 38-40, 44-65, 67, 69-85, 88-112) : contrôlés par Cowork, acceptés.
3. **Les Nouvelles – acceptées par Grégoire à 6 h 08**, mot pour mot. Titre : « Des mots qui disent vrai : enregistré, codex, copie de secours ». Lignes, dans cet ordre :
   1. « « Enregistré » ne veut plus dire qu'une chose : écrit dans l'application, sur ton appareil. »
   2. « Le codex a son verbe : « Mettre à jour le codex ». Son menu te dit si ton codex est à jour ou s'il n'a pas tes derniers changements. »
   3. « Au premier lancement de cette version, ton codex est marqué « pas à jour » : mets-le à jour une fois pour repartir d'un état juste. »
   4. « L'enregistrement automatique du codex toutes les 5 minutes est retiré : ton fichier ne change que lorsque tu le mets à jour. »
   5. « La sauvegarde de Réglages › Données s'appelle maintenant « Copie de secours », sur l'Accueil comme dans le rappel, qui t'y mène directement. »
   6. « Le codex et la copie de secours n'ont pas le même rôle. Le codex contient toutes tes données et les copies de tes étudiant·es ; tu l'emportes d'un appareil à l'autre, et son menu te dit s'il est à jour. La copie de secours contient ce que tu coches (tout, avec « Toutes les clés ») : c'est une photo de tes données, que tu gardes à part pour les retrouver si ton navigateur les perd. »
   7. « Archiver un groupe dit « Groupe archivé » ; sous Safari, une archive annulée n'apparaît plus dans la liste. »
   8. « L'Aide, la foire aux questions et plusieurs écrans ont été relus selon ces mots. »

## Fiche à inscrire, décidée avec Grégoire (issue 2, à trancher plus tard, pas à préparer)

**Simplifier codex et copie de secours.** Constat de Grégoire : un codex contient tout ce que contient une copie de secours ; il copie régulièrement son codex et n'a jamais fait de copie de secours. Le rappel périodique pousse vers l'outil le moins complet (rien n'est coché par défaut, les copies des étudiant·es n'y sont pas). Piste de Cowork, à trancher par Grégoire : le rappel propose de mettre à jour le codex (ou d'en créer un) ; la copie de secours cesse d'être une notion à part et devient une option du codex, « Copie datée, sans les copies des étudiant·es », pour les cas où la légèreté compte. Aussi à vérifier : le codex data se dit anonymisable (architecture) mais l'extraction écrit toujours « non anonymisé » (`codex-data.js`).
