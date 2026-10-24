# Demande de relecture – l'Aide, lot 1 : couper et ranger (#1152, 24 octobre 2026)

> Écrite par Claude Code le samedi 24 octobre 2026 au soir, sur `main`, après `62e7b4fb` (le commit de docs de l'audit, du plan et de la consigne). Consigne exécutée : `CONSIGNE-LOT-2026-10-24-aide-lot-1-couper-et-ranger.md`. Pas de release, ni verdict, ni push.

## En bref

L'Aide a ses huit sous-onglets (Commencer, Cadre, Conception, Évaluation, Suivi, Labo, Codex et archives, Référence). Elle compte 61 entrées au lieu de 75, et environ 17 600 mots au lieu de 19 100 (texte visible de la section, hors commentaires). Les quatorze titres numérotés ont perdu leur numéro, les quatre passages du §5 sont retirés, et D7, D8 et D10 sont appliquées. **D6 est arrêtée** : changer le libellé réécrirait les tables de pseudonymes déjà enregistrées et changerait les numéros (voir plus bas). Le lot ne contient aucun texte neuf, sauf la ligne de renvoi vers Réglages › À propos.

## Ce qui a changé

| Fichier | Changement |
|---|---|
| `js/config.js` | Le tableau `'aide'` contient les huit entrées du §2, dans l'ordre (autorisation de Grégoire du 24 oct., 18 h 38 ; rien d'autre n'est touché). |
| `index.html`, section Aide | Les huit `div.sous-section`, de `aide-commencer` à `aide-reference`. Chacune a pour `h2` son libellé. Ses entrées sont dans l'ordre du §4. Leurs ids n'ont pas changé, et chaque carte a gardé ses commentaires de tête. |
| `index.html`, section Aide | Les 14 entrées du §3 sont coupées. La ligne de renvoi termine Référence : « La version, les licences, les technologies et les remerciements de l'application sont dans Réglages › À propos. » (écrite d'après les cartes de `#reglages-a-propos` : Identité, Licences, En pratique, Technologies, Sources et remerciements). |
| `index.html`, section Aide | L'étiquette sous la recherche disait « Recherche dans : Introduction • Configuration • … ». Elle nomme maintenant les huit sous-onglets. |
| `index.html`, section Aide | `modes-formation` n'est plus ouverte par défaut (classe `ouvert` et `display: block` retirées). `presentation` est la seule entrée ouverte. |
| `js/init-inline.js` | `reafficherToutesLesCartes` retombe sur `aide-commencer`. La paire `aide-apropos-version-*` de `afficherBuildNumero` est retirée : ses deux `span` sont partis avec la carte « À propos ». |
| `js/accompagnement-contenu-popup.js` | D10 : les deux noms de famille des noms de fichiers d'exemple deviennent « Exemple_Ada_1234567.pdf » et « Essai_1234567_Artefact-8a.jpeg ». |
| `index.html` | Les jetons de `config.js` (`20261024a`), `accompagnement-contenu-popup.js` (`20261024b`) et `init-inline.js` (`20261024b`). |
| `BACKLOG.md` | La fiche **#1152** « Refonte de l'Aide (audit du 24 oct.) ». **Pas de fiche neuve pour les bornes RàI** : #551, ouverte, porte déjà la question (« son niveau RàI est calibré sur l'échelle de quelqu'un d'autre ») ; elle reçoit une note du 24 oct., « en attente de Grégoire, sans code ». |
| `AUDIT-AIDE-2026-10-24.md` | Les 91 `#FICHE-AIDE` sont remplacés par `#1152`. La ligne des bornes RàI renvoie maintenant à #551. |

**Mesure des lecteurs des six anciens ids** (`js/`, `index.html`, `styles.css`, `tests/`) : il n'y en a que quatre. `init-inline.js:782` (remplacé), `accompagnement.js:1680` (`aide-reference`, gardé), et deux specs qui naviguaient vers `'configuration'` et `'utilisation'` (adaptées, voir plus bas). `styles.css` n'en lit aucun.

**Vérification du rangement** : un script a comparé chaque carte gardée à son texte d'avant, ligne par ligne. Seules ont changé les 14 lignes de titre et les deux lignes d'ouverture de `modes-formation`. Tout `index.html` hors de la section Aide est identique à l'octet près.

## Les quatre retraits (§5) et les décisions de mots

Chaque retrait laisse un commentaire HTML daté qui dit pourquoi.

- **`groupe`** : la phrase sur l'ancienne colonne « CAF » est retirée. Le reste de la ligne « Mesure d'aide » est gardé tel quel, y compris son « l'élève » (laissé, comme le demande la consigne : c'est au dossier d'audit).
- **`rai-absences`** : le point « Si tu modifies l'intervention (ajouter/retirer des étudiant·es), les changements se propagent automatiquement aux présences » est retiré de l'encadré « Important ».
- **`bilan-reflexif`** : la partie « 4. Importer les résultats » et ses trois points sont retirés. ⚠ Le titre « 5 onglets » et la numérotation « 5. Rapport d'analyse » restent : l'onglet existe toujours à l'écran, et renuméroter serait réécrire. C'est pour le lot 2c.
- **`lecons`** : le point « Supprimer un bloc : glisse-le sur la corbeille de la palette » est retiré.
- **D7** : « Important — les données de tes étudiant·es et la Loi 25. » Rien d'autre ne change dans l'encadré.
- **D8** : dans la FAQ, « Transférer le fichier codex `.zip` (iCloud, USB, etc.) ». Aucune autre entrée ne propose le courriel pour le **codex**. Celle de `collaboration` (« fichiers `.lcz` … envoyés par courriel, Drive, Teams ») concerne le partage de ressources, pas le codex : elle est laissée.
- **D10** : le prénom de l'anecdote de `snapshots` devient « Ada ». L'exemple d'attribution de `collaboration` devient « Bruno Modèle », « Ada Exemple », « Chloé Essai ». L'ordre des rôles a été choisi pour garder les accords tels quels (« auteur original », « contributrice ») ; seul « de Marie » devient « d'Ada ». Les anciens noms ne figurent nulle part, ni dans le commit, ni dans les tests (seule leur empreinte sha256), ni ici.

## D6 : arrêté, à soumettre à Grégoire

**Le stock.** `genererMappingAnonyme` (`js/modes.js:281-376`) enregistre par trimestre une table `{trimestre}_mapping_anonymisation`. Pour chaque DA, elle contient `{ nom: '', prenom: 'Élève N', nomComplet: 'Élève N', numero, ordreAffichage }`, et `numero` et `ordreAffichage` y sont **tirés au hasard** (Fisher-Yates). À chaque lecture, la fonction juge « ancien format » toute table dont le premier `prenom` ne commence pas par « Élève » (l. 311-314). Dans ce cas, elle **vide la table, refait le tirage et l'écrit** (`db.setSync`).

**La conséquence.** Si le code produit « Étudiant·e N » et que la détection suit, chaque table déjà enregistrée devient « ancien format » à la première lecture en mode anonymisé. **Les numéros et l'ordre d'affichage de tous les étudiant·es changeraient**, et l'écriture se ferait dans les données de l'utilisateur. Si la détection ne suit pas, chaque table nouvellement écrite serait jugée « ancienne » à chaque lecture : un nouveau tirage à chaque fois.

**Ce que le préfixe porte encore** (mesuré par `grep`) : `tableau-bord-apercu.js` reconnaît des données déjà anonymisées à `startsWith('Élève')`, huit fois. `travaux-archivage.js` nomme les dossiers et les fichiers d'export anonymisés « Élève 32_Artefact 1_1.pdf » : **ces fichiers voyagent**. Viennent ensuite `reserve-ouvrir.js:846`, la bulle de `accompagnement-contenu-hover.js:23`, et `evaluation-chargement.js:95, 174`, qui fabrique « Élève N » à partir du rang dans la liste et non du numéro de la table (deux numérotations différentes pour le même mode).

**Une voie qui n'écrit rien**, à trancher : garder ce qui est enregistré, faire accepter les deux préfixes par la détection, et composer le libellé affiché à partir de `numero`. Les numéros ne bougent pas, mais le geste touche une dizaine de fichiers et les noms des exports. **D'ici la décision, l'Aide garde « Élève 1, Élève 2 »** dans `modes-formation` : elle dit ce que l'écran affiche.

## Les introductions retirées (texte d'avant, mot pour mot)

| Ancienne sous-section | `h2` | Paragraphe d'introduction |
|---|---|---|
| Introduction | « Qu'est-ce que Labo Codex ? » | (aucun) |
| Configuration | « Configuration initiale (1ʳᵉ utilisation) » | « Guide pas-à-pas pour configurer ton système de suivi » |
| Formation et démonstration | « Formation et démonstration » | « Modes de fonctionnement pour explorer l'application sans risque » |
| Utilisation hebdomadaire | « Utilisation hebdomadaire » | « Routine de saisie et flux de travail (5-15 min/semaine) » |
| Consultation | « Consultation et interprétation » | « Prendre des décisions basées sur les données » |
| Référence rapide | « Référence rapide » | « Aide-mémoire et seuils critiques » |

Aucune de ces phrases ne porte une information absente des entrées. « 5-15 min/semaine » est une estimation du même ordre que « Temps estimés par activité » (D9).

## Les tests

**Avant toute modification** : les 19 fichiers de sentinelles de l'Aide, 166 essais, étaient verts. Vitest complet était vert lui aussi : 9 594 essais sur 9 594 (audit de début de session).

**Ce qui est tombé, et pourquoi** (tous des cas prévus par la décision) :

| Test | Cause | Adaptation |
|---|---|---|
| `unit/critere-algorithmique-mots.test.js` (D1) | Le titre « 5c. Les critères algorithmiques » perd son numéro. | La valeur attendue devient « Les critères algorithmiques », avec un commentaire qui cite l'audit et D11. |
| `unit/sentinelle-862-aide-loi-25.test.js` | D7 | Le motif suit « tes étudiant·es », et « les données de tes élèves » ne doit plus paraître (décision citée). |
| `integration/critere-algorithmique-mots.spec.js` | Il naviguait vers `'configuration'` et attendait « 5c. ». | Il navigue vers `'conception'`, attend le titre sans numéro, et vérifie que « 5c. » est absent. |
| `integration/aide-exporter-archiver-893.spec.js` | Il naviguait vers `'utilisation'`. | Il navigue vers `'evaluation'`. |
| `unit/sentinelle-ci-paths-ignore.test.js` | Ma première version de la sentinelle neuve lisait l'audit dans `plans de travail/`, un chemin du `paths-ignore` de la CI. | La sentinelle porte la décision (les 14 coupes, les 61 places) au lieu de la lire. Elle cite l'audit et le cliquet. |

- **`sentinelle-audit-aide-15-oct`** : la phrase RàI paraît **5 fois avant, 5 fois après**. Aucune de ses occurrences n'était dans une entrée coupée, donc le seuil de 3 reste tel quel.
- **Le faux vert du lot A, fermé** : « Régénérer » sort de la liste « les boutons existent ». À sa place, un essai dit ce qui est : le seul bouton de ce nom porte `regenererRetroactionAvecFeedback`, aucune surface ne nomme « Régénérer le calendrier », et l'Aide en garde exactement deux mentions fausses, `faq: 1, problemes: 1` (**dette nommée**, réécrite au lot 2c ; une troisième mention rougit). Break-test : 3 mutations sur 3 rougissent l'essai (une mention ajoutée à une autre entrée, la mention de la FAQ retirée, un second bouton « Régénérer »).
- **Sentinelle neuve** `tests/unit/sentinelle-aide-2026-10-24-forme.test.js`, 13 essais. Elle vérifie les sous-sections face au tableau `'aide'` de `config.js` (lu, pas recopié), l'absence des 14 coupées, chaque sous-section avec ses entrées dans l'ordre et rien d'autre, l'absence de titres qui commencent par un chiffre, `presentation` seule ouverte, le renvoi final, les quatre retraits (motifs mesurés au texte d'avant), D8 et D10 (par empreintes). **Break-test : 15 mutations sur 15 rougissent l'essai visé, et l'arbre est restauré à l'identique (sha256 de `index.html`, `config.js` et de la popup, avant et après).**
- **Essai Playwright ciblé** `tests/integration/aide-forme-1152.spec.js` (WebKit, vert). La barre montre les huit boutons de `configurationsOnglets.aide`, dans l'ordre, et « Commencer » est actif. À 1024 px, le menu « Sous-section » a les mêmes huit options. « Référence » rend le glossaire (`#glossaire-rendu` rempli). La recherche « codex » trouve des cartes, dont `accordeon-aide-codex`, et affiche « Codex et archives » au-dessus. Aucune erreur de page. Les cinq specs de l'Aide voisines passent aussi (11 essais).
- **Vitest complet après le lot** : 9 607 essais sur 9 607, 814 fichiers.

## La barre à 768, 1024 et 1280 px

Captures WebKit : `plans de travail/captures-2026-10-24-aide-lot-1/webkit-{768,1024,1280}x900-sous-onglets-aide.png`.

- **À 768 et à 1024 px, il n'y a pas de barre de boutons.** Jusqu'à 1024 px, `styles.css` cache `.sous-navigation` et montre le menu déroulant « Sous-section ». Ce menu affiche « Commencer », et ses huit options sont vérifiées par l'essai. Rien n'a été redessiné.
- **À 1280 px**, les huit boutons tiennent sur une seule rangée centrée.
- Constat en passant, déjà présent avant le lot : à 1024 px et moins, le menu principal affiche « Accueil » pendant que l'Aide est ouverte (l'Aide est un bouton de l'en-tête, pas une entrée de ce menu). Issue proposée : *inscrire*. Ce n'est pas mis au BACKLOG, faute de symptôme vécu par Grégoire. À trancher par Cowork.

## Autres trouvailles (issue nommée)

- `tests/unit/sentinelle-603-604-import-pages-et-remplacement.test.js:11` : le commentaire laisse entendre que le nom de famille d'exemple pourrait être celui d'un·e élève réel·le (règle n° 6 de CLAUDE.md). Hors du lot. Issue : *inscrire*, à vérifier par Cowork ; rien n'a été modifié.

## Le geste à vérifier à l'écran, après la prochaine mise en ligne

Ouvrir l'Aide. On doit y voir huit sous-onglets aux noms de l'application (au Mac, une rangée de boutons ; à l'iPad, le menu « Sous-section »). « Référence » doit montrer le glossaire. Chercher « codex » doit trouver le Codex et ses voisines, sous le titre « Codex et archives ».
