import { Shell } from "../ui";
export default function Page() {
  return (
    <Shell>
      <h1>Termos de uso</h1>
      <div className="notice">
        Minuta para revisão antes do lançamento comercial. Versão de validação,
        sem cobrança real.
      </div>
      <h2>Uso da plataforma</h2>
      <p>
        O Conecta Santa Maria aproxima clientes e prestadores. O profissional
        informa suas competências, preços e disponibilidade e é responsável pela
        veracidade do perfil e pela execução do escopo acordado. O cliente deve
        fornecer informações suficientes para o orçamento.
      </p>
      <h2>Orçamentos e pagamentos</h2>
      <p>
        O preço público é uma referência. A proposta registra escopo, prazo,
        condições e valor final, que precisam ser aceitos pelo cliente. Nesta
        versão, Pix, cartão, comissão e reembolso são simulações, sem
        movimentação financeira. Não existe custódia de dinheiro ou garantia
        financeira.
      </p>
      <h2>Cancelamentos e disputas</h2>
      <p>
        Pedidos podem ser cancelados até o início do serviço. Pagamentos
        simulados são marcados como reembolsados no cancelamento. Após o início,
        os participantes podem abrir uma disputa para análise. Não há prazo de
        atendimento garantido nesta fase. Antes de cobranças reais, serão
        publicadas as regras do provedor sobre taxas, repasses, reembolsos e
        contestações.
      </p>
      <h2>Avaliações e moderação</h2>
      <p>
        Apenas o cliente de um pedido concluído pode avaliá-lo, uma vez por
        serviço. Perfis e condutas podem ser denunciados e analisados pela
        equipe. Registros profissionais informados pelo próprio prestador não
        constituem verificação nem garantia de qualidade.
      </p>
      <h2>Antes da abertura pública</h2>
      <p>
        A identificação da empresa operadora, o canal de suporte, as regras
        comerciais e esta minuta precisam ser concluídos e revisados. Acesso
        atual restrito à validação.
      </p>
    </Shell>
  );
}
