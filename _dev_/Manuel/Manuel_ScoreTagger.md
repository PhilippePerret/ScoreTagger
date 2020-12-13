# ScoreTagger<br>Manuel développeur



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



#### Éléments d’un système

Pour placer les éléments (les « objets d'analyse ») sur la table d’analyse, on se sert de trois lignes supérieures et trois lignes inférieures.

~~~bash

–––––––––––––
						|				Segment supérieur			ligne_segment
 –––
| G                 Modulation						ligne_modulation

C     G							Accord								ligne_chord

-------------|
-------------|
-------------|
-------------|
-------------|

I    V							Harmonie							ligne_harmony

___|CP							Cadence								ligne_cadence

	|_________|				Pédale / Seg. inf.		ligne_pedale
						
~~~



Les lignes supérieures (au-dessus de portée) se comptent à partir du `top` de la portée (i.e. du système), les lignes inférieures se comptent à partir du `bottom` du système.

Ces valeurs sont définies dans `Score.current.preferences.lignes.<nom ligne>` et sont toujours positives, par rapport au bord relatif. Par exemple, pour obtenir la position d’un objet sur la ligne de modulation, on fait :

~~~ruby
h = <system>.top - Score.current.preferences.lignes.ligne_modulation
~~~





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



---

## Lecture de l'analyse

L’analyse peut être lue, c’est-à-dire afficher les éléments d’analyse ([objets d’analyse][]) au fur et à mesure, à un certain rythme ou en répondant à l’appui sur une touche.

Le principe de lecture est le suivant : on lit les objets de gauche à droite et de haut en bas. C’est-à-dire qu’un accord sera lu avant une harmonie s’ils sont placés sur la même « verticale ».

Avant la lecture, on passe donc en revue les objets de chaque système pour les classer selon ces aspects.

La classe qui s’occupe de la lecture est la classe `Analyse` et particulièrement la méthode `play`. C’est l’instance `Score.analyse` qui permet d’obtenir une instance de la classe `Analyse`. Donc le bouton qui lance la lecture de l’analyse appelle `Score.current.analyse.play()`.



## Annexe

---



## Détails de l'implémentation

#### AOBJETS_TOOLBOX_BUTTONS

`AOBJETS_TOOLBOX_BUTTONS` est une constante qui définit tous les boutons de la boite d’outils qui permet de définir un [objet d'analyse][] ainsi que leur comportement.

Les **clés** de cette constante (donc chaque élément racine) se rapportent à un **groupe de boutons**. Les groupes de boutons sont par exemple les altérations ou les chiffrages d’harmonie.

Ces clés définissent les « objets-type » (`otype`).

Le premier élément, de clé `otype` est un peu différent puisqu’il définit tous les `otype`s et leur comportement. Nous y reviendrons.

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

**Particularité du premier élément**

La définition des boutons (donc de la propriété `items`) du premier élément, de clé `otype`, est plus complexe. Elle possède en plus des autres la propriété `visible` qui va définir l’interface propre pour chaque type d’objet (accord, harmonie, segment, etc.).

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



[partition préparée]: #preparedscore
[objets d’analyse]: #objetsanalyse
[objet d’analyse]: #objetsanalyse