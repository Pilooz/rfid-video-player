- Ajout d'un bouton touch pour arrêter le raspberry pi (http://codelab.fr/6210)
- documentation usage

### Branche *NodeJS*
- Rendu écran : 
	Faire une page web noire qui affiche les vidéos et les messages de services dans un player encapsulé

- Interface de contribution des sons ou vidéos
	- Contribution sur une URL particulière comme localhost:3000/contrib/
	- lorsqu'un tag est inconnu dans la base, le server broadcaste son id sur ../contrib/
	qui ouvre un formulaire permattant de saisir 
		- une photo de l'objet taggué 
		- une ressource sonore ou vidéo
		- une liste de mots-clé provenant de la liste des mots-clé déjà présents dans la base.

	- Ajouter un fichier de conf YAML pour initialiser des variables comme 
		- media_path
		- button_pin pour GPIO
		- port et vitesse Liasion serie
		- Type de sortie : Ecran ou Son, utile dans le cas où le dispositif ne sort que du son 
