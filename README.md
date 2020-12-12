# 文件上传下载工具

## 配置项

### .uedc.config.js


|字段名|类型|默认值|描述|
|---|---|---|---|
|host|string|ftp: 200.200.1.149<br/>sftp: <空>|`必填`服务器地址|
|port|number|ftp: 21<br/>sftp: 22|`必填`端口|
|user|string|ftp: uedc<br/>sftp: root|`必填`用户名|
|password|string|<空>|`必填`密码|
|root|string|ftp:<空><br/>sftp: /root/|`必填`服务器目标目录|
|files|string[]|<空>|`必填`上传的文件，支持`glob`格式|
