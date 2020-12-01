'use strict';
/**
  Utilitaires d'entrée sortie
**/
class IO {
  /**
    +path+    Le path complet ou relatif (si +folder+ est fourni)
    +folder+  Le dossier si +path+ est fourni en chemin relatif
  **/
  static openInFinder(path, folder){
    Ajax.send('system/open-in-finder.rb', {path:path, folder:folder})
    .then(onAjaxSuccess).catch(onError)
  }
}
