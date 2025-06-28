# Usa imagem base com Python 3.8
FROM python:3.8-slim

# Define diretório de trabalho no container
WORKDIR /app

# Copia os arquivos do projeto para o container
COPY . /app

# Atualiza o pip
RUN pip install --upgrade pip

# Instala as dependências
RUN pip install --no-cache-dir -r requirements.txt

# Treina o modelo
RUN rasa train

# Expõe a porta padrão do Rasa
EXPOSE 10000

# Comando para rodar o Rasa quando o container iniciar
CMD ["sh", "-c", "rasa run --enable-api --cors '*' --port ${PORT}"]
