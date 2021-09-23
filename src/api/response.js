import { message } from 'antd';
/**
 * 请求返回数据处理
 */
export const responseHandler = (res) => {
  const originData = res.data || {};
  if (originData.data === 'token失效') {
    message.error('token失效，请重新登录');
    setTimeout(() => {
      window.location.href = '/'; // token失效重新登录
    }, 1000)
  } else {
    if (
      originData.hasOwnProperty("result") &&
      originData.hasOwnProperty("code")
    ) {
      // 格式1：{ result: ok, code: 0, data: <any> }
      return new Promise((resolve, reject) => {
        if (originData.code === 0 || originData.code === '0') {
          resolve(originData);
        } else {
          reject(originData);
        }
      });
    }
  }
};
