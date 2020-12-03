# ScoreTagger<br>Manuel développeur



## Fonctionnements

### Découpage de la partition originale

* On procède au découpage de la partition originale en systèmes, de façon manuelle, grâce à la section « découpe » de l’application.
* Les systèmes sont alors répartis en pages qui font toute la taille normale de 21 cm par 29,7 cm. De cette manière, les fichiers PDF peuvent être consultés et imprimés convenablement.



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



### Requête Ajax

À toute requête ajax on ajoute automatiquement (dans `ajax.js`) la propriété `current_analyse` qui définit le dossier de l’analyse dans `_score_`.