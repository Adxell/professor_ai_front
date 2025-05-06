import { boot } from "quasar/wrappers";
import axios from "axios";
import { Loading, LocalStorage, QSpinnerGears } from "quasar";
// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const axiosConfig = {
  baseURL: "http://localhost:8000/api/v1/",
};
const api = axios.create(axiosConfig);
const token = LocalStorage.getItem("token")
api.interceptors.request.use(
  async (config) => {
    config.headers = {
      'Authorization': `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    Loading.show({
      delay: 500,
      spinner: QSpinnerGears,
      spinnerColor: "light-green-13",
      message: "Espere por favor...",
      messageColor: "black",
    });
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    Loading.hide();
    return response;
  },
  (error) => {
    if (error.code) {
      console.log(error.code)
    } else {
      Loading.hide();
    }

    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
  app.provide("axios", app.config.globalProperties.$axios);
});

export { axios, api };
