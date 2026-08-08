# RELAIS — où vit le travail en cours

> **Ce fichier ne dit qu'une chose : sur quelle branche se trouve le travail
> le plus récent.** Il est mis à jour au rituel de FIN de session et lu au
> rituel de DÉBUT. Il vit **toujours sur `main`**, et c'est toute sa raison
> d'être.

---

## État

| | |
|---|---|
| **Branche à ouvrir** | `main` |
| **Version** | **1.58.0** — build `0808-1538` |
| **Travail en avance sur `main`** | **aucun** |
| **Dernière mise à jour** | 8 août 2026, en après-midi (portage #424 livré) |

⮕ Le détail des priorités, de la prémisse chiffrée et des décisions en attente
est au **§3 de `SESSION.md`**. **Le portage des exports (#424) et l'export personnalisé (#431) sont LIVRÉS et fusionnés** ; prochaines priorités au §3 de `SESSION.md` (portes terrain, puis #421+#426).

---

## Pourquoi ce fichier existe

Le 8 août 2026, **deux sessions sont parties du même commit sans se voir**.
Chacune a livré une version « 1.55.0 » différente et pris les mêmes
identifiants de backlog. La journée s'est terminée par une réconciliation
manuelle : sept conflits, une renumérotation complète, trois numéros de
version à fondre en un.

Ce n'était pas un défaut d'attention. La session du matin **a fait le rituel
de début, a vérifié la prémisse, et a trouvé zéro écart** — parce que la
prémisse qu'elle lisait, sur `main`, avait été périmée par une branche qu'elle
ne pouvait pas voir.

▣ **La cause est structurelle, et elle est circulaire** : la consigne de relais
(le §3 de `SESSION.md`) est un fichier **versionné**. Quand le travail vit sur
une branche non mergée, la consigne qui le dit vit sur cette branche **aussi**.
La session suivante, elle, lit celle de `main`. *Une session qui ne démarre pas
sur la bonne branche ne peut pas lire l'instruction qui lui dit quelle branche
prendre.* Aucun soin apporté au rituel ne compense ça.

⮕ Ironie qui vaut d'être retenue : le §3 du 7 août s'ouvrait **précisément** sur
une mise en garde contre cette classe de problème. L'avertissement était juste —
et il a été mis en échec par le même mécanisme le lendemain, **parce que son
correctif avait été écrit là où la session suivante ne pouvait pas le lire**.

---

## La règle adoptée (décision de Grégoire, 8 août 2026)

**On fusionne vers `main` à la fin de CHAQUE session.** C'est le remède : c'est
le report du merge qui ouvre la fenêtre de divergence, et il avait été reporté
trois fois dans la semaine avant de coûter une journée.

**Ce fichier est le filet**, pour les cas où un merge doit vraiment attendre —
travail à mi-chemin, validation terrain en suspens, décision de Grégoire non
prise. Dans ce cas, et dans ce cas seulement :

1. le remplir en nommant la branche et ce qu'elle porte ;
2. le **committer et le pousser sur `main`**, seul, sans le reste du travail.

Un `RELAIS.md` qui pointe vers une branche est le signal qu'une dette de fusion
existe. Il doit repasser à « aucun » dès que la fusion est faite.

---

## Modèle à recopier quand du travail reste en avance

```
| **Branche à ouvrir** | `claude/nom-de-la-branche` |
| **Version**          | X.Y.Z — build MMJJ-HHMM    |
| **Travail en avance sur `main`** | N commits — <ce qu'ils portent, en une ligne> |
| **Dernière mise à jour** | <date> |

⚠ NE PAS ouvrir le conteneur sur `main` : il est à <version de main>, soit
<N> versions en arrière. Le §3 de SESSION.md sur `main` peut être périmé —
c'est CE fichier qui fait foi sur la branche à prendre.
```
