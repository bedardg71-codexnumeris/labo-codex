# Portes terrain — Journées sans cours : la reprise décide (19 nov. 2026)

**Lot** `lot/journees-reprise` · **Trace** de l'artefact que publiera Cowork (bouton « Copier mes résultats »).
Sur tes vraies données, aucune donnée fictive. **Aucune de ces portes n'écrit rien** : chaque « Modifier » se
referme par le × sans enregistrer. Un échec devient un item de backlog, pas une note mentale.

Tout le reste (calcul des semaines, formulaire Oui/Non, badge, légende, textes d'aide) est jugé par la machine :
voir § 4.

---

## § 0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 · iPad | ✅ **Faite** (capture du 19 nov., 8 h 17, avant la fusion) : Cadre › Calendrier montre le **lun. 16 nov. en semaine 11** et le **mer. 18 nov. en semaine 12**. | Mesure d'avant, reprise en 1.1.a. |
| 0.2 | Après la fusion de `lot/journees-reprise` sur `main` (30 à 60 s de déploiement), recharge l'application **en vidant le cache** sur chaque appareil. | — |
| 0.3 | Cadre › Trimestre › « Journées sans cours » › « + Ajouter ». | Le formulaire pose la question « Cette journée sera-t-elle reprise ? » (et non plus un menu « Nature »). Sinon, c'est l'ancienne version : recharge encore, n'ouvre pas la suite. Ferme par le ×. |

Pourquoi 0.3 et pas le numéro en bas de page : ce lot ne fait pas de release, le numéro ne bouge pas.

## § 1 · ⚠⚠ Données — tes trimestres réels, rien n'est écrit

### 1.1 · Sur l'iPad, le calendrier ne bouge pas

**Pourquoi.** Tes deux grèves y sont déclarées « Personnel » faute de mieux : elles ne décalaient rien. Le
nouveau calcul ne lit plus l'étiquette, seulement la reprise. Sur l'iPad, le résultat doit être exactement le même.

| | Geste | Attendu |
|---|---|---|
| 1.1.a · iPad | Cadre › Calendrier : lis le numéro sous le lun. 16 nov. et sous le mer. 18 nov. | Les mêmes qu'en 0.1 : 16 nov. en semaine 11, 18 nov. en semaine 12. |
| 1.1.b · iPad | Regarde les cases des 10 et 13 nov. | Toujours en pointillé jaune, « S11 · » suivi de la description de ta grève. |
| 1.1.c · iPad | Cadre › Trimestre › Journées sans cours : « Modifier » sur une grève. | « Non, le cours est perdu » est coché ; horaire et date de reprise ne sont pas affichés. Ferme par le ×. |
| 1.1.d · iPad | « Modifier » sur Élections. | « Oui » est coché ; la date de reprise que tu avais saisie est là. Ferme par le ×. |
| 1.1.e · iPad | Dans la liste des journées, regarde les grèves puis Élections. | Les grèves portent le badge « Non reprise » ; Élections n'a plus de badge, seulement la ligne « → Reprise le … ». |
| 1.1.f · iPad | Touche le titre « Journées sans cours ». | L'infobulle commence par « Les jours où ton cours n'a pas lieu. Repris, ils décalent les semaines suivantes… » |

### 1.2 · Sur le Mac, la semaine 11 redevient perdue, sans geste

**Pourquoi.** Sur le Mac (Chrome), la grève est encore déclarée « Institutionnel » : la semaine 12 démarrait le
jeudi 19 nov., et toutes les suivantes étaient décalées. Personne ne touche à rien : le calendrier se recalcule à
l'ouverture.

| | Geste | Attendu |
|---|---|---|
| 1.2.a · Mac | Ouvre l'application dans Chrome, Cadre › Calendrier, et ne touche à rien. | Les 10 et 13 nov. passent en pointillé jaune et affichent « S11 · » suivi de la description. Avant : aucun numéro. |
| 1.2.b · Mac | Lis le numéro sous le mar. 17 nov. et sous le mer. 18 nov. | Semaine 12, comme sur l'iPad. Avant : 11. (Le lun. 16 nov. reste en semaine 11, avant comme après.) |

## § 2 · Interface

Rien : le formulaire, le badge, la légende et l'avertissement d'une reprise hors du calendrier sont jugés au
navigateur par la machine (§ 4).

## § 3 · Décisions — ce ne sont pas des vérifications

Toutes tranchées le 19 nov. (Cowork) ; les mots valent tels quels sauf correction de ta part.

| | Décision | Verdict |
|---|---|---|
| 3.1 | Le formulaire d'ajout ne pré-coche ni « Oui » ni « Non » ; sans réponse : « Indique si cette journée sera reprise. » | ✅ Accepté. |
| 3.2 | Une reprise qui n'apparaîtra pas (après la fin du trimestre, en semaine d'examens) : l'enregistrement se fait, et un avertissement le dit : « Cette date de reprise tombe hors des jours de cours de ton trimestre : elle n'apparaîtra pas dans ton calendrier. » | ✅ Livré ; vérifié par la machine. |
| 3.3 | Le compteur « Congés avec reprise » de la légende devient « Journées reprises ». | ✅ Livré. |

## § 4 · Ce que je n'ai pas pu vérifier

- **Safari et l'iPad** : WebKit n'est pas installé dans le conteneur. Le banc du formulaire (`portes-relais-cadre.spec.js`)
  est vert sous Chromium seulement. D'où 1.1.c à 1.1.f.
- **Tes données réelles** : je ne les ai pas. Les attendus chiffrés viennent de ta capture (0.1) et de la mesure de
  Cowork sur ton cadre (Élections comprises) ; je ne connais pas la description exacte de tes grèves.
- **La régénération au démarrage** est lue dans le code (`main.js` → `initialiserModuleSaisiePresences`), pas
  observée sur ton Mac : c'est 1.2.
- Mesuré par la machine, sans porte : le cas vécu (grève des 10 et 13 nov. sans reprise = les numéros du calendrier
  sans grève) et ton cadre avec les Élections (16 nov. en semaine 11, 17 et 18 en 12, sur l'iPad comme sur le Mac),
  break-tests faits ; « Personnel », « Institutionnel », « Férié » ou rien donnent le même calendrier ; la même journée
  avec reprise décale ; le formulaire Oui/Non, le badge, la case « S11 · », la relecture par « Modifier » et
  l'avertissement d'une reprise au 24 déc. (Chromium, break-tests faits) ; la description d'une journée sort en texte
  dans la case du calendrier, jamais en HTML (break-test fait) ; la légende à 9 entrées.
