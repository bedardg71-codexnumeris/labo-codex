# Rapport — lot `descripteurs-grille` (18 nov. 2026)

**Dernier relais.** Branche `lot/descripteurs-grille`, partie de `origin/main` à `03dc7d2f`. Fait : les
descripteurs de niveau s'écrivent dans l'éditeur de Conception › Grilles, pour tout critère par niveaux.
APERÇU seulement (PR « ne pas fusionner ») : ni fusion, ni release, ni Nouvelles. Reste : le regard de
Grégoire sur l'aperçu Netlify et sur les mots ; le second lot (grille d'autoévaluation) n'est pas commencé.

## Ce qui change

- **Quels critères.** Holistique et algorithmique (ce dernier rend un niveau de l'échelle par son
  pourcentage). Un critère en points (analytique) garde son barème tel quel ; les textes qu'il porte déjà,
  liés à une échelle (assistant d'avant #1125), se montrent comme avant, sans case vide ni menu.
- **D'où viennent les niveaux** (la grille n'a pas d'échelle à elle) : 1. `descripteurs.echelleId` du
  critère ; 2. sinon celle d'un autre critère de la même grille ; 3. sinon la première échelle du trimestre.
  Un menu « Niveaux de l’échelle » quand le trimestre en a plusieurs. Ce qui s'affiche est ce qui s'écrit :
  le premier texte, ou le menu changé, pose l'échelle montrée dans `descripteurs.echelleId`. Aucune
  écriture sans geste.
- **Forme du stockage inchangée** : `{ echelleId, parNiveau: { code: texte ≤ 5 000 } }`. Un descripteur
  écrit ici porte toujours son échelle : il ne peut pas être relu comme un barème si le critère devient
  analytique (`bareme.estAncien`).
- **Aucune donnée effacée.** Une case vidée retire sa clé seule. Changer d'échelle ne touche aucun texte :
  ceux dont le niveau n'existe pas dans l'échelle montrée restent écrits, se montrent sous « Textes gardés
  d’une autre échelle », par leur code, modifiables, et reprennent leur place au retour. ⚠ Les textes suivent
  le CODE du niveau : passer d'une échelle à une autre qui partage un code (deux variantes d'IDME) montre le
  texte sous le niveau de même code.
- **En création** (grille neuve) comme en modification : le geste passe par la file commune
  `_modifierCritereCible`. Retirés : `rendreAttenduNiveaux`, `mentionEchelleReponses`,
  `_modifierReponsesCritere`, `modifierTexteReponseGrilleHandler`, `reponseTexteModifie`, `REFUS_REPONSES`
  (le geste du lot 13, qui ne modifiait qu'un texte existant, et seulement dans une grille enregistrée).
- **iPad** : la case s'agrandit avec son texte (`data-hauteur-auto`) ; 16 px et 44 px au doigt.

## Mots proposés (partis tels quels, corrigeables : `TEXTES_DESCRIPTEURS`, `js/grilles.js`)

- « Niveaux de l’échelle » (menu) ; « Niveaux de l’échelle « X ». » (une seule échelle)
- « Facultatif » (dans chaque case vide) ; étiquette d'accessibilité « Ce qui est attendu au niveau X »
- « Aucune échelle dans ce trimestre : crée-en une dans Conception → Échelles de performance pour décrire ses niveaux. »
- « Textes gardés d’une autre échelle » ; « Leur niveau n’existe pas dans l’échelle « X ». Ils restent gardés
  et reprennent leur place si tu reviens à leur échelle ; vide une case pour retirer son texte. »
- « Échelle introuvable » ; « L’échelle de ces textes n’est plus dans ce trimestre. Choisis-en une : les
  textes dont le niveau y existe reprendront leur place. »
- Refus : « Un texte de niveau fait 5 000 caractères au plus » (remplace « Une réponse fait… »).

## Tests

- **Vitest** `tests/unit/descripteurs-niveaux-grille.test.js`, 23 essais (S stockage, E d'où viennent les
  niveaux, G gestes, A critère en points, X sécurité). Suite complète : 932 fichiers, 11 911 essais, verts.
- **Break-tests** (18 nov., code restauré après chacun) : B1 vider emporte toutes les clés → S.b, G.b rouges ;
  B2 changer d'échelle vide `parNiveau` → S.c, G.c, G.i ; B3 un descripteur neuf sans son échelle → 9 rouges
  (S.a, S.d, S.e, G.a à G.f) ; B4 seuls les niveaux écrits ont leur case → 8 rouges (G) ; B5 le nom d'un niveau
  non échappé → X.a ; B6 le geste accepte un analytique sans échelle → A.a.
- **Playwright** `tests/integration/descripteurs-niveaux-grille.spec.js`, Chromium (`playwright.chromium.config.js`),
  iPad 1 180 × 820 et 820 × 1 180 : vert. Break-tests : texte non relu au rendu → rouge (l. 108) ; changer
  d'échelle vide les textes → rouge (l. 127). ⚠ Chromium n'est pas Safari : pas de verdict WebKit ici.
- **Bancs ajustés** (comportement changé par le mandat, chaque ligne marquée ↻ 18 nov.) : `materiel-lot3b1-visible`,
  `bareme-1-editeur` (H porté sur le nouveau geste), `bareme-grille-neuve-1120`, `sentinelle-sous-criteres-editables`,
  `grilles-sous-criteres-condense.spec.js` ; cliquets `sentinelle-522` 19 → 18 (une écriture de moins) et
  `sentinelle-467` 120 → 123 (trois fragments construits, justifiés dans le fichier).
- **Préexistant, hors lot** (mesuré sur un worktree de `origin/main`, Chromium) : `grilles-sous-criteres-condense`
  « créer le premier… » rouge (l. 86 sur `main`) ; `bareme-grille-neuve-1120` « Fermer » intermittent quand le
  fichier passe entier (1 et 2 rouges sur `main`). Disposition : signalés ici, non inscrits (aucun symptôme vécu).

## Captures

`plans de travail/captures-2026-11-18-descripteurs-grille/` : création, rechargée, autre échelle ; 1 180 × 820
et 820 × 1 180 ; sombre et clair (Chromium).
