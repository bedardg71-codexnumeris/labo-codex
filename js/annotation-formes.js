/* ===============================
   LES FORMES FERMÉES DE L'ANNOTATION (consigne du 31 oct. 2026, partie H)

   Cercle, rectangle, polygone : leur trait (plein, pointillé, vague), une seule fois pour l'écran
   (travaux-annotation.js) et pour le PDF que lisent les élèves (travaux-export-pdf.js). Une forme sans
   propriété `trait` est en trait plein : les annotations d'avant le restent, sans migration.

   Une vague part et revient à zéro sur chaque CHAÎNE : chaque côté d'un polygone (elle passe donc exactement
   par ses sommets, et les coins restent nets) ; le tour entier d'une ellipse (elle se referme sans raccord).
   Pur : aucune dépendance au DOM, sauf le contexte de dessin reçu.
   =============================== */
(function() {
    'use strict';

    var AMPLITUDE_DEFAUT = 6;
    var LONGUEUR_ONDE_DEFAUT = 30;
    var PAS_ELLIPSE = 256;

    /** Les sommets en pixels d'une forme fermée normalisée. Le rectangle est le polygone à quatre côtés. */
    function sommetsRectangle(x1, y1, x2, y2) {
        return [{ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }];
    }

    /** Le contour d'un polygone : une chaîne par côté. */
    function contourPolygone(sommets) {
        return sommets.map(function(s, i) {
            return { points: [s, sommets[(i + 1) % sommets.length]] };
        });
    }

    /** Le contour d'une ellipse : une seule chaîne, qui se referme sur son premier point. */
    function contourEllipse(cx, cy, rx, ry) {
        var points = [];
        for (var i = 0; i <= PAS_ELLIPSE; i++) {
            var a = (i / PAS_ELLIPSE) * Math.PI * 2;
            points.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) });
        }
        return [{ points: points }];
    }

    function longueurs(points) {
        var cumul = [0];
        for (var i = 1; i < points.length; i++) {
            cumul.push(cumul[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
        }
        return cumul;
    }

    /** Le point à la distance `d` le long de la chaîne, et sa normale. */
    function pointSurChaine(points, cumul, d) {
        var i = 1;
        while (i < points.length - 1 && cumul[i] < d) i++;
        var a = points[i - 1], b = points[i];
        var seg = (cumul[i] - cumul[i - 1]) || 1;
        var t = (d - cumul[i - 1]) / seg;
        return {
            x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t,
            nx: -(b.y - a.y) / seg, ny: (b.x - a.x) / seg
        };
    }

    /**
     * LA fonction de la vague : les points du tracé ondulé le long d'un contour fermé.
     * Sur chaque chaîne, un nombre entier d'ondes : la vague y revient à zéro à l'arrivée.
     * @param {Array<{points: Array<{x,y}>}>} contour - rendu par contourPolygone ou contourEllipse
     * @returns {Array<{x,y}>} vide si le contour n'a pas de longueur
     */
    function pointsVagueContour(contour, amplitude, longueurOnde) {
        var sortie = [];
        contour.forEach(function(chaine) {
            var cumul = longueurs(chaine.points);
            var total = cumul[cumul.length - 1];
            if (total < 1) return;
            var ondes = Math.max(1, Math.round(total / longueurOnde));
            var pas = Math.max(8, Math.ceil(ondes * 16));
            for (var i = 0; i <= pas; i++) {
                var d = (i / pas) * total;
                var p = pointSurChaine(chaine.points, cumul, d);
                var decalage = Math.sin((d / total) * ondes * Math.PI * 2) * amplitude;
                sortie.push({ x: p.x + p.nx * decalage, y: p.y + p.ny * decalage });
            }
        });
        return sortie;
    }

    function tracerParPoints(ctx, points) {
        if (points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.closePath();
        ctx.stroke();
    }

    /** Les sommets en pixels d'un polygone enregistré (normalisés), ou null s'il est incomplet. */
    function sommetsEnPixels(forme, w, h) {
        if (!Array.isArray(forme.sommets) || forme.sommets.length < 3) return null;
        return forme.sommets.map(function(s) { return { x: s.x * w, y: s.y * h }; });
    }

    /**
     * Trace une forme fermée (cercle, rectangle, polygone) sur le contexte reçu, trait et couleur déjà posés.
     * @param {number} ratio - échelle de la résolution : amplitude, onde et tirets sont ceux des lignes
     */
    function tracerFormeFermee(ctx, forme, w, h, ratio) {
        var x1 = forme.x1 * w, y1 = forme.y1 * h, x2 = forme.x2 * w, y2 = forme.y2 * h;
        var cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, rx = Math.abs(x2 - x1) / 2, ry = Math.abs(y2 - y1) / 2;
        var sommets = forme.type === 'polygone' ? sommetsEnPixels(forme, w, h)
            : forme.type === 'rectangle' ? sommetsRectangle(x1, y1, x2, y2) : null;
        if (forme.type === 'polygone' && !sommets) return;

        ctx.lineJoin = 'round';
        if (forme.trait === 'ondule') {
            var contour = sommets ? contourPolygone(sommets) : contourEllipse(cx, cy, rx, ry);
            tracerParPoints(ctx, pointsVagueContour(contour, AMPLITUDE_DEFAUT * ratio, LONGUEUR_ONDE_DEFAUT * ratio));
            return;
        }
        if (forme.trait === 'pointille') {
            var ep = (forme.lineWidth || 2) * ratio;
            ctx.setLineDash([ep * 3, ep * 2]);
        }
        if (sommets) {
            tracerParPoints(ctx, sommets);
        } else {
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }

    /** Distance d'un point au contour d'un polygone, dans les mêmes unités que ses sommets. */
    function distanceAuPolygone(sommets, px, py) {
        var min = Infinity;
        sommets.forEach(function(a, i) {
            var b = sommets[(i + 1) % sommets.length];
            var dx = b.x - a.x, dy = b.y - a.y;
            var l2 = dx * dx + dy * dy;
            var t = l2 ? Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / l2)) : 0;
            min = Math.min(min, Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy)));
        });
        return min;
    }

    /** Le cadre x1, y1, x2, y2 d'un polygone : les lectures communes aux formes (sélection, cadre) restent les mêmes. */
    function cadreDesSommets(sommets) {
        var xs = sommets.map(function(s) { return s.x; }), ys = sommets.map(function(s) { return s.y; });
        return { x1: Math.min.apply(null, xs), y1: Math.min.apply(null, ys), x2: Math.max.apply(null, xs), y2: Math.max.apply(null, ys) };
    }

    /* ---------------------------------------------------------------------
       LE CODE DANS SON CERCLE (lot « codes en lettres », 24 nov. 2026)

       Un code d'annotation s'écrit en blanc dans un disque de sa couleur, à trois endroits : la copie
       (travaux-annotation.js), le PDF (travaux-export-pdf.js) et le curseur (travaux-outils.js). Il s'y
       écrivait à une taille fixe (1,2 × le rayon) : un chiffre tient, deux lettres tiennent, trois caractères
       (« K-A ») débordent du disque et le blanc se perd sur la page blanche — on lit autre chose.

       La règle, une seule fois pour les trois : la taille d'hier tant que le coin de l'encre tient dans
       MARGE_CODE × rayon ; sinon la taille qui l'y fait tenir (l'encre croît en proportion de la taille).
       ⚠ Un code qui tenait garde EXACTEMENT sa taille d'hier : un code d'un chiffre ne bouge pas d'un pixel,
       ni « 10 » du repli. Mesuré au banc le 24 nov. (Chromium, DejaVu Sans grasse ; Helvetica est plus étroite) :
       le coin de l'encre de « 10 » va jusqu'à 0,923 du rayon aux petits rayons (6,8 à 10 px, ceux de la copie
       à l'écran) — d'où 0,93 et non 0,9, qui le réduisait d'une fraction de pixel. Sous 6 px de rayon, « 10 »
       dépassait déjà le disque (1,04) : il se réduit, et c'est voulu. Comparaison au pixel avec `main` : rapport.
       Au-delà de trois caractères, le texte diminue encore, sans plancher : le code entier reste dans le
       disque (décision de la session, dite au rapport : rien n'est refusé à la saisie, la palette compacte
       porte déjà jusqu'à vingt caractères depuis le 1er nov.).
       --------------------------------------------------------------------- */
    var MARGE_CODE = 0.93;

    /**
     * La taille de police d'un code dans un cercle de rayon `rayon`. `base` : la taille d'hier ;
     * `demiLargeur`, `demiHauteur` : la demi-boîte de l'encre À CETTE TAILLE, comptée depuis le point d'écriture
     * (centré, milieu). Rend `base` si le coin tient, sinon la taille réduite. Pure.
     */
    function tailleCodeDansCercle(rayon, base, demiLargeur, demiHauteur) {
        var coin = Math.sqrt(demiLargeur * demiLargeur + demiHauteur * demiHauteur);
        var place = rayon * MARGE_CODE;
        if (!(coin > place)) return base;
        return base * place / coin;
    }

    /**
     * Écrit `texte` centré en (mx, my), dans le cercle de rayon `rayon`, en gras, à la taille d'hier (`base`)
     * ou plus petit s'il le faut. Laisse au contexte la couleur que l'appelant a posée (fillStyle).
     */
    function ecrireCodeDansCercle(ctx, texte, mx, my, rayon, base) {
        texte = String(texte);
        ctx.font = 'bold ' + base + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var m = ctx.measureText(texte);
        // L'encre, si le moteur la donne (Safari, Chrome) ; sinon la chasse et une hauteur de capitale.
        var gauche = (typeof m.actualBoundingBoxLeft === 'number') ? m.actualBoundingBoxLeft : m.width / 2;
        var droite = (typeof m.actualBoundingBoxRight === 'number') ? m.actualBoundingBoxRight : m.width / 2;
        var haut = (typeof m.actualBoundingBoxAscent === 'number') ? m.actualBoundingBoxAscent : base * 0.4;
        var bas = (typeof m.actualBoundingBoxDescent === 'number') ? m.actualBoundingBoxDescent : base * 0.4;
        var taille = tailleCodeDansCercle(rayon, base, Math.max(gauche, droite), Math.max(haut, bas));
        if (taille !== base) ctx.font = 'bold ' + taille + 'px sans-serif';
        ctx.fillText(texte, mx, my);
        return taille;
    }

    var api = {
        MARGE_CODE: MARGE_CODE,
        tailleCodeDansCercle: tailleCodeDansCercle,
        ecrireCodeDansCercle: ecrireCodeDansCercle,
        contourPolygone: contourPolygone,
        contourEllipse: contourEllipse,
        pointsVagueContour: pointsVagueContour,
        tracerFormeFermee: tracerFormeFermee,
        distanceAuPolygone: distanceAuPolygone,
        cadreDesSommets: cadreDesSommets
    };
    if (typeof window !== 'undefined') window.annotationFormes = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
