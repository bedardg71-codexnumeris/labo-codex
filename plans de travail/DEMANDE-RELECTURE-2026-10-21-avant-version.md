# Demande de relecture – Avant la version : la spec du texte troué (#1138), la phrase du profil

> Claude Code, 21 octobre 2026, début d'après-midi. Consigne : `CONSIGNE-LOT-2026-10-21-avant-version.md`. Un commit sur `main`, non poussé, sans numéro de version ni verdict complet.

## 1. #1138 : la spec `texte-troue-reperes-enonces`

**La condition, mesurée d'abord** (spec jetable, dans un vrai WebKit) : en création, il y a quatre zones, `aucune`, `priorite`, `concentre` et `decompte`. La quatrième est bien `textarea[data-enonce-cle="aucune"]`, rendue une seule fois, dans le pli `sous-critere-pli--aucune` « Quand la copie ne porte aucun code ». C'est donc la spec qui est périmée, pas l'application.

**La spec réécrite** suit la règle d'aujourd'hui, qui est notée en en-tête avec la date, #1131 et #1138 :
- **en création, quatre zones**, dont « Aucune annotation », une seule fois, dans son pli. Le pli est déplié par l'événement DOM, comme les cartes ;
- **ses repères** sont ceux de la modification, `{critere}` seul ;
- **un essai neuf** : on tape, puis on pose un repère dans la zone. La valeur arrive dans `window.tempCriteres[0].enonces.aucune`, et le stockage n'enregistre **aucune écriture des grilles** : j'ai compté les appels à `setSync`, `set` et `modifier`. L'attente part du texte de départ de la zone (« Aucun tampon ni erreur annotés. ») ;
- **le témoin négatif** : la zone vidée est rendue, et elle se montre vide ;
- le reste de la spec n'a pas changé.

**Résultat** : 7 essais sur 7 verts.

**Break-test** : j'ai retiré le rendu de la zone en création (`ctx.mode === 'temp'`), et les 7 essais rougissent. Code restauré, vérifié par `cmp`. Un premier break-test, sur `ctx.grilleId`, n'avait rien cassé : ce n'est pas le champ qui distingue la création.

## 2. La phrase de la note finale du profil

La phrase se lit maintenant « Note finale = 55,3 pts + 24,5 pts = 79,8 % », avec la virgule et l'insécable devant « pts » comme devant « % », exactement comme dans le PDF de l'élève.

**Une seule définition.** Le PDF avait sa propre petite fonction locale pour écrire les points. Elle passe dans `note-pourcentage.js` sous le nom `formaterPoints` (« 44,5 pts », une décimale fixe), que le PDF et le profil lisent tous les deux. Le PDF n'en garde aucune copie. Les harnais de test reçoivent cette fonction par `completerNoteParDefaut`.

**Bancs** :
- la spec #896 lit la phrase dans son nœud de texte, sans retoucher les espaces, et la compare à sa chaîne exacte, insécables compris : `'Note finale = 55,3 pts + 24,5 pts = 79,8 %'` ;
- la sentinelle Vitest vérifie `formaterPoints` (cas A) ;
- break-test : l'ancienne phrase remise → la spec #896 rougit. Code restauré, vérifié par `cmp`.

**Hors de la consigne, je le nomme** : la ligne du calcul juste au-dessus, « (90 % + 80 %) ÷ 2 = 85 % × 65% = 55.3 pts » (`profil-etudiant-sections-affichage.js`, l. 3099), garde ses points à l'ancienne. La consigne ne visait que la phrase de la note finale. Cette ligne relève de #1137.

## Ensemble

- Vitest complet : vert, 795 fichiers, 9 367 essais.
- WebKit : vert, 47 essais. J'ai lancé toutes les specs du profil, celle du texte troué, et les specs du PDF et des points (912, lot 2, lot 3, audit sommatif).
- Anti-cache : `note-pourcentage.js`, `synthese-retroaction-rendu.js` et `profil-etudiant-sections-affichage.js` reçoivent un jeton neuf daté 1020.
- BACKLOG : #1138 est à « fait », avec sa phrase « vérifié comment ».
- `/fin-de-session` a été lancé avant le commit, sans le verdict complet : l'audit statique ne relève aucun motif, et aucune zone protégée n'est touchée.

## Ce que le commit emporte aussi

Comme le demande la consigne, le commit emporte aussi :
- le verdict de la note à la norme française et celui du lot de mots 2 ;
- le plan du critère algorithmique, modifié par Cowork ;
- la consigne du miroir, à laquelle je n'ai pas touché : elle sert demain.
