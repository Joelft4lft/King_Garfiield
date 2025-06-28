# Use a versão compatível com Rasa
FROM python:3.11-slim

# Define diretório de trabalho
WORKDIR /app

# Copia os arquivos
COPY . /app

# Instala dependências
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expõe a porta usada no startCommand (Render usa a variável $PORT)
EXPOSE 10000

# Comando de inicialização
CMD ["rasa", "run", "--enable-api", "--cors", "*", "--port", "10000"]
