# Portes terrain — #787, les treize balises à deux attributs `class` (14 septembre 2026)

> Lot : **#787**, release **1.140.10** (patch). Les deux valeurs de chaque paire sont fusionnées en un seul attribut, rien retiré.
> Pourquoi une porte : ce lot CHANGE l'apparence, d'un espacement à la fois, et un espacement se juge à l'écran. Chaque effet a été mesuré dans Chrome, avant/après, sur les treize balises. Ce que la mesure ne dit pas : si c'est plus beau, ni si Safari rend pareil.
> ⚠ **Aucune donnée n'est touchée** : ce sont des marges. Un raté se corrige dans la version suivante, sans rien perdre. Si le temps manque, cette porte peut attendre.
> **Ce qui échoue devient une ligne de BACKLOG sous #787**, pas une note mentale.
> Livrables jumeaux : ce markdown (la trace, écrit par Claude Code) ; l'artefact à cases avec « Copier mes résultats » est publié par Cowork.

## § 0 · Préalable

**0.1** Ouvre `https://app.codexnumeris.org`, recharge **en vidant le cache** (Cmd+Maj+R), et lis le numéro en bas de page. ⮕ *Attendu :* **1.140.10**. S'il affiche 1.140.9 ou moins, le lot n'est pas encore en ligne : arrête-toi là, rien de ce qui suit ne vaudrait.

## § 1 · Données

Aucune rangée : rien ne touche ton corpus.

## § 2 · Interface

> ↻ **14 sept. 2026, soir — verdict de Grégoire sur 2.1 : INVÉRIFIABLE, pas ratée.** « Je ne vois aucune option de verrouillage de cartouche » : le bandeau ne s'affichait jamais, pour une autre raison que ce lot (#863).
> ↻ **Puis SANS OBJET** : rien ne pouvait verrouiller une cartouche, et Grégoire a retiré le verrouillage (#864, 1.140.11) — le bandeau et son bouton n'existent plus. **Cette rangée ne se joue pas.** Restent 2.2 et 2.3.

**2.1 · Le bouton « Déverrouiller » d'une cartouche ne se coupe plus en deux lignes**
*Où :* Conception → Cartouches de rétroaction, sur une cartouche verrouillée (le bandeau orangé « Cartouche verrouillée »).
*Pourquoi :* à côté du texte « Cette cartouche est en lecture seule… », le bouton pouvait passer sur deux lignes quand la place manquait.
- [ ] Regarde le bouton **« Déverrouiller »** dans le bandeau. ⮕ *Attendu :* le mot tient sur **une seule ligne**. C'est le texte d'à côté qui s'enroule, plus le bouton.

**2.2 · Le groupe de boutons des évaluations prend de l'air en dessous**
*Où :* Évaluations, dans l'écran où tu évalues une copie, au groupe de boutons **Sauvegarder / Réinitialiser**.
- [ ] Regarde l'espace **sous** ce groupe de boutons. ⮕ *Attendu :* environ **15 px** avant le bloc suivant. *Avant :* il n'y en avait aucun, et le bloc suivant collait aux boutons.

**2.3 · Les marges de l'Aide, d'un seul défilement** (dix balises)
*Où :* Aide → **Consultation**, puis Aide → **Référence rapide**.
*Pourquoi :* les encadrés colorés (Astuce, Important, Note) collaient au paragraphe ou à la liste du dessus.
- [ ] Fais défiler **Consultation** du haut en bas. ⮕ *Attendu :* chaque encadré « Astuce » est séparé de la liste du dessus par un petit espace. Les tableaux, eux, remontent un peu (15 px → 10 px), et le premier (« Section 1 : Suivi de l'apprentissage ») s'écrit un peu plus petit.
- [ ] Fais défiler **Référence rapide** du haut en bas. ⮕ *Attendu :* les encadrés « Important » et « Astuce » des questions fréquentes ne collent plus au texte du dessus. La « Note » en bas du glossaire prend une marge de 20 px.

## § 3 · Décisions

*Ce ne sont pas des vérifications* : le lot rétablit ce que quelqu'un avait écrit sans que ça s'affiche jamais. Si un de ces espacements te plaît moins qu'avant, écris lequel dans le champ, et il sera retiré.

**3.1 · Un espacement à retirer ?** — champ libre (vide = tout est gardé).

## § 4 · Ce que je n'ai pas pu vérifier

- **Safari et l'iPad** : la mesure avant/après a été faite dans Chrome seulement.
- **Le bouton « Déverrouiller »** : la mesure confirme qu'il a désormais la consigne « ne pas couper », mais son bandeau était caché pendant la mesure. Je n'ai donc pas vu s'il se coupait réellement avant ; à ta largeur d'écran, il est possible que rien ne change.
- **Le bouton « Consulter la bibliothèque » (Conception) ne change pas, et c'est mesuré** : la consigne de Cowork l'annonçait en pleine largeur et en 0,9 rem. Une règle plus précise de la barre latérale lui donne déjà toute la largeur et une taille de 0,85 rem, et c'est elle qui l'emporte. Aucune rangée pour lui : la machine a répondu.
- **Erreur de méthode rattrapée en session** : la première comparaison, faite sur tout le document, n'était pas utilisable, parce que les deux chargements n'avaient pas rendu le même nombre d'éléments (10 257 contre 10 272) à cause du contenu dessiné par le JavaScript. Seules les mesures ciblées sur les treize balises ont été retenues.
