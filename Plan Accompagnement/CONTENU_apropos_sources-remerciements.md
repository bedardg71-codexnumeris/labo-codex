# Contenu — carte « Sources et remerciements » (page À propos)

**Date** : 6 juin 2026
**Destinataire** : Claude Code (intégration) + Grégoire (validation du texte)
**Où** : `index.html`, section `#reglages-a-propos` (l. ~9901). Insérer **après la carte
« Technologies »** (fin de la sous-section, juste avant le `</div>` qui ferme
`#reglages-a-propos`, l. ~10014) – une note de gratitude en clôture de page.

**Décisions Grégoire (6 juin)** : registre « remerciement + sources » ; nommage mixte
(blogues + personnes clés, CoP créditée collectivement) ; étendue minimale dans la carte
(les deux blogues + « et des ouvrages »), l'attribution nominative détaillée restant au bas
de chaque guide. Garde-fou anti-sur-attribution en dernière ligne.

**URL vérifiées (web, 6 juin 2026)** : Grading for Growth → `https://gradingforgrowth.com/` ;
CoP Pratiques alternatives de notation → `https://www.aqpc.qc.ca/fr/cop-pratiques_notation`.

> **À confirmer (Grégoire)** : si tu lis la CoP ailleurs que sur la page AQPC (p. ex. les
> récits sur `eductive.ca`), remplace le lien par celui que tu veux mettre en avant.

---

## Bloc à coller (style maison : `carte` / `carte-titre-bleu` / entités HTML)

```html
                    <!-- Sources et remerciements -->
                    <div class="carte">
                        <h3 class="carte-titre-bleu">Sources et remerciements</h3>
                        <p class="mt-10">Labo Codex doit beaucoup au travail d&rsquo;autres personnes. Les logiques de plusieurs fonctionnalit&eacute;s li&eacute;es &agrave; la notation, ainsi que les guides p&eacute;dagogiques int&eacute;gr&eacute;s, s&rsquo;inspirent de deux blogues que je tiens &agrave; saluer&nbsp;:</p>
                        <table class="table-collapse mt-10">
                            <tr>
                                <td class="td-bold-30-bleu">Grading for Growth</td>
                                <td class="ligne-separee-bleu">Robert Talbert et David Clark &mdash; <a href="https://gradingforgrowth.com/" target="_blank" rel="noopener noreferrer">gradingforgrowth.com</a><br>
                                    <span class="text-muted u-texte-09">Une r&eacute;f&eacute;rence majeure sur les pratiques de notation par standards et par sp&eacute;cifications.</span>
                                </td>
                            </tr>
                            <tr>
                                <td class="td-bold-bleu">Pratiques alternatives de notation</td>
                                <td class="ligne-separee-bleu">Communaut&eacute; de pratique du r&eacute;seau coll&eacute;gial qu&eacute;b&eacute;cois &mdash; Bruno Voisard, Caroline Cormier, Fran&ccedil;ois Arseneault-Hubert et leurs coll&egrave;gues &mdash; <a href="https://www.aqpc.qc.ca/fr/cop-pratiques_notation" target="_blank" rel="noopener noreferrer">aqpc.qc.ca</a><br>
                                    <span class="text-muted u-texte-09">Pour l&rsquo;adaptation de ces approches au contexte d&rsquo;ici.</span>
                                </td>
                            </tr>
                        </table>
                        <p class="text-muted mt-10">Ces pratiques s&rsquo;appuient aussi sur plusieurs ouvrages et articles de r&eacute;f&eacute;rence en &eacute;valuation, ainsi que sur le rapport du Conseil sup&eacute;rieur de l&rsquo;&eacute;ducation <em>&Eacute;valuer pour que &ccedil;a compte vraiment</em> (2018). Les sources pr&eacute;cises sont cit&eacute;es au bas de chaque guide concern&eacute;.</p>
                        <p class="text-muted mt-10 u-texte-09">L&rsquo;application s&rsquo;inspire de ces travaux&nbsp;; elle ne les repr&eacute;sente pas, et toute erreur d&rsquo;interpr&eacute;tation m&rsquo;appartient.</p>
                    </div>
```

## Notes d'intégration

- Classes réutilisées telles quelles depuis la page : `carte`, `carte-titre-bleu`,
  `table-collapse`, `td-bold-30-bleu`, `td-bold-bleu`, `ligne-separee-bleu`, `text-muted`,
  `mt-10`, `u-texte-09`. **Aucun CSS nouveau.**
- Liens externes : `target="_blank" rel="noopener noreferrer"`, comme le reste de la page.
- **CSP** : contenu statique, aucun script/handler inline. RAS.
- Tester clair/sombre + iPad. Commiter dans le **fil pédagogique** (avec les guides
  som/pan), pas avec le code C0.

## Variante si tu veux la liste nominative des ouvrages DANS la carte

(Au lieu du paragraphe « plusieurs ouvrages… ».) À n'utiliser que si tu préfères
expliciter – sinon la version minimale ci-dessus suffit, le détail étant déjà au bas des
guides :

> Susan Blum (*Ungrading*, 2020) · Linda Nilson (*Specifications Grading*) · Robert Talbert
> et David Clark (*Grading for Growth*, Routledge, 2023) · Girouard-Gagné et coll.
> (*Évaluer sans noter*, CRIRES, 2024) · Voisard, Cormier et Arseneault-Hubert
> (*Pédagogie collégiale*, 2024) · Conseil supérieur de l'éducation (*Évaluer pour que ça
> compte vraiment*, 2018).
