# Plan du lot `lot/journees-reprise` — la reprise décide du calcul (19 nov. 2026)

**Branche** `lot/journees-reprise`, partie d'`origin/main` (`03dc7d2f`). Pas de fusion, pas de release.
**Consigne** : mandat du 19 nov. 2026 (décision de Grégoire avec Cowork). Bogue vécu le 18 nov. : grève
mar. 10 et ven. 13 nov., sans reprise.

## Mesure de départ (sur `origin/main`)

Cadre A2026 des bancs (`sentinelle-paquet-de-5-368`), Fête du travail et Journée Carrière avec reprise :

| Journées 10 et 13 nov. | 13 nov. | 16 nov. | 17 nov. | 18 nov. |
|---|---|---|---|---|
| aucune (calendrier officiel) | S11 (reprise) | S12 | S12 | S12 |
| « Institutionnel », sans reprise | congé | **S11** | **S11** | S12 |
| « Personnel », sans reprise | S11 · Grève | S12 | S12 | S12 |

Fait : avec « Institutionnel », la semaine 12 démarre le mercredi 18 nov. (le mandat dit jeudi ; inférence :
tes données réelles diffèrent d'un jour du banc, sans effet sur le diagnostic).

## La règle

Un événement sort du compte « paquet de 5 » **si et seulement s'il porte une `dateReprise`**. Sans reprise, le
jour reste compté et s'affiche avec son numéro de semaine et son motif. `categorie` ne gouverne plus rien et
n'est plus écrite. Préséance congé > reprise inchangée (13 nov. : la grève l'emporte sur la reprise de la
Journée Carrière).

## Étapes, un fichier à la fois

1. `js/trimestre.js` — passe 1 : `compte = false` si `mapConges[d].dateReprise`. Passe 2 : le jour de congé
   sans reprise porte `nonReprise: true` et son `numeroSemaine` ; le champ dérivé `categorieEvenement` est
   retiré. Le `console.warn` « personnel avec reprise ignorée » (convention §3.0) tombe : une reprise saisie
   est désormais honorée, quelle que soit l'étiquette du stock.
2. `js/calendrier-vue.js` + `styles.css` — label « S11 · Grève » et classe sur `nonReprise` ;
   `calendrier-jour-conge-personnel` renommée `calendrier-jour-conge-non-reprise`.
3. `index.html` — le menu « Nature » cède la place à la question « Cette journée sera-t-elle reprise ? »
   (deux boutons radio : « Oui », « Non, le cours est perdu ») ; commentaire de la carte réécrit.
4. `js/trimestre-v2-init.js` — `BADGES_NATURE_V2` → badge unique « Non reprise » ; le choix se déduit de
   `dateReprise` (modifier : présente → Oui, sinon Non) ; Oui : horaire et date obligatoires ; Non : masqués
   et vidés ; `categorie` n'est plus écrite. `styles.css` : les trois badges de nature retirés, un seul
   badge `badge-non-reprise`.
5. Aide — `journee-sans-cours` réécrite (texte du mandat) ; infobulle `reglages-trim-conges` (« Tes congés
   fériés… ») alignée.
6. Tests — 368 réaligné ; sentinelle neuve du cas vécu (10 et 13 nov. sans reprise = numéros officiels ;
   même journée avec reprise = décalage ; étiquette inerte) + break-test ; 399 sans `categorie` ;
   `portes-relais-cadre.spec.js` (#374, partie 3) sur la question ; 374 inchangée (la migration recopie le
   stock tel quel, `categorie` comprise).

## Ce que je suppose (dis-le si c'est faux)

- **Formulaire d'ajout : aucune réponse pré-cochée.** L'ancien défaut « Institutionnel » décidait le calcul
  à la place de l'enseignant·e ; un défaut « Non » referait la même chose dans l'autre sens. Sans réponse,
  le formulaire le dit : « Indique si cette journée sera reprise. »
- **Modifier une journée réécrit sa fiche sans `categorie`** (comme aujourd'hui, la fiche est reconstruite
  champ par champ). Ce n'est pas une migration : seul le geste de l'utilisateur la réécrit.

## Le stock

Rien n'est écrit dans les données. Chez un testeur, une journée « Institutionnel » ou « Férié » sans reprise
cesse de décaler : conséquence assumée, à écrire au changelog à la release. Le calendrier se régénère au
démarrage (`initialiserModuleSaisiePresences`, `main.js:1245`) : le Mac change sans geste.

## À mesurer, pas à corriger

Une reprise placée après la fin du trimestre (le 24 déc.) : le rapport dira si elle est ignorée en silence.
