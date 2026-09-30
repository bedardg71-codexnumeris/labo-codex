# Consigne – lot G : « Mettre à jour le codex » sur l'iPad ne dit rien quand il échoue

> Écrite le 29 septembre 2026, à 11 h 15 (Toronto), par Cowork, sur accord de Grégoire (« Oui », vers 11 h 10). L'ancienne consigne (lot F) est archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-29-lot-F-les-mots.md`.
> **Condition de départ** : `git --no-optional-locks log --oneline -1 origin/main` montre `44376e21` ou plus récent. Branche `lot-g-codex-ipad`, partie de `main`.
> **Priorité** : retour testeur vécu, sur le parcours que le lot F vient de livrer (le codex dit vrai). Issue 1 (corriger maintenant).

## 1 · Le symptôme vécu (porte terrain de 1.168.0, rangée 1.2)

29 sept., sur l'iPad (Safari 27.0, iPadOS, 820 × 1180), 1.168.0, codex actif « 601-101 A26 (+A25+H26) », environ **1 Go** selon Grégoire. À 9 h 26, menu Codex › « Mettre à jour le codex » (sous-texte « Télécharge un nouveau fichier ») :
- la fenêtre de progression s'affiche ; ensuite, **aucune fenêtre** d'aperçu ni « Enregistrer dans Fichiers » dont il se souvienne, **aucun message**, pas de rechargement de page ;
- **aucun fichier** : ni dans Fichiers › iCloud Drive › Téléchargements (capture de 9 h 27), ni ailleurs par la recherche ;
- à 9 h 29, le menu dit toujours « Ton codex n'a pas tes derniers changements », dernier fichier `…-2026-09-28-07h55.zip` : **pas de faux succès** (le lot F tient là-dessus).
- Rapport de bug `BUG_"grégoire"_2026-09-29_09-31-45.txt` (sur son iPad ; non versé) : « ERREURS CONSOLE : Aucune erreur détectée » ; DERNIÈRES ACTIONS : trois clics sur « Codex » (9 h 22, 9 h 22, 9 h 29), **aucun clic sur « Mettre à jour le codex »** ; localStorage 600 clés, 4 331,8 K car. ; IDB 1003 clés. ⮕ Inscris-le au registre (`SUIVI-BUGS.md`, prochain numéro, **#988** si le compteur est toujours à #987), sous « Ouverts ».

## 2 · Ce que Cowork a lu dans le code (à remesurer, pas à croire)

- `actionEnregistrer` (`js/codex.js`) : `if (!resultat) return;` (aperçu annulé) puis `if (sauvegarde.methode === 'annule') return;` : **deux sorties muettes**.
- `sauvegarderVersDestination`, stratégie 2 (iPad) : `navigator.share` ; **toute `AbortError` devient « annulé »**, qu'elle vienne de l'usager ou d'un refus du système. Les autres erreurs tombent sur la stratégie 3.
- Stratégie 3 : `a.click()` puis `URL.revokeObjectURL(url)` **tout de suite** : pour un gros blob, Safari peut ne plus rien avoir à écrire. Si ce chemin a été pris, l'app aurait marqué « à jour » et dit « Codex mis à jour » : ce n'est pas ce qu'il a vu, donc la sortie est vraisemblablement une des deux sorties muettes. **Inférence.**
- Avant 1.168.0, le même chemin était muet, et l'état était posé « à jour » avant l'écriture : **pas une régression du lot F** (lu dans `053d96cb`). Le « dernier fichier du 28 à 7 h 55 » n'est pas une preuve qu'une écriture ait réussi ce jour-là.
- `js/rapport-bug.js` ne capte que les erreurs, et son journal d'actions ne voit pas les boutons `data-action` du menu du codex.

**Hypothèses sur la cause, aucune mesurée** : (a) **l'espace libre de l'iPad** (hypothèse de Grégoire : un fichier d'environ 1 Go doit tenir en mémoire et sur le disque) ; (b) l'activation de l'usager expirée pendant la longue préparation, avant `navigator.share` ; (c) une limite de taille du partage de fichiers. ⮕ **Le lot ne doit pas deviner : il doit rendre la cause lisible au prochain essai.**

## 3 · Le mandat

1. **Aucune sortie muette après le premier geste.** Seul un aperçu refusé par l'usager (« Annuler » de l'aperçu) sort sans message. Toute autre issue sans fichier écrit dit « Non mis à jour » par le témoin commun (D0), reste affichée, et le menu garde « n'a pas tes derniers changements ».
2. **Un rattrapage** : sur cet échec, proposer « Réessayer » et « Télécharger à la place » (stratégie 3). Le téléchargement direct **ne libère plus l'URL tout de suite** (libérer après un délai long ou au `pagehide`, à ton choix, dis lequel). ⚠ Le téléchargement direct ne peut pas savoir si le fichier a bien été écrit : **ne pose pas « à jour » sur ce chemin sans le dire** ; propose ta règle dans la demande de relecture (c'est un mot d'écran et une promesse : à Grégoire).
3. **La cause devient lisible** : garde en mémoire la dernière tentative (heure, taille du blob, stratégie tentée, nom et message de l'erreur, étape atteinte) et ajoute-la au rapport de bug dans une section « DERNIÈRE MISE À JOUR DU CODEX ». Capte aussi les `console.warn` du codex dans le rapport. Rien de personnel (pas de noms, pas de contenu).
4. **La taille se voit avant** : l'aperçu et le message d'échec disent la taille du fichier (« environ 1,0 Go »).
5. **Mots d'écran, à faire accepter par Grégoire avant la release** (propositions de Cowork, à retoucher selon ce que tu mesures) :
   - titre : « Codex non mis à jour » ;
   - texte : « Le fichier (environ ‹taille›) n'a pas été enregistré. Si ton appareil manque d'espace, libères-en, puis réessaie. Tes données restent dans l'application. » ;
   - boutons : « Réessayer » · « Télécharger à la place ».

## 4 · Preuves attendues

- Banc WebKit : `navigator.share` simulé qui rejette `AbortError`, puis `NotAllowedError`, puis réussit ; le téléchargement direct ; l'aperçu annulé (seul cas muet). Pour chaque cas : message, état du menu, section du rapport de bug.
- Mutations : sortie muette remise ; `revokeObjectURL` immédiat remis ; « à jour » posé sur un échec ; section du rapport retirée. Toutes rouges.
- ⚠ Aucune machine ne juge la feuille de partage de l'iPad : **la porte du lot F reprend à sa rangée 1.2** après la livraison (artefact « Porte · Ton codex à jour », déjà publié ; Cowork l'ajuste). N'écris pas de nouvelle porte.

## 5 · Stock, arrêt, livraison

- **Stock** : rien n'est écrit dans les données ; aucun état à réparer.
- **Arrête-toi et demande** si la règle du point 3.2 (« à jour » après un téléchargement direct) ne peut pas être dite honnêtement en une phrase.
- **À cocher à la livraison** : la ligne du registre (#988) passe aux corrigés **seulement** pour le volet « l'échec se dit » ; la cause reste ouverte tant que l'iPad n'a pas réussi une mise à jour (fiche ouverte à dessein, dis-le).
- Release : à toi de trancher `patch` ou `minor`, dis-le. Relecture croisée de Cowork avant la release ; verdict WebKit Cowork fermé ; push ; « en ligne » constaté.
