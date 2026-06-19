# Tests manuels pendants — 19 juin 2026

**Cible** : Grégoire, à exécuter sur **Mac** (Safari) dès le retour d'un accès machine.
**Contexte** : consolide toutes les validations « terrain Mac » accumulées et restées
en attente parce que les sessions Claude Code tournent en cloud (rendu UI non
vérifiable, données live non touchables, Playwright/WebKit non lançable hors CI).
État de référence : bêta publique **1.19.2** (build 0617-1822). 847 Vitest verts.

> **Pourquoi cette liste existe** : depuis ~12 juin, Grégoire travaille sans accès
> Mac régulier. Le code et les tests automatisés sont complets côté cloud, mais
> plusieurs chantiers ont une **porte de validation terrain** (rendu sombre/clair,
> persistance réelle, données live) qui ne peut se franchir que sur la machine.

**Comment lire ce document** : chaque test a une **Marche à suivre** numérotée
(clic par clic) et un **Résultat attendu**. Coche `☐ → ☑`. Si un écart apparaît,
note-le sous le test et reporte dans `SUIVI-BUGS.md`.

**Temps total estimé** : ~3-4 h (étalable). Les sections 🔴 sont prioritaires.

---

## Préparation commune (à faire une fois au début)

1. Ouvrir le Terminal :
   ```bash
   cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6   # chemin Mac habituel
   git fetch origin
   git status                       # propre côté tracké
   git log --oneline -5             # vérifier la version déployée (1.19.2 ou +)
   npx http-server -p 8080 -c-1     # démarre le serveur local
   ```
2. Ouvrir **Safari** à `http://localhost:8080/`.
3. Ouvrir la console : menu **Développement → Afficher la console JavaScript**
   (`⌥⌘C`). Si le menu Développement est absent : Safari → Réglages → Avancées →
   cocher « Afficher les fonctionnalités pour développeurs web ».
4. **Tester chaque rendu visuel dans les DEUX modes** (sombre ET clair). Le bouton
   de bascule du thème est dans l'en-tête de l'app (icône lune/soleil).
5. Repère utile : l'app est une SPA. La **navigation principale** se fait par les
   onglets de section en haut (Tableau de bord, Cadre, Conception, Évaluation,
   Labo…), puis par une **sous-navigation** (sidebar ou onglets) dans chaque section.

---

## 🔴 Section A — Banc de décision (Comparateur de pratiques) — #326

> Déployé en 1.19.0 → 1.19.2 mais **le rendu UI n'a jamais été vu sur Mac**.
> C'est la plus grosse porte terrain ouverte. Source unique :
> `plans de travail/RELAIS-326-refonte-banc-decision.md`.

### A.1 — Ouvrir le banc et vérifier l'amorçage
**Marche à suivre :**
1. Clique sur l'onglet de section **Labo**.
2. Dans la sous-navigation, clique sur **« Exploration des pratiques »**.
3. Regarde la console.

**Résultat attendu :** la vue s'affiche, **aucune erreur rouge** en console. ☐

### A.2 — Note « Outil en développement »
**Marche à suivre :** observe le haut de la vue du comparateur.
**Résultat attendu :** un bandeau **« Outil en développement »** est visible, avec
le texte expliquant qu'une note à 0 signifie le plus souvent que la note *ne peut
pas être construite* (pas forcément une erreur). ☐

### A.3 — Source des données par défaut
**Marche à suivre :** repère le sélecteur **« Source des données : »** en tête du banc.
**Résultat attendu :** il est par défaut sur **« Profils fictifs (depuis ton
échelle) »** — le banc tourne d'emblée sur des profils générés, sans « mode démo »
bloqué. ☐

### A.4 — Bascule fictif ↔ réel
**Marche à suivre :** dans le sélecteur source, choisis **« Mon groupe actif
(données réelles) »**, puis reviens à **« Profils fictifs »**.
**Résultat attendu :** le tableau se recharge dans chaque mode sans erreur ; le mode
réel reste en **lecture seule** (n'écrit rien). ☐

### A.5 — Colonnes du tableau (paires)
**Marche à suivre :** observe les colonnes du tableau de comparaison.
**Résultat attendu :** **2 à 3 pratiques** présentées **en paires**, sans colonne
« de référence » privilégiée. ☐

### A.6 — Section « Construction de la note »
**Marche à suivre :** repère la section **« Construction de la note »**.
**Résultat attendu :** les attributs sont **alignés par axe** (pondération, reprises,
nombre de productions, puis attributs propres à la famille) ; les axes hors famille
affichent **« s.o. »**. ☐

### A.7 — Section « Résultat — profils-types »
**Marche à suivre :** repère la section **« Résultat — profils-types »**.
**Résultat attendu :** une **note par colonne** ; une colonne **DEN** affiche un
**jugement** (pas de note calculée). ☐

### A.8 — Lien par colonne vers le formulaire
**Marche à suivre :** clique sur le lien d'ouverture du formulaire au pied/haut d'une
colonne (vers `editerPratique`).
**Résultat attendu :** le **formulaire de cette pratique s'ouvre** (le banc ne contient
pas d'éditeur embarqué). ☐

### A.9 — Arbre des maquettes : Dériver
**Marche à suivre :** dans l'arbre des maquettes, repère une **souche** (pratique
racine) et clique **« Dériver une maquette »**.
**Résultat attendu :** une maquette « souche · essai N » est créée et apparaît sous
la souche. ☐

### A.10 — Garde-fou « max 1 dérivé » + actions de maquette
**Marche à suivre :** sélectionne la **maquette** créée en A.9.
**Résultat attendu :** elle offre **« Comparer »**, **« Adopter »**, **« Jeter »** —
mais **PAS** « Dériver une maquette » (le bouton Dériver n'existe que sur une souche).
Teste **Jeter** (la maquette disparaît) puis re-dérive pour tester **Adopter** (elle
devient une pratique normale). ☐

### A.11 — Bannière « Gérer mes maquettes » (modale Bibliothèque)
**Marche à suivre :**
1. Va dans **Conception → Pratiques de notation**.
2. Ouvre la **bibliothèque des pratiques** (bouton « Consulter la bibliothèque » /
   icône bibliothèque).
3. Observe le haut de la modale (s'il existe au moins une maquette).

**Résultat attendu :** une bannière annonce **« Tu as X maquette(s)… »** avec un
bouton **« Gérer mes maquettes »**. Clique-le → la modale se ferme et tu arrives sur
**Labo › Exploration des pratiques**. ☐

### A.12 — Lien « Comparer ce type de notation » depuis le wizard
**Marche à suivre :**
1. **Conception → Pratiques de notation → « + Nouvelle pratique »**.
2. Avance jusqu'au **récapitulatif** (dernière étape).
3. Repère la section **« Comparer ce type de notation »** et clique **« Ouvrir le
   comparateur du Labo »**.

**Résultat attendu :** le wizard se ferme, arrivée sur le banc. ☐

### A.13 — Rendu dans les deux modes
**Marche à suivre :** refais A.1 → A.7 en **mode clair** puis **mode sombre**.
**Résultat attendu :** tout est lisible, conforme au design system, sans couleur
hors palette. ☐

### A.14 — Affichage « — non constructible » (au lieu d'un 0 trompeur)
> Nouveau, livré dans la PR #53 (#326 sous-item). Le banc distingue désormais un
> **vrai 0 calculé** d'une note que le moteur **ne peut pas bâtir** (avant : « 0 »
> dans les deux cas).
**Marche à suivre :**
1. Dans le banc, mets en colonne une pratique dont la note ne se construit pas
   (typiquement **PAN-Standards** sur le corpus fictif — cf. observation STD=0).
2. Regarde la cellule de « Résultat — profils-types » pour cette colonne.
3. Survole la cellule (tooltip) et, si possible, vérifie l'étiquette au lecteur d'écran.
4. Exporte le **CSV** du banc et ouvre-le.

**Résultat attendu :**
- La cellule affiche **« — non constructible »** (et non « 0 ») ; le mot
  « non constructible » est lisible (atténué, italique), en **2 modes**.
- Tooltip / `aria-label` : « Note non constructible avec ces paramètres — ce n'est
  pas un zéro. »
- Une colonne dont la note **est réellement 0** continue d'afficher **« 0 »**.
- Dans le CSV, la colonne porte **« non constructible »** (distinct d'une cellule
  vide et d'un 0). ☐

> **⚠️ Point d'observation connu — STD / notes à 0** (captures IMG_6289..6291) :
> une pratique **PAN-Standards** rend **0 pour tous**, en fictif ET réel. Hypothèse
> Grégoire : peut-être une **impossibilité de construire la note** (paramètres de la
> pratique vs résultats réels), pas un bug. **À qualifier sur données réelles** :
> note **quelle(s) pratique(s)** donnent 0 et **avec quels réglages**. Ne PAS relancer
> l'investigation code sans ce constat terrain (décision actée).

---

## 🔴 Section B — Famille DEN : grille + échelle de rétroaction — #343

> Modèle/formulaire livrés. Principe : critères **toujours explicites** ; la note
> certificative (RREC 60/59) n'arrive qu'à la fin.

### B.1 — Démarrer une pratique DEN
**Marche à suivre :**
1. **Conception → Pratiques de notation**.
2. Clique **« + Nouvelle pratique »**.
3. Choisis la **« Voie rapide »**, puis sélectionne **« PAN – Dénotation (DEN) »**.

**Résultat attendu :** le wizard entre dans l'étape de configuration DEN
(`config-denotation`). ☐

### B.2 — Selects optionnels échelle / grille
**Marche à suivre :** dans l'étape de config DEN, repère les deux listes déroulantes.
**Résultat attendu :** deux selects **optionnels** :
- **« Échelle de performance (optionnelle, pour la rétroaction) »**
- **« Grille de critères (optionnelle, pour la rétroaction) »** ☐

### B.3 — Texte de cadrage
**Marche à suivre :** lis le paragraphe d'aide au-dessus des deux selects.
**Résultat attendu :** il dit en substance que ces éléments **rendent les critères
explicites mais ne calculent pas la note finale — celle-ci reste le jugement posé à
la fin**. ☐

### B.4 — Création
**Marche à suivre :** renseigne les cibles, choisis (ou non) une échelle/grille,
termine le wizard et **crée** la pratique.
**Résultat attendu :** la pratique DEN se crée **sans exiger d'échelle** ; au
récapitulatif, l'échelle/grille apparaît avec la mention **« (rétroaction) »**. ☐

### B.5 — Round-trip d'édition (test clé)
**Marche à suivre :**
1. Retourne dans **Conception → Pratiques de notation**.
2. Sélectionne la pratique DEN créée pour la **rouvrir en édition**.

**Résultat attendu :** l'édition **restaure cibles + suggestion + échelle/grille**
(c'est le gap pré-existant comblé par #343 — rien ne doit être vide). ☐

### B.6 — Descriptions DEN corrigées
**Marche à suivre :** survole/affiche le tag DEN et son hover dans la bibliothèque,
ainsi que la bannière du wizard pour DEN.
**Résultat attendu :** les textes disent **« critères explicites »** + **« note
certificative à la fin »** ; **plus** de « autoévaluation guidée » ni « commentaire
plutôt que sur le score ». ☐

### B.7 — Colonne DEN au banc
**Marche à suivre :** ouvre le Comparateur (A.1) avec une pratique DEN parmi les colonnes.
**Résultat attendu :** la colonne DEN montre **échelle + grille** dans « Construction
de la note » (plus de « à venir #343 »). ☐

---

## 🟡 Section C — Responsive sidebar : pages divergentes — #283

> Option B (empilement < 1024 px) déjà **validée + mergée** pour les 5 pages
> bibliothèque. Reste les **deux pages au layout divergent**.

**Méthode de redimensionnement** : soit réduire la largeur de la fenêtre Safari à
moins de 1024 px, soit **Développement → Entrer en mode Responsive Design** et choisir
un gabarit iPad.

### C.1 — Évaluation › Liste, étroit
**Marche à suivre :** va dans **Évaluation → Liste**, réduis la fenêtre sous 1024 px.
**Résultat attendu :** la sidebar **s'empile** proprement, **pas** de zone serrée à
220 px, pas de scroll horizontal. ☐

### C.2 — Calendrier, étroit
**Marche à suivre :** ouvre la vue **Calendrier**, réduis sous 1024 px.
**Résultat attendu :** mise en page empilée correcte, pas de scroll horizontal. ☐

### C.3 — Portrait / paysage
**Marche à suivre :** en mode Responsive Design (gabarit iPad), bascule
portrait ↔ paysage sur C.1 et C.2.
**Résultat attendu :** correct dans les deux orientations, deux modes. ☐

> Si un défaut subsiste : décider l'**option A** (unifier sur `.layout-sidebar-2col`)
> pour ces deux pages.

---

## 🟡 Section D — Durée de période — #328 (Lot 0)

### D.1 — Persistance du select
**Marche à suivre :**
1. **Cadre → Trimestre**, descends à la section **« Horaire »**.
2. Dans le select **« Durée d'une période : »**, choisis **50 minutes** (ou une
   valeur différente de l'actuelle).
3. **Recharge** la page (`⌘R`) et reviens au même select.

**Résultat attendu :** la valeur choisie **persiste** après reload (options
disponibles : 50 / 55 / 60 / 75 / 90 min). ☐

### D.2 — Effet sur l'horaire
**Marche à suivre :** après D.1, observe l'assemblage horaire du trimestre.
**Résultat attendu :** la durée choisie se **reflète** dans l'horaire. ☐

---

## 🟡 Section E — Bibliothèque cours en V2 — #282 (candidat à clôture)

> Audit statique (15 juin) : `cours.js` ne lit plus `listeCours` qu'à 1 endroit
> (fallback commenté). Le symptôme « modal vide en V2 » est **probablement déjà
> résolu**. **Une seule vérif terrain.**

### E.1 — Modal Bibliothèque cours
**Marche à suivre :** **Cadre → Cours**, clique le bouton **« Bibliothèque »**.
**Résultat attendu :** la modal s'ouvre **avec la liste des cours** (non vide). ☐

### E.2 — Reprise dans le trimestre
**Marche à suivre :** dans la modal, clique **« Reprendre dans ce trimestre »** sur un cours.
**Résultat attendu :** un groupe-cours est créé pour ce cours dans le trimestre
actif, sans erreur. ☐

> **Si E.1 OK → on peut CLORE #282.** Ne PAS relancer la migration de masse revertée.

---

## 🟠 Section F — Confirmation contamination productions — #340

> Symptôme réparé + **garde-fou actif** (1.17.7) qui **refuse l'écriture corrompue**
> et **journalise la pile du fautif**. Reste à **reproduire** pour confirmer et
> **capturer la preuve** si la garde se déclenche.
> Enquête : `Rapports/ENQUETE-340-contamination-productions-2026-06-15.md`.

### F.1 — Reproduction de la séquence déclenchante
**Marche à suivre :**
1. Bascule sur le trimestre **A2025** (en-tête → sélecteur de trimestre).
2. Ouvre une **évaluation** d'A25 et **fais une saisie** (note/critère).
3. **Quitte A25**, reviens à **H2026**.
4. **Hard refresh** : `⌥⌘R` (ou vider le cache puis `⌘R`).
5. En console, vérifie le contenu des productions H2026 :
   ```js
   db.getSync('h2026_productions', []).map(p => p.coursId)
   ```

**Résultat attendu :** la liste contient les **artefacts natifs H2026**
(`h2026-601-101-MQ-00001`…), **PAS** les 11 productions d'A25
(`COURS1766455789356`). ☐

### F.2 — Relever la pile si la garde se déclenche
**Marche à suivre :** pendant F.1, surveille la console pour un message de **garde
d'écriture #340** (refus + pile d'appel).
**Résultat attendu (si déclenchée) :** **copie la pile d'appel** affichée — elle
**prouve l'écrivain fautif**. Colle-la sous ce test et dans `SUIVI-BUGS.md`. ☐

### F.3 — État du quota localStorage
**Marche à suivre :** en console :
```js
let total = 0; for (let k in localStorage) { if (localStorage.hasOwnProperty(k)) total += localStorage[k].length; }
console.log('Taille localStorage ~', Math.round(total/1024), 'Ko');
```
**Résultat attendu :** noter la taille ; si proche de la limite (~5 Mo Safari),
le localStorage du Mac est **saturé** → verser le constat à **#334**. ☐

---

## 🟠 Section G — Chaîne horaire ↔ groupe-cours (Constat 1) — #332

> Constat 2 (SSOT) livré. Reste le **Constat 1 (no-op UI silencieux)** : deux
> mécanismes confirmés à la lecture. **Repros pour valider le diagnostic — aucun fix
> n'est appliqué.** Source : `Rapports/ENQUETE-332-CONSTAT1-2026-06-11.md`.

### G.1 — Mécanisme A : le select horaire est-il écrasé ?
**Marche à suivre :**
1. **Cadre → Groupes-cours**, sélectionne le **GC 00008**.
2. Ouvre le select **« Horaire »** et choisis un **AUTRE** horaire.
3. **Observe le select juste après le choix** : revient-il tout seul à l'ancien horaire ?
4. En console, avant et après **« Enregistrer »** :
   ```js
   db.getSync(cle('groupesCours'), []).map(g => ({id: g.id, horaireId: g.horaireId}))
   db.getSync(cle('horaires'), []).map(h => ({id: h.id, nom: h.nom, groupeAssocie: h.groupeAssocie}))
   ```

**Résultat attendu (diagnostic confirmé si) :** le select **saute en arrière** à
l'ancien horaire, et `horaireId` **ne change pas** après Enregistrer malgré le toast
de succès. Si **plusieurs horaires** partagent le même `groupeAssocie`, l'aggravant
est en jeu. ☐

### G.2 — Mécanisme B : sauvegarde « réussie » qui ne modifie rien
**Marche à suivre :**
1. **Cadre → Groupes-cours**, sélectionne un GC en **H2026** (le formulaire se remplit).
2. Change le **trimestre actif** (→ A2025), puis reviens à la page Groupes-cours
   **SANS resélectionner** de GC.
3. Modifie n'importe quel champ → **« Enregistrer »**.
4. En console :
   ```js
   db.getSync(cle('groupesCours'), []).find(g => g.id === '<id du GC>')
   ```

**Résultat attendu (diagnostic confirmé si) :** toast **« Groupe-cours modifié »**
affiché, mais **aucune trace** de la modification en stockage (no-op silencieux). ☐

> Repros = valider le diagnostic avant de coder un fix (options 1/2/3 du rapport).

---

## 🟠 Section H — Réparation attribution CC (données live) — #342

> Données live non corrigeables depuis le cloud. Symptôme : « PAN-Littérature A25 »
> s'affiche **« par Bruno V. »** alors que Grégoire en est l'auteur. Cause :
> `auteur_original` figé sur la mauvaise identité (`cc-license.js:44/154`).

### H.1 — Audit READ-ONLY
**Marche à suivre :** en console (lecture seule) :
```js
db.getSync(cle('pratiquesConfigurables'), [])
  .map(p => ({ id: p.id, nom: p.nom, auteur: p.auteur_original, contrib: p.contributeurs }))
```
**Résultat attendu :** repérer les pratiques dont `auteur_original` ≠ Grégoire
(ex. « Bruno V. »). **Lister les ids concernés** avant toute écriture. ☐

### H.2 — Ré-écriture ciblée (patron #331)
**Marche à suivre :** appliquer le **one-shot préparé en session #341** (à récupérer
dans les notes locales / SUIVI-BUGS) : pour chaque id repéré, réécrire
`auteur_original` (et nettoyer `contributeurs`) vers l'identité correcte, puis
persister via `db.setSync(cle('pratiquesConfigurables'), …)`.
**Résultat attendu :** seules les pratiques visées sont corrigées (audit H.1 d'abord). ☐

### H.3 — Vérification d'affichage
**Marche à suivre :** recharge l'app, ouvre la carte de la pratique corrigée.
**Résultat attendu :** la carte affiche le **bon auteur**. ☐

> Prévention (défaut d'identité CC explicite) = chantier code séparé, reporté
> (décision Grégoire). Ici on ne fait que **réparer la donnée**.

---

## 🟠 Section I — Purge de l'espace précédent — #336

> Preview (lecture seule) livré : à l'ouverture d'un codex, un **plan de purge** est
> affiché en console et **persiste** au reload. La purge est **manuelle**.

### I.1 — Lire le plan de purge
**Marche à suivre :**
1. Ouvre un **codex** (Réglages/Codex → importer/ouvrir un codex).
2. En console, repère les lignes **`[Codex] #336 purge (PREVIEW — rien n'est
   supprimé)`** : nombre de **clés orphelines** et de **blobs orphelins**, puis leur liste.

**Résultat attendu :** le plan s'affiche ; **rien n'est supprimé** à ce stade.
Chiffre l'ampleur (combien de clés/blobs). ☐

### I.2 — Décider / exécuter la purge
**Marche à suivre :** après vérification humaine de la liste, **si tu décides de
purger**, exécute en console :
```js
Codex.purgerEspacePrecedent()
```
**Résultat attendu :** log **`#336 purge terminée : N clé(s), M blob(s) supprimé(s)`**.
Si tu préfères ne pas purger maintenant, **ne lance pas** la commande — le plan
restera réaffiché au prochain boot. ☐

---

## Rapport final

Une fois les sections cochées :

1. **Bilan** : combien de ☐ → ☑ ? Anomalies bloquantes vs cosmétiques ?
2. **Mises à jour** :
   - Bugs trouvés → `Retours des testeurs/SUIVI-BUGS.md` (section Ouverts), avec
     screenshot console si erreur.
   - Clôtures possibles : **#282** (si E.1 OK), **#326 / #343** (si rendu validé →
     lever la porte terrain), **#336** (selon décision I.2).
   - Reporter le verdict dans `SESSION.md` et le `BACKLOG.md` des items concernés.
3. **Décision release** : #326/#343 = code complet en 1.19.2 ; la validation terrain
   est la **dernière porte** avant de considérer ces chantiers entièrement clos.

---

**Document créé** : 19 juin 2026. Réf. version 1.19.2 (build 0617-1822).
À conserver tant que tous les ☐ prioritaires (🔴/🟡) ne sont pas traités.
Remplace de fait `TESTS-MANUELS-PENDING-2026-05-22.md` (périmé, sections C-F reportées).
