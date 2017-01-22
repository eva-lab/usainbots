**UsainBots!**
--------------

Este projeto representa um esforço inicial para a busca e o desenvolvimento de bots por meio de um serviço web.

----------

**Objetivos**
Desenvolver um serviço web que possibilite desenvolvimento e gerenciamento simplificado de bots com uma abstração inicial de reapresentação de conhecimento baseado em um sistema de recuperação da informação.

----------

**Características**
 - Permitir diálogo com seres humano em linguagem natural
 - Coleta de conhecimento a partir da web
 - Aplicação de mecanismos de segurança que garantam a integridade de um bot
 - Identificação de intenções (abertura e encerramento de diálogo, questionamento e agradecimento).

----------

**Libs - Processamento de Linguagem Natural (PLN)**
 - [Natural](https://www.npmjs.com/package/natural) (Classifier, Tokenizer, tf-idf)
 - [Snowball Stemmer](https://github.com/shibukawa/snowball-stemmer.jsx)
 - [Random Number](https://www.npmjs.com/package/random-number)

----------

**Instalação**

 Certifique-se que você possui o .git, Node.js e MongoDb corretamente instalados em sua máquina:


**1. Clonagem do Repositório**

     git clone https://github.com/jorgehclinhares/usainbots.git


  **2. Instalando as dependências do projeto**

     npm install


  **3. Definindo o ambiente**

     export NODE_ENV=production

 ou

     export NODE_ENV=development

**4. Rodando o Serviço**

    node app.js


----------

**Documentação de uso da API**

 Toda a documentação do serviço está disponível em [docs.md](https://github.com/jorgehclinhares/usainbots/blob/master/docs.md)
