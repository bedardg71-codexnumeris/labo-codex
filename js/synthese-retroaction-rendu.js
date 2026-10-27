/**
 * synthese-retroaction-rendu.js — Rendu HTML de la synthèse de rétroaction
 *
 * Produit un fragment HTML 8.5" x 11" (816 x 1056 px à 96dpi) prêt à être
 * rasterisé par html2canvas et inséré comme page dans le PDF jsPDF des
 * travaux annotés. Toutes les valeurs CSS sont inline en px et hex —
 * aucune dépendance aux variables CSS du DOM live (html2canvas ne résout
 * pas var(--…) sur des nœuds détachés).
 *
 * Principe : chaque section qui n'a pas de donnée disparaît (pas de placeholder).
 *
 * API publique : window.syntheseRetroactionRendu = { rendreSyntheseHTML }
 */

(function() {
    'use strict';

    /* =====================================================================
       TOKENS DESIGN
       ===================================================================== */

    // Page (US Letter @ 96dpi)
    const PAGE_W = 816;     // 8.5in
    const PAGE_H = 1056;    // 11in
    const PAD_V  = 43;      // ~0.45in
    const PAD_H  = 48;      // ~0.5in

    // Couleurs neutres (handoff §7.1)
    const INK   = '#141414';
    const PAPER = '#ffffff';
    const CARD  = '#f5f4f1';
    const LINE  = '#e3e0d8';
    const MUTED = '#767169';

    // Polices : stack système pour zéro distorsion
    const FONT_SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
    const FONT_MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    // 21 oct. 2026 (décision de Grégoire, 11 h 07) : la NORME FRANÇAISE dans le PDF de l'élève. Les notes
    // passent par `formaterNotePourcentage` (note-pourcentage.js) ; tout autre nombre par `formaterNombre`,
    // `formaterPourcentage`, `formaterPoints` du même module (#1137, 22 oct.) : la virgule, et l'espace
    // insécable (le CARACTÈRE, jamais `&nbsp;` : `esc` la doublerait) devant « % » et « pts ».
    // Une phrase ne mêle pas deux normes (« … pts + … pts = … % »).

    /* =====================================================================
       API PUBLIQUE
       ===================================================================== */

    function rendreSyntheseHTML(feedback) {
        if (!feedback) return '';

        const codeColor = construireMappingCouleurs(feedback.scale);
        const ctx = { feedback, codeColor };

        const sections = [
            renderHeader(ctx),
            renderMarqueurRecalcul(ctx),
            renderRuban(ctx),
            renderCriteres(ctx),
            renderNiveauGlobal(ctx),
            renderTamponsErreurs(ctx),
            renderBilan(ctx),
            renderPiedCC(ctx)
        ].filter(Boolean).join('');

        const containerStyle = [
            `width: ${PAGE_W}px`,
            `min-height: ${PAGE_H}px`,
            `box-sizing: border-box`,
            `padding: ${PAD_V}px ${PAD_H}px`,
            `background: ${PAPER}`,
            `color: ${INK}`,
            `font-family: ${FONT_SANS}`,
            `font-size: 10px`,
            `line-height: 1.4`,
            `display: flex`,
            `flex-direction: column`,
            `-webkit-print-color-adjust: exact`,
            `print-color-adjust: exact`
        ].join('; ');

        return `<div style="${containerStyle}">${sections}</div>`;
    }

    /* =====================================================================
       HELPERS — typographie et fragments réutilisés
       ===================================================================== */

    function esc(s) {
        if (typeof echapperHtml === 'function') return echapperHtml(String(s ?? ''));
        // Fallback : echapper a minima plutot que retourner la chaine brute.
        // L'ancienne implementation retournait String(s) sans echappement,
        // desactivant silencieusement la sanitization si echapperHtml n'etait
        // pas charge. Defense en profondeur : la synthese rend dans un DOM
        // live (offscreen mais live) avant rasterisation html2canvas, donc
        // un attribut event-handler dans le HTML s'executerait. (nit3)
        return String(s ?? '').replace(/[&<>"']/g, function(c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function styleMonoLabel() {
        return `font-family: ${FONT_MONO}; font-size: 7.5px; letter-spacing: 0.5px; color: ${MUTED}; text-transform: uppercase;`;
    }

    function sectionHeader(titre, droite) {
        const right = droite ? `<div>${droite}</div>` : '';
        return `
            <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 5px;">
                <h2 style="font-family: ${FONT_MONO}; font-size: 9px; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 700; margin: 0;">${esc(titre)}</h2>
                ${right}
            </div>`;
    }

    function construireMappingCouleurs(scale) {
        const map = {};
        (scale || []).forEach(s => { if (s.code) map[s.code] = s.color; });
        return map;
    }

    /**
     * #571 — LA COULEUR DU TEXTE SUIVANT LE FOND. Les couleurs des niveaux sont
     * celles que l'utilisateur pose sur SON échelle ; du texte blanc (`PAPER`) y
     * était écrit sans garde : sur un niveau jaune ou pastel, le code devenait
     * illisible dans le document remis à l'élève. Luminance relative (WCAG) : fond
     * clair → encre, fond sombre → papier. Une couleur illisible (nom CSS,
     * gradient, vide) garde le papier, comme avant : on ne devine pas.
     */
    function texteSur(fond) {
        const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(fond || '').trim());
        if (!m) return PAPER;
        let h = m[1];
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        const lin = (v) => { const c = parseInt(v, 16) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
        const L = 0.2126 * lin(h.slice(0, 2)) + 0.7152 * lin(h.slice(2, 4)) + 0.0722 * lin(h.slice(4, 6));
        // Pas de seuil arbitraire : on prend le texte qui CONTRASTE LE PLUS avec ce
        // fond (rapport WCAG (Lclair + 0,05) / (Lsombre + 0,05)). Luminances de
        // l'encre #141414 ≈ 0,0056 et du papier = 1.
        const contrastePapier = 1.05 / (L + 0.05);
        const contrasteEncre = (L + 0.05) / (0.0056 + 0.05);
        return contrasteEncre > contrastePapier ? INK : PAPER;
    }

    /* =====================================================================
       1. HEADER
       ===================================================================== */

    function renderHeader(ctx) {
        const f = ctx.feedback;
        const c = f.course || {};
        const a = f.artefact || {};
        const s = f.student || {};

        const meta = [
            c.code,
            c.session ? c.session.toLowerCase() : '',
            (a.number && a.total) ? `production ${a.number} de ${a.total}` : ''
        ].filter(Boolean).join(' / ');

        const ligneEleve = [
            (s.firstName || s.lastName) ? `<b style="color: ${INK}; font-weight: 600;">${esc((s.firstName + ' ' + s.lastName).trim())}</b>` : '',
            s.da ? `DA ${esc(s.da)}` : '',
            s.group ? `Gr. ${esc(s.group)}` : '',
            a.corrected ? `évalué ${esc(formaterDateLongue(a.corrected))}` : ''   // #571 — le repli `return iso` rend la chaîne brute
        ].filter(Boolean).join(' · ');
        // Le nom de la grille, sous la ligne de l'élève (demande de Grégoire, 2 sept. 2026) :
        // c'est ce qui dit à l'élève sur quoi la copie a été lue. Nom de grille = donnée
        // utilisateur, échappé.
        const g = f.grille || {};
        const ligneGrille = g.nom
            ? `<div style="font-family: ${FONT_MONO}; font-size: 9px; color: ${MUTED}; margin-top: 1px;">grille ${esc(g.nom)}</div>`
            : '';

        const titreHTML = a.title
            ? `<h1 style="font-size: 20px; margin: 2px 0 0 0; font-weight: 700; letter-spacing: -0.4px;">${esc(a.title)}${a.activity ? `<span style="font-weight: 500; color: ${MUTED};"> — ${esc(a.activity)}</span>` : ''}</h1>`
            : '';

        const colGauche = `
            <div>
                ${meta ? `<div style="${styleMonoLabel()} font-size: 8.5px;">${esc(meta)}</div>` : ''}
                ${titreHTML}
                ${ligneEleve ? `<div style="font-family: ${FONT_MONO}; font-size: 9px; color: ${MUTED}; margin-top: 2px;">${ligneEleve}</div>` : ''}
                ${ligneGrille}
            </div>`;

        const trimestreBar = renderTrimestreBar(ctx);

        return `
            <header style="display: grid; grid-template-columns: 1fr auto; align-items: end; gap: 12px; margin-bottom: 10px;">
                ${colGauche}
                ${trimestreBar}
            </header>`;
    }

    function renderTrimestreBar(ctx) {
        const trim = ctx.feedback.trimestre || [];
        if (!trim.length) return '<div></div>';

        const cases = trim.map(t => {
            const active = t.status === 'current';
            const done   = t.status === 'done';
            const todo   = t.status === 'todo';

            let bg = 'transparent';
            let color = MUTED;
            // Bordure transparente par défaut (pour préserver les dimensions
            // exactes du carré quand on ajoute une bordure noire pour les
            // retenus, grâce à box-sizing: border-box).
            let border = `1px dashed ${LINE}`;
            let contenu = t.n != null ? String(t.n) : '';

            if (active) {
                // L'artefact courant est marqué par un ▼ au-dessus de la case
                // (cf. indicateurHaut plus bas) ; la case elle-même prend la
                // couleur IDME comme un done normal — plus de fond noir.
                bg = ctx.codeColor[t.code] || MUTED; color = texteSur(bg); border = `1px solid ${bg}`;
                contenu = t.code || (t.n != null ? String(t.n) : '');
            } else if (done) {
                bg = ctx.codeColor[t.code] || MUTED; color = texteSur(bg); border = `1px solid ${bg}`;
                contenu = t.code || (t.n != null ? String(t.n) : '');
            }

            // Encadrement des artefacts retenus dans le portfolio : double bordure
            // noire (override la bordure de fond ; box-sizing préserve 22×22 mais
            // réduit l'espace intérieur à ~16px ce qui reste lisible pour 1 lettre IDME).
            if (t.retenu) {
                border = `3px double ${INK}`;
            }

            // Indicateur au-dessus de la case : ▼ pour l'artefact courant,
            // sinon ● si obligatoire, sinon espace vide pour préserver l'alignement.
            const indicateurHaut = active
                ? `<div style="height: 7px; font-size: 8px; line-height: 1; color: ${INK}; font-weight: 700;">&#x25BC;</div>`
                : (t.obligatoire
                    ? `<div style="height: 7px; font-size: 8px; line-height: 1; color: ${INK};">●</div>`
                    : `<div style="height: 7px;"></div>`);

            // Date d'échéance sous la case pour tous les artefacts (rendue
            // disponible pour tous les status par construireTrimestre).
            const dateDue = t.due
                ? `<div style="font-family: ${FONT_MONO}; font-size: 6px; color: ${MUTED}; letter-spacing: 0.2px; line-height: 1;">${esc(formaterDateCourte(t.due))}</div>`
                : '';

            // Ne pas afficher la legende numero pour les cases todo : la boite
            // 22x22 montre deja t.n (contenu fallback). Sinon doublon visuel
            // « 3 / 3 » pour chaque artefact non encore evalue. La legende
            // sert a complementer les cases active/done qui montrent le code
            // IDME dans la boite. (nit5)
            const numero = (t.n != null && !todo)
                ? `<div style="font-family: ${FONT_MONO}; font-size: 6.5px; color: ${active ? INK : MUTED}; font-weight: ${active ? 700 : 400};">${esc(t.n)}</div>`
                : '';

            return `
                <div style="width: 26px; display: flex; flex-direction: column; align-items: center; gap: 1px;">
                    ${indicateurHaut}
                    <div style="box-sizing: border-box; width: 22px; height: 22px; border-radius: 2px; background: ${bg}; color: ${color}; border: ${border}; display: flex; align-items: center; justify-content: center; font-family: ${FONT_MONO}; font-weight: 700; font-size: 10px;">${esc(contenu)}</div>
                    ${numero}
                    ${dateDue}
                </div>`;
        }).join('');

        return `
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 3px;">
                <div style="font-family: ${FONT_MONO}; font-size: 7.5px; color: ${MUTED}; letter-spacing: 0.3px;">PROGRESSION · TRIMESTRE</div>
                <div style="display: flex; gap: 2px;">${cases}</div>
            </div>`;
    }

    /* =====================================================================
       1bis. MARQUEUR « VUE RECALCULÉE A POSTERIORI » (#347)
       Avertit l'enseignant : le bilan (note de portfolio, progression) agrège
       des artefacts ultérieurs à la remise de celui-ci. La synthèse affichée
       n'est donc PAS la rétroaction historique reçue par l'élève au moment T.
       Bandeau neutre, ton sobre — aligné sur les mentions « provisoire » du
       fichier (inline px/hex, html2canvas ne résout pas var(--…)).
       ===================================================================== */

    function renderMarqueurRecalcul(ctx) {
        if (!ctx.feedback || ctx.feedback.recalculee !== true) return '';
        const message = 'Vue recalculée — peut différer de la rétroaction reçue par l’élève au moment de la remise.';
        return `
            <div style="margin-bottom: 10px; padding: 6px 9px; background: ${CARD}; border-left: 3px solid ${MUTED}; border-radius: 2px; font-size: 9px; font-style: italic; color: ${MUTED}; line-height: 1.4;">
                ${esc(message)}
            </div>`;
    }

    /* =====================================================================
       2. RUBAN OBJ / TÂCHE / CONTEXTE
       ===================================================================== */

    function renderRuban(ctx) {
        const a = ctx.feedback.artefact || {};
        const cellules = [
            { label: 'OBJECTIF', texte: a.objective },
            { label: 'TÂCHE',    texte: a.task },
            { label: 'CONTEXTE', texte: a.context }
        ];

        // #941 lot S3 (C5) — une cellule vide ne s'affiche pas : sans cartouche, pas d'étiquette
        // « CONTEXTE » suivie de rien (même règle pour l'objectif et la tâche). Toutes vides : pas de ruban.
        const pleines = cellules.filter(c => c.texte && c.texte.trim());
        if (!pleines.length) return '';

        const inner = pleines.map(c => `
            <div>
                <div style="${styleMonoLabel()} margin-bottom: 2px;">${esc(c.label)}</div>
                <div>${esc(c.texte || '')}</div>
            </div>`).join('');

        return `
            <div style="background: ${CARD}; padding: 8px 10px; margin-bottom: 10px; border-radius: 3px; display: grid; grid-template-columns: repeat(${pleines.length}, 1fr); gap: 14px; font-size: 9.5px;">
                ${inner}
            </div>`;
    }

    /* =====================================================================
       3. TABLEAU DE BORD CRITÈRES
       ===================================================================== */

    function renderCriteres(ctx) {
        const criteres = ctx.feedback.criteria || [];
        if (!criteres.length) return '';

        // Retouche du lot 3 (4 sept. 2026) — la légende de l'échelle ne s'imprime que si au
        // moins un critère rendu passe par la rangée de niveaux. Sur une grille entièrement
        // analytique, aucun critère ne la lit : « 0 Aucun · I · D · M · E » ne dirait rien à
        // l'élève qui ne voit que des chiffres. Grille mixte : elle reste.
        const legende = criteres.some(c => typeof c.points !== 'number') ? renderLegende(ctx) : '';
        const lignes = criteres.map((c, i) => renderCritere(ctx, c, i === criteres.length - 1)).join('');

        return `
            <section style="margin-bottom: 10px;">
                ${sectionHeader('Rétroaction par critère', legende)}
                <div style="border: 1px solid ${LINE}; border-radius: 3px; overflow: hidden;">
                    ${lignes}
                </div>
            </section>`;
    }

    function renderLegende(ctx) {
        const items = (ctx.feedback.scale || []).map(s => `
            <div style="display: flex; align-items: center; gap: 3px;">
                <div style="width: 8px; height: 8px; background: ${s.color}; border-radius: 1px;"></div>
                <span style="color: ${MUTED};"><b style="color: ${INK};">${esc(s.code)}</b> ${esc(s.label)}</span>
            </div>`).join('');
        return `<div style="display: flex; gap: 8px; font-family: ${FONT_MONO}; font-size: 8px;">${items}</div>`;
    }

    /**
     * La ligne compacte de calcul d'un critère algorithmique (sortie de `renderCritere`, étape 2a).
     */
    function ligneCalculAlgo(a) {
        // 21 oct. 2026 (étape 0) : la virgule décimale (« 13,75/20 (68,8 %) »), les décimales d'hier. Les décimales
        // fixes, l'appelant les donne au formateur partagé : `formaterNombre(n, 2)` (#1137, 22 oct.).
        // Étape 2a (22 oct.) : les noms du critère (`a.noms`, lus par `enoncesAlgo.noms`) ; la règle du pluriel
        // est celle des énoncés (`enoncesAlgo.accorder`, le singulier sous 2), pour les DEUX noms. Sans le
        // registre ni les noms, « erreur » et « mot » : la ligne d'hier. Échappés : ce sont des mots tapés.
        const E = (typeof window !== 'undefined' && window.enoncesAlgo) ? window.enoncesAlgo : null;
        const noms = a.noms || { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } };
        const accorder = (n, paire) => (E && typeof E.accorder === 'function') ? E.accorder(n, paire)
            : (Math.abs(Number(n)) >= 2 ? paire.pluriel : paire.singulier);
        const noteTxt = (typeof a.noteCalculee === 'number') ? formaterNombre(a.noteCalculee, 2) : '—';
        const pctTxt  = (typeof a.pourcentage === 'number')  ? formaterPourcentage(a.pourcentage, 1) : '—';
        const mention = (E && typeof E.mentionPonderee === 'function') ? E.mentionPonderee(a.erreurs, a.sommePonderee) : '';
        return `<div style="font-family: ${FONT_MONO}; font-size: 9px; color: ${MUTED}; margin-bottom: 3px;">`
                  + `${esc(a.erreurs)} ${esc(accorder(a.erreurs, noms.erreurs))}${esc(mention)} sur ${esc(a.mots)} ${esc(accorder(a.mots, noms.mots))} &rarr; <b style="color: ${INK};">${esc(noteTxt)}/${esc(formaterNombre(a.ponderation))}</b> (${esc(pctTxt)})`
                  + `</div>`;
    }

    function renderCritere(ctx, critere, isLast) {
        const scale = ctx.feedback.scale || [];
        const idx = scale.findIndex(s => s.code === critere.code);

        // Lot 3 (4 sept. 2026) — CE QUE L'ÉLÈVE LIT D'UN CRITÈRE ANALYTIQUE : LE CHIFFRE,
        // rien d'autre (décision de Grégoire). Le niveau déduit a choisi le commentaire ;
        // il ne s'imprime pas. « 24 / 30 » prend la place de la rangée de l'échelle.
        const segments = (typeof critere.points === 'number')
            ? `<div style="font-family: ${FONT_MONO}; font-size: 11px; font-weight: 800; color: ${INK};">${esc(formaterNombre(critere.points))} / ${esc(formaterNombre(critere.weight))}</div>`
            : scale.map((s, i) => {
            const atteint = i <= idx;
            const courant = i === idx;
            const bg = atteint ? (ctx.codeColor[critere.code] || MUTED) : CARD;
            const color = atteint ? texteSur(bg) : MUTED;   // #571 — lisible sur la couleur de l'échelle
            const border = courant ? `1px solid ${INK}` : `1px solid ${LINE}`;
            const weight = courant ? 800 : 500;
            return `<div style="flex: 1; height: 18px; border-radius: 2px; background: ${bg}; color: ${color}; border: ${border}; display: flex; align-items: center; justify-content: center; font-family: ${FONT_MONO}; font-size: 9px; font-weight: ${weight};">${esc(s.code)}</div>`;
        }).join('');

        // Lot 3 — sous le nom d'un critère analytique, le poids se dit en points, pas en % :
        // le maximum EST le poids (arrêté 3), et « 30% » à côté de « 24 / 30 » se lirait deux fois.
        const sub = (typeof critere.points === 'number') ? [critere.sub].filter(Boolean).join(' · ') : [
            critere.weight ? formaterPourcentage(critere.weight) : '',
            critere.sub
        ].filter(Boolean).join(' · ');

        // Ligne compacte de calcul pour les critères algorithmiques :
        //   « 15 erreurs sur 584 mots → 7.16/20 (35.8%) »
        // 21 oct. 2026 (décision de Grégoire, 8 h 39) : la parenthèse quand la somme pondérée diffère ;
        // elle sort de la même source que la phrase du décompte. ↻ 22 oct., 17 h : « 5 erreurs (3,5 après
        // pondération) sur 400 mots », sans accord. Étape 2a : les deux noms sont ceux du critère.
        // Données lues depuis l'évaluation (donneesAlgorithmiques) + la
        // pondération du critère (grille). Aucun hard-code.
        const ligneAlgo = critere.algo ? ligneCalculAlgo(critere.algo) : '';

        // #1120, lot 3 (geste 4) — le texte de la tranche que les points atteignent (reçu de `construireCriteres`),
        // sous le chiffre et avant le commentaire de la cartouche ; ses sauts de ligne gardés (`pre-line`).
        const texteTranche = critere.tranche
            ? `<div style="white-space: pre-line;${critere.comment ? ' margin-bottom: 4px;' : ''}">${esc(critere.tranche)}</div>`
            : '';

        return `
            <div style="display: grid; grid-template-columns: 130px 135px 1fr; gap: 10px; align-items: center; padding: 8px 10px; ${isLast ? '' : `border-bottom: 1px solid ${LINE};`}">
                <div>
                    <div style="font-size: 11px; font-weight: 700;">${esc(critere.name)}</div>
                    ${sub ? `<div style="font-family: ${FONT_MONO}; font-size: 7.5px; color: ${MUTED}; letter-spacing: 0.3px;">${esc(sub)}</div>` : ''}
                </div>
                <div style="display: flex; gap: 3px; align-items: center;">${segments}</div>
                <div style="font-size: 10px; line-height: 1.35;">
                    ${ligneAlgo}
                    ${texteTranche}
                    ${esc(critere.comment || '')}
                </div>
            </div>`;
    }

    /* =====================================================================
       4. BANDEAU NIVEAU GLOBAL
       ===================================================================== */

    // #674 — LES MOTS QUE L'ÉLÈVE LIT quand la rétroaction n'est pas conclue.
    // ▣ ARRÊTÉS PAR GRÉGOIRE le 2 septembre 2026 (option C, sur trois proposées) :
    //   « Cette copie n’a pas de niveau général : Langue (20 %) reste à évaluer. »
    // Part de la copie, dit ce qui manque en un mot que l'élève comprend, nomme le
    // critère avec son poids, et pointe la suite sans désigner de fautif. Sans liste
    // (copie muette d'avant ce lot, niveau général jamais établi), la phrase s'arrête
    // au premier membre. Le comportement, lui, était tranché le 1er septembre : le
    // PDF refuse de conclure — pas de bandeau « Niveau général » — et NOMME ce qui
    // manque. ⚠ C'est du texte que ses élèves reçoivent : il ne se réécrit pas sans lui.
    const TEXTE_PORTEE_INCOMPLETE = 'Cette copie n’a pas de niveau général';

    function renderPorteeIncomplete(ctx, portee) {
        const liste = (portee.criteresHorsNote || []).map(c =>
            c.motif === 'niveau-sans-valeur' ? `${c.nom} (${c.niveau})` : `${c.nom} (${formaterPourcentage(c.ponderation)})`);
        const suite = liste.length
            ? ` : ${liste.join(', ')} ${liste.length > 1 ? 'restent' : 'reste'} à évaluer.`
            : '.';
        return `
            <section style="margin-bottom: 10px;">
                <div style="padding: 10px 12px; border: 1.5px solid ${MUTED}; border-radius: 3px; color: ${INK}; font-size: 10px; line-height: 1.5;">
                    <div style="${styleMonoLabel()} margin-bottom: 4px;">Niveau général</div>
                    ${esc(TEXTE_PORTEE_INCOMPLETE + suite)}
                </div>
            </section>`;
    }

    /**
     * #941 lot S1 (D4, 24 sept. 2026) — en tête du bloc « Niveau général » d'une copie en points,
     * sa note : « Note de la copie : 74 % » (forme proposée par Cowork, retenue par Grégoire).
     * Aucun nom de niveau (D1, décision A). Le pourcentage s'écrit comme dans le bloc de la
     * note provisoire (arrondi au dixième).
     */
    function renderNoteDeLaCopie(o) {
        if (typeof o.note !== 'number' || isNaN(o.note)) return '';
        return `
            <section style="margin-bottom: 10px;">
                <div style="padding: 10px 12px; border: 1.5px solid ${MUTED}; border-radius: 3px; color: ${INK};">
                    <div style="${styleMonoLabel()} margin-bottom: 4px;">Niveau général</div>
                    <div style="font-size: 16px; font-weight: 800;">${esc('Note de la copie : ' + formaterNotePourcentage(o.note))}</div>
                </div>
            </section>`;
    }

    function renderNiveauGlobal(ctx) {
        const o = ctx.feedback.overall || {};
        // #674 — LE PDF REFUSE DE CONCLURE quand la note ne porte pas sur toute la
        // grille, ou quand des critères ont un niveau mais qu'aucun niveau général
        // n'a pu être établi (copie muette d'avant ce lot). Avant, le bandeau était
        // simplement omis : une grille amputée était indistinguable d'une grille qui
        // n'avait jamais eu ce critère.
        const portee = ctx.feedback.portee || null;
        // #941 lot S1 — une copie en points n'a jamais de niveau général : l'absence de code
        // n'y est pas un refus de conclure, seule une portée incomplète l'est.
        if (portee && (portee.incomplete || (portee.commencee && !o.code && !o.enPoints))) {
            return renderPorteeIncomplete(ctx, portee);
        }
        if (o.enPoints) return renderNoteDeLaCopie(o);
        if (!o.code) return '';

        const couleur = ctx.codeColor[o.code] || o.color || MUTED;

        return `
            <section style="margin-bottom: 10px;">
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 14px; padding: 10px 12px; background: ${couleur}; color: ${texteSur(couleur)}; border-radius: 3px; align-items: center;">
                    <div style="font-size: 44px; font-weight: 800; line-height: 0.85; letter-spacing: -2px;">${esc(o.code)}</div>
                    <div style="font-family: ${FONT_MONO}; font-size: 9px; letter-spacing: 0.8px; opacity: 0.9; text-transform: uppercase;">Niveau général${o.label ? ' · ' + esc(o.label) : ''}</div>
                </div>
            </section>`;
    }

    /* =====================================================================
       5. TAMPONS + ERREURS FE (côte à côte)
       ===================================================================== */

    function renderTamponsErreurs(ctx) {
        const stamps = Array.isArray(ctx.feedback.stamps) ? ctx.feedback.stamps : [];
        const errors = ctx.feedback.errors || [];

        const colTampons = renderTampons(ctx, stamps);
        const colErreurs = renderErreurs(ctx, errors);

        // Si les deux colonnes sont vides, on retire la section.
        if (!colTampons && !colErreurs) return '';

        // Si une seule colonne, elle prend toute la largeur.
        if (colTampons && !colErreurs) {
            return `<section style="margin-bottom: 10px;">${colTampons}</section>`;
        }
        if (!colTampons && colErreurs) {
            return `<section style="margin-bottom: 10px;">${colErreurs}</section>`;
        }

        return `
            <section style="display: grid; grid-template-columns: 1.55fr 1fr; gap: 14px; margin-bottom: 10px;">
                <div>${colTampons}</div>
                <div>${colErreurs}</div>
            </section>`;
    }

    function renderTampons(ctx, stamps) {
        // #760 — une colonne par catégorie utilisée, dans l'ordre des réglages ;
        // nom et couleur viennent des données (`construireStamps`).
        const famillesNonVides = stamps.filter(fam => fam && Array.isArray(fam.items) && fam.items.length > 0);
        if (!famillesNonVides.length) return '';

        const colonnes = famillesNonVides.map(fam =>
            renderColonneTampons(fam.id, fam.items, fam.couleur || '#767169', fam.nom || fam.id)
        ).join('');
        const cols = `repeat(${famillesNonVides.length}, 1fr)`;

        return `
            ${sectionHeader('Commentaires ciblés (tampons)')}
            <div style="display: grid; grid-template-columns: ${cols}; gap: 6px;">${colonnes}</div>`;
    }

    function renderColonneTampons(fam, items, couleur, libelleFamille) {
        const total = items.reduce((s, it) => s + (it.count || 0), 0);
        const lignes = items.map(it => {
            const couleurTampon = it.couleur || couleur;
            // Visuel à gauche : icône PNG (déjà tintée à la couleur de la
            // catégorie via canvas source-in dans le module data) + badge
            // compteur en couleur de catégorie. Fallback pastille si pas d'icône.
            const visuel = it.icone
                ? `<div style="position: relative; width: 28px; height: 28px;">
                       <img src="${it.icone}" alt="" style="width: 28px; height: 28px; display: block;" />
                       <div style="position: absolute; top: -3px; right: -5px; min-width: 14px; height: 14px; border-radius: 50%; background: ${couleurTampon}; color: ${PAPER}; display: flex; align-items: center; justify-content: center; font-family: ${FONT_MONO}; font-weight: 700; font-size: 8px; padding: 0 3px; box-sizing: border-box;">${esc(it.count)}</div>
                   </div>`
                : `<div style="min-width: 22px; height: 16px; border-radius: 2px; background: ${couleurTampon}; color: ${PAPER}; display: flex; align-items: center; justify-content: center; font-family: ${FONT_MONO}; font-weight: 700; font-size: 9px; padding: 0 4px;">${esc(it.count)}</div>`;

            return `
                <div style="display: grid; grid-template-columns: 32px 1fr; gap: 6px; margin-bottom: 5px; align-items: start;">
                    ${visuel}
                    <div>
                        <div style="font-weight: 600; font-size: 9px;">${esc(it.nom)}</div>
                        ${it.comment ? `<div style="font-size: 9px; line-height: 1.35; margin-top: 1px;">${esc(it.comment)}</div>` : ''}
                    </div>
                </div>`;
        }).join('');

        return `
            <div style="border: 1px solid ${LINE}; border-radius: 3px; padding: 6px 7px; background: ${PAPER};">
                <div style="font-family: ${FONT_MONO}; font-size: 7.5px; letter-spacing: 0.6px; text-transform: uppercase; color: ${couleur}; font-weight: 700; margin-bottom: 5px; padding-bottom: 3px; border-bottom: 1px solid ${LINE};">${esc(libelleFamille)} <span style="color: ${MUTED}; font-weight: 500;">· ${total}</span></div>
                ${lignes}
            </div>`;
    }

    function renderErreurs(ctx, errors) {
        if (!errors || !errors.length) return '';
        const total = ctx.feedback.errorsTotal || 0;

        const lignes = errors.map((e, i) => {
            const retro = e.retroaction
                ? `<div style="font-size: 8.5px; line-height: 1.35; margin-top: 2px;">${esc(e.retroaction)}</div>`
                : '';
            const pastilleBg = e.color || INK;
            return `
                <div style="display: grid; grid-template-columns: 22px 1fr 26px; gap: 6px; align-items: start; padding: 5px 0; ${i === 0 ? '' : `border-top: 1px dashed ${LINE};`}">
                    <div style="width: 18px; height: 18px; border-radius: 50%; background: ${pastilleBg}; color: ${texteSur(pastilleBg)}; display: flex; align-items: center; justify-content: center; font-family: ${FONT_MONO}; font-size: 9px; font-weight: 700; margin-top: 1px;">${esc(e.code != null ? e.code : '?')}</div>
                    <div>
                        <div style="font-size: 9px; font-weight: 600;">${esc(e.name)}</div>
                        ${retro}
                    </div>
                    <div style="font-family: ${FONT_MONO}; font-size: 11px; font-weight: 700; text-align: right; margin-top: 1px;">${esc(e.count)}</div>
                </div>`;
        }).join('');

        const droite = total
            ? `<span style="font-family: ${FONT_MONO}; font-size: 8px; color: ${MUTED};">/ ${esc(total)} erreur${total > 1 ? 's' : ''}</span>`
            : '';

        // #581 — CE TITRE S'IMPRIME SUR LE PDF REMIS À L'ÉLÈVE.
        // Il disait « Français écrit » à tout le monde, y compris à l'élève
        // d'un enseignant de chimie dont le critère porte un tout autre nom.
        // Le nom vient maintenant de la grille (`errorsLabel`, construit dans
        // le module data) ; le repli n'invente aucune discipline.
        const titre = ctx.feedback.errorsLabel || 'Erreurs annotées';
        return `
            ${sectionHeader(`${titre} · 2 catégories les plus fréquentes`, droite)}
            <div style="border: 1px solid ${LINE}; border-radius: 3px; padding: 6px 10px;">${lignes}</div>`;
    }

    /* =====================================================================
       6. BILAN — Tableau Section / Détail (4 rangées max)
       ===================================================================== */

    function renderBilan(ctx) {
        const b = ctx.feedback.bilan || {};

        const rangees = [
            renderRangeeConcentration(b.concentration),
            renderRangeeRecurrents(b.recurrents),
            renderRangeeJetons(b.jetons),
            renderRangeeNote(b.note)
        ].filter(Boolean);

        if (!rangees.length) return '';

        const intro = b.intro
            ? `<div style="font-size: 9px; line-height: 1.4; color: ${MUTED}; font-style: italic; margin-bottom: 6px; white-space: pre-line;">${esc(b.intro)}</div>`
            : '';

        return `
            <footer style="margin-top: auto;">
                ${sectionHeader('Bilan')}
                ${intro}
                <div style="border: 1px solid ${LINE}; border-radius: 3px; overflow: hidden;">
                    ${rangees.join('')}
                </div>
            </footer>`;
    }

    /**
     * Rangée du tableau bilan (Section / Détail)
     * @param {string} titre - Étiquette de la colonne gauche (mono CAPS)
     * @param {string} contenu - HTML déjà échappé/composé pour la colonne droite
     * @param {boolean} isLast - true si dernière rangée (pas de border-bottom)
     */
    function renderRangeeBilan(titre, contenu, isLast) {
        return `
            <div style="display: grid; grid-template-columns: 110px 1fr; gap: 10px; padding: 7px 10px; ${isLast ? '' : `border-bottom: 1px solid ${LINE};`}">
                <div style="font-family: ${FONT_MONO}; font-size: 8px; letter-spacing: 0.6px; text-transform: uppercase; font-weight: 700; color: ${INK}; padding-top: 1px;">${esc(titre)}</div>
                <div style="font-size: 9.5px; line-height: 1.45;">${contenu}</div>
            </div>`;
    }

    function renderRangeeConcentration(concentration) {
        if (!concentration) return null;

        const lignes = [];

        if (concentration.tousMaitrises) {
            if (concentration.messageGlobal) {
                lignes.push(`<div>${esc(concentration.messageGlobal)}</div>`);
            }
        } else if (Array.isArray(concentration.priorites) && concentration.priorites.length) {
            const items = concentration.priorites.map(p => `<li style="margin-bottom: 2px;">${esc(p)}</li>`).join('');
            lignes.push(`<ul style="margin: 0; padding-left: 14px;">${items}</ul>`);
        }

        // ⮕ #555 lot 2 — LA ZONE INTERMÉDIAIRE. Entre le seuil de suffisance et
        // celui de maîtrise, l'apprentissage est réel mais NON DURABLE : dans les
        // mots de Grégoire, « maîtrisé, mais en développement ». Ces critères ne
        // sont donc pas des priorités — les y mettre dirait à l'élève qu'il n'a
        // rien acquis — mais les taire lui laisserait croire que c'est réglé.
        //
        // ⚠ La ligne s'affiche AUSSI quand tout est maîtrisé au sens du premier
        // seuil : c'est justement le cas où elle apprend quelque chose. Elle est
        // hors du `else if` pour cette raison.
        //
        // ⚠ Une échelle sans repères ne produit AUCUN signalé (`zoneDuNiveau`
        // rend `null`) : la ligne disparaît d'elle-même, sans note technique dans
        // un document remis à l'élève.
        if (Array.isArray(concentration.signales) && concentration.signales.length) {
            const items = concentration.signales.map(p => `<li style="margin-bottom: 2px;">${esc(p)}</li>`).join('');
            lignes.push('<div style="margin-top: 6px;">Acquis en développement, à consolider :</div>'
                + `<ul style="margin: 0; padding-left: 14px;">${items}</ul>`);
        }

        if (!lignes.length) return null;
        return renderRangeeBilan('Présentement, il faut se concentrer sur', lignes.join(''), false);
    }

    function renderRangeeRecurrents(recurrents) {
        if (!recurrents) return null;

        const lignes = [];
        if (recurrents.force) lignes.push(`<div style="font-weight: 600; margin-bottom: 3px;">${esc(recurrents.force)}</div>`);
        // #940 — ce qui revient d'une copie à l'autre, là où se tenaient les tampons de la
        // copie (ils sont en entier dans « Commentaires ciblés »).
        if (Array.isArray(recurrents.recurrences) && recurrents.recurrences.length) {
            const items = recurrents.recurrences.map(r => `<li style="margin-bottom: 2px;">${esc(r)}</li>`).join('');
            lignes.push(`<ul style="margin: 0 0 4px 0; padding-left: 14px;">${items}</ul>`);
        }
        if (recurrents.francais) lignes.push(`<div>${esc(recurrents.francais)}</div>`);
        if (recurrents.progression) lignes.push(`<div>${esc(recurrents.progression)}</div>`);
        if (recurrents.tendance) lignes.push(`<div>${esc(recurrents.tendance)}</div>`);
        if (recurrents.ameliorations) lignes.push(`<div>${esc(recurrents.ameliorations)}</div>`);

        if (!lignes.length) return null;
        return renderRangeeBilan('Points récurrents', lignes.join(''), false);
    }

    function renderRangeeJetons(jetons) {
        if (!jetons || !Array.isArray(jetons.types) || !jetons.types.length) return null;

        const lignes = jetons.types.map(t => {
            const compteur = `<div>${esc(t.nom)} : ${esc(t.utilises)} / ${esc(t.max)}</div>`;
            const artefacts = (t.artefacts && t.artefacts.length)
                ? `<ul style="margin: 1px 0 4px 0; padding-left: 14px;">${t.artefacts.map(a => `<li>${esc(a)}</li>`).join('')}</ul>`
                : '<div style="margin-bottom: 4px;"></div>';
            return compteur + artefacts;
        }).join('');

        return renderRangeeBilan('Jetons utilisés', lignes, false);
    }

    function renderRangeeNote(note) {
        if (!note || !Array.isArray(note.selection) || !note.selection.length) return null;

        const estHybride = note.estHybride === true;
        const estFinale  = note.estFinale  === true;
        const titreBloc  = estFinale ? 'Note finale' : 'Note provisoire';
        const nbSelection = note.nombreSelection || note.selection.length;

        // Formate « niveau, note % » si les deux sont présents ; tombe sur le
        // seul présent sinon (ex. obligatoire non remis = pas de note).
        const formaterNiveauNote = (niveau, n) => {
            const noteAffichee = (typeof n === 'number') ? formaterNotePourcentage(n) : null;
            if (niveau && noteAffichee) return `${niveau}, ${noteAffichee}`;
            if (niveau) return niveau;
            if (noteAffichee) return noteAffichee;
            return '';
        };

        // Calcul détaillé par catégorie : (75% + 75% + 75% + 73%) ÷ 4 = 74.5% × 65% = 48.4 pts
        // Pour les obligatoires, les non-remises comptent comme 0 (règle UI
        // explicite : « Note = 0 si production non remise »), cohérent avec
        // _selectionnerArtefactsHybride. Pour la sélection, les non évalués
        // sont ignorés.
        const calculerCategorie = (items, ponderation, comptenonRemisCommeZero) => {
            const notes = items.map(i => {
                if (typeof i.note === 'number') return i.note;
                return comptenonRemisCommeZero ? 0 : null;
            }).filter(n => n !== null);
            if (notes.length === 0 || ponderation == null) return null;
            const somme = notes.reduce((s, n) => s + n, 0);
            const moyenne = somme / notes.length;
            return { notes, somme, moyenne, contribution: moyenne * ponderation / 100 };
        };
        const formaterCalcul = (calc, ponderation) => {
            if (!calc) return '';
            const addition = calc.notes.map(n => formaterNotePourcentage(n)).join(' + ');
            return `(${addition}) &divide; ${calc.notes.length} = <b>${formaterNotePourcentage(calc.moyenne)}</b>`
                 + ` &times; ${formaterPourcentage(ponderation)} = <b>${formaterPoints(calc.contribution)}</b>`;
        };
        const calcSel = estHybride ? calculerCategorie(note.selection, note.ponderationSelection, false) : null;
        const calcObl = estHybride ? calculerCategorie(note.obligatoires || [], note.ponderationObligatoires, estFinale) : null;

        // ----- Colonne gauche : sélection (les N meilleures) + calcul -----
        const badgePondSel = (estHybride && note.ponderationSelection != null) ? ` (${esc(formaterPourcentage(note.ponderationSelection))})` : '';
        const evaluesSel = (note.nombreEvaluesSelection != null) ? note.nombreEvaluesSelection : nbSelection;
        // #883 — MOTS ARRÊTÉS PAR GRÉGOIRE (16 sept. 2026) : « 1 retenue sur 4 possibles », et
        // « , parmi N évaluées » seulement quand il y en a plus que de retenues. L'ancienne tournure
        // (« les 1 meilleures sur 2 évaluées ») faisait lire le nombre retenu comme le nombre de la pratique.
        const nARetenir = note.nombreARetenirSelection;
        const libelleRetenues = (typeof nARetenir === 'number')
            ? `${esc(nbSelection)} retenue${nbSelection > 1 ? 's' : ''} sur ${esc(nARetenir)} possible${nARetenir > 1 ? 's' : ''}`
              + (evaluesSel > nbSelection ? `, parmi ${esc(evaluesSel)} évaluées` : '')
            : `les ${esc(nbSelection)} meilleures sur ${esc(evaluesSel)} évaluées`;
        // #941 lot S1 (D4) — en sommative, toutes les copies évaluées comptent : rien n'est
        // « retenu ». Mots que l'élève lit, VALIDÉS par Grégoire le 24 sept. 2026.
        const libelleSommative = nbSelection === 1
            ? 'Voici la production comptée dans ta note'
            : `Voici les ${esc(nbSelection)} productions comptées dans ta note`;
        const libelleSelection = note.sommative ? libelleSommative : estHybride
            ? `Sélection (${libelleRetenues})${badgePondSel}`
            // Une seule retenue (première évaluation du trimestre) : « les 1 meilleures » ne se lit pas,
            // et rien n'est comparé — mots de Grégoire (21 sept. 2026) : « la production retenue ».
            : (nbSelection === 1
                ? 'Voici la production retenue'
                : `Voici les ${esc(nbSelection)} meilleures productions que tu as réalisées`);
        const itemsSelection = note.selection.map(art => {
            const marqueur = formaterNiveauNote(art.niveau, art.note);
            const ligne = `${esc(art.titre)}${marqueur ? ` (${esc(marqueur)})` : ''}${art.activite ? ' : ' + esc(art.activite) : ''}`;
            return `<li style="margin-bottom: 2px;">${ligne}</li>`;
        }).join('');
        const calculSelHtml = calcSel
            ? `<div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid ${LINE}; font-size: 9.5px; color: ${MUTED};">${formaterCalcul(calcSel, note.ponderationSelection)}</div>`
            : '';
        const colGauche = `<div>${libelleSelection} :</div><ul style="margin: 2px 0 0 0; padding-left: 14px;">${itemsSelection}</ul>${calculSelHtml}`;

        // ----- Colonne droite : obligatoires (hybride) + calcul, puis à venir -----
        const blocsDroite = [];
        if (estHybride && Array.isArray(note.obligatoires) && note.obligatoires.length) {
            const badgePondObl = (note.ponderationObligatoires != null) ? ` (${esc(formaterPourcentage(note.ponderationObligatoires))})` : '';
            const items = note.obligatoires.map(o => {
                let ligne = esc(o.titre);
                const marqueur = formaterNiveauNote(o.niveau, o.note);
                ligne += marqueur ? ` (${esc(marqueur)})` : ' (non remis)';
                if (o.activite) ligne += ' : ' + esc(o.activite);
                if (o.echeance && !estFinale) ligne += ` (échéance : ${esc(formaterDateLongue(o.echeance))})`;
                return `<li style="margin-bottom: 2px;">${ligne}</li>`;
            }).join('');
            const calculOblHtml = calcObl
                ? `<div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid ${LINE}; font-size: 9.5px; color: ${MUTED};">${formaterCalcul(calcObl, note.ponderationObligatoires)}</div>`
                : '';
            blocsDroite.push(`<div>Obligatoires (${esc(note.obligatoires.length)} production${note.obligatoires.length > 1 ? 's' : ''})${badgePondObl} :</div><ul style="margin: 2px 0 0 0; padding-left: 14px;">${items}</ul>${calculOblHtml}`);
        }
        if (Array.isArray(note.avenir) && note.avenir.length && !estFinale) {
            const items = note.avenir.map(a => {
                let ligne = esc(a.titre);
                if (a.activite) {
                    ligne += ' : ' + esc(a.activite);
                    if (a.echeance) ligne += ` (échéance : ${esc(formaterDateLongue(a.echeance))})`;
                } else if (a.echeance) {
                    ligne += ` (échéance : ${esc(formaterDateLongue(a.echeance))})`;
                } else {
                    ligne += ' (configuration à venir)';
                }
                return `<li style="margin-bottom: 2px;">${ligne}</li>`;
            }).join('');
            blocsDroite.push(`<div style="margin-top: 8px;">Productions à venir :</div><ul style="margin: 2px 0 0 0; padding-left: 14px;">${items}</ul>`);
        }
        const colDroite = blocsDroite.join('');

        // ----- Bloc résultat final (en BAS, comme l'app) -----
        // Phrase calculée + grand chiffre encadré + plafonnement + mention provisoire.
        let resultatFinal = '';
        if (typeof note.moyenne === 'number' && !isNaN(note.moyenne)) {
            let phraseFinale;
            if (estHybride && !note.erreurPonderation && calcSel && calcObl) {
                phraseFinale = `Note finale = ${formaterPoints(calcSel.contribution)} + ${formaterPoints(calcObl.contribution)} = ${esc(formaterNotePourcentage(note.moyenne))}`;
            } else if (estHybride && note.erreurPonderation) {
                phraseFinale = `⚠ ${esc(note.erreurPonderation)}`;
            } else {
                phraseFinale = `Note finale = ${esc(formaterNotePourcentage(note.moyenne))}`;
            }
            const mentionPlafonnement = (note.plafonnement && note.plafonnement.actif)
                ? `<div style="margin-top: 4px; font-size: 9px; color: ${MUTED};">${note.plafonnement.echec
                    ? 'Note plafonnée (échec) : déficit de ' + esc(note.plafonnement.deficit) + ' production(s).'
                    : 'Note plafonnée par déficit de ' + esc(note.plafonnement.deficit) + ' production(s).'}</div>`
                : '';
            // #941 — mots VALIDÉS par Grégoire le 24 sept. (lot S1) ; la CONDITION est celle de D5 (lot S3) :
            // sans jetons déclarés par la pratique, la mention n'en parle pas — la même règle que le bloc
            // « Jetons utilisés » (`jetonsDeclares`, evaluation-jetons.js ; relecture de Cowork du lot S1, § 2).
            const texteProvisoire = note.sansJetons
                ? 'Note provisoire — peut changer selon tes prochains travaux.'
                : 'Note provisoire — peut changer selon tes prochains travaux et l\'application de jetons.';
            const mentionProvisoire = (!estFinale)
                ? `<div style="margin-top: 4px; font-size: 9px; color: ${MUTED}; font-style: italic;">${esc(texteProvisoire)}</div>`
                : '';
            resultatFinal = `
                <div style="margin-top: 12px; padding: 12px; border: 1px solid ${LINE}; border-radius: 4px; text-align: center;">
                    <div style="font-size: 10px; color: ${MUTED};">${phraseFinale}</div>
                    <div style="font-size: 28px; font-weight: 800; margin-top: 6px;">${esc(formaterNotePourcentage(note.moyenne))}</div>
                    ${mentionPlafonnement}
                    ${mentionProvisoire}
                </div>`;
        }

        // ----- Composition : 2 colonnes (Sélection / Obligatoires) puis bloc résultat -----
        const cols = colDroite
            ? `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                   <div>${colGauche}</div>
                   <div>${colDroite}</div>
               </div>`
            : colGauche;

        return renderRangeeBilan(titreBloc, cols + resultatFinal, true);
    }

    function formaterDateLongue(iso) {
        if (!iso) return '';
        try {
            const d = new Date(String(iso).indexOf('T') >= 0 ? iso : iso + 'T00:00:00');
            if (isNaN(d.getTime())) return iso;
            return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' });
        } catch (e) {
            return iso;
        }
    }

    /* =====================================================================
       7. PIED — ATTRIBUTION CC BY-NC-SA
       ===================================================================== */

    function renderPiedCC(ctx) {
        const c = ctx.feedback.course || {};
        const partsGauche = [c.teacher, c.code].filter(Boolean).join(' · ');

        return `
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid ${LINE}; display: flex; justify-content: space-between; align-items: center; font-family: ${FONT_MONO}; font-size: 7px; color: ${MUTED}; letter-spacing: 0.3px;">
                <span>${esc(partsGauche)}</span>
                <span>CC BY-NC-SA 4.0</span>
            </div>`;
    }

    /* =====================================================================
       UTILS
       ===================================================================== */

    function formaterDateCourte(iso) {
        if (!iso) return '';
        try {
            const d = new Date(String(iso).indexOf('T') >= 0 ? iso : iso + 'T00:00:00');
            if (isNaN(d.getTime())) return iso;
            // Format jj/mm (cf. demande Grégoire 24 mai 2026) — affichage compact
            // sous les cases de la barre de progression du trimestre.
            const jj = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            return jj + '/' + mm;
        } catch (e) {
            return iso;
        }
    }

    /* =====================================================================
       EXPORT
       ===================================================================== */

    window.syntheseRetroactionRendu = {
        _texteSur: texteSur,   // #571 — exposé pour la sentinelle (fonction pure)
        rendreSyntheseHTML: rendreSyntheseHTML
    };
})();
