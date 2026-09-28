import { Shell } from "../ui";
export default function Page() {
  return (
    <Shell>
      <h1>Privacidade</h1>
      <div className="notice">
        Minuta para revisão antes do lançamento comercial.
      </div>
      <h2>Dados usados</h2>
      <p>
        Utilizamos o identificador e o e-mail da conta de acesso, informações de
        perfil, fotos públicas, solicitações, propostas, conversas e avaliações
        para operar a plataforma. A origem de campanhas pode ser registrada
        quando informada nos links.
      </p>
      <h2>O que fica público</h2>
      <p>
        Nome profissional, categoria, descrição, fotos, região atendida, preços
        de referência e avaliações compõem o perfil público. O telefone só é
        exibido quando o prestador autoriza. Mensagens e pedidos ficam
        disponíveis aos participantes; a administração acessa informações
        necessárias à operação e moderação.
      </p>
      <h2>Fotos e documentos</h2>
      <p>
        As fotos enviadas para o perfil são públicas. Não envie documentos de
        identidade nesses campos. Esta versão não recebe documentos privados
        para verificação. Não armazenamos dados de cartão.
      </p>
      <h2>Exclusão e acesso</h2>
      <p>
        Na página Minha conta, é possível solicitar exclusão. A equipe analisará
        o pedido e eventuais necessidades de retenção relacionadas a serviços em
        aberto. A política final deverá especificar os prazos, o responsável
        pelo tratamento, os fornecedores e o canal de atendimento.
      </p>
    </Shell>
  );
}
