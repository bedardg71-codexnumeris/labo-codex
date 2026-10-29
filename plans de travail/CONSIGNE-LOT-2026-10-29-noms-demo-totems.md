# Consigne – Les élèves de la démo portent des totems scouts (29 octobre 2026)

> Écrite par Cowork le jeudi 29 octobre 2026 à 8 h 08 (Toronto, mesuré par `date`), quand `main` = `2d5a5711` (un lot était alors en cours dans `js/`). Ne remplace aucune autre consigne. **À lancer après les lots déjà en file aujourd'hui** (un seul lot écrit à la fois).
> Décision de Grégoire (29 oct., 8 h 07) : les dix élèves du mode démo portent des noms de personnalités réelles (Aimé Césaire, Nelson Mandela, Lionel Messi…), dont certaines vivantes, et ces noms reçoivent des notes et des profils de risque. Ils deviennent des totems scouts, manifestement fictifs. **Les dix noms ci-dessous, à poser mot pour mot**, sont la troisième liste de Cowork : parité entre masculin et féminin et faune des cinq continents (demande de Grégoire, 8 h 09), une qualité plutôt qu'une activité (son idée, 8 h 12). **Validée par Grégoire à 8 h 14.** L'appariement nom ↔ profil est de Cowork (genre de chaque profil conservé) ; chaque nom est une qualité de caractère, comme le « quali » d'un totem scout, et aucune ne touche au travail scolaire (ni studieux, ni attentif, ni persévérant), pour qu'aucun nom ne commente le profil qu'il porte.

## 0. Avant tout

- Rituel de début de session ; aucune suite qui tourne.
- Commit de docs seul : ce fichier.

## 1. Les noms

Le **prénom est l'animal**, le **nom est la qualité** : les rétroactions du pack s'adressent à l'élève par son prénom (« Bonjour Aimé ! », mesuré), et « Bonjour Castor ! » se lit comme un totem.

| DA | Avant | Prénom | Nom |
|---|---|---|---|
| DEMO004 | Aimé Césaire | Castor | Jovial |
| DEMO006 | Marie Curie | Mésange | Joyeuse |
| DEMO007 | Félix Leclerc | Hérisson | Chaleureux |
| DEMO010 | Gabrielle Roy | Bernache | Fidèle |
| DEMO011 | Frida Kahlo | Vigogne | Fière |
| DEMO015 | Nelson Mandela | Suricate | Loyal |
| DEMO016 | Lionel Messi | Condor | Courageux |
| DEMO017 | Toni Morrison | Grue | Gracieuse |
| DEMO019 | Oumou Sangaré | Gazelle | Intrépide |
| DEMO020 | Ravi Shankar | Panda | Serein |

Parité : cinq noms féminins, cinq masculins ; deux animaux par continent, un de chaque genre (Amérique du Nord : castor, bernache ; Europe : hérisson, mésange ; Afrique : suricate, gazelle ; Asie : panda, grue ; Amérique du Sud : condor, vigogne).

## 2. Où (mesuré par Cowork le 29 oct. à 8 h 08)

- `js/pack-demo-10.js`, trois emplacements : `groupeEtudiants` (`nom`, `prenom`) ; chaque `etudiantNom` (« Prénom Nom », à côté de `etudiantDA`) ; les `retroactionFinale` (« Bonjour Prénom ! »). Comptes mesurés dans le pack : Aimé 20, Césaire 11, Marie 20, Curie 11, Félix 20, Leclerc 11, Gabrielle 20, Roy 11, Frida 19, Kahlo 11, Nelson 17, Mandela 9, Lionel 21, Messi 11, Toni 28, Morrison 13, Oumou 23, Sangaré 12, Ravi 21, Shankar 11.
- **Ne remplace pas à l'aveugle** : « Marie », « Félix », « Roy », « Toni », « Ravi » peuvent paraître ailleurs (personnage d'une œuvre, début de mot). Remplace par la structure, champ par champ, en t'appuyant sur le DA ; puis recompte. Chaque occurrence restante d'un ancien nom est soit rendue, soit listée avec son motif dans la demande de relecture.
- **Le stock chez les gens** : le namespace `demo_*` ne se rafraîchit que si `_metadata.version` du pack change (`js/demo-namespace.js`, `initialiserDemoNamespace`, comparaison à `CLE_VERSION`). La version est aujourd'hui « 21.1 » : fais-la monter, sinon quiconque a déjà ouvert la démo garde les anciens noms.
- `js/etudiants.js:626` : l'exemple du commentaire (« aime » trouve Aimé) suit les nouveaux noms.
- `js/changelog-data.js:1300` : entrée publiée d'une livraison passée. **On n'y touche pas** (décision de Cowork : l'historique reste tel qu'il a été annoncé).
- Les tests qui citent les anciens noms suivent par décision, en citant ce fichier (mesurés : `sentinelle-749-lot2-liste-des-etudiants`, `sentinelle-915-registre-longitudinal-capture`, `audit-sous-onglets-suivi-2026-09-06`, `sentinelle-872-nouveau-groupe` dans `tests/unit/` ; `anonymisation-cadre-liste-etudiants`, `profil-745-eleve-exclu`, `lot-a-anonymisation-enregistre` dans `tests/integration/`). Mesure d'abord s'il y en a d'autres.

## 3. Les tests

- **Une sentinelle neuve**, `tests/unit/sentinelle-noms-demo-totems-2026-10-29.test.js` : les dix couples du tableau sont dans `groupeEtudiants` sous leur DA ; chaque `etudiantNom` égale « prénom nom » de l'élève du même `etudiantDA` ; aucun des vingt anciens noms ne reste dans le pack (hors exceptions listées et motivées) ; la version du pack n'est plus « 21.1 ». Break-test, arbre restauré par sha256.
- **Le stock** : un essai (unitaire ou Playwright, à ton choix) part d'un namespace `demo_*` peuplé avec l'ancienne version et les anciens noms, relance l'initialisation, et constate les totems.
- Un essai Playwright ciblé : la démo activée, la liste des élèves montre les dix totems et aucun ancien nom. On attend l'élément, jamais `waitForTimeout`.
- Vitest depuis `tests/`.

## 4. Clôture

- `BACKLOG.md` : une fiche, symptôme vécu par Grégoire (29 oct. : des noms de personnes réelles dans la démo prêtent à confusion).
- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-29-noms-demo-totems.md`, avec le recompte avant/après.
- Un commit pour le code, un pour les docs. Pas de release, de verdict ni de push sans le signal de Grégoire.
- Le geste à l'écran pour Grégoire : ouvrir la démo ; la liste des élèves montre les totems, et la rétroaction d'une copie commence par « Bonjour Castor ! » (ou le prénom de l'élève ouvert).
