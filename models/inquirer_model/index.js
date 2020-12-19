const inquirer = require('inquirer');

const connectPromptList = [
    {
        type: 'list',
        message: '请选择连接类型:',
        name: 'connectType',
        choices: [
            "ftp",
            "sftp"
        ]
    },
    {
        type: 'input',
        name: 'host',
        message: '请输入host地址',
        validate: function (input){
            if(!input) {
                return 'host地址不能为空'
            }
            return true
        }
    },
    {
        type: 'input',
        name: 'port',
        message: '请输入端口号（默认使用21）',
        default: 21,
        validate: function (input){
            if(!input) {
                return '端口不能为空'
            }
            return true
        }
    },
    {
        type: 'input',
        name: 'user',
        message: '请输入用户名',
        validate: function (input){
            if(!input) {
                return '用户名不能为空'
            }
            return true
        }
    },
    {
        type: 'password',
        name: 'password',
        message: '请输入密码',
        validate: function (input){
            if(!input) {
                return '密码不能为空'
            }
            return true
        }
    }
];

async function askAction(promptList) {
    let answers  = await inquirer.prompt(promptList)
    console.log('你输入的内容是：', answers);
    return answers;
}

module.exports = {
    askAction,
    connectPromptList
}