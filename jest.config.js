module.exports = {
    rootDir: './test/', // 测试目录

    // 对jsx、tsx、js、ts文件采用babel-jest进行转换
    transform: {
        '^.+\\.[t|j]sx?$': 'babel-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]s?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverage: true, // 统计覆盖率

    testEnvironment: 'jsdom', // 测试环境，默认为”jsdom“

    collectCoverageFrom: ['**/*.ts'],

    coverageDirectory: './coverage', // 测试覆盖率的文档

    globals: { 
        window: {}, // 设置全局对象window
    },
    setupFiles: [], 
    // 测试前执行的文件，主要可以补齐模拟一些在node环境下的方法但又window下需要使用
};