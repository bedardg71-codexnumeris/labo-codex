# Consigne du jour — les mots de l'écran de réglage du dépistage

> **Écrite le 11 septembre 2026 à 6 h 25 (Toronto, `TZ=America/Toronto date`) par Cowork, sur trois
> arbitrages de Grégoire pris entre 6 h 10 et 6 h 25, à froid.** Application au moment de l'écriture : **`1.129.0`**, build
> `0910-1645`, `main` = `origin/main` = `c5ffc520`.
> Elle remplace la consigne d'hier (trois réglages morts, livrée en `1.129.0`), archivée à côté sous
> `_ancienne-CONSIGNE-DU-JOUR-2026-09-10-trois-reglages-morts.md`.
>
> **Remesure avant d'exécuter** : `git --no-optional-locks log --oneline -5`, `cat version.json`,
> `TZ=America/Toronto date`. ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.**
>
> **Préalable de lecture, et il fait autorité** : `plans de travail/CADRAGE-2026-09-10-ecran-de-reglage-du-depistage.md`,
> § 2 et § 3 (les quatre arbitrages y sont écrits, datés, dans ses mots) et § 5 (les clés ne bougent pas).

---

## AVANT TOUT — un commit documentaire séparé

Six fichiers de Cowork sont modifiés dans l'arbre, non commis (hier soir et ce matin) :
`CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, `OU-EN-EST-ON.md`, `plans de travail/00-CADRAGES-OUVERTS.md`,
`plans de travail/CADRAGE-2026-09-10-ecran-de-reglage-du-depistage.md`,
`plans de travail/PORTES-TERRAIN-2026-09-10-823.md` (relevée 12/12), et l'archivage de l'ancienne
consigne. **Commets-les d'abord, seuls, en nommant les fichiers** (`git add` ciblé, jamais `-A`), avec la
présente consigne. Puis le lot.

---

## POURQUOI

Le tri de l'écran `Labo › Outils d'observation` suit l'ordre arrêté par Grégoire : **les réglages morts
(fait, 1.129.0), puis les mots, puis la forme, puis déplacer.** Ce lot est **les mots**. Tout ce qu'il
touche est un libellé que ses collègues lisent ; il a arbitré chacun ce matin. **Rien ici n'est à
décider : c'est à appliquer, et à mesurer.**

⛔ **Libellés seulement.** Aucune clé de données ne change (`idme.insuffisant`, `interpretation.excellent`,
identifiants DOM, clés de préférences) : les utilisateurs en ont dans leur stockage, et « tarir n'est pas
réparer ». Aucune écriture dans les données de personne.

---

## LOT A — l'échelle IDME, quatre lettres, partout

**Arbitrage (vers 6 h 15)** : **I — Incomplet · D — Développement · M — Maîtrise · E — Étendu.**
« Insuffisant » et « Excellent » disparaissent des libellés IDME ; l'infobulle cesse d'hésiter
(« Insuffisant ou incomplet » → « Incomplet »).

**Les trois endroits mesurés par le cadrage** : `accompagnement-contenu-hover.js:338` (infobulle),
`guides-pedagogiques.js:50` (guide), `index.html:8972` (écran de réglage). **Il y en a d'autres** :
`grep -c -E "Insuffisant|Excellent" js/*.js index.html` rend ~100 occurrences dans 21 fichiers — témoin :
`Étendu` en rend 9 dans `index.html`.

⮕ **La règle de tri, à appliquer occurrence par occurrence** : *est-ce le nom d'un niveau IDME, affiché
ou lu comme tel ?*
- **Oui** → renommer.
- **Non** → ne pas toucher, et lister dans le rapport. Trois familles à laisser : (a) les **noms de
  niveaux d'une échelle** (gabarits d'`echelles.js`, `pack-demo-20.js`) — ce sont les mots d'une échelle,
  ils voyagent, et un gabarit renommé n'est plus le même gabarit ; (b) les **clés de données** et noms de
  zones (`interpretation.excellent`, `idme.insuffisant`…) ; (c) tout mot « excellent » ou « insuffisant »
  qui n'est pas un palier IDME (prose ordinaire).
- **Doute** → ne renomme pas, liste-le pour Grégoire. Un libellé renommé par erreur se voit ; un libellé
  laissé se corrige en dix secondes.

⚠ Le § 2 du cadrage note que le glissement a touché **les deux extrémités** de l'échelle. Vérifie aussi
que le **D** et le **M** sont bien « Développement » et « Maîtrise » partout (pas « En développement »,
« Maîtrisé », etc.) — mesure, ne suppose pas.

## LOT B — le bloc « Seuils d'interprétation » dit ce que ses champs font

**Arbitrage (vers 6 h 20)** : le texte du bloc cesse d'annoncer l'IDME. Texte retenu, mot pour mot :

> Ces trois seuils colorent les colonnes Assiduité, Complétion, Performance et Mobilisation de la liste
> des élèves, et qualifient l'engagement dans le profil. Ils ne touchent ni la note ni l'échelle IDME.

⛔ **Fragile / Acceptable / Bon ne bougent pas** — noms de zones, ils attendent l'orthopédagogue (`#821`).
Le bloc porte-t-il d'autres phrases qui mentionnent l'IDME ? Mesure ; si oui, elles tombent sous le même
arbitrage (le bloc ne parle plus d'IDME).

## LOT C — deux textes faux et « cueillette »

**Arbitrage (vers 6 h 25)** :
1. Aide d'« Indicateurs visuels des seuils » (`index.html`, ~l. 8947) → « Lignes pointillées et
   étiquettes des niveaux de ton échelle sur les graphiques de progression du profil individuel. »
   (Mesuré : le plugin trace `genererZonesDepuisEchelle()` → `obtenirEchelleUtilisateur()`, pas l'IDME.)
2. Infobulle du repère « note différée » (`preferences.js:592`) → « Note différée : la rétroaction passe
   d'abord. Réglage dans Labo › Outils d'observation. » ⚠ Deux entrées de
   `accompagnement-contenu-terme.js` (l. 428, 437) disent aussi `voir: 'Réglages > Préférences'` :
   mesure si elles désignent ce même réglage ; si oui, même correction.
3. « cueillette » → « collecte », aux deux endroits de l'écran (`index.html`, ~l. 8744 et ~l. 8925).
   Mesure s'il en reste ailleurs dans l'application ; si oui, liste-les, ne les change pas (hors écran).

---

## CE QUI CHANGE À L'ÉCRAN — et qui doit être dit

Des mots, seulement des mots. **Aucun calcul, aucune couleur, aucune borne ne bouge** : si un test de
comportement change de résultat, c'est un défaut. Ce lot se vérifie par la lecture.

⮕ **Release `patch`.** ⮕ **Entrée de changelog obligatoire** (skill `release-et-changelog`), en langue
d'utilisateur : l'échelle IDME dit les mêmes quatre mots partout (Incomplet, Développement, Maîtrise,
Étendu) ; le bloc des seuils dit ce qu'il règle ; deux aides corrigées.

⮕ **Porte terrain DUE, une seule, trois rangées** (skill `portes-terrain` ; markdown à toi, artefact à
Cowork) : sur `https://app.codexnumeris.org`, dans `Labo › Outils d'observation` — (1) les quatre lettres
IDME se lisent Incomplet / Développement / Maîtrise / Étendu, et l'infobulle aussi ; (2) le bloc « Seuils
d'interprétation » porte le texte retenu, sans « IDME » annoncé ailleurs ; (3) « collecte » aux deux
endroits, et l'aide des indicateurs visuels parle de « ton échelle ». Pas de porte sur les graphiques :
ils ne changent pas.

---

## CE QUI REMONTE À GRÉGOIRE

1. **Tout libellé IDME dont tu doutes** (lot A) : liste-le, ne le renomme pas.
2. **Rien d'autre.** Le reste est technique : tranche, puis dis-le en une ligne en nommant ce que tu as
   supposé.

⛔ **Hors périmètre, et ce n'est pas un oubli** : la forme de l'écran (temps 4), le déplacement vers Suivi
(temps 5), les cinq chemins morts (`#824`), les noms de zones et les bornes (`#821`, `#822`), le mot
« risque » dans l'Aide (inscrit au cadrage, point 5). **Un lot, une livraison.**
