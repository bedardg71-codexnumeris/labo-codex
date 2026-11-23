# Rapport – l'écran d'observation de « Par standards » (22 nov. 2026)

**Dernier relais** : branche `lot/observation-par-standards`, partie de `lot/vue-simple-criteres-cibles` (`70f811b1b`).
Arbre : `../labo-codex-observation`. Code et sentinelle faits ; Vitest vert. **Non fusionné, rien sur `main`, pas de
version.** Reste : rebaser sur la base une fois celle-ci en ligne (l'autre instance y a commité `7fb5f96bf`, 1.256.0),
puis le bump `minor` et la ligne de Nouvelles (O23) ; un passage WebKit (sentinelle d'intégration à écrire, captures pour
Cowork) APRÈS le verdict de l'autre instance ; l'essai de Grégoire sur iPad ; son feu vert.

Mandat : relayé par Cowork le 22 nov. 2026 (décisions de Grégoire : conception le matin, périmètre réduit à 10 h 24).
Mots : `TEXTES-2026-11-22-observation-par-standards.md` (tous proposés).

## Mesures d'abord (lecture seule)

1. **Le carrousel de l'évaluation** (`js/travaux-ui.js`, `genererBadgeFichierImporte`) est lié aux copies (fichier,
   évaluation, case de fusion, glisser) : il ne se réemploie pas sans copie, et en tirer un gabarit commun toucherait un
   écran en usage. Un carrousel léger propre à l'écran, qui en reprend la forme.
2. **Séance et présences** : une fiche de `presences` porte `da`, `date`, `periodesPresentes`, `coursId`. La règle « absent
   = fiche du jour à 0 période ; sans fiche, on ne dit rien » existe : `EquipesLogique.separerAbsentsDuJour`
   (`js/equipes.js`). Réemployée, filtrée sur le groupe actif. Une fiche n'existe que si les présences de la séance ont été
   prises : c'est ce qui fait foi de la séance (le calendrier n'est pas par groupe).
3. **Réunion de deux codex** : la liste se réunit par `id` (`js/codex.js`, `_comparerListeAId`). Le champ neuf voyage avec
   l'entrée ; il n'y a conflit que si un même `id` diffère des deux côtés, impossible puisqu'on ne réécrit aucune entrée.

## Ce qui a changé

- `js/pratiques/inscriptions-cibles.js` : le champ `origine` (production, observation, conversation) ; `lireOrigine` pour
  les inscriptions d'avant (production si elles en désignent une, observation sinon ; rien n'est réécrit) ; la règle
  d'acceptation élargie (niveau, texte OU critère renseigné) ; `vusALaDate` (le repère « vu aujourd'hui »).
- `js/tableau-cibles.js` : « Observer » au bandeau (deux vues) ; le menu de l'origine à trois valeurs ; l'historique et le
  profil disent l'origine (« Sans production » disparaît) ; l'aide des critères devient paramétrable.
- `js/observation-cibles.js` (neuf) : l'écran. `css/tableau-cibles.css` : ses styles (zones de 48 px, bouton collant au bas).
- Tests : `tests/unit/sentinelle-observation-par-standards.test.js` (neuf, 15 essais, cinq cassures jouées) ; deux attentes
  du lot 2 suivent la règle élargie et le champ neuf (unitaire et banc d'intégration, ce dernier non rejoué).

## Trouvailles (trois issues)

- **Inscrire et continuer** : une case qui n'a que des observations montre ✎ et parle de « remarques » (lecture au
  lecteur d'écran, question avant de retirer une cible). Le mot « remarque » couvre désormais aussi les observations.

## Suppositions nommées

- La fenêtre d'une case en vue simple n'offre pas d'origine : ce qu'elle inscrit se range « observation » (la règle du
  mandat pour une inscription sans production), et l'historique le dit désormais dans les deux vues.
- La date d'une observation est celle du jour, sans choix (une conversation d'hier s'inscrit au tableau, où la date se
  choisit). « Passer » n'écrit rien ; un·e absent·e n'est pas sauté·e d'office. Une seule cible ? Elle est choisie d'office.
- « Observer » prend le bouton principal du bandeau en vue étendue ; « Inscrire pour une production » passe en secondaire.
