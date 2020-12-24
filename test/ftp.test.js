let FTPClient = require('../models/ftp');
let ftp = require('ftp');
const ERROR = 0;
const defaultMock = jest.fn(() => {});

jest.mock('ftp', () => {
    return jest.fn().mockImplementation(() => {
        return {
            connect: jest.fn(() => {}),
            delete: jest.fn((file, cb) => {
                if (!file) {
                    cb?.({code: ERROR});
                }
            }),
            put: jest.fn((file, remoteFile, cb) => {cb & cb()}),
            get: jest.fn(file => {}),
            on: jest.fn((status, cb) => {
                if (status) {
                    cb?.();
                }
            }),
            rmdir: jest.fn(file => {}),
            mkdir: jest.fn(file => {})
        }
    })
});

beforeEach(() => {

    // 测试之前 清除调用模拟构造函数和方法的记录
    ftp.mockClear();
});

describe('测试ftp相关的功能函数', () => {
    it('连接测试', async () => {
        let ftpClient = new FTPClient();
        ftpClient.connect();

        expect(defaultMock).toBeCalled();
    }),

    test('文件列表获取测试', () => {
        
    }),

    test('文件下载测试', () => {
        
    }),

    test('文件上传测试', () => {
        
    }),

    test('目录创建测试', () => {
        
    }),

    test('测试链接', () => {
        
    })
})