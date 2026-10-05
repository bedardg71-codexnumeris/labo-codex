# Verdict de relecture – enregistrement, lot 1 : le témoin dit vrai et se voit (#962, #986)

> Écrit par Cowork le 5 octobre 2026 à 12 h 50 (Toronto, mesurée par `date`). Porte sur `da9dc970` (`claude/enregistrement-temoin`) et `DEMANDE-RELECTURE-2026-10-05-enregistrement-temoin.md`.

## Verdict : vert, avec un ajout avant la livraison : #1029 entre dans ce lot

**Accepté tel quel** : l'abonné unique `surEchecEcriture` (même forme que `surEcriture`) ; le point unique `_annoncerEnregistre` ; « Enregistré » au commit pour les grosses clés et pour la clé qui porte l'échec affiché ; le signal d'échec étendu à toutes les clés (ta mesure de `syncToLocalStorageCache` le justifie) ; l'événement du codex inchangé ; #986 par `visualViewport`, zoom exclu ; 2 s gardées (la porte le juge) ; ta supposition (un échec ne se tait jamais, même d'une écriture discrète).

## L'ajout : rouvrir la connexion perdue (#1029)

Ta propre mesure le rend nécessaire : sur l'iPad, après une mise en arrière-plan, **chaque** écriture dirait « Non enregistré » jusqu'au rechargement, et le rechargement lui-même **perdrait** ces écritures (`syncToLocalStorageCache` réécrit localStorage avec IndexedDB). Livrer l'aveu sans le remède mettrait l'usager devant un message permanent sans issue, et l'iPad est l'appareil de Grégoire.

⮕ Quand une écriture (ou suppression) échoue parce que la connexion est fermée (`InvalidStateError`, ou `onclose` reçu), `db.js` **rouvre la connexion une fois** et **refait l'écriture** de la dernière valeur de cette clé ; seulement si la nouvelle tentative échoue, « Non enregistré ». Pose aussi `onclose` (et `onversionchange`) pour savoir la connexion perdue avant la prochaine écriture. Une seule réouverture concurrente à la fois (les écritures en vol l'attendent). Essais : connexion réellement fermée (ton banc WebKit) → l'écriture aboutit, « Enregistré », la valeur relue après rechargement ; réouverture impossible (doublure) → « Non enregistré » qui reste. Mutations rouges : sans réouverture ; deux réouvertures concurrentes ; la nouvelle tentative qui écrit une valeur périmée.

**Le message, s'il reste un échec malgré la réouverture** : la raison « le navigateur a refusé l'écriture » ne dit pas quoi faire. Propose à Cowork, sans le coder, une phrase d'issue pour ce cas, dans ton rendu ; Cowork la soumettra à Grégoire.

## La suppression muette

Inscris-la (issue 2) : un échec de suppression d'arrière-plan fait revenir une donnée supprimée au rechargement ; rien ne se perd, mais l'usager croit avoir supprimé. Hors de ce lot, sauf si la réouverture la couvre au passage (dis-le).

## La porte terrain

Cowork la publiera **à la livraison**, pas avant : elle porte sur la version en ligne. Ajoute une rangée : après une mise en arrière-plan de plusieurs minutes (autre app, écran verrouillé), revenir et saisir → « Enregistré », pas « Non enregistré ».
