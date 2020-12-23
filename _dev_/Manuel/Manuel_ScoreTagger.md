# ScoreTagger<br>Manuel développeur



## Fonctionnement par « segments de programme »

Cette application tente une approche différente dans sa programmation qui s’intitule **Programmation par segment de programme**. Elle consiste à définir clairement les « segments de programme » qui constituent l’application et à y rassembler toutes les opérations, quels que soient les objets qu’ils utilisent, pour un meilleur contrôle de ce qui se passe.

Pour le moment, c’est le fichier `__operations__.js` qui définit ces segments de programme.

On commence par y définir le démarrage de l’application (jusqu’à la fin de la préparation de l’interface pour l’utilisateur) dans une unique méthode/fonction appelé `demarrerApplication()` :

~~~javascript
function demarrerApplication(){
  //...
}
~~~

… et qu’à l’intérieur on définisse très exactement la suite des opérations qui devront être exécutées séquentiellement :

~~~javascript
function demarrerApplication(){
  UI.prepare()
  Onglet.choisir()
  Score.affiche()
  //...
}
~~~

Pour ne pas être bloqué par l’asynchronicité, on utiliserait toujours, par défaut, des promesses. Donc on aurait :

~~~javascript
function async demarrerApplication(){
  await UI.prepare()
  await Onglet.choisir()
  await Score.affiche()
}
~~~

… ou alors on partirait du principe qu’une méthode précédente peut toujours envoyer des données à la méthode suivante et donc :

~~~javascript
function demarrerApplication(){
  UI.prepare()
  .then(Onglet.choisir.bind(Onglet))
  .then(Score.afficher.bind(Score))
  .catch(onError)
}
~~~

… avec la possibilité d’avoir par exemple :

~~~javascript
class UI {
  static prepare(){
    return new Promise((ok,ko) => {
      //... exécution du code
      ok({<data à retourner à Onglet.choisir>})
    })
  }
}
~~~





## Synopsis



### Synopsis d’affichage de l'analyse



~~~flow
st=>start: Démarrage
op=>operation: Click sur l'onglet "Analyse":>#onglet_analyse
sub1=>subroutine: PanneauAnalyse#onActivate
condPrepared=>condition: Panneau préparé ?
subPrepa=>operation: Préparation du panneau:>#preparation_panneau_analyse  
affichage=>inputoutput: Affichage de l'analyse:>#affichage_analyse
condScorePrepared=>condition: Partition préparée ?
drawParition=>operation: Dessin de la partition:>#dessin_partition
condAutosave=>condition: Autosave?
startAutosave=>operation: Mise en route de
la sauvegarde
automatique
e=>end: Attente utilisateur

st->op->sub1->condPrepared
condPrepared(no, left)->subPrepa->condScorePrepared
condPrepared(yes)->condScorePrepared
condScorePrepared(yes)->condAutosave
condScorePrepared(no, left)->drawParition->condAutosave
condAutosave(no)->affichage
condAutosave(yes)->startAutosave->affichage
affichage->e
~~~

<a id="preparation_panneau_analyse"></a>

### Préparation du panneau d'analyse

~~~flow
go=>start: Préparation du panneau
prepare=>subroutine: PanneauAnalyse#prepare
inittoolbox=>subroutine: AObjectToolbox::init()
(initialisation de la boite d'outils)
observation=>subroutine: PanneauAnalyse#observe
(observation du panneau)
e=>end: Le panneau est préparé

go->prepare->inittoolbox->observation->e
~~~

<a id="dessin_partition"></a>

### Dessin de la partition


~~~flow
l10n process!
go=>start: Dessin de
la partition
e=>end: La partition
est dessinée
reset=>operation: Réinitialisation
resetall=>subroutine: TableAnalyse#resetAll
(Réinitialisation complète)
- Nettoie le container des systèmes
- Initialise les variables courantes
drawfirstpage=>inputoutput: Dessin first page
subfirstpage=>subroutine: TableAnalyse#drawFirstPage
- Écriture des titres, compositeur, etc.
- Positionnement des titres, compositeur, etc.
score=>inputoutput: Dessin du score complet:>#dessin_score_complet
drawscore=>subroutine: Score.draw()
subpagelines=>subroutine: TableAnalyse#drawPageDelimitors
pagelines=>inputoutput: Délimiteurs de pages
condTonal=>condition: Aperçu tonal ?
(préférences)
drawApercuTonal=>inputoutput: Aperçu tonal

go->resetall
resetall->reset->subfirstpage->drawfirstpage
drawfirstpage->drawscore->score->subpagelines->pagelines
pagelines->condTonal
condTonal(yes)->drawApercuTonal->e
condTonal(no)->e
~~~

<a id="dessin_score_complet"></a>

### Dessin du score complet

C'est la méthode `Score#draw` qui s'occupe du dessin du score complet.

~~~flow
l10n process!
go=>start: Dessin complet du score
drawmeth=>subroutine: Score#draw()
condSystPrepared(align-next=no)=>condition: Les systèmes
sont-ils
préparés
opSystPrepared=>operation: Chargement des systèmes préparés
opSysNotPrepared=>operation: Chargement des systèmes non préparés
subPoseSyst=>subroutine: Score#instanciateAndPoseAllSystems()
poseSyst=>inputoutput: - Instanciation des systèmes
- Pose des systèmes dans le container
attenteImages=>operation: Attente du chargement
des images
condImageLoaded=>condition: Images chargées ?
subPositionne=>subroutine: Score#positionneAndDrawSystems()
posNdrawSyst=>inputoutput: - Positionnement des systèmes
- Objets d'analyse sur les systèmes
subfindraw=>subroutine: Score#finDrawing()
endDrawing=>inputoutput: Fin du dessin
- Pose des numéros de mesure
- Marquer la partition dessinée
calculPositions=>subroutine: Score#calcPositionAllSystems()
(calcul des positions de tous les systèmes)
en=>end: Score affiché

go->drawmeth->condSystPrepared
condSystPrepared(yes)->opSystPrepared->subPoseSyst
condSystPrepared(no)->opSysNotPrepared->subPoseSyst
subPoseSyst->poseSyst->attenteImages->condImageLoaded
condImageLoaded(yes)->subPositionne
condImageLoaded(no)->attenteImages
subPositionne->condSystPrepared
condSystPrepared(no)->calculPositions->posNdrawSyst
condSystPrepared(yes)->posNdrawSyst
posNdrawSyst->subfindraw->endDrawing->en
~~~



<a id="affichage_analyse"></a>

### Affichage de l'analyse



---



## Hiérarchie des éléments de programmation

~~~tex

Score							La partition, dans son entier
		|
		|__ Preferences		L'aspect des éléments, le comportement de
		|									l'application, etc.
		|
		|__ Analyse			Gère l'animation, par exemple.
	⇩
ASystem						Un système, donc une portée horizontale
	⇩
AObject						Un objet d'analyse, par exemple un accord, une
									modulation, un texte, un segment, etc.
~~~



## Constitution du dossier de l'analyse

> Il s’agit donc du dossier, dans le dossier `_score_`, qui contient tous les éléments d’une analyse.

~~~bash

<dossier analyse>
	|-- systems
	|				|-- images		(dossier contenant les images)
	|				|-- data			(dossier contenant les données)
	|-- score
	|			|-- data.yml		(données générales de la partition)
	|			|-- prefs.yml		(préférences)
	|			|-- images			(dossier des images du score original)
	|						|-- pages	(dossier des pages du score original en jpg)
~~~



## Positionnement des systèmes

Chaque système est enregistré dans un fichier image unique dans le dossier `images` de l’analyse.

La difficulté consiste à les positionner correctement sur la page pour qu’ils ne se retrouvent pas entre deux pages lors de l’impression/sortie PDF de la partition complète.

Quelle que soit la longueur de la partition, son analyse est présentée intégralement sur la table d’analyse et produira un unique fichier sans assemblage nécessaire.

#### Positionnement dynamique

On utilise un « positionnement dynamique » des systèmes c’est-à-dire qu’il tient compte des éléments qu’on trouve sur la partition. Puisque tous les objets sont « accrochés » au système, il est très simple de déplacer et d’ajuster ces systèmes. Donc, au départ, on laisse juste la place d’écrire l’harmonie et les accords, puis ensuite, en ajoutant les modulations, les cadences, etc. les systèmes ajustent leur position en prenant garde de ne pas se retrouver entre deux pages.

C’est la méthode `ASystem.repositionneAll()` qui s'occupe de se travail.

C'est la méthode `ASystem#addObjet` (utilisée aussi bien au chargement qu'à la création de l'objet) qui :

1. consigne la ligne la plus haute et la plus basse,
2. demande le recalcul de la position du système (des systèmes) s'il y a changement des valeurs.

#### Les lignes de référence

Un système complet, pour son positionnement, utilise **5 lignes de références** :

~~~
topLine						C'est la ligne de "départ" du système, sous laquelle se trouve
									l'objet le plus haut du système.
topSystemLine			C'est la ligne qui correspond au top du système, au bord haut
									du système proprement dit.
bottomSystemLine	C'est la ligne qui correspond au bas du système. C'est à partir
									de cette ligne que sont placés les objets sous-système.
bottomLine				C'est la ligne sous laquelle se trouve l'objet le plus bas du
									système.
realBottomLine		C'est la ligne la plus inférieure, SOUS l'objet le plus bas du
									système.
~~~



#### Éléments d’un système

Pour placer les éléments (les « objets d'analyse ») sur la table d’analyse, on se sert de trois lignes supérieures et trois lignes inférieures.

~~~bash

–––––––––––––
						|				Segment supérieur			ligne_segment
 –––
| G                 Modulation						ligne_modulation

C     G							Accord								ligne_chord

-------------|			------------ `top` du système
-------------|
-------------|
-------------|
-------------|

I    V							Harmonie							ligne_harmony

___|CP							Cadence								ligne_cadence

1----------					Pédale	 							ligne_pedale

|_________|					Ligne segment inf.		ligne_segment_down

--------------------- `rBottom` du système

~~~



Les lignes supérieures (au-dessus de portée) se comptent à partir du `top` de la portée (i.e. du système), les lignes inférieures se comptent à partir du `bottom` du système.

Ces valeurs sont définies dans `Score.current.preferences.lignes.<nom ligne>` et sont toujours positives, par rapport au bord relatif. Par exemple, pour obtenir la position d’un objet sur la ligne de modulation, on fait :

~~~ruby
h = <system>.top - Score.current.preferences.lignes.ligne_modulation
~~~



---

## Onglets

<a id="onglet_home"></a>

### Onglet Home

Onglet principal pour définir la partition étudiée.


<a id="onglet_analyse"></a>

### Onglet analyse

Comme son nom l'indique, il permet de procéder à l'analyse de la partition définie dans l'[onglet Home][]

---



## Fonctionnements

#### Enregistrement des données

Les données de chaque système sont enregistrées dans des fichiers séparés, au format `YAML` dans le dossier `data`.

### Découpage de la partition originale

* On procède au découpage de la partition originale en systèmes, de façon manuelle, grâce à la section « découpe » de l’application. Cette découpe s’appuie sur des « lignes de coupe » (crop lines) définies dans l’onglet « Découpe ». On peut procéder à cette découpe avec une partition entière ou par pages.
* Les systèmes sont alors répartis en pages qui font toute la taille normale de 21 cm par 29,7 cm. De cette manière, les fichiers PDF peuvent être consultés et imprimés convenablement.



#### Placement des objets d'analyse

Pour placer un objet d’analyse, on clique sur un système. Cet objet d’analyse est toujours associé au système pour lequel il a été créé.

## Mise en place des « objets d'analyse »

Les « objets d'analyse », ce sont les chiffrages d’accord, les harmonies, les cadences, les pédales, etc., tous les éléments qui tagguent la partition pour l’analyser.

Des hauteurs fixent sont définies pour chaque élément en fonction de son type afin de :

* garder une grande cohérence d’aspect sur toute la partition et toutes les partitions.
* accélérer le processus d’analyse (ne pas avoir à se soucier de la mise en page)

Les hauteurs sont définies en fonction des « lignes médianes » de chaque système, calculées lors du découpage et enregistrées dans la donnée de l’analyse (sous la propriété `systems_data`).

Un objet d’analyse, en fonction de son `top` appartient donc forcément à un système particulier.

Pour l’enregistrement, c’est sa position relative à cette ligne médiane du système qui est enregistrée. Grâce à son index de système (propriété `system`) et son décalage par rapport au système (`offset`, qui est nul si l’objet est placé à l’endroit par défaut en fonction de son type), l’objet peut être replacé chaque fois, même lorsque le système bouge.

## Enregistrement des données

Un fichier de données d’analyse est un fichier `YAML` qui contient une propriété `pages` définissant chaque page de la partition complète, entendu qu’une analyse est composée de plusieurs partitions (pour ne pas avoir à gérer un unique fichier image énorme au cours de l’analyse).

Principe : on garde tous les systèmes séparés dans un dossier. Une page mémorise ces systèmes avec leur position par défaut. On peut modifier cette position par défaut ce qui permet d’afficher la présentation générale de la partition à tout moment.

La classe javascript et ruby `System`   permet de gérer les systèmes.

### Enregistrement des objets d'analyse

Les objet d’analyse sont enregistrés par système. Un fichier par système, enregistré dans le dossier `systems/data` de la partition.

L’enregistrement est automatique.

Mais pour ne pas tourner en boucle indéfiniment lorsque rien ne se passe, on pourrait imaginer un processus qui arrête la boucle d’enregistrement en cas d’inaction. Par exemple en enregistrant chaque fois la date de la dernière action (du dernier modified, même après sauvegarde). Si ce dernier modified est trop loin, on arrête. Et on relance à la première action.



### Requête Ajax

À toute requête ajax on ajoute automatiquement (dans `ajax.js`) la propriété `current_analyse` qui définit le dossier de l’analyse dans `_score_`.

Noter que dans la nouvelle version de la classe `Ajax` les retours avec erreur sont traités, inutile de faire `if (ret.error) ...`.



## Analyse de la partition

La [partition préparée][]  est affichée de façon intégrale sur la table d’analyse.



### Affichage de la partition (zoom)

À présent on peut définir le zoom de la partition sur la page. Cela entraine des difficultés au niveau des valeurs à enregistrer et à utiliser sur la table. On se sert principalement des méthodes `TableAnalyse.byScaleFactor` et `TableAnalyse.toScaleFactor` pour gérer ces valeurs.



### Boite d’outils des objets d’analyse (`AObjectToolbox`)

La boite d’outils se trouve sur le panneau de l’analyse et permet de définir les [objets d’analyse][].

Cette boite permet aussi bien de créer un nouvel [objet d'analyse][] que de l’éditer pour le modifier.

Elle fonctionne avec trois niveaux d’abstraction :

~~~
La boite 									instance 	{AObjectToolbox (= AOTB)}
Les groupes de boutons 		instances {ButtonsGroupAOTB}
Les boutons eux-mêmes			instance 	{ButtonAOTB}
~~~



Un type de bouton (`otype`), par exemple 'chord', définit les groupes de bouton qui lui sont propres. Par exemple, pour le type « chord », on n’a pas besoin des boutons d’harmonie (« I », « II », « V », etc.) ni des boutons de segments ou de degré. On a juste besoin des notes en capitales (`note`), des altérations (`alteration`) et des natures (`nature`) pour « mineur », « majeur », « mineur 7tième », etc.

Une **confusion est déjà possible** entre d’un côté les `otype`, qui peuvent être compris comme les boutons principaux de la boite d’outils, comme donc le type de l’[objet d'analyse][] à créer ou éditer et de l’autre côté les types de groupe de bouton. Pour tenter de les distinguer, deux constantes distinctes ont été créées :

~~~
AOBJETS_TOOLBOX_OTYPE_BUTTONS				
		Constantes qui définit les otype(s) possible d'un objet d'analyse et donc les
		boutons principaux de la boite d'outils.

AOBJETS_TOOLBOX_BUTTONS_GROUPS					
		Constantes qui définit les types de groupes de boutons se trouvant sous les
		boutons principaux.
~~~



L’instance des boutons principaux (otype) peut s’obtenir et se manipuler par :

~~~javascript
AObjectToolbox.OTypeButtons // => instance OTypeButtonsGroupAOTB
														//    (extension de ButtonsGroupAOTB)
~~~

Par exemple, pour sélectionner un de ses boutons on peut faire :

~~~javascript
AObjectToolbox.OTypeButtons.select("accord") // => sélectionne 1er bouton
~~~



#### Réflexion sur la boite à outils

~~~


Groupe des boutons principaux					Hérite de BGroup_AOTB pour construire les boutons,
																			gérer leur état.
																			Class : MainButtons_AOTB extends BGroup_AOTB
~~~





## Production des images

Toutes les images peuvent être produites avec le deux fichiers Gimp du dossier `chantier/imagerie`. Le principe est de produire le PNG avec ce fichier puis, pour certains images, de les raboter horizontalement dans Aperçu pour qu’elles n’aient pas de blanc à droite et à gauche. C’est le cas par exemple des marques d’harmonie `7` ou septième diminuée, etc.

Les altérations, pour le moment, sont travaillées dans un autre fichier Gimp, mais puisqu’on rabote de cette façon, il serait possible de les produire de le même et unique fichier.



---

## Lecture de l'analyse

L’analyse peut être lue, c’est-à-dire afficher les éléments d’analyse ([objets d’analyse][]) au fur et à mesure, à un certain rythme ou en répondant à l’appui sur une touche.

Le principe de lecture est le suivant : on lit les objets de gauche à droite et de haut en bas. C’est-à-dire qu’un accord sera lu avant une harmonie s’ils sont placés sur la même « verticale ».

Avant la lecture, on passe donc en revue les objets de chaque système pour les classer selon ces aspects.

La classe qui s’occupe de la lecture est la classe `Analyse` et particulièrement la méthode `play`. C’est l’instance `Score.analyse` qui permet d’obtenir une instance de la classe `Analyse`. Donc le bouton qui lance la lecture de l’analyse appelle `Score.current.analyse.play()`.



## Annexe

---



## Détails de l'implémentation

#### BOITE D'OUTILS DES OBJETS D'ANALYSE

La « boite d’outils des [objets d'analyse][] » est un container qui contient tous les boutons permettant de définir et modifier les objets d’analyse placés sur la partition. Cette boite est « intelligente » dans le sens où elle se règle entièrement en fonctionnement des choix. L’utillisateur peut désactiver ce comportement par les préférences.

Deux constantes tables permettent de construire cette boite d’outils :

~~~
AOBJETS_TOOLBOX_OTYPE_BUTTONS
		Table qui définit les données des boutons principaux qui permettent de
		choisir le type (otype) d'objet d'analyse à créer (accord, modulation,
		etc.)

AOBJETS_TOOLBOX_BUTTONS_GROUPS
		Table qui définit les données des « groupes de boutons » qui permettent
		de définir précisément les paramètres d'un objet d'analyse. On trouve
		par exemple le groupe 'alteration' qui permet d'altérer un accord ou une
		note, le groupe 'segment' qui permet de choisir un type de segement, etc.
~~~

Ces deux constantes sont structurées de la même façon afin de permettre une construction identique des boutons.

Les boutons et groupes de boutons sont construits et gérés grâce à quatre (5 en fait) classes :

~~~
AObjectToolbox (classe)
		C'est la boite d'outils elle-même. Son 'obj' est le container des boutons.

MainButtonsAOTB (classe, extention de BGroupAOTB)
		Classe qui gère les boutons principaux. Chaque instance est un otype par-
		ticulier, pour les accords ('chord'), les harmonies ('harmony'), les
		modulations ('modulation') etc.
		Quand on active un bouton principal, la méthode d'instance 'activate' est
		invoqué, le bouton se sélectionne et la méthode appelle l'instance
		MainGButtonAOTB liée au bouton pressé pour configurer la boite à outils
		en fonction du bouton (afficher/masquer les groupes de boutons utiles,
		afficher/masquer les boutons utiles de chaque groupe, sélectionner les
		boutons par défaut).

BGroupAOTB
		Classe qui gère chaque groupe de boutons (même les boutons principaux, qui
		on leur propre classe inférieure). Quand on active le bouton d'un groupe de
		bouton, la méthode d'instance 'activate' est invoquée et les paramètres du
		bouton (à créer ou édité) changent.

MainGButtonAOTB
		Classe attachée à chaque bouton principal qui permet de configurer la boite
		à outil en fonction du otype du bouton principal.
~~~

**Constitution des deux constantes de données**

Chaque `otype` (chaque « type d'objet »), donc chaque élément racine de cette constante définit :

~~~javascript
id:				Son identifiant, qui reprend la clé
order:		L’ordre dans lequel doivent être affichés les boutons
selected:	Le bouton sélectionné par défaut (on verra qu’il peut être surclassé
          par une autre définition)
items:		La table (Object) des boutons eux-mêmes.
					Chaque élément est un Object (une table) qui définit :
					buttonKey: {id: buttonKey, text: "le texte si texte", img:"path/to/image"}
					Note : ci-dessus, on doit utiliser SOIT :text SOIT :img, mais pas
          les deux.
~~~

**Constitution des `items` de AOBJETS_TOOLBOX_OTYPE_BUTTONS**

La définition des boutons (donc de la propriété `items`) est plus complexe que dans `AOBJETS_TOOLBOX_BUTTONS_GROUPS`. Elle possède en plus des autres la propriété `visible` qui va définir l’interface propre pour chaque type d’objet (accord, harmonie, segment, etc.).

À la base, `:visible` peut être une liste (Array) de « clé de type » (c’est-à-dire les clés racine de la constante, à savoir `note`, `chord`, `alteration`, etc.). La donnée :

~~~javascript
visible: ['note','alteration','nature']
~~~

… signifie qu’il faut afficher le groupe de boutons des notes (clé `note`), le groupe de boutons des altérations (clé `alteration`) et le groupe de boutons des *natures* (clé `nature`). Tous les autres groupes de boutons (harmonies, segment, etc.) seront masqués.

Mais on peut définir les choses encore plus précisément en indiquant les seuls boutons qui doivent être accessible dans chaque groupe. La clé `String` de la liste de la propriété `:visible` devient alors une liste Array qui contient en premier élément la clé du type et en deuxième élément la liste Array des identifiants de boutons qu’il faut afficher. Les autres seront masqués.

Par exemple, avec :

~~~javascript
visible: ['note',   ['alteration',['n','b','d']],   'nature']
~~~

… seules les boutons d’altération `n` (bécarre ou aucune), `b` (bémol) et `d` (dièse) seront visibles/accessibles. Les boutons double bémol et double dièse seront masqués.

> Noter que l’ordre de définition dans la liste des identifiants est indifférent, cela ne classera pas les boutons dans cet ordre.

Enfin, on peut définir le bouton qui doit être sélectionné lorsque l’on choisit le type d’objet définissant cette propriété `:visible` en indiquant son `id` en troisième élément de la liste. Ainsi, avec :

~~~javascript
visible: ['note',   ['alteration',['n','b','d'], 'b'],   'nature']
~~~

… on demande de sélectionner le bouton « bémol », quelle que soit la valeur de la propriété `selected` du groupe des altérations.

Si on doit garder tous les boutons et définir celui qui doit être sélectionné (si ce n’est pas celui par défaut), alors on met le deuxième élément à `null` :

~~~javascript
visible: ['note',   ['alteration', null, 'b'],   'nature']
~~~



### Création d’un nouveau type d’objet d'analyse

Pour créer un nouveau type d’[objet d’analyse][], il faut :

* ajouter le type dans les `items` de `AOBJETS_TOOLBOX_OTYPE_BUTTONS` (fichier `js/AObjets_constants`),
* définir le type dans `AOBJETS_TOOLBOX_BUTTONS_GROUPS` (fichier `js/AObjets_constants`),
* créer son formateur dans le dossier `js/ObjectFormatters/` avec pour nom de classe `<Type capitalisé>Formatter` (et définir ses méthodes propres en s’inspirant des autres formateurs,
* instancier ce formateur dans la méthode `AObjectToolbox::initFormatters`,
* That’s it!

---



#### Scale Factor

Le « Scale Factor »  — propriété `ScaleFactor` du panneau d’analyse (`TableAnalyse.ScaleFactor`) — correspond au facteur avec lequel il faut diviser les positions (clics de souris sur la table par exemple pour obtenir la valeur réelle en fonction du zoom de la partition. Par exemple, si la partition est zoomée de 150%, ce "scale factor" sera de 1.5.

La méthode `TableAnalyse.byScaleFactor(value)` permet d’obtenir la valeur correspondante. La méthode `TableAnalyse.toScaleFactor(value)` permet d’obtenir la valeur pour placer ou dimensionner l’objet.

~~~javascript
// Si la table est zoomée de 150% (le ScaleFactor est de 1.5)

TableAnalyse.byScaleFactor(150 /* p.e. offsetX du clic de souris */)
// => renvoie 100

TableAnalyse.toScaleFactor(100 /* p.e. position x enregistrée */)
// => renvoie 150
~~~

> Note : on n’utilise pas la propriété `zoom` pour fixer toutes les tailles et les positions simplement à cause d’un truc : `jquery.draggable` ne suit pas, donc on se retrouve avec des déplacements bizarres (sujets au zoom). La solution pourrait être de faire sa propre méthode de déplacement…



---



### Lexique



<a id="objetanalyse"></a>

#### Objet d'analyse

C’est un terme générique qui désigne tous les « objets » qu’on place sur la table d’analyse pour analyser la partition, à savoir les accords, les harmonies, cadences et autres délimitations de segment.

<a id="preparedscore"></a>

#### Partition préparée

Ce qu’on appelle « partition préparée » ici, c’est la partition où les systèmes ont été découpés et répartis (écartés) de telle sorte qu’on puisse placer facilement les [objets d'analyse][].

<a id="lignecoupe"></a>

#### Ligne de coupe

Les « lignes de coupe » sont les lignes que l’on dessine pour découper la partition originale en système, afin de les écarter pour pouvoir analyser plus facilement la partition.

<a id="lignepose"></a>

#### Ligne de pose

Pour faciliter la gestion de l’aspect de l’analyse, des *lignes de pose* permettent de poser chaque type d’[objet d’analyse][]. Elles sont réparties au-dessus et en dessous de chaque système. On peut définir leur décalage haut ou bas avec le système sur la page d’accueil où sont définies les préférences, par simple glissement.



[partition préparée]: #preparedscore
[objets d’analyse]: #objetsanalyse
[objet d’analyse]: #objetsanalyse
[ligne de pose]: #lignepose

[onglet Home]: #onglet_home
[onglet Analyse]: #onglet_analyse

~~~

~~~