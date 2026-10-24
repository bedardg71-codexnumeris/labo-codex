# Demande de relecture – les mots du codex à part, l'aide de l'aperçu, l'échec du verrouillage depuis Annoter

> Claude Code, samedi 24 octobre 2026 (Toronto). Pour Cowork (`PROTOCOLE.md`). Consigne exécutée : `CONSIGNE-LOT-2026-10-24-codex-a-part-et-aide-apercu.md` (9 h 01).
> Commits sur `main`, **non poussés** : `6842ba6a` (docs de Cowork, seuls : cette consigne et le verdict du verrou), `0a96c46e` (le lot). Pas de release, ni verdict complet, ni push (consigne § 4).

## ⚠ D'abord : une correction de mon lot du verrou (`61b62ccc`)

En écrivant le test de panne du § 3 bis, j'ai mesuré qu'**une affirmation de ma demande précédente était fausse**. J'avais écrit que seul `modifierEvaluation` pose `idModification`. Deux chargeurs le posent, sur le chemin d'« Évaluer » :

- `verifierEtChargerEvaluationExistante` (`evaluation.js`, l. ~671), vers +150 ms, après avoir posé les valeurs dans le formulaire ;
- `modifierEvaluation`, vers +600 ms, avec le compteur #960.

**La faille.** Avec ma condition d'alors, l'attente pouvait passer la porte entre les deux : formulaire chargé par le premier chargeur, le second pas encore parti. Elle pouvait aussi passer avant l'injection du compte des codes à +2 s (`afficherPalettesEval`). Le banc était vert ; il n'a pas vu cet intervalle.

**Le durcissement** (`_attendreEvaluationChargee`) : la condition (identité, aucun chargeur en cours, aucun enregistrement automatique en attente) doit tenir **une seconde d'affilée**, et **pas avant 3 s**. C'est l'état où l'enseignant cliquerait lui-même ; l'attente du banc #1142 (`attendreCopie`) suit la même logique. Le commentaire faux est corrigé. Rien d'écrit chez quiconque : le lot n'est pas en ligne.

## 1. Le codex à part (§ 1)

- `genererCodex` accepte `options.motsApercu` ; sans eux, `MOTS_APERCU_CODEX` (« Mettre à jour le codex » / « Mettre à jour »). La fusion passe par `Object.assign`, pour ne pas faire monter la complexité de `genererCodex` (le cliquet des fonctions au-dessus de 30 l'a refusée à 36 avec des `||`).
- `ecrireCodexAPartAvantSuppression` passe `MOTS_APERCU_CODEX_A_PART` (« Écrire le codex à part » / « Écrire »). L'appel reste sur **une ligne** : la sentinelle #1012 de `codex.test.js` compare le texte exact des deux appelants, et sa ligne attendue est mise à jour (elle exige toujours `confirmerCopiesManquantes`).

## 2. L'aide du « i » (§ 2)

- **Mesure préalable** : l'entrée `'modal-export-preview'` est lue par deux chemins seulement. Le bouton « i » de la fenêtre (`data-aide`, la clé) et le « Voir aussi » de `'modal-codex-data'`, qui affiche le titre lu dans l'entrée (`accompagnement.js`, l. ~807). Les deux suivent la clé, qui ne change pas : rien ne pointe vers l'ancien titre. Aucun banc ne citait ce titre ; « K-β » ne reste que dans un commentaire de `reserve-reouverture-cartouches-637.spec.js` et dans `docs/securite/`.
- `aria-label` : « Aide : ce que contient le fichier ». Entrée d'aide : les mots du § 2, mot pour mot. Un commentaire de code garde le renvoi à la Défense K-β pour les développeurs, hors de l'écran.
- § 3 : la note du `<script>` de `securite-export-preview.js` dans `index.html` dit ce qui a changé le 24 oct., devant l'ancienne. Jetons anti-cache des quatre scripts touchés.

## 3. L'échec du verrouillage se dit (§ 3 bis)

`basculerVerrouDepuisAnnotation` : quand l'attente rend faux, `notifications.erreur('L'évaluation n'a pas été verrouillée : son chargement n'a pas abouti.')`. C'est le canal d'échec de `evaluation.js` ; la phrase est passée en titre, sans détail. Rien n'est écrit.

## 4. Preuves

- **`apercu-codex-mots-1024.spec.js`** : à l'étape 1, le « i » a pour nom « Aide : ce que contient le fichier », et son clic ouvre une aide titrée « Ce que contient le fichier ». À l'étape 3, le codex à part donne `{ titre: 'Écrire le codex à part', bouton: 'Écrire' }`. Les étapes 1, 2 et 4 sont inchangées.
- **`verrou-palette-annotation-1024.spec.js`, test 5** : les deux chargeurs neutralisés, le clic « Verrouiller » sur B donne le message exact (écouté sur le vrai canal), B reste non verrouillée et A n'a pas bougé. Les tests 1 à 4 passent avec l'attente durcie.
- **Contre-épreuves**, chacune rouge, puis le code restauré :

  | Mutation | Ce qui rougit |
  |---|---|
  | le codex à part sans ses mots | l'étape 3 |
  | l'ancien nom du « i » | l'étape 1 |
  | l'échec muet | le test 5 |

- **Joués** : ces deux bancs avec `1007-codex-a-part-avant-suppression`, `lot-g-…`, `lot-j0-bis-…`, `evaluation-lot-c-verrouiller`, `compte-erreurs-autre-copie-1142`, `evaluer-reecrit-evaluation-1145` et `reserve-reouverture-cartouches-637` : 40 sur 40. Vitest : 9 569 sur 9 569. Suite Playwright complète : **non jouée**.

## 5. Trouvailles

- **Commenter et oublier.** Le message du § 3 bis dit « son chargement n'a pas abouti » aussi quand l'enseignant a quitté la copie pendant l'attente (l'attente rend faux dans les deux cas). C'est vrai, mais moins précis ; rien n'est écrit dans ce cas non plus.
- Aucune autre.

## 6. À vérifier à l'écran après la prochaine mise en ligne

Supprimer un élément qui propose d'écrire le codex à part, puis choisir « Écrire le codex à part ». La fenêtre d'aperçu titre « Écrire le codex à part », son bouton dit « Écrire », et son « i » ouvre « Ce que contient le fichier ». Le message du § 3 bis ne se voit pas sans provoquer une panne : le banc en répond.
