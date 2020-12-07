# encoding: UTF-8
# frozen_string_literal: true
=begin
  Classe SafeFile
  ---------------
  Pour faire des sauvegardes sûres, c'est-à-dire avec des backups

  On doit instancier avec le path du fichier original, puis appeler la
  méthode 'backup'

    sfile = SafeFile.new(path/to/file)
    sfile.backup

    ou, plus simplement

    SafeFile.new(path/to/file).backup

=end
class SafeFile
class << self
  def backup_folder
    @backup_folder ||= File.join(APP_FOLDER,'_score_','backups')
  end
end # /<< self
def initialize path
  @path = path
end #/ initialize

def backup
  FileUtils.mkdir_p(backup_folder)
  FileUtils.copy(path, backup_path)
  epure
end #/ save

# Méthode qui s'assure de garder des copies de plus de 7 jours et/ou
# au moins 10 copies
def epure
  ilya7jours = Time.now - 7.days
  copies = Dir["#{backup_folder}/*#{extname}"]
  return if copies.count < 10
  # On passe ici s'il y a plus de 10 copies, pour supprimer toutes celles
  # qui datent de plus de 7 jours, en en gardant toujours au moins 10
  copies = copies.sort
  copies[10..-1].each do |pth|
    puts "Étude de #{pth}"
    next if File.stat(pth).mtime > ilya7jours
    File.delete(pth)
  end
end

def backup_folder
  @backup_folder ||= File.join(self.class.backup_folder, affixe)
end

def backup_path
  @backup_path ||= File.join(backup_folder, "#{Time.now.to_i}#{extname}")
end
def affixe
  @affixe ||= File.basename(path, extname)
end
def extname
  @extname ||= File.extname(path)
end
end #/SafeFile
