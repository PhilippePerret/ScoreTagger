# ScoreTagger<br>Manuel développeur



## Hiérarchie des éléments de programmation

~~~tex

Score							La partition, dans son entier
		|__ Preferences
		|__ Analyse
	⇩
ASystem						Un système, donc une portée horizontale
	⇩
AObject						Un objet d'analyse, par exemple un accord, une
									modulation, un texte, un segment, etc.
~~~



## Constitution du dossier de l'analyse

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