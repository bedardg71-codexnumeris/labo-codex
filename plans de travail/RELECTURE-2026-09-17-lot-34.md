# Relecture croisée du lot 34 (#898, `1.142.31`) — par Cowork

> Écrite le 17 septembre 2026, 15h31 (Toronto), par relecture PAR EXÉCUTION dans un clone jetable, pendant que Claude Code écrit le lot #912. Commit relu : `cc30a3b1`.
> ⮕ **À porter en tête de la section 1.142.31 de `RELAIS.md`** par le prochain lot qui passe (je n'écris pas dans `RELAIS.md` pendant qu'une session code).

## Verdict : VERT, avec UN trou de preuve

Banc : clone `--shared` de `main`, `checkout cc30a3b1`, `npm install` neuf côté Linux. Témoin vert : `sentinelle-898-echelle-a-l-adoption.test.js` (39) + `sentinelle-745-exclu-hors-des-moyennes-comportement.test.js` (10) = **49 essais verts**.

Cinq mutations posées, **autres que celles de l'auteur** (par `mut.py` hors du dépôt : refus si le motif n'apparaît pas exactement une fois, relecture après écriture, `git checkout -- js` entre chaque) :

| # | Mutation | Verdict |
|---|---|---|
| C1 | `obtenirEchellesOffertesAdoption` : filtre `dansBibliotheque !== false` retiré (les échelles retirées sont offertes) | **ROUGE** (7) |
| C2 | même fonction : `db.getSync('echellesTemplates')` **nu**, sans `cle()` — le namespace de trimestre sauté | **ROUGE** (19) |
| C3 | `ajouterPratiqueALaSelection` : `demanderEchelleAdoption(configSource)` au lieu de `demanderEchelleAdoption(enBase || configSource)` | ⚠ **SURVIVANTE** |
| C5 | `demanderEchelleAdoption` : clause « la valeur rendue doit être une échelle OFFERTE » retirée | **ROUGE** (2) |
| C9 | témoin : la phrase de Grégoire modifiée (« Choisis-la : » → « Choisis : ») | **ROUGE** (4) |

## Le trou : C3 — la SOURCE de la question n'est pas jugée

**Ce n'est pas une équivalence, c'est un trou** — mesuré par un essai jetable, pas inféré. Le cas que le banc ne sème pas : **une pratique Standards RETIRÉE de la sélection qui porte DÉJÀ son échelle**, posée à l'éditeur après son adoption. C.4 sème la même pratique **sans** échelle ; aucun essai ne sème la variante avec.

- Code livré : la question porte sur `enBase` → `modeleDemandeEchelle` faux → **aucune question**, la pratique revient avec son échelle. Juste.
- Muté : la question porte sur le gabarit → **une question est posée**, Grégoire choisit une échelle, et la garde du point d'écriture (`if (modeleDemandeEchelle(existante))`) la refuse : **le choix n'est pas écrit**. Une modale pour rien.

Essai qui ferme le trou (vert sur le code livré, rouge sur la mutation), à poser dans la sentinelle par le prochain lot qui passe par `pratiques-gestion.js`, **sans release** :

```js
it('une pratique Standards RETIRÉE qui porte DÉJÀ son échelle : aucune question, et elle garde son échelle', async () => {
    const retiree = { id: 'STD-n-recents', nom: 'N plus récentes', type: 'standards', dansBibliotheque: false,
        configuration: { echelleId: 'E2', portfolio: { methodeSelection: 'recents', nombreARetenir: 5, minimumCompletion: 5, nombreTotal: 10 } } };
    const b = monter(jeuSTD(), { pratiques: [retiree], reponse: () => 'E1' });
    await b.win.ajouterPratiqueALaSelection('STD-n-recents');
    expect(b.questions).toHaveLength(0);
    expect(pratiques(b)[0].configuration.echelleId).toBe('E2');
});
```

## Ce que j'ai vérifié en plus, et qui tient

- **Parité de lecture avec le moteur** : `modeleDemandeEchelle` lit exactement les quatre mêmes portes que `construireConfigComplete` (`config.echelle`, racine `echelle`, `configuration.echelleId`, `config.echelleId`). Ni l'un ni l'autre ne lit `configuration.echelle` : cohérent, pas un écart.
- **La copie** : `poserEchelleAdoption` remplace `configuration` par un objet neuf (`Object.assign({}, ...)`) — le gabarit n'est pas muté par cette voie. Le spread superficiel de `{...configSource}` partage les AUTRES sous-objets avec le gabarit, mais il est antérieur au lot : **niveau 3, commenté ici, pas de fiche**.

## Une trouvaille, sans fiche (règle d'entrée du 24 août : aucun symptôme vécu)

Deux clics rapides sur « Ajouter » : la question vit HORS de la file `db.modifier` (la garde de #522 ne la couvre pas). La seconde modale s'ouvre, Grégoire choisit, puis l'écriture rend « déjà » et le choix est perdu. Sans conséquence sur les données. **À inscrire seulement si le cas se vit.**
