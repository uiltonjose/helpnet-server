# HelpNetService

This project is the HelpNet webservice/Backoffice

## Development server

To start the webserver locally, execute at the terminal `npm start` or if you have `nodemon` installed you can use it. It's recommended using the POSTMAN to execute all requests.

## REST API interface

#### Content

- Use `[GET] /api/content/boot` to get all necessary information starting to use the App.

  ```js
      {
          "minAppVersion": "1.1.0",
          "serverVersion": {
              "version": "1.1.0",
              "lastDeployDate": "20-08-2018"
          },
          "listProblems": [
              {
                  "ID": 1,
                  "TITULO": "Sem internet",
                  "DESCRICAO": "Não consegue acessar a internet"
              },
              {
                  "ID": 2,
                  "TITULO": "Cabo partido",
                  "DESCRICAO": "Foi identificado o cabo partido"
              },
              {
                  "ID": 3,
                  "TITULO": "Internet lenta",
                  "DESCRICAO": "Tem internet mas está lenta"
              },
              {
                  "ID": 4,
                  "TITULO": "Modem travado",
                  "DESCRICAO": "O modem está travado com todas as luzes acessas"
              },
              {
                  "ID": 5,
                  "TITULO": "Outros",
                  "DESCRICAO": "Informar outros motivos não listados acima"
              }
          ]
      }
  ```

- Use `[GET] /api/content/version` to get the current version of the last deploy.

  ```js
      {
          "version": "1.1.0",
          "date": "17/08/2018",
          "author": "Uilton Santos"
      }
  ```

- Use `[GET] /api/content/listProblems` to get all possible kind of problem, i.e: "Sem internet, Cabo partido, etc..."
  ```js
  {
    [
      {
        ID: 1,
        TITULO: "Sem internet",
        DESCRICAO: "Não consegue acessar a internet"
      },
      {
        ID: 2,
        TITULO: "Cabo partido",
        DESCRICAO: "Foi identificado o cabo partido"
      },
      {
        ID: 3,
        TITULO: "Internet lenta",
        DESCRICAO: "Tem internet mas está lenta"
      },
      {
        ID: 4,
        TITULO: "Modem travado",
        DESCRICAO: "O modem está travado com todas as luzes acessas"
      },
      {
        ID: 5,
        TITULO: "Outros",
        DESCRICAO: "Informar outros motivos não listados acima"
      }
    ];
  }
  ```

#### Provider

- Use `[GET] /api/getProviderByCustomerID` It's kind of Login. When the user pass the CPF/CNPJ, the server will return all information about the associated Provider and Customer data.
- Use `[GET] /api/listProviders` List all providers available on HelpNet database.
- Use `[PUT] /api/updateProvider` Updates Provider's data. Currently just update the LOGO.

#### OS (Oderm de Serviço)

- Use `[GET] /api/listSituationsOs`
- Use `[GET] /api/listOS`
- Use `[GET] /api/listOSBySituation`
- Use `[GET] /api/listOSByCustomer`

#### Utils

- Use `[GET] /api/loadBaseCustomerFromProvider` Synchronize the data from a specific providers.
- Use `[GET] /api/synchronizeCustomersWithProviders` Synchronize the data of the providers with the base of Helpnet, this same process will be scheduled to run in backlog, this API is for emergency situations
- Use `[GET] /api/listClients` List all customers saved.

#### Customer

- Use `[POST] /api/registerOS` Create a new OS. This API returns the OS number.
  ```js
      {
           "clienteId": 1,
            "problemId": 1,
            "details": "Example README",
            "providerId": 1
      }
  ```

#### Technician

- Use `[POST] /api/changeSituationOS`
- Use `[POST] /api/associateTechnical`
