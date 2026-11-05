# Portes terrain – la 1.235.0, boucle sans relais, passage de l'après-midi (5 novembre 2026)

> **La trace.** L'opération est l'artefact « Portes terrain 1.235.0 ». Cowork le publie à partir de ce fichier, avec le bouton « Copier mes résultats ».
> **Contexte.** Passage du 5 nov. après-midi : quatre entrées faites (32, 32 bis, 33, 34). Version 1.235.0, build 1105-1555, commit `2508c573`, poussée le 5 nov. à 17 h 49 après un verdict du Mac vert.
> **Le contenu.** Un seul geste sur tes données : réparer les deux copies de reprise dont la page 1 s'affiche blanche (ton rapport du 5 nov., 9 h 57 : « La copie de la reprise ne charge pas »). Tout le reste est mesuré par les essais, ou relève de l'usage normal (§4).
> **Elle ne vaut qu'une fois la version en ligne** : tant que le bas de page n'affiche pas 1.235.0, elle juge la version d'avant.
> Un échec devient un item de `Retours des testeurs/SUIVI-BUGS.md`, pas une note mentale.

## §0 · Préalable
- [ ] 0.1 · iPad · Ouvre app.codexnumeris.org, recharge la page, puis lis le numéro en bas de page. ⮕ 1.235.0.

## §1 · ⚠⚠ Données · Les deux copies à la page blanche, sur l'iPad
Pourquoi : après « Modifier › + Ajouter des pages », la page 1 de ces deux reprises est devenue blanche. La photo n'est pas perdue : elle est encore dans le fichier, mal enregistrée. Le geste « Réparer la copie » la remet en place ; il remplace le fichier de la copie, d'où le codex juste avant.
- [ ] 1.1 · iPad · Ouvre la première des deux copies dans Annoter. ⮕ Au-dessus de la copie : « Une page de cette copie s'affiche blanche : sa photo est encore dans le fichier, mais mal enregistrée. », et le bouton « Réparer la copie ».
- [ ] 1.2 · iPad · Touche « Réparer la copie ». ⮕ Une fenêtre « Mettre ton codex à jour avant de réparer ? ». Si elle dit « Écrire un codex avant de réparer ? », c'est seulement qu'aucun codex n'est actif sur l'iPad : pas un échec.
- [ ] 1.3 · iPad · Touche « Mettre à jour, puis réparer » (ou « Écrire un codex, puis réparer »). ⮕ Le codex s'écrit, puis « Copie réparée : la page s'affiche de nouveau. » ; la copie se rouvre en page 1, avec sa photo.
- [ ] 1.4 · iPad · Feuillette les pages 2 et 3. ⮕ Les mêmes photos qu'avant, tes annotations à leur place.
- [ ] 1.5 · iPad · Ouvre la seconde copie et refais 1.1 à 1.3 (cette fois, la fenêtre propose de mettre à jour le codex : tu peux le faire ou « Réparer sans mettre à jour », le premier codex te couvre déjà). ⮕ Les mêmes messages ; la page 1 montre sa photo.
- [ ] 1.6 · iPad · Feuillette ses pages 2 et 3. ⮕ Les mêmes photos qu'avant, tes annotations à leur place.

Si « Cette copie ne peut pas être réparée ici. Rien n'a été modifié. » s'affiche : rien n'a été écrit. Note-le en échec, avec le nom de la production (pas celui de l'élève).

## §2 · Interface
Aucune porte. La copie de référence en mode anonymisé (33) et le Rythme des reprises (34) sont mesurés par les essais et n'écrivent rien : si quelque chose cloche en usage normal, dis-le.

## §3 · Décisions
Aucune.

## §4 · Ce que je n'ai pas pu vérifier
- **La version en ligne.** L'adresse demande l'identification Cloudflare : d'où la rangée 0.1.
- **La réparation sur tes vraies copies, dans Safari.** Cowork l'a éprouvée hors de l'application, sous Node, sur les PDF de tes deux copies lus dans le codex de 12 h 30 : photo rendue à la taille exacte de l'original, pages 2 et 3 identiques à l'octet, mêmes tailles de pages. Le geste dans l'application est mesuré par Playwright, WebKit compris, sur une copie fictive. Le vrai Safari de l'iPad, son codex et ses deux copies : seulement le §1.
- **Supposé : la copie se rouvre en page 1** après la réparation (rangée 1.3). Si elle se rouvre ailleurs, ce n'est pas un échec de la réparation ; note-le quand même.
- **La cause côté codex (#1236).** Une copie ouverte d'un codex arrive encore sans son type ; « Modifier » ne s'y trompe plus (32), mais la cause amont reste inscrite, hors de la boucle.
- **Deux cas refusés sans rien écrire** (commentés dans le code, aucun cas vécu) : une copie qui a aussi une page PNG saine, ou une photo perdue en WebP. Le message s'affiche, mais le geste répond « ne peut pas être réparée ici ».
- **L'empreinte d'archive.** Une copie réparée ne concorde plus avec son empreinte d'archive, comme après tout « Modifier ». Sans suite.
- **Le verdict du Mac.** Vert sur `2508c573` : 1 381 essais, 1 376 verts, 4 rouges déjà connus (#1181), 1 vert au second essai (`grilles-sous-criteres-condense.spec.js`, sans rapport avec ce passage), 23 sautés.
