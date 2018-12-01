// Scenarios configuration

/*------------------------------------------------------------------------------------------

  1. Différents templates possibles
  ---------------------------------
    1.1 Les micro-templates
      - attr-background.ejs : Ce template gère l'affichage de l'attribut background des étapes de scénario.
      - attr-choices.ejs : Ce template gère l'affichage de l'attribut choices des étapes de scénario.
      - attr-medias.ejs : Ce template gère l'affichage de l'attribut medias des étapes de scénario.
      - attr-text.ejs : Ce template gère l'affichage de l'attribut text des étapes de scénario.

    1.2 Les micro-templates
    - "content" :
      Affiche toutes les propriétés background, choices, medias, et text
      Si la propriété "template" n'est pas définie, ce template est utilisé par défaut.

    - "wrong" : Affichage d'une erreur utilisateur

    - "right" : Affichage d'une réussite utilisateur 

    Il est tout a fait possible d'ajouter d'autres templates (autant qu'on veut en fait...).
    Il suffit de les placer dans le répertoire ./views/scenario/ 
    puis de les référencer sans leur extension ".ejs" dans les étapes de scénarios.   

  2. Construction d'une étape et attributs
  ----------------------------------------
    - stepId      : indentifiant unique d'une étape. Il doit être unique au sein d'un même scénario
    - title       : titre de l'étape, affiché enhaut de page. => texte, nullable
    - icon        : Illustration de la page placée à côté du titre. Nullable
    - template    : modele d'affichage. Par défaut si rien n'est précisé 'content' est utilisé.
                  le nom du template doit correspondre à un fichier .ejs dans views/scenario/
    - choices     : tableau de choix possibles permettant le branching
                    Ces choix peuvent être un tableau de textes, ou un tableau d'objet texte + image :
                    { text : "text", img : "image.gif" }
    - medias      : tableau de media présentés dans l'étape de type video/audio/image
                    S'il y en a plusieurs les medias sont enchainés les un après les autres avec
                    une temporisation définie dans l'attribut timeout. => nullable
                    ( TODO ! pour le moment seuls les tableaux d'images sont géré avec un petit carroussel)
    - mediaTimeout: temps en ms entre l'enchainement de 2 médias lorsque le tableau des médias
                    comporte plus d'un élément. Nullable/ défaut 3500 ms
    - background  : Image de fond de l'étape. implémenté dans le template par défaut
    - text        : Text à afficher. cela peut être du HMTL, ou du texte simple. => texte, nullable
    - transitions : Tableau de transitions vers l'étape suivante. Plusieurs types de transistions 
                    sont gérées. Elles sont décrite dans le paragraphe 4.
                    - id        : identifiant de l'étape suivante si la condition est validée
                    - condition : condition à évaluer pour passer à l'étape suivante.
                                  Cela peut être une expression javascript (evaluable conditions) comme :
                                    'choice == "Item-1"'
                                    'choice != "Bibliotheque" && choice != "Laboratoire"'
                                    'histo("step-1.7") && !histo("step-1.6")'
                                  Cela peut aussi des conditions évenementielles pré-construite comme 
                                  la fin de lecture d'un média, un temps écoulé, ...

  3. Exemple de description d'étape
  ---------------------------------
      {
        stepId : 'step-11',  
        title : 'Youpi Tralala !',
        template : 'content',
        choices : ["choice1", "choice2"],
        medias : ['myVideo.mp4', 'image.jpg', 'sound.mp3'],
        text : 'Lorem Ipsum...',
        transitions : 
        [
          {id : 'scenario0', condition : 'deselectObject' }
        ]
      }

  4. Différentes transitions possibles
  ------------------------------------
  Evènements
  - - - - - 
    Ces transitions s'utilisent toutes seules, sans autres transistions dans la liste
    - timeElapsed     : passer à l'étape suivante après un certain temps "duration"
    - endMedia        : passer à l'étape suivante à la fin du média, possibilité d'ajouter un temps de latence avec "duration"
    - manualStep      : passer à l'étape suivante sur commande du médiateur (on clique sur le bouton "suivant")
    - selectObject    : sélection d'un objet.
    - deselectObject  : déselection d'un objet.

    Cette transistion peut être répétée pour faire du branching
    - histo("step-xxx") : Vrai si on est déjà passée par l'étape "step-xxx", faux sinon
  
  Transitions à évaluer
   - - - - - - - - - - 
  Elles sont écrite sous forme d'expression javascript écrites entre simples quotes :
    'choice == "Item-1"'
    'choice != "Bibliotheque" && choice != "Laboratoire"'
    'histo("step-1.7") && !histo("step-1.6")'

------------------------------------------------------------------------------------------*/

module.exports = 
{
  scenarios : 
  [
     // --------------------------------------------------------------------------------
     // Scenario de présentation
     // --------------------------------------------------------------------------------
    { 
      scenarId : 'presentation', // scénario de présentation
      rfid : ['presentation'], 
      title : 'Dépôt’ware',
      scenarioMediaPath : 'presentation/',
      steps : [
      {
        stepId : 'step-0.1',
        title : '',
        template : 'presentation',
        medias : [''],
        text : '',
        transitions : 
          [
            { id : 'step-0.2', condition : 'manualStep' }
          ]
      },
      {
        stepId : 'step-0.2',
        title : 'Objets issus d’un dépotoir archéologique<br>découvert dans le Rhône à Arles',
        template : 'content',
        medias : [''],
        background : ['fouilles_rhone_depotoir©Teddy_Seguin-O_Can-Ipso_Facto_Mdaa_Cd13_08.jpg'],
        text : '',
        transitions : 
          [
            { id : 'step-0.3', condition : 'manualStep' }
          ]
      },
      {
        stepId : 'step-0.3',
        title : 'Contexte de découverte archéologique',
        template : 'video',
        medias : ['ABC-0.mp4'],
        text : '',
        transitions : 
          [
            { id : 'step-0.4', condition : 'endMedia', duration : '3000' }
          ]
      },
      {
        stepId : 'step-0.4',
        title : '',
        template : 'dashboard',
        medias : [''],
        templateData: {
	        canNext: false
        },
        text : '',
        transitions : 
          [
            { id : 'step-0.5', condition : 'manualStep' }
          ]
      },
      {
        stepId : 'step-end-1',
        title : '',
        template : 'credits',
        medias : [''],
        text : '',
        transitions : 
          [
            { id : 'step-0.4', condition : 'manualStep' }
          ]
      },
      ]
    },

     // --------------------------------------------------------------------------------
     // Premier scenario : La pipette
     // --------------------------------------------------------------------------------
    { 
      scenarId : 'scenario1', // scénario de la pipette
      rfid : ['00782B1A2D64', '00782B1BF5BD'],
      title : 'Découverte d\'un nouvel objet bien curieux !',
      scenarioMediaPath : 'pipette/',
      steps : [
      {
        stepId : 'step-1.1',
        title : 'Au bord du Rhône, un objet qu\'on ne connaissait pas auparavant…',
        template : 'video',
        medias : ['A1.mp4'],  //video-problematique-pipette.mp4
        text : '', // Nous avons trouvé au bord du Rhône un objet qu\'on ne connaissant pas auparavant.
        transitions : 
          [
          //  { id : 'step-1.2', condition : 'manualStep' }
            { id : 'step-1.1bis', condition : 'endMedia', duration : 2000 }
          ]
      },

      {
        stepId : 'step-1.1bis',
        title : '',
        template : 'cartel',
        templateData: {
	        creditsLine: 'numéro d’inventaire AR3.3005.36'
        },
        medias : ['pipette-archeo-dashboard.svg'],
        text : '<p>Fragment d’objet archéologique antique trouvé dans le Rhône à Arles</p>',
        transitions : 
          [
            { id : 'step-1.4', condition : 'manualStep' }
            // { id : 'step-1.2', condition : 'timeElapsed', duration : 10000 }
          ]
      },

      {
        stepId : 'step-1.4',
        title : 'A-t-on déjà découvert ce type d’objet ?',
        template : 'toolbox-choices',
        templateData: {
	        canNext: false
        },
        choices: [
	        { 
		        name: 'library', 
		        text : 'Consulter la bibliothèque', 
		        img : '../../assets/images/toolbox-library.svg' 
		      }
        ],
        text : '',
        transitions : 
        [
          { id : 'step-1.6', condition : 'manualStep' }
        ]
      },
      
			

      {
        stepId : 'step-1.6',
        title : '',
        template : 'library',
        medias : ['pipettes_épave_Lardier_4_subaquatique.jpg'],
        text : 'Les deux pipettes complètes découvertes sur l’épave Lardier 4, un navire de commerce romain',
        transitions : 
        [
          {id : 'step-1.1-contexte', condition : 'manualStep' }
        ]
      },

      {
        stepId : 'step-1.1-contexte',
        title : 'Forme et fonction de cet objet : hypothèses',
        template : 'context',
        medias : ['pipette-archeo.svg'],
        text : '',
        transitions : 
          [
            { id : 'step-1.2', condition : 'manualStep' }
            // { id : 'step-1.2', condition : 'timeElapsed', duration : 10000 }
          ]
      },

      {
        stepId : 'step-1.2',
        title : 'Forme et fonction de cet objet : hypothèses',
        template : 'cards',
        cards: [
	        {
		        recto: { text : "Salière", img : '../pipette/objet-saliere.svg'},
		        verso: { text : "Eh non !", img : '../pipette/objet-nope.svg'}
	        },
	        {
		        recto: { text : "Tampon", img : '../pipette/objet-tampon.svg'},
		        verso: { text : "Eh non !", img : '../pipette/objet-nope.svg'}
	        },
	        {
		        recto: { text : "Tamis", img : '../pipette/objet-tamis.svg'},
		        verso: { text : "Eh non !", img : '../pipette/objet-nope.svg'}
	        },
	        {
		        recto: { text : "Encensoir", img : '../pipette/objet-encensoir.svg'},
		        verso: { text : "Eh non !", img : '../pipette/objet-nope.svg'}
	        },
	        {
		        recto: { text : "Arrosoir", img : '../pipette/objet-arrosoir.svg'},
		        verso: { text : "Eh non !", img : '../pipette/objet-nope.svg'}
	        },
	        {
		        recto: { text : "Pipette", img : '../pipette/objet-pipette.svg'},
		        verso: { text : "Oui !", img : '../pipette/objet-yep.svg'}
	        },
	        {
		        recto: { text : "Autre", img : '../pipette/objet-autre.svg'},
		        verso: { text : "Eh non !", img : '../pipette/objet-nope.svg'}
	        },
	        {
		        recto: { text : "Non identifié", img : '../pipette/objet-ovni.svg'},
		        verso: { text : "Eh non !", img : '../pipette/objet-nope.svg'}
	        },
        ],
        medias : [''],
        transitions :  
          [ 
            { id : 'step-1.3', condition : 'manualStep', isBingoTransition: true },
//             { id : 'step-1.3-erreur', condition : 'choice != "Pipette"' }
          ]
      },

      {
        stepId : 'step-1.3',
        title : '',
        template : 'cartel',
        templateData: {
	        creditsLine: 'numéro d’inventaire AR3.3005.36'
        },
        medias : ['pipette-archeo.svg'],
        text : '<p><span class="goal-content">Pipette antique en céramique</span> trouvée dans le Rhône à Arles</p>',
        transitions : 
        [
          { id : 'step-1.8.2', condition : 'manualStep' }
        ]
      },

      {
        stepId : 'step-1.8.2',
        title : 'Pour vérifier cette hypothèse…',
        template : 'video',
        medias : ['A2.mp4'],
        transitions : 
        [
          {id : 'step-1.8.3', condition : 'endMedia', duration : 3000 }
        ]
      },

      {
        stepId : 'step-1.8.3',
        title : '…testons la pipette avec un verre d’eau !',
        template : 'video',
        medias : ['A3.mp4'],
        transitions : 
        [
          {id : 'step-1.8.4', condition : 'manualStep', isBingoTransition: true }
        ]
      },

      {
        stepId : 'step-1.8.4',
        title : '',
        template : 'cartel',
        templateData: {
	        creditsLine: 'numéro d’inventaire AR3.3005.36'
        },
        medias : ['pipette-archeo-2.svg'],
        text : '<p>Pipette antique en céramique trouvée dans le Rhône à Arles</p>',
        transitions : 
        [
          {id : 'step-1.9', condition : 'manualStep' }
        ]
      },

      {
        stepId : 'step-1.9',
        title : 'À quoi sert cet objet ?',
        template : 'use-of-pipette',
        templateData: {
	        canNext: false
        },
        choices : [''],
        medias : [''],
        text : '',
        transitions : 
        [
          {id : 'step-1.9.1', condition : 'choice == "quel liquide"' },
          {id : 'step-1.9.3', condition : 'choice == "quel conteneur"' }
        ]
      },

      {
        stepId : 'step-1.9.1',
        title : 'Laboratoire d\'analyses',
        template : 'labo',
        medias : [''],
        text : '',
        background: 'labo2.svg',
        transitions : 
        [
          {id : 'step-1.9', condition : '!histo("step-1.9.3")' },
          {id : 'step-1.10', condition : 'histo("step-1.9.3")', isBingoTransition: true }
        ]
      },


      {
        stepId : 'step-1.9.3',
        title : 'Quel conteneur ?',
        template : 'cards',
        cards : [
          { 
	          recto: { text : "Dolium", img : '../pipette/objet-dolium.svg'},
          	verso: { text : " ", img : '../pipette/objet-dolium-verso.svg'} 
          },
          { 
	          recto: { text : "Amphore", img : '../pipette/objet-amphore.svg'},
          	verso: { text : " ", img : '../pipette/objet-amphore-verso.svg'} 
          },
          { 
	          recto: { text : "Cruche", img : '../pipette/objet-cruche.svg'},
          	verso: { text : " ", img : '../pipette/objet-cruche-verso.svg'} 
          },
          { 
	          recto: { text : "Tonneau", img : '../pipette/objet-tonneau.svg'},
          	verso: { text : " ", img : '../pipette/objet-tonneau-verso.svg'} 
          }
        ],
        medias : [''],
         transitions : 
        [
          {id : 'step-1.9', condition : '!histo("step-1.9.1")' },
          {id : 'step-1.10', condition : 'histo("step-1.9.1")', isBingoTransition: true },
          /*
          {id : 'step-1.10-cruche', condition : 'choice == "Cruches"' },
          {id : 'step-1.10-dolia', condition : 'choice == "Dolia"' },
          {id : 'step-1.10-amphore', condition : 'choice == "Amphores"' }
          */
        ]
      },
/*
      // toutes les erreurs 
      {
        stepId : 'step-1.10-cruche',
        title : 'Bah non !',
        template : 'wrong',
        medias : ['erreur-cruche.mp4'],
        transitions : 
        [
          {id : 'step-1.9.3', condition : 'timeElapsed', duration : 20000 }
        ]
      },

      {
        stepId : 'step-1.10-amphore',
        title : 'Bah non !',
        template : 'wrong',
        medias : [''],
        transitions : 
        [
          {id : 'step-1.9.3', condition : 'timeElapsed', duration : 20000 }
        ]
      },

      {
        stepId : 'step-1.10-dolia',
        title : 'Bah non !',
        template : 'wrong',
        medias : [''],
        transitions : 
        [
          {id : 'step-1.9.3', condition : 'timeElapsed', duration : 20000 }
        ]
      },
*/
      {
        stepId : 'step-1.10',
        title : '',
        template : 'cartel',
        templateData: {
	        creditsLine: 'numéro d’inventaire AR3.3005.36'
        },
        medias : ['pipette-archeo-2.svg'],
        text : 'Pipette antique en céramique, trouvée dans le Rhône à Arles <span class="goal-content">et servant à prélever <span class="goal-maybe">du vin</span> depuis <span class="goal-maybe">un tonneau</span></span>',
        transitions : 
        [
          {id : 'step-1.10.1', condition : 'manualStep' }
        ]
      },





      {
        stepId : 'step-1.10.1',
        title : 'Vérifions les hypothèses',
        template : 'carousel',
        templateData: {
	        backgroundSize: 'cover'
        },
        medias : [
        	{ 
	        	img: 'fresque_pompei.jpg', 
	        	text: 'Fresque de Pompéi représentant une dégustation de vin à partir d’amphores',
	        	backgroundSize: 'cover' },
        	{ 
	        	img: 'moule_céramique_sigillée_Trêve.jpg', 
	        	text: 'Moule de céramique sigillée en terre cuite figurant une embarcation chargée de tonneaux, Landesmuseum de Trêve' },
        	{ 
	        	img: 'sarcophage_ancone_detail2.jpg', 
	        	text: 'Sarcophage d’Ancône représentant une vente de vin en tonneau',
	        	backgroundSize: 'cover'
	        }
        ],
        text : '',
        transitions : 
          [
          {id : 'step-1.12', condition : 'manualStep', isBingoTransition: true, isFinalBingo: true }
          ]
      },

/*
      {
        stepId : 'step-1.10.1',
        title : 'Boîte à outils : Bibliothèque',
        template : 'content', // carousel
        medias : ['fresque_pompei.jpg', 'moule_céramique_sigillée_Trêve.jpg', 'sarcophage_ancone_detail2.jpg'],
        transitions : 
        [
          {id : 'step-1.12', condition : 'manualStep' }
        ]
      },
*/

      // {
      //   stepId : 'step-1.11',
      //   title : 'La pipette pour le tonneau',
      //   template : 'content',
      //   medias : ['explication-depotoire-portuaire.mp4'],
      //   transitions : 
      //   [
      //     {id : 'step-1.12', condition : 'endMedia', duration : 2000 }
      //   ]
      // },

      {
        stepId : 'step-1.12',
        title : '',
        template : 'cartel',
        templateData: {
	        creditsLine: 'numéro d’inventaire AR3.3005.36'
        },
        medias : ['pipette-cartel-final.svg'],
        text : '<p><strong>Pipette</strong> antique en céramique, trouvée dans le Rhône à Arles et servant à prélever du vin depuis un tonneau. <span class="goal-content">Cet objet permettrait d’attester l’usage de tonneaux à Arles dans l’Antiquité pour le commerce du vin.</span></p>',
        transitions : 
        [
          {id : 'step-1.1', condition : 'deselectObject' }
        ]
      }
      ]
    },

    // --------------------------------------------------------------------------------
    // Deuxième scenario : La capsule.
    // --------------------------------------------------------------------------------
    { 
      scenarId : 'scenario2', // scénario de la capsule
      rfid : ['00782B1A88C1', '00782B19ECA6'],
      title : 'Ceci n\'est pas une capsule !',
      scenarioMediaPath : 'capsule/',
      steps : [
      {
        stepId : 'step-1',
        title : 'Petit objet en métal : quel est cet objet archéologique ?',
        template : 'video',
        medias : ['C1.mp4'],
        transitions : 
          [
            { id : 'step-2', condition : 'endMedia', duration : 2000 }
          ]
      },

      {
        stepId : 'step-2',
        title : 'Contexte',
        template : 'cartel',
        text : '<p>Petit objet archéologique en métal trouvé dans le Rhône à Arles.</p>',
        medias : ['capsule-archeo.svg'],
        transitions : 
          [
            { id : 'step-3', condition : 'manualStep' }
          ]
      },

      {
        stepId : 'step-3',
        title : 'Réunir 4 critères de comparaison',
        template : 'context',
        text : '',
        medias : ['capsule-archeo.svg'],
        // medias : [ 'moule-charlotte.jpg', 'plat-a-tarte-verre.jpg', 'coquillage.jpg', 'roulette.jpg', 'capsule-biere-bouteille.jpg', 'plat-a-tarte.jpg'],
        transitions : 
          [
            { id : 'step-4', condition : 'manualStep' }
          ]
      },

      {
        stepId : 'step-4',
        title : 'Comment décrire cet objet ?',
        template : 'matching-ihm',
        text : 'Boîte à outils > Bibliothèque',
        medias : [''],
        transitions : 
          [
            { id : 'step-5', condition : 'manualStep', isBingoTransition: true }
          ]
      },

      {
        stepId : 'step-5',
        title : '',
        template : 'cartel',
        text : 'Objet métallique trouvé dans le Rhône à Arles ; <span class="goal-content">la typologie indique une forme circulaire et un décor de cannelures dentelées constants, pour une taille pouvant varier.</span>',
        medias : ['capsule-archeo-2.svg'],
        transitions : 
          [
            { id : 'step-6', condition : 'manualStep' }
          ]
      },

      {
        stepId : 'step-6',
        title : 'À quoi sert cet objet ?',
        template : 'toolbox-choices',
        templateData: {
	        canNext: false
        },
        text : '',
        choices: [
	        { 
		        name: 'archaeologist', 
		        text : 'Interroger l\'archéologue', 
		        img : '../../assets/images/toolbox-archaeologist.svg' 
		      }
        ],
        medias : [''],
        transitions : 
          [
            { id : 'step-7', condition : 'manualStep' },
          ]
      },

      {
        stepId : 'step-7',
        title : 'Des objets dans des contextes culinaires…',
        template : 'video',
        medias : ['C2.mp4'],
        text : '',
        transitions : 
          [
            { id : 'step-8-pre', condition : 'manualStep' }
          ]
      },
      
      {
        stepId : 'step-8-pre',
        title : 'À quoi sert cet objet ?',
        template : 'toolbox-choices',
        templateData: {
	        canNext: false
        },
        text : '',
        choices: [
	        { 
		        name: 'lab', 
		        text : 'Effectuer une analyse en laboratoire', 
		        img : '../../assets/images/toolbox-lab.svg' 
		      }
        ],
        medias : [''],
        transitions : 
          [
            { id : 'step-8', condition : 'manualStep' },
          ]
      },

      {
        stepId : 'step-8',
        title : 'Laboratoire d\'analyses',
        template : 'labo',
        medias : [''],
        background: 'labo1.svg',
        text : '',
        transitions : 
          [
            { id : 'step-9', condition : 'manualStep', isBingoTransition: true, isFinalBingo: true } // final
          ]
      },

      {
        stepId : 'step-9',
        title : '',
        template : 'cartel',
        text : '<strong>Plat</strong> métallique circulaire à décor de cannelures dentelées, de taille pouvant varier. <span class="goal-content">Les archéologues en retrouvent fréquemment en contexte de dépotoir (cas du Rhône à Arles) ou domestique. Il permettait peut-être de présenter de petits aliments crus ou déjà cuits.</span>',
        medias : ['capsule-cartel-final.svg'],
        transitions : 
          [
            { id : 'step-10', condition : 'deselectObject' }
          ]
      },
      ]
    },

    // --------------------------------------------------------------------------------
    // Troisième scenario : L'amphorisque.
    // --------------------------------------------------------------------------------
    { 
      scenarId : 'scenario3', // scénario de l'amphorisque
      rfid : ['00782B1A80C9', '00782B1996DC'],
      title : 'Un objet bien singulier…',
      scenarioMediaPath : 'amphorisque/',
      steps : [
      {
        stepId : 'step-1',
        title : 'Objet portant une inscription peinte : quel est cet objet ?',
        template : 'video',
        medias : ['B1.mp4'],
        transitions : 
          [
            { id : 'step-2', condition : 'endMedia', duration : '2000' }
          ]
      },

      {
        stepId : 'step-2',
        title : '',
        template : 'cartel',
        templateData: {
	        creditsLine: 'numéro d’inventaire RHO.2011.2007.78'
        },
        medias : ['amphorisque-archeo-dashboard.svg'],
        text : '<p>Objet archéologique antique trouvé dans le Rhône et portant une inscription peinte</p>',
        transitions : 
          [
            { id : 'step-3', condition : 'manualStep' }
          ]
      },

        {
        stepId : 'step-3',
        title : 'Comment décrire cet objet ?',
        template : 'context',
        text : '',
        medias : ['amphorisque-archeo.svg'],
       transitions : 
          [
            { id : 'step-4', condition : 'manualStep', isBingoTransition:true }
          ]
      },

      {
        stepId : 'step-4',
        title : '',
        template : 'cartel',
        templateData: {
	        creditsLine: 'numéro d’inventaire RHO.2011.2007.78'
        },
        medias : ['amphorisque-archeo.svg'],
        text : '<p><span class="goal-content">Amphorisque</span> antique<br><span class="goal-content">en céramique</span> trouvée dans le Rhône et portant une inscription peinte.</p>',
        transitions : 
          [
            { id : 'step-5', condition : 'manualStep' }
          ]
      },

        {
        stepId : 'step-5',
        title : 'Forme et fonction de cet objet : hypothèses',
        template : 'carousel',
        text : '',
        medias : [
        	{ img: 'objet-lampe-huile.svg', text: 'Pied à lampe à huile ?' }, 
        	{ img: 'objet-cornet-des.svg', text: 'Cornet à dés ?' }, 
        	{ img: 'objet-decapsuleur.svg', text: 'Décapsuleur ?' },
        	{ img: 'objet-bouchon.svg', text: 'Bouchon d\'amphore ?' },
        	{ img: 'objet-echantillon.svg', text: 'Échantillon ?'}
        ],
       transitions : 
          [
            { id : 'step-5bis', condition : 'manualStep' }
          ]
      },

        {
        stepId : 'step-5bis',
        title : 'Forme et fonction de cet objet : hypothèses',
        template : 'video',
        text : '',
        medias : ['B2.mp4'],
       transitions : 
          [
            { id : 'step-6', condition : 'endMedia', duration : '2000' }
          ]
      },

        {
        stepId : 'step-6',
        title : 'Forme et fonction de cet objet : hypothèses',
        template : 'cards',
        text : '',
        cards : [
          { 
	          recto : { text : "Lampe à huile", img : 'objet-lampe-huile.svg' },
	          verso : { text : 'Eh non !', img: '../pipette/objet-nope.svg' }
	        },
          { 
	          recto : { text : "Bouchon d'amphore", img : 'objet-bouchon.svg' },
	          verso : { text : 'Eh non !', img: '../pipette/objet-nope.svg' }
	        },
          { 
	          recto : { text : "Échantillon", img : 'objet-echantillon.svg' },
	          verso : { text : 'Eh non !', img: '../pipette/objet-nope.svg' }
	        },
          { 
	          recto : { text : "Cornet à dés", img : 'objet-cornet-des.svg' },
	          verso : { text : 'Eh non !', img: '../pipette/objet-nope.svg' }
	        },
          { 
	          recto : { text : "Décapsuleur d'amphore", img : 'objet-decapsuleur.svg' },
	          verso : { text : 'Eh non !', img: '../pipette/objet-nope.svg' }
	        }
        ],
       transitions : 
          [
            { id : 'step-9-pre', condition : 'manualStep' }
          ]
      },
      
      

      {
        stepId : 'step-9-pre',
        title : 'Qu\'est-ce qui est écrit sur cet objet ?',
        template : 'toolbox-choices',
        templateData: {
	        canNext: false
        },
        choices: [
	        { 
		        name: 'library', 
		        text : 'Consulter la bibliothèque', 
		        img : '../../assets/images/toolbox-library.svg' 
		      }
        ],
        text : '',
        transitions : 
        [
          { id : 'step-9', condition : 'manualStep' }
        ]
      },

      {
        stepId : 'step-9',
        title : 'Bibliothèque',
        template : 'amphorisque-abc',
        medias : ['abc.svg'],
        text : '<p> ISOCHRYSO AB HERMEROT(I)S </p><p> ASYNTROPHO(N) </p>',
        transitions : 
          [
            { id : 'step-9-post', condition : 'manualStep' }
          ]
      },
      
      

      {
        stepId : 'step-9-post',
        title : 'Qu\'est-ce qui est écrit sur cet objet ?',
        template : 'toolbox-choices',
        templateData: {
	        canNext: false
        },
        text : '',
        choices: [
	        { 
		        name: 'archaeologist', 
		        text : 'Interroger l\'archéologue', 
		        img : '../../assets/images/toolbox-archaeologist.svg' 
		      }
        ],
        medias : [''],
        transitions : 
          [
            { id : 'step-10', condition : 'manualStep' },
          ]
      },

      {
        stepId : 'step-10',
        title : 'Un peu d\'aide pour traduire les inscriptions',
        template : 'video',
        medias : ['B3.mp4'],
        text : 'Monsieur l\'archéologue, pourriez-vous nous aider à traduire les inscriptions ?',
        choices : '',
        transitions : 
          [
            { id : 'step-8bis', condition : 'manualStep', isBingoTransition:true }
          ]
      },   


      {
        stepId : 'step-8bis',
        title : '',
        template : 'cartel',
        templateData: {
	        creditsLine: 'numéro d’inventaire RHO.2011.2007.78'
        },
        medias : ['amphorisque-archeo-2.svg'],
        text : 'Amphorisque antique en céramique trouvée dans le Rhône et portant une inscription peinte, <span class="goal-content">ayant contenu des ingrédients de la pharmacopée.</span>',
        choices : '',
        transitions : 
          [
            { id : 'step-7', condition : 'manualStep' }
          ]
      },


			
      {
        stepId : 'step-7',
        title : 'À quoi sert cet objet ?',
        template : 'toolbox-choices',
        text : '',
        templateData: {
	        canNext: false
        },
        choices: [
	        { 
		        name: 'archaeologist', 
		        text : 'Interroger l\'archéologue', 
		        img : '../../assets/images/toolbox-archaeologist.svg' 
		      }
        ],
        medias : [''],
        transitions : 
          [
            { id : 'step-8', condition : 'manualStep' },
          ]
      },
      

      {
        stepId : 'step-8',
        title : 'Présence de décoctions de plantes et d\'excréments dans les analyses…',
        template : 'video',
        medias : ['B4.mp4'],
        text : '',
        transitions : 
          [
            { id : 'step-12', condition : 'manualStep', isBingoTransition:true, isFinalBingo: true }
          ]
      },
      /*
      {
        stepId : 'step-8-post',
        title : 'À quoi sert l\'objet ?',
        template : 'carousel', // gallery
        medias : [
        	{ img: 'objet-lampe-huile.svg', text: 'Pied à lampe à huile ?' }, 
        	{ img: 'objet-cornet-des.svg', text: 'Cornet à dés ?' }, 
        	{ img: 'objet-decapsuleur.svg', text: 'Décapsuleur ?' },
        	{ img: 'objet-bouchon.svg', text: 'Bouchon d\'amphore ?' },
        	{ img: 'objet-echantillon.svg', text: 'Échantillon ?'}
        ],
        text : '',
        transitions : 
          [
            { id : 'step-9-pre', condition : 'manualStep' }
          ]
      },

      {
        stepId : 'step-11',
        title : 'Une nouvelle hypothèse plus fiable',
        template : 'video',
        medias : ['B5.mp4'],
        text : '',
        choices : '',
        transitions : 
          [
            { id : 'step-12', condition : 'manualStep', isBingoTransition:true, isFinalBingo: true }
          ]
      },
      */

      {
        stepId : 'step-12',
        title : '',
        template : 'cartel',
        templateData: {
	        creditsLine: 'numéro d’inventaire RHO.2011.2007.78'
        },
        medias : ['amphorisque-cartel-final.svg'],
        text : '<strong>Amphorisque</strong> antique en céramique trouvée dans le Rhône. L’inscription peinte et une analyse chimique indiquent qu’elle contenait de l’asyntrophon, nom grec de la ronce de murier, ainsi que des excréments, ingrédients de la pharmacopée antique.',
        transitions : 
          [
            { id : 'step-1', condition : 'deselectObject' }
          ]
      },

      ]
    }
  ]
}
