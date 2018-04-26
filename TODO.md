- Ajout d'un bouton touch pour arrêter le raspberry pi (http://codelab.fr/6210)
- documentation usage

### Branche *NodeJS*

- Interface de contribution des sons ou vidéos
	- Contribution sur une URL particulière comme localhost:3000/contrib/
	- lorsqu'un tag est inconnu dans la base, le server broadcaste son id sur ../contrib/
	qui ouvre un formulaire permattant de saisir 
		- une photo de l'objet taggué 
		- une ressource sonore ou vidéo
		- une liste de mots-clé provenant de la liste des mots-clé déjà présents dans la base.

- Refactoring index.js (séparer en fichiers par fonctions )