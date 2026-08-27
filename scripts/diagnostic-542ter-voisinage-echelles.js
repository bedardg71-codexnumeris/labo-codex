/* ============================================================================
   #542ter — TOUTES LES ÉCHELLES QUI EXISTENT ENCORE, ET LEUR VOISINAGE
   ----------------------------------------------------------------------------
   LECTURE SEULE. N'écrit rien, ne répare rien, ne supprime rien.

   ⚠ POURQUOI IL FAUT UNE TROISIÈME SONDE : LA DEUXIÈME AVAIT UNE FAILLE.

   `#542bis` a conclu « AUCUNE DÉFINITION NULLE PART ». Cette conclusion n'est
   PAS établie, et le rapport portait lui-même la contradiction :

       h2026_pratiquesConfigurables → 7 mention(s)

   C'est exactement le magasin où la réparation du 5 août 2026 avait retrouvé la
   définition de cette échelle. La sonde ne l'a pas vue parce qu'elle ne
   reconnaissait une définition QUE si l'objet portait lui-même
   `id === '1767389426695'`. Or une échelle embarquée vit dans
   `pratique.config.echelle`, un objet qui n'a PAS d'`id` : l'identifiant est
   dans un champ VOISIN (`config.echelleId`, ou la référence d'une évaluation).
   La définition était donc classée « simple référence », et le verdict a dit
   « perdu » là où il aurait dû dire « je ne sais pas encore ».

   ⮕ C'est la même faute que celle que ce chantier corrige : un outil qui rend
     un verdict que sa mesure ne porte pas. Elle est ici rendue visible plutôt
     que corrigée en silence.

   CE QUE CELLE-CI FAIT, ET QUI TRANCHE.
   Elle cesse de chercher UN identifiant. Elle INVENTORIE toutes les définitions
   d'échelle qui subsistent, où qu'elles soient — magasins d'échelles,
   bibliothèques, échelles embarquées dans les pratiques, corbeille — avec leurs
   niveaux et leurs valeurs ponctuelles, PLUS l'identifiant que porte leur
   voisinage. C'est ce qui permet de dire si l'une d'elles EST l'échelle des
   339 évaluations orphelines.

   USAGE — console du navigateur, dans l'onglet de l'app :
     1. coller CE FICHIER EN ENTIER, Entrée ;
     2. `await inventaire542()`
   ========================================================================= */

(function () {
    'use strict';

    const CIBLE = '1767389426695';

    async function lire(cle) {
        try { return await db.get(cle); } catch (e) { return null; }
    }

    async function toutesLesCles() {
        const vues = new Set();
        try {
            const k = await db.keys();
            for (let i = 0; i < k.length; i++) vues.add(k[i]);
        } catch (e) { /* IDB indisponible */ }
        for (let j = 0; j < localStorage.length; j++) vues.add(localStorage.key(j));
        return Array.from(vues);
    }

    // ⚠ CORRIGÉ APRÈS COUP (27 août 2026, r2) — LA MÊME FAUTE, UNE TROISIÈME FOIS.
    //
    // La r1 acceptait comme « échelle » tout objet portant des `niveaux` avec un
    // `code`. Elle a donc classé ✅ dix-huit CARTOUCHES : une cartouche porte,
    // elle aussi, une entrée par niveau — mais pour y ranger un TEXTE de
    // rétroaction, pas une valeur. Toutes rendaient `0=∅ I=∅ D=∅ M=∅ E=∅`, et
    // leur « id voisin » `1767389426695` n'était que la trace de l'échelle
    // contre laquelle elles ont été rédigées. Aucune n'était une définition.
    //
    // Ce qui fait d'un objet une ÉCHELLE, c'est qu'au moins un de ses niveaux
    // porte une VALEUR PONCTUELLE exploitable — c'est la seule chose dont la
    // conversion a besoin, et c'est donc le seul test qui vaille.
    function estEchelle(o) {
        if (!o || typeof o !== 'object' || Array.isArray(o)) return false;
        if (!Array.isArray(o.niveaux) || o.niveaux.length === 0) return false;
        return o.niveaux.some(function (n) {
            return n && n.code != null
                && n.valeurCalcul != null
                && String(n.valeurCalcul).trim() !== ''
                && !isNaN(parseFloat(n.valeurCalcul));
        });
    }

    function signature(o) {
        return o.niveaux.map(function (n) {
            var v = (n && n.valeurCalcul != null && String(n.valeurCalcul).trim() !== '')
                ? n.valeurCalcul : '∅';
            return String(n && n.code) + '=' + v;
        }).join('  ');
    }

    // Les identifiants qui vivent DANS le voisinage immédiat d'une échelle :
    // sur l'objet lui-même, sur son parent, ou dans les champs frères. C'est ce
    // que la sonde précédente ne regardait pas.
    function idsDuVoisinage(echelle, parent, grandParent) {
        const ids = new Set();
        [echelle, parent, grandParent].forEach(function (o) {
            if (!o || typeof o !== 'object') return;
            ['id', 'idOriginal', 'echelleId', 'echelleID', 'idEchelle'].forEach(function (champ) {
                if (o[champ] != null && typeof o[champ] !== 'object') ids.add(String(o[champ]));
            });
        });
        return Array.from(ids);
    }

    function collecter(noeud, chemin, vus, sortie, parent, grandParent, profondeur) {
        if (noeud == null || profondeur > 12) return;
        if (typeof noeud !== 'object') return;
        if (vus.has(noeud)) return;
        vus.add(noeud);

        if (estEchelle(noeud)) {
            sortie.push({
                chemin: chemin,
                nom: noeud.nom || (parent && parent.nom) || (grandParent && grandParent.nom) || '(sans nom)',
                signature: signature(noeud),
                ids: idsDuVoisinage(noeud, parent, grandParent),
                nbNiveaux: noeud.niveaux.length
            });
            // On ne descend pas DANS une échelle : ses niveaux ne sont pas des échelles.
            return;
        }

        if (Array.isArray(noeud)) {
            for (var i = 0; i < noeud.length; i++) {
                collecter(noeud[i], chemin + '[' + i + ']', vus, sortie, noeud, parent, profondeur + 1);
            }
            return;
        }
        for (var k in noeud) {
            if (!Object.prototype.hasOwnProperty.call(noeud, k)) continue;
            collecter(noeud[k], chemin + '.' + k, vus, sortie, noeud, parent, profondeur + 1);
        }
    }

    async function inventaire542() {
        const out = [];
        const L = (m) => out.push(m);
        L('==== #542ter · inventaire des échelles subsistantes · LECTURE SEULE ====');
        L('');

        const cles = await toutesLesCles();
        const toutes = [];

        for (const c of cles) {
            const contenu = await lire(c);
            if (contenu == null) continue;
            collecter(contenu, c, new WeakSet(), toutes, null, null, 0);
        }

        L('Clés balayées : ' + cles.length);
        L('Définitions d\'échelle trouvées : ' + toutes.length);
        L('');

        // Celles dont le voisinage NOMME l'échelle recherchée : le cas décisif.
        const candidates = toutes.filter(function (e) { return e.ids.indexOf(CIBLE) !== -1; });

        L('── ÉCHELLES DONT LE VOISINAGE PORTE « ' + CIBLE + ' » ──');
        if (!candidates.length) {
            L('   AUCUNE. (Cette fois, la mesure porte vraiment : on a regardé les');
            L('   champs voisins, pas seulement l\'objet lui-même.)');
        } else {
            for (const e of candidates) {
                L('   ✅ ' + e.chemin);
                L('      nom       : ' + e.nom);
                L('      niveaux   : ' + e.signature);
                L('      ids voisins : ' + e.ids.join(' · '));
            }
        }
        L('');

        L('── TOUTES LES ÉCHELLES SUBSISTANTES (pour comparaison) ─────────────');
        L('   L\'échelle recherchée valait, selon la réparation du 5 août 2026 :');
        L('   0=0  I=40  D=65  M=75  E=100. Cherche cette signature ci-dessous.');
        L('');
        if (!toutes.length) {
            L('   aucune.');
        } else {
            const parSignature = new Map();
            for (const e of toutes) {
                if (!parSignature.has(e.signature)) parSignature.set(e.signature, []);
                parSignature.get(e.signature).push(e);
            }
            for (const [sig, liste] of parSignature) {
                L('   ▸ ' + sig);
                for (const e of liste) {
                    L('       · ' + e.nom + '   [' + e.chemin + ']');
                    if (e.ids.length) L('         ids voisins : ' + e.ids.join(' · '));
                }
            }
        }
        L('');

        L('==== VERDICT ====');
        L('');
        if (candidates.length > 0) {
            L('⮕ LA DÉFINITION SURVIT. #542bis se trompait : elle est là, dans le');
            L('  voisinage d\'un champ qui la nomme. Les valeurs affichées SONT les');
            L('  tiennes — rien à inventer pour réparer.');
        } else {
            const memeSignature = toutes.filter(function (e) {
                return /(^|\s)0=0(\s|$)/.test(e.signature) && /I=40/.test(e.signature)
                    && /D=65/.test(e.signature) && /M=75/.test(e.signature) && /E=100/.test(e.signature);
            });
            if (memeSignature.length) {
                L('⮕ AUCUNE échelle ne porte l\'identifiant recherché, MAIS une échelle');
                L('  aux valeurs EXACTES du 5 août (0=0 I=40 D=65 M=75 E=100) subsiste :');
                for (const e of memeSignature) L('     · ' + e.nom + '   [' + e.chemin + ']');
                L('  ⮕ C\'est un candidat SÉRIEUX, pas une certitude. Que ses valeurs');
                L('    coïncident ne prouve pas que c\'est la même échelle — c\'est à toi');
                L('    de le dire, en regardant son nom et d\'où elle vient.');
            } else {
                L('⮕ AUCUNE définition ne subsiste, et cette fois la mesure le porte.');
                L('  Reste la piste de l\'archive Codex antérieure au 5 août 2026.');
            }
        }
        L('');
        L('⚠ Rien n\'a été modifié. Aucune réparation ne part sans dry-run relu.');
        console.log(out.join('\n'));
        return { echelles: toutes.length, candidates: candidates.length };
    }

    window.inventaire542 = inventaire542;
    console.log('#542ter chargé. Tape :  await inventaire542()');
})();
