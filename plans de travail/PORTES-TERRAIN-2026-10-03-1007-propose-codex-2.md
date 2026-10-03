# Portes terrain – 3 octobre 2026 : le codex proposé sur les gestes qui restent (#1007, lot 2a-2)

> Écrit par Claude Code le 3 octobre 2026 (Toronto), sur la consigne de Cowork de 11 h 25.
> Version visée : **1.177.0**, build **1003-1128**. Cowork publie l'artefact jumeau (bouton « Copier mes résultats »).
> Ce qui échoue devient une ligne au `BACKLOG.md`, sous #1007, avec le numéro de la porte.

**Pourquoi une porte.** Le banc rejoue ces gestes dans un navigateur imité. Il ne voit pas l'enchaînement réel, à l'écran, de la fenêtre du codex et de la question de la séance. Ici, un raté effacerait les présences d'une séance sans que le codex proposé ait pu les sauver.

**Rien ne touche tes vraies données** : tout se fait dans une fenêtre de navigation privée de Chrome, sur le Mac, avec les données démo (un cours fictif). Pas d'iPad dans cette porte. Durée : environ cinq minutes.

**Deux gestes qui n'existaient pas en 1.176.0** : réinitialiser une séance déjà saisie (la fenêtre paraît) ; réinitialiser une séance jamais saisie (aucune fenêtre, puisque rien n'est effacé).

---

## §0 · Préalable

| # | Geste | Attendu |
|---|---|---|
| 0.1 | Dans Chrome sur le Mac, ouvre une **fenêtre de navigation privée** (Cmd+Maj+N), et seulement elle. | Une fenêtre sombre « Navigation privée ». |
| 0.2 | Va à `https://app.codexnumeris.org` et lis le numéro en bas de page. | **1.177.0**. Sinon, recharge ; s'il reste plus bas, arrête-toi : la porte jugerait l'ancienne version. |
| 0.3 | À l'accueil, coche la case **« Données démo »** (« Cours fictif déjà configuré »). Si une question paraît, accepte-la. | Un bandeau vert « Mode démonstration » en bas de l'écran. Le trimestre, le groupe, les élèves et l'horaire sont ceux de la démo : rien à créer. |
| 0.4 | Va à **Suivi › Saisie des présences**. | Le tableau des élèves, avec « Date du cours » et les boutons « ← Précédent » et « Suivant → ». |

## §1 · Une séance déjà saisie : la fenêtre, puis « Annuler »

**Pourquoi.** Réinitialiser une séance déjà saisie efface ses présences et ses notes. Avant 1.177.0, seule la question « Réinitialiser la séance » le disait ; désormais, le codex est proposé avant.

| # | Geste | Attendu |
|---|---|---|
| 1.1 | Avec « ← Précédent », recule jusqu'à une séance dont la barre dit **« Séance non saisie »**. | Le témoin « Séance non saisie » à côté du bouton « Confirmer la séance ». |
| 1.2 | Pour le premier élève de la liste, mets **0** dans sa case de périodes, puis clique ailleurs. | La case devient rouge (absent). |
| 1.3 | Clique « Suivant → », puis « ← Précédent » pour revenir à la même séance. | La barre dit **« Séance saisie »** ; le premier élève est toujours à 0. |
| 1.4 | Clique **« Tous … pér. »** (en tête de la colonne « Présence »). | Tout le monde présent, le premier élève compris. |
| 1.5 | Clique le petit bouton **↻** (« Réinitialiser (tous absents) »), sous « Tous … pér. ». | Une fenêtre titrée **« Écrire un codex avant de supprimer ? »**, **avant** la question « Réinitialiser la séance ». |
| 1.6 | Lis le texte. | « Réinitialiser cette séance efface pour de bon ses présences et ses notes. Ton codex à jour pourra te les rendre, jusqu'à ta mise à jour suivante. » |
| 1.7 | Clique **« Annuler »**. | La fenêtre se ferme ; **aucune autre question**. Tout le monde est toujours présent. |
| 1.8 | Refais ↻, puis clique **« Supprimer sans codex »**. | La question habituelle, **« Mettre tout le monde absent et vider les notes de cette séance ? »**. Clique « Réinitialiser » : tout le monde passe à 0 (absent). |

## §2 · Une séance jamais saisie : aucune fenêtre

**Pourquoi.** Sur une séance que rien n'a encore enregistrée, il n'y a rien à effacer : ni fenêtre du codex, ni question.

| # | Geste | Attendu |
|---|---|---|
| 2.1 | Avec « ← Précédent » ou « Suivant → », va à une autre séance dont la barre dit **« Séance non saisie »**. | Le témoin « Séance non saisie ». |
| 2.2 | Clique ↻. | **Aucune fenêtre, aucune question** : tout le monde passe à 0 tout de suite, comme avant 1.177.0. |

## §3 · Décisions

Aucune : les mots ont été acceptés le 3 octobre à 11 h 25.

## §4 · Ce que je n'ai pas pu vérifier

- **Le registre longitudinal** : pas de rangée. Le registre ne répertorie pas le trimestre démo (il l'écarte exprès), et un espace neuf n'a pas d'autre trimestre où inscrire un·e élève sans tout créer à la main. Le geste est jugé au banc sur le vrai bouton (`registre-longitudinal-915.spec.js`, R4) : la fenêtre, puis « Annuler » sans question, puis la question d'avant, mot pour mot.
- **Les autres gestes** (fusion de copies, pages retirées, copie importée, jetons de reprise, « Remplacer celle qui porte déjà ce nom », « Effacer tout », résultats du bilan réflexif) passent par la même fenêtre. Ils sont couverts par la sentinelle et les bancs, pas par cette porte (il leur faudrait des copies, un PDF de plusieurs pages ou un jeton).
- **Pages retirées d'une copie** : jamais éprouvé au navigateur, même au banc.
- **Chemins d'écran vérifiés dans le code** : la case « Données démo » de l'accueil (`js/accueil.js`) ; l'onglet « Suivi » et la sous-section « Saisie des présences » (`index.html`, `js/config.js`) ; « ← Précédent », « Suivant → », « Confirmer la séance » ; le témoin « Séance non saisie » / « Séance saisie » ; « Tous … pér. » et ↻ (`js/saisie-presences.js`).
- **Supposé** : une absence (1.2), une fois quittée la séance, l'enregistre en base. C'est ce que juge le banc des présences (« une absence puis Suivant : en base »). Si la barre dit encore « Séance non saisie » en 1.3, clique « Confirmer la séance » à la place : la séance est alors enregistrée, et peut-être verrouillée ; si ↻ est grisé, note-le, ce n'est pas un échec du lot.
- **Supposé** : la démo a au moins deux séances passées jamais saisies (1.1 et 2.1) ; le banc en trouve.
