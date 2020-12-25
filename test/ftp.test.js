jest.mock('ftp');

let FTPClient = require('../src/models/ftp');
let ftp = require('ftp');

const ERROR = 0;
const SUCCES = 1;
const defaultMock = jest.fn(() => {});
const options = {
    host: 'localhost',
    port: 21,
    user: 'test',
    password: 'test',
    root: '/zjy',
}

let currentFile = './package.json';
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
        put: jest.fn((file, remoteFile, cb) => {cb?.(file)}),
        get: jest.fn(file => {}),
        on: jest.fn((status, cb) => {
            if (status === 'ready') {
                cb?.({code: SUCCES});
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

    test('连接成功验证测试', async () => {
        let ftpClient = new FTPClient();
        let result = await ftpClient.connect();

        expect(defaultMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(true);
    }),

    // test('连接失败验证测试', async () => {
    //     let ftpClient = new FTPClient(options);
    //     await ftpClient.connect();

    //     expect(defaultMock).toBe(false);
    // }),

    test('文件上传测试', async () => {
        let ftpClient = new FTPClient(options);

        let res = await ftpClient.startUpload(currentFile, remoteFile, false);
        expect(res).toBe(currentFile);
    }),

    test('文件列表获取测试', async () => {
        let ftpClient = new FTPClient();
        let res = await ftpClient.getFileList();

        expect(res).toBeInstanceOf(Array);
    })
})