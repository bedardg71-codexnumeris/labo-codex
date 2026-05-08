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
    /* Liste des instances actives. On utilise un tableau plutôt qu'une
       WeakMap pour éviter une race : sur Safari, `iframe.contentWindow`
       peut changer de référence entre l'attachement DOM et le chargement
       du srcdoc — la pré-inscription dans une WeakMap loupe alors les
       messages postés depuis le second contentWindow. On itère ici à la
       réception et on compare la référence courante.

       Auto-cleanup : un MutationObserver attaché au body splice l'instance
       quand l'iframe est détachée du DOM (cas typique : un call-site qui
       retire son wrapper sans rappeler `ApercuSandbox.fermer()`). Évite la
       croissance non bornée du tableau au fil des imports. */
    var instances = []; // [{ conteneur, iframe, hauteurMin, hauteurMax, observer }]

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

            var instance = null;
            for (var i = 0; i < instances.length; i++) {
                if (instances[i].iframe.contentWindow === event.source) {
                    instance = instances[i];
                    break;
                }
            }
            if (!instance) return;

            var hauteur = parseInt(data.valeur, 10);
            if (isNaN(hauteur) || hauteur < 0) return;
            hauteur = Math.max(instance.hauteurMin, Math.min(hauteur, instance.hauteurMax));
            instance.iframe.style.height = hauteur + 'px';
        });
    }

    /* ---------------- Construction du srcdoc ---------------- */
    function lireVariablesDS() {
        // Important : la classe `mode-clair` est posée sur <body>, pas sur
        // <html>. Lire les variables sur :root retournerait les valeurs
        // sombres même en thème clair → on lit sur body en priorité.
        var source = document.body || document.documentElement;
        var styles = window.getComputedStyle(source);
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
            'html,body{margin:0;padding:0;background:transparent;}',
            'body{padding:14px;font-family:-apple-system,BlinkMacSystemFont,"SF Pro","Segoe UI",sans-serif;color:var(--texte-principal,#d0e0e4);line-height:1.5;font-size:14px;min-height:0;}',
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

    /* MESSENGER FIGÉ — toute modification CHANGE le hash SHA-256 ; il
       faut alors mettre à jour `script-src 'sha256-…'` dans le CSP de
       index.html (ligne 6). Le composant n'a pas de moyen de calculer
       le hash dynamiquement (crypto.subtle est asynchrone, le srcdoc
       est construit synchroniquement) ; on accepte le couplage. */
    var MESSENGER_SCRIPT = '(function(){function h(){return Math.max((document.body&&document.body.scrollHeight)||0,(document.documentElement&&document.documentElement.scrollHeight)||0);}function envoyer(){try{parent.postMessage({source:"apercu-sandbox",type:"hauteur",valeur:h()},"*");}catch(e){}}envoyer();try{var ro=new ResizeObserver(envoyer);if(document.body)ro.observe(document.body);}catch(e){}window.addEventListener("load",envoyer);window.addEventListener("resize",envoyer);document.addEventListener("DOMContentLoaded",function(){var imgs=document.querySelectorAll("img");for(var i=0;i<imgs.length;i++){imgs[i].addEventListener("load",envoyer);imgs[i].addEventListener("error",envoyer);}envoyer();});setTimeout(envoyer,50);setTimeout(envoyer,250);setTimeout(envoyer,800);})();';

    function construireSrcdoc(htmlContenu, opts) {
        var theme = opts && opts.themeClair ? 'mode-clair' : '';
        var baseURI = String(document.baseURI || '').replace(/["<>]/g, '');
        var variables = lireVariablesDS();
        var styles = styleDeBase();

        /* Pas de meta CSP ici : Safari merge le CSP de l'iframe avec celui
           du parent (intersection, le plus restrictif gagne) — ajouter une
           CSP plus permissive ici n'a aucun effet, ajouter une plus stricte
           bloquerait notre propre messenger. La CSP du parent (index.html
           ligne 6) sert déjà de défense en profondeur :
            - default-src 'self' bloque fetch/XHR/WebSocket depuis l'iframe
              (qui est en origine opaque, jamais 'self')
            - script-src 'self' 'sha256-…' autorise UNIQUEMENT le messenger
              de hauteur (figé, hash codé en dur dans la CSP) ; tout payload
              XSS injecté est rejeté
            - img-src 'self' file: data: laisse charger les SVG du badge CC
              (icons/by-nc-sa-2.svg) en file:// */

        /* Messenger placé en TÊTE de body, AVANT htmlContenu — pour
           résister à un `<script>` non terminé dans le contenu utilisateur.
           ResizeObserver observe `document.body` (auto-dimensionné au contenu)
           plutôt que documentElement (contraint par la hauteur de l'iframe). */

        // security-ok: srcdoc construit avec contenu utilisateur intentionnellement —
        // c'est le rôle de la sandbox de neutraliser tout payload XSS qu'il contient.
        return '<!DOCTYPE html>'
             + '<html lang="fr"><head>'
             + '<meta charset="UTF-8">'
             + '<meta name="color-scheme" content="' + (theme === 'mode-clair' ? 'light' : 'dark') + '">'
             + '<base href="' + baseURI + '">'
             + '<style>:root{color-scheme:' + (theme === 'mode-clair' ? 'light' : 'dark') + ';' + variables + '}' + styles + '</style>'
             + '</head>'
             + '<body class="' + theme + '">'
             + '<script>' + MESSENGER_SCRIPT + '</' + 'script>'
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
        // Aligne la couleur de canevas par défaut de l'iframe sur le thème
        // actif — sinon Safari rend un fond blanc derrière le contenu
        // transparent, visible en mode sombre comme un cadre parasite.
        iframe.style.colorScheme = themeClair ? 'light' : 'dark';
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

        var instance = {
            conteneur: conteneur,
            iframe: iframe,
            hauteurMin: hauteurMin,
            hauteurMax: hauteurMax,
            observer: null
        };
        instances.push(instance);

        // Auto-cleanup : si l'iframe est détachée du DOM (cas typique : le
        // call-site retire son wrapper via `wrapper.remove()` sans rappeler
        // `ApercuSandbox.fermer()`), splicer l'entrée du tableau pour libérer
        // la référence au DOM détaché et permettre le GC.
        if (typeof MutationObserver !== 'undefined') {
            instance.observer = new MutationObserver(function() {
                if (!iframe.isConnected) {
                    var idx = instances.indexOf(instance);
                    if (idx !== -1) instances.splice(idx, 1);
                    instance.observer.disconnect();
                    instance.observer = null;
                }
            });
            instance.observer.observe(document.body, { childList: true, subtree: true });
        }

        return iframe;
    }

    function fermer(conteneur) {
        if (!conteneur) return;
        var idx = -1;
        for (var i = 0; i < instances.length; i++) {
            if (instances[i].conteneur === conteneur) { idx = i; break; }
        }
        if (idx === -1) return;
        var instance = instances[idx];
        instances.splice(idx, 1);
        if (instance.observer) {
            instance.observer.disconnect();
            instance.observer = null;
        }
        try {
            if (instance.iframe.parentNode === conteneur) {
                conteneur.removeChild(instance.iframe);
            }
        } catch (e) {
            console.warn('[ApercuSandbox] erreur fermeture', e);
        }
    }

    window.ApercuSandbox = {
        afficher: afficher,
        fermer: fermer
    };
})();
