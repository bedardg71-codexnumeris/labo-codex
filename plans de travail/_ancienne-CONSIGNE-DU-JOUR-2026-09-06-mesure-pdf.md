# Consigne de la prochaine séance — rapatrier la clôture sur le Mac, puis mesurer ce que le PDF de l'élève rend (sans coder)

> **Écrite le 6 septembre 2026, 6 h 20 (Toronto), par Cowork, à froid, après le lot du Suivi (1.123.0) et la clôture faite à distance.**
> **Application au moment de l'écriture : 1.123.0 en ligne (build `0905-2025`). Sur GitHub, `main` = `0896e535` (clôture, SESSION 30,
> poussée à distance) ; sur le Mac, `main` = `origin/main` = `c4ac5ae3`, un commit en retard, avec trois brouillons non commités.**
> ⚠ **Cette séance tourne SUR LE MAC**, dans le dépôt monté, pas à distance : c'est là que sont les brouillons et le patch.
> ⚠ **Nom sans date, exprès.** Au démarrage, après le temps 0 (pas avant : `CONSIGNE-DU-JOUR.md` est suivi et le pull doit passer),
> promeus-la : archive `CONSIGNE-DU-JOUR.md` (le lot du Suivi, exécuté) sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-05-lot-suivi-1.123.md`,
> renomme celle-ci en `CONSIGNE-DU-JOUR.md`, et commets les deux avec ton premier commit. **Remesure avant d'exécuter**
> (`git --no-optional-locks log --oneline -5`, `git rev-parse --short origin/main`, `cat version.json`, `TZ=America/Toronto date`) :
> si l'état diffère de l'en-tête, dis-le en tête de ton rapport et fais ce que la mesure commande.

## Ce que cette séance produit, pour Grégoire

Rien de nouveau à l'écran : **aucun code**. Elle remet le Mac au niveau de GitHub sans perdre ce que la session interrompue avait écrit,
puis elle dépose une **mesure** courte : ce que l'élève lit exactement dans son PDF aujourd'hui, pièce par pièce et dans l'ordre — ce
qu'il faut savoir avant de cadrer la « synthèse des rétroactions dans le PDF », le prochain accent que Grégoire a nommé le 5 sans le dater.

## Temps 0 — rapatrier la clôture (obligatoire, avant tout)

Attendu à l'ouverture : `git status` montre `OU-EN-EST-ON.md`, `RELAIS.md`, `SESSION.md` modifiés — les brouillons de clôture du 5 au
soir, interrompus par le redémarrage, jamais commités ; Cowork en a sauvé une copie dans `_to_delete/brouillons-cloture-5-sept-mac.patch`
(ignoré par git, 105 lignes). Dans cet ordre : `git checkout -- OU-EN-EST-ON.md RELAIS.md SESSION.md` ; `git pull --ff-only` (attendu :
`0896e535`) ; puis compare le patch aux blocs commis (la ligne « LE SUIVI » à 20 h 45 dans `OU-EN-EST-ON.md`, le bloc RELAIS de 20 h 50,
le bloc SESSION). La version du Mac venait de la session qui a FAIT le lot ; celle de GitHub a été reconstruite à distance depuis les
commits et les runs. **Reporte dans les blocs commis ce que le patch dit de plus ou de plus précis** (heures, feu vert à 20 h 15, verdict
local, réserve #731), sans dupliquer les blocs et sans changer ce que `0896e535` dit des deux runs (`34001941420` rouge par la spec
neuve seule ; `34009795798` rouge par perte du runner après 220 tests verts, spec ni prouvée ni infirmée). **Pas de relance de run**
(décision de Cowork : le prochain push la juge). Un commit docs, push (aucun run déclenché). Si le patch n'a rien de plus, dis-le et
ne commets rien de plus que la promotion de cette consigne.

## Temps 1 — mesurer ce que l'élève lit dans son PDF, sans rien changer

**Question** : quand un enseignant produit le PDF d'une copie évaluée, quels textes l'élève lit-il, dans quel ordre, d'où vient chacun
(écrit par l'enseignant, engendré par un modèle, tiré d'une cartouche, d'un code, d'une projection), et lesquels se répètent ?

**Périmètre à mesurer d'abord, pas à supposer** (erreur 11 de Cowork, 4 sept. : « le PDF de l'élève » était QUATRE sites) :
`js/travaux-export-pdf.js`, `js/export-pdf.js`, `js/synthese-retroaction-data.js` + `js/synthese-retroaction-rendu.js`,
`js/evaluation-retroaction.js`, et le texte copié vers LÉA (grep du rendu). Pour chaque site : la liste ordonnée des blocs de texte
que l'élève voit, la fonction qui les produit, la source de chaque bloc, et si le même contenu apparaît deux fois (le bilan de l'app
et le bilan du PDF sont deux implémentations — mesuré le 4 sept.). Une grille holistique, une analytique et une algorithmique
donnent-elles le même squelette ? Mesure sur un bac à sable Vitest (patron des trois audits : modules réels dans un faux `window`,
une copie de banc par type de grille), ou par lecture quand le rendu est du HTML pour impression — dis lequel, bloc par bloc.

**Ce que tu déposes** : `Rapports/MESURE-ce-que-l-eleve-lit-dans-le-pdf-<date>.md`, court (une page, deux au plus) : un tableau par
site (bloc · source · engendré ou écrit · répété ailleurs ?), les commandes qui le prouvent, « ce que je n'ai pas regardé », et **aucune
disposition, aucune proposition de correctif** — ce n'est pas un audit, c'est la carte avant le cadrage ; Cowork et Grégoire cadrent
ensuite. Si tu trouves en chemin un texte que l'élève lit et qui est FAUX (un chiffre, un nom de critère, un « #581 »), c'est un constat
à part, en tête du rapport, avec la disposition que `CLAUDE.md` demande (corriger / inscrire / commenter), et tu t'arrêtes là :
Grégoire arbitre. Une ligne dans `OU-EN-EST-ON.md` sous « Ouvert après ce jour » (la synthèse : mesurée, rapport déposé, pas cadrée).

## Ce qui ne se fait PAS dans cette séance

- Aucun code dans `js/`, aucune release, aucune relance de run.
- Aucun des constats inscrits par les trois audits (#700-#705, #710-#729, #735-#754) ni le cadrage « non remis par famille » : Grégoire
  les tranche une règle à la fois, quand il le voudra, avec une recommandation de Cowork.
- Pas de gabarit de retour pour le 14 : c'est Cowork qui le propose à Grégoire, et le canal est sa décision.

## Ce qui est dû par Grégoire, et que cette séance ne code pas à sa place

Cinq gestes à l'écran (deux sur 1.122 : le profil avec un brouillon, « Modèle simple » qui donne 90 / 70 / 50 ; trois sur 1.123 : le
Suivi du groupe sans « Non-participation » avant la première copie évaluée, le profil d'un élève qui a repris et réussi, le bouton
« Rapport » d'un profil) ; le canal des retours du 14 ; l'arbitrage des règles inscrites.
