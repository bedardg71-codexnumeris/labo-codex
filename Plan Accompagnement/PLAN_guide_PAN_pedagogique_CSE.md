# Plan : guide PAN pédagogique — cadre du CSÉ + les 2 PAN de l'app

**Date** : 29 mai 2026
**Auteur** : Claude (Cowork) en discussion avec Grégoire
**Destinataire** : Claude Code
**Statut** : Spec finalisée
**Version cible** : Beta à déterminer

---

## 1. Vision et contexte

Ce guide est le **volet pédagogique** des pratiques de notation. Il forme une paire avec le
guide réglementaire (`PLAN_guide_PAN_refonte_RREC.md`), mais répond à une autre question :

- Le guide **réglementaire** dit *jusqu'où on peut aller légalement* (seuil de 60 %, PIEA,
  responsabilité partagée).
- Le guide **pédagogique** (celui-ci) dit *pourquoi on voudrait s'éloigner du sommatif
  traditionnel, et quelles formes concrètes cela prend dans Labo Codex*.

Le cadre intellectuel vient du rapport du Conseil supérieur de l'éducation, *Évaluer pour
que ça compte vraiment* (2018). Ce rapport **ne parle pas de PAN** comme telles — il faut
le dire clairement pour ne pas lui faire dire ce qu'il ne dit pas. Mais il **remet en cause
le sommatif traditionnel fondé sur le cumul de points**, et c'est cette remise en cause qui
justifie d'explorer d'autres pratiques. Les PAN sont une réponse possible, parmi d'autres,
à un problème que le CSÉ documente.

### Distinction faits / lecture (rigueur)

- **Fait (CSÉ)** : ce que le rapport affirme, avec citation.
- **Lecture (Labo Codex)** : le lien que l'app établit entre la réflexion du CSÉ et ses
  pratiques. C'est une interprétation défendable, pas une affirmation du CSÉ.

Le guide doit garder cette frontière visible : on s'appuie sur le CSÉ, on ne lui attribue
pas l'invention des PAN.

### Périmètre

- **2 PAN décrites** : Standard (SDT, = Maîtrise / *Standards-Based Grading*) et
  Spécifications (SPE, *Specifications Grading*). Ce sont les seules implémentées.
- **La Sommative (SOM) n'est pas une PAN** : elle sert de point de contraste (la pratique
  que le CSÉ interroge).
- Une 3e voie (dénotation / *ungrading*) existe dans la littérature et le registre interne
  (`gabarits-utils.js`, code `DEN`) mais **n'est pas implémentée** : à mentionner en une
  phrase comme horizon, sans la présenter comme disponible.

### Note terminologique — « PAN » est une famille, pas une pratique

**PAN** (pratiques alternatives de notation) désigne la **famille** ; **SDT**, **SPE**
(et, à terme, la dénotation) sont des **pratiques** de cette famille. Le guide doit
respecter cette hiérarchie : ne jamais employer « PAN » comme synonyme de « Standards ».

> **Historique de la dérive (contexte pour Claude Code).** Au début du développement,
> l'app codait en dur la pratique Standard de Grégoire et confondait parfois la *généralité*
> (PAN) et la *spécificité* (SDT). C'est pourquoi le badge du wizard
> (`wizard-pratique-v2.js`) porte encore `code: 'PAN'` pour `pan-standards`, alors que
> `gabarits-utils.js` utilise `'STD'`. **Code canonique de la pratique Standard : `SDT`.**
> La distinction entre les PAN se clarifie depuis janvier 2026. Unifier `PAN`/`STD` → `SDT`
> est un chantier de nettoyage distinct (zéro-dette), hors de ce guide mais à garder en vue.

### Hors-périmètre

- Pas de cadre légal détaillé : il est dans le guide compagnon (renvoi explicite).
- Pas de modification de la logique de notation.
- Pas de zones protégées (`config.js`, `navigation.js`, `noms_stables.json`).

---

## 2. Référence (page 1 du guide)

```html
<p class="guide-pedagogique-ref">
Conseil supérieur de l'éducation (2018). <em>Évaluer pour que ça compte vraiment. Rapport
sur l'état et les besoins de l'éducation 2016-2018</em>, Québec, chapitres 2 et 3. —
Talbert, R., &amp; Clark, D. (2023). <em>Grading for Growth: A Guide to Alternative Grading
Practices</em>. Routledge.
</p>
```

---

## 3. Contenu des 4 pages

À copier dans `GUIDES_PEDAGOGIQUES.pan.pages`. `cssPrefix: 'guide-pan'`,
`titre: 'Guide — Modalités d'évaluation (PAN et sommative)'`.

> **Décision du 29 mai 2026** : ce guide (les **modalités** : SDT, SPE, SOM) et le guide
> réglementaire (`PLAN_guide_PAN_refonte_RREC.md`) sont **deux guides distincts**. Deux
> identifiants (`pan` ici, `pan-rrec` pour le cadre), deux boutons « Guide » dans
> Conception → Pratiques de notation (« Modalités » et « Cadre réglementaire »). Pas de
> guide fusionné de 8 pages.

### Page 1 — Pourquoi explorer d'autres pratiques que le sommatif ?

```html
<p>Avant de présenter les pratiques alternatives de notation (PAN), il faut comprendre <strong>à quel problème elles répondent</strong>. Ce problème, le Conseil supérieur de l'éducation l'a documenté dans son rapport <em>Évaluer pour que ça compte vraiment</em> (2018). Le Conseil n'y parle pas de PAN — mais il remet en cause la notation sommative traditionnelle fondée sur le cumul de points.</p>

<p>Le CSÉ rappelle que l'évaluation poursuit <strong>deux finalités</strong> : <em>soutenir l'apprentissage</em> (la fonction formative, continue) et <em>témoigner des acquis</em> (la fonction certificative, en fin de parcours). Le sommatif traditionnel mêle les deux : en additionnant toutes les notes du trimestre, il transforme chaque évaluation formative en verdict qui pèse dans le résultat final.</p>

<h4>Le défaut du cumul de points</h4>
<p>Le CSÉ l'énonce sans détour : « en cumulant les étapes au bulletin […], on garde aussi la trace des premières erreurs dans le résultat final […], ce qui fait en sorte que cette note ne témoigne pas toujours adéquatement des acquis réels de l'élève ou de l'étudiant. Ceux qui connaissent des débuts difficiles se retrouvent particulièrement pénalisés par le cumul de points. » Autrement dit : une moyenne punit l'apprentissage initial, alors que c'est précisément le moment où l'erreur est attendue.</p>

<p>Le mot « sommatif » lui-même prête à confusion. Selon Scallon, cité par le CSÉ, « il ne s'agit pas […] d'additionner des résultats partiels pour établir une somme. Il s'agit plutôt de s'appuyer sur des accomplissements observés en cours de route pour éclairer le jugement qui devra être porté sur une performance terminale. » C'est un <em>bilan</em>, pas une addition.</p>

<p class="guide-pedagogique-ref">
Conseil supérieur de l'éducation (2018). <em>Évaluer pour que ça compte vraiment. Rapport sur l'état et les besoins de l'éducation 2016-2018</em>, Québec, chapitres 2 et 3. — Talbert, R., &amp; Clark, D. (2023). <em>Grading for Growth: A Guide to Alternative Grading Practices</em>. Routledge.
</p>
```

### Page 2 — Le principe commun aux PAN : certifier l'atteinte, pas additionner

```html
<p>Toutes les PAN partagent une même idée, que le CSÉ formule presque comme une définition : « la note finale ne serait pas un cumul des notes précédentes : elle refléterait l'atteinte de la compétence ou des objectifs à la fin du processus. » C'est exactement ce que font les PAN.</p>

<h4>Compter ou prendre en compte ?</h4>
<p>Le CSÉ propose de distinguer <strong>compter</strong> (faire la somme) de <strong>prendre en compte</strong> (considérer). Au moment d'attribuer une note finale, l'ensemble de ce qu'on sait des capacités de l'étudiant — y compris les évaluations formatives — est <em>pris en compte</em> dans l'exercice du jugement professionnel, sans pour autant avoir été <em>compté</em> dans une addition. La note reste, mais elle cesse d'être une moyenne mécanique.</p>

<h4>L'erreur comme tremplin</h4>
<p>Cette logique change le statut de l'erreur. Le CSÉ rappelle (citant Astolfi) que l'erreur est « un témoin qui permet de repérer les difficultés », pas une faute à pénaliser. En contexte de soutien à l'apprentissage, les étudiants « ne devraient pas être pénalisés pour leurs erreurs ». Une PAN matérialise ce principe : les premières évaluations deviennent formatives, les reprises sont permises, et c'est le niveau atteint qui certifie.</p>

<h4>Critérié, pas normatif</h4>
<p>Le CSÉ insiste enfin sur l'évaluation <strong>critériée</strong> (par référence à ce qui est attendu) plutôt que <strong>normative</strong> (par comparaison entre les individus). « La sélection n'est pas une finalité de l'évaluation et devrait avoir un caractère exceptionnel. » Les PAN sont critériées par construction : elles situent l'étudiant par rapport à des critères, pas par rapport à la moyenne du groupe.</p>

<div class="guide-pedagogique-astuce">Une PAN n'est donc pas une notation « plus douce » : c'est une notation qui cherche à mieux mesurer ce que l'étudiant <em>sait faire à la fin</em>, en cohérence avec la réflexion du CSÉ. La nuance compte si tu dois en parler à un collègue ou à ta direction.</div>
```

### Page 3 — Les deux PAN disponibles dans Labo Codex

```html
<p>Labo Codex implémente actuellement <strong>deux PAN</strong>, qui sont deux manières concrètes de certifier l'atteinte plutôt que d'additionner. La pratique sommative reste offerte comme point de comparaison.</p>

<h4>PAN-Standards (code SDT, aussi appelée Maîtrise)</h4>
<p>Tu évalues par <strong>niveaux de maîtrise</strong> (par exemple l'échelle IDME : Insuffisant, Développement, Maîtrisé, Étendu). La note est construite à partir de la démonstration de compétence, pas d'une moyenne. C'est la transposition, au collégial, de ce que le CSÉ décrit comme le <em>bulletin descriptif</em> : « l'échelle de notation du bulletin descriptif repose sur l'atteinte de critères et correspond à des niveaux de maîtrise. » En anglais, on parle de <em>Standards-Based Grading</em>.</p>

<h4>PAN-Spécifications (code SPE)</h4>
<p>Chaque travail est jugé <strong>conforme ou non conforme</strong> à des spécifications définies d'avance ; la note finale dépend du nombre de spécifications réussies (les « forfaits »). Le CSÉ note d'ailleurs que la communication d'une évaluation certificative « peut également prendre une forme dichotomique : succès ou échec ». En anglais, <em>Specifications Grading</em>.</p>

<h4>Sommative (code SOM) — le point de contraste</h4>
<p>La sommative classique calcule une moyenne pondérée des évaluations. <strong>Ce n'est pas une PAN</strong> : c'est la pratique traditionnelle, celle dont le cumul de points est précisément interrogé par le CSÉ. Labo Codex la conserve parce qu'elle reste la pratique officielle dans bien des contextes et qu'elle facilite la transition vers une PAN.</p>

<div class="guide-pedagogique-astuce">Une troisième voie existe dans la littérature — la « dénotation » ou <em>ungrading</em> (rétroaction qualitative, jugement global en fin de cours). Elle n'est pas implémentée dans Labo Codex pour l'instant ; ce guide la mentionne seulement pour situer le paysage.</div>
```

### Page 4 — Choisir en conscience

```html
<p>Le choix d'une pratique se fait dans <strong>Conception → Pratiques de notation</strong>. Quelques repères pour décider.</p>

<h4>Une PAN n'est pas une fin en soi</h4>
<p>Le CSÉ rappelle que la valeur informative d'une note, seule, est pauvre : elle « ne dit rien des forces et des faiblesses de la personne ». Une PAN ne corrige cela que si elle est <strong>accompagnée de rétroaction</strong> et intégrée à un dispositif d'apprentissage (enseignement explicite, dépistage RàI). Seule, elle peut donner l'impression d'une notation laxiste ; intégrée, elle devient un système d'évaluation défendable.</p>

<h4>Le jugement professionnel prime</h4>
<p>Dans toutes les PAN, l'algorithme propose, mais c'est ton <strong>jugement professionnel</strong> qui tranche. Le CSÉ définit ce jugement comme « un processus qui mène à une prise de décision […] [exigeant] rigueur, cohérence et transparence ». Labo Codex calcule une suggestion ; il ne décide pas à ta place.</p>

<h4>Performance et dépistage : deux regards</h4>
<p>Tu peux découpler la note (Performance) du dépistage (Niveau d'attention). La note suit la pratique choisie ; le dépistage, lui, regarde les productions les plus récentes — ce qui rejoint l'idée, citée par le CSÉ d'après l'Ontario, de porter « une attention toute particulière aux preuves d'apprentissage les plus récentes ».</p>

<h4>Et le cadre légal ?</h4>
<p>Choisir une PAN ne te place pas hors du règlement : le seuil de réussite de 60 % et les règles de ta PIEA continuent de s'appliquer. Ce volet est traité dans le guide compagnon <strong>« Cadre réglementaire »</strong>, accessible depuis le même module.</p>

<div class="guide-pedagogique-astuce">En résumé : le CSÉ fournit le <em>pourquoi</em> (le cumul de points ne témoigne pas fidèlement des acquis), les PAN fournissent le <em>comment</em> (certifier l'atteinte à la fin), et le guide réglementaire fournit le <em>cadre</em> (60 %, PIEA). Trois pièces d'un même raisonnement.</div>
```

---

## 4. Points d'accès

Depuis **Conception → Pratiques de notation** : un bouton « Modalités » (ce guide), à côté
du bouton « Cadre réglementaire » (guide compagnon).

```html
<button class="ee-guide-btn" data-action="ouvrirGuidePedagogique" data-param="pan" title="Guide — Modalités d'évaluation (PAN et sommative)">
    <img src="icons/icon-book.svg" alt="" class="btn-inline-icon"> Modalités
</button>
```

---

## 5. Tests fonctionnels spécifiques

- **Exactitude des citations** : vérifier mot pour mot les extraits du CSÉ utilisés
  (chapitres 2-3 du rapport), notamment : « la note finale ne serait pas un cumul des notes
  précédentes… », « on garde aussi la trace des premières erreurs… », la forme
  « succès ou échec », et la distinction *compter* / *prendre en compte*.
- **Frontière faits / lecture** : confirmer qu'aucune phrase n'attribue les PAN au CSÉ.
  Le rapport justifie l'exploration ; il ne prescrit pas les PAN.
- **Exactitude produit** : 2 PAN décrites (SDT, SPE), SOM présentée comme non-PAN,
  dénotation mentionnée comme non implémentée.
- **Modes clair/sombre + accessibilité** : comme les autres guides.

---

## 6. Finalisation

- Décider de la structure (deux guides distincts vs un guide fusionné de 8 pages) — voir §3.
- Numéro de beta : à demander avant le commit.
- Changelog : « Guide des pratiques de notation : fondé sur la réflexion du CSÉ
  (*Évaluer pour que ça compte vraiment*), décrit les pratiques disponibles. »

---

**Fin du plan**

*Paire avec `PLAN_guide_PAN_refonte_RREC.md` (cadre légal) et compagnon de l'audit
`Rapports/AUDIT-CONFORMITE-RREC-C29r4.md`. Source du cadre : CSÉ, «Évaluer pour que ça
compte vraiment» (2018), chapitres 2-3, dans `Autres pratiques de notation/`.*
