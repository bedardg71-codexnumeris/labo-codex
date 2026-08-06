# Plan de la journée — 7 août 2026 (préparé le 6 août au soir)

> **Le projet du jour** : fermer la vague de correctifs par la validation terrain,
> puis ouvrir le chantier prioritaire ONBOARDING par le test à froid « Catherine »,
> et finir la journée avec le journal de frictions trié au BACKLOG.
> **Point d'entrée unique** : ce document. Chaque bloc renvoie à sa consigne détaillée.
>
> Trois blocs, dans l'ordre, avec une porte de sortie entre chaque :
> **A. Validation terrain** (~45-60 min) → **B. Test onboarding Cowork** (~60-90 min)
> → **C. Triage et versement** (session Claude Code, ~45-60 min).

---

## Avant de commencer (checklist matérielle, ~10 min)

- [ ] Mac : GitHub Desktop → Fetch + Pull sur `main` (dernier commit attendu : `72d72a9` ou plus récent).
- [ ] App locale rechargée (⇧⌘R) : version affichée **1.31.22**.
- [ ] **Backup Codex du jour** fait (Données → Enregistrer le codex).
- [ ] **Profil Chrome NEUF créé** pour le bloc B (Chrome → Profils → Ajouter — le nommer « Test Catherine »). ⚠ Jamais ton profil habituel : tes données h2026 y vivent.
- [ ] L'URL de l'app pour le bloc B choisie (version déployée publique, ou copie locale ouverte dans le profil neuf — dans les deux cas, l'app doit s'ouvrir à l'état « premier lancement »).
- [ ] Les deux consignes sous la main :
      `plans de travail/VALIDATION-TERRAIN-2026-08-07-consigne.md`
      `plans de travail/TEST-ONBOARDING-COWORK-consigne.md`

---

## Bloc A — Validation terrain de la vague 1.31.14 → 1.31.22 (~45-60 min)

**Suivre la consigne `VALIDATION-TERRAIN-2026-08-07-consigne.md` étape par étape**
(9 étapes + grille §10). Rappel des deux règles dures :
- en cas d'écart : **noter, ne rien réparer**, continuer la passe ;
- remplir la grille même quand c'est bon (les ✓ comptent autant que les ✗).

**Porte de sortie du bloc A** :
- **Tout ✓ (ou seulement des écarts mineurs)** → passer au bloc B.
- **Un ✗ BLOQUANT** (calcul STD incohérent, donnée qui ne survit pas à un
  rechargement, régression visible) → la journée bascule : ouvrir une session
  Claude Code avec la grille, corriger AVANT tout le reste (priorité retours
  terrain, CLAUDE.md). Le bloc B glisse au lendemain — le test Catherine sur
  une app douteuse ne mesurerait rien de fiable.

## Bloc B — Test d'onboarding à froid « Catherine » (~60-90 min)

**Suivre la consigne `TEST-ONBOARDING-COWORK-consigne.md`** :
1. §1 Préparation : profil Chrome neuf, app à l'état premier lancement,
   session **Cowork neuve** (aucun contexte projet), contrôle de Chrome donné.
2. §2 : coller le prompt verbatim (remplacer `[URL]`).
3. Pendant le test : **ne pas aider**. Si la session te sollicite :
   « fais comme si j'étais absent — note la friction et continue ».
   Toi, tu observes : note à part ce qui TE surprend (ton double regard
   d'auteur vaut une deuxième passe).
4. À la fin : récupérer le livrable complet (verdict + journal numéroté +
   top 5 + bons moments). Le copier tel quel dans un fichier texte — c'est
   la matière première du bloc C.

## Bloc C — Triage et versement (session Claude Code, ~45-60 min)

Ouvrir une session Claude Code et coller ceci (verbatim) :

```
Lis plans de travail/PLAN-JOURNEE-2026-08-07.md, bloc C. Voici mes deux
livrables du jour : [1] la grille de validation terrain remplie (§10 de la
consigne de validation), [2] le journal du test d'onboarding Catherine.
<coller les deux ici>

Fais, dans cet ordre :
1. RITUEL de début de session (SKILL_Debut_de_session.md), puis triage de la
   grille [1] : chaque ✓ ferme sa porte terrain aux items BACKLOG concernés
   (#397, #400, #401, parcours STD #394) ; chaque ✗ devient soit un correctif
   immédiat avec sentinelle break-testée (si petit et non ambigu), soit un
   item BACKLOG précis avec repro. SUIVI-BUGS mis à jour s'il y a lieu.
2. Archive le journal [2] tel quel dans Rapports/TEST-ONBOARDING-2026-08-07.md
   (verbatim, c'est le point de comparaison des passes futures).
3. Trie les frictions en items BACKLOG numérotés — chantier ONBOARDING,
   priorité 1 (décision du 6 août). Règles de triage : durcir la gravité d'un
   cran (un « ralentisseur » pour Claude ≈ un « bloquant » pour un humain
   pressé) ; regrouper par écran/parcours, pas par ordre chronologique ;
   distinguer friction d'ACCOMPAGNEMENT et défaut FONCTIONNEL (deux items
   séparés) ; préserver explicitement les « bons moments » (les noter dans
   l'en-tête du chantier comme acquis à ne pas casser).
4. Propose-moi un ordre de prise pour la vague onboarding (quick wins
   d'abord), SANS commencer à coder — je tranche. Ce qui demande une décision
   UX de ma part est marqué 📐.
5. Clôture habituelle : SESSION.md (bloc du jour + signet remonté), BACKLOG
   cohérent, commit/push sur une branche de travail. Le merge → main, je le
   décide en fin de session.
```

---

## Fin de journée — ce qui doit être vrai

- [ ] Grille de validation remplie et triée ; portes terrain #397/#400/#401 fermées (ou correctifs ouverts).
- [ ] Journal Catherine archivé dans `Rapports/` (l'étalon des passes futures).
- [ ] Chantier ONBOARDING au BACKLOG, priorisé, avec les 📐 identifiés pour toi.
- [ ] SESSION.md à jour : prochain cap = la vague onboarding (objectif 1) ;
      l'objectif 2 (pérennité/succession) reste en file derrière.

**Si la journée déborde** : le bloc C est le seul reportable sans perte — les
deux livrables (grille + journal) se conservent tels quels et se trient le
lendemain. Les blocs A et B, eux, valent d'être faits le même jour que prévu :
l'app vient d'être déployée et le contexte est frais.
