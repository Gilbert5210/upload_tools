jest.mock('ssh2-sftp-client');

let SFTPClient = require('../src/models/sftp');
let sftp = require('ssh2-sftp-client');

const ERROR = -1;
const SUCCESS = 200;
const defaultMock = jest.fn(() => {
    return Promise.resolve({
        code: SUCCESS
    });
});
const options = {
    host: 'localhost',
    port: 21,
    user: 'test',
    password: 'test',
    root: '/zjy',
}

let currentFile = './package.json';
let remoteFile = '/zjy'

sftp.mockImplementation(() => {
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
                cb?.('');
            } else {
                cb?.({code: ERROR})
            }
        }),
        get: jest.fn(file => {}),
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
    sftp.mockClear();
});

describe('测试Sftp相关的功能函数', () => {

    test('连接成功验证测试', async () => {
        let client = new SFTPClient();
        let result = await client.connect();

        expect(defaultMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(true);
    }),

    // test('连接失败验证测试', async () => {
    //     let SFTPClient = new SFTPClient(options);
    //     await SFTPClient.connect();

    //     expect(defaultMock).toBe(false);
    // }),

    test('文件上传测试--上传成功', async () => {
        let client = new SFTPClient(options);

        let res = await client.startUpload(currentFile, remoteFile, false);
        expect(res.code).toBe(SUCCESS);
    }),
    
    test('文件列表获取测试', async () => {
        let client = new SFTPClient();
        let res = await client.getFileList();

        expect(res).toBeInstanceOf(Array);
    })
})