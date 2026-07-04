# Usage et besoins en matière de formats — journal d'observation

> **Création** : 9 mai 2026
> **Objet** : capturer en continu ce que les testeurs font, demandent, contournent ou évitent avec les formats actuels de Labo Codex (`.codex.zip`, `.codex-data.json`, cartouches `.txt`, exports `.json`, etc.).
> **Pourquoi** : décider en mai 2027 si certains formats méritent d'être formalisés, après une année d'observation réelle plutôt que d'extrapolation.
> **Compagnon de** : `SUIVI-BUGS.md` (frictions techniques) — celui-ci capture frictions et besoins **liés aux formats et au partage**, pas les bugs.

---

## Comment l'utiliser

Quatre sections ci-dessous, chacune fonctionne comme un journal daté. Format minimal :

```
- AAAA-MM-JJ — [initiales testeur] — description brève, en 1-3 lignes
  Contexte (optionnel) : où ça s'est passé, avec quel format
```

Pas de catégorisation poussée, pas de templates rigides. L'idée est qu'on capture en moins de 30 secondes pour ne jamais sauter une observation.

À chaque bilan périodique, on relit, on repère les patterns, on décide.

---

## 1. Frictions observées

> Un testeur a essayé de faire X avec le format Y, ça a coincé. Pourquoi.

- **2026-06-10 · GB** — Import `.lcz` (P3, premier essai terrain) : a cherché l'import dans la modale Bibliothèque de grilles (« Importer des grilles », ancien flux JSON) plutôt que dans Réglages › Données. Réflexe légitime : l'export `.lcz` se fait depuis le menu ⋮ de la bibliothèque, on s'attend à importer au même endroit. Argument pour P4 (items partagés visibles dans les sélecteurs) ; à reconsidérer aussi pour P7 (guide) et peut-être un bouton d'import dans les biblios.
- **2026-06-10 · GB** — Safari macOS grise TOUS les fichiers d'un sélecteur quand `accept` pointe une extension sans UTI enregistrée (`.lcz`). Corrigé en retirant `accept` (validation par magic bytes, principe D-V1). Coût assumé de l'extension dédiée : à documenter au guide P7.

---

## 2. Besoins de partage exprimés

> « J'aimerais pouvoir partager juste cette grille avec un collègue », « comment je récupère ce cartouche pour mon autre cours », etc.

*(à remplir)*

---

## 3. Détournements créatifs

> Ce que les testeurs font avec les formats actuels qui n'était pas prévu. Souvent les meilleurs signaux sur ce que devrait permettre la Voûte.

*(à remplir)*

---

## 4. Questions récurrentes

> Si plusieurs testeurs posent la même question, c'est probablement un manque de format, de documentation ou de fonctionnalité.

*(à remplir)*

---

## Bilans périodiques

| Date prévue | Type | Action |
|-------------|------|--------|
| Juillet 2026 | Bilan post-colloque AQPC | Premiers signaux de l'écosystème enseignant. Que ressort des conversations du colloque ? |
| Octobre 2026 | Bilan automne | Après un trimestre d'usage actif H2026 + retours initiaux des testeurs A2026. |
| Février 2027 | Bilan hiver | Après le trimestre A2026, début H2027. |
| Mai 2027 | Décision formats | Trancher : quels formats méritent une spec publique, lesquels restent informels. Reprendre `Rapports/exploration-obsidian/Structures-et-formats-a-definir.md`. |

Format de bilan : 30 min - 1 h. Relire le journal. Repérer 3-5 patterns. Noter ce qui a évolué dans le projet (nouveaux formats créés, anciens retirés). Décider si quelque chose justifie une formalisation immédiate ou peut encore attendre.

### Bilan — juillet 2026 (rédigé le 4 juillet en Cowork ; à compléter par GB, voir point 4)

1. **Le journal n'a pas encore capté de signaux externes.** Deux entrées en deux mois,
   toutes deux de GB (10 juin, terrain `.lcz`), sections 2-3-4 vides. Ce n'est pas un
   échec du format de journal (30 s par note, adéquat) mais le reflet du calendrier :
   les testeurs externes n'arrivent vraiment qu'avec la CoP (mi-août) et A2026. Le
   bilan d'octobre sera le premier à avoir de la matière externe.
2. **Pattern des deux entrées : la découvrabilité de l'IMPORT, pas le format.** Les
   deux frictions touchent l'entrée du fichier dans l'app (où importer ; sélecteur
   Safari qui grise `.lcz`), aucune ne remet en cause la structure des formats
   eux-mêmes. À verser au guide P7 et à l'argumentaire P4 (déjà noté en juin).
3. **Évolution des formats depuis la création du journal (9 mai)** : `.lcz` est passé
   de spec à réalité livrée (P1→P4, TOFU, préfixage `PARTAGE_*`, release 1.11.0) ;
   « import inter-trimestre = copie » acté et annoncé (changelog 1.21) ; export CSV
   de synthèse livré (#333 Lot 2, 1.20.0). Aucun format retiré. Le `.lcz` fonctionne
   de facto comme format formalisé sans spec publique — cohérent avec l'échéance de
   mai 2027, rien à devancer.
4. **Trou à combler (GB seulement)** : les signaux du colloque AQPC (3 juin) n'ont
   jamais été transférés dans le journal — la checklist « Après (dans la semaine) »
   ci-dessous est restée lettre morte. À la reprise d'août : transférer les notes
   brutes si elles existent encore, ou acter ici que ces signaux sont perdus.
5. **Décision proposée** : aucune formalisation immédiate ; maintenir le journal ;
   prochaine échéance réelle = bilan d'octobre (premier trimestre d'usage externe).

---

## Checklist colloque AQPC (juin 2026)

À utiliser pendant et juste après le colloque pour ne pas perdre de signaux.

**Pendant** :
- Noter qui se montre intéressé par Codex et leur contexte (discipline, cégep, niveau).
- Quand un participant pose une question, noter la question telle quelle (pas reformulée).
- Si quelqu'un mentionne un autre outil qu'il utilise (Léa, Studyo, Notion, Obsidian, Excel, Google Sheets, etc.), noter lequel et pour quoi.
- Repérer les phrases du type « est-ce que je pourrais aussi… » — ce sont des besoins exprimés.

**Après (dans la semaine)** :
- Relire les notes brutes, transférer ici dans les bonnes sections.
- Identifier les 3 questions/besoins les plus récurrents.
- Prendre les courriels de ceux qui veulent tester à l'automne.
- Préparer un mini-questionnaire d'onboarding pour les nouveaux testeurs (questions ouvertes : qu'est-ce que tu utilises actuellement ? qu'est-ce qui manque ?).

---

## Notes pour l'année

*(zone libre pour observations qui n'entrent pas dans les 4 sections — évolution des formats internes, décisions ponctuelles, hypothèses à vérifier)*
