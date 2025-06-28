from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

class ActionSaudacao(Action):
    def name(self) -> str:
        return "action_saudacao"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
        dispatcher.utter_message(text="Olá! Como posso ajudar você com informações sobre a casa?")
        return []

class ActionGoodbye(Action):
    def name(self) -> str:
        return "action_goodbye"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
        dispatcher.utter_message(text="Até a próxima!")
        return []

class ActionIAmABot(Action):
    def name(self) -> str:
        return "action_iamabot"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
        dispatcher.utter_message(text="Sou um assistente virtual criado para ajudar com informações sobre a casa.")
        return []

class ActionComoChegar(Action):
    def name(self) -> str:
        return "action_como_chegar"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
        dispatcher.utter_message(text="""
            🗺️ Como chegar à King Garfield House:

            Ao chegar a Bragança, siga em direção ao Centro Histórico. 
            Passe pela Praça da Sé e desça em direção ao Largo do Principal (monumento aos soldados mortos em França). 
            Depois de passar o monumento, suba pela rua imediatamente à direita (*Rua Serpa Pinto*). 
            Suba até metade da rua e vire à direita na travessa. A casa fica em frente e é facilmente reconhecida por uma janela redonda.

            📞 Se necessário, ligue para:
            - Fernando: +351 937 618 081  
            - Cris: +351 932 378 378

            https://maps.app.goo.gl/Yh1k773BVH3TcU9T8
        """)
        return []

class ActionInformacoesSobreChaves(Action):
    def name(self) -> str:
        return "action_informacoes_sobre_chaves"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
        dispatcher.utter_message(text="""
            🔑 Informações sobre as chaves:

            O chaveiro contém três chaves:
            - 1 para entrada no prédio;
            - 1 para entrada em casa;
            - 1 para acesso ao espaço KGH.

            A fechadura da porta do prédio funciona ao contrário (abre rodando para a esquerda). 
            É comum a porta estar aberta (costume local), mas recomenda-se fechá-la, especialmente à noite.
        """)
        return []

class ActionInformacoesAparelhosEletricos(Action):
    def name(self) -> str:
        return "action_informacoes_aparelhos_eletricos"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
        dispatcher.utter_message(text="""
            ⚡ Aparelhos elétricos:

            Evite ligar todos os aparelhos elétricos ao mesmo tempo, especialmente:
            - Chaleira elétrica
            - Fogão
            - Torradeira

            Se faltar energia, reative-a no quadro geral, localizado no hall de entrada do apartamento.
        """)
        return []

class ActionInformacoesEscadaKGH(Action):
    def name(self) -> str:
        return "action_informacoes_escada_kgh"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
        dispatcher.utter_message(text="""
            🪜 Atenção à escada!

            A escada de acesso ao KGH tem altura reduzida. 
            Recomendamos cuidado redobrado ao subir ou descer.
        """)
        return []

class ActionInformacoesBarulho(Action):
    def name(self) -> str:
        return "action_informacoes_barulho"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
        dispatcher.utter_message(text="""
            🤫 Silêncio, por favor!

            O prédio é partilhado com outros vizinhos. 
            Evite barulhos excessivos, especialmente à noite.
        """)
        return []

class ActionInformacoesContatoUrgente(Action):
    def name(self) -> str:
        return "action_informacoes_contato_urgente"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
        dispatcher.utter_message(text="""
            📞 Contato urgente:
            Em qualquer situação, ligue para:
            - +351 937 618 081  
            - +351 912 045 339
        """)
        return []

class ActionInformacoesRestaurantes(Action):
    def name(self) -> str:
        return "action_informacoes_restaurantes"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
        dispatcher.utter_message(text="""
            🍽️ *Sugestões de restaurantes no centro de Bragança*:

            Para refeições completas:
            - Poças
            - Sport
            - Rosina

            Para petiscos e tapas:
            - Sotinho
            - Lost Corner

            No castelo (mais sofisticados):
            - Javali
            - Zé Tuga
        """)
        return []

class ActionRotaDosPombais(Action):
    def name(self) -> str:
        return "action_rota_dos_pombais"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict) -> list:
        dispatcher.utter_message(text="""
            🕊️🏛️ Bem-vindo à Rota dos Pombais no Nordeste Transmontano!

            A Rota dos Pombais é uma viagem fascinante pela tradição e arquitetura rural do Nordeste Transmontano. 
            Conheça os pombais tradicionais e explore a história, arquitetura e a importância dessa prática para a economia local.
        """, buttons=[
            {"title": "➡️ O que são Pombais?", "payload": "/ponto_1_pombais"}
        ])
        return []

# E assim por diante para outros pontos de cada rota e intenção

