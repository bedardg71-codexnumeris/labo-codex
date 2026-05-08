/* ===============================
   SECURITE-APERCU-SANDBOX.JS — Défense A (Phase 1 sécurité)
   Aperçu d'objets importés isolé dans une iframe sandbox.

   Réfs :
     plans de travail/PLAN-DEFENSE-A-SANDBOX-IFRAME.md
     docs/securite/MODELE-MENACES.md §7 D-01 / §8.2 Phase 1
     docs/securite/audits/AUDIT-INNERHTML-FINDINGS-2026-05-06.md (E-β)

   Principe : le contenu rendu peut être malicieux (ex. payload XSS dans
   les métadonnées d'un fichier d'import). On le confine dans une iframe
   sandbox sans `allow-same-origin` → origine opaque, pas d'accès au
   localStorage / IDB / DOM du parent. Une CSP interne bloque en plus
   les requêtes réseau (defense-in-depth).

   API :
     window.ApercuSandbox.afficher(conteneur, htmlContenu, opts)
     window.ApercuSandbox.fermer(conteneur)
   =============================== */

(function() {
    'use strict';

    /* ---------------- Variables CSS du Design System ---------------- */
    /* Liste fermée : ce qui est utile au rendu d'un badge CC + d'un
       contenu pédagogique (table, listes, paragraphes). Les valeurs sont
       lues sur :root via getComputedStyle, ce qui propage automatiquement
       le mode actif (sombre / clair / anonymisation). */
    var VARIABLES_DS = [
        'bleu-principal', 'bleu-fonce', 'bleu-clair', 'bleu-leger',
        'bleu-tres-pale', 'bleu-pale', 'bleu-meta', 'bleu-carte',
        'surface-page', 'surface-section', 'surface-conteneur',
        'surface-carte', 'surface-element', 'surface-input',
        'texte-principal', 'texte-secondaire', 'texte-muted',
        'accent-primaire',
        'gris-fonce', 'gris-moyen', 'gris-clair', 'gris-tres-clair',
        'vert-succes', 'vert-leger', 'vert-pale', 'vert-doux',
        'rouge-erreur', 'rouge-danger',
        'orange-accent',
        'radius-petit', 'radius-moyen', 'radius-grand', 'radius-pill',
        'bordure-claire', 'bordure-moyenne'
    ];

    /* ---------------- Suivi des instances ---------------- */
    /* WeakMap conteneur → { iframe, hauteurMin, hauteurMax } */
    var instances = new WeakMap();
    /* Map contentWindow → conteneur, pour router postMessage. WeakMap
       refuse certaines clés exotiques mais fonctionne avec WindowProxy
       sur tous les browsers cibles (Safari Mac/iPad, Chrome, Edge). */
    var iframeAuConteneur = new WeakMap();

    /* ---------------- Listener postMessage global ---------------- */
    var listenerInstalle = false;
    function installerListenerGlobal() {
        if (listenerInstalle) return;
        listenerInstalle = true;
        window.addEventListener('message', function(event) {
            var data = event.data;
            // Filtrage strict : marque + type + numérique. Tout payload
            // qui ne ressemble pas à ce qu'on attend est ignoré.
            if (!data || typeof data !== 'object') return;
            if (data.source !== 'apercu-sandbox') return;
            if (data.type !== 'hauteur') return;

            var conteneur = iframeAuConteneur.get(event.source);
            if (!conteneur) return;
            var instance = instances.get(conteneur);
            if (!instance) return;

            var hauteur = parseInt(data.valeur, 10);
            if (isNaN(hauteur) || hauteur < 0) return;
            hauteur = Math.max(instance.hauteurMin, Math.min(hauteur, instance.hauteurMax));
            instance.iframe.style.height = hauteur + 'px';
        });
    }

    /* ---------------- Construction du srcdoc ---------------- */
    function lireVariablesDS() {
        var styles = window.getComputedStyle(document.documentElement);
        var declarations = [];
        VARIABLES_DS.forEach(function(nom) {
            var v = styles.getPropertyValue('--' + nom);
            if (!v) return;
            v = v.trim();
            // Filet : ne pas propager une valeur qui tenterait d'évader
            // le bloc CSS. Les valeurs DS sont des littéraux (couleurs
            // hex, rgba, longueurs, ombres) — `<`, `>`, `{`, `}` sont
            // des marqueurs de sortie qu'on refuse par précaution.
            if (/[<>{}]/.test(v)) return;
            declarations.push('--' + nom + ': ' + v + ';');
        });
        return declarations.join('\n');
    }

    function styleDeBase() {
        /* Styles minimaux cohérents avec le DS pour rendre :
            - badge CC (.cc-badge*)
            - contenu pédagogique : <table>, <ul>, <p>, <h3>
           Repris/adapté de styles.css §3999-4088. */
        return [
            'html,body{margin:0;padding:0;}',
            'body{padding:14px;font-family:-apple-system,BlinkMacSystemFont,"SF Pro","Segoe UI",sans-serif;color:var(--texte-principal,#d0e0e4);background:transparent;line-height:1.5;font-size:14px;}',
            '*{box-sizing:border-box;}',
            'p{margin:6px 0;}',
            'h1,h2,h3,h4,h5{color:var(--accent-primaire,#6aacb8);margin:10px 0 6px 0;}',
            'a{color:var(--accent-primaire,#6aacb8);}',
            'strong{color:var(--texte-principal,#d0e0e4);}',
            'ul{margin:4px 0;padding-left:20px;}',
            'li{margin:2px 0;}',
            'img{max-width:100%;}',
            /* Badge CC */
            '.cc-badge{padding:15px;background:var(--bleu-tres-pale,#142428);border-radius:var(--radius-moyen,6px);border-left:4px solid var(--bleu-principal,#1a4a5e);margin:0 0 12px 0;}',
            '.cc-badge img{height:31px;display:block;margin-bottom:8px;}',
            '.cc-badge-titre{font-weight:600;color:var(--accent-primaire,#6aacb8);margin-bottom:8px;}',
            '.cc-badge-auteur{font-size:0.9rem;color:var(--gris-fonce,#b0c4cc);margin:4px 0;}',
            '.cc-badge-contributeurs{font-size:0.85rem;color:var(--gris-moyen,#8aa4b0);margin:8px 0 0 0;padding-left:20px;list-style:none;}',
            '.cc-badge-conditions{margin-top:12px;padding:10px;background:var(--surface-carte,#1a3040);border-radius:var(--radius-moyen,6px);}',
            '.cc-badge-conditions h4{font-size:0.9rem;margin:0 0 8px 0;color:var(--accent-primaire,#6aacb8);}',
            '.cc-badge-conditions ul{margin:0;padding-left:20px;list-style:none;}',
            '.cc-badge-conditions li{margin:4px 0;font-size:0.85rem;line-height:1.4;}',
            '.cc-badge-conditions li::before{content:"\\2713 ";color:var(--vert-succes,#34c759);font-weight:bold;margin-right:4px;}',
            '.cc-badge-conditions .cc-condition-obligation::before{content:"\\26A0\\FE0F ";}',
            '.cc-badge-lien{display:inline-block;margin-top:10px;color:var(--accent-primaire,#6aacb8);text-decoration:none;font-size:0.85rem;}',
            '.cc-badge-lien:hover{text-decoration:underline;}',
            '.cc-metadata{font-size:0.85rem;color:var(--gris-moyen,#8aa4b0);margin-top:8px;}',
            '.cc-metadata-version{font-weight:600;}',
            /* Tables (grilles, échelles, productions) */
            'table{width:100%;border-collapse:collapse;margin:8px 0;background:var(--surface-carte,#1a3040);border-radius:var(--radius-moyen,6px);overflow:hidden;}',
            'th,td{padding:8px 10px;border-bottom:1px solid var(--bordure-claire,rgba(106,172,184,0.25));text-align:left;font-size:0.9rem;vertical-align:top;}',
            'th{background:var(--bleu-tres-pale,#142428);font-weight:600;color:var(--accent-primaire,#6aacb8);}',
            'tr:last-child td{border-bottom:none;}',
            /* Utilitaires fréquents (re-définis pour ne pas dépendre de styles.css) */
            '.u-mb-15{margin-bottom:15px;}',
            '.contenu-grille,.contenu-echelle,.contenu-cartouche,.contenu-production,.contenu-pratique,.contenu-tampon{margin-top:8px;}'
        ].join('');
    }

    function construireSrcdoc(htmlContenu, opts) {
        var theme = opts && opts.themeClair ? 'mode-clair' : '';
        var baseURI = String(document.baseURI || '').replace(/["<>]/g, '');
        var variables = lireVariablesDS();
        var styles = styleDeBase();

        /* CSP interne à l'iframe :
            - default-src 'none' bloque connect-src par fallback (pas de
              fetch, XHR, WebSocket, EventSource → exfiltration neutralisée)
            - img-src * data: laisse charger l'icône CC + autres médias
              du contenu pédagogique
            - style-src 'unsafe-inline' permet notre <style> et les
              attributs style="" du contenu
            - script-src 'unsafe-inline' laisse tourner notre messenger
              de hauteur. Les payloads XSS éventuels tournent aussi mais
              dans une origine opaque sans accès aux ressources parent.
        */
        var csp = "default-src 'none'; img-src * data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data: *;";

        /* Le messenger de hauteur est placé en TÊTE de body, AVANT
           htmlContenu — comme ça même si le contenu utilisateur contient
           un `<script>` non terminé (qui consommerait le reste du body
           jusqu'au prochain `</script>`), notre script a déjà été parsé
           et exécuté. */
        var messenger =
            '(function(){' +
                'function envoyer(){try{parent.postMessage({source:"apercu-sandbox",type:"hauteur",valeur:document.documentElement.scrollHeight},"*");}catch(e){}}' +
                'envoyer();' +
                'try{new ResizeObserver(envoyer).observe(document.documentElement);}catch(e){}' +
                'window.addEventListener("load",envoyer);' +
                'window.addEventListener("resize",envoyer);' +
                'document.addEventListener("DOMContentLoaded",function(){' +
                    'var imgs=document.querySelectorAll("img");' +
                    'for(var i=0;i<imgs.length;i++){imgs[i].addEventListener("load",envoyer);imgs[i].addEventListener("error",envoyer);}' +
                    'envoyer();' +
                '});' +
            '})();';

        // security-ok: srcdoc construit avec contenu utilisateur intentionnellement —
        // c'est le rôle de la sandbox de neutraliser tout payload XSS qu'il contient.
        return '<!DOCTYPE html>'
             + '<html lang="fr"><head>'
             + '<meta charset="UTF-8">'
             + '<meta http-equiv="Content-Security-Policy" content="' + csp + '">'
             + '<base href="' + baseURI + '">'
             + '<style>:root{' + variables + '}' + styles + '</style>'
             + '</head>'
             + '<body class="' + theme + '">'
             + '<script>' + messenger + '</' + 'script>'
             + '<div id="apercu-contenu">' + htmlContenu + '</div>'
             + '</body></html>';
    }

    /* ---------------- API publique ---------------- */
    function afficher(conteneur, htmlContenu, opts) {
        if (!conteneur || conteneur.nodeType !== 1) {
            console.warn('[ApercuSandbox] conteneur invalide');
            return null;
        }
        opts = opts || {};
        installerListenerGlobal();

        // Fermer une instance précédente sur le même conteneur (idempotent).
        fermer(conteneur);

        var hauteurMin = parseInt(opts.hauteurMin, 10);
        var hauteurMax = parseInt(opts.hauteurMax, 10);
        if (isNaN(hauteurMin) || hauteurMin < 0) hauteurMin = 100;
        if (isNaN(hauteurMax) || hauteurMax <= hauteurMin) hauteurMax = 600;

        // Détecter le thème automatiquement si non fourni.
        var themeClair;
        if (typeof opts.themeClair === 'boolean') {
            themeClair = opts.themeClair;
        } else {
            themeClair = !!(document.body && document.body.classList && document.body.classList.contains('mode-clair'));
        }

        var iframe = document.createElement('iframe');
        // sandbox sans `allow-same-origin` → origine opaque, pas d'accès parent.
        // `allow-popups` autorise l'ouverture du lien CC en nouvel onglet.
        iframe.setAttribute('sandbox', 'allow-scripts allow-popups');
        iframe.setAttribute('title', 'Aperçu sécurisé du matériel importé');
        iframe.setAttribute('referrerpolicy', 'no-referrer');
        iframe.setAttribute('loading', 'eager');
        iframe.style.width = '100%';
        iframe.style.border = 'none';
        iframe.style.display = 'block';
        iframe.style.background = 'transparent';
        iframe.style.minHeight = hauteurMin + 'px';
        iframe.style.maxHeight = hauteurMax + 'px';
        iframe.style.height = hauteurMin + 'px';

        var srcdoc = construireSrcdoc(String(htmlContenu == null ? '' : htmlContenu), {
            themeClair: themeClair
        });
        iframe.setAttribute('srcdoc', srcdoc);

        // Vider le conteneur via DOM (pas innerHTML) puis insérer l'iframe.
        while (conteneur.firstChild) conteneur.removeChild(conteneur.firstChild);
        conteneur.appendChild(iframe);

        var instance = { iframe: iframe, hauteurMin: hauteurMin, hauteurMax: hauteurMax };
        instances.set(conteneur, instance);

        // contentWindow disponible immédiatement après attachement DOM.
        if (iframe.contentWindow) {
            iframeAuConteneur.set(iframe.contentWindow, conteneur);
        } else {
            // Garde-fou : certains environnements créent contentWindow au tick suivant.
            requestAnimationFrame(function() {
                if (iframe.contentWindow) {
                    iframeAuConteneur.set(iframe.contentWindow, conteneur);
                }
            });
        }

        return iframe;
    }

    function fermer(conteneur) {
        if (!conteneur) return;
        var instance = instances.get(conteneur);
        if (!instance) return;
        try {
            if (instance.iframe.contentWindow) {
                iframeAuConteneur.delete(instance.iframe.contentWindow);
            }
            if (instance.iframe.parentNode === conteneur) {
                conteneur.removeChild(instance.iframe);
            }
        } catch (e) {
            console.warn('[ApercuSandbox] erreur fermeture', e);
        }
        instances.delete(conteneur);
    }

    window.ApercuSandbox = {
        afficher: afficher,
        fermer: fermer
    };
})();
