// Cartões iniciais (seção 11 do contexto). Importados só na primeira execução.
// Cartões adicionados depois ficam em SEED_UPDATES: cada versão é importada uma única vez,
// inclusive para quem já usa o app (o progresso salvo não é alterado).
export const SEED_DECKS = ["Português", "História de PE", "Raciocínio Lógico", "Informática", "Direito Constitucional", "Direitos Humanos", "Legislação"];

export const SEED_CARDS = [
  {
    "deck": "Português",
    "front": "\"Meio\" antes de adjetivo varia? (meio/meia cansada)",
    "back": "Não. É advérbio e não varia: meio cansada."
  },
  {
    "deck": "Português",
    "front": "\"Quando\" ligando duas orações é que classe?",
    "back": "Conjunção (temporal). Em pergunta é advérbio: \"Quando você chega?\""
  },
  {
    "deck": "Português",
    "front": "\"Ruim\" tem acento? Por quê?",
    "back": "Não. \"i\" seguido de m na mesma sílaba não se acentua (igual a juiz, Raul)."
  },
  {
    "deck": "Português",
    "front": "\"Item\", \"jovem\" e \"nuvem\" têm acento?",
    "back": "Não. Paroxítona terminada em -em/-ens não se acentua."
  },
  {
    "deck": "Português",
    "front": "\"Heroico\" tem acento? E \"herói\"?",
    "back": "Heroico não (ditongo aberto em paroxítona perdeu o acento). Herói sim (oxítona). Também: ideia, jiboia sem acento; papéis, dói com acento."
  },
  {
    "deck": "Português",
    "front": "Voo, enjoo, creem, veem e para (verbo) têm acento?",
    "back": "Não. Perderam o acento no Acordo Ortográfico."
  },
  {
    "deck": "Português",
    "front": "\"Sobretudo\" equivale a quê?",
    "back": "Principalmente, acima de tudo (indica destaque)."
  },
  {
    "deck": "Português",
    "front": "\"Pois\" antes do verbo indica o quê? E depois do verbo, entre vírgulas?",
    "back": "Antes do verbo: explicação/causa. Depois do verbo, entre vírgulas: conclusão."
  },
  {
    "deck": "Português",
    "front": "Conectivos: oposição, concessão, conclusão, explicação, condição, finalidade",
    "back": "Oposição: mas, porém, contudo, todavia, entretanto, no entanto. Concessão: embora, ainda que, mesmo que. Conclusão: portanto, logo, por isso, dessa forma. Explicação: pois (antes do verbo), porque, já que. Condição: se, caso, desde que. Finalidade: para que, a fim de que."
  },
  {
    "deck": "Português",
    "front": "Haver e fazer impessoais: singular ou plural?",
    "back": "Sempre singular. Haver = existir: HOUVE muitos golpes, HAVIA candidatos. Fazer = tempo: FAZ dois anos. \"Existir\" varia: EXISTEM riscos."
  },
  {
    "deck": "Português",
    "front": "Regência mais cobrada: obedecer, assistir, preferir, chegar, esquecer",
    "back": "Obedecer A. Assistir A (= ver). Preferir A ... A (nunca \"do que\" nem \"mais\"). Chegar A. Esquecer algo / esquecer-se DE algo."
  },
  {
    "deck": "Português",
    "front": "Flagrante x fragrante; retificar x ratificar; deferir x diferir; eminente x iminente; senso x censo",
    "back": "Flagrante: evidente / fragrante: perfumado. Retificar: corrigir / ratificar: confirmar. Deferir: aprovar / diferir: adiar. Eminente: ilustre / iminente: prestes a acontecer. Senso: juízo / censo: contagem."
  },
  {
    "deck": "Português",
    "front": "\"Muito\": advérbio ou pronome?",
    "back": "Antes de adjetivo ou verbo: advérbio, não varia (muito inteligente). Antes de substantivo: pronome, varia (muitos livros)."
  },
  {
    "deck": "Português",
    "front": "Exceção ou excessão?",
    "back": "EXCEÇÃO (vem de exceto). Excesso, exceder e excessivo têm SS."
  },
  {
    "deck": "Português",
    "front": "\"Há\" ou \"a\" com tempo?",
    "back": "HÁ para passado: moro aqui há 10 anos (troca por \"faz\"). A para futuro: daqui a 4 meses."
  },
  {
    "deck": "Português",
    "front": "Plural de palavras em -ão (mais cobrados)",
    "back": "-ãos: cidadão, irmão, cristão, mão, órgão. -ães: pão, cão, alemão, capitão. -ões: limão, leão, eleição, ação, coração."
  },
  {
    "deck": "Português",
    "front": "Numeral cardinal x ordinal x multiplicativo x fracionário",
    "back": "Cardinal: quantidade (cinco). Ordinal: ordem (quinto). Multiplicativo: dobro, triplo. Fracionário: metade, um terço."
  },
  {
    "deck": "Português",
    "front": "Crase: regra geral",
    "back": "Preposição \"a\" + artigo \"a\". Teste: troque por palavra masculina; se virar \"ao\", tem crase. Vou à praia → vou ao clube."
  },
  {
    "deck": "Português",
    "front": "Crase antes de palavra masculina?",
    "back": "Não: a pé, a cavalo, a prazo. Exceção: \"à moda de\" subentendido (bife à milanesa)."
  },
  {
    "deck": "Português",
    "front": "Crase antes de verbo?",
    "back": "Nunca: começou a estudar."
  },
  {
    "deck": "Português",
    "front": "Crase antes de pronome pessoal ou de tratamento?",
    "back": "Não: a ela, a você, a Vossa Excelência. Exceções: à senhora, à senhorita."
  },
  {
    "deck": "Português",
    "front": "Crase entre palavras repetidas?",
    "back": "Não: frente a frente, cara a cara, gota a gota."
  },
  {
    "deck": "Português",
    "front": "\"Refiro-me a pessoas\" ou \"às pessoas\"?",
    "back": "\"A\" sozinho antes de plural: sem crase. Com artigo plural: às pessoas. Nunca \"à pessoas\"."
  },
  {
    "deck": "Português",
    "front": "Crase antes de cidade ou lugar?",
    "back": "Vou A, volto DA, crase HÁ (vou à Bahia). Vou A, volto DE, crase pra quê? (vou a Recife, a Caruaru)."
  },
  {
    "deck": "Português",
    "front": "Crase com horas e \"daqui a\"",
    "back": "Hora exata: às 8h, à 1h. Tempo futuro sem crase: daqui a duas horas."
  },
  {
    "deck": "Português",
    "front": "Crase em locuções femininas",
    "back": "Sim: às vezes, à noite, à tarde, à medida que, à custa de, à procura de."
  },
  {
    "deck": "Português",
    "front": "Quando a crase é facultativa?",
    "back": "Antes de nome feminino de pessoa (a/à Maria), de possessivo feminino (a/à minha casa) e depois de \"até\"."
  },
  {
    "deck": "Português",
    "front": "\"Voltei a casa\" ou \"à casa\"?",
    "back": "Casa = lar, sem especificar: sem crase. Especificada: à casa dos meus pais."
  },
  {
    "deck": "Português",
    "front": "Vírgula entre sujeito e verbo?",
    "back": "NUNCA. Nem entre verbo e complemento."
  },
  {
    "deck": "Português",
    "front": "Vírgula no vocativo e no aposto",
    "back": "Vocativo sempre com vírgula (Soldado, apresente-se). Aposto explicativo entre vírgulas (Recife, capital de PE, ...)."
  },
  {
    "deck": "Português",
    "front": "Vírgula no adjunto adverbial deslocado",
    "back": "Deslocado para o início ou meio leva vírgula; se for curto, é facultativa."
  },
  {
    "deck": "Português",
    "front": "Vírgula com mas, porém, contudo",
    "back": "Vírgula antes do \"mas\". Porém/contudo no meio da frase ficam entre vírgulas."
  },
  {
    "deck": "Português",
    "front": "Oração com \"que\": quando leva vírgula?",
    "back": "Explicativa (vale para todos): com vírgula. Restritiva (só alguns): sem vírgula."
  },
  {
    "deck": "Português",
    "front": "Vírgula em enumeração e antes do \"e\"",
    "back": "Separa os itens, sem vírgula antes do \"e\" final. Antes do \"e\" pode, se os sujeitos forem diferentes."
  },
  {
    "deck": "Português",
    "front": "Vírgula com isto é, ou seja, por exemplo; e em datas",
    "back": "Ficam entre vírgulas. Data: Caruaru, 10 de outubro de 2026."
  },
  {
    "deck": "Português",
    "front": "Anáfora x catáfora",
    "back": "Anáfora retoma o que já apareceu (O soldado chegou. Ele...). Catáfora anuncia o que vem depois (Só quero isto: passar)."
  },
  {
    "deck": "História de PE",
    "front": "Quem foi Brites de Albuquerque?",
    "back": "Esposa de Duarte Coelho; governou a capitania de PE na ausência dele."
  },
  {
    "deck": "História de PE",
    "front": "Até quando Olinda foi capital de PE?",
    "back": "Até 1827; depois, Recife."
  },
  {
    "deck": "História de PE",
    "front": "Fracasso das capitanias levou a quê?",
    "back": "Governo-Geral em 1548, com Tomé de Souza em Salvador."
  },
  {
    "deck": "História de PE",
    "front": "Holandeses: invasão, Nassau, Guararapes e expulsão",
    "back": "Invasão 1630 (Cia. das Índias Ocidentais). Nassau 1637–1644 (tolerante, urbanizou o Recife). Guararapes 1648 e 1649 (Jaboatão). Expulsão 1654."
  },
  {
    "deck": "História de PE",
    "front": "Heróis da Insurreição Pernambucana",
    "back": "João Fernandes Vieira, André Vidal de Negreiros, Henrique Dias (negros) e Filipe Camarão (indígenas)."
  },
  {
    "deck": "História de PE",
    "front": "Quilombo dos Palmares",
    "back": "Serra da Barriga (hoje Alagoas). Ganga Zumba fez acordo em 1678. Zumbi morreu em 1695. Destruído por Domingos Jorge Velho."
  },
  {
    "deck": "História de PE",
    "front": "Linha do tempo das revoltas: quem governava?",
    "back": "1710 Mascates: Colônia. 1817: D. João VI (Joanino). 1824 Confederação do Equador: D. Pedro I. 1832–35 Cabanada: Regência (queria D. Pedro I de volta). 1848 Praieira: D. Pedro II. 1911 Dantas Barreto derruba Rosa e Silva: República Velha."
  },
  {
    "deck": "História de PE",
    "front": "1817 x 1824: a que cada uma reagiu?",
    "back": "1817: impostos e privilégios da Corte de D. João VI. 1824: D. Pedro I dissolveu a Constituinte e outorgou a Constituição. Adesão: Paraíba, RN e Ceará. Frei Caneca participou das duas e foi fuzilado em 1825."
  },
  {
    "deck": "História de PE",
    "front": "Maracatu Nação x Maracatu Rural",
    "back": "Nação (baque virado): coroação dos reis do Congo, matriz africana. Rural (baque solto): Zona da Mata Norte, caboclo de lança."
  },
  {
    "deck": "História de PE",
    "front": "Frevo e Xangô",
    "back": "Frevo: Patrimônio Imaterial da Humanidade (UNESCO) em 2012. Xangô: culto de matriz nagô (iorubá) em PE."
  },
  {
    "deck": "Direitos Humanos",
    "front": "Imprescritível x inalienável x irrenunciável",
    "back": "Imprescritível: não se perde com o tempo. Inalienável: não se vende nem transfere. Irrenunciável: não dá para abrir mão."
  },
  {
    "deck": "Direitos Humanos",
    "front": "O que é vedação ao retrocesso?",
    "back": "Direito conquistado não pode ser reduzido nem suprimido."
  },
  {
    "deck": "Direitos Humanos",
    "front": "Gerações dos direitos humanos",
    "back": "1ª liberdade (civis e políticos). 2ª igualdade (sociais, econômicos, culturais). 3ª fraternidade (difusos: meio ambiente, paz). Lema da Revolução Francesa. São pelo menos três."
  },
  {
    "deck": "Direitos Humanos",
    "front": "Direitos humanos x direitos fundamentais",
    "back": "Humanos: plano internacional (tratados), mais amplos. Fundamentais: positivados na Constituição."
  },
  {
    "deck": "Direitos Humanos",
    "front": "Tratado de DH com status de emenda constitucional",
    "back": "Aprovado em cada Casa do Congresso, em dois turnos, por 3/5 dos votos (art. 5º, § 3º)."
  },
  {
    "deck": "Raciocínio Lógico",
    "front": "O que é proposição?",
    "back": "Frase declarativa que pode ser V ou F. Pergunta, ordem, exclamação e frase aberta não são."
  },
  {
    "deck": "Raciocínio Lógico",
    "front": "Tabela-verdade: E, OU, SE...ENTÃO, SE E SOMENTE SE",
    "back": "E: V só se as duas forem V. OU: F só se as duas forem F. SE...ENTÃO: F só em V→F (Vera Fischer). SE E SOMENTE SE: V quando iguais. Linhas = 2^n."
  },
  {
    "deck": "Raciocínio Lógico",
    "front": "Negação de \"João é soldado\"",
    "back": "\"João não é soldado\" (não troque por um oposto como \"civil\")."
  },
  {
    "deck": "Raciocínio Lógico",
    "front": "Negações e equivalência mais cobradas",
    "back": "Contrapositiva: P→Q = ~Q→~P. Negação de P→Q: P e ~Q. Negação de P ou Q: ~P e ~Q. Negação de P e Q: ~P ou ~Q. Negação de \"todo\": algum não."
  },
  {
    "deck": "Direito Constitucional",
    "front": "Fundamentos x objetivos x princípios (arts. 1º, 3º e 4º)",
    "back": "Fundamentos (art. 1º): SO-CI-DI-VA-PLU. Objetivos (art. 3º): começam com verbo (construir, garantir, erradicar, promover). Princípios (art. 4º): relações internacionais."
  },
  {
    "deck": "Direito Constitucional",
    "front": "Direitos políticos: cassação, perda e suspensão",
    "back": "Cassação é proibida. Perda/suspensão só no art. 15: cancelamento da naturalização, incapacidade civil absoluta, condenação criminal transitada em julgado, recusa de obrigação a todos imposta, improbidade."
  },
  {
    "deck": "Direito Constitucional",
    "front": "Perda da nacionalidade após a EC 131/2023",
    "back": "1) Cancelamento da naturalização por sentença (fraude ou atentado à ordem constitucional). 2) Pedido expresso do brasileiro, desde que não fique apátrida."
  },
  {
    "deck": "Direito Constitucional",
    "front": "Cargos privativos de brasileiro nato",
    "back": "Presidente e Vice, Presidente da Câmara, Presidente do Senado, Ministro do STF, carreira diplomática, Oficial das Forças Armadas, Ministro da Defesa."
  },
  {
    "deck": "Direito Constitucional",
    "front": "Militar: greve, sindicato e partido",
    "back": "Proibidos sindicalização e greve. Em serviço ativo não pode ser filiado a partido."
  },
  {
    "deck": "Informática",
    "front": "Tipos de nuvem: SaaS, PaaS e IaaS",
    "back": "SaaS: software pronto pelo navegador (Gmail, Drive, Office 365). PaaS: plataforma para desenvolver. IaaS: infraestrutura (servidores, VMs)."
  },
  {
    "deck": "Informática",
    "front": "Cc x Cco no e-mail",
    "back": "Cc: cópia que todos veem. Cco: cópia oculta."
  },
  {
    "deck": "Informática",
    "front": "Protocolos de e-mail: SMTP, POP3, IMAP",
    "back": "SMTP envia. POP3 baixa e tira do servidor. IMAP sincroniza e mantém no servidor."
  },
  {
    "deck": "Informática",
    "front": "Backup incremental x diferencial",
    "back": "Incremental: o que mudou desde o último backup de qualquer tipo. Diferencial: o que mudou desde o último backup completo."
  }
];

export const SEED_UPDATES = [
  {
    version: 2,
    cards: [
    {
      "deck": "Português",
      "front": "Feiura, baiuca e bocaiuva têm acento?",
      "back": "Não. Paroxítona com i/u tônico logo depois de ditongo perde o acento. Exceção: oxítona mantém (Piauí)."
    },
    {
      "deck": "Português",
      "front": "Hífen x hifens; item x itens",
      "back": "Singular em -n leva acento (hífen, pólen). Plural em -ens não leva (hifens, polens, itens)."
    },
    {
      "deck": "Português",
      "front": "\"Houveram problemas\" está certo?",
      "back": "NÃO. Haver = existir fica sempre no singular: HOUVE problemas, HAVIA vagas, DEVE HAVER soluções."
    },
    {
      "deck": "Português",
      "front": "Ideia, joia, heroico, assembleia têm acento?",
      "back": "Não. Ditongo aberto éi/ói em paroxítona perdeu o acento. Em oxítona mantém: papéis, herói, dói."
    },
    {
      "deck": "Português",
      "front": "Acento em éi/ói depois do Acordo: quando cai e quando fica?",
      "back": "CAI na paroxítona: ideia, assembleia, plateia, geleia, estreia, jiboia, joia, heroico. FICA na oxítona e no monossílabo: papéis, anéis, herói, chapéu, dói, céu."
    },
    {
      "deck": "Português",
      "front": "Vocabulário formal de reescrita (AOCP)",
      "back": "Mormente = principalmente. Outrossim = também. Destarte = assim, portanto. Porquanto = porque. Conquanto = embora. Todavia = mas."
    },
    {
      "deck": "Português",
      "front": "Objeto direto x objeto indireto",
      "back": "OD: sem preposição (vi o jogo). OI: com preposição exigida pelo verbo (recorri aos agentes, obedeço ao regulamento)."
    }
  ]
  },
  {
    version: 3,
    cards: [
    {
      "deck": "Português",
      "front": "Por que \"chegaram a uma casa\" não tem crase?",
      "back": "Não é porque \"chegar\" dispensa a preposição (ele exige \"a\"). É porque \"uma\" é artigo indefinido, e crase só acontece com o artigo definido \"a\"."
    },
    {
      "deck": "Português",
      "front": "\"Àquele/àquela\": de onde vem a crase?",
      "back": "Da preposição \"a\" + o \"a\" inicial do pronome demonstrativo aquele/aquela/aquilo. Não é junção de artigos."
    }
  ]
  },
  {
    version: 4,
    cards: [
    {
      "deck": "Português",
      "front": "\"QUE\": relativo ou integrante?",
      "back": "Troque por \"o qual / a qual\": se funcionar, é pronome relativo (Ela, a qual estava assustada). Troque por \"isso\": se funcionar, é conjunção integrante (percebeu isso)."
    },
    {
      "deck": "Português",
      "front": "\"LOGO\": advérbio ou conjunção?",
      "back": "Se der para trocar por \"imediatamente\", é advérbio de tempo (logo percebeu). Se der para trocar por \"portanto\", é conjunção conclusiva (estudou, logo passou)."
    },
    {
      "deck": "Português",
      "front": "\"MUITO/MUITA\": pronome ou advérbio?",
      "back": "Antes de substantivo: pronome indefinido, varia (muita calma, muitos livros). Antes de adjetivo ou verbo: advérbio, não varia (muito calmo, estudou muito)."
    }
  ]
  },
  {
    version: 5,
    cards: [
    {
      "deck": "Raciocínio Lógico",
      "front": "O que NÃO é proposição?",
      "back": "Ordem (Apresente-se!), pergunta (Será?), exclamação (Que lindo!) e frase aberta (x + 3 > 10, Ele é alto). Frase falsa É proposição (7 é par)."
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "Tabela-verdade: quando cada conectivo é V ou F?",
      "back": "E: V só com as duas V. OU: F só com as duas F. SE...ENTÃO: F só em V→F. SE E SOMENTE SE: V quando iguais."
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "Negação de \"Se P, então Q\"",
      "back": "\"P E não Q\" (MA-NE). Negação NUNCA tem \"se...então\"."
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "Equivalências de \"Se P, então Q\"",
      "back": "\"Não P OU Q\" (NE-Y-MAR) e \"Se não Q, então não P\" (contrapositiva)."
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "\"Se Q, então P\" é equivalente a \"Se P, então Q\"?",
      "back": "NÃO. Inverter sem negar é pegadinha (recíproca). Só vale invertendo E negando as duas."
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "Negação de \"P e Q\" e de \"P ou Q\"",
      "back": "Nega tudo e troca o conectivo: não(P e Q) = não P OU não Q. não(P ou Q) = não P E não Q."
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "Negação de \"Todo A é B\" e de \"Nenhum A é B\"",
      "back": "Todo A é B → Algum (pelo menos um) A NÃO é B. Nenhum A é B → Algum A é B. Negação de \"todo\" NÃO é \"nenhum\"."
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "Argumentos válidos com \"Se P, então Q\"",
      "back": "Modus Ponens: P, logo Q (seta para frente). Modus Tollens: não Q, logo não P (volta negando)."
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "Falácias com \"Se P, então Q\" (inválidos)",
      "back": "Afirmar a 2ª: \"Q, logo P\". Negar a 1ª: \"não P, logo não Q\". Ambos ERRADOS."
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "Premissas em cadeia com \"não\": por onde começo?",
      "back": "Pela premissa mais simples (a que afirma ou nega algo direto) e volte negando em cada \"se...então\" (modus tollens em cadeia)."
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "Conjuntos: pelo menos um, somente um, nenhum",
      "back": "Pelo menos um = A + B − ambos. Somente um = (A − ambos) + (B − ambos). Nenhum = total − pelo menos um."
    }
  ]
  },
  {
    version: 6,
    cards: [
    {
      "deck": "Raciocínio Lógico",
      "front": "Equivalente (contrapositiva): \"Se chove, o chão molha\"",
      "back": "Se o chão NÃO molha, então NÃO chove"
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "Equivalente com \"ou\": \"Se chove, o chão molha\"",
      "back": "NÃO chove OU o chão molha"
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "\"Se o chão não molha, então não chove\" é equivalente a \"Se chove, o chão molha\"?",
      "back": "SIM (troca de lugar + \"não\" nas duas)"
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "\"Se o chão molha, então choveu\" é equivalente a \"Se chove, o chão molha\"?",
      "back": "NÃO (trocou sem negar; o chão pode molhar por outro motivo)"
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "\"Se não chove, o chão não molha\" é equivalente a \"Se chove, o chão molha\"?",
      "back": "NÃO (negou sem trocar de lugar)"
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "\"Não chove ou o chão não molha\" é equivalente a \"Se chove, o chão molha\"?",
      "back": "NÃO (negou as duas; no NE-Y-MAR, só a 1ª leva \"não\")"
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "Equivalente com \"se...então\": \"Ana estuda ou trabalha\"",
      "back": "Se Ana NÃO estuda, então trabalha"
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "Contar os \"não\": contrapositiva x NE-Y-MAR",
      "back": "Contrapositiva: 2 \"não\" + ordem trocada. NE-Y-MAR: 1 \"não\" só, no começo"
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "Regra ou flagrante? \"É sábado e o quartel não fez faxina\"",
      "back": "Flagrante → é NEGAÇÃO (nunca equivalência)"
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "Negação de \"Algum candidato colou\"",
      "back": "NENHUM candidato colou (sem \"não\")"
    }
  ]
  },
  {
    version: 7,
    cards: [
    {
      "deck": "Raciocínio Lógico",
      "front": "Como negar uma frase que tem \"não\"?",
      "back": "NEGAR UM \"NÃO\" = TIRAR O \"NÃO\". Negar \"não chove\" → \"chove\". Negar \"não dirige\" → \"dirige\". Negar \"chove\" → \"não chove\". Se tem \"não\", tira; se não tem, coloca."
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "No \"OU\" e no \"E\", a ordem importa?",
      "back": "Não, a ordem não importa: \"A ou B\" = \"B ou A\"."
    },
    {
      "deck": "Raciocínio Lógico",
      "front": "\"Todo A é B\" equivale a quê?",
      "back": "\"Se é A, então é B\". Vale a contrapositiva: \"Se não é B, não é A\"."
    }
  ]
  }
];
