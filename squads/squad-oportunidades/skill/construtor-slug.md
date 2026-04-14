# Identidade

Esta skill constrói slugs que servem primeiro ao usuário, depois ao motor de busca.
Um slug bom é aquele que o usuário lê na barra do navegador e entende imediatamente
o que vai encontrar na página — sem ruído, sem repetição, sem data que vai envelhecer.


A premissa central URL deve transmitir o conteúdo nos termos mais simples possíveis. 

# Regras:

* não inserir datas no slug

Datas no slug criam dois problemas: a página envelhece visualmente para o usuário,
e o Google tende a tratar conteúdo com data como menos perene. independente de o título
do conteúdo mencionar o ano.

* exemplo: 

✗ /melhores-maquininhas-2025/ - errado
✓ /melhores-maquininhas/ - certo

✗ /taxa-pix-maquininha-2024/ - errado
✓ /taxa-pix-maquininha/ - certo 

Se o conteúdo precisa sinalizar atualização, isso vai no H1 ou no título SEO —
nunca na URL.

* Sem acentos, sem caracteres especiais
Slugs sempre em ASCII limpo. Acentos e cedilha são removidos.

* Apenas letras minúsculas e hífens
Sem underscores, sem espaços, sem letras maiúsculas.
Hífen é o separador padrão — Google trata hífen como separador de palavras,
underscore como parte da palavra. 


* Sem preposições

Preposições (para, de, com, em, por, sem, sobre) são removidas do slug.
Elas aumentam o comprimento sem adicionar valor semântico para busca ou leitura.

✗ /maquininha-para-mei/ errado
✓ /maquininha-mei/ certo

✗ /contabilidade-para-autonomos/ errado
✓ /contabilidade-autonomos/ certo

✗ /colchao-para-casal/
✓ /colchao-casal/

## EXCESSAO: 

✗ /maquininha-sem-mensalidade/  ← exceção: "sem" aqui é parte do atributo central
✓ /maquininha-sem-mensalidade/  ← mantém porque "sem mensalidade" é o diferencial

Quando a preposição faz parte do atributo que diferencia o produto
(ex: "sem mensalidade", "com chip"), ela permanece porque removê-la mudaria o significado.

#  Curto e conciso

O slug deve ser o mais curto possível sem perder clareza. Palavras que o contexto
já resolve são cortadas.
Como avaliar o que cortar:
Leia o slug isoladamente, fora do domínio. Cada palavra precisa estar fazendo trabalho.
Se uma palavra pode sair sem mudar o entendimento, ela sai.

✗ /comprar-maquininha-de-cartao-barata-para-pequenas-empresas/
✓ /maquininha-pequenas-empresas/

✗ /como-funciona-maquininha-aceitar-voucher-vale-refeicao/
✓ /maquininha-voucher/  (se o domínio é sobre maquininhas)
✓ /maquininhas-voucher/ (se o domínio é genérico)


# Processo de construção

Ao receber um tema, o agente executa esta sequência:
* Passo 1 — Identificar o termo central
Qual é a palavra-chave principal que define o conteúdo? Essa palavra entra no slug
obrigatoriamente.
* Passo 2 — Identificar o atributo diferenciador
O que torna essa página diferente de outras páginas sobre o mesmo tema?
Esse atributo entra no slug logo após o termo central.
* Passo 3 — Aplicar as regras de corte
Remover: datas, preposições (exceto exceções), repetições, acentos, palavras redundantes.
* Passo 4 — Testar leitura isolada
Ler o slug sem o domínio. O usuário entende o que vai encontrar?
Se não entender, algo foi cortado demais — restaurar o mínimo necessário.
* Passo 5 — Verificar canibalização
Existe outra página no site com slug similar ou idêntico?
Se sim, diferenciar ou consolidar — nunca criar dois slugs que competem pelo mesmo termo.