# Analyse fondatrice — la vérification adverse

> Document de rationale derrière `SKILL_verification_adverse.md` (le « pourquoi »
> behind le skill). Né de l'examen de la méthode appliquée dans les deux audits du
> 13-14 juin 2026 — travail autonome de l'IA puis travail collaboratif IA + Grégoire
> (`Rapports/AUDIT-travail-IA-11-13juin-2026.md`,
> `Rapports/AUDIT-travail-collaboratif-1.12-1.16-2026-06.md`). À lire pour comprendre
> d'où viennent les principes du skill ; le skill, lui, se suffit pour l'exécution.

---

## Le problème à résoudre

Vérifier la qualité d'un travail de développement — surtout du code généré par une IA,
surtout quand le vérificateur est l'auteur — n'est pas « relancer les tests et lire le
diff ». Les deux audits ont montré que les trouvailles utiles ne venaient **jamais** de
« les tests passent ». Le code était bon ; la valeur est venue d'ailleurs, et c'est cet
« ailleurs » qu'il fallait nommer pour le rendre reproductible.

---

## 1. La méthode, distillée en 4 mouvements porteurs

Les deux audits suivaient 5 étapes (baseline → grand livre des affirmations →
conformité mécanique → vérification adverse → synthèse). Sous l'échafaudage, **4
mouvements** portent tout le poids :

| Mouvement | Ce qu'il fait | Coût |
|---|---|---|
| **A. Re-dériver l'attestation** | Re-rouler les tests soi-même, regrep les chiffres du journal, relire le diff — au lieu de croire « 706 verts / miroir mort / #340 réparé » | Moyen |
| **B. Break-test** | Casser le correctif → exiger que le test rougisse. Transforme « les tests passent » en « les tests protègent X » | Moyen, ciblé |
| **C. Conformité mécanique scriptable** | Balayage catégoriel (zones protégées, eval, console.log, innerHTML, validations) sur la plage de diff | Faible |
| **D. Relire les coutures** | Confronter affirmation↔code et chantier↔chantier ; chercher le défaut entre les pièces, pas dans une pièce | Moyen |

---

## 2. Ce que la méthode a produit — et où était la valeur

- **Le break-test (B)** a converti une croyance en preuve : 7 sentinels cassés, 7 fois
  rouges → on *sait* qu'ils protègent quelque chose.
- **La couture récit↔code (D)** a sorti l'incohérence #340 : en-tête « RÉPARÉ » vs item
  « 🔴 en attente ». Aucun test ne l'aurait dit.
- **La couture chantier↔chantier (D)** a sorti le défaut le plus précieux : les
  garde-fous #335/#334 protègent l'**import** mais pas le **changement de trimestre** —
  la vraie cause de #340 reste ouverte. Ce constat n'est dans **aucun** chantier ; il
  vit dans l'espace entre eux.
- **Nommer les limites (A)** a calibré la confiance : Playwright non re-roulé, clone
  superficiel rapatrié. « Non vérifié » distingué de « vérifié ».

**Leçon directrice** : *la vérification rapporte le plus aux jonctions* — entre ce qui
est affirmé et ce qui est codé, et entre les morceaux qu'on juge isolément.

---

## 3. Les 7 principes généralisés

Distillés en maximes + anti-pattern jumeau, ils forment le §2 du skill parent. Résumé :

- **P1 — L'attestation n'est pas la preuve.** Journal, libellés, comptes de tests = des
  affirmations. Re-dériver chacune. (AP-1 : croire le récit.)
- **P2 — Un test qui ne peut pas échouer ne prouve rien.** Casser, exiger le rouge.
  (AP-2 : le test tautologique.)
- **P3 — Mécanique d'abord, profondeur ensuite.** Balayer partout, disséquer là où ça
  compte. (AP-3 : profondeur uniforme.)
- **P4 — Chercher le défaut aux coutures.** Affirmation↔code, chantier↔chantier.
  (AP-4 : l'audit en silos.)
- **P5 — Lecture seule sur la cible ; doute en jetable.** Ne pas contaminer, ne pas
  réparer en vérifiant. (AP-5 : vérifier en modifiant.)
- **P6 — Nommer ce qu'on n'a pas pu vérifier.** « Confirmé » ≠ « non vérifié ».
  (AP-6 : confiance surclamée.)
- **P7 — En auto-vérification, mécaniser la défiance envers soi.** Exiger l'artefact,
  pas l'opinion. (AP-7 : l'auto-complaisance déguisée en checklist.)

---

## 4. Le pivot auto-vérification ↔ audit tiers

Les 4 mouvements et P1–P6 sont **identiques** dans les deux postures. Ce qui change :
le but (prévenir vs constater), le biais dominant (confirmation envers soi → P7 central,
vs manque de contexte), le coût du re-run (faible en session, setup en post-hoc). Le
break-test est le grand égalisateur : un échec est factuel quel que soit l'auteur. D'où
un **tronc commun** et **deux modes** courts dans le skill, pas deux skills jumeaux.

---

## 5. Proportionnalité

La profondeur (B/D, chère) se dose au risque, calqué sur le barème de réversibilité de
`SKILL_hygiene_donnees_partagees` (§2/P5) : break-test **obligatoire** sur
données/sécurité/SSOT/garde-fous ; échantillon sur la logique métier ; rien de plus que
le balayage mécanique sur l'UI/microcopy ; couture récit↔code seule sur les docs.

---

## 6. Place dans l'écosystème de skills (zéro-dette)

Le gap réel comblé = la discipline adverse (mouvements **B** break-test + **D** coutures,
et P1/P7 attestation-vs-preuve). Ce que l'existant couvrait déjà, et qu'on ne redit pas :
- `SKILL_Fin_de_session` §2 = mouvement **C** (balayage mécanique) en auto-posture →
  le skill l'**étend** d'un §4 adverse au lieu de le dupliquer.
- `SKILL_Debut_de_session` = une partie de **A** (re-dériver le baseline factuel).
- `SKILL_hygiene_donnees_partagees` ↔ `SKILL_integrite_globaux` = le **patron**
  parent abstrait / enfant concret imité ici.
- ADR-012 (audit annuel) = holistique, orthogonal.

**Forme retenue** : un nouveau skill parent abstrait (`SKILL_verification_adverse.md`)
+ extension de `SKILL_Fin_de_session.md` (§4). Un fichier neuf, un fichier étendu — pas
d'empilement.

---

**Date** : 14 juin 2026. **Statut** : appliqué — a produit `SKILL_verification_adverse.md`
et l'extension `SKILL_Fin_de_session.md` §4.
