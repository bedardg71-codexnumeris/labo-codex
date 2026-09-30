# Consigne du jour – lot J0 ter : le message d'attente avant la feuille de partage, et la ligne des Nouvelles (#988 se ferme)

> Écrite le 30 septembre 2026 à 10 h 42 (Toronto) par Cowork.
> **Condition de départ** : `main` à `c8185a4d` ou plus récent (1.170.2 en ligne). Branche neuve `lot-j0-ter-attente-partage`.

## 1 · La porte du lot J0 bis est passée (vécu, iPad, 1.170.2)

Relevé de Grégoire, 30 sept. à 10 h 38, complété par sa réponse écrite à Cowork :

- La barre va à 100 % en 12 secondes environ.
- La fenêtre « Ton codex est prêt » s'ouvre ; « Enregistrer » amène la feuille de partage, **sans passer par « Codex non mis à jour »** (confirmé par lui, « OUI »).
- Fichier du jour dans Fichiers : 1,31 Go (de nouvelles copies importées et évaluées depuis le matin).
- Application fermée puis rouverte, deux fois : aucun rappel.
- Espace libre : 17 Go, après une restauration de l'iPad (le matin : 2,88 Go).
- ⚠ Le relevé a été fait sur la page de la porte du lot J0 (celle de 1.170.1), pas sur la neuve : les rangées cochées sont celles de l'ancienne page. La rangée propre au lot J0 bis (la fenêtre) est attestée par sa réponse écrite, pas par une coche.

**Un défaut relevé par lui, mot pour mot** : « Il y a un délai avant l'apparition de la feuille de partage, suffisamment long pour qu'un utilisateur se demande ce qui se passe et s'il y a un problème. » Durée non chiffrée.

## 2 · Ce que tu fais

### 2.1 · Le message d'attente

Dans le parcours « Mettre à jour le codex », stratégie du partage : **dès que le partage est lancé, un message d'attente est à l'écran ; il disparaît quand le partage se termine** (réussite, échec ou annulation). Il vaut pour les trois entrées du partage : direct, après « Enregistrer » de « Ton codex est prêt », après « Réessayer ».

- **Mots acceptés par Grégoire le 30 sept. (« ok »), à ne pas modifier** :
  - Titre : « Ouverture de la feuille de partage… »
  - Texte : « Ton appareil prépare le fichier (TAILLE). Ça peut prendre un moment : elle va s'ouvrir. »
  - TAILLE : la même écriture que dans « Ton codex est prêt ».
- **La contrainte qui commande** : rien d'asynchrone ne s'intercale entre le toucher et `navigator.share`. Le message se pose de façon synchrone, avant l'appel ; aucun `await`, aucune minuterie avant le partage. Sinon on rouvre le défaut du lot J0 bis.
- La forme (composant existant de progression ou autre) est à toi : prends ce qui existe déjà à l'écran pour ce parcours. Pas de bouton : ce n'est pas une question.
- Si tu constates qu'il faut toucher à autre chose que l'affichage autour de l'appel, arrête-toi et demande une relecture avant de livrer.

**Non mesurable au banc** : le délai lui-même (c'est iPadOS qui prépare le fichier pour la feuille). Dis-le, ne le simule pas en chiffre.

### 2.2 · La ligne des Nouvelles

Version **1.171**, couleur orange. Titre et ligne **acceptés par Grégoire le 30 sept. (« accepté »)**, à reprendre tels quels, avec les espaces insécables des entrées voisines :

> **Titre** : « Un gros codex se met à jour sur l'iPad »
>
> **Ligne** : « Sur l'iPad, la mise à jour d'un gros codex pouvait s'arrêter en chemin : la page se rechargeait, ou le fichier n'était pas enregistré au premier essai. Le fichier est maintenant préparé sans charger tes copies en mémoire, et beaucoup plus vite. Quand il est prêt, la fenêtre « Ton codex est prêt » te demande de toucher « Enregistrer » pour choisir où le ranger. Le fichier pèse un peu plus lourd (environ 3 %) : tes copies y sont rangées telles quelles. »

### 2.3 · La fermeture

- #988 passe aux bugs réglés de `SUIVI-BUGS.md`, avec la porte du § 1.
- Les deux markdowns de porte du 30 sept. (lot J0, lot J0 bis) reçoivent leur résultat en tête, avec la réserve du § 1 sur la page utilisée.
- `OU-EN-EST-ON.md` : la mise à jour du codex sur l'iPad passe à « fait, vécu sur l'iPad ».

## 3 · La preuve attendue, et l'ordre

- Le banc du lot J0 bis étendu : le message est à l'écran pendant que le partage est en attente, dans les trois entrées ; il a disparu après réussite, après échec, après annulation ; le banc « réel » (vraie activation, vrai partage, préparation longue) reste vert, ce qui prouve que le message ne vole pas le toucher. Mutations, chacune rouge.
- Vitest complet. Release 1.171, verdict Playwright complet sur le commit de release, push, « en ligne » lu chez Netlify, `RELAIS.md`.
- **Pas de relecture préalable de Cowork pour ce lot** (tranché par Cowork) : il n'écrit ni n'efface aucune donnée, et un raté se voit et se reprend par « Réessayer ». Cowork relit après coup. La réserve du § 2.1 tient : autre chose que de l'affichage, et tu t'arrêtes.

## 4 · Ce que tu ne fais pas

Rien sur #990 à #995. Pas de porte terrain : c'est de l'apparence, Grégoire le verra à sa prochaine mise à jour.

## 5 · Ce que tu rends à Grégoire

Trois lignes : le numéro en ligne, le verdict Playwright, ce qu'il verra à sa prochaine mise à jour du codex.
