# 文件上传下载工具

## 配置项(默认配置必须填写)

### ftp.config.js


|字段名|类型|默认值|描述|
|---|---|---|---|
|host|string|ftp: localhost<br/>sftp: <空>|`必填`服务器地址|
|port|number|ftp: 21<br/>sftp: 22|`必填`端口|
|user|string|ftp: test<br/>sftp: test|`必填`用户名|
|password|string|<空>|`必填`密码|
|root|string|ftp:<空><br/>sftp: /root/|服务器目标目录|
|files|string[]|<空>|上传的文件，支持`glob`格式|


## 使用方式

```JS
npm install		// 安装依赖
npm link		// 注册 zjy 作为指定命令
zjy connect		// 命令行交付方式使用
yarn test		// 执行单元测试
```


## Examples

1. ftp连接测试

   ```.
   let FtpClient  = require('src/models/ftp');
   let ftpClient = new FtpClient();
   let result = await ftpClient.connect();
   
   ftpClient.logout();
   ```

   

2. sftp 连接测试

   ```js
   let SftpClient  = require('src/models/sftp');
   let sFtpClient = new SftpClient();
   let result = await sFtpClient.connect();
   
   sFtpClient.logout();
   ```




## api文档

### ftp
- ftp.connect()  ==> Boolean    
功能：ftp 服务的连接，成功连接返回true,失败返回 false
使用方法： 使用之前实例ftp先，然后通过ftp.connect()进行调用

- getFileList(path) ==> Array[object]

  dirPath:  {String}  服务端路径，只接收一个文件夹路径

  功能： 用来查询服务端文件夹列表，返回所有的文件

- startUpload (filePath, targetFilePath, hasDirectoryFlag)  ==> String || error

  **hasDirectoryFlag:** 是否存在文件夹的

  功能： 如果当前存在文件夹的话，把文件都原样的上传到服务端指定的 targetFilePath 地址， 如果不存在文件夹的话，只需要把当前的文件一个个上传到指定目录，不需要按照当前 filePath的路径来创建文件夹。

