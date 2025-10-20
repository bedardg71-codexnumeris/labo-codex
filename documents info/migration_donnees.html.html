<!DOCTYPE html>
<html>
<head>
    <title>Migration des données</title>
</head>
<body>
    <h1>Migration et sauvegarde des données</h1>
    <button onclick="sauvegarderDonnees()">1. Sauvegarder toutes les données</button>
    <button onclick="migrerDonnees()">2. Migrer les données</button>
    <button onclick="verifierMigration()">3. Vérifier la migration</button>
    
    <pre id="output"></pre>

    <script>
    function sauvegarderDonnees() {
        const backup = {};
        for(let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            backup[key] = localStorage.getItem(key);
        }
        
        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'backup_' + new Date().toISOString() + '.json';
        a.click();
        
        document.getElementById('output').textContent = 
            'Sauvegarde créée! Fichier téléchargé.\n\n' + json;
    }
    
    function migrerDonnees() {
        const migrations = {
            'listeEvaluations': 'listeGrilles'
        };
        
        let rapport = 'Migration effectuée:\n\n';
        
        for(let [ancien, nouveau] of Object.entries(migrations)) {
            if(localStorage.getItem(ancien)) {
                const data = localStorage.getItem(ancien);
                localStorage.setItem(nouveau, data);
                rapport += `✓ ${ancien} → ${nouveau}\n`;
            }
        }
        
        document.getElementById('output').textContent = rapport;
    }
    
    function verifierMigration() {
        let rapport = 'État du localStorage:\n\n';
        rapport += 'Anciennes clés:\n';
        rapport += '- listeEvaluations: ' + 
            (localStorage.getItem('listeEvaluations') ? 'PRÉSENT' : 'absent') + '\n\n';
        rapport += 'Nouvelles clés:\n';
        rapport += '- listeGrilles: ' + 
            (localStorage.getItem('listeGrilles') ? 'PRÉSENT ✓' : 'ABSENT ✗') + '\n';
        
        document.getElementById('output').textContent = rapport;
    }
    </script>
</body>
</html>