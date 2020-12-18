let ftp = require('ftp');
let FTPClient = require('../models/ftp');
let defaultMock = jest.fn();

jest.mock('ftp', () => {
    return jest.fn().mockImplementation(() => {
        return {
            connect: jest.fn(() => Promise),
            delete: jest.fn(file => {}),
            put: jest.fn((file, remoteFile, cb) => {cb & cb()}),
            get: jest.fn(file => {}),
            on: defaultMock,
            destroy: defaultMock,
            rmdir: jest.fn(file => {}),
            mkdir: jest.fn(file => {})
        }
    })
});

describe('测试ftp相关的功能函数', () => {
    test('连接测试', () => {
        let result = FTPClient.connect()

        expect(result).toEqual({
            
        })
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