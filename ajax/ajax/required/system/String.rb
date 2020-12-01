# encoding: UTF-8

TAB     = '    '
ISPACE  = ' ' # espace insécable
RC = "
".freeze
RC2 = (RC*2).freeze
RC3 = (RC*3).freeze
POUCE = "👍"
WARNING = "🚫"

MONTHNAMES = [
  nil,
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'aout',
  'septembre',
  'octobre',
  'novembre',
  'décembre'
]
DAYNAMES = [
  'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
]

def date_humaine(adate = nil, avec_jour = false)
  adate ||= Time.now
  pourd = adate.day == 1 ? '1er' : '%-d' # cas particulier du premier
  @datelineformat = avec_jour ? "_JOURH_ #{pourd} _MOIS_ %Y".freeze : "#{pourd} _MOIS_ %Y".freeze
  adate.strftime(@datelineformat).sub(/_MOIS_/, MONTHNAMES[adate.month]).sub(/_JOURH_/, DAYNAMES[adate.wday])
end

class String

  PAGE_WIDTH        = 1500.0
  NOMBRE_MOTS_PAGE  = 250

  CHIFFRE_HAUT = {
    0 => '⁰',
    1 => '¹',
    2 => '²',
    3 => '³',
    4 => '⁴',
    5 => '⁵',
    6 => '⁶',
    7 => '⁷',
    8 => '⁸',
    9 => '⁹'
  }

  CHIFFRE_BAS = {
    0 => '₀',
    1 => '₁',
    2 => '₂',
    3 => '₃',
    4 => '₄',
    5 => '₅',
    6 => '₆',
    7 => '₇',
    8 => '₈',
    9 => '₉'
  }


  MOIS = {
    1 => {long:'janvier', short:'jan'},
    2 => {long:'février', short:'fév'},
    3 => {long:'mars', short:'mars'},
    4 => {long:'avril', short:'avr'},
    5 => {long:'mai', short:'mai'},
    6 => {long:'juin', short:'juin'},
    7 => {long:'juillet', short:'juil'},
    8 => {long:'aout', short:'aou'},
    9 => {long:'septembre', short:'sept'},
    10  => {long:'octobre', short:'oct'},
    11  => {long:'novembre', short:'nov'},
    12  => {long:'décembre', short:'déc'}
  }


  def self.columnize(lines, delimitor = ',')
    lines = lines.join(RC) if lines.is_a?(Array)
    str = `echo "#{lines}" | column -t -s '#{delimitor}'`
    str.gsub(/([^ \n])  /,'\1     ')
  end

  def collapse
    self.gsub(/([ \t])[ \t]+/,'\1')
  end

  def nil_if_empty
    self == '' ? nil : self
  end

  # Le texte en bleu gras pour le terminal
  def bleu_gras
    "\033[1;96m#{self}\033[0m"
  end
  def bleu_gras_html
    "<span style=\"color:blue;font-weight:bold;\">#{self}</span>"
  end
  # Le texte en bleu gras pour le terminal
  def bleu
    "\033[0;96m#{self}\033[0m"
    # 96=bleu clair, 93 = jaune, 94/95=mauve, 92=vert
  end
  def bleu_html
    "<span style=\"color:blue;\">#{self}</span>"
  end
  def mauve
    "\033[1;94m#{self}\033[0m"
  end
  def mauve_html
    "<span style=\"color:purple;\">#{self}</span>"
  end

  def fond1
    "\033[38;5;8;48;5;45m#{self}\033[0m"
  end
  def fond1_html
    "<span style=\"background-color:red;color:white;\">#{self}</span>"
  end
  def fond2
    "\033[38;5;8;48;5;40m#{self}\033[0m"
  end
  def fond2_html
    "<span style=\"background-color:green;color:white;\">#{self}</span>"
  end
  def fond3
    "\033[38;5;0;48;5;183m#{self}\033[0m"
  end
  def fond3_html
    "<span style=\"background-color:blue;color:white;\">#{self}</span>"
  end
  def fond4
    "\033[38;5;15;48;5;197m#{self}\033[0m"
  end
  def fond4_html
    "<span style=\"background-color:purple;color:white;\">#{self}</span>"
  end
  def fond5
    "\033[38;5;15;48;5;172m#{self}\033[0m"
  end
  def fond5_html
    "<span style=\"background-color:orange;color:white;\">#{self}</span>"
  end

  def jaune
    "\033[0;93m#{self}\033[0m"
  end
  alias :yellow :jaune
  def jaune_html
    "<span style=\"color:yellow;\">#{self}</span>"
  end

  def orange_html
    "<span style=\"color:orange;\">#{self}</span>"
  end

  def vert
    "\033[0;92m#{self}\033[0m"
  end
  def vert_html
    "<span style=\"color:green;\">#{self}</span>"
  end

  # Le texte en rouge gras pour le terminal
  def rouge_gras
    "\033[1;31m#{self}\033[0m"
  end
  def rouge_gras_html
    "<span style=\"color:red;font-weight:bold;\">#{self}</span>"
  end

  # Le texte en rouge gras pour le terminal
  def rouge
    "\033[0;91m#{self}\033[0m"
  end
  def rouge_html
    "<span style=\"color:red;\">#{self}</span>"
  end

  def rouge_clair
    "\033[0;35m#{self}\033[0m"
  end
  def rouge_clair_html
    "<span style=\"color:#FF8888;\">#{self}</span>"
  end

  def gris
    "\033[0;90m#{self}\033[0m"
  end
  def gris_html
    "<span style=\"color:grey;\">#{self}</span>"
  end

  def gras
    "\033[1;38m#{self}\033[0m"
  end
  def purple
    "\033[1;34m#{self}\033[0m"
  end
  def yellow
    "\033[1;33m#{self}\033[0m"
  end
  def fushia
    "\033[1;35m#{self}\033[0m"
  end
  def cyan
    "\033[1;36m#{self}\033[0m"
  end
  def grey
    "\033[1;90m#{self}\033[0m"
  end

  # Convertit le texte en colonnes de largeurs +width+
  # Si options[:indent] est fourni, on ajoute cette indentation
  # à chaque ligne.
  def colonnize width = 50, options = nil # en nombre de caractères
    res = `echo "#{self.gsub(/"/,'\\"')}" | fmt #{width}`
    if options && options[:indent]
      res = options[:indent] + res.gsub!(/\n/, "\n#{options[:indent]}")
    end
    return res
  end
  # Quand le string est une horloge, retourne le nombre de secondes
  def h2s
    pms = self.split(':').reverse
    pms[0].to_i + (pms[1]||0) * 60 + (pms[2]||0) * 3660
  end

  def self.levenshtein_beween(s, t)
    m = s.length
    n = t.length
    return m if n == 0
    return n if m == 0
    d = Array.new(m+1) {Array.new(n+1)}

    (0..m).each {|i| d[i][0] = i}
    (0..n).each {|j| d[0][j] = j}
    (1..n).each do |j|
      (1..m).each do |i|
        d[i][j] = if s[i-1] == t[j-1]  # adjust index into string
                    d[i-1][j-1]       # no operation required
                  else
                    [ d[i-1][j]+1,    # deletion
                      d[i][j-1]+1,    # insertion
                      d[i-1][j-1]+1,  # substitution
                    ].min
                  end
      end
    end
    d[m][n]
  end

  # Prend une liste de chiffres séparés par des espaces, p.e. "1 2 65 6"
  # et retourne une liste d'entier (p.e. [1, 2, 65, 6])
  def as_id_list delimitor = ' '
    if self.nil_if_empty.nil?
      []
    else
      self.split(delimitor).collect{|n| n.strip.to_i }
    end
  end


  # Changer un bit dans le texte, en l'allongeant si
  # nécessaire
  #
  # +ibit+ Indice du bit à modifier
  # +valbit+ Valeur à donner au bit +ibit+ (0-start)
  #
  # @param {Integer} dec
  #                 Index dans le string (0-start)
  # @param {Integer} val
  #                 Nouvelle valeur à lui donner, en base 10
  # @param {Integer} base
  #                 Base dans laquelle écrire le bit (10 par défaut)
  #
  # @return {String}
  #         Le nouveau string forgé, à la longueur minimum voulue.
  #
  def set_bit dec, val, base = nil
    str = self.ljust(dec + 1, '0')
    str[dec] = val.to_s(base || 10)
    return str
  end

  # Retourne le "bit" à +dec+ dans self
  # @param {Integer} dec
  #                 Offset dans la chaine
  # @param {Integer} base
  #                 Optionnellement, la base du bit (de 2 à 36)
  #
  # @return {Integer} bit
  #                  La valeur du bit dans la base donnée ou 10
  def get_bit dec, base = nil
    self[dec].to_i(base||10)
  end

  # Par exemple, lorsqu'un argument de fonction peut être
  # un array ou un string, cette méthode permet de ne pas
  # avoir à tester si l'élément est un array ou non.
  def in_array
    [self]
  end

  # Retire toutes les balises du string
  #
  # +separator+ Texte de remplacement pour chaque balise
  # Penser que ces balises sont aussi les italiques et
  # autres marques de formatage.
  def strip_tags separator = ''
    str = self
    str = str.gsub(/<(.+?)>/, separator)
    str.gsub!(/<adminonly>(.*?)<\/adminonly>/,'')
    return str
  end

  def titleize
    t = self.downcase
    t[0] = t[0].upcase
    return t
  end

  # ---------------------------------------------------------------------

  # Pour "épurer" le string, c'est-à-dire :
  #   - le striper
  #   - remplacer les apostrophes double par des ' “ ' (courbe double)
  def purified
    str = self
    str = str.strip
    str = str.gsub(/\r/, '') if str.match(/\n/)
    str.gsub(/"(.*?)"/, '“\1”')
  end

  # Met le texte +searched+ en exergue dans le self.
  # C'est-à-dire que tous les textes sont mis dans des
  # span de class `motex` (mot-exergue)
  #
  # La méthode met également le nombre d'itérations
  # remplacées dans @iterations_motex qu'on peut obtenir
  # à l'aide de String#instance_variable_get('@iterations_motex')
  #
  # +searched+
  #     {String}  L'expression exacte à chercher
  #     {Regexp}  L'expression régulière à évaluer sur self
  #     {Hash}    Hash définissant la recherche.
  #               {:content, :exact, :whole_word, :not_regular}
  #
  # Voir le fichier ./__Dev__/__RefBook_Utilisation__/Vues/Textes.md
  # pour le détail.
  #
  def with_exergue searched
    if searched.instance_of?( Hash )

      is_exact        = searched[:exact]        || false
      is_whole_word   = searched[:whole_word]   || false
      is_not_regular  = searched[:not_regular]  || false
      is_regular      = !is_not_regular

      reg = "#{searched[:content]}"
      reg = Regexp::escape( reg ) if is_not_regular

      searched = case true
      when !(is_exact || is_regular || is_whole_word) then /(#{reg})/
      when !is_exact && !is_whole_word  then /(#{reg})/i
      when !is_exact && is_whole_word   then /\b(#{reg})\b/i
      when is_whole_word                then /\b(#{reg})\b/
      else /(#{reg})/
      end
    else
      searched = /(#{searched})/
    end
    str = self.gsub(searched, "<span class='motex'>\\1</span>")
    str.instance_variable_set('@iterations_motex', self.scan(searched).count)
    return str
  end

  # {Integer} Quand le string est une horloge, la transforme en
  # secondes
  def h2s
    str = self.split(':').reverse
    str[0].to_i + str[1].to_i * 60 + str[2].to_i * 3600
  end

  # Pour upcaser vraiment tous les caractères, même les accents et
  # les diacritiques
  DATA_MIN_TO_MAJ = {
    from: "àäéèêëîïùôöç",
    to:   "ÀÄÉÈÊËÎÏÙÔÖÇ"
  }
  alias :old_upcase :upcase
  def upcase
    self.old_upcase.tr(DATA_MIN_TO_MAJ[:from], DATA_MIN_TO_MAJ[:to])
  end

  alias :old_downcase :downcase
  def downcase
    self.old_downcase.tr(DATA_MIN_TO_MAJ[:to], DATA_MIN_TO_MAJ[:from])
  end

  def nil_if_empty strip = true
    checked = strip ? self.strip : self
    checked == "" ? nil : checked
  end
  def nil_or_empty?
    self.strip == ""
  end
  def nil_if_zero
    checked = self.strip
    checked.to_i == 0 ? nil : checked
  end

  def deserb bindee = nil
    ERB.new(self).result(bindee)
  end

  ##
  # Transforme une path absolue en path relative
  #
  # NOTE
  #
  #   * Si la classe App existe et définit la méthode
  #     de classe `relative_path_of', on l'utilise, sinon, on
  #     calcul la "base" de l'application.
  #
  def as_relative_path
    if defined?(App) && App.respond_to?( :relative_path_of)
      App::relative_path_of self
    else
      rel_path = self.gsub(String::reg_base_application, '')
      rel_path.prepend(".") unless rel_path.start_with?('.') || (rel_path == self)
      return rel_path
    end
  end


  # Ruby version < 2
  unless "".respond_to?(:prepend)
    def prepend str
      self.replace "#{str}#{self}"
    end
  end

  unless "".respond_to?(:capitalize)
    def capitalize
      s = self
      s[0..0].upcase + s[1..-1]
    end
  end

  def numeric?
    Float(self) != nil rescue false
  end

  # Chamelise ('mon_nom_tiret' => 'MonNomTiret')
  def camelize
    self.split('_').collect{|mot| mot.capitalize}.join("")
  end

  def decamelize
    self.gsub(/(.)([A-Z])/, '\1_\2').downcase
  end

  # Pour transformer n'importe quel caractère de majuscule vers
  # minuscule, ou l'inverse.
  DATA_UPCASE = {
    :maj => "ÀÁÂÃÄÅĀĂĄÇĆĈĊČÐĎÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĸĺļľŀÑŃŅŇŊÒÓÔÕÖØŌŎŐŔŖŘŚŜŞŠÙÚÛÜŨŪŬŮŰŲŴÝŹŻŽ",
    :min => "àáâãäåāăąçćĉċčðďèéêëēĕėęěĝğġģĥħìíîïĩīĭįıĵķĹĻĽĿŁñńņňŋòóôõöøōŏőŕŗřśŝşšùúûüũūŭůűųŵýźżž"
  }
  def my_upcase
    self.tr(DATA_UPCASE[:min], DATA_UPCASE[:maj]).upcase
  end
  def my_downcase
    self.tr(DATA_UPCASE[:maj], DATA_UPCASE[:min]).downcase
  end

  # Transformer les caractères diacritiques et autres en ASCII
  # simples
  unless defined? DATA_NORMALIZE
    DATA_NORMALIZE = {
      :from => "ÀÁÂÃÄÅàáâãäåĀāĂăĄąÇçĆćĈĉĊċČčÐðĎďĐđÈÉÊËèéêëĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħÌÍÎÏìíîïĨĩĪīĬĭĮįİıĴĵĶķĸĹĺĻļĽľĿŀŁłÑñŃńŅņŇňŉŊŋÒÓÔÕÖØòóôõöøŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŠšſŢţŤťŦŧÙÚÛÜùúûüŨũŪūŬŭŮůŰűŲųŴŵÝýÿŶŷŸŹźŻżŽž",
      :to   => "AAAAAAaaaaaaAaAaAaCcCcCcCcCcDdDdDdEEEEeeeeEeEeEeEeEeGgGgGgGgHhHhIIIIiiiiIiIiIiIiIiJjKkkLlLlLlLlLlNnNnNnNnnNnOOOOOOooooooOoOoOoRrRrRrSsSsSsSssTtTtTtUUUUuuuuUuUuUuUuUuUuWwYyyYyYZzZzZz"
    }
  end
  # ou def normalized
  def normalize
    self.force_encoding('utf-8').tr(DATA_NORMALIZE[:from], DATA_NORMALIZE[:to])
  end
  alias :normalized :normalize

  # Pour un nom de fichier sans problème
  def as_normalized_filename
    self.normalize.gsub(/ +/, '_').gsub(/[^a-zA-Z0-9\._]/, '').gsub(/_+/, '_').gsub(/^_/,'').gsub(/_$/,'')
  end

  # Transforme la chaine en “id normalizé”, c'est-à-dire un
  # identifiant de type String, ne contenant que des lettres et
  # des chiffres, avec capitalisation de la première lettre de
  # chaque mot.
  # Par exemple :
  #     "Ça c'est l'été et mon titre" => "CaCestLeteEtMonTitre"
  def as_normalized_id separateur = nil
    separateur ||= ""
    self.normalize.gsub(/[^a-zA-Z0-9 ]/, separateur).downcase.split.collect{|m|m.capitalize}.join(separateur)
  end

  # Retire les slashes
  #
  def strip_slashes
    self.gsub(/\\(['"])/, '\\1')
  end

end
