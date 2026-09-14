# Portes terrain — #478, le parcours de rentrée (13 septembre 2026)

> Lot : **#478 (b) et (c)**, branche `claude/478-parcours-rentree`. **Ni poussé, ni releasé** : la release attend le verdict de cette porte (consigne `CONSIGNE-LOT-478-parcours-de-rentree.md`, § 6).
> Pourquoi une porte : la communauté de pratique ouvre l'application le **mardi 15 septembre** et fera exactement ce parcours, sur des postes vierges. Les tests jouent le parcours dans WebKit sans tête ; ce qu'ils ne voient pas : les vraies boîtes de dialogue de Safari, et si le message se LIT avant de disparaître.
> **Ce qui échoue devient une ligne de BACKLOG sous #478**, pas une note mentale.
> Livrables jumeaux : ce markdown (la trace, écrit par Claude Code) ; l'artefact à cases avec « Copier mes résultats » est publié par Cowork.

## § 0 · Préalable

**0.1** Dans **Safari**, ouvre l'adresse que Claude Code t'a donnée pour ce lot (une copie locale, `http://localhost:8766`). ⮕ *Attendu :* l'application s'ouvre **vide** — aucun trimestre, aucun cours. C'est voulu : une adresse neuve est un poste vierge. **Tes données réelles ne sont pas touchées** : elles vivent sur `app.codexnumeris.org`, qui n'a pas encore ce lot.
S'il te propose la démonstration, refuse-la : le poste doit rester vierge.

## § 1 · Données

Aucune rangée : rien ne touche ton corpus.

## § 2 · Interface — dans Cadre → Trimestre

**2.1 · Créer le premier trimestre ne pose plus trois questions**
*Pourquoi :* un collègue qui répondait « Annuler » à « Veux-tu l'activer immédiatement ? » se retrouvait avec un trimestre qui n'était actif nulle part ; le formulaire du groupe-cours lui répondait ensuite « Veuillez sélectionner un trimestre » alors qu'il n'en existait qu'un.
- [ ] Accordéon **« Trimestre »** → **« + Nouveau trimestre »** ; réponds `A`, puis `2026`.
  ⮕ *Attendu :* deux questions seulement, puis « Trimestre "Automne 2026" créé avec succès ! ». *Avant :* une troisième question, « Veux-tu l'activer immédiatement ? ».

**2.2 · Le groupe-cours connaît déjà le trimestre**
- [ ] Accordéon **« Groupe-cours »** → **« + Nouveau groupe-cours »**.
  ⮕ *Attendu :* le champ **« 1. Trimestre »** affiche déjà **Automne 2026**. *Avant :* « — Choisir un trimestre — ».

**2.3 · Un horaire sans groupe dit où créer le groupe**
*Pourquoi :* le refus « Veuillez sélectionner un groupe associé » laissait devant un menu vide, sans dire où naît un groupe.
- [ ] Accordéon **« Horaire »** → **« + Nouvel horaire »** ; tape un nom, clique **« Créer »** sans choisir de groupe.
  ⮕ *Attendu :* la bulle dit **« Aucun groupe d'étudiant·es pour l'instant »**, puis « Un groupe apparaît dans ce menu dès qu'un·e étudiant·e y est inscrit·e. Ajoute ou importe ta liste dans l'accordéon « Groupe d'étudiant·es », juste au-dessus. »
- [ ] As-tu eu le temps de lire la phrase **jusqu'au bout** avant que la bulle disparaisse ? ⮕ *Attendu :* oui. Sinon, dis-le : c'est la seule chose qu'aucun test ne peut juger.

**2.4 · Le groupe apparaît sans rouvrir le formulaire**
*Pourquoi :* même en suivant le conseil du message, le menu « Groupe associé » restait vide tant qu'on ne rouvrait pas « + Nouvel horaire ».
- [ ] **Laisse le formulaire de l'horaire ouvert.** Dans **« Groupe d'étudiant·es »**, remplis Nom, Prénom, et `00001` dans **Groupe**, puis **« Ajouter l'étudiant·e »**.
- [ ] Reviens au menu **« Groupe associé »** de l'horaire, sans rien rouvrir. ⮕ *Attendu :* il propose **00001 (1 étud.)**. *Avant :* il restait sur « — Sélectionner un groupe — ».

## § 3 · Décisions

Aucune : les mots de 2.3 ont été approuvés par Grégoire avant d'être posés (13 sept., 20 h).

## § 4 · Ce que je n'ai pas pu vérifier

- **Safari réel et iPad** : les quatre essais tournent dans WebKit sans tête (`tests/integration/parcours-rentree-478.spec.js`), qui répond aux boîtes de dialogue par programme. La durée d'affichage de la bulle n'est mesurée nulle part.
- **Le stock** : un poste qui a DÉJÀ un trimestre créé inactif reste dans cet état — le correctif agit à la création. Il en sort en choisissant le trimestre dans « Trimestre actif : ». Les postes de la communauté de pratique partent vierges ; ton poste réel n'est pas dans ce cas (ton trimestre est actif).
- **Non cherché** : dans une sonde, un groupe-cours de service avec une pratique DÉMO ne s'est pas enregistré. Hors du parcours de mardi (un poste vierge n'a pas de démo active) ; inscrit sous #478.
- **La carte « 4/5 configurés »** que l'orthopédagogue verra lundi n'est PAS corrigée par ce lot : mesurée, remontée, portée par la puce de #836 et #475.
