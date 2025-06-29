FROM python:3.8-slim

WORKDIR /app

# Copia todos os arquivos para o container
COPY . /app

# Atualiza o pip e instala as dependências
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Treina o modelo já durante o build
RUN rasa train

# Garante que a pasta models esteja dentro do container
COPY models/ /app/models/

# Expõe a porta que será usada (pode ser configurada via variável PORT)
EXPOSE 10000

CMD ["sh", "-c", "rasa run --enable-api --cors '*' --port $PORT"]
