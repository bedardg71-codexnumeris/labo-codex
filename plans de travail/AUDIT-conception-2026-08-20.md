# AUDIT « Conception » — Rapport de constats (session 2 de 2)

> **Date** : 20 août 2026 (soir) · **Référence auditée** : 1.88.4 (build `0820-1458`), HEAD `156e3dc8` (= `origin/main`, inclut la retouche Productions 1.88.4 et le rapport de la session 1)
> **Cadre** : `plans de travail/PLAN-AUDIT-cadre-conception-2026-08-20.md`, section 6 (session 2 de 2)
> **Nature** : constats seulement — aucun correctif, aucune écriture hors rapport/SESSION/RELAIS.
> **Méthode** : revue de code sur les 6 axes du §4.2 (quatre passes parallèles par groupes de
> fichiers PUIS contre-vérification aux lignes citées), et reproduction Chromium des scénarios
> §6.3 sur profil vierge (harnais file:// jetable en scratchpad, jamais les données réelles).
> Niveaux de preuve : **[NAV]** reproduit au navigateur, **[CODE]** vérifié aux lignes citées,
> **[AGENT]** rapporté par une passe de revue, non contre-vérifié.

⚠⚠ **ÉCART DE PRÉMISSE — LE PLAN N'EXISTE PAS DANS LE DÉPÔT.** Le fichier
`PLAN-AUDIT-cadre-conception-2026-08-20.md` est absent de l'arbre ET de tout l'historique git
(vérifié sur les 4310 commits, toutes refs, après `git fetch --unshallow`). Il est référencé par
RELAIS.md, SESSION.md et le rapport de la session 1, mais n'a jamais été commité — il a
vraisemblablement vécu dans le contexte de la session 1 seulement. **La présente session a
reconstitué le cadre §6** depuis : (a) la prémisse de relance de Grégoire (qui nomme §6.1, §4.2,
§6.3, §4.3 et le livrable), (b) la section « À transmettre à la session 2 » du rapport de la
session 1 (qui cite le §6.4 et son candidat orphelin `cartouches_{grilleId}`), (c) la méthode
observable de la session 1. Si le plan réel diverge de cette reconstitution, les manques sont à
combler dans une passe complémentaire. Second écart, mineur : la branche distante
`claude/audit-conception-session-1-arkmi2` avait été supprimée sur origin (fusion faite) ; elle
est recréée par la présente session avec ce rapport.

---

## Périmètre retenu

Les **cinq onglets d'évaluation** de la section Conception — Productions étudiantes, Grilles de
critères, Échelles de performance, Cartouches de rétroaction, Pratiques de notation — plus le
**moteur** `js/pratiques/` (16 fichiers) et les **jonctions** (GC↔pratique, garde démo,
évaluations↔grilles/cartouches, bascule de trimestre). ~36 400 lignes sur 31 fichiers.
**La Carte d'alignement (1ᵉʳ onglet) est EXCLUE** : elle a son propre audit du 8 août
(`AUDIT-carte-alignement-exports-productions-2026-08-08.md`) et des cycles de portes terrain
actifs (#158 en re-vérification) ; la re-balayer ici aurait dilué la passe sans la remplacer.
À valider avec Grégoire si le plan §6 l'incluait.

## Synthèse (6 lignes)

Le pattern Bibliothèque tient sur ses rails principaux (namespacing #358 effectif, #453 §3
confirmé au navigateur, SSOT `modalitesEvaluation` respectée partout). **Un Bloquant** : éditer
une pratique via l'assistant remplace l'enveloppe entière — `inspireDe` (invariant CC « jamais
effacé »), `estMaquette`, `metadata_cc` et l'auteur d'origine sont détruits par un simple
« Éditer puis Enregistrer ». Les Majeurs se groupent en quatre familles : **suppressions sans
garde** (toutes les entités, gardes vivantes seulement sur du code mort ou partiel ; le magasin
`cartouches_{grilleId}` orphelin du plan §6.4 est confirmé), **« configuré ≠ calculé »** (SPE
dont aucun schéma utilisateur n'atteint le moteur, jetons à trois schémas, snapshot `.config`
qui prime, DEN à faux zéro), **résurrections de clés nues** (fallback legacy ×~50,
`forcerMigration` écrasante à chaque boot, semis du global nu sans garde #358), et **crashs sur
chemins vivants** (suppression d'échelle, ajout de niveau, activation de pratique). L'hypothèse
transmise par la session 1 (garde démo inopérante) est **confirmée et élargie**.

---

## État du dépôt au moment de l'audit

- Base d'audit : `156e3dc8` (= `origin/main` au démarrage), arbre propre, Vitest 2768/2768
  (rituel de début par subagent). Version 1.88.4 — le point 6 de la transmission de la session 1
  (« si la PR #79 est fusionnée, le noter ») est acté : le HEAD audité INCLUT la retouche du
  formulaire Productions (1.88.4).
- BACKLOG.md (« État courant » au 19 août / 1.87.7) est en retard d'un jour sur RELAIS/SESSION —
  signalé par le rituel, non corrigé (hors mandat).

---

## Constats — BLOQUANT

```
[CO-01] Éditer une pratique via l'assistant détruit l'enveloppe : inspireDe,
        estMaquette, metadata_cc et l'auteur d'origine sont effacés  [CODE]
Gravité   : Bloquant
Axe       : 2 et 3 (violation d'un invariant explicite — « inspireDe JAMAIS effacé », SPEC §3.1)
Où        : js/wizard-pratique-v2.js:2451-2468 (l'objet pratique est RECONSTRUIT à neuf :
            aucun report d'inspireDe, estMaquette, metadata_cc, config, dateCreation ;
            dansBibliotheque forcé true) ; :2719-2733 (sauvegarderPratique :
            `pratiques[index] = pratique` — remplacement intégral) ;
            chemins d'entrée VIVANTS : js/pratiques.js:924-942 (editerPratique) et
            js/comparateur-pratiques.js:804 (« Éditer » de l'arbre d'exploration)
Constat   : FAIT (code, contre-vérifié aux lignes) : l'édition wizard repart d'un objet neuf
            qui ne reprend de l'existant que l'id. Conséquences en chaîne : une COPIE perd sa
            trace « Inspiré de » (attribution CC BY + arbre de filiation) ; une MAQUETTE
            devient « aboutie » sans passer par « Adopter » ET réapparaît dans la sidebar
            (dansBibliotheque:true reposé) ; le `.config` exécutable disparaît ; de plus
            chargerPratiqueExistante (:2866-2871) ne remplit pas prenom/nomAuteur (requis) —
            l'éditeur retape son nom et REMPLACE l'auteur d'origine.
Impact    : perte silencieuse de l'attribution CC et du statut de maquette par le geste le
            plus banal du cycle de vie (rouvrir sa pratique pour la retoucher). C'est le
            jumeau Conception du CT-01 : un « Enregistrer » qui détruit en confirmant.
Proposition : BACKLOG — sauvegarderPratique doit FUSIONNER dans l'enveloppe existante
            (préserver inspireDe/estMaquette/metadata_cc/dateCreation), et
            chargerPratiqueExistante doit recharger l'auteur.
```

## Constats — MAJEUR

```
[CO-02] Garde anti-référence-démo : inopérante aux trois quarts — hypothèse de la
        session 1 CONFIRMÉE et ÉLARGIE  [NAV]
Gravité   : Majeur (protection annoncée qui ne protège plus ; famille CT-02 « gardes mortes »)
Axe       : 1 et 3
Où        : js/bibliotheque-ui.js:358-360 (db.getSync(ref.collection) BRUT, jamais cle()) ;
            appelants à littéral nu d'une clé namespacée : js/trimestre-v2-groupes-cours.js:617
            ('pratiquesConfigurables'), js/evaluation-sauvegarde.js:175 ('grillesTemplates'),
            js/evaluation.js:2341 ('grillesTemplates' — 4e appelant, complété par cette
            session), js/pratiques-gestion.js:1429 ('echellesTemplates') ;
            js/bibliotheque-ui.js:39-43 (estItemDemo : isDemo===true OU auteur 'Demo Labo
            Codex') vs js/pack-demo-20.js (ZÉRO flag isDemo ; 2 items seulement portent cet
            auteur — grep)
Constat   : FAIT (reproduit) : la moitié « lookup + estItemDemo » du garde est DOUBLEMENT
            inerte pour grilles/échelles : (1) la collection passée en littéral nu ne résout
            plus rien depuis #358/24 mai ; (2) même interrogé sur la BONNE clé
            (demo_grillesTemplates), estItemDemo rend false pour les items du pack (aucun
            flag, auteur différent) — vérifié au navigateur sur une vraie grille du pack
            (GRILLE_DEMO_*) : verdict null par les DEUX voies. Seule la passe « préfixe
            demo- » survit, et elle ne couvre que les pratiques (demo-std-litt…) — les ids
            GRILLE_DEMO_*/ECH_DEMO_* ne commencent pas par 'demo-'.
Impact    : « Empêche une entité réelle de référencer un item démo non forké » (Plan 1 §3.4)
            n'est plus vrai pour grilles et échelles, aux 4 points de sauvegarde. Exposition
            limitée en usage nominal (#358 G3 isole les modèles démo), réelle par import/
            restauration/résidu.
Proposition : BACKLOG — passer les collections via cle() (ou résoudre par
            resoudreModeleParId), et trancher : flaguer le pack isDemo:true, ou retirer la
            moitié lookup du garde (zéro-dette) en le disant.
```

```
[CO-03] Suppressions d'entités : aucune garde référentielle sur les chemins vivants ;
        les gardes existantes sont mortes, partielles ou contournées  [NAV]
Gravité   : Majeur (famille exacte du CT-02 côté Cadre — en plus étendu)
Axe       : 3
Où        : grille : js/grilles.js:3806-3837 (supprimerGrilleActive, bouton vivant) et :926-953
            (supprimerGrille, data-action) — confirm() générique, rien d'autre ;
            échelle : js/echelles.js:2622-2654 (supprimerGrilleDefinitivement jumeau : « Pas
            de dépendances directes pour les échelles » — commentaire FAUX) alors que
            verifierUtilisationEchelle + migration proposée existent sur l'AUTRE chemin
            (:3684-3811) ; pratique : js/pratiques-gestion.js:880-900 et 2082-2103 (chemins
            vivants, AUCUNE garde) alors que les gardes « pratique active » et « cours
            utilisateurs » vivent dans js/pratiques.js:1096-1132 dont le déclencheur UI est
            mort ; production : js/productions.js:2344-2364 (aucune cascade
            evaluationsSauvegardees/fichiersTravaux/portfolio, verrou `verrouille` jamais
            consulté) ; cartouche : js/cartouches.js:1525-1557 (ni production.cartoucheId ni
            evaluation.cartoucheId ni copie bibliothèque) ; « écraser » du dialogue doublon :
            js/grilles.js:671-675 et js/cartouches.js:747, js/productions.js:1103 —
            suppression par NOM de TOUS les homonymes (verrouillés et inter-cours compris)
Constat   : FAIT (reproduit sur profil ensemencé) : suppression d'une grille référencée par
            une production ET une évaluation grade-bearing ET porteuse d'un magasin de
            cartouches → confirm générique, tout passe, production.grilleId et
            evaluation.grilleId pointent une grille disparue. Suppression d'une pratique
            référencée par un GC NON actif → passe (la garde ne couvre que le GC actif) ;
            gc.pratiqueId orphelin. Garde POSITIVE confirmée : la pratique du GC ACTIF est
            bien refusée (alert explicite).
Impact    : références orphelines muettes sur les cinq familles d'entités ; asymétrie de
            contrat complète avec le cours (#449). L'aval se défend inégalement (cf. CO-13,
            et le verdict #453 §3 plus bas — le formulaire de production, lui, signale).
Proposition : BACKLOG — recensement façon #449 sur suppression de grille/échelle/pratique/
            production/cartouche (nommer les référents) ; étendre la garde pratique à TOUS
            les GC du trimestre ; brancher l'« écraser » du dialogue doublon sur une
            suppression PAR ID avec les mêmes gardes.
```

```
[CO-04] cartouches_{grilleId} : le candidat orphelin du plan §6.4 est CONFIRMÉ — et la
        famille est la seule restée GLOBALE, écrite en brut, partagée réel↔démo  [NAV]
Gravité   : Majeur
Axe       : 1 et 3
Où        : orphelin : aucun des chemins vivants de suppression de grille ne touche
            cartouches_{grilleId} (seul js/grilles.js:2634-2645 BLOQUE si des cartouches
            existent — politique inverse, troisième politique chez donnees-v2.js:1571 qui
            nettoie) ; export : js/cartouches.js:1607-1623 (exporterCartouches scanne TOUTES
            les clés cartouches_*, orphelines comprises) ; archive contournée : 16 écritures
            de cartouches.js + js/productions.js:756 accèdent `cartouches_${grilleId}` en
            BRUT alors que cle() route vers la copie archivée en trimestre archivé
            (js/trimestres.js:298-305) ; démo : js/cartouches.js:411-424 (création sans flag
            isDemo) sur clé globale partagée réel/démo
Constat   : FAIT (reproduit) : après suppression de la grille, le magasin
            cartouches_GRILLE_TEST_AUDIT subsiste intégralement (commentaires compris).
            FAIT (code) : en trimestre archivé, Conception écrirait le magasin global vivant
            pendant que les écrans d'évaluation lisent la copie archivée — divergence
            silencieuse. INFÉRENCE (confiance moyenne, repro non jouée) : une cartouche créée
            PENDANT le mode démo sur une grille d'id partagé (GRILLE_GENERIQUE existe des
            deux côtés) survit au nettoyage de désactivation (filtre par flag) et apparaît en
            réel — et réciproquement les cartouches réelles sont modifiables depuis la démo.
Impact    : stockage global qui ne fait que grossir ; cartouches fantômes exportées ;
            re-rattachement possible si une grille au même id revient (autre trimestre,
            import) ; seule famille de la section hors du régime namespacé.
Proposition : BACKLOG — à la suppression d'une grille, proposer le sort des cartouches
            (supprimer/garder) ; router TOUTES les écritures par cle() ; trancher le régime
            (globale assumée ou namespacée comme le reste — décision d'architecture avec
            Grégoire).
```

```
[CO-05] Échelles : deux crashs sur les chemins VIVANTS (suppression, ajout/retrait de
        niveau) — l'action réussit, la suite meurt  [NAV]
Gravité   : Majeur
Axe       : 2
Où        : js/echelles.js:1081 (supprimerEchelle appelle afficherEchellesPerformance —
            fonction INEXISTANTE dans tout le dépôt, grep ; bouton vivant
            data-action="supprimerEchelle", echelles.js:335) ; js/echelles.js:3531 et :3576
            (ajouterNiveauAEchelle/retrait : #nbNiveauxEchelle n'existe pas dans index.html
            → TypeError après CHAQUE ajout/retrait de niveau) ; même famille, chemins morts
            mais exposés : echelles.js:853-854 (btnExporter jamais déclaré),
            grilles.js:1904/echelles.js:2098 (afficherGrillesExistantes/… inexistantes →
            l'import RÉUSSI afficherait une alerte d'échec)
Constat   : FAIT (reproduit) : supprimerEchelle('ECHELLE_GENERIQUE') → ReferenceError à
            :1081. La suppression EST effective (écrite :1073), le tombstone est posé, les
            rafraîchissements :1075-1079 passent, mais le toast de succès (:1082) ne s'affiche
            jamais — aucune rétroaction, rejet de promesse non géré. [CODE] pour :3531/:3576.
Impact    : sur un geste nominal de l'éditeur d'échelles, l'utilisateur agit sans retour
            (suppression) ou avec un compteur de sidebar périmé (niveaux) ; bruit console
            permanent.
Proposition : BACKLOG — retirer l'appel :1081 (zéro-dette) ; retirer ou recibler les
            mises à jour #nbNiveauxEchelle.
```

```
[CO-06] DEN : un jugement enregistré SANS note produit un vrai zéro certifié, et la
        garde « 59 » repose sur des ids de cibles positionnels  [NAV]
Gravité   : Majeur (intégrité de la note ; contrat « aucune saisie → null, jamais 0 » contourné)
Axe       : 2
Où        : js/pratiques/pratique-configurable.js:266 (`typeof saisie.noteFinale === 'number'
            ? … : 0`) ; js/pratiques/denotation-saisie-ui.js:218-226 (l'UI accepte
            d'enregistrer avec note vide, persistée null) ; ids positionnels :
            js/wizard-pratique-v2.js:2653-2658 (cible-1, cible-2… régénérés à chaque
            réédition) vs js/pratiques/pratique-configurable.js:263-264 (confirmations
            indexées par c.id)
Constat   : FAIT (reproduit) : pratique DEN, jugement { cibles toutes cochées,
            noteFinale: null } → calculerPerformance rend 0 ; l'étudiant SANS saisie rend
            bien null (contrôle). Le zéro s'affiche comme une note arrêtée.
            FAIT (code) : rééditer la pratique en réordonnant/insérant des cibles régénère
            les ids → les confirmations déjà saisies ne matchent plus → plafond 59 silencieux
            sur des jugements précédemment ≥ 60.
Impact    : faux zéro certifié (RREC !) pour un étudiant en cours de jugement ; notes DEN
            modifiées rétroactivement par une simple retouche de config, sans signal.
Proposition : BACKLOG — note absente ⇒ null (non calculable), jamais 0 ; ids de cibles
            STABLES (générés une fois, préservés au round-trip — même chantier que #158
            côté carte).
```

```
[CO-07] Pratiques : ce que l'utilisateur configure n'est PAS ce que le moteur calcule
        (SPE trois schémas ; jetons trois schémas ; snapshot .config qui prime)  [NAV/CODE]
Gravité   : Majeur
Axe       : 1 et 2
Où        : SPE — moteur : js/pratiques/pratique-configurable.js:361-379 (délégation paliers
            SEULEMENT si typesTravaux+tableBundles ; sinon repli auto-référentiel
            indicesCP.actuel.P||0) ; écrivains : wizard (js/wizard-pratique-v2.js:2627-2650 :
            seuilAcceptabilite/jetons/modeleBundle), gabarits+éditeur
            (js/pratiques-bibliotheque.js:70-104, js/pratiques-gestion.js:1858-1900 :
            forfaits/travaux) — AUCUN n'écrit typesTravaux/tableBundles ; seul écrivain de
            tableBundles dans tout js/ : le pack démo (grep) ; en prime wizard écrit
            `seuilAcceptabilite`, éditeur/gabarits lisent `seuilAcceptable` ; et
            chargerPratiqueExistante n'a PAS de branche specifications (round-trip SPE
            inexistant, js/wizard-pratique-v2.js:2883-2946).
            Jetons — js/evaluation-jetons.js:107-110 lit configuration.jetons PUIS
            config.jetons PUIS pratique.jetons ; l'éditeur écrit le 3e
            (js/pratiques-gestion.js:1544-1553), le wizard le 1ᵉʳ, les copies portent le 2e.
            Copies — js/pratiques.js:998 (copie.config = snapshot résolu, échelle EMBARQUÉE
            avec niveaux) + js/pratiques/pratique-registre.js:241-244 (config.echelle prime) :
            l'éditeur n'écrit QUE configuration.* → ses modifications n'atteignent jamais le
            calcul d'une pratique dupliquée/importée.
Constat   : FAIT (reproduit) : une SPE en forme wizard résout (code SPE) mais
            calculerPerformance rend null/0 — jamais un palier. FAIT (code, lignes
            contre-vérifiées) pour les trois mécanismes. La sentinelle SPE de juin ne couvre
            que la forme démo.
Impact    : un enseignant qui crée/adopte une SPE réelle n'obtient JAMAIS un calcul par
            paliers tout-ou-rien ; désactiver les jetons dans l'éditeur ne les désactive pas ;
            retoucher le portfolio d'une copie ne change pas sa note. Le récit de calcul rend
            null en silence.
Proposition : BACKLOG — unifier le schéma SPE (un seul vocabulaire, migration des trois),
            un seul emplacement jetons, et faire de configuration.* la source que le
            résolveur prime (le .config devient cache reconstruit).
```

```
[CO-08] Activer une pratique du wizard : la SSOT est écrite PUIS le chargement lève un
        TypeError — état incohérent avec message d'erreur  [NAV]
Gravité   : Majeur
Axe       : 2
Où        : js/pratiques/pratique-manager.js:91-105 (écrit groupesCours[].pratiqueId AVANT
            chargerPratiqueActive) ; :58-67 (new PratiqueConfigurable(pratiqueData.config) —
            les pratiques wizard n'ont pas de .config) ; ne passe pas par
            construireConfigComplete (exposé exprès, pratique-registre.js:777) — même bug de
            forme que #326 T3, corrigé dans dupliquerPratique, jamais porté au manager
Constat   : FAIT (reproduit) : PratiqueManager.chargerPratiqueActive() sur un GC pointant une
            pratique en forme wizard → TypeError « Cannot read properties of undefined
            (reading 'id') », instance null. L'activation par changerPratiqueActive écrit
            la SSOT puis échoue : « ❌ Erreur » sur une activation réussie côté données.
Impact    : activation d'une pratique créée à l'assistant = erreur affichée, rafraîchissements
            sautés, indices calculés sur instance nulle jusqu'au reload.
Proposition : BACKLOG — router le manager par obtenirPratiqueParId/construireConfigComplete
            (un seul résolveur), et charger AVANT d'écrire la SSOT.
```

```
[CO-09] pratiquesConfigurables : le fallback clé nue legacy (~50 lectures) ressuscite
        les données pré-24-mai dans tout trimestre NEUF  [CODE]
Gravité   : Majeur (famille CT-12 « résidu nu ressuscité », côté pratiques)
Axe       : 1
Où        : idiome `db.getSync(cle('pratiquesConfigurables'), null) ||
            db.getSync('pratiquesConfigurables', [])` répété ~50 fois (js/pratiques.js ×18,
            js/pratiques-gestion.js ×16 dont :1440, js/pratiques-bibliotheque.js,
            js/wizard-pratique-v2.js:2721, js/pratiques/pratique-manager.js ×4,
            js/evaluation-jetons.js:101…) ; la clé nue n'est jamais purgée (la migration du
            24 mai n'a peuplé que les trimestres existants alors) ; commentaire de tête FAUX :
            js/pratiques-gestion.js:24-28 (« NON namespacée = partagée entre trimestres »)
Constat   : FAIT (code, contre-vérifié sur :1440 et le corpus par grep) : dans un trimestre
            créé après le 24 mai, `<trim>_pratiquesConfigurables` n'existe pas → getSync rend
            null → la liste LEGACY entière est servie ; la première écriture (renommer une
            pratique) la RECOPIE dans le namespace neuf. Écritures : toutes namespacées
            (aucun setSync nu restant — delta positif vs violation #5 du registre).
Impact    : pratiques périmées ressuscitées par trimestre neuf, ids dupliqués entre
            trimestres (amorce des confusions de résolution de CO-22). Ampleur réelle
            conditionnée à la présence du résidu nu chez l'utilisateur (non vérifiable en
            conteneur).
Proposition : BACKLOG — retirer le fallback (l'étape « TOUTE DERNIÈRE » de #358, jamais
            faite pour les pratiques) après une migration de purge du résidu nu.
```

```
[CO-10] forcerMigration : à CHAQUE boot, tout résidu de clé nue de CLES_NAMESPACEES est
        recopié dans le trimestre ACTIF par setSync INCONDITIONNEL, puis purgé  [NAV]
Gravité   : Majeur (généralisation ÉCRASANTE du CT-12 — étudiants/présences/évaluations inclus)
Axe       : 1 et 3
Où        : js/trimestres.js:1221-1235 (forcerMigration : setSync(`${actif}_${cle}`, résidu)
            SANS vérifier si la copie namespacée existe, puis removeSync du nu) ; déclencheur :
            js/trimestres.js:1248-1262 (migrerVersMultiTrimestres, appelé à CHAQUE boot par
            initialiserModuleTrimestres:1470, SANS flag : registre non vide + résidu nu de
            `calendrierComplet` ⇒ forcerMigration) — or le boot SANS trimestre CRÉE lui-même
            ce résidu calendrierComplet (observé au profil vierge)
Constat   : FAIT (reproduit, trace de pile instrumentée) : au boot suivant la création du
            premier trimestre, `SET a2026_echellesTemplates … at trimestres.js:1228` puis
            `REMOVE echellesTemplates at :1229` — le contenu de la clé nue (semé par CO-11,
            modifications comprises) est capturé dans le trimestre actif. Sur ce chemin la
            capture est BÉNÉFIQUE (le travail pré-trimestre survit — vérifié : une échelle
            modifiée et une échelle créée avant le premier trimestre se retrouvent dans
            a2026). Le danger est l'écriture INCONDITIONNELLE : contrairement à
            migrerHorairesEtGroupesCours (CT-12, copie seulement si namespace VIDE),
            forcerMigration ÉCRASE une copie namespacée existante — pour TOUTES les clés
            namespacées, groupeEtudiants/présences/évaluations comprises.
Impact    : nul en usage nominal ; fenêtre réelle sur tout état qui recrée des résidus nus
            avec un trimestre actif porteur de données (restauration d'archive pré-
            namespacing, régime clés nues de CT-21a, import partiel) : les données VIVANTES
            du trimestre actif sont remplacées par le résidu, silencieusement.
Proposition : BACKLOG — aligner forcerMigration sur la politique « copie seulement si
            namespace vide, sinon journaliser », et ne déclencher qu'une fois (flag), pas à
            chaque boot.
```

```
[CO-11] Semis du global nu sans la garde #358 : huit échelles « collègues » codées en
        dur re-créent la clé nue echellesTemplates à chaque boot sans trimestre  [NAV]
Gravité   : Majeur (violation de l'invariant #358 « ne JAMAIS réécrire le global nu »)
Axe       : 1
Où        : js/echelles.js:502-703 (assurerEchellesPersonnalisees — AUCUNE garde) vs :470
            (assurerEchelleGenerique — garde présente) et js/grilles.js:1535 (jumeau grilles
            gardé) ; appel au boot : initialiserModuleEchelles (echelles.js:719) ← main.js ;
            la purge G4 est one-shot (flag migration_modeles_namespacees_done posé au premier
            boot, main.js:622-651) donc ne rattrape jamais le resemage ; même famille :
            js/grilles.js:4042 (migrerCategoriesVersSousCriteres exécutée AU PARSE du script,
            sans garde — sans effet aujourd'hui, global vide)
Constat   : FAIT (reproduit, profil vierge) : après le premier boot, la clé NUE
            echellesTemplates contient les 8 échelles hardcodées (ECHELLE_BRUNO_CHIMIE,
            _XAVIER_INFO, _ISABELLE_BIO, _HELENE_PHILO, _MARIEHELENE_LITT, _ETIENNE_ADMIN,
            _OLIVIER_GEO, _JORDAN_PHILO) — le flag G4 étant déjà posé, elle ne sera plus
            jamais vidée par la migration. Elle est ensuite capturée par CO-10 à la création
            du premier trimestre (pas de perte constatée sur CE chemin — préservation par
            accident, pas par design). Chaque NOUVEAU trimestre est de plus ensemencé de ces
            8 échelles + la générique (9 items avant toute action de l'utilisateur — mesuré).
Impact    : l'invariant #358 est violé par du code vivant, la sentinelle anti-resemage ne
            couvre que la générique ; le régime clés nues (dernier trimestre supprimé,
            CT-21a) réamorce le cycle. Voir aussi la Note CO-31 (opportunité du contenu).
Proposition : BACKLOG — poser la même garde qu'à :470 sur assurerEchellesPersonnalisees ;
            étendre la sentinelle anti-resemage aux huit ids.
```

```
[CO-12] Dupliquer et Adopter : la copie et la maquette adoptée restent INVISIBLES de la
        sidebar, avec message de succès  [NAV]
Gravité   : Majeur (comportement contraire au libellé — famille CT-13)
Axe       : 2 et 4
Où        : js/pratiques.js:985-1017 (la copie ne pose pas dansBibliotheque) →
            js/pratiques/pratique-manager.js:208-211 (force alors false) ; filtres sidebar :
            js/pratiques-gestion.js:149, 344 (dansBibliotheque !== false) ;
            adopterMaquette (js/pratiques.js:1146-1161) ne bascule QUE estMaquette
Constat   : FAIT (reproduit) : dupliquerPratique → copie créée avec dansBibliotheque:false
            (alert « a été ajoutée à tes pratiques ») ; deriverMaquette puis adopterMaquette →
            estMaquette:false mais dansBibliotheque:false CONSERVÉ — la pratique adoptée
            n'apparaît pas dans la sidebar ni la Section 1 ; elle traîne dans « Disponibles
            à ajouter ».
Impact    : la copie/adoption « réussit » et disparaît du point de vue utilisateur ; mine le
            flux central de l'Exploration des pratiques (#326).
Proposition : BACKLOG — dupliquerPratique pose dansBibliotheque:true ; adopterMaquette
            aussi.
```

```
[CO-13] Échelle référencée par une pratique : deux dégradations SILENCIEUSES du calcul
        (échelle vide sans avertissement ; IDME codée en dur avec warn console)  [NAV]
Gravité   : Majeur
Axe       : 3
Où        : js/pratiques/pratique-registre.js:241-244 (`echelle = config.echelle ||
            pratiqueData.echelle` : une CHAÎNE d'id racine — la forme que valider() exige —
            est prise pour une échelle EMBARQUÉE → niveaux vides, AUCUN warn) ; :261-271
            (echelleId introuvable → console.warn + substitution IDME 50/65/80/95 codée en
            dur — valeurs ≠ des gabarits internes 70/92,5) ; suppression sans garde en
            amont : CO-03
Constat   : FAIT (reproduit) : pratique STD dont l'échelle n'existe plus → résout, config
            portée à niveaux:[] sans le moindre warn (voie « string racine ») ; la voie
            echelleId rend l'IDME par défaut avec warn console seulement. Dans les deux cas
            les notes continuent de se calculer, altérées, sans signal UI.
Impact    : conversion de niveaux faussée en douce après suppression/déréférencement d'une
            échelle — l'utilisateur ne peut pas le savoir.
Proposition : BACKLOG — refuser de calculer (diagnostic précis, patron
            _diagnostiquerNoteNonCalculable) plutôt que substituer ; traiter la forme
            « echelle: string » comme une référence à résoudre.
```

```
[CO-14] Sécurité : sites innerHTML non échappés sur les chemins VIVANTS, et imports qui
        contournent le passage obligé assainirObjet  [CODE, spots re-vérifiés]
Gravité   : Majeur (règle non négociable n°1 ; exploitabilité limitée par la CSP)
Axe       : 6
Où (sites vivants confirmés en lecture directe) :
  · sidebars : js/echelles.js:2338 (${nomEchelle} BRUT là où grilles.js:2190 échappe —
    asymétrie flagrante) ; js/pratiques-gestion.js:167 (${nomPratique} brut ; la sidebar
    MORTE de pratiques.js:1360 échappe, elle) ; :263-274 (nom d'échelle dans badge)
  · éditeur grilles : js/grilles.js:3320, 3327, 3353 (sous-critères : value="${sc.nom}" et
    <textarea>${sc.retroaction}</textarea> — refermable par </textarea> — alors que
    critere.nom :3228 est échappé sur le même écran) ; :2971 (description temp)
  · modales bibliothèque (toutes familles) : opts.nom concaténé tel quel
    (js/bibliotheque-ui.js:666, 733) alimenté brut par js/grilles.js:2224/2260,
    js/echelles.js:2372/2424, js/productions-bibliotheque-ui.js:55/99-103,
    js/cartouches.js:3307-3406 (+ auteur via formaterMetadonnees) ; bandeau doublons
    js/bibliotheque-ui.js:760-763 (nom en <strong> brut)
  · productions : js/productions.js:194-253 (vue tableau : titre/description/objectif/
    nomGrille bruts — conteneur caché mais rendu à CHAQUE sauvegarde) ; wizard :
    js/wizard-pratique-v2.js:1702, 1738, 1999-2023 (libellés d'options échelle/grille bruts)
  · imports sans assainirObjet + écrasement silencieux par id : js/grilles.js:2027-2055,
    js/echelles.js:2221-2239, js/pratiques-gestion.js:2311-2374 (écriture directe des
    bibliothèques globales, remplacement d'un item existant au même id sans confirmation) ;
    js/pratiques.js:2345-2378 (importerPratiquesExternes, appelé par la Réserve)
Constat   : FAIT : zéro handler inline, zéro eval, zéro console.log sur le périmètre (grep) ;
            l'échappement est majoritaire — les asymétries « échappé ici / brut à côté »
            signent des oublis ponctuels. Vecteur réaliste : noms importés (JSON, .lcz,
            réserve, codex). S'ajoutent les limites structurelles connues d'echapperHtml
            (guillemets non encodés → attributs data-param/value sortables ; CT-29), et des
            couleurs d'échelle injectées en style="" (cartouches.js:601, echelles.js:262…).
Impact    : injection de balisage persistant dans les surfaces les plus visibles de la
            section ; deux imports peuvent de plus REMPLACER des items de bibliothèque
            légitimes par collision d'id.
Proposition : BACKLOG — passe d'échappement sur les sites listés (priorité aux sidebars et
            modales) ; router les 4 imports par les fonctions canoniques assainies ;
            confirmer avant remplacement par id.
```

```
[CO-15] Code mort massif et ARMÉ : îlot zombie pratiques.js, ~370 lignes de moteur sur
        schéma descriptif, renderers morts partageant les conteneurs vivants, pratique
        « test » et config personnelle chargées en prod  [NAV/CODE]
Gravité   : Majeur (zéro-dette + famille « code dormant qui se réveille », 51e5cdc)
Axe       : 6
Où        : js/pratiques.js:137-140 (initialiserModulePratiques sort TOUJOURS :
            #listePratiquesSidebar n'existe pas dans index.html → ~la moitié du fichier est
            morte, dont le câblage db-ready du fix #414 posé là — inerte À CET ENDROIT — et
            migrerConfigurationsSpecifiques:73-118 dont nbMigrees n'est JAMAIS incrémenté :
            no-op qui se flagge « fait ») ; js/pratiques/pratique-configurable.js:500-901
            (calculerNoteFinale et sa grappe : ZÉRO appelant, consomme le schéma DESCRIPTIF
            des gabarits — le piège n°3 matérialisé au cœur du moteur) ;
            js/pratiques/pratique-manager.js:159-161 (migrerVersBibliotheque compare des
            NOMS DE CONSTANTES aux ids stockés — branche « prédéfinies » inopérante depuis
            toujours) et :281-313 (initialiserPratiquesPredefines : copie des gabarits tels
            quels, 0 appelant) ; js/pratiques/pratique-test.js:175 (pratique factice 0,75
            AUTO-ENREGISTRÉE en prod malgré son propre avertissement — chargée par
            index.html) ; js/pratiques/config-francois-chimie.js (config nominative V1,
            schéma incompatible, 0 appelant, chargée) ; côté grilles/échelles : inventaire
            complet en passe A (deux générations d'UI, renderers morts écrivant les MÊMES
            conteneurs que les vivants — #listeCriteres a TROIS écrivains ; imports Markdown
            de cartouches ciblant des ids inexistants avec « succès » puis erreur ;
            grilles-bibliotheque.js écrasé sur window par grilles.js) ; js/pratique-notation-v2.js
            (module entier aux cibles DOM disparues, cluster « par-objectifs » censé retiré
            par #435 encore présent, avec écrivains modalites rebranchables)
Constat   : FAIT (reproduit pour le point le plus saillant) : pratiqueEstDisponible('test')
            rend true en production. FAIT (code/grep) pour le reste.
Impact    : surface latente (XSS des renderers morts non échappés, calculs faux « avec l'air
            de calculer juste » si réveil), fixes déclarés livrés mais inertes (#414 à cet
            endroit, migration V2), poids au boot ; contraire au principe « tout chantier
            RETIRE ce qu'il remplace ».
Proposition : BACKLOG — lot de retrait par familles (îlot pratiques.js, grappes mortes du
            configurable/manager, pratique-test + config-francois, ancienne génération
            grilles/échelles/cartouches, pratique-notation-v2), chacun avec grep d'appelants
            avant retrait.
```

```
[CO-16] Bascule de trimestre : l'éditeur Conception n'est ni rechargé ni réinitialisé —
        no-op silencieux avec toast de succès  [CODE]
Gravité   : Majeur (famille exacte des CT-05/CT-06 côté Cadre — 4e occurrence)
Axe       : 3 et 4
Où        : js/trimestre-v2-liste.js:431-525 (changerTrimestreActifV2 recharge calendrier/
            horaires/GC — RIEN pour grilles/échelles/cartouches/pratiques) ; états jamais
            réinitialisés : grilleTemplateActuelle (config.js:194), echelleTemplateActuelle
            (echelles.js:155), pratiqueEnEditionMateriel (pratiques-gestion.js:33),
            cartoucheActuel ; faux succès : js/grilles.js:694-697+747-749 et
            js/echelles.js:910-920+3927 (findIndex sur le NOUVEAU namespace rate → aucune
            écriture → « sauvegardée ! » quand même) ; côté pratiques l'auto-save avale en
            console.warn (pratiques-gestion.js:1443-1446) — pas de corruption, modifications
            perdues sans signal
Constat   : FAIT (code, lignes contre-vérifiées ; non rejoué au navigateur — l'exposition
            dépend de l'état de l'éditeur au moment de la bascule). Le patron « formulaire
            non réinitialisé à la bascule » transmis par la session 1 est donc confirmé côté
            Conception, sur les QUATRE onglets d'édition.
Impact    : modifications perdues avec confirmation de succès après une bascule — le
            scénario type d'une rentrée (préparer A26 en consultant H26).
Proposition : BACKLOG — réinitialiser les quatre pointeurs d'édition à la bascule (même
            geste que #332/#446), et brancher la branche else des findIndex (erreur
            explicite), patron commun.
```

```
[CO-17] Productions : chaque enregistrement réécrit verrouille:false,
        dansBibliotheque:true et coursId=cours actif — et peut effacer les échéances
        par groupe  [CODE]
Gravité   : Majeur
Axe       : 1 et 2 (et mécanisme entretenant le bug ouvert #346)
Où        : js/productions.js:1136-1142 (construireProductionData : verrouille:false,
            dansBibliotheque:true, coursId inconditionnels) fusionné par spread :1198 ;
            echeancesParGroupe: d.echeancesParGroupe || undefined (:1137) — un spread avec
            undefined ÉCRASE la valeur existante ; le formulaire rend null dès que le
            conteneur multi-groupes est masqué (≤1 groupe frère : coursId non résolu — #346
            —, groupe supprimé) ; js/productions-liste.js:215-290 (« + Nouvelle production »
            ne vide pas #containerEcheancesGroupes → la nouvelle production HÉRITE des
            échéances de la précédente) ; verrouillage par ailleurs inerte
            (verrouillerEvaluation sans point d'entrée UI — grep)
Constat   : FAIT (code, contre-vérifié aux lignes). Toute retouche d'une production :
            (1) la déverrouille ; (2) la fait réapparaître si retirée ; (3) la RÉASSIGNE au
            cours actif du moment — c'est le mécanisme qui entretient #346 (le coursId n'est
            jamais re-résolu, seulement écrasé) ; (4) en état multi-groupes non affiché, une
            retouche de titre détruit les dates par groupe sans avertissement (bord du #452).
Impact    : champs d'état réécrits en douce à chaque save ; perte de données d'échéances ;
            production « volée » au cours A quand on l'édite pendant que B est actif.
Proposition : BACKLOG — préserver verrouille/dansBibliotheque/coursId existants à la
            modification (ne les poser qu'à la création) ; echeancesParGroupe : ne jamais
            écraser par undefined ; réinitialiser le conteneur au « + Nouvelle production ».
```

```
[CO-18] Mode hybride STD : les cases à cocher Sélection/Obligatoires ne se rendent
        JAMAIS (balise <label> non fermée)  [CODE]
Gravité   : Majeur (fonctionnalité inopérante)
Axe       : 2 et 4
Où        : js/pratiques-gestion.js:2561-2565 — la balise <label …> n'est pas fermée avant
            <input type="checkbox" : le parseur avale l'input comme attributs du label
Constat   : FAIT (code, vérifié à l'octet — le `>` manque après class="hover-fond-subtil").
            Les listes mat-selection-liste / mat-obligatoires-liste n'affichent que les
            titres ; toggleProductionCategorieHandler est inatteignable.
Impact    : l'assignation des productions aux catégories du mode hybride (#339 en dépend)
            est impossible depuis l'éditeur.
Proposition : BACKLOG — fermer la balise ; ajouter un test de rendu (le patron existe dans
            les specs Playwright).
```

```
[CO-19] Clés HORS REGISTRE de la section : niveauxEchelle est lue EN PRIORITÉ par les
        conversions de profil ; configEchelle est écrasée à chaque visite  [CODE/AGENT]
Gravité   : Majeur (famille CT-07/CT-26 : « global par omission » + résidu qui prime)
Axe       : 1
Où        : niveauxEchelle — écrite en clé nue par les chemins morts d'echelles.js (:828 —
            y compris en CONSULTATION d'archive —, :1381-1758) ; lecteur VIVANT :
            js/profil-etudiant-calculs.js:33-49 (« PRIORITÉ 1 : niveauxEchelle » AVANT
            cle('echellesTemplates')) ; configEchelle — js/echelles.js:1105-1201 : à chaque
            visite de la section, les champs sources sont des divs cachés → écrit
            {typeEchelle: undefined, …} dans la clé nue (aucun lecteur externe — write-only) ;
            ressourcesSupprimees, bibliothèque* : globales hors registre (assumées, à
            documenter)
Constat   : FAIT (code) : un résidu niveauxEchelle (instantané d'une manipulation ancienne,
            potentiellement d'un autre trimestre) PRIME sur l'échelle du trimestre actif dans
            la table de conversion IDME des profils étudiants. [AGENT, non contre-vérifié
            ligne à ligne : la présence effective d'un résidu divergent chez l'utilisateur
            réel reste à mesurer.]
Impact    : conversions I/D/M/E potentiellement fausses dans les profils, silencieusement.
Proposition : BACKLOG — inverser la priorité (cle() d'abord) ou purger niveauxEchelle ;
            trancher le sort de configEchelle (retrait zéro-dette probable) ; inscrire les
            clés assumées globales au registre (CT-26 : un warn sur clé inconnue fermerait
            la classe).
```

## Constats — MINEUR

```
[CO-20] Cartouches : window.cartoucheActuel et le binding lexical divergent — la
        sauvegarde peut recharger la MAUVAISE cartouche  [AGENT + code cité]
Axe 2. js/config.js:206 (let top-level ≠ window), js/cartouches.js:489 (seule écriture de
window.cartoucheActuel, au chargement d'une EXISTANTE), :2533-2545 (sauvegarderCartoucheComplete
relit window.cartoucheActuel pour rouvrir). Créer une NOUVELLE cartouche après en avoir ouvert
une autre → sauvegarde OK mais rechargement de l'ANCIENNE dans le formulaire (terrain de
corruption croisée) ; s'ajoutent le reset legacy post-save (:798-799, formulaire vidé/clignote)
et le select cartouche du formulaire de production qui conserve la sélection précédente quand la
production ouverte n'a pas de grille (js/productions.js:804-807).
Proposition : BACKLOG — une seule source pour la cartouche courante ; reset explicite.
```

```
[CO-21] Grilles : changer le TYPE d'un critère affiche « Aucun critère défini »  [NAV]
Axe 2/4. js/grilles.js:4085-4090 : afficherCriteresGrille(obtenirGrilleParId(id)) — la fonction
est ASYNC, le renderer reçoit une Promise → branche vide. Reproduit : la liste des critères
disparaît à l'écran (les données SONT sauvées ; retour au rechargement). Geste nominal pour
configurer les sous-critères (holistique→algorithmique) — l'utilisateur croit avoir tout perdu.
Proposition : BACKLOG — await (handler async) ; même patron à vérifier sur les autres handlers.
```

```
[CO-22] Cache du registre des pratiques jamais invalidé à la bascule ni à l'édition  [AGENT]
Axe 3/4. js/pratiques/pratique-registre.js:377-426 (obtenirPratiqueActive compare l'ID seul) ;
invaliderCachePratique n'a qu'UN appelant (changerPratiqueActive). Après bascule de trimestre
(les pratiques sont PAR trimestre, les copies gardent leurs ids) ou réédition sans changement
d'id, l'instance PÉRIMÉE sert les calculs jusqu'au prochain changement de pratique ou reload.
Proposition : BACKLOG — invalider à la bascule (changerTrimestreActifV2) et à la sauvegarde.
```

```
[CO-23] Diagnostics faussés : clé morte indicesAssiduiteDetailles (SOM, A=0,85 fixe) et
        cible d'intervention SPE toujours « Aucun »  [AGENT + code cité]
Axe 2. js/pratiques/pratique-sommative.js:494-502 : lit la clé nue indicesAssiduiteDetailles —
AUCUN écrivain dans tout js/ (grep) — donc identifierPattern SOM tourne toujours avec A=0,85 ;
la vraie source est cle('indicesAssiduite') (autre forme). js/pratique-pan-specifications.js:
444-525 : genererCibleIntervention lit defis.principalDefi (champ inexistant) → cible toujours
« Aucun », bordure « undefined » ; identifierPattern SPE rend une string là où les consommateurs
attendent un objet.
Proposition : BACKLOG — re-brancher SOM sur la vraie clé ; aligner SPE sur le contrat.
```

```
[CO-24] Doublons créables en silence par toutes les voies de duplication et d'import  [AGENT]
Axe 2 (famille CT-15). verifierEtGererDoublon n'est appelée que par les sauvegardes ; toutes les
duplications empilent « X (copie) (copie) » ; les imports inter-trimestre ne dédupliquent pas ;
les boutons « ajouter » des modales sont re-cliquables. Recoupe le backlog ouvert #291 (workflow
de résolution de doublons dans les bibliothèques) — à traiter ensemble.
```

```
[CO-25] Gabarits de bibliothèque : suppression-zombie et cartouches incompatibles  [AGENT]
Axe 2/3. js/gabarits-utils.js:438-459 : ajouterGabaritsDefautSiManquants (à chaque chargement)
ne consulte jamais estRessourceSupprimee et les ids GABARIT_* ne sont pas dans
IDS_GABARITS_HARDCODES → un gabarit supprimé de la bibliothèque partagée REVIENT au prochain
rechargement (7 items). Les deux gabarits de cartouches (:394-427) portent un schéma sections[]
sans grilleId/commentaires → « 0 commentaire(s) », ajout en cul-de-sac.
Proposition : BACKLOG — honorer les tombstones ; corriger ou retirer les gabarits cartouches.
```

```
[CO-26] Perf (qualitatif) : les six onglets Conception sont rendus INTÉGRALEMENT au
        boot, section Accueil active  [NAV]
Axe 5 (réponse au point 5 de la transmission session 1 — patron CT-20 confirmé). Mesuré au
navigateur, profil trimestre vierge : #conception-echelle-performance ~148 Ko de HTML (les 9
échelles semées rendues en entier), #conception-pratiques-notation ~63 Ko / 144 options,
#conception-carte ~32 Ko, etc., tous offsetParent null (masqués). S'ajoutent : modales de
bibliothèque détruites/reconstruites à CHAQUE action (perte de scroll — patron CT-18, toutes
familles), double rendu caché des vues productions à chaque save (B-18), réécriture
INCONDITIONNELLE de tous les magasins cartouches_* à chaque visite de l'onglet Rétroactions
(js/cartouches.js:238-261, migrerCartouchesVersBibliotheque réécrit même sans migration),
relecture des échelles PAR pratique dans la boucle sidebar (pratiques-gestion.js:261).
Nuance : l'init de pratiques.js est morte (CO-15) — le rendu pratiques vient de
pratiques-gestion à la navigation.
Proposition : BACKLOG — différer le rendu de chaque onglet à sa première ouverture (même lot
que CT-20) ; mises à jour ciblées des modales.
```

```
[CO-27] Import inter-trimestre des échelles : aveugle aux archives réelles, et
        sémantique divergente grilles/échelles  [AGENT]
Axe 1/2. js/echelles-bibliotheque.js:188/231 scanne `*_echelles` alors que l'archivage écrit
`*_echellesTemplates` (trimestres.js:711) → la section « Importer d'un autre trimestre » ne voit
jamais un trimestre archivé post-#358 côté échelles ; le portage Brique C (cleSource, garde,
copie des cartouches) n'a été fait que côté grilles — et les deux chemins n'ont pas la même
destination (bibliothèque partagée vs trimestre actif) sous le même libellé.
Proposition : BACKLOG — porter le patron grilles (cleSource) aux échelles.
```

```
[CO-28] Banc de décision : la terminale du corpus généré pèse 1 % de la note STD  [AGENT]
Axe 2/5 (périmètre banc seulement). js/pratiques/profils-types-generateur.js:166-174 : toutes
les productions, terminale comprise, portent ponderation:1 → règle du complément STD :
portfolio 99 % / terminale 1 %. Le banc montre des notes STD où la terminale — ce que le
Comparateur doit précisément faire voir — est neutralisée.
Proposition : BACKLOG — pondérer la terminale du corpus de façon réaliste (documenter le choix).
```

```
[CO-29] Robustesse diverse (vérifié, faible exposition)  [CODE/AGENT]
Axe 2/6. (a) ajouterCritereGrille crée des critères SANS id (js/grilles.js:3671-3679) — les
consommateurs par critere.id reçoivent undefined ; (b) collisions de globaux dépendantes de
l'ordre des <script> : window.creerNouvellePratique et fermerModalBibliothequePratiques définis
deux fois, deux modales partagent l'id modalBibliothequePratiques (C-11) ; (c) reset des inputs
d'import via le global déprécié window.event (grilles/echelles/cartouches/pratiques-gestion —
comportement Safari/iPad à éprouver) ; (d) obtenirTrimestres/CT-19 : rien de neuf, mais les
sauvegardes d'échelles relisent la collection immédiatement après chaque écriture (echelles.js:
3467-3471, ×4) ; (e) suppression d'échelle : tombstone posé pour TOUT id (grilles :
supprimerGrilleActive idem) → ressourcesSupprimees grossit sans borne (lecteurs : assurer*
seulement).
```

## Constats — NOTE

```
[CO-30] Docs de janvier : périmées sur l'essentiel du périmètre  [CODE/AGENT]
Axe 6 (famille CT-25). docs/modules/evaluations-productions.md : champ `nom` (le code écrit
titre/activiteApprentissage + copie description), « grillesTemplates (cle globale) » (namespacée
depuis #358), types manquants (terminale, portfolio, laboratoire…), champs non documentés
(echelleId, cartoucheId, echeancesParGroupe, metadata_cc…). docs/modules/pratiques.md : liste
pratique-pan-maitrise.js (n'existe pas), « pratique active dans modalitesEvaluation.pratique »
(miroir mort depuis #328), « 4 modes de calcul » par objectifs (retirés), interface IPratique
non conforme au contrat réel d'enregistrerPratique, renvoi vers GUIDE_AJOUT_PRATIQUE.md
(introuvable). js/ordre-chargement.txt ignore l'existence du dossier js/pratiques/ (« import-
export.js (à créer) »). En prime getTypeLabel (productions.js:1784-1796) ignore laboratoire/
entrevue/projet/stage/-formatifs → codes bruts à l'écran.
Proposition : BACKLOG — réviser les deux docs (ou bandeau « périmée ») + retirer
ordre-chargement.txt ; même lot que CT-25.
```

```
[CO-31] Huit échelles « collègues » nominatives codées en dur, semées dans CHAQUE
        trimestre — une décision d'époque à re-trancher  [NAV]
Axe 6. js/echelles.js:502-703 : Bruno V., Xavier C.-T., Isabelle M., Hélène C.,
Marie-Hélène L., Étienne L., Olivier (géo), Jordan (philo) — auteur « Labo Codex »,
re-semées par trimestre (9 items avant toute action, mesuré). Mécanisme de suppression : tombstone
par id. À l'ère du partage (#329, collections partage_*) et de la Voûte, du matériel de
collègues embarqué DANS le code interroge (mise à jour impossible sans release, pas de retrait
groupé, contenu nominatif). Décision avec Grégoire : garder / migrer vers bibliothèque ou
packages de partage / retirer.
```

```
[CO-32] Registre DATA-OWNERSHIP : deltas mesurés par cette passe  [CODE/AGENT]
Axe 1 (famille CT-27). (a) violation #5 (pratiquesConfigurables) : les écritures des 4
contourneurs sont désormais TOUTES namespacées — la dette résiduelle est côté LECTURES
(fallback nu, CO-09) ; (b) contourneur disparu : demo-activation n'écrit plus grillesTemplates
(le peuplement passe par demo_*) ; (c) écrivains NOUVEAUX non listés : partage-section.js:175/263
(grilles/échelles via cle()) ; (d) clés à documenter : bibliothequePratiques (« volontairement
globale » par fallthrough), pratiqueParDefaut, ressourcesSupprimees, niveauxEchelle/configEchelle
(CO-19), indicesAssiduiteDetailles (morte, CO-23) ; (e) flags de migration globaux
(migrationBibliothequeV2…) gouvernant des données devenues par-trimestre — assumé, à noter.
Proposition : BACKLOG — re-générer audit-ssot.py et mettre le registre à jour (même item que
CT-27).
```

```
[CO-33] Architecture : cartouches_{grilleId}, dernière famille globale de la section  [CODE]
Axe 1. Les grilles, échelles et pratiques sont namespacées ; les cartouches restent globales
par mécanisme startsWith (partagées entre trimestres ET avec la démo — CO-04). La doc registre
la donne « G » (exact), mais l'écosystème post-#358 rend ce régime de plus en plus singulier
(routage d'archive spécial dans cle() et cleSource, seul lien réel↔démo restant). Question
d'architecture à trancher un jour, pas un correctif.
```

```
[CO-34] Conformités positives et scories  [CODE]
Axe 6. ZÉRO console.log/info sur les 31 fichiers du périmètre (grep — conforme, meilleur que le
Cadre) ; SSOT modalitesEvaluation respectée partout (aucune écriture hors API, wizard passé en
lecture seule) ; discrimination STD de simulerIndices (#326) en place ; garde DEN 59 conforme au
contrat sur son chemin nominal ; purgerLegacy câblé et sentinellisé. Scories : blocs if/for
VIDES résiduels de purges de console.log (pratique-registre.js:611-613, pratique-manager.js:
183-186, config-francois-chimie.js:188-194) ; _modalites() seam mort maintenu par sa propre
sentinelle (pratique-pan-standards.js:103-112) ; double échappement « R&amp;D » (cartouches.js:
2699) ; commentaire faux sur cle() (pratiques-gestion.js:601-606).
```

```
[CO-35] Snapshot d'archivage : les pratiques du MAUVAIS trimestre  [AGENT]
Axe 3 (périphérie signalée). js/trimestres.js:701 : creerSnapshotRessources(trimestreId) lit les
pratiques via cle('pratiquesConfigurables') (trimestre ACTIF) alors que grilles/échelles passent
par `${trimestreId}_…` — un snapshot créé pour un trimestre non actif archiverait les pratiques
du trimestre actif. Non contre-vérifié ; à recouper avant tout chantier d'archivage.
```

---

## Verdicts sur les points transmis par la session 1 (« À transmettre » §1-6)

| Point transmis | Verdict sur 1.88.4 | Preuve |
|---|---|---|
| **Hypothèse `verifierReferencesPasDemo`/pratiques** (pt 3) | **CONFIRMÉE et ÉLARGIE** : non seulement `'pratiquesConfigurables'` littéral (GC), mais aussi `'grillesTemplates'` (evaluation-sauvegarde ET evaluation.js — 4ᵉ appelant) et `'echellesTemplates'` (pratiques-gestion) ; ET la moitié estItemDemo est inerte même sur la bonne clé (pack sans flag isDemo, auteur ≠ « Demo Labo Codex »). Seul le préfixe `demo-` garde encore — pratiques seulement. → CO-02 | [NAV] double voie |
| **`cartouches_{grilleId}` orphelin** (plan §6.4, pt 2) | **CONFIRMÉ** : le magasin survit intégralement à la suppression de sa grille (chemins vivants), reste exporté, re-rattachable. → CO-04 | [NAV] |
| **Patrons récurrents** (pt 2) | **TOUS retrouvés côté Conception** : copie dénormalisée persistée (snapshot `.config` avec échelle embarquée — CO-07 ; modeleNom dans modalites — C-15 [AGENT]) ; suppression sans garde (CO-03) ; « X échappé / Y brut » sur le même écran (sidebar échelles vs grilles, sous-critères vs critères — CO-14) ; modale reconstruite à chaque action (CO-26) ; find/findIndex sans else (CO-16) ; formulaires non réinitialisés à la bascule (CO-16). | [NAV]/[CODE] |
| **Régime des clés — piège cle()** (pt 1) | Vérifié clé par clé (tableaux des 4 passes) : hors-registre trouvées vivantes : `niveauxEchelle` (lue en PRIORITÉ par les profils — CO-19), `configEchelle`, `bibliotheque*`, `ressourcesSupprimees`, `pratiqueParDefaut`, + la clé MORTE `indicesAssiduiteDetailles` (CO-23). `dureePeriode` (CT-07) : rien de neuf. | [CODE] |
| **Docs de janvier** (pt 4) | Confirmé « à confronter, pas à croire » : les deux docs du périmètre sont périmées sur l'essentiel. → CO-30 | [CODE] |
| **Perf : rendu de sections masquées** (pt 5) | **CONFIRMÉ** : les six onglets Conception rendus au boot, ~148 Ko pour Échelles (nuance : l'init pratiques.js est morte, le rendu vient de pratiques-gestion). → CO-26 | [NAV] |
| **1.88.3/PR #79** (pt 6) | Fusionnée AVANT la session 2 : le HEAD audité inclut 1.88.4 — acté en tête de rapport. | [CODE] |
| **#453 §3** (recoupement volontaire) | **CONFIRMÉ FONCTIONNEL** : grille supprimée → le formulaire de production affiche « ⚠ grille introuvable (id) » et PRÉSERVE la référence. La défense aval tient sur ce chemin. | [NAV] |
| **#346** (bug ouvert, recoupé au passage) | **Mécanisme d'entretien identifié** : chaque save de production écrase coursId par le cours actif (CO-17) — le correctif de #346 devra fermer cette réécriture, pas seulement re-pointer les données. | [CODE] |

## Scénarios §6.3 — statut (reconstitués, le plan étant introuvable)

1. Parcours vierge Conception (semis, création, persistance) : ✅ déroulé — CO-11 (semis nu),
   CO-31 (9 échelles d'office), persistance OK, capture pré-trimestre OK (CO-10).
2. Suppression d'entité référencée (grille/échelle/pratique/production) : ✅ — CO-03, CO-04,
   CO-05 ; garde positive : pratique du GC actif refusée ; #453 §3 confirmé.
3. Orphelin cartouches_{grilleId} (§6.4) : ✅ — CO-04.
4. Garde démo : ✅ — CO-02 (double voie mesurée).
5. Bascule de trimestre : ✅ — isolation des namespaces vérifiée (pratique d'a2026 non résoluble
   depuis h2027 — dégradation propre) ; MAIS CO-16 (état d'édition) et CO-22 (cache) au code ;
   GC pointant une pratique d'un autre trimestre → null silencieux + badge famille possiblement
   incohérent (passe D, [AGENT]).
6. Modification d'entité référencée : partiel — la résolution par id tient (pas de renommage
   cassant trouvé côté vivant) ; les copies dénormalisées identifiées sont côté snapshots
   (.config, modalites) — [CODE/AGENT], non rejouées à l'écran.
7. Doublons : semés sans résistance au storage ; les gardes ne couvrent que les sauvegardes de
   formulaire (CO-24) — [CODE].
8. Moteur (contre-vérifications) : ✅ — CO-06 (DEN 0 vs null), CO-07 (SPE p=null), CO-08
   (TypeError), CO-12 (duplication/adoption), CO-13 (échelle vide) — tous [NAV].
9. iPad : consigné ci-dessous, non simulé (conforme à la méthode session 1).

## Portes terrain iPad à prévoir (relevé, non simulé)

À intégrer aux portes terrain des futurs correctifs (modèle `portes-terrain`) :
- Dialogues natifs de la section : prompt() de duplication de grille (grilles.js:989), alert()
  « Cartouche sauvegardée avec succès » (cartouches.js:2540), confirm() de TOUTES les
  suppressions — lisibilité/geste au doigt.
- Modales bibliothèque reconstruites à chaque action → perte de scroll au doigt (CO-26), sur
  les CINQ familles.
- Reset des inputs de fichier via window.event (CO-29c) — à éprouver sur Safari iPad.
- L'éditeur d'échelles après ajout de niveau (CO-05 : compteur sidebar périmé) — visible
  surtout en va-et-vient tactile.
- Formulaire Productions 1.88.4 (deux moitiés alignées bas) : re-vérifier avec le clavier
  virtuel ouvert, et le sélecteur « ⚠ introuvable » (#453) dans la roue iOS.
- Les selects d'échelle/grille du wizard (options longues non échappées — CO-14) dans la roue
  iOS.

## Ce que cette session N'A PAS audité

- La **Carte d'alignement** (voir Périmètre) ; la chaîne **évaluation/annotation** au-delà des
  jonctions (evaluation-*.js en propre — l'audit s'est arrêté aux références) ; le **partage
  .lcz** (partage-*.js, #329) ; les chemins **import-export.js/codex.js** (couvre l'écosystème
  données, hors section) ; `productions-import-export.js` et `productions-liste.js` lus
  partiellement.
- Les repros marquées [AGENT] ou [CODE] sans mention [NAV] n'ont pas été jouées à l'écran —
  notamment CO-16 (bascule), CO-18 (checkboxes — vérifié à l'octet mais pas rendu), CO-20
  (cartouche croisée), B-11 (fuite démo cartouches).
- Rien côté Safari/iPad (pas de WebKit en conteneur) — relevé ci-dessus.

## À transmettre au tri avec Grégoire (le plan s'arrête ici — session 2 de 2)

1. **Le tri des constats des DEUX sessions se fait AVEC Grégoire** — rien n'a été versé au
   BACKLOG (consigne session 1 maintenue). L'annexe ci-dessous donne les candidats une ligne.
2. **Recoupements inter-sessions** : CO-03≈CT-02 (gardes mortes), CO-09/CO-10/CO-11≈CT-07/CT-12
   (clés nues), CO-16≈CT-05/CT-06 (bascule), CO-26≈CT-18/CT-20 (perf/modales), CO-30≈CT-25
   (docs), CO-32≈CT-27 (registre) — huit lots transverses possibles plutôt que 60 correctifs.
3. **Trois décisions de fond** à trancher avant les correctifs : régime des cartouches (CO-33),
   sort des échelles collègues embarquées (CO-31), politique de suppression unifiée
   (recensement façon #449 sur les cinq familles — CO-03).
4. **Le plan lui-même** : le fichier PLAN-AUDIT n'existant nulle part en dépôt, décider s'il
   faut le reconstituer/commiter pour la trace, et vérifier qu'aucune exigence du §6 réel
   n'a été manquée par la reconstitution.

## Annexe — items BACKLOG candidats (une ligne chacun, tri avec Grégoire)

1. CO-01 : sauvegarde wizard = fusion d'enveloppe (préserver inspireDe/estMaquette/metadata_cc/auteur).
2. CO-02 : garde démo — collections via cle() + flag isDemo du pack (ou retrait assumé de la moitié lookup).
3. CO-03 : recensement façon #449 sur suppression de grille/échelle/pratique/production/cartouche ; « écraser » par id gardé.
4. CO-04 : sort des cartouches à la suppression de grille ; écritures cartouches via cle() ; régime à trancher.
5. CO-05 : retirer afficherEchellesPerformance + mises à jour #nbNiveauxEchelle (crashs vivants).
6. CO-06 : DEN — note absente ⇒ null ; ids de cibles stables au round-trip.
7. CO-07 : unifier schéma SPE + emplacement jetons + primauté configuration.* sur .config.
8. CO-08 : PratiqueManager routé par construireConfigComplete ; charger avant d'écrire la SSOT.
9. CO-09 : purge du résidu nu pratiquesConfigurables + retrait du fallback (~50 sites).
10. CO-10 : forcerMigration — copie seulement si namespace vide + flag one-shot.
11. CO-11 : garde anti-resemage sur assurerEchellesPersonnalisees + sentinelle étendue.
12. CO-12 : dupliquer/adopter posent dansBibliotheque:true.
13. CO-13 : échelle irrésolue ⇒ non calculable diagnostiqué, jamais substituée en silence.
14. CO-14 : passe d'échappement (sidebars, modales, sous-critères) + imports par les fonctions assainies.
15. CO-15 : lot de retrait du code mort (îlot pratiques.js, grappe configurable, pratique-test, config-francois, ancienne génération grilles/échelles, pratique-notation-v2).
16. CO-16 : réinitialisation des éditeurs Conception à la bascule + else des findIndex.
17. CO-17 : production — préserver verrouille/dansBibliotheque/coursId à la modification ; echeancesParGroupe jamais écrasées par undefined.
18. CO-18 : fermer la balise label du mode hybride (+ test de rendu).
19. CO-19 : priorité cle() sur niveauxEchelle ; sort de configEchelle ; registre des clés assumées globales.
20. CO-20 à CO-29 : lot mineur (cartouche courante, await du type de critère, cache registre, diagnostics SOM/SPE, doublons #291, gabarits zombies, rendu différé des onglets, import échelles inter-trimestre, corpus du banc, robustesse diverse).
21. CO-30/CO-32 : réviser les docs de janvier + re-générer DATA-OWNERSHIP (avec CT-25/CT-27).
22. CO-31/CO-33 : décisions — échelles collègues embarquées ; régime des cartouches.

---

# ADDENDUM — Passe complémentaire (21 août 2026, session locale)

> **Contexte** : le plan `PLAN-AUDIT-cadre-conception-2026-08-20.md` a été retrouvé (il ne
> vivait que dans un stash GitHub Desktop, commité sur `main` en `42a8ab1c` — l'écart de
> prémisse en tête de rapport est donc résolu : la reconstitution du §6 était CONFORME,
> l'exclusion de la Carte d'alignement est dans le plan §3). La confrontation au **vrai** §6.3
> a révélé cinq exigences non couvertes par la reconstitution ; cette passe les ferme
> (3 passes parallèles, reproduction WebKit sur profil vierge + code aux lignes citées).
> HEAD audité : **1.88.5** (`afd208bf`).

## Verdicts complémentaires (« à recouper » du §6.3 réel)

| Entrée | Verdict sur 1.88.5 | Preuve |
|---|---|---|
| **#326-T3** — édition non préremplie depuis le banc | **NON REPRODUIT (corrigé le 21 juin)** : `editerPratique` depuis le banc ouvre le wizard prérempli (nb évaluations, seuils, type). Fix tracé : `js/pratiques.js:975-995` (copie en forme canonique). **Résiduel données** : une copie legacy « `.config` seulement » (pré-21-juin) s'ouvre encore vide — cas à fusionner avec la proposition CO-08 (un seul résolveur). | [NAV] 3/3 + [CODE] |
| **#326-T4** — dérivation de maquette parasite | **NON REPRODUIT (corrigé le 21 juin)** : `deriverMaquette` ne déroule plus le wizard (js/pratiques.js:1087-1094) ; maquette créée avec `estMaquette:true` et `inspireDe.sourceId` corrects, modal fermé. | [NAV] |
| **#343-T3** — hover du tag DEN absent | **TOUJOURS PRÉSENT** : `genererBadgeTypePratique` (js/pratiques-gestion.js:307) ne pose aucun `title`. Le fix existe… dans la PR #63 jamais fusionnée (CO-36). | [CODE] |
| **#343-T4a** — « eliminee » brut au récap | **TOUJOURS PRÉSENT** : `varianteLabels` (js/wizard-pratique-v2.js:1877-1891) n'a pas de clé `eliminee` ; `LIBELLE_MODE_DEN` (pratiques-exploration.js:154) existe mais n'est pas utilisé là. | [CODE] |
| **#343-T4b** — compteur « 3/2 » | **RÉSORBÉ de facto** (1.21.0 : `config-denotation` est entré dans le graphe, `calculerNbEtapes` dérive du graphe réel — 3/5 mesuré sur les deux chemins DEN). | [NAV] |
| **#343-T4c** — « SOM, STD ou SPE » sans DEN | **RÉSORBÉ** : le libellé dit « SOM, STD, SPE ou DEN » (wizard-pratique-v2.js:377) ; grep de l'ancien libellé = 0. | [CODE] |
| **#343-T4d** — « statistique » vs « holistique » | **TOUJOURS PRÉSENT** : wizard = « Suggestion statistique » (:257, :1994), banc = « holistique » (construction-attributs.js:166), + « Ancrage statistique » (denotation-saisie-ui.js:148). | [CODE] |
| **#343-T5** — portes d'entrée enfouies | **TOUJOURS PRÉSENT** (statut cohérent : reporté par la PR #63) : « Je sais déjà ce que je veux » et « pas certain·e » restent à l'étape 2 (wizard-pratique-v2.js:146-171, 371, 377). | [CODE] |
| §6.3 pt 2 (1ʳᵉ moitié) — le cartouche suit-il le renommage de grille ? | **OUI** : le renommage mute `nom` sans toucher `id` (grilles.js:684-699, :767) ; l'ancrage `cartouches_{grilleId}` reste valide et le nom affiché est résolu en direct (cartouches.js:2726-2729). Défaut connexe : CO-38. | [CODE] |

## Constats complémentaires

```
[CO-36] La PR #63 (fixes #343-T3/T4) n'a JAMAIS été fusionnée — mais
        BACKLOG-ARCHIVE.md:2465 la documente « RÉSOLUS »  [CODE]
Gravité   : Majeur (écart archive↔réalité qui masque des reliquats terrain depuis ~2 mois)
Où        : BACKLOG-ARCHIVE.md:2465 (« RELIQUATS TERRAIN #343-T3/T4 RÉSOLUS (23 juin,
            1.21.1, commit 6d901fa5) ») vs git : 6d901fa5 (branche
            origin/claude/project-access-zyxt6n) et sa refonte 31f6b995 (1.27.4, 2 août,
            branche claude/preparation-seance-2026-08-02-bhlxq1) sont HORS de l'ascendance
            de HEAD (merge-base --is-ancestor) ; gh pr view 63 : state OPEN, mergedAt null.
Constat   : FAIT (git). T3, T4a et T4d sont encore présents sur 1.88.5 (table ci-dessus).
            INFÉRENCE (à trancher avec Grégoire, cf. PREPARATION-SEANCE-2026-08-02.md §3) :
            oubli de merge plutôt que mise en attente délibérée.
Impact    : l'archive atteste un travail non livré ; toute session qui s'y fie croit les
            reliquats fermés.
Proposition : BACKLOG — statuer sur la PR #63 (rebaser sur 1.88.5 et merger, ou fermer et
            rejouer les 3 micro-fixes) ; corriger la mention de BACKLOG-ARCHIVE:2465.
```

```
[CO-37] Grille : la somme des pondérations ≠ 100 % passe sans confirmation  [CODE]
Gravité   : Mineur (le calcul aval s'AUTO-NORMALISE — pas de corruption)
Où        : js/grilles.js:641-720 (sauvegarderGrilleTemplate : aucun test de somme) ;
            :1208-1227, :3046, :3407 (indicateur coloré, éditeur seulement) ;
            js/evaluation-calcul.js:568-616 (pourcentage = noteTotal / ponderationTotal —
            une grille à 80 ou 120 % donne les mêmes notes relatives qu'à 100).
Constat   : FAIT (code). Réponse au §6.3 pt 1 du plan : sauvegarde permise, signal visuel
            non bloquant, note finale non faussée.
Proposition : BACKLOG — confirmation non bloquante à la sauvegarde quand la somme ≠ 100.
```

```
[CO-38] Écrasement d'une grille homonyme : les cartouches de la grille écrasée
        deviennent orphelines (extension de CO-04)  [CODE]
Gravité   : Majeur (même famille que CO-04)
Où        : js/grilles.js:672-675 (« écraser » = filter par NOM, la grille disparaît) ;
            aucune migration/purge de cartouches_{id} ; l'affichage itère sur les grilles
            existantes (js/cartouches.js:2715) → magasin invisible mais exporté.
Constat   : FAIT (code). S'ajoute au périmètre de CO-04 (sort des cartouches à la
            disparition d'une grille — ici par écrasement, pas par suppression).
Proposition : BACKLOG — même item que CO-04 (migrer ou purger cartouches_{id} à tout
            retrait de grille, y compris « écraser »).
```

```
[CO-39] Exports/imports JSON des bibliothèques : AUCUN passage par la couche
        d'assainissement — seul le chemin signé .lcz est protégé (extension de CO-14)  [CODE]
Gravité   : Majeur
Où        : exports = Blob JSON simples (js/grilles.js:1725, js/cartouches.js:1668,
            js/productions-import-export.js:69 — zéro JSZip, donc validerZipSecurite sans
            objet sur CE chemin, réponse au §6.3 pt 7) ; imports = FileReader → JSON.parse →
            fusion sans assainirObjet pour cartouches (js/cartouches.js:1706-1895) et
            productions (js/productions-import-export.js:301-442) — étend CO-14
            (grilles/échelles) aux deux familles restantes ; fusion par id STRICT : même id
            = écrasement silencieux compté « mise à jour », nom identique + id différent =
            doublon sans détection ; le chemin officiel .lcz, lui, passe bien par
            validerZipSecurite (js/partage-import.js:344-357) pour les 5 familles.
Constat   : FAIT (code, 5 fichiers grepés).
Proposition : BACKLOG — appliquer assainirObjet + détection de doublons par nom aux imports
            JSON (aligner sur .lcz), ou déprécier le chemin JSON au profit du .lcz.
```

```
[CO-40] SOM : pondération de repli « || 1 » codée en dur pour les évaluations
        orphelines  [CODE]
Gravité   : Mineur (violation du principe « zéro fallback arbitraire »)
Où        : js/pratiques/pratique-sommative.js:92-99, :141, :291 (production introuvable ou
            pondérée 0 ⇒ poids 1 silencieux) ; réponse au §6.3 pt 9 : le signalement des
            pondérations vit dans l'onglet Productions (productions.js:1705-1726, visuel non
            bloquant, hors artefacts-portfolio) ; le calcul SOM s'auto-normalise, donc une
            somme ≠ 100 ne fausse pas la note relative — le vrai trou est l'évaluation
            orpheline entrée au poids 1 sans signal. STD a ses avertissements dédiés
            (validerProductionsStd), SOM n'a aucun équivalent.
Proposition : BACKLOG — exclure et DIRE (récit de calcul) les évaluations orphelines ou à
            pondération nulle, plutôt que le poids 1 implicite.
```

---

*Rapport produit par la session 2 de l'audit (Claude Code, 20 août 2026, soir — nuit du 20 au
21 UTC) ; addendum par la session locale du 21 août 2026 (passe complémentaire §6.3, verdicts
#326/#343, CO-36 à CO-40). Aucun fichier de js/, css/ ou index.html modifié par l'audit.
Scripts de reproduction en scratchpad de session (jetables) ; chaque scénario repart d'un
profil vierge ensemencé, jamais les données réelles.*
