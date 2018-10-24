# Implémentation de scénarii complexes.

L'application fonctionne déjà de 2 façons :
 ### Le mode asynchrone :
 	Chaque lecture d'un tag RFID envoie un média joué immédiatemment par le client
 ### Le mode Asynchrone : 
 	On attend que la totalité des lecteurs aient détecté un tag RFID avant de jouer les média les uns après les autres dans l'ordre du numéro d'ordre des lecteur (et non pas dans l'ordre de détection)

L'implémentation de scénarii complexes ne chagera pas ce principe de fonctionnement mais permettra de remplacer le média par un enchaînement de média et d'interactions utilisateur _* le scénario *_ :
	RFID => Mot-clé => Choix d'un média
	RFID => enchainement de média

	Le mode asynchrone, avec un seul lecteur, permet d'envisager les scénarii du dépotware
	Le mode synchrone, permettrait de jouer plusieurs scénarios d'affilé

On conserve : 
- la meme base, avec la détection RFID.
- Le principce de communication Socket avec le client
- Le routage vers un client 
- La gestion des erreurs de media côté client
- Le back-office d'ajout d'un média

### Le Trello associé au projet
https://trello.com/b/EI2hRapk/production-mus%C3%A9e-darles-depotware

## Client
+ Utiliser un framework du type Bootstrap
+ Ecrire un librairie JS qui gère la navigation ainsi que des fonctions génériques de vérification d'état.
	+ Fonctions de navigation qui communiquent par socket
+ page de spash (il s'agit juste d'un message vidéo "attente" différent en fait)
+ refactoring / mutualisation
	+ Refactoring de index.ejs => mettre les fonctions js dans une lib
	+ Réutilisation de cette lib ^ pour l'index des scénario

## Serveur
 + renommer ./video/ en ./media/
 + Voir comment gérer cette configuration d'application en plus des fonctionnalités de base sans les dénaturer
 	+ Paramètre "scenario_mode" = Yes/No
 	+ Voir tous les paramètres de la POC Depotware, et trier sur ce qui est indispensable
 	
 + Implémenter la navigation d'un écran à l'autre (Routage Express et Socket)
 + Ajouter les fichiers JS de description de scénarii dans ./data
 + Ajouter un Sample File de test
 - Test unitaire des fonctions de routage et de manipulation des données de scénario
 - faire en sorte que le ".ejs" des templates du fichier JSON de scénario soit ajouté par défaut
 + Prendre les médias dans le bon répertoire. ./media/[nom rep media sécnario]/
 - fusionner content.js avec video.js : les servent des contenus
 - Ajouter une jauge temporelle sur les transitions automatiques

 ## Back-office sur /admin 
 o Page de liste des scénarii
 o ecrire une page de visualisation d'un scénario (détails)
 ? notion de chemin critique à réfléchir, 
 ? comment réprésenter simplement une arborescence, le branching avec ses conditions ?
 o Formulaire d'ajout d'une étape et de ses conditions de validation
 o Formulaire d'ajout d'un média (modification de l'existant du systèem "cadavre exquis rfid")




 