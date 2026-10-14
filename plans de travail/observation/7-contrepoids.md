# Contrepoids : les deux bornes de la finalité, et la place de A et de B

Sources lues : `lecture/observation.md`, `lecture/finalite-A.md`, `lecture/finalite-B.md`. Rien d'autre.

**Conventions.**
- Les renvois « l. N » désignent une ligne de `observation.md`. Chacun est précédé de la section et du geste.
- **[O]** observé, à l'exécution ou dans le code, tel que le document le rapporte. **[I]** inféré directement. **[H]** hypothèse.
- Toutes les données observées sont fictives (Conditions d'observation, l. 9). Un état de départ a été créé par le banc d'essai, et le programme a été servi depuis `127.0.0.1` (l. 8).
- Les textes affichés à l'écran sont des sorties du programme. Je les cite comme tels et je ne m'en sers pas pour établir ce que le programme fait.

---

## 1. Les deux bornes, en une phrase chacune

**Borne la moins flatteuse.**
> Le programme sert une seule personne enseignante à tenir une fiche par étudiant·e (présences, remises, niveaux par critère, et, si elle les saisit, parcours scolaire et catégories d'apprentissage ou de santé), à en tirer automatiquement une note et un classement par niveau de « besoin d'intervention », et à garder ces fiches d'un trimestre à l'autre ; les sorties observées destinées aux étudiant·es (« Dossier PDF », « Exporter pour Léa ») ne montrent pas ce classement, et aucun écran destiné aux personnes classées n'a été observé.

**Borne la plus flatteuse.**
> Le programme est un poste de travail personnel et local où une personne enseignante prépare, évalue et rend des travaux avec une rétroaction écrite par critère, voit où en est son groupe, et compare d'autres façons de calculer les notes ; tout reste sous son contrôle : aucune donnée ne part sans son geste, de nombreuses suppressions sont ralenties par une proposition de sauvegarde, et seul le matériel pédagogique (non les données d'étudiant·es) est fait pour circuler, signé et sous licence.

Ces deux phrases décrivent les mêmes écrans. Elles diffèrent par ce qu'elles mettent au premier plan : le classement des personnes d'un côté, la maîtrise locale de l'outil de l'autre.

---

## 2. Borne la moins flatteuse : appuis

### 2.1 Les faits qui la portent

1. **Tout entre par les gestes de l'enseignant·e.**
   - Cadre › Groupe d'étudiant·es › « Prévisualiser » / « Confirmer » : DA, groupe, nom, prénom, programme, SA (l. 383-392) — [O].
   - Suivi › Saisie des présences › champ de périodes et champ de notes (l. 1985-1992) — [O].
   - Évaluation › Évaluer › listes de niveau `#eval_*` (l. 1446-1454) — [O].
   - Aucun écran de saisie destiné à un·e étudiant·e n'est rapporté. C'est une absence d'observation, donc [I]. Elle vaut pour les écrans parcourus (Accueil, Cadre, Conception, Évaluation, Suivi, Labo, Aide, Réglages ; En-tête › Barre de navigation principale, l. 48).

2. **Le classement est calculé sans qu'on le demande.**
   - Suivi › Suivi du groupe › « Affichage de l'écran » : A, C, P et les patterns RàI sont recalculés et réécrits à chaque affichage (l. 1784) — [O, code], confirmé par Transversal › Suivi (l. 2784).
   - Bandes « Fragile … Très favorable », patterns « Progression stable / Défi spécifique / Difficulté émergente / Difficulté persistante », niveaux RàI 1-2-3 (l. 1787-1789) — [O].
   - `activerRai:true` et `depistageAcp:true` sont les valeurs écrites au premier enregistrement des préférences (Réglages › Préférences, l. 2418) — [O].

3. **Le classement porte sur très peu de données.**
   - Suivi › Suivi du groupe : un·e étudiant·e dont P = 51 % sur une seule production est classé·e « Niveau 3 / Difficulté persistante » (l. 1789) — [O].
   - Suivi › Profil › Accompagnement : la même personne reçoit « Niveau 3 - Intensif … Interventions recommandées : Rencontrer l'étudiant·e pour comprendre les absences/non-remises » (l. 1933) — [O]. La rubrique « Interventions recommandées » est une sortie du programme.

4. **Le classement ordonne les personnes.**
   - Suivi › Suivi du groupe › « Détails » et boutons de filtre : « P < 65% », « A ou C < 70% », « RàI 2-3 » ; tri par score d'urgence (l. 1798-1804) — [O].

5. **Les seuils qui produisent ces classes ne sont pas bornés.**
   - Labo › Outils d'observation › champs numériques de seuils : « fenêtre = 99 » est acceptée (les bornes HTML ne sont pas appliquées par le code) (l. 2204) — [O].

6. **Le programme peut recevoir des données sensibles sur chaque étudiant·e.**
   - Suivi › Profil › « Confidentiel » : parcours (« Échec », « Abandon », « Décrochage »), « Défis particuliers », catégorie et sous-catégorie (« apprentissage → Dyslexie » observé ; listes fixes pour sensorielle, neurologique, organique, santé mentale, lues dans le code), notes (l. 1944-1946) — [O].
   - Ces champs sont facultatifs et sont saisis par l'enseignant·e ; le document ne dit pas qu'ils soient exigés.

7. **Les fiches durent plus que la suppression apparente.**
   - Cadre › Groupe d'étudiant·es › menu « Action » › « Supprimer » : le DA et la date sont écrits dans `a2026_elevesDesinscrits` (l. 399) — [O].
   - En-tête › Anonymisation : les tables de correspondance restent après le retour au mode normal (l. 121) — [O].
   - Suivi › Interventions › « Supprimer » : les présences déjà reportées ne sont pas retirées (l. 2091) — [O, code].
   - Évaluation › Évaluer › niveaux : le nom de l'étudiant·e est recopié dans chaque évaluation (`etudiantNom`) et chaque évaluation a son journal (l. 1454, 1458) — [O].

8. **Les fiches s'accumulent d'un trimestre à l'autre.**
   - Labo › Suivi longitudinal › « Inscrire au registre » : « une copie figée de leur dossier, et les notes qu'ils obtiennent ensuite » ; évaluations, présences, interventions, captures et indices sont copiés (l. 2373-2377) — [O]. Le geste d'inscription est requis ; la copie n'est pas automatique.
   - Transversal › Suivi : une capture hebdomadaire des indices est prise d'elle-même si celle de la semaine manque (l. 2791) — [O, code].

9. **Ce que les étudiant·es reçoivent ne montre pas le classement.**
   - Évaluation › Liste des évaluations › « Dossier PDF » : rétroaction par critère, bandeau de niveau, progression, « Note provisoire — peut changer selon tes prochains travaux. » ; ni A, ni RàI, ni pattern (l. 1357) — [O].
   - Évaluation › Exporter et archiver › « Exporter pour Léa » : copie annotée et évaluation (l. 1733) — [O].
   - Qu'elles et ils voient le classement par une autre voie, l'observation ne le dit pas (voir § 6).

10. **L'export dit « anonymisé » garde des éléments qui relient aux personnes.**
    - Réglages › Données › « Générer l'export anonymisé » : le fichier garde `programme` et `services_adaptes` et exclut DA et noms ; la table de correspondance avec la clé secrète en clair est téléchargée au même clic (l. 2492-2496) — [O].
    - Le même export laisse `snapshots_hebdomadaires: []` alors que 15 captures existent (l. 2491) — [O].

### 2.2 Passages d'observation.md qui la contredisent ou la limitent

- **Rien ne part sans geste.**
  - Conditions d'observation › Réseau : la seule requête sans geste est `GET version.json` ; aucun `XMLHttpRequest`, `WebSocket`, `sendBeacon` ou `EventSource` hors `libs/` (l. 12) — [O].
  - Ce qui sort passe par un téléchargement, le presse-papiers ou un `mailto:` déclenché par l'enseignant·e ; le rapport de bogue initial ne contient « Aucun nom ni DA » (En-tête › « Signaler un bug », l. 96) — [O].
  - Le classement n'est donc observé qu'à l'écran de l'enseignant·e. Aucun envoi à un tiers n'a été observé.
- **Les données « Confidentiel » n'ont pas été vues dans les calculs.**
  - Suivi › Suivi du groupe › « Affichage de l'écran » : la liste des clés lues (`groupeEtudiants`, `presences`, `seancesCompletes`, `indicesAssiduite`, `indicesCP`, `evaluationsSauvegardees`, `productions`, …) ne comprend pas `confidentielEtudiants` (l. 1783) — [O, code].
  - Suivi › Profil › Accompagnement n'affiche que « Services adaptés : SA » tiré de la liste d'étudiant·es (l. 1933) — [O].
  - L'absence d'usage ne prouve pas l'absence d'usage dans un chemin non parcouru.
- **Le programme s'abstient parfois de classer.**
  - « Données insuffisantes » (niveau 0) quand aucune production n'est évaluée (l. 1789, 2065) — [O].
  - Pas de note « tant qu'un critère est sans niveau » (Évaluation › Évaluer, l. 1449) ; « non constructible » plutôt qu'un chiffre sans pratique appliquée (l. 1430, 1769) — [O].
- **Les seuils sont ceux de l'enseignant·e.** Labo › Outils d'observation : les seuils et la fenêtre sont modifiables, et il existe des boutons « Remettre les valeurs par défaut » (l. 2200-2211) — [O]. Le classement dépend de ces réglages.
- **L'effacement complet existe.** Réglages › Données › « Réinitialiser toutes les données » : après « EFFACER », 142 entrées passent à 99, et toutes les clés `a2026_*` disparaissent (l. 2536-2537) — [O]. Cadre › Trimestre › « Supprimer… » : « 6 clés de données effacées » (l. 320) — [O].
- **Une partie des restes est mince.** `a2026_elevesDesinscrits` contient le DA et une date, sans nom (l. 399) — [O].
- **Le registre longitudinal demande un geste** (Labo › Suivi longitudinal › « Inscrire au registre », l. 2376) — [O].
- **Le texte « Ces informations sont stockées localement et ne sont jamais partagées »** (Suivi › Profil › « Confidentiel », l. 1944) est une sortie. Elle ne prouve rien. Le programme n'a pas été observé en train de partager ces informations, mais l'observation ne dit pas non plus si `confidentielEtudiants` entre dans `donnees.json` du codex (l. 2468) — voir § 6.

### 2.3 Formulations plus dures, écartées

- **« Outil de surveillance des étudiant·es. »** Écartée. Aucune donnée ne remonte seule (l. 12), aucun écran étudiant n'existe (§ 2.1, point 1), et toutes les données viennent de gestes de l'enseignant·e. « Surveiller » demanderait que le programme observe les personnes par lui-même.
- **« Outil de surveillance de l'enseignant·e. »** Écartée. Le chronomètre est désactivé par défaut (`chronoEvaluation:false`, l. 2194, 2421) et les 20 derniers clics ne figurent que dans le texte d'un rapport de bogue ouvert par l'enseignant·e (l. 94-96, 2739).
- **« Collecte de données pour un tiers ou pour la recherche. »** Écartée. L'export « anonymisé » et le « codex data » existent (l. 2490-2496, 2583), mais aucune remise à qui que ce soit n'est observée.
- **« Le programme exclut ou sanctionne des étudiant·es. »** Écartée. Les statuts « inactif » et « décrochage » sont posés par l'enseignant·e, après un `confirm` (Cadre › Groupe d'étudiant·es › menu « Remarque », l. 406-407). Aucune conséquence autre qu'un retrait des calculs de groupe n'est observée.
- **« Le classement tient compte du handicap ou de la santé. »** Écartée, pour la raison donnée au § 2.2 (clé non lue).

---

## 3. Borne la plus flatteuse : appuis

### 3.1 Les faits qui la portent

1. **Tout est local, rien ne part seul.**
   - Stockage › vue d'ensemble : tout est écrit dans IndexedDB `MonitoragePedagogique` avec une copie dans `localStorage` (l. 39) — [O].
   - Conditions d'observation › Réseau : seule requête sans geste, `GET version.json` ; le chargement initial émet 289 requêtes, toutes vers les fichiers du dépôt (l. 12) — [O].
   - Chargement global › CSP `default-src 'self'` (l. 2595) — [O, code].

2. **La perte est rendue difficile, sans être interdite.**
   - Cadre › Cours › « Supprimer », Enseignant·e › « Supprimer », Groupe d'étudiant·es › menu « Action » › « Supprimer » : la boîte « Écrire un codex avant de supprimer ? » précède un `confirm` (l. 356, 379, 399) — [O].
   - Cadre › Groupe d'étudiant·es › « Supprimer le groupe… », Trimestre › « Supprimer… », Réglages › « Réinitialiser toutes les données » : un codex à part doit être écrit d'abord. Quand l'écriture est refusée (`AbortError` du sélecteur natif en Chromium sans tête), « aucune donnée effacée » (l. 413, 2533) — [O]. Quand l'écriture passe par le téléchargement, la suite exige la saisie du nom exact ou de « EFFACER » (l. 318-320, 2534-2536) — [O].
   - Cadre › Cours › « Supprimer » : un cours qui porte des données ne peut pas être supprimé (l. 355) — [O].
   - Accueil › « Ton codex » : rappel de sauvegarde tous les 14 jours par défaut (l. 187-192) — [O].

3. **L'évaluation produit une rétroaction écrite par critère.**
   - Évaluation › Évaluer › listes de niveau : une note recalculée à chaque niveau, une rétroaction qui se rédige à partir des commentaires de la cartouche, enregistrement différé de 1,5 s (l. 1446-1454) — [O].
   - Évaluation › Liste des évaluations › « Dossier PDF » : « RÉTROACTION PAR CRITÈRE » avec pastille de niveau et commentaire par critère (l. 1357) — [O].
   - Évaluation › Évaluer › « Copier » (rétroaction) et « Copier tout » (l. 1500-1509) — [O].

4. **Le calcul se montre et se retient quand il manque des données.**
   - Évaluation › Évaluer : « Pas de note tant qu'un critère est sans niveau — … la note ne porterait que sur 25 % de la grille » (l. 1449) — [O].
   - Suivi › Profil › Productions : « (82.8 × 50 + 89.3 × 50) ÷ 100 = 86.0% » et « Note provisoire = moyenne pondérée de 2 évaluations » (l. 1924) — [O].
   - Export de synthèse CSV : statut « non constructible » plutôt qu'une note inventée (l. 1430-1431) — [O].

5. **Les pratiques de notation sont multiples, et comparables sur les mêmes parcours.**
   - Conception › Pratiques de notation › assistant : parcours SOM, STD, SPE, DEN et « Partir d'un modèle » (l. 1094-1135) — [O].
   - Labo › Exploration des pratiques › comparateur : mêmes profils pour toutes les colonnes ; avec l'échelle de base, SOM donne 51 / 69 / 83 / 91 / 66 et STD / SPE « non constructible » (l. 2244-2249) — [O]. Ce que le comparateur produit est observé. Son effet sur les pratiques réelles ne l'est pas.

6. **Seul le matériel pédagogique est fait pour circuler, et avec des contrôles.**
   - Réglages › « Exporter ma config » : description et case de licence obligatoires ; matériel de démonstration et importé exclu (l. 2444-2447) — [O].
   - Réglages › Partage entre collègues : paquets `.lcz` signés (ECDSA P-256) ; signature invalide → « Rien n'a été importé » ; changement de clé → fenêtre d'avertissement avec « Refuser l'import » (l. 2541-2552) — [O].
   - Les données d'étudiant·es : seul l'export « anonymisé » est destiné à sortir (l. 2490-2496). Le « codex data » porte l'avertissement « contient des données personnelles d'étudiant·es. Ne le partage pas tel quel. » (l. 2583, sortie).

7. **Défauts qui allègent la saisie.**
   - Suivi › Saisie des présences : tout le monde à 2/2 par défaut ; « ✓ 2 pér. » (l. 1983, 1996-1998) — [O].
   - Évaluation › Liste › « Évaluer » : groupe, étudiant·e, production, grille, échelle, cartouche présélectionnés (l. 1442) — [O].

8. **L'enseignant·e a des outils sur sa propre pratique.**
   - Labo › Rythme de travail, Études, Bilan réflexif (l. 2262-2369) — [O]. Le chronomètre est désactivé par défaut (l. 2194, 2421).

9. **Un second rôle est outillé.**
   - Suivi › Rencontres › « Créer mon service d'orthopédagogie » (l. 2101-2123) — [O].

10. **Les noms peuvent être masqués.**
    - En-tête › Anonymisation : « Élève 1, Élève 3, … » à l'écran (l. 120-122) — [O].

### 3.2 Passages d'observation.md qui la contredisent ou la limitent

- **Sa partie « suppressions ralenties » ne vaut pas partout.**
  - Les boîtes de suppression offrent un bouton « Supprimer sans codex » (l. 356, 379, 399, 1229, 2091) — [O]. Le codex n'est imposé que pour un groupe, un trimestre, un groupe-cours et la réinitialisation complète (l. 413, 439, 2533) — [O].
  - Une pratique appliquée se supprime sans avertissement supplémentaire et laisse un `pratiqueId` orphelin (Conception › Pratiques › « Supprimer », l. 1230) — [O].
  - Un résultat longitudinal se retire « sans confirmation » (Labo › Suivi longitudinal › « Retirer », l. 2385) — [O].
  - La formulation de la borne dit donc « de nombreuses suppressions », pas « toutes ».
- **Le classement automatique est présent aussi sous cette borne.** Les points 2 à 4 du § 2.1 restent vrais : le contrôle local (rien ne part seul) ne dit rien de ce qui est calculé sur les personnes.
- **Des traces survivent à des suppressions** (§ 2.1, point 7) — [O]. La « maîtrise » n'est donc pas complète.
- **« Anonymisé » est partiel** (§ 2.1, point 10) — [O]. La démo se déclare « 10 étudiants anonymisés » (l. 2731) alors qu'elle contient « les noms de personnalités publiques » (l. 214) — [O].
- **Plusieurs gestes annoncés échouent ou sont incomplets** : tri des productions (l. 837), import du questionnaire de bilan (l. 2324), import et démonstration des résultats du bilan (l. 2358-2359), déverrouillage immédiat d'une évaluation (l. 1461), corbeille de la carte (l. 706), et l'écran « ZIP léger… » qui produit un JSON et un TXT (l. 2448) — [O]. Ces échecs limitent ce qu'on peut dire de la « fiabilité » de l'outil.
- **La rétroaction « rendue » n'est pas observée comme rendue.** Le PDF et le texte sont produits et téléchargeables ; leur remise réelle à l'étudiant·e ne l'est pas (§ 6) — [I] pour le destinataire (ton à la deuxième personne, libellé « pour téléversement dans Léa » : deux sorties du programme).
- **Un graphique ne montre pas les valeurs stockées.** Suivi › Suivi du groupe › « Développement du groupe, semaine par semaine » : décalage aléatoire `(Math.random() − 0.5) × 0.03` à chaque rendu (l. 1790) — [O].

### 3.3 Formulations plus flatteuses, écartées

- **« Il améliore l'apprentissage ou la réussite des étudiant·es. »** Écartée. Aucun fait d'observation n'établit un effet. Les phrases du type « Mes standards sont très élevés à ton égard parce que je crois que tu as tout ce qu'il faut… » (Évaluation › Évaluer › radio « Bilan », l. 1505) et « pistes de réflexion, pas des preuves » (Labo › Études › aide, l. 2293) sont des sorties.
- **« Il protège la vie privée des étudiant·es. »** Écartée comme résultat. Le stockage local et l'absence d'envoi automatique sont observés ; les restes après suppression, le codex non chiffré (`donnees.json`, 49 clés, pas de chiffrement ni de signature, l. 2468) et la table de correspondance en clair (l. 2492) limitent « protège ». La borne garde donc « aucune donnée ne part sans son geste », qui est observé, et pas « protège ».
- **« Il fait gagner du temps. »** Écartée. Les défauts qui réduisent les gestes sont observés (§ 3.1, point 7). Le temps gagné ne l'est pas : le chronomètre est désactivé par défaut et rien n'a été mesuré.
- **« Il rend le calcul transparent. »** Écartée en général. Quelques calculs sont montrés (§ 3.1, point 4). D'autres écarts existent : « (50.8 × 50) ÷ 50 = 50.7% » (Suivi › Profil › Productions, l. 1926), assiduité d'une séance non saisie affichée à 100 % alors qu'elle n'entre pas dans le taux (Suivi › Saisie des présences, l. 1983, 2021) — [O].
- **« Il respecte le cadre légal ou le consentement. »** Écartée. L'observation ne porte pas sur le consentement ni sur le cadre institutionnel.

---

## 4. Les bornes sont-elles également appuyées ?

- **La borne basse repose surtout sur du [O].** Le classement automatique, les données sensibles possibles, les restes après suppression et le registre sont rapportés comme observés. Deux éléments sont [I] : l'absence d'écran destiné aux personnes classées (absence d'observation) et la lecture de « Dossier PDF » comme preuve que le classement n'est pas montré (il n'est pas dans ce PDF ; une autre voie n'est pas exclue).
- **La borne haute repose surtout sur du [O].** Le fonctionnement local, l'absence d'envoi automatique, les freins à la suppression, la rétroaction par critère, le comparateur et le contrôle du partage sont observés. Elle est moins solide sur un point : elle n'a pas de fait qui établisse un bénéfice pour les étudiant·es ou pour les pratiques réelles. J'ai donc retiré de la phrase toute mention d'un bénéfice (voir § 3.3) plutôt que de l'étayer par des sorties.
- **Dissymétrie à signaler.** La borne basse peut s'énoncer avec des verbes d'action du programme (calcule, classe, garde). La borne haute, une fois ses promesses d'effet écartées, s'énonce par des propriétés de l'outil (local, sous contrôle, rien ne part seul). Les deux sont également ancrées dans les faits ; elles ne disent pas le même genre de chose.

---

## 5. Où se situent A et B

### 5.1 Les deux formulations

- **A** (finalite-A.md, § 6.1) : le programme « fait du poste de l'enseignant·e le lieu, seul et fermé, où ce que l'enseignant·e saisit sur chaque étudiant·e (présences, copies, niveaux par critère) se convertit sans cesse en notes et rétroactions à rendre et en indices qui classent chaque étudiant·e selon un besoin d'intervention. Ce dossier est conservé et protégé bien plus qu'il n'est mis en circulation. »
- **B** (finalite-B.md, § 6) : le programme « sert à une personne enseignante, seule, à tenir étudiant·e par étudiant·e un dossier de présences, de notes et de rétroactions, et à en dériver automatiquement des indices et un classement de niveau de besoin qui orientent ses décisions de notation et d'intervention. »

### 5.2 Comparaison élément par élément

| Élément | Borne basse | Borne haute | A | B |
|---|---|---|---|---|
| Une seule personne, lieu local | oui (« une seule personne enseignante ») | oui (« poste personnel et local ») | oui (« seul et fermé ») | oui (« seule ») |
| Notes et rétroactions produites | non mises en avant | oui, au premier plan | oui, nommées en premier | « dossier de notes et de rétroactions » |
| Classement des personnes | au premier plan | absent de la phrase | oui (« indices qui classent chaque étudiant·e ») | oui (« classement de niveau de besoin ») |
| Effet du classement sur des décisions | non affirmé | non affirmé | « selon un besoin d'intervention » | « orientent ses décisions de notation et d'intervention » |
| Données sensibles possibles | oui | non | non (dans le corps du texte : § 1.1, § 3.1) | non (dans le corps du texte : § 1) |
| Conservation | « d'un trimestre à l'autre » | non | « conservé » | non (dans le corps du texte : « Registre … d'un trimestre à l'autre ») |
| Protection | non | « contrôle », freins à la suppression | « protégé » | non (dans le corps du texte : point 5) |
| Comparer des pratiques de notation | non | oui | non (dans le tableau, finalité C) | non (dans le tableau, finalité E) |
| Étudiant·es sans écran ni sortie montrant le classement | oui | non | non (dans le corps du texte : § 1.5, § 7) | non (dans le corps du texte : § 2, § 4, § 7) |
| Circulation du matériel | non | oui | non (corps du texte : § 6.2, point 5) | non (corps du texte : § 6, point 6) |

### 5.3 A

**Ce qui la rapproche de la borne haute.**
- Elle met les « notes et rétroactions à rendre » avant le classement.
- Elle dit que le dossier est « protégé » et « fermé ».
- Elle reprend la prépondérance de la conservation locale sur la circulation, qui est la propriété que la borne haute retient (l. 12).

**Ce qui la rapproche de la borne basse.**
- Elle cite le classement de « chaque étudiant·e » selon un « besoin d'intervention ».
- Elle cite la conservation.

**Ce qui l'en éloigne ou la limite.**
- Elle écrit au point 4 de son § 6.2 : « Les suppressions sont bloquées tant qu'aucun codex n'est écrit (l. 413, 2533). » L'observation limite cela au groupe, au trimestre, au groupe-cours et à la réinitialisation complète. Ailleurs, la boîte offre « Supprimer sans codex » (l. 356, 379, 399, 1229). L'extension à toutes les suppressions tire A vers la borne haute au-delà de ce qui est observé.
- Elle ne place dans la phrase ni les données sensibles, ni les restes après suppression, ni l'absence d'écran étudiant, ni le comparateur de pratiques. Ces éléments sont dans le corps du texte (§ 3.2, § 7, § 8, finalité C).
- Elle appuie la phrase de finalité sur l'idée de « protégé » ; l'observation donne pour cela des freins, des restes et un codex non chiffré (§ 2.1 point 7, § 3.2).

**Position.** Entre les deux bornes. Elle réunit un élément de chacune (rendu de notes et rétroactions, plus classement et conservation) et se tient plus près de la borne basse par la présence du classement, et plus près de la borne haute par l'usage de « protégé ». Son point d'appui le moins sûr est la généralisation du blocage des suppressions.

### 5.4 B

**Ce qui la rapproche de la borne basse.**
- Elle formule le programme comme un dispositif de fiche par étudiant·e (« tenir étudiant·e par étudiant·e un dossier ») dont on dérive « automatiquement » un classement de besoin.
- Sa phrase ne contient aucun des éléments de contrôle de la borne haute : ni fonctionnement local sans envoi, ni freins à la suppression, ni partage de matériel, ni comparateur.

**Ce qui la rapproche de la borne haute.**
- Elle cite « notes et rétroactions » comme contenu du dossier.
- Dans son corps de texte (§ 6, points 5 à 7), elle recense les freins contre la perte, les sorties « sur demande » et l'instrumentation de l'enseignant·e. Ces points ne sont pas dans sa phrase.

**Ce qui l'en éloigne ou la limite.**
- Elle affirme que le classement « oriente[nt] ses décisions de notation et d'intervention ». L'observation rapporte des fonctions (filtres, tri par urgence, « Interventions recommandées », module Interventions avec `snapshotAvant`, `bilan` et report des présences : l. 1798-1804, 1933, 2062-2091). Elle ne rapporte pas qu'une décision soit prise. B marque d'ailleurs cette affirmation [I] et reconnaît en fin de texte que « l'effet du classement » n'est pas observé.
- Sa justification (« Un registre pur n'aurait pas de classes de besoin ») s'appuie sur la présence du calcul d'office (l. 1784, 2784) [O], pas sur un usage.

**Position.** Plus proche de la borne basse que A, par l'absence de tout élément de la borne haute dans sa phrase. Elle va aussi plus loin que la borne basse sur un point : elle affirme une orientation de décisions que la borne basse, telle que je l'ai formulée, n'affirme pas. En revanche, elle ne contient ni les données sensibles, ni les restes après suppression, ni l'absence d'écran étudiant, qui sont dans la borne basse.

### 5.5 Pour résumer l'écart entre A et B

- Par la phrase seule : A tient les deux bouts (rendre des notes, classer, protéger) ; B n'en tient qu'un (tenir un dossier et en dériver un classement qui oriente des décisions).
- Par le corps du texte : les deux listent presque les mêmes faits ; le tableau « autres finalités » les range un peu différemment (A : outil de travail, dépistage, pratiques de notation, recherche, communauté, réflexivité ; B : gestion de classe, triage, recherche, diffusion de ressources, formation).
- Ni l'une ni l'autre n'est dite juste ou fausse ici.

---

## 6. Ce que l'observation ne permet pas de trancher

- **L'usage réel.** Qui utilise le programme, avec quelles vraies données, quels écrans, à quelle fréquence. Tout ce qui a été observé est fictif et exécuté par un banc d'essai (l. 8-9).
- **L'effet du classement.** Si le tri par urgence, le niveau RàI ou « Interventions recommandées » sont lus, et si des actions en suivent, hors du programme.
- **La remise aux étudiant·es.** Si le « Dossier PDF », l'« Export pour Léa » ou la rétroaction copiée sont remis, par quel canal, et si les étudiant·es voient ailleurs leur classement.
- **Le classement vu par les personnes classées, et leur recours.** L'observation ne rapporte aucun écran à elles destiné ni aucune procédure ; elle ne dit pas qu'il n'en existe aucune en dehors du programme.
- **Le sort des fichiers exportés.** À qui vont les fichiers « anonymisé », « codex data », codex `.zip`, rapports de profil, CSV de synthèse, `.lcz`.
- **Le contenu exact du codex.** Les 49 clés de `donnees.json` ne sont pas énumérées ; la présence de `confidentielEtudiants` n'est pas établie (l. 2468). Le texte « ne sont jamais partagées » (l. 1944) ne peut donc être ni confirmé ni infirmé pour ce chemin.
- **L'hébergement.** Le programme a été servi depuis `127.0.0.1`. S'il l'est ailleurs, la requête `GET version.json` à 30 s puis toutes les 5 min (l. 12) atteindrait ce serveur [H] ; ce que le serveur en retient n'est pas observé.
- **Les chemins non exécutés.** Écriture réelle par sélecteur natif (codex, archives, « Faire revenir », « Emprunter », l. 2942), signalements de dépistage par critères, blocs SOLO/RLO (l. 2930), tableau « Avant / Après » des interventions (l. 2947), mode anonymisation appliqué aux profils (l. 2935).
- **Les artefacts du banc d'essai.** Chromium sans tête : le sélecteur natif échoue (`AbortError`) et le programme traite cet échec comme un refus (l. 413, 2533). Certains comportements observés peuvent tenir à ces conditions.
- **La fréquence et la portée des champs sensibles.** Qu'ils soient disponibles ne dit pas qu'ils soient remplis, ni par qui.
- **L'intention de quiconque.** Le document dit expressément ne rien en dire (l. 3). Je n'en évalue aucune.
