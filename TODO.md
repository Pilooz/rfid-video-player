- Ajout d'un bouton touch pour arrêter le raspberry pi (http://codelab.fr/6210)
- documentation usage

- Interface de contribution des sons ou vidéos
	- Contribution sur une URL particulière comme localhost:3000/contrib/
	- lorsqu'un tag est inconnu dans la base, le server broadcaste son id sur ../contrib/ 
	qui ouvre un formulaire permattant de saisir 
		- une photo de l'objet taggué 
		- une ressource sonore ou vidéo
		- une liste de mots-clé provenant de la liste des mots-clé déjà présents dans la base.

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


#### Todo

=> Tester la lecture des formats de fichiers issus des smartphones iOS et Android
=> idée de backoffice /contrib :
    - intégrer une url "ajouter un contenu" dans le message d'erreur "pas de contenu", qui pointe sur /contrib.
    - gérer un id unique de session pour chaque de vice connecté par socket.
    - côté serveur on vérifie que la session de la socket est la même que celle du player = Ca veut dire que pour intégrer un nouveau tag il faut être sur son smartphone ou sa tablette. 
    -  sur /contrib,  un bouton pour enregistrer du son  (champ de type file avec un mime pris en charge par l'os du device)
    - sur /contrib ajout de la liste de mots clé pour le lier au contenu sonore
     - voir json_editor ou faire un mini framework CRUD json ?
    - puis enregistrement dans les fichiers json.
         -> un tag - un/des mot(s) clé
         -> Un contenu - Un /des mot(s)
    Puis recharger la database des contenus
 
	- modifier les structures json pour ajouter la notion de "reader"

