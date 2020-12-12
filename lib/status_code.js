/**
 * 常量
 */

const API_PREFIX = '/visual/app/';

const DEFAULT_SCREEN_CONFIG = {
    screenConfig: {
        initApi: '',
        initTarget: [], // 初始化关联组件
        enableAutoRefresh: true,
        refreshInterVal: 5 * 60 * 1000, // 默认5分钟
        width: 1920,
        height: 1080,
        background: '#01336c',
        scaleType: 'fullScreen', // 缩放方式
        backgroundImg: {
            url: '',
            id: ''
        },
        thumbImg: {
            url: '',
            id: ''
        }
    },
    widgetsConfig: []
};

const RESOURCE_BASE_PATH = API_PREFIX + 'resource';

module.exports = {
    API_PREFIX,
    RESOURCE_BASE_PATH,
    DEFAULT_SCREEN_CONFIG
}
