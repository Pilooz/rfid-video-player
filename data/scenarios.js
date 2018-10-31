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
      scenarId : 'scenario0', // scénario de présentation
      rfid : ['presentation'], 
      title : 'Dépôt’ware',
      scenarioMediaPath : 'presentation/',
      steps : [
      {
        stepId : 'step-0.1',
        title : 'Enquête archéologique',
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
        title : 'Enquête archéologique',
        template : 'content',
        medias : [''],
        background : ['fouilles_rhone_depotoir©Teddy_Seguin-O_Can-Ipso_Facto_Mdaa_Cd13_08.jpg'],
        text : 'Objets issus d’un dépotoir archéologique découvert dans le Rhône à Arles',
        transitions : 
          [
            { id : 'step-0.3', condition : 'timeElapsed', duration : '3000' }
          ]
      },
      {
        stepId : 'step-0.3',
        title : 'Enquête archéologique',
        template : 'content',
        medias : ['ABC-0.mp4'],
        text : '',
        transitions : 
          [
            { id : 'step-0.4', condition : 'endMedia', duration : '3000' }
          ]
      },
      {
        stepId : 'step-0.4',
        title : 'Enquête archéologique',
        template : 'dashboard',
        medias : [''],
        text : 'Saisissez un objet. Pour l’identifier, laissez-vous guider et expérimentez la démarche scientifique',
        transitions : 
          [
            { id : 'step-0.5', condition : 'manualStep' }
          ]
      },
      ]
    },

     // --------------------------------------------------------------------------------
     // Premier scenario : La pipette
     // --------------------------------------------------------------------------------
    { 
      scenarId : 'scenario1', // scénario de la pipette
      rfid : ['00782B1A2D64'],
      title : 'Découverte d\'un nouvel objet bien curieux !',
      scenarioMediaPath : 'pipette/',
      steps : [
      {
        stepId : 'step-1.1',
        title : '',
        template : 'content',
        medias : ['A1.mp4'],  //video-problematique-pipette.mp4
        text : '', // Nous avons trouvé au bord du Rhône un objet qu\'on ne connaissant pas auparavant.
        transitions : 
          [
          //  { id : 'step-1.2', condition : 'manualStep' }
            { id : 'step-1.1bis', condition : 'endMedia', duration : 2000 } // 2000
          ]
      },

      {
        stepId : 'step-1.1bis',
        title : '',
        template : 'cartel-state-0',
        templateData: {
	        
        },
        medias : ['AR3.3005.36_dessin_archeo.png'],
        text : '<p>Fragment d’objet archéologique antique trouvé dans le Rhône à Arles</p>\n<p class="sub">Dimensions H. 6,46 × Diam. 5,65 cm</p>',
        transitions : 
          [
            { id : 'step-1.2', condition : 'manualStep' }
            // { id : 'step-1.2', condition : 'timeElapsed', duration : 10000 }
          ]
      },

      {
        stepId : 'step-1.2',
        title : 'Comment décrire cet objet ?',
        template : 'content',
        templateData: {
	        canNext: false
        },
        choices : [
          { text : "Salière", img : '../pipette/objet-saliere.svg'}, 
          { text : "Tampon", img : '../pipette/objet-tampon.svg'}, 
          { text : "Tamis", img : '../pipette/objet-tamis.svg'}, 
          { text : "Encensoir", img : '../pipette/objet-encensoir.svg'}, 
          { text : "Arrosoir", img : '../pipette/objet-arrosoir.svg'}, 
          { text : "Pipette", img : '../pipette/objet-pipette.svg'}, 
          { text : "Autre", img : '../pipette/objet-autre.svg'}, 
          { text : "Non identifié", img : '../pipette/objet-ovni.svg'}
        ],
        medias : [''],
        transitions :  
          [ 
            { id : 'step-1.3', condition : 'choice == "Pipette"' },
            { id : 'step-1.3-erreur', condition : 'choice != "Pipette"' }
          ]
      },

      {
        stepId : 'step-1.3',
        title : 'Bravo!',
        template : 'cartel-state-0',
        templateData: {
	        
        },
        medias : ['AR3.3005.36_dessin_archeo.png'],
        text : '<p><span class="goal-content">Pipette antique en céramique</span> trouvé dans le Rhône à Arles</p>\n<p class="sub">Dimensions H. 6,46 × Diam. 5,65 cm</p>',
        transitions : 
        [
          { id : 'step-1.6', condition : 'manualStep' }
          // { id : 'step-1.6', condition : 'timeElapsed', duration : 5000 }
        ]
      },

      {
        stepId : 'step-1.3-erreur',
        title : 'Bah non !',
        template : 'wrong',
        templateData: {
	        canNext: false
        },
        medias : ['erreur.gif'],
        transitions : 
        [
          {id : 'step-1.2bis', condition : 'timeElapsed', duration : 5000 }
        ]
      },

      // {
      //   stepId : 'step-1.4',
      //   title : 'Mais quelle est l\'utilité de cette pipette ?',
      //   template : 'content',
      //   medias : ['test-labo.mp4'], // choice-usage-pipette.mp4
      //   transitions : 
      //   [
      //     {id : 'step-1.5', condition : 'endMedia', duration : 2000 }
      //   ]
      // },

      // {
      //   stepId : 'step-1.5',
      //   title : 'Boîte à outils > Bibliothèque',
      //   template : 'content',
      //   //choices : ["Bibliotheque", "Laboratoire"],
      //   medias : [''],
      //   text : "",
      //   transitions : 
      //   [
      //     {id : 'step-1.6', condition : 'manualStep' }
      //     //{id : 'step-1.6', condition : 'choice == "Bibliotheque"' }
      //     // {id : 'step-1.7', condition : 'choice == "Laboratoire"' },
      //     // {id : 'step-1.8', condition : 'choice != "Bibliotheque" && choice != "Laboratoire"' }
      //   ]
      // },

      {
        stepId : 'step-1.6',
        title : 'Boîte à outils > Bibliothèque',
        template : 'content',
        medias : ['pipettes_épave_Lardier_4_subaquatique.jpg'],
        text : 'Recherche en bibliothèque. <em>Ecran de recherche / attente (la machine réfléchit) / résultat => </em>',
        transitions : 
        [
          {id : 'step-1.8', condition : 'manualStep' }
        ]
      },

      {
        stepId : 'step-1.8',
        title : 'Comment ça fonctionne ?',
        template : 'content',
        medias : [''],
        text : 'Pour en avoir une idée il faut il faut le fabriquer, le reproduire.',
        transitions : 
        [
          {id : 'step-1.8.2', condition : 'timeElapsed', duration : 5000 }
        ]
      },

      {
        stepId : 'step-1.8.2',
        title : 'Comment ça fonctionne ?',
        template : 'content',
        medias : ['A2_time_lapse_pipette.mp4'],
        transitions : 
        [
          {id : 'step-1.8.3', condition : 'endMedia', duration : 3000 }
        ]
      },

      {
        stepId : 'step-1.8.3',
        title : 'Testons la pipette avec un verre d’eau !',
        template : 'content',
        medias : ['A3.mp4'],
        transitions : 
        [
          {id : 'step-1.8.4', condition : 'manualStep' }
        ]
      },

      {
        stepId : 'step-1.8.4',
        title : 'Bingo !',
        template : 'cartel-state-0',
        templateData: {
	        backgroundSize: 'cover'
        },
        medias : ['reproduction_pipette.jpg'],
        text : '<p>Pipette antique en céramique trouvé dans le Rhône à Arles</p>\n<p class="sub">Dimensions H. 6,46 × Diam. 5,65 cm</p>',
        transitions : 
        [
          {id : 'step-1.9', condition : 'manualStep' }
        ]
      },

      {
        stepId : 'step-1.9',
        title : 'A quoi sert cet objet ?',
        template : 'text-with-choice-buttons',
        choices : [''],
        medias : [''],
        text : '<ul><li>Quelle est l’utilité d’avoir une pipette ?</li>\n' + 
                   '<li>A quoi ça sert concrètement ?</li>\n' + 
                   '<li> Dans quel cas on l’utilise ?</li></ul>\n' + 
                   '<p>La pipette sert à prélever \n' + 
                   '<button class="btn btn-md btn-default choiceButton" id="but0" name="quel liquide">quel liquide</button>\n' +
                   ' dans \n' + 
                   '<button class="btn btn-md btn-default choiceButton" id="but1" name="quel conteneur">quel conteneur</button>\n' +
                   ' ?</p>\n',
        transitions : 
        [
          {id : 'step-1.9.1', condition : 'choice == "quel liquide"' },
          {id : 'step-1.9.3', condition : 'choice == "quel conteneur"' }
        ]
      },

      {
        stepId : 'step-1.9.1',
        title : 'Laboratoire d\'analyses',
        template : 'labo-analyse-pipette',
        medias : [''],
        text : '',
        transitions : 
        [
          {id : 'step-1.9.2', condition : 'manualStep' }
        ]
      },

      {
        stepId : 'step-1.9.2',
        title : 'Laboratoire d\'analyses',
        template : 'content',
        medias : ['test-labo.mp4'],
        text : '',
        transitions : 
        [
          {id : 'step-1.9', condition : '!histo("step-1.9.3")' },
          {id : 'step-1.10.1', condition : 'histo("step-1.9.3")' }
        ]
      },


      {
        stepId : 'step-1.9.3',
        title : 'Quel conteneur ?',
        template : 'memory',
        choices : ["Dolia", "Amphores", "Cruches", "Tonneaux"],
        medias : [''],
         transitions : 
        [
          {id : 'step-1.10-tonneaux', condition : 'choice == "Tonneaux"' },
          {id : 'step-1.10-cruche', condition : 'choice == "Cruches"' },
          {id : 'step-1.10-dolia', condition : 'choice == "Dolia"' },
          {id : 'step-1.10-amphore', condition : 'choice == "Amphores"' }
        ]
      },

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

     {
        stepId : 'step-1.10-tonneaux',
        title : 'Bingo !',
        template : 'right',
        medias : [''],
        text : 'Pipette antique en céramique, trouvée dans le Rhône à Arles et servant à prélever du ' + 
               '<span class="blink_me">vin</span> [et seulement du vin] depuis <span class="blink_me">un tonneau</span>.',
        transitions : 
        [
          {id : 'step-1.9', condition : '!histo("step-1.9.1")' },
          {id : 'step-1.10.1', condition : 'histo("step-1.9.1")' }
        ]
      },

      // Etape suivante : tonneau, sauf si on n'est pas passé par l'étape 'quel liquide'
      {
        stepId : 'step-1.10.1',
        title : 'Boîte à outils : Bibliothèque',
        template : 'content',
        medias : ['fresque_pompei.png', 'moule_céramique_sigillée_Trêve.jpg', 'sarcophage_ancone_detail.png'],
        transitions : 
        [
          {id : 'step-1.12', condition : 'manualStep' }
        ]
      },

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
        title : 'Bingo !',
        template : 'right',
        medias : [''],
        text : '<strong>Pipette</strong> antique en céramique, trouvée dans le Rhône à Arles et servant à prélever du vin depuis un tonneau. Cet objet permettrait d’attester l’usage de tonneaux à Arles dans l’Antiquité pour le commerce du vin.',
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
      rfid : ['00782B1A88C1'],
      title : 'Ceci n\'est pas une capsule !',
      scenarioMediaPath : 'capsule/',
      steps : [
      {
        stepId : 'step-1',
        title : 'Contexte',
        template : 'content',
        medias : ['C1.mp4'],
        transitions : 
          [
            { id : 'step-2', condition : 'endMedia', duration : 2000 }
          ]
      },

      {
        stepId : 'step-2',
        title : 'Contexte',
        template : 'content',
        text : 'Petit objet archéologique en métal trouvé dans le Rhône à Arles.' + 
               '<em>les lettres apparaissent comme si quelqu’un était en train d’écrire</em>',
        medias : ['capsule_mort_subite.png'],
        transitions : 
          [
            { id : 'step-3', condition : 'manualStep' }
          ]
      },

      {
        stepId : 'step-3',
        title : 'Description',
        template : 'content',
        text : 'Comment décrire cet objet ?',
        // medias : [ 'moule-charlotte.jpg', 'plat-a-tarte-verre.jpg', 'coquillage.jpg', 'roulette.jpg', 'capsule-biere-bouteille.jpg', 'plat-a-tarte.jpg'],
        transitions : 
          [
            { id : 'step-4', condition : 'manualStep' }
          ]
      },

      {
        stepId : 'step-4',
        title : 'Comparaison',
        template : 'matching-ihm',
        text : 'Boîte à outils > Bibliothèque',
        medias : [''],
        transitions : 
          [
            { id : 'step-5', condition : 'manualStep' }
          ]
      },

      {
        stepId : 'step-5',
        title : 'Bingo !',
        template : 'right',
        text : 'Objet métallique trouvé dans le Rhône à Arles; la typologie indique une forme circulaire et un décor de cannelures dentelées constants, pour une taille pouvant varier.',
        medias : [''],
        transitions : 
          [
            { id : 'step-6', condition : 'manualStep' }
          ]
      },

      {
        stepId : 'step-6',
        title : 'Usage',
        template : 'content',
        text : 'A quoi sert cet objet ?',
        choices : ['Archéologue', 'Laboratoire d\'analyses'],
        medias : [''],
        transitions : 
          [
            { id : 'step-7', condition : 'choice == "Archéologue"' },
            { id : 'step-8', condition : 'choice == "Laboratoire d\'analyses"' }
          ]
      },

      {
        stepId : 'step-7',
        title : 'Archéologue',
        template : 'content',
        medias : ['C2.mp4'],
        text : '<p>Certes un objet très courant mais on en retrouve de beaucoup plus grands uniquement dans des contextes culinaires avec parfois des traces d’usage (traces noires, de quoi s’agit-il ?).</p>' + 
               '\n<p>Quel est le rapport entre ces tout petits objets et des objets plus grands qu’on ne retrouve que dans des contextes culinaires ?</p>',
        transitions : 
          [
            { id : 'step-6', condition : '!histo("step-8")' },
            { id : 'step-9', condition : 'histo("step-8")' }
          ]
      },

      {
        stepId : 'step-8',
        title : 'Laboratoire d\'analyses',
        template : 'content',
        medias : [''],
        text : 'Datavisualisation de 2 graphiques, légende: « Traces chimiques identifiées » et indications portée sur chaque graphique « Alcool éthylique » (objet archéologique) et « Molécule de caramel » (sur le plat à tarte).',
        transitions : 
          [
            { id : 'step-6', condition : '!histo("step-7")' },
            { id : 'step-9', condition : 'histo("step-7")' }
          ]
      },

      {
        stepId : 'step-9',
        title : 'Bingo !',
        template : 'content',
        text : 'Objet métallique dont la typologie indique une forme circulaire et un décor de cannelures dentelées constants, pour une taille pouvant varier. Les archéologues en retrouvent fréquemment en contexte de dépotoir (cas du Rhône à Arles) ou domestique. ',
        medias : [''],
        transitions : 
          [
            { id : 'step-10', condition : 'manualStep' }
          ]
      },

      {
        stepId : 'step-10',
        title : 'Bingo !',
        template : 'content',
        text : '<strong>Plat</strong> métallique dont la typologie indique une forme circulaire et un décor de cannelures dentelées constants, pour une taille pouvant varier. Les archéologues en retrouvent fréquemment en contexte de dépotoir (cas du Rhône à Arles) ou domestique. Il permettait peut-être de présenter de petits aliments crus ou déjà cuits.',
        medias : ['globi.png', 'globi2.png', 'dulcia-domestica.png'],
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
      rfid : ['00782B1A80C9'],
      title : 'Un objet bien singulier...',
      scenarioMediaPath : 'amphorisque/',
      steps : [
      {
        stepId : 'step-1',
        title : 'Contexte',
        template : 'content',
        medias : ['B1.mp4'],
        transitions : 
          [
            { id : 'step-2', condition : 'endMedia', duration : '2000' }
          ]
      },

      {
        stepId : 'step-2',
        title : 'contexte',
        template : 'content',
        medias : ['dessin-archéo.png'],
        text : 'Objet archéologique antique trouvé dans le Rhône et portant une inscription peinte',
        transitions : 
          [
            { id : 'step-3', condition : 'manualStep' }
          ]
      },

        {
        stepId : 'step-3',
        title : 'Description',
        template : 'content',
        text : 'Comment décrire cet objet ?',
       transitions : 
          [
            { id : 'step-4', condition : 'manualStep' }
          ]
      },

      {
        stepId : 'step-4',
        title : 'Bingo !',
        template : 'right',
        text : 'Amphorisque antique en céramique trouvée dans le Rhône et portant une inscription peinte.',
        //medias : ['dessin-amphorisque-complete.png'],
        //background : 'dessin-amphorisque-complete.png',
        transitions : 
          [
            { id : 'step-5', condition : 'manualStep' }
          ]
      },

        {
        stepId : 'step-5',
        title : 'Usage',
        template : 'content',
        text : 'A quoi sert cet objet ?',
        medias : ['lampe-a-huile.jpg', 'hypothèse-bouchon-amphore.png', 'échantillon-commercial.jpg', 'dés-et-cornet.jpg', 'decapsuleur.jpg' ],
       transitions : 
          [
            { id : 'step-5bis', condition : 'manualStep' }
          ]
      },

        {
        stepId : 'step-5bis',
        title : 'Usage',
        template : 'content',
        text : 'A quoi sert cet objet ?',
        medias : ['B2.m4v'],
       transitions : 
          [
            { id : 'step-6', condition : 'endMedia', duration : '2000' }
          ]
      },

        {
        stepId : 'step-6',
        title : 'Usage',
        template : 'memory',
        text : 'A quoi sert cet objet ?',
        choices : [
                    { text : "Lampe à huile", img : 'lampe-a-huile.jpg' },
                    { text : "Bouchon d'amphore", img : 'hypothèse-bouchon-amphore.png' },
                    { text : "Échantillon commercial", img : 'échantillon-commercial.jpg' },
                    { text : "Cornet à dés", img : 'dés-et-cornet.jpg' },
                    { text : "Décapsuleur d'amphore", img : 'decapsuleur.jpg' }
                  ],
       transitions : 
          [
            { id : 'step-7', condition : 'manualStep' }
          ]
      },

      {
        stepId : 'step-7',
        title : 'Usage',
        template : 'content',
        text : 'A quoi sert cet objet ?\n' + 
               '<p>Aucune de ces hypothèse ne semble vraisemblable...</p>',
        choices : ['Archéologue', 'Bibliothèque'],
        medias : [''],
        transitions : 
          [
            { id : 'step-8', condition : 'choice == "Archéologue"' },
            { id : 'step-9', condition : 'choice == "Bibliothèque"' }
          ]
      },

      {
        stepId : 'step-8',
        title : 'Boîte à outils > Archéologue',
        template : 'content',
        medias : ['B3.mp4'],
        text : 'des analyses ont été effectuées : présence de décoctions de plantes et d\'excréments.',
        transitions : 
          [
            { id : 'step-8bis', condition : 'manualStep' }
          ]
      },

      {
        stepId : 'step-8bis',
        title : 'Bingo !',
        template : 'right',
        medias : ['dessin-amphorisque-complete.png'],
        text : ' Amphorisque antique en céramique trouvée dans le Rhône et portant une inscription peinte, ayant contenu des ingrédients de la pharmacopée.',
        choices : '',
        transitions : 
          [
            { id : 'step-7', condition : '!histo("step-9")' },
            { id : 'step-10', condition : 'histo("step-9")' }
          ]
      },

      {
        stepId : 'step-9',
        title : 'Boîte à outil > Bibliothèque',
        template : 'content',
        medias : ['abecedaire_source_richard_sylvestre_universite_lausanne.jpg'],
        text : '<p> ISOCHRYSO AB HERMEROT(I)S </p><p> ASYNTROPHO(N) </p>',
        transitions : 
          [
            { id : 'step-10', condition : 'manualStep' }
          ]
      },

      {
        stepId : 'step-10',
        title : 'Boite à outil > Archéologue',
        template : 'content',
        medias : ['B4.mp4'],
        text : 'Monsieur l\'archéologue, pourriez-vous nous aider à traduire les inscriptions ?',
        choices : '',
        transitions : 
          [
            { id : 'step-11', condition : 'manualStep' }
          ]
      },

      {
        stepId : 'step-11',
        title : 'Boite à outil > Archéologue',
        template : 'content',
        medias : ['B5.mp4'],
        text : 'La compréhension de l’inscription a permis de formuler une nouvelle hypothèse plus fiable, sachant qu\'il reste des questionnements non résolus',
        choices : '',
        transitions : 
          [
            { id : 'step-7', condition : '!histo("step-8")' },
            { id : 'step-11', condition : 'histo("step-8")' }
          ]
      },

      {
        stepId : 'step-12',
        title : 'Bingo !',
        template : 'right',
        medias : [''],
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