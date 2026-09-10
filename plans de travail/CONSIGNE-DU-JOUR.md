# Consigne du jour — la carte des effets de l'écran de réglage du dépistage

> **Écrite le 10 septembre 2026 au soir par Cowork, sur une décision de Grégoire du même jour.**
> Elle remplace la consigne du lot A (source unique de qualification), **livrée en `1.128.4`** et
> archivée à côté sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-10-source-unique-qualification.md` —
> **commets l'archivage avec ton premier commit.**
>
> **Remesure avant d'exécuter** : `git --no-optional-locks log --oneline -5`, `cat version.json`,
> `TZ=America/Toronto date`.
> ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.**
>
> **Préalables de lecture** : `plans de travail/CADRAGE-2026-09-10-ecran-de-reglage-du-depistage.md`
> (le chantier dont ceci est le premier temps) et le **§ 8** de
> `Rapports/INVENTAIRE-2026-09-10-nomenclature-des-zones.md` (le tableau des divergences, livré au
> lot B). **Ne refais ni l'un ni l'autre.**

---

## POURQUOI

Grégoire veut refaire sur le **dépistage** ce qui a déjà été fait sur Cadre, Conception et
Évaluation, en préparation du travail d'automne avec l'orthopédagogue. Il commence par l'écran de
RÉGLAGE — `Labo › Outils d'observation` — « puisque c'est lui qui entraîne le suivi ».

Son mot sur cet écran : « un peu cacophonique ».

▣ **Il a aussi une proposition, et elle n'est PAS tranchée** : déplacer cet écran de `Labo` vers
l'onglet `Suivi`, « le réglage des paramètres de recherche dans l'onglet où les paramètres ont une
influence ».

▣ **Ordre qu'il a arbitré le 10 septembre** (« ta recommandation est bonne, suivons-la ») :
**trier le contenu d'abord, déplacer ensuite.**

⮕ **Ce lot produit la mesure qui manque pour trancher.** On ne sait pas où ces réglages agissent.
Les ranger dans `Suivi` affirmerait « ça agit ici » — sans l'avoir vérifié.

⮕ **Et c'est la moitié manquante du dossier de l'orthopédagogue.** Le § 8 dit quels mots divergent.
Cette carte dira **où l'enseignant les rencontre**. Un désaccord de quinze points sur « Favorable »
ne veut rien dire tant qu'on ignore sur quel écran il se lit.

---

## LE TRAVAIL — une carte, rien d'autre

**Pour CHAQUE réglage de l'écran, l'écran où son effet se voit.**

### Pars des réglages, pas des fichiers

L'écran porte une vingtaine de contrôles, relevés sur les captures de Grégoire du 10 septembre.
**Vérifie cette liste dans `index.html` avant de t'en servir** — elle est un point de départ, pas
une source :

- **Taxonomie SOLO** : activer l'observation de la structure · Développement des habiletés ·
  Observation des actions · Grille de critères pour le dépistage · Découpler P et N ·
  Fenêtre d'analyse des patterns · Progression des artefacts · Direction du risque ·
  Seuil de défi spécifique · Restaurer les valeurs par défaut
- **Micro-données ACP** : activer la cueillette · Unité d'affichage de l'assiduité ·
  Indicateurs visuels des seuils · Fragile si inférieur à · Acceptable si inférieur à ·
  Bon si supérieur ou égal à · Restaurer les valeurs par défaut · Graphiques d'évolution ACP ·
  Masquer les notes par travail
- **Intervention (RàI)** : appliquer une adaptation du modèle de la Réponse à l'intervention

### Le tableau attendu

| Réglage (son libellé à l'écran) | Ce qu'il écrit (clé) | Qui le lit | **Où l'effet se VOIT** | Visible ? |
|---|---|---|---|---|

⚠ **La colonne « Où l'effet se voit » se remplit en GESTES D'UTILISATEUR**, pas en noms de fichiers :
« Suivi › Profils individuels › carte Mobilisation », « Tableau de bord › Aperçu › légende ».
C'est cette colonne qui tranche la question de l'emplacement ; un nom de fichier ne tranche rien.

### ⚠ LE PIÈGE — « lu par du code » n'est pas « visible à l'écran »

Précédent mesuré : `interpreterPerformance` a été **supprimée** (`#542` lot 3) parce que son résultat
n'était lu nulle part, alors qu'elle avait l'air d'un consommateur. Et le lot A vient d'en retirer un
autre du même genre.

⮕ **Pour chaque consommateur, remonte jusqu'à un `innerHTML`, un `textContent` ou un rendu Chart.js.**
Si la chaîne s'arrête avant, la ligne est **« lu, jamais affiché »** — et c'est un résultat, pas un
trou dans la carte. Inscris-le et continue (`CLAUDE.md`, issue n° 2).

### Ce que la carte doit faire ressortir, sans le trancher

1. **Les réglages dont l'effet se voit HORS de `Suivi`** — s'il y en a. C'est le fait qui décide.
2. **Les réglages dont l'effet se voit à PLUSIEURS endroits**, et lesquels.
3. **Les réglages dont l'effet ne se voit nulle part.**
4. **Ce que restaure chacun des DEUX boutons « Restaurer les valeurs par défaut »** : deux boutons
   identiques, dans deux sections, sans dire ce qu'ils touchent. Un utilisateur peut croire qu'il
   remet tout à zéro.

---

## ⛔ CE QUE CETTE CONSIGNE NE FAIT PAS

1. **Elle ne renomme rien**, ni à l'écran ni dans les clés.
2. **Elle ne déplace aucun réglage, aucun bloc, aucun écran.** ⚠ `js/navigation.js` et `js/config.js`
   sont des **zones protégées** (`CLAUDE.md`) : on n'y touche pas, et surtout pas dans un lot de mesure.
3. **Elle ne corrige aucun des trois défauts trouvés au lot B** — « Assiduité critique » sous deux
   bornes, la borne à 60 % que les curseurs n'atteignent pas, le palier « Insuffisant » inatteignable
   (`#822`). **Chacun demande de choisir laquelle des deux règles est la bonne : c'est de la
   pédagogie, et ça attend l'automne.**
4. **Elle n'écrit dans aucune donnée d'utilisateur.**

⮕ **Livrable : un document. Zéro ligne de `js/` modifiée.** Si un fichier de `js/` change, c'est un
défaut de périmètre.

---

## OÙ ÉCRIRE, ET COMMENT FERMER

Une section neuve dans `plans de travail/CADRAGE-2026-09-10-ecran-de-reglage-du-depistage.md`,
qui remplace son § 4 (« mesure incomplète, à finir avant tout déplacement »).

⮕ **Un audit n'est pas terminé quand il est déposé** (`CLAUDE.md`) : chaque constat porte, DANS le
fichier, l'une de trois dispositions — *inscrit* (n°), *refusé* (motif), *périmé*.

**Commit `docs`, pas de bump, pas de porte terrain** (rien ne bouge à l'écran, et une machine peut
répondre : règle 2 du skill `portes-terrain`).

⚠ **Trois documents de Cowork attendent ton commit** : `plans de travail/00-CADRAGES-OUVERTS.md`
(modifié — il porte l'arbitrage de Grégoire sur l'ordre), l'archivage de la consigne précédente, et
celle-ci.

⚠ **`CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` porte encore l'état mesuré de `1.128.3`.** Sa remise à
jour te revient (`PROTOCOLE.md`, « qui écrit quoi ») ; le MANDAT reste à Cowork.

---

## CE QUI REMONTE À GRÉGOIRE

**Rien de ce lot.** Il est mesurable de bout en bout : tranche, puis dis-le en une ligne en nommant ce
que tu as supposé.

**Une seule exception** : si la carte montre qu'un réglage agit sur **une note** — et non sur un
diagnostic — dis-le tout de suite et **n'y touche pas**. Le lot A a mesuré que `defiSpecifique` et
`idme.*` n'entrent dans `pratique-pan-standards.js` que par deux fonctions de diagnostic
(`_diagnostiquerForcesChallenges`, `_identifierPatternActuel`). **Si cette mesure est fausse, c'est le
fait le plus important de la journée.**
