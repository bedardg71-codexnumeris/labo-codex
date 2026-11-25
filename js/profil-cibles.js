/**
 * LE PROFIL D'UN·E ÉTUDIANT·E EN « PAR STANDARDS » — lots 3 et 4 (21 nov. 2026)
 *
 * Plan : plans de travail/PLAN-2026-11-20-moteur-par-objectifs.md (§ 4 : « le profil, la vue d'un·e étudiant·e » ; lot 3,
 * lot 4 ; décisions du mandat en tête).
 *
 * Une section du profil, visible quand la pratique du groupe-cours est « Par standards » (comme « Jugement » pour la
 * dénotation). Deux cartes :
 *   1. LA NOTE et son récit (règle 12) : chaque cible, son niveau retenu, sa valeur ponctuelle, son poids, sa part ; la
 *      moyenne pondérée ; le second seuil quand il est allumé, et s'il plafonne. Pendant la session, tant qu'une cible est
 *      sans donnée, aucune note chiffrée : les cibles en attente, nommées, sans bulle (règle 9). Une valeur ponctuelle
 *      manquante ou un ordre illisible : « non calculable », avec le motif, jamais un chiffre.
 *   2. LES CIBLES (règle 5) : une ligne par cible, son niveau retenu, sa date, son origine, sa rétroaction ; puis toutes
 *      ses inscriptions datées, remarques et annulées comprises (barrées). Lecture seule : on inscrit et on annule au
 *      tableau de notation.
 *
 * LECTURE SEULE, par `NoteCibles` (le même calcul que `calculerPerformance` de la pratique) et les gabarits du tableau
 * des cibles (`TableauCibles.retenuHTML`, `historiqueHTML`). Tout texte de l'enseignant·e passe par `echapperHtml`.
 * Mots de l'écran : PROPOSÉS (plans de travail/TEXTES-2026-11-21-par-standards-lots-3-4.md, écran « Profil »).
 */
(function () {
    'use strict';

    const MOTS = Object.freeze({
        titreNote: 'Note du cours',
        noteActuelle: 'Note actuelle',
        noteFinale: 'Note finale',
        reglages: 'Réglages de la pratique',
        pasDeNote: 'Pas encore de note.',
        enAttenteTitre: 'Cibles en attente (sans donnée)',
        enAttenteAide: 'La note se calcule quand chaque cible a un niveau retenu, ou à l’arrêt des notes (« Notes finalisées »), où une cible sans donnée compte pour 0\u00a0%.',
        nonCalculable: 'Note non calculable.',
        colCible: 'Cible',
        colNiveau: 'Niveau retenu',
        colValeur: 'Valeur',
        colPoids: 'Poids',
        colPart: 'Part',
        terminale: 'terminale',
        enAttente: 'en attente',
        zeroArret: '0\u00a0% (sans donnée, notes finalisées)',
        valeurAbsente: 'aucune valeur',
        moyenne: (texte) => `Moyenne pondérée des niveaux retenus : ${texte}.`,
        seuilSansTerminale: 'Second seuil : allumé, mais aucune cible n’est terminale ; il ne joue pas.',
        seuilMoyenne: (moy, seuil) => `Second seuil : la moyenne des cibles terminales est de ${moy} (seuil : ${seuil}).`,
        seuilPlafonne: (plafond, moyenne) => `Elle est inférieure au seuil : la note est plafonnée à ${plafond} (la moyenne était de ${moyenne}).`,
        seuilPlafondSansEffet: (plafond) => `Elle est inférieure au seuil, mais la moyenne est déjà sous le plafond de ${plafond} : la note ne change pas.`,
        seuilAtteint: 'Elle atteint le seuil : pas de plafond.',
        titreCibles: 'Les cibles',
        historique: 'Toutes les inscriptions',
        aucuneCible: 'Cette pratique n’a aucune cible.',
        // 25 nov. 2026, lot 3 « sur une production » : mots PROPOSÉS (TEXTES-2026-11-25-tampons-observation-lot-3.md).
        titreProductions: 'Sur ses productions',
        aideProductions: 'Les tampons d’observation que tu as posés sur ses productions, à la date où tu les as posés.'
    });

    const esc = (t) => echapperHtml(t == null ? '' : String(t));
    const pct = (n) => (typeof window.formaterNotePourcentage === 'function' ? window.formaterNotePourcentage(n) : String(n));
    const nombre = (n) => (typeof window.formaterNombre === 'function' ? window.formaterNombre(n) : String(n));

    /** La pratique du groupe-cours actif, si elle est « Par standards » : sa désignation ; sinon null. */
    function _designation() {
        const d = (typeof window.designerPratiqueActive === 'function') ? window.designerPratiqueActive() : null;
        const conf = d && d.etat === 'ok' && d.donnees ? (d.donnees.configuration || {}) : null;
        return (conf && conf.type === 'cibles') ? d : null;
    }

    /** Vrai quand la section se montre : la pratique du groupe-cours actif est « Par standards ». */
    function estActive() {
        return !!(_designation() && window.NoteCibles && window.TableauCibles);
    }

    function _etudiant(da) {
        const liste = (typeof obtenirDonneesSelonMode === 'function') ? (obtenirDonneesSelonMode('groupeEtudiants') || []) : [];
        return liste.find(e => e && String(e.da) === String(da)) || { da };
    }

    /* ------------------------------------------------------------------ La note et son récit */

    function _niveauTexte(ligne) {
        if (ligne.compte === 'attente') return MOTS.enAttente;
        if (!ligne.niveau) return '—';
        return `${ligne.niveau.code} · ${ligne.niveau.nom || ''}`.trim();
    }

    function _valeurTexte(ligne) {
        if (ligne.compte === 'attente') return '—';
        if (ligne.compte === 'zero-arret') return MOTS.zeroArret;
        return (typeof ligne.valeur === 'number') ? pct(ligne.valeur) : MOTS.valeurAbsente;
    }

    function _recitHTML(note) {
        const lignes = note.lignes.map(l => `<tr class="pc-ligne pc-ligne--${esc(l.compte)}">`
            + `<th scope="row">${esc(l.cible.etiquette)}${l.cible.terminale ? ` <span class="pc-terminale">${esc(MOTS.terminale)}</span>` : ''}</th>`
            + `<td>${esc(_niveauTexte(l))}</td><td>${esc(_valeurTexte(l))}</td>`
            + `<td>${esc(nombre(l.poids))}</td><td>${esc(l.part === null || l.part === undefined ? '—' : pct(l.part))}</td></tr>`).join('');
        return `<div class="pc-defilement"><table class="tableau pc-recit"><thead><tr><th scope="col">${esc(MOTS.colCible)}</th>`
            + `<th scope="col">${esc(MOTS.colNiveau)}</th><th scope="col">${esc(MOTS.colValeur)}</th><th scope="col">${esc(MOTS.colPoids)}</th>`
            + `<th scope="col">${esc(MOTS.colPart)}</th></tr></thead><tbody>${lignes}</tbody></table></div>`;
    }

    function _secondSeuilHTML(note) {
        const ds = note.doubleSeuil || {};
        if (!ds.actif) return '';
        if (!note.plafonnement) return `<p class="pc-seuil">${esc(MOTS.seuilSansTerminale)}</p>`;
        const p = note.plafonnement;
        const suite = !p.sousLeSeuil ? MOTS.seuilAtteint
            : (p.applique ? MOTS.seuilPlafonne(pct(p.plafond), pct(note.moyenne)) : MOTS.seuilPlafondSansEffet(pct(p.plafond)));
        return `<p class="pc-seuil${p.applique ? ' pc-seuil--plafonne' : ''}">${esc(MOTS.seuilMoyenne(pct(p.moyenneTerminales), pct(p.seuil)))} ${esc(suite)}</p>`;
    }

    function _carteNoteHTML(designation, eleve) {
        const note = eleve.note;
        const E = window.NoteCibles.ETATS;
        const titre = `<h3 class="pc-titre">${esc(MOTS.titreNote)}`
            + `<span class="note-finale-pratique-nom">${esc(designation.donnees.nom || '')}</span>`
            + `<button type="button" class="lien-reglages" data-action="ouvrirReglagesPratique" data-param="${esc(designation.id)}">${esc(MOTS.reglages)}</button></h3>`;
        if (note.etat === E.NOTE) {
            const libelle = note.notesFinales ? MOTS.noteFinale : MOTS.noteActuelle;
            return `<div class="profil-carte pc-note">${titre}
                <p class="pc-note-valeur"><span class="pc-note-libelle">${esc(libelle)}</span> <strong>${esc(pct(note.note))}</strong></p>
                ${_recitHTML(note)}
                <p class="pc-moyenne">${esc(MOTS.moyenne(pct(note.moyenne)))}</p>
                ${_secondSeuilHTML(note)}
            </div>`;
        }
        if (note.etat === E.ATTENTE) {
            const attente = note.enAttente.map(c => `<li><strong>${esc(c.etiquette)}</strong>${c.enonce ? ` : ${esc(c.enonce)}` : ''}</li>`).join('');
            return `<div class="profil-carte pc-note pc-note--attente">${titre}
                <p class="pc-note-valeur"><strong>${esc(MOTS.pasDeNote)}</strong></p>
                <div class="pc-attente"><p class="pc-attente-titre">${esc(MOTS.enAttenteTitre)}</p><ul class="pc-attente-liste">${attente}</ul>
                <p class="pc-aide">${esc(MOTS.enAttenteAide)}</p></div>
                ${_recitHTML(note)}
            </div>`;
        }
        return `<div class="profil-carte pc-note pc-note--non-calculable">${titre}
            <div class="alerte alerte-attention"><strong>${esc(MOTS.nonCalculable)}</strong> ${esc(note.motif || '')}</div>
            ${note.lignes && note.lignes.length ? _recitHTML(note) : ''}
        </div>`;
    }

    /* ------------------------------------------------------------------ Les cibles */

    function _carteCiblesHTML(ctx, eleve, da, traces) {
        if (!ctx.cibles.length) return `<div class="profil-carte pc-cibles"><p class="tc-aide">${esc(MOTS.aucuneCible)}</p></div>`;
        const T = window.TableauCibles;
        const I = window.InscriptionsCibles;
        // Lot 3 (25 nov. 2026) : sous la cible qu'une production vise SEULE, ses tampons d'observation, lus en direct tant
        // qu'aucune inscription n'existe pour cette production et cette cible.
        const productions = (typeof obtenirDonneesSelonMode === 'function') ? (obtenirDonneesSelonMode('productions') || []) : [];
        const enDirect = (cible) => (traces.length ? I.tracesEnDirectSousLaCible(traces, productions, { liste: ctx.inscriptions, da,
            ensembleId: ctx.ensemble.id, cible, cibles: ctx.cibles }) : []);
        const blocs = eleve.retenue.lignes.map(l => `
            <section class="pc-cible">
                <h4 class="pc-cible-titre">${esc(l.cible.etiquette)}${l.cible.terminale ? ` <span class="cibles-fiche-terminale">Cible terminale</span>` : ''}</h4>
                ${l.cible.enonce ? `<p class="tc-cible-enonce">${esc(l.cible.enonce)}</p>` : ''}
                ${T.retenuHTML(ctx, l, { details: true })}
                <p class="pc-historique-titre">${esc(MOTS.historique)}</p>
                ${T.historiqueHTML(ctx, da, l.cible.id, { lectureSeule: true, retenuId: l.retenu ? l.retenu.id : null, enDirect: enDirect(l.cible) })}
            </section>`).join('');
        return `<div class="profil-carte pc-cibles"><h3 class="pc-titre">${esc(MOTS.titreCibles)}</h3>${blocs}</div>`;
    }

    /** Le rang « sous cette production » (lot 3) : la carte n'existe que si une production porte un tampon d'observation. */
    function _carteProductionsHTML(traces) {
        if (!traces.length) return '';
        return `<div class="profil-carte pc-productions"><h3 class="pc-titre">${esc(MOTS.titreProductions)}</h3>
            <p class="tc-aide">${esc(MOTS.aideProductions)}</p>${window.TableauCibles.tracesDesProductionsHTML(traces)}</div>`;
    }

    /**
     * Le panneau de la section, pour un·e étudiant·e. Lecture seule.
     * @param {string} da
     * @returns {string} HTML (tout texte échappé)
     */
    function panneau(da) {
        const designation = _designation();
        if (!designation || !window.TableauCibles || !window.NoteCibles) return '';
        // Le contexte du tableau des cibles : l'ensemble, l'échelle, l'ordre, le niveau « sans donnée », les inscriptions.
        const ctx = window.TableauCibles.completerContexte({ etat: 'cibles', donnees: designation.donnees, pratiqueId: designation.id,
            pratiqueNom: designation.donnees.nom || '', etudiants: [_etudiant(da)] });
        if (!ctx.ensemble) return `<div class="profil-carte pc-note"><div class="alerte alerte-attention">${esc(ctx.vide || '')}</div></div>`;
        const eleve = window.TableauCibles.eleveDuContexte(ctx, da);
        const traces = window.TableauCibles.tracesDesProductions(da);
        return `<div class="pc-panneau">${_carteNoteHTML(designation, eleve)}${_carteCiblesHTML(ctx, eleve, da, traces)}${_carteProductionsHTML(traces)}</div>`;
    }

    window.ProfilCibles = { MOTS, estActive, panneau };
})();
