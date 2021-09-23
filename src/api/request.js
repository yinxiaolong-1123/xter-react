import axios from "axios";
import qs from "qs";
import { responseHandler } from "./response";
import { path } from '../api/config';

axios.defaults.timeout = 1 * 10000;

/**
 * 请求头参数规则 token + client + version + language + timezone
 */
// function getAuthenticator() {
//   return `${ccutils.getToken()} ${requestHeaderParams.CLIENT_FLAG} ${
//     requestHeaderParams.version
//   } ${ccutils.getHeaderLanguage()} ${requestHeaderParams.TIMEZONE_FLAG}`;
// }
function getAuthenticator() {
  return localStorage.getItem('shell_token');
}



/**
 * 普通get请求
 */
export const get = async function(url, params = {}) {
  let res = await axios.get(url, {
    params,
    headers: {
      authenticator: getAuthenticator(),
    },
  });
  return responseHandler(res);
};

/**
 * 普通post请求
 */
export const post = async function(url, params = {}) {
  let res = await axios.post(url, qs.stringify(params), {
    headers: {
      authenticator: getAuthenticator()
    },
  });
  return responseHandler(res);
};


/**
 * 普通post请求 -- token
 */
export const postPass = async function (url, params = {}) {
  console.log(JSON.parse(localStorage.getItem('userInfo')).tokenValue)
  let res = await axios.post(url, qs.stringify(params), {
    headers: {
      authenticator: JSON.parse(localStorage.getItem('userInfo')).tokenValue
    },
  });
  return responseHandler(res);
};

/**
 * json格式的Post请求
 */
export const postJson = async function(url, params = {}) {
  let res = await axios.post(url, params, {
    headers: {
      "Content-Type": "application/json",
      authenticator: getAuthenticator(),
    },
  });
  return responseHandler(res);
};

/**
 * postBody请求
 * @param url
 * @param params
 * @returns {*}
 */
export const postRaw = async function(url, params = {}, bodyParams = []) {
  let res = await axios.post(url + "?" + qs.stringify(params), bodyParams, {
    headers: {
      authenticator: getAuthenticator(),
    },
  });
  return responseHandler(res);
};

export const postFile = async function(url, formdata) {
  let res = await axios({
    url: path + url,
    method: "post",
    data: formdata,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      authenticator: getAuthenticator(),
    },
    // responseType: 'blob',
    withCredentials: false,
  });
  return res.data;
};

export const postFile2 = async function(url, formdata) {
  let res = await axios({
    url: path + url,
    method: "post",
    data: formdata,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      authenticator: getAuthenticator(),
    },
    responseType: 'blob',
  });
  return res.data;
};
