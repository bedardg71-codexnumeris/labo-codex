# Rapport du lot `lot/menu-demo` — la démo dans le menu de l'en-tête (16 nov. 2026)

**Relais.** Branche `lot/menu-demo`, partie de `origin/main` (`5735b41e3`, 1.248.2). Arbre de travail :
`../labo-codex-menu-demo`. Consigne : le relais de Cowork du 16 nov. 2026, partie 2 (besoin dit par Grégoire à 11 h 29 ;
#1283 au backlog). Build : 1.248.2, `1116-1155`.
**Fait** : la ligne « Explorer la démo » du menu, qui devient « Quitter la démo » en démo ; les trois phrases de
l'aide ; le banc à 1180, 820 et 390 px et son break-test ; deux sentinelles réalignées ; Vitest complet.
**Reste** : la décision de mise en ligne (Grégoire). Ni fusion, ni release, ni changelog, par consigne.

---

## 1. Pourquoi l'entrée avait disparu

**Fait mesuré.** Le menu de l'en-tête n'a jamais porté la démo. L'entrée perdue est la case « Données démo » du bloc
« Aide » de l'accueil, retirée le 7 nov. 2026 par `d6357733c` (« l'accueil épuré ») avec tout le bloc : « Retirés :
« Utilitaires » et « Aide » (Ton codex, Nouveautés, cases Assistance et Données démo) ; « Explorer » appelle
activerModeDemo […] ; on sort par le bandeau. »
**Inférence.** Le retrait visait à épurer l'accueil ; le message ne dit rien contre une entrée ailleurs. Ce n'était
donc pas un refus d'une entrée au menu : le lot a continué.

## 2. Ce qui est livré

| Demande | Où | Jugé par |
|---|---|---|
| « Explorer la démo », même fonction que la porte (`explorerDonneesDemo`) | `index.html`, `#menu-demo-explorer` | banc WebKit, trois largeurs |
| En démo : « Quitter la démo », le geste du bandeau (`desactiverModeDemo`) | `index.html`, `#menu-demo-quitter` | idem |
| Une seule des deux lignes se voit | `styles.css` (classe `mode-demo` du body, posée par `afficherBandeauDemo`) | break-test rouge |
| En vue étendue seulement | rien à écrire : `css/vue-simple.css` masque déjà tout le menu sauf « Vue étendue » | banc, essai « vue simple » |
| L'icône (une boussole, au trait de 1,5 px comme « Assistance » et « Aide ») | `styles.css`, `.ico-demo` | captures relues, sombre et clair |
| L'aide | `index.html`, « Prendre en main l'application » et « Explorer la démonstration » | voir §3 |

Aucun JavaScript neuf : les deux lignes appellent des fonctions qui existaient. Les fichiers protégés de la navigation
(autorisés pour ce lot) n'ont pas été touchés.

## 3. Les mots que l'enseignant·e lit

- Le menu : **« Explorer la démo »**, **« Quitter la démo »** (les mots du relais ; le second est celui du bandeau).
- Aide, « Prendre en main l'application » : « **Données démo**, la ligne « Explorer la démo » du menu de l'en-tête, ou
  le bouton « Explorer », dans « À propos » de la page d'accueil : un cours fictif déjà configuré, à part de tes vraies
  données (voir « Explorer la démonstration »). »
- Aide, « Explorer la démonstration » : « La ligne « Explorer la démo », dans le menu de l'en-tête, ou le bouton
  « Explorer », dans « À propos » de la page d'accueil, ouvre un cours fictif, à part de tes vraies données, dans
  Suivi › Groupe ; le bandeau vert « Mode démonstration » reste au bas de l'écran. »
- Même carte, la sortie : « Pour en sortir : « Quitter la démo », dans le bandeau ou dans le même menu. Tes vraies
  données reviennent telles quelles. »

## 4. Ce que j'ai supposé

1. **La place de la ligne** : deuxième, entre « Assistance » et « Aide » (les deux façons d'apprendre l'application se
   suivent ; « Réglages » reste en dernier, correction de Grégoire du 7 nov.).
2. **Une icône neuve**, la boussole, la même pour les deux états. Les autres lignes en ont une ; sans elle, le mot
   n'était pas aligné.
3. **La troisième phrase de l'aide** (la sortie) : le relais demandait de dire que la démo *s'ouvre* par le menu ; j'ai
   aussi écrit qu'on en *sort* par lui, sans quoi la carte disait faux.
4. **La fenêtre d'aide « Données démo »** s'ouvre à la première entrée par le menu, comme par la porte : c'est la même
   fonction.
5. **Laissés tels quels** : la fenêtre d'aide « Données démo » (`js/accompagnement-contenu-popup.js`) dit encore « Pour
   en sortir, « Quitter la démo » dans le bandeau vert » : vrai, incomplet. *Issue : inscrire et continuer* si
   Grégoire veut la phrase alignée (ce sont ses mots).

**En vue simple** : non offerte, comme demandé. Une raison de l'offrir existerait (une personne en vue simple n'a
aucune entrée vers la démo, la porte de l'accueil étendu ne s'y voyant pas), mais la démo s'ouvre dans Suivi › Groupe,
que la vue simple n'a pas : il faudrait d'abord décider où elle atterrit. Non fait.

## 5. Vérifié, non vérifié

Un passage à la fois, au premier plan, un seul navigateur.

| Heure | Charge (1 min) | Mémoire libre | Passage | Résultat |
|---|---|---|---|---|
| 11 h 54 | 5,46 | 86 % | banc neuf `menu-demo` | 4 sur 4 |
| 11 h 55 | 4,69 | 85 % | break-test (règle `mode-demo` retirée de `styles.css`) | 3 rouges sur 4, rétabli |
| 11 h 55 | 4,06 | 85 % | captures du menu (1180 et 390, sombre et clair) | relues |
| 11 h 55 | 3,45 | 86 % | Vitest complet | 11 814 verts, 2 rouges attendus (les sentinelles de la liste du menu) |

| 11 h 57 | 4,94 | 84 % | les essais « menu » de `en-tete-epure` et de `parcours-1-et-2`, réalignés | 3 verts, 1 sauté (captures) |
| 11 h 58 | 4,56 | 84 % | `en-tete-epure` et `modal-soutien`, en entier | 10 verts, 1 sauté |
| 11 h 58 | 4,31 | 84 % | `vue-simple`, en entier | 47 sur 47 (2 min 48 s ; charge à 9,78 à la fin) |

Deux sentinelles (`sentinelle-en-tete-epure-2026-11-07`, `vue-simple`) et trois bancs (`en-tete-epure`,
`parcours-1-et-2`, `vue-simple`) verrouillaient la liste exacte des lignes du menu : réalignés, ils nomment maintenant
les deux lignes neuves et leurs gestes. Vitest complet rejoué par le crochet du push.

**Non vérifié** : Safari sur l'iPad et sur le téléphone (WebKit du Mac seulement) ; le reste de la suite Playwright
(joués : le banc neuf et les quatre bancs qui touchent le menu, pas les autres) ; la garde de l'import (T7) par cette
entrée (c'est celle d'`activerModeDemo`, inchangée, non rejouée).

**Tarir ou réparer** : source seule. Rien n'est écrit dans les données de personne.
