#!/usr/bin/env python3
"""
Audit SSOT auto-régénérable — Sprint A (22 mai 2026)

Scan js/*.js (hors _archives/) pour cartographier les écrivains et lecteurs
de chaque clé de stockage. Produit deux sorties :

  scripts/audit-ssot.json   — données brutes par clé (écrivains, lecteurs)
  scripts/audit-ssot.md     — synthèse Markdown lisible

Limitations connues (héritées de audit/reports/03-1-ssot.md §3.3) :
  - Les clés passées par variable opaque (const CLE_X = 'foo'; db.setSync(CLE_X, …))
    NE SONT PAS capturées. Sondage manuel requis pour ces cas.
  - L'audit est purement statique — un module peut écrire conditionnellement.
  - Périmètre js/ uniquement (pas tests/, pas Skills/).

Usage :
  python3 scripts/audit-ssot.py
  python3 scripts/audit-ssot.py --js-dir js --out-dir scripts

Sprint B : étendre ce script pour produire la cartographie complète 3.1.
"""

import argparse
import json
import re
import sys
from pathlib import Path
from collections import defaultdict

# Patterns d'écriture — un par "famille" d'API
WRITE_PATTERNS = [
    # db.setSync('key', ...) ou db.set('key', ...)
    (re.compile(r"\bdb\.(?:setSync|set)\s*\(\s*['\"]([^'\"]+)['\"]"), "db.set"),
    # db.setSync(cle('key'), ...) — namespacée par trimestre
    (re.compile(r"\bdb\.(?:setSync|set)\s*\(\s*cle\s*\(\s*['\"]([^'\"]+)['\"]"), "db.set+cle"),
    # localStorage.setItem('key', ...)
    (re.compile(r"\blocalStorage\.setItem\s*\(\s*['\"]([^'\"]+)['\"]"), "localStorage.setItem"),
    # localStorage.setItem(cle('key'), ...)
    (re.compile(r"\blocalStorage\.setItem\s*\(\s*cle\s*\(\s*['\"]([^'\"]+)['\"]"), "localStorage.setItem+cle"),
    # sauvegarderDonneesSelonMode('key', ...) — wrapper protégé anonymisation
    (re.compile(r"\bsauvegarderDonneesSelonMode\s*\(\s*['\"]([^'\"]+)['\"]"), "sauvegarderDonneesSelonMode"),
    # db.delete('key') — destructif, à signaler
    (re.compile(r"\bdb\.delete\s*\(\s*['\"]([^'\"]+)['\"]"), "db.delete"),
    # db.delete(cle('key'))
    (re.compile(r"\bdb\.delete\s*\(\s*cle\s*\(\s*['\"]([^'\"]+)['\"]"), "db.delete+cle"),
]

# Patterns de lecture
READ_PATTERNS = [
    (re.compile(r"\bdb\.(?:getSync|get)\s*\(\s*['\"]([^'\"]+)['\"]"), "db.get"),
    (re.compile(r"\bdb\.(?:getSync|get)\s*\(\s*cle\s*\(\s*['\"]([^'\"]+)['\"]"), "db.get+cle"),
    (re.compile(r"\blocalStorage\.getItem\s*\(\s*['\"]([^'\"]+)['\"]"), "localStorage.getItem"),
    (re.compile(r"\blocalStorage\.getItem\s*\(\s*cle\s*\(\s*['\"]([^'\"]+)['\"]"), "localStorage.getItem+cle"),
    (re.compile(r"\bobtenirDonneesSelonMode\s*\(\s*['\"]([^'\"]+)['\"]"), "obtenirDonneesSelonMode"),
]

# Patterns « génériques » — accès direct sans clé littérale, à signaler globalement
DESTRUCTIVE_GLOBAL = [
    (re.compile(r"\blocalStorage\.clear\s*\(\s*\)"), "localStorage.clear()"),
    (re.compile(r"\bdb\.clear\s*\(\s*\)"), "db.clear()"),
]

# Lignes à ignorer (commentaires purs ou strings d'exemple)
def is_commentary(line):
    stripped = line.lstrip()
    return stripped.startswith("//") or stripped.startswith("*") or stripped.startswith("#")


def scan_file(path, writes, reads, destructives, generic_writes_count, generic_reads_count):
    """Scan a single .js file, populating writes/reads dicts and counters."""
    try:
        with open(path, encoding="utf-8") as fh:
            for lineno, raw in enumerate(fh, start=1):
                if is_commentary(raw):
                    continue
                # Comptage générique pour fichiers qui passent toujours par variable
                # (sondage agrégé : 1 hit = présence d'au moins un accès db.* dans le fichier)
                if "db.setSync" in raw or "db.set(" in raw:
                    generic_writes_count[path] += 1
                if "db.getSync" in raw or "db.get(" in raw:
                    generic_reads_count[path] += 1

                for pat, api in WRITE_PATTERNS:
                    for m in pat.finditer(raw):
                        key = m.group(1)
                        writes[key].append({"file": str(path), "line": lineno, "api": api})

                for pat, api in READ_PATTERNS:
                    for m in pat.finditer(raw):
                        key = m.group(1)
                        reads[key].append({"file": str(path), "line": lineno, "api": api})

                for pat, label in DESTRUCTIVE_GLOBAL:
                    if pat.search(raw):
                        destructives.append({"file": str(path), "line": lineno, "op": label})
    except (UnicodeDecodeError, OSError) as exc:
        print(f"  ! skip {path}: {exc}", file=sys.stderr)


def collect_files(js_dir):
    """Yield .js files under js_dir, skipping _archives/."""
    for path in sorted(js_dir.rglob("*.js")):
        rel = path.relative_to(js_dir.parent)
        if "_archives" in rel.parts:
            continue
        yield path


def aggregate_by_file(entries):
    """Group write/read entries by file → list of lines."""
    by_file = defaultdict(list)
    for entry in entries:
        by_file[entry["file"]].append(entry["line"])
    return {f: sorted(set(lines)) for f, lines in by_file.items()}


def build_summary(writes, reads, destructives, generic_writes, generic_reads, repo_root):
    """Build a structured summary suitable for JSON serialization."""
    all_keys = sorted(set(writes.keys()) | set(reads.keys()))
    summary = {
        "meta": {
            "tool": "scripts/audit-ssot.py",
            "version": "1.0.0",
            "limitations": [
                "Clés passées par variable opaque non capturées (héritage 03-1-ssot §3.3).",
                "Audit statique — pas de runtime, pas de couplage conditionnel.",
                "Périmètre js/ uniquement.",
            ],
        },
        "keys": [],
        "destructive_operations": destructives,
        "files_with_generic_db_writes": [
            {"file": str(f.relative_to(repo_root)), "hits": n}
            for f, n in sorted(generic_writes.items(), key=lambda kv: -kv[1])
        ],
    }

    for key in all_keys:
        writers_by_file = aggregate_by_file(writes.get(key, []))
        readers_by_file = aggregate_by_file(reads.get(key, []))
        n_writers = len(writers_by_file)
        n_readers = len(readers_by_file)
        # Heuristique de statut SSOT (cohérent avec PROMPT.md §3.1 audit annuel)
        if n_writers == 0:
            status = "no-literal-writer"  # probablement via variable
        elif n_writers == 1:
            status = "ssot-ok"
        elif n_writers <= 3:
            status = "violation-mineure"
        else:
            status = "violation-critique"
        summary["keys"].append({
            "key": key,
            "writers_count": n_writers,
            "readers_count": n_readers,
            "writers": writers_by_file,
            "readers": readers_by_file,
            "status": status,
        })
    return summary


def format_path(p, repo_root):
    return str(Path(p).relative_to(repo_root)) if Path(p).is_absolute() else p


def render_markdown(summary, repo_root):
    """Render a human-readable Markdown report."""
    lines = []
    lines.append("# Audit SSOT — cartographie écrivains/lecteurs par clé")
    lines.append("")
    lines.append("Généré par `scripts/audit-ssot.py`. Re-lancer pour régénérer.")
    lines.append("")
    lines.append("## Limitations")
    lines.append("")
    for lim in summary["meta"]["limitations"]:
        lines.append(f"- {lim}")
    lines.append("")
    lines.append("## Synthèse")
    lines.append("")

    keys = summary["keys"]
    n_total = len(keys)
    n_critique = sum(1 for k in keys if k["status"] == "violation-critique")
    n_mineure = sum(1 for k in keys if k["status"] == "violation-mineure")
    n_ok = sum(1 for k in keys if k["status"] == "ssot-ok")
    n_no_lit = sum(1 for k in keys if k["status"] == "no-literal-writer")
    lines.append(f"- **{n_total} clés détectées** (avec au moins un accès littéral)")
    lines.append(f"- **{n_ok} clés SSOT-OK** (1 écrivain littéral)")
    lines.append(f"- **{n_mineure} clés en violation mineure** (2-3 écrivains)")
    lines.append(f"- **{n_critique} clés en violation critique** (≥ 4 écrivains)")
    lines.append(f"- **{n_no_lit} clés sans écrivain littéral** (accès via variable opaque, à confirmer manuellement)")
    lines.append("")

    if summary["destructive_operations"]:
        lines.append("## Opérations destructives globales")
        lines.append("")
        lines.append("| Fichier | Ligne | Opération |")
        lines.append("|---|---:|---|")
        for d in summary["destructive_operations"]:
            f = format_path(d["file"], repo_root)
            lines.append(f"| `{f}` | {d['line']} | `{d['op']}` |")
        lines.append("")

    # Violations critiques
    crit = [k for k in keys if k["status"] == "violation-critique"]
    if crit:
        lines.append("## Violations critiques (≥ 4 écrivains)")
        lines.append("")
        lines.append("| Clé | # écrivains | Modules écrivains |")
        lines.append("|---|---:|---|")
        for k in sorted(crit, key=lambda x: -x["writers_count"]):
            writers = ", ".join(
                f"`{Path(f).name}`" for f in sorted(k["writers"].keys())
            )
            lines.append(f"| `{k['key']}` | {k['writers_count']} | {writers} |")
        lines.append("")

    mineure = [k for k in keys if k["status"] == "violation-mineure"]
    if mineure:
        lines.append("## Violations mineures (2-3 écrivains)")
        lines.append("")
        lines.append("| Clé | # écrivains | Modules écrivains |")
        lines.append("|---|---:|---|")
        for k in sorted(mineure, key=lambda x: -x["writers_count"]):
            writers = ", ".join(
                f"`{Path(f).name}`" for f in sorted(k["writers"].keys())
            )
            lines.append(f"| `{k['key']}` | {k['writers_count']} | {writers} |")
        lines.append("")

    ssot_ok = [k for k in keys if k["status"] == "ssot-ok"]
    if ssot_ok:
        lines.append("## Patterns exemplaires (1 écrivain littéral)")
        lines.append("")
        lines.append("| Clé | Écrivain | # lecteurs |")
        lines.append("|---|---|---:|")
        for k in sorted(ssot_ok, key=lambda x: x["key"]):
            writer = next(iter(k["writers"].keys()))
            lines.append(
                f"| `{k['key']}` | `{Path(writer).name}` | {k['readers_count']} |"
            )
        lines.append("")

    no_lit = [k for k in keys if k["status"] == "no-literal-writer"]
    if no_lit:
        lines.append("## Clés sans écrivain littéral détecté")
        lines.append("")
        lines.append(
            "_Ces clés ont des lecteurs littéraux mais aucun écrivain littéral._"
            " L'écriture passe probablement par une variable (`const CLE_X = 'foo'`)"
            " ou par `cle('xxx')` dans un fichier non vu par le scan."
        )
        lines.append("")
        lines.append("| Clé | # lecteurs | Modules lecteurs |")
        lines.append("|---|---:|---|")
        for k in sorted(no_lit, key=lambda x: x["key"]):
            readers = ", ".join(
                f"`{Path(f).name}`" for f in sorted(k["readers"].keys())
            )
            lines.append(f"| `{k['key']}` | {k['readers_count']} | {readers} |")
        lines.append("")

    # Annexe : top 10 fichiers par nombre d'accès db.* (sondage générique)
    top_writers = summary["files_with_generic_db_writes"][:10]
    if top_writers:
        lines.append("## Annexe — Top 10 fichiers par densité d'écritures `db.*`")
        lines.append("")
        lines.append("Comptage générique (toutes formes d'écriture, y compris via variable).")
        lines.append("")
        lines.append("| Fichier | # hits `db.setSync`/`db.set` |")
        lines.append("|---|---:|")
        for entry in top_writers:
            lines.append(f"| `{entry['file']}` | {entry['hits']} |")
        lines.append("")

    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description="Audit SSOT auto-régénérable")
    parser.add_argument("--js-dir", default="js", help="Répertoire JS à scanner")
    parser.add_argument("--out-dir", default="scripts", help="Répertoire de sortie")
    args = parser.parse_args()

    repo_root = Path.cwd()
    js_dir = (repo_root / args.js_dir).resolve()
    out_dir = (repo_root / args.out_dir).resolve()

    if not js_dir.is_dir():
        print(f"Erreur : {js_dir} n'existe pas ou n'est pas un dossier.", file=sys.stderr)
        sys.exit(1)
    out_dir.mkdir(parents=True, exist_ok=True)

    writes = defaultdict(list)
    reads = defaultdict(list)
    destructives = []
    generic_writes = defaultdict(int)
    generic_reads = defaultdict(int)

    n_files = 0
    for path in collect_files(js_dir):
        scan_file(path, writes, reads, destructives, generic_writes, generic_reads)
        n_files += 1

    print(f"Scanné {n_files} fichiers sous {js_dir.relative_to(repo_root)}/")
    print(f"  écrivains littéraux : {sum(len(v) for v in writes.values())} hits sur {len(writes)} clés distinctes")
    print(f"  lecteurs littéraux  : {sum(len(v) for v in reads.values())} hits sur {len(reads)} clés distinctes")
    if destructives:
        print(f"  opérations destructives globales : {len(destructives)}")

    summary = build_summary(writes, reads, destructives, generic_writes, generic_reads, repo_root)

    json_path = out_dir / "audit-ssot.json"
    md_path = out_dir / "audit-ssot.md"

    with open(json_path, "w", encoding="utf-8") as fh:
        json.dump(summary, fh, ensure_ascii=False, indent=2)
    with open(md_path, "w", encoding="utf-8") as fh:
        fh.write(render_markdown(summary, repo_root))

    print(f"\nÉcrit :")
    print(f"  {json_path.relative_to(repo_root)}")
    print(f"  {md_path.relative_to(repo_root)}")


if __name__ == "__main__":
    main()
