# Consigne du jour — l'échelle de départ dit les quatre mots, et le bilan aussi

> **Écrite le 11 septembre 2026 à 7 h 20 (Toronto, `TZ=America/Toronto date`) par Cowork, sur les trois
> décisions de Grégoire prises à 7 h 11 au § 3 de `plans de travail/PORTES-TERRAIN-2026-09-11-mots-depistage.md`**
> (porte relevée 5/5). Application au moment de l'écriture : **`1.129.1`**, build `0911-0644`,
> `main` = `origin/main` = `31d3cfe4`.
> Elle remplace la consigne des mots (livrée en `1.129.1`), archivée à côté sous
> `_ancienne-CONSIGNE-DU-JOUR-2026-09-11-mots-depistage.md`.
>
> **Remesure avant d'exécuter** : `git --no-optional-locks log --oneline -5`, `cat version.json`,
> `TZ=America/Toronto date`. ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.**
>
> ⚠ **C'est la queue du lot des mots, pas un lot neuf** : trois libellés que la consigne précédente
> t'avait dit de laisser dans le doute, et que Grégoire vient de trancher. Même périmètre, mêmes règles.

---

## AVANT TOUT — un commit documentaire séparé

Trois fichiers de Cowork sont modifiés, non commis : `plans de travail/PORTES-TERRAIN-2026-09-11-mots-depistage.md`
(relevée, décisions écrites), `plans de travail/CADRAGE-2026-09-10-ecran-de-reglage-du-depistage.md`
(§ 3, les décisions), et l'archivage de l'ancienne consigne. **Commets-les d'abord, seuls, `git add`
ciblé**, avec la présente consigne. Puis le lot.

---

## LOT A — le gabarit « Échelle de départ (IDME) » est renommé à la SOURCE

**Décision 3.1 de Grégoire** : « oui, renommer ». Dans `js/echelles.js`, le gabarit semé chez chaque
nouvel utilisateur : `nom: 'en Développement'` → **`'Développement'`**, `nom: 'Maîtrisé'` →
**`'Maîtrise'`** (l. ~99 et ~109 ; `'Incomplet'` et `'Étendu'` sont déjà bons), et sa description
(l. ~588) : « Insuffisant, en Développement, Maîtrisé, Étendu » → **« Incomplet, Développement,
Maîtrise, Étendu »**. Les codes I / D / M / E, l'identifiant du gabarit, les bornes : **intouchés**.

⛔ **LE STOCK NE BOUGE PAS — et c'est la mesure qui précède tout.** Le « versement des huit échelles »
(`echelles.js:740`, `#574`) écrit les gabarits dans `echellesTemplates` des utilisateurs. **Avant de
renommer, mesure comment il se comporte sur un espace qui a DÉJÀ sa copie** : s'il ne sème que ce qui
manque, le renommage ne touche que les prochains espaces — c'est ce que Grégoire a décidé. **S'il
réécrit une copie existante (par identifiant, par nom, à chaque chargement), ARRÊTE et dis-le** : le
renommage écrirait dans les données de tout le monde, et ça remonte à lui (« tarir n'est pas réparer »).
Une sentinelle doit verrouiller le cas : un espace qui porte déjà « Maîtrisé » le garde après le
versement.

**Ce que Grégoire assume, écrit au cadrage** : sa propre échelle dira « Maîtrisé » à côté d'une prose
qui dit « Maîtrise », jusqu'à ce qu'il la renomme lui-même dans Conception › Échelles.

## LOT B — le bilan de l'élève écrit « Incomplet »

**Décision 3.2** : « remplacer par incomplet ». `js/evaluation-retroaction.js:884`, la phrase du
critère algorithmique effondré : `…, Insuffisant)` → **`…, Incomplet)`**. En dur, comme aujourd'hui —
c'est son choix. ⚠ Conséquence à écrire dans le rapport, pas à corriger : pour un collègue dont
l'échelle nomme autrement son premier niveau, ce mot ne suivra pas son échelle, alors que le reste du
bilan la lit. Si un texte des essais attend « Insuffisant » ici, il suit.

## LOT C — les trois aides qui décrivent le gabarit suivent

**Décision 3.3** : elles suivent 3.1. `accompagnement-contenu-popup.js:182` (« 4 niveaux : Incomplet,
en Développement, Maîtrisé, Étendu » → « Incomplet, Développement, Maîtrise, Étendu »),
`popup.js:1070-1089` (l'exemple de plage « Maîtrisé, de 75 % à 89 % » → « Maîtrise… »),
`index.html:5327` (« Titre du niveau (ex : Maîtrisé) » → « (ex : Maîtrise) »). Mesure s'il en reste
d'autres qui citent le gabarit par ses anciens mots (le modèle de cartouches `cartouches.js:191` et le
pack démo `pack-demo-20.js` **restent hors périmètre** : ce sont des contenus, pas des descriptions du
gabarit — liste-les, ne les change pas).

## MESURE DUE, sans correction — ce qu'une grille partagée emporte

`partage-export.js` exporte les échelles comme pièces à part (l. 46, 106-109). **Mesure et écris au
rapport** : quand un collègue partage une grille, les noms des niveaux de son échelle voyagent-ils avec
elle ? Si oui, un destinataire pourra recevoir « Maîtrisé » d'un collègue et « Maîtrise » du gabarit.
Ce n'est pas un défaut à corriger ici ; c'est un fait que Grégoire doit connaître.

---

## CE QUI CHANGE À L'ÉCRAN — et qui doit être dit

Rien chez Grégoire ni chez les testeurs : leur échelle est du stock. **Un nouvel espace** recevra une
échelle de départ qui dit Développement / Maîtrise. Le bilan d'un élève dont un critère algorithmique
s'effondre dira « Incomplet ». Trois aides changent un mot.

⮕ **Release `patch`**, entrée de changelog (skill `release-et-changelog`) : une ligne — l'échelle de
départ et le bilan disent les mêmes mots que le reste de l'application.

⮕ **Aucune porte terrain.** Règle 1 du skill `portes-terrain` : une machine répond à tout ici (le
gabarit se lit dans le code, les aides aussi), et Grégoire ne crée pas de données fictives pour voir un
espace neuf ni un critère effondré — ça attend un cas réel. Écris-le dans le rapport de session plutôt
que de fabriquer une liste.

---

## CE QUI REMONTE À GRÉGOIRE

1. **Si le versement réécrit le stock** (lot A) : arrête, dis-le, ne renomme pas.
2. **Rien d'autre.** Le reste est technique : tranche, puis dis-le en une ligne en nommant ce que tu as
   supposé.

⛔ **Hors périmètre** : le modèle de cartouches et le pack démo, les clés `idme.*`, les noms de zones
(`#821`), la forme de l'écran (temps 4), le déplacement vers Suivi (temps 5), `#824`.
