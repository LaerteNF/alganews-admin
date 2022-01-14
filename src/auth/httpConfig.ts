import axios from "axios";
import Service from "laerte_fernandes-sdk/dist/Service";
import AuthService from "./Authorization.service";

Service.setRequestInterceptors(async (request) => {
  const accessToken = AuthService.getAccessToken();

  // injeta o token de acesso na requisição
  if (accessToken && request.headers) {
    request.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return request;
});

Service.setResponseInterceptors(
  (response) => response,
  async (error) => {
    console.dir(error);
    //recupera informações da requisição
    const originalRequest = error.config;

    // caso o erro seja de autenticação e ainda não foi feito o retry
    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      //recupera o code verifier e o refresh token
      const storage = {
        codeVerifier: AuthService.getCodeVerifier(),
        refreshToken: AuthService.getRefreshToken(),
      };

      const { codeVerifier, refreshToken } = storage;

      // caso algum não exista, não é posspivel renovar o token
      if (!refreshToken || !codeVerifier) {
        AuthService.imperativelySendToLogout();
        return;
      }

      // renova o token
      const tokens = await AuthService.getNewToken({
        codeVerifier,
        refreshToken,
      });

      // armazena os tokens para novas requisições
      AuthService.setAccessToken(tokens.access_token);
      AuthService.setRefreshToken(tokens.refresh_token);

      // implementa o token na requisição
      originalRequest.headers[
        "Authorization"
      ] = `Bearer ${tokens.access_token}`;

      // retorna uma nova chamada do axios com essa requisição
      return axios(originalRequest);
    }

    throw error;
  }
);
