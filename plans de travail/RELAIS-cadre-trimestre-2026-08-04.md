# Relais — Cadre → Trimestre (configuration du trimestre)

> **Origine** : séance Cowork du 4 août 2026, Grégoire × Cowork, pendant que Claude Code
> travaille sur le module d'alignement pédagogique (branche
> `claude/labo-codex-alignement-pedagogique-rrtg59`).
>
> **Contexte** : Grégoire configurait le trimestre **A2026** en direct. La configuration du
> trimestre est le **premier écran** que rencontreront les membres de la cohorte à la rentrée
> (~10 jours). Les constats viennent d'un parcours réel, pas d'une revue théorique.
>
> **Méthode** : lecture seule sur les données réelles A2026 (via l'onglet Chrome de Grégoire),
> recoupée au code du dépôt et au **calendrier scolaire officiel du Cégep de Drummondville
> 2026-2027** (adopté au CA du 27 janvier 2026).
>
> **Numérotation** : #366 à #375. Dernier ID utilisé avant cette série : **#365**.
>
> **Ordre de prise recommandé** : #366 → #367 → #368 (les trois se vérifient sur le même
> jeu de données) ; #370, #371, #372, #373 en parallèle (indépendants) ; #369 après #367 ;
> #374 et #375 à l'automne.

---

## Constat d'ensemble (lire avant les items)

Deux compteurs affichent le même trimestre A2026 et ne s'accordent pas :

| Source | Semaines | Jours de cours |
|---|---|---|
| Sidebar (Cadre → Trimestre) | 17 | 80 |
| Carte Légende (Calendrier scolaire) | 15 | 75 |
| **Calendrier officiel du cégep** | **15** | **75** |

Le « 15 / 75 » du Calendrier scolaire n'est **pas** un calcul juste : ce sont deux constantes
codées en dur qui coïncident avec la bonne réponse (voir #366). Le « 17 / 80 » de la sidebar est
un vrai calcul, mais sur un calendrier mal généré (voir #367 et #368).

**Preuve arithmétique de la cible.** Jours ouvrables du 20 août au 11 décembre 2026 : **82**.
Le calendrier officiel en retire **7** : 7 sept (fête du Travail), 12 oct (Action de grâce),
13 oct (journée d'évaluation/reprise « RC »), 14-16 oct (journées de planification),
9 nov (Journée Carrière, levée des cours). **82 − 7 = 75 = 15 × 5.**

L'app ne retire que les 2 congés déclarés par Grégoire → 80. Les 5 jours manquants sont
exactement la semaine du 12 octobre.

---

## #366 🔴 Calendrier scolaire : les deux métriques sont des constantes, pas des calculs

- [ ] 🔴 **#366** La carte « Légende » du Calendrier scolaire affiche **15 semaines / 75 jours**
      quelles que soient les données. Ce sont ses valeurs de repli codées en dur.

- **Constat (vérifié en direct, données A2026 réelles)** : `afficherCalendrierScolaire()`
  (`js/calendrier-vue.js`, ~l. 466-476) lit ses deux métriques dans le DOM :
  ```javascript
  let nombreSemainesReel = 15; // Valeur par défaut
  let nombreJoursReel = 75;    // Valeur par défaut
  if (document.getElementById('nombreSemaines')) { … }
  if (document.getElementById('nombreJoursCours')) { … }
  ```
  **Ces deux ids n'existent pas dans le DOM.** Vérifié en direct :
  `document.getElementById('nombreSemaines')` → `null`,
  `document.getElementById('nombreJoursCours')` → `null`.
  Les ids réels de la page V2 sont `v2-nombreSemaines` / `v2-nombreJoursCours`
  (+ jumeaux `…Sidebar`), posés par `majApercuTrimestreV2()` (`js/trimestre-v2.js:29-85`).

- **Cause** : refonte V2 — les ids ont été préfixés `v2-` sans mettre à jour l'appelant.
  Le garde `if (document.getElementById(...))` a transformé une erreur franche en repli
  silencieux. C'est le pattern documenté au §10 d'`ETAT-PROJET.md` : *« un guard
  `typeof === 'function'` ne signifie pas qu'une fonction est morte »* — ici, un guard
  `if (getElementById)` ne signifie pas que l'élément existe.

- **Pourquoi c'est resté invisible** : les valeurs de repli (15 / 75) sont **plausibles**, et
  se trouvent être exactement la bonne réponse pour un trimestre standard de 15 semaines. Rien
  ne semblait cassé. La divergence n'apparaît que si l'autre compteur, lui, se trompe.

- **Correctif attendu — ne PAS se contenter de renommer les ids.** Le vrai défaut est
  architectural : deux modules se parlent **par le DOM**. `CLAUDE.md` l'interdit
  explicitement (« Les modules ne se parlent JAMAIS directement — communication via
  localStorage/IndexedDB uniquement »). Attendu :
  1. Extraire le comptage de `majApercuTrimestreV2()` vers une fonction pure exportée
     (ex. `calculerStatistiquesCalendrier(calendrierComplet)` → `{semaines, joursCours, conges, reprises}`).
  2. `trimestre-v2.js` **et** `calendrier-vue.js` appellent cette fonction. Une seule source.
  3. **Retirer** les constantes 15/75 et la lecture DOM (zéro-dette : pas de repli « au cas où »).
     S'il n'y a pas de calendrier, afficher un état vide explicite, pas un chiffre inventé.

- **Tests** : sentinelle Vitest sur la fonction pure (jeu A2026 → 15/75 après #367).
  **Break-test obligatoire** : réintroduire le repli en dur doit faire ROUGIR la sentinelle.
  Ajouter un cas « calendrier absent » qui vérifie qu'aucun nombre n'est affiché.

- **Porte terrain** : après correctif, les deux écrans doivent afficher le même couple sur
  a2025, h2026 et a2026, en mode sombre et clair.

- **Fichiers** : `js/calendrier-vue.js` (~466-476, 566-582), `js/trimestre-v2.js` (29-100).

---

## #367 🔴 Les jours de planification et d'examens sont comptés comme jours de cours

> **✅ CLOS le 5 août 2026 SANS code générateur (constat de Grégoire, vérifié au code).**
> Le générateur excluait DÉJÀ les deux semaines spéciales, aux deux passes
> (`js/trimestre.js:145-147` passe 1 : aucun rôle/numéro ; `:190-193` passe 2 : statuts
> dédiés `semaine-planification`/`semaine-examens`). Le +5 venait UNIQUEMENT de la borne
> `semainePlanificationFin` vide (champ recouvert → #371) : `estDansPlage` retourne false
> quand une borne manque (`js/trimestre.js:272`), donc la plage n'existait pas. Après le
> correctif #371 (1.30.1) et la saisie 12-16 oct par Grégoire : sidebar = 15 sem. · 75 jours,
> calendrier d'octobre correct (captures du 5 août). **Reliquat versé dans #369** :
> avertir quand une borne « du/au » est partielle — ne jamais deviner en silence.

- [x] 🔴 **#367** La génération du calendrier ne retranche ni la semaine de planification ni
      la semaine d'examens des jours de cours. Sur A2026 : **+5 jours** (80 au lieu de 75).

- **Constat (données A2026 réelles)** : les 12, 13, 14, 15 et 16 octobre 2026 portent le statut
  `cours` dans `a2026_calendrierComplet`, alors que `a2026_cadreCalendrier` déclare
  `semainePlanificationDebut: "2026-10-12"`. Répartition des statuts observée :
  `cours: 79, weekend: 36, semaine-examens: 6, conge: 2, reprise: 1` → 79 + 1 = **80 jours de cours**.

- **Cause immédiate** : `semainePlanificationFin` vaut `""`. La borne de fin n'a jamais été
  saisie — **parce que le champ est masqué par le chevauchement de #371**. Bug d'affichage →
  donnée manquante → compte faux. Les trois se tiennent.

- **Mais la cause de fond est plus large** : même bornée, rien ne garantit que la semaine de
  planification soit exclue. Le statut `semaine-examens` existe (6 jours observés) et est
  correctement écarté du compte ; le statut `semaine-planification` **n'apparaît nulle part
  dans le calendrier généré**. À vérifier au code : est-il seulement produit ?

- **Correctif attendu** :
  1. La semaine de planification produit un statut dédié (comme la semaine d'examens), exclu
     du compte des jours de cours **et** de la numérotation des semaines (#368).
  2. Si la borne de fin est absente, **ne pas deviner** : ne rien exclure et **avertir**
     (voir #369). Ne pas inférer « une semaine = 5 jours » — ce serait coder en dur une pratique.
  3. Vérifier que la semaine d'examens est bien exclue partout (elle semble l'être, à confirmer
     par un test).

- **Décision Grégoire (4 août 2026)** : « il faut exclure la semaine de planification **et** la
  semaine d'examens ».

- **Tests** : sentinelle sur un calendrier de synthèse contenant une semaine de planification
  bornée, une non bornée, et une semaine d'examens. Break-test sur chacune.

- **⚠ Écart de saisie à corriger côté données** (Grégoire, pas Claude Code) :
  - semaine d'examens saisie `14/12 → 21/12` ; le calendrier officiel dit **14-18 décembre**
    (le 21 est la *fin du trimestre*, pas une journée d'évaluation) ;
  - la journée « RC » du **13 octobre** (journée d'évaluation ou de reprise de cours) et le
    férié de l'**Action de grâce du 12 octobre** ne sont pas déclarés — ils sont aujourd'hui
    absorbés dans « semaine de planification 12-16 octobre ». Le résultat sur les *comptes* est
    identique ; sur ce que voit l'utilisateur, non. **Question ouverte pour Grégoire.**

- **Fichiers** : générateur du calendrier (`genererCalendrierComplet`, à localiser —
  `js/entites/groupe-cours.js:249` y renvoie), `js/trimestre-v2-horaires.js:695-720`.

---

## #368 🟡 Numérotation des semaines : formaliser la règle du « paquet de 5 »

- [ ] 🟡 **#368** La numérotation des semaines scolaires est incohérente : elle **recule**.
      Sur A2026, elle atteint 17 au lieu de 15.

- **Constat (données A2026 réelles)** : les `numeroSemaine` observés ne sont pas monotones.
  - jeudi 15 oct → semaine 8 ; **vendredi 16 oct → semaine 9**
  - vendredi 13 nov → semaine **13** ; **lundi 16 nov → semaine 12** ← recul d'un numéro
  - `maxSemaine` = 17, avec une semaine 17 ne contenant qu'**un seul** jour (11 déc).
  - Répartition : 15 semaines de 5 jours, une de 4, une de 1.

- **Note importante** : ce n'est pas seulement l'effet de #367. Retirer les 5 jours d'octobre
  ramènerait le total à 75, mais **n'expliquerait pas le recul** entre le 13 et le 16 novembre.
  Il y a un défaut propre à l'attribution de `numeroSemaine`, à instruire séparément.
  *(Inférence, pas fait établi : je n'ai pas localisé la fonction qui attribue `numeroSemaine`.)*

- **La règle attendue (validée par Grégoire, 4 août 2026, et vérifiée contre le calendrier
  officiel)** :

  > **`numeroSemaine` = ⌈ rang du jour de cours effectif ÷ 5 ⌉**

  On numérote les jours de cours effectifs à partir du premier jour du trimestre, et on les
  emballe par paquets de cinq. Une semaine scolaire est **un paquet de 5 jours de cours
  effectifs**, pas une semaine calendaire.

- **Vérification contre le calendrier officiel 2026-2027** (qui imprime le numéro de semaine
  en indice sur chaque jour) :

  | Paquet | Jours | Sem. officielle |
  |---|---|---|
  | 1-5 | jeu 20 → mer 26 août | 1 ✓ |
  | 6-10 | jeu 27 août → mer 2 sept | 2 ✓ |
  | 11-15 | jeu 3, ven 4, mar 8, mer 9, **jeu 10** sept (lun 7 férié) | 3 ✓ |
  | 16-20 | **ven 11** → jeu 17 sept | 4 ✓ |
  | … | … | … |
  | 51-55 | ven 6, mar 10, mer 11, jeu 12, ven 13 nov (lun 9 = Journée Carrière) | 11 ✓ |
  | 56-60 | lun 16 → ven 20 nov | 12 ✓ |
  | 71-75 | lun 7 → ven 11 déc | 15 ✓ |

  La semaine 3 absorbe le férié du 7 septembre et s'étire jusqu'au jeudi ; la semaine 4 démarre
  donc un vendredi. La semaine 8 enjambe la pause d'automne (ven 9 oct, puis lun 19 → jeu 22).
  **La règle du paquet de 5 reproduit tout cela automatiquement.**

- **Pourquoi cette formulation et pas une autre** : elle ne présuppose **aucun** jour de bascule.
  Toute règle du type « la semaine commence le jeudi » coderait en dur le calendrier du Cégep de
  Drummondville (rentrée A2026 un jeudi) et casserait ailleurs. Contrainte explicite de Grégoire
  le 4 août : **« Il ne faut pas coder en dur ma pratique. »**

- **Incertitude à lever avant de coder** : le diviseur `5`. Il correspond au nombre de jours
  ouvrables d'une semaine, pas à une constante pédagogique. À dériver plutôt qu'à figer, ou à
  documenter comme hypothèse assumée avec un test qui la rend visible.

- **Ce que la règle ne doit PAS faire** : déplacer automatiquement les échéances d'artefacts
  quand la numérotation change en cours de trimestre. **Décision Grégoire (4 août)** : *« quand
  un cours disparaît du calendrier, l'utilisateur doit faire manuellement les changements.
  C'est plus simple ainsi. »* Voir #375.

- **Tests** : golden master sur le calendrier officiel A2026 — les 75 jours doivent porter
  exactement les numéros du calendrier du cégep (table de correspondance à produire depuis
  `Calendrier/DE_Calendrier scolaire_26-27.pdf`). Sentinelle de monotonie : `numeroSemaine`
  ne doit jamais décroître quand la date croît. Break-test sur les deux.

---

## #369 🟡 Aucune validation de cohérence sur les bornes du trimestre

> **✅ CLOS le 5 août 2026.** Fonction pure `validerCadreTrimestre(cadre, evenements)`
> (`js/trimestre-v2.js`, exportée) : 6 règles du relais + reliquat #367 (borne du/au
> partielle → « sera ignorée », jamais devinée). Zone `#v2-avertissementsCadre`
> (alerte-attention, « À vérifier (rien n'est bloqué) ») au-dessus d'Enregistrer —
> l'emplacement anticipé par #372 — rafraîchie au même point que les statistiques
> (afficherStatistiquesTrimestreV2). Sentinelles : Vitest 7 cas (1 par règle + saisie
> valide SILENCIEUSE, ablation break-testée ROUGE) + intégration Playwright
> (visible sur les 2 cas réels, silence sur saisie propre).

- [x] 🟡 **#369** Les bornes du trimestre acceptent des valeurs incohérentes sans le signaler.

- **Constat (rencontré réellement par Grégoire le 4 août)** : « Remise des notes » saisie au
  **29/08/2026**, soit *avant* la fin des cours (11/12) et avant la fin du trimestre (21/12).
  Aucun avertissement. La vraie date est le 29 **décembre**. Erreur de mois, invisible.
  Second cas le même jour : `semainePlanificationFin` laissé vide, sans que rien ne le signale —
  avec l'effet en cascade de #367.

- **Enjeu** : ces champs se remplissent **une fois**, à la configuration, et ne se revoient
  jamais. Un utilisateur de la cohorte qui se trompe en août ne le découvrira pas avant décembre.

- **Correctif attendu — avertissements NON bloquants.** Décision : ne pas bloquer la saisie.
  Un cégep peut avoir des cas légitimes qu'on n'anticipe pas ; empêcher un enseignant d'avancer
  le jour de la rentrée est pire qu'un chiffre faux. Signaler, expliquer, laisser passer.

- **Règles à vérifier** (liste ouverte) :
  - début < fin des cours réguliers < fin du trimestre ;
  - remise des notes ≥ fin du trimestre (cas rencontré) ;
  - semaine de planification et semaine d'examens **entièrement comprises** dans les bornes ;
  - toute borne « du … au … » dont un seul côté est rempli (cas rencontré) ;
  - date de reprise tombant un jour non ouvrable (cas rencontré : reprise saisie un samedi,
    silencieusement absente du calendrier généré) ;
  - date de reprise antérieure au congé qu'elle reprend.

- **Décision Grégoire (4 août 2026)** : « Il faut le signaler à l'utilisateur. »

- **Tests** : un cas par règle, plus un cas « saisie valide » qui doit rester **silencieux**
  (une validation qui crie tout le temps ne sera pas lue).

---

## #370 🟡 Le format des jours diffère entre les menus et le calendrier scolaire

> **✅ CLOS le 5 août 2026 — prémisse auditée, corrigé au vrai point de confusion.**
> Audit : AUCUN menu de l'app ne liste 7 jours — tous les sélecteurs de jour sont
> Lundi→Vendredi (horaire.js ×2, trimestre-v2-horaires.js, reprises ×2) ; la liste
> 7 jours L-first de `entites/horaires.js` ne nourrit aucun menu (formatage seul).
> L'ordre D-first du calendrier et l'ordre L→V des menus ne peuvent donc pas entrer
> en conflit directement. Ce qui a réellement piégé Grégoire est le libellé ambigu :
> « → Reprise **Lundi** le 2026-09-10 » (la note du relais le décrit). Corrigés :
> cartes d'événements → « Reprise le **2026-09-10** (horaire du **lundi**) »
> (`trimestre-v2-init.js`, avec echapperHtml ajouté) et options des deux menus de
> reprise → « Horaire du lundi » (valeurs de données intactes).

- [x] 🟡 **#370** Les menus déroulants listent les jours en **L M M J V S D**, le calendrier
      scolaire les affiche en **D L M M J V S**. Deux ordres pour la même semaine.

- **Constat** : signalé par Grégoire le 4 août 2026 — **il s'est lui-même trompé à cause de ça**,
  en saisissant une date de reprise décalée d'un jour. Il a conçu l'application.

- **Portée du signal** : si l'auteur de l'outil se fait piéger en configurant son propre
  trimestre, un membre de la cohorte se fera piéger. Ce n'est pas une préférence esthétique,
  c'est une source d'erreur de saisie mesurée sur un cas réel.

- **Correctif attendu** : aligner l'ordre des menus sur celui du calendrier scolaire
  (**D L M M J V S**), qui est celui du calendrier officiel du cégep et celui qu'a l'utilisateur
  sous les yeux quand il saisit. Balayer **tous** les sélecteurs de jour de l'application, pas
  seulement ceux du Cadre — vérifier notamment l'horaire hebdomadaire et la saisie des séances.

- **Note** : le libellé « → Reprise **Lundi** le 2026-09-10 » désigne l'*horaire adopté*
  (le jeudi 10 septembre prend l'horaire du lundi), pas le jour de la reprise. C'est **exact**
  mais lu de travers au premier coup d'œil. Une reformulation (« reprise de l'horaire du lundi »)
  lèverait l'ambiguïté. À traiter avec #370 puisque c'est le même malentendu.

---

## #371 🟡 Semaines spéciales : les champs de date se chevauchent

- [ ] 🟡 **#371** Dans la carte « Semaines spéciales », les champs de date de la semaine de
      planification et de la semaine d'examens se superposent — un champ devient inatteignable.

- **Constat** : capture du 4 août 2026 (Chrome, macOS, fenêtre ~1470 px). Le champ « au » de la
  semaine de planification est recouvert par le bloc « Semaine d'examens » ; on y lit
  `16/mm/0` tronqué. **Conséquence directe : `semainePlanificationFin` est resté vide** → #367.
  Ce n'est donc pas un défaut cosmétique.

- **Correctif attendu (demande explicite de Grégoire)** : empiler les deux semaines
  **verticalement** au lieu de les mettre côte à côte. Deux champs de date « du / au » ne
  tiennent pas sur une demi-largeur.

- **Piste** : même famille que **#118 / #283-T1** (overflow du Calendrier, corrigé le
  3 juillet 2026 par `min-width: 0` + empilement). Vérifier si le correctif s'applique ici.
  Sentinelle existante à consulter : `tests/unit/sentinelle-overflow-calendrier-118-283T1.test.js`.

- **Note** : Grégoire signalait aussi une sidebar tronquée sur la même capture. **Non
  reproductible** — disparue après rechargement, et aucun débordement horizontal mesuré
  (`scrollWidth === clientWidth === 1459` à 1470 px de fenêtre). Écarté pour l'instant ;
  à rouvrir si le symptôme revient.

- **Porte terrain** : deux modes (sombre/clair), Mac et iPad.

---

## #372 🟢 Encadré vide autour du bouton « Enregistrer »

- [ ] 🟢 **#372** Le bouton « Enregistrer » du formulaire Trimestre est entouré d'un encadré
      bleu qui ne contient aucun texte.

- **Demande de Grégoire (4 août 2026)** : garder le bouton seul, supprimer l'encadré.

- **Vérifier avant de retirer** : l'encadré était-il prévu pour accueillir un message d'état
  (« Enregistré », erreurs de validation) ? Si oui, #369 va vouloir un emplacement pour ses
  avertissements — coordonner les deux plutôt que retirer puis remettre.

---

## #373 🟡 Ajouter la nature « Férié » et corriger le titre de la carte

- [ ] 🟡 **#373** La carte s'intitule « Congés fériés **et** activités institutionnelles », mais
      le menu n'offre que « Institutionnel (collège) » et « Personnel (toi seulement) ».
      La fête du Travail se retrouve étiquetée « Institutionnel », ce qui est faux.

- **Modèle actuel (relevé au code)** — deux axes croisés, pas un :
  | Axe | Valeurs | Où |
  |---|---|---|
  | Prévisibilité | prévu / imprévu | implicite : la carte dans laquelle on ajoute |
  | Nature | `institutionnel` / `personnel` | `v2-categorieEvenement{Prevu,Imprevu}` |
  | Reprise | horaire + date, ou aucune | optionnel sur les deux |

  Fichiers : `js/trimestre-v2-init.js:455-480` (badge), `index.html:6641-6644` et `6696-6699`
  (les deux `<select>`).

- **Typologie voulue par Grégoire (4 août 2026)** : congé **institutionnel** (ex. Journée
  Carrière, repris) · congé **férié** (ex. fête du Travail, repris) · congé **imprévu sans
  reprise** (ex. maladie).

- **Correctif attendu (version minimale, livrable avant la rentrée)** : ajouter la valeur
  **« Férié (collège fermé) »** au menu de nature, dans les deux formulaires. Le titre de la
  carte devient exact. Les deux autres cas de Grégoire sont déjà exprimables.

- **Ce que la distinction férié / institutionnel change** : **rien au calcul.** Vérifié auprès
  de Grégoire — la Journée Carrière ferme le collège aux étudiants réguliers (des élèves du
  secondaire visitent), donc elle est fonctionnellement identique à un férié : pas de cours,
  reprise plus tard. C'est une étiquette, pas un comportement. **Le dire explicitement dans
  l'item évite qu'on cherche un effet qui n'existe pas.**

- **Cas réels à ne pas casser** (témoignage Grégoire, 4 août) :
  - **grève** : institutionnelle, imprévue, reprise prévue par la DE — mais la reprise est
    souvent grévée elle aussi, et il reste alors **une journée perdue nette** que l'enseignant
    doit absorber. Donc : une journée institutionnelle **sans** reprise doit rester exprimable.
  - **tempête** : institutionnelle, imprévue, reprise (nouveau calendrier de la DE).
  - **maladie** : personnelle, sans reprise (« à moins d'un cas exceptionnel prévu par
    l'enseignant, mais c'est vraiment exceptionnel »). Donc : la reprise doit rester
    **optionnelle** sur le personnel, pas interdite.

---

## #374 🟢 Zéro-dette : les deux cartes d'événements sont le même objet, dupliqué

- [ ] 🟢 **#374** « Congés fériés et activités institutionnelles » et « Événements imprévus »
      partagent **exactement** le même formulaire. Deux clés, deux `<select>` identiques, deux
      chemins de code, un seul concept.

- **Constat (code + captures du 4 août)** : les deux formulaires offrent les mêmes champs
  (date, description, type d'événement, horaire de reprise, date de reprise) et les mêmes deux
  valeurs de nature. Les fonctions sont dupliquées par suffixe : `…V2Prevu` / `…V2Imprevu`
  (`js/trimestre-v2-init.js:509/530`, `545/558`, `592/612`, `632/717`). Seule différence réelle :
  la clé de stockage (`evenementsPrevus` / `evenementsImprevus`).

- **Pourquoi ça compte** : `CLAUDE.md` — *« Tout nouveau chantier RETIRE ce qu'il remplace, il
  ne l'empile pas à côté. »* Ici la dette est déjà là. Chaque item touchant ce formulaire (#373,
  #369, #370) doit être appliqué **deux fois**, avec le risque classique d'en oublier un.

- **Correctif attendu** : une carte « Journées sans cours », un formulaire, une clé. La
  prévisibilité devient un attribut de l'événement (ou se déduit de sa nature) plutôt qu'une
  propriété de l'endroit où on l'a saisi. Migration des données existantes des deux clés vers
  une seule — **avec backup et golden master**, c'est une clé de données réelle.

- **Séquencement** : après #373. Faire #373 sur deux formulaires puis les fusionner est du
  travail perdu — mais fusionner avant la rentrée est trop risqué. **Décision à prendre par
  Grégoire** : soit #373 minimal maintenant + #374 à l'automne, soit #374 tout de suite et #373
  disparaît dedans.

---

## #375 🟢 Recalage du calendrier en cours de trimestre (nouveau calendrier de la DE)

- [ ] 🟢 **#375** Un calendrier de trimestre est aujourd'hui figé à la configuration. En cas de
      grève ou de tempête, la direction des études **réémet un calendrier** — l'app n'a rien
      pour absorber ça.

- **Témoignage Grégoire (4 août 2026)** : « Les journées de tempêtes sont reprises elles aussi.
  La direction des études fournit de nouveaux calendriers dans les deux cas. »

- **Décision Grégoire, même séance** : **pas d'automatisme.** *« Il ne faut pas coder en dur ma
  pratique. En général, quand un cours disparaît du calendrier, l'utilisateur doit faire
  manuellement les changements. C'est plus simple ainsi. »*

- **Ce que l'item couvre donc** : rendre le recalage manuel **possible et lisible** — pas
  automatique. Questions ouvertes : que deviennent les échéances d'artefacts déjà datées ?
  les séances déjà saisies (présences) ? Faut-il **signaler** qu'un artefact accroché à la
  semaine 8 tombe désormais en semaine 9, sans le déplacer ?

- **Horizon** : automne 2026. Rien ne presse — ça n'arrivera pas avant que ça n'arrive.

---

## Ce qui reste à trancher par Grégoire

> **✅ TRANCHÉ le 4 août 2026 au soir (Grégoire, via Claude Code, question fermée) :**
>
> 1. **Fusion immédiate** : #374 d'abord, #373 absorbé dedans (« Il n'y a pas de migration,
>    puisqu'aucune donnée. Pas de souci. » — NB Claude Code : les 2 congés déjà saisis sur
>    A2026 seront migrés quand même, filet trivial). Une carte « Journées sans cours »,
>    une clé, natures institutionnel / férié / personnel, reprise optionnelle partout.
> 2. **Semaine de planification : 12-16 octobre, bloc simple** (comme le CSV de séquence).
> 3. **Semaine d'examens : corrigée par Grégoire lui-même** (14→18/12, fait dans l'UI).
> 4. **Pas de statut « RC » dédié** — absorbé dans le bloc 12-16 oct (cohérent avec 2) ;
>    la Journée Carrière du 9 nov = congé institutionnel avec reprise (déjà exprimable).
>
> ⚠ **Renumérotation au versement** : #366-#368 de ce relais entrent en collision avec les
> #366-#368 déjà pris dans `BACKLOG.md` sur la branche d'alignement (badge « En évolution »,
> namespacing `planification_seances`, migration carte 601-101). Verser les items de ce
> relais sous **#369-#378** après le merge.

Questions d'origine (conservées pour trace) :

1. **#374 avant ou après #373** — fusionner les deux cartes maintenant, ou ajouter « Férié »
   deux fois puis fusionner à l'automne.
2. **Semaine de planification : 12-16 octobre ou 14-16 ?** Le calendrier officiel distingue
   12 oct (Action de grâce, férié), 13 oct (journée RC) et 14-16 oct (planification). Le CSV de
   séquence dit « Pause d'automne du 12 au 16 octobre ». Effet identique sur les comptes,
   différent sur ce que voit l'utilisateur.
3. **Semaine d'examens** : corriger la saisie A2026 de `14/12 → 21/12` vers `14/12 → 18/12` ?
4. **Journée « RC » du 13 octobre** : l'app n'a aucun statut pour une journée d'évaluation ou de
   reprise institutionnelle. On l'absorbe dans la semaine de planification, ou on ouvre un item ?

## Ce que je n'ai pas vérifié

- La fonction qui **attribue** `numeroSemaine` : non localisée. Le recul observé entre le
  13 et le 16 novembre est un fait ; sa cause est une hypothèse.
- Le comportement sur **iPad** : aucun des constats n'a été vérifié en tactile.
- Les trimestres **a2025 / h2026** : les compteurs y sont-ils faux de la même façon ?
  À vérifier avant de conclure que #366 et #367 sont propres à A2026.
