const { createProxyMiddleware } = require('http-proxy-middleware');


module.exports = function (app) {
    // proxy第一个参数为要代理的路由
    // 第二参数中target为代理后的请求网址，changeOrigin是否改变请求头，其他参数请看官网
    app.use(createProxyMiddleware('/api/dc/shell/v1/*', {
        target: 'http://avengers-do01.ovopark.com/',
        changeOrigin: true,
    })),


    app.use(createProxyMiddleware('/api/dc/hawkeye/host/v1/*', {
        target: 'http://47.99.74.26:6888',
        changeOrigin: true,
    }))
}