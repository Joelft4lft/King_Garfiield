FROM python:3.8-slim
RUN pip install --upgrade pip

# Evita interações durante build
ENV DEBIAN_FRONTEND=noninteractive

# Atualiza pacotes e instala dependências do sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Cria e define diretório de trabalho
WORKDIR /app

# Copia arquivos do projeto para a imagem
COPY . /app

# Atualiza pip e instala dependências do projeto
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Expõe a porta usada pelo Rasa
EXPOSE 10000

# Comando para iniciar o Rasa com API e CORS habilitado
CMD ["rasa", "run", "--enable-api", "--cors", "*", "--port", "10000"]
