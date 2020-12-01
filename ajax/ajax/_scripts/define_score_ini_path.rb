# encoding: UTF-8
=begin

  Script qui sauve le code de l'analyse courante

=end
CODE_CONVERT_APPEND_PAGE = '/usr/local/bin/convert %{images} -append full_score_ini.jpg'

def assemble_pages_partition_of_folder(score_ini_path)
  images = Dir["#{score_ini_path}/*.jpg"].collect{|p|File.basename(p)}.sort
  code = CODE_CONVERT_APPEND_PAGE % {images: images.join(' ')}
  code = <<-BASH
cd "#{score_ini_path}"
#{code}

  BASH
  log("code :\n#{code}")
  res = `#{code}\n`
  log("Retour de code : #{res.inspect}")
  return File.join(score_ini_path,'full_score_ini.jpg')
end #/ assemble_pages_partition_of_folder

begin
  score_ini_path  = Ajax.param(:path)

  if File.exists?(score_ini_path)

    if File.directory?(score_ini_path)
      # Quand le path est celui d'un dossier, ce dossier doit contenir toutes
      # les feuilles des partitions qu'il faut assembler en une seule image
      # pour la découper ensuite
      # NON : on procède par page et on assemble tout à la fin
      Ajax << {error: "On ne peut pas encore fournir de dossier."}

    else

      score_ini_name = "score_ini#{File.extname(score_ini_path)}"

      # On enregistre ce path dans les données du score
      Score.set(score_ini_path: score_ini_path)

      dst = File.join(SCORE_FOLDER,score_ini_name)
      FileUtils.copy(score_ini_path, dst)
      Ajax << {
        message: "Le chemin d'accès à la partition a été enregistré.",
        score_ini_name: score_ini_name
      }
    end
  else
    Ajax << {error: "La partition '#{score_ini_path}' est introuvable…"}
  end

rescue Exception => e
  Ajax.error(e)
end
