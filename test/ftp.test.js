jest.mock('ftp');

let FTPClient = require('../src/models/ftp');
let ftp = require('ftp');
let {isValidObjectKey} = require('../src/util/util');

const ERROR = -1;
const SUCCESS = 200;
const defaultMock = jest.fn(() => {});
let options = {
    host: 'localhost',
    port: 21,
    user: 'test',
    password: 'test',
    root: '/zjy',
}

let errOptions = {
    host: 'localhost',
    port: 21,
    user: '',
    password: '',
    root: '/zjy',
}

let remoteFile = '/zjy'

ftp.mockImplementation(() => {
    return {
        connect: defaultMock,
        delete: jest.fn((file, cb) => {
            if (!file) {
                cb?.({code: ERROR});
            }
        }),
        list: jest.fn((dir, bool, cb) => {
            let list = [];

            if (dir) {
                cb?.('', list);
            } else {
                cb?.({code: ERROR}, list);
            }
        }),
        put: jest.fn((file, remoteFile, cb) => {

            if (file) {
                cb?.()
            } else {
                cb?.({code: ERROR})
            }
        }),
        get: jest.fn(file => {}),

        cwd: jest.fn((file, cb) => {
            if (file) {
                cb?.({code: ERROR}, file)
            } else {
                cb?.('', file)
            }
        }),
        on: jest.fn((status, cb) => {
            if (status === 'ready') {
                cb?.({code: SUCCESS});
            } else if (status === 'error') {
                cb?.({code: ERROR});
            }
        }),
        rmdir: jest.fn(file => {}),
        mkdir: jest.fn(file => {})
    }
})

beforeEach(() => {

    // 测试之前 清除调用模拟构造函数和方法的记录
    ftp.mockClear();
});

describe('测试ftp相关的功能函数', () => {

    test('连接成功测试', async () => {
        let ftpClient = new FTPClient();
        let result = await ftpClient.connect();

        expect(defaultMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(true);
    }),

    test('连接失败测试--连接参数异常', () => {

        let res = () => isValidObjectKey(errOptions);
        expect(res).toThrow('isValidObjectKey error');
    }),

    test('连接失败测试--服务端网络异常', async () => {

    }),

    test('文件上传测试', async () => {
        let ftpClient = new FTPClient(options);

        let res = await ftpClient.startUpload('./config.app.js', remoteFile, false);
        expect(res).toBe('./config.app.js');
    }),

    test('文件列表获取测试', async () => {
        let ftpClient = new FTPClient();
        let res = await ftpClient.getFileList();

        expect(res).toBeInstanceOf(Array);
    })

    test('切换目录--切换成功', async () => {
        let ftpClient = new FTPClient();
        let res = await ftpClient.switchDirectory();
        expect(res.code).toBe(SUCCESS);
    })
})