/**
 * LE RELEVÉ PAR CIBLE — SA MISE EN PAGE (lot 5, première version, 21 nov. 2026)
 *
 * Reçoit le relevé de `ReleveCiblesData.construire` et rend des BLOCS HTML (en-tête, note, une cible par bloc, échelle),
 * puis des pages Lettre (816 × 1056 px à 96 ppp) faites de ces blocs. Comme la synthèse de rétroaction
 * (`synthese-retroaction-rendu.js`), tout le CSS est en ligne, en px et en hexadécimal : html2canvas ne résout pas les
 * variables du thème, et le papier est blanc en thème clair comme en thème sombre.
 *
 * TOUS LES MOTS QUE LIT L'ÉTUDIANT·E SONT ICI (`MOTS`, `UNITES`) et dans
 * plans de travail/TEXTES-2026-11-21-releve-par-cible.md : PROPOSÉS, aucun arrêté, ils reviennent à Grégoire.
 * Le mot de l'unité (« objectif » ou « cible ») n'est PAS tranché : `UNITES` porte les deux, le relevé dit lequel.
 * Aucune phrase ne tutoie ni ne vouvoie l'étudiant·e (la personne est à décider elle aussi).
 *
 * Tout texte venu des données (étiquettes, énoncés, critères, rétroactions, noms) passe par `echapperHtml`.
 *
 * API : window.ReleveCiblesRendu = { MOTS, UNITES, PAGE, blocs, pageHTML, feuilleHTML }
 */
(function () {
    'use strict';

    const PAGE = Object.freeze({ largeur: 816, hauteur: 1056, margeV: 43, margeH: 48, pied: 26 });

    const ENCRE = '#141414';
    const PAPIER = '#ffffff';
    const CARTE = '#f5f4f1';
    const LIGNE = '#e3e0d8';
    const DISCRET = '#5f5b54';
    const NEUTRE = '#767169';
    const POLICE = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

    /** Le mot de l'unité, dans ses accords. Non tranché : « objectif » d'office (CONCEPTION, Q1). */
    const UNITES = Object.freeze({
        objectif: Object.freeze({ nom: 'objectif', Nom: 'Objectif', pluriel: 'objectifs', chaque: 'chaque objectif', un: 'un objectif',
            du: 'de l’objectif', terminal: 'objectif terminal', restes: 'Objectifs encore sans niveau', reste: 'resté',
            terminaux: 'objectifs terminaux', aucun: 'aucun objectif' }),
        cible: Object.freeze({ nom: 'cible', Nom: 'Cible', pluriel: 'cibles', chaque: 'chaque cible', un: 'une cible',
            du: 'de la cible', terminal: 'cible terminale', restes: 'Cibles encore sans niveau', reste: 'restée',
            terminaux: 'cibles terminales', aucun: 'aucune cible' })
    });

    const MOTS = Object.freeze({
        titre: (u) => `Relevé par ${u.nom}`,
        etatAu: (date) => `État au ${date}`,
        groupe: (g) => `Groupe ${g}`,
        intro: (u) => `Ce relevé montre où en est ${u.chaque} du cours : le niveau actuel, ce qui a été observé et les commentaires reçus. `
            + `Le niveau actuel est le meilleur niveau démontré jusqu’ici ; un niveau plus bas obtenu ensuite ne le fait pas baisser.`,
        noteTitre: 'Note du cours',
        noteActuelle: 'Note actuelle',
        noteFinale: 'Note finale',
        notePeutMonter: 'Elle peut encore monter d’ici la fin du cours.',
        pasDeNote: 'Pas encore de note.',
        attenteRegle: (u) => `La note du cours se calcule quand ${u.chaque} a un niveau.`,
        attenteListe: (u, liste) => `${u.restes} : ${liste}.`,
        attenteFin: (u) => `À la fin du cours, ${u.un} ${u.reste} sans niveau compte pour 0 %.`,
        noteDifferee: 'La note du cours sera communiquée plus tard.',
        noteIndisponible: 'Pas de note pour l’instant.',
        colNiveau: 'Niveau',
        colValeur: 'Valeur',
        colPoids: 'Poids',
        colPart: 'Part de la note',
        zeroFin: '0 % (sans niveau à la fin du cours)',
        moyenne: (texte) => `Moyenne pondérée : ${texte}.`,
        seuilPlafonne: (u, moy, seuil, plafond) => `La moyenne des ${u.terminaux} est de ${moy}, sous le seuil de ${seuil} : la note est plafonnée à ${plafond}.`,
        partDeLaNote: (part) => `Compte pour ${part} de la note`,
        criteres: 'Critères',
        essentiel: 'essentiel',
        niveauActuel: 'Niveau actuel',
        niveauFinal: 'Niveau final',
        depuis: (date) => `depuis le ${date}`,
        aucunNiveau: (nom) => `aucun pour l’instant (${nom})`,
        niveauIndisponible: 'non disponible',
        observe: 'Ce qui a été observé',
        rienObserve: 'Rien d’inscrit pour l’instant.',
        commentaire: 'Commentaire',
        marqueRetenu: 'niveau actuel',
        production: (titre) => `Production : ${titre}`,
        respecte: 'respecté',
        nonRespecte: 'non respecté',
        nonRenseigne: 'non renseigné',
        annulee: (date) => `Inscription annulée le ${date}`,
        echelleTitre: 'L’échelle',
        sansDonnee: 'aucune donnée valable',
        aucuneCible: (u) => `Ce cours n’a encore ${u.aucun}.`,
        page: (n, total) => `${n} / ${total}`
    });

    const esc = (t) => echapperHtml(t == null ? '' : String(t));
    const pct = (n) => (typeof window.formaterNotePourcentage === 'function' ? window.formaterNotePourcentage(n) : `${n} %`);
    const nombre = (n) => (typeof window.formaterNombre === 'function' ? window.formaterNombre(n) : String(n));
    const part = (n) => (typeof window.formaterPourcentage === 'function' ? window.formaterPourcentage(n, 0) : `${Math.round(n)} %`);
    const jour = (iso) => (window.TableauCibles && typeof window.TableauCibles.dateLisible === 'function') ? window.TableauCibles.dateLisible(iso) : String(iso || '');
    const unite = (releve) => UNITES[releve && releve.mot] || UNITES.objectif;

    const nomNiveau = (n) => (n ? `${n.code} · ${n.nom}`.replace(/ · $/, '') : '');
    const pastille = (n) => `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${esc((n && n.couleur) || NEUTRE)};margin-right:6px;"></span>`;
    const etiquette = (texte) => `<span style="display:inline-block;font-size:10px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;color:${DISCRET};border:1px solid ${LIGNE};border-radius:3px;padding:1px 5px;margin-left:6px;vertical-align:middle;">${esc(texte)}</span>`;
    const bloc = (genre, html) => `<div data-releve-bloc="${genre}" style="margin:0 0 14px 0;">${html}</div>`;
    const carte = (html) => `<div style="background:${CARTE};border:1px solid ${LIGNE};border-radius:6px;padding:12px 14px;">${html}</div>`;
    const p = (html, style) => `<p style="margin:0 0 6px 0;font-size:12.5px;line-height:1.45;${style || ''}">${html}</p>`;

    /* ------------------------------------------------------------------ L'en-tête */

    function _entete(r) {
        const u = unite(r);
        const droite = [r.cours, r.enseignant].filter(Boolean).map(esc).join('<br>');
        const sous = [r.etudiant.groupe ? MOTS.groupe(r.etudiant.groupe) : '', r.date ? MOTS.etatAu(jour(r.date)) : ''].filter(Boolean).map(esc).join(' · ');
        return bloc('entete', `<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid ${ENCRE};padding-bottom:10px;">
            <div><div style="font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:${DISCRET};">${esc(MOTS.titre(u))}</div>
                <div style="font-size:22px;font-weight:700;line-height:1.2;margin-top:2px;">${esc(r.etudiant.nom)}</div>
                ${sous ? `<div style="font-size:12px;color:${DISCRET};margin-top:3px;">${sous}</div>` : ''}</div>
            <div style="font-size:12px;color:${DISCRET};text-align:right;line-height:1.4;">${droite}</div></div>
            ${p(esc(MOTS.intro(u)), `margin-top:10px;color:${DISCRET};`)}`);
    }

    /* ------------------------------------------------------------------ La note */

    function _calcul(r) {
        const n = r.note;
        const u = unite(r);
        if (!n.lignes.length) return '';
        const th = (t, align) => `<th scope="col" style="text-align:${align || 'left'};font-size:10.5px;font-weight:600;color:${DISCRET};padding:4px 6px;border-bottom:1px solid ${LIGNE};">${esc(t)}</th>`;
        const td = (t, align) => `<td style="text-align:${align || 'left'};font-size:12px;padding:4px 6px;border-bottom:1px solid ${LIGNE};">${t}</td>`;
        const lignes = n.lignes.map(l => `<tr>${td(esc(l.etiquette))}${td(l.niveau ? esc(nomNiveau(l.niveau)) : '—')}`
            + `${td(esc(l.compte === 'zero-arret' ? MOTS.zeroFin : (typeof l.valeur === 'number' ? pct(l.valeur) : '—')), 'right')}`
            + `${td(esc(nombre(l.poids)), 'right')}${td(esc(typeof l.part === 'number' ? part(l.part) : '—'), 'right')}</tr>`).join('');
        const seuil = (n.seuil && n.seuil.applique)
            ? p(esc(MOTS.seuilPlafonne(u, pct(n.seuil.moyenneTerminales), pct(n.seuil.seuil), pct(n.seuil.plafond))), 'margin-top:6px;') : '';
        return `<table style="width:100%;border-collapse:collapse;margin-top:8px;"><thead><tr>${th(u.Nom)}${th(MOTS.colNiveau)}${th(MOTS.colValeur, 'right')}${th(MOTS.colPoids, 'right')}${th(MOTS.colPart, 'right')}</tr></thead><tbody>${lignes}</tbody></table>`
            + p(esc(MOTS.moyenne(pct(n.moyenne))), `margin-top:8px;color:${DISCRET};`) + seuil;
    }

    function _note(r) {
        const n = r.note;
        const u = unite(r);
        const titre = `<div style="font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:${DISCRET};margin-bottom:4px;">${esc(MOTS.noteTitre)}</div>`;
        const gros = (html) => `<div style="font-size:18px;font-weight:700;line-height:1.3;margin-bottom:4px;">${html}</div>`;
        if (n.etat === 'note') {
            return bloc('note', carte(titre + gros(`${esc(n.finale ? MOTS.noteFinale : MOTS.noteActuelle)} : ${esc(pct(n.valeur))}`)
                + (n.finale ? '' : p(esc(MOTS.notePeutMonter), `color:${DISCRET};`)) + _calcul(r)));
        }
        if (n.etat === 'attente') {
            const liste = n.enAttente.length ? p(esc(MOTS.attenteListe(u, n.enAttente.join(', ')))) : '';
            return bloc('note', carte(titre + gros(esc(MOTS.pasDeNote)) + p(esc(MOTS.attenteRegle(u))) + liste + p(esc(MOTS.attenteFin(u)), `color:${DISCRET};`)));
        }
        return bloc('note', carte(titre + gros(esc(n.etat === 'differee' ? MOTS.noteDifferee : MOTS.noteIndisponible))));
    }

    /* ------------------------------------------------------------------ Une cible */

    function _coche(k) {
        const signe = k.respecte === true ? '✓' : (k.respecte === false ? '✗' : '–');
        const etat = k.respecte === true ? MOTS.respecte : (k.respecte === false ? MOTS.nonRespecte : MOTS.nonRenseigne);
        return `<li style="font-size:11.5px;line-height:1.4;margin:0 0 2px 0;list-style:none;"><span style="display:inline-block;width:14px;font-weight:700;">${signe}</span>${esc(k.texte)}`
            + ` <span style="color:${DISCRET};">(${esc(etat)})</span></li>`;
    }

    function _entree(e) {
        const tete = e.type === 'remarque'
            ? `<span style="font-weight:600;">${esc(MOTS.commentaire)}</span>`
            : `${pastille(e.niveau)}<span style="font-weight:600;">${esc(nomNiveau(e.niveau))}</span>${e.retenu ? etiquette(MOTS.marqueRetenu) : ''}`;
        const origine = e.origine ? `<span style="color:${DISCRET};"> · ${esc(MOTS.production(e.origine))}</span>` : '';
        const coches = e.criteres.length ? `<ul style="margin:4px 0 0 0;padding:0;">${e.criteres.map(_coche).join('')}</ul>` : '';
        const annulee = e.annulee ? p(esc(MOTS.annulee(jour(e.annulee.date))), `color:${DISCRET};font-style:italic;margin-top:3px;`) : '';
        return `<li style="list-style:none;margin:0;padding:7px 0;border-top:1px solid ${LIGNE};${e.annulee ? 'opacity:.6;' : ''}">
            <div style="font-size:12px;line-height:1.4;${e.annulee ? 'text-decoration:line-through;' : ''}"><span style="display:inline-block;min-width:136px;color:${DISCRET};">${esc(jour(e.date))}</span>${tete}${origine}</div>
            ${e.texte ? `<div style="font-size:12.5px;line-height:1.45;margin:3px 0 0 136px;">${esc(e.texte)}</div>` : ''}
            ${coches ? `<div style="margin-left:136px;">${coches}</div>` : ''}${annulee}</li>`;
    }

    function _niveauDeLaCible(r, c) {
        const libelle = r.note && r.note.finale ? MOTS.niveauFinal : MOTS.niveauActuel;
        let valeur;
        if (c.etat === 'niveau') valeur = `${pastille(c.niveau)}<strong>${esc(nomNiveau(c.niveau))}</strong>${c.date ? `, ${esc(MOTS.depuis(jour(c.date)))}` : ''}`;
        else if (c.etat === 'sans-donnee') valeur = esc(MOTS.aucunNiveau(r.nomSansDonnee));
        else valeur = esc(MOTS.niveauIndisponible);
        return `<div style="font-size:13px;line-height:1.4;margin:8px 0 2px 0;"><span style="color:${DISCRET};">${esc(libelle)} : </span>${valeur}</div>`;
    }

    function _cible(r, c) {
        const u = unite(r);
        const compte = (typeof c.part === 'number') ? `<span style="font-size:11.5px;color:${DISCRET};white-space:nowrap;">${esc(MOTS.partDeLaNote(part(c.part)))}</span>` : '';
        const criteres = c.criteres.length ? `<div style="margin-top:6px;"><div style="font-size:10.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${DISCRET};">${esc(MOTS.criteres)}</div>
            <ul style="margin:3px 0 0 0;padding-left:16px;">${c.criteres.map(k => `<li style="font-size:12px;line-height:1.4;margin:0 0 1px 0;">${esc(k.texte)}${k.essentiel ? etiquette(MOTS.essentiel) : ''}</li>`).join('')}</ul></div>` : '';
        const observe = c.entrees.length ? `<ul style="margin:4px 0 0 0;padding:0;">${c.entrees.map(_entree).join('')}</ul>` : p(esc(MOTS.rienObserve), `color:${DISCRET};margin-top:4px;`);
        return bloc('cible', `<div style="border:1px solid ${LIGNE};border-radius:6px;padding:12px 14px;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;">
                <div style="font-size:15px;font-weight:700;line-height:1.3;">${esc(c.etiquette)}${c.terminale ? etiquette(u.terminal) : ''}</div>${compte}</div>
            ${c.enonce ? `<div style="font-size:12.5px;line-height:1.45;margin-top:2px;">${esc(c.enonce)}</div>` : ''}
            ${criteres}${_niveauDeLaCible(r, c)}
            <div style="font-size:10.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${DISCRET};margin-top:8px;">${esc(MOTS.observe)}</div>
            ${observe}</div>`);
    }

    /* ------------------------------------------------------------------ L'échelle */

    function _echelle(r) {
        if (!r.echelle || !r.echelle.niveaux.length) return '';
        const lignes = r.echelle.niveaux.map(n => `<tr><td style="font-size:12px;padding:4px 8px 4px 0;white-space:nowrap;vertical-align:top;border-top:1px solid ${LIGNE};">${pastille(n)}<strong>${esc(nomNiveau(n))}</strong></td>
            <td style="font-size:12px;line-height:1.4;padding:4px 0;vertical-align:top;border-top:1px solid ${LIGNE};">${esc(n.description)}${n.sansDonnee ? `${n.description ? ' ' : ''}<span style="color:${DISCRET};">(${esc(MOTS.sansDonnee)})</span>` : ''}</td></tr>`).join('');
        return bloc('echelle', carte(`<div style="font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:${DISCRET};margin-bottom:4px;">${esc(MOTS.echelleTitre)}${r.echelle.nom ? ` · ${esc(r.echelle.nom)}` : ''}</div>
            <table style="width:100%;border-collapse:collapse;"><tbody>${lignes}</tbody></table>`));
    }

    /* ------------------------------------------------------------------ Les blocs, la page, la feuille */

    /**
     * Les blocs du relevé, dans l'ordre : l'en-tête, la note, une cible par bloc, l'échelle. Chaque bloc est insécable :
     * l'export les range sur des pages Lettre sans en couper un.
     * @returns {string[]} HTML (tout texte échappé)
     */
    function blocs(releve) {
        const r = releve || {};
        if (!r.ok) {
            const u = unite(r);
            return [_entete(Object.assign({ etudiant: { nom: '', groupe: '' } }, r)), bloc('vide', carte(p(esc(MOTS.aucuneCible(u)))))];
        }
        return [_entete(r), _note(r)].concat(r.cibles.map(c => _cible(r, c)), [_echelle(r)]).filter(Boolean);
    }

    const _styleFeuille = `box-sizing:border-box;width:${PAGE.largeur}px;background:${PAPIER};color:${ENCRE};font-family:${POLICE};padding:${PAGE.margeV}px ${PAGE.margeH}px;`;

    /** Une page Lettre : ses blocs, puis son pied (nom, « n / total »). `hauteur` : au moins une page ; plus si un bloc seul la dépasse. */
    function pageHTML(blocsHTML, numero, total, releve, hauteur) {
        const r = releve || {};
        const h = Math.max(PAGE.hauteur, hauteur || 0);
        const pied = `<div style="position:absolute;left:${PAGE.margeH}px;right:${PAGE.margeH}px;bottom:${PAGE.margeV - 14}px;display:flex;justify-content:space-between;font-size:10.5px;color:${DISCRET};">
            <span>${esc((r.etudiant && r.etudiant.nom) || '')}${r.date ? ` · ${esc(jour(r.date))}` : ''}</span><span>${esc(MOTS.page(numero, total))}</span></div>`;
        return `<div data-releve-page="${numero}" style="${_styleFeuille}position:relative;height:${h}px;overflow:hidden;">${blocsHTML.join('')}${pied}</div>`;
    }

    /** La feuille continue de l'aperçu à l'écran : les mêmes blocs, sans pagination (le PDF, lui, est rangé en pages). */
    function feuilleHTML(releve) {
        return `<div data-releve-feuille style="${_styleFeuille}">${blocs(releve).join('')}</div>`;
    }

    window.ReleveCiblesRendu = { MOTS, UNITES, PAGE, blocs, pageHTML, feuilleHTML };
})();
