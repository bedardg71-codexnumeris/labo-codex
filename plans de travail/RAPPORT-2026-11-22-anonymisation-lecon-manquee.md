# Rapport · la leçon manquée en mode anonymisation (22 nov. 2026)

Branche : `claude/stoic-heisenberg-yncp9u`, partie de `origin/main` à `78e952293` (1.254.0). Commit unique, poussé sur la
branche seule. **Rien sur `main`, aucune release** : le mandat réserve la mise en ligne au feu vert de Grégoire.
Fait : correctif, deux essais, break-test. Reste : feu vert, fusion, verdict WebKit du Mac, ligne de SUIVI-BUGS (proposée § 5).

Mandat : Cowork, 22 nov., sur le commentaire de Grégoire du 19 nov. (1.250.0, iPad). En anonymisation, la carte
« Assiduité » du profil (section « Engagement ACP ») n'affiche plus la leçon prévue sous chaque absence ; l'étiquette dit
« Groupe Gr. ? ».

## 1. Ce qu'on voit sous une absence, en gestes

Rejoué dans Chromium sur le pack démo, avec une carte d'alignement qui place deux leçons aux dates de deux absences.

| | mode normal | anonymisation, avant | anonymisation, après |
|---|---|---|---|
| 1re absence | « lun. 22 sept. 2 pér. La carte mentale » | « lun. 22 sept. 2 pér. » | « lun. 22 sept. 2 pér. La carte mentale » |
| 2e absence | « mer. 1 oct. 2 pér. Le schéma narratif » | « mer. 1 oct. 2 pér. » | « mer. 1 oct. 2 pér. Le schéma narratif » |
| 3e absence (aucune leçon ce jour-là) | « mer. 8 oct. 1 pér. » | idem | idem |
| étiquette du groupe | « Groupe demo » | « Groupe Gr. A » | « Groupe Gr. A » (inchangée) |

Même résultat avec un mapping de groupes qui ne connaît pas le groupe (étiquette « Groupe Gr. ? ») : les leçons
reviennent aussi.

## 2. Le maillon qui cassait

`obtenirGcIdEleve` (`js/synthese-retroaction-data.js`, exposée comme `groupeCoursIdDeLEleve`) cherche le groupe-cours dont
le `groupeNum` égale le `groupe` de la fiche. En anonymisation, `anonymiserDonnees` (`js/modes.js`) remplace `groupe` par
la lettre (« Gr. A ») et garde le numéro réel dans `groupeReel`. La lettre ne trouve aucun groupe-cours, la fonction rend
`null`, et `_lecteurLeconsManquees` rend une liste vide. Mesuré : `gcId` vaut `GC_DEMO` en mode normal, `null` en
anonymisation.

L'hypothèse de Cowork est confirmée pour le groupe. Le DA, lui, n'est pas brouillé dans la fiche (seul son affichage l'est) :
il n'était pas en cause.

**Correctif** (une ligne porteuse) : la fonction compare `groupeReel || groupe`, comme le font déjà `indices.js`,
`presences-rapport.js`, `vue-simple-donnees.js` et `modes.js` lui-même. Le numéro sert à trouver un identifiant interne ;
il ne s'affiche nulle part. Cache de `index.html` monté (`?v=20261122a`).

**Portée, par lecture du code et non rejouée** : la même fonction sert aussi l'échéance par groupe du PDF de synthèse, la
ligne « à venir » de la synthèse et le bandeau « Consignes transmises » d'Évaluer. En anonymisation, ces trois écrans
lisaient l'échéance par défaut au lieu de celle du groupe de l'élève ; ils lisent désormais la même qu'en mode normal.
Ce sont des dates, rien d'identifiant.

**Source ou stock** : source seulement. Rien n'est écrit ; il n'y a pas de stock.

## 3. « Groupe Gr. ? » : un autre défaut, pas la même ligne

`anonymiserGroupe` (`js/modes.js`) lit la clé **globale** `mapping_groupes_anonymes` (non préfixée par trimestre). Elle la
crée une seule fois, au premier passage, avec les groupes du trimestre actif à ce moment-là, puis ne l'étend jamais. Un
groupe absent de cette table sort en « Gr. ? ». Reproduit en posant une table qui ne connaît pas le groupe démo.

Inférence, non vérifiable sans ses données : la table de Grégoire a été créée sur un autre trimestre ou sur la démo, et ses
groupes de l'automne 2026 n'y sont pas. Ce n'est pas voulu : deux groupes réels différents s'afficheraient tous deux
« Gr. ? ».

**Correction proposée, non posée** : quand un groupe manque à la table, `anonymiserGroupe` lui donne la lettre libre
suivante et réécrit la table, comme `genererMappingAnonyme` étend déjà la table des élèves ; les lettres déjà données ne
bougent pas, et la garde d'écriture (`modes.js`, qui relit la même table pour rendre « Gr. A » à son numéro) continue de
fonctionner. Elle écrit dans une clé d'affichage de l'app, pas dans ses trimestres. Aucun mot nouveau à l'écran.

## 4. Les essais

- **Vitest**, `tests/unit/sentinelle-942-lecon-manquee.test.js`, un cas neuf : une fiche anonymisée (« Gr. B » et
  `groupeReel` « 02 ») retrouve son groupe et sa leçon ; une fiche « Gr. ? » aussi ; rien d'écrit.
- **Playwright**, `tests/integration/profil-942-lecon-manquee.spec.js`, un essai neuf : en anonymisation, les absences
  portent les mêmes leçons qu'en mode normal ; ni le prénom, ni le nom, ni le DA réels dans le texte visible de la page ;
  aucune des quatre valeurs (avec le numéro de groupe) dans le texte du profil ni dans le HTML de la carte « Assiduité »,
  attributs compris ; l'étiquette reste « Groupe Gr. X ». Les sondes sont d'abord éprouvées en mode normal, où elles
  doivent trouver ces valeurs.
- **Break-test** : correctif retiré, les deux essais rougissent (Vitest : 1 rouge sur 20 ; Playwright : leçons attendues,
  absentes). Correctif remis, les deux verts.
- **Suite Vitest complète** : 948 fichiers, 12 305 essais verts.
- **Specs voisines en Chromium** (signal des consignes, anonymisation lot A, rangée du profil, registre longitudinal) :
  23 verts, 1 rouge, `registre-longitudinal-915` R5 (géométrie des tuiles), **rouge à l'identique sans le correctif** :
  préexistant sous Chromium, sans lien.
- **Non vérifié** : WebKit (le verdict du Mac jugera la spec), Safari à la main, l'iPad, les données réelles de Grégoire.
  Aucune porte terrain : la machine a répondu, et rien n'est irréversible.

## 5. Dispositions

- **Corrigé maintenant** : la leçon manquée en anonymisation (mandat).
- **Proposé, non posé** : « Gr. ? » (§ 3), à la décision de Grégoire.
- **Trouvaille, signalée et non inscrite** (aucun symptôme vécu) : en anonymisation, le sélecteur de cours de l'en-tête
  affiche toujours le numéro de groupe réel (« 601-101 · gr. 0demo »), mesuré avant le correctif. Grégoire jugera si ça
  compte en démonstration.
- **Commenté et oublié** : le rouge R5 de `registre-longitudinal-915` sous Chromium.
- **Ligne de SUIVI-BUGS proposée** (numéro à confirmer à la fusion ; `#1303` était libre au relais du 22 nov., 9 h 20) :
  `| 1303 | Grégoire | 19 nov. | 22 nov. | (build de la release) | En anonymisation, le profil n'affiche plus la leçon manquée sous les absences | 2.2 métadonnées : obtenirGcIdEleve comparait la lettre substituée (« Gr. A ») au groupeNum ; compare groupeReel || groupe (synthese-retroaction-data.js) |`
