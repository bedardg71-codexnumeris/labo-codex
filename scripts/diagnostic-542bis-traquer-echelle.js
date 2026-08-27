/* ============================================================================
   #542bis — OÙ EST PASSÉE L'ÉCHELLE 1767389426695 ?
   ----------------------------------------------------------------------------
   LECTURE SEULE. N'écrit rien, ne répare rien, ne supprime rien.

   POURQUOI CETTE SECONDE SONDE EXISTE.
   Le lot 0 a mesuré autre chose que ce qu'il cherchait : **383 évaluations sur
   670 désignent une échelle que le calcul ne trouve nulle part**, dont 339 sous
   le seul identifiant `1767389426695`. C'est 1706 niveaux sur 2983 qui ne se
   convertissent pas — la majorité des données de H2026.

   Or cette échelle a DÉJÀ été recréée une fois, le 5 août 2026, dans
   `h2026_echellesTemplates`, à partir de sa définition embarquée retrouvée dans
   `h2026_pratiquesConfigurables[…].config.echelle` (0=0, I=40, D=65, M=75,
   E=100). Le lot 0 dit qu'elle n'y est plus.

   ⚠ AVANT DE CONCLURE À UNE PERTE, IL FAUT SAVOIR SI UNE DÉFINITION SURVIT.
   C'est toute la différence entre « réparable depuis un témoin » et « perdu ».
   Le lot 0 mesurait VIDE et n'avait pas à conclure PERDU — patron #453.

   CETTE SONDE NE FAIT QU'UNE CHOSE : chercher l'identifiant PARTOUT, dans
   toutes les clés, à toute profondeur, et dire OÙ il apparaît et sous quelle
   forme (définition d'échelle exploitable, ou simple référence).

   ⚠⚠ SONDE DEPASSEE — NE PAS S'Y FIER (note du 27 aout 2026).
   Elle a conclu « AUCUNE DEFINITION NULLE PART » alors qu'elle n'avait pas
   regarde au bon endroit : elle ne reconnaissait une definition QUE si l'objet
   portait lui-meme `id === <cible>`. Or une echelle embarquee vit dans
   `pratique.config.echelle`, un objet SANS `id` — l'identifiant est dans un
   champ voisin. Un verdict que la mesure ne portait pas.
   ⮕ Employer `diagnostic-542ter-voisinage-echelles.js` a la place.

   USAGE — console du navigateur, dans l'onglet de l'app :
     1. coller CE FICHIER EN ENTIER, Entrée ;
     2. `await traquer542()`
        (ou `await traquer542('UN_AUTRE_ID')` pour un autre identifiant)
   ========================================================================= */

(function () {
    'use strict';

    const CIBLE_PAR_DEFAUT = '1767389426695';

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

    // Une DÉFINITION d'échelle, c'est un objet qui porte des niveaux avec des
    // valeurs ponctuelles. Une simple mention de l'identifiant dans un champ
    // `echelleId` n'est qu'une RÉFÉRENCE — elle ne permet aucune réparation.
    function estDefinitionExploitable(o) {
        if (!o || typeof o !== 'object') return false;
        if (!Array.isArray(o.niveaux) || o.niveaux.length === 0) return false;
        return o.niveaux.some(function (n) {
            return n && n.code != null && n.valeurCalcul != null
                && String(n.valeurCalcul).trim() !== '';
        });
    }

    function resumerNiveaux(o) {
        return o.niveaux.map(function (n) {
            return String(n && n.code) + '=' + (n && n.valeurCalcul);
        }).join('  ');
    }

    // Parcours en profondeur, avec garde anti-cycle.
    function explorer(noeud, cible, chemin, vus, trouvailles, profondeur) {
        if (noeud == null || profondeur > 12) return;
        if (typeof noeud === 'string') {
            if (noeud === cible) trouvailles.push({ type: 'reference', chemin: chemin, valeur: noeud });
            return;
        }
        if (typeof noeud !== 'object') return;
        if (vus.has(noeud)) return;
        vus.add(noeud);

        // L'objet LUI-MÊME est-il la définition recherchée ?
        if ((noeud.id === cible || noeud.idOriginal === cible) && estDefinitionExploitable(noeud)) {
            trouvailles.push({ type: 'DEFINITION', chemin: chemin, objet: noeud });
        } else if (noeud.id === cible || noeud.idOriginal === cible) {
            trouvailles.push({ type: 'objet-sans-niveaux', chemin: chemin, objet: noeud });
        }

        if (Array.isArray(noeud)) {
            for (var i = 0; i < noeud.length; i++) {
                explorer(noeud[i], cible, chemin + '[' + i + ']', vus, trouvailles, profondeur + 1);
            }
            return;
        }
        for (var k in noeud) {
            if (!Object.prototype.hasOwnProperty.call(noeud, k)) continue;
            explorer(noeud[k], cible, chemin + '.' + k, vus, trouvailles, profondeur + 1);
        }
    }

    async function traquer542(cible) {
        cible = cible || CIBLE_PAR_DEFAUT;
        const out = [];
        const L = (m) => out.push(m);
        L('==== #542bis · traque de l\'échelle « ' + cible + ' » · LECTURE SEULE ====');
        L('');

        const cles = await toutesLesCles();
        L('Clés balayées : ' + cles.length);
        L('');

        const definitions = [];
        const objetsSansNiveaux = [];
        const referencesParCle = new Map();

        for (const c of cles) {
            const contenu = await lire(c);
            if (contenu == null) continue;
            const trouvailles = [];
            explorer(contenu, cible, c, new WeakSet(), trouvailles, 0);
            if (!trouvailles.length) continue;

            for (const t of trouvailles) {
                if (t.type === 'DEFINITION') definitions.push(t);
                else if (t.type === 'objet-sans-niveaux') objetsSansNiveaux.push(t);
                else referencesParCle.set(c, (referencesParCle.get(c) || 0) + 1);
            }
        }

        L('── DÉFINITIONS EXPLOITABLES (des niveaux avec valeurs ponctuelles) ──');
        if (!definitions.length) {
            L('   AUCUNE.');
        } else {
            for (const d of definitions) {
                L('   ✅ ' + d.chemin);
                L('      nom : ' + (d.objet.nom || '(sans nom)'));
                L('      niveaux : ' + resumerNiveaux(d.objet));
            }
        }
        L('');

        L('── OBJETS PORTANT CET ID MAIS SANS NIVEAUX EXPLOITABLES ────────────');
        if (!objetsSansNiveaux.length) L('   aucun.');
        else for (const o of objetsSansNiveaux) L('   ⚠ ' + o.chemin + '  (nom : ' + (o.objet.nom || '(sans nom)') + ')');
        L('');

        L('── SIMPLES RÉFÉRENCES (un champ qui NOMME l\'échelle) ───────────────');
        if (!referencesParCle.size) {
            L('   aucune.');
        } else {
            for (const [c, n] of [...referencesParCle].sort((a, b) => b[1] - a[1])) {
                L('   · ' + c + ' → ' + n + ' mention(s)');
            }
        }
        L('');

        L('==== VERDICT ====');
        L('');
        if (definitions.length > 0) {
            L('⮕ RÉPARABLE, et sans rien inventer. Une définition exploitable survit');
            L('  aux emplacements marqués ✅ ci-dessus. Les valeurs affichées SONT les');
            L('  tiennes : recréer l\'échelle sous l\'identifiant « ' + cible + ' »');
            L('  dans le magasin d\'échelles du trimestre rendrait les ' + '≈339 évaluations');
            L('  convertibles à nouveau.');
            L('  ⚠ NE RÉPARE RIEN À LA MAIN. Envoie-moi ce rapport : l\'outil de');
            L('  réparation doit être écrit, relu en dry-run et sauvegardé avant, comme');
            L('  pour #448 et #453.');
        } else if (objetsSansNiveaux.length > 0) {
            L('⮕ TRACE PRÉSENTE, DÉFINITION INUTILISABLE. L\'identifiant existe encore');
            L('  quelque part, mais sans niveaux exploitables. Il faudra un témoin');
            L('  extérieur — une archive Codex antérieure au 5 août 2026.');
        } else {
            L('⮕ AUCUNE DÉFINITION NULLE PART, et c\'est un vrai résultat, pas un échec');
            L('  de la sonde. Les évaluations nomment une échelle dont plus aucune');
            L('  définition ne subsiste dans ce navigateur.');
            L('  ⮕ La question à trancher devient : as-tu une archive Codex antérieure');
            L('    au 5 août 2026 ? Elle contiendrait la définition, et la réparation');
            L('    redeviendrait possible sans inventer un seul chiffre.');
            L('  ⚠ Ne recrée SURTOUT pas l\'échelle « de mémoire » : ce serait remettre');
            L('    dans tes données exactement ce que #529 a passé la journée à retirer');
            L('    du code — des valeurs qui ressemblent aux tiennes sans en être.');
        }
        L('');
        L('⚠ Rien n\'a été modifié.');
        console.log(out.join('\n'));
        return {
            cible: cible,
            definitions: definitions.length,
            objetsSansNiveaux: objetsSansNiveaux.length,
            clesReferencantes: referencesParCle.size
        };
    }

    window.traquer542 = traquer542;
    console.log('#542bis chargé. Tape :  await traquer542()');
})();
