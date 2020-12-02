# encoding: UTF-8
begin

  path    = Ajax.param(:path)
  folder  = Ajax.param(:folder)
  path    = File.join(folder,path) unless folder.nil?

  File.exists?(path) || raise("Le path '#{path}' est introuvable. Impossible de l'ouvrir.")

  `open -a Finder "#{path}"`

  Ajax << {message: "Le path « #{path} » a été ouvert dans le Finder."}

rescue Exception => e
  Ajax.error(e)
end
