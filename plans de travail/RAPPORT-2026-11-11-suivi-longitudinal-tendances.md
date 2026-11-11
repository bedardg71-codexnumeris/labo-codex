# Rapport — Suivi longitudinal, lot 1 : l'onglet « Tendances » (11 nov. 2026)

**Dernier relais.** Branche `claude/lot-suivi-longitudinal-tendances-wi505g` (la consigne nommait
`lot/suivi-longitudinal-tendances` ; la session nuage ne pousse que sur la sienne), partie de `main` à `9aa3ff284`.
PR d'aperçu, à NE PAS fusionner (ordre de Grégoire, 11 nov., 12 h 17). Aucune release, aucune ligne de Nouvelles.
**Fait** : les deux onglets de la section, le nuage de points, les filtres, la bulle, « Voir son dossier », « Ce que ça dit ».
**Reste** : le passage sous WebKit (Mac) ; la relecture des mots par Grégoire ; le lot 2 (graphiques par critère,
mentions « échec » et « abandon », après la copie des productions retenues).

## Ce qui a été tranché (consigne, point 2) — corrigeable

- Note de 101 : `indices.cp.actuel.P` du dossier de 101, lue par la règle du dossier déplié (`noteConstructible`
  absent = constructible ; `false` sur `actuel` ou `details` = non placé·e, compté·e dans la troisième phrase).
- Deux dossiers de 101 : le plus récent (année, puis hiver < été < automne) ; la bulle le dit.
- Deux résultats du même cours : le plus récent par le trimestre en texte libre (« H2026 », « Hiver 2026 », « A25 ») ;
  un trimestre illisible passe pour le plus ancien ; à égalité, le dernier saisi.
- Cohorte : le trimestre du dossier de 101 retenu ; saison lue dans son nom, puis son id.
- Sans dossier de 101 : d'aucune cohorte, ni placé·e ni compté·e.
- Note hors de l'échelle (101 sous 50, suite sous 40) : bille au bord, la bulle donne la vraie note et le dit.
- Sans cohorte d'automne, la sélection par défaut est « Toutes ».
- Limite connue, non corrigée : pour l'A2024, P n'est pas toujours la note transmise.

## Mots qui diffèrent de la consigne, ou qui s'y ajoutent (à relire par Grégoire)

- Accords de la première phrase : « 1 des 5 étudiant·es […] a aussi réussi », « Aucun·e des 4 étudiant·es qui ont réussi
  ton 101 n'a réussi le 102. », « L'étudiant·e qui a réussi ton 101 a aussi réussi / n'a pas réussi le 102. »,
  « Aucun·e des étudiant·es affiché·es n'a réussi ton 101. »
- « Avec 1 étudiant·e, … » ; « 1 étudiant·e, c'est peu » ; « 1 inscrit·e n'a pas de note de 101 calculable et n'est pas placé·e. »
- Nuage sans bille : « Aucune note de {cours} pour les cohortes cochées. »
- États vides : « Aucun·e étudiant·e inscrit·e au registre. Inscris d'abord des étudiant·es dans l'onglet « Registre »,
  puis saisis-y leurs notes de 102 ou de 103. » ; « Aucune note de 102 ou de 103 au registre. Saisis les notes de tes
  étudiant·es dans l'onglet « Registre » : elles apparaîtront ici. »
- Bulle : « Son 101 le plus récent (2 dossiers de 101 au registre). », « Sa note de 102 la plus récente (2 au registre). »,
  « Bille posée au bord : sa note sort de l'échelle du nuage. »
- Légende : « Automne 2025 (3 billes) », « Anneau blanc : la bille touchée », « Pointillé : le seuil de réussite, 60 ».
- En anonymisation, le pseudonyme reste « Élève R… » : c'est celui du registre (28 sept.), non retouché ici.

## Technique

- `js/suivi-tendances.js` (neuf) : calcul pur + rendu par le DOM (`textContent`, pas d'`innerHTML` : c'est ce qui tient lieu
  d'`echapperHtml`, comme dans le registre). Lecture seule. Seuils dans `SEUILS` ; le 60 vient de `window.NOTE_DE_PASSAGE`.
- `js/registre-longitudinal.js` : les onglets (`choisirOngletLongitudinal`), `ouvrirDossierLongitudinal`. L'écran
  « Registre » garde sa structure (ses zones restent les enfants directs du conteneur).
- La bille porte `.barre-etudiant` (seule source de la sphère) ; la teinte de cohorte est multipliée au dégradé.
  Palette de huit teintes, variables bornées à la section.
- Jetons `?v=20261110t` (styles.css, registre-longitudinal.js, suivi-tendances.js) : libres sur les 42 branches d'origin.

## Tests

- Vitest `sentinelle-suivi-tendances-lot1` : 31 essais. Suite complète : 917 fichiers, 11 411 essais, verts.
- Chromium `suivi-tendances-lot1.spec.js` : T1 à T5 verts (T6 = les captures, sur demande).
- Break-tests : 20 mutations (27 passages), toutes rouges puis restaurées — dossier récent, non constructible, 60 réussit,
  Pearson, seuils 0,5 et 15, accord, non placé·es, Automne par défaut, saison exacte, nom de la bulle, second toucher,
  anonymisation, « Voir son dossier », onglet, lecture seule, sphère recopiée, survol hors média, bille animée, bulle hors cadre.
- Captures : `plans de travail/captures-2026-11-11-suivi-tendances/` (1180 × 820 et 820 × 1180, clair et sombre, noms fictifs).

## Trouvailles (les trois issues)

- `registre-longitudinal-915.spec.js` R5 est rouge sous Chromium SUR `main` aussi (une tuile bouge de 2 à 4 px) : code
  étranger, WebKit est le juge. **Inscrire et continuer** — à vérifier au verdict du Mac, pas d'item sans symptôme vécu.
- `.onglet-developpement-tab:hover` et `.rl-resultat-bouton:hover` vivent hors de `@media (hover: hover)` (#540) : étranger.
  **Commenter et oublier** ici ; les onglets neufs ont leurs propres règles, sous la garde.
