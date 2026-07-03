# Integração fiscal com a Focus NFe

Este guia descreve a configuração e a operação da NF-e de produtos e da NFS-e de serviços no VetorOS.

> A classificação fiscal, os regimes, as alíquotas e os códigos tributários devem ser confirmados com a contabilidade. Homologação serve para testes; produção gera documentos com validade fiscal.

## Preparação e implantação

Depois de publicar uma versão que altere configurações fiscais, execute as migrations antes de abrir a tela:

```bash
php artisan migrate --force
```

Se aparecer `Unknown column` para um campo como `nfse_mode`, a aplicação foi atualizada antes do banco de dados.

## Ativação por tipo de documento

Em **Configurações fiscais**, informe o token da Focus, selecione homologação ou produção e habilite separadamente:

- **NF-e de produtos** para vendas;
- **NFS-e de serviços** para ordens de serviço.

É possível habilitar apenas uma modalidade ou ambas. O registro manual desaparece somente para o tipo cuja emissão automática estiver ativa:

| Configuração | Vendas | Ordens de serviço |
| --- | --- | --- |
| Somente NF-e ativa | Emissão automática | Registro manual de NFS-e disponível |
| Somente NFS-e ativa | Registro manual de NF-e disponível | Emissão automática |
| Ambas ativas | Emissão automática | Emissão automática |
| Integração inativa | Registro manual | Registro manual |

Documentos anteriormente registrados continuam disponíveis para consulta.

## Dados obrigatórios

### Empresa emitente

Para NF-e, preencha CNPJ, razão social, CEP, UF, cidade, bairro, logradouro, número e inscrição estadual. O regime tributário da NF-e deve ser `1`, `2` ou `3`. A inscrição estadual é enviada sem pontuação.

Para NFS-e, preencha ao menos CNPJ, razão social, inscrição municipal e código IBGE do município. Outros campos podem ser exigidos conforme a modalidade e as regras municipais.

### Cliente ou tomador

Para NF-e, o cadastro exige nome, CPF/CNPJ e endereço completo: CEP, UF, cidade, bairro, logradouro e número. Na NFS-e, nome e CPF/CNPJ são obrigatórios, e o provedor ou município pode exigir também o endereço. O número aceita valores como `630`, `630A` e `S/N`.

### Produtos da NF-e

Cada produto precisa de:

- NCM com 8 dígitos;
- CFOP com 4 dígitos;
- unidade comercial e tributável;
- origem e situação do ICMS;
- situações de PIS e COFINS.

Em homologação, a SEFAZ pode exigir o nome padrão do destinatário: `NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL`.

## NFS-e municipal e NFS-e Nacional

Em **Dados fiscais padrão → Modalidade NFS-e**, escolha:

- **Municipal (Focus/prefeitura):** usa `/v2/nfse`;
- **Nacional (DPS/Ambiente Nacional):** usa `/v2/nfsen`.

A Focus não troca automaticamente entre esses endpoints. Use a modalidade nacional somente quando o município estiver ativo no Emissor Público Nacional/API. A adesão pode ser consultada no [Monitoramento das Adesões à NFS-e](https://www.gov.br/nfse/pt-br/municipios/monitoramento-adesoes).

Para a NFS-e Nacional, configure:

- código IBGE do município com 7 dígitos;
- código de tributação nacional do ISS com 6 dígitos; por exemplo, `14.01` com desdobro `00` torna-se `140100`;
- série da DPS entre `1` e `49999`;
- opção do Simples Nacional;
- regime especial municipal;
- indicador da operação IBS/CBS (`cIndOp`);
- CST e classificação tributária IBS/CBS.

Para manutenção do item `14.01`, uma operação comum costuma usar `cIndOp 050101`, CST `000` e classificação `000001`. Esses valores não são universais e precisam de confirmação contábil.

O VetorOS envia, entre outros, retenção do ISSQN, totalização tributária, finalidade, consumidor final e indicador do destinatário exigidos pelo leiaute nacional de 2026.

### Município disponível em produção, mas não em homologação

Os cadastros do Ambiente Nacional de produção e de produção restrita são separados. A rejeição `E0037` — município inexistente no cadastro de convênio — pode ocorrer quando o código IBGE está correto, mas o município ainda não foi ativado na homologação.

Nesse caso, solicite à Focus ou à prefeitura a parametrização do município no ambiente restrito. Não altere para produção apenas para testar: uma autorização em produção possui validade fiscal.

## Emissão, consulta e arquivos

A Focus processa documentos de forma assíncrona. O primeiro envio pode retornar apenas `processando_autorizacao`. Use **Sincronizar documento** para obter o resultado final.

Quando autorizado, o VetorOS grava em `fiscal_documents`:

- `pdf_url`: DANFE ou DANFSe;
- `xml_url`: XML autorizado;
- número, chave/código de verificação, status e payloads da integração.

Na venda ou ordem, `fiscal_document_url` recebe o link do PDF. A Focus pode retornar caminhos relativos, como `/arquivos_development/...`; o VetorOS acrescenta o domínio correto da homologação ou produção antes de salvar. Os arquivos permanecem hospedados pela Focus, e não devem ser gravados em `public`.

## Diagnóstico

Falhas HTTP e rejeições de autorização são registradas em `storage/logs/laravel.log`, sem o token da API. O documento também mantém:

- `request_payload`;
- `response_payload`;
- `error_message`.

`erro_autorizacao` não significa que a homologação falhou por ser um teste. Significa que a Focus recebeu a DPS ou nota, mas o autorizador rejeitou alguma regra fiscal. Sincronize o documento e consulte o código, a mensagem e a correção retornados.

Erros comuns:

- endereço ou CPF/CNPJ do destinatário ausente;
- regime tributário inválido;
- NCM, CFOP ou código de serviço inválido;
- município não parametrizado no ambiente selecionado;
- campos IBS/CBS incompatíveis com a operação;
- tentativa de usar `/nfse` quando o município exige `/nfsen`.
