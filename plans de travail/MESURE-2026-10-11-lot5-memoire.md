# Mesure – lot 5 : la mémoire sur l'iPad (sans l'iPad) – #991, #1025, #995

> Mesuré le 11 octobre 2026, entre 7 h 05 et 7 h 45 (Toronto, `date`), par Claude Code. Consigne : `plans de travail/CONSIGNE-DU-JOUR.md` (Cowork, 6 h 58). Chaque chiffre vient d'une exécution de la session ; ce qui est inféré est marqué.

## En bref

| Geste | Avant | Après |
|---|---|---|
| « Exporter une sélection », 1,25 Go de copies (#991) | page **6,4 Go**, réseau 2,5 Go, 43 s | page **égale au repos** (≈ 170 Mo), réseau 29 Mo, 6 s |
| « Ouvrir une archive… », archive de 1,15 Go (#1025) | page **1 306 Mo** | page **égale au repos** (≈ 172 Mo) |
| Chrome : fenêtre de choix après une préparation de 6,5 s (#995) | **refusée** : « Codex non mis à jour » | « Ton codex est prêt », puis la fenêtre dans le clic |

## 1 · L'instrument

Le même que le lot J0 (`MESURE-2026-09-30-lot-J0-codex-memoire.md` § 1) : `/usr/bin/footprint`, `phys_footprint_peak` du processus de la page et du processus réseau, **un navigateur neuf par mesure**, WebKit 26.4 de Playwright sans interface, le vrai `index.html`. Trois passes par cas. Scripts jetables (`tests/_mesure-991.mjs`, `_mesure-1025.mjs`, `_mesure-995.mjs`), retirés après la mesure.

« Repos » : le pic de la page juste avant le geste (démarrage compris). Un pic après le geste égal au repos veut dire que le geste n'a pas dépassé le démarrage de la page.

## 2 · #991 – « Exporter une sélection »

Profil WebKit persistant, 300 copies fictives de 4,15 Mo (octets aléatoires, incompressibles) sur deux trimestres fictifs (`h2031`, `a2031`), 1 245 Mo en IndexedDB. Dialogues répondus « tous » puis « Continuer » ; la destination est une poignée qui ne lit pas le fichier.

| | Pic de la page | Pic du réseau | Durée | Fichier |
|---|---|---|---|---|
| Avant (`854e8faa`) | 6 385, 6 370, 6 440 Mo | 2 504 Mo | 43 s | 1 245 425 977 octets |
| Après (`3a49eb92`) | 169, 171, 168 Mo (repos 168 à 171) | 26 à 29 Mo | 6 s | 1 245 044 978 octets |

Le fichier est plus petit de 0,38 Mo : 300 entrées rangées au lieu de compressées, sur des octets aléatoires. **Inférence**, d'après le § 6 du lot J0 : sur de vrais PDF, qui se compressaient de 3,4 %, le fichier d'une sélection grossira d'autant.

**Ouverture** : banc permanent `codex-991-selection-aller-retour.spec.js`. Le fichier du lot et le même contenu refabriqué à l'ancienne (tout compressé par JSZip) s'ouvrent dans un espace neuf avec les mêmes clés, les mêmes valeurs, le même bilan, et des copies identiques à la source, octet pour octet (empreintes SHA-256).

## 3 · #1025 – « Ouvrir une archive… »

Archive fictive fabriquée hors du navigateur : 394 copies PDF fictives de 2,92 Mo, rangées sans compression, `meta.json` et `donnees.json` compressés ; 1 150 562 415 octets. Ouverte par le vrai champ de fichier du mode fichier (celui de Safari et de l'iPad).

| | Pic de la page | Pic du réseau | Écran |
|---|---|---|---|
| Avant (`3a49eb92`) | 1 307, 1 306, 1 306 Mo (repos 171 à 173) | 27 à 33 Mo | étape de sélection, 1 élément |
| Après (`53be4f3c`) | 172, 175, 172 Mo (repos identique) | 28 à 29 Mo | étape de sélection, 1 élément |

Le chiffre d'avant recoupe celui du 4 oct. (1 242 Mo, même taille d'archive).

**L'écran de réimport des bibliothèques est-il ouvert par erreur ? Non.** C'est la fonction même du geste depuis #254 (en-tête de `js/reserve-ouvrir.js` : « Réimport sélectif d'une archive ») ; l'inscription à la liste en est un effet de bord (#248). La fiche le jugeait « sans rapport avec un trimestre », ce qui est vrai pour l'emprunt (#1023), pas pour ce geste. Rien n'est changé.

## 4 · #995 – Chrome et le toucher actif

Google Chrome 154.0.8037.98 installé sur le Mac, piloté par Playwright (`channel: 'chrome'`), sans interface, **profil jetable** (jamais celui de Grégoire). Pack démo, codex actif sans fichier tenu. Vrais clics (`page.mouse.click`) ; aucun `evaluate` entre le clic sur « Télécharger » de l'aperçu et la fenêtre ; la préparation allongée par une attente avant la compression des textes.

**Durée du toucher** (lectures posées par le clic lui-même) : actif à 0, 1, 2, 3, 4, 4,5 et 4,8 s ; **éteint à 5,0 s**, 5,2, 5,5 et 6 s. Même ordre que WebKit (actif à 4,5 s, éteint à 5,5 s, lot J0 bis).

**Avant**, préparation de 6,5 s : `showSaveFilePicker` appelé toucher éteint, rejeté `SecurityError – Failed to execute 'showSaveFilePicker' on 'Window': Must be handling a user gesture to show a file picker.` L'usager lit « Codex non mis à jour » (Fermer, Télécharger à la place, Réessayer). Rapport : « Toucher frais: non demandé ». **L'inférence de la fiche est confirmée.** Préparation courte : la fenêtre est appelée toucher actif (le Chrome sans interface l'annule aussitôt, `AbortError`, ce qui montre qu'elle s'ouvrait).

**Après** (correctif par `toucherFrais`), préparation de 6,5 s : aucune fenêtre de choix appelée ; « Ton codex est prêt » (Annuler, Enregistrer) ; un vrai clic sur « Enregistrer » ouvre la fenêtre toucher actif. Rapport : « Toucher frais: demandé (toucher expiré), accordé ». Préparation courte : inchangée, aucune fenêtre intermédiaire.

**Non mesuré** : « Réessayer » avant le correctif (l'inférence de la fiche dit qu'il réussissait ; le clic sur « Réessayer » est un toucher, donc vraisemblable). Le Chrome avec interface, où la vraie fenêtre de macOS s'ouvrirait.

## 5 · Limites

- WebKit de Playwright n'est pas Safari sur l'iPad (mêmes réserves qu'au lot J0 § 9). Les ordres de grandeur se transportent ; les seuils, non.
- Les copies fictives sont des octets aléatoires, pas de vrais PDF.
- Le partage vers Fichiers n'est pas mesuré (#996, hors du lot).
