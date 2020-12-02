# encoding: UTF-8
# frozen_string_literal: true

=begin
convert score-1.jpg score-2.jpg  -append -splice 0x200+0+200 score_expanded.jpg
convert score_expanded.jpg score-3.jpg -append -splice 0x200+0+600 score_expanded-2.jpg

On ajoute tel écartement en pixels à telle hauteur en pixels

0x{ecartement}+0+{top}
=end


CODE_APPEND_FIRST_SYSTEM  = '/usr/local/bin/convert %{img1_name} -splice 0x%{gap}+0+0 score_expanded_odd.jpg'
CODE_APPEND_SYSTEM = '/usr/local/bin/convert %{img1_name} %{img2_name} -append -splice 0x%{gap}+0+%{top} score_expanded_%{odd}.jpg'


def add_system_mensurations(id, top, height)
  dsys = {top: top, height: height, id: id, page: PAGE}
  mdline = (top + height.to_f / 2).to_i
  dsys.merge!(median_line: mdline, objects:[], id: id)
  SYSTEMS_DATA.merge!( id => dsys)
end

def assemble_systems

  # Il faut fabriquer le code qui va assembler les systèmes en laissant
  # de l'intervalle entre eux. Le plus compliqué est de définir les espaces
  # à exprimer pour convert
  #

  code_assemblage = []

  # On doit commencer par ajouter de l'espace au-dessus du premier système
  code = CODE_APPEND_FIRST_SYSTEM % {img1_name: "system-#{PAGE}-000.jpg", gap: SYSTEMS_SEPARATOR}
  code = <<-BASH
cd "#{SCORE.factory_folder}"
#{code}

BASH
  `#{code}`

  current_top = SYSTEMS_SEPARATOR

  odd_or_even = 'even'

  current_height = CROP_LINES_DATA[0]['height']
  add_system_mensurations(1, current_top, current_height)
  (0...CROP_LINES_DATA.count).each do |idx|
    data_curline = CROP_LINES_DATA[idx]
    data_nexline = CROP_LINES_DATA[idx + 1]
    current_top += data_curline['height'] # la hauteur de l'image 1
    # On ajoute les mensurations du système courant (next)
    if not data_nexline.nil?
      add_system_mensurations(idx + 2, current_top, data_nexline['height'])
    end
    iimg = idx.to_s.rjust(3,'0')
    curimage_name = "score_expanded_#{odd_or_even == 'odd' ? 'even' : 'odd'}.jpg"
    neximage_name = "system-#{PAGE}-#{(idx+1).to_s.rjust(3,'0')}.jpg"
    data = {
      img1_name: curimage_name,
      img2_name: neximage_name,
      gap: SYSTEMS_SEPARATOR,
      top: current_top,
      odd: odd_or_even
    }
    code_assemblage << CODE_APPEND_SYSTEM % data

    current_top += SYSTEMS_SEPARATOR

    odd_or_even = odd_or_even == 'odd' ? 'even' : 'odd'

    # break if idx == 1 #pour en faire un seul
  end

  code_assemblage = <<-BASH
cd "#{SCORE.factory_folder}"
#{code_assemblage.join("\n")}

BASH
  log("Code de découpe:\n#{code_assemblage}")
  # res = `#{code_assemblage}\n`
  res = system("#{code_assemblage}\n")
  log("res: #{res.inspect}")

  # Ne pas oublier qu'ils ont été inversés à la fin de la boucle
  autre_expanded_name = "score_expanded_#{odd_or_even}.jpg"
  score_expanded_name = "score_expanded_#{odd_or_even == 'odd' ? 'even' : 'odd'}.jpg"
  autre_expanded_path = File.join(SCORE.factory_folder,autre_expanded_name)
  score_expanded_path = File.join(SCORE.factory_folder,score_expanded_name)
  File.delete(autre_expanded_path) if File.exists?(autre_expanded_path)
  # On renomme enfin le fichier final
  FileUtils.move(score_expanded_path, File.join(SCORE_FOLDER,"score-p#{PAGE}.jpg"))

  return true
end #/ assemble_systems
