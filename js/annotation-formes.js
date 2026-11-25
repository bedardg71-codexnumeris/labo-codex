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
       LE CODE DANS SON CERCLE, OU SA PASTILLE (lot « codes en lettres », 24 nov. 2026)

       Un code d'annotation s'écrit en blanc dans une forme de sa couleur, à trois endroits : la copie
       (travaux-annotation.js), le PDF (travaux-export-pdf.js) et le curseur (travaux-outils.js). Une seule règle :
         · UN OU DEUX CARACTÈRES : le cercle d'hier, au pixel près (même suite de gestes sur le contexte :
           couleur, arc, remplissage, blanc, police à 1,2 × le rayon, centré) ;
         · TROIS CARACTÈRES ET PLUS : une PASTILLE (décision de Grégoire, 24 nov. 2026, 17 h 45) — la hauteur du
           cercle, des bouts arrondis du même rayon, une largeur selon le texte, et le texte À LA TAILLE D'UN
           CHIFFRE dans un cercle de ce rayon. Elle reste centrée sur le point touché ;
         · PLUS DE QUATRE (le stock seulement : la saisie refuse au-delà de quatre, une grille enregistrée garde
           ses codes) : la pastille s'arrête à la largeur de quatre caractères larges (PLAFOND, « MMMM ») et le
           texte rapetisse pour y tenir.
       ↻ Remplace la règle de 17 h 38 (le texte rapetissait dans un cercle fixe) : un code de trois caractères y
         devenait trop petit pour se lire d'un coup d'œil (capture de la copie, vue par Grégoire).
       Rien n'est enregistré : la largeur se calcule au dessin, à partir du code. La sélection la relit
       (`geometrieCode`, travaux-annotation.js).
       --------------------------------------------------------------------- */
    var MARGE_CODE = 0.93;          // le coin de l'encre reste à 93 % du rayon du bout arrondi
    var CARACTERES_EN_CERCLE = 2;   // jusque-là, le cercle d'hier
    var PLAFOND = 'MMMM';           // la largeur de quatre caractères larges

    /**
     * La pastille d'un texte, en pixels. `rayon` : celui du cercle ; `demiEncre` et `demiHauteur` : la demi-largeur
     * et la demi-hauteur de l'encre à la taille d'un chiffre ; `demiEncrePlafond` : la demi-largeur de PLAFOND à
     * cette taille. Rend `demiDroite` (le demi-segment droit entre les deux bouts), `demiLargeur` (de bout à bout),
     * et `echelle` (1, sauf au-delà du plafond, où le texte rapetisse). Pure.
     */
    function geometriePastille(rayon, demiEncre, demiHauteur, demiEncrePlafond) {
        var place = rayon * MARGE_CODE;
        var h = Math.min(demiHauteur, place * 0.999);
        var enBout = Math.sqrt(place * place - h * h);   // ce que l'encre peut avancer dans un bout arrondi
        var droit = Math.max(0, demiEncre - enBout);
        var droitMax = Math.max(0, demiEncrePlafond - enBout);
        var echelle = 1;
        if (droit > droitMax) {
            // Plus petit, le texte est aussi moins haut : il avance davantage dans le bout. Rester à `enBout`
            // calculé à pleine taille garde une marge.
            echelle = (droitMax + enBout) / demiEncre;
            droit = droitMax;
        }
        return { demiDroite: droit, demiLargeur: droit + rayon, echelle: echelle };
    }

    /** L'encre d'un texte en gras à la taille `taille` : demi-largeur et demi-hauteur, depuis un point centré, au milieu. */
    function _encre(ctx, texte, taille) {
        ctx.font = 'bold ' + taille + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var m = ctx.measureText(texte);
        // L'encre, si le moteur la donne (Safari, Chrome) ; sinon la chasse et une hauteur de capitale.
        var gauche = (typeof m.actualBoundingBoxLeft === 'number') ? m.actualBoundingBoxLeft : m.width / 2;
        var droite = (typeof m.actualBoundingBoxRight === 'number') ? m.actualBoundingBoxRight : m.width / 2;
        var haut = (typeof m.actualBoundingBoxAscent === 'number') ? m.actualBoundingBoxAscent : taille * 0.4;
        var bas = (typeof m.actualBoundingBoxDescent === 'number') ? m.actualBoundingBoxDescent : taille * 0.4;
        return { demiLargeur: Math.max(gauche, droite), demiHauteur: Math.max(haut, bas) };
    }

    /**
     * La forme d'un code de rayon `rayon`, `base` étant la taille d'un chiffre : { forme: 'cercle' | 'pastille',
     * rayon, demiLargeur, demiDroite, taille }. Un cercle ne touche pas au contexte ; une pastille le mesure, entre
     * `save` et `restore`.
     */
    function geometrieCode(ctx, texte, rayon, base) {
        texte = String(texte);
        if (texte.length <= CARACTERES_EN_CERCLE) {
            return { forme: 'cercle', rayon: rayon, demiLargeur: rayon, demiDroite: 0, taille: base };
        }
        ctx.save();
        var e = _encre(ctx, texte, base);
        var plafond = _encre(ctx, PLAFOND, base);
        ctx.restore();
        var g = geometriePastille(rayon, e.demiLargeur, e.demiHauteur, plafond.demiLargeur);
        return { forme: 'pastille', rayon: rayon, demiLargeur: g.demiLargeur, demiDroite: g.demiDroite, taille: base * g.echelle };
    }

    /** Le contour d'une pastille centrée en (cx, cy) : deux bouts de rayon `rayon`, un segment droit de 2 × `demiDroite`. */
    function tracerPastille(ctx, cx, cy, rayon, demiDroite) {
        ctx.moveTo(cx - demiDroite, cy - rayon);
        ctx.lineTo(cx + demiDroite, cy - rayon);
        ctx.arc(cx + demiDroite, cy, rayon, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(cx - demiDroite, cy + rayon);
        ctx.arc(cx - demiDroite, cy, rayon, Math.PI / 2, Math.PI * 1.5);
        ctx.closePath();
    }

    /**
     * Dessine un code : sa forme de couleur `couleur`, centrée en (cx, cy), puis le texte en blanc
     * (`decalageTexte` : le pixel de plus du curseur, hier). Rend la géométrie.
     */
    function dessinerCode(ctx, texte, cx, cy, rayon, base, couleur, decalageTexte) {
        texte = String(texte);
        var g = geometrieCode(ctx, texte, rayon, base);
        ctx.fillStyle = couleur;
        ctx.beginPath();
        if (g.forme === 'cercle') ctx.arc(cx, cy, rayon, 0, Math.PI * 2);
        else tracerPastille(ctx, cx, cy, rayon, g.demiDroite);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + g.taille + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(texte, cx, cy + (decalageTexte || 0));
        return g;
    }

    var api = {
        MARGE_CODE: MARGE_CODE,
        CARACTERES_EN_CERCLE: CARACTERES_EN_CERCLE,
        PLAFOND: PLAFOND,
        geometriePastille: geometriePastille,
        geometrieCode: geometrieCode,
        dessinerCode: dessinerCode,
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
