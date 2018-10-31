# Fonctionnement de l'application JukeBox Rfid

L'application fonctionne déjà de 2 façons :
 ### Le mode asynchrone :
 	Chaque lecture d'un tag RFID envoie un média joué immédiatemment par le client
 ### Le mode Asynchrone : 
 	On attend que la totalité des lecteurs aient détecté un tag RFID avant de jouer les média les uns après les autres dans l'ordre du numéro d'ordre des lecteur (et non pas dans l'ordre de détection)

#### Saisie des mots clé
- Fichier keywords.json se trouvant dans le répertoire `data/`
- Saisir un seul mot clé par champ "keyword", le champ "codes" peut contenir une liste de plusieurs codes issus des étiquettes RFID.

#### Saisie des medias
 - fichier media.json se trouvant dans le répertoire `data/`
 - Saisir un seul média par champ "media", le champ "keywords" peut contenir une liste de plusieurs mots clés.

#### Ajouter des médias
Toutes les vidéos se trouvent dans le répertoire './videos/'.
Il est possible de les classer dans des sous-répertoires de ce dossier. Il faudra alors préciser ce chemin relatif dans la base des médias.

#### Liste des 10 tags RFID fournis
	"0110FB663BB7","0110FB661A96","0110FB65F976","0110FB661A96","0110FB5DEB5C"
	"0110FB5DF047","0110FB6DF077","0110FB71F269","0110FB6D34B3","0110FB6D52D5"

#### Logging
L'application logue tout ce qu'il se passe au niveau des scénarios et des médias qui sont joués dans un fichier de log situé dan le répertoire `./log/rfid-video-player.log`.
Notamment, pour les nouvelles étiquettes rfid non encore associées à des mots clé, on retrouve dans ce fichier 
le code rfid nécessaire pour remplir la base de mots clé.

#### BoM

- Raspberry Pi 3
- arduino teensy 
- 125KHz Grove Rfid Reader x2 
- écran TFT LCD Kuman 

# Fonctionnement en mode scénario
Le mode "scénario" permet de jouer un scénario d'enchainement de médias, sur la base d'une lecture de code rfid.
Configurer ce mode dans le fichier de configutation de l'application : 'config.js'.
Les scénarios sont aussi configurables dans le fichier `data/scenarios.js`.

# Installation et Configuration du serveur sur Raspberry PI

## Réseau
Mettre le raspberry pi en mode AP + Wifi
https://pifi.imti.co/#connect-to-the-pi-over-wifi
