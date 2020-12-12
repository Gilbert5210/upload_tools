/**
 * 处理静态文件（也可以去npm搜索能用于koa2的处理静态文件的包并直接使用）
 * 在生产环境下，静态文件是由部署在最前面的反向代理服务器（如Nginx）处理的，Node程序不需要处理静态文件。而在开发环境下，我们希望koa能顺带处理静态文件，* 否则，就必须手动配置一个反向代理服务器，这样会导致开发环境非常复杂。
 */

const path = require('path');
const mime = require('mime');

// mz提供的API和Node.js的fs模块完全相同，但fs模块使用回调，而mz封装了fs对应的函数，并改为Promise。这样，我们就可以非常简单的用await调用mz的函数，而不需要任何回调。
const fs = require('mz/fs');

// url: 类似 '/static/'
// dir: 类似 __dirname + '/static'
/**
 *
 * @param url URL前缀
 * @param dir 目录
 * @return {function(*, *)} async函数,判断当前的URL是否以指定前缀开头，如果是，就把URL的路径视为文件，并发送文件内容。如果不是，这个async函数就不做任何事情，而是简单地调用await next()让下一个middleware去处理请求。
 */
function staticFiles(url, dir) {
    return async (ctx, next) => {
        let rpath = ctx.request.path;
        // 判断是否以指定的url开头:
        if (rpath.startsWith(url)) {
            // 获取文件完整路径:
            let fp = path.join(dir, rpath.substring(url.length));
            // 判断文件是否存在:
            if (await fs.exists(fp)) {
                // 查找文件的mime:
                ctx.response.type = mime.getType(rpath);
                // 读取文件内容并赋值给response.body:
                ctx.response.body = await fs.readFile(fp);
            } else {
                // 文件不存在:
                ctx.response.status = 404;
            }
        } else {
            // 不是指定前缀的URL，继续处理下一个middleware:
            await next();
        }
    };
}

module.exports = staticFiles;