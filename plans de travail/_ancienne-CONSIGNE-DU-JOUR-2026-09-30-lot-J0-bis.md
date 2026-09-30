# Consigne du jour – lot J0 bis : le partage du codex refusé après une préparation longue (#988)

> Écrite le 30 septembre 2026 à 7 h 44 (Toronto) par Cowork. Suit la porte terrain du lot J0, faite sur l'iPad à 7 h 28.
> **Condition de départ** : `main` à `3193c288` ou plus récent. Branche neuve `lot-j0-bis-partage-apres-preparation`. **Ni release ni push avant la relecture de Cowork.**

## 1 · Ce que la porte a montré (vécu, tracé)

iPad, Safari 27, 1.170.1, codex réel, 2,88 Go libres.

- **Le lot J0 tient** : la barre va à 100 % en 12 secondes environ, sans rechargement. Fichier préparé : 1 314 934 136 octets.
- **Le premier essai d'écriture échoue.** Rapport de bug de 7 h 30, mot pour mot :

```
Début: 2026-09-30 07:28:21
Étape atteinte: enregistrement du fichier
Taille du fichier: 1314934136 octets
Essais d'écriture: 1
Stratégie: partage (Enregistrer dans Fichiers)
Erreur: NotAllowedError – The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.
Issue: échec de l'écriture du fichier
Fin: 2026-09-30 07:28:34
```

  Dernier toucher avant l'échec : « Télécharger » de l'aperçu, à 07:28:26. Le refus tombe 8 secondes plus tard, à la seconde où la préparation finit.
- **« Réessayer » réussit** (7 h 34) : même fichier, sans le refaire ; la feuille de partage s'ouvre, « Enregistrer dans Fichiers », « Codex mis à jour », menu « Ton codex est à jour », dernier fichier `codex-601-101-A26-A25H26-2026-09-30-07h34.zip`.

**Lecture de Cowork (inférence, confortée par « Réessayer »)** : `navigator.share` est appelé après l'expiration de l'activation du toucher ; WebKit rend `NotAllowedError`. Ce n'est pas l'espace. Elle expliquerait aussi la réussite du 29 à 15 h 03, si elle est passée par « Réessayer » (non vérifié). **Remesure-la avant de t'y fier** : si WebKit du banc ne reproduit pas le refus sans activation, dis-le.

## 2 · Ce que tu fais

Dans le parcours « Mettre à jour le codex », stratégie du partage seulement : **au moment d'appeler le partage, si le toucher n'est plus actif, l'application demande un toucher frais au lieu d'échouer.**

- Critère (tranché par Cowork, technique) : `navigator.userActivation` présent et `isActive` vrai → partage direct, comme aujourd'hui (un petit codex ne voit rien changer). Sinon (inactif, ou API absente) → la fenêtre ci-dessous. Si tu mesures qu'un autre critère est plus sûr, prends-le et dis-le.
- **Les mots de la fenêtre, acceptés par Grégoire le 30 sept. (« j'accepte »), à ne pas modifier** :
  - Titre : « Ton codex est prêt »
  - Texte : « Le fichier (TAILLE) est préparé. Touche « Enregistrer » pour choisir où le ranger. »
  - Boutons : « Annuler », « Enregistrer » (principal)
- « Enregistrer » lance le partage du fichier déjà préparé, dans le geste. « Annuler » suit l'issue d'annulation existante : le codex n'est pas marqué à jour, pas de fenêtre d'échec.
- La trace du lot G (`_noterTentative`) note le passage par cette fenêtre.
- Un échec du partage après le toucher frais garde le parcours actuel (« Codex non mis à jour », « Réessayer », « Télécharger à la place »).

## 3 · La preuve attendue

- Un banc qui reproduit le refus : un partage simulé qui rejette `NotAllowedError` quand l'activation est inactive. Rouge sur `main`, vert sur la branche. Mutations, chacune rouge.
- Dans WebKit : préparation longue → la fenêtre, puis le partage ; préparation courte → partage direct, aucune fenêtre.
- Vitest complet ; Playwright ciblé sur les fichiers qui traversent le codex. Le verdict complet est dû sur le commit de release.

## 4 · Le fichier écrit par l'iPad (lecture seule)

Grégoire l'a rangé dans **« Téléchargements » d'iCloud** (pas forcément son dossier habituel) : `codex-601-101-A26-A25H26-2026-09-30-07h34.zip`. Dès qu'il est descendu sur le Mac : `unzip -tq`, compte d'entrées (503 ou plus), taille (attendue : 1 314 934 136 octets). Ne le déplace pas, ne l'ouvre pas dans l'application. Relève ni nom de copie ni nom d'étudiant·e.

## 5 · À inscrire, sans corriger

- **La taille affichée diffère de celle d'iPadOS** : l'application dit « 1,22 Go » et « environ 1,2 Go » là où la feuille de partage dit « 1,31 Go » pour le même fichier (Gio contre Go). Ce sont des mots que l'usager lit : à Grégoire, plus tard.
- **Le message d'échec nomme l'espace** (« Si ton appareil manque d'espace ») quelle que soit l'erreur : il a envoyé Grégoire sur une fausse piste ce matin. Idem : inscrire.

## 6 · Ce que tu ne fais pas

Aucune ligne aux Nouvelles. #988 reste ouverte. Rien sur #990, #991, #992.

## 7 · Ce que tu rends

`DEMANDE-RELECTURE-2026-09-30-lot-J0-bis.md`, et à Grégoire trois lignes : ce qui change à l'écran, la preuve, le verdict sur le fichier de l'iPad.
