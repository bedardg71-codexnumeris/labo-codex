/* ===============================================================
   RÉSULTATS ULTÉRIEURS (#913, 17 sept. 2026)
   ===============================================================
   Un endroit où déposer un résultat obtenu APRÈS le trimestre : la note finale d'un ancien
   élève dans un cours qui suit (102, 103…), que la Direction des études transmet à
   l'enseignant·e et qu'il ou elle saisit À LA MAIN. Aucun lecteur de fichier, aucun calcul,
   aucun graphique : une saisie, et sa sortie dans l'export de recherche (trimestres.js).

   RANGEMENT — `<trim>_resultatsUlterieurs`, un objet { [da]: [{ cours, trimestre, note }] }
   namespacé par trimestre (même patron que `notesRapport`, #866), SANS semis : c'est du
   contenu propre à l'utilisateur. `cours` et `trimestre` sont du TEXTE LIBRE — surtout pas
   un identifiant de trimestre de l'app : ce cours-là a été donné par quelqu'un d'autre.
   Seul écrivain : ce fichier. Lecteurs : ce fichier et exporterFormatRecherche.

   ÉCRAN — la liste du Cadre (trimestre-v2-etudiants.js), qui appelle
   afficherResultatsUlterieurs avec ses propres rangées (déjà triées, déjà anonymisées à
   l'affichage, `da` restant le vrai DA). Mesuré le 17 sept. sous WebKit, trimestre archivé,
   768 px : cet écran rend les élèves ligne par ligne, tient en largeur (654 px) et n'écrit
   aucune donnée du trimestre à l'ouverture ; la « Liste des étudiant·es » (etudiants.js)
   fait 922 px sur 12 colonnes et réécrit trois clés d'indices à chaque ouverture.

   VERROU — le mode archive de l'app n'est qu'une garde CSS (index.html, body.mode-archive).
   Ici la garde est dans l'écriture elle-même : sur un trimestre archivé, rien ne s'écrit
   sans la case « Permission d'écriture » du bandeau (checkbox-ecriture-temp →
   body.mode-ecriture-temp). Aucun mécanisme de déverrouillage neuf.
   =============================================================== */

(function () {
    'use strict';

    const NOM_CLE = 'resultatsUlterieurs';
    const LONGUEUR_MAX_TEXTE = 40;

    // Les mots de l'écran, en UN seul endroit. Proposés par Cowork le 17 sept. 2026, RELUS ET
    // CONFIRMÉS par Grégoire le même jour à 17 h 13 (sous-titre corrigé par lui) ; la phrase
    // du verrou nomme la case telle que le bandeau l'ÉCRIT (« Permission d'écriture ») — la
    // consigne disait « écriture temporaire », un mot que l'écran ne montre nulle part.
    const MOTS = Object.freeze({
        titre: 'Résultats ultérieurs',
        sousTitre: 'Les notes que ces élèves ont obtenues dans les cours qui ont suivi.',
        cours: 'Cours',
        exempleCours: '601-102-MQ',
        trimestre: 'Trimestre',
        exempleTrimestre: 'H2026',
        note: 'Note finale',
        ajouter: 'Ajouter',
        retirer: 'Retirer',
        refusNote: 'La note doit être un nombre entre 0 et 100.',
        refusTexte: 'Indique le cours et le trimestre.',
        refusArchive: 'Coche « Permission d\'écriture » dans le bandeau pour ajouter un résultat.',
        aucunEleve: 'Aucun·e étudiant·e dans cette liste.'
    });

    // Mémoire de SÉANCE, jamais écrite : trente saisies du même cours au même trimestre ne
    // retapent que la note. Les deux champs restent visibles et modifiables à chaque ligne.
    let dernierCours = '';
    let dernierTrimestre = '';
    let dernieresRangees = [];

    /* ---------- Lecture ---------- */

    function lireTous() {
        const tous = db.getSync(cle(NOM_CLE), {});
        return (tous && typeof tous === 'object' && !Array.isArray(tous)) ? tous : {};
    }

    function obtenirResultatsUlterieurs(da) {
        const liste = lireTous()[String(da)];
        return Array.isArray(liste) ? liste : [];
    }

    /* ---------- Validation ---------- */

    /** Rend un nombre de 0 à 100 arrondi à une décimale, ou null. La virgule décimale est admise. */
    function lireNote(saisie) {
        const texte = String(saisie == null ? '' : saisie).trim().replace(',', '.');
        // Le motif n'admet ni signe ni exposant : la borne basse (0) est tenue ici, la haute dessous.
        if (!/^\d+(\.\d+)?$/.test(texte)) return null;
        const n = Math.round(Number(texte) * 10) / 10;
        if (n > 100) return null;
        return n;
    }

    function nettoyerTexte(saisie) {
        return String(saisie == null ? '' : saisie).trim().slice(0, LONGUEUR_MAX_TEXTE);
    }

    /** Sur un trimestre archivé, l'écriture exige la case du bandeau. */
    function ecritureRefusee() {
        const archive = typeof window.estTrimestreArchive === 'function' && window.estTrimestreArchive();
        return archive && !document.body.classList.contains('mode-ecriture-temp');
    }

    /* ---------- Écriture (seul écrivain de la clé) ---------- */

    function ajouterResultat(da, saisie) {
        if (ecritureRefusee()) return { ok: false, refus: MOTS.refusArchive };
        if (!da) return { ok: false, refus: MOTS.refusTexte };
        const cours = nettoyerTexte(saisie && saisie.cours);
        const trimestre = nettoyerTexte(saisie && saisie.trimestre);
        if (!cours || !trimestre) return { ok: false, refus: MOTS.refusTexte };
        const note = lireNote(saisie && saisie.note);
        if (note === null) return { ok: false, refus: MOTS.refusNote };

        const tous = lireTous();
        const liste = Array.isArray(tous[String(da)]) ? tous[String(da)].slice() : [];
        liste.push({ cours, trimestre, note });
        tous[String(da)] = liste;
        db.setSync(cle(NOM_CLE), tous); // security-ok: texte saisi par l'enseignant·e dans son propre champ (aucune source externe), échappé par echapperHtml au rendu
        return { ok: true };
    }

    function retirerResultat(da, index) {
        if (ecritureRefusee()) return { ok: false, refus: MOTS.refusArchive };
        const tous = lireTous();
        const liste = Array.isArray(tous[String(da)]) ? tous[String(da)].slice() : [];
        if (!(index >= 0 && index < liste.length)) return { ok: false, refus: '' };
        liste.splice(index, 1);
        if (liste.length) tous[String(da)] = liste; else delete tous[String(da)];
        db.setSync(cle(NOM_CLE), tous); // security-ok: même objet que ci-dessus, une entrée en moins
        return { ok: true };
    }

    /* ---------- Rendu ---------- */

    function formaterNote(note) {
        return String(note).replace('.', ',');
    }

    function htmlLigne(etudiant) {
        const da = echapperHtml(String(etudiant.da));
        const nom = echapperHtml(`${etudiant.nom || '—'}, ${etudiant.prenom || '—'}`);
        const resultats = obtenirResultatsUlterieurs(etudiant.da).map((r, i) => `
                <li class="ru-resultat">
                    <span>${echapperHtml(r.cours)} · ${echapperHtml(r.trimestre)} · <strong>${echapperHtml(formaterNote(r.note))}</strong></span>
                    <button type="button" class="btn btn-annuler btn-sm btn-supprimer ru-cible" data-action="retirerResultatUlterieur" data-da="${da}" data-index="${i}">${MOTS.retirer}</button>
                </li>`).join('');
        return `
            <li class="ru-eleve" data-da="${da}">
                <div class="ru-nom">${nom}</div>
                ${resultats ? `<ul class="ru-resultats">${resultats}</ul>` : ''}
                <form class="ru-saisie" novalidate>
                    <label>${MOTS.cours}<input type="text" class="controle-form ru-cible" name="cours" maxlength="${LONGUEUR_MAX_TEXTE}" placeholder="${MOTS.exempleCours}" value="${echapperHtml(dernierCours)}" autocomplete="off"></label>
                    <label>${MOTS.trimestre}<input type="text" class="controle-form ru-cible" name="trimestre" maxlength="${LONGUEUR_MAX_TEXTE}" placeholder="${MOTS.exempleTrimestre}" value="${echapperHtml(dernierTrimestre)}" autocomplete="off"></label>
                    <label>${MOTS.note}<input type="text" inputmode="decimal" class="controle-form ru-cible" name="note" maxlength="5" autocomplete="off"></label>
                    <button type="submit" class="btn btn-confirmer btn-sm btn-ajouter ru-cible" data-action="ajouterResultatUlterieur" data-prevent data-da="${da}">${MOTS.ajouter}</button>
                </form>
                <p class="ru-refus" role="alert"></p>
            </li>`;
    }

    function htmlListe(eleves) {
        if (!eleves.length) return '<p class="etat-vide-liste">' + MOTS.aucunEleve + '</p>';
        return '<ul class="ru-eleves">' + eleves.map(htmlLigne).join('') + '</ul>';
    }

    /** Rend la zone. `rangees` : les rangées de la liste du Cadre (`da` = le vrai DA). */
    function afficherResultatsUlterieurs(rangees) {
        const zone = document.getElementById('resultats-ulterieurs-zone');
        if (!zone) return;
        // La coquille n'est posée qu'une fois : la rebâtir refermerait le <details> à chaque saisie.
        // Bâtie par le DOM (textContent) : des constantes de MOTS, aucun innerHTML.
        if (!document.getElementById('resultats-ulterieurs-liste')) {
            const poser = (parent, balise, classe, texte) => {
                const el = document.createElement(balise);
                if (classe) el.className = classe;
                if (texte) el.textContent = texte;
                parent.appendChild(el);
                return el;
            };
            const details = poser(zone, 'details', 'ru-zone');
            poser(details, 'summary', 'ru-cible', MOTS.titre);
            poser(details, 'p', 'texte-aide', MOTS.sousTitre);
            poser(details, 'p', 'ru-verrou', MOTS.refusArchive);
            poser(details, 'div', '').id = 'resultats-ulterieurs-liste';
        }
        const conteneur = document.getElementById('resultats-ulterieurs-liste');
        if (Array.isArray(rangees)) dernieresRangees = rangees;
        // Tout ce qui vient de l'utilisateur est échappé dans htmlLigne (echapperHtml).
        conteneur.innerHTML = htmlListe(dernieresRangees.filter((e) => e && e.da));
    }

    function direRefus(da, message) {
        const ligne = Array.from(document.querySelectorAll('#resultats-ulterieurs-liste .ru-eleve'))
            .find((li) => li.dataset.da === String(da));
        const zone = ligne && ligne.querySelector('.ru-refus');
        if (zone) zone.textContent = message;
    }

    /* ---------- Gestes (dispatcher data-action de main.js : fn(el)) ---------- */

    function ajouterResultatUlterieur(el) {
        const da = el && el.dataset ? el.dataset.da : '';
        const formulaire = el && el.closest ? el.closest('form') : null;
        if (!formulaire) return;
        const saisie = {
            cours: formulaire.elements.cours.value,
            trimestre: formulaire.elements.trimestre.value,
            note: formulaire.elements.note.value
        };
        const issue = ajouterResultat(da, saisie);
        if (!issue.ok) {
            direRefus(da, issue.refus);
            return;
        }
        dernierCours = nettoyerTexte(saisie.cours);
        dernierTrimestre = nettoyerTexte(saisie.trimestre);
        afficherResultatsUlterieurs();
        // La saisie suivante : la note de l'élève d'après (le cours et le trimestre sont déjà là).
        const lignes = Array.from(document.querySelectorAll('#resultats-ulterieurs-liste .ru-eleve'));
        const rang = lignes.findIndex((li) => li.dataset.da === String(da));
        const suivante = lignes[rang + 1] || lignes[rang];
        const champ = suivante && suivante.querySelector('input[name="note"]');
        if (champ) champ.focus();
    }

    function retirerResultatUlterieur(el) {
        const da = el && el.dataset ? el.dataset.da : '';
        const issue = retirerResultat(da, Number(el.dataset.index));
        if (!issue.ok) {
            direRefus(da, issue.refus);
            return;
        }
        afficherResultatsUlterieurs();
    }

    window.MOTS_RESULTATS_ULTERIEURS = MOTS;
    window.obtenirResultatsUlterieurs = obtenirResultatsUlterieurs;
    window.afficherResultatsUlterieurs = afficherResultatsUlterieurs;
    window.ajouterResultatUlterieur = ajouterResultatUlterieur;
    window.retirerResultatUlterieur = retirerResultatUlterieur;
    // Pour les bancs : l'écriture sans passer par le DOM.
    window.resultatsUlterieurs = { ajouter: ajouterResultat, retirer: retirerResultat, lireNote };
})();
