/* ===============================================================
   REGISTRE LONGITUDINAL (#915, 17 sept. 2026)
   ===============================================================
   Suivre un·e élève d'un trimestre à l'autre. Grégoire inscrit au registre les élèves
   qu'il veut suivre dans la durée ; chaque inscription fige une copie DATÉE de leur
   dossier d'évaluation (sans blobs), et accueille les notes obtenues ensuite dans les
   cours qui suivent. Cadrage : plans de travail/CADRAGE-2026-09-17-soir-registre-
   longitudinal.md (v2), relu et corrigé le même soir.

   RANGEMENT — `registreLongitudinal`, clé GLOBALE (inscrite à CLES_GLOBALES dans
   trimestres.js) : un élève traverse les trimestres, sa fiche ne peut pas vivre dans
   l'un d'eux. Forme :
     { format: 'registre-longitudinal', version: 1,
       eleves: { [da]: { da, nom, prenom, inscritLe, dossiers: [...], resultatsUlterieurs: [...] } } }
   Format DISTINCT de `codex-data` v1 (js/codex-data.js), qui est par groupe-cours archivé
   et lu depuis la Réserve ; celui-ci est par élève et lu depuis les trimestres vivants.
   Seul écrivain : ce fichier, par `db.set` (le seuil IndexedDB est automatique dans db.js).
   Sans semis : un registre absent ou illisible se LIT comme vide, il ne s'écrit pas.

   PÉRENNITÉ (mesurée au cadrage) : la clé figure dans l'export complet (db.keys()),
   survit à supprimerTrimestre, n'est PAS dans la Réserve (par trimestre). L'écran le dit.

   ÉCRAN — Labo › Suivi longitudinal (config.js, navigation.js, index.html). Ce lot (1)
   pose la clé, le module, le sous-onglet et l'écran vide. Le rendu est bâti par le DOM
   (textContent) : les mots viennent de MOTS, les noms d'élèves du registre.

   INTERDITS DES LOTS SUIVANTS, déjà posés ici pour que personne ne les oublie :
   - la capture est en LECTURE SEULE sur les trimestres (stock identique octet pour octet) ;
   - les indices se LISENT au stockage, jamais recalculés (calculerEtStockerIndicesCP ÉCRIT).
   =============================================================== */

(function () {
    'use strict';

    const NOM_CLE = 'registreLongitudinal';
    const FORMAT = 'registre-longitudinal';
    const VERSION = 1;

    // Les mots de l'écran, en UN seul endroit. Supposition nommée (lot 1) : proposés par Claude
    // Code, lus par l'enseignant·e seulement — aucun élève ne les voit. La phrase de pérennité
    // est celle du cadrage v2 § 3.
    const MOTS = Object.freeze({
        sousTitre: 'Les élèves que tu suis d\'un trimestre à l\'autre : une copie figée de leur dossier, et les notes qu\'ils obtiennent ensuite.',
        perennite: 'Le registre est sauvegardé par l\'export complet seulement (Réglages › Données), pas par l\'archive d\'un trimestre.',
        aucunInscrit: 'Aucun·e élève inscrit·e au registre.',
        inscritLe: 'Inscrit·e le'
    });

    /* ---------- Lecture ---------- */

    function registreVide() {
        return { format: FORMAT, version: VERSION, eleves: {} };
    }

    /** Lit le registre tel qu'il est rangé ; une valeur absente, étrangère ou d'un autre format se lit comme vide, sans rien écrire. */
    function lireRegistre() {
        const brut = db.getSync(NOM_CLE, null);
        if (!brut || typeof brut !== 'object' || brut.format !== FORMAT
            || !brut.eleves || typeof brut.eleves !== 'object' || Array.isArray(brut.eleves)) {
            return registreVide();
        }
        return brut;
    }

    /** Les élèves inscrits, triés par nom puis prénom. */
    function elevesInscrits() {
        const eleves = lireRegistre().eleves;
        return Object.keys(eleves)
            .map((da) => eleves[da])
            .filter((e) => e && typeof e === 'object')
            .sort((a, b) => String(a.nom || '').localeCompare(String(b.nom || ''), 'fr')
                || String(a.prenom || '').localeCompare(String(b.prenom || ''), 'fr'));
    }

    /* ---------- Rendu (bâti par le DOM : aucun innerHTML) ---------- */

    function poser(parent, balise, classe, texte) {
        const el = document.createElement(balise);
        if (classe) el.className = classe;
        if (texte) el.textContent = texte;
        parent.appendChild(el);
        return el;
    }

    function formaterDate(iso) {
        const texte = String(iso || '');
        return texte.length >= 10 ? texte.slice(0, 10) : texte;
    }

    function afficherRegistreLongitudinal() {
        const conteneur = document.getElementById('registre-longitudinal-conteneur');
        if (!conteneur) return;
        conteneur.textContent = '';
        poser(conteneur, 'p', 'text-muted', MOTS.sousTitre);
        poser(conteneur, 'p', 'texte-aide', MOTS.perennite);

        const inscrits = elevesInscrits();
        if (!inscrits.length) {
            poser(conteneur, 'p', 'etat-vide-liste', MOTS.aucunInscrit);
            return;
        }
        const liste = poser(conteneur, 'ul', 'rl-eleves');
        inscrits.forEach((e) => {
            const li = poser(liste, 'li', 'rl-eleve');
            li.dataset.da = String(e.da || '');
            poser(li, 'span', 'rl-nom', String(e.nom || '') + ', ' + String(e.prenom || ''));
            poser(li, 'span', 'rl-meta', MOTS.inscritLe + ' ' + formaterDate(e.inscritLe));
        });
    }

    /** Hook d'affichage du sous-onglet (navigation.js). Lit, rend, n'écrit rien. */
    function initialiserRegistreLongitudinal() {
        afficherRegistreLongitudinal();
    }

    window.MOTS_REGISTRE_LONGITUDINAL = MOTS;
    window.initialiserRegistreLongitudinal = initialiserRegistreLongitudinal;
    window.afficherRegistreLongitudinal = afficherRegistreLongitudinal;
    // Pour les bancs et les lecteurs (export de recherche au lot 3) : la lecture sans passer par le DOM.
    window.registreLongitudinal = { NOM_CLE, FORMAT, VERSION, lire: lireRegistre, inscrits: elevesInscrits };
})();
