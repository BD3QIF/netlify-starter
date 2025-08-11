// const http = require('http');
// const Waline = require('@waline/vercel');
// const serverless = require('serverless-http');

// const app = Waline({
//   env: 'netlify',
//   async postSave(comment) {
//     // do what ever you want after save comment
//   },
// });

// module.exports.handler = serverless(http.createServer(app));


// hello.mjs
import Waline from '@waline/vercel';

const app = Waline({
  env: 'netlify',
  async postSave(comment) {
    // do what ever you want after save comment
  },
});

export default async function(request, context) {
  // 这里需要将 Netlify 的 Request 转换为 Node.js 的 req/res，具体取决于 Waline 的实现
  // 如果 Waline 支持 web 标准的 Request/Response，可以直接调用
  // 否则需要用中间件适配（知识库未提供 Waline 适配细节）

  // 伪代码，具体实现需参考 Waline 文档
  return app(request, context);
}
