#!/usr/bin/env python3
"""Audit de la duplication CSS entre le <style> inline d'index.html et styles.css.

Sortie : Rapports/audit-duplication-css-2026-06-16.md (rapport classifié).

Parser naïf adapté à un CSS plat sans nesting (vanilla), supportant @media et
@supports comme conteneurs (le sélecteur garde son préfixe @media-context).

Approche :
  1. Extraire le bloc <style>...</style> d'index.html.
  2. Parser ce bloc + styles.css en (sélecteur, bloc-de-propriétés) avec
     position (fichier:ligne).
  3. Normaliser : minuscules, whitespace réduit, ordre des propriétés
     préservé (changer l'ordre peut altérer la cascade en cas de répétition).
  4. Catégoriser :
       - identique  : même sélecteur, même bloc normalisé (à 1 caractère près)
       - divergent  : même sélecteur, bloc différent (override potentiel)
       - inline-seul / externe-seul
  5. Émettre le rapport markdown.
"""
from __future__ import annotations

import hashlib
import re
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

RACINE = Path(__file__).resolve().parents[2]
INDEX = RACINE / "index.html"
STYLES = RACINE / "styles.css"
SORTIE = RACINE / "Rapports" / "audit-duplication-css-2026-06-16.md"

# Bornes du <style> inline d'index.html
INLINE_DEBUT_LIGNE = 16
INLINE_FIN_LIGNE = 3825


@dataclass
class Regle:
    selecteur: str        # sélecteur normalisé (trim, whitespace réduit)
    contexte: str         # ex. "@media (max-width: 1024px)" ou ""
    proprietes_brutes: str  # contenu entre { et } brut (avec commentaires retirés)
    proprietes_normalisees: str  # idem, whitespace réduit
    hash_normalise: str   # md5(proprietes_normalisees) — clé d'égalité
    fichier: str
    ligne: int            # ligne de début du sélecteur

    def clef(self) -> str:
        return f"{self.contexte}||{self.selecteur}"


def retirer_commentaires(src: str) -> str:
    """Retire les commentaires C-style /* ... */ sans toucher au reste."""
    return re.sub(r"/\*.*?\*/", "", src, flags=re.DOTALL)


def normaliser_ws(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def parser_css(source: str, fichier: str, decalage_lignes: int = 0) -> list[Regle]:
    """Parse un texte CSS plat, retourne la liste des règles.

    Gère @media / @supports comme contextes (un seul niveau de nesting),
    en associant chaque règle interne au contexte courant. Ne fait PAS
    de matching récursif — c'est suffisant pour le projet (CSS vanilla).
    """
    # On va parser caractère par caractère pour suivre les accolades.
    regles: list[Regle] = []
    contexte_courant = ""
    contexte_profondeur_ouverture: int | None = None  # profondeur où on est entré

    i = 0
    n = len(source)
    profondeur = 0
    debut_selecteur = 0
    while i < n:
        c = source[i]
        if c == "{":
            # Tout ce qui précède est un sélecteur (ou une @-rule).
            tete = source[debut_selecteur:i]
            tete_propre = retirer_commentaires(tete)
            tete_norm = normaliser_ws(tete_propre)

            if tete_norm.startswith("@media") or tete_norm.startswith("@supports") \
                    or tete_norm.startswith("@keyframes"):
                # On entre dans un conteneur. Mémorise le contexte.
                contexte_courant = tete_norm
                contexte_profondeur_ouverture = profondeur
                profondeur += 1
                i += 1
                debut_selecteur = i
                continue

            # Sinon, on est sur une règle classique : chercher la } de fermeture
            # à la même profondeur.
            profondeur_regle = profondeur + 1
            j = i + 1
            while j < n and profondeur_regle > profondeur:
                cj = source[j]
                if cj == "{":
                    profondeur_regle += 1
                elif cj == "}":
                    profondeur_regle -= 1
                j += 1
            # j pointe juste après la } finale
            proprietes_brutes = retirer_commentaires(source[i + 1:j - 1])
            proprietes_norm = normaliser_ws(proprietes_brutes)
            ligne = source[:debut_selecteur].count("\n") + 1 + decalage_lignes
            for sel in tete_norm.split(","):
                sel_t = sel.strip()
                if not sel_t:
                    continue
                regles.append(Regle(
                    selecteur=sel_t,
                    contexte=contexte_courant,
                    proprietes_brutes=proprietes_brutes,
                    proprietes_normalisees=proprietes_norm,
                    hash_normalise=hashlib.md5(proprietes_norm.encode()).hexdigest(),
                    fichier=fichier,
                    ligne=ligne,
                ))
            i = j
            debut_selecteur = i
        elif c == "}":
            profondeur -= 1
            if contexte_profondeur_ouverture is not None and profondeur == contexte_profondeur_ouverture:
                contexte_courant = ""
                contexte_profondeur_ouverture = None
            i += 1
            debut_selecteur = i
        else:
            i += 1
    return regles


def extraire_inline_index() -> tuple[str, int]:
    """Retourne (contenu_css, ligne_de_début) du bloc <style> inline."""
    lignes = INDEX.read_text(encoding="utf-8").splitlines()
    # Le contenu CSS commence à la ligne suivant <style>
    debut = INLINE_DEBUT_LIGNE  # ligne du <style>, 1-indexed
    fin = INLINE_FIN_LIGNE       # ligne du </style>
    # Extraire entre <style> et </style>, exclusivement
    contenu = "\n".join(lignes[debut:fin - 1])  # 0-indexed slice
    # Le décalage de lignes pour reporter une position dans index.html
    # correspond à la ligne du <style> elle-même.
    return contenu, debut


def grouper_par_clef(regles: Iterable[Regle]) -> dict[str, list[Regle]]:
    g: dict[str, list[Regle]] = defaultdict(list)
    for r in regles:
        g[r.clef()].append(r)
    return g


def rendre_position(r: Regle) -> str:
    """ex: index.html:1346"""
    return f"{r.fichier}:{r.ligne}"


def main() -> int:
    print("Extraction du bloc inline d'index.html...", file=sys.stderr)
    contenu_inline, ligne_debut = extraire_inline_index()
    regles_inline = parser_css(contenu_inline, "index.html", decalage_lignes=ligne_debut)
    print(f"  -> {len(regles_inline)} règles inline", file=sys.stderr)

    print("Extraction de styles.css...", file=sys.stderr)
    contenu_styles = STYLES.read_text(encoding="utf-8")
    regles_styles = parser_css(contenu_styles, "styles.css")
    print(f"  -> {len(regles_styles)} règles styles.css", file=sys.stderr)

    # Indexer chaque source par clef (contexte || sélecteur).
    inline_par_clef = grouper_par_clef(regles_inline)
    styles_par_clef = grouper_par_clef(regles_styles)

    clefs_inline = set(inline_par_clef.keys())
    clefs_styles = set(styles_par_clef.keys())

    clefs_communes = clefs_inline & clefs_styles
    clefs_inline_seul = clefs_inline - clefs_styles
    clefs_externe_seul = clefs_styles - clefs_inline

    # Pour les clefs communes : décomposer identiques vs divergentes.
    # On compare le PREMIER bloc de chaque côté (cas usuel = 1 règle par clef).
    # En cas de plusieurs occurrences du même sélecteur (ce qui arrive avec
    # les overrides modes/responsive sans @media), on considère :
    #   - identique si AU MOINS un bloc inline matche AU MOINS un bloc externe
    #   - divergent sinon
    identiques: list[tuple[str, Regle, Regle]] = []
    divergents: list[tuple[str, list[Regle], list[Regle]]] = []
    for clef in sorted(clefs_communes):
        in_blocs = inline_par_clef[clef]
        st_blocs = styles_par_clef[clef]
        in_hashes = {b.hash_normalise: b for b in in_blocs}
        st_hashes = {b.hash_normalise: b for b in st_blocs}
        hashes_communs = set(in_hashes.keys()) & set(st_hashes.keys())
        if hashes_communs:
            # On rend le premier match comme exemple.
            h = next(iter(hashes_communs))
            identiques.append((clef, in_hashes[h], st_hashes[h]))
        else:
            divergents.append((clef, in_blocs, st_blocs))

    # Quelques tris utiles
    def taille_bloc(r: Regle) -> int:
        return len(r.proprietes_normalisees)

    inline_seul_regles = [r for c in clefs_inline_seul for r in inline_par_clef[c]]
    externe_seul_regles = [r for c in clefs_externe_seul for r in styles_par_clef[c]]
    inline_seul_regles.sort(key=taille_bloc, reverse=True)
    externe_seul_regles.sort(key=taille_bloc, reverse=True)

    # Stats globales
    total_inline = len(regles_inline)
    total_styles = len(regles_styles)
    n_ident = len(identiques)
    n_div = len(divergents)
    n_in_seul = len(inline_seul_regles)
    n_ex_seul = len(externe_seul_regles)

    # ── Génération du rapport markdown ────────────────────────────────────
    SORTIE.parent.mkdir(parents=True, exist_ok=True)
    lignes_md: list[str] = []
    p = lignes_md.append

    p("# Audit duplication CSS — index.html ↔ styles.css")
    p("")
    p("**Date** : 2026-06-16 (re-génération ÉTAPE 0 — plage inline corrigée 16-3825)")
    p(f"**Ticket** : BACKLOG #297")
    p("**Mode** : Audit lecture seule. Aucune modification de code.")
    p("**Script** : `Rapports/_outils/audit-duplication-css.py`")
    p("")
    p("---")
    p("")
    p("## 1. Méthode")
    p("")
    p(f"- Bloc inline extrait : lignes {INLINE_DEBUT_LIGNE}–{INLINE_FIN_LIGNE} d'`index.html`.")
    p("- Parser naïf (CSS vanilla sans nesting) qui distingue les contextes "
      "`@media` / `@supports` / `@keyframes` (un sélecteur dans un `@media`")
    p("  est considéré comme une clef distincte de la même règle hors `@media`).")
    p("- Comparaison sur **blocs de propriétés normalisés** : whitespace "
      "réduit, commentaires retirés. L'ordre des propriétés est préservé "
      "(deux blocs avec le même contenu mais ordonné différemment sont "
      "considérés comme divergents — ce qui est correct pour CSS où l'ordre "
      "peut affecter le cascade en cas de redéfinition de la même propriété).")
    p("- Catégories :")
    p("  - **Identiques** : même sélecteur, même bloc normalisé → duplication "
      "pure, candidate à retrait dans un des deux fichiers.")
    p("  - **Divergentes** : même sélecteur, bloc différent → l'un surcharge "
      "l'autre. Source de bugs silencieux (cas du `.contenu min-height` du 28 mai matin).")
    p("  - **Inline seulement** / **Externe seulement** : pas de doublon, "
      "OK en l'état.")
    p("")
    p("---")
    p("")
    p("## 2. Statistiques globales")
    p("")
    p("| Indicateur | Valeur |")
    p("|---|---:|")
    p(f"| Règles dans le `<style>` inline d'index.html | {total_inline} |")
    p(f"| Règles dans `styles.css` | {total_styles} |")
    p(f"| **Sélecteurs communs (mêmes selecteur + contexte)** | {len(clefs_communes)} |")
    p(f"| → dont **identiques** (mêmes propriétés) | {n_ident} |")
    p(f"| → dont **divergentes** (overrides potentiels) | {n_div} |")
    p(f"| Sélecteurs inline seulement | {n_in_seul} |")
    p(f"| Sélecteurs externe seulement | {n_ex_seul} |")
    p("")
    if total_inline > 0:
        pourcent_doublon = 100.0 * len(clefs_communes) / total_inline
        p(f"**Lecture** : {len(clefs_communes)} sélecteurs sur {total_inline} "
          f"du bloc inline ({pourcent_doublon:.1f}%) existent aussi dans `styles.css`.")
        p("")

    p("---")
    p("")
    p("## 3. Règles DIVERGENTES — priorité haute")
    p("")
    p("Ces sélecteurs ont des propriétés différentes entre les deux sources. "
      "Selon l'ordre de chargement (`<style>` inline avant styles.css externe), "
      "**c'est styles.css qui gagne** sur tout ce qu'il redéfinit, mais le "
      "inline est utilisé pour ce que styles.css ne réécrit pas. Source du "
      "bug `.contenu min-height: 500px` non retiré du 28 mai matin.")
    p("")
    if not divergents:
        p("_Aucune divergence détectée._")
    else:
        p(f"**Total : {n_div} sélecteurs divergents.**")
        p("")
        p("### 3.1 Échantillon des 30 premières divergences")
        p("")
        p("| # | Sélecteur (contexte) | Inline | Externe | Δ taille |")
        p("|---|---|---|---|---:|")
        for i, (clef, in_blocs, st_blocs) in enumerate(divergents[:30], 1):
            sel = clef.replace("||", " // ")
            pos_in = rendre_position(in_blocs[0])
            pos_st = rendre_position(st_blocs[0])
            t_in = len(in_blocs[0].proprietes_normalisees)
            t_st = len(st_blocs[0].proprietes_normalisees)
            delta = abs(t_st - t_in)
            p(f"| {i} | `{sel}` | {pos_in} | {pos_st} | {delta} |")
        if n_div > 30:
            p("")
            p(f"_(... {n_div - 30} divergences supplémentaires, "
              "voir Section 6 pour la liste complète des sélecteurs.)_")

    p("")
    p("### 3.2 Diff détaillé des 10 divergences les plus volumineuses")
    p("")
    p("Pour aider la triage : pour chaque divergence parmi les 10 plus volumineuses, "
      "on montre le bloc inline et le bloc externe côte à côte (propriétés "
      "normalisées). Permet d'identifier en un coup d'œil les **valeurs "
      "réellement divergentes** vs les ajouts purs.")
    p("")
    div_par_taille = sorted(
        divergents,
        key=lambda t: max(len(t[1][0].proprietes_normalisees), len(t[2][0].proprietes_normalisees)),
        reverse=True,
    )
    for i, (clef, in_blocs, st_blocs) in enumerate(div_par_taille[:10], 1):
        sel = clef.replace("||", " // ")
        r_in = in_blocs[0]
        r_st = st_blocs[0]
        p(f"#### {i}. `{sel}`")
        p("")
        p(f"- **Inline** ({rendre_position(r_in)}) — {len(r_in.proprietes_normalisees)} octets")
        p("")
        p("```css")
        p(r_in.proprietes_normalisees)
        p("```")
        p("")
        p(f"- **Externe** ({rendre_position(r_st)}) — {len(r_st.proprietes_normalisees)} octets")
        p("")
        p("```css")
        p(r_st.proprietes_normalisees)
        p("```")
        p("")
    p("---")
    p("")
    p("## 4. Règles IDENTIQUES — duplication pure, candidates à retrait")
    p("")
    p("Ces sélecteurs ont strictement les mêmes propriétés des deux côtés. "
      "Retirer ces règles de l'un des deux fichiers ne change aucun "
      "comportement de rendu (modulo l'ordre de chargement vs cascade). "
      "Le mécanisme « inline d'abord, externe ensuite » garantit que la "
      "version externe est toujours appliquée si elle est identique.")
    p("")
    if not identiques:
        p("_Aucune identité détectée._")
    else:
        p(f"**Total : {n_ident} sélecteurs identiques.**")
        p("")
        p("### 4.1 Échantillon des 30 plus volumineuses")
        p("")
        ident_par_taille = sorted(identiques, key=lambda t: len(t[1].proprietes_normalisees), reverse=True)
        p("| # | Sélecteur (contexte) | Inline | Externe | Octets bloc |")
        p("|---|---|---|---|---:|")
        for i, (clef, r_in, r_st) in enumerate(ident_par_taille[:30], 1):
            sel = clef.replace("||", " // ")
            p(f"| {i} | `{sel}` | {rendre_position(r_in)} | {rendre_position(r_st)} | {len(r_in.proprietes_normalisees)} |")
        if n_ident > 30:
            p("")
            p(f"_(... {n_ident - 30} identités supplémentaires.)_")

    p("")
    p("---")
    p("")
    p("## 5. Recommandation par catégorie")
    p("")
    p("### 5.1 Pour les règles IDENTIQUES")
    p("")
    p("Trois options.")
    p("")
    p("- **(a) Retirer de l'inline, garder dans styles.css** → réduit la "
      "taille du HTML envoyé, l'app reste rendue identique tant que "
      "styles.css est chargé. **Risque résiduel** : si styles.css est "
      "perdu (cache invalidé en pleine session, file://, etc.), ces "
      "règles disparaissent. Acceptable pour les règles non critiques "
      "(profondes dans l'arbre UI). À éviter pour les règles de bandeau, "
      "navigation principale, accueil — celles qui définissent le "
      "premier rendu visible.")
    p("- **(b) Retirer de styles.css, garder dans l'inline** → cohérent "
      "avec une stratégie « inline = source unique ». Mais alors styles.css "
      "perd l'historique de ces règles et il devient plus difficile de les "
      "auditer hors index.html. Non recommandé.")
    p("- **(c) Garder les deux et documenter** → la convention actuelle. "
      "Risque de divergence silencieuse confirmée par le bug du 28 mai. "
      "Acceptable si on ajoute une discipline (toute modification d'une "
      "règle dupliquée doit toucher les deux fichiers).")
    p("")
    p("**Recommandation par défaut** : (a) pour les règles **profondes** "
      "(modales, sous-sections, composants non-above-the-fold), (c) pour "
      "les règles **critiques** (variables `:root`, `body`, `.bandeau-*`, "
      "navigation principale).")
    p("")
    p("### 5.2 Pour les règles DIVERGENTES")
    p("")
    p("Chacune est un **piège potentiel**. À traiter cas par cas :")
    p("")
    p("- Lire les deux versions. Décider laquelle est correcte.")
    p("- Retirer celle qui est obsolète. Acquérir une source de vérité unique.")
    p("- Si les deux servent intentionnellement (override délibéré), "
      "ajouter un commentaire en BOUT de chaque définition (« cf. autre "
      "définition dans index.html:NNNN »).")
    p("")
    p("### 5.3 Convention à inscrire en tête du bloc `<style>` inline")
    p("")
    p("Une fois l'audit traité, ajouter en tête du bloc inline un encart "
      "explicite, ex. :")
    p("")
    p("```html")
    p("<style>")
    p("/* ============================================================")
    p("   CSS critique inliné délibérément pour mitiger Safari file://")
    p("   (cache CSS externe non invalidé après bump build).")
    p("")
    p("   Convention :")
    p("   - Variables :root → inline (chargement immédiat)")
    p("   - Mises en page initiales (bandeau, nav, accueil) → inline")
    p("   - Règles profondes (modales, panels) → styles.css UNIQUEMENT")
    p("")
    p("   Toute règle dupliquée DOIT exister à l'identique des deux côtés.")
    p("   ============================================================ */")
    p("```")
    p("")
    p("---")
    p("")
    p("## 6. Annexe — Liste complète des divergences")
    p("")
    if not divergents:
        p("_Aucune divergence._")
    else:
        p("| # | Sélecteur | Contexte | Inline | Externe |")
        p("|---|---|---|---|---|")
        for i, (clef, in_blocs, st_blocs) in enumerate(divergents, 1):
            sep = clef.split("||")
            ctx = sep[0] if len(sep) > 1 and sep[0] else "_(global)_"
            sel = sep[-1]
            p(f"| {i} | `{sel}` | `{ctx}` | {rendre_position(in_blocs[0])} | {rendre_position(st_blocs[0])} |")

    p("")
    p("---")
    p("")
    p("_Rapport généré automatiquement par "
      "`Rapports/_outils/audit-duplication-css.py`._")

    SORTIE.write_text("\n".join(lignes_md), encoding="utf-8")
    print(f"Rapport écrit : {SORTIE}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
