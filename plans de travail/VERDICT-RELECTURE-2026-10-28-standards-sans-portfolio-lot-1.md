# Verdict – Des standards sans portfolio, lot 1 (`03cdf8a7`)

> Cowork, mercredi 28 octobre 2026, 21 h 30 (Toronto). Relu : le rapport de Claude Code relayé par Grégoire (21 h 28) ; le diff de `03cdf8a7` (`js/`, `index.html`) ; `_selectionnerArtefactsHybride` (`js/profil-etudiant-actions.js`) ; la sentinelle (en-tête, cas B). Pas relancé par Cowork.

## Verdict : accepté, avec une retouche (deux points tranchés par Cowork, un qui attend Grégoire)

Conforme :
- **L'invariant** : la branche « Artefact » est intacte ; `poolStdFaitDArtefacts` est la seule condition, pour le calcul et pour les mots (Q1, Q2). GREG-0 à GREG-2 à 84,8.
- **Les deux phrases** (mot neuf 2) au caractère près, leurs deux variantes, la terminale seule en premier ; une seule source (`causeNoteStdSansProductionNotee`, registre), lue par `erreur` et par `expliquerNoteNonConstructible`. La route de `pratique-configurable.js` suffit : `PratiquePanStandards` n'a plus aucun usage dans `js/` (grep), une pratique Standards est une `PratiqueConfigurable`.
- **La formule** (mot neuf 1) : jamais « terminale × 0 % ».
- **Le doublon** : séparé au récit ; la tuile ne dit plus « remplacée par une reprise » d'un doublon ni d'une originale qui compte, et n'écrit rien à la place.
- Le panneau des habiletés, la complexité inscrite, les deux chemins sans cause inscrits (#1178) : conformes.

## La retouche

**R1 (décision de Cowork) – Une catégorie ne compte qu'en hybride.** Retire de `obtenirArtefactsIdsPoolStd` la restriction aux productions qui portent une `categorie` : sans « Artefact », le pool est fait de toutes les productions hors conteneur et terminale. Motifs : hors hybride, aucun écran ne pose de catégorie avant le lot 4, une catégorie y est un reste (le cas mesuré : l'hybride retiré) ; la branche « Artefact » l'ignore déjà hors hybride (GREG-2) ; en hybride, `_selectionnerArtefactsHybride` ne lit que les productions cochées, la restriction n'y change rien. Attendu : le cas du banc revient de 70 à 77 ; CHIM-3 reste 80,63 ; break-test. Rends vrais le commentaire de la fonction et l'en-tête du bloc (`pratique-registre.js:777-780`). La désignation hors hybride reste au lot 4. C'était une erreur du plan, acceptée par Cowork à sa relecture.

**R2 (décision de Cowork) – Une cause propre à l'étudiant·e n'est pas une erreur de configuration.** Quand `causeNoteAbsente` est posée, le profil garde la carte qu'il montrait avant pour cet·te étudiant·e (son titre d'aujourd'hui), sans note, et la phrase à la place du nombre. Ni l'alerte « Note finale non calculable », ni le bouton « Réglages de la pratique », ni son infobulle : ils restent pour une erreur de configuration (`profil-etudiant-sections-affichage.js:2842-2853`). Aucun mot neuf. Essai Playwright : CHIM-6 et GREG-3 montrent la carte et la phrase, aucun bouton ; une erreur de configuration garde l'alerte.

**R3 (Grégoire, 21 h 31) – Le libellé du doublon**, que l'élève lit : « en double · comptée une seule fois », au récit Standards et au récit sommatif (DECISIONS, mot neuf 3).

## Clôture

Consigne de la retouche : `CONSIGNE-LOT-2026-10-28-standards-sans-portfolio-lot-1-retouche.md` (21 h 32). D'ici là, rien ne part : ni release, ni verdict, ni push.

## Pour les lots 4 et 5 (notes de Cowork, 28 oct., 21 h 35)

- **Lot 4** : le plan y écrit `categorie: 'selection'` hors hybride. Après R1, une catégorie ne compte qu'en hybride : la consigne du lot 4 dira comment la pratique lit sa désignation hors hybride (une désignation propre à la pratique, ou la catégorie lue seulement quand la pratique le dit), sans réveiller les catégories restées.
- **Lot 5** (l'assistant) : Q1 fait suivre les mots à la présence d'un « Artefact », mais à la création d'une pratique, les productions n'existent souvent pas encore ; l'assistant ne peut pas savoir lequel des deux vocabulaires s'applique. À soumettre à Grégoire au moment du lot 5, pas avant.
- **Lot 5, vocabulaire** (Grégoire, 21 h 35) : le « Mode expert » n'est pas un écran ; c'est l'interface à laquelle un utilisateur arrive en activant des options. Dans les consignes, dire « les réglages de la pratique » (le formulaire hors assistant, `index.html:5830-5861`), jamais « Mode expert ». Texte d'écran à corriger au lot 5 : l'aide de l'option « Hybride » de l'assistant dit « Configuration détaillée en Mode Expert. » (`wizard-pratique-v2.js:653`), un nom qui n'existe nulle part à l'écran. Sans lien : la préférence nommée `modeExpert` dans le code n'est que « Ouvrir directement sur le tableau de bord » (Préférences › Navigation).
