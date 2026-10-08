# Consigne du jour – carte d'alignement, lots 1 et 2 : les mots de Grégoire, un défaut de relecture, puis arrêt

> Écrite par Cowork le 8 octobre 2026 à 19 h 06 (Toronto, mesurée par `date`). Remplace la consigne des lots 1 et 2, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-08-carte-lots-1-2.md`.

## Où on en est

Lots 1 et 2 commités sur `main` local (7745b1c7, 65c71613), relais en f0a936aa. Version en ligne : 1.191.1. Cowork a relu les deux commits : le tableau des raccourcis correspond au code, les champs `dateDebut` / `finTrimestre` sont bien ceux qu'écrit `sauvegarderCadreCalendrierV2`, le lien vise un champ qui existe. Un seul défaut, ci-dessous.

Grégoire t'autorise, en te transmettant cette consigne, à commiter cette consigne et son archive avec ton correctif.

## 1 · Les mots, validés par Grégoire (19 h 05)

Dans `RACCOURCIS_CARTE`, deux libellés changent ; tous les autres sont validés tels quels, ainsi que les « autres mots ajoutés » de ton rapport.

- `glisser` : « Déplacer un bloc ; par le cadre d'une leçon ou d'une séquence, tout le groupe suit »
- `recherche-echap` : « Recherche : refermer la liste ; une seconde fois, tout effacer »

Si un banc compare ces libellés au texte, mets-le à jour.

## 2 · Défaut de relecture – le lien de l'invitation en plein écran (ton lot, donc à finir)

Inférence de Cowork, non vue à l'écran : la palette du planificateur reste visible en « Vue plein écran ». Un clic sur « Cadre › Trimestre » appelle `naviguerVersReglagesTrimestre()` sans quitter le plein écran : `body.planif-plein-ecran-actif` reste posé, l'en-tête et la navigation restent masqués hors de la carte. Sur l'iPad, sans Échap, l'usager est coincé dans Cadre sans navigation.

- Vérifie d'abord l'inférence au banc. Si elle tient : `ouvrirCadreTrimestre()` quitte le plein écran avant de naviguer.
- Un essai au navigateur : plein écran actif, dates absentes, clic sur le lien → la navigation principale est visible et le champ « Début du trimestre » a le focus. Break-test.
- Si l'inférence ne tient pas, dis-le en une ligne et ne change rien.

## 3 · La ligne des Nouvelles

Propose-la dans ton rapport, non écrite dans `js/changelog-data.js` (skill `release-et-changelog`). Elle passe par Grégoire.

## 4 · Puis arrête-toi

Specs `planif-*` sous WebKit, Vitest complet. Un commit. **Pas de release, pas de push** : la suite (release minor, verdict avec Chrome et Safari fermés, push) viendra dans la consigne suivante, une fois la ligne des Nouvelles validée.

## Ton rapport à Grégoire

Court : ce que le correctif change à l'écran, en une phrase ; la ligne des Nouvelles proposée ; ce que tu as supposé, une ligne par supposition.
