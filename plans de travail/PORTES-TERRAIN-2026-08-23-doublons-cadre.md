# Portes terrain — CT-15 · les doublons du Cadre

> **Date** : 23 août 2026 · **Version livrée** : **1.93.0** · build `0823-1534`
> **Branche** : `claude/gestion-des-doublons-ytpvkt`
> **Plan appliqué** : `plans de travail/PLAN-291-476-gestion-des-doublons.md` — **Lot 6**
> **Artefact jumeau** : https://claude.ai/code/artifact/bdb3f1b9-f4bb-4f11-9156-64f63bc77efa
> **Porte jumelle, déjà relevée** : `PORTES-TERRAIN-2026-08-23-doublons.md` (Lots 0-5, 39/43)
>
> ---
>
> **Ce que ce lot a changé, en une phrase** : trois créations qui se faisaient
> **en silence** — un groupe-cours identique, un second profil au même
> courriel, une seconde fiche de cours au même code — te posent désormais la
> question. Elles ne sont **jamais interdites** : deux jumeaux sont parfois
> légitimes, et c'est toi qui sais lequel.
>
> **Ce qui est nouveau à l'écran** : trois dialogues de confirmation. Rien
> d'autre ne bouge. Si tu ne les vois jamais, c'est que tu n'as pas de doublon
> — ce qui est la bonne nouvelle, pas un échec de porte.
>
> ---
>
> ## ✅ RELEVÉ REÇU — 23 août 2026 · **29 passées · 0 en échec · 0 non traitée**
>
> **Porte close, sans reliquat.** Les vingt-neuf portes sont vertes, sur les
> deux appareils.
>
> **Les quatre portes qui comptaient vraiment sont dans le lot** — ce sont
> celles où la garde devait rester MUETTE, et où un excès de zèle aurait rendu
> le correctif inutilisable au quotidien :
>
> | Porte | Ce qu'elle éprouve | Verdict |
> |---|---|---|
> | 1.2a | `000-test-zz` en minuscules déclenche le MÊME dialogue que `000-TEST-ZZ` | ✓ le trou de casse est refermé |
> | 1.3d | modifier le seul NOM d'une fiche ne pose aucune question | ✓ une fiche ne se voit pas elle-même |
> | 1.4d | deux homonymes à courriels différents passent sans un mot | ✓ #450 tient hors des bibliothèques |
> | 1.5e | changer l'horaire d'un groupe-cours existant ne pose aucune question | ✓ le triplet ne mord pas l'édition |
>
> Et 1.5c — changer le seul enseignant fait **revenir** la question — confirme
> le choix de conception du lot : horaire et enseignant sont HORS du triplet,
> précisément pour que la garde parle dans le cas de co-enseignement.
>
> **Décisions du §3, toutes rendues, aucune ne demande de code** :
>
> - **3.1 — « bon réglage pour les trois »** : avertir plutôt qu'interdire est
>   acté pour les trois gardes. La règle #455 vaut désormais pour tout le Cadre.
> - **3.2 — « oui »** : le dialogue natif du navigateur est conservé. Il colle
>   à la garde voisine du cours et évite la famille d'empilement de z-index
>   corrigée le 23 août.
> - **3.3 — « c'est suffisant »** (levé le 23 août : le « oui » du relevé
>   pouvait se lire des deux côtés de l'alternative). Nommer le jumeau suffit à
>   décider ; on n'ajoute NI l'horaire NI l'enseignant au message. ⮕ À noter
>   pour la suite : le nom d'un groupe-cours porte déjà le résumé de l'horaire,
>   `genererNomGroupeCoursV2` le lui accole — seul l'enseignant manquait, et
>   Grégoire n'en a pas besoin pour trancher.
>
> **Aucun item de backlog n'est né de cette porte.**

---

## §0 · Préalable — à faire AVANT tout le reste

Sauter un seul de ces points invalide toutes les portes qui suivent.

| | Geste | Attendu |
|---|---|---|
| 0.1 | `git pull` sur ta copie, puis recharger l'app **à fond** (Cmd+Maj+R) | — |
| 0.2 | Regarder le **numéro de version en bas de page** | Il doit correspondre à la version livrée par cette session. **S'il est plus bas, arrête ici** : tout ce qui suit décrirait l'état d'AVANT. |
| 0.3 | Faire une **sauvegarde Codex** | Le §1 crée et supprime des fiches dans ton Cadre. |
| 0.4 | Prévoir les **deux appareils** (Mac et iPad) | Les dialogues natifs ne se présentent pas pareil. |

> ⚠ **Le §1 te fait créer des fiches d'essai dans TON Cadre.** Elles sont
> nommées `000-TEST-*` pour être reconnaissables, et la porte 1.5 te fait les
> supprimer. Ne les laisse pas traîner : elles polluent les menus.

---

## §1 · Les trois gardes — ce que tu déclenches volontairement

### 1.1 — Un second cours au même code `⚠ Données` `Cadre › Cours`

┌ POURQUOI ─────────────────────────────────────────────────────────────────┐
│ Décision #455, la tienne, du 19 août : « le devis ministériel ne change   │
│ pas d'un trimestre à l'autre ». Une seule fiche 601-101 sert toutes les   │
│ sessions. Cette garde existait déjà au formulaire ; elle vit maintenant   │
│ au POINT D'ÉCRITURE, donc elle protège aussi les chemins qui ne passent   │
│ pas par le formulaire.                                                    │
└───────────────────────────────────────────────────────────────────────────┘

| | Geste | Attendu |
|---|---|---|
| 1.1a | Cadre › Cours › **+ Nouveau**. Code `000-TEST-ZZ`, discipline au choix, **Créer** | La fiche est créée, sans question. |
| 1.1b | **+ Nouveau** à nouveau. Code `000-TEST-ZZ`, **Créer** | Un dialogue : « Une fiche « 000-TEST-ZZ » existe déjà… **Créer quand même une seconde fiche ?** » |
| 1.1c | Répondre **Annuler** | Rien n'est créé. Une seule `000-TEST-ZZ` dans le menu. |
| 1.1d | Refaire 1.1b, répondre **OK** | La seconde fiche EST créée. ⮕ **La garde avertit, elle n'interdit pas.** C'est voulu. |
| 1.1e | Supprimer la fiche en trop | — |

### 1.2 — Le trou de la casse `⚠ Données` `Cadre › Cours`

┌ POURQUOI ─────────────────────────────────────────────────────────────────┐
│ C'est le défaut que ce lot a trouvé en route, et qu'aucune porte          │
│ précédente ne pouvait voir : le formulaire normalisait la casse, l'import │
│ comparait brutalement. « 000-test-zz » n'était donc PAS un doublon de     │
│ « 000-TEST-ZZ » — refusé à la main, accepté par fichier.                  │
└───────────────────────────────────────────────────────────────────────────┘

| | Geste | Attendu |
|---|---|---|
| 1.2a | **+ Nouveau**, code `000-test-zz` (**minuscules**), **Créer** | Le **même dialogue qu'en 1.1b**. C'est LE point de cette porte : la casse ne fait pas l'identité. |
| 1.2b | Répondre **Annuler** | — |

### 1.3 — Modifier un code vers un code déjà pris `⚠ Données` `Cadre › Cours`

┌ POURQUOI ─────────────────────────────────────────────────────────────────┐
│ Quatrième trou, que l'audit n'avait pas listé : la création était gardée, │
│ l'ÉDITION ne l'était pas. Renommer une fiche pour lui donner le code      │
│ d'une autre fabriquait exactement le doublon que la création refusait.    │
└───────────────────────────────────────────────────────────────────────────┘

| | Geste | Attendu |
|---|---|---|
| 1.3a | Créer une seconde fiche, code `000-TEST-YY` | Créée sans question. |
| 1.3b | La sélectionner, **Modifier**, changer son code en `000-TEST-ZZ`, **Enregistrer** | Un dialogue : « … **Donner quand même ce code à cette fiche ?** » |
| 1.3c | Répondre **Annuler** | Le code reste `000-TEST-YY`. |
| 1.3d | Sélectionner `000-TEST-YY`, **Modifier**, changer seulement le NOM, **Enregistrer** | **Aucune question.** ⮕ La fiche ne se voit pas elle-même comme un doublon. Si elle pose la question ici, la garde est inutilisable au quotidien. |
| 1.3e | Supprimer les deux fiches d'essai | — |

### 1.4 — Deux profils au même courriel `⚠ Données` `Cadre › Enseignant·e`

┌ POURQUOI ─────────────────────────────────────────────────────────────────┐
│ La création manuelle ne vérifiait rien, alors que la migration du vieux   │
│ profil — trente lignes plus haut dans le même fichier — vérifiait, elle.  │
│ Deux chemins vers la même collection, un seul gardé.                      │
│ ⚠ L'identité est le COURRIEL, jamais le nom : deux homonymes existent.    │
└───────────────────────────────────────────────────────────────────────────┘

| | Geste | Attendu |
|---|---|---|
| 1.4a | Cadre › Enseignant·e › **+ Nouveau profil**. Prénom/nom au choix, courriel `essai@test.zz`, institution au choix, **Créer** | Créé, sans question. |
| 1.4b | **+ Nouveau profil**, un **autre nom**, même courriel `essai@test.zz` | Un dialogue nommant le profil en place : « Un profil utilise déjà « essai@test.zz » : … » |
| 1.4c | Répondre **Annuler** | Rien n'est créé. |
| 1.4d | **+ Nouveau profil**, le **MÊME nom et prénom** qu'en 1.4a, courriel **différent** (`essai2@test.zz`) | **Aucune question.** ⮕ Deux homonymes sont deux personnes. C'est la leçon #450 hors des bibliothèques : on ne bloque jamais sur un nom. |
| 1.4e | Supprimer les profils d'essai | — |

### 1.5 — Deux groupes-cours identiques `⚠ Données` `Cadre › Groupe-cours`

┌ POURQUOI ─────────────────────────────────────────────────────────────────┐
│ Le plus coûteux des trois, et le seul totalement silencieux. Le nom d'un  │
│ groupe-cours est ENGENDRÉ à partir du triplet (trimestre, cours, groupe) :│
│ deux jumeaux portent le MÊME libellé dans tous les menus. Rien ne les     │
│ distingue à l'œil, et les présences comme les évaluations se répartissent │
│ entre eux au hasard du clic — un demi-groupe dans chacun, sans erreur     │
│ nulle part.                                                               │
└───────────────────────────────────────────────────────────────────────────┘

| | Geste | Attendu |
|---|---|---|
| 1.5a | Cadre › Groupe-cours. Créer un GC avec un trimestre, un cours et un groupe **déjà utilisés ensemble** | Un dialogue nommant le GC en place, avec la raison : « Même trimestre, même cours, même groupe d'étudiants… » |
| 1.5b | Répondre **Annuler** | Rien n'est créé. |
| 1.5c | Refaire 1.5a en changeant **seulement l'enseignant** (ou l'horaire) | **La question revient quand même.** ⮕ C'est voulu : horaire et enseignant sont HORS du triplet. Les inclure désarmerait la garde exactement dans le cas de co-enseignement, où l'on veut être prévenu avant de dédoubler. |
| 1.5d | Répondre **OK** en 1.5c | Le second GC EST créé. Le co-enseignement reste possible. |
| 1.5e | Ouvrir un GC existant, **modifier son horaire**, **Enregistrer** | **Aucune question.** Un GC ne se voit pas lui-même. |
| 1.5f | Supprimer le GC d'essai | — |

---

## §2 · Les deux appareils

| | Geste | Attendu |
|---|---|---|
| 2.1 | Refaire **1.1b** sur **iPad** | Le dialogue s'affiche, il est lisible, ses deux boutons sont atteignables au doigt. |
| 2.2 | Sur iPad, vérifier que le dialogue **n'apparaît pas sous** un panneau du Cadre | Rien ne le recouvre. *(Le défaut d'empilement du 23 août touchait les modales de bibliothèque ; le Cadre n'en est pas une, mais on le mesure plutôt que de le supposer.)* |

---

## §3 · Décisions à rendre

| | Question | Ta réponse |
|---|---|---|
| 3.1 | **Avertir plutôt qu'interdire** — les trois gardes laissent passer sur confirmation, par cohérence avec ta décision #455. Est-ce le bon réglage pour les trois, ou veux-tu un **refus ferme** sur le groupe-cours (celui dont les conséquences sont les plus coûteuses) ? | |
| 3.2 | **Dialogue natif** (`confirm`) plutôt que la modale maison `uiDialogues`. Choisi pour coller à la garde #455 voisine et éviter la famille d'empilement corrigée le 23 août. À garder ? | |
| 3.3 | Le dialogue du groupe-cours **nomme** le jumeau. Est-ce suffisant pour décider, ou faut-il aussi l'horaire et l'enseignant du jumeau dans le message ? | |

---

## §4 · Ce qui n'est PAS dans ce lot

- La **fusion des 24 fonctions `dupliquer*`** (#476 volet 2, refactor pur).
- La **comparaison côte-à-côte** de #291 — tu l'as désignée prochain chantier.
- Le **nettoyage des doublons déjà en place** dans tes données. Ces gardes
  empêchent d'en créer de nouveaux ; elles ne touchent pas à l'existant.
