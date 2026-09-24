# Consigne – Une pratique sommative fonctionnelle (#941), en trois lots

> Écrite le 24 septembre 2026 (Toronto), par Cowork. **À lancer après le lot des absences** (`CONSIGNE-LECON-MANQUEE.md`), une session à la fois.
> **Les décisions font foi** : `plans de travail/DECISIONS-2026-09-24-parcours-sommatif.md` (D1 à D5, et ce que Cowork a tranché). Le constat : `Rapports/AUDIT-parcours-sommatif-2026-09-24.md` ; le banc du parcours : `tests/integration/audit-parcours-sommatif-2026-09-24.spec.js` – **il devient la preuve de bout en bout** : à la fin des trois lots, il doit dire ce que les décisions disent (ses attentes figées sur l'état d'avant suivent le changement voulu, et tu le nommes).
> Dans les mots de Grégoire : « la pratique sommative doit être fonctionnelle » ; « la plupart des enseignants [du réseau] ont une pratique sommative traditionnelle ».
> **Un lot à la fois** : chacun se termine par commit, relecture croisée de Cowork, verdict, push – puis le suivant. Ajoute les trois à `FILE-DES-LOTS.md` ; coche #941 à la fin du troisième seulement (ou découpe-la en sous-fiches si c'est plus clair : ton choix, dis-le).

## Lot S1 – Une grille en points se note sans échelle, et l'élève lit sa note (D1, D4)

- **D1** : une évaluation dont la grille est entièrement en points se calcule et s'enregistre **sans échelle** ; aucune échelle glissée d'office ; la note ne passe plus à « -- » quand il n'y en a pas. L'élève ne lit **aucun nom de niveau** : ni « Niveau général · … », ni « (Incomplet) » à côté d'un critère ; il lit les points et les %. Mesure d'abord **tous les lieux** où une échelle est supposée pour une évaluation en points (calcul de la note, écran d'évaluation, liste, profil, PDF, texte copié, export) et nomme-les avant de coder.
- **D4** : la page de synthèse écrit « **Note de la copie : 74 %** » en tête du bloc « Niveau général », et la **note cumulée** dans « Note provisoire » (calculée par la pratique sommative, marquée provisoire).
- ⛔ **Arrêt prévu** : si D1 oblige à changer le **calcul** d'une note déjà enregistrée (pas seulement son affichage), ou touche une note de Grégoire (Standards, échelles à repères), arrête-toi et dis-le. Ses élèves ne doivent rien voir changer.
- **Stock** : les évaluations sommatives déjà enregistrées avec l'échelle de départ – dis ce qu'elles afficheront, sans rien réécrire.

## Lot S2 – Le bilan d'une grille en points : la règle des 60 % (D2)

- Dans le périmètre exact de D2 : grilles en points **sans échelle** seulement ; sous 60 % = prioritaire avec sa définition ; « Ta force » vide ; « Points récurrents » : 60 % et plus **arrête** le compte, copie qui n'évalue pas le critère **sautée**. Une échelle à repères garde ses repères.
- Écris dans le commentaire du code la révision du principe du 28 août (`zoneDuNiveau`) telle que D2 la formule.
- Une seule règle pour le PDF et l'écran, comme #940.

## Lot S3 – Ce que la synthèse ne doit pas dire (D5, C2, C5)

- **D5** : « Jetons utilisés » ne paraît que si la pratique déclare des jetons actifs.
- **C2** : « Présentement, il faut se concentrer sur : » ne s'écrit pas quand rien ne s'y range (écran, « Copier tout », PDF).
- **C5** : sans cartouche, pas d'étiquette « CONTEXTE » vide sur le ruban.

## Pour les trois lots

- **Aucune donnée écrite.** Pas de nom d'élève réel (règle 6).
- **Mots que l'élève lit** : « Note de la copie : … » est validé ; tout AUTRE texte neuf que l'élève lirait remonte à Grégoire avant le push.
- **« Nouvelles »** : une phrase par lot, **proposée par toi, soumise à Grégoire** avant chaque push.
- Break-tests de ton choix, chacun rouge ; nomme-les. Porte terrain : aucune pour S1-S3 sur ses données (il est en Standards) ; si une rangée te semble due, dis pourquoi.
