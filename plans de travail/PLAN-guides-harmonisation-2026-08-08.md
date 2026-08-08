# PLAN — Harmonisation des guides (forme + contenu) — 8 août 2026, soir

> **Demande Grégoire** (revue des 8 captures du guide de la Carte, Chrome/Mac) :
> « des polices parfois trop grosses, uniformiser la présentation », et
> « je voudrais que les trois guides se ressemblent ». Grégoire absent
> quelques heures — les décisions prises en son absence sont marquées ▣ et
> consignées ici pour arbitrage au retour.

## Réponses reçues avant son départ

| Question | Réponse |
|---|---|
| Appareil des captures | Chrome sur Mac |
| Récit IA de la page 8 | L'usage IA **externe** garde sa place ; l'import « à rebours » n'a jamais été expérimenté (et il est retiré depuis 1.57.0) |
| Référence Anderson | **2026 confirmé** (février 2026) — on garde |

## ▣ Interprétation de « les trois guides » (décision en son absence)

L'app a **deux moteurs** de guide : celui de la **Carte** (`GUIDE_PAGES`,
panneau flottant, classes `planif-guide-*`) et le moteur **unifié des guides
pédagogiques** (`guides-pedagogiques.js` : SOLO, ACP, RàI, SOM, PAN — un seul
rendu, classes `guide-pedagogique-*`). « Les trois » désigne probablement les
surfaces perçues (Carte + SOLO/ACP/RàI historiques) ; quelle que soit la
lecture, l'intention est claire : **toutes les surfaces de guide partagent la
même présentation**. C'est le périmètre retenu — harmoniser les DEUX familles
sur une seule échelle typographique. Si Grégoire visait autre chose, la
correction est bon marché.

## Diagnostic (relevé au code + captures)

### Forme

1. **Tailles incohérentes dans le guide de la Carte** (captures) : les `<p>`
   sortent gros, les listes petites. Aucune règle générique fautive trouvée au
   grep — la cause exacte côté Chrome n'est pas identifiée à distance, MAIS le
   correctif est déterministe : **poser une taille explicite sur chaque
   élément** (`p`, `li`, citation, astuce, conclusion, référence), plus
   `-webkit-text-size-adjust: 100%`. Un style qui ne dépend plus de l'héritage
   ne peut plus être gonflé par quoi que ce soit.
2. **Le corps du guide Carte est à 10.5px** — objectivement trop petit ; le
   moteur pédagogique est à **0.9rem (~14.4px), la bonne référence**. On
   aligne la Carte sur lui.
3. **Icônes invisibles** (pages 1, 3, 7) : `<span class="icone-inline--check">`
   par masque SVG rend VIDE chez Grégoire — sans texte de repli, l'échec est
   invisible. ▣ Remplacés dans le guide par des **glyphes texte stylés**
   (✓ / ! / ⚠), robustes partout et fidèles aux badges réels.
4. **Conclusion magenta géante** (page 7) : `.planif-guide-conclusion` pose
   graisse+couleur sans taille → héritage gonflé. Ramenée dans l'échelle,
   accent conservé discret.
5. **Composants dupliqués** : `astuce` et `ref` existent en DOUBLE
   (`planif-guide-*` ET `guide-pedagogique-*`, styles quasi identiques).
   Zéro-dette : les déclarations typographiques sont FUSIONNÉES en sélecteurs
   groupés — une seule source, sans renommer les classes dans les contenus.

### Contenu (guide de la Carte)

- **Page 8 PÉRIMÉE en entier** : documente la page « Plan de la leçon »
  supprimée (1.57.0), ses boutons, et l'import MD retiré. ▣ Réécrite :
  « Exporter ton plan » — menu Actions, 3 niveaux par usage + Personnalisé
  (modale, aperçu), Copier/Télécharger ; récit IA conservé mais HONNÊTE
  (copier le plan pour le retravailler avec une IA ou un collègue — l'app ne
  réimporte plus ce document). Import qui existe : carte JSON + reprise
  inter-trimestre.
- **Page 1** : « 7 étapes … et utiliser l'import / export » → reformulé
  (« et exporter ton plan »).
- **Page 6** : la famille d'activités ignore l'**Exposé** et les **5 nœuds
  d'enseignement explicite** (livrés 7-8 août) → astuce complétée.
- **Anderson (2026)** : confirmé, conservé.
- 📐 **Idée notée pour plus tard, PAS dans ce chantier** : Grégoire trouve
  l'idée d'un import « à rebours » (une IA écrit le plan, la carte se
  construit) intéressante mais jamais expérimentée. L'import MD est retiré ;
  si l'envie se confirme, c'est un chantier NEUF à instruire (BACKLOG à
  créer sur demande), pas une résurrection silencieuse.

## Lots

1. **CSS — l'échelle commune** : bloc « typographie des guides » unique
   (sélecteurs groupés `.planif-guide-corps, .guide-pedagogique-corps` +
   éléments), tailles explicites partout : corps 0.9rem, citation d'ouverture
   1rem italique, titres internes 0.95rem, astuce 0.85rem, référence 0.8rem.
   Deux modes vérifiés (variables seulement). Les doublons `astuce`/`ref` des
   deux familles rabattus sur les déclarations groupées.
2. **Glyphes** : ✓ / ! / ⚠ en texte stylé dans GUIDE_PAGES (fin des masques
   invisibles dans le guide).
3. **Contenu** : pages 1, 6, 7 (conclusion), 8 réécrites dans
   `GUIDE_PAGES`.
4. **Sentinelles** : la sentinelle des guides (som-pan-302) reste ; une
   sentinelle neuve verrouille (a) l'échelle groupée (les deux familles
   partagent les mêmes déclarations), (b) plus AUCUN masque `icone-inline`
   dans GUIDE_PAGES, (c) la page 8 ne cite plus la page morte ni l'import MD,
   (d) l'Exposé est entré page 6. Break-tests.
5. **Clôture** : rituel, release (minor — changement visible du guide),
   SESSION/BACKLOG/RELAIS, fusion `main`.

## Pièges

- ⚠ Les contenus des guides sont 100 % statiques (commentaire de sécurité en
  tête de guides-pedagogiques.js) — ne PAS y introduire de donnée utilisateur.
- ⚠ Ne pas renommer les classes dans les contenus SOM/PAN/SOLO/ACP/RàI : la
  fusion se fait au CSS (sélecteurs groupés), le HTML des pages ne bouge pas
  sauf le guide de la Carte (contenu revu de toute façon).
- ⚠ `mask-image` reste légitime AILLEURS (boutons d'aide etc.) — le retrait
  ne vise que les contenus du guide.
