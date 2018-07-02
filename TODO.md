- Ajout d'un bouton touch pour arrêter le raspberry pi (http://codelab.fr/6210)
- documentation usage

### Branche *NodeJS*

- Scripts de démarrage et arrêt sur Raspberry Pi
- Logging du serveur dans un fichier
- Changer le répertoire "videos" en "medias"

- Tests unitaires :
	- tester le front-end 


### Branche *ProjetTarascon*
	#### Description 
	_Projet de cadavre exquis_ RFID : 3 lecteurs synchronisés qui lisent simultanément 3 tags pour former une histoire
	L'ordre est important : 
	- si le lecteur 3 détecte un tag en premier, il faut attendre les 2 autres pour qu'un contenu soit diffusé
	- On commence toujours par diffuser le contenu déclenché par le premier lecteur, plus le deuxième, puis le troisième
    -  un lien de 1<->1 de code vers keyword et de keyword vers media


#### Todo

=> Tester la lecture des formats de fichiers issus des smartphones iOS et Android
=> idée de backoffice /contrib :
    + (10min) intégrer une url "ajouter un contenu" dans le message d'erreur "pas de contenu", qui pointe sur /contrib.
    + (5min) Déclarer une page de contribution qui répond sur /contrib avec le paramètre du code RFID en get.
    + (7min) factoriser le header et footer HTML pour ré-emploi.
    + (1h) sur /contrib,  un bouton pour enregistrer du son/ de la vidéo (champ de type file avec un mime pris en charge par l'os du device)
    + (1h) sur /contrib ajout de la liste de mots clé pour le lier au contenu sonore/video
    x (2h) voir json_editor ou faire un mini framework CRUD json ?
    + (1h) puis enregistrement dans les fichiers json.
         -> un tag - un/des mot(s) clé
         -> Un contenu - Un /des mot(s)
    + Puis recharger la database des contenus
    + Renommer les fichiers uploadés correctement
    + Règler le problème de droits d'écriture de mediaDB dans le repertoire 'data/'
    - Sécuriser les données du formualaires (client et serveur )
 
	x modifier les structures json pour ajouter la notion de "reader" 
    x gérer un id unique de session pour chaque de vice connecté par socket.

    - Faire une autre index-cadavre-exquis.ejs qui gère ce cas de figure et le router correctement côté serveur sur / en fonction d'un paramétrage global de l'aaplication : 
        CADAVRE_EXQUIS=true; 
        NUM_READER=3;
    + (5 min) Paramétrage dans fichier de config OK

=> test unitaires sur mediaDB.js à compléter

=>  Raspberry PI
    + (3 h) Installer une distro (Noob ? Raspbian ?)
    + (2 min) redescendre l'application
    + (1 h) monter un point d'accès réseau wifi sur le raspberry
    + (2 min) Démarrer automatiquement le service node (dans /etc/rc.local)
    - connecter une tablette et tester 
    - alimenter tout ça correctement
    - prévoir une paire d'enceinte pour sortir le son de la tablette (éventuellement bluetooth mais attention au compatibilités avec le raspberry)
    - booter le raspberry pi en mode command line.


