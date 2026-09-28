# Portes terrain – lot E2 (1.166.0) : dans le Cadre, ce qui existe s'enregistre tout seul

> Écrite le 28 septembre 2026 par Claude Code. **Artefact jumeau : à publier par Cowork** (bouton « Copier mes résultats »).
> ✅ **Poussée le 28 sept.** : `e4149cb1` publié sur `https://app.codexnumeris.org` à 16 h 15 (Netlify, déploiement « ready »). Verdict WebKit complet : aucune rougeur nouvelle.
> Sur tes données réelles, sans rien créer de fictif : chaque geste qui modifie a sa rangée de retour.
> Ce qui échoue devient une fiche au BACKLOG, pas une note mentale.

## §0 · Préalable

- [ ] Sur l'iPad, ouvre `https://app.codexnumeris.org`, recharge, et lis le numéro en bas de page.
      ⮕ Attendu : **1.166.0**. Sinon, s'arrêter là : le lot n'est pas encore en ligne. `iPad`
- [ ] Fais une sauvegarde Codex avant le §1 : la porte modifie la fiche d'un·e de tes étudiant·es, puis la remet comme avant.

## §1 · ⚠⚠ Données — la fiche d'un·e étudiant·e, au doigt

> **POURQUOI** — Avant 1.166.0, une fiche d'étudiant·e ne s'enregistrait qu'au bouton « Enregistrer ». Maintenant, chaque champ s'enregistre tout seul **quand tu le quittes**. Sur le Mac, les tests le prouvent. Sur l'iPad, toucher directement une autre fiche ne quitte pas toujours le champ : si c'est le cas ici, ce que tu viens de taper serait perdu sans rien dire. Et le DA ne doit plus pouvoir changer : un DA changé laissait les évaluations et les présences sous l'ancien.

- [ ] Dans Cadre › Groupe d'étudiant·es, ouvre la fiche d'un·e de tes étudiant·es (menu « Action » de sa rangée, « Modifier »).
      ⮕ Attendu : la fiche s'ouvre ; sous le DA, la phrase « Le DA ne se modifie pas ici : il relie les évaluations et les présences de l'étudiant·e. » `iPad`
- [ ] Touche le champ DA et essaie d'effacer un chiffre.
      ⮕ Attendu : le DA ne change pas. `iPad`
- [ ] Touche la fin du champ « Programme » et ajoute « (essai) ».
      ⮕ Attendu : le programme se termine par « (essai) ». Rien d'autre ne se passe encore. `iPad` `⚠⚠ Données`
- [ ] Sans toucher ailleurs, ouvre **directement la fiche d'un·e autre étudiant·e** (menu « Action » de sa rangée, « Modifier »).
      ⮕ Attendu : l'autre fiche s'ouvre, avec son propre programme (pas celui que tu viens de taper). `iPad`
- [ ] Rouvre la première fiche.
      ⮕ Attendu : son programme se termine toujours par « (essai) », et son DA est celui d'avant. Avant 1.166.0, le programme serait revenu à l'ancien. `iPad` `⚠⚠ Données`
- [ ] Retire « (essai) », puis ouvre une autre fiche, puis reviens sur la première.
      ⮕ Attendu : le programme est revenu à celui d'origine. C'est le ménage de la porte. `iPad` `⚠⚠ Données`

## §2 · Interface

Rien. Ces gestes sont tenus par le banc WebKit `lot-e2-cadre-creer-ou-modifier.spec.js` (9 essais, sur le pack démo) et les bancs voisins :
- le trimestre, le profil, un cours, un horaire, un groupe-cours et une fiche d'étudiant·e existants s'écrivent sans bouton, et le témoin le dit ;
- un nouveau n'existe pas avant son bouton (« Créer le cours », « Ajouter l'étudiant·e »…) ;
- « Fermer » pose la question pendant une création, « Rester » ne perd rien, « Quitter sans… » n'écrit rien ;
- le DA d'une fiche existante ne change ni au clavier ni par le formulaire ;
- un échec d'écriture est dit par le témoin, sans message de réussite ;
- une nouvelle ligne de séance d'un horaire ne reprend pas l'heure de la précédente ;
- « Fermer » et « Créer le cours » restent dans l'écran à 360, 768, 1024 et 1180 px.

## §3 · Décisions

Aucune : tes décisions du 28 sept. (le DA, les mots, les Nouvelles) sont posées telles quelles.

## §4 · Ce que je n'ai pas pu vérifier

- **L'avertissement au rechargement sur l'iPad.** Le banc prouve que l'application retient la page quand un ajout est en cours. Safari sur iPad ignore souvent cette demande : recharger ou fermer l'onglet peut perdre une saisie neuve sans question. Sur l'iPad, seul « Fermer » pose la question à coup sûr (même limite qu'en 1.164.0).
- **Les autres champs du Cadre au doigt** (trimestre, profil, cours, horaire, groupe-cours) : même mécanisme que le programme de la fiche (le champ s'enregistre quand on le quitte), éprouvé au banc sur le Mac seulement. Si le §1 échoue, ils sont à regarder aussi. Le trimestre n'est pas dans la porte à dessein : changer sa session ou son année touche où ses données sont rangées (les gardes refusent tout changement dès qu'il a des données).
- **Session et année d'un trimestre vide** : changer la session garde l'année ; passer de a2026 à h2027 écrit h2026, puis h2027. Si h2026 existe, le changement est refusé : changer l'année d'abord. Sans perte ; gardé (décision de Cowork).
- **Corriger une coquille de DA** n'est plus possible à la fiche : il faut supprimer et rajouter l'étudiant·e, ce qui détache ses données. Inscrit en #976.
- **Erreurs de la session** : deux essais de la relecture (horaire, groupe-cours) ne voyaient pas la copie de la collection, parce que le banc la copiait déjà lui-même ; corrigés (R1). La première version de l'essai clavier du DA utilisait la touche retour arrière, que le navigateur de test lit comme « page précédente » ; retirée.
