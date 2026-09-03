# Consigne du jour — « décloner » : un seul mot, et le geste là où on le cherche

> **Écrite le 3 septembre 2026 à 6 h 45 (heure de Grégoire), par Cowork, avec lui.**
> **Application au moment de l'écriture : `1.112.0`, build `0903-0642`.**
> Elle remplace la consigne de l'échelle, exécutée et livrée (`16833e74`, `e028695b`).
>
> ▣ **Grégoire est éveillé** et regardera l'écran dès que tu diras que c'est prêt.
>
> ⚠ **REMESURE TOUT** (règle 1). Les lignes citées ont été relevées par Cowork en lecture
> seule ; elles bougent souvent dans ce fichier.
>
> ⛔ **Petit lot. Il n'empêche aucun des huit énoncés.** Si tu le trouves en train de
> grossir, arrête-toi et dis-le : c'est le signe que tu as glissé dans le chantier voisin
> (voir la fin).

---

## Le mandat — décision de Grégoire, 3 septembre au matin

**Deux choses, et elles vont ensemble.**

### 1. Le geste s'appelle « Décloner »

▣ **Ses mots** : *« L'idée est de rendre réversible le clonage d'un item. Il serait plus
approprié de parler de déclonage, plutôt que de prolonger la métaphore génétique ou
généalogique et parler de famille. »*

⮕ **« Détacher de sa famille de clones » devient « Décloner ».** Le mot « famille » quitte
les textes que l'utilisateur lit *pour ce geste*.
⚠ **Témoin du besoin** : `grep -rni "déclon" js/ index.html` rend **0** aujourd'hui.
Grégoire a cherché « décloner » dans sa propre application et n'a rien trouvé — **c'est
l'incident qui a ouvert ce chantier.**

⛔ **LE RISQUE DU MOT, ET IL EST À TRAITER DANS LE TEXTE.** « Décloner » peut se lire
« supprimer le clone ». **Le geste ne détruit rien** : il rend le bloc indépendant, contenu
intact. ⮕ **Ce qui accompagne le bouton doit dire ce qui NE se passe pas.** Le texte actuel
le dit déjà bien (« Son contenu est inchangé ») : **garde cette qualité, ne la perds pas en
raccourcissant.**

### 2. Le geste s'ajoute à l'Inspecteur, sans quitter le menu Actions

▣ **Le manque, mesuré le 2 septembre** : l'Inspecteur **annonce** la famille de clones
(`planif-panneau-clone-info`, `js/planification-carte.js:3002` — « 🧬 N instances · Voir les
autres ») et **n'offre pas d'en sortir**. Celui qui voit la famille là cherche la sortie là.

⮕ **Ajoute le bouton dans l'Inspecteur**, dans ce bloc, visible **seulement** quand le nœud
porte un `cloneSourceId` ou qu'il a des clones (la condition existe :
`doitAfficherIndicateurClone`).

⛔ **NE RETIRE PAS celui du menu Actions.** ▣ **Motif mesuré** : `detacherDeLaFamille`
(`js/planification-carte.js:3628`) prend **une liste de nœuds**, et le bouton du menu sert la
**multisélection**, que l'Inspecteur ne couvre pas. Le retirer supprimerait le déclonage en
lot. **Grégoire avait demandé le retrait, puis l'a annulé quand la mesure a été faite.**

⛔ **NE DUPLIQUE PAS LA LOGIQUE.** Même `detacherDeLaFamille`, même message après le geste,
même point d'annulation. **Deux appels d'une fonction, pas deux fonctions.**

---

## Les endroits visibles — mesurés, à rejouer

| où | ce qu'il dit aujourd'hui |
|---|---|
| `index.html:4184` | le bouton du menu Actions : **« Détacher de sa famille de clones »** |
| `js/accompagnement-contenu-hover.js:645` | son infobulle (`planif-detacher-clone`) : « Libère le bloc sélectionné de **sa famille de clones**… » |
| `js/planification-carte.js:8725` | le refus : « **Rien à détacher** : aucun des blocs sélectionnés n'appartient à une **famille de clones**. » |
| `js/planification-carte.js:8729-8730` | le succès : « Bloc **détaché** — il ne suivra plus son original… » / « N blocs **détachés** — … » |
| `js/accompagnement-contenu-popup.js:888` | l'aide copie/clone : « Pour libérer un clone déjà créé : *Actions ▸ Détacher de sa famille de clones* » |
| `index.html:11684` | l'aide longue : « **Détacher un clone** : sélectionne le bloc, puis **Actions ▸ Détacher de sa famille de clones**… » |

⚠ **Les deux dernières nomment le CHEMIN vers le bouton.** Si l'Inspecteur l'offre aussi,
**elles doivent le dire** — sinon on reproduit le défaut d'origine : une aide qui envoie à un
seul endroit alors qu'il y en a deux.

⛔ **`js/changelog-data.js:390` NE SE RÉÉCRIT PAS.** C'est une annonce déjà lue (16 août). ⮕
**L'annonce NEUVE, elle, dira le renommage** et devra donc nommer l'ancien mot une fois.

⚠ **« famille » rend 360 occurrences dans tout le dépôt** : la plupart n'ont rien à voir avec
les clones. **Ne fais pas un remplacement global.** Le périmètre est le tableau ci-dessus,
remesuré.

---

## Fini quand

**Grégoire cherche « décloner » là où il a vu la famille, et il le trouve.**

▣ **Le témoin** : `grep -rni "déclon" js/ index.html` rend un compte non nul, et
`grep -rni "famille de clones" js/ index.html` ne rend plus que l'annonce de changelog du
16 août.
▣ **Le témoin négatif, qui compte autant** : le bouton du menu Actions **fonctionne toujours
sur une multisélection**, et le déclonage en lot n'a pas régressé. Cite l'essai qui le montre.
▣ **Le témoin de non-duplication** : `grep -n "detacherDeLaFamille" js/` montre **une seule
définition** et deux appels.

---

## L'ordre

1. **Rapporte le verdict de GitHub sur la release `1.112.0`** (rituel d'ouverture, §2.1).
2. **Remesure les six endroits** du tableau avant de toucher au premier.
3. Ce lot touche `js/` ⮕ **bump du bloc de jetons d'`index.html`**.
4. `cd tests && npm run test:unit` pour travailler ; **`npm test` complet avant de dire que
   c'est prêt.** ⚠ Vitest se lance **depuis `tests/`**.
5. ⛔ **Tu commites, puis tu t'arrêtes.** Pas de release, pas de push, pas de verdict au
   jeton : Grégoire regarde l'écran d'abord.
6. **Ce fichier se commite avec ton lot.** Nomme tes fichiers ; pas de `git add -A`.

⮕ **CE QUE GRÉGOIRE DOIT ALLER VOIR** : ouvrir sa carte d'alignement, sélectionner un bloc
marqué 🧬, ouvrir l'**Inspecteur**, et y trouver « Décloner » à côté de l'annonce des
instances. ⚠ **Qu'il ne clique pas.** Le voir suffit.

---

## ⛔ CE QUI N'EST PAS DANS CE LOT — et c'est ce qui le ferait grossir

**L'Inspecteur qui décrit une SÉLECTION plutôt qu'un bloc.** Idée de Grégoire du 3 septembre,
cadrée dans `plans de travail/CADRAGE-2026-09-03-inspecteur-selection-multiple.md`.

⛔ **Ne l'entame pas.** Elle refond l'Inspecteur, et elle porte un piège nommé dans le cadrage :
un champ qui écrit une valeur commune sur toute la sélection détruit en silence ce qui
différait. **Ce lot-ci ajoute un bouton ; il ne change pas ce que l'Inspecteur est.**
