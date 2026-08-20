# AUDIT « Calendrier › Trimestre » — Rapport de constats

> **Date** : 20 août 2026 · **Référence auditée** : 1.88.2 (build `0820-0745`), HEAD `584834ef`
> **Cadre** : `plans de travail/PLAN-AUDIT-cadre-conception-2026-08-20.md`, section 5 (session 1 de 2)
> **Nature** : constats seulement — aucun correctif, aucune écriture hors rapport/SESSION/RELAIS.
> **Méthode** : revue de code sur les 6 axes du §4.2 (quatre passes parallèles puis
> contre-vérification aux lignes citées), et reproduction Chromium des 8 scénarios
> du §5.3 sur profil vierge (jamais les données réelles). Chaque constat précise
> son niveau de preuve : **[NAV]** reproduit au navigateur, **[CODE]** vérifié aux
> lignes citées, **[AGENT]** rapporté par une passe de revue, non contre-vérifié.

---

## Synthèse (5 lignes)

Le cœur du pattern Bibliothèque + Assemblage tient : références par id, namespacing
des clés vivantes, garde #449 et garde anti-seconde-fiche #455 confirmées au
navigateur. **Un Bloquant** : en édition d'horaire, changer le nombre de séances
écrase les séances saisies par les défauts, et « Enregistrer » les persiste en
silence. Les Majeurs se concentrent sur trois familles : suppressions sans garde
(horaire, enseignant), copies dénormalisées qui divergent (nom du GC, horaireHebdo,
profilEnseignant, dureePeriode), et chemins de bascule/création de trimestre qui ne
réinitialisent pas le contexte. #328-T1 (durée) et #282-T1 (doublons) : non
reproduits sur 1.88.2 ; la désync nom/sidebar de #328-T1 a une autre cause, elle, confirmée.

---

## État du dépôt au moment de l'audit

- Base d'audit : `584834ef` (= `origin/main` au démarrage), arbre propre, Vitest 2768/2768.
- Le rituel de début avait détecté la branche `claude/uniform-text-field-font-0vy832`
  en avance sur `main` (une « 1.88.3 » orpheline, contredisant le « aucun travail en
  avance » de `RELAIS.md`). **Réglé en cours d'audit** : Grégoire a fusionné la PR #79
  (1.88.3 police des champs + **1.88.4** mise en page Productions, `e19fd7a6`).
  Ces deux commits sont de l'UI hors périmètre Cadre (styles.css, productions.js,
  index.html) : les constats ci-dessous, établis sur 1.88.2, restent valides.
  ⚠ La **session 2** auditera un HEAD ≥ 1.88.4 qui INCLUT la retouche du formulaire
  Productions — en tenir compte en lisant sa doc et ses portes.

---

## Constats — BLOQUANT

```
[CT-01] Édition d'horaire : changer le format écrase les séances saisies  [NAV]
Gravité   : Bloquant
Axe       : 2 (logique) — et 1 (la copie horaireHebdo est réécrite avec les défauts)
Où        : js/trimestre-v2-horaires.js:797-831 (régénération innerHTML avec défauts) ;
            câblage data-on-change des selects nb séances et périodes/séance dans index.html
Constat   : FAIT (reproduit) : horaire existant « Mar-Jeu » (Mardi 10:00-12:00 A-101,
            Jeudi 14:00-16:00 A-101) ouvert en édition ; passage de « Nombre de
            séances » 2 → 3 ⇒ les trois lignes affichent instantanément les défauts
            (Lundi/Mardi/Mercredi 08:00-10:00, local vide). « Enregistrer » persiste
            ces défauts dans a2026_horaires et réécrit a2026_horaireHebdo, avec
            toast « Horaire "Mar-Jeu" modifié ». Le re-remplissage des valeurs
            n'existe que dans editerHoraireV2, pas dans le handler du select.
Impact    : perte silencieuse de la configuration d'horaire par un geste banal
            (ajouter une séance à un horaire existant). Le calendrier et les
            présences héritent des séances par défaut. Récupérable en re-saisissant,
            mais rien ne signale la perte.
Proposition : BACKLOG — préserver les valeurs saisies lors de la régénération des
            lignes de séance (reprendre l'état du DOM avant innerHTML), ou refuser
            le changement de format sans confirmation explicite.
```

## Constats — MAJEUR

```
[CT-02] Suppression d'horaire et d'enseignant : aucune garde référentielle  [NAV]
Gravité   : Majeur
Axe       : 2 et 3
Où        : js/trimestre-v2-horaires.js:731-754 ; js/trimestre-v2-enseignants.js:309-333 ;
            gardes mortes : js/entites/horaires.js:205-222, js/entites/enseignants.js:204-221
Constat   : FAIT (reproduit) : supprimer l'horaire référencé par le GC actif = simple
            confirm() générique (« Cette action est irréversible ») puis filter ;
            gc.horaireId devient orphelin, le select Horaire du formulaire GC se
            vide sans explication, horaireHebdo est vidé. Même chose pour
            l'enseignant. FAIT (code) : les fonctions verifierSuppressionHoraire /
            verifierSuppressionEnseignant / verifierSuppressionCours existent dans
            js/entites/ et n'ont AUCUN appelant (grep exhaustif).
            Deux effets de masquage aggravants, reproduits : la carte résumé
            continue d'afficher le nom de l'enseignant SUPPRIMÉ (repli silencieux
            sur la copie profilEnseignant, cf. CT-10), et le badge « 4/5
            configurés » ne bronche pas (cf. CT-13).
Impact    : références orphelines muettes dans les groupes-cours ; symptômes
            différés et inexpliqués (« Veuillez sélectionner un horaire » sans
            cause visible). Asymétrie de contrat entre les trois entités de
            bibliothèque : seul le cours a une garde vivante (#449).
Proposition : BACKLOG — brancher un recensement à la #449 sur la suppression
            d'horaire et d'enseignant (les gardes existent déjà, mortes), ou au
            minimum nommer les GC affectés dans le confirm.
```

```
[CT-03] Le « nom généré » du groupe-cours est une hydratation persistée  [NAV]
Gravité   : Majeur
Axe       : 1 et 6 (divergence avec le pattern documenté « hydratation à l'affichage »)
Où        : js/trimestre-v2-groupes-cours.js:626 (genererNomGroupeCoursV2 à la
            sauvegarde), 642-652 (persisté), 162 et 393 (réaffiché tel quel)
Constat   : FAIT (reproduit) : le champ gc.nom embarque le code du cours et le
            résumé d'horaire au moment de la sauvegarde. Après modification de
            l'horaire (Mar-Jeu → Lun-Ven) et rechargement, LA MÊME carte résumé se
            contredit : titre « A2026-601-101-MQ-00001 (Mar-AM / Jeu-PM) » (nom
            stocké), ligne Horaire « Lun-Ven » (hydratée). Le dropdown d'en-tête,
            lui, hydrate par id (trimestre-v2-orchestre.js:87-103) : deux libellés
            différents pour le même GC. Le nom stocké ne se corrige qu'à un
            re-enregistrement manuel du GC.
Impact    : désynchronisation permanente nom ↔ réalité après tout renommage de
            cours (code) ou modification d'horaire. C'est la cause vraisemblable du
            volet « désync sidebar/nom généré » de #328-T1 (voir Verdicts) —
            INFÉRENCE, confiance haute : même symptôme, mécanisme démontré.
Impact secondaire [NAV] : la carte résumé et l'en-tête ne sont pas re-rendus après
            la sauvegarde d'un cours ou d'un horaire (mise à jour au prochain
            rechargement seulement).
Proposition : BACKLOG — recalculer le nom à l'affichage (le stocké devient un
            cache ou disparaît), et rafraîchir carte + en-tête après toute
            sauvegarde d'entité référencée.
```

```
[CT-04] horaireHebdo : la fusion par jour écarte la 2e séance d'un même jour  [NAV]
Gravité   : Majeur
Axe       : 1 et 3
Où        : js/trimestre-v2-horaires.js:692-707 et 757-771 (fusion dédupliquée par
            jour, `if (!joursDejaVus.has(jourNormalise))`)
Constat   : FAIT (reproduit) : deux horaires dans a2026 — « Mar-Jeu » (groupe 00001,
            Mardi 10:00 + Jeudi 14:00) et « Mar-soir » (groupe 00002, Mardi 18:00).
            Après sauvegarde, a2026_horaireHebdo contient [Mardi 10:00, Jeudi 14:00] :
            la séance du mardi soir du second groupe est absente.
            FAIT (code) : trimestre-v2-horaires.js est écrivain de horaireHebdo,
            non listé au registre DATA-OWNERSHIP (violation #7 : 3 écrivains listés,
            celui-ci n'y est pas).
Impact    : le calendrier et la saisie des présences (lecteurs de horaireHebdo) ne
            voient jamais la deuxième séance d'un même jour — cas réel dès que deux
            groupes ont cours le même jour à des heures différentes.
Proposition : BACKLOG — fusionner par (jour, heure) ou par séance complète ;
            mettre le registre DATA-OWNERSHIP à jour.
```

```
[CT-05] Création+activation d'un trimestre : le contexte de l'ancien survit  [NAV]
Gravité   : Majeur
Axe       : 3 (cohérence inter-modules, bascule)
Où        : js/trimestre-v2-liste.js:530-603 (ouvrirModalNouveauTrimestre →
            creerTrimestre(…, activer) : recharge identification/cadre/journées/stats
            SEULEMENT — pas les recharges du chemin changerTrimestreActifV2:431-525)
Constat   : FAIT (reproduit, attente 2,5 s) : depuis a2026 configuré, « + Nouveau
            trimestre » H2027 avec activation immédiate ⇒ groupeCoursActif pointe
            toujours le GC d'a2026 (trimestreId: "a2026"), infoCours porte toujours
            le cours d'a2026, la clé miroir trimestreActif reste à null, le dropdown
            Horaire propose « Mar-Jeu » (qui vit dans a2026_horaires), l'en-tête
            liste le GC d'a2026 et la carte résumé l'affiche « actif ». Éditer
            l'horaire fantôme est refusé par le garde du 29 mai — toast
            « Impossible d'enregistrer cet horaire », inexpliqué pour l'utilisateur
            puisque l'UI a offert l'option. Le chemin de bascule par le SÉLECTEUR
            (changerTrimestreActifV2, #446) fait, lui, les recharges.
            FAIT (reproduit, second volet) : au RETOUR vers a2026 par le sélecteur,
            le GC (pourtant actif:true) n'est pas restauré — après 3 s : en-tête
            positionnée sur le GC, groupeCoursActif = null, carte « Aucun
            groupe-cours sélectionné ». Trois surfaces, trois états.
Impact    : c'est le scénario type d'une rentrée (créer le trimestre suivant).
            Données d'un autre trimestre offertes à l'assemblage, refus gardés mais
            inexpliqués, et filtrages aval (évaluations, présences lisent
            groupeCoursActif) sur un pointeur d'un autre trimestre puis nul.
Proposition : BACKLOG — faire passer la création-avec-activation par le même chemin
            de recharge que changerTrimestreActifV2 ; élucider la non-restauration
            du GC actif au retour (peuplerDropdownGroupeCoursActif écrit le
            dropdown mais pas le pointeur).
```

```
[CT-06] Journées sans cours : édition à cheval sur une bascule = faux succès  [NAV]
Gravité   : Majeur
Axe       : 2 et 3
Où        : js/trimestre-v2-init.js:556 (evenementEnEditionV2 jamais réinitialisé à
            la bascule), 652-663 (findIndex sans branche else), 675-676 (toast succès)
Constat   : FAIT (reproduit) : « Action de grâce » créée dans a2026, ouverte en
            « Modifier », bascule vers H2027 (création+activation), description
            modifiée, confirmation ⇒ toast « Journée modifiée », MAIS
            a2026_journeesSansCours garde la description d'origine et
            h2027_journeesSansCours reste vide. Le findIndex ne trouve rien dans la
            liste du nouveau trimestre et la branche absente avale tout.
            changerTrimestreActifV2 réinitialise l'éditeur d'horaire (#332) et le
            formulaire GC (#446), pas le formulaire d'événement — troisième
            occurrence de la même famille.
Impact    : modification perdue avec confirmation de succès mensongère ; en mode
            ajout après bascule, l'événement rempli dans le contexte de l'ancien
            trimestre est créé dans le nouveau sans avertissement.
Proposition : BACKLOG — réinitialiser evenementEnEditionV2 + formulaire à la
            bascule ; ajouter la branche else (erreur explicite) au findIndex.
```

```
[CT-07] dureePeriode : absente de CLES_NAMESPACEES — globale de facto,
        migration orpheline, fuite vers la démo  [CODE]
Gravité   : Majeur
Axe       : 1 (écart SSOT/namespacing) — recoupe docs/DATA-OWNERSHIP.md:87 qui la déclare « NS »
Où        : js/trimestres.js:51-113 (absente de la liste ⇒ cle('dureePeriode') rend
            la clé nue, fallthrough :323-324) ; js/horaire.js:296-311 (lecteur/écrivain
            « source unique : clé namespacée » — en réalité nue) ;
            js/pratiques/modalites-evaluation.js:120-132 (purgerLegacy écrit
            `{id}_dureePeriode`) ; js/demo-namespace.js:149-156 (pack écrit demo_dureePeriode)
Constat   : FAIT (code, vérifié aux 4 sites) : la durée de période vit dans la clé
            nue `dureePeriode`, partagée entre tous les trimestres. La migration
            purgerLegacy() écrit `{id}_dureePeriode`… que personne ne lit jamais
            (obtenirDureePeriode lit cle() ⇒ clé nue ⇒ défaut 55). Le pack démo
            écrit demo_dureePeriode… que la démo ne lit pas non plus (mêmes
            lectures par clé nue). [NAV] : changer la durée écrit bien la clé nue.
Impact    : (1) une durée legacy ≠ 55 min « migrée » retombe silencieusement à 55 —
            conversions périodes/heures faussées (indices A, présences) ;
            (2) la démo lit la durée réelle de l'utilisateur au lieu du pack ;
            (3) impossible d'avoir une durée différente par trimestre, contrairement
            au modèle documenté (l'UI dit « S'applique à tous les horaires », la
            doc registre dit NS : les deux ne peuvent pas être vraies à la fois).
Proposition : BACKLOG — trancher le statut (NS ou G) puis aligner CLES_NAMESPACEES,
            purgerLegacy, le pack démo et DATA-OWNERSHIP sur la décision.
```

```
[CT-08] Garde #449 : deux familles de clés et les références legacy par code
        échappent au recensement  [CODE]
Gravité   : Majeur
Axe       : 3
Où        : js/cours.js:412 (SUFFIXES_FK_COURS = presences, productions,
            groupeEtudiants, groupesCours, evaluationsSauvegardees) ;
            js/travaux-stockage.js:308 (chaque fichier travail porte coursId) ;
            js/planification-donnees.js:62 (les cartes portent coursId, #368) ;
            js/cours.js:444 et 468-476 (appariement par id strict) vs :226-229
            (le même fichier gère défensivement des références legacy par code/sigle)
Constat   : FAIT (code) : `fichiersTravaux` et `planification_mindmap` portent des
            coursId et ne figurent pas au registre du recensement — et mindmap est
            un dictionnaire, donc même ajouté il serait sauté par le
            `if (!Array.isArray(valeur)) continue;` (cours.js:443). L'appariement
            est `it.coursId === coursId` (id strict).
            INFÉRENCE (confiance moyenne-haute) : un cours dont les seules données
            restantes sont des fichiers travaux orphelins ou une carte mentale liée
            passe la garde ; idem une référence legacy par code (dépend de ce que
            les migrations #446/#455 ont déjà re-pointé).
            [NAV], nuance de fiabilité : la garde refuse bien avec des étudiants
            porteurs de coursId (reproduit : refus explicite nommant les clés) ;
            elle a accepté la suppression quand les fiches étudiantes n'avaient ni
            coursId ni groupeCoursId. Le chemin d'import réel pose coursId
            (trimestre-v2-etudiants.js:347,749 ; groupe.js:317,330) mais peut poser
            null si aucun cours actif au moment du collage (groupe.js:302).
Impact    : la famille « orphelins silencieux » (#154) que #449 devait fermer reste
            entrouverte sur les artefacts étudiants (fichiersTravaux) et la carte.
Proposition : BACKLOG — étendre le recensement à fichiersTravaux et à la mindmap
            (gérer le cas dictionnaire), et décider du sort des références par code.
```

```
[CT-09] Sécurité : sites innerHTML non échappés dans le périmètre  [CODE, spots re-vérifiés]
Gravité   : Majeur (règle non négociable n°1 ; exploitabilité limitée par la CSP)
Axe       : 6
Où (sites confirmés en lecture directe) :
  · js/trimestre-v2-horaires.js — le fichier le plus touché, 5 fonctions vivantes :
    :53-56 et :74 (coursActifInfo ← infoCours), :101-113 (jourNom, heureDebut,
    local — texte libre), :365-367 (h.nom — l'id est échappé sur la même ligne,
    pas le nom), :431-443 (horaire.nom, s.jour, heures, localSeance), :486-490 (grp)
  · js/trimestre-v2.js:303-308 (grp injecté 2×, seul dropdown non échappé de la fonction)
  · js/trimestre-v2-enseignants.js:110-115 (nomComplet brut, e.id échappé à côté)
  · js/groupe.js:547-550 (groupe ← collage CSV)
  · js/horaire.js:1233, 1268-1270 (nomSeance fallback seance.nom ; hidden inputs
    value="${seance.groupe}" bruts) [AGENT, non contre-vérifié ligne à ligne]
  · js/trimestre-v2-liste.js:108 (t.dateFin), :116-143 (data-param="${t.id}" × 8) —
    provenance normalement contrainte, mais le registre transite par import [AGENT]
  · js/trimestre-v2-cours.js:452-477 et 923-927 : renderers NON échappés MORTS
    (aucun appelant — grep) qui ciblent les mêmes éléments DOM que les renderers
    vivants d'autres fichiers : XSS latent prêt à se réveiller (cas d'école 51e5cdc).
Constat   : FAIT : zéro handler inline et zéro eval sur tout le périmètre (grep) ;
            l'échappement est fait partout ailleurs — l'asymétrie « id échappé /
            nom brut » sur une même ligne montre des oublis ponctuels, pas une
            absence de politique. Vecteur réaliste : données importées (ZIP,
            collage CSV, restauration Codex).
            NOTE structurelle : echapperHtml (config.js:281, textContent→innerHTML)
            n'encode pas les guillemets — tout usage en contexte d'attribut permet
            d'en sortir avec un `"` ; et un href="${echapperHtml(url)}" laisse
            passer javascript: (trimestre-v2-orchestre.js:487). CSP mitige les deux.
Impact    : violations de la règle n°1 dans du code vivant du premier module que
            configure un utilisateur ; injection de balisage possible par import.
Proposition : BACKLOG — passe d'échappement sur les sites listés + retrait des
            3 renderers morts ; réfléchir à un echapperHtml qui couvre les attributs.
```

```
[CT-10] profilEnseignant écrasé par la sauvegarde de N'IMPORTE quel profil  [CODE+NAV]
Gravité   : Majeur
Axe       : 1 et 3
Où        : js/trimestre-v2-enseignants.js:278 (db.setSync('profilEnseignant', profil)
            à chaque sauvegarde, sans condition)
Constat   : FAIT (code + observé à la création) : chaque sauvegarde de profil —
            y compris celui d'un·e collègue, l'UI est multi-profils — écrase la
            copie globale profilEnseignant (sans id). [NAV] : après suppression du
            profil, la copie globale SURVIT et la carte résumé du GC continue
            d'afficher le nom supprimé (repli _resoudreEnseignantPourCarteGC,
            branche 'profil', trimestre-v2-groupes-cours.js:352-355).
Impact    : le « profil de l'utilisateur » devient le dernier profil édité ;
            lecteurs affectés : export-pdf, cc-license (attribution d'auteur CC
            potentiellement fausse), affichages GC.
Proposition : BACKLOG — ne synchroniser profilEnseignant que pour LE profil de
            l'utilisateur (marqueur explicite), et purger la copie à la suppression.
```

```
[CT-11] Cluster horaire legacy non retiré : deux systèmes coexistent  [CODE]
Gravité   : Majeur (zéro-dette + fuite inter-trimestre possible)
Axe       : 1 et 6
Où        : js/trimestre-v2-horaires.js:25-307 (accordéon séances legacy) vs
            :320-790 (bibliothèque d'horaires) ; écritures legacy :260-261, 288-289
            via cleHoraire() → `seancesHoraire_<coursId>` (horaire.js:51-58, clé
            par-cours NON préfixée trimestre) ; clé brute `seancesHoraire` encore
            écrite par js/trimestre-v2-orchestre.js:248 et js/entites/groupe-cours.js:246 ;
            fallback n°5 lisant la clé brute : js/horaire.js:168
Constat   : FAIT (code) : le même fichier porte deux systèmes d'horaire ; l'écriture
            des séances passe par une clé par-cours sans préfixe de trimestre, la
            lecture par une chaîne de fallbacks différente. Depuis #455 (cours
            GLOBAL), la clé par-cours est structurellement partagée entre trimestres.
            INFÉRENCE (confiance haute sur le chemin, occurrence conditionnelle) :
            sur un trimestre neuf sans horaire configuré — l'état d'une rentrée —
            le fallback n°5 ressert les séances du trimestre PRÉCÉDENT restées dans
            la clé brute.
Impact    : dette contraire au principe « tout nouveau chantier RETIRE ce qu'il
            remplace » ; jours/séances d'un autre trimestre affichables (présences,
            aperçus) tant qu'aucun horaire n'est créé dans le nouveau.
Proposition : BACKLOG — retirer le système legacy (accordéon séances + clé brute +
            clé par-cours) au profit de la bibliothèque d'horaires namespacée.
```

```
[CT-12] Entité Horaires sur la clé nue : dette dormante armée  [CODE]
Gravité   : Majeur (aucun effet aujourd'hui — chemin mort — mais résurrection possible au boot)
Axe       : 1 et 6
Où        : js/entites/horaires.js:8,17 (CLE_HORAIRES = 'horaires', nue) alors que
            `horaires` est dans CLES_NAMESPACEES (js/trimestres.js:70) ;
            chaîne d'appel morte : js/contexte.js:114-115 (changerCoursDepuisEntete,
            AUCUN appelant vivant — l'en-tête utilise changerGroupeCoursDepuisHeader)
            avec en prime un bug d'argument (synchroniserInfoCours reçoit l'id du GC
            au lieu du trimestreId, js/entites/groupe-cours.js:192) ;
            js/migrations.js:620-696 (migrerVersEntiteHoraires : LIT cle('horaires')
            mais ÉCRIT la clé nue — chaîne executerMigrationsBeta96 jamais appelée) ;
            js/trimestres.js:1435-1461 (migrerHorairesEtGroupesCours, à CHAQUE boot,
            sans flag : recopie tout résidu de clé brute `horaires`/`groupesCours`
            non vide vers le trimestre ACTIF si son namespace est vide, sans purger)
Constat   : FAIT (code, chaque maillon vérifié par une passe dédiée puis recoupé par
            une seconde) : trois morceaux morts ou dormants se renforcent — une
            entité chargée qui lit/écrit le magasin nu gelé (copie de la migration
            du 21 jan jamais purgée), une migration morte qui écrirait du nu, et une
            migration de boot VIVANTE qui ressuscite tout résidu nu dans le
            trimestre actif. La suppression du dernier trimestre (permise s'il est
            inactif, js/trimestres.js:1153-1161) rebascule de surcroît cle() en
            régime clés nues (:313-316).
Impact    : nul en fonctionnement normal ; famille exacte du « code dormant qui se
            réveille » (51e5cdc) — un recâblage d'en-tête ou un résidu nu suffit.
Proposition : BACKLOG — retirer HorairesEntite + la chaîne Beta96 (zéro-dette),
            purger les clés nues après copie dans migrerHorairesEtGroupesCours.
```

```
[CT-13] « Exporter » un cours n'exporte rien et retire la fiche de la sélection  [CODE+NAV]
Gravité   : Majeur (comportement contraire au libellé)
Axe       : 2
Où        : js/cours.js:311 (menu ⋮ : label « Exporter », title « Exporter ce cours
            en JSON pour le partager ») vs :710-745 (partagerCours : aucun
            Blob/createObjectURL/click — il demande les métadonnées CC, pose
            dansBibliotheque=false, sauvegarde, alert « Cours partagé avec succès !
            … disponible dans la section "Cours disponibles à ajouter" »)
Constat   : FAIT (code vérifié ; menu observé au navigateur : « Exporter » y figure
            bien). exporterCoursSimple (:589-602), qui crée réellement un fichier,
            n'est branché nulle part dans ce modal ; « Exporter tous mes cours »
            (partagerTousLesCours, :779-793) télécharge, lui, un JSON.
Impact    : l'utilisateur qui clique « Exporter » n'obtient aucun fichier et voit
            sa fiche quitter sa sélection — perte de sélection non annoncée,
            vocabulaire contradictoire avec l'action réelle.
Proposition : BACKLOG — brancher exporterCoursSimple sur « Exporter » et renommer
            l'action actuelle (« Déposer dans les cours disponibles » ?), ou
            retirer l'entrée.
```

## Constats — MINEUR

```
[CT-14] Badge « X/5 configurés » : deux poids, deux mesures  [NAV]
Gravité   : Mineur
Axe       : 3
Où        : js/trimestre-v2-groupes-cours.js:376-385
Constat   : FAIT : cours et horaire comptent s'ils RÉSOLVENT ; enseignant et
            pratique comptent sur la simple PRÉSENCE de l'id. Reproduit : après
            suppression de l'enseignant référencé, le badge reste « 4/5 ».
Impact    : une référence brisée est masquée ; incohérence interne du calcul.
Proposition : BACKLOG — compter sur résolution pour les 4 références.
```

```
[CT-15] Doublons créables en silence : groupe-cours identique, courriels d'enseignants  [AGENT + code cité]
Gravité   : Mineur
Axe       : 2
Où        : js/trimestre-v2-groupes-cours.js:654-677 (push sans détection
            trimestre+cours+groupe) ; js/trimestre-v2-enseignants.js:263-273
            (aucun contrôle de courriel à la création manuelle — la migration :41
            vérifie, elle) ; js/entites/cours-entite.js:44-71 (creerCours sans
            validation ni unicité — l'invariant #455 n'est défendu qu'à l'import et
            au formulaire)
Constat   : FAIT (code cité par deux passes concordantes) : deux GC identiques
            (même trimestre, même cours, même groupe) sont créables sans
            avertissement. Le cours, lui, a son confirm #455 (reproduit [NAV] :
            refus → zéro doublon ; acceptation → doublon assumé).
Impact    : deux entrées indistinguables dans les dropdowns ; présences/évaluations
            potentiellement éclatées entre deux GC jumeaux.
Proposition : BACKLOG — garde de doublon sur le tuple trimestre+cours+groupe du GC.
```

```
[CT-16] Annulations qui ne collent pas  [CODE]
Gravité   : Mineur
Axe       : 2
Où        : js/trimestre-v2-horaires.js:606-613 (annulerFormHoraireV2 ne nettoie pas
            cle('horaireSelectionne') — changerHoraireSelectionneV2 la nettoie, :388) ;
            js/trimestre-v2-enseignants.js:303 (toast de SUCCÈS « Modifications
            annulées » pour une annulation)
Constat   : FAIT (code vérifié). L'horaire « annulé » se rouvre en édition au
            prochain chargement de l'accordéon.
Impact    : état UI et état persisté divergent après « Annuler » ; sémantique des
            toasts brouillée.
Proposition : BACKLOG — nettoyer la sélection persistée à l'annulation ; toast neutre.
```

```
[CT-17] Sélectionner un id non résolu = silence total  [AGENT]
Gravité   : Mineur
Axe       : 2
Où        : js/trimestre-v2-cours.js:302-325 ; js/trimestre-v2-groupes-cours.js:329-336 ;
            js/trimestre-v2-horaires.js:396-403 (find sans branche else, patron × 3)
Constat   : FAIT (code cité) : un id non résolvable laisse le formulaire précédent
            affiché, sans retour. Cas d'occurrence : option périmée avant re-render,
            donnée restaurée/corrompue.
Impact    : l'utilisateur croit éditer l'item cliqué.
Proposition : BACKLOG — branche else avec message (patron commun aux 3 accordéons).
```

```
[CT-18] Modales Bibliothèque reconstruites intégralement à chaque action  [AGENT]
Gravité   : Mineur
Axe       : 5 (qualitatif)
Où        : js/trimestre-v2-groupes-cours.js:898-999 (fermer+rouvrir après chaque
            Activer/Masquer/Afficher/Supprimer) ; js/cours.js:680-681, 737-738 (idem)
Constat   : FAIT (code cité) : chaque action détruit et reconstruit la modale
            (relecture des collections + re-render complet).
Impact    : perte de la position de défilement, flash — sensible au doigt (iPad).
Proposition : BACKLOG — mise à jour ciblée de la carte concernée.
```

```
[CT-19] obtenirTrimestres : détection de doublon par NOM, nettoyage par ID —
        réécriture à chaque appel si deux trimestres partagent un nom  [CODE]
Gravité   : Mineur
Axe       : 2 et 5
Où        : js/trimestres.js:142-179 (détection ids OU noms :150-156, dédup par id
            seul :161-170, db.setSync à chaque passage :173) ; cle() relit le
            registre deux fois par appel (:281-325 + estTrimestreArchive)
Constat   : FAIT (code vérifié) : deux trimestres d'ids distincts au même nom
            (champ nom libre — #379 ne garde que l'id) déclenchent
            « doublons détectés » + réécriture du storage À CHAQUE
            obtenirTrimestres(), donc à chaque cle(), sans jamais converger.
Impact    : en régime « noms jumeaux », écriture storage + warn en boucle sur la
            primitive la plus appelée de l'app ; surcoût constant sinon.
Proposition : BACKLOG — aligner détection et nettoyage (id seul), mémoïser la lecture.
```

```
[CT-20] Boot et bascule : travail différable et double rendu  [AGENT, recoupé]
Gravité   : Mineur
Axe       : 5 (qualitatif, aucun chiffrage — conforme au plan)
Où        : js/trimestre-v2.js:614-627 (rendu COMPLET de l'onglet Trimestre à chaque
            chargement, même section masquée) ; js/main.js:1283 + :260 (scan intégral
            du storage par migrerJourneesSansCours 2× par boot) ; js/main.js:465-471
            et :492-567 (purges #409/#424 sans flag — BACKLOG #428/#430, échéance
            « rentrée sept. 2026 » imminente) ; js/trimestre-v2-liste.js:487-495
            (bascule : peupler async non attendu → la plupart des vues rendues 2×,
            calendrier régénéré 2×)
Constat   : FAIT (code cité par la passe orchestration). Aucun db.getSync en boucle
            ni sérialisation à la frappe détectés sur le périmètre (deux passes
            concordantes) — le gros du coût est du travail au chargement différable.
Impact    : latence de boot et de bascule (perceptible surtout iPad), sans corruption.
Proposition : BACKLOG — différer le rendu de l'onglet à sa première ouverture ;
            honorer #428/#430 à l'échéance.
```

```
[CT-21] Suppression de trimestre : deux cas limites sans garde  [AGENT]
Gravité   : Mineur
Axe       : 2
Où        : js/trimestres.js:1145-1161 (seule garde : anti-actif) ; :313-316
            (registre vide ⇒ cle() rend les clés nues) ; :883-914 (pool #358
            inter-trimestre) vs :1175-1181 (suppression par préfixe)
Constat   : FAIT (code cité) : (a) le DERNIER trimestre, s'il est inactif, est
            supprimable ⇒ registre vide ⇒ l'app rebascule en régime clés nues ;
            (b) une grille/échelle dont la seule copie vit dans le namespace d'un
            trimestre supprimé disparaît même si un autre trimestre la référence
            encore par id via le pool (INFÉRENCE, confiance moyenne : exige une
            référence inter-trimestre créée après la migration C1).
Impact    : (a) résidus nus redeviennent la donnée vivante ; (b) référence brisée
            dans le trimestre survivant. Le filet réel : export automatique +
            confirmation forte avant suppression (trimestre-v2-liste.js:377-408).
Proposition : BACKLOG — refuser la suppression du dernier trimestre ; recenser les
            références inter-trimestres avant suppression.
```

```
[CT-22] Outil de diagnostic #449 : deux erreurs de schéma  [AGENT]
Gravité   : Mineur (outil console, mais c'est l'outil d'arbitrage canonique/doublon)
Axe       : 2
Où        : js/cours.js:850, 893-898 (snapshots attribués à des coursId alors que la
            clé est {trim}_snapshots_{gcId}, cf. js/snapshots.js:88 — le recensement
            #449, lui, compose la bonne clé :475) ; js/cours.js:453-476 (clé nue
            groupesCours ⇒ trimestre « (sans trimestre) » ⇒ comptages sur des clés
            inexistantes, toujours 0)
Constat   : FAIT (code cité, deux passes).
Impact    : _diagnostiquerModeleCours sous-compte et pollue sa liste d'orphelins ;
            les GC d'un résidu de clé nue passent le recensement avec des comptages
            structurellement nuls.
Proposition : BACKLOG — corriger le schéma snapshots du diagnostic ; traiter la clé
            nue groupesCours explicitement.
```

## Constats — NOTE

```
[CT-23] coursEnEdition (js/config.js:224) : résidu mort confirmé  [CODE]
Axe 6 — grep sur tout js/ : aucune lecture ni écriture ailleurs (coursEnEditionV2
de trimestre-v2-cours.js:481 est une variable IIFE distincte). Zone protégée : mention
pour mémoire, aucune action. (Point d'attention §5.4 du plan : soldé.)
```

```
[CT-24] console.log / console.info résiduels  [CODE]
Axe 6 — js/cours.js:917,918,931 (+ console.group) dans _diagnostiquerModeleCours,
outil console assumé dont la sortie EST la fonctionnalité — violation littérale de
la règle n°5, à trancher ; js/trimestre-v2-cours.js:141 : un console.info (la règle
ne tolère que warn/error). Aucun autre écart sur le périmètre.
```

```
[CT-25] Écarts doc/code — les deux docs de janvier sont périmées sur ~15 points  [CODE/AGENT]
Axe 6 — Synthèse (détail des lignes dans les deux passes, disponibles au besoin) :
· docs/modules/trimestres.md : evenementsPrevus/Imprevus → fusionnées en
  journeesSansCours (#374) ; grillesTemplates/echellesTemplates/pratiquesConfigurables/
  modalitesEvaluation données « globales » → namespacées (#358, 24 mai, #328) ;
  mode démo « groupe 9999 » → trimestre id 'demo' + cleDemo() ; seancesCompletes →
  namespacing plus fin (par GC/cours) ; « session: H ou A » → l'été existe ;
  les 3 miroirs du trimestre actif (flag registre + window.trimestreActif + clé
  trimestreActif) non documentés ; module éclaté sur 8+ fichiers non mentionnés.
· docs/architecture/pattern-bibliotheque-assemblage.md : js/entites-ui.js N'EXISTE
  PLUS (archivé, non chargé) ; clé `horaires` donnée « non namespacée » → FAUX
  (CLES_NAMESPACEES depuis le 21 jan, modèle « horaire propre au trimestre » du
  29 mai) — Q1 du plan (§5.4) tranchée : NAMESPACÉE ; gabarits prédéfinis et
  import/export Trimestre « à implémenter » → livrés (optgroup Démo, export
  d'archive) ; schéma GC `groupe:` → champ canonique `groupeNum` ; `enseignants`
  absente de CLES_GLOBALES (globale par omission — cf. CT-26).
Proposition : BACKLOG — réviser les deux docs (ou les marquer périmées en tête).
```

```
[CT-26] cle() : « global par omission » — le fallthrough silencieux est la
        mécanique commune de CT-07/CT-12  [CODE]
Axe 1 — js/trimestres.js:323-324 : toute clé absente des deux registres est rendue
telle quelle, sans bruit. Clés globales DE FAIT hors registres : enseignants,
infoCours, groupeCoursActif, trimestreActif, dureePeriode. Un warn sur clé inconnue
(ou un registre exhaustif) fermerait la classe de bug (#367 en était déjà).
```

```
[CT-27] Registre DATA-OWNERSHIP : sous-comptes structurels  [AGENT]
Axe 1 — (a) les écrivains « via variable opaque » de la couche entités sont
invisibles à audit-ssot.py (assumé par l'outil) : cours-entite.js est un écrivain
VIVANT de `cours` non listé (appelé par trimestre-v2-cours.js:1127,1151) ;
(b) depuis #449 (19 août, postérieur au registre), js/cours.js écrit infoCours
(:532, 8e écrivain de la violation #11) et les clés {trim}_groupesCours (:529) ;
(c) trimestre-v2-horaires.js écrit horaireHebdo (:707,:771), non listé (violation #7).
Proposition : BACKLOG — re-générer audit-ssot et mettre le registre à jour.
```

```
[CT-28] Parcours vierge : frictions relevées (aucune bloquante)  [NAV]
Axe 2/UX — (a) la création de trimestre passe par une séquence prompt()/confirm()
natifs (trimestre-v2-liste.js:530-603) là où le reste du module a des formulaires ;
(b) créer un horaire exige un « Groupe associé » et le toast d'erreur ne dit pas où
créer ce groupe (l'ordre des accordéons le prévoit, mais l'utilisateur qui suit le
plan cours→enseignant→horaire bute) ; (c) le formulaire GC ne présélectionne pas le
trimestre ACTIF (« Veuillez sélectionner un trimestre » sur l'unique trimestre
existant) ; (d) l'aide GC est un alert() de ~12 lignes
(trimestre-v2-groupes-cours.js:126-138) ; (e) le libellé attendu « Complet » du
plan n'existe plus — la carte dit « X/5 configurés ».
Proposition : BACKLOG — lot micro-UX du parcours de rentrée (à prioriser avec le
skill design-interface).
```

```
[CT-29] echapperHtml : limites structurelles (guillemets, URL)  [AGENT]
Axe 6 — le helper (config.js:281) n'encode pas les guillemets : en contexte
d'attribut, une donnée avec `"` sort de l'attribut ; un href échappé laisse passer
javascript: (trimestre-v2-orchestre.js:487, siteWeb). CSP mitige l'exécution dans
les deux cas. À garder en tête pour le partage de profils (Voûte).
```

---

## Verdicts sur les entrées « à recouper » (§5.3 / SUIVI-BUGS)

| Entrée | Verdict sur 1.88.2 | Preuve |
|---|---|---|
| **#328-T1** — « changer la durée vide les selects de l'assemblage » | **Non reproduit.** Durée 55→75 : les 5 selects du GC restent remplis, l'horaire garde son id, aucune recréation d'horaires. La cause suspectée (« la durée recrée les horaires ») n'existe plus depuis le modèle « horaire propre au trimestre » (29 mai). | [NAV] passe propre dédiée |
| **#328-T1** — volet « désync sidebar / nom généré » | **Confirmé, autre cause** : le nom du GC est une hydratation persistée (CT-03). Le symptôme se reproduit par une simple modification d'horaire. | [NAV] |
| **#282-T1** — doublons de cours dans la Bibliothèque | **Chemin fermé.** Créer un 2e cours au même code déclenche le confirm #455 (« Une fiche 601-101-MQ existe déjà… ») ; refus = zéro doublon ; acceptation = doublon assumé par l'utilisateur. La pollution HISTORIQUE d'a2025 n'est pas re-nettoyée par l'audit (hors mandat). | [NAV] |
| **#449** — suppression de fiche cours (vérification indépendante) | **Confirmé fonctionnel.** Avec données réalistes (étudiants porteurs de coursId) : REFUS explicite nommant les clés bloquantes, rien de supprimé. Nuances : CT-08 (familles hors recensement, fiabilité dépendante de coursId). | [NAV] |

## Scénarios §5.3 — statut

1. Parcours vierge : ✅ déroulé (trimestre → cours → enseignant·e → [seed étudiants,
   dépendance] → horaire → GC). Persistance après rechargement : ✅. Frictions : CT-28.
2. Modification d'entité référencée : ✅ — CT-03 (+ non-rafraîchissement).
3. Suppression d'entité référencée : ✅ — CT-02.
4. Durée de période : ✅ — verdict ci-dessus.
5. Doublons de cours : ✅ — verdict ci-dessus.
6. Bascule de trimestre : ✅ — isolation des namespaces vérifiée (les clés a2026_*
   restent intactes, les bibliothèques globales cours/enseignants visibles des deux
   côtés, aucune fuite de données namespacées) ; MAIS CT-05 sur les deux chemins.
7. #449 : ✅ — verdict ci-dessus.
8. iPad : consigné ci-dessous, non simulé (conforme au plan).

## Portes terrain iPad à prévoir (relevé, non simulé)

À intégrer aux portes terrain des futurs correctifs (modèle `portes-terrain`) :
- Séquences prompt()/confirm() natives : création de trimestre (trimestre-v2-liste.js:530),
  suppressions (confirm × 7 sites), aide GC en alert() — lisibilité et geste au doigt.
- Menu ⋮ des cartes de la Bibliothèque (tap vs hover) — trimestre-v2-groupes-cours.js:805-811.
- Fermeture des modales : Escape clavier seulement (trimestre-v2-groupes-cours.js:868-879).
- Reconstruction des modales à chaque action → perte de scroll au doigt (CT-18).
- `<input type="time">` × n séances régénérées (picker iOS + CT-01 : le reset des
  lignes au changement de format est encore plus piégeux au tactile).
- Dropdowns avec optgroup Démo à options disabled (roue iOS affiche du non-sélectionnable).
- Cascade d'auto-association des selects d'assemblage (le select Horaire se réécrit
  sous le doigt) — trimestre-v2-groupes-cours.js:283-304.
- scrollIntoView smooth après ouverture de formulaire (quirks momentum iOS) —
  trimestre-v2-cours.js:627,678 ; trimestre-v2-horaires.js:140,179.
- Boutons btn-sm Modifier/Suppr. côte à côte (cibles tactiles) — trimestre-v2-horaires.js:105-106.

---

## À transmettre à la session 2 (Conception)

1. **Régime des clés, piège n°1** : `cle()` rend TELLE QUELLE toute clé hors
   registres (CT-26). Pour chaque clé du périmètre Conception, vérifier sa présence
   dans CLES_NAMESPACEES/CLES_GLOBALES avant de croire son préfixe. `dureePeriode`
   (CT-07) est le cas d'école.
2. **Patrons récurrents à chercher côté Conception** (tous confirmés côté Cadre) :
   copie dénormalisée persistée qui diverge (nom de GC ↔ chercher les équivalents :
   libellés stockés de grilles/pratiques) ; suppression sans garde référentielle
   (grille référencée par production/cartouche — `cartouches_{grilleId}` est le
   candidat orphelin désigné du plan §6.4) ; « X échappé / Y brut » sur la même
   ligne de template ; modale reconstruite à chaque action ; findIndex/find sans
   branche else ; formulaires non réinitialisés à la bascule de trimestre.
3. **Lien Cadre ↔ Conception vérifié côté Cadre** : le GC référence la pratique par
   `pratiqueId` (nullable), simple présence comptée au badge (CT-14) ; les options
   démo des selects d'assemblage sont bien `disabled` [NAV]. ⚠ HYPOTHÈSE NON
   VÉRIFIÉE, à trancher en session 2 : le garde anti-référence-démo
   `verifierReferencesPasDemo` (js/bibliotheque-ui.js:358-361) fait
   `db.getSync(ref.collection)` avec `'pratiquesConfigurables'` LITTÉRAL
   (js/trimestre-v2-groupes-cours.js:617) alors que la collection est namespacée
   depuis le 24 mai — la moitié « estItemDemo » du garde serait inopérante pour la
   pratique.
4. **Docs de janvier** : périmées sur ~15 points côté Cadre (CT-25) — même réserve
   pour evaluations-productions.md et pratiques.md (« à confronter, pas à croire »).
5. **Perf** : rendu complet de sections masquées au boot (CT-20) — vérifier si les
   onglets Conception font pareil.
6. **1.88.3 non fusionnée** (`claude/uniform-text-field-font-0vy832`) : si elle est
   fusionnée entre les deux sessions, la session 2 audite un HEAD différent — le noter.

## Annexe — items BACKLOG candidats (une ligne chacun, tri avec Grégoire)

1. CT-01 : préserver les séances saisies au changement de format d'un horaire (perte silencieuse).
2. CT-02 : garde référentielle sur suppression d'horaire et d'enseignant (les verifierSuppression* existent, mortes).
3. CT-03 : nom du GC recalculé à l'affichage + rafraîchir carte/en-tête après sauvegarde d'entité référencée.
4. CT-04 : fusion horaireHebdo par (jour, heure) — la 2e séance d'un même jour est perdue.
5. CT-05 : chemin création+activation de trimestre aligné sur changerTrimestreActifV2 ; restauration du GC actif au retour.
6. CT-06 : réinitialiser le formulaire Journées sans cours à la bascule + branche else du findIndex.
7. CT-07 : trancher le statut de dureePeriode (NS/G) et aligner code, migration, démo, registre.
8. CT-08 : étendre SUFFIXES_FK_COURS à fichiersTravaux et planification_mindmap ; sort des références par code.
9. CT-09 : passe d'échappement sur les sites listés + retrait des 3 renderers morts de trimestre-v2-cours.js.
10. CT-10 : profilEnseignant réservé au profil de l'utilisateur (marqueur), purge à la suppression.
11. CT-11 : retirer le système d'horaire legacy (accordéon séances, clé brute, clé par-cours).
12. CT-12 : retirer HorairesEntite + chaîne Beta96 ; purge des clés nues dans migrerHorairesEtGroupesCours.
13. CT-13 : « Exporter » un cours doit exporter (ou être renommé).
14. CT-14 à CT-22 : lot mineur (badge 4/5, doublons GC, annulations, else manquants, modales, dédup par nom, boot différable, dernier trimestre, diagnostic).
15. CT-25/CT-27 : réviser les deux docs de janvier + re-générer le registre DATA-OWNERSHIP.
16. CT-28 : lot micro-UX du parcours de rentrée (avec design-interface).

---

*Rapport produit par la session 1 de l'audit (Claude Code, 20 août 2026). Aucun
fichier de js/, css/ ou index.html modifié. Scripts de reproduction Chromium en
scratchpad de session (jetables) ; chaque scénario repart d'un profil vierge.*
