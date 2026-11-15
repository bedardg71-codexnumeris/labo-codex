/**
 * Une page dont l'image s'est perdue dans le PDF (#1233, 5 nov. 2026).
 *
 * Avant #1232, une photo en blob sans type (ouverture d'un codex) partait vers
 * jsPDF en `data:application/octet-stream;base64,…`, que jsPDF 2.5.1 ne
 * reconnaît pas : il collait le TEXTE de la data URL dans le flux de l'image,
 * déclarée `/Width 0 /Height 0`. Le lecteur PDF ne dessine rien : page
 * blanche. La photo est pourtant intacte dans ce texte, en base64.
 *
 * Ce module, sans écriture :
 *  - `aLeDefaut(octets)` : le défaut est-il dans ce PDF ? (lecture seule, rapide) ;
 *  - `lirePages(octets)` : les pages d'un PDF écrit par l'application, une image
 *    pleine page chacune, la photo perdue rendue à ses octets ; `null` si le PDF
 *    ne se lit pas ainsi (alors on ne répare pas) ;
 *  - `reconstruire(pages)` : le PDF refait page par page, aux tailles de ses
 *    `/MediaBox`, les autres images gardant leurs octets JPEG sans recompression.
 *  - `lireImagesDesPages(octets)` : la position des octets JPEG de chaque page, pour
 *    l'éditeur de pages, qui les reprend sans les réencoder (15 nov. 2026) ;
 *  - `dimensionsDesImages(octets)` : les pixels des images d'un PDF de tout producteur,
 *    lus sans décodage (15 nov. 2026).
 *
 * Décision de Grégoire du 5 nov. 2026, 12 h 34 : un geste lancé par l'usager,
 * codex proposé juste avant ; jamais de réparation d'office.
 */
(function () {
    'use strict';

    /** Les octets en chaîne « binaire » (un caractère par octet). */
    function enTexte(octets) {
        let s = '';
        const pas = 0x8000;
        for (let i = 0; i < octets.length; i += pas) {
            s += String.fromCharCode.apply(null, octets.subarray(i, i + pas));
        }
        return s;
    }

    /** La chaîne « binaire » en octets. */
    function enOctets(texte) {
        const o = new Uint8Array(texte.length);
        for (let i = 0; i < texte.length; i++) o[i] = texte.charCodeAt(i) & 0xFF;
        return o;
    }

    /**
     * Le motif est-il dans les octets ? Cherché sans convertir le fichier en chaîne : c'est le
     * préfiltre de chaque PDF ouvert, d'élève compris (relecture neuve : la conversion coûtait
     * 145 ms pour 40 Mo sur le Mac, davantage sur l'iPad).
     */
    function contientOctets(octets, motif) {
        const m = Array.from(motif, (c) => c.charCodeAt(0));
        for (let i = octets.indexOf(m[0]); i !== -1 && i + m.length <= octets.length; i = octets.indexOf(m[0], i + 1)) {
            if (m.every((o, k) => octets[i + k] === o)) return true;
        }
        return false;
    }

    function formatDesOctets(o) {
        if (o.length >= 3 && o[0] === 0xFF && o[1] === 0xD8 && o[2] === 0xFF) return 'JPEG';
        if (o.length >= 4 && o[0] === 0x89 && o[1] === 0x50 && o[2] === 0x4E && o[3] === 0x47) return 'PNG';
        return null;
    }

    /**
     * Les objets du PDF : `{ numero: { dict, flux } }`. Les flux sont sautés par leur
     * `/Length` : un JPEG peut contenir le texte « endobj ». `null` si illisible.
     */
    function lireObjets(texte) {
        const objets = {};
        const re = /(?:^|[\r\n])(\d+) 0 obj/g;
        let m;
        while ((m = re.exec(texte)) !== null) {
            const debut = m.index + m[0].length;
            const posFlux = texte.indexOf('stream', debut);
            const posFin = texte.indexOf('endobj', debut);
            if (posFin === -1) return null;
            if (posFlux !== -1 && posFlux < posFin) {
                const dict = texte.slice(debut, posFlux);
                const longueur = /\/Length (\d+)/.exec(dict);
                if (!longueur) return null;
                let d = posFlux + 'stream'.length;
                if (texte[d] === '\r') d++;
                if (texte[d] === '\n') d++;
                const n = parseInt(longueur[1], 10);
                if (d + n > texte.length) return null;
                objets[m[1]] = { dict, flux: texte.slice(d, d + n), debut: d, longueur: n };
                re.lastIndex = d + n;
            } else {
                objets[m[1]] = { dict: texte.slice(debut, posFin), flux: null };
                re.lastIndex = posFin;
            }
        }
        return objets;
    }

    function estImagePerdue(objet) {
        return !!objet && objet.flux !== null && /\/Subtype \/Image/.test(objet.dict)
            && /\/Width 0\b/.test(objet.dict) && /\/Height 0\b/.test(objet.dict)
            && objet.flux.slice(0, 5) === 'data:';
    }

    /**
     * Le défaut est-il dans ce PDF ? Lecture seule.
     * @param {Uint8Array} octets
     * @returns {boolean}
     */
    function aLeDefaut(octets) {
        if (!octets || octets.length < 8 || !contientOctets(octets, 'stream\ndata:') && !contientOctets(octets, 'stream\r\ndata:')) return false;
        const texte = enTexte(octets);
        if (texte.indexOf('/Width 0') === -1) return false;
        const objets = lireObjets(texte);
        if (!objets) return false;
        return Object.keys(objets).some((k) => estImagePerdue(objets[k]));
    }

    /** Les octets de l'image d'un objet : la photo perdue décodée, ou le flux JPEG tel quel. */
    function octetsDeLImage(objet) {
        if (estImagePerdue(objet)) {
            const virgule = objet.flux.indexOf('base64,');
            if (virgule === -1) return null;
            let binaire;
            try { binaire = atob(objet.flux.slice(virgule + 7).replace(/\s+/g, '')); } catch (_) { return null; }
            const o = enOctets(binaire);
            const format = formatDesOctets(o);
            return format ? { format, octets: o, perdue: true } : null;
        }
        // Une image saine : un JPEG collé tel quel par jsPDF, sans masque. Une page PNG saine, ou une
        // photo perdue en WebP, fait refuser le geste (rien n'est écrit) ; aucun cas vécu (relecture neuve).
        if (!/\/Filter \/DCTDecode\b/.test(objet.dict) || /\/SMask\b/.test(objet.dict)) return null;
        const o = enOctets(objet.flux);
        return formatDesOctets(o) === 'JPEG' ? { format: 'JPEG', octets: o, perdue: false } : null;
    }

    /** Les numéros des objets page, dans l'ordre de `/Kids` ; `null` si introuvables. */
    function numerosDesPages(objets) {
        const racinePages = Object.keys(objets).map((k) => objets[k]).find((o) => /\/Type \/Pages\b/.test(o.dict));
        const kids = racinePages && /\/Kids \[([^\]]*)\]/.exec(racinePages.dict);
        const numeros = kids ? (kids[1].match(/(\d+) 0 R/g) || []).map((r) => r.split(' ')[0]) : [];
        return numeros.length ? numeros : null;
    }

    /** Le nom de la seule image que pose ce contenu, sur toute la page ; `null` sinon. */
    function imagePleinePage(flux, largeur, hauteur) {
        const appels = flux.match(/\/(\S+) Do\b/g) || [];
        if (appels.length !== 1) return null;
        if (/\b(BT|re|Tj|TJ|l|c|m|f|S|sh)\b/.test(flux.replace(/\/\S+ Do/, ''))) return null;
        const cm = /([\d.]+) 0 0 ([\d.]+) ([\d.-]+) ([\d.-]+) cm/.exec(flux);
        const ecarts = cm ? [parseFloat(cm[1]) - largeur, parseFloat(cm[2]) - hauteur, parseFloat(cm[3]), parseFloat(cm[4])] : null;
        if (!ecarts || ecarts.some((e) => Math.abs(e) > 1)) return null;
        return appels[0].slice(1, -3).trim().replace(/[^\w]/g, '');
    }

    /** L'objet image de la page, si elle n'est qu'une image pleine page ; `null` sinon. */
    function objetImageDeLaPage(objets, page) {
        if (!page || !/\/Type \/Page\b/.test(page.dict)) return null;
        const boite = /\/MediaBox \[\s*0 0 ([\d.]+) ([\d.]+)\s*\]/.exec(page.dict);
        const contenu = objets[(/\/Contents (\d+) 0 R/.exec(page.dict) || [])[1]];
        const ressources = objets[(/\/Resources (\d+) 0 R/.exec(page.dict) || [])[1]];
        if (!boite || !contenu || !ressources) return null;
        const largeur = parseFloat(boite[1]);
        const hauteur = parseFloat(boite[2]);
        const nom = imagePleinePage(contenu.flux || '', largeur, hauteur);
        const xobjets = nom && /\/XObject\s*<<([\s\S]*?)>>/.exec(ressources.dict);
        const ref = xobjets && new RegExp('/' + nom + ' (\\d+) 0 R').exec(xobjets[1]);
        const image = ref && objets[ref[1]];
        return image && image.flux !== null ? { image, largeur, hauteur } : null;
    }

    /** Une page : sa taille et son image ; `null` si elle ne se lit pas ainsi. */
    function lirePage(objets, page) {
        const trouvee = objetImageDeLaPage(objets, page);
        const lue = trouvee ? octetsDeLImage(trouvee.image) : null;
        return lue ? { largeur: trouvee.largeur, hauteur: trouvee.hauteur, format: lue.format, octets: lue.octets, perdue: lue.perdue } : null;
    }

    /**
     * Où sont, dans le fichier, les octets JPEG de chaque page (15 nov. 2026, l'éditeur de pages).
     *
     * Un PDF écrit par l'application porte une image pleine page par page, et jsPDF y colle
     * le JPEG tel quel. Le reprendre par sa position (`blob.slice`) rend la page à sa pleine
     * définition, sans la redessiner ni la réencoder, et sans copie en mémoire.
     *
     * @param {Uint8Array} octets
     * @returns {Array<{debut: number, longueur: number, largeur: number, hauteur: number}|null>|null} une entrée par page
     *   (position des octets, pixels de l'image, et taille de la page en points : `largeurPt`, `hauteurPt`), `null`
     *   pour une page qui ne se lit pas ainsi (PNG, masque, image perdue, dessin) ; `null`
     *   tout court si le PDF n'est pas de l'application.
     */
    function lireImagesDesPages(octets) {
        if (!octets || octets.length < 8) return null;
        const texte = enTexte(octets);
        if (!/\/Producer \(jsPDF /.test(texte)) return null;
        const objets = lireObjets(texte);
        const numeros = objets && numerosDesPages(objets);
        if (!numeros) return null;
        return numeros.map((n) => {
            const trouvee = objetImageDeLaPage(objets, objets[n]);
            const image = trouvee && trouvee.image;
            if (!image || estImagePerdue(image)) return null;
            if (!/\/Filter \/DCTDecode\b/.test(image.dict) || /\/SMask\b/.test(image.dict)) return null;
            if (image.flux.charCodeAt(0) !== 0xFF || image.flux.charCodeAt(1) !== 0xD8 || image.flux.charCodeAt(2) !== 0xFF) return null;
            const largeur = /\/Width (\d+)\b/.exec(image.dict);
            const hauteur = /\/Height (\d+)\b/.exec(image.dict);
            if (!largeur || !hauteur) return null;
            return { debut: image.debut, longueur: image.longueur, largeur: parseInt(largeur[1], 10), hauteur: parseInt(hauteur[1], 10),
                largeurPt: trouvee.largeur, hauteurPt: trouvee.hauteur };
        });
    }

    /**
     * Les pixels de chaque image d'un PDF de N'IMPORTE QUEL producteur, lus dans leurs
     * dictionnaires, sans rien décoder (15 nov. 2026, la définition dite à l'écran d'import).
     *
     * Une image est toujours un objet à flux : son dictionnaire est en clair, même quand
     * le reste du PDF est compressé. Les masques (`/ImageMask`, cible d'un `/SMask` ou d'un
     * `/Mask`) ne sont pas des images de page. L'ordre est celui du FICHIER, pas des pages.
     *
     * @param {Uint8Array} octets
     * @returns {Array<{largeur: number, hauteur: number}>|null} `null` si une image ne dit
     *   pas ses pixels en clair (l'appelant passe alors par pdf.js)
     */
    function dimensionsDesImages(octets) {
        if (!octets || octets.length < 8) return null;
        const texte = enTexte(octets);
        const masques = new Set();
        const reMasque = /\/S?Mask\s+(\d+)\s+\d+\s+R/g;
        let m;
        while ((m = reMasque.exec(texte)) !== null) masques.add(m[1]);

        const images = [];
        const re = /\/Subtype\s*\/Image\b/g;
        while ((m = re.exec(texte)) !== null) {
            const debut = texte.lastIndexOf(' obj', m.index);
            const fin = texte.indexOf('stream', m.index);
            if (debut === -1 || fin === -1 || m.index - debut > 4096 || fin - m.index > 4096) return null;
            const numero = /(\d+)\s+\d+$/.exec(texte.slice(Math.max(0, debut - 24), debut));
            const dict = texte.slice(debut, fin);
            if (/\/ImageMask\s+true\b/.test(dict) || (numero && masques.has(numero[1]))) continue;
            const largeur = /\/Width\s+(\d+)(?!\s+\d+\s+R)\b/.exec(dict);
            const hauteur = /\/Height\s+(\d+)(?!\s+\d+\s+R)\b/.exec(dict);
            if (!largeur || !hauteur) return null;
            images.push({ largeur: parseInt(largeur[1], 10), hauteur: parseInt(hauteur[1], 10) });
        }
        return images;
    }

    /**
     * Les pages d'un PDF écrit par l'application (jsPDF), une image pleine page chacune.
     * @param {Uint8Array} octets
     * @returns {Array<{largeur: number, hauteur: number, format: string, octets: Uint8Array, perdue: boolean}>|null}
     *   `null` si le PDF ne se lit pas ainsi : autre producteur, plusieurs images ou du
     *   dessin sur une page, autre filtre, ou aucune image perdue.
     */
    function lirePages(octets) {
        if (!octets || octets.length < 8) return null;
        const texte = enTexte(octets);
        if (!/\/Producer \(jsPDF /.test(texte)) return null;
        const objets = lireObjets(texte);
        const numeros = objets && numerosDesPages(objets);
        if (!numeros) return null;
        const pages = numeros.map((n) => lirePage(objets, objets[n]));
        if (pages.some((p) => !p)) return null;
        return pages.some((p) => p.perdue) ? pages : null;
    }

    /**
     * Le PDF refait page par page, dans l'ordre et aux tailles lues.
     * @param {Array} pages - le résultat de `lirePages`
     * @returns {Blob}
     */
    function reconstruire(pages) {
        const { jsPDF } = window.jspdf;
        let doc = null;
        pages.forEach((p, i) => {
            const orientation = p.largeur > p.hauteur ? 'landscape' : 'portrait';
            if (i === 0) doc = new jsPDF({ orientation, unit: 'pt', format: [p.largeur, p.hauteur] });
            else doc.addPage([p.largeur, p.hauteur], orientation);
            doc.addImage(p.octets, p.format, 0, 0, p.largeur, p.hauteur);
        });
        return doc.output('blob');
    }

    window.PdfImagePerdue = { aLeDefaut, lirePages, lireImagesDesPages, dimensionsDesImages, reconstruire };
})();
