import React, { useState, useRef, useEffect } from "react";
import { Send, BookOpen, HelpCircle } from "lucide-react";

const EditalChat = () => {
  const [messages, setMessages] = useState([
    {
      type: "assistant",
      content:
        "Olá! 👋 Sou o seu assistente virtual para o Edital 02/2025 PRPPG/UFBA - Programa de Apoio à Publicações Científicas. Estou aqui para esclarecer suas dúvidas sobre requisitos, prazos, valores e procedimentos. Como posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const editalContent = `
EDITAL 02/2025 PRPPG/UFBA - PROGRAMA DE APOIO À PUBLICAÇÕES CIENTÍFICAS

OBJETIVO:
Apoiar publicações científicas em língua estrangeira de alta qualidade, oriundas de atividades de pós-graduação, pesquisa, criação, inovação ou de outras atividades acadêmicas de autor(es) vinculado(s) à UFBA, a serem submetidos a periódicos científicos qualificados.

1. ITENS FINANCIÁVEIS:

a) Revisão e Tradução de Manuscritos:
- Manuscritos em língua estrangeira para periódicos cujo maior percentil (Web of Science ou Scopus) seja ≥ 62,5
- Se periódico não classificado: necessária justificativa do Programa de Pós-Graduação
- Para capítulos de livros ou livros: consulta prévia via ofício ao Pró-Reitor justificando relevância e impacto

b) Taxa de Publicação em Revistas Científicas:
- Periódicos com maior percentil (Web of Science ou Scopus) ≥ 62,5
- Para percentis inferiores: consulta prévia à PRPPG

2. CRITÉRIOS DE ELEGIBILIDADE:
- Pertencer ao quadro permanente da UFBA (docente ou técnico-administrativo)
- Constar como autor ou coautor do artigo
- UFBA deve figurar como instituição de origem de um dos autores
- Ter recebido confirmação da submissão da revista

3. VALORES DE REEMBOLSO:
- Revisão e Tradução: até R$ 2.000,00 por manuscrito
- Taxa de Publicação: até R$ 15.000,00 por artigo (ATUALIZADO PELA ERRATA 01)
- Manuscritos submetidos a prestadores especializados (pessoa jurídica) com competência linguística

4. DOCUMENTOS NECESSÁRIOS (APENAS ESTES DOCUMENTOS SERÃO ACEITOS):
- Formulário próprio no SIPAC ("Formulário – Edital Apoio à Publicação Científica")
- Nota fiscal ou invoice em nome do requerente
- Comprovante de pagamento em nome do requerente (fatura cartão de crédito ou comprovante de transferência bancária)
- Comprovante de submissão da revista
- Versão final do manuscrito
- Comprovação do maior percentil em PDF

5. ENCAMINHAMENTO:
- Processo via SIPAC
- Unidade de destino: Núcleo de Execução Orçamentária (12.01.74.04)

6. RECURSOS ORÇAMENTÁRIOS:
- R$ 500.000,00 no orçamento da PRPPG
- Exercícios seguintes condicionados à disponibilidade orçamentária

7. PRAZO:
- Solicitações até 21/11/2025
- Prazo devido ao encerramento do exercício financeiro

8. CONTATO:
- E-mail: coordfopg@ufba.br

IMPORTANTE:
 - Esta versão considera a ERRATA 01 de 20/01/2025 que atualizou o limite de reembolso para taxa de publicação de sem limite especificado para R$ 15.000,00.
 - Print de Telas não são aceitos como documentos comprobatórios.
 - Apenas Técnico-Administrativos e Docentes da UFBA podem solicitar o apoio.
`;

  const quickQuestions = [
    "Quem pode solicitar o apoio?",
    "Quais os valores de reembolso?",
    "Qual o prazo para submissão?",
    "Quais documentos preciso apresentar?",
  ];

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // DEBUG - Logs para verificar configuração
      console.log("=== DEBUG ===");
      console.log(
        "URL:",
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-edital`
      );
      console.log("SUPABASE_URL:", import.meta.env.VITE_APP_SUPABASE_URL);
      console.log(
        "SUPABASE_KEY:",
        import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + "..."
      );
      console.log("Message:", userMessage);
      console.log("EditalContent existe?", !!editalContent);
      console.log("EditalContent tamanho:", editalContent.length);

      const payload = {
        message: userMessage,
        editalContent: editalContent,
      };

      console.log("Payload preparado:", {
        messageLength: payload.message.length,
        editalLength: payload.editalContent.length,
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-edital`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro da API:", errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Data recebida:", data);

      const assistantResponse = data.content[0].text;

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: assistantResponse,
        },
      ]);
    } catch (error) {
      console.error("Erro completo:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content:
            "Desculpe, ocorreu um erro ao processar sua pergunta. Detalhes: " +
            error.message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <BookOpen className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Assistente Virtual - PRPPG</h1>
            <p className="text-blue-100 text-sm">
              Programa de Apoio à Publicações Científicas 02/2025
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl rounded-lg p-4 shadow-md ${
                  message.type === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="max-w-4xl mx-auto w-full px-4 pb-4">
          <div className="flex items-center gap-2 mb-3 text-gray-600">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Perguntas frequentes:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-left p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all text-sm text-gray-700"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta sobre o edital..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditalChat;
